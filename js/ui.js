/* js/ui.js — LifeSim v13 */
const UI={
  VERSION:13,
  SETTINGS_KEY:'lsv13_settings',
  LEGACY_SETTINGS_KEYS:['ls10_settings'],

  _activeTab:'life',
  _settings:{statDelta:true,tips:true,healthWarn:true,showChapters:false},
  _tipDismissed:false,
  _lastGoalCount:0,
  _logFilter:'all', // 'all','highlight','money','health','career','family'

  _esc(value){
    if(typeof escapeHTML==='function')return escapeHTML(value);
    return String(value??'').replace(/[&<>"']/g,ch=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[ch]));
  },

  _clamp(value,min=0,max=100){
    return Math.max(min,Math.min(max,Number(value)||0));
  },

  loadSettings(){
    const keys=[this.SETTINGS_KEY,...this.LEGACY_SETTINGS_KEYS];
    let loaded={};
    let loadedFrom='';

    for(const key of keys){
      try{
        const raw=localStorage.getItem(key);
        if(!raw)continue;
        loaded=JSON.parse(raw)||{};
        loadedFrom=key;
        break;
      }catch(e){
        console.warn('Could not load settings:',key,e);
      }
    }

    this._settings={
      statDelta:loaded.statDelta!==false,
      tips:loaded.tips!==false,
      healthWarn:loaded.healthWarn!==false,
      showChapters:loaded.showChapters===true,
    };

    // v13 migration: keep old settings readable, but write future settings to the v13 key.
    if(loadedFrom&&loadedFrom!==this.SETTINGS_KEY){
      try{localStorage.setItem(this.SETTINGS_KEY,JSON.stringify(this._settings));}catch(e){}
    }
  },

  saveSetting(key,val){
    this._settings[key]=!!val;
    try{localStorage.setItem(this.SETTINGS_KEY,JSON.stringify(this._settings));}catch(e){}
  },

  toggleLifeChapters(){
    const next=!this._settings.showChapters;
    this.saveSetting('showChapters',next);
    const panel=document.getElementById('chapters-panel');
    if(panel&&!next)panel.innerHTML='';
    if(this._activeTab==='life')this.renderLifeChapters(window.G);
    if(this._activeTab==='crime'&&typeof Crime!=='undefined')Crime.render();
    this.toast(next?'Life Chapters will now show in the Life tab.':'Life Chapters are now hidden in the Life tab.','neutral');
  },

  openSettings(){
    this.loadSettings();

    const stat=document.getElementById('set-statdelta');
    const tips=document.getElementById('set-tips');
    const health=document.getElementById('set-healthwarn');
    const modal=document.getElementById('settings-modal');

    if(stat)stat.checked=this._settings.statDelta;
    if(tips)tips.checked=this._settings.tips;
    if(health)health.checked=this._settings.healthWarn;
    if(modal)modal.classList.add('open');
  },

  confirmReset(){
    if(confirm('Are you sure? This will delete your saved life permanently.')){
      Save.clear();
      location.reload();
    }
  },

  tab(name){
    const G=window.G;

    if(G?.inPrison&&!this._isPrisonAllowedTab(name)){
      this.toast('You are in prison. Use the Prison actions until you are released.','bad');
      name='crime';
    }

    document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.nt').forEach(t=>t.classList.remove('active'));

    const panel=document.getElementById('tab-'+name);
    const btn=[...document.querySelectorAll('.nt')].find(t=>t.dataset.tab===name);

    if(panel)panel.classList.add('active');
    if(btn){
      btn.classList.add('active');
      this._scrollTabIntoView(btn);
    }

    this._activeTab=name;
    this._tipDismissed=false;
    this._renderTab(name);
  },

  _renderTab(name){
    try{
      if(name==='life'){
        this.renderLog();
      }else if(name==='mind'){
        this.renderMind();
      }else if(name==='love'&&typeof Relations!=='undefined'){
        Relations.render();
      }else if(name==='career'&&typeof Career!=='undefined'){
        Career.render();
      }else if(name==='assets'&&typeof Assets!=='undefined'){
        Assets.render();
      }else if(name==='health'&&typeof Health!=='undefined'){
        Health.render();
      }else if(name==='crime'&&typeof Crime!=='undefined'){
        Crime.render();
      }else if(name==='social'&&typeof Social!=='undefined'){
        Social.render();
      }else if(name==='business'&&typeof Business!=='undefined'){
        Business.render();
      }else if(name==='hustle'&&typeof Hustle!=='undefined'){
        Hustle.render();
      }else if(name==='pets'&&typeof Pets!=='undefined'){
        Pets.render();
      }else if(name==='skills'&&typeof Skills!=='undefined'){
        Skills.render();
      }else if(name==='stocks'&&typeof Stocks!=='undefined'){
        Stocks.render();
      }else if(name==='goals'&&typeof Goals!=='undefined'){
        Goals.render();
      }
    }catch(e){
      console.warn('Tab render failed:',name,e);
      this.toast('That screen had trouble rendering. Try another tab.','bad');
    }
  },

  _scrollTabIntoView(btn){
    const nav=btn.closest('.nav-bar');
    if(!nav)return;

    const target=btn.offsetLeft-(nav.offsetWidth/2)+(btn.offsetWidth/2);
    nav.scrollTo({left:target,behavior:'smooth'});
  },

  refreshActiveTab(){
    const t=this._activeTab||'life';
    const G=window.G;

    if(G?.inPrison&&!this._isPrisonAllowedTab(t)){
      this.tab('crime');
      return;
    }

    this._renderTab(t);
  },

  renderLifeChapters(G=window.G){
    const panel=document.getElementById('chapters-panel');
    if(!panel)return;
    if(!this._settings.showChapters){
      panel.innerHTML='';
      return;
    }
    if(typeof Chapters!=='undefined')Chapters.render(G);
  },

  _isPrisonAllowedTab(name){
    return['life','crime','goals'].includes(name);
  },

  isDesktop(){
    return window.innerWidth>=900;
  },

  update(){
    const G=window.G;
    if(!G||!G.name)return;

    const av=G.age<2?'👶':G.age<5?'🍼':G.age<13?(G.gender==='female'?'👧':'🧒'):
             G.age<18?(G.gender==='female'?'👧':'👦'):G.age<40?(G.gender==='female'?'👩':'🧑'):
             G.age<65?(G.gender==='female'?'👩':'🧔'):(G.gender==='female'?'👵':'👴');

    const fullName=`${G.name||''} ${G.surname||''}`.trim();

    const stage=G.age<2?'Baby':G.age<5?'Toddler':G.age<13?'Child':G.age<18?'Teenager':
                G.inUniversity?`Uni Year ${G.univYear}`:G.retired?'Retired 🏖️':
                G.career?G.career.title:G.age<65?'Adult':'Senior';

    const info=`Age ${G.age} · ${G.country?.flag||'🌍'} ${stage}`;

    const sAvEl=document.getElementById('g-avatar');
    if(sAvEl&&sAvEl.textContent!==av){
      sAvEl.textContent=av;
      sAvEl.style.animation='avatarPop .35s ease';
      setTimeout(()=>{if(sAvEl)sAvEl.style.animation='';},400);
    }

    const sName=document.getElementById('g-name');
    if(sName)sName.textContent=fullName;

    const sInfo=document.getElementById('g-info');
    if(sInfo)sInfo.textContent=info;

    const mAvEl=document.getElementById('g-avatar-m');
    if(mAvEl&&mAvEl.textContent!==av){
      mAvEl.textContent=av;
      mAvEl.style.animation='avatarPop .35s ease';
      setTimeout(()=>{if(mAvEl)mAvEl.style.animation='';},400);
    }

    const mName=document.getElementById('g-name-m');
    if(mName)mName.textContent=fullName;

    const mInfo=document.getElementById('g-info-m');
    if(mInfo)mInfo.textContent=info;

    const nw=netWorth(G);
    ['g-money','g-money-m'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.textContent=fmtFull(nw);
    });

    ['g-cash','g-cash-m'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.textContent=`Cash: ${fmt(G.money)}`;
    });

    let inc=0;

    if(G.career)inc+=sc(G.career.salary);
    if(G.retired)inc+=sc(G.retirementPension||0);

    (G.assets?.properties||[]).forEach(p=>{
      if(p.rent>0)inc+=sc(p.rent);
    });

    if(G.business?.revenue>0)inc+=sc(G.business.revenue-G.business.expenses);

    if(typeof Hustle!=='undefined'&&Hustle.projectedIncome)inc+=Hustle.projectedIncome(G);

    if((G.followers||0)>0){
      inc+=typeof Social!=='undefined'&&Social.projectedIncome
        ?Social.projectedIncome()
        :Math.floor(G.followers*0.01);
    }

    const incTxt=inc>0?`+${fmt(inc)}/yr`:'';

    ['g-income','g-income-m'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.textContent=incTxt;
    });

    const stress=G.stress||0;
    const stressC=stress>70?'var(--red)':stress>40?'var(--orange)':'var(--teal)';

    const karma=G.karma||0;
    const kpct=this._clamp((karma+100)/2);
    const karmaC=karma>20?'var(--green)':karma<-20?'var(--red)':'var(--teal)';

    const updateStat=(k,val,fill,valC)=>{
      ['sf-'+k,'sf-'+k+'-m'].forEach(id=>{
        const el=document.getElementById(id);
        if(el){
          el.style.width=this._clamp(fill)+'%';
          el.style.background=valC;
        }
      });

      ['sv-'+k,'sv-'+k+'-m'].forEach(id=>{
        const el=document.getElementById(id);
        if(el){
          el.textContent=Math.round(val);
          el.style.color=valC;
        }
      });
    };

    updateStat('hap',G.happiness,G.happiness,'var(--yellow)');
    updateStat('hlt',G.health,G.health,'var(--green)');
    updateStat('smt',G.smarts,G.smarts,'var(--cyan)');
    updateStat('lks',G.looks,G.looks,'var(--pink)');
    updateStat('fit',G.fitness||50,G.fitness||50,'var(--orange)');
    updateStat('str',stress,stress,stressC);
    updateStat('fam',G.fame||0,G.fame||0,'var(--accent)');
    updateStat('kar',Math.round(karma),kpct,karmaC);

    const karmaText=(karma>0?'+':'')+Math.round(karma);

    ['sv-kar','sv-kar-m'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.textContent=karmaText;
    });

    // v13: Sidebar sparklines. sparklineSVG returns trusted app-generated SVG.
    const hist=G.statHistory||[];
    const sparkMap=[
      ['hap','var(--yellow)'],
      ['hlt','var(--green)'],
      ['smt','var(--cyan)'],
      ['lks','var(--pink)'],
      ['fit','var(--orange)'],
      ['str','var(--red)'],
      ['fam','var(--accent)'],
      ['kar','var(--teal)'],
    ];

    sparkMap.forEach(([k,col])=>{
      const slEl=document.getElementById('spark-'+k);
      if(slEl)slEl.innerHTML=sparklineSVG(hist,k,col,44,14);
    });

    // v13: Goals progress widget
    if(typeof Goals!=='undefined'&&Goals.ensurePersonalGoals)Goals.ensurePersonalGoals(G);

    const activeGoals=G.activeGoals||[];
    const completedGoals=G.completedGoals||[];
    const goalsTotal=activeGoals.length||7;
    const goalsDone=completedGoals.filter(id=>activeGoals.some(g=>g.id===id)).length;
    const goalsPct=goalsTotal?Math.round((goalsDone/goalsTotal)*100):0;
    const goalsColor=goalsPct>=100?'var(--green)':goalsPct>=50?'var(--accent)':'var(--muted)';

    ['g-goals-widget','g-goals-widget-m'].forEach(id=>{
      const el=document.getElementById(id);
      if(el){
        el.innerHTML=`<span onclick="UI.tab('goals')" style="cursor:pointer;font-size:11px;font-weight:800;color:${goalsColor};background:${goalsColor}18;border:1.5px solid ${goalsColor}44;border-radius:20px;padding:2px 8px;white-space:nowrap">🎯 ${goalsDone}/${goalsTotal}</span>`;
      }
    });

    // v13: Money context indicator
    const mc=moneyBenchmark(G);

    ['g-money-ctx','g-money-ctx-m'].forEach(id=>{
      const el=document.getElementById(id);
      if(el&&mc){
        el.innerHTML=`<span style="font-size:10px;font-weight:700;color:${mc.color}">${this._esc(mc.icon)} ${this._esc(mc.label)}</span>`;
      }else if(el){
        el.innerHTML='';
      }
    });

    const tags=[];

    if(G.trait){
      const td=typeof PERSONALITY_TRAITS!=='undefined'&&PERSONALITY_TRAITS.find(t=>t.id===G.trait);
      if(td)tags.push(`<span class="badge badge-a">${this._esc(td.icon)} ${this._esc(td.name)}</span>`);
    }

    if(G.career)tags.push(`<span class="badge badge-a">${this._esc(G.career.title)}</span>`);
    if(G.retired)tags.push('<span class="badge badge-g">🏖️ Retired</span>');
    if(G.rels?.partner?.married)tags.push('<span class="badge badge-p">💍 Married</span>');

    if((G.rels?.children||[]).length){
      tags.push(`<span class="badge">${G.rels.children.length} kid${G.rels.children.length!==1?'s':''}</span>`);
    }

    if(G.inPrison)tags.push('<span class="badge badge-r">🔒 Prison</span>');

    if(G.business){
      tags.push(`<span class="badge badge-g">🏢 ${this._esc(String(G.business.name||'Business').split(' ')[0])}</span>`);
    }

    if((G.followers||0)>=10000){
      tags.push(`<span class="badge badge-a">⭐ ${this._esc(fmtFollowers(G.followers))}</span>`);
    }

    if(stress>80)tags.push('<span class="badge badge-r">😤 Burnout</span>');
    else if(stress>55)tags.push('<span class="badge badge-y">😰 Stressed</span>');

    if(karma>=40)tags.push('<span class="badge badge-g">😇 +Karma</span>');
    else if(karma<=-30)tags.push('<span class="badge badge-r">😈 −Karma</span>');

    if(G.addictions?.smoking)tags.push('<span class="badge badge-o">🚬 Addicted</span>');

    const alivePets=(G.pets||[]).filter(p=>p.alive).length;
    if(alivePets>0)tags.push(`<span class="badge">🐾 ${alivePets}</span>`);

    const tagsHtml=tags.join('');

    ['g-tags','g-tags-m'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.innerHTML=tagsHtml;
    });

    this.milestoneCheck(G);
    this.updateTabBadges(G);
    this.renderLog();
  },

  updateTabBadges(G){
    if(!G)return;

    const stress=G.stress||0;

    const badgeMap={
      health: G.health<25?'red':G.health<40?'yellow':null,
      mind: stress>75?'red':stress>55?'yellow':null,
      career: (G.career&&(G.jobPerf||50)<30)?'yellow':null,
      business: (G.business&&G.business.revenue<G.business.expenses)?'yellow':null,
      skills: (G.skillPoints||0)>0?'green':null,
      crime: G.inPrison?'red':null,
    };

    if(G.completedGoals){
      const cnt=G.completedGoals.length;
      if(cnt>this._lastGoalCount&&this._activeTab!=='goals')badgeMap.goals='green';
      this._lastGoalCount=cnt;
    }

    Object.entries(badgeMap).forEach(([tab,color])=>{
      const dot=document.getElementById('dot-'+tab);
      if(!dot)return;
      dot.className='tab-dot'+(color?' dot-'+color:'');
    });
  },

  getSmartTip(G){
    if(!G||!this._settings.tips||this._tipDismissed)return null;

    const stress=G.stress||0;

    if(G.health<20)return{icon:'🚨',text:'Critical health! Go to Health tab immediately.',tab:'health',color:'red'};
    if(stress>80)return{icon:'🔥',text:'Severe burnout! Meditate or try therapy.',tab:'mind',color:'orange'};
    if(G.health<35)return{icon:'❤️‍🩹',text:`Health at ${Math.round(G.health)}% — visit the Health tab.`,tab:'health',color:'orange'};
    if(stress>65)return{icon:'😰',text:'High stress level. Try relaxing in the Mind tab.',tab:'mind',color:'orange'};

    if((G.skillPoints||0)>0){
      return{icon:'🎓',text:`${G.skillPoints} unspent skill point${G.skillPoints!==1?'s':''}! Go to Skills.`,tab:'skills',color:'accent'};
    }

    if(!G.career&&G.age>=18&&G.age<60&&!G.inUniversity&&!G.inPrison){
      return{icon:'💼',text:'No job yet. Find employment in the Career tab.',tab:'career',color:'accent'};
    }

    if(G.age>=18&&!G.assets?.properties?.length&&G.money>20000){
      return{icon:'🏠',text:`${fmt(G.money)} in cash — buy property in Assets!`,tab:'assets',color:'accent'};
    }

    return null;
  },

  _buildSmartTipHtml(tip){
    if(!tip)return'';

    const colorMap={
      red:'var(--red)',
      orange:'var(--orange)',
      accent:'var(--accent)',
    };

    const c=colorMap[tip.color]||'var(--accent)';
    const tab=['health','mind','skills','career','assets','goals','life'].includes(tip.tab)?tip.tab:'life';

    return`<div class="smart-tip" style="border-color:${c}44;background:${c}12" onclick="UI.tab('${tab}')">
      <span class="smart-tip-ico">${this._esc(tip.icon)}</span>
      <span class="smart-tip-txt" style="color:${c}">${this._esc(tip.text)}</span>
      <button type="button" class="smart-tip-close" onclick="event.stopPropagation();UI._tipDismissed=true;UI.renderLog()" title="Dismiss" aria-label="Dismiss tip">✕</button>
    </div>`;
  },

  _buildCritBanners(G){
    if(!this._settings.healthWarn)return'';

    let html='';
    const stress=G.stress||0;

    if(G.health<20){
      html+=`<div class="crit-banner red"><span class="crit-banner-ico">🚨</span><div class="crit-banner-txt">Health critical (${Math.round(G.health)}%)! You may die soon.</div><button type="button" class="crit-go" onclick="UI.tab('health')">→ Health</button></div>`;
    }else if(G.health<35){
      html+=`<div class="crit-banner orange"><span class="crit-banner-ico">⚠️</span><div class="crit-banner-txt">Health is low (${Math.round(G.health)}%). See a doctor.</div><button type="button" class="crit-go" onclick="UI.tab('health')">→ Health</button></div>`;
    }

    if(stress>85){
      html+=`<div class="crit-banner orange"><span class="crit-banner-ico">🔥</span><div class="crit-banner-txt">Severe burnout (stress ${Math.round(stress)}%). Your health is suffering!</div><button type="button" class="crit-go" onclick="UI.tab('mind')">→ Mind</button></div>`;
    }

    return html;
  },

  renderLog(){
    const G=window.G;
    if(!G)return;
    const chaptersVisible=!!this._settings.showChapters;

    const el=document.getElementById('tab-life');
    if(!el||!el.classList.contains('active'))return;

    const aiReady=typeof AIStory!=='undefined'&&AIStory.canUse&&AIStory.canUse();
    const aiGap=typeof AIStory!=='undefined'&&Number.isFinite(AIStory.gap)?AIStory.gap:3;
    const lastStoryAge=Number.isFinite(G.storyCooldownAge)?G.storyCooldownAge:-999;
    const storyCooldown=Math.max(0,aiGap-(G.age-lastStoryAge));

    const spBadge=(G.skillPoints||0)>0
      ?`<span class="badge badge-a" style="margin-left:6px">🎓 ${G.skillPoints} Skill Pt${G.skillPoints!==1?'s':''}</span>`
      :'';

    const tip=this.getSmartTip(G);
    const critHTML=this._buildCritBanners(G);

    const stress=G.stress||0;
    let stressPanel='';

    if(stress>=50){
      const stressLbl=stress>=80?'🔥 Severe Burnout':stress>=65?'😤 High Stress':'😰 Stressed';
      const stressC=stress>=80?'var(--red)':stress>=65?'var(--orange)':'var(--yellow)';

      stressPanel=`<div style="background:${stressC}14;border:1.5px solid ${stressC}55;border-radius:13px;padding:11px 13px;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;font-weight:900;color:${stressC}">${stressLbl} (${Math.round(stress)}%)</span>
          <span style="font-size:10px;color:var(--muted);font-weight:700">Reduce Stress</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <button type="button" onclick="Engine.act('meditate');UI.tab('life')" style="background:var(--s2);border:1.5px solid var(--b1);border-radius:9px;padding:7px 8px;font-size:11px;font-weight:800;color:var(--txt);cursor:pointer">🧘 Meditate<br><span style="color:var(--green);font-size:9px">−Stress (Free)</span></button>
          <button type="button" onclick="Engine.act('sleep');UI.tab('life')" style="background:var(--s2);border:1.5px solid var(--b1);border-radius:9px;padding:7px 8px;font-size:11px;font-weight:800;color:var(--txt);cursor:pointer">😴 Rest Day<br><span style="color:var(--green);font-size:9px">−Stress (Free)</span></button>
          <button type="button" onclick="Engine.act('yoga');UI.tab('life')" style="background:var(--s2);border:1.5px solid var(--b1);border-radius:9px;padding:7px 8px;font-size:11px;font-weight:800;color:var(--txt);cursor:pointer">🧘‍♀️ Yoga<br><span style="color:var(--green);font-size:9px">−Stress (Free)</span></button>
          <button type="button" onclick="Engine.act('therapy');UI.tab('life')" style="background:var(--s2);border:1.5px solid var(--b1);border-radius:9px;padding:7px 8px;font-size:11px;font-weight:800;color:var(--txt);cursor:pointer">🛋️ Therapy<br><span style="color:var(--yellow);font-size:9px">−Stress ($150)</span></button>
        </div>
      </div>`;
    }

    const filters=[
      {id:'all',label:'All'},
      {id:'highlight',label:'⭐ Highlights'},
      {id:'money',label:'💰 Money'},
      {id:'health',label:'❤️ Health'},
      {id:'career',label:'💼 Career'},
      {id:'family',label:'💑 Family'},
    ];

    const filterBtns=`<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">${filters.map(f=>`<button type="button" onclick="UI._logFilter='${f.id}';UI.renderLog()" style="font-size:10px;font-weight:800;padding:4px 8px;border-radius:20px;border:1.5px solid ${this._logFilter===f.id?'var(--accent)':'var(--b1)'};background:${this._logFilter===f.id?'var(--accent)22':'var(--s1)'};color:${this._logFilter===f.id?'var(--accent)':'var(--muted)'};cursor:pointer;white-space:nowrap">${f.label}</button>`).join('')}</div>`;

    const allLog=(G.log||[]).slice(0,150);
    const filteredLog=this._logFilter==='all'?allLog:allLog.filter(e=>logCategory(e)===this._logFilter);

    const emptyNote=filteredLog.length===0
      ?'<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">No entries in this category yet.</div>'
      :'';

    const chapterToggle=`<div style="display:flex;justify-content:flex-end;margin-bottom:10px">
      <button type="button" class="btn-secondary btn-sm" onclick="UI.toggleLifeChapters()">${chaptersVisible?'\u{1F441}\uFE0F Hide Life Chapters':'\u{1F4D6} Show Life Chapters'}</button>
    </div>`;

    el.innerHTML=
      critHTML+
      stressPanel+
      this._buildSmartTipHtml(tip)+
      chapterToggle+
      '<div id="chapters-panel" style="margin-bottom:10px"></div>'+
      `<div style="display:flex;gap:8px;margin-bottom:10px;align-items:center">
        <button type="button" class="btn-primary" style="flex:1;font-size:13px;padding:10px 0;background:${aiReady?'linear-gradient(135deg,#7c6fff,#a855f7)':'rgba(124,111,255,.2)'};opacity:${aiReady?1:.55}" onclick="AIStory.generate()" ${aiReady?'':'disabled'}>
          📖 Story Event ${aiReady?'✨':'('+storyCooldown+'yr)'}
        </button>
        <div style="font-size:12px;color:var(--muted);text-align:right;flex-shrink:0">Age ${Math.round(G.age)}${spBadge}</div>
      </div>`+
      filterBtns+
      '<div class="log-list">'+
        filteredLog.map(e=>{
          const col=e.type==='good'?'var(--green)':e.type==='bad'?'var(--red)':e.type==='special'?'var(--accent)':e.type==='money'?'var(--yellow)':'var(--muted)';
          const cat=logCategory(e);
          const catDot=cat==='highlight'?'⭐':cat==='money'?'💰':cat==='health'?'❤️':cat==='career'?'💼':cat==='family'?'💑':'';
          const typeClass=['good','bad','special','money','neutral'].includes(e.type)?e.type:'neutral';

          return`<div class="log-entry ${typeClass}"><div class="log-age" style="color:${col}">Age ${this._esc(e.age)}</div><div class="log-txt">${this._esc(e.text)}${catDot?` <span style="font-size:9px;opacity:.6">${catDot}</span>`:''}</div></div>`;
        }).join('')+
        emptyNote+
      '</div>';

    try{
      this.renderLifeChapters(G);
    }catch(e){
      console.warn(e);
    }
  },

  renderMind(){
    const G=window.G;
    const el=document.getElementById('tab-mind');
    if(!el)return;

    let addWarn='';

    if(G?.addictions?.smoking){
      addWarn+='<div class="addiction-warn"><div class="aw-ico">🚬</div><div class="aw-txt"><strong>Nicotine Addiction</strong><br>You crave cigarettes daily. Quit in the Health tab.</div></div>';
    }

    if(G?.addictions?.alcohol){
      addWarn+='<div class="addiction-warn"><div class="aw-ico">🍺</div><div class="aw-txt"><strong>Alcohol Dependency</strong><br>Your body relies on alcohol. Seek help in the Health tab.</div></div>';
    }

    el.innerHTML=addWarn+`
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

  showStatDelta(before,after){
    if(!this._settings.statDelta)return;

    const icons={
      happiness:'😊',
      health:'❤️',
      smarts:'🧠',
      looks:'✨',
      fitness:'⚡',
      stress:'😤',
      money:'💰',
      fame:'🌟',
      karma:'⚖️',
    };

    const parts=[];

    Object.keys(icons).forEach(k=>{
      const bv=before[k]??0;
      const av=k==='stress'
        ?(after.stress||0)
        :k==='fame'
          ?(after.fame||0)
          :k==='karma'
            ?(after.karma||0)
            :k==='fitness'
              ?(after.fitness||50)
              :(after[k]??0);

      const d=Math.round(av-bv);
      if(Math.abs(d)<1)return;

      const isGood=k==='stress'?d<0:d>0;
      const sign=d>0?'+':'';

      parts.push(`<span style="color:${isGood?'var(--green)':'var(--red)'};font-weight:800">${icons[k]}${sign}${d}</span>`);
    });

    if(!parts.length)return;

    const c=document.getElementById('toast-wrap');
    if(!c)return;

    const t=document.createElement('div');
    t.className='toast';
    t.style.cssText='background:rgba(16,16,24,.96);border:1.5px solid var(--b2);font-size:13px;white-space:normal;text-align:center;max-width:300px;display:flex;gap:6px;flex-wrap:wrap;justify-content:center;padding:8px 14px';
    t.innerHTML=parts.join(' ');

    c.appendChild(t);

    setTimeout(()=>{
      t.classList.add('out');
      setTimeout(()=>t?.remove(),250);
    },2200);
  },

  showEvent(evt,cb){
    const icon=document.getElementById('m-ico');
    const title=document.getElementById('m-title');
    const text=document.getElementById('m-text');
    const ch=document.getElementById('m-choices');
    const modal=document.getElementById('ev-modal');

    if(icon)icon.textContent=evt.icon||'✨';
    if(title)title.textContent=evt.title||'Event';
    if(text)text.textContent=evt.text||'';

    if(!ch||!modal)return;

    ch.innerHTML='';

    (evt.choices||[]).forEach(c=>{
      const btn=document.createElement('button');
      btn.className='choice-btn';

      if(c.label){
        const fxHtml=this._choiceFxHtml(c.e||{});
        btn.innerHTML=`<span class="choice-label">${this._esc(c.label)}</span><span class="choice-sub">${this._esc(c.sub||'')}</span>${fxHtml}`;
      }else{
        btn.textContent=c.t||'Continue';
      }

      btn.onclick=()=>{
        try{
          applyStats(window.G,c.e||{});
          Engine.log(`${evt.icon||'•'} ${evt.title} — ${c.t||c.label||''}`,evt.type||'neutral');
        }catch(err){
          console.warn(err);
        }

        modal.classList.remove('open');
        UI.update();

        if(cb)cb();
      };

      ch.appendChild(btn);
    });

    modal.classList.add('open');
  },

  askChoice(opts,cb){
    const modal=document.getElementById('ev-modal');
    const ch=document.getElementById('m-choices');
    const icon=document.getElementById('m-ico');
    const title=document.getElementById('m-title');
    const text=document.getElementById('m-text');

    if(icon)icon.textContent=opts.icon||'✨';
    if(title)title.textContent=opts.title||'Choose';
    if(text)text.textContent=opts.text||'';

    if(!modal||!ch)return;

    ch.innerHTML='';

    (opts.choices||[]).forEach(choice=>{
      const btn=document.createElement('button');
      btn.className='choice-btn'+(choice.danger?' danger':'');

      btn.innerHTML=`<span class="choice-label">${this._esc(choice.label)}</span><span class="choice-sub">${this._esc(choice.sub||'')}</span>`;

      btn.onclick=()=>{
        modal.classList.remove('open');
        if(cb)cb(choice.value);
      };

      ch.appendChild(btn);
    });

    modal.classList.add('open');
  },

  _choiceFxHtml(e){
    if(!e||!Object.keys(e).length)return'';

    const icons={
      happiness:'😊',
      health:'❤️',
      smarts:'🧠',
      looks:'✨',
      fitness:'⚡',
      stress:'😤',
      money:'💰',
      fame:'🌟',
      karma:'⚖️',
    };

    const parts=[];

    Object.entries(e).forEach(([k,v])=>{
      if(!icons[k]||typeof v!=='number'||v===0)return;

      const good=k==='stress'?v<0:v>0;
      parts.push(`<span style="color:${good?'var(--green)':'var(--red)'};font-size:10px">${icons[k]}${v>0?'+':''}${v}</span>`);
    });

    if(!parts.length)return'';

    return`<span style="display:flex;gap:5px;margin-top:3px;flex-wrap:wrap">${parts.join('')}</span>`;
  },

  closeModal(){
    const modal=document.getElementById('ev-modal');
    if(modal)modal.classList.remove('open');

    if(Engine._modalSkipCb){
      const cb=Engine._modalSkipCb;
      Engine._modalSkipCb=null;
      cb();
    }
  },

  toast(msg,type='',dur=2800){
    const c=document.getElementById('toast-wrap');
    if(!c)return;

    const t=document.createElement('div');
    t.className='toast'+(type?' toast-'+type:'');
    t.textContent=msg;

    c.appendChild(t);

    setTimeout(()=>{
      t.classList.add('out');
      setTimeout(()=>t?.remove(),250);
    },dur);
  },

  achievementPopup(ach){
    if(!ach)return;
    this.toast(`🎖️ Achievement: ${ach.name}!`,'ach',4500);
  },

  milestoneCheck(G){
    if(!G)return;
    if(!G.achievements)G.achievements={};

    const nw=netWorth(G);

    [100000,500000,1000000,5000000,10000000,100000000,1000000000].forEach(m=>{
      const key='ms_nw_'+m;

      if(nw>=m&&!G.achievements[key]){
        G.achievements[key]=true;
        this.toast(`💰 Net worth milestone: ${fmt(m)}!`,'good',4000);
      }
    });
  },
};
