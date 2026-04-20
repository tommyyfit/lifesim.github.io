/* js/business.js — LifeSim v9 */
const Business={
  TYPES:[
    {id:'food_cart',     icon:'🌮',name:'Food Cart',          startCost:5000,   rev:8000,   expenses:3000, growthRate:.15,desc:'Street food vendor'},
    {id:'salon',         icon:'💇',name:'Hair Salon',         startCost:15000,  rev:24000,  expenses:9000, growthRate:.12,desc:'Beauty & grooming'},
    {id:'bar',           icon:'🍺',name:'Bar / Pub',          startCost:40000,  rev:62000,  expenses:30000,growthRate:.12,desc:'Neighbourhood bar'},
    {id:'gym',           icon:'🏋️',name:'Gym / Fitness',     startCost:60000,  rev:82000,  expenses:36000,growthRate:.13,desc:'Fitness centre'},
    {id:'restaurant',    icon:'🍽️',name:'Restaurant',        startCost:80000,  rev:125000, expenses:68000,growthRate:.14,desc:'Full-service dining'},
    {id:'boutique',      icon:'👗',name:'Fashion Boutique',   startCost:30000,  rev:52000,  expenses:24000,growthRate:.12,desc:'Clothing retail store'},
    {id:'tech_startup',  icon:'💻',name:'Tech Startup',       startCost:50000,  rev:0,      expenses:42000,growthRate:.30,desc:'SaaS product'},
    {id:'estate_agency', icon:'🏡',name:'Estate Agency',      startCost:45000,  rev:92000,  expenses:42000,growthRate:.12,desc:'Property sales'},
    {id:'marketing_agency',icon:'📣',name:'Marketing Agency', startCost:35000,  rev:75000,  expenses:40000,growthRate:.14,desc:'Digital marketing firm'},
    {id:'hotel',         icon:'🏨',name:'Boutique Hotel',     startCost:500000, rev:620000, expenses:310000,growthRate:.10,desc:'Luxury accommodation'},
    {id:'media_co',      icon:'📺',name:'Media Company',      startCost:100000, rev:210000, expenses:105000,growthRate:.18,desc:'Content & publishing'},
    {id:'law_firm',      icon:'⚖️',name:'Law Firm',           startCost:200000, rev:420000, expenses:190000,growthRate:.10,desc:'Legal services'},
    {id:'investment_co', icon:'📈',name:'Investment Fund',    startCost:1000000,rev:220000, expenses:55000, growthRate:.22,desc:'Asset management'},
  ],

  render(){
    const G=window.G; if(!G)return;
    const el=document.getElementById('tab-business');
    let h='';
    if(G.business){
      const b=G.business;
      const profit=sc(b.revenue-b.expenses);
      const profitC=profit>0?'var(--green)':'var(--red)';
      const rep=b.reputation||50, morale=b.morale||50;
      h+=`<div class="biz-hero">
        <div class="biz-ico">${b.icon}</div>
        <div class="biz-name">${b.name}</div>
        <div class="biz-type">${b.desc} · Founded age ${b.foundedAge} · Year ${b.yearsOpen}</div>
        <div class="biz-rev">Revenue: ${fmt(sc(b.revenue))}/yr · Expenses: ${fmt(sc(b.expenses))}/yr</div>
        <div class="biz-val">Net profit: <span style="color:${profitC}">${fmt(profit)}/yr</span> · Valuation: ${fmt(b.value)}</div>
        <div class="biz-val">Reputation: ${rep}% · Team morale: ${morale}% · Risk: ${b.debt?'Leveraged':'Normal'}</div>
      </div>`;
      h+=`<div class="act-grid">
        <div class="card" onclick="Business.act('market')"><span class="ci">📣</span><span class="cn">Marketing Push</span><span class="cd">+Revenue (${fmt(sc(2000))})</span></div>
        <div class="card" onclick="Business.act('hire')"><span class="ci">👥</span><span class="cn">Hire Staff</span><span class="cd">+Revenue +Expenses</span></div>
        <div class="card" onclick="Business.act('expand')"><span class="ci">🏗️</span><span class="cn">Expand</span><span class="cd">+Revenue big (${fmt(sc(10000))})</span></div>
        <div class="card" onclick="Business.act('efficiency')"><span class="ci">⚙️</span><span class="cn">Cut Costs</span><span class="cd">−Expenses</span></div>
      </div>
      <div class="act-grid" style="margin-top:8px">
        <div class="card" onclick="Business.act('franchise')"><span class="ci">🏪</span><span class="cn">Franchise</span><span class="cd">+Revenue massive (${fmt(sc(50000))})</span></div>
        <div class="card" onclick="Business.act('pivot')"><span class="ci">🔄</span><span class="cn">Pivot Business</span><span class="cd">Change direction</span></div>
        <div class="card" onclick="Business.act('ipo')"><span class="ci">📈</span><span class="cn">IPO</span><span class="cd">Need ${fmt(sc(1000000))}+ val</span></div>
        <div class="card danger" onclick="Business.act('sell')"><span class="ci">💰</span><span class="cn">Sell Business</span><span class="cd">Cash out</span></div>
      </div>
      <div class="act-grid" style="margin-top:8px">
        <div class="card" onclick="Business.act('insurance')"><span class="ci">🛡️</span><span class="cn">Business Insurance</span><span class="cd">Protect (${fmt(sc(2000))})</span></div>
        <div class="card" onclick="Business.act('pr')"><span class="ci">📰</span><span class="cn">PR Campaign</span><span class="cd">+Fame +Revenue</span></div>
      </div>`;
    } else {
      if(G.age<18){el.innerHTML='<div class="empty"><span class="ei">🏢</span><p>Must be 18 to start a business.</p></div>';return;}
      h+=`<div class="info-box"><p>Build your own business empire. The larger you grow, the more it earns — but also the bigger the risks.</p></div>
      <div class="sec">🚀 Start a Business</div>`;
      this.TYPES.forEach(t=>{
        const cost=sc(t.startCost); const can=G.money>=cost;
        const profit=sc(t.rev-t.expenses);
        h+=`<div class="row-card ${can?'':'locked'}" onclick="${can?`Business.start('${t.id}')`:``}">
          <span class="ri">${t.icon}</span>
          <div class="rd">
            <div class="rt">${t.name}</div>
            <div class="rs">${t.desc} · Profit: ${profit>0?fmt(profit)+'/yr':'Growth play'} · Growth +${Math.round(t.growthRate*100)}%/yr</div>
          </div>
          <div class="rv">${fmt(cost)}</div>
        </div>`;
      });
    }
    el.innerHTML=h;
  },

  start(id){
    const G=window.G; const t=this.TYPES.find(x=>x.id===id); if(!t)return;
    const cost=sc(t.startCost);
    if(G.money<cost){UI.toast(`Need ${fmt(cost)} to start!`);return;}
    G.money-=cost;
    G.business={id:t.id,icon:t.icon,name:t.name,desc:t.desc,revenue:t.rev,expenses:t.expenses,value:cost,growthRate:t.growthRate,foundedAge:G.age,yearsOpen:0,insured:false,reputation:50,morale:50,debt:0};
    Engine.log(`🚀 Launched ${t.name}! Invested ${fmt(cost)}. Year 1 begins.`,'special');
    G.happiness=cl(G.happiness+15); Engine.checkAch(); UI.update(); this.render();
  },

  act(a){
    const G=window.G; const b=G.business; if(!b&&a!=='sell')return;
    if(a==='market'){const c=sc(2000);if(G.money<c){UI.toast('Need '+fmt(c)+'!');return;}G.money-=c;b.revenue=Math.floor(b.revenue*(1+r(5,14)/100));b.reputation=cl((b.reputation||50)+r(2,6));Engine.log(`📣 Marketing boosted revenue to ${fmt(sc(b.revenue))}/yr and built brand reputation.`,'money');}
    else if(a==='hire'){const c=sc(5000);if(G.money<c){UI.toast('Need '+fmt(c)+'!');return;}G.money-=c;b.revenue=Math.floor(b.revenue*1.13);b.expenses=Math.floor(b.expenses*1.09);b.morale=cl((b.morale||50)+r(4,9));Engine.log(`👥 New hires onboarded. Capacity and team morale rose.`,'good');}
    else if(a==='expand'){const c=sc(10000);if(G.money<c){UI.toast('Need '+fmt(c)+'!');return;}G.money-=c;b.revenue=Math.floor(b.revenue*(1+r(18,32)/100));b.expenses=Math.floor(b.expenses*1.16);b.value=Math.floor(b.value*1.22);b.morale=cl((b.morale||50)-r(2,7));Engine.log(`🏗️ Expansion complete! Revenue rose, but the team feels the strain.`,'special');}
    else if(a==='efficiency'){b.expenses=Math.floor(b.expenses*(1-r(6,14)/100));b.morale=cl((b.morale||50)-r(4,10));b.reputation=cl((b.reputation||50)-r(0,4));Engine.log(`⚙️ Costs cut. Margins improved, but morale took a hit.`,'good');}
    else if(a==='franchise'){const c=sc(50000);if(G.money<c){UI.toast('Need '+fmt(c)+'!');return;}G.money-=c;b.revenue=Math.floor(b.revenue*(1+r(40,80)/100));b.expenses=Math.floor(b.expenses*1.32);b.value=Math.floor(b.value*1.55);b.reputation=cl((b.reputation||50)+r(5,12));b.debt=(b.debt||0)+sc(15000);Engine.log(`🏪 Franchise launched! Big growth, bigger obligations.`,'special');}
    else if(a==='pivot'){const nt=pick(this.TYPES.filter(t=>t.id!==b.id));b.revenue=nt.rev;b.expenses=nt.expenses;b.growthRate=nt.growthRate;b.icon=nt.icon;b.name=nt.name;b.desc=nt.desc;b.reputation=cl((b.reputation||50)-r(5,12));b.morale=cl((b.morale||50)+r(-8,8));Engine.log(`🔄 Pivoted to ${nt.name}. New direction, but customers need convincing.`,'neutral');}
    else if(a==='ipo'){if(b.value<sc(1000000)){UI.toast(`Need ${fmt(sc(1000000))} valuation!`);return;}const ipoGain=Math.floor(b.value*r(150,300)/100);G.money+=ipoGain;if(!G.achievements)G.achievements={};G.achievements.ipo=true;G.business=null;Engine.log(`📈 IPO SUCCESS! Raised ${fmt(ipoGain)}!`,'special');G.happiness=cl(G.happiness+25);Engine.checkAch();UI.update();this.render();return;}
    else if(a==='sell'){if(!b){UI.toast('No business to sell!');return;}const sv=Math.floor(b.value*r(90,130)/100);G.money+=sv;G.business=null;Engine.log(`💰 Business sold for ${fmt(sv)}.`,'money');G.happiness=cl(G.happiness+12);UI.update();this.render();return;}
    else if(a==='insurance'){const c=sc(2000);if(G.money<c){UI.toast('Need '+fmt(c)+'!');return;}G.money-=c;b.insured=true;Engine.log('🛡️ Business insurance purchased. Protected.','good');}
    else if(a==='pr'){G.fame=cl((G.fame||0)+r(3,8));b.revenue=Math.floor(b.revenue*1.05);b.reputation=cl((b.reputation||50)+r(6,12));Engine.log('📰 PR campaign boosted brand, reputation and revenue.','good');}
    UI.update(); this.render();
  },

  tick(){
    const G=window.G; const b=G.business; if(!b)return;
    b.yearsOpen++;
    const growPct=b.growthRate*(0.6+Math.random()*0.8);
    b.revenue=Math.floor(b.revenue*(1+growPct));
    b.expenses=Math.floor(b.expenses*(1+growPct*0.45));
    b.value=Math.floor(b.value*(1+growPct*0.75));
    const profit=sc(b.revenue-b.expenses);
    const repBoost=((b.reputation||50)-50)/500;
    const moraleBoost=((b.morale||50)-50)/600;
    if(profit>0)G.money+=profit;
    if(b.debt){const debtPay=Math.min(b.debt,Math.max(sc(500),Math.floor(Math.abs(profit)*0.08)));b.debt=Math.max(0,b.debt-debtPay);if(profit>0)G.money=Math.max(0,G.money-debtPay);}
    b.value=Math.floor(b.value*(1+repBoost+moraleBoost));
    const roll=Math.random();
    if((b.morale||50)<25&&Math.random()<0.18){b.revenue=Math.floor(b.revenue*0.9);Engine.log('😤 Low morale caused turnover and slower delivery this year.','bad');}
    if((b.reputation||50)>75&&Math.random()<0.12){b.revenue=Math.floor(b.revenue*1.12);Engine.log('🌟 Strong reputation brought repeat customers and referrals.','money');}
    if(roll<0.08){if(!b.insured){b.revenue=Math.floor(b.revenue*0.80);b.reputation=cl((b.reputation||50)-8);Engine.log(`⚠️ Business crisis! Revenue and reputation dropped. Insurance would have helped.`,'bad');}else Engine.log('⚠️ Business crisis hit, but insurance covered it!','neutral');}
    else if(roll>0.91){b.revenue=Math.floor(b.revenue*1.16);b.reputation=cl((b.reputation||50)+3);Engine.log(`📈 Excellent year for ${b.name}! Revenue surged.`,'money');}
    if(b.value>=sc(1000000000)&&!G.achievements?.unicorn){if(!G.achievements)G.achievements={};G.achievements.unicorn=true;Engine.log('🦄 UNICORN! Your business reached $1 Billion valuation!','special');Engine.checkAch();}
    if(profit<-sc(50000)&&!b.insured){if(!G.achievements)G.achievements={};G.achievements.bankrupt=true;G.money+=Math.max(0,Math.floor(b.value*0.15));G.business=null;Engine.log('📉 Business went bankrupt. Sold remaining assets.','bad');G.happiness=cl(G.happiness-18);Engine.checkAch();}
  },
};
