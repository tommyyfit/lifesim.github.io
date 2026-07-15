/* js/business.js - LifeSim module */
const Business={
  TYPES:[
    {id:'food_cart',icon:'🌮',name:'Food Cart',startCost:5000,rev:8000,expenses:3000,growthRate:.15,desc:'Street food vendor',risk:'Low'},
    {id:'salon',icon:'💇',name:'Hair Salon',startCost:15000,rev:24000,expenses:9000,growthRate:.12,desc:'Beauty & grooming',risk:'Low'},
    {id:'bar',icon:'🍺',name:'Bar / Pub',startCost:40000,rev:62000,expenses:30000,growthRate:.12,desc:'Neighbourhood bar',risk:'Medium'},
    {id:'gym',icon:'🏋️',name:'Gym / Fitness',startCost:60000,rev:82000,expenses:36000,growthRate:.13,desc:'Fitness centre',risk:'Medium'},
    {id:'restaurant',icon:'🍽️',name:'Restaurant',startCost:80000,rev:125000,expenses:68000,growthRate:.14,desc:'Full-service dining',risk:'High'},
    {id:'boutique',icon:'👗',name:'Fashion Boutique',startCost:30000,rev:52000,expenses:24000,growthRate:.12,desc:'Clothing retail store',risk:'Medium'},
    {id:'creator_studio',icon:'📸',name:'Creator Studio',startCost:1200,rev:18000,expenses:4000,growthRate:.26,desc:'Subscription content brand',risk:'High'},
    {id:'film_studio',icon:'🎬',name:'Film Studio',startCost:85000,rev:160000,expenses:76000,growthRate:.18,desc:'Video production company',risk:'High'},
    {id:'tech_startup',icon:'💻',name:'Tech Startup',startCost:50000,rev:0,expenses:42000,growthRate:.30,desc:'SaaS product',risk:'Extreme'},
    {id:'estate_agency',icon:'🏡',name:'Estate Agency',startCost:45000,rev:92000,expenses:42000,growthRate:.12,desc:'Property sales',risk:'Medium'},
    {id:'marketing_agency',icon:'📣',name:'Marketing Agency',startCost:35000,rev:75000,expenses:40000,growthRate:.14,desc:'Digital marketing firm',risk:'Medium'},
    {id:'cleaning_co',icon:'🧽',name:'Cleaning Company',startCost:12000,rev:36000,expenses:15000,growthRate:.16,desc:'Residential and office cleaning contracts',risk:'Low'},
    {id:'landscaping',icon:'🌿',name:'Landscaping Crew',startCost:18000,rev:46000,expenses:21000,growthRate:.15,desc:'Outdoor maintenance and small property projects',risk:'Low'},
    {id:'ecommerce',icon:'📦',name:'E-commerce Store',startCost:22000,rev:68000,expenses:36000,growthRate:.20,desc:'Online products, fulfillment and ads',risk:'Medium'},
    {id:'mobile_app',icon:'📱',name:'Mobile App Studio',startCost:30000,rev:12000,expenses:26000,growthRate:.34,desc:'Small software products with slow early traction',risk:'High'},
    {id:'hotel',icon:'🏨',name:'Boutique Hotel',startCost:500000,rev:620000,expenses:310000,growthRate:.10,desc:'Luxury accommodation',risk:'High'},
    {id:'media_co',icon:'📺',name:'Media Company',startCost:100000,rev:210000,expenses:105000,growthRate:.18,desc:'Content & publishing',risk:'High'},
    {id:'law_firm',icon:'⚖️',name:'Law Firm',startCost:200000,rev:420000,expenses:190000,growthRate:.10,desc:'Legal services',risk:'Medium'},
    {id:'investment_co',icon:'📈',name:'Investment Fund',startCost:1000000,rev:220000,expenses:55000,growthRate:.22,desc:'Asset management',risk:'Extreme'},
  ],

  ACTIONS:{
    market:{icon:'📣',label:'Marketing Push',cost:2000,desc:'+Revenue and brand'},
    hire:{icon:'👥',label:'Hire Staff',cost:5000,desc:'+Capacity, +expenses'},
    expand:{icon:'🏗️',label:'Expand',cost:10000,desc:'Big growth move'},
    efficiency:{icon:'⚙️',label:'Optimize Costs',cost:0,desc:'Lower expenses'},
    franchise:{icon:'🏪',label:'Franchise',cost:50000,desc:'Massive scale move'},
    pivot:{icon:'🔄',label:'Pivot Business',cost:0,desc:'New direction'},
    ipo:{icon:'📈',label:'IPO',cost:0,desc:'Need huge valuation'},
    sell:{icon:'💰',label:'Sell Business',cost:0,desc:'Cash out'},
    insurance:{icon:'🛡️',label:'Business Insurance',cost:2000,desc:'Protect against crisis'},
    pr:{icon:'📰',label:'PR Campaign',cost:2500,desc:'+Fame +brand'},
    product:{icon:'🧪',label:'Product Upgrade',cost:6500,desc:'+Quality +value'},
    training:{icon:'🎓',label:'Staff Training',cost:3500,desc:'+Morale +systems'},
    digital:{icon:'🛒',label:'Online Sales Push',cost:4200,desc:'+Revenue +brand'},
    supplier:{icon:'🤝',label:'Supplier Deal',cost:2800,desc:'-Expenses +quality'},
    automation:{icon:'🤖',label:'Automation',cost:9000,desc:'+Systems +margin'},
    retreat:{icon:'🌴',label:'Team Retreat',cost:3000,desc:'+Morale +brand'},
    capital:{icon:'💸',label:'Raise Capital',cost:0,desc:'+Cash +value, some pressure'},
    taxhack:{icon:'🧾',label:'Aggressive Accounting',cost:0,desc:'Extra cash, audit risk'},
    bribe:{icon:'⚖️',label:'Compliance Lawyer',cost:0,desc:'Reduce audit heat'},
  },

  ACTION_LIMITS:{
    market:2, hire:3, expand:2, efficiency:2, franchise:1, pivot:1, ipo:1, sell:1,
    insurance:1, pr:2, product:2, training:2, digital:2, supplier:2,
    automation:2, retreat:1, capital:2, taxhack:1, bribe:1,
  },

  HISTORY_LIMIT:12,
  EVENT_MEMORY_LIMIT:10,

  render(){
    const G=window.G;
    if(!G)return;
    const el=document.getElementById('tab-business');
    if(!el)return;
    let h='';
    if(G.business){
      const b=G.business;
      this.ensureState(b);
      const profit=sc((b.revenue||0)-(b.expenses||0));
      const margin=this.margin(b);
      const auditRisk=this.auditRisk(b);
      const health=this.businessHealth(b);
      const profitC=profit>=0?'var(--green)':'var(--red)';
      const riskColor=auditRisk>=55?'var(--red)':auditRisk>=30?'var(--yellow)':'var(--green)';
      const taxLabel=b.taxHackActive?'Clean the Books':'Aggressive Accounting';
      const taxSub=b.taxHackActive?'Pay accountants and reduce heat':'Short-term cash, real audit risk';
      const lawyerCost=this.bribeCost(b);
      const valuationMultiple=this.valuationMultiple(b);
      const actionSummary=this._actionSummary(b);

      h+=`<div class="biz-hero">
        <div class="biz-ico">${b.icon}</div>
        <div class="biz-name">${this._esc(b.name)}</div>
        <div class="biz-type">${this._esc(b.desc)} · Founded age ${b.foundedAge} · Year ${b.yearsOpen}</div>
        <div class="biz-rev">Revenue: ${fmt(sc(b.revenue||0))}/yr · Expenses: ${fmt(sc(b.expenses||0))}/yr · Margin ${margin}%</div>
        <div class="biz-val">Net profit: <span style="color:${profitC}">${fmt(profit)}/yr</span> · Valuation: ${fmt(b.value||0)} · ${valuationMultiple}x multiple</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        ${this._metricBox('Business Health',`${health.score}%`,health.color,health.label)}
        ${this._metricBox('Audit Heat',`${auditRisk}%`,riskColor,`${b.taxHackActive?'Aggressive scheme active':'Books are clean'}${b.bribeShield>0?` · legal cover ${b.bribeShield}y`:''}`)}
        ${this._metricBox('Brand Power',`${b.brand||0}/100`,'var(--teal)',`Quality ${b.quality||0}/100 · staff ${b.staff||0}`)}
        ${this._metricBox('Operations',`${b.systems||0}/100`,'',`${actionSummary} · morale ${b.morale||0}/100`)}
      </div>`;

      h+=this._renderOperations(b,taxLabel,taxSub,lawyerCost);
      h+=this._renderRiskPanel(b,auditRisk,profit,margin);
      h+=this._renderHistory(b);
    }else{
      if((G.age||0)<18){el.innerHTML='<div class="empty"><span class="ei">🏢</span><p>Must be 18 to start a business.</p></div>';return;}
      h+=`<div class="info-box"><p>🚀 Build your own business empire. Better businesses compound fast, but growth, cashflow, taxes and bad management can destroy weak operators.</p></div>
      <div class="sec">🚀 Start a Business</div>`;
      this.TYPES.forEach(t=>{
        const cost=sc(t.startCost);
        const can=(G.money||0)>=cost;
        const profit=sc((t.rev||0)-(t.expenses||0));
        const margin=t.rev>0?Math.round(((t.rev-t.expenses)/Math.max(1,t.rev))*100):'N/A';
        h+=`<div class="row-card ${can?'':'locked'}" onclick="${can?`Business.start('${t.id}')`:''}">
          <span class="ri">${t.icon}</span>
          <div class="rd"><div class="rt">${this._esc(t.name)}</div><div class="rs">${this._esc(t.desc)} · ${profit>0?`Profit ${fmt(profit)}/yr · Margin ${margin}%`:'Growth play · burns cash early'} · ${t.risk} risk · Growth +${Math.round(t.growthRate*100)}%/yr</div></div>
          <div class="rv">${fmt(cost)}</div>
        </div>`;
      });
    }
    el.innerHTML=h;
  },

  _renderOperations(b,taxLabel,taxSub,lawyerCost){
    return `<div class="sec">Operations</div>
      <div class="info-box"><p>🧭 Actions now have yearly limits to prevent spam-click exploits. Use your yearly management bandwidth wisely.</p></div>
      <div class="act-grid">
        ${this._actionCard('market',`+Revenue (${fmt(sc(2000))})`,false,'',b)}
        ${this._actionCard('hire','+Revenue +Staff',false,'',b)}
        ${this._actionCard('expand',`Scale up (${fmt(sc(10000))})`,false,'',b)}
        ${this._actionCard('efficiency','-Expenses +systems',false,'',b)}
      </div>
      <div class="act-grid" style="margin-top:8px">
        ${this._actionCard('franchise',`Major scale (${fmt(sc(50000))})`,false,'',b)}
        ${this._actionCard('pivot','Change model',false,'',b)}
        ${this._actionCard('ipo',`Need ${fmt(sc(1000000))}+ value`,false,'',b)}
        ${this._actionCard('sell','Cash out',true,'',b)}
      </div>
      <div class="act-grid" style="margin-top:8px">
        ${this._actionCard('insurance',b.insured?'Already insured':`Protect (${fmt(sc(2000))})`,false,b.insured?'special':'',b)}
        ${this._actionCard('pr','+Fame +Brand',false,'',b)}
        ${this._actionCard('product',`Improve offer (${fmt(sc(6500))})`,false,'',b)}
        ${this._actionCard('training',`Train team (${fmt(sc(3500))})`,false,'',b)}
      </div>
      <div class="act-grid" style="margin-top:8px">
        ${this._actionCard('digital',`Online sales (${fmt(sc(4200))})`,false,'',b)}
        ${this._actionCard('supplier',`Lower costs (${fmt(sc(2800))})`,false,'',b)}
        ${this._actionCard('automation',`Build systems (${fmt(sc(9000))})`,false,'',b)}
        ${this._actionCard('retreat',`Morale reset (${fmt(sc(3000))})`,false,'',b)}
        ${this._actionCard('capital','Raise expansion cash',false,'',b)}
        ${this._customActionCard('taxhack','🧾',taxLabel,taxSub,b,b.taxHackActive?'danger':'')}
        ${this._customActionCard('bribe','⚖️','Compliance Lawyer',`${fmt(lawyerCost)} · lowers audit risk`,b)}
      </div>`;
  },

  _renderRiskPanel(b,auditRisk,profit,margin){
    const status=profit<0?'Burning cash':margin>=35?'Highly profitable':margin>=15?'Healthy margin':'Thin margin';
    const risk=auditRisk>=55?'High audit pressure':auditRisk>=30?'Moderate audit pressure':'Low audit pressure';
    const dirty=b.taxHackActive?` Dirty books are active and have run for ${b.taxHackYears||0} year${(b.taxHackYears||0)!==1?'s':''}.`:'';
    return `<div class="info-box" style="border-color:${auditRisk>=55?'rgba(248,113,113,.35)':auditRisk>=30?'rgba(251,191,36,.35)':'rgba(74,222,128,.35)'}">
      <p>📊 Status: ${status}. ${risk}. Brand, quality, staff, morale and systems affect growth, crisis resistance and valuation.${dirty}</p>
    </div>`;
  },

  _renderHistory(b){
    const history=(b.history||[]).slice(0,5);
    if(!history.length)return '';
    let h='<div class="sec">Recent Business History</div>';
    history.forEach(row=>{
      const p=row.profit||0;
      h+=`<div class="row-card">
        <span class="ri">${p>=0?'📈':'📉'}</span>
        <div class="rd"><div class="rt">Age ${row.age} · Year ${row.year}</div><div class="rs">Profit ${fmt(p)} · Revenue ${fmt(row.revenue)} · Value ${fmt(row.value)} · Health ${row.health}%</div></div>
        <div class="rv">${p>=0?'+':'−'}</div>
      </div>`;
    });
    return h;
  },

  _actionCard(id,sub,danger=false,extraClass='',b=null){
    const a=this.ACTIONS[id];
    return this._customActionCard(id,a.icon,a.label,sub||a.desc,b,`${danger?'danger ':''}${extraClass}`);
  },

  _customActionCard(id,icon,label,sub,b=null,extraClass=''){
    const blocked=b&&!this._canUseAction(b,id);
    const left=b?this._usesLeft(b,id):null;
    const leftTxt=b&&left!==null&&left<99?``:'';
    return `<div class="card ${extraClass||''} ${blocked?'locked':''}" onclick="${blocked?'':`Business.act('${id}')`}"><span class="ci">${icon}</span><span class="cn">${label}</span><span class="cd">${sub||''}${leftTxt}</span></div>`;
  },

  _metricBox(label,value,color,sub){
    return `<div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">${this._esc(label)}</div><div class="nw-amt" style="font-size:22px${color?`;color:${color}`:''}">${value}</div><div class="nw-sub">${this._esc(sub)}</div></div>`;
  },

  _esc(s){
    return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  start(id){
    const G=window.G;
    const t=this.TYPES.find(x=>x.id===id)||this._legacyType(id);
    if(!t)return;
    if((G.age||0)<18){UI.toast('You must be 18 to start a business.');return;}
    const cost=sc(t.startCost);
    if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)} to start!`);return;}
    G.money-=cost;
    G.business={
      id:t.id,icon:t.icon,name:t.name,desc:t.desc,revenue:t.rev,expenses:t.expenses,
      value:cost,growthRate:t.growthRate,foundedAge:G.age,yearsOpen:0,insured:false,
      brand:r(8,18),quality:r(42,58),staff:0,systems:r(25,45),morale:r(45,60),
      taxHackActive:false,auditHeat:0,bribeShield:0,lastTaxSavings:0,taxHackYears:0,totalBribes:0,
      actionYear:G.age,actionUses:{},history:[],eventMemory:[],lastProfit:0,lastGrowthPct:0,lastCrisisAge:-999,lastBoomAge:-999
    };
    Engine.log(`🚀 Launched ${t.name}! Invested ${fmt(cost)}. Year 1 begins.`,'special');
    G.happiness=cl((G.happiness||50)+15);
    Engine.checkAch();
    UI.update();
    this.render();
  },

  _legacyType(id){
    if(id==='onlyfans')return{...this.TYPES.find(t=>t.id==='creator_studio'),id:'creator_studio'};
    if(id==='adult_studio')return{...this.TYPES.find(t=>t.id==='film_studio'),id:'film_studio'};
    return null;
  },

  ensureState(b){
    if(!b)return;
    if(b.id==='onlyfans'){b.id='creator_studio';b.name='Creator Studio';b.desc='Subscription content brand';}
    if(b.id==='adult_studio'){b.id='film_studio';b.name='Film Studio';b.desc='Video production company';}
    if(typeof b.taxHackActive!=='boolean')b.taxHackActive=false;
    if(!Number.isFinite(b.auditHeat))b.auditHeat=0;
    if(!Number.isFinite(b.bribeShield))b.bribeShield=0;
    if(!Number.isFinite(b.lastTaxSavings))b.lastTaxSavings=0;
    if(!Number.isFinite(b.taxHackYears))b.taxHackYears=0;
    if(!Number.isFinite(b.totalBribes))b.totalBribes=0;
    if(!Number.isFinite(b.brand))b.brand=cl(Math.round((b.value||0)/Math.max(1,sc(25000)))+15);
    if(!Number.isFinite(b.quality))b.quality=50;
    if(!Number.isFinite(b.staff))b.staff=0;
    if(!Number.isFinite(b.systems))b.systems=40;
    if(!Number.isFinite(b.morale))b.morale=55;
    if(!Number.isFinite(b.revenue))b.revenue=0;
    if(!Number.isFinite(b.expenses))b.expenses=0;
    if(!Number.isFinite(b.value))b.value=sc(1000);
    if(!Number.isFinite(b.growthRate))b.growthRate=.10;
    if(!Number.isFinite(b.yearsOpen))b.yearsOpen=0;
    if(!Number.isFinite(b.lastProfit))b.lastProfit=0;
    if(!Number.isFinite(b.lastGrowthPct))b.lastGrowthPct=0;
    if(!Number.isFinite(b.lastCrisisAge))b.lastCrisisAge=-999;
    if(!Number.isFinite(b.lastBoomAge))b.lastBoomAge=-999;
    if(!Array.isArray(b.history))b.history=[];
    if(!Array.isArray(b.eventMemory))b.eventMemory=[];
    if(!b.actionUses||typeof b.actionUses!=='object')b.actionUses={};
    if(!Number.isFinite(b.actionYear))b.actionYear=window.G?.age||0;
    this._resetYearActionsIfNeeded(b);
  },

  margin(b){
    const revenue=Math.max(1,b.revenue||1);
    return Math.round((((b.revenue||0)-(b.expenses||0))/revenue)*100);
  },

  valuationMultiple(b){
    const margin=this.margin(b);
    let mult=1.6+(b.growthRate||0)*8+((b.brand||0)/100)*1.2+((b.systems||0)/100)*0.8+((b.quality||0)/100)*0.5;
    if(margin>35)mult+=0.8;
    if(margin>55)mult+=0.4;
    if(margin<0)mult-=0.9;
    if(this.auditRisk(b)>55)mult-=0.5;
    return Math.max(0.6,Math.round(mult*10)/10);
  },

  businessHealth(b){
    const profit=(b.revenue||0)-(b.expenses||0);
    const margin=this.margin(b);
    const profitScore=profit>0?Math.min(28,18+margin*.22):Math.max(0,15+profit/Math.max(1,b.expenses||1)*30);
    const score=cl(profitScore+(b.brand||0)*0.20+(b.quality||0)*0.20+(b.systems||0)*0.22+(b.morale||0)*0.16-(this.auditRisk(b)*0.18));
    if(score>=75)return{score,color:'var(--green)',label:'Strong operator'};
    if(score>=55)return{score,color:'var(--teal)',label:'Healthy but improvable'};
    if(score>=35)return{score,color:'var(--yellow)',label:'Fragile business'};
    return{score,color:'var(--red)',label:'Danger zone'};
  },

  auditRisk(b){
    const G=window.G||{};
    this.ensureState(b);
    const smartAdj=(G.smarts||50)>=85?-12:(G.smarts||50)>=70?-7:(G.smarts||50)<=35?10:0;
    const skillAdj=(G.skills?.finance||0)*3+(G.skills?.negotiation||0)*2;
    const systemsAdj=Math.round((b.systems||40)/10);
    const heat=(b.auditHeat||0)+(b.taxHackActive?18:0);
    const countryAdj=Math.round(((G.country?.crimeRate||0.35)-0.35)*26);
    const diffAdj=G.difficulty==='easy'?-4:G.difficulty==='hard'?5:G.difficulty==='extreme'?9:0;
    const ageAdj=(b.taxHackYears||0)>3?Math.min(14,(b.taxHackYears||0)*2):0;
    return Math.max(3,Math.min(95,Math.round(heat+countryAdj+diffAdj+smartAdj+ageAdj-skillAdj-systemsAdj-(b.bribeShield||0)*10)));
  },

  bribeCost(b){
    const rawBase=(b.revenue||0)>500000?12000:(b.revenue||0)>180000?6500:(b.revenue||0)>70000?3500:1800;
    return sc(rawBase+Math.round((b.auditHeat||0)*55)+Math.round((b.value||0)*0.003));
  },

  _taxSavings(b){
    return sc(Math.max(1800,Math.round(Math.max(0,(b.revenue||0)-(b.expenses||0))*0.10+(b.revenue||0)*0.025)));
  },

  _chargeShortfall(amount,label='business costs'){
    const G=window.G;
    const due=Math.max(0,Math.round(amount));
    if(!due)return {paid:true,missed:0};
    if(typeof Assets!=='undefined'&&Assets.chargeExpense){
      return Assets.chargeExpense(label,due,{toCollections:true,collectionMult:1.18,creditPenalty:24,stress:6,happiness:3,icon:'🏢',missType:'bad'});
    }
    if((G.money||0)>=due){G.money-=due;return {paid:true,missed:0};}
    const unpaid=due-Math.max(0,G.money||0);
    G.money=0;
    G.debtCollections=(G.debtCollections||0)+Math.round(unpaid*1.18);
    if(typeof Assets!=='undefined'&&Assets.changeCredit)Assets.changeCredit(-26);
    return {paid:false,missed:unpaid};
  },

  _pay(cost){
    const G=window.G;
    if((G.money||0)<cost){UI.toast('Need '+fmt(cost)+'!');return false;}
    G.money-=cost;
    return true;
  },

  _resetYearActionsIfNeeded(b){
    const age=window.G?.age||0;
    if(b.actionYear!==age){
      b.actionYear=age;
      b.actionUses={};
    }
  },

  _usesLeft(b,id){
    this._resetYearActionsIfNeeded(b);
    const limit=this.ACTION_LIMITS[id]??99;
    const used=b.actionUses?.[id]||0;
    return Math.max(0,limit-used);
  },

  _canUseAction(b,id){
    if(id==='sell')return true;
    if(id==='insurance'&&b.insured)return false;
    return this._usesLeft(b,id)>0;
  },

  _markActionUse(b,id){
    this._resetYearActionsIfNeeded(b);
    b.actionUses[id]=(b.actionUses[id]||0)+1;
  },

  _actionSummary(b){
    this._resetYearActionsIfNeeded(b);
    const used=Object.values(b.actionUses||{}).reduce((a,n)=>a+(Number(n)||0),0);
    return used?`${used} action${used!==1?'s':''} used age ${window.G?.age||0}`:'fresh year';
  },

  _runAction(b,id,fn){
    if(!this._canUseAction(b,id)){
      UI.toast('You already used that business action enough this year.','bad');
      return false;
    }
    const ok=fn();
    if(ok!==false)this._markActionUse(b,id);
    return ok!==false;
  },

  act(a){
    const G=window.G;
    const b=G.business;
    if(!b&&a!=='sell')return;
    if(b)this.ensureState(b);

    if(a==='market'){
      this._runAction(b,'market',()=>{
        const c=sc(2000);
        if(!this._pay(c))return false;
        b.revenue=Math.floor((b.revenue||0)*(1+r(6,15)/100));
        b.brand=cl((b.brand||0)+r(3,7));
        b.morale=cl((b.morale||55)+r(0,2));
        Engine.log(`📣 Marketing boosted revenue to ${fmt(sc(b.revenue))}/yr and grew the brand.`, 'money');
      });
    }else if(a==='hire'){
      this._runAction(b,'hire',()=>{
        const c=sc(5000);
        if(!this._pay(c))return false;
        b.staff=(b.staff||0)+r(1,3);
        b.revenue=Math.floor((b.revenue||0)*1.13);
        b.expenses=Math.floor((b.expenses||0)*1.09+1500);
        b.morale=cl((b.morale||55)+r(1,5));
        b.systems=cl((b.systems||40)-r(0,2));
        Engine.log('👥 New hires increased capacity. Revenue rose, but payroll is higher.', 'good');
      });
    }else if(a==='expand'){
      this._runAction(b,'expand',()=>{
        const c=sc(10000);
        if(!this._pay(c))return false;
        b.revenue=Math.floor((b.revenue||0)*(1+r(18,32)/100));
        b.expenses=Math.floor((b.expenses||0)*1.16);
        b.value=Math.floor((b.value||0)*1.22);
        b.systems=cl((b.systems||40)+r(2,6));
        b.morale=cl((b.morale||55)-r(1,4));
        Engine.log(`🏗️ Expansion complete. Revenue now ${fmt(sc(b.revenue))}/yr.`, 'special');
      });
    }else if(a==='efficiency'){
      this._runAction(b,'efficiency',()=>{
        b.expenses=Math.floor((b.expenses||0)*(1-r(6,14)/100));
        b.systems=cl((b.systems||40)+r(4,9));
        b.quality=cl((b.quality||50)+r(0,3));
        b.morale=cl((b.morale||55)-r(0,4));
        Engine.log(`⚙️ Operations tightened. Expenses now ${fmt(sc(b.expenses))}/yr.`, 'good');
      });
    }else if(a==='franchise'){
      this._runAction(b,'franchise',()=>{
        const c=sc(50000);
        if(!this._pay(c))return false;
        b.revenue=Math.floor((b.revenue||0)*(1+r(40,80)/100));
        b.expenses=Math.floor((b.expenses||0)*1.32);
        b.value=Math.floor((b.value||0)*1.55);
        b.brand=cl((b.brand||0)+r(8,14));
        b.systems=cl((b.systems||40)+r(4,8));
        b.morale=cl((b.morale||55)-r(2,7));
        Engine.log(`🏪 Franchise launched. Revenue jumped to ${fmt(sc(b.revenue))}/yr.`, 'special');
      });
    }else if(a==='pivot'){
      this._runAction(b,'pivot',()=>{
        const nt=pick(this.TYPES.filter(t=>t.id!==b.id));
        const oldName=b.name;
        b.id=nt.id;
        b.revenue=nt.rev;
        b.expenses=nt.expenses;
        b.growthRate=nt.growthRate;
        b.icon=nt.icon;
        b.name=nt.name;
        b.desc=nt.desc;
        b.auditHeat=Math.max(0,(b.auditHeat||0)-6);
        b.quality=cl((b.quality||50)-r(2,7));
        b.systems=cl((b.systems||40)-r(3,8));
        b.brand=cl((b.brand||0)-r(2,6));
        Engine.log(`🔄 Pivoted from ${oldName} to ${nt.name}. New direction, new risk profile.`, 'neutral');
      });
    }else if(a==='ipo'){
      this._runAction(b,'ipo',()=>{
        if((b.value||0)<sc(1000000)){UI.toast(`Need ${fmt(sc(1000000))} valuation!`);return false;}
        const ipoGain=Math.floor((b.value||0)*r(150,300)/100);
        G.money=(G.money||0)+ipoGain;
        if(!G.achievements)G.achievements={};
        G.achievements.ipo=true;
        G.business=null;
        Engine.log(`📈 IPO SUCCESS! Raised ${fmt(ipoGain)}!`, 'special');
        G.happiness=cl((G.happiness||50)+25);
        Engine.checkAch();
        UI.update();
        this.render();
        return true;
      });
      return;
    }else if(a==='sell'){
      if(!b){UI.toast('No business to sell!');return;}
      const qualityPremium=1+((b.brand||0)+(b.systems||0)+(b.quality||0)-150)/500;
      const auditDiscount=this.auditRisk(b)>55?0.82:this.auditRisk(b)>30?0.93:1;
      const sv=Math.floor((b.value||0)*(r(90,130)/100)*Math.max(0.75,qualityPremium)*auditDiscount);
      if(typeof confirm==='function'&&!confirm(`Sell ${b.name}?\n\nEstimated sale price: ${fmt(sv)}\n\nThis is permanent.`))return;
      G.money=(G.money||0)+sv;
      G.business=null;
      Engine.log(`💰 Business sold for ${fmt(sv)}.`, 'money');
      G.happiness=cl((G.happiness||50)+12);
      UI.update();
      this.render();
      return;
    }else if(a==='insurance'){
      this._runAction(b,'insurance',()=>{
        if(b.insured){UI.toast('Business is already insured.');return false;}
        const c=sc(2000);
        if(!this._pay(c))return false;
        b.insured=true;
        Engine.log('🛡️ Business insurance purchased. Crisis downside is lower.', 'good');
      });
    }else if(a==='pr'){
      this._runAction(b,'pr',()=>{
        const c=sc(2500);
        if(!this._pay(c))return false;
        G.fame=cl((G.fame||0)+r(3,8));
        b.brand=cl((b.brand||0)+r(5,10));
        b.revenue=Math.floor((b.revenue||0)*1.05);
        b.auditHeat=Math.max(0,(b.auditHeat||0)-r(0,3));
        Engine.log('📰 PR campaign boosted public image, fame and revenue.', 'good');
      });
    }else if(a==='product'){
      this._runAction(b,'product',()=>{
        const c=sc(6500);
        if(!this._pay(c))return false;
        b.quality=cl((b.quality||50)+r(8,15));
        b.value=Math.floor((b.value||0)*1.10+sc(1200));
        b.revenue=Math.floor((b.revenue||0)*1.07);
        b.brand=cl((b.brand||0)+r(1,4));
        Engine.log('🧪 Product upgrade made the offer stronger and raised valuation.', 'good');
      });
    }else if(a==='training'){
      this._runAction(b,'training',()=>{
        const c=sc(3500);
        if(!this._pay(c))return false;
        b.morale=cl((b.morale||55)+r(8,16));
        b.systems=cl((b.systems||40)+r(6,12));
        b.quality=cl((b.quality||50)+r(2,6));
        b.expenses=Math.floor((b.expenses||0)*1.02);
        Engine.log('🎓 Staff training improved morale, systems and service quality.', 'good');
      });
    }else if(a==='digital'){
      this._runAction(b,'digital',()=>{
        const c=sc(4200);
        if(!this._pay(c))return false;
        b.revenue=Math.floor((b.revenue||0)*(1+r(10,22)/100));
        b.brand=cl((b.brand||0)+r(4,9));
        b.systems=cl((b.systems||40)+r(1,5));
        if(Math.random()<.22)b.auditHeat=cl((b.auditHeat||0)+r(1,4),0,100);
        Engine.log('🛒 Online sales push opened a bigger market for the business.', 'money');
      });
    }else if(a==='supplier'){
      this._runAction(b,'supplier',()=>{
        const c=sc(2800);
        if(!this._pay(c))return false;
        b.expenses=Math.floor((b.expenses||0)*(1-r(5,11)/100));
        b.quality=cl((b.quality||50)+r(1,4));
        b.systems=cl((b.systems||40)+r(1,3));
        Engine.log('🤝 A stronger supplier deal lowered costs and stabilized operations.', 'good');
      });
    }else if(a==='automation'){
      this._runAction(b,'automation',()=>{
        const c=sc(9000);
        if(!this._pay(c))return false;
        b.systems=cl((b.systems||40)+r(8,16));
        b.expenses=Math.floor((b.expenses||0)*(1-r(4,9)/100));
        b.revenue=Math.floor((b.revenue||0)*(1+r(4,9)/100));
        b.morale=cl((b.morale||55)-r(0,3));
        b.value=Math.floor((b.value||0)*1.08);
        Engine.log('🤖 Automation improved systems, margin and scale capacity.', 'good');
      });
    }else if(a==='retreat'){
      this._runAction(b,'retreat',()=>{
        const c=sc(3000);
        if(!this._pay(c))return false;
        b.morale=cl((b.morale||55)+r(10,18));
        b.brand=cl((b.brand||0)+r(1,4));
        b.systems=cl((b.systems||40)+r(1,4));
        G.happiness=cl((G.happiness||50)+r(2,5));
        G.stress=cl((G.stress||0)-r(4,8));
        Engine.log('🌴 The team retreat lifted morale and reduced founder stress.', 'good');
      });
    }else if(a==='capital'){
      this._runAction(b,'capital',()=>{
        if((b.value||0)<sc(25000)){UI.toast(`Need ${fmt(sc(25000))}+ valuation to raise capital.`);return false;}
        const raise=sc(Math.max(6000,Math.round((b.value||0)*(0.10+(Math.random()*0.12)))));
        G.money=(G.money||0)+raise;
        b.value=Math.floor((b.value||0)*1.06);
        b.expenses=Math.floor((b.expenses||0)*1.03);
        b.brand=cl((b.brand||0)+r(1,4));
        G.stress=cl((G.stress||0)+r(2,5));
        Engine.log(`💸 Raised ${fmt(raise)} in growth capital for the business.`, 'money');
      });
    }else if(a==='taxhack'){
      this._runAction(b,'taxhack',()=>{
        if(b.taxHackActive){
          const fee=sc(1800+Math.round((b.auditHeat||0)*35));
          if(!this._pay(fee))return false;
          b.taxHackActive=false;
          b.auditHeat=Math.max(0,(b.auditHeat||0)-r(14,24));
          b.systems=cl((b.systems||40)+r(2,6));
          Engine.log('🧾 Accountants cleaned the books and lowered audit risk.', 'good');
        }else{
          const savings=this._taxSavings(b);
          const smartBonus=(G.smarts||50)>=80?0.78:(G.smarts||50)>=65?0.88:(G.smarts||50)<=35?1.18:1;
          G.money=(G.money||0)+savings;
          b.lastTaxSavings=savings;
          b.taxHackActive=true;
          b.taxHackYears=(b.taxHackYears||0)+1;
          b.auditHeat=Math.min(100,(b.auditHeat||0)+Math.round(r(14,24)*smartBonus));
          G.stress=cl((G.stress||0)+r(4,8));
          G.karma=cl((G.karma||0)-r(4,9),-100,100);
          Engine.log(`🧾 Aggressive accounting created ${fmt(savings)} in extra cash. Audit risk climbed.`, 'money');
        }
      });
    }else if(a==='bribe'){
      this._runAction(b,'bribe',()=>{
        const cost=this.bribeCost(b);
        if(!this._pay(cost))return false;
        b.totalBribes=(b.totalBribes||0)+cost;
        b.bribeShield=Math.max(b.bribeShield||0,2);
        b.auditHeat=Math.max(0,(b.auditHeat||0)-r(10,20));
        b.systems=cl((b.systems||40)+r(3,7));
        Engine.log(`⚖️ Compliance lawyers reviewed the books for ${fmt(cost)}. Audit pressure eased.`, 'good');
      });
    }
    UI.update();
    this.render();
  },

  _auditCaughtChance(b){
    const G=window.G||{};
    const skill=((G.skills?.finance||0)*0.04)+((G.skills?.negotiation||0)*0.025);
    const smart=(G.smarts||50)>=85?0.18:(G.smarts||50)>=70?0.10:(G.smarts||50)<=35?-0.12:0;
    const shield=(b.bribeShield||0)>0?0.10:0;
    const systems=(b.systems||40)/500;
    const dirtyYears=Math.min(0.16,(b.taxHackYears||0)*0.025);
    return Math.max(0.08,Math.min(0.88,0.40+(this.auditRisk(b)/140)+dirtyYears-skill-shield-smart-systems));
  },

  _handleAudit(b){
    const G=window.G;
    if((b.bribeShield||0)>0&&Math.random()<0.48+((G.skills?.negotiation||0)*0.05)+((b.systems||40)/300)){
      b.bribeShield=Math.max(0,(b.bribeShield||0)-1);
      b.auditHeat=Math.max(0,(b.auditHeat||0)-r(8,14));
      Engine.log('⚖️ Your compliance preparation kept inspectors from digging deeper .', 'neutral');
      return;
    }
    if(Math.random()>=this._auditCaughtChance(b)){
      b.auditHeat=Math.max(0,(b.auditHeat||0)-r(4,9));
      Engine.log('🧾 Tax inspectors looked around, but your paperwork held together this time.', 'neutral');
      return;
    }
    const fine=Math.round(sc(Math.max(5000,Math.round((b.revenue||0)*0.18+(b.auditHeat||0)*220)))+Math.max(0,Math.round((b.value||0)*0.04)));
    const seizure=Math.round((b.value||0)*(0.10+Math.random()*0.15));
    this._chargeShortfall(fine,'tax investigation fine');
    b.value=Math.max(sc(500),Math.round((b.value||0)-seizure));
    b.revenue=Math.floor((b.revenue||0)*(0.84+Math.random()*0.08));
    b.taxHackActive=false;
    b.bribeShield=0;
    b.auditHeat=Math.max(10,Math.round((b.auditHeat||0)*0.55));
    b.brand=cl((b.brand||0)-r(5,12));
    b.morale=cl((b.morale||55)-r(8,16));
    G.karma=cl((G.karma||0)-r(8,15),-100,100);
    G.stress=cl((G.stress||0)+r(12,22));
    G.happiness=cl((G.happiness||50)-r(10,18));
    G.crimeHeat=cl((G.crimeHeat||0)+r(10,18),0,100);
    Engine.log(`🚨 Tax investigation hit ${b.name}. Fines and seized assets cost ${fmt(fine)}.`, 'bad');
    const prisonRisk=0.08+((b.taxHackYears||0)*0.035)+(G.difficulty==='extreme'?0.08:G.difficulty==='hard'?0.04:0);
    if(Math.random()<Math.min(0.45,prisonRisk)){
      G.inPrison=true;
      G.prisonYears=Math.max(G.prisonYears||0,r(1,4));
      Engine.log(`🔒 Prosecutors made an example of you. Business tax fraud led to ${G.prisonYears} year${G.prisonYears!==1?'s':''} in prison.`, 'crime');
    }
    if(fine>Math.max(G.money||0,sc(12000))&&Math.random()<0.28){
      G.business=null;
      Engine.log('📉 The business could not survive the tax case and collapsed under the damage.', 'bad');
    }
  },

  tick(){
    const G=window.G;
    if(!G||(G.age||0)<18)return;
    const b=G.business;
    if(!b)return;
    this.ensureState(b);
    b.yearsOpen++;

    const operatorBonus=((b.brand||0)*0.0015)+((b.quality||0)*0.0012)+((b.systems||0)*0.0012)+((b.morale||0)*0.0008);
    const difficultyDrag=G.difficulty==='extreme'?0.035:G.difficulty==='hard'?0.02:G.difficulty==='easy'?-0.01:0;
    const growPct=Math.max(-0.12,(b.growthRate||0)*(0.55+Math.random()*0.85)+operatorBonus-difficultyDrag);
    b.lastGrowthPct=Math.round(growPct*1000)/10;
    b.revenue=Math.floor((b.revenue||0)*(1+growPct));
    b.expenses=Math.floor((b.expenses||0)*(1+growPct*0.42+Math.max(0,(100-(b.systems||40))/2500)));
    b.value=Math.floor(Math.max(sc(500),(b.value||0)*(1+growPct*0.7))*this._valuationQualityFactor(b));

    const rawProfit=(b.revenue||0)-(b.expenses||0);
    const profit=sc(rawProfit);
    b.lastProfit=profit;

    if(profit>0){
      G.money=(G.money||0)+profit;
    }else if(profit<0){
      const burn=Math.round(Math.abs(profit)*0.35);
      this._chargeShortfall(burn,'business operating loss');
      G.stress=cl((G.stress||0)+r(2,5));
      b.morale=cl((b.morale||55)-r(2,6));
    }

    b.quality=cl((b.quality||50)+r(-2,3));
    b.morale=cl((b.morale||55)+r(-3,3));
    b.systems=cl((b.systems||40)+r(-1,2));
    b.brand=cl((b.brand||0)+Math.max(0,Math.round(profit/Math.max(1,sc(65000))))+r(0,2));

    if(b.taxHackActive){
      const hidden=this._taxSavings(b);
      G.money=(G.money||0)+hidden;
      b.lastTaxSavings=hidden;
      b.auditHeat=Math.min(100,(b.auditHeat||0)+r(7,12));
      G.karma=cl((G.karma||0)-r(2,5),-100,100);
      if(Math.random()<0.85)Engine.log(`🧾 Aggressive accounting squeezed out another ${fmt(hidden)} .`, 'money');
    }else{
      b.lastTaxSavings=Math.round((b.lastTaxSavings||0)*0.45);
      b.auditHeat=Math.max(0,(b.auditHeat||0)-r(5,10));
    }

    if(b.id==='creator_studio'||b.id==='film_studio'||b.id==='media_co'){
      G.fame=cl((G.fame||0)+r(1,4));
      if(Math.random()<0.18){
        G.stress=cl((G.stress||0)+r(3,8));
        Engine.log(`📸 Public attention around ${b.name} boosted fame but added stress.`, 'neutral');
      }
    }

    const auditChance=this.auditRisk(b)/100;
    if(Math.random()<auditChance)this._handleAudit(b);
    if(!G.business)return;

    this._rollYearEvent(b,profit,growPct);
    if(!G.business)return;

    this._pushHistory(b,profit);

    if((b.value||0)>=sc(1000000000)&&!G.achievements?.unicorn){
      if(!G.achievements)G.achievements={};
      G.achievements.unicorn=true;
      Engine.log('🦄 UNICORN! Your business reached $1 Billion valuation!', 'special');
      Engine.checkAch();
    }
    if(profit<-sc(50000)&&!b.insured){
      if(!G.achievements)G.achievements={};
      G.achievements.bankrupt=true;
      G.money=(G.money||0)+Math.max(0,Math.floor((b.value||0)*0.15));
      G.business=null;
      Engine.log('📉 Business went bankrupt. Sold remaining assets.', 'bad');
      G.happiness=cl((G.happiness||50)-18);
      Engine.checkAch();
      return;
    }
    if(G.business&&G.business.bribeShield>0)G.business.bribeShield=Math.max(0,G.business.bribeShield-1);
  },

  _rollYearEvent(b,profit,growPct){
    const G=window.G;
    const age=G.age||0;
    const events=[];
    const margin=this.margin(b);

    if(age-(b.lastCrisisAge||-999)>=3){
      events.push({id:'crisis',weight:.08,run:()=>{
        b.lastCrisisAge=age;
        if(!b.insured){
          b.revenue=Math.floor((b.revenue||0)*0.80);
          b.brand=cl((b.brand||0)-r(2,6));
          b.morale=cl((b.morale||55)-r(2,6));
          Engine.log('⚠️ Business crisis! Revenue dropped. Insurance would have helped.', 'bad');
        }else{
          b.morale=cl((b.morale||55)-r(1,3));
          Engine.log('⚠️ Business crisis hit, but insurance absorbed the worst damage.', 'neutral');
        }
      }});
    }

    if(age-(b.lastBoomAge||-999)>=2){
      events.push({id:'boom',weight:.09,run:()=>{
        b.lastBoomAge=age;
        b.revenue=Math.floor((b.revenue||0)*1.16);
        b.brand=cl((b.brand||0)+r(2,6));
        Engine.log(`📈 Excellent year for ${b.name}! Revenue surged.`, 'money');
      }});
    }

    if((b.staff||0)>4){
      events.push({id:'staff',weight:.05,run:()=>{
        b.morale=cl((b.morale||55)+r(-8,8));
        b.systems=cl((b.systems||40)+r(-2,4));
        Engine.log(`👥 Staff dynamics shifted at ${b.name}. Morale and systems changed.`, 'neutral');
      }});
    }

    if(margin>=30&&profit>0){
      events.push({id:'review',weight:.06,run:()=>{
        b.brand=cl((b.brand||0)+r(3,8));
        b.quality=cl((b.quality||50)+r(1,4));
        Engine.log(`⭐ Customers praised ${b.name}. Brand and quality improved.`, 'good');
      }});
    }

    if(growPct<0||margin<5){
      events.push({id:'competitor',weight:.07,run:()=>{
        b.revenue=Math.floor((b.revenue||0)*(0.94+Math.random()*0.04));
        b.brand=cl((b.brand||0)-r(1,4));
        Engine.log(`🥊 A competitor squeezed ${b.name}. Revenue pressure increased.`, 'bad');
      }});
    }

    const fresh=events.filter(e=>!this._recentEvent(b,e.id));
    const roll=Math.random();
    let threshold=0;
    for(const evt of fresh){
      threshold+=evt.weight;
      if(roll<threshold){
        this._rememberEvent(b,evt.id);
        evt.run();
        return;
      }
    }
  },

  _recentEvent(b,id){
    return (b.eventMemory||[]).slice(0,4).some(e=>e.id===id);
  },

  _rememberEvent(b,id){
    if(!Array.isArray(b.eventMemory))b.eventMemory=[];
    b.eventMemory.unshift({id,age:window.G?.age||0,year:b.yearsOpen||0});
    if(b.eventMemory.length>this.EVENT_MEMORY_LIMIT)b.eventMemory.length=this.EVENT_MEMORY_LIMIT;
  },

  _pushHistory(b,profit){
    if(!Array.isArray(b.history))b.history=[];
    const health=this.businessHealth(b).score;
    b.history.unshift({
      age:window.G?.age||0,
      year:b.yearsOpen||0,
      revenue:sc(b.revenue||0),
      expenses:sc(b.expenses||0),
      profit:profit||0,
      value:b.value||0,
      health,
    });
    if(b.history.length>this.HISTORY_LIMIT)b.history.length=this.HISTORY_LIMIT;
  },

  _valuationQualityFactor(b){
    const premium=((b.brand||0)+(b.quality||0)+(b.systems||0)-150)/2000;
    const auditPenalty=this.auditRisk(b)>55?-0.04:this.auditRisk(b)>30?-0.015:0;
    return Math.max(0.94,Math.min(1.08,1+premium+auditPenalty));
  },
};