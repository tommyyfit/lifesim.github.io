/* js/legacy.js — LifeSim v13 Reforged Legacy / Dynasty / Prestige System */

const Legacy={
  PRESTIGE_KEY:'ls13_prestige',
  OLD_KEYS:['ls12_prestige','ls11_prestige','ls8_prestige'],

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
      return parsed&&typeof parsed==='object'?parsed:{};
    }catch(e){return{};}
  },

  save(data){
    try{localStorage.setItem(this.PRESTIGE_KEY,JSON.stringify(data||{}));}
    catch(e){}
  },

  reset(){
    try{localStorage.removeItem(this.PRESTIGE_KEY);}catch(e){}
  },

  _esc(v){
    if(typeof escHTML==='function')return escHTML(v);
    return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  getPrestige(){
    const d=this.load();
    const lives=Math.max(0,Math.round(d.livesPlayed||0));
    const total=Math.max(0,Math.round(d.totalScore||0));
    return{
      version:13,
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
    };
  },

  recordLife(name,grade,score,extra={}){
    const d=this.load();
    const cleanName=String(name||'Unknown Life').trim();
    const s=Math.max(0,Math.round(score||0));
    const g=grade||'F';

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
    d.records.highestNetWorth=Math.max(d.records.highestNetWorth||0,extra.netWorth||0);
    d.records.longestLife=Math.max(d.records.longestLife||0,extra.age||0);
    d.records.mostChildren=Math.max(d.records.mostChildren||0,extra.children||0);
    d.records.mostFollowers=Math.max(d.records.mostFollowers||0,extra.followers||0);
    d.records.mostGoals=Math.max(d.records.mostGoals||0,extra.completedGoals||0);

    d.achievements=d.achievements&&typeof d.achievements==='object'?d.achievements:{};
    if((d.livesPlayed||0)>=3)d.achievements.three_lives=true;
    if((d.livesPlayed||0)>=10)d.achievements.ten_lives=true;
    if((d.legendaryLives||0)>=1)d.achievements.first_legend=true;
    if((d.totalScore||0)>=500)d.achievements.dynasty_500=true;

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
      el.innerHTML=`<span style="font-size:11px;color:var(--muted);font-weight:700">🌱 Begin your dynasty — play your first life!</span>`;
      return;
    }

    el.innerHTML=`
      <span style="font-size:11px;font-weight:900;color:${rank.color}">${rank.icon} ${this._esc(rank.label)}</span>
      <span style="font-size:11px;font-weight:700;color:var(--muted)"> · ${p.livesPlayed} live${p.livesPlayed!==1?'s':''} · Score: ${p.totalScore.toLocaleString()} · Avg: ${p.avgScore}</span>
      ${p.bestGrade?`<span style="font-size:11px;font-weight:700;color:var(--yellow)"> · Best: ${this._esc(p.bestGrade)}</span>`:''}
      ${p.dynastyName?`<span style="font-size:11px;font-weight:700;color:var(--muted)"> · Dynasty: ${this._esc(p.dynastyName)}</span>`:''}
    `;
  },

  renderLegacySection(lastGrade){
    const el=document.getElementById('legacy-section');
    if(!el)return;
    const opts=this.getInheritanceOptions(lastGrade);

    if(!opts.length){
      el.style.display='none';
      Legacy._selectedOpt='none';
      Legacy._selectedBonus=0;
      return;
    }

    el.style.display='block';
    el.innerHTML=`
      <div style="font-size:10px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px">🌳 Legacy Inheritance · Grade ${this._esc(lastGrade)} ancestor</div>
      <div id="legacy-opts" style="display:flex;flex-direction:column;gap:6px">
        ${opts.map(o=>`
          <button type="button" class="legacy-opt-btn" id="lopt-${this._esc(o.id)}" onclick="Legacy.selectInheritance('${this._esc(o.id)}',${Number(o.bonus)||0})" style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1.5px solid var(--b1);border-radius:10px;padding:8px 12px;cursor:pointer;text-align:left;transition:.15s">
            <span style="font-size:18px">${o.icon}</span>
            <div>
              <div style="font-size:12px;font-weight:800;color:var(--txt)">${this._esc(o.label)}</div>
              <div style="font-size:11px;color:var(--muted)">${this._esc(o.desc)}</div>
            </div>
          </button>`).join('')}
        <button type="button" class="legacy-opt-btn" id="lopt-none" onclick="Legacy.selectInheritance('none',0)" style="display:flex;align-items:center;gap:10px;background:var(--s2);border:1.5px solid var(--b1);border-radius:10px;padding:8px 12px;cursor:pointer;text-align:left;opacity:.65">
          <span style="font-size:18px">🚫</span>
          <div>
            <div style="font-size:12px;font-weight:800;color:var(--txt)">Start Fresh</div>
            <div style="font-size:11px;color:var(--muted)">Decline the inheritance — forge your own path</div>
          </div>
        </button>
      </div>`;

    Legacy._selectedOpt=opts[0].id;
    Legacy._selectedBonus=opts[0].bonus;
    document.getElementById('lopt-'+opts[0].id)?.style.setProperty('border-color','var(--accent)');
  },

  _selectedOpt:'none',
  _selectedBonus:0,

  selectInheritance(id,bonus){
    this._selectedOpt=id;
    this._selectedBonus=Number(bonus)||0;
    document.querySelectorAll('.legacy-opt-btn').forEach(b=>{
      b.style.borderColor='var(--b1)';
      b.style.opacity='';
    });
    const btn=document.getElementById('lopt-'+id);
    if(btn){
      btn.style.borderColor='var(--accent)';
      if(id==='none')btn.style.opacity='1';
    }
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
          const chapter={id:m.id,icon:m.icon,label:m.label,age,summary,netWorth:typeof netWorth==='function'?netWorth(G):0,happiness:G.happiness||0,health:G.health||0};
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
              <div style="font-size:11px;font-weight:600;color:var(--muted);line-height:1.5;margin-top:2px">${this._esc(c.summary)}</div>
            </div>
          </div>`).join('')}
      </div>`;
  },
};