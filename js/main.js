/* js/main.js — LifeSim v13 Reforged app bootstrap, creation and save migration */
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
  VERSION:13,

  init(){
    this.ensureDynamicTabs();
    Create.fillCountries();
    Create.setGender('male');
    Create.renderTraits();
    Create.renderAmbitions();

    const diff=document.getElementById('inp-diff');
    if(diff)diff.addEventListener('change',e=>{
      const cs=document.getElementById('custom-stats');
      if(cs)cs.style.display=e.target.value==='custom'?'block':'none';
      Create.updatePreview();
    });

    document.getElementById('inp-country')?.addEventListener('change',()=>Create.handleCountryChange());
    document.getElementById('inp-name')?.addEventListener('input',()=>Create.syncGenderFromName());

    if(typeof Save!=='undefined'&&Save.has()){
      const btn=document.getElementById('btn-continue');
      if(btn)btn.disabled=false;
    }

    if(typeof Legacy!=='undefined')Legacy.renderSplashPrestige();
    this._bindShortcuts();

    if(typeof UI!=='undefined'&&UI.loadSettings)UI.loadSettings();
  },

  _bindShortcuts(){
    const TABS=['life','mind','love','career','assets','health','crime','social','business','hustle','pets','skills','stocks','goals'];
    document.addEventListener('keydown',e=>{
      const active=document.getElementById('game-screen')?.classList.contains('active');
      const typing=e.target?.matches?.('input,textarea,select,button');

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

  ensureDynamicTabs(){
    const nav=document.querySelector('.nav-bar');
    const content=document.querySelector('.content-area');
    const kbHint=[...document.querySelectorAll('.settings-lbl')].find(el=>el.textContent.includes('KEYBOARD:'));
    if(kbHint)kbHint.innerHTML='KEYBOARD: <kbd>Space</kbd>/<kbd>Enter</kbd> = Age Up &nbsp; <kbd>1-9</kbd> = Switch tabs';

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
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
  },

  newLife(){
    this.show('create-screen');
    Create.reset();

    if(typeof Legacy!=='undefined'){
      const p=Legacy.getPrestige();
      if(p.legacyUnlocked&&p.lastGrade)Legacy.renderLegacySection(p.lastGrade);
      else{
        const el=document.getElementById('legacy-section');
        if(el)el.style.display='none';
      }
      Legacy._selectedOpt='none';
      Legacy._selectedBonus=0;
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
    saved.country=saved.country||COUNTRIES[0];
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
      rels:{father:null,mother:null,siblings:[],partner:null,children:[],friends:[],exes:[]},
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
      alimony:{amount:0,yearsLeft:0,recipient:''},pregnancy:null,
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
      const diff=document.getElementById('inp-diff')?.value||'normal';
      const country=COUNTRIES[cIdx]||COUNTRIES[0];
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

      G.familySupport=sc(diffProfile.cash||0);
      G.money=0;
      G.stress=cl((G.stress||0)+(diffProfile.stress||0));

      if(diffProfile.debt){
        G.familyDebtPending=sc(diffProfile.debt);
        G.missedPayments=diff==='extreme'?2:1;
      }

      const traitDef=PERSONALITY_TRAITS.find(t=>t.id===trait);
      if(traitDef?.startBonus){
        Object.entries(traitDef.startBonus).forEach(([k,v])=>{
          if(k==='money')G.familySupport+=sc(v);
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
        if(ambition==='criminal')G.familySupport+=sc(500);
        if(ambition==='sage')G.skillPoints=(G.skillPoints||0)+2;
        if(ambition==='investor')G.familySupport+=sc(2000);
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
        sib.age=r(0,9);
        sib.surname=G.surname;
        G.rels.siblings.push(sib);
      }

      Engine.log(`👶 ${G.name} ${G.surname} was born in ${G.country.flag} ${G.country.name}.`,'special');
      Engine.log(`👨 Father: ${G.rels.father.name} · 👩 Mother: ${G.rels.mother.name}.`,'neutral');
      if(G.rels.siblings.length)Engine.log(`👦 Sibling: ${G.rels.siblings[0].name}, age ${G.rels.siblings[0].age}.`,'neutral');

      const dl={easy:'a wealthy family',normal:'an average family',hard:'a struggling family',extreme:'extremely difficult circumstances',custom:'a custom start'};
      Engine.log(`🌍 Born into ${dl[diff]||'a family'} in ${G.country.name}.`,'neutral');

      if(G.familySupport>0)Engine.log(`🏦 Your family has ${fmt(G.familySupport)} set aside for your adulthood. It is not your personal baby money yet.`, 'money');
      if(diffProfile.debt)Engine.log(`💳 Your family is under financial pressure. If things do not improve, ${fmt(G.familyDebtPending)} may follow you into adulthood.`, 'bad');
      if(traitDef)Engine.log(`${traitDef.icon} Trait: ${traitDef.name} — ${traitDef.desc}.`,'special');
      if(ambDef)Engine.log(`🎯 Life Ambition: "${ambDef.name}" — ${ambDef.desc}.`,'special');

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
      Save.save(G);
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
};

const Create={
  gender:'male',
  selectedTrait:'resilient',
  selectedAmbition:'wealth',
  _lastSuggestedName:'',

  fillCountries(){
    const sel=document.getElementById('inp-country');
    if(!sel)return;
    sel.innerHTML=COUNTRIES.map((c,i)=>`<option value="${i}">${c.flag} ${c.name}</option>`).join('');
    const cz=COUNTRIES.findIndex(c=>c.name==='Czech Republic');
    if(cz>=0)sel.value=cz;
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
    this.updatePreview();
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
    const male=new Set([...maleBase,'John','Michael','Robert','Joseph','Ivan','Dmitry','Sergey','Alexei','Nikolai','Vladimir','Andrei','Mikhail'].map(norm));
    const female=new Set([...femaleBase,'Emily','Elizabeth','Abigail','Ella','Avery','Samantha','Anastasia','Daria','Ekaterina','Irina','Olga','Yulia','Svetlana'].map(norm));
    const inMale=male.has(clean),inFemale=female.has(clean);
    if(inMale&&!inFemale)return'male';
    if(inFemale&&!inMale)return'female';
    return null;
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

  selectTrait(id){
    this.selectedTrait=id;
    document.querySelectorAll('.trait-btn').forEach(b=>b.classList.remove('selected'));
    document.getElementById('trait-'+id)?.classList.add('selected');
    this.updatePreview();
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
  },

  updatePreview(){
    const el=document.getElementById('preview-text');if(!el)return;
    const td=PERSONALITY_TRAITS.find(t=>t.id===this.selectedTrait);
    const amb=LIFE_AMBITIONS.find(a=>a.id===this.selectedAmbition);
    const diff=document.getElementById('inp-diff')?.value||'normal';
    const dp=DIFFICULTY_PROFILES[diff]||DIFFICULTY_PROFILES.normal;
    const country=this.currentCountry();

    el.innerHTML=[
      country?`🌍 <strong>${country.flag} ${country.name}</strong> · ${country.currency} · Life expectancy ${country.lifeExp}y`:'',
      td?`${td.icon} Trait: <strong>${td.name}</strong> — ${td.desc}`:'',
      amb?`🎯 Ambition: <strong>${amb.name}</strong> — ${amb.desc}`:'',
      `📊 Difficulty: <strong>${dp.label}</strong> · ${dp.note}`,
      `⌨️ Keyboard: <strong>Space</strong> = Age up`,
    ].filter(Boolean).map(l=>`<div style="margin-bottom:5px">${l}</div>`).join('');
  },

  reset(){
    this.selectedTrait='resilient';
    this.selectedAmbition='wealth';
    this._lastSuggestedName='';
    const diff=document.getElementById('inp-diff');
    if(diff)diff.value='normal';
    const cs=document.getElementById('custom-stats');
    if(cs)cs.style.display='none';
    this.fillCountries();
    this.setGender('male');
    this.renderTraits();
    this.renderAmbitions();
    this.updatePreview();
  },
};

document.addEventListener('DOMContentLoaded',()=>App.init());