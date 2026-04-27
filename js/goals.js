/* js/goals.js — LifeSim v13 personalized life goals */
const GOAL_REWARDS={
  money:{happiness:10,money:6500},
  happiness:{health:8,happiness:10,stress:-6},
  health:{health:12,fitness:6,stress:-4},
  smarts:{smarts:10,skillPoints:1},
  family:{happiness:14,karma:6,stress:-4},
  fame:{fame:9,happiness:8,money:4500},
  business:{happiness:10,money:9000,fame:3},
  crime:{money:12000,happiness:4,karma:-8},
  travel:{happiness:12,smarts:4,stress:-4},
  skill:{smarts:6,skillPoints:1,happiness:4},
  finance:{money:8500,smarts:4},
};

const GOAL_SKILLS=['coding','finance','fitness','music','cooking','writing','language','medicine','art','public_sp'];

const Goals={
  _esc(v){return String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;', '"':'&quot;'}[c]));},

  ensurePersonalGoals(G=window.G,force=false){
    if(!G)return[];
    if(!Array.isArray(G.completedGoals))G.completedGoals=[];
    if(!force&&Array.isArray(G.activeGoals)&&G.activeGoals.length)return G.activeGoals;
    G.goalSeed=Number.isFinite(G.goalSeed)?G.goalSeed:r(1000,999999);
    G.activeGoals=this._buildPersonalGoals(G);
    return G.activeGoals;
  },

  regenerate(){
    const G=window.G;if(!G)return;
    G.goalSeed=r(1000,999999);
    this.ensurePersonalGoals(G,true);
    Engine.log('🎯 Life goals were recalibrated around your current path.','neutral');
    UI.update();this.render();
  },

  _buildPersonalGoals(G){
    const pool=this._goalPool(G);
    const want=G.difficulty==='extreme'?8:7;
    const scored=pool.map((g,i)=>({...g,_score:this._scoreGoal(G,g)+((G.goalSeed+i*37)%23)})).sort((a,b)=>b._score-a._score);
    const picked=[],seen=new Set();
    for(const g of scored){
      const key=g.kind||g.type;
      if(seen.has(key))continue;
      picked.push(this._strip(g));seen.add(key);
      if(picked.length>=want)break;
    }
    for(const g of scored){if(picked.length>=want)break;if(!picked.some(x=>x.id===g.id))picked.push(this._strip(g));}
    return picked;
  },

  _strip(g){const{_score,...clean}=g;return clean;},

  _scoreGoal(G,g){
    let s=g.base||50;
    if(g.ambition===G.ambition)s+=45;
    if(g.traits?.includes(G.trait))s+=30;
    if(g.diff?.includes(G.difficulty))s+=18;
    if(g.country&&g.country(G.country||{}))s+=20;
    if(g.stat&&((G[g.stat]||0)>=55))s+=10;
    if(g.young&&G.age<30)s+=10;
    if(g.adult&&G.age>=30)s+=8;
    if(g.recovery&&(G.addictions?.smoking||G.addictions?.alcohol||G.addictions?.drugs||G.recovery?.active))s+=28;
    return s;
  },

  _goalPool(G){
    const mult=G.country?.mult||1;
    const richTarget=Math.round((G.difficulty==='easy'?1500000:G.difficulty==='extreme'?180000:550000)*Math.max(0.55,Math.min(2,mult)));
    const lifeTarget=Math.max(65,Math.min(92,(G.country?.lifeExp||78)+(G.trait==='resilient'?5:0)));
    const travelTarget=G.country?.name==='United States'||G.country?.name==='Russia'?8:10;
    const chosenSkill=this._skillFocus(G);
    const skillName=this._skillName(chosenSkill);
    return[
      {id:'money_'+richTarget,kind:'money',icon:'💰',name:'Build Real Security',desc:`Reach ${fmtFull(richTarget)} net worth`,type:'networth',target:richTarget,reward:'money',ambition:'wealth',traits:['ambitious','frugal'],base:72},
      {id:'emergency_fund',kind:'money2',icon:'🏦',name:'Emergency Fund',desc:'Keep at least 1 year of living costs in cash',type:'cashReserve',target:1,reward:'finance',traits:['frugal','disciplined'],diff:['hard','extreme'],base:64},
      {id:'credit_760',kind:'credit',icon:'💳',name:'Excellent Credit',desc:'Reach a 760+ credit score',type:'credit',target:760,reward:'finance',traits:['disciplined','frugal'],base:60},
      {id:'happy_90',kind:'happiness',icon:'😊',name:'Protect Your Peace',desc:'Reach 90+ happiness',type:'stat',stat:'happiness',target:90,reward:'happiness',traits:['empath','creative','lucky','stoic'],base:56},
      {id:'low_stress_5',kind:'mind',icon:'🧘',name:'Calm System',desc:'Keep stress under 30 for 5 years',type:'streak',field:'lowStressStreak',target:5,reward:'happiness',traits:['stoic','disciplined'],base:54},
      {id:'health_'+lifeTarget,kind:'health',icon:'💪',name:'Outlive the Odds',desc:`Reach age ${lifeTarget} with 60+ health`,type:'ageHealth',target:lifeTarget,health:60,reward:'health',ambition:'healthy',traits:['athletic','resilient','naturalist'],country:c=>(c.lifeExp||80)<76,base:66},
      {id:'fit_85',kind:'fitness',icon:'🏋️',name:'Athletic Body',desc:'Reach 85+ fitness',type:'stat',stat:'fitness',target:85,reward:'health',ambition:'healthy',traits:['athletic','disciplined'],young:true,base:58},
      {id:'recovery_3',kind:'recovery',icon:'🌱',name:'Stay Clean',desc:'Hold a 3-year recovery streak',type:'recovery',target:3,reward:'health',recovery:true,base:40},
      {id:'family_2',kind:'family',icon:'👨‍👩‍👧',name:'A Warm Home',desc:'Have a serious partner and 2 children',type:'family',children:2,reward:'family',ambition:'family',traits:['empath','charming'],base:55},
      {id:'fame_50',kind:'fame',icon:'⭐',name:'Public Name',desc:'Reach 50 fame',type:'stat',stat:'fame',target:50,reward:'fame',ambition:'fame',traits:['charming','creative','visionary'],base:50},
      {id:'business_250k',kind:'business',icon:'🏢',name:'Local Empire',desc:'Build a business worth $250K+',type:'businessValue',target:250000,reward:'business',ambition:'entrepreneur',traits:['ambitious','visionary'],base:55},
      {id:'degree_80',kind:'education',icon:'🎓',name:'Serious Education',desc:'Graduate university with 80+ smarts',type:'educationSmart',target:80,reward:'smarts',ambition:'academic',traits:['intellectual','scholar'],young:true,base:59},
      {id:'travel_'+travelTarget,kind:'travel',icon:'🌍',name:'See Beyond Home',desc:`Visit ${travelTarget} countries`,type:'travel',target:travelTarget,reward:'travel',ambition:'traveller',traits:['curious','charming'],base:51},
      {id:'skill_'+chosenSkill,kind:'skill',icon:'🎯',name:`Master ${skillName}`,desc:`Reach level 4 in ${skillName}`,type:'skill',skill:chosenSkill,target:4,reward:'skill',ambition:'sage',traits:['scholar','disciplined','intellectual'],base:64},
      {id:'stocks_100k',kind:'invest',icon:'📈',name:'Investor Brain',desc:'Build a stock portfolio worth $100K+',type:'stocks',target:100000,reward:'finance',ambition:'investor',traits:['frugal','intellectual'],adult:true,base:57},
      {id:'clean_40',kind:'law',icon:'⚖️',name:'Clean Reputation',desc:'Reach age 40 with no criminal record',type:'cleanAge',target:40,reward:'happiness',traits:['disciplined','empath'],base:48},
      {id:'crime_5',kind:'crime',icon:'😈',name:'Underworld Run',desc:'Commit 5 crimes and stay out of prison',type:'crimeCount',target:5,reward:'crime',ambition:'criminal',country:c=>(c.crimeRate||0)>0.35,base:30},
    ];
  },

  _skillFocus(G){
    if(G.ambition==='investor')return'finance';
    if(G.ambition==='healthy')return'fitness';
    if(G.ambition==='fame')return'public_sp';
    if(G.ambition==='academic')return'medicine';
    if(G.ambition==='entrepreneur')return pick(['finance','public_sp','coding']);
    if(G.trait==='creative')return pick(['music','writing','art']);
    if(G.trait==='athletic'||G.trait==='naturalist')return'fitness';
    if(G.trait==='intellectual'||G.trait==='scholar')return pick(['coding','medicine','language']);
    return GOAL_SKILLS[(G.goalSeed||0)%GOAL_SKILLS.length];
  },

  _skillName(id){
    if(typeof SKILL_DEFS!=='undefined'){const s=SKILL_DEFS.find(x=>x.id===id);if(s)return s.name;}
    return cap(String(id||'skill').replace('_',' '));
  },

  _rewardText(g){
    const reward=GOAL_REWARDS[g.reward]||{};
    return Object.entries(reward).map(([k,v])=>{
      if(k==='money')return`+${fmt(v)}`;
      if(k==='skillPoints')return`+${v} Skill Point`;
      if(k==='karma')return`${v>0?'+':''}${v} Karma`;
      if(k==='stress')return`${v>0?'+':''}${v} Stress`;
      return`+${v} ${cap(k)}`;
    }).join(', ');
  },

  _progress(g,G){
    if(g.type==='networth')return Math.min(100,Math.round(netWorth(G)/g.target*100));
    if(g.type==='credit')return Math.min(100,Math.round(((G.creditScore||300)-300)/(g.target-300)*100));
    if(g.type==='stat')return Math.min(100,Math.round(((G[g.stat]||0)/g.target)*100));
    if(g.type==='ageHealth')return Math.min(100,Math.round((G.age/g.target)*70+(G.health>=g.health?30:0)));
    if(g.type==='family')return Math.min(100,Math.round(((G.rels?.partner?1:0)+(G.rels?.children||[]).length/g.children)*50));
    if(g.type==='businessValue')return Math.min(100,Math.round(((G.business?.value||0)/g.target)*100));
    if(g.type==='educationSmart')return Math.min(100,Math.round((G.education==='university'?55:0)+((G.smarts||0)/g.target)*45));
    if(g.type==='travel')return Math.min(100,Math.round(((G.countriesVisited||[]).length/g.target)*100));
    if(g.type==='skill')return Math.min(100,Math.round(((G.skills?.[g.skill]||0)/g.target)*100));
    if(g.type==='stocks')return Math.min(100,Math.round(((typeof Stocks!=='undefined'?Stocks.portfolioValue():0)/g.target)*100));
    if(g.type==='cleanAge')return G.crimes?.length?0:Math.min(100,Math.round((G.age/g.target)*100));
    if(g.type==='crimeCount')return Math.min(100,Math.round(((G.crimes||[]).length/g.target)*100));
    if(g.type==='cashReserve'){const overhead=(G.lastLivingCosts||0)+(G.food?.lastCost||0)+(G.lastAssetUpkeep||0);return overhead?Math.min(100,Math.round((G.money/(overhead*g.target))*100)):0;}
    if(g.type==='streak')return Math.min(100,Math.round(((G[g.field]||0)/g.target)*100));
    if(g.type==='recovery')return Math.min(100,Math.round(((G.recovery?.cleanStreak||0)/g.target)*100));
    return 0;
  },

  _check(g,G){
    if(g.type==='networth')return netWorth(G)>=g.target;
    if(g.type==='credit')return(G.creditScore||0)>=g.target;
    if(g.type==='stat')return(G[g.stat]||0)>=g.target;
    if(g.type==='ageHealth')return G.age>=g.target&&G.health>=g.health;
    if(g.type==='family')return!!G.rels?.partner&&(['serious','engaged','married'].includes(G.rels.partner.stage)||G.rels.partner.married)&&(G.rels.children||[]).length>=g.children;
    if(g.type==='businessValue')return(G.business?.value||0)>=g.target;
    if(g.type==='educationSmart')return G.education==='university'&&(G.smarts||0)>=g.target;
    if(g.type==='travel')return(G.countriesVisited||[]).length>=g.target;
    if(g.type==='skill')return(G.skills?.[g.skill]||0)>=g.target;
    if(g.type==='stocks')return typeof Stocks!=='undefined'&&Stocks.portfolioValue()>=g.target;
    if(g.type==='cleanAge')return G.age>=g.target&&(!G.crimes||G.crimes.length===0);
    if(g.type==='crimeCount')return(G.crimes||[]).length>=g.target&&!G.inPrison;
    if(g.type==='cashReserve'){const overhead=(G.lastLivingCosts||0)+(G.food?.lastCost||0)+(G.lastAssetUpkeep||0);return overhead>0&&(G.money||0)>=overhead*g.target;}
    if(g.type==='streak')return(G[g.field]||0)>=g.target;
    if(g.type==='recovery')return(G.recovery?.cleanStreak||0)>=g.target;
    return false;
  },

  _applyReward(g,G){applyStats(G,GOAL_REWARDS[g.reward]||{});},

  render(){
    const G=window.G;if(!G)return;
    const el=document.getElementById('tab-goals');if(!el)return;
    const goals=this.ensurePersonalGoals(G);
    const done=G.completedGoals||[];
    const completed=goals.filter(g=>done.includes(g.id)).length;
    const pct=goals.length?Math.round(completed/goals.length*100):0;
    const ambDef=G.ambition&&typeof LIFE_AMBITIONS!=='undefined'?LIFE_AMBITIONS.find(a=>a.id===G.ambition):null;
    let h=`<div class="nw-box"><div class="nw-lbl">🎯 Personalized Life Plan</div><div class="nw-amt" style="font-size:22px">${completed} / ${goals.length}</div><div class="prog-bar" style="margin:8px 0 5px;height:8px"><div class="prog-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--accent2))"></div></div><div class="nw-sub">Built from country, ambition, trait, age, difficulty and current pressure.</div></div>`;
    if(ambDef){
      const achieved=!!G.ambitionAchieved;
      h+=`<div style="background:var(--s2);border:1.5px solid ${achieved?'rgba(251,191,36,.5)':'rgba(124,111,255,.35)'};border-radius:14px;padding:14px;margin-bottom:14px"><div style="font-size:10px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px">🌟 Life Ambition</div><div style="display:flex;align-items:center;gap:11px"><div style="font-size:28px">${ambDef.icon}</div><div><div style="font-size:15px;font-weight:900;color:${achieved?'var(--yellow)':'var(--txt)'}">${this._esc(ambDef.name)} ${achieved?'✅':''}</div><div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:2px">${this._esc(ambDef.desc)}</div><div style="font-size:11px;color:${achieved?'var(--yellow)':'var(--accent)'};font-weight:700;margin-top:4px">${achieved?'Life ambition achieved!':'Highest legacy bonus path.'}</div></div></div></div>`;
    }
    h+=`<div class="sec">🎯 Current Goals</div>`;
    goals.forEach(g=>{
      const isDone=done.includes(g.id);
      let ready=false;try{ready=!isDone&&this._check(g,G);}catch(e){}
      const gp=isDone?100:this._progress(g,G);
      h+=`<div style="background:var(--s1);border:1.5px solid ${isDone?'rgba(74,222,128,.4)':ready?'rgba(251,191,36,.4)':'var(--b1)'};border-radius:13px;padding:13px;margin-bottom:8px;display:flex;align-items:center;gap:11px"><div style="font-size:26px">${g.icon}</div><div style="flex:1"><div style="font-size:14px;font-weight:800${isDone?';color:var(--green)':''}">${this._esc(g.name)} ${isDone?'✅':''}</div><div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:2px">${this._esc(g.desc)}</div><div class="prog-bar" style="margin:7px 0 4px;height:6px"><div class="prog-fill" style="width:${gp}%;background:${ready?'var(--yellow)':isDone?'var(--green)':'var(--accent)'}"></div></div><div style="font-size:11px;color:${isDone?'var(--green)':ready?'var(--yellow)':'var(--accent)'};font-weight:700">${isDone?'Completed':ready?'Ready to complete next age-up':`Progress ${gp}% · Reward: ${this._rewardText(g)}`}</div></div></div>`;
    });
    h+=`<div class="act-grid"><div class="card" onclick="Goals.regenerate()"><span class="ci">🔄</span><span class="cn">Recalibrate Goals</span><span class="cd">New path from current life</span></div></div>`;
    el.innerHTML=h;
  },

  tick(){
    const G=window.G;if(!G)return;
    const goals=this.ensurePersonalGoals(G);
    if(!Array.isArray(G.completedGoals))G.completedGoals=[];
    goals.forEach(g=>{
      try{
        if(!G.completedGoals.includes(g.id)&&this._check(g,G)){
          G.completedGoals.push(g.id);
          this._applyReward(g,G);
          Engine.log(`🎯 Goal Complete: "${g.name}"! Reward: ${this._rewardText(g)}`,'special');
          if(typeof UI.achievementPopup==='function')UI.achievementPopup({icon:g.icon,name:g.name,desc:`Goal Complete! ${this._rewardText(g)}`});
          G.achievements=G.achievements||{};G.achievements.first_goal=true;
          Engine.checkAch();
        }
      }catch(e){console.warn('Goal check failed',g?.id,e);}
    });
    if(G.ambition&&!G.ambitionAchieved&&typeof LIFE_AMBITIONS!=='undefined'){
      const ambDef=LIFE_AMBITIONS.find(a=>a.id===G.ambition);
      if(ambDef){try{if(ambDef.check(G)){G.ambitionAchieved=true;Engine.log(`🌟 LIFE AMBITION ACHIEVED: "${ambDef.name}"! Your life purpose is fulfilled.`,'special');if(typeof UI.achievementPopup==='function')UI.achievementPopup({icon:ambDef.icon,name:'Life Ambition!',desc:`"${ambDef.name}" - ${ambDef.desc}`});G.happiness=cl((G.happiness||50)+18);Engine.checkAch();}}catch(e){}}
    }
  },
};