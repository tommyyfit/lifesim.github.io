/* js/career.js — LifeSim v9 */
const Career={
  render(){
    const G=window.G; if(!G)return;
    const el=document.getElementById('tab-career');
    let h='';
    if(G.age<16){el.innerHTML='<div class="empty"><span class="ei">🎒</span><p>Still in school!<br>Jobs unlock at age 16.</p></div>';return;}

    if(G.retired){
      h+=`<div class="info-box" style="border-color:rgba(74,222,128,.4);background:rgba(74,222,128,.06)">
        <p>🏖️ <strong>Retired!</strong> Pension: <strong>${fmt(sc(G.retirementPension||0))}/yr</strong> arrives automatically. Enjoy your golden years!</p>
      </div>
      <div class="sec">🌅 Retirement Life</div>
      <div class="act-grid">
        <div class="card" onclick="Career.retireAct('consult')"><span class="ci">💼</span><span class="cn">Consult Part-Time</span><span class="cd">Money +Purpose</span></div>
        <div class="card" onclick="Career.retireAct('mentor')"><span class="ci">🧑‍🏫</span><span class="cn">Mentor Youth</span><span class="cd">+Karma +Hap</span></div>
        <div class="card" onclick="Career.retireAct('hobby')"><span class="ci">🎨</span><span class="cn">Hobby Club</span><span class="cd">+Friends +Health</span></div>
        <div class="card" onclick="Career.retireAct('legacy')"><span class="ci">📜</span><span class="cn">Write Legacy</span><span class="cd">+Smarts +Hap</span></div>
        <div class="card" onclick="Career.retireAct('cruise')"><span class="ci">🛳️</span><span class="cn">Slow Cruise</span><span class="cd">+Hap −Stress (${fmt(sc(5000))})</span></div>
        <div class="card" onclick="Career.retireAct('board')"><span class="ci">🏛️</span><span class="cn">Community Board</span><span class="cd">+Fame +Karma</span></div>
      </div>`;
      el.innerHTML=h;return;
    }

    if(G.career){
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

  dropout(){
    const G=window.G;
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
    const base=effectiveSmarts>job.smartsReq?0.74:effectiveSmarts>job.smartsReq*0.6?0.42:0.22;
    const looksBonus=G.looks>70?0.08:0;
    const chance=Math.min(0.95,base+looksBonus);
    if(Math.random()<chance){
      G.career={...job}; G.yearsAtJob=0; G.careerCompany=pick(COMPANIES); G.jobPerf=52;
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
    G.workReputation=cl((G.workReputation||0)+r(1,4),-50,100);
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
    G.workReputation=cl((G.workReputation||0)+r(2,6),-50,100);
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
    if(Math.random()>0.38){
      G.jobPerf=cl((G.jobPerf||50)+r(5,12)); G.happiness=cl(G.happiness-r(1,3));
      Engine.log('😊 Complimenting the boss worked. Performance score up.','good');
    } else {
      G.happiness=cl(G.happiness-r(3,6));
      Engine.log('😊 Your sucking up was painfully obvious to everyone.','bad');
    }
    UI.update(); this.render();
  },

  sabotage(){
    const G=window.G;
    if(Math.random()>0.45){
      G.jobPerf=cl((G.jobPerf||50)+r(5,10)); G.karma=cl((G.karma||0)-r(5,10),-100,100);
      G.workReputation=cl((G.workReputation||0)-r(6,14),-50,100);
      Engine.log('😈 Sabotage worked. Rival passed over for the promotion.','bad');
    } else {
      G.jobPerf=cl((G.jobPerf||50)-r(15,30)); G.happiness=cl(G.happiness-10);
      if(Math.random()<0.35){
        if(!G.achievements)G.achievements={}; G.achievements.fired=true;
        G.career=null; G.yearsAtJob=0; G.careerCompany=''; G.jobPerf=50;
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
    G.workReputation=cl((G.workReputation||0)-r(2,6),-50,100);
    G.stress=cl((G.stress||0)-r(5,10));
    Engine.log('🏖️ Skipped work to enjoy the day. Worth it... probably.','neutral');
    UI.update(); this.render();
  },

  quit(){
    const G=window.G; if(!G.career)return;
    const t=G.career.title; G.career=null; G.yearsAtJob=0; G.careerCompany=''; G.jobPerf=50;
    G.happiness=cl(G.happiness-7); G.stress=cl((G.stress||0)-10);
    Engine.log(`🚪 Resigned from ${t}. A new chapter begins.`,'neutral');
    UI.update(); this.render();
  },

  retire(){
    const G=window.G; if(!G.career)return;
    const pension=Math.floor((G.career.salary*0.28)+((G.yearsAtJob||0)*250));
    G.retirementPension=pension; G.retired=true;
    const t=G.career.title; G.career=null; G.yearsAtJob=0; G.careerCompany='';
    G.happiness=cl(G.happiness+22); G.stress=cl((G.stress||0)-20);
    Engine.log(`🏖️ Retired from career as ${t}! Pension: ${fmt(sc(pension))}/yr. Golden years begin!`,'special');
    if(!G.achievements)G.achievements={}; G.achievements.retired=true;
    Engine.checkAch(); UI.update(); this.render();
  },

  retireAct(type){
    const G=window.G;if(!G.retired)return;
    if(type==='consult'){
      const pay=sc(r(1500,6500));G.money+=pay;G.happiness=cl(G.happiness+r(4,9));G.stress=cl((G.stress||0)+r(1,4));
      Engine.log(`💼 Consulting kept your mind sharp and earned ${fmt(pay)}.`,'money');
    }else if(type==='mentor'){
      G.happiness=cl(G.happiness+r(8,15));G.karma=cl((G.karma||0)+r(4,9),-100,100);G.fame=cl((G.fame||0)+r(1,3));
      Engine.log('🧑‍🏫 Mentoring younger people gave retirement real purpose.','good');
    }else if(type==='hobby'){
      G.happiness=cl(G.happiness+r(9,16));G.health=cl(G.health+r(2,5));G.stress=cl((G.stress||0)-r(6,12));
      Engine.log('🎨 Joined a hobby club. New routines, new friends, better days.','good');
    }else if(type==='legacy'){
      G.happiness=cl(G.happiness+r(8,14));G.smarts=cl(G.smarts+r(3,6));G.karma=cl((G.karma||0)+r(2,5),-100,100);
      Engine.log('📜 Wrote stories, lessons, and memories for the next generation.','special');
    }else if(type==='cruise'){
      const c=sc(5000);if(G.money<c){UI.toast('Need '+fmt(c)+'!');return;}
      G.money-=c;G.happiness=cl(G.happiness+r(16,26));G.health=cl(G.health+r(2,5));G.stress=cl((G.stress||0)-r(12,22));
      Engine.log('🛳️ A slow cruise turned retirement into a reward loop, not an epilogue.','special');
    }else if(type==='board'){
      G.fame=cl((G.fame||0)+r(4,9));G.karma=cl((G.karma||0)+r(3,7),-100,100);G.happiness=cl(G.happiness+r(5,10));
      Engine.log('🏛️ Joined a community board and helped shape local decisions.','good');
    }
    UI.update();this.render();
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
    if((G.workReputation||0)>35&&Math.random()<0.08){
      const bonus=sc(Math.floor(G.career.salary*r(2,6)/100));G.money+=bonus;G.jobPerf=cl((G.jobPerf||50)+3);
      Engine.log(`🌟 Your strong professional reputation brought a ${fmt(bonus)} bonus.`,'money');
    }
    if((G.workReputation||0)<-20&&Math.random()<0.10){
      G.jobPerf=cl((G.jobPerf||50)-r(6,12));G.stress=cl((G.stress||0)+r(4,9));
      Engine.log('🧊 Your poor workplace reputation made managers scrutinize everything you did.','bad');
    }
    G.jobPerf=cl((G.jobPerf||50)+r(-3,4));
    if(G.jobPerf<8&&Math.random()<0.32){
      const t=G.career.title; G.career=null; G.yearsAtJob=0;
      if(!G.achievements)G.achievements={}; G.achievements.fired=true;
      Engine.log(`🚪 Fired from ${t} due to poor performance!`,'bad');
      G.happiness=cl(G.happiness-14); Engine.checkAch();
    }
  },
};
