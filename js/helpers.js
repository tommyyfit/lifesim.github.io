/* js/helpers.js — LifeSim v9 — MUST LOAD FIRST */
'use strict';
function r(a,b){return Math.floor(Math.random()*(b-a+1))+a;}
function pick(arr){if(!arr||!arr.length)return null;return arr[Math.floor(Math.random()*arr.length)];}
function cl(v,mn=0,mx=100){return Math.min(mx,Math.max(mn,Math.round(v)));}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):'';}

function sc(base){const G=window.G;return Math.round(base*((G&&G.country)?G.country.mult:1));}
function fmt(n){
  const G=window.G,s=(G&&G.country)?G.country.currency:'$';
  const abs=Math.abs(Math.round(n));
  let str;
  if(abs>=1000000000)str=(abs/1000000000).toFixed(1)+'B';
  else if(abs>=1000000)str=(abs/1000000).toFixed(1)+'M';
  else if(abs>=10000)str=(abs/1000).toFixed(0)+'K';
  else str=abs.toLocaleString();
  return(n<0?'-':'')+s+str;
}
function fmtFull(n){
  const G=window.G,s=(G&&G.country)?G.country.currency:'$';
  return(n<0?'-':'')+s+Math.abs(Math.round(n)).toLocaleString();
}
function fmtFollowers(n){
  if(n>=1000000)return(n/1000000).toFixed(1)+'M';
  if(n>=1000)return(n/1000).toFixed(0)+'K';
  return n.toString();
}
function netWorth(G){
  if(!G)return 0;
  const pv=(G.assets?.properties||[]).reduce((a,p)=>a+(p.value||0),0);
  const vv=(G.assets?.vehicles||[]).reduce((a,v)=>a+(v.value||0),0);
  const bv=G.business?(G.business.value||0):0;
  let sv=0;
  if(G.stocks?.portfolio&&G.stocks?.prices){
    for(const[id,qty]of Object.entries(G.stocks.portfolio)){
      sv+=Math.round((qty||0)*(G.stocks.prices[id]||0));
    }
  }
  return(G.money||0)+pv+vv+bv+sv;
}
function applyStats(G,eff){
  if(!eff||!G)return;
  const map={happiness:1,health:1,smarts:1,looks:1,money:1,fitness:1,fame:1,stress:1,karma:1};
  Object.entries(eff).forEach(([k,v])=>{
    if(k==='money')G.money=Math.max(0,Math.round((G.money||0)+v));
    else if(k==='partnerLove'&&G.rels?.partner)G.rels.partner.love=cl((G.rels.partner.love||50)+v);
    else if(k==='partnerIntimacy'&&G.rels?.partner)G.rels.partner.intimacy=cl((G.rels.partner.intimacy||50)+v);
    else if(k==='safeDating'){
      if(!G.sexualHealth)G.sexualHealth={std:false};
      G.sexualHealth.safeDating=Math.max(0,(G.sexualHealth.safeDating||0)+v);
    }
    else if(k==='fitness')G.fitness=cl((G.fitness||50)+v);
    else if(k==='fame')G.fame=cl((G.fame||0)+v);
    else if(k==='stress')G.stress=cl((G.stress||0)+v,0,100);
    else if(k==='karma')G.karma=cl((G.karma||0)+v,-100,100);
    else if(map[k])G[k]=cl((G[k]||0)+v);
  });
}
