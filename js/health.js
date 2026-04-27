/* js/health.js — LifeSim v13 Reforged health, food, recovery and medical system */
const Health={
  FOOD_PLANS:{
    budget:{label:'Budget groceries',icon:'🥫',cost:2100,groceries:.92,dining:.08,nutrition:45,calories:'low',health:-1,happiness:-2,looks:-1,fitness:-1,stress:2,desc:'Cheap basics, repetitive meals, easy to under-eat'},
    cook:{label:'Cook at home',icon:'🍜',cost:3200,groceries:.86,dining:.14,nutrition:68,calories:'balanced',health:3,happiness:1,looks:1,fitness:1,stress:1,desc:'Normal groceries with occasional treats'},
    mixed:{label:'Mixed normal diet',icon:'🍲',cost:4600,groceries:.62,dining:.38,nutrition:58,calories:'balanced',health:1,happiness:3,looks:0,fitness:0,stress:0,desc:'Groceries, cafes, snacks and convenience meals'},
    mealprep:{label:'Meal prep / healthy plan',icon:'🥗',cost:5600,groceries:.78,dining:.22,nutrition:84,calories:'lean',health:6,happiness:2,looks:2,fitness:3,stress:1,desc:'Planned protein, vegetables and controlled portions'},
    takeaway:{label:'Takeaway / fast food',icon:'🥡',cost:6200,groceries:.25,dining:.75,nutrition:38,calories:'high',health:-3,happiness:2,looks:-1,fitness:-2,stress:-1,desc:'Convenient, salty, high-calorie meals'},
    restaurant:{label:'Restaurant dining',icon:'🍽️',cost:9800,groceries:.30,dining:.70,nutrition:55,calories:'high',health:0,happiness:6,looks:0,fitness:-1,stress:-2,desc:'Social and fun, expensive and portion-heavy'},
    organic:{label:'Organic premium diet',icon:'🥑',cost:8800,groceries:.82,dining:.18,nutrition:88,calories:'balanced',health:7,happiness:3,looks:3,fitness:2,stress:1,desc:'High-quality groceries, supplements and fresh food'},
    junk:{label:'Junk food survival',icon:'🍕',cost:1700,groceries:.35,dining:.65,nutrition:18,calories:'very_high',health:-8,happiness:1,looks:-3,fitness:-4,stress:-1,desc:'Ultra-cheap calories, terrible long-term health'},
  },

  CONDITIONS:[
    {key:'hypertension',icon:'💔',name:'Hypertension',desc:'High blood pressure',health:-2,happiness:0,effect:'-2 Health/yr'},
    {key:'diabetes',icon:'🩸',name:'Type 2 Diabetes',desc:'Blood sugar management needed',health:-3,happiness:0,effect:'-3 Health/yr'},
    {key:'bronchitis',icon:'🫁',name:'Chronic Bronchitis',desc:'Persistent breathing issues',health:-1,happiness:0,effect:'-1 Health/yr'},
    {key:'anxiety',icon:'🧠',name:'Anxiety Disorder',desc:'Chronic anxiety',health:0,happiness:-2,stress:3,effect:'-2 Happiness/yr'},
    {key:'osteoarthritis',icon:'🦴',name:'Osteoarthritis',desc:'Joint degeneration and pain',health:-2,happiness:-1,effect:'-2 Health/yr'},
    {key:'depression',icon:'💊',name:'Depression',desc:'Persistent low mood',health:0,happiness:-3,stress:2,effect:'-3 Happiness/yr'},
    {key:'afib',icon:'🫀',name:'Atrial Fibrillation',desc:'Irregular heartbeat detected',health:-3,happiness:0,effect:'-3 Health/yr'},
    {key:'thyroid',icon:'🔬',name:'Thyroid Issue',desc:'Hormonal imbalance',health:-2,happiness:-1,effect:'-2 Health/yr'},
    {key:'cancer',icon:'🔬',name:'Early Cancer',desc:'Caught early, treatable',health:-5,happiness:-2,effect:'-5 Health/yr'},
    {key:'obesity',icon:'🍔',name:'Obesity',desc:'Long-term weight and lifestyle strain',health:-3,happiness:-1,effect:'-3 Health/yr'},
  ],

  _esc(v){
    if(typeof escHTML==='function')return escHTML(v);
    return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  _statusColor(v,good=75,mid=45){
    return v>good?'var(--green)':v>mid?'var(--yellow)':'var(--red)';
  },

  _healthLabel(v){
    return v>85?'Excellent':v>65?'Good':v>45?'Fair':v>25?'Poor':'Critical';
  },

  _fitnessLabel(v){
    return v>78?'Athletic':v>58?'Fit':v>40?'Average':'Unfit';
  },

  render(){
    const G=window.G;if(!G)return;
    const el=document.getElementById('tab-health');if(!el)return;
    this._ensureState(G);

    const food=G.food;
    const plan=this.FOOD_PLANS[food.plan]||this.FOOD_PLANS.cook;
    const nutrition=food.nutritionScore??55;
    const estimate=this._foodCost(plan,G);
    const household=this._foodHousehold(G);
    const sti=G.sexualHealth?.sti||G.sexualHealth?.std;
    const recovery=this._recoverySummary(G);
    const risk=this._riskProfile(G,plan);

    let h=`
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div class="nw-box" style="margin-bottom:0">
          <div class="nw-lbl">Health</div>
          <div class="nw-amt" style="font-size:20px;color:${this._statusColor(G.health)}">${this._healthLabel(G.health)}</div>
          <div class="nw-sub">${G.health}% · Risk ${risk.label}</div>
        </div>
        <div class="nw-box" style="margin-bottom:0">
          <div class="nw-lbl">Fitness</div>
          <div class="nw-amt" style="font-size:20px;color:${this._statusColor(G.fitness||50,75,45)}">${G.fitness||50}%</div>
          <div class="nw-sub">${this._fitnessLabel(G.fitness||50)} · weight ${food.weightTrend}</div>
        </div>
      </div>

      <div class="nw-box">
        <div class="nw-lbl">Food & Nutrition</div>
        <div class="nw-amt" style="font-size:20px">${plan.icon} ${this._esc(plan.label)}</div>
        <div class="prog-bar" style="margin:8px 0 5px;height:8px"><div class="prog-fill" style="width:${nutrition}%;background:${this._statusColor(nutrition,75,50)}"></div></div>
        <div class="nw-sub">Nutrition ${nutrition}% · Food security ${food.foodSecurity}% · Household ${this._esc(household.label)}</div>
        <div class="nw-sub">Last bill ${fmt(food.lastCost||0)} · Groceries ${fmt(food.groceryCost||0)} · Eating out ${fmt(food.diningCost||0)}</div>
      </div>`;

    h+=this._renderConditions(G);
    h+=this._renderRecovery(G,recovery);
    h+=this._renderFood(G,food,plan,estimate);
    h+=this._renderMedical(G,sti);
    h+=this._renderLifestyle(G);

    el.innerHTML=h;
  },

  _renderConditions(G){
    const list=G.conditions||[];
    if(!list.length){
      return `<div class="info-box" style="border-color:rgba(74,222,128,.35)"><p>✅ No active diagnosed conditions. Keep prevention strong with food, sleep, movement and screening.</p></div>`;
    }
    let h='<div class="sec">Active Conditions</div>';
    list.forEach((c,i)=>{
      h+=`<div class="row-card" style="border-color:rgba(248,113,113,.4)">
        <span class="ri">${c.icon||'🏥'}</span>
        <div class="rd">
          <div class="rt">${this._esc(c.name)}</div>
          <div class="rs">${this._esc(c.desc)} · <span style="color:var(--red)">${this._esc(c.effect||'Health pressure')}</span></div>
        </div>
        <button class="btn-primary btn-sm" style="font-size:11px;padding:7px 10px;width:auto" onclick="Health.treat(${i})">Treat</button>
      </div>`;
    });
    return h;
  },

  _renderRecovery(G,recovery){
    const active=G.addictions?.smoking||G.addictions?.alcohol||G.addictions?.drugs||G.recovery?.active||G.recovery?.cleanStreak>0;
    if(!active)return '';
    let h='<div class="sec">Addiction Recovery</div>';
    if(G.addictions?.smoking)h+=`<div class="addiction-warn"><div class="aw-ico">🚬</div><div class="aw-txt"><strong>Nicotine Addiction</strong> - ongoing yearly health and fitness damage.</div></div>`;
    if(G.addictions?.alcohol)h+=`<div class="addiction-warn"><div class="aw-ico">🍺</div><div class="aw-txt"><strong>Alcohol Dependency</strong> - harms health, mood, money and relationships.</div></div>`;
    if(G.addictions?.drugs)h+=`<div class="addiction-warn"><div class="aw-ico">💉</div><div class="aw-txt"><strong>Drug Addiction</strong> - severe yearly damage and relapse risk.</div></div>`;
    h+=`<div class="info-box"><p>🌱 Clean streak: ${recovery.streak} year${recovery.streak!==1?'s':''} · Rehab stays: ${recovery.rehab} · Relapse risk: ${recovery.risk}%</p></div>
    <div class="act-grid">
      ${G.addictions?.smoking?`<div class="card" onclick="Health.quitAddiction('smoking')"><span class="ci">🚭</span><span class="cn">Quit Smoking</span><span class="cd">Start recovery</span></div>`:''}
      ${G.addictions?.alcohol?`<div class="card" onclick="Health.quitAddiction('alcohol')"><span class="ci">🚫</span><span class="cn">Quit Drinking</span><span class="cd">Start recovery</span></div>`:''}
      ${G.addictions?.drugs?`<div class="card danger" onclick="Health.rehab()"><span class="ci">🏥</span><span class="cn">Drug Rehab</span><span class="cd">${fmt(sc(3500))}</span></div>`:''}
      <div class="card" onclick="Health.rehab()"><span class="ci">🌱</span><span class="cn">Rehab Program</span><span class="cd">${fmt(sc(3500))} · lower relapse</span></div>
    </div>`;
    return h;
  },

  _renderFood(G,food,plan,estimate){
    let h=`<div class="sec">Food & Eating</div>
    <div class="info-box"><p>🍽️ Food is charged yearly. Partner and children raise the bill. Bad nutrition creates real long-term risks; strong nutrition slowly protects health.</p></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
      <div class="nw-box" style="margin-bottom:0">
        <div class="nw-lbl">Estimated Next Food Bill</div>
        <div class="nw-amt" style="font-size:19px">${fmt(estimate.total)}</div>
        <div class="nw-sub">Groceries ${fmt(estimate.groceries)} · Dining ${fmt(estimate.dining)}</div>
      </div>
      <div class="nw-box" style="margin-bottom:0">
        <div class="nw-lbl">Long-Term Pattern</div>
        <div class="nw-amt" style="font-size:19px;color:${food.junkYears>=3?'var(--red)':food.healthyYears>=3?'var(--green)':'var(--txt)'}">${food.healthyYears||0} healthy / ${food.junkYears||0} junk yrs</div>
        <div class="nw-sub">Skipped/short food years: ${food.skippedYears||0}</div>
      </div>
    </div>
    <div class="act-grid">`;

    Object.entries(this.FOOD_PLANS).forEach(([id,p])=>{
      const c=this._foodCost(p,G);
      const selected=food.plan===id;
      const stat=p.health>0?`+${p.health} health`:p.health<0?`${p.health} health`:'neutral health';
      h+=`<div class="card ${selected?'special':''}" onclick="Health.setFoodPlan('${id}')">
        <span class="ci">${p.icon}</span>
        <span class="cn">${this._esc(p.label)}</span>
        <span class="cd">${fmt(c.total)}/yr · Nutrition ${p.nutrition}% · ${stat}</span>
      </div>`;
    });
    h+='</div>';
    return h;
  },

  _renderMedical(G,sti){
    let h=`<div class="sec">Medical Care</div>
    <div class="act-grid">
      <div class="card" onclick="Health.visit('gp')"><span class="ci">👨‍⚕️</span><span class="cn">GP Checkup</span><span class="cd">${fmt(sc(100))} · prevention</span></div>
      <div class="card" onclick="Health.visit('specialist')"><span class="ci">🏥</span><span class="cn">Specialist</span><span class="cd">${fmt(sc(600))} · treat conditions</span></div>
      <div class="card" onclick="Health.visit('hospital')"><span class="ci">🚑</span><span class="cn">Hospital Day</span><span class="cd">${fmt(sc(2000))} · major recovery</span></div>
      <div class="card" onclick="Health.visit('mental')"><span class="ci">🧠</span><span class="cn">Mental Health</span><span class="cd">${fmt(sc(160))} · stress relief</span></div>
    </div>`;

    if((G.age||0)>=18){
      h+=`<div class="sec">Sexual Health</div>
      <div class="row-card" onclick="Health.sexualCheckup()">
        <span class="ri">🧪</span>
        <div class="rd">
          <div class="rt">Sexual health checkup</div>
          <div class="rs">Status: <span style="color:${sti?'var(--red)':'var(--green)'}">${sti?'STI detected':'All clear'}</span> · Partners ${G.sexualHealth?.partners||0} · Protected ${G.sexualHealth?.protectedEncounters||0} / Unprotected ${G.sexualHealth?.unprotectedEncounters||0}</div>
        </div>
        <div class="rv">${fmt(sc(sti?400:120))}</div>
      </div>`;
    }

    h+=`<div class="sec">Screening & Tests</div>
    <div class="act-grid">
      <div class="card" onclick="Health.screen('blood')"><span class="ci">🩸</span><span class="cn">Blood Panel</span><span class="cd">${fmt(sc(150))}</span></div>
      <div class="card" onclick="Health.screen('cancer')"><span class="ci">🔬</span><span class="cn">Cancer Screen</span><span class="cd">${fmt(sc(300))}</span></div>
      <div class="card" onclick="Health.screen('heart')"><span class="ci">💓</span><span class="cn">Cardiac Scan</span><span class="cd">${fmt(sc(400))}</span></div>
      <div class="card" onclick="Health.screen('genetic')"><span class="ci">🧬</span><span class="cn">DNA Test</span><span class="cd">${fmt(sc(800))}</span></div>
    </div>`;
    return h;
  },

  _renderLifestyle(G){
    let h=`<div class="sec">Supplements & Meds</div>
    <div class="act-grid">
      <div class="card" onclick="Health.sup('vitamins')"><span class="ci">💊</span><span class="cn">Vitamins</span><span class="cd">${fmt(sc(40))} · small boost</span></div>
      <div class="card" onclick="Health.sup('protein')"><span class="ci">🥤</span><span class="cn">Protein Shake</span><span class="cd">${fmt(sc(45))} · +Fitness</span></div>
      <div class="card danger" onclick="Health.sup('steroids')"><span class="ci">💉</span><span class="cn">Steroids</span><span class="cd">${fmt(sc(500))} · risky boost</span></div>
      <div class="card" onclick="Health.sup('nootropics')"><span class="ci">🧪</span><span class="cn">Nootropics</span><span class="cd">${fmt(sc(120))} · focus risk</span></div>
    </div>
    <div class="sec">Lifestyle Changes</div>
    <div class="act-grid">
      <div class="card" onclick="Health.lifestyle('vegan')"><span class="ci">🥦</span><span class="cn">Go Vegan</span><span class="cd">+Health +Looks</span></div>
      <div class="card" onclick="Health.lifestyle('sober')"><span class="ci">🚫</span><span class="cn">Quit Alcohol</span><span class="cd">Recovery boost</span></div>
      <div class="card" onclick="Health.lifestyle('keto')"><span class="ci">🥩</span><span class="cn">Keto Diet</span><span class="cd">+Fitness, mixed mood</span></div>
      <div class="card" onclick="Health.lifestyle('cold')"><span class="ci">🧊</span><span class="cn">Cold Showers</span><span class="cd">+Stress control</span></div>
    </div>`;

    if((G.age||0)>=18){
      h+=`<div class="sec">Elective Surgery</div>
      <div class="act-grid">
        <div class="card" onclick="Health.surg('eyes')"><span class="ci">👁️</span><span class="cn">Laser Eye</span><span class="cd">${fmt(sc(3000))}</span></div>
        <div class="card" onclick="Health.surg('heart')"><span class="ci">❤️</span><span class="cn">Heart Surgery</span><span class="cd">${fmt(sc(25000))}</span></div>
        <div class="card" onclick="Health.surg('joint')"><span class="ci">🦿</span><span class="cn">Joint Replace</span><span class="cd">${fmt(sc(14000))}</span></div>
        <div class="card" onclick="Health.surg('cosmetic')"><span class="ci">✨</span><span class="cn">Cosmetic Surgery</span><span class="cd">${fmt(sc(9000))}</span></div>
      </div>`;
    }
    return h;
  },

  setFoodPlan(plan){
    const G=window.G;if(!G||!this.FOOD_PLANS[plan])return;
    this._ensureState(G);
    G.food.plan=plan;
    G.food.lastChoiceLabel=this.FOOD_PLANS[plan].label;
    const cost=this._foodCost(this.FOOD_PLANS[plan],G);
    Engine.log(`${this.FOOD_PLANS[plan].icon} Eating style set to "${this.FOOD_PLANS[plan].label}" (${fmt(cost.total)}/yr estimate).`, 'good');
    UI.update();this.render();
  },

  _payMedical(label,baseCost){
    const G=window.G;
    const amount=Math.max(0,Math.round(baseCost||0));
    if(typeof Assets==='undefined'||!Assets.coveredExpense||!Assets.chargeExpense){
      if((G.money||0)<amount){UI.toast(`Need ${fmt(amount)}!`);return false;}
      G.money-=amount;
      Engine.log(`🏥 ${cap(label)} cost ${fmt(amount)}.`, 'money');
      return true;
    }
    const bill=Assets.coveredExpense('health',amount);
    const res=Assets.chargeExpense(label,bill.outOfPocket,{icon:'🏥',toCollections:true,creditPenalty:bill.insured?8:20,stress:bill.insured?2:6,happiness:bill.insured?1:4,logMiss:true});
    if(res.paid){
      if(bill.insured)Engine.log(`🏥 ${cap(label)} cost ${fmt(amount)}. Insurance covered ${fmt(bill.covered)}.`, 'money');
      else Engine.log(`🏥 ${cap(label)} cost ${fmt(amount)} out of pocket.`, 'bad');
    }
    return res.paid;
  },

  visit(t){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const costs={gp:100,specialist:600,hospital:2000,mental:160};
    const cost=sc(costs[t]||100);
    const ok=this._payMedical(`${t} visit`,cost);
    if(!ok&&G.money<=0&&!G.insurance?.health)UI.toast('You could not cover the full medical bill.');

    if(t==='gp'){
      G.health=cl(G.health+r(8,16));
      G.stress=cl((G.stress||0)-r(1,4));
      if(G.age>40&&Math.random()<0.10)this._addCondition();
      Engine.log('👨‍⚕️ GP checkup complete.', 'good');
    }else if(t==='specialist'){
      if((G.conditions||[]).length>0){
        G.conditions.shift();
        G.health=cl(G.health+r(12,24));
        G.happiness=cl(G.happiness+r(2,6));
        Engine.log('🏥 Specialist treated your condition.', 'good');
      }else{
        G.health=cl(G.health+r(7,14));
        Engine.log('🏥 Specialist exam found no major issue.', 'good');
      }
    }else if(t==='hospital'){
      G.health=cl(G.health+r(22,36));
      G.stress=cl((G.stress||0)-r(2,6));
      Engine.log('🏥 Hospital day-care gave you a major health lift.', 'good');
    }else if(t==='mental'){
      G.happiness=cl(G.happiness+r(12,20));
      G.stress=cl((G.stress||0)-r(14,22));
      G.health=cl(G.health+r(2,5));
      Engine.log('🧠 Mental health care helped a lot.', 'good');
    }
    UI.update();this.render();
  },

  treat(i){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if((G.conditions||[]).length<=i)return;
    const c=G.conditions[i];
    const cost=sc(c?.key==='cancer'?1800:c?.key==='afib'?1200:800);
    const ok=this._payMedical('condition treatment',cost);
    if(!ok&&Math.random()<0.35){
      Engine.log(`⚠️ Treatment for ${c.name} was incomplete because the bill was not fully covered.`, 'bad');
      UI.update();this.render();return;
    }
    G.conditions.splice(i,1);
    G.health=cl(G.health+r(10,18));
    G.happiness=cl(G.happiness+r(2,6));
    Engine.log(`💊 Treatment resolved ${c.name}.`, 'good');
    UI.update();this.render();
  },

  sexualCheckup(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const sti=G.sexualHealth?.sti||G.sexualHealth?.std;
    const cost=sc(sti?400:120);
    this._payMedical('sexual health checkup',cost);
    G.sexualHealth.lastCheckupAge=G.age;
    if(sti){
      G.sexualHealth.sti=false;
      G.sexualHealth.std=false;
      G.health=cl(G.health+8);
      Engine.log('🧪 Sexual health test came back positive, but treatment worked and you are clear now.', 'good');
    }else{
      G.happiness=cl(G.happiness+2);
      Engine.log('🧪 Sexual health test came back clear.', 'good');
    }
    UI.update();this.render();
  },

  rehab(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const cost=sc(3500);
    if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money-=cost;
    G.addictions=G.addictions||{};
    delete G.addictions.smoking;
    delete G.addictions.alcohol;
    delete G.addictions.drugs;
    G.recovery.active=true;
    G.recovery.cleanStreak=0;
    G.recovery.rehabCount=(G.recovery.rehabCount||0)+1;
    G.recovery.relapseChance=Math.max(0.06,(G.recovery.relapseChance||0.18)-0.035);
    G.stress=cl((G.stress||0)-18);
    G.happiness=cl(G.happiness+8);
    G.health=cl(G.health+6);
    Engine.log('🏥 You completed rehab and committed to recovery.', 'good');
    UI.update();this.render();
  },

  screen(t){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const costs={blood:150,cancer:300,heart:400,genetic:800};
    const cost=sc(costs[t]||150);
    this._payMedical(`${t} screening`,cost);

    const riskBonus=(G.age||0)>55?.08:(G.age||0)>40?.04:0;
    const detectChance={blood:.08,cancer:.11,heart:.12,genetic:.07}[t]||.08;
    if(G.age>35&&Math.random()<detectChance+riskBonus){
      const preferred=t==='heart'?'afib':t==='cancer'?'cancer':t==='blood'?(Math.random()<.5?'diabetes':'thyroid'):null;
      this._addCondition(preferred);
      Engine.log('🔬 Screening detected a health concern. Follow up with a specialist.', 'bad');
    }else{
      G.health=cl(G.health+r(2,5));
      G.happiness=cl(G.happiness+5);
      Engine.log('🔬 Screening results were reassuring.', 'good');
    }
    UI.update();this.render();
  },

  sup(t){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const costs={vitamins:40,protein:45,steroids:500,nootropics:120};
    const cost=sc(costs[t]||0);
    if(cost>0&&(G.money||0)<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    if(cost>0)G.money-=cost;

    if(t==='vitamins'){
      G.health=cl(G.health+r(1,4));
      Engine.log('💊 Vitamins added a small health boost.', 'good');
    }else if(t==='protein'){
      G.fitness=cl((G.fitness||50)+r(3,7));
      G.looks=cl(G.looks+r(1,4));
      Engine.log('🥤 Protein improved recovery and training adaptation.', 'good');
    }else if(t==='steroids'){
      if(Math.random()>0.40){
        G.looks=cl(G.looks+r(9,16));
        G.fitness=cl((G.fitness||50)+r(6,12));
        G.stress=cl((G.stress||0)+r(2,6));
        Engine.log('💉 Steroids boosted your physique fast, but pressure increased.', 'good');
      }else{
        G.health=cl(G.health-r(9,18));
        G.happiness=cl(G.happiness-r(2,6));
        Engine.log('💉 Steroid side effects hit your health.', 'bad');
      }
    }else if(t==='nootropics'){
      if(Math.random()>0.32){
        G.smarts=cl(G.smarts+r(5,10));
        G.stress=cl((G.stress||0)+r(1,4));
        Engine.log('🧪 Nootropics sharpened your focus.', 'good');
      }else{
        G.happiness=cl(G.happiness-r(6,12));
        G.stress=cl((G.stress||0)+r(5,10));
        Engine.log('🧪 Nootropics backfired with anxiety and brain fog.', 'bad');
      }
    }
    UI.update();this.render();
  },

  lifestyle(t){
    const G=window.G;if(!G)return;
    this._ensureState(G);

    if(t==='vegan'){
      G.health=cl(G.health+r(5,10));
      G.looks=cl(G.looks+r(2,6));
      G.happiness=cl(G.happiness-r(0,3));
      G.food.plan='organic';
      Engine.log('🥦 Plant-based eating improved your health and nudged your food plan cleaner.', 'good');
    }else if(t==='sober'){
      G.health=cl(G.health+r(10,18));
      G.happiness=cl(G.happiness+r(5,10));
      G.fitness=cl((G.fitness||50)+r(3,8));
      if(G.addictions?.alcohol){delete G.addictions.alcohol;this._markRecovery();Engine.log('🚫 You committed to sobriety.', 'good');}
      else Engine.log('🚫 You doubled down on staying sober.', 'good');
    }else if(t==='keto'){
      G.health=cl(G.health+r(4,9));
      G.fitness=cl((G.fitness||50)+r(3,7));
      G.happiness=cl(G.happiness-r(0,4));
      Engine.log('🥩 Keto improved fitness but felt restrictive.', 'good');
    }else if(t==='cold'){
      G.health=cl(G.health+r(3,7));
      G.fitness=cl((G.fitness||50)+r(2,5));
      G.stress=cl((G.stress||0)-r(5,10));
      Engine.log('🧊 Cold shower routine improved resilience.', 'good');
    }
    UI.update();this.render();
  },

  _markRecovery(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    G.recovery.active=true;
    G.recovery.cleanStreak=0;
  },

  quitAddiction(type){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if(type==='drugs'){UI.toast('Use rehab for drug addiction.');return;}
    if(!G.addictions?.[type]){UI.toast('No active addiction of that type.');return;}

    delete G.addictions[type];
    this._markRecovery();
    if(type==='smoking'){
      G.health=cl(G.health+r(10,18));
      G.fitness=cl((G.fitness||50)+r(5,10));
      Engine.log('🚭 Quit smoking. Recovery starts now.', 'good');
    }
    if(type==='alcohol'){
      G.health=cl(G.health+r(12,20));
      G.happiness=cl(G.happiness+r(6,12));
      Engine.log('🚫 Quit drinking. Recovery starts now.', 'good');
    }
    if(!G.addictions.smoking&&!G.addictions.alcohol&&!G.addictions.drugs){
      G.achievements=G.achievements||{};
      G.achievements.quit_addictions=true;
      Engine.checkAch();
    }
    UI.update();this.render();
  },

  surg(t){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if((G.age||0)<18){UI.toast('Surgery unlocks at 18.');return;}
    const costs={eyes:3000,heart:25000,joint:14000,cosmetic:9000};
    const cost=sc(costs[t]||9000);
    const okPay=this._payMedical(`${t} surgery`,cost);
    if(!okPay&&Math.random()<0.3){
      Engine.log('⚠️ Surgery was delayed because the bill was not covered.', 'bad');
      UI.update();this.render();return;
    }

    const ok=Math.random()>(t==='heart'?0.19:0.14);
    if(t==='eyes'){
      if(ok){G.health=cl(G.health+10);G.looks=cl(G.looks+6);Engine.log('👁️ Laser eye surgery was a success.', 'good');}
      else{G.health=cl(G.health-9);Engine.log('👁️ Eye surgery had complications.', 'bad');}
    }else if(t==='heart'){
      if(ok){G.health=cl(G.health+32);Engine.log('❤️ Heart surgery was a major success.', 'special');}
      else{G.health=cl(G.health-22);Engine.log('❤️ Heart surgery complications hit hard.', 'bad');}
    }else if(t==='joint'){
      if(ok){G.health=cl(G.health+16);G.fitness=cl((G.fitness||50)+r(8,14));G.happiness=cl(G.happiness+12);Engine.log('🦿 Joint replacement restored mobility.', 'good');}
      else{G.health=cl(G.health-11);Engine.log('🦿 Joint replacement had complications.', 'bad');}
    }else if(t==='cosmetic'){
      if(ok){G.looks=cl(G.looks+r(9,18));G.happiness=cl(G.happiness+r(3,8));Engine.log('✨ Cosmetic surgery improved your looks.', 'good');}
      else{G.looks=cl(G.looks-r(9,18));G.health=cl(G.health-11);Engine.log('✨ Cosmetic surgery had a bad outcome.', 'bad');}
    }
    UI.update();this.render();
  },

  _addCondition(preferred){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    const have=(G.conditions||[]).map(c=>c.key||c.name);
    const chosen=preferred?this.CONDITIONS.find(c=>c.key===preferred||c.name===preferred):null;
    const pool=chosen?[chosen]:this.CONDITIONS.filter(c=>!have.includes(c.key||c.name));
    if(!pool.length)return;
    const c=pick(pool);
    if(!c||have.includes(c.key||c.name))return;
    G.conditions.push({...c});
    G.health=cl(G.health-r(5,12));
    Engine.log(`⚠️ Diagnosed with ${c.name}.`, 'bad');
  },

  _ensureState(G){
    if(!G)return;
    if(!Array.isArray(G.conditions))G.conditions=[];
    if(!G.addictions)G.addictions={};
    if(!G.recovery)G.recovery={active:false,cleanStreak:0,rehabCount:0,relapseChance:0.18};
    if(!G.sexualHealth)G.sexualHealth={partners:0,protectedEncounters:0,unprotectedEncounters:0,sti:false,std:false};
    this._ensureFoodState(G);
    if(!Number.isFinite(G.health))G.health=60;
    if(!Number.isFinite(G.happiness))G.happiness=60;
    if(!Number.isFinite(G.fitness))G.fitness=50;
    if(!Number.isFinite(G.looks))G.looks=50;
    if(!Number.isFinite(G.stress))G.stress=0;
  },

  _ensureFoodState(G){
    if(!G.food)G.food={};
    G.food.plan=this.FOOD_PLANS[G.food.plan]?G.food.plan:'cook';
    G.food.healthyYears=Number.isFinite(G.food.healthyYears)?G.food.healthyYears:0;
    G.food.junkYears=Number.isFinite(G.food.junkYears)?G.food.junkYears:0;
    G.food.skippedYears=Number.isFinite(G.food.skippedYears)?G.food.skippedYears:0;
    G.food.lastCost=Number.isFinite(G.food.lastCost)?G.food.lastCost:0;
    G.food.groceryCost=Number.isFinite(G.food.groceryCost)?G.food.groceryCost:0;
    G.food.diningCost=Number.isFinite(G.food.diningCost)?G.food.diningCost:0;
    G.food.nutritionScore=Number.isFinite(G.food.nutritionScore)?G.food.nutritionScore:55;
    G.food.foodSecurity=Number.isFinite(G.food.foodSecurity)?G.food.foodSecurity:100;
    G.food.weightTrend=G.food.weightTrend||'stable';
    G.food.lastChoiceLabel=G.food.lastChoiceLabel||this.FOOD_PLANS[G.food.plan]?.label||'Cook at home';
  },

  _foodHousehold(G){
    const kids=dependentChildrenCount(G);
    const partner=cohabitingPartner(G)?1:0;
    const adults=1+partner;
    const equivalent=1+(partner*.75)+(kids*.52);
    const label=`${adults} adult${adults!==1?'s':''}${kids?`, ${kids} child${kids!==1?'ren':''}`:''}`;
    return{kids,partner,adults,equivalent,label};
  },

  _foodCost(plan,G){
    const hh=this._foodHousehold(G);
    const total=Math.round(annualCost(plan.cost)*hh.equivalent);
    return{total,groceries:Math.round(total*(plan.groceries??.65)),dining:Math.round(total*(plan.dining??.35)),household:hh};
  },

  _riskProfile(G,plan){
    let score=0;
    score+=(100-(G.health||60))*0.35;
    score+=(G.stress||0)*0.18;
    score+=(100-(G.food?.nutritionScore||55))*0.22;
    score+=(G.conditions||[]).length*8;
    if(G.addictions?.smoking)score+=9;
    if(G.addictions?.alcohol)score+=10;
    if(G.addictions?.drugs)score+=18;
    if(plan?.calories==='very_high')score+=8;
    if(score>=55)return{label:'High',color:'var(--red)',score:Math.round(score)};
    if(score>=30)return{label:'Moderate',color:'var(--yellow)',score:Math.round(score)};
    return{label:'Low',color:'var(--green)',score:Math.round(score)};
  },

  _recoverySummary(G){
    const streak=G.recovery?.cleanStreak||0;
    const rehab=G.recovery?.rehabCount||0;
    const base=G.recovery?.relapseChance??.18;
    const risk=Math.max(3,Math.min(65,Math.round((base+(G.stress||0)/500-Math.min(streak*.02,.12))*100)));
    return{streak,rehab,risk};
  },

  _applyNutrition(plan,security){
    const G=window.G;
    const food=G.food;
    const cookingBonus=(G.skills?.cooking||0)*2;
    const fitnessBonus=(G.skills?.fitness||0);
    const target=cl(plan.nutrition+cookingBonus+fitnessBonus-Math.max(0,100-security)*.45);
    food.nutritionScore=cl((food.nutritionScore*.65)+(target*.35));
    G.health=cl(G.health+plan.health-Math.max(0,70-security)/10);
    G.happiness=cl(G.happiness+plan.happiness-Math.max(0,65-security)/8);
    G.looks=cl(G.looks+plan.looks);
    G.fitness=cl((G.fitness||50)+plan.fitness);
    G.stress=cl((G.stress||0)+(plan.stress||0)+Math.max(0,70-security)/6);

    if(food.nutritionScore>=72){food.healthyYears=(food.healthyYears||0)+1;food.junkYears=Math.max(0,(food.junkYears||0)-1);}
    else if(food.nutritionScore<=38||plan.calories==='very_high'){food.junkYears=(food.junkYears||0)+1;food.healthyYears=Math.max(0,(food.healthyYears||0)-1);}
    else{food.healthyYears=Math.max(0,(food.healthyYears||0)-1);food.junkYears=Math.max(0,(food.junkYears||0)-1);}

    const calorieRisk={low:-1,lean:-.35,balanced:0,high:.75,very_high:1.4}[plan.calories]||0;
    const activity=((G.fitness||50)-50)/65;
    const weightScore=calorieRisk-activity;
    food.weightTrend=weightScore>.75?'gaining':weightScore<-.75?'losing':'stable';
    if(food.weightTrend==='gaining'){G.looks=cl(G.looks-1);G.fitness=cl((G.fitness||50)-1);}
    if(food.weightTrend==='losing'&&security<65){G.health=cl(G.health-2);G.happiness=cl(G.happiness-2);}
  },

  _applyFoodYear(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if((G.age||0)<18)return;

    if(G.inPrison){
      G.food.lastCost=0;G.food.groceryCost=0;G.food.diningCost=0;G.food.foodSecurity=100;G.food.lastChoiceLabel='Prison meals';
      G.food.nutritionScore=cl((G.food.nutritionScore||55)-2);
      G.health=cl(G.health-1);G.happiness=cl(G.happiness-2);
      Engine.log('🍽️ Prison meals covered basic calories, but quality was rough.', 'neutral');
      return;
    }

    const plan=this.FOOD_PLANS[G.food.plan]||this.FOOD_PLANS.cook;
    const bill=this._foodCost(plan,G);
    const total=bill.total;
    G.food.lastChoiceLabel=plan.label;
    G.food.lastCost=total;
    G.food.groceryCost=bill.groceries;
    G.food.diningCost=bill.dining;

    if((G.money||0)<total){
      const paid=Math.max(0,G.money||0);
      const security=cl(total>0?(paid/total)*100:100);
      G.money=0;
      G.food.foodSecurity=security;
      G.food.skippedYears=(G.food.skippedYears||0)+1;
      G.health=cl(G.health-(security<35?18:security<65?10:5));
      G.happiness=cl(G.happiness-(security<35?20:security<65?12:6));
      G.stress=cl((G.stress||0)+(security<35?24:security<65?15:8));
      G.food.nutritionScore=cl((G.food.nutritionScore||55)-(security<35?14:8));
      Engine.log(`⚠️ Food insecurity: covered ${fmt(paid)} of ${fmt(total)}. Health, mood and stress suffered.`, 'bad');
      return;
    }

    G.money-=total;
    G.food.foodSecurity=100;
    this._applyNutrition(plan,100);
    Engine.log(`${plan.icon} Food paid: ${fmt(total)} (${fmt(bill.groceries)} groceries, ${fmt(bill.dining)} eating out). Nutrition now ${G.food.nutritionScore}%.`, 'money');

    if((G.food.healthyYears||0)>=5){
      G.health=cl(G.health+2);
      if(Math.random()<.3)Engine.log('🥗 Consistent high-quality eating is paying off with better long-term health.', 'good');
    }
    if((G.food.junkYears||0)>=3){
      G.looks=cl(G.looks-1);
      if(Math.random()<.35)this._addCondition('obesity');
      if((G.food.junkYears||0)>=5&&Math.random()<.28)this._addCondition('diabetes');
    }
    if((G.food.nutritionScore||55)<30&&Math.random()<.22)this._addCondition('hypertension');
  },

  _handleRecovery(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    if(G.addictions?.smoking||G.addictions?.alcohol||G.addictions?.drugs){G.recovery.cleanStreak=0;return;}
    if(!G.recovery.active)return;

    G.recovery.cleanStreak=(G.recovery.cleanStreak||0)+1;
    const relapseChance=Math.max(.03,(G.recovery.relapseChance||.18)+(G.stress||0)/500-Math.min((G.recovery.cleanStreak||0)*.02,.12));
    if(Math.random()<relapseChance){
      const back=pick(['smoking','alcohol','drugs']);
      G.addictions[back]=true;
      G.recovery.cleanStreak=0;
      G.stress=cl((G.stress||0)+10);
      Engine.log(`⚠️ Relapse. ${cap(back)} addiction came roaring back.`, 'bad');
    }else if((G.recovery.cleanStreak||0)>0&&G.recovery.cleanStreak%3===0){
      Engine.log(`🌱 Clean streak reached ${G.recovery.cleanStreak} years. Recovery is holding.`, 'good');
    }
  },

  tick(){
    const G=window.G;if(!G)return;
    this._ensureState(G);
    this._applyFoodYear();

    (G.conditions||[]).forEach(c=>{
      if(Number.isFinite(c.health))G.health=cl(G.health+c.health);
      if(Number.isFinite(c.happiness))G.happiness=cl(G.happiness+c.happiness);
      if(Number.isFinite(c.stress))G.stress=cl((G.stress||0)+c.stress);
    });

    if(G.addictions?.smoking){G.health=cl(G.health-r(3,6));G.fitness=cl((G.fitness||50)-r(1,3));}
    if(G.addictions?.alcohol){G.health=cl(G.health-r(2,5));G.happiness=cl(G.happiness-r(1,3));G.money=Math.max(0,(G.money||0)-annualCost(450));}
    if(G.addictions?.drugs){G.health=cl(G.health-r(7,14));G.happiness=cl(G.happiness-r(4,8));G.stress=cl((G.stress||0)+r(6,12));G.money=Math.max(0,(G.money||0)-annualCost(900));}

    if((G.conditions||[]).length>0&&Math.random()<.35)this._payMedical('ongoing treatment',annualCost(700+(G.conditions.length*350)));
    if(G.sexualHealth?.sti||G.sexualHealth?.std){
      G.health=cl(G.health-r(2,5));
      if(Math.random()<.4)this._payMedical('sti treatment',annualCost(350));
    }

    if(G.trait==='resilient'&&(G.age||0)>45)G.health=cl(G.health+1);
    this._handleRecovery();
  },
};