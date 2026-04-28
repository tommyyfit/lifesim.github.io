/* js/goals.js — LifeSim v13.2 personalized life goals
   Upgraded goals system:
   - stronger personalized plan dashboard
   - focus goal / pin system
   - manual claim for ready goals
   - better progress detail per goal
   - goal difficulty tiers and categories
   - smarter recommendations
   - safer helpers for UI/Engine fallback
*/
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
  career:{money:7000,smarts:4,happiness:6},
  property:{money:8000,happiness:7,stress:-3},
  legacy:{happiness:12,karma:8,fame:3},
  recovery:{health:10,happiness:10,stress:-10,karma:5},
};

const GOAL_SKILLS=['coding','finance','fitness','music','cooking','writing','language','medicine','art','public_sp'];

const Goals={
  VERSION:13.2,
  RECALIBRATE_GAP:4,

  _esc(v){
    if(typeof UI!=='undefined'&&UI&&typeof UI._esc==='function')return UI._esc(v);
    return String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;', '"':'&quot;'}[c]));
  },

  _rand(min,max){
    if(typeof r==='function')return r(min,max);
    min=Math.ceil(Number(min)||0);
    max=Math.floor(Number(max)||min);
    if(max<min){const t=min;min=max;max=t;}
    return Math.floor(Math.random()*(max-min+1))+min;
  },

  _pick(arr){
    if(typeof pick==='function')return pick(arr);
    return arr[Math.floor(Math.random()*arr.length)];
  },

  _cap(v){
    if(typeof cap==='function')return cap(v);
    return String(v||'').charAt(0).toUpperCase()+String(v||'').slice(1);
  },

  _cl(v,min=0,max=100){
    if(typeof cl==='function')return cl(v,min,max);
    return Math.max(min,Math.min(max,Number(v)||0));
  },

  _toast(msg,type='neutral'){
    if(typeof UI!=='undefined'&&UI&&typeof UI.toast==='function')UI.toast(msg,type);
    else console.log('[LifeSim]',msg);
  },

  _log(msg,type='neutral'){
    if(typeof Engine!=='undefined'&&Engine&&typeof Engine.log==='function')Engine.log(msg,type);
    else console.log(`[${type}]`,msg);
  },

  _update(){
    if(typeof UI!=='undefined'&&UI&&typeof UI.update==='function')UI.update();
  },

  _checkAch(){
    if(typeof Engine!=='undefined'&&Engine&&typeof Engine.checkAch==='function')Engine.checkAch();
  },

  ensurePersonalGoals(G=window.G,force=false){
    if(!G)return[];
    this._ensureState(G);
    if(!force&&Array.isArray(G.activeGoals)&&G.activeGoals.length)return G.activeGoals;
    G.goalSeed=Number.isFinite(G.goalSeed)?G.goalSeed:this._rand(1000,999999);
    G.activeGoals=this._buildPersonalGoals(G);
    G.goalGeneratedAge=G.age||0;
    this._syncFocus(G);
    return G.activeGoals;
  },

  _ensureState(G=window.G){
    if(!G)return;
    if(!Array.isArray(G.completedGoals))G.completedGoals=[];
    if(!Array.isArray(G.goalHistory))G.goalHistory=[];
    if(!G.goalStats||typeof G.goalStats!=='object')G.goalStats={completed:0,recalibrations:0,lastCompletedAge:null,totalRewards:0};
    if(!Number.isFinite(G.goalStats.completed))G.goalStats.completed=0;
    if(!Number.isFinite(G.goalStats.recalibrations))G.goalStats.recalibrations=0;
    if(!Number.isFinite(G.goalStats.totalRewards))G.goalStats.totalRewards=0;
    if(!Number.isFinite(G.goalSeed))G.goalSeed=this._rand(1000,999999);
    if(!Number.isFinite(G.goalGeneratedAge))G.goalGeneratedAge=G.age||0;
    if(!Number.isFinite(G.lastGoalRecalibrateAge))G.lastGoalRecalibrateAge=-999;
    if(typeof G.focusGoalId!=='string')G.focusGoalId='';
  },

  _syncFocus(G){
    const goals=Array.isArray(G.activeGoals)?G.activeGoals:[];
    if(!goals.length){G.focusGoalId='';return;}
    if(G.focusGoalId&&goals.some(g=>g.id===G.focusGoalId&&!this._alreadyCompleted(G,g.id)))return;
    const best=this._recommendedGoal(G,goals);
    G.focusGoalId=best?.id||goals.find(g=>!this._alreadyCompleted(G,g.id))?.id||goals[0].id;
  },

  setFocus(id){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const goals=this.ensurePersonalGoals(G);
    const goal=goals.find(g=>g.id===id);
    if(!goal){this._toast('Goal not found.','bad');return;}
    if(this._alreadyCompleted(G,id)){this._toast('That goal is already completed.','good');return;}
    G.focusGoalId=id;
    this._toast(`🎯 Focus goal set: ${goal.name}`,'good');
    this._update();
    this.render();
  },

  regenerate(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const left=this.recalibrateCooldown(G);
    if(left>0){
      this._toast(`Goal recalibration available in ${left} year${left!==1?'s':''}.`);
      return;
    }
    G.goalSeed=this._rand(1000,999999);
    G.lastGoalRecalibrateAge=G.age||0;
    G.goalStats.recalibrations=(G.goalStats.recalibrations||0)+1;
    G.focusGoalId='';
    this.ensurePersonalGoals(G,true);
    this._log('🎯 Life goals were recalibrated around your current path.','neutral');
    this._update();this.render();
  },

  recalibrateCooldown(G=window.G){
    if(!G)return this.RECALIBRATE_GAP;
    this._ensureState(G);
    return Math.max(0,this.RECALIBRATE_GAP-((G.age||0)-(G.lastGoalRecalibrateAge||-999)));
  },

  _buildPersonalGoals(G){
    const pool=this._goalPool(G);
    const want=G.difficulty==='extreme'?8:7;
    const scored=pool
      .filter(g=>!this._alreadyCompleted(G,g.id))
      .map((g,i)=>({...g,_score:this._scoreGoal(G,g)+((G.goalSeed+i*37)%23)}))
      .sort((a,b)=>b._score-a._score);

    const picked=[],seen=new Set();
    for(const g of scored){
      const key=g.kind||g.type;
      if(seen.has(key))continue;
      picked.push(this._strip(g));seen.add(key);
      if(picked.length>=want)break;
    }
    for(const g of scored){
      if(picked.length>=want)break;
      if(!picked.some(x=>x.id===g.id))picked.push(this._strip(g));
    }
    return picked;
  },

  _strip(g){const{_score,...clean}=g;return clean;},

  _alreadyCompleted(G,id){
    return Array.isArray(G.completedGoals)&&G.completedGoals.includes(id);
  },

  _scoreGoal(G,g){
    let s=g.base||50;
    if(g.ambition===G.ambition)s+=45;
    if(g.traits?.includes(G.trait))s+=30;
    if(g.diff?.includes(G.difficulty))s+=18;
    if(g.country&&g.country(G.country||{}))s+=20;
    if(g.stat&&((G[g.stat]||0)>=55))s+=10;
    if(g.young&&G.age<30)s+=10;
    if(g.adult&&G.age>=30)s+=8;
    if(g.elder&&G.age>=60)s+=12;
    if(g.recovery&&(G.addictions?.smoking||G.addictions?.alcohol||G.addictions?.drugs||G.recovery?.active))s+=28;
    if(g.career&&G.career)s+=22;
    if(g.business&&G.business)s+=20;
    if(g.family&&((G.rels?.partner)||(G.rels?.children||[]).length))s+=16;
    if(g.debt&&((G.debtCollections||0)>0||(G.loans||[]).length))s+=20;
    if(g.social&&((G.followers||0)>5000||(G.fame||0)>15))s+=18;
    if(g.crimePressure&&((G.crimeHeat||0)>20||(G.crimes||[]).length))s+=15;
    if(g.type==='stocks'&&(G.money||0)>5000)s+=14;
    if(g.type==='skill'&&(G.skillPoints||0)>0)s+=12;
    return s;
  },

  _goalPool(G){
    const mult=G.country?.mult||1;
    const richTarget=Math.round((G.difficulty==='easy'?1500000:G.difficulty==='extreme'?180000:550000)*Math.max(0.55,Math.min(2,mult)));
    const lifeTarget=Math.max(65,Math.min(92,(G.country?.lifeExp||78)+(G.trait==='resilient'?5:0)));
    const travelTarget=G.country?.name==='United States'||G.country?.name==='Russia'?8:10;
    const chosenSkill=this._skillFocus(G);
    const skillName=this._skillName(chosenSkill);
    const salaryTarget=Math.round((G.difficulty==='easy'?95000:G.difficulty==='extreme'?42000:65000)*Math.max(0.65,Math.min(1.7,mult)));
    const cashTarget=Math.max(15000,Math.round(((G.lastLivingCosts||12000)+(G.food?.lastCost||2500)+(G.lastAssetUpkeep||0))*1.25));
    const propertyTarget=Math.round((G.difficulty==='easy'?350000:G.difficulty==='extreme'?90000:180000)*Math.max(0.55,Math.min(2,mult)));

    return[
      {id:'money_'+richTarget,kind:'money',icon:'💰',name:'Build Real Security',desc:`Reach ${fmtFull(richTarget)} net worth`,type:'networth',target:richTarget,reward:'money',ambition:'wealth',traits:['ambitious','frugal'],base:72,tier:'gold',category:'Finance'},
      {id:'cash_'+cashTarget,kind:'cash',icon:'🏦',name:'Real Safety Net',desc:`Keep ${fmtFull(cashTarget)} in cash`,type:'cash',target:cashTarget,reward:'finance',traits:['frugal','disciplined'],diff:['hard','extreme'],base:58,debt:true,tier:'silver',category:'Finance'},
      {id:'emergency_fund',kind:'money2',icon:'🧯',name:'Emergency Fund',desc:'Keep at least 1 year of living costs in cash',type:'cashReserve',target:1,reward:'finance',traits:['frugal','disciplined'],diff:['hard','extreme'],base:64,tier:'silver',category:'Finance'},
      {id:'credit_760',kind:'credit',icon:'💳',name:'Excellent Credit',desc:'Reach a 760+ credit score',type:'credit',target:760,reward:'finance',traits:['disciplined','frugal'],base:60,debt:true,tier:'silver',category:'Finance'},
      {id:'debt_free',kind:'debtfree',icon:'🧾',name:'Debt-Free Chapter',desc:'Clear all loans and collections',type:'debtFree',target:0,reward:'finance',traits:['frugal','disciplined'],diff:['hard','extreme'],base:49,debt:true,tier:'silver',category:'Finance'},

      {id:'happy_90',kind:'happiness',icon:'😊',name:'Protect Your Peace',desc:'Reach 90+ happiness',type:'stat',stat:'happiness',target:90,reward:'happiness',traits:['empath','creative','lucky','stoic'],base:56,tier:'silver',category:'Wellbeing'},
      {id:'low_stress_5',kind:'mind',icon:'🧘',name:'Calm System',desc:'Keep stress under 30 for 5 years',type:'streak',field:'lowStressStreak',target:5,reward:'happiness',traits:['stoic','disciplined'],base:54,tier:'gold',category:'Wellbeing'},
      {id:'health_'+lifeTarget,kind:'health',icon:'💪',name:'Outlive the Odds',desc:`Reach age ${lifeTarget} with 60+ health`,type:'ageHealth',target:lifeTarget,health:60,reward:'health',ambition:'healthy',traits:['athletic','resilient','naturalist'],country:c=>(c.lifeExp||80)<76,base:66,tier:'legend',category:'Wellbeing'},
      {id:'fit_85',kind:'fitness',icon:'🏋️',name:'Athletic Body',desc:'Reach 85+ fitness',type:'stat',stat:'fitness',target:85,reward:'health',ambition:'healthy',traits:['athletic','disciplined'],young:true,base:58,tier:'gold',category:'Wellbeing'},
      {id:'recovery_3',kind:'recovery',icon:'🌱',name:'Stay Clean',desc:'Hold a 3-year recovery streak',type:'recovery',target:3,reward:'recovery',recovery:true,base:40,tier:'gold',category:'Wellbeing'},

      {id:'family_2',kind:'family',icon:'👨‍👩‍👧',name:'A Warm Home',desc:'Have a serious partner and 2 children',type:'family',children:2,reward:'family',ambition:'family',traits:['empath','charming'],base:55,family:true,tier:'gold',category:'Family'},
      {id:'relationship_80',kind:'relationship',icon:'💞',name:'Deep Bond',desc:'Have a partner with 80+ intimacy',type:'relationship',target:80,reward:'family',ambition:'family',traits:['empath','charming'],base:47,family:true,tier:'silver',category:'Family'},
      {id:'parent_present',kind:'parenting',icon:'🧸',name:'Present Parent',desc:'Have children and keep happiness 70+',type:'parentHappy',target:70,reward:'legacy',ambition:'family',traits:['empath','disciplined'],base:44,family:true,tier:'silver',category:'Family'},

      {id:'career_'+salaryTarget,kind:'career',icon:'💼',name:'Career Momentum',desc:`Earn ${fmtFull(sc(salaryTarget))}/yr salary`,type:'careerSalary',target:salaryTarget,reward:'career',ambition:'career',traits:['ambitious','disciplined'],base:60,career:true,tier:'gold',category:'Career'},
      {id:'job_perf_85',kind:'career2',icon:'📈',name:'Trusted Professional',desc:'Reach 85+ job performance',type:'jobPerf',target:85,reward:'career',traits:['disciplined','ambitious'],base:45,career:true,tier:'silver',category:'Career'},
      {id:'degree_80',kind:'education',icon:'🎓',name:'Serious Education',desc:'Graduate university with 80+ smarts',type:'educationSmart',target:80,reward:'smarts',ambition:'academic',traits:['intellectual','scholar'],young:true,base:59,tier:'gold',category:'Career'},

      {id:'fame_50',kind:'fame',icon:'⭐',name:'Public Name',desc:'Reach 50 fame',type:'stat',stat:'fame',target:50,reward:'fame',ambition:'fame',traits:['charming','creative','visionary'],base:50,social:true,tier:'gold',category:'Fame'},
      {id:'followers_100k',kind:'social',icon:'📱',name:'Real Audience',desc:'Reach 100K followers',type:'followers',target:100000,reward:'fame',ambition:'fame',traits:['charming','creative','visionary'],base:43,social:true,tier:'legend',category:'Fame'},

      {id:'business_250k',kind:'business',icon:'🏢',name:'Local Empire',desc:'Build a business worth $250K+',type:'businessValue',target:250000,reward:'business',ambition:'entrepreneur',traits:['ambitious','visionary'],base:55,business:true,tier:'gold',category:'Business'},
      {id:'business_profit_50k',kind:'business2',icon:'💵',name:'Profitable Operator',desc:'Earn $50K+ yearly business profit',type:'businessProfit',target:50000,reward:'business',ambition:'entrepreneur',traits:['ambitious','visionary'],base:46,business:true,tier:'gold',category:'Business'},

      {id:'property_'+propertyTarget,kind:'property',icon:'🏠',name:'Own Something Real',desc:`Own property worth ${fmtFull(sc(propertyTarget))}+`,type:'propertyValue',target:sc(propertyTarget),reward:'property',ambition:'wealth',traits:['frugal','ambitious'],adult:true,base:46,tier:'gold',category:'Assets'},
      {id:'rental_income_20k',kind:'rental',icon:'🏘️',name:'Rental Cashflow',desc:'Earn $20K+ yearly rental income',type:'rentalIncome',target:20000,reward:'property',ambition:'investor',traits:['frugal','ambitious'],adult:true,base:39,tier:'gold',category:'Assets'},

      {id:'travel_'+travelTarget,kind:'travel',icon:'🌍',name:'See Beyond Home',desc:`Visit ${travelTarget} countries`,type:'travel',target:travelTarget,reward:'travel',ambition:'traveller',traits:['curious','charming'],base:51,tier:'silver',category:'Lifestyle'},
      {id:'skill_'+chosenSkill,kind:'skill',icon:'🎯',name:`Master ${skillName}`,desc:`Reach level 4 in ${skillName}`,type:'skill',skill:chosenSkill,target:4,reward:'skill',ambition:'sage',traits:['scholar','disciplined','intellectual'],base:64,tier:'gold',category:'Skills'},
      {id:'stocks_100k',kind:'invest',icon:'📈',name:'Investor Brain',desc:'Build a stock portfolio worth $100K+',type:'stocks',target:100000,reward:'finance',ambition:'investor',traits:['frugal','intellectual'],adult:true,base:57,tier:'gold',category:'Finance'},

      {id:'clean_40',kind:'law',icon:'⚖️',name:'Clean Reputation',desc:'Reach age 40 with no criminal record',type:'cleanAge',target:40,reward:'happiness',traits:['disciplined','empath'],base:48,tier:'gold',category:'Legacy'},
      {id:'reformed_record',kind:'reform',icon:'🕊️',name:'Rebuilt Reputation',desc:'Reach 70+ reform score after crime pressure',type:'reformScore',target:70,reward:'recovery',traits:['disciplined','empath'],base:35,crimePressure:true,tier:'gold',category:'Legacy'},
      {id:'crime_5',kind:'crime',icon:'😈',name:'Underworld Run',desc:'Commit 5 crimes and stay out of prison',type:'crimeCount',target:5,reward:'crime',ambition:'criminal',country:c=>(c.crimeRate||0)>0.35,base:30,tier:'silver',category:'Crime'},
    ];
  },

  _skillFocus(G){
    if(G.ambition==='investor')return'finance';
    if(G.ambition==='healthy')return'fitness';
    if(G.ambition==='fame')return'public_sp';
    if(G.ambition==='academic')return'medicine';
    if(G.ambition==='entrepreneur')return this._pick(['finance','public_sp','coding']);
    if(G.trait==='creative')return this._pick(['music','writing','art']);
    if(G.trait==='athletic'||G.trait==='naturalist')return'fitness';
    if(G.trait==='intellectual'||G.trait==='scholar')return this._pick(['coding','medicine','language']);
    return GOAL_SKILLS[(G.goalSeed||0)%GOAL_SKILLS.length];
  },

  _skillName(id){
    if(typeof SKILL_DEFS!=='undefined'){const s=SKILL_DEFS.find(x=>x.id===id);if(s)return s.name;}
    return this._cap(String(id||'skill').replace('_',' '));
  },

  _rewardText(g){
    const reward=GOAL_REWARDS[g.reward]||{};
    return Object.entries(reward).map(([k,v])=>{
      if(k==='money')return`+${fmt(v)}`;
      if(k==='skillPoints')return`+${v} Skill Point${v!==1?'s':''}`;
      if(k==='karma')return`${v>0?'+':''}${v} Karma`;
      if(k==='stress')return`${v>0?'+':''}${v} Stress`;
      return`+${v} ${this._cap(k)}`;
    }).join(', ');
  },

  _rewardValue(g){
    const reward=GOAL_REWARDS[g.reward]||{};
    let value=0;
    Object.entries(reward).forEach(([k,v])=>{
      if(k==='money')value+=Math.max(0,v);
      else if(k==='skillPoints')value+=v*4500;
      else value+=Math.abs(v)*500;
    });
    return value;
  },

  _tier(g){
    const t=g.tier||'silver';
    const map={
      bronze:{label:'Bronze',icon:'🥉',color:'var(--muted)'},
      silver:{label:'Silver',icon:'🥈',color:'var(--cyan)'},
      gold:{label:'Gold',icon:'🥇',color:'var(--yellow)'},
      legend:{label:'Legacy',icon:'👑',color:'var(--accent)'},
    };
    return map[t]||map.silver;
  },

  _progress(g,G){
    return this._progressInfo(g,G).pct;
  },

  _fmtNum(v){
    return Number.isFinite(Number(v))?Math.round(Number(v)).toLocaleString():'0';
  },

  _progressInfo(g,G){
    const pct=(n,d)=>d>0?Math.min(100,Math.max(0,Math.round((n/d)*100))):0;
    const money=v=>typeof fmtFull==='function'?fmtFull(Math.round(v||0)):this._fmtNum(v);
    const count=(n,d,label='')=>({current:n||0,target:d||0,label:`${this._fmtNum(n||0)} / ${this._fmtNum(d||0)}${label?` ${label}`:''}`,pct:pct(n||0,d||0)});

    if(g.type==='networth')return{...count(netWorth(G),g.target),hint:'Increase income, assets, business value, or investments.'};
    if(g.type==='cash')return{current:G.money||0,target:g.target,label:`${money(G.money||0)} / ${money(g.target)}`,pct:pct(G.money||0,g.target),hint:'Keep more cash after yearly costs.'};
    if(g.type==='credit')return{current:G.creditScore||300,target:g.target,label:`${this._fmtNum(G.creditScore||300)} / ${g.target}`,pct:Math.min(100,Math.max(0,Math.round(((G.creditScore||300)-300)/(g.target-300)*100))),hint:'Avoid collections and manage loans responsibly.'};
    if(g.type==='debtFree'){
      const debt=this._totalDebt(G);
      const denom=Math.max(1,Math.abs(netWorth(G))+debt);
      return{current:Math.max(0,denom-debt),target:denom,label:debt<=0?'Debt cleared':`${money(debt)} debt left`,pct:debt<=0?100:Math.max(0,100-Math.min(100,Math.round(debt/denom*100))),hint:'Pay off loans and collections.'};
    }
    if(g.type==='stat')return{...count(G[g.stat]||0,g.target),hint:`Improve ${this._cap(g.stat)} through actions and life choices.`};
    if(g.type==='ageHealth'){
      const agePart=Math.min(70,Math.round(((G.age||0)/g.target)*70));
      const healthPart=(G.health||0)>=g.health?30:Math.round(((G.health||0)/g.health)*30);
      return{current:G.age||0,target:g.target,label:`Age ${G.age||0}/${g.target} · Health ${Math.round(G.health||0)}/${g.health}`,pct:Math.min(100,agePart+healthPart),hint:'Protect health while surviving into later life.'};
    }
    if(g.type==='family'){
      const partner=!!G.rels?.partner&&(['serious','engaged','married'].includes(G.rels.partner.stage)||G.rels.partner.married);
      const kids=(G.rels?.children||[]).length;
      return{current:kids,target:g.children,label:`${partner?'Partner ready':'Need serious partner'} · ${kids}/${g.children} kids`,pct:Math.min(100,Math.round((partner?50:0)+(kids/g.children)*50)),hint:'Build a stable relationship and grow your family.'};
    }
    if(g.type==='relationship')return{...count(G.rels?.partner?.intimacy||0,g.target),hint:'Spend time with your partner and avoid relationship damage.'};
    if(g.type==='parentHappy')return{current:G.happiness||0,target:g.target,label:(G.rels?.children||[]).length?`${Math.round(G.happiness||0)} / ${g.target} happiness`:'Need children first',pct:(G.rels?.children||[]).length?pct(G.happiness||0,g.target):0,hint:'Be present as a parent and protect happiness.'};
    if(g.type==='businessValue')return{current:G.business?.value||0,target:g.target,label:`${money(G.business?.value||0)} / ${money(g.target)}`,pct:pct(G.business?.value||0,g.target),hint:'Grow revenue, margins, and business value.'};
    if(g.type==='businessProfit'){
      const profit=Math.max(0,(G.business?.revenue||0)-(G.business?.expenses||0));
      return{current:profit,target:g.target,label:`${money(profit)} / ${money(g.target)} profit`,pct:pct(profit,g.target),hint:'Scale business profit above expenses.'};
    }
    if(g.type==='educationSmart')return{current:G.smarts||0,target:g.target,label:`${G.education==='university'?'University done':'Need university'} · Smarts ${Math.round(G.smarts||0)}/${g.target}`,pct:Math.min(100,Math.round((G.education==='university'?55:0)+((G.smarts||0)/g.target)*45)),hint:'Graduate and keep building smarts.'};
    if(g.type==='careerSalary')return{current:G.career?.salary||0,target:g.target,label:`${money(sc(G.career?.salary||0))} / ${money(sc(g.target))}/yr`,pct:pct(G.career?.salary||0,g.target),hint:'Promotions and better jobs move this goal.'};
    if(g.type==='jobPerf')return{...count(G.jobPerf||0,g.target),hint:'Work harder, reduce stress, and improve career skills.'};
    if(g.type==='followers')return{current:G.followers||0,target:g.target,label:`${typeof fmtFollowers==='function'?fmtFollowers(G.followers||0):this._fmtNum(G.followers||0)} / ${typeof fmtFollowers==='function'?fmtFollowers(g.target):this._fmtNum(g.target)}`,pct:pct(G.followers||0,g.target),hint:'Use Social actions to grow an audience.'};
    if(g.type==='propertyValue'){
      const value=(G.assets?.properties||[]).reduce((a,p)=>a+(p.value||0),0);
      return{current:value,target:g.target,label:`${money(value)} / ${money(g.target)}`,pct:pct(value,g.target),hint:'Buy or upgrade property assets.'};
    }
    if(g.type==='rentalIncome'){
      const rent=(G.assets?.properties||[]).reduce((a,p)=>a+(p.rent||0),0);
      return{current:rent,target:g.target,label:`${money(rent)} / ${money(g.target)}/yr`,pct:pct(rent,g.target),hint:'Own rental property with positive cashflow.'};
    }
    if(g.type==='travel')return{...count((G.countriesVisited||[]).length,g.target,'countries'),hint:'Travel more when money and health allow it.'};
    if(g.type==='skill')return{...count(G.skills?.[g.skill]||0,g.target,'levels'),hint:`Train ${this._skillName(g.skill)} in the Skills tab.`};
    if(g.type==='stocks'){
      const val=typeof Stocks!=='undefined'&&Stocks.portfolioValue?Stocks.portfolioValue():0;
      return{current:val,target:g.target,label:`${money(val)} / ${money(g.target)}`,pct:pct(val,g.target),hint:'Build your portfolio over time.'};
    }
    if(g.type==='cleanAge')return{current:G.age||0,target:g.target,label:G.crimes?.length?'Criminal record detected':`Age ${G.age||0}/${g.target} clean`,pct:G.crimes?.length?0:pct(G.age,g.target),hint:'Avoid crime until the target age.'};
    if(g.type==='crimeCount')return{...count(G.crimesCommitted||0,g.target,'crimes'),hint:'Criminal path goal — risk prison.'};
    if(g.type==='reformScore')return{...count(G.reformScore||0,g.target),hint:'Reform after crime pressure and rebuild trust.'};
    if(g.type==='cashReserve'){
      const overhead=(G.lastLivingCosts||0)+(G.food?.lastCost||0)+(G.lastAssetUpkeep||0);
      const target=overhead*g.target;
      return{current:G.money||0,target,label:overhead?`${money(G.money||0)} / ${money(target)} reserve`:'Need living cost data',pct:overhead?Math.min(100,Math.round(((G.money||0)/Math.max(1,target))*100)):0,hint:'Keep enough cash to survive one full year.'};
    }
    if(g.type==='streak')return{...count(G[g.field]||0,g.target,'years'),hint:'Maintain the streak across age-ups.'};
    if(g.type==='recovery')return{...count(G.recovery?.cleanStreak||0,g.target,'years'),hint:'Stay clean and avoid relapse.'};
    return{current:0,target:1,label:'No progress data',pct:0,hint:'Keep progressing through life.'};
  },

  _check(g,G){
    if(g.type==='networth')return netWorth(G)>=g.target;
    if(g.type==='cash')return(G.money||0)>=g.target;
    if(g.type==='credit')return(G.creditScore||0)>=g.target;
    if(g.type==='debtFree')return this._totalDebt(G)<=0&&G.age>=18;
    if(g.type==='stat')return(G[g.stat]||0)>=g.target;
    if(g.type==='ageHealth')return G.age>=g.target&&G.health>=g.health;
    if(g.type==='family')return!!G.rels?.partner&&(['serious','engaged','married'].includes(G.rels.partner.stage)||G.rels.partner.married)&&(G.rels.children||[]).length>=g.children;
    if(g.type==='relationship')return(G.rels?.partner?.intimacy||0)>=g.target;
    if(g.type==='parentHappy')return(G.rels?.children||[]).length>0&&(G.happiness||0)>=g.target;
    if(g.type==='businessValue')return(G.business?.value||0)>=g.target;
    if(g.type==='businessProfit')return Math.max(0,(G.business?.revenue||0)-(G.business?.expenses||0))>=g.target;
    if(g.type==='educationSmart')return G.education==='university'&&(G.smarts||0)>=g.target;
    if(g.type==='careerSalary')return(G.career?.salary||0)>=g.target;
    if(g.type==='jobPerf')return(G.jobPerf||0)>=g.target;
    if(g.type==='followers')return(G.followers||0)>=g.target;
    if(g.type==='propertyValue')return(G.assets?.properties||[]).reduce((a,p)=>a+(p.value||0),0)>=g.target;
    if(g.type==='rentalIncome')return(G.assets?.properties||[]).reduce((a,p)=>a+(p.rent||0),0)>=g.target;
    if(g.type==='travel')return(G.countriesVisited||[]).length>=g.target;
    if(g.type==='skill')return(G.skills?.[g.skill]||0)>=g.target;
    if(g.type==='stocks')return typeof Stocks!=='undefined'&&Stocks.portfolioValue()>=g.target;
    if(g.type==='cleanAge')return G.age>=g.target&&(!G.crimes||G.crimes.length===0);
    if(g.type==='crimeCount')return(G.crimesCommitted||0)>=g.target&&!G.inPrison;
    if(g.type==='reformScore')return(G.reformScore||0)>=g.target;
    if(g.type==='cashReserve'){const overhead=(G.lastLivingCosts||0)+(G.food?.lastCost||0)+(G.lastAssetUpkeep||0);return overhead>0&&(G.money||0)>=overhead*g.target;}
    if(g.type==='streak')return(G[g.field]||0)>=g.target;
    if(g.type==='recovery')return(G.recovery?.cleanStreak||0)>=g.target;
    return false;
  },

  _totalDebt(G){
    return (G.loans||[]).reduce((a,l)=>a+(l.remaining||0),0)+(G.debtCollections||0);
  },

  _applyReward(g,G){
    const reward=GOAL_REWARDS[g.reward]||{};
    if(typeof applyStats==='function')applyStats(G,reward);
    else{
      Object.entries(reward).forEach(([k,v])=>{
        if(k==='skillPoints')return;
        G[k]=(G[k]||0)+v;
        if(['happiness','health','smarts','looks','fitness','stress','fame'].includes(k))G[k]=this._cl(G[k]);
        if(k==='karma')G[k]=this._cl(G[k],-100,100);
      });
    }
    if(reward.skillPoints){
      G.skillPoints=(G.skillPoints||0)+reward.skillPoints;
    }
    G.goalStats.totalRewards=(G.goalStats.totalRewards||0)+this._rewardValue(g);
  },

  _recommendedGoal(G,goals){
    const open=(goals||[]).filter(g=>!this._alreadyCompleted(G,g.id));
    if(!open.length)return null;
    return open
      .map(g=>{
        const info=this._progressInfo(g,G);
        let score=info.pct;
        if(g.id===G.focusGoalId)score+=12;
        if(info.pct>=70)score+=24;
        if(info.pct>=40)score+=8;
        if(g.ambition===G.ambition)score+=14;
        if(g.type==='stat'&&G[g.stat]>=g.target-10)score+=18;
        if(g.type==='skill'&&(G.skillPoints||0)>0)score+=10;
        if(g.type==='cash'&&this._totalDebt(G)>0)score+=8;
        return{g,score};
      })
      .sort((a,b)=>b.score-a.score)[0]?.g||open[0];
  },

  _planStatus(G,goals){
    const done=G.completedGoals||[];
    const total=goals.length||0;
    const completed=goals.filter(g=>done.includes(g.id)).length;
    const pct=total?Math.round(completed/total*100):0;
    const avg=total?Math.round(goals.reduce((s,g)=>s+(done.includes(g.id)?100:this._progress(g,G)),0)/total):0;
    const ready=goals.filter(g=>!done.includes(g.id)&&this._safeCheck(g,G)).length;
    return{total,completed,pct,avg,ready};
  },

  _safeCheck(g,G){
    try{return this._check(g,G);}catch(e){return false;}
  },

  _goalColor(g,done,ready,pct){
    if(done)return'var(--green)';
    if(ready)return'var(--yellow)';
    if(pct>=70)return'var(--accent)';
    if(pct>=35)return'var(--cyan)';
    return'var(--muted)';
  },

  _goalDifficultyLabel(g){
    const t=this._tier(g);
    return`${t.icon} ${t.label}`;
  },

  _actionHint(g,G){
    const info=this._progressInfo(g,G);
    if(this._safeCheck(g,G))return'Claim it now.';
    if(g.type==='cash'||g.type==='networth'||g.type==='cashReserve')return'Save money, raise income, or reduce yearly costs.';
    if(g.type==='careerSalary'||g.type==='jobPerf'||g.type==='educationSmart')return'Use Career, Education, or Skills to move this forward.';
    if(g.type==='followers'||g.type==='stat'&&g.stat==='fame')return'Use Social or Fame-building actions.';
    if(g.type==='stocks')return'Buy shares and let the market compound.';
    if(g.type==='skill')return`Train ${this._skillName(g.skill)}.`;
    if(g.type==='relationship'||g.type==='family'||g.type==='parentHappy')return'Use relationship and family actions.';
    if(g.type==='propertyValue'||g.type==='rentalIncome')return'Use Assets to buy or rent property.';
    if(g.type==='businessValue'||g.type==='businessProfit')return'Grow your business revenue and value.';
    if(g.type==='streak'||g.type==='recovery')return'Protect the streak through yearly age-ups.';
    return info.hint||'Keep progressing.';
  },

  claim(id){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const goals=this.ensurePersonalGoals(G);
    const g=goals.find(x=>x.id===id);
    if(!g){this._toast('Goal not found.','bad');return;}
    if(G.completedGoals.includes(g.id)){this._toast('Already completed.','good');return;}
    if(!this._safeCheck(g,G)){this._toast('Goal is not ready yet.','neutral');return;}
    this._completeGoal(g,G,true);
    this._update();
    this.render();
  },

  _completeGoal(g,G,manual=false){
    if(!G.completedGoals.includes(g.id))G.completedGoals.push(g.id);
    this._applyReward(g,G);
    this._recordCompletion(g);
    this._log(`🎯 Goal Complete: "${g.name}"! Reward: ${this._rewardText(g)}`,'special');
    if(typeof UI!=='undefined'&&UI&&typeof UI.achievementPopup==='function')UI.achievementPopup({icon:g.icon,name:g.name,desc:`Goal Complete! ${this._rewardText(g)}`});
    G.achievements=G.achievements||{};
    G.achievements.first_goal=true;
    if((G.completedGoals||[]).length>=5)G.achievements.goal_grinder=true;
    if((G.completedGoals||[]).length>=8)G.achievements.life_planner=true;
    this._checkAch();
    if(manual)this._toast(`🎯 Claimed: ${g.name}`,'ach',3500);
    this._syncFocus(G);
  },

  render(){
    const G=window.G;if(!G)return;
    const el=document.getElementById('tab-goals');if(!el)return;
    const goals=this.ensurePersonalGoals(G);
    const done=G.completedGoals||[];
    const status=this._planStatus(G,goals);
    const ambDef=G.ambition&&typeof LIFE_AMBITIONS!=='undefined'?LIFE_AMBITIONS.find(a=>a.id===G.ambition):null;
    const cooldown=this.recalibrateCooldown(G);
    const recommended=this._recommendedGoal(G,goals);
    const focus=goals.find(g=>g.id===G.focusGoalId&&!done.includes(g.id))||recommended;
    const focusInfo=focus?this._progressInfo(focus,G):null;
    const focusReady=focus?this._safeCheck(focus,G):false;
    const ageGap=Math.max(0,(G.age||0)-(G.goalGeneratedAge||0));

    let h=`<div class="nw-box" style="position:relative;overflow:hidden">
      <div style="position:absolute;right:-45px;top:-55px;width:160px;height:160px;border-radius:50%;background:var(--accent)18;filter:blur(10px);pointer-events:none"></div>
      <div class="nw-lbl">🎯 Personalized Life Plan</div>
      <div class="nw-amt" style="font-size:24px;color:${status.pct>=70?'var(--green)':status.pct>=35?'var(--yellow)':'var(--accent)'}">${status.completed} / ${status.total}</div>
      <div class="prog-bar" style="margin:8px 0 5px;height:9px"><div class="prog-fill" style="width:${status.pct}%;background:linear-gradient(90deg,var(--accent),var(--accent2))"></div></div>
      <div class="nw-sub">${status.pct}% completed · ${status.avg}% average progress · ${status.ready} ready to claim · plan age ${ageGap} yr</div>
    </div>`;

    if(focus){
      const tier=this._tier(focus);
      const focusColor=this._goalColor(focus,false,focusReady,focusInfo.pct);
      h+=`<div style="background:linear-gradient(135deg,${focusColor}18,rgba(255,255,255,.035));border:1.5px solid ${focusColor}55;border-radius:16px;padding:14px;margin-bottom:12px;box-shadow:0 16px 34px rgba(0,0,0,.16)">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:10px">
          <div style="display:flex;gap:11px;align-items:center;min-width:0">
            <div style="font-size:30px;width:42px;height:42px;border-radius:14px;background:${focusColor}18;display:flex;align-items:center;justify-content:center;flex-shrink:0">${this._esc(focus.icon)}</div>
            <div style="min-width:0">
              <div style="font-size:10px;font-weight:950;color:${focusColor};text-transform:uppercase;letter-spacing:1px">Focused Goal · ${this._esc(tier.icon)} ${this._esc(tier.label)} · ${this._esc(focus.category||'Life')}</div>
              <div style="font-size:16px;font-weight:950;color:var(--txt);line-height:1.15">${this._esc(focus.name)}</div>
              <div style="font-size:11px;color:var(--muted);font-weight:700;margin-top:2px">${this._esc(focus.desc)}</div>
            </div>
          </div>
          <button type="button" class="btn-primary btn-sm" style="width:auto;white-space:nowrap;background:${focusReady?'linear-gradient(135deg,var(--yellow),var(--accent))':'var(--s2)'};border-color:${focusColor}66;color:${focusReady?'#130f22':focusColor}" onclick="${focusReady?`Goals.claim('${focus.id}')`:`UI.toast('${this._esc(this._actionHint(focus,G)).replace(/'/g,"\\'")}')`}">${focusReady?'Claim Reward':'What next?'}</button>
        </div>
        <div class="prog-bar" style="height:8px;margin-bottom:6px"><div class="prog-fill" style="width:${focusInfo.pct}%;background:${focusColor}"></div></div>
        <div style="display:flex;justify-content:space-between;gap:8px;font-size:11px;font-weight:800;color:var(--muted)"><span>${this._esc(focusInfo.label)}</span><span style="color:${focusColor}">${focusInfo.pct}%</span></div>
      </div>`;
    }

    if(ambDef){
      const achieved=!!G.ambitionAchieved;
      h+=`<div style="background:var(--s2);border:1.5px solid ${achieved?'rgba(251,191,36,.5)':'rgba(124,111,255,.35)'};border-radius:14px;padding:14px;margin-bottom:14px"><div style="font-size:10px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px">🌟 Life Ambition</div><div style="display:flex;align-items:center;gap:11px"><div style="font-size:28px">${ambDef.icon}</div><div><div style="font-size:15px;font-weight:900;color:${achieved?'var(--yellow)':'var(--txt)'}">${this._esc(ambDef.name)} ${achieved?'✅':''}</div><div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:2px">${this._esc(ambDef.desc)}</div><div style="font-size:11px;color:${achieved?'var(--yellow)':'var(--accent)'};font-weight:700;margin-top:4px">${achieved?'Life ambition achieved!':'Highest legacy bonus path.'}</div></div></div></div>`;
    }

    h+=`<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">
      ${this._metricBox('Goal Progress',`${status.pct}%`,`${status.completed} completed`,status.pct>=70?'var(--green)':status.pct>=35?'var(--yellow)':'var(--accent)')}
      ${this._metricBox('Avg Progress',`${status.avg}%`,`${status.ready} ready`,status.avg>=70?'var(--green)':status.avg>=35?'var(--yellow)':'var(--cyan)')}
      ${this._metricBox('Recalibration',cooldown?`${cooldown} yr`:'Ready',cooldown?'Age up to refresh':'Can generate a new plan',cooldown?'var(--muted)':'var(--green)')}
      ${this._metricBox('Rewards Earned',fmt(G.goalStats?.totalRewards||0),`${G.goalStats?.completed||0} lifetime goals`,'var(--yellow)')}
    </div>`;

    h+=this._categorySummary(goals,G);

    h+=`<div class="sec">🎯 Current Goals</div>`;

    goals
      .slice()
      .sort((a,b)=>{
        const ad=done.includes(a.id),bd=done.includes(b.id);
        const ar=this._safeCheck(a,G),br=this._safeCheck(b,G);
        if(ar!==br)return ar?-1:1;
        if(ad!==bd)return ad?1:-1;
        if(a.id===G.focusGoalId)return-1;
        if(b.id===G.focusGoalId)return 1;
        return this._progress(b,G)-this._progress(a,G);
      })
      .forEach(g=>{
        const isDone=done.includes(g.id);
        const ready=!isDone&&this._safeCheck(g,G);
        const info=this._progressInfo(g,G);
        const gp=isDone?100:info.pct;
        const col=this._goalColor(g,isDone,ready,gp);
        const tier=this._tier(g);
        const focused=G.focusGoalId===g.id&&!isDone;
        const action=ready?`Goals.claim('${g.id}')`:isDone?`UI.toast('Goal already completed.','good')`:`Goals.setFocus('${g.id}')`;
        const actionText=ready?'Claim':isDone?'Done':focused?'Focused':'Focus';
        const actionIcon=ready?'🎁':isDone?'✅':focused?'📌':'🎯';

        h+=`<div style="background:${focused?`${col}10`:'var(--s1)'};border:1.5px solid ${isDone?'rgba(74,222,128,.45)':ready?'rgba(251,191,36,.5)':focused?`${col}66`:'var(--b1)'};border-radius:14px;padding:13px;margin-bottom:8px;display:flex;align-items:center;gap:11px;box-shadow:${focused?'0 12px 28px rgba(0,0,0,.18)':'none'}">
          <div style="font-size:25px;width:38px;height:38px;border-radius:13px;background:${col}14;display:flex;align-items:center;justify-content:center;flex-shrink:0">${this._esc(g.icon)}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:2px">
              <div style="font-size:14px;font-weight:900;color:${isDone?'var(--green)':'var(--txt)'}">${this._esc(g.name)} ${isDone?'✅':''}</div>
              ${focused?'<span class="badge badge-a">📌 Focus</span>':''}
              <span class="badge" style="border-color:${tier.color}55;color:${tier.color};background:${tier.color}12">${this._esc(tier.icon)} ${this._esc(tier.label)}</span>
              <span class="badge" style="color:var(--muted)">${this._esc(g.category||'Life')}</span>
            </div>
            <div style="font-size:11px;color:var(--muted);font-weight:650;margin-top:2px">${this._esc(g.desc)}</div>
            <div class="prog-bar" style="margin:7px 0 4px;height:7px"><div class="prog-fill" style="width:${gp}%;background:${col}"></div></div>
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:11px;font-weight:800;color:var(--muted)">
              <span>${isDone?'Completed':this._esc(info.label)}</span>
              <span style="color:${col}">${isDone?'Reward claimed':ready?'Ready to claim':`Progress ${gp}%`}</span>
            </div>
            <div style="font-size:10px;color:var(--muted);font-weight:700;margin-top:5px">Reward: <span style="color:var(--yellow)">${this._esc(this._rewardText(g))}</span> · ${this._esc(this._actionHint(g,G))}</div>
          </div>
          <button type="button" class="btn-primary btn-sm" style="width:auto;padding:7px 10px;font-size:10px;white-space:nowrap;background:${ready?'linear-gradient(135deg,var(--yellow),var(--accent))':'var(--s2)'};border-color:${col}55;color:${ready?'#160f22':col}" onclick="${action}">${actionIcon} ${actionText}</button>
        </div>`;
      });

    const recalibrateAction=cooldown
      ? "UI.toast('Goal recalibration is still cooling down.')"
      : "Goals.regenerate()";

    h+=`<div class="act-grid"><div class="card ${cooldown?'locked':''}" onclick="${recalibrateAction}"><span class="ci">${cooldown?'🔒':'🔄'}</span><span class="cn">Recalibrate Goals</span><span class="cd">${cooldown?`Available in ${cooldown} year${cooldown!==1?'s':''}`:'New path from current life'}</span></div></div>`;

    if((G.goalHistory||[]).length){
      h+=`<div class="sec">🏆 Recent Goal History</div>`;
      (G.goalHistory||[]).slice(0,6).forEach(row=>{
        h+=`<div class="row-card"><span class="ri">${this._esc(row.icon||'🎯')}</span><div class="rd"><div class="rt">Age ${row.age} · ${this._esc(row.name)}</div><div class="rs">${this._esc(row.reward||'Goal completed')}</div></div><div class="rv">Done</div></div>`;
      });
    }

    el.innerHTML=h;
  },

  _categorySummary(goals,G){
    if(!goals.length)return'';
    const done=G.completedGoals||[];
    const map={};
    goals.forEach(g=>{
      const key=g.category||'Life';
      if(!map[key])map[key]={count:0,done:0,avg:0};
      map[key].count++;
      if(done.includes(g.id))map[key].done++;
      map[key].avg+=done.includes(g.id)?100:this._progress(g,G);
    });
    const rows=Object.entries(map).map(([name,x])=>{
      const avg=Math.round(x.avg/Math.max(1,x.count));
      const color=avg>=70?'var(--green)':avg>=35?'var(--yellow)':'var(--accent)';
      return`<div style="background:var(--s1);border:1.5px solid var(--b1);border-radius:12px;padding:9px 10px">
        <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px"><span style="font-size:11px;font-weight:900;color:var(--txt)">${this._esc(name)}</span><span style="font-size:11px;font-weight:900;color:${color}">${x.done}/${x.count}</span></div>
        <div class="prog-bar" style="height:6px"><div class="prog-fill" style="width:${avg}%;background:${color}"></div></div>
      </div>`;
    }).join('');
    return`<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">${rows}</div>`;
  },

  _metricBox(label,value,sub,color){
    return`<div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">${this._esc(label)}</div><div class="nw-amt" style="font-size:22px${color?`;color:${color}`:''}">${this._esc(value)}</div><div class="nw-sub">${this._esc(sub)}</div></div>`;
  },

  _recordCompletion(g){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const reward=this._rewardText(g);
    G.goalHistory.unshift({age:G.age||0,id:g.id,name:g.name,icon:g.icon,reward});
    if(G.goalHistory.length>16)G.goalHistory.length=16;
    G.goalStats.completed=(G.goalStats.completed||0)+1;
    G.goalStats.lastCompletedAge=G.age||0;
  },

  tick(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const goals=this.ensurePersonalGoals(G);
    if(!Array.isArray(G.completedGoals))G.completedGoals=[];

    goals.forEach(g=>{
      try{
        if(!G.completedGoals.includes(g.id)&&this._check(g,G)){
          this._completeGoal(g,G,false);
        }
      }catch(e){
        console.warn('Goal check failed',g?.id,e);
      }
    });

    if(G.ambition&&!G.ambitionAchieved&&typeof LIFE_AMBITIONS!=='undefined'){
      const ambDef=LIFE_AMBITIONS.find(a=>a.id===G.ambition);
      if(ambDef){
        try{
          if(ambDef.check(G)){
            G.ambitionAchieved=true;
            this._log(`🌟 LIFE AMBITION ACHIEVED: "${ambDef.name}"! Your life purpose is fulfilled.`,'special');
            if(typeof UI!=='undefined'&&UI&&typeof UI.achievementPopup==='function')UI.achievementPopup({icon:ambDef.icon,name:'Life Ambition!',desc:`"${ambDef.name}" - ${ambDef.desc}`});
            G.happiness=this._cl((G.happiness||50)+18);
            this._checkAch();
          }
        }catch(e){}
      }
    }

    this._syncFocus(G);
  },
};