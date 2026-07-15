'use strict';

/* js/helpers.js — LifeSim safer global helper utilities */

function num(v,fallback=0){
  const n=Number(v);
  return Number.isFinite(n)?n:fallback;
}

function r(a,b){
  a=Math.round(num(a));b=Math.round(num(b));
  if(b<a){const t=a;a=b;b=t;}
  return Math.floor(Math.random()*(b-a+1))+a;
}

function pick(arr){
  if(!Array.isArray(arr)||!arr.length)return null;
  return arr[Math.floor(Math.random()*arr.length)];
}

function cl(v,mn=0,mx=100){
  v=num(v,mn);mn=num(mn,0);mx=num(mx,100);
  if(mx<mn){const t=mn;mn=mx;mx=t;}
  return Math.min(mx,Math.max(mn,Math.round(v)));
}

function cap(s){
  s=String(s??'');
  return s?s.charAt(0).toUpperCase()+s.slice(1):'';
}

function escHTML(v){
  return String(v??'').replace(/[&<>'"]/g,c=>({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    "'":'&#39;',
    '"':'&quot;'
  }[c]));
}

function safeCall(label,fn,fallback=null){
  try{return typeof fn==='function'?fn():fallback;}
  catch(e){console.warn(label||'safeCall failed',e);return fallback;}
}

function countryCurrency(G=typeof window!=='undefined'?window.G:null){
  return (G&&G.country&&G.country.currency)||'$';
}

function countryCostMult(G=typeof window!=='undefined'?window.G:null){
  return Math.max(0.2,num(G?.country?.costMult,G?.country?.mult,1));
}

function countrySalaryMult(G=typeof window!=='undefined'?window.G:null){
  return Math.max(0.2,num(G?.country?.salaryMult,G?.country?.costMult,G?.country?.mult,1));
}

function countryWealthMult(G=typeof window!=='undefined'?window.G:null){
  return Math.max(0.15,num(G?.country?.wealthMult,G?.country?.salaryMult,G?.country?.costMult,G?.country?.mult,1));
}

function countryMult(G=typeof window!=='undefined'?window.G:null){
  return countryCostMult(G);
}

function sc(base,G=typeof window!=='undefined'?window.G:null){
  return Math.round(num(base)*countryCostMult(G));
}

function salaryScale(base,G=typeof window!=='undefined'?window.G:null){
  return Math.round(num(base)*countrySalaryMult(G));
}

function wealthScale(base,G=typeof window!=='undefined'?window.G:null){
  return Math.round(num(base)*countryWealthMult(G));
}

function diffCostMult(G=typeof window!=='undefined'?window.G:null){
  const d=(G&&G.difficulty)||'normal';
  const diff=({easy:.85,normal:1,hard:1.2,extreme:1.45,custom:1}[d]||1);
  const trait=G&&G.trait==='frugal'?.9:1;
  return diff*trait;
}

function annualCost(base,G=typeof window!=='undefined'?window.G:null){
  return Math.round(sc(base,G)*diffCostMult(G));
}

function creditClamp(v){
  return Math.max(300,Math.min(850,Math.round(num(v,650))));
}

function fmt(n,G=typeof window!=='undefined'?window.G:null){
  const s=countryCurrency(G);
  n=num(n,0);
  const abs=Math.abs(Math.round(n));
  let str;
  if(abs>=1000000000)str=(abs/1000000000).toFixed(abs>=10000000000?0:1)+'B';
  else if(abs>=1000000)str=(abs/1000000).toFixed(abs>=10000000?0:1)+'M';
  else if(abs>=10000)str=(abs/1000).toFixed(0)+'K';
  else str=abs.toLocaleString();
  return(n<0?'-':'')+s+str;
}

function fmtFull(n,G=typeof window!=='undefined'?window.G:null){
  const s=countryCurrency(G);
  n=num(n,0);
  return(n<0?'-':'')+s+Math.abs(Math.round(n)).toLocaleString();
}

function fmtFollowers(n){
  n=Math.max(0,Math.round(num(n,0)));
  if(n>=1000000000)return(n/1000000000).toFixed(1)+'B';
  if(n>=1000000)return(n/1000000).toFixed(1)+'M';
  if(n>=1000)return(n/1000).toFixed(0)+'K';
  return n.toString();
}

function fmtPct(n,digits=0){
  return `${num(n,0).toFixed(digits)}%`;
}

function sumValues(arr,key='value'){
  if(!Array.isArray(arr))return 0;
  return arr.reduce((a,x)=>a+num(x?.[key],0),0);
}

function stockPortfolioValue(G=window.G){
  let sv=0;
  if(G?.stocks?.portfolio&&G?.stocks?.prices){
    for(const[id,qty]of Object.entries(G.stocks.portfolio)){
      sv+=Math.round(num(qty,0)*num(G.stocks.prices[id],0));
    }
  }
  return sv;
}

function debtTotal(G=window.G){
  if(!G)return 0;
  return (Array.isArray(G.loans)?G.loans:[]).reduce((a,l)=>a+num(l.remaining,0),0)+num(G.debtCollections,0);
}

function netWorth(G){
  if(!G)return 0;
  const pv=sumValues(G.assets?.properties,'value');
  const vv=sumValues(G.assets?.vehicles,'value');
  const bv=G.business?num(G.business.value,0):0;
  const sv=stockPortfolioValue(G);
  const debt=debtTotal(G);
  return num(G.money,0)+pv+vv+bv+sv-debt;
}

function applyStats(G,eff){
  if(!eff||!G)return;
  Object.entries(eff).forEach(([k,v])=>{
    v=num(v,0);
    if(k==='money')G.money=Math.max(0,Math.round(num(G.money,0)+v));
    else if(k==='fitness')G.fitness=cl(num(G.fitness,50)+v);
    else if(k==='fame')G.fame=cl(num(G.fame,0)+v);
    else if(k==='stress')G.stress=cl(num(G.stress,0)+v,0,100);
    else if(k==='karma')G.karma=cl(num(G.karma,0)+v,-100,100);
    else if(k==='mentalHealth')G.mentalHealth=cl(num(G.mentalHealth,60)+v);
    else if(k==='reputation')G.reputation=cl(num(G.reputation,50)+v);
    else if(k==='schoolPerformance')G.schoolPerformance=cl(num(G.schoolPerformance,50)+v);
    else if(k==='parentBond'){
      [G.rels?.father,G.rels?.mother].filter(Boolean).forEach(parent=>parent.love=cl(num(parent.love,50)+v));
    }
    else if(['happiness','health','smarts','looks'].includes(k))G[k]=cl(num(G[k],50)+v);
  });
}

function dependentChildrenCount(G){
  return (G?.rels?.children||[]).filter(c=>c&&c.alive!==false&&num(c.age,0)<18).length;
}

function cohabitingPartner(G){
  const p=G?.rels?.partner;
  if(!p||p.alive===false)return false;
  const st=p.stage||(p.married?'married':'dating');
  return st==='serious'||st==='engaged'||st==='married';
}

function householdSize(G){
  if(!G)return 1;
  return 1+(cohabitingPartner(G)?1:0)+dependentChildrenCount(G);
}

function moneyBenchmark(G){
  if(!G||num(G.age,0)<18)return null;
  const age=num(G.age,18);
  const tiers=[
    [18,24,15000],
    [25,34,90000],
    [35,44,240000],
    [45,54,500000],
    [55,64,850000],
    [65,200,1200000],
  ];
  let base=15000;
  for(const[lo,hi,v]of tiers){
    if(age>=lo&&age<=hi){base=v;break;}
  }

  const rawCountryMult=num(G.country?.mult,1);
  const cMult=Math.max(.6,Math.min(1.35,rawCountryMult));
  const diffMult={easy:1.4,normal:1,hard:.82,extreme:.68,custom:1}[G.difficulty||'normal']||1;
  const ambitionMult={wealth:1.12,investor:1.16,career_top:1.08,entrepreneur:1.1}[G.ambition]||1;
  const hMult=1+((householdSize(G)-1)*.18);
  const livingReserve=annualCost(14000,G)*Math.max(1,householdSize(G))*2.2;
  const benchmark=Math.max(base*cMult*diffMult*ambitionMult*hMult,livingReserve);
  const nw=netWorth(G);
  const ratio=benchmark>0?nw/benchmark:0;

  if(ratio>=3.4)return{label:'Top 1%',icon:'🚀',color:'var(--green)',ratio,benchmark};
  if(ratio>=2.15)return{label:'Top 10%',icon:'🏆',color:'var(--green)',ratio,benchmark};
  if(ratio>=1.2)return{label:'Comfortable',icon:'📈',color:'var(--teal)',ratio,benchmark};
  if(ratio>=.75)return{label:'Stable',icon:'📊',color:'var(--muted)',ratio,benchmark};
  if(ratio>=.35)return{label:'Behind',icon:'📉',color:'var(--orange)',ratio,benchmark};
  return{label:'Struggling',icon:'⚠️',color:'var(--red)',ratio,benchmark};
}

function clamp01(v){
  return Math.max(0,Math.min(1,num(v,0)));
}

function weightedPick(items,weightKey='weight'){
  if(!Array.isArray(items)||!items.length)return null;
  const total=items.reduce((a,x)=>a+Math.max(0,num(typeof weightKey==='function'?weightKey(x):x?.[weightKey],1)),0);
  if(total<=0)return pick(items);
  let roll=Math.random()*total;
  for(const item of items){
    roll-=Math.max(0,num(typeof weightKey==='function'?weightKey(item):item?.[weightKey],1));
    if(roll<=0)return item;
  }
  return items[items.length-1];
}

function uid(prefix='id'){
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
}

function logCategory(entry){
  const text=String(entry?.text||'');
  const t=text.toLowerCase();
  const type=entry?.type||'neutral';

  if(type==='special'||/born|married|wedding|engaged|pregnan|founded|ambition|goal complete|graduated|arrest|escaped|milestone|promoted|unicorn|ipo/.test(t))
    return'highlight';

  if(type==='money'||/salary|earn|pension|invest|stock|profit|revenue|rent|loan|credit|bill|alimony|claim|food paid|food budget|prize|won \$|lost \$|net worth|bank|business|sold|bought|mortgage|debt/.test(t)||/💰|💵|💸|📈|🪦|💳|🏦/.test(text))
    return'money';

  if(/health|hospital|doctor|meditat|gym|workout|yoga|hike|run|swim|sick|cancer|stroke|diagnos|therapy|stress|burnout|rehab|sti|std|food|diet|diabetes|obesity|nutrition|surgery|screening|addiction|smoking|alcohol/.test(t)||/❤️|🏥|🧘|🏋️|🏊|🏃|💊|🚬|🍺|🥗|🧠/.test(text))
    return'health';

  if(/career|job|hired|fired|promoted|raise|salary|retired|universit|vocational|internship|quit|resigned|course|education|study/.test(t)||/💼|🎓|🏛️|🏖️|📚/.test(text))
    return'career';

  if(/married|engaged|partner|child|baby|pregnan|sibling|father|mother|family|son|daughter|love|friend|divorce|broke up|passed away|died|dating|chemistry|intimacy/.test(t)||/💍|👶|❤️|👨‍👩|💑/.test(text))
    return'family';

  if(/crime|arrest|prison|police|court|fraud|stole|robbery|jail|sentence/.test(t)||/🚓|🔒|⚖️|😈/.test(text))
    return'crime';

  return'other';
}

function sparklineSVG(history,key,color,w,h){
  if(!Array.isArray(history)||history.length<2)return'';
  w=Math.max(20,num(w,80));
  h=Math.max(10,num(h,24));
  const vals=history.map(s=>num(s?.[key],50));
  const mn=Math.min(...vals),mx=Math.max(...vals);
  const range=mx-mn||10;
  const pts=vals.map((v,i)=>{
    const x=(i/(vals.length-1))*w;
    const y=h-((v-mn)/range)*h;
    return`${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return`<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:inline-block;vertical-align:middle;opacity:.7"><polyline points="${pts}" fill="none" stroke="${escHTML(color||'currentColor')}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}

if(typeof window!=='undefined'){
  Object.assign(window,{
    num,r,pick,cl,cap,escHTML,safeCall,countryCurrency,countryCostMult,countrySalaryMult,countryWealthMult,countryMult,sc,salaryScale,wealthScale,diffCostMult,annualCost,
    creditClamp,fmt,fmtFull,fmtFollowers,fmtPct,sumValues,stockPortfolioValue,debtTotal,netWorth,
    applyStats,dependentChildrenCount,cohabitingPartner,householdSize,moneyBenchmark,logCategory,
    sparklineSVG,clamp01,weightedPick,uid
  });
}
