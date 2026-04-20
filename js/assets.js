/* js/assets.js — LifeSim v9 */
const Assets={
  render(){
    const G=window.G; if(!G)return;
    const el=document.getElementById('tab-assets');
    const pv=(G.assets.properties||[]).reduce((a,p)=>a+(p.value||0),0);
    const vv=(G.assets.vehicles||[]).reduce((a,v)=>a+(v.value||0),0);
    const bv=G.business?G.business.value:0;
    const nw=G.money+pv+vv+bv;
    let h=`<div class="nw-box">
      <div class="nw-lbl">💎 Total Net Worth</div>
      <div class="nw-amt">${fmtFull(nw)}</div>
      <div class="nw-sub">Cash ${fmt(G.money)} · Property ${fmt(pv)} · Vehicles ${fmt(vv)}${bv>0?` · Biz ${fmt(bv)}`:''}</div>
    </div>`;

    // Insurance section
    if(!G.insurance||!G.insurance.health||!G.insurance.car||!G.insurance.life){
      h+=`<div class="sec">🛡️ Insurance</div>`;
      if(!G.insurance?.health) h+=`<div class="row-card" onclick="Assets.buyInsurance('health')"><span class="ri">🏥</span><div class="rd"><div class="rt">Health Insurance</div><div class="rs">Covers medical bills · ${fmt(sc(800))}/yr</div></div><div class="rv">${fmt(sc(800))}</div></div>`;
      if(!G.insurance?.car&&G.assets.vehicles.length>0) h+=`<div class="row-card" onclick="Assets.buyInsurance('car')"><span class="ri">🚗</span><div class="rd"><div class="rt">Car Insurance</div><div class="rs">Vehicle protection · ${fmt(sc(600))}/yr</div></div><div class="rv">${fmt(sc(600))}</div></div>`;
      if(!G.insurance?.life&&G.age>=25) h+=`<div class="row-card" onclick="Assets.buyInsurance('life')"><span class="ri">❤️</span><div class="rd"><div class="rt">Life Insurance</div><div class="rs">Family security · ${fmt(sc(500))}/yr</div></div><div class="rv">${fmt(sc(500))}</div></div>`;
    } else {
      h+=`<div class="info-box" style="border-color:rgba(74,222,128,.35)"><p>✅ Fully insured: Health, Car & Life insurance all active.</p></div>`;
    }

    if((G.assets.properties||[]).length>0){
      h+=`<div class="sec">🏠 My Properties</div>`;
      (G.assets.properties||[]).forEach((p,i)=>{
        h+=`<div class="row-card" onclick="Assets.sellProp(${i})">
          <span class="ri">${p.icon}</span>
          <div class="rd"><div class="rt">${p.name}</div>
          <div class="rs">Value: ${fmt(p.value)}${p.rent>0?` · Rent: +${fmt(sc(p.rent))}/yr`:''} · Tap to sell</div></div>
        </div>`;
      });
    }

    if((G.assets.vehicles||[]).length>0){
      h+=`<div class="sec">🚗 My Vehicles (${G.assets.vehicles.length})</div>`;
      (G.assets.vehicles||[]).forEach((v,i)=>{
        h+=`<div class="row-card" onclick="Assets.sellVeh(${i})">
          <span class="ri">${v.icon}</span>
          <div class="rd"><div class="rt">${v.name}</div>
          <div class="rs">Value: ${fmt(v.value)} · Tap to sell</div></div>
        </div>`;
      });
    }
    if(!(G.assets.properties||[]).length&&!(G.assets.vehicles||[]).length){
      h+=`<div class="empty compact"><span class="ei">🏠</span><p>No major assets yet.<br>Property, vehicles and investments will shape long-term wealth.</p></div>`;
    }

    h+=`<div class="sec">🏘️ Real Estate Market</div>`;
    PROPERTIES.forEach(p=>{
      const price=sc(p.price); const can=G.money>=price;
      h+=`<div class="row-card ${can?'':'locked'}" onclick="${can?`Assets.buyProp('${p.id}')`:``}">
        <span class="ri">${p.icon}</span>
        <div class="rd"><div class="rt">${p.name}</div>
        <div class="rs">${p.desc}${p.rent>0?` · Earns +${fmt(sc(p.rent))}/yr`:''}</div></div>
        <div class="rv">${fmt(price)}</div>
      </div>`;
    });

    h+=`<div class="sec">🚗 Vehicle Showroom</div>`;
    VEHICLES.forEach(v=>{
      const price=sc(v.price); const can=G.money>=price;
      h+=`<div class="row-card ${can?'':'locked'}" onclick="${can?`Assets.buyVeh('${v.id}')`:``}">
        <span class="ri">${v.icon}</span>
        <div class="rd"><div class="rt">${v.name}</div><div class="rs">${v.desc}</div></div>
        <div class="rv">${fmt(price)}</div>
      </div>`;
    });

    h+=`<div class="sec">📈 Investments</div>
    <div class="act-grid">
      <div class="card" onclick="Assets.invest('stocks')"><span class="ci">📊</span><span class="cn">Stocks</span><span class="cd">High risk/reward</span></div>
      <div class="card" onclick="Assets.invest('bonds')"><span class="ci">🏦</span><span class="cn">Bonds</span><span class="cd">Safe & steady</span></div>
      <div class="card" onclick="Assets.invest('crypto')"><span class="ci">🪙</span><span class="cn">Crypto</span><span class="cd">Extreme risk</span></div>
      <div class="card" onclick="Assets.invest('gold')"><span class="ci">🥇</span><span class="cn">Gold</span><span class="cd">Stable store of value</span></div>
    </div>
    <div class="act-grid" style="margin-top:8px">
      <div class="card" onclick="Assets.invest('etf')"><span class="ci">📉</span><span class="cn">Index Fund</span><span class="cd">Long-term safe</span></div>
      <div class="card" onclick="Assets.invest('startup')"><span class="ci">🚀</span><span class="cn">Startup Bet</span><span class="cd">Moonshot</span></div>
      <div class="card" onclick="Assets.invest('forex')"><span class="ci">💱</span><span class="cn">Forex Trading</span><span class="cd">Currency gamble</span></div>
      <div class="card" onclick="Assets.invest('art')"><span class="ci">🖼️</span><span class="cn">Buy Fine Art</span><span class="cd">Appreciating asset</span></div>
    </div>`;

    h+=`<div class="sec">🤲 Charitable Giving</div>
    <div class="act-grid">
      <div class="card" onclick="Assets.donate(1000)"><span class="ci">💝</span><span class="cn">Donate ${fmt(sc(1000))}</span><span class="cd">+Hap +Karma</span></div>
      <div class="card" onclick="Assets.donate(10000)"><span class="ci">❤️</span><span class="cn">Donate ${fmt(sc(10000))}</span><span class="cd">+Hap +Karma</span></div>
      <div class="card" onclick="Assets.donate(100000)"><span class="ci">🏥</span><span class="cn">Donate ${fmt(sc(100000))}</span><span class="cd">Major philanthropy</span></div>
      <div class="card" onclick="Assets.donate(1000000)"><span class="ci">🌍</span><span class="cn">Donate ${fmt(sc(1000000))}</span><span class="cd">Legendary generosity</span></div>
    </div>`;

    el.innerHTML=h;
  },

  buyInsurance(type){
    const G=window.G;
    const costs={health:800,car:600,life:500};
    const cost=sc(costs[type]||500);
    if(G.money<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money-=cost; if(!G.insurance)G.insurance={};
    G.insurance[type]=true;
    Engine.log(`🛡️ ${cap(type)} insurance purchased. You're protected.`,'good');
    Engine.checkAch(); UI.update(); this.render();
  },

  buyProp(id){
    const G=window.G; const p=PROPERTIES.find(x=>x.id===id); if(!p)return;
    const price=sc(p.price); if(G.money<price){UI.toast('Not enough!');return;}
    G.money-=price;
    if(!G.assets.properties)G.assets.properties=[];
    G.assets.properties.push({...p,value:sc(p.value),rent:p.rent});
    Engine.log(`🏠 Purchased ${p.name} for ${fmt(price)}!`,'special');
    G.happiness=cl(G.happiness+11); Engine.checkAch(); UI.update(); this.render();
  },

  sellProp(i){
    const G=window.G; const p=(G.assets.properties||[])[i]; if(!p)return;
    const sv=Math.floor(p.value*(1+Math.random()*0.14));
    G.money+=sv; G.assets.properties.splice(i,1);
    Engine.log(`🏠 Sold property for ${fmt(sv)}.`,'money'); UI.update(); this.render();
  },

  buyVeh(id){
    const G=window.G; const v=VEHICLES.find(x=>x.id===id); if(!v)return;
    const price=sc(v.price); if(G.money<price){UI.toast('Not enough!');return;}
    G.money-=price;
    if(!G.assets.vehicles)G.assets.vehicles=[];
    G.assets.vehicles.push({...v,value:sc(v.value)});
    Engine.log(`🚗 Bought ${v.name} for ${fmt(price)}!`,'good');
    G.happiness=cl(G.happiness+7); Engine.checkAch(); UI.update(); this.render();
  },

  sellVeh(i){
    const G=window.G; const v=(G.assets.vehicles||[])[i]; if(!v)return;
    const sv=Math.floor(v.value*0.84); G.money+=sv; G.assets.vehicles.splice(i,1);
    Engine.log(`🚗 Sold ${v.name} for ${fmt(sv)}.`,'money'); UI.update(); this.render();
  },

  invest(type){
    const G=window.G;
    const amts={stocks:5000,bonds:2000,crypto:3000,gold:2500,etf:3000,startup:10000,forex:2000,art:8000};
    const amt=sc(amts[type]||3000);
    if(G.money<amt){UI.toast(`Need at least ${fmt(amt)} to invest!`);return;}
    G.money-=amt; let gain=0,msg=''; const rv=Math.random();
    const luckyMult=G.trait==='lucky'?1.25:1.0;

    if(type==='stocks'){
      if(rv<0.40){gain=amt*(0.12+rv*0.42)*luckyMult;msg=`📈 Stocks rose! Gained ${fmt(Math.round(gain))}.`;}
      else if(rv<0.72){gain=-amt*(0.07+Math.random()*0.22);msg=`📉 Stocks fell. Lost ${fmt(Math.round(-gain))}.`;}
      else{gain=amt*(0.5+Math.random())*luckyMult;msg=`🚀 Huge rally! Gained ${fmt(Math.round(gain))}!`;}
    } else if(type==='bonds'){
      gain=amt*(0.03+Math.random()*0.05);msg=`🏦 Bonds matured safely. Earned ${fmt(Math.round(gain))}.`;
    } else if(type==='crypto'){
      if(rv<0.42){gain=-amt*(0.40+Math.random()*0.58);msg=`📉 Crypto crashed. Lost ${fmt(Math.round(-gain))}!`;}
      else if(rv<0.78){gain=amt*(0.9+Math.random()*1.6)*luckyMult;msg=`🚀 Crypto mooned! Made ${fmt(Math.round(gain))}!`;}
      else{gain=amt*3.8*luckyMult;msg=`🌕 CRYPTO TO THE MOON! Life-changing return!`;}
    } else if(type==='gold'){
      gain=amt*(rv>0.4?(0.02+Math.random()*0.09):-(0.02+Math.random()*0.05));
      msg=gain>0?`🥇 Gold gained ${fmt(Math.round(gain))}.`:`📉 Gold slipped slightly.`;
    } else if(type==='etf'){
      gain=amt*(0.05+Math.random()*0.11); msg=`📊 Index fund performed steadily. +${fmt(Math.round(gain))}.`;
    } else if(type==='startup'){
      if(rv<0.65){gain=-amt;msg=`💸 Startup failed. Lost the ${fmt(amt)} investment.`;}
      else if(rv<0.90){gain=amt*3.5*luckyMult;msg=`🚀 Startup exit! ${fmt(amt)} → ${fmt(Math.round(amt+gain))}!`;}
      else{gain=amt*18*luckyMult;msg=`🦄 UNICORN! Spectacular returns!`;}
    } else if(type==='forex'){
      gain=amt*(rv>0.5?r(5,28)/100:-r(5,22)/100);
      msg=gain>0?`💱 Forex profitable: +${fmt(Math.round(gain))}.`:`💱 Forex loss: -${fmt(Math.round(-gain))}.`;
    } else if(type==='art'){
      gain=amt*(rv>0.35?(0.08+Math.random()*0.32):-(0.05+Math.random()*0.15));
      msg=gain>0?`🖼️ Art appreciated: +${fmt(Math.round(gain))}.`:`🖼️ Art market soft, small loss.`;
    }

    G.money=Math.max(0,G.money+amt+Math.round(gain));
    G.lifetimeGambled=(G.lifetimeGambled||0)+(type==='forex'||type==='crypto'?amt:0);
    Engine.log(`📈 ${msg}`,gain>0?'money':'bad');
    G.happiness=cl(G.happiness+(gain>0?9:-7));
    Engine.checkAch(); UI.milestoneCheck(G); UI.update(); this.render();
  },

  donate(amt){
    const G=window.G; const a=sc(amt);
    if(G.money<a){UI.toast(`Need ${fmt(a)}!`);return;}
    G.money-=a; G.happiness=cl(G.happiness+r(8,16)); G.karma=cl((G.karma||0)+r(4,10),-100,100);
    G.fame=cl((G.fame||0)+r(2,8)); G.lifetimeDonated=(G.lifetimeDonated||0)+a;
    Engine.log(`🤲 Donated ${fmt(a)} to charity. The world is better for it.`,'special');
    Engine.checkAch(); UI.update(); this.render();
  },

  tick(){
    const G=window.G;
    (G.assets.properties||[]).forEach(p=>{
      if(p.rent>0)G.money+=sc(p.rent);
      if(p.value>0&&p.appRate>0)p.value=Math.round(p.value*(1+p.appRate*0.5+Math.random()*p.appRate));
    });
    (G.assets.vehicles||[]).forEach(v=>{
      v.value=Math.round(v.value*(1-0.02-Math.random()*0.04));
    });
    // Insurance yearly cost
    if(G.insurance){
      if(G.insurance.health)G.money=Math.max(0,G.money-sc(800));
      if(G.insurance.car)G.money=Math.max(0,G.money-sc(600));
      if(G.insurance.life)G.money=Math.max(0,G.money-sc(500));
    }
    UI.milestoneCheck(G);
  },
};
