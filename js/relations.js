/* js/relations.js — LifeSim module */
const Relations={
  STAGES:{talking:'Talking',dating:'Dating',serious:'Serious',engaged:'Engaged',married:'Married'},
  ACTION_LIMITS:{partner:4,intimate:2,risky:1,find:2,teen:2,family:3,child:3,friend:4,ex:2,lover:2},
  HISTORY_LIMIT:24,

  _esc(v){return typeof escHTML==='function'?escHTML(v):String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));},
  _attr(v){return String(v??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');},

  _resetActionYearIfNeeded(G=window.G){
    if(!G)return;
    if(!Number.isFinite(G.relationActionYear))G.relationActionYear=G.age||0;
    if(!G.relationActionUses||typeof G.relationActionUses!=='object')G.relationActionUses={};
    if(G.relationActionYear!==(G.age||0)){
      G.relationActionYear=G.age||0;
      G.relationActionUses={};
    }
  },

  _usesLeft(action,G=window.G){
    this._resetActionYearIfNeeded(G);
    return Math.max(0,(this.ACTION_LIMITS[action]??99)-(G?.relationActionUses?.[action]||0));
  },

  _canUseAction(action,msg='Requirement not met for that action.'){
    const G=window.G;if(!G)return false;
    this._resetActionYearIfNeeded(G);
    if(this._usesLeft(action,G)<=0){
      UI.toast(msg,'bad');
      return false;
    }
    return true;
  },

  _markAction(action,G=window.G){
    if(!G||!action)return;
    this._resetActionYearIfNeeded(G);
    G.relationActionUses[action]=(G.relationActionUses[action]||0)+1;
  },

  _recordHistory(label,type='relationship',meta=''){
    const G=window.G;if(!G)return;
    if(!Array.isArray(G.relationHistory))G.relationHistory=[];
    G.relationHistory.unshift({age:G.age||0,label,type,meta});
    if(G.relationHistory.length>this.HISTORY_LIMIT)G.relationHistory.length=this.HISTORY_LIMIT;
  },

  _partnerActionKey(act){
    if(['intimate','massage','sext','baby'].includes(act))return'intimate';
    if(['cheat','divorce'].includes(act))return'risky';
    return'partner';
  },

  _ensureState(G=window.G){
    if(!G)return;
    if(!G.rels)G.rels={father:null,mother:null,siblings:[],partner:null,children:[],friends:[],exes:[]};
    G.rels.siblings=Array.isArray(G.rels.siblings)?G.rels.siblings:[];
    G.rels.children=Array.isArray(G.rels.children)?G.rels.children:[];
    G.rels.friends=Array.isArray(G.rels.friends)?G.rels.friends:[];
    G.rels.exes=Array.isArray(G.rels.exes)?G.rels.exes:[];
    G.rels.lovers=Array.isArray(G.rels.lovers)?G.rels.lovers:[];
    if(!('partner' in G.rels))G.rels.partner=null;

    if(!G.sexualHealth)G.sexualHealth={std:false,sti:false,partners:0,partnerIds:[],protectedEncounters:0,unprotectedEncounters:0,lastCheckupAge:null};
    if(!Array.isArray(G.sexualHealth.partnerIds))G.sexualHealth.partnerIds=[];
    G.sexualHealth.partners=Number.isFinite(G.sexualHealth.partners)?G.sexualHealth.partners:0;
    G.sexualHealth.protectedEncounters=Number.isFinite(G.sexualHealth.protectedEncounters)?G.sexualHealth.protectedEncounters:0;
    G.sexualHealth.unprotectedEncounters=Number.isFinite(G.sexualHealth.unprotectedEncounters)?G.sexualHealth.unprotectedEncounters:0;
    G.sexualHealth.sti=!!(G.sexualHealth.sti||G.sexualHealth.std);
    G.sexualHealth.std=G.sexualHealth.sti;

    if(!Array.isArray(G.relationHistory))G.relationHistory=[];
    if(!G.relationActionUses||typeof G.relationActionUses!=='object')G.relationActionUses={};
    if(!Number.isFinite(G.relationActionYear))G.relationActionYear=G.age||0;
    this._resetActionYearIfNeeded(G);

    [G.rels.father,G.rels.mother,...G.rels.siblings].filter(Boolean).forEach(n=>this._ensureNpc(n));
    if(G.rels.partner)this._ensurePartnerDefaults(G.rels.partner);
    G.rels.children.forEach(c=>this._ensureChildDefaults(c));
    G.rels.friends.forEach(f=>this._ensureFriendDefaults(f));
    G.rels.exes.forEach(e=>this._ensureExDefaults(e));
    G.rels.lovers.forEach(l=>this._ensureLoverDefaults(l));
    this._removePartnerFromLovers(G);
    this._syncPregnancyState(G);
  },

  _syncPregnancyState(G=window.G){
    if(!G)return [];
    if(!Array.isArray(G.pregnancies))G.pregnancies=[];

    // Backward compatibility: old saves used a single G.pregnancy object.
    if(G.pregnancy&&typeof G.pregnancy==='object'){
      const exists=G.pregnancies.some(p=>p&&(p.id===G.pregnancy.id||(
        p.partnerId===G.pregnancy.partnerId&&
        p.partnerName===G.pregnancy.partnerName&&
        p.dueAge===G.pregnancy.dueAge
      )));
      if(!exists)G.pregnancies.push({...G.pregnancy});
    }

    G.pregnancies=G.pregnancies
      .filter(p=>p&&typeof p==='object')
      .map(p=>({
        id:p.id||('preg_'+Math.random().toString(36).slice(2)),
        partnerId:p.partnerId||null,
        partnerName:p.partnerName||'someone',
        partnerGender:p.partnerGender||null,
        dueAge:Number.isFinite(p.dueAge)?p.dueAge:(G.age||0)+1,
        keep:p.keep!==false,
        assisted:!!p.assisted,
        twins:!!p.twins,
        source:p.source||'natural',
        startedAge:Number.isFinite(p.startedAge)?p.startedAge:(G.age||0),
      }));

    G.pregnancy=G.pregnancies[0]||null;
    if(G.family&&G.pregnancy)G.family.twinPreg=!!G.pregnancy.twins;
    if(G.family&&!G.pregnancy)G.family.twinPreg=false;
    return G.pregnancies;
  },

  _activePregnancies(G=window.G){
    return this._syncPregnancyState(G).filter(p=>p&&Number.isFinite(p.dueAge));
  },

  _playerCanCarryPregnancy(G=window.G){
    return this._genderKey(G?.gender)==='female';
  },

  _pregnancyBlockReason(partner,G=window.G){
    if(!G||!partner)return 'No pregnancy partner.';
    const active=this._activePregnancies(G);
    const partnerId=partner?.id||null;
    const partnerName=String(partner?.name||'').trim().toLowerCase();

    if(this._playerCanCarryPregnancy(G)&&active.length){
      return 'You are already pregnant.';
    }

    const samePartnerPregnant=active.some(p=>{
      if(partnerId&&p.partnerId&&p.partnerId===partnerId)return true;
      return !!partnerName&&String(p.partnerName||'').trim().toLowerCase()===partnerName;
    });
    if(samePartnerPregnant)return `${partner.name||'That person'} is already expecting a baby with you.`;
    return '';
  },

  _canStartPregnancyWith(partner,G=window.G){
    return !this._pregnancyBlockReason(partner,G);
  },

  _addPregnancyRecord(record,G=window.G){
    if(!G)return null;
    if(!Array.isArray(G.pregnancies))G.pregnancies=[];
    const clean={
      id:record.id||('preg_'+Math.random().toString(36).slice(2)),
      partnerId:record.partnerId||null,
      partnerName:record.partnerName||'someone',
      partnerGender:record.partnerGender||null,
      dueAge:Number.isFinite(record.dueAge)?record.dueAge:(G.age||0)+1,
      keep:record.keep!==false,
      assisted:!!record.assisted,
      twins:!!record.twins,
      source:record.source||'natural',
      startedAge:Number.isFinite(record.startedAge)?record.startedAge:(G.age||0),
    };
    G.pregnancies.push(clean);
    this._syncPregnancyState(G);
    return clean;
  },

  _removePregnancyRecord(id,G=window.G){
    if(!G)return;
    if(!Array.isArray(G.pregnancies))G.pregnancies=[];
    G.pregnancies=G.pregnancies.filter(p=>p&&p.id!==id);
    this._syncPregnancyState(G);
  },

  _pregnancySummaryText(G=window.G){
    const active=this._activePregnancies(G);
    if(!active.length)return '';
    if(active.length===1){
      const p=active[0];
      return `🍼 Pregnancy: ${p.keep?'Keeping the baby':'Planning adoption'} · due next year with ${this._esc(p.partnerName)}.`;
    }
    return `🍼 ${active.length} active pregnancies · next due with ${this._esc(active[0].partnerName)}.`;
  },

  _ensureNpc(n){
    if(!n)return null;
    n.id=n.id||Math.random().toString(36).slice(2);
    n.name=n.name||'Unknown';
    n.surname=n.surname||window.G?.surname||'';
    n.age=Number.isFinite(n.age)?n.age:30;
    n.love=Number.isFinite(n.love)?cl(n.love):r(45,75);
    n.alive=n.alive!==false;
    n.role=n.role||'family';
    return n;
  },

  _ensurePartnerDefaults(p){
    if(!p)return null;
    p.id=p.id||Math.random().toString(36).slice(2);
    p.stage=p.stage||(p.married?'married':'dating');
    p.chemistry=Number.isFinite(p.chemistry)?cl(p.chemistry):r(45,85);
    p.intimacy=Number.isFinite(p.intimacy)?cl(p.intimacy):35;
    p.love=Number.isFinite(p.love)?cl(p.love):r(35,70);
    p.dates=Number.isFinite(p.dates)?p.dates:0;
    p.yearsTogether=Number.isFinite(p.yearsTogether)?p.yearsTogether:0;
    p.yearsMarried=Number.isFinite(p.yearsMarried)?p.yearsMarried:0;
    p.engaged=!!p.engaged||p.stage==='engaged';
    p.married=!!p.married||p.stage==='married';
    p.sti=!!p.sti;
    p.outsideExposure=!!p.outsideExposure;
    p.sexualEncounters=Number.isFinite(p.sexualEncounters)?p.sexualEncounters:0;
    p.alive=p.alive!==false;
    p.role='partner';
    return p;
  },

  _ensureFriendDefaults(f){
    const G=window.G;
    if(!f)return null;
    f.id=f.id||Math.random().toString(36).slice(2);

    // Age was a common source of broken-looking friend cards: old saves or
    // string ages could make 100% bond friends still show locked romance actions.
    // Normalize numeric strings and keep adult social friends adult-safe.
    const ageNum=Number(f.age);
    if(Number.isFinite(ageNum)&&ageNum>0){
      f.age=Math.floor(ageNum);
    }else{
      const baseAge=G?.age||18;
      const minAge=baseAge>=18?18:16;
      f.age=Math.max(minAge,baseAge+r(-6,6));
    }

    // Legacy adult saves generated some friends at 16/17. If the player is now
    // an adult and the friend is a normal social contact, normalize them to 18
    // instead of showing impossible 100% bond / locked romance cards forever.
    if((G?.age||0)>=18&&f.age<18&&!f.teenFriend)f.age=18;

    if(!Number.isFinite(Number(f.love)))f.love=r(38,65);
    else f.love=cl(Number(f.love));

    // Legacy/patch compatibility: some saves or older systems used bond/score
    // while the romance buttons checked love. This caused cards to show
    // "100% bond" but Kiss/Hook Up stayed locked. Keep all friend bond
    // fields synchronized to one source of truth.
    const legacyBond=Number(f.bond);
    const legacyScore=Number(f.score);
    if(Number.isFinite(legacyBond))f.love=cl(Math.max(f.love,legacyBond));
    if(Number.isFinite(legacyScore))f.love=cl(Math.max(f.love,legacyScore));
    f.bond=f.love;
    f.score=f.love;

    if(!Number.isFinite(Number(f.interactions)))f.interactions=0;
    else f.interactions=Math.max(0,Math.floor(Number(f.interactions)));
    f.bestFriend=!!f.bestFriend;
    f.alive=f.alive!==false;
    f.role='friend';
    return f;
  },

  _ensureChildDefaults(c){
    const G=window.G;
    if(!c)return null;
    c.id=c.id||Math.random().toString(36).slice(2);
    c.role='child';
    c.alive=c.alive!==false;
    c.surname=c.surname||G?.surname||'';
    c.love=Number.isFinite(c.love)?cl(c.love):r(55,80);
    c.school=Number.isFinite(c.school)?cl(c.school):70;
    c.wellbeing=Number.isFinite(c.wellbeing)?cl(c.wellbeing):70;
    c.issue=c.issue||'';
    c.issueSeverity=Number.isFinite(c.issueSeverity)?c.issueSeverity:0;
    c.independent=!!c.independent;
    c.adopted=!!c.adopted;
    c.age=Number.isFinite(c.age)?c.age:0;
    return c;
  },

  _ensureExDefaults(ex){
    if(!ex)return null;
    ex.id=ex.id||Math.random().toString(36).slice(2);
    ex.alive=ex.alive!==false;
    ex.score=Number.isFinite(ex.score)?cl(ex.score):35;
    ex.yearsApart=Number.isFinite(ex.yearsApart)?ex.yearsApart:0;
    ex.chemistry=Number.isFinite(ex.chemistry)?cl(ex.chemistry):r(40,80);
    ex.intimacy=Number.isFinite(ex.intimacy)?cl(ex.intimacy):20;
    ex.lastLove=Number.isFinite(ex.lastLove)?cl(ex.lastLove):40;
    ex.cause=ex.cause||'breakup';
    ex.causeLabel=ex.causeLabel||(ex.cause==='cheating'?'Cheating fallout':ex.cause==='drifted'?'Drifted apart':ex.cause==='divorce'?'Divorce':ex.cause==='death'?'Passed away':'Breakup');
    ex.role='ex';
    return ex;
  },

  _ensureLoverDefaults(l){
    if(!l)return null;
    l.id=l.id||Math.random().toString(36).slice(2);
    l.name=l.name||'Unknown';
    l.surname=l.surname||'';
    l.age=Number.isFinite(l.age)?l.age:Math.max(18,window.G?.age||18);
    l.gender=l.gender||((window.G?.gender==='female')?'male':'female');
    l.chemistry=Number.isFinite(l.chemistry)?cl(l.chemistry):r(45,85);
    l.intimacy=Number.isFinite(l.intimacy)?cl(l.intimacy):r(25,65);
    l.bond=Number.isFinite(l.bond)?cl(l.bond):r(20,55);
    l.encounters=Number.isFinite(l.encounters)?l.encounters:1;
    l.lastAge=Number.isFinite(l.lastAge)?l.lastAge:(window.G?.age||0);
    l.role='lover';
    return l;
  },

  _relationColor(v){if(v>=75)return'var(--pink)';if(v>=50)return'var(--cyan)';if(v>=30)return'var(--yellow)';return'var(--red)';},
  _chemColor(v){if(v>=75)return'var(--green)';if(v>=45)return'var(--cyan)';return'var(--orange)';},

  _captureLoveViewport(target){
    if(typeof UI==='undefined'||typeof UI._captureViewport!=='function')return null;
    const snap=UI._captureViewport();
    const anchor=target?.closest?.('.card,.act-card,.row-card,.rel-card,.partner-card,button,[onclick]')||null;
    const labelEl=anchor?.querySelector?.('.cn,.ac-lbl,.rel-name,.ri,.modal-choice-label,strong,b')||anchor||null;
    snap.anchorLabel=String(labelEl?.textContent||'').replace(/\s+/g,' ').trim().slice(0,80);
    snap.anchorTop=anchor?.getBoundingClientRect?.().top??null;
    return snap;
  },

  _findLoveAnchor(root,snap){
    if(!root||!snap?.anchorLabel)return null;
    const nodes=root.querySelectorAll('.card,.act-card,.row-card,.rel-card,.partner-card,button,[onclick]');
    const label=snap.anchorLabel.toLowerCase();
    return [...nodes].find(node=>{
      const text=String(node.textContent||'').replace(/\s+/g,' ').trim().slice(0,120).toLowerCase();
      return !!text&&text.includes(label);
    })||null;
  },

  _restoreLoveViewport(snap,root){
    if(!snap||typeof UI==='undefined'||typeof UI._restoreViewport!=='function')return;
    const restore=()=>{
      UI._restoreViewport(snap);
      if(!root||!Number.isFinite(snap.anchorTop))return;
      const anchor=this._findLoveAnchor(root,snap);
      const scroller=snap.scroller&&document.contains(snap.scroller)
        ?snap.scroller
        :(document.querySelector('#game-content')||document.querySelector('.content-area'));
      if(!anchor||!scroller)return;
      const delta=anchor.getBoundingClientRect().top-snap.anchorTop;
      if(Math.abs(delta)>2)scroller.scrollTop+=delta;
    };
    restore();
    requestAnimationFrame(restore);
  },

  _bindLoveViewportGuard(el){
    // Disabled: using standard UI.preserveViewport instead
  },

  _statBar(label,value,color){
    const key=String(label||'stat').toLowerCase().replace(/[^a-z0-9_-]+/g,'-');
    return`<div data-rel-stat="${this._attr(key)}">
      <div class="sb-l" style="margin-bottom:3px">${this._esc(label)}</div>
      <div class="rel-bar"><div class="rel-fill" data-rel-fill="${this._attr(key)}" style="width:${cl(value)}%;background:${color}"></div></div>
      <div data-rel-value="${this._attr(key)}" style="font-size:10px;font-weight:800;color:${color};margin-top:2px">${cl(value)}%</div>
    </div>`;
  },

  render(opts={}){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const el=document.getElementById('tab-love');if(!el)return;
    this._bindLoveViewportGuard(el);
    const isActive=typeof UI!=='undefined'&&UI._activeTab==='love'&&el.classList.contains('active');
    
    const doRender=()=>{
      let h='';
      h+=this._renderFamily(G);
      h+=this._renderRomance(G);
      h+=this._renderExes(G);
      h+=this._renderChildren(G);
      h+=this._renderFriends(G);
      h+=this._renderLovers(G);
      h+=this._renderHistory(G);
      el.innerHTML=h;
      UI?.enhanceInteractive?.(el);
      try{ window.ReleaseSections?.polishTab?.('love'); }catch(_){}
    };
    
    const shouldPreserve=opts?.preserve!==false;
    const insideStable=typeof UI==='object'&&(UI._stableRenderDepth||0)>0;

    if(shouldPreserve&&isActive&&!insideStable&&typeof UI==='object'&&typeof UI.stableRender==='function'){
      UI.stableRender(el,doRender);
    }else if(shouldPreserve&&isActive&&!insideStable&&typeof UI==='object'&&typeof UI.preserveViewport==='function'){
      UI.preserveViewport(doRender);
    }else{
      doRender();
    }
  },


  _cssEscape(value){
    const raw=String(value??'');
    try{
      if(window.CSS&&typeof CSS.escape==='function')return CSS.escape(raw);
    }catch(_){ }
    return raw.replace(/\\/g,'\\\\').replace(/"/g,'\\"');
  },

  _isLoveActive(){
    const el=document.getElementById('tab-love');
    return !!(el&&el.classList.contains('active')&&(!window.UI||UI._activeTab==='love'));
  },

  _setRelMetric(root,key,value,color){
    if(!root)return;
    const v=cl(value||0);
    const fill=root.querySelector(`[data-rel-fill="${this._cssEscape(key)}"]`);
    const val=root.querySelector(`[data-rel-value="${this._cssEscape(key)}"]`);
    if(fill){
      fill.style.width=v+'%';
      if(color)fill.style.background=color;
    }
    if(val){
      val.textContent=v+'%';
      if(color)val.style.color=color;
    }
  },

  _patchNpcCard(el,kind,n,metric='love',color=null){
    if(!el||!n||!n.id)return false;
    const card=el.querySelector(`[data-rel-kind="${this._cssEscape(kind)}"][data-npc-id="${this._cssEscape(n.id)}"]`);
    if(!card)return false;

    const metricValue=n[metric] ?? n.love ?? 0;
    const metricColor=color||this._relationColor(metricValue);
    this._setRelMetric(card,metric,metricValue,metricColor);

    const nameEl=card.querySelector('[data-rel-name]');
    if(nameEl){
      const surname=n.surname?` ${n.surname}`:'';
      const dead=n.alive===false?' 🪦':'';
      const star=n.bestFriend?' ⭐':'';
      nameEl.textContent=`${n.name||''}${surname}${dead}${star}`.trim();
    }

    const roleEl=card.querySelector('[data-rel-role]');
    if(roleEl){
      if(kind==='family'){
        roleEl.textContent=`${cap(n.role||'family')} · Age ${n.age||0}${n.alive===false?' · Deceased':''}`;
      }else if(kind==='child'){
        roleEl.textContent=`Age ${n.age||0}${n.independent?' · Independent':''}${n.adopted?' · Adopted':''}${n.issue?` · ${n.issue}`:''}`;
      }else if(kind==='friend'){
        roleEl.textContent=`Friend · Age ${Math.floor(n.age||18)} · ${this._friendBond(n)}% bond`;
      }
    }

    return true;
  },

  _patchLoveTabValues(){
    const G=window.G;
    const el=document.getElementById('tab-love');
    if(!G||!el)return false;
    this._ensureState(G);

    let patched=false;

    const p=G.rels?.partner?this._ensurePartnerDefaults(G.rels.partner):null;
    const partnerCard=el.querySelector('[data-rel-kind="partner"]');
    if(p&&partnerCard){
      const stage=this.STAGES[p.stage]||cap(p.stage||'dating');
      const nameEl=partnerCard.querySelector('[data-rel-name]');
      const roleEl=partnerCard.querySelector('[data-rel-role]');
      if(nameEl)nameEl.textContent=`${p.name||''} ${p.surname||''}${p.stage==='married'?' 💍':p.stage==='engaged'?' 💎':''}`.trim();
      if(roleEl)roleEl.textContent=`${stage} · Age ${p.age||0} · ${p.yearsTogether||0} year${(p.yearsTogether||0)!==1?'s':''} together`;
      this._setRelMetric(partnerCard,'love',p.love,this._relationColor(p.love||0));
      this._setRelMetric(partnerCard,'chemistry',p.chemistry,this._chemColor(p.chemistry||0));
      this._setRelMetric(partnerCard,'intimacy',p.intimacy||0,this._relationColor(p.intimacy||0));
      patched=true;
    }

    [G.rels?.father,G.rels?.mother,...(G.rels?.siblings||[])].filter(Boolean).forEach(n=>{
      if(this._patchNpcCard(el,'family',n,'love',this._relationColor(n.love||0)))patched=true;
    });

    (G.rels?.children||[]).forEach(c=>{
      this._ensureChildDefaults(c);
      if(this._patchNpcCard(el,'child',c,'love','var(--cyan)'))patched=true;
    });

    (G.rels?.friends||[]).forEach(f=>{
      this._ensureFriendDefaults(f);
      const bond=this._friendBond(f);
      const lc=bond>84?'var(--yellow)':bond>65?'var(--cyan)':'var(--muted)';
      if(this._patchNpcCard(el,'friend',f,'love',lc))patched=true;
      if(this._patchFriendActionGrid(el,f,G))patched=true;
    });

    return patched;
  },

  _focusLoveSelector(selector){
    if(!selector)return;
    const panel=document.getElementById('tab-love');
    const node=panel?.querySelector(selector);
    const scroller=document.querySelector('.content-area');
    if(!panel||!node||!scroller||!panel.classList.contains('active'))return;

    // Use manual scroll instead of scrollIntoView to avoid browser anchoring jumps.
    const scrollerRect=scroller.getBoundingClientRect();
    const nodeRect=node.getBoundingClientRect();
    const target=scroller.scrollTop+(nodeRect.top-scrollerRect.top)-12;
    scroller.scrollTop=Math.max(0,target);
  },

  _afterLoveStructure(opts={}){
    UI?.update?.();

    const panel=document.getElementById('tab-love');
    const renderNow=()=>this.render({preserve:false});

    // Structural Love actions replace cards/sections. Keep the user's current
    // viewport anchored to the clicked card/index instead of auto-scrolling to
    // partner/friend cards. This fixes Meet Someone, Dating App, Casual Date,
    // Nightlife Date, Plan Baby and stage-change actions.
    if(panel&&panel.classList.contains('active')&&typeof UI==='object'&&typeof UI.stableRender==='function'){
      UI.stableRender(panel,renderNow,opts||{});
    }else{
      renderNow();
    }

    // Only force focus when explicitly requested. Default focus caused random
    // jumps on desktop/tablet/mobile after structural relationship actions.
    if(opts.focus&&opts.forceFocus){
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>this._focusLoveSelector(opts.focus));
      });
    }
  },

  _afterLoveAction(opts={}){
    UI?.update?.();
    const full=!!opts.full;
    if(full||!this._isLoveActive()){
      const panel=document.getElementById('tab-love');
      const renderNow=()=>this.render({preserve:false});
      if(panel&&panel.classList.contains('active')&&typeof UI==='object'&&typeof UI.stableRender==='function'){
        UI.stableRender(panel,renderNow,opts||{});
      }else{
        renderNow();
      }
      return;
    }
    if(!this._patchLoveTabValues())this._afterLoveAction({full:true});
  },

  _smallCard(icon,name,desc,onclick,locked=false,lock='Locked',danger=false,special=false){
    const actionKey='love:action:'+String(onclick||name||'card').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,90);
    return`<div class="card ${danger?'danger ':''}${special?'special ':''}${locked?'locked':''}" data-stable-key="${this._attr(actionKey)}" style="min-height:68px;padding:9px 8px" onclick="${locked?`UI.toast('${this._attr(lock)}')`:onclick}">
      <span class="ci" style="font-size:20px">${locked?'🔒':icon}</span>
      <span class="cn">${this._esc(name)}</span>
      <span class="cd">${locked?this._esc(lock):desc}</span>
    </div>`;
  },

  _renderFamily(G){
    const fam=[G.rels.father,G.rels.mother,...(G.rels.siblings||[])].filter(Boolean);
    let h='<div class="sec">Family</div>';

    if(!fam.length)return h+`<div class="empty"><span class="ei">👪</span><p>No family information available.</p></div>`;

    fam.forEach(n=>{
      const ico=n.role==='father'?'👨':n.role==='mother'?'👩':n.gender==='female'?'👧':'👦';
      const lc=this._relationColor(n.love||0);

      h+=`<div class="rel-card" data-stable-key="love:family:${this._attr(n.id)}" data-rel-kind="family" data-npc-id="${this._attr(n.id)}">
        <div class="rel-av">${ico}</div>
        <div class="rel-inf">
          <div class="rel-name" data-rel-name>${this._esc(n.name)} ${this._esc(n.surname)}${!n.alive?' 🪦':''}</div>
          <div class="rel-role" data-rel-role>${this._esc(cap(n.role))} · Age ${n.age}${!n.alive?' <span class="badge badge-r">Deceased</span>':''}</div>
          ${n.alive?`<div class="rel-bar"><div class="rel-fill" data-rel-fill="love" style="width:${cl(n.love||0)}%;background:${lc}"></div></div>`:''}
        </div>
        ${n.alive?`<div data-rel-value="love" style="font-size:11px;font-weight:800;color:${lc}">${cl(n.love||0)}%</div>`:''}
      </div>`;

      if(n.alive){
        h+=`<div class="act-grid" style="margin:-2px 0 10px 0">
          ${this._smallCard('😊',`${n.name}: Time`,'+Bond +Hap',`Relations.familyAction('${n.id}','time')`)}
          ${this._smallCard('📞','Call','Small bond boost',`Relations.familyAction('${n.id}','call')`)}
          ${this._smallCard('🍽️','Dinner',fmt(sc(80)),`Relations.familyAction('${n.id}','dinner')`,(G.money||0)<sc(80),`Need ${fmt(sc(80))}`)}
          ${this._smallCard('🤝','Help Out',fmt(sc(250)),`Relations.familyAction('${n.id}','help')`,(G.money||0)<sc(250),`Need ${fmt(sc(250))}`)}
        </div>`;
      }
    });

    return h;
  },

  _renderRomance(G){
    let h='<div class="sec">Love & Relationship</div>';
    const p=G.rels.partner?this._ensurePartnerDefaults(G.rels.partner):null;

    if(p){
      const stage=this.STAGES[p.stage]||cap(p.stage||'dating');

      h+=`<div class="partner-card" data-stable-key="love:partner" data-rel-kind="partner">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div class="rel-av" style="width:52px;height:52px;font-size:26px">${p.gender==='female'?'👩':'👨'}</div>
          <div style="flex:1">
            <div data-rel-name style="font-size:17px;font-weight:900">${this._esc(p.name)} ${this._esc(p.surname)}${p.stage==='married'?' 💍':p.stage==='engaged'?' 💎':''}</div>
            <div data-rel-role style="font-size:12px;color:var(--muted);font-weight:600;margin-top:2px">${stage} · Age ${p.age} · ${p.yearsTogether||0} year${(p.yearsTogether||0)!==1?'s':''} together</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          ${this._statBar('Love',p.love,this._relationColor(p.love||0))}
          ${this._statBar('Chemistry',p.chemistry,this._chemColor(p.chemistry||0))}
          ${this._statBar('Intimacy',p.intimacy||0,this._relationColor(p.intimacy||0))}
        </div>
      </div>`;

      const pregnancyText=this._pregnancySummaryText(G);
      if(pregnancyText){
        h+=`<div class="info-box" style="border-color:rgba(236,72,153,.35)"><p>${pregnancyText}</p></div>`;
      }

      h+=`<div class="sec">Dating Actions</div>
      <div class="act-grid">
        ${this._smallCard('🌹','Go on Date','+Love +Hap',"Relations.pa('date')")}
        ${this._smallCard('🎁','Give Gift',`+Love (${fmt(sc(200))})`,"Relations.pa('gift')",(G.money||0)<sc(200),`Need ${fmt(sc(200))}`)}
        ${this._smallCard('😘','Flirt','+Love +Intimacy',"Relations.pa('flirt')")}
        ${this._smallCard('🌟','Compliment','+Love',"Relations.pa('compliment')")}
        ${this._smallCard('🏞️','Weekend Away',`+Love (${fmt(sc(600))})`,"Relations.pa('weekend')",(G.money||0)<sc(600),`Need ${fmt(sc(600))}`)}
        ${this._smallCard('🏖️','Romantic Holiday',`+Love +Intimacy (${fmt(sc(2000))})`,"Relations.pa('trip')",(G.money||0)<sc(2000),`Need ${fmt(sc(2000))}`)}
        ${this._milestoneButton(p)}
        ${p.stage==='married'?this._smallCard('💞','Renew Vows','+Love +Hap',"Relations.pa('renew')"):''}
        ${p.love<35?this._smallCard('🛋️','Couples Therapy',fmt(sc(200)),"Relations.pa('counselling')",(G.money||0)<sc(200),`Need ${fmt(sc(200))}`,true):''}
      </div>`;

      if((G.age||0)>=18){
        h+=`<div class="sec">Private Relationship Actions</div>
        <div class="act-grid">
          ${this._smallCard('❤️','Private Time','Safe with stable partner',"Relations.pa('intimate')")}
          ${this._smallCard('💆','Give Massage','+Intimacy +Love',"Relations.pa('massage')")}
          ${this._smallCard('📱','Affectionate Message','+Chemistry +Hap',"Relations.pa('sext')")}
          ${this._smallCard('👶','Plan for Baby','Intentional family choice',"Relations.pa('baby')")}
        </div>
        <div class="sec">Risky Actions</div>
        <div class="act-grid">
          ${this._smallCard('🤫','Cheat','Risk getting caught',"Relations.pa('cheat')",false,'',true)}
          ${this._smallCard('💔',p.stage==='married'?'Divorce':'Break Up','End relationship',"Relations.pa('divorce')",false,'',true)}
        </div>`;
      }

      return h;
    }

    if((G.age||0)>=18){
      h+=`<div class="info-box"><p>You are single. Meet someone, go on dates, or stay independent.</p></div>
      <div class="act-grid">
        ${this._smallCard('💘','Meet Someone','Start talking','Relations.findPartner()')}
        ${this._smallCard('📲','Dating App','Match or casual date','Relations.dateApp()')}
        ${this._smallCard('🌙','Casual Date','Higher-risk adult choice','Relations.hookup()')}
        ${this._smallCard('🎭','Nightlife Date',fmt(sc(100)),'Relations.visitAdultClub()',(G.money||0)<sc(100),`Need ${fmt(sc(100))}`)}
      </div>`;
    }else if((G.age||0)>=16){
      h+=`<div class="info-box"><p>Romance is available now. Pursue a crush, go on dates, or stay independent.</p></div>
      <div class="act-grid">
        ${this._smallCard('💘','Pursue Crush','Teen romance','Relations.teenCrush()')}
        ${this._smallCard('🎬','First Date','Cinema and coffee','Relations.teenDate()')}
      </div>`;
    }else{
      h+=`<div class="empty"><span class="ei">🧒</span><p>Romance unlocks at age 16.</p></div>`;
    }

    return h;
  },

  _milestoneButton(p){
    const step={
      talking:{icon:'💘',name:'Start Dating',act:'define',ready:p.love>=40,need:p.love<40?'Need 40+ love':'Move past talking'},
      dating:{icon:'🏠',name:'Get Serious',act:'serious',ready:p.love>=58&&p.chemistry>=45,need:p.love<58?'Need 58+ love':p.chemistry<45?'Need 45+ chemistry':'Exclusive + cohabit'},
      serious:{icon:'💎',name:'Propose',act:'propose',ready:p.love>=70&&(p.intimacy||0)>=45,need:p.love<70?'Need 70+ love':(p.intimacy||0)<45?'Need 45+ intimacy':'Become engaged'},
      engaged:{icon:'💍',name:'Get Married',act:'marry',ready:true,need:'Make it official'},
    }[p.stage];
    if(!step)return '';
    return this._smallCard(step.icon,step.name,step.need,`Relations.pa('${step.act}')`,!step.ready,step.need,false,true);
  },

  _renderExes(G){
    const exes=(G.rels.exes||[]).filter(Boolean);
    if(!exes.length)return'';

    let h=`<div class="sec">Exes (${exes.length})</div>`;
    exes.forEach(ex=>{
      this._ensureExDefaults(ex);
      const col=this._relationColor(ex.score||0);
      const can=!G.rels.partner&&ex.alive!==false&&(ex.score||0)>=42;
      const chance=Math.round(this._reconcileChance(ex)*100);

      h+=`<div class="rel-card">
        <div class="rel-av">${ex.gender==='female'?'👩':'👨'}</div>
        <div class="rel-inf">
          <div class="rel-name">${this._esc(ex.name)} ${this._esc(ex.surname)}${ex.alive===false?' 🪦':''}</div>
          <div class="rel-role">Ex · ${this._esc(ex.causeLabel||'Past relationship')} · ${ex.yearsApart||0} year${(ex.yearsApart||0)!==1?'s':''} apart</div>
          <div class="rel-bar"><div class="rel-fill" style="width:${cl(ex.score||0)}%;background:${col}"></div></div>
        </div>
        <div style="font-size:11px;font-weight:800;color:${col}">${cl(ex.score||0)}%</div>
      </div>
      <div class="act-grid" style="margin:-2px 0 10px 0">
        ${this._smallCard('💬','Check In','Warm things up',`Relations.exAction('${ex.id}','checkin')`)}
        ${this._smallCard('🙏','Apologize','Repair damage',`Relations.exAction('${ex.id}','apology')`)}
        ${this._smallCard('☕','Meet Up',fmt(sc(90)),`Relations.exAction('${ex.id}','meet')`,(G.money||0)<sc(90),`Need ${fmt(sc(90))}`)}
        ${this._smallCard('💞','Try Again',can?`${chance}% chance`:G.rels.partner?'Be single first':ex.alive===false?'Too late':'Need 42%+ score',`Relations.exAction('${ex.id}','retry')`,!can,can?'':'Not available',false,true)}
      </div>`;
    });

    return h;
  },

  _renderChildren(G){
    const kids=G.rels.children||[];
    if(!kids.length)return'';

    let h=`<div class="sec">Children (${kids.length})</div>`;
    kids.forEach(c=>{
      this._ensureChildDefaults(c);
      const issue=c.issue?` · <span style="color:${c.issueSeverity>=12?'var(--red)':'var(--orange)'}">${this._esc(c.issue)}</span>`:'';

      h+=`<div class="rel-card" data-stable-key="love:child:${this._attr(c.id)}" data-rel-kind="child" data-npc-id="${this._attr(c.id)}">
        <div class="rel-av">${c.gender==='female'?'👧':'👦'}</div>
        <div class="rel-inf">
          <div class="rel-name" data-rel-name>${this._esc(c.name)} ${this._esc(c.surname||G.surname)}</div>
          <div class="rel-role" data-rel-role>Age ${c.age}${c.independent?' · Independent':''}${c.adopted?' · Adopted':''}${issue}</div>
          <div class="rel-bar"><div class="rel-fill" data-rel-fill="love" style="width:${cl(c.love||60)}%;background:var(--cyan)"></div></div>
        </div>
        <div data-rel-value="love" style="font-size:11px;font-weight:800;color:var(--cyan)">${cl(c.love||60)}%</div>
      </div>
      <div class="act-grid" style="margin:-2px 0 10px 0">
        ${this._smallCard('👨‍👩‍👧','Spend Time','+Bond',`Relations.childAction('${c.id}','time')`)}
        ${this._smallCard('📚','Help School','+School',`Relations.childAction('${c.id}','school')`)}
        ${this._smallCard('🎁','Buy Gift',fmt(sc(120)),`Relations.childAction('${c.id}','gift')`,(G.money||0)<sc(120),`Need ${fmt(sc(120))}`)}
        ${this._smallCard('🛟','Support','Help problems',`Relations.childAction('${c.id}','support')`)}
      </div>`;
    });

    return h;
  },

  _friendBond(f){
    this._ensureFriendDefaults(f);
    return cl(Math.max(Number(f?.love)||0,Number(f?.bond)||0,Number(f?.score)||0));
  },

  _friendRomanceState(f,G=window.G){
    this._ensureFriendDefaults(f);
    const bond=this._friendBond(f);
    const romanceOk=this._isRomanceCompatible(f,G);
    const teenRomance=(G?.age||0)>=16&&(f.age||0)>=16;
    const adultFriend=(G?.age||0)>=18&&(f.age||0)>=18;
    const hasPartner=!!G?.rels?.partner;
    const canAsk=romanceOk&&teenRomance&&!hasPartner&&bond>=45;
    const canKiss=romanceOk&&teenRomance&&bond>=70;
    const canHookup=romanceOk&&adultFriend&&bond>=80;
    const askName=hasPartner?(f.gender==='female'?'Side Girlfriend':'Side Boyfriend'):this._romanceLabelFor(f);
    const askCd=!romanceOk?'Not compatible':!teenRomance?'Age 16+':hasPartner?'Be single first':bond<45?'Build bond first':'Ask them out';
    const kissLock=!romanceOk?'Not compatible':!teenRomance?'Age 16+':bond<70?'Need 70+ bond':'';
    const hookLock=!romanceOk?'Not compatible':!adultFriend?'Adults only':bond<80?'Need 80+ bond':'';
    return{bond,romanceOk,teenRomance,adultFriend,hasPartner,canAsk,canKiss,canHookup,askName,askCd,kissLock,hookLock};
  },

  _renderFriendActions(f,G=window.G){
    this._ensureFriendDefaults(f);
    const st=this._friendRomanceState(f,G);
    const baseActions=[
      this._smallCard('😄','Hang Out','+Bond +Hap',`Relations.friendAction('${f.id}','hang')`),
      this._smallCard('💬','Deep Talk','Best friend path',`Relations.friendAction('${f.id}','talk')`),
      this._smallCard('🎁','Gift',fmt(sc(80)),`Relations.friendAction('${f.id}','gift')`,(G.money||0)<sc(80),`Need ${fmt(sc(80))}`),
    ];
    const romanceActions=st.romanceOk?[
      this._smallCard('😘','Kiss',st.canKiss?(st.hasPartner?'Cheating risk':'Risky spark'):st.kissLock,`Relations.friendKiss('${f.id}')`,!st.canKiss,st.kissLock,st.hasPartner,true),
      this._smallCard('🔥','Hook Up',st.canHookup?(st.hasPartner?'Cheating risk':'Adult encounter'):st.hookLock,`Relations.friendHookup('${f.id}')`,!st.canHookup,st.hookLock,true),
      this._smallCard(st.hasPartner?'🤫':'💘',st.askName,st.askCd,`Relations.askFriendOut('${f.id}')`,!st.canAsk,st.askCd,st.hasPartner,true),
    ]:[];
    return[...baseActions,...romanceActions].join('');
  },

  _normalizeActionHTML(html){
    return String(html||'')
      .replace(/\sdata-key-click-bound=(?:"1"|'1'|1)/g,'')
      .replace(/\srole=(?:"button"|'button')/g,'')
      .replace(/\stabindex=(?:"0"|'0'|0)/g,'')
      .replace(/\s+/g,' ')
      .trim();
  },

  _patchFriendActionGrid(el,f,G=window.G){
    if(!el||!f?.id)return false;
    const card=el.querySelector(`[data-rel-kind="friend"][data-npc-id="${this._cssEscape(f.id)}"]`);
    const grid=card?.nextElementSibling;
    if(!grid||!grid.classList?.contains('act-grid'))return false;
    const next=this._renderFriendActions(f,G);

    // UI.enhanceInteractive adds role/tabindex/data-key-click-bound attributes.
    // Comparing raw innerHTML made this grid rebuild after every click, which
    // caused the visible jump even when the buttons did not really change.
    if(this._normalizeActionHTML(grid.innerHTML)===this._normalizeActionHTML(next))return true;

    const previousHeight=grid.getBoundingClientRect?.().height||0;
    if(previousHeight>0)grid.style.minHeight=previousHeight+'px';
    grid.classList.add('love-actions-patching');
    grid.innerHTML=next;
    UI?.enhanceInteractive?.(grid);
    requestAnimationFrame(()=>{
      grid.classList.remove('love-actions-patching');
      grid.style.minHeight='';
    });
    return true;
  },

  _renderFriends(G){
    const friends=G.rels.friends||[];
    let h=`<div class="sec">Friends (${friends.length}/10)</div>`;

    friends.forEach(f=>{
      this._ensureFriendDefaults(f);
      const bond=this._friendBond(f);
      const lc=bond>84?'var(--yellow)':bond>65?'var(--cyan)':'var(--muted)';
      const actions=this._renderFriendActions(f,G);

      h+=`<div class="rel-card" data-stable-key="love:friend:${this._attr(f.id)}" data-rel-kind="friend" data-npc-id="${this._attr(f.id)}" onclick="Relations.hangFriend('${f.id}')">
        <div class="rel-av">${f.gender==='female'?'👩':'👨'}</div>
        <div class="rel-inf">
          <div class="rel-name" data-rel-name>${this._esc(f.name)} ${this._esc(f.surname)}${f.bestFriend?' ⭐':''}</div>
          <div class="rel-role" data-rel-role>Friend · Age ${Math.floor(f.age||18)} · ${bond}% bond</div>
          <div class="rel-bar"><div class="rel-fill" data-rel-fill="love" style="width:${bond}%;background:${lc}"></div></div>
        </div>
        <div data-rel-value="love" style="font-size:11px;font-weight:800;color:${lc}">${bond}%</div>
      </div>
      <div class="act-grid" style="margin:-2px 0 10px 0" data-friend-actions="${this._attr(f.id)}">
        ${actions}
      </div>`;
    });

    if(friends.length<10){
      h+=`<div class="row-card" onclick="Relations.makeFriend()">
        <span class="ri">🤝</span>
        <div class="rd"><div class="rt">Meet Someone New</div><div class="rs">Make a new friend</div></div>
      </div>`;
    }

    return h;
  },

  _renderLovers(G){
    const lovers=(G.rels.lovers||[]).filter(l=>l&&this._isRomanceCompatible(l,G)&&!this._isCurrentPartner(l)).slice(0,6);
    if(!lovers.length)return'';
    let h=`<div class="sec">Past Encounters (${lovers.length})</div>`;
    lovers.forEach(l=>{
      this._ensureLoverDefaults(l);
      const col=this._relationColor(Math.max(l.bond||0,l.intimacy||0));
      const canPartner=!G.rels.partner&&(l.bond||0)>=45;
      h+=`<div class="rel-card" data-stable-key="love:lover:${this._attr(l.id)}" data-rel-kind="lover" data-npc-id="${this._attr(l.id)}">
        <div class="rel-av">${l.gender==='female'?'👩':'👨'}</div>
        <div class="rel-inf">
          <div class="rel-name">${this._esc(l.name)} ${this._esc(l.surname)}${l.affair?' 🤫':''}</div>
          <div class="rel-role">${l.affair?'Affair':'Encounter'} · chemistry ${cl(l.chemistry||0)}% · ${l.encounters||1} time${(l.encounters||1)!==1?'s':''}</div>
          <div class="rel-bar"><div class="rel-fill" style="width:${cl(Math.max(l.bond||0,l.intimacy||0))}%;background:${col}"></div></div>
        </div>
      </div>
      <div class="act-grid" style="margin:-2px 0 10px 0">
        ${this._smallCard('💬','Text Again','Build bond',`Relations.loverAction('${l.id}','text')`)}
        ${this._smallCard('☕','Meet Again',fmt(sc(90)),`Relations.loverAction('${l.id}','meet')`,(G.money||0)<sc(90),`Need ${fmt(sc(90))}`)}
        ${this._smallCard('🔥','Hook Up Again','Adult encounter',`Relations.loverAction('${l.id}','hookup')`,false,'',true)}
        ${this._smallCard('💘','Try Relationship',canPartner?'Ask them out':G.rels.partner?'You already have a partner':'Need 45+ bond',`Relations.loverAction('${l.id}','partner')`,!canPartner,canPartner?'':'Not ready',false,true)}
      </div>`;
    });
    return h;
  },

  _renderHistory(G){
    const rows=(G.relationHistory||[]).slice(0,6);
    if(!rows.length)return'';

    let h='<details class="history-toggle"><summary>🧾 Relationship History</summary><div class="history-toggle-body">';
    rows.forEach(row=>{
      const ico=row.type==='child'?'👶':row.type==='ex'?'💔':row.type==='friend'?'🤝':row.type==='family'?'👪':'💞';
      h+=`<div class="row-card">
        <span class="ri">${ico}</span>
        <div class="rd">
          <div class="rt">Age ${row.age} · ${this._esc(row.label)}</div>
          <div class="rs">${this._esc(row.meta||row.type)}</div>
        </div>
      </div>`;
    });
    return h+'</div></details>';
  },

  pa(act){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const p=this._ensurePartnerDefaults(G.rels.partner);
    if(!p&&act!=='divorce')return;

    const key=this._partnerActionKey(act);
    if(!this._canUseAction(key))return;

    switch(act){
      case'date':{
        const cost=sc(120);
        if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
        this._markAction(key);
        G.money-=cost;
        p.dates++;
        p.love=cl(p.love+r(6,10)+Math.round((p.chemistry||50)/20));
        p.intimacy=cl((p.intimacy||20)+r(1,4));
        G.happiness=cl(G.happiness+r(7,13));
        G.stress=cl((G.stress||0)-r(4,8));
        Engine.log(`🌹 You went on a date with ${p.name}.`,'love');
        if(p.stage==='talking'&&(p.dates>=2||p.love>=48))this._setStage(p,'dating',`💘 You and ${p.name} made things official and started dating.`);
        break;
      }

      case'gift':{
        const cost=sc(200);
        if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
        this._markAction(key);
        G.money-=cost;
        p.love=cl(p.love+r(8,14));
        G.happiness=cl(G.happiness+r(2,5));
        Engine.log(`🎁 You surprised ${p.name} with a thoughtful gift.`,'love');
        break;
      }

      case'flirt':
        this._markAction(key);
        p.love=cl(p.love+r(4,8));
        p.intimacy=cl((p.intimacy||20)+r(3,7));
        Engine.log(`😘 Flirting with ${p.name} turned up the heat.`,'love');
        break;

      case'compliment':
        this._markAction(key);
        p.love=cl(p.love+r(3,7));
        G.happiness=cl(G.happiness+r(4,9));
        Engine.log(`🌟 Your compliment made ${p.name} glow.`,'love');
        break;

      case'weekend':{
        const cost=sc(600);
        if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
        this._markAction(key);
        G.money-=cost;
        p.love=cl(p.love+r(10,17));
        p.intimacy=cl((p.intimacy||20)+r(7,12));
        G.happiness=cl(G.happiness+r(12,18));
        G.stress=cl((G.stress||0)-r(10,16));
        Engine.log(`🏞️ You and ${p.name} escaped for a weekend away.`,'love');
        break;
      }

      case'trip':{
        const cost=sc(2000);
        if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
        this._markAction(key);
        G.money-=cost;
        p.love=cl(p.love+r(14,22));
        p.intimacy=cl((p.intimacy||20)+r(10,16));
        G.happiness=cl(G.happiness+r(18,26));
        G.stress=cl((G.stress||0)-r(14,20));
        Engine.log(`🏖️ Romantic holiday with ${p.name}.`,'love');
        break;
      }

      case'define':
        if(p.stage!=='talking'){UI.toast('You are already past the talking stage.');return;}
        if(p.love<40){UI.toast(`${p.name} needs more connection first.`);return;}
        this._markAction(key);
        this._setStage(p,'dating',`💘 You and ${p.name} officially started dating.`);
        G.happiness=cl(G.happiness+10);
        break;

      case'serious':
        if(p.stage!=='dating'){UI.toast('You need to be dating first.');return;}
        if(p.love<58||p.chemistry<45){UI.toast(`${p.name} is not ready for something serious.`);return;}
        this._markAction(key);
        this._setStage(p,'serious',`🏠 Things with ${p.name} got serious.`);
        p.intimacy=cl((p.intimacy||20)+8);
        G.happiness=cl(G.happiness+14);
        break;

      case'propose':
        if((G.age||0)<18){UI.toast('Engagement unlocks at age 18.');return;}
        if(p.stage!=='serious'){UI.toast('Build to the serious stage first.');return;}
        if(p.love<70||p.intimacy<45){UI.toast(`${p.name} does not feel ready yet.`);return;}
        this._markAction(key);
        this._setStage(p,'engaged',`💎 You proposed to ${p.name} and they said yes.`);
        G.happiness=cl(G.happiness+24);
        Engine.checkAch();
        break;

      case'marry':
        if((G.age||0)<18){UI.toast('Marriage unlocks at age 18.');return;}
        if(p.stage!=='engaged'){UI.toast('You need to be engaged first.');return;}
        this._markAction(key);
        this._setStage(p,'married',`💍 You married ${p.name}.`);
        p.yearsMarried=0;
        G.happiness=cl(G.happiness+28);
        Engine.checkAch();
        break;

      case'renew':
        if(p.stage!=='married'){UI.toast('You need to be married first.');return;}
        this._markAction(key);
        p.love=cl(p.love+r(12,20));
        G.happiness=cl(G.happiness+r(14,20));
        Engine.log(`💞 You and ${p.name} renewed your vows.`,'special');
        break;

      case'counselling':{
        const cost=sc(200);
        if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
        this._markAction(key);
        G.money-=cost;
        p.love=cl(p.love+r(8,15));
        p.intimacy=cl((p.intimacy||20)+r(4,8));
        G.happiness=cl(G.happiness+r(5,10));
        G.stress=cl((G.stress||0)-r(5,10));
        Engine.log(`🛋️ Couples therapy helped you reconnect with ${p.name}.`,'love');
        break;
      }

      case'intimate':
        if(G.age<18){UI.toast('This private action is not available at this age.');return;}
        if(p.love<28){UI.toast(`${p.name} is not in the mood right now.`);return;}
        this._markAction(key);
        const doPartnerIntimacy=(protectedSex=true, skipSti=false)=>{
          p.love=cl(p.love+r(5,10));
          p.intimacy=cl((p.intimacy||20)+r(8,14));
          G.happiness=cl(G.happiness+r(10,18));
          G.health=cl(G.health+r(1,3));
          this._recordEncounter(p,{protectedSex,skipSti,baseSti:0.01,pregnancyBoost:0.18,logText:`❤️ You and ${p.name} spent private time together.`,logType:'love',noProtectionSuffix:true});
          this._afterLoveAction();
        };
        if(this._stablePartnerNoHealthRisk(p)){
          doPartnerIntimacy(true,true);
        }else{
          this._chooseProtection(protectedSex=>doPartnerIntimacy(protectedSex,false),{partner:p,title:'Relationship Wellness Choice',text:`You and ${p.name} are close. Choose the safer approach for this moment.`});
        }
        return;

      case'massage':
        this._markAction(key);
        p.intimacy=cl((p.intimacy||20)+r(7,12));
        p.love=cl(p.love+r(4,9));
        G.happiness=cl(G.happiness+r(6,10));
        Engine.log(`💆 You gave ${p.name} a long relaxing massage.`,'love');
        break;

      case'sext':
        if(G.age<18){UI.toast('This private action is not available at this age.');return;}
        if(p.love<22){UI.toast(`${p.name} is not ready for that.`);return;}
        this._markAction(key);
        p.intimacy=cl((p.intimacy||20)+r(10,18));
        G.happiness=cl(G.happiness+r(7,13));
        Engine.log(`📱 You and ${p.name} shared an affectionate private message.`,'love');
        break;

      case'baby':
        if(G.age<18){UI.toast('This family action is not available at this age.');return;}
        if(!this._canPregnancyOccur(p)){this._offerFamilyAlternative(p);return;}
        this._markAction(key);
        p.love=cl(p.love+r(3,7));
        p.intimacy=cl((p.intimacy||20)+r(6,10));
        this._recordEncounter(p,{protectedSex:false,skipSti:true,baseSti:0,pregnancyBoost:1.8,forcedKeep:null,logText:`👶 You and ${p.name} planned for a baby.`,logType:'special',noProtectionSuffix:true});
        break;

      case'cheat':{
        if(G.age<18){UI.toast('Adults only.');return;}
        this._markAction(key);
        const affair=this._casualPartner('affair');
        this._chooseProtection(protectedSex=>{
          this._recordEncounter(affair,{protectedSex,baseSti:0.1,pregnancyBoost:0.9,forcedKeep:null,logText:`🤫 You cheated on ${p.name}.`,logType:'bad'});
          const caught=Math.random()<Math.max(0.25,0.55-((p.intimacy||40)/200));
          G.karma=cl((G.karma||0)-r(8,15),-100,100);
          if(caught){
            G.achievements=G.achievements||{};
            G.achievements.caught_cheating=true;
            Engine.log(`💥 ${p.name} found out about the affair.`,'bad');
            this._separate({cause:'cheating',forced:true});
            Engine.checkAch();
          }else{
            G.happiness=cl(G.happiness+r(2,7));
            Engine.log(`🤫 ${p.name} does not know about the affair... yet.`,'bad');
          }
          this._afterLoveAction({full:true});
        },{risky:true,title:'Risky Encounter',text:'Choose whether this affair uses protection.'});
        return;
      }

      case'divorce':
        this._markAction(key);
        this._separate({cause:p.stage==='married'?'divorce':'breakup',forced:false});
        break;
    }

    this._recordHistory(`Partner action: ${act}`,'partner',p?.name||'');
    const structuralPartnerAction=['date','define','serious','propose','marry','baby','divorce'].includes(act);
    const patchOnly=!structuralPartnerAction&&['gift','flirt','compliment','weekend','trip','renew','counselling','massage','sext'].includes(act);
    this._afterLoveAction({full:!patchOnly});
  },

  findPartner(source='real life'){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if(G.rels.partner){UI.toast('You already have a romantic interest.');return;}
    if((G.age||0)<18){UI.toast('Use Pursue Crush or First Date from the relationship screen.');return;}
    if(!this._canUseAction('find','You have already tried enough ways to meet someone this year. Age up to refresh.'))return;
    this._markAction('find');

    const gender=G.gender==='female'?'male':'female';
    const p=Engine.npc('partner',gender);
    p.age=Math.max(18,G.age+r(-5,5));
    p.love=r(28,44);
    p.chemistry=r(38,95);
    p.intimacy=r(8,22);
    p.stage='talking';
    p.dates=0;
    p.yearsTogether=0;
    p.married=false;
    p.engaged=false;
    p.yearsMarried=0;
    G.rels.partner=this._ensurePartnerDefaults(p);
    G.happiness=cl(G.happiness+10);
    this._recordHistory(`Met ${p.name}`,'partner',source);
    Engine.log(`💘 You met ${p.name} ${p.surname} through ${source}. Chemistry: ${p.chemistry}%.`,'love');
    this._afterLoveStructure({focus:'[data-rel-kind="partner"]'});
  },

  dateApp(){
    const G=window.G;if(!G)return;
    if((G.age||0)<18){UI.toast('Dating apps unlock at 18.');return;}
    if(!this._canUseAction('find','Dating app attempts are used up this year. Age up to refresh.'))return;

    const roll=Math.random();
    if(!G.rels.partner&&roll<0.48){this.findPartner('a dating app');return;}

    this._markAction('find');

    if(roll<0.78){
      const n=this._casualPartner('dating app match');
      G.happiness=cl(G.happiness+r(4,10));
      this._chooseProtection(protectedSex=>{
        this._recordEncounter(n,{protectedSex,baseSti:0.08,pregnancyBoost:0.8,forcedKeep:null,logText:`📲 Your app match with ${n.name} turned into a casual night.`,logType:G.rels.partner?'bad':'love'});
        this._applyCheatingConsequences(n,{physical:true,caughtChance:0.28});
        this._afterLoveStructure();
      },{title:'Protection Choice',text:`Your date with ${n.name} is getting physical. Choose protection.`});
      return;
    }

    G.happiness=cl(G.happiness-6);
    Engine.log('📲 A run of awful dates made you want to delete every app.','bad');
    this._afterLoveStructure();
  },

  hookup(){
    const G=window.G;if(!G)return;
    if((G.age||0)<18){UI.toast('Adult encounters unlock at 18.');return;}
    if(!this._canUseAction('intimate'))return;
    this._markAction('intimate');

    const n=this._casualPartner('hookup');
    G.happiness=cl(G.happiness+r(8,14));
    this._chooseProtection(protectedSex=>{
      this._recordEncounter(n,{protectedSex,baseSti:0.11,pregnancyBoost:0.85,forcedKeep:null,logText:`🌙 You had a one-night stand with ${n.name}.`,logType:G.rels.partner?'bad':'love'});
      this._applyCheatingConsequences(n,{physical:true,caughtChance:0.30});
      this._afterLoveStructure();
    },{title:'Protection Choice',text:`Choose protection for your night with ${n.name}.`});
  },

  visitAdultClub(){
    const G=window.G;if(!G)return;
    if((G.age||0)<18){UI.toast('Adults only!');return;}
    if(!this._canUseAction('intimate'))return;

    const cost=sc(100);
    if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}

    this._markAction('intimate');
    G.money-=cost;
    const n=this._casualPartner('club encounter');
    G.happiness=cl(G.happiness+r(10,16));
    this._chooseProtection(protectedSex=>{
      this._recordEncounter(n,{protectedSex,baseSti:0.07,pregnancyBoost:0.6,forcedKeep:null,logText:`🎭 You had an adult night out with ${n.name}.`,logType:G.rels.partner?'bad':'love'});
      this._applyCheatingConsequences(n,{physical:true,caughtChance:0.24});
      this._afterLoveStructure();
    },{title:'Protection Choice',text:`Choose protection for this encounter with ${n.name}.`});
  },

  stdTest(){
    if(typeof Health!=='undefined'&&Health.sexualCheckup)Health.sexualCheckup();
  },

  teenCrush(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if((G.age||0)<16){UI.toast('Romance unlocks at age 16.');return;}
    if(G.rels.partner){UI.toast(`You already have ${this._partnerWord(G.rels.partner)}.`);return;}
    if(!this._canUseAction('teen','Teen romance actions are used up this year. Age up to refresh.'))return;

    this._markAction('teen');

    const gender=G.gender==='female'?'male':'female';
    const p=Engine.npc('partner',gender);
    p.age=Math.max(16,Math.min(18,G.age+r(-1,1)));
    p.love=r(22,38);
    p.chemistry=r(35,88);
    p.intimacy=r(4,12);
    p.stage='talking';
    p.dates=0;
    p.yearsTogether=0;
    p.married=false;
    p.engaged=false;
    p.yearsMarried=0;
    G.rels.partner=this._ensurePartnerDefaults(p);
    G.happiness=cl(G.happiness+r(8,14));
    this._recordHistory(`Teen crush: ${p.name}`,'partner','teen romance');
    Engine.log(`💘 You worked up the courage to approach your crush, ${p.name}. Now you're talking.`,'love');
    this._afterLoveStructure({focus:'[data-rel-kind="partner"]'});
  },

  teenDate(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if((G.age||0)<16){UI.toast('Romance unlocks at age 16.');return;}
    if(!this._canUseAction('teen','Teen romance actions are used up this year. Age up to refresh.'))return;

    this._markAction('teen');

    let p=this._ensurePartnerDefaults(G.rels.partner);
    if(!p){
      const gender=G.gender==='female'?'male':'female';
      p=Engine.npc('partner',gender);
      p.age=Math.max(16,Math.min(18,G.age+r(-1,1)));
      p.love=r(26,42);
      p.chemistry=r(40,90);
      p.intimacy=r(6,14);
      p.stage='talking';
      p.dates=0;
      p.yearsTogether=0;
      p.married=false;
      p.engaged=false;
      p.yearsMarried=0;
      G.rels.partner=this._ensurePartnerDefaults(p);
    }

    p.dates++;
    p.love=cl((p.love||30)+r(8,14)+Math.round((p.chemistry||50)/24));
    p.intimacy=cl((p.intimacy||10)+r(2,5));
    G.happiness=cl(G.happiness+r(10,16));
    G.looks=cl(G.looks+r(1,3));
    G.stress=cl((G.stress||0)-r(2,5));

    if(p.stage==='talking'&&(p.dates>=1||p.love>=40)){
      this._setStage(p,'dating',`💞 After that first date, you and ${p.name} started dating.`);
    }

    Engine.log(`🎬 Your first proper date with ${p.name} was awkward and sweet.`,'love');
    this._afterLoveStructure({focus:'[data-rel-kind="partner"]'});
  },

  makeFriend(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if((G.rels.friends||[]).length>=10){UI.toast('Social circle is full!');return;}
    if(!this._canUseAction('friend','Friend actions are used up this year. Age up to refresh.'))return;

    this._markAction('friend');

    const f=Engine.npc('friend',Math.random()>0.5?'female':'male');
    const minFriendAge=(G.age||18)>=18?18:16;
    f.age=Math.max(minFriendAge,(G.age||18)+r(-6,6));
    f.interactions=0;
    f.bestFriend=false;
    f.love=r(38,65);
    G.rels.friends.push(f);
    G.happiness=cl(G.happiness+r(5,10));
    this._recordHistory(`Met friend ${f.name}`,'friend','new friend');
    Engine.log(`🤝 You made a new friend: ${f.name} ${f.surname}.`,'good');
    this._afterLoveStructure({focus:`[data-rel-kind="friend"][data-npc-id="${this._cssEscape(f.id)}"]`});
  },

  hangFriend(id){
    this.friendAction(id,'hang');
  },

  friendAction(id,act){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const f=(G.rels.friends||[]).find(x=>x.id===id);
    if(!f)return;
    this._ensureFriendDefaults(f);
    if(!this._canUseAction('friend','Friend actions are used up this year. Age up to refresh.'))return;

    const cost=act==='gift'?sc(80):0;
    if(cost&&G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}

    this._markAction('friend');
    f.interactions++;
    if(cost)G.money-=cost;

    if(act==='hang'){
      f.love=cl(f.love+r(5,10));
      G.happiness=cl(G.happiness+r(6,12));
      G.stress=cl((G.stress||0)-r(3,7));
      Engine.log(`😄 You hung out with ${f.name}.`,'good');
    }else if(act==='talk'){
      f.love=cl(f.love+r(8,14));
      G.happiness=cl(G.happiness+r(4,8));
      G.stress=cl((G.stress||0)-r(5,10));
      Engine.log(`💬 You had a deep talk with ${f.name}.`,'good');
    }else if(act==='gift'){
      f.love=cl(f.love+r(7,12));
      G.happiness=cl(G.happiness+r(2,5));
      Engine.log(`🎁 You bought ${f.name} a small gift.`,'good');
    }

    this._maybeBestFriend(f);
    this._recordHistory(`Friend action: ${act}`,'friend',f.name);
    this._afterLoveAction();
  },

  askFriendOut(id){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const friends=G.rels.friends||[];
    const idx=friends.findIndex(x=>x.id===id);
    const f=friends[idx];
    if(!f)return;

    this._ensureFriendDefaults(f);
    if(!this._isRomanceCompatible(f,G)){UI.toast('Romance is only available between a man and a woman.','bad');return;}
    if(G.age<16||f.age<16){UI.toast('Romance unlocks at age 16.');return;}
    if(G.rels.partner){UI.toast('You need to be single first.');return;}
    if(this._friendBond(f)<45){UI.toast('Build the friendship more first.');return;}
    if(!this._canUseAction('friend','Friend actions are used up this year. Age up to refresh.'))return;

    this._markAction('friend');

    const hasPartner=!!G.rels.partner;
    const chance=Math.min(0.92,0.35+(this._friendBond(f)/120)+(f.bestFriend?0.12:0)+(G.looks||50)/500-(hasPartner?0.08:0));
    if(Math.random()>chance){
      f.love=cl(this._friendBond(f)-r(6,14));
      G.happiness=cl(G.happiness-r(4,9));
      Engine.log(hasPartner
        ?`💔 You tried to start something secret with ${f.name}, but they did not want to cross that line.`
        :`💔 You asked ${f.name} out, but they wanted to stay friends.`,'bad');
      this._afterLoveAction();
      return;
    }

    if(hasPartner){
      const lover=this._upsertLoverFromNpc(f,{
        affair:true,
        fromFriend:true,
        bond:cl(Math.max(this._friendBond(f)||45,45)),
        intimacy:cl(r(14,34)),
        chemistry:cl((f.chemistry||55)+r(4,14)),
        encounters:1,
      });
      friends.splice(idx,1);
      G.happiness=cl((G.happiness||50)+r(4,10));
      this._applyCheatingConsequences(lover,{physical:false,caughtChance:0.16});
      this._recordHistory(`${f.name} became a secret affair`,'lover','friend affair');
      Engine.log(`🤫 ${f.name} agreed to a risky secret romance. You now have an affair connection.`,'bad');
      this._afterLoveStructure({focus:`[data-rel-kind="lover"][data-npc-id="${this._cssEscape(lover.id)}"]`});
      return;
    }

    const p={
      ...f,
      role:'partner',
      stage:'talking',
      chemistry:cl(r(35,65)+Math.floor((f.love||50)/3)),
      intimacy:r(8,22),
      dates:0,
      yearsTogether:0,
      married:false,
      engaged:false,
      yearsMarried:0,
      fromFriend:true,
    };

    friends.splice(idx,1);
    G.rels.partner=this._ensurePartnerDefaults(p);
    this._removePartnerFromLovers(G);
    G.happiness=cl(G.happiness+12);
    this._recordHistory(`${f.name} became a partner`,'partner','friend to romance');
    Engine.log(`💘 ${f.name} said yes. Your friend is now your ${this._partnerWord(p)}.`,'love');
    this._afterLoveStructure({focus:'[data-rel-kind="partner"]'});
  },


  friendKiss(id){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const f=(G.rels.friends||[]).find(x=>x.id===id);
    if(!f)return;
    this._ensureFriendDefaults(f);
    if(!this._isRomanceCompatible(f,G)){UI.toast('Romantic friend actions are only available between a man and a woman.','bad');return;}
    if(G.age<16||f.age<16){UI.toast('Romance unlocks at age 16.');return;}
    if(this._friendBond(f)<70){UI.toast('Build the bond to 70+ first.');return;}
    if(!this._canUseAction('friend','Friend actions are used up this year. Age up to refresh.'))return;
    this._markAction('friend');

    const chance=Math.min(.88,.35+this._friendBond(f)/140+(G.looks||50)/600);
    if(Math.random()<chance){
      f.love=cl((f.love||0)+r(4,10));
      f.chemistry=cl((f.chemistry||50)+r(8,18));
      G.happiness=cl((G.happiness||50)+r(6,12));
      Engine.log(`😘 You kissed ${f.name}. The friendship has a new spark.`,'love');
      this._applyCheatingConsequences(f,{physical:false,caughtChance:0.12});
    }else{
      f.love=cl((f.love||0)-r(5,12));
      G.happiness=cl((G.happiness||50)-r(2,6));
      Engine.log(`💬 You tried to kiss ${f.name}, but the moment was not mutual.`,'bad');
    }
    this._recordHistory('Friend kiss','friend',f.name);
    this._afterLoveAction();
  },

  friendHookup(id){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const f=(G.rels.friends||[]).find(x=>x.id===id);
    if(!f)return;
    this._ensureFriendDefaults(f);
    if(!this._isRomanceCompatible(f,G)){UI.toast('Intimate friend actions are only available between a man and a woman.','bad');return;}
    if(G.age<18||f.age<18){UI.toast('Adults only.');return;}
    if(this._friendBond(f)<80){UI.toast('Need 80+ bond first.');return;}
    if(!this._canUseAction('intimate'))return;
    this._markAction('intimate');
    f.love=cl((f.love||0)+r(-4,8));
    f.chemistry=cl((f.chemistry||55)+r(4,12));
    G.happiness=cl((G.happiness||50)+r(8,16));
    this._chooseProtection(protectedSex=>{
      this._recordEncounter(f,{protectedSex,baseSti:0.07,pregnancyBoost:0.75,logText:`🔥 You and ${f.name} crossed the line from friendship into intimacy.`,logType:'love'});
      this._applyCheatingConsequences(f,{physical:true,caughtChance:0.26});
      this._recordHistory('Friend hookup','friend',f.name);
      this._afterLoveStructure();
    },{title:'Protection Choice',text:`Choose protection for this intimate moment with ${f.name}.`});
  },

  exAction(id,act){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const ex=(G.rels.exes||[]).find(x=>x.id===id);
    if(!ex||ex.alive===false)return;
    this._ensureExDefaults(ex);
    if(!this._canUseAction('ex','Ex actions are used up this year. Age up to refresh.'))return;

    const cost=act==='meet'?sc(90):0;
    if(cost&&G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}

    this._markAction('ex');
    if(cost)G.money-=cost;

    if(act==='checkin'){
      ex.score=cl((ex.score||0)+r(4,9));
      G.happiness=cl(G.happiness+r(2,5));
      Engine.log(`💬 You checked in with ${ex.name}.`,'neutral');
    }else if(act==='apology'){
      ex.score=cl((ex.score||0)+(ex.cause==='cheating'?r(8,16):r(5,10)));
      G.happiness=cl(G.happiness+r(1,4));
      Engine.log(`🙏 You and ${ex.name} talked honestly about what went wrong.`,'neutral');
    }else if(act==='meet'){
      ex.score=cl((ex.score||0)+(ex.chemistry>=65?r(6,12):r(2,8)));
      G.happiness=cl(G.happiness+r(4,8));
      Engine.log(`☕ You met ${ex.name} face to face.`,'love');
    }else if(act==='retry'){
      if(G.rels.partner){UI.toast('You need to be single first.');return;}
      if((ex.score||0)<42){UI.toast('The score is still too low.');return;}

      if(Math.random()<this._reconcileChance(ex)){
        const revived={
          ...ex,
          role:'partner',
          love:cl(Math.max(ex.score||45,ex.lastLove||35)+r(2,8)),
          stage:(ex.score||0)>=70?'dating':'talking',
          intimacy:cl(Math.max(ex.intimacy||18,18)),
          dates:0,
          engaged:false,
          married:false,
          yearsMarried:0,
        };
        G.rels.partner=this._ensurePartnerDefaults(revived);
        G.rels.exes=G.rels.exes.filter(x=>x.id!==id);
        G.happiness=cl(G.happiness+r(10,18));
        Engine.log(`💞 You and ${ex.name} found your way back to each other.`,'special');
      }else{
        ex.score=cl((ex.score||0)-r(3,8));
        G.happiness=cl(G.happiness-r(3,7));
        Engine.log(`💔 You tried again with ${ex.name}, but the old damage was too heavy.`,'bad');
      }
    }

    this._recordHistory(`Ex action: ${act}`,'ex',ex.name);
    this._afterLoveStructure();
  },

  loverAction(id,act){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const lovers=G.rels.lovers||[];
    const idx=lovers.findIndex(x=>x.id===id);
    const l=lovers[idx];
    if(!l)return;
    this._ensureLoverDefaults(l);
    if(!this._canUseAction('lover','You have used enough encounter follow-ups this year. Age up to refresh.'))return;

    const cost=act==='meet'?sc(90):0;
    if(cost&&G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
    if(act==='partner'&&G.rels.partner){UI.toast('You already have a partner.');return;}
    if(act==='partner'&&(l.bond||0)<45){UI.toast('Build more bond first.');return;}
    if(['hookup','partner'].includes(act)&&!this._isRomanceCompatible(l,G)){
      UI.toast('Romantic encounter follow-ups are only available between a man and a woman.','bad');
      return;
    }

    this._markAction('lover');
    if(cost)G.money-=cost;

    if(act==='text'){
      l.bond=cl((l.bond||0)+r(4,10));
      G.happiness=cl((G.happiness||50)+r(1,4));
      Engine.log(`💬 You texted ${l.name}. The connection warmed up.`,'neutral');
    }else if(act==='meet'){
      l.bond=cl((l.bond||0)+r(6,13));
      l.chemistry=cl((l.chemistry||50)+r(1,6));
      G.happiness=cl((G.happiness||50)+r(4,9));
      Engine.log(`☕ You met ${l.name} again. It felt less random this time.`,'love');
    }else if(act==='hookup'){
      l.encounters=(l.encounters||1)+1;
      l.bond=cl((l.bond||0)+r(1,8));
      l.intimacy=cl((l.intimacy||30)+r(8,16));
      G.happiness=cl((G.happiness||50)+r(6,13));
      this._chooseProtection(protectedSex=>{
        this._recordEncounter(l,{protectedSex,baseSti:0.08,pregnancyBoost:0.75,logText:`🔥 You hooked up with ${l.name} again.`,logType:'love',store:false});
        this._applyCheatingConsequences(l,{physical:true,caughtChance:0.24});
        this._afterLoveStructure();
      },{title:'Protection Choice',text:`Choose protection for this encounter with ${l.name}.`});
      this._recordHistory('Repeated encounter','lover',l.name);
      return;
    }else if(act==='partner'){
      const p={
        ...l,
        role:'partner',
        stage:'talking',
        love:cl(35+(l.bond||0)/2+r(0,10)),
        intimacy:cl(l.intimacy||25),
        dates:0,
        yearsTogether:0,
        married:false,
        engaged:false,
        yearsMarried:0,
        fromEncounter:true,
      };
      G.rels.partner=this._ensurePartnerDefaults(p);
      this._removePartnerFromLovers(G);
      G.happiness=cl((G.happiness||50)+12);
      Engine.log(`💘 ${l.name} agreed to see where this could go. You are now talking romantically.`,'love');
    }

    this._recordHistory(`Encounter follow-up: ${act}`,'lover',l.name);
    this._afterLoveStructure();
  },

  familyAction(id,act){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const all=[G.rels.father,G.rels.mother,...(G.rels.siblings||[])].filter(Boolean);
    const n=all.find(x=>x&&x.id===id);
    if(!n||!n.alive)return;
    if(!this._canUseAction('family','Family actions are used up this year. Age up to refresh.'))return;

    const cost=act==='dinner'?sc(80):act==='help'?sc(250):0;
    if(cost&&G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}

    this._markAction('family');
    if(cost)G.money-=cost;

    if(act==='time'){
      n.love=cl((n.love||50)+r(5,11));
      G.happiness=cl(G.happiness+r(5,10));
    }else if(act==='call'){
      n.love=cl((n.love||50)+r(2,6));
      G.happiness=cl(G.happiness+r(2,5));
    }else if(act==='dinner'){
      n.love=cl((n.love||50)+r(6,12));
      G.happiness=cl(G.happiness+r(7,12));
    }else if(act==='help'){
      n.love=cl((n.love||50)+r(8,15));
      G.karma=cl((G.karma||0)+r(1,4),-100,100);
    }

    this._recordHistory(`Family action: ${act}`,'family',n.name);
    Engine.log(`👪 You spent time with your ${n.role} ${n.name}.`,'good');
    this._afterLoveAction();
  },

  clickFamily(id){
    this.familyAction(id,'time');
  },

  childAction(id,act){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const c=(G.rels.children||[]).find(x=>x.id===id);
    if(!c)return;
    if(!this._canUseAction('child','Child actions are used up this year. Age up to refresh.'))return;

    const cost=act==='gift'?sc(120):0;
    if(cost&&G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}

    this._markAction('child');
    if(cost)G.money-=cost;

    if(act==='time'){
      c.love=cl((c.love||60)+r(8,14));
      c.school=cl((c.school||70)+r(2,6));
      c.wellbeing=cl((c.wellbeing||70)+r(4,8));
      G.happiness=cl(G.happiness+r(8,14));
      G.stress=cl((G.stress||0)-r(2,6));
      if(c.issue&&Math.random()<0.55){
        Engine.log(`👨‍👩‍👧 Time with ${c.name} helped them work through ${String(c.issue).toLowerCase()}.`,'good');
        c.issue='';
        c.issueSeverity=0;
      }else{
        Engine.log(`👶 Quality time with ${c.name} made you both feel closer.`,'good');
      }
    }else if(act==='school'){
      c.love=cl((c.love||60)+r(4,9));
      c.school=cl((c.school||70)+r(8,15));
      G.stress=cl((G.stress||0)+r(1,3));
      Engine.log(`📚 You helped ${c.name} with school.`,'good');
    }else if(act==='gift'){
      c.love=cl((c.love||60)+r(6,12));
      G.happiness=cl(G.happiness+r(4,8));
      Engine.log(`🎁 You bought ${c.name} something thoughtful.`,'good');
    }else if(act==='support'){
      c.love=cl((c.love||60)+r(5,11));
      c.wellbeing=cl((c.wellbeing||70)+r(8,15));
      G.stress=cl((G.stress||0)-r(2,6));
      if(c.issue&&Math.random()<0.7){
        Engine.log(`🛟 You helped ${c.name} through ${c.issue}.`,'good');
        c.issue='';
        c.issueSeverity=0;
      }else{
        Engine.log(`🛟 You showed up emotionally for ${c.name}.`,'good');
      }
    }

    this._recordHistory(`Child action: ${act}`,'child',c.name);
    this._afterLoveAction();
  },

  spendTimeWithChild(id){
    this.childAction(id,'time');
  },

  ageAll(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    this._resolvePregnancy();

    // Parents and children are aged by Family.tick. Keeping them out here prevents double-aging.
    const all=[...(G.rels.siblings||[]),G.rels.partner,...(G.rels.friends||[]),...(G.rels.exes||[]),...(G.rels.lovers||[])].filter(Boolean);

    all.forEach(n=>{
      if(!n||!n.alive)return;
      n.age++;

      if(n.alive&&n.role!=='child'&&Math.random()<0.004)this._die(n,'an accident');

      if(n.role==='partner')this._tickPartner(n);
      else if(n.role==='ex')this._tickEx(n);
      else if(n.role==='friend')this._tickFriend(n);
    });
  },

  _tickPartner(p){
    const G=window.G;
    this._ensurePartnerDefaults(p);

    if(p.love>18)p.love=cl(p.love-r(0,2));
    p.intimacy=cl((p.intimacy||20)-r(2,6));
    p.yearsTogether=(p.yearsTogether||0)+1;
    if(p.stage==='married')p.yearsMarried=(p.yearsMarried||0)+1;

    if((p.intimacy||0)<25&&Math.random()<0.30){
      G.happiness=cl(G.happiness-r(2,5));
      Engine.log(`💬 Intimacy with ${p.name} has faded from neglect.`,'bad');
    }

    if(p.love<18&&Math.random()<0.2){
      Engine.log(`💔 Things with ${p.name} collapsed after years of drifting apart.`,'bad');
      this._registerEx(p,{cause:'drifted',causeLabel:'Drifted apart'});
      G.rels.partner=null;
    }
  },

  _tickEx(ex){
    this._ensureExDefaults(ex);
    ex.yearsApart=(ex.yearsApart||0)+1;
    if((ex.score||0)<70&&Math.random()<0.18)ex.score=cl((ex.score||0)+1);
  },

  _tickFriend(f){
    this._ensureFriendDefaults(f);
    if(f.love>25)f.love=cl(f.love-r(0,2));
  },

  _tickChild(c){
    this._ensureChildDefaults(c);
    c.love=cl((c.love||60)-r(0,2));
    c.school=cl((c.school||70)+r(-5,3));
    c.wellbeing=cl((c.wellbeing||70)+r(-4,3));

    if(c.age>=18&&!c.independent&&Math.random()<0.55){
      c.independent=true;
      Engine.log(`🏠 ${c.name} moved out and started an independent life.`,'special');
    }

    if(Math.random()<this._childIssueChance(c))this._childIssue(c);
  },

  _childIssueChance(c){
    if(c.issue)return 0.01;
    if(c.age<6)return 0.03;
    if(c.age<12)return 0.05;
    if(c.age<18)return 0.09;
    return 0.06;
  },

  _childIssue(c){
    const G=window.G;
    const pool=c.age<12?[
      {issue:'an accident at school',happy:8,stress:10,money:sc(700)},
      {issue:'bullying',happy:7,stress:8,money:0},
      {issue:'trouble keeping up in class',happy:6,stress:7,money:0},
    ]:c.age<18?[
      {issue:'failing school',happy:10,stress:11,money:0},
      {issue:'drug use',happy:14,stress:16,money:sc(1200),health:3},
      {issue:'a bad accident',happy:12,stress:14,money:sc(2200),health:4},
      {issue:'a run-in with the police',happy:11,stress:13,money:sc(1500)},
    ]:[
      {issue:'money problems',happy:6,stress:7,money:sc(1000)},
      {issue:'relationship drama',happy:5,stress:6,money:0},
    ];

    const evt=pick(pool);
    if(!evt)return;

    c.issue=evt.issue;
    c.issueSeverity=evt.stress;
    G.happiness=cl(G.happiness-evt.happy);
    G.stress=cl((G.stress||0)+evt.stress);
    if(evt.health)G.health=cl(G.health-evt.health);
    if(evt.money)G.money=Math.max(0,(G.money||0)-evt.money);

    Engine.log(`👶 ${c.name} is dealing with ${evt.issue}. It hit you hard as a parent.`,'bad');
  },

  _maybeBestFriend(f){
    if(!f||f.bestFriend)return;
    if((f.love||0)>=85&&(f.interactions||0)>=4){
      f.bestFriend=true;
      window.G.happiness=cl(window.G.happiness+10);
      Engine.log(`⭐ ${f.name} became your best friend.`,'special');
    }
  },

  _romanceLabelFor(f){
    return f?.gender==='female'?'Make Girlfriend':'Make Boyfriend';
  },

  _partnerWord(p){
    if(!p)return'partner';
    if(p.stage==='married')return p.gender==='female'?'wife':'husband';
    return p.gender==='female'?'girlfriend':'boyfriend';
  },

  _setStage(p,stage,msg){
    p.stage=stage;
    p.married=stage==='married';
    p.engaged=stage==='engaged';
    if(msg)Engine.log(msg,stage==='married'||stage==='engaged'?'special':'love');
    this._recordHistory(`Stage changed to ${stage}`,'partner',p?.name||'');
  },

  _reconcileChance(ex){
    this._ensureExDefaults(ex);
    let chance=0.14+((ex.score||0)/120)+((ex.chemistry||50)/300);
    if(ex.cause==='cheating')chance-=0.16;
    if((ex.yearsApart||0)>=4)chance-=0.06;
    return Math.max(0.08,Math.min(0.82,chance));
  },

  _offerFamilyAlternative(partner){
    if(typeof UI==='undefined'||!UI.askChoice){
      this._adoptChild(partner);
      return;
    }

    const choices=[
      {value:'adopt',label:'Adopt a Child',sub:`Build a family without pregnancy (${fmt(sc(4000))}).`},
    ];

    if(this._canUseFertilityHelp(partner)){
      choices.unshift({value:'fertility',label:'Fertility Help',sub:`Clinic / surrogate route (${fmt(sc(9000))}).`});
    }

    choices.push({value:'cancel',label:'Maybe Later',sub:'Wait and think about it.',danger:true});

    UI.askChoice({
      icon:'👶',
      title:'Family Options',
      text:`A natural pregnancy is not likely with ${partner?.name||'your partner'} because of age or biology.`,
      choices,
    },choice=>{
      if(choice==='adopt')this._adoptChild(partner);
      else if(choice==='fertility')this._fertilityTreatment(partner);
    });
  },

  _canUseFertilityHelp(partner){
    const G=window.G;
    if(!partner)return false;
    if(G.age<18||(partner.age||0)<18)return false;
    return G.age<=60&&(partner.age||0)<=60;
  },

  _fertilityTreatment(partner){
    const G=window.G;
    const cost=sc(9000);
    if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}

    G.money-=cost;
    G.stress=cl((G.stress||0)+r(4,8));
    G.happiness=cl(G.happiness+r(2,6));

    const ageDrag=Math.max(0,G.age-42)+Math.max(0,(partner?.age||G.age)-42);
    const chance=Math.max(0.18,Math.min(0.74,0.62-(ageDrag*0.02)));

    if(Math.random()<chance){
      const finish=keep=>{
        if(!this._canStartPregnancyWith(partner,G)){
          UI.toast(this._pregnancyBlockReason(partner,G),'neutral');
          return;
        }
        this._addPregnancyRecord({partnerId:partner?.id||null,partnerName:partner?.name||'someone',dueAge:G.age+1,keep,assisted:true,source:'fertility'},G);
        this._recordHistory('Fertility treatment worked','child',partner?.name||'');
        Engine.log(`🧬 Fertility treatment worked with ${partner?.name||'your partner'}. A pregnancy is underway.`,'special');
        this._afterLoveStructure();
      };

      if(typeof UI==='undefined'||!UI.askChoice){finish(true);return;}

      UI.askChoice({
        icon:'🧬',
        title:'Treatment Success',
        text:`The clinic route worked with ${partner?.name||'your partner'}.`,
        choices:[
          {value:true,label:'Raise the Child',sub:'Go ahead and build the family.'},
          {value:false,label:'Plan Adoption',sub:'Continue the pregnancy but place the baby for adoption.',danger:true},
        ],
      },finish);
      return;
    }

    Engine.log(`🧬 Fertility treatment with ${partner?.name||'your partner'} did not work this time.`,'bad');
    this._afterLoveStructure();
  },

  _adoptChild(partner){
    const G=window.G;
    const cost=sc(4000);
    if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}

    G.money-=cost;
    const child=this._createChild({adopted:true,age:r(0,3)});
    G.rels.children.push(child);
    G.happiness=cl(G.happiness+16);
    G.stress=cl((G.stress||0)+5);
    this._recordHistory(`Adopted child: ${child.name}`,'child',partner?.name||'');
    Engine.log(`👶 You adopted ${child.name}${partner?.name?` with ${partner.name}`:''}. Family can happen in more than one way.`,'special');
    Engine.checkAch();
    this._afterLoveStructure();
  },

  _upsertLoverFromNpc(n,extra={}){
    const G=window.G;if(!G||!n)return null;
    if(!G.rels)G.rels={};
    if(!Array.isArray(G.rels.lovers))G.rels.lovers=[];
    let existing=G.rels.lovers.find(l=>this._samePerson(l,n));
    if(existing){
      Object.assign(existing,extra);
      existing.bond=cl(Number.isFinite(existing.bond)?existing.bond:(n.love||45));
      existing.intimacy=cl(Number.isFinite(existing.intimacy)?existing.intimacy:r(18,38));
      existing.chemistry=cl(Number.isFinite(existing.chemistry)?existing.chemistry:(n.chemistry||r(45,85)));
      existing.encounters=Number.isFinite(existing.encounters)?existing.encounters:1;
      existing.lastAge=G.age||0;
      return this._ensureLoverDefaults(existing);
    }
    const lover=this._ensureLoverDefaults({
      ...n,
      role:'lover',
      bond:cl(extra.bond??n.love??r(35,65)),
      intimacy:cl(extra.intimacy??r(18,42)),
      chemistry:cl(extra.chemistry??n.chemistry??r(45,88)),
      encounters:extra.encounters??1,
      lastAge:G.age||0,
      ...extra,
    });
    G.rels.lovers.unshift(lover);
    if(G.rels.lovers.length>10)G.rels.lovers.length=10;
    return lover;
  },

  _applyCheatingConsequences(target,opts={}){
    const G=window.G;
    const p=G?.rels?.partner;
    if(!G||!p||!target||this._samePerson(p,target))return false;
    this._ensurePartnerDefaults(p);
    const physical=!!opts.physical;
    p.outsideExposure=true;
    p.love=cl((p.love||50)-r(physical?4:2,physical?11:6));
    G.stress=cl((G.stress||0)+r(physical?3:1,physical?9:5));
    G.karma=cl((G.karma||0)-r(physical?7:4,physical?15:9),-100,100);
    const caughtChance=Number.isFinite(opts.caughtChance)?opts.caughtChance:(physical?0.24:0.14);
    const caught=Math.random()<caughtChance;
    if(caught){
      p.love=cl((p.love||50)-r(8,18));
      Engine.log(`💥 ${p.name} noticed signs of your affair with ${target.name}. Trust dropped hard.`,'bad');
      if((p.love||0)<12&&Math.random()<0.35){
        Engine.log(`💔 ${p.name} is close to leaving because of the betrayal.`,'bad');
      }
    }else if(opts.log!==false){
      Engine.log(`🤫 You kept things hidden, but the affair added stress and risk.`,'bad');
    }
    return caught;
  },

  _isCurrentPartner(partner){
    const G=window.G;
    return this._samePerson(partner,G?.rels?.partner);
  },

  _samePerson(a,b){
    if(!a||!b)return false;
    if(a.id&&b.id&&a.id===b.id)return true;
    const an=String(a.name||'').trim().toLowerCase();
    const as=String(a.surname||'').trim().toLowerCase();
    const bn=String(b.name||'').trim().toLowerCase();
    const bs=String(b.surname||'').trim().toLowerCase();
    return !!(an&&bn&&an===bn&&as===bs&&a.gender===b.gender);
  },

  _removePartnerFromLovers(G=window.G){
    const partner=G?.rels?.partner;
    if(!partner||!Array.isArray(G.rels.lovers))return;
    G.rels.lovers=G.rels.lovers.filter(l=>!this._samePerson(l,partner));
  },

  _stablePartnerNoHealthRisk(partner){
    const G=window.G;
    if(!partner||!this._isCurrentPartner(partner))return false;
    const stage=partner.stage||(partner.married?'married':'dating');
    const committed=['serious','engaged','married'].includes(stage);
    const knownIssue=!!(G?.sexualHealth?.sti||G?.sexualHealth?.std||partner.sti||partner.outsideExposure);
    const trust=Number(partner.love||partner.trust||65);
    // A stable, monogamous partner should not randomly create STI events.
    // Health risk only appears if the game has a clear reason: known infection, outside exposure, low trust, or casual/non-committed context.
    return committed && !knownIssue && trust>=45;
  },

  _relationshipNeedsWellnessChoice(partner){
    if(!partner||!this._isCurrentPartner(partner))return true;
    return !this._stablePartnerNoHealthRisk(partner);
  },

  _stiRiskForEncounter(partner,opts={},protectedSex=true){
    if(opts.skipSti)return 0;
    const G=window.G;
    const sh=G.sexualHealth||{};
    const last=Number.isFinite(sh.lastCheckupAge)?sh.lastCheckupAge:null;
    const yearsSince=last===null?99:Math.max(0,(G.age||0)-last);

    let risk=0;
    if(this._isCurrentPartner(partner)){
      if(this._stablePartnerNoHealthRisk(partner))return 0;
      const stage=partner.stage||(partner.married?'married':'dating');
      const firstTime=(partner.sexualEncounters||0)===0;
      const committed=['serious','engaged','married'].includes(stage);
      risk=committed?0.0015:0.004;
      if(firstTime&&!committed)risk+=0.006;
      if(partner.sti)risk+=0.10;
      if(partner.outsideExposure)risk+=0.04;
      if((partner.love||60)<40)risk+=0.006;
      if(yearsSince>=4)risk+=0.004;
      risk=protectedSex?risk*0.25:risk*1.6;
    }else{
      const base=Math.min(0.055,Math.max(0.014,Number(opts.baseSti)||0.032));
      risk=base;
      risk+=Math.min(0.03,(sh.partners||0)*0.0025);
      if(yearsSince>=3)risk+=0.010;
      risk=protectedSex?risk*0.28:risk+0.055;
    }

    return Math.max(0,Math.min(0.16,risk));
  },

  _chooseProtection(cb,opts={}){
    if(typeof UI==='undefined'||!UI.askChoice){
      cb(true);
      return;
    }

    const partner=opts.partner||null;
    const protectedRisk=Math.round((this._stiRiskForEncounter(partner,opts,true)||0)*1000)/10;
    const unprotectedRisk=Math.round((this._stiRiskForEncounter(partner,opts,false)||0)*1000)/10;
    const riskText=(protectedRisk<=0&&unprotectedRisk<=0)
      ? 'No health-risk flag is active for this stable relationship.'
      : `Estimated health risk: safer option about ${protectedRisk}% · higher-risk option about ${unprotectedRisk}%.`;
    UI.askChoice({
      icon:opts.risky?'⚠️':'🛡️',
      title:opts.title||'Wellbeing Choice',
      text:(opts.text||'Choose the safer relationship approach.')+` ${riskText}`,
      choices:[
        {value:true,label:'Use Protection',sub:'Lower pregnancy risk and calmer long-term outcome.'},
        {value:false,label:'Do Not Use Protection',sub:'Higher pregnancy/health uncertainty. Best only with trust and recent checkups.',danger:true},
      ],
    },cb);
  },

  _casualPartner(role){
    const G=window.G;
    const gender=G.gender==='female'?'male':'female';
    const n=Engine.npc(role,gender);
    n.age=Math.max(18,G.age+r(-8,8));
    return n;
  },

  _recordEncounter(partner,opts={}){
    const G=window.G;
    if(!G.sexualHealth)G.sexualHealth={std:false,sti:false,partners:0,partnerIds:[],protectedEncounters:0,unprotectedEncounters:0,lastCheckupAge:null};

    const protectedSex=opts.protectedSex!==false;
    const sh=G.sexualHealth;

    if(!Array.isArray(sh.partnerIds))sh.partnerIds=[];
    if(partner?.id&&!sh.partnerIds.includes(partner.id)){
      sh.partnerIds.push(partner.id);
      sh.partners=(sh.partners||0)+1;
    }

    if(protectedSex)sh.protectedEncounters=(sh.protectedEncounters||0)+1;
    else sh.unprotectedEncounters=(sh.unprotectedEncounters||0)+1;

    const stiRisk=opts.skipSti?0:this._stiRiskForEncounter(partner,opts,protectedSex);
    if(stiRisk>0&&Math.random()<stiRisk){
      sh.sti=true;
      sh.std=true;
      G.health=cl(G.health-r(3,8));
      Engine.log('⚠️ A health concern appeared after a higher-risk encounter. A checkup is recommended.', 'bad');
    }

    if(this._isCurrentPartner(partner)){
      this._ensurePartnerDefaults(partner);
      partner.sexualEncounters=(partner.sexualEncounters||0)+1;
    }else if(partner&&opts.store!==false){
      if(!Array.isArray(G.rels.lovers))G.rels.lovers=[];
      const existing=G.rels.lovers.find(x=>(partner.id&&x.id===partner.id)||this._samePerson(x,partner));
      if(existing){
        existing.encounters=(existing.encounters||1)+1;
        existing.lastAge=G.age||0;
        existing.intimacy=cl((existing.intimacy||25)+r(5,12));
        existing.bond=cl((existing.bond||20)+r(1,7));
      }else{
        G.rels.lovers.unshift(this._ensureLoverDefaults({
          ...partner,
          bond:r(18,42),
          intimacy:r(30,65),
          chemistry:Number.isFinite(partner.chemistry)?partner.chemistry:r(45,90),
          encounters:1,
          lastAge:G.age||0,
        }));
        if(G.rels.lovers.length>8)G.rels.lovers.length=8;
      }
    }

    const pregChance=this._pregnancyChance(partner,protectedSex,opts.pregnancyBoost||1);
    if(pregChance>0&&this._canStartPregnancyWith(partner,G)&&Math.random()<pregChance){
      this._startPregnancy(partner,opts.forcedKeep,{source:opts.source||'encounter'});
    }

    if(opts.logText){
      const suffix=opts.noProtectionSuffix?'':(protectedSex?' Protection used.':' Higher-risk choice recorded.');
      Engine.log(`${opts.logText}${suffix}`,opts.logType||'love');
    }
  },

  _pregnancyChance(partner,protectedSex,boost){
    const G=window.G;
    if(!this._canPregnancyOccur(partner))return 0;

    let chance=0.22*(boost||1);
    if(protectedSex)chance*=0.18;

    const playerAge=G.age;
    const partnerAge=partner?.age||G.age;
    const playerGender=this._genderKey(G.gender);
    const partnerGender=this._genderKey(partner?.gender);
    const femaleAge=playerGender==='female'?playerAge:partnerGender==='female'?partnerAge:Math.min(playerAge,partnerAge);
    const maleAge=playerGender==='male'?playerAge:partnerGender==='male'?partnerAge:Math.max(playerAge,partnerAge);

    if(femaleAge>35)chance*=0.70;
    if(femaleAge>43)chance*=0.45;
    if(maleAge>55)chance*=0.82;
    if(maleAge>65)chance*=0.68;

    return chance;
  },

  _canPregnancyOccur(partner){
    const G=window.G;
    if(!partner)return false;
    if(!this._isRomanceCompatible(partner,G))return false;

    const playerGender=this._genderKey(G.gender);
    const partnerGender=this._genderKey(partner.gender);
    const playerAge=G.age||0;
    const partnerAge=partner.age||0;

    if(playerGender==='female'){
      if(playerAge<18||playerAge>50)return false;
      if(partnerAge<18||partnerAge>75)return false;
      return true;
    }

    if(playerGender==='male'){
      if(playerAge<18||playerAge>75)return false;
      if(partnerGender!=='female'||partnerAge<18||partnerAge>50)return false;
      return true;
    }

    return false;
  },

  _isRomanceCompatible(person,G=window.G){
    if(!G||!person)return false;
    const player=this._genderKey(G.gender);
    const other=this._genderKey(person.gender);
    return (player==='male'&&other==='female')||(player==='female'&&other==='male');
  },

  _genderKey(g){
    const v=String(g||'').trim().toLowerCase();
    if(['female','f','woman','girl','žena','zena'].includes(v))return'female';
    if(['male','m','man','boy','muž','muz'].includes(v))return'male';
    return v;
  },

  _startPregnancy(partner,forcedKeep,meta={}){
    const G=window.G;
    if(!G||!partner)return;

    const reason=this._pregnancyBlockReason(partner,G);
    if(reason){
      UI?.toast?.(reason,'neutral');
      return;
    }

    const finish=keep=>{
      const preg=this._addPregnancyRecord({
        partnerId:partner?.id||null,
        partnerName:partner?.name||'someone',
        partnerGender:partner?.gender||null,
        dueAge:(G.age||0)+1,
        keep,
        assisted:!!meta.assisted,
        twins:!!meta.twins,
        source:meta.source||'natural',
        startedAge:G.age||0,
      },G);
      G.happiness=cl(G.happiness+(keep?8:-4));
      G.stress=cl((G.stress||0)+(keep?8:12));
      this._recordHistory('Pregnancy started','child',preg.partnerName);
      const multiNote=this._activePregnancies(G).length>1?' Another child may be on the way too.':'';
      Engine.log(`🍼 Pregnancy started with ${preg.partnerName}. ${keep?'You plan to keep the baby.':'You plan for adoption.'}${multiNote}`,keep?'special':'bad');
      this._afterLoveStructure();
    };

    if(typeof forcedKeep==='boolean'){finish(forcedKeep);return;}
    if(typeof UI==='undefined'||!UI.askChoice){finish(true);return;}

    UI.askChoice({
      icon:'🍼',
      title:'Pregnancy Detected',
      text:`A pregnancy started with ${partner?.name||'someone'}. What do you want to do?`,
      choices:[
        {value:true,label:'Keep the Baby',sub:'Raise the child after birth.'},
        {value:false,label:'Plan Adoption',sub:'Place the baby for adoption after birth.',danger:true},
      ],
    },finish);
  },

  _resolvePregnancy(){
    const G=window.G;
    if(!G)return;
    const active=this._activePregnancies(G);
    if(!active.length)return;

    const due=active.filter(p=>(G.age||0)>=p.dueAge);
    if(!due.length){this._syncPregnancyState(G);return;}

    due.forEach(p=>{
      if(p.keep){
        const babies=p.twins?2:1;
        const names=[];
        for(let i=0;i<babies;i++){
          const child=this._createChild({parentId:p.partnerId,parentName:p.partnerName,source:p.source});
          G.rels.children.push(child);
          names.push(child.name);
        }
        G.happiness=cl(G.happiness+(p.twins?22:18));
        G.stress=cl((G.stress||0)+(p.twins?13:7));
        this._recordHistory(`${p.twins?'Twins born':'Child born'}: ${names.join(' & ')}`,'child',p.partnerName||'');
        Engine.log(p.twins?`👶👶 Twins were born with ${p.partnerName}: ${names.join(' and ')}.`:`👶 ${names[0]} was born with ${p.partnerName}. Your family just got bigger.`,'special');
        Engine.checkAch();
      }else{
        G.happiness=cl(G.happiness-6);
        G.stress=cl((G.stress||0)+6);
        this._recordHistory('Adoption after birth','child',p.partnerName||'');
        Engine.log(`👶 The baby with ${p.partnerName} was placed for adoption after birth. A complicated, emotional choice.`,'bad');
      }
      this._removePregnancyRecord(p.id,G);
    });

    this._syncPregnancyState(G);
  },

  _createChild(opts={}){
    const G=window.G;
    const cFem=Math.random()>0.5;
    const child=Engine.npc('child',cFem?'female':'male');
    child.age=Number.isFinite(opts.age)?opts.age:0;
    child.surname=G.surname;
    child.love=r(60,82);
    child.school=70;
    child.wellbeing=75;
    child.issue='';
    child.issueSeverity=0;
    child.independent=false;
    child.adopted=!!opts.adopted;
    child.otherParentId=opts.parentId||null;
    child.otherParentName=opts.parentName||'';
    child.birthSource=opts.source||'natural';
    return child;
  },

  _registerEx(p,opts={}){
    const G=window.G;
    if(!p)return;
    if(!G.rels.exes)G.rels.exes=[];

    const existing=G.rels.exes.find(x=>x.id===p.id);
    const base=p.love||40;
    const penalty=Number.isFinite(opts.scorePenalty)?opts.scorePenalty:(opts.cause==='cheating'?28:opts.cause==='divorce'?18:10);

    const exData={
      ...p,
      role:'ex',
      alive:p.alive!==false,
      married:false,
      engaged:false,
      stage:'single',
      yearsMarried:0,
      yearsApart:0,
      lastLove:base,
      score:cl(base-penalty,0,100),
      cause:opts.cause||'breakup',
      causeLabel:opts.causeLabel||(opts.cause==='cheating'?'Cheating fallout':opts.cause==='drifted'?'Drifted apart':opts.cause==='divorce'?'Divorce':'Breakup'),
    };

    if(existing)Object.assign(existing,exData);
    else G.rels.exes.unshift(exData);
    this._recordHistory(`Ex registered: ${p.name}`,'ex',exData.causeLabel);
  },

  _separate(opts={}){
    const G=window.G;
    const p=this._ensurePartnerDefaults(G.rels.partner);
    if(!p){UI.toast('No current partner.');return;}

    const married=p.stage==='married';
    const serious=married||p.stage==='engaged'||p.stage==='serious';
    const cause=opts.cause||'breakup';
    const share=married?0.35:serious?0.18:0.06;
    const cashLoss=Math.round((G.money||0)*share);

    if(cashLoss>0)G.money=Math.max(0,(G.money||0)-cashLoss);

    if(married){
      const childCount=(G.rels.children||[]).filter(c=>c.age<18).length;
      if(childCount>0){
        G.alimony=G.alimony||{amount:0,yearsLeft:0,recipient:''};
        G.alimony.amount=Math.max(G.alimony.amount||0,annualCost(900*childCount));
        G.alimony.yearsLeft=Math.max(G.alimony.yearsLeft||0,r(5,14));
        G.alimony.recipient=p.name;
      }
    }

    const label=married?'Divorce':cause==='cheating'?'Cheating fallout':'Breakup';
    this._registerEx(p,{cause:married?'divorce':cause,causeLabel:label});
    G.rels.partner=null;

    G.happiness=cl(G.happiness-(married?18:12));
    G.stress=cl((G.stress||0)+(married?16:10));

    if(cashLoss>0)Engine.log(`💔 ${label} from ${p.name}. Legal and life costs hit you for ${fmt(cashLoss)}.`,'bad');
    else Engine.log(`💔 You and ${p.name} separated.`,'bad');

    this._afterLoveStructure();
  },

  _die(n,cause='natural causes'){
    const G=window.G;
    if(!n||n.alive===false)return;
    n.alive=false;
    n.causeOfDeath=cause;
    n.love=cl(n.love||0);

    if(n.role==='partner'){
      G.rels.partner=null;
      this._registerEx(n,{cause:'death',causeLabel:'Passed away',scorePenalty:0});
      G.happiness=cl(G.happiness-r(16,28));
      G.stress=cl((G.stress||0)+r(10,18));
      Engine.log(`🕯️ ${n.name}, your partner, passed away from ${cause}.`,'bad');
      return;
    }

    if(n.role==='father'||n.role==='mother'){
      G.happiness=cl(G.happiness-r(10,20));
      G.stress=cl((G.stress||0)+r(5,12));
      Engine.log(`🕯️ Your ${n.role} ${n.name} passed away from ${cause}.`,'bad');
      return;
    }

    if(n.role==='friend'){
      G.happiness=cl(G.happiness-r(4,10));
      Engine.log(`🕯️ Your friend ${n.name} passed away from ${cause}.`,'bad');
      return;
    }

    Engine.log(`🕯️ ${n.name} passed away from ${cause}.`,'bad');
  },
};
