/* js/stocks.js — LifeSim v9 */
const STOCK_LIST = [
  { id:'APEX',  name:'Apex Technologies',   icon:'💻', sector:'Tech',      basePrice:120,  vol:0.18, div:0.01 },
  { id:'VITA',  name:'VitaCorp Health',      icon:'💊', sector:'Health',    basePrice:85,   vol:0.12, div:0.025 },
  { id:'NOVA',  name:'Nova Energy',          icon:'⚡', sector:'Energy',    basePrice:55,   vol:0.22, div:0.03 },
  { id:'FXGD',  name:'FinEx Gold Fund',      icon:'🥇', sector:'Commodities',basePrice:200, vol:0.08, div:0.005 },
  { id:'MRKT',  name:'MarketPulse ETF',      icon:'📊', sector:'Index',     basePrice:340,  vol:0.10, div:0.015 },
  { id:'LUXE',  name:'Luxe Brands Inc.',     icon:'💎', sector:'Consumer',  basePrice:180,  vol:0.20, div:0.01 },
  { id:'AGRI',  name:'AgroWorld',            icon:'🌾', sector:'Agriculture',basePrice:42,  vol:0.15, div:0.035 },
  { id:'CRPT',  name:'CryptoVault Trust',    icon:'🪙', sector:'Crypto',    basePrice:900,  vol:0.55, div:0.0  },
  { id:'BANK',  name:'Meridian Bank',        icon:'🏦', sector:'Finance',   basePrice:160,  vol:0.13, div:0.04 },
  { id:'AERO',  name:'AeroSpace Systems',    icon:'🚀', sector:'Defence',   basePrice:290,  vol:0.17, div:0.008},
];

const Stocks = {
  // Initialize market prices if needed
  init() {
    const G = window.G; if (!G) return;
    if (!G.stocks) G.stocks = { portfolio: {}, history: {} };
    if (!G.stocks.prices) {
      G.stocks.prices = {};
      STOCK_LIST.forEach(s => { G.stocks.prices[s.id] = s.basePrice; });
    }
    if (!G.stocks.history) G.stocks.history = {};
  },

  tick() {
    const G = window.G; if (!G) return;
    Stocks.init();
    const prices = G.stocks.prices;
    let dividends = 0;
    // Apply world events effect
    const worldBoom  = G.achievements?.boom_profit;
    const worldCrash = G.achievements?.recession_surv;
    const moodMult   = worldBoom ? 1.06 : worldCrash ? 0.95 : 1.0;

    STOCK_LIST.forEach(s => {
      const old = prices[s.id] || s.basePrice;
      // Random walk with mean reversion
      const rnd = (Math.random() - 0.47) * 2 * s.vol;
      const meanRev = (s.basePrice - old) / s.basePrice * 0.04;
      let newP = old * (1 + rnd + meanRev) * moodMult;
      newP = Math.max(newP, 1);
      prices[s.id] = Math.round(newP * 100) / 100;

      // History (last 8 years)
      if (!G.stocks.history[s.id]) G.stocks.history[s.id] = [];
      G.stocks.history[s.id].push(old);
      if (G.stocks.history[s.id].length > 8) G.stocks.history[s.id].shift();

      // Dividends on held shares
      const held = (G.stocks.portfolio[s.id] || 0);
      if (held > 0 && s.div > 0) {
        const div = Math.round(held * prices[s.id] * s.div);
        dividends += div;
      }
    });

    if (dividends > 0) {
      G.money += dividends;
      Engine.log(`💰 Dividend income: ${fmt(dividends)} received from your portfolio.`, 'money');
    }
  },

  portfolioValue() {
    const G = window.G; if (!G || !G.stocks) return 0;
    Stocks.init();
    let val = 0;
    STOCK_LIST.forEach(s => {
      const held = G.stocks.portfolio[s.id] || 0;
      val += held * (G.stocks.prices[s.id] || s.basePrice);
    });
    return Math.round(val);
  },

  buy(id, shares) {
    const G = window.G;
    Stocks.init();
    const s = STOCK_LIST.find(x => x.id === id); if (!s) return;
    const price = G.stocks.prices[id] || s.basePrice;
    const total = Math.round(price * shares);
    if (G.money < total) { UI.toast(`Need ${fmt(total)} to buy ${shares} share${shares>1?'s':''}!`); return; }
    G.money -= total;
    G.stocks.portfolio[id] = (G.stocks.portfolio[id] || 0) + shares;
    Engine.log(`📈 Bought ${shares}× ${s.id} @ ${fmt(price)} (total ${fmt(total)}).`, 'money');
    UI.toast(`📈 Bought ${shares}× ${s.name}!`, 'good');
    UI.update(); Stocks.render();
  },

  sell(id, shares) {
    const G = window.G;
    Stocks.init();
    const s = STOCK_LIST.find(x => x.id === id); if (!s) return;
    const held = G.stocks.portfolio[id] || 0;
    if (held < shares) { UI.toast('Not enough shares!'); return; }
    const price = G.stocks.prices[id] || s.basePrice;
    const total = Math.round(price * shares);
    G.money += total;
    G.stocks.portfolio[id] = held - shares;
    if (G.stocks.portfolio[id] === 0) delete G.stocks.portfolio[id];
    Engine.log(`📉 Sold ${shares}× ${s.id} @ ${fmt(price)} (total ${fmt(total)}).`, 'money');
    UI.toast(`📉 Sold ${shares}× ${s.name} for ${fmt(total)}`, 'good');
    UI.update(); Stocks.render();
  },

  render() {
    const G = window.G; if (!G) return;
    const el = document.getElementById('tab-stocks'); if (!el) return;
    Stocks.init();
    const portVal = Stocks.portfolioValue();
    const port = G.stocks.portfolio;
    const prices = G.stocks.prices;

    let h = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div class="nw-box" style="margin-bottom:0">
        <div class="nw-lbl">📈 Portfolio Value</div>
        <div class="nw-amt" style="font-size:20px;color:var(--green)">${fmtFull(portVal)}</div>
        <div class="nw-sub">${Object.keys(port).length} positions</div>
      </div>
      <div class="nw-box" style="margin-bottom:0">
        <div class="nw-lbl">💵 Cash Available</div>
        <div class="nw-amt" style="font-size:20px;color:var(--yellow)">${fmt(G.money)}</div>
        <div class="nw-sub">For investing</div>
      </div>
    </div>`;

    // Your holdings
    const heldIds = Object.keys(port).filter(k => (port[k]||0) > 0);
    if (heldIds.length > 0) {
      h += `<div class="sec">💼 Your Holdings</div>`;
      heldIds.forEach(id => {
        const s = STOCK_LIST.find(x => x.id === id); if (!s) return;
        const price = prices[id] || s.basePrice;
        const qty = port[id];
        const val = Math.round(price * qty);
        // Mini sparkline from history
        const hist = G.stocks.history[id] || [];
        const trend = hist.length >= 2 ? (hist[hist.length-1] > hist[0] ? '↗️' : '↘️') : '➡️';
        h += `<div class="row-card" style="border-color:rgba(74,222,128,.25)">
          <span class="ri">${s.icon}</span>
          <div class="rd">
            <div class="rt">${s.name} <span style="font-size:10px;color:var(--muted)">${s.id}</span> ${trend}</div>
            <div class="rs">${qty} shares · ${fmt(price)}/share · <strong style="color:var(--green)">${fmt(val)}</strong></div>
          </div>
          <div style="display:flex;gap:5px">
            <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto;background:rgba(248,113,113,.2);border-color:rgba(248,113,113,.4);color:var(--red)" onclick="Stocks.sell('${id}',1)">Sell 1</button>
            <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto;background:rgba(248,113,113,.2);border-color:rgba(248,113,113,.4);color:var(--red)" onclick="Stocks.sell('${id}',${qty})">All</button>
          </div>
        </div>`;
      });
    } else {
      h += `<div class="empty compact"><span class="ei">📈</span><p>No holdings yet.<br>Buy shares below to build your first portfolio.</p></div>`;
    }

    h += `<div class="sec">🏢 Market — Buy Shares</div>`;
    STOCK_LIST.forEach(s => {
      const price = prices[s.id] || s.basePrice;
      const hist  = G.stocks.history[s.id] || [];
      const prev  = hist.length >= 2 ? hist[hist.length-2] : s.basePrice;
      const chg   = ((price - prev) / prev * 100).toFixed(1);
      const chgCol = price > prev ? 'var(--green)' : price < prev ? 'var(--red)' : 'var(--muted)';
      const chgStr = price > prev ? `▲ ${chg}%` : price < prev ? `▼ ${Math.abs(chg)}%` : '─';
      const held = port[s.id] || 0;
      const volTag = s.vol > 0.3 ? '🔥 High Risk' : s.vol > 0.16 ? '⚡ Med Risk' : '🛡️ Low Risk';
      h += `<div class="row-card" style="padding:10px 12px">
        <span class="ri">${s.icon}</span>
        <div class="rd">
          <div class="rt">${s.name} <span style="font-size:10px;color:var(--muted)">${s.id} · ${s.sector}</span></div>
          <div class="rs">${volTag}${s.div > 0 ? ` · Div ${(s.div*100).toFixed(1)}%/yr` : ''} ${held>0?`· Holding: <strong>${held}</strong>`:''}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:14px;font-weight:900;color:var(--txt)">${fmt(price)}</div>
          <div style="font-size:10px;font-weight:700;color:${chgCol}">${chgStr}</div>
          <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto;margin-top:4px" onclick="Stocks.buy('${s.id}',1)">Buy 1</button>
          <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto;margin-top:4px" onclick="Stocks.buy('${s.id}',5)">Buy 5</button>
        </div>
      </div>`;
    });
    el.innerHTML = h;
  },
};
