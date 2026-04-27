/* js/business.js - LifeSim v13 Reforged business system */
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
    taxhack:{icon:'🧾',label:'Aggressive Accounting',cost:0,desc:'Extra cash, audit risk'},
    bribe:{icon:'⚖️',label:'Compliance Lawyer',cost:0,desc:'Reduce audit heat'},
  },

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
        ${this._metricBox('Hidden Tax Gain',fmt(b.lastTaxSavings||0),'',`${b.taxHackYears||0} dirty year${(b.taxHackYears||0)!==1?'s':''} · legal fees ${fmt(b.totalBribes||0)}`)}
      </div>`;

      h+=this._renderOperations(b,taxLabel,taxSub,lawyerCost);
      h+=this._renderRiskPanel(b,auditRisk,profit,margin);
    }else{
      if((G.age||0)<18){el.innerHTML='<div class="empty"><span class="ei">🏢</span><p>Must be 18 to start a business.</p></div>';return;}
      h+=`<div class="info-box"><p>🚀 Build your own business empire. Better businesses compound fast, but growth, debt, taxes and bad management can destroy weak operators.</p></div>
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
      <div class="act-grid">
        ${this._actionCard('market',`+Revenue (${fmt(sc(2000))})`)}
        ${this._actionCard('hire','+Revenue +Staff')}
        ${this._actionCard('expand',`Scale up (${fmt(sc(10000))})`)}
        ${this._actionCard('efficiency','-Expenses +systems')}
      </div>
      <div class="act-grid" style="margin-top:8px">
        ${this._actionCard('franchise',`Major scale (${fmt(sc(50000))})`)}
        ${this._actionCard('pivot','Change model')}
        ${this._actionCard('ipo',`Need ${fmt(sc(1000000))}+ value`)}
        ${this._actionCard('sell','Cash out',true)}
      </div>
      <div class="act-grid" style="margin-top:8px">
        ${this._actionCard('insurance',b.insured?'Already insured':`Protect (${fmt(sc(2000))})`,false,b.insured?'special':'')}
        ${this._actionCard('pr','+Fame +Brand')}
        <div class="card ${b.taxHackActive?'danger':''}" onclick="Business.act('taxhack')"><span class="ci">🧾</span><span class="cn">${taxLabel}</span><span class="cd">${taxSub}</span></div>
        <div class="card" onclick="Business.act('bribe')"><span class="ci">⚖️</span><span class="cn">Compliance Lawyer</span><span class="cd">${fmt(lawyerCost)} · lowers audit risk</span></div>
      </div>`;
  },

  _renderRiskPanel(b,auditRisk,profit,margin){
    const status=profit<0?'Burning cash':margin>=35?'Highly profitable':margin>=15?'Healthy margin':'Thin margin';
    const risk=auditRisk>=55?'High audit pressure':auditRisk>=30?'Moderate audit pressure':'Low audit pressure';
    return `<div class="info-box" style="border-color:${auditRisk>=55?'rgba(248,113,113,.35)':auditRisk>=30?'rgba(251,191,36,.35)':'rgba(74,222,128,.35)'}">
      <p>📊 Status: ${status}. ${risk}. Brand, quality, staff and systems now affect growth, crisis resistance and valuation.</p>
    </div>`;
  },

  _actionCard(id,sub,danger=false,extraClass=''){
    const a=this.ACTIONS[id];
    return `<div class="card ${danger?'danger ':''}${extraClass}" onclick="Business.act('${id}')"><span class="ci">${a.icon}</span><span class="cn">${a.label}</span><span class="cd">${sub||a.desc}</span></div>`;
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
      taxHackActive:false,auditHeat:0,bribeShield:0,lastTaxSavings:0,taxHackYears:0,totalBribes:0
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
  },

  margin(b){
    return Math.round((((b.revenue||0)-(b.expenses||0))/Math.max(1,b.revenue||1))*100);
  },

  valuationMultiple(b){
    const margin=this.margin(b);
    let mult=1.6+(b.growthRate||0)*8+((b.brand||0)/100)*1.2+((b.systems||0)/100)*0.8;
    if(margin>35)mult+=0.8;
    if(margin<0)mult-=0.9;
    return Math.max(0.6,Math.round(mult*10)/10);
  },

  businessHealth(b){
    const profit=(b.revenue||0)-(b.expenses||0);
    const profitScore=profit>0?25:Math.max(0,15+profit/Math.max(1,b.expenses||1)*30);
    const score=cl(profitScore+(b.brand||0)*0.22+(b.quality||0)*0.20+(b.systems||0)*0.20+(b.morale||0)*0.15-(this.auditRisk(b)*0.18));
    if(score>=75)return{score,color:'var(--green)',label:'Strong operator'};
    if(score>=55)return{score,color:'var(--teal)',label:'Healthy but improvable'};
    if(score>=35)return{score,color:'var(--yellow)',label:'Fragile business'};
    return{score,color:'var(--red)',label:'Danger zone'};
  },

  auditRisk(b){
    const G=window.G;
    this.ensureState(b);
    const smartAdj=(G.smarts||50)>=85?-12:(G.smarts||50)>=70?-7:(G.smarts||50)<=35?10:0;
    const skillAdj=(G.skills?.finance||0)*3+(G.skills?.negotiation||0)*2;
    const systemsAdj=Math.round((b.systems||40)/10);
    const heat=(b.auditHeat||0)+(b.taxHackActive?18:0);
    const countryAdj=Math.round(((G.country?.crimeRate||0.35)-0.35)*26);
    const diffAdj=G.difficulty==='easy'?-4:G.difficulty==='hard'?5:G.difficulty==='extreme'?9:0;
    return Math.max(3,Math.min(95,Math.round(heat+countryAdj+diffAdj+smartAdj-skillAdj-systemsAdj-(b.bribeShield||0)*10)));
  },

  bribeCost(b){
    const rawBase=(b.revenue||0)>500000?12000:(b.revenue||0)>180000?6500:(b.revenue||0)>70000?3500:1800;
    return sc(rawBase+Math.round((b.auditHeat||0)*55)+Math.round((b.value||0)*0.003));
  },

  _taxSavings(b){
    return sc(Math.max(1800,Math.round(Math.max(0,(b.revenue||0)-(b.expenses||0))*0.10+(b.revenue||0)*0.025)));
  },

  _chargeShortfall(amount){
    const G=window.G;
    const due=Math.max(0,Math.round(amount));
    if(!due)return;
    if((G.money||0)>=due){G.money-=due;return;}
    const unpaid=due-Math.max(0,G.money||0);
    G.money=0;
    G.debtCollections=(G.debtCollections||0)+Math.round(unpaid*1.18);
    if(typeof Assets!=='undefined'&&Assets.changeCredit)Assets.changeCredit(-26);
  },

  _pay(cost){
    const G=window.G;
    if((G.money||0)<cost){UI.toast('Need '+fmt(cost)+'!');return false;}
    G.money-=cost;
    return true;
  },

  act(a){
    const G=window.G;
    const b=G.business;
    if(!b&&a!=='sell')return;
    if(b)this.ensureState(b);

    if(a==='market'){
      const c=sc(2000);
      if(!this._pay(c))return;
      b.revenue=Math.floor((b.revenue||0)*(1+r(6,15)/100));
      b.brand=cl((b.brand||0)+r(3,7));
      Engine.log(`📣 Marketing boosted revenue to ${fmt(sc(b.revenue))}/yr and grew the brand.`, 'money');
    }else if(a==='hire'){
      const c=sc(5000);
      if(!this._pay(c))return;
      b.staff=(b.staff||0)+r(1,3);
      b.revenue=Math.floor((b.revenue||0)*1.13);
      b.expenses=Math.floor((b.expenses||0)*1.09+1500);
      b.morale=cl((b.morale||55)+r(1,5));
      Engine.log('👥 New hires increased capacity. Revenue rose, but payroll is higher.', 'good');
    }else if(a==='expand'){
      const c=sc(10000);
      if(!this._pay(c))return;
      b.revenue=Math.floor((b.revenue||0)*(1+r(18,32)/100));
      b.expenses=Math.floor((b.expenses||0)*1.16);
      b.value=Math.floor((b.value||0)*1.22);
      b.systems=cl((b.systems||40)+r(2,6));
      b.morale=cl((b.morale||55)-r(1,4));
      Engine.log(`🏗️ Expansion complete. Revenue now ${fmt(sc(b.revenue))}/yr.`, 'special');
    }else if(a==='efficiency'){
      b.expenses=Math.floor((b.expenses||0)*(1-r(6,14)/100));
      b.systems=cl((b.systems||40)+r(4,9));
      b.morale=cl((b.morale||55)-r(0,4));
      Engine.log(`⚙️ Operations tightened. Expenses now ${fmt(sc(b.expenses))}/yr.`, 'good');
    }else if(a==='franchise'){
      const c=sc(50000);
      if(!this._pay(c))return;
      b.revenue=Math.floor((b.revenue||0)*(1+r(40,80)/100));
      b.expenses=Math.floor((b.expenses||0)*1.32);
      b.value=Math.floor((b.value||0)*1.55);
      b.brand=cl((b.brand||0)+r(8,14));
      b.systems=cl((b.systems||40)+r(4,8));
      Engine.log(`🏪 Franchise launched. Revenue jumped to ${fmt(sc(b.revenue))}/yr.`, 'special');
    }else if(a==='pivot'){
      const nt=pick(this.TYPES.filter(t=>t.id!==b.id));
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
      Engine.log(`🔄 Pivoted to ${nt.name}. New direction, new risk profile.`, 'neutral');
    }else if(a==='ipo'){
      if((b.value||0)<sc(1000000)){UI.toast(`Need ${fmt(sc(1000000))} valuation!`);return;}
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
      return;
    }else if(a==='sell'){
      if(!b){UI.toast('No business to sell!');return;}
      const qualityPremium=1+((b.brand||0)+(b.systems||0)+(b.quality||0)-150)/500;
      const sv=Math.floor((b.value||0)*(r(90,130)/100)*Math.max(0.75,qualityPremium));
      G.money=(G.money||0)+sv;
      G.business=null;
      Engine.log(`💰 Business sold for ${fmt(sv)}.`, 'money');
      G.happiness=cl((G.happiness||50)+12);
      UI.update();
      this.render();
      return;
    }else if(a==='insurance'){
      if(b.insured){UI.toast('Business is already insured.');return;}
      const c=sc(2000);
      if(!this._pay(c))return;
      b.insured=true;
      Engine.log('🛡️ Business insurance purchased. Crisis downside is lower.', 'good');
    }else if(a==='pr'){
      const c=sc(2500);
      if((G.money||0)>=c)G.money-=c;
      G.fame=cl((G.fame||0)+r(3,8));
      b.brand=cl((b.brand||0)+r(5,10));
      b.revenue=Math.floor((b.revenue||0)*1.05);
      Engine.log('📰 PR campaign boosted public image, fame and revenue.', 'good');
    }else if(a==='taxhack'){
      if(b.taxHackActive){
        const fee=sc(1800+Math.round((b.auditHeat||0)*35));
        if(!this._pay(fee))return;
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
    }else if(a==='bribe'){
      const cost=this.bribeCost(b);
      if(!this._pay(cost))return;
      b.totalBribes=(b.totalBribes||0)+cost;
      b.bribeShield=Math.max(b.bribeShield||0,2);
      b.auditHeat=Math.max(0,(b.auditHeat||0)-r(10,20));
      b.systems=cl((b.systems||40)+r(3,7));
      Engine.log(`⚖️ Compliance lawyers reviewed the books for ${fmt(cost)}. Audit pressure eased.`, 'good');
    }
    UI.update();
    this.render();
  },

  _auditCaughtChance(b){
    const G=window.G;
    const skill=((G.skills?.finance||0)*0.04)+((G.skills?.negotiation||0)*0.025);
    const smart=(G.smarts||50)>=85?0.18:(G.smarts||50)>=70?0.10:(G.smarts||50)<=35?-0.12:0;
    const shield=(b.bribeShield||0)>0?0.10:0;
    const systems=(b.systems||40)/500;
    return Math.max(0.08,Math.min(0.88,0.40+(this.auditRisk(b)/140)-skill-shield-smart-systems));
  },

  _handleAudit(b){
    const G=window.G;
    if((b.bribeShield||0)>0&&Math.random()<0.48+((G.skills?.negotiation||0)*0.05)+((b.systems||40)/300)){
      b.bribeShield=Math.max(0,(b.bribeShield||0)-1);
      b.auditHeat=Math.max(0,(b.auditHeat||0)-r(8,14));
      Engine.log('⚖️ Your compliance preparation kept inspectors from digging deeper this year.', 'neutral');
      return;
    }
    if(Math.random()>=this._auditCaughtChance(b)){
      b.auditHeat=Math.max(0,(b.auditHeat||0)-r(4,9));
      Engine.log('🧾 Tax inspectors looked around, but your paperwork held together this time.', 'neutral');
      return;
    }
    const fine=Math.round(sc(Math.max(5000,Math.round((b.revenue||0)*0.18+(b.auditHeat||0)*220)))+Math.max(0,Math.round((b.value||0)*0.04)));
    const seizure=Math.round((b.value||0)*(0.10+Math.random()*0.15));
    this._chargeShortfall(fine);
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
    const b=G.business;
    if(!b)return;
    this.ensureState(b);
    b.yearsOpen++;

    const operatorBonus=((b.brand||0)*0.0015)+((b.quality||0)*0.0012)+((b.systems||0)*0.0012)+((b.morale||0)*0.0008);
    const difficultyDrag=G.difficulty==='extreme'?0.035:G.difficulty==='hard'?0.02:G.difficulty==='easy'?-0.01:0;
    const growPct=Math.max(-0.12,(b.growthRate||0)*(0.55+Math.random()*0.85)+operatorBonus-difficultyDrag);
    b.revenue=Math.floor((b.revenue||0)*(1+growPct));
    b.expenses=Math.floor((b.expenses||0)*(1+growPct*0.42+Math.max(0,(100-(b.systems||40))/2500)));
    b.value=Math.floor(Math.max(sc(500),(b.value||0)*(1+growPct*0.7))*this._valuationQualityFactor(b));
    const profit=sc((b.revenue||0)-(b.expenses||0));
    if(profit>0)G.money=(G.money||0)+profit;
    else if(profit<0){
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
      if(Math.random()<0.85)Engine.log(`🧾 Aggressive accounting squeezed out another ${fmt(hidden)} this year.`, 'money');
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

    const roll=Math.random();
    if(roll<0.08){
      if(!b.insured){
        b.revenue=Math.floor((b.revenue||0)*0.80);
        b.brand=cl((b.brand||0)-r(2,6));
        Engine.log('⚠️ Business crisis! Revenue dropped. Insurance would have helped.', 'bad');
      }else{
        b.morale=cl((b.morale||55)-r(1,3));
        Engine.log('⚠️ Business crisis hit, but insurance absorbed the worst damage.', 'neutral');
      }
    }else if(roll>0.91){
      b.revenue=Math.floor((b.revenue||0)*1.16);
      b.brand=cl((b.brand||0)+r(2,6));
      Engine.log(`📈 Excellent year for ${b.name}! Revenue surged.`, 'money');
    }

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

  _valuationQualityFactor(b){
    const premium=((b.brand||0)+(b.quality||0)+(b.systems||0)-150)/2000;
    return Math.max(0.96,Math.min(1.08,1+premium));
  },
};