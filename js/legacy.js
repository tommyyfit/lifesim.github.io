/* js/legacy.js — LifeSim module */

const Legacy={
  VERSION:1,
  PRESTIGE_KEY:'ls15_prestige',
  OLD_KEYS:['ls14_prestige','ls12_prestige','ls11_prestige','ls8_prestige'],

  load(){
    try{
      let raw=localStorage.getItem(this.PRESTIGE_KEY);
      if(!raw){
        for(const k of this.OLD_KEYS){
          raw=localStorage.getItem(k);
          if(raw){
            localStorage.setItem(this.PRESTIGE_KEY,raw);
            break;
          }
        }
      }
      const parsed=raw?JSON.parse(raw):{};
      return this._normalizeData(parsed&&typeof parsed==='object'?parsed:{});
    }catch(e){return{};}
  },

  save(data){
    try{localStorage.setItem(this.PRESTIGE_KEY,JSON.stringify(this._normalizeData(data||{})));}
    catch(e){}
  },

  reset(){
    try{localStorage.removeItem(this.PRESTIGE_KEY);}catch(e){}
  },

  _esc(v){
    if(typeof escHTML==='function')return escHTML(v);
    return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  _normalizeData(d={}){
    if(!d||typeof d!=='object')d={};
    d.livesPlayed=Math.max(0,Math.round(Number(d.livesPlayed)||0));
    d.totalScore=Math.max(0,Math.round(Number(d.totalScore)||0));
    d.bestScore=Math.max(0,Math.round(Number(d.bestScore)||0));
    d.lastScore=Math.max(0,Math.round(Number(d.lastScore)||0));
    d.inheritedCount=Math.max(0,Math.round(Number(d.inheritedCount)||0));
    d.legendaryLives=Math.max(0,Math.round(Number(d.legendaryLives)||0));
    d.achievements=d.achievements&&typeof d.achievements==='object'?d.achievements:{};
    d.records=d.records&&typeof d.records==='object'?d.records:{};
    d.recentLives=Array.isArray(d.recentLives)?d.recentLives.slice(0,10):[];
    return d;
  },

  _lifeExtraFallback(extra={}){
    const G=window.G||{};
    const hasKeys=extra&&typeof extra==='object'&&Object.keys(extra).length>0;
    if(hasKeys)return extra;
    return{
      age:G.age||0,
      netWorth:typeof netWorth==='function'?netWorth(G):0,
      children:(G.rels?.children||[]).length,
      followers:G.followers||0,
      completedGoals:(G.completedGoals||[]).length,
      country:G.country?.name||'',
      cause:G.causeOfDeath||'',
      career:G.career?.title||(G.retired?'Retired':'Unemployed'),
    };
  },

  getPrestige(){
    const d=this.load();
    const lives=Math.max(0,Math.round(d.livesPlayed||0));
    const total=Math.max(0,Math.round(d.totalScore||0));
    return{
      version:14,
      livesPlayed:lives,
      totalScore:total,
      avgScore:lives?Math.round(total/lives):0,
      bestGrade:d.bestGrade||null,
      bestScore:Math.max(0,Math.round(d.bestScore||0)),
      lastLifeName:d.lastLifeName||null,
      lastGrade:d.lastGrade||null,
      lastScore:Math.max(0,Math.round(d.lastScore||0)),
      dynastyName:d.dynastyName||null,
      legacyUnlocked:!!d.legacyUnlocked,
      inheritedCount:Math.max(0,Math.round(d.inheritedCount||0)),
      legendaryLives:Math.max(0,Math.round(d.legendaryLives||0)),
      achievements:d.achievements&&typeof d.achievements==='object'?d.achievements:{},
      records:d.records&&typeof d.records==='object'?d.records:{},
      recentLives:Array.isArray(d.recentLives)?d.recentLives.slice(0,10):[],
    };
  },

  recordLife(name,grade,score,extra={}){
    const d=this.load();
    const cleanName=String(name||'Unknown Life').trim();
    const s=Math.max(0,Math.round(score||0));
    const g=grade||'F';
    extra=this._lifeExtraFallback(extra);

    d.livesPlayed=(d.livesPlayed||0)+1;
    d.totalScore=(d.totalScore||0)+s;
    d.lastLifeName=cleanName;
    d.lastGrade=g;
    d.lastScore=s;

    if(!d.bestGrade||this._gradeVal(g)>this._gradeVal(d.bestGrade)||(this._gradeVal(g)===this._gradeVal(d.bestGrade)&&s>(d.bestScore||0))){
      d.bestGrade=g;
      d.bestScore=s;
    }

    if(!d.dynastyName&&cleanName)d.dynastyName=cleanName.split(' ').pop();
    if(this._gradeVal(g)>=this._gradeVal('B'))d.legacyUnlocked=true;
    if(g==='S')d.legendaryLives=(d.legendaryLives||0)+1;

    d.records=d.records&&typeof d.records==='object'?d.records:{};
    d.records.highestNetWorth=Math.max(d.records.highestNetWorth||0,Number(extra.netWorth)||0);
    d.records.longestLife=Math.max(d.records.longestLife||0,Number(extra.age)||0);
    d.records.mostChildren=Math.max(d.records.mostChildren||0,Number(extra.children)||0);
    d.records.mostFollowers=Math.max(d.records.mostFollowers||0,Number(extra.followers)||0);
    d.records.mostGoals=Math.max(d.records.mostGoals||0,Number(extra.completedGoals)||0);

    d.recentLives=Array.isArray(d.recentLives)?d.recentLives:[];
    d.recentLives.unshift({name:cleanName,grade:g,score:s,age:extra.age||0,netWorth:extra.netWorth||0,country:extra.country||'',career:extra.career||'',cause:extra.cause||'',ts:Date.now()});
    if(d.recentLives.length>10)d.recentLives.length=10;

    d.achievements=d.achievements&&typeof d.achievements==='object'?d.achievements:{};
    if((d.livesPlayed||0)>=3)d.achievements.three_lives=true;
    if((d.livesPlayed||0)>=10)d.achievements.ten_lives=true;
    if((d.legendaryLives||0)>=1)d.achievements.first_legend=true;
    if((d.totalScore||0)>=500)d.achievements.dynasty_500=true;
    if((d.records.highestNetWorth||0)>=1000000)d.achievements.millionaire_dynasty=true;
    if((d.records.longestLife||0)>=100)d.achievements.century_life=true;

    this.save(d);
  },

  _gradeVal(g){
    return{F:0,D:1,C:2,B:3,A:4,S:5}[g]??0;
  },

  rankLabel(livesPlayed,totalScore){
    const avg=livesPlayed?Math.round(totalScore/livesPlayed):0;
    if(livesPlayed===0)return{icon:'🌱',label:'Newcomer',color:'var(--muted)',next:'Play your first life'};
    if(livesPlayed<3)return{icon:'🌿',label:'Initiate',color:'var(--green)',next:'Reach 3 lives'};
    if(livesPlayed<7)return{icon:'⭐',label:'Veteran',color:'var(--yellow)',next:'Reach 7 lives'};
    if(livesPlayed<15)return{icon:'🌟',label:'Elite',color:'var(--accent)',next:'Reach 15 lives'};
    if(livesPlayed<30)return{icon:'💎',label:'Legend',color:'var(--cyan)',next:'Reach 30 lives'};
    if(avg>=80)return{icon:'👑',label:'Immortal Dynasty',color:'#ffd700',next:'Maintain greatness'};
    return{icon:'👑',label:'Immortal',color:'#ffd700',next:'Improve average score'};
  },

  getInheritanceOptions(lastGrade){
    const gv=this._gradeVal(lastGrade);
    const opts=[];
    if(gv>=2){
      opts.push({id:'money',icon:'💰',label:'Family Savings',desc:`Start with extra ${fmt(gv>=4?15000:gv>=3?8000:3500)} from your ancestor's estate`,bonus:gv>=4?15000:gv>=3?8000:3500});
    }
    if(gv>=3){
      opts.push({id:'smarts',icon:'🧠',label:'Ancestral Wisdom',desc:`+${gv>=4?12:8} starting Smarts from family knowledge`,bonus:gv>=4?12:8});
      opts.push({id:'health',icon:'❤️',label:'Strong Genes',desc:`+${gv>=4?12:8} starting Health from a hardy family line`,bonus:gv>=4?12:8});
    }
    if(gv>=4){
      opts.push({id:'skillPoint',icon:'🎓',label:'Prodigy Talent',desc:'Start with 2 bonus Skill Points',bonus:2});
      opts.push({id:'reputation',icon:'🌟',label:'Family Reputation',desc:'+8 starting Fame and +8 Happiness',bonus:8});
    }
    if(gv>=5){
      opts.push({id:'happiness',icon:'😊',label:'Joyful Heritage',desc:'+15 starting Happiness from a legendary ancestor',bonus:15});
      opts.push({id:'balanced',icon:'👑',label:'Dynasty Blessing',desc:'+6 Smarts, +6 Health, +6 Happiness and 1 Skill Point',bonus:6});
    }
    return opts;
  },

  applyInheritance(G,optionId,bonus){
    if(!G)return;
    if(!Number.isFinite(G.familySupport))G.familySupport=0;
    const b=bonus||0;

    switch(optionId){
      case'money':
        G.familySupport+=b||5000;
        break;
      case'smarts':
        G.smarts=cl((G.smarts||50)+(b||8));
        break;
      case'health':
        G.health=cl((G.health||50)+(b||8));
        break;
      case'skillPoint':
        G.skillPoints=(G.skillPoints||0)+(b||2);
        break;
      case'happiness':
        G.happiness=cl((G.happiness||50)+(b||15));
        break;
      case'reputation':
        G.fame=cl((G.fame||0)+(b||8));
        G.happiness=cl((G.happiness||50)+(b||8));
        break;
      case'balanced':
        G.smarts=cl((G.smarts||50)+(b||6));
        G.health=cl((G.health||50)+(b||6));
        G.happiness=cl((G.happiness||50)+(b||6));
        G.skillPoints=(G.skillPoints||0)+1;
        break;
      case'none':
      default:
        break;
    }

    G.legacyBonus=optionId||'none';
    if(!Array.isArray(G.legacyHistory))G.legacyHistory=[];
    G.legacyHistory.unshift({age:G.age||0,option:optionId||'none',bonus:b});
    if(G.legacyHistory.length>8)G.legacyHistory.length=8;

    const d=this.load();
    d.inheritedCount=(d.inheritedCount||0)+(optionId&&optionId!=='none'?1:0);
    this.save(d);
  },

  renderSplashPrestige(){
    const el=document.getElementById('prestige-panel');
    if(!el)return;
    const p=this.getPrestige();
    const rank=this.rankLabel(p.livesPlayed,p.totalScore);

    if(p.livesPlayed===0){
      el.innerHTML=`<div class="prestige-card"><div class="prestige-main" style="grid-column:1 / -1"><div class="prestige-rank" style="color:${rank.color}">🌱 Begin your dynasty</div><span class="prestige-sub">Play your first life to unlock prestige, records, inheritance, and dynasty progress.</span></div></div>`;
      return;
    }

    el.innerHTML=`
      <div class="prestige-card">
        <div class="prestige-main">
          <div class="prestige-rank" style="color:${rank.color}">${rank.icon} ${this._esc(rank.label)}</div>
          <span class="prestige-sub">${this._esc(p.dynastyName||'New')} dynasty · Next: ${this._esc(rank.next)}</span>
        </div>
        <div class="prestige-stat"><strong>${p.livesPlayed}</strong><small>Lives played</small></div>
        <div class="prestige-stat"><strong>${p.totalScore.toLocaleString()}</strong><small>Total score · avg ${p.avgScore}</small></div>
        <div class="prestige-stat"><strong>${this._esc(p.bestGrade||'—')}</strong><small>Best grade · score ${p.bestScore}</small></div>
      </div>
    `;
  },

  renderPanel(targetId='legacy-panel'){
    const el=document.getElementById(targetId);
    if(!el)return;
    const p=this.getPrestige();
    const rank=this.rankLabel(p.livesPlayed,p.totalScore);
    const lives=p.recentLives||[];
    el.innerHTML=`
      <div class="nw-box">
        <div class="nw-lbl">Legacy Rank</div>
        <div class="nw-amt" style="font-size:22px;color:${rank.color}">${rank.icon} ${this._esc(rank.label)}</div>
        <div class="nw-sub">${p.livesPlayed} lives · Total score ${p.totalScore.toLocaleString()} · Avg ${p.avgScore} · Next: ${this._esc(rank.next)}</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">
        ${this._legacyMetric('Best Grade',p.bestGrade||'—','var(--yellow)',`Best score ${p.bestScore}`)}
        ${this._legacyMetric('Inherited Starts',p.inheritedCount,'var(--accent)','Legacy bonuses used')}
        ${this._legacyMetric('Longest Life',p.records.longestLife||0,'var(--green)','years')}
        ${this._legacyMetric('Highest Net Worth',fmtFull(p.records.highestNetWorth||0),'var(--green)','record')}
      </div>
      ${lives.length?`<div class="sec">Recent Lives</div>${lives.map(l=>`<div class="row-card"><span class="ri">${l.grade==='S'?'👑':l.grade==='A'?'🌟':'📜'}</span><div class="rd"><div class="rt">${this._esc(l.name)} · Grade ${this._esc(l.grade)}</div><div class="rs">Age ${l.age||0} · ${this._esc(l.country||'Unknown')} · ${this._esc(l.career||'')} · ${fmtFull(l.netWorth||0)}</div></div><div class="rv">${l.score}</div></div>`).join('')}`:''}
    `;
  },

  _legacyMetric(label,value,color,sub){
    return `<div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">${this._esc(label)}</div><div class="nw-amt" style="font-size:20px;color:${color||'var(--txt)'}">${this._esc(value)}</div><div class="nw-sub">${this._esc(sub)}</div></div>`;
  },

  renderLegacySection(lastGrade){
    const el=document.getElementById('legacy-section');
    if(!el)return;
    const opts=this.getInheritanceOptions(lastGrade);

    if(!opts.length){
      el.style.display='none';
      this._selectedOpt='none';
      this._selectedBonus=0;
      return;
    }

    const first=opts[0];
    this._selectedOpt=first.id;
    this._selectedBonus=Number(first.bonus)||0;

    el.style.display='block';
    el.innerHTML=`
      <div class="legacy-legacy-card">
        <div class="legacy-legacy-card-head">
          <div>
            <div class="legacy-legacy-card-kicker">🌳 Legacy Start Bonus</div>
            <strong>Choose one inherited advantage</strong>
            <small>Your last life finished as Grade ${this._esc(lastGrade)}. Pick one clean bonus, or start fresh with no boost.</small>
          </div>
          <span>Optional</span>
        </div>
        <div id="legacy-opts" class="legacy-options legacy-options-legacy-card" role="radiogroup" aria-label="Choose legacy inheritance">
          ${opts.map((o,i)=>`
            <button type="button" class="legacy-opt-btn legacy-opt-legacy-card ${i===0?'selected':''}" id="lopt-${this._esc(o.id)}" data-legacy-id="${this._esc(o.id)}" data-legacy-bonus="${Number(o.bonus)||0}" role="radio" aria-checked="${i===0?'true':'false'}">
              <span class="legacy-opt-icon" aria-hidden="true">${o.icon}</span>
              <span class="legacy-opt-copy">
                <strong>${this._esc(o.label)}</strong>
                <small>${this._esc(o.desc)}</small>
              </span>
            </button>`).join('')}
          <button type="button" class="legacy-opt-btn legacy-opt-legacy-card legacy-none" id="lopt-none" data-legacy-id="none" data-legacy-bonus="0" role="radio" aria-checked="false">
            <span class="legacy-opt-icon" aria-hidden="true">🚫</span>
            <span class="legacy-opt-copy">
              <strong>Start Fresh</strong>
              <small>No inheritance bonus. Clean run, clean story.</small>
            </span>
          </button>
        </div>
      </div>`;

    this._bindLegacyOptions(el);
  },

  _selectedOpt:'none',
  _selectedBonus:0,

  _bindLegacyOptions(root=document){
    const wrap=root.querySelector?.('#legacy-opts');
    if(!wrap||wrap.dataset.bound==='1')return;
    wrap.dataset.bound='1';
    wrap.addEventListener('click',e=>{
      const btn=e.target.closest?.('.legacy-opt-btn');
      if(!btn||!wrap.contains(btn))return;
      e.preventDefault();
      this.selectInheritance(btn.dataset.legacyId||'none',Number(btn.dataset.legacyBonus)||0);
    });
    wrap.addEventListener('keydown',e=>{
      if(e.key!=='Enter'&&e.key!==' ')return;
      const btn=e.target.closest?.('.legacy-opt-btn');
      if(!btn)return;
      e.preventDefault();
      btn.click();
    });
  },

  selectInheritance(id,bonus){
    this._selectedOpt=id||'none';
    this._selectedBonus=Number(bonus)||0;
    document.querySelectorAll('.legacy-opt-btn').forEach(b=>{
      const active=(b.dataset.legacyId||'none')===this._selectedOpt;
      b.classList.toggle('selected',active);
      b.setAttribute('aria-checked',active?'true':'false');
    });
    if(typeof Create!=='undefined'&&Create.updatePreview)Create.updatePreview();
  },
};

/* Life Chapters */
const Chapters={
  MILESTONES:[
    {age:5,id:'early',icon:'👶',label:'Early Childhood'},
    {age:13,id:'childhood',icon:'🧒',label:'Childhood'},
    {age:18,id:'teen',icon:'🧑',label:'Teenage Years'},
    {age:25,id:'young',icon:'💼',label:'Young Adult'},
    {age:40,id:'adult',icon:'🏡',label:'Prime Years'},
    {age:60,id:'middle',icon:'🧔',label:'Middle Age'},
    {age:80,id:'senior',icon:'👴',label:'Senior Years'},
  ],

  _esc(v){
    if(typeof escHTML==='function')return escHTML(v);
    return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  checkAndRecord(G){
    if(!G)return null;
    if(!Array.isArray(G.chapters))G.chapters=[];
    const age=G.age;
    for(const m of this.MILESTONES){
      if(age===m.age){
        const already=G.chapters.some(c=>c.id===m.id);
        if(!already){
          const summary=this._buildSummary(G,m);
          const chapter={id:m.id,icon:m.icon,label:m.label,age,summary,netWorth:typeof netWorth==='function'?netWorth(G):0,happiness:G.happiness||0,health:G.health||0,stress:G.stress||0,career:G.career?.title||'',partner:G.rels?.partner?.name||'',children:(G.rels?.children||[]).length};
          G.chapters.push(chapter);
          Engine.log(`${m.icon} Chapter unlocked: "${m.label}"`, 'special');
          return summary;
        }
      }
    }
    return null;
  },

  _buildSummary(G,m){
    const parts=[];
    if(m.id==='early'){
      if((G.happiness||0)>70)parts.push('A warm early childhood gave this life a bright start.');
      else if((G.happiness||0)<40)parts.push('The first years were difficult, but they shaped resilience.');
      else parts.push('The first years were quiet and ordinary.');
    }
    if(m.id==='childhood'){
      if((G.rels?.siblings||[]).length)parts.push(`Grew up alongside ${G.rels.siblings.map(s=>s.name).join(' and ')}.`);
      if((G.smarts||0)>70)parts.push('Early curiosity started to show.');
      if((G.fitness||50)>70)parts.push('Energy and movement defined childhood.');
    }
    if(m.id==='teen'){
      if((G.happiness||0)>70)parts.push('Teenage years felt hopeful and alive.');
      else if((G.happiness||0)<40)parts.push('Teenage years were emotionally heavy.');
      else parts.push('Teenage years passed with mixed memories.');
      if((G.skills&&Object.keys(G.skills).length))parts.push('Early skills started forming.');
    }
    if(m.id==='young'){
      if(G.education==='university')parts.push(`Completed university${G.univType==='ivy'?' at an elite institution':''}.`);
      else if(G.education==='high_school')parts.push('Finished high school and entered adult life.');
      else if(G.education==='vocational')parts.push('Built a practical vocational path.');
      if(G.career)parts.push(`First serious career path: ${G.career.title}.`);
      if(G.business)parts.push(`Already building ${G.business.name}.`);
    }
    if(m.id==='adult'){
      if(G.rels?.partner?.married)parts.push(`Married ${G.rels.partner.name}.`);
      else if(G.rels?.partner)parts.push(`Built a relationship with ${G.rels.partner.name}.`);
      if((G.rels?.children||[]).length)parts.push(`Raising ${G.rels.children.length} child${G.rels.children.length!==1?'ren':''}.`);
      if(G.business)parts.push(`Founded ${G.business.name}.`);
      const nw=typeof netWorth==='function'?netWorth(G):0;
      if(nw>100000)parts.push(`Net worth reached ${fmt(nw)}.`);
      else parts.push(`Financial base was still developing.`);
    }
    if(m.id==='middle'){
      parts.push(`Health: ${G.health}% · Happiness: ${G.happiness}% · Stress: ${G.stress||0}%.`);
      if(G.retired)parts.push('Retired and enjoying a slower chapter.');
      if((G.countriesVisited||[]).length>3)parts.push(`Visited ${G.countriesVisited.length} countries.`);
      if((G.completedGoals||[]).length)parts.push(`${G.completedGoals.length} goals completed so far.`);
    }
    if(m.id==='senior'){
      parts.push(`A long ${G.age}-year journey continues.`);
      if((G.completedGoals||[]).length)parts.push(`${G.completedGoals.length} life goals completed.`);
      if(G.ambitionAchieved)parts.push('Life ambition already achieved.');
      if((G.rels?.children||[]).length)parts.push('Family legacy continues through children.');
    }
    if(!parts.length)parts.push(`Age ${G.age} — a new chapter begins.`);
    return parts.join(' ');
  },

  render(G){
    const el=document.getElementById('chapters-panel');
    if(!el||!G)return;
    const chapters=G.chapters||[];
    if(!chapters.length){el.innerHTML='';return;}
    el.innerHTML=`
      <div style="font-size:10px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px">📖 Life Chapters</div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${chapters.map(c=>`
          <div style="display:flex;gap:10px;align-items:flex-start;background:var(--s1);border-radius:10px;padding:8px 12px;border:1.5px solid var(--b1)">
            <span style="font-size:16px;min-width:24px">${c.icon}</span>
            <div>
              <div style="font-size:11px;font-weight:900;color:var(--accent)">Age ${c.age} — ${this._esc(c.label)}</div>
              <div style="font-size:11px;font-weight:600;color:var(--muted);line-height:1.5;margin-top:2px">${this._esc(c.summary)}</div><div style="font-size:10px;font-weight:800;color:var(--muted);margin-top:4px">NW ${typeof fmt==='function'?fmt(c.netWorth||0):c.netWorth||0} · Health ${c.health||0}% · Happiness ${c.happiness||0}%</div>
            </div>
          </div>`).join('')}
      </div>`;
  },
};