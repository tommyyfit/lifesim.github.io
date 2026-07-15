/* LifeSim v22 Upgrade Layer — premium identity + game feel + procedural stories */
(function(){
  'use strict';
  const VERSION='v22';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const pick=a=>a&&a.length?a[Math.floor(Math.random()*a.length)]:null;
  const moneyFmt=n=>{try{return typeof fmt==='function'?fmt(n):'$'+Math.round(n).toLocaleString('en-US');}catch(_){return '$'+Math.round(n||0).toLocaleString('en-US');}};
  const safeStore={
    get(key){try{return window.localStorage?.getItem(key)??null;}catch(_){return null;}},
    set(key,value){try{window.localStorage?.setItem(key,value);return true;}catch(_){return false;}}
  };

  const Sound={
    ctx:null,muted:safeStore.get('lifesim_v22_mute')==='1',volume:Math.max(0,Math.min(1,Number(safeStore.get('lifesim_v22_volume')??0.6))),armed:false,
    ensure(){
      if(this.muted)return null;
      if(!this.ctx){
        const AC=window.AudioContext||window.webkitAudioContext;
        if(!AC)return null;
        this.ctx=new AC();
      }
      if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});
      return this.ctx;
    },
    tone(freq=440,dur=.08,type='sine',gain=.035,delay=0){
      if(this.muted)return;
      const ctx=this.ensure(); if(!ctx)return;
      const t=ctx.currentTime+delay;
      const o=ctx.createOscillator(); const g=ctx.createGain();
      o.type=type; o.frequency.setValueAtTime(freq,t);
      const level=Math.max(.0001,gain*this.volume);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(level,t+.012); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t+dur+.02);
    },
    play(kind){
      if(this.muted)return;
      const map={
        click:()=>this.tone(320,.045,'triangle',.012),
        money:()=>{this.tone(660,.09,'sine',.03);this.tone(990,.12,'sine',.025,.055);},
        bad:()=>{this.tone(180,.11,'sawtooth',.018);this.tone(130,.12,'sawtooth',.014,.06);},
        good:()=>{this.tone(520,.08,'triangle',.024);this.tone(780,.10,'triangle',.02,.06);},
        love:()=>{this.tone(392,.08,'sine',.022);this.tone(523,.12,'sine',.02,.08);},
        achievement:()=>{[523,659,784,1046].forEach((f,i)=>this.tone(f,.11,'triangle',.025,i*.055));},
        promotion:()=>{[440,554,659,880].forEach((f,i)=>this.tone(f,.08,'square',.018,i*.045));},
        birth:()=>{this.tone(660,.09,'sine',.022);this.tone(880,.10,'sine',.02,.07);},
        death:()=>{this.tone(220,.22,'sine',.026);this.tone(146,.28,'sine',.02,.14);},
        casino:()=>{[740,980,1230].forEach((f,i)=>this.tone(f,.055,'square',.016,i*.035));},
        stock:()=>{this.tone(420,.05,'triangle',.016);this.tone(620,.05,'triangle',.014,.045);},
        hospital:()=>{this.tone(880,.06,'sine',.015);this.tone(880,.06,'sine',.012,.12);}
      };
      (map[kind]||map.click)();
    },
    setMuted(value){this.muted=!!value;safeStore.set('lifesim_v22_mute',this.muted?'1':'0');this.renderToggle();const c=document.getElementById('set-sound');if(c)c.checked=!this.muted;},
    setVolume(value){this.volume=Math.max(0,Math.min(1,Number(value)||0));safeStore.set('lifesim_v22_volume',String(this.volume));const c=document.getElementById('set-sound-volume');if(c)c.value=String(Math.round(this.volume*100));const o=document.getElementById('set-sound-volume-value');if(o)o.textContent=Math.round(this.volume*100)+'%';},
    toggle(){const wasMuted=this.muted;this.setMuted(!this.muted);if(wasMuted)this.play('good');},
    renderToggle(){
      // Sound is controlled in Settings. Remove the legacy floating button if an old build created it.
      $('.v22-sound-toggle')?.remove();
    },
    boot(){
      this.renderToggle();
      document.addEventListener('pointerdown',()=>{if(!this.armed){this.armed=true;this.ensure();}}, {once:true,capture:true});
      document.addEventListener('click',e=>{if(e.target.closest('button,.card,.choice-btn,.nt,.trait-btn,.ambition-btn'))this.play('click');},true);
    }
  };

  const FX={
    layer(){let l=$('.v22-feedback-layer');if(!l){l=document.createElement('div');l.className='v22-feedback-layer';document.body.appendChild(l);}return l;},
    float(text,cls='good',target=null){
      const el=document.createElement('div');el.className='v22-float '+cls;el.textContent=text;
      const rect=target?.getBoundingClientRect?.();
      if(rect){el.style.left=(rect.left+rect.width/2)+'px';el.style.top=(rect.top+rect.height/2)+'px';}
      else{el.style.left=(38+Math.random()*24)+'vw';el.style.top=(35+Math.random()*25)+'vh';}
      el.style.setProperty('--x',Math.round((Math.random()-.5)*80)+'px');
      el.style.setProperty('--y',Math.round(-40-Math.random()*80)+'px');
      this.layer().appendChild(el); setTimeout(()=>el.remove(),1500);
    },
    statDelta(before,after){
      const defs={money:['💰','money','g-money'],happiness:['😊','good','sv-hap'],health:['❤️','good','sv-hlt'],smarts:['🧠','good','sv-smt'],looks:['✨','good','sv-lks'],fitness:['⚡','good','sv-fit'],stress:['😤','bad','sv-str'],fame:['🌟','good','sv-fam'],karma:['⚖️','good','sv-kar']};
      Object.entries(defs).forEach(([k,[icon,cls,id]])=>{
        const a=Number(after?.[k]??0),b=Number(before?.[k]??0),d=Math.round(a-b); if(!d)return;
        const positive=k==='stress'?d<0:d>0; const c=positive?(k==='money'?'money':'good'):'bad';
        const val=k==='money'?(d>0?'+':'')+moneyFmt(d):(d>0?'+':'')+d;
        this.float(`${icon} ${val}`,c,document.getElementById(id));
      });
    },
    confetti(count=50){
      const colors=['#7c3aed','#06b6d4','#22c55e','#fbbf24','#f472b6','#ffffff'];
      for(let i=0;i<count;i++){
        const p=document.createElement('span');p.className='v22-confetti';p.style.left=(Math.random()*100)+'vw';p.style.background=pick(colors);p.style.setProperty('--x',Math.round((Math.random()-.5)*240)+'px');p.style.animationDelay=(Math.random()*.25)+'s';document.body.appendChild(p);setTimeout(()=>p.remove(),1900);
      }
    },
    hearts(count=9){for(let i=0;i<count;i++){const h=document.createElement('span');h.className='v22-heart-burst';h.textContent=pick(['❤️','💗','💞','💕']);h.style.left=(42+Math.random()*18)+'vw';h.style.top=(45+Math.random()*12)+'vh';h.style.setProperty('--x',Math.round((Math.random()-.5)*150)+'px');h.style.setProperty('--y',Math.round(-40-Math.random()*120)+'px');document.body.appendChild(h);setTimeout(()=>h.remove(),1100);}},
    shock(){const el=$('#game-screen.active .game-main')||$('#game-screen.active')||document.body;el.classList.add('v22-shockwave');setTimeout(()=>el.classList.remove('v22-shockwave'),650);},
    achievement(a){
      if(this._lastAchId===a?.id&&Date.now()-(this._lastAchTime||0)<650)return;
      this._lastAchId=a?.id||a?.name; this._lastAchTime=Date.now();
      const old=$('.v22-ach-pop'); if(old)old.remove();
      const el=document.createElement('div');el.className='v22-ach-pop';el.innerHTML=`<div class="v22-ach-icon">${esc(a?.icon||'🏆')}</div><div><div class="v22-ach-k">Achievement unlocked</div><div class="v22-ach-t">${esc(a?.name||'New Milestone')}</div><div class="v22-ach-d">${esc(a?.desc||'Your story changed permanently.')}</div></div>`;
      document.body.appendChild(el); Sound.play('achievement'); setTimeout(()=>{el.style.animation='v22AchIn .35s reverse both';setTimeout(()=>el.remove(),360);},3600);
    }
  };

  const TraitPlus={
    profiles:{
      funny:{icon:'😂',name:'Funny',desc:'Turns social pressure into charm. Better friendships, small happiness rebounds.',startBonus:{happiness:8,looks:2,fame:2}},
      lazy:{icon:'🛋️',name:'Lazy',desc:'Less stress, but weaker discipline and career momentum unless life forces growth.',startBonus:{happiness:5,stress:-8,fitness:-4,smarts:-2}},
      arrogant:{icon:'👑',name:'Arrogant',desc:'More confidence, fame and risk. Relationships can suffer if ego takes over.',startBonus:{fame:6,looks:5,karma:-8}},
      honest:{icon:'🤝',name:'Honest',desc:'Better reputation, trust and family bonds. Crime and deception paths are harder.',startBonus:{karma:18,happiness:3}},
      introvert:{icon:'🌙',name:'Introvert',desc:'Lower social pressure, stronger solo learning and calmer routines.',startBonus:{smarts:7,stress:-6}},
      extrovert:{icon:'🎉',name:'Extrovert',desc:'More friends, dating momentum and fame, but more spending temptation.',startBonus:{looks:5,happiness:7,fame:3}},
      curious:{icon:'🧭',name:'Curious',desc:'More random discoveries, travel/story variety and learning bonuses.',startBonus:{smarts:6,happiness:4,skillPoints:1}}
    },
    addTraits(){
      try{
        if(typeof PERSONALITY_TRAITS==='undefined')return;
        Object.entries(this.profiles).forEach(([id,p])=>{
          if(!PERSONALITY_TRAITS.some(t=>t.id===id))PERSONALITY_TRAITS.push({id,icon:p.icon,name:p.name,desc:p.desc,startBonus:p.startBonus});
        });
      }catch(e){console.warn('v22 traits failed',e);}
    },
    profile(id){try{return (typeof PERSONALITY_TRAITS!=='undefined'&&PERSONALITY_TRAITS.find(t=>t.id===id))||this.profiles[id]||null;}catch(_){return this.profiles[id]||null;}},
    ensure(G){if(!G)return;G.v22=G.v22||{};G.v22.personality=G.v22.personality||{years:0,turningPoints:[],legacyStyle:'Unwritten'};return G.v22.personality;},
    tick(){
      const G=window.G;if(!G||!G.alive)return; const p=this.ensure(G); p.years++;
      const t=G.trait; let log=null;
      if(t==='funny'){ if((G.stress||0)>55){G.happiness=clamp((G.happiness||50)+2);G.reputation=clamp((G.reputation||50)+1); if(Math.random()<.16)log='😂 You used humor to cut through a tense year.';} }
      if(t==='lazy'){ G.stress=clamp((G.stress||0)-2); if(G.career&&Math.random()<.18){G.jobPerf=clamp((G.jobPerf||50)-2);log='🛋️ Comfort won over ambition this year. Work performance slipped a little.';} }
      if(t==='arrogant'){ G.fame=clamp((G.fame||0)+1); if(G.rels?.partner&&Math.random()<.16){G.rels.partner.love=clamp((G.rels.partner.love||50)-3);log='👑 Your confidence came across as ego at home.';} }
      if(t==='honest'){ G.reputation=clamp((G.reputation||50)+2); if((G.karma||0)<80)G.karma=clamp((G.karma||0)+1,-100,100); }
      if(t==='introvert'){ G.smarts=clamp((G.smarts||50)+1); G.stress=clamp((G.stress||0)-1); }
      if(t==='extrovert'){ if(!G.rels)G.rels={friends:[]}; if(Math.random()<.10&&G.age>12&&G.rels.friends?.length<10&&window.Engine?.npc){const f=Engine.npc('friend',Math.random()>.5?'female':'male');f.age=Math.max(12,(G.age||18)+Math.floor(Math.random()*7)-3);G.rels.friends.push(f);log=`🎉 Your extrovert energy attracted a new friend: ${f.name}.`; } }
      if(t==='curious'){ if(Math.random()<.18){ if((G.age||0)<18){G.youthTalents=G.youthTalents||{reading:0,sport:0,creative:0,social:0,curiosity:0};G.youthTalents.curiosity=(G.youthTalents.curiosity||0)+1;log='🧭 Curiosity grew into a new discovery this year.';}else{G.skillPoints=(G.skillPoints||0)+1;log='🧭 Curiosity paid off — you earned an extra skill point.';} } }
      if(log)Engine.log(log,'special');
      p.legacyStyle=this.legacyStyle(G);
    },
    modifyEffects(eff,G){
      if(!eff||!G)return eff; const t=G.trait; const out={...eff};
      const bump=(k,m)=>{if(Number.isFinite(out[k]))out[k]=Math.round(out[k]*m);};
      if(t==='funny'){bump('happiness',1.16); if(out.stress>0)out.stress=Math.round(out.stress*.85);}
      if(t==='lazy'){bump('stress',.75); if(out.fitness>0)out.fitness=Math.round(out.fitness*.82); if(out.smarts>0)out.smarts=Math.round(out.smarts*.9);}
      if(t==='arrogant'){bump('fame',1.35); if(out.karma<0)out.karma=Math.round(out.karma*1.2);}
      if(t==='honest'){bump('karma',1.2); if(out.fame<0)out.fame=Math.round(out.fame*.8);}
      if(t==='introvert'){bump('smarts',1.15); if(out.stress>0)out.stress=Math.round(out.stress*.85);}
      if(t==='extrovert'){bump('fame',1.18);bump('looks',1.08);bump('happiness',1.08);}
      if(t==='curious'){bump('smarts',1.14);}
      return out;
    },
    legacyStyle(G){
      if((G.fame||0)>75)return'Public Icon'; if((G.karma||0)>60)return'Kind Builder'; if((G.money||0)>1000000)return'Wealth Architect'; if((G.smarts||0)>85)return'Lifelong Learner'; if((G.rels?.children||[]).length>=3)return'Family Anchor'; return'Unwritten';
    },
    html(G){
      if(!G)return''; const td=this.profile(G.trait)||{}; const p=this.ensure(G);
      const vals=[['Identity',G.trait?85:35],['Reputation',G.reputation||50],['Karma',Math.max(0,Math.min(100,(G.karma||0)+50))],['Calm',100-(G.stress||0)]];
      const chips=[];
      if(G.trait)chips.push(`${td.icon||'✨'} ${td.name||G.trait}`); if(G.ambition)chips.push(`🎯 ${String(G.ambition).replace(/_/g,' ')}`); chips.push(`🧬 ${p.legacyStyle}`); if((G.rels?.children||[]).length)chips.push(`🌳 ${(G.rels.children||[]).length} heirs`);
      return `<section class="v22-panel"><div class="v22-kicker">Personality Engine</div><h3 class="v22-title">${esc(G.name)} feels like a real person now</h3><p class="v22-copy">Core trait effects now influence yearly pressure, choices, relationships, fame, reputation and long-term legacy style.</p><div class="v22-chip-row">${chips.map(x=>`<span class="v22-chip">${esc(x)}</span>`).join('')}</div><div class="v22-trait-meter">${vals.map(([l,v])=>`<div class="v22-meter-row"><span>${esc(l)}</span><div class="v22-meter-track"><div class="v22-meter-fill" style="width:${clamp(v)}%"></div></div><b>${Math.round(clamp(v))}</b></div>`).join('')}</div></section>`;
    }
  };

  const ProceduralStories={
    weather:['rainy','icy','golden','windy','humid','quiet','stormy','bright'],
    politics:['tense election season','tax reform debate','housing crisis','public transport strike','small-business grant wave','anti-corruption campaign','school reform debate'],
    crime:['quiet streets','rising scams','gang pressure','police crackdown','pickpocket wave','neighborhood watch'],
    context(G){
      const age=G.age||0; const stage=age<13?'child':age<18?'teen':age<30?'young adult':age<55?'adult':'elder';
      const job=G.career?.title || (G.hustle?.clients ? 'freelancer' : 'unemployed');
      const rel=G.rels?.partner?(G.rels.partner.married?'married':'in a relationship'):(G.rels?.friends?.length?'social':'single');
      const wealth=typeof netWorth==='function'?netWorth(G):(G.money||0);
      const money=wealth>1000000?'wealthy':wealth>100000?'comfortable':wealth<0?'in debt':'getting by';
      const health=(G.health||50)>75?'healthy':(G.health||50)<35?'fragile':'average health';
      return {country:G.country?.name||'your country',flag:G.country?.flag||'🌍',stage,job,rel,money,health,weather:pick(this.weather),politics:pick(this.politics),crime:pick(this.crime)};
    },
    make(G){
      const c=this.context(G); const trait=TraitPlus.profile(G.trait); const templates=[
        {icon:'🗞️',title:'Local Headlines',text:`A ${c.weather} week in ${c.flag} ${c.country} collides with a ${c.politics}. As a ${c.stage} who is ${c.money}, everyone around you has an opinion about what you should do next.`},
        {icon:'🚶',title:'A Walk Home',text:`Walking home through ${c.crime}, you notice how different life feels as a ${c.health} ${c.stage}. Your ${trait?.name||'personality'} side pushes you toward a choice.`},
        {icon:'☕',title:'Unexpected Conversation',text:`At a small cafe, someone recognizes your situation: ${c.job}, ${c.rel}, ${c.money}. The conversation turns into a surprisingly important moment.`},
        {icon:'📱',title:'A Message at Midnight',text:`A late message arrives during a ${c.weather} night. It is tied to work, family, and the bigger mood in ${c.country}. Ignoring it would be easy.`},
        {icon:'🧩',title:'Crossroads Year',text:`This year feels like a puzzle: ${c.politics}, ${c.crime}, ${c.health}, and your ${trait?.name||'core'} trait all pull in different directions.`}
      ];
      const base=pick(templates); const traitId=G.trait;
      const choices=[
        {t:'Act with discipline',e:TraitPlus.modifyEffects({smarts:4,stress:3,reputation:2},G)},
        {t:'Follow your heart',e:TraitPlus.modifyEffects({happiness:6,stress:-3,karma:2},G)},
        {t:'Chase opportunity',e:TraitPlus.modifyEffects({money:Math.round(500+Math.random()*4500),fame:2,stress:5},G)}
      ];
      if(traitId==='honest')choices.push({t:'Tell the truth, even if costly',e:{karma:8,reputation:5,money:-500,stress:-2}});
      if(traitId==='arrogant')choices.push({t:'Make a bold public move',e:{fame:8,happiness:3,karma:-4,stress:4}});
      if(traitId==='lazy')choices.push({t:'Keep life simple',e:{stress:-9,happiness:3,smarts:-1}});
      if(traitId==='curious')choices.push({t:'Investigate deeper',e:{smarts:8,skillPoints:1,stress:2}});
      return {...base,type:'special',_procedural:true,choices:choices.slice(0,4)};
    },
    shouldFire(G){
      if(!G||G.inPrison||G.age<18)return false; G.v22=G.v22||{}; const last=G.v22.lastProceduralAge??-99;
      const gap=(G.age-last)>=3; const chance={easy:.28,normal:.38,hard:.48,extreme:.58,custom:.38}[G.difficulty||'normal']??.38;
      return gap&&Math.random()<chance;
    },
    remember(G,evt){G.v22=G.v22||{};G.v22.lastProceduralAge=G.age;G.v22.storySeeds=G.v22.storySeeds||[];G.v22.storySeeds.unshift({age:G.age,title:evt.title,text:evt.text,ts:Date.now()});G.v22.storySeeds.length=Math.min(25,G.v22.storySeeds.length);},
    inject(queue){const G=window.G;const limit=(G?.age||0)<18?2:3;if(!G||!Array.isArray(queue)||queue.length>=limit||!this.shouldFire(G))return;const evt=this.make(G);queue.push(evt);this.remember(G,evt);}
  };

  const LegacyGoals={
    ensure(G){
      if(!G)return[]; G.v22=G.v22||{};
      if(!Array.isArray(G.v22.legacyDreams)||!G.v22.legacyDreams.length){
        G.v22.legacyDreams=[
          {id:'dynasty',icon:'🌳',name:'Build a Dynasty',target:3,kind:'children'},
          {id:'respected',icon:'⭐',name:'Leave a Respected Name',target:85,kind:'reputation'},
          {id:'empire',icon:'🏦',name:'Create Generational Wealth',target:1000000,kind:'networth'},
          {id:'story',icon:'📖',name:'Live a Story Worth Retelling',target:12,kind:'major'}
        ];
      }
      return G.v22.legacyDreams;
    },
    progress(G,d){
      if(d.kind==='children')return (G.rels?.children||[]).length;
      if(d.kind==='reputation')return G.reputation||0;
      if(d.kind==='networth')return typeof netWorth==='function'?netWorth(G):(G.money||0);
      if(d.kind==='major')return (G.v22?.timeline||[]).length;
      return 0;
    },
    html(G){
      const dreams=this.ensure(G); const childNames=(G.rels?.children||[]).slice(0,4).map(c=>c.name).filter(Boolean);
      return `<section class="v22-panel"><div class="v22-kicker">Legacy Builder</div><h3 class="v22-title">Family, reputation and empire matter</h3><p class="v22-copy">Long-term dreams now make the run feel bigger than one-year actions. Children, reputation, wealth and major milestones feed your legacy.</p>${childNames.length?`<div class="v22-chip-row">${childNames.map(n=>`<span class="v22-chip good">🌱 ${esc(n)}</span>`).join('')}</div>`:''}<div class="v22-legacy-dreams">${dreams.map(d=>{const p=this.progress(G,d);const pct=d.kind==='networth'?Math.min(100,p/d.target*100):Math.min(100,p/d.target*100);return`<div class="v22-dream"><div class="v22-dream-top"><span>${d.icon} ${esc(d.name)}</span><span>${d.kind==='networth'?moneyFmt(p):Math.round(p)} / ${d.kind==='networth'?moneyFmt(d.target):d.target}</span></div><div class="v22-dream-bar"><div class="v22-dream-fill" style="width:${pct}%"></div></div></div>`;}).join('')}</div></section>`;
    }
  };

  const TimelinePlus={
    keywords:[/born|birth|sibling|father|mother/i,/graduat|school|university|degree/i,/job|career|promot|raise|ceo|hired/i,/married|partner|crush|date|kiss|love/i,/child|baby|son|daughter|pregnan/i,/house|home|property|car|vehicle|business/i,/achievement|ambition|goal|legacy|fame/i,/died|death|hospital|overdose/i],
    ensure(G){G.v22=G.v22||{};if(!Array.isArray(G.v22.timeline))G.v22.timeline=[];return G.v22.timeline;},
    capture(text,type){const G=window.G;if(!G)return; if(!this.keywords.some(rx=>rx.test(text)))return; const tl=this.ensure(G); const item={age:G.age||0,text:String(text).replace(/^\p{Emoji_Presentation}\s*/u,''),type:type||'neutral',ts:Date.now()}; if(tl[0]&&tl[0].age===item.age&&tl[0].text===item.text)return; tl.unshift(item); tl.length=Math.min(80,tl.length);},
    html(G){
      const items=this.ensure(G).slice(0,5);
      return `<section class="v22-life-map"><div class="v22-map-head"><div><div class="v22-kicker">Interactive Life Map</div><h3 class="v22-title">Major milestones at a glance</h3></div><span class="v22-chip">Age ${esc(G.age||0)}</span></div>${items.length?`<div class="v22-map-line">${items.map(i=>`<article class="v22-map-item"><div class="v22-map-age">Age ${esc(i.age)}</div><div class="v22-map-text">${esc(i.text)}</div></article>`).join('')}</div>`:`<div class="v22-map-empty">Major life milestones will appear here as your story unfolds.</div>`}</section>`;
    }
  };

  const Dashboard={
    inject(){
      const G=window.G; const tab=$('#tab-life'); if(!G||!tab||tab.dataset.v22Injected===String(G.ageUpSerial||0)+'-'+String((G.log||[]).length))return;
      const shell=$('.life-view-shell',tab); if(!shell)return;
      $$('.v22-dashboard,.v22-life-map',tab).forEach(n=>n.remove());
      const wrap=document.createElement('div');wrap.className='v22-dashboard';wrap.innerHTML=TraitPlus.html(G)+LegacyGoals.html(G);
      shell.insertAdjacentElement('beforebegin',wrap); wrap.insertAdjacentElement('beforebegin',document.createRange().createContextualFragment(TimelinePlus.html(G)).firstElementChild);
      tab.dataset.v22Injected=String(G.ageUpSerial||0)+'-'+String((G.log||[]).length);
    }
  };

  const Onboarding={
    show(){
      const G=window.G;if(!G)return;
      G.v22=G.v22||{};G.v22.onboardingSeen=true;
    }
  };


  function patch(){
    if(window.__LifeSimV22Patched)return; window.__LifeSimV22Patched=true;
    document.title='LifeSim'; $('#app')?.setAttribute('data-build','v23-age-aware');
    try{ if(Array.isArray(window.LIFESIM_UPDATES)&&!window.LIFESIM_UPDATES.some(u=>u.version==='v22'))window.LIFESIM_UPDATES.unshift({version:'v22',title:'Identity, Game Feel & Procedural Life',date:'2026-07-09',tag:'Major Upgrade',highlights:['Premium LifeOS visual identity with glass, aurora depth and redesigned feedback surfaces.','Rich UI feedback: flying stat changes, money/love effects, confetti, achievement popups and camera pulse moments.','Synth sound effects for buttons, money, achievements, promotions, death, birth, hospital, casino and stock moments.','Procedural story events combine country, age, job, relationship, health, weather, local crime and politics.','Expanded personality traits now influence yearly life consequences and long-term legacy style.','Life Map, onboarding and legacy dreams make each run easier to understand and more meaningful.']}); }catch(_){ }
    TraitPlus.addTraits();
    Sound.boot();

    if(window.Engine&&!Engine._v22Patched){
      const oldLog=Engine.log.bind(Engine);
      Engine.log=function(text,type='neutral'){
        const out=oldLog(text,type); const s=String(text||''); TimelinePlus.capture(s,type);
        if(/promot|raise|hired|CEO|career/i.test(s)){FX.confetti(26);Sound.play('promotion');}
        else if(/married|love|kiss|date|partner|vows|crush/i.test(s)||type==='love'){FX.hearts(8);Sound.play('love');}
        else if(/born|baby|child|daughter|son|pregnan/i.test(s)){FX.hearts(6);Sound.play('birth');}
        else if(/hospital|doctor|surgery|illness|disease/i.test(s)){Sound.play('hospital');}
        else if(/casino|gambl|lottery/i.test(s)){Sound.play('casino');}
        else if(/stock|market|portfolio|invest/i.test(s)){Sound.play('stock');}
        else if(/bought|property|house|home|vehicle|car/i.test(s)){FX.shock();Sound.play('money');}
        else if(type==='money'||/\$|Kč|€|money|cash|salary|wealth/i.test(s)){Sound.play('money');}
        else if(type==='bad'){Sound.play('bad');}
        else if(type==='good'||type==='special'){Sound.play('good');}
        return out;
      };
      const oldScaled=Engine._scaledAction?.bind(Engine);
      if(oldScaled)Engine._scaledAction=function(eff,G){return TraitPlus.modifyEffects(oldScaled(eff,G),G);};
      const oldQueue=Engine._queueEvents?.bind(Engine);
      if(oldQueue)Engine._queueEvents=function(queue){oldQueue(queue);try{ProceduralStories.inject(queue);}catch(e){console.warn('v22 procedural story failed',e);}};
      if(Array.isArray(Engine._moduleOrder)&&!Engine._moduleOrder.includes('TraitPlus.tick'))Engine._moduleOrder.splice(1,0,'TraitPlus.tick');
      Engine._v22Patched=true;
    }

    window.TraitPlus=TraitPlus; window.ProceduralStories=ProceduralStories;

    if(window.UI&&!UI._v22Patched){
      const oldShowDelta=UI.showStatDelta?.bind(UI);
      if(oldShowDelta)UI.showStatDelta=function(before,after){const out=oldShowDelta(before,after);try{FX.statDelta(before,after);}catch(e){}return out;};
      const oldUpdate=UI.update?.bind(UI);
      if(oldUpdate)UI.update=function(){const out=oldUpdate();requestAnimationFrame(()=>Dashboard.inject());return out;};
      const oldRenderLog=UI.renderLog?.bind(UI);
      if(oldRenderLog)UI.renderLog=function(){const out=oldRenderLog();requestAnimationFrame(()=>Dashboard.inject());return out;};
      const oldAch=UI.achievementPopup?.bind(UI);
      UI.achievementPopup=function(a){try{FX.achievement(a);}catch(e){} if(oldAch)return oldAch(a);};
      UI._v22Patched=true;
    }

    if(window.Save&&!Save._v22Patched){
      const oldUnlock=Save.unlockAch?.bind(Save);
      if(oldUnlock)Save.unlockAch=function(id){const was=Save.unlockedAchs?.().includes(id);const ok=oldUnlock(id); if(ok&&!was){try{const a=(typeof ACHIEVEMENTS!=='undefined'&&ACHIEVEMENTS.find(x=>x.id===id))||{icon:'🏆',name:id,desc:'Unlocked'};FX.achievement(a);}catch(e){}} return ok;};
      Save._v22Patched=true;
    }

    if(window.App&&!App._v22Patched){
      const oldStart=App.startGame?.bind(App);
      if(oldStart)App.startGame=function(){const out=oldStart();setTimeout(()=>{if(window.G){TimelinePlus.capture(`👶 ${G.name} ${G.surname} began life in ${G.country?.name||'the world'}.`,'special');Onboarding.show();Dashboard.inject();}},520);return out;};
      const oldLoad=App.loadGame?.bind(App);
      if(oldLoad)App.loadGame=function(){const out=oldLoad();setTimeout(()=>{Dashboard.inject();},250);return out;};
      App._v22Patched=true;
    }

    if(window.Create&&!Create._v22Patched){
      const oldReset=Create.reset?.bind(Create);
      if(oldReset)Create.reset=function(){const out=oldReset();try{TraitPlus.addTraits();Create.renderTraits();}catch(_){ }return out;};
      Create._v22Patched=true;
    }

    document.addEventListener('visibilitychange',()=>{if(!document.hidden&&window.G)Dashboard.inject();});
    setTimeout(()=>{try{TraitPlus.addTraits();Create?.renderTraits?.();Dashboard.inject();}catch(_){ }},300);
  }

  window.LifeSimV22={Sound,FX,TraitPlus,ProceduralStories,LegacyGoals,TimelinePlus,Onboarding,patch};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patch,{once:true});else patch();
  window.addEventListener('load',patch);
})();
