/* js/crime.js — LifeSim v9 */
const Crime={
  render(){
    const G=window.G; if(!G)return;
    const el=document.getElementById('tab-crime');
    let h='';
    if(G.age<16){el.innerHTML='<div class="empty"><span class="ei">👮</span><p>Too young for serious trouble.<br>Come back at 16.</p></div>';return;}
    if(G.inPrison){
      h+=`<div class="prison-banner"><div style="font-size:40px">🔒</div><h3>Serving Prison Time</h3><p>${G.prisonYears} year${G.prisonYears!==1?'s':''} remaining</p></div>
      <div class="act-grid">
        <div class="card" onclick="Crime.prisonAct('study')"><span class="ci">📚</span><span class="cn">Study</span><span class="cd">+Smarts</span></div>
        <div class="card" onclick="Crime.prisonAct('workout')"><span class="ci">🏋️</span><span class="cn">Work Out</span><span class="cd">+Fitness</span></div>
        <div class="card" onclick="Crime.prisonAct('behave')"><span class="ci">😇</span><span class="cn">Good Behaviour</span><span class="cd">Early release?</span></div>
        <div class="card" onclick="Crime.prisonAct('appeal')"><span class="ci">⚖️</span><span class="cn">Legal Appeal</span><span class="cd">Cut sentence (${fmt(sc(5000))})</span></div>
      </div>
      <div class="act-grid" style="margin-top:8px">
        <div class="card" onclick="Crime.prisonAct('gang')"><span class="ci">🤝</span><span class="cn">Join Gang</span><span class="cd">Protection + risk</span></div>
        <div class="card danger" onclick="Crime.prisonAct('escape')"><span class="ci">🏃</span><span class="cn">Escape Attempt</span><span class="cd">Very risky!</span></div>
      </div>`;
      el.innerHTML=h; return;
    }
    if((G.crimes||[]).length){
      h+=`<div class="sec">📋 Criminal Record (${G.crimes.length} offence${G.crimes.length!==1?'s':''})</div>`;
      h+=`<div class="info-box" style="border-color:rgba(248,113,113,.3)"><p style="color:var(--red)">${(G.crimes||[]).slice(-5).join(' · ')}</p></div>`;
    }
    h+=`<div class="sec">🔓 Petty Crimes</div>
    <div class="act-grid">
      <div class="card danger" onclick="Crime.do('shoplift')"><span class="ci">🛍️</span><span class="cn">Shoplift</span><span class="cd">Low risk, small reward</span></div>
      <div class="card danger" onclick="Crime.do('pickpocket')"><span class="ci">👜</span><span class="cn">Pickpocket</span><span class="cd">Quick cash</span></div>
      <div class="card danger" onclick="Crime.do('vandalism')"><span class="ci">🎨</span><span class="cn">Vandalism</span><span class="cd">Thrill</span></div>
      <div class="card danger" onclick="Crime.do('scam')"><span class="ci">📧</span><span class="cn">Online Scam</span><span class="cd">+Money, risky</span></div>
    </div>
    <div class="sec">💰 Serious Crime</div>
    <div class="act-grid">
      <div class="card danger" onclick="Crime.do('robbery')"><span class="ci">🔫</span><span class="cn">Armed Robbery</span><span class="cd">Big risk/reward</span></div>
      <div class="card danger" onclick="Crime.do('burglary')"><span class="ci">🏠</span><span class="cn">Burglary</span><span class="cd">Break and enter</span></div>
      <div class="card danger" onclick="Crime.do('carjack')"><span class="ci">🚗</span><span class="cn">Carjacking</span><span class="cd">Steal vehicle</span></div>
      <div class="card danger" onclick="Crime.do('fraud')"><span class="ci">📊</span><span class="cn">Corporate Fraud</span><span class="cd">White-collar crime</span></div>
    </div>
    <div class="act-grid" style="margin-top:8px">
      <div class="card danger" onclick="Crime.do('drugs_deal')"><span class="ci">💊</span><span class="cn">Drug Dealing</span><span class="cd">Risky trade</span></div>
      <div class="card danger" onclick="Crime.do('bank')"><span class="ci">🏦</span><span class="cn">Bank Robbery</span><span class="cd">Extreme!</span></div>
      <div class="card danger" onclick="Crime.do('hacking')"><span class="ci">💻</span><span class="cn">Hacking</span><span class="cd">Need 60+ Smarts</span></div>
      <div class="card danger" onclick="Crime.do('extortion')"><span class="ci">😤</span><span class="cn">Extortion</span><span class="cd">Intimidation</span></div>
    </div>
    <div class="sec">⚖️ Legal Options</div>
    <div class="row-card" onclick="Crime.expunge()"><span class="ri">📋</span><div class="rd"><div class="rt">Expunge Record</div><div class="rs">Clean your criminal record (${fmt(sc(8000))})</div></div></div>
    <div class="row-card" onclick="Crime.bribe()"><span class="ri">💵</span><div class="rd"><div class="rt">Bribe Officer</div><div class="rs">Make charges disappear (${fmt(sc(3500))})</div></div></div>`;
    el.innerHTML=h;
  },
  do(type){
    const G=window.G; if(G.inPrison){UI.toast('Already in prison!');return;}
    const C={
      shoplift:  {reward:[40,400],    catch:0.14,sentence:[0,1], label:'Shoplifting'},
      pickpocket:{reward:[30,250],    catch:0.19,sentence:[0,1], label:'Pickpocketing'},
      vandalism: {reward:[0,0],       catch:0.17,sentence:[0,1], label:'Vandalism'},
      scam:      {reward:[400,4000],  catch:0.24,sentence:[1,3], label:'Online Fraud'},
      robbery:   {reward:[1000,10000],catch:0.44,sentence:[3,10],label:'Armed Robbery'},
      burglary:  {reward:[500,7000],  catch:0.34,sentence:[2,7], label:'Burglary'},
      carjack:   {reward:[2000,8000], catch:0.48,sentence:[2,6], label:'Carjacking'},
      fraud:     {reward:[5000,50000],catch:0.29,sentence:[3,12],label:'Corporate Fraud'},
      drugs_deal:{reward:[500,9000],  catch:0.35,sentence:[2,8], label:'Drug Trafficking'},
      bank:      {reward:[20000,100000],catch:0.65,sentence:[5,20],label:'Bank Robbery'},
      hacking:   {reward:[2000,35000],catch:0.22,sentence:[1,6], label:'Computer Fraud'},
      extortion: {reward:[1000,18000],catch:0.30,sentence:[2,8], label:'Extortion'},
    };
    const c=C[type]; if(!c)return;
    if(type==='hacking'&&G.smarts<60){UI.toast('Need 60+ Smarts for hacking!');return;}
    if(type==='bank'){if(!G.achievements)G.achievements={};G.achievements.bank_robbed=true;}
    const smartBonus=G.smarts>70?0.85:1.0;
    const luckyBonus=G.trait==='lucky'?0.85:1.0;
    const caught=Math.random()<(c.catch*smartBonus*luckyBonus*(G.country.crimeRate||0.35)*2.8);
    if(caught){
      const yrs=r(c.sentence[0],c.sentence[1]);
      if(!G.crimes)G.crimes=[]; G.crimes.push(c.label);
      G.happiness=cl(G.happiness-20); G.health=cl(G.health-9); G.karma=cl((G.karma||0)-r(8,15),-100,100);
      if(!G.achievements)G.achievements={}; G.achievements.jailbird=true;
      if(yrs===0){G.money=Math.max(0,G.money-sc(r(400,3000)));Engine.log(`👮 Caught ${c.label}! Fined and released with a stern warning.`,'crime');}
      else{G.inPrison=true;G.prisonYears=yrs;if(G.career){Engine.log(`💔 Lost job as ${G.career.title} due to arrest.`,'bad');G.career=null;G.yearsAtJob=0;G.careerCompany='';}Engine.log(`🚔 ARRESTED for ${c.label}! Sentenced to ${yrs} year${yrs!==1?'s':''}.`,'crime');}
      Engine.checkAch();
    } else {
      const rwd=sc(r(c.reward[0],c.reward[1])); G.money+=rwd; G.happiness=cl(G.happiness+r(3,9)); G.karma=cl((G.karma||0)-r(2,5),-100,100);
      const msgs={shoplift:`🛍️ Walked out with ${fmt(rwd)} of goods. Clean getaway.`,pickpocket:`👜 Lifted ${fmt(rwd)} from a pocket. Smooth as silk.`,vandalism:'🎨 Tagged the underpass. Art or crime? Both.',scam:`📧 Scam worked — pocketed ${fmt(rwd)}.`,robbery:`🔫 Armed robbery netted ${fmt(rwd)}.`,burglary:`🏠 Clean break-in, grabbed ${fmt(rwd)}.`,carjack:`🚗 Drove away with a vehicle worth ${fmt(rwd)}.`,fraud:`📊 Corporate fraud cleared ${fmt(rwd)}.`,drugs_deal:`💊 Drug deal earned ${fmt(rwd)}.`,bank:`🏦 BANK ROBBERY! Escaped with ${fmt(rwd)}!!`,hacking:`💻 Hacked and siphoned ${fmt(rwd)}.`,extortion:`😤 Extortion payment of ${fmt(rwd)} received.`};
      Engine.log(msgs[type]||`Crime paid: ${fmt(rwd)}.`,'crime');
    }
    UI.update(); this.render();
  },
  prisonAct(act){
    const G=window.G;
    if(act==='study'){G.smarts=cl(G.smarts+r(3,7));Engine.log('📚 Prison library. Using time wisely.','neutral');}
    else if(act==='workout'){G.fitness=cl((G.fitness||50)+r(4,8));G.health=cl(G.health+r(2,5));Engine.log('🏋️ Prison yard. Getting stronger every day.','neutral');}
    else if(act==='behave'){if(G.prisonYears>1&&Math.random()>0.55){G.prisonYears--;Engine.log('😇 Good behaviour — sentence reduced 1 year!','good');G.happiness=cl(G.happiness+9);}else Engine.log('😇 Good behaviour noted.','neutral');}
    else if(act==='appeal'){const c=sc(5000);if(G.money<c){UI.toast('Need '+fmt(c)+'!');return;}G.money-=c;if(G.prisonYears>2&&Math.random()>0.45){const rd=r(1,Math.min(G.prisonYears-1,3));G.prisonYears-=rd;Engine.log(`⚖️ Appeal successful! Sentence reduced ${rd} years.`,'good');}else Engine.log('⚖️ Appeal failed. Sentence stands.','bad');}
    else if(act==='gang'){if(Math.random()>0.45){G.health=cl(G.health+r(5,10));Engine.log('🤝 Prison gang protection. Safer now.','neutral');}else{G.health=cl(G.health-r(8,16));Engine.log('🤝 Gang initiation was brutal.','bad');}}
    else if(act==='escape'){if(Math.random()<(G.trait==='lucky'?0.18:0.11)){G.inPrison=false;G.prisonYears=0;G.happiness=cl(G.happiness+16);if(!G.achievements)G.achievements={};G.achievements.escaped=true;Engine.log('🏃 ESCAPED! You\'re a fugitive. Stay hidden.','special');Engine.checkAch();}else{G.prisonYears+=r(1,3);G.health=cl(G.health-r(12,22));Engine.log('🚔 Escape failed. Beaten. Extra years added.','bad');}}
    UI.update(); this.render();
  },
  bribe(){const G=window.G;const c=sc(3500);if(G.money<c){UI.toast(`Need ${fmt(c)}!`);return;}if(!G.inPrison&&!(G.crimes||[]).length){UI.toast('No trouble to bribe away!');return;}G.money-=c;if(Math.random()>0.44){if(G.inPrison){G.inPrison=false;G.prisonYears=0;}G.happiness=cl(G.happiness+13);Engine.log('💵 Bribe accepted. Charges quietly dropped. Free.','special');}else{if(G.inPrison)G.prisonYears+=1;Engine.log('👮 Officer took money AND reported bribery. +1 year.','bad');}UI.update();this.render();},
  expunge(){const G=window.G;const c=sc(8000);if(G.money<c){UI.toast(`Need ${fmt(c)}!`);return;}if(!(G.crimes||[]).length){UI.toast('No record to expunge!');return;}G.money-=c;G.crimes=[];G.happiness=cl(G.happiness+10);Engine.log('📋 Criminal record expunged. Fresh start!','good');UI.update();this.render();},
  tick(){const G=window.G;if(!G.inPrison)return;G.prisonYears--;G.happiness=cl(G.happiness-r(6,11));G.stress=cl((G.stress||0)+r(5,10));if(G.prisonYears<=0){G.inPrison=false;G.prisonYears=0;Engine.log('🔓 Released from prison. Time to rebuild.','good');G.happiness=cl(G.happiness+16);G.stress=cl((G.stress||0)-15);}},
};
