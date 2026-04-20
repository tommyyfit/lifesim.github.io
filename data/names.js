/* data/names.js */
const MNAMES=['James','William','Oliver','Liam','Noah','Ethan','Lucas','Mason','Logan','Henry',
'Jack','Daniel','Alexander','Mateo','David','Samuel','Leo','Oscar','Felix','Adrian',
'Anton','Pavel','Milan','Jakub','Tomáš','Jan','Martin','Petr','Lukas','Simon',
'Kai','Finn','Cole','River','Blake','Noel','Atlas','Zane','Marcus','Julian',
'Hugo','Arthur','Theo','Sebastian','Benjamin','Elias','Owen','Wyatt','Ezra','Caleb'];
const FNAMES=['Emma','Olivia','Ava','Isabella','Sophia','Mia','Charlotte','Amelia','Harper','Luna',
'Sofia','Camila','Aria','Scarlett','Victoria','Madison','Layla','Penelope','Chloe','Natasha',
'Karolína','Anna','Elena','Maria','Sara','Nikola','Tereza','Lucie','Veronika','Klára',
'Zoe','Isla','Freya','Aurora','Hazel','Violet','Stella','Ruby','Nora','Iris',
'Cora','Phoebe','Naomi','Leah','Clara','Maya','Elena','Lydia','Eva','Rosa'];
const SURNAMES=['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore',
'Taylor','Anderson','Thomas','Jackson','Harris','Martin','Thompson','Lee','Walker',
'Novák','Dvořák','Horák','Blažek','Fischer','Müller','Schneider','Weber','Meyer',
'Černý','Procházka','Kučera','Veselý','Pospíšil','Kopecký','Kratochvíl',
'Reynolds','Hayes','Sullivan','Murphy','O\'Brien','Walsh','Kelly','Quinn'];
const COMPANIES=['GlobalCorp','Apex Solutions','Summit Inc','NexusTech','Horizon Ltd',
'Pinnacle Group','Vertex Corp','Quantum Co','Atlas Industries','Nova Group',
'Stellar Systems','Echo Dynamics','Prime Partners','Crest Technologies','Vanguard LLC',
'Iron Peak Ltd','Blue Ocean Co','Meridian Corp','Zenith Group','Catalyst Inc',
'Fusion Works','Core Dynamics','Peak Performance Co','Luminary Group','TechVault Inc'];
const DEATH_QUOTES=[
'"Life is what happens between birth and death. Make the middle count."',
'"Every exit is an entrance somewhere else."',
'"Not all those who wander are lost — but all journeys end."',
'"You lived. That is more than enough."',
'"Even the longest night gives way to morning. Yours lasted beautifully."',
'"The story of your life has reached its final chapter."',
'"Death is the universe\'s way of saying your table is needed."',
'"A life fully lived leaves no room for regret."',
'"What you leave behind is not what is engraved in stone, but what is woven into the lives of others."',
'"In the end, we only regret the chances we didn\'t take."',
'"Life is not measured by the number of breaths we take, but by the moments that take our breath away."',
];
const WORLD_EVENTS=[
  {icon:'💹',type:'world',title:'Economic Boom!',text:'The global economy is booming. Markets are up, jobs are plentiful, and optimism is everywhere.',tag:'boom',choices:[{t:'📈 Invest everything',e:{money:10000,happiness:8}},{t:'💼 Ask for a raise',e:{money:5000,happiness:5}},{t:'💰 Save conservatively',e:{money:2000}}]},
  {icon:'📉',type:'world',title:'Financial Recession',text:'A sudden economic crisis hits. Unemployment rises, markets crash, and uncertainty spreads globally.',tag:'recession',choices:[{t:'💎 Hold assets — stay the course',e:{money:-5000,happiness:-5}},{t:'💸 Panic sell investments',e:{money:-15000,happiness:-10}},{t:'🛡️ Cut expenses immediately',e:{money:-1000,happiness:-3}}]},
  {icon:'🦠',type:'world',title:'Global Pandemic',text:'A new virus has spread across the globe. Lockdowns are announced and life changes overnight.',tag:'pandemic',choices:[{t:'🏠 Stay home — follow rules',e:{happiness:-8,health:2,stress:15}},{t:'💼 Keep working regardless',e:{money:3000,health:-10,stress:20}},{t:'🏥 Volunteer to help',e:{happiness:12,karma:10,health:-5}}]},
  {icon:'🔥',type:'world',title:'Record Heatwave',text:'Unprecedented heat is breaking records. Infrastructure struggles and health risks soar.',choices:[{t:'🌊 Stay near water',e:{health:-3,happiness:-4}},{t:'❄️ Upgrade air conditioning',e:{money:-800,happiness:4}},{t:'🌿 Adapt your lifestyle',e:{health:-5}}]},
  {icon:'🚀',type:'world',title:'Tech Revolution',text:'A major technological breakthrough is transforming industries and creating enormous opportunity.',tag:'boom',choices:[{t:'💻 Learn the new technology',e:{smarts:12,money:5000}},{t:'🚀 Invest in tech stocks',e:{money:8000}},{t:'😕 Struggle to adapt',e:{smarts:-3,happiness:-5}}]},
  {icon:'⚡',type:'world',title:'Energy Crisis',text:'Energy prices have tripled overnight. Heating bills and fuel costs are astronomical.',choices:[{t:'♻️ Go green and solar',e:{money:-3000,happiness:8,karma:8}},{t:'🥶 Endure the high costs',e:{money:-4000,happiness:-8}},{t:'🏠 Move somewhere warmer',e:{money:-2000,happiness:3}}]},
  {icon:'🌊',type:'world',title:'Historic Floods',text:'Devastating floods have struck the region. Thousands of homes are destroyed or damaged.',choices:[{t:'🤲 Donate and volunteer',e:{money:-2000,happiness:8,karma:12}},{t:'🏃 Evacuate early',e:{happiness:-5,health:3}},{t:'📰 Follow news obsessively',e:{happiness:-8,stress:10}}]},
  {icon:'✌️',type:'world',title:'Peace Treaty Signed',text:'A major international peace deal has been struck. Global stability rises and markets celebrate.',choices:[{t:'🎉 Celebrate the news',e:{happiness:8}},{t:'💼 Take advantage of new opportunities',e:{money:4000,happiness:5}},{t:'🤔 Remain cautiously optimistic',e:{happiness:4}}]},
];
// Legacy duplicate traits list kept out of active game config.
const LEGACY_PERSONALITY_TRAITS=[
  {id:'ambitious',   icon:'🔥', name:'Ambitious',     desc:'+Smarts, faster career growth', startBonus:{smarts:8,money:0}},
  {id:'charming',    icon:'😎', name:'Charming',       desc:'+Looks, easier relationships',  startBonus:{looks:8,happiness:5}},
  {id:'athletic',    icon:'💪', name:'Athletic',       desc:'+Fitness, better health aging', startBonus:{fitness:12,health:8}},
  {id:'intellectual',icon:'🧠', name:'Intellectual',   desc:'+Smarts, costs less for study', startBonus:{smarts:12}},
  {id:'resilient',   icon:'🛡️', name:'Resilient',      desc:'+Health, survive bad events',   startBonus:{health:12,happiness:5}},
  {id:'creative',    icon:'🎨', name:'Creative',       desc:'+Happiness, better in arts',    startBonus:{happiness:10,looks:5}},
  {id:'lucky',       icon:'🍀', name:'Lucky',          desc:'Better random outcomes',        startBonus:{happiness:8}},
  {id:'disciplined', icon:'📐', name:'Disciplined',    desc:'Stats decay slower',            startBonus:{smarts:5,fitness:5}},
];

/* ── Personality Traits ── */

const PERSONALITY_TRAITS=[
  {id:'ambitious',   icon:'🔥',name:'Ambitious',    desc:'+Smarts, faster career growth',     startBonus:{smarts:8}},
  {id:'charming',    icon:'😎',name:'Charming',      desc:'+Looks, easier relationships',      startBonus:{looks:8,happiness:5}},
  {id:'athletic',    icon:'💪',name:'Athletic',      desc:'+Fitness, better health aging',     startBonus:{fitness:14,health:8}},
  {id:'intellectual',icon:'🧠',name:'Intellectual',  desc:'+Smarts, discounted education',     startBonus:{smarts:14}},
  {id:'resilient',   icon:'🛡️',name:'Resilient',     desc:'+Health, stats decay slower',       startBonus:{health:12,happiness:5}},
  {id:'creative',    icon:'🎨',name:'Creative',      desc:'+Happiness, better in arts',        startBonus:{happiness:10,looks:5}},
  {id:'lucky',       icon:'🍀',name:'Lucky',         desc:'Better random outcomes always',     startBonus:{happiness:8}},
  {id:'disciplined', icon:'📐',name:'Disciplined',   desc:'Stats decay 30% slower',           startBonus:{smarts:5,fitness:5}},
  {id:'visionary',   icon:'🔭',name:'Visionary',     desc:'+Smarts, business ideas come easily',startBonus:{smarts:10,happiness:5}},
  {id:'empath',      icon:'💙',name:'Empath',        desc:'+Karma, relationships deeper',      startBonus:{happiness:8,karma:15}},
  {id:'scholar',     icon:'📜',name:'Scholar',       desc:'Start with 2 free Skill Points',    startBonus:{smarts:6,skillPoints:2}},
];

/* ── Life Ambitions ── */
const LIFE_AMBITIONS=[
  {id:'wealth',     icon:'💰',name:'Accumulate Wealth',    desc:'Reach $10M net worth',         check:G=>netWorth(G)>=10000000},
  {id:'fame',       icon:'⭐',name:'Become Famous',        desc:'Reach 500K followers',          check:G=>(G.followers||0)>=500000},
  {id:'family',     icon:'👨‍👩‍👧',name:'Build a Family',    desc:'Marry + have 3 children',       check:G=>G.rels.partner?.married&&(G.rels.children||[]).length>=3},
  {id:'career_top', icon:'🏆',name:'Reach the Top',        desc:'Become CEO or Surgeon',        check:G=>['ceo','surgeon','judge'].includes(G.career?.id)},
  {id:'criminal',   icon:'😈',name:'Life of Crime',        desc:'Commit 10+ crimes & survive',  check:G=>(G.crimes||[]).length>=10&&G.alive},
  {id:'healthy',    icon:'💪',name:'Live Long & Well',     desc:'Reach 85 with 70+ health',      check:G=>G.age>=85&&G.health>=70},
  {id:'traveller',  icon:'🌍',name:'Globe-Trotter',        desc:'Visit 15 countries',            check:G=>(G.countriesVisited||[]).length>=15},
  {id:'entrepreneur',icon:'🏢',name:'Business Empire',     desc:'Build a $100M business',       check:G=>(G.business?.value||0)>=100000000},
  {id:'sage',       icon:'🦉',name:'The Sage',             desc:'Max out 3 different Skills',    check:G=>{if(!G.skills)return false;return Object.values(G.skills).filter(v=>v>=5).length>=3;}},
  {id:'investor',   icon:'📊',name:'Market Wizard',        desc:'Reach $500K in stocks',         check:G=>{if(!G.stocks)return false;let v=0;if(G.stocks.portfolio&&G.stocks.prices){for(const[id,qty]of Object.entries(G.stocks.portfolio))v+=Math.round((qty||0)*(G.stocks.prices[id]||0));}return v>=500000;}},
  {id:'renaissance',icon:'🎭',name:'Renaissance Soul',     desc:'Have 5+ skills at Lv 2+',       check:G=>{if(!G.skills)return false;return Object.values(G.skills).filter(v=>v>=2).length>=5;}},
];

/* ── World Events (appended to WORLD_EVENTS array or defined here) ── */
/* Removed duplicate fallback world events list:
if(typeof WORLD_EVENTS==='undefined'){
  var WORLD_EVENTS_FALLBACK=[
    {icon:'💹',type:'world',title:'Economic Boom!',text:'Global markets surge. Jobs plentiful, wages rising rapidly.',tag:'boom',choices:[{t:'📈 Invest everything now',e:{money:12000,happiness:8}},{t:'💼 Negotiate a big raise',e:{money:6000,happiness:5}},{t:'💰 Save conservatively',e:{money:2000}}]},
    {icon:'📉',type:'world',title:'Financial Recession',text:'Economic crisis hits. Markets crash, unemployment spikes.',tag:'recession',choices:[{t:'💎 Hold assets — stay the course',e:{money:-4000,happiness:-5}},{t:'💸 Panic sell investments',e:{money:-18000,happiness:-12}},{t:'🛡️ Cut expenses immediately',e:{money:-800,happiness:-3}}]},
    {icon:'🦠',type:'world',title:'Global Pandemic',text:'A new virus spreads. Lockdowns announced, life changes overnight.',tag:'pandemic',choices:[{t:'🏠 Stay home — follow rules',e:{happiness:-8,health:2,stress:15,karma:5}},{t:'💼 Keep working regardless',e:{money:3000,health:-10,stress:20}},{t:'🏥 Volunteer to help',e:{happiness:12,karma:15,health:-5}}]},
    {icon:'🚀',type:'world',title:'Tech Revolution',text:'A breakthrough transforms industries and creates huge opportunity.',tag:'boom',choices:[{t:'💻 Learn the new technology',e:{smarts:12,money:6000}},{t:'🚀 Invest in tech stocks',e:{money:10000}},{t:'😕 Struggle to adapt',e:{smarts:-4,happiness:-6}}]},
    {icon:'⚡',type:'world',title:'Energy Crisis',text:'Energy prices triple overnight. Bills and fuel costs astronomical.',choices:[{t:'♻️ Go green — solar panels',e:{money:-3500,happiness:8,karma:9}},{t:'🥶 Pay the high costs',e:{money:-5000,happiness:-9}},{t:'🏡 Relocate somewhere warmer',e:{money:-2500,happiness:4}}]},
    {icon:'🌊',type:'world',title:'Historic Floods',text:'Devastating floods hit. Thousands of homes destroyed or damaged.',choices:[{t:'🤲 Donate and volunteer',e:{money:-2500,happiness:9,karma:14}},{t:'🏃 Evacuate early',e:{happiness:-5,health:4}},{t:'📰 Follow news obsessively',e:{happiness:-9,stress:12}}]},
    {icon:'✌️',type:'world',title:'Peace Treaty Signed',text:'A major international peace deal — global stability rises.',choices:[{t:'🎉 Celebrate the news',e:{happiness:8,karma:4}},{t:'💼 Capitalise on opportunities',e:{money:5000,happiness:6}},{t:'🤔 Cautiously optimistic',e:{happiness:5}}]},
    {icon:'🤖',type:'world',title:'Automation Wave',text:'New automation tools disrupt almost every profession.',choices:[{t:'🤖 Learn the new tools',e:{smarts:12,money:8000}},{t:'📢 Advocate for workers',e:{happiness:6,karma:8,fame:5}},{t:'😰 Fear for your job',e:{happiness:-8,stress:14}}]},
  ];
}
*/
