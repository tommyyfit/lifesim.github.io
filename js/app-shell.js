(function(){
  'use strict';
  const APP_TITLE='LifeSim';
  const BUILD='release-systems';
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Math.round(Number(v)||0)));
  const n=(v,fb=0)=>Number.isFinite(Number(v))?Number(v):fb;
  const arr=v=>Array.isArray(v)?v:[];
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const cost=(base,G=window.G)=>{try{return typeof annualCost==='function'?annualCost(base,G):Math.round(base);}catch(_){return Math.round(base);}};
  const net=(G)=>{try{return typeof netWorth==='function'?netWorth(G):0;}catch(_){return 0;}};
  const stat=(G,k,d)=>{ if(!G)return; if(k==='money')G.money=Math.max(0,Math.round(n(G.money)+d)); else if(k==='karma')G.karma=clamp(n(G.karma)+d,-100,100); else if(['happiness','health','smarts','looks','fitness','stress','fame','mentalHealth','reputation'].includes(k))G[k]=clamp(n(G[k],k==='stress'?0:50)+d,0,100); };
  const game=()=>window.G||null;
  function ensure(G=game()){
    if(!G)return null;
    if(!G.releaseConnections || typeof G.releaseConnections!=='object')G.releaseConnections={};
    const C=G.releaseConnections;
    if(!C.totals||typeof C.totals!=='object')C.totals={careerYears:0,familyYears:0,assetYears:0,businessYears:0,crimeYears:0,positiveYears:0};
    if(!Array.isArray(C.ledger))C.ledger=[];
    if(!C.flags||typeof C.flags!=='object')C.flags={};
    if(!Number.isFinite(C.lastAppliedSerial))C.lastAppliedSerial=-1;
    C.uiHidden=true;
    return C;
  }
  function propertyValue(G){return arr(G.assets?.properties).reduce((s,p)=>s+n(p.value,p.price||0),0);}
  function vehicleValue(G){return arr(G.assets?.vehicles).reduce((s,v)=>s+n(v.value,v.price||0),0);}
  function debtTotalSafe(G){try{return typeof debtTotal==='function'?debtTotal(G):arr(G.loans).reduce((s,l)=>s+n(l.remaining,l.balance||l.amount||0),0)+n(G.debtCollections);}catch(_){return 0;}}
  function rentalIncome(G){return arr(G.assets?.properties).reduce((s,p)=>s+n(p.rent),0);}
  function avgCondition(G){const items=[...arr(G.assets?.properties),...arr(G.assets?.vehicles)];return items.length?Math.round(items.reduce((s,x)=>s+n(x.condition,80),0)/items.length):100;}
  function dependents(G){return arr(G.rels?.children).filter(c=>c&&c.alive!==false&&n(c.age)<18).length;}
  function partner(G){const p=G.rels?.partner;return p&&p.alive!==false?p:null;}
  function partnerBond(G){const p=partner(G);return p?clamp(n(p.love,p.trust||p.relationship||60)):0;}
  function careerSalary(G){return n(G.career?.salary,G.salary||0);}
  function businessProfit(G){const b=G.business;return b?Math.round(n(b.revenue)-n(b.expenses)):0;}
  function businessHealthScore(G){const b=G.business;if(!b)return 0;const margin=n(b.revenue)>0?((n(b.revenue)-n(b.expenses))/Math.max(1,n(b.revenue)))*100:0;return clamp((n(b.brand,50)*.25)+(n(b.quality,50)*.25)+(n(b.systems,40)*.2)+(n(b.morale,50)*.15)+(Math.max(0,margin)*.15));}
  function crimeHeat(G){return clamp(n(G.crimeHeat));}
  function crimeRecord(G){return arr(G.crimes).length+(G.inPrison?3:0);}
  function applyCareer(G,C){
    const has=!!G.career, salary=careerSalary(G), perf=clamp(n(G.jobPerf,has?50:0)); let tone='neutral';
    if(has){C.totals.careerYears++;let stress=Math.min(4,Math.max(1,Math.round(salary/Math.max(1,cost(42000,G))))); if(G.remoteWork)stress=Math.max(0,stress-1); if(perf<45)stress+=1; stat(G,'stress',stress); if(perf>=75){stat(G,'reputation',1);stat(G,'fame',1);} if(perf<35)stat(G,'reputation',-1); tone=stress>=4?'warn':'good';}
    else if((G.age||0)>=18 && !G.inSchool && !G.inUniversity){stat(G,'stress',1);stat(G,'happiness',-1); tone='warn';}
    return tone;
  }
  function applyFamily(G,C){
    const p=partner(G), kids=dependents(G), bond=partnerBond(G); let happy=0, expense=0, tone='neutral';
    if(p){C.totals.familyYears++; happy+=(bond>=70?2:bond>=45?1:-2); tone=bond>=45?'good':'warn';}
    if(kids){C.totals.familyYears++; expense=cost(2600,G)*kids; happy+=Math.min(4,kids*2); tone='good';}
    if(expense){G.money=Math.max(0,Math.round(n(G.money)-expense));G.lastFamilyExpense=expense;if(n(G.money)<expense*.8)stat(G,'stress',2);} if(happy)stat(G,'happiness',happy);
    G.familyLegacyScore=clamp(n(G.familyLegacyScore)+Math.max(0,(p?Math.round(bond/18):0)+(kids*2)),0,100);
    if(G.familyLegacyScore>=75)C.flags.family_anchor=true;
    return tone;
  }
  function applyAssets(G,C){
    const pv=propertyValue(G),vv=vehicleValue(G),debt=debtTotalSafe(G),rent=rentalIncome(G),cond=avgCondition(G),nw=net(G);
    const lifestyle=clamp((pv>0?22:0)+(vv>0?12:0)+Math.min(28,Math.round(rent/Math.max(1,cost(2500,G))))+Math.min(28,Math.round(Math.max(0,nw)/Math.max(1,cost(20000,G)))));
    const risk=clamp((debt>0?Math.round(debt/Math.max(1,Math.max(nw,1)+debt)*70):0)+(cond<65?(65-cond):0));
    G.lifestyleScore=lifestyle;G.assetRiskScore=risk;G.lastAssetNetWorth=nw; if(pv||vv||rent)C.totals.assetYears++;
    if(lifestyle>=65){stat(G,'happiness',1);stat(G,'fame',1);} if(risk>=65)stat(G,'stress',2);
    if(lifestyle>=70&&risk<=35)C.flags.lifestyle_builder=true;
    return risk>=65?'bad':lifestyle>=60?'good':'neutral';
  }
  function applyBusiness(G,C){
    const b=G.business;if(!b)return 'neutral';C.totals.businessYears++; const profit=businessProfit(G), health=businessHealthScore(G);
    stat(G,'stress',profit<0?3:(health>=70?-1:1)); stat(G,'reputation',health>=70?2:profit<0?-1:1); if(profit>cost(50000,G))stat(G,'fame',1); if(health>=80)C.flags.reputation_business=true;
    return profit<0?'warn':health>=70?'good':'neutral';
  }
  function applyCrime(G,C){
    const heat=crimeHeat(G),record=crimeRecord(G),has=record>0||heat>0||n(G.underworldRep)>0;if(!has)return 'good';C.totals.crimeYears++;
    if(heat>=55){stat(G,'stress',3);stat(G,'reputation',-2);} if(record>0&&G.career)G.jobPerf=clamp(n(G.jobPerf,50)-Math.min(6,record)); if((heat>=65||record>=3)&&partner(G))stat(G,'happiness',-2);
    if(record>=3)C.flags.crime_consequence=true; if(record>0&&heat<15&&n(G.reputation)>60)C.flags.clean_comeback=true;
    return heat>=65?'bad':record?'warn':'neutral';
  }
  function tick(){
    const G=game(); if(!G||!G.alive)return; const C=ensure(G); if(!C)return; const serial=n(G.ageUpSerial,G.age||0); if(C.lastAppliedSerial===serial)return; if((G.age||0)<16){C.lastAppliedSerial=serial;return;}
    const before={money:n(G.money),nw:net(G),stress:n(G.stress),happy:n(G.happiness),rep:n(G.reputation),jobPerf:n(G.jobPerf,50)};
    const tones=[applyCareer(G,C),applyFamily(G,C),applyAssets(G,C),applyBusiness(G,C),applyCrime(G,C)]; if(tones.filter(x=>x==='good').length>=3&&!tones.includes('bad'))C.totals.positiveYears++;
    const after={money:n(G.money),nw:net(G),stress:n(G.stress),happy:n(G.happiness),rep:n(G.reputation),jobPerf:n(G.jobPerf,50)};
    C.yearly={age:G.age,serial,moneyDelta:after.money-before.money,netWorthDelta:after.nw-before.nw,stressDelta:after.stress-before.stress,happinessDelta:after.happy-before.happy,reputationDelta:after.rep-before.rep,jobPerfDelta:after.jobPerf-before.jobPerf,tones};
    C.ledger.unshift({age:G.age,year:G.year||0,type:'connection',title:'Background life systems updated',delta:C.yearly,ts:Date.now()}); C.ledger=C.ledger.slice(0,40); C.lastAppliedSerial=serial;
    try{Engine.checkAch?.();}catch(_){}
  }
  function addAchievements(){
    try{if(typeof ACHIEVEMENTS!=='undefined'){const add=a=>{if(!ACHIEVEMENTS.some(x=>x.id===a.id))ACHIEVEMENTS.push(a);};
      add({id:'release_connected_5',icon:'🔗',name:'Connected Life',desc:'Live 5 years with connected systems active',rarity:'rare',check:G=>n(G.releaseConnections?.lastAppliedSerial)>=0&&(n(G.releaseConnections?.totals?.careerYears)+n(G.releaseConnections?.totals?.familyYears)+n(G.releaseConnections?.totals?.assetYears)+n(G.releaseConnections?.totals?.businessYears)+n(G.releaseConnections?.totals?.crimeYears))>=5});
      add({id:'release_family_anchor',icon:'👨‍👩‍👧',name:'Family Anchor',desc:'Build a family legacy score of 75+',rarity:'epic',check:G=>n(G.familyLegacyScore)>=75});
      add({id:'release_lifestyle_builder',icon:'🏠',name:'Lifestyle Builder',desc:'Reach 70+ lifestyle score with low asset risk',rarity:'rare',check:G=>n(G.lifestyleScore)>=70&&n(G.assetRiskScore)<=35});
      add({id:'release_business_reputation',icon:'🏢',name:'Respected Operator',desc:'Run a strong business that boosts reputation',rarity:'epic',check:G=>!!G.releaseConnections?.flags?.reputation_business});
      add({id:'release_clean_comeback',icon:'🌅',name:'Clean Comeback',desc:'Recover reputation after a criminal record',rarity:'legendary',check:G=>!!G.releaseConnections?.flags?.clean_comeback});
      add({id:'release_balanced_years',icon:'⚖️',name:'Balanced Operator',desc:'Have 8 positive connected years',rarity:'epic',check:G=>n(G.releaseConnections?.totals?.positiveYears)>=8});
    }}catch(e){console.warn('[release systems achievements]',e);}
  }
  function removeOldPanels(root=document){
    try{$$('.release-system-panel,.release-life-overview',root).forEach(el=>el.remove());}catch(_){}
  }
  function patchEngine(){
    if(window.Engine&&Array.isArray(Engine._moduleOrder)){
      Engine._moduleOrder=Engine._moduleOrder.filter(x=>x!=='ReleaseConnections.tick'&&x!=='ReleaseSystems.tick');
      if(!Engine._moduleOrder.includes('LifeSystems.tickYear'))Engine._moduleOrder.push('ReleaseSystems.tick');
    }
  }
  function patchRelationshipLabels(){
    if(!window.Relations||Relations._releasePhase25Labels)return;
    if(Relations._smallCard){const old=Relations._smallCard.bind(Relations);Relations._smallCard=function(icon,name,desc,onclick,...rest){if(name==='Private Time'){icon='💞';name='Romantic Night';desc='Condom choice';} if(desc==='Safe with stable partner')desc='Condom choice';return old(icon,name,desc,onclick,...rest);};}
    Relations._chooseProtection=function(cb,opts={}){if(!window.UI?.askChoice){cb(true);return;}const partner=opts.partner||null;const stable=!!opts.stablePartner||(this._stablePartnerNoHealthRisk&&partner&&this._stablePartnerNoHealthRisk(partner));UI.askChoice({icon:'🛡️',title:'Romantic Night',text:stable?'Choose condom option. Stable partner does not create random health-risk events.':'Choose condom option. Condom lowers pregnancy and health uncertainty.',choices:[{value:true,label:'Use Condom',sub:'Lower pregnancy chance. Best default choice.'},{value:false,label:'Without Condom',sub:stable?'Higher pregnancy chance. No random disease event in stable relationship.':'Higher uncertainty. Use only when it makes sense.',danger:!stable}]},cb);};
    Relations._releasePhase25Labels=true;
  }
  function patchUIChoiceCopy(){
    if(!window.UI||UI._releaseChoiceChoiceCopy)return; const old=UI.askChoice?.bind(UI); if(old){UI.askChoice=function(opts,cb){if(opts&&/Protection Choice|Relationship Wellness Choice|Wellbeing Choice|Private Time|Romantic Night/i.test(String(opts.title||''))){opts={...opts,title:'Romantic Night'}; if(Array.isArray(opts.choices)){opts.choices=opts.choices.map(c=>{const l=String(c.label||'');if(/Use Protection/i.test(l))return {...c,label:'Use Condom'};if(/Do Not Use Protection/i.test(l))return {...c,label:'Without Condom'};return c;});}} return old(opts,cb);};} UI._releaseChoiceChoiceCopy=true;
  }
  function restoreStaticLabels(root=document){
    try{
      $$('[data-label]',root).forEach(el=>{
        const label=(el.getAttribute('data-label')||'').trim();
        if(label&&!el.children.length)el.textContent=label;
      });
    }catch(_){}
  }
  function setLabels(){
    try{
      document.body.classList.add('release-layout','release-sections','release-shell');
      document.body.classList.remove('release-shell-previous','release-shell-previous');
      $$('.release-phase-pill').forEach(el=>el.remove());
      restoreStaticLabels(document);
    }catch(_){}
  }
  function stripPhaseLabels(root=document){
    try{
      $$('.release-phase-pill',root).forEach(el=>el.remove());
      restoreStaticLabels(root);
    }catch(_){}
  }
  function boot(){
    if(window._releasePhase25BootDone)return;
    window._releasePhase25BootDone=true;
    if(window.App)window.App.VERSION=1;
    const app=document.getElementById('app');
    if(app){
      app.setAttribute('data-build',BUILD);
      app.setAttribute('data-version','release');
    }
    addAchievements();
    setLabels();
    stripPhaseLabels(document);
    patchEngine();
    patchRelationshipLabels();
    patchUIChoiceCopy();
    removeOldPanels();
    setTimeout(removeOldPanels,100);
    setTimeout(removeOldPanels,500);
  }
  window.ReleaseSystems={BUILD,ensure,tick,boot,removeOldPanels};
  window.ReleaseConnections={BUILD,ensure,tick,injectPanel:()=>{},injectLifeOverview:()=>{},connectionHTML:()=>''};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
  window.addEventListener('load',()=>{boot();setTimeout(boot,250);});
})();
