/* data/achievements.js */
const ACHIEVEMENTS=[
// Life
{id:'age_30',    icon:'🎂',name:'Thirty & Thriving',    desc:'Reach age 30',                       check:G=>G.age>=30},
{id:'age_50',    icon:'🎂',name:'The Big Fifty',          desc:'Reach age 50',                       check:G=>G.age>=50},
{id:'age_80',    icon:'🎂',name:'Octogenarian',           desc:'Reach age 80',                       check:G=>G.age>=80},
{id:'age_100',   icon:'🎂',name:'Centenarian!',           desc:'Live to 100',                        check:G=>G.age>=100},
// Wealth
{id:'mil',       icon:'💰',name:'Millionaire',            desc:'Net worth over $1M',                 check:G=>netWorth(G)>=1000000},
{id:'mul_mil',   icon:'💎',name:'Multi-Millionaire',      desc:'Net worth over $10M',                check:G=>netWorth(G)>=10000000},
{id:'bil',       icon:'🏦',name:'Billionaire!',           desc:'Net worth over $1B',                 check:G=>netWorth(G)>=1000000000},
{id:'rock_btm',  icon:'💸',name:'Rock Bottom',            desc:'Hit $0 at some point',               check:G=>G.achievements?.rock_bottom},
// Career
{id:'ceo_ach',   icon:'👔',name:'Corner Office',          desc:'Become a CEO',                       check:G=>G.career?.id==='ceo'},
{id:'surgeon_ach',icon:'🩺',name:'Top Surgeon',           desc:'Become a Surgeon',                   check:G=>G.career?.id==='surgeon'},
{id:'pilot_ach', icon:'✈️',name:'Sky Captain',            desc:'Become a Pilot',                     check:G=>G.career?.id==='pilot'},
{id:'promo5',    icon:'📈',name:'Fast Tracker',           desc:'Get 5 promotions/raises',            check:G=>(G.promotionCount||0)>=5},
{id:'fired_ach', icon:'🚪',name:"You're Fired!",          desc:'Get fired from a job',               check:G=>G.achievements?.fired},
{id:'retired_ach',icon:'🏖️',name:'Golden Retirement',    desc:'Retire from a career',               check:G=>!!G.retired},
// Education
{id:'uni_ach',   icon:'🎓',name:'Degree Holder',          desc:'Graduate from university',           check:G=>G.education==='university'},
{id:'ivy_ach',   icon:'🎓',name:'Ivy League Elite',       desc:'Graduate from Ivy League',           check:G=>G.univType==='ivy'},
{id:'dropout_ach',icon:'📋',name:'Dropout',               desc:'Drop out of university',             check:G=>G.achievements?.dropout},
// Love & Family
{id:'married_ach',icon:'💍',name:'Happily Married',       desc:'Get married',                        check:G=>G.rels.partner?.married},
{id:'divorced_ach',icon:'💔',name:'Splitsville',          desc:'Get divorced',                       check:G=>G.achievements?.divorced},
{id:'3kids',     icon:'👶',name:'Full House',              desc:'Have 3 or more children',            check:G=>G.rels.children.length>=3},
{id:'5kids',     icon:'👨‍👩‍👧‍👦',name:'The Brady Bunch',  desc:'Have 5+ children',                   check:G=>G.rels.children.length>=5},
{id:'25yr_marr', icon:'💒',name:'Silver Anniversary',     desc:'25 years of marriage',               check:G=>(G.rels.partner?.yearsMarried||0)>=25},
{id:'caught_cheat',icon:'😬',name:'Caught Red-Handed',   desc:'Get caught cheating',                check:G=>G.achievements?.caught_cheating},
// Health
{id:'fit_ach',   icon:'💪',name:'Peak Physique',          desc:'Reach 90+ Fitness',                  check:G=>G.fitness>=90},
{id:'centenarian',icon:'🧬',name:'Incredible Genes',      desc:'Age 95+ with 70+ health',            check:G=>G.age>95&&G.health>=70},
{id:'overdose_ach',icon:'💊',name:'Close Call',           desc:'Survive a drug overdose',            check:G=>G.achievements?.overdose},
{id:'sober_life',icon:'🚭',name:'Clean Living',           desc:'Quit all addictions',                check:G=>G.achievements?.quit_addictions},
// Crime
{id:'jailbird',  icon:'🔒',name:'Jailbird',               desc:'Go to prison',                       check:G=>G.achievements?.jailbird},
{id:'escaped_ach',icon:'🏃',name:'Shawshank',             desc:'Escape from prison',                 check:G=>G.achievements?.escaped},
{id:'bank_rob',  icon:'🏦',name:'Mastermind',             desc:'Rob a bank',                         check:G=>G.achievements?.bank_robbed},
{id:'clean_rec', icon:'⚖️',name:'Law-Abiding Citizen',    desc:'Age 60+ with no criminal record',    check:G=>G.age>=60&&(!G.crimes||G.crimes.length===0)},
// Fame & Social
{id:'famous_ach',icon:'⭐',name:'Celebrity',              desc:'Reach 100K followers',               check:G=>(G.followers||0)>=100000},
{id:'viral_ach', icon:'🔥',name:'Gone Viral',             desc:'Have a viral post',                  check:G=>G.achievements?.viral},
{id:'mega_inf',  icon:'💎',name:'Mega Influencer',        desc:'Reach 1M followers',                 check:G=>(G.followers||0)>=1000000},
// Business
{id:'entrepreneur',icon:'💼',name:'Self-Made',            desc:'Start your own business',            check:G=>!!G.business},
{id:'unicorn_ach',icon:'🦄',name:'Unicorn Founder',       desc:'Business worth $1B+',                check:G=>(G.business?.value||0)>=1000000000},
{id:'bankrupt_ach',icon:'📉',name:'Chapter 11',           desc:'Go bankrupt',                        check:G=>G.achievements?.bankrupt},
{id:'ipo_ach',   icon:'📈',name:'IPO King',               desc:'Take your company public',           check:G=>G.achievements?.ipo},
// Properties & Assets
{id:'landlord',  icon:'🏠',name:'Landlord',               desc:'Own 3+ rental properties',           check:G=>G.assets.properties.filter(p=>p.rent>0).length>=3},
{id:'castle_ach',icon:'🏰',name:'Lord of the Manor',      desc:'Buy a castle',                       check:G=>G.assets.properties.some(p=>p.id==='castle')},
{id:'jet_ach',   icon:'🛩️',name:'Jet Setter',            desc:'Own a private jet',                  check:G=>G.assets.vehicles.some(v=>v.id==='jet')},
{id:'car_coll',  icon:'🚗',name:'Car Collector',          desc:'Own 5+ vehicles',                    check:G=>G.assets.vehicles.length>=5},
// Happiness & Wellness
{id:'zen_ach',   icon:'🧘',name:'Inner Peace',            desc:'90+ happiness for 10 consecutive years',check:G=>(G.happyStreak||0)>=10},
{id:'depressed_ach',icon:'😔',name:'Dark Times',          desc:'Hit 5 happiness',                    check:G=>G.achievements?.hit_rock_bottom_mood},
{id:'low_stress',icon:'😌',name:'Zen Master',             desc:'Keep stress under 10 for 5 years',   check:G=>(G.lowStressStreak||0)>=5},
// Karma
{id:'saint',     icon:'😇',name:'Guardian Angel',         desc:'Karma +80',                          check:G=>(G.karma||0)>=80},
{id:'villain',   icon:'😈',name:'Villain',                desc:'Karma -80',                          check:G=>(G.karma||0)<=-80},
// World events
{id:'recession_surv',icon:'📉',name:'Recession Survivor', desc:'Survive an economic recession',      check:G=>G.achievements?.survived_recession},
{id:'pandemic_surv', icon:'🦠',name:'Pandemic Survivor',  desc:'Survive a global pandemic',          check:G=>G.achievements?.survived_pandemic},
{id:'boom_profit',icon:'💹',name:'Boom Rider',            desc:'Profit during an economic boom',     check:G=>G.achievements?.boom_profit},
// Travel & misc
{id:'globe_ach', icon:'🌍',name:'Globetrotter',           desc:'Visit 10 different countries',       check:G=>(G.countriesVisited||[]).length>=10},
{id:'philanthropist',icon:'🤲',name:'Philanthropist',     desc:'Donate $500K in lifetime',           check:G=>(G.lifetimeDonated||0)>=500000},
{id:'gambler_ach',icon:'🎰',name:'High Roller',           desc:'Gamble $50K lifetime',               check:G=>(G.lifetimeGambled||0)>=50000},
{id:'pet_lover', icon:'🐾',name:'Pet Lover',              desc:'Own 3 or more pets simultaneously',  check:G=>(G.pets||[]).filter(p=>p.alive).length>=3},
{id:'perfect_s', icon:'💯',name:'Perfect Life',           desc:'90+ in all 6 main stats',            check:G=>G.happiness>=90&&G.health>=90&&G.smarts>=90&&G.looks>=90&&G.fitness>=90&&G.fame>=90},
{id:'midlife',   icon:'🏎️',name:'Midlife Crisis',         desc:'Survive your midlife crisis',        check:G=>G.achievements?.midlife_survived},
{id:'first_goal',icon:'🎯',name:'Goal Getter',            desc:'Complete your first life goal',      check:G=>(G.completedGoals||[]).length>=1},
{id:'all_goals', icon:'🏆',name:'Life Complete',          desc:'Complete all 12 life goals',         check:G=>(G.completedGoals||[]).length>=12},
{id:'insurance_ach',icon:'🛡️',name:'Responsible Adult',  desc:'Have all 3 insurance types',         check:G=>G.insurance?.health&&G.insurance?.car&&G.insurance?.life},
{id:'inheritance_ach',icon:'💝',name:'Good Inheritance',  desc:'Receive a large inheritance',        check:G=>(G.inheritanceReceived||0)>=50000},

// v9 achievements
{id:'skill_master',icon:'🎓',name:'Skill Master',          desc:'Max out any skill to Level 5',       check:G=>G.skills&&Object.values(G.skills).some(v=>v>=5)},
{id:'polymath',    icon:'🧩',name:'Polymath',               desc:'Have 5+ skills at Level 2+',         check:G=>G.skills&&Object.values(G.skills).filter(v=>v>=2).length>=5},
{id:'stock_whale', icon:'🐋',name:'Market Whale',           desc:'Reach $1M in stock portfolio',       check:G=>{if(!G.stocks?.portfolio||!G.stocks?.prices)return false;let v=0;for(const[id,qty]of Object.entries(G.stocks.portfolio))v+=Math.round((qty||0)*(G.stocks.prices[id]||0));return v>=1000000;}},
{id:'first_stock', icon:'📈',name:'First Investment',       desc:'Buy your first stock share',         check:G=>G.stocks?.portfolio&&Object.values(G.stocks.portfolio).some(v=>v>0)},
{id:'story_moment_ach',icon:'✨',name:'Life Storyteller',  desc:'Trigger a local Story Moment',      check:G=>G.log?.some(e=>e.text?.includes('Story Moment:'))},
{id:'dividend_king',icon:'💰',name:'Dividend King',         desc:'Receive dividends for 10+ years',    check:G=>G.log?.filter(e=>e.text?.includes('Dividend income')).length>=10},
{id:'renaissance_ach',icon:'🎭',name:'Renaissance Person',  desc:'Achieve the Renaissance ambition',   check:G=>G.ambitionAchieved&&G.ambition==='renaissance'},
{id:'sage_ach',    icon:'🦉',name:'The Sage',               desc:'Achieve the Sage ambition',          check:G=>G.ambitionAchieved&&G.ambition==='sage'},
];
