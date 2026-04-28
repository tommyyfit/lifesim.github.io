/* js/ai_story.js — LifeSim v13: Local Narrative Director */
const AIStory={
  gap:3,
  memorySize:36,
  recentIdWindow:18,
  recentTopicWindow:8,
  defaultRepeatCooldown:18,
  VERSION:13,

  canUse(){
    const G=window.G;
    if(!G||G.age<10)return false;
    const lastAge=Number.isFinite(G.storyCooldownAge)?G.storyCooldownAge:-999;
    return G.age-lastAge>=this.gap;
  },

  cooldownLeft(){
    const G=window.G;
    if(!G)return this.gap;
    const lastAge=Number.isFinite(G.storyCooldownAge)?G.storyCooldownAge:-999;
    return Math.max(0,this.gap-(G.age-lastAge));
  },

  generate(){
    const G=window.G;
    if(!G)return;

    if(!this.canUse()){
      const left=this.cooldownLeft();
      UI.toast(`Story Event available in ${left} year${left!==1?'s':''}!`);
      return;
    }

    this._ensure(G);

    const evt=this._buildEvent(G);
    G.storyCooldownAge=G.age;

    this._rememberEvent(G,evt);

    G.storyStats.seen++;
    G.storyStats.topics[evt._storyTopic||'general']=(G.storyStats.topics[evt._storyTopic||'general']||0)+1;

    Engine.log(`📖 Story Event: "${evt.title}"`,'special');
    UI.showEvent(evt,()=>{});
  },

  _ensure(G){
    if(!Array.isArray(G.storyMemory))G.storyMemory=[];
    if(!G.storyStats)G.storyStats={seen:0,topics:{}};
    if(!G.storyStats.topics)G.storyStats.topics={};
    if(!Number.isFinite(G.storyStats.seen))G.storyStats.seen=0;

    // Stronger anti-repeat memory. Safe for older saves.
    if(!G.storySeenIds||typeof G.storySeenIds!=='object')G.storySeenIds={};
    if(!G.storyLastSeen||typeof G.storyLastSeen!=='object')G.storyLastSeen={};
    if(!Array.isArray(G.storyTopicMemory))G.storyTopicMemory=[];

    // Migrate old storyMemory into the stronger history maps.
    G.storyMemory.forEach(item=>{
      if(!item)return;
      const id=item.id||item.title;
      if(!id)return;
      G.storySeenIds[id]=true;
      if(Number.isFinite(item.age)){
        G.storyLastSeen[id]=Math.max(Number(G.storyLastSeen[id]||-999),item.age);
      }
    });

    if(G.storyMemory.length>this.memorySize)G.storyMemory.length=this.memorySize;
    if(G.storyTopicMemory.length>this.memorySize)G.storyTopicMemory.length=this.memorySize;
  },

  _buildEvent(G){
    const ctx=this._contexts(G);
    const pool=[];

    if(ctx.prison)pool.push(...this._prisonEvents(G,ctx));
    if(ctx.crime)pool.push(...this._crimeEvents(G,ctx));
    if(ctx.work)pool.push(...this._workEvents(G,ctx));
    if(ctx.education)pool.push(...this._educationEvents(G,ctx));
    if(ctx.love)pool.push(...this._loveEvents(G,ctx));
    if(ctx.family)pool.push(...this._familyEvents(G,ctx));
    if(ctx.money)pool.push(...this._moneyEvents(G,ctx));
    if(ctx.health)pool.push(...this._healthEvents(G,ctx));
    if(ctx.social)pool.push(...this._socialEvents(G,ctx));
    if(ctx.business)pool.push(...this._businessEvents(G,ctx));
    if(ctx.hustle)pool.push(...this._hustleEvents(G,ctx));
    if(ctx.assets)pool.push(...this._assetEvents(G,ctx));
    if(ctx.pets)pool.push(...this._petEvents(G,ctx));
    if(ctx.skills)pool.push(...this._skillEvents(G,ctx));
    if(ctx.legacy)pool.push(...this._legacyEvents(G,ctx));

    pool.push(...this._ageChapterEvents(G,ctx));
    pool.push(...this._identityEvents(G,ctx));

    return this._pickFreshCandidate(pool.filter(Boolean),G,ctx);
  },

  _contexts(G){
    const topSkill=this._topSkill(G);
    const debt=(G.debtCollections||0)+(G.loans||[]).reduce((a,l)=>a+(l.remaining||0),0);
    const netWorthVal=typeof netWorth==='function'?netWorth(G):(G.money||0);
    const partner=G.rels?.partner||null;
    const children=G.rels?.children||[];
    const alivePets=(G.pets||[]).filter(p=>p.alive);
    const properties=G.assets?.properties||[];
    const vehicles=G.assets?.vehicles||[];
    const social=G.social||{};
    const lifePhase=G.age<13?'child':G.age<18?'teen':G.age<30?'young adult':G.age<50?'adult':G.age<70?'midlife':'elder';
    const pressure=this._lifePressure(G,debt);

    return{
      country:G.country?.name||'your country',
      flag:G.country?.flag||'🌍',
      career:G.career?.title||(G.retired?'retiree':G.inUniversity?'student':'unemployed'),
      company:G.careerCompany||'the company',
      partner,
      partnerName:partner?.name||'your partner',
      childCount:children.length,
      followers:G.followers||0,
      netWorth:netWorthVal,
      debt,
      topSkill,
      lifePhase,
      pressure,
      primaryMood:this._primaryMood(G,debt),
      work:!!G.career,
      education:!!G.inUniversity||G.age<22,
      love:!!partner,
      family:!!(children.length||G.rels?.father||G.rels?.mother),
      money:(G.money||0)<sc(7000)||debt>0||netWorthVal<sc(15000),
      health:(G.health||0)<65||(G.stress||0)>55||(G.conditions||[]).length>0,
      social:(G.followers||0)>=3000||(G.fame||0)>=18||!!social.platform,
      business:!!G.business,
      hustle:(G.hustle?.earnings||0)>0,
      assets:properties.length>0||vehicles.length>0,
      pets:alivePets.length>0,
      skills:!!topSkill,
      crime:(G.crimeHeat||0)>15||(G.crimes||[]).length>0||(G.underworldRep||0)>10,
      prison:!!G.inPrison,
      legacy:!!(G.legacy||G.prestigeRank||G.generation||G.statHistory?.length>10),
    };
  },

  _lifePressure(G,debt){
    let p=0;
    if((G.stress||0)>60)p+=2;
    if((G.health||0)<45)p+=2;
    if(debt>0)p+=2;
    if((G.money||0)<sc(2500))p+=1;
    if((G.crimeHeat||0)>50)p+=2;
    if(G.inPrison)p+=4;
    if(!G.career&&G.age>=20&&G.age<60&&!G.inUniversity)p+=1;
    return p>=6?'severe':p>=3?'high':p>=1?'medium':'low';
  },

  _primaryMood(G,debt){
    if(G.inPrison)return'confined';
    if((G.health||0)<30)return'fragile';
    if((G.stress||0)>75)return'overwhelmed';
    if(debt>0&&(G.money||0)<sc(3000))return'pressured';
    if((G.happiness||0)>78&&(G.health||0)>60)return'hopeful';
    if((G.fame||0)>50||(G.followers||0)>100000)return'exposed';
    if(G.age>=60)return'reflective';
    return'open';
  },

  _topSkill(G){
    const entries=Object.entries(G.skills||{}).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
    if(!entries.length)return null;
    const [id,level]=entries[0];
    const def=typeof SKILL_DEFS!=='undefined'?SKILL_DEFS.find(s=>s.id===id):null;
    return{id,level,name:def?.name||this._cap(id.replace(/_/g,' '))};
  },

  _choice(label,sub,e){
    return{label,sub,t:label,e};
  },

  _event(topic,id,weight,data){
    const evt={...data};
    evt._storyTopic=topic;
    evt._storyId=`${topic}:${id}`;
    evt._weight=weight||1;
    evt._unique=evt._unique===true||topic==='chapter';
    evt._repeatCooldown=Number.isFinite(evt._repeatCooldown)
      ?evt._repeatCooldown
      :(evt._unique?999:this.defaultRepeatCooldown);
    return evt;
  },

  _rememberEvent(G,evt){
    this._ensure(G);

    const id=evt._storyId||evt.title||'story:unknown';
    const topic=evt._storyTopic||'general';

    G.storySeenIds[id]=true;
    G.storyLastSeen[id]=G.age;

    G.storyMemory.unshift({
      age:G.age,
      id,
      topic,
      title:evt.title||'Story Event',
    });

    G.storyTopicMemory.unshift({age:G.age,topic,id});

    if(G.storyMemory.length>this.memorySize)G.storyMemory.length=this.memorySize;
    if(G.storyTopicMemory.length>this.memorySize)G.storyTopicMemory.length=this.memorySize;
  },

  _seenStory(G,id){
    if(!G||!id)return false;
    if(G.storySeenIds?.[id])return true;
    return (G.storyMemory||[]).some(x=>x?.id===id);
  },

  _lastSeenAge(G,id){
    const n=Number(G.storyLastSeen?.[id]);
    if(Number.isFinite(n))return n;
    const hit=(G.storyMemory||[]).find(x=>x?.id===id);
    return Number.isFinite(hit?.age)?hit.age:-999;
  },

  _isFreshEnough(evt,G){
    const id=evt._storyId;
    if(!id)return true;
    if(evt._unique&&this._seenStory(G,id))return false;

    const last=this._lastSeenAge(G,id);
    const cooldown=Number.isFinite(evt._repeatCooldown)?evt._repeatCooldown:this.defaultRepeatCooldown;
    return G.age-last>=cooldown;
  },

  _topicPenalty(evt,G){
    const topic=evt._storyTopic||'general';
    const recentTopics=(G.storyTopicMemory||G.storyMemory||[]).slice(0,this.recentTopicWindow).map(x=>x.topic);
    return recentTopics.filter(t=>t===topic).length*7;
  },

  _shuffle(list){
    return [...list].sort(()=>Math.random()-.5);
  },

  _scoreCandidate(evt,G,ctx,strict=true){
    const id=evt._storyId;
    const recent=(G.storyMemory||[]).slice(0,this.recentIdWindow);
    const recentIds=new Set(recent.map(x=>x.id));
    let score=Math.random()*4+(evt._weight||1);

    if(id&&recentIds.has(id))score-=strict?150:40;
    if(id&&this._seenStory(G,id))score-=evt._unique?999:(strict?20:5);

    score-=this._topicPenalty(evt,G);

    if(evt._mood&&evt._mood===ctx.primaryMood)score+=4;
    if(evt.type==='special')score+=1.2;
    if(evt.type==='bad'&&ctx.pressure==='severe')score+=1.5;
    if(evt.type==='good'&&ctx.pressure==='low')score+=1;

    // Make chapter beats feel important, but only when they are truly new.
    if(evt._storyTopic==='chapter'&&!this._seenStory(G,id))score+=5;

    return score;
  },

  _pickFreshCandidate(pool,G,ctx){
    this._ensure(G);
    if(!pool.length)return this._fallback(G,ctx);

    const fresh=pool.filter(evt=>this._isFreshEnough(evt,G));
    const nonUniqueRepeats=pool.filter(evt=>!(evt._unique&&this._seenStory(G,evt._storyId)));
    const usable=fresh.length?fresh:(nonUniqueRepeats.length?nonUniqueRepeats:pool);
    const strict=!!fresh.length;

    let best=this._shuffle(usable)[0];
    let bestScore=-9999;

    this._shuffle(usable).forEach(evt=>{
      const score=this._scoreCandidate(evt,G,ctx,strict);
      if(score>bestScore){
        bestScore=score;
        best=evt;
      }
    });

    return best||this._fallback(G,ctx);
  },

  _fallback(G,ctx){
    return this._event('identity','fallback',1,{
      icon:'📖',
      type:'special',
      title:'A Strange Little Year',
      text:`${G.name} feels a shift in the air this year, even if nothing dramatic happened on paper. Sometimes a life changes quietly first, then visibly later.`,
      choices:[
        this._choice('Lean into it','Trust your instincts.',{happiness:7,smarts:3}),
        this._choice('Stay careful','Protect stability over excitement.',{stress:-4,happiness:3}),
      ],
    });
  },

  _workEvents(G,ctx){
    const salaryBump=sc(Math.max(800,Math.round((G.career?.salary||0)*.08)));

    return[
      this._event('work','crossroads',3,{
        icon:'💼',
        type:'special',
        title:'Office Crossroads',
        text:`${G.name}'s reputation as a ${ctx.career} at ${ctx.company} is growing. A messy assignment lands on their desk, and everyone knows it could shape the next few years. With stress at ${Math.round(G.stress||0)}%, ambition and personal peace are pulling in different directions.`,
        choices:[
          this._choice('Take charge of it','Push hard for a breakthrough.',{money:salaryBump,happiness:6,smarts:4,stress:10,fame:3}),
          this._choice('Share the spotlight','Lead without burning out as badly.',{happiness:8,smarts:3,stress:4,karma:4}),
          this._choice('Step back politely','Protect your peace.',{happiness:3,stress:-8,money:-Math.round(salaryBump*.35)}),
        ],
      }),

      this._event('work','mentor',2.4,{
        icon:'🧭',
        type:'good',
        title:'A Mentor Notices',
        text:`Someone senior notices the way ${G.name} handles pressure. It is not a promotion offer yet, more like a door quietly opening. The opportunity is real, but so is the extra expectation that comes with being seen.`,
        choices:[
          this._choice('Ask for mentorship','Grow faster with guidance.',{smarts:6,happiness:5,stress:2}),
          this._choice('Turn it into leverage','Use the attention for money.',{money:sc(1800),fame:2,karma:-1}),
          this._choice('Keep expectations low','Stay steady and private.',{stress:-4,happiness:3}),
        ],
      }),

      this._event('work','burnout-warning',ctx.primaryMood==='overwhelmed'?5:2.5,{
        icon:'🧯',
        type:'bad',
        title:'Work Starts Following You Home',
        text:`Even when the workday ends, ${G.name}'s job does not. Messages, expectations, and unfinished mental loops have started leaking into sleep and mood. The career itself feels less like progress and more like something taking space from the rest of life.`,
        choices:[
          this._choice('Set real boundaries','Protect your mind first.',{happiness:7,stress:-10,money:-sc(700)}),
          this._choice('Keep powering through','Income stays strong, strain grows.',{money:sc(2200),stress:11,health:-5}),
          this._choice('Ask for support','A vulnerable but healthy move.',{stress:-6,karma:3,happiness:4}),
        ],
      }),
    ];
  },

  _educationEvents(G,ctx){
    return[
      this._event('education','identity-vs-grades',2.3,{
        icon:'🎓',
        type:'neutral',
        title:'Grades Are Not the Whole Story',
        text:`${G.name} feels the pressure to turn learning into proof: grades, applications, status, future income. But a quieter part of the year is asking what kind of person all this effort is actually building.`,
        choices:[
          this._choice('Chase excellence','Work hard and sharpen your path.',{smarts:7,stress:6,happiness:2}),
          this._choice('Learn for yourself','Less pressure, deeper curiosity.',{smarts:5,happiness:6,stress:-3}),
          this._choice('Coast for a while','Protect energy, lose momentum.',{happiness:5,stress:-6,smarts:-2}),
        ],
      }),

      this._event('education','unexpected-teacher',2,{
        icon:'🍎',
        type:'good',
        title:'An Unexpected Teacher',
        text:`A teacher, tutor, classmate, or older friend says something that sticks with ${G.name}. It is not dramatic, but it lands at exactly the right angle.`,
        choices:[
          this._choice('Take the lesson seriously','Let it shape your direction.',{smarts:6,happiness:4,karma:2}),
          this._choice('Ask more questions','Curiosity compounds.',{smarts:5,stress:1}),
          this._choice('Smile and move on','Nice moment, little change.',{happiness:2}),
        ],
      }),
    ];
  },

  _loveEvents(G,ctx){
    const p=ctx.partner;
    const intimacy=p?.intimacy||30;

    return[
      this._event('love','temperature',2.8,{
        icon:'❤️',
        type:'neutral',
        title:'Relationship Temperature',
        text:`${G.name} and ${p.name} have been moving through real life together, not just romantic highlights. Intimacy is around ${intimacy}/100, and a quiet conversation opens up about whether this bond needs more attention, honesty, or simply more fun.`,
        choices:[
          this._choice('Plan real time together','Invest in the relationship on purpose.',{happiness:10,stress:-5,money:-sc(700)}),
          this._choice('Say the hard truth','Honesty may sting, but it clears the air.',{happiness:4,karma:5,stress:2}),
          this._choice('Keep avoiding it','Easy now, colder later.',{happiness:-8,stress:6}),
        ],
      }),

      this._event('love','future-talk',2.4,{
        icon:'💍',
        type:'special',
        title:'Future Talk',
        text:`${p.name} brings up the future in a more serious way than usual. Not dramatically, just with that unmistakable adult tone that says the relationship is being measured against time, commitment, and direction.`,
        choices:[
          this._choice('Lean into commitment','Build something steadier together.',{happiness:11,stress:-3,money:-sc(500)}),
          this._choice('Ask for more time','Careful honesty over fake certainty.',{happiness:3,karma:4,stress:1}),
          this._choice('Deflect the whole thing','Short-term relief, long-term damage.',{happiness:-7,stress:4}),
        ],
      }),
    ];
  },

  _familyEvents(G,ctx){
    const familyWord=ctx.childCount?`${ctx.childCount} child${ctx.childCount!==1?'ren':''}`:'your family';

    return[
      this._event('family','turning-point',2.8,{
        icon:'👨‍👩‍👧',
        type:'good',
        title:'Family Turning Point',
        text:`${G.name} gets pulled back into the emotional center of ${familyWord}. It is one of those deeply human stretches where people need comfort, advice, and actual presence.`,
        choices:[
          this._choice('Show up fully','Be present even if it costs time and money.',{happiness:12,karma:6,money:-sc(1200),stress:4}),
          this._choice('Help in practical ways','Solve what you can without overextending.',{happiness:7,smarts:2,money:-sc(500)}),
          this._choice('Keep distance','Protect yourself, but it will weigh on you.',{happiness:-9,stress:-2,karma:-5}),
        ],
      }),

      this._event('family','rare-good-day',2.5,{
        icon:'🍽️',
        type:'special',
        title:'A Rare Good Family Day',
        text:`For once, a family day just works. Conversation flows, old tensions stay quiet, and ${G.name} gets one of those rare reminders that not every meaningful memory has to come from chaos.`,
        choices:[
          this._choice('Savour it fully','Let yourself enjoy peace.',{happiness:12,stress:-6}),
          this._choice('Take the lead more often','Try to protect this energy.',{happiness:7,karma:4,stress:1}),
          this._choice('Keep expectations low','Enjoy it, but stay guarded.',{happiness:4,stress:-2}),
        ],
      }),
    ];
  },

  _moneyEvents(G,ctx){
    const pressure=ctx.debt>0
      ?`Around ${fmtFull(ctx.debt)} in debt is hanging over everything.`
      :`Cash feels tighter than it should at age ${G.age}.`;

    return[
      this._event('money','pressure',ctx.pressure==='severe'?4.4:2.8,{
        icon:'💳',
        type:'bad',
        title:'Money Pressure',
        text:`${G.name} has one of those brutally realistic financial weeks where every number suddenly feels personal. ${pressure}`,
        choices:[
          this._choice('Grind through it','Extra effort, less peace, more cash.',{money:sc(2500),happiness:-4,stress:9}),
          this._choice('Cut spending hard','Responsible, but joyless for a while.',{money:sc(1200),happiness:-7,smarts:2,stress:1}),
          this._choice('Take the risky leap','Could help now, not stable.',{money:sc(r(-2000,6000)),happiness:3,stress:6}),
        ],
      }),

      this._event('money','lifestyle-rethink',2.5,{
        icon:'📉',
        type:'special',
        title:'Lifestyle Reality Check',
        text:`${G.name} starts noticing the gap between the life they want to project and the life the numbers can actually support. It is an uncomfortable adult moment where habits start demanding honesty.`,
        choices:[
          this._choice('Reset your spending','Less image, more stability.',{money:sc(1600),stress:-4,happiness:-2}),
          this._choice('Chase more income','Ambitious, but costly mentally.',{money:sc(2600),stress:8,happiness:2}),
          this._choice('Ignore the warning','The pressure keeps building.',{happiness:1,stress:7,smarts:-2}),
        ],
      }),
    ];
  },

  _healthEvents(G,ctx){
    return[
      this._event('health','body-keeps-score',ctx.primaryMood==='fragile'||ctx.primaryMood==='overwhelmed'?4.2:2.7,{
        icon:'🩺',
        type:'neutral',
        title:'Body Keeps Score',
        text:`${G.name} notices that life is no longer staying neatly in the mind. Stress at ${Math.round(G.stress||0)}% and health at ${Math.round(G.health||0)}% are starting to show up in sleep, energy, and patience.`,
        choices:[
          this._choice('Reset your routine','A serious health-first year.',{health:10,happiness:6,stress:-10,money:-sc(900)}),
          this._choice('Book real help','Professional support and structure.',{health:7,stress:-12,money:-sc(1400),smarts:2}),
          this._choice('Push through anyway','No slowdown, but the body notices.',{money:sc(1800),health:-8,stress:10}),
        ],
      }),

      this._event('health','rest-vs-hustle',2.8,{
        icon:'😴',
        type:'special',
        title:'Rest Is Becoming a Decision',
        text:`This year, rest itself starts feeling political in ${G.name}'s life. Slowing down would help, but ambition, guilt, and routine all make it harder than it should be.`,
        choices:[
          this._choice('Protect sleep and recovery','Unflashy, but powerful.',{health:7,happiness:5,stress:-9}),
          this._choice('Balance rest and output','A decent compromise.',{health:3,stress:-4,money:sc(900)}),
          this._choice('Keep sacrificing rest','Productive now, costly later.',{money:sc(1700),health:-6,stress:9}),
        ],
      }),
    ];
  },

  _socialEvents(G,ctx){
    const followers=fmtFollowers(ctx.followers);

    return[
      this._event('social','attention-spiral',3,{
        icon:'📱',
        type:'special',
        title:'Attention Spiral',
        text:`${G.name}'s online life is starting to leak into real life. With ${followers} followers watching and reacting, a post or opinion suddenly catches more heat than expected.`,
        choices:[
          this._choice('Lean into the moment','Turn attention into reach and cash.',{fame:10,money:sc(2200),happiness:5,stress:7}),
          this._choice('Handle it carefully','Protect your image and sanity.',{fame:4,karma:3,stress:-2}),
          this._choice('Disappear for a while','Lose momentum, regain peace.',{happiness:7,stress:-8,fame:-3}),
        ],
      }),

      this._event('social','privacy-cost',2.6,{
        icon:'🕶️',
        type:'neutral',
        title:'The Cost of Being Seen',
        text:`A stranger recognizes ${G.name} at the wrong moment. It is flattering for a second, then strangely invasive. Public life gives attention, but it also takes privacy in small bites.`,
        choices:[
          this._choice('Set firmer boundaries','Protect private life.',{stress:-6,happiness:4,fame:-1}),
          this._choice('Use the attention','Turn it into momentum.',{fame:5,money:sc(900),stress:3}),
          this._choice('Laugh it off','Do not overthink it.',{happiness:3,stress:1}),
        ],
      }),
    ];
  },

  _businessEvents(G,ctx){
    const revenue=G.business?.revenue||0;
    const expenses=G.business?.expenses||0;

    return[
      this._event('business','founder-pressure',3,{
        icon:'🏢',
        type:revenue<expenses?'bad':'neutral',
        title:'Founder Pressure',
        text:`Running ${G.business?.name||'the business'} is not just numbers. Revenue, expenses, people, reputation, and ${G.name}'s own nerves all seem to be sitting at the same table this year.`,
        choices:[
          this._choice('Invest in systems','Less chaos later.',{money:-sc(1600),smarts:4,stress:-4}),
          this._choice('Push growth hard','Bigger upside, bigger strain.',{money:sc(3000),fame:3,stress:8}),
          this._choice('Simplify operations','Smaller, calmer, cleaner.',{happiness:5,stress:-7,money:-sc(500)}),
        ],
      }),
    ];
  },

  _hustleEvents(G,ctx){
    return[
      this._event('hustle','window',2.7,{
        icon:'💸',
        type:'good',
        title:'Side Hustle Window',
        text:`${G.name}'s side hustle is no longer just a cute extra. People are starting to talk, referrals are showing up, and the money has become real enough to change decisions.`,
        choices:[
          this._choice('Scale it up fast','Big upside, heavy time pressure.',{money:sc(3200),happiness:6,stress:8,fame:4}),
          this._choice('Grow it steadily','Solid progress without chaos.',{money:sc(1800),happiness:5,smarts:3,stress:2}),
          this._choice('Keep it small','Choose balance over expansion.',{happiness:8,stress:-5}),
        ],
      }),

      this._event('hustle','client-problem',2.2,{
        icon:'📦',
        type:'neutral',
        title:'A Client Makes It Messy',
        text:`What looked like easy hustle money turns complicated when a client, customer, or buyer becomes demanding. ${G.name} now has to choose between reputation, boundaries, and quick cash.`,
        choices:[
          this._choice('Over-deliver once','Protect your name at a cost.',{happiness:-1,stress:6,fame:3,money:sc(1200)}),
          this._choice('Set firm boundaries','Healthy, but not always popular.',{stress:-2,karma:3,money:sc(700)}),
          this._choice('Drop the client','Lose cash, keep your sanity.',{happiness:4,stress:-5,money:-sc(300)}),
        ],
      }),
    ];
  },

  _assetEvents(G,ctx){
    return[
      this._event('assets','home-feeling',2.3,{
        icon:'🏠',
        type:'good',
        title:'A Place Starts Feeling Like Yours',
        text:`Something about ${G.name}'s home or possessions shifts this year. It is not just ownership anymore — it starts feeling like evidence of a life being built.`,
        choices:[
          this._choice('Invest in comfort','Make life softer.',{happiness:8,stress:-5,money:-sc(900)}),
          this._choice('Protect the asset','Practical upgrades.',{smarts:3,money:-sc(500),stress:-2}),
          this._choice('Take it for granted','It fades into the background.',{happiness:1}),
        ],
      }),

      this._event('assets','maintenance-reality',2.1,{
        icon:'🧰',
        type:'neutral',
        title:'Maintenance Reality',
        text:`A car, home, or major asset reminds ${G.name} that ownership is not only pride. It is upkeep, repairs, insurance, and tiny boring decisions that prevent bigger disasters.`,
        choices:[
          this._choice('Handle it properly','Pay now, avoid worse later.',{money:-sc(1100),stress:-3,smarts:2}),
          this._choice('Patch it cheaply','Good enough for now.',{money:-sc(350),stress:2}),
          this._choice('Ignore it','Future-you gets the bill.',{money:sc(300),stress:5}),
        ],
      }),
    ];
  },

  _petEvents(G,ctx){
    return[
      this._event('pets','quiet-loyalty',2.7,{
        icon:'🐾',
        type:'good',
        title:'Quiet Loyalty',
        text:`One of ${G.name}'s pets stays close during a difficult stretch, offering the kind of uncomplicated loyalty humans often struggle to give.`,
        choices:[
          this._choice('Spend real time together','Small joy, real comfort.',{happiness:10,stress:-8}),
          this._choice('Buy something nice','Spoil them a little.',{happiness:6,money:-sc(120),karma:2}),
          this._choice('Just appreciate it','Let the moment be enough.',{happiness:5,stress:-3}),
        ],
      }),

      this._event('pets','vet-scare',2.2,{
        icon:'🐶',
        type:'neutral',
        title:'A Small Vet Scare',
        text:`A pet has a strange symptom, weird mood, or worrying little moment. It may be nothing. It may not. Either way, ${G.name} feels that protective panic pet owners know too well.`,
        choices:[
          this._choice('Visit the vet','Expensive, but responsible.',{money:-sc(600),karma:4,happiness:4,stress:-2}),
          this._choice('Watch carefully','Hope and caution together.',{stress:2,happiness:2}),
          this._choice('Panic research online','Lots of tabs, little peace.',{smarts:2,stress:5}),
        ],
      }),
    ];
  },

  _crimeEvents(G,ctx){
    return[
      this._event('crime','heat-shadow',ctx.crime?3.8:1,{
        icon:'🚓',
        type:'bad',
        title:'The Heat Has a Shadow',
        text:`Even away from the actual trouble, ${G.name} feels the afterimage of risk. A police car, a form, a background check, a suspicious look — the past keeps trying to become present again.`,
        choices:[
          this._choice('Lay low emotionally','Choose caution and quiet.',{stress:-4,happiness:2,money:-sc(300)}),
          this._choice('Clean up your life','Do the boring repair work.',{karma:5,stress:-2,money:-sc(800)}),
          this._choice('Act untouchable','Confidence, or denial.',{fame:2,stress:5,karma:-4}),
        ],
      }),

      this._event('crime','second-chance',2.2,{
        icon:'🕊️',
        type:'good',
        title:'A Second-Chance Moment',
        text:`Someone treats ${G.name} like more than their worst decision. It is uncomfortable, because grace creates responsibility. If someone believes change is possible, wasting that belief feels different.`,
        choices:[
          this._choice('Accept the chance','Let trust change behavior.',{karma:7,happiness:6,stress:-4}),
          this._choice('Stay guarded','Trust slowly, not blindly.',{stress:-2,happiness:3}),
          this._choice('Use it cynically','Take the benefit, dodge the lesson.',{money:sc(700),karma:-6}),
        ],
      }),
    ];
  },

  _prisonEvents(G,ctx){
    return[
      this._event('prison','long-night',5,{
        icon:'🔒',
        type:'bad',
        title:'A Long Night Inside',
        text:`The noise settles, the lights change, and ${G.name} has nothing to distract from the reality of being confined. Prison time does not move like normal time. It stretches, repeats, and asks questions nobody outside can answer for you.`,
        choices:[
          this._choice('Face yourself honestly','Painful, but transformative.',{smarts:4,karma:5,stress:-3,happiness:2}),
          this._choice('Harden emotionally','Survive first, feel later.',{fitness:3,stress:4,happiness:-3}),
          this._choice('Plan the comeback','Hope becomes structure.',{smarts:3,happiness:5,stress:2}),
        ],
      }),

      this._event('prison','letter-from-outside',4,{
        icon:'✉️',
        type:'special',
        title:'A Letter From Outside',
        text:`A message from outside reaches ${G.name}. It carries ordinary life inside it: weather, family, money, memories, disappointment, love. Somehow that makes it heavier than a lecture.`,
        choices:[
          this._choice('Write back honestly','Repair what can be repaired.',{karma:6,happiness:7,stress:-4}),
          this._choice('Keep it brief','Connection without vulnerability.',{happiness:3,stress:-1}),
          this._choice('Do not answer','Silence protects and isolates.',{stress:-2,happiness:-5}),
        ],
      }),
    ];
  },

  _skillEvents(G,ctx){
    return[
      this._event('skills','unexpected-use',2.8,{
        icon:'🧠',
        type:'good',
        title:'Unexpected Use for Talent',
        text:`${G.name}'s strength in ${ctx.topSkill.name} suddenly matters outside practice. What used to feel like self-improvement now becomes useful in a real situation involving reputation, money, and confidence.`,
        choices:[
          this._choice('Use it boldly','Convert talent into visible results.',{happiness:9,fame:5,money:sc(1500)}),
          this._choice('Teach someone else','Share the skill and deepen it.',{smarts:5,karma:4,happiness:6}),
          this._choice('Keep it private','Stay sharp without outside pressure.',{happiness:4,stress:-4}),
        ],
      }),

      this._event('skills','plateau',2.1,{
        icon:'📚',
        type:'neutral',
        title:'You Hit a Plateau',
        text:`${G.name} realizes that being decent at ${ctx.topSkill.name} is no longer giving the same satisfaction. Growth now would require patience, humility, and a less glamorous kind of discipline.`,
        choices:[
          this._choice('Train seriously again','Break through the plateau.',{smarts:5,happiness:4,stress:3,money:-sc(600)}),
          this._choice('Use what you already know','Practical over ideal.',{money:sc(1100),happiness:3}),
          this._choice('Take a break from it','Distance may help later.',{stress:-4,happiness:2}),
        ],
      }),

      this._event('skills','recognition',2.5,{
        icon:'🏅',
        type:'special',
        title:'People Start Noticing',
        text:`${G.name}'s skill in ${ctx.topSkill.name} stops being an internal thing and starts attracting comments, opportunities, and expectations from other people.`,
        choices:[
          this._choice('Own the recognition','Step into visibility.',{fame:6,happiness:6,money:sc(900)}),
          this._choice('Stay humble and steady','Quiet progress still counts.',{karma:4,happiness:4}),
          this._choice('Avoid the pressure','Less attention, less growth.',{stress:-3,fame:-1}),
        ],
      }),
    ];
  },

  _legacyEvents(G,ctx){
    return[
      this._event('legacy','echoes',2.2,{
        icon:'🌳',
        type:'special',
        title:'Echoes of a Larger Story',
        text:`${G.name} gets the strange feeling that this life is not only about this year. Patterns, family habits, old choices, and future memory all seem to be sitting in the room together.`,
        choices:[
          this._choice('Think generationally','Choose the long story.',{karma:5,smarts:3,happiness:5,stress:1}),
          this._choice('Break an old pattern','Hard, but freeing.',{happiness:8,stress:-4,karma:4}),
          this._choice('Live only for now','Immediate relief, less legacy.',{happiness:5,fame:1,karma:-2}),
        ],
      }),
    ];
  },

  _ageChapterEvents(G,ctx){
    const events=[];

    if(G.age>=18&&G.age<=23&&!this._seenStory(G,'chapter:first-adult-choices')){
      events.push(this._event('chapter','first-adult-choices',2.4,{
        icon:'🧭',
        type:'special',
        title:'First Adult Choices Feel Real',
        text:`The strange thing about becoming an adult is that nobody stops the world and explains the rules. ${G.name} just notices that choices now have sharper edges and longer shadows.`,
        choices:[
          this._choice('Build foundations','Boring choices, future strength.',{smarts:4,stress:2,money:sc(900)}),
          this._choice('Explore boldly','Memories over certainty.',{happiness:9,fame:2,money:-sc(500)}),
          this._choice('Avoid big decisions','Peace now, drift later.',{stress:-5,happiness:2,smarts:-1}),
        ],
      }));
    }

    if(G.age>=38&&G.age<=52&&!this._seenStory(G,'chapter:midlife-audit')){
      events.push(this._event('chapter','midlife-audit',2.8,{
        icon:'🪞',
        type:'neutral',
        title:'Midlife Audit',
        text:`${G.name} starts measuring life less by what is possible and more by what has actually happened. That can feel harsh, but it can also be clarifying.`,
        choices:[
          this._choice('Change direction','Scary, but honest.',{happiness:9,stress:4,smarts:4}),
          this._choice('Deepen what works','Not every answer is reinvention.',{happiness:7,stress:-4,karma:3}),
          this._choice('Numb the question','Avoidance has a cost.',{happiness:-4,stress:5}),
        ],
      }));
    }

    if(G.age>=65&&!this._seenStory(G,'chapter:later-years-light')){
      events.push(this._event('chapter','later-years-light',3,{
        icon:'🌅',
        type:'good',
        title:'The Light Changes in Later Years',
        text:`At ${G.age}, ${G.name} notices that time has a different texture. Some things matter less. Some memories matter more. The future is still there, but the past is louder now.`,
        choices:[
          this._choice('Make peace where possible','Repair brings relief.',{happiness:10,karma:6,stress:-6}),
          this._choice('Tell your stories','Let memory become legacy.',{happiness:8,fame:2,smarts:2}),
          this._choice('Keep regrets private','Quiet, but heavier.',{stress:2,happiness:2}),
        ],
      }));
    }

    return events;
  },

  _identityEvents(G,ctx){
    const ambition=typeof LIFE_AMBITIONS!=='undefined'
      ?LIFE_AMBITIONS.find(a=>a.id===G.ambition)?.name||this._cap(G.ambition||'life')
      :this._cap(G.ambition||'life');

    return[
      this._event('identity','quiet-year',2.8,{
        icon:'🌱',
        type:'special',
        title:'Quiet Year, Big Thought',
        _mood:'reflective',
        text:`${G.name} has a rare honest moment alone and starts comparing the life they are living with the life they imagined. At age ${G.age}, in ${ctx.country}, chasing "${ambition}" no longer feels like a slogan. It feels personal.`,
        choices:[
          this._choice('Recommit completely','Push your life in a sharper direction.',{happiness:8,smarts:4,stress:5,fame:2}),
          this._choice('Redefine success','Choose balance over performance.',{happiness:12,stress:-9,karma:3}),
          this._choice('Do nothing for now','Stay still, but feel the drift.',{happiness:-5,stress:2}),
        ],
      }),

      this._event('identity','reinvention',2.4,{
        icon:'🪞',
        type:'neutral',
        title:'Reinvention Urge',
        text:`${G.name} starts feeling the itch to become slightly different on purpose. Not a fake self, just a version that fits the current chapter better than the one built for an earlier age.`,
        choices:[
          this._choice('Change something real','Let the outside reflect the inside.',{happiness:9,looks:4,money:-sc(500)}),
          this._choice('Journal before acting','Clarity before movement.',{smarts:4,stress:-4,happiness:4}),
          this._choice('Ignore the urge','Stay familiar, stay stuck.',{happiness:-3,stress:3}),
        ],
      }),

      this._event('identity','perspective',2.6,{
        icon:'🌄',
        type:'good',
        title:'Perspective Shift',
        _mood:'hopeful',
        text:`Something small this year changes the way ${G.name} sees the whole picture. The facts of life stay the same, but the interpretation softens just enough to create room for hope again.`,
        choices:[
          this._choice('Follow that feeling','Let perspective change behavior.',{happiness:10,stress:-7,karma:3}),
          this._choice('Keep it private','Quiet growth still matters.',{happiness:6,stress:-3}),
          this._choice('Question it hard','Insight becomes analysis.',{smarts:5,happiness:2}),
        ],
      }),

      this._event('identity','envy',ctx.primaryMood==='pressured'?3.2:1.7,{
        icon:'🫥',
        type:'neutral',
        title:'Someone Else’s Timeline',
        text:`${G.name} catches themselves comparing their life to someone else's highlight reel. It is not a noble feeling, but it is human — and it reveals an unmet desire more honestly than pretending not to care.`,
        choices:[
          this._choice('Use envy as information','Learn what you actually want.',{smarts:4,happiness:3,stress:-2}),
          this._choice('Mute the comparison','Protect your peace.',{stress:-6,happiness:4}),
          this._choice('Try to keep up','Image wins briefly.',{looks:3,fame:2,money:-sc(900),stress:5}),
        ],
      }),
    ];
  },

  _cap(s){
    return String(s||'').replace(/\b\w/g,m=>m.toUpperCase());
  },
};