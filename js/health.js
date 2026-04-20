/* js/health.js — LifeSim v9 */
const Health={
  render(){
    const G=window.G; if(!G)return;
    const el=document.getElementById('tab-health');
    const hc=G.health>75?'var(--green)':G.health>45?'var(--yellow)':'var(--red)';
    const hl=G.health>85?'Excellent':G.health>65?'Good':G.health>45?'Fair':G.health>25?'Poor':'Critical';
    const fc=G.fitness>75?'var(--orange)':G.fitness>45?'var(--yellow)':'var(--red)';
    let h=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">❤️ Health</div><div class="nw-amt" style="font-size:20px;color:${hc}">${hl}</div><div class="nw-sub">${G.health}%</div></div>
      <div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">⚡ Fitness</div><div class="nw-amt" style="font-size:20px;color:${fc}">${G.fitness||50}%</div><div class="nw-sub">${(G.fitness||50)>70?'Athletic':(G.fitness||50)>40?'Average':'Unfit'}</div></div>
    </div>`;

    if((G.conditions||[]).length>0){
      h+=`<div class="sec">⚠️ Active Conditions</div>`;
      (G.conditions||[]).forEach((c,i)=>{
        h+=`<div class="row-card" style="border-color:rgba(248,113,113,.4)">
          <span class="ri">${c.icon}</span>
          <div class="rd"><div class="rt">${c.name}</div><div class="rs">${c.desc} · <span style="color:var(--red)">${c.effect}</span></div></div>
          <button class="btn-primary btn-sm" style="font-size:11px;padding:7px 10px;width:auto" onclick="Health.treat(${i})">Treat</button>
        </div>`;
      });
    }

    if((G.addictions?.smoking)||(G.addictions?.alcohol)){
      h+=`<div class="sec">⚠️ Addictions</div>`;
      if(G.addictions?.smoking) h+=`<div class="addiction-warn"><div class="aw-ico">🚬</div><div class="aw-txt"><strong>Nicotine Addiction</strong> — −${r(4,8)} health/yr. Use Quit Smoking below.</div></div>`;
      if(G.addictions?.alcohol) h+=`<div class="addiction-warn"><div class="aw-ico">🍺</div><div class="aw-txt"><strong>Alcohol Dependency</strong> — −${r(3,6)} health/yr. Use Quit Drinking below.</div></div>`;
      h+=`<div class="act-grid">
        ${G.addictions?.smoking?`<div class="card" onclick="Health.quitAddiction('smoking')"><span class="ci">🚭</span><span class="cn">Quit Smoking</span><span class="cd">+Health +Fitness</span></div>`:''}
        ${G.addictions?.alcohol?`<div class="card" onclick="Health.quitAddiction('alcohol')"><span class="ci">🚫</span><span class="cn">Quit Drinking</span><span class="cd">+Health big</span></div>`:''}
      </div>`;
    }

    h+=`<div class="sec">🏥 Medical Care</div>
    <div class="act-grid">
      <div class="card" onclick="Health.visit('gp')"><span class="ci">👨‍⚕️</span><span class="cn">GP Checkup</span><span class="cd">+Health check (${fmt(sc(100))})</span></div>
      <div class="card" onclick="Health.visit('specialist')"><span class="ci">🏥</span><span class="cn">Specialist</span><span class="cd">Treat condition (${fmt(sc(600))})</span></div>
      <div class="card" onclick="Health.visit('hospital')"><span class="ci">🚑</span><span class="cn">Hospital Day</span><span class="cd">+Health major (${fmt(sc(2000))})</span></div>
      <div class="card" onclick="Health.visit('mental')"><span class="ci">🧠</span><span class="cn">Mental Health</span><span class="cd">+Hap −Stress (${fmt(sc(160))})</span></div>
    </div>
    <div class="sec">🧬 Screening & Tests</div>
    <div class="act-grid">
      <div class="card" onclick="Health.screen('blood')"><span class="ci">🩸</span><span class="cn">Blood Panel</span><span class="cd">Check markers (${fmt(sc(150))})</span></div>
      <div class="card" onclick="Health.screen('cancer')"><span class="ci">🔬</span><span class="cn">Cancer Screen</span><span class="cd">Early detection (${fmt(sc(300))})</span></div>
      <div class="card" onclick="Health.screen('heart')"><span class="ci">💓</span><span class="cn">Cardiac Scan</span><span class="cd">Heart health (${fmt(sc(400))})</span></div>
      <div class="card" onclick="Health.screen('genetic')"><span class="ci">🧬</span><span class="cn">DNA Test</span><span class="cd">Full genome (${fmt(sc(800))})</span></div>
    </div>
    <div class="sec">💊 Supplements & Meds</div>
    <div class="act-grid">
      <div class="card" onclick="Health.sup('vitamins')"><span class="ci">💊</span><span class="cn">Vitamins</span><span class="cd">+Health slow (${fmt(sc(40))})</span></div>
      <div class="card" onclick="Health.sup('protein')"><span class="ci">🥤</span><span class="cn">Protein Shake</span><span class="cd">+Fitness +Looks</span></div>
      <div class="card" onclick="Health.sup('steroids')"><span class="ci">💉</span><span class="cn">Steroids</span><span class="cd">+Looks ±Health risk</span></div>
      <div class="card" onclick="Health.sup('nootropics')"><span class="ci">🧪</span><span class="cn">Nootropics</span><span class="cd">+Smarts (risk)</span></div>
    </div>
    <div class="sec">🌿 Lifestyle Changes</div>
    <div class="act-grid">
      <div class="card" onclick="Health.lifestyle('vegan')"><span class="ci">🥦</span><span class="cn">Go Vegan</span><span class="cd">+Health +Looks</span></div>
      <div class="card" onclick="Health.lifestyle('sober')"><span class="ci">🚫</span><span class="cn">Quit Alcohol</span><span class="cd">+Health big boost</span></div>
      <div class="card" onclick="Health.lifestyle('keto')"><span class="ci">🥩</span><span class="cn">Keto Diet</span><span class="cd">+Health +Fitness</span></div>
      <div class="card" onclick="Health.lifestyle('cold')"><span class="ci">🧊</span><span class="cn">Cold Showers</span><span class="cd">+Health +Fitness</span></div>
    </div>`;

    if(G.age>=18){
      h+=`<div class="sec">🔪 Elective Surgery</div>
      <div class="act-grid">
        <div class="card" onclick="Health.surg('eyes')"><span class="ci">👁️</span><span class="cn">Laser Eye</span><span class="cd">+Health +Looks (${fmt(sc(3000))})</span></div>
        <div class="card" onclick="Health.surg('heart')"><span class="ci">❤️</span><span class="cn">Heart Surgery</span><span class="cd">+Health major (${fmt(sc(25000))})</span></div>
        <div class="card" onclick="Health.surg('joint')"><span class="ci">🦿</span><span class="cn">Joint Replace</span><span class="cd">+Health (${fmt(sc(14000))})</span></div>
        <div class="card" onclick="Health.surg('cosmetic')"><span class="ci">✨</span><span class="cn">Cosmetic Surgery</span><span class="cd">+Looks (${fmt(sc(9000))})</span></div>
      </div>`;
    }

    el.innerHTML=h;
  },

  visit(t){
    const G=window.G;
    const costs={gp:100,specialist:600,hospital:2000,mental:160};
    const cost=sc(costs[t]||100);
    // Insurance reduces costs
    const insured=G.insurance?.health;
    const finalCost=insured?Math.floor(cost*0.4):cost;
    if(G.money<finalCost){UI.toast(`Need ${fmt(finalCost)}${insured?' (insured rate)':''}!`);return;}
    G.money-=finalCost;
    if(t==='gp'){
      G.health=cl(G.health+r(8,16));
      if(G.age>40&&Math.random()<0.13)this._addCondition();
      Engine.log(`👨‍⚕️ GP checkup${insured?' (insurance covered 60%)':''}. Doctor pleased with progress.`,'good');
    } else if(t==='specialist'){
      if((G.conditions||[]).length>0){
        G.conditions.shift(); G.health=cl(G.health+r(12,24));
        Engine.log('🏥 Specialist treated your condition. Major improvement!','good');
      } else {
        G.health=cl(G.health+r(7,14)); Engine.log('🏥 Specialist exam — all clear.','good');
      }
    } else if(t==='hospital'){G.health=cl(G.health+r(22,36));Engine.log('🏥 Hospital day-care. Dramatic health improvement!','good');}
    else if(t==='mental'){G.happiness=cl(G.happiness+r(12,20));G.stress=cl((G.stress||0)-r(14,22));G.health=cl(G.health+r(2,5));Engine.log('🧠 Mental health session was transformative.','good');}
    UI.update(); this.render();
  },

  treat(i){
    const G=window.G; const cost=sc(800);
    if(G.money<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money-=cost;
    if((G.conditions||[]).length>i){G.conditions.splice(i,1);G.health=cl(G.health+r(10,18));Engine.log('💊 Medical treatment resolved the condition.','good');}
    UI.update(); this.render();
  },

  screen(t){
    const G=window.G;
    const costs={blood:150,cancer:300,heart:400,genetic:800};
    const cost=sc(costs[t]||150);
    if(G.money<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money-=cost;
    if(G.age>45&&Math.random()<0.13){this._addCondition();Engine.log(`🔬 Screening detected a health concern. Visit a specialist.`,'bad');}
    else{G.health=cl(G.health+r(2,5));Engine.log(`🔬 Screening results: all values within healthy range. Reassuring!`,'good');G.happiness=cl(G.happiness+5);}
    UI.update(); this.render();
  },

  sup(t){
    const G=window.G;
    if(t==='vitamins'){if(G.money<sc(40)){UI.toast('Need '+fmt(sc(40)));return;}G.money-=sc(40);G.health=cl(G.health+r(1,4));Engine.log('💊 Multivitamins. Small but consistent health gains.','good');}
    else if(t==='protein'){G.fitness=cl((G.fitness||50)+r(3,7));G.looks=cl(G.looks+r(1,4));Engine.log('🥤 Protein shake. Recovery and gains accelerated.','good');}
    else if(t==='steroids'){
      if(Math.random()>0.35){G.looks=cl(G.looks+r(9,16));G.fitness=cl((G.fitness||50)+r(6,12));Engine.log('💉 Steroid cycle showing impressive physique results.','good');}
      else{G.health=cl(G.health-r(9,18));Engine.log('💉 Steroid side effects: mood swings, organ stress.','bad');}
    } else if(t==='nootropics'){
      if(Math.random()>0.32){G.smarts=cl(G.smarts+r(5,10));Engine.log('🧪 Nootropics sharpened cognition noticeably.','good');}
      else{G.happiness=cl(G.happiness-r(6,12));G.stress=cl((G.stress||0)+r(5,10));Engine.log('🧪 Nootropic crash: brain fog, anxiety, terrible mood.','bad');}
    }
    UI.update(); this.render();
  },

  lifestyle(t){
    const G=window.G;
    if(t==='vegan'){G.health=cl(G.health+r(6,11));G.looks=cl(G.looks+r(3,7));G.happiness=cl(G.happiness-r(0,3));Engine.log('🥦 Plant-based diet. Skin glowing, energy incredible.','good');}
    else if(t==='sober'){G.health=cl(G.health+r(14,22));G.happiness=cl(G.happiness+r(6,12));G.fitness=cl((G.fitness||50)+r(4,9));
      if(G.addictions?.alcohol){delete G.addictions.alcohol;if(!G.achievements)G.achievements={};G.achievements.quit_addictions=true;Engine.log('🚫 Quit alcohol entirely! Body and mind completely renewed.','good');Engine.checkAch();}
      else Engine.log('🚫 Already not drinking, but committed to staying sober. Great!','good');}
    else if(t==='keto'){G.health=cl(G.health+r(5,10));G.fitness=cl((G.fitness||50)+r(3,7));Engine.log('🥩 Keto diet. Fat burning and energy levels optimal.','good');}
    else if(t==='cold'){G.health=cl(G.health+r(4,8));G.fitness=cl((G.fitness||50)+r(2,5));G.stress=cl((G.stress||0)-r(5,10));Engine.log('🧊 Cold shower routine. Immune system and resilience improving.','good');}
    UI.update(); this.render();
  },

  quitAddiction(type){
    const G=window.G;
    if(!G.addictions)G.addictions={};
    delete G.addictions[type];
    if(type==='smoking'){G.health=cl(G.health+r(10,18));G.fitness=cl((G.fitness||50)+r(5,10));Engine.log('🚭 Quit smoking! Lungs clearing. Huge health win.','good');}
    if(type==='alcohol'){G.health=cl(G.health+r(12,20));G.happiness=cl(G.happiness+r(6,12));Engine.log('🚫 Quit drinking! Body is recovering beautifully.','good');}
    if(!G.addictions.smoking&&!G.addictions.alcohol){
      if(!G.achievements)G.achievements={}; G.achievements.quit_addictions=true; Engine.checkAch();
    }
    UI.update(); this.render();
  },

  surg(t){
    const G=window.G;
    const costs={eyes:3000,heart:25000,joint:14000,cosmetic:9000};
    const cost=sc(costs[t]||9000); if(G.money<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money-=cost; const ok=Math.random()>0.16;
    if(t==='eyes'){ok?(()=>{G.health=cl(G.health+12);G.looks=cl(G.looks+6);Engine.log('👁️ Laser eye surgery success! Crystal clear 20/20 vision.','good');})():(()=>{G.health=cl(G.health-9);Engine.log('👁️ Eye surgery complications. Temporary worsening.','bad');})();}
    else if(t==='heart'){ok?(()=>{G.health=cl(G.health+32);Engine.log('❤️ Heart surgery complete success! Like a brand-new engine.','special');})():(()=>{G.health=cl(G.health-22);Engine.log('❤️ Heart surgery complications. Extended recovery needed.','bad');})();}
    else if(t==='joint'){ok?(()=>{G.health=cl(G.health+16);G.fitness=cl((G.fitness||50)+r(8,14));G.happiness=cl(G.happiness+12);Engine.log('🦿 Joint replacement a success! Moving freely again!','good');})():(()=>{G.health=cl(G.health-11);Engine.log('🦿 Joint replacement complications. Revision needed.','bad');})();}
    else if(t==='cosmetic'){ok?(()=>{G.looks=cl(G.looks+r(9,18));Engine.log('✨ Cosmetic surgery results stunning. Confidence through the roof.','good');})():(()=>{G.looks=cl(G.looks-r(9,18));G.health=cl(G.health-11);Engine.log('✨ Cosmetic surgery went wrong. Very upsetting outcome.','bad');})();}
    UI.update(); this.render();
  },

  _addCondition(){
    const G=window.G; if(!G.conditions)G.conditions=[];
    const CONDS=[
      {icon:'💔',name:'Hypertension',     desc:'High blood pressure',            effect:'-2 Health/yr'},
      {icon:'🩸',name:'Type 2 Diabetes',  desc:'Blood sugar management needed',  effect:'-3 Health/yr'},
      {icon:'🫁',name:'Chronic Bronchitis',desc:'Persistent breathing issues',    effect:'-1 Health/yr'},
      {icon:'🧠',name:'Anxiety Disorder', desc:'Chronic anxiety',                effect:'-2 Happiness/yr'},
      {icon:'🦴',name:'Osteoarthritis',   desc:'Joint degeneration and pain',    effect:'-2 Health/yr'},
      {icon:'💊',name:'Depression',        desc:'Persistent low mood',            effect:'-3 Happiness/yr'},
      {icon:'🫀',name:'Atrial Fibrillation',desc:'Irregular heartbeat detected', effect:'-3 Health/yr'},
      {icon:'🔬',name:'Thyroid Issue',     desc:'Hormonal imbalance',             effect:'-2 Health/yr'},
      {icon:'🔬',name:'Early Cancer',      desc:'Caught early — treatable',       effect:'-5 Health/yr'},
    ];
    const have=(G.conditions||[]).map(c=>c.name);
    const avail=CONDS.filter(c=>!have.includes(c.name));
    if(avail.length){
      const c=pick(avail); G.conditions.push(c); G.health=cl(G.health-r(5,12));
      Engine.log(`⚠️ Diagnosed with ${c.name}. Visit a specialist for treatment.`,'bad');
    }
  },

  tick(){
    const G=window.G;
    // Condition effects
    (G.conditions||[]).forEach(c=>{
      if(c.effect.includes('Health')){const a=parseInt(c.effect)||-2;G.health=cl(G.health+a);}
      if(c.effect.includes('Happiness')){const a=parseInt(c.effect)||-2;G.happiness=cl(G.happiness+a);}
    });
    // Addiction damage
    if(G.addictions?.smoking)G.health=cl(G.health-r(3,6));
    if(G.addictions?.alcohol){G.health=cl(G.health-r(2,5));G.happiness=cl(G.happiness-r(1,3));}
    // Trait: resilient — slower health decay
    if(G.trait==='resilient'&&G.age>45)G.health=cl(G.health+1);
  },
};
