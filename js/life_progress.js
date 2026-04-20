/* js/life_progress.js - recaps, milestones, achievement progress */
const LifeProgress={
  init(G){
    if(!G)return;
    G.timeline=G.timeline||[];
    G.yearlyRecaps=G.yearlyRecaps||[];
    G.lifeRecords=G.lifeRecords||{bestYear:null,worstYear:null};
    G.milestoneFlags=G.milestoneFlags||{};
    G.challengeScore=G.challengeScore||0;
  },

  snapshot(G){
    if(!G)return null;
    return{
      age:G.age,
      happiness:G.happiness||0,
      health:G.health||0,
      smarts:G.smarts||0,
      looks:G.looks||0,
      fitness:G.fitness||0,
      stress:G.stress||0,
      money:G.money||0,
      netWorth:netWorth(G),
      career:G.career?.title||null,
      partner:G.rels?.partner?.name||null,
      partnerLove:G.rels?.partner?.love||0,
      children:(G.rels?.children||[]).length,
      fame:G.fame||0,
      businessValue:G.business?.value||0,
      completedGoals:(G.completedGoals||[]).length,
      logCount:(G.log||[]).length,
    };
  },

  recordYear(G,before){
    if(!G||!before)return;
    this.init(G);
    const after=this.snapshot(G);
    const delta={
      happiness:after.happiness-before.happiness,
      health:after.health-before.health,
      money:after.money-before.money,
      netWorth:after.netWorth-before.netWorth,
      stress:after.stress-before.stress,
      fame:after.fame-before.fame,
    };
    const score=delta.happiness+delta.health+Math.round(delta.netWorth/5000)-Math.max(0,delta.stress);
    const newLogs=(G.log||[]).slice(0,Math.max(0,(G.log||[]).length-before.logCount)).map(e=>e.text).reverse();
    const headline=this._headline(G,before,after,delta,newLogs);
    const recap={age:G.age,score,headline,delta,career:after.career,netWorth:after.netWorth,events:newLogs.slice(-3)};
    G.yearlyRecaps.unshift(recap);
    if(G.yearlyRecaps.length>40)G.yearlyRecaps.pop();

    if(!G.lifeRecords.bestYear||score>G.lifeRecords.bestYear.score)G.lifeRecords.bestYear=recap;
    if(!G.lifeRecords.worstYear||score<G.lifeRecords.worstYear.score)G.lifeRecords.worstYear=recap;
    this._milestones(G,before,after);
  },

  _headline(G,before,after,delta,events){
    if(after.children>before.children)return `Family grew: child #${after.children} arrived.`;
    if(!before.partner&&after.partner)return `Love arrived: started a relationship with ${after.partner}.`;
    if(!before.career&&after.career)return `Career began: became ${after.career}.`;
    if(before.career&&after.career&&before.career!==after.career)return `Career changed from ${before.career} to ${after.career}.`;
    if(after.netWorth>=1000000&&before.netWorth<1000000)return 'Became a millionaire.';
    if(delta.netWorth>50000)return `Built wealth: net worth rose ${fmt(delta.netWorth)}.`;
    if(delta.happiness>15)return 'A joyful year with real momentum.';
    if(delta.health>10)return 'A strong health comeback.';
    if(delta.stress>15)return 'A stressful year that may echo later.';
    if(events.length)return events[events.length-1].replace(/^[^\w$]+/,'').slice(0,100);
    return 'A quiet year of ordinary life.';
  },

  _milestones(G,before,after){
    const add=(id,icon,text)=>{
      if(G.milestoneFlags[id])return;
      G.milestoneFlags[id]=true;
      G.timeline.unshift({age:G.age,icon,text});
      if(G.timeline.length>60)G.timeline.pop();
    };
    if(G.age===15)add('age15','💘','Teen romance became part of life.');
    if(G.age===18)add('age18','🗝️','Reached adulthood.');
    if(G.age===30)add('age30','🎂','Entered the thirties.');
    if(G.age===55)add('age55','🌅','Retirement became an option.');
    if(!before.career&&after.career)add('first_job','💼',`Started work as ${after.career}.`);
    if(!before.partner&&after.partner)add('first_partner','💌',`Started dating ${after.partner}.`);
    if(after.children>before.children)add('child_'+after.children,'👶',`Welcomed child #${after.children}.`);
    if(after.netWorth>=100000&&before.netWorth<100000)add('nw100k','💰','Reached 100K net worth.');
    if(after.netWorth>=1000000&&before.netWorth<1000000)add('nw1m','💎','Reached millionaire status.');
    if(G.retired)add('retired','🏖️','Entered retirement.');
    if(G.business&&after.businessValue>=1000000&&before.businessValue<1000000)add('biz1m','🏢','Business passed 1M valuation.');
  },

  renderPanel(G){
    this.init(G);
    const rec=G.yearlyRecaps?.[0];
    const best=G.lifeRecords?.bestYear;
    const worst=G.lifeRecords?.worstYear;
    const timeline=(G.timeline||[]).slice(0,5);
    return`
      <div class="life-panel-grid">
        <div class="mini-panel">
          <div class="mini-k">Yearly Recap</div>
          <div class="mini-v">${rec?`Age ${rec.age}: ${rec.headline}`:'Age up to start your timeline.'}</div>
          ${rec?`<div class="mini-sub">Worth ${rec.delta.netWorth>=0?'+':''}${fmt(rec.delta.netWorth)} · Hap ${rec.delta.happiness>=0?'+':''}${rec.delta.happiness} · Health ${rec.delta.health>=0?'+':''}${rec.delta.health}</div>`:''}
        </div>
        <div class="mini-panel">
          <div class="mini-k">Best / Worst Year</div>
          <div class="mini-v">${best?`Best: age ${best.age}`:'Best: waiting...'}</div>
          <div class="mini-sub">${worst?`Worst: age ${worst.age} · ${worst.headline}`:'Worst: waiting...'}</div>
        </div>
      </div>
      <div class="sec">🧭 Timeline Milestones</div>
      ${timeline.length?timeline.map(m=>`<div class="timeline-row"><span>${m.icon}</span><div><strong>Age ${m.age}</strong><br>${m.text}</div></div>`).join(''):`<div class="empty compact"><span class="ei">🧭</span><p>No major milestones yet.</p></div>`}
    `;
  },

  achievementProgress(a,G){
    if(!G)return null;
    const nw=netWorth(G);
    const map={
      age_30:[Math.min(G.age,30),30],
      age_50:[Math.min(G.age,50),50],
      age_80:[Math.min(G.age,80),80],
      age_100:[Math.min(G.age,100),100],
      mil:[Math.min(nw,1000000),1000000],
      mul_mil:[Math.min(nw,10000000),10000000],
      bil:[Math.min(nw,1000000000),1000000000],
      promo5:[Math.min(G.promotionCount||0,5),5],
      '3kids':[Math.min((G.rels?.children||[]).length,3),3],
      '5kids':[Math.min((G.rels?.children||[]).length,5),5],
      '25yr_marr':[Math.min(G.rels?.partner?.yearsMarried||0,25),25],
      fit_ach:[Math.min(G.fitness||0,90),90],
      famous_ach:[Math.min(G.followers||0,100000),100000],
      mega_inf:[Math.min(G.followers||0,1000000),1000000],
      globe_ach:[Math.min((G.countriesVisited||[]).length,10),10],
      philanthropist:[Math.min(G.lifetimeDonated||0,500000),500000],
      gambler_ach:[Math.min(G.lifetimeGambled||0,50000),50000],
      first_goal:[Math.min((G.completedGoals||[]).length,1),1],
      all_goals:[Math.min((G.completedGoals||[]).length,12),12],
      skill_master:[Math.max(0,...Object.values(G.skills||{})),5],
      polymath:[Math.min(Object.values(G.skills||{}).filter(v=>v>=2).length,5),5],
    };
    return map[a.id]||null;
  },
};
