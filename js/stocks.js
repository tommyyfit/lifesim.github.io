/* js/stocks.js — LifeSim v13 Reforged market simulator */

const STOCK_LIST=[
  {id:'AAPL',name:'Apple Inc.',icon:'📱',sector:'Technology',basePrice:190,vol:.16,div:.005,quality:1.08,beta:1.05,desc:'Premium hardware, services and ecosystem.'},
  {id:'MSFT',name:'Microsoft Corp.',icon:'💻',sector:'Technology',basePrice:420,vol:.14,div:.008,quality:1.10,beta:.95,desc:'Software, cloud and enterprise AI.'},
  {id:'NVDA',name:'NVIDIA Corp.',icon:'🧠',sector:'Semiconductors',basePrice:880,vol:.34,div:0,quality:1.16,beta:1.75,desc:'AI chips, data centers and high momentum.'},
  {id:'TSLA',name:'Tesla Inc.',icon:'🚗',sector:'EV / Auto',basePrice:180,vol:.42,div:0,quality:1.02,beta:1.85,desc:'Electric vehicles, batteries and speculation.'},
  {id:'AMZN',name:'Amazon.com Inc.',icon:'📦',sector:'Consumer / Cloud',basePrice:185,vol:.21,div:0,quality:1.08,beta:1.18,desc:'E-commerce, logistics and cloud.'},
  {id:'GOOGL',name:'Alphabet Inc.',icon:'🔎',sector:'Internet',basePrice:165,vol:.18,div:0,quality:1.07,beta:1.05,desc:'Search, ads, YouTube and AI.'},
  {id:'META',name:'Meta Platforms',icon:'🌐',sector:'Social Media',basePrice:500,vol:.25,div:.004,quality:1.05,beta:1.25,desc:'Social apps, ads and metaverse bets.'},
  {id:'JPM',name:'JPMorgan Chase',icon:'🏦',sector:'Banking',basePrice:195,vol:.17,div:.028,quality:1.03,beta:1.0,desc:'Large bank with dividend income.'},
  {id:'KO',name:'Coca-Cola Co.',icon:'🥤',sector:'Consumer Defensive',basePrice:62,vol:.08,div:.031,quality:1.00,beta:.55,desc:'Defensive consumer brand and dividends.'},
  {id:'VOO',name:'Vanguard S&P 500 ETF',icon:'📊',sector:'Index ETF',basePrice:470,vol:.10,div:.014,quality:1.02,beta:.82,desc:'Diversified broad-market exposure.'},
  {id:'BTC',name:'Bitcoin Trust',icon:'₿',sector:'Crypto',basePrice:650,vol:.58,div:0,quality:1.00,beta:2.4,desc:'Extreme-volatility crypto exposure.'},
  {id:'GLD',name:'SPDR Gold Shares',icon:'🥇',sector:'Gold ETF',basePrice:205,vol:.09,div:0,quality:.99,beta:.30,desc:'Defensive gold exposure.'},
];

const Stocks={
  VERSION:13.1,

  _esc(v){
    if(typeof escHTML==='function')return escHTML(v);
    return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  _num(v,fallback=0){
    const n=Number(v);
    return Number.isFinite(n)?n:fallback;
  },

  _rand(min,max){
    if(typeof r==='function')return r(min,max);
    min=Math.ceil(this._num(min,0));
    max=Math.floor(this._num(max,min));
    if(max<min){const t=min;min=max;max=t;}
    return Math.floor(Math.random()*(max-min+1))+min;
  },

  _toast(msg,type=''){
    if(typeof UI!=='undefined'&&UI&&typeof UI.toast==='function')UI.toast(msg,type);
    else console.log('[LifeSim]',msg);
  },

  _log(msg,type='neutral'){
    if(typeof Engine!=='undefined'&&Engine&&typeof Engine.log==='function')Engine.log(msg,type);
    else console.log(`[${type}]`,msg);
  },

  _update(){
    if(typeof UI!=='undefined'&&UI&&typeof UI.update==='function')UI.update();
  },

  _checkAch(){
    if(typeof Engine!=='undefined'&&Engine&&typeof Engine.checkAch==='function')Engine.checkAch();
  },

  _confirm(msg){
    if(typeof confirm==='function')return confirm(msg);
    return true;
  },

  init(){
    const G=window.G;if(!G)return;
    if(!G.stocks||typeof G.stocks!=='object')G.stocks={};
    const S=G.stocks;

    S.version=this.VERSION;
    S.portfolio=S.portfolio&&typeof S.portfolio==='object'?S.portfolio:{};
    S.costBasis=S.costBasis&&typeof S.costBasis==='object'?S.costBasis:{};
    S.prices=S.prices&&typeof S.prices==='object'?S.prices:null;
    S.history=S.history&&typeof S.history==='object'?S.history:{};
    S.marketMood=S.marketMood||'neutral';
    S.marketCycle=Number.isFinite(S.marketCycle)?S.marketCycle:0;
    S.lastYearReturn=Number.isFinite(S.lastYearReturn)?S.lastYearReturn:0;
    S.totalDividends=Number.isFinite(S.totalDividends)?S.totalDividends:0;
    S.realizedPnl=Number.isFinite(S.realizedPnl)?S.realizedPnl:0;
    S.totalBought=Number.isFinite(S.totalBought)?S.totalBought:0;
    S.totalSold=Number.isFinite(S.totalSold)?S.totalSold:0;

    if(!S.prices){
      S.prices={};
      STOCK_LIST.forEach(st=>S.prices[st.id]=st.basePrice);
    }

    STOCK_LIST.forEach(st=>{
      if(!Number.isFinite(S.prices[st.id]))S.prices[st.id]=st.basePrice;
      if(!Array.isArray(S.history[st.id]))S.history[st.id]=[S.prices[st.id]];
    });

    Object.keys(S.portfolio).forEach(id=>{
      if(!STOCK_LIST.some(st=>st.id===id)||!Number.isFinite(S.portfolio[id])||S.portfolio[id]<=0){
        delete S.portfolio[id];
        delete S.costBasis[id];
      }else if(!Number.isFinite(S.costBasis[id])){
        S.costBasis[id]=S.prices[id]||STOCK_LIST.find(st=>st.id===id)?.basePrice||1;
      }
    });
  },

  _mood(){
    const G=window.G;
    const finance=G?.skills?.finance||0;
    const roll=Math.random();
    const extremeDrag=G?.difficulty==='extreme'?0.035:G?.difficulty==='hard'?0.018:0;
    const skillCalm=Math.min(.025,finance*.004);

    if(roll<0.06+extremeDrag-skillCalm)return'crash';
    if(roll<0.20+extremeDrag-skillCalm)return'bear';
    if(roll>0.94+skillCalm)return'boom';
    if(roll>0.73)return'bull';
    return'neutral';
  },

  _moodReturn(mood){
    return{
      crash:-0.18,
      bear:-0.055,
      neutral:0.018,
      bull:0.075,
      boom:0.145,
    }[mood]??0.018;
  },

  _moodLabel(mood){
    return{
      crash:'Crash',
      bear:'Bearish',
      neutral:'Mixed',
      bull:'Bullish',
      boom:'Boom',
    }[mood]||'Mixed';
  },

  _moodColor(mood){
    return{
      crash:'var(--red)',
      bear:'var(--orange)',
      neutral:'var(--accent)',
      bull:'var(--green)',
      boom:'var(--yellow)',
    }[mood]||'var(--accent)';
  },

  _riskLabel(s){
    if(s.vol>.48)return'Extreme Risk';
    if(s.vol>.30)return'High Risk';
    if(s.vol>.14)return'Medium Risk';
    return'Lower Risk';
  },

  _stockReturn(st,old,mood){
    const G=window.G;
    const finance=(G?.skills?.finance||0);
    const skillEdge=Math.min(.018,finance*.003);
    const moodRet=this._moodReturn(mood)*(st.beta||1);
    const qualityDrift=(st.quality-1)*0.045;
    const randomShock=(Math.random()-.5)*st.vol;
    const meanReversion=((st.basePrice-old)/Math.max(1,st.basePrice))*0.035;

    let ret=moodRet+qualityDrift+skillEdge+randomShock+meanReversion;

    if(st.sector==='Crypto'){
      if(mood==='crash')ret-=0.18;
      if(mood==='boom')ret+=0.12;
    }

    if(st.sector==='Gold ETF'){
      if(mood==='crash'||mood==='bear')ret+=0.08;
      if(mood==='boom')ret-=0.025;
    }

    if(st.sector==='Consumer Defensive'&&(mood==='crash'||mood==='bear'))ret+=0.035;
    if(st.sector==='Banking'&&mood==='crash')ret-=0.045;

    return Math.max(-0.82,Math.min(1.4,ret));
  },

  tick(){
    const G=window.G;if(!G)return;
    this.init();

    const S=G.stocks;
    const oldValue=this.portfolioValue();
    const mood=this._mood();
    S.marketMood=mood;
    S.marketCycle=(S.marketCycle||0)+1;

    let dividends=0;
    const prices=S.prices;

    STOCK_LIST.forEach(st=>{
      const old=prices[st.id]||st.basePrice;
      const ret=this._stockReturn(st,old,mood);
      const next=Math.max(1,Math.round(old*(1+ret)*100)/100);
      prices[st.id]=next;

      if(!Array.isArray(S.history[st.id]))S.history[st.id]=[];
      S.history[st.id].push(next);
      if(S.history[st.id].length>32)S.history[st.id].shift();

      const held=S.portfolio[st.id]||0;
      if(held>0&&st.div>0){
        dividends+=Math.round(held*next*st.div);
      }
    });

    if(dividends>0){
      G.money=(G.money||0)+dividends;
      S.totalDividends=(S.totalDividends||0)+dividends;
      this._log(`💰 Dividend income: ${fmt(dividends)} received from your portfolio.`, 'money');
    }

    const newValue=this.portfolioValue();
    S.lastYearReturn=oldValue>0?Math.round(((newValue-oldValue+dividends)/oldValue)*1000)/10:0;

    if(mood==='crash')this._log('📉 Market crash year. Risk assets got hit hard.', 'bad');
    else if(mood==='boom')this._log('📈 Market boom year. Investors are euphoric.', 'money');
    else if(oldValue>0&&Math.abs(S.lastYearReturn)>=18){
      this._log(`🌡️ Portfolio moved ${S.lastYearReturn>=0?'+':''}${S.lastYearReturn}% this year.`,S.lastYearReturn>=0?'money':'bad');
    }

    if(newValue>=100000&&!G.achievements?.investor_100k){
      G.achievements=G.achievements||{};
      G.achievements.investor_100k=true;
      this._checkAch();
    }
  },

  portfolioValue(){
    const G=window.G;if(!G)return 0;
    this.init();
    return Math.round(STOCK_LIST.reduce((sum,st)=>sum+((G.stocks.portfolio[st.id]||0)*(G.stocks.prices[st.id]||st.basePrice)),0));
  },

  costBasisValue(){
    const G=window.G;if(!G)return 0;
    this.init();
    return Math.round(Object.entries(G.stocks.portfolio||{}).reduce((sum,[id,qty])=>{
      const price=G.stocks.costBasis[id]||G.stocks.prices[id]||1;
      return sum+(qty||0)*price;
    },0));
  },

  unrealizedPnl(){
    return this.portfolioValue()-this.costBasisValue();
  },

  _positionValue(id){
    const G=window.G;if(!G)return 0;
    this.init();
    const st=STOCK_LIST.find(x=>x.id===id);
    if(!st)return 0;
    return Math.round((G.stocks.portfolio[id]||0)*(G.stocks.prices[id]||st.basePrice));
  },

  _allocation(){
    const total=this.portfolioValue();
    if(total<=0)return[];
    return STOCK_LIST
      .map(st=>({id:st.id,stock:st,value:this._positionValue(st.id),weight:this._positionValue(st.id)/total}))
      .filter(x=>x.value>0)
      .sort((a,b)=>b.value-a.value);
  },

  _riskScore(){
    const alloc=this._allocation();
    if(!alloc.length)return{score:0,label:'No Risk',color:'var(--muted)'};
    const score=Math.round(alloc.reduce((s,a)=>s+(a.stock.vol*100*a.weight*(a.stock.beta||1)),0));
    if(score>=48)return{score,label:'Very Aggressive',color:'var(--red)'};
    if(score>=30)return{score,label:'Aggressive',color:'var(--orange)'};
    if(score>=18)return{score,label:'Balanced Growth',color:'var(--yellow)'};
    return{score,label:'Defensive',color:'var(--green)'};
  },

  _concentration(){
    const alloc=this._allocation();
    if(!alloc.length)return{label:'None',value:0,color:'var(--muted)'};
    const top=alloc[0];
    const pct=Math.round(top.weight*100);
    return{
      label:`${top.id} ${pct}%`,
      value:pct,
      color:pct>=55?'var(--red)':pct>=35?'var(--yellow)':'var(--green)',
    };
  },

  _tradeFee(total){
    const G=window.G;
    const finance=G?.skills?.finance||0;
    total=Math.max(0,this._num(total,0));
    const raw=Math.max(1,Math.round(total*(0.0025-Math.min(.0015,finance*.00025))));
    return Math.min(raw,Math.max(1,Math.round(total*.01)));
  },

  _maxAffordableShares(id,cash){
    const G=window.G;if(!G)return 0;
    this.init();
    const st=STOCK_LIST.find(x=>x.id===id);if(!st)return 0;
    const price=G.stocks.prices[id]||st.basePrice;
    cash=Math.max(0,this._num(cash,G.money||0));
    let shares=Math.floor(cash/Math.max(1,price));
    while(shares>0){
      const subtotal=Math.round(price*shares);
      const fee=this._tradeFee(subtotal);
      if(subtotal+fee<=cash)return shares;
      shares--;
    }
    return 0;
  },

  _diversificationScore(){
    const alloc=this._allocation();
    if(!alloc.length)return{score:0,label:'No portfolio',color:'var(--muted)'};
    const hhi=alloc.reduce((s,a)=>s+(a.weight*a.weight),0);
    const score=Math.round((1-Math.min(1,hhi))*100);
    if(score>=72)return{score,label:'Well diversified',color:'var(--green)'};
    if(score>=48)return{score,label:'Moderate',color:'var(--yellow)'};
    return{score,label:'Concentrated',color:'var(--orange)'};
  },

  _investorNote(){
    const G=window.G;if(!G)return{icon:'📌',title:'No Life Loaded',text:'Start a life to use investing.',color:'var(--muted)'};
    this.init();
    const value=this.portfolioValue();
    const cash=G.money||0;
    const risk=this._riskScore();
    const conc=this._concentration();
    const div=this._diversificationScore();
    const mood=G.stocks.marketMood||'neutral';

    if(value<=0&&cash>=1000)return{icon:'🚀',title:'Start investing',text:'Buy a small first position instead of keeping every dollar in cash.',color:'var(--accent)'};
    if(value<=0)return{icon:'💵',title:'Build cash first',text:'You need more cash before investing makes sense.',color:'var(--muted)'};
    if(conc.value>=60)return{icon:'⚠️',title:'Too concentrated',text:`${conc.label} dominates your portfolio. Consider diversifying.`,color:'var(--orange)'};
    if(risk.score>=50)return{icon:'🔥',title:'Very aggressive',text:'High beta assets can grow fast, but crashes will hurt more.',color:'var(--red)'};
    if(mood==='crash'&&cash>500)return{icon:'🛒',title:'Crash opportunity',text:'Prices are down. Defensive buying or holding can pay off long term.',color:'var(--yellow)'};
    if(div.score>=72)return{icon:'✅',title:'Healthy allocation',text:'Your portfolio is diversified enough for smoother long-term compounding.',color:'var(--green)'};
    return{icon:'📊',title:'Keep compounding',text:'Add gradually, avoid panic selling, and watch concentration risk.',color:'var(--green)'};
  },

  _allocationHTML(){
    const alloc=this._allocation();
    if(!alloc.length)return'';
    const items=alloc.slice(0,6).map(a=>{
      const pct=Math.round(a.weight*100);
      const col=pct>=55?'var(--red)':pct>=35?'var(--yellow)':'var(--green)';
      return`<div style="display:flex;align-items:center;gap:7px;margin:5px 0">
        <span style="width:42px;font-size:10px;font-weight:900;color:var(--txt)">${this._esc(a.id)}</span>
        <div style="flex:1;height:7px;background:var(--s3);border-radius:99px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${col};border-radius:99px"></div></div>
        <span style="width:36px;text-align:right;font-size:10px;font-weight:900;color:${col}">${pct}%</span>
      </div>`;
    }).join('');
    return`<div class="info-box" style="margin-bottom:12px"><p style="margin:0 0 6px"><strong>📌 Allocation Snapshot</strong></p>${items}</div>`;
  },

  buy(id,shares){
    const G=window.G;if(!G)return;
    this.init();

    const st=STOCK_LIST.find(x=>x.id===id);
    if(!st)return;

    shares=Math.max(1,Math.floor(Number(shares)||1));
    const price=G.stocks.prices[id]||st.basePrice;
    const subtotal=Math.round(price*shares);
    const fee=this._tradeFee(subtotal);
    const total=subtotal+fee;

    if((G.money||0)<total){
      this._toast(`Need ${fmt(total)} to buy ${shares} share${shares>1?'s':''}.`);
      return;
    }

    const oldQty=G.stocks.portfolio[id]||0;
    const oldBasis=G.stocks.costBasis[id]||price;

    G.money-=total;
    G.stocks.portfolio[id]=oldQty+shares;
    G.stocks.costBasis[id]=((oldQty*oldBasis)+total)/(oldQty+shares);
    G.stocks.totalBought=(G.stocks.totalBought||0)+total;

    this._log(`📈 Bought ${shares}x ${id} at ${fmt(price)} each. Fee ${fmt(fee)}.`, 'money');
    this._update();
    this.render();
  },

  buyMax(id){
    const G=window.G;if(!G)return;
    this.init();

    const st=STOCK_LIST.find(x=>x.id===id);
    if(!st)return;

    const price=G.stocks.prices[id]||st.basePrice;
    const cash=Math.max(0,G.money||0);
    const shares=this._maxAffordableShares(id,cash);

    if(shares<=0){
      this._toast(`Need at least ${fmt(Math.ceil(price+this._tradeFee(price)))}.`);
      return;
    }

    this.buy(id,shares);
  },

  buyAmount(id,amount){
    const G=window.G;if(!G)return;
    this.init();

    const st=STOCK_LIST.find(x=>x.id===id);
    if(!st)return;

    const price=G.stocks.prices[id]||st.basePrice;
    const shares=Math.floor((Number(amount)||0)/price);

    if(shares<=0){
      this._toast(`Amount too small for ${id}.`);
      return;
    }

    this.buy(id,shares);
  },

  sell(id,shares){
    const G=window.G;if(!G)return;
    this.init();

    const st=STOCK_LIST.find(x=>x.id===id);
    if(!st)return;

    const held=G.stocks.portfolio[id]||0;
    shares=Math.max(1,Math.floor(Number(shares)||1));

    if(held<shares){
      this._toast('Not enough shares!');
      return;
    }

    const price=G.stocks.prices[id]||st.basePrice;
    const subtotal=Math.round(price*shares);
    const fee=this._tradeFee(subtotal);
    const total=Math.max(0,subtotal-fee);
    const profit=Math.round((price-(G.stocks.costBasis[id]||price))*shares-fee);

    G.money=(G.money||0)+total;
    G.stocks.portfolio[id]=held-shares;
    G.stocks.realizedPnl=(G.stocks.realizedPnl||0)+profit;
    G.stocks.totalSold=(G.stocks.totalSold||0)+total;

    if(G.stocks.portfolio[id]<=0){
      delete G.stocks.portfolio[id];
      delete G.stocks.costBasis[id];
    }

    this._log(`📉 Sold ${shares}x ${id} for ${fmt(total)} after fee (${profit>=0?'+':''}${fmt(profit)} realized).`, profit>=0?'money':'bad');
    this._update();
    this.render();
  },

  sellAll(){
    const G=window.G;if(!G)return;
    this.init();

    const ids=Object.keys(G.stocks.portfolio||{}).filter(id=>(G.stocks.portfolio[id]||0)>0);
    if(!ids.length){this._toast('No holdings to sell.');return;}
    if(!this._confirm('Sell your entire stock portfolio?\n\nThis cannot be undone.'))return;

    ids.forEach(id=>this.sell(id,G.stocks.portfolio[id]||0));
  },

  render(){
    const G=window.G;if(!G)return;
    const el=document.getElementById('tab-stocks');if(!el)return;
    this.init();

    const S=G.stocks;
    const port=S.portfolio;
    const prices=S.prices;
    const value=this.portfolioValue();
    const basis=this.costBasisValue();
    const pnl=value-basis;
    const pnlPct=basis>0?Math.round((pnl/basis)*1000)/10:0;
    const mood=S.marketMood||'neutral';
    const moodLabel=this._moodLabel(mood);
    const moodColor=this._moodColor(mood);
    const risk=this._riskScore();
    const concentration=this._concentration();
    const positions=Object.keys(port).filter(id=>(port[id]||0)>0).length;
    const div=this._diversificationScore();
    const note=this._investorNote();

    let h=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      ${this._metricBox('📈 Portfolio',fmtFull(value),pnl>=0?'var(--green)':'var(--red)',`P/L ${pnl>=0?'+':''}${fmt(pnl)} · ${pnlPct>=0?'+':''}${pnlPct}% · ${positions} positions`)}
      ${this._metricBox('🌡️ Market Mood',moodLabel,moodColor,`Last year return ${S.lastYearReturn>=0?'+':''}${S.lastYearReturn||0}%`)}
      ${this._metricBox('⚖️ Risk Profile',risk.label,risk.color,`Risk score ${risk.score}/100 · Top holding ${concentration.label}`)}
      ${this._metricBox('🧩 Diversification',div.label,div.color,`Score ${div.score}/100 · Concentration ${concentration.value}%`)}
      ${this._metricBox('💰 Cashflow',fmt(S.totalDividends||0),'var(--green)',`Dividends lifetime · Realized P/L ${S.realizedPnl>=0?'+':''}${fmt(S.realizedPnl||0)}`)}
      ${this._metricBox('🏦 Invested',fmt(S.totalBought||0),'var(--accent)',`Sold ${fmt(S.totalSold||0)} · Cash ${fmt(G.money||0)}`)}
    </div>`;

    h+=`<div class="info-box" style="border-color:${note.color}55;background:${note.color}10"><p style="margin:0"><strong>${this._esc(note.icon)} Investor Note:</strong> <span style="font-weight:900;color:${note.color}">${this._esc(note.title)}</span> · ${this._esc(note.text)}</p></div>`;
    h+=`<div class="info-box"><p>📊 This is a simplified fictional market sim using real-world inspired names. Finance skill improves long-term drift and lowers trade friction slightly.</p></div>`;
    h+=this._allocationHTML();

    h+=this._renderHoldings(G);
    h+=this._renderMarket(G);

    el.innerHTML=h;
  },

  _metricBox(label,value,color,sub){
    return `<div class="nw-box" style="margin-bottom:0">
      <div class="nw-lbl">${this._esc(label)}</div>
      <div class="nw-amt" style="font-size:20px;color:${color||'var(--txt)'}">${value}</div>
      <div class="nw-sub">${this._esc(sub)}</div>
    </div>`;
  },

  _spark(id){
    const G=window.G;
    const hist=G?.stocks?.history?.[id]||[];
    if(typeof sparklineSVG==='function'&&hist.length>=2){
      const mini=hist.map(v=>({p:v}));
      const last=hist[hist.length-1],prev=hist[0];
      const color=last>=prev?'var(--green)':'var(--red)';
      return sparklineSVG(mini,'p',color,84,26);
    }
    return '';
  },

  _renderHoldings(G){
    const port=G.stocks.portfolio;
    const prices=G.stocks.prices;
    const heldIds=Object.keys(port).filter(k=>(port[k]||0)>0);

    if(!heldIds.length){
      return `<div class="sec">💼 Your Holdings</div><div class="empty"><span class="ei">📈</span><p>No investments yet.<br>Buy shares below to build your portfolio.</p></div>`;
    }

    let h='<div class="sec">💼 Your Holdings</div>';
    heldIds
      .sort((a,b)=>this._positionValue(b)-this._positionValue(a))
      .forEach(id=>{
        const st=STOCK_LIST.find(x=>x.id===id);if(!st)return;
        const price=prices[id]||st.basePrice;
        const qty=port[id]||0;
        const val=Math.round(price*qty);
        const basisPrice=G.stocks.costBasis[id]||price;
        const gain=Math.round((price-basisPrice)*qty);
        const gainPct=basisPrice>0?Math.round(((price-basisPrice)/basisPrice)*1000)/10:0;
        const half=Math.max(1,Math.floor(qty/2));

        h+=`<div class="row-card" style="border-color:${gain>=0?'rgba(74,222,128,.28)':'rgba(248,113,113,.28)'}">
          <span class="ri">${st.icon}</span>
          <div class="rd">
            <div class="rt">${this._esc(st.name)} <span style="font-size:10px;color:var(--muted)">${st.id}</span></div>
            <div class="rs">${qty} shares · Value ${fmt(val)} · Avg ${fmt(basisPrice)} · Now ${fmt(price)} · <strong style="color:${gain>=0?'var(--green)':'var(--red)'}">${gain>=0?'+':''}${fmt(gain)} (${gainPct>=0?'+':''}${gainPct}%)</strong></div>
            <div style="margin-top:4px">${this._spark(id)}</div>
          </div>
          <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
            <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto;background:rgba(248,113,113,.18);border-color:rgba(248,113,113,.4);color:var(--red)" onclick="Stocks.sell('${id}',1)">Sell 1</button>
            <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto;background:rgba(248,113,113,.18);border-color:rgba(248,113,113,.4);color:var(--red)" onclick="Stocks.sell('${id}',${half})">Half</button>
            <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto;background:rgba(248,113,113,.18);border-color:rgba(248,113,113,.4);color:var(--red)" onclick="Stocks.sell('${id}',${qty})">All</button>
          </div>
        </div>`;
      });

    h+=`<div class="act-grid" style="margin-top:10px">
      <div class="card danger" onclick="Stocks.sellAll()"><span class="ci">🚨</span><span class="cn">Sell Entire Portfolio</span><span class="cd">Cash out all holdings</span></div>
    </div>`;

    return h;
  },

  _renderMarket(G){
    const prices=G.stocks.prices;
    const port=G.stocks.portfolio;
    let h='<div class="sec">🏛️ Market</div>';

    STOCK_LIST.forEach(st=>{
      const price=prices[st.id]||st.basePrice;
      const hist=G.stocks.history[st.id]||[];
      const prev=hist.length>=2?hist[hist.length-2]:st.basePrice;
      const chg=prev?((price-prev)/prev*100):0;
      const col=chg>=0?'var(--green)':'var(--red)';
      const held=port[st.id]||0;
      const buy5=Math.round(price*5+this._tradeFee(price*5));

      h+=`<div class="row-card" style="padding:10px 12px">
        <span class="ri">${st.icon}</span>
        <div class="rd">
          <div class="rt">${this._esc(st.name)} <span style="font-size:10px;color:var(--muted)">${st.id} · ${this._esc(st.sector)}</span></div>
          <div class="rs">${this._esc(st.desc)} · ${this._riskLabel(st)}${st.div?` · Dividend ${(st.div*100).toFixed(1)}%`:''}${held?` · Holding ${held}`:''}</div>
          <div style="margin-top:4px">${this._spark(st.id)}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:14px;font-weight:900;color:var(--txt)">${fmt(price)}</div>
          <div style="font-size:10px;font-weight:800;color:${col}">${chg>=0?'▲':'▼'} ${Math.abs(chg).toFixed(1)}%</div>
          <div style="display:flex;gap:4px;justify-content:flex-end;flex-wrap:wrap;margin-top:4px">
            <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto" onclick="Stocks.buy('${st.id}',1)">Buy 1</button>
            <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto" onclick="Stocks.buy('${st.id}',5)">Buy 5</button>
            <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto" onclick="Stocks.buy('${st.id}',10)">Buy 10</button>
            <button class="btn-primary btn-sm" style="font-size:10px;padding:5px 8px;width:auto" onclick="Stocks.buyMax('${st.id}')">Max</button>
          </div>
          <div style="font-size:9px;color:var(--muted);font-weight:700;margin-top:3px">5 shares ≈ ${fmt(buy5)}</div>
        </div>
      </div>`;
    });

    return h;
  },
};