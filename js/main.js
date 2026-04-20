/* js/main.js — LifeSim v9 */
'use strict';
window.G=null;

const App={
  init(){
    Create.fillCountries();
    Create.setGender('male');
    Create.renderTraits();
    Create.renderAmbitions();
    Create.renderChallenges();
    Create.rollPerk(false);
    document.getElementById('inp-diff').addEventListener('change',e=>{
      document.getElementById('custom-stats').style.display=e.target.value==='custom'?'block':'none';
      Create.updatePreview();
    });
    document.getElementById('inp-country').addEventListener('change',()=>Create.updatePreview());
    this.updateContinueButton();
    // Keyboard shortcuts
    document.addEventListener('keydown',e=>{
      const target=e.target;
      const typing=target?.matches?.('input,textarea,select,[contenteditable="true"]')||target?.closest?.('[contenteditable="true"]');
      if(typing)return;
      const modal=document.getElementById('ev-modal');
      if(e.key==='Enter'&&modal?.classList.contains('open')){
        e.preventDefault();
        const focused=modal.querySelector('button:focus');
        (focused||modal.querySelector('.choice-btn')||modal.querySelector('button'))?.click();
        return;
      }
      if((e.code==='Space'||e.key==='Enter')&&document.getElementById('game-screen').classList.contains('active')){
        const btn=document.getElementById('age-btn-side')||document.getElementById('age-btn');
        if(btn?.disabled)return;
        e.preventDefault();Engine.ageUp();
      }
    });
  },

  show(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    const sc=document.getElementById(id);if(sc)sc.classList.add('active');
  },

  newLife(){this.show('create-screen');Create.reset();},

  updateContinueButton(){
    const btn=document.getElementById('btn-continue');
    if(btn)btn.disabled=!Save.has();
  },

  exportSave(){
    const data=Save.exportData();
    const empty=!data.save&&!(data.hallOfFame||[]).length&&!(data.achievements||[]).length;
    if(empty){UI.toast('No save data to export.');return;}
    try{
      const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
      const a=document.createElement('a');
      const who=data.save?.name?`${data.save.name}-${data.save.surname||'life'}`:'lifesim';
      const url=URL.createObjectURL(blob);
      a.href=url;
      a.download=`${who.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-v9-save.json`;
      document.body.appendChild(a);
      a.click();
      setTimeout(()=>URL.revokeObjectURL(url),0);
      a.remove();
      UI.toast('Save exported.','good');
    }catch(e){
      UI.toast('Export failed in this browser.','bad');
    }
  },

  importSaveClick(){
    document.getElementById('save-import')?.click();
  },

  importSaveFile(input){
    const file=input?.files?.[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const data=JSON.parse(String(reader.result||'{}'));
        if(!Save.importData(data)){UI.toast('That file is not a LifeSim save.','bad');return;}
        this.updateContinueButton();
        UI.toast('Save imported. You can continue it now.','good');
      }catch(e){
        UI.toast('Import failed. Check the JSON file.','bad');
      }finally{
        if(input)input.value='';
      }
    };
    reader.onerror=()=>{UI.toast('Could not read that file.','bad');if(input)input.value='';};
    reader.readAsText(file);
  },

  wipeData(){
    UI.showEvent({
      icon:'🗑️',
      type:'bad',
      title:'Wipe Saved Data?',
      text:'This removes the current life, Hall of Fame, achievements, and old v8 data from this browser.',
      choices:[
        {t:'Cancel'},
        {t:'Wipe all data',wipe:true},
      ],
    },choice=>{
      if(!choice?.wipe)return;
      Save.wipeAll();
      window.G=null;
      this.updateContinueButton();
      this.show('splash-screen');
      UI.toast('All LifeSim data wiped.','good');
    });
  },

  loadGame(){
    const saved=Save.load();
    if(!saved){UI.toast('No saved life found!','bad');return;}
    // Migrate missing fields
    saved.stress=saved.stress||0; saved.karma=saved.karma||0; saved.fitness=saved.fitness||50;
    saved.fame=saved.fame||0; saved.pets=saved.pets||[]; saved.completedGoals=saved.completedGoals||[];
    saved.skills=saved.skills||{}; saved.skillPoints=saved.skillPoints||0;
    saved.stocks=saved.stocks||{portfolio:{},prices:null,history:{}};
    saved.achievements=saved.achievements||{}; saved.conditions=saved.conditions||[];
    saved.crimes=saved.crimes||[]; saved.addictions=saved.addictions||{}; saved.insurance=saved.insurance||{};
    saved.name=saved.name||pick(MNAMES); saved.surname=saved.surname||pick(SURNAMES);
    saved.gender=saved.gender||'male'; saved.country=saved.country||COUNTRIES[0];
    saved.age=Number.isFinite(saved.age)?saved.age:0; saved.alive=saved.alive!==false;
    saved.money=Number.isFinite(saved.money)?saved.money:0;
    saved.happiness=Number.isFinite(saved.happiness)?saved.happiness:50;
    saved.health=Number.isFinite(saved.health)?saved.health:50;
    saved.smarts=Number.isFinite(saved.smarts)?saved.smarts:50;
    saved.looks=Number.isFinite(saved.looks)?saved.looks:50;
    saved.rels=saved.rels||{};
    saved.rels.father=saved.rels.father||null; saved.rels.mother=saved.rels.mother||null;
    if(!saved.rels.friends)saved.rels.friends=[]; if(!saved.rels.siblings)saved.rels.siblings=[];
    if(!saved.rels.children)saved.rels.children=[]; if(!('partner' in saved.rels))saved.rels.partner=null;
    if(!saved.assets)saved.assets={properties:[],vehicles:[]};
    if(!saved.assets.properties)saved.assets.properties=[]; if(!saved.assets.vehicles)saved.assets.vehicles=[];
    saved.sexualHealth=saved.sexualHealth||{std:false};
    saved.sexualHealth.safeDating=saved.sexualHealth.safeDating||0;
    saved.familyPlanning=saved.familyPlanning||{};
    saved.familyPlanning.pregnant=!!saved.familyPlanning.pregnant;
    saved.familyPlanning.dueAge=Number.isFinite(saved.familyPlanning.dueAge)?saved.familyPlanning.dueAge:null;
    saved.familyPlanning.lastBabyAge=Number.isFinite(saved.familyPlanning.lastBabyAge)?saved.familyPlanning.lastBabyAge:-99;
    saved.familyPlanning.lastAttemptAge=Number.isFinite(saved.familyPlanning.lastAttemptAge)?saved.familyPlanning.lastAttemptAge:-99;
    saved.familyPlanning.partnerName=saved.familyPlanning.partnerName||'';
    saved.familyPlanning.kind=saved.familyPlanning.kind||'';
    saved.countriesVisited=saved.countriesVisited||[];
    saved.lifetimeGambled=saved.lifetimeGambled||0; saved.lifetimeDonated=saved.lifetimeDonated||0;
    saved.inheritanceReceived=saved.inheritanceReceived||0; saved.happyStreak=saved.happyStreak||0;
    saved.lowStressStreak=saved.lowStressStreak||0; saved.log=saved.log||[];
    if(typeof LifeProgress!=='undefined')LifeProgress.init(saved);
    window.G=saved;
    this.show('game-screen'); UI.tab('life'); UI.update();
    UI.toast(`Welcome back, ${G.name}! Age ${G.age}.`,'good');
  },

  startGame(){
    const name=(document.getElementById('inp-name').value.trim())||pick(Create.gender==='female'?FNAMES:MNAMES);
    const cIdx=parseInt(document.getElementById('inp-country').value)||0;
    const diff=document.getElementById('inp-diff').value;
    const country=COUNTRIES[cIdx]||COUNTRIES[0];
    const trait=Create.selectedTrait||'resilient';
    const ambition=Create.selectedAmbition||'wealth';
    const challengeId=document.getElementById('inp-challenge')?.value||'none';
    const challenge=(typeof CHALLENGE_MODES!=='undefined'?(CHALLENGE_MODES.find(c=>c.id===challengeId)||CHALLENGE_MODES[0]):null);
    const perk=Create.selectedPerk||(typeof STARTING_PERKS!=='undefined'?pick(STARTING_PERKS):null);

    window.G={
      name, surname:pick(SURNAMES), gender:Create.gender, country,
      difficulty:diff, trait, ambition, ambitionAchieved:false,
      challenge:challenge?.id||'none', challengeName:challenge?.name||'Free Life', challengeScore:challenge?.scoreBonus||0,
      startingPerk:perk?.id||null, startingPerkName:perk?.name||'None',
      age:0, alive:true, causeOfDeath:'',
      happiness:0, health:0, smarts:0, looks:0, fitness:50, fame:0,
      stress:0, karma:0, money:0,
      retired:false, retirementPension:0,
      education:'none', inSchool:false, inUniversity:false, univYear:0, univType:null,
      career:null, yearsAtJob:0, careerCompany:'', jobPerf:50, promotionCount:0,
      rels:{father:null,mother:null,siblings:[],partner:null,children:[],friends:[]},
      assets:{properties:[],vehicles:[]},
      sexualHealth:{std:false,safeDating:0},
      familyPlanning:{pregnant:false,dueAge:null,lastBabyAge:-99,lastAttemptAge:-99,partnerName:'',kind:''},
      business:null, followers:0, socialEarnings:0,
      conditions:[], crimes:[], inPrison:false, prisonYears:0,
      addictions:{}, insurance:{},
      pets:[], completedGoals:[], achievements:{},
      skills:{}, skillPoints:0, stocks:{portfolio:{},prices:null,history:{}},
      countriesVisited:[], lifetimeGambled:0, lifetimeDonated:0,
      inheritanceReceived:0, happyStreak:0, lowStressStreak:0,
      timeline:[], yearlyRecaps:[], lifeRecords:{bestYear:null,worstYear:null}, milestoneFlags:{},
      log:[],
    };
    const G=window.G;

    // Difficulty stats
    const sets={
      easy:   [r(70,95),r(70,95),r(55,80),r(55,80),r(55,80),80000],
      normal: [r(40,75),r(40,75),r(20,65),r(20,65),r(30,60),0],
      hard:   [r(20,50),r(20,50),r(10,40),r(10,40),r(15,40),0],
      extreme:[r(8,32), r(8,32), r(5,28), r(5,28), r(10,30),0],
      custom: [
        parseInt(document.getElementById('cs-hap')?.value)||50,
        parseInt(document.getElementById('cs-hlt')?.value)||50,
        parseInt(document.getElementById('cs-smt')?.value)||50,
        parseInt(document.getElementById('cs-lks')?.value)||50,
        50, 0
      ],
    };
    const s=sets[diff]||sets.normal;
    [G.happiness,G.health,G.smarts,G.looks,G.fitness,G.money]=s;

    // Apply personality trait bonus
    const traitDef=PERSONALITY_TRAITS.find(t=>t.id===trait);
    if(traitDef?.startBonus){
      Object.entries(traitDef.startBonus).forEach(([k,v])=>{
        if(k==='money')G.money+=v;
        else if(k==='fitness')G.fitness=cl((G.fitness||50)+v);
        else if(k==='skillPoints')G.skillPoints=(G.skillPoints||0)+v;
        else if(G[k]!==undefined)G[k]=cl(G[k]+v);
      });
    }

    // Apply ambition start bonus
    const ambDef=LIFE_AMBITIONS.find(a=>a.id===ambition);
    if(ambDef){
      if(ambition==='healthy'){G.health=cl(G.health+8);G.fitness=cl((G.fitness||50)+8);}
      if(ambition==='career_top'){G.smarts=cl(G.smarts+10);}
      if(ambition==='traveller'){G.happiness=cl(G.happiness+8);}
      if(ambition==='criminal'){G.money+=sc(500);}
      if(ambition==='sage'){G.skillPoints=(G.skillPoints||0)+2;}
      if(ambition==='investor'){G.money+=sc(2000);}
      if(ambition==='renaissance'){G.skillPoints=(G.skillPoints||0)+1;}
    }
    if(perk?.apply)perk.apply(G);
    if(challenge?.apply)challenge.apply(G);

    // Family
    G.rels.father=Engine.npc('father','male'); G.rels.father.age=r(22,34);
    G.rels.mother=Engine.npc('mother','female'); G.rels.mother.age=r(20,32);
    if(Math.random()>0.42){
      const sib=Engine.npc('sibling',Math.random()>0.5?'female':'male');
      sib.age=r(0,9); G.rels.siblings.push(sib);
    }

    Engine.log(`👶 ${G.name} ${G.surname} was born in ${G.country.flag} ${G.country.name}.`,'special');
    Engine.log(`👨 Father: ${G.rels.father.name} · 👩 Mother: ${G.rels.mother.name}.`,'neutral');
    if(G.rels.siblings.length)Engine.log(`👦 Sibling: ${G.rels.siblings[0].name}, age ${G.rels.siblings[0].age}.`,'neutral');
    const dl={easy:'a wealthy family',normal:'an average family',hard:'a struggling family',extreme:'extremely difficult circumstances',custom:'a custom start'};
    Engine.log(`🌍 Born into ${dl[diff]||'a family'} in ${G.country.name}.`,'neutral');
    if(traitDef)Engine.log(`${traitDef.icon} Trait: ${traitDef.name} — ${traitDef.desc}.`,'special');
    if(ambDef)Engine.log(`🎯 Life Ambition: "${ambDef.name}" — ${ambDef.desc}.`,'special');
    if(perk)Engine.log(`${perk.icon} Starting Perk: ${perk.name} — ${perk.desc}.`,'special');
    if(challenge&&challenge.id!=='none')Engine.log(`${challenge.icon} Challenge Mode: ${challenge.name} — ${challenge.desc}.`,'special');
    if(typeof LifeProgress!=='undefined')LifeProgress.init(G);

    this.show('game-screen'); UI.tab('life'); UI.update(); Save.save(G);
  },

  showHOF(){
    const hof=Save.hofAll();
    const el=document.getElementById('hof-body');
    const medals=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🏅','🏅','🏅','🏅','🏅'];
    if(!hof.length){
      el.innerHTML='<div class="empty"><span class="ei">🏆</span><p>No completed lives yet.<br>Play a full life to enter!</p></div>';
    } else {
      el.innerHTML=hof.map((e,i)=>`
        <div class="hof-card" style="animation-delay:${i*0.06}s">
          <div class="hof-rank">${medals[i]||'🎖️'}</div>
          <div class="hof-info">
            <div class="hof-name">${e.country} ${e.name} <span style="color:${e.grade==='S'?'#ffd700':e.grade==='A'?'var(--green)':'var(--muted)'}">Grade ${e.grade||'?'}</span></div>
            <div class="hof-meta">Died age ${e.age} · ${e.career} · ${e.children} kid${e.children!==1?'s':''} · ${e.cause}</div>
          </div>
          <div class="hof-worth">${fmtFull(e.netWorth)}</div>
        </div>`).join('');
    }
    this.show('hof-screen');
  },

  showAchievements(){
    const unlocked=Save.unlockedAchs();
    const pct=Math.round(unlocked.length/ACHIEVEMENTS.length*100);
    document.getElementById('ach-body').innerHTML=`
      <div class="nw-box" style="margin:12px 0">
        <div class="nw-lbl">🎖️ Achievements Unlocked</div>
        <div class="nw-amt" style="font-size:22px">${unlocked.length} / ${ACHIEVEMENTS.length}</div>
        <div class="prog-bar" style="margin:8px 0 5px"><div class="prog-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--yellow),var(--accent))"></div></div>
        <div class="nw-sub">${pct}% complete</div>
      </div>`+
      ACHIEVEMENTS.map((a,i)=>{const done=unlocked.includes(a.id);return`
        <div class="ach-card ${done?'unlocked':''}" style="animation-delay:${i*0.025}s">
          <div class="ach-ico">${done?a.icon:'❓'}</div>
          <div class="ach-info">
            <div class="ach-name">${done?a.name:'Hidden Achievement'}</div>
            <div class="ach-desc">${done?a.desc:'Complete more lives to discover this.'}</div>
            ${(!done&&window.G&&typeof LifeProgress!=='undefined'&&LifeProgress.achievementProgress(a,window.G))?(()=>{const p=LifeProgress.achievementProgress(a,window.G);const pct=Math.round(Math.min(100,(p[0]/p[1])*100));return`<div class="ach-progress"><div class="prog-bar"><div class="prog-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--cyan))"></div></div><span>${fmtFollowers(Math.round(p[0]))} / ${fmtFollowers(p[1])}</span></div>`;})():''}
          </div>
          <div style="font-size:18px">${done?'✅':'🔒'}</div>
        </div>`}).join('');
    this.show('ach-screen');
  },
};

const Create={
  gender:'male',
  selectedTrait:'resilient',
  selectedAmbition:'wealth',
  selectedPerk:null,

  fillCountries(){
    const sel=document.getElementById('inp-country');
    sel.innerHTML=COUNTRIES.map((c,i)=>`<option value="${i}">${c.flag} ${c.name}</option>`).join('');
    const cz=COUNTRIES.findIndex(c=>c.name==='Czech Republic');
    if(cz>=0)sel.value=cz;
  },

  setGender(g){
    this.gender=g;
    document.getElementById('gbtn-m').classList.toggle('selected',g==='male');
    document.getElementById('gbtn-f').classList.toggle('selected',g==='female');
    document.getElementById('inp-name').value=pick(g==='female'?FNAMES:MNAMES);
    document.getElementById('create-avatar').textContent=g==='female'?'👧':'👦';
    this.updatePreview();
  },

  renderTraits(){
    const g=document.getElementById('trait-grid');if(!g)return;
    g.innerHTML=PERSONALITY_TRAITS.map(t=>`
      <button type="button" class="trait-btn ${t.id===this.selectedTrait?'selected':''}" onclick="Create.selectTrait('${t.id}')" id="trait-${t.id}">
        <span class="ti">${t.icon}</span>
        <div class="td"><span class="tn">${t.name}</span><span class="ts">${t.desc}</span></div>
      </button>`).join('');
  },

  renderAmbitions(){
    const g=document.getElementById('ambition-list');if(!g)return;
    g.innerHTML=LIFE_AMBITIONS.map(a=>`
      <button type="button" class="ambition-btn ${a.id===this.selectedAmbition?'selected':''}" onclick="Create.selectAmbition('${a.id}')" id="amb-${a.id}">
        <span class="ai">${a.icon}</span>
        <div><div class="an">${a.name}</div><div class="as">${a.desc}</div></div>
      </button>`).join('');
  },

  renderChallenges(){
    const sel=document.getElementById('inp-challenge');if(!sel||typeof CHALLENGE_MODES==='undefined')return;
    sel.innerHTML=CHALLENGE_MODES.map(c=>`<option value="${c.id}">${c.icon} ${c.name} — ${c.desc}</option>`).join('');
  },

  rollPerk(update=true){
    if(typeof STARTING_PERKS==='undefined')return;
    this.selectedPerk=pick(STARTING_PERKS);
    const p=this.selectedPerk;
    const ico=document.getElementById('perk-ico');if(ico)ico.textContent=p.icon;
    const nm=document.getElementById('perk-name');if(nm)nm.textContent=p.name;
    const ds=document.getElementById('perk-desc');if(ds)ds.textContent=p.desc;
    if(update)this.updatePreview();
  },

  selectTrait(id){
    this.selectedTrait=id;
    document.querySelectorAll('.trait-btn').forEach(b=>b.classList.remove('selected'));
    const btn=document.getElementById('trait-'+id);if(btn)btn.classList.add('selected');
    this.updatePreview();
  },

  selectAmbition(id){
    this.selectedAmbition=id;
    document.querySelectorAll('.ambition-btn').forEach(b=>b.classList.remove('selected'));
    const btn=document.getElementById('amb-'+id);if(btn)btn.classList.add('selected');
    this.updatePreview();
  },

  sl(id,val){
    const el=document.getElementById('cs-'+id+'-v');if(el)el.textContent=val;
    this.updatePreview();
  },

  updatePreview(){
    const el=document.getElementById('preview-text');if(!el)return;
    const td=PERSONALITY_TRAITS.find(t=>t.id===this.selectedTrait);
    const amb=LIFE_AMBITIONS.find(a=>a.id===this.selectedAmbition);
    const challenge=typeof CHALLENGE_MODES!=='undefined'?CHALLENGE_MODES.find(c=>c.id===(document.getElementById('inp-challenge')?.value||'none')):null;
    const perk=this.selectedPerk;
    const diff=document.getElementById('inp-diff')?.value||'normal';
    const cIdx=parseInt(document.getElementById('inp-country')?.value)||0;
    const country=COUNTRIES[cIdx];
    el.innerHTML=[
      country?`🌍 <strong>${country.flag} ${country.name}</strong> · ${country.currency} · Life expectancy ${country.lifeExp}y`:'',
      td?`${td.icon} Trait: <strong>${td.name}</strong> — ${td.desc}`:'',
      amb?`🎯 Ambition: <strong>${amb.name}</strong> — ${amb.desc}`:'',
      challenge?`${challenge.icon} Challenge: <strong>${challenge.name}</strong> — ${challenge.desc}${challenge.scoreBonus?` · +${challenge.scoreBonus} score potential`:''}`:'',
      perk?`${perk.icon} Starting perk: <strong>${perk.name}</strong> — ${perk.desc}`:'',
      `📊 Difficulty: <strong>${diff}</strong> · Enter, Spacebar, or sidebar button to Age Up`,
      `⌨️ Keyboard: <strong>Enter</strong> / <strong>Space</strong> = Age up`,
    ].filter(Boolean).map(l=>`<div style="margin-bottom:5px">${l}</div>`).join('');
  },

  reset(){
    this.setGender('male');
    this.selectedTrait='resilient';
    this.selectedAmbition='wealth';
    document.getElementById('inp-diff').value='normal';
    document.getElementById('custom-stats').style.display='none';
    this.fillCountries();this.renderTraits();this.renderAmbitions();this.renderChallenges();this.rollPerk(false);this.updatePreview();
  },
};

document.addEventListener('DOMContentLoaded',()=>App.init());
