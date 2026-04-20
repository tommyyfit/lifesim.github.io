/* data/replay.js - replay hooks, country events, rare arcs */
const STARTING_PERKS=[
  {id:'savings',icon:'💵',name:'Starter Savings',desc:'+10K starting cash',apply:G=>{G.money+=sc(10000);}},
  {id:'gifted',icon:'🧠',name:'Gifted Student',desc:'+10 Smarts and +1 Skill Point',apply:G=>{G.smarts=cl(G.smarts+10);G.skillPoints=(G.skillPoints||0)+1;}},
  {id:'popular',icon:'✨',name:'Popular Kid',desc:'+10 Looks and easier social start',apply:G=>{G.looks=cl(G.looks+10);G.happiness=cl(G.happiness+5);}},
  {id:'tough',icon:'🛡️',name:'Tough Start',desc:'+12 Health and +8 Fitness',apply:G=>{G.health=cl(G.health+12);G.fitness=cl((G.fitness||50)+8);}},
  {id:'connected',icon:'🤝',name:'Family Connections',desc:'+8 Fame and better job luck',apply:G=>{G.fame=cl((G.fame||0)+8);G.workReputation=8;}},
  {id:'romantic',icon:'💌',name:'Romantic Soul',desc:'+10 Happiness and deeper relationships',apply:G=>{G.happiness=cl(G.happiness+10);G.relationshipMomentum=5;}},
];

const CHALLENGE_MODES=[
  {id:'none',icon:'🌱',name:'Free Life',desc:'No extra restrictions',scoreBonus:0},
  {id:'rags',icon:'🪙',name:'Rags to Riches',desc:'Start with $0. Score bonus for wealth',scoreBonus:8,apply:G=>{G.money=0;}},
  {id:'iron_health',icon:'❤️',name:'Fragile Body',desc:'Lower starting health, bigger score reward',scoreBonus:12,apply:G=>{G.health=cl(G.health-22);}},
  {id:'wanderer',icon:'🌍',name:'Wanderer',desc:'Travel matters more. Start restless',scoreBonus:8,apply:G=>{G.happiness=cl(G.happiness-8);G.stress=cl((G.stress||0)+8);}},
  {id:'single_parent',icon:'👶',name:'Early Responsibility',desc:'Begin adulthood with a child at 18+',scoreBonus:10,apply:G=>{G.challengePendingChild=true;}},
  {id:'no_crime',icon:'⚖️',name:'Clean Record',desc:'Bonus for avoiding crime entirely',scoreBonus:6},
];

const COUNTRY_EVENTS={
  'United States':[
    {icon:'🏥',type:'neutral',title:'Insurance Shock',text:'A medical billing issue becomes a serious budgeting problem.',choices:[{t:'📋 Fight the bill',e:{money:-1200,smarts:3,stress:7}},{t:'💳 Pay and move on',e:{money:-3500,stress:3}},{t:'🛡️ Review insurance',e:{smarts:4,stress:-2}}]},
    {icon:'🚗',type:'neutral',title:'Long Commute',text:'Your city sprawls forever and commuting eats into your mood.',choices:[{t:'🚗 Buy better transport',e:{money:-2500,happiness:5,stress:-7}},{t:'🎧 Use the time well',e:{smarts:3,stress:-3}},{t:'😤 Just endure it',e:{stress:8,happiness:-4}}]},
  ],
  'Czech Republic':[
    {icon:'🚋',type:'good',title:'Perfect Transit Day',text:'Cheap transit, good coffee, and a walkable city make everyday life feel easy.',choices:[{t:'🚋 Enjoy the rhythm',e:{happiness:9,stress:-8}},{t:'📚 Read on the tram',e:{smarts:4,happiness:4}}]},
    {icon:'🏰',type:'neutral',title:'Castle Weekend',text:'A historic weekend trip reminds you how much culture is nearby.',choices:[{t:'🏰 Explore everything',e:{happiness:10,smarts:3,money:-250}},{t:'📸 Post photos',e:{happiness:6,fame:2}}]},
  ],
  'United Kingdom':[
    {icon:'☔',type:'neutral',title:'Rainy Month',text:'The weather has been relentlessly grey, and everyone is talking about it.',choices:[{t:'☕ Lean into cozy life',e:{happiness:6,stress:-5}},{t:'🏃 Run anyway',e:{health:4,fitness:4}},{t:'😩 Complain constantly',e:{happiness:-5}}]},
    {icon:'🚆',type:'bad',title:'Rail Strike',text:'A rail strike disrupts work, family plans, and your patience.',choices:[{t:'🏠 Work from home',e:{stress:-2,smarts:2}},{t:'🚕 Pay for alternatives',e:{money:-900,stress:4}},{t:'😤 Lose a day',e:{happiness:-7,stress:8}}]},
  ],
  'Germany':[
    {icon:'🛠️',type:'good',title:'Apprenticeship Culture',text:'Practical skills are respected, and a local program offers real training.',choices:[{t:'🛠️ Join a workshop',e:{smarts:5,fitness:2}},{t:'🤝 Network locally',e:{happiness:5,smarts:2}}]},
    {icon:'🚲',type:'good',title:'Bike City',text:'Safe bike routes make daily fitness feel effortless.',choices:[{t:'🚲 Bike everywhere',e:{health:6,fitness:8,stress:-5}},{t:'🌳 Weekend ride',e:{happiness:7,health:3}}]},
  ],
  'Japan':[
    {icon:'🚄',type:'good',title:'Perfect Train Timing',text:'A flawless train day makes a busy life feel beautifully organized.',choices:[{t:'🚄 Use the momentum',e:{smarts:3,stress:-6}},{t:'🍱 Treat yourself',e:{happiness:6,money:-200}}]},
    {icon:'🏮',type:'special',title:'Local Festival',text:'A neighbourhood festival fills the streets with food, music, and memory.',choices:[{t:'🏮 Join fully',e:{happiness:12,stress:-8}},{t:'📸 Share it online',e:{happiness:7,fame:3}}]},
  ],
};

const RARE_STORY_ARCS=[
  {icon:'🧬',type:'special',title:'Lost Relative',text:'A DNA match suggests a close relative nobody ever told you about.',tag:'lost_relative',choices:[{t:'🔎 Reach out carefully',e:{happiness:8,stress:6}},{t:'📁 Keep researching',e:{smarts:5,stress:3}},{t:'🚪 Leave it alone',e:{stress:-4}}]},
  {icon:'📚',type:'special',title:'Hidden Talent',text:'A casual hobby reveals a serious talent you never knew you had.',tag:'hidden_talent',choices:[{t:'🔥 Take it seriously',e:{happiness:12,smarts:5,fame:3}},{t:'🙂 Keep it private',e:{happiness:8,stress:-4}}]},
  {icon:'💼',type:'neutral',title:'Ethical Crossroads',text:'Someone offers you a shortcut that could make money but stain your reputation.',tag:'ethics',choices:[{t:'⚖️ Refuse cleanly',e:{karma:10,happiness:5}},{t:'🕶️ Take the shortcut',e:{money:12000,karma:-14,stress:8}},{t:'🧠 Negotiate a clean version',e:{smarts:5,money:4000}}]},
  {icon:'🌌',type:'special',title:'Once in a Lifetime',text:'A rare invitation arrives: one chance, expensive, unforgettable.',tag:'once_life',choices:[{t:'✨ Go for it',e:{happiness:22,money:-9000,fame:4}},{t:'💰 Be practical',e:{stress:-4,smarts:3}},{t:'🎁 Send someone else',e:{karma:8,happiness:8,money:-3000}}]},
];
