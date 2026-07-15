/* data/names.js — LifeSim data */

const MNAMES=[
  'James','William','Oliver','Liam','Noah','Ethan','Lucas','Mason','Logan','Henry',
  'Jack','Daniel','Alexander','Mateo','David','Samuel','Leo','Oscar','Felix','Adrian',
  'Anton','Pavel','Milan','Jakub','Tomáš','Jan','Martin','Petr','Lukáš','Šimon',
  'Kai','Finn','Cole','River','Blake','Noel','Atlas','Zane','Marcus','Julian',
  'Hugo','Arthur','Theo','Sebastian','Benjamin','Elias','Owen','Wyatt','Ezra','Caleb',
  'Adam','Matěj','Ondřej','Vojtěch','Filip','Max','Dominik','Nicolas','Tobias','Robin'
];

const FNAMES=[
  'Emma','Olivia','Ava','Isabella','Sophia','Mia','Charlotte','Amelia','Harper','Luna',
  'Sofia','Camila','Aria','Scarlett','Victoria','Madison','Layla','Penelope','Chloe','Natasha',
  'Karolína','Anna','Elena','Maria','Sara','Nikola','Tereza','Lucie','Veronika','Klára',
  'Zoe','Isla','Freya','Aurora','Hazel','Violet','Stella','Ruby','Nora','Iris',
  'Cora','Phoebe','Naomi','Leah','Clara','Maya','Lydia','Eva','Rosa','Ema',
  'Adéla','Natálie','Eliška','Kristýna','Barbora','Nela','Julie','Sofie','Denisa','Laura'
];

const SURNAMES=[
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson','Moore',
  'Taylor','Anderson','Thomas','Jackson','Harris','Martin','Thompson','Lee','Walker',
  'Novák','Dvořák','Horák','Blažek','Fischer','Müller','Schneider','Weber','Meyer',
  'Černý','Procházka','Kučera','Veselý','Pospíšil','Kopecký','Kratochvíl',
  'Svoboda','Novotný','Pokorný','Hájek','Jelínek','Růžička','Beneš','Fiala',
  'Reynolds','Hayes','Sullivan','Murphy',"O'Brien",'Walsh','Kelly','Quinn'
];

const COUNTRY_NAME_GROUPS={
  'United States':'anglo',
  'United Kingdom':'anglo',
  'Canada':'anglo',
  'Australia':'anglo',
  'New Zealand':'anglo',
  'Czech Republic':'czech',
  'Poland':'slavic',
  'Russia':'russian',
  'Germany':'germanic',
  'Austria':'germanic',
  'Switzerland':'germanic',
  'Netherlands':'germanic',
  'Sweden':'nordic',
  'Norway':'nordic',
  'Denmark':'nordic',
  'Finland':'nordic',
  'France':'french',
  'Spain':'iberian',
  'Portugal':'iberian',
  'Italy':'italian',
  'Brazil':'brazilian',
  'Mexico':'mexican',
  'Argentina':'latam',
  'Japan':'japanese',
  'South Korea':'korean',
  'China':'chinese',
  'Singapore':'singapore',
  'India':'indian',
  'UAE':'arabic',
  'South Africa':'south_african',
  'Nigeria':'nigerian',
};

const COUNTRY_NAME_POOLS={
  global:{
    male:MNAMES,
    female:FNAMES,
    surnames:SURNAMES,
  },
  anglo:{
    male:['James','William','Oliver','Liam','Noah','Henry','Jack','Daniel','Lucas','Benjamin','Ethan','Owen','Wyatt','Caleb','Julian'],
    female:['Emma','Olivia','Charlotte','Amelia','Sophia','Isla','Harper','Lily','Grace','Ella','Ava','Scarlett','Violet','Ruby','Nora'],
    surnames:['Smith','Johnson','Brown','Taylor','Wilson','Walker','Murphy','Kelly','Hayes','Quinn','Bennett','Cooper','Morgan','Reed','Brooks'],
  },
  czech:{
    male:['Jan','Jakub','Tomáš','Petr','Martin','Lukáš','Adam','Matěj','Ondřej','Vojtěch','Filip','David','Marek','Michal','Dominik'],
    female:['Tereza','Lucie','Veronika','Klára','Anna','Ema','Adéla','Natálie','Eliška','Karolína','Barbora','Kristýna','Julie','Nela','Sofie'],
    surnames:['Novák','Svoboda','Novotný','Dvořák','Černý','Procházka','Kučera','Veselý','Horák','Kopecký','Fiala','Hájek','Jelínek','Pokorný','Růžička'],
  },
  slavic:{
    male:['Jakub','Mateusz','Paweł','Kacper','Mikołaj','Adrian','Milan','Tomasz','Piotr','Michał','Adam','Filip','Szymon','Bartosz','Patryk'],
    female:['Zofia','Julia','Maja','Natalia','Weronika','Anna','Aleksandra','Nikola','Maria','Emilia','Oliwia','Alicja','Laura','Klara','Magdalena'],
    surnames:['Nowak','Kowalski','Wiśniewski','Wójcik','Kowalczyk','Kamiński','Lewandowski','Zieliński','Szymański','Dąbrowski'],
  },
  russian:{
    male:['Ivan','Dmitry','Sergey','Alexei','Nikolai','Vladimir','Andrei','Mikhail','Pavel','Artem','Maxim','Roman','Kirill','Ilya','Yuri'],
    female:['Anastasia','Daria','Ekaterina','Irina','Olga','Yulia','Svetlana','Maria','Alina','Polina','Elena','Natalia','Vera','Ksenia','Sofia'],
    surnames:['Ivanov','Petrov','Smirnov','Volkov','Sokolov','Kuznetsov','Popov','Vasiliev','Morozov','Lebedev'],
  },
  germanic:{
    male:['Lukas','Finn','Noah','Leon','Felix','Paul','Jonas','Maximilian','Elias','Julian','Theo','Ben','Emil','Moritz','Anton'],
    female:['Emma','Mia','Lena','Sofia','Anna','Leonie','Hannah','Clara','Ella','Laura','Marie','Emilia','Lina','Amelie','Nora'],
    surnames:['Müller','Schneider','Fischer','Weber','Meyer','Wagner','Becker','Hoffmann','Schmid','Keller','Bauer','Koch','Richter','Wolf','Schäfer'],
  },
  nordic:{
    male:['Liam','Noah','Oliver','Elias','William','Hugo','Theo','Aksel','Emil','Søren','Magnus','Oscar','Nils','Erik','Viggo'],
    female:['Ella','Sofia','Alma','Freja','Astrid','Maja','Ingrid','Emilia','Nora','Saga','Linnea','Ida','Liv','Klara','Selma'],
    surnames:['Andersen','Jensen','Nielsen','Hansen','Johansson','Karlsson','Lindberg','Svensson','Berg','Dahl','Larsen','Olsen','Nyström','Holm','Eriksson'],
  },
  french:{
    male:['Louis','Jules','Gabriel','Arthur','Hugo','Lucas','Léo','Nathan','Théo','Paul','Noah','Raphaël','Adam','Maël','Antoine'],
    female:['Emma','Louise','Alice','Jade','Chloé','Léa','Manon','Camille','Lucie','Rose','Ambre','Inès','Anna','Lina','Clara'],
    surnames:['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand','Moreau','Simon','Laurent','Lefebvre','Michel','Garcia','David'],
  },
  iberian:{
    male:['Mateo','Santiago','Alejandro','Daniel','Hugo','Pablo','Leo','Lucas','Tiago','Diego','Martín','Álvaro','Nicolás','Adrián','Miguel'],
    female:['Sofía','Camila','Lucía','Valentina','Elena','Sara','Isabella','Julia','Marta','Clara','María','Paula','Daniela','Carla','Alba'],
    surnames:['García','Fernández','López','Martínez','Sánchez','Pereira','Rodrigues','Costa','Silva','Gómez','Díaz','Moreno','Torres','Ramos','Castro'],
  },
  italian:{
    male:['Lorenzo','Matteo','Leonardo','Alessandro','Tommaso','Riccardo','Andrea','Marco','Gabriele','Davide','Francesco','Giovanni','Niccolò','Edoardo','Samuele'],
    female:['Sofia','Giulia','Aurora','Ginevra','Alice','Emma','Beatrice','Chiara','Martina','Anna','Greta','Vittoria','Elisa','Ludovica','Noemi'],
    surnames:['Rossi','Russo','Ferrari','Esposito','Bianchi','Romano','Colombo','Ricci','Marino','Greco','Bruno','Gallo','Conti','De Luca','Mancini'],
  },
  brazilian:{
    male:['Miguel','Arthur','Heitor','Theo','Davi','Gabriel','Pedro','Lucas','Matheus','João','Bernardo','Rafael','Enzo','Gustavo','Felipe'],
    female:['Helena','Alice','Laura','Valentina','Heloísa','Sofia','Júlia','Isabella','Maria','Clara','Manuela','Luiza','Cecília','Eloá','Lívia'],
    surnames:['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Costa','Gomes','Martins','Lima','Araújo','Ribeiro','Barbosa'],
  },
  mexican:{
    male:['Santiago','Mateo','Sebastián','Leonardo','Diego','Emiliano','Ángel','Daniel','Alejandro','Gael','Miguel','Andrés','José','David','Carlos'],
    female:['Sofía','Valentina','Regina','Camila','Ximena','Renata','Natalia','Victoria','Daniela','Mariana','Lucía','Fernanda','Ana','Isabella','Paulina'],
    surnames:['Hernández','García','Martínez','López','González','Pérez','Sánchez','Ramírez','Cruz','Flores','Gómez','Morales','Vázquez','Reyes','Torres'],
  },
  latam:{
    male:['Mateo','Benjamín','Thiago','Tobías','Joaquín','Lautaro','Franco','Santino','Felipe','Bruno','Agustín','Nicolás','Tomás','Juan','Simón'],
    female:['Sofía','Martina','Valentina','Mora','Emilia','Julieta','Catalina','Renata','Lucía','Agustina','Isabella','Camila','Emma','Alma','Florencia'],
    surnames:['González','Rodríguez','López','Fernández','Martínez','Díaz','Torres','Romero','Álvarez','Ruiz','Sosa','Castro','Ortiz','Suárez','Molina'],
  },
  japanese:{
    male:['Haruto','Yuto','Sota','Yuki','Ren','Kaito','Itsuki','Daiki','Minato','Takumi','Riku','Haru','Aoi','Kota','Toma'],
    female:['Yui','Aoi','Hina','Mei','Rin','Sakura','Akari','Mio','Yuna','Nanami','Hana','Kokona','Riko','Sara','Emi'],
    surnames:['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura','Kobayashi','Kato','Yoshida','Yamada','Sasaki','Yamaguchi','Matsumoto'],
  },
  korean:{
    male:['Minjun','Seojun','Dojun','Jiho','Hyunwoo','Jisung','Taeyang','Yujin','Sunwoo','Hajun','Joon','Minho','Suhyun','Daehyun','Jaewon'],
    female:['Seoyeon','Jiwon','Yuna','Sujin','Minji','Chaeyoung','Jiyeon','Harin','Eunji','Nari','Hana','Sora','Yerin','Mina','Dahyun'],
    surnames:['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon','Jang','Lim','Han','Oh','Seo','Shin','Kwon'],
  },
  chinese:{
    male:['Wei','Jun','Hao','Yichen','Ming','Tao','Jian','Chen','Bo','Kai','Lei','Zhihao','Haoran','Yuxuan','Jie'],
    female:['Mei','Yue','Xinyi','Jing','Lan','Yuna','Na','Xia','Lina','Qiao','Yuting','Jia','Hui','Anqi','Lili'],
    surnames:['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao','Wu','Zhou','Xu','Sun','Ma','Zhu','Hu'],
  },
  singapore:{
    male:['Ethan','Lucas','Kai','Wei','Jun','Arjun','Noah','Marcus','Jayden','Hao','Ryan','Aiden','Zayan','Dylan','Ravi'],
    female:['Chloe','Grace','Mei','Alicia','Jia','Yuna','Anya','Sophia','Rina','Aisha','Nora','Priya','Siti','Amelia','Leah'],
    surnames:['Tan','Lim','Lee','Ng','Wong','Goh','Chen','Ong','Koh','Singh','Chua','Teo','Yeo','Loh','Pillai'],
  },
  indian:{
    male:['Arjun','Vivaan','Aarav','Krishna','Aditya','Rohan','Ishaan','Kabir','Veer','Rahul','Aryan','Dev','Ayaan','Vihaan','Karan'],
    female:['Aanya','Diya','Anaya','Priya','Saanvi','Isha','Kavya','Riya','Meera','Anika','Nisha','Aarohi','Tara','Myra','Sara'],
    surnames:['Sharma','Patel','Singh','Kumar','Gupta','Verma','Joshi','Mehta','Reddy','Kapoor','Nair','Rao','Iyer','Malhotra','Chopra'],
  },
  arabic:{
    male:['Omar','Zayed','Khalid','Faisal','Hamad','Saif','Yousef','Ahmed','Rashid','Salem','Ali','Hassan','Ibrahim','Mansour','Nasser'],
    female:['Aisha','Fatima','Noor','Mariam','Layla','Zahra','Sara','Huda','Amira','Reem','Yasmin','Lina','Salma','Dana','Maha'],
    surnames:['Al Nahyan','Al Maktoum','Al Mansoori','Al Mazrouei','Al Falasi','Al Suwaidi','Al Kaabi','Al Marri','Al Nuaimi','Al Hashmi'],
  },
  south_african:{
    male:['Sipho','Themba','Liam','Aiden','Thabo','Neo','Daniel','Ayanda','Ethan','Kabelo','Luca','Mandla','Sibusiso','Jayden','Mpho'],
    female:['Amahle','Naledi','Zara','Lerato','Ava','Thandi','Mia','Ayana','Leah','Nandi','Anika','Lindiwe','Zanele','Emily','Mila'],
    surnames:['Nkosi','Dlamini','Ndlovu','Mokoena','Naidoo','Pillay','Botha','Van Wyk','Jacobs','Smith','Mkhize','Khumalo','Meyer','Davids','Mokoena'],
  },
  nigerian:{
    male:['Chinedu','Emeka','Tunde','Samuel','Ifeanyi','Ayo','David','Kelechi','Obinna','Musa','Ibrahim','Chuka','Daniel','Femi','Uche'],
    female:['Chioma','Amara','Adaeze','Zainab','Kemi','Amina','Ngozi','Temi','Halima','Ifeoma','Blessing','Sade','Maryam','Funke','Nneka'],
    surnames:['Okafor','Adeyemi','Balogun','Ibrahim','Adebayo','Eze','Nwosu','Mohammed','Bello','Umeh','Okonkwo','Olawale','Afolayan','Abubakar','Ojo'],
  },
};

function namePick(arr){
  if(!Array.isArray(arr)||!arr.length)return null;
  if(typeof pick==='function')return pick(arr);
  return arr[Math.floor(Math.random()*arr.length)];
}

function getCountryNamePool(countryName){
  const group=COUNTRY_NAME_GROUPS[countryName]||'global';
  return COUNTRY_NAME_POOLS[group]||COUNTRY_NAME_POOLS.global;
}

function randomNameForCountry(countryName,gender='male'){
  const pool=getCountryNamePool(countryName);
  const list=gender==='female'?(pool.female||FNAMES):(pool.male||MNAMES);
  return namePick(list)||namePick(gender==='female'?FNAMES:MNAMES)||'Alex';
}

function randomSurnameForCountry(countryName){
  const pool=getCountryNamePool(countryName);
  return namePick(pool.surnames||SURNAMES)||namePick(SURNAMES)||'Smith';
}

function countryFirstNames(gender='male'){
  const out=new Set(gender==='female'?FNAMES:MNAMES);
  Object.values(COUNTRY_NAME_POOLS).forEach(pool=>{
    ((gender==='female'?pool.female:pool.male)||[]).forEach(n=>out.add(n));
  });
  return [...out];
}

const COMPANIES=[
  'GlobalCorp','Apex Solutions','Summit Inc','NexusTech','Horizon Ltd',
  'Pinnacle Group','Vertex Corp','Quantum Co','Atlas Industries','Nova Group',
  'Stellar Systems','Echo Dynamics','Prime Partners','Crest Technologies','Vanguard LLC',
  'Iron Peak Ltd','Blue Ocean Co','Meridian Corp','Zenith Group','Catalyst Inc',
  'Fusion Works','Core Dynamics','Peak Performance Co','Luminary Group','TechVault Inc',
  'BrightPath Studio','Northline Systems','UrbanEdge Group','ForgeWorks','Skybridge Labs'
];

const DEATH_QUOTES=[
  '"Life is what happens between birth and death. Make the middle count."',
  '"Every exit is an entrance somewhere else."',
  '"Not all those who wander are lost — but all journeys end."',
  '"You lived. That is more than enough."',
  '"Even the longest night gives way to morning. Yours lasted beautifully."',
  '"The story of your life has reached its final chapter."',
  '"A life fully lived leaves no room for regret."',
  '"What you leave behind is woven into the lives of others."',
  '"In the end, we only regret the chances we did not take."',
  '"Life is not measured only by years, but by the moments that made you feel alive."',
  '"To live is rare. To grow from it is rarer."',
  '"Your story has ended, but the ripples you made go on."',
  '"Every moment you lived is now permanent — yours forever."',
];

const PERSONALITY_TRAITS=[
  {id:'ambitious',icon:'🔥',name:'Ambitious',desc:'+Smarts, stronger career and money drive',startBonus:{smarts:8,happiness:2}},
  {id:'charming',icon:'😎',name:'Charming',desc:'+Looks, easier relationships and social growth',startBonus:{looks:8,happiness:5}},
  {id:'athletic',icon:'💪',name:'Athletic',desc:'+Fitness, better long-term body and health',startBonus:{fitness:14,health:8}},
  {id:'intellectual',icon:'🧠',name:'Intellectual',desc:'+Smarts, better learning and study outcomes',startBonus:{smarts:14}},
  {id:'resilient',icon:'🛡️',name:'Resilient',desc:'+Health, survives pressure better',startBonus:{health:12,happiness:5}},
  {id:'creative',icon:'🎨',name:'Creative',desc:'+Happiness and looks, better creative paths',startBonus:{happiness:10,looks:5}},
  {id:'lucky',icon:'🍀',name:'Lucky',desc:'Better random outcomes and softer bad luck',startBonus:{happiness:8}},
  {id:'disciplined',icon:'📐',name:'Disciplined',desc:'Lower stress impact and slower stat decay',startBonus:{smarts:5,fitness:5}},
  {id:'visionary',icon:'🔭',name:'Visionary',desc:'+Smarts, stronger business and creator upside',startBonus:{smarts:10,happiness:5}},
  {id:'empath',icon:'💙',name:'Empath',desc:'+Karma and deeper relationships',startBonus:{happiness:8,karma:15}},
  {id:'scholar',icon:'📜',name:'Scholar',desc:'Starts with 2 skill points and strong learning',startBonus:{smarts:6,skillPoints:2}},
  {id:'frugal',icon:'🧾',name:'Frugal',desc:'Lower living costs and better money control',startBonus:{money:1200,smarts:3}},
  {id:'maverick',icon:'🎲',name:'Maverick',desc:'Higher risk, higher upside, more chaotic life',startBonus:{happiness:6,fame:3}},
  {id:'naturalist',icon:'🌿',name:'Naturalist',desc:'Nature and healthy routines hit harder',startBonus:{health:8,fitness:6,stress:-4}},
  {id:'stoic',icon:'🗿',name:'Stoic',desc:'Stress fades faster and pressure hurts less',startBonus:{health:6,happiness:4,stress:-8}},
];

function ambitionStockValue(G){
  if(!G?.stocks?.portfolio||!G?.stocks?.prices)return 0;
  return Object.entries(G.stocks.portfolio).reduce((sum,[id,qty])=>sum+Math.round((qty||0)*(G.stocks.prices[id]||0)),0);
}

const LIFE_AMBITIONS=[
  {id:'wealth',icon:'💰',name:'Accumulate Wealth',desc:'Reach $10M net worth',check:G=>typeof netWorth==='function'&&netWorth(G)>=10000000},
  {id:'fame',icon:'⭐',name:'Become Famous',desc:'Reach 500K followers',check:G=>(G.followers||0)>=500000},
  {id:'family',icon:'👨‍👩‍👧',name:'Build a Family',desc:'Marry and have 3 children',check:G=>G.rels?.partner?.married&&(G.rels.children||[]).length>=3},
  {id:'career_top',icon:'🏆',name:'Reach the Top',desc:'Become CEO, Surgeon or Judge',check:G=>['ceo','surgeon','judge'].includes(G.career?.id)},
  {id:'criminal',icon:'😈',name:'Life of Crime',desc:'Commit 10+ crimes and survive',check:G=>(G.crimes||[]).length>=10&&G.alive},
  {id:'healthy',icon:'💪',name:'Live Long & Well',desc:'Reach age 85 with 70+ health',check:G=>G.age>=85&&G.health>=70},
  {id:'traveller',icon:'🌍',name:'Globe-Trotter',desc:'Visit 15 countries',check:G=>(G.countriesVisited||[]).length>=15},
  {id:'entrepreneur',icon:'🏢',name:'Business Empire',desc:'Build a $100M business',check:G=>(G.business?.value||0)>=100000000},
  {id:'sage',icon:'🦉',name:'The Sage',desc:'Max out 3 different skills',check:G=>G.skills&&Object.values(G.skills).filter(v=>v>=5).length>=3},
  {id:'investor',icon:'📊',name:'Market Wizard',desc:'Reach $500K in stocks',check:G=>ambitionStockValue(G)>=500000},
  {id:'renaissance',icon:'🎭',name:'Renaissance Soul',desc:'Have 5+ skills at Lv 2+',check:G=>G.skills&&Object.values(G.skills).filter(v=>v>=2).length>=5},
  {id:'academic',icon:'🎓',name:'Academic Legend',desc:'Earn a degree with 95+ smarts',check:G=>G.education==='university'&&(G.smarts||0)>=95},
  {id:'philanthropist',icon:'🤲',name:'Change the World',desc:'Donate $1M over your life',check:G=>(G.lifetimeDonated||0)>=1000000},
  {id:'legend',icon:'🏅',name:'The Legend',desc:'Reach 90+ fame, 90+ happiness and an A/S legacy grade path',check:G=>(G.fame||0)>=90&&(G.happiness||0)>=90},
  {id:'mindful',icon:'🧘',name:'Mindful Monk',desc:'Reach 80+ mental wellness, stress under 20, and age 60',check:G=>G.age>=60&&(G.mentalHealth||0)>=80&&(G.stress||0)<=20},
  {id:'cyber_pioneer',icon:'💻',name:'Cyber Pioneer',desc:'Master AI and Crypto skills, earn $2M through digital means',check:G=>(G.skills?.ai_ml||0)>=4&&(G.skills?.crypto||0)>=3&&(G.hustle?.earnings||0)+(G.money||0)>=2000000},
  {id:'minimalist',icon:'🧘',name:'The Minimalist',desc:'Reach age 70 with high happiness, low stress and no major debt',check:G=>G.age>=70&&(G.happiness||0)>=80&&(G.stress||0)<=25&&(G.debtCollections||0)<=0},
];

const WORLD_EVENTS=[
  {icon:'💹',type:'world',title:'Economic Boom',text:'The global economy is booming. Jobs are plentiful, markets are strong and optimism is everywhere.',tag:'boom',choices:[
    {t:'📈 Invest aggressively',e:{money:10000,happiness:8}},
    {t:'💼 Ask for a raise',e:{money:5000,happiness:5}},
    {t:'💰 Save conservatively',e:{money:2000}},
  ]},
  {icon:'📉',type:'world',title:'Financial Recession',text:'An economic crisis hits. Unemployment rises, markets fall and uncertainty spreads.',tag:'recession',choices:[
    {t:'💎 Hold steady',e:{money:-5000,happiness:-4,smarts:3}},
    {t:'🛡️ Cut expenses',e:{money:-1000,happiness:-3,stress:4}},
    {t:'💸 Panic sell',e:{money:-15000,happiness:-10,stress:8}},
  ]},
  {icon:'🦠',type:'world',title:'Global Pandemic',text:'A new virus spreads globally. Lockdowns and health restrictions change everyday life.',tag:'pandemic',choices:[
    {t:'🏠 Follow rules',e:{happiness:-8,health:2,stress:12,karma:4}},
    {t:'🏥 Volunteer to help',e:{happiness:12,karma:10,health:-5,stress:6}},
    {t:'💼 Keep working regardless',e:{money:3000,health:-9,stress:18}},
  ]},
  {icon:'🔥',type:'world',title:'Record Heatwave',text:'A historic heatwave strains infrastructure and health systems.',choices:[
    {t:'❄️ Upgrade cooling',e:{money:-800,happiness:4,health:2}},
    {t:'🌊 Stay near water',e:{health:-2,happiness:-3}},
    {t:'🌿 Adapt lifestyle',e:{health:3,stress:-2}},
  ]},
  {icon:'🚀',type:'world',title:'Tech Revolution',text:'A major technological breakthrough transforms industries.',tag:'boom',choices:[
    {t:'💻 Learn fast',e:{smarts:12,money:5000}},
    {t:'🚀 Invest in tech',e:{money:8000}},
    {t:'😕 Struggle to adapt',e:{smarts:-3,happiness:-5,stress:7}},
  ]},
  {icon:'🤖',type:'world',title:'AI Revolution',text:'AI tools disrupt almost every profession. Some people panic, others adapt fast.',choices:[
    {t:'🤖 Learn AI tools',e:{smarts:14,money:8000,happiness:6}},
    {t:'📢 Advocate for workers',e:{happiness:7,karma:10,fame:5}},
    {t:'😰 Fear for jobs',e:{happiness:-9,stress:15}},
  ]},
  {icon:'⚡',type:'world',title:'Energy Crisis',text:'Energy prices suddenly spike. Heating and fuel bills become painful.',choices:[
    {t:'♻️ Go green',e:{money:-3000,happiness:8,karma:8}},
    {t:'🥶 Pay high costs',e:{money:-4000,happiness:-8}},
    {t:'🏠 Move somewhere cheaper',e:{money:-2000,happiness:3}},
  ]},
  {icon:'🌊',type:'world',title:'Historic Floods',text:'Severe floods hit the region and damage thousands of homes.',choices:[
    {t:'🤲 Donate and volunteer',e:{money:-2000,happiness:8,karma:12}},
    {t:'🏃 Evacuate early',e:{happiness:-5,health:3}},
    {t:'📰 Doomscroll news',e:{happiness:-8,stress:10}},
  ]},
  {icon:'✌️',type:'world',title:'Peace Treaty Signed',text:'A major peace agreement raises global stability.',choices:[
    {t:'🎉 Celebrate',e:{happiness:8,karma:4}},
    {t:'💼 Use new opportunities',e:{money:4000,happiness:5}},
    {t:'🤔 Stay cautious',e:{happiness:4}},
  ]},
  {icon:'🌐',type:'world',title:'Internet Blackout',text:'A cyberattack knocks out digital infrastructure for two weeks.',choices:[
    {t:'📚 Read and reflect',e:{smarts:8,happiness:5,stress:-10}},
    {t:'🏢 Keep work offline',e:{money:-3000,happiness:-4,smarts:3}},
    {t:'😱 Panic',e:{stress:18,happiness:-12}},
  ]},
  {icon:'🚀',type:'world',title:'Space Tourism Launches',text:'Commercial space flights open to civilians — for a huge price.',choices:[
    {t:'🚀 Book a seat',e:{money:-250000,happiness:40,fame:20}},
    {t:'📺 Watch with awe',e:{happiness:10}},
    {t:'🌍 Earth first',e:{karma:5,happiness:4}},
  ]},
  {icon:'🧠',type:'world',title:'Mental Health Crisis',text:'A global mental health awareness campaign highlights epidemic burnout, anxiety, and loneliness.',choices:[
    {t:'🧘 Start therapy',e:{mentalHealth:12,happiness:10,stress:-15,money:-2000}},
    {t:'📱 Share your story',e:{fame:8,happiness:7,karma:8}},
    {t:'😶 Stay silent',e:{stress:8,happiness:-6}},
  ]},
  {icon:'🪙',type:'world',title:'Crypto Market Crash',text:'A major cryptocurrency collapses, wiping out billions in value overnight.',choices:[
    {t:'💎 Hold long-term',e:{money:-10000,smarts:8,stress:12}},
    {t:'🏃 Cash out fast',e:{money:-5000,happiness:-6}},
    {t:'📉 Short the market',e:{money:18000,stress:16,karma:-4}},
  ]},
  {icon:'🤝',type:'world',title:'AI Regulation Debate',text:'Governments debate strict AI regulation. Tech industry braces for major changes.',choices:[
    {t:'🎓 Upskill in AI ethics',e:{smarts:10,reputation:8,money:3000}},
    {t:'💼 Lobby for freedom',e:{money:5000,karma:-5}},
    {t:'🌍 Support regulation',e:{karma:12,happiness:7}},
  ]},
  {icon:'🌡️',type:'world',title:'Climate Emergency Declared',text:'Governments declare a climate emergency. Green policy and investment surge.',choices:[
    {t:'♻️ Go sustainable',e:{karma:15,happiness:8,money:-2000}},
    {t:'🌱 Start green hustle',e:{money:5000,karma:8}},
    {t:'😤 Ignore it',e:{happiness:-5,karma:-5}},
  ]},
];