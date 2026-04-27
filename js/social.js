/* js/social.js — LifeSim v13 */
const Social={
  platforms:{
    short:{icon:'🎞️',name:'Short Video',desc:'Fast discovery, viral spikes, higher burnout',growth:1.35,engagement:1.05,burnout:3,monetization:.95,skill:'consistency'},
    long:{icon:'🎬',name:'Long Video',desc:'Slower grind, stronger sponsors and archives',growth:1.05,engagement:1.15,burnout:2,monetization:1.15,skill:'contentSkill'},
    photo:{icon:'📸',name:'Photo Feed',desc:'Looks, lifestyle, travel, visual branding',growth:.95,engagement:1.0,burnout:1,monetization:.95,skill:'looks'},
    writing:{icon:'✍️',name:'Writing',desc:'Smarts-led audience with loyal readers',growth:.82,engagement:1.3,burnout:1,monetization:1.05,skill:'smarts'},
    audio:{icon:'🎙️',name:'Podcasting',desc:'Slow growth, deep trust, excellent monetization',growth:.75,engagement:1.25,burnout:1,monetization:1.25,skill:'reputation'},
  },

  niches:{
    lifestyle:{icon:'✨',name:'Lifestyle',stat:'looks',desc:'Beauty, daily life, trends'},
    education:{icon:'🎓',name:'Education',stat:'smarts',desc:'Teaching, tutorials, advice'},
    fitness:{icon:'🏋️',name:'Fitness',stat:'fitness',desc:'Training, food, discipline'},
    comedy:{icon:'🎭',name:'Comedy',stat:'happiness',desc:'Personality and relatability'},
    finance:{icon:'💳',name:'Finance',stat:'smarts',desc:'Money, careers, investing'},
    fame:{icon:'⭐',name:'Celebrity',stat:'fame',desc:'Public persona and status'},
    gaming:{icon:'🎮',name:'Gaming',stat:'smarts',desc:'Streams, clips, guides, reactions'},
    art:{icon:'🎨',name:'Art & Design',stat:'looks',desc:'Creative projects and visual identity'},
  },

  postTypes:{
    quick:{icon:'⚡',name:'Quick Post',desc:'Low effort, reliable small growth',cost:0,stress:0,req:null},
    quality:{icon:'🎥',name:'Quality Upload',desc:'Better growth, improves creator skill',cost:0,stress:3,req:null},
    trend:{icon:'🔥',name:'Chase Trend',desc:'Viral upside, reputation and brand risk',cost:0,stress:4,req:null},
    series:{icon:'📚',name:'Content Series',desc:'Builds loyal audience and long-term trust',cost:0,stress:2,req:null},
    live:{icon:'📡',name:'Go Live',desc:'Tips, engagement, burnout risk',cost:0,stress:2,req:null},
    collab:{icon:'🤝',name:'Collaborate',desc:'Cross-pollinate audiences',cost:0,stress:2,req:{followers:1000,label:'1K followers'}},
    premium:{icon:'💎',name:'Premium Drop',desc:'High-effort flagship content',cost:250,stress:5,req:{followers:5000,label:'5K followers'}},
    documentary:{icon:'🎞️',name:'Mini Documentary',desc:'Big reputation play, expensive to produce',cost:1200,stress:6,req:{smarts:45,label:'45+ Smarts'}},
  },

  render(){
    const G=window.G;if(!G)return;
    this.ensure();

    const el=document.getElementById('tab-social');
    if(!el)return;

    const S=G.social;
    const f=G.followers||0;
    const tier=this.tier(f);
    const platform=this.platforms[S.platform]||this.platforms.short;
    const niche=this.niches[S.niche]||this.niches.lifestyle;
    const yearly=this.projectedIncome();
    const engagement=this.engagementRate();
    const next=this.nextTier(f);
    const progress=next?Math.min(100,Math.round(f/next.need*100)):100;
    const forecast=this.growthForecast();
    const health=this.creatorHealth();
    const trend=this.currentTrend();

    const repCol=this.colorFor(S.reputation,'goodHigh');
    const burnCol=this.colorFor(S.burnout,'badHigh');
    const brandCol=this.colorFor(S.brandSafety,'goodHigh');
    const consistencyCol=this.colorFor(S.consistency,'goodHigh');

    const lastPost=S.lastPost?this.lastPostHTML(S.lastPost):this.emptyStateHTML();
    const alerts=this.alertsHTML();

    el.innerHTML=`
      ${alerts}

      <div class="fame-card" style="text-align:left;overflow:hidden;position:relative">
        <div style="position:absolute;inset:auto -30px -45px auto;width:140px;height:140px;border-radius:50%;background:${tier.c}22;filter:blur(12px);pointer-events:none"></div>
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;position:relative">
          <div style="width:58px;height:58px;border-radius:18px;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:30px;box-shadow:0 8px 24px rgba(0,0,0,.25)">${this.esc(tier.icon)}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <div style="font-size:24px;font-weight:900;color:${tier.c};line-height:1">${fmtFollowers(f)}</div>
              ${S.verified?'<span class="badge badge-a">✅ Verified</span>':''}
              ${S.manager?'<span class="badge badge-g">🧑‍💼 Manager</span>':''}
              ${S.membership?'<span class="badge badge-p">🔒 Membership</span>':''}
            </div>
            <div style="font-size:11px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:4px">${this.esc(tier.label)}</div>
            <div style="font-size:12px;color:var(--txt);font-weight:800;margin-top:5px">${this.esc(platform.icon)} ${this.esc(platform.name)} · ${this.esc(niche.icon)} ${this.esc(niche.name)}</div>
          </div>
        </div>

        <div style="height:8px;background:var(--s3);border-radius:999px;overflow:hidden;margin-bottom:7px;position:relative">
          <div style="height:100%;width:${progress}%;background:${tier.c};border-radius:999px"></div>
        </div>
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:11px;color:var(--muted);font-weight:700">
          <span>${next?`${fmtFollowers(Math.max(0,next.need-f))} followers to ${this.esc(next.label)}`:'You are at the top creator tier.'}</span>
          <span title="Projected next active post growth">↗ ${fmtFollowers(forecast.low)}–${fmtFollowers(forecast.high)}</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">
        ${this.metricBox('Engagement',engagement+'%','Audience quality '+Math.round(S.audienceQuality)+'%','var(--cyan)')}
        ${this.metricBox('Projected Income',fmt(yearly)+'/yr','Lifetime '+fmt(G.socialEarnings||0),'var(--yellow)')}
        ${this.metricBox('Reputation',Math.round(S.reputation)+'%','Brand safety '+Math.round(S.brandSafety)+'%',repCol)}
        ${this.metricBox('Creator Burnout',Math.round(S.burnout)+'%','Consistency '+Math.round(S.consistency)+'%',burnCol)}
      </div>

      <div style="display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:12px">
        <div class="info-box" style="margin:0;border-color:${health.color}55;background:${health.color}10">
          <p style="margin:0"><strong>${health.icon} Creator Health:</strong> <span style="color:${health.color};font-weight:900">${health.label}</span> · ${this.esc(health.text)}</p>
        </div>
        <div class="info-box" style="margin:0;border-color:var(--accent)55;background:var(--accent)10">
          <p style="margin:0"><strong>${this.esc(trend.icon)} Platform Trend:</strong> ${this.esc(trend.label)} · <span style="color:var(--muted)">${this.esc(trend.desc)}</span></p>
        </div>
        ${lastPost}
      </div>

      <div class="sec">Creator Dashboard</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">
        ${this.progressBox('Content Skill',S.contentSkill,'🎥','var(--accent)')}
        ${this.progressBox('Consistency',S.consistency,'📅',consistencyCol)}
        ${this.progressBox('Audience Quality',S.audienceQuality,'🧲','var(--cyan)')}
        ${this.progressBox('Brand Safety',S.brandSafety,'🛡️',brandCol)}
      </div>

      <div class="sec">Creator Strategy</div>
      <div class="act-grid">
        ${Object.entries(this.platforms).map(([id,p])=>this.selectCard({
          active:S.platform===id,
          icon:p.icon,
          name:p.name,
          desc:p.desc,
          meta:`Growth ×${p.growth} · Burnout +${p.burnout}`,
          action:`Social.setPlatform('${id}')`
        })).join('')}
      </div>

      <div class="sec">Content Niche</div>
      <div class="act-grid">
        ${Object.entries(this.niches).map(([id,n])=>this.selectCard({
          active:S.niche===id,
          icon:n.icon,
          name:n.name,
          desc:n.desc,
          meta:`Uses ${this.statName(n.stat)}`,
          action:`Social.setNiche('${id}')`
        })).join('')}
      </div>

      <div class="sec">Create Content</div>
      <div class="act-grid">
        ${Object.entries(this.postTypes).map(([id,p])=>this.actionCard({
          icon:p.icon,
          name:p.name,
          desc:p.desc,
          meta:this.postMeta(id),
          action:`Social.post('${id}')`,
          locked:!this.canPost(id).ok,
          lock:this.canPost(id).reason
        })).join('')}
      </div>

      <div class="sec">Public Image</div>
      <div class="act-grid">
        ${this.actionCard({icon:'📰',name:'Press Interview',desc:'+Fame +Reputation',meta:'Safe credibility boost',action:`Social.fame('interview')`})}
        ${this.actionCard({icon:'🎟️',name:'Public Event',desc:`${fmt(sc(250))} · +Fame`,meta:'+Followers +Looks',action:`Social.fame('event')`,locked:(G.money||0)<sc(250),lock:`Need ${fmt(sc(250))}`})}
        ${this.actionCard({icon:'🤲',name:'Charity Campaign',desc:'+Karma +Brand safety',meta:'Best for clean image',action:`Social.fame('charity')`})}
        ${this.actionCard({icon:'🔥',name:'Court Controversy',desc:'Huge risk, huge reach',meta:'Can destroy reputation',action:`Social.fame('scandal')`,danger:true})}
        ${this.actionCard({icon:'🛡️',name:'Hire PR Help',desc:`${fmt(sc(1200))} · repair image`,meta:'+Reputation +Brand safety',action:`Social.fame('pr')`,locked:(G.money||0)<sc(1200),lock:`Need ${fmt(sc(1200))}`})}
        ${this.actionCard({icon:'🌿',name:'Take Break',desc:'Reduce burnout',meta:'Consistency dips slightly',action:`Social.fame('break')`})}
      </div>

      <div class="sec">Monetization</div>
      <div class="act-grid">
        ${this.monetizeCard('sponsor','💼','Brand Deal','10K followers','Best with high brand safety')}
        ${this.monetizeCard('merch','👕','Launch Merch','10K followers','Better with strong engagement')}
        ${this.monetizeCard('course','🎓','Online Course','55+ Smarts','Boosts authority')}
        ${this.monetizeCard('book','📖','Write Book','No hard requirement','Big prestige swing')}
        ${this.monetizeCard('app','📱','Launch App','60+ Smarts','High upside product')}
        ${this.monetizeCard('membership','🔒','Membership','50K followers','Unlocks recurring income')}
      </div>

      <div class="sec">Creator Operations</div>
      <div class="act-grid">
        ${this.actionCard({icon:'✅',name:'Apply for Verification',desc:'Requires 100K followers + reputation',meta:S.verified?'Already verified':'Public trust boost',action:`Social.ops('verify')`,locked:S.verified||f<100000||S.reputation<65,lock:S.verified?'Already verified':f<100000?'Need 100K followers':'Need 65+ reputation'})}
        ${this.actionCard({icon:'🧑‍💼',name:'Hire Manager',desc:`${fmt(sc(2500))} · improves deals`,meta:S.manager?'Manager hired':'Better sponsorships',action:`Social.ops('manager')`,locked:S.manager||(G.money||0)<sc(2500)||f<25000,lock:S.manager?'Already hired':f<25000?'Need 25K followers':`Need ${fmt(sc(2500))}`})}
        ${this.actionCard({icon:'🧹',name:'Clean Old Posts',desc:'Repair brand safety',meta:`${fmt(sc(600))} · −scandal risk`,action:`Social.ops('cleanup')`,locked:(G.money||0)<sc(600),lock:`Need ${fmt(sc(600))}`})}
        ${this.actionCard({icon:'📊',name:'Study Analytics',desc:'+Audience quality +Skill',meta:'Free · small stress',action:`Social.ops('analytics')`})}
      </div>

      ${this.historyHTML()}
    `;
  },

  ensure(){
    const G=window.G;if(!G)return;
    if(!G.social)G.social={};
    const S=G.social;

    S.platform=S.platform||'short';
    S.niche=S.niche||'lifestyle';
    S.contentSkill=Number.isFinite(S.contentSkill)?S.contentSkill:35;
    S.consistency=Number.isFinite(S.consistency)?S.consistency:45;
    S.audienceQuality=Number.isFinite(S.audienceQuality)?S.audienceQuality:45;
    S.reputation=Number.isFinite(S.reputation)?S.reputation:60;
    S.brandSafety=Number.isFinite(S.brandSafety)?S.brandSafety:60;
    S.burnout=Number.isFinite(S.burnout)?S.burnout:0;
    S.membership=!!S.membership;
    S.verified=!!S.verified;
    S.manager=!!S.manager;
    S.lastPost=S.lastPost||null;
    S.postHistory=Array.isArray(S.postHistory)?S.postHistory:[];
    S.totalPosts=Number.isFinite(S.totalPosts)?S.totalPosts:0;
    S.viralHits=Number.isFinite(S.viralHits)?S.viralHits:0;
    S.bestPost=Number.isFinite(S.bestPost)?S.bestPost:0;
    S.streak=Number.isFinite(S.streak)?S.streak:0;
    S.lastPostAge=Number.isFinite(S.lastPostAge)?S.lastPostAge:null;
    S.trendSeed=Number.isFinite(S.trendSeed)?S.trendSeed:r(0,999999);
    S.trendYear=Number.isFinite(S.trendYear)?S.trendYear:-1;
    S.trendId=S.trendId||'authentic';

    S.contentSkill=cl(S.contentSkill);
    S.consistency=cl(S.consistency);
    S.audienceQuality=cl(S.audienceQuality);
    S.reputation=cl(S.reputation);
    S.brandSafety=cl(S.brandSafety);
    S.burnout=cl(S.burnout);
  },

  tier(f){
    if(f>=5000000)return{label:'Global Celebrity',icon:'🌍',c:'var(--yellow)',rank:6};
    if(f>=1000000)return{label:'Mega Influencer',icon:'💎',c:'var(--yellow)',rank:5};
    if(f>=100000)return{label:'Macro Creator',icon:'⭐',c:'var(--accent)',rank:4};
    if(f>=10000)return{label:'Rising Creator',icon:'🌟',c:'var(--cyan)',rank:3};
    if(f>=1000)return{label:'Niche Creator',icon:'✨',c:'var(--pink)',rank:2};
    return{label:'Getting Started',icon:'👤',c:'var(--muted)',rank:1};
  },

  nextTier(f){
    const tiers=[
      {need:1000,label:'Niche Creator'},
      {need:10000,label:'Rising Creator'},
      {need:100000,label:'Macro Creator'},
      {need:1000000,label:'Mega Influencer'},
      {need:5000000,label:'Global Celebrity'},
    ];
    return tiers.find(t=>f<t.need)||null;
  },

  engagementRate(){
    const G=window.G;this.ensure();
    const S=G.social;
    const p=this.platforms[S.platform]||this.platforms.short;
    const raw=2+(S.audienceQuality/15)+(S.consistency/35)+(S.reputation/45)+(S.verified?0.8:0)+(S.manager?0.3:0);
    const burnPenalty=Math.max(.68,1-(S.burnout||0)/260);
    return Math.max(1,Math.min(22,Math.round(raw*p.engagement*burnPenalty*10)/10));
  },

  projectedIncome(){
    const G=window.G;this.ensure();
    const f=G.followers||0;
    const S=G.social;
    const p=this.platforms[S.platform]||this.platforms.short;
    const base=f*0.012*(this.engagementRate()/5)*p.engagement*p.monetization;
    const repMult=0.55+(S.brandSafety||60)/100;
    const managerMult=S.manager?1.18:1;
    const verifiedMult=S.verified?1.08:1;
    const membership=S.membership?f*0.018*(this.engagementRate()/7):0;
    return sc(Math.floor((base+membership)*repMult*managerMult*verifiedMult));
  },

  statFit(){
    const G=window.G;this.ensure();
    const niche=this.niches[G.social.niche]||this.niches.lifestyle;
    const val=niche.stat==='fitness'?(G.fitness||50):(G[niche.stat]||50);
    return Math.max(.75,Math.min(1.38,val/65));
  },

  growthForecast(){
    const G=window.G;this.ensure();
    const S=G.social;
    const p=this.platforms[S.platform]||this.platforms.short;
    const fit=this.statFit();
    const quality=(S.contentSkill+S.consistency+S.audienceQuality)/300;
    const burnoutPenalty=Math.max(.35,1-(S.burnout||0)/140);
    const trend=this.trendMultiplier();
    const base=Math.max(40,(G.followers||0)*0.015+450);
    const mid=base*p.growth*fit*(.7+quality)*burnoutPenalty*trend;
    return{low:Math.max(0,Math.floor(mid*.45)),high:Math.max(10,Math.floor(mid*1.8))};
  },

  creatorHealth(){
    const G=window.G;this.ensure();
    const S=G.social;
    if(S.burnout>=82)return{icon:'🔥',label:'Burnout Danger',color:'var(--red)',text:'Take a break or your happiness and growth will suffer.'};
    if(S.reputation<35)return{icon:'📉',label:'Reputation Crisis',color:'var(--red)',text:'Brands and followers are losing trust.'};
    if(S.brandSafety<35)return{icon:'⚠️',label:'Brand Risk',color:'var(--orange)',text:'Sponsors may pay less until your image improves.'};
    if(S.consistency<25)return{icon:'📅',label:'Inconsistent',color:'var(--orange)',text:'Post or study analytics to rebuild momentum.'};
    if((G.followers||0)>=100000&&!S.verified)return{icon:'✅',label:'Verification Ready Soon',color:'var(--accent)',text:'Keep reputation high and apply for verification.'};
    return{icon:'💚',label:'Healthy Momentum',color:'var(--green)',text:'Your creator career is stable and ready to scale.'};
  },

  currentTrend(){
    const G=window.G;this.ensure();
    const S=G.social;
    const age=Number.isFinite(G.age)?G.age:0;
    if(S.trendYear!==age){
      const ids=['authentic','educational','shorts','community','premium','controversy'];
      S.trendId=ids[Math.abs((S.trendSeed+age*17+r(0,5)))%ids.length];
      S.trendYear=age;
    }
    const map={
      authentic:{icon:'💬',label:'Authentic Stories',desc:'Reputation and audience quality matter more.',boost:{reputation:1.08,audienceQuality:1.08}},
      educational:{icon:'🎓',label:'Helpful Content',desc:'Education, finance, and writing-style content perform better.',boost:{education:1.18,finance:1.14,writing:1.12}},
      shorts:{icon:'⚡',label:'Short-Form Wave',desc:'Short video gets a discovery boost this year.',boost:{short:1.18}},
      community:{icon:'🤝',label:'Community Era',desc:'Live streams, collabs, and memberships are stronger.',boost:{live:1.14,collab:1.16,membership:1.1}},
      premium:{icon:'💎',label:'Premium Production',desc:'High-quality uploads and documentaries perform better.',boost:{quality:1.14,premium:1.22,documentary:1.18}},
      controversy:{icon:'🔥',label:'Drama Cycle',desc:'Trend chasing grows faster, but scandal risk is higher.',boost:{trend:1.18,scandal:1.15}},
    };
    return map[S.trendId]||map.authentic;
  },

  trendMultiplier(kind='general'){
    const G=window.G;this.ensure();
    const S=G.social;
    const trend=this.currentTrend();
    const boost=trend.boost||{};
    let mult=1;
    if(boost[S.platform])mult*=boost[S.platform];
    if(boost[S.niche])mult*=boost[S.niche];
    if(boost[kind])mult*=boost[kind];
    if(boost.reputation)mult*=.95+((S.reputation||60)/100)*.13;
    if(boost.audienceQuality)mult*=.95+((S.audienceQuality||45)/100)*.15;
    return mult;
  },

  setPlatform(id){
    const G=window.G;this.ensure();
    if(!this.platforms[id])return;

    const S=G.social;
    if(S.platform===id){UI.toast('Already focused on '+this.platforms[id].name+'.');return;}

    S.platform=id;
    S.consistency=cl((S.consistency||45)-4);
    S.burnout=cl((S.burnout||0)+2);
    S.lastPost={text:`You repositioned your brand around ${this.platforms[id].name}. Expect a short adjustment period.`,type:'neutral'};

    Engine.log(`${this.platforms[id].icon} Switched your main platform to ${this.platforms[id].name}.`,'fame');
    UI.update();this.render();
  },

  setNiche(id){
    const G=window.G;this.ensure();
    if(!this.niches[id])return;

    const S=G.social;
    if(S.niche===id){UI.toast('Already creating in '+this.niches[id].name+'.');return;}

    S.niche=id;
    S.audienceQuality=cl((S.audienceQuality||45)+3);
    S.consistency=cl((S.consistency||45)-2);
    S.lastPost={text:`Your audience is learning to know you for ${this.niches[id].name}.`,type:'good'};

    Engine.log(`${this.niches[id].icon} Your content niche is now ${this.niches[id].name}.`,'fame');
    UI.update();this.render();
  },

  canPost(type){
    const G=window.G;this.ensure();
    const def=this.postTypes[type];
    if(!def)return{ok:false,reason:'Unavailable'};
    const req=def.req;
    const cost=sc(def.cost||0);
    if(cost>0&&(G.money||0)<cost)return{ok:false,reason:`Need ${fmt(cost)}`};
    if(!req)return{ok:true,reason:''};
    if(req.followers&&(G.followers||0)<req.followers)return{ok:false,reason:`Need ${req.label}`};
    if(req.smarts&&(G.smarts||0)<req.smarts)return{ok:false,reason:`Need ${req.label}`};
    if(req.fame&&(G.fame||0)<req.fame)return{ok:false,reason:`Need ${req.label}`};
    return{ok:true,reason:''};
  },

  post(type){
    const G=window.G;this.ensure();
    const S=G.social;
    const can=this.canPost(type);
    if(!can.ok){UI.toast(can.reason||'This content is locked.');return;}

    const f=G.followers||0;
    const p=this.platforms[S.platform]||this.platforms.short;
    const def=this.postTypes[type]||this.postTypes.quick;
    const cost=sc(def.cost||0);
    if(cost>0)G.money-=cost;

    const burnoutPenalty=Math.max(.35,1-(S.burnout||0)/140);
    const fit=this.statFit();
    const quality=(S.contentSkill+S.consistency+S.audienceQuality)/300;
    const lucky=G.trait==='lucky'?1.25:1;
    const manager=S.manager?1.08:1;
    const trendMult=this.trendMultiplier(type);

    let base=0,viralChance=.04,msg='',money=0,typeLog='fame',repDelta=0,brandDelta=0,aqDelta=0,skillDelta=0,consistencyDelta=0,burnoutAdd=p.burnout;

    if(type==='quick'){
      base=r(40,500)+Math.floor(f*.004);viralChance=.035;consistencyDelta=4;burnoutAdd+=0;msg='Quick post kept your audience warm.';
    }else if(type==='quality'){
      base=r(300,2800)+Math.floor(f*.008);viralChance=.075;skillDelta=4;burnoutAdd+=5;G.stress=cl((G.stress||0)+3);msg='Quality upload landed well.';
    }else if(type==='trend'){
      base=r(500,7000)+Math.floor(f*.012);viralChance=.13;consistencyDelta=2;brandDelta=-r(0,4);burnoutAdd+=7;msg='Trend post caught attention.';
    }else if(type==='series'){
      base=r(220,1800)+Math.floor(f*.006);viralChance=.055;aqDelta=6;skillDelta=3;burnoutAdd+=2;msg='Series episode deepened audience loyalty.';
    }else if(type==='live'){
      base=r(90,950)+Math.floor(f*.005);viralChance=.045;money=sc(r(20,320)+Math.floor(f*.002));aqDelta=3;burnoutAdd+=4;msg=`Live stream brought in ${fmt(money)} in tips.`;
    }else if(type==='collab'){
      base=r(800,9000)+Math.floor(f*.018);viralChance=.08;aqDelta=2;repDelta=2;burnoutAdd+=4;msg='Collab introduced you to a new audience.';
    }else if(type==='premium'){
      base=r(1800,15000)+Math.floor(f*.014);viralChance=.09;skillDelta=6;aqDelta=4;repDelta=2;burnoutAdd+=8;G.stress=cl((G.stress||0)+5);msg='Premium drop felt like a major creator moment.';
    }else if(type==='documentary'){
      base=r(2500,22000)+Math.floor(f*.012);viralChance=.07;skillDelta=7;repDelta=6;aqDelta=5;burnoutAdd+=9;G.stress=cl((G.stress||0)+6);msg='Mini documentary elevated your credibility.';
    }

    const crisisRisk=Math.max(0,(100-(S.brandSafety||60))/450)+(type==='trend'?.035:0)+(S.reputation<35?.04:0);
    const crisis=Math.random()<crisisRisk;
    const viral=Math.random()<viralChance*lucky*burnoutPenalty*trendMult;

    let gain=Math.max(0,Math.floor(base*p.growth*fit*(.65+quality)*burnoutPenalty*lucky*manager*trendMult*(viral?r(8,24):1)));

    if(crisis){
      const loss=Math.min(gain+Math.floor(f*.08),r(300,18000));
      gain=Math.max(0,gain-loss);
      repDelta-=r(5,13);
      brandDelta-=r(6,16);
      G.happiness=cl(G.happiness-r(4,10));
      msg+=' A backlash started in the comments.';
      typeLog='bad';
    }

    S.consistency=cl(S.consistency+consistencyDelta);
    S.contentSkill=cl(S.contentSkill+skillDelta);
    S.audienceQuality=cl(S.audienceQuality+aqDelta);
    S.reputation=cl(S.reputation+repDelta);
    S.brandSafety=cl(S.brandSafety+brandDelta);
    S.burnout=cl(S.burnout+burnoutAdd);

    if(money>0){G.money+=money;G.socialEarnings=(G.socialEarnings||0)+money;}
    G.followers=(G.followers||0)+gain;
    G.fame=cl((G.fame||0)+Math.max(1,Math.floor(gain/1200))+(viral?2:0));
    G.happiness=cl(G.happiness+(viral?14:r(4,9))-(crisis?5:0));

    S.totalPosts++;
    S.lastPostAge=G.age;
    S.streak=Number.isFinite(S.streak)?S.streak+1:1;
    S.bestPost=Math.max(S.bestPost||0,gain);

    if(viral){
      S.viralHits++;
      S.reputation=cl(S.reputation+r(1,4));
      if(!G.achievements)G.achievements={};
      G.achievements.viral=true;
      typeLog=crisis?'bad':'special';
      msg=`${msg} It went viral: +${fmtFollowers(gain)} followers.`;
    }else{
      msg=`${msg} +${fmtFollowers(gain)} followers.`;
    }

    if(cost>0)msg+=` Production cost: ${fmt(cost)}.`;

    S.lastPost={text:msg,type:typeLog,gain,age:G.age,kind:type};
    this.addHistory({age:G.age,kind:type,text:msg,gain,type:typeLog});

    Engine.log(`${p.icon} ${msg}`,typeLog);
    Engine.checkAch();UI.update();this.render();
  },

  fame(type){
    const G=window.G;this.ensure();
    const S=G.social;

    if(type==='interview'){
      G.fame=cl((G.fame||0)+r(4,10));
      G.followers=(G.followers||0)+r(250,2800);
      S.reputation=cl(S.reputation+r(5,9));
      S.brandSafety=cl(S.brandSafety+r(2,6));
      S.burnout=cl(S.burnout+2);
      S.lastPost={text:'A press interview improved your credibility and visibility.',type:'good'};
      Engine.log('📰 Press interview improved your credibility and visibility.','fame');
    }else if(type==='event'){
      const c=sc(250);if((G.money||0)<c){UI.toast('Need '+fmt(c)+'!');return;}
      G.money-=c;
      G.fame=cl((G.fame||0)+r(5,12));
      G.looks=cl(G.looks+r(2,5));
      G.followers=(G.followers||0)+r(500,6500);
      S.reputation=cl(S.reputation+r(1,4));
      S.burnout=cl(S.burnout+3);
      S.lastPost={text:'Public event raised your profile and created new photo opportunities.',type:'good'};
      Engine.log('🎟️ Public event raised your profile.','fame');
    }else if(type==='charity'){
      G.fame=cl((G.fame||0)+r(6,14));
      G.happiness=cl(G.happiness+r(8,14));
      G.karma=cl((G.karma||0)+r(3,8),-100,100);
      G.followers=(G.followers||0)+r(300,4500);
      S.reputation=cl(S.reputation+r(5,10));
      S.brandSafety=cl(S.brandSafety+r(8,14));
      S.lastPost={text:'Charity campaign made your public image shine.',type:'good'};
      Engine.log('🤲 Charity campaign made your public image shine.','fame');
    }else if(type==='scandal'){
      const trend=this.trendMultiplier('scandal');
      if(Math.random()>0.48/trend){
        G.fame=cl((G.fame||0)+r(10,22));
        G.followers=(G.followers||0)+r(5000,65000);
        S.reputation=cl(S.reputation-r(8,18));
        S.brandSafety=cl(S.brandSafety-r(12,24));
        S.burnout=cl(S.burnout+r(8,16));
        G.karma=cl((G.karma||0)-r(2,7),-100,100);
        S.lastPost={text:'Controversy brought massive attention, but brands got nervous.',type:'bad'};
        Engine.log('🔥 Controversy brought massive attention, but brands got nervous.','fame');
      }else{
        G.fame=cl((G.fame||0)-r(8,18));
        G.followers=Math.max(0,(G.followers||0)-r(1000,28000));
        G.happiness=cl(G.happiness-13);
        S.reputation=cl(S.reputation-r(14,26));
        S.brandSafety=cl(S.brandSafety-r(18,30));
        S.burnout=cl(S.burnout+r(12,24));
        S.lastPost={text:'Controversy backfired. Reputation damaged.',type:'bad'};
        Engine.log('🔥 Controversy backfired. Reputation damaged.','bad');
      }
    }else if(type==='pr'){
      const c=sc(1200);if((G.money||0)<c){UI.toast('Need '+fmt(c)+'!');return;}
      G.money-=c;
      S.reputation=cl(S.reputation+r(10,18));
      S.brandSafety=cl(S.brandSafety+r(8,16));
      G.stress=cl((G.stress||0)-r(3,7));
      S.lastPost={text:'PR help repaired your public image.',type:'good'};
      Engine.log('🛡️ PR help repaired your public image.','good');
    }else if(type==='break'){
      S.burnout=cl(S.burnout-r(18,30));
      S.consistency=cl(S.consistency-r(2,6));
      S.streak=0;
      G.happiness=cl(G.happiness+r(6,12));
      G.stress=cl((G.stress||0)-r(8,14));
      S.lastPost={text:'You took a creator break. Burnout dropped, but consistency dipped.',type:'good'};
      Engine.log('🌿 You took a creator break. Burnout dropped, but consistency dipped.','good');
    }

    UI.update();this.render();
  },

  monetize(type){
    const G=window.G;this.ensure();
    const S=G.social;
    let rev=0,msg='',kind='money';
    const brandMult=(.45+(S.brandSafety||60)/100)*(.55+(S.reputation||60)/100)*(S.manager?1.18:1)*(S.verified?1.08:1);

    if(type==='sponsor'){
      if((G.followers||0)<10000){UI.toast('Need 10K followers!');return;}
      rev=sc(Math.round(r(800,9000)*brandMult));
      S.brandSafety=cl(S.brandSafety-r(0,3));
      S.reputation=cl(S.reputation+1);
      msg=`💼 Brand deal paid ${fmt(rev)}.`;
    }else if(type==='merch'){
      if((G.followers||0)<10000){UI.toast('Need 10K followers!');return;}
      rev=sc(Math.round(r(600,7000)*(this.engagementRate()/5)));
      S.audienceQuality=cl(S.audienceQuality+2);
      msg=`👕 Merch launch earned ${fmt(rev)}.`;
    }else if(type==='course'){
      if((G.smarts||0)<55){UI.toast('Need 55+ Smarts!');return;}
      rev=sc(r(1200,11000));
      S.reputation=cl(S.reputation+4);
      S.contentSkill=cl(S.contentSkill+3);
      msg=`🎓 Online course earned ${fmt(rev)}.`;
    }else if(type==='book'){
      rev=sc(r(2000,26000));
      G.fame=cl((G.fame||0)+r(5,15));
      S.reputation=cl(S.reputation+r(4,8));
      msg=`📖 Book published. First wave earned ${fmt(rev)}.`;
      kind='special';
    }else if(type==='app'){
      if((G.smarts||0)<60){UI.toast('Need 60+ Smarts!');return;}
      rev=sc(r(5000,55000));
      S.contentSkill=cl(S.contentSkill+5);
      msg=`📱 App launch generated ${fmt(rev)}.`;
      kind='special';
    }else if(type==='membership'){
      if((G.followers||0)<50000){UI.toast('Need 50K followers!');return;}
      if(S.membership){UI.toast('Membership is already active.');return;}
      S.membership=true;
      rev=sc(r(1500,8500));
      S.audienceQuality=cl(S.audienceQuality+5);
      msg=`🔒 Membership launched with ${fmt(rev)} in early support.`;
    }

    G.money+=rev;
    G.socialEarnings=(G.socialEarnings||0)+rev;
    G.happiness=cl(G.happiness+r(3,8));
    S.burnout=cl(S.burnout+r(1,4));
    S.lastPost={text:msg,type:kind,gain:0,age:G.age,kind:type};
    this.addHistory({age:G.age,kind:type,text:msg,gain:0,type:kind});

    Engine.log(msg,kind);Engine.checkAch();UI.update();this.render();
  },

  ops(type){
    const G=window.G;this.ensure();
    const S=G.social;

    if(type==='verify'){
      if(S.verified){UI.toast('You are already verified.');return;}
      if((G.followers||0)<100000){UI.toast('Need 100K followers.');return;}
      if((S.reputation||0)<65){UI.toast('Need 65+ reputation.');return;}
      const pass=Math.random()<(.55+(S.reputation||65)/180);
      if(pass){
        S.verified=true;
        S.reputation=cl(S.reputation+5);
        S.brandSafety=cl(S.brandSafety+4);
        G.fame=cl((G.fame||0)+5);
        S.lastPost={text:'Verification approved. Your profile now carries more trust.',type:'special'};
        Engine.log('✅ Verification approved. Your profile now carries more trust.','special');
      }else{
        S.reputation=cl(S.reputation-2);
        S.lastPost={text:'Verification was denied. Try again with stronger reputation.',type:'neutral'};
        Engine.log('✅ Verification was denied. Try again later.','neutral');
      }
    }else if(type==='manager'){
      const c=sc(2500);
      if(S.manager){UI.toast('You already have a manager.');return;}
      if((G.followers||0)<25000){UI.toast('Need 25K followers.');return;}
      if((G.money||0)<c){UI.toast('Need '+fmt(c)+'!');return;}
      G.money-=c;
      S.manager=true;
      S.reputation=cl(S.reputation+3);
      S.brandSafety=cl(S.brandSafety+3);
      S.lastPost={text:'You hired a manager. Deals should become more profitable.',type:'good'};
      Engine.log('🧑‍💼 You hired a creator manager.','good');
    }else if(type==='cleanup'){
      const c=sc(600);
      if((G.money||0)<c){UI.toast('Need '+fmt(c)+'!');return;}
      G.money-=c;
      S.brandSafety=cl(S.brandSafety+r(8,16));
      S.reputation=cl(S.reputation+r(2,6));
      G.stress=cl((G.stress||0)-r(1,4));
      S.lastPost={text:'You cleaned up old posts and reduced future scandal risk.',type:'good'};
      Engine.log('🧹 You cleaned up old posts and improved brand safety.','good');
    }else if(type==='analytics'){
      S.audienceQuality=cl(S.audienceQuality+r(3,7));
      S.contentSkill=cl(S.contentSkill+r(2,5));
      S.consistency=cl(S.consistency+r(1,4));
      G.stress=cl((G.stress||0)+r(1,3));
      S.lastPost={text:'Analytics review revealed what your audience actually wants.',type:'good'};
      Engine.log('📊 Studied analytics and improved your content strategy.','good');
    }

    Engine.checkAch();UI.update();this.render();
  },

  tick(){
    const G=window.G;if(!G)return;this.ensure();
    const S=G.social;
    const f=G.followers||0;

    if(f>0){
      const inc=this.projectedIncome();
      if(inc>0){
        G.money+=inc;
        G.socialEarnings=(G.socialEarnings||0)+inc;
        Engine.log(`📱 Social platforms paid ${fmt(inc)} this year.`,'money');
      }

      const decay=Math.floor(f*(.003+Math.max(0,(S.burnout-60))/10000+Math.max(0,(40-S.consistency))/16000));
      G.followers=Math.max(0,f-decay);
      if(decay>0&&decay>Math.max(80,f*.015))Engine.log(`📉 Inactive followers drifted away: −${fmtFollowers(decay)}.`, 'bad');
    }

    if(Number.isFinite(S.lastPostAge)&&S.lastPostAge!==null&&Number.isFinite(G.age)&&G.age>S.lastPostAge){
      S.streak=0;
    }

    S.burnout=cl((S.burnout||0)-r(2,6));
    S.consistency=cl((S.consistency||45)-r(0,2));

    if(S.reputation<35&&Math.random()<.18){
      const loss=r(400,9000);
      G.followers=Math.max(0,(G.followers||0)-loss);
      Engine.log(`📉 Low reputation caused ${fmtFollowers(loss)} followers to leave.`,'bad');
    }

    if(S.burnout>80&&Math.random()<.2){
      G.happiness=cl(G.happiness-r(4,9));
      G.stress=cl((G.stress||0)+r(4,9));
      Engine.log('🔥 Creator burnout made social media feel exhausting.','bad');
    }

    if(S.brandSafety<25&&Math.random()<.12){
      const loss=sc(r(600,6000));
      G.money=Math.max(0,(G.money||0)-loss);
      S.reputation=cl(S.reputation-r(2,6));
      Engine.log(`🛡️ A sponsor pulled out after reviewing your brand risk. Lost ${fmt(loss)}.`, 'bad');
    }
  },

  monetizeCard(type,icon,name,req,meta){
    const G=window.G;this.ensure();
    const S=G.social;
    let locked=false,lock='';
    if(type==='sponsor'&&(G.followers||0)<10000){locked=true;lock='Need 10K followers';}
    if(type==='merch'&&(G.followers||0)<10000){locked=true;lock='Need 10K followers';}
    if(type==='course'&&(G.smarts||0)<55){locked=true;lock='Need 55+ Smarts';}
    if(type==='app'&&(G.smarts||0)<60){locked=true;lock='Need 60+ Smarts';}
    if(type==='membership'&&(G.followers||0)<50000){locked=true;lock='Need 50K followers';}
    if(type==='membership'&&S.membership){locked=true;lock='Already active';}
    return this.actionCard({icon,name,desc:req,meta,action:`Social.monetize('${type}')`,locked,lock});
  },

  postMeta(type){
    const G=window.G;this.ensure();
    const def=this.postTypes[type]||this.postTypes.quick;
    const cost=sc(def.cost||0);
    const can=this.canPost(type);
    const forecast=this.growthForecast();
    const costTxt=cost>0?` · ${fmt(cost)}`:'';
    return can.ok?`~${fmtFollowers(forecast.low)}–${fmtFollowers(forecast.high)}${costTxt}`:can.reason;
  },

  metricBox(label,value,sub,color){
    return`<div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">${this.esc(label)}</div><div class="nw-amt" style="font-size:20px;color:${color||'var(--txt)'}">${this.esc(value)}</div><div class="nw-sub">${this.esc(sub)}</div></div>`;
  },

  progressBox(label,val,icon,color){
    val=Math.round(cl(val));
    return`<div style="background:var(--s1);border:1.5px solid var(--b1);border-radius:13px;padding:10px">
      <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:7px;align-items:center">
        <span style="font-size:11px;font-weight:900;color:var(--txt)">${this.esc(icon)} ${this.esc(label)}</span>
        <span style="font-size:11px;font-weight:900;color:${color}">${val}%</span>
      </div>
      <div style="height:6px;background:var(--s3);border-radius:999px;overflow:hidden"><div style="height:100%;width:${val}%;background:${color};border-radius:999px"></div></div>
    </div>`;
  },

  selectCard({active,icon,name,desc,meta,action}){
    return`<div class="card ${active?'special':''}" onclick="${action}" title="${this.esc(desc)}">
      <span class="ci">${this.esc(icon)}</span>
      <span class="cn">${this.esc(name)} ${active?'✓':''}</span>
      <span class="cd">${this.esc(desc)}</span>
      <span class="cd" style="opacity:.75;font-size:10px">${this.esc(meta||'')}</span>
    </div>`;
  },

  actionCard({icon,name,desc,meta,action,locked=false,lock='',danger=false}){
    const cls='card '+(locked?'locked ':'')+(danger?'danger ':'');
    const safeLock=this.esc(lock||'Locked');
    const onclick=locked?`UI.toast('${this.attr(safeLock)}')`:action;
    return`<div class="${cls.trim()}" onclick="${onclick}" title="${locked?safeLock:this.esc(desc)}">
      <span class="ci">${locked?'🔒':this.esc(icon)}</span>
      <span class="cn">${this.esc(name)}</span>
      <span class="cd">${locked?safeLock:this.esc(desc)}</span>
      ${meta?`<span class="cd" style="opacity:.75;font-size:10px">${this.esc(meta)}</span>`:''}
    </div>`;
  },

  alertsHTML(){
    const G=window.G;this.ensure();
    const S=G.social;
    let h='';
    if(S.burnout>=75){
      h+=`<div class="crit-banner orange"><span class="crit-banner-ico">🔥</span><div class="crit-banner-txt">Creator burnout is high (${Math.round(S.burnout)}%). Take a break before growth collapses.</div><button type="button" class="crit-go" onclick="Social.fame('break')">Rest</button></div>`;
    }
    if(S.reputation<30){
      h+=`<div class="crit-banner red"><span class="crit-banner-ico">📉</span><div class="crit-banner-txt">Your reputation is in crisis. PR or charity can repair trust.</div><button type="button" class="crit-go" onclick="Social.fame('pr')">PR</button></div>`;
    }
    if((G.followers||0)>=100000&&!S.verified&&S.reputation>=65){
      h+=`<div class="crit-banner"><span class="crit-banner-ico">✅</span><div class="crit-banner-txt">You may qualify for verification. Apply in Creator Operations.</div><button type="button" class="crit-go" onclick="Social.ops('verify')">Apply</button></div>`;
    }
    return h;
  },

  lastPostHTML(post){
    const col=post.type==='bad'?'var(--red)':post.type==='special'?'var(--yellow)':post.type==='money'?'var(--yellow)':'var(--green)';
    const gain=Number.isFinite(post.gain)&&post.gain>0?` <span style="color:${col};font-weight:900">+${fmtFollowers(post.gain)}</span>`:'';
    return`<div class="info-box" style="margin:0;border-color:${col}55;background:${col}10"><p style="margin:0"><strong>Last move:</strong> ${this.esc(post.text)}${gain}</p></div>`;
  },

  emptyStateHTML(){
    return`<div class="info-box" style="margin:0"><p style="margin:0"><strong>Creator tip:</strong> Start with Quick Posts to build consistency, then use Quality Uploads or Series when burnout is low.</p></div>`;
  },

  historyHTML(){
    const G=window.G;this.ensure();
    const hist=(G.social.postHistory||[]).slice(-5).reverse();
    if(!hist.length)return'';
    return`<div class="sec">Recent Creator History</div><div class="log-list" style="margin-bottom:8px">${hist.map(x=>{
      const col=x.type==='bad'?'var(--red)':x.type==='special'?'var(--accent)':x.type==='money'?'var(--yellow)':'var(--muted)';
      return`<div class="log-entry ${['bad','special','money','good'].includes(x.type)?x.type:'neutral'}"><div class="log-age" style="color:${col}">Age ${this.esc(x.age)}</div><div class="log-txt">${this.esc(x.text)}</div></div>`;
    }).join('')}</div>`;
  },

  addHistory(entry){
    const G=window.G;this.ensure();
    G.social.postHistory.push(entry);
    if(G.social.postHistory.length>16)G.social.postHistory=G.social.postHistory.slice(-16);
  },

  colorFor(v,mode='goodHigh'){
    v=Number(v)||0;
    if(mode==='badHigh')return v>=70?'var(--red)':v>=40?'var(--orange)':'var(--green)';
    return v>=75?'var(--green)':v>=45?'var(--yellow)':'var(--red)';
  },

  statName(stat){
    return{looks:'Looks',smarts:'Smarts',fitness:'Fitness',happiness:'Happiness',fame:'Fame'}[stat]||stat;
  },

  esc(v){
    if(typeof UI!=='undefined'&&UI._esc)return UI._esc(v);
    return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  },

  attr(v){
    return String(v??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');
  },
};