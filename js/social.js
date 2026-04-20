/* js/social.js — LifeSim v9 */
const Social={
  render(){
    const G=window.G; if(!G)return;
    const el=document.getElementById('tab-social');
    const f=G.followers||0; const fame=G.fame||0;
    const tier=f>=1000000?{label:'Mega Influencer',icon:'💎',c:'var(--yellow)'}:f>=100000?{label:'Macro Influencer',icon:'⭐',c:'var(--accent)'}:f>=10000?{label:'Micro Influencer',icon:'🌟',c:'var(--cyan)'}:f>=1000?{label:'Nano Influencer',icon:'✨',c:'var(--pink)'}:{label:'Regular Person',icon:'👤',c:'var(--muted)'};
    const annualEarnings=Math.floor(f*0.01);
    let h=`<div class="fame-card">
      <div style="font-size:26px">${tier.icon}</div>
      <div style="font-size:24px;font-weight:900;color:${tier.c};margin:4px 0">${fmtFollowers(f)}</div>
      <div style="font-size:10px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:1px">Followers · ${tier.label}</div>
      ${annualEarnings>0?`<div style="color:var(--green);font-size:13px;font-weight:800;margin-top:5px">Earning ${fmt(annualEarnings)}/yr</div>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">🌟 Fame</div><div class="nw-amt" style="font-size:20px">${fame}%</div></div>
      <div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">💰 Lifetime Earned</div><div class="nw-amt" style="font-size:16px">${fmt(G.socialEarnings||0)}</div></div>
    </div>`;

    h+=`<div class="sec">📱 Content Creation</div>
    <div class="act-grid">
      <div class="card" onclick="Social.post('photo')"><span class="ci">📸</span><span class="cn">Post Photo</span><span class="cd">+Followers</span></div>
      <div class="card" onclick="Social.post('video')"><span class="ci">🎬</span><span class="cn">Post Video</span><span class="cd">+Followers big</span></div>
      <div class="card" onclick="Social.post('reel')"><span class="ci">🎞️</span><span class="cn">Short Reel</span><span class="cd">Viral potential</span></div>
      <div class="card" onclick="Social.post('blog')"><span class="ci">✍️</span><span class="cn">Write Blog</span><span class="cd">+Smarts +Follow</span></div>
    </div>
    <div class="act-grid" style="margin-top:8px">
      <div class="card" onclick="Social.post('podcast')"><span class="ci">🎙️</span><span class="cn">Podcast</span><span class="cd">+Followers +Income</span></div>
      <div class="card" onclick="Social.post('live')"><span class="ci">📡</span><span class="cn">Go Live</span><span class="cd">+Followers +Tips</span></div>
      <div class="card" onclick="Social.post('collab')"><span class="ci">🤝</span><span class="cn">Collaborate</span><span class="cd">+Followers (1K+ req)</span></div>
      <div class="card" onclick="Social.post('sponsored')"><span class="ci">💰</span><span class="cn">Sponsored Post</span><span class="cd">+Money (10K+ req)</span></div>
    </div>
    <div class="sec">⭐ Fame Building</div>
    <div class="act-grid">
      <div class="card" onclick="Social.fame('interview')"><span class="ci">📰</span><span class="cn">Press Interview</span><span class="cd">+Fame +Followers</span></div>
      <div class="card" onclick="Social.fame('event')"><span class="ci">🎪</span><span class="cn">Public Event</span><span class="cd">+Fame +Looks (${fmt(sc(200))})</span></div>
      <div class="card" onclick="Social.fame('charity')"><span class="ci">🤲</span><span class="cn">Charity Campaign</span><span class="cd">+Fame +Hap +Karma</span></div>
      <div class="card" onclick="Social.fame('scandal')"><span class="ci">🔥</span><span class="cn">Court Controversy</span><span class="cd">±Fame big risk</span></div>
    </div>
    <div class="sec">💼 Monetization</div>
    <div class="act-grid">
      <div class="card" onclick="Social.monetize('merch')"><span class="ci">👕</span><span class="cn">Launch Merch</span><span class="cd">+Income (10K+ req)</span></div>
      <div class="card" onclick="Social.monetize('course')"><span class="ci">🎓</span><span class="cn">Online Course</span><span class="cd">+Income (55+ Smart)</span></div>
      <div class="card" onclick="Social.monetize('book')"><span class="ci">📚</span><span class="cn">Write Book</span><span class="cd">+Fame +Income</span></div>
      <div class="card" onclick="Social.monetize('app')"><span class="ci">📱</span><span class="cn">Launch App</span><span class="cd">+Income (60+ Smart)</span></div>
    </div>`;
    el.innerHTML=h;
  },

  post(type){
    const G=window.G;
    const viralChance=G.trait==='lucky'?0.12:0.08;
    const viral=Math.random()<viralChance;
    let gain=0,msg='';
    const looksBonus=G.looks>70?1.15:1.0;
    if(type==='photo'){gain=viral?r(5000,25000):r(50,600);msg=viral?`📸 VIRAL photo! +${fmtFollowers(gain)} followers!`:`📸 Photo posted. +${fmtFollowers(gain)} followers.`;}
    else if(type==='video'){gain=viral?r(20000,120000):r(200,2500);msg=viral?`🎬 VIDEO EXPLODED! +${fmtFollowers(gain)} followers!`:`🎬 Video performed well. +${fmtFollowers(gain)}.`;}
    else if(type==='reel'){gain=viral?r(50000,600000):r(500,6000);msg=viral?`🎞️ REEL MEGA VIRAL! +${fmtFollowers(gain)} followers!!`:`🎞️ Reel got traction. +${fmtFollowers(gain)}.`;}
    else if(type==='blog'){gain=r(30,400);G.smarts=cl(G.smarts+r(1,3));msg=`✍️ Blog post published. +${fmtFollowers(gain)} followers.`;}
    else if(type==='podcast'){gain=r(100,1200);const inc=sc(r(50,350));G.money+=inc;msg=`🎙️ Podcast live! +${fmtFollowers(gain)} followers, +${fmt(inc)} donations.`;}
    else if(type==='live'){gain=r(50,600);const tips=sc(r(20,250));G.money+=tips;msg=`📡 Live stream done! +${fmtFollowers(gain)} new, ${fmt(tips)} in tips!`;}
    else if(type==='collab'){if(f<1000){UI.toast('Need 1,000 followers!');return;}gain=r(500,6000);msg=`🤝 Collab! +${fmtFollowers(gain)} from their audience.`;}
    else if(type==='sponsored'){if((G.followers||0)<10000){UI.toast('Need 10,000 followers!');return;}const deal=sc(r(500,6000));G.money+=deal;G.socialEarnings=(G.socialEarnings||0)+deal;gain=r(100,600);msg=`💰 Sponsored post live! Earned ${fmt(deal)}.`;}

    gain=Math.floor(gain*looksBonus);
    if(viral&&!G.achievements){G.achievements=G.achievements||{};G.achievements.viral=true;}
    G.followers=(G.followers||0)+gain; G.fame=cl((G.fame||0)+Math.floor(gain/600));
    G.happiness=cl(G.happiness+r(5,12));
    Engine.log(msg,viral?'special':'fame');
    Engine.checkAch(); UI.update(); this.render();
  },

  fame(type){
    const G=window.G;
    if(type==='interview'){G.fame=cl((G.fame||0)+r(4,10));G.followers=(G.followers||0)+r(200,2500);Engine.log('📰 Press interview. Credibility and visibility up.','fame');}
    else if(type==='event'){const c=sc(200);if(G.money<c){UI.toast('Need '+fmt(c)+'!');return;}G.money-=c;G.fame=cl((G.fame||0)+r(5,12));G.looks=cl(G.looks+r(2,5));G.followers=(G.followers||0)+r(500,6000);Engine.log('🎪 Public event. Profile massively raised.','fame');}
    else if(type==='charity'){G.fame=cl((G.fame||0)+r(6,14));G.happiness=cl(G.happiness+r(8,14));G.karma=cl((G.karma||0)+r(3,8),-100,100);G.followers=(G.followers||0)+r(300,4000);Engine.log('🤲 Charity campaign. Public image glowing.','fame');}
    else if(type==='scandal'){if(Math.random()>0.45){G.fame=cl((G.fame||0)+r(10,22));G.followers=(G.followers||0)+r(5000,60000);Engine.log('🔥 Controversy sparked massive public attention!','fame');}else{G.fame=cl((G.fame||0)-r(10,22));G.followers=Math.max(0,(G.followers||0)-r(1000,25000));G.happiness=cl(G.happiness-11);Engine.log('🔥 Controversy backfired. Reputation damaged.','bad');}}
    UI.update(); this.render();
  },

  monetize(type){
    const G=window.G;
    if(type==='merch'){if((G.followers||0)<10000){UI.toast('Need 10K followers!');return;}const rev=sc(r(500,6000));G.money+=rev;G.socialEarnings=(G.socialEarnings||0)+rev;Engine.log(`👕 Merch launch! ${fmt(rev)} in first batch.`,'money');}
    else if(type==='course'){if(G.smarts<55){UI.toast('Need 55+ Smarts!');return;}const rev=sc(r(1000,9000));G.money+=rev;G.socialEarnings=(G.socialEarnings||0)+rev;Engine.log(`🎓 Online course! Enrolled ${r(20,200)} students. Earned ${fmt(rev)}.`,'money');}
    else if(type==='book'){const rev=sc(r(2000,25000));G.money+=rev;G.socialEarnings=(G.socialEarnings||0)+rev;G.fame=cl((G.fame||0)+r(5,15));Engine.log(`📚 Book published! First week: ${fmt(rev)}. Reputation elevated.`,'special');}
    else if(type==='app'){if(G.smarts<60){UI.toast('Need 60+ Smarts!');return;}const rev=sc(r(5000,55000));G.money+=rev;G.socialEarnings=(G.socialEarnings||0)+rev;Engine.log(`📱 App launched! Generated ${fmt(rev)} in revenue.`,'special');}
    Engine.checkAch(); UI.update(); this.render();
  },

  tick(){
    const G=window.G;
    if((G.followers||0)>0){const inc=sc(Math.floor(G.followers*0.01));G.money+=inc;G.socialEarnings=(G.socialEarnings||0)+inc;}
    if((G.followers||0)>0)G.followers=Math.max(0,G.followers-Math.floor(G.followers*0.004));
  },
};
