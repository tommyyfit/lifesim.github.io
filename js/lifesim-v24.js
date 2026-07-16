/* LifeSim v24: Living World — connected priorities, story arcs, evolving people and optional local AI. */
const LifeSimV24={
  VERSION:24,
  BUILD:'24.1.0',
  _patched:false,
  _pendingBefore:null,
  _finalizeTimer:null,

  clamp(value,min=0,max=100){return Math.max(min,Math.min(max,Number(value)||0));},
  esc(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));},
  uid(prefix='v24'){return`${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;},

  stageFor(age){
    const n=Math.max(0,Number(age)||0);
    return (window.V24_STAGES||[]).find(s=>n>=s.min&&n<=s.max)||{id:'adult',label:'Life',icon:'🌍',focus:'Build a meaningful life'};
  },

  ensure(G=window.G){
    if(!G||typeof G!=='object')return null;
    if(!G.v24||typeof G.v24!=='object')G.v24={};
    const V=G.v24;
    V.version=24;
    V.stage=this.stageFor(G.age).id;
    if(!V.personality||typeof V.personality!=='object')V.personality=this.initialPersonality(G);
    ['discipline','empathy','courage','sociability','honesty','ambition','humility'].forEach(k=>V.personality[k]=this.clamp(V.personality[k]??50));
    if(!Array.isArray(V.memories))V.memories=[];
    if(!Array.isArray(V.yearRecaps))V.yearRecaps=[];
    if(!Array.isArray(V.storyArcs))V.storyArcs=[];
    if(!Array.isArray(V.financialHistory))V.financialHistory=[];
    if(!V.world||typeof V.world!=='object')V.world=this.initialWorld(G);
    if(!Number.isFinite(V.lastPreparedAge))V.lastPreparedAge=-1;
    this.normalizePeople(G);
    this.prepareYear(G,false);
    return V;
  },

  initialPersonality(G){
    const base={discipline:50,empathy:50,courage:50,sociability:50,honesty:52,ambition:50,humility:50};
    const trait=String(G.trait||'');
    const mods={
      disciplined:{discipline:18,ambition:6},resilient:{courage:12,discipline:5},social:{sociability:18,empathy:6},
      charismatic:{sociability:15,courage:7},kind:{empathy:18,honesty:8},stoic:{discipline:9,courage:9,sociability:-5},
      lucky:{courage:5},athletic:{discipline:8,courage:5},naturalist:{empathy:7,humility:7},genius:{discipline:6,ambition:9,humility:-3},
      rebellious:{courage:12,discipline:-8},ambitious:{ambition:18,courage:5}
    }[trait]||{};
    Object.entries(mods).forEach(([k,v])=>base[k]=(base[k]||50)+v);
    if((G.karma||0)>10){base.empathy+=5;base.honesty+=4;}
    return base;
  },

  initialWorld(G){
    const c=G.country||{};
    return{
      economy:this.clamp(Math.round((c.salaryMult||1)*52),25,85),
      jobs:this.clamp(Math.round((c.salaryMult||1)*55),25,85),
      housing:this.clamp(Math.round(105-(c.costMult||1)*48),20,85),
      stability:this.clamp(Math.round((c.lifeExp||78)*0.82),35,90),
      technology:52,
      headline:'A normal year begins with uncertain opportunities.',
      tone:'neutral',
      lastAge:G.age||0
    };
  },

  normalizePeople(G){
    this.allPeople(G).forEach(person=>{
      if(!person||typeof person!=='object')return;
      const love=this.clamp(person.love??50);
      if(!Number.isFinite(person.trust))person.trust=this.clamp(love*0.9+5);
      if(!Number.isFinite(person.closeness))person.closeness=this.clamp(love);
      if(!Number.isFinite(person.respect))person.respect=this.clamp(45+love*0.35);
      if(!Number.isFinite(person.conflict))person.conflict=this.clamp(35-love*0.25);
      if(!person.lifeState)person.lifeState={career:null,location:G.country?.name||'Home',mood:'steady',lastChangedAge:G.age||0};
      person.love=Math.round((person.trust+person.closeness+person.respect-(person.conflict*0.35))/2.65);
      person.love=this.clamp(person.love);
    });
  },

  allPeople(G=window.G){
    if(!G)return[];
    const R=G.rels||{};
    const list=[];
    ['father','mother','partner'].forEach(k=>{if(R[k])list.push(R[k]);});
    ['parents','siblings','friends','children'].forEach(k=>{if(Array.isArray(R[k]))list.push(...R[k]);});
    return [...new Set(list.filter(Boolean))];
  },

  importantPeople(G=window.G){
    return this.allPeople(G).map(p=>({
      ...p,
      name:[p.name,p.surname].filter(Boolean).join(' ')||'Someone important',
      role:p.role||this.inferRole(G,p),trust:Math.round(p.trust||50),closeness:Math.round(p.closeness||50),respect:Math.round(p.respect||50),conflict:Math.round(p.conflict||0)
    })).sort((a,b)=>(b.closeness+b.trust-b.conflict)-(a.closeness+a.trust-a.conflict));
  },

  inferRole(G,p){
    const R=G.rels||{};
    if(R.partner===p)return'Partner';
    if(R.father===p)return'Father';if(R.mother===p)return'Mother';
    if((R.children||[]).includes(p))return'Child';if((R.siblings||[]).includes(p))return'Sibling';if((R.friends||[]).includes(p))return'Friend';
    return'Important person';
  },

  prepareYear(G=window.G,force=false){
    if(!G)return;
    const V=this.ensureShallow(G);
    if(!force&&V.lastPreparedAge===G.age&&V.annualPlan?.age===G.age)return;
    V.stage=this.stageFor(G.age).id;
    V.annualPlan={age:G.age,priorities:this.choosePriorities(G),focused:[],createdAt:Date.now()};
    V.lastPreparedAge=G.age;
    this.pruneStaleArcs(G);
    this.maybeStartArc(G);
  },

  ensureShallow(G){
    if(!G.v24||typeof G.v24!=='object')G.v24={};
    const V=G.v24;
    if(!V.personality)V.personality=this.initialPersonality(G);
    if(!Array.isArray(V.memories))V.memories=[];
    if(!Array.isArray(V.yearRecaps))V.yearRecaps=[];
    if(!Array.isArray(V.storyArcs))V.storyArcs=[];
    if(!Array.isArray(V.financialHistory))V.financialHistory=[];
    if(!V.world)V.world=this.initialWorld(G);
    return V;
  },

  choosePriorities(G){
    const stage=this.stageFor(G.age);
    const pool=[...(window.V24_PRIORITY_LIBRARY?.[stage.id]||[])];
    const score=p=>{
      let n=Math.random()*2;
      if(p.metric==='health')n+=(100-(G.health||60))/12+(G.stress||0)/20;
      if(p.metric==='wellbeing')n+=(100-(G.mentalHealth||60))/14+(G.stress||0)/22;
      if(p.metric==='school')n+=(100-(G.schoolPerformance||G.smarts||50))/15;
      if(p.metric==='family')n+=(100-this.familyScore(G))/15;
      if(p.metric==='relationship')n+=(100-this.relationshipScore(G))/16;
      if(p.metric==='friendship')n+=(G.rels?.friends||[]).length?1:6;
      if(p.metric==='money'&&G.age>=18)n+=(Math.max(0,5000-(G.money||0)))/1200+(G.debt||0)/5000;
      if(p.metric==='career')n+=G.career?2:7;
      if(p.metric==='skill')n+=Object.values(G.skills||{}).filter(v=>v>=2).length?1:5;
      if(p.metric==='legacy')n+=G.age/15;
      if(p.id==='repair_home'&&this.familyScore(G)<55)n+=7;
      if(p.id==='prevent_burnout'&&(G.stress||0)>55)n+=8;
      if(p.id==='adult_health'&&(G.health||0)<55)n+=8;
      return n;
    };
    return pool.map(p=>({...p,score:score(p)})).sort((a,b)=>b.score-a.score).slice(0,3).map(({score:_,...p})=>p);
  },

  familyScore(G){
    const people=this.importantPeople(G).filter(p=>['father','mother','parent','sibling','child','Father','Mother','Sibling','Child'].includes(p.role));
    if(!people.length)return 60;
    return people.reduce((s,p)=>s+p.closeness+p.trust-p.conflict*.5,0)/(people.length*1.5);
  },

  relationshipScore(G){
    const people=this.importantPeople(G);if(!people.length)return 45;
    return people.slice(0,4).reduce((s,p)=>s+p.closeness+p.trust+p.respect-p.conflict,0)/(Math.min(4,people.length)*3);
  },

  focusPriority(id){
    const G=window.G;if(!G||!G.alive)return;
    const V=this.ensure(G),plan=V.annualPlan;
    const p=plan.priorities.find(x=>x.id===id);if(!p)return;
    if(plan.focused.includes(id))return UI?.toast?.('You already gave this priority focused attention this year.','neutral');
    if(plan.focused.length>=2)return UI?.toast?.('You can deeply focus on two priorities per year. Age up when ready.','neutral');
    const effects=this.priorityEffects(p.metric,G);
    if(typeof applyStats==='function')applyStats(G,effects);else Object.entries(effects).forEach(([k,v])=>G[k]=this.clamp((G[k]||0)+v));
    plan.focused.push(id);
    this.shiftPersonality(V.personality,this.priorityPersonality(p.metric));
    const person=this.priorityPerson(G,p.metric);if(person)this.applyRelation(person,{trust:3,closeness:4,conflict:-2});
    Engine?.log?.(`${p.icon} Focused on “${p.title}”. Small consistent choices moved the year in a healthier direction.`,'good');
    this.recordMemory(G,p.title,`You deliberately focused on ${p.title.toLowerCase()}.`,'growth');
    UI?.toast?.('Priority advanced. Long-term progress comes from repeating good choices across years.','good');
    Save?.autosave?.(G);UI?.update?.();UI?.refreshActiveTab?.();
  },

  priorityEffects(metric,G){
    const map={
      health:{health:4,fitness:2,stress:-3},wellbeing:{mentalHealth:5,happiness:3,stress:-5},school:{smarts:5,stress:1},
      family:{happiness:4,stress:-2,karma:1},relationship:{happiness:4,stress:-3},friendship:{happiness:5,stress:-2},
      money:G.age<18?{smarts:3,happiness:1}:{smarts:2,stress:-2},career:{smarts:3,reputation:3,stress:1},skill:{smarts:4,happiness:2},
      identity:{mentalHealth:4,happiness:3,stress:-3},direction:{smarts:3,mentalHealth:2},talent:{smarts:3,happiness:4},legacy:{happiness:4,karma:3,stress:-2}
    };
    return map[metric]||{happiness:3,stress:-2};
  },

  priorityPersonality(metric){
    const map={health:{discipline:2},wellbeing:{humility:2},school:{discipline:2},family:{empathy:2},relationship:{empathy:2,honesty:1},friendship:{sociability:2},money:{discipline:2},career:{ambition:2,discipline:1},skill:{discipline:2},identity:{honesty:2,courage:1},direction:{courage:2},talent:{courage:1},legacy:{empathy:2,humility:2}};
    return map[metric]||{};
  },

  priorityPerson(G,metric){
    const people=this.importantPeople(G);
    if(metric==='family')return people.find(p=>/father|mother|parent|sibling|child/i.test(p.role));
    if(metric==='relationship'||metric==='friendship')return people[0];
    return null;
  },


  pruneStaleArcs(G){
    const V=this.ensureShallow(G),stage=this.stageFor(G.age).id;
    V.storyArcs.forEach(arc=>{
      if(arc.status!=='active')return;
      const template=(window.V24_ARC_LIBRARY||[]).find(x=>x.id===arc.templateId);
      const tooOld=(G.age-(arc.startedAge||G.age))>=4;
      if(template&&!template.stages.includes(stage)&&tooOld){
        arc.status='closed';arc.closedAge=G.age;
        this.recordMemory(G,template.title,`The chapter faded as life moved into ${this.stageFor(G.age).label.toLowerCase()}. Not every unfinished story waits forever.`,'reflection');
      }
    });
  },

  maybeStartArc(G){
    const V=this.ensureShallow(G);const active=V.storyArcs.filter(a=>a.status==='active');
    if(active.length>=2)return;
    const stage=this.stageFor(G.age).id;
    const lastStart=Math.max(-99,...V.storyArcs.map(a=>a.startedAge??-99));
    if(V.storyArcs.length&&G.age-lastStart<3)return;
    const used=new Set(V.storyArcs.map(a=>a.templateId));
    const activeTemplates=new Set(active.map(a=>a.templateId));
    const candidates=(window.V24_ARC_LIBRARY||[]).filter(a=>a.stages.includes(stage)&&!activeTemplates.has(a.id)&&(!used.has(a.id)||G.age-lastStart>12));
    if(!candidates.length)return;
    const template=candidates[Math.floor(Math.random()*candidates.length)];
    const npc=this.resolveArcNpc(G,template.npcRole);
    V.storyArcs.unshift({id:this.uid('arc'),templateId:template.id,title:template.title,icon:template.icon,beat:0,status:'active',startedAge:G.age,lastAdvancedAge:-1,npcId:npc?.id||null,npcName:npc?`${npc.name||''} ${npc.surname||''}`.trim():null});
  },

  resolveArcNpc(G,role){
    if(!role)return null;
    const people=this.allPeople(G);
    if(role==='family')return people.find(p=>/father|mother|parent|sibling|child/i.test(p.role||''))||people[0]||null;
    if(role==='friend')return (G.rels?.friends||[])[0]||this.createNpc(G,'friend');
    if(role==='mentor')return this.createNpc(G,'mentor',Math.max(24,(G.age||13)+12));
    if(role==='coworker')return this.createNpc(G,'coworker',Math.max(20,G.age+rnd(-4,8)));
    if(role==='younger')return (G.rels?.children||[])[0]||this.createNpc(G,'younger person',Math.max(12,G.age-rnd(20,40)));
    return null;
  },

  createNpc(G,role,age=null){
    const gender=Math.random()<.5?'female':'male';
    let npc;
    try{npc=Engine?.npc?.(role,gender,G.country?.name);}catch(_){npc=null;}
    npc=npc||{id:this.uid('npc'),name:gender==='female'?'Alex':'Sam',surname:'',gender,role,love:55,alive:true};
    npc.age=age??Math.max(0,G.age+rnd(-2,2));npc.role=role;npc.trust=52;npc.closeness=45;npc.respect=50;npc.conflict=5;
    G.rels=G.rels||{};G.rels.friends=Array.isArray(G.rels.friends)?G.rels.friends:[];
    if(['friend','mentor','coworker','younger person'].includes(role))G.rels.friends.push(npc);
    return npc;
  },

  activeArc(G=window.G){
    const V=this.ensure(G);return V.storyArcs.find(a=>a.status==='active'&&a.lastAdvancedAge!==G.age)||V.storyArcs.find(a=>a.status==='active')||null;
  },

  continueStory(){
    const G=window.G;if(!G||!G.alive)return;
    const V=this.ensure(G);let arc=this.activeArc(G);if(!arc){this.maybeStartArc(G);arc=this.activeArc(G);}
    if(!arc)return UI?.toast?.('No story chapter is ready yet. Focus on the current year and age up.','neutral');
    if(arc.lastAdvancedAge===G.age)return UI?.toast?.('This chapter already moved forward this year.','neutral');
    const template=(window.V24_ARC_LIBRARY||[]).find(x=>x.id===arc.templateId);const beat=template?.beats?.[arc.beat];
    if(!template||!beat){arc.status='complete';return this.continueStory();}
    const npc=this.findPersonById(G,arc.npcId);
    const text=beat.text.replace(/your friend/gi,npc?.name?`${npc.name}`:'your friend');
    const evt={icon:template.icon,title:beat.title,text,type:'special',choices:beat.choices.map(choice=>({
      label:choice.label,sub:choice.sub,e:choice.effects||{},fn:()=>this.resolveArcChoice(G,arc,template,beat,choice,npc)
    }))};
    UI.showEvent(evt,()=>{UI.update();UI.refreshActiveTab();});
  },

  resolveArcChoice(G,arc,template,beat,choice,npc){
    if(typeof applyStats==='function')applyStats(G,choice.effects||{});
    else Object.entries(choice.effects||{}).forEach(([k,v])=>G[k]=this.clamp((G[k]||0)+v));
    if(npc&&choice.relation)this.applyRelation(npc,choice.relation);
    if(choice.personality)this.shiftPersonality(G.v24.personality,choice.personality);
    arc.lastAdvancedAge=G.age;arc.beat+=1;
    const complete=arc.beat>=template.beats.length;if(complete){arc.status='complete';arc.completedAge=G.age;}
    this.recordMemory(G,beat.title,`${choice.label}. ${complete?`The chapter “${template.title}” reached its conclusion.`:'The story will continue in a later year.'}`,complete?'chapter':'choice');
    Engine?.log?.(`${template.icon} ${beat.title} — ${choice.label}.`,'special');
    Save?.autosave?.(G);
  },

  findPersonById(G,id){return this.allPeople(G).find(p=>p.id===id)||null;},
  applyRelation(person,changes){
    if(!person)return;
    Object.entries(changes||{}).forEach(([k,v])=>person[k]=this.clamp((person[k]??(k==='conflict'?0:50))+v));
    person.love=this.clamp((person.trust+person.closeness+person.respect-person.conflict*.35)/2.65);
  },
  shiftPersonality(personality,changes){Object.entries(changes||{}).forEach(([k,v])=>personality[k]=this.clamp((personality[k]??50)+v));},

  recordMemory(G,title,text,tone='neutral'){
    const V=this.ensureShallow(G);V.memories.unshift({id:this.uid('memory'),age:G.age,title:String(title),text:String(text),tone,createdAt:Date.now()});V.memories=V.memories.slice(0,120);
  },

  beforeAge(G){
    return{age:G.age,serial:G.ageUpSerial||0,money:G.money||0,netWorth:typeof netWorth==='function'?netWorth(G):(G.money||0),health:G.health,happiness:G.happiness,mentalHealth:G.mentalHealth,stress:G.stress,reputation:G.reputation,logLen:(G.log||[]).length,people:this.importantPeople(G).map(p=>({id:p.id,trust:p.trust,closeness:p.closeness,conflict:p.conflict}))};
  },

  scheduleFinalize(before){
    clearTimeout(this._finalizeTimer);
    const token=(this._finalizeToken||0)+1;this._finalizeToken=token;
    const finish=()=>{
      if(this._finalizeToken!==token)return;
      const G=window.G;
      if(!G)return;
      if(G.age===before.age||Engine?._aging){this._finalizeTimer=setTimeout(finish,150);return;}
      this._finalizeTimer=null;this.finalizeYear(G,before);
    };
    this._finalizeTimer=setTimeout(finish,100);
  },

  finalizeYear(G,before){
    const V=this.ensure(G);
    this.tickWorld(G);this.tickPeople(G);this.tickPersonality(G);
    this.prepareYear(G,true);
    const recap=this.buildRecap(G,before);
    V.yearRecaps.unshift(recap);V.yearRecaps=V.yearRecaps.slice(0,80);
    V.financialHistory.unshift({age:G.age,cashChange:recap.cashChange,netWorthChange:recap.netWorthChange,cash:G.money||0,createdAt:Date.now()});V.financialHistory=V.financialHistory.slice(0,80);
    this.recordMemory(G,recap.title,recap.summary,recap.tone);
    if(window.OllamaBridge?.config?.enabled&&OllamaBridge.config.yearNarratives){
      OllamaBridge.generateYearNarrative(G,recap).then(text=>{if(text&&window.G===G){recap.aiNarrative=text;this.update();Save?.autosave?.(G);}});
    }
    Save?.autosave?.(G);this.update();
  },

  tickWorld(G){
    const W=this.ensureShallow(G).world;const drift=()=>rnd(-5,5);
    W.economy=this.clamp(W.economy+drift(),15,90);W.jobs=this.clamp(W.jobs+Math.round(drift()*.8+(W.economy-50)*.03),15,90);W.housing=this.clamp(W.housing+drift(),10,90);W.stability=this.clamp(W.stability+rnd(-3,3),20,95);W.technology=this.clamp(W.technology+rnd(0,3),20,100);W.lastAge=G.age;
    const headlines=[];
    if(W.economy<35)headlines.push(['A weak economy is making stable income harder to protect.','bad']);
    if(W.economy>72)headlines.push(['A strong economy is opening more work and business opportunities.','good']);
    if(W.housing<30)headlines.push(['Housing pressure is rising and affordability is getting worse.','bad']);
    if(W.jobs>72)headlines.push(['Employers are competing for capable workers.','good']);
    if(W.stability<35)headlines.push(['Public uncertainty is increasing stress across the country.','bad']);
    if(W.technology>78)headlines.push(['New technology is reshaping education and work.','neutral']);
    const chosen=headlines[0]||['The wider world changes gradually around your personal life.','neutral'];W.headline=chosen[0];W.tone=chosen[1];
  },

  tickPeople(G){
    const V=this.ensureShallow(G);this.allPeople(G).forEach(person=>{
      if(person.alive===false)return;
      const state=person.lifeState||(person.lifeState={mood:'steady',lastChangedAge:G.age});
      if(Math.random()<.13){
        const changes=G.age<18?['busy with school','feeling more confident','dealing with family stress','excited about a hobby']:['changing direction at work','feeling financially pressured','more focused on family','thinking about a move','recovering from a stressful period'];
        state.mood=changes[Math.floor(Math.random()*changes.length)];state.lastChangedAge=G.age;
        if(Math.random()<.45)this.applyRelation(person,{closeness:rnd(-3,3),trust:rnd(-2,2),conflict:rnd(-2,3)});
      }
    });
    this.normalizePeople(G);
  },

  tickPersonality(G){
    const P=this.ensureShallow(G).personality;
    const observed={
      discipline:45+Math.min(25,Object.values(G.skills||{}).reduce((s,v)=>s+(Number(v)||0),0)*1.5),
      empathy:50+(G.karma||0)*.22+Math.max(0,this.familyScore(G)-50)*.18,
      courage:45+(G.reputation||50)*.1+((G.stress||0)>60?2:0),
      sociability:42+Math.min(28,(G.rels?.friends||[]).length*7)+(G.rels?.partner?7:0),
      honesty:50+(G.karma||0)*.18,
      ambition:48+(G.career?8:0)+Math.min(18,(G.completedGoals||[]).length*2),
      humility:54-Math.max(0,(G.fame||0)-35)*.12
    };
    Object.entries(observed).forEach(([k,target])=>P[k]=this.clamp(P[k]*.96+this.clamp(target)*.04));
  },

  buildRecap(G,before){
    const cashChange=Math.round((G.money||0)-before.money);const nw=typeof netWorth==='function'?netWorth(G):(G.money||0);const netWorthChange=Math.round(nw-before.netWorth);
    const changes=[['health','Health'],['happiness','Happiness'],['mentalHealth','Wellbeing'],['stress','Stress'],['reputation','Reputation']].map(([k,label])=>({key:k,label,delta:Math.round((G[k]||0)-(before[k]||0))})).filter(x=>x.delta!==0).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));
    const recent=(G.log||[]).slice(0,Math.max(0,(G.log||[]).length-before.logLen)).map(x=>String(x.text||'')).filter(Boolean);
    const big=recent[0]||`Age ${G.age} became another chapter in a changing life.`;
    const tone=(G.health||0)<35||(G.mentalHealth||0)<35||cashChange<-(Math.max(1000,Math.abs(before.money)*.25))?'bad':(G.happiness||0)>72&&cashChange>=0?'good':'neutral';
    const summary=`${big.replace(/^\p{Extended_Pictographic}+\s*/u,'')} ${changes[0]?`${changes[0].label} changed ${changes[0].delta>0?'positively':'negatively'} this year.`:''}`.trim();
    return{id:this.uid('recap'),age:G.age,title:`Age ${G.age} · ${this.stageFor(G.age).label}`,summary,tone,cashChange,netWorthChange,changes:changes.slice(0,4),highlights:recent.slice(0,4),createdAt:Date.now()};
  },

  renderDashboard(){
    const G=window.G,tab=document.getElementById('tab-life');if(!G||!tab)return;
    const V=this.ensure(G);tab.querySelectorAll('.v23-command-center,.v23-newspaper-card,.v22-life-map,.v24-dashboard').forEach(el=>el.remove());
    const stage=this.stageFor(G.age),plan=V.annualPlan||{priorities:[],focused:[]},arc=this.activeArc(G),template=arc?(window.V24_ARC_LIBRARY||[]).find(x=>x.id===arc.templateId):null;
    const recap=V.yearRecaps[0],W=V.world,P=V.personality,people=this.importantPeople(G).slice(0,3);
    const root=document.createElement('section');root.className='v24-dashboard';
    root.innerHTML=`
      <div class="v24-life-hero">
        <div class="v24-stage-icon">${stage.icon}</div>
        <div class="v24-life-hero-copy"><span>AGE ${G.age} · ${this.esc(stage.label)}</span><h2>${this.esc(stage.focus)}</h2><p>${this.esc(this.situationLine(G))}</p></div>
        <div class="v24-life-hero-meta"><b>${plan.focused?.length||0}/2</b><small>deep focuses used</small></div>
      </div>
      <div class="v24-section-head"><div><span>THIS YEAR</span><h3>Choose what deserves your attention</h3></div><small>Priorities adapt to your actual life</small></div>
      <div class="v24-priority-grid">${(plan.priorities||[]).map(p=>this.priorityHTML(p,plan.focused||[])).join('')}</div>
      <div class="v24-story-world-grid">
        <article class="v24-story-card">
          <div class="v24-card-kicker">${template?.icon||'📖'} CONNECTED STORY</div>
          <h3>${this.esc(template?.title||'Your next chapter is forming')}</h3>
          <p>${arc?`Part ${Math.min((arc.beat||0)+1,template?.beats?.length||1)} of ${template?.beats?.length||1}. Choices in this chapter can change trust, personality and future memories.`:'Keep living and a new multi-year story will emerge from your stage of life.'}</p>
          <button type="button" class="v24-primary-action" onclick="LifeSimV24.continueStory()" ${!arc||arc.lastAdvancedAge===G.age?'disabled':''}>${arc?.lastAdvancedAge===G.age?'Chapter moved this year':'Continue chapter'}</button>
        </article>
        <article class="v24-world-card" data-tone="${this.esc(W.tone)}">
          <div class="v24-card-kicker">📰 LIVING WORLD</div><h3>${this.esc(W.headline)}</h3>
          <div class="v24-world-bars">${[['Economy',W.economy],['Jobs',W.jobs],['Housing access',W.housing],['Stability',W.stability]].map(([l,v])=>`<div><span>${l}<b>${Math.round(v)}</b></span><i><em style="width:${this.clamp(v)}%"></em></i></div>`).join('')}</div>
        </article>
      </div>
      <div class="v24-insight-grid">
        <article class="v24-panel"><div class="v24-card-kicker">🧬 DEVELOPING PERSONALITY</div><div class="v24-personality">${Object.entries(P).map(([k,v])=>`<div><span>${this.label(k)}<b>${Math.round(v)}</b></span><i><em style="width:${this.clamp(v)}%"></em></i></div>`).join('')}</div></article>
        <article class="v24-panel"><div class="v24-card-kicker">🤝 IMPORTANT PEOPLE</div>${people.length?people.map(p=>`<div class="v24-person"><div><b>${this.esc(p.name)}</b><small>${this.esc(p.role)} · ${this.esc(p.lifeState?.mood||'steady')}</small></div><span title="Trust / closeness / conflict">${p.trust} / ${p.closeness} / ${p.conflict}</span></div>`).join(''):'<p class="v24-empty">Important relationships will appear here as your world grows.</p>'}</article>
        <article class="v24-panel"><div class="v24-card-kicker">📊 LAST YEAR EXPLAINED</div>${recap?this.recapHTML(recap):'<p class="v24-empty">Age up once to create the first clear yearly recap.</p>'}</article>
      </div>
      ${this.aiCardHTML(G)}
    `;
    tab.insertAdjacentElement('afterbegin',root);
  },

  priorityHTML(p,focused){const done=focused.includes(p.id);return`<article class="v24-priority ${done?'is-done':''}"><span>${p.icon}</span><div><h4>${this.esc(p.title)}</h4><p>${this.esc(p.description)}</p></div><button type="button" onclick="LifeSimV24.focusPriority('${this.esc(p.id)}')" ${done?'disabled':''}>${done?'Focused':'Focus'}</button></article>`;},
  recapHTML(r){return`<h3>${this.esc(r.title)}</h3><p>${this.esc(r.aiNarrative||r.summary)}</p><div class="v24-recap-deltas"><span class="${r.cashChange>=0?'good':'bad'}">Cash ${r.cashChange>=0?'+':''}${this.money(r.cashChange)}</span><span class="${r.netWorthChange>=0?'good':'bad'}">Net worth ${r.netWorthChange>=0?'+':''}${this.money(r.netWorthChange)}</span></div>`;},
  aiCardHTML(G){
    const O=window.OllamaBridge;const enabled=!!O?.config?.enabled;
    return`<article class="v24-ai-card ${enabled?'is-on':''}"><div><div class="v24-card-kicker">🦙 OPTIONAL LOCAL STORYTELLER</div><h3>${enabled?'Ollama can add one grounded story moment this year':'Core game works fully without AI'}</h3><p>${enabled?'Your local model receives a compact summary of this fictional life. Numerical game rules remain validated by LifeSim.':'Turn on Ollama in Settings to enhance recaps and optional moments. Nothing is sent to an online AI service.'}</p></div><button type="button" onclick="${enabled?'OllamaBridge.requestMoment()':'UI.openSettings()'}" ${enabled&&G.v24?.aiMomentAge===G.age?'disabled':''}>${enabled?(G.v24?.aiMomentAge===G.age?'AI moment used':'Create local AI moment'):'Open AI settings'}</button></article>`;
  },

  situationLine(G){
    const parts=[];if((G.health||0)<45)parts.push('Health needs attention');if((G.stress||0)>60)parts.push('pressure is building');if(G.age>=18&&!G.career)parts.push('your direction is still open');if(G.rels?.partner)parts.push('an important relationship is part of this year');if(!parts.length)parts.push('No single crisis defines this year; small choices can build momentum');return parts.join(', ')+'.';
  },
  label(key){return({discipline:'Discipline',empathy:'Empathy',courage:'Courage',sociability:'Sociability',honesty:'Honesty',ambition:'Ambition',humility:'Humility'})[key]||key;},
  money(value){try{return typeof fmt==='function'?fmt(value):Math.round(value).toLocaleString();}catch(_){return String(Math.round(value||0));}},

  renderRelationshipDepth(){
    const G=window.G,tab=document.getElementById('tab-love');if(!G||!tab||tab.querySelector('.v24-relationship-depth'))return;
    const people=this.importantPeople(G).slice(0,6);if(!people.length)return;
    const box=document.createElement('section');box.className='v24-relationship-depth';box.innerHTML=`<div class="v24-section-head"><div><span>RELATIONSHIP DEPTH</span><h3>People remember more than one percentage</h3></div><small>Trust · closeness · respect · conflict</small></div><div class="v24-rel-grid">${people.map(p=>`<article><div><b>${this.esc(p.name)}</b><small>${this.esc(p.role)}</small></div>${[['Trust',p.trust],['Closeness',p.closeness],['Respect',p.respect],['Conflict',p.conflict,true]].map(([l,v,bad])=>`<span><em>${l}<b>${v}</b></em><i><u class="${bad?'bad':''}" style="width:${this.clamp(v)}%"></u></i></span>`).join('')}</article>`).join('')}</div>`;tab.insertAdjacentElement('afterbegin',box);
  },

  renderGoalBridge(){
    const G=window.G,tab=document.getElementById('tab-goals');if(!G||!tab||tab.querySelector('.v24-goal-bridge'))return;
    const plan=this.ensure(G).annualPlan;const box=document.createElement('section');box.className='v24-goal-bridge';box.innerHTML=`<div><span>V24 PERSONAL DIRECTION</span><h3>Quests are tasks. These are the reasons behind them.</h3><p>Your three priorities are generated from age, health, relationships, work and financial pressure. They reset each year and never demand adult achievements from children.</p></div><button type="button" onclick="UI.tab('life')">View this year</button>`;tab.insertAdjacentElement('afterbegin',box);
  },


  renderFinanceClarity(){
    const G=window.G,tab=document.getElementById('tab-assets');if(!G||G.age<18||!tab||tab.querySelector('.v24-finance-clarity'))return;
    const V=this.ensure(G),recap=V.yearRecaps[0];
    const currentNW=typeof netWorth==='function'?netWorth(G):(G.money||0);
    const debt=typeof debtTotal==='function'?debtTotal(G):(G.debt||0);
    const known=(recap?.highlights||[]).slice(0,3);
    const box=document.createElement('section');box.className='v24-finance-clarity';
    box.innerHTML=`<div class="v24-section-head"><div><span>FINANCIAL CLARITY</span><h3>Understand what changed instead of guessing</h3></div><small>Cash and net worth are different</small></div>
      <div class="v24-money-grid"><article><small>Available cash</small><b>${this.money(G.money||0)}</b><em>Money currently available to spend</em></article><article><small>Total net worth</small><b>${this.money(currentNW)}</b><em>Cash + assets + business + investments − debt</em></article><article><small>Tracked debt</small><b>${this.money(debt)}</b><em>Loans and collections currently counted</em></article></div>
      ${recap?`<div class="v24-money-year"><div><span>Last annual cash change</span><b class="${recap.cashChange>=0?'good':'bad'}">${recap.cashChange>=0?'+':''}${this.money(recap.cashChange)}</b></div><div><span>Last net-worth change</span><b class="${recap.netWorthChange>=0?'good':'bad'}">${recap.netWorthChange>=0?'+':''}${this.money(recap.netWorthChange)}</b></div></div>`:''}
      ${known.length?`<details class="v24-money-details"><summary>Known influences from the year</summary>${known.map(x=>`<p>${this.esc(x)}</p>`).join('')}</details>`:'<p class="v24-empty">Age up once to create the first annual money explanation.</p>'}`;
    tab.insertAdjacentElement('afterbegin',box);
  },

  renderDeathLegacy(){
    const G=window.G,screen=document.getElementById('death-screen');if(!G||!screen)return;
    screen.querySelector('.v24-death-legacy')?.remove();
    const V=this.ensure(G),personality=Object.entries(V.personality||{}).sort((a,b)=>b[1]-a[1]).slice(0,3);
    const completed=V.storyArcs.filter(a=>a.status==='complete');
    const memories=V.memories.slice(0,5);
    const people=this.importantPeople(G).slice(0,4);
    const card=document.createElement('section');card.className='v24-death-legacy';
    card.innerHTML=`<div class="v24-card-kicker">📖 V24 LIFE LEGACY</div><h3>The patterns behind the statistics</h3>
      <div class="v24-death-grid"><article><small>Personality that emerged</small>${personality.map(([k,v])=>`<span>${this.label(k)} <b>${Math.round(v)}</b></span>`).join('')||'<p>No clear pattern recorded.</p>'}</article><article><small>Connected chapters completed</small><b class="v24-death-big">${completed.length}</b><em>${completed.slice(0,3).map(a=>this.esc(a.title)).join(' · ')||'Some chapters remained unfinished.'}</em></article><article><small>People closest at the end</small>${people.map(p=>`<span>${this.esc(p.name)} <b>${p.closeness}</b></span>`).join('')||'<p>No close relationships recorded.</p>'}</article></div>
      ${memories.length?`<div class="v24-death-memories">${memories.map(m=>`<div><b>Age ${m.age} · ${this.esc(m.title)}</b><p>${this.esc(m.text)}</p></div>`).join('')}</div>`:''}`;
    const stats=document.getElementById('dt-stats');if(stats)stats.insertAdjacentElement('beforebegin',card);else screen.querySelector('.death-body')?.appendChild(card);
  },

  renderEnhancements(){
    if(!window.G)return;this.ensure(window.G);
    if(UI?._activeTab==='life')this.renderDashboard();
    if(UI?._activeTab==='love')this.renderRelationshipDepth();
    if(UI?._activeTab==='goals')this.renderGoalBridge();
    if(UI?._activeTab==='assets')this.renderFinanceClarity();
  },

  scheduleEnhancements(){
    [0,40,140,360].forEach(delay=>setTimeout(()=>this.renderEnhancements(),delay));
  },

  update(){try{UI?.update?.();UI?.refreshActiveTab?.();setTimeout(()=>this.renderEnhancements(),0);}catch(_){this.renderEnhancements();}},

  patch(){
    if(this._patched)return;this._patched=true;
    if(typeof App!=='undefined')App.VERSION=24;
    if(typeof UI!=='undefined')UI.VERSION=24;
    if(typeof Engine!=='undefined'&&Engine.ageUp&&!Engine.ageUp.__v24){
      const old=Engine.ageUp;const self=this;
      const wrapped=function(...args){const G=window.G;const before=G?self.beforeAge(G):null;const out=old.apply(this,args);if(before)self.scheduleFinalize(before);return out;};wrapped.__v24=true;Engine.ageUp=wrapped;
    }
    if(typeof Engine!=='undefined'&&Engine._die&&!Engine._die.__v24){
      const oldDie=Engine._die;const self=this;const wrappedDie=function(...args){const out=oldDie.apply(this,args);setTimeout(()=>self.renderDeathLegacy(),0);return out;};wrappedDie.__v24=true;Engine._die=wrappedDie;
    }
    if(typeof UI!=='undefined'&&UI.update&&!UI.update.__v24){
      const old=UI.update;const self=this;const wrapped=function(...args){if(window.G)self.ensure(window.G);const out=old.apply(this,args);setTimeout(()=>self.renderEnhancements(),0);return out;};wrapped.__v24=true;UI.update=wrapped;
    }
    if(typeof UI!=='undefined'&&UI._renderTab&&!UI._renderTab.__v24){
      const old=UI._renderTab;const self=this;const wrapped=function(...args){const out=old.apply(this,args);self.scheduleEnhancements();return out;};wrapped.__v24=true;UI._renderTab=wrapped;
    }
    if(typeof UI!=='undefined'&&UI.tab&&!UI.tab.__v24){
      const old=UI.tab;const self=this;const wrapped=function(...args){const out=old.apply(this,args);self.scheduleEnhancements();return out;};wrapped.__v24=true;UI.tab=wrapped;
    }
    if(typeof Save!=='undefined'&&Save.load&&!Save.load.__v24){
      const old=Save.load;const self=this;const wrapped=function(...args){const out=old.apply(this,args);if(out)self.ensure(out);return out;};wrapped.__v24=true;Save.load=wrapped;
    }
  },

  init(){
    this.patch();OllamaBridge?.init?.();
    const stamp=()=>{try{
      if(typeof App!=='undefined')App.VERSION=24;
      if(typeof UI!=='undefined')UI.VERSION=24;
      if(typeof Engine!=='undefined')Engine.VERSION=24;
      if(typeof Save!=='undefined')Save.VERSION=24;
      document.title='LifeSim v24.1: UX Overhaul';
      const meta=document.querySelector('meta[name="description"]');
      if(meta)meta.content='LifeSim v24.1: UX Overhaul — connected story arcs, evolving relationships, clearer yearly choices, legacy and optional local Ollama storytelling.';
      document.documentElement.dataset.lifesimVersion='24';
      document.body?.classList?.add('v24-active');
      const app=document.getElementById('app');
      if(app){app.dataset.version='v24';app.dataset.build='v24.1.0';}
    }catch(_){}};
    stamp();setTimeout(stamp,80);setTimeout(stamp,420);setTimeout(stamp,1100);
    document.documentElement.dataset.lifesimVersion='24';
    const app=document.getElementById('app');if(app){app.dataset.version='v24';app.dataset.build='v24.1.0';}
    if(window.G)this.ensure(window.G);
    this.scheduleEnhancements();
  }
};

function rnd(min,max){return Math.floor(Math.random()*(max-min+1))+min;}
if(typeof window!=='undefined')window.LifeSimV24=LifeSimV24;
document.addEventListener('DOMContentLoaded',()=>LifeSimV24.init());
window.addEventListener('load',()=>{LifeSimV24.patch();setTimeout(()=>LifeSimV24.renderEnhancements(),120);});
