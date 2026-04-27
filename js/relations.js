/* js/relations.js — LifeSim v13 Reforged relationships, family, romance and children */
const Relations={
  STAGES:{
    talking:'Talking',
    dating:'Dating',
    serious:'Serious',
    engaged:'Engaged',
    married:'Married',
  },

  _esc(v){
    if(typeof escHTML==='function')return escHTML(v);
    return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  _ensureState(G=window.G){
    if(!G)return;
    if(!G.rels)G.rels={father:null,mother:null,siblings:[],partner:null,children:[],friends:[],exes:[]};
    G.rels.siblings=Array.isArray(G.rels.siblings)?G.rels.siblings:[];
    G.rels.children=Array.isArray(G.rels.children)?G.rels.children:[];
    G.rels.friends=Array.isArray(G.rels.friends)?G.rels.friends:[];
    G.rels.exes=Array.isArray(G.rels.exes)?G.rels.exes:[];
    if(!('partner' in G.rels))G.rels.partner=null;
    if(!G.sexualHealth)G.sexualHealth={std:false,sti:false,partners:0,partnerIds:[],protectedEncounters:0,unprotectedEncounters:0,lastCheckupAge:null};
    if(!Array.isArray(G.sexualHealth.partnerIds))G.sexualHealth.partnerIds=[];
    G.sexualHealth.partners=Number.isFinite(G.sexualHealth.partners)?G.sexualHealth.partners:0;
    G.sexualHealth.protectedEncounters=Number.isFinite(G.sexualHealth.protectedEncounters)?G.sexualHealth.protectedEncounters:0;
    G.sexualHealth.unprotectedEncounters=Number.isFinite(G.sexualHealth.unprotectedEncounters)?G.sexualHealth.unprotectedEncounters:0;
    G.sexualHealth.sti=!!(G.sexualHealth.sti||G.sexualHealth.std);
    G.sexualHealth.std=G.sexualHealth.sti;

    [G.rels.father,G.rels.mother,...G.rels.siblings].filter(Boolean).forEach(n=>this._ensureNpc(n));
    if(G.rels.partner)this._ensurePartnerDefaults(G.rels.partner);
    G.rels.children.forEach(c=>this._ensureChildDefaults(c));
    G.rels.friends.forEach(f=>this._ensureFriendDefaults(f));
    G.rels.exes.forEach(ex=>this._ensureExDefaults(ex));
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

  _relationColor(v){
    if(v>=75)return'var(--pink)';
    if(v>=50)return'var(--cyan)';
    if(v>=30)return'var(--yellow)';
    return'var(--red)';
  },

  _chemColor(v){
    if(v>=75)return'var(--green)';
    if(v>=45)return'var(--cyan)';
    return'var(--orange)';
  },

  render(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const el=document.getElementById('tab-love');if(!el)return;

    let h='';
    h+=this._renderFamily(G);
    h+=this._renderRomance(G);
    h+=this._renderExes(G);
    h+=this._renderChildren(G);
    h+=this._renderFriends(G);

    el.innerHTML=h;
  },

  _renderFamily(G){
    const fam=[G.rels.father,G.rels.mother,...(G.rels.siblings||[])].filter(Boolean);
    let h='<div class="sec">Family</div>';

    if(!fam.length){
      return h+`<div class="empty"><span class="ei">👪</span><p>No family information available.</p></div>`;
    }

    fam.forEach(n=>{
      const ico=n.role==='father'?'👨':n.role==='mother'?'👩':n.gender==='female'?'👧':'👦';
      const lc=this._relationColor(n.love||0);
      h+=`<div class="rel-card" onclick="Relations.clickFamily('${n.id}')">
        <div class="rel-av">${ico}</div>
        <div class="rel-inf">
          <div class="rel-name">${this._esc(n.name)} ${this._esc(n.surname)}${!n.alive?' 🪦':''}</div>
          <div class="rel-role">${this._esc(cap(n.role))} · Age ${n.age}${!n.alive?' <span class="badge badge-r">Deceased</span>':''}</div>
          ${n.alive?`<div class="rel-bar"><div class="rel-fill" style="width:${cl(n.love||0)}%;background:${lc}"></div></div>`:''}
        </div>
        ${n.alive?`<div style="font-size:11px;font-weight:800;color:${lc}">${cl(n.love||0)}%</div>`:''}
      </div>`;

      if(n.alive){
        h+=`<div class="act-grid" style="margin:-2px 0 10px 0">
          <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.familyAction('${n.id}','time')"><span class="ci" style="font-size:20px">😊</span><span class="cn">${this._esc(n.name)}: Time</span><span class="cd">+Bond +Hap</span></div>
          <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.familyAction('${n.id}','call')"><span class="ci" style="font-size:20px">📞</span><span class="cn">Call</span><span class="cd">Small bond boost</span></div>
          <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.familyAction('${n.id}','dinner')"><span class="ci" style="font-size:20px">🍽️</span><span class="cn">Dinner</span><span class="cd">${fmt(sc(80))}</span></div>
          <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.familyAction('${n.id}','help')"><span class="ci" style="font-size:20px">🤝</span><span class="cn">Help Out</span><span class="cd">${fmt(sc(250))}</span></div>
        </div>`;
      }
    });

    return h;
  },

  _renderRomance(G){
    let h='<div class="sec">Romance & Intimacy</div>';

    if(G.rels.partner){
      const p=this._ensurePartnerDefaults(G.rels.partner);
      const loveCol=this._relationColor(p.love||0);
      const chemCol=this._chemColor(p.chemistry||0);
      const intCol=this._relationColor(p.intimacy||0);
      const stage=this.STAGES[p.stage]||cap(p.stage||'dating');

      h+=`<div class="partner-card">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div class="rel-av" style="width:52px;height:52px;font-size:26px">${p.gender==='female'?'👩':'👨'}</div>
          <div style="flex:1">
            <div style="font-size:17px;font-weight:900">${this._esc(p.name)} ${this._esc(p.surname)}${p.stage==='married'?' 💍':p.stage==='engaged'?' 💎':''}</div>
            <div style="font-size:12px;color:var(--muted);font-weight:600;margin-top:2px">${stage} · Age ${p.age} · ${p.yearsTogether||0} year${(p.yearsTogether||0)!==1?'s':''} together</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
          ${this._statBar('Love',p.love,loveCol)}
          ${this._statBar('Chemistry',p.chemistry,chemCol)}
          ${this._statBar('Intimacy',p.intimacy||0,intCol)}
        </div>
      </div>`;

      if(G.pregnancy){
        h+=`<div class="info-box" style="border-color:rgba(236,72,153,.35)"><p>🍼 Pregnancy: ${G.pregnancy.keep?'Keeping the baby':'Planning adoption'} · due next year with ${this._esc(G.pregnancy.partnerName)}.</p></div>`;
      }

      h+=`<div class="sec">Dating Actions</div>
      <div class="act-grid">
        <div class="card" onclick="Relations.pa('date')"><span class="ci">🌹</span><span class="cn">Go on Date</span><span class="cd">+Love +Hap</span></div>
        <div class="card" onclick="Relations.pa('gift')"><span class="ci">🎁</span><span class="cn">Give Gift</span><span class="cd">+Love (${fmt(sc(200))})</span></div>
        <div class="card" onclick="Relations.pa('flirt')"><span class="ci">😘</span><span class="cn">Flirt</span><span class="cd">+Love +Intimacy</span></div>
        <div class="card" onclick="Relations.pa('compliment')"><span class="ci">🌟</span><span class="cn">Compliment</span><span class="cd">+Love</span></div>
      </div>`;

      h+=`<div class="act-grid" style="margin-top:8px">
        <div class="card" onclick="Relations.pa('weekend')"><span class="ci">🏞️</span><span class="cn">Weekend Away</span><span class="cd">+Love (${fmt(sc(600))})</span></div>
        <div class="card" onclick="Relations.pa('trip')"><span class="ci">🏖️</span><span class="cn">Romantic Holiday</span><span class="cd">+Love +Intimacy (${fmt(sc(2000))})</span></div>
        ${p.stage==='talking'?`<div class="card special" onclick="Relations.pa('define')"><span class="ci">💘</span><span class="cn">Start Dating</span><span class="cd">Move past talking</span></div>`:''}
        ${p.stage==='dating'?`<div class="card special" onclick="Relations.pa('serious')"><span class="ci">🏠</span><span class="cn">Get Serious</span><span class="cd">Exclusive + cohabit</span></div>`:''}
        ${p.stage==='serious'?`<div class="card special" onclick="Relations.pa('propose')"><span class="ci">💎</span><span class="cn">Propose</span><span class="cd">Become engaged</span></div>`:''}
        ${p.stage==='engaged'?`<div class="card special" onclick="Relations.pa('marry')"><span class="ci">💍</span><span class="cn">Get Married</span><span class="cd">Make it official</span></div>`:''}
        ${p.stage==='married'?`<div class="card" onclick="Relations.pa('renew')"><span class="ci">💞</span><span class="cn">Renew Vows</span><span class="cd">+Love +Hap</span></div>`:''}
        ${p.love<35?`<div class="card danger" onclick="Relations.pa('counselling')"><span class="ci">🛋️</span><span class="cn">Couples Therapy</span><span class="cd">${fmt(sc(200))}</span></div>`:''}
      </div>`;

      if((G.age||0)>=18){
        h+=`<div class="sec">Adult Intimate Life</div>
        <div class="act-grid">
          <div class="card" onclick="Relations.pa('intimate')"><span class="ci">🔥</span><span class="cn">Be Intimate</span><span class="cd">Protection choice</span></div>
          <div class="card" onclick="Relations.pa('massage')"><span class="ci">💆</span><span class="cn">Give Massage</span><span class="cd">+Intimacy +Love</span></div>
          <div class="card" onclick="Relations.pa('sext')"><span class="ci">📱</span><span class="cn">Spicy Text</span><span class="cd">+Intimacy +Hap</span></div>
          <div class="card" onclick="Relations.pa('baby')"><span class="ci">👶</span><span class="cn">Try for Baby</span><span class="cd">Intentional family choice</span></div>
        </div>

        <div class="sec">Risky Actions</div>
        <div class="act-grid">
          <div class="card danger" onclick="Relations.pa('cheat')"><span class="ci">🤫</span><span class="cn">Cheat</span><span class="cd">Risk getting caught</span></div>
          <div class="card danger" onclick="Relations.pa('divorce')"><span class="ci">💔</span><span class="cn">${p.stage==='married'?'Divorce':'Break Up'}</span><span class="cd">End relationship</span></div>
        </div>`;
      }else{
        h+=`<div class="info-box"><p>💬 You are still young. Adult intimacy and family planning unlock at 18.</p></div>`;
      }

      return h;
    }

    if((G.age||0)>=18){
      h+=`<div class="info-box"><p>You are single. Meet someone, go on dates, or stay independent.</p></div>
      <div class="act-grid">
        <div class="card" onclick="Relations.findPartner()"><span class="ci">💘</span><span class="cn">Meet Someone</span><span class="cd">Start talking</span></div>
        <div class="card" onclick="Relations.dateApp()"><span class="ci">📲</span><span class="cn">Dating App</span><span class="cd">Match or casual date</span></div>
        <div class="card" onclick="Relations.hookup()"><span class="ci">🌙</span><span class="cn">One-Night Stand</span><span class="cd">Adult risky encounter</span></div>
        <div class="card" onclick="Relations.visitAdultClub()"><span class="ci">🎭</span><span class="cn">Adult Entertainment</span><span class="cd">${fmt(sc(100))}</span></div>
      </div>`;
    }else if((G.age||0)>=16){
      h+=`<div class="info-box"><p>Romance is starting to matter now. Adult relationships and intimacy unlock at 18.</p></div>
      <div class="act-grid">
        <div class="card" onclick="Relations.teenCrush()"><span class="ci">💘</span><span class="cn">Pursue Crush</span><span class="cd">Teen romance</span></div>
        <div class="card" onclick="Relations.teenDate()"><span class="ci">🎬</span><span class="cn">First Date</span><span class="cd">Cinema and coffee</span></div>
      </div>`;
    }else{
      h+=`<div class="empty"><span class="ei">🧒</span><p>Romance unlocks at age 16.</p></div>`;
    }

    return h;
  },

  _renderExes(G){
    const exes=(G.rels.exes||[]).filter(Boolean);
    if(!exes.length)return '';

    let h=`<div class="sec">Exes (${exes.length})</div>`;
    exes.forEach(ex=>{
      this._ensureExDefaults(ex);
      const scoreCol=this._relationColor(ex.score||0);
      const canRetry=!G.rels.partner&&ex.alive!==false&&(ex.score||0)>=42;
      const chance=canRetry?Math.round(this._reconcileChance(ex)*100):0;

      h+=`<div class="rel-card">
        <div class="rel-av">${ex.gender==='female'?'👩':'👨'}</div>
        <div class="rel-inf">
          <div class="rel-name">${this._esc(ex.name)} ${this._esc(ex.surname)}${ex.alive===false?' 🪦':''}</div>
          <div class="rel-role">Ex · ${this._esc(ex.causeLabel||'Past relationship')} · ${ex.yearsApart||0} year${(ex.yearsApart||0)!==1?'s':''} apart</div>
          <div class="rel-bar"><div class="rel-fill" style="width:${cl(ex.score||0)}%;background:${scoreCol}"></div></div>
        </div>
        <div style="font-size:11px;font-weight:800;color:${scoreCol}">${cl(ex.score||0)}%</div>
      </div>
      <div class="act-grid" style="margin:-2px 0 10px 0">
        <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.exAction('${ex.id}','checkin')"><span class="ci" style="font-size:20px">💬</span><span class="cn">Check In</span><span class="cd">Warm things up</span></div>
        <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.exAction('${ex.id}','apology')"><span class="ci" style="font-size:20px">🙏</span><span class="cn">Apologize</span><span class="cd">Repair damage</span></div>
        <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.exAction('${ex.id}','meet')"><span class="ci" style="font-size:20px">☕</span><span class="cn">Meet Up</span><span class="cd">${fmt(sc(90))}</span></div>
        <div class="card ${canRetry?'special':'locked'}" style="min-height:68px;padding:9px 8px" onclick="${canRetry?`Relations.exAction('${ex.id}','retry')`:''}"><span class="ci" style="font-size:20px">💞</span><span class="cn">Try Again</span><span class="cd">${canRetry?`${chance}% chance`:G.rels.partner?'Be single first':ex.alive===false?'Too late':'Need 42%+ score'}</span></div>
      </div>`;
    });

    return h;
  },

  _renderChildren(G){
    const kids=G.rels.children||[];
    if(!kids.length)return '';

    let h=`<div class="sec">Children (${kids.length})</div>`;
    kids.forEach(c=>{
      this._ensureChildDefaults(c);
      const issue=c.issue?` · <span style="color:${c.issueSeverity>=12?'var(--red)':'var(--orange)'}">${this._esc(c.issue)}</span>`:'';
      h+=`<div class="rel-card" onclick="Relations.spendTimeWithChild('${c.id}')">
        <div class="rel-av">${c.gender==='female'?'👧':'👦'}</div>
        <div class="rel-inf">
          <div class="rel-name">${this._esc(c.name)} ${this._esc(c.surname||G.surname)}</div>
          <div class="rel-role">Age ${c.age}${c.independent?' · Independent':''}${c.adopted?' · Adopted':''}${issue}</div>
          <div class="rel-bar"><div class="rel-fill" style="width:${cl(c.love||60)}%;background:var(--cyan)"></div></div>
        </div>
      </div>
      <div class="act-grid" style="margin:-2px 0 10px 0">
        <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.childAction('${c.id}','time')"><span class="ci" style="font-size:20px">👨‍👩‍👧</span><span class="cn">Spend Time</span><span class="cd">+Bond</span></div>
        <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.childAction('${c.id}','school')"><span class="ci" style="font-size:20px">📚</span><span class="cn">Help School</span><span class="cd">+School</span></div>
        <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.childAction('${c.id}','gift')"><span class="ci" style="font-size:20px">🎁</span><span class="cn">Buy Gift</span><span class="cd">${fmt(sc(120))}</span></div>
        <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.childAction('${c.id}','support')"><span class="ci" style="font-size:20px">🛟</span><span class="cn">Support</span><span class="cd">Help problems</span></div>
      </div>`;
    });

    return h;
  },

  _renderFriends(G){
    const friends=G.rels.friends||[];
    let h=`<div class="sec">Friends (${friends.length}/10)</div>`;

    friends.forEach(f=>{
      this._ensureFriendDefaults(f);
      const lc=f.love>84?'var(--yellow)':f.love>65?'var(--cyan)':'var(--muted)';
      const canAsk=G.age>=18&&!G.rels.partner&&f.age>=18&&f.gender!==G.gender;
      const askCd=G.rels.partner?'Already dating':f.gender===G.gender?'Not compatible':G.age<18||f.age<18?'Adults only':f.love<45?'Build bond first':'Ask them out';

      h+=`<div class="rel-card" onclick="Relations.hangFriend('${f.id}')">
        <div class="rel-av">${f.gender==='female'?'👩':'👨'}</div>
        <div class="rel-inf">
          <div class="rel-name">${this._esc(f.name)} ${this._esc(f.surname)}${f.bestFriend?' ⭐':''}</div>
          <div class="rel-role">Friend · ${cl(f.love)}% bond</div>
          <div class="rel-bar"><div class="rel-fill" style="width:${cl(f.love)}%;background:${lc}"></div></div>
        </div>
      </div>
      <div class="act-grid" style="margin:-2px 0 10px 0">
        <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.friendAction('${f.id}','hang')"><span class="ci" style="font-size:20px">😄</span><span class="cn">Hang Out</span><span class="cd">+Bond +Hap</span></div>
        <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.friendAction('${f.id}','talk')"><span class="ci" style="font-size:20px">💬</span><span class="cn">Deep Talk</span><span class="cd">Best friend path</span></div>
        <div class="card" style="min-height:68px;padding:9px 8px" onclick="Relations.friendAction('${f.id}','gift')"><span class="ci" style="font-size:20px">🎁</span><span class="cn">Gift</span><span class="cd">${fmt(sc(80))}</span></div>
        <div class="card ${canAsk&&f.love>=45?'special':'locked'}" style="min-height:68px;padding:9px 8px" onclick="${canAsk&&f.love>=45?`Relations.askFriendOut('${f.id}')`:''}"><span class="ci" style="font-size:20px">💘</span><span class="cn">${this._romanceLabelFor(f)}</span><span class="cd">${askCd}</span></div>
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

  _statBar(label,value,color){
    return `<div>
      <div class="sb-l" style="margin-bottom:3px">${label}</div>
      <div class="rel-bar"><div class="rel-fill" style="width:${cl(value)}%;background:${color}"></div></div>
      <div style="font-size:10px;font-weight:800;color:${color};margin-top:2px">${cl(value)}%</div>
    </div>`;
  },

  pa(act){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const p=this._ensurePartnerDefaults(G.rels.partner);
    if(!p&&act!=='divorce')return;

    switch(act){
      case'date':{
        const cost=sc(120);
        if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
        G.money-=cost;
        p.dates=(p.dates||0)+1;
        p.love=cl(p.love+r(6,10)+Math.round((p.chemistry||50)/20));
        p.intimacy=cl((p.intimacy||20)+r(1,4));
        G.happiness=cl(G.happiness+r(7,13));
        G.stress=cl((G.stress||0)-r(4,8));
        Engine.log(`🌹 You went on a date with ${p.name}.`, 'love');
        if(p.stage==='talking'&&(p.dates>=2||p.love>=48))this._setStage(p,'dating',`💘 You and ${p.name} made things official and started dating.`);
        break;
      }

      case'gift':{
        const cost=sc(200);
        if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
        G.money-=cost;
        p.love=cl(p.love+r(8,14));
        G.happiness=cl(G.happiness+r(2,5));
        Engine.log(`🎁 You surprised ${p.name} with a thoughtful gift.`, 'love');
        break;
      }

      case'flirt':
        p.love=cl(p.love+r(4,8));
        p.intimacy=cl((p.intimacy||20)+r(3,7));
        Engine.log(`😘 Flirting with ${p.name} turned up the heat.`, 'love');
        break;

      case'compliment':
        p.love=cl(p.love+r(3,7));
        G.happiness=cl(G.happiness+r(4,9));
        Engine.log(`🌟 Your compliment made ${p.name} glow.`, 'love');
        break;

      case'weekend':{
        const cost=sc(600);
        if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
        G.money-=cost;
        p.love=cl(p.love+r(10,17));
        p.intimacy=cl((p.intimacy||20)+r(7,12));
        G.happiness=cl(G.happiness+r(12,18));
        G.stress=cl((G.stress||0)-r(10,16));
        Engine.log(`🏞️ You and ${p.name} escaped for a weekend away.`, 'love');
        break;
      }

      case'trip':{
        const cost=sc(2000);
        if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
        G.money-=cost;
        p.love=cl(p.love+r(14,22));
        p.intimacy=cl((p.intimacy||20)+r(10,16));
        G.happiness=cl(G.happiness+r(18,26));
        G.stress=cl((G.stress||0)-r(14,20));
        Engine.log(`🏖️ Romantic holiday with ${p.name}.`, 'love');
        break;
      }

      case'define':
        if(p.stage!=='talking'){UI.toast('You are already past the talking stage.');return;}
        if(p.love<40){UI.toast(`${p.name} needs more connection first.`);return;}
        this._setStage(p,'dating',`💘 You and ${p.name} officially started dating.`);
        G.happiness=cl(G.happiness+10);
        break;

      case'serious':
        if(p.stage!=='dating'){UI.toast('You need to be dating first.');return;}
        if(p.love<58||p.chemistry<45){UI.toast(`${p.name} is not ready for something serious.`);return;}
        this._setStage(p,'serious',`🏠 Things with ${p.name} got serious. You are building a real life together.`);
        p.intimacy=cl((p.intimacy||20)+8);
        G.happiness=cl(G.happiness+14);
        break;

      case'propose':
        if(p.stage!=='serious'){UI.toast('Build to the serious stage first.');return;}
        if(p.love<70||p.intimacy<45){UI.toast(`${p.name} does not feel ready yet.`);return;}
        this._setStage(p,'engaged',`💎 You proposed to ${p.name} and they said yes.`);
        p.engaged=true;
        G.happiness=cl(G.happiness+24);
        Engine.checkAch();
        break;

      case'marry':
        if(p.stage!=='engaged'){UI.toast('You need to be engaged first.');return;}
        this._setStage(p,'married',`💍 You married ${p.name}.`);
        p.married=true;
        p.yearsMarried=0;
        p.engaged=false;
        G.happiness=cl(G.happiness+28);
        Engine.checkAch();
        break;

      case'renew':
        if(p.stage!=='married'){UI.toast('You need to be married first.');return;}
        p.love=cl(p.love+r(12,20));
        G.happiness=cl(G.happiness+r(14,20));
        Engine.log(`💞 You and ${p.name} renewed your vows.`, 'special');
        break;

      case'counselling':{
        const cost=sc(200);
        if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
        G.money-=cost;
        p.love=cl(p.love+r(8,15));
        p.intimacy=cl((p.intimacy||20)+r(4,8));
        G.happiness=cl(G.happiness+r(5,10));
        G.stress=cl((G.stress||0)-r(5,10));
        Engine.log(`🛋️ Couples therapy helped you reconnect with ${p.name}.`, 'love');
        break;
      }

      case'intimate':
        if(G.age<18){UI.toast('Adult intimacy unlocks at 18.');return;}
        if(p.love<28){UI.toast(`${p.name} is not in the mood right now.`);return;}
        this._chooseProtection(protectedSex=>{
          p.love=cl(p.love+r(5,10));
          p.intimacy=cl((p.intimacy||20)+r(8,14));
          G.happiness=cl(G.happiness+r(10,18));
          G.health=cl(G.health+r(1,3));
          this._recordEncounter(p,{protectedSex,baseSti:0.05,pregnancyBoost:1,logText:`🔥 You were intimate with ${p.name}.`,logType:'love'});
          UI.update();this.render();
        },{title:'Protection Choice',text:`Choose how careful you want to be with ${p.name}.`});
        return;

      case'massage':
        p.intimacy=cl((p.intimacy||20)+r(7,12));
        p.love=cl(p.love+r(4,9));
        G.happiness=cl(G.happiness+r(6,10));
        Engine.log(`💆 You gave ${p.name} a long relaxing massage.`, 'love');
        break;

      case'sext':
        if(G.age<18){UI.toast('Adult intimacy unlocks at 18.');return;}
        if(p.love<22){UI.toast(`${p.name} is not ready for that.`);return;}
        p.intimacy=cl((p.intimacy||20)+r(10,18));
        G.happiness=cl(G.happiness+r(7,13));
        Engine.log(`📱 Things got spicy over text with ${p.name}.`, 'love');
        break;

      case'baby':
        if(G.age<18){UI.toast('Family planning unlocks at 18.');return;}
        if(!this._canPregnancyOccur(p)){this._offerFamilyAlternative(p);return;}
        p.love=cl(p.love+r(3,7));
        p.intimacy=cl((p.intimacy||20)+r(6,10));
        this._recordEncounter(p,{protectedSex:false,baseSti:0.04,pregnancyBoost:1.8,forcedKeep:null,logText:`👶 You and ${p.name} tried for a baby.`,logType:'special'});
        break;

      case'cheat':{
        if(G.age<18){UI.toast('Adults only.');return;}
        const affair=this._casualPartner('affair');
        this._chooseProtection(protectedSex=>{
          this._recordEncounter(affair,{protectedSex,baseSti:0.1,pregnancyBoost:0.9,forcedKeep:null,logText:`🤫 You cheated on ${p.name}.`,logType:'bad'});
          const caught=Math.random()<Math.max(0.25,0.55-((p.intimacy||40)/200));
          G.karma=cl((G.karma||0)-r(8,15),-100,100);
          if(caught){
            G.achievements=G.achievements||{};
            G.achievements.caught_cheating=true;
            Engine.log(`💥 ${p.name} found out about the affair.`, 'bad');
            this._separate({cause:'cheating',forced:true});
            Engine.checkAch();
          }else{
            G.happiness=cl(G.happiness+r(2,7));
            Engine.log(`🤫 ${p.name} does not know about the affair... yet.`, 'bad');
          }
          UI.update();this.render();
        },{risky:true,title:'Risky Encounter',text:'Choose whether this affair uses protection.'});
        return;
      }

      case'divorce':
        this._separate({cause:p.stage==='married'?'divorce':'breakup',forced:false});
        break;
    }

    UI.update();
    this.render();
  },

  findPartner(source='real life'){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if(G.rels.partner){UI.toast('You already have a romantic interest.');return;}
    if((G.age||0)<18){UI.toast('Adult relationships unlock at 18. Use teen romance first.');return;}

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
    Engine.log(`💘 You met ${p.name} ${p.surname} through ${source}. Chemistry: ${p.chemistry}%.`, 'love');
    UI.update();this.render();
  },

  dateApp(){
    const G=window.G;if(!G)return;
    if((G.age||0)<18){UI.toast('Dating apps unlock at 18.');return;}
    if(G.rels.partner){UI.toast('Delete the app - you already have someone.');return;}

    const roll=Math.random();
    if(roll<0.48){
      this.findPartner('a dating app');
    }else if(roll<0.78){
      const n=this._casualPartner('dating app match');
      G.happiness=cl(G.happiness+r(4,10));
      this._chooseProtection(protectedSex=>{
        this._recordEncounter(n,{protectedSex,baseSti:0.08,pregnancyBoost:0.8,forcedKeep:null,logText:`📲 Your app match with ${n.name} turned into a casual night.`,logType:'love'});
        UI.update();this.render();
      },{title:'Protection Choice',text:`Your date with ${n.name} is getting physical. Choose protection.`});
      return;
    }else{
      G.happiness=cl(G.happiness-6);
      Engine.log('📲 A run of awful dates made you want to delete every app.', 'bad');
      UI.update();this.render();
    }
  },

  hookup(){
    const G=window.G;if(!G)return;
    if((G.age||0)<18){UI.toast('Adult encounters unlock at 18.');return;}
    const n=this._casualPartner('hookup');
    G.happiness=cl(G.happiness+r(8,14));
    this._chooseProtection(protectedSex=>{
      this._recordEncounter(n,{protectedSex,baseSti:0.11,pregnancyBoost:0.85,forcedKeep:null,logText:`🌙 You had a one-night stand with ${n.name}.`,logType:'love'});
      UI.update();this.render();
    },{title:'Protection Choice',text:`Choose protection for your night with ${n.name}.`});
  },

  visitAdultClub(){
    const G=window.G;if(!G)return;
    if((G.age||0)<18){UI.toast('Adults only!');return;}
    const cost=sc(100);
    if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
    G.money-=cost;
    const n=this._casualPartner('club encounter');
    G.happiness=cl(G.happiness+r(10,16));
    this._chooseProtection(protectedSex=>{
      this._recordEncounter(n,{protectedSex,baseSti:0.07,pregnancyBoost:0.6,forcedKeep:null,logText:`🎭 You had an adult night out with ${n.name}.`,logType:'love'});
      UI.update();this.render();
    },{title:'Protection Choice',text:`Choose protection for this encounter with ${n.name}.`});
  },

  stdTest(){
    if(typeof Health!=='undefined'&&Health.sexualCheckup)Health.sexualCheckup();
  },

  teenCrush(){
    const G=window.G;if(!G)return;
    if((G.age||0)<16){UI.toast('Romance unlocks at age 16.');return;}
    if(G.rels.partner){UI.toast(`You already have ${this._partnerWord(G.rels.partner)}.`);return;}

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
    Engine.log(`💘 You worked up the courage to approach your crush, ${p.name}. Now you're talking.`, 'love');
    UI.update();this.render();
  },

  teenDate(){
    const G=window.G;if(!G)return;
    if((G.age||0)<16){UI.toast('Romance unlocks at age 16.');return;}

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

    p.dates=(p.dates||0)+1;
    p.love=cl((p.love||30)+r(8,14)+Math.round((p.chemistry||50)/24));
    p.intimacy=cl((p.intimacy||10)+r(2,5));
    G.happiness=cl(G.happiness+r(10,16));
    G.looks=cl(G.looks+r(1,3));
    G.stress=cl((G.stress||0)-r(2,5));

    if(p.stage==='talking'&&((p.dates||0)>=1||p.love>=40)){
      this._setStage(p,'dating',`💞 After that first date, you and ${p.name} started dating.`);
    }

    Engine.log(`🎬 Your first proper date with ${p.name} was awkward and sweet.`, 'love');
    UI.update();this.render();
  },

  makeFriend(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if((G.rels.friends||[]).length>=10){UI.toast('Social circle is full!');return;}

    const f=Engine.npc('friend',Math.random()>0.5?'female':'male');
    f.age=Math.max(16,(G.age||18)+r(-6,6));
    f.interactions=0;
    f.bestFriend=false;
    f.love=r(38,65);
    G.rels.friends.push(f);
    G.happiness=cl(G.happiness+r(5,10));
    Engine.log(`🤝 You made a new friend: ${f.name} ${f.surname}.`, 'good');
    UI.update();this.render();
  },

  hangFriend(id){
    const G=window.G;if(!G)return;
    const f=(G.rels.friends||[]).find(x=>x.id===id);
    if(!f)return;
    f.love=cl(f.love+r(4,9));
    G.happiness=cl(G.happiness+r(6,12));
    G.stress=cl((G.stress||0)-r(3,7));
    Engine.log(`😄 Great time with ${f.name}.`, 'good');
    UI.update();this.render();
  },

  friendAction(id,act){
    const G=window.G;if(!G)return;
    const f=(G.rels.friends||[]).find(x=>x.id===id);
    if(!f)return;
    this._ensureFriendDefaults(f);
    f.interactions++;

    if(act==='hang'){
      f.love=cl(f.love+r(5,10));
      G.happiness=cl(G.happiness+r(6,12));
      G.stress=cl((G.stress||0)-r(3,7));
      Engine.log(`😄 You hung out with ${f.name}. Easy, fun, familiar.`, 'good');
    }else if(act==='talk'){
      f.love=cl(f.love+r(8,14));
      G.happiness=cl(G.happiness+r(4,8));
      G.stress=cl((G.stress||0)-r(5,10));
      Engine.log(`💬 You had a deep talk with ${f.name}. The friendship feels real.`, 'good');
    }else if(act==='gift'){
      const cost=sc(80);
      if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
      G.money-=cost;
      f.love=cl(f.love+r(7,12));
      G.happiness=cl(G.happiness+r(2,5));
      Engine.log(`🎁 You bought ${f.name} a small gift. They loved it.`, 'good');
    }

    this._maybeBestFriend(f);
    UI.update();this.render();
  },

  exAction(id,act){
    const G=window.G;if(!G)return;
    const ex=(G.rels.exes||[]).find(x=>x.id===id);
    if(!ex||ex.alive===false)return;
    this._ensureExDefaults(ex);

    if(act==='checkin'){
      ex.score=cl((ex.score||0)+r(4,9));
      G.happiness=cl(G.happiness+r(2,5));
      Engine.log(`💬 You checked in with ${ex.name}. Things felt a little less broken.`, 'neutral');
    }else if(act==='apology'){
      const bonus=ex.cause==='cheating'?r(8,16):r(5,10);
      ex.score=cl((ex.score||0)+bonus);
      G.happiness=cl(G.happiness+r(1,4));
      Engine.log(`🙏 You and ${ex.name} talked honestly about what went wrong.`, 'neutral');
    }else if(act==='meet'){
      const cost=sc(90);
      if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
      G.money-=cost;
      const swing=ex.chemistry>=65?r(6,12):r(2,8);
      ex.score=cl((ex.score||0)+swing);
      G.happiness=cl(G.happiness+r(4,8));
      Engine.log(`☕ You met ${ex.name} face to face. Old feelings were still there.`, 'love');
    }else if(act==='retry'){
      if(G.rels.partner){UI.toast('You need to be single first.');return;}
      if((ex.score||0)<42){UI.toast('The score is still too low. Rebuild the connection first.');return;}
      const chance=this._reconcileChance(ex);
      if(Math.random()<chance){
        const revived={...ex,role:'partner',love:cl(Math.max(ex.score||45,ex.lastLove||35)+r(2,8)),stage:(ex.score||0)>=70?'dating':'talking',intimacy:cl(Math.max(ex.intimacy||18,18)),dates:0,engaged:false,married:false,yearsMarried:0};
        G.rels.partner=this._ensurePartnerDefaults(revived);
        G.rels.exes=(G.rels.exes||[]).filter(x=>x.id!==id);
        G.happiness=cl(G.happiness+r(10,18));
        Engine.log(`💞 You and ${ex.name} found your way back to each other.`, 'special');
      }else{
        ex.score=cl((ex.score||0)-r(3,8));
        G.happiness=cl(G.happiness-r(3,7));
        Engine.log(`💔 You tried again with ${ex.name}, but the old damage was still too heavy.`, 'bad');
      }
    }

    UI.update();this.render();
  },

  askFriendOut(id){
    const G=window.G;if(!G)return;
    const friends=G.rels.friends||[];
    const idx=friends.findIndex(x=>x.id===id);
    const f=friends[idx];
    if(!f)return;

    this._ensureFriendDefaults(f);
    if(G.rels.partner){UI.toast('You already have a partner.');return;}
    if(G.age<18||f.age<18){UI.toast('Adults only.');return;}
    if(f.gender===G.gender){UI.toast('This friend is not romantically compatible in the current dating setup.');return;}
    if(f.love<45){UI.toast('Build the friendship more first.');return;}

    const chance=Math.min(0.9,0.35+(f.love/120)+(f.bestFriend?0.12:0)+(G.looks||50)/500);
    if(Math.random()>chance){
      f.love=cl(f.love-r(6,14));
      G.happiness=cl(G.happiness-r(4,9));
      Engine.log(`💔 You asked ${f.name} out, but they wanted to stay friends.`, 'bad');
      UI.update();this.render();
      return;
    }

    const p={...f,role:'partner'};
    p.stage='talking';
    p.chemistry=cl(r(35,65)+Math.floor((f.love||50)/3));
    p.intimacy=r(8,22);
    p.dates=0;
    p.yearsTogether=0;
    p.married=false;
    p.engaged=false;
    p.yearsMarried=0;
    p.fromFriend=true;

    friends.splice(idx,1);
    G.rels.partner=this._ensurePartnerDefaults(p);
    G.happiness=cl(G.happiness+12);
    Engine.log(`💘 ${f.name} said yes. Your friend is now your ${this._partnerWord(p)}.`, 'love');
    UI.update();this.render();
  },

  familyAction(id,act){
    const G=window.G;if(!G)return;
    const all=[G.rels.father,G.rels.mother,...(G.rels.siblings||[])].filter(Boolean);
    const n=all.find(x=>x&&x.id===id);
    if(!n||!n.alive)return;

    if(act==='time'){
      n.love=cl((n.love||50)+r(5,11));
      G.happiness=cl(G.happiness+r(5,10));
      Engine.log(`😊 You spent proper quality time with your ${n.role} ${n.name}.`, 'good');
    }else if(act==='call'){
      n.love=cl((n.love||50)+r(2,6));
      G.happiness=cl(G.happiness+r(2,5));
      Engine.log(`📞 You called your ${n.role} ${n.name}. It meant more than expected.`, 'good');
    }else if(act==='dinner'){
      const cost=sc(80);
      if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
      G.money-=cost;
      n.love=cl((n.love||50)+r(6,12));
      G.happiness=cl(G.happiness+r(7,12));
      Engine.log(`🍽️ Family dinner with ${n.name} brought everyone closer.`, 'good');
    }else if(act==='help'){
      const cost=sc(250);
      if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
      G.money-=cost;
      n.love=cl((n.love||50)+r(8,15));
      G.karma=cl((G.karma||0)+r(1,4),-100,100);
      Engine.log(`🤝 You helped your ${n.role} ${n.name} with real-life problems.`, 'good');
    }

    UI.update();this.render();
  },

  childAction(id,act){
    const G=window.G;if(!G)return;
    const c=(G.rels.children||[]).find(x=>x.id===id);
    if(!c)return;

    if(act==='time'){
      this.spendTimeWithChild(id);
      return;
    }

    if(act==='school'){
      c.love=cl((c.love||60)+r(4,9));
      c.school=cl((c.school||70)+r(8,15));
      G.stress=cl((G.stress||0)+r(1,3));
      Engine.log(`📚 You helped ${c.name} with school. Their confidence improved.`, 'good');
    }else if(act==='gift'){
      const cost=sc(120);
      if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
      G.money-=cost;
      c.love=cl((c.love||60)+r(6,12));
      G.happiness=cl(G.happiness+r(4,8));
      Engine.log(`🎁 You bought ${c.name} something thoughtful.`, 'good');
    }else if(act==='support'){
      c.love=cl((c.love||60)+r(5,11));
      c.wellbeing=cl((c.wellbeing||70)+r(8,15));
      G.stress=cl((G.stress||0)-r(2,6));
      if(c.issue&&Math.random()<0.7){
        Engine.log(`🛟 You helped ${c.name} through ${c.issue}.`, 'good');
        c.issue='';
        c.issueSeverity=0;
      }else{
        Engine.log(`🛟 You showed up emotionally for ${c.name}.`, 'good');
      }
    }

    UI.update();this.render();
  },

  clickFamily(id){
    const G=window.G;if(!G)return;
    const all=[G.rels.father,G.rels.mother,...(G.rels.siblings||[])].filter(Boolean);
    const n=all.find(x=>x&&x.id===id);
    if(!n||!n.alive)return;

    n.love=cl((n.love||50)+r(3,9));
    G.happiness=cl(G.happiness+r(4,9));
    Engine.log(`😊 Spent quality time with your ${n.role} ${n.name}.`, 'good');
    UI.update();this.render();
  },

  spendTimeWithChild(id){
    const G=window.G;if(!G)return;
    const c=(G.rels.children||[]).find(x=>x.id===id);
    if(!c)return;

    c.love=cl((c.love||60)+r(8,14));
    c.school=cl((c.school||70)+r(2,6));
    c.wellbeing=cl((c.wellbeing||70)+r(4,8));
    G.happiness=cl(G.happiness+r(8,14));
    G.stress=cl((G.stress||0)-r(2,6));

    if(c.issue&&Math.random()<0.55){
      Engine.log(`👨‍👩‍👧 Time with ${c.name} helped them work through ${String(c.issue).toLowerCase()}.`, 'good');
      c.issue='';
      c.issueSeverity=0;
    }else{
      Engine.log(`👶 Quality time with ${c.name} made you both feel closer.`, 'good');
    }

    UI.update();this.render();
  },

  ageAll(){
    const G=window.G;if(!G)return;
    this._ensureState(G);

    if(G.pregnancy&&G.age>=G.pregnancy.dueAge)this._resolvePregnancy();

    const all=[G.rels.father,G.rels.mother,...(G.rels.siblings||[]),G.rels.partner,...(G.rels.children||[]),...(G.rels.friends||[]),...(G.rels.exes||[])].filter(Boolean);

    all.forEach(n=>{
      if(!n||!n.alive)return;
      n.age++;

      if((n.role==='father'||n.role==='mother')&&n.age>r(68,97)&&Math.random()<0.18)this._die(n);
      if(n.alive&&n.role!=='child'&&Math.random()<0.004)this._die(n,'an accident');

      if(n.role==='partner'){
        this._tickPartner(n);
      }else if(n.role==='ex'){
        this._tickEx(n);
      }else if(n.role==='child'){
        this._tickChild(n);
      }else if(n.role==='friend'){
        this._tickFriend(n);
      }
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
      Engine.log(`💬 Intimacy with ${p.name} has faded from neglect.`, 'bad');
    }

    if(p.love<18&&Math.random()<0.2){
      Engine.log(`💔 Things with ${p.name} collapsed after years of drifting apart.`, 'bad');
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
    const G=window.G;
    this._ensureChildDefaults(c);

    c.love=cl((c.love||60)-r(0,2));
    c.school=cl((c.school||70)+r(-5,3));
    c.wellbeing=cl((c.wellbeing||70)+r(-4,3));

    if(c.age>=18&&!c.independent&&Math.random()<0.55){
      c.independent=true;
      Engine.log(`🏠 ${c.name} moved out and started an independent life.`, 'special');
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

    Engine.log(`👶 ${c.name} is dealing with ${evt.issue}. It hit you hard as a parent.`, 'bad');
  },

  _ensureFriendDefaults(f){
    const G=window.G;
    if(!f)return null;
    f.id=f.id||Math.random().toString(36).slice(2);
    if(!Number.isFinite(f.age)||f.age<=0)f.age=Math.max(16,(G?.age||18)+r(-6,6));
    if(!Number.isFinite(f.love))f.love=r(38,65);
    if(!Number.isFinite(f.interactions))f.interactions=0;
    f.bestFriend=!!f.bestFriend;
    f.alive=f.alive!==false;
    f.role='friend';
    return f;
  },

  _maybeBestFriend(f){
    if(!f||f.bestFriend)return;
    if((f.love||0)>=85&&(f.interactions||0)>=4){
      f.bestFriend=true;
      window.G.happiness=cl(window.G.happiness+10);
      Engine.log(`⭐ ${f.name} became your best friend.`, 'special');
    }
  },

  _romanceLabelFor(f){
    if(!f)return'Ask Out';
    return f.gender==='female'?'Make Girlfriend':'Make Boyfriend';
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
    ex.causeLabel=ex.causeLabel||(ex.cause==='cheating'?'Cheating fallout':ex.cause==='drifted'?'Drifted apart':ex.cause==='divorce'?'Divorce':'Breakup');
    ex.role='ex';
    return ex;
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

  _reconcileChance(ex){
    this._ensureExDefaults(ex);
    let chance=0.14+((ex.score||0)/120)+((ex.chemistry||50)/300);
    if(ex.cause==='cheating')chance-=0.16;
    if((ex.yearsApart||0)>=4)chance-=0.06;
    return Math.max(0.08,Math.min(0.82,chance));
  },

  _offerFamilyAlternative(partner){
    const G=window.G;
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
      text:`A natural pregnancy is not likely with ${partner?.name||'your partner'} because of age or biology. You still have other ways to build a family.`,
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
        G.pregnancy={partnerId:partner?.id||null,partnerName:partner?.name||'someone',dueAge:G.age+1,keep,assisted:true};
        Engine.log(`🧬 Fertility treatment worked with ${partner?.name||'your partner'}. A pregnancy is underway.`, 'special');
        UI.update();this.render();
      };

      if(typeof UI==='undefined'||!UI.askChoice){finish(true);return;}

      UI.askChoice({
        icon:'🧬',
        title:'Treatment Success',
        text:`The clinic route worked with ${partner?.name||'your partner'}. What is the plan now?`,
        choices:[
          {value:true,label:'Raise the Child',sub:'Go ahead and build the family.'},
          {value:false,label:'Plan Adoption',sub:'Continue the pregnancy but place the baby for adoption.',danger:true},
        ],
      },finish);
      return;
    }

    Engine.log(`🧬 Fertility treatment with ${partner?.name||'your partner'} did not work this time.`, 'bad');
    UI.update();this.render();
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

    Engine.log(`👶 You adopted ${child.name}${partner?.name?` with ${partner.name}`:''}. Family can happen in more than one way.`, 'special');
    Engine.checkAch();
    UI.update();this.render();
  },

  _isCurrentPartner(partner){
    const G=window.G;
    return !!(partner&&G?.rels?.partner&&G.rels.partner.id===partner.id);
  },

  _stiRiskForEncounter(partner,opts,protectedSex){
    const G=window.G;
    const sh=G.sexualHealth||{};

    if(this._isCurrentPartner(partner)){
      const stage=partner.stage||(partner.married?'married':'dating');
      const committed=['serious','engaged','married'].includes(stage);
      const firstTime=(partner.sexualEncounters||0)===0;
      let risk=partner.sti?0.14:(firstTime?0.10:0);

      if(partner.outsideExposure)risk+=0.08;
      if(!committed&&!partner.sti&&!partner.outsideExposure)risk=Math.max(risk,firstTime?0.10:0.01);
      if(sh.lastCheckupAge===null||G.age-sh.lastCheckupAge>=5)risk+=partner.sti||partner.outsideExposure?0.01:0;
      if(!firstTime&&committed&&!partner.sti&&!partner.outsideExposure)risk=0;
      if(protectedSex)risk*=0.3;

      return risk;
    }

    let risk=opts.baseSti||0.05;
    risk+=(sh.partners||0)*0.008;
    risk+=(protectedSex?0:0.09);
    if(sh.lastCheckupAge===null||G.age-sh.lastCheckupAge>=5)risk+=0.02;
    if(protectedSex)risk*=0.35;
    return risk;
  },

  _chooseProtection(cb,opts={}){
    if(typeof UI==='undefined'||!UI.askChoice){
      cb(true);
      return;
    }

    UI.askChoice({
      icon:opts.risky?'⚠️':'🛡️',
      title:opts.title||'Protection Choice',
      text:opts.text||'Choose how careful this encounter should be.',
      choices:[
        {value:true,label:'Use Protection',sub:'Lower pregnancy and STI risk.'},
        {value:false,label:'No Protection',sub:'Higher pregnancy and STI risk.',danger:true},
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

    const stiRisk=this._stiRiskForEncounter(partner,opts,protectedSex);
    if(Math.random()<stiRisk){
      sh.sti=true;
      sh.std=true;
      G.health=cl(G.health-r(3,8));
      Engine.log('⚠️ This encounter may have left you with an STI. Get tested.', 'bad');
    }

    if(this._isCurrentPartner(partner)){
      this._ensurePartnerDefaults(partner);
      partner.sexualEncounters=(partner.sexualEncounters||0)+1;
    }

    const pregChance=this._pregnancyChance(partner,protectedSex,opts.pregnancyBoost||1);
    if(!G.pregnancy&&Math.random()<pregChance)this._startPregnancy(partner,opts.forcedKeep);

    if(opts.logText)Engine.log(`${opts.logText}${protectedSex?' Protection used.':' No protection.'}`,opts.logType||'love');
  },

  _pregnancyChance(partner,protectedSex,boost){
    const G=window.G;
    if(!this._canPregnancyOccur(partner))return 0;

    let chance=0.22*(boost||1);
    if(protectedSex)chance*=0.18;

    const playerAge=G.age;
    const partnerAge=partner?.age||G.age;
    if(playerAge>35||partnerAge>35)chance*=0.7;
    if(playerAge>43||partnerAge>43)chance*=0.45;

    return chance;
  },

  _canPregnancyOccur(partner){
    const G=window.G;
    if(!partner)return false;
    if(G.gender===partner.gender)return false;
    if(G.age<18||G.age>50)return false;
    if((partner.age||0)<18||(partner.age||0)>50)return false;
    return true;
  },

  _startPregnancy(partner,forcedKeep){
    const G=window.G;

    const finish=keep=>{
      G.pregnancy={
        partnerId:partner?.id||null,
        partnerName:partner?.name||'someone',
        dueAge:G.age+1,
        keep,
      };
      G.happiness=cl(G.happiness+(keep?8:-4));
      G.stress=cl((G.stress||0)+(keep?8:12));
      Engine.log(`🍼 Pregnancy started with ${G.pregnancy.partnerName}. ${keep?'You plan to keep the baby.':'You plan for adoption.'}`,keep?'special':'bad');
      UI.update();this.render();
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
    if(!G.pregnancy)return;

    const p=G.pregnancy;
    if(p.keep){
      const child=this._createChild();
      G.rels.children.push(child);
      G.happiness=cl(G.happiness+18);
      G.stress=cl((G.stress||0)+7);
      Engine.log(`👶 ${child.name} was born. Your family just got bigger.`, 'special');
      Engine.checkAch();
    }else{
      G.happiness=cl(G.happiness-6);
      G.stress=cl((G.stress||0)+6);
      Engine.log('👶 The baby was placed for adoption after birth. A complicated, emotional choice.', 'bad');
    }

    G.pregnancy=null;
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

    if(cashLoss>0)Engine.log(`💔 ${label} from ${p.name}. Legal and life costs hit you for ${fmt(cashLoss)}.`, 'bad');
    else Engine.log(`💔 You and ${p.name} separated.`, 'bad');

    UI.update();this.render();
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
      Engine.log(`🕯️ ${n.name}, your partner, passed away from ${cause}.`, 'bad');
      return;
    }

    if(n.role==='father'||n.role==='mother'){
      G.happiness=cl(G.happiness-r(10,20));
      G.stress=cl((G.stress||0)+r(5,12));
      Engine.log(`🕯️ Your ${n.role} ${n.name} passed away from ${cause}.`, 'bad');
      return;
    }

    if(n.role==='friend'){
      G.happiness=cl(G.happiness-r(4,10));
      Engine.log(`🕯️ Your friend ${n.name} passed away from ${cause}.`, 'bad');
      return;
    }

    Engine.log(`🕯️ ${n.name} passed away from ${cause}.`, 'bad');
  },
};