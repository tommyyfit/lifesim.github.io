/* js/release_core.js — LifeSim Stability + Live Data Update
   Clean release layer: desktop layout, balanced economy, quests, best-move guidance, achievement detail, cleaner assets, calmer relationship wellbeing and gang depth. */
(function(){
  'use strict';

  const BUILD = 'release-core';
  const VERSION_NUM = 1;
  const BASE_TABS = ['life','mind','love','career','assets','health','crime','social','business','hustle','pets','skills','stocks','goals'];
  const PROMOTED = ['family','sports','military','travel'];
  const REMAP = { family:'love', sports:'career', military:'career', travel:'mind' };
  const OPEN = { mind:null, love:null, career:null, crime:null };

  const SYSTEMS = {
    // release: Gameplay feel layer with yearly quests, timeline, assets and achievement rewards.
    // Love already owns relationship/family wellbeing, and Mind already owns holiday/recreation actions.
    // Keeping them as separate expandable hubs created duplicate-feeling UX.
    career:[
      {key:'sports',target:'tab-sports',icon:'🏆',title:'Sports Career',desc:'Train, compete, manage injuries, salary and retirement.',ready:()=>typeof Sports!=='undefined',render:()=>Sports.render()},
      {key:'military',target:'tab-military',icon:'🎖️',title:'Army / Military',desc:'Enlist, rank up, deploy and manage long-term service effects.',ready:()=>typeof Military!=='undefined',render:()=>Military.render()}
    ]
  };

  function parentsOf(G){
    const rels=G?.rels||{};
    const parents=[rels.father,rels.mother,...(Array.isArray(rels.parents)?rels.parents:[])].filter(Boolean);
    return parents.filter((parent,index,all)=>{
      const key=parent.id||`${parent.role||''}:${parent.name||''}:${parent.surname||''}`;
      return all.findIndex(other=>(other.id||`${other.role||''}:${other.name||''}:${other.surname||''}`)===key)===index;
    });
  }


  const GANGS = {
    cipher_collective:{icon:'🔐',name:'Cipher Collective',style:'Cybercrime syndicate',needRep:22,needIntel:18,specialty:'digital',riskMod:-6,rewardMod:1.20,trustGain:8,territoryStart:12,perk:'Digital jobs: lower risk + stronger intel gain',rival:'Velvet Table',desc:'Lower digital risk, stronger cyber rewards, high investigation pressure.'},
    iron_wolves:{icon:'🐺',name:'Iron Wolves',style:'Street crew',needRep:14,needIntel:4,specialty:'street',riskMod:3,rewardMod:1.12,trustGain:10,territoryStart:18,perk:'Street jobs: faster rep + territory growth',rival:'Dockside Union',desc:'Fast reputation and street control, but more heat and violence risk.'},
    velvet_table:{icon:'🎩',name:'Velvet Table',style:'White-collar network',needRep:30,needIntel:28,specialty:'finance',riskMod:-3,rewardMod:1.22,trustGain:6,territoryStart:9,perk:'Finance jobs: higher payout + cleaner reputation shield',rival:'Cipher Collective',desc:'Best for white-collar schemes, laundering and high-status operations.'},
    dockside_union:{icon:'⚓',name:'Dockside Union',style:'Port operation crew',needRep:26,needIntel:20,specialty:'heavy',riskMod:2,rewardMod:1.20,trustGain:7,territoryStart:16,perk:'Heavy jobs: better crew support + bigger territory payouts',rival:'Iron Wolves',desc:'Great for heavy jobs and logistics, but heat can rise quickly.'},
    clean_slate:{icon:'🕊️',name:'Clean Slate Network',style:'Reform group',needRep:0,needIntel:0,specialty:'reform',riskMod:-12,rewardMod:0.70,trustGain:9,territoryStart:0,perk:'Reform path: lowers heat, stress and relapse pressure',rival:'Underworld',desc:'Not a gang — a safe exit path that lowers heat, stress and future crime pull.'}
  };

  const ECONOMY = {
    bands:[
      {id:'micro',label:'Micro',min:0,max:999,tone:'neutral'},
      {id:'low',label:'Low',min:1000,max:9999,tone:'neutral'},
      {id:'medium',label:'Medium',min:10000,max:74999,tone:'good'},
      {id:'high',label:'High',min:75000,max:499999,tone:'good'},
      {id:'elite',label:'Elite',min:500000,max:4999999,tone:'warn'},
      {id:'legendary',label:'Legendary',min:5000000,max:Infinity,tone:'bad'}
    ],
    quickGig:{floor:120,ceil:18000},
    ventureWork:{floor:350,ceil:85000},
    venturePassive:{floor:0,ceil:350000},
    crime:{floor:1200,ceil:25000000},
    yearlyEvent:{floor:-250000,ceil:250000}
  };

  function safe(label,fn){ try{return fn();} catch(e){ console.warn('[LifeSim]',label,e); return null; } }
  function esc(v){ return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function attr(v){ return esc(v).replace(/`/g,'&#96;'); }
  function num(v,f=0){ const n=Number(v); return Number.isFinite(n)?n:f; }
  function clamp(v,min=0,max=100){ return Math.max(min,Math.min(max,num(v,min))); }
  function money(v){ try{return typeof fmt==='function'?fmt(v):'Kč'+Math.round(v||0).toLocaleString('en-US');}catch(_){return 'Kč'+Math.round(v||0).toLocaleString('en-US');} }
  function moneyFull(v){ try{return typeof fmtFull==='function'?fmtFull(v):money(v);}catch(_){return money(v);} }
  function scaleAmount(v){ try{return typeof sc==='function'?sc(v):v;}catch(_){return v;} }
  function net(G){ try{return typeof netWorth==='function'?netWorth(G):(G?.money||0);}catch(_){return G?.money||0;} }
  function statIcon(k){ return ({happiness:'😊',health:'❤️',smarts:'🧠',looks:'✨',fitness:'⚡',stress:'😤',money:'💰',fame:'🌟',karma:'⚖️',mentalHealth:'🧘',reputation:'⭐'})[k]||'•'; }
  function applyEffect(G,e){
    if(!G||!e)return;
    if(typeof applyStats==='function')applyStats(G,e);
    Object.entries(e).forEach(([k,v])=>{
      if(typeof v!=='number'||!Number.isFinite(v))return;
      if(k==='mentalHealth')G.mentalHealth=clamp((G.mentalHealth||60)+v,0,100);
      else if(k==='reputation')G.reputation=clamp((G.reputation||50)+v,0,100);
      else if(k==='gangTrust')G.gangTrust=clamp((G.gangTrust||0)+v,0,100);
      else if(k==='gangHeat')G.gangHeat=clamp((G.gangHeat||0)+v,0,100);
      else if(k==='crimeHeat')G.crimeHeat=clamp((G.crimeHeat||0)+v,0,100);
      else if(k==='money')G.money=Math.max(0,Math.round((G.money||0)+v));
      else if(typeof G[k]==='number'&&!['happiness','health','smarts','looks','fitness','stress','karma','fame'].includes(k))G[k]=clamp(G[k]+v,k==='karma'?-100:0,100);
    });
  }


  function economyBand(amount){
    const v=Math.abs(num(amount,0));
    return ECONOMY.bands.find(b=>v>=b.min&&v<=b.max)||ECONOMY.bands[0];
  }

  function balanceReward(amount,kind='general'){
    const raw=Math.round(num(amount,0));
    const cfg=ECONOMY[kind]||{};
    if(!Number.isFinite(raw))return 0;
    let out=raw;
    if(Number.isFinite(cfg.floor)&&raw>0)out=Math.max(cfg.floor,out);
    if(Number.isFinite(cfg.ceil)&&raw>cfg.ceil)out=Math.round(cfg.ceil+(raw-cfg.ceil)*0.35);
    if(raw<0&&Number.isFinite(cfg.floor))out=Math.min(-cfg.floor,out);
    if(raw<0&&Number.isFinite(cfg.ceil))out=Math.max(-cfg.ceil,out);
    return Math.round(out);
  }

  function moneyTone(v){ return num(v,0)>=0?'good':'bad'; }
  function deltaText(v){ return `${num(v)>=0?'+':''}${moneyFull(v)}`; }

  function summaryFocus(G,s){
    if((G.health||0)<35)return 'Health is becoming the main risk. Prioritize recovery, doctor visits and lower stress.';
    if((G.stress||0)>75)return 'Stress is too high. One or two balanced years could prevent burnout.';
    if(s.moneyDelta<0&&s.netWorthDelta<0)return 'Cashflow and net worth both dropped. Reduce spending or add stable income.';
    if((G.crimeHeat||0)>55||(G.gangHeat||0)>55)return 'Heat is high. Lay low, reduce risk, or plan a clean exit.';
    if((G.rels?.partner||null)&&((G.rels?.partner?.love||70)<45))return 'Relationship quality is slipping. Spend time in Love & Family.';
    if((G.ambition&&!G.ambitionAchieved))return 'Your ambition is still active. Pick actions that move that main goal.';
    return 'Stable year. Keep building assets, skills and relationships.';
  }

  function normalizeRarity(a){
    const raw=String(a?.rarity||'common').toLowerCase();
    if(raw==='uncommon')return 'rare';
    return ['common','rare','epic','legendary'].includes(raw)?raw:'common';
  }

  function familyStats(G){
    const partner=G?.rels?.partner||null;
    const kids=G?.rels?.children||[];
    const parents=parentsOf(G);
    const friends=G?.rels?.friends||[];
    const partnerLove=partner?Math.round(partner.love||partner.relationship||partner.intimacy||65):0;
    const familyScore=Math.round(clamp((partner?partnerLove:50)*0.42 + Math.min(35,kids.length*12) + Math.min(20,friends.filter(f=>(f.love||0)>55).length*4) + (parents.filter(p=>p.alive!==false).length?8:0)));
    return {partner,kids,parents,friends,partnerLove,familyScore};
  }

  function injectFamilyUX(name){
    if(name!=='love')return;
    requestAnimationFrame(()=>{
      const G=window.G; const el=document.getElementById('tab-love'); if(!G||!el||el.querySelector('.legacy-ui-family-clarity'))return;
      const f=familyStats(G);
      const partner=f.partner?(f.partner.married?'Married':'Dating'):'Single';
      const kidLine=f.kids.length?`${f.kids.length} child${f.kids.length!==1?'ren':''}`:'No children yet';
      const parentLine=f.parents.length?`${f.parents.filter(p=>p.alive!==false).length}/${f.parents.length} parents alive`:'Parents not tracked yet';
      const tone=f.familyScore>=75?'good':f.familyScore>=45?'warn':'bad';
      const html=`<section class="legacy-ui-family-clarity">
        <div class="legacy-ui-card-head"><div><div class="legacy-ui-kicker">Love & Family</div><h3>👨‍👩‍👧 Family Snapshot</h3><p>Relationship and family signals are summarized here without opening a duplicate Family panel.</p></div><strong class="${tone}">${f.familyScore}/100</strong></div>
        <div class="legacy-ui-summary-grid compact"><div><span>Partner</span><b>${esc(partner)}</b></div><div><span>Bond</span><b>${f.partner?`${f.partnerLove}%`:'—'}</b></div><div><span>Children</span><b>${esc(kidLine)}</b></div><div><span>Parents</span><b>${esc(parentLine)}</b></div></div>
        <div class="legacy-ui-note-line">Family status is summarized here so Love stays clean and does not duplicate another full tab.</div>
      </section>`;
      const anchor=el.querySelector('.legacy-ui-subhub')||el.firstElementChild;
      if(anchor)anchor.insertAdjacentHTML('beforebegin',html); else el.insertAdjacentHTML('afterbegin',html);
    });
  }

  function choiceRisk(c){
    const e=c.e||{}; const lt=(c.longTerm||c.long||{}).e||{};
    const risk=(e.stress||0)+(lt.stress||0)*2 + Math.max(0,-(e.health||0))*2 + Math.max(0,-(e.karma||0)) + (c.danger?12:0);
    if(risk>=18)return ['High risk','bad'];
    if(risk>=8)return ['Medium risk','warn'];
    return ['Controlled','good'];
  }

  function choiceMetaHTML(c){
    const [risk,tone]=choiceRisk(c);
    const reward=Object.entries(c.e||{}).filter(([k,v])=>typeof v==='number'&&v!==0&&['money','happiness','health','smarts','looks','fitness','stress','fame','karma','reputation','mentalHealth'].includes(k));
    const moneyFx=reward.find(([k])=>k==='money');
    const long=c.longTerm||c.long;
    return `<div class="legacy-ui-choice-meta"><span class="${tone}">⚠️ ${risk}</span>${moneyFx?`<span class="${moneyTone(moneyFx[1])}">💰 ${deltaText(moneyFx[1])}</span>`:''}${long?.label?`<span class="long">⏳ ${esc(long.label)}</span>`:''}</div>`;
  }

  function gangRankMeta(G){
    const trust=G.gangTrust||0, territory=G.gangTerritory||0;
    if(trust>=82&&territory>=55)return {rank:'Underboss',bonus:'Major payout boost, heavy rival attention',mult:1.18};
    if(trust>=64)return {rank:'Captain',bonus:'Better tasks and territory income',mult:1.12};
    if(trust>=38)return {rank:'Trusted Member',bonus:'Stable access to network tasks',mult:1.06};
    return {rank:'Associate',bonus:'Low influence, prove yourself',mult:1};
  }

  function gangYearEvent(G,gang){
    if(!G?.gang||!gang)return;
    const meta=gangRankMeta(G);
    if(Math.random()<0.18&&G.gangTrust<34){
      G.stress=clamp((G.stress||0)+5); G.gangHeat=clamp((G.gangHeat||0)+8);
      Engine?.log?.(`⚠️ Loyalty crisis inside ${gang.name}. Trust is low and heat rose.`,'bad');
    }
    if(Math.random()<0.16&&(G.gangTerritory||0)>28){
      G.gangHeat=clamp((G.gangHeat||0)+10); G.gangTrust=clamp((G.gangTrust||0)+3);
      Engine?.log?.(`⚔️ Rival pressure from ${gang.rival||'another crew'} tested your territory.`,'bad');
    }
    if(Math.random()<0.20&&G.gangTrust>55){
      const intel=Math.round(4+(G.gangTrust||0)/18); G.crimeIntel=clamp((G.crimeIntel||0)+intel);
      Engine?.log?.(`${gang.icon} ${meta.rank} perk: network intel increased by ${intel}%.`,'good');
    }
  }

  function exposeGlobals(){
    ['App','Create','Save','UI','Engine','Relations','Career','Assets','Health','Crime','Social','Business','Hustle','Pets','Goals','Skills','Stocks','AIStory','StoryEvents','Legacy','Chapters','Family','Sports','Military','Travel'].forEach(name=>{
      try{ const val=Function('return typeof '+name+'!=="undefined" ? '+name+' : undefined')(); if(val)window[name]=val; }catch(_){ }
    });
    ['COUNTRIES','UNIVERSITIES','CAREERS','PROPERTIES','VEHICLES','ACHIEVEMENTS','EVENTS','LIFE_AMBITIONS','WORLD_EVENTS','LIFESIM_UPDATES'].forEach(name=>{
      try{ const val=Function('return typeof '+name+'!=="undefined" ? '+name+' : undefined')(); if(val)window[name]=val; }catch(_){ }
    });
    window.CRIME_GANGS = GANGS;
  }

  function patchVersions(){
    if(typeof App!=='undefined')App.VERSION=VERSION_NUM;
    if(typeof UI!=='undefined')UI.VERSION=VERSION_NUM;
    if(typeof Engine!=='undefined')Engine.VERSION=VERSION_NUM;
    if(typeof Save!=='undefined'){
      Save.VERSION=VERSION_NUM;
      const oldNormalize=Save._normalizeSave?.bind(Save);
      if(oldNormalize&&!Save._releaseNormalizePatched){
        Save._normalizeSave=function(G){
          const clone=oldNormalize(G);
          if(clone){ clone.version=VERSION_NUM; clone.saveSchema='lifesim-release'; }
          return clone;
        };
        Save._releaseNormalizePatched=true;
      }
      Save.downloadExport=function(filename='lifesim-save.json'){
        try{
          const blob=new Blob([JSON.stringify(this.exportAll(),null,2)],{type:'application/json'});
          const url=URL.createObjectURL(blob); const a=document.createElement('a');
          a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); return true;
        }catch(e){ console.warn('Export download failed',e); UI?.toast?.('Export failed.','bad'); return false; }
      };
    }
  }

  function updateVisibleVersion(){
    document.title='LifeSim';
    const app=document.getElementById('app');
    app?.setAttribute('data-version','release'); app?.setAttribute('data-build',BUILD); document.body.classList.add('release-polish','release-clean-hubs','release-ui-cleanup');
    const metaDesc=document.querySelector('meta[name="description"]');
    if(metaDesc)metaDesc.setAttribute('content','LifeSim — age-aware life simulation with choices, consequences, relationships and legacy.');
    const appName=document.querySelector('meta[name="application-name"]'); if(appName)appName.setAttribute('content','LifeSim');
    document.querySelectorAll('.ver-badge,.create-version').forEach(el=>{
      const t=el.textContent||'';
      if(/v\d+(?:\.\d+)*/i.test(t))el.textContent=t.replace(/v\d+(?:\.\d+)*/gi,'release');
    });
    const splashBadge=document.querySelector('#splash-screen .splash-logo .ver-badge'); if(splashBadge)splashBadge.textContent='LifeSim';
    const foot=document.querySelector('.splash-foot'); if(foot)foot.textContent='LifeSim · made by tommyy.fit';
    const deathBadge=document.querySelector('#death-screen .ver-badge'); if(deathBadge)deathBadge.textContent='release Life Summary';
  }

  function removePromotedTabs(){
    PROMOTED.forEach(id=>{
      document.querySelectorAll(`.nav-bar .nt[data-tab="${id}"]`).forEach(el=>el.remove());
      document.querySelectorAll(`.content-area > .tab-panel#tab-${id}`).forEach(el=>el.remove());
    });
    const kbHint=[...document.querySelectorAll('.settings-lbl')].find(el=>el.textContent.includes('KEYBOARD:'));
    if(kbHint)kbHint.innerHTML='KEYBOARD: <kbd>Space</kbd>/<kbd>Enter</kbd> = Age Up &nbsp; <kbd>1-9</kbd> = First 9 tabs';
  }

  function ensureHustleTab(){
    const nav=document.querySelector('.nav-bar'); const content=document.querySelector('.content-area');
    if(nav&&!nav.querySelector('[data-tab="hustle"]')){
      const btn=document.createElement('button'); btn.type='button'; btn.className='nt'; btn.dataset.tab='hustle'; btn.setAttribute('onclick',"UI.tab('hustle')");
      btn.innerHTML='<span class="ni" aria-hidden="true">⚡</span><span class="nl">Hustle</span><span class="tab-dot" id="dot-hustle"></span>';
      const biz=nav.querySelector('[data-tab="business"]'); biz?.after(btn) || nav.appendChild(btn);
    }
    if(content&&!document.getElementById('tab-hustle')){
      const panel=document.createElement('div'); panel.id='tab-hustle'; panel.className='tab-panel';
      const bizPanel=document.getElementById('tab-business'); bizPanel?.after(panel) || content.appendChild(panel);
    }
  }

  function renderDirectTab(ui,name){
    if(name==='life')ui.renderLog();
    else if(name==='mind')ui.renderMind();
    else if(name==='love'&&typeof Relations!=='undefined')Relations.render();
    else if(name==='career'&&typeof Career!=='undefined')Career.render();
    else if(name==='assets'&&typeof Assets!=='undefined')Assets.render();
    else if(name==='health'&&typeof Health!=='undefined')Health.render();
    else if(name==='crime'&&typeof Crime!=='undefined')Crime.render();
    else if(name==='social'&&typeof Social!=='undefined')Social.render();
    else if(name==='business'&&typeof Business!=='undefined')Business.render();
    else if(name==='hustle'&&typeof Hustle!=='undefined')Hustle.render();
    else if(name==='pets'&&typeof Pets!=='undefined')Pets.render();
    else if(name==='skills'&&typeof Skills!=='undefined')Skills.render();
    else if(name==='stocks'&&typeof Stocks!=='undefined')Stocks.render();
    else if(name==='goals'&&typeof Goals!=='undefined')Goals.render();
  }

  function subHubIntro(parent){
    const G=window.G||{};
    if(parent==='love')return '';
    if(parent==='career')return `<div class="legacy-ui-bridge-card"><b>💼 Advanced career paths</b><span>Sports and Military are optional career routes inside the Career tab.</span></div>`;
    if(parent==='mind')return '';
    if(parent==='crime')return '';
    return '';
  }

  function renderEmbeddedSystems(parent){
    const items=SYSTEMS[parent]; if(!items?.length)return;
    const host=document.getElementById('tab-'+parent); if(!host)return;
    if(parent==='love'||parent==='mind'){
      host.querySelectorAll('#tab-family,#tab-travel,.legacy-ui-subhub[data-parent="love"],.legacy-ui-subhub[data-parent="mind"]').forEach(n=>n.remove());
      return;
    }
    const activeKey=OPEN[parent];
    const active=items.find(i=>i.key===activeKey&&i.ready());
    const buttons=items.map(item=>{
      const disabled=!item.ready(); const isOpen=item.key===activeKey&&!disabled;
      return `<button type="button" class="legacy-ui-subtoggle${isOpen?' is-open':''}" ${disabled?'disabled':''} onclick="UI.openSubSystem('${parent}','${item.key}')" aria-expanded="${isOpen?'true':'false'}">
        <span class="legacy-ui-subico" aria-hidden="true">${item.icon}</span>
        <span class="legacy-ui-submeta"><span class="legacy-ui-subname">${esc(item.title)}</span><span class="legacy-ui-subdesc">${esc(item.desc)}</span></span>
        <span class="legacy-ui-subchev" aria-hidden="true">⌄</span>
      </button>`;
    }).join('');
    host.insertAdjacentHTML('beforeend', `${subHubIntro(parent)}<section class="legacy-ui-subhub" data-parent="${parent}">
      <div class="legacy-ui-subhead"><div><div class="legacy-ui-kicker">Advanced path</div><div class="legacy-ui-subtitle">Expand when you want this route</div></div><div class="legacy-ui-subhint">Optional</div></div>
      <div class="legacy-ui-subgrid">${buttons}</div>${active?`<div class="legacy-ui-subbody" id="${active.target}"></div>`:''}
    </section>`);
    if(active)requestAnimationFrame(()=>safe('embedded render '+active.key,()=>{active.render(); UI?.enhanceInteractive?.(document.getElementById(active.target));}));
  }

  function patchAppAndUI(){
    if(typeof App!=='undefined'){
      const oldEnsure=App.ensureDynamicTabs?.bind(App);
      App.ensureDynamicTabs=function(){ if(oldEnsure)oldEnsure(); ensureHustleTab(); removePromotedTabs(); };
      App._bindShortcuts=function(){
        document.addEventListener('keydown',e=>{
          if(typeof UI!=='undefined'&&UI.handleGlobalKeydown?.(e))return;
          const active=document.getElementById('game-screen')?.classList.contains('active');
          const typing=e.target?.matches?.('input,textarea,select,button,[contenteditable="true"],[contenteditable=""]')||e.target?.isContentEditable;
          const modalOpen=!!document.querySelector('.modal-bg.open,.modal.open,[role="dialog"].open'); if(modalOpen)return;
          if((e.code==='Space'||e.code==='Enter')&&this._ageShortcutHeld)return;
          if((e.code==='Space'||e.code==='Enter')&&active&&!typing){ this._ageShortcutHeld=true; e.preventDefault(); Engine?.ageUp?.(); }
          const n=parseInt(e.key,10); if(n>=1&&n<=9&&active&&!typing){ const tab=BASE_TABS[n-1]; if(tab)UI?.tab?.(tab); }
        });
        document.addEventListener('keyup',e=>{ if(e.code==='Space'||e.code==='Enter')this._ageShortcutHeld=false; });
        window.addEventListener('blur',()=>{this._ageShortcutHeld=false;});
      };
    }

    if(typeof UI!=='undefined'){
      const oldTab=UI.tab?.bind(UI);
      UI.tab=function(name){ if(REMAP[name]){ OPEN[REMAP[name]]=name; name=REMAP[name]; } return oldTab?oldTab(name):undefined; };
      UI._renderTab=function(name){
        if(REMAP[name]){ OPEN[REMAP[name]]=name; name=REMAP[name]; }
        try{ renderDirectTab(this,name); injectFamilyUX(name); injectLoveHealthUX(name); injectAssetsUX(name); injectCareerUX(name); injectHustleUX(name); renderEmbeddedSystems(name); }
        catch(e){ console.warn('[LifeSim] tab render failed:',name,e); this.toast?.('Screen recovered after a render issue.','neutral'); }
      };
      UI.openSubSystem=function(parent,key){
        const item=(SYSTEMS[parent]||[]).find(i=>i.key===key);
        if(!item||!item.ready()){ this.toast?.('This path is not available right now.','neutral'); return; }
        OPEN[parent]=OPEN[parent]===key?null:key; this._renderTab(parent);
        requestAnimationFrame(()=>{ (document.querySelector('.legacy-ui-subtoggle.is-open')||document.getElementById(item.target))?.scrollIntoView?.({behavior:'smooth',block:'nearest'}); });
      };
      UI._isPrisonAllowedTab=function(name){ if(REMAP[name])name=REMAP[name]; return ['life','crime','goals'].includes(name); };
    }
  }

  function ambitionProgress(G){
    const id=G?.ambition; if(!id)return null;
    const amb=(typeof LIFE_AMBITIONS!=='undefined'?LIFE_AMBITIONS:[]).find(a=>a.id===id); if(!amb)return null;
    let pct=0, detail=amb.desc||'';
    const nw=net(G);
    const skillVals=Object.values(G.skills||{});
    const stockVal=(()=>{try{return typeof stockPortfolioValue==='function'?stockPortfolioValue(G):0;}catch(_){return 0;}})();
    if(id==='wealth')pct=nw/10000000*100;
    else if(id==='fame')pct=(G.followers||0)/500000*100;
    else if(id==='family'){ const kids=(G.rels?.children||[]).length; pct=((G.rels?.partner?.married?45:0)+Math.min(55,kids/3*55)); detail=`${G.rels?.partner?.married?'Married':'Not married'} · ${kids}/3 children`; }
    else if(id==='career_top')pct=['ceo','surgeon','judge'].includes(G.career?.id)?100:Math.min(90,((G.promotionCount||0)*18)+(G.career?25:0)+(G.education==='university'?20:0));
    else if(id==='criminal')pct=Math.min(100,((G.crimes||[]).length/10)*100);
    else if(id==='healthy')pct=Math.min(100,((G.age||0)/85*60)+((G.health||0)>=70?40:(G.health||0)/70*40));
    else if(id==='traveller')pct=(G.countriesVisited||[]).length/15*100;
    else if(id==='entrepreneur')pct=(G.business?.value||0)/100000000*100;
    else if(id==='sage')pct=skillVals.filter(v=>v>=5).length/3*100;
    else if(id==='investor')pct=stockVal/500000*100;
    else if(id==='renaissance')pct=skillVals.filter(v=>v>=2).length/5*100;
    else if(id==='academic')pct=(G.education==='university'?55:0)+Math.min(45,(G.smarts||0)/95*45);
    else if(id==='philanthropist')pct=(G.lifetimeDonated||0)/1000000*100;
    else if(id==='legend')pct=((G.fame||0)/90*50)+((G.happiness||0)/90*50);
    else if(id==='mindful')pct=((G.age||0)/60*34)+((G.mentalHealth||0)/80*33)+((100-(G.stress||0))/80*33);
    else if(id==='cyber_pioneer')pct=(((G.skills?.ai_ml||0)/4)*32)+(((G.skills?.crypto||0)/3)*32)+((((G.hustle?.earnings||0)+(G.money||0))/2000000)*36);
    else if(id==='minimalist')pct=((G.age||0)/70*40)+((G.happiness||0)/80*30)+((100-(G.stress||0))/75*30);
    return {amb,pct:clamp(Math.round(pct)),detail};
  }

  function yearlySummaryHTML(G){
    // release: removed the large yearly progress report card from the Life tab.
    // The raw yearly summary data can still exist internally for future systems.
    return '';
  }

  function ambitionHTML(G){
    const p=ambitionProgress(G); if(!p)return'';
    const achieved=!!G.ambitionAchieved;
    return `<section class="legacy-ui-ambition-card ${achieved?'done':''}">
      <div class="legacy-ui-ambition-main"><div class="legacy-ui-ambition-ico">${esc(p.amb.icon||'🎯')}</div><div><div class="legacy-ui-kicker">Life Ambition</div><h3>${esc(p.amb.name)}</h3><p>${esc(p.detail||p.amb.desc)}</p></div><strong>${achieved?'DONE':p.pct+'%'}</strong></div>
      <div class="legacy-ui-progress"><i style="width:${achieved?100:p.pct}%"></i></div>
    </section>`;
  }


  function patchEconomyBalance(){
    if(window._releaseEconomyBalanced)return; window._releaseEconomyBalanced=true;
    window.LifeEconomy={bands:ECONOMY.bands,balanceReward,economyBand};
    if(typeof Hustle!=='undefined'){
      Hustle.VERSION=1;
      const oldDoGig=Hustle.doGig?.bind(Hustle);
      if(oldDoGig&&!Hustle._releaseBalanceGig){
        Hustle.doGig=function(id){
          const G=window.G; const before=G?G.money||0:0;
          const out=oldDoGig(id);
          if(G&&G.money>before){
            const raw=G.money-before; const balanced=balanceReward(raw,'quickGig');
            if(balanced!==raw){ G.money=before+balanced; if(G.hustle)G.hustle.earnings=Math.max(0,(G.hustle.earnings||0)-raw+balanced); Engine?.log?.(`⚖️ Economy balance adjusted quick gig payout to ${money(balanced)}.`,'neutral'); UI?.update?.(); Hustle.render?.(); }
          }
          return out;
        };
        Hustle._releaseBalanceGig=true;
      }
      const oldWork=Hustle.workVenture?.bind(Hustle);
      if(oldWork&&!Hustle._releaseBalanceWork){
        Hustle.workVenture=function(id){
          const G=window.G; const before=G?G.money||0:0;
          const out=oldWork(id);
          if(G&&G.money>before){
            const raw=G.money-before; const balanced=balanceReward(raw,'ventureWork');
            if(balanced!==raw){ G.money=before+balanced; if(G.hustle)G.hustle.earnings=Math.max(0,(G.hustle.earnings||0)-raw+balanced); Engine?.log?.(`⚖️ Economy balance adjusted venture work payout to ${money(balanced)}.`,'neutral'); UI?.update?.(); Hustle.render?.(); }
          }
          return out;
        };
        Hustle._releaseBalanceWork=true;
      }
      const oldAnnual=Hustle._ventureAnnualPayout?.bind(Hustle);
      if(oldAnnual&&!Hustle._releaseBalanceAnnual){
        Hustle._ventureAnnualPayout=function(v,def,G){ return balanceReward(oldAnnual(v,def,G),'venturePassive'); };
        Hustle._releaseBalanceAnnual=true;
      }
    }
    if(typeof Sports!=='undefined')Sports.VERSION=1;
    if(typeof Military!=='undefined')Military.VERSION=1;
    if(typeof Assets!=='undefined')Assets.VERSION=1;
    if(typeof Business!=='undefined')Business.VERSION=1;
  }

  function patchYearlySummary(){
    if(typeof Engine!=='undefined'&&!Engine._releaseAgePatched){
      const oldAge=Engine.ageUp?.bind(Engine);
      if(oldAge){
        Engine.ageUp=function(){
          const G=window.G;
          if(G&&G.alive&&!this._aging){
            window.CoreSystems._beforeAge={age:G.age,serial:G.ageUpSerial||0,money:G.money||0,netWorth:net(G),happiness:G.happiness,health:G.health,smarts:G.smarts,looks:G.looks,fitness:G.fitness||50,stress:G.stress||0,fame:G.fame||0,karma:G.karma||0,mentalHealth:G.mentalHealth||60,reputation:G.reputation||50,logLen:(G.log||[]).length};
          }
          return oldAge();
        };
        Engine._releaseAgePatched=true;
      }
      if(Array.isArray(Engine._moduleOrder)&&!Engine._moduleOrder.includes('CoreSystems.tickLongTerm'))Engine._moduleOrder.splice(2,0,'CoreSystems.tickLongTerm');
    }
    if(typeof UI!=='undefined'&&!UI._releaseUpdateSummaryPatched){
      const oldUpdate=UI.update?.bind(UI);
      UI.update=function(){
        const out=oldUpdate?oldUpdate():undefined;
        safe('maybe yearly summary',()=>window.CoreSystems.maybeBuildYearlySummary());
        return out;
      };
      const oldRenderLog=UI.renderLog?.bind(UI);
      UI.renderLog=function(){
        const out=oldRenderLog?oldRenderLog():undefined;
        requestAnimationFrame(()=>{
          const G=window.G; const el=document.getElementById('tab-life'); if(!G||!el||!el.classList.contains('active'))return;
          el.querySelector('.legacy-ui-year-summary')?.remove(); el.querySelector('.legacy-ui-ambition-card')?.remove();
          const anchor=el.querySelector('.life-log-actions')||el.firstElementChild;
          const html=yearlySummaryHTML(G);
          if(anchor&&html)anchor.insertAdjacentHTML('beforebegin',html); else if(html)el.insertAdjacentHTML('afterbegin',html);
          const list=el.querySelector('.log-list'); if(list){list.style.gridTemplateColumns='minmax(0,1fr)'; list.style.maxWidth='none'; list.style.width='100%';}
        });
        return out;
      };
      UI._releaseUpdateSummaryPatched=true;
    }
  }

  function buildYearlySummary(G,before){
    const after={money:G.money||0,netWorth:net(G),happiness:G.happiness,health:G.health,smarts:G.smarts,looks:G.looks,fitness:G.fitness||50,stress:G.stress||0,fame:G.fame||0,karma:G.karma||0,mentalHealth:G.mentalHealth||60,reputation:G.reputation||50};
    const labels={happiness:'Happiness',health:'Health',smarts:'Smarts',looks:'Looks',fitness:'Fitness',stress:'Stress',fame:'Fame',karma:'Karma',mentalHealth:'Mind',reputation:'Rep'};
    const statDeltas=Object.keys(labels).map(k=>({key:k,label:labels[k],val:Math.round(after[k]-num(before[k])),good:k==='stress'?after[k]-num(before[k])<=0:after[k]-num(before[k])>=0}))
      .filter(d=>Math.abs(d.val)>=2).sort((a,b)=>Math.abs(b.val)-Math.abs(a.val)).slice(0,7);
    const currentLogs=(G.log||[]).filter(x=>x.age===G.age).slice(0,12);
    const big=currentLogs.find(x=>x.type==='special')||currentLogs.find(x=>x.type==='bad')||currentLogs.find(x=>x.type==='money')||currentLogs[0];
    let riskLabel='Stable', riskTone='good', riskDetail='Low pressure';
    if((G.health||0)<30||((G.stress||0)>82)){riskLabel='High pressure'; riskTone='bad'; riskDetail='Health/stress risk';}
    else if((G.stress||0)>58||(G.crimeHeat||0)>55||(G.gangHeat||0)>55){riskLabel='Watch carefully'; riskTone='warn'; riskDetail='Stress or heat rising';}
    const moneyDelta=Math.round(after.money-num(before.money));
    const netWorthDelta=Math.round(after.netWorth-num(before.netWorth));
    const summary={age:G.age,serial:G.ageUpSerial||0,moneyDelta,netWorthDelta,netWorthAfter:Math.round(after.netWorth),statDeltas,bigMoment:big?.rawText||big?.text||'',bigType:big?.type||'life',riskLabel,riskTone,riskDetail,createdAt:Date.now()};
    summary.cashFlow=[
      {label:'Cashflow',value:deltaText(moneyDelta),tone:moneyTone(moneyDelta)},
      {label:'Wealth trend',value:deltaText(netWorthDelta),tone:moneyTone(netWorthDelta)},
      {label:'Events',value:`${currentLogs.length} logged`,tone:'neutral'},
      {label:'Focus',value:riskTone==='bad'?'defense':riskTone==='warn'?'control':'growth',tone:riskTone}
    ];
    summary.focus=summaryFocus(G,summary);
    return summary;
  }

  function patchAchievementUX(){
    if(typeof App!=='undefined'&&!App._releaseAchievementsPatched){
      App._releaseAchFilter='all'; App._releaseAchSearch='';
      App.showAchievements=function(){
        const unlocked=Save.unlockedAchs(); const total=ACHIEVEMENTS.length; const pct=Math.round(unlocked.length/Math.max(1,total)*100);
        const body=document.getElementById('ach-body'); if(!body)return;
        const counts=['common','rare','epic','legendary'].reduce((acc,r)=>{acc[r]=ACHIEVEMENTS.filter(a=>normalizeRarity(a)===r).length; return acc;},{});
        const filters=[['all','All'],['unlocked','✅ Unlocked'],['locked','🔒 Locked'],['common','Common'],['rare','Rare'],['epic','Epic'],['legendary','Legendary']];
        const q=String(this._releaseAchSearch||'').trim().toLowerCase();
        const list=ACHIEVEMENTS.filter(a=>{
          const done=unlocked.includes(a.id); const f=this._releaseAchFilter||'all'; const rarity=normalizeRarity(a);
          const text=`${a.name||''} ${a.desc||''} ${rarity}`.toLowerCase();
          const filterOk=f==='all'||(f==='unlocked'&&done)||(f==='locked'&&!done)||f===rarity;
          return filterOk&&(!q||text.includes(q));
        });
        const recent=unlocked.slice(-5).reverse().map(id=>ACHIEVEMENTS.find(a=>a.id===id)).filter(Boolean);
        body.innerHTML=`<div class="legacy-ui-ach-top"><div><div class="legacy-ui-kicker">Trophy Room</div><h2>🎖️ ${unlocked.length} / ${total} unlocked</h2><p>${pct}% complete · Common ${counts.common||0} · Rare ${counts.rare||0} · Epic ${counts.epic||0} · Legendary ${counts.legendary||0}</p></div><div class="legacy-ui-ring" style="--p:${pct}"><span>${pct}%</span></div></div>
        <div class="legacy-ui-ach-toolbar"><input id="legacy-ui-ach-search" type="search" placeholder="Search achievements..." value="${attr(this._releaseAchSearch||'')}" oninput="App._releaseAchSearch=this.value;App.showAchievements()"><div class="legacy-ui-ach-filters">${filters.map(([id,label])=>`<button type="button" class="${(this._releaseAchFilter||'all')===id?'active':''}" onclick="App._releaseAchFilter='${id}';App.showAchievements()">${label}</button>`).join('')}</div></div>
        ${recent.length?`<div class="legacy-ui-recent-ach"><b>Recently unlocked</b>${recent.map(a=>`<span>${esc(a.icon)} ${esc(a.name)}</span>`).join('')}</div>`:''}
        <div class="legacy-ui-ach-grid">${list.map((a,i)=>{
          const done=unlocked.includes(a.id); const rarity=normalizeRarity(a);
          return `<article class="ach-card legacy-ui-ach-card ${done?'unlocked':'locked'} rarity-${rarity}" style="animation-delay:${Math.min(i,18)*0.025}s" title="${done?attr(a.desc):'Locked'}"><div class="ach-ico">${done?esc(a.icon):'❓'}</div><div class="ach-info"><div class="ach-name">${done?esc(a.name):'Hidden Achievement'}</div><div class="ach-desc">${done?esc(a.desc):'Complete more lives to discover this.'}</div><span class="legacy-ui-rarity ${rarity}">${rarity}</span></div><div class="legacy-ui-ach-state">${done?'✅':'🔒'}</div></article>`;
        }).join('')}</div>`;
        this.show('ach-screen');
        requestAnimationFrame(()=>document.getElementById('legacy-ui-ach-search')?.focus?.({preventScroll:true}));
      };
      App._releaseAchievementsPatched=true;
    }
    if(typeof UI!=='undefined'&&!UI._releaseAchPopupPatched){
      UI.achievementPopup=function(ach){
        if(!ach)return; this.toast(`🎖️ Achievement unlocked: ${ach.name}!`,'ach',4200);
        const rarity=normalizeRarity(ach);
        const pop=document.createElement('div'); pop.className='legacy-ui-ach-pop rarity-'+rarity;
        pop.innerHTML=`<div class="legacy-ui-ach-pop-ico">${esc(ach.icon||'🎖️')}</div><div><b>${esc(ach.name||'Achievement')}</b><span>${esc(ach.desc||'Unlocked')}</span><em>${esc(rarity)}</em></div>`;
        document.body.appendChild(pop); setTimeout(()=>pop.classList.add('show'),20); setTimeout(()=>{pop.classList.remove('show'); setTimeout(()=>pop.remove(),450);},4000);
      };
      UI._releaseAchPopupPatched=true;
    }
  }

  function effectHTML(e,longTerm){
    const labels={money:'Money',happiness:'Happy',health:'Health',smarts:'Smarts',looks:'Looks',fitness:'Fitness',stress:'Stress',fame:'Fame',karma:'Karma',reputation:'Rep',mentalHealth:'Mind'};
    const parts=[];
    Object.entries(e||{}).forEach(([k,v])=>{ if(typeof v!=='number'||v===0||!labels[k])return; const good=k==='stress'?v<0:v>0; const value=k==='money'?deltaText(v):`${v>0?'+':''}${v}`; parts.push(`<span class="legacy-ui-fx ${good?'good':'bad'}">${statIcon(k)} ${esc(labels[k])} ${value}</span>`); });
    if(longTerm?.label)parts.push(`<span class="legacy-ui-fx long">⏳ ${esc(longTerm.label)} · ${longTerm.years||2}y</span>`);
    return parts.length?`<div class="legacy-ui-choice-fx">${parts.join('')}</div>`:'';
  }

  function patchDecisionEvents(){
    if(typeof UI!=='undefined'&&!UI._releaseEventPatched){
      UI.showEvent=function(evt,cb){
        const icon=document.getElementById('m-ico'), title=document.getElementById('m-title'), text=document.getElementById('m-text'), ch=document.getElementById('m-choices'), modal=document.getElementById('ev-modal');
        if(icon)icon.textContent=evt.icon||'✨'; if(title)title.textContent=evt.title||'Event'; if(text)text.textContent=evt.text||'';
        if(!ch||!modal)return; modal.classList.add('legacy-ui-decision-modal','legacy-ui-decision-2'); ch.innerHTML='';
        const choices=evt.choices?.length?evt.choices:[{t:'Continue',e:{}}];
        choices.forEach((c,idx)=>{
          const btn=document.createElement('button'); btn.className='choice-btn legacy-ui-choice-btn'+(c.danger?' danger':'');
          const label=c.label||c.t||'Continue'; const sub=c.sub||c.preview||'Choose this path';
          btn.innerHTML=`<span class="choice-num">${idx+1}</span><span class="choice-label">${esc(label)}</span><span class="choice-sub">${esc(sub)}</span>${choiceMetaHTML(c)}${effectHTML(c.e||{},c.longTerm||c.long)}`;
          btn.onclick=()=>{
            try{
              const before=window.G?{money:window.G.money,health:window.G.health,happiness:window.G.happiness,stress:window.G.stress}:null;
              if(typeof c.fn==='function')c.fn(); else applyEffect(window.G,c.e||{});
              if(c.longTerm||c.long)window.CoreSystems.addLongEffect(c.longTerm||c.long);
              if(window.G&&before){ window.G.lastDecision={age:window.G.age,title:evt.title,label,moneyDelta:Math.round((window.G.money||0)-(before.money||0)),stressDelta:Math.round((window.G.stress||0)-(before.stress||0))}; }
              Engine?.log?.(`${evt.icon||'•'} ${evt.title} — ${label}`,evt.type||'neutral');
            }catch(err){ console.warn(err); }
            UI.closeAnyModal(modal); UI.update(); if(cb)cb();
          };
          ch.appendChild(btn);
        });
        this.openModal(modal);
      };
      UI._releaseEventPatched=true;
    }
    if(typeof Engine!=='undefined'&&!Engine._releaseContextEventsPatched){
      const oldQueue=Engine._queueEvents?.bind(Engine);
      Engine._queueEvents=function(queue){
        if(oldQueue)oldQueue(queue);
        const G=window.G; if(!G||!queue||G.age<18||G.inPrison)return;
        const gap=(G.age||0)-(G.releaseContextEventAge||-99);
        const ambitionBoost=(G.ambition&&!G.ambitionAchieved)?0.06:0;
        if(gap<2||Math.random()>(.34+ambitionBoost))return;
        const evt=window.CoreSystems.pickContextEvent(G);
        if(evt){ G.releaseContextEventAge=G.age; queue.push(evt); }
      };
      Engine._releaseContextEventsPatched=true;
    }
  }

  function pickContextEvent(G){
    const pool=[];
    if(G.career)pool.push({icon:'💼',type:'career',title:'Career Crossroads',text:'Your boss offers a path that could accelerate your career, but it will affect your lifestyle.',choices:[
      {t:'🚀 Take the promotion track',sub:'More money and reputation, but higher burnout pressure.',e:{money:balanceReward(14000,'yearlyEvent'),smarts:3,stress:10,reputation:4},longTerm:{id:'career_pressure',label:'Promotion pressure',years:3,e:{stress:2,money:balanceReward(3500,'yearlyEvent')}}},
      {t:'🧘 Protect balance',sub:'Slower growth, better health and mental stability.',e:{happiness:6,stress:-8,health:3,mentalHealth:4}},
      {t:'🕸️ Network quietly',sub:'Build options without overcommitting.',e:{reputation:8,smarts:2,fame:1,stress:1}}
    ]});
    if(G.rels?.partner||((G.rels?.children||[]).length>0))pool.push({icon:'👨‍👩‍👧',type:'family',title:'Family Pressure Point',text:'Someone close to you needs more time and support. Ignoring it could damage the relationship long term.',choices:[
      {t:'❤️ Be fully present',sub:'Invest time into family and lower future stress.',e:{happiness:8,stress:-4,money:balanceReward(-1200,'yearlyEvent'),karma:5},longTerm:{id:'family_bond',label:'Stronger family bond',years:4,e:{happiness:1,stress:-1}}},
      {t:'💼 Focus on work instead',sub:'Money now, relationship strain later.',e:{money:balanceReward(9500,'yearlyEvent'),stress:5,happiness:-4},longTerm:{id:'family_distance',label:'Family distance',years:3,e:{happiness:-2,stress:1}}},
      {t:'🗣️ Have an honest talk',sub:'Balanced outcome, smaller but safer reward.',e:{happiness:4,smarts:2,karma:2,stress:-2}}
    ]});
    if(G.business)pool.push({icon:'🏢',type:'business',title:'Business Ethics Test',text:'Your business finds a shortcut that could raise profit, but it may hurt trust and increase audit pressure.',choices:[
      {t:'📈 Push aggressive growth',sub:'High reward, higher audit and reputation risk.',e:{money:balanceReward(38000,'yearlyEvent'),stress:8,karma:-6,reputation:-4},longTerm:{id:'audit_shadow',label:'Audit shadow',years:3,e:{stress:2,reputation:-1}}},
      {t:'🛡️ Build clean systems',sub:'Less profit now, safer scale later.',e:{money:balanceReward(-6000,'yearlyEvent'),stress:-4,reputation:8,karma:5},longTerm:{id:'clean_operations',label:'Clean operations',years:4,e:{reputation:1,stress:-1}}},
      {t:'🤝 Ask mentors first',sub:'Moderate, smarter path.',e:{smarts:5,reputation:3,stress:-1}}
    ]});
    if((G.crimeHeat||0)>30||G.gang)pool.push({icon:'🚔',type:'bad',title:'Underworld Consequence',text:'The pressure around your criminal activity is becoming harder to ignore.',choices:[
      {t:'🧊 Disappear for a while',sub:'Heat down, momentum lost.',e:{stress:-6,happiness:-2},fn:()=>{G.crimeHeat=clamp((G.crimeHeat||0)-22);G.gangHeat=clamp((G.gangHeat||0)-8);G.crimeStreak=0;}},
      {t:'⚖️ Lawyer up',sub:'Costs cash, reduces danger.',e:{money:balanceReward(-14000,'yearlyEvent'),stress:-3},fn:()=>{G.money=Math.max(0,(G.money||0)-14000);G.lawyerRetainer=Math.min(3,(G.lawyerRetainer||0)+1);G.crimeHeat=clamp((G.crimeHeat||0)-8);}},
      {t:'😈 Double down',sub:'Rep up, future police attention.',e:{karma:-8,stress:8},fn:()=>{G.underworldRep=clamp((G.underworldRep||0)+12);G.crimeHeat=clamp((G.crimeHeat||0)+14);G.gangTrust=clamp((G.gangTrust||0)+5);},longTerm:{id:'police_attention',label:'Police attention',years:3,e:{stress:2,karma:-1}}}
    ]});
    if((G.assets?.properties||[]).length>0)pool.push({icon:'🏠',type:'money',title:'Asset Management Choice',text:'Your property portfolio needs attention. You can optimize cashflow, reduce risk, or ignore maintenance.',choices:[
      {t:'🔧 Maintain properly',sub:'Costs now, protects value and stress.',e:{money:balanceReward(-8000,'yearlyEvent'),stress:-3,reputation:2},longTerm:{id:'asset_quality',label:'Well-kept assets',years:4,e:{happiness:1,stress:-1}}},
      {t:'📈 Optimize cashflow',sub:'More cash, slightly lower reputation.',e:{money:balanceReward(16000,'yearlyEvent'),karma:-3,reputation:-2}},
      {t:'😴 Defer maintenance',sub:'No cost now, higher future risk.',e:{stress:3},longTerm:{id:'deferred_maintenance',label:'Deferred maintenance',years:3,e:{stress:2,happiness:-1}}}
    ]});
    if(G.ambition&&!G.ambitionAchieved)pool.push({icon:'🎯',type:'special',title:'Ambition Checkpoint',text:'A quiet year gives you time to decide what kind of life you are really building.',choices:[
      {t:'🎯 Focus on ambition',sub:'Direct your next year toward the main goal.',e:{happiness:5,smarts:3,stress:-2,reputation:2}},
      {t:'💰 Build cash reserves',sub:'More safety, slightly more pressure.',e:{money:balanceReward(9000,'yearlyEvent'),stress:2}},
      {t:'❤️ Protect health',sub:'Best long-term survival choice.',e:{health:5,fitness:3,stress:-4,mentalHealth:3}}
    ]});
    return pool[Math.floor(Math.random()*pool.length)];
  }

  function patchLongTermEffects(){
    window.CoreSystems.addLongEffect=function(effect){
      const G=window.G; if(!G||!effect)return;
      if(!Array.isArray(G.longTermEffects))G.longTermEffects=[];
      const clean={id:effect.id||('effect_'+Date.now()),label:effect.label||'Long-term effect',years:Math.max(1,Math.round(effect.years||2)),e:effect.e||{},startedAge:G.age||0,lastAge:null};
      G.longTermEffects.push(clean); G.longTermEffects=G.longTermEffects.slice(-12);
      Engine?.log?.(`⏳ Long-term consequence started: ${clean.label} (${clean.years}y).`,'special');
    };
    window.CoreSystems.tickLongTerm=function(){
      const G=window.G; if(!G||!Array.isArray(G.longTermEffects))return;
      const keep=[];
      G.longTermEffects.forEach(e=>{
        if(e.lastAge===(G.age||0)){ keep.push(e); return; }
        e.lastAge=G.age||0; applyEffect(G,e.e||{}); e.years=Math.max(0,(e.years||0)-1);
        if(e.years>0)keep.push(e); else Engine?.log?.(`✅ Long-term consequence ended: ${e.label}.`,'good');
      });
      G.longTermEffects=keep;
    };
  }

  function patchCrimeGangs(){
    if(typeof Crime==='undefined'||Crime._releaseGangPatched)return;
    Crime.VERSION=1;
    const oldEnsure=Crime._ensure?.bind(Crime);
    Crime._ensure=function(){ if(oldEnsure)oldEnsure(); const G=window.G; if(!G)return; if(!Number.isFinite(G.gangTrust))G.gangTrust=G.gang?20:0; if(!Number.isFinite(G.gangTerritory))G.gangTerritory=G.gang?10:0; if(!Number.isFinite(G.gangHeat))G.gangHeat=0; if(!Array.isArray(G.gangHistory))G.gangHistory=[]; };
    const oldRisk=Crime._risk?.bind(Crime);
    Crime._risk=function(job){ let risk=oldRisk?oldRisk(job):30; const G=window.G; const gang=G?.gang?.id?GANGS[G.gang.id]:null; if(gang){ risk+=gang.riskMod||0; risk+=Math.min(10,(G.gangHeat||0)*.12); const meta=gangRankMeta(G); risk-=meta.rank==='Underboss'?4:meta.rank==='Captain'?2:0; if(gang.specialty==='digital'&&job?.need==='hacking')risk-=6; if(gang.specialty==='heavy'&&job?.need==='fitness')risk-=4; if(gang.specialty==='finance'&&job?.need==='smarts')risk-=4; } return Math.round(clamp(risk,3,92)); };
    const oldPreview=Crime._previewReward?.bind(Crime);
    if(oldPreview){ Crime._previewReward=function(job){ let reward=oldPreview(job); const G=window.G; const gang=G?.gang?.id?GANGS[G.gang.id]:null; if(gang){reward=Math.round(reward*(gang.rewardMod||1)*(gangRankMeta(G).mult||1));} return balanceReward(reward,'crime'); }; }
    const oldReward=Crime._realReward?.bind(Crime);
    Crime._realReward=function(job){ let reward=oldReward?oldReward(job):0; const G=window.G; const gang=G?.gang?.id?GANGS[G.gang.id]:null; if(gang){ reward=Math.round(reward*(gang.rewardMod||1)*(gangRankMeta(G).mult||1)); if(gang.specialty==='digital'&&job?.need==='hacking')reward=Math.round(reward*1.08); if(gang.specialty==='reform')reward=Math.round(reward*.75); } return balanceReward(reward,'crime'); };
    const oldRender=Crime.render?.bind(Crime);
    Crime.render=function(){ const out=oldRender?oldRender():undefined; requestAnimationFrame(()=>window.CoreSystems.injectGangPanel()); return out; };
    const oldTick=Crime.tick?.bind(Crime);
    Crime.tick=function(){ const out=oldTick?oldTick():undefined; window.CoreSystems.gangPassiveTick(); return out; };
    Crime.joinGang=function(id){
      const G=window.G; if(!G)return; this._ensure?.(); const gang=GANGS[id]; if(!gang){UI?.toast?.('Unknown gang.','bad');return;} if((G.age||0)<18){UI?.toast?.('Gangs unlock at 18.','bad');return;} if(G.gang){UI?.toast?.('Leave your current gang first.','bad');return;}
      if((G.underworldRep||0)<gang.needRep){UI?.toast?.(`Need ${gang.needRep}% underworld rep.`, 'bad');return;} if((G.crimeIntel||0)<gang.needIntel){UI?.toast?.(`Need ${gang.needIntel}% intel.`, 'bad');return;}
      G.gang={id,rank:'Associate',joinedAge:G.age||0}; G.gangTrust=clamp(18+(gang.trustGain||6)); G.gangTerritory=clamp(gang.territoryStart||0); G.gangHeat=clamp((G.gangHeat||0)+8); G.stress=clamp((G.stress||0)+4); G.underworldRep=clamp((G.underworldRep||0)+6); G.gangHistory.push({age:G.age,label:`Joined ${gang.name}`});
      Engine?.log?.(`${gang.icon} Joined ${gang.name}. Trust ${G.gangTrust}%, territory ${G.gangTerritory}%.`,'special'); Engine?.checkAch?.(); this._refresh?.();
    };
    Crime.leaveGang=function(){ const G=window.G; if(!G?.gang){UI?.toast?.('You are not in a gang.','neutral');return;} const gang=GANGS[G.gang.id]; const name=gang?.name||'gang'; G.gang=null; G.gangTrust=0; G.gangTerritory=Math.max(0,(G.gangTerritory||0)-8); G.gangHeat=clamp((G.gangHeat||0)+18); G.stress=clamp((G.stress||0)+7); Engine?.log?.(`🚪 Left ${name}. Heat increased while you cut ties.`,'bad'); this._refresh?.(); };
    Crime.gangTask=function(kind){
      const G=window.G; if(!G?.gang){UI?.toast?.('Join a gang first.','bad');return;} const gang=GANGS[G.gang.id]; if(!gang)return; const meta=gangRankMeta(G);
      let text='',type='good';
      if(kind==='territory'){ const gain=Math.floor(Math.random()*8)+5+(meta.rank==='Captain'?2:0); G.gangTerritory=clamp((G.gangTerritory||0)+gain); G.gangTrust=clamp((G.gangTrust||0)+4); G.gangHeat=clamp((G.gangHeat||0)+6); text=`${gang.icon} Territory expanded by ${gain}%.`; }
      else if(kind==='network'){ const rep=Math.floor(Math.random()*6)+4; G.underworldRep=clamp((G.underworldRep||0)+rep); G.crimeIntel=clamp((G.crimeIntel||0)+8+(meta.rank==='Underboss'?4:0)); G.gangTrust=clamp((G.gangTrust||0)+5); text=`${gang.icon} Network strengthened. +${rep}% rep, intel improved.`; }
      else if(kind==='launder'){ const base=balanceReward(Math.round((2500+(G.gangTerritory||0)*180+(G.gangTrust||0)*120)*(meta.mult||1)),'crime'); G.money=(G.money||0)+base; G.gangHeat=clamp((G.gangHeat||0)+4); text=`${gang.icon} Cleaned side money: +${money(base)}.`; type='money'; }
      else if(kind==='rival'){ G.gangTrust=clamp((G.gangTrust||0)+8); G.gangTerritory=clamp((G.gangTerritory||0)+6); G.gangHeat=clamp((G.gangHeat||0)+14); G.stress=clamp((G.stress||0)+5); text=`⚔️ Rival move against ${gang.rival||'a crew'} raised trust and territory, but heat spiked.`; type='bad'; }
      else if(kind==='exit'){ G.gangTrust=clamp((G.gangTrust||0)-10); G.crimeHeat=clamp((G.crimeHeat||0)-12); G.gangHeat=clamp((G.gangHeat||0)-10); G.stress=clamp((G.stress||0)-5); text=`🕊️ Quiet exit planning lowered heat, but trust fell.`; }
      else { UI?.toast?.('Unknown gang task.','bad'); return; }
      G.gang.rank=gangRankMeta(G).rank; G.gangHistory.push({age:G.age,label:text}); G.gangHistory=G.gangHistory.slice(-12); Engine?.log?.(text,type); this._refresh?.();
    };
    Crime._releaseGangPatched=true;
  }

  function gangPanelHTML(){
    const G=window.G||{}; if((G.age||0)<18)return'';
    const current=G.gang?.id?GANGS[G.gang.id]:null;
    if(!current){
      return `<section class="legacy-ui-gang-panel"><div class="legacy-ui-card-head"><div><div class="legacy-ui-kicker">Underworld Networks</div><h3>🚔 Underworld Networks</h3><p>Join a network for perks, rank progression, territory income, rivals and long-term consequences.</p></div></div><div class="legacy-ui-gang-grid">${Object.entries(GANGS).map(([id,g])=>{
        const locked=(G.underworldRep||0)<g.needRep||(G.crimeIntel||0)<g.needIntel;
        return `<button type="button" class="legacy-ui-gang-card ${locked?'locked':''}" onclick="Crime.joinGang('${id}')"><b>${g.icon} ${esc(g.name)}</b><span>${esc(g.style)}</span><small>${esc(g.desc)}</small><em>${locked?`Need ${g.needRep}% rep · ${g.needIntel}% intel`:`Perk: ${esc(g.perk)}`}</em></button>`;
      }).join('')}</div></section>`;
    }
    const meta=gangRankMeta(G);
    return `<section class="legacy-ui-gang-panel active"><div class="legacy-ui-card-head"><div><div class="legacy-ui-kicker">Current Network</div><h3>${current.icon} ${esc(current.name)}</h3><p>${esc(current.style)} · Rival: ${esc(current.rival||'None')}</p></div><button type="button" onclick="Crime.leaveGang()">Leave</button></div>
      <div class="legacy-ui-gang-rank"><b>${esc(meta.rank)}</b><span>${esc(meta.bonus)}</span></div>
      <div class="legacy-ui-gang-stats"><span>Trust <b>${Math.round(G.gangTrust||0)}%</b></span><span>Territory <b>${Math.round(G.gangTerritory||0)}%</b></span><span>Gang Heat <b>${Math.round(G.gangHeat||0)}%</b></span><span>Perk <b>${esc(current.perk)}</b></span></div>
      <div class="legacy-ui-gang-actions"><button onclick="Crime.gangTask('network')">🕸️ Build Network</button><button onclick="Crime.gangTask('territory')">🗺️ Expand Territory</button><button onclick="Crime.gangTask('launder')">🧾 Clean Cash</button><button onclick="Crime.gangTask('rival')">⚔️ Rival Move</button><button onclick="Crime.gangTask('exit')">🕊️ Plan Exit</button></div>
      ${(G.gangHistory||[]).length?`<div class="legacy-ui-gang-history"><b>Recent network history</b>${G.gangHistory.slice(-4).reverse().map(h=>`<span>Age ${h.age}: ${esc(h.label)}</span>`).join('')}</div>`:''}
    </section>`;
  }

  function injectGangPanel(){
    const host=document.querySelector('#tab-crime .crime-ui'); if(!host||host.querySelector('.legacy-ui-gang-panel'))return;
    const anchor=host.querySelector('.stats')||host.querySelector('.actions')||host.firstElementChild;
    const html=gangPanelHTML(); if(!html)return;
    if(anchor)anchor.insertAdjacentHTML('afterend',html); else host.insertAdjacentHTML('afterbegin',html);
  }

  function gangPassiveTick(){
    const G=window.G; if(!G?.gang)return; const gang=GANGS[G.gang.id]; if(!gang)return;
    const meta=gangRankMeta(G); G.gang.rank=meta.rank;
    G.gangTrust=clamp((G.gangTrust||0)-1+(Math.random()<.25?2:0)); G.gangHeat=clamp((G.gangHeat||0)-3); G.gangTerritory=clamp((G.gangTerritory||0)-1);
    if((G.gangTerritory||0)>35&&Math.random()<.36){ const earn=balanceReward(Math.round((G.gangTerritory||0)*(G.gangTrust||0)*18*(gang.rewardMod||1)*(meta.mult||1)),'crime'); G.money=(G.money||0)+earn; Engine?.log?.(`${gang.icon} Gang territory produced ${money(earn)} this year.`,'money'); }
    if((G.gangHeat||0)>70&&Math.random()<.22){ G.crimeHeat=clamp((G.crimeHeat||0)+12); G.stress=clamp((G.stress||0)+8); Engine?.log?.(`🚨 Gang heat spilled into police attention.`,'bad'); }
    gangYearEvent(G,gang);
    G.gang.rank=gangRankMeta(G).rank;
  }

  function injectAssetsUX(name){
    if(name!=='assets')return;
    requestAnimationFrame(()=>{
      const G=window.G; const el=document.getElementById('tab-assets'); if(!G||!el||el.querySelector('.legacy-ui-assets-panel'))return;
      const props=G.assets?.properties||[], vehs=G.assets?.vehicles||[]; const loans=G.loans||[];
      const propValue=props.reduce((a,p)=>a+(p.value||0),0); const vehValue=vehs.reduce((a,v)=>a+(v.value||0),0); const debt=loans.reduce((a,l)=>a+(l.balance||l.remaining||l.amount||0),0);
      const rentals=props.filter(p=>(p.rent||0)>0); const rentIncome=rentals.reduce((a,p)=>a+(p.rent||0),0); const upkeep=Math.round((propValue*.012+vehValue*.045));
      const avgCond=[...props,...vehs].length?Math.round([...props,...vehs].reduce((a,x)=>a+(x.condition||75),0)/([...props,...vehs].length)):100;
      const debtRatio=propValue?Math.round(debt/propValue*100):0;
      const risk=debtRatio>65?'High debt':avgCond<55?'Maintenance risk':rentIncome>upkeep?'Positive cashflow':rentals.length?'Thin cashflow':'Stable';
      const move=assetBestMove(G,{debtRatio,rentIncome,upkeep,avgCond});
      el.insertAdjacentHTML('afterbegin',`${bestMoveCard('Asset strategy',move.move,move.why,move.tone,move.icon)}<section class="legacy-ui-assets-panel advisor-ui-assets-panel"><div><div class="legacy-ui-kicker">Portfolio Snapshot</div><h3>🏠 Ownership Dashboard</h3><p>${props.length} properties · ${vehs.length} vehicles · condition ${avgCond}% · debt ratio ${debtRatio}%</p></div><div class="legacy-ui-summary-grid"><div><span>Property value</span><b>${moneyFull(propValue)}</b></div><div><span>Vehicles</span><b>${moneyFull(vehValue)}</b></div><div><span>Rent / upkeep</span><b class="${rentIncome>=upkeep?'good':'warn'}">${moneyFull(rentIncome)} / ${moneyFull(upkeep)}</b></div><div><span>Risk</span><b>${esc(risk)}</b></div></div><div class="advisor-ui-asset-actions"><button type="button" onclick="Assets.serviceWeakest?.()">🔧 Fix weakest asset</button><button type="button" onclick="Assets.sellWeakestVehicle?.()">🚗 Sell weakest car</button><button type="button" onclick="Assets.invest?.('etf')">📈 Index fund move</button></div></section>`);
    });
  }


  /* release Final Polish — guidance, cleaner assets, calmer relationship health, achievements detail */
  function bestMoveCard(title, move, why, tone='good', icon='🧭'){
    return `<section class="advisor-ui-bestmove ${tone}"><div class="advisor-ui-bestmove-icon">${icon}</div><div><div class="legacy-ui-kicker">Best move this year</div><h3>${esc(title)}</h3><p><b>${esc(move)}</b> — ${esc(why)}</p></div></section>`;
  }

  function assetBestMove(G, ctx={}){
    const props=G.assets?.properties||[], vehs=G.assets?.vehicles||[], loans=G.loans||[];
    const cash=G.money||0;
    const debt=loans.reduce((a,l)=>a+(l.balance||l.remaining||l.amount||0),0)+(G.debtCollections||0);
    const propValue=props.reduce((a,p)=>a+(p.value||0),0);
    const rentIncome=props.reduce((a,p)=>a+(p.rent>0?Number(p.rent)||0:0),0);
    const weakProp=props.find(p=>(p.condition||80)<58);
    const weakVeh=vehs.find(v=>(v.condition||80)<55);
    if((G.debtCollections||0)>0)return {move:'Pay collections first',why:'collections damage credit and make every future asset more expensive',tone:'bad',icon:'💳'};
    if(debt>0&&propValue>0&&debt/Math.max(1,propValue)>0.62)return {move:'Reduce debt pressure',why:'your debt ratio is high, so scaling assets now adds too much risk',tone:'warn',icon:'🧯'};
    if(weakProp)return {move:`Maintain ${weakProp.name||'weak property'}`,why:'condition is low and can quietly destroy value, rent and stress',tone:'warn',icon:'🔧'};
    if(weakVeh)return {move:`Service or sell ${weakVeh.name||'weak vehicle'}`,why:'low-condition vehicles create upkeep without building wealth',tone:'warn',icon:'🚗'};
    if(!props.length&&cash>scaleAmount(25000)&&(G.creditScore||650)>=620)return {move:'Prepare first property',why:'you have enough financial base to consider ownership or a rental deposit',tone:'good',icon:'🏠'};
    if(props.length&&!props.some(p=>p.rent>0)&&cash>scaleAmount(35000))return {move:'Look for rental income',why:'your portfolio has assets but no recurring income yet',tone:'good',icon:'🏘️'};
    if(rentIncome>0)return {move:'Protect positive cashflow',why:'keep rentals maintained before chasing another big purchase',tone:'good',icon:'📈'};
    return {move:'Build cash and credit',why:'a stronger runway makes the next asset purchase safer',tone:'neutral',icon:'🧱'};
  }

  function careerBestMove(G){
    if(!G.career)return {move:'Choose a stable path',why:'getting a job or education unlocks better yearly income and future options',tone:'good',icon:'💼'};
    if((G.stress||0)>72)return {move:'Protect balance',why:'your stress is high enough to threaten health and job performance',tone:'warn',icon:'🧘'};
    if((G.jobPerf||50)<48)return {move:'Improve performance',why:'low performance blocks raises and promotion chances',tone:'warn',icon:'📈'};
    if((G.yearsAtJob||0)>=2&&(G.jobPerf||50)>65)return {move:'Ask for raise or promotion',why:'your performance and time in role justify a career push',tone:'good',icon:'🚀'};
    if((G.smarts||0)<60)return {move:'Study or certify',why:'skills and smarts unlock higher-tier careers over time',tone:'neutral',icon:'🎓'};
    return {move:'Network quietly',why:'a small reputation gain now improves future options without huge stress',tone:'good',icon:'🕸️'};
  }

  function hustleBestMove(G){
    const ventures=Object.values(G.hustle?.ventures||{});
    const idle=ventures.find(v=>v.lastWorkedAge>=0&&((G.age||0)-v.lastWorkedAge)>=2);
    const risky=ventures.find(v=>(v.brandRisk||0)>62);
    if(!ventures.length)return {move:'Launch one serious venture',why:'quick gigs pay once, but ventures compound every year',tone:'good',icon:'🚀'};
    if(idle)return {move:`Reactivate ${idle.name||idle.id||'idle venture'}`,why:'idle ventures lose momentum and future passive income',tone:'warn',icon:'🔥'};
    if(risky)return {move:'Lower brand risk',why:'high reputation risk can turn a good hustle into stress and lost income',tone:'warn',icon:'🛡️'};
    const best=ventures.slice().sort((a,b)=>(b.level||1)-(a.level||1)||(b.momentum||0)-(a.momentum||0))[0];
    return {move:`Scale ${best?.name||best?.id||'your best venture'}`,why:'your best venture is where effort should compound fastest',tone:'good',icon:'⚡'};
  }

  function loveHealthStatus(G){
    const sh=G.sexualHealth||{};
    const yearsSince=Number.isFinite(sh.lastCheckupAge)?Math.max(0,(G.age||0)-sh.lastCheckupAge):null;
    const partner=G.rels?.partner||null;
    const partnerTrust=partner?Math.round(partner.love||partner.relationship||partner.trust||65):0;
    const stage=partner?(partner.stage||(partner.married?'married':'dating')):'';
    const stablePartner=!!(partner&&['serious','engaged','married'].includes(stage)&&partnerTrust>=45&&!partner.sti&&!partner.outsideExposure&&!sh.sti&&!sh.std);
    const nonPartnerContacts=Math.max(0,(sh.partners||0)-(partner?1:0));
    const exposure=(sh.unprotectedEncounters||0)*2+nonPartnerContacts*2+(sh.sti||sh.std?6:0)+(partner?.outsideExposure?4:0)+(yearsSince===null?1:yearsSince>=5?2:0);
    let status='Stable relationship routine', tone='good', advice='With a trusted partner, health risk should not randomly appear. Checkups matter mainly after new or higher-risk contacts.';
    if(sh.sti||sh.std){ status='Needs checkup'; tone='bad'; advice='Use the Health tab for treatment before more risky choices.'; }
    else if(partner?.outsideExposure){ status='Clarify trust first'; tone='warn'; advice='There is an outside-exposure flag. Rebuild trust or get a checkup before private choices.'; }
    else if(!partner&&nonPartnerContacts>0){ status='Single: checkup smart'; tone=exposure>=4?'warn':'good'; advice='Casual dating is tracked separately from stable partner intimacy.'; }
    else if(partner&&stablePartner){ status='Stable with partner'; tone='good'; advice='Private time with your partner no longer creates random STI events unless a clear risk flag exists.'; }
    else if(partner&&partnerTrust<45){ status='Trust needs work'; tone='warn'; advice='Relationship health is more about trust and communication than random medical events.'; }
    return {status,tone,advice,partnerTrust,yearsSince:yearsSince===null?'never':yearsSince+'y',stablePartner,nonPartnerContacts};
  }

  function injectLoveHealthUX(name){
    if(name!=='love')return;
    requestAnimationFrame(()=>{
      const G=window.G, el=document.getElementById('tab-love'); if(!G||!el||el.querySelector('.advisor-ui-love-health'))return;
      const s=loveHealthStatus(G);
      const html=`<section class="advisor-ui-love-health ${s.tone}"><div class="legacy-ui-card-head"><div><div class="legacy-ui-kicker">Relationship wellbeing</div><h3>🛡️ ${esc(s.status)}</h3><p>${esc(s.advice)}</p></div><strong>${esc(s.tone==='good'?'Stable':s.tone==='warn'?'Watch':'Act')}</strong></div><div class="legacy-ui-summary-grid compact"><div><span>Partner trust</span><b>${s.partnerTrust?s.partnerTrust+'%':'—'}</b></div><div><span>Last checkup</span><b>${esc(s.yearsSince)}</b></div><div><span>Safer choices</span><b>${Math.round(((G.sexualHealth?.protectedEncounters||0)/Math.max(1,(G.sexualHealth?.protectedEncounters||0)+(G.sexualHealth?.unprotectedEncounters||0)))*100)}%</b></div><div><span>Focus</span><b>${s.stablePartner?'Stable':s.tone==='bad'?'Health':s.tone==='warn'?'Clarity':'Trust'}</b></div></div></section>`;
      const anchor=el.querySelector('.legacy-ui-family-clarity')||el.firstElementChild;
      if(anchor)anchor.insertAdjacentHTML('afterend',html); else el.insertAdjacentHTML('afterbegin',html);
    });
  }

  function injectCareerUX(name){
    if(name!=='career')return;
    requestAnimationFrame(()=>{
      const G=window.G, el=document.getElementById('tab-career'); if(!G||!el||el.querySelector('.advisor-ui-career-best'))return;
      const m=careerBestMove(G);
      el.insertAdjacentHTML('afterbegin',`<div class="advisor-ui-career-best">${bestMoveCard('Career direction',m.move,m.why,m.tone,m.icon)}</div>`);
    });
  }

  function injectHustleUX(name){
    if(name!=='hustle')return;
    requestAnimationFrame(()=>{
      const G=window.G, el=document.getElementById('tab-hustle'); if(!G||!el||el.querySelector('.advisor-ui-hustle-best'))return;
      const m=hustleBestMove(G);
      el.insertAdjacentHTML('afterbegin',`<div class="advisor-ui-hustle-best">${bestMoveCard('Hustle focus',m.move,m.why,m.tone,m.icon)}</div>`);
      el.querySelectorAll('.hustle-insight-chip b').forEach(b=>{ b.textContent=b.textContent.replace('Fan Trust','Audience Trust').replace('Privacy','Privacy Score').replace('VIP Fans','VIP Supporters'); });
    });
  }

  function patchAssetsPolish(){
    if(typeof Assets==='undefined'||Assets._advisorPolished)return;
    Assets.VERSION=VERSION_NUM;
    Assets.ACTION_LIMITS={...Assets.ACTION_LIMITS,invest:3,donate:2};
    const oldCan=Assets._canUseAction?.bind(Assets);
    Assets._canUseAction=function(action){
      const ok=oldCan?oldCan(action):true;
      if(!ok) UI?.toast?.('That finance action is used up for this year. Age up to refresh it.','bad');
      return ok;
    };
    Assets.bestMove=function(){ return assetBestMove(window.G||{}); };
    Assets.serviceWeakest=function(){ const G=window.G; if(!G?.assets)return; const props=G.assets.properties||[], vehs=G.assets.vehicles||[]; const prop=props.map((p,i)=>({p,i,c:p.condition||80})).sort((a,b)=>a.c-b.c)[0]; const veh=vehs.map((v,i)=>({v,i,c:v.condition||80})).sort((a,b)=>a.c-b.c)[0]; if(prop&&(!veh||prop.c<=veh.c))return this.manageProp(prop.i,'maintain'); if(veh)return this.serviceVeh(veh.i); UI?.toast?.('No weak asset needs service right now.','neutral'); };
    Assets.sellWeakestVehicle=function(){ const G=window.G; const veh=(G?.assets?.vehicles||[]).map((v,i)=>({v,i,c:v.condition||80})).sort((a,b)=>a.c-b.c)[0]; if(!veh)return UI?.toast?.('No vehicle to sell.','neutral'); return this.sellVeh(veh.i); };
    Assets._advisorPolished=true;
  }

  function patchRelationshipPolish(){
    if(typeof Relations==='undefined'||Relations._advisor3Polished)return;
    Relations.VERSION=VERSION_NUM;
    Relations._stablePartnerNoHealthRisk=function(partner){
      const G=window.G;
      if(!partner||!this._isCurrentPartner?.(partner))return false;
      const stage=partner.stage||(partner.married?'married':'dating');
      const committed=['serious','engaged','married'].includes(stage);
      const knownIssue=!!(G?.sexualHealth?.sti||G?.sexualHealth?.std||partner.sti||partner.outsideExposure);
      const trust=Number(partner.love||partner.trust||65);
      return committed&&!knownIssue&&trust>=45;
    };
    Relations._stiRiskForEncounter=function(partner,opts={},protectedSex=true){
      if(opts.skipSti)return 0;
      const G=window.G, sh=G?.sexualHealth||{};
      const last=Number.isFinite(sh.lastCheckupAge)?sh.lastCheckupAge:null;
      const yearsSince=last===null?99:Math.max(0,(G.age||0)-last);
      const isPartner=this._isCurrentPartner?.(partner);
      if(isPartner&&this._stablePartnerNoHealthRisk(partner))return 0;
      let risk=isPartner?0.004:Math.min(0.055,Math.max(0.014,Number(opts.baseSti)||0.032));
      if(isPartner){
        const stage=partner?.stage||(partner?.married?'married':'dating');
        const committed=['serious','engaged','married'].includes(stage);
        const firstTime=(partner?.sexualEncounters||0)===0;
        if(committed)risk*=0.45;
        if(firstTime&&!committed)risk+=0.006;
        if((partner?.love||60)<40)risk+=0.006;
        if(partner?.outsideExposure)risk+=0.04;
        if(partner?.sti)risk+=0.10;
        if(yearsSince>=4)risk+=0.004;
        risk=protectedSex?risk*0.25:risk*1.6;
      }else{
        risk+=Math.min(0.03,(sh.partners||0)*0.0025);
        if(yearsSince>=3)risk+=0.010;
        risk=protectedSex?risk*0.28:risk+0.055;
      }
      return Math.max(0,Math.min(0.16,risk));
    };
    Relations._chooseProtection=function(cb,opts={}){
      if(typeof UI==='undefined'||!UI.askChoice){ cb(true); return; }
      const partner=opts.partner||null;
      const protectedRisk=Math.round((this._stiRiskForEncounter(partner,opts,true)||0)*1000)/10;
      const higherRisk=Math.round((this._stiRiskForEncounter(partner,opts,false)||0)*1000)/10;
      const riskText=(protectedRisk<=0&&higherRisk<=0)
        ? 'No health-risk flag is active for this stable relationship.'
        : `Estimated health risk: safer option about ${protectedRisk}% · higher-risk option about ${higherRisk}%.`;
      UI.askChoice({
        icon:opts.risky?'⚠️':'🛡️',
        title:opts.title||'Wellbeing Choice',
        text:(opts.text||'Choose the safer relationship approach.')+` ${riskText}`,
        choices:[
          {value:true,label:'Use Protection',sub:'Lower pregnancy risk and calmer long-term outcome.'},
          {value:false,label:'Do Not Use Protection',sub:'Higher pregnancy/health uncertainty. Best only with trust and recent checkups.',danger:true},
        ],
      },cb);
    };
    Relations._advisorPolished=true;
    Relations._advisor3Polished=true;
  }

  function patchHustlePolish(){
    if(typeof Hustle==='undefined'||Hustle._advisorPolished)return;
    Hustle.VERSION=VERSION_NUM;
    if(Array.isArray(Hustle.ventureDefs))Hustle.ventureDefs.forEach(v=>{ if(v.id==='premium_creator'){ v.name='Premium Creator Club'; v.desc='A premium subscription creator brand with strong upside, fast audience growth, high stress and real reputation risk.'; }});
    if(Hustle.ventures&&typeof Hustle.ventures==='object')Object.values(Hustle.ventures).forEach(v=>{ if(v&&v.name==='OnlyFans')v.name='Premium Creator Club'; });
    Hustle._advisorPolished=true;
  }

  function patchAchievementDetailUX(){
    if(typeof App==='undefined'||typeof ACHIEVEMENTS==='undefined'||App._advisorAchDetail)return;
    App._releaseAchFilter=App._releaseAchFilter||'all'; App._releaseAchSearch=App._releaseAchSearch||'';
    App.showAchievementDetail=function(id){
      const unlocked=Save.unlockedAchs(); const ach=ACHIEVEMENTS.find(a=>a.id===id); if(!ach)return;
      const done=unlocked.includes(ach.id), rarity=normalizeRarity(ach);
      let modal=document.getElementById('advisor-ui-ach-detail');
      if(!modal){ modal=document.createElement('div'); modal.id='advisor-ui-ach-detail'; modal.className='modal-bg advisor-ui-ach-detail-modal'; modal.innerHTML='<div class="modal-box"><button type="button" class="modal-skip-btn" onclick="UI.closeAnyModal(document.getElementById(\'advisor-ui-ach-detail\'))">✕</button><div id="advisor-ui-ach-detail-body"></div></div>'; document.body.appendChild(modal); }
      const body=modal.querySelector('#advisor-ui-ach-detail-body');
      body.innerHTML=`<div class="advisor-ui-ach-detail-card rarity-${rarity}"><div class="advisor-ui-ach-detail-icon">${done?esc(ach.icon||'🎖️'):'🔒'}</div><div><div class="legacy-ui-kicker">${esc(rarity)} achievement</div><h2>${done?esc(ach.name):'Hidden Achievement'}</h2><p>${done?esc(ach.desc||'Unlocked.'):esc(ach.hint||'Keep playing different life paths to reveal this achievement.')}</p><div class="advisor-ui-ach-detail-row"><span>Status <b>${done?'Unlocked':'Locked'}</b></span><span>Reward <b>${done?'Legacy score':'Discovery'}</b></span><span>Replay value <b>${rarity==='legendary'?'Very high':rarity==='epic'?'High':'Medium'}</b></span></div></div></div>`;
      UI?.openModal?.(modal);
    };
    App.showAchievements=function(){
      const unlocked=Save.unlockedAchs(); const total=ACHIEVEMENTS.length; const pct=Math.round(unlocked.length/Math.max(1,total)*100);
      const body=document.getElementById('ach-body'); if(!body)return;
      const counts=['common','rare','epic','legendary'].reduce((acc,r)=>{acc[r]=ACHIEVEMENTS.filter(a=>normalizeRarity(a)===r).length; return acc;},{});
      const filters=[['all','All'],['unlocked','✅ Unlocked'],['locked','🔒 Locked'],['common','Common'],['rare','Rare'],['epic','Epic'],['legendary','Legendary']];
      const q=String(this._releaseAchSearch||'').trim().toLowerCase();
      const list=ACHIEVEMENTS.filter(a=>{ const done=unlocked.includes(a.id); const f=this._releaseAchFilter||'all'; const rarity=normalizeRarity(a); const text=`${a.name||''} ${a.desc||''} ${a.hint||''} ${rarity}`.toLowerCase(); return (f==='all'||(f==='unlocked'&&done)||(f==='locked'&&!done)||f===rarity)&&(!q||text.includes(q)); });
      const recent=unlocked.slice(-5).reverse().map(id=>ACHIEVEMENTS.find(a=>a.id===id)).filter(Boolean);
      const near=list.filter(a=>!unlocked.includes(a.id)).slice(0,3);
      body.innerHTML=`<div class="legacy-ui-ach-top"><div><div class="legacy-ui-kicker">Trophy Room</div><h2>🎖️ ${unlocked.length} / ${total} unlocked</h2><p>${pct}% complete · click any achievement for detail</p></div><div class="legacy-ui-ring" style="--p:${pct}"><span>${pct}%</span></div></div>
      <div class="legacy-ui-ach-toolbar"><input id="legacy-ui-ach-search" type="search" placeholder="Search achievements..." value="${attr(this._releaseAchSearch||'')}" oninput="App._releaseAchSearch=this.value;App.showAchievements()"><div class="legacy-ui-ach-filters">${filters.map(([id,label])=>`<button type="button" class="${(this._releaseAchFilter||'all')===id?'active':''}" onclick="App._releaseAchFilter='${id}';App.showAchievements()">${label}</button>`).join('')}</div></div>
      ${recent.length?`<div class="legacy-ui-recent-ach"><b>Recently unlocked</b>${recent.map(a=>`<span onclick="App.showAchievementDetail('${attr(a.id)}')">${esc(a.icon)} ${esc(a.name)}</span>`).join('')}</div>`:''}
      ${near.length?`<div class="advisor-ui-near-ach"><b>Near discovery</b>${near.map(a=>`<span>${esc(normalizeRarity(a))} · ${esc(a.hint||'Try a different life path')}</span>`).join('')}</div>`:''}
      <div class="legacy-ui-ach-grid">${list.map((a,i)=>{ const done=unlocked.includes(a.id); const rarity=normalizeRarity(a); return `<article class="ach-card legacy-ui-ach-card ${done?'unlocked':'locked'} rarity-${rarity}" style="animation-delay:${Math.min(i,18)*0.025}s" onclick="App.showAchievementDetail('${attr(a.id)}')"><div class="ach-ico">${done?esc(a.icon):'❓'}</div><div class="ach-info"><div class="ach-name">${done?esc(a.name):'Hidden Achievement'}</div><div class="ach-desc">${done?esc(a.desc):esc(a.hint||'Click for detail.')}</div><span class="legacy-ui-rarity ${rarity}">${rarity}</span></div><div class="legacy-ui-ach-state">${done?'✅':'🔎'}</div></article>`; }).join('')}</div>`;
      this.show('ach-screen');
    };
    App._advisorAchDetail=true;
  }

  function patchLabelCleanup(){
    if(window._advisorLabelCleanup)return; window._advisorLabelCleanup=true;
    const replacements=[
      [/\b(\d+)\s+left\b/gi,'$1 remaining'],
      [/\b\d+\s+available\b/gi,''],
      [/\s+·\s+$/g,''],
      [/Cleaner nav · less scrolling · same systems/gi,''],
      [/Grouped optional paths/gi,''],
      [/Always available/gi,''],
      [/\s{2,}/g,' ']
    ];
    const cleanText=(txt)=>replacements.reduce((v,[re,rep])=>v.replace(re,rep),txt);
    const clean=()=>{
      const root=document.getElementById('app')||document.body;
      if(!root)return;
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
        const p=node.parentElement;
        if(!p||['SCRIPT','STYLE','TEXTAREA','INPUT'].includes(p.tagName))return NodeFilter.FILTER_REJECT;
        if(!/available|left|Cleaner nav|Always available/i.test(node.nodeValue||''))return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      }});
      const nodes=[]; while(walker.nextNode())nodes.push(walker.currentNode);
      nodes.forEach(node=>{ const next=cleanText(node.nodeValue||''); if(next!==node.nodeValue)node.nodeValue=next; });
    };
    const oldUpdate=UI?.update?.bind(UI);
    if(typeof UI!=='undefined'&&oldUpdate&&!UI._advisorCleanUpdate){ UI.update=function(){ const out=oldUpdate(); requestAnimationFrame(clean); return out; }; UI._advisorCleanUpdate=true; }
    requestAnimationFrame(clean);
  }

  function patchErrorRecovery(){
    if(window._releaseErrorRecovery)return; window._releaseErrorRecovery=true;
    window.addEventListener('error',ev=>{ console.warn('[LifeSim runtime]',ev.message,ev.filename,ev.lineno); try{UI?.toast?.('Minor runtime issue caught — game kept running.','neutral');}catch(_){ } });
    window.addEventListener('unhandledrejection',ev=>{ console.warn('[LifeSim async]',ev.reason); try{UI?.toast?.('Async issue caught — game kept running.','neutral');}catch(_){ } });
    if(typeof Engine!=='undefined'&&!Engine._releaseLogPatched){
      const oldLog=Engine.log?.bind(Engine);
      Engine.log=function(text,type='neutral'){
        const G=window.G; const raw=String(text||'');
        if(G&&Array.isArray(G.log)&&G.log.length){ const top=G.log[0]; const topRaw=String(top.rawText||top.text||'').replace(/\s×\d+$/,''); if(top.age===(G.age||0)&&top.type===type&&topRaw===raw){ top.rawText=raw; top.count=(top.count||1)+1; top.text=raw+' ×'+top.count; top.ts=Date.now(); return; } }
        oldLog?.(raw,type); if(G&&Array.isArray(G.log)&&G.log[0]){G.log[0].rawText=raw;G.log[0].count=1;}
      };
      Engine._releaseLogPatched=true;
    }
  }

  window.CoreSystems = {
    BUILD,
    economyBand,
    balanceReward,
    _beforeAge:null,
    addLongEffect(effect){},
    tickLongTerm(){},
    pickContextEvent,
    injectGangPanel,
    gangPassiveTick,
    maybeBuildYearlySummary(){
      const G=window.G,b=this._beforeAge; if(!G||!b)return;
      if((G.age||0)!==num(b.age)+1)return;
      if(G._releaseSummarySerial===(G.ageUpSerial||0))return;
      if(!Array.isArray(G.yearlySummaries))G.yearlySummaries=[];
      const summary=buildYearlySummary(G,b); G.lastYearlySummary=summary; G.yearlySummaries.unshift(summary); G.yearlySummaries=G.yearlySummaries.slice(0,60); G._releaseSummarySerial=G.ageUpSerial||0; this._beforeAge=null;
    }
  };

  safe('expose globals',exposeGlobals);
  safe('patch versions',patchVersions);
  safe('patch app/ui',patchAppAndUI);
  safe('economy balance',patchEconomyBalance);
  safe('yearly summary',patchYearlySummary);
  safe('achievement UX',patchAchievementUX);
  safe('achievement detail UX',patchAchievementDetailUX);
  safe('decision events',patchDecisionEvents);
  safe('long-term effects',patchLongTermEffects);
  safe('assets polish',patchAssetsPolish);
  safe('relationship polish',patchRelationshipPolish);
  safe('hustle polish',patchHustlePolish);
  safe('gang system',patchCrimeGangs);
  safe('label cleanup',patchLabelCleanup);
  safe('error recovery',patchErrorRecovery);

  document.addEventListener('DOMContentLoaded',()=>{
    safe('dom globals',exposeGlobals); safe('dom versions',patchVersions); safe('dom labels',updateVisibleVersion); safe('dom polish',()=>{patchAssetsPolish();patchRelationshipPolish();patchHustlePolish();patchAchievementDetailUX();patchLabelCleanup();}); safe('dom tabs',()=>{ensureHustleTab();removePromotedTabs();});
    document.body.classList.add('legacy-ui-ready');
  });
  window.addEventListener('load',()=>{ safe('load globals',exposeGlobals); safe('load versions',patchVersions); safe('load polish',()=>{patchAssetsPolish();patchRelationshipPolish();patchHustlePolish();patchAchievementDetailUX();patchLabelCleanup();}); safe('load gang',patchCrimeGangs); });
})();


/* LifeSim — No Casino + Size Cleanup
   Adds yearly quests, timeline 2.0, richer assets guidance and achievement rewards.
   Kept inside release_core.js to avoid another patch-file tower. */
(function(){
  'use strict';
  const BUILD='release-goals';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attr=(v)=>esc(v).replace(/`/g,'&#96;');
  const fmtMoney=(v)=>{ try{return typeof fmt==='function'?fmt(Math.round(v||0)):'Kč'+Math.round(v||0).toLocaleString();}catch(_){return 'Kč'+Math.round(v||0).toLocaleString();} };
  const fmtFullMoney=(v)=>{ try{return typeof fmtFull==='function'?fmtFull(Math.round(v||0)):fmtMoney(v);}catch(_){return fmtMoney(v);} };
  const nw=(G)=>{ try{return typeof netWorth==='function'?netWorth(G):(G.money||0);}catch(_){return G.money||0;} };
  const cost=(v,G)=>{ try{return typeof annualCost==='function'?annualCost(v,G):v;}catch(_){return v;} };
  const log=(msg,type='neutral')=>{ try{Engine?.log?.(msg,type);}catch(_){ } };
  const toast=(msg,type='neutral')=>{ try{UI?.toast?.(msg,type);}catch(_){ } };
  const update=()=>{ try{UI?.update?.();}catch(_){ } };

  function setVersionLabels(){
    try{
      document.title='LifeSim';
      const app=document.getElementById('app'); if(app){app.dataset.version='release';app.dataset.build=BUILD;}
      document.querySelectorAll('.ver-badge,.splash-foot,.topbar-title').forEach(el=>{
        if(!el || !/release|LifeSim/i.test(el.textContent||''))return;
        el.textContent=el.textContent
          .replace(/release\.4\.3|release\.4\.2|release\.4\.1|release\.4|release\.3\.1|release\.3|release\.2|release\.1|release\b/g,'release')
          .replace(/Relationship Logic Hotfix|UI Cleanup Hotfix|Duplicate Hub Cleanup|Final Polish Update|Stability + Live Data Update/g,'Stability + Live Data Update');
      });
    }catch(_){ }
  }

  function applyTimelineFilter(filter='all'){
    const allowed=new Set(['all','highlight','money','health','career','family']);
    const value=allowed.has(filter)?filter:'all';
    if(window.UI){UI._logFilter=value;try{UI.renderLog?.();}catch(e){console.warn('[timeline filter]',e);}}
  }
  function enhanceTimeline(){
    const life=document.getElementById('tab-life');
    if(!life)return;
    const feed=life.querySelector('.life-feed-list,.log-list');
    if(feed)feed.classList.add('goal-ui-timeline-enhanced');
  }

  function advisorCards(){
    return [];
  }

  /* ------------------------- Yearly quests ------------------------- */
  function questStage(G){
    const age=G.age||0;
    if(age<=2)return'infant';if(age<=5)return'early';if(age<=12)return'school';if(age<=15)return'teen';if(age<=17)return'olderTeen';if(age<=24)return'youngAdult';if(age>=60)return'senior';return'adult';
  }
  function parentBond(G){const arr=[G.rels?.father,G.rels?.mother].filter(Boolean);return arr.length?Math.round(arr.reduce((a,p)=>a+(p.love||50),0)/arr.length):50;}
  function talentTotal(G){return Object.values(G.youthTalents||{}).reduce((a,v)=>a+(Number(v)||0),0);}
  function questReward(q,G=window.G){
    const age=G?.age||0,tier=q.tier||'standard';
    if(age<13){
      if(tier==='gold')return {health:3,happiness:4,smarts:2,label:'+Health, +Happiness and +Smarts'};
      if(tier==='rare')return {happiness:4,stress:-3,label:'+Happiness and lower stress'};
      return {happiness:3,health:2,label:'+Happiness and +Health'};
    }
    if(age<18){
      if(tier==='gold')return {money:500,happiness:3,skillPoints:1,label:`${fmtMoney(500)} future fund + 1 Skill Point`};
      if(tier==='rare')return {money:250,happiness:3,label:`${fmtMoney(250)} future fund + Happiness`};
      return {money:100,happiness:2,label:`${fmtMoney(100)} future fund + small mood boost`};
    }
    if(age>=60){
      if(tier==='gold')return {health:5,mentalHealth:4,happiness:3,label:'+Health, +Wellbeing and +Happiness'};
      if(tier==='rare')return {mentalHealth:5,happiness:4,stress:-4,label:'+Wellbeing, +Happiness and lower stress'};
      return {happiness:5,health:2,label:'+Happiness and +Health'};
    }
    if(tier==='gold')return {money:4500,happiness:2,skillPoints:1,label:`${fmtMoney(4500)} + 1 Skill Point`};
    if(tier==='rare')return {money:2500,happiness:3,label:`${fmtMoney(2500)} + Happiness`};
    return {money:1200,happiness:2,label:`${fmtMoney(1200)} + small mood boost`};
  }
  function questPool(G){
    const age=G.age||0,stage=questStage(G),arr=[];
    const add=(q)=>arr.push(q);
    if(stage==='infant'){
      add({id:'baby_health',icon:'❤️',title:'Healthy development',desc:`Reach ${Math.min(90,(G.health||0)+5)} health.`,kind:'statMin',field:'health',target:Math.min(90,(G.health||0)+5),tab:'health',tier:'gold',why:'Sleep, checkups and safe movement support early growth.'});
      add({id:'baby_happy',icon:'😊',title:'Feel safe and happy',desc:`Reach ${Math.min(90,(G.happiness||0)+6)} happiness.`,kind:'statMin',field:'happiness',target:Math.min(90,(G.happiness||0)+6),tab:'mind',tier:'rare',why:'A baby needs comfort and connection, not money pressure.'});
      add({id:'baby_bond',icon:'🤗',title:'Strengthen family bond',desc:`Raise average parent bond to ${Math.min(92,parentBond(G)+5)}.`,kind:'parentBond',target:Math.min(92,parentBond(G)+5),tab:'love',tier:'rare',why:'Secure relationships are the foundation of childhood.'});
      return arr;
    }
    if(stage==='early'){
      add({id:'early_learn',icon:'🧩',title:'Learn through play',desc:`Reach ${Math.min(85,(G.smarts||0)+5)} smarts.`,kind:'statMin',field:'smarts',target:Math.min(85,(G.smarts||0)+5),tab:'mind',tier:'gold',why:'Stories, play and curiosity build real foundations.'});
      add({id:'early_move',icon:'🌳',title:'Move and explore',desc:`Reach ${Math.min(85,(G.fitness||0)+5)} fitness.`,kind:'statMin',field:'fitness',target:Math.min(85,(G.fitness||0)+5),tab:'mind',tier:'rare',why:'Age-safe activity supports healthy development.'});
      add({id:'early_bond',icon:'👪',title:'Make a family memory',desc:`Raise average parent bond to ${Math.min(94,parentBond(G)+4)}.`,kind:'parentBond',target:Math.min(94,parentBond(G)+4),tab:'love',tier:'standard',why:'Childhood goals should center on safety and connection.'});
      return arr;
    }
    if(stage==='school'){
      add({id:'school_progress',icon:'🎒',title:'Improve at school',desc:`Raise school performance to ${Math.min(90,(G.schoolPerformance||50)+6)}.`,kind:'schoolPerformance',target:Math.min(90,(G.schoolPerformance||50)+6),tab:'career',tier:'gold',why:'Balanced learning matters more than adult income.'});
      add({id:'school_talent',icon:'🌟',title:'Practice a talent',desc:'Gain 3 youth talent practice points.',kind:'youthTalentGain',start:talentTotal(G),target:talentTotal(G)+3,tab:'skills',tier:'rare',why:'Long-term skill grows through repeated practice.'});
      add({id:'school_happy',icon:'😊',title:'Protect childhood balance',desc:`Reach ${Math.min(92,(G.happiness||0)+5)} happiness.`,kind:'statMin',field:'happiness',target:Math.min(92,(G.happiness||0)+5),tab:'mind',tier:'standard',why:'School years should not become pure grind.'});
      add({id:'school_friend',icon:'🫶',title:'Build a friendship',desc:'Gain a friend or strengthen your social circle.',kind:'friendGain',start:(G.rels?.friends||[]).length,target:(G.rels?.friends||[]).length+1,tab:'love',tier:'standard',why:'Healthy friendships are age-appropriate progress.'});
      return arr;
    }
    if(stage==='teen'||stage==='olderTeen'){
      add({id:'teen_school',icon:'📝',title:'Stay on track at school',desc:`Raise school performance to ${Math.min(92,(G.schoolPerformance||50)+6)}.`,kind:'schoolPerformance',target:Math.min(92,(G.schoolPerformance||50)+6),tab:'career',tier:'gold',why:'Education keeps future choices open.'});
      if((G.stress||0)>25)add({id:'teen_stress',icon:'🧘',title:'Lower pressure',desc:`Bring stress down to ${Math.max(15,(G.stress||0)-10)} or lower.`,kind:'statMax',field:'stress',target:Math.max(15,(G.stress||0)-10),tab:'health',tier:'rare',why:'Teen burnout should be managed before adulthood.'});
      else add({id:'teen_health',icon:'❤️',title:'Build a healthy routine',desc:`Reach ${Math.min(90,(G.health||0)+5)} health.`,kind:'statMin',field:'health',target:Math.min(90,(G.health||0)+5),tab:'health',tier:'rare',why:'Sleep, movement and nutrition matter more than hustle.'});
      add({id:'teen_talent',icon:'🎓',title:'Develop a useful skill',desc:'Gain 3 youth talent points or reach level 1 in a specialist skill.',kind:'teenSkill',start:talentTotal(G),target:talentTotal(G)+3,tab:'skills',tier:'standard',why:'Independence starts with capability, not unrealistic wealth.'});
      if(stage==='olderTeen')add({id:'teen_path',icon:'🧭',title:'Choose a next step',desc:'Start a job, education path or level 1 specialist skill.',kind:'hasPath',tab:'career',tier:'gold',why:'At 16–17, direction is more realistic than owning property.'});
      else add({id:'teen_friend',icon:'🫶',title:'Strengthen your support circle',desc:'Gain one friend this year.',kind:'friendGain',start:(G.rels?.friends||[]).length,target:(G.rels?.friends||[]).length+1,tab:'love',tier:'standard',why:'Trusted people protect mental health.'});
      return arr;
    }

    if(stage==='youngAdult'){
      add({id:'young_direction',icon:'🧭',title:'Choose a practical direction',desc:'Start a job, education path, specialist skill or small business.',kind:'hasPath',tab:'career',tier:'gold',why:'The first adult years are about direction and experience, not instant wealth.'});
      if((G.stress||0)>30)add({id:'young_stress',icon:'🌿',title:'Build a sustainable routine',desc:`Bring stress down to ${Math.max(15,(G.stress||0)-10)} or lower.`,kind:'statMax',field:'stress',target:Math.max(15,(G.stress||0)-10),tab:'health',tier:'rare',why:'Independence is easier when work, sleep and recovery are balanced.'});
      else add({id:'young_health',icon:'❤️',title:'Protect your energy',desc:`Reach ${Math.min(90,(G.health||0)+5)} health.`,kind:'statMin',field:'health',target:Math.min(90,(G.health||0)+5),tab:'health',tier:'rare',why:'A healthy routine matters more than forcing early financial milestones.'});
      const starterReserve=Math.max(cost(500,G),Math.round(Math.max(0,(G.lastLivingCosts||0)+(G.food?.lastCost||0))*0.12));
      add({id:'young_reserve',icon:'🏦',title:'Create a starter reserve',desc:`Keep at least ${fmtMoney(starterReserve)} in personal cash.`,kind:'cash',target:starterReserve,tab:'assets',tier:'standard',why:'A small emergency buffer is realistic before property or investment goals.'});
      add({id:'young_skill',icon:'🎓',title:'Grow one useful skill',desc:'Reach level 1 in a specialist skill or spend a saved skill point.',kind:'youngSkill',startPoints:G.skillPoints||0,tab:'skills',tier:'standard',why:'Early adult progress comes from capability and experience.'});
      add({id:'young_circle',icon:'🫶',title:'Keep a support circle',desc:'Have at least one friend or strengthen an existing relationship.',kind:'supportCircle',startFriends:(G.rels?.friends||[]).length,startLove:G.rels?.partner?.love||0,tab:'love',tier:'standard',why:'Moving into adulthood should not mean becoming isolated.'});
      add({id:'young_happy',icon:'😊',title:'Make room for life',desc:`Reach ${Math.min(92,(G.happiness||50)+5)} happiness.`,kind:'statMin',field:'happiness',target:Math.min(92,(G.happiness||50)+5),tab:'mind',tier:'standard',why:'A good start is more than work and money.'});
      return arr;
    }

    if(stage==='senior'){
      add({id:'senior_health',icon:'❤️',title:'Protect daily health',desc:`Reach ${Math.min(82,(G.health||0)+4)} health.`,kind:'statMin',field:'health',target:Math.min(82,(G.health||0)+4),tab:'health',tier:'gold',why:'Later-life progress is about function, prevention and quality of life.'});
      if((G.stress||0)>25)add({id:'senior_calm',icon:'🌿',title:'Choose a calmer pace',desc:`Bring stress down to ${Math.max(15,(G.stress||0)-8)} or lower.`,kind:'statMax',field:'stress',target:Math.max(15,(G.stress||0)-8),tab:'mind',tier:'rare',why:'Recovery matters more than endless hustle.'});
      else add({id:'senior_mind',icon:'🧠',title:'Protect mental wellbeing',desc:`Reach ${Math.min(88,(G.mentalHealth||60)+5)} mental wellbeing.`,kind:'statMin',field:'mentalHealth',target:Math.min(88,(G.mentalHealth||60)+5),tab:'mind',tier:'rare',why:'Purpose, connection and rest support healthy aging.'});
      add({id:'senior_joy',icon:'😊',title:'Make this year meaningful',desc:`Reach ${Math.min(90,(G.happiness||0)+5)} happiness.`,kind:'statMin',field:'happiness',target:Math.min(90,(G.happiness||0)+5),tab:'love',tier:'standard',why:'A good later chapter is measured by wellbeing, not constant wealth growth.'});
      add({id:'senior_legacy',icon:'🤲',title:'Strengthen your legacy',desc:`Reach ${Math.min(90,(G.reputation||50)+5)} reputation.`,kind:'statMin',field:'reputation',target:Math.min(90,(G.reputation||50)+5),tab:'love',tier:'standard',why:'Relationships and the good you leave behind matter now.'});
      return arr;
    }

    const cashTarget=Math.max((G.money||0)+cost(1500,G),Math.round(((G.lastLivingCosts||0)+(G.food?.lastCost||0))*0.25));
    if((G.stress||0)>35)add({id:'stress',icon:'🧘',title:'Lower stress',desc:`Bring stress down to ${Math.max(15,(G.stress||0)-12)} or lower.`,kind:'statMax',field:'stress',target:Math.max(15,(G.stress||0)-12),tab:'mind',tier:'rare',why:'Lower stress protects health and future income.'});
    if((G.health||0)<82)add({id:'health',icon:'❤️‍🩹',title:'Repair health',desc:`Raise health to ${Math.min(95,(G.health||0)+8)}+.`,kind:'statMin',field:'health',target:Math.min(95,(G.health||0)+8),tab:'health',tier:'rare',why:'Health is your longest-term asset.'});
    if((G.skillPoints||0)>0)add({id:'spend_skill',icon:'🎓',title:'Spend a Skill Point',desc:'Use at least 1 saved skill point.',kind:'skillSpend',start:G.skillPoints||0,target:Math.max(0,(G.skillPoints||0)-1),tab:'skills',tier:'standard',why:'Unspent points are unused progress.'});
    if(!G.career&&(G.age||0)<65)add({id:'job',icon:'💼',title:'Build stable direction',desc:'Get a job, enter education or start a real business.',kind:'hasPath',tab:'career',tier:'gold',why:'Stable direction unlocks adult independence.'});
    if(G.career)add({id:'career_perf',icon:'📈',title:'Improve career position',desc:'Raise job performance by 6 or earn a promotion.',kind:'careerProgress',startPerf:G.jobPerf||50,startPromos:G.promotionCount||0,target:Math.min(100,(G.jobPerf||50)+6),tab:'career',tier:'rare',why:'Career momentum compounds over years.'});
    if((G.money||0)>=0)add({id:'cash',icon:'🏦',title:'Build cash reserve',desc:`Keep at least ${fmtMoney(cashTarget)} in cash.`,kind:'cash',target:cashTarget,tab:'assets',tier:'standard',why:'A realistic reserve prevents debt spirals.'});
    if(!(G.assets?.properties||[]).length&&(G.money||0)>cost(12000,G))add({id:'first_asset',icon:'🏠',title:'Buy your first asset',desc:'Buy property or start an investment portfolio.',kind:'firstAsset',tab:'assets',tier:'gold',why:'Assets turn income into long-term wealth.'});
    if((G.assets?.properties||[]).some(p=>(p.condition||80)<65))add({id:'maintain_asset',icon:'🔧',title:'Maintain weak asset',desc:'Repair every property below 65% condition.',kind:'maintainAsset',tab:'assets',tier:'rare',why:'Maintenance protects net worth.'});
    if(G.rels?.partner)add({id:'partner',icon:'❤️',title:'Strengthen relationship',desc:'Raise partner bond by 5 or move the relationship forward.',kind:'partnerProgress',startLove:G.rels.partner.love||60,startStage:G.rels.partner.stage||'',target:Math.min(100,(G.rels.partner.love||60)+5),tab:'love',tier:'standard',why:'Strong relationships reduce stress and improve legacy.'});
    if((G.crimeHeat||0)>25||(G.gangHeat||0)>25)add({id:'heat',icon:'🧯',title:'Cool down heat',desc:'Lower combined crime heat by 10.',kind:'heat',start:(G.crimeHeat||0)+(G.gangHeat||0),target:Math.max(0,(G.crimeHeat||0)+(G.gangHeat||0)-10),tab:'crime',tier:'rare',why:'Lower heat prevents prison and reputation collapse.'});
    const nwStart=nw(G),nwGain=Math.max(cost(2500,G),Math.round(Math.max(0,nwStart)*0.04));
    add({id:'networth',icon:'💰',title:'Grow net worth',desc:`Increase net worth by ${fmtMoney(nwGain)}.`,kind:'networth',start:nwStart,target:nwStart+nwGain,tab:'assets',tier:'standard',why:'Small, realistic wealth wins compound.'});
    add({id:'happiness',icon:'😊',title:'Protect happiness',desc:`Reach ${Math.min(95,(G.happiness||50)+6)} happiness.`,kind:'statMin',field:'happiness',target:Math.min(95,(G.happiness||50)+6),tab:'mind',tier:'standard',why:'Happiness keeps life from becoming pure grind.'});
    return arr;
  }
  function questCurrent(q,G){
    switch(q.kind){
      case'statMin':case'statMax':return G[q.field]||0;
      case'parentBond':return parentBond(G);
      case'schoolPerformance':return G.schoolPerformance||0;
      case'youthTalentGain':return talentTotal(G);
      case'friendGain':return (G.rels?.friends||[]).length;
      case'teenSkill':return Math.max(talentTotal(G),q.start+Math.max(0,...Object.values(G.skills||{}).map(Number)));
      case'youngSkill':return Math.max(0,...Object.values(G.skills||{}).map(Number),Math.max(0,(q.startPoints||0)-(G.skillPoints||0)));
      case'supportCircle':return Math.max((G.rels?.friends||[]).length,(G.rels?.partner?.love||0));
      case'skillSpend':return G.skillPoints||0;
      case'cash':return G.money||0;
      case'networth':return nw(G);
      case'heat':return (G.crimeHeat||0)+(G.gangHeat||0);
      default:return 0;
    }
  }
  function isQuestReady(q,G){
    if(!q||q.claimed||q.done)return false;
    switch(q.kind){
      case'statMin':return(G[q.field]||0)>=q.target;
      case'statMax':return(G[q.field]||0)<=q.target;
      case'parentBond':return parentBond(G)>=q.target;
      case'schoolPerformance':return(G.schoolPerformance||0)>=q.target;
      case'youthTalentGain':return talentTotal(G)>=q.target;
      case'friendGain':return(G.rels?.friends||[]).length>=q.target;
      case'teenSkill':return talentTotal(G)>=q.target||Math.max(0,...Object.values(G.skills||{}).map(Number))>=1;
      case'youngSkill':return Math.max(0,...Object.values(G.skills||{}).map(Number))>=1||(G.skillPoints||0)<(q.startPoints||0);
      case'supportCircle':return (G.rels?.friends||[]).length>Math.max(0,q.startFriends||0)||(G.rels?.friends||[]).length>0||(G.rels?.partner?.love||0)>Math.max(0,q.startLove||0); 
      case'hasPath':return!!G.career||!!G.inUniversity||G.education==='high_school'||Math.max(0,...Object.values(G.skills||{}).map(Number))>=1;
      case'skillSpend':return(G.skillPoints||0)<=q.target;
      case'careerProgress':return(G.jobPerf||0)>=q.target||(G.promotionCount||0)>q.startPromos;
      case'cash':return(G.money||0)>=q.target;
      case'firstAsset':return(G.assets?.properties||[]).length>0||Object.keys(G.stocks?.portfolio||{}).length>0;
      case'maintainAsset':return!(G.assets?.properties||[]).some(p=>(p.condition||80)<65);
      case'partnerProgress':return(G.rels?.partner?.love||0)>=q.target||(G.rels?.partner?.stage||'')!==q.startStage;
      case'heat':return((G.crimeHeat||0)+(G.gangHeat||0))<=q.target;
      case'networth':return nw(G)>=q.target;
      default:return false;
    }
  }
  function ensureQuests(G,force=false){
    if(!G)return[];
    if(!Array.isArray(G.yearQuests))G.yearQuests=[];
    if(!G.yearQuestStats)G.yearQuestStats={completed:0,expired:0,rewards:0};
    if(force||G.yearQuestAge!==(G.age||0)||!G.yearQuests.length){
      if(G.yearQuestAge!==(G.age||0)){G.yearQuestRefreshAge=-1;}
      (G.yearQuests||[]).forEach(q=>{if(!q.done&&!q.expired){q.expired=true;G.yearQuestStats.expired=(G.yearQuestStats.expired||0)+1;}});
      const pool=questPool(G).sort((a,b)=>({gold:3,rare:2,standard:1}[b.tier]-{gold:3,rare:2,standard:1}[a.tier]));
      const seen=new Set();G.yearQuests=[];
      for(const q of pool){if(seen.has(q.id))continue;seen.add(q.id);G.yearQuests.push({...q,uid:`${G.age}_${q.id}_${Math.floor(Math.random()*9999)}`,age:G.age||0,done:false,claimed:false});if(G.yearQuests.length>=3)break;}
      G.yearQuestAge=G.age||0;
    }
    return G.yearQuests;
  }
  function claimQuest(uid){
    const G=window.G;if(!G)return;const q=(G.yearQuests||[]).find(x=>x.uid===uid);if(!q)return toast('Quest not found.','bad');if(!isQuestReady(q,G))return toast('Quest is not ready yet.','neutral');
    const r=questReward(q,G);q.done=true;q.claimed=true;G.yearQuestStats=G.yearQuestStats||{completed:0,expired:0,rewards:0};G.yearQuestStats.completed=(G.yearQuestStats.completed||0)+1;
    if((G.age||0)<18&&r.money){G.familySupport=(G.familySupport||0)+r.money;}else{G.money=Math.max(0,Math.round((G.money||0)+(r.money||0)));}
    G.health=clamp((G.health||50)+(r.health||0));G.smarts=clamp((G.smarts||50)+(r.smarts||0));G.happiness=clamp((G.happiness||50)+(r.happiness||0));G.stress=clamp((G.stress||0)+(r.stress||0));G.mentalHealth=clamp((G.mentalHealth||60)+(r.mentalHealth||0));if(r.skillPoints)G.skillPoints=(G.skillPoints||0)+r.skillPoints;
    G.yearQuestStats.rewards=(G.yearQuestStats.rewards||0)+(r.money||0);log(`🎯 Year focus complete: ${q.title}. Reward: ${r.label}.`,'special');try{UI?.achievementPopup?.({icon:q.icon,name:q.title,desc:`Year Focus Complete · ${r.label}`});}catch(_){}update();
  }
  function refreshYearQuests(){
    const G=window.G;if(!G)return;if(G.yearQuestRefreshAge===G.age)return toast('You already refreshed this year’s focus once.','neutral');G.yearQuestRefreshAge=G.age;ensureQuests(G,true);log('🎯 This year’s focus was refreshed once.','neutral');update();
  }
  function questsHTML(G){
    const qs=ensureQuests(G),stage=questStage(G),refreshed=G.yearQuestRefreshAge===G.age;
    const heading=stage==='senior'?'This Year’s Wellbeing Focus':stage==='adult'?'Life Goals This Year':stage==='youngAdult'?'Independence Focus':'This Year’s Growth Focus';
    const copy=stage==='senior'?'Three realistic priorities for health, connection, purpose and legacy.':stage==='adult'?'Three realistic targets based on your current adult life.':stage==='youngAdult'?'Three grounded priorities for direction, basic stability and wellbeing. Property and large-wealth targets begin later.':'Three realistic targets for this exact age. Adult finance targets stay out of childhood.';
    return `<section class="goal-ui-quests"><div class="goal-ui-section-head"><div><div class="legacy-ui-kicker">Age ${esc(G.age)} · ${esc(stage)}</div><h3>🎯 ${heading}</h3><p>${copy}</p></div><button type="button" ${refreshed?'disabled':''} onclick="LifeSystemsUI.refreshYearQuests()">${refreshed?'Refreshed':'Refresh once'}</button></div><div class="goal-ui-quest-grid">${qs.map(q=>{const ready=isQuestReady(q,G),done=q.claimed,reward=questReward(q,G);return `<article class="goal-ui-quest ${done?'done':ready?'ready':''}"><div class="q-ico">${esc(q.icon)}</div><div class="q-body"><div class="q-top"><b>${esc(q.title)}</b><span>${done?'Done':ready?'Ready':q.tier||'focus'}</span></div><p>${esc(q.desc)}</p><small>${esc(q.why||'This moves your life forward.')}</small><div class="q-reward">🎁 ${esc(reward.label)}</div></div><button type="button" onclick="${done?'UI.toast(\'Already completed.\',\'good\')':ready?`LifeSystemsUI.claimQuest('${attr(q.uid)}')`:`UI.tab('${attr(q.tab||'life')}')`}">${done?'✅':ready?'Claim':'Go'}</button></article>`;}).join('')}</div></section>`;
  }

  /* ------------------------- Assets 2.0 ------------------------- */
  function assetMetrics(G){
    const props=G.assets?.properties||[], vehs=G.assets?.vehicles||[];
    const propValue=props.reduce((a,p)=>a+(p.value||0),0);
    const vehValue=vehs.reduce((a,v)=>a+(v.value||0),0);
    const rental=props.reduce((a,p)=>a+(p.rent?Math.round((p.rent||0)*((p.condition||75)/100)):0),0);
    const weak=[...props.map((p,i)=>({kind:'property',i,name:p.name||p.id,condition:p.condition||80})),...vehs.map((v,i)=>({kind:'vehicle',i,name:v.name||v.id,condition:v.condition||80}))].sort((a,b)=>a.condition-b.condition)[0];
    const bestROI=props.filter(p=>p.rent>0).sort((a,b)=>((b.rent||0)/Math.max(1,b.value||1))-((a.rent||0)/Math.max(1,a.value||1)))[0];
    return {props,vehs,propValue,vehValue,rental,weak,bestROI};
  }
  function assets2HTML(G){
    const m=assetMetrics(G); const total=m.propValue+m.vehValue;
    const weakTxt=m.weak?`${m.weak.name} · ${Math.round(m.weak.condition)}% condition`:'No weak asset';
    return `<section class="goal-ui-assets2"><div class="goal-ui-section-head"><div><div class="legacy-ui-kicker">Assets 2.0</div><h3>🏠 Ownership Dashboard</h3><p>Assets now show what they actually do: value, cashflow, condition and next move.</p></div><strong>${fmtFullMoney(total)}</strong></div><div class="goal-ui-asset-metrics"><div><span>Property value</span><b>${fmtFullMoney(m.propValue)}</b></div><div><span>Vehicles</span><b>${fmtFullMoney(m.vehValue)}</b></div><div><span>Rental income</span><b>${fmtMoney(m.rental)}/yr</b></div><div><span>Weakest item</span><b>${esc(weakTxt)}</b></div></div><div class="goal-ui-asset-actions"><button type="button" onclick="Assets.serviceWeakest?.()">🔧 Fix weakest</button><button type="button" onclick="LifeSystemsUI.upgradeBestRental()">🛠️ Upgrade best rental</button><button type="button" onclick="Assets.sellWeakestVehicle?.()">💸 Sell weakest car</button><button type="button" onclick="UI.tab('stocks')">📈 Build portfolio</button></div>${m.bestROI?`<div class="goal-ui-note">🏆 Best rental ROI: <b>${esc(m.bestROI.name||m.bestROI.id)}</b> · rent ${fmtMoney(m.bestROI.rent||0)}/yr · condition ${Math.round(m.bestROI.condition||80)}%</div>`:`<div class="goal-ui-note">Tip: rentals create cashflow, homes create lifestyle, vehicles create status but usually depreciate.</div>`}</section>`;
  }
  function upgradeBestRental(){
    const G=window.G; if(!G?.assets?.properties?.length)return toast('No property to upgrade yet.','neutral');
    const rentals=G.assets.properties.map((p,i)=>({p,i,roi:(p.rent||0)/Math.max(1,p.value||1)})).filter(x=>(x.p.rent||0)>0).sort((a,b)=>b.roi-a.roi);
    const target=rentals[0]||G.assets.properties.map((p,i)=>({p,i})).sort((a,b)=>(a.p.condition||80)-(b.p.condition||80))[0];
    if(!target)return toast('No property to upgrade yet.','neutral');
    try{Assets.manageProp(target.i,'renovate');}catch(e){console.warn(e);toast('Upgrade action failed.','bad');}
  }

  /* ------------------------- Achievement rewards ------------------------- */
  function achReward(ach){
    const rarity=(typeof CoreSystems!=='undefined'&&CoreSystems.normalizeRarity)?CoreSystems.normalizeRarity(ach):String(ach?.rarity||'common').toLowerCase();
    const r=['common','rare','epic','legendary'].includes(rarity)?rarity:'common';
    if(r==='legendary')return {money:12000,skillPoints:1,fame:2,legacy:0.02,label:`${fmtMoney(12000)} + 1 Skill Point + Legacy boost`};
    if(r==='epic')return {money:6000,skillPoints:1,fame:1,label:`${fmtMoney(6000)} + 1 Skill Point`};
    if(r==='rare')return {money:2500,happiness:2,label:`${fmtMoney(2500)} + Happiness`};
    return {money:800,happiness:1,label:`${fmtMoney(800)} + small Happiness`};
  }
  function applyAchReward(id){
    const G=window.G; if(!G||!id||!Array.isArray(window.ACHIEVEMENTS))return;
    if(!G.achievementRewarded)G.achievementRewarded={};
    if(G.achievementRewarded[id])return;
    const ach=ACHIEVEMENTS.find(a=>a.id===id); if(!ach)return;
    const r=achReward(ach); G.achievementRewarded[id]=true;
    if((G.age||0)<18)G.familySupport=Math.max(0,Math.round((G.familySupport||0)+(r.money||0)));
    else G.money=Math.max(0,Math.round((G.money||0)+(r.money||0)));
    G.happiness=clamp((G.happiness||50)+(r.happiness||0));
    G.fame=clamp((G.fame||0)+(r.fame||0));
    if(r.skillPoints)G.skillPoints=(G.skillPoints||0)+r.skillPoints;
    if(r.legacy)G.legacyMultiplier=Number(((G.legacyMultiplier||1)+r.legacy).toFixed(3));
    log(`🏆 Achievement reward: ${ach.name} gave ${r.label}.`,'special');
  }

  function patchEverything(){
    if(window._goalsUiPatched)return; window._goalsUiPatched=true;
    try{ if(window.App)App.VERSION=1; if(window.UI)UI.VERSION=1; if(window.Engine)Engine.VERSION=1; if(window.Save)Save.VERSION=1; }catch(_){ }

    if(window.UI && UI.renderLog && !UI._goalsUiRenderLog){
      const old=UI.renderLog.bind(UI);
      UI.renderLog=function(){
        const G=window.G; const prev=this._logFilter;
        this._logFilter='all';
        const out=old();
        this._logFilter=prev||'all';
        const life=document.getElementById('tab-life');
        if(G&&life&&life.classList.contains('active')){
          const anchor=$('.life-log-toolbar',life)||$('.life-log-actions',life)||life.firstElementChild;
          if(!$('.goal-ui-quests',life) && anchor)anchor.insertAdjacentHTML('beforebegin', questsHTML(G));
          enhanceTimeline();
        }
        return out;
      };
      UI._goalsUiRenderLog=true;
    }

    if(window.Engine && Engine.ageUp && !Engine._goalsUiAgeUp){
      const oldAge=Engine.ageUp.bind(Engine);
      Engine.ageUp=function(){ const res=oldAge(); try{ ensureQuests(window.G,true); }catch(_){ } return res; };
      Engine._goalsUiAgeUp=true;
    }

    if(window.Assets && Assets.render && !Assets._goalsUiRender){
      const oldAssets=Assets.render.bind(Assets);
      Assets.render=function(){ const out=oldAssets(); try{ const el=document.getElementById('tab-assets'); if(window.G&&el&&!$('.goal-ui-assets2',el)){ const anchor=$('.nw-box',el)||el.firstElementChild; if(anchor)anchor.insertAdjacentHTML('afterend',assets2HTML(window.G)); else el.insertAdjacentHTML('afterbegin',assets2HTML(window.G)); }}catch(e){console.warn('[release assets]',e);} return out; };
      Assets.VERSION=1; Assets._goalsUiRender=true;
    }

    if(window.Save && Save.unlockAch && !Save._goalsUiAchRewards){
      const oldUnlock=Save.unlockAch.bind(Save);
      Save.unlockAch=function(id){ const result=oldUnlock(id); if(result)applyAchReward(id); return result; };
      Save._goalsUiAchRewards=true;
    }

    if(window.App && !App._goalsUiAchievementDetail){
      const oldDetail=App.showAchievementDetail?.bind(App);
      App.showAchievementDetail=function(id){
        if(oldDetail)oldDetail(id);
        setTimeout(()=>{
          const ach=(window.ACHIEVEMENTS||[]).find(a=>a.id===id); const body=$('#advisor-ui-ach-detail-body'); if(!ach||!body)return;
          const r=achReward(ach);
          if(!$('.goal-ui-ach-reward',body))body.insertAdjacentHTML('beforeend',`<div class="goal-ui-ach-reward"><b>🎁 Unlock Reward</b><span>${esc(r.label)}</span><small>Rewards apply once when the achievement unlocks.</small></div>`);
        },0);
      };
      App._goalsUiAchievementDetail=true;
    }

    if(window.Goals && !Goals._goalsUiRender){
      Goals.VERSION=1;
      const oldGoalsRender=Goals.render?.bind(Goals);
      if(oldGoalsRender){
        Goals.render=function(){ const out=oldGoalsRender(); try{ const el=document.getElementById('tab-goals'); if(window.G&&el&&!$('.goal-ui-quests',el)){ el.insertAdjacentHTML('afterbegin',questsHTML(window.G)); }}catch(_){ } return out; };
      }
      Goals._goalsUiRender=true;
    }

    setVersionLabels();
  }

  window.LifeSystemsUI={
    BUILD,
    ensureQuests,
    claimQuest,
    refreshYearQuests,
    applyTimelineFilter,
    upgradeBestRental,
    advisorCards,
    achReward,
  };

  document.addEventListener('DOMContentLoaded',()=>{ patchEverything(); setVersionLabels(); });
  window.addEventListener('load',()=>{ patchEverything(); setVersionLabels(); });
  setTimeout(()=>{ patchEverything(); setVersionLabels(); },50);
})();


/* LifeSim — No Casino + Size Cleanup
   Fixes unfinished asset market data, adds optional free public API sync, and improves UI recovery without adding another visible tab. */
(function(){
  'use strict';
  const BUILD='release-live-data';
  const CACHE_KEY='lifesim_live_api_cache_v1';
  const CACHE_TTL=1000*60*60*24;
  const API_PREFIX='v';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attr=(v)=>esc(v).replace(/`/g,'&#96;');
  const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,n(v,min)));
  const money=(v)=>{try{return typeof fmt==='function'?fmt(Math.round(v||0)):'Kč'+Math.round(v||0).toLocaleString();}catch(_){return 'Kč'+Math.round(v||0).toLocaleString();}};
  const moneyFull=(v)=>{try{return typeof fmtFull==='function'?fmtFull(Math.round(v||0)):money(v);}catch(_){return money(v);}};
  const scale=(v)=>{try{return typeof sc==='function'?sc(v):v;}catch(_){return v;}};
  const toast=(msg,type='neutral')=>{try{UI?.toast?.(msg,type);}catch(_){}};
  const log=(msg,type='neutral')=>{try{Engine?.log?.(msg,type);}catch(_){}};
  const update=()=>{try{UI?.update?.();}catch(_){}};

  function countryCode(){
    const G=window.G;
    if(G?.country?.code)return String(G.country.code).toUpperCase();
    const sel=document.getElementById('inp-country');
    if(sel&&Array.isArray(window.COUNTRIES)){const c=COUNTRIES[parseInt(sel.value,10)||0]; if(c?.code)return String(c.code).toUpperCase();}
    return 'CZ';
  }
  function currentCountry(){
    const code=countryCode();
    return (window.G?.country)||((window.COUNTRIES||[]).find(c=>String(c.code).toUpperCase()===code))||{};
  }
  function readCache(){
    try{const raw=localStorage.getItem(CACHE_KEY); if(!raw)return null; const d=JSON.parse(raw); return d&&typeof d==='object'?d:null;}catch(_){return null;}
  }
  function writeCache(data){try{localStorage.setItem(CACHE_KEY,JSON.stringify(data));}catch(_){}}
  function isFresh(data){return data?.updatedAt&&(Date.now()-data.updatedAt)<CACHE_TTL;}
  async function fetchJson(url,ms=6500){
    if(typeof fetch!=='function')throw new Error('Fetch unavailable');
    const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),ms);
    try{const r=await fetch(url,{headers:{Accept:'application/json'},signal:ctrl.signal,cache:'no-cache'}); if(!r.ok)throw new Error('HTTP '+r.status); return await r.json();}
    finally{clearTimeout(timer);}
  }
  function nextHoliday(rows){
    const today=new Date(); today.setHours(0,0,0,0);
    return (Array.isArray(rows)?rows:[]).map(h=>({...h,_date:new Date(h.date+'T00:00:00')})).filter(h=>h._date>=today).sort((a,b)=>a._date-b._date)[0]||null;
  }
  function normalizeFx(fx,currency){
    const rates=fx?.rates||{}; const code=String(currency||'CZK').toUpperCase();
    const local=code==='USD'?1:n(rates[code],null);
    return {base:fx?.base||'USD',date:fx?.date||'',currency:code,local,rateText:local?`1 USD ≈ ${Number(local).toFixed(local>50?0:2)} ${code}`:'Rate unavailable',rates};
  }
  async function syncLiveData(force=false){
    const cached=readCache();
    if(cached&&isFresh(cached)&&!force){renderPanel(cached);return cached;}
    const c=currentCountry(); const code=countryCode(); const currency=(c.currencyCode||'CZK').toUpperCase(); const year=new Date().getFullYear();
    const result={updatedAt:Date.now(),code,currency,status:{country:'pending',holidays:'pending',fx:'pending'},country:null,holidays:[],nextHoliday:null,fx:null,errors:[]};
    const urls={
      country:`https://restcountries.com/${API_PREFIX}3.1/alpha/${encodeURIComponent(code)}?fields=name,flags,currencies,capital,region,subregion,population,cca2,cca3`,
      holidays:`https://date.nager.at/api/${API_PREFIX}3/PublicHolidays/${year}/${encodeURIComponent(code)}`,
      fx:`https://api.frankfurter.dev/${API_PREFIX}1/latest?base=USD&symbols=EUR,CZK,GBP,JPY,CHF,CAD,AUD,PLN,NOK,SEK,DKK`
    };
    const [countryRes,holidayRes,fxRes]=await Promise.allSettled([fetchJson(urls.country),fetchJson(urls.holidays),fetchJson(urls.fx)]);
    if(countryRes.status==='fulfilled'){result.country=Array.isArray(countryRes.value)?countryRes.value[0]:countryRes.value; result.status.country='ok';}else{result.status.country='offline'; result.errors.push('Country data offline');}
    if(holidayRes.status==='fulfilled'){result.holidays=Array.isArray(holidayRes.value)?holidayRes.value:[]; result.nextHoliday=nextHoliday(result.holidays); result.status.holidays='ok';}else{result.status.holidays='offline'; result.errors.push('Holiday API offline');}
    if(fxRes.status==='fulfilled'){result.fx=normalizeFx(fxRes.value,currency); result.status.fx='ok';}else{result.fx=normalizeFx(null,currency); result.status.fx='offline'; result.errors.push('FX API offline');}
    writeCache(result);
    if(window.G){
      G.liveData=result;
      if(!G.liveDataSyncedAt||Date.now()-G.liveDataSyncedAt>1000*60*15){
        G.liveDataSyncedAt=Date.now();
        const bits=[]; if(result.country?.name?.common)bits.push(result.country.name.common); if(result.nextHoliday?.localName)bits.push('next holiday: '+result.nextHoliday.localName); if(result.fx?.local)bits.push(result.fx.rateText);
        log(`🌍 Live data synced${bits.length?': '+bits.join(' · '):'.'}`,'neutral');
      }
      update();
    }
    renderPanel(result);
    return result;
  }
  function statusClass(data){
    const values=Object.values(data?.status||{}); if(values.every(v=>v==='ok'))return 'good'; if(values.some(v=>v==='ok'))return 'warn'; return 'bad';
  }
  function apiSummaryHTML(data=readCache()){
    const c=data?.country; const h=data?.nextHoliday; const fx=data?.fx; const cls=statusClass(data);
    const countryName=c?.name?.common||currentCountry().name||'Offline country profile';
    const population=c?.population?Number(c.population).toLocaleString():'—';
    const currency=fx?.rateText||`${currentCountry().currencyCode||'CZK'} cache pending`;
    const holiday=h?`${h.localName||h.name} · ${h.date}`:'No upcoming holiday cached';
    const updated=data?.updatedAt?new Date(data.updatedAt).toLocaleString():'Never synced';
    return `<div class="liveapi-grid">
      <div class="liveapi-chip"><span>Country</span><b>${esc(countryName)}</b><small>${esc(c?.region||currentCountry().region||'Local baseline')}</small></div>
      <div class="liveapi-chip"><span>Population</span><b>${esc(population)}</b><small>REST Countries cache</small></div>
      <div class="liveapi-chip"><span>FX</span><b>${esc(currency)}</b><small>Frankfurter daily rates</small></div>
      <div class="liveapi-chip"><span>Holiday</span><b>${esc(holiday)}</b><small>Nager.Date calendar</small></div>
      <div class="liveapi-chip"><span>Status</span><b>${esc(Object.values(data?.status||{}).join(' / ')||'offline')}</b><small>Graceful fallback enabled</small></div>
      <div class="liveapi-chip"><span>Updated</span><b>${esc(updated)}</b><small>Stored locally</small></div>
    </div><div class="liveapi-status ${cls}">${data?.errors?.length?esc(data.errors.join(' · ')):'Online data is optional. The game still works fully offline.'}</div>`;
  }
  function panelHTML(){
    return `<section class="liveapi-panel" id="liveapi-panel"><div class="liveapi-head"><div><h3>🌍 Live Data</h3><p>Optional browser-only sync. It enriches country, holidays and FX data without breaking offline play.</p></div><div class="liveapi-actions"><button type="button" onclick="PremiumAssets.syncLiveData(true)">Sync now</button><button type="button" onclick="PremiumAssets.clearLiveData()">Clear cache</button></div></div><div id="liveapi-body">${apiSummaryHTML()}</div></section>`;
  }
  function renderPanel(data=readCache()){
    const body=document.getElementById('liveapi-body'); if(body)body.innerHTML=apiSummaryHTML(data);
  }
  function injectSettingsPanel(){
    const modal=document.getElementById('settings-modal'); if(!modal||modal.querySelector('#liveapi-panel'))return;
    const slot=modal.querySelector('#liveapi-settings-slot');
    const fallback=modal.querySelector('[data-settings-panel="data"]')||modal.querySelector('.settings-content')||modal.querySelector('.modal-box');
    const target=slot||fallback;
    if(target){
      if(slot)target.innerHTML=panelHTML();
      else target.insertAdjacentHTML('beforeend',panelHTML());
    }
  }
  function worldChipHTML(){
    const data=readCache(); if(!data||!isFresh(data))return '';
    const h=data.nextHoliday?.localName?` · ${data.nextHoliday.localName}`:'';
    const fx=data.fx?.rateText?` · ${data.fx.rateText}`:'';
    return `<div class="premium-ui-world-chip">🌍 Live context: ${esc(data.country?.name?.common||currentCountry().name||countryCode())}${esc(h)}${esc(fx)}</div>`;
  }
  function injectWorldChip(tab){
    if(!['assets','career','stocks','mind'].includes(tab))return;
    const el=document.getElementById('tab-'+tab); if(!el||el.querySelector('.premium-ui-world-chip'))return;
    const chip=worldChipHTML(); if(chip)el.insertAdjacentHTML('afterbegin',chip);
  }

  function premiumBuckets(G=window.G){
    if(!G)return {business:[],luxury:[],collectibles:[],homeUpgrades:{}};
    G.assets=G.assets||{properties:[],vehicles:[]};
    if(!Array.isArray(G.assets.businessAssets))G.assets.businessAssets=[];
    if(!Array.isArray(G.assets.luxuryAssets))G.assets.luxuryAssets=[];
    if(!Array.isArray(G.assets.collectibles))G.assets.collectibles=[];
    if(!G.assets.homeUpgrades||typeof G.assets.homeUpgrades!=='object')G.assets.homeUpgrades={};
    return {business:G.assets.businessAssets,luxury:G.assets.luxuryAssets,collectibles:G.assets.collectibles,homeUpgrades:G.assets.homeUpgrades};
  }
  function sumValue(arr){return (arr||[]).reduce((a,x)=>a+n(x.value,0),0);}
  function premiumValue(G=window.G){const b=premiumBuckets(G);return sumValue(b.business)+sumValue(b.luxury)+sumValue(b.collectibles);}
  function buyPremium(kind,id){
    const G=window.G; if(!G||!G.assets)return;
    if((G.age||0)<18)return toast('Premium assets unlock at 18.','bad');
    const maps={business:window.BUSINESS_ASSETS||[],luxury:window.LUXURY_ASSETS||[],collectible:window.COLLECTIBLES||[]};
    const arr=maps[kind]||[]; const item=arr.find(x=>x.id===id); if(!item)return toast('Asset not found.','bad');
    const b=premiumBuckets(G); const dest=kind==='business'?b.business:kind==='luxury'?b.luxury:b.collectibles;
    if(dest.some(x=>x.id===id))return toast(`You already own ${item.name}.`,'neutral');
    const price=scale(item.price||0); if((G.money||0)<price)return toast(`Need ${money(price)}.`, 'bad');
    G.money=Math.max(0,Math.round((G.money||0)-price));
    dest.push({...item,price,value:scale(item.value||item.price||0),condition:n(item.condition,84),ageBought:G.age||0,yearsOwned:0});
    log(`${item.icon||'💼'} Bought ${item.name} for ${money(price)}.`, kind==='business'?'money':'good');
    try{Assets?._recordAssetEvent?.(`${kind}-buy`,{label:item.name,amount:price});}catch(_){ }
    update(); try{Assets?.render?.();}catch(_){ }
  }
  function sellPremium(kind,index){
    const G=window.G; if(!G)return;
    const b=premiumBuckets(G); const arr=kind==='business'?b.business:kind==='luxury'?b.luxury:b.collectibles;
    const item=arr[index]; if(!item)return;
    const value=Math.max(0,Math.round(n(item.value,0)*(0.90+Math.random()*0.12)));
    if(!confirm(`Sell ${item.name}?\n\nEstimated value: ${money(value)}`))return;
    G.money=(G.money||0)+value; arr.splice(index,1);
    log(`💸 Sold ${item.name} for ${money(value)}.`, 'money');
    update(); try{Assets?.render?.();}catch(_){ }
  }
  function upgradeHome(propIndex,id){
    const G=window.G; if(!G?.assets?.properties)return;
    const p=G.assets.properties[propIndex]; const up=(window.HOME_UPGRADES||[]).find(x=>x.id===id);
    if(!p||!up)return; if((G.age||0)<18)return toast('Home upgrades unlock at 18.','bad');
    p.upgradeIds=Array.isArray(p.upgradeIds)?p.upgradeIds:[];
    if(p.upgradeIds.includes(id))return toast(`${up.name} is already installed.`, 'neutral');
    const price=scale(up.price||0); if((G.money||0)<price)return toast(`Need ${money(price)}.`, 'bad');
    G.money-=price; p.upgradeIds.push(id); p.upgrades=(p.upgrades||0)+1; p.condition=cl((p.condition||75)+n(up.conditionBoost,3));
    p.value=Math.round((p.value||0)*(1+n(up.valueBoost,0.02))); if(p.rent>0&&up.rentBoost)p.rent=Math.round((p.rent||0)*(1+up.rentBoost));
    if(up.happiness)G.happiness=cl((G.happiness||50)+up.happiness); if(up.fitness)G.fitness=cl((G.fitness||50)+up.fitness); if(up.smarts)G.smarts=cl((G.smarts||50)+up.smarts); if(up.stress)G.stress=cl((G.stress||0)+up.stress);
    log(`🛠️ Installed ${up.name} on ${p.name}.`, 'special');
    update(); try{Assets?.render?.();}catch(_){ }
  }
  function marketCard(kind,item,owned,index=null){
    const price=scale(item.price||0); const can=(window.G?.money||0)>=price; const locked=!can&&!owned;
    const onclick=owned?`PremiumAssets.sellPremium('${kind}',${index})`:(locked?`UI.toast('Need ${attr(money(price))}.','bad')`:`PremiumAssets.buyPremium('${kind}','${attr(item.id)}')`);
    const extra=item.income?` · income ${money(scale(item.income))}/yr`:item.status?` · status +${item.status}`:item.volatility?` · volatile`:'';
    return `<article class="premium-ui-market-card ${locked?'locked':''}"><span class="premium-ui-ico">${esc(item.icon||'💼')}</span><div><b>${esc(item.name)}</b><p>${esc(item.desc||'Premium asset')}${esc(extra)}</p></div><div class="premium-ui-card-foot"><span class="premium-ui-pill ${owned?'good':''}">${owned?'Owned':money(price)}</span><button type="button" class="premium-ui-buy ${owned?'sell':''} ${locked?'locked':''}" onclick="${onclick}">${owned?'Sell':locked?'Need cash':'Buy'}</button></div></article>`;
  }
  function premiumMarketHTML(G=window.G){
    if(!G||!G.assets||(G.age||0)<18)return '';
    const b=premiumBuckets(G); const value=premiumValue(G); const income=b.business.reduce((a,x)=>a+scale(n(x.income,0))*((x.condition||80)/100),0);
    const weak=[...b.business.map((x,i)=>({...x,kind:'business',i})),...b.luxury.map((x,i)=>({...x,kind:'luxury',i})),...b.collectibles.map((x,i)=>({...x,kind:'collectible',i}))].sort((a,b)=>n(a.condition,80)-n(b.condition,80))[0];
    const biz=(window.BUSINESS_ASSETS||[]).slice(0,6).map(item=>marketCard('business',item,b.business.some(x=>x.id===item.id),b.business.findIndex(x=>x.id===item.id))).join('');
    const lux=(window.LUXURY_ASSETS||[]).slice(0,6).map(item=>marketCard('luxury',item,b.luxury.some(x=>x.id===item.id),b.luxury.findIndex(x=>x.id===item.id))).join('');
    const col=(window.COLLECTIBLES||[]).slice(0,6).map(item=>marketCard('collectible',item,b.collectibles.some(x=>x.id===item.id),b.collectibles.findIndex(x=>x.id===item.id))).join('');
    const home=(G.assets.properties||[]).filter(p=>p.rent===0||p.rent>0).slice(0,3).map((p,i)=>{
      const opts=(window.HOME_UPGRADES||[]).filter(up=>!(p.upgradeIds||[]).includes(up.id)).slice(0,3);
      return `<div class="premium-ui-clean-panel"><div class="premium-ui-section-head"><div><h3>🛠️ Upgrade ${esc(p.name)}</h3><p>Upgrades connect property value, rent, condition and lifestyle.</p></div><span class="premium-ui-pill">${Math.round(p.condition||75)}% condition</span></div><div class="premium-ui-market-grid">${opts.length?opts.map(up=>`<article class="premium-ui-market-card"><span class="premium-ui-ico">${esc(up.icon)}</span><div><b>${esc(up.name)}</b><p>${esc(up.desc)}</p></div><div class="premium-ui-card-foot"><span class="premium-ui-pill">${money(scale(up.price))}</span><button type="button" class="premium-ui-buy" onclick="PremiumAssets.upgradeHome(${i},'${attr(up.id)}')">Install</button></div></article>`).join(''):'<div class="premium-ui-empty-note">All shown upgrades are already installed on this asset.</div>'}</div></div>`;
    }).join('');
    return `<section class="premium-ui-premium-market" id="premium-ui-premium-market"><div class="premium-ui-section-head"><div><h3>🏛️ Premium Asset Market</h3><p>Business assets, luxury assets and collectibles are now connected to cashflow, status, condition and net worth.</p></div><strong>${moneyFull(value)}</strong></div><div class="premium-ui-metric-grid"><div class="premium-ui-metric"><span>Premium value</span><b>${moneyFull(value)}</b><small>Included in net worth</small></div><div class="premium-ui-metric"><span>Side income</span><b>${money(income)}/yr</b><small>From business assets</small></div><div class="premium-ui-metric"><span>Weakest item</span><b>${weak?esc(weak.name):'None'}</b><small>${weak?Math.round(weak.condition||80)+'% condition':'Buy assets first'}</small></div></div><div class="sec">Business Assets</div><div class="premium-ui-market-grid">${biz||'<div class="premium-ui-empty-note">No business assets loaded.</div>'}</div><div class="sec">Luxury Assets</div><div class="premium-ui-market-grid">${lux||'<div class="premium-ui-empty-note">No luxury assets loaded.</div>'}</div><div class="sec">Collectibles</div><div class="premium-ui-market-grid">${col||'<div class="premium-ui-empty-note">No collectibles loaded.</div>'}</div>${home}</section>`;
  }
  function premiumTick(){
    const G=window.G; if(!G||!G.assets||(G.age||0)<18)return;
    if(G._premiumAssetsPremiumTickAge===G.age)return; G._premiumAssetsPremiumTickAge=G.age;
    const b=premiumBuckets(G); let income=0, incidents=0;
    b.business.forEach(x=>{x.yearsOwned=(x.yearsOwned||0)+1; const earned=Math.round(scale(n(x.income,0))*((x.condition||80)/100)*(0.82+Math.random()*0.36)); income+=earned; x.condition=cl((x.condition||80)-(2+Math.random()*6)); x.value=Math.max(0,Math.round((x.value||0)*(0.96+Math.random()*0.10))); if((x.condition||80)<45&&Math.random()<0.18){incidents++; G.stress=cl((G.stress||0)+2);} });
    b.luxury.forEach(x=>{x.yearsOwned=(x.yearsOwned||0)+1; x.condition=cl((x.condition||88)-(1+Math.random()*3)); x.value=Math.max(0,Math.round((x.value||0)*(0.94+Math.random()*0.11))); if(x.status)G.fame=cl((G.fame||0)+0.15);});
    b.collectibles.forEach(x=>{x.yearsOwned=(x.yearsOwned||0)+1; const vol=n(x.volatility,.12); x.condition=cl((x.condition||86)-(Math.random()*2)); x.value=Math.max(0,Math.round((x.value||0)*(1-vol/2+Math.random()*vol)));});
    (G.assets.vehicles||[]).forEach(v=>{ const risk=n(v.accidentRisk,.018)*(v.condition<45?2.3:v.condition<65?1.45:1); if(Math.random()<risk){incidents++; v.condition=cl((v.condition||70)-Math.round(10+Math.random()*18)); v.value=Math.max(0,Math.round((v.value||0)*(0.90-Math.random()*0.08))); G.stress=cl((G.stress||0)+3); log(`⚠️ ${v.name} had a costly vehicle incident. Service it soon.`, 'bad'); }});
    if(income>0){G.money=(G.money||0)+income; log(`🏢 Premium business assets produced ${money(income)} this year.`, 'money');}
    if(incidents>0)log(`🔧 ${incidents} asset issue${incidents!==1?'s':''} need attention.`, 'neutral');
  }
  function patchAssets(){
    if(!window.Assets||Assets._premiumAssetsPatched)return; Assets._premiumAssetsPatched=true;
    Assets.serviceWeakest=function(){
      const G=window.G; if(!G?.assets)return;
      const items=[...(G.assets.properties||[]).map((x,i)=>({type:'p',x,i,c:x.condition||80})),...(G.assets.vehicles||[]).map((x,i)=>({type:'v',x,i,c:x.condition||80}))].sort((a,b)=>a.c-b.c);
      const target=items[0]; if(!target)return toast('No asset to service yet.','neutral');
      if(target.type==='p')return Assets.manageProp(target.i,(target.x.condition||80)<70?'maintain':'renovate');
      return Assets.serviceVeh(target.i);
    };
    Assets.sellWeakestVehicle=function(){
      const G=window.G; const v=(G?.assets?.vehicles||[]).map((x,i)=>({x,i,c:x.condition||80})).sort((a,b)=>a.c-b.c)[0];
      if(!v)return toast('No vehicle to sell.','neutral'); return Assets.sellVeh(v.i);
    };
    const oldRender=Assets.render.bind(Assets);
    Assets.render=function(){ const out=oldRender(); try{ const el=document.getElementById('tab-assets'); if(el&&window.G&&!el.querySelector('#premium-ui-premium-market')){ el.insertAdjacentHTML('beforeend',premiumMarketHTML(window.G)); }}catch(e){console.warn('[release assets render]',e);} return out; };
  }
  function patchNetWorth(){
    if(window._premiumAssetsNetWorthPatched||typeof window.netWorth!=='function')return; window._premiumAssetsNetWorthPatched=true;
    const old=window.netWorth;
    window.netWorth=function(G){ return old(G)+premiumValue(G); };
  }
  function cleanVisibleText(root=document){
    try{
      $$('#tab-family:empty,#tab-travel:empty,.legacy-ui-subhub:empty',root).forEach(el=>el.remove());
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){const t=node.nodeValue||''; return /(\b\d+\s+available\b|Always available|Cleaner nav|Open only when you need them|Extra paths)/i.test(t)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;}});
      const nodes=[]; while(walker.nextNode())nodes.push(walker.currentNode);
      nodes.forEach(node=>{node.nodeValue=(node.nodeValue||'').replace(/\b\d+\s+available\b/gi,'').replace(/Always available/gi,'').replace(/Cleaner nav\s*·?\s*/gi,'').replace(/Open only when you need them/gi,'').replace(/Extra paths/gi,'');});
      $$('.card,.row-card,.premium-ui-market-card',root).forEach(el=>{ if(/undefined|null|NaN/i.test(el.textContent||''))el.classList.add('premium-ui-needs-review'); });
    }catch(e){console.warn('[release cleanup]',e);}
  }
  function patchUI(){
    if(!window.UI||UI._premiumAssetsPatched)return; UI._premiumAssetsPatched=true;
    const oldOpen=UI.openSettings?.bind(UI);
    UI.openSettings=function(){ const out=oldOpen?oldOpen():undefined; setTimeout(()=>{injectSettingsPanel(); renderPanel(readCache());},0); return out; };
    const oldRender=UI._renderTab?.bind(UI);
    UI._renderTab=function(name){ const out=oldRender?oldRender(name):undefined; try{injectWorldChip(name); cleanVisibleText(document.getElementById('tab-'+name)||document);}catch(_){ } return out; };
    const oldRefresh=UI.refreshActiveTab?.bind(UI);
    UI.refreshActiveTab=function(){ const out=oldRefresh?oldRefresh():undefined; setTimeout(()=>cleanVisibleText(document),0); return out; };
  }
  function patchEngine(){
    if(!window.Engine||Engine._premiumAssetsPatched)return; Engine._premiumAssetsPatched=true;
    if(Array.isArray(Engine._moduleOrder)&&!Engine._moduleOrder.includes('PremiumAssets.premiumTick')){
      const i=Engine._moduleOrder.indexOf('Assets.tick'); Engine._moduleOrder.splice(i>=0?i+1:Engine._moduleOrder.length,0,'PremiumAssets.premiumTick');
    }
  }
  function updateVersionLabels(){
    try{
      document.title='LifeSim';
      const app=document.getElementById('app'); if(app){app.dataset.version='release';app.dataset.build=BUILD;}
      document.querySelectorAll('.ver-badge,.splash-foot').forEach(el=>{ if(/v\d/i.test(el.textContent||''))el.textContent=(el.textContent||'').replace(/v\d+(?:\.\d+)*/g,'release').replace(/Clean Life Tab Hotfix|Assets & Premium Feel Update|Gameplay Feel Update/g,'Stability + Live Data Update'); });
      const badge=document.querySelector('#splash-screen .splash-logo .ver-badge'); if(badge)badge.textContent='LifeSim';
      const foot=document.querySelector('.splash-foot'); if(foot)foot.textContent='LifeSim · made by tommyy.fit';
      if(window.App)App.VERSION=1; if(window.UI)UI.VERSION=1; if(window.Engine)Engine.VERSION=1; if(window.Save)Save.VERSION=1;
      document.body.classList.add('premium-ui-ui');
    }catch(_){ }
  }
  function boot(){ patchNetWorth(); patchAssets(); patchUI(); patchEngine(); updateVersionLabels(); cleanVisibleText(document); }
  window.PremiumAssets={BUILD,syncLiveData,clearLiveData(){try{localStorage.removeItem(CACHE_KEY);}catch(_){ } renderPanel(null); toast('Live data cache cleared.','neutral');},buyPremium,sellPremium,upgradeHome,premiumTick,premiumMarketHTML,readCache};
  document.addEventListener('DOMContentLoaded',boot);
  window.addEventListener('load',()=>{boot(); setTimeout(()=>{injectSettingsPanel(); cleanVisibleText(document);},100);});
  setTimeout(boot,80);
})();


/* LifeSim — No Casino + Size Cleanup
   Fixes the broken Crime tab with a clean grouped dashboard. */
(function(){
  'use strict';
  const BUILD='release-crime';
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attr=(v)=>esc(v).replace(/`/g,'&#96;');
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
  const money=(v)=>{ try{return typeof fmt==='function'?fmt(Math.round(v||0)):'Kč'+Math.round(v||0).toLocaleString('cs-CZ');}catch(_){return 'Kč'+Math.round(v||0).toLocaleString('cs-CZ');} };
  function setLabels(){
    try{
      document.title='LifeSim';
      const app=document.getElementById('app'); if(app){app.dataset.version='release';app.dataset.build=BUILD;}
      document.querySelectorAll('.ver-badge,.splash-foot').forEach(el=>{
        if(/v\d/i.test(el.textContent||'')) el.textContent=(el.textContent||'').replace(/v\d+(?:\.\d+)*/g,'release').replace(/Stability \+ Live Data Update|Clean Life Tab Hotfix|Assets & Premium Feel Update|Gameplay Feel Update/g,'Stability Update');
      });
      const badge=document.querySelector('#splash-screen .splash-logo .ver-badge'); if(badge)badge.textContent='LifeSim';
      const foot=document.querySelector('.splash-foot'); if(foot)foot.textContent='LifeSim · made by tommyy.fit';
      if(window.App)App.VERSION=1; if(window.UI)UI.VERSION=1; if(window.Engine)Engine.VERSION=1; if(window.Save)Save.VERSION=1; if(window.Crime)Crime.VERSION=1;
      document.body.classList.add('crime-ui-ui');
    }catch(_){ }
  }
  function riskTone(risk){ return risk>=60?'bad':risk>=35?'warn':'good'; }
  function tierMeta(tier){
    const map={
      Starter:['Starter moves','Low entry risk. Use these when heat is high or you are building intel.'],
      Smart:['Smart schemes','Planning, smarts and intel matter more than brute force.'],
      Heavy:['Heavy jobs','High payouts, more heat and bigger legal consequences.'],
      Elite:['Elite operations','Serious upside. Only push these when your setup is strong.'],
      Finale:['Finale jobs','Endgame-level risk and reward. This can change your life fast.']
    };
    return map[tier]||[tier+' moves','Crime actions grouped by risk tier.'];
  }
  function actionButton(icon,title,sub,action){
    return `<button type="button" class="crime-ui-action" onclick="${attr(action)}"><b>${esc(icon)} ${esc(title)}</b><small>${esc(sub)}</small></button>`;
  }
  function stat(label,value,sub,tone='accent'){
    return `<div class="crime-ui-stat"><span>${esc(label)}</span><b class="${esc(tone)}">${esc(value)}</b><small>${esc(sub)}</small></div>`;
  }
  function moveCard(id,job){
    const C=window.Crime; if(!C)return '';
    const lock=C._locked?C._locked(job):'';
    const risk=C._risk?C._risk(job):Math.round((job.catch||0)*100);
    const reward=C._previewReward?C._previewReward(job):Math.round((((job.reward||[0,0])[0]||0)+((job.reward||[0,0])[1]||0))/2);
    const onclick=lock?`UI.toast('${attr(lock)}','bad')`:`Crime.do('${attr(id)}')`;
    return `<button type="button" class="crime-ui-move ${lock?'locked':''}" onclick="${onclick}" title="${attr(lock||job.desc||'')}">
      <div>
        <div class="crime-ui-move-top"><span class="crime-ui-move-ico">${esc(lock?'🔒':job.icon||'🚔')}</span><span class="crime-ui-tier-pill">${esc(job.tier||'Move')}</span></div>
        <h4>${esc(job.label||id)}</h4>
        <p>${esc(lock||job.desc||'')}</p>
      </div>
      <div class="crime-ui-chip-row">
        <span class="crime-ui-chip good">${money(reward)}</span>
        <span class="crime-ui-chip ${riskTone(risk)}">${Math.round(risk)}% risk</span>
        <span class="crime-ui-chip accent">+${esc(job.rep||0)} rep</span>
      </div>
    </button>`;
  }
  function historyHTML(){
    const C=window.Crime,G=window.G||{}; const h=(G.crimeHistory||[]).slice(-6).reverse();
    if(!h.length)return '';
    return `<section class="crime-ui-history"><h3>Recent outcomes</h3><div class="crime-ui-history-list">${h.map(item=>`<div class="crime-ui-history-item">Age ${esc(item.age)} · ${esc(item.label)} · ${esc(item.result)}${item.money?` · ${item.money>0?'+':''}${money(item.money)}`:''}</div>`).join('')}</div></section>`;
  }
  function guidance(G,heat,rep,intel){
    if(heat>=70)return ['Lay low now','Heat is in the danger zone. Use Lay Low, Lawyer or Legal Cash before another major move.'];
    if(intel<18)return ['Build intel first','Plan Move improves odds and makes larger jobs feel less random.'];
    if(rep<20)return ['Build reputation slowly','Starter or Smart moves are the safest way to unlock better options without instantly ruining the run.'];
    if(G.gang)return ['Manage your network','Your gang can boost payouts, but gang heat and loyalty can spiral if you push too hard.'];
    return ['Pick one move with purpose','Choose based on heat, intel and your current life goals — crime should feel risky, not spammy.'];
  }
  function renderCrime(){
    const C=window.Crime,G=window.G,el=document.getElementById('tab-crime'); if(!C||!G||!el)return;
    try{ C._ensure?.(); }catch(_){ }
    if((G.age||0)<18){ el.innerHTML=`<div class="crime-ui-empty"><b>👮 Crime unlocks at age 18.</b><p>Focus on school, skills, relationships and legal money for now.</p></div>`; return; }
    if(G.inPrison&&typeof C._renderPrison==='function'){ el.innerHTML=(C._styles?C._styles():'')+C._renderPrison(); return; }
    const heat=clamp(G.crimeHeat||0), rep=clamp(G.underworldRep||0), intel=clamp(G.crimeIntel||0), streak=Math.max(0,Math.round(G.crimeStreak||0)), record=(G.crimes||[]).length, lawyer=Math.max(0,Math.round(G.lawyerRetainer||0));
    const jobs=Object.entries(window.CRIME_JOBS||{});
    const tiers=['Starter','Smart','Heavy','Elite','Finale'];
    const [gTitle,gText]=guidance(G,heat,rep,intel);
    const tierHTML=tiers.map(tier=>{
      const list=jobs.filter(([id,job])=>(job.tier||'Starter')===tier);
      if(!list.length)return '';
      const [title,sub]=tierMeta(tier);
      const open=(tier==='Starter'||tier==='Smart'||(tier==='Heavy'&&rep>=20));
      return `<details class="crime-ui-tier" ${open?'open':''}><summary><div class="crime-ui-tier-title"><b>${esc(title)}</b><span>${esc(sub)}</span></div><span class="crime-ui-tier-count">${list.length} moves</span></summary><div class="crime-ui-move-grid">${list.map(([id,job])=>moveCard(id,job)).join('')}</div></details>`;
    }).join('');
    const heatLabel=C._heatLabel?C._heatLabel(heat):(heat>=75?'Danger zone':heat>=45?'Risky':heat>=20?'Watch it':'Safe');
    const outcome=G.lastCrimeOutcome&&C._resultHTML?C._resultHTML(G.lastCrimeOutcome):'';
    el.innerHTML=`<div class="crime-ui crime-ui-crime">
      <section class="crime-ui-crime-hero">
        <div><div class="crime-ui-kicker">Crime</div><h2>Risk dashboard</h2><p>Crime is high-risk optional gameplay. Build intel, manage heat and avoid spamming dangerous moves when your life is already unstable.</p></div>
        <div class="crime-ui-heat-card"><span>Current heat</span><b>${Math.round(heat)}%</b><div class="crime-ui-heatbar"><i style="width:${Math.round(heat)}%"></i></div><small>${esc(heatLabel)}</small></div>
      </section>
      ${outcome}
      <section class="crime-ui-action-grid">
        ${actionButton('🕵️','Plan Move','Gain intel and lower risk before bigger jobs.','Crime.scoutTargets()')}
        ${actionButton('🧊','Lay Low','Drop heat when attention gets too high.','Crime.layLow()')}
        ${actionButton('⚖️','Lawyer','Buy limited protection before a fail.','Crime.lawyer()')}
        ${actionButton('🛠️','Legal Cash','Safer income path with lower consequences.','Crime.secondChanceGig()')}
        ${actionButton('🧠','Reform','Reduce stress and slowly move clean.','Crime.reform()')}
      </section>
      <section class="stats crime-ui-stat-grid">
        ${stat('Heat',Math.round(heat)+'%',heatLabel,heat>=65?'bad':heat>=35?'warn':'good')}
        ${stat('Reputation',Math.round(rep)+'%','Unlocks larger moves','accent')}
        ${stat('Intel',Math.round(intel)+'%','Improves planning','good')}
        ${stat('Streak','x'+Math.max(1,streak),'Reward momentum','warn')}
        ${stat('Lawyer',lawyer+'/3','Fail protection',lawyer?'good':'accent')}
        ${stat('Record',String(record),'Lifetime crime count',record>8?'warn':'accent')}
      </section>
      <section class="crime-ui-guidance"><span>🎯</span><div><b>${esc(gTitle)}</b>${esc(gText)}</div></section>
      <section class="crime-ui-tier-list">${tierHTML}</section>
      ${historyHTML()}
    </div>`;
    try{ requestAnimationFrame(()=>window.CoreSystems?.injectGangPanel?.()); }catch(_){ }
  }
  function patchCrime(){
    if(!window.Crime||Crime._premiumAssets1CrimePatched)return;
    Crime.render=renderCrime;
    Crime._premiumAssets1CrimePatched=true;
    if(document.getElementById('tab-crime')?.classList.contains('active')){ try{Crime.render();}catch(e){console.warn('[release crime render]',e);} }
  }
  function boot(){ setLabels(); patchCrime(); }
  document.addEventListener('DOMContentLoaded',boot);
  window.addEventListener('load',()=>{boot(); setTimeout(()=>{boot(); if(window.UI?._activeTab==='crime')Crime?.render?.();},120);});
  setTimeout(boot,80);
})();
