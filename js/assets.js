/* js/assets.js - LifeSim v13 Reforged asset, debt, housing and investment system */
const Assets={
  housingPlans:{
    shared:{label:'Shared Room',icon:'🛏️',base:7600,happiness:-2,stress:2,desc:'Lowest rent, low privacy'},
    basic:{label:'Basic Apartment',icon:'🏢',base:11000,happiness:0,stress:0,desc:'Small, simple and affordable'},
    standard:{label:'Standard Home Rent',icon:'🏠',base:14500,happiness:2,stress:-1,desc:'Balanced adult lifestyle'},
    comfortable:{label:'Comfortable Home',icon:'🏡',base:23000,happiness:5,stress:-2,desc:'More space, calmer life'},
    luxury:{label:'Luxury Rental',icon:'🌆',base:52000,happiness:9,stress:-3,desc:'Premium lifestyle flex'},
  },

  loanPresets:{
    education:{label:'Education Loan',amount:25000,rate:0.055,years:10,minCredit:540,desc:'Study costs with manageable interest'},
    property:{label:'Personal Loan',amount:150000,rate:0.075,years:12,minCredit:620,desc:'Large life purchase or deposit boost'},
    emergency:{label:'Emergency Loan',amount:5000,rate:0.14,years:4,minCredit:460,desc:'Fast cash, expensive if abused'},
  },

  investmentPlans:{
    stocks:{icon:'📊',label:'Stocks',amount:5000,risk:'Medium',desc:'Market swings, solid upside'},
    bonds:{icon:'🏛️',label:'Bonds',amount:2000,risk:'Low',desc:'Small reliable returns'},
    crypto:{icon:'🪙',label:'Crypto',amount:3000,risk:'Extreme',desc:'Can moon or collapse'},
    gold:{icon:'🥇',label:'Gold',amount:2500,risk:'Low',desc:'Defensive store of value'},
    etf:{icon:'📉',label:'Index Fund',amount:3000,risk:'Medium',desc:'Long-term diversified growth'},
    startup:{icon:'🚀',label:'Startup Bet',amount:10000,risk:'Extreme',desc:'Most fail, rare huge exit'},
    forex:{icon:'💱',label:'Forex',amount:2000,risk:'High',desc:'Fast currency speculation'},
    art:{icon:'🖼️',label:'Fine Art',amount:8000,risk:'Medium',desc:'Alternative asset, slow market'},
  },

  insuranceCosts:{health:800,car:600,life:500},

  ACTION_LIMITS:{
    housing:2,
    loan:2,
    extraLoan:3,
    creditRepair:1,
    refinance:1,
    insurance:3,
    propertyMaintain:4,
    propertyRenovate:1,
    propertyManager:4,
    buyProperty:2,
    sellProperty:2,
    vehicleService:4,
    buyVehicle:2,
    sellVehicle:2,
    invest:3,
    donate:4,
  },

  HISTORY_LIMIT:14,
  INVESTMENT_HISTORY_LIMIT:12,
  EXPENSE_MEMORY_LIMIT:8,

  render(){
    const G=window.G;
    if(!G)return;
    const el=document.getElementById('tab-assets');
    if(!el)return;
    this.ensureState();
    if((G.age||0)<18){el.innerHTML=this._renderMinor(G);return;}

    const props=G.assets.properties||[];
    const vehs=G.assets.vehicles||[];
    const pv=props.reduce((a,p)=>a+(p.value||0),0);
    const vv=vehs.reduce((a,v)=>a+(v.value||0),0);
    const bv=G.business?G.business.value||0:0;
    const debt=this._totalDebt(G);
    const nw=netWorth(G);
    const score=G.creditScore||650;
    const primary=this._primaryHome(G);
    const hasHome=!!primary;
    const rentalCount=props.filter(p=>p.rent>0).length;
    const loanDue=this._loanDue(G);
    const rentalIncome=props.reduce((a,p)=>a+(p.rent>0?this._expectedRent(p):0),0);
    const estimatedUpkeep=props.reduce((a,p)=>a+this._propertyUpkeep(p),0)+vehs.reduce((a,v)=>a+this._vehicleUpkeep(v),0);
    const yearlyOverheads=(G.lastLivingCosts||0)+(G.food?.lastCost||0)+(G.lastAssetUpkeep||0)+loanDue+(G.alimony?.amount||0);
    const runway=yearlyOverheads>0?Math.floor((G.money||0)/Math.max(1,yearlyOverheads)*12):99;
    const debtRatio=nw>0?Math.round((debt/Math.max(1,nw+debt))*100):(debt>0?100:0);
    const assetCashflow=rentalIncome-estimatedUpkeep-loanDue;
    const housingLabel=hasHome?`${this._esc(primary.name)} · ${this._conditionLabel(primary.condition)}`:this._esc((this.housingPlans[G.housingPlan]||this.housingPlans.standard).label);
    const scoreMeta=this._creditMeta(score);
    const risk=this._financeRisk(G,yearlyOverheads,debtRatio,runway);

    let h=`
      <div class="nw-box">
        <div class="nw-lbl">Total Net Worth</div>
        <div class="nw-amt">${fmtFull(nw)}</div>
        <div class="nw-sub">Cash ${fmt(G.money)} · Property ${fmt(pv)} · Vehicles ${fmt(vv)}${bv>0?` · Business ${fmt(bv)}`:''}${debt>0?` · Debt ${fmt(debt)}`:''}</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        ${this._metricBox('Credit Score',score,scoreMeta.color,`${scoreMeta.label} · ${scoreMeta.hint}`)}
        ${this._metricBox('Monthly Runway',runway>=99?'99+ mo':`${runway} mo`,risk.color,`${risk.label} · yearly overhead ${fmt(yearlyOverheads)}`)}
        ${this._metricBox('Housing',hasHome?'Owned':'Renting',hasHome?'var(--green)':'var(--yellow)',housingLabel)}
        ${this._metricBox('Portfolio',props.length+vehs.length,'',`${props.length} properties · ${vehs.length} vehicles · ${rentalCount} rentals · debt ${debtRatio}%`)}
        ${this._metricBox('Rental Income',fmt(rentalIncome),rentalIncome>0?'var(--green)':'var(--muted)',rentalCount?`${rentalCount} rental${rentalCount!==1?'s':''} before costs`:'No rental income yet')}
        ${this._metricBox('Asset Cashflow',fmt(assetCashflow),assetCashflow>=0?'var(--green)':'var(--orange)',`Rent ${fmt(rentalIncome)} - upkeep ${fmt(estimatedUpkeep)} - debt ${fmt(loanDue)}`)}
      </div>`;

    h+=`<div class="info-box"><p>🏦 Finance view: assets should either improve your lifestyle or beat their carrying costs. Watch rental income, upkeep, loan payments and runway together before buying more.</p></div>`;

    h+=this._renderDebtSection(G);
    h+=this._renderInsuranceSection(G,vehs);
    h+=this._renderOwnedProperties(G,props);
    h+=this._renderOwnedVehicles(vehs);
    if(!hasHome)h+=this._renderHousingChoices(G);
    h+=this._renderPropertyMarket(G);
    h+=this._renderVehicleMarket(G);
    h+=this._renderInvestments(G);
    h+=this._renderCharity();
    h+=this._renderHistory(G);

    el.innerHTML=h;
  },

  _renderDebtSection(G){
    const loanLeft=this._usesLeft('loan');
    let h=`<div class="sec">Credit & Debt</div>`;
    h+=`<div class="info-box"><p>🧾 Finance actions now have yearly limits: ${loanLeft} loan action${loanLeft!==1?'s':''} left this year. Age up to refresh.</p></div><div class="act-grid">`;
    Object.entries(this.loanPresets).forEach(([id,p])=>{
      const amount=sc(p.amount);
      const locked=(G.creditScore||650)<p.minCredit||!this._loanRoom(G,amount);
      h+=`<div class="card ${locked?'locked':''}" onclick="${locked?'':`Assets.takeLoan('${id}')`}"><span class="ci">${id==='education'?'🎓':id==='property'?'🏦':'💳'}</span><span class="cn">${p.label}</span><span class="cd">+${fmt(amount)} · ${Math.round(p.rate*100)}% APR · ${p.minCredit}+ score</span></div>`;
    });
    if((G.debtCollections||0)>0){
      h+=`<div class="card danger" onclick="Assets.payCollections()"><span class="ci">⚠️</span><span class="cn">Pay Collections</span><span class="cd">Outstanding ${fmt(G.debtCollections)}</span></div>`;
    }
    const repairCost=this._creditRepairCost(G);
    h+=`<div class="card ${((G.money||0)<repairCost||(G.creditScore||650)>=780)?'locked':''}" onclick="${((G.money||0)<repairCost||(G.creditScore||650)>=780)?'':`Assets.creditRepair()`}"><span class="ci">🧾</span><span class="cn">Credit Repair</span><span class="cd">${fmt(repairCost)} - Improve score and reduce stress</span></div>`;
    h+='</div>';

    if((G.loans||[]).length){
      h+=`<div class="sec">Active Loans</div>`;
      (G.loans||[]).forEach((loan,i)=>{
        const remaining=loan.remaining||0;
        const due=Math.min(loan.payment||remaining,remaining);
        h+=`<div class="row-card" onclick="Assets.payLoan(${i})">
          <span class="ri">💳</span>
          <div class="rd"><div class="rt">${this._esc(loan.label)}</div><div class="rs">Remaining ${fmt(remaining)} · Next payment ${fmt(due)} · ${loan.yearsLeft||0} yr left · ${Math.round((loan.rate||0)*100)}% APR</div></div>
          <div class="rv">Pay</div>
        </div>`;
      });
    }
    if((G.loans||[]).length){
      h+=`<div class="act-grid" style="margin-bottom:12px">
        <div class="card" onclick="Assets.payLoanExtra(0)"><span class="ci">📉</span><span class="cn">Extra Principal</span><span class="cd">Make an extra payment on your first loan</span></div>
        <div class="card ${(G.creditScore||650)>=700?'':'locked'}" onclick="${(G.creditScore||650)>=700?`Assets.refinanceLoan(0)`:''}"><span class="ci">🏦</span><span class="cn">Refinance Loan</span><span class="cd">${(G.creditScore||650)>=700?'Try to lower the first loan APR':'Need 700+ credit'}</span></div>
      </div>`;
    }
    if(G.alimony?.amount>0){
      h+=`<div class="info-box" style="border-color:rgba(251,146,60,.35)"><p>💔 Alimony: ${fmt(G.alimony.amount)}/yr to ${this._esc(G.alimony.recipient||'your ex')} for ${G.alimony.yearsLeft} more year${G.alimony.yearsLeft!==1?'s':''}.</p></div>`;
    }
    if((G.debtCollections||0)>0){
      h+=`<div class="info-box" style="border-color:rgba(248,113,113,.35)"><p>⚠️ Collections are active. Unpaid debt raises stress, grows over time and damages credit.</p></div>`;
    }
    return h;
  },

  _renderInsuranceSection(G,vehs){
    let h='<div class="sec">Insurance</div>';
    const items=[
      ['health','🏥','Health Insurance','Covers most medical bills',true],
      ['car','🚗','Car Insurance','Covers vehicle repair claims',vehs.length>0],
      ['life','❤️','Life Insurance','Protects legacy and family shocks',(G.age||0)>=25],
    ];
    let open=0;
    items.forEach(([id,icon,label,desc,visible])=>{
      if(!visible||G.insurance?.[id])return;
      open++;
      const cost=sc(this.insuranceCosts[id]||500);
      h+=`<div class="row-card" onclick="Assets.buyInsurance('${id}')"><span class="ri">${icon}</span><div class="rd"><div class="rt">${label}</div><div class="rs">${desc} · yearly premium ${fmt(cost)}</div></div><div class="rv">${fmt(cost)}</div></div>`;
    });
    if(!open)h+=`<div class="info-box" style="border-color:rgba(74,222,128,.35)"><p>🛡️ Your major insurance cover is set up. Medical, vehicle and family shocks are less brutal now.</p></div>`;
    return h;
  },

  _renderOwnedProperties(G,props){
    if(!props.length)return '';
    let h='<div class="sec">Owned Real Estate</div>';
    props.forEach((p,i)=>{
      const upkeep=this._propertyUpkeep(p);
      const rentalIncome=p.rent>0?this._expectedRent(p):0;
      const badge=p.primary?' · Primary home':p.rent>0?` · Expected rent ${fmt(rentalIncome)}/yr`:'';
      h+=`<div class="row-card">
        <span class="ri">${p.icon||'🏠'}</span>
        <div class="rd"><div class="rt">${this._esc(p.name)}</div><div class="rs">Value ${fmt(p.value)} · ${this._conditionLabel(p.condition)} condition${badge} · Upkeep ${fmt(upkeep)}/yr</div></div>
      </div>
      <div class="act-grid" style="margin-top:6px;margin-bottom:10px">
        <div class="card" onclick="Assets.manageProp(${i},'maintain')"><span class="ci">🔧</span><span class="cn">Maintain</span><span class="cd">${fmt(this._maintainPropCost(p))} · restore condition</span></div>
        <div class="card" onclick="Assets.manageProp(${i},'renovate')"><span class="ci">🛠️</span><span class="cn">Renovate</span><span class="cd">${fmt(this._renovatePropCost(p))} · value + rent boost</span></div>
        ${p.rent>0?`<div class="card ${p.managed?'special':''}" onclick="Assets.manageProp(${i},'manager')"><span class="ci">🤝</span><span class="cn">${p.managed?'Managed Rental':'Hire Manager'}</span><span class="cd">${p.managed?'Lower vacancy, fee included':'Reduce vacancy risk'}</span></div>`:`<div class="card ${p.primary?'special':''}" onclick="Assets.setPrimaryHome(${i})"><span class="ci">🏡</span><span class="cn">${p.primary?'Primary Home':'Move In'}</span><span class="cd">${p.primary?'Current residence':'Make this your home'}</span></div>`}
        <div class="card danger" onclick="Assets.sellProp(${i})"><span class="ci">💰</span><span class="cn">Sell</span><span class="cd">Cash out property</span></div>
      </div>`;
    });
    return h;
  },

  _renderOwnedVehicles(vehs){
    if(!vehs.length)return '';
    let h='<div class="sec">Vehicles</div>';
    vehs.forEach((v,i)=>{
      h+=`<div class="row-card">
        <span class="ri">${v.icon||'🚗'}</span>
        <div class="rd"><div class="rt">${this._esc(v.name)}</div><div class="rs">Value ${fmt(v.value)} · ${this._conditionLabel(v.condition)} condition · Upkeep ${fmt(this._vehicleUpkeep(v))}/yr</div></div>
      </div>
      <div class="act-grid" style="margin-top:6px;margin-bottom:10px">
        <div class="card" onclick="Assets.serviceVeh(${i})"><span class="ci">🔧</span><span class="cn">Service</span><span class="cd">${fmt(this._serviceVehCost(v))} · restore condition</span></div>
        <div class="card danger" onclick="Assets.sellVeh(${i})"><span class="ci">💸</span><span class="cn">Sell Vehicle</span><span class="cd">Turn it into cash</span></div>
      </div>`;
    });
    return h;
  },

  _renderHousingChoices(G){
    return `<div class="sec">Rent & Living Situation</div>
      <div class="info-box"><p>🏠 Rent is a yearly lifestyle cost, not an asset. Better housing improves happiness and lowers stress, but burns cash.</p></div>
      <div class="act-grid">
        ${Object.entries(this.housingPlans).map(([id,p])=>`<div class="card ${G.housingPlan===id?'special':''}" onclick="Assets.setHousingPlan('${id}')"><span class="ci">${p.icon}</span><span class="cn">${p.label}</span><span class="cd">${fmt(annualCost(p.base))}/yr · ${p.desc}</span></div>`).join('')}
      </div>`;
  },

  _renderPropertyMarket(G){
    let h='<div class="sec">Real Estate Market</div>';
    (PROPERTIES||[]).filter(p=>p.id!=='room').forEach(p=>{
      const price=sc(p.price);
      const down=Math.round(price*0.20);
      const canCash=(G.money||0)>=price;
      const canFinance=(G.creditScore||650)>=620&&(G.money||0)>=down&&this._loanRoom(G,price-down);
      const income=p.rent>0?` · Est. rent ${fmt(sc(p.rent))}/yr`:'';
      const tag=canCash?fmt(price):canFinance?`${fmt(down)} down`:'Need cash/credit';
      h+=`<div class="row-card ${(canCash||canFinance)?'':'locked'}" onclick="${(canCash||canFinance)?`Assets.buyProp('${p.id}')`:''}">
        <span class="ri">${p.icon}</span>
        <div class="rd"><div class="rt">${this._esc(p.name)}</div><div class="rs">${this._esc(p.desc)}${income}${!canCash?` · finance from ${fmt(down)}`:''}</div></div>
        <div class="rv">${tag}</div>
      </div>`;
    });
    return h;
  },

  _renderVehicleMarket(G){
    let h='<div class="sec">Vehicle Market</div>';
    (VEHICLES||[]).forEach(v=>{
      const price=sc(v.price);
      const down=Math.round(price*0.15);
      const canCash=(G.money||0)>=price;
      const canFinance=(G.creditScore||650)>=600&&(G.money||0)>=down&&this._loanRoom(G,price-down);
      h+=`<div class="row-card ${(canCash||canFinance)?'':'locked'}" onclick="${(canCash||canFinance)?`Assets.buyVeh('${v.id}')`:''}">
        <span class="ri">${v.icon}</span>
        <div class="rd"><div class="rt">${this._esc(v.name)}</div><div class="rs">${this._esc(v.desc)}${!canCash?` · finance from ${fmt(down)}`:''}</div></div>
        <div class="rv">${canCash?fmt(price):canFinance?`${fmt(down)} down`:'Locked'}</div>
      </div>`;
    });
    return h;
  },

  _renderInvestments(G){
    const left=this._usesLeft('invest');
    let h=`<div class="sec">Capital Moves</div>
      <div class="info-box"><p>📈 Investment actions are limited to ${left} more move${left!==1?'s':''} this year, so each click matters.</p></div>
      <div class="act-grid">`;
    Object.entries(this.investmentPlans).forEach(([id,p])=>{
      const amt=sc(p.amount);
      const locked=(G.money||0)<amt||left<=0;
      h+=`<div class="card ${locked?'locked':''}" onclick="${locked?'':`Assets.invest('${id}')`}"><span class="ci">${p.icon}</span><span class="cn">${p.label}</span><span class="cd">${fmt(amt)} · ${p.risk} risk · ${p.desc}</span></div>`;
    });
    return h+'</div>';
  },

  _renderCharity(){
    const left=this._usesLeft('donate');
    const lock=left<=0?'locked':'';
    return `<div class="sec">Charity</div>
      <div class="act-grid">
        <div class="card ${lock}" onclick="${left<=0?'':`Assets.donate(1000)`}"><span class="ci">💝</span><span class="cn">Donate ${fmt(sc(1000))}</span><span class="cd">+Happiness +Karma · ${left} left this year</span></div>
        <div class="card ${lock}" onclick="${left<=0?'':`Assets.donate(10000)`}"><span class="ci">❤️</span><span class="cn">Donate ${fmt(sc(10000))}</span><span class="cd">Meaningful gift · ${left} left</span></div>
        <div class="card ${lock}" onclick="${left<=0?'':`Assets.donate(100000)`}"><span class="ci">🏥</span><span class="cn">Donate ${fmt(sc(100000))}</span><span class="cd">Major public gift · ${left} left</span></div>
        <div class="card ${lock}" onclick="${left<=0?'':`Assets.donate(1000000)`}"><span class="ci">🌍</span><span class="cn">Donate ${fmt(sc(1000000))}</span><span class="cd">Legendary giving · ${left} left</span></div>
      </div>`;
  },

  _renderHistory(G){
    const history=(G.assetHistory||[]).slice(0,5);
    const inv=(G.investmentHistory||[]).slice(0,4);
    const events=(G.assetEvents||[]).slice(0,4);
    if(!history.length&&!inv.length&&!events.length)return '';
    let h='<div class="sec">Finance History</div>';
    if(history.length){
      history.forEach(row=>{
        h+=`<div class="row-card"><span class="ri">📊</span><div class="rd"><div class="rt">Age ${row.age} · Net worth ${fmt(row.netWorth)}</div><div class="rs">Cash ${fmt(row.cash)} · Assets ${fmt(row.assets)} · Debt ${fmt(row.debt)} · Credit ${row.credit}</div></div><div class="rv">${row.debt>0?'Debt':'OK'}</div></div>`;
      });
    }
    if(inv.length){
      h+='<div class="info-box"><p>📈 Recent investments: '+inv.map(x=>`${this._esc(x.label)} ${x.gain>=0?'+':''}${fmt(x.gain)}`).join(' · ')+'</p></div>';
    }
    if(events.length){
      h+='<div class="info-box"><p>🧾 Recent asset moves: '+events.map(x=>`${this._esc(x.label||x.type)} ${x.amount?fmt(x.amount):''}`).join(' · ')+'</p></div>';
    }
    return h;
  },

  _renderMinor(G){
    const support=G.familySupport||0;
    const futureDebt=G.familyDebtPending||0;
    const dl={easy:'wealthy household',normal:'average household',hard:'struggling household',extreme:'unstable household',custom:'custom household'}[G.difficulty||'normal']||'household';
    return `<div class="nw-box">
      <div class="nw-lbl">Family Finances</div>
      <div class="nw-amt" style="font-size:22px">${this._esc(dl)}</div>
      <div class="nw-sub">You are under 18. Property, credit, insurance, vehicles and serious investments unlock at adulthood.</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      ${this._metricBox('Personal Cash',fmt(G.money||0),'','Pocket money only, not full family wealth.')}
      ${this._metricBox('Adult Support',support?fmt(support):'None',support?'var(--green)':'var(--muted)',support?'Released when you turn 18.':'No trust fund waiting.')}
    </div>
    ${futureDebt?`<div class="info-box" style="border-color:rgba(248,113,113,.35)"><p>⚠️ Family debt pressure: ${fmt(futureDebt)} may become your problem at age 18.</p></div>`:''}
    <div class="sec">Locked Until 18</div>
    <div class="act-grid">
      <div class="card locked"><span class="ci">🏠</span><span class="cn">Property</span><span class="cd">Adults only</span></div>
      <div class="card locked"><span class="ci">🚗</span><span class="cn">Vehicles</span><span class="cd">Adults only</span></div>
      <div class="card locked"><span class="ci">💳</span><span class="cn">Loans & Credit</span><span class="cd">Adults only</span></div>
      <div class="card locked"><span class="ci">📈</span><span class="cn">Investments</span><span class="cd">Adults only</span></div>
    </div>`;
  },

  _metricBox(label,value,color,sub){
    return `<div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">${this._esc(label)}</div><div class="nw-amt" style="font-size:22px${color?`;color:${color}`:''}">${value}</div><div class="nw-sub">${this._esc(sub)}</div></div>`;
  },

  _esc(s){
    return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  _adultOnly(){
    const G=window.G;
    if((G?.age||0)<18){
      UI.toast('Assets unlock at 18. Children cannot buy property, take loans, buy insurance or invest.','bad');
      this.render();
      return false;
    }
    return true;
  },


  _resetActionYearIfNeeded(G=window.G){
    if(!G)return;
    if(!Number.isFinite(G.assetsActionYear))G.assetsActionYear=G.age||0;
    if(!G.assetsActionUses||typeof G.assetsActionUses!=='object')G.assetsActionUses={};
    if(G.assetsActionYear!==(G.age||0)){
      G.assetsActionYear=G.age||0;
      G.assetsActionUses={};
    }
  },

  _usesLeft(action){
    const G=window.G;
    if(!G)return 0;
    this._resetActionYearIfNeeded(G);
    const limit=this.ACTION_LIMITS[action]??99;
    const used=G.assetsActionUses?.[action]||0;
    return Math.max(0,limit-used);
  },

  _canUseAction(action){
    const G=window.G;
    if(!G)return false;
    this._resetActionYearIfNeeded(G);
    if(this._usesLeft(action)<=0){
      UI.toast('You already used that finance action enough this year. Age up to refresh.','bad');
      return false;
    }
    return true;
  },

  _markAction(action){
    const G=window.G;
    if(!G)return;
    this._resetActionYearIfNeeded(G);
    G.assetsActionUses[action]=(G.assetsActionUses[action]||0)+1;
  },

  _recordAssetEvent(type,data={}){
    const G=window.G;
    if(!G)return;
    if(!Array.isArray(G.assetEvents))G.assetEvents=[];
    G.assetEvents.unshift({age:G.age||0,type,...data});
    if(G.assetEvents.length>this.HISTORY_LIMIT)G.assetEvents.length=this.HISTORY_LIMIT;
  },

  _totalDebt(G){
    return (G.loans||[]).reduce((a,l)=>a+(l.remaining||0),0)+(G.debtCollections||0);
  },

  _loanDue(G){
    return (G.loans||[]).reduce((a,l)=>a+Math.min(l.payment||0,l.remaining||0),0);
  },

  _annualLoanPayment(amount,rate,years){
    const principal=Math.max(0,Math.round(amount||0));
    const y=Math.max(1,Math.round(years||1));
    const r=Math.max(0,Number(rate)||0);
    if(!principal)return 0;
    if(!r)return Math.max(1,Math.round(principal/y));
    const monthlyRate=r/12;
    const n=y*12;
    const monthly=(principal*monthlyRate)/(1-Math.pow(1+monthlyRate,-n));
    return Math.max(1,Math.round(monthly*12));
  },

  _loanRoom(G,newDebt=0){
    const nw=Math.max(0,netWorth(G));
    const existing=this._totalDebt(G);
    const hardCap=Math.max(sc(20000),nw*2.5+sc(60000));
    return existing+newDebt<=hardCap;
  },

  _creditRepairCost(G){
    const score=G.creditScore||650;
    return sc(Math.max(1200,Math.round(4200-((score-500)*5))));
  },

  _extraLoanPayment(loan){
    const remaining=Math.max(0,Math.round(loan?.remaining||0));
    const payment=Math.max(0,Math.round(loan?.payment||0));
    return Math.min(remaining,Math.max(payment,Math.round(remaining*0.10)));
  },

  _creditMeta(score){
    if(score>=760)return{label:'Excellent',color:'var(--green)',hint:'best rates'};
    if(score>=670)return{label:'Good',color:'var(--teal)',hint:'finance available'};
    if(score>=580)return{label:'Fair',color:'var(--yellow)',hint:'limited options'};
    return{label:'Poor',color:'var(--red)',hint:'repair needed'};
  },

  _financeRisk(G,yearlyOverheads,debtRatio,runway){
    if((G.debtCollections||0)>0||debtRatio>65||runway<2)return{label:'High pressure',color:'var(--red)'};
    if(debtRatio>35||runway<5)return{label:'Watch cashflow',color:'var(--yellow)'};
    return{label:'Stable',color:'var(--green)'};
  },

  _ownedHomes(G){
    return (G.assets?.properties||[]).filter(p=>p&&p.rent===0&&p.value>0);
  },

  _primaryHome(G){
    this._ensurePrimaryHome(G);
    return this._ownedHomes(G).find(p=>p.primary)||null;
  },

  _ensurePrimaryHome(G){
    const homes=this._ownedHomes(G);
    if(!homes.length)return;
    const current=homes.find(p=>p.primary)||homes[0];
    homes.forEach(p=>{p.primary=p===current;});
  },

  _conditionLabel(v){
    const n=Math.round(v||0);
    if(n>=85)return'Excellent';
    if(n>=70)return'Good';
    if(n>=55)return'Fair';
    if(n>=40)return'Rough';
    return'Bad';
  },

  _maintainPropCost(p){
    return Math.max(sc(350),Math.round((p.value||0)*(p.rent>0?0.006:0.004)));
  },

  _renovatePropCost(p){
    return Math.max(sc(2500),Math.round((p.value||0)*0.028));
  },

  _expectedRent(p){
    return Math.round(sc(p.rent||0)*(0.78+(p.condition||75)/125+(p.upgrades||0)*0.04));
  },

  _propertyUpkeep(p){
    const G=window.G;
    const base=Math.max(450,Math.round((p.value||0)*(p.rent>0?0.0055:0.0038)));
    const managerFee=p.rent>0&&p.managed?Math.round((p.rent||0)*0.10):0;
    return Math.round((base+managerFee)*diffCostMult(G));
  },

  _serviceVehCost(v){
    return Math.max(sc(120),Math.round((v.value||0)*((v.price||0)>100000?0.03:(v.price||0)>30000?0.022:0.015)));
  },

  _vehicleUpkeep(v){
    const G=window.G;
    const base=(v.price||0)>100000?2200:(v.price||0)>30000?1100:380;
    const conditionPenalty=(v.condition||70)<45?1.45:(v.condition||70)<60?1.2:1;
    return Math.round(sc(base)*diffCostMult(G)*conditionPenalty);
  },

  setHousingPlan(id){
    const G=window.G;
    if(!this._adultOnly())return;
    if(!this._canUseAction('housing'))return;
    if(!this.housingPlans[id])return;
    if(G.housingPlan===id){UI.toast('You already live that way.');return;}
    G.housingPlan=id;
    this._markAction('housing');
    Engine.log(`${this.housingPlans[id].icon} Living situation changed to ${this.housingPlans[id].label}.`, 'money');
    UI.update();
    this.render();
  },

  ensureState(){
    const G=window.G;
    if(!G)return;
    if(!G.assets)G.assets={properties:[],vehicles:[]};
    if(!Array.isArray(G.assets.properties))G.assets.properties=[];
    if(!Array.isArray(G.assets.vehicles))G.assets.vehicles=[];
    if(!Array.isArray(G.loans))G.loans=[];
    if(!G.insurance)G.insurance={};
    if(!G.alimony)G.alimony={amount:0,yearsLeft:0,recipient:''};
    if(!Array.isArray(G.assetHistory))G.assetHistory=[];
    if(!Array.isArray(G.assetEvents))G.assetEvents=[];
    if(!Array.isArray(G.investmentHistory))G.investmentHistory=[];
    if(!Array.isArray(G.expenseMemory))G.expenseMemory=[];
    if(!G.assetsActionUses||typeof G.assetsActionUses!=='object')G.assetsActionUses={};
    if(!Number.isFinite(G.assetsActionYear))G.assetsActionYear=G.age||0;
    this._resetActionYearIfNeeded(G);
    if(!Number.isFinite(G.creditScore))G.creditScore=650;
    if(!Number.isFinite(G.debtCollections))G.debtCollections=0;
    if(!Number.isFinite(G.lastLivingCosts))G.lastLivingCosts=0;
    if(!Number.isFinite(G.lastAssetUpkeep))G.lastAssetUpkeep=0;
    if(!Number.isFinite(G.missedPayments))G.missedPayments=0;
    if(!G.housingPlan)G.housingPlan='standard';
    G.assets.properties.forEach(p=>{
      if(!Number.isFinite(p.condition))p.condition=r(68,86);
      if(!Number.isFinite(p.upgrades))p.upgrades=0;
      if(typeof p.managed!=='boolean')p.managed=!!(p.rent>0&&p.value>sc(350000));
      if(typeof p.primary!=='boolean')p.primary=false;
      if(!Number.isFinite(p.value))p.value=sc(p.price||1000);
    });
    G.assets.vehicles.forEach(v=>{
      if(!Number.isFinite(v.condition))v.condition=r(65,85);
      if(!Number.isFinite(v.value))v.value=sc(v.price||100);
    });
    G.loans.forEach(l=>{
      if(!Number.isFinite(l.rate))l.rate=0.08;
      if(!Number.isFinite(l.remaining))l.remaining=0;
      if(!Number.isFinite(l.yearsLeft))l.yearsLeft=5;
      l.payment=this._annualLoanPayment(l.remaining,l.rate,l.yearsLeft);
    });
    this._ensurePrimaryHome(G);
  },

  changeCredit(delta){
    const G=window.G;
    if(!G)return;
    G.creditScore=creditClamp((G.creditScore||650)+delta);
  },

  coveredExpense(type,baseAmount){
    const G=window.G;
    const rates={health:0.85,car:0.65,life:0.75};
    const insured=!!G.insurance?.[type];
    const covered=insured?Math.round(baseAmount*(rates[type]||0.5)):0;
    return{insured,covered,outOfPocket:Math.max(0,Math.round(baseAmount-covered))};
  },

  chargeExpense(label,amount,opts={}){
    const G=window.G;
    const due=Math.max(0,Math.round(amount));
    if(!due)return{paid:true,paidAmount:0,missed:0};
    if((G.money||0)>=due){
      G.money-=due;
      if(opts.logPaid)Engine.log(`${opts.icon||'💸'} ${label}: ${fmt(due)} paid.`,opts.type||'money');
      return{paid:true,paidAmount:due,missed:0};
    }
    const paid=Math.max(0,G.money||0);
    const missed=due-paid;
    G.money=0;
    if(opts.toCollections)G.debtCollections=(G.debtCollections||0)+Math.round(missed*(opts.collectionMult||1.1));
    if(opts.creditPenalty)this.changeCredit(-opts.creditPenalty);
    if(opts.stress)G.stress=cl((G.stress||0)+opts.stress);
    if(opts.happiness)G.happiness=cl((G.happiness||50)-opts.happiness);
    if(opts.health)G.health=cl((G.health||50)-opts.health);
    G.missedPayments=(G.missedPayments||0)+1;
    if(opts.logMiss!==false)Engine.log(`${opts.icon||'⚠️'} You could not fully cover ${label}. ${fmt(missed)} is now unpaid.`,opts.missType||'bad');
    return{paid:false,paidAmount:paid,missed};
  },

  _createLoan(type,label,amount,rate,years){
    return{id:Math.random().toString(36).slice(2),type,label,rate,yearsLeft:years,remaining:amount,payment:this._annualLoanPayment(amount,rate,years)};
  },

  takeLoan(type){
    const G=window.G;
    if(!this._adultOnly())return;
    this.ensureState();
    if(!this._canUseAction('loan'))return;
    const preset=this.loanPresets[type];
    if(!preset)return;
    const amount=sc(preset.amount);
    if((G.creditScore||650)<preset.minCredit){UI.toast(`Credit score ${preset.minCredit}+ required.`);return;}
    if(!this._loanRoom(G,amount)){UI.toast('Too much debt already. Improve net worth or repay loans first.');return;}
    G.money+=amount;
    G.loans.push(this._createLoan(type,preset.label,amount,preset.rate,preset.years));
    this._markAction('loan');
    this._recordAssetEvent('loan',{label:preset.label,amount});
    this.changeCredit(type==='emergency'?-15:-8);
    G.stress=cl((G.stress||0)+(type==='emergency'?4:1));
    Engine.log(`💳 Took out a ${preset.label.toLowerCase()} for ${fmt(amount)}.`, 'money');
    UI.update();
    this.render();
  },

  payLoan(i){
    const G=window.G;
    this.ensureState();
    if(!this._adultOnly())return;
    const loan=(G.loans||[])[i];
    if(!loan)return;
    const due=Math.min(loan.payment||loan.remaining,loan.remaining);
    if((G.money||0)<due){UI.toast(`Need ${fmt(due)}!`);return;}
    G.money-=due;
    loan.remaining=Math.max(0,Math.round(loan.remaining-due));
    loan.yearsLeft=Math.max(0,(loan.yearsLeft||0)-1);
    this.changeCredit(10);
    if(loan.remaining<=0){
      G.loans.splice(i,1);
      Engine.log(`✅ ${loan.label} paid off in full.`, 'good');
    }else{
      Engine.log(`💳 Paid ${fmt(due)} toward ${loan.label}. Remaining balance ${fmt(loan.remaining)}.`, 'money');
    }
    UI.update();
    this.render();
  },

  payLoanExtra(i){
    const G=window.G;
    this.ensureState();
    if(!this._adultOnly())return;
    if(!this._canUseAction('extraLoan'))return;
    const loan=(G.loans||[])[i];
    if(!loan)return;
    const extra=this._extraLoanPayment(loan);
    if((G.money||0)<extra){UI.toast(`Need ${fmt(extra)}!`);return;}
    G.money-=extra;
    this._markAction('extraLoan');
    loan.remaining=Math.max(0,Math.round(loan.remaining-extra));
    loan.payment=this._annualLoanPayment(loan.remaining,loan.rate,loan.yearsLeft);
    this.changeCredit(4);
    Engine.log(`📉 Paid an extra ${fmt(extra)} toward ${loan.label}.`, 'money');
    if(loan.remaining<=0){
      G.loans.splice(i,1);
      Engine.log(`✅ ${loan.label} fully repaid.`, 'good');
    }
    UI.update();
    this.render();
  },

  creditRepair(){
    const G=window.G;
    this.ensureState();
    if(!this._adultOnly())return;
    if(!this._canUseAction('creditRepair'))return;
    const cost=this._creditRepairCost(G);
    if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    if((G.creditScore||650)>=780){UI.toast('Your credit is already very strong.');return;}
    G.money-=cost;
    this._markAction('creditRepair');
    this.changeCredit(r(12,24));
    G.stress=cl((G.stress||0)-r(4,8));
    Engine.log(`🧾 Credit repair work cost ${fmt(cost)} and improved your score.`, 'good');
    UI.update();
    this.render();
  },

  refinanceLoan(i){
    const G=window.G;
    this.ensureState();
    if(!this._adultOnly())return;
    if(!this._canUseAction('refinance'))return;
    const loan=(G.loans||[])[i];
    if(!loan)return;
    if((G.creditScore||650)<700){UI.toast('Need 700+ credit score to refinance.');return;}
    if((loan.rate||0)<=0.04){UI.toast('That loan is already at a strong rate.');return;}
    const fee=sc(Math.max(500,Math.round((loan.remaining||0)*0.015)));
    if((G.money||0)<fee){UI.toast(`Need ${fmt(fee)}!`);return;}
    G.money-=fee;
    this._markAction('refinance');
    loan.rate=Math.max(0.025,Math.round(((loan.rate||0)-0.018)*1000)/1000);
    loan.payment=this._annualLoanPayment(loan.remaining,loan.rate,loan.yearsLeft);
    this.changeCredit(6);
    Engine.log(`🏦 Refinance approved for ${loan.label}. New APR ${Math.round((loan.rate||0)*100)}%.`, 'good');
    UI.update();
    this.render();
  },

  payCollections(){
    const G=window.G;
    this.ensureState();
    if(!this._adultOnly())return;
    const due=Math.round(G.debtCollections||0);
    if(!due){UI.toast('No collections active.');return;}
    if((G.money||0)<due){UI.toast(`Need ${fmt(due)} to clear collections fully.`);return;}
    G.money-=due;
    G.debtCollections=0;
    this.changeCredit(20);
    G.stress=cl((G.stress||0)-12);
    Engine.log('🧾 Collections paid off. Your financial pressure finally eases.', 'good');
    UI.update();
    this.render();
  },

  buyInsurance(type){
    const G=window.G;
    if(!this._adultOnly())return;
    if(!this._canUseAction('insurance'))return;
    const cost=sc(this.insuranceCosts[type]||500);
    if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money-=cost;
    this._markAction('insurance');
    G.insurance[type]=true;
    Engine.log(`🛡️ ${cap(type)} insurance purchased.`, 'good');
    Engine.checkAch();
    UI.update();
    this.render();
  },

  setPrimaryHome(i){
    const G=window.G;
    if(!this._adultOnly())return;
    const p=(G.assets.properties||[])[i];
    if(!p||p.rent>0)return;
    (G.assets.properties||[]).forEach(x=>{if(x.rent===0)x.primary=false;});
    p.primary=true;
    Engine.log(`🏡 ${p.name} is now your primary home.`, 'good');
    UI.update();
    this.render();
  },

  manageProp(i,act){
    const G=window.G;
    const p=(G.assets.properties||[])[i];
    if(!p||!this._adultOnly())return;
    if(act==='maintain'){
      if(!this._canUseAction('propertyMaintain'))return;
      const cost=this._maintainPropCost(p);
      if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
      G.money-=cost;
      this._markAction('propertyMaintain');
      p.condition=cl((p.condition||70)+r(12,20));
      p.value=Math.round((p.value||0)*(1.01+Math.random()*0.02));
      Engine.log(`🔧 Property maintenance kept ${p.name} in shape.`, 'good');
    }else if(act==='renovate'){
      if(!this._canUseAction('propertyRenovate'))return;
      const cost=this._renovatePropCost(p);
      if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
      G.money-=cost;
      this._markAction('propertyRenovate');
      p.condition=cl((p.condition||70)+r(18,28));
      p.upgrades=(p.upgrades||0)+1;
      p.value=Math.round((p.value||0)*(1.05+Math.random()*0.05));
      if(p.rent>0)p.rent=Math.round(p.rent*(1.06+Math.random()*0.06));
      if(p.primary)G.happiness=cl((G.happiness||50)+r(4,8));
      Engine.log(`🛠️ Renovated ${p.name}. Value, condition and lifestyle improved.`, 'special');
    }else if(act==='manager'){
      if(p.rent<=0)return;
      if(!this._canUseAction('propertyManager'))return;
      p.managed=!p.managed;
      this._markAction('propertyManager');
      Engine.log(`🤝 ${p.managed?'Hired a property manager for':'You took back control of'} ${p.name}.`, p.managed?'good':'neutral');
    }
    UI.update();
    this.render();
  },

  buyProp(id){
    const G=window.G;
    if(!this._adultOnly())return;
    if(!this._canUseAction('buyProperty'))return;
    const p=(PROPERTIES||[]).find(x=>x.id===id);
    if(!p)return;
    if(p.id==='room'){UI.toast('Rent is a yearly living cost, not a property purchase.');return;}
    const price=sc(p.price);
    const down=Math.round(price*0.20);
    const canFinance=(G.creditScore||650)>=620&&(G.money||0)>=down&&this._loanRoom(G,price-down);
    if((G.money||0)<price&&!canFinance){UI.toast(`Need ${fmt(price)} cash or ${fmt(down)} down with better credit.`);return;}
    let purchaseNote='';
    if((G.money||0)>=price){
      G.money-=price;
      purchaseNote=`for ${fmt(price)} cash`;
    }else{
      G.money-=down;
      G.loans.push(this._createLoan('mortgage',`Mortgage - ${p.name}`,price-down,0.055,25));
      this.changeCredit(-14);
      purchaseNote=`with ${fmt(down)} down and a mortgage`;
    }
    const prop={...p,value:sc(p.value),rent:p.rent,condition:r(72,88),upgrades:0,managed:p.rent>0&&p.price>350000,primary:false};
    if(prop.rent===0&&!this._primaryHome(G))prop.primary=true;
    G.assets.properties.push(prop);
    this._markAction('buyProperty');
    this._recordAssetEvent('property-buy',{label:p.name,amount:price});
    this._ensurePrimaryHome(G);
    Engine.log(`🏠 Purchased ${p.name} ${purchaseNote}.`, 'special');
    G.happiness=cl((G.happiness||50)+11);
    Engine.checkAch();
    UI.update();
    this.render();
  },

  sellProp(i){
    const G=window.G;
    const p=(G.assets.properties||[])[i];
    if(!p||!this._adultOnly())return;
    if(!this._canUseAction('sellProperty'))return;
    const sv=Math.floor((p.value||0)*(0.92+Math.random()*0.18));
    if(!confirm(`Sell ${p.name}?\n\nEstimated sale price: ${fmt(sv)}\n\nThis is permanent.`))return;
    G.money=(G.money||0)+sv;
    this._markAction('sellProperty');
    this._recordAssetEvent('property-sell',{label:p.name,amount:sv});
    G.assets.properties.splice(i,1);
    this._ensurePrimaryHome(G);
    Engine.log(`🏠 Sold property for ${fmt(sv)}.`, 'money');
    UI.update();
    this.render();
  },

  serviceVeh(i){
    const G=window.G;
    const v=(G.assets.vehicles||[])[i];
    if(!v||!this._adultOnly())return;
    if(!this._canUseAction('vehicleService'))return;
    const cost=this._serviceVehCost(v);
    if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money-=cost;
    this._markAction('vehicleService');
    v.condition=cl((v.condition||65)+r(16,26));
    v.value=Math.round((v.value||0)*(1.01+Math.random()*0.015));
    Engine.log(`🔧 ${v.name} was serviced and runs better now.`, 'good');
    UI.update();
    this.render();
  },

  buyVeh(id){
    const G=window.G;
    if(!this._adultOnly())return;
    if(!this._canUseAction('buyVehicle'))return;
    const v=(VEHICLES||[]).find(x=>x.id===id);
    if(!v)return;
    const price=sc(v.price);
    const down=Math.round(price*0.15);
    const canFinance=(G.creditScore||650)>=600&&(G.money||0)>=down&&this._loanRoom(G,price-down);
    if((G.money||0)<price&&!canFinance){UI.toast(`Need ${fmt(price)} cash or ${fmt(down)} down with decent credit.`);return;}
    let note='';
    if((G.money||0)>=price){
      G.money-=price;
      note=`for ${fmt(price)} cash`;
    }else{
      G.money-=down;
      G.loans.push(this._createLoan('auto',`Auto Loan - ${v.name}`,price-down,0.082,6));
      this.changeCredit(-10);
      note=`with ${fmt(down)} down and financing`;
    }
    G.assets.vehicles.push({...v,value:sc(v.value),condition:r(70,88)});
    this._markAction('buyVehicle');
    this._recordAssetEvent('vehicle-buy',{label:v.name,amount:price});
    Engine.log(`🚗 Bought ${v.name} ${note}.`, 'good');
    G.happiness=cl((G.happiness||50)+7);
    Engine.checkAch();
    UI.update();
    this.render();
  },

  sellVeh(i){
    const G=window.G;
    const v=(G.assets.vehicles||[])[i];
    if(!v||!this._adultOnly())return;
    if(!this._canUseAction('sellVehicle'))return;
    const sv=Math.floor((v.value||0)*(0.82+Math.random()*0.08));
    if(!confirm(`Sell ${v.name}?\n\nYou'll receive: ${fmt(sv)}\n\nThis is permanent.`))return;
    G.money=(G.money||0)+sv;
    this._markAction('sellVehicle');
    this._recordAssetEvent('vehicle-sell',{label:v.name,amount:sv});
    G.assets.vehicles.splice(i,1);
    Engine.log(`🚗 Sold ${v.name} for ${fmt(sv)}.`, 'money');
    UI.update();
    this.render();
  },

  invest(type){
    const G=window.G;
    if(!this._adultOnly())return;
    if(!this._canUseAction('invest'))return;
    const plan=this.investmentPlans[type];
    if(!plan)return;
    const amt=sc(plan.amount);
    if((G.money||0)<amt){UI.toast(`Need at least ${fmt(amt)} to invest!`);return;}
    G.money-=amt;
    this._markAction('invest');
    let gain=0,msg='';
    const rv=Math.random();
    const luckyMult=G.trait==='lucky'?1.25:1.0;
    if(type==='stocks'){
      if(rv<0.40){gain=amt*(0.12+rv*0.42)*luckyMult;msg=`Stocks rose. Gained ${fmt(Math.round(gain))}.`;}
      else if(rv<0.72){gain=-amt*(0.07+Math.random()*0.22);msg=`Stocks fell. Lost ${fmt(Math.round(-gain))}.`;}
      else{gain=amt*(0.5+Math.random())*luckyMult;msg=`Huge rally. Gained ${fmt(Math.round(gain))}.`;}
    }else if(type==='bonds'){
      gain=amt*(0.03+Math.random()*0.05);msg=`Bonds matured safely. Earned ${fmt(Math.round(gain))}.`;
    }else if(type==='crypto'){
      if(rv<0.42){gain=-amt*(0.40+Math.random()*0.58);msg=`Crypto crashed. Lost ${fmt(Math.round(-gain))}.`;}
      else if(rv<0.78){gain=amt*(0.9+Math.random()*1.6)*luckyMult;msg=`Crypto mooned. Made ${fmt(Math.round(gain))}.`;}
      else{gain=amt*3.8*luckyMult;msg='Crypto went parabolic.';}
    }else if(type==='gold'){
      gain=amt*(rv>0.4?(0.02+Math.random()*0.09):-(0.02+Math.random()*0.05));
      msg=gain>0?`Gold gained ${fmt(Math.round(gain))}.`:'Gold slipped slightly.';
    }else if(type==='etf'){
      gain=amt*(0.05+Math.random()*0.11);msg=`Index fund performed steadily. +${fmt(Math.round(gain))}.`;
    }else if(type==='startup'){
      if(rv<0.65){gain=-amt;msg=`Startup failed. Lost ${fmt(amt)}.`;}
      else if(rv<0.90){gain=amt*3.5*luckyMult;msg=`Startup exit. ${fmt(amt)} became ${fmt(Math.round(amt+gain))}.`;}
      else{gain=amt*18*luckyMult;msg='You found a unicorn.';}
    }else if(type==='forex'){
      gain=amt*(rv>0.5?r(5,28)/100:-r(5,22)/100);
      msg=gain>0?`Forex profit: +${fmt(Math.round(gain))}.`:`Forex loss: -${fmt(Math.round(-gain))}.`;
    }else if(type==='art'){
      gain=amt*(rv>0.35?(0.08+Math.random()*0.32):-(0.05+Math.random()*0.15));
      msg=gain>0?`Art appreciated: +${fmt(Math.round(gain))}.`:'Art market softened.';
    }
    const finalReturn=Math.max(0,amt+Math.round(gain));
    G.money=Math.max(0,(G.money||0)+finalReturn);
    this._rememberInvestment(type,amt,Math.round(gain),finalReturn,msg);
    G.lifetimeGambled=(G.lifetimeGambled||0)+(type==='forex'||type==='crypto'?amt:0);
    Engine.log(`📈 ${msg}`,gain>=0?'money':'bad');
    G.happiness=cl((G.happiness||50)+(gain>0?9:-7));
    Engine.checkAch();
    UI.milestoneCheck(G);
    UI.update();
    this.render();
  },

  donate(amt){
    const G=window.G;
    const a=sc(amt);
    if(!this._adultOnly())return;
    if(!this._canUseAction('donate'))return;
    if((G.money||0)<a){UI.toast(`Need ${fmt(a)}!`);return;}
    G.money-=a;
    this._markAction('donate');
    this._recordAssetEvent('donation',{label:'Charity donation',amount:a});
    G.happiness=cl((G.happiness||50)+r(8,16));
    G.karma=cl((G.karma||0)+r(4,10),-100,100);
    G.fame=cl((G.fame||0)+r(2,8));
    G.lifetimeDonated=(G.lifetimeDonated||0)+a;
    Engine.log(`🤲 Donated ${fmt(a)} to charity.`, 'special');
    Engine.checkAch();
    UI.update();
    this.render();
  },

  _rememberInvestment(type,amount,gain,finalReturn,msg){
    const G=window.G;
    if(!G)return;
    if(!Array.isArray(G.investmentHistory))G.investmentHistory=[];
    const plan=this.investmentPlans[type]||{};
    G.investmentHistory.unshift({
      age:G.age||0,
      type,
      label:plan.label||type,
      amount,
      gain,
      finalReturn,
      msg,
    });
    if(G.investmentHistory.length>this.INVESTMENT_HISTORY_LIMIT)G.investmentHistory.length=this.INVESTMENT_HISTORY_LIMIT;
  },

  _pushHistory(){
    const G=window.G;
    if(!G)return;
    if(!Array.isArray(G.assetHistory))G.assetHistory=[];
    const props=G.assets?.properties||[];
    const vehs=G.assets?.vehicles||[];
    const assetValue=props.reduce((a,p)=>a+(p.value||0),0)+vehs.reduce((a,v)=>a+(v.value||0),0)+(G.business?.value||0);
    G.assetHistory.unshift({
      age:G.age||0,
      cash:G.money||0,
      assets:assetValue,
      debt:this._totalDebt(G),
      netWorth:typeof netWorth==='function'?netWorth(G):(G.money||0)+assetValue-this._totalDebt(G),
      credit:G.creditScore||650,
    });
    if(G.assetHistory.length>this.HISTORY_LIMIT)G.assetHistory.length=this.HISTORY_LIMIT;
  },

  tick(){
    const G=window.G;
    this.ensureState();
    if((G.age||0)<18){UI.milestoneCheck(G);return;}
    if(G.age===18&&!G.familySupportReleased&&(G.familySupport||0)>0){
      G.money=(G.money||0)+(G.familySupport||0);
      Engine.log(`🏦 Adult support released: ${fmt(G.familySupport)} from your family or trust fund is now yours.`, 'money');
      G.familySupport=0;
      G.familySupportReleased=true;
    }
    if(G.age===18&&(G.familyDebtPending||0)>0){
      G.debtCollections=(G.debtCollections||0)+G.familyDebtPending;
      Engine.log(`💳 Family debt caught up with you at adulthood: ${fmt(G.familyDebtPending)} entered collections.`, 'bad');
      G.familyDebtPending=0;
      this.changeCredit(-25);
    }

    let vacancyHits=0;
    (G.assets.properties||[]).forEach(p=>{
      p.condition=cl((p.condition||75)-r(2,5));
      if(p.rent>0){
        const occupiedChance=Math.max(0.38,Math.min(0.96,0.68+((p.condition||75)/250)+(p.managed?0.08:0)+((G.skills?.negotiation||0)*0.02)));
        if(Math.random()<occupiedChance){G.money=(G.money||0)+this._expectedRent(p);}else vacancyHits++;
      }
      const growth=(p.appRate||0)*0.35+Math.random()*(p.appRate||0)*0.7+(((p.condition||70)-60)/2200)+((p.upgrades||0)*0.004);
      p.value=Math.max(sc(1000),Math.round((p.value||sc(1000))*(1+growth)));
    });
    if(vacancyHits>0)Engine.log(`🏠 ${vacancyHits} rental propert${vacancyHits===1?'y was':'ies were'} vacant for part of the year.`, 'neutral');

    (G.assets.vehicles||[]).forEach(v=>{
      v.condition=cl((v.condition||75)-r(3,7));
      const dep=0.025+Math.random()*0.05+Math.max(0,(70-(v.condition||70)))/1000;
      v.value=Math.max(sc(100),Math.round((v.value||sc(100))*(1-dep)));
    });

    let cleanYear=true;
    cleanYear=this._applyInsurancePremiums()&&cleanYear;
    cleanYear=this._applyLivingCosts()&&cleanYear;
    cleanYear=this._processAssetUpkeep()&&cleanYear;
    cleanYear=this._processLoans()&&cleanYear;
    cleanYear=this._processAlimony()&&cleanYear;
    cleanYear=this._processCollections()&&cleanYear;
    this._randomExpense();

    if(cleanYear){
      this.changeCredit(6);
      if((G.creditScore||0)>=720&&Math.random()<0.15)Engine.log('📊 Another year of on-time payments boosted your credit score.', 'good');
    }
    this._pushHistory();
    UI.milestoneCheck(G);
  },

  _applyInsurancePremiums(){
    const G=window.G;
    let ok=true;
    [['health',sc(800),'health insurance'],['car',sc(600),'car insurance'],['life',sc(500),'life insurance']].forEach(([key,cost,label])=>{
      if(!G.insurance?.[key])return;
      const res=this.chargeExpense(`${label} premium`,cost,{icon:'🛡️',toCollections:true,creditPenalty:10,stress:2,happiness:1,logMiss:true});
      if(res.paid)Engine.log(`🛡️ Paid ${label} premium (${fmt(cost)}).`, 'money');
      else ok=false;
    });
    return ok;
  },

  _applyLivingCosts(){
    const G=window.G;
    const kids=dependentChildrenCount(G);
    const withPartner=cohabitingPartner(G);
    const hasHome=!!this._primaryHome(G);
    const plan=this.housingPlans[G.housingPlan]||this.housingPlans.standard;
    const rentBase=Math.round(plan.base*(withPartner?0.62:1));
    const housing=hasHome?annualCost(1800+kids*500+(withPartner?250:0)):annualCost(rentBase+kids*2500);
    const utilities=annualCost(1800+kids*450+(withPartner?350:0));
    const phone=annualCost(600+(withPartner?300:0));
    const transport=annualCost(((G.assets.vehicles||[]).length?700:1200)+kids*150);
    const clothing=annualCost(900+kids*450+(withPartner?200:0));
    const total=housing+utilities+phone+transport+clothing;
    G.lastLivingCosts=total;
    const res=this.chargeExpense('yearly bills',total,{icon:'🏠',toCollections:true,creditPenalty:35,stress:9,happiness:10,logMiss:true});
    if(res.paid){
      if(!hasHome){
        G.happiness=cl((G.happiness||50)+(plan.happiness||0));
        if(plan.stress)G.stress=cl((G.stress||0)+plan.stress);
      }
      Engine.log(`🏠 Paid living costs for the year (${fmt(total)}).`, 'money');
      return true;
    }
    Engine.log('⚠️ Missing bills damaged your peace of mind and credit score.', 'bad');
    return false;
  },

  _processAssetUpkeep(){
    const G=window.G;
    const props=G.assets.properties||[];
    const vehs=G.assets.vehicles||[];
    if(!props.length&&!vehs.length){G.lastAssetUpkeep=0;return true;}
    const total=props.reduce((a,p)=>a+this._propertyUpkeep(p),0)+vehs.reduce((a,v)=>a+this._vehicleUpkeep(v),0);
    G.lastAssetUpkeep=total;
    const res=this.chargeExpense('property and vehicle upkeep',total,{icon:'🔧',toCollections:true,creditPenalty:22,stress:6,happiness:6,logMiss:true});
    if(res.paid){Engine.log(`🔧 Paid asset upkeep for the year (${fmt(total)}).`, 'money');return true;}
    props.forEach(p=>{p.condition=cl((p.condition||70)-r(8,14));p.value=Math.round((p.value||0)*(0.95+Math.random()*0.03));});
    vehs.forEach(v=>{v.condition=cl((v.condition||70)-r(10,16));v.value=Math.round((v.value||0)*(0.92+Math.random()*0.04));});
    Engine.log('⚠️ Skipping upkeep made your assets deteriorate faster.', 'bad');
    return false;
  },

  _processLoans(){
    const G=window.G;
    let ok=true;
    for(let i=(G.loans||[]).length-1;i>=0;i--){
      const loan=G.loans[i];
      loan.remaining=Math.round((loan.remaining||0)*(1+(loan.rate||0)));
      const due=Math.min(loan.payment||loan.remaining,loan.remaining);
      if((G.money||0)>=due){
        G.money-=due;
        loan.remaining=Math.max(0,Math.round(loan.remaining-due));
        loan.yearsLeft=Math.max(0,(loan.yearsLeft||0)-1);
        this.changeCredit(7);
        Engine.log(`💳 Made your ${loan.label.toLowerCase()} payment (${fmt(due)}).`, 'money');
        if(loan.remaining<=0||(loan.yearsLeft<=0&&loan.remaining<loan.payment)){
          G.loans.splice(i,1);
          Engine.log(`✅ ${loan.label} fully repaid.`, 'good');
        }
      }else{
        loan.remaining=Math.round(loan.remaining+due*0.2);
        this.changeCredit(-45);
        G.stress=cl((G.stress||0)+12);
        G.happiness=cl((G.happiness||50)-8);
        G.missedPayments=(G.missedPayments||0)+1;
        Engine.log(`⚠️ Missed a ${loan.label.toLowerCase()} payment. Credit damage and extra interest hit hard.`, 'bad');
        ok=false;
      }
    }
    return ok;
  },

  _processAlimony(){
    const G=window.G;
    const al=G.alimony;
    if(!al||!al.amount||al.yearsLeft<=0)return true;
    if((G.money||0)>=al.amount){
      G.money-=al.amount;
      al.yearsLeft=Math.max(0,al.yearsLeft-1);
      Engine.log(`💔 Paid ${fmt(al.amount)} in alimony to ${al.recipient||'your ex'}.`, 'money');
      if(al.yearsLeft<=0){G.alimony={amount:0,yearsLeft:0,recipient:''};Engine.log('💔 Alimony obligations are finally over.', 'good');}
      return true;
    }
    this.changeCredit(-18);
    G.stress=cl((G.stress||0)+10);
    G.happiness=cl((G.happiness||50)-7);
    G.debtCollections=(G.debtCollections||0)+Math.round(al.amount*1.1);
    Engine.log('⚠️ You missed alimony. The unpaid balance has gone to collections.', 'bad');
    return false;
  },

  _processCollections(){
    const G=window.G;
    if(!(G.debtCollections>0))return true;
    const pressure=Math.max(sc(300),Math.round(G.debtCollections*0.18));
    if((G.money||0)>=pressure){
      G.money-=pressure;
      G.debtCollections=Math.max(0,Math.round(G.debtCollections-pressure*0.7));
      G.stress=cl((G.stress||0)+2);
      Engine.log(`🧾 Debt collectors took ${fmt(pressure)}. Outstanding collections: ${fmt(G.debtCollections)}.`, 'bad');
      return false;
    }
    G.debtCollections=Math.round(G.debtCollections*1.18);
    this.changeCredit(-22);
    G.stress=cl((G.stress||0)+14);
    G.happiness=cl((G.happiness||50)-10);
    Engine.log(`⚠️ Debt collectors escalated. Your unpaid balance grew to ${fmt(G.debtCollections)}.`, 'bad');
    return false;
  },

  _randomExpense(){
    const G=window.G;
    if(Math.random()>=0.26){G.lastUnexpectedExpense=0;return;}
    if(!Array.isArray(G.expenseMemory))G.expenseMemory=[];
    const lowCondCar=(G.assets.vehicles||[]).some(v=>(v.condition||70)<50);
    const lowCondHome=(G.assets.properties||[]).some(p=>p.rent===0&&(p.condition||70)<50);
    const pool=[
      {label:'broken boiler',base:lowCondHome?3200:1800,icon:'🔧',type:null,weight:lowCondHome?3:1},
      {label:'parking ticket',base:220,icon:'🚓',type:null,weight:1.2},
      {label:'dental emergency',base:950,icon:'🦷',type:'health',weight:1.4},
      {label:'car repair',base:lowCondCar?2800:1600,icon:'🚗',type:(G.assets.vehicles||[]).length?'car':null,weight:lowCondCar?3:1.1},
      {label:'appliance replacement',base:1250,icon:'🧺',type:null,weight:1},
      {label:'legal paperwork fee',base:700,icon:'📄',type:null,weight:0.8},
    ].filter(e=>e.type!=='car'||(G.assets.vehicles||[]).length>0);
    const recent=new Set(G.expenseMemory.slice(0,3).map(e=>e.label));
    const fresh=pool.filter(e=>!recent.has(e.label));
    const candidates=fresh.length?fresh:pool;
    const weighted=[];
    candidates.forEach(e=>{for(let i=0;i<Math.max(1,Math.round((e.weight||1)*2));i++)weighted.push(e);});
    const evt=pick(weighted);
    if(!evt)return;
    G.expenseMemory.unshift({age:G.age||0,label:evt.label});
    if(G.expenseMemory.length>this.EXPENSE_MEMORY_LIMIT)G.expenseMemory.length=this.EXPENSE_MEMORY_LIMIT;
    const base=annualCost(evt.base);
    const claim=evt.type?this.coveredExpense(evt.type,base):{insured:false,covered:0,outOfPocket:base};
    G.lastUnexpectedExpense=claim.outOfPocket;
    const res=this.chargeExpense(evt.label,claim.outOfPocket,{icon:evt.icon,toCollections:true,creditPenalty:evt.type?10:16,stress:6,happiness:5,logMiss:true});
    if(res.paid){
      if(claim.insured)Engine.log(`${evt.icon} ${cap(evt.label)} happened. Insurance covered ${fmt(claim.covered)} and you paid ${fmt(claim.outOfPocket)}.`, 'money');
      else Engine.log(`${evt.icon} Unexpected ${evt.label} cost you ${fmt(claim.outOfPocket)}.`, 'bad');
    }
  },
};