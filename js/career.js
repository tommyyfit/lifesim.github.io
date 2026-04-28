/* js/career.js — LifeSim v13 Reforged career, education and office system */
const Career={
  VERSION:13,

  ACTION_LIMITS:{
    apply:4,
    workHard:3,
    askRaise:1,
    network:3,
    takeCourse:2,
    suckUp:2,
    bossAffair:1,
    sabotage:1,
    blowOff:2,
    studyUni:3,
    internship:2,
    cheatSchool:1,
    enroll:1,
    vocational:1,
    quit:1,
    retire:1,
  },

  HISTORY_LIMIT:14,
  EVENT_MEMORY_LIMIT:10,

  render(){
    const G=window.G;if(!G)return;
    const el=document.getElementById('tab-career');if(!el)return;
    this._ensure();

    let h='';
    if((G.age||0)<16){
      el.innerHTML='<div class="empty"><span class="ei">🎒</span><p>Still in school!<br>Jobs unlock at age 16.</p></div>';
      return;
    }

    if(G.retired){
      h+=`<div class="info-box" style="border-color:rgba(74,222,128,.4);background:rgba(74,222,128,.06)">
        <p>🏖️ <strong>Retired!</strong> Pension: <strong>${fmt(sc(G.retirementPension||0))}/yr</strong> arrives automatically. Enjoy your golden years!</p>
      </div>`;
    }

    if(G.career){
      const boss=this._ensureBoss();
      const perf=this._perf();
      const perfMeta=this._perfMeta(perf);
      const stress=G.career.stressAdd||6;
      const health=this._careerHealth();
      const actionSummary=this._actionSummary();
      h+=`<div class="career-hero">
        <div class="ch-ico">${G.career.icon}</div>
        <div class="ch-title">${this._esc(G.career.title)}</div>
        <div class="ch-co">${this._esc(G.careerCompany)} · ${this._esc(G.career.cat)}</div>
        <div class="ch-sal">${fmtFull(sc(G.career.salary))} / year</div>
        <div class="ch-meta">📅 ${G.yearsAtJob||0} yr${(G.yearsAtJob||0)!==1?'s':''} · ⭐ Prestige ${G.career.prestige} · 😤 Stress +${stress}/yr</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">
        ${this._metricBox('Career Health',`${health.score}%`,health.label,health.color)}
        ${this._metricBox('Boss Favor',`${boss?.favor||0}/100`,`Attraction ${boss?.attraction||0}/100`,this._scoreColor(boss?.favor||0))}
        ${this._metricBox('Action Bandwidth',actionSummary,'Refreshes on Age Up','var(--accent)')}
        ${this._metricBox('Burnout Risk',`${this._burnoutRisk()}%`,'High stress can hurt health',this._burnoutRisk()>60?'var(--red)':this._burnoutRisk()>35?'var(--yellow)':'var(--green)')}
      </div>
      <div class="info-box" style="margin-bottom:12px">
        <p><strong>Boss:</strong> ${this._esc(boss.name)} · Favor ${boss.favor||0}/100 · Attraction ${boss.attraction||0}/100. Office politics can help you or destroy you.</p>
      </div>
      <div style="margin-bottom:12px">
        <div class="sb-top" style="margin-bottom:4px"><span class="sb-l">Job Performance</span><span class="sb-v" style="color:${perfMeta.color}">${perfMeta.label} (${perf}%)</span></div>
        <div class="prog-bar"><div class="prog-fill" style="width:${perf}%;background:${perfMeta.color}"></div></div>
      </div>
      <div class="act-grid">
        ${this._actionCard('💪','Work Hard','+Performance +Stress','Career.workHard()','workHard')}
        ${this._actionCard('📈','Ask for Raise','Negotiate salary','Career.askRaise()','askRaise')}
        ${this._actionCard('🤝','Network','+Smarts +Performance','Career.network()','network')}
        ${this._actionCard('📚','Take Course',`+Smarts (${fmt(sc(300))})`,'Career.takeCourse()','takeCourse')}
      </div>
      <div class="act-grid" style="margin-top:8px">
        ${this._actionCard('😊','Suck Up to Boss','+Favor +Performance','Career.suckyUp()','suckUp')}
        ${this._actionCard('🔥','Office Affair','High bonus, high risk','Career.sleepWithBoss()','bossAffair',false,true)}
        ${this._actionCard('😈','Sabotage Colleague','Risky office politics','Career.sabotage()','sabotage',false,true)}
        ${this._actionCard('🏖️','Skip Work','+Happiness −Performance','Career.blowOff()','blowOff')}
        ${this._actionCard('🚪','Quit Job','Resign','Career.quit()','quit',false,true)}
      </div>`;

      if((G.age||0)>=55){
        const pension=this._pensionEstimate();
        h+=`<div class="row-card ${this._usesLeft('retire')<=0?'locked':''}" onclick="${this._usesLeft('retire')<=0?'':`Career.retire()`}" style="margin-top:12px;border-color:rgba(251,191,36,.5);background:rgba(251,191,36,.06)">
          <span class="ri">🏖️</span>
          <div class="rd"><div class="rt" style="color:var(--yellow)">Retire Now</div>
          <div class="rs">Age 55+ · Pension: ~${fmt(sc(pension))}/yr</div></div>
          <div class="rv" style="color:var(--yellow)">✓</div>
        </div>`;
      }
    }

    if(!G.career){
      if(G.inSchool){h+=`<div class="info-box"><p>📚 Currently in school — age ${G.age}. Study hard to unlock more options!</p></div>`;}
      if(G.education==='high_school'&&!G.inUniversity&&(G.age||0)>=18&&(G.age||0)<=35){
        h+=`<div class="sec">🎓 Higher Education</div>`;
        UNIVERSITIES.forEach(u=>{
          const cost=sc(u.cost);
          const can=(G.money||0)>=cost||(G.age||0)<=22;
          const locked=!can||this._usesLeft('enroll')<=0;
          h+=`<div class="row-card ${locked?'locked':''}" onclick="${locked?'':`Career.enroll('${u.id}')`}">
            <span class="ri">🏛️</span>
            <div class="rd"><div class="rt">${this._esc(u.name)}</div><div class="rs">${this._esc(u.label)} · +${u.smartsBonus} Smarts · ${u.duration||4} yrs${this._usesLeft('enroll')<=0?' · enrollment used this year':''}</div></div>
            <div class="rv">${fmt(cost)}</div>
          </div>`;
        });
        const vocLocked=(G.money||0)<sc(6000)||this._usesLeft('vocational')<=0;
        h+=`<div class="row-card ${vocLocked?'locked':''}" onclick="${vocLocked?'':`Career.vocational()`}">
          <span class="ri">🔧</span>
          <div class="rd"><div class="rt">Vocational Training</div><div class="rs">2-yr trade cert · Skilled jobs · Faster path</div></div>
          <div class="rv">${fmt(sc(6000))}</div>
        </div>`;
      }
      if(G.inUniversity){
        const dur=this._univDuration();
        const remaining=Math.max(0,dur-(G.univYear||0));
        h+=`<div class="row-card" style="border-color:var(--accent)">
          <span class="ri">🏛️</span>
          <div class="rd"><div class="rt">University — Year ${G.univYear||0}/${dur}</div><div class="rs">Graduating in ${remaining} year${remaining!==1?'s':''}</div></div>
        </div>
        <div class="act-grid">
          ${this._actionCard('📖','Study Extra','+Smarts faster','Career.studyUni()','studyUni')}
          ${this._actionCard('💼','Internship','+Smarts +Money','Career.internship()','internship')}
          ${this._actionCard('📝','Cheat / Sell Notes','Money + grades risk','Career.cheatSchool()','cheatSchool',false,true)}
          ${this._actionCard('🚪','Drop Out','Leave university','Career.dropout()','quit',false,true)}
        </div>`;
      }
    }

    if(!G.career&&!G.inUniversity){
      const avail=CAREERS.filter(j=>{
        if((G.age||0)<j.minAge)return false;
        if(j.req==='university'&&G.education!=='university')return false;
        if(j.req==='vocational'&&G.education!=='vocational'&&G.education!=='university')return false;
        return true;
      }).sort((a,b)=>this._jobFit(b).score-this._jobFit(a).score||b.salary-a.salary);
      h+=`<div class="sec">📋 Job Board (${avail.length} available)</div>`;
      if(!avail.length){
        h+=`<div class="empty"><p>No jobs match your profile yet.<br>Get more education or wait until you're older.</p></div>`;
      }else{
        avail.forEach(job=>{
          const fit=this._jobFit(job);
          const locked=this._usesLeft('apply')<=0;
          h+=`<div class="row-card ${locked?'locked':''}" onclick="${locked?'':`Career.apply('${job.id}')`}">
            <span class="ri">${job.icon}</span>
            <div class="rd">
              <div class="rt">${this._esc(job.title)}</div>
              <div class="rs">${this._esc(job.cat)} · Age ${job.minAge}+ · ${fit.label} chance · Stress +${job.stressAdd}/yr</div>
            </div>
            <div class="rv">${fmt(sc(job.salary))}/yr</div>
          </div>`;
        });
      }
    }

    h+=this._renderHistory();
    el.innerHTML=h;
  },

  _ensure(){
    const G=window.G;if(!G)return;
    if(!Array.isArray(G.careerHistory))G.careerHistory=[];
    if(!Array.isArray(G.educationHistory))G.educationHistory=[];
    if(!Array.isArray(G.careerEventMemory))G.careerEventMemory=[];
    if(!G.careerActionUses||typeof G.careerActionUses!=='object')G.careerActionUses={};
    if(!Number.isFinite(G.careerActionYear))G.careerActionYear=G.age||0;
    if(!Number.isFinite(G.jobPerf))G.jobPerf=G.career?52:50;
    if(!Number.isFinite(G.yearsAtJob))G.yearsAtJob=0;
    if(!Number.isFinite(G.promotionCount))G.promotionCount=0;
    if(!Number.isFinite(G.retirementPension))G.retirementPension=0;
    if(G.inUniversity&&!Number.isFinite(G.univYear))G.univYear=0;
    if(G.inUniversity&&!G.univType&&UNIVERSITIES?.[0])G.univType=UNIVERSITIES[0].id;
    this._resetActionYearIfNeeded();
    if(G.career)this._ensureBoss();
  },

  _resetActionYearIfNeeded(){
    const G=window.G;if(!G)return;
    if(!Number.isFinite(G.careerActionYear))G.careerActionYear=G.age||0;
    if(!G.careerActionUses||typeof G.careerActionUses!=='object')G.careerActionUses={};
    if(G.careerActionYear!==(G.age||0)){
      G.careerActionYear=G.age||0;
      G.careerActionUses={};
    }
  },

  _usesLeft(action){
    const G=window.G;if(!G)return 0;
    this._resetActionYearIfNeeded();
    const limit=this.ACTION_LIMITS[action]??99;
    const used=G.careerActionUses?.[action]||0;
    return Math.max(0,limit-used);
  },

  _canUseAction(action,msg='That career action is already used enough this year. Age up to refresh.'){
    if(this._usesLeft(action)<=0){UI.toast(msg,'bad');return false;}
    return true;
  },

  _markAction(action){
    const G=window.G;if(!G)return;
    this._resetActionYearIfNeeded();
    G.careerActionUses[action]=(G.careerActionUses[action]||0)+1;
  },

  _actionSummary(){
    const G=window.G;if(!G)return 'fresh year';
    this._resetActionYearIfNeeded();
    const used=Object.values(G.careerActionUses||{}).reduce((a,n)=>a+(Number(n)||0),0);
    return used?`${used} used age ${G.age}`:'fresh year';
  },

  _actionCard(icon,label,sub,onclick,action,forceLocked=false,danger=false){
    const left=action?this._usesLeft(action):99;
    const locked=forceLocked||left<=0;
    const leftTxt=action&&left<99?` · ${left} left`:'';
    return `<div class="card ${danger?'danger ':''}${locked?'locked':''}" onclick="${locked?'':onclick}"><span class="ci">${icon}</span><span class="cn">${this._esc(label)}</span><span class="cd">${this._esc(sub)}${leftTxt}</span></div>`;
  },

  _metricBox(label,value,sub,color){
    return `<div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">${this._esc(label)}</div><div class="nw-amt" style="font-size:22px${color?`;color:${color}`:''}">${this._esc(value)}</div><div class="nw-sub">${this._esc(sub)}</div></div>`;
  },

  _renderHistory(){
    const G=window.G;if(!G)return '';
    const career=(G.careerHistory||[]).slice(0,5);
    const edu=(G.educationHistory||[]).slice(0,4);
    if(!career.length&&!edu.length)return '';
    let h='<div class="sec">Career & Education History</div>';
    career.forEach(row=>{
      h+=`<div class="row-card"><span class="ri">${row.icon||'💼'}</span><div class="rd"><div class="rt">Age ${row.age} · ${this._esc(row.label)}</div><div class="rs">${this._esc(row.detail||'')}</div></div><div class="rv">${this._esc(row.type||'')}</div></div>`;
    });
    if(edu.length){
      h+=`<div class="info-box"><p>🎓 Education: ${edu.map(e=>`Age ${e.age} ${this._esc(e.label)}`).join(' · ')}</p></div>`;
    }
    return h;
  },

  _recordCareer(label,detail='',type='work',icon='💼'){
    const G=window.G;if(!G)return;
    if(!Array.isArray(G.careerHistory))G.careerHistory=[];
    G.careerHistory.unshift({age:G.age||0,label,detail,type,icon});
    if(G.careerHistory.length>this.HISTORY_LIMIT)G.careerHistory.length=this.HISTORY_LIMIT;
  },

  _recordEducation(label,detail='',icon='🎓'){
    const G=window.G;if(!G)return;
    if(!Array.isArray(G.educationHistory))G.educationHistory=[];
    G.educationHistory.unshift({age:G.age||0,label,detail,icon});
    if(G.educationHistory.length>this.HISTORY_LIMIT)G.educationHistory.length=this.HISTORY_LIMIT;
  },

  _rememberEvent(id){
    const G=window.G;if(!G)return;
    if(!Array.isArray(G.careerEventMemory))G.careerEventMemory=[];
    G.careerEventMemory.unshift({id,age:G.age||0});
    if(G.careerEventMemory.length>this.EVENT_MEMORY_LIMIT)G.careerEventMemory.length=this.EVENT_MEMORY_LIMIT;
  },

  _recentEvent(id,windowSize=4){
    const G=window.G;if(!G)return false;
    return (G.careerEventMemory||[]).slice(0,windowSize).some(e=>e.id===id);
  },

  _esc(s){
    return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  _scoreColor(v){
    const n=Number(v)||0;
    if(n>=75)return'var(--green)';
    if(n>=55)return'var(--teal)';
    if(n>=35)return'var(--yellow)';
    return'var(--red)';
  },

  _perf(){
    const G=window.G;
    return cl(Math.round(Number(G?.jobPerf??50)),0,100);
  },

  _perfMeta(perf=this._perf()){
    if(perf>85)return{label:'Excellent',color:'var(--green)'};
    if(perf>65)return{label:'Good',color:'var(--teal)'};
    if(perf>42)return{label:'Average',color:'var(--yellow)'};
    if(perf>22)return{label:'Poor',color:'var(--orange)'};
    return{label:'Terrible',color:'var(--red)'};
  },

  _careerHealth(){
    const G=window.G;
    const perf=this._perf();
    const stress=G?.stress||0;
    const boss=G?.careerBoss?.favor||40;
    const years=G?.yearsAtJob||0;
    const score=cl(Math.round(perf*.55+boss*.20+Math.min(15,years*2)-Math.max(0,stress-55)*.35+20));
    if(score>=78)return{score,label:'Promotion track',color:'var(--green)'};
    if(score>=58)return{score,label:'Stable role',color:'var(--teal)'};
    if(score>=38)return{score,label:'Needs attention',color:'var(--yellow)'};
    return{score,label:'Job at risk',color:'var(--red)'};
  },

  _burnoutRisk(){
    const G=window.G;
    if(!G)return 0;
    const stress=G.stress||0;
    const add=G.career?.stressAdd||0;
    const health=G.health||50;
    return cl(Math.round(stress*.65+add*2.2-Math.max(0,health-60)*.25),0,100);
  },

  _univDuration(){
    const G=window.G;
    const u=UNIVERSITIES.find(x=>x.id===G?.univType)||UNIVERSITIES[1]||UNIVERSITIES[0];
    return Math.max(1,Math.round(u?.duration||4));
  },

  _jobFit(job){
    const G=window.G;
    const smartBonus=G.trait==='ambitious'?8:G.trait==='intellectual'?6:0;
    const effectiveSmarts=(G.smarts||0)+smartBonus;
    const adultIndustry=job.cat==='Adult Entertainment';
    let base=effectiveSmarts>=job.smartsReq?0.74:effectiveSmarts>=job.smartsReq*0.6?0.42:0.22;
    const looksBonus=(G.looks||0)>70?0.08:0;
    const fameBonus=(G.fame||0)>25?0.08:0;
    const skillBonus=((G.skills?.negotiation||0)*0.025)+((G.skills?.leadership||0)*0.025);
    if(adultIndustry)base=Math.max(base,0.35+(G.looks||50)/250+((G.fame||0)/500));
    const chance=Math.min(0.95,base+looksBonus+(adultIndustry?fameBonus:0)+skillBonus);
    const pct=Math.round(chance*100);
    const label=pct>=75?'🟢 High':pct>=50?'🟡 Medium':pct>=30?'🟠 Fair':'🔴 Low';
    return{chance,pct,label,score:pct+(job.salary||0)/1000};
  },

  _bossGender(){
    const G=window.G;
    return G.gender==='female'?'male':'female';
  },

  _ensureBoss(){
    const G=window.G;
    if(!G||!G.career)return null;
    const gender=this._bossGender();
    if(!G.careerBoss||G.careerBoss.jobId!==G.career.id){
      G.careerBoss={
        jobId:G.career.id,
        name:typeof randomNameForCountry==='function'?randomNameForCountry(G.country?.name,gender):pick(gender==='female'?FNAMES:MNAMES),
        gender,
        age:Math.max((G.age||18)+6,r(28,58)),
        favor:r(12,38),
        attraction:r(35,85),
        lastFavorAge:-1,
      };
    }else{
      G.careerBoss.gender=gender;
      G.careerBoss.favor=Number.isFinite(G.careerBoss.favor)?G.careerBoss.favor:r(12,38);
      G.careerBoss.attraction=Number.isFinite(G.careerBoss.attraction)?G.careerBoss.attraction:r(35,85);
      G.careerBoss.lastFavorAge=Number.isFinite(G.careerBoss.lastFavorAge)?G.careerBoss.lastFavorAge:-1;
      if(!G.careerBoss.name)G.careerBoss.name=typeof randomNameForCountry==='function'?randomNameForCountry(G.country?.name,gender):pick(gender==='female'?FNAMES:MNAMES);
    }
    return G.careerBoss;
  },

  _clearBoss(){
    const G=window.G;
    if(G)G.careerBoss=null;
  },

  _workScandal(){
    const G=window.G;
    G.jobPerf=cl((G.jobPerf||50)-r(10,24));
    G.happiness=cl((G.happiness||50)-r(8,16));
    G.stress=cl((G.stress||0)+r(14,24));
    if(Math.random()<0.42){
      const t=G.career?.title||'your job';
      G.career=null;G.yearsAtJob=0;G.careerCompany='';G.jobPerf=50;
      this._clearBoss();
      if(!G.achievements)G.achievements={};
      G.achievements.fired=true;
      this._recordCareer('Fired after office scandal',t,'bad','🔥');
      Engine.log(`🔥 Office scandal exploded. You were fired from ${t}.`,'bad');
      Engine.checkAch();
      return true;
    }
    Engine.log('🔥 Rumours spread around the office. Your reputation took a hit.','bad');
    this._recordCareer('Office scandal',`Performance damaged at ${G.careerCompany||'work'}`,'bad','🔥');
    return false;
  },

  _relationshipFallout(){
    const G=window.G;
    const p=G.rels?.partner;
    if(!p)return;
    const caughtChance=(p.intimacy||35)>55?0.72:0.55;
    if(Math.random()>=caughtChance)return;
    p.intimacy=Math.max(0,(p.intimacy||35)-r(18,32));
    G.happiness=cl((G.happiness||50)-r(10,20));
    G.karma=cl((G.karma||0)-r(8,16),-100,100);
    if(p.married&&Math.random()<0.5){
      const split=Math.min(netWorth(G)*0.45,Math.max(0,(G.money||0)*0.55));
      if(split>0)G.money=Math.max(0,(G.money||0)-split);
      const alimony=Math.max(0,Math.floor((G.career?.salary||0)*0.12));
      G.alimony={amount:alimony,yearsLeft:r(2,5),recipient:p.name};
      Engine.log(`💔 Your spouse caught the affair. Divorce followed, costing ${fmt(split)}${alimony?` plus ${fmt(sc(alimony))}/yr alimony`:''}.`,'bad');
      if(typeof Relations!=='undefined'&&Relations._registerEx)Relations._registerEx(p,{cause:'cheating',causeLabel:'Cheating fallout'});
      G.rels.partner=null;
      return;
    }
    if(Math.random()<0.68){
      Engine.log(`💔 ${p.name} found out about the affair and left you.`,'bad');
      if(typeof Relations!=='undefined'&&Relations._registerEx)Relations._registerEx(p,{cause:'cheating',causeLabel:'Cheating fallout'});
      G.rels.partner=null;
      return;
    }
    Engine.log(`⚠️ ${p.name} found out about the affair. The relationship survived, but barely.`,'bad');
  },

  enroll(id){
    const G=window.G;this._ensure();
    if(!this._canUseAction('enroll'))return;
    const u=UNIVERSITIES.find(x=>x.id===id);if(!u)return;
    if(G.inUniversity){UI.toast('You are already in university.');return;}
    const cost=sc(u.cost);
    if((G.money||0)<cost&&(G.age||0)>22){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money=Math.max(0,(G.money||0)-cost);
    G.inUniversity=true;
    G.univYear=0;
    G.univType=id;
    this._markAction('enroll');
    this._recordEducation(`Enrolled at ${u.name}`,`${u.duration||4}-year journey`,'🏛️');
    Engine.log(`🏛️ Enrolled at ${u.name}! ${u.duration||4}-year journey begins.`,'special');
    G.smarts=cl((G.smarts||0)+5);
    UI.update();this.render();
  },

  vocational(){
    const G=window.G;this._ensure();
    if(!this._canUseAction('vocational'))return;
    const cost=sc(6000);
    if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money-=cost;
    G.education='vocational';
    this._markAction('vocational');
    this._recordEducation('Vocational certificate','Skilled jobs unlocked','🔧');
    Engine.log('🔧 Vocational training complete! Trade certificate earned.','good');
    G.smarts=cl((G.smarts||0)+7);
    UI.update();this.render();
  },

  studyUni(){
    const G=window.G;this._ensure();
    if(!G.inUniversity){UI.toast('You need to be in university.');return;}
    if(!this._canUseAction('studyUni'))return;
    this._markAction('studyUni');
    G.smarts=cl((G.smarts||0)+r(2,6));
    G.stress=cl((G.stress||0)+r(2,5));
    Engine.log('📖 Extra study session. Brain working overtime.','good');
    UI.update();this.render();
  },

  internship(){
    const G=window.G;this._ensure();
    if(!G.inUniversity){UI.toast('You need to be in university.');return;}
    if(!this._canUseAction('internship'))return;
    this._markAction('internship');
    const pay=sc(r(500,2000));
    G.money=(G.money||0)+pay;
    G.smarts=cl((G.smarts||0)+r(2,5));
    G.jobPerf=cl((G.jobPerf||50)+r(1,4));
    Engine.log(`💼 Internship! Gained experience and earned ${fmt(pay)}.`,'money');
    UI.update();this.render();
  },

  cheatSchool(){
    const G=window.G;this._ensure();
    if(!G.inUniversity){UI.toast('You need to be in university.');return;}
    if(!this._canUseAction('cheatSchool'))return;
    this._markAction('cheatSchool');
    const caughtChance=0.28+((G.smarts||0)<35?0.14:0)-(G.trait==='lucky'?0.08:0);
    if(Math.random()<caughtChance){
      G.smarts=cl((G.smarts||0)-r(3,8));
      G.happiness=cl((G.happiness||50)-r(8,14));
      G.stress=cl((G.stress||0)+r(12,20));
      if(Math.random()<0.35){
        G.inUniversity=false;G.univYear=0;
        this._recordEducation('Expelled from university','Caught cheating','📝');
        Engine.log('📝 You got caught cheating and were expelled from university. Brutal.','bad');
      }else{
        Engine.log('📝 You got caught cheating. Academic warning, stress spike, reputation damaged.','bad');
      }
    }else{
      const cash=sc(r(300,1800));
      G.money=(G.money||0)+cash;
      G.smarts=cl((G.smarts||0)+r(1,4));
      G.stress=cl((G.stress||0)+r(4,9));
      G.karma=cl((G.karma||0)-r(2,6),-100,100);
      Engine.log(`📝 You cheated smart and sold notes for ${fmt(cash)}. Risky money, questionable ethics.`,'money');
    }
    UI.update();this.render();
  },

  dropout(){
    const G=window.G;this._ensure();
    if(!G.inUniversity){UI.toast('You are not in university.');return;}
    if(!confirm('⚠️ Drop out of university?\n\nYou will lose your degree progress permanently. This cannot be undone.'))return;
    G.inUniversity=false;G.univYear=0;
    G.happiness=cl((G.happiness||50)-10);
    G.stress=cl((G.stress||0)-8);
    if(!G.achievements)G.achievements={};G.achievements.dropout=true;
    this._recordEducation('Dropped out','University progress lost','🚪');
    Engine.log('🚪 You dropped out of university. A controversial choice.','bad');
    Engine.checkAch();UI.update();this.render();
  },

  apply(id){
    const G=window.G;this._ensure();
    if(!this._canUseAction('apply'))return;
    if(G.career){UI.toast('You already have a job.');return;}
    const job=CAREERS.find(j=>j.id===id);if(!job)return;
    const fit=this._jobFit(job);
    this._markAction('apply');
    if(Math.random()<fit.chance){
      G.career={...job};
      G.yearsAtJob=0;
      G.careerCompany=pick(COMPANIES);
      G.jobPerf=52;
      G.careerBoss=null;
      this._ensureBoss();
      G.promotionCount=G.promotionCount||0;
      this._recordCareer(`Hired as ${job.title}`,`${G.careerCompany} · ${fmtFull(sc(job.salary))}/yr`,'good',job.icon||'💼');
      Engine.log(`🎉 Hired as ${job.title} at ${G.careerCompany}! ${fmtFull(sc(job.salary))}/yr`,'special');
      G.happiness=cl((G.happiness||50)+14);
    }else{
      Engine.log(`😞 Applied for ${job.title} but didn't get it this time. Keep improving.`,'bad');
      G.happiness=cl((G.happiness||50)-6);
    }
    UI.update();this.render();
  },

  workHard(){
    const G=window.G;this._ensure();
    if(!G.career)return;
    if(!this._canUseAction('workHard'))return;
    this._markAction('workHard');
    G.jobPerf=cl((G.jobPerf||50)+r(5,12));
    G.stress=cl((G.stress||0)+r(4,8));
    const raiseChance=0.28+(G.jobPerf||50)/220+((G.careerBoss?.favor||0)/400);
    if(Math.random()<raiseChance){
      const raise=Math.floor((G.career.salary||0)*(0.035+Math.random()*0.045));
      G.career.salary+=raise;
      Engine.log(`📈 Extra effort paid off — ${fmt(sc(raise))} raise!`,'special');
      G.happiness=cl((G.happiness||50)+9);
    }else{
      Engine.log('💪 You worked hard. Management noticed but no raise yet.','neutral');
    }
    UI.update();this.render();
  },

  askRaise(){
    const G=window.G;this._ensure();
    if(!G.career)return;
    if(!this._canUseAction('askRaise'))return;
    if((G.yearsAtJob||0)<1){UI.toast('Need at least 1 year of experience!');return;}
    const boss=this._ensureBoss();
    const chance=Math.min(.88,((G.jobPerf||50)>70?.56:(G.jobPerf||50)>50?.36:.18)+((boss?.favor||0)/300)+((G.skills?.negotiation||0)*.035));
    this._markAction('askRaise');
    if(Math.random()<chance){
      const pct=r(8,22);
      const raise=Math.floor((G.career.salary||0)*(pct/100));
      G.career.salary+=raise;
      G.money=(G.money||0)+sc(raise);
      G.promotionCount=(G.promotionCount||0)+1;
      if(boss)boss.favor=cl((boss.favor||0)+r(1,5),0,100);
      this._recordCareer('Raise approved',`+${pct}% · ${fmtFull(sc(G.career.salary))}/yr`,'good','📈');
      Engine.log(`🏆 Raise approved: +${pct}% — now ${fmtFull(sc(G.career.salary))}/yr`,'special');
      G.happiness=cl((G.happiness||50)+16);
      Engine.checkAch();
    }else{
      if(boss)boss.favor=cl((boss.favor||0)-r(1,4),0,100);
      Engine.log('📋 Raise denied. "Come back next review cycle."','neutral');
      G.happiness=cl((G.happiness||50)-6);
    }
    UI.update();this.render();
  },

  network(){
    const G=window.G;this._ensure();
    if(!this._canUseAction('network'))return;
    this._markAction('network');
    G.smarts=cl((G.smarts||0)+r(2,5));
    G.happiness=cl((G.happiness||50)+r(3,7));
    G.jobPerf=cl((G.jobPerf||50)+r(2,5));
    if(G.careerBoss)G.careerBoss.favor=cl((G.careerBoss.favor||0)+r(1,4),0,100);
    Engine.log('🤝 Networking event. Great contacts and new opportunities.','good');
    UI.update();this.render();
  },

  takeCourse(){
    const G=window.G;this._ensure();
    if(!this._canUseAction('takeCourse'))return;
    const cost=sc(300);
    if((G.money||0)<cost){UI.toast('Need '+fmt(cost)+'!');return;}
    G.money-=cost;
    this._markAction('takeCourse');
    G.smarts=cl((G.smarts||0)+r(4,9));
    G.jobPerf=cl((G.jobPerf||50)+r(3,7));
    Engine.log('📚 Professional course completed. Skills levelled up.','good');
    UI.update();this.render();
  },

  suckyUp(){
    const G=window.G;this._ensure();
    if(!G.career)return;
    if(!this._canUseAction('suckUp'))return;
    this._markAction('suckUp');
    const boss=this._ensureBoss();
    if(Math.random()>0.38){
      G.jobPerf=cl((G.jobPerf||50)+r(5,12));
      G.happiness=cl((G.happiness||50)-r(1,3));
      if(boss)boss.favor=cl((boss.favor||0)+r(5,11),0,100);
      Engine.log('😊 Complimenting the boss worked. Performance score up.','good');
    }else{
      if(boss)boss.favor=cl((boss.favor||0)-r(4,9),0,100);
      G.happiness=cl((G.happiness||50)-r(3,6));
      Engine.log('😊 Your sucking up was painfully obvious to everyone.','bad');
    }
    UI.update();this.render();
  },

  sleepWithBoss(){
    const G=window.G;this._ensure();
    if(!G.career){UI.toast('You need a job first.');return;}
    if((G.age||0)<18){UI.toast('Adults only.');return;}
    if(!this._canUseAction('bossAffair'))return;
    const boss=this._ensureBoss();
    if((boss?.lastFavorAge||-1)===G.age){UI.toast('That office shortcut is already used this year.');return;}
    const choose=(typeof Relations!=='undefined'&&Relations._chooseProtection)?Relations._chooseProtection.bind(Relations):(cb=>cb(true));
    choose(protectedSex=>{
      if(!window.G?.career)return;
      this._markAction('bossAffair');
      const chemistry=((boss.attraction||50)+(G.looks||50)+(G.smarts||50)+((G.skills?.negotiation||0)*6)+((G.skills?.beauty||0)*5))/4;
      const scandalChance=Math.max(0.12,0.34-((boss.favor||0)/250)-(protectedSex?0.04:0)+(G.rels?.partner?0.08:0));
      const bonusBase=(G.career.salary||0)*(0.05+Math.random()*0.11);
      const bossPartner={id:`boss_${G.career.id}`,name:boss.name,gender:boss.gender,age:boss.age};
      if(typeof Relations!=='undefined'&&Relations._recordEncounter){
        Relations._recordEncounter(bossPartner,{protectedSex,baseSti:0.04,pregnancyBoost:0.7,forcedKeep:null,logText:`🔥 You slept with your boss ${boss.name}.`,logType:'bad'});
      }
      boss.lastFavorAge=G.age;
      if(chemistry>=58){
        const cash=sc(Math.round(bonusBase));
        const raisePct=r(4,11);
        G.money=(G.money||0)+cash;
        G.jobPerf=cl((G.jobPerf||50)+r(8,16));
        G.happiness=cl((G.happiness||50)+r(4,10));
        G.stress=cl((G.stress||0)+r(4,9));
        boss.favor=cl((boss.favor||0)+r(12,22),0,100);
        if(Math.random()<0.52){
          const raise=Math.floor((G.career.salary||0)*(raisePct/100));
          G.career.salary+=raise;
          G.promotionCount=(G.promotionCount||0)+1;
          Engine.log(`🔥 The affair paid off at work. Your boss pushed through a ${raisePct}% raise and a ${fmt(cash)} bonus.`,'special');
        }else{
          Engine.log(`🔥 Your boss rewarded the fling with a ${fmt(cash)} bonus and better treatment at work.`,'special');
        }
      }else{
        G.jobPerf=cl((G.jobPerf||50)-r(4,10));
        G.happiness=cl((G.happiness||50)-r(4,9));
        G.stress=cl((G.stress||0)+r(8,15));
        boss.favor=cl((boss.favor||0)-r(6,12),0,100);
        Engine.log('🔥 Sleeping with your boss turned awkward and did not help your position.','bad');
      }
      this._recordCareer('Office affair',`Boss favor ${boss.favor}/100 · scandal risk taken`,'risk','🔥');
      if(Math.random()<scandalChance){
        const fired=this._workScandal();
        if(fired){UI.update();this.render();return;}
      }
      if(G.rels?.partner)this._relationshipFallout();
      UI.update();this.render();
    },{risky:true,title:'Office Affair',text:`Sleep with your boss ${boss.name}? This may help your career, but it can wreck your job and relationship.`});
  },

  sabotage(){
    const G=window.G;this._ensure();
    if(!G.career)return;
    if(!this._canUseAction('sabotage'))return;
    this._markAction('sabotage');
    if(Math.random()>0.45){
      G.jobPerf=cl((G.jobPerf||50)+r(5,10));
      G.karma=cl((G.karma||0)-r(5,10),-100,100);
      Engine.log('😈 Sabotage worked. Rival passed over for the promotion.','bad');
    }else{
      G.jobPerf=cl((G.jobPerf||50)-r(15,30));
      G.happiness=cl((G.happiness||50)-10);
      if(Math.random()<0.35){
        if(!G.achievements)G.achievements={};G.achievements.fired=true;
        const t=G.career?.title||'your job';
        G.career=null;G.yearsAtJob=0;G.careerCompany='';G.jobPerf=50;
        this._clearBoss();
        this._recordCareer('Fired for sabotage',t,'bad','😈');
        Engine.log('😈 Sabotage discovered. Fired on the spot.','bad');
        Engine.checkAch();UI.update();this.render();return;
      }
      Engine.log('😈 Sabotage backfired. Trust completely destroyed.','bad');
    }
    UI.update();this.render();
  },

  blowOff(){
    const G=window.G;this._ensure();
    if(!G.career)return;
    if(!this._canUseAction('blowOff'))return;
    this._markAction('blowOff');
    G.happiness=cl((G.happiness||50)+r(8,14));
    G.jobPerf=cl((G.jobPerf||50)-r(5,12));
    G.stress=cl((G.stress||0)-r(5,10));
    Engine.log('🏖️ Skipped work to enjoy the day. Worth it... probably.','neutral');
    UI.update();this.render();
  },

  quit(){
    const G=window.G;this._ensure();
    if(!G.career)return;
    if(!confirm(`⚠️ Quit your job as ${G.career.title}?\n\nThis is permanent — you'll lose your income immediately.`))return;
    const t=G.career.title;
    this._recordCareer('Resigned',t,'neutral','🚪');
    G.career=null;G.yearsAtJob=0;G.careerCompany='';G.jobPerf=50;
    this._clearBoss();
    G.happiness=cl((G.happiness||50)-7);
    G.stress=cl((G.stress||0)-10);
    Engine.log(`🚪 Resigned from ${t}. A new chapter begins.`,'neutral');
    UI.update();this.render();
  },

  _pensionEstimate(){
    const G=window.G;
    if(!G?.career)return 0;
    const perfBonus=Math.max(0,(G.jobPerf||50)-50)*18;
    return Math.floor((G.career.salary*0.28)+((G.yearsAtJob||0)*250)+perfBonus);
  },

  retire(){
    const G=window.G;this._ensure();
    if(!G.career)return;
    if((G.age||0)<55){UI.toast('Retirement unlocks at age 55.');return;}
    if(!this._canUseAction('retire'))return;
    const pension=this._pensionEstimate();
    G.retirementPension=pension;
    G.retired=true;
    const t=G.career.title;
    this._markAction('retire');
    this._recordCareer('Retired',`${t} · Pension ${fmt(sc(pension))}/yr`,'special','🏖️');
    G.career=null;G.yearsAtJob=0;G.careerCompany='';
    this._clearBoss();
    G.happiness=cl((G.happiness||50)+22);
    G.stress=cl((G.stress||0)-20);
    Engine.log(`🏖️ Retired from career as ${t}! Pension: ${fmt(sc(pension))}/yr. Golden years begin!`,'special');
    if(!G.achievements)G.achievements={};G.achievements.retired=true;
    Engine.checkAch();UI.update();this.render();
  },

  educTick(){
    const G=window.G;if(!G)return;
    this._ensure();
    if((G.age||0)===5){Engine.log('🏫 Started elementary school.','neutral');G.inSchool=true;this._recordEducation('Started elementary school','','🏫');}
    if((G.age||0)===14){Engine.log('📓 Started high school.','neutral');this._recordEducation('Started high school','','📓');}
    if(G.inSchool){G.smarts=cl((G.smarts||0)+r(1,3));}
    if(G.inUniversity){
      G.smarts=cl((G.smarts||0)+r(2,5));
      G.univYear=(G.univYear||0)+1;
      G.stress=cl((G.stress||0)+r(2,4));
    }
    if((G.age||0)===18&&G.inSchool){
      G.inSchool=false;
      G.education='high_school';
      this._recordEducation('Graduated high school','','🎓');
      Engine.log('🎓 Graduated from high school!','special');
      G.happiness=cl((G.happiness||50)+13);
    }
    if(G.inUniversity&&(G.univYear||0)>=this._univDuration()){
      G.inUniversity=false;
      G.education='university';
      const u=UNIVERSITIES.find(x=>x.id===G.univType)||UNIVERSITIES[1]||UNIVERSITIES[0];
      this._recordEducation(`Graduated from ${u.name}`,'University degree earned','🎓');
      Engine.log(`🎓 Graduated from ${u.name} with a degree! The world is yours.`,'special');
      G.happiness=cl((G.happiness||50)+22);
      G.smarts=cl((G.smarts||0)+(u.smartsBonus||8));
      Engine.checkAch();
    }
  },

  incomeTick(){
    const G=window.G;if(!G)return;
    this._ensure();
    if(!G.career)return;
    const income=sc(G.career.salary);
    G.money=(G.money||0)+income;
    G.yearsAtJob=(G.yearsAtJob||0)+1;
    G.stress=cl((G.stress||0)+(G.career.stressAdd||6));

    if((G.retirementPension||0)>0&&G.retired){
      G.money=(G.money||0)+sc(G.retirementPension||0);
    }

    if(G.yearsAtJob%2===0){
      G.career={...G.career,salary:Math.floor((G.career.salary||0)*1.04)};
    }

    this._rollCareerEvent();

    G.jobPerf=cl((G.jobPerf||50)+r(-3,4));
    if(this._burnoutRisk()>72&&Math.random()<0.18){
      G.health=cl((G.health||50)-r(2,6));
      G.jobPerf=cl((G.jobPerf||50)-r(2,6));
      Engine.log('🧯 Burnout caught up with you. Health and performance took a hit.','bad');
    }

    if((G.jobPerf||50)<8&&Math.random()<0.32){
      const t=G.career.title;
      G.career=null;G.yearsAtJob=0;G.careerCompany='';G.jobPerf=50;
      this._clearBoss();
      if(!G.achievements)G.achievements={};G.achievements.fired=true;
      this._recordCareer('Fired for poor performance',t,'bad','🚪');
      Engine.log(`🚪 Fired from ${t} due to poor performance!`,'bad');
      G.happiness=cl((G.happiness||50)-14);
      Engine.checkAch();
    }
  },

  _rollCareerEvent(){
    const G=window.G;
    if(!G?.career)return;
    const pool=[];
    const perf=G.jobPerf||50;
    const boss=G.careerBoss?.favor||40;
    const stress=G.stress||0;

    pool.push({id:'review',weight:perf>65?.12:.06,run:()=>{
      const msgs=['Positive performance review this quarter.','Navigated a tough project with success.','Mentored a junior team member.','Got recognition from senior management.','Delivered an outstanding client presentation.'];
      G.jobPerf=cl((G.jobPerf||50)+r(1,5));
      Engine.log(`💼 ${pick(msgs)}`,'neutral');
    }});

    pool.push({id:'boss_help',weight:boss>60?.08:.025,run:()=>{
      G.jobPerf=cl((G.jobPerf||50)+r(2,6));
      G.happiness=cl((G.happiness||50)+r(2,5));
      Engine.log('🧭 Your boss quietly backed you on a difficult work issue.','good');
    }});

    pool.push({id:'deadline',weight:stress>65?.11:.04,run:()=>{
      G.stress=cl((G.stress||0)+r(4,9));
      G.jobPerf=cl((G.jobPerf||50)+r(-3,4));
      Engine.log('⏱️ A brutal deadline made work feel heavier this year.','bad');
    }});

    pool.push({id:'opportunity',weight:perf>72?.08:.03,run:()=>{
      const bonus=sc(Math.floor((G.career.salary||0)*r(2,6)/100));
      G.money=(G.money||0)+bonus;
      G.jobPerf=cl((G.jobPerf||50)+r(2,5));
      Engine.log(`🌟 A visible work opportunity paid a ${fmt(bonus)} bonus.`,'money');
    }});

    const fresh=pool.filter(e=>!this._recentEvent(e.id,3));
    let roll=Math.random(),sum=0;
    for(const evt of fresh){
      sum+=evt.weight;
      if(roll<sum){
        this._rememberEvent(evt.id);
        evt.run();
        return;
      }
    }
  },
};