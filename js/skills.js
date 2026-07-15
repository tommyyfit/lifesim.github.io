/* js/skills.js — LifeSim module */

const SKILL_DEFS=[
  {
    id:'coding',
    icon:'💻',
    name:'Coding',
    desc:'Software, apps, automation and technical leverage',
    stat:'smarts',
    category:'Tech',
    jobs:['Software Engineer','Data Scientist','CTO'],
    maxLv:5,
    costBase:200,
    stress:4,
  },
  {
    id:'cooking',
    icon:'👨‍🍳',
    name:'Culinary Arts',
    desc:'Cook, host and improve nutrition quality',
    stat:'health',
    category:'Lifestyle',
    jobs:['Chef','Restaurant Owner'],
    maxLv:5,
    costBase:50,
    stress:1,
  },
  {
    id:'music',
    icon:'🎸',
    name:'Music',
    desc:'Instrument mastery, performance and creative identity',
    stat:'fame',
    category:'Creative',
    jobs:['Musician','Music Producer'],
    maxLv:5,
    costBase:80,
    stress:2,
  },
  {
    id:'language',
    icon:'🗣️',
    name:'Languages',
    desc:'Speak, translate and connect across cultures',
    stat:'smarts',
    category:'Social',
    jobs:['Diplomat','Translator'],
    maxLv:5,
    costBase:120,
    stress:2,
  },
  {
    id:'fitness',
    icon:'🏋️',
    name:'Athletic Training',
    desc:'Strength, conditioning and physical discipline',
    stat:'fitness',
    category:'Health',
    jobs:['Personal Trainer','Athlete'],
    maxLv:5,
    costBase:60,
    stress:2,
  },
  {
    id:'writing',
    icon:'✍️',
    name:'Writing',
    desc:'Prose, copywriting, storytelling and publishing',
    stat:'smarts',
    category:'Creative',
    jobs:['Journalist','Author'],
    maxLv:5,
    costBase:40,
    stress:1,
  },
  {
    id:'finance',
    icon:'📊',
    name:'Finance & Investing',
    desc:'Budgeting, investing, valuation and money systems',
    stat:'smarts',
    category:'Money',
    jobs:['Investment Banker','CFO'],
    maxLv:5,
    costBase:150,
    stress:3,
  },
  {
    id:'public_sp',
    icon:'🎤',
    name:'Public Speaking',
    desc:'Confidence, presentations and influence',
    stat:'fame',
    category:'Social',
    jobs:['Politician','Motivational Speaker'],
    maxLv:5,
    costBase:100,
    stress:3,
  },
  {
    id:'art',
    icon:'🎨',
    name:'Fine Arts',
    desc:'Painting, design, visual taste and craft',
    stat:'looks',
    category:'Creative',
    jobs:['Artist','Designer'],
    maxLv:5,
    costBase:70,
    stress:1,
  },
  {
    id:'medicine',
    icon:'🩺',
    name:'Medicine',
    desc:'Health, biology, diagnostics and prevention',
    stat:'health',
    category:'Health',
    jobs:['Doctor','Surgeon'],
    maxLv:5,
    costBase:300,
    stress:5,
  },
  {
    id:'hacking',
    icon:'🕶️',
    name:'Cybersecurity',
    desc:'Security, exploits, privacy and systems thinking',
    stat:'smarts',
    category:'Tech',
    jobs:['Security Analyst','Pen Tester'],
    maxLv:5,
    costBase:180,
    stress:4,
  },
  {
    id:'photo',
    icon:'📸',
    name:'Photography',
    desc:'Camera work, visual taste and content production',
    stat:'fame',
    category:'Creative',
    jobs:['Photographer','Content Producer'],
    maxLv:5,
    costBase:90,
    stress:2,
  },
  {
    id:'negotiation',
    icon:'🤝',
    name:'Negotiation',
    desc:'Sales, leverage, persuasion and deal-making',
    stat:'smarts',
    category:'Money',
    jobs:['Sales Director','Talent Agent'],
    maxLv:5,
    costBase:110,
    stress:3,
  },
  {
    id:'mechanics',
    icon:'🔧',
    name:'Mechanics',
    desc:'Fixing engines, tools and practical machines',
    stat:'smarts',
    category:'Practical',
    jobs:['Mechanic','Workshop Owner'],
    maxLv:5,
    costBase:85,
    stress:2,
  },
  {
    id:'beauty',
    icon:'💄',
    name:'Beauty & Styling',
    desc:'Makeup, grooming, fashion and presentation',
    stat:'looks',
    category:'Lifestyle',
    jobs:['Makeup Artist','Beauty Influencer'],
    maxLv:5,
    costBase:75,
    stress:1,
  },
  {
    id:'psychology',
    icon:'🧠',
    name:'Psychology',
    desc:'People, emotion, self-control and mental insight',
    stat:'health',
    category:'Social',
    jobs:['Therapist','HR Specialist'],
    maxLv:5,
    costBase:130,
    stress:2,
  },
  {
    id:'ai_ml',
    icon:'🤖',
    name:'Artificial Intelligence',
    desc:'Machine learning, prompt engineering, AI automation and data systems',
    stat:'smarts',
    category:'Tech',
    jobs:['Data Scientist','Software Engineer','CTO'],
    maxLv:5,
    costBase:280,
    stress:5,
  },
  {
    id:'crypto',
    icon:'🪙',
    name:'Crypto & DeFi',
    desc:'Blockchain, wallets, trading, DeFi protocols and Web3 ecosystems',
    stat:'smarts',
    category:'Finance',
    jobs:['Crypto Analyst','Financial Advisor','Entrepreneur'],
    maxLv:5,
    costBase:180,
    stress:4,
  },
  {
    id:'meditation',
    icon:'🧘',
    name:'Mindfulness',
    desc:'Stress regulation, emotional intelligence and mental clarity',
    stat:'mentalHealth',
    category:'Wellness',
    jobs:['Life Coach','Counselor'],
    maxLv:5,
    costBase:50,
    stress:-3,
  },
];

const Skills={
  VERSION:1,

  ACTION_LIMITS:{
    learn:4,
    practice:5,
    focus:1,
  },

  HISTORY_LIMIT:18,

  _esc(v){
    if(typeof escHTML==='function')return escHTML(v);
    return String(v??'').replace(/[&<>'"]/g,c=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      "'":'&#39;',
      '"':'&quot;',
    }[c]));
  },

  _resetActionYearIfNeeded(G=window.G){
    if(!G)return;

    if(!Number.isFinite(G.skillActionYear))G.skillActionYear=G.age||0;
    if(!G.skillActionUses||typeof G.skillActionUses!=='object')G.skillActionUses={};

    if(G.skillActionYear!==(G.age||0)){
      G.skillActionYear=G.age||0;
      G.skillActionUses={};
    }
  },

  _usesLeft(action,G=window.G){
    if(!G)return 0;
    this._resetActionYearIfNeeded(G);
    const limit=this.ACTION_LIMITS[action]??1;
    const used=G.skillActionUses?.[action]||0;
    return Math.max(0,limit-used);
  },

  _canUseAction(action,msg='That skill action is already used enough . .'){
    const G=window.G;
    if(!G)return false;

    this._resetActionYearIfNeeded(G);

    if(this._usesLeft(action,G)<=0){
      UI.toast(msg,'bad');
      return false;
    }

    return true;
  },

  _markAction(action,G=window.G){
    if(!G)return;
    this._resetActionYearIfNeeded(G);
    G.skillActionUses[action]=(G.skillActionUses[action]||0)+1;
  },

  _recordHistory(label,skill='',type='skill'){
    const G=window.G;
    if(!G)return;

    if(!Array.isArray(G.skillHistory))G.skillHistory=[];

    G.skillHistory.unshift({
      age:G.age||0,
      label,
      skill,
      type,
    });

    if(G.skillHistory.length>this.HISTORY_LIMIT){
      G.skillHistory.length=this.HISTORY_LIMIT;
    }
  },

  ensureState(G=window.G){
    if(!G)return;

    if(!G.skills||typeof G.skills!=='object')G.skills={};
    if(!G.skillXP||typeof G.skillXP!=='object')G.skillXP={};

    G.skillPoints=Number.isFinite(G.skillPoints)?Math.max(0,Math.round(G.skillPoints)):0;
    G.skillFocus=G.skillFocus||null;
    G.lastSkillPracticeAge=Number.isFinite(G.lastSkillPracticeAge)?G.lastSkillPracticeAge:-1;
    G.skillMasteries=Array.isArray(G.skillMasteries)?G.skillMasteries:[];
    G.skillHistory=Array.isArray(G.skillHistory)?G.skillHistory:[];

    G.skillActionUses=G.skillActionUses&&typeof G.skillActionUses==='object'?G.skillActionUses:{};
    G.skillActionYear=Number.isFinite(G.skillActionYear)?G.skillActionYear:(G.age||0);

    this._resetActionYearIfNeeded(G);

    SKILL_DEFS.forEach(sk=>{
      G.skills[sk.id]=Number.isFinite(G.skills[sk.id])
        ?Math.max(0,Math.min(sk.maxLv,Math.round(G.skills[sk.id])))
        :0;

      G.skillXP[sk.id]=Number.isFinite(G.skillXP[sk.id])
        ?Math.max(0,Math.round(G.skillXP[sk.id]))
        :0;
    });

    if(G.skillFocus&&!SKILL_DEFS.some(sk=>sk.id===G.skillFocus)){
      G.skillFocus=null;
    }
  },

  totalLevels(G=window.G){
    this.ensureState(G);
    return Object.values(G.skills||{}).reduce((a,v)=>a+(v||0),0);
  },

  unlockedJobs(G=window.G){
    this.ensureState(G);

    const jobs=[];

    SKILL_DEFS.forEach(sk=>{
      const lv=G.skills[sk.id]||0;

      if(lv>=3){
        sk.jobs.forEach(job=>{
          jobs.push({
            job,
            skill:sk.name,
            icon:sk.icon,
            level:lv,
          });
        });
      }
    });

    return jobs;
  },

  masteryScore(G=window.G){
    this.ensureState(G);

    const total=this.totalLevels(G);
    const max=SKILL_DEFS.reduce((s,sk)=>s+sk.maxLv,0);
    const score=Math.round(total/max*100);

    if(score>=80)return{score,label:'Polymath',color:'var(--yellow)'};
    if(score>=55)return{score,label:'Highly skilled',color:'var(--green)'};
    if(score>=30)return{score,label:'Developing',color:'var(--accent)'};
    return{score,label:'Beginner',color:'var(--muted)'};
  },

  _cost(sk,lv){
    const G=window.G;

    const difficulty=G?.difficulty==='easy'
      ?0.88
      :G?.difficulty==='hard'
        ?1.15
        :G?.difficulty==='extreme'
          ?1.35
          :1;

    const scholar=G?.trait==='scholar'?0.82:1;
    const intellectual=G?.trait==='intellectual'?0.9:1;

    return Math.max(
      1,
      Math.round(sc(sk.costBase*(lv+1)*(1+lv*0.32))*difficulty*scholar*intellectual)
    );
  },

  _xpNeed(lv){
    return 100+(lv*45);
  },

  _gainLabel(sk){
    if(sk.stat==='health')return'+Health over time';
    if(sk.stat==='fitness')return'+Fitness over time';
    if(sk.stat==='smarts')return'+Smarts over time';
    if(sk.stat==='fame')return'+Fame over time';
    if(sk.stat==='looks')return'+Looks over time';
    return'+Stat over time';
  },

  _categoryStats(G=window.G){
    const cats={};

    SKILL_DEFS.forEach(sk=>{
      if(!cats[sk.category]){
        cats[sk.category]={level:0,count:0,max:0};
      }

      cats[sk.category].level+=G.skills?.[sk.id]||0;
      cats[sk.category].count++;
      cats[sk.category].max+=sk.maxLv;
    });

    return cats;
  },

  _topSkills(G=window.G,limit=4){
    this.ensureState(G);

    return SKILL_DEFS
      .map(sk=>({
        ...sk,
        lv:G.skills[sk.id]||0,
        xp:G.skillXP?.[sk.id]||0,
      }))
      .sort((a,b)=>b.lv-a.lv||b.xp-a.xp)
      .filter(sk=>sk.lv>0)
      .slice(0,limit);
  },

  _skillRowHTML(sk,G=window.G){
    if(!G||!sk)return'';

    const sp=G.skillPoints||0;
    const practiced=G.lastSkillPracticeAge===G.age;
    const lv=G.skills?.[sk.id]||0;
    const xp=G.skillXP?.[sk.id]||0;
    const need=this._xpNeed(lv);
    const cost=this._cost(sk,lv);
    const xpPct=lv>=sk.maxLv?100:Math.min(100,Math.round(xp/need*100));
    const levelPct=Math.round(lv/sk.maxLv*100);
    const canAfford=(G.money||0)>=cost;
    const maxed=lv>=sk.maxLv;
    const safeId=this._esc(sk.id);

    return `
      <div class="row-card" data-stable-key="skill:${safeId}" data-skill-id="${safeId}" style="align-items:flex-start">
        <span class="ri" style="font-size:22px">${sk.icon}</span>

        <div class="rd" style="flex:1">
          <div class="rt" style="margin-bottom:3px">
            ${this._esc(sk.name)}
            <span data-skill-level-label="${safeId}" style="color:${maxed?'var(--yellow)':'var(--accent)'};font-size:11px">Lv ${lv}/${sk.maxLv}</span>
          </div>

          <div class="rs">${this._esc(sk.desc)} · ${this._esc(sk.category)} · ${this._gainLabel(sk)}</div>

          <div style="margin-top:6px">
            <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:800;color:var(--muted);margin-bottom:3px">
              <span>Level progress</span>
              <span data-skill-level-pct="${safeId}">${levelPct}%</span>
            </div>
            <div class="prog-bar">
              <div class="prog-fill" data-skill-level-fill="${safeId}" style="width:${levelPct}%;background:${maxed?'var(--yellow)':'var(--accent)'}"></div>
            </div>
          </div>

          ${!maxed?`
            <div style="margin-top:5px" data-skill-xp-wrap="${safeId}">
              <div style="display:flex;justify-content:space-between;font-size:10px;font-weight:800;color:var(--muted);margin-bottom:3px">
                <span>XP to next level</span>
                <span data-skill-xp-label="${safeId}">${xp}/${need}</span>
              </div>
              <div class="prog-bar">
                <div class="prog-fill" data-skill-xp-fill="${safeId}" style="width:${xpPct}%;background:var(--cyan)"></div>
              </div>
            </div>
          `:''}

          ${lv>=3?`
            <div data-skill-unlocks="${safeId}" style="font-size:10px;color:var(--green);font-weight:700;margin-top:4px">
              🔓 Unlocks: ${sk.jobs.map(j=>this._esc(j)).join(', ')}
            </div>
          `:''}
        </div>

        <div data-skill-actions="${safeId}" style="display:flex;flex-direction:column;gap:5px;align-items:flex-end">
          ${maxed?`
            <span style="font-size:12px;font-weight:800;color:var(--yellow);padding:6px 10px">MAXED ⭐</span>
          `:`
            <button class="btn-primary btn-sm" style="font-size:11px;padding:7px 10px;width:auto;opacity:${sp>0||canAfford?1:.55}" onclick="Skills.learn('${sk.id}')">
              ${sp>0?'🎯 Use Point':`Train ${fmt(cost)}`}
            </button>
            <button class="btn-secondary btn-sm" style="font-size:10px;padding:6px 9px;width:auto;opacity:${practiced?'.55':'1'}" onclick="${practiced?'':`Skills.practice('${sk.id}')`}" ${practiced?'disabled':''}>
              ${practiced?'Practiced':'Practice'}
            </button>
          `}
        </div>
      </div>
    `;
  },

  _skillSelector(id){
    const raw=String(id??'');
    if(window.CSS&&typeof CSS.escape==='function')return CSS.escape(raw);
    return raw.replace(/[^a-zA-Z0-9_-]/g,'\\$&');
  },

  _afterSkillAction(id){
    if(typeof UI!=='undefined'&&UI.update)UI.update();

    const panel=document.getElementById('tab-skills');
    if(!panel||!panel.classList.contains('active'))return;

    this._patchSkillTab(id);
  },

  _patchSkillTab(id){
    const G=window.G;
    const panel=document.getElementById('tab-skills');
    if(!G||!panel)return;

    this.ensureState(G);

    const scroller=panel.closest('.content-area')||panel;
    const safe=this._skillSelector(id);
    const beforeAnchor=id?panel.querySelector(`[data-skill-id="${safe}"]`):null;
    const beforeTop=beforeAnchor?beforeAnchor.getBoundingClientRect().top:null;
    const beforeScroll=scroller?scroller.scrollTop:0;

    panel.classList.add('ui-stable-rendering');
    document.documentElement.classList.add('ui-stable-rendering');

    try{
      const info=panel.querySelector('[data-skill-actions-info]');
      if(info){
        info.textContent=`📚 Skill actions this year: training ${this._usesLeft('learn')}, serious practice ${this._usesLeft('practice')}. Age Up refreshes these limits.`;
      }

      SKILL_DEFS.forEach(sk=>{
        const sel=this._skillSelector(sk.id);
        const row=panel.querySelector(`[data-skill-id="${sel}"]`);
        if(row){
          row.outerHTML=this._skillRowHTML(sk,G);
        }
      });
    }catch(e){
      console.warn('Skill quick patch failed; falling back to stable render.',e);
      if(typeof UI!=='undefined'&&UI.stableRender){
        UI.stableRender('tab-skills',()=>this.render());
        return;
      }
      this.render();
      return;
    }

    const restore=()=>{
      if(!scroller)return;
      const afterAnchor=id?panel.querySelector(`[data-skill-id="${safe}"]`):null;
      if(afterAnchor&&beforeTop!==null){
        const afterTop=afterAnchor.getBoundingClientRect().top;
        const delta=afterTop-beforeTop;
        if(Math.abs(delta)>.5)scroller.scrollTop+=delta;
      }else{
        scroller.scrollTop=beforeScroll;
      }
    };

    restore();
    requestAnimationFrame(()=>{
      restore();
      requestAnimationFrame(()=>{
        restore();
        panel.classList.remove('ui-stable-rendering');
        document.documentElement.classList.remove('ui-stable-rendering');
      });
    });
  },

  render(){
    const G=window.G;
    if(!G)return;

    this.ensureState(G);

    const el=document.getElementById('tab-skills');
    if(!el)return;
    if((G.age||0)<18){
      el.innerHTML='<div class="empty"><span class="ei">🎓</span><p>Adult skill mastery unlocks at age 18. Use the age-appropriate Talents screen for now.</p></div>';
      return;
    }

    const sp=G.skillPoints||0;
    const mastery=this.masteryScore(G);
    const top=this._topSkills(G);
    const jobs=this.unlockedJobs(G);
    const practiced=G.lastSkillPracticeAge===G.age;

    let h=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        ${this._metricBox('🎓 Skill Points',sp,'var(--accent)',sp>0?'Spend points for instant level-ups':'Earn points from yearly learning')}
        ${this._metricBox('🧠 Mastery Score',`${mastery.score}%`,mastery.color,mastery.label)}
        ${this._metricBox('🏆 Total Levels',this.totalLevels(G),'var(--green)',`${top.length?top.map(s=>`${s.icon} Lv${s.lv}`).join(' · '):'No trained skills yet'}`)}
        ${this._metricBox('💼 Career Unlocks',jobs.length,'var(--cyan)',jobs.length?'Unlocked paths below':'Train Lv3+ skills to unlock jobs')}
      </div>

      <div class="info-box" style="margin:0 0 12px 0">
        <p style="margin:0" data-skill-actions-info>📚 Skill actions this year: training ${this._usesLeft('learn')}, serious practice ${this._usesLeft('practice')}. Age Up refreshes these limits.</p>
      </div>
    `;

    if(jobs.length){
      h+=`
        <div class="nw-box" style="margin-bottom:12px;background:rgba(124,111,255,.08);border-color:rgba(124,111,255,.3)">
          <div class="nw-lbl">🔓 Unlocked Career Paths</div>
          <div style="font-size:13px;font-weight:700;color:var(--accent);margin-top:5px">${jobs.map(j=>`${j.icon} ${this._esc(j.job)}`).join(' · ')}</div>
        </div>
      `;
    }

    h+=this._renderCategoryOverview(G);
    h+=`<div class="sec">📚 Your Skills</div><div data-skill-list style="display:grid;gap:8px">`;

    SKILL_DEFS.forEach(sk=>{
      h+=this._skillRowHTML(sk,G);
    });

    h+='</div>';
    h+=this._renderHistory(G);

    el.innerHTML=h;
  },

  _metricBox(label,value,color,sub){
    return`
      <div class="nw-box" style="margin-bottom:0">
        <div class="nw-lbl">${this._esc(label)}</div>
        <div class="nw-amt" style="font-size:22px;color:${color||'var(--txt)'}">${value}</div>
        <div class="nw-sub">${this._esc(sub)}</div>
      </div>
    `;
  },

  _renderCategoryOverview(G){
    const cats=this._categoryStats(G);

    return`
      <div class="sec">🧩 Skill Categories</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        ${Object.entries(cats).map(([name,c])=>{
          const pct=Math.round(c.level/c.max*100);
          const color=pct>=60?'var(--green)':pct>=30?'var(--yellow)':'var(--muted)';

          return`
            <div style="background:var(--s1);border:1px solid var(--b1);border-radius:10px;padding:8px">
              <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:900;margin-bottom:5px">
                <span>${this._esc(name)}</span>
                <span style="color:${color}">${c.level}/${c.max}</span>
              </div>
              <div class="prog-bar" style="height:6px">
                <div class="prog-fill" style="width:${pct}%;background:${color}"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  _renderHistory(G=window.G){
    const rows=(G?.skillHistory||[]).slice(0,6);
    if(!rows.length)return'';

    let h='<div class="sec">📜 Skill History</div>';

    rows.forEach(row=>{
      const icon=row.type==='mastery'
        ?'🏆'
        :row.type==='level'
          ?'🎓'
          :row.type==='focus'
            ?'🔥'
            :'📚';

      h+=`
        <div class="row-card">
          <span class="ri">${icon}</span>
          <div class="rd">
            <div class="rt">Age ${row.age} · ${this._esc(row.label)}</div>
            <div class="rs">${this._esc(row.skill||row.type||'Skill')}</div>
          </div>
        </div>
      `;
    });

    return h;
  },

  setFocus(id){
    const G=window.G;
    if(!G)return;
    if((G.age||0)<18){UI.toast('Adult skill mastery unlocks at age 18.','neutral');return;}

    this.ensureState(G);

    const sk=SKILL_DEFS.find(s=>s.id===id);
    if(!sk)return;

    if(!this._canUseAction('focus','Skill focus changes are used up . .'))return;

    this._markAction('focus');

    G.skillFocus=G.skillFocus===id?null:id;

    this._recordHistory(
      G.skillFocus?`Focus set to ${sk.name}`:'Skill focus cleared',
      sk.name,
      'focus'
    );

    Engine.log(
      G.skillFocus?`🔥 Focus skill set to ${sk.name}.`:'🔥 Skill focus cleared.',
      'neutral'
    );

    this._afterSkillAction(id);
  },

  learn(id){
    const G=window.G;
    if(!G)return;
    if((G.age||0)<18){UI.toast('Adult skill mastery unlocks at age 18.','neutral');return;}

    this.ensureState(G);

    const sk=SKILL_DEFS.find(s=>s.id===id);
    if(!sk)return;

    const lv=G.skills[id]||0;

    if(lv>=sk.maxLv){
      UI.toast('Skill maxed!');
      return;
    }

    if(!this._canUseAction('learn','Skill training actions are used up . .'))return;

    if((G.skillPoints||0)>0){
      this._markAction('learn');
      G.skillPoints--;
      this._levelUp(id,'point');
      UI.toast(`🎓 ${sk.name} → Level ${lv+1}!`,'good');
    }else{
      const cost=this._cost(sk,lv);

      if((G.money||0)<cost){
        UI.toast(`Need ${fmt(cost)} to train!`);
        return;
      }

      this._markAction('learn');
      G.money-=cost;
      G.stress=cl((G.stress||0)+(sk.stress||2));

      this._addXP(id,70+(lv*20),'training');
      UI.toast(`📚 Training ${sk.name}.`,'good');
    }

    this._afterSkillAction(id);
  },

  practice(id){
    const G=window.G;
    if(!G)return;
    if((G.age||0)<18){UI.toast('Adult skill mastery unlocks at age 18.','neutral');return;}

    this.ensureState(G);

    if(G.lastSkillPracticeAge===G.age){
      UI.toast('You already practiced seriously .');
      return;
    }

    const sk=SKILL_DEFS.find(s=>s.id===id);
    if(!sk)return;

    const lv=G.skills[id]||0;

    if(lv>=sk.maxLv){
      UI.toast('Skill maxed!');
      return;
    }

    if(!this._canUseAction('practice','You already practiced seriously . .'))return;

    this._markAction('practice');
    G.lastSkillPracticeAge=G.age;
    G.stress=cl((G.stress||0)+Math.max(1,(sk.stress||2)-1));

    if(G.trait==='disciplined'){
      G.happiness=cl((G.happiness||50)+2);
    }

    this._addXP(id,45+Math.floor((G.smarts||50)/8)+(G.skillFocus===id?15:0),'practice');
    this._recordHistory(`Practiced ${sk.name}`,sk.name,'practice');

    this._afterSkillAction(id);
  },

  _addXP(id,amount,source='practice'){
    const G=window.G;
    if(!G)return false;

    this.ensureState(G);

    const sk=SKILL_DEFS.find(s=>s.id===id);
    if(!sk)return false;

    const lv=G.skills[id]||0;

    if(lv>=sk.maxLv){
      UI.toast('Skill maxed!');
      return false;
    }

    let gain=Math.round(amount);

    if(G.skillFocus===id)gain=Math.round(gain*1.25);
    if(G.trait==='scholar'||G.trait==='intellectual')gain=Math.round(gain*1.12);

    G.skillXP[id]=(G.skillXP[id]||0)+gain;

    const need=this._xpNeed(lv);

    if(G.skillXP[id]>=need){
      return this._levelUp(id,source);
    }

    Engine.log(`📚 ${sk.name} gained ${gain} XP (${G.skillXP[id]}/${need}).`,'good');
    return true;
  },

  _levelUp(id,source='training'){
    const G=window.G;
    if(!G)return false;

    this.ensureState(G);

    const sk=SKILL_DEFS.find(s=>s.id===id);
    if(!sk)return false;

    const lv=G.skills[id]||0;

    if(lv>=sk.maxLv)return false;

    G.skills[id]=lv+1;
    G.skillXP[id]=0;

    const statGain=sk.stat==='fitness'||sk.stat==='fame'||sk.stat==='looks'?2:3;

    if(sk.stat==='fitness')G.fitness=cl((G.fitness||50)+statGain);
    else if(sk.stat==='fame')G.fame=cl((G.fame||0)+statGain);
    else if(sk.stat==='health')G.health=cl((G.health||50)+statGain);
    else if(sk.stat==='looks')G.looks=cl(G.looks+statGain);
    else if(sk.stat==='smarts')G.smarts=cl(G.smarts+statGain);

    if(G.skills[id]>=sk.maxLv&&!G.skillMasteries.includes(id)){
      G.skillMasteries.push(id);
      Engine.log(`🏆 Mastered ${sk.name}. Level ${sk.maxLv} achieved.`,'special');
      this._recordHistory(`Mastered ${sk.name}`,sk.name,'mastery');
    }else{
      Engine.log(
        `🎓 ${source==='point'?'Levelled up':source==='practice'?'Practice paid off':'Trained'} ${sk.name} to Level ${lv+1}.`,
        'special'
      );
      this._recordHistory(`${sk.name} reached Level ${lv+1}`,sk.name,'level');
    }

    if(G.skills[id]>=3){
      Engine.log(`🔓 ${sk.name} unlocked career paths: ${sk.jobs.join(', ')}.`,'good');
    }

    Engine.checkAch();
    return true;
  },

  _passiveStat(sk,lv,G){
    const gain=Math.floor(lv*0.4);
    if(gain<=0)return;

    if(sk.id==='coding'){
      G.smarts=cl(G.smarts+gain);
      if(lv>=3&&Math.random()<0.18)G.money=(G.money||0)+sc(400*lv);
    }else if(sk.id==='cooking'){
      G.health=cl(G.health+Math.floor(lv*0.35));
      if(G.food)G.food.nutritionScore=cl((G.food.nutritionScore||55)+Math.floor(lv*0.4));
    }else if(sk.id==='music'){
      G.fame=cl((G.fame||0)+Math.floor(lv*0.35));
      G.happiness=cl((G.happiness||50)+Math.floor(lv*0.25));
    }else if(sk.id==='fitness'){
      G.fitness=cl((G.fitness||50)+Math.floor(lv*0.55));
      G.health=cl((G.health||50)+Math.floor(lv*0.2));
    }else if(sk.id==='writing'){
      G.smarts=cl(G.smarts+Math.floor(lv*0.35));
      if(lv>=3&&Math.random()<0.12)G.fame=cl((G.fame||0)+1);
    }else if(sk.id==='finance'){
      G.smarts=cl(G.smarts+Math.floor(lv*0.25));
      if(lv>=2)G.money=(G.money||0)+sc(Math.floor(lv*430));
      if(G.creditScore)G.creditScore=creditClamp(G.creditScore+Math.floor(lv*0.35));
    }else if(sk.id==='public_sp'){
      G.fame=cl((G.fame||0)+Math.floor(lv*0.45));
      G.happiness=cl((G.happiness||50)+Math.floor(lv*0.2));
    }else if(sk.id==='art'){
      G.looks=cl(G.looks+Math.floor(lv*0.25));
      if(lv>=3&&Math.random()<0.12)G.fame=cl((G.fame||0)+1);
    }else if(sk.id==='medicine'){
      G.health=cl(G.health+Math.floor(lv*0.55));
      if((G.conditions||[]).length&&Math.random()<lv*0.035)G.stress=cl((G.stress||0)-2);
    }else if(sk.id==='language'){
      G.smarts=cl(G.smarts+Math.floor(lv*0.35));
      if((G.countriesVisited||[]).length>0)G.happiness=cl((G.happiness||50)+1);
    }else if(sk.id==='hacking'){
      G.smarts=cl(G.smarts+Math.floor(lv*0.38));
    }else if(sk.id==='photo'){
      G.fame=cl((G.fame||0)+Math.floor(lv*0.30));
      G.looks=cl(G.looks+Math.floor(lv*0.18));
      if(lv>=2&&Math.random()<0.15)G.followers=(G.followers||0)+r(30,180);
    }else if(sk.id==='negotiation'){
      G.smarts=cl(G.smarts+Math.floor(lv*0.25));
      if(lv>=2)G.money=(G.money||0)+sc(Math.floor(lv*150));
    }else if(sk.id==='mechanics'){
      G.smarts=cl(G.smarts+Math.floor(lv*0.22));
      if((G.assets?.vehicles||[]).length>0)G.money=(G.money||0)+sc(Math.floor(lv*90));
    }else if(sk.id==='beauty'){
      G.looks=cl(G.looks+Math.floor(lv*0.38));
      G.fame=cl((G.fame||0)+Math.floor(lv*0.14));
    }else if(sk.id==='psychology'){
      G.health=cl(G.health+Math.floor(lv*0.22));
      G.happiness=cl(G.happiness+Math.floor(lv*0.25));
      G.stress=cl((G.stress||0)-Math.floor(lv*0.3));
    }
  },

  _yearlyLearning(G){
    const total=this.totalLevels(G);
    const smartBonus=(G.smarts||50)/350;
    const traitBonus=(G.trait==='scholar'||G.trait==='intellectual')?0.05:0;
    const baseChance=0.13+smartBonus+traitBonus+Math.min(0.08,total*0.004);

    if(Math.random()<baseChance){
      G.skillPoints=(G.skillPoints||0)+1;
      Engine.log('🎓 Skill Point earned from a year of learning and experience.','special');
    }

    if(G.skillFocus){
      const sk=SKILL_DEFS.find(s=>s.id===G.skillFocus);

      if(sk&&(G.skills[sk.id]||0)<sk.maxLv&&Math.random()<0.42){
        this._addXP(sk.id,20+Math.floor((G.smarts||50)/10),'focus');
      }
    }
  },

  tick(){
    const G=window.G;
    if(!G)return;

    this.ensureState(G);
    // Childhood talents and teen starter tracks are handled explicitly by
    // AgeLogic. Adult passives and random skill points must not run early.
    if((G.age||0)<18)return;

    SKILL_DEFS.forEach(sk=>{
      const lv=G.skills[sk.id]||0;

      if(lv>0){
        try{
          this._passiveStat(sk,lv,G);
        }catch(e){
          console.warn('Skill passive failed:',sk.id,e);
        }
      }
    });

    this._yearlyLearning(G);

    if(this.totalLevels(G)>=20&&!G.achievements?.skilled_life){
      G.achievements=G.achievements||{};
      G.achievements.skilled_life=true;
      Engine.checkAch();
    }

    if((G.skillMasteries||[]).length>=3&&!G.achievements?.triple_mastery){
      G.achievements=G.achievements||{};
      G.achievements.triple_mastery=true;
      Engine.checkAch();
    }
  },
};