/* js/ui.js — LifeSim v9 */
const UI={
  _activeTab:'life',

  tab(name){
    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.nt').forEach(t=>t.classList.remove('active'));
    const p=document.getElementById('tab-'+name);
    const b=document.querySelector(`[data-tab="${name}"]`);
    if(p)p.classList.add('active');
    if(b)b.classList.add('active');
    this._activeTab=name;
    if(name==='life')    this.renderLog();
    if(name==='mind')    this.renderMind();
    if(name==='love')    Relations.render();
    if(name==='career')  Career.render();
    if(name==='assets')  Assets.render();
    if(name==='health')  Health.render();
    if(name==='crime')   Crime.render();
    if(name==='social')  Social.render();
    if(name==='business')Business.render();
    if(name==='pets')    Pets.render();
    if(name==='skills')  Skills.render();
    if(name==='stocks')  Stocks.render();
    if(name==='goals')   Goals.render();
  },

  refreshActiveTab(){
    const t=this._activeTab||'life';
    if(t==='life')    this.renderLog();
    if(t==='mind')    this.renderMind();
    if(t==='love')    Relations.render();
    if(t==='career')  Career.render();
    if(t==='assets')  Assets.render();
    if(t==='health')  Health.render();
    if(t==='crime')   Crime.render();
    if(t==='social')  Social.render();
    if(t==='business')Business.render();
    if(t==='pets')    Pets.render();
    if(t==='skills')  Skills.render();
    if(t==='stocks')  Stocks.render();
    if(t==='goals')   Goals.render();
  },

  /* Detect if we're in desktop mode */
  isDesktop(){return window.innerWidth>=900;},

  update(){
    const G=window.G; if(!G||!G.name)return;
    const desktop=this.isDesktop();

    /* Avatar */
    const av=G.age<2?'👶':G.age<5?'🍼':G.age<13?(G.gender==='female'?'👧':'🧒'):
             G.age<18?(G.gender==='female'?'👧':'👦'):G.age<40?(G.gender==='female'?'👩':'🧑'):
             G.age<65?(G.gender==='female'?'👩':'🧔'):(G.gender==='female'?'👵':'👴');

    // Desktop sidebar IDs
    const sAvEl=document.getElementById('g-avatar');
    if(sAvEl&&sAvEl.textContent!==av){sAvEl.textContent=av;sAvEl.style.animation='avatarPop .35s ease';setTimeout(()=>{if(sAvEl)sAvEl.style.animation='';},400);}
    const sName=document.getElementById('g-name');if(sName)sName.textContent=`${G.name} ${G.surname}`;
    const sInfo=document.getElementById('g-info');
    const stage=G.age<2?'Baby':G.age<5?'Toddler':G.age<13?'Child':G.age<18?'Teenager':
                G.inUniversity?`Uni Year ${G.univYear}`:G.retired?'Retired 🏖️':
                G.career?G.career.title:G.age<65?'Adult':'Senior';
    if(sInfo)sInfo.textContent=`Age ${G.age} · ${G.country.flag} ${stage}`;

    // Mobile header IDs
    const mAvEl=document.getElementById('g-avatar-m');
    if(mAvEl&&mAvEl.textContent!==av){mAvEl.textContent=av;mAvEl.style.animation='avatarPop .35s ease';setTimeout(()=>{if(mAvEl)mAvEl.style.animation='';},400);}
    const mName=document.getElementById('g-name-m');if(mName)mName.textContent=`${G.name} ${G.surname}`;
    const mInfo=document.getElementById('g-info-m');if(mInfo)mInfo.textContent=`Age ${G.age} · ${G.country.flag} ${stage}`;

    /* Money — update both sidebar and mobile */
    const nw=netWorth(G);
    const monEl=document.getElementById('g-money');if(monEl)monEl.textContent=fmtFull(nw);
    const monElM=document.getElementById('g-money-m');if(monElM)monElM.textContent=fmtFull(nw);
    const cashEl=document.getElementById('g-cash');if(cashEl)cashEl.textContent=`Cash: ${fmt(G.money)}`;
    const cashElM=document.getElementById('g-cash-m');if(cashElM)cashElM.textContent=`Cash: ${fmt(G.money)}`;

    /* Annual income */
    let inc=0;
    if(G.career)inc+=sc(G.career.salary);
    if(G.retired)inc+=sc(G.retirementPension||0);
    (G.assets?.properties||[]).forEach(p=>{if(p.rent>0)inc+=sc(p.rent);});
    if(G.business?.revenue>0)inc+=sc(G.business.revenue-G.business.expenses);
    if((G.followers||0)>0)inc+=Math.floor(G.followers*0.01);
    const incTxt=inc>0?`+${fmt(inc)}/yr`:'';
    const incEl=document.getElementById('g-income');if(incEl)incEl.textContent=incTxt;
    const incElM=document.getElementById('g-income-m');if(incElM)incElM.textContent=incTxt;

    /* Stats — render both sidebar and mobile bars */
    const stats=[
      {k:'hap',v:G.happiness,c:'var(--yellow)'},
      {k:'hlt',v:G.health,c:'var(--green)'},
      {k:'smt',v:G.smarts,c:'var(--cyan)'},
      {k:'lks',v:G.looks,c:'var(--pink)'},
      {k:'fit',v:G.fitness||50,c:'var(--orange)'},
      {k:'str',v:G.stress||0,c:null}, // stress: special
      {k:'fam',v:G.fame||0,c:'var(--accent)'},
      {k:'kar',v:null,c:null}, // karma: special
    ];

    const stress=G.stress||0;
    const stressC=stress>70?'var(--red)':stress>40?'var(--orange)':'var(--teal)';
    const karma=G.karma||0;
    const kpct=Math.max(0,Math.min(100,(karma+100)/2));
    const karmaC=karma>20?'var(--green)':karma<-20?'var(--red)':'var(--teal)';

    // Helper to update a stat bar pair (sidebar + mobile)
    const updateStat=(k,val,fill,valC)=>{
      // Sidebar (ssb elements)
      const sf=document.getElementById('sf-'+k);
      const sv=document.getElementById('sv-'+k);
      if(sf){sf.style.width=Math.max(0,Math.min(100,fill))+'%';sf.style.background=valC;}
      if(sv){const next=String(Math.round(val));if(sv.textContent!==next){sv.classList.remove('stat-pop');void sv.offsetWidth;sv.classList.add('stat-pop');}sv.textContent=next;sv.style.color=valC;}
      // Mobile (sb elements)
      const sfm=document.getElementById('sf-'+k+'-m');
      const svm=document.getElementById('sv-'+k+'-m');
      if(sfm){sfm.style.width=Math.max(0,Math.min(100,fill))+'%';sfm.style.background=valC;}
      if(svm){const next=String(Math.round(val));if(svm.textContent!==next){svm.classList.remove('stat-pop');void svm.offsetWidth;svm.classList.add('stat-pop');}svm.textContent=next;svm.style.color=valC;}
    };

    updateStat('hap',G.happiness,G.happiness,'var(--yellow)');
    updateStat('hlt',G.health,G.health,'var(--green)');
    updateStat('smt',G.smarts,G.smarts,'var(--cyan)');
    updateStat('lks',G.looks,G.looks,'var(--pink)');
    updateStat('fit',G.fitness||50,G.fitness||50,'var(--orange)');
    updateStat('str',stress,stress,stressC);
    updateStat('fam',G.fame||0,G.fame||0,'var(--accent)');
    updateStat('kar',Math.round(karma),kpct,karmaC);
    // Restore +/- sign on karma labels (Math.round strips the '+')
    const karmaText=(karma>0?'+':'')+Math.round(karma);
    ['sv-kar','sv-kar-m'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=karmaText;});

    /* Tags — both sidebar and mobile */
    const tags=[];
    if(G.trait){const td=PERSONALITY_TRAITS&&PERSONALITY_TRAITS.find(t=>t.id===G.trait);if(td)tags.push(`<span class="badge badge-a">${td.icon} ${td.name}</span>`);}
    if(G.career)tags.push(`<span class="badge badge-a">${G.career.title}</span>`);
    if(G.retired)tags.push(`<span class="badge badge-g">🏖️ Retired</span>`);
    if(G.rels.partner?.married)tags.push(`<span class="badge badge-p">💍 Married</span>`);
    if((G.rels.children||[]).length)tags.push(`<span class="badge">${G.rels.children.length} kid${G.rels.children.length!==1?'s':''}</span>`);
    if(G.inPrison)tags.push(`<span class="badge badge-r">🔒 Prison</span>`);
    if(G.business)tags.push(`<span class="badge badge-g">🏢 ${G.business.name.split(' ')[0]}</span>`);
    if((G.followers||0)>=10000)tags.push(`<span class="badge badge-a">⭐ ${fmtFollowers(G.followers)}</span>`);
    if(stress>80)tags.push(`<span class="badge badge-r">😤 Burnout</span>`);
    else if(stress>55)tags.push(`<span class="badge badge-y">😰 Stressed</span>`);
    if(karma>=40)tags.push(`<span class="badge badge-g">😇 +Karma</span>`);
    else if(karma<=-30)tags.push(`<span class="badge badge-r">😈 −Karma</span>`);
    if(G.addictions?.smoking)tags.push(`<span class="badge badge-o">🚬 Addicted</span>`);
    if((G.pets||[]).filter(p=>p.alive).length>0)tags.push(`<span class="badge">🐾 ${G.pets.filter(p=>p.alive).length}</span>`);
    const tagsHtml=tags.join('');
    const tagsEl=document.getElementById('g-tags');if(tagsEl)tagsEl.innerHTML=tagsHtml;
    const tagsElM=document.getElementById('g-tags-m');if(tagsElM)tagsElM.innerHTML=tagsHtml;

    /* Net worth milestone */
    this.milestoneCheck(G);
    this.renderLog();
  },

  renderLog(){
    const G=window.G; if(!G)return;
    const el=document.getElementById('tab-life');
    if(!el||!el.classList.contains('active'))return;
    const storyReady=typeof StoryEvents!=='undefined'&&StoryEvents.canUse();
    const storyWait=typeof StoryEvents!=='undefined'?StoryEvents.yearsUntil():3;
    const spBadge=(G.skillPoints||0)>0?`<span class="badge badge-a" style="margin-left:6px">🎓 ${G.skillPoints} Skill Pt${G.skillPoints!==1?'s':''}</span>`:'';
    el.innerHTML=`
    <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center">
      <button type="button" class="btn-primary" style="flex:1;font-size:13px;padding:10px 0;background:${storyReady?'linear-gradient(135deg,#7c6fff,#a855f7)':'rgba(124,111,255,.2)'};opacity:${storyReady?1:.55}" onclick="StoryEvents.generate()" ${storyReady?'':'disabled'}>
        ✨ Story Moment ${storyReady?'':'('+storyWait+'yr)'}
      </button>
      <div style="font-size:12px;color:var(--muted);text-align:right;flex-shrink:0">
        Age ${G.age}${spBadge}
      </div>
    </div>
    ${typeof LifeProgress!=='undefined'?LifeProgress.renderPanel(G):''}
    <div class="log-list">` +
      (G.log||[]).slice(0,150).map(e=>{
        const col=e.type==='good'?'var(--green)':e.type==='bad'?'var(--red)':e.type==='special'?'var(--accent)':e.type==='money'?'var(--yellow)':'var(--muted)';
        return`<div class="log-entry ${e.type||'neutral'}"><div class="log-age" style="color:${col}">Age ${e.age}</div><div class="log-txt">${e.text}</div></div>`;
      }).join('')+
    '</div>';
  },

  renderMind(){
    const G=window.G;
    let addWarn='';
    if(G?.addictions?.smoking)addWarn+=`<div class="addiction-warn"><div class="aw-ico">🚬</div><div class="aw-txt"><strong>Nicotine Addiction</strong><br>You crave cigarettes daily. Quit in the Health tab.</div></div>`;
    if(G?.addictions?.alcohol)addWarn+=`<div class="addiction-warn"><div class="aw-ico">🍺</div><div class="aw-txt"><strong>Alcohol Dependency</strong><br>Your body relies on alcohol. Seek help in the Health tab.</div></div>`;
    document.getElementById('tab-mind').innerHTML=addWarn+`
    <div class="sec">🧠 Mental Development</div>
    <div class="act-grid">
      <div class="card" onclick="Engine.act('study')"><span class="ci">📚</span><span class="cn">Study Hard</span><span class="cd">+Smarts +Stress</span></div>
      <div class="card" onclick="Engine.act('library')"><span class="ci">📖</span><span class="cn">Library</span><span class="cd">+Smarts +Hap −Stress</span></div>
      <div class="card" onclick="Engine.act('meditate')"><span class="ci">🧘</span><span class="cn">Meditate</span><span class="cd">+Hap +Health −Stress</span></div>
      <div class="card" onclick="Engine.act('therapy')"><span class="ci">🛋️</span><span class="cn">Therapy</span><span class="cd">+Hap −Stress (${fmt(sc(150))})</span></div>
    </div>
    <div class="sec">💪 Physical Training</div>
    <div class="act-grid">
      <div class="card" onclick="Engine.act('gym')"><span class="ci">🏋️</span><span class="cn">Gym Workout</span><span class="cd">+Health +Fitness +Looks</span></div>
      <div class="card" onclick="Engine.act('run')"><span class="ci">🏃</span><span class="cn">Go Running</span><span class="cd">+Health +Fitness −Stress</span></div>
      <div class="card" onclick="Engine.act('swim')"><span class="ci">🏊</span><span class="cn">Swimming</span><span class="cd">+Health +Fit (${fmt(sc(30))})</span></div>
      <div class="card" onclick="Engine.act('yoga')"><span class="ci">🧘‍♀️</span><span class="cn">Yoga</span><span class="cd">+Health +Hap −Stress</span></div>
    </div>
    <div class="act-grid" style="margin-top:8px">
      <div class="card" onclick="Engine.act('hike')"><span class="ci">🥾</span><span class="cn">Hiking</span><span class="cd">+Health +Fit +Hap −Stress</span></div>
      <div class="card" onclick="Engine.act('sports')"><span class="ci">⚽</span><span class="cn">Play Sport</span><span class="cd">+Health +Fit +Hap</span></div>
      <div class="card" onclick="Engine.act('boxing')"><span class="ci">🥊</span><span class="cn">Boxing</span><span class="cd">+Fitness −Stress (${fmt(sc(60))})</span></div>
      <div class="card" onclick="Engine.act('sleep')"><span class="ci">😴</span><span class="cn">Rest Day</span><span class="cd">+Health +Hap −Stress</span></div>
    </div>
    <div class="sec">💅 Appearance & Style</div>
    <div class="act-grid">
      <div class="card" onclick="Engine.act('salon')"><span class="ci">💇</span><span class="cn">Hair Salon</span><span class="cd">+Looks (${fmt(sc(90))})</span></div>
      <div class="card" onclick="Engine.act('spa')"><span class="ci">🧖</span><span class="cn">Luxury Spa</span><span class="cd">+Looks +Hap −Stress (${fmt(sc(180))})</span></div>
      <div class="card" onclick="Engine.act('dentist')"><span class="ci">🦷</span><span class="cn">Dentist</span><span class="cd">+Looks +Health (${fmt(sc(130))})</span></div>
      <div class="card" onclick="Engine.act('personal_shop')"><span class="ci">🛍️</span><span class="cn">New Wardrobe</span><span class="cd">+Looks (${fmt(sc(400))})</span></div>
    </div>
    <div class="sec">🎭 Recreation & Hobbies</div>
    <div class="act-grid">
      <div class="card" onclick="Engine.act('movie')"><span class="ci">🎬</span><span class="cn">Cinema Night</span><span class="cd">+Happiness −Stress</span></div>
      <div class="card" onclick="Engine.act('travel')"><span class="ci">✈️</span><span class="cn">Short Holiday</span><span class="cd">+Hap −Stress (${fmt(sc(700))})</span></div>
      <div class="card" onclick="Engine.act('concert')"><span class="ci">🎵</span><span class="cn">Live Concert</span><span class="cd">+Hap +Fame (${fmt(sc(120))})</span></div>
      <div class="card" onclick="Engine.act('cook')"><span class="ci">👨‍🍳</span><span class="cn">Cook at Home</span><span class="cd">+Hap +Health</span></div>
    </div>
    <div class="act-grid" style="margin-top:8px">
      <div class="card" onclick="Engine.act('volunteer')"><span class="ci">🤲</span><span class="cn">Volunteer</span><span class="cd">+Hap +Karma +Fame</span></div>
      <div class="card" onclick="Engine.act('gaming')"><span class="ci">🎮</span><span class="cn">Play Games</span><span class="cd">+Hap −Stress −Smart</span></div>
      <div class="card" onclick="Engine.act('reading')"><span class="ci">📰</span><span class="cn">Read Books</span><span class="cd">+Smarts +Hap −Stress</span></div>
      <div class="card" onclick="Engine.act('museum')"><span class="ci">🏛️</span><span class="cn">Museum</span><span class="cd">+Smarts +Hap (${fmt(sc(20))})</span></div>
    </div>
    <div class="sec">🎨 Creative & Mindful</div>
    <div class="act-grid">
      <div class="card" onclick="Engine.act('journal')"><span class="ci">📓</span><span class="cn">Journalling</span><span class="cd">+Hap −Stress +Smart</span></div>
      <div class="card" onclick="Engine.act('music_play')"><span class="ci">🎸</span><span class="cn">Play Music</span><span class="cd">+Hap −Stress +Smart</span></div>
      <div class="card" onclick="Engine.act('paint')"><span class="ci">🎨</span><span class="cn">Paint</span><span class="cd">+Hap −Stress +Looks</span></div>
      <div class="card" onclick="Engine.act('nature')"><span class="ci">🌿</span><span class="cn">Nature Walk</span><span class="cd">+Hap +Health −Stress</span></div>
    </div>
    <div class="sec">🍸 Vices & Risk</div>
    <div class="act-grid">
      <div class="card" onclick="Engine.act('bar')"><span class="ci">🍸</span><span class="cn">Night Out</span><span class="cd">+Hap −Health (addiction risk)</span></div>
      <div class="card" onclick="Engine.act('gamble')"><span class="ci">🎰</span><span class="cn">Casino</span><span class="cd">±Money (luck-based)</span></div>
      <div class="card" onclick="Engine.act('smoke')"><span class="ci">🚬</span><span class="cn">Smoke</span><span class="cd">−Health (addiction risk!)</span></div>
      <div class="card danger" onclick="Engine.act('drugs')"><span class="ci">💊</span><span class="cn">Hard Drugs</span><span class="cd">−−Health, fatal risk!</span></div>
    </div>`;
  },

  showEvent(evt,cb){
    document.getElementById('m-ico').textContent=evt.icon||'✨';
    document.getElementById('m-title').textContent=evt.title||'Event';
    document.getElementById('m-text').textContent=evt.text||'';
    const ch=document.getElementById('m-choices');
    ch.innerHTML='';
    (evt.choices||[]).forEach(c=>{
      const btn=document.createElement('button');
      btn.className='choice-btn';
      if(c.label){
        btn.innerHTML=`<span class="choice-label">${c.label}</span><span class="choice-sub">${c.sub||''}</span>`;
      } else {
        btn.textContent=c.t||'Continue';
      }
      btn.onclick=()=>{
        try{
          applyStats(window.G,c.e||{});
          Engine.log(`${evt.icon||'•'} ${evt.title} — ${c.t||c.label||''}`,evt.type||'neutral');
        }catch(err){console.warn('Event effect error:',err);}
        document.getElementById('ev-modal').classList.remove('open');
        UI.update();
        if(cb)cb(c);
      };
      ch.appendChild(btn);
    });
    document.getElementById('ev-modal').classList.add('open');
  },

  closeModal(){
    document.getElementById('ev-modal').classList.remove('open');
    if(Engine._modalSkipCb){const cb=Engine._modalSkipCb;Engine._modalSkipCb=null;cb();}
  },

  toast(msg,type='',dur=2800){
    const c=document.getElementById('toast-wrap');if(!c)return;
    const t=document.createElement('div');
    t.className='toast'+(type?' toast-'+type:'');
    t.textContent=msg;c.appendChild(t);
    setTimeout(()=>{t.classList.add('out');setTimeout(()=>t?.remove(),250);},dur);
  },

  achievementPopup(ach){
    if(!ach)return;
    this.toast(`🎖️ Achievement: ${ach.name}!`,'ach',4500);
  },

  milestoneCheck(G){
    const nw=netWorth(G);
    [100000,500000,1000000,5000000,10000000,100000000,1000000000].forEach(m=>{
      const key='ms_nw_'+m;
      if(nw>=m&&!G.achievements[key]){G.achievements[key]=true;this.toast(`💰 Net worth milestone: ${fmt(m)}!`,'good',4000);}
    });
  },
};
