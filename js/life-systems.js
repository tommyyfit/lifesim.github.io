(function(){
  'use strict';

  const LifeSystems={
    BUILD:'release-candidate-1',
    _beforeAge:null,

    ensureState(G=window.G){
      if(!G)return null;
      if(!G.lifeSystems||typeof G.lifeSystems!=='object')G.lifeSystems={};
      const S=G.lifeSystems;
      if(!Array.isArray(S.feedback))S.feedback=[];
      if(!Array.isArray(S.chains))S.chains=[];
      if(!Array.isArray(S.yearlyHistory))S.yearlyHistory=[];
      if(!S.momentum||typeof S.momentum!=='object')S.momentum={score:50,label:'Stable',tone:'neutral'};
      if(!S.tiers||typeof S.tiers!=='object')S.tiers={};
      if(!S.flags||typeof S.flags!=='object')S.flags={};
      if(!S.cooldowns||typeof S.cooldowns!=='object')S.cooldowns={warnings:{},feedback:{}};
      if(!S.achievementRewards||typeof S.achievementRewards!=='object')S.achievementRewards={};
      if(!Number.isFinite(S.lastAgeProcessed))S.lastAgeProcessed=-1;
      if(!Number.isFinite(S.lastSummarySerial))S.lastSummarySerial=-1;
      if(!Number.isFinite(S.lastMomentumEventAge))S.lastMomentumEventAge=-99;
      if(!Number.isFinite(S.lastTierAge))S.lastTierAge=-99;
      if(typeof S.identityLabel!=='string')S.identityLabel='Building Your Story';
      if(typeof S.identitySummary!=='string')S.identitySummary='Your life systems are still taking shape.';
      if(typeof S.lastWarning!=='string')S.lastWarning='';
      if(typeof S.lastOpportunity!=='string')S.lastOpportunity='';
      if(typeof S.lastFeedbackText!=='string')S.lastFeedbackText='';
      if(typeof S.lastAchievementReward!=='string')S.lastAchievementReward='';
      if(typeof S.lastYearSummary!=='object'||!S.lastYearSummary)S.lastYearSummary=null;
      if(typeof S.panelOpen!=='boolean')S.panelOpen=false;
      return S;
    },

    num(v,fallback=0){
      const n=Number(v);
      return Number.isFinite(n)?n:fallback;
    },

    clamp(v,min=0,max=100){
      v=this.num(v,min);
      if(max<min){const t=min;min=max;max=t;}
      return Math.max(min,Math.min(max,Math.round(v)));
    },

    money(v){
      try{return typeof fmtFull==='function'?fmtFull(Math.round(v||0)):String(Math.round(v||0));}
      catch(_){return String(Math.round(v||0));}
    },

    shortMoney(v){
      try{return typeof fmt==='function'?fmt(Math.round(v||0)):String(Math.round(v||0));}
      catch(_){return String(Math.round(v||0));}
    },

    esc(value){
      return String(value??'').replace(/[&<>"']/g,ch=>({
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'
      }[ch]));
    },

    arr(value){
      return Array.isArray(value)?value:[];
    },

    firstValue(...values){
      for(const value of values){
        const num=Number(value);
        if(Number.isFinite(num))return num;
      }
      return 0;
    },

    partner(G=window.G){
      const partner=G?.rels?.partner;
      return partner&&partner.alive!==false?partner:null;
    },

    partnerLove(G=window.G){
      const partner=this.partner(G);
      if(!partner)return 0;
      return this.clamp(this.firstValue(partner.love,partner.relationship,partner.trust,60));
    },

    relationshipStage(G=window.G){
      const partner=this.partner(G);
      if(!partner)return 'Single';
      if(partner.married||partner.stage==='married')return 'Married';
      if(partner.stage==='engaged'||partner.engaged)return 'Serious';
      if(partner.stage==='serious')return 'Serious';
      return 'Dating';
    },

    childCount(G=window.G){
      return this.arr(G?.rels?.children).filter(child=>child&&child.alive!==false).length;
    },

    dependentChildren(G=window.G){
      return this.arr(G?.rels?.children).filter(child=>child&&child.alive!==false&&this.num(child.age,0)<18).length;
    },

    debt(G=window.G){
      try{
        if(typeof debtTotal==='function')return Math.max(0,debtTotal(G));
      }catch(_){}
      return this.arr(G?.loans).reduce((sum,loan)=>sum+this.firstValue(loan.remaining,loan.balance,loan.amount,0),0)+this.num(G?.debtCollections,0);
    },

    net(G=window.G){
      try{
        if(typeof netWorth==='function')return netWorth(G);
      }catch(_){}
      return this.num(G?.money,0)-this.debt(G);
    },

    income(G=window.G){
      const careerSalary=this.num(G?.career?.salary,0);
      const social=this.num(G?.social?.membershipIncome,0)+this.num(G?.social?.sponsorIncome,0);
      const rentals=this.arr(G?.assets?.properties).reduce((sum,property)=>sum+this.num(property?.rent,0),0);
      const business=this.num(G?.business?.revenue,0)-this.num(G?.business?.expenses,0);
      return careerSalary+social+rentals+business;
    },

    businessProfit(G=window.G){
      return this.num(G?.business?.revenue,0)-this.num(G?.business?.expenses,0);
    },

    recentBadCount(G=window.G){
      return this.arr(G?.log).slice(0,16).filter(entry=>entry&&entry.type==='bad').length;
    },

    totalSkillLevels(G=window.G){
      return Object.values(G?.skills||{}).reduce((sum,val)=>sum+this.num(val,0),0);
    },

    snapshot(G=window.G){
      return{
        age:this.num(G?.age,0),
        serial:this.num(G?.ageUpSerial,0),
        money:this.num(G?.money,0),
        netWorth:this.net(G),
        debt:this.debt(G),
        health:this.num(G?.health,50),
        happiness:this.num(G?.happiness,50),
        stress:this.num(G?.stress,0),
        reputation:this.num(G?.reputation,50),
        fame:this.num(G?.fame,0),
        mentalHealth:this.num(G?.mentalHealth,60),
        followers:this.num(G?.followers,0),
        partnerLove:this.partnerLove(G),
        familyLegacyScore:this.num(G?.familyLegacyScore,0),
        jobPerf:this.num(G?.jobPerf,50),
        crimeHeat:this.num(G?.crimeHeat,0)+this.num(G?.gangHeat,0),
        crimeCount:this.arr(G?.crimes).length,
        businessValue:this.num(G?.business?.value,0),
        lifetimeGambled:this.num(G?.lifetimeGambled,0),
        childCount:this.childCount(G),
        skillTotal:this.totalSkillLevels(G)
      };
    },

    trendScore(value,target,cap=20){
      const safeTarget=Math.max(1,target);
      return Math.max(-cap,Math.min(cap,Math.round((value/safeTarget)*cap)));
    },

    computeMomentum(G=window.G){
      const netWorth=this.net(G);
      const debt=this.debt(G);
      const income=this.income(G);
      const familyStrength=(this.partnerLove(G)*0.55)+(Math.min(30,this.childCount(G)*7))+(this.num(G?.familySupport,0)>0?8:0);
      const skillStrength=Math.min(14,this.totalSkillLevels(G));
      const crimePenalty=Math.min(34,(this.arr(G?.crimes).length*3)+(this.num(G?.crimeHeat,0)*0.18)+(this.num(G?.gangHeat,0)*0.12)+(G?.inPrison?18:0));
      const badEvents=this.recentBadCount(G);
      let score=50;
      score+=this.trendScore(netWorth,Math.max(20000,this.num(typeof annualCost==='function'?annualCost(38000,G):38000,38000)),22);
      score+=this.trendScore(income,Math.max(15000,this.num(typeof annualCost==='function'?annualCost(25000,G):25000,25000)),16);
      score-=this.trendScore(debt,Math.max(12000,this.num(typeof annualCost==='function'?annualCost(22000,G):22000,22000)),18);
      score+=Math.round((this.num(G?.health,50)-50)*0.26);
      score+=Math.round((this.num(G?.happiness,50)-50)*0.18);
      score-=Math.round(this.num(G?.stress,0)*0.22);
      score+=Math.round((this.num(G?.reputation,50)-50)*0.16);
      score+=Math.round((this.num(G?.fame,0))*0.06);
      score+=Math.round(familyStrength*0.10);
      score+=Math.round(skillStrength*0.5);
      score-=crimePenalty;
      score-=badEvents*2;
      if(this.num(G?.business?.value,0)>0&&this.businessProfit(G)>0)score+=6;
      if(this.num(G?.jobPerf,50)>=78)score+=5;
      if(this.num(G?.health,50)<35&&this.num(G?.stress,0)>75)score-=8;
      score=this.clamp(score,0,100);

      let label='Stable';
      let tone='neutral';
      if(score>=88){label='Legendary';tone='good';}
      else if(score>=70){label='Rising';tone='good';}
      else if(score>=52){label='Stable';tone='neutral';}
      else if(score>=38){label='Unstable';tone='warn';}
      else if(score>=22){label='Falling';tone='bad';}
      else{label='Dangerous';tone='bad';}

      return{score,label,tone};
    },

    computeTiers(G=window.G){
      const netWorth=this.net(G);
      const followers=Math.max(this.num(G?.followers,0),this.num(G?.fame,0)*1000);
      const careerPrestige=this.num(G?.career?.prestige,0);
      const partnerStage=this.relationshipStage(G);
      const healthComposite=Math.round((this.num(G?.health,50)*0.5)+(this.num(G?.fitness,50)*0.25)+(this.num(G?.mentalHealth,60)*0.25));
      const crimeScore=(this.arr(G?.crimes).length*8)+this.num(G?.crimeHeat,0)+(this.num(G?.gangHeat,0)*0.5)+(G?.inPrison?25:0);

      const moneyTier=
        netWorth<0?'Broke':
        netWorth<15000?'Stable':
        netWorth<120000?'Comfortable':
        netWorth<1000000?'Rich':
        netWorth<10000000?'Millionaire':
        netWorth<50000000?'Elite':'Legendary';

      const fameTier=
        followers<1000?'Unknown':
        followers<10000?'Known':
        followers<100000?'Local Star':
        followers<500000?'Famous':
        followers<1000000?'Icon':'Legend';

      const careerTier=
        !G?.career?'Unemployed':
        careerPrestige<=2?'Worker':
        careerPrestige<=4?'Specialist':
        careerPrestige<=6?'Manager':
        careerPrestige<=8?'Executive':'Industry Leader';

      const relationshipTier=
        !this.partner(G)&&!this.childCount(G)?'Single':
        partnerStage==='Dating'?'Dating':
        partnerStage==='Serious'?'Serious':
        partnerStage==='Married'&&this.childCount(G)>0?'Legacy Family':
        partnerStage==='Married'?'Married':'Family';

      const crimeTier=
        crimeScore<=5?'Clean':
        crimeScore<=25?'Suspicious':
        crimeScore<=50?'Wanted':
        crimeScore<=75?'Convicted':'Underworld Figure';

      const healthTier=
        healthComposite<35?'Fragile':
        healthComposite<55?'Average':
        healthComposite<72?'Healthy':
        healthComposite<88?'Athletic':'Peak Condition';

      return{money:moneyTier,fame:fameTier,career:careerTier,relationship:relationshipTier,crime:crimeTier,health:healthTier};
    },

    computeIdentity(G=window.G,momentum=null,tiers=null){
      momentum=momentum||this.computeMomentum(G);
      tiers=tiers||this.computeTiers(G);
      const lonely=this.partnerLove(G)<35&&this.childCount(G)===0;
      const stressed=this.num(G?.stress,0)>74;
      const rich=['Rich','Millionaire','Elite','Legendary'].includes(tiers.money);
      const familyStrong=this.partnerLove(G)>=68||this.childCount(G)>=2||this.num(G?.familyLegacyScore,0)>=68;
      const criminal=tiers.crime==='Convicted'||tiers.crime==='Underworld Figure';
      const famous=['Famous','Icon','Legend'].includes(tiers.fame);

      if(momentum.label==='Dangerous'&&criminal)return{
        label:'Dangerous risk-taker',
        summary:'Fast gains are colliding with reputation, pressure, and long-term safety.'
      };
      if(rich&&lonely)return{
        label:'Rich but lonely',
        summary:'Status and wealth are up, but emotional support is thin.'
      };
      if(famous&&stressed)return{
        label:'Famous but stressed',
        summary:'Attention is opening doors while quietly draining stability.'
      };
      if(rich&&criminal)return{
        label:'Criminal millionaire',
        summary:'You found money fast, but the damage is following you.'
      };
      if(familyStrong&&['Stable','Rising','Legendary'].includes(momentum.label))return{
        label:'Family-focused provider',
        summary:'Support, responsibility, and long-term trust are shaping your story.'
      };
      if(tiers.career==='Executive'&&stressed)return{
        label:'Burned-out executive',
        summary:'Career progress is real, but pressure is starting to cost more.'
      };
      if(momentum.label==='Legendary'&&this.num(G?.reputation,50)>=78)return{
        label:'Respected legend',
        summary:'Your choices are compounding into status, trust, and lasting memory.'
      };
      if(momentum.label==='Rising'&&tiers.money==='Broke')return{
        label:'Broke but hopeful',
        summary:'Life is still fragile, but the direction is finally improving.'
      };
      if(momentum.label==='Rising'&&!!this.ensureState(G)?.flags?.turnaround)return{
        label:'Comeback story',
        summary:'You are recovering from a dangerous phase and building something better.'
      };
      if(momentum.label==='Rising'&&tiers.health==='Healthy')return{
        label:'Stable and healthy',
        summary:'Good habits are protecting both opportunity and mood.'
      };
      return{
        label:'Life in motion',
        summary:'Your systems are connected now, and the next few years can tip either way.'
      };
    },

    shouldWarn(id,cooldownYears=2,G=window.G){
      const S=this.ensureState(G);
      if(!S)return false;
      const age=this.num(G?.age,0);
      const last=this.num(S.cooldowns.warnings[id],-99);
      if(age-last<cooldownYears)return false;
      S.cooldowns.warnings[id]=age;
      return true;
    },

    applyNumericEffects(G,effects){
      if(!G||!effects)return;
      Object.entries(effects).forEach(([key,val])=>{
        val=this.num(val,0);
        if(!val)return;
        if(['happiness','health','smarts','looks','fitness','stress','fame','reputation','mentalHealth'].includes(key)){
          G[key]=this.clamp(this.num(G[key],key==='stress'?0:50)+val,0,100);
          return;
        }
        if(key==='karma'){
          G.karma=this.clamp(this.num(G.karma,0)+val,-100,100);
          return;
        }
        if(key==='money'){
          G.money=Math.max(0,Math.round(this.num(G.money,0)+val));
          return;
        }
        if(key==='jobPerf'){
          G.jobPerf=this.clamp(this.num(G.jobPerf,50)+val,0,100);
          return;
        }
        if(key==='crimeHeat'){
          G.crimeHeat=this.clamp(this.num(G.crimeHeat,0)+val,0,100);
          return;
        }
        if(key==='underworldRep'){
          G.underworldRep=this.clamp(this.num(G.underworldRep,0)+val,0,100);
          return;
        }
        if(key==='partnerLove'){
          const partner=this.partner(G);
          if(partner)partner.love=this.clamp(this.num(partner.love,60)+val,0,100);
          return;
        }
        if(key==='familyLegacyScore'){
          G.familyLegacyScore=this.clamp(this.num(G.familyLegacyScore,0)+val,0,100);
          return;
        }
      });
    },

    applyConsequences(source,intensity,tags,context){
      const G=window.G;
      const effects={};
      const add=(key,val)=>{effects[key]=(effects[key]||0)+val;};
      const has=tag=>tags.includes(tag);
      const risky=has('risky')||has('crime')||has('drama')||has('controversy')||has('gamble');
      const growth=has('growth')||has('push')||has('status')||has('money');
      const support=has('support')||has('family')||has('relationship')||has('recovery')||has('clean');

      if(has('crime')){
        add('stress',1+intensity);
        add('reputation',-1-Math.floor(intensity/2));
        add('crimeHeat',1+intensity);
        if(G.career)add('jobPerf',-1-intensity);
        if(this.partner(G))add('partnerLove',-(1+Math.floor(intensity/2)+(this.num(G.stress,0)>65?1:0)));
        if(this.arr(G.crimes).length>=3||this.num(G.crimeHeat,0)>50)add('happiness',-1);
      }

      if(has('career')){
        if(growth)add('reputation',1);
        if(has('push')||has('overwork')||this.num(context.primary.stressDelta,0)>=5){
          add('stress',1+intensity);
          if(this.partner(G)&&this.num(G.stress,0)>58)add('partnerLove',-1);
          if(this.num(G.health,50)<45)add('happiness',-1);
        }
        if(has('stable')||has('education')||has('skill'))add('jobPerf',1);
      }

      if(has('business')){
        add('stress',1+(risky?1:0));
        if(this.num(context.primary.moneyDelta,0)>0)add('reputation',1);
        if(this.num(context.primary.moneyDelta,0)<0&&this.debt(G)>Math.max(5000,this.num(typeof annualCost==='function'?annualCost(12000,G):12000,12000))){
          add('happiness',-1);
          if(this.partner(G))add('partnerLove',-1);
        }
        if(has('status')||this.businessProfit(G)>0)add('fame',1);
      }

      if(has('family')||has('relationship')){
        if(support&&!has('drama')&&!has('neglect')&&!has('cheat')){
          add('happiness',1+intensity);
          add('stress',-(1+intensity));
          add('familyLegacyScore',1+intensity);
          if(this.partner(G))add('partnerLove',1+Math.floor(intensity/2));
        }
        if(has('drama')||has('neglect')||has('cheat')){
          add('stress',2+intensity);
          add('happiness',-(1+intensity));
          add('reputation',has('cheat')?-2:-1);
          add('familyLegacyScore',-1);
          if(this.partner(G))add('partnerLove',-(2+intensity));
        }
      }

      if(has('health')){
        if(has('recovery')||support){
          add('mentalHealth',1+intensity);
          add('stress',-1);
          if(this.num(G.health,50)<65)add('happiness',1);
        }
        if(has('vice')||risky){
          add('health',-(1+Math.floor(intensity/2)));
          add('stress',1);
          if(this.num(G.health,50)<40)add('jobPerf',-1);
        }
      }

      if(has('fame')){
        add('stress',1+(this.num(G.followers,0)>=100000?1:0));
        if(has('controversy')){
          add('reputation',-2);
          if(this.partner(G))add('partnerLove',-1);
        }else{
          add('reputation',1);
        }
      }

      if(has('debt')){
        add('stress',1+intensity);
        add('happiness',-1);
        if(this.partner(G)&&this.num(G.money,0)<Math.max(2000,this.num(typeof annualCost==='function'?annualCost(5000,G):5000,5000)))add('partnerLove',-1);
      }

      if(has('skill')||has('education')){
        add('reputation',1);
        if(G.career)add('jobPerf',1);
      }

      if(this.num(G.stress,0)>82&&risky){
        add('health',-1);
        add('happiness',-1);
        if(this.partner(G))add('partnerLove',-1);
      }
      if(this.num(G.health,50)<35&&(growth||has('push'))){
        add('stress',1);
        if(G.career)add('jobPerf',-1);
      }
      if(this.num(G.reputation,50)<35&&has('crime'))add('reputation',-1);
      if(this.partnerLove(G)>=72&&support)add('stress',-1);

      return effects;
    },

    queueChain(type,payload={}){
      const G=window.G;
      const S=this.ensureState(G);
      if(!S)return;
      let chain=S.chains.find(item=>item&&item.type===type);
      if(!chain){
        chain={type,stage:0,pressure:1,nextAge:(G.age||0)+1,payload:{}};
        S.chains.push(chain);
      }
      chain.pressure=this.clamp(this.num(chain.pressure,1)+this.num(payload.pressure,1),1,5);
      chain.nextAge=Math.min(this.num(chain.nextAge,(G.age||0)+1),(G.age||0)+1);
      chain.payload={...(chain.payload||{}),...payload};
    },

    resolveChains(){
      const G=window.G;
      const S=this.ensureState(G);
      if(!G||!S)return;
      const nextChains=[];

      this.arr(S.chains).forEach(chain=>{
        if(!chain||this.num(chain.nextAge,999)>(G.age||0)){
          nextChains.push(chain);
          return;
        }

        let effects={};
        let text='';
        let type='bad';
        const pressure=this.clamp(this.num(chain.pressure,1),1,5);

        if(chain.type==='crime_spiral'){
          if((this.num(G.crimeHeat,0)<20)&&this.arr(G.crimes).length<2){
            text='You cooled your criminal life down before it hardened into permanent damage.';
            type='good';
          }else if(chain.stage===0){
            effects={reputation:-2,stress:2,jobPerf:G.career?-2:0,partnerLove:this.partner(G)?-2:0};
            text='Your criminal choices are starting to close clean doors and strain trust.';
            chain.stage=1;
            chain.nextAge=(G.age||0)+1;
            nextChains.push(chain);
          }else if(chain.stage===1){
            effects={stress:2+pressure,happiness:-2,partnerLove:this.partner(G)?-2:0,familyLegacyScore:-1};
            text='The underworld pressure followed you into your relationships and peace of mind.';
            chain.stage=2;
            chain.nextAge=(G.age||0)+1;
            nextChains.push(chain);
          }else{
            effects={stress:3+pressure,reputation:-2,jobPerf:G.career?-3:0,health:this.num(G.stress,0)>70?-2:0};
            text='The cost of repeated crime is now touching your health, career, and long-term future.';
          }
        }else if(chain.type==='gambling_spiral'){
          if((this.num(G.lifetimeGambled,0)===0)||this.num(G.money,0)>Math.max(8000,this.num(typeof annualCost==='function'?annualCost(14000,G):14000,14000))*2){
            text='You pulled back before risky money habits became a deeper problem.';
            type='good';
          }else if(chain.stage===0){
            effects={stress:2,happiness:-1};
            text='The easy-money buzz is turning into restless risk-taking.';
            chain.stage=1;
            chain.nextAge=(G.age||0)+1;
            nextChains.push(chain);
          }else{
            effects={money:-Math.max(1200,this.num(typeof annualCost==='function'?annualCost(1800,G):1800,1800)),stress:3+pressure,happiness:-2,partnerLove:this.partner(G)?-1:0};
            text='Risky speculation is starting to cost you cash, trust, and emotional stability.';
          }
        }else if(chain.type==='burnout_spiral'){
          if(this.num(G.stress,0)<45||this.num(G.mentalHealth,60)>72){
            text='You stabilized before burnout became a life-defining collapse.';
            type='good';
            S.flags.turnaround=true;
          }else if(chain.stage===0){
            effects={mentalHealth:-3,happiness:-3};
            text='Long pressure is turning into burnout. Your mind is paying first.';
            chain.stage=1;
            chain.nextAge=(G.age||0)+1;
            nextChains.push(chain);
          }else if(chain.stage===1){
            effects={health:-3,jobPerf:G.career?-2:0,partnerLove:this.partner(G)?-2:0};
            text='Burnout is now damaging health, performance, and relationship stability.';
          }
        }else if(chain.type==='business_pressure'){
          if(!G.business||this.businessProfit(G)>0&&this.debt(G)<Math.max(5000,this.num(typeof annualCost==='function'?annualCost(12000,G):12000,12000))*0.6){
            text='You steadied the business before the pressure became a full collapse.';
            type='good';
          }else if(chain.stage===0){
            effects={stress:3,reputation:-1};
            text='A struggling business is raising pressure faster than you can ignore it.';
            chain.stage=1;
            chain.nextAge=(G.age||0)+1;
            nextChains.push(chain);
          }else{
            effects={happiness:-2,partnerLove:this.partner(G)?-1:0,health:this.num(G.stress,0)>68?-2:0};
            text='Business strain is now leaking into health, mood, and home life.';
          }
        }

        this.applyNumericEffects(G,effects);
        if(text)this.pushFeedback({age:G.age,level:type==='good'?'medium':'major',type:text.indexOf('stabilized')>-1?'good':'bad',text,reason:'event chain'});
      });

      S.chains=nextChains.slice(0,8);
    },

    pushFeedback(entry){
      const G=window.G;
      const S=this.ensureState(G);
      if(!S||!entry||!entry.text)return;
      const text=String(entry.text).trim();
      if(!text||text===S.lastFeedbackText)return;
      S.lastFeedbackText=text;
      S.feedback.unshift({...entry,text,ts:Date.now(),age:this.num(entry.age,G?.age||0)});
      S.feedback=S.feedback.slice(0,18);
      if(entry.level==='small'){
        UI?.toast?.(text,entry.type||'neutral',3200);
      }else if(entry.level==='medium'){
        Engine?.log?.(text,entry.type||'special');
      }else{
        UI?.toast?.(text,entry.type||'neutral',4800);
        Engine?.log?.(text,entry.type||'special');
      }
    },

    buildFeedback(source,tags,primary,effects){
      const has=tag=>tags.includes(tag);
      const partnerHit=this.num(effects.partnerLove,0)<0;
      if(has('crime')){
        return partnerHit
          ?'Fast money brought pressure, and the fallout is starting to damage both trust and reputation.'
          :'Quick gains came with pressure. Your criminal image is starting to damage future options.';
      }
      if(has('career')){
        return partnerHit
          ?'Work pushed your position forward, but the pressure is starting to spill into your personal life.'
          :'Career progress helped your status, but the extra pressure is not free.';
      }
      if(has('business')){
        return this.num(primary.moneyDelta,0)>=0
          ?'Your business move improved upside, but the strain on stress and reputation is becoming real.'
          :'The business setback is no longer just financial. It is starting to affect mood and stability too.';
      }
      if(has('family')||has('relationship')){
        return has('drama')||has('neglect')||has('cheat')
          ?'Emotional strain is building. Trust is reacting to the pressure around your choices.'
          :'Showing up for people around you improved both happiness and long-term stability.';
      }
      if(has('health')){
        return has('recovery')
          ?'Taking care of yourself lowered future risk and made the rest of life easier to carry.'
          :'The short-term relief came with a longer-term cost to health and energy.';
      }
      if(has('fame')){
        return has('controversy')
          ?'Attention rose quickly, but public pressure and trust both became more fragile.'
          :'Visibility is opening doors, but it is also making stress easier to trigger.';
      }
      return 'Your choice touched more than one part of life, and the effects are starting to connect.';
    },

    processAction(source,tags,before,after,meta={}){
      const G=window.G;
      const S=this.ensureState(G);
      if(!G||!S||!before||!after||!Array.isArray(tags)||!tags.length)return;

      const primary={
        moneyDelta:Math.round(after.money-before.money),
        netWorthDelta:Math.round(after.netWorth-before.netWorth),
        healthDelta:Math.round(after.health-before.health),
        happinessDelta:Math.round(after.happiness-before.happiness),
        stressDelta:Math.round(after.stress-before.stress),
        reputationDelta:Math.round(after.reputation-before.reputation),
        fameDelta:Math.round(after.fame-before.fame),
        partnerDelta:Math.round(after.partnerLove-before.partnerLove),
        jobPerfDelta:Math.round(after.jobPerf-before.jobPerf),
        crimeDelta:Math.round(after.crimeHeat-before.crimeHeat),
        debtDelta:Math.round(after.debt-before.debt),
        businessDelta:Math.round(after.businessValue-before.businessValue),
        gambleDelta:Math.round(after.lifetimeGambled-before.lifetimeGambled)
      };

      const majorMagnitude=
        Math.abs(primary.moneyDelta)>=Math.max(2000,this.num(typeof annualCost==='function'?annualCost(4000,G):4000,4000))||
        Math.abs(primary.stressDelta)>=7||
        Math.abs(primary.healthDelta)>=5||
        Math.abs(primary.reputationDelta)>=4||
        Math.abs(primary.partnerDelta)>=4||
        Math.abs(primary.businessDelta)>=10000;
      const mediumMagnitude=
        majorMagnitude||
        Math.abs(primary.moneyDelta)>=Math.max(500,this.num(typeof annualCost==='function'?annualCost(1500,G):1500,1500))||
        Math.abs(primary.stressDelta)>=3||
        Math.abs(primary.happinessDelta)>=3||
        Math.abs(primary.crimeDelta)>=3||
        Math.abs(primary.debtDelta)>=1000;

      if(!mediumMagnitude&&!meta.force)return;

      let intensity=1;
      if(majorMagnitude||tags.includes('crime')||tags.includes('business')||tags.includes('controversy'))intensity=2;
      if((tags.includes('crime')&&this.arr(G.crimes).length>=3)||(tags.includes('business')&&this.debt(G)>Math.max(5000,this.num(typeof annualCost==='function'?annualCost(18000,G):18000,18000)))||this.num(G.stress,0)>82)intensity=3;

      const effects=this.applyConsequences(source,intensity,tags,{before,after,primary,meta});
      this.applyNumericEffects(G,effects);

      if(tags.includes('crime')&&(primary.moneyDelta>0||primary.crimeDelta>0))this.queueChain('crime_spiral',{origin:source});
      if(primary.gambleDelta>0||tags.includes('gamble'))this.queueChain('gambling_spiral',{origin:source});
      if((tags.includes('business')&&primary.moneyDelta<0&&this.debt(G)>Math.max(5000,this.num(typeof annualCost==='function'?annualCost(12000,G):12000,12000)))||primary.businessDelta<0)this.queueChain('business_pressure',{origin:source});
      if(this.num(G.stress,0)>78&&(tags.includes('push')||tags.includes('risky')||tags.includes('career')||tags.includes('business')))this.queueChain('burnout_spiral',{origin:source});

      this.recomputeMeta(G);

      const text=this.buildFeedback(source,tags,primary,effects);
      const level=intensity>=3?'major':intensity===2?'medium':'small';
      const type=(tags.includes('crime')||tags.includes('controversy')||tags.includes('drama')||tags.includes('debt'))?'bad':(tags.includes('recovery')||tags.includes('support')||tags.includes('family'))?'good':'neutral';
      this.pushFeedback({age:G.age,level,type,text,reason:source});

      const warning=this.pickWarning(G,tags);
      if(warning)this.pushFeedback({age:G.age,level:'medium',type:'bad',text:warning,reason:'warning'});

      const opportunity=this.pickOpportunity(G,tags);
      if(opportunity&&level!=='small')this.pushFeedback({age:G.age,level:'medium',type:'special',text:opportunity,reason:'opportunity'});

      UI?.update?.();
    },

    pickWarning(G=window.G,tags=[],options={}){
      const consume=options.consume!==false;
      const debt=this.debt(G);
      const canWarn=(id,cooldownYears)=>!consume||this.shouldWarn(id,cooldownYears,G);
      if(this.num(G?.stress,0)>=86&&canWarn('stress_high',2))return'Stress is dangerously high. Another risky choice could trigger a burnout spiral.';
      if(this.num(G?.health,50)<=34&&canWarn('health_low',2))return'Health is declining. Ignoring it now can reduce both performance and lifespan.';
      if(this.num(G?.reputation,50)<=28&&(tags.includes('crime')||this.arr(G?.crimes).length>=3)&&canWarn('rep_crime',3))return'Your reputation is low. More crime could permanently damage clean career options.';
      if(this.partnerLove(G)<=34&&canWarn('partner_low',2))return'Family trust is low. More neglect could break the relationship for good.';
      if(debt>=Math.max(12000,this.num(typeof annualCost==='function'?annualCost(16000,G):16000,16000))&&canWarn('debt_rise',2))return'Debt is rising. One bad business year could become dangerous.';
      return'';
    },

    pickOpportunity(G=window.G,tags=[]){
      if(this.num(G?.reputation,50)>=72&&['Stable','Rising','Legendary'].includes(this.ensureState(G)?.momentum?.label))return'Your reputation is strong. Better work, business, and relationship opportunities are opening.';
      if(this.num(G?.fame,0)>=60&&G?.business)return'Public attention is creating better business opportunities and stronger status momentum.';
      if(this.num(G?.health,50)>=78&&this.num(G?.stress,0)<=32)return'Your stability is turning into momentum. This is a good time to push a bigger goal.';
      if(this.partnerLove(G)>=72&&this.childCount(G)>0)return'Your support system is strong enough to soften future stress and long-term setbacks.';
      return'';
    },

    detectTierChanges(G=window.G,previousTiers=null){
      const S=this.ensureState(G);
      if(!S)return;
      const nextTiers=this.computeTiers(G);
      const prevTiers=previousTiers||S.tiers||{};
      const order={
        money:['Broke','Stable','Comfortable','Rich','Millionaire','Elite','Legendary'],
        fame:['Unknown','Known','Local Star','Famous','Icon','Legend'],
        career:['Unemployed','Worker','Specialist','Manager','Executive','Industry Leader'],
        relationship:['Single','Dating','Serious','Married','Legacy Family'],
        crime:['Clean','Suspicious','Wanted','Convicted','Underworld Figure'],
        health:['Fragile','Average','Healthy','Athletic','Peak Condition']
      };

      Object.entries(nextTiers).forEach(([key,value])=>{
        const prev=prevTiers[key];
        if(!prev||prev===value)return;
        const scale=order[key]||[];
        const prevIndex=scale.indexOf(prev);
        const nextIndex=scale.indexOf(value);
        const rise=nextIndex>prevIndex;
        const tone=key==='crime'?(rise?'bad':'good'):(rise?'good':'bad');
        const verb=key==='crime'
          ?(rise?'deepened':'improved')
          :(rise?'rose':'slipped');
        this.pushFeedback({
          age:G.age,
          level:'medium',
          type:tone,
          text:`Your ${key} status ${verb}: ${prev} -> ${value}.`,
          reason:'tier shift'
        });
      });

      S.tiers=nextTiers;
    },

    recomputeMeta(G=window.G){
      const S=this.ensureState(G);
      if(!S)return;
      const momentum=this.computeMomentum(G);
      const tiers=this.computeTiers(G);
      const identity=this.computeIdentity(G,momentum,tiers);
      S.momentum=momentum;
      S.tiers=tiers;
      S.identityLabel=identity.label;
      S.identitySummary=identity.summary;
      S.lastWarning=this.pickWarning(G,[],{consume:false});
      S.lastOpportunity=this.pickOpportunity(G,[]);
      return S;
    },

    yearlyCrossReactions(){
      const G=window.G;
      if(!G)return;
      const effects={};
      const add=(key,val)=>{effects[key]=(effects[key]||0)+val;};

      if(this.num(G.health,50)<40&&G.career)add('jobPerf',-2);
      if(this.num(G.health,50)<34)add('happiness',-2);
      if(this.num(G.stress,0)>74&&this.partner(G))add('partnerLove',-2);
      if(this.debt(G)>=Math.max(8000,this.num(typeof annualCost==='function'?annualCost(12000,G):12000,12000))){
        add('stress',3);
        add('happiness',-2);
      }
      if(this.partnerLove(G)>=68||this.childCount(G)>=2){
        add('stress',-2);
        add('familyLegacyScore',1);
      }
      if(this.arr(G.crimes).length>0&&G.career){
        add('jobPerf',-2);
        add('reputation',-1);
      }
      if(this.num(G.fame,0)>=60&&G.business)add('reputation',1);
      if(this.businessProfit(G)>0&&G.business)add('fame',1);
      if(this.totalSkillLevels(G)>=12&&(G.career||G.business))add('reputation',1);
      if((G.age||0)>=60&&this.num(G.health,50)<45)add('stress',2);
      if(this.num(G.stress,0)>84&&this.num(G.health,50)<45)add('mentalHealth',-3);

      this.applyNumericEffects(G,effects);
    },

    buildYearSummary(G=window.G){
      const S=this.ensureState(G);
      const before=this._beforeAge;
      if(!G||!S||!before||before.serial===(G.ageUpSerial||0)||before.age+1!==(G.age||0))return null;
      const after=this.snapshot(G);

      const moneyText=after.netWorth>before.netWorth
        ?`Income and assets moved your net worth up by ${this.shortMoney(after.netWorth-before.netWorth)}.`
        :(after.netWorth<before.netWorth?`Your net worth fell by ${this.shortMoney(before.netWorth-after.netWorth)}.`:'Money stayed mostly flat this year.');

      let familyText='Family relationships held roughly steady.';
      if(after.partnerLove>before.partnerLove||after.childCount>before.childCount||after.familyLegacyScore>before.familyLegacyScore){
        familyText='Family support or trust improved this year.';
      }else if(after.partnerLove<before.partnerLove||after.familyLegacyScore<before.familyLegacyScore){
        familyText='Family trust weakened under the pressure of your choices.';
      }

      let healthText='Health and stress stayed fairly balanced.';
      if(after.health>before.health||after.stress<before.stress){
        healthText='Your health routine reduced pressure and improved resilience.';
      }else if(after.health<before.health||after.stress>before.stress){
        healthText='Stress or neglect pushed your body in the wrong direction.';
      }

      let statusText='Your public status stayed steady.';
      if(after.reputation>before.reputation||after.fame>before.fame||after.jobPerf>before.jobPerf){
        statusText='Your reputation, career, or public standing improved.';
      }else if(after.reputation<before.reputation||after.crimeHeat>before.crimeHeat||after.jobPerf<before.jobPerf){
        statusText='Career, reputation, or crime pressure made the year harder to carry.';
      }

      const warning=S.lastWarning||this.pickWarning(G,[],{consume:false});
      const opportunity=S.lastOpportunity||this.pickOpportunity(G,[]);
      const summary={
        age:G.age,
        serial:G.ageUpSerial||0,
        momentum:S.momentum,
        identity:S.identityLabel,
        moneyText,
        familyText,
        healthText,
        statusText,
        warning,
        opportunity
      };
      S.lastYearSummary=summary;
      S.yearlyHistory.unshift(summary);
      S.yearlyHistory=S.yearlyHistory.slice(0,24);
      S.lastSummarySerial=summary.serial;
      this._beforeAge=null;
      return summary;
    },

    heroHTML(G=window.G){
      const S=this.ensureState(G);
      if(!G||!S)return'';
      const momentum=S.momentum||this.computeMomentum(G);
      const tiers=S.tiers||this.computeTiers(G);
      const warning=S.lastWarning||'';
      const opportunity=S.lastOpportunity||'';
      const chips=[
        `Money: ${tiers.money}`,
        `Fame: ${tiers.fame}`,
        `Career: ${tiers.career}`,
        `Relationship: ${tiers.relationship}`,
        `Crime: ${tiers.crime}`,
        `Health: ${tiers.health}`
      ];
      return `<section class="ls-hero-card">
        <div class="ls-hero-top">
          <div>
            <div class="ls-kicker">Life Direction</div>
            <h3>${this.esc(S.identityLabel)}</h3>
            <p>${this.esc(S.identitySummary)}</p>
          </div>
          <div class="ls-momentum-pill tone-${this.esc(momentum.tone)}">
            <strong>${this.esc(momentum.label)}</strong>
            <span>${momentum.score}/100</span>
          </div>
        </div>
        <div class="ls-chip-row">${chips.map(chip=>`<span class="ls-chip">${this.esc(chip)}</span>`).join('')}</div>
        <div class="ls-guidance-grid">
          <div class="ls-guidance-card">
            <span class="ls-guidance-label">Momentum</span>
            <strong>${this.esc(momentum.label)}</strong>
            <p>${momentum.label==='Legendary'?'Your systems are compounding in your favor.':momentum.label==='Dangerous'?'Several systems are collapsing into each other.':momentum.label==='Rising'?'The next few years can snowball upward if you stay disciplined.':'Small choices still matter because pressure can spread.'}</p>
          </div>
          <div class="ls-guidance-card">
            <span class="ls-guidance-label">Opportunity</span>
            <strong>${this.esc(opportunity||'Nothing major unlocked right now.')}</strong>
            <p>${this.esc(warning||'No critical warning right now. Keep protecting health, trust, and reputation.')}</p>
          </div>
        </div>
      </section>`;
    },

    yearSummaryHTML(G=window.G){
      const S=this.ensureState(G);
      const summary=S?.lastYearSummary;
      if(!summary)return'';
      return `<section class="ls-year-card">
        <div class="ls-year-head">
          <div>
            <div class="ls-kicker">This Year</div>
            <h3>${this.esc(summary.identity)} - ${this.esc(summary.momentum.label)}</h3>
          </div>
          <span class="ls-year-age">Age ${summary.age}</span>
        </div>
        <div class="ls-year-list">
          <div class="ls-year-item"><b>Money</b><span>${this.esc(summary.moneyText)}</span></div>
          <div class="ls-year-item"><b>Family</b><span>${this.esc(summary.familyText)}</span></div>
          <div class="ls-year-item"><b>Health</b><span>${this.esc(summary.healthText)}</span></div>
          <div class="ls-year-item"><b>Status</b><span>${this.esc(summary.statusText)}</span></div>
        </div>
        ${summary.warning?`<div class="ls-inline-note tone-bad"><strong>Warning</strong><span>${this.esc(summary.warning)}</span></div>`:''}
        ${summary.opportunity?`<div class="ls-inline-note tone-good"><strong>Opportunity</strong><span>${this.esc(summary.opportunity)}</span></div>`:''}
        <details class="ls-year-details">
          <summary>More detail</summary>
          <div class="ls-feedback-list">${this.arr(S.feedback).slice(0,5).map(item=>`<div class="ls-feedback-item tone-${this.esc(item.type||'neutral')}"><span>${this.esc(item.text)}</span></div>`).join('')}</div>
        </details>
      </section>`;
    },

    injectLifeCards(){
      const el=document.getElementById('tab-life');
      if(!el)return;
      el.querySelector('.ls-life-shell')?.remove();
    },

    togglePanel(forceOpen=null){
      const G=window.G;
      const S=this.ensureState(G);
      if(!G||!S)return;
      S.panelOpen=typeof forceOpen==='boolean'?forceOpen:!S.panelOpen;
      this.injectLifeCards();
    },

    addAchievements(){
      if(typeof ACHIEVEMENTS==='undefined')return;
      const additions=[
        {id:'ls_10k',icon:'💵',name:'Five Figures',desc:'Reach $10K net worth',rarity:'common',check:G=>this.net(G)>=10000},
        {id:'ls_100k',icon:'🏦',name:'Six Figures',desc:'Reach $100K net worth',rarity:'rare',check:G=>this.net(G)>=100000},
        {id:'ls_family_legacy',icon:'🌳',name:'Built Family Legacy',desc:'Reach 80 family legacy score with a committed family life',rarity:'epic',check:G=>this.num(G.familyLegacyScore,0)>=80&&this.relationshipStage(G)!=='Single'&&this.childCount(G)>=1},
        {id:'ls_famous_icon',icon:'🌟',name:'Famous Icon',desc:'Become an Icon or Legend',rarity:'epic',check:G=>['Icon','Legend'].includes(this.computeTiers(G).fame)},
        {id:'ls_business_empire',icon:'🏢',name:'Business Empire',desc:'Build a business worth $10M+',rarity:'legendary',check:G=>this.num(G.business?.value,0)>=10000000},
        {id:'ls_crime_free',icon:'🕊️',name:'Crime-Free Life',desc:'Reach age 60 with a clean record',rarity:'rare',check:G=>(G.age||0)>=60&&this.computeTiers(G).crime==='Clean'},
        {id:'ls_healthy_decade',icon:'🩺',name:'Healthy Decade',desc:'Hold a 10-year healthy streak',rarity:'rare',check:G=>this.num(G.healthyStreak,0)>=10},
        {id:'ls_escaped_poverty',icon:'🌅',name:'Escaped Poverty',desc:'Climb from rock bottom into Comfortable status',rarity:'epic',check:G=>!!G.achievements?.rock_bottom&&['Comfortable','Rich','Millionaire','Elite','Legendary'].includes(this.computeTiers(G).money)},
        {id:'ls_turnaround_story',icon:'🔄',name:'Turned Life Around',desc:'Recover from Dangerous momentum into Rising or Legendary',rarity:'legendary',check:G=>!!this.ensureState(G)?.flags?.turnaround&&['Rising','Legendary'].includes(this.ensureState(G)?.momentum?.label)}
      ];
      additions.forEach(achievement=>{
        if(!ACHIEVEMENTS.some(existing=>existing.id===achievement.id))ACHIEVEMENTS.push(achievement);
      });
    },

    rewardNewAchievements(){
      const G=window.G;
      const S=this.ensureState(G);
      if(!G||!S||typeof Save==='undefined')return;
      const unlocked=this.arr(Save.unlockedAchs());
      unlocked.forEach(id=>{
        if(S.achievementRewards[id])return;
        let rewardText='';
        let effects=null;
        if(id==='ls_10k'||id==='ls_100k'){effects={reputation:1,happiness:2};rewardText='Reward: +Reputation, +Happiness';}
        else if(id==='ls_family_legacy'){effects={familyLegacyScore:3,happiness:2,karma:2};rewardText='Reward: +Legacy, +Happiness';}
        else if(id==='ls_famous_icon'){effects={reputation:2,happiness:1};rewardText='Reward: +Reputation';}
        else if(id==='ls_business_empire'){effects={reputation:3,fame:2};rewardText='Reward: +Reputation, +Fame';}
        else if(id==='ls_crime_free'){effects={reputation:3,mentalHealth:2};rewardText='Reward: +Reputation';}
        else if(id==='ls_healthy_decade'){effects={health:2,mentalHealth:2};rewardText='Reward: +Health';}
        else if(id==='ls_escaped_poverty'){effects={happiness:4,reputation:2};rewardText='Reward: +Happiness, +Reputation';}
        else if(id==='ls_turnaround_story'){effects={health:2,happiness:3,mentalHealth:3};rewardText='Reward: comeback bonus';}
        if(effects){
          this.applyNumericEffects(G,effects);
          Engine?.log?.(`🏆 ${rewardText}.`, 'special');
          UI?.toast?.(`🏆 ${rewardText}.`, 'ach', 4200);
          S.lastAchievementReward=rewardText;
        }
        S.achievementRewards[id]=true;
      });
    },

    tickYear(){
      const G=window.G;
      const S=this.ensureState(G);
      if(!G||!S||S.lastAgeProcessed===(G.age||0))return;
      try{window.ReleaseSystems?.tick?.();}catch(e){console.warn('[LifeSystems/ReleaseSystems tick]',e);}
      const previousTiers={...(S.tiers||{})};
      this.yearlyCrossReactions();
      this.resolveChains();
      this.recomputeMeta(G);
      this.detectTierChanges(G,previousTiers);
      if(S.momentum.label==='Dangerous')S.flags.seenDangerous=true;
      if(S.flags.seenDangerous&&['Rising','Legendary'].includes(S.momentum.label))S.flags.turnaround=true;
      S.lastAgeProcessed=G.age||0;
    },

    momentumEvent(){
      const G=window.G;
      const S=this.ensureState(G);
      if(!G||!S)return null;
      if((G.age||0)<20)return null;
      if((G.age||0)-this.num(S.lastMomentumEventAge,-99)<3)return null;
      const momentum=this.computeMomentum(G);
      S.momentum=momentum;
      if(momentum.score>=78){
        S.lastMomentumEventAge=G.age||0;
        return{
          icon:'⭐',
          type:'special',
          title:'Momentum Spike',
          text:'Your good habits are compounding. This year can open a better class of opportunity if you press carefully.',
          choices:[
            {t:'Push the advantage',sub:'More status and money, but more pressure.',e:{money:2500,reputation:3,stress:3}},
            {t:'Protect the balance',sub:'Lower pressure and strengthen stability.',e:{happiness:4,health:3,stress:-4,mentalHealth:3}}
          ]
        };
      }
      if(momentum.score<=24){
        S.lastMomentumEventAge=G.age||0;
        return{
          icon:'⚠️',
          type:'bad',
          title:'Pressure Is Connecting',
          text:'Debt, stress, or damage are starting to connect. If you ignore it, the next few years get harsher.',
          choices:[
            {t:'Stabilize now',sub:'Less upside, safer recovery path.',e:{stress:-5,happiness:2,money:-1200}},
            {t:'Keep gambling on upside',sub:'Tempting now, dangerous later.',e:{money:2200,stress:5,reputation:-2}}
          ]
        };
      }
      return null;
    },

    decorateDeath(){
      const G=window.G;
      if(!G)return;
      const S=this.recomputeMeta(G);
      const tiers=S.tiers||this.computeTiers(G);
      const label=S.identityLabel||'Life in motion';
      const success=
        G.ambitionAchieved?'achieving your life ambition':
        ['Millionaire','Elite','Legendary'].includes(tiers.money)?`building ${tiers.money.toLowerCase()} wealth`:
        ['Icon','Legend'].includes(tiers.fame)?`becoming ${tiers.fame.toLowerCase()}`:
        this.num(G.familyLegacyScore,0)>=75?'building a family legacy':
        G.business?`building ${G.business.name}`:
        G.career?`becoming a respected ${G.career.title.toLowerCase()}`:'surviving a difficult life';
      const regret=
        this.partnerLove(G)<35&&this.childCount(G)===0?'letting success outrun connection':
        this.num(G.stress,0)>=78?'living under too much pressure':
        this.computeTiers(G).crime!=='Clean'?'chasing dangerous shortcuts':
        this.num(G.health,50)<40?'ignoring your health for too long':
        'the life you never fully had time to build';
      const familyState=this.relationshipStage(G)==='Single'&&this.childCount(G)===0?'mostly alone':`${this.relationshipStage(G).toLowerCase()} with ${this.childCount(G)} child${this.childCount(G)!==1?'ren':''}`;
      const wealthState=tiers.money.toLowerCase();
      const rememberedFor=
        this.computeTiers(G).crime==='Underworld Figure'?'the dangerous life you built':
        ['Icon','Legend'].includes(tiers.fame)?'status, visibility, and public presence':
        this.num(G.familyLegacyScore,0)>=75?'the family you held together':
        G.business?'the business you built':
        G.career?'your professional reputation':'endurance';
      const quote=
        label==='Rich but lonely'?'You died rich, but lonely.':
        label==='Family-focused provider'?'You built a family legacy that outlived you.':
        label==='Famous but stressed'?'You became visible, but pressure never stopped collecting its price.':
        label==='Dangerous risk-taker'?'You chased quick upside and lived with the cost.':
        label==='Comeback story'?'You turned a hard life into something people could respect.':
        `You died as ${label.toLowerCase()}.`;

      const title=document.getElementById('dt-title');
      const cause=document.getElementById('dt-cause');
      const quoteEl=document.getElementById('dt-quote');
      const story=document.getElementById('dt-story');
      if(title)title.textContent=`${G.name} ${G.surname} — ${label}`;
      if(cause)cause.textContent=`Cause of death: ${G.causeOfDeath||'Unknown'} · Final reputation: ${this.num(G.reputation,50)}/100`;
      if(quoteEl)quoteEl.textContent=quote;
      if(story){
        story.innerHTML=[
          `<p><strong>Biggest success:</strong> ${this.esc(success)}.</p>`,
          `<p><strong>Biggest regret:</strong> ${this.esc(regret)}.</p>`,
          `<p><strong>Final life:</strong> ${this.esc(label)} · family ${this.esc(familyState)} · wealth ${this.esc(wealthState)} · legacy ${this.esc(this.num(G.familyLegacyScore,0)>=75?'lasting':'fragile')}.</p>`,
          `<p><strong>Remembered for:</strong> ${this.esc(rememberedFor)}.</p>`
        ].join('');
      }
    },

    wrapMethod(target,name,getMeta){
      if(!target||typeof target[name]!=='function'||target[name]._lifeSystemsWrapped)return;
      const original=target[name];
      const self=this;
      target[name]=function(...args){
        const G=window.G;
        const before=G?self.snapshot(G):null;
        const meta=typeof getMeta==='function'?getMeta.call(this,args,G,before):getMeta;
        const result=original.apply(this,args);
        const after=window.G?self.snapshot(window.G):null;
        if(meta&&before&&after)self.processAction(meta.source||name,meta.tags||[],before,after,meta);
        return result;
      };
      target[name]._lifeSystemsWrapped=true;
    },

    patchActions(){
      this.wrapMethod(Engine,'act',function(args){
        const id=args[0];
        const map={
          study:{source:'Study',tags:['career','education','growth','skill']},
          library:{source:'Library',tags:['education','health','recovery','skill']},
          meditate:{source:'Meditation',tags:['health','recovery','support']},
          therapy:{source:'Therapy',tags:['health','recovery','support']},
          gym:{source:'Gym',tags:['health','growth']},
          run:{source:'Run',tags:['health','recovery']},
          swim:{source:'Swim',tags:['health','growth']},
          yoga:{source:'Yoga',tags:['health','recovery']},
          hike:{source:'Hike',tags:['health','recovery']},
          sports:{source:'Sports',tags:['health','growth','status']},
          sleep:{source:'Rest',tags:['health','recovery','support']},
          travel:{source:'Travel',tags:['money','health','recovery','fame']},
          volunteer:{source:'Volunteer',tags:['family','support','reputation']},
          bar:{source:'Night Out',tags:['health','risky','vice','relationship']},
          smoke:{source:'Smoking',tags:['health','risky','vice']},
          drugs:{source:'Drugs',tags:['health','risky','crime','vice']}
        };
        return map[id]||null;
      });

      this.wrapMethod(Career,'workHard',()=>({source:'Work Hard',tags:['career','push','status']}));
      this.wrapMethod(Career,'askRaise',()=>({source:'Ask for Raise',tags:['career','money','status']}));
      this.wrapMethod(Career,'network',()=>({source:'Networking',tags:['career','reputation','growth']}));
      this.wrapMethod(Career,'takeCourse',()=>({source:'Course',tags:['career','education','skill','growth']}));
      this.wrapMethod(Career,'sideHustle',()=>({source:'Side Hustle',tags:['money','growth','stress']}));
      this.wrapMethod(Career,'overtime',()=>({source:'Overtime',tags:['career','push','money','overwork']}));
      this.wrapMethod(Career,'lookForJob',()=>({source:'Job Hunt',tags:['career','status','growth']}));
      this.wrapMethod(Career,'getPromoted',()=>({source:'Promotion Push',tags:['career','status','push']}));
      this.wrapMethod(Career,'seekMentor',()=>({source:'Seek Mentor',tags:['career','support','growth']}));
      this.wrapMethod(Career,'mentorJunior',()=>({source:'Mentor Junior',tags:['career','support','reputation']}));
      this.wrapMethod(Career,'suckUp',()=>({source:'Boss Politics',tags:['career','risky','status']}));
      this.wrapMethod(Career,'sabotage',()=>({source:'Sabotage',tags:['career','risky','drama','reputation']}));
      this.wrapMethod(Career,'blowOff',()=>({source:'Skip Work',tags:['career','risky','neglect']}));
      this.wrapMethod(Career,'sleepWithBoss',()=>({source:'Office Affair',tags:['career','relationship','risky','drama']}));
      this.wrapMethod(Career,'joinUnion',()=>({source:'Join Union',tags:['career','stable','support']}));
      this.wrapMethod(Career,'requestRemote',()=>({source:'Remote Work',tags:['career','stable','health']}));
      this.wrapMethod(Career,'retire',()=>({source:'Retirement',tags:['career','family','stable']}));
      this.wrapMethod(Career,'quit',()=>({source:'Quit Job',tags:['career','risky','money']}));

      this.wrapMethod(Business,'start',function(args){
        return{source:'Start Business',tags:['business','money','growth','risky','status'],businessType:args[0]};
      });
      this.wrapMethod(Business,'act',function(args){
        const id=args[0];
        const map={
          market:['business','growth','status'],
          hire:['business','growth','stress'],
          expand:['business','growth','risky','status'],
          efficiency:['business','stable','money'],
          franchise:['business','growth','risky','status'],
          pivot:['business','risky','growth'],
          ipo:['business','status','fame','risky'],
          sell:['business','money','status'],
          insurance:['business','stable','support'],
          pr:['business','fame','status'],
          product:['business','growth','status'],
          training:['business','support','growth'],
          digital:['business','growth','fame'],
          supplier:['business','stable','money'],
          automation:['business','growth','stress'],
          retreat:['business','support','health'],
          capital:['business','money','debt','risky'],
          taxhack:['business','money','risky','crime'],
          bribe:['business','money','crime','risky']
        };
        return{source:'Business Move',tags:map[id]||['business','money']};
      });

      this.wrapMethod(Crime,'do',()=>({source:'Crime',tags:['crime','money','risky','status']}));
      this.wrapMethod(Crime,'layLow',()=>({source:'Lay Low',tags:['crime','clean','recovery']}));
      this.wrapMethod(Crime,'lawyer',()=>({source:'Lawyer',tags:['crime','money','clean']}));
      this.wrapMethod(Crime,'secondChanceGig',()=>({source:'Legal Cash',tags:['career','money','clean']}));
      this.wrapMethod(Crime,'reform',()=>({source:'Reform',tags:['crime','health','recovery','clean']}));
      this.wrapMethod(Crime,'expunge',()=>({source:'Expunge Record',tags:['crime','clean','reputation']}));
      this.wrapMethod(Crime,'communityService',()=>({source:'Community Service',tags:['crime','clean','family','reputation']}));
      this.wrapMethod(Crime,'bribe',()=>({source:'Bribe',tags:['crime','money','risky','reputation']}));
      this.wrapMethod(Crime,'prisonAct',function(args){
        const kind=args[0];
        const map={
          behave:['crime','clean','recovery'],
          train:['crime','health','growth'],
          study:['crime','education','growth'],
          therapy:['crime','health','recovery'],
          work:['crime','money','stress'],
          bad:['crime','risky','status'],
          parole:['crime','clean','status']
        };
        return{source:'Prison Choice',tags:map[kind]||['crime','risky']};
      });

      this.wrapMethod(Relations,'pa',function(args){
        const act=args[0];
        const map={
          date:['relationship','support','family'],
          gift:['relationship','money','support'],
          flirt:['relationship','status'],
          compliment:['relationship','support'],
          weekend:['relationship','money','support'],
          trip:['relationship','money','support','family'],
          renew:['relationship','legacy','family','status'],
          counselling:['relationship','support','recovery'],
          intimate:['relationship','family','support'],
          massage:['relationship','support'],
          sext:['relationship','fame','risky'],
          baby:['relationship','family','legacy'],
          cheat:['relationship','drama','risky','cheat'],
          divorce:['relationship','drama','neglect']
        };
        return{source:'Relationship Choice',tags:map[act]||['relationship','support']};
      });
      this.wrapMethod(Relations,'findPartner',()=>({source:'Meet Someone',tags:['relationship','growth','status']}));
      this.wrapMethod(Relations,'dateApp',()=>({source:'Dating App',tags:['relationship','growth','risky']}));
      this.wrapMethod(Relations,'hookup',()=>({source:'Casual Hookup',tags:['relationship','risky','drama']}));
      this.wrapMethod(Relations,'visitAdultClub',()=>({source:'Nightlife',tags:['relationship','money','risky']}));
      this.wrapMethod(Relations,'familyAction',function(args){
        const act=args[1];
        const map={time:['family','support'],call:['family','support'],dinner:['family','money','support'],help:['family','money','support','legacy']};
        return{source:'Family Action',tags:map[act]||['family','support']};
      });
      this.wrapMethod(Relations,'childAction',function(args){
        const act=args[1];
        const map={time:['family','support','legacy'],school:['family','education','legacy'],gift:['family','money','support'],support:['family','support','legacy']};
        return{source:'Parenting Choice',tags:map[act]||['family','support']};
      });
      this.wrapMethod(Relations,'friendAction',function(args){
        const act=args[1];
        const map={hang:['relationship','support'],talk:['relationship','support','recovery'],gift:['relationship','money','support']};
        return{source:'Friendship Choice',tags:map[act]||['relationship','support']};
      });
      this.wrapMethod(Relations,'exAction',()=>({source:'Ex Relationship',tags:['relationship','drama','risky']}));
      this.wrapMethod(Relations,'loverAction',()=>({source:'Casual Relationship',tags:['relationship','risky','drama']}));

      this.wrapMethod(Health,'therapy',()=>({source:'Therapy Session',tags:['health','recovery','support']}));
      this.wrapMethod(Health,'meditate',()=>({source:'Meditation',tags:['health','recovery']}));
      this.wrapMethod(Health,'digitalDetox',()=>({source:'Digital Detox',tags:['health','recovery']}));
      this.wrapMethod(Health,'journaling',()=>({source:'Journaling',tags:['health','recovery']}));
      this.wrapMethod(Health,'burnoutRecovery',()=>({source:'Burnout Recovery',tags:['health','recovery','support']}));
      this.wrapMethod(Health,'visit',function(args){
        const kind=args[0];
        const map={gp:['health','stable','recovery'],specialist:['health','recovery'],hospital:['health','recovery','risky'],mental:['health','recovery','support']};
        return{source:'Medical Visit',tags:map[kind]||['health','recovery']};
      });
      this.wrapMethod(Health,'sexualCheckup',()=>({source:'Health Checkup',tags:['health','recovery','clean']}));
      this.wrapMethod(Health,'rehab',()=>({source:'Rehab',tags:['health','recovery','clean']}));
      this.wrapMethod(Health,'treat',()=>({source:'Treatment',tags:['health','recovery']}));
      this.wrapMethod(Health,'lifestyle',()=>({source:'Lifestyle Change',tags:['health','growth','recovery']}));
      this.wrapMethod(Health,'quitAddiction',()=>({source:'Quit Addiction',tags:['health','recovery','clean']}));
      this.wrapMethod(Health,'surg',()=>({source:'Surgery',tags:['health','recovery','risky']}));

      this.wrapMethod(Assets,'takeLoan',()=>({source:'Take Loan',tags:['money','debt','risky']}));
      this.wrapMethod(Assets,'payLoan',()=>({source:'Pay Loan',tags:['money','debt','clean']}));
      this.wrapMethod(Assets,'payLoanExtra',()=>({source:'Extra Payment',tags:['money','debt','clean']}));
      this.wrapMethod(Assets,'creditRepair',()=>({source:'Credit Repair',tags:['money','clean','reputation']}));
      this.wrapMethod(Assets,'refinanceLoan',()=>({source:'Refinance',tags:['money','debt','stable']}));
      this.wrapMethod(Assets,'payCollections',()=>({source:'Pay Collections',tags:['money','debt','clean']}));
      this.wrapMethod(Assets,'buyInsurance',()=>({source:'Insurance',tags:['money','stable','family','support']}));
      this.wrapMethod(Assets,'buyProp',()=>({source:'Buy Property',tags:['money','assets','status','risky']}));
      this.wrapMethod(Assets,'sellProp',()=>({source:'Sell Property',tags:['money','assets','status']}));
      this.wrapMethod(Assets,'buyVeh',()=>({source:'Buy Vehicle',tags:['money','status','risky']}));
      this.wrapMethod(Assets,'sellVeh',()=>({source:'Sell Vehicle',tags:['money','status']}));
      this.wrapMethod(Assets,'invest',function(args){
        const kind=args[0];
        const tags=['money','growth'];
        if(kind==='crypto'||kind==='forex'){tags.push('gamble','risky');}
        return{source:'Investment',tags};
      });
      this.wrapMethod(Assets,'donate',()=>({source:'Donate',tags:['money','family','support','reputation']}));
      this.wrapMethod(Assets,'setHousingPlan',function(args){
        const id=args[0];
        return{source:'Housing Choice',tags:id==='luxury'?['money','status','risky']:['family','stable','health']};
      });

      this.wrapMethod(Social,'post',()=>({source:'Content Post',tags:['fame','status','growth']}));
      this.wrapMethod(Social,'fame',function(args){
        const kind=args[0];
        const map={interview:['fame','status','reputation'],event:['fame','status'],charity:['fame','family','support','reputation'],scandal:['fame','controversy','risky','drama'],pr:['fame','clean','reputation'],break:['fame','health','recovery']};
        return{source:'Public Move',tags:map[kind]||['fame','status']};
      });
      this.wrapMethod(Social,'monetize',()=>({source:'Monetize Audience',tags:['fame','money','growth','status']}));
      this.wrapMethod(Social,'ops',function(args){
        const kind=args[0];
        const map={verify:['fame','reputation','status'],analytics:['fame','skill','growth'],manager:['fame','status','stress'],cleanup:['fame','clean','reputation']};
        return{source:'Creator Ops',tags:map[kind]||['fame','growth']};
      });
    },

    patchEngine(){
      if(window.Engine&&typeof Engine.ageUp==='function'&&!Engine._lifeSystemsAgeWrapped){
        const oldAge=Engine.ageUp.bind(Engine);
        const self=this;
        Engine.ageUp=function(){
          const G=window.G;
          if(G&&G.alive&&!this._aging)self._beforeAge=self.snapshot(G);
          return oldAge();
        };
        Engine._lifeSystemsAgeWrapped=true;
      }

      if(window.Engine&&typeof Engine._queueEvents==='function'&&!Engine._lifeSystemsQueueWrapped){
        const oldQueue=Engine._queueEvents.bind(Engine);
        const self=this;
        Engine._queueEvents=function(queue){
          oldQueue(queue);
          const limit=(window.G?.age||0)<18?2:3;
          if(queue.length>=limit)return;
          const evt=self.momentumEvent();
          if(evt)queue.push(evt);
        };
        Engine._lifeSystemsQueueWrapped=true;
      }

      if(window.Engine&&typeof Engine.checkAch==='function'&&!Engine._lifeSystemsAchWrapped){
        const oldCheck=Engine.checkAch.bind(Engine);
        const self=this;
        Engine.checkAch=function(){
          const before=typeof Save!=='undefined'?new Set(Save.unlockedAchs()):new Set();
          const out=oldCheck();
          const after=typeof Save!=='undefined'?new Set(Save.unlockedAchs()):new Set();
          if(after.size!==before.size){
            self.rewardNewAchievements();
            self.recomputeMeta(window.G);
          }
          return out;
        };
        Engine._lifeSystemsAchWrapped=true;
      }

      if(window.Engine&&typeof Engine._die==='function'&&!Engine._lifeSystemsDeathWrapped){
        const oldDie=Engine._die.bind(Engine);
        const self=this;
        Engine._die=function(cause){
          const out=oldDie(cause);
          self.decorateDeath();
          return out;
        };
        Engine._lifeSystemsDeathWrapped=true;
      }

      if(window.Engine&&Array.isArray(Engine._moduleOrder)){
        Engine._moduleOrder=Engine._moduleOrder.filter(step=>step!=='ReleaseSystems.tick'&&step!=='ReleaseConnections.tick'&&step!=='LifeSystems.tickYear');
        Engine._moduleOrder.push('LifeSystems.tickYear');
      }
    },

    patchUI(){
      if(window.UI&&typeof UI.update==='function'&&!UI._lifeSystemsUpdateWrapped){
        const oldUpdate=UI.update.bind(UI);
        const self=this;
        UI.update=function(){
          const out=oldUpdate();
          const G=window.G;
          if(G){
            self.recomputeMeta(G);
            if(self._beforeAge&&self.num(self._beforeAge.serial,-1)!==self.num(G.ageUpSerial,0)&&self.num(self._beforeAge.age,-1)+1===self.num(G.age,0)){
              self.buildYearSummary(G);
            }
          }
          return out;
        };
        UI._lifeSystemsUpdateWrapped=true;
      }

      if(window.UI&&typeof UI.renderLog==='function'&&!UI._lifeSystemsRenderWrapped){
        const oldRenderLog=UI.renderLog.bind(UI);
        const self=this;
        UI.renderLog=function(){
          const out=oldRenderLog();
          requestAnimationFrame(()=>self.injectLifeCards());
          return out;
        };
        UI._lifeSystemsRenderWrapped=true;
      }
    },

    boot(){
      this.addAchievements();
      this.patchEngine();
      this.patchUI();
      this.patchActions();
      this.recomputeMeta(window.G);
    }
  };

  window.LifeSystems=LifeSystems;

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',()=>LifeSystems.boot(),{once:true});
  }else{
    LifeSystems.boot();
  }

  window.addEventListener('load',()=>LifeSystems.boot());
})();
