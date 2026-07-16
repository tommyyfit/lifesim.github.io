#!/usr/bin/env node
'use strict';

const fs=require('fs');
const path=require('path');
const {spawnSync}=require('child_process');
const vm=require('vm');

const ROOT=__dirname;
const failures=[];
const notes=[];
const read=file=>fs.readFileSync(path.join(ROOT,file),'utf8');
const fail=message=>failures.push(message);

const html=read('index.html');
const manifest=JSON.parse(read('build-manifest.json'));
const pageBuild=html.match(/\bdata-build="([^"]+)"/)?.[1]||'';
const funFirstBuild=read('js/lifesim-fun-first.js').match(/\bBUILD:'([^']+)'/)?.[1]||'';
const bootstrapBuild=read('js/bootstrap.js').match(/\bbuild:'([^']+)'/)?.[1]||'';
if(!pageBuild||pageBuild!==manifest.build||funFirstBuild!==manifest.build||bootstrapBuild!==manifest.build)fail('Build identifiers disagree between the page, manifest, bootstrap and Fun First runtime.');
const loadedStyles=[...html.matchAll(/<link\s+[^>]*href="([^"]+\.css)"[^>]*>/g)].map(match=>match[1]);
const loadedScripts=[...html.matchAll(/<script\s+[^>]*src="([^"]+)"[^>]*><\/script>/g)].map(match=>match[1]);
if(JSON.stringify(loadedStyles)!==JSON.stringify(manifest.styles))fail('Stylesheet load order does not match build-manifest.json.');
if(JSON.stringify(loadedScripts)!==JSON.stringify(manifest.scripts))fail('Script load order does not match build-manifest.json.');
if(manifest.build!=='24.2.1-fun-first')fail('Build manifest has an unexpected build identifier.');
if(loadedScripts[0]!=='js/bootstrap.js')fail('The startup guard must be the first loaded script.');
const localRefs=[...html.matchAll(/(?:src|href)="([^"]+)"/g)]
  .map(match=>match[1])
  .filter(ref=>!ref.startsWith('data:')&&!ref.startsWith('#')&&!/^https?:/i.test(ref));

for(const ref of localRefs){
  if(!fs.existsSync(path.join(ROOT,ref)))fail(`Missing local reference: ${ref}`);
}

for(const [ref,count] of Object.entries(localRefs.reduce((all,ref)=>{
  all[ref]=(all[ref]||0)+1;
  return all;
},{}))){
  if(count>1)fail(`Duplicate local reference: ${ref} (${count} times)`);
}

const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
for(const [id,count] of Object.entries(ids.reduce((all,id)=>{
  all[id]=(all[id]||0)+1;
  return all;
},{}))){
  if(count>1)fail(`Duplicate HTML id: ${id} (${count} times)`);
}

const requiredIds=['app','splash-screen','create-screen','game-screen','death-screen','game-content','settings-modal','ev-modal'];
for(const id of requiredIds){
  if(!ids.includes(id))fail(`Required HTML mount is missing: #${id}`);
}

if(!html.includes('css/lifesim-fun-first.css'))fail('Fun First stylesheet is not loaded.');
if(!html.includes('js/lifesim-fun-first.js'))fail('Fun First runtime is not loaded.');
if(/(?:css|js)\/classic-fun\.(?:css|js)/.test(html))fail('Obsolete Classic Fun entrypoint is still loaded.');
if(html.indexOf('js/lifesim-fun-first.js')<html.indexOf('js/lifesim-v24.js'))fail('Fun First must load after the v24 compatibility layer.');

const decodeAttribute=value=>value
  .replace(/&quot;/g,'"')
  .replace(/&#39;|&apos;/g,"'")
  .replace(/&lt;/g,'<')
  .replace(/&gt;/g,'>')
  .replace(/&amp;/g,'&');
const handlers=[...html.matchAll(/\bon[a-z]+="([^"]*)"/gi)].map(match=>decodeAttribute(match[1]));
handlers.forEach((source,index)=>{
  try{new Function('event',source);}
  catch(error){fail(`Inline handler ${index+1} does not compile: ${error.message}`);}
});

const walk=dir=>fs.readdirSync(path.join(ROOT,dir),{withFileTypes:true}).flatMap(entry=>{
  const rel=path.join(dir,entry.name);
  return entry.isDirectory()?walk(rel):[rel];
});

const jsFiles=walk('js').filter(file=>file.endsWith('.js'))
  .concat(walk('data').filter(file=>file.endsWith('.js')));
for(const file of jsFiles){
  const result=spawnSync(process.execPath,['--check',path.join(ROOT,file)],{encoding:'utf8'});
  if(result.status!==0)fail(`JavaScript syntax failed: ${file}\n${(result.stderr||result.stdout||'').trim()}`);
}

const cssFiles=walk('css').filter(file=>file.endsWith('.css'));
for(const file of cssFiles){
  const source=read(file).replace(/\/\*[\s\S]*?\*\//g,'');
  let depth=0;
  for(const char of source){
    if(char==='{')depth+=1;
    if(char==='}')depth-=1;
    if(depth<0){fail(`CSS has an unexpected closing brace: ${file}`);break;}
  }
  if(depth!==0)fail(`CSS braces are unbalanced: ${file} (balance ${depth})`);
}

const evaluateConst=(file,name)=>{
  const context={Math,Date,console};
  vm.runInNewContext(`${read(file)}\n;globalThis.__qaValue=${name};`,context,{filename:file});
  return context.__qaValue;
};
const assertUnique=(items,key,label)=>{
  const seen=new Set();
  items.forEach((item,index)=>{
    const value=item?.[key];
    if(!value)fail(`${label} ${index+1} has no ${key}.`);
    else if(seen.has(value))fail(`Duplicate ${label.toLowerCase()} ${key}: ${value}`);
    else seen.add(value);
  });
};

try{
  const careers=evaluateConst('data/careers.js','CAREERS');
  assertUnique(careers,'id','Career');
  careers.forEach(career=>{
    if(!career.title||!career.cat)fail(`Career ${career.id||'(unknown)'} is missing its title or category.`);
    if(!Number.isFinite(career.salary)||career.salary<0)fail(`Career ${career.id||'(unknown)'} has an invalid salary.`);
    if(!Number.isFinite(career.minAge)||career.minAge<18)fail(`Career ${career.id||'(unknown)'} has an invalid minimum age.`);
    if(!['none','vocational','university'].includes(career.req))fail(`Career ${career.id||'(unknown)'} has an unknown education requirement.`);
    Object.entries(career.skillReq||{}).forEach(([skill,level])=>{
      if(!skill||!Number.isFinite(level)||level<1||level>5)fail(`Career ${career.id||'(unknown)'} has an invalid skill requirement.`);
    });
  });

  const achievements=evaluateConst('data/achievements.js','ACHIEVEMENTS');
  assertUnique(achievements,'id','Achievement');
  const emptyLife={achievements:{},assets:{properties:[],vehicles:[]},rels:{children:[],siblings:[],friends:[],exes:[]},skills:{},goals:[],countriesVisited:[],pets:[],crimes:[],conditions:[],chapters:[]};
  achievements.forEach(achievement=>{
    if(!achievement.name||!achievement.desc||typeof achievement.check!=='function')fail(`Achievement ${achievement.id||'(unknown)'} is incomplete.`);
    else try{achievement.check(emptyLife);}catch(error){fail(`Achievement ${achievement.id} fails on a valid empty life: ${error.message}`);}
  });

  const eventGroups=evaluateConst('data/events.js','EVENTS');
  const events=Object.values(eventGroups).flat();
  events.forEach((event,index)=>{
    if(!event?.title||!event?.text)fail(`Event ${index+1} has no title or description.`);
    if(!Array.isArray(event?.choices)||event.choices.length<1)fail(`Event ${event?.title||index+1} has no choices.`);
    if(event?.choices?.length>3)fail(`Event ${event.title} has more than three choices.`);
    event?.choices?.forEach((choice,choiceIndex)=>{
      if(!choice?.t&&!choice?.label)fail(`Event ${event.title} choice ${choiceIndex+1} has no label.`);
      if(typeof choice?.fn!=='function'&&(!choice?.e||typeof choice.e!=='object'))fail(`Event ${event.title} choice ${choiceIndex+1} has no effect.`);
      Object.entries(choice?.e||{}).forEach(([stat,value])=>{
        if(typeof value!=='number'||!Number.isFinite(value))fail(`Event ${event.title} choice ${choiceIndex+1} has an invalid ${stat} effect.`);
      });
    });
  });
  notes.push(`${careers.length} careers, ${achievements.length} achievements and ${events.length} events validated`);
}catch(error){
  fail(`Content validation could not run: ${error.message}`);
}

try{
  const save=evaluateConst('js/save.js','Save');
  const repaired=save._normalizeSave({
    name:'  Test Life  ',age:'not-a-number',year:-4,alive:true,
    happiness:900,health:-20,smarts:null,looks:Infinity,fitness:50,stress:NaN,
    money:'1250',karma:-900,log:[null,{text:'Valid',age:0}],statHistory:[null,{}],
    rels:{siblings:null,children:[null,{name:'Child'}],friends:'bad'},
    assets:{properties:null,vehicles:[null,{id:'car'}]},pets:'bad',conditions:null,crimes:null
  });
  if(!repaired)fail('Save normalization rejected a repairable life.');
  else{
    if(repaired.name!=='Test Life'||repaired.age!==0||repaired.year!==0)fail('Save normalization did not repair identity or age fields.');
    if(repaired.happiness!==100||repaired.health!==0||repaired.karma!==-100)fail('Save normalization did not clamp core stats.');
    if(repaired.money!==1250||repaired.log.length!==1||repaired.rels.children.length!==1||repaired.assets.vehicles.length!==1)fail('Save normalization did not repair collections and money.');
  }
  if(save._normalizeSave({age:2})!==null)fail('Save normalization accepted a life without a name.');
  notes.push('save corruption recovery contract passed');
}catch(error){
  fail(`Save recovery validation could not run: ${error.message}`);
}

notes.push(`${localRefs.length} local references resolved`);
notes.push(`build manifest matches ${loadedStyles.length} styles and ${loadedScripts.length} scripts in exact order`);
notes.push(`${ids.length} unique HTML ids checked`);
notes.push(`${handlers.length} inline handlers compiled`);
notes.push(`${jsFiles.length} JavaScript files passed syntax checks`);
notes.push(`${cssFiles.length} stylesheets passed structural checks`);

if(failures.length){
  console.error(`LifeSim QA failed with ${failures.length} issue${failures.length===1?'':'s'}:`);
  failures.forEach(message=>console.error(`- ${message}`));
  process.exitCode=1;
}else{
  console.log('LifeSim QA passed.');
  notes.forEach(message=>console.log(`- ${message}`));
}
