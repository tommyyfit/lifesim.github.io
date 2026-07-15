/* data/properties.js */
const PROPERTIES=[
{id:'studio',     icon:'🏢',name:'Studio Apartment',    price:65000,   value:65000,  rent:0,    appRate:.04,desc:'Compact and modern city living'},
{id:'apt1bed',    icon:'🏠',name:'1-Bed Apartment',     price:125000,  value:125000, rent:0,    appRate:.04,desc:'Comfortable city flat'},
{id:'apt2bed',    icon:'🏠',name:'2-Bed Apartment',     price:190000,  value:190000, rent:0,    appRate:.04,desc:'Spacious family apartment'},
{id:'townhouse',  icon:'🏘️',name:'Townhouse',           price:290000,  value:290000, rent:0,    appRate:.04,desc:'Multi-floor town living'},
{id:'house',      icon:'🏡',name:'Suburban House',      price:390000,  value:390000, rent:0,    appRate:.05,desc:'Garden, garage, quiet street'},
{id:'penthouse',  icon:'🌆',name:'Penthouse Suite',     price:950000,  value:950000, rent:0,    appRate:.05,desc:'Panoramic skyline views'},
{id:'villa',      icon:'🏖️',name:'Beachfront Villa',    price:1600000, value:1600000,rent:0,    appRate:.06,desc:'Private pool and beach access'},
{id:'mansion',    icon:'🏰',name:'Mansion',             price:3800000, value:3800000,rent:0,    appRate:.05,desc:'10 bedrooms, full staff quarters'},
{id:'castle',     icon:'🏯',name:'Private Castle',      price:10000000,value:10000000,rent:0,   appRate:.04,desc:'Historic fortress — ultimate flex'},
// Rental income
{id:'r_room',     icon:'🛖',name:'Rental Room (HMO)',   price:48000,   value:48000,  rent:7200, appRate:.04,desc:'Single room let out monthly'},
{id:'r_studio',   icon:'🏗️',name:'Buy-to-Let Studio',  price:95000,   value:95000,  rent:10800,appRate:.04,desc:'Studio let for monthly income'},
{id:'r_apt',      icon:'🏢',name:'Rental Apartment',    price:210000,  value:210000, rent:18000,appRate:.04,desc:'Long-term tenant income'},
{id:'r_house',    icon:'🏚️',name:'Rental House',       price:400000,  value:400000, rent:30000,appRate:.05,desc:'Family rental — solid returns'},
{id:'r_block',    icon:'🏙️',name:'Apartment Block',    price:2200000, value:2200000,rent:200000,appRate:.05,desc:'Multiple units, big passive income'},
{id:'r_commercial',icon:'🏬',name:'Commercial Unit',    price:5500000, value:5500000,rent:520000,appRate:.04,desc:'Office or retail space'},
];
const VEHICLES=[
{id:'bike',     icon:'🚲',name:'Bicycle',        price:400,    value:250,    desc:'Free to run, eco-friendly'},
{id:'scooter',  icon:'🛵',name:'Scooter',        price:3500,   value:2100,   desc:'Nip around town quickly'},
{id:'moto',     icon:'🏍️',name:'Motorcycle',    price:13000,  value:9500,   desc:'Freedom and open roads'},
{id:'used_car', icon:'🚗',name:'Used Hatchback', price:7500,   value:4800,   desc:'Reliable daily driver'},
{id:'sedan',    icon:'🚙',name:'New Sedan',      price:29000,  value:21000,  desc:'Comfortable modern commuter'},
{id:'suv',      icon:'🚐',name:'Family SUV',     price:54000,  value:40000,  desc:'Space for everyone'},
{id:'pickup',   icon:'🛻',name:'Pickup Truck',   price:47000,  value:35000,  desc:'Work hard, play harder'},
{id:'sports',   icon:'🏎️',name:'Sports Car',    price:135000, value:98000,  desc:'0-60 in 3.8 seconds flat'},
{id:'luxury',   icon:'🚘',name:'Luxury Saloon',  price:230000, value:170000, desc:'Prestige and pure comfort'},
{id:'suv_lux',  icon:'🚖',name:'Luxury SUV',     price:170000, value:125000, desc:'Premium family hauler'},
{id:'supercar', icon:'🔥',name:'Supercar',       price:600000, value:450000, desc:'Track-day monster'},
{id:'hyper',    icon:'💎',name:'Hypercar',       price:2800000,value:2100000,desc:'One of 50 made worldwide'},
{id:'yacht',    icon:'⛵',name:'Luxury Yacht',   price:3500000,value:2700000,desc:'Private sea adventures'},
{id:'jet',      icon:'🛩️',name:'Private Jet',   price:20000000,value:15000000,desc:'Fly on your schedule'},
];

/* Release — Assets 2.5 expanded market data */
(function(){
  const addUnique=(arr,items)=>items.forEach(item=>{ if(!arr.some(x=>x.id===item.id)) arr.push(item); });
  addUnique(PROPERTIES,[
    {id:'micro_loft',icon:'🏙️',name:'Micro Loft',price:82000,value:82000,rent:0,appRate:.045,desc:'Tiny premium city base with low running costs'},
    {id:'smart_condo',icon:'🪟',name:'Smart Condo',price:240000,value:240000,rent:0,appRate:.047,desc:'Modern smart-home apartment with strong lifestyle value'},
    {id:'country_cottage',icon:'🌲',name:'Country Cottage',price:265000,value:265000,rent:0,appRate:.035,desc:'Quiet rural escape, low stress and cozy weekends'},
    {id:'eco_home',icon:'🌱',name:'Eco Home',price:520000,value:520000,rent:0,appRate:.052,desc:'Efficient home with low utility drag and green status'},
    {id:'lake_house',icon:'🚤',name:'Lake House',price:720000,value:720000,rent:0,appRate:.046,desc:'Calm water views, family memories and lifestyle boost'},
    {id:'mountain_chalet',icon:'🏔️',name:'Mountain Chalet',price:870000,value:870000,rent:0,appRate:.044,desc:'Winter retreat with high upkeep but huge charm'},
    {id:'city_duplex',icon:'🏘️',name:'City Duplex',price:1100000,value:1100000,rent:0,appRate:.049,desc:'Live large in the city with room to grow'},
    {id:'gated_villa',icon:'🌴',name:'Gated Villa',price:2800000,value:2800000,rent:0,appRate:.052,desc:'Private luxury living with major status value'},
    {id:'island_estate',icon:'🏝️',name:'Private Island Estate',price:35000000,value:35000000,rent:0,appRate:.038,desc:'Endgame lifestyle asset for dynastic wealth'},
    {id:'student_hmo',icon:'🎓',name:'Student HMO',price:280000,value:280000,rent:36000,appRate:.041,desc:'Shared student housing with solid yield and tenant churn'},
    {id:'duplex_rental',icon:'🏘️',name:'Duplex Rental',price:520000,value:520000,rent:52000,appRate:.046,desc:'Two-unit rental with better cashflow control'},
    {id:'airbnb_unit',icon:'🧳',name:'Short-Term Rental Unit',price:610000,value:610000,rent:68000,appRate:.045,desc:'Higher upside, higher vacancy and management work'},
    {id:'parking_garage',icon:'🅿️',name:'Parking Garage',price:1250000,value:1250000,rent:118000,appRate:.033,desc:'Boring, durable cashflow with low drama'},
    {id:'storage_units',icon:'📦',name:'Storage Unit Facility',price:1850000,value:1850000,rent:165000,appRate:.036,desc:'Low-touch small-unit rental income'},
    {id:'co_living_house',icon:'🛋️',name:'Co-Living House',price:900000,value:900000,rent:96000,appRate:.046,desc:'Flexible housing model with strong urban demand'},
    {id:'mini_retail_strip',icon:'🏪',name:'Mini Retail Strip',price:3200000,value:3200000,rent:280000,appRate:.039,desc:'Multiple small shops, vacancy risk and commercial upside'},
    {id:'boutique_hotel_asset',icon:'🏨',name:'Boutique Hotel Property',price:8500000,value:8500000,rent:760000,appRate:.043,desc:'High-maintenance hospitality asset with powerful cashflow'}
  ]);
  addUnique(VEHICLES,[
    {id:'ev_compact',icon:'🔋',name:'Compact EV',price:36000,value:29500,desc:'Low running costs and quiet city commuting',statusBonus:1,accidentRisk:.018,depRate:.055,repairRate:.018},
    {id:'classic_roadster',icon:'🏁',name:'Classic Roadster',price:78000,value:76000,desc:'Collectible driving feel, appreciates if cared for',statusBonus:4,accidentRisk:.025,depRate:.012,repairRate:.032,classic:true},
    {id:'executive_ev',icon:'🚘',name:'Executive EV',price:92000,value:76000,desc:'Clean status symbol for business and city life',statusBonus:5,accidentRisk:.017,depRate:.05,repairRate:.02},
    {id:'offroad_4x4',icon:'🛻',name:'Off-Road 4x4',price:68000,value:51000,desc:'Adventure truck with higher maintenance',statusBonus:2,accidentRisk:.035,depRate:.06,repairRate:.026},
    {id:'camper_van',icon:'🚐',name:'Camper Van',price:85000,value:64000,desc:'Travel freedom, happiness and lifestyle stories',statusBonus:3,accidentRisk:.022,depRate:.045,repairRate:.024},
    {id:'track_car',icon:'🏎️',name:'Track Car',price:210000,value:158000,desc:'High fun, high repair and accident risk',statusBonus:8,accidentRisk:.055,depRate:.07,repairRate:.044},
    {id:'armored_suv',icon:'🛡️',name:'Armored SUV',price:420000,value:340000,desc:'Security and elite presence, very expensive upkeep',statusBonus:9,accidentRisk:.018,depRate:.055,repairRate:.05},
    {id:'limousine',icon:'🎩',name:'Private Limousine',price:310000,value:215000,desc:'Prestige transport for fame and business image',statusBonus:7,accidentRisk:.02,depRate:.065,repairRate:.035},
    {id:'helicopter',icon:'🚁',name:'Private Helicopter',price:4800000,value:3600000,desc:'Fast travel, huge status and serious running costs',statusBonus:15,accidentRisk:.032,depRate:.045,repairRate:.055},
    {id:'sailboat',icon:'⛵',name:'Performance Sailboat',price:720000,value:590000,desc:'Luxury leisure without full yacht-level cost',statusBonus:6,accidentRisk:.02,depRate:.035,repairRate:.032}
  ]);
  const HOME_UPGRADES=[
    {id:'solar_roof',icon:'☀️',name:'Solar Roof',price:28000,valueBoost:.055,conditionBoost:8,upkeepMod:-.08,desc:'Lower bills and improve property value'},
    {id:'security_system',icon:'🛡️',name:'Smart Security',price:9500,valueBoost:.018,conditionBoost:4,stress:-2,desc:'Lower break-in risk and peace of mind'},
    {id:'home_gym',icon:'🏋️',name:'Home Gym',price:18000,valueBoost:.022,conditionBoost:3,fitness:4,desc:'Yearly fitness support and lifestyle value'},
    {id:'garden_studio',icon:'🌿',name:'Garden Studio',price:42000,valueBoost:.07,conditionBoost:5,smarts:1,happiness:3,desc:'Workspace, creative room and extra property value'},
    {id:'private_cinema',icon:'🎬',name:'Private Cinema',price:55000,valueBoost:.04,conditionBoost:3,happiness:5,desc:'Pure lifestyle comfort and status'},
    {id:'guest_suite',icon:'🛌',name:'Guest Suite',price:76000,valueBoost:.085,conditionBoost:5,happiness:4,desc:'Better family visits and premium resale appeal'},
    {id:'pool_spa',icon:'🏊',name:'Pool & Spa',price:120000,valueBoost:.095,conditionBoost:3,happiness:7,upkeepMod:.06,desc:'Luxury lifestyle with extra maintenance'},
    {id:'rental_furnishing',icon:'🛋️',name:'Rental Furnishing Package',price:22000,valueBoost:.035,rentBoost:.11,conditionBoost:6,desc:'Higher tenant appeal and rent potential'}
  ];
  const BUSINESS_ASSETS=[
    {id:'vending_route',icon:'🥤',name:'Vending Machine Route',price:18000,value:16000,income:3200,condition:82,desc:'Small passive income route with simple maintenance'},
    {id:'photo_booth_fleet',icon:'📸',name:'Photo Booth Fleet',price:42000,value:38000,income:7800,condition:80,desc:'Events and weddings create steady side income'},
    {id:'delivery_van_fleet',icon:'🚚',name:'Delivery Van Fleet',price:110000,value:92000,income:18500,condition:76,desc:'Useful for e-commerce, logistics and business scaling'},
    {id:'media_studio',icon:'🎥',name:'Media Studio Equipment',price:68000,value:52000,income:10500,condition:84,desc:'Boosts creator, marketing and content business paths'},
    {id:'mobile_app_ip',icon:'📱',name:'Mobile App IP',price:95000,value:90000,income:14000,condition:88,desc:'Digital asset with upside but product decay'},
    {id:'saas_infra',icon:'☁️',name:'SaaS Infrastructure',price:240000,value:210000,income:42000,condition:86,desc:'Recurring software income with tech maintenance'},
    {id:'small_warehouse',icon:'🏭',name:'Small Warehouse',price:410000,value:390000,income:54000,condition:78,desc:'Supports storage, distribution and rental opportunities'},
    {id:'franchise_license',icon:'🍔',name:'Franchise License',price:620000,value:560000,income:86000,condition:82,desc:'Brand-backed income with fees and audits'},
    {id:'creator_agency_stack',icon:'🧠',name:'AI Creator Agency Stack',price:150000,value:135000,income:26000,condition:85,desc:'Software, templates and workflow systems for content services'},
    {id:'mining_rig_farm',icon:'🪙',name:'Crypto Mining Rig Farm',price:300000,value:220000,income:52000,condition:72,desc:'Volatile cashflow, energy bills and hardware decay'}
  ];
  const LUXURY_ASSETS=[
    {id:'lux_watch',icon:'⌚',name:'Luxury Watch',price:18000,value:16000,status:3,condition:90,desc:'Small status piece with collectible potential'},
    {id:'tailored_wardrobe',icon:'🤵',name:'Tailored Wardrobe',price:12000,value:6000,status:2,looks:2,condition:86,desc:'Boosts image, interviews and social presence'},
    {id:'private_club',icon:'🥂',name:'Private Club Membership',price:45000,value:12000,status:6,fame:2,condition:100,desc:'Network access, status and recurring fees'},
    {id:'art_collection',icon:'🖼️',name:'Modern Art Collection',price:125000,value:125000,status:5,condition:91,desc:'Alternative wealth signal with market swings'},
    {id:'wine_cellar',icon:'🍷',name:'Wine Cellar',price:70000,value:62000,status:4,condition:88,desc:'Luxury collection with slow appreciation'},
    {id:'designer_furniture',icon:'🛋️',name:'Designer Furniture',price:55000,value:36000,status:3,happiness:2,condition:84,desc:'Home comfort and social flex'},
    {id:'private_art_advisor',icon:'🧑‍🎨',name:'Private Art Advisor',price:250000,value:110000,status:8,fame:3,condition:100,desc:'Elite network and better collectible decisions'},
    {id:'rare_diamond',icon:'💎',name:'Investment Diamond',price:420000,value:390000,status:8,condition:95,desc:'Portable high-status store of value'}
  ];
  const COLLECTIBLES=[
    {id:'rare_sneakers',icon:'👟',name:'Rare Sneaker Collection',price:6500,value:6800,volatility:.22,condition:88,desc:'Culture asset with hype cycles'},
    {id:'comic_collection',icon:'📚',name:'Golden Age Comics',price:14000,value:14500,volatility:.12,condition:90,desc:'Nostalgic collectible with steady buyers'},
    {id:'trading_cards',icon:'🃏',name:'Trading Card Portfolio',price:9000,value:9200,volatility:.28,condition:85,desc:'High hype, high volatility'},
    {id:'vintage_games',icon:'🎮',name:'Vintage Game Collection',price:11500,value:12000,volatility:.16,condition:87,desc:'Retro tech collection with niche demand'},
    {id:'classic_camera',icon:'📷',name:'Classic Camera Kit',price:7800,value:7600,volatility:.10,condition:86,desc:'Creative collectible with small status boost'},
    {id:'vinyl_records',icon:'💿',name:'Rare Vinyl Records',price:10500,value:10800,volatility:.14,condition:88,desc:'Music collection with loyal market'},
    {id:'sports_memorabilia',icon:'🏆',name:'Sports Memorabilia',price:22000,value:22500,volatility:.24,condition:86,desc:'Can spike when legends return to headlines'},
    {id:'classic_car_project',icon:'🚙',name:'Classic Car Project',price:58000,value:52000,volatility:.18,condition:55,desc:'Needs work, but can become a passion asset'}
  ];
  if(typeof window!=='undefined'){
    window.PROPERTIES=PROPERTIES; window.VEHICLES=VEHICLES;
    window.HOME_UPGRADES=HOME_UPGRADES; window.BUSINESS_ASSETS=BUSINESS_ASSETS;
    window.LUXURY_ASSETS=LUXURY_ASSETS; window.COLLECTIBLES=COLLECTIBLES;
  }
})();