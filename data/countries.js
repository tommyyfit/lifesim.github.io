/* data/countries.js - LifeSim data */

const COUNTRY_CACHE_KEY='lifesim_restcountries_cache';
const COUNTRY_CACHE_TTL=1000*60*60*24*14;
const RESTCOUNTRIES_FIELDS='name,cca2,cca3,currencies,languages,population,flag,region,subregion';
const RESTCOUNTRIES_API_PREFIX='v';

const COUNTRY_BASELINES=[
  {code:'US',cca3:'USA',name:'United States',aliases:['United States of America','USA','US'],flag:'🇺🇸',currency:'$',currencyCode:'USD',costMult:1.00,salaryMult:1.08,wealthMult:1.10,taxRate:.22,crimeRate:.35,lifeExp:78,happiness:65,region:'North America',subregion:'Northern America',healthcare:'mixed',population:340100000,gdpPerCapita:81695,languages:['English']},
  {code:'GB',cca3:'GBR',name:'United Kingdom',aliases:['UK','Britain','Great Britain'],flag:'🇬🇧',currency:'£',currencyCode:'GBP',costMult:.88,salaryMult:.92,wealthMult:.90,taxRate:.25,crimeRate:.28,lifeExp:81,happiness:68,region:'Europe',subregion:'Northern Europe',healthcare:'public',population:69140000,gdpPerCapita:48866,languages:['English']},
  {code:'CZ',cca3:'CZE',name:'Czech Republic',aliases:['Czechia','Czech Republic'],flag:'🇨🇿',currency:'Kč',currencyCode:'CZK',costMult:.52,salaryMult:.58,wealthMult:.55,taxRate:.20,crimeRate:.22,lifeExp:79,happiness:66,region:'Europe',subregion:'Central Europe',healthcare:'public',population:10900000,gdpPerCapita:31559,languages:['Czech']},
  {code:'DE',cca3:'DEU',name:'Germany',aliases:['Federal Republic of Germany'],flag:'🇩🇪',currency:'€',currencyCode:'EUR',costMult:.92,salaryMult:.98,wealthMult:.97,taxRate:.28,crimeRate:.18,lifeExp:81,happiness:70,region:'Europe',subregion:'Central Europe',healthcare:'public',population:84550000,gdpPerCapita:54810,languages:['German']},
  {code:'FR',cca3:'FRA',name:'France',aliases:['French Republic'],flag:'🇫🇷',currency:'€',currencyCode:'EUR',costMult:.85,salaryMult:.91,wealthMult:.89,taxRate:.30,crimeRate:.25,lifeExp:82,happiness:68,region:'Europe',subregion:'Western Europe',healthcare:'public',population:68400000,gdpPerCapita:44461,languages:['French']},
  {code:'NL',cca3:'NLD',name:'Netherlands',aliases:['The Netherlands','Holland'],flag:'🇳🇱',currency:'€',currencyCode:'EUR',costMult:.96,salaryMult:1.01,wealthMult:1.01,taxRate:.32,crimeRate:.15,lifeExp:82,happiness:76,region:'Europe',subregion:'Western Europe',healthcare:'public',population:17930000,gdpPerCapita:62789,languages:['Dutch']},
  {code:'SE',cca3:'SWE',name:'Sweden',aliases:[],flag:'🇸🇪',currency:'kr',currencyCode:'SEK',costMult:1.03,salaryMult:1.02,wealthMult:1.02,taxRate:.35,crimeRate:.12,lifeExp:83,happiness:78,region:'Nordics',subregion:'Northern Europe',healthcare:'public',population:10570000,gdpPerCapita:60730,languages:['Swedish']},
  {code:'CH',cca3:'CHE',name:'Switzerland',aliases:['Swiss Confederation'],flag:'🇨🇭',currency:'Fr',currencyCode:'CHF',costMult:1.22,salaryMult:1.28,wealthMult:1.26,taxRate:.20,crimeRate:.10,lifeExp:84,happiness:77,region:'Europe',subregion:'Central Europe',healthcare:'private',population:8918000,gdpPerCapita:99995,languages:['German','French','Italian']},
  {code:'NO',cca3:'NOR',name:'Norway',aliases:['Kingdom of Norway'],flag:'🇳🇴',currency:'kr',currencyCode:'NOK',costMult:1.14,salaryMult:1.14,wealthMult:1.16,taxRate:.34,crimeRate:.11,lifeExp:83,happiness:79,region:'Nordics',subregion:'Northern Europe',healthcare:'public',population:5560000,gdpPerCapita:87926,languages:['Norwegian']},
  {code:'DK',cca3:'DNK',name:'Denmark',aliases:[],flag:'🇩🇰',currency:'kr',currencyCode:'DKK',costMult:1.08,salaryMult:1.07,wealthMult:1.08,taxRate:.36,crimeRate:.12,lifeExp:82,happiness:80,region:'Nordics',subregion:'Northern Europe',healthcare:'public',population:5990000,gdpPerCapita:68090,languages:['Danish']},
  {code:'FI',cca3:'FIN',name:'Finland',aliases:[],flag:'🇫🇮',currency:'€',currencyCode:'EUR',costMult:.95,salaryMult:.95,wealthMult:.96,taxRate:.33,crimeRate:.10,lifeExp:82,happiness:82,region:'Nordics',subregion:'Northern Europe',healthcare:'public',population:5620000,gdpPerCapita:53655,languages:['Finnish','Swedish']},
  {code:'AT',cca3:'AUT',name:'Austria',aliases:['Republic of Austria'],flag:'🇦🇹',currency:'€',currencyCode:'EUR',costMult:.86,salaryMult:.92,wealthMult:.90,taxRate:.27,crimeRate:.16,lifeExp:81,happiness:70,region:'Europe',subregion:'Central Europe',healthcare:'public',population:9132000,gdpPerCapita:58809,languages:['German']},
  {code:'ES',cca3:'ESP',name:'Spain',aliases:['Kingdom of Spain'],flag:'🇪🇸',currency:'€',currencyCode:'EUR',costMult:.74,salaryMult:.73,wealthMult:.72,taxRate:.24,crimeRate:.27,lifeExp:83,happiness:66,region:'Europe',subregion:'Southern Europe',healthcare:'public',population:48950000,gdpPerCapita:35689,languages:['Spanish']},
  {code:'IT',cca3:'ITA',name:'Italy',aliases:['Italian Republic'],flag:'🇮🇹',currency:'€',currencyCode:'EUR',costMult:.76,salaryMult:.75,wealthMult:.74,taxRate:.26,crimeRate:.30,lifeExp:83,happiness:64,region:'Europe',subregion:'Southern Europe',healthcare:'public',population:58870000,gdpPerCapita:38657,languages:['Italian']},
  {code:'PL',cca3:'POL',name:'Poland',aliases:['Republic of Poland'],flag:'🇵🇱',currency:'zł',currencyCode:'PLN',costMult:.56,salaryMult:.59,wealthMult:.57,taxRate:.19,crimeRate:.20,lifeExp:78,happiness:64,region:'Europe',subregion:'Central Europe',healthcare:'public',population:36690000,gdpPerCapita:22056,languages:['Polish']},
  {code:'RU',cca3:'RUS',name:'Russia',aliases:['Russian Federation'],flag:'🇷🇺',currency:'₽',currencyCode:'RUB',costMult:.48,salaryMult:.42,wealthMult:.38,taxRate:.13,crimeRate:.32,lifeExp:73,happiness:56,region:'Eurasia',subregion:'Eastern Europe',healthcare:'public',population:143800000,gdpPerCapita:14097,languages:['Russian']},
  {code:'PT',cca3:'PRT',name:'Portugal',aliases:['Portuguese Republic'],flag:'🇵🇹',currency:'€',currencyCode:'EUR',costMult:.70,salaryMult:.67,wealthMult:.66,taxRate:.23,crimeRate:.18,lifeExp:81,happiness:68,region:'Europe',subregion:'Southern Europe',healthcare:'public',population:10640000,gdpPerCapita:28354,languages:['Portuguese']},

  {code:'CA',cca3:'CAN',name:'Canada',aliases:[],flag:'🇨🇦',currency:'C$',currencyCode:'CAD',costMult:.90,salaryMult:.96,wealthMult:.96,taxRate:.26,crimeRate:.24,lifeExp:82,happiness:72,region:'North America',subregion:'Northern America',healthcare:'public',population:41530000,gdpPerCapita:53431,languages:['English','French']},
  {code:'AU',cca3:'AUS',name:'Australia',aliases:['Commonwealth of Australia'],flag:'🇦🇺',currency:'A$',currencyCode:'AUD',costMult:.92,salaryMult:.99,wealthMult:1.00,taxRate:.25,crimeRate:.20,lifeExp:83,happiness:73,region:'Oceania',subregion:'Australia and New Zealand',healthcare:'public',population:27230000,gdpPerCapita:64820,languages:['English']},
  {code:'NZ',cca3:'NZL',name:'New Zealand',aliases:['Aotearoa'],flag:'🇳🇿',currency:'NZ$',currencyCode:'NZD',costMult:.82,salaryMult:.86,wealthMult:.86,taxRate:.28,crimeRate:.16,lifeExp:82,happiness:74,region:'Oceania',subregion:'Australia and New Zealand',healthcare:'public',population:5260000,gdpPerCapita:48377,languages:['English','Māori']},

  {code:'JP',cca3:'JPN',name:'Japan',aliases:[],flag:'🇯🇵',currency:'¥',currencyCode:'JPY',costMult:.82,salaryMult:.89,wealthMult:.93,taxRate:.20,crimeRate:.08,lifeExp:85,happiness:62,region:'Asia',subregion:'Eastern Asia',healthcare:'public',population:123300000,gdpPerCapita:33899,languages:['Japanese']},
  {code:'KR',cca3:'KOR',name:'South Korea',aliases:['Republic of Korea','Korea, Republic of'],flag:'🇰🇷',currency:'₩',currencyCode:'KRW',costMult:.78,salaryMult:.86,wealthMult:.86,taxRate:.21,crimeRate:.14,lifeExp:83,happiness:60,region:'Asia',subregion:'Eastern Asia',healthcare:'public',population:51710000,gdpPerCapita:33147,languages:['Korean']},
  {code:'SG',cca3:'SGP',name:'Singapore',aliases:['Republic of Singapore'],flag:'🇸🇬',currency:'S$',currencyCode:'SGD',costMult:1.18,salaryMult:1.31,wealthMult:1.36,taxRate:.18,crimeRate:.08,lifeExp:84,happiness:70,region:'Asia',subregion:'South-Eastern Asia',healthcare:'mixed',population:6040000,gdpPerCapita:84714,languages:['English','Malay','Chinese']},
  {code:'AE',cca3:'ARE',name:'UAE',aliases:['United Arab Emirates'],flag:'🇦🇪',currency:'AED',currencyCode:'AED',costMult:1.05,salaryMult:1.16,wealthMult:1.19,taxRate:.05,crimeRate:.12,lifeExp:78,happiness:67,region:'Middle East',subregion:'Western Asia',healthcare:'private',population:10240000,gdpPerCapita:53708,languages:['Arabic']},
  {code:'CN',cca3:'CHN',name:'China',aliases:["People's Republic of China"],flag:'🇨🇳',currency:'¥',currencyCode:'CNY',costMult:.72,salaryMult:.63,wealthMult:.60,taxRate:.20,crimeRate:.20,lifeExp:78,happiness:58,region:'Asia',subregion:'Eastern Asia',healthcare:'mixed',population:1408280000,gdpPerCapita:12614,languages:['Chinese']},
  {code:'IN',cca3:'IND',name:'India',aliases:['Republic of India'],flag:'🇮🇳',currency:'₹',currencyCode:'INR',costMult:.34,salaryMult:.28,wealthMult:.24,taxRate:.15,crimeRate:.38,lifeExp:70,happiness:56,region:'Asia',subregion:'Southern Asia',healthcare:'mixed',population:1438070000,gdpPerCapita:2698,languages:['Hindi','English']},

  {code:'BR',cca3:'BRA',name:'Brazil',aliases:['Federative Republic of Brazil'],flag:'🇧🇷',currency:'R$',currencyCode:'BRL',costMult:.46,salaryMult:.42,wealthMult:.38,taxRate:.22,crimeRate:.55,lifeExp:76,happiness:61,region:'South America',subregion:'South America',healthcare:'mixed',population:212600000,gdpPerCapita:11039,languages:['Portuguese']},
  {code:'MX',cca3:'MEX',name:'Mexico',aliases:['United Mexican States'],flag:'🇲🇽',currency:'$',currencyCode:'MXN',costMult:.40,salaryMult:.38,wealthMult:.35,taxRate:.18,crimeRate:.50,lifeExp:75,happiness:62,region:'North America',subregion:'North America',healthcare:'mixed',population:130900000,gdpPerCapita:13993,languages:['Spanish']},
  {code:'AR',cca3:'ARG',name:'Argentina',aliases:['Argentine Republic'],flag:'🇦🇷',currency:'$',currencyCode:'ARS',costMult:.38,salaryMult:.31,wealthMult:.24,taxRate:.21,crimeRate:.42,lifeExp:77,happiness:60,region:'South America',subregion:'South America',healthcare:'public',population:46970000,gdpPerCapita:13573,languages:['Spanish']},
  {code:'ZA',cca3:'ZAF',name:'South Africa',aliases:['Republic of South Africa'],flag:'🇿🇦',currency:'R',currencyCode:'ZAR',costMult:.36,salaryMult:.33,wealthMult:.28,taxRate:.18,crimeRate:.60,lifeExp:65,happiness:52,region:'Africa',subregion:'Southern Africa',healthcare:'mixed',population:63210000,gdpPerCapita:6253,languages:['English','Zulu','Xhosa']},
  {code:'NG',cca3:'NGA',name:'Nigeria',aliases:['Federal Republic of Nigeria'],flag:'🇳🇬',currency:'₦',currencyCode:'NGN',costMult:.28,salaryMult:.22,wealthMult:.18,taxRate:.12,crimeRate:.55,lifeExp:63,happiness:48,region:'Africa',subregion:'Western Africa',healthcare:'mixed',population:227900000,gdpPerCapita:1596,languages:['English']},
];

function normalizeCountryText(value){
  return String(value??'')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}

function uniqStrings(values){
  const seen=new Set();
  const out=[];
  (values||[]).forEach(value=>{
    const text=String(value??'').trim();
    const key=normalizeCountryText(text);
    if(!text||!key||seen.has(key))return;
    seen.add(key);
    out.push(text);
  });
  return out;
}

function countryPopulationLabel(value){
  const n=Number(value);
  if(!Number.isFinite(n)||n<=0)return'Unknown';
  if(n>=1000000000)return `${(n/1000000000).toFixed(n>=10000000000?0:2).replace(/\.0+$/,'')}B`;
  if(n>=1000000)return `${(n/1000000).toFixed(n>=100000000?0:1).replace(/\.0+$/,'')}M`;
  return Math.round(n).toLocaleString();
}

function countryUsdLabel(value){
  const n=Number(value);
  if(!Number.isFinite(n)||n<=0)return'Unknown';
  return `$${Math.round(n).toLocaleString()}`;
}

function countryListLabel(values,limit=3){
  const list=uniqStrings(values);
  if(!list.length)return'Unknown';
  const shown=list.slice(0,limit).join(', ');
  return list.length>limit?`${shown} +${list.length-limit}`:shown;
}

function extractLiveCurrencies(currencies){
  if(!currencies||typeof currencies!=='object')return{codes:[],names:[],symbol:''};
  const entries=Object.entries(currencies);
  const codes=entries.map(([code])=>code).filter(Boolean);
  const names=entries.map(([,info])=>info?.name).filter(Boolean);
  const symbol=entries.map(([,info])=>info?.symbol).find(Boolean)||'';
  return{codes,names,symbol};
}

function extractLiveLanguages(languages){
  if(!languages||typeof languages!=='object')return[];
  return Object.values(languages).filter(Boolean);
}

function mergeCountryProfile(base,live){
  const liveCurrencies=extractLiveCurrencies(live?.currencies);
  const liveLanguages=extractLiveLanguages(live?.languages);
  const currencies=uniqStrings([
    ...liveCurrencies.codes,
    ...liveCurrencies.names,
    ...(base.currencies||[]),
    base.currencyCode,
    base.currencyName
  ]);
  const languages=uniqStrings([...liveLanguages,...(base.languages||[])]);
  const currency=liveCurrencies.symbol||base.currency||base.currencyCode||'$';
  const region=base.region||live?.region||'World';
  const subregion=base.subregion||live?.subregion||'';
  const population=Number.isFinite(live?.population)?live.population:base.population;
  const profile={
    ...base,
    code:live?.cca2||base.code||'',
    cca2:live?.cca2||base.code||'',
    cca3:live?.cca3||base.cca3||'',
    name:base.name,
    officialName:live?.name?.official||base.officialName||base.name,
    flag:live?.flag||base.flag||'🌍',
    region,
    subregion,
    currency,
    currencyCode:liveCurrencies.codes[0]||base.currencyCode||'',
    currencyName:liveCurrencies.names[0]||base.currencyName||'',
    currencies,
    languages,
    population,
    populationText:countryPopulationLabel(population),
    languageText:countryListLabel(languages),
    currencyText:countryListLabel(currencies,2),
    gdpPerCapita:Number(base.gdpPerCapita)||0,
    gdpText:countryUsdLabel(base.gdpPerCapita),
    costMult:Number(base.costMult??base.mult??1)||1,
    salaryMult:Number(base.salaryMult??base.costMult??base.mult??1)||1,
    wealthMult:Number(base.wealthMult??base.salaryMult??base.costMult??base.mult??1)||1,
  };
  profile.mult=profile.costMult;
  return profile;
}

function countryKeys(country){
  const values=[
    country?.name,
    country?.officialName,
    country?.code,
    country?.cca2,
    country?.cca3,
    ...(country?.aliases||[])
  ];
  return uniqStrings(values).map(normalizeCountryText).filter(Boolean);
}

function findCountryProfile(input){
  if(!input)return COUNTRY_BASELINES[0];
  const inputKeys=new Set(
    countryKeys(typeof input==='object'?input:{name:input})
  );
  return COUNTRY_BASELINES.find(country=>countryKeys(country).some(key=>inputKeys.has(key)))||null;
}

function resolveCountryData(input){
  const match=findCountryProfile(input);
  if(match){
    const live=COUNTRIES.find(country=>countryKeys(country).some(key=>countryKeys(match).includes(key)));
    return {...(live||mergeCountryProfile(match,null))};
  }
  if(input&&typeof input==='object'){
    return{
      ...input,
      costMult:Number(input.costMult??input.mult??1)||1,
      salaryMult:Number(input.salaryMult??input.costMult??input.mult??1)||1,
      wealthMult:Number(input.wealthMult??input.salaryMult??input.costMult??input.mult??1)||1,
      mult:Number(input.mult??input.costMult??1)||1,
      currencies:Array.isArray(input.currencies)?uniqStrings(input.currencies):[],
      languages:Array.isArray(input.languages)?uniqStrings(input.languages):[],
      populationText:countryPopulationLabel(input.population),
      languageText:countryListLabel(input.languages),
      currencyText:countryListLabel(input.currencies,2),
      gdpText:countryUsdLabel(input.gdpPerCapita),
    };
  }
  return {...COUNTRIES[0]};
}

const COUNTRIES=COUNTRY_BASELINES.map(country=>mergeCountryProfile(country,null));

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

const CountryData={
  _loading:null,

  _readCache(){
    try{
      const raw=localStorage.getItem(COUNTRY_CACHE_KEY);
      if(!raw)return null;
      const parsed=JSON.parse(raw);
      if(!parsed||!Array.isArray(parsed.rows))return null;
      if((Date.now()-(parsed.savedAt||0))>COUNTRY_CACHE_TTL)return null;
      return parsed.rows;
    }catch(e){
      return null;
    }
  },

  _writeCache(rows){
    try{
      localStorage.setItem(COUNTRY_CACHE_KEY,JSON.stringify({savedAt:Date.now(),rows}));
    }catch(e){}
  },

  _matchLiveCountry(base,rows){
    const baseKeys=new Set(countryKeys(base));
    return rows.find(row=>countryKeys({
      name:row?.name?.common,
      officialName:row?.name?.official,
      code:row?.cca2,
      cca2:row?.cca2,
      cca3:row?.cca3
    }).some(key=>baseKeys.has(key)))||null;
  },

  applyLive(rows){
    if(!Array.isArray(rows)||!rows.length)return COUNTRIES;
    COUNTRY_BASELINES.forEach((base,index)=>{
      const live=this._matchLiveCountry(base,rows);
      COUNTRIES[index]=mergeCountryProfile(base,live);
    });
    return COUNTRIES;
  },

  hydrate(options={}){
    const quiet=options.quiet!==false;
    const cached=this._readCache();
    if(cached)this.applyLive(cached);
    if(this._loading)return this._loading;
    if(typeof fetch!=='function')return Promise.resolve(COUNTRIES);

    const url=`https://restcountries.com/${RESTCOUNTRIES_API_PREFIX}3.1/all?fields=${RESTCOUNTRIES_FIELDS}`;
    this._loading=fetch(url,{headers:{Accept:'application/json'}})
      .then(res=>{
        if(!res.ok)throw new Error(`RestCountries ${res.status}`);
        return res.json();
      })
      .then(rows=>{
        if(Array.isArray(rows)&&rows.length){
          this.applyLive(rows);
          this._writeCache(rows);
        }
        return COUNTRIES;
      })
      .catch(err=>{
        if(!quiet&&typeof console!=='undefined'){
          console.warn('RestCountries hydrate failed',err);
        }
        return COUNTRIES;
      })
      .finally(()=>{
        this._loading=null;
      });
    return this._loading;
  },
};

if(typeof window!=='undefined'){
  Object.assign(window,{
    COUNTRIES,
    UNIVERSITIES,
    COUNTRY_REGION_BONUSES,
    CountryData,
    resolveCountryData,
    countryPopulationLabel,
    countryUsdLabel,
    countryListLabel
  });
}
