/* js/engine.js — LifeSim v9 */
const Engine={
  npc(role,gender){
    const isFem=gender==='female';
    return{id:Math.random().toString(36).slice(2),name:pick(isFem?FNAMES:MNAMES),surname:pick(SURNAMES),gender,role,age:0,love:r(50,82),alive:true};
  },

  log(text,type='neutral'){
    const G=window.G;if(!G)return;
    G.log.unshift({age:G.age,text,type});
    if(G.log.length>400)G.log.pop();
  },

  ageUp(){
    const G=window.G;if(!G||!G.alive)return;
    const yearStart=typeof LifeProgress!=='undefined'?LifeProgress.snapshot(G):null;
    // Disable both buttons (mobile + desktop)
    const btns=[document.getElementById('age-btn'),document.getElementById('age-btn-side')];
    btns.forEach(b=>{if(b)b.disabled=true;});
    G.age++;

    try{Relations.ageAll();}catch(e){console.warn(e);}
    try{Career.educTick();}catch(e){console.warn(e);}
    try{Career.incomeTick();}catch(e){console.warn(e);}
    try{Assets.tick();}catch(e){console.warn(e);}
    try{Health.tick();}catch(e){console.warn(e);}
    try{Crime.tick();}catch(e){console.warn(e);}
    try{Business.tick();}catch(e){console.warn(e);}
    try{Social.tick();}catch(e){console.warn(e);}
    try{Pets.tick();}catch(e){console.warn(e);}
    try{Goals.tick();}catch(e){console.warn(e);}
    try{Skills.tick();}catch(e){console.warn(e);}
    try{Stocks.tick();}catch(e){console.warn(e);}
    try{this._retirementTick();}catch(e){}

    this._drift();
    const pendingEvts=[];
    this._queueEvents(pendingEvts);
    this._modalSkipCb=null;
    this._processQueue(pendingEvts,()=>{
      try{
        if(!this._checkDeath()){
          if(G.challengePendingChild&&G.age>=18){
            const child=Engine.npc('child',Math.random()>0.5?'female':'male');
            child.age=0; child.surname=G.surname;
            G.rels.children.push(child); G.challengePendingChild=false;
            Engine.log(`👶 Challenge twist: early responsibility arrived with baby ${child.name}.`,'special');
          }
          if(typeof LifeProgress!=='undefined')LifeProgress.recordYear(G,yearStart);
          UI.update();
          this.checkAch();
          UI.refreshActiveTab();
          Save.save(G);
        }
      }catch(e){console.warn('Post-event error:',e);}
      // Always re-enable both buttons
      btns.forEach(b=>{if(b)b.disabled=false;});
    });
  },

  _retirementTick(){
    const G=window.G;
    if(G.retired&&G.retirementPension>0){
      G.money+=sc(G.retirementPension);
      Engine.log(`🏖️ Pension: ${fmt(sc(G.retirementPension))} received.`,'money');
    }
  },

  _pendingEvts:[],
  _queueEvents(queue){
    const G=window.G;
    let pool;
    if(G.age<=12)pool=EVENTS.childhood;
    else if(G.age<=17)pool=EVENTS.teen;
    else if(G.age<=59)pool=EVENTS.adult;
    else pool=EVENTS.elder;
    const n=Math.random()<0.35?2:1;
    for(let i=0;i<n;i++){queue.push(pick(pool));}
    if(G.age>18&&Math.random()<0.12&&typeof WORLD_EVENTS!=='undefined'){
      const we=pick(WORLD_EVENTS);
      queue.push({...we,_world:true});
    }
    if(G.age>=12&&Math.random()<0.09&&typeof COUNTRY_EVENTS!=='undefined'){
      const list=COUNTRY_EVENTS[G.country?.name]||[];
      if(list.length)queue.push({...pick(list),_country:true});
    }
    if(G.age>=18&&Math.random()<0.045&&typeof RARE_STORY_ARCS!=='undefined'){
      queue.push({...pick(RARE_STORY_ARCS),_rare:true});
    }
  },

  _modalSkipCb:null,

  _processQueue(queue,done){
    if(!queue||queue.length===0){done();return;}
    const evt=queue.shift();
    if(evt._world&&evt.tag){
      const G=window.G;
      if(!G.achievements)G.achievements={};
      if(evt.tag==='recession')G.achievements.survived_recession=true;
      if(evt.tag==='pandemic')G.achievements.survived_pandemic=true;
      if(evt.tag==='boom')G.achievements.boom_profit=true;
    }
    this._modalSkipCb=()=>setTimeout(()=>this._processQueue(queue,done),160);
    UI.showEvent(evt,()=>{
      this._modalSkipCb=null;
      setTimeout(()=>this._processQueue(queue,done),160);
    });
  },

  act(id){
    const G=window.G;
    const costs={therapy:150,swim:30,boxing:60,salon:90,spa:180,dentist:130,personal_shop:400,movie:0,travel:700,concert:120,museum:20};
    const cost=sc(costs[id]||0);
    if(cost>0&&G.money<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    if(cost>0)G.money-=cost;

    let txt='',type='good';
    const dsc=G.trait==='disciplined'?0.75:1.0;
    const lky=G.trait==='lucky'?1.25:1.0;

    switch(id){
      case 'study':    G.smarts=cl(G.smarts+r(4,10));G.stress=cl((G.stress||0)+r(2,5));txt='📚 Studied intensively.';break;
      case 'library':  G.smarts=cl(G.smarts+r(5,12));G.happiness=cl(G.happiness+r(3,6));G.stress=cl((G.stress||0)-r(3,6));txt='📖 Peaceful library afternoon.';break;
      case 'meditate': G.happiness=cl(G.happiness+r(7,13));G.health=cl(G.health+r(2,5));G.stress=cl((G.stress||0)-r(9,16));txt='🧘 Deep meditation. Stress gone.';break;
      case 'therapy':  G.happiness=cl(G.happiness+r(10,19));G.stress=cl((G.stress||0)-r(12,20));txt='🛋️ Therapy. Baggage unpacked.';break;
      case 'gym':      G.health=cl(G.health+r(4,8));G.fitness=cl((G.fitness||50)+r(5,10));G.looks=cl(G.looks+r(2,5));G.stress=cl((G.stress||0)-r(5,9));txt='🏋️ Crushed a gym session!';break;
      case 'run':      G.health=cl(G.health+r(3,7));G.fitness=cl((G.fitness||50)+r(4,8));G.happiness=cl(G.happiness+r(3,6));G.stress=cl((G.stress||0)-r(4,8));txt='🏃 Long refreshing run.';break;
      case 'swim':     G.health=cl(G.health+r(4,8));G.fitness=cl((G.fitness||50)+r(5,9));G.stress=cl((G.stress||0)-r(4,8));txt='🏊 Swimming laps.';break;
      case 'yoga':     G.health=cl(G.health+r(3,6));G.happiness=cl(G.happiness+r(5,9));G.fitness=cl((G.fitness||50)+r(2,5));G.stress=cl((G.stress||0)-r(7,13));txt='🧘‍♀️ Yoga complete. Balanced.';break;
      case 'hike':     G.health=cl(G.health+r(4,8));G.fitness=cl((G.fitness||50)+r(4,8));G.happiness=cl(G.happiness+r(6,11));G.stress=cl((G.stress||0)-r(8,14));txt='🥾 Mountain hike. Recharged!';break;
      case 'sports':   G.health=cl(G.health+r(3,7));G.fitness=cl((G.fitness||50)+r(4,8));G.happiness=cl(G.happiness+r(5,10));txt='⚽ Great match with friends!';break;
      case 'boxing':   G.fitness=cl((G.fitness||50)+r(6,12));G.looks=cl(G.looks+r(1,4));G.stress=cl((G.stress||0)-r(5,10));txt='🥊 Boxing. Power building.';break;
      case 'sleep':    G.health=cl(G.health+r(4,8));G.happiness=cl(G.happiness+r(4,8));G.smarts=cl(G.smarts+r(1,3));G.stress=cl((G.stress||0)-r(9,16));txt='😴 Full rest day. Restored.';break;
      case 'salon':    G.looks=cl(G.looks+r(5,11));txt='💇 Fresh cut. Turning heads.';break;
      case 'spa':      G.looks=cl(G.looks+r(4,9));G.happiness=cl(G.happiness+r(8,15));G.stress=cl((G.stress||0)-r(15,22));txt='🧖 Full spa day. Magnificent.';break;
      case 'dentist':  G.looks=cl(G.looks+r(3,7));G.health=cl(G.health+r(2,4));txt='🦷 Gleaming teeth. Perfect checkup.';break;
      case 'personal_shop':G.looks=cl(G.looks+r(6,13));G.happiness=cl(G.happiness+r(5,10));txt='🛍️ Full wardrobe overhaul!';break;
      case 'movie':    G.happiness=cl(G.happiness+r(6,11));G.stress=cl((G.stress||0)-r(3,6));txt='🎬 Brilliant film.';break;
      case 'travel':   G.happiness=cl(G.happiness+r(12,20));G.health=cl(G.health+r(3,6));G.stress=cl((G.stress||0)-r(10,18));
        if(!G.countriesVisited)G.countriesVisited=[];
        const rc=pick(COUNTRIES.filter(c=>c.name!==G.country.name));
        if(rc&&!G.countriesVisited.includes(rc.name))G.countriesVisited.push(rc.name);
        txt=`✈️ Holiday in ${rc?rc.flag+' '+rc.name:'abroad'}. Recharged!`;break;
      case 'concert':  G.happiness=cl(G.happiness+r(9,15));G.fame=cl((G.fame||0)+r(1,3));G.stress=cl((G.stress||0)-r(4,8));txt='🎵 Live concert. Peak happiness.';break;
      case 'cook':     G.happiness=cl(G.happiness+r(5,10));G.health=cl(G.health+r(2,4));G.stress=cl((G.stress||0)-r(3,6));txt='👨‍🍳 Cooked from scratch. Satisfying.';break;
      case 'volunteer':G.happiness=cl(G.happiness+r(8,14));G.fame=cl((G.fame||0)+r(1,3));G.karma=cl((G.karma||0)+r(3,6),-100,100);txt='🤲 Volunteering. Reminded what matters.';break;
      case 'gaming':   G.happiness=cl(G.happiness+r(8,13));G.smarts=cl(G.smarts-r(2,5));G.stress=cl((G.stress||0)-r(5,10));txt='🎮 Lost hours gaming. Zero regrets.';break;
      case 'reading':  G.smarts=cl(G.smarts+r(4,9));G.happiness=cl(G.happiness+r(3,7));G.stress=cl((G.stress||0)-r(3,6));txt='📰 Another great book. Mind growing.';break;
      case 'museum':   G.smarts=cl(G.smarts+r(3,7));G.happiness=cl(G.happiness+r(3,6));txt='🏛️ Museum visit. Inspired.';break;
      case 'journal':  G.happiness=cl(G.happiness+r(4,8));G.stress=cl((G.stress||0)-r(5,10));G.smarts=cl(G.smarts+r(1,3));txt='📓 Journalled. Clarity found.';break;
      case 'music_play':G.happiness=cl(G.happiness+r(7,13));G.smarts=cl(G.smarts+r(2,5));G.stress=cl((G.stress||0)-r(5,10));txt='🎸 Playing music. Pure flow.';break;
      case 'paint':    G.happiness=cl(G.happiness+r(7,12));G.looks=cl(G.looks+r(1,3));G.stress=cl((G.stress||0)-r(4,8));txt='🎨 Painted. Art as therapy.';break;
      case 'nature':   G.happiness=cl(G.happiness+r(8,14));G.health=cl(G.health+r(3,6));G.stress=cl((G.stress||0)-r(8,14));txt='🌿 Day in nature. Soul refreshed.';break;
      case 'bar':      G.happiness=cl(G.happiness+r(9,15));G.health=cl(G.health-r(5,11));G.stress=cl((G.stress||0)-r(3,7));
        if(Math.random()<0.09){if(!G.addictions)G.addictions={};G.addictions.alcohol=true;this.log('🍺 Drinking too heavily. Dependency forming.','bad');}
        txt='🍸 Wild night out. Worth it.';type='neutral';break;
      case 'gamble':{
        const bet=sc(r(100,1500));
        if(G.money<bet){UI.toast('Not enough money!');return;}
        G.lifetimeGambled=(G.lifetimeGambled||0)+bet;
        if(Math.random()>0.46-((G.trait==='lucky')?0.08:0)){
          const won=Math.floor(bet*r(12,28)/10);G.money+=won;G.happiness=cl(G.happiness+12);
          txt=`🎰 Won ${fmt(won)}!`;type='special';
        } else {
          G.money=Math.max(0,G.money-bet);G.happiness=cl(G.happiness-8);
          txt=`🎰 Lost ${fmt(bet)}.`;type='bad';
        }
        break;}
      case 'smoke':    G.health=cl(G.health-r(4,8));G.happiness=cl(G.happiness+r(1,4));
        if(!G.addictions)G.addictions={};
        if(Math.random()<0.13)G.addictions.smoking=true;
        G.karma=cl((G.karma||0)-r(0,1),-100,100);
        txt='🚬 Another cigarette. Lungs protesting.';type='bad';break;
      case 'drugs':{
        if(Math.random()<(G.trait==='lucky'?0.035:0.06)){G.alive=false;this._die('drug overdose');return;}
        G.health=cl(G.health-r(13,24));
        if(!G.achievements)G.achievements={};G.achievements.overdose=true;
        G.happiness=cl(G.happiness+(Math.random()>0.45?r(10,20):-r(5,15)));
        txt='💊 A very heavy night. Wrecked.';type='bad';
        this.checkAch();break;}
    }
    if(txt)this.log(txt,type);
    UI.update();UI.tab('life');
    this.checkAch();
  },

  _drift(){
    const G=window.G;
    const isDisciplined=G.trait==='disciplined';
    const decay=isDisciplined?0.65:1.0;

    if(G.age>30)G.looks=cl(G.looks-r(0,1));
    if(G.age>40)G.looks=cl(G.looks-Math.round(r(0,2)*decay));
    if(G.age>50)G.looks=cl(G.looks-Math.round(r(0,2)*decay));
    if(G.age>60)G.looks=cl(G.looks-Math.round(r(1,3)*decay));

    if(G.age>45)G.health=cl(G.health-Math.round(r(1,2)*decay));
    if(G.age>60)G.health=cl(G.health-Math.round(r(2,3)*decay));
    if(G.age>75)G.health=cl(G.health-Math.round(r(3,5)*decay));
    if(G.age>85)G.health=cl(G.health-Math.round(r(4,8)*decay));

    if(G.age>35)G.fitness=cl((G.fitness||50)-Math.round(r(0,2)*decay));
    if(G.age>60)G.fitness=cl((G.fitness||50)-Math.round(r(1,3)*decay));

    if(G.trait==='athletic')G.fitness=cl((G.fitness||50)+1);
    if(G.trait==='resilient'&&G.age>45)G.health=cl(G.health+1);

    if((G.fame||0)>10)G.fame=cl((G.fame||0)-r(0,1));

    if(G.happiness<50)G.happiness=cl(G.happiness+r(1,3));
    else if(G.happiness>80)G.happiness=cl(G.happiness-r(0,2));

    if(!G.stress)G.stress=0;
    if(G.stress>0)G.stress=cl(G.stress-r(1,3));
    if(G.stress>70){G.health=cl(G.health-r(1,3));G.happiness=cl(G.happiness-r(1,3));}
    if(G.stress>90){G.health=cl(G.health-r(2,4));G.happiness=cl(G.happiness-r(2,4));}

    if(G.happiness>=90)G.happyStreak=(G.happyStreak||0)+1; else G.happyStreak=0;
    if(G.stress<10)G.lowStressStreak=(G.lowStressStreak||0)+1; else G.lowStressStreak=0;
    if((G.fitness||50)<20)G.health=cl(G.health-r(1,2));

    if((G.karma||0)<-30&&Math.random()<0.07){G.happiness=cl(G.happiness-r(2,6));this.log('⚖️ Karma catching up.','bad');}
    if((G.karma||0)>50&&Math.random()<0.05){G.happiness=cl(G.happiness+r(2,5));this.log('😇 Good karma at work.','good');}

    if(G.money===0&&G.age>18){if(!G.achievements)G.achievements={};G.achievements.rock_bottom=true;}
    if(G.happiness<=5){if(!G.achievements)G.achievements={};G.achievements.hit_rock_bottom_mood=true;}
  },

  _checkDeath(){
    const G=window.G;if(!G.alive)return false;
    let chance=0;
    if(G.age>=95)chance=0.33; else if(G.age>=85)chance=0.18; else if(G.age>=75)chance=0.08;
    else if(G.age>=65)chance=0.04; else if(G.age>=55)chance=0.018;
    else if(G.age>=35)chance=0.007; else if(G.age>=18)chance=0.004;
    if(G.health<20)chance+=0.13; if(G.health<10)chance+=0.24;
    if(G.stress>90)chance+=0.03;
    if(G.difficulty==='extreme')chance*=1.5;
    if(G.difficulty==='easy')   chance*=0.55;
    if(G.trait==='resilient')   chance*=0.82;
    if(G.trait==='lucky')       chance*=0.88;
    if((G.country.lifeExp||80)&&G.age>G.country.lifeExp)chance+=0.05;
    if((G.karma||0)>50)chance*=0.90;
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
    const G=window.G;G.alive=false;G.causeOfDeath=cause;
    const nw=netWorth(G);
    let score=0;
    score+=G.age>80?30:G.age>60?20:G.age>40?10:5;
    score+=G.happiness>70?20:G.happiness>40?10:0;
    score+=nw>1000000?20:nw>100000?10:nw>10000?5:0;
    score+=(G.rels.children||[]).length>0?10:0;
    score+=(G.career?.prestige||0)*3;
    score+=(G.fame||0)/10;
    score+=(G.completedGoals||[]).length*3;
    score+=(G.challengeScore||0);
    score+=(G.karma||0)>50?10:(G.karma||0)<-30?-5:0;
    score+=G.ambitionAchieved?12:0;
    score-=(G.crimes||[]).length*2;
    // v9: bonus for skills and stocks
    if(G.skills){const topSkills=Object.values(G.skills).filter(v=>v>=4).length;score+=topSkills*4;}
    if(typeof Stocks!=='undefined'){const sv=Stocks.portfolioValue();score+=sv>500000?8:sv>100000?4:0;}
    const grade=score>=90?{g:'S',l:'Legendary Life',c:'#ffd700'}:score>=75?{g:'A',l:'Excellent Life',c:'var(--green)'}:score>=55?{g:'B',l:'Good Life',c:'var(--cyan)'}:score>=35?{g:'C',l:'Average Life',c:'var(--yellow)'}:score>=20?{g:'D',l:'Hard Life',c:'var(--orange)'}:{g:'F',l:'Tragic Life',c:'var(--red)'};

    // Life story
    const story=[];
    if(G.education==='university')story.push(`${G.name} earned a university degree${G.univType==='ivy'?' from an Ivy League institution':''}.`);
    if(G.career)story.push(`They built a career as a ${G.career.title}.`);
    if(G.rels.partner?.married)story.push(`They married the love of their life, ${G.rels.partner.name}.`);
    if((G.rels.children||[]).length>0)story.push(`They raised ${G.rels.children.length} child${G.rels.children.length!==1?'ren':''}.`);
    if(G.business)story.push(`They founded ${G.business.name}, valued at ${fmt(G.business.value)}.`);
    if(nw>1000000)story.push(`By their death, ${G.name} had accumulated a net worth of ${fmtFull(nw)}.`);
    if((G.countriesVisited||[]).length>3)story.push(`They explored ${G.countriesVisited.length} countries across the world.`);
    if(G.skills){const masterSkills=Object.entries(G.skills).filter(([,v])=>v>=5).map(([k])=>k);if(masterSkills.length>0)story.push(`They mastered the arts of ${masterSkills.join(', ')}.`);}
    if(typeof Stocks!=='undefined'){const sv=Stocks.portfolioValue();if(sv>50000)story.push(`Their investment portfolio reached ${fmtFull(sv)}.`);}
    if(G.ambitionAchieved){const a=LIFE_AMBITIONS.find(x=>x.id===G.ambition);if(a)story.push(`Their life ambition was achieved: "${a.name}".`);}
    if(G.challenge&&G.challenge!=='none')story.push(`They lived under the "${G.challengeName||G.challenge}" challenge, earning a harder-life score bonus.`);
    if(G.lifeRecords?.bestYear)story.push(`Their best year was age ${G.lifeRecords.bestYear.age}: ${G.lifeRecords.bestYear.headline}`);
    if(G.lifeRecords?.worstYear)story.push(`Their hardest year was age ${G.lifeRecords.worstYear.age}: ${G.lifeRecords.worstYear.headline}`);
    if((G.timeline||[]).length)story.push(`Key milestones included: ${(G.timeline||[]).slice(0,4).map(m=>`age ${m.age} ${m.text}`).join('; ')}.`);
    story.push(`${G.name} passed away at age ${G.age} from ${cause}.`);
    document.getElementById('dt-story').textContent=story.join(' ');

    document.getElementById('dt-title').textContent=`${G.name} ${G.surname} has died.`;
    document.getElementById('dt-cause').textContent=`Cause of death: ${cause}`;
    document.getElementById('dt-quote').textContent=pick(DEATH_QUOTES);
    const gradeEl=document.getElementById('dt-grade');gradeEl.textContent=grade.g;gradeEl.style.color=grade.c;
    document.getElementById('dt-grade-lbl').textContent=grade.l;
    document.getElementById('dt-stats').innerHTML=[
      ['Age at death',`${G.age} years old`,''],
      ['Country',`${G.country.flag} ${G.country.name}`,''],
      ['Net worth',fmtFull(nw),'color:var(--green)'],
      ['Career',G.career?G.career.title:G.retired?'Retired':'Unemployed',''],
      ['Education',G.education==='university'?`🎓 ${G.univType==='ivy'?'Ivy League':'University'}`:G.education==='high_school'?'📜 High School':G.education==='vocational'?'🔧 Vocational':'📚 None',''],
      ['Relationship',G.rels.partner?(G.rels.partner.married?`💍 Married to ${G.rels.partner.name}`:`💑 With ${G.rels.partner.name}`):'Single',''],
      ['Children',(G.rels.children||[]).length,''],
      ['Goals completed',`${(G.completedGoals||[]).length} / 12`,'color:var(--accent)'],
      ['Life Ambition',G.ambitionAchieved?'✅ Achieved!':'❌ Not achieved',G.ambitionAchieved?'color:var(--green)':'color:var(--muted)'],
      ['Karma',(G.karma||0)>0?`+${G.karma} 😇`:(G.karma||0)<0?`${G.karma} 😈`:'Neutral ⚖️',(G.karma||0)>0?'color:var(--green)':(G.karma||0)<0?'color:var(--red)':''],
      ['Stress at death',`${G.stress||0}%`,'color:var(--orange)'],
      ['Top Skills',(G.skills?Object.entries(G.skills).filter(([,v])=>v>=3).map(([k,v])=>`${k}:Lv${v}`).join(', '):'—')||'—','color:var(--cyan)'],
      ['Stock portfolio',fmtFull(typeof Stocks!=='undefined'?Stocks.portfolioValue():0),'color:var(--green)'],
      ['Social followers',fmtFollowers(G.followers||0),'color:var(--accent)'],
      ['Final happiness',`${G.happiness}%`,'color:var(--yellow)'],
      ['Final health',`${G.health}%`,'color:var(--green)'],
    ].map(([l,v,s])=>`<div class="dstat-row"><span class="dstat-l">${l}</span><span class="dstat-v" style="${s}">${v}</span></div>`).join('');

    Save.hof({name:`${G.name} ${G.surname}`,age:G.age,country:G.country.flag,netWorth:nw,career:G.career?.title||(G.retired?'Retired':'Unemployed'),children:(G.rels.children||[]).length,cause,grade:grade.g,score});
    Save.clear();
    App.show('death-screen');
  },

  checkAch(){
    const G=window.G;if(!G)return;
    const unlocked=Save.unlockedAchs();
    ACHIEVEMENTS.forEach(a=>{
      if(!unlocked.includes(a.id)){
        try{if(a.check(G)){if(Save.unlockAch(a.id)){UI.achievementPopup(a);}}}catch(e){}
      }
    });
    if(G.achievements?.survived_recession)Save.unlockAch('recession_surv');
    if(G.achievements?.survived_pandemic) Save.unlockAch('pandemic_surv');
    if(G.achievements?.boom_profit)       Save.unlockAch('boom_profit');
  },
};
