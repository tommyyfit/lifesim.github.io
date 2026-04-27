/* data/countries.js — LifeSim v13 Reforged countries and universities */

const COUNTRIES=[
  {name:'United States',flag:'🇺🇸',currency:'$',mult:1.00,taxRate:.22,crimeRate:.35,lifeExp:78,happiness:65,region:'North America',healthcare:'mixed'},
  {name:'United Kingdom',flag:'🇬🇧',currency:'£',mult:.88,taxRate:.25,crimeRate:.28,lifeExp:81,happiness:68,region:'Europe',healthcare:'public'},
  {name:'Czech Republic',flag:'🇨🇿',currency:'Kč',mult:.52,taxRate:.20,crimeRate:.22,lifeExp:79,happiness:66,region:'Europe',healthcare:'public'},
  {name:'Germany',flag:'🇩🇪',currency:'€',mult:.92,taxRate:.28,crimeRate:.18,lifeExp:81,happiness:70,region:'Europe',healthcare:'public'},
  {name:'France',flag:'🇫🇷',currency:'€',mult:.85,taxRate:.30,crimeRate:.25,lifeExp:82,happiness:68,region:'Europe',healthcare:'public'},
  {name:'Netherlands',flag:'🇳🇱',currency:'€',mult:.96,taxRate:.32,crimeRate:.15,lifeExp:82,happiness:76,region:'Europe',healthcare:'public'},
  {name:'Sweden',flag:'🇸🇪',currency:'kr',mult:1.03,taxRate:.35,crimeRate:.12,lifeExp:83,happiness:78,region:'Nordics',healthcare:'public'},
  {name:'Switzerland',flag:'🇨🇭',currency:'Fr',mult:1.22,taxRate:.20,crimeRate:.10,lifeExp:84,happiness:77,region:'Europe',healthcare:'private'},
  {name:'Norway',flag:'🇳🇴',currency:'kr',mult:1.14,taxRate:.34,crimeRate:.11,lifeExp:83,happiness:79,region:'Nordics',healthcare:'public'},
  {name:'Denmark',flag:'🇩🇰',currency:'kr',mult:1.08,taxRate:.36,crimeRate:.12,lifeExp:82,happiness:80,region:'Nordics',healthcare:'public'},
  {name:'Finland',flag:'🇫🇮',currency:'€',mult:.95,taxRate:.33,crimeRate:.10,lifeExp:82,happiness:82,region:'Nordics',healthcare:'public'},
  {name:'Austria',flag:'🇦🇹',currency:'€',mult:.86,taxRate:.27,crimeRate:.16,lifeExp:81,happiness:70,region:'Europe',healthcare:'public'},
  {name:'Spain',flag:'🇪🇸',currency:'€',mult:.74,taxRate:.24,crimeRate:.27,lifeExp:83,happiness:66,region:'Europe',healthcare:'public'},
  {name:'Italy',flag:'🇮🇹',currency:'€',mult:.76,taxRate:.26,crimeRate:.30,lifeExp:83,happiness:64,region:'Europe',healthcare:'public'},
  {name:'Poland',flag:'🇵🇱',currency:'zł',mult:.56,taxRate:.19,crimeRate:.20,lifeExp:78,happiness:64,region:'Europe',healthcare:'public'},
  {name:'Russia',flag:'🇷🇺',currency:'₽',mult:.48,taxRate:.13,crimeRate:.32,lifeExp:73,happiness:56,region:'Eurasia',healthcare:'public'},
  {name:'Portugal',flag:'🇵🇹',currency:'€',mult:.70,taxRate:.23,crimeRate:.18,lifeExp:81,happiness:68,region:'Europe',healthcare:'public'},

  {name:'Canada',flag:'🇨🇦',currency:'C$',mult:.90,taxRate:.26,crimeRate:.24,lifeExp:82,happiness:72,region:'North America',healthcare:'public'},
  {name:'Australia',flag:'🇦🇺',currency:'A$',mult:.92,taxRate:.25,crimeRate:.20,lifeExp:83,happiness:73,region:'Oceania',healthcare:'public'},
  {name:'New Zealand',flag:'🇳🇿',currency:'NZ$',mult:.82,taxRate:.28,crimeRate:.16,lifeExp:82,happiness:74,region:'Oceania',healthcare:'public'},

  {name:'Japan',flag:'🇯🇵',currency:'¥',mult:.82,taxRate:.20,crimeRate:.08,lifeExp:85,happiness:62,region:'Asia',healthcare:'public'},
  {name:'South Korea',flag:'🇰🇷',currency:'₩',mult:.78,taxRate:.21,crimeRate:.14,lifeExp:83,happiness:60,region:'Asia',healthcare:'public'},
  {name:'Singapore',flag:'🇸🇬',currency:'S$',mult:1.18,taxRate:.18,crimeRate:.08,lifeExp:84,happiness:70,region:'Asia',healthcare:'mixed'},
  {name:'UAE',flag:'🇦🇪',currency:'AED',mult:1.05,taxRate:.05,crimeRate:.12,lifeExp:78,happiness:67,region:'Middle East',healthcare:'private'},
  {name:'China',flag:'🇨🇳',currency:'¥',mult:.72,taxRate:.20,crimeRate:.20,lifeExp:78,happiness:58,region:'Asia',healthcare:'mixed'},
  {name:'India',flag:'🇮🇳',currency:'₹',mult:.34,taxRate:.15,crimeRate:.38,lifeExp:70,happiness:56,region:'Asia',healthcare:'mixed'},

  {name:'Brazil',flag:'🇧🇷',currency:'R$',mult:.46,taxRate:.22,crimeRate:.55,lifeExp:76,happiness:61,region:'South America',healthcare:'mixed'},
  {name:'Mexico',flag:'🇲🇽',currency:'$',mult:.40,taxRate:.18,crimeRate:.50,lifeExp:75,happiness:62,region:'North America',healthcare:'mixed'},
  {name:'Argentina',flag:'🇦🇷',currency:'$',mult:.38,taxRate:.21,crimeRate:.42,lifeExp:77,happiness:60,region:'South America',healthcare:'public'},
  {name:'South Africa',flag:'🇿🇦',currency:'R',mult:.36,taxRate:.18,crimeRate:.60,lifeExp:65,happiness:52,region:'Africa',healthcare:'mixed'},
  {name:'Nigeria',flag:'🇳🇬',currency:'₦',mult:.28,taxRate:.12,crimeRate:.55,lifeExp:63,happiness:48,region:'Africa',healthcare:'mixed'},
];

const UNIVERSITIES=[
  {id:'community',name:'Community College',cost:8000,smartsBonus:8,duration:2,label:"2-year Associate's",prestige:1,stress:3},
  {id:'state',name:'State University',cost:22000,smartsBonus:14,duration:4,label:"4-year Bachelor's",prestige:2,stress:5},
  {id:'private',name:'Private University',cost:55000,smartsBonus:20,duration:4,label:"4-year Bachelor's (Prestige)",prestige:3,stress:6},
  {id:'ivy',name:'Ivy League University',cost:120000,smartsBonus:28,duration:4,label:"4-year Bachelor's (Elite)",prestige:5,stress:8},
];

const COUNTRY_REGION_BONUSES={
  Europe:{health:+2,stress:-1},
  Nordics:{happiness:+4,health:+3,stress:-2},
  'North America':{money:+1},
  Asia:{smarts:+2,stress:+1},
  Oceania:{happiness:+2,health:+2},
  'Middle East':{money:+2,stress:+1},
  'South America':{happiness:+1},
  Africa:{stress:+2},
  Eurasia:{stress:+1},
};