/* js/goals.js — LifeSim v9 */
const BUCKET_GOALS=[
  {id:'visit_10',    icon:'🌍',name:'World Traveller',      desc:'Visit 10 different countries',        check:G=>(G.countriesVisited||[]).length>=10,  reward:{happiness:15},        rewardTxt:'+15 Happiness'},
  {id:'mil_net',     icon:'💰',name:'Self-Made Millionaire', desc:'Accumulate $1M+ net worth',           check:G=>netWorth(G)>=1000000,                 reward:{happiness:20,money:10000},rewardTxt:'+20 Happiness, +$10K'},
  {id:'get_married', icon:'💍',name:'Find True Love',        desc:'Get married',                         check:G=>G.rels.partner?.married,               reward:{happiness:12},        rewardTxt:'+12 Happiness'},
  {id:'have_kids',   icon:'👶',name:'Start a Family',        desc:'Have at least 2 children',            check:G=>(G.rels.children||[]).length>=2,       reward:{happiness:15},        rewardTxt:'+15 Happiness'},
  {id:'own_business',icon:'🏢',name:'Be Your Own Boss',      desc:'Start your own business',             check:G=>!!G.business,                          reward:{happiness:10,money:5000},rewardTxt:'+10 Happiness, +$5K'},
  {id:'reach_90hap', icon:'😊',name:'Inner Happiness',       desc:'Reach 90+ happiness',                 check:G=>G.happiness>=90,                       reward:{health:10},           rewardTxt:'+10 Health'},
  {id:'get_famous',  icon:'⭐',name:'15 Minutes of Fame',    desc:'Reach 50 Fame',                       check:G=>(G.fame||0)>=50,                       reward:{happiness:10,money:8000},rewardTxt:'+10 Happiness, +$8K'},
  {id:'top_fitness', icon:'💪',name:'Peak Performance',      desc:'Reach 90+ Fitness',                   check:G=>(G.fitness||0)>=90,                    reward:{health:10,looks:5},   rewardTxt:'+10 Health, +5 Looks'},
  {id:'own_property',icon:'🏠',name:'Homeowner',             desc:'Own your first property',             check:G=>(G.assets.properties||[]).length>=1,   reward:{happiness:8,money:5000},rewardTxt:'+8 Happiness, +$5K'},
  {id:'uni_grad',    icon:'🎓',name:'Degree Graduate',       desc:'Graduate from university',            check:G=>G.education==='university',             reward:{smarts:10,money:3000}, rewardTxt:'+10 Smarts, +$3K'},
  {id:'crime_free',  icon:'⚖️',name:'Law-Abiding Citizen',   desc:'Reach age 60 with no criminal record',check:G=>G.age>=60&&(!G.crimes||G.crimes.length===0),reward:{happiness:12,money:20000},rewardTxt:'+12 Happiness, +$20K'},
  {id:'live_to_70',  icon:'🎂',name:'Golden Years',          desc:'Reach age 70',                        check:G=>G.age>=70,                             reward:{happiness:15},        rewardTxt:'+15 Happiness'},
];

const Goals={
  render(){
    const G=window.G;if(!G)return;
    const el=document.getElementById('tab-goals');
    if(!G.completedGoals)G.completedGoals=[];
    const done=G.completedGoals;
    const total=BUCKET_GOALS.length;
    const completed=done.length;
    const pct=Math.round(completed/total*100);
    const ambDef=G.ambition&&typeof LIFE_AMBITIONS!=='undefined'?LIFE_AMBITIONS.find(a=>a.id===G.ambition):null;

    let h=`<div class="nw-box">
      <div class="nw-lbl">🎯 Life Bucket List</div>
      <div class="nw-amt" style="font-size:22px">${completed} / ${total}</div>
      <div class="prog-bar" style="margin:8px 0 5px;height:8px"><div class="prog-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--accent2))"></div></div>
      <div class="nw-sub">${pct}% life goals achieved</div>
    </div>`;

    // Life ambition card
    if(ambDef){
      const achieved=G.ambitionAchieved;
      h+=`<div style="background:var(--s2);border:1.5px solid ${achieved?'rgba(251,191,36,.5)':'rgba(124,111,255,.35)'};border-radius:14px;padding:14px;margin-bottom:14px">
        <div style="font-size:10px;font-weight:900;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:8px">🎯 Your Life Ambition</div>
        <div style="display:flex;align-items:center;gap:11px">
          <div style="font-size:28px">${ambDef.icon}</div>
          <div>
            <div style="font-size:15px;font-weight:900;color:${achieved?'var(--yellow)':'var(--txt)'}">${ambDef.name} ${achieved?'✅':''}</div>
            <div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:2px">${ambDef.desc}</div>
            ${achieved?`<div style="font-size:11px;color:var(--yellow);font-weight:700;margin-top:4px">🌟 Life ambition achieved! +12 score bonus on death.</div>`:`<div style="font-size:11px;color:var(--accent);font-weight:700;margin-top:4px">Work toward this for a major life bonus!</div>`}
          </div>
        </div>
      </div>`;
    }

    h+=`<div class="sec">🎯 Your Goals</div>`;
    BUCKET_GOALS.forEach(g=>{
      const isDone=done.includes(g.id);
      let inProgress=false;
      try{if(!isDone)inProgress=g.check(G);}catch(e){}
      h+=`<div style="background:var(--s1);border:1.5px solid ${isDone?'rgba(74,222,128,.4)':inProgress?'rgba(251,191,36,.3)':'var(--b1)'};border-radius:13px;padding:13px;margin-bottom:8px;display:flex;align-items:center;gap:11px;opacity:${isDone?'1':'0.9'}">
        <div style="font-size:26px">${g.icon}</div>
        <div style="flex:1">
          <div style="font-size:14px;font-weight:800${isDone?';color:var(--green)':''}">${g.name} ${isDone?'✅':''}</div>
          <div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:2px">${g.desc}</div>
          ${isDone?`<div style="font-size:11px;color:var(--green);font-weight:700;margin-top:3px">✨ Completed! Reward: ${g.rewardTxt}</div>`:
          inProgress?`<div style="font-size:11px;color:var(--yellow);font-weight:700;margin-top:3px">⚡ Just achieved! Reward coming next age-up...</div>`:''}
        </div>
      </div>`;
    });
    el.innerHTML=h;
  },

  tick(){
    const G=window.G;if(!G)return;
    if(!G.completedGoals)G.completedGoals=[];
    // Life goals
    BUCKET_GOALS.forEach(g=>{
      try{
        if(!G.completedGoals.includes(g.id)&&g.check(G)){
          G.completedGoals.push(g.id);
          Object.entries(g.reward).forEach(([k,v])=>{
            if(k==='money')G.money=Math.max(0,(G.money||0)+v);
            else if(k==='fitness')G.fitness=cl((G.fitness||50)+v);
            else if(k==='fame')G.fame=cl((G.fame||0)+v);
            else if(G[k]!==undefined)G[k]=cl(G[k]+v);
          });
          Engine.log(`🎯 Goal Complete: "${g.name}"! Reward: ${g.rewardTxt}`,'special');
          UI.achievementPopup({icon:g.icon,name:g.name,desc:`Goal Complete! ${g.rewardTxt}`});
          if(!G.achievements)G.achievements={};G.achievements.first_goal=true;
          Engine.checkAch();
        }
      }catch(e){}
    });
    // Life ambition check
    if(G.ambition&&!G.ambitionAchieved&&typeof LIFE_AMBITIONS!=='undefined'){
      const ambDef=LIFE_AMBITIONS.find(a=>a.id===G.ambition);
      if(ambDef){
        try{
          if(ambDef.check(G)){
            G.ambitionAchieved=true;
            Engine.log(`🌟 LIFE AMBITION ACHIEVED: "${ambDef.name}"! Your life's purpose fulfilled!`,'special');
            UI.achievementPopup({icon:ambDef.icon,name:'Life Ambition!',desc:`"${ambDef.name}" — ${ambDef.desc}`});
            G.happiness=cl(G.happiness+18);
            Engine.checkAch();
          }
        }catch(e){}
      }
    }
  },
};
