/* js/crime.js — LifeSim v13: Consequences & Redemption */
const CRIME_JOBS={
  shoplift:{tier:'Petty',icon:'🛍️',label:'Shoplifting',reward:[40,450],catch:.14,sentence:[0,1],need:null,heat:4,karma:[1,3],prep:'Low',minAge:16,rep:1,stress:1,desc:'Small theft with low payout and low heat.'},
  pickpocket:{tier:'Petty',icon:'👛',label:'Pickpocketing',reward:[60,650],catch:.19,sentence:[0,1],need:null,heat:6,karma:[2,4],prep:'Low',minAge:16,rep:2,stress:2,desc:'Fast cash, but crowded places mean witnesses.'},
  vandalism:{tier:'Petty',icon:'🎨',label:'Vandalism',reward:[0,120],catch:.16,sentence:[0,1],need:null,heat:5,karma:[1,3],prep:'Low',minAge:16,rep:1,stress:1,desc:'Mostly thrill-seeking. Low money, real consequences.'},
  street_race:{tier:'Petty',icon:'🏁',label:'Illegal Street Race',reward:[250,2000],catch:.22,sentence:[0,2],need:'fitness',heat:8,karma:[2,5],prep:'Medium',minAge:16,rep:3,stress:3,desc:'Fitness helps under pressure. Crashes can hurt.'},

  scam:{tier:'Fraud',icon:'📧',label:'Online Scam',reward:[500,5000],catch:.24,sentence:[1,3],need:'smarts',heat:10,karma:[3,7],prep:'Medium',minAge:18,rep:4,stress:4,desc:'Smarts help, but digital trails create risk.'},
  identity:{tier:'Fraud',icon:'🪪',label:'Identity Theft',reward:[1200,12000],catch:.31,sentence:[2,7],need:'smarts',heat:16,karma:[6,11],prep:'High',minAge:18,rep:7,stress:5,desc:'High payout, high harm, long sentence risk.'},
  fraud:{tier:'Fraud',icon:'📊',label:'Corporate Fraud',reward:[6000,55000],catch:.29,sentence:[3,12],need:'smarts',heat:18,karma:[8,14],prep:'High',minAge:21,rep:9,stress:6,desc:'Big money if you can keep the paper trail quiet.'},
  hacking:{tier:'Fraud',icon:'💻',label:'Computer Fraud',reward:[2500,40000],catch:.22,sentence:[1,6],need:'hacking',heat:15,karma:[5,10],prep:'High',minAge:18,rep:8,stress:5,desc:'Coding skill and smarts reduce exposure.'},

  burglary:{tier:'Serious',icon:'🏠',label:'Burglary',reward:[800,8000],catch:.34,sentence:[2,7],need:null,heat:14,karma:[5,10],prep:'Medium',minAge:18,rep:7,stress:7,desc:'Physical risk and visible evidence.'},
  robbery:{tier:'Serious',icon:'🔫',label:'Armed Robbery',reward:[1500,12000],catch:.44,sentence:[3,10],need:null,heat:20,karma:[8,15],prep:'High',minAge:18,rep:10,stress:10,desc:'Very dangerous. High chance of prison.'},
  carjack:{tier:'Serious',icon:'🚗',label:'Carjacking',reward:[2500,10000],catch:.48,sentence:[2,6],need:null,heat:18,karma:[7,13],prep:'High',minAge:18,rep:9,stress:9,desc:'Fast money, severe heat, severe risk.'},
  drugs_deal:{tier:'Serious',icon:'💊',label:'Drug Trafficking',reward:[700,11000],catch:.35,sentence:[2,8],need:null,heat:16,karma:[5,12],prep:'Medium',minAge:18,rep:8,stress:7,desc:'Unstable income and steady police attention.'},
  extortion:{tier:'Serious',icon:'😤',label:'Extortion',reward:[1200,20000],catch:.30,sentence:[2,8],need:null,heat:17,karma:[6,12],prep:'High',minAge:18,rep:9,stress:8,desc:'Underworld reputation helps, karma suffers.'},

  bank:{tier:'Extreme',icon:'🏦',label:'Bank Robbery',reward:[25000,120000],catch:.65,sentence:[5,20],need:null,heat:35,karma:[12,22],prep:'Extreme',minAge:21,rep:22,stress:16,desc:'A life-defining risk. Requires serious underworld reputation.'},
  art_heist:{tier:'Extreme',icon:'🖼️',label:'Art Heist',reward:[15000,90000],catch:.52,sentence:[4,16],need:'smarts',heat:28,karma:[10,18],prep:'Extreme',minAge:21,rep:18,stress:12,desc:'Smarts and reputation help with a complicated high-end job.'},
  counterfeit:{tier:'Fraud',icon:'\u{1F5A8}\uFE0F',label:'Counterfeit Goods',reward:[900,9000],catch:.26,sentence:[1,4],need:'smarts',heat:11,karma:[4,8],prep:'Medium',minAge:18,rep:5,stress:4,desc:'Fake luxury goods and forged labels. Smarts reduce sloppy mistakes.'},
  smuggling:{tier:'Serious',icon:'\u{1F69A}',label:'Smuggling Run',reward:[2200,18000],catch:.33,sentence:[2,8],need:null,heat:17,karma:[6,11],prep:'High',minAge:18,rep:11,stress:8,desc:'Move illegal goods across borders. Good payoff, good chance of attention.'},
  loan_shark:{tier:'Serious',icon:'\u{1F4B8}',label:'Loan Sharking',reward:[1000,14000],catch:.28,sentence:[2,7],need:null,heat:15,karma:[7,12],prep:'Medium',minAge:18,rep:12,stress:7,desc:'Collections are profitable, but victims and witnesses create long-term trouble.'},
  casino_skim:{tier:'Extreme',icon:'\u{1F3B0}',label:'Casino Skim',reward:[12000,70000],catch:.47,sentence:[4,14],need:'hacking',heat:27,karma:[9,17],prep:'Extreme',minAge:21,rep:20,stress:11,desc:'A surgical blend of coding, fraud, and nerves. Big money if you stay invisible.'},
};

const Crime={
  VERSION:13,
  COSTS:{
    scout:900,
    burner:1800,
    crew:8500,
    safehouse:18000,
    expunge:20000,
    bribe:12000,
    lawyer:4500,
    community:0,
    reform:2200,
    appeal:9000,
  },

  render(){
    const G=window.G;if(!G)return;
    const el=document.getElementById('tab-crime');if(!el)return;
    this._ensure();

    if(G.age<16){
      el.innerHTML=`<div class="empty"><span class="ei">👮</span><p>Too young for serious trouble.<br>Crime unlocks at 16.</p></div>`;
      return;
    }

    if(G.inPrison){
      el.innerHTML=this._renderPrison();
      return;
    }

    const heat=G.crimeHeat||0;
    const heatInfo=this._heatInfo(heat);
    const rep=G.underworldRep||0;
    const risk=this._overallRisk();
    const record=(G.crimes||[]).length;
    const last=G.lastCrimeOutcome;
    const intel=G.crimeIntel||0;
    const crew=G.crimeCrew||0;
    const burners=G.burnerPhones||0;
    const safehouseYears=G.safehouseYears||0;

    let h=`
      ${this._criticalBanners()}

      <div class="fame-card" style="text-align:left;overflow:hidden;position:relative;margin-bottom:12px">
        <div style="position:absolute;inset:auto -30px -45px auto;width:150px;height:150px;border-radius:50%;background:${heatInfo.color}22;filter:blur(14px);pointer-events:none"></div>
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;position:relative">
          <div style="width:58px;height:58px;border-radius:18px;background:linear-gradient(135deg,var(--red),var(--orange));display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 8px 24px rgba(0,0,0,.25)">🚨</div>
          <div style="flex:1;min-width:0">
            <div style="font-size:24px;font-weight:900;color:${heatInfo.color};line-height:1">${Math.round(heat)}% Heat</div>
            <div style="font-size:11px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:4px">${this.esc(heatInfo.label)}</div>
            <div style="font-size:12px;color:var(--txt);font-weight:800;margin-top:5px">🕶️ Underworld Rep ${Math.round(rep)} · 📋 Record ${record}</div>
          </div>
        </div>
        <div style="height:8px;background:var(--s3);border-radius:999px;overflow:hidden;margin-bottom:7px">
          <div style="height:100%;width:${this.clamp(heat)}%;background:${heatInfo.color};border-radius:999px"></div>
        </div>
        <div style="font-size:11px;color:var(--muted);font-weight:700">${this.esc(heatInfo.tip)}</div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">
        ${this._metricBox('Arrest Risk',risk.label,risk.sub,risk.color)}
        ${this._metricBox('Underworld Rep',Math.round(rep)+'%','Unlocks bigger jobs',this._scoreColor(rep))}
        ${this._metricBox('Record',record+' offense'+(record!==1?'s':''),record?'Expungement may help':'Clean so far',record?'var(--orange)':'var(--green)')}
        ${this._metricBox('Reform Score',Math.round(G.reformScore||0)+'%','Improves parole and cleanup',this._scoreColor(G.reformScore||0))}
      </div>

      <div class="sec">Setup / Edge</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">
        ${this._metricBox('Intel',Math.round(intel)+'%','Cuts arrest chance',this._scoreColor(intel))}
        ${this._metricBox('Crew',crew+'/3',crew?'Boosts rewards and planning':'No crew backing','var(--accent)')}
        ${this._metricBox('Burner Kits',String(burners),burners?'Protects digital jobs':'Best for fraud work',burners?'var(--yellow)':'var(--muted)')}
        ${this._metricBox('Safehouse',safehouseYears?safehouseYears+' yr':'None',safehouseYears?'Helps cool heat yearly':'No fallback base',safehouseYears?'var(--green)':'var(--muted)')}
      </div>

      <div class="act-grid" style="margin-bottom:12px">
        ${this._actionCard('\u{1F575}\uFE0F','Scout Targets',`${fmt(this._cost('scout'))}`,'Gain intel for the next moves',`Crime.scoutTargets()`,(G.money||0)<this._cost('scout')||intel>=94,(G.money||0)<this._cost('scout')?`Need ${fmt(this._cost('scout'))}`:'Intel already high')}
        ${this._actionCard('\u{1F4F1}','Buy Burner Kit',`${fmt(this._cost('burner'))}`,'Helps fraud jobs stay quieter',`Crime.buyBurner()`,(G.money||0)<this._cost('burner')||burners>=3,(G.money||0)<this._cost('burner')?`Need ${fmt(this._cost('burner'))}`:'Max 3 kits')}
        ${this._actionCard('\u{1F91D}','Recruit Crew',`${fmt(this._cost('crew'))}`,'Needs 15 rep, boosts rewards',`Crime.recruitCrew()`,(G.money||0)<this._cost('crew')||crew>=3||rep<15,(G.money||0)<this._cost('crew')?`Need ${fmt(this._cost('crew'))}`:crew>=3?'Crew full':'Need 15 underworld rep')}
        ${this._actionCard('\u{1F3E0}','Set Up Safehouse',`${fmt(this._cost('safehouse'))}`,'3 years of lower exposure',`Crime.setupSafehouse()`,(G.money||0)<this._cost('safehouse')||safehouseYears>0,(G.money||0)<this._cost('safehouse')?`Need ${fmt(this._cost('safehouse'))}`:'Already active')}
      </div>
      ${last?this._lastOutcome(last):''}
      ${this._recordHTML()}
    `;

    ['Petty','Fraud','Serious','Extreme'].forEach(tier=>{
      h+=`<div class="sec">${tier==='Extreme'?'💀':tier==='Fraud'?'💻':tier==='Serious'?'💰':'🧤'} ${tier} Crime</div><div class="act-grid">`;
      Object.entries(CRIME_JOBS).filter(([,c])=>c.tier===tier).forEach(([id,c])=>{
        h+=this._crimeCard(id,c);
      });
      h+='</div>';
    });

    h+=`
      <div class="sec">⚖️ Legal / Cleanup</div>
      <div class="act-grid">
        ${this._actionCard('🧊','Lay Low','Lower heat, lose some happiness','Best when heat is high',`Crime.layLow()`)}
        ${this._actionCard('📋','Expunge Record',`Clean record (${fmt(sc(8000))})`,'Requires cash and a record',`Crime.expunge()`,(G.money||0)<sc(8000)||!(G.crimes||[]).length,(G.money||0)<sc(8000)?`Need ${fmt(sc(8000))}`:'No record')}
        ${this._actionCard('💵','Bribe Officer',`Risky cleanup (${fmt(sc(3500))})`,'Can backfire badly',`Crime.bribe()`,(G.money||0)<sc(3500),(G.money||0)<sc(3500)?`Need ${fmt(sc(3500))}`:'',true)}
        ${this._actionCard('⚖️','Hire Lawyer Retainer',`Protection (${fmt(sc(2500))})`,'Reduces next sentence/fine',`Crime.lawyer()`,(G.money||0)<sc(2500)||(G.lawyerRetainer||0)>0,(G.lawyerRetainer||0)>0?'Already retained':`Need ${fmt(sc(2500))}`)}
        ${this._actionCard('🤲','Community Service','Lower heat, gain karma','A clean way back',`Crime.communityService()`)}
        ${this._actionCard('🧠','Reform Program',`Therapy + skills (${fmt(sc(900))})`,'Improves reform score',`Crime.reform()`,(G.money||0)<sc(900),(G.money||0)<sc(900)?`Need ${fmt(sc(900))}`:'')}
      </div>
    `;

    el.innerHTML=h;
  },

  _renderPrison(){
    const G=window.G;
    this._normalizePrison(G);

    const years=this._prisonYears(G);
    const parole=this._paroleChance();
    const rep=G.underworldRep||0;
    const reform=G.reformScore||0;

    return`
      <div class="prison-banner" style="margin-bottom:12px">
        <div style="font-size:44px">🔒</div>
        <h3>Serving Prison Time</h3>
        <p>${years} year${years!==1?'s':''} remaining · Parole chance ${Math.round(parole*100)}%</p>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">
        ${this._metricBox('Sentence',years+' yr'+(years!==1?'s':''),'Age '+G.age,'var(--red)')}
        ${this._metricBox('Prison Rep',Math.round(rep)+'%','Helps networks, hurts reform',this._scoreColor(rep))}
        ${this._metricBox('Reform Score',Math.round(reform)+'%','Helps parole',this._scoreColor(reform))}
        ${this._metricBox('Stress',Math.round(G.stress||0)+'%','Prison is mentally heavy',(G.stress||0)>70?'var(--red)':'var(--orange)')}
      </div>

      ${this._criticalBanners()}

      <div class="sec">Prison Routine</div>
      <div class="act-grid">
        ${this._actionCard('📚','Study Law','+Smarts +Reform','Improves appeal odds',`Crime.prisonAct('study')`)}
        ${this._actionCard('🏋️','Work Out','+Fitness +Health','Stay strong',`Crime.prisonAct('workout')`)}
        ${this._actionCard('😇','Good Behaviour','Early release chance','Best with reform score',`Crime.prisonAct('behave')`)}
        ${this._actionCard('🧘','Counselling Group','−Stress +Reform','Healthier coping',`Crime.prisonAct('therapy')`)}
        ${this._actionCard('🧹','Prison Job','Small cash +Reform','Routine and discipline',`Crime.prisonAct('work')`)}
        ${this._actionCard('🤝','Prison Network','Future crime edge','Raises underworld rep',`Crime.prisonAct('network')`,false,'',true)}
      </div>

      <div class="sec">Legal Moves</div>
      <div class="act-grid">
        ${this._actionCard('⚖️','Legal Appeal',`${fmt(sc(5000))}`,'Chance to reduce sentence',`Crime.prisonAct('appeal')`,(G.money||0)<sc(5000),(G.money||0)<sc(5000)?`Need ${fmt(sc(5000))}`:'')}
        ${this._actionCard('🕊️','Request Parole',`${Math.round(parole*100)}% chance`,'Reform and good behavior help',`Crime.prisonAct('parole')`,years<2,'Need 2+ years remaining')}
        ${this._actionCard('🏃','Escape Attempt','Very risky','Failure adds years and hurts health',`Crime.prisonAct('escape')`,false,'',true)}
      </div>
    `;
  },

  _prisonYears(G=window.G){
    if(!G)return 0;
    const n=Number(G.prisonYears);
    return Math.max(0,Math.round(Number.isFinite(n)?n:0));
  },

  _normalizePrison(G=window.G){
    if(!G)return;
    G.prisonYears=this._prisonYears(G);

    if(G.inPrison&&G.prisonYears<=0){
      this._releaseFromPrison('served');
      return;
    }

    if(!Number.isFinite(G.prisonStartAge))G.prisonStartAge=G.inPrison?G.age:null;
    if(!Number.isFinite(G.prisonLastTickAge))G.prisonLastTickAge=null;
    if(!Number.isFinite(G.prisonGoodBehavior))G.prisonGoodBehavior=0;
    if(!Number.isFinite(G.prisonYearsServed))G.prisonYearsServed=0;
  },

  _releaseFromPrison(reason='served'){
    const G=window.G;if(!G)return;
    G.inPrison=false;
    G.prisonYears=0;
    G.prisonLastTickAge=null;
    G.prisonStartAge=null;
    G.prisonGoodBehavior=0;
    G.prisonYearsServed=Number.isFinite(G.prisonYearsServed)?G.prisonYearsServed:0;

    if(reason==='parole'){
      G.crimeHeat=cl((G.crimeHeat||0)-20,0,100);
      G.reformScore=cl((G.reformScore||0)+8,0,100);
      G.happiness=cl(G.happiness+12);
      Engine.log('🕊️ Parole approved. You are out early, but rebuilding starts now.','good');
    }else if(reason==='escape'){
      G.crimeHeat=100;
      G.happiness=cl(G.happiness+16);
      if(!G.achievements)G.achievements={};
      G.achievements.escaped=true;
      Engine.log('🏃 Escaped. You are free, but the heat is maximum.','special');
      Engine.checkAch();
    }else{
      G.happiness=cl(G.happiness+16);
      G.stress=cl((G.stress||0)-15);
      G.reformScore=cl((G.reformScore||0)+8,0,100);
      Engine.log('🔓 Released from prison. Time to rebuild.','good');
    }
  },

  prisonTick(){
    const G=window.G;if(!G)return false;
    this._ensure();

    if(!G.inPrison)return false;
    this._normalizePrison(G);
    if(!G.inPrison)return true;

    if(G.prisonLastTickAge===G.age)return false;

    G.prisonLastTickAge=G.age;
    G.prisonYears=Math.max(0,this._prisonYears(G)-1);
    G.prisonYearsServed=(G.prisonYearsServed||0)+1;

    G.happiness=cl(G.happiness-r(6,11));
    G.stress=cl((G.stress||0)+r(5,10));
    G.health=cl(G.health-r(0,3));
    G.reformScore=cl((G.reformScore||0)+Math.floor((G.prisonGoodBehavior||0)/3),0,100);

    if(G.prisonYears<=0){
      this._releaseFromPrison('served');
      return true;
    }

    if((G.prisonYearsServed||0)>=1&&G.prisonYears>=1&&Math.random()<Math.min(.30,this._paroleChance()*.22)){
      this._releaseFromPrison('parole');
      return true;
    }

    Engine.log(`🔒 Served another year in prison. ${G.prisonYears} year${G.prisonYears!==1?'s':''} remaining.`,'bad');
    return true;
  },

  _ensure(){
    const G=window.G;if(!G)return;
    if(!Array.isArray(G.crimes))G.crimes=[];
    if(!Number.isFinite(G.crimeHeat))G.crimeHeat=0;
    if(!Number.isFinite(G.underworldRep))G.underworldRep=0;
    if(!Number.isFinite(G.reformScore))G.reformScore=0;
    if(!Number.isFinite(G.crimesCommitted))G.crimesCommitted=0;
    if(!Number.isFinite(G.crimeStreak))G.crimeStreak=0;
    if(!Number.isFinite(G.lawyerRetainer))G.lawyerRetainer=0;
    if(!Number.isFinite(G.crimeIntel))G.crimeIntel=0;
    if(!Number.isFinite(G.crimeCrew))G.crimeCrew=0;
    if(!Number.isFinite(G.burnerPhones))G.burnerPhones=0;
    if(!Number.isFinite(G.safehouseYears))G.safehouseYears=0;
    if(!Array.isArray(G.crimeHistory))G.crimeHistory=[];

    G.inPrison=!!G.inPrison;
    G.prisonYears=this._prisonYears(G);
    G.crimeIntel=this.clamp(G.crimeIntel,0,100);
    G.crimeCrew=this.clamp(G.crimeCrew,0,3);
    G.burnerPhones=this.clamp(Math.round(G.burnerPhones),0,3);
    G.safehouseYears=Math.max(0,Math.round(G.safehouseYears));
    if(!Number.isFinite(G.prisonGoodBehavior))G.prisonGoodBehavior=0;
    if(!Number.isFinite(G.prisonYearsServed))G.prisonYearsServed=0;
    if(!Number.isFinite(G.prisonStartAge))G.prisonStartAge=G.inPrison?G.age:null;
    if(!Number.isFinite(G.prisonLastTickAge))G.prisonLastTickAge=null;
  },

  _locked(id,c){
    const G=window.G;
    if((G.age||0)<(c.minAge||16))return`Age ${c.minAge}+`;
    if(id==='hacking'&&(G.smarts<60&&(G.skills?.coding||0)<35))return'Need 60 smarts or coding 35';
    if(c.need==='smarts'&&G.smarts<35)return'Need 35 smarts';
    if(c.need==='fitness'&&(G.fitness||50)<35)return'Need 35 fitness';
    if((id==='smuggling'||id==='loan_shark')&&(G.underworldRep||0)<10)return'Need 10 underworld rep';
    if(id==='casino_skim'&&((G.underworldRep||0)<20||((G.skills?.coding||0)<35&&(G.smarts||0)<60)))return'Need 20 rep and coding 35 or smarts 60';
    if(id==='bank'&&(G.underworldRep||0)<25)return'Need 25 underworld rep';
    if(id==='art_heist'&&(G.underworldRep||0)<18)return'Need 18 underworld rep';
    if((G.health||0)<15)return'Too unhealthy';
    return'';
  },

  _caughtChance(c){
    const G=window.G;
    let chance=c.catch;
    chance*=((G.country?.crimeRate||.35)*2.35);
    chance*=G.difficulty==='easy'?.9:G.difficulty==='hard'?1.12:G.difficulty==='extreme'?1.25:1;
    chance*=G.trait==='lucky'?.86:1;
    chance*=G.trait==='disciplined'?.94:1;
    chance*=G.trait==='reckless'?1.08:1;
    chance*=G.smarts>75?.82:G.smarts<30?1.13:1;
    chance*=(1+(G.crimeHeat||0)/120);
    chance*=(1+Math.min(.22,(G.crimes||[]).length*.018));
    chance*=(1-Math.min(.18,(G.underworldRep||0)/500));
    chance*=(1-Math.min(.12,(G.reformScore||0)/800));
    chance*=(1-Math.min(.18,(G.crimeIntel||0)/420));
    chance*=(1-Math.min(.12,(G.crimeCrew||0)*.04));
    if((G.safehouseYears||0)>0)chance*=.93;
    if(this._burnerApplies(c)&&((G.burnerPhones||0)>0))chance*=.82;
    if(c.need==='fitness'&&(G.fitness||50)>70)chance*=.88;
    if(c.need==='hacking'&&((G.skills?.coding||0)>50||G.smarts>80))chance*=.82;
    if(G.lawyerRetainer>0)chance*=.96;
    return Math.max(.03,Math.min(.92,chance));
  },

  _rewardFor(c){
    const G=window.G;
    const base=sc(r(c.reward[0],c.reward[1]));
    const repMult=1+Math.min(.35,(G.underworldRep||0)/260);
    const smartMult=c.need==='smarts'||c.need==='hacking'?1+Math.max(0,(G.smarts-55))/300:1;
    const intelMult=1+Math.min(.12,(G.crimeIntel||0)/500);
    const crewMult=1+Math.min(.24,(G.crimeCrew||0)*.08);
    return Math.max(0,Math.floor(base*repMult*smartMult*intelMult*crewMult));
  },

  do(type){
    const G=window.G;if(!G)return;
    this._ensure();

    if(G.inPrison){UI.toast('Already in prison!');return;}

    const c=CRIME_JOBS[type];if(!c)return;
    const locked=this._locked(type,c);if(locked){UI.toast(locked);return;}

    if(type==='bank'){
      if(!G.achievements)G.achievements={};
      G.achievements.bank_robbed=true;
    }

    const caughtChance=this._caughtChance(c);
    const caught=Math.random()<caughtChance;
    const heatBefore=G.crimeHeat||0;
    const heatGain=this._heatGainFor(c);

    G.crimeHeat=cl((G.crimeHeat||0)+heatGain,0,100);
    G.stress=cl((G.stress||0)+(c.stress||2));
    G.crimesCommitted++;
    G.crimeStreak++;
    G.crimeIntel=cl((G.crimeIntel||0)-r(7,14),0,100);
    this._consumeBurner(type);

    if(caught){
      this._handleCaught(type,c,caughtChance);
    }else{
      const reward=this._rewardFor(c);
      G.money+=reward;
      G.happiness=cl(G.happiness+r(2,8));
      G.underworldRep=cl((G.underworldRep||0)+(c.rep||Math.ceil(c.heat/3)),0,100);
      G.karma=cl((G.karma||0)-r(c.karma[0],c.karma[1]),-100,100);
      G.reformScore=cl((G.reformScore||0)-r(0,3),0,100);

      const msg=`${c.icon} ${c.label} succeeded. Earned ${fmt(reward)}. Heat ${Math.round(heatBefore)}% → ${Math.round(G.crimeHeat)}%.`;
      G.lastCrimeOutcome={text:msg,type:'good',age:G.age};
      this._addHistory({age:G.age,label:c.label,result:'Succeeded',money:reward,heat:G.crimeHeat,type:'good'});
      Engine.log(msg,'crime');
    }

    this._checkCrimeAchievements(type);
    UI.update();
    this.render();
  },

  _handleCaught(type,c,caughtChance){
    const G=window.G;
    let yrs=r(c.sentence[0],c.sentence[1]);
    let fine=sc(r(400,3500));
    const lawyer=G.lawyerRetainer>0;

    if(lawyer){
      fine=Math.floor(fine*.65);
      yrs=Math.max(0,yrs-r(0,2));
      G.lawyerRetainer=0;
    }

    if(G.trait==='lucky'&&yrs>0&&Math.random()<.15)yrs--;
    if((G.reformScore||0)>50&&yrs>0&&Math.random()<.12)yrs--;
    if((G.crimeCrew||0)>0&&yrs>0&&Math.random()<Math.min(.18,(G.crimeCrew||0)*.06))yrs=Math.max(0,yrs-1);

    G.crimes.push(c.label);
    G.happiness=cl(G.happiness-r(12,24));
    G.health=cl(G.health-r(4,10));
    G.karma=cl((G.karma||0)-r(c.karma[0],c.karma[1]),-100,100);
    G.crimeStreak=0;
    G.crimeIntel=cl((G.crimeIntel||0)-r(10,18),0,100);

    if(!G.achievements)G.achievements={};
    G.achievements.jailbird=true;

    if(yrs===0){
      G.money=Math.max(0,(G.money||0)-fine);
      G.crimeHeat=cl((G.crimeHeat||0)+8,0,100);
      const msg=`👮 Caught for ${c.label}. ${lawyer?'Your lawyer helped. ':''}Fined ${fmt(fine)} and released.`;
      G.lastCrimeOutcome={text:msg,type:'bad',age:G.age};
      this._addHistory({age:G.age,label:c.label,result:'Caught + fined',money:-fine,heat:G.crimeHeat,type:'bad'});
      Engine.log(msg,'crime');
    }else{
      G.inPrison=true;
      G.prisonYears=Math.max(1,Math.round(yrs));
      G.prisonStartAge=G.age;
      G.prisonLastTickAge=G.age;
      G.prisonYearsServed=0;
      G.prisonGoodBehavior=0;
      G.crimeHeat=cl((G.crimeHeat||0)+12,0,100);
      G.crimeCrew=Math.max(0,(G.crimeCrew||0)-1);
      G.safehouseYears=0;

      if(G.career){
        Engine.log(`💔 Lost job as ${G.career.title} due to arrest.`,'bad');
        G.career=null;
        G.yearsAtJob=0;
        G.careerCompany='';
      }

      const msg=`🚔 Arrested for ${c.label}. ${lawyer?'Your lawyer reduced the damage. ':''}Sentenced to ${yrs} year${yrs!==1?'s':''}.`;
      G.lastCrimeOutcome={text:msg,type:'bad',age:G.age};
      this._addHistory({age:G.age,label:c.label,result:'Prison',money:0,heat:G.crimeHeat,type:'bad'});
      Engine.log(msg,'crime');
    }

    Engine.checkAch();
  },

  scoutTargets(){
    const G=window.G;this._ensure();
    const c=this._cost('scout');
    if((G.money||0)<c){UI.toast(`Need ${fmt(c)}!`);return;}
    if((G.crimeIntel||0)>=94){UI.toast('Your intel is already very high.');return;}

    G.money-=c;
    G.crimeIntel=cl((G.crimeIntel||0)+r(12,22),0,100);
    G.smarts=cl((G.smarts||0)+r(1,3));
    G.stress=cl((G.stress||0)+r(1,4));
    G.lastCrimeOutcome={text:'You scoped routes, patterns, and exits. Future jobs look cleaner.',type:'neutral',age:G.age};
    Engine.log('Scout work paid off. You learned the rhythm of the streets.','neutral');
    UI.update();
    this.render();
  },

  buyBurner(){
    const G=window.G;this._ensure();
    const c=this._cost('burner');
    if((G.money||0)<c){UI.toast(`Need ${fmt(c)}!`);return;}
    if((G.burnerPhones||0)>=3){UI.toast('You already have the maximum number of burner kits.');return;}

    G.money-=c;
    G.burnerPhones=(G.burnerPhones||0)+1;
    G.lastCrimeOutcome={text:'You bought a burner kit. Digital jobs will be harder to trace.',type:'neutral',age:G.age};
    Engine.log('Burner kit secured. Fraud jobs will be quieter for a while.','good');
    UI.update();
    this.render();
  },

  recruitCrew(){
    const G=window.G;this._ensure();
    const c=this._cost('crew');
    if((G.money||0)<c){UI.toast(`Need ${fmt(c)}!`);return;}
    if((G.underworldRep||0)<15){UI.toast('Need 15 underworld rep.');return;}
    if((G.crimeCrew||0)>=3){UI.toast('Your crew is already at full strength.');return;}

    G.money-=c;
    G.crimeCrew=(G.crimeCrew||0)+1;
    G.underworldRep=cl((G.underworldRep||0)+r(1,3),0,100);
    G.happiness=cl(G.happiness+r(2,5));
    G.lastCrimeOutcome={text:'You recruited another crew member. Bigger operations just got easier to run.',type:'special',age:G.age};
    Engine.log('Your crew grew. Jobs should pay better and run cleaner now.','special');
    UI.update();
    this.render();
  },

  setupSafehouse(){
    const G=window.G;this._ensure();
    const c=this._cost('safehouse');
    if((G.money||0)<c){UI.toast(`Need ${fmt(c)}!`);return;}
    if((G.safehouseYears||0)>0){UI.toast('A safehouse is already active.');return;}

    G.money-=c;
    G.safehouseYears=3;
    G.crimeHeat=cl((G.crimeHeat||0)-r(4,9),0,100);
    G.stress=cl((G.stress||0)-r(2,6));
    G.lastCrimeOutcome={text:'You established a safehouse and burned a few trails behind you.',type:'good',age:G.age};
    Engine.log('Safehouse established. You have a safer base for the next few years.','good');
    UI.update();
    this.render();
  },

  layLow(){
    const G=window.G;this._ensure();
    const drop=r(15,28)+Math.floor((G.reformScore||0)/12);
    G.crimeHeat=cl((G.crimeHeat||0)-drop,0,100);
    G.happiness=cl(G.happiness-r(3,8));
    G.stress=cl((G.stress||0)-r(4,10));
    G.crimeStreak=0;
    G.lastCrimeOutcome={text:'You laid low and let the heat cool off.',type:'neutral',age:G.age};
    Engine.log('🧊 You laid low and let the heat cool off.','neutral');
    UI.update();
    this.render();
  },

  lawyer(){
    const G=window.G;this._ensure();
    const c=sc(2500);
    if((G.money||0)<c){UI.toast(`Need ${fmt(c)}!`);return;}
    if((G.lawyerRetainer||0)>0){UI.toast('You already have a lawyer on retainer.');return;}

    G.money-=c;
    G.lawyerRetainer=1;
    G.stress=cl((G.stress||0)-3);

    Engine.log('⚖️ You hired a lawyer on retainer for your next legal crisis.','good');
    UI.update();
    this.render();
  },

  communityService(){
    const G=window.G;this._ensure();
    G.crimeHeat=cl((G.crimeHeat||0)-r(8,18),0,100);
    G.karma=cl((G.karma||0)+r(4,9),-100,100);
    G.reformScore=cl((G.reformScore||0)+r(6,12),0,100);
    G.happiness=cl(G.happiness+r(1,5));
    G.stress=cl((G.stress||0)+r(1,4));

    Engine.log('🤲 Community service helped repair your public image and conscience.','good');
    UI.update();
    this.render();
  },

  reform(){
    const G=window.G;this._ensure();
    const c=sc(900);
    if((G.money||0)<c){UI.toast(`Need ${fmt(c)}!`);return;}

    G.money-=c;
    G.reformScore=cl((G.reformScore||0)+r(10,18),0,100);
    G.stress=cl((G.stress||0)-r(4,10));
    G.smarts=cl(G.smarts+r(1,3));
    G.happiness=cl(G.happiness+r(3,7));

    Engine.log('🧠 Reform program helped you build healthier patterns.','good');
    UI.update();
    this.render();
  },

  prisonAct(act){
    const G=window.G;this._ensure();
    if(!G.inPrison&&act!=='appeal'){UI.toast('You are not in prison.');return;}
    this._normalizePrison(G);
    if(!G.inPrison&&act!=='appeal'){UI.toast('You are not in prison.');return;}

    if(act==='study'){
      G.smarts=cl(G.smarts+r(3,7));
      G.reformScore=cl((G.reformScore||0)+r(3,7));
      Engine.log('📚 Prison study. You used the time wisely.','neutral');
    }else if(act==='workout'){
      G.fitness=cl((G.fitness||50)+r(4,8));
      G.health=cl(G.health+r(2,5));
      G.stress=cl((G.stress||0)-r(1,4));
      Engine.log('🏋️ Prison yard. You got stronger.','neutral');
    }else if(act==='therapy'){
      G.reformScore=cl((G.reformScore||0)+r(6,12));
      G.stress=cl((G.stress||0)-r(6,12));
      G.happiness=cl(G.happiness+r(2,6));
      Engine.log('🧘 Counselling helped you process the spiral that brought you here.','good');
    }else if(act==='work'){
      const pay=sc(r(60,300));
      G.money=(G.money||0)+pay;
      G.reformScore=cl((G.reformScore||0)+r(3,7));
      G.stress=cl((G.stress||0)-r(1,4));
      Engine.log(`🧹 Prison job paid ${fmt(pay)} and gave your days structure.`,'neutral');
    }else if(act==='behave'){
      const chance=.38+(G.reformScore||0)/180;
      G.prisonGoodBehavior=cl((G.prisonGoodBehavior||0)+r(1,3),0,100);
      if(G.prisonYears>1&&Math.random()<chance){
        G.prisonYears=Math.max(0,this._prisonYears(G)-1);
        G.reformScore=cl((G.reformScore||0)+5,0,100);
        G.happiness=cl(G.happiness+9);
        Engine.log('😇 Good behaviour reduced sentence by 1 year.','good');
        if(G.prisonYears<=0)this._releaseFromPrison('served');
      }else{
        G.reformScore=cl((G.reformScore||0)+3,0,100);
        Engine.log('😇 Good behaviour noted.','neutral');
      }
    }else if(act==='appeal'){
      const c=sc(5000);
      if((G.money||0)<c){UI.toast('Need '+fmt(c)+'!');return;}

      G.money-=c;
      const chance=.35+(G.smarts||50)/260+(G.lawyerRetainer?0.12:0);

      if(G.prisonYears>2&&Math.random()<chance){
        const rd=r(1,Math.min(this._prisonYears(G)-1,3));
        G.prisonYears=Math.max(0,this._prisonYears(G)-rd);
        Engine.log(`⚖️ Appeal successful. Sentence reduced ${rd} year${rd!==1?'s':''}.`,'good');
        if(G.prisonYears<=0)this._releaseFromPrison('served');
      }else{
        Engine.log('⚖️ Appeal failed. Sentence stands.','bad');
      }

      G.lawyerRetainer=0;
    }else if(act==='parole'){
      if((G.prisonYears||0)<2){UI.toast('Need at least 2 years remaining.');return;}

      if(Math.random()<this._paroleChance()){
        this._releaseFromPrison('parole');
      }else{
        G.stress=cl((G.stress||0)+5);
        Engine.log('🕊️ Parole denied. The board wants more proof of change.','bad');
      }
    }else if(act==='network'){
      G.underworldRep=cl((G.underworldRep||0)+r(4,10),0,100);
      G.reformScore=cl((G.reformScore||0)-r(1,4),0,100);
      G.stress=cl((G.stress||0)+r(2,6));
      Engine.log('🤝 Prison contacts increased your underworld reputation.','neutral');
    }else if(act==='escape'){
      const chance=(G.trait==='lucky'?0.18:0.11)+Math.max(0,(G.fitness||50)-60)/400;

      if(Math.random()<chance){
        this._releaseFromPrison('escape');
      }else{
        G.prisonYears+=r(1,3);
        G.health=cl(G.health-r(12,22));
        G.stress=cl((G.stress||0)+r(8,16));
        Engine.log('🚔 Escape failed. Extra years added.','bad');
      }
    }

    UI.update();
    this.render();
  },

  bribe(){
    const G=window.G;this._ensure();
    const c=sc(3500);

    if((G.money||0)<c){UI.toast(`Need ${fmt(c)}!`);return;}
    if(!G.inPrison&&!(G.crimes||[]).length&&!(G.crimeHeat>0)){UI.toast('No trouble to bribe away!');return;}

    G.money-=c;
    const chance=.52+((G.country?.crimeRate||.35)-.25)*.35-(G.crimeHeat||0)/250+(G.underworldRep||0)/500;

    if(Math.random()<chance){
      if(G.inPrison){
        G.inPrison=false;
        G.prisonYears=0;
        G.prisonLastTickAge=null;
        G.prisonStartAge=null;
        G.prisonGoodBehavior=0;
      }

      G.crimeHeat=cl((G.crimeHeat||0)-35,0,100);
      G.happiness=cl(G.happiness+10);
      G.karma=cl((G.karma||0)-r(3,7),-100,100);
      G.lastCrimeOutcome={text:'Bribe accepted. Heat dropped and trouble faded.',type:'special',age:G.age};
      Engine.log('💵 Bribe accepted. Heat dropped and trouble faded.','special');
    }else{
      if(G.inPrison)G.prisonYears+=1;
      G.crimeHeat=cl((G.crimeHeat||0)+20,0,100);
      G.karma=cl((G.karma||0)-r(4,9),-100,100);
      G.lastCrimeOutcome={text:'Bribe backfired. Heat increased.',type:'bad',age:G.age};
      Engine.log('👮 Bribe backfired. Heat increased.','bad');
    }

    UI.update();
    this.render();
  },

  expunge(){
    const G=window.G;this._ensure();
    const c=sc(8000);

    if((G.money||0)<c){UI.toast(`Need ${fmt(c)}!`);return;}
    if(!(G.crimes||[]).length){UI.toast('No record to expunge!');return;}

    G.money-=c;
    const success=Math.random()<(.72+(G.reformScore||0)/300-Math.min(.22,(G.crimeHeat||0)/300));

    if(success){
      G.crimes=[];
      G.crimeHeat=cl((G.crimeHeat||0)-25,0,100);
      G.happiness=cl(G.happiness+10);
      G.reformScore=cl((G.reformScore||0)+5);
      Engine.log('📋 Criminal record expunged. Fresh start.','good');
    }else{
      G.crimeHeat=cl((G.crimeHeat||0)+8,0,100);
      G.stress=cl((G.stress||0)+6);
      Engine.log('📋 Expungement failed. The process drew unwanted attention.','bad');
    }

    UI.update();
    this.render();
  },

  tick(){
    const G=window.G;if(!G)return;
    this._ensure();
    const hadSafehouse=(G.safehouseYears||0)>0;

    if(G.crimeHeat>0){
      const cool=r(4,10)+Math.floor((G.reformScore||0)/35);
      G.crimeHeat=cl(G.crimeHeat-cool,0,100);
    }

    if(hadSafehouse){
      G.crimeHeat=cl((G.crimeHeat||0)-r(3,6),0,100);
      G.safehouseYears=Math.max(0,(G.safehouseYears||0)-1);
    }

    if((G.crimeIntel||0)>0)G.crimeIntel=cl((G.crimeIntel||0)-r(6,12),0,100);

    if(G.lawyerRetainer>0&&Math.random()<.08)G.lawyerRetainer=0;

    if(G.inPrison){
      this.prisonTick();
      return;
    }

    if((G.crimeHeat||0)>80&&Math.random()<(hadSafehouse?0.05:0.08)){
      const fine=sc(r(500,2500));
      G.money=Math.max(0,(G.money||0)-fine);
      G.crimeHeat=cl((G.crimeHeat||0)+5,0,100);
      Engine.log(`🚓 Police pressure followed you this year. Legal costs: ${fmt(fine)}.`,'bad');
    }
  },

  _paroleChance(){
    const G=window.G;
    let chance=.18+(G.reformScore||0)/150+(G.karma||0)/500-Math.min(.18,(G.underworldRep||0)/400);

    if((G.crimes||[]).length>3)chance-=.08;
    if(G.trait==='disciplined')chance+=.06;

    return Math.max(.05,Math.min(.82,chance));
  },

  _overallRisk(){
    const G=window.G;
    const heat=G.crimeHeat||0;
    let score=heat+(G.crimes||[]).length*4-Math.floor((G.reformScore||0)/4);
    score=this.clamp(score,0,100);

    if(score>=75)return{label:'Severe',sub:'Expect police pressure',color:'var(--red)'};
    if(score>=45)return{label:'High',sub:'Lay low or clean up',color:'var(--orange)'};
    if(score>=20)return{label:'Moderate',sub:'Risk is building',color:'var(--yellow)'};
    return{label:'Low',sub:'Trouble is quiet',color:'var(--green)'};
  },

  _heatInfo(heat){
    if(heat>=80)return{label:'Manhunt Territory',color:'var(--red)',tip:'Every crime is extremely risky. Lay low, reform, or expect consequences.'};
    if(heat>=55)return{label:'Hot',color:'var(--orange)',tip:'Police attention is high. Expensive cleanup may be worth it.'};
    if(heat>=25)return{label:'Watched',color:'var(--yellow)',tip:'The heat is noticeable but still manageable.'};
    return{label:'Quiet',color:'var(--green)',tip:'Low heat does not mean zero risk.'};
  },

  _criticalBanners(){
    const G=window.G;
    let h='';

    if((G.crimeHeat||0)>=82&&!G.inPrison){
      h+=`<div class="crit-banner red"><span class="crit-banner-ico">🚨</span><div class="crit-banner-txt">Heat is critical. One bad move could end this chapter in prison.</div><button type="button" class="crit-go" onclick="Crime.layLow()">Lay Low</button></div>`;
    }

    if((G.reformScore||0)>=65&&(G.crimes||[]).length){
      h+=`<div class="crit-banner"><span class="crit-banner-ico">🕊️</span><div class="crit-banner-txt">Your reform score is strong. Expungement has better odds now.</div><button type="button" class="crit-go" onclick="Crime.expunge()">Expunge</button></div>`;
    }

    if(G.lawyerRetainer>0&&!G.inPrison){
      h+=`<div class="crit-banner"><span class="crit-banner-ico">⚖️</span><div class="crit-banner-txt">You have a lawyer on retainer for your next legal crisis.</div></div>`;
    }

    if((G.crimeIntel||0)>=70&&!G.inPrison){
      h+=`<div class="crit-banner"><span class="crit-banner-ico">\u{1F575}\uFE0F</span><div class="crit-banner-txt">Your intel network is hot. This is a strong moment for a higher-tier job.</div></div>`;
    }

    return h;
  },

  _burnerApplies(c){
    if(!c)return false;
    return c.need==='hacking'||['Online Scam','Counterfeit Goods','Identity Theft','Corporate Fraud','Casino Skim'].includes(c.label);
  },

  _consumeBurner(type){
    const G=window.G;
    if(!G||!(G.burnerPhones>0)||!this._burnerApplies(CRIME_JOBS[type]))return false;
    G.burnerPhones=Math.max(0,(G.burnerPhones||0)-1);
    return true;
  },

  _heatGainFor(c){
    const G=window.G;
    let heat=c.heat||0;
    if((G.safehouseYears||0)>0)heat=Math.max(1,heat-2);
    if((G.crimeCrew||0)>0)heat=Math.max(1,heat-Math.min(3,G.crimeCrew||0));
    if((G.burnerPhones||0)>0&&this._burnerApplies(c))heat=Math.max(1,heat-4);
    return heat;
  },

  _crimeCard(id,c){
    const locked=this._locked(id,c);
    const risk=Math.round(this._caughtChance(c)*100);
    const reward=`${fmt(sc(c.reward[0]))}-${fmt(sc(c.reward[1]))}`;
    const riskColor=risk>=55?'var(--red)':risk>=30?'var(--orange)':'var(--yellow)';
    const onclick=locked?`UI.toast('${this.attr(locked)}')`:`Crime.do('${id}')`;

    return`<div class="card danger ${locked?'locked':''}" onclick="${onclick}" title="${this.esc(c.desc||c.label)}">
      <span class="ci">${locked?'🔒':this.esc(c.icon)}</span>
      <span class="cn">${this.esc(c.label)}</span>
      <span class="cd">${locked?this.esc(locked):`${reward} · <span style=&quot;color:${riskColor};font-weight:900&quot;>${risk}% caught</span>`}</span>
      <span class="cd" style="opacity:.75;font-size:10px">Heat +${c.heat} · ${this.esc(c.prep)} prep</span>
    </div>`;
  },

  _actionCard(icon,name,desc,meta,action,locked=false,lock='',danger=false){
    const onclick=locked?`UI.toast('${this.attr(lock||'Locked')}')`:action;

    return`<div class="card ${danger?'danger ':''}${locked?'locked':''}" onclick="${onclick}">
      <span class="ci">${locked?'🔒':this.esc(icon)}</span>
      <span class="cn">${this.esc(name)}</span>
      <span class="cd">${locked?this.esc(lock||'Locked'):this.esc(desc)}</span>
      ${meta?`<span class="cd" style="opacity:.75;font-size:10px">${this.esc(meta)}</span>`:''}
    </div>`;
  },

  _metricBox(label,value,sub,color){
    return`<div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">${this.esc(label)}</div><div class="nw-amt" style="font-size:20px;color:${color||'var(--txt)'}">${this.esc(value)}</div><div class="nw-sub">${this.esc(sub)}</div></div>`;
  },

  _recordHTML(){
    const G=window.G;
    const hist=(G.crimeHistory||[]).slice(-5).reverse();

    if(!hist.length&&!(G.crimes||[]).length)return'';

    let h='';

    if((G.crimes||[]).length){
      h+=`<div class="sec">📋 Criminal Record (${G.crimes.length})</div><div class="info-box" style="border-color:rgba(248,113,113,.3)"><p style="color:var(--red);margin:0">${(G.crimes||[]).slice(-6).map(x=>this.esc(x)).join(' · ')}</p></div>`;
    }

    if(hist.length){
      h+=`<div class="sec">🧾 Recent Crime History</div><div class="log-list" style="margin-bottom:8px">${hist.map(x=>`<div class="log-entry ${x.type==='bad'?'bad':'neutral'}"><div class="log-age" style="color:${x.type==='bad'?'var(--red)':'var(--green)'}">Age ${this.esc(x.age)}</div><div class="log-txt">${this.esc(x.label)} — ${this.esc(x.result)}${x.money?` (${x.money>0?'+':''}${fmt(x.money)})`:''}</div></div>`).join('')}</div>`;
    }

    return h;
  },

  _lastOutcome(outcome){
    const col=outcome.type==='bad'?'var(--red)':outcome.type==='special'?'var(--accent)':outcome.type==='good'?'var(--green)':'var(--muted)';
    return`<div class="info-box" style="margin:0 0 12px;border-color:${col}55;background:${col}10"><p style="margin:0"><strong>Last outcome:</strong> ${this.esc(outcome.text)}</p></div>`;
  },

  _addHistory(entry){
    const G=window.G;this._ensure();
    G.crimeHistory.push(entry);
    if(G.crimeHistory.length>16)G.crimeHistory=G.crimeHistory.slice(-16);
  },

  _checkCrimeAchievements(type){
    const G=window.G;
    if(!G.achievements)G.achievements={};

    if((G.crimesCommitted||0)>=10)G.achievements.crime_spree=true;
    if((G.underworldRep||0)>=75)G.achievements.underworld_legend=true;
    if((G.reformScore||0)>=80)G.achievements.reformed=true;
    if(type==='art_heist')G.achievements.art_heist=true;

    Engine.checkAch();
  },

  _scoreColor(v){
    return v>=70?'var(--green)':v>=35?'var(--yellow)':'var(--muted)';
  },

  clamp(v,min=0,max=100){
    return Math.max(min,Math.min(max,Number(v)||0));
  },

  _cost(key){
    return sc(this.COSTS[key]||0);
  },

  esc(v){
    if(typeof UI!=='undefined'&&UI._esc)return UI._esc(v);
    return String(v??'').replace(/[&<>"']/g,ch=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;',
    }[ch]));
  },

  attr(v){
    return String(v??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');
  },
};
