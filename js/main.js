/* js/main.js — LifeSim module */
'use strict';

window.G=null;

const DIFFICULTY_PROFILES={
  easy:{label:'Wealthy family',cash:80000,credit:760,debt:0,stress:0,karma:5,note:'Family support unlocks at 18, better credit, cheaper yearly costs, fewer bad years.'},
  normal:{label:'Average family',cash:5000,credit:650,debt:0,stress:0,karma:0,note:'Small adult support fund, balanced stats, costs, and event pressure.'},
  hard:{label:'Struggling family',cash:500,credit:560,debt:2500,stress:8,karma:0,note:'Tiny adult support, worse credit, possible family debt, higher costs and event pressure.'},
  extreme:{label:'Brutal start',cash:0,credit:480,debt:9000,stress:16,karma:-5,note:'No trust fund, family debt risk, costly bills, more events, higher death risk.'},
  custom:{label:'Custom start',cash:2000,credit:650,debt:0,stress:0,karma:0,note:'Custom stats with adult support released at 18.'},
};

const App={
  _ageShortcutHeld:false,
  _starting:false,
  VERSION:1,

  init(){
    if(typeof UI!=='undefined'&&UI.enableStableRenders)UI.enableStableRenders();
    this.ensureDynamicTabs();
    Create.fillCountries();
    Create.setGender('male');
    Create.renderTraits();
    Create.renderAmbitions();
    Create.renderDiffCards();
    Create._updateStatPreview();

    document.getElementById('inp-country')?.addEventListener('change',()=>Create.handleCountryChange());
    document.getElementById('inp-name')?.addEventListener('input',()=>Create.syncGenderFromName());

    if(typeof Save!=='undefined'&&Save.has()){
      const btn=document.getElementById('btn-continue');
      if(btn)btn.disabled=false;
    }

    if(typeof Legacy!=='undefined')Legacy.renderSplashPrestige();
    this._bindShortcuts();
    this._bindUiAccessibility();

    if(typeof UI!=='undefined'&&UI.loadSettings)UI.loadSettings();
    this._bindSaveLifecycle();

    this.maybeStartPreview();
  },

  _bindSaveLifecycle(){
    if(this._saveLifecycleBound)return;
    this._saveLifecycleBound=true;
    const flush=()=>{
      try{
        if(window.G?.alive&&typeof Save!=='undefined'&&Save.autosave)Save.autosave(window.G);
      }catch(e){}
    };
    document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
    window.addEventListener('pagehide',flush);
  },

  maybeStartPreview(){
    try{
      const params=new URLSearchParams(location.search);
      if(params.get('preview')!=='ui')return;
      this.startPreviewMode();
    }catch(e){
      console.warn('preview init failed',e);
    }
  },

  startPreviewMode(){
    const diffProfile=DIFFICULTY_PROFILES.normal;
    const sourceCountry=(COUNTRIES||[]).find(c=>String(c?.name||'').toLowerCase().includes('czech'))||(COUNTRIES||[])[0];
    const country=typeof resolveCountryData==='function'
      ?resolveCountryData(sourceCountry)
      :sourceCountry;

    const G=this._baseGame({
      name:'David',
      surname:'Kučera',
      gender:'male',
      country,
      diff:'normal',
      trait:'resilient',
      ambition:'wealth',
      diffProfile,
    });

    Object.assign(G,{
      happiness:78,
      health:54,
      smarts:20,
      looks:49,
      fitness:37,
      stress:0,
      karma:0,
      money:0,
      fame:0,
      reputation:50,
      mentalHealth:60,
      familySupport:18000,
      skillPoints:2,
    });

    G.rels.father={name:'Jan',surname:'Kučera',gender:'male',role:'father',age:32,love:84,alive:true};
    G.rels.mother={name:'Tereza',surname:'Kučera',gender:'female',role:'mother',age:30,love:88,alive:true};
    G.rels.siblings=[{name:'Michal',surname:'Kučera',gender:'male',role:'sibling',age:7,love:73,alive:true}];
    G.statHistory=[
      {hap:68,hlt:49,smt:14,lks:40,fit:29,str:8,fam:0,kar:0,rep:48,mnd:56},
      {hap:72,hlt:50,smt:16,lks:42,fit:31,str:7,fam:0,kar:0,rep:49,mnd:57},
      {hap:75,hlt:52,smt:17,lks:45,fit:33,str:5,fam:0,kar:0,rep:49,mnd:58},
      {hap:78,hlt:54,smt:20,lks:49,fit:37,str:0,fam:0,kar:0,rep:50,mnd:60},
    ];

    G.log=[
      {age:0,text:'Growth focus generated: Healthy Start, Safe & Happy, Secure Family Bond...',type:'special'},
      {age:0,text:'Future dream recorded. It will become relevant as this child grows.',type:'special'},
      {age:0,text:'Trait: Resilient — +Health, survives pressure better.',type:'bad'},
      {age:0,text:'Local economy: cost of living 52%, salary market 58%, starting wealth 55%.',type:'neutral'},
      {age:0,text:'Your family has Kč18K set aside for your adulthood. It is reserved for adulthood, not personal spending money.',type:'money'},
      {age:0,text:'Born into an average family in Czech Republic.',type:'neutral'},
      {age:0,text:'Sibling: Michal, age 7.',type:'neutral'},
      {age:0,text:'Father: Jan  •  Mother: Tereza.',type:'neutral'},
      {age:0,text:'David Kučera was born in Czech Republic.',type:'special'},
      {age:0,text:'Legacy Inheritance: "money" bonus applied from ancestor.',type:'special'},
    ].map((entry,index)=>({...entry,ts:Date.now()-index*1000,cat:typeof logCategory==='function'?logCategory(entry):'other'}));

    try{
      if(typeof Goals!=='undefined')Goals.ensurePersonalGoals(G,true);
      if(typeof Health!=='undefined')Health._ensureState?.(G);
      if(typeof Hustle!=='undefined')Hustle.ensureState?.(G);
      if(typeof Pets!=='undefined')Pets.ensureState?.(G);
    }catch(e){
      console.warn('preview state setup warning',e);
    }

    window.G=G;
    this.show('game-screen');
    if(typeof UI!=='undefined'){
      UI._settings.showChapters=false;
      UI.tab('life');
      UI.update();
    }
  },

  _bindShortcuts(){
    const TABS=['life','mind','love','career','assets','health','crime','social','business','hustle','pets','skills','stocks','goals'];
    document.addEventListener('keydown',e=>{
      if(typeof UI!=='undefined'&&UI.handleGlobalKeydown?.(e))return;

      const active=document.getElementById('game-screen')?.classList.contains('active');
      const typing=e.target?.matches?.('input,textarea,select,button,[contenteditable="true"],[contenteditable=""]')||e.target?.isContentEditable;
      const modalOpen=!!document.querySelector('.modal-bg.open,.modal.open,[role="dialog"].open');

      if(modalOpen)return;

      if((e.code==='Space'||e.code==='Enter')&&this._ageShortcutHeld)return;
      if((e.code==='Space'||e.code==='Enter')&&active&&!typing){
        this._ageShortcutHeld=true;
        e.preventDefault();
        Engine.ageUp();
      }

      const n=parseInt(e.key,10);
      if(n>=1&&n<=9&&active&&!typing){
        const tab=TABS[n-1];
        if(tab&&typeof UI!=='undefined')UI.tab(tab);
      }
    });

    document.addEventListener('keyup',e=>{
      if(e.code==='Space'||e.code==='Enter')this._ageShortcutHeld=false;
    });

    window.addEventListener('blur',()=>{this._ageShortcutHeld=false;});
  },

  _bindUiAccessibility(){
    const enhance=()=>{if(typeof UI!=='undefined'&&UI.enhanceInteractive)UI.enhanceInteractive(document);};
    enhance();

    document.addEventListener('click',e=>{
      const locked=e.target?.closest?.('.locked');
      if(!locked)return;
      const inline=(locked.getAttribute('onclick')||'').trim();
      if(inline)return;
      if(typeof UI!=='undefined'&&UI.toast)UI.toast(UI.lockedReason(locked),'neutral');
    });

    const content=document.getElementById('game-content')||document.body;
    const observer=new MutationObserver(mutations=>{
      for(const m of mutations){
        m.addedNodes.forEach(node=>{
          if(node.nodeType===1&&typeof UI!=='undefined'&&UI.enhanceInteractive)UI.enhanceInteractive(node);
        });
      }
    });
    observer.observe(content,{childList:true,subtree:true});
  },

  ensureDynamicTabs(){
    const nav=document.querySelector('.nav-bar');
    const content=document.querySelector('.content-area');
    const kbHint=[...document.querySelectorAll('.settings-lbl')].find(el=>el.textContent.includes('KEYBOARD:'));
    if(kbHint)kbHint.innerHTML='KEYBOARD: <kbd>Space</kbd>/<kbd>Enter</kbd> = Age Up &nbsp; <kbd>1-9</kbd> = First 9 tabs';

    if(nav&&!nav.querySelector('[data-tab="hustle"]')){
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='nt';
      btn.dataset.tab='hustle';
      btn.setAttribute('onclick',"UI.tab('hustle')");
      btn.innerHTML='<span class="ni">$</span><span class="nl">Hustle</span><span class="tab-dot" id="dot-hustle"></span>';
      const biz=nav.querySelector('[data-tab="business"]');
      if(biz?.nextSibling)nav.insertBefore(btn,biz.nextSibling);
      else nav.appendChild(btn);
    }

    if(content&&!document.getElementById('tab-hustle')){
      const panel=document.createElement('div');
      panel.id='tab-hustle';
      panel.className='tab-panel';
      const bizPanel=document.getElementById('tab-business');
      if(bizPanel?.nextSibling)content.insertBefore(panel,bizPanel.nextSibling);
      else content.appendChild(panel);
    }
  },

  show(id){
    if(typeof UI!=='undefined'&&UI.closeAnyModal)UI.closeAnyModal();
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
    if(id==='splash-screen'){
      const btn=document.getElementById('btn-continue');
      if(btn&&typeof Save!=='undefined'&&Save.has)btn.disabled=!Save.has();
    }
    if(id==='create-screen')Create.updatePreview();
  },

  newLife(){
    this.show('create-screen');
    Create.reset();

    if(typeof Legacy!=='undefined'){
      Legacy._selectedOpt='none';
      Legacy._selectedBonus=0;
      const p=Legacy.getPrestige();
      if(p.legacyUnlocked&&p.lastGrade)Legacy.renderLegacySection(p.lastGrade);
      else{
        const el=document.getElementById('legacy-section');
        if(el)el.style.display='none';
      }
    }
  },

  _n(v,fb=0){
    return Number.isFinite(v)?v:fb;
  },

  migrateGameState(saved){
    if(!saved||typeof saved!=='object')return null;

    saved.version=this.VERSION;
    saved.stress=this._n(saved.stress,0);
    saved.karma=this._n(saved.karma,0);
    saved.fitness=this._n(saved.fitness,50);
    saved.fame=this._n(saved.fame,0);
    saved.pets=Array.isArray(saved.pets)?saved.pets:[];
    saved.petHistory=Array.isArray(saved.petHistory)?saved.petHistory:[];
    saved.petActionUses=saved.petActionUses&&typeof saved.petActionUses==='object'?saved.petActionUses:{};
    saved.petActionYear=Number.isFinite(saved.petActionYear)?saved.petActionYear:(saved.age||0);
    saved.completedGoals=Array.isArray(saved.completedGoals)?saved.completedGoals:[];
    saved.goalHistory=Array.isArray(saved.goalHistory)?saved.goalHistory:[];
    saved.goalStats=saved.goalStats&&typeof saved.goalStats==='object'?saved.goalStats:{completed:0,recalibrations:0,lastCompletedAge:null};
    saved.skills=saved.skills&&typeof saved.skills==='object'?saved.skills:{};
    saved.skillPoints=this._n(saved.skillPoints,0);
    saved.stocks=saved.stocks&&typeof saved.stocks==='object'?saved.stocks:{portfolio:{},prices:null,history:{}};
    saved.stocks.portfolio=saved.stocks.portfolio||{};
    saved.stocks.history=saved.stocks.history||{};
    saved.achievements=saved.achievements&&typeof saved.achievements==='object'?saved.achievements:{};
    saved.conditions=Array.isArray(saved.conditions)?saved.conditions:[];
    saved.crimes=Array.isArray(saved.crimes)?saved.crimes:[];
    saved.addictions=saved.addictions&&typeof saved.addictions==='object'?saved.addictions:{};
    saved.insurance=saved.insurance&&typeof saved.insurance==='object'?saved.insurance:{};
    saved.social=saved.social&&typeof saved.social==='object'?saved.social:{};
    saved.hustle=saved.hustle&&typeof saved.hustle==='object'?saved.hustle:{};
    saved.careerBoss=saved.careerBoss||null;

    saved.gender=saved.gender||'male';
    saved.country=typeof resolveCountryData==='function'
      ?resolveCountryData(saved.country||COUNTRIES[0])
      :(saved.country||COUNTRIES[0]);
    saved.name=saved.name||(typeof randomNameForCountry==='function'?randomNameForCountry(saved.country?.name,saved.gender):pick(saved.gender==='female'?FNAMES:MNAMES));
    saved.surname=saved.surname||(typeof randomSurnameForCountry==='function'?randomSurnameForCountry(saved.country?.name):pick(SURNAMES));
    saved.age=this._n(saved.age,0);
    saved.year=this._n(saved.year,0);
    saved.alive=saved.alive!==false;
    saved.money=this._n(saved.money,0);
    saved.familySupport=this._n(saved.familySupport,0);
    saved.familySupportReleased=!!saved.familySupportReleased;

    if(saved.age<18&&saved.money>1000&&!saved.familySupportReleased){
      saved.familySupport+=saved.money;
      saved.money=0;
    }

    saved.happiness=this._n(saved.happiness,50);
    saved.health=this._n(saved.health,50);
    saved.smarts=this._n(saved.smarts,50);
    saved.looks=this._n(saved.looks,50);

    saved.rels=saved.rels&&typeof saved.rels==='object'?saved.rels:{};
    saved.rels.father=saved.rels.father||null;
    saved.rels.mother=saved.rels.mother||null;
    saved.rels.friends=Array.isArray(saved.rels.friends)?saved.rels.friends:[];
    saved.rels.siblings=Array.isArray(saved.rels.siblings)?saved.rels.siblings:[];
    saved.rels.children=Array.isArray(saved.rels.children)?saved.rels.children:[];
    saved.rels.exes=Array.isArray(saved.rels.exes)?saved.rels.exes:[];
    saved.rels.lovers=Array.isArray(saved.rels.lovers)?saved.rels.lovers:[];
    if(!('partner' in saved.rels))saved.rels.partner=null;

    saved.assets=saved.assets&&typeof saved.assets==='object'?saved.assets:{properties:[],vehicles:[]};
    saved.assets.properties=Array.isArray(saved.assets.properties)?saved.assets.properties:[];
    saved.assets.vehicles=Array.isArray(saved.assets.vehicles)?saved.assets.vehicles:[];

    saved.sexualHealth=saved.sexualHealth&&typeof saved.sexualHealth==='object'?saved.sexualHealth:{};
    saved.sexualHealth.std=!!saved.sexualHealth.std;
    saved.sexualHealth.sti=!!(saved.sexualHealth.sti||saved.sexualHealth.std);
    saved.sexualHealth.partners=this._n(saved.sexualHealth.partners,0);
    saved.sexualHealth.partnerIds=Array.isArray(saved.sexualHealth.partnerIds)?saved.sexualHealth.partnerIds:[];
    saved.sexualHealth.protectedEncounters=this._n(saved.sexualHealth.protectedEncounters,0);
    saved.sexualHealth.unprotectedEncounters=this._n(saved.sexualHealth.unprotectedEncounters,0);
    saved.sexualHealth.lastCheckupAge=Number.isFinite(saved.sexualHealth.lastCheckupAge)?saved.sexualHealth.lastCheckupAge:null;

    saved.hustle.rep=this._n(saved.hustle.rep,0);
    saved.hustle.earnings=this._n(saved.hustle.earnings,0);
    saved.hustle.lastGigAge=this._n(saved.hustle.lastGigAge,-1);
    saved.hustle.lastActionAge=this._n(saved.hustle.lastActionAge,saved.hustle.lastGigAge);
    saved.hustle.streak=this._n(saved.hustle.streak,0);
    saved.hustle.clients=this._n(saved.hustle.clients,0);
    saved.hustle.bestYear=this._n(saved.hustle.bestYear,0);
    saved.hustle.totalActions=this._n(saved.hustle.totalActions,0);
    saved.hustle.ventures=saved.hustle.ventures&&typeof saved.hustle.ventures==='object'?saved.hustle.ventures:{};
    saved.hustle.actionUses=saved.hustle.actionUses&&typeof saved.hustle.actionUses==='object'?saved.hustle.actionUses:{};
    saved.hustle.actionYear=Number.isFinite(saved.hustle.actionYear)?saved.hustle.actionYear:(saved.age||0);
    saved.hustle.history=Array.isArray(saved.hustle.history)?saved.hustle.history:[];

    if(saved.hustle.ventures.onlyfans&&!saved.hustle.ventures.premium_creator){
      saved.hustle.ventures.premium_creator=saved.hustle.ventures.onlyfans;
      saved.hustle.ventures.premium_creator.id='premium_creator';
      delete saved.hustle.ventures.onlyfans;
    }

    if(saved.career?.id==='content_creator_adult'){
      if(!saved.hustle.ventures.premium_creator){
        const yrs=Math.max(0,saved.yearsAtJob||0);
        const level=Math.max(1,Math.min(5,1+Math.floor(yrs/3)));
        saved.hustle.ventures.premium_creator={
          id:'premium_creator',
          level,
          progress:Math.min(100,25+(yrs*9)),
          momentum:Math.min(100,40+(yrs*6)),
          audience:Math.max(250,Math.round((saved.followers||0)*0.35)+(yrs*650)),
          clients:0,
          earned:Math.max(0,Math.round(yrs*18000)),
          startedAge:Math.max(18,(saved.age||18)-yrs),
          lastWorkedAge:saved.age||-1,
          brandRisk:35,
          quality:45,
        };
      }
      saved.hustle.rep=Math.max(saved.hustle.rep||0,35+Math.min(35,Math.round((saved.yearsAtJob||0)*4)));
      saved.followers=Math.max(saved.followers||0,2000+((saved.yearsAtJob||0)*1200));
      saved.career=null;
      saved.yearsAtJob=0;
      saved.careerCompany='';
      saved.jobPerf=50;
      saved.careerBoss=null;
    }

    saved.countriesVisited=Array.isArray(saved.countriesVisited)?saved.countriesVisited:[];
    saved.lifetimeGambled=this._n(saved.lifetimeGambled,0);
    saved.lifetimeDonated=this._n(saved.lifetimeDonated,0);
    saved.inheritanceReceived=this._n(saved.inheritanceReceived,0);
    saved.happyStreak=this._n(saved.happyStreak,0);
    saved.lowStressStreak=this._n(saved.lowStressStreak,0);
    saved.healthyStreak=this._n(saved.healthyStreak,0);
    saved.log=Array.isArray(saved.log)?saved.log:[];
    saved.statHistory=Array.isArray(saved.statHistory)?saved.statHistory:[];
    saved.eventMemory=Array.isArray(saved.eventMemory)?saved.eventMemory:[];
    saved.worldEventMemory=Array.isArray(saved.worldEventMemory)?saved.worldEventMemory:[];
    saved.ageUpSerial=Number.isFinite(saved.ageUpSerial)?saved.ageUpSerial:0;
    saved.chapters=Array.isArray(saved.chapters)?saved.chapters:[];
    saved.legacyBonus=saved.legacyBonus||null;

    saved.food=saved.food&&typeof saved.food==='object'?saved.food:{};
    saved.food.plan=saved.food.plan||'cook';
    saved.food.healthyYears=this._n(saved.food.healthyYears,0);
    saved.food.junkYears=this._n(saved.food.junkYears,0);
    saved.food.skippedYears=this._n(saved.food.skippedYears,0);
    saved.food.lastCost=this._n(saved.food.lastCost,0);
    saved.food.groceryCost=this._n(saved.food.groceryCost,0);
    saved.food.diningCost=this._n(saved.food.diningCost,0);
    saved.food.nutritionScore=this._n(saved.food.nutritionScore,55);
    saved.food.foodSecurity=this._n(saved.food.foodSecurity,100);
    saved.food.weightTrend=saved.food.weightTrend||'stable';
    saved.food.lastChoiceLabel=saved.food.lastChoiceLabel||'Cook at home';

    saved.creditScore=creditClamp(this._n(saved.creditScore,650));
    saved.loans=Array.isArray(saved.loans)?saved.loans:[];
    saved.debtCollections=this._n(saved.debtCollections,0);
    saved.missedPayments=this._n(saved.missedPayments,0);

    saved.recovery=saved.recovery&&typeof saved.recovery==='object'?saved.recovery:{};
    saved.recovery.active=!!saved.recovery.active;
    saved.recovery.cleanStreak=this._n(saved.recovery.cleanStreak,0);
    saved.recovery.rehabCount=this._n(saved.recovery.rehabCount,0);
    saved.recovery.relapseChance=this._n(saved.recovery.relapseChance,0.18);

    saved.alimony=saved.alimony&&typeof saved.alimony==='object'?saved.alimony:{amount:0,yearsLeft:0,recipient:''};
    saved.alimony.amount=this._n(saved.alimony.amount,0);
    saved.alimony.yearsLeft=this._n(saved.alimony.yearsLeft,0);
    saved.alimony.recipient=saved.alimony.recipient||'';

    saved.pregnancy=saved.pregnancy||null;
    saved.pregnancies=Array.isArray(saved.pregnancies)?saved.pregnancies:[];
    if(saved.pregnancy&&typeof saved.pregnancy==='object'){
      const exists=saved.pregnancies.some(p=>p&&(p.id===saved.pregnancy.id||(p.partnerId===saved.pregnancy.partnerId&&p.partnerName===saved.pregnancy.partnerName&&p.dueAge===saved.pregnancy.dueAge)));
      if(!exists)saved.pregnancies.push({...saved.pregnancy});
    }
    saved.pregnancies=saved.pregnancies.filter(p=>p&&typeof p==='object').map(p=>({
      id:p.id||('preg_'+Math.random().toString(36).slice(2)),
      partnerId:p.partnerId||null,
      partnerName:p.partnerName||'someone',
      partnerGender:p.partnerGender||null,
      dueAge:this._n(p.dueAge,(saved.age||0)+1),
      keep:p.keep!==false,
      assisted:!!p.assisted,
      twins:!!p.twins,
      source:p.source||'natural',
      startedAge:this._n(p.startedAge,saved.age||0),
    }));
    saved.pregnancy=saved.pregnancies[0]||null;
    saved.lastLivingCosts=this._n(saved.lastLivingCosts,0);
    saved.lastUnexpectedExpense=this._n(saved.lastUnexpectedExpense,0);
    saved.housingPlan=saved.housingPlan||'standard';
    saved.familyDebtPending=this._n(saved.familyDebtPending,0);

    if(saved.age<18&&saved.debtCollections>0){
      saved.familyDebtPending+=saved.debtCollections;
      saved.debtCollections=0;
      saved.missedPayments=0;
    }

    saved.activeGoals=saved.activeGoals||null;
    saved.goalSeed=Number.isFinite(saved.goalSeed)?saved.goalSeed:null;
    saved.goalGeneratedAge=Number.isFinite(saved.goalGeneratedAge)?saved.goalGeneratedAge:(saved.age||0);
    saved.lastGoalRecalibrateAge=Number.isFinite(saved.lastGoalRecalibrateAge)?saved.lastGoalRecalibrateAge:-999;

    saved.careerHistory=Array.isArray(saved.careerHistory)?saved.careerHistory:[];
    saved.educationHistory=Array.isArray(saved.educationHistory)?saved.educationHistory:[];
    saved.careerEventMemory=Array.isArray(saved.careerEventMemory)?saved.careerEventMemory:[];
    saved.careerActionUses=saved.careerActionUses&&typeof saved.careerActionUses==='object'?saved.careerActionUses:{};
    saved.careerActionYear=Number.isFinite(saved.careerActionYear)?saved.careerActionYear:(saved.age||0);

    saved.crimeHistory=Array.isArray(saved.crimeHistory)?saved.crimeHistory:[];
    saved.crimeJobMemory=Array.isArray(saved.crimeJobMemory)?saved.crimeJobMemory:[];
    saved.crimeEventMemory=Array.isArray(saved.crimeEventMemory)?saved.crimeEventMemory:[];
    saved.crimeActionUses=saved.crimeActionUses&&typeof saved.crimeActionUses==='object'?saved.crimeActionUses:{};
    saved.crimeActionYear=Number.isFinite(saved.crimeActionYear)?saved.crimeActionYear:(saved.age||0);

    saved.healthActionUses=saved.healthActionUses&&typeof saved.healthActionUses==='object'?saved.healthActionUses:{};
    saved.healthActionYear=Number.isFinite(saved.healthActionYear)?saved.healthActionYear:(saved.age||0);

    if(saved.rels.partner){
      saved.rels.partner.stage=saved.rels.partner.stage||(saved.rels.partner.married?'married':'dating');
      saved.rels.partner.chemistry=this._n(saved.rels.partner.chemistry,r(45,85));
      saved.rels.partner.intimacy=this._n(saved.rels.partner.intimacy,40);
      saved.rels.partner.dates=this._n(saved.rels.partner.dates,0);
      saved.rels.partner.yearsTogether=this._n(saved.rels.partner.yearsTogether,0);
      saved.rels.partner.engaged=!!saved.rels.partner.engaged||saved.rels.partner.stage==='engaged';
      if(saved.rels.partner.stage==='married')saved.rels.partner.married=true;
    }

    if(saved.rels.father)saved.rels.father.surname=saved.surname;
    if(saved.rels.mother)saved.rels.mother.surname=saved.surname;

    saved.rels.siblings=saved.rels.siblings.map(s=>({...s,surname:s.surname||saved.surname,alive:s.alive!==false}));
    saved.rels.children=saved.rels.children.map(c=>({
      ...c,
      role:'child',
      alive:c.alive!==false,
      surname:c.surname||saved.surname,
      love:this._n(c.love,r(55,80)),
      school:this._n(c.school,70),
      wellbeing:this._n(c.wellbeing,70),
      issue:c.issue||'',
      issueSeverity:this._n(c.issueSeverity,0),
      independent:!!c.independent,
    }));

    if(typeof Pets!=='undefined')Pets.ensureState(saved);
    if(typeof Hustle!=='undefined')Hustle.ensureState(saved);
    if(typeof Health!=='undefined')Health._ensureState?.(saved);
    if(typeof Goals!=='undefined')Goals.ensurePersonalGoals?.(saved,false);

    return saved;
  },

  loadGame(){
    if(typeof Save==='undefined'){UI.toast('Save system missing.','bad');return;}
    const loaded=Save.load();
    const saved=this.migrateGameState(loaded);
    if(!saved){UI.toast('No saved life found!','bad');return;}

    window.G=saved;
    this.show('game-screen');
    UI.tab(saved.inPrison?'crime':'life');
    UI.update();
    Save.save(saved);
    UI.toast(`Welcome back, ${saved.name}! Age ${saved.age}.`,'good');
  },

  _baseGame({name,surname,gender,country,diff,trait,ambition,diffProfile}){
    return{
      version:this.VERSION,
      name,surname,gender,country,
      difficulty:diff,trait,ambition,ambitionAchieved:false,
      age:0,year:0,alive:true,causeOfDeath:'',
      happiness:0,health:0,smarts:0,looks:0,fitness:50,fame:0,
      stress:0,karma:diffProfile.karma||0,money:0,
      retired:false,retirementPension:0,
      education:'none',inSchool:false,inUniversity:false,univYear:0,univType:null,
      career:null,yearsAtJob:0,careerCompany:'',jobPerf:50,promotionCount:0,
      rels:{father:null,mother:null,siblings:[],partner:null,children:[],friends:[],exes:[],lovers:[]},
      assets:{properties:[],vehicles:[]},
      sexualHealth:{std:false,sti:false,partners:0,partnerIds:[],protectedEncounters:0,unprotectedEncounters:0,lastCheckupAge:null},
      business:null,followers:0,socialEarnings:0,social:{},
      hustle:{rep:0,earnings:0,lastGigAge:-1,lastActionAge:-1,streak:0,clients:0,ventures:{},bestYear:0,totalActions:0,actionYear:0,actionUses:{},history:[]},
      careerBoss:null,
      conditions:[],crimes:[],inPrison:false,prisonYears:0,
      addictions:{},insurance:{},
      food:{plan:'cook',healthyYears:0,junkYears:0,skippedYears:0,lastCost:0,groceryCost:0,diningCost:0,nutritionScore:55,foodSecurity:100,weightTrend:'stable',lastChoiceLabel:'Cook at home'},
      creditScore:diffProfile.credit,loans:[],debtCollections:0,missedPayments:0,
      recovery:{active:false,cleanStreak:0,rehabCount:0,relapseChance:0.18},
      alimony:{amount:0,yearsLeft:0,recipient:''},pregnancy:null,pregnancies:[],
      lastLivingCosts:0,lastUnexpectedExpense:0,housingPlan:'standard',familyDebtPending:0,
      familySupport:0,familySupportReleased:false,
      pets:[],petHistory:[],petActionYear:0,petActionUses:{},
      completedGoals:[],activeGoals:null,goalSeed:null,goalGeneratedAge:0,lastGoalRecalibrateAge:-999,goalHistory:[],goalStats:{completed:0,recalibrations:0,lastCompletedAge:null},
      achievements:{},
      skills:{},skillPoints:0,stocks:{portfolio:{},prices:null,history:{}},
      countriesVisited:[],lifetimeGambled:0,lifetimeDonated:0,
      inheritanceReceived:0,happyStreak:0,lowStressStreak:0,healthyStreak:0,
      log:[],statHistory:[],eventMemory:[],worldEventMemory:[],ageUpSerial:0,chapters:[],legacyBonus:null,
      careerHistory:[],educationHistory:[],careerEventMemory:[],careerActionYear:0,careerActionUses:{},
      crimeHistory:[],crimeJobMemory:[],crimeEventMemory:[],crimeActionYear:0,crimeActionUses:{},
      healthActionYear:0,healthActionUses:{},
    };
  },

  startGame(){
    if(this._starting){UI.toast('New life is already being created.','neutral');return;}
    this._starting=true;

    try{
      Create.syncGenderFromName(true);

      const cIdx=parseInt(document.getElementById('inp-country')?.value,10)||0;
      const diff=Create.selectedDiff||document.getElementById('inp-diff')?.value||'normal';
      const country=typeof resolveCountryData==='function'
        ?resolveCountryData(COUNTRIES[cIdx]||COUNTRIES[0])
        :(COUNTRIES[cIdx]||COUNTRIES[0]);
      const name=(document.getElementById('inp-name')?.value.trim())||(typeof randomNameForCountry==='function'?randomNameForCountry(country.name,Create.gender):pick(Create.gender==='female'?FNAMES:MNAMES));
      const surname=typeof randomSurnameForCountry==='function'?randomSurnameForCountry(country.name):pick(SURNAMES);
      const trait=Create.selectedTrait||'resilient';
      const ambition=Create.selectedAmbition||'wealth';
      const diffProfile=DIFFICULTY_PROFILES[diff]||DIFFICULTY_PROFILES.normal;

      window.G=this._baseGame({name,surname,gender:Create.gender,country,diff,trait,ambition,diffProfile});
      const G=window.G;

      const sets={
        easy:[r(70,95),r(70,95),r(55,80),r(55,80),r(55,80),0],
        normal:[r(40,75),r(40,75),r(20,65),r(20,65),r(30,60),0],
        hard:[r(20,50),r(20,50),r(10,40),r(10,40),r(15,40),0],
        extreme:[r(8,32),r(8,32),r(5,28),r(5,28),r(10,30),0],
        custom:[
          parseInt(document.getElementById('cs-hap')?.value,10)||50,
          parseInt(document.getElementById('cs-hlt')?.value,10)||50,
          parseInt(document.getElementById('cs-smt')?.value,10)||50,
          parseInt(document.getElementById('cs-lks')?.value,10)||50,
          50,0
        ],
      };

      const s=sets[diff]||sets.normal;
      [G.happiness,G.health,G.smarts,G.looks,G.fitness,G.money]=s;

      G.familySupport=wealthScale(diffProfile.cash||0,G);
      G.money=0;
      G.stress=cl((G.stress||0)+(diffProfile.stress||0));

      if(diffProfile.debt){
        G.familyDebtPending=wealthScale(diffProfile.debt,G);
        G.missedPayments=diff==='extreme'?2:1;
      }

      const traitDef=PERSONALITY_TRAITS.find(t=>t.id===trait);
      if(traitDef?.startBonus){
        Object.entries(traitDef.startBonus).forEach(([k,v])=>{
          if(k==='money')G.familySupport+=wealthScale(v,G);
          else if(k==='fitness')G.fitness=cl((G.fitness||50)+v);
          else if(k==='skillPoints')G.skillPoints=(G.skillPoints||0)+v;
          else if(G[k]!==undefined)G[k]=cl(G[k]+v);
        });
      }

      const ambDef=LIFE_AMBITIONS.find(a=>a.id===ambition);
      if(ambDef){
        if(ambition==='healthy'){G.health=cl(G.health+8);G.fitness=cl((G.fitness||50)+8);}
        if(ambition==='career_top')G.smarts=cl(G.smarts+10);
        if(ambition==='traveller')G.happiness=cl(G.happiness+8);
        if(ambition==='criminal')G.familySupport+=wealthScale(500,G);
        if(ambition==='sage')G.skillPoints=(G.skillPoints||0)+2;
        if(ambition==='investor')G.familySupport+=wealthScale(2000,G);
        if(ambition==='renaissance')G.skillPoints=(G.skillPoints||0)+1;
        if(ambition==='academic'){G.smarts=cl(G.smarts+6);G.skillPoints=(G.skillPoints||0)+1;}
        if(ambition==='philanthropist')G.karma=cl((G.karma||0)+10,-100,100);
        if(ambition==='legend'){G.happiness=cl(G.happiness+5);G.health=cl(G.health+5);}
        if(ambition==='minimalist')G.happiness=cl(G.happiness+8);
        if(ambition==='entrepreneur')G.smarts=cl(G.smarts+4);
      }

      if(typeof Legacy!=='undefined'&&Legacy._selectedOpt&&Legacy._selectedOpt!=='none'){
        Legacy.applyInheritance(G,Legacy._selectedOpt,Legacy._selectedBonus);
        Engine.log(`🌳 Legacy Inheritance: "${Legacy._selectedOpt}" bonus applied from ancestor.`,'special');
      }

      G.rels.father=Engine.npc('father','male');
      G.rels.mother=Engine.npc('mother','female');
      G.rels.father.age=r(22,34);
      G.rels.mother.age=r(20,32);
      G.rels.father.surname=G.surname;
      G.rels.mother.surname=G.surname;

      if(Math.random()>0.42){
        const sib=Engine.npc('sibling',Math.random()>.5?'female':'male');
        for(let tries=0;tries<5&&sib.name===G.name;tries++)sib.name=Engine.npc('sibling',sib.gender).name;
        sib.age=r(0,9);
        sib.surname=G.surname;
        G.rels.siblings.push(sib);
      }

      Engine.log(`👶 ${G.name} ${G.surname} was born in ${G.country.flag} ${G.country.name}.`,'special');
      Engine.log(`👨 Father: ${G.rels.father.name} · 👩 Mother: ${G.rels.mother.name}.`,'neutral');
      if(G.rels.siblings.length)Engine.log(`👦 Sibling: ${G.rels.siblings[0].name}, age ${G.rels.siblings[0].age}.`,'neutral');

      const dl={easy:'a wealthy family',normal:'an average family',hard:'a struggling family',extreme:'extremely difficult circumstances',custom:'a custom start'};
      Engine.log(`🌍 Born into ${dl[diff]||'a family'} in ${G.country.name}.`,'neutral');

      if(G.familySupport>0)Engine.log(`🏦 Your family has ${fmt(G.familySupport)} set aside for your adulthood. It is reserved for adulthood, not personal spending money.`, 'money');
      if(diffProfile.debt)Engine.log(`💳 Your family is under financial pressure. If things do not improve, ${fmt(G.familyDebtPending)} may follow you into adulthood.`, 'bad');
      if(G.country){
        Engine.log(`🌐 Local economy: cost of living ${Math.round((G.country.costMult||1)*100)}%, salary market ${Math.round((G.country.salaryMult||1)*100)}%, starting wealth ${Math.round((G.country.wealthMult||1)*100)}%.`,'neutral');
      }
      if(traitDef)Engine.log(`${traitDef.icon} Trait: ${traitDef.name} — ${traitDef.desc}.`,'special');
      if(ambDef)Engine.log(`🌱 A future ambition will take shape as ${G.name} grows.`,'special');

      try{
        const personalGoals=Goals.ensurePersonalGoals(G,true);
        Engine.log(`🎯 Personal goals generated: ${personalGoals.slice(0,3).map(g=>g.name).join(', ')}${personalGoals.length>3?'...':''}`, 'special');
      }catch(e){console.warn(e);}

      if(typeof Health!=='undefined')Health._ensureState?.(G);
      if(typeof Hustle!=='undefined')Hustle.ensureState?.(G);
      if(typeof Pets!=='undefined')Pets.ensureState?.(G);

      this.show('game-screen');
      UI.tab('life');
      UI.update();
      Save.autosave(G);
    }catch(e){
      console.warn('startGame failed',e);
      UI.toast('New life could not be created. Check console for the exact error.','bad');
    }finally{
      this._starting=false;
    }
  },

  showHOF(){
    const hof=[...Save.hofAll()].sort((a,b)=>(b.score||0)-(a.score||0));
    const el=document.getElementById('hof-body');
    const medals=['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🏅','🏅','🏅','🏅','🏅'];

    if(!hof.length){
      el.innerHTML='<div class="empty"><span class="ei">🏆</span><p>No completed lives yet.<br>Play a full life to enter!</p></div>';
    }else{
      const gradeColor=g=>g==='S'?'#ffd700':g==='A'?'var(--green)':g==='B'?'var(--cyan)':g==='C'?'var(--yellow)':g==='D'?'var(--orange)':'var(--red)';
      const esc=v=>typeof escHTML==='function'?escHTML(v):String(v??'');
      el.innerHTML=hof.map((e,i)=>`
        <div class="hof-card" style="animation-delay:${i*0.06}s">
          <div class="hof-rank">${medals[i]||'🎖️'}</div>
          <div class="hof-info">
            <div class="hof-name">${esc(e.country||'')} ${esc(e.name)} <span style="color:${gradeColor(e.grade||'?')}">Grade ${esc(e.grade||'?')}</span></div>
            <div class="hof-meta">${esc(e.countryName||'Unknown')} · Died age ${e.age} · ${esc(e.cause)}</div>
            <div class="hof-meta">${esc(e.career||'Unemployed')} · ${esc(e.educationLabel||'No formal education')} · ${e.children||0} kid${e.children!==1?'s':''}${e.partnerStatus?` · ${esc(e.partnerStatus)}`:''}</div>
            <div class="hof-meta">Happiness ${e.happiness??0}% · Health ${e.health??0}% · Fame ${fmtFollowers(e.followers||0)} · Goals ${e.completedGoals||0}/${e.totalGoals||0}</div>
            <div class="hof-meta">Top skills: ${e.topSkills&&e.topSkills.length?e.topSkills.map(esc).join(', '):'None'}${e.highlight?` · ${esc(e.highlight)}`:''}</div>
          </div>
          <div class="hof-worth">
            <div>${fmtFull(e.netWorth||0)}</div>
            <div style="font-size:10px;color:var(--muted);margin-top:4px">Score ${Math.round(e.score||0)}</div>
          </div>
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
      ACHIEVEMENTS.map((a,i)=>{
        const done=unlocked.includes(a.id);
        return`<div class="ach-card ${done?'unlocked':''}" style="animation-delay:${i*0.025}s">
          <div class="ach-ico">${done?a.icon:'❓'}</div>
          <div class="ach-info">
            <div class="ach-name">${done?a.name:'Hidden Achievement'}</div>
            <div class="ach-desc">${done?a.desc:'Complete more lives to discover this.'}</div>
          </div>
          <div style="font-size:18px">${done?'✅':'🔒'}</div>
        </div>`;
      }).join('');

    this.show('ach-screen');
  },

  showUpdates(event){
    event?.preventDefault?.();
    event?.stopPropagation?.();

    const modal=document.getElementById('updates-modal');
    const body=document.getElementById('updates-body');
    if(!modal||!body){
      console.warn('Update log UI is unavailable.');
      return false;
    }

    // Keep global dialogs outside #app so legacy overflow/stacking rules can never clip them.
    if(modal.parentElement!==document.body)document.body.appendChild(modal);

    const rawUpdates=Array.isArray(window.LIFESIM_UPDATES)?window.LIFESIM_UPDATES:[];
    const versionRank=value=>{
      const match=String(value||'').match(/v?(\d+)(?:\.(\d+))?/i);
      return match?(Number(match[1])*100+Number(match[2]||0)):0;
    };
    const updates=[...rawUpdates].sort((a,b)=>{
      const dateDelta=(Date.parse(b?.date||'')||0)-(Date.parse(a?.date||'')||0);
      return dateDelta||versionRank(b?.version)-versionRank(a?.version);
    });
    body.innerHTML=updates.length?updates.map((u,index)=>`
      <article class="update-entry${index===0?' current-update':''}">
        <div class="update-entry-head">
          <div>
            <div class="update-entry-title">${escHTML(u.title||'LifeSim update')}</div>
            <div class="prestige-sub">${escHTML(u.date||'Date unavailable')}${u.tag?` · ${escHTML(u.tag)}`:''}</div>
          </div>
          <div class="update-entry-meta">${escHTML(u.version||'Update')}</div>
        </div>
        <ul>${(Array.isArray(u.highlights)?u.highlights:[]).map(x=>`<li>${escHTML(x)}</li>`).join('')}</ul>
      </article>`).join(''):'<div class="empty"><p>No update data found.</p></div>';

    document.body.classList.add('modal-open');
    if(typeof UI!=='undefined'&&UI.openModal)UI.openModal(modal);
    else{
      modal.classList.add('open');
      requestAnimationFrame(()=>modal.querySelector('button')?.focus?.({preventScroll:true}));
    }
    return false;
  },
};

const Create={
  gender:'male',
  selectedTrait:'resilient',
  selectedAmbition:'wealth',
  selectedDiff:'normal',
  _lastSuggestedName:'',

  currentVersionLabel(){
    const build=document.getElementById('app')?.dataset.build;
    if(build)return `v${build}`;
    return `v${window.App?.VERSION||1}`;
  },

  hydrateBuilderLayout(){
    const screen=document.getElementById('create-screen');
    if(!screen||screen.dataset.builderHydrated==='1')return;
    screen.dataset.builderHydrated='1';
    screen.classList.add('create-builder-screen');
    const setChildren=(parent,...kids)=>{
      if(!parent)return;
      while(parent.firstChild)parent.removeChild(parent.firstChild);
      kids.filter(Boolean).forEach(k=>parent.appendChild(k));
    };

    const topbar=screen.querySelector('.topbar, .create-builder-topbar');
    if(topbar){
      topbar.className='create-builder-topbar';
      topbar.innerHTML=`
        <button type="button" class="create-builder-back" onclick="App.show('splash-screen')">&larr; Back</button>
        <div class="create-builder-title-wrap">
          <span class="create-builder-title-mark" aria-hidden="true">&#10022;</span>
          <span class="create-builder-title">Create Your Life</span>
        </div>
        <span class="create-version">${this.currentVersionLabel()}</span>`;
    }

    const scroll=screen.querySelector('.create-scroll, .create-builder-scroll');
    if(scroll)scroll.className='create-builder-scroll';

    const hero=scroll?.firstElementChild;
    if(hero){
      hero.className='create-builder-hero';
      hero.innerHTML=`
        <div class="create-builder-kicker">Origin Builder</div>
        <h2>Build the person. Then survive the story.</h2>
        <p>Choose your identity, background, ambition and start conditions. Every choice shapes your money, pressure, support and long-term options.</p>`;
    }

    const grid=screen.querySelector('.create-inner, .create-builder-grid');
    const left=screen.querySelector('.create-left, .identity-panel');
    const right=screen.querySelector('.create-right, .path-panel');
    if(scroll&&grid)scroll.appendChild(grid);
    if(grid)grid.className='create-builder-grid';
    if(left)left.className='create-panel identity-panel';
    if(right)right.className='create-panel path-panel';

    const avatar=document.getElementById('create-avatar');
    const nameGroup=document.getElementById('inp-name')?.closest('.form-group');
    const genderGroup=document.getElementById('gbtn-m')?.closest('.form-group');
    const countryGroup=document.getElementById('inp-country')?.closest('.form-group');
    const diffGroup=document.getElementById('origin-ui-diff-cards')?.closest('.form-group');
    const customStats=document.getElementById('custom-stats');
    const traitGroup=document.getElementById('trait-grid')?.closest('.form-group');
    const ambitionGroup=document.getElementById('ambition-list')?.closest('.form-group');
    const summaryStack=screen.querySelector('.create-summary-stack');
    const statPreview=document.getElementById('origin-ui-stat-preview');
    const previewBox=document.getElementById('create-preview-box');
    const previewText=document.getElementById('preview-text');
    const legacy=document.getElementById('legacy-section');
    const tipBox=screen.querySelector('.origin-ui-tip-box');
    const beginBtn=screen.querySelector('.origin-ui-begin-btn');

    const panelHead=title=>{
      const wrap=document.createElement('div');
      wrap.className='create-panel-head';
      wrap.innerHTML=`<div class="create-panel-kicker">${title}</div>`;
      return wrap;
    };
    const sectionCopy=text=>{
      const p=document.createElement('p');
      p.className='builder-section-copy';
      p.textContent=text;
      return p;
    };
    const sectionTitle=text=>{
      const div=document.createElement('div');
      div.className='builder-section-title';
      div.textContent=text;
      return div;
    };

    if(nameGroup){
      nameGroup.classList.add('builder-form-group');
      nameGroup.querySelector('.form-label')?.classList.add('builder-label');
      const inline=nameGroup.querySelector('div');
      const input=document.getElementById('inp-name');
      const button=inline?.querySelector('button');
      if(inline)inline.className='builder-inline';
      if(input)input.classList.add('builder-input');
      if(button){
        button.className='builder-icon-btn';
        button.innerHTML='&#9856;';
        button.removeAttribute('style');
        button.removeAttribute('onmouseover');
        button.removeAttribute('onmouseout');
      }
    }

    if(genderGroup){
      genderGroup.classList.add('builder-form-group');
      genderGroup.querySelector('.form-label')?.classList.add('builder-label');
      genderGroup.querySelector('.gender-grid')?.classList.add('builder-gender-grid');
    }

    if(countryGroup){
      countryGroup.classList.add('builder-form-group');
      countryGroup.querySelector('.form-label')?.classList.add('builder-label');
      countryGroup.querySelector('.form-select')?.classList.add('builder-select');
      countryGroup.querySelector('#origin-ui-country-info')?.classList.add('builder-country-info');
    }

    if(diffGroup){
      diffGroup.classList.add('builder-form-group','builder-section-gap');
      const label=diffGroup.querySelector('.form-label');
      if(label){
        label.classList.add('builder-label');
        label.textContent='Quick Setup';
      }
      if(!diffGroup.querySelector('.builder-section-copy')){
        label?.insertAdjacentHTML('afterend','<p class="builder-section-copy">Choose how forgiving or brutal your starting conditions should be.</p>');
      }
      document.getElementById('origin-ui-diff-cards')?.classList.add('builder-quick-setup');
    }

    if(customStats){
      const display=customStats.style.display||'none';
      customStats.removeAttribute('style');
      customStats.style.display=display;
      customStats.className='builder-custom-stats';
      const title=customStats.querySelector('div');
      if(title){
        title.className='builder-mini-title';
        title.textContent='Custom Start Tuning';
      }
    }

    if(avatar&&left){
      const avatarRow=document.createElement('div');
      avatarRow.className='identity-avatar-row';
      const avatarCopy=document.createElement('div');
      avatarCopy.className='identity-avatar-copy';
      avatarCopy.innerHTML='<div class="identity-avatar-title">Shape the core person</div><p class="identity-avatar-sub">Pick a name, gender and country of birth. These choices anchor the rest of the life story.</p>';
      avatarRow.append(avatar,avatarCopy);
      setChildren(
        left,
        panelHead('Identity'),
        avatarRow,
        nameGroup,
        genderGroup,
        countryGroup,
        diffGroup,
        customStats
      );
    }

    if(grid&&right){
      let personalityPanel=grid.querySelector('.personality-panel');
      if(!personalityPanel){
        personalityPanel=document.createElement('section');
        personalityPanel.className='create-panel personality-panel';
        grid.insertBefore(personalityPanel,right);
      }

      if(traitGroup){
        traitGroup.classList.add('builder-form-group');
        const label=traitGroup.querySelector('.form-label');
        if(label){
          label.classList.add('builder-label');
          label.textContent='Core Trait';
        }
        traitGroup.querySelector('.trait-grid')?.classList.add('builder-trait-grid');
      }
      if(statPreview)statPreview.classList.add('builder-stat-preview');

      setChildren(
        personalityPanel,
        panelHead('Personality & Background'),
        sectionTitle('Core Trait'),
        sectionCopy('Your trait drives the opening stat spread and nudges how your life unfolds.'),
        traitGroup,
        sectionTitle('Starting Stats Preview'),
        sectionCopy('A live read on the person you are building before the first year begins.'),
        statPreview
      );
    }

    if(ambitionGroup){
      ambitionGroup.classList.add('builder-form-group');
      const label=ambitionGroup.querySelector('.form-label');
      if(label){
        label.classList.add('builder-label');
        label.textContent='Life Ambition';
      }
      if(!ambitionGroup.querySelector('.builder-section-copy')){
        label?.insertAdjacentHTML('afterend','<p class="builder-section-copy">Choose the long-term direction that will shape your priorities and story arc.</p>');
      }
      ambitionGroup.querySelector('#ambition-list')?.classList.add('builder-ambition-list');
    }

    if(previewBox&&previewText){
      previewBox.removeAttribute('style');
      previewText.removeAttribute('style');
      previewBox.className='builder-preview-box';
      const previewHead=document.createElement('div');
      previewHead.className='builder-preview-head';
      previewHead.innerHTML='<div class="builder-mini-title">Life Summary</div><div class="ver-badge" style="font-size:9px">Dynamic Origin</div>';
      previewText.className='builder-preview-text';
      setChildren(previewBox,previewHead,previewText);
    }

    if(legacy)legacy.classList.add('builder-legacy-box');

    if(tipBox){
      tipBox.classList.add('builder-tip-box');
      tipBox.innerHTML='<div class="builder-mini-title">Story Tip</div><p>Story events fire naturally every few years. Your setup affects how much support, stress and momentum you carry into adulthood.</p>';
    }

    if(beginBtn){
      beginBtn.classList.add('builder-begin-btn');
      beginBtn.innerHTML='Begin Your Story &rarr;';
      beginBtn.removeAttribute('style');
    }

    if(summaryStack){
      summaryStack.classList.add('create-summary-stack');
      if(beginBtn)summaryStack.appendChild(beginBtn);
    }

    if(right){
      setChildren(
        right,
        panelHead('Life Path & Origin'),
        ambitionGroup,
        summaryStack
      );
    }
  },

  fillCountries(opts={}){
    const sel=document.getElementById('inp-country');
    if(!sel)return;
    const previousValue=opts.preserveSelection?sel.value:'';
    const previousCountry=opts.preserveSelection?this.currentCountry()?.name:'';
    sel.innerHTML=COUNTRIES.map((c,i)=>`<option value="${i}">${c.flag} ${c.name}</option>`).join('');
    let targetIndex=-1;
    if(opts.preserveSelection&&previousValue!==''&&COUNTRIES[Number(previousValue)])targetIndex=Number(previousValue);
    if(targetIndex<0&&opts.preserveSelection&&previousCountry){
      targetIndex=COUNTRIES.findIndex(c=>c.name===previousCountry||c.officialName===previousCountry||(c.aliases||[]).includes(previousCountry));
    }
    if(targetIndex<0){
      targetIndex=COUNTRIES.findIndex(c=>c.name==='Czech Republic'||c.name==='Czechia');
    }
    sel.value=String(targetIndex>=0?targetIndex:0);
    this._updateCountryInfo();
    this.updatePreview();
  },

  currentCountry(){
    const cIdx=parseInt(document.getElementById('inp-country')?.value,10)||0;
    return COUNTRIES[cIdx]||COUNTRIES[0];
  },

  suggestedName(g=this.gender){
    const country=this.currentCountry();
    return typeof randomNameForCountry==='function'
      ?randomNameForCountry(country?.name,g)
      :pick(g==='female'?FNAMES:MNAMES);
  },

  setGender(g,opts={}){
    this.gender=g;
    document.getElementById('gbtn-m')?.classList.toggle('selected',g==='male');
    document.getElementById('gbtn-f')?.classList.toggle('selected',g==='female');
    if(!opts.keepName){
      const next=this.suggestedName(g);
      const input=document.getElementById('inp-name');
      if(input)input.value=next;
      this._lastSuggestedName=next;
    }
    const av=document.getElementById('create-avatar');
    if(av)av.textContent=g==='female'?'👧':'👦';
    this.updatePreview();
  },

  handleCountryChange(){
    const input=document.getElementById('inp-name');
    if(input){
      const current=input.value.trim();
      if(!current||current===this._lastSuggestedName){
        const next=this.suggestedName(this.gender);
        input.value=next;
        this._lastSuggestedName=next;
      }
    }
    this._updateCountryInfo();
    this.updatePreview();
  },

  _updateCountryInfo(){
    const c=this.currentCountry();
    const el=document.getElementById('origin-ui-country-info');
    if(!el||!c)return;
    const stats=[
      c.populationText?`Population <strong>${c.populationText}</strong>`:'',
      c.gdpPerCapita?`GDP/cap <strong>${countryUsdLabel(c.gdpPerCapita)}</strong>`:'',
      c.lifeExp?`Life exp <strong>${c.lifeExp}y</strong>`:'',
      c.currency?`Currency <strong>${c.currency}</strong>`:'',
      c.languageText?`Languages <strong>${escHTML(c.languageText)}</strong>`:'',
      c.costMult?`Living cost <strong>${Math.round(c.costMult*100)}%</strong>`:'',
      c.salaryMult?`Salary market <strong>${Math.round(c.salaryMult*100)}%</strong>`:'',
      c.wealthMult?`Starting wealth <strong>${Math.round(c.wealthMult*100)}%</strong>`:''
    ].filter(Boolean);
    el.innerHTML=`<span class="flag">${c.flag||'🌍'}</span><span class="details"><strong>${escHTML(c.name)}</strong><span class="meta">${stats.join(' · ')}</span></span>`;
  },

  syncGenderFromName(force=false){
    const el=document.getElementById('inp-name');if(!el)return;
    const guessed=this.guessGenderFromName(el.value);
    if(guessed&&(force||guessed!==this.gender))this.setGender(guessed,{keepName:true});
  },

  guessGenderFromName(name){
    const clean=(name||'').trim().split(/\s+/)[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    if(!clean)return null;
    const norm=n=>(n||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const maleBase=typeof countryFirstNames==='function'?countryFirstNames('male'):MNAMES;
    const femaleBase=typeof countryFirstNames==='function'?countryFirstNames('female'):FNAMES;
    const male=new Set([...maleBase,'John','Michael','Robert','Joseph'].map(norm));
    const female=new Set([...femaleBase,'Emily','Elizabeth','Abigail','Ella'].map(norm));
    const inMale=male.has(clean),inFemale=female.has(clean);
    if(inMale&&!inFemale)return'male';
    if(inFemale&&!inMale)return'female';
    return null;
  },

  // ── Trait bonus pills ─────────────────────────────
  _bonusPills(bonus){
    if(!bonus||typeof bonus!=='object')return'';
    const labels={
      smarts:'🧠 Smarts',health:'❤️ Health',happiness:'😊 Happy',
      looks:'✨ Looks',fitness:'⚡ Fit',karma:'⚖️ Karma',
      stress:'😤 Stress',fame:'🌟 Fame',money:'💰 Money',skillPoints:'🎓 Skill Pts'
    };
    return '<div class="origin-ui-bonus-pills">'+Object.entries(bonus).map(([k,v])=>{
      const lbl=labels[k]||k;
      const cls=k==='stress'?(v>0?'neg':'pos'):(v>0?'pos':'neg');
      const sign=v>0?'+':'';
      return`<span class="origin-ui-pill ${cls}">${sign}${v} ${lbl}</span>`;
    }).join('')+'</div>';
  },

  renderTraits(){
    const g=document.getElementById('trait-grid');if(!g)return;
    g.innerHTML=PERSONALITY_TRAITS.map(t=>`
      <button type="button" class="trait-btn ${t.id===this.selectedTrait?'selected':''}" onclick="Create.selectTrait('${t.id}')" id="trait-${t.id}">
        <span class="ti">${t.icon}</span>
        <div class="td">
          <span class="tn">${t.name}</span>
          <span class="ts">${t.desc}</span>
          ${this._bonusPills(t.startBonus)}
        </div>
      </button>`).join('');
  },

  renderAmbitions(){
    const g=document.getElementById('ambition-list');if(!g)return;
    g.innerHTML=LIFE_AMBITIONS.map(a=>`
      <button type="button" class="ambition-btn ${a.id===this.selectedAmbition?'selected':''}" onclick="Create.selectAmbition('${a.id}')" id="amb-${a.id}">
        <span class="ai">${a.icon}</span>
        <div>
          <div class="an">${a.name}</div>
          <div class="as">${a.desc}</div>
        </div>
      </button>`).join('');
  },

  // ── Difficulty cards (replaces dropdown) ─────────
  renderDiffCards(){
    const wrap=document.getElementById('origin-ui-diff-cards');if(!wrap)return;
    const diffs=[
      {id:'easy',    icon:'😊',name:'Easy',   note:'Wealthy family start'},
      {id:'normal',  icon:'🙂',name:'Normal', note:'Average balanced start'},
      {id:'hard',    icon:'😤',name:'Hard',   note:'Struggling family'},
      {id:'extreme', icon:'💀',name:'Extreme',note:'Brutal — no safety net'},
      {id:'custom',  icon:'⚙️',name:'Custom', note:'Set your own stats'},
    ];
    wrap.innerHTML=diffs.map(d=>`
      <button type="button" class="origin-ui-diff-card ${d.id===this.selectedDiff?'selected':''}" data-diff="${d.id}" onclick="Create.selectDiff('${d.id}')" aria-pressed="${d.id===this.selectedDiff?'true':'false'}">
        <div class="origin-ui-diff-icon">${d.icon}</div>
        <div class="origin-ui-diff-name">${d.name}</div>
        <div class="origin-ui-diff-note">${d.note}</div>
      </button>`).join('');
  },

  selectDiff(id){
    this.selectedDiff=id;
    document.querySelectorAll('.origin-ui-diff-card').forEach(b=>{
      const selected=b.dataset.diff===id;
      b.classList.toggle('selected',selected);
      b.setAttribute('aria-pressed',selected?'true':'false');
    });
    // Show/hide custom stats
    const cs=document.getElementById('custom-stats');
    if(cs)cs.style.display=id==='custom'?'block':'none';
    // Also update hidden select for compatibility
    const sel=document.getElementById('inp-diff');
    if(sel)sel.value=id;
    this.updatePreview();
    this._updateStatPreview();
  },

  selectTrait(id){
    this.selectedTrait=id;
    document.querySelectorAll('.trait-btn').forEach(b=>b.classList.remove('selected'));
    document.getElementById('trait-'+id)?.classList.add('selected');
    this.updatePreview();
    this._updateStatPreview();
  },

  selectAmbition(id){
    this.selectedAmbition=id;
    document.querySelectorAll('.ambition-btn').forEach(b=>b.classList.remove('selected'));
    document.getElementById('amb-'+id)?.classList.add('selected');
    this.updatePreview();
  },

  sl(id,val){
    const el=document.getElementById('cs-'+id+'-v');
    if(el)el.textContent=val;
    this.updatePreview();
    this._updateStatPreview();
  },

  // ── Stat preview bars ─────────────────────────────
  _updateStatPreview(){
    const wrap=document.getElementById('origin-ui-stat-preview');if(!wrap)return;
    const trait=PERSONALITY_TRAITS.find(t=>t.id===this.selectedTrait);
    const bonus=trait?.startBonus||{};
    const diff=this.selectedDiff||'normal';
    const dp=DIFFICULTY_PROFILES[diff]||DIFFICULTY_PROFILES.normal;

    const baseHap=50+(diff==='easy'?15:diff==='hard'?-10:diff==='extreme'?-20:0);
    const baseHlt=60;
    const baseSmt=50+(bonus.smarts||0);
    const baseLks=50+(bonus.looks||0);
    const baseFit=50+(bonus.fitness||0);

    const stats=[
      {label:'😊 Happiness', val:Math.min(99,baseHap+(bonus.happiness||0)),   color:'#fbbf24'},
      {label:'❤️ Health',    val:Math.min(99,baseHlt+(bonus.health||0)),       color:'#34d399'},
      {label:'🧠 Smarts',    val:Math.min(99,baseSmt),                          color:'#22d3ee'},
      {label:'✨ Looks',     val:Math.min(99,baseLks),                          color:'#f472b6'},
      {label:'⚡ Fitness',   val:Math.min(99,baseFit),                          color:'#fb923c'},
    ];

    wrap.innerHTML=`<div class="origin-ui-stat-preview-title">Starting Stats Preview</div>`+
      stats.map(s=>`
        <div class="origin-ui-sp-row">
          <span class="origin-ui-sp-label">${s.label}</span>
          <div class="origin-ui-sp-track"><div class="origin-ui-sp-fill" style="width:${Math.max(2,s.val)}%;background:${s.color}"></div></div>
          <span class="origin-ui-sp-val" style="color:${s.color}">${Math.round(s.val)}</span>
        </div>`).join('');
  },

  updatePreview(){
    const el=document.getElementById('preview-text');if(!el)return;
    const td=PERSONALITY_TRAITS.find(t=>t.id===this.selectedTrait);
    const amb=LIFE_AMBITIONS.find(a=>a.id===this.selectedAmbition);
    const diff=this.selectedDiff||'normal';
    const dp=DIFFICULTY_PROFILES[diff]||DIFFICULTY_PROFILES.normal;
    const country=this.currentCountry();
    const support=country?wealthScale(dp.cash||0,{country}):dp.cash||0;
    el.innerHTML=[
      country?`🌍 <strong>${country.flag} ${country.name}</strong> · Pop ${country.populationText||'Unknown'} · Life exp ${country.lifeExp}y`:'',
      country?`💹 GDP/cap <strong>${countryUsdLabel(country.gdpPerCapita)}</strong> · ${escHTML(country.languageText||'Unknown')} · ${escHTML(country.currencyText||country.currency||'$')}`:'',
      country?`🏙️ Living cost <strong>${Math.round((country.costMult||1)*100)}%</strong> · Salary market <strong>${Math.round((country.salaryMult||1)*100)}%</strong> · Starting wealth <strong>${Math.round((country.wealthMult||1)*100)}%</strong>`:'',
      td?`${td.icon} Trait: <strong>${td.name}</strong> — ${td.desc}`:'',
      amb?`🎯 Ambition: <strong>${amb.name}</strong> — ${amb.desc}`:'',
      `📊 Start: <strong>${dp.label}</strong> · ${dp.note}`,
      `🏦 Adult support preview: <strong>${fmtFull(support,{country})}</strong> at age 18`,
    ].filter(Boolean).map(l=>`<div>${l}</div>`).join('');
  },

  reset(){
    this.selectedTrait='resilient';
    this.selectedAmbition='wealth';
    this.selectedDiff='normal';
    this._lastSuggestedName='';
    ['hap','hlt','smt','lks'].forEach(id=>{
      const slider=document.getElementById(`cs-${id}`);
      const output=document.getElementById(`cs-${id}-v`);
      if(slider)slider.value='50';
      if(output)output.textContent='50';
    });
    const sel=document.getElementById('inp-diff');
    if(sel)sel.value='normal';
    const cs=document.getElementById('custom-stats');
    if(cs)cs.style.display='none';
    this.fillCountries();
    this.setGender('male');
    this.renderTraits();
    this.renderAmbitions();
    this.renderDiffCards();
    this.updatePreview();
    this._updateStatPreview();
  },
};

document.addEventListener('DOMContentLoaded',()=>App.init());
