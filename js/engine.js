/* js/engine.js — LifeSim v13 Reforged core simulation engine */
const Engine={
  _aging:false,
  _modalSkipCb:null,
  _moduleOrder:['Relations.ageAll','Career.educTick','Career.incomeTick','Assets.tick','Health.tick','Crime.tick','Business.tick','Social.tick','Hustle.tick','Pets.tick','Goals.tick','Skills.tick','Stocks.tick'],

  _safe(label,fn){try{return fn();}catch(e){console.warn(label,e);return null;}},
  _esc(v){return String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;', '"':'&quot;'}[c]));},
  _snap(G){return{happiness:G.happiness,health:G.health,smarts:G.smarts,looks:G.looks,fitness:G.fitness||50,stress:G.stress||0,money:G.money,fame:G.fame||0,karma:G.karma||0};},
  _resolveGlobal(name){
    if(!name)return undefined;
    if(Object.prototype.hasOwnProperty.call(globalThis,name))return globalThis[name];
    if(!/^[A-Za-z_$][\w$]*$/.test(name))return undefined;
    try{
      return Function(`return typeof ${name}!=="undefined" ? ${name} : undefined;`)();
    }catch(e){
      return undefined;
    }
  },

  npc(role,gender,countryName){
    const isFem=gender==='female';
    const homeCountry=countryName||(window.G?.country?.name)||null;
    return{
      id:Math.random().toString(36).slice(2),
      name:typeof randomNameForCountry==='function'?randomNameForCountry(homeCountry,isFem?'female':'male'):pick(isFem?FNAMES:MNAMES),
      surname:typeof randomSurnameForCountry==='function'?randomSurnameForCountry(homeCountry):pick(SURNAMES),
      gender,role,age:0,love:r(50,82),alive:true
    };
  },

  log(text,type='neutral'){
    const G=window.G;if(!G)return;
    if(!Array.isArray(G.log))G.log=[];
    G.log.unshift({age:G.age||0,text:String(text||''),type,ts:Date.now(),cat:typeof logCategory==='function'?logCategory({text,type}):'other'});
    if(G.log.length>500)G.log.length=500;
  },

  ageUp(){
    const G=window.G;if(!G||!G.alive||this._aging)return;
    this._aging=true;
    const btns=[document.getElementById('age-btn'),document.getElementById('age-btn-side')].filter(Boolean);
    btns.forEach(b=>{b.disabled=true;b.classList?.add('is-aging');});
    G.age=(G.age||0)+1;
    G.year=(G.year||0)+1;
    this._ensureCoreState(G);

    this._moduleOrder.forEach(path=>this._safePath(path));
    this._retirementTick();
    this._snapshotStats();
    this._safe('Chapters.checkAndRecord',()=>{if(typeof Chapters!=='undefined')Chapters.checkAndRecord(G);});
    this._trackSpecialStreaks();
    this._drift();

    const pendingEvts=[];
    this._queueEvents(pendingEvts);
    this._modalSkipCb=null;
    this._processQueue(pendingEvts,()=>{
      try{
        if(!this._checkDeath()){
          UI.update();
          this.checkAch();
          UI.refreshActiveTab();
          if(typeof Save!=='undefined')Save.save(G);
        }
      }catch(e){console.warn('Post-event error:',e);}
      btns.forEach(b=>{b.disabled=false;b.classList?.remove('is-aging');});
      this._aging=false;
    });
  },

  _safePath(path){
    const parts=path.split('.');
    let obj=this._resolveGlobal(parts[0]);
    for(let i=1;i<parts.length-1;i++)obj=obj?.[parts[i]];
    const fn=obj?.[parts[parts.length-1]];
    if(typeof fn==='function')this._safe(path,()=>fn.call(obj));
  },

  _ensureCoreState(G){
    if(!G.achievements)G.achievements={};
    if(!G.rels)G.rels={partner:null,children:[],parents:[],siblings:[],friends:[]};
    if(!Array.isArray(G.rels.children))G.rels.children=[];
    if(!Array.isArray(G.crimes))G.crimes=[];
    if(!Number.isFinite(G.happiness))G.happiness=60;
    if(!Number.isFinite(G.health))G.health=60;
    if(!Number.isFinite(G.smarts))G.smarts=50;
    if(!Number.isFinite(G.looks))G.looks=50;
    if(!Number.isFinite(G.fitness))G.fitness=50;
    if(!Number.isFinite(G.stress))G.stress=0;
    if(!Number.isFinite(G.karma))G.karma=0;
    if(!Number.isFinite(G.fame))G.fame=0;
    if(!Number.isFinite(G.money))G.money=0;
    if(!Array.isArray(G.countriesVisited))G.countriesVisited=[];
  },

  _retirementTick(){
    const G=window.G;
    if(G?.retired&&G.retirementPension>0){
      const p=sc(G.retirementPension);
      G.money=(G.money||0)+p;
      this.log(`🏖️ Pension received: ${fmt(p)}.`,'money');
    }
  },

  _snapshotStats(){
    const G=window.G;if(!G)return;
    if(!Array.isArray(G.statHistory))G.statHistory=[];
    G.statHistory.push({age:G.age,hap:G.happiness,hlt:G.health,smt:G.smarts,lks:G.looks,fit:G.fitness||50,str:G.stress||0,fam:G.fame||0,kar:G.karma||0,nw:netWorth(G)});
    if(G.statHistory.length>60)G.statHistory.shift();
  },

  _trackSpecialStreaks(){
    const G=window.G;if(!G)return;
    G.achievements=G.achievements||{};
    if((G.stress||0)<=30){if(!G.achievements.stress_high_ever)G.achievements.always_low_stress=true;}
    else{G.achievements.stress_high_ever=true;G.achievements.always_low_stress=false;}
    G.happyStreak=(G.happiness||0)>=90?(G.happyStreak||0)+1:0;
    G.lowStressStreak=(G.stress||0)<10?(G.lowStressStreak||0)+1:0;
    G.healthyStreak=(G.health||0)>=80?(G.healthyStreak||0)+1:0;
  },

  _queueEvents(queue){
    const G=window.G;if(!G||typeof EVENTS==='undefined')return;
    if(G.inPrison)return;
    const pool=G.age<=12?EVENTS.childhood:G.age<=17?EVENTS.teen:G.age<=59?EVENTS.adult:EVENTS.elder;
    if(!Array.isArray(pool)||!pool.length)return;
    const extraChance={easy:.18,normal:.35,hard:.48,extreme:.62,custom:.35}[G.difficulty||'normal']??.35;
    const maxEvents=(G.stress||0)>85?3:2;
    const n=Math.min(maxEvents,Math.random()<extraChance?2:1);
    for(let i=0;i<n;i++){const evt=pick(pool);if(evt)queue.push(evt);}
    const worldChance={easy:.08,normal:.12,hard:.16,extreme:.22,custom:.12}[G.difficulty||'normal']??.12;
    if(G.age>18&&Math.random()<worldChance&&typeof WORLD_EVENTS!=='undefined'){
      const we=pick(WORLD_EVENTS);if(we)queue.push({...we,_world:true});
    }
  },

  _processQueue(queue,done){
    if(!queue||queue.length===0){done&&done();return;}
    const evt=queue.shift();
    if(!evt){this._processQueue(queue,done);return;}
    if(evt._world&&evt.tag){
      const G=window.G;G.achievements=G.achievements||{};
      if(evt.tag==='recession')G.achievements.survived_recession=true;
      if(evt.tag==='pandemic')G.achievements.survived_pandemic=true;
      if(evt.tag==='boom')G.achievements.boom_profit=true;
    }
    this._modalSkipCb=()=>setTimeout(()=>this._processQueue(queue,done),120);
    if(typeof UI!=='undefined'&&typeof UI.showEvent==='function')UI.showEvent(evt,()=>{this._modalSkipCb=null;setTimeout(()=>this._processQueue(queue,done),120);});
    else{this._modalSkipCb=null;this._processQueue(queue,done);}
  },

  act(id){
    const G=window.G;if(!G||!G.alive)return;
    if(G.inPrison){UI.toast('You are in prison. Normal life actions are unavailable.','bad');UI.tab('crime');return;}
    const defs=this._actionDefs();
    const a=defs[id];
    if(!a){UI.toast('Action unavailable.');return;}
    const cost=sc(a.cost||0);
    if(cost>0&&(G.money||0)<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    const before=this._snap(G);
    if(cost>0)G.money-=cost;
    let msg=typeof a.run==='function'?a.run(G):a.msg;
    if(a.eff)applyStats(G,this._scaledAction(a.eff,G));
    if(a.addiction){if(!G.addictions)G.addictions={};if(Math.random()<a.addiction.chance){G.addictions[a.addiction.type]=true;this.log(a.addiction.msg,'bad');}}
    if(id==='travel')msg=this._travel(G);
    if(id==='gamble')msg=this._gamble(G);
    if(id==='drugs'){if(this._drugUse(G))return;msg='💊 A very heavy night. Wrecked.';}
    if(msg)this.log(msg,a.type||'good');
    UI.update();
    if(typeof UI.showStatDelta==='function')UI.showStatDelta(before,G);
    UI.refreshActiveTab();
    this.checkAch();
  },

  _scaledAction(eff,G){
    const out={};
    const disciplined=G.trait==='disciplined';
    const naturalist=G.trait==='naturalist';
    Object.entries(eff).forEach(([k,v])=>{
      let x=Array.isArray(v)?r(v[0],v[1]):v;
      if(k==='stress'&&x>0&&disciplined)x=Math.round(x*.75);
      if(['happiness','health','fitness','stress'].includes(k)&&naturalist&&(eff._nature))x=Math.round(x*1.55);
      out[k]=x;
    });
    delete out._nature;
    return out;
  },

  _actionDefs(){
    return{
      study:{msg:'📚 Studied intensively.',eff:{smarts:[4,10],stress:[2,5]}},
      library:{msg:'📖 Peaceful library afternoon.',eff:{smarts:[5,12],happiness:[3,6],stress:[-6,-3]}},
      meditate:{msg:'🧘 Deep meditation. Stress dropped.',eff:{happiness:[7,13],health:[2,5],stress:[-16,-9]}},
      therapy:{cost:150,msg:'🛋️ Therapy. Baggage unpacked.',eff:{happiness:[10,19],stress:[-20,-12]}},
      gym:{msg:'🏋️ Crushed a gym session.',eff:{health:[4,8],fitness:[5,10],looks:[2,5],stress:[-9,-5]}},
      run:{msg:'🏃 Long refreshing run.',eff:{health:[3,7],fitness:[4,8],happiness:[3,6],stress:[-8,-4]}},
      swim:{cost:30,msg:'🏊 Swimming laps.',eff:{health:[4,8],fitness:[5,9],stress:[-8,-4]}},
      yoga:{msg:'🧘‍♀️ Yoga complete. Balanced.',eff:{health:[3,6],happiness:[5,9],fitness:[2,5],stress:[-13,-7]}},
      hike:{msg:'🥾 Mountain hike. Recharged.',eff:{health:[4,8],fitness:[4,8],happiness:[6,11],stress:[-14,-8],_nature:1}},
      nature:{msg:'🌿 Day in nature. Soul refreshed.',eff:{happiness:[8,14],health:[3,6],stress:[-14,-8],_nature:1}},
      sports:{msg:'⚽ Great match with friends.',eff:{health:[3,7],fitness:[4,8],happiness:[5,10]}},
      boxing:{cost:60,msg:'🥊 Boxing. Power building.',eff:{fitness:[6,12],looks:[1,4],stress:[-10,-5]}},
      sleep:{msg:'😴 Full rest day. Restored.',eff:{health:[4,8],happiness:[4,8],smarts:[1,3],stress:[-16,-9]}},
      salon:{cost:90,msg:'💇 Fresh cut. Turning heads.',eff:{looks:[5,11]}},
      spa:{cost:180,msg:'🧖 Full spa day. Magnificent.',eff:{looks:[4,9],happiness:[8,15],stress:[-22,-15]}},
      dentist:{cost:130,msg:'🦷 Gleaming teeth. Perfect checkup.',eff:{looks:[3,7],health:[2,4]}},
      personal_shop:{cost:400,msg:'🛍️ Full wardrobe overhaul.',eff:{looks:[6,13],happiness:[5,10]}},
      movie:{msg:'🎬 Brilliant film.',eff:{happiness:[6,11],stress:[-6,-3]}},
      concert:{cost:120,msg:'🎵 Live concert. Peak happiness.',eff:{happiness:[9,15],fame:[1,3],stress:[-8,-4]}},
      cook:{msg:'👨‍🍳 Cooked from scratch. Satisfying.',eff:{happiness:[5,10],health:[2,4],stress:[-6,-3]}},
      volunteer:{msg:'🤲 Volunteering. Reminded what matters.',eff:{happiness:[8,14],fame:[1,3],karma:[3,6]}},
      gaming:{msg:'🎮 Lost hours gaming. Zero regrets.',eff:{happiness:[8,13],smarts:[-5,-2],stress:[-10,-5]},type:'neutral'},
      reading:{msg:'📰 Another great book. Mind growing.',eff:{smarts:[4,9],happiness:[3,7],stress:[-6,-3]}},
      museum:{cost:20,msg:'🏛️ Museum visit. Inspired.',eff:{smarts:[3,7],happiness:[3,6]}},
      journal:{msg:'📓 Journalled. Clarity found.',eff:{happiness:[4,8],stress:[-10,-5],smarts:[1,3]}},
      music_play:{msg:'🎸 Playing music. Pure flow.',eff:{happiness:[7,13],smarts:[2,5],stress:[-10,-5]}},
      paint:{msg:'🎨 Painted. Art as therapy.',eff:{happiness:[7,12],looks:[1,3],stress:[-8,-4]}},
      travel:{cost:700,msg:'✈️ Holiday abroad. Recharged.',eff:{happiness:[12,20],health:[3,6],stress:[-18,-10]}},
      bar:{msg:'🍸 Wild night out. Fun, but rough on the body.',eff:{happiness:[9,15],health:[-11,-5],stress:[-7,-3]},type:'neutral',addiction:{type:'alcohol',chance:.09,msg:'🍺 Drinking too heavily. Dependency forming.'}},
      smoke:{msg:'🚬 Another cigarette. Lungs protesting.',eff:{health:[-8,-4],happiness:[1,4],karma:[-1,0]},type:'bad',addiction:{type:'smoking',chance:.13,msg:'🚬 Nicotine dependency is forming.'}},
      gamble:{type:'neutral'},
      drugs:{type:'bad'},
    };
  },

  _travel(G){
    if(!Array.isArray(G.countriesVisited))G.countriesVisited=[];
    const list=typeof COUNTRIES!=="undefined"?COUNTRIES:[];
    const rc=pick(list.filter(c=>c.name!==G.country?.name));
    if(rc&&!G.countriesVisited.includes(rc.name))G.countriesVisited.push(rc.name);
    return `✈️ Holiday in ${rc?rc.flag+" "+rc.name:"abroad"}. Recharged.`;
  },

  _gamble(G){
    const isMaverick=G.trait==='maverick';
    const bet=sc(isMaverick?r(500,4000):r(100,1500));
    if((G.money||0)<bet){UI.toast('Not enough money!');return'';}
    G.lifetimeGambled=(G.lifetimeGambled||0)+bet;
    const lucky=G.trait==='lucky';
    const winChance=lucky ? .54 : .46;
    if(Math.random()<winChance){
      const mult=isMaverick?r(20,45)/10:r(12,28)/10;
      const won=Math.floor(bet*mult);
      G.money+=won;G.happiness=cl(G.happiness+(isMaverick?18:12));
      this.log(`🎰 ${isMaverick?'MAVERICK WIN! ':''}Won ${fmt(won)}!`,'special');
    }else{
      G.money=Math.max(0,G.money-bet);G.happiness=cl(G.happiness-(isMaverick?14:8));
      this.log(`🎰 Lost ${fmt(bet)}.${isMaverick?' High risk, high cost.':''}`,'bad');
    }
    return'';
  },

  _drugUse(G){
    if(Math.random()<(G.trait==='lucky' ? .035 : .06)){G.alive=false;this._die('drug overdose');return true;}
    G.health=cl(G.health-r(13,24));
    G.happiness=cl(G.happiness+(Math.random()>.45?r(10,20):-r(5,15)));
    G.addictions=G.addictions||{};if(Math.random()<.18)G.addictions.drugs=true;
    G.achievements=G.achievements||{};G.achievements.overdose=true;
    return false;
  },

  _drift(){
    const G=window.G;if(!G)return;
    const decay=G.trait==='disciplined'?.65:1;
    const age=G.age||0;
    if(age>30)G.looks=cl(G.looks-r(0,1));
    if(age>40)G.looks=cl(G.looks-Math.round(r(0,2)*decay));
    if(age>50)G.looks=cl(G.looks-Math.round(r(0,2)*decay));
    if(age>60)G.looks=cl(G.looks-Math.round(r(1,3)*decay));
    if(age>45)G.health=cl(G.health-Math.round(r(1,2)*decay));
    if(age>60)G.health=cl(G.health-Math.round(r(2,3)*decay));
    if(age>75)G.health=cl(G.health-Math.round(r(3,5)*decay));
    if(age>85)G.health=cl(G.health-Math.round(r(4,8)*decay));
    if(age>35)G.fitness=cl((G.fitness||50)-Math.round(r(0,2)*decay));
    if(age>60)G.fitness=cl((G.fitness||50)-Math.round(r(1,3)*decay));
    if(G.trait==='athletic')G.fitness=cl((G.fitness||50)+1);
    if(G.trait==='resilient'&&age>45)G.health=cl(G.health+1);
    if(G.trait==='naturalist')G.fitness=cl((G.fitness||50)+1);
    if(G.trait==='stoic'){G.stress=cl((G.stress||0)-r(1,3));if(G.stress>70)G.stress=cl(G.stress-r(3,6));}
    if((G.fame||0)>10)G.fame=cl((G.fame||0)-r(0,1));
    if(G.happiness<50)G.happiness=cl(G.happiness+r(1,3));else if(G.happiness>80)G.happiness=cl(G.happiness-r(0,2));
    if((G.stress||0)>0)G.stress=cl(G.stress-r(1,3));
    if(G.stress>70){G.health=cl(G.health-r(1,3));G.happiness=cl(G.happiness-r(1,3));}
    if(G.stress>90){G.health=cl(G.health-r(2,4));G.happiness=cl(G.happiness-r(2,4));}
    if((G.fitness||50)<20)G.health=cl(G.health-r(1,2));
    if((G.karma||0)<-30&&Math.random()<.07){G.happiness=cl(G.happiness-r(2,6));this.log('⚖️ Karma catching up.','bad');}
    if((G.karma||0)>50&&Math.random()<.05){G.happiness=cl(G.happiness+r(2,5));this.log('😇 Good karma at work.','good');}
    if((G.money||0)===0&&age>18){G.achievements=G.achievements||{};G.achievements.rock_bottom=true;}
    if(G.happiness<=5){G.achievements=G.achievements||{};G.achievements.hit_rock_bottom_mood=true;}
  },

  _checkDeath(){
    const G=window.G;if(!G?.alive)return false;
    let chance=0;
    if(G.age>=95)chance=.33;else if(G.age>=85)chance=.18;else if(G.age>=75)chance=.08;else if(G.age>=65)chance=.04;else if(G.age>=55)chance=.018;else if(G.age>=35)chance=.007;else if(G.age>=18)chance=.004;
    if(G.health<20)chance+=.13;if(G.health<10)chance+=.24;if(G.stress>90)chance+=.03;if((G.conditions||[]).length>=3)chance+=.03;
    if(G.difficulty==='extreme')chance*=1.5;if(G.difficulty==='easy')chance*=.55;if(G.trait==='resilient')chance*=.82;if(G.trait==='lucky')chance*=.88;if(G.trait==='stoic')chance*=.85;
    if((G.country?.lifeExp||80)&&G.age>G.country.lifeExp)chance+=.05;
    if((G.karma||0)>50)chance*=.9;
    if(G.age>=120){this._die('reaching the maximum human age');return true;}
    if(Math.random()<chance){
      const NAT=['natural causes','heart failure','pneumonia','kidney failure','peaceful old age'];
      const ILL=['cancer','stroke','severe infection','organ failure','sepsis'];
      const ACC=['car accident','workplace accident','sudden cardiac arrest'];
      const STR=['stress-related heart attack','complications from burnout'];
      const pool=G.stress>80?[...NAT,...STR]:G.age>=70?NAT:G.health<20?ILL:[...NAT,...ACC];
      this._die(pick(pool));return true;
    }
    return false;
  },

  _die(cause){
    const G=window.G;if(!G)return;
    G.alive=false;G.causeOfDeath=cause;
    const nw=netWorth(G),stockValue=typeof Stocks!=='undefined'?Stocks.portfolioValue():0,totalGoals=(G.activeGoals||[]).length||0,completedGoals=(G.completedGoals||[]).length;
    const conditions=(G.conditions||[]).map(c=>c?.name).filter(Boolean);
    const topSkills=G.skills?Object.entries(G.skills).filter(([,v])=>v>=3).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>`${k}:Lv${v}`):[];
    let score=0;
    score+=G.age>80?30:G.age>60?20:G.age>40?10:5;
    score+=G.happiness>70?20:G.happiness>40?10:0;
    score+=nw>1000000?20:nw>100000?10:nw>10000?5:0;
    score+=(G.rels?.children||[]).length>0?10:0;
    score+=(G.career?.prestige||0)*3;
    score+=(G.fame||0)/10;
    score+=completedGoals*3;
    score+=(G.karma||0)>50?10:(G.karma||0)<-30?-5:0;
    score+=G.ambitionAchieved?12:0;
    score-=(G.crimes||[]).length*2;
    if(G.skills)score+=Object.values(G.skills).filter(v=>v>=4).length*4;
    score+=stockValue>500000?8:stockValue>100000?4:0;
    const grade=score>=90?{g:'S',l:'Legendary Life',c:'#ffd700'}:score>=75?{g:'A',l:'Excellent Life',c:'var(--green)'}:score>=55?{g:'B',l:'Good Life',c:'var(--cyan)'}:score>=35?{g:'C',l:'Average Life',c:'var(--yellow)'}:score>=20?{g:'D',l:'Hard Life',c:'var(--orange)'}:{g:'F',l:'Tragic Life',c:'var(--red)'};
    const story=this._deathStory(G,cause,nw,stockValue,conditions);
    const setText=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
    setText('dt-story',story.join(' '));setText('dt-title',`${G.name} ${G.surname} has died.`);setText('dt-cause',`Cause of death: ${cause}`);setText('dt-quote',pick(typeof DEATH_QUOTES!=='undefined'?DEATH_QUOTES:['Every life leaves a trace.']));
    const gradeEl=document.getElementById('dt-grade');if(gradeEl){gradeEl.textContent=grade.g;gradeEl.style.color=grade.c;}
    setText('dt-grade-lbl',grade.l);
    const statEl=document.getElementById('dt-stats');
    if(statEl){statEl.innerHTML=[
      ['Age at death',`${G.age} years old`,''],['Country',`${G.country?.flag||''} ${G.country?.name||'Unknown'}`,''],['Net worth',fmtFull(nw),'color:var(--green)'],['Career',G.career?G.career.title:G.retired?'Retired':'Unemployed',''],['Education',this._educationLabel(G),''],['Relationship',this._partnerStatus(G),''],['Children',(G.rels?.children||[]).length,''],['Goals completed',`${completedGoals} / ${totalGoals||'—'}`,'color:var(--accent)'],['Health conditions',conditions.join(', ')||'None','color:var(--orange)'],['Eating pattern',`${G.food?.lastChoiceLabel||'Unknown'} · ${G.food?.healthyYears||0} healthy / ${G.food?.junkYears||0} junk / ${G.food?.skippedYears||0} insecure yrs`,''],['Life Ambition',G.ambitionAchieved?'✅ Achieved!':'❌ Not achieved',G.ambitionAchieved?'color:var(--green)':'color:var(--muted)'],['Karma',(G.karma||0)>0?`+${G.karma} 😇`:(G.karma||0)<0?`${G.karma} 😈`:'Neutral ⚖️',(G.karma||0)>0?'color:var(--green)':(G.karma||0)<0?'color:var(--red)':''],['Stress at death',`${G.stress||0}%`,'color:var(--orange)'],['Top Skills',topSkills.join(', ')||'—','color:var(--cyan)'],['Stock portfolio',fmtFull(stockValue),'color:var(--green)'],['Hustle earnings',fmtFull(G.hustle?.earnings||0),'color:var(--green)'],['Social followers',fmtFollowers(G.followers||0),'color:var(--accent)'],['Final happiness',`${G.happiness}%`,'color:var(--yellow)'],['Final health',`${G.health}%`,'color:var(--green)'],
    ].map(([l,v,s])=>`<div class="dstat-row"><span class="dstat-l">${this._esc(l)}</span><span class="dstat-v" style="${s}">${this._esc(v)}</span></div>`).join('');}
    const prevLife=typeof Save!=='undefined'?(Save.hofAll()||[])[0]:null;
    if(typeof Save!=='undefined')Save.hof({name:`${G.name} ${G.surname}`,age:G.age,country:G.country?.flag,countryName:G.country?.name,netWorth:nw,career:G.career?.title||(G.retired?'Retired':'Unemployed'),educationLabel:this._educationLabel(G),partnerStatus:this._partnerStatus(G),children:(G.rels?.children||[]).length,cause,grade:grade.g,score,happiness:G.happiness,health:G.health,followers:G.followers||0,completedGoals,totalGoals,topSkills,ambitionAchieved:!!G.ambitionAchieved,highlight:story.slice(0,2).join(' ')});
    const prev=document.getElementById('dt-prev');
    if(prev&&prevLife)prev.innerHTML=`<div style="background:var(--s1);border:1.5px solid var(--b2);border-radius:12px;padding:12px 14px;margin-bottom:14px"><div style="font-size:10px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🔄 vs Your Last Life</div><div style="display:grid;grid-template-columns:1fr auto auto;gap:6px 12px;font-size:12px;font-weight:700"><span style="color:var(--muted)">Stat</span><span style="color:var(--muted)">Last</span><span style="color:var(--muted)">Now</span><span>Age</span><span>${prevLife.age}</span><span style="color:${G.age>=prevLife.age?'var(--green)':'var(--red)'}">${G.age}</span><span>Grade</span><span>${prevLife.grade}</span><span style="color:var(--yellow)">${grade.g}</span><span>Net Worth</span><span>${fmtFull(prevLife.netWorth)}</span><span style="color:${nw>=prevLife.netWorth?'var(--green)':'var(--red)'}">${fmtFull(nw)}</span></div></div>`;
    this._safe('Legacy.recordLife',()=>{if(typeof Legacy!=='undefined')Legacy.recordLife(`${G.name} ${G.surname}`,grade.g,score);});
    if(typeof Save!=='undefined')Save.clear();
    if(typeof App!=='undefined')App.show('death-screen');
  },

  _deathStory(G,cause,nw,stockValue,conditions){
    const story=[];
    if(G.education==='university')story.push(`${G.name} earned a university degree${G.univType==='ivy'?' from an Ivy League institution':''}.`);
    if(G.career)story.push(`They built a career as a ${G.career.title}.`);
    if(G.rels?.partner?.married)story.push(`They married ${G.rels.partner.name}.`);
    if((G.rels?.children||[]).length)story.push(`They raised ${G.rels.children.length} child${G.rels.children.length!==1?'ren':''}.`);
    if(G.business)story.push(`They founded ${G.business.name}, valued at ${fmt(G.business.value)}.`);
    if(nw>1000000)story.push(`By their death, ${G.name} had accumulated ${fmtFull(nw)} net worth.`);
    if((G.countriesVisited||[]).length>3)story.push(`They explored ${G.countriesVisited.length} countries.`);
    if(G.skills){const master=Object.entries(G.skills).filter(([,v])=>v>=5).map(([k])=>k);if(master.length)story.push(`They mastered ${master.join(', ')}.`);}
    if(stockValue>50000)story.push(`Their investment portfolio reached ${fmtFull(stockValue)}.`);
    if((G.hustle?.earnings||0)>0)story.push(`Side hustles earned ${fmtFull(G.hustle.earnings||0)} over a lifetime.`);
    if(G.ambitionAchieved&&typeof LIFE_AMBITIONS!=='undefined'){const a=LIFE_AMBITIONS.find(x=>x.id===G.ambition);if(a)story.push(`Their life ambition was achieved: "${a.name}".`);}
    if(conditions.length)story.push(`Late in life they were dealing with ${conditions.join(', ')}.`);
    if((G.stress||0)>=80)story.push('Severe long-term stress had been wearing them down for years.');
    story.push(`${G.name} passed away at age ${G.age} from ${cause}.`);
    return story;
  },

  _educationLabel(G){return G.education==='university'?`🎓 ${G.univType==='ivy'?'Ivy League':'University'}`:G.education==='high_school'?'📜 High School':G.education==='vocational'?'🔧 Vocational':'📚 None';},
  _partnerStatus(G){return G.rels?.partner?(G.rels.partner.married?`💍 Married to ${G.rels.partner.name}`:`💑 With ${G.rels.partner.name}`):'Single';},

  checkAch(){
    const G=window.G;if(!G||typeof Save==='undefined'||typeof ACHIEVEMENTS==='undefined')return;
    const unlocked=Save.unlockedAchs();
    ACHIEVEMENTS.forEach(a=>{if(!unlocked.includes(a.id)){try{if(a.check(G)&&Save.unlockAch(a.id)&&typeof UI.achievementPopup==='function')UI.achievementPopup(a);}catch(e){}}});
    if(G.achievements?.survived_recession)Save.unlockAch('recession_surv');
    if(G.achievements?.survived_pandemic)Save.unlockAch('pandemic_surv');
    if(G.achievements?.boom_profit)Save.unlockAch('boom_profit');
  },
};
