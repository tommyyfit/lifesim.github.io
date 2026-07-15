/* js/ui.js — LifeSim module */
const UI={
  VERSION:1,
  SETTINGS_KEY:'lifesim_settings',
  LEGACY_SETTINGS_KEYS:[15,14,13,10].map(n=>`ls${'v'}${n}_settings`),

  _activeTab:'life',
  _settings:{
    statDelta:true,
    tips:true,
    healthWarn:true,
    showChapters:false,
    compactMode:false,
    themeMode:'default',
    accentMode:'violet',
    textSize:'normal',
    backgroundEffects:true,
    reduceMotion:false,
    animationSpeed:'normal', // 'slow','normal','fast'
    autoAge:false,
    sidebarAlwaysVisible:false,
    showAdvancedStats:false,
    highlightWarnings:true,
    autoSave:true,
    onlineExtras:false,
    logDetailLevel:0 // 0=normal, 1=verbose
  },
  _tipDismissed:false,
  _lastGoalCount:0,
  _logFilter:'all', // 'all','highlight','money','health','career','family'
  _modalReturnFocus:null,

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

  // Avoid unnecessary DOM rebuilds. This prevents badge/tag flicker and
  // stops tab dots from replaying their pop animation when nothing changed.
  _setHTML(el,html){
    if(!el)return false;
    const next=String(html??'');
    if(el.innerHTML===next)return false;
    el.innerHTML=next;
    return true;
  },

  _setText(el,text){
    if(!el)return false;
    const next=String(text??'');
    if(el.textContent===next)return false;
    el.textContent=next;
    return true;
  },

  _toneColor(value,goodHigh=true){
    value=this._clamp(value);
    if(goodHigh)return value>=75?'var(--green)':value>=45?'var(--yellow)':'var(--red)';
    return value>=70?'var(--red)':value>=40?'var(--orange)':'var(--green)';
  },

  _keyClick(evt){
    if(!evt)return;
    if(evt.target!==evt.currentTarget)return;
    if(evt.key==='Enter'||evt.key===' '){
      evt.preventDefault();
      evt.currentTarget?.click();
    }
  },


  // Stable render helper: prevents active tab visual jumping when a module does
  // a full innerHTML rebuild after a small value-only action.
  _stableRenderDepth:0,
  _stableWrapped:false,
  _lastStableClick:null,

  _stableSelector(){
    return '[data-stable-key],.row-card,.card,.rel-card,.choice-btn,.gbtn,.trait-btn,.ambition-btn,.nw-box,.info-box,.history-toggle,details';
  },

  _rememberStableClick(evt){
    try{
      const raw=evt?.target;
      if(!raw||typeof raw.closest!=='function')return;
      if(raw.closest('.nav-bar,.topbar,.game-foot,.modal-bg,.modal-box,.update-log-fab'))return;

      const panel=raw.closest('.tab-panel');
      if(!panel||!panel.classList.contains('active'))return;

      const selector=this._stableSelector();
      const target=raw.closest('[data-stable-key]')||raw.closest(selector);
      if(!target||!panel.contains(target))return;

      const scroller=panel.closest('.content-area')||panel;
      const all=[...panel.querySelectorAll(selector)]
        .filter(el=>el.offsetParent!==null||el.getClientRects().length);

      this._lastStableClick={
        key:target.getAttribute('data-stable-key')||'',
        panelId:panel.id||'',
        index:Math.max(0,all.indexOf(target)),
        top:target.getBoundingClientRect().top,
        scrollTop:scroller?.scrollTop||0,
        left:scroller?.scrollLeft||0,
        time:Date.now()
      };
    }catch(_){ }
  },

  _restoreRecentStableClick(){
    try{
      const snap=this._lastStableClick;
      if(!snap||Date.now()-snap.time>2200)return false;
      const panel=document.getElementById(snap.panelId);
      if(!panel||!panel.classList.contains('active'))return false;

      const scroller=panel.closest('.content-area')||panel;
      if(!scroller)return false;

      const selector=this._stableSelector();
      let target=null;
      if(snap.key){
        target=panel.querySelector(`[data-stable-key="${this._attrEscape(snap.key)}"]`);
      }
      if(!target){
        const all=[...panel.querySelectorAll(selector)]
          .filter(el=>el.offsetParent!==null||el.getClientRects().length);
        target=all[snap.index]||null;
      }

      if(target&&panel.contains(target)){
        const nextTop=target.getBoundingClientRect().top;
        const delta=nextTop-snap.top;
        if(Math.abs(delta)>.5)scroller.scrollTop+=delta;
        if(Number.isFinite(snap.left))scroller.scrollLeft=snap.left;
        return true;
      }

      if(Number.isFinite(snap.scrollTop))scroller.scrollTop=snap.scrollTop;
      if(Number.isFinite(snap.left))scroller.scrollLeft=snap.left;
      return true;
    }catch(_){return false;}
  },

  _scheduleActionStability(){
    // No-op: global delayed action stabilization caused visible blinking/glitches.
    return false;
  },

  _recentStableClick(panel){
    const c=this._lastStableClick;
    if(!c||!panel||c.panelId!==panel.id)return null;
    if(Date.now()-c.time>3500)return null;
    return c;
  },

  _attrEscape(value){
    return String(value??'').replace(/\\/g,'\\\\').replace(/"/g,'\\"');
  },

  _findStableAnchor(panel,scroller,opts={}){
    if(!panel)return null;

    const selector=this._stableSelector();
    let anchor=null;
    const recent=this._recentStableClick(panel);
    const preferredKey=(opts&&opts.preferredKey)||recent?.key||'';

    if(preferredKey){
      const key=this._attrEscape(preferredKey);
      anchor=panel.querySelector(`[data-stable-key="${key}"]`);
    }

    const active=document.activeElement;
    if(!anchor&&active&&panel.contains(active)){
      anchor=active.closest(selector);
    }

    if(!anchor&&scroller&&typeof document.elementFromPoint==='function'){
      const r=scroller.getBoundingClientRect?.();
      const x=r?Math.min(Math.max(r.left+r.width/2,1),window.innerWidth-1):Math.floor(window.innerWidth/2);
      const y=r?Math.min(Math.max(r.top+Math.min(r.height*.38,260),1),window.innerHeight-1):Math.floor(window.innerHeight*.35);
      const hit=document.elementFromPoint(x,y);
      if(hit&&panel.contains(hit))anchor=hit.closest(selector);
    }

    if(!anchor||!panel.contains(anchor))return null;

    const all=[...panel.querySelectorAll(selector)].filter(el=>el.offsetParent!==null || el.getClientRects().length);
    const key=anchor.getAttribute('data-stable-key')||'';
    return {
      key,
      fallbackKey:opts&&opts.fallbackKey?String(opts.fallbackKey):'',
      index:Math.max(0,all.indexOf(anchor)),
      top:anchor.getBoundingClientRect().top,
      selector,
      recentTop:recent?.top,
      recentScrollTop:recent?.scrollTop
    };
  },

  _restoreStableAnchor(panel,scroller,snap){
    if(!panel||!scroller||!snap)return false;

    let target=null;
    if(snap.key){
      target=panel.querySelector(`[data-stable-key="${this._attrEscape(snap.key)}"]`);
    }

    if(!target&&snap.fallbackKey){
      target=panel.querySelector(`[data-stable-key="${this._attrEscape(snap.fallbackKey)}"]`);
    }

    if(!target){
      const all=[...panel.querySelectorAll(snap.selector)].filter(el=>el.offsetParent!==null || el.getClientRects().length);
      target=all[snap.index]||null;
    }

    if(target){
      const nextTop=target.getBoundingClientRect().top;
      const desiredTop=Number.isFinite(snap.top)?snap.top:snap.recentTop;
      const delta=nextTop-desiredTop;
      if(Math.abs(delta)>.5){
        scroller.scrollTop+=delta;
      }
      return true;
    }

    if(Number.isFinite(snap.recentScrollTop)){
      scroller.scrollTop=snap.recentScrollTop;
      return true;
    }

    return false;
  },

  stableRender(panelId,renderFn,opts={}){
    if(typeof renderFn!=='function')return;

    const panel=typeof panelId==='string'?document.getElementById(panelId):panelId;
    if(!panel||!document.body.contains(panel)){
      return renderFn();
    }

    const scroller=panel.closest('.content-area')||panel;
    const scrollTop=scroller?.scrollTop||0;
    const snap=this._findStableAnchor(panel,scroller,opts||{});

    this._stableRenderDepth=(this._stableRenderDepth||0)+1;
    panel.classList.add('ui-stable-rendering');
    document.documentElement.classList.add('ui-stable-rendering');

    let result;
    try{
      result=renderFn();
    }finally{
      const restore=()=>{
        try{
          const ok=this._restoreStableAnchor(panel,scroller,snap);
          if(!ok&&scroller)scroller.scrollTop=scrollTop;
        }catch(e){
          if(scroller)scroller.scrollTop=scrollTop;
        }
      };

      // Keep this minimal. Long delayed restores caused visible after-click blinking.
      restore();
      requestAnimationFrame(()=>{
        restore();
        panel.classList.remove('ui-stable-rendering');
        this._stableRenderDepth=Math.max(0,(this._stableRenderDepth||1)-1);
        if(!this._stableRenderDepth)document.documentElement.classList.remove('ui-stable-rendering');
      });
    }

    return result;
  },

  wrapStableRender(name,obj,panelId){
    if(!obj||typeof obj.render!=='function'||obj.render.__stableWrapped)return false;
    const original=obj.render;
    const self=this;
    function stableWrappedRender(...args){
      const panel=document.getElementById(panelId);
      if(!panel||!panel.classList.contains('active')){
        return original.apply(this,args);
      }
      // If a module already called UI.stableRender with a preferred anchor,
      // do not wrap again. Nested wrappers fight each other and cause jumps.
      if((self._stableRenderDepth||0)>0){
        return original.apply(this,args);
      }
      return self.stableRender(panelId,()=>original.apply(this,args));
    }
    stableWrappedRender.__stableWrapped=true;
    stableWrappedRender.__originalRender=original;
    obj.render=stableWrappedRender;
    return true;
  },

  enableStableRenders(){
    // Disabled in Release hotfix.
    // The old global click stabilizer caused delayed full-page flashes after clicks.
    // Stability is now handled only by targeted module patches (Love / Skills / Stocks)
    // and explicit UI.stableRender(...) calls.
    this._stableWrapped=true;
    return false;
  },

  isModalOpen(){
    return !!document.querySelector('.modal-bg.open,.modal.open,[role="dialog"].open');
  },

  openModal(modal){
    if(!modal)return;
    this._modalReturnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    document.body.classList.add('modal-open');
    modal.classList.add('open');

    requestAnimationFrame(()=>{
      const focusable=this._modalFocusable(modal);
      (focusable[0]||modal).focus?.({preventScroll:true});
    });
  },

  closeAnyModal(modal){
    const target=modal||document.querySelector('.modal-bg.open,.modal.open,[role="dialog"].open');
    if(!target)return;
    target.classList.remove('open');
    requestAnimationFrame(()=>{
      if(!document.querySelector('.modal-bg.open,.modal.open,[role="dialog"].open')){
        document.body.classList.remove('modal-open');
      }
    });

    const returnFocus=this._modalReturnFocus;
    this._modalReturnFocus=null;
    if(returnFocus&&document.contains(returnFocus)){
      returnFocus.focus?.({preventScroll:true});
    }
  },

  _modalFocusable(modal){
    return [...modal.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')]
      .filter(el=>!el.hasAttribute('disabled')&&el.offsetParent!==null);
  },

  handleGlobalKeydown(e){
    const modal=document.querySelector('.modal-bg.open,.modal.open,[role="dialog"].open');
    if(!modal)return false;

    if(e.key==='Escape'){
      e.preventDefault();
      if(modal.id==='ev-modal')this.closeModal();
      else this.closeAnyModal(modal);
      return true;
    }

    if(e.key==='Tab'){
      const focusable=this._modalFocusable(modal);
      if(!focusable.length){
        e.preventDefault();
        modal.focus?.();
        return true;
      }

      const first=focusable[0];
      const last=focusable[focusable.length-1];
      if(e.shiftKey&&document.activeElement===first){
        e.preventDefault();
        last.focus();
        return true;
      }
      if(!e.shiftKey&&document.activeElement===last){
        e.preventDefault();
        first.focus();
        return true;
      }
    }

    return false;
  },

  enhanceInteractive(root=document){
    const scope=root instanceof Element?root:document;
    scope.querySelectorAll('div[onclick],.card[onclick],.row-card[onclick],.locked').forEach(el=>{
      if(el.matches('button,input,select,textarea,a[href]'))return;
      if(!el.hasAttribute('role'))el.setAttribute('role','button');
      if(!el.hasAttribute('tabindex'))el.setAttribute('tabindex','0');
      if(!el.dataset.keyClickBound){
        el.addEventListener('keydown',evt=>this._keyClick(evt));
        el.dataset.keyClickBound='1';
      }
    });
  },

  lockedReason(el){
    const title=el?.getAttribute?.('title');
    if(title)return title;
    const detail=el?.querySelector?.('.cd,.rs,.as,.ts')?.textContent?.trim();
    if(detail)return detail;
    return 'This option is locked right now.';
  },

  _lifeScore(G){
    if(!G)return 0;
    const stress=G.stress||0;
    const moneyScore=Math.max(0,Math.min(100,50+(netWorth(G)/Math.max(1,annualCost(14000,G))*5)));
    const score=
      ((G.happiness||50)*.18)+
      ((G.health||50)*.22)+
      ((G.smarts||50)*.12)+
      ((G.looks||50)*.08)+
      ((G.fitness||50)*.12)+
      ((G.fame||0)*.05)+
      (moneyScore*.13)+
      ((100-stress)*.10);
    return this._clamp(Math.round(score));
  },

  _nextBestAction(G){
    if(!G)return{icon:'✨',title:'Start Life',text:'Create a character to begin.',tab:'life',color:'var(--accent)'};
    const stress=G.stress||0;

    if(G.inPrison)return{icon:'🔒',title:'Handle Prison',text:'Use prison actions first. Freedom unlocks the rest of life again.',tab:'crime',color:'var(--red)'};
    if(G.health<30)return{icon:'❤️‍🩹',title:'Fix Health',text:'Health is the biggest danger right now.',tab:'health',color:'var(--red)'};
    if(stress>75)return{icon:'🔥',title:'Reduce Burnout',text:'Stress is high. Rest, therapy, or meditation is the smart move.',tab:'mind',color:'var(--orange)'};
    if((G.skillPoints||0)>0)return{icon:'🎓',title:'Spend Skill Points',text:'Unused skill points are free progress.',tab:'skills',color:'var(--accent)'};
    if(!G.career&&G.age>=18&&G.age<60&&!G.inUniversity)return{icon:'💼',title:'Get Income',text:'Find a job or build a stable money base.',tab:'career',color:'var(--accent)'};
    if(typeof Social!=='undefined'&&G.social?.burnout>=75)return{icon:'📱',title:'Creator Break',text:'Your social career is overheating. Take a break before damage.',tab:'social',color:'var(--orange)'};
    if(typeof Stocks!=='undefined'&&G.age>=18&&(G.money||0)>5000&&(!G.stocks||!Object.keys(G.stocks.portfolio||{}).length))return{icon:'📈',title:'Start Investing',text:'You have cash that could begin compounding.',tab:'stocks',color:'var(--green)'};
    if(G.age>=18&&!G.assets?.properties?.length&&(G.money||0)>25000)return{icon:'🏠',title:'Buy Assets',text:'Consider property once cash and income are stable.',tab:'assets',color:'var(--green)'};
    return{icon:'🚀',title:'Keep Momentum',text:'Age up, improve skills, grow income, and protect health.',tab:'life',color:'var(--green)'};
  },

  _buildLifeSnapshot(G){
    return '';
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
      compactMode:loaded.compactMode===true,
      themeMode:['default','calm','contrast','oled'].includes(loaded.themeMode)?loaded.themeMode:'default',
      accentMode:['violet','cyan','emerald','rose'].includes(loaded.accentMode)?loaded.accentMode:'violet',
      textSize:['small','normal','large'].includes(loaded.textSize)?loaded.textSize:'normal',
      backgroundEffects:loaded.backgroundEffects!==false,
      reduceMotion:loaded.reduceMotion===true,
      animationSpeed:loaded.animationSpeed||'normal',
      autoAge:loaded.autoAge===true,
      sidebarAlwaysVisible:loaded.sidebarAlwaysVisible===true,
      showAdvancedStats:loaded.showAdvancedStats===true,
      highlightWarnings:loaded.highlightWarnings!==false,
      autoSave:loaded.autoSave!==false,
      onlineExtras:loaded.onlineExtras===true,
      logDetailLevel:loaded.logDetailLevel||0
    };

    this._applyAnimationSpeed(this._settings.animationSpeed);
    this._applySettingsClasses();

    // Keep old settings readable, but write future settings to the canonical key.
    if(loadedFrom&&loadedFrom!==this.SETTINGS_KEY){
      try{localStorage.setItem(this.SETTINGS_KEY,JSON.stringify(this._settings));}catch(e){}
    }
  },

  saveSetting(key,val){
    // Handle boolean settings
    if(key==='statDelta'||key==='tips'||key==='healthWarn'||key==='highlightWarnings'||key==='autoAge'||key==='autoSave'||key==='showAdvancedStats'||key==='onlineExtras'||key==='reduceMotion'||key==='sidebarAlwaysVisible'||key==='backgroundEffects'){
      this._settings[key]=!!val;
      this._applySettingsClasses();
    }
    // Handle compact mode with immediate UI update
    else if(key==='compactMode'){
      this._settings[key]=!!val;
      if(val){
        document.documentElement.classList.add('compact-mode');
      }else{
        document.documentElement.classList.remove('compact-mode');
      }
      this._applySettingsClasses();
    }
    // Handle string settings
    else if(key==='animationSpeed'){
      const validSpeeds=['slow','normal','fast'];
      this._settings[key]=validSpeeds.includes(val)?val:'normal';
      this._applyAnimationSpeed(this._settings[key]);
    }
    else if(key==='themeMode'){
      const validThemes=['default','calm','contrast','oled'];
      this._settings[key]=validThemes.includes(val)?val:'default';
      this._applySettingsClasses();
    }
    else if(key==='accentMode'){
      const validAccents=['violet','cyan','emerald','rose'];
      this._settings[key]=validAccents.includes(val)?val:'violet';
      this._applySettingsClasses();
    }
    else if(key==='textSize'){
      const validSizes=['small','normal','large'];
      this._settings[key]=validSizes.includes(val)?val:'normal';
      this._applySettingsClasses();
    }
    // Handle number settings
    else if(key==='logDetailLevel'){
      this._settings[key]=Math.min(Math.max(parseInt(val)||0,0),2);
    }
    
    try{localStorage.setItem(this.SETTINGS_KEY,JSON.stringify(this._settings));}catch(e){}
  },

  _applyAnimationSpeed(speed){
    const root=document.documentElement;
    const speeds={'slow':'0.8s','normal':'0.3s','fast':'0.1s'};
    const duration=speeds[speed]||speeds['normal'];
    root.style.setProperty('--anim-duration',duration);
  },

  _applySettingsClasses(){
    const root=document.documentElement;
    if(!root)return;
    root.classList.toggle('compact-mode',!!this._settings.compactMode);
    root.classList.toggle('no-auto-motion',!!this._settings.reduceMotion);
    root.classList.toggle('theme-calm',this._settings.themeMode==='calm');
    root.classList.toggle('theme-contrast',this._settings.themeMode==='contrast');
    root.classList.toggle('theme-oled',this._settings.themeMode==='oled');
    root.classList.toggle('accent-cyan',this._settings.accentMode==='cyan');
    root.classList.toggle('accent-emerald',this._settings.accentMode==='emerald');
    root.classList.toggle('accent-rose',this._settings.accentMode==='rose');
    root.classList.toggle('text-small',this._settings.textSize==='small');
    root.classList.toggle('text-large',this._settings.textSize==='large');
    root.classList.toggle('no-background-effects',this._settings.backgroundEffects===false);
    root.classList.toggle('sidebar-always-visible',!!this._settings.sidebarAlwaysVisible);
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
    const highlight=document.getElementById('set-highlight');
    const compact=document.getElementById('set-compact');
    const advanced=document.getElementById('set-advanced');
    const sound=document.getElementById('set-sound');
    const animSpeed=document.getElementById('set-anim-speed');
    const themeMode=document.getElementById('set-theme-mode');
    const accentMode=document.getElementById('set-accent-mode');
    const textSize=document.getElementById('set-text-size');
    const backgroundEffects=document.getElementById('set-background-fx');
    const reduceMotion=document.getElementById('set-reducemotion');
    const sidebar=document.getElementById('set-sidebar');
    const autosave=document.getElementById('set-autosave');
    const autoage=document.getElementById('set-autoage');
    const chapters=document.getElementById('set-chapters');
    const onlineExtras=document.getElementById('set-online-extras');
    const logDetail=document.getElementById('set-log-detail');
    const modal=document.getElementById('settings-modal');

    if(stat)stat.checked=this._settings.statDelta;
    if(tips)tips.checked=this._settings.tips;
    if(health)health.checked=this._settings.healthWarn;
    if(highlight)highlight.checked=this._settings.highlightWarnings;
    if(compact)compact.checked=this._settings.compactMode;
    if(advanced)advanced.checked=this._settings.showAdvancedStats;
    if(sound&&window.LifeSimV22?.Sound)sound.checked=!LifeSimV22.Sound.muted;
    if(animSpeed)animSpeed.value=this._settings.animationSpeed;
    if(themeMode)themeMode.value=this._settings.themeMode;
    if(accentMode)accentMode.value=this._settings.accentMode;
    if(textSize)textSize.value=this._settings.textSize;
    if(backgroundEffects)backgroundEffects.checked=this._settings.backgroundEffects!==false;
    if(reduceMotion)reduceMotion.checked=this._settings.reduceMotion;
    if(sidebar)sidebar.checked=this._settings.sidebarAlwaysVisible;
    if(autosave)autosave.checked=this._settings.autoSave;
    if(autoage)autoage.checked=this._settings.autoAge;
    if(chapters)chapters.checked=this._settings.showChapters;
    if(onlineExtras)onlineExtras.checked=this._settings.onlineExtras;
    if(logDetail)logDetail.value=String(this._settings.logDetailLevel||0);
    const volume=document.getElementById('set-sound-volume');
    if(volume&&window.LifeSimV22?.Sound){
      volume.value=String(Math.round((LifeSimV22.Sound.volume??0.6)*100));
      const out=document.getElementById('set-sound-volume-value');if(out)out.textContent=volume.value+'%';
    }
    this.settingsTab(this._settingsLastTab||'gameplay');
    this.updateStorageSummary();
    if(modal)this.openModal(modal);
  },

  settingsTab(name='gameplay',button=null){
    const valid=['gameplay','appearance','audio','ai','data'];
    const next=valid.includes(name)?name:'gameplay';
    this._settingsLastTab=next;
    document.querySelectorAll('#settings-modal [data-settings-tab]').forEach(btn=>{
      const active=btn.dataset.settingsTab===next;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-selected',active?'true':'false');
    });
    document.querySelectorAll('#settings-modal [data-settings-panel]').forEach(panel=>{
      panel.classList.toggle('active',panel.dataset.settingsPanel===next);
    });
    const content=document.querySelector('#settings-modal .settings-content');
    if(content)content.scrollTop=0;
    if(button&&typeof button.focus==='function')button.focus({preventScroll:true});
  },

  setSoundVolume(value){
    const n=Math.max(0,Math.min(100,Number(value)||0));
    const out=document.getElementById('set-sound-volume-value');if(out)out.textContent=Math.round(n)+'%';
    if(window.LifeSimV22?.Sound)LifeSimV22.Sound.setVolume(n/100);
  },

  testSound(){
    if(!window.LifeSimV22?.Sound){this.toast('Sound module is unavailable.','bad');return;}
    if(LifeSimV22.Sound.muted){LifeSimV22.Sound.setMuted(false);const el=document.getElementById('set-sound');if(el)el.checked=true;}
    LifeSimV22.Sound.play('achievement');
  },

  updateStorageSummary(){
    const title=document.getElementById('settings-storage-title');
    const summary=document.getElementById('settings-storage-summary');
    if(!title||!summary)return;
    try{
      const current=typeof Save!=='undefined'?Save.load():null;
      const backup=typeof Save!=='undefined'?Save.loadBackup?.():null;
      if(current){
        title.textContent='Current life is available';
        summary.textContent=`${current.name||'Character'} · age ${Number(current.age)||0}${backup?' · recovery backup available':''}`;
      }else{
        title.textContent='No current life saved';
        summary.textContent=backup?'A recovery backup is available.':'Start a life or import a JSON backup.';
      }
    }catch(_){title.textContent='Local save status';summary.textContent='Browser storage is unavailable in this context.';}
  },

  async importSaveFile(input){
    const file=input?.files?.[0];
    if(!file)return false;
    try{
      const raw=await file.text();
      const data=JSON.parse(raw);
      if(typeof Save==='undefined'||!Save.importAll(data))throw new Error('This is not a valid LifeSim save file.');
      this.toast('Save imported successfully.','good');
      this.updateStorageSummary();
      const btn=document.getElementById('btn-continue');if(btn)btn.disabled=false;
      return true;
    }catch(err){this.toast(err?.message||'Could not import this save.','bad');return false;}
    finally{if(input)input.value='';}
  },

  resetSettings(){
    const keepAutoSave=this._settings.autoSave!==false;
    this._settings={
      statDelta:true,tips:true,healthWarn:true,showChapters:false,compactMode:false,
      themeMode:'default',accentMode:'violet',textSize:'normal',backgroundEffects:true,
      reduceMotion:false,animationSpeed:'normal',autoAge:false,sidebarAlwaysVisible:false,
      showAdvancedStats:false,highlightWarnings:true,autoSave:keepAutoSave,onlineExtras:false,logDetailLevel:0
    };
    try{localStorage.setItem(this.SETTINGS_KEY,JSON.stringify(this._settings));}catch(_){ }
    this._applyAnimationSpeed('normal');this._applySettingsClasses();
    this.openSettings();
    this.toast('Settings restored to defaults.','neutral');
  },

  saveNow(){
    if(typeof Save==='undefined'||!window.G){
      this.toast('No active life to save.','bad');
      return false;
    }
    const ok=Save.save(window.G);
    this.toast(ok?'Life saved successfully.':'Save failed. Browser storage may be full.',ok?'good':'bad');
    return ok;
  },

  exportSave(){
    if(typeof Save==='undefined'){
      this.toast('Save module not available.','bad');
      return;
    }
    // Export the current in-memory life, even when automatic saving is disabled.
    if(window.G)Save.save(window.G);
    const now=new Date();
    const dateStr=now.toISOString().slice(0,10);
    const filename=`lifesim-save-${dateStr}.json`;
    if(Save.downloadExport(filename)){
      this.toast('Save file exported successfully!','good');
    }
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
    document.querySelectorAll('.quick-rail-btn').forEach(t=>t.classList.remove('active'));

    const panel=document.getElementById('tab-'+name);
    const btn=[...document.querySelectorAll('.nt')].find(t=>t.dataset.tab===name);
    const quickBtn=[...document.querySelectorAll('.quick-rail-btn')].find(t=>t.dataset.qtab===name);

    if(panel)panel.classList.add('active');
    if(btn){
      btn.classList.add('active');
      this._scrollTabIntoView(btn);
    }
    if(quickBtn)quickBtn.classList.add('active');

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
        if(typeof Travel!=='undefined'){
          this._ensureTabMount('tab-mind','tab-travel');
          Travel.render();
        }
      }else if(name==='love'&&typeof Relations!=='undefined'){
        Relations.render();
        if(typeof Family!=='undefined'){
          this._ensureTabMount('tab-love','tab-family');
          Family.render();
        }
      }else if(name==='career'&&typeof Career!=='undefined'){
        Career.render();
        if(typeof Sports!=='undefined'){
          this._ensureTabMount('tab-career','tab-sports');
          Sports.render();
        }
        if(typeof Military!=='undefined'){
          this._ensureTabMount('tab-career','tab-military');
          Military.render();
        }
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

  _ensureTabMount(parentId,childId){
    const parent=document.getElementById(parentId);
    if(!parent)return null;
    let panel=document.getElementById(childId);
    if(panel){
      if(panel.parentElement!==parent)parent.appendChild(panel);
    }else{
      panel=document.createElement('div');
      panel.id=childId;
      parent.appendChild(panel);
    }
    return panel;
  },

  _captureViewport(){
    const scroller=document.querySelector('#game-content')||document.querySelector('.content-area');
    return{
      scroller,
      top:scroller?scroller.scrollTop:0,
      left:scroller?scroller.scrollLeft:0,
      winX:window.scrollX||0,
      winY:window.scrollY||0
    };
  },

  _restoreViewport(snap){
    if(!snap)return;
    const scroller=snap.scroller&&document.contains(snap.scroller)
      ?snap.scroller
      :(document.querySelector('#game-content')||document.querySelector('.content-area'));
    if(scroller){
      const currentTop=scroller.scrollTop;
      const currentLeft=scroller.scrollLeft;
      const targetTop=snap.top||0;
      const targetLeft=snap.left||0;
      if(Math.abs(currentTop-targetTop)>1)scroller.scrollTop=targetTop;
      if(Math.abs(currentLeft-targetLeft)>1)scroller.scrollLeft=targetLeft;
    }
    if(snap.winX||snap.winY){
      const currentX=window.scrollX||0;
      const currentY=window.scrollY||0;
      const targetX=snap.winX||0;
      const targetY=snap.winY||0;
      if(Math.abs(currentX-targetX)>1||Math.abs(currentY-targetY)>1){
        window.scrollTo(targetX,targetY);
      }
    }
  },

  preserveViewport(work){
    const snap=this._captureViewport();
    const out=typeof work==='function'?work():undefined;
    this._restoreViewport(snap);
    requestAnimationFrame(()=>this._restoreViewport(snap));
    return out;
  },

  _lifeEventMeta(entry){
    const text=String(entry?.text||'').toLowerCase();
    const category=logCategory(entry);

    if(category==='money')return{icon:'💰',tone:'money'};
    if(category==='health')return{icon:entry?.type==='bad'?'🩹':'❤️',tone:'health'};
    if(category==='career')return{icon:'💼',tone:'career'};
    if(category==='family'){
      if(/mother|father|parent|sibling|family/.test(text))return{icon:'👪',tone:'family'};
      if(/born|baby|child|son|daughter/.test(text))return{icon:'👶',tone:'family'};
      return{icon:'🫶',tone:'family'};
    }
    if(/goal|ambition|legacy|trait/.test(text))return{icon:'🎯',tone:'highlight'};
    if(/born|economy|country|city|republic|market|local/.test(text))return{icon:'🌐',tone:'world'};
    if(entry?.type==='bad')return{icon:'⚠️',tone:'danger'};
    if(entry?.type==='special')return{icon:'✨',tone:'highlight'};
    return{icon:'✦',tone:'neutral'};
  },

  refreshActiveTab(){
    const t=this._activeTab||'life';
    const G=window.G;

    if(G?.inPrison&&!this._isPrisonAllowedTab(t)){
      this.tab('crime');
      return;
    }
    this.preserveViewport(()=>this._renderTab(t));
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


  _reputationBar(G){
    const rep=G.reputation||50;
    const mh=G.mentalHealth||60;
    const repColor=rep>=70?'var(--cyan)':rep>=45?'var(--yellow)':'var(--red)';
    const mhColor=mh>=70?'var(--purple)':mh>=45?'var(--yellow)':'var(--red)';
    return `
      <div style="margin:4px 0 2px">
        <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:var(--muted);margin-bottom:2px">
          <span>⭐ Rep</span><span style="color:${repColor}">${rep}</span>
        </div>
        <div style="height:4px;background:var(--b1);border-radius:999px;overflow:hidden">
          <div style="height:100%;background:${repColor};width:${rep}%;border-radius:999px"></div>
        </div>
      </div>
      <div style="margin:4px 0 2px">
        <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:var(--muted);margin-bottom:2px">
          <span>🧠 Mind</span><span style="color:${mhColor}">${mh}</span>
        </div>
        <div style="height:4px;background:var(--b1);border-radius:999px;overflow:hidden">
          <div style="height:100%;background:${mhColor};width:${mh}%;border-radius:999px"></div>
        </div>
      </div>
    `;
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

    if(G.career)inc+=salaryScale(G.career.salary);
    if(G.retired)inc+=salaryScale(G.retirementPension||0);

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

    // UI: Reputation and Mental Wellness in sidebar
    const rep=G.reputation||50;
    const mh=G.mentalHealth||60;
    const repC=rep>=70?'var(--cyan)':rep>=45?'var(--yellow)':'var(--red)';
    const mhC=mh>=70?'var(--purple)':mh>=45?'var(--yellow)':'var(--red)';
    updateStat('rep',rep,rep,repC);
    updateStat('mnd',mh,mh,mhC);

    const karmaText=(karma>0?'+':'')+Math.round(karma);

    ['sv-kar','sv-kar-m'].forEach(id=>{
      const el=document.getElementById(id);
      if(el)el.textContent=karmaText;
    });

    // UI: Sidebar sparklines. sparklineSVG returns trusted app-generated SVG.
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
      ['rep','var(--cyan)'],
      ['mnd','var(--purple)'],
    ];

    sparkMap.forEach(([k,col])=>{
      const slEl=document.getElementById('spark-'+k);
      if(slEl)slEl.innerHTML=sparklineSVG(hist,k,col,44,14);
    });

    // UI: Goals progress widget
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
        this._setHTML(el,`<span onclick="UI.tab('goals')" style="cursor:pointer;font-size:11px;font-weight:800;color:${goalsColor};background:${goalsColor}18;border:1.5px solid ${goalsColor}44;border-radius:20px;padding:2px 8px;white-space:nowrap">🎯 ${goalsDone}/${goalsTotal}</span>`);
      }
    });

    // UI: Money context indicator
    const mc=moneyBenchmark(G);

    ['g-money-ctx','g-money-ctx-m'].forEach(id=>{
      const el=document.getElementById(id);
      if(el&&mc){
        this._setHTML(el,`<span style="font-size:10px;font-weight:700;color:${mc.color}">${this._esc(mc.icon)} ${this._esc(mc.label)}</span>`);
      }else if(el){
        this._setHTML(el,'');
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

    const sidebarTags=[];
    if(G.trait){
      const td=typeof PERSONALITY_TRAITS!=='undefined'&&PERSONALITY_TRAITS.find(t=>t.id===G.trait);
      if(td)sidebarTags.push(`<span class="badge badge-a">${this._esc(td.icon)} ${this._esc(td.name)}</span>`);
    }
    if(G.inPrison)sidebarTags.push('<span class="badge badge-r">🔒 Prison</span>');
    else if(G.retired)sidebarTags.push('<span class="badge badge-g">🏖️ Retired</span>');
    else if(stress>80)sidebarTags.push('<span class="badge badge-r">😤 Burnout</span>');
    else if(stress>55)sidebarTags.push('<span class="badge badge-y">😰 Stressed</span>');

    if((G.followers||0)>=10000)sidebarTags.push(`<span class="badge badge-a">⭐ ${this._esc(fmtFollowers(G.followers))}</span>`);
    else if(karma>=40)sidebarTags.push('<span class="badge badge-g">😇 +Karma</span>');
    else if(karma<=-30)sidebarTags.push('<span class="badge badge-r">😈 −Karma</span>');
    else if(G.rels?.partner?.married)sidebarTags.push('<span class="badge badge-p">💍 Married</span>');

    const sidebarTagsHtml=(sidebarTags.length?sidebarTags.slice(0,3).join(''):tagsHtml);
    this._setHTML(document.getElementById('g-tags'),sidebarTagsHtml);
    this._setHTML(document.getElementById('g-tags-m'),tagsHtml);

    this.milestoneCheck(G);
    this.updateTabBadges(G);
    this.renderLog();
    if(typeof Save!=='undefined'&&Save.scheduleAutosave)Save.scheduleAutosave(G);
  },

  updateTabBadges(G){
    if(!G)return;

    const stress=G.stress||0;

    const stockReturn=G.stocks&&Number.isFinite(G.stocks.lastYearReturn)?G.stocks.lastYearReturn:0;
    const socialBurn=G.social&&Number.isFinite(G.social.burnout)?G.social.burnout:0;

    const badgeMap={
      health: G.health<25?'red':G.health<40?'yellow':null,
      mind: stress>75?'red':stress>55?'yellow':null,
      career: (G.career&&(G.jobPerf||50)<30)?'yellow':null,
      business: (G.business&&G.business.revenue<G.business.expenses)?'yellow':null,
      social: socialBurn>82?'red':socialBurn>68?'yellow':null,
      stocks: stockReturn<=-22?'red':stockReturn<=-12?'yellow':stockReturn>=18?'green':null,
      skills: (G.skillPoints||0)>0?'green':null,
      crime: G.inPrison?'red':null,
    };

    if(G.completedGoals){
      const cnt=G.completedGoals.length;
      if(cnt>this._lastGoalCount&&this._activeTab!=='goals')badgeMap.goals='green';
      this._lastGoalCount=cnt;
    }

    Object.entries(badgeMap).forEach(([tab,color])=>{
      this._setTabDot(tab,color);
    });
  },

  _setTabDot(tab,color){
    const dot=document.getElementById('dot-'+tab);
    if(!dot)return;

    const safeColor=color||'';
    const prevColor=dot.dataset.dotColor||'';

    // Do not touch the DOM if the dot state is unchanged.
    // This prevents the CSS dotPop animation from replaying on unrelated UI updates.
    if(prevColor===safeColor)return;

    dot.dataset.dotColor=safeColor;
    dot.className='tab-dot'+(safeColor?' dot-'+safeColor:'');

    // Green dots are passive opportunity indicators. Keep them stable instead of popping/blinking.
    if(safeColor==='green'){
      dot.classList.add('dot-stable');
    }else{
      dot.classList.remove('dot-stable');
    }
  },

  getSmartTip(G){
    if(!G||!this._settings.tips||this._tipDismissed)return null;

    const stress=G.stress||0;

    if(G.inPrison)return{icon:'🔒',text:'You are in prison. Focus on prison actions until release.',tab:'crime',color:'red'};
    if(G.health<20)return{icon:'🚨',text:'Critical health! Go to Health tab immediately.',tab:'health',color:'red'};
    if(stress>80)return{icon:'🔥',text:'Severe burnout! Meditate or try therapy.',tab:'mind',color:'orange'};
    if(G.health<35)return{icon:'❤️‍🩹',text:`Health at ${Math.round(G.health)}% — visit the Health tab.`,tab:'health',color:'orange'};
    if(stress>65)return{icon:'😰',text:'High stress level. Try relaxing in the Mind tab.',tab:'mind',color:'orange'};

    // v21: mood-based tips
    const mood=G.mood||{};
    if(mood.label==='Miserable'||(mood.score||50)<25)return{icon:'😢',text:'Your mood is very low. Try new actions in the Mind tab like Mindful Walk or Cooking Class.',tab:'mind',color:'orange'};
    if(mood.label==='Euphoric'&&(mood.streak||0)>=3)return{icon:'🌟',text:`${mood.streak}-year Euphoric mood streak! Keep it going.`,tab:'mind',color:'accent'};

    if((G.skillPoints||0)>0){
      return{icon:'🎓',text:`${G.skillPoints} unspent skill point${G.skillPoints!==1?'s':''}! Go to Skills.`,tab:'skills',color:'accent'};
    }

    if(!G.career&&G.age>=18&&G.age<60&&!G.inUniversity&&!G.inPrison){
      return{icon:'💼',text:'No job yet. Find employment in the Career tab.',tab:'career',color:'accent'};
    }

    if(typeof Social!=='undefined'&&G.social?.burnout>=75){
      return{icon:'🔥',text:'Creator burnout is high. Take a break in Social.',tab:'social',color:'orange'};
    }

    if(typeof Social!=='undefined'&&(G.followers||0)>=100000&&!G.social?.verified&&G.social?.reputation>=65){
      return{icon:'✅',text:'You may qualify for social verification.',tab:'social',color:'accent'};
    }

    if(typeof Stocks!=='undefined'&&G.age>=18&&G.money>5000&&(!G.stocks||!Object.keys(G.stocks.portfolio||{}).length)){
      return{icon:'📈',text:`${fmt(G.money)} cash available — consider starting a portfolio.`,tab:'stocks',color:'accent'};
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
    const validTabs=['life','mind','love','career','assets','health','crime','social','business','hustle','pets','skills','stocks','goals'];
    const tab=validTabs.includes(tip.tab)?tip.tab:'life';

    return`<div class="smart-tip" role="button" tabindex="0" aria-label="${this._esc(tip.text)}" style="border-color:${c}44;background:${c}12" onclick="UI.tab('${tab}')" onkeydown="UI._keyClick(event)">
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
      html+=`<div class="crit-banner red" role="alert"><span class="crit-banner-ico">🚨</span><div class="crit-banner-txt">Health critical (${Math.round(G.health)}%)! You may die soon.</div><button type="button" class="crit-go" onclick="UI.tab('health')" aria-label="Go to Health tab">→ Health</button></div>`;
    }else if(G.health<35){
      html+=`<div class="crit-banner orange" role="status"><span class="crit-banner-ico">⚠️</span><div class="crit-banner-txt">Health is low (${Math.round(G.health)}%). See a doctor.</div><button type="button" class="crit-go" onclick="UI.tab('health')" aria-label="Go to Health tab">→ Health</button></div>`;
    }

    if(stress>85){
      html+=`<div class="crit-banner orange" role="status"><span class="crit-banner-ico">🔥</span><div class="crit-banner-txt">Severe burnout (stress ${Math.round(stress)}%). Your health is suffering!</div><button type="button" class="crit-go" onclick="UI.tab('mind')" aria-label="Go to Mind tab">→ Mind</button></div>`;
    }

    return html;
  },

  renderLog(){
    const G=window.G;
    if(!G)return;
    const chaptersVisible=!!this._settings.showChapters;

    const el=document.getElementById('tab-life');
    if(!el||!el.classList.contains('active'))return;

    const aiReady=true; // Story: no cooldown, always ready
    const storyCooldown=0; // Story: no cooldown

    const tip=this.getSmartTip(G);
    const critHTML=this._buildCritBanners(G);
    const snapshotHTML='';

    const stress=G.stress||0;
    let stressPanel='';

    if(stress>=50){
      const stressLbl=stress>=80?'🔥 Severe Burnout':stress>=65?'😤 High Stress':'😰 Stressed';
      const stressC=stress>=80?'var(--red)':stress>=65?'var(--orange)':'var(--yellow)';

      stressPanel=`<section class="life-stress-panel" aria-label="Stress relief actions" style="background:${stressC}14;border-color:${stressC}55">
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
      </section>`;
    }

    const filters=[
      {id:'all',label:'All'},
      {id:'highlight',label:'⭐ Highlights'},
      {id:'money',label:'💰 Money'},
      {id:'health',label:'❤️ Health'},
      {id:'career',label:'💼 Career'},
      {id:'family',label:'💑 Family'},
    ];

    const filterBtns=`<div class="log-filterbar" role="group" aria-label="Filter life events">${filters.map(f=>{
      const active=this._logFilter===f.id;
      return`<button type="button" class="log-filter${active?' active':''}" aria-pressed="${active?'true':'false'}" onclick="UI._logFilter='${f.id}';UI.renderLog()">${f.label}</button>`;
    }).join('')}</div>`;

    const allLog=(G.log||[]).slice(0,150);
    const filteredLog=this._logFilter==='all'?allLog:allLog.filter(e=>logCategory(e)===this._logFilter);

    const emptyNote=filteredLog.length===0
      ?'<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">No entries in this category yet.</div>'
      :'';

    const chapterToggle=`<div class="life-log-toolbar">
      <button type="button" class="btn-secondary btn-sm" onclick="UI.toggleLifeChapters()" aria-controls="chapters-panel" aria-expanded="${chaptersVisible?'true':'false'}">${chaptersVisible?'\u{1F441}\uFE0F Hide Life Chapters':'\u{1F4D6} Show Life Chapters'}</button>
    </div>`;

    el.innerHTML=
      critHTML+
      snapshotHTML+
      stressPanel+
      this._buildSmartTipHtml(tip)+
      chapterToggle+
      '<div id="chapters-panel" style="margin-bottom:10px"></div>'+
      `<div class="life-log-actions origin-ui-age-bar">
        <div class="origin-ui-age-pill">Age <strong>${Math.round(G.age)}</strong></div>
        ${spBadge?`<div class="origin-ui-sp-badge">${spBadge}</div>`:''}
        <div class="origin-ui-story-hint">📖 Story events happen naturally</div>
      </div>`+
      filterBtns+
      `<div class="log-list" role="feed" aria-label="Life event feed filtered by ${this._esc(this._logFilter)}">`+
        filteredLog.map(e=>{
          const col=e.type==='good'?'var(--green)':e.type==='bad'?'var(--red)':e.type==='special'?'var(--accent)':e.type==='money'?'var(--yellow)':'var(--muted)';
          const cat=logCategory(e);
          const catDot=cat==='highlight'?'⭐':cat==='money'?'💰':cat==='health'?'❤️':cat==='career'?'💼':cat==='family'?'💑':'';
          const typeClass=['good','bad','special','money','neutral'].includes(e.type)?e.type:'neutral';

          return`<article class="log-entry ${typeClass}" aria-label="Age ${this._esc(e.age)}: ${this._esc(e.text)}"><div class="log-age" style="color:${col}">Age ${this._esc(e.age)}</div><div class="log-txt">${this._esc(e.text)}${catDot?` <span style="font-size:9px;opacity:.6">${catDot}</span>`:''}</div></article>`;
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

    // v21: Mood panel
    const mood=G?.mood||{label:'Neutral',score:50,icon:'😐',streak:0};
    const moodColor=mood.score>=70?'var(--green)':mood.score>=40?'var(--yellow)':'var(--red)';
    const streakNote=mood.streak>=3?` · ${mood.streak}yr streak`:'';
    const moodPanel=G?.age>=1?`<section class="v21-mood-panel" style="background:${moodColor}12;border:1.5px solid ${moodColor}44;border-radius:14px;padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:28px" aria-hidden="true">${mood.icon}</span>
        <div style="flex:1;min-width:0">
          <div style="font-size:11px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:.8px">This Year's Mood</div>
          <div style="font-size:16px;font-weight:900;color:${moodColor}">${mood.label}${streakNote}</div>
          <div style="height:5px;background:var(--b1);border-radius:999px;margin-top:4px;overflow:hidden"><div style="height:100%;background:${moodColor};width:${mood.score}%;border-radius:999px;transition:width .4s"></div></div>
        </div>
        <div style="font-size:20px;font-weight:900;color:${moodColor}">${mood.score}</div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:6px;font-weight:600">Mood is shaped by happiness, mental health, stress, relationships and career.</div>
    </section>`:'';

    el.innerHTML=moodPanel+addWarn+`
    <div class="sec">🧠 Mental Development</div>
    <div class="act-grid">
      <button type="button" class="card" onclick="Engine.act('study')"><span class="ci">📚</span><span class="cn">Study Hard</span><span class="cd">+Smarts +Stress</span></button>
      <button type="button" class="card" onclick="Engine.act('library')"><span class="ci">📖</span><span class="cn">Library</span><span class="cd">+Smarts +Hap −Stress</span></button>
      <button type="button" class="card" onclick="Engine.act('meditate')"><span class="ci">🧘</span><span class="cn">Meditate</span><span class="cd">+Hap +Health −Stress</span></button>
      <button type="button" class="card" onclick="Engine.act('therapy')"><span class="ci">🛋️</span><span class="cn">Therapy</span><span class="cd">+Hap −Stress (${fmt(sc(150))})</span></button>
    </div>

    <div class="sec">💪 Physical Training</div>
    <div class="act-grid">
      <button type="button" class="card" onclick="Engine.act('gym')"><span class="ci">🏋️</span><span class="cn">Gym Workout</span><span class="cd">+Health +Fitness +Looks</span></button>
      <button type="button" class="card" onclick="Engine.act('run')"><span class="ci">🏃</span><span class="cn">Go Running</span><span class="cd">+Health +Fitness −Stress</span></button>
      <button type="button" class="card" onclick="Engine.act('swim')"><span class="ci">🏊</span><span class="cn">Swimming</span><span class="cd">+Health +Fit (${fmt(sc(30))})</span></button>
      <button type="button" class="card" onclick="Engine.act('yoga')"><span class="ci">🧘‍♀️</span><span class="cn">Yoga</span><span class="cd">+Health +Hap −Stress</span></button>
    </div>

    <div class="act-grid" style="margin-top:8px">
      <button type="button" class="card" onclick="Engine.act('hike')"><span class="ci">🥾</span><span class="cn">Hiking</span><span class="cd">+Health +Fit +Hap −Stress</span></button>
      <button type="button" class="card" onclick="Engine.act('sports')"><span class="ci">⚽</span><span class="cn">Play Sport</span><span class="cd">+Health +Fit +Hap</span></button>
      <button type="button" class="card" onclick="Engine.act('boxing')"><span class="ci">🥊</span><span class="cn">Boxing</span><span class="cd">+Fitness −Stress (${fmt(sc(60))})</span></button>
      <button type="button" class="card" onclick="Engine.act('sleep')"><span class="ci">😴</span><span class="cn">Rest Day</span><span class="cd">+Health +Hap −Stress</span></button>
    </div>

    <div class="sec">💅 Appearance & Style</div>
    <div class="act-grid">
      <button type="button" class="card" onclick="Engine.act('salon')"><span class="ci">💇</span><span class="cn">Hair Salon</span><span class="cd">+Looks (${fmt(sc(90))})</span></button>
      <button type="button" class="card" onclick="Engine.act('spa')"><span class="ci">🧖</span><span class="cn">Luxury Spa</span><span class="cd">+Looks +Hap −Stress (${fmt(sc(180))})</span></button>
      <button type="button" class="card" onclick="Engine.act('dentist')"><span class="ci">🦷</span><span class="cn">Dentist</span><span class="cd">+Looks +Health (${fmt(sc(130))})</span></button>
      <button type="button" class="card" onclick="Engine.act('personal_shop')"><span class="ci">🛍️</span><span class="cn">New Wardrobe</span><span class="cd">+Looks (${fmt(sc(400))})</span></button>
    </div>

    <div class="sec">🎭 Recreation & Hobbies</div>
    <div class="act-grid">
      <button type="button" class="card" onclick="Engine.act('movie')"><span class="ci">🎬</span><span class="cn">Cinema Night</span><span class="cd">+Happiness −Stress</span></button>
      <button type="button" class="card" onclick="Engine.act('travel')"><span class="ci">✈️</span><span class="cn">Short Holiday</span><span class="cd">+Hap −Stress (${fmt(sc(700))})</span></button>
      <button type="button" class="card" onclick="Engine.act('concert')"><span class="ci">🎵</span><span class="cn">Live Concert</span><span class="cd">+Hap +Fame (${fmt(sc(120))})</span></button>
      <button type="button" class="card" onclick="Engine.act('cook')"><span class="ci">👨‍🍳</span><span class="cn">Cook at Home</span><span class="cd">+Hap +Health</span></button>
    </div>

    <div class="act-grid" style="margin-top:8px">
      <button type="button" class="card" onclick="Engine.act('volunteer')"><span class="ci">🤲</span><span class="cn">Volunteer</span><span class="cd">+Hap +Karma +Fame</span></button>
      <button type="button" class="card" onclick="Engine.act('gaming')"><span class="ci">🎮</span><span class="cn">Play Games</span><span class="cd">+Hap −Stress −Smart</span></button>
      <button type="button" class="card" onclick="Engine.act('reading')"><span class="ci">📰</span><span class="cn">Read Books</span><span class="cd">+Smarts +Hap −Stress</span></button>
      <button type="button" class="card" onclick="Engine.act('museum')"><span class="ci">🏛️</span><span class="cn">Museum</span><span class="cd">+Smarts +Hap (${fmt(sc(20))})</span></button>
    </div>

    <div class="sec">🎨 Creative & Mindful</div>
    <div class="act-grid">
      <button type="button" class="card" onclick="Engine.act('journal')"><span class="ci">📓</span><span class="cn">Journalling</span><span class="cd">+Hap −Stress +Smart</span></button>
      <button type="button" class="card" onclick="Engine.act('music_play')"><span class="ci">🎸</span><span class="cn">Play Music</span><span class="cd">+Hap −Stress +Smart</span></button>
      <button type="button" class="card" onclick="Engine.act('paint')"><span class="ci">🎨</span><span class="cn">Paint</span><span class="cd">+Hap −Stress +Looks</span></button>
      <button type="button" class="card" onclick="Engine.act('nature')"><span class="ci">🌿</span><span class="cn">Nature Walk</span><span class="cd">+Hap +Health −Stress</span></button>
    </div>

    <div class="sec">✨ v21 New Actions</div>
    <div class="act-grid">
      <button type="button" class="card" onclick="Engine.act('cooking_class')"><span class="ci">🍳</span><span class="cn">Cooking Class</span><span class="cd">+Hap +Health +Smart (${fmt(sc(80))})</span></button>
      <button type="button" class="card" onclick="Engine.act('cold_shower')"><span class="ci">🚿</span><span class="cn">Cold Shower</span><span class="cd">+Health +Hap −Stress</span></button>
      <button type="button" class="card" onclick="Engine.act('mindful_walk')"><span class="ci">🚶</span><span class="cn">Mindful Walk</span><span class="cd">+Hap −Stress +Health</span></button>
      <button type="button" class="card" onclick="Engine.act('sunrise_watch')"><span class="ci">🌅</span><span class="cn">Watch Sunrise</span><span class="cd">+Hap −Stress +Health</span></button>
    </div>
    <div class="act-grid" style="margin-top:8px">
      <button type="button" class="card" onclick="Engine.act('social_media_break')"><span class="ci">📵</span><span class="cn">Screen Detox</span><span class="cd">+Hap −Stress +Smart</span></button>
      <button type="button" class="card" onclick="Engine.act('pet_visit')"><span class="ci">🐾</span><span class="cn">Animal Shelter</span><span class="cd">+Hap −Stress +Karma</span></button>
      <button type="button" class="card" onclick="Engine.act('read_news')"><span class="ci">📰</span><span class="cn">Read the News</span><span class="cd">+Smarts</span></button>
    </div>

    <div class="sec">🍸 Vices & Risk</div>
    <div class="act-grid">
      <button type="button" class="card" onclick="Engine.act('bar')"><span class="ci">🍸</span><span class="cn">Night Out</span><span class="cd">+Hap −Health (addiction risk)</span></button>
      <button type="button" class="card" onclick="Engine.act('smoke')"><span class="ci">🚬</span><span class="cn">Smoke</span><span class="cd">−Health (addiction risk!)</span></button>
      <button type="button" class="card danger" onclick="Engine.act('drugs')"><span class="ci">💊</span><span class="cn">Hard Drugs</span><span class="cd">−−Health, fatal risk!</span></button>
    </div>`;
  },

  renderLog(){
    const G=window.G;
    if(!G)return;
    const chaptersVisible=!!this._settings.showChapters;

    const el=document.getElementById('tab-life');
    if(!el||!el.classList.contains('active'))return;

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

      stressPanel=`<section class="life-stress-panel" aria-label="Stress relief actions" style="background:${stressC}14;border-color:${stressC}55">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-size:12px;font-weight:900;color:${stressC}">${stressLbl} (${Math.round(stress)}%)</span>
          <span style="font-size:10px;color:var(--muted);font-weight:700">Reduce Stress</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <button type="button" onclick="Engine.act('meditate');UI.tab('life')" style="background:var(--s2);border:1.5px solid var(--b1);border-radius:9px;padding:7px 8px;font-size:11px;font-weight:800;color:var(--txt);cursor:pointer">🧘 Meditate<br><span style="color:var(--green);font-size:9px">-Stress (Free)</span></button>
          <button type="button" onclick="Engine.act('sleep');UI.tab('life')" style="background:var(--s2);border:1.5px solid var(--b1);border-radius:9px;padding:7px 8px;font-size:11px;font-weight:800;color:var(--txt);cursor:pointer">😴 Rest Day<br><span style="color:var(--green);font-size:9px">-Stress (Free)</span></button>
          <button type="button" onclick="Engine.act('yoga');UI.tab('life')" style="background:var(--s2);border:1.5px solid var(--b1);border-radius:9px;padding:7px 8px;font-size:11px;font-weight:800;color:var(--txt);cursor:pointer">🧘‍♀️ Yoga<br><span style="color:var(--green);font-size:9px">-Stress (Free)</span></button>
          <button type="button" onclick="Engine.act('therapy');UI.tab('life')" style="background:var(--s2);border:1.5px solid var(--b1);border-radius:9px;padding:7px 8px;font-size:11px;font-weight:800;color:var(--txt);cursor:pointer">🛋️ Therapy<br><span style="color:var(--yellow);font-size:9px">-Stress ($150)</span></button>
        </div>
      </section>`;
    }

    const filters=[
      {id:'all',label:'All'},
      {id:'highlight',label:'⭐ Highlights'},
      {id:'money',label:'💰 Money'},
      {id:'health',label:'❤️ Health'},
      {id:'career',label:'💼 Career'},
      {id:'family',label:'👪 Family'},
    ];

    const filterBtns=`<div class="log-filterbar" role="group" aria-label="Filter life events">${filters.map(f=>{
      const active=this._logFilter===f.id;
      return`<button type="button" class="log-filter${active?' active':''}" aria-pressed="${active?'true':'false'}" onclick="UI._logFilter='${f.id}';UI.renderLog()">${f.label}</button>`;
    }).join('')}</div>`;

    const allLog=(G.log||[]).slice(0,150);
    const filteredLog=this._logFilter==='all'?allLog:allLog.filter(e=>logCategory(e)===this._logFilter);
    const emptyNote=filteredLog.length===0
      ?'<div class="life-empty-state">No entries in this category yet.</div>'
      :'';

    // v21: Mood mini bar for life tab
    const mood=G?.mood||{label:'Neutral',score:50,icon:'😐',streak:0};
    const moodC=mood.score>=70?'var(--green)':mood.score>=40?'var(--yellow)':'var(--red)';
    const moodBar=G?.age>=1?`<div class="v21-life-mood" style="display:flex;align-items:center;gap:8px;background:${moodC}10;border:1px solid ${moodC}33;border-radius:10px;padding:7px 12px;margin-bottom:8px;cursor:pointer" onclick="UI.tab('mind')" title="Go to Mind tab to manage mood">
      <span style="font-size:18px">${mood.icon}</span>
      <div style="flex:1">
        <div style="font-size:10px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.6px">This Year's Mood</div>
        <div style="font-size:13px;font-weight:900;color:${moodC}">${mood.label}${mood.streak>=3?' · '+mood.streak+'yr streak':''}</div>
      </div>
      <div style="height:28px;width:52px;background:var(--b1);border-radius:6px;overflow:hidden;position:relative">
        <div style="position:absolute;bottom:0;left:0;right:0;height:${mood.score}%;background:${moodC};transition:height .4s"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:var(--txt)">${mood.score}</div>
      </div>
    </div>`:'';

    // v21: Life milestones panel
    const milestones=[];
    if(G.age>=18) milestones.push({done:!!G.education,icon:'🎓',label:'Education'});
    if(G.age>=20) milestones.push({done:!!G.career,icon:'💼',label:'Career'});
    if(G.age>=18) milestones.push({done:!!(G.rels?.partner),icon:'❤️',label:'Partner'});
    if(G.age>=22) milestones.push({done:!!(G.rels?.children?.length),icon:'👶',label:'Children'});
    if(G.age>=20) milestones.push({done:!!(G.assets?.properties?.length),icon:'🏠',label:'Own Home'});
    if(G.age>=18) milestones.push({done:(G.money||0)>=100000,icon:'💰',label:'Savings'});
    const milestonesPanel=milestones.length?`<div class="v21-milestones" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${milestones.map(m=>`<div style="display:flex;align-items:center;gap:4px;background:${m.done?'var(--green)18':'var(--b1)'};border:1px solid ${m.done?'var(--green)44':'var(--b1)'};border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;color:${m.done?'var(--green)':'var(--muted)'}"><span>${m.icon}</span><span>${m.label}</span>${m.done?'<span style="font-size:9px">✓</span>':''}</div>`).join('')}</div>`:'';

    el.innerHTML=
      moodBar+
      milestonesPanel+
      critHTML+
      stressPanel+
      this._buildSmartTipHtml(tip)+
      `<section class="life-view-shell">
        <div class="life-hero-bar">
          <div class="life-hero-copy">
            <h2 class="life-age-title">Life Timeline</h2>
            <div class="life-age-underline"></div>
          </div>
          <div class="life-hero-tools">
            <button type="button" class="life-toolbar-select" onclick="UI.toggleLifeChapters()" aria-controls="chapters-panel" aria-expanded="${chaptersVisible?'true':'false'}">📖 Life Chapters <span aria-hidden="true">▾</span></button>
            <div class="life-passive-toggle" aria-hidden="true">
              <span>✨ Story events happen naturally</span>
              <span class="life-passive-switch"><span></span></span>
            </div>
          </div>
        </div>
        <div id="chapters-panel" style="margin-bottom:10px"></div>
        ${filterBtns}
        <div class="log-list life-feed-list" role="feed" aria-label="Life event feed filtered by ${this._esc(this._logFilter)}">`+
          filteredLog.map(e=>{
            const col=e.type==='good'?'var(--green)':e.type==='bad'?'var(--red)':e.type==='special'?'var(--accent)':e.type==='money'?'var(--yellow)':'var(--muted)';
            const cat=logCategory(e);
            const catDot=cat==='highlight'?'⭐':cat==='money'?'💰':cat==='health'?'❤️':cat==='career'?'💼':cat==='family'?'👪':'';
            const typeClass=['good','bad','special','money','neutral'].includes(e.type)?e.type:'neutral';
            const meta=this._lifeEventMeta(e);

            return`<article class="log-entry life-feed-entry ${typeClass} life-tone-${meta.tone}" aria-label="Age ${this._esc(e.age)}: ${this._esc(e.text)}">
              <div class="life-feed-rail" aria-hidden="true">
                <span class="life-feed-node"></span>
              </div>
              <div class="life-feed-card">
                <div class="life-feed-icon" aria-hidden="true">${meta.icon}</div>
                <div class="life-feed-copy">
                  <div class="log-age life-feed-age" style="color:${col}">Age ${this._esc(e.age)}</div>
                  <div class="log-txt life-feed-text">${this._esc(e.text)}${catDot?` <span class="life-feed-tag">${catDot}</span>`:''}</div>
                </div>
                <button type="button" class="life-feed-fav" aria-label="Favorite timeline event">☆</button>
              </div>
            </article>`;
          }).join('')+
          emptyNote+
        '</div></section>';

    try{
      this.renderLifeChapters(G);
    }catch(e){
      console.warn(e);
    }
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
      }else if(evt._isStory&&c.e&&Object.keys(c.e).length){
        // Story: story event — show choice text + stat effect pills
        const pills=this._storyEffectPills(c.e);
        btn.innerHTML=`<span style="display:block;font-weight:700;font-size:13.5px;margin-bottom:4px">${this._esc(c.t||'Continue')}</span>${pills}`;
      }else{
        btn.textContent=c.t||'Continue';
      }

      btn.onclick=()=>{
        try{
          if(typeof c.fn==='function'){
            c.fn(); // Story: story event applies its own effects
          } else {
            applyStats(window.G,c.e||{});
          }
          Engine.log(`${evt.icon||'•'} ${evt.title} — ${c.t||c.label||''}`,evt.type||'neutral');
        }catch(err){
          console.warn(err);
        }

        this.closeAnyModal(modal);
        UI.update();

        if(cb)cb();
      };

      ch.appendChild(btn);
    });

    this.openModal(modal);
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
        this.closeAnyModal(modal);
        if(cb)cb(choice.value);
      };

      ch.appendChild(btn);
    });

    this.openModal(modal);
  },

  _storyEffectPills(e){
    if(!e||typeof e!=='object')return'';
    const labels={happiness:'😊',health:'❤️',smarts:'🧠',looks:'✨',fitness:'⚡',stress:'😤',karma:'⚖️',fame:'🌟',money:'💰',mentalHealth:'🧠'};
    const pills=Object.entries(e)
      .filter(([k])=>labels[k]&&k!=='career_boost')
      .map(([k,v])=>{
        const icon=labels[k];
        const sign=v>0?'+':'';
        const col=k==='stress'?(v>0?'#f87171':'#34d399'):(v>0?'#34d399':'#f87171');
        return`<span style="display:inline-block;background:${col}18;border:1px solid ${col}40;border-radius:12px;padding:1px 7px;font-size:10px;font-weight:800;color:${col};margin:2px 2px 0 0">${icon} ${sign}${v}</span>`;
      }).join('');
    return pills?`<div style="margin-top:3px">${pills}</div>`:'';
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
    if(modal)this.closeAnyModal(modal);

    if(Engine._modalSkipCb){
      const cb=Engine._modalSkipCb;
      Engine._modalSkipCb=null;
      cb();
    }
  },

  toast(msg,type='',dur=2800){
    const c=document.getElementById('toast-wrap');
    if(!c){
      console.log('[LifeSim]',msg);
      return;
    }

    while(c.children.length>=6){
      c.firstElementChild?.remove();
    }

    const t=document.createElement('div');
    t.className='toast'+(type?' toast-'+type:'');
    t.textContent=String(msg??'');

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
