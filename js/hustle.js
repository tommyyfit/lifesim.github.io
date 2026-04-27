/* js/hustle.js — LifeSim v13 Reforged scalable side hustles */

const HUSTLE_GIGS=[
  {id:'yardwork',icon:'🌿',name:'Yard Work',minAge:13,base:[45,170],stat:'fitness',need:G=>(G.fitness||50)>=25,desc:'Manual cash jobs around the neighbourhood'},
  {id:'resell',icon:'📦',name:'Flip Items Online',minAge:14,base:[95,360],stat:'smarts',need:G=>G.smarts>=30||(G.skills?.negotiation||0)>=1,desc:'Buy low, list well, sell for margin'},
  {id:'tutor',icon:'📚',name:'Private Tutoring',minAge:16,base:[190,780],stat:'smarts',need:G=>G.smarts>=55||(G.skills?.psychology||0)>=1,desc:'Help students and charge by the hour'},
  {id:'photo',icon:'📸',name:'Photo Shoot',minAge:16,base:[230,920],stat:'fame',need:G=>(G.skills?.photo||0)>=1||G.looks>=60,desc:'Portraits, parties and social content'},
  {id:'music',icon:'🎸',name:'Local Gig',minAge:16,base:[160,980],stat:'fame',need:G=>(G.skills?.music||0)>=1,desc:'Bars, weddings and paid live sets'},
  {id:'editing',icon:'✍️',name:'Ghostwriting / Editing',minAge:17,base:[190,880],stat:'smarts',need:G=>(G.skills?.writing||0)>=1||(G.skills?.language||0)>=1,desc:'Write, polish and package ideas for others'},
  {id:'coding',icon:'💻',name:'Freelance Coding',minAge:18,base:[450,2400],stat:'smarts',need:G=>(G.skills?.coding||0)>=2||(G.skills?.hacking||0)>=2,desc:'Build websites, fix bugs and automate tasks'},
  {id:'translate',icon:'🗣️',name:'Translation Work',minAge:18,base:[240,1250],stat:'smarts',need:G=>(G.skills?.language||0)>=2,desc:'Documents, subtitles and bilingual support'},
  {id:'coach',icon:'🏋️',name:'Fitness Coaching Session',minAge:18,base:[300,1500],stat:'fitness',need:G=>(G.skills?.fitness||0)>=2||(G.fitness||50)>=72,desc:'Train clients and sell discipline'},
  {id:'escort',icon:'\u{1F48B}',name:'Escort Work',minAge:18,base:[900,4200],stat:'looks',need:G=>(G.looks||50)>=62||(G.skills?.beauty||0)>=1||(G.skills?.public_sp||0)>=1,desc:'Private bookings, charm, discretion and high hourly rates'},
  {id:'sales',icon:'🤝',name:'Commission Sales',minAge:18,base:[320,1900],stat:'smarts',need:G=>(G.skills?.negotiation||0)>=2||(G.skills?.public_sp||0)>=2,desc:'Close deals and earn on performance'},
  {id:'consult',icon:'📊',name:'Consulting Sprint',minAge:21,base:[750,3600],stat:'smarts',need:G=>(G.skills?.finance||0)>=2||(G.skills?.negotiation||0)>=3,desc:'Advisory work for people with money'},
];

const HUSTLE_VENTURES=[
  {id:'resale_page',icon:'🛍️',name:'Resale Flip Page',minAge:14,startCost:80,basePassive:130,workPay:[75,300],progress:'clients',need:G=>G.smarts>=28||(G.skills?.negotiation||0)>=1,unlock:'28+ Smarts or Lv1 Negotiation',desc:'Turn sourcing and bargaining into a small commerce engine.'},
  {id:'tutor_network',icon:'📘',name:'Tutor Network',minAge:16,startCost:70,basePassive:250,workPay:[130,440],progress:'clients',need:G=>G.smarts>=55||(G.skills?.psychology||0)>=1,unlock:'55+ Smarts or Lv1 Psychology',desc:'Recurring students, referrals and premium sessions.'},
  {id:'creator_channel',icon:'🎥',name:'Creator Channel',minAge:16,startCost:120,basePassive:190,workPay:[70,280],progress:'audience',need:G=>(G.looks||50)>=52||(G.skills?.photo||0)>=1||(G.skills?.public_sp||0)>=1,unlock:'Looks 52+, Lv1 Photo, or Lv1 Public Speaking',desc:'Build a personal brand that spills into followers and sponsorships.'},
  {id:'premium_creator',legacyIds:['onlyfans'],icon:'📸',name:'Premium Creator Page',minAge:18,startCost:160,basePassive:380,workPay:[190,920],progress:'audience',need:G=>(G.looks||50)>=60||(G.skills?.beauty||0)>=1||(G.skills?.photo||0)>=1||(G.followers||0)>=1000,unlock:'18+ and looks, beauty/photo skill, or 1K followers',desc:'High-upside subscription content with faster attention, higher stress and brand tradeoffs.'},
  {id:'escort_service',icon:'\u{1F460}',name:'Escort Services',minAge:18,startCost:450,basePassive:1450,workPay:[850,5400],progress:'clients',need:G=>(G.looks||50)>=66||((G.skills?.beauty||0)>=1&&(G.skills?.public_sp||0)>=1)||(G.followers||0)>=2500,unlock:'18+ and strong looks, beauty plus social skill, or 2.5K followers',desc:'A high-end private booking operation built on looks, discretion, repeat clients and reputation.'},
  {id:'dev_shop',icon:'🧑‍💻',name:'Freelance Dev Shop',minAge:18,startCost:420,basePassive:540,workPay:[280,1300],progress:'clients',need:G=>(G.skills?.coding||0)>=2||(G.skills?.hacking||0)>=2,unlock:'Lv2 Coding or Lv2 Hacking',desc:'Retainers, bug-fixes and product builds for clients.'},
  {id:'fitness_brand',icon:'💪',name:'Coaching Brand',minAge:18,startCost:180,basePassive:340,workPay:[160,750],progress:'clients',need:G=>(G.skills?.fitness||0)>=2||(G.fitness||50)>=70,unlock:'Lv2 Fitness or 70+ Fitness',desc:'Sell programs, accountability and one-on-one coaching.'},
  {id:'consulting_practice',icon:'💼',name:'Consulting Practice',minAge:21,startCost:500,basePassive:800,workPay:[350,1750],progress:'clients',need:G=>(G.skills?.finance||0)>=2||(G.skills?.negotiation||0)>=3||(G.smarts||0)>=75,unlock:'Lv2 Finance, Lv3 Negotiation, or 75+ Smarts',desc:'Premium clients pay for judgment, positioning and expertise.'},
];

const Hustle={
  _esc(v){
    if(typeof escHTML==='function')return escHTML(v);
    return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  ensureState(G=window.G){
    if(!G)return;
    const h=G.hustle&&typeof G.hustle==='object'?G.hustle:{};
    G.hustle={
      rep:Number.isFinite(h.rep)?cl(h.rep,0,100):0,
      earnings:Number.isFinite(h.earnings)?Math.max(0,Math.round(h.earnings)):0,
      lastGigAge:Number.isFinite(h.lastGigAge)?h.lastGigAge:-1,
      lastActionAge:Number.isFinite(h.lastActionAge)?h.lastActionAge:(Number.isFinite(h.lastGigAge)?h.lastGigAge:-1),
      streak:Number.isFinite(h.streak)?Math.max(0,Math.round(h.streak)):0,
      clients:Number.isFinite(h.clients)?Math.max(0,Math.round(h.clients)):0,
      ventures:h.ventures&&typeof h.ventures==='object'&&!Array.isArray(h.ventures)?h.ventures:{},
      bestYear:Number.isFinite(h.bestYear)?Math.max(0,Math.round(h.bestYear)):0,
      totalActions:Number.isFinite(h.totalActions)?Math.max(0,Math.round(h.totalActions)):0,
    };

    if(G.hustle.ventures.onlyfans&&!G.hustle.ventures.premium_creator){
      G.hustle.ventures.premium_creator=G.hustle.ventures.onlyfans;
      G.hustle.ventures.premium_creator.id='premium_creator';
      delete G.hustle.ventures.onlyfans;
    }

    if(G.hustle.ventures.creator_channel){
      const legacy=G.hustle.ventures.creator_channel;
      G.followers=(G.followers||0)+Math.max(150,Math.round((legacy.audience||0)*0.65));
      G.fame=cl((G.fame||0)+Math.max(2,Math.round((legacy.level||1)*1.5)));
      if(typeof Social!=='undefined'&&Social.ensure){
        Social.ensure();
        const S=G.social||{};
        S.contentSkill=cl((S.contentSkill||35)+Math.max(4,(legacy.level||1)*4),0,100);
        S.consistency=cl((S.consistency||45)+Math.max(3,Math.round((legacy.momentum||35)/10)),0,100);
        S.audienceQuality=cl((S.audienceQuality||45)+Math.max(3,Math.round((legacy.quality||45)/12)),0,100);
      }
      Engine.log('🎥 Your old Creator Channel was folded into Social growth and followers.', 'neutral');
      delete G.hustle.ventures.creator_channel;
    }

    Object.entries(G.hustle.ventures).forEach(([id,v])=>{
      if(!v||typeof v!=='object'){delete G.hustle.ventures[id];return;}
      const def=this._ventureDef(id);
      if(!def){delete G.hustle.ventures[id];return;}
      v.id=def.id;
      v.level=Number.isFinite(v.level)?Math.max(1,Math.min(6,Math.round(v.level))):1;
      v.progress=Number.isFinite(v.progress)?cl(v.progress,0,100):0;
      v.momentum=Number.isFinite(v.momentum)?cl(v.momentum,0,100):35;
      v.audience=Number.isFinite(v.audience)?Math.max(0,Math.round(v.audience)):0;
      v.clients=Number.isFinite(v.clients)?Math.max(0,Math.round(v.clients)):0;
      v.earned=Number.isFinite(v.earned)?Math.max(0,Math.round(v.earned)):0;
      v.startedAge=Number.isFinite(v.startedAge)?v.startedAge:(G.age||0);
      v.lastWorkedAge=Number.isFinite(v.lastWorkedAge)?v.lastWorkedAge:-1;
      v.brandRisk=Number.isFinite(v.brandRisk)?cl(v.brandRisk,0,100):this._defaultBrandRisk(def);
      v.quality=Number.isFinite(v.quality)?cl(v.quality,0,100):45;
    });
    G.hustle.clients=Object.values(G.hustle.ventures||{}).reduce((sum,v)=>sum+(v.clients||0),0);
  },

  availableGigs(G=window.G){
    this.ensureState(G);
    return HUSTLE_GIGS.filter(g=>(G.age||0)>=g.minAge&&g.need(G));
  },

  activeVentures(G=window.G){
    this.ensureState(G);
    return Object.values(G.hustle.ventures||{});
  },

  ventureLimit(G=window.G){
    const skillDepth=Object.values(G.skills||{}).filter(v=>v>=3).length;
    if((G.hustle?.rep||0)>=75||skillDepth>=5)return 3;
    if((G.hustle?.rep||0)>=35||skillDepth>=2)return 2;
    return 1;
  },

  projectedIncome(G=window.G){
    this.ensureState(G);
    return this.activeVentures(G).reduce((sum,v)=>{
      const def=this._ventureDef(v.id);
      return sum+(def?this._ventureAnnualPayout(v,def,G):0);
    },0);
  },

  portfolioQuality(G=window.G){
    const ventures=this.activeVentures(G);
    if(!ventures.length)return{label:'No portfolio',color:'var(--muted)',score:0};
    const score=Math.round(ventures.reduce((s,v)=>s+(v.quality||45)+(v.momentum||35)+(v.level||1)*8-(v.brandRisk||0)*0.25,0)/ventures.length);
    if(score>=80)return{label:'Elite machine',color:'var(--green)',score};
    if(score>=60)return{label:'Strong engine',color:'var(--teal)',score};
    if(score>=40)return{label:'Promising',color:'var(--yellow)',score};
    return{label:'Messy',color:'var(--red)',score};
  },

  render(){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    const el=document.getElementById('tab-hustle');
    if(!el)return;

    if((G.age||0)<13){
      el.innerHTML='<div class="empty"><span class="ei">🧰</span><p>Too young for side hustles.<br>Quick cash starts around age 13, and scalable ventures open as your stats and skills improve.</p></div>';
      return;
    }

    const actionUsed=G.hustle.lastActionAge===G.age;
    const ventures=this.activeVentures(G);
    const ventureLimit=this.ventureLimit(G);
    const startable=this._startableVentures(G);
    const nextIdeas=this._lockedVentures(G).slice(0,3);
    const gigs=this.availableGigs(G);
    const passive=this.projectedIncome(G);
    const quality=this.portfolioQuality(G);
    const repColor=G.hustle.rep>=65?'var(--green)':G.hustle.rep>=35?'var(--yellow)':'var(--muted)';

    let h=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      ${this._metricBox('Hustle Reputation',G.hustle.rep,repColor,G.hustle.rep>=65?'Booked and buzzing':G.hustle.rep>=35?'Trusted locally':'Still building your name')}
      ${this._metricBox('Lifetime Hustle Cash',fmt(G.hustle.earnings||0),'var(--green)',actionUsed?'Major hustle move used this year':'1 major hustle move available this year')}
      ${this._metricBox('Passive Next Year',fmt(passive),passive>0?'var(--accent)':'var(--muted)',ventures.length?`From ${ventures.length} active venture${ventures.length!==1?'s':''}`:'No recurring hustle income yet')}
      ${this._metricBox('Portfolio Quality',quality.score?`${quality.score}/100`:'—',quality.color,`${quality.label} · ${ventures.length}/${ventureLimit} slots`)}
    </div>`;

    h+=`<div class="info-box"><p>💼 Hustles now have two layers: quick gigs for instant cash and ventures that compound yearly. Work one major hustle move per year, build momentum, then let strong ventures pay passively.</p></div>`;

    h+=this._renderActiveVentures(G,ventures,actionUsed);
    h+=this._renderStartableVentures(G,startable,ventures.length,ventureLimit);
    h+=this._renderLockedVentures(nextIdeas);
    h+=this._renderQuickGigs(G,gigs,actionUsed);

    el.innerHTML=h;
  },

  _metricBox(label,value,color,sub){
    return `<div class="nw-box" style="margin-bottom:0">
      <div class="nw-lbl">${this._esc(label)}</div>
      <div class="nw-amt" style="font-size:22px${color?`;color:${color}`:''}">${value}</div>
      <div class="nw-sub">${this._esc(sub)}</div>
    </div>`;
  },

  _renderActiveVentures(G,ventures,actionUsed){
    let h='<div class="sec">Active Ventures</div>';
    if(!ventures.length)return h+`<div class="empty"><p>No active hustle ventures yet.<br>Launch one below to start building recurring income.</p></div>`;

    h+='<div style="display:grid;gap:8px">';
    ventures.forEach(v=>{
      const def=this._ventureDef(v.id);if(!def)return;
      const yearly=this._ventureAnnualPayout(v,def,G);
      const prog=v.level>=6?100:v.progress||0;
      const metricLabel=def.progress==='audience'?'Audience':'Clients';
      const metricValue=def.progress==='audience'?fmtFollowers(v.audience||0):(v.clients||0);
      const cashout=this._cashoutValue(v,def,G);
      const riskColor=(v.brandRisk||0)>=60?'var(--red)':(v.brandRisk||0)>=30?'var(--yellow)':'var(--green)';
      h+=`<div class="row-card" style="display:block">
        <div style="display:flex;gap:12px;align-items:flex-start">
          <span class="ri" style="font-size:24px">${def.icon}</span>
          <div class="rd" style="flex:1;min-width:0">
            <div class="rt">${this._esc(def.name)}</div>
            <div class="rs">${this._esc(def.desc)}</div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px">
              ${this._miniMetric('Level',`Lv ${v.level}`,'var(--accent)')}
              ${this._miniMetric(metricLabel,metricValue,'var(--txt)')}
              ${this._miniMetric('Passive / yr',fmt(yearly),'var(--green)')}
              ${this._miniMetric('Brand Risk',`${v.brandRisk||0}%`,riskColor)}
            </div>
            <div style="margin-top:8px">
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;font-weight:800;color:var(--muted);margin-bottom:4px">
                <span>Momentum ${v.momentum}% · Quality ${v.quality}%</span>
                <span>${v.level>=6?'Max level':`Next level ${prog}%`}</span>
              </div>
              <div class="prog-bar"><div class="prog-fill" style="width:${prog}%;background:${v.level>=6?'var(--yellow)':'var(--accent)'}"></div></div>
            </div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
              <button type="button" class="btn-primary btn-sm" style="width:auto;opacity:${actionUsed?'.55':'1'}" onclick="${actionUsed?'':`Hustle.workVenture('${def.id}')`}" ${actionUsed?'disabled':''}>${actionUsed?'Focus used this year':'Work this year'}</button>
              <button type="button" class="btn-secondary btn-sm" style="width:auto" onclick="Hustle.improveVenture('${def.id}')">Improve ${fmt(this._improveCost(v,def))}</button>
              <button type="button" class="btn-secondary btn-sm" style="width:auto" onclick="Hustle.cashOut('${def.id}')">Cash out ${fmt(cashout)}</button>
              ${this._ventureActionExtras(def,v,G,actionUsed)}
            </div>
          </div>
        </div>
      </div>`;
    });
    return h+'</div>';
  },

  _ventureActionExtras(def,v,G,actionUsed){
    if(def.id!=='premium_creator')return '';
    return `
      <button type="button" class="btn-secondary btn-sm" style="width:auto;opacity:${actionUsed?'.55':'1'}" onclick="${actionUsed?'':`Hustle.onlyFansDrop()`}" ${actionUsed?'disabled':''}>${actionUsed?'Action used':'Exclusive Drop'}</button>
      <button type="button" class="btn-secondary btn-sm" style="width:auto;opacity:${actionUsed?'.55':'1'}" onclick="${actionUsed?'':`Hustle.onlyFansCustoms()`}" ${actionUsed?'disabled':''}>${actionUsed?'Action used':'VIP Customs'}</button>
      <button type="button" class="btn-secondary btn-sm" style="width:auto" onclick="Hustle.onlyFansRebrand()">Brand Refresh</button>
    `;
  },

  _miniMetric(label,value,color){
    return `<div style="background:var(--s1);border:1px solid var(--b1);border-radius:10px;padding:7px 9px">
      <div style="font-size:10px;font-weight:800;color:var(--muted)">${this._esc(label)}</div>
      <div style="font-size:15px;font-weight:900;color:${color}">${value}</div>
    </div>`;
  },

  _renderStartableVentures(G,startable,count,limit){
    let h='<div class="sec">Launch a Venture</div>';
    if(!startable.length){
      const txt=count>=limit?`You are at your venture cap (${limit}/${limit}). Cash out, level up reputation, or build more skills to unlock another slot.`:'Nothing else is unlocked yet.';
      return h+`<div class="empty"><p>${this._esc(txt)}</p></div>`;
    }
    h+='<div style="display:grid;gap:8px">';
    startable.forEach(def=>{
      const cost=sc(def.startCost||0);
      const canAfford=(G.money||0)>=cost;
      h+=`<div class="row-card" style="display:flex;align-items:center;gap:12px">
        <span class="ri">${def.icon}</span>
        <div class="rd" style="flex:1">
          <div class="rt">${this._esc(def.name)}</div>
          <div class="rs">${this._esc(def.desc)} · Start ${fmt(cost)} · Base ${fmt(sc(def.basePassive))}/yr</div>
        </div>
        <button type="button" class="btn-primary btn-sm" style="width:auto;opacity:${canAfford?1:.55}" onclick="Hustle.startVenture('${def.id}')">${canAfford?'Start':'Need cash'}</button>
      </div>`;
    });
    return h+'</div>';
  },

  _renderLockedVentures(nextIdeas){
    if(!nextIdeas.length)return '';
    let h='<div class="sec">What Unlocks Next</div><div style="display:grid;gap:8px">';
    nextIdeas.forEach(def=>{
      h+=`<div class="row-card locked" style="display:flex;align-items:center;gap:12px">
        <span class="ri">${def.icon}</span>
        <div class="rd">
          <div class="rt">${this._esc(def.name)}</div>
          <div class="rs">${this._esc(def.desc)} · Unlock: ${this._esc(def.unlock)}</div>
        </div>
      </div>`;
    });
    return h+'</div>';
  },

  _renderQuickGigs(G,gigs,actionUsed){
    let h='<div class="sec">Quick Cash Gigs</div>';
    if(!gigs.length)return h+`<div class="empty"><p>No quick gigs unlocked yet.<br>Age up, raise stats, or build a few more skills.</p></div>`;
    h+='<div style="display:grid;gap:8px">';
    gigs.forEach(g=>{
      const pay=this._estimateGig(g,G);
      h+=`<div class="row-card ${actionUsed?'locked':''}" onclick="${actionUsed?'':`Hustle.doGig('${g.id}')`}">
        <span class="ri">${g.icon}</span>
        <div class="rd">
          <div class="rt">${this._esc(g.name)}</div>
          <div class="rs">${this._esc(g.desc)} · Typical pay ${fmt(pay[0])}-${fmt(pay[1])}</div>
        </div>
        <div class="rv">${actionUsed?'Come back next year':'Take gig'}</div>
      </div>`;
    });
    return h+'</div>';
  },

  startVenture(id){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    const def=this._ventureDef(id);
    if(!def||(G.age||0)<def.minAge||!def.need(G)){UI.toast('That hustle is not unlocked yet.');return;}
    if(G.hustle.ventures[def.id]){UI.toast('You already run that venture.');return;}
    if(this.activeVentures(G).length>=this.ventureLimit(G)){UI.toast('You cannot manage another active venture yet.');return;}
    const cost=sc(def.startCost||0);
    if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)} to start it.`);return;}

    G.money-=cost;
    G.hustle.ventures[def.id]={
      id:def.id,
      level:1,
      progress:r(18,34),
      momentum:r(28,44),
      audience:def.progress==='audience'?(def.id==='premium_creator'?r(220,850):r(80,260)):0,
      clients:def.progress==='clients'?r(1,3):0,
      earned:0,
      startedAge:G.age,
      lastWorkedAge:-1,
      brandRisk:this._defaultBrandRisk(def),
      quality:r(38,52),
    };

    G.hustle.rep=cl((G.hustle.rep||0)+r(2,5),0,100);
    G.happiness=cl(G.happiness+r(2,6));
    G.stress=cl((G.stress||0)+r(1,4));

    if(def.progress==='audience'){
      G.followers=(G.followers||0)+r(40,180);
      this._touchSocial(def,G,2);
    }

    Engine.log(`${def.icon} Started ${def.name} for ${fmt(cost)}.`, 'special');
    UI.update();this.render();
  },

  doGig(id){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    if((G.age||0)<13){UI.toast('Too young for hustle work.');return;}
    if(G.hustle.lastActionAge===G.age){UI.toast('You already made your big hustle move this year.');return;}

    const g=HUSTLE_GIGS.find(x=>x.id===id);
    if(!g||(G.age||0)<g.minAge||!g.need(G))return;

    const statBoost=(G[g.stat]||50)/125;
    const skillBoost=this._gigSkillBonus(g,G)*.18;
    const repBoost=(G.hustle.rep||0)/185;
    const base=sc(r(g.base[0],g.base[1]));
    const payout=Math.round(base*(1+statBoost+skillBoost+repBoost));
    const continued=G.hustle.lastActionAge===G.age-1;

    G.money=(G.money||0)+payout;
    G.hustle.earnings=(G.hustle.earnings||0)+payout;
    G.hustle.rep=cl((G.hustle.rep||0)+r(4,10),0,100);
    G.hustle.clients=Math.max(0,(G.hustle.clients||0)+r(1,3));
    G.hustle.lastGigAge=G.age;
    G.hustle.lastActionAge=G.age;
    G.hustle.streak=continued?(G.hustle.streak||0)+1:1;
    G.hustle.totalActions=(G.hustle.totalActions||0)+1;
    G.happiness=cl(G.happiness+r(2,7));
    G.stress=cl((G.stress||0)+r(2,7));

    if(['photo','music','sales','escort'].includes(g.id))G.fame=cl((G.fame||0)+r(1,4));
    if(['tutor','coding','consult','editing','translate'].includes(g.id))G.smarts=cl(G.smarts+r(1,3));
    if(['coach','yardwork'].includes(g.id))G.fitness=cl((G.fitness||50)+r(1,3));
    if(['photo','editing'].includes(g.id)&&Math.random()<.45)G.followers=(G.followers||0)+r(30,260);
    if(g.id==='escort'){
      G.looks=cl(G.looks+r(1,3));
      G.happiness=cl(G.happiness+r(1,4));
      if(Math.random()<.35)G.followers=(G.followers||0)+r(20,140);
    }

    Engine.log(`${g.icon} Side hustle: ${g.name} paid ${fmt(payout)} this year.`, 'money');
    UI.update();this.render();
  },

  workVenture(id){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    if(G.hustle.lastActionAge===G.age){UI.toast('You already focused on a hustle this year.');return;}

    const v=G.hustle.ventures[id];
    const def=this._ventureDef(id);
    if(!v||!def)return;

    const skill=this._ventureSkillScore(def,G);
    const statFit=this._ventureStatFit(def,G);
    const repBoost=(G.hustle.rep||0)/140;
    const momentumBoost=(v.momentum||0)/170;
    const levelBoost=(v.level||1)*.11;
    const qualityBoost=(v.quality||45)/220;
    const cashBase=sc(r(def.workPay[0],def.workPay[1]));
    const payout=Math.round(cashBase*(1+skill*.16+statFit+repBoost+momentumBoost+levelBoost+qualityBoost));
    const growth=this._ventureGrowth(def,G,v,skill);
    const progressGain=r(20,34)+(skill*5)+Math.floor((v.momentum||0)/15)+Math.floor((v.quality||45)/18);
    const beforeLevel=v.level;
    const continued=G.hustle.lastActionAge===G.age-1;

    G.money=(G.money||0)+payout;
    G.hustle.earnings=(G.hustle.earnings||0)+payout;
    G.hustle.rep=cl((G.hustle.rep||0)+r(5,11),0,100);
    G.hustle.lastGigAge=G.age;
    G.hustle.lastActionAge=G.age;
    G.hustle.streak=continued?(G.hustle.streak||0)+1:1;
    G.hustle.totalActions=(G.hustle.totalActions||0)+1;

    v.earned=(v.earned||0)+payout;
    v.momentum=cl((v.momentum||0)+r(10,18)+(skill*2),0,100);
    v.quality=cl((v.quality||45)+r(2,6),0,100);
    v.progress=(v.progress||0)+progressGain;
    v.lastWorkedAge=G.age;

    if(def.progress==='audience'){
      v.audience=(v.audience||0)+growth;
      const spill=Math.max(20,Math.round(growth*(def.id==='premium_creator'?.55:.45)));
      G.followers=(G.followers||0)+spill;
    }else{
      const newClients=Math.max(1,Math.round(growth/3));
      v.clients=Math.max(0,(v.clients||0)+newClients);
      G.hustle.clients=(G.hustle.clients||0)+newClients;
    }

    if(def.id==='premium_creator')v.brandRisk=cl((v.brandRisk||40)+r(1,4),0,100);
    if(def.id==='escort_service')v.brandRisk=cl((v.brandRisk||24)+r(1,3),0,100);

    while(v.progress>=100&&v.level<6){
      v.progress-=100;
      v.level++;
      G.hustle.rep=cl((G.hustle.rep||0)+4,0,100);
    }
    if(v.level>=6)v.progress=100;

    this._applyVenturePerks(def,G);
    this._touchSocial(def,G,4);

    const levelTxt=v.level>beforeLevel?` Level up to Lv ${v.level}!`:'';
    const metricTxt=def.progress==='audience'?`+${fmtFollowers(growth)} subscribers / fans`:`+${Math.max(1,Math.round(growth/3))} clients`;
    Engine.log(`${def.icon} ${def.name} generated ${fmt(payout)} and ${metricTxt}.${levelTxt}`,v.level>beforeLevel?'special':'money');
    UI.update();this.render();
  },

  improveVenture(id){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    const v=G.hustle.ventures[id];
    const def=this._ventureDef(id);
    if(!v||!def)return;

    const cost=this._improveCost(v,def);
    if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)} to improve it.`);return;}

    G.money-=cost;
    v.quality=cl((v.quality||45)+r(9,16),0,100);
    v.momentum=cl((v.momentum||35)+r(4,10),0,100);
    v.brandRisk=cl((v.brandRisk||0)-r(3,8),0,100);
    v.progress=cl((v.progress||0)+r(5,12),0,100);
    G.hustle.rep=cl((G.hustle.rep||0)+r(1,4),0,100);
    Engine.log(`🛠️ Improved ${def.name}. Quality and momentum rose, brand risk dropped.`, 'good');
    UI.update();this.render();
  },

  onlyFansDrop(){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    if(G.hustle.lastActionAge===G.age){UI.toast('You already used your major hustle action this year.');return;}
    const def=this._ventureDef('premium_creator');
    const v=G.hustle.ventures.premium_creator;
    if(!def||!v){UI.toast('You need an active OnlyFans venture first.');return;}

    const skill=this._ventureSkillScore(def,G);
    const audienceFactor=Math.min(2.4,Math.max(.2,(v.audience||0)/2600));
    const levelFactor=(v.level||1)*.18;
    const qualityFactor=(v.quality||45)/120;
    const payout=sc(Math.round(r(3500,18000)*(1+skill*.15+((G.looks||50)/90)+((G.fame||0)/100)+audienceFactor+levelFactor+qualityFactor)));
    const growth=Math.max(300,Math.round(r(1200,7200)*(1+skill*.08+audienceFactor*.25+levelFactor+qualityFactor*.35)));
    const continued=G.hustle.lastActionAge===G.age-1;

    G.money=(G.money||0)+payout;
    G.hustle.earnings=(G.hustle.earnings||0)+payout;
    G.hustle.rep=cl((G.hustle.rep||0)+r(6,12),0,100);
    G.hustle.lastGigAge=G.age;
    G.hustle.lastActionAge=G.age;
    G.hustle.streak=continued?(G.hustle.streak||0)+1:1;
    G.hustle.totalActions=(G.hustle.totalActions||0)+1;

    v.earned=(v.earned||0)+payout;
    v.audience=(v.audience||0)+growth;
    v.momentum=cl((v.momentum||0)+r(12,20)+(skill*2),0,100);
    v.quality=cl((v.quality||45)+r(3,7),0,100);
    v.progress=(v.progress||0)+r(24,40)+(skill*4);
    v.brandRisk=cl((v.brandRisk||35)+r(2,6),0,100);

    while(v.progress>=100&&v.level<6){
      v.progress-=100;
      v.level++;
      G.hustle.rep=cl((G.hustle.rep||0)+4,0,100);
    }
    if(v.level>=6)v.progress=100;

    G.followers=(G.followers||0)+Math.max(220,Math.round(growth*.55));
    G.fame=cl((G.fame||0)+r(2,6));
    G.looks=cl(G.looks+r(1,2));
    G.happiness=cl(G.happiness+r(3,8));
    G.stress=cl((G.stress||0)+r(5,10));
    this._touchSocial(def,G,6);

    Engine.log(`${def.icon} Exclusive OnlyFans drop earned ${fmt(payout)} and added ${fmtFollowers(growth)} subscribers.`, 'special');
    UI.update();this.render();
  },

  onlyFansCustoms(){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    if(G.hustle.lastActionAge===G.age){UI.toast('You already used your major hustle action this year.');return;}
    const def=this._ventureDef('premium_creator');
    const v=G.hustle.ventures.premium_creator;
    if(!def||!v){UI.toast('You need an active OnlyFans venture first.');return;}

    const skill=this._ventureSkillScore(def,G);
    const audienceFactor=Math.min(2.8,Math.max(.25,(v.audience||0)/2200));
    const qualityFactor=(v.quality||45)/115;
    const payout=sc(Math.round(r(7000,32000)*(1+skill*.18+((G.looks||50)/95)+((G.fame||0)/120)+audienceFactor+qualityFactor)));
    const growth=Math.max(140,Math.round(r(300,1800)*(1+skill*.06+qualityFactor*.2)));
    const continued=G.hustle.lastActionAge===G.age-1;

    G.money=(G.money||0)+payout;
    G.hustle.earnings=(G.hustle.earnings||0)+payout;
    G.hustle.rep=cl((G.hustle.rep||0)+r(5,10),0,100);
    G.hustle.lastGigAge=G.age;
    G.hustle.lastActionAge=G.age;
    G.hustle.streak=continued?(G.hustle.streak||0)+1:1;
    G.hustle.totalActions=(G.hustle.totalActions||0)+1;

    v.earned=(v.earned||0)+payout;
    v.audience=(v.audience||0)+growth;
    v.momentum=cl((v.momentum||0)+r(8,16)+(skill*2),0,100);
    v.quality=cl((v.quality||45)+r(2,5),0,100);
    v.progress=(v.progress||0)+r(18,32)+(skill*3);
    v.brandRisk=cl((v.brandRisk||35)+r(5,10),0,100);

    while(v.progress>=100&&v.level<6){
      v.progress-=100;
      v.level++;
      G.hustle.rep=cl((G.hustle.rep||0)+4,0,100);
    }
    if(v.level>=6)v.progress=100;

    G.followers=(G.followers||0)+Math.max(90,Math.round(growth*.28));
    G.fame=cl((G.fame||0)+r(1,4));
    G.happiness=cl(G.happiness+r(1,5));
    G.stress=cl((G.stress||0)+r(8,14));
    this._touchSocial(def,G,5);

    Engine.log(`${def.icon} VIP customs on OnlyFans earned ${fmt(payout)} this year.`, 'money');
    UI.update();this.render();
  },

  onlyFansRebrand(){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    const def=this._ventureDef('premium_creator');
    const v=G.hustle.ventures.premium_creator;
    if(!def||!v){UI.toast('You need an active OnlyFans venture first.');return;}

    const cost=sc(Math.round(2400+((v.level||1)*850)+((v.brandRisk||0)*22)));
    if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)} to refresh the brand.`);return;}

    G.money-=cost;
    v.brandRisk=cl((v.brandRisk||35)-r(12,22),0,100);
    v.quality=cl((v.quality||45)+r(6,12),0,100);
    v.momentum=cl((v.momentum||35)+r(4,9),0,100);
    v.progress=cl((v.progress||0)+r(6,12),0,100);
    G.fame=cl((G.fame||0)+r(1,3));
    G.happiness=cl(G.happiness+r(2,5));
    G.stress=cl((G.stress||0)-r(2,6));

    Engine.log(`${def.icon} Rebranded ${def.name}. Quality improved and brand risk came down.`, 'good');
    UI.update();this.render();
  },

  cashOut(id){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    const v=G.hustle.ventures[id];
    const def=this._ventureDef(id);
    if(!v||!def)return;

    const cash=this._cashoutValue(v,def,G);
    if(!confirm(`Cash out ${def.name}?\n\nYou will receive ${fmt(cash)}.\n\nThis removes the venture permanently.`))return;

    G.money=(G.money||0)+cash;
    G.hustle.earnings=(G.hustle.earnings||0)+cash;
    G.hustle.rep=cl((G.hustle.rep||0)+r(1,4),0,100);
    delete G.hustle.ventures[id];
    G.hustle.clients=this.activeVentures(G).reduce((sum,x)=>sum+(x.clients||0),0);
    Engine.log(`${def.icon} Cashed out ${def.name} for ${fmt(cash)}.`, 'money');
    UI.update();this.render();
  },

  tick(){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    const ventures=this.activeVentures(G);
    const workedLastYear=(G.hustle.lastActionAge||-1)===G.age-1;

    if(!ventures.length){
      if(!workedLastYear)G.hustle.streak=0;
      return;
    }

    let total=0;
    ventures.forEach(v=>{
      const def=this._ventureDef(v.id);if(!def)return;
      let annual=this._ventureAnnualPayout(v,def,G);
      const freshness=workedLastYear?1:.82;
      annual=Math.round(annual*freshness*Math.max(.7,.8+(v.momentum||0)/160));

      if(annual>0){
        G.money=(G.money||0)+annual;
        G.hustle.earnings=(G.hustle.earnings||0)+annual;
        v.earned=(v.earned||0)+annual;
        total+=annual;
      }

      if(def.progress==='audience'){
        const drift=workedLastYear?r(20,120):Math.max(40,Math.round((v.audience||0)*.07));
        v.audience=Math.max(0,(v.audience||0)-drift);
        if(workedLastYear&&Math.random()<.18){
          const spill=Math.max(15,Math.round((v.audience||0)*.015));
          G.followers=(G.followers||0)+spill;
        }
      }else{
        const clientLoss=workedLastYear?0:r(0,2);
        v.clients=Math.max(0,(v.clients||0)-clientLoss);
      }

      v.momentum=cl((v.momentum||0)-(workedLastYear?r(2,6):r(8,14)),0,100);
      v.quality=cl((v.quality||45)-r(0,2),0,100);

      if((v.brandRisk||0)>=70&&Math.random()<.12){
        G.fame=cl((G.fame||0)-r(1,4));
        G.stress=cl((G.stress||0)+r(3,8));
        Engine.log(`⚠️ Brand controversy around ${def.name} created stress and hurt reputation.`, 'bad');
      }

      if(v.momentum>=82&&Math.random()<.16){
        const breakout=sc(r(150,1200)+(v.level*120));
        G.money=(G.money||0)+breakout;
        G.hustle.earnings=(G.hustle.earnings||0)+breakout;
        v.earned=(v.earned||0)+breakout;
        total+=breakout;
        Engine.log(`${def.icon} ${def.name} had a breakout year and added ${fmt(breakout)}.`, 'special');
      }
    });

    G.hustle.clients=ventures.reduce((sum,v)=>sum+(v.clients||0),0);
    G.hustle.bestYear=Math.max(G.hustle.bestYear||0,total);
    if(total>0)Engine.log(`💼 Your hustle portfolio brought in ${fmt(total)} this year.`, 'money');
    if(!workedLastYear)Engine.log('📉 Your side hustles cooled off because you did not push them last year.', 'neutral');

    if((G.hustle.rep||0)>=45&&Math.random()<.18){
      const referral=sc(r(180,900)+Math.round((G.hustle.rep||0)*7));
      G.money=(G.money||0)+referral;
      G.hustle.earnings=(G.hustle.earnings||0)+referral;
      Engine.log(`🧾 Repeat clients and referrals added ${fmt(referral)}.`, 'money');
    }

    if(!workedLastYear)G.hustle.streak=0;
  },

  _premiumCreatorOverrides(){
    return{
      icon:'\u{1F4F8}',
      name:'OnlyFans',
      startCost:220,
      basePassive:2600,
      workPay:[1800,12500],
      desc:'A subscription page with serious upside, fast audience growth, high stress and real brand risk.',
    };
  },

  _ventureDef(id){
    const def=HUSTLE_VENTURES.find(v=>v.id===id||v.legacyIds?.includes(id))||null;
    if(!def)return null;
    if(def.id==='creator_channel')return null;
    if(def.id==='premium_creator')return{...def,...this._premiumCreatorOverrides()};
    return def;
  },

  _startableVentures(G){
    return HUSTLE_VENTURES.map(def=>this._ventureDef(def.id)).filter(Boolean).filter(def=>(G.age||0)>=def.minAge&&def.need(G)&&!G.hustle.ventures[def.id]&&this.activeVentures(G).length<this.ventureLimit(G));
  },

  _lockedVentures(G){
    return HUSTLE_VENTURES.map(def=>this._ventureDef(def.id)).filter(Boolean).filter(def=>!G.hustle.ventures[def.id]&&((G.age||0)<def.minAge||!def.need(G)));
  },

  _estimateGig(g,G){
    const skill=this._gigSkillBonus(g,G);
    return[sc(Math.round(g.base[0]*(1+skill*.12))),sc(Math.round(g.base[1]*(1+skill*.22)))];
  },

  _gigSkillBonus(g,G){
    const s=G.skills||{};
    if(g.id==='photo')return(s.photo||0)+(s.beauty||0);
    if(g.id==='music')return(s.music||0)+(s.public_sp||0);
    if(g.id==='coding')return(s.coding||0)+(s.hacking||0);
    if(g.id==='translate')return(s.language||0);
    if(g.id==='coach')return(s.fitness||0)+(s.psychology||0);
    if(g.id==='escort')return(s.beauty||0)+(s.public_sp||0)+(s.psychology||0)*.5;
    if(g.id==='sales')return(s.negotiation||0)+(s.public_sp||0);
    if(g.id==='consult')return(s.finance||0)+(s.negotiation||0);
    if(g.id==='tutor')return(s.psychology||0)+(s.language||0);
    if(g.id==='editing')return(s.writing||0)+(s.language||0);
    if(g.id==='resell')return(s.negotiation||0)+(s.finance||0);
    return 0;
  },

  _ventureSkillScore(def,G){
    const s=G.skills||{};
    if(def.id==='resale_page')return(s.negotiation||0)+(s.finance||0)+(s.mechanics||0)*.5;
    if(def.id==='tutor_network')return(s.psychology||0)+(s.language||0)+(s.writing||0)*.5;
    if(def.id==='creator_channel')return(s.photo||0)+(s.public_sp||0)+(s.beauty||0)*.5;
    if(def.id==='premium_creator')return(s.beauty||0)+(s.photo||0)+(s.public_sp||0)*.5;
    if(def.id==='escort_service')return(s.beauty||0)+(s.public_sp||0)+(s.negotiation||0)*.5+(s.psychology||0)*.5;
    if(def.id==='dev_shop')return(s.coding||0)+(s.hacking||0);
    if(def.id==='fitness_brand')return(s.fitness||0)+(s.psychology||0)+(s.public_sp||0)*.5;
    if(def.id==='consulting_practice')return(s.finance||0)+(s.negotiation||0)+(s.public_sp||0)*.5;
    return 0;
  },

  _ventureStatFit(def,G){
    if(def.id==='resale_page')return Math.max(.12,(G.smarts||50)/100);
    if(def.id==='tutor_network')return Math.max(.15,(G.smarts||50)/95);
    if(def.id==='creator_channel')return((G.looks||50)+(G.fame||0)+Math.min(100,G.happiness||50))/180;
    if(def.id==='premium_creator')return((G.looks||50)+(G.fame||0)+(G.happiness||50))/120;
    if(def.id==='escort_service')return((G.looks||50)+(G.fame||0)+(G.happiness||50))/145;
    if(def.id==='dev_shop')return((G.smarts||50)+Math.max(45,G.health||50))/150;
    if(def.id==='fitness_brand')return(((G.fitness||50)+(G.health||50))/150);
    if(def.id==='consulting_practice')return((G.smarts||50)+(G.fame||0)+(G.happiness||50))/180;
    return .5;
  },

  _ventureAnnualPayout(v,def,G){
    const skill=this._ventureSkillScore(def,G);
    const statFit=this._ventureStatFit(def,G);
    const level=(v.level||1)-1;
    const repBoost=(G.hustle?.rep||0)/150;
    const qualityBoost=(v.quality||45)/180;
    const riskDrag=(v.brandRisk||0)/500;
    const base=def.basePassive*(1+level*.34+skill*.12+statFit*.35+repBoost+qualityBoost-riskDrag);
    const scale=def.progress==='audience'?(v.audience||0)*(def.id==='premium_creator'?1.15:.16):(v.clients||0)*(110+(skill*18)+(level*25));
    return sc(Math.max(0,Math.round(base+scale)));
  },

  _ventureGrowth(def,G,v,skill){
    const level=v.level||1;
    const momentum=Math.max(18,v.momentum||35);
    const quality=(v.quality||45)/100;
    if(def.progress==='audience'){
      const fameFit=1+((G.fame||0)/160)+((G.looks||50)/220);
      const base=def.id==='premium_creator'?r(850,5200):r(180,1350);
      return Math.max(40,Math.round(base*fameFit*(1+skill*.08+(momentum/150)+(level*.06)+quality*.25)));
    }
    const base=r(2,8)+(skill*.55)+(momentum/26)+(level*.5)+quality*2;
    return Math.max(2,Math.round(base));
  },

  _cashoutValue(v,def,G){
    const base=(def.basePassive*1.8)+(v.level*240)+(v.momentum*18)+(v.progress*12)+(v.quality*16);
    const scale=def.progress==='audience'?(v.audience||0)*(def.id==='premium_creator'?3.1:1.1):(v.clients||0)*185;
    const reputation=((G.hustle?.rep||0)*14);
    const riskPenalty=(v.brandRisk||0)*10;
    return sc(Math.max(50,Math.round(base+scale+reputation-riskPenalty)));
  },

  _improveCost(v,def){
    return sc(Math.round((def.startCost||100)*(1.2+(v.level||1)*.35)+((v.quality||45)*4)));
  },

  _defaultBrandRisk(def){
    if(def.id==='premium_creator')return 35;
    if(def.id==='escort_service')return 24;
    if(def.id==='creator_channel')return 12;
    if(def.id==='consulting_practice')return 8;
    return 4;
  },

  _applyVenturePerks(def,G){
    if(def.id==='creator_channel'){
      G.fame=cl((G.fame||0)+r(1,4));
      G.happiness=cl(G.happiness+r(3,7));
      G.stress=cl((G.stress||0)+r(2,6));
    }else if(def.id==='premium_creator'){
      G.fame=cl((G.fame||0)+r(3,7));
      G.looks=cl(G.looks+r(1,4));
      G.happiness=cl(G.happiness+r(3,8));
      G.stress=cl((G.stress||0)+r(4,10));
      G.karma=cl((G.karma||0)-r(0,2),-100,100);
    }else if(def.id==='escort_service'){
      G.fame=cl((G.fame||0)+r(2,5));
      G.looks=cl(G.looks+r(1,3));
      G.happiness=cl(G.happiness+r(2,6));
      G.stress=cl((G.stress||0)+r(3,8));
    }else if(def.id==='dev_shop'){
      G.smarts=cl(G.smarts+r(1,4));
      G.stress=cl((G.stress||0)+r(2,7));
    }else if(def.id==='fitness_brand'){
      G.fitness=cl((G.fitness||50)+r(1,4));
      G.health=cl(G.health+r(1,3));
      G.stress=cl((G.stress||0)+r(1,5));
    }else if(def.id==='consulting_practice'){
      G.smarts=cl(G.smarts+r(1,3));
      G.fame=cl((G.fame||0)+r(1,3));
      G.stress=cl((G.stress||0)+r(3,8));
    }else if(def.id==='tutor_network'){
      G.smarts=cl(G.smarts+r(1,3));
      G.happiness=cl(G.happiness+r(2,5));
    }else if(def.id==='resale_page'){
      G.smarts=cl(G.smarts+r(1,2));
      G.happiness=cl(G.happiness+r(1,4));
    }
  },

  _touchSocial(def,G,amt){
    if(typeof Social==='undefined'||!Social.ensure)return;
    Social.ensure();
    const S=G.social||{};
    if(def.id==='creator_channel'){
      S.contentSkill=cl((S.contentSkill||35)+amt);
      S.consistency=cl((S.consistency||45)+Math.max(1,Math.floor(amt/2)));
      S.audienceQuality=cl((S.audienceQuality||45)+Math.max(1,Math.floor(amt/2)));
      S.burnout=cl((S.burnout||0)+Math.max(1,Math.floor(amt/2)));
    }else if(def.id==='premium_creator'){
      S.contentSkill=cl((S.contentSkill||35)+amt);
      S.reputation=cl((S.reputation||60)+1);
      S.brandSafety=cl((S.brandSafety||60)-Math.max(1,Math.floor(amt/2)));
      S.burnout=cl((S.burnout||0)+Math.max(2,Math.floor(amt/2)+1));
    }else if(def.id==='escort_service'){
      S.reputation=cl((S.reputation||60)+1);
      S.brandSafety=cl((S.brandSafety||60)-Math.max(1,Math.floor(amt/3)));
      S.burnout=cl((S.burnout||0)+Math.max(1,Math.floor(amt/2)));
    }
  },
};
