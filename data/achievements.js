/* data/achievements.js — LifeSim data */

const ACH_SAFE={
  nw:G=>typeof netWorth==='function'?netWorth(G):0,
  stockValue:G=>{
    if(!G?.stocks?.portfolio||!G?.stocks?.prices)return 0;
    return Math.round(Object.entries(G.stocks.portfolio).reduce((sum,[id,qty])=>sum+((qty||0)*(G.stocks.prices[id]||0)),0));
  },
  prestige:()=>{
    try{
      if(typeof Legacy!=='undefined'&&Legacy.getPrestige)return Legacy.getPrestige();
    }catch(e){}
    return{livesPlayed:0,totalScore:0,bestGrade:null};
  },
  kids:G=>(G?.rels?.children||[]).length,
  rentals:G=>(G?.assets?.properties||[]).filter(p=>p&&p.rent>0).length,
  vehicles:G=>(G?.assets?.vehicles||[]).length,
  alivePets:G=>(G?.pets||[]).filter(p=>p&&p.alive).length,
  completedGoals:G=>(G?.completedGoals||[]).length,
  activeGoals:G=>(G?.activeGoals||[]).length,
  allGoalsDone:G=>{
    const active=(G?.activeGoals||[]).length;
    const done=(G?.completedGoals||[]).length;
    return active>0&&done>=active;
  },
  skillLevels:G=>Object.values(G?.skills||{}).filter(v=>Number.isFinite(v)),
  masteredSkills:G=>Object.values(G?.skills||{}).filter(v=>v>=5).length,
  skillIds:['coding','cooking','music','language','fitness','writing','finance','public_sp','art','medicine','hacking','photo','negotiation','mechanics','beauty','psychology'],
};

const ACHIEVEMENTS=[
  // Life
  {id:'age_30',icon:'🎂',name:'Thirty & Thriving',desc:'Reach age 30',check:G=>G.age>=30},
  {id:'age_50',icon:'🎂',name:'The Big Fifty',desc:'Reach age 50',check:G=>G.age>=50},
  {id:'age_80',icon:'🎂',name:'Octogenarian',desc:'Reach age 80',check:G=>G.age>=80},
  {id:'age_100',icon:'🎂',name:'Centenarian!',desc:'Live to 100',check:G=>G.age>=100},
  {id:'age_110',icon:'💯',name:'Living to 110',desc:'Live past age 110',check:G=>G.age>=110},
  {id:'max_age',icon:'🧬',name:'Human Limit',desc:'Reach age 120',check:G=>G.age>=120},

  // Wealth
  {id:'mil',icon:'💰',name:'Millionaire',desc:'Net worth over $1M',check:G=>ACH_SAFE.nw(G)>=1000000},
  {id:'mul_mil',icon:'💎',name:'Multi-Millionaire',desc:'Net worth over $10M',check:G=>ACH_SAFE.nw(G)>=10000000},
  {id:'bil',icon:'🏦',name:'Billionaire!',desc:'Net worth over $1B',check:G=>ACH_SAFE.nw(G)>=1000000000},
  {id:'rock_btm',icon:'💸',name:'Rock Bottom',desc:'Hit $0 at some point',check:G=>!!G.achievements?.rock_bottom},
  {id:'credit_760',icon:'💳',name:'Excellent Credit',desc:'Reach 760+ credit score',check:G=>(G.creditScore||0)>=760},
  {id:'debt_free',icon:'🧾',name:'Debt Free',desc:'Pay off all loans and collections after having debt',check:G=>(G.loans||[]).length===0&&(G.debtCollections||0)===0&&(G.missedPayments||0)>0},

  // Career
  {id:'ceo_ach',icon:'👔',name:'Corner Office',desc:'Become a CEO',check:G=>G.career?.id==='ceo'},
  {id:'surgeon_ach',icon:'🩺',name:'Top Surgeon',desc:'Become a Surgeon',check:G=>G.career?.id==='surgeon'},
  {id:'pilot_ach',icon:'✈️',name:'Sky Captain',desc:'Become a Pilot',check:G=>G.career?.id==='pilot'},
  {id:'judge_ach',icon:'🏛️',name:'Your Honor',desc:'Become a Judge',check:G=>G.career?.id==='judge'},
  {id:'promo5',icon:'📈',name:'Fast Tracker',desc:'Get 5 promotions or raises',check:G=>(G.promotionCount||0)>=5},
  {id:'promo10',icon:'🚀',name:'Corporate Rocket',desc:'Get 10 promotions or raises',check:G=>(G.promotionCount||0)>=10},
  {id:'fired_ach',icon:'🚪',name:"You're Fired!",desc:'Get fired from a job',check:G=>!!G.achievements?.fired},
  {id:'retired_ach',icon:'🏖️',name:'Golden Retirement',desc:'Retire from a career',check:G=>!!G.retired},

  // Education
  {id:'uni_ach',icon:'🎓',name:'Degree Holder',desc:'Graduate from university',check:G=>G.education==='university'},
  {id:'ivy_ach',icon:'🎓',name:'Ivy League Elite',desc:'Graduate from Ivy League',check:G=>G.univType==='ivy'},
  {id:'dropout_ach',icon:'📋',name:'Dropout',desc:'Drop out of university',check:G=>!!G.achievements?.dropout},
  {id:'vocational_ach',icon:'🔧',name:'Skilled Trade',desc:'Complete vocational education',check:G=>G.education==='vocational'},

  // Love & Family
  {id:'married_ach',icon:'💍',name:'Happily Married',desc:'Get married',check:G=>!!G.rels?.partner?.married},
  {id:'divorced_ach',icon:'💔',name:'Splitsville',desc:'Get divorced',check:G=>!!G.achievements?.divorced||(G.rels?.exes||[]).some(e=>e.cause==='divorce')},
  {id:'3kids',icon:'👶',name:'Full House',desc:'Have 3 or more children',check:G=>ACH_SAFE.kids(G)>=3},
  {id:'5kids',icon:'👨‍👩‍👧‍👦',name:'The Brady Bunch',desc:'Have 5+ children',check:G=>ACH_SAFE.kids(G)>=5},
  {id:'adopt_child',icon:'🫶',name:'Chosen Family',desc:'Adopt a child',check:G=>(G.rels?.children||[]).some(c=>c.adopted)},
  {id:'25yr_marr',icon:'💒',name:'Silver Anniversary',desc:'25 years of marriage',check:G=>(G.rels?.partner?.yearsMarried||0)>=25},
  {id:'long_married',icon:'👫',name:'Golden Decade',desc:'35+ years of marriage',check:G=>(G.rels?.partner?.yearsMarried||0)>=35},
  {id:'caught_cheat',icon:'😬',name:'Caught Red-Handed',desc:'Get caught cheating',check:G=>!!G.achievements?.caught_cheating},
  {id:'best_friend',icon:'⭐',name:'Best Friend Forever',desc:'Make a best friend',check:G=>(G.rels?.friends||[]).some(f=>f.bestFriend)},

  // Health
  {id:'fit_ach',icon:'💪',name:'Peak Physique',desc:'Reach 90+ Fitness',check:G=>(G.fitness||0)>=90},
  {id:'centenarian',icon:'🧬',name:'Incredible Genes',desc:'Age 95+ with 70+ health',check:G=>G.age>95&&G.health>=70},
  {id:'overdose_ach',icon:'💊',name:'Close Call',desc:'Survive a drug overdose',check:G=>!!G.achievements?.overdose},
  {id:'sober_life',icon:'🚭',name:'Clean Living',desc:'Quit all addictions',check:G=>!!G.achievements?.quit_addictions},
  {id:'healthy_eater',icon:'🥗',name:'Nutrition Locked In',desc:'Maintain 5 healthy diet years',check:G=>(G.food?.healthyYears||0)>=5},
  {id:'recovery_3',icon:'🌱',name:'Recovery Holding',desc:'Reach a 3-year clean streak',check:G=>(G.recovery?.cleanStreak||0)>=3},
  {id:'insured_health',icon:'🏥',name:'Covered',desc:'Buy health insurance',check:G=>!!G.insurance?.health},

  // Crime
  {id:'jailbird',icon:'🔒',name:'Jailbird',desc:'Go to prison',check:G=>!!G.achievements?.jailbird||!!G.inPrison},
  {id:'escaped_ach',icon:'🏃',name:'Shawshank',desc:'Escape from prison',check:G=>!!G.achievements?.escaped},
  {id:'bank_rob',icon:'🏦',name:'Mastermind',desc:'Rob a bank',check:G=>!!G.achievements?.bank_robbed},
  {id:'clean_rec',icon:'⚖️',name:'Law-Abiding Citizen',desc:'Age 60+ with no criminal record',check:G=>G.age>=60&&(!G.crimes||G.crimes.length===0)},
  {id:'crime_spree',icon:'😈',name:'Crime Spree',desc:'Commit 10 crimes',check:G=>(G.crimes||[]).length>=10},

  // Fame & Social
  {id:'famous_ach',icon:'⭐',name:'Celebrity',desc:'Reach 100K followers',check:G=>(G.followers||0)>=100000},
  {id:'viral_ach',icon:'🔥',name:'Gone Viral',desc:'Have a viral post',check:G=>!!G.achievements?.viral},
  {id:'mega_inf',icon:'💎',name:'Mega Influencer',desc:'Reach 1M followers',check:G=>(G.followers||0)>=1000000},
  {id:'creator_income',icon:'📱',name:'Creator Money',desc:'Earn $100K from social media',check:G=>(G.socialEarnings||0)>=100000},

  // Business
  {id:'entrepreneur',icon:'💼',name:'Self-Made',desc:'Start your own business',check:G=>!!G.business},
  {id:'unicorn_ach',icon:'🦄',name:'Unicorn Founder',desc:'Business worth $1B+',check:G=>(G.business?.value||0)>=1000000000||!!G.achievements?.unicorn},
  {id:'bankrupt_ach',icon:'📉',name:'Chapter 11',desc:'Go bankrupt',check:G=>!!G.achievements?.bankrupt},
  {id:'ipo_ach',icon:'📈',name:'IPO King',desc:'Take your company public',check:G=>!!G.achievements?.ipo},
  {id:'business_250k',icon:'🏢',name:'Local Empire',desc:'Build a business worth $250K+',check:G=>(G.business?.value||0)>=250000},
  {id:'tax_heat',icon:'🧾',name:'Creative Accounting',desc:'Use aggressive accounting in business',check:G=>!!G.business?.taxHackActive||(G.business?.taxHackYears||0)>0},

  // Hustle
  {id:'side_hustler',icon:'🧰',name:'Side Hustler',desc:'Earn your first side-hustle money',check:G=>(G.hustle?.earnings||0)>0},
  {id:'hustle_100k',icon:'💼',name:'Hustle Machine',desc:'Earn $100K from side hustles',check:G=>(G.hustle?.earnings||0)>=100000},
  {id:'hustle_rep',icon:'🤝',name:'Booked Out',desc:'Reach 75 hustle reputation',check:G=>(G.hustle?.rep||0)>=75},

  // Properties & Assets
  {id:'landlord',icon:'🏠',name:'Landlord',desc:'Own 3+ rental properties',check:G=>ACH_SAFE.rentals(G)>=3},
  {id:'castle_ach',icon:'🏰',name:'Lord of the Manor',desc:'Buy a castle',check:G=>(G.assets?.properties||[]).some(p=>p.id==='castle')},
  {id:'jet_ach',icon:'🛩️',name:'Jet Setter',desc:'Own a private jet',check:G=>(G.assets?.vehicles||[]).some(v=>v.id==='jet')},
  {id:'car_coll',icon:'🚗',name:'Car Collector',desc:'Own 5+ vehicles',check:G=>ACH_SAFE.vehicles(G)>=5},
  {id:'home_owner',icon:'🏡',name:'Homeowner',desc:'Own your first primary home',check:G=>(G.assets?.properties||[]).some(p=>p.rent===0)},

  // Stocks
  {id:'first_stock',icon:'📈',name:'First Investment',desc:'Buy your first stock share',check:G=>G.stocks?.portfolio&&Object.values(G.stocks.portfolio).some(v=>v>0)},
  {id:'stock_100k',icon:'📊',name:'Six-Figure Portfolio',desc:'Reach $100K in stock portfolio',check:G=>ACH_SAFE.stockValue(G)>=100000||!!G.achievements?.investor_100k},
  {id:'stock_whale',icon:'🐋',name:'Market Whale',desc:'Reach $1M in stock portfolio',check:G=>ACH_SAFE.stockValue(G)>=1000000},
  {id:'dividend_king',icon:'💰',name:'Dividend King',desc:'Receive $50K total dividends',check:G=>(G.stocks?.totalDividends||0)>=50000},

  // Skills
  {id:'skill_master',icon:'🎓',name:'Skill Master',desc:'Max out any skill to Level 5',check:G=>ACH_SAFE.masteredSkills(G)>=1},
  {id:'polymath',icon:'🧩',name:'Polymath',desc:'Have 5+ skills at Level 2+',check:G=>ACH_SAFE.skillLevels(G).filter(v=>v>=2).length>=5},
  {id:'skilled_life',icon:'🧠',name:'Highly Skilled',desc:'Reach 20 total skill levels',check:G=>ACH_SAFE.skillLevels(G).reduce((a,v)=>a+v,0)>=20||!!G.achievements?.skilled_life},
  {id:'triple_mastery',icon:'🏆',name:'Triple Mastery',desc:'Master 3 different skills',check:G=>ACH_SAFE.masteredSkills(G)>=3||!!G.achievements?.triple_mastery},
  {id:'master_all',icon:'👑',name:'Polymath Supreme',desc:'Have all skills at Level 3+',check:G=>ACH_SAFE.skillIds.every(id=>(G.skills?.[id]||0)>=3)},

  // Happiness & Wellness
  {id:'zen_ach',icon:'🧘',name:'Inner Peace',desc:'90+ happiness for 10 consecutive years',check:G=>(G.happyStreak||0)>=10},
  {id:'depressed_ach',icon:'😔',name:'Dark Times',desc:'Hit 5 happiness',check:G=>!!G.achievements?.hit_rock_bottom_mood},
  {id:'low_stress',icon:'😌',name:'Zen Master',desc:'Keep stress under 10 for 5 years',check:G=>(G.lowStressStreak||0)>=5},
  {id:'stress_zero',icon:'😌',name:'Zero Worries',desc:'Reach 0 stress',check:G=>(G.stress||0)===0},
  {id:'stoic_ach',icon:'🗿',name:'Unbreakable',desc:'Reach age 60 with stress never exceeding 30',check:G=>G.age>=60&&!!G.achievements?.always_low_stress},

  // Karma
  {id:'saint',icon:'😇',name:'Guardian Angel',desc:'Karma +80',check:G=>(G.karma||0)>=80},
  {id:'villain',icon:'😈',name:'Villain',desc:'Karma -80',check:G=>(G.karma||0)<=-80},

  // World events
  {id:'recession_surv',icon:'📉',name:'Recession Survivor',desc:'Survive an economic recession',check:G=>!!G.achievements?.survived_recession},
  {id:'pandemic_surv',icon:'🦠',name:'Pandemic Survivor',desc:'Survive a global pandemic',check:G=>!!G.achievements?.survived_pandemic},
  {id:'boom_profit',icon:'💹',name:'Boom Rider',desc:'Profit during an economic boom',check:G=>!!G.achievements?.boom_profit},
  {id:'space_ach',icon:'🚀',name:'Space Tourist',desc:'Book a space flight',check:G=>!!G.achievements?.space_tourist},

  // Travel & Misc
  {id:'globe_ach',icon:'🌍',name:'Globetrotter',desc:'Visit 10 different countries',check:G=>(G.countriesVisited||[]).length>=10},
  {id:'world_traveller',icon:'🌐',name:'World Citizen',desc:'Visit 20 countries',check:G=>(G.countriesVisited||[]).length>=20},
  {id:'philanthropist',icon:'🤲',name:'Philanthropist',desc:'Donate $500K in lifetime',check:G=>(G.lifetimeDonated||0)>=500000},
  {id:'pet_lover',icon:'🐾',name:'Pet Lover',desc:'Own 3 or more pets simultaneously',check:G=>ACH_SAFE.alivePets(G)>=3||!!G.achievements?.pet_family},
  {id:'perfect_s',icon:'💯',name:'Perfect Life',desc:'90+ in all 6 main stats',check:G=>G.happiness>=90&&G.health>=90&&G.smarts>=90&&G.looks>=90&&G.fitness>=90&&G.fame>=90},
  {id:'midlife',icon:'🏎️',name:'Midlife Crisis',desc:'Survive your midlife crisis',check:G=>!!G.achievements?.midlife_survived},
  {id:'insurance_ach',icon:'🛡️',name:'Responsible Adult',desc:'Have all 3 insurance types',check:G=>G.insurance?.health&&G.insurance?.car&&G.insurance?.life},
  {id:'inheritance_ach',icon:'💝',name:'Good Inheritance',desc:'Receive a large inheritance',check:G=>(G.inheritanceReceived||0)>=50000||((G.familySupport||0)>=50000&&G.familySupportReleased)},

  // Goals & Ambitions
  {id:'first_goal',icon:'🎯',name:'Goal Getter',desc:'Complete your first life goal',check:G=>ACH_SAFE.completedGoals(G)>=1||!!G.achievements?.first_goal},
  {id:'all_goals',icon:'🏆',name:'Life Complete',desc:'Complete all active life goals',check:G=>ACH_SAFE.allGoalsDone(G)},
  {id:'renaissance_ach',icon:'🎭',name:'Renaissance Person',desc:'Achieve the Renaissance ambition',check:G=>G.ambitionAchieved&&G.ambition==='renaissance'},
  {id:'sage_ach',icon:'🦉',name:'The Sage',desc:'Achieve the Sage ambition',check:G=>G.ambitionAchieved&&G.ambition==='sage'},
  {id:'legend_amb',icon:'🏅',name:'Living Legend',desc:'Achieve The Legend ambition',check:G=>G.ambitionAchieved&&G.ambition==='legend'},
  {id:'minimalist_amb',icon:'🧘',name:'Simple Life',desc:'Achieve The Minimalist ambition',check:G=>G.ambitionAchieved&&G.ambition==='minimalist'},

  // Story / Legacy
  {id:'ai_story_ach',icon:'📖',name:'Story Weaver',desc:'Trigger a personalized story event',check:G=>G.log?.some(e=>String(e.text||'').includes('Story Event:')||String(e.text||'').includes('AI Story:'))},
  {id:'legacy_start',icon:'🌳',name:'Born Into Legacy',desc:'Start a life with a Legacy Inheritance',check:G=>!!G.legacyBonus&&G.legacyBonus!=='none'},
  {id:'dynasty_3',icon:'👑',name:'Dynasty',desc:'Play 3 or more lives',check:G=>ACH_SAFE.prestige().livesPlayed>=3},
  {id:'prestige_vet',icon:'⭐',name:'Veteran Soul',desc:'Play 7+ lives',check:G=>ACH_SAFE.prestige().livesPlayed>=7},
  {id:'chapter_senior',icon:'📖',name:'Chapter: Senior',desc:'Unlock the Senior Years chapter',check:G=>(G.chapters||[]).some(c=>c.id==='senior')},
  {id:'all_chapters',icon:'📚',name:'Full Story',desc:'Unlock all 7 life chapters in a single life',check:G=>(G.chapters||[]).length>=7},

  // Traits
  {id:'maverick_ach',icon:'🎲',name:'Maverick Life',desc:'Play with the Maverick trait',check:G=>G.trait==='maverick'},
  {id:'naturalist_ach',icon:'🌿',name:'One with Nature',desc:'Play with the Naturalist trait',check:G=>G.trait==='naturalist'},
  {id:'scholar_ach',icon:'📚',name:'Scholar Path',desc:'Play with the Scholar trait',check:G=>G.trait==='scholar'},
  {id:'cyber_criminal',icon:'💾',name:'Ghost in the Machine',desc:'Commit 5 digital crimes',rarity:'rare',check:G=>(G.crimes||[]).filter(c=>['ransomware','crypto_theft','darknet_market','deepfake_scam','hacking'].includes(c.id)).length>=5},
  {id:'cipher_boss',icon:'🔐',name:'Cipher Boss',desc:'Join the Cipher Collective gang',rarity:'epic',check:G=>G.gang?.id==='cipher_collective'},
  {id:'ai_master',icon:'🤖',name:'AI Pioneer',desc:'Reach Level 4 in Artificial Intelligence skill',rarity:'rare',check:G=>(G.skills?.ai_ml||0)>=4},
  {id:'crypto_wizard',icon:'🪙',name:'Crypto Wizard',desc:'Reach Level 3 in Crypto & DeFi skill',rarity:'uncommon',check:G=>(G.skills?.crypto||0)>=3},
  {id:'mental_peak',icon:'🧘',name:'Peak Mental Wellness',desc:'Reach 90+ mental wellness',rarity:'uncommon',check:G=>(G.mentalHealth||0)>=90},
  {id:'burnout_survivor',icon:'🌅',name:'Burnout Survivor',desc:'Recover from burnout',rarity:'uncommon',check:G=>(G.burnoutRecoveries||0)>=1},
  {id:'highly_reputed',icon:'⭐',name:'Pillar of Society',desc:'Reach 90+ reputation',rarity:'rare',check:G=>(G.reputation||0)>=90},
  {id:'mindful_monk',icon:'🧘',name:'Mindful Monk',desc:'Complete the Mindful Monk ambition',rarity:'epic',check:G=>G.ambitionAchieved&&G.ambition==='mindful'},
  {id:'cyber_pioneer',icon:'💻',name:'Cyber Pioneer',desc:'Complete the Cyber Pioneer ambition',rarity:'epic',check:G=>G.ambitionAchieved&&G.ambition==='cyber_pioneer'},
  {id:'ai_hustle',icon:'🤖',name:'Automator',desc:'Earn $50,000 from AI tools hustle',rarity:'uncommon',check:G=>(G.hustle?.gigEarnings?.ai_agency||0)>=50000},
  {id:'digital_artist',icon:'🎨',name:'Digital Creator',desc:'Earn $20,000 from digital art',rarity:'uncommon',check:G=>(G.hustle?.gigEarnings?.digital_art||0)>=20000},

  // v21: New achievements
  {id:'mood_euphoric',icon:'🌟',name:'Euphoric Life',desc:'Reach Euphoric mood for 3 consecutive years',rarity:'rare',check:G=>G.mood?.label==='Euphoric'&&(G.mood?.streak||0)>=3},
  {id:'mood_comeback',icon:'💪',name:'Great Comeback',desc:'Go from Miserable mood to Happy within 3 years',rarity:'uncommon',check:G=>!!G.achievements?.mood_comeback},
  {id:'cooking_master',icon:'🍳',name:'Home Chef',desc:'Use the Cooking Class action 5 times',rarity:'uncommon',check:G=>(G.cookingClassCount||0)>=5},
  {id:'sunrise_soul',icon:'🌅',name:'Sunrise Soul',desc:'Watch 3 sunrises',rarity:'uncommon',check:G=>(G.sunriseCount||0)>=3},
  {id:'cold_shower_streak',icon:'🚿',name:'Ice Warrior',desc:'Take 5 cold showers',rarity:'uncommon',check:G=>(G.coldShowerCount||0)>=5},
  {id:'screen_detox',icon:'📵',name:'Digital Detox',desc:'Complete a social media break action',rarity:'common',check:G=>!!G.achievements?.screen_detox},
  {id:'walker_zen',icon:'🚶',name:'Mindful Walker',desc:'Complete 5 mindful walks',rarity:'common',check:G=>(G.mindfulWalkCount||0)>=5},
  {id:'volunteer_hero',icon:'🤲',name:'Community Hero',desc:'Volunteer 10 times',rarity:'rare',check:G=>(G.volunteerCount||0)>=10},
  {id:'news_reader',icon:'📰',name:'Well Informed',desc:'Read news 10 times',rarity:'common',check:G=>(G.newsReadCount||0)>=10},
  {id:'animal_friend',icon:'🐾',name:'Animal Friend',desc:'Visit the animal shelter 3 times',rarity:'common',check:G=>(G.petVisitCount||0)>=3},
];
