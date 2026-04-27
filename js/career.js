/* js/career.js — LifeSim v8 */
const Career={
  render(){
    const G=window.G; if(!G)return;
    const el=document.getElementById('tab-career');
    let h='';
    if(G.age<16){el.innerHTML='<div class="empty"><span class="ei">🎒</span><p>Still in school!<br>Jobs unlock at age 16.</p></div>';return;}

    if(G.retired){
      h+=`<div class="info-box" style="border-color:rgba(74,222,128,.4);background:rgba(74,222,128,.06)">
        <p>🏖️ <strong>Retired!</strong> Pension: <strong>${fmt(sc(G.retirementPension||0))}/yr</strong> arrives automatically. Enjoy your golden years!</p>
      </div>`;
    }

    if(G.career){
      const boss=this._ensureBoss();
      const perf=G.jobPerf||50;
      const perfLbl=perf>80?'Excellent':perf>60?'Good':perf>40?'Average':perf>20?'Poor':'Terrible';
      const perfC=perf>80?'var(--green)':perf>60?'var(--teal)':perf>40?'var(--yellow)':perf>20?'var(--orange)':'var(--red)';
      const stress=G.career.stressAdd||6;
      h+=`<div class="career-hero">
        <div class="ch-ico">${G.career.icon}</div>
        <div class="ch-title">${G.career.title}</div>
        <div class="ch-co">${G.careerCompany} · ${G.career.cat}</div>
        <div class="ch-sal">${fmtFull(sc(G.career.salary))} / year</div>
        <div class="ch-meta">📅 ${G.yearsAtJob} yr${G.yearsAtJob!==1?'s':''} · ⭐ Prestige ${G.career.prestige} · 😤 Stress +${stress}/yr</div>
      </div>
      <div class="info-box" style="margin-bottom:12px">
        <p><strong>Boss:</strong> ${boss.name} · Favor ${boss.favor||0}/100 · Attraction ${boss.attraction||0}/100. Office politics can help you or destroy you.</p>
      </div>
      <div style="margin-bottom:12px">
        <div class="sb-top" style="margin-bottom:4px"><span class="sb-l">Job Performance</span><span class="sb-v" style="color:${perfC}">${perfLbl} (${perf}%)</span></div>
        <div class="prog-bar"><div class="prog-fill" style="width:${perf}%;background:${perfC}"></div></div>
      </div>
      <div class="act-grid">
        <div class="card" onclick="Career.workHard()"><span class="ci">💪</span><span class="cn">Work Hard</span><span class="cd">+Performance +Stress</span></div>
        <div class="card" onclick="Career.askRaise()"><span class="ci">📈</span><span class="cn">Ask for Raise</span><span class="cd">Negotiate salary</span></div>
        <div class="card" onclick="Career.network()"><span class="ci">🤝</span><span class="cn">Network</span><span class="cd">+Smart +Performance</span></div>
        <div class="card" onclick="Career.takeCourse()"><span class="ci">📚</span><span class="cn">Take Course</span><span class="cd">+Smarts (${fmt(sc(300))})</span></div>
      </div>
      <div class="act-grid" style="margin-top:8px">
        <div class="card" onclick="Career.suckyUp()"><span class="ci">😊</span><span class="cn">Suck Up to Boss</span><span class="cd">+Performance</span></div>
        <div class="card danger" onclick="Career.sleepWithBoss()"><span class="ci">🔥</span><span class="cn">Sleep With Boss</span><span class="cd">Big bonus, big risk</span></div>
        <div class="card" onclick="Career.sabotage()"><span class="ci">😈</span><span class="cn">Sabotage Colleague</span><span class="cd">Risky!</span></div>
        <div class="card" onclick="Career.blowOff()"><span class="ci">🏖️</span><span class="cn">Skip Work</span><span class="cd">+Hap −Performance</span></div>
        <div class="card danger" onclick="Career.quit()"><span class="ci">🚪</span><span class="cn">Quit Job</span><span class="cd">Resign</span></div>
      </div>`;

      if(G.age>=55){
        const pension=Math.floor((G.career.salary*0.28)+((G.yearsAtJob||0)*250));
        h+=`<div class="row-card" onclick="Career.retire()" style="margin-top:12px;border-color:rgba(251,191,36,.5);background:rgba(251,191,36,.06)">
          <span class="ri">🏖️</span>
          <div class="rd"><div class="rt" style="color:var(--yellow)">Retire Now</div>
          <div class="rs">Age 55+ · Pension: ~${fmt(sc(pension))}/yr</div></div>
          <div class="rv" style="color:var(--yellow)">✓</div>
        </div>`;
      }
    }

    if(!G.career){
      if(G.inSchool){h+=`<div class="info-box"><p>📚 Currently in school — age ${G.age}. Study hard to unlock more options!</p></div>`;}
      if(G.education==='high_school'&&!G.inUniversity&&G.age>=18&&G.age<=35){
        h+=`<div class="sec">🎓 Higher Education</div>`;
        UNIVERSITIES.forEach(u=>{
          const cost=sc(u.cost); const can=G.money>=cost||G.age<=22;
          h+=`<div class="row-card ${can?'':'locked'}" onclick="${can?`Career.enroll('${u.id}')`:``}">
            <span class="ri">🏛️</span>
            <div class="rd"><div class="rt">${u.name}</div><div class="rs">${u.label} · +${u.smartsBonus} Smarts · ${u.duration} yrs</div></div>
            <div class="rv">${fmt(cost)}</div>
          </div>`;
        });
        h+=`<div class="row-card" onclick="Career.vocational()">
          <span class="ri">🔧</span>
          <div class="rd"><div class="rt">Vocational Training</div><div class="rs">2-yr trade cert · Skilled jobs · Faster path</div></div>
          <div class="rv">${fmt(sc(6000))}</div>
        </div>`;
      }
      if(G.inUniversity){
        h+=`<div class="row-card" style="border-color:var(--accent)">
          <span class="ri">🏛️</span>
          <div class="rd"><div class="rt">University — Year ${G.univYear}/4</div><div class="rs">Graduating in ${4-G.univYear} year${4-G.univYear!==1?'s':''}</div></div>
        </div>
        <div class="act-grid">
          <div class="card" onclick="Career.studyUni()"><span class="ci">📖</span><span class="cn">Study Extra</span><span class="cd">+Smarts faster</span></div>
          <div class="card" onclick="Career.internship()"><span class="ci">💼</span><span class="cn">Internship</span><span class="cd">+Smarts +Money</span></div>
          <div class="card danger" onclick="Career.cheatSchool()"><span class="ci">📝</span><span class="cn">Cheat / Sell Notes</span><span class="cd">Money + grades risk</span></div>
          <div class="card danger" onclick="Career.dropout()"><span class="ci">🚪</span><span class="cn">Drop Out</span><span class="cd">Leave university</span></div>
        </div>`;
      }
    }

    if(!G.career&&!G.inUniversity){
      const avail=CAREERS.filter(j=>{
        if(G.age<j.minAge)return false;
        if(j.req==='university'&&G.education!=='university')return false;
        if(j.req==='vocational'&&G.education!=='vocational'&&G.education!=='university')return false;
        return true;
      });
      h+=`<div class="sec">📋 Job Board (${avail.length} available)</div>`;
      if(!avail.length){h+=`<div class="empty"><p>No jobs match your profile yet.<br>Get more education or wait until you're older.</p></div>`;}
      else{
        avail.forEach(job=>{
          const smartOk=G.smarts>=job.smartsReq;
          const chance=smartOk?(G.smarts>75?'🟢 High':G.smarts>50?'🟡 Medium':'🟠 Fair'):'🔴 Low';
          h+=`<div class="row-card" onclick="Career.apply('${job.id}')">
            <span class="ri">${job.icon}</span>
            <div class="rd">
              <div class="rt">${job.title}</div>
              <div class="rs">${job.cat} · Age ${job.minAge}+ · ${chance} chance · Stress +${job.stressAdd}/yr</div>
            </div>
            <div class="rv">${fmt(sc(job.salary))}/yr</div>
          </div>`;
        });
      }
    }
    el.innerHTML=h;
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
        age:Math.max(G.age+6, r(28,58)),
        favor:r(12,38),
        attraction:r(35,85),
        lastFavorAge:-1,
      };
    }else{
      G.careerBoss.gender=gender;
      G.careerBoss.favor=Number.isFinite(G.careerBoss.favor)?G.careerBoss.favor:r(12,38);
      G.careerBoss.attraction=Number.isFinite(G.careerBoss.attraction)?G.careerBoss.attraction:r(35,85);
      G.careerBoss.lastFavorAge=Number.isFinite(G.careerBoss.lastFavorAge)?G.careerBoss.lastFavorAge:-1;
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
    G.happiness=cl(G.happiness-r(8,16));
    G.stress=cl((G.stress||0)+r(14,24));
    if(Math.random()<0.42){
      const t=G.career?.title||'your job';
      G.career=null; G.yearsAtJob=0; G.careerCompany=''; G.jobPerf=50;
      this._clearBoss();
      if(!G.achievements)G.achievements={};
      G.achievements.fired=true;
      Engine.log(`🔥 Office scandal exploded. You were fired from ${t}.`,'bad');
      Engine.checkAch();
      return true;
    }
    Engine.log('🔥 Rumours spread around the office. Your reputation took a hit.','bad');
    return false;
  },

  _relationshipFallout(){
    const G=window.G;
    const p=G.rels?.partner;
    if(!p)return;
    const caughtChance=(p.intimacy||35)>55?0.72:0.55;
    if(Math.random()>=caughtChance)return;
    p.intimacy=Math.max(0,(p.intimacy||35)-r(18,32));
    G.happiness=cl(G.happiness-r(10,20));
    G.karma=cl((G.karma||0)-r(8,16),-100,100);
    if(p.married&&Math.random()<0.5){
      const split=Math.min(netWorth(G)*0.45,Math.max(0,G.money*0.55));
      if(split>0)G.money=Math.max(0,G.money-split);
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
    const G=window.G; const u=UNIVERSITIES.find(x=>x.id===id); if(!u)return;
    const cost=sc(u.cost);
    if(G.money<cost&&G.age>22){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money=Math.max(0,G.money-cost); G.inUniversity=true; G.univYear=0; G.univType=id;
    Engine.log(`🏛️ Enrolled at ${u.name}! ${u.duration}-year journey begins.`,'special');
    G.smarts=cl(G.smarts+5); UI.update(); this.render();
  },

  vocational(){
    const G=window.G; const cost=sc(6000);
    if(G.money<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money-=cost; G.education='vocational';
    Engine.log('🔧 Vocational training complete! Trade certificate earned.','good');
    G.smarts=cl(G.smarts+7); UI.update(); this.render();
  },

  studyUni(){
    const G=window.G;
    G.smarts=cl(G.smarts+r(2,6)); G.stress=cl((G.stress||0)+r(2,5));
    Engine.log('📖 Extra study session. Brain working overtime.','good'); UI.update();
  },

  internship(){
    const G=window.G;
    const pay=sc(r(500,2000)); G.money+=pay;
    G.smarts=cl(G.smarts+r(2,5));
    Engine.log(`💼 Internship! Gained experience and earned ${fmt(pay)}.`,'money'); UI.update();
  },

  cheatSchool(){
    const G=window.G;
    if(!G.inUniversity){UI.toast('You need to be in university.');return;}
    const caughtChance=0.28+(G.smarts<35?0.14:0)-(G.trait==='lucky'?0.08:0);
    if(Math.random()<caughtChance){
      G.smarts=cl(G.smarts-r(3,8));
      G.happiness=cl(G.happiness-r(8,14));
      G.stress=cl((G.stress||0)+r(12,20));
      if(Math.random()<0.35){
        G.inUniversity=false; G.univYear=0;
        Engine.log('📝 You got caught cheating and were expelled from university. Brutal.', 'bad');
      }else{
        Engine.log('📝 You got caught cheating. Academic warning, stress spike, reputation damaged.', 'bad');
      }
    }else{
      const cash=sc(r(300,1800));
      G.money+=cash;
      G.smarts=cl(G.smarts+r(1,4));
      G.stress=cl((G.stress||0)+r(4,9));
      G.karma=cl((G.karma||0)-r(2,6),-100,100);
      Engine.log(`📝 You cheated smart and sold notes for ${fmt(cash)}. Risky money, questionable ethics.`, 'money');
    }
    UI.update(); this.render();
  },

  dropout(){
    const G=window.G;
    if(!confirm('⚠️ Drop out of university?\n\nYou will lose your degree progress permanently. This cannot be undone.'))return;
    G.inUniversity=false; G.univYear=0; G.happiness=cl(G.happiness-10); G.stress=cl((G.stress||0)-8);
    if(!G.achievements)G.achievements={}; G.achievements.dropout=true;
    Engine.log('🚪 You dropped out of university. A controversial choice.','bad');
    Engine.checkAch(); UI.update(); this.render();
  },

  apply(id){
    const G=window.G; const job=CAREERS.find(j=>j.id===id); if(!job)return;
    // Trait bonus for ambitious
    const smartBonus=G.trait==='ambitious'?8:G.trait==='intellectual'?6:0;
    const effectiveSmarts=G.smarts+smartBonus;
    let base=effectiveSmarts>job.smartsReq?0.74:effectiveSmarts>job.smartsReq*0.6?0.42:0.22;
    const adultIndustry=job.cat==='Adult Entertainment';
    const looksBonus=G.looks>70?0.08:0;
    const fameBonus=(G.fame||0)>25?0.08:0;
    if(adultIndustry)base=Math.max(base,0.35+(G.looks||50)/250+((G.fame||0)/500));
    const chance=Math.min(0.95,base+looksBonus+(adultIndustry?fameBonus:0));
    if(Math.random()<chance){
      G.career={...job}; G.yearsAtJob=0; G.careerCompany=pick(COMPANIES); G.jobPerf=52;
      G.careerBoss=null; this._ensureBoss();
      G.promotionCount=G.promotionCount||0;
      Engine.log(`🎉 Hired as ${job.title} at ${G.careerCompany}! ${fmtFull(sc(job.salary))}/yr`,'special');
      G.happiness=cl(G.happiness+14);
    } else {
      Engine.log(`😞 Applied for ${job.title} but didn't get it this time. Keep improving.`,'bad');
      G.happiness=cl(G.happiness-6);
    }
    UI.update(); this.render();
  },

  workHard(){
    const G=window.G; if(!G.career)return;
    G.jobPerf=cl((G.jobPerf||50)+r(5,12)); G.stress=cl((G.stress||0)+r(4,8));
    if(Math.random()>0.42){
      const raise=Math.floor(G.career.salary*0.06); G.career.salary+=raise;
      Engine.log(`📈 Extra effort paid off — ${fmt(sc(raise))} raise!`,'special');
      G.happiness=cl(G.happiness+9);
    } else {
      Engine.log('💪 You worked hard. Management noticed but no raise yet.','neutral');
    }
    UI.update(); this.render();
  },

  askRaise(){
    const G=window.G; if(!G.career)return;
    if(G.yearsAtJob<1){UI.toast('Need at least 1 year of experience!');return;}
    const chance=(G.jobPerf>70)?0.68:(G.jobPerf>50)?0.45:0.25;
    if(Math.random()<chance){
      const pct=r(8,22); const raise=Math.floor(G.career.salary*(pct/100));
      G.career.salary+=raise; G.money+=sc(raise);
      G.promotionCount=(G.promotionCount||0)+1;
      Engine.log(`🏆 Raise approved: +${pct}% — now ${fmtFull(sc(G.career.salary))}/yr`,'special');
      G.happiness=cl(G.happiness+16); Engine.checkAch();
    } else {
      Engine.log('📋 Raise denied. "Come back next review cycle."','neutral');
      G.happiness=cl(G.happiness-6);
    }
    UI.update(); this.render();
  },

  network(){
    const G=window.G;
    G.smarts=cl(G.smarts+r(2,5)); G.happiness=cl(G.happiness+r(3,7));
    G.jobPerf=cl((G.jobPerf||50)+r(2,5));
    Engine.log('🤝 Networking event. Great contacts and new opportunities.','good');
    UI.update(); this.render();
  },

  takeCourse(){
    const G=window.G; const cost=sc(300);
    if(G.money<cost){UI.toast('Need '+fmt(cost)+'!');return;}
    G.money-=cost; G.smarts=cl(G.smarts+r(4,9)); G.jobPerf=cl((G.jobPerf||50)+r(3,7));
    Engine.log('📚 Professional course completed. Skills levelled up.','good');
    UI.update(); this.render();
  },

  suckyUp(){
    const G=window.G;
    const boss=this._ensureBoss();
    if(Math.random()>0.38){
      G.jobPerf=cl((G.jobPerf||50)+r(5,12)); G.happiness=cl(G.happiness-r(1,3));
      if(boss)boss.favor=cl((boss.favor||0)+r(5,11),0,100);
      Engine.log('😊 Complimenting the boss worked. Performance score up.','good');
    } else {
      if(boss)boss.favor=cl((boss.favor||0)-r(4,9),0,100);
      G.happiness=cl(G.happiness-r(3,6));
      Engine.log('😊 Your sucking up was painfully obvious to everyone.','bad');
    }
    UI.update(); this.render();
  },

  sleepWithBoss(){
    const G=window.G;
    if(!G.career){UI.toast('You need a job first.');return;}
    if(G.age<16){UI.toast('Adults only.');return;}
    const boss=this._ensureBoss();
    if((boss?.lastFavorAge||-1)===G.age){UI.toast('That office shortcut is already used this year.');return;}
    const choose=(typeof Relations!=='undefined'&&Relations._chooseProtection)?Relations._chooseProtection.bind(Relations):(cb=>cb(true));
    choose(protectedSex=>{
      const chemistry=((boss.attraction||50)+(G.looks||50)+(G.smarts||50)+((G.skills?.negotiation||0)*6)+((G.skills?.beauty||0)*5))/4;
      const scandalChance=Math.max(0.12,0.34-((boss.favor||0)/250)-(protectedSex?0.04:0)+((G.rels?.partner)?0.08:0));
      const bonusBase=(G.career.salary||0)*(0.05+Math.random()*0.11);
      const bossPartner={id:`boss_${G.career.id}`,name:boss.name,gender:boss.gender,age:boss.age};
      if(typeof Relations!=='undefined'&&Relations._recordEncounter){
        Relations._recordEncounter(bossPartner,{
          protectedSex,
          baseSti:0.04,
          pregnancyBoost:0.7,
          forcedKeep:null,
          logText:`🔥 You slept with your boss ${boss.name}.`,
          logType:'bad',
        });
      }
      boss.lastFavorAge=G.age;
      if(chemistry>=58){
        const cash=sc(Math.round(bonusBase));
        const raisePct=r(4,11);
        G.money+=cash;
        G.jobPerf=cl((G.jobPerf||50)+r(8,16));
        G.happiness=cl(G.happiness+r(4,10));
        G.stress=cl((G.stress||0)+r(4,9));
        boss.favor=cl((boss.favor||0)+r(12,22),0,100);
        if(Math.random()<0.52){
          const raise=Math.floor((G.career.salary||0)*(raisePct/100));
          G.career.salary+=raise;
          G.promotionCount=(G.promotionCount||0)+1;
          Engine.log(`🔥 The affair paid off at work. Your boss pushed through a ${raisePct}% raise and a ${fmt(cash)} bonus.`, 'special');
        }else{
          Engine.log(`🔥 Your boss rewarded the fling with a ${fmt(cash)} bonus and better treatment at work.`, 'special');
        }
      }else{
        G.jobPerf=cl((G.jobPerf||50)-r(4,10));
        G.happiness=cl(G.happiness-r(4,9));
        G.stress=cl((G.stress||0)+r(8,15));
        boss.favor=cl((boss.favor||0)-r(6,12),0,100);
        Engine.log('🔥 Sleeping with your boss turned awkward and did not help your position.', 'bad');
      }
      if(Math.random()<scandalChance){
        const fired=this._workScandal();
        if(fired){UI.update(); this.render(); return;}
      }
      if(G.rels?.partner)this._relationshipFallout();
      UI.update(); this.render();
    },{
      risky:true,
      title:'Office Affair',
      text:`Sleep with your boss ${boss.name}? This may help your career, but it can wreck your job and relationship.`,
    });
  },

  sabotage(){
    const G=window.G;
    if(Math.random()>0.45){
      G.jobPerf=cl((G.jobPerf||50)+r(5,10)); G.karma=cl((G.karma||0)-r(5,10),-100,100);
      Engine.log('😈 Sabotage worked. Rival passed over for the promotion.','bad');
    } else {
      G.jobPerf=cl((G.jobPerf||50)-r(15,30)); G.happiness=cl(G.happiness-10);
      if(Math.random()<0.35){
        if(!G.achievements)G.achievements={}; G.achievements.fired=true;
        G.career=null; G.yearsAtJob=0; G.careerCompany=''; G.jobPerf=50;
        this._clearBoss();
        Engine.log('😈 Sabotage discovered. Fired on the spot.','bad');
        Engine.checkAch(); UI.update(); this.render(); return;
      }
      Engine.log('😈 Sabotage backfired. Trust completely destroyed.','bad');
    }
    UI.update(); this.render();
  },

  blowOff(){
    const G=window.G;
    G.happiness=cl(G.happiness+r(8,14)); G.jobPerf=cl((G.jobPerf||50)-r(5,12));
    G.stress=cl((G.stress||0)-r(5,10));
    Engine.log('🏖️ Skipped work to enjoy the day. Worth it... probably.','neutral');
    UI.update(); this.render();
  },

  quit(){
    const G=window.G; if(!G.career)return;
    if(!confirm(`⚠️ Quit your job as ${G.career.title}?\n\nThis is permanent — you'll lose your income immediately.`))return;
    const t=G.career.title; G.career=null; G.yearsAtJob=0; G.careerCompany=''; G.jobPerf=50;
    this._clearBoss();
    G.happiness=cl(G.happiness-7); G.stress=cl((G.stress||0)-10);
    Engine.log(`🚪 Resigned from ${t}. A new chapter begins.`,'neutral');
    UI.update(); this.render();
  },

  retire(){
    const G=window.G; if(!G.career)return;
    const pension=Math.floor((G.career.salary*0.28)+((G.yearsAtJob||0)*250));
    G.retirementPension=pension; G.retired=true;
    const t=G.career.title; G.career=null; G.yearsAtJob=0; G.careerCompany='';
    this._clearBoss();
    G.happiness=cl(G.happiness+22); G.stress=cl((G.stress||0)-20);
    Engine.log(`🏖️ Retired from career as ${t}! Pension: ${fmt(sc(pension))}/yr. Golden years begin!`,'special');
    if(!G.achievements)G.achievements={}; G.achievements.retired=true;
    Engine.checkAch(); UI.update(); this.render();
  },

  educTick(){
    const G=window.G;
    if(G.age===5){Engine.log('🏫 Started elementary school.','neutral');G.inSchool=true;}
    if(G.age===14)Engine.log('📓 Started high school.','neutral');
    if(G.inSchool){G.smarts=cl(G.smarts+r(1,3));}
    if(G.inUniversity){G.smarts=cl(G.smarts+r(2,5));G.univYear++;G.stress=cl((G.stress||0)+r(2,4));}
    if(G.age===18&&G.inSchool){
      G.inSchool=false; G.education='high_school';
      Engine.log('🎓 Graduated from high school!','special'); G.happiness=cl(G.happiness+13);
    }
    if(G.inUniversity&&G.univYear>=4){
      G.inUniversity=false; G.education='university';
      const u=UNIVERSITIES.find(x=>x.id===G.univType)||UNIVERSITIES[1];
      Engine.log(`🎓 Graduated from ${u.name} with a degree! The world is yours.`,'special');
      G.happiness=cl(G.happiness+22); G.smarts=cl(G.smarts+u.smartsBonus);
      Engine.checkAch();
    }
  },

  incomeTick(){
    const G=window.G;
    if(!G.career)return;
    const income=sc(G.career.salary); G.money+=income; G.yearsAtJob++;
    G.stress=cl((G.stress||0)+(G.career.stressAdd||6));
    if(G.yearsAtJob%2===0)G.career={...G.career,salary:Math.floor(G.career.salary*1.04)};
    if(Math.random()<0.12){
      const wmsgs=['Positive performance review this quarter.','Navigated a tough project with success.','Mentored a junior team member.','Got recognition from senior management.','Delivered an outstanding client presentation.'];
      Engine.log(`💼 ${pick(wmsgs)}`,'neutral');
    }
    G.jobPerf=cl((G.jobPerf||50)+r(-3,4));
    if(G.jobPerf<8&&Math.random()<0.32){
      const t=G.career.title; G.career=null; G.yearsAtJob=0; G.careerCompany=''; G.jobPerf=50;
      this._clearBoss();
      if(!G.achievements)G.achievements={}; G.achievements.fired=true;
      Engine.log(`🚪 Fired from ${t} due to poor performance!`,'bad');
      G.happiness=cl(G.happiness-14); Engine.checkAch();
    }
  },
};
