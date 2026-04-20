/* js/relations.js — LifeSim v9 */
const Relations={

  render(){
    const G=window.G; if(!G)return;
    const el=document.getElementById('tab-love');
    let h='';

    /* ── Family ── */
    h+=`<div class="sec">👨‍👩‍👧 Family</div>`;
    const fam=[G.rels.father,G.rels.mother,...(G.rels.siblings||[])].filter(Boolean);
    if(!fam.length){h+=`<div class="empty"><span class="ei">👣</span><p>No family information available.</p></div>`;}
    fam.forEach(n=>{
      if(!n)return;
      const ico=n.role==='father'?'👨':n.role==='mother'?'👩':n.gender==='female'?'👧':'👦';
      const lc=n.love>65?'var(--pink)':n.love>35?'var(--yellow)':'var(--red)';
      h+=`<div class="rel-card" onclick="Relations.clickFamily('${n.id}')">
        <div class="rel-av">${ico}</div>
        <div class="rel-inf">
          <div class="rel-name">${n.name} ${n.surname}${!n.alive?' 🪦':''}</div>
          <div class="rel-role">${cap(n.role)} · Age ${n.age}${!n.alive?' <span class="badge badge-r">Deceased</span>':''}</div>
          ${n.alive?`<div class="rel-bar"><div class="rel-fill" style="width:${n.love}%;background:${lc}"></div></div>`:''}
        </div>
        ${n.alive?`<div style="font-size:11px;font-weight:800;color:${lc}">${n.love}%</div>`:''}
      </div>`;
    });

    /* ── Romance ── */
    h+=`<div class="sec">💑 Romance & Intimacy</div>`;
    if(G.rels.partner){
      const p=G.rels.partner;
      const lc=p.love>65?'var(--pink)':p.love>35?'var(--yellow)':'var(--red)';
      const ic=( p.intimacy||0)>65?'var(--rose)':(p.intimacy||0)>35?'var(--pink)':'var(--muted)';
      h+=`<div class="partner-card">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
          <div class="rel-av" style="width:52px;height:52px;font-size:26px">${p.gender==='female'?'👩':'👨'}</div>
          <div style="flex:1">
            <div style="font-size:17px;font-weight:900">${p.name} ${p.surname}${p.married?' 💍':''}</div>
            <div style="font-size:12px;color:var(--muted);font-weight:600;margin-top:2px">${p.married?`Married · ${p.yearsMarried||0} yr${(p.yearsMarried||0)!==1?'s':''}`:(p.livingTogether?'Living together':'Partner')} · Age ${p.age}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div>
            <div class="sb-l" style="margin-bottom:3px">❤️ Love</div>
            <div class="rel-bar"><div class="rel-fill" style="width:${p.love}%;background:${lc}"></div></div>
            <div style="font-size:10px;font-weight:800;color:${lc};margin-top:2px">${p.love}%</div>
          </div>
          <div>
            <div class="sb-l" style="margin-bottom:3px">🔥 Intimacy</div>
            <div class="rel-bar"><div class="rel-fill" style="width:${p.intimacy||0}%;background:${ic}"></div></div>
            <div style="font-size:10px;font-weight:800;color:${ic};margin-top:2px">${p.intimacy||0}%</div>
          </div>
        </div>
      </div>`;

      h+=`<div class="sec">💌 Romantic Actions</div>
      <div class="act-grid">
        <div class="card" onclick="Relations.pa('date')"><span class="ci">🌹</span><span class="cn">Date Night</span><span class="cd">+Love +Hap</span></div>
        <div class="card" onclick="Relations.pa('gift')"><span class="ci">🎁</span><span class="cn">Give Gift</span><span class="cd">+Love (${fmt(sc(200))})</span></div>
        <div class="card" onclick="Relations.pa('flirt')"><span class="ci">😘</span><span class="cn">Flirt</span><span class="cd">+Love +Intimacy</span></div>
        <div class="card" onclick="Relations.pa('compliment')"><span class="ci">🌟</span><span class="cn">Compliment</span><span class="cd">+Love +Hap</span></div>
        <div class="card" onclick="Relations.pa('deep_talk')"><span class="ci">💬</span><span class="cn">Deep Talk</span><span class="cd">+Love −Stress</span></div>
        <div class="card" onclick="Relations.pa('cook_dinner')"><span class="ci">🍷</span><span class="cn">Cook Dinner</span><span class="cd">+Love +Intimacy (${fmt(sc(80))})</span></div>
      </div>
      <div class="act-grid" style="margin-top:8px">
        <div class="card" onclick="Relations.pa('weekend')"><span class="ci">🏨</span><span class="cn">Weekend Away</span><span class="cd">+Love −Stress (${fmt(sc(600))})</span></div>
        <div class="card" onclick="Relations.pa('trip')"><span class="ci">🏖️</span><span class="cn">Romantic Holiday</span><span class="cd">+Love +Intimacy (${fmt(sc(2000))})</span></div>
        <div class="card" onclick="Relations.pa('slow_dance')"><span class="ci">🎶</span><span class="cn">Slow Dance</span><span class="cd">+Love +Hap</span></div>
        <div class="card" onclick="Relations.pa('love_letter')"><span class="ci">💌</span><span class="cn">Love Letter</span><span class="cd">+Love +Intimacy</span></div>
        ${!p.married?`<div class="card special" onclick="Relations.pa('propose')"><span class="ci">💍</span><span class="cn">Propose!</span><span class="cd">Get married</span></div>`
        :`<div class="card" onclick="Relations.pa('renew')"><span class="ci">💒</span><span class="cn">Renew Vows</span><span class="cd">+Love +Hap</span></div>`}
        ${p.love<35?`<div class="card danger" onclick="Relations.pa('counselling')"><span class="ci">🛋️</span><span class="cn">Couples Therapy</span><span class="cd">Save relationship (${fmt(sc(200))})</span></div>`
        :`<div class="card" onclick="Relations.pa('surprise')"><span class="ci">🎊</span><span class="cn">Surprise Them</span><span class="cd">+Love +Hap</span></div>`}
        ${!p.livingTogether?`<div class="card special" onclick="Relations.pa('move_in')"><span class="ci">🏠</span><span class="cn">Move In</span><span class="cd">Commit and share life</span></div>`
        :`<div class="card" onclick="Relations.pa('home_date')"><span class="ci">🕯️</span><span class="cn">Home Date</span><span class="cd">+Love −Stress</span></div>`}
      </div>`;

      if(G.age>=18&&p.age>=18){
        h+=`<div class="sec">🔥 Intimate Life</div>
        <div class="act-grid">
          <div class="card" onclick="Relations.pa('makeout')"><span class="ci">💋</span><span class="cn">Make Out</span><span class="cd">+Intimacy +Hap</span></div>
          <div class="card" onclick="Relations.pa('intimate')"><span class="ci">🔥</span><span class="cn">Passionate Night</span><span class="cd">+Love +Hap +Intimacy</span></div>
          <div class="card" onclick="Relations.pa('massage')"><span class="ci">💆</span><span class="cn">Give Massage</span><span class="cd">+Intimacy +Love</span></div>
          <div class="card" onclick="Relations.pa('sext')"><span class="ci">📱</span><span class="cn">Sext</span><span class="cd">+Intimacy +Hap</span></div>
          <div class="card" onclick="Relations.pa('roleplay')"><span class="ci">🎭</span><span class="cn">Role Play</span><span class="cd">+Intimacy +Hap</span></div>
          <div class="card" onclick="Relations.pa('fantasy_talk')"><span class="ci">🌶️</span><span class="cn">Talk Fantasies</span><span class="cd">+Intimacy +Trust</span></div>
          <div class="card" onclick="Relations.pa('aftercare')"><span class="ci">🫶</span><span class="cn">Aftercare</span><span class="cd">+Love −Stress</span></div>
          <div class="card" onclick="Relations.pa('morning')"><span class="ci">☕</span><span class="cn">Slow Morning</span><span class="cd">+Love +Hap</span></div>
        </div>`;
      }

      if(G.age>=18&&G.age<=58&&p.age>=18){
        const expecting=!!G.familyPlanning?.pregnant;
        h+=`<div class="sec">⚠️ Risky Actions</div>
        <div class="act-grid">
          <div class="card" onclick="Relations.pa('child')"><span class="ci">👶</span><span class="cn">${expecting?'Expecting Baby':'Try for Baby'}</span><span class="cd">${expecting?'Due next birthday':'Family planning'}</span></div>
          <div class="card danger" onclick="Relations.pa('cheat')"><span class="ci">🤫</span><span class="cn">Cheat</span><span class="cd">High risk!</span></div>
          <div class="card danger" onclick="Relations.pa('divorce')"><span class="ci">💔</span><span class="cn">${p.married?'Divorce':'Break Up'}</span><span class="cd">End the relationship</span></div>
        </div>`;
      }
    } else if(G.age>=18){
      h+=`<div class="info-box"><p>You are single. Find a partner or enjoy the freedom of single life.</p></div>
      <div class="act-grid">
        <div class="card" onclick="Relations.findPartner()"><span class="ci">💘</span><span class="cn">Meet Someone</span><span class="cd">Find a partner</span></div>
        <div class="card" onclick="Relations.dateApp()"><span class="ci">📲</span><span class="cn">Dating App</span><span class="cd">Swipe & match</span></div>
        <div class="card" onclick="Relations.hookup()"><span class="ci">🌙</span><span class="cn">One-Night Stand</span><span class="cd">No strings attached</span></div>
        <div class="card" onclick="Relations.visitAdultClub()"><span class="ci">🌶️</span><span class="cn">Adult Entertainment</span><span class="cd">Fun for a night</span></div>
      </div>`;
      if(G.sexualHealth?.std){
        h+=`<div class="row-card" onclick="Relations.stdTest()" style="border-color:rgba(248,113,113,.4);margin-top:10px">
          <span class="ri">🧪</span>
          <div class="rd"><div class="rt">Get STD Treatment</div><div class="rs">⚠️ You have an active STD — seek treatment now</div></div>
          <div class="rv">${fmt(sc(400))}</div>
        </div>`;
      }
    } else if(G.age>=15){
      h+=`<div class="info-box"><p>You're ${G.age} — crushes, first dates and school romance are unlocked. Adult intimacy unlocks at 18.</p></div>
      <div class="act-grid">
        <div class="card" onclick="Relations.teenCrush()"><span class="ci">💘</span><span class="cn">Pursue Crush</span><span class="cd">Teen romance</span></div>
        <div class="card" onclick="Relations.teenDate()"><span class="ci">🎬</span><span class="cn">First Date</span><span class="cd">Cinema & coffee</span></div>
        <div class="card" onclick="Relations.teenHoldHands()"><span class="ci">🤝</span><span class="cn">Hold Hands</span><span class="cd">Sweet closeness</span></div>
        <div class="card" onclick="Relations.teenDance()"><span class="ci">🎶</span><span class="cn">School Dance</span><span class="cd">Romance +Hap</span></div>
        <div class="card" onclick="Relations.teenKiss()"><span class="ci">💋</span><span class="cn">First Kiss</span><span class="cd">A big moment</span></div>
        <div class="card" onclick="Relations.teenTalk()"><span class="ci">💬</span><span class="cn">Talk Feelings</span><span class="cd">Honest teen romance</span></div>
      </div>`;
    } else {
      h+=`<div class="empty"><span class="ei">🧒</span><p>Romance unlocks at age 15!<br>Enjoy your childhood.</p></div>`;
    }

    /* ── Children ── */
    if(G.familyPlanning?.pregnant){
      h+=`<div class="info-box"><p>Expecting a child next birthday. Big changes are coming.</p></div>`;
    }
    if((G.rels.children||[]).length>0){
      h+=`<div class="sec">👶 Children (${G.rels.children.length})</div>`;
      G.rels.children.forEach(c=>{
        h+=`<div class="rel-card" onclick="Relations.spendTimeWithChild('${c.id}')">
          <div class="rel-av">${c.gender==='female'?'👧':'👦'}</div>
          <div class="rel-inf">
            <div class="rel-name">${c.name} ${c.surname||G.surname}</div>
            <div class="rel-role">Your child · Age ${c.age}</div>
          </div>
        </div>`;
      });
    }

    /* ── Friends ── */
    h+=`<div class="sec">👥 Friends (${(G.rels.friends||[]).length}/10)</div>`;
    (G.rels.friends||[]).forEach(f=>{
      const lc=f.love>65?'var(--cyan)':'var(--muted)';
      h+=`<div class="rel-card" onclick="Relations.hangFriend('${f.id}')">
        <div class="rel-av">${f.gender==='female'?'👩':'👨'}</div>
        <div class="rel-inf">
          <div class="rel-name">${f.name} ${f.surname}</div>
          <div class="rel-role">Friend · ${f.love}% bond</div>
          <div class="rel-bar"><div class="rel-fill" style="width:${f.love}%;background:${lc}"></div></div>
        </div>
      </div>`;
    });
    if((G.rels.friends||[]).length<10){
      h+=`<div class="row-card" onclick="Relations.makeFriend()">
        <span class="ri">🤝</span>
        <div class="rd"><div class="rt">Meet Someone New</div><div class="rs">Make a new friend</div></div>
      </div>`;
    }

    /* ── Sexual Health ── */
    if(G.age>=18){
      const std=G.sexualHealth?.std;
      const safe=G.sexualHealth?.safeDating||0;
      h+=`<div class="sec">🧪 Sexual Health</div>
      <div class="row-card" onclick="Relations.stdTest()">
        <span class="ri">🧪</span>
        <div class="rd"><div class="rt">Sexual Health Check</div>
        <div class="rs">Status: <span style="color:${std?'var(--red)':'var(--green)'}">${std?'⚠️ STD Detected':'✅ All Clear'}</span>${safe?` · Safer intimacy habits: ${safe}`:''}</div></div>
        <div class="rv">${fmt(sc(std?400:80))}</div>
      </div>`;
    }

    el.innerHTML=h;
  },

  pa(act){
    const G=window.G; const p=G.rels.partner;
    if(!p&&act!=='divorce')return;
    const adultOnly=['makeout','intimate','sext','roleplay','fantasy_talk','aftercare','morning','child','cheat'];
    if(adultOnly.includes(act)&&(G.age<18||p?.age<18)){UI.toast('Adults only.');return;}
    switch(act){
      case 'date':
        p.love=cl(p.love+r(5,11));G.happiness=cl(G.happiness+r(8,14));G.stress=cl((G.stress||0)-r(4,8));
        Engine.log(`🌹 A magical evening out with ${p.name}. Falling deeper in love.`,'love'); break;
      case 'gift':
        if(G.money<sc(200)){UI.toast('Need '+fmt(sc(200))+'!');return;}
        G.money-=sc(200); p.love=cl(p.love+r(8,14));
        Engine.log(`🎁 Surprised ${p.name} with a thoughtful gift. Their eyes lit up!`,'love'); break;
      case 'flirt':
        p.love=cl(p.love+r(4,8)); p.intimacy=cl((p.intimacy||50)+r(3,7));
        Engine.log(`😘 Flirting with ${p.name} all evening. Irresistible chemistry.`,'love'); break;
      case 'compliment':
        p.love=cl(p.love+r(3,7)); G.happiness=cl(G.happiness+r(4,9));
        Engine.log(`🌟 A heartfelt compliment to ${p.name}. Big warm smile in return.`,'love'); break;
      case 'deep_talk':
        p.love=cl(p.love+r(7,13)); p.intimacy=cl((p.intimacy||50)+r(4,8));
        G.happiness=cl(G.happiness+r(5,10)); G.stress=cl((G.stress||0)-r(8,14));
        Engine.log(`💬 You and ${p.name} talked honestly about needs, fears, and the future. It felt real.`,'love'); break;
      case 'cook_dinner':
        if(G.money<sc(80)){UI.toast('Need '+fmt(sc(80))+'!');return;}
        G.money-=sc(80); p.love=cl(p.love+r(6,12)); p.intimacy=cl((p.intimacy||50)+r(5,9));
        G.happiness=cl(G.happiness+r(7,12));
        Engine.log(`🍷 You cooked ${p.name} a proper dinner. Warm, romantic, and unforced.`,'love'); break;
      case 'surprise':
        p.love=cl(p.love+r(7,13)); G.happiness=cl(G.happiness+r(8,14));
        Engine.log(`🎊 You surprised ${p.name} and completely made their day.`,'love'); break;
      case 'weekend':
        if(G.money<sc(600)){UI.toast('Need '+fmt(sc(600))+'!');return;}
        G.money-=sc(600); p.love=cl(p.love+r(10,17)); p.intimacy=cl((p.intimacy||50)+r(7,12));
        G.happiness=cl(G.happiness+r(12,18)); G.stress=cl((G.stress||0)-r(10,16));
        Engine.log(`🏨 Beautiful weekend away with ${p.name}. Never felt closer.`,'love'); break;
      case 'trip':
        if(G.money<sc(2000)){UI.toast('Need '+fmt(sc(2000))+'!');return;}
        G.money-=sc(2000); p.love=cl(p.love+r(14,22)); p.intimacy=cl((p.intimacy||50)+r(10,16));
        G.happiness=cl(G.happiness+r(18,26)); G.stress=cl((G.stress||0)-r(14,20));
        Engine.log(`🏖️ A stunning romantic holiday with ${p.name}. Absolutely unforgettable.`,'love'); break;
      case 'slow_dance':
        p.love=cl(p.love+r(5,10)); p.intimacy=cl((p.intimacy||50)+r(4,8));
        G.happiness=cl(G.happiness+r(7,12)); G.stress=cl((G.stress||0)-r(5,9));
        Engine.log(`🎶 You slow danced with ${p.name} in the kitchen. Simple, tender, perfect.`,'love'); break;
      case 'love_letter':
        p.love=cl(p.love+r(8,15)); p.intimacy=cl((p.intimacy||50)+r(3,7));
        G.happiness=cl(G.happiness+r(5,9)); G.smarts=cl(G.smarts+r(1,3));
        Engine.log(`💌 You wrote ${p.name} a sincere love letter. They read it twice.`,'love'); break;
      case 'move_in':
        if(p.livingTogether){UI.toast('You already live together.');return;}
        if(p.love<52){UI.toast(p.name+' wants more trust before moving in.');return;}
        p.livingTogether=true; p.love=cl(p.love+r(8,14)); p.intimacy=cl((p.intimacy||50)+r(4,8));
        G.happiness=cl(G.happiness+r(9,15)); G.stress=cl((G.stress||0)-r(4,8));
        Engine.log(`🏠 You and ${p.name} moved in together. Real life, shared keys, shared mornings.`,'special'); break;
      case 'home_date':
        p.love=cl(p.love+r(5,10)); p.intimacy=cl((p.intimacy||50)+r(5,9));
        G.happiness=cl(G.happiness+r(8,13)); G.stress=cl((G.stress||0)-r(8,13));
        Engine.log(`🕯️ A quiet home date with ${p.name}. Comfortable love can still be deeply romantic.`,'love'); break;
      case 'makeout':
        if(p.love<18){UI.toast(p.name+' wants more emotional connection first.');return;}
        p.love=cl(p.love+r(3,7)); p.intimacy=cl((p.intimacy||50)+r(7,13));
        G.happiness=cl(G.happiness+r(7,13)); G.stress=cl((G.stress||0)-r(4,8));
        Engine.log(this._intimacyText('makeout',p),'sexy'); break;
      case 'intimate':
        if(p.love<28){UI.toast(p.name+' isn\'t in the mood right now.');return;}
        this._protectionChoice({
          title:'Protection Choice',
          text:`Things are getting intimate with ${p.name}. How do you want to handle protection?`,
          partner:p,
          kind:'intimate',
        });
        return;
      case 'massage':
        p.intimacy=cl((p.intimacy||50)+r(7,12)); p.love=cl(p.love+r(4,9));
        G.happiness=cl(G.happiness+r(6,10));
        Engine.log(this._intimacyText('massage',p),'love'); break;
      case 'sext':
        if(p.love<22){UI.toast(p.name+' isn\'t ready for that.');return;}
        p.intimacy=cl((p.intimacy||50)+r(10,18)); G.happiness=cl(G.happiness+r(7,13));
        Engine.log(this._intimacyText('sext',p),'sexy'); break;
      case 'roleplay':
        if(p.love<35){UI.toast(p.name+' isn\'t comfortable with that yet.');return;}
        p.intimacy=cl((p.intimacy||50)+r(12,20)); G.happiness=cl(G.happiness+r(10,17));
        Engine.log(this._intimacyText('roleplay',p),'sexy'); break;
      case 'fantasy_talk':
        if(!G.sexualHealth)G.sexualHealth={std:false};
        G.sexualHealth.safeDating=(G.sexualHealth.safeDating||0)+5;
        p.love=cl(p.love+r(4,8)); p.intimacy=cl((p.intimacy||50)+r(9,16));
        G.happiness=cl(G.happiness+r(6,11)); G.karma=cl((G.karma||0)+r(1,3),-100,100);
        Engine.log(this._intimacyText('fantasy_talk',p),'sexy'); break;
      case 'aftercare':
        p.love=cl(p.love+r(6,11)); p.intimacy=cl((p.intimacy||50)+r(4,8));
        G.happiness=cl(G.happiness+r(8,13)); G.stress=cl((G.stress||0)-r(8,14));
        Engine.log(this._intimacyText('aftercare',p),'love'); break;
      case 'morning':
        p.love=cl(p.love+r(5,10)); p.intimacy=cl((p.intimacy||50)+r(4,8));
        G.happiness=cl(G.happiness+r(8,14)); G.stress=cl((G.stress||0)-r(6,11));
        Engine.log(this._intimacyText('morning',p),'love'); break;
      case 'propose':
        if(p.married){UI.toast('You\'re already married!');return;}
        if(p.love<62){UI.toast(p.name+' doesn\'t feel ready. Build more love first.');return;}
        p.married=true; p.yearsMarried=0; G.happiness=cl(G.happiness+28);
        Engine.log(`💍 You proposed to ${p.name} — and they said YES! Wedding bells!`,'special');
        if(!G.achievements)G.achievements={}; Engine.checkAch(); break;
      case 'renew':
        p.love=cl(p.love+r(12,20)); G.happiness=cl(G.happiness+r(14,20));
        Engine.log(`💒 You and ${p.name} renewed your vows. More in love than ever.`,'special'); break;
      case 'counselling':
        if(G.money<sc(200)){UI.toast('Need '+fmt(sc(200))+'!');return;}
        G.money-=sc(200); p.love=cl(p.love+r(8,15)); G.happiness=cl(G.happiness+r(5,10));
        Engine.log(`🛋️ Couples therapy helped you and ${p.name} reconnect and communicate.`,'love'); break;
      case 'child':
        if(!p){UI.toast('Need a partner first!');return;}
        if(G.age<18||G.age>58||p.age<18||p.age>58){UI.toast('Not the right time for a baby.');return;}
        this._babyChoice(p);
        return;
      case 'cheat':{
        const affair=Engine.npc('fling',G.gender==='female'?'male':'female');
        affair.age=r(Math.max(18,G.age-8),Math.max(18,G.age+5));
        this._protectionChoice({
          title:'Risky Hookup',
          text:`You are about to cheat with ${affair.name}. This could affect your health, your relationship, and your future. Protection?`,
          partner:p,
          affair,
          kind:'cheat',
        });
        return;}
      case 'divorce':{
        const pn=p?p.name:'partner'; const wasMarried=p?.married;
        G.rels.partner=null; G.happiness=cl(G.happiness-20);
        if(!G.achievements)G.achievements={}; G.achievements.divorced=true;
        if(wasMarried)G.money=Math.max(0,G.money-sc(r(5000,20000)));
        Engine.log(`💔 You and ${pn} ${wasMarried?'divorced':'split up'}. A painful chapter ends.`,'bad');
        Engine.checkAch(); break;}
    }
    UI.update(); this.render();
  },

  findPartner(){
    const G=window.G;
    if(G.age<18){UI.toast('Romance partners unlock at 18.');return;}
    if(G.rels.partner){UI.toast('You already have a partner!');return;}
    const pGender=G.gender==='female'?'male':'female';
    const p=Engine.npc('partner',pGender);
    const minAge=Math.max(18,G.age-5);
    const maxAge=Math.max(minAge,G.age+5);
    p.age=r(minAge,maxAge); p.love=r(40,68); p.intimacy=r(25,50); p.married=false; p.yearsMarried=0; p.livingTogether=false;
    G.rels.partner=p; G.happiness=cl(G.happiness+13);
    Engine.log(`💘 You started dating ${p.name} ${p.surname}! Butterflies everywhere.`,'love');
    UI.update(); this.render();
  },

  dateApp(){
    const G=window.G;
    if(G.age<18){UI.toast('Adults only!');return;}
    if(G.rels.partner){UI.toast('Delete the app — you have a partner!');return;}
    const roll=Math.random();
    if(roll<0.40){this.findPartner(); Engine.log('📲 Dating app miracle! Matched with someone special.','love');}
    else if(roll<0.72){
      const n=Engine.npc('fling',G.gender==='female'?'male':'female');
      n.age=r(Math.max(18,G.age-8),Math.max(18,G.age+5));
      G.happiness=cl(G.happiness+r(6,12)); this._stdRisk(0.07);
      Engine.log(`📲 Matched with ${n.name}. One exciting date — no commitment.`,'sexy');
      UI.update();
    } else {
      G.happiness=cl(G.happiness-6);
      Engine.log('📲 Three terrible dates in a row. Deleting this app.','bad');
      UI.update();
    }
    this.render();
  },

  hookup(){
    const G=window.G;
    if(G.age<18){UI.toast('Adults only!');return;}
    const n=Engine.npc('hookup',G.gender==='female'?'male':'female');
    n.age=r(Math.max(18,G.age-8),Math.max(18,G.age+5));
    this._protectionChoice({
      title:'One-Night Stand',
      text:`The chemistry with ${n.name} is obvious. Before things go further, choose how to handle protection.`,
      partner:n,
      kind:'hookup',
    });
  },

  visitAdultClub(){
    const G=window.G;
    if(G.age<18){UI.toast('Adults only!');return;}
    const cost=sc(100);
    if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
    G.money-=cost; G.happiness=cl(G.happiness+r(11,18)); this._stdRisk(0.06);
    Engine.log(`🌶️ A very adult evening out. Memorable, to say the least.`,'sexy');
    UI.update(); this.render();
  },

  stdTest(){
    const G=window.G;
    const treatCost=sc(G.sexualHealth?.std?400:80);
    if(G.money<treatCost){UI.toast('Need '+fmt(treatCost)+'!');return;}
    G.money-=treatCost;
    if(!G.sexualHealth)G.sexualHealth={std:false};
    if(G.sexualHealth.std){
      G.sexualHealth.std=false; G.health=cl(G.health+8);
      Engine.log('🧪 STD test positive — treatment completed. All clear now.','good');
    } else {
      Engine.log('🧪 All STD tests came back clear. Great news!','good');
    }
    UI.update(); this.render();
  },

  teenCrush(){
    const G=window.G;
    if(G.age<15){UI.toast('Teen romance unlocks at 15.');return;}
    G.happiness=cl(G.happiness+r(8,14));
    Engine.log('💘 You worked up the courage to approach your crush. They seemed interested!','love');
    UI.update(); this.render();
  },

  teenDate(){
    const G=window.G;
    if(G.age<15){UI.toast('Teen romance unlocks at 15.');return;}
    G.happiness=cl(G.happiness+r(10,16)); G.looks=cl(G.looks+r(1,3));
    Engine.log('🎬 Your first proper date! Awkward, sweet, and absolutely magical.','love');
    UI.update(); this.render();
  },

  teenHoldHands(){
    const G=window.G;
    if(G.age<15){UI.toast('Teen romance unlocks at 15.');return;}
    G.happiness=cl(G.happiness+r(6,11)); G.stress=cl((G.stress||0)-r(2,5));
    Engine.log('🤝 You held hands after school. Tiny moment, enormous butterflies.','love');
    UI.update(); this.render();
  },

  teenDance(){
    const G=window.G;
    if(G.age<15){UI.toast('Teen romance unlocks at 15.');return;}
    G.happiness=cl(G.happiness+r(9,15)); G.looks=cl(G.looks+r(1,3)); G.stress=cl((G.stress||0)-r(3,7));
    Engine.log('🎶 The school dance felt awkward at first, then suddenly perfect when your crush smiled at you.','love');
    UI.update(); this.render();
  },

  teenKiss(){
    const G=window.G;
    if(G.age<15){UI.toast('Teen romance unlocks at 15.');return;}
    G.happiness=cl(G.happiness+r(12,20)); G.looks=cl(G.looks+r(1,3)); G.stress=cl((G.stress||0)-r(2,6));
    Engine.log('💋 You shared a nervous first kiss. Sweet, clumsy, and impossible to stop thinking about.','love');
    UI.update(); this.render();
  },

  teenTalk(){
    const G=window.G;
    if(G.age<15){UI.toast('Teen romance unlocks at 15.');return;}
    G.happiness=cl(G.happiness+r(7,12)); G.smarts=cl(G.smarts+r(1,3)); G.stress=cl((G.stress||0)-r(4,8));
    Engine.log('💬 You talked honestly about feelings, boundaries, and not rushing anything. It made the romance feel safer and more real.','love');
    UI.update(); this.render();
  },

  makeFriend(){
    const G=window.G;
    if((G.rels.friends||[]).length>=10){UI.toast('Social circle is full!');return;}
    const f=Engine.npc('friend',Math.random()>0.5?'female':'male');
    f.love=r(38,65); if(!G.rels.friends)G.rels.friends=[];
    G.rels.friends.push(f); G.happiness=cl(G.happiness+r(5,10));
    Engine.log(`🤝 You made a new friend: ${f.name} ${f.surname}!`,'good');
    UI.update(); this.render();
  },

  hangFriend(id){
    const G=window.G;
    const f=(G.rels.friends||[]).find(x=>x.id===id); if(!f)return;
    f.love=cl(f.love+r(4,9)); G.happiness=cl(G.happiness+r(6,12)); G.stress=cl((G.stress||0)-r(3,7));
    Engine.log(`😄 Great time with ${f.name}. Laughed until it hurt.`,'good');
    UI.update(); this.render();
  },

  clickFamily(id){
    const G=window.G;
    const all=[G.rels.father,G.rels.mother,...(G.rels.siblings||[])].filter(Boolean);
    const n=all.find(x=>x&&x.id===id); if(!n||!n.alive)return;
    n.love=cl(n.love+r(3,9)); G.happiness=cl(G.happiness+r(4,9));
    Engine.log(`😊 Spent quality time with your ${n.role} ${n.name}. Heart full.`,'good');
    UI.update(); this.render();
  },

  spendTimeWithChild(id){
    const G=window.G;
    const c=(G.rels.children||[]).find(x=>x.id===id); if(!c)return;
    G.happiness=cl(G.happiness+r(8,14));
    Engine.log(`👶 Quality time with ${c.name}. Watching them grow is everything.`,'good');
    UI.update(); this.render();
  },

  ageAll(){
    const G=window.G;
    const all=[G.rels.father,G.rels.mother,...(G.rels.siblings||[]),G.rels.partner,...(G.rels.children||[]),...(G.rels.friends||[])].filter(Boolean);
    all.forEach(n=>{
      if(!n||!n.alive)return;
      n.age++;
      if((n.role==='father'||n.role==='mother')&&n.alive){
        const da=r(68,97);
        if(n.age>da&&Math.random()<0.18)this._die(n);
      }
      if(n.alive&&Math.random()<0.005)this._die(n,'an accident');
      if(n.role==='partner'&&n.love>18)n.love=cl(n.love-r(0,2));
      if(n.role==='partner'&&(n.intimacy||0)>15)n.intimacy=cl((n.intimacy||50)-r(0,1));
      if(n.role==='partner'&&n.livingTogether&&n.love>55)window.G.stress=cl((window.G.stress||0)-1);
      if(n.role==='partner'&&window.G.age>=18&&Math.random()<0.10)this._relationshipRipple(n);
      if(n.role==='partner'&&n.married){n.yearsMarried=(n.yearsMarried||0)+1;}
    });
    if(G.familyPlanning?.pregnant&&G.familyPlanning.dueAge&&G.age>=G.familyPlanning.dueAge){
      this._birthBaby();
    }
    // Inheritance chance when parent dies
  },

  _die(n,cause){
    if(!n||!n.alive)return;
    n.alive=false;
    const c=cause||pick(['natural causes','a heart attack','a long illness','a stroke','kidney failure']);
    Engine.log(`💔 Your ${n.role} ${n.name} passed away at age ${n.age} from ${c}.`,'bad');
    window.G.happiness=cl(window.G.happiness-r(12,22));
    window.G.health=cl(window.G.health-r(2,6));
    // Inheritance from parents
    if((n.role==='father'||n.role==='mother')&&Math.random()<0.55){
      const inh=sc(r(5000,80000));
      window.G.money+=inh;
      window.G.inheritanceReceived=(window.G.inheritanceReceived||0)+inh;
      Engine.log(`💝 You received an inheritance of ${fmt(inh)} from your ${n.role}.`,'money');
      Engine.checkAch();
    }
  },

  _relationshipRipple(p){
    const G=window.G;if(!p)return;
    const events=[
      ()=>{p.love=cl(p.love+r(3,7));G.happiness=cl(G.happiness+r(4,8));Engine.log(`💕 ${p.name} remembered a tiny detail you mentioned months ago. You felt deeply seen.`,'love');},
      ()=>{p.love=cl(p.love-r(4,9));G.stress=cl((G.stress||0)+r(3,8));Engine.log(`💬 You and ${p.name} had the same argument again. Small issues are becoming patterns.`,'bad');},
      ()=>{p.intimacy=cl((p.intimacy||50)+r(4,9));G.happiness=cl(G.happiness+r(3,7));Engine.log(`🕯️ An ordinary evening with ${p.name} turned unexpectedly romantic.`,'love');},
      ()=>{p.love=cl(p.love+r(2,5));G.money=Math.max(0,G.money-sc(200));Engine.log(`🎁 ${p.name} needed practical support, and you showed up without making it dramatic.`,'love');},
      ()=>{p.love=cl(p.love-r(3,7));p.intimacy=cl((p.intimacy||50)-r(2,5));Engine.log(`📱 You and ${p.name} spent too much time distracted and not enough time connecting.`,'neutral');},
    ];
    pick(events)();
  },

  _familyState(){
    const G=window.G;
    if(!G.familyPlanning){
      G.familyPlanning={pregnant:false,dueAge:null,lastBabyAge:-99,lastAttemptAge:-99,partnerName:'',kind:''};
    }
    return G.familyPlanning;
  },

  _babyChoice(p){
    const G=window.G;
    const fp=this._familyState();
    if(fp.pregnant){
      UI.toast('You are already expecting. The baby is due next birthday.','good');
      return;
    }
    if(fp.lastAttemptAge===G.age){
      UI.toast('You already tried for a baby this year. Age up before trying again.');
      return;
    }
    if((G.rels.children||[]).length>=8){
      UI.toast('Your household is already very full.');
      return;
    }
    if((p.love||0)<32){
      UI.toast(p.name+' wants the relationship to feel more stable first.');
      return;
    }

    const sameGender=p.gender===G.gender;
    const choices=sameGender
      ? [
        {t:'👶 Start adoption plan',e:{partnerLove:6,happiness:7,stress:3},chance:0.52,attempt:true,adoption:true},
        {t:'🏡 Prepare the home first',e:{partnerLove:7,happiness:5,stress:-5},chance:0.40,attempt:true,adoption:true},
        {t:'Not right now',e:{partnerLove:2,happiness:2,stress:-4}},
      ]
      : [
        {t:'👶 Try naturally',e:{partnerLove:5,partnerIntimacy:8,happiness:7,stress:-3},chance:this._fertilityChance(p,'natural'),attempt:true},
        {t:'🍼 Plan carefully',e:{partnerLove:7,partnerIntimacy:4,happiness:6,stress:-6},chance:this._fertilityChance(p,'prepared'),attempt:true},
        {t:'Not right now',e:{partnerLove:2,happiness:2,stress:-4}},
      ];

    UI.showEvent({
      icon:'👶',
      type:'special',
      title:'Family Planning',
      text:sameGender
        ? `You and ${p.name} talk seriously about becoming parents. This will take time, money, and a stable home.`
        : `You and ${p.name} talk seriously about trying for a baby. It may happen, it may not, and it will change next year.`,
      choices,
    },choice=>{
      if(!choice){
        UI.update(); this.render(); return;
      }
      if(!choice.attempt){
        Engine.log(`👶 You and ${p.name} decided not to rush parenthood this year.`,'love');
        UI.update(); this.render(); return;
      }
      fp.lastAttemptAge=G.age;
      const started=this._startPregnancy({
        kind:choice.adoption?'adoption':'planned',
        chance:choice.chance||0,
        partner:p,
        adoption:!!choice.adoption,
      });
      if(!started){
        G.stress=cl((G.stress||0)+r(1,4));
        Engine.log(choice.adoption
          ? `👶 You and ${p.name} started the parenthood process, but nothing is finalized yet. Try again next year.`
          : `👶 You and ${p.name} tried for a baby, but no pregnancy happened this year. Try again next year.`,'neutral');
      }
      UI.update(); this.render();
    });
  },

  _fertilityChance(p,mode){
    const G=window.G;
    const pregnancyAge=G.gender==='female'?G.age:(p?.age||G.age);
    let chance=0.44;
    if(pregnancyAge>=30)chance-=0.06;
    if(pregnancyAge>=36)chance-=0.10;
    if(pregnancyAge>=42)chance-=0.12;
    if(pregnancyAge>=48)chance-=0.10;
    if(mode==='prepared')chance+=0.10;
    if((p?.love||0)>70)chance+=0.04;
    if(p?.married||p?.livingTogether)chance+=0.04;
    return Math.max(0.04,Math.min(0.64,chance));
  },

  _startPregnancy({kind='planned',chance=1,partner=null,adoption=false}={}){
    const G=window.G;
    if(!G)return false;
    const fp=this._familyState();
    if(fp.pregnant)return false;
    if((G.rels.children||[]).length>=8)return false;
    if(Math.random()>=chance)return false;
    if(!adoption){
      if(partner&&partner.gender===G.gender)return false;
      const pregnancyAge=G.gender==='female'?G.age:(partner?.age||G.age);
      if(pregnancyAge<18||pregnancyAge>58)return false;
    }
    fp.pregnant=true;
    fp.dueAge=G.age+1;
    fp.partnerName=partner?.name||'';
    fp.kind=adoption?'adoption':kind;
    if(adoption){
      Engine.log(`👶 You and ${fp.partnerName||'your partner'} were approved to adopt. A child should join the family next birthday.`,'special');
    }else if(kind==='unexpected'){
      Engine.log(`👶 Unexpected pregnancy news after intimacy with ${fp.partnerName||'someone'}. The baby is due next birthday.`,'special');
    }else{
      Engine.log(`👶 Pregnancy news! ${fp.partnerName||'Your partner'} and you are expecting a baby next birthday.`,'special');
    }
    return true;
  },

  _birthBaby(){
    const G=window.G;
    const fp=this._familyState();
    if(!fp.pregnant)return;
    const child=Engine.npc('child',Math.random()>0.5?'female':'male');
    child.age=0;
    child.surname=G.surname;
    if(!G.rels.children)G.rels.children=[];
    G.rels.children.push(child);
    G.happiness=cl(G.happiness+r(12,22));
    G.stress=cl((G.stress||0)+r(3,8));
    G.money=Math.max(0,G.money-sc(fp.kind==='adoption'?3500:5000));
    const partnerName=fp.partnerName||G.rels.partner?.name||'';
    const adopted=fp.kind==='adoption';
    fp.pregnant=false;
    fp.dueAge=null;
    fp.lastBabyAge=G.age;
    fp.partnerName='';
    fp.kind='';
    Engine.log(adopted
      ? `👶 ${partnerName?partnerName+' and you':'You'} adopted baby ${child.name}. A new family chapter begins.`
      : `👶 ${partnerName?partnerName+' and you':'You'} welcomed baby ${child.name} into the world. Pure chaos, pure love.`,'special');
    Engine.checkAch();
  },

  _protectionChoice({title,text,partner,affair,kind}){
    const isRelationship=kind==='intimate';
    const mk=(label,e,risk,preg,flags={})=>({t:label,e,risk,preg,...flags});
    const choices=[
      mk('🛡️ Use condom',
        isRelationship
          ? {partnerLove:4,partnerIntimacy:10,happiness:11,health:1,stress:-4,safeDating:2}
          : {happiness:10,health:1,stress:-3,safeDating:2,karma:kind==='cheat'?-4:0},
        0.015,0.015,{protected:true}),
      mk('🔥 Without condom',
        isRelationship
          ? {partnerLove:3,partnerIntimacy:14,happiness:14,stress:-3}
          : {happiness:13,stress:-2,karma:kind==='cheat'?-8:0},
        0.12,0.14,{unprotected:true}),
      mk('💬 Slow down and check in',
        isRelationship
          ? {partnerLove:7,partnerIntimacy:6,happiness:8,stress:-9,safeDating:4,karma:2}
          : {happiness:5,stress:-8,safeDating:3,karma:kind==='cheat'?2:1},
        0,0,{pause:true}),
    ];

    UI.showEvent({
      icon:'🛡️',
      type:'sexy',
      title,
      text,
      choices,
    },choice=>{
      if(!choice)return;
      if(kind==='cheat'){
        this._resolveCheat(partner,choice,affair);
      }else if(kind==='hookup'){
        if(choice.pause){
          Engine.log(`💬 You and ${partner.name} slowed down, talked honestly, and kept the night respectful.`,'love');
        }else{
          this._stdRisk(choice.risk||0);
          this._pregnancyRisk(choice.preg||0,partner);
          Engine.log(choice.protected
            ? `🌙 You and ${partner.name} had a passionate one-night stand and used protection. Fun, adult, and no strings attached.`
            : `🌙 You and ${partner.name} had a reckless, passionate one-night stand without protection. Exciting, but risky.`,'sexy');
        }
      }else{
        if(choice.pause){
          Engine.log(`💬 You and ${partner.name} slowed down, checked in with each other, and still ended the night feeling closer.`,'love');
        }else{
          this._stdRisk(choice.risk||0);
          this._pregnancyRisk(choice.preg||0,partner);
          Engine.log(this._intimacyText('intimate',partner),'sexy');
        }
      }
      UI.update(); this.render();
    });
  },

  _resolveCheat(p,choice,affair){
    if(!p)return;
    if(!choice.pause){
      this._stdRisk(choice.risk||0);
      this._pregnancyRisk(choice.preg||0,affair);
    }
    const caughtChance=((p.intimacy||50)>70?0.28:0.50)+(choice.unprotected?0.06:0);
    const caught=Math.random()<caughtChance;
    if(choice.pause){
      Engine.log('💬 You stopped before cheating went further. Complicated night, but you made a better choice.','love');
      return;
    }
    if(!caught){
      const note=choice.protected?'used protection':'did not use protection';
      Engine.log(`🤫 You hooked up with ${affair?.name||'someone else'} and ${note}. ${p.name} suspects nothing... yet.`,'sexy');
    }else{
      if(!window.G.achievements)window.G.achievements={}; window.G.achievements.caught_cheating=true;
      const breaks=Math.random()<0.72;
      if(breaks){
        const pn=p.name; window.G.rels.partner=null; window.G.happiness=cl(window.G.happiness-28);
        Engine.log(`💔 ${pn} found out about your cheating and left immediately. Devastating.`,'bad');
      }else{
        p.love=cl(p.love-35); window.G.happiness=cl(window.G.happiness-18);
        Engine.log(`😠 ${p.name} found out. Trust shattered. Relationship barely holding.`,'bad');
      }
      Engine.checkAch();
    }
  },

  _pregnancyRisk(chance,partner){
    this._startPregnancy({kind:'unexpected',chance,partner});
  },

  _intimacyText(kind,p){
    const lines={
      makeout:[
        `💋 You and ${p.name} ended up kissing on the couch for ages, smiling between every pause. The chemistry felt playful and very real.`,
        `💋 A small kiss with ${p.name} turned into a long, heated make-out session. No rush, just closeness and sparks.`,
        `💋 You pulled ${p.name} close, and the room went quiet in the best way. The flirting finally became something warmer.`,
      ],
      intimate:[
        `🔥 You and ${p.name} spent a slow, passionate night together, full of touch, laughter, whispered check-ins, and the kind of closeness that lingers the next day.`,
        `🔥 The evening with ${p.name} built from teasing looks to deep intimacy. It felt adult, mutual, and emotionally charged.`,
        `🔥 You and ${p.name} shut out the world for the night. The connection was intense, affectionate, and honest from start to finish.`,
      ],
      massage:[
        `💆 You gave ${p.name} a long massage, taking your time until the tension left their shoulders and the mood turned soft and intimate.`,
        `💆 Warm light, slow hands, and quiet conversation made the massage with ${p.name} feel more romantic than expensive dates ever could.`,
        `💆 ${p.name} relaxed completely while you took care of them. It was tender, sensual, and full of trust.`,
      ],
      sext:[
        `📱 You and ${p.name} traded teasing late-night messages until both of you were grinning at your phones like teenagers with adult confidence.`,
        `📱 The messages with ${p.name} got spicy, playful, and surprisingly sweet. The anticipation did half the magic.`,
        `📱 You sent ${p.name} a bold message, and their reply made your heart kick. The chemistry is very much alive.`,
      ],
      roleplay:[
        `🎭 You and ${p.name} planned a private role play night with flirtation, confidence, and clear boundaries. It turned awkwardness into laughter, then chemistry.`,
        `🎭 ${p.name} surprised you by getting fully into the playful mood. The night felt adventurous without losing trust.`,
        `🎭 You both tried something more daring together. It was fun, consensual, a little ridiculous, and very intimate.`,
      ],
      fantasy_talk:[
        `🌶️ You and ${p.name} talked openly about fantasies, turn-ons, limits, and what makes each of you feel wanted. The honesty made everything hotter.`,
        `🌶️ A brave conversation with ${p.name} turned into flirting, laughter, and a much clearer sense of what you both desire.`,
        `🌶️ You asked ${p.name} what they secretly enjoy. The answer made the room feel warmer and the relationship feel more grown-up.`,
      ],
      aftercare:[
        `🫶 After intimacy, you stayed close with ${p.name}, talking softly and making each other feel safe, wanted, and understood.`,
        `🫶 You and ${p.name} lingered afterward, wrapped up together and laughing quietly. The tenderness mattered as much as the passion.`,
        `🫶 You checked in with ${p.name}, shared water, soft words, and a long cuddle. Trust deepened in a way stats can barely measure.`,
      ],
      morning:[
        `☕ You and ${p.name} had a slow morning in bed, warm blankets, lazy kisses, and coffee that went cold because neither of you wanted to move.`,
        `☕ Morning with ${p.name} felt beautifully domestic: messy hair, soft teasing, and the comfort of being completely at ease together.`,
        `☕ You woke up beside ${p.name} and let the day start slowly. It was romantic in the most realistic way.`,
      ],
    };
    return pick(lines[kind])||`💕 You and ${p.name} shared a close, romantic moment.`;
  },

  _stdRisk(chance){
    const G=window.G;
    if(!G.sexualHealth)G.sexualHealth={std:false};
    if((G.sexualHealth.safeDating||0)>0){
      chance*=0.35;
      G.sexualHealth.safeDating=Math.max(0,(G.sexualHealth.safeDating||0)-1);
    }
    if(Math.random()<chance){
      G.sexualHealth.std=true; G.health=cl(G.health-r(3,8));
      Engine.log('⚠️ You may have picked up an STD. Consider getting tested.','bad');
    }
  },
};
