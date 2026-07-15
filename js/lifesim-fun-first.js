/* LifeSim v24.2.1 — Fun First stabilization layer.
   Keeps the deep simulation, but presents a smaller, clearer and safer interface. */
(function(){
  'use strict';

  const FunFirst={
    VERSION:'24.2.1',
    BUILD:'24.2.1-fun-first',
    _patched:false,
    _navTimer:0,
    _lastRenderKey:'',
    _applyingNav:false,
    _navObserver:null,

    esc(value){
      return String(value??'').replace(/[&<>"']/g,c=>({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
      }[c]));
    },

    fmtMoney(value){
      try{return typeof fmt==='function'?fmt(Math.round(Number(value)||0)):Math.round(Number(value)||0).toLocaleString();}
      catch(_){return Math.round(Number(value)||0).toLocaleString();}
    },

    clamp(value,min=0,max=100){return Math.max(min,Math.min(max,Number(value)||0));},

    stage(G=window.G){
      const age=Math.max(0,Number(G?.age)||0);
      if(age<=2)return{id:'infant',icon:'🧸',label:'Infancy',line:'Safe moments, family and tiny discoveries.'};
      if(age<=5)return{id:'early',icon:'🪁',label:'Early childhood',line:'Play, curiosity and confidence.'};
      if(age<=12)return{id:'child',icon:'🎒',label:'School years',line:'Learn, make friends and find what you enjoy.'};
      if(age<=17)return{id:'teen',icon:'🎧',label:'Teen years',line:'Build identity, skills and independence.'};
      if(age<=24)return{id:'young',icon:'🌱',label:'Starting out',line:'Choose a direction without needing life solved.'};
      if(age<=44)return{id:'adult',icon:'🧭',label:'Adult life',line:'Balance work, people, money and yourself.'};
      if(age<=64)return{id:'mid',icon:'🌤️',label:'Midlife',line:'Protect what matters and change what does not.'};
      return{id:'senior',icon:'🌳',label:'Later life',line:'Enjoy the life you built and shape your legacy.'};
    },

    mood(G=window.G){
      const happy=this.clamp(G?.happiness||0),health=this.clamp(G?.health||0),stress=this.clamp(G?.stress||0);
      if(health<25)return{icon:'🤒',label:'Unwell',tone:'bad'};
      if(stress>80)return{icon:'😵',label:'Overwhelmed',tone:'bad'};
      if(happy>=85&&stress<40)return{icon:'😁',label:'Great',tone:'good'};
      if(happy>=65)return{icon:'🙂',label:'Good',tone:'good'};
      if(happy>=42)return{icon:'😐',label:'Okay',tone:'neutral'};
      return{icon:'😔',label:'Low',tone:'bad'};
    },

    coreTabs(G=window.G){
      const age=Number(G?.age)||0;
      if(age<=5)return['life','mind','love','health'];
      if(age<=12)return['life','career','mind','love','health'];
      if(age<=17)return['life','career','love','mind','health'];
      if(age<=64)return['life','career','love','assets','health'];
      return['life','love','health','assets','mind'];
    },

    tabLabel(name,G=window.G){
      const age=Number(G?.age)||0;
      const labels={life:'Life',mind:'Activities',love:age<13?'Family':age<18?'People':'Relationships',career:age<18?'School':age>=65?'Retirement':'Career',assets:'Money',health:'Health',goals:'Goals',skills:age<18?'Talents':'Skills',pets:'Pets',social:age<18?'Create':'Social',hustle:age<18?'Gigs':'Side Hustles',business:'Business',stocks:'Investing',crime:'Crime'};
      return labels[name]||name.charAt(0).toUpperCase()+name.slice(1);
    },

    tabIcon(name){
      return({life:'✨',mind:'🎮',love:'🫶',career:'💼',assets:'💰',health:'❤️',goals:'🎯',skills:'🎓',pets:'🐾',social:'📱',hustle:'⚡',business:'🏢',stocks:'📈',crime:'🚔'}[name]||'•');
    },

    eventHint(effect={}){
      const notes=[];
      const add=(condition,text)=>{if(condition&&notes.length<2)notes.push(text);};
      add(Number(effect.happiness)>0,'Feel happier');
      add(Number(effect.health)>0,'Improve health');
      add(Number(effect.smarts)>0,'Learn something');
      add(Number(effect.stress)<0,'Lower stress');
      add(Number(effect.money)>0,'Earn money');
      add(Number(effect.karma)>0,'Do something kind');
      add(Number(effect.happiness)<0||Number(effect.health)<0||Number(effect.stress)>0,'Could be difficult');
      add(Number(effect.money)<0,'Costs money');
      return notes.join(' · ');
    },

    optionalTabs(G=window.G){
      const core=new Set(this.coreTabs(G));
      const age=Number(G?.age)||0;
      if(age<6)return[];
      const rules=window.AgeLogic?.TAB_RULES||{};
      const order=['goals','skills','pets','social','hustle','business','stocks','crime'];
      return order.filter(name=>{
        if(core.has(name))return false;
        const min=Number(rules[name]?.min||0);
        if(age<min)return false;
        if(name==='crime'&&age<18)return false;
        return !!document.querySelector(`.nt[data-tab="${name}"]`);
      });
    },

    ensureMoreButton(){
      const nav=document.querySelector('.nav-bar');
      if(!nav)return null;
      let button=document.getElementById('fun-more-tab');
      if(!button){
        button=document.createElement('button');
        button.type='button';
        button.id='fun-more-tab';
        button.className='nt fun-more-tab';
        button.innerHTML='<span class="ni" aria-hidden="true">•••</span><span class="nl">More</span>';
        button.setAttribute('aria-haspopup','dialog');
        button.addEventListener('click',()=>this.openMore());
        nav.appendChild(button);
      }
      return button;
    },

    navigationNeedsSync(){
      const G=window.G,nav=document.querySelector('.nav-bar');
      if(!G||!nav)return false;
      const core=this.coreTabs(G),coreSet=new Set(core);
      for(const btn of nav.querySelectorAll('.nt[data-tab]')){
        const name=btn.dataset.tab,show=coreSet.has(name);
        const label=btn.querySelector('.nl'),icon=btn.querySelector('.ni');
        if(btn.hidden===show)return true;
        if(btn.classList.contains('fun-nav-hidden')===show)return true;
        if(label&&label.textContent!==this.tabLabel(name,G))return true;
        if(icon&&icon.textContent!==this.tabIcon(name))return true;
      }
      const more=document.getElementById('fun-more-tab');
      const shouldShowMore=this.optionalTabs(G).length>0;
      if(!more||more.hidden===shouldShowMore)return true;
      const visibleOrder=[...nav.querySelectorAll('.nt')].filter(btn=>!btn.hidden&&!btn.classList.contains('fun-nav-hidden')).map(btn=>btn.id==='fun-more-tab'?'more':btn.dataset.tab);
      const desired=core.filter(name=>nav.querySelector(`.nt[data-tab="${name}"]`)).concat(shouldShowMore?['more']:[]);
      return visibleOrder.join('|')!==desired.join('|');
    },

    watchNavigation(){ /* Navigation is synchronized by the UI and age-engine wrappers. */ },

    applyNavigation(){
      if(this._applyingNav)return;
      const G=window.G;
      if(!G)return;
      this._applyingNav=true;
      try{
        const core=this.coreTabs(G);
        const coreSet=new Set(core);
        const active=UI?._activeTab||'life';
        const optional=this.optionalTabs(G);
        document.querySelectorAll('.nav-bar .nt[data-tab]').forEach(btn=>{
          const name=btn.dataset.tab;
          const show=coreSet.has(name);
          if(btn.hidden===show)btn.hidden=!show;
          const wantedDisplay=show?'flex':'none';
          if(btn.style.getPropertyValue('display')!==wantedDisplay||btn.style.getPropertyPriority('display')!=='important')btn.style.setProperty('display',wantedDisplay,'important');
          btn.classList.toggle('fun-core-tab',show);
          btn.classList.toggle('fun-nav-hidden',!show);
          const label=btn.querySelector('.nl');
          const icon=btn.querySelector('.ni');
          const wantedLabel=this.tabLabel(name,G),wantedIcon=this.tabIcon(name);
          if(label&&label.textContent!==wantedLabel)label.textContent=wantedLabel;
          if(icon&&icon.textContent!==wantedIcon)icon.textContent=wantedIcon;
        });
        const more=this.ensureMoreButton();
        const nav=document.querySelector('.nav-bar');
        if(nav){
          const current=[...nav.querySelectorAll('.nt[data-tab]')].filter(btn=>coreSet.has(btn.dataset.tab)).map(btn=>btn.dataset.tab);
          if(current.join('|')!==core.join('|')){
            core.forEach(name=>{
              const btn=nav.querySelector(`.nt[data-tab="${name}"]`);
              if(btn&&btn.parentElement===nav)nav.appendChild(btn);
            });
          }
        }
        if(more){
          const showMore=optional.length>0;
          if(more.hidden===showMore)more.hidden=!showMore;
          const wantedDisplay=showMore?'flex':'none';
          if(more.style.getPropertyValue('display')!==wantedDisplay||more.style.getPropertyPriority('display')!=='important')more.style.setProperty('display',wantedDisplay,'important');
          more.classList.toggle('active',optional.includes(active));
          if(nav&&more.parentElement===nav&&nav.lastElementChild!==more)nav.appendChild(more);
        }
        document.body.dataset.funStage=this.stage(G).id;
        this.simplifyStats();
      }finally{
        this._applyingNav=false;
      }
      this.watchNavigation();
    },

    simplifyStats(){
      const keep=new Set(['hap','hlt','smt','str']);
      ['hap','hlt','smt','lks','fit','str','fam','kar','rep','mnd'].forEach(key=>{
        const desktop=document.getElementById('sv-'+key)?.closest('.ssb');
        const mobile=document.getElementById('sv-'+key+'-m')?.closest('.sb');
        if(desktop)desktop.classList.toggle('fun-hidden-stat',!keep.has(key));
        if(mobile)mobile.classList.toggle('fun-hidden-stat',!keep.has(key));
      });
      const age=Number(window.G?.age)||0;
      const labels={hap:'😊 Mood',hlt:'❤️ Health',smt:age<13?'🧠 Learning':'🧠 Smarts',str:age<13?'😟 Stress':'😌 Stress'};
      Object.entries(labels).forEach(([key,text])=>{const el=document.getElementById('sv-'+key)?.closest('.ssb')?.querySelector('.ssb-l');if(el)el.textContent=text;});
      const label=document.querySelector('.sidebar-stats-box .sidebar-card-head');
      if(label)label.textContent='Your wellbeing';
      const goals=document.getElementById('g-goals-widget');if(goals)goals.hidden=true;
      const goalsM=document.getElementById('g-goals-widget-m');if(goalsM)goalsM.hidden=true;
    },

    visibleLogs(G=window.G){
      const noise=/personal goals generated|local economy|future ambition will take shape|starting wealth|trait:|family has .* set aside|father: .*mother:|sibling:/i;
      return (Array.isArray(G?.log)?G.log:[]).filter(entry=>entry?.text&&!noise.test(entry.text)).slice(0,5);
    },

    relationPeople(G=window.G){
      const list=[];
      const add=(person,role)=>{if(person&&person.alive!==false&&!list.some(x=>x.person===person))list.push({person,role});};
      add(G?.rels?.mother,'Mother');add(G?.rels?.father,'Father');
      (G?.rels?.siblings||[]).forEach(p=>add(p,'Sibling'));
      add(G?.rels?.partner,'Partner');
      (G?.rels?.children||[]).forEach(p=>add(p,'Child'));
      (G?.rels?.friends||[]).forEach(p=>add(p,'Friend'));
      return list.slice(0,3).map(({person,role})=>({
        person,role,name:[person.name,person.surname].filter(Boolean).join(' ')||role,
        score:this.clamp(person.love??((person.trust||50)+(person.closeness||50))/2)
      }));
    },

    quickActions(G=window.G){
      const age=Number(G?.age)||0;
      if(age<=2)return[
        {id:'cuddle',icon:'🤗',title:'Family cuddle',sub:'Feel safe and loved.',kind:'youth',action:'cuddle'},
        {id:'story',icon:'📖',title:'Story time',sub:'Learn through imagination.',kind:'youth',action:'story'},
        {id:'nap',icon:'😴',title:'Good sleep',sub:'Rest and grow.',kind:'youth',action:'nap'},
        {id:'sensory',icon:'🧩',title:'Explore safely',sub:'Discover something new.',kind:'youth',action:'sensory'}
      ];
      if(age<=5)return[
        {id:'outside',icon:'🌳',title:'Play outside',sub:'Move and have fun.',kind:'youth',action:'outside'},
        {id:'draw',icon:'🎨',title:'Draw something',sub:'Use your imagination.',kind:'youth',action:'draw'},
        {id:'story',icon:'📖',title:'Story time',sub:'Learn new words.',kind:'youth',action:'story'},
        {id:'cuddle',icon:'🫶',title:'Family time',sub:'Build a warm bond.',kind:'youth',action:'cuddle'}
      ];
      if(age<=12)return[
        {id:'friends',icon:'🛝',title:'Play with friends',sub:'Make a good memory.',kind:'youth',action:'friends'},
        {id:'reading',icon:'📚',title:'Read a book',sub:'Grow your knowledge.',kind:'youth',action:'reading'},
        {id:'sport',icon:'⚽',title:'Play a sport',sub:'Build confidence and fitness.',kind:'youth',action:'sport'},
        {id:'creative',icon:'🎸',title:'Make something',sub:'Practice a creative hobby.',kind:'youth',action:'creative'}
      ];
      if(age<=17)return[
        {id:'friends',icon:'🫶',title:'Hang out',sub:'Spend time with friends.',kind:'youth',action:'friends'},
        {id:'homework',icon:'✏️',title:'Study a little',sub:'Improve school without overdoing it.',kind:'youth',action:'homework'},
        {id:'creative',icon:'🎵',title:'Practice a hobby',sub:'Build a skill you enjoy.',kind:'youth',action:'creative'},
        {id:'rest',icon:'🌙',title:'Take a real break',sub:'Lower pressure and recover.',kind:'youth',action:'rest'}
      ];
      const pool=[
        {id:'friends-adult',icon:'🫶',title:'Connect with people',sub:'Relationships matter more than perfect stats.',kind:'tab',action:'love'},
        {id:'meditate',icon:'🧘',title:'Clear your head',sub:'Lower stress for free.',kind:'engine',action:'meditate'},
        {id:'gym',icon:'🏃',title:'Move your body',sub:'Improve health and mood.',kind:'engine',action:age>=65?'mindful_walk':'run'},
        {id:'cook',icon:'🍳',title:'Cook something',sub:'A small healthy win.',kind:'engine',action:'cook'},
        {id:'career',icon:'💼',title:age>=65?'Review retirement':'Work on your future',sub:age>=65?'Check income and purpose.':'Study, work or change direction.',kind:'tab',action:'career'},
        {id:'sleep',icon:'😴',title:'Rest properly',sub:'Recover health and stress.',kind:'engine',action:'sleep'},
        {id:'reading',icon:'📚',title:'Read and learn',sub:'Grow without pressure.',kind:'engine',action:'reading'},
        {id:'money',icon:'💰',title:'Check your money',sub:'See what you actually own and owe.',kind:'tab',action:'assets'}
      ];
      const preferred=[];
      if((G?.stress||0)>60)preferred.push(pool.find(x=>x.id==='sleep'));
      if((G?.health||0)<50)preferred.push(pool.find(x=>x.id==='gym'));
      if(G?.career)preferred.push(pool.find(x=>x.id==='career'));
      preferred.push(pool.find(x=>x.id==='friends-adult'),pool.find(x=>x.id==='meditate'),pool.find(x=>x.id==='cook'),pool.find(x=>x.id==='money'));
      const unique=[];preferred.concat(pool).forEach(x=>{if(x&&!unique.some(y=>y.id===x.id))unique.push(x);});
      return unique.slice(0,4);
    },

    actionHTML(action){
      return `<button type="button" class="fun-action-card" data-fun-action="${this.esc(action.id)}" onclick="FunFirst.runQuick('${this.esc(action.id)}')">
        <span class="fun-action-icon" aria-hidden="true">${action.icon}</span>
        <span class="fun-action-copy"><b>${this.esc(action.title)}</b><small>${this.esc(action.sub)}</small></span>
        <span class="fun-action-go" aria-hidden="true">›</span>
      </button>`;
    },

    statHTML(icon,label,value,key){
      const n=this.clamp(value);
      const tone=n>=70?'good':n>=40?'okay':'bad';
      return `<div class="fun-stat ${tone}"><span>${icon}</span><div><small>${this.esc(label)}</small><b>${Math.round(n)}</b></div><i><em style="width:${n}%"></em></i></div>`;
    },

    renderLife(){
      const G=window.G,tab=document.getElementById('tab-life');
      if(!G||!tab)return;
      try{window.LifeSimV24?.ensure?.(G);}catch(_){ }
      const stage=this.stage(G),mood=this.mood(G),actions=this.quickActions(G),logs=this.visibleLogs(G),people=this.relationPeople(G);
      const renderKey=JSON.stringify([
        G.age,G.alive,G.happiness,G.health,G.stress,G.smarts,G.money,G.familySupport,G.schoolPerformance,
        G.ageActionTotal,G.career?.title||G.career?.name||'',UI?._activeTab,
        logs.map(x=>[x.age,x.text,x.type]),people.map(x=>[x.person?.id,x.name,x.score])
      ]);
      if(this._lastRenderKey===renderKey&&tab.children.length===1&&tab.firstElementChild?.classList.contains('fun-life')){
        this.applyNavigation();
        return;
      }
      this._lastRenderKey=renderKey;
      const remaining=Math.max(0,(window.AgeLogic?.actionLimit?.(G)||8)-(Number(G.ageActionTotal)||0));
      const moneyLabel=G.age<13?'Family fund':G.age<18?'Savings':'Cash';
      const moneyValue=G.age<13?(G.familySupport||0):(G.money||0);
      const school=G.age>=5&&G.age<18?Math.round(G.schoolPerformance||0):null;
      const career=G.age>=18?(G.career?.title||G.career?.name||'No career yet'):null;
      const yearHint=G.age<18?`${remaining} meaningful action${remaining===1?'':'s'} left this year`:'Do a few things, then move to the next year.';

      tab.innerHTML=`
        <div class="fun-life" data-age="${G.age}">
          <section class="fun-hero">
            <div class="fun-hero-main">
              <span class="fun-stage-icon" aria-hidden="true">${stage.icon}</span>
              <div><small>AGE ${G.age} · ${this.esc(stage.label)}</small><h2>${this.esc(stage.line)}</h2><p>${this.esc(yearHint)}</p></div>
            </div>
            <div class="fun-mood ${mood.tone}"><span>${mood.icon}</span><small>Mood</small><b>${mood.label}</b></div>
          </section>

          <section class="fun-overview" aria-label="Life overview">
            ${this.statHTML('😊','Happiness',G.happiness,'happiness')}
            ${this.statHTML('❤️','Health',G.health,'health')}
            ${this.statHTML('😌','Calm',100-(G.stress||0),'stress')}
            <div class="fun-money"><span>💰</span><div><small>${moneyLabel}</small><b>${this.esc(this.fmtMoney(moneyValue))}</b></div></div>
          </section>

          <section class="fun-section fun-choices">
            <div class="fun-section-head"><div><small>DO SOMETHING</small><h3>What sounds good this year?</h3></div><button type="button" class="fun-random-btn" onclick="FunFirst.surprise()">🎲 Surprise me</button></div>
            <div class="fun-actions">${actions.map(a=>this.actionHTML(a)).join('')}</div>
          </section>

          <div class="fun-two-col">
            <section class="fun-section fun-story-card">
              <div class="fun-section-head"><div><small>YOUR STORY</small><h3>Recent moments</h3></div></div>
              <div class="fun-moments">${logs.length?logs.map(entry=>`<article class="fun-moment ${this.esc(entry.type||'neutral')}"><span>${this.logIcon(entry)}</span><div><b>Age ${entry.age??G.age}</b><p>${this.esc(this.cleanLog(entry.text))}</p></div></article>`).join(''):'<div class="fun-empty">Your first memories will appear here.</div>'}</div>
            </section>

            <section class="fun-section fun-people-card">
              <div class="fun-section-head"><div><small>PEOPLE</small><h3>Who matters right now</h3></div><button type="button" class="fun-text-btn" onclick="UI.tab('love')">Open</button></div>
              <div class="fun-people">${people.length?people.map(p=>`<button type="button" onclick="UI.tab('love')"><span>${this.personIcon(p.role)}</span><div><b>${this.esc(p.name)}</b><small>${this.esc(p.role)} · ${Math.round(p.score)}%</small></div><i><em style="width:${p.score}%"></em></i></button>`).join(''):'<div class="fun-empty">New people will enter your story over time.</div>'}</div>
              ${school!==null?`<div class="fun-context-line"><span>🎒 School</span><b>${school}%</b></div>`:''}
              ${career!==null?`<div class="fun-context-line"><span>💼 Current path</span><b>${this.esc(career)}</b></div>`:''}
            </section>
          </div>

          <section class="fun-next-year">
            <div><small>READY?</small><h3>Move on when this year feels complete.</h3><p>You never need to finish every stat, goal or menu.</p></div>
            <button type="button" onclick="FunFirst.ageUp()">Age Up <span>Year +1</span></button>
          </section>
        </div>`;
      this.applyNavigation();
    },

    cleanLog(text){
      return String(text||'').replace(/^\p{Extended_Pictographic}+(?:\uFE0F)?\s*/u,'').replace(/\s+/g,' ').trim();
    },

    logIcon(entry){
      const text=String(entry?.text||'').toLowerCase();
      if(/born|birthday|age up/.test(text))return'🎂';
      if(/friend|mother|father|family|partner|love/.test(text))return'🫶';
      if(/money|salary|income|paid|fund/.test(text))return'💰';
      if(/health|doctor|sleep|gym|run|stress/.test(text))return'❤️';
      if(/school|study|book|skill|learn/.test(text))return'📚';
      if(entry?.type==='bad')return'⚠️';
      if(entry?.type==='good')return'✨';
      return'•';
    },

    personIcon(role){
      return /mother|father|parent/i.test(role)?'🫶':/partner/i.test(role)?'❤️':/child/i.test(role)?'🌱':/sibling/i.test(role)?'🧩':'🙂';
    },

    runQuick(id){
      const action=this.quickActions(window.G).find(item=>item.id===id);
      if(!action)return;
      try{
        if(action.kind==='youth')window.AgeLogic?.youthAction?.(action.action);
        else if(action.kind==='engine')window.Engine?.act?.(action.action);
        else if(action.kind==='tab')window.UI?.tab?.(action.action);
      }catch(err){
        console.error('Quick action failed',err);
        UI?.toast?.('That action could not run. Try another one.','bad');
      }
      setTimeout(()=>this.renderIfLife(),0);
    },

    surprise(){
      const actions=this.quickActions(window.G).filter(a=>a.kind!=='tab');
      if(!actions.length)return UI?.toast?.('Pick any section and try something new.','neutral');
      const choice=actions[Math.floor(Math.random()*actions.length)];
      UI?.toast?.(`${choice.icon} ${choice.title}`,'neutral');
      this.runQuick(choice.id);
    },

    ageUp(){
      if(!window.G?.alive||window.Engine?._aging)return;
      try{window.Engine?.ageUp?.();}
      catch(err){console.error('Age Up failed',err);UI?.toast?.('The year could not advance. Please save and reload.','bad');}
    },

    openMore(){
      this.ensureMoreModal();
      this.renderMoreModal();
      UI?.openModal?.(document.getElementById('fun-more-modal'));
    },

    ensureMoreModal(){
      if(document.getElementById('fun-more-modal'))return;
      const modal=document.createElement('div');
      modal.id='fun-more-modal';
      modal.className='modal-bg fun-more-modal';
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      modal.setAttribute('aria-labelledby','fun-more-title');
      modal.tabIndex=-1;
      modal.addEventListener('click',event=>{if(event.target===modal)UI?.closeAnyModal?.(modal);});
      modal.innerHTML=`<div class="modal-box fun-more-box"><header><div><small>OPTIONAL</small><h2 id="fun-more-title">More ways to live</h2><p>These systems are here when you want them. You can ignore them completely.</p></div><button type="button" aria-label="Close" onclick="UI.closeAnyModal(document.getElementById('fun-more-modal'))">✕</button></header><div id="fun-more-grid" class="fun-more-grid"></div></div>`;
      document.body.appendChild(modal);
    },

    renderMoreModal(){
      const grid=document.getElementById('fun-more-grid');
      if(!grid)return;
      const items=this.optionalTabs(window.G);
      grid.innerHTML=items.length?items.map(name=>`<button type="button" onclick="FunFirst.openOptional('${name}')"><span>${this.tabIcon(name)}</span><div><b>${this.esc(this.tabLabel(name,window.G))}</b><small>${this.moreDescription(name)}</small></div><i>›</i></button>`).join(''):'<div class="fun-empty">More systems unlock naturally as you grow.</div>';
    },

    moreDescription(name){
      return({goals:'Optional personal goals',skills:'Learn and improve talents',pets:'Adopt and care for animals',social:'Create and grow an audience',hustle:'Try smaller ways to earn',business:'Build a company',stocks:'Invest money with risk',crime:'Risky choices and consequences'}[name]||'Optional life system');
    },

    openOptional(name){
      UI?.closeAnyModal?.(document.getElementById('fun-more-modal'));
      UI?.tab?.(name);
      this.injectOptionalHeader(name);
      this.applyNavigation();
    },

    injectOptionalHeader(name){
      const panel=document.getElementById('tab-'+name);
      if(!panel)return;
      panel.querySelector('.fun-optional-head')?.remove();
      const head=document.createElement('section');
      head.className='fun-optional-head';
      head.innerHTML=`<button type="button" onclick="UI.tab('life')">← Back to Life</button><div><small>OPTIONAL SYSTEM</small><h2>${this.tabIcon(name)} ${this.esc(this.tabLabel(name,window.G))}</h2></div><button type="button" onclick="FunFirst.openMore()">More</button>`;
      panel.insertAdjacentElement('afterbegin',head);
    },

    simplifySettings(){
      const hideIds=['set-highlight','set-chapters','set-advanced','set-autoage','set-online-extras','set-log-detail','set-compact','set-sidebar'];
      hideIds.forEach(id=>{
        const el=document.getElementById(id);
        const row=el?.closest('.settings-option,.settings-option-range,.settings-note');
        if(row)row.classList.add('fun-setting-hidden');
      });
      const navText={gameplay:['Game','Simple feedback and saves'],appearance:['Look','Theme and comfort'],audio:['Sound','Effects and volume'],ai:['Local AI','Optional Ollama stories'],data:['Save','Backup and recovery']};
      document.querySelectorAll('[data-settings-tab]').forEach(btn=>{
        const copy=navText[btn.dataset.settingsTab];if(!copy)return;
        const b=btn.querySelector('b'),small=btn.querySelector('small');if(b)b.textContent=copy[0];if(small)small.textContent=copy[1];
      });
      const gameplay=document.querySelector('[data-settings-panel="gameplay"] .settings-panel-head');
      if(gameplay){const h=gameplay.querySelector('h3'),p=gameplay.querySelector('p');if(h)h.textContent='Keep the game easy to enjoy';if(p)p.textContent='Only the useful controls are shown. The simulation stays deep without making you manage everything.';}
      const appearance=document.querySelector('[data-settings-panel="appearance"] .settings-panel-head');
      if(appearance){const h=appearance.querySelector('h3'),p=appearance.querySelector('p');if(h)h.textContent='Make LifeSim comfortable';if(p)p.textContent='Change the look without changing game balance.';}
      const settingsBody=document.querySelector('#settings-modal .settings-content');
      if(settingsBody&&!settingsBody.querySelector('.fun-settings-tip')){
        const tip=document.createElement('div');tip.className='fun-settings-tip';tip.innerHTML='<span>✨</span><div><b>Fun-first defaults are active</b><small>Advanced stats, automatic aging and extra panels are hidden so the game stays clear.</small></div>';
        settingsBody.insertAdjacentElement('afterbegin',tip);
      }
    },

    applyShell(){
      const app=document.getElementById('app');if(app){app.dataset.version=this.VERSION;app.dataset.build=this.BUILD;}
      document.title='LifeSim v24.2.1: Fun First';
      if(window.App)App.VERSION='24.2.1';if(window.UI)UI.VERSION='24.2.1';if(window.Engine)Engine.VERSION='24.2.1';if(window.Save)Save.VERSION='24.2.1';
      document.documentElement.dataset.lifesimVersion='24.2.1';
      document.querySelector('.splash-build span:last-child')?.replaceChildren(document.createTextNode('LifeSim v24.2.1 · Fun First'));
      const sideAge=document.getElementById('age-btn-side');if(sideAge){sideAge.innerHTML='⏩ Age Up <small>Year +1</small>';sideAge.onclick=()=>this.ageUp();}
      const mobileAge=document.getElementById('age-btn');if(mobileAge){mobileAge.innerHTML='⏩ Age Up <span>Year +1</span>';mobileAge.onclick=()=>this.ageUp();}
      this.simplifySettings();
    },

    renderIfLife(){
      if(UI?._activeTab==='life'&&document.getElementById('game-screen')?.classList.contains('active'))this.renderLife();
      else this.applyNavigation();
    },

    patch(){
      if(this._patched)return;
      this._patched=true;
      const self=this;

      if(window.LifeSimV22?.FX){
        LifeSimV22.FX.confetti=function(){};
        LifeSimV22.FX.hearts=function(){};
        LifeSimV22.FX.achievement=function(){};
        document.querySelectorAll('.v22-confetti,.v22-heart-burst,.v22-ach-pop,.legacy-ui-ach-pop').forEach(el=>el.remove());
      }

      if(window.LifeSimV24){
        LifeSimV24.renderDashboard=function(){self.renderLife();};
        LifeSimV24.renderEnhancements=function(){self.renderIfLife();};
        LifeSimV24.scheduleFinalize=function(before){
          clearTimeout(this._finalizeTimer);
          const token=(this._finalizeToken||0)+1;
          this._finalizeToken=token;
          const finish=()=>{
            if(this._finalizeToken!==token)return;
            const G=window.G;
            if(!G)return;
            if(G.age===before.age||window.Engine?._aging){
              this._finalizeTimer=setTimeout(finish,150);
              return;
            }
            this._finalizeTimer=null;
            try{this.finalizeYear(G,before);}catch(err){console.warn('Year summary skipped:',err);}
          };
          this._finalizeTimer=setTimeout(finish,100);
        };
      }

      /* Fun First uses one clear, age-appropriate event per year. The older
         stacked world/story queue was a major source of modal chains and
         fragile age-up states. Deeper systems still progress in the engine. */
      if(window.Engine){
        Engine._queueEvents=function(queue){
          const G=window.G;
          if(!G||G.inPrison||typeof EVENTS==='undefined'||!Array.isArray(queue))return;
          const raw=G.age<=4?(EVENTS.earlyChildhood||EVENTS.childhood):G.age<=12?EVENTS.childhood:G.age<=17?EVENTS.teen:G.age<=59?EVENTS.adult:EVENTS.elder;
          const pool=Array.isArray(raw)?raw.filter(evt=>this._eventEligible?.(evt,G)!==false):[];
          if(!pool.length)return;
          const evt=this._pickFreshEvent?.(pool,queue)||pool[Math.floor(Math.random()*pool.length)];
          if(evt){queue.push(evt);this._rememberLifeEvent?.(evt);}
        };
      }

      if(window.UI){
        UI.showEvent=function(evt,cb){
          const icon=document.getElementById('m-ico'),title=document.getElementById('m-title'),text=document.getElementById('m-text');
          const choices=document.getElementById('m-choices'),modal=document.getElementById('ev-modal');
          if(!choices||!modal){if(cb)cb();return;}
          modal.classList.remove('legacy-ui-decision-modal','legacy-ui-decision-2','v23-cinematic');
          modal.classList.add('fun-event-modal');
          modal.querySelectorAll('.v23-choice-hint').forEach(el=>el.remove());
          if(icon)icon.textContent=evt?.icon||'✨';
          if(title)title.textContent=evt?.title||'A moment in your life';
          if(text)text.textContent=evt?.text||'What will you do?';
          choices.innerHTML='';
          const list=Array.isArray(evt?.choices)&&evt.choices.length?evt.choices:[{t:'Continue',e:{}}];
          list.slice(0,3).forEach((choice,index)=>{
            const button=document.createElement('button');
            button.type='button';
            button.className='choice-btn fun-choice-btn'+(choice.danger?' danger':'');
            const label=choice.label||choice.t||'Continue';
            const sub=choice.sub&&choice.sub!=='Choose this path'?choice.sub:self.eventHint(choice.e||{});
            button.innerHTML=`<span class="fun-choice-index">${index+1}</span><span class="fun-choice-copy"><b>${self.esc(label)}</b>${sub?`<small>${self.esc(sub)}</small>`:''}</span><span class="fun-choice-arrow">›</span>`;
            button.onclick=()=>{
              try{
                if(typeof choice.fn==='function')choice.fn();
                else if(typeof applyStats==='function')applyStats(window.G,choice.e||{});
                if((choice.longTerm||choice.long)&&window.CoreSystems?.addLongEffect)CoreSystems.addLongEffect(choice.longTerm||choice.long);
                window.Engine?.log?.(`${evt?.icon||'•'} ${evt?.title||'Life event'} — ${label}`,evt?.type||'neutral');
              }catch(err){console.warn('Event choice failed:',err);}
              try{UI.closeAnyModal(modal);}catch(err){console.warn('Event modal close failed:',err);}
              try{UI.update();}catch(err){console.warn('Event refresh failed:',err);}
              if(cb)cb();
            };
            choices.appendChild(button);
          });
          UI.openModal(modal);
        };
        UI.achievementPopup=function(achievement){
          if(!achievement)return;
          UI.toast(`🏆 ${achievement.name||'Achievement unlocked'}`,'ach',3200);
        };

        const oldUpdate=UI.update;
        UI.update=function(...args){const out=oldUpdate.apply(this,args);setTimeout(()=>self.renderIfLife(),0);return out;};
        const oldTab=UI.tab;
        UI.tab=function(name,...args){const out=oldTab.call(this,name,...args);setTimeout(()=>{if(name==='life')self.renderLife();else{self.injectOptionalHeader(name);self.applyNavigation();}},0);return out;};
        const oldOpenSettings=UI.openSettings;
        UI.openSettings=function(...args){self.simplifySettings();const out=oldOpenSettings.apply(this,args);setTimeout(()=>self.simplifySettings(),0);return out;};
      }

      if(window.AgeLogic?.applyNavigation){
        const old=AgeLogic.applyNavigation;
        AgeLogic.applyNavigation=function(...args){const out=old.apply(this,args);setTimeout(()=>self.applyNavigation(),0);return out;};
      }

      this.applyShell();
      this.applyNavigation();
      setTimeout(()=>this.renderIfLife(),30);
      setTimeout(()=>{this.applyShell();this.renderIfLife();},250);
      setTimeout(()=>{this.applyShell();this.renderIfLife();},520);
      setTimeout(()=>{this.applyShell();this.renderIfLife();},1250);
    }
  };

  window.FunFirst=FunFirst;
  document.addEventListener('DOMContentLoaded',()=>FunFirst.patch());
  window.addEventListener('load',()=>{FunFirst.patch();setTimeout(()=>FunFirst.renderIfLife(),100);});
})();
