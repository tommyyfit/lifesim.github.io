/* LifeSim v23.2 — age-aware progression, youth UX and logical action gates */
(function(){
  'use strict';

  const STAGES=[
    {key:'infant',min:0,max:2,label:'Infancy',icon:'👶',focus:'Safety, bonding and early development'},
    {key:'early',min:3,max:5,label:'Early Childhood',icon:'🧸',focus:'Play, curiosity and family connection'},
    {key:'school',min:6,max:12,label:'School Years',icon:'🎒',focus:'Learning, friendships and healthy routines'},
    {key:'teen',min:13,max:15,label:'Teen Years',icon:'🧑‍🎓',focus:'Identity, school and growing independence'},
    {key:'olderTeen',min:16,max:17,label:'Older Teen',icon:'🪪',focus:'Education, first income and adult preparation'},
    {key:'youngAdult',min:18,max:29,label:'Young Adult',icon:'🌱',focus:'Independence, work, relationships and foundations'},
    {key:'adult',min:30,max:59,label:'Adulthood',icon:'🧭',focus:'Career, family, health and long-term security'},
    {key:'senior',min:60,max:200,label:'Later Life',icon:'🌳',focus:'Health, purpose, family and legacy'},
  ];

  const TAB_RULES={
    life:{min:0,label:'Life'}, mind:{min:0,label:'Activities',adultLabel:'Mind'}, love:{min:0,label:'Family',adultLabel:'Love'},
    career:{min:5,label:'School',adultLabel:'Career'}, assets:{min:18,label:'Assets'}, health:{min:0,label:'Health'},
    crime:{min:18,label:'Crime'}, social:{min:13,label:'Create',adultLabel:'Creator'}, business:{min:18,label:'Business'}, hustle:{min:13,label:'Gigs',adultLabel:'Hustle'},
    pets:{min:6,label:'Pets'}, skills:{min:6,label:'Talents',adultLabel:'Skills'}, stocks:{min:18,label:'Stocks'},
    goals:{min:0,label:'Focus',adultLabel:'Goals'}, codex:{min:10,label:'Codex'}
  };

  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clamp=(v,min=0,max=100)=>Math.max(min,Math.min(max,Number(v)||0));
  const toast=(m,t='neutral')=>{try{UI?.toast?.(m,t);}catch(_){}};
  const log=(m,t='neutral')=>{try{Engine?.log?.(m,t);}catch(_){}};
  const update=()=>{try{UI?.update?.();}catch(_){}};
  const stage=(ageOrG)=>{const age=typeof ageOrG==='number'?ageOrG:Number(ageOrG?.age||0);return STAGES.find(s=>age>=s.min&&age<=s.max)||STAGES[0];};
  const avgParentBond=(G)=>{const arr=[G?.rels?.father,G?.rels?.mother].filter(Boolean);return arr.length?Math.round(arr.reduce((a,p)=>a+(Number(p.love)||50),0)/arr.length):50;};
  const youthTalentTotal=(G)=>Object.values(G?.youthTalents||{}).reduce((a,v)=>a+(Number(v)||0),0);

  function ensure(G=window.G){
    if(!G)return null;
    G.age=Math.max(0,Math.round(Number(G.age)||0));
    const s=stage(G);
    G.lifeStage=s.key;
    G.inSchool=G.age>=5&&G.age<18&&!G.inUniversity;
    if(G.age>=5&&!Number.isFinite(G.schoolEntryAge)){
      G.schoolEntryAge=G.age;
      if(!Number.isFinite(G.schoolPerformance)||G.schoolPerformance<=0){
        G.schoolPerformance=clamp(Math.round(38+(Number(G.smarts)||50)*.18+(Number(G.happiness)||50)*.08),35,65);
      }
    }else if(!Number.isFinite(G.schoolPerformance)){
      G.schoolPerformance=G.age>=5?Math.round(((G.smarts||50)+(G.happiness||50))/2):0;
    }
    if(!G.youthTalents||typeof G.youthTalents!=='object')G.youthTalents={reading:0,sport:0,creative:0,social:0,curiosity:0};
    if(!G.ageActionUses||typeof G.ageActionUses!=='object'||G.ageActionYear!==G.age){G.ageActionUses={};G.ageActionTotal=0;G.ageActionYear=G.age;}
    if(!G.youthHealthUses||typeof G.youthHealthUses!=='object'||G.youthHealthYear!==G.age){G.youthHealthUses={};G.youthHealthYear=G.age;}
    if(!G.familyActionUses||typeof G.familyActionUses!=='object'||G.familyActionYear!==G.age){G.familyActionUses={};G.familyActionYear=G.age;}
    const goalPlanStage=G.age<=2?'infant':G.age<=5?'early':G.age<=12?'school':G.age<=17?'teen':G.age<25?'foundation':G.age<60?'adult':'senior';
    const oldLifeStage=G.goalStage;
    G.goalStage=s.key;
    if(G.goalPlanStage!==goalPlanStage){
      const oldPlan=G.goalPlanStage;
      G.goalPlanStage=goalPlanStage;
      if(typeof Goals!=='undefined'&&Goals?.ensurePersonalGoals){G.focusGoalId='';Goals.ensurePersonalGoals(G,true);}
      if(oldPlan&&G.age>0)log(`${s.icon} Your priorities changed for this chapter. Goals were rebuilt around age ${G.age}.`,'special');
    }
    if(oldLifeStage&&oldLifeStage!==s.key)log(`${s.icon} New life stage: ${s.label}. New paths are now available.`,'special');
    document.body.dataset.lifeStage=s.key;
    return s;
  }

  function actionLimit(G){
    const a=G?.age||0;
    if(a<=2)return 3;if(a<=5)return 4;if(a<=12)return 5;if(a<=17)return 6;if(a<=59)return 8;return 6;
  }
  function spendAction(G,id,perAction=2){
    ensure(G);
    const total=Number(G.ageActionTotal)||0,limit=actionLimit(G),used=Number(G.ageActionUses[id])||0;
    if(total>=limit){toast(`You used all ${limit} meaningful actions for age ${G.age}. Age up when you are ready.`,'neutral');return false;}
    if(used>=perAction){toast('You already focused on that enough this year. Try a different activity.','neutral');return false;}
    G.ageActionUses[id]=used+1;G.ageActionTotal=total+1;return true;
  }
  function apply(eff){const G=window.G;if(!G)return;Object.entries(eff||{}).forEach(([k,v])=>{if(k==='parentBond'){[G.rels?.father,G.rels?.mother].filter(Boolean).forEach(p=>p.love=clamp((p.love||50)+v));return;}if(k==='schoolPerformance'){G.schoolPerformance=clamp((G.schoolPerformance||50)+v);return;}if(k.startsWith('talent:')){const id=k.split(':')[1];G.youthTalents[id]=(G.youthTalents[id]||0)+v;return;}G[k]=(G[k]||0)+v;if(['happiness','health','smarts','looks','fitness','stress','fame','mentalHealth','reputation'].includes(k))G[k]=clamp(G[k]);if(k==='karma')G[k]=clamp(G[k],-100,100);});}

  const YOUTH_ACTIONS={
    cuddle:{icon:'🤗',name:'Family Cuddle',desc:'Feel safe and connected.',ages:[0,5],eff:{happiness:7,parentBond:5,stress:-4}},
    story:{icon:'📖',name:'Story Time',desc:'Listen, imagine and learn new words.',ages:[0,12],eff:{smarts:5,happiness:4,'talent:reading':1}},
    nap:{icon:'😴',name:'Good Sleep',desc:'Rest supports growth and mood.',ages:[0,5],eff:{health:5,happiness:3,stress:-5}},
    sensory:{icon:'🧩',name:'Explore Safely',desc:'Discover shapes, sounds and movement.',ages:[0,5],eff:{smarts:4,fitness:3,'talent:curiosity':1}},
    outside:{icon:'🌳',name:'Play Outside',desc:'Move, play and get fresh air.',ages:[3,17],eff:{health:4,fitness:5,happiness:5,stress:-4,'talent:sport':1}},
    draw:{icon:'🎨',name:'Draw & Create',desc:'Build imagination and creative confidence.',ages:[3,17],eff:{happiness:5,smarts:3,'talent:creative':1}},
    homework:{icon:'✏️',name:'Do Homework',desc:'Improve school performance without overdoing it.',ages:[6,17],eff:{smarts:5,schoolPerformance:7,stress:2,'talent:reading':1}},
    reading:{icon:'📚',name:'Read a Book',desc:'Grow knowledge and attention.',ages:[6,17],eff:{smarts:6,happiness:3,'talent:reading':2}},
    sport:{icon:'⚽',name:'Practice a Sport',desc:'Build fitness, teamwork and confidence.',ages:[6,17],eff:{fitness:7,health:3,happiness:4,'talent:sport':2}},
    friends:{icon:'🫶',name:'Spend Time with Friends',desc:'Strengthen social confidence and mood.',ages:[6,17],eff:{happiness:7,stress:-4,'talent:social':2}},
    creative:{icon:'🎸',name:'Creative Practice',desc:'Music, art or writing practice.',ages:[6,17],eff:{smarts:3,happiness:6,'talent:creative':2}},
    volunteer:{icon:'🤲',name:'Help Someone',desc:'Build character and community trust.',ages:[13,17],eff:{happiness:5,karma:4,reputation:2,'talent:social':1}},
    rest:{icon:'🌙',name:'Take a Real Break',desc:'Recover from school and social pressure.',ages:[6,17],eff:{happiness:4,mentalHealth:5,stress:-8}},
  };

  function youthAction(id){
    const G=window.G;if(!G)return;const a=YOUTH_ACTIONS[id];if(!a||G.age<a.ages[0]||G.age>a.ages[1])return toast('That activity is not right for this age.','neutral');
    if(!spendAction(G,'youth_'+id,2))return;
    if(id==='friends'&&G.age>=6){
      if(!G.rels)G.rels={};
      if(!Array.isArray(G.rels.friends))G.rels.friends=[];
      const existing=G.rels.friends.find(f=>f&&f.alive!==false&&(f.love||0)<92);
      if(existing){existing.love=clamp((existing.love||50)+8);log(`🫶 Your friendship with ${existing.name} grew stronger.`,'love');}
      else if(G.rels.friends.length<8&&typeof Engine!=='undefined'&&Engine.npc){
        const friend=Engine.npc('friend',Math.random()>.5?'female':'male');friend.age=G.age;friend.love=62;G.rels.friends.push(friend);log(`🫶 You became friends with ${friend.name}.`,'love');
      }
    }
    apply(a.eff);log(`${a.icon} ${a.name}: ${a.desc}`,'good');update();try{UI?.refreshActiveTab?.();}catch(_){}
  }

  function familyAction(id){
    const G=window.G;if(!G)return;ensure(G);const used=G.familyActionUses[id]||0;if(used>=2)return toast('You already spent meaningful time on that relationship this year.','neutral');
    G.familyActionUses[id]=used+1;
    if(id==='parents'){apply({parentBond:6,happiness:5,stress:-3});log('👪 You spent warm, focused time with your parents.','love');}
    else if(id==='sibling'){const sib=G.rels?.siblings?.[0];if(!sib)return toast('You do not have a sibling in this life.','neutral');sib.love=clamp((sib.love||50)+7);apply({happiness:5,stress:-2});log(`🧒 You made a good memory with ${sib.name}.`,'love');}
    else if(id==='talk'){apply({mentalHealth:5,happiness:3,stress:-6,parentBond:3});log('💬 You talked honestly with someone in your family.','love');}
    update();try{UI?.refreshActiveTab?.();}catch(_){}
  }

  function healthAction(id){
    const G=window.G;if(!G)return;ensure(G);const limits={checkup:1,sleep:2,meal:2,outdoor:2,talk:2};const used=G.youthHealthUses[id]||0;if(used>=(limits[id]||1))return toast('That health action has already been used enough this year.','neutral');
    G.youthHealthUses[id]=used+1;
    const defs={
      checkup:{icon:'🩺',msg:'A routine age-appropriate checkup went well.',eff:{health:6,stress:-2}},
      sleep:{icon:'😴',msg:'A consistent sleep routine improved recovery.',eff:{health:4,happiness:3,stress:-5}},
      meal:{icon:'🥗',msg:'A balanced family meal supported healthy growth.',eff:{health:4,fitness:2,happiness:2}},
      outdoor:{icon:'🌤️',msg:'Fresh air and movement supported healthy development.',eff:{health:3,fitness:5,happiness:4,stress:-4}},
      talk:{icon:'💬',msg:'Talking about feelings reduced emotional pressure.',eff:{mentalHealth:7,happiness:4,stress:-7,parentBond:2}},
    };
    const d=defs[id];if(!d)return;apply(d.eff);log(`${d.icon} ${d.msg}`,'health');update();try{UI?.refreshActiveTab?.();}catch(_){}
  }

  function schoolAction(id){
    const G=window.G;if(!G)return;
    const map={study:'homework',read:'reading',sport:'sport',create:'creative',friends:'friends',rest:'rest'};
    if(map[id])return youthAction(map[id]);
    if(G.age<16||G.age>=18)return toast('That preparation option is only available at ages 16–17.','neutral');
    if(id==='career_explore'){
      if(!spendAction(G,'career_explore',1))return;
      G.careerExploration=(G.careerExploration||0)+1;
      apply({smarts:4,happiness:3,stress:-2,reputation:1});
      log('🧭 You explored realistic education and work paths without committing too early.','good');
    }else if(id==='exam_plan'){
      if(!spendAction(G,'exam_plan',2))return;
      apply({schoolPerformance:8,smarts:4,stress:2});
      log('📝 You made a practical study plan for exams and applications.','good');
    }
    update();try{UI?.refreshActiveTab?.();}catch(_){}
  }

  function teenRomanceAction(id){
    const G=window.G;if(!G||G.age<16||G.age>=18)return toast('Teen relationship actions are available at ages 16–17.','neutral');
    ensure(G);G.rels=G.rels||{};
    let p=G.rels.partner;
    if(id==='meet'){
      if(p)return toast(`You are already dating ${p.name}.`,'neutral');
      if(!spendAction(G,'teen_romance_meet',1))return;
      const gender=G.gender==='female'?'male':'female';
      p=typeof Engine?.npc==='function'?Engine.npc('partner',gender):{id:Math.random().toString(36).slice(2),name:gender==='female'?'Emma':'Adam',surname:G.surname,gender};
      p.age=Math.max(16,Math.min(17,G.age+(Math.random()<.5?-1:1)));p.love=34;p.chemistry=55;p.intimacy=5;p.stage='talking';p.dates=0;p.yearsTogether=0;p.married=false;p.engaged=false;
      G.rels.partner=p;apply({happiness:7,stress:-2});log(`💘 You started talking with ${p.name}. It is a normal teen relationship, not an adult commitment.`,'love');
    }else{
      if(!p)return toast('Meet someone first.','neutral');
      if(!spendAction(G,'teen_romance_'+id,2))return;
      if(id==='date'){
        p.dates=(p.dates||0)+1;p.love=clamp((p.love||35)+8);p.chemistry=clamp((p.chemistry||50)+4);p.stage='dating';apply({happiness:7,stress:-3});log(`🎬 You and ${p.name} had a simple age-appropriate date.`,'love');
      }else if(id==='talk'){
        p.love=clamp((p.love||35)+6);apply({happiness:4,stress:-5});log(`💬 You and ${p.name} talked honestly and built trust.`,'love');
      }else if(id==='space'){
        apply({stress:-6,happiness:2});log('🌿 You kept healthy boundaries and made time for school, friends and yourself.','good');
      }
    }
    update();try{UI?.refreshActiveTab?.();}catch(_){}
  }

  function teenGig(id){
    const G=window.G;if(!G||G.age<13||G.age>=18)return toast('Teen gigs are available from age 13 to 17.','neutral');
    const gigs=typeof HUSTLE_GIGS!=='undefined'?HUSTLE_GIGS:[];
    const gig=gigs.find(g=>g.id===id&&g.minAge<=G.age&&g.minAge<18&&(!g.need||g.need(G)));
    if(!gig)return toast('That gig is not available for your age or current abilities.','neutral');
    if(!spendAction(G,'teen_paid_work',1))return;
    try{Hustle.doGig(id);}catch(e){console.warn(e);toast('The gig could not be completed.','bad');}
  }

  function socialAction(id){
    const G=window.G;if(!G||G.age<13||G.age>=18)return toast('Teen creator practice is available from age 13 to 17.','neutral');
    ensure(G);try{Social?.ensure?.();}catch(_){}
    if(!G.social||typeof G.social!=='object')G.social={};
    if(!spendAction(G,'teen_social_'+id,id==='post'?2:2))return;
    const S=G.social;S.contentSkill=Number.isFinite(S.contentSkill)?S.contentSkill:35;S.audienceQuality=Number.isFinite(S.audienceQuality)?S.audienceQuality:45;S.reputation=Number.isFinite(S.reputation)?S.reputation:60;S.burnout=Number.isFinite(S.burnout)?S.burnout:0;S.consistency=Number.isFinite(S.consistency)?S.consistency:45;
    if(id==='post'){
      const gain=Math.round(35+Math.random()*95+(G.youthTalents?.creative||0)*4+(G.youthTalents?.social||0)*3);
      G.followers=Math.max(0,(G.followers||0)+gain);S.contentSkill=clamp(S.contentSkill+3);S.consistency=clamp(S.consistency+4);S.burnout=clamp(S.burnout+4);apply({happiness:4,stress:1,'talent:creative':1});log(`📱 You made a safe creative post and gained ${gain} followers. No monetization was attached to a minor account.`,'good');
    }else if(id==='learn'){
      S.contentSkill=clamp(S.contentSkill+6);S.audienceQuality=clamp(S.audienceQuality+3);apply({smarts:3,stress:1,'talent:creative':1});log('🎬 You practiced editing, storytelling and online safety.','good');
    }else if(id==='community'){
      S.audienceQuality=clamp(S.audienceQuality+6);S.reputation=clamp(S.reputation+4);apply({happiness:4,stress:-2,'talent:social':1});log('💬 You replied kindly, protected your privacy and built a healthier community.','good');
    }else if(id==='break'){
      S.burnout=clamp(S.burnout-12);S.consistency=clamp(S.consistency-2);apply({happiness:3,stress:-7,mentalHealth:4});log('🌿 You stepped away from social media and protected your wellbeing.','good');
    }
    update();try{UI?.refreshActiveTab?.();}catch(_){}
  }

  function talentAction(id){
    const map={reading:'reading',sport:'sport',creative:'creative',social:'friends',curiosity:'story'};
    youthAction(map[id]||'reading');
  }

  function teenSkillAction(id){
    const G=window.G;if(!G||G.age<13||G.age>=18)return toast('Starter skill tracks are available from age 13 to 17.','neutral');
    ensure(G);if(!G.skills||typeof G.skills!=='object')G.skills={};
    const defs={coding:['💻','Coding',{smarts:4,stress:1}],finance:['📊','Finance',{smarts:4,reputation:1}],public_sp:['🎤','Public Speaking',{happiness:3,reputation:3,stress:1}],music:['🎵','Music',{happiness:5,stress:-3}],fitness:['🏋️','Fitness',{fitness:5,health:3,happiness:2}]};
    const d=defs[id];if(!d)return;
    const level=Number(G.skills[id])||0;if(level>=2)return toast('Teen starter tracks cap at level 2. Adult mastery unlocks at 18.','neutral');
    if(!spendAction(G,'teen_skill_'+id,2))return;
    G.skills[id]=level+1;apply(d[2]);log(`${d[0]} ${d[1]} advanced to starter level ${G.skills[id]}.`,'good');update();try{UI?.refreshActiveTab?.();}catch(_){}
  }

  function familyPetAction(id){
    const G=window.G;if(!G||G.age<6||G.age>=18)return toast('Family pet actions are only for school-age children and teens.','neutral');
    ensure(G);if(!Array.isArray(G.pets))G.pets=[];
    const alive=G.pets.filter(p=>p&&p.alive!==false);
    const pet=alive[0];
    if(id.startsWith('adopt_')){
      if(alive.length>=2)return toast('Your family can care for at most two pets while you are a child.','neutral');
      if(Number.isFinite(G.lastFamilyPetAdoptionAge)&&G.age-G.lastFamilyPetAdoptionAge<3)return toast('Your family needs more time before considering another pet.','neutral');
      if(!spendAction(G,'family_pet_adopt',1))return;
      const defs={dog:['🐶','Dog',120,12],cat:['🐱','Cat',65,8],rabbit:['🐰','Rabbit',35,6],fish:['🐟','Fish',12,3]};
      const type=id.slice(6),d=defs[type];if(!d)return;
      const names=['Buddy','Luna','Milo','Daisy','Coco','Max','Nala','Charlie'];
      const name=names[Math.floor(Math.random()*names.length)];
      G.pets.push({id:Math.random().toString(36).slice(2),type:d[1],icon:d[0],typeId:type,name,age:0,happiness:82,health:88,bond:55,energy:75,alive:true,upkeep:d[2],happBonus:d[3],lastVetAge:null,memorial:'',careYears:0,neglectYears:0,lastCareAge:G.age});
      G.lastFamilyPetAdoptionAge=G.age;apply({happiness:10,parentBond:2});log(`${d[0]} Your family welcomed ${name} the ${d[1].toLowerCase()}. Adults cover the costs while you help with care.`,'special');
    }else{
      if(!pet)return toast('Your family does not have a pet yet.','neutral');
      if(!spendAction(G,'family_pet_'+id,2))return;
      if(id==='play'){pet.happiness=clamp((pet.happiness||70)+10);pet.bond=clamp((pet.bond||50)+8);apply({happiness:5,stress:-4});log(`🎾 You played with ${pet.name} and strengthened your bond.`,'good');}
      else if(id==='care'){pet.health=clamp((pet.health||70)+7);pet.happiness=clamp((pet.happiness||70)+5);pet.bond=clamp((pet.bond||50)+5);pet.lastCareAge=G.age;apply({karma:2,happiness:3});log(`🥣 You helped care for ${pet.name}.`,'good');}
      else if(id==='walk'){if(pet.typeId==='fish')return toast('A fish cannot go for a walk. Choose care or play instead.','neutral');pet.energy=clamp((pet.energy||60)-8);pet.happiness=clamp((pet.happiness||70)+8);pet.bond=clamp((pet.bond||50)+6);pet.lastCareAge=G.age;apply({fitness:4,health:2,happiness:4,stress:-4});log(`🦮 You spent active time outside with ${pet.name}.`,'good');}
    }
    update();try{UI?.refreshActiveTab?.();}catch(_){}
  }

  function stageHeader(G,title,copy){const s=stage(G);const remain=Math.max(0,actionLimit(G)-(G.ageActionTotal||0));return `<section class="age-stage-hero"><div class="age-stage-icon">${s.icon}</div><div><div class="age-kicker">Age ${G.age} · ${esc(s.label)}</div><h2>${esc(title||s.focus)}</h2><p>${esc(copy||s.focus)}</p></div><div class="age-action-counter"><b>${remain}</b><span>actions left</span></div></section>`;}
  function cards(actions,handler){return `<div class="age-card-grid">${actions.map(a=>`<button type="button" class="age-action-card" onclick="${handler}('${a.id}')"><span>${a.icon}</span><b>${esc(a.name)}</b><small>${esc(a.desc)}</small></button>`).join('')}</div>`;}

  function renderYouthActivities(){
    const G=window.G,el=document.getElementById('tab-mind');if(!G||!el)return;ensure(G);
    const available=Object.entries(YOUTH_ACTIONS).filter(([,a])=>G.age>=a.ages[0]&&G.age<=a.ages[1]).map(([id,a])=>({id,...a}));
    el.innerHTML=stageHeader(G,G.age<6?'Play, bond and develop':'Healthy activities for this stage','Choose a few meaningful activities each year. Youth actions are family-supported and never charge a baby or child personal money.')+cards(available,'AgeLogic.youthAction')+`<section class="age-note"><b>Why actions are limited</b><p>Spamming one activity cannot instantly create a genius or athlete. Progress now comes from balanced choices across many years.</p></section>`;
  }
  function renderFamily(){
    const G=window.G,el=document.getElementById('tab-love');if(!G||!el)return;ensure(G);const father=G.rels?.father,mother=G.rels?.mother,sib=G.rels?.siblings?.[0],partner=G.rels?.partner;
    const people=[father&&{icon:'👨',name:father.name,role:'Father',bond:father.love||50},mother&&{icon:'👩',name:mother.name,role:'Mother',bond:mother.love||50},sib&&{icon:'🧒',name:sib.name,role:'Sibling',bond:sib.love||50}].filter(Boolean);
    let html=stageHeader(G,G.age<16?'Family & close relationships':'Family, trust & first relationships',G.age<13?'At this age, love means safety, trust, parents, siblings and friends — not adult romance.':G.age<16?'Family remains your foundation while independence grows.':'At 16–17, dating can begin, but marriage, pregnancy and adult private actions stay locked until 18.');
    html+=`<div class="age-people-grid">${people.map(p=>`<article class="age-person-card"><span>${p.icon}</span><div><b>${esc(p.name)}</b><small>${esc(p.role)}</small><div class="age-mini-bar"><i style="width:${clamp(p.bond)}%"></i></div><em>${Math.round(p.bond)}% bond</em></div></article>`).join('')}</div>`;
    html+=cards([{id:'parents',icon:'👪',name:'Family Time',desc:'Strengthen safety, trust and happiness.'},...(sib?[{id:'sibling',icon:'🧒',name:'Sibling Time',desc:`Make a positive memory with ${sib.name}.`}]:[]),{id:'talk',icon:'💬',name:'Talk Honestly',desc:'Share feelings and reduce stress.'}],'AgeLogic.familyAction');
    if(G.age>=16){
      html+=`<div class="sec">💞 Teen relationships</div>`;
      if(partner){html+=`<article class="age-teen-partner"><span>${partner.gender==='female'?'👩‍🎓':'🧑‍🎓'}</span><div><b>${esc(partner.name)}</b><small>${esc(partner.stage==='dating'?'Dating':'Talking')} · age ${Math.round(partner.age||G.age)}</small><div class="age-mini-bar"><i style="width:${clamp(partner.love||35)}%"></i></div><em>${Math.round(partner.love||35)}% trust and connection</em></div></article>`;}
      html+=cards(partner?[{id:'date',icon:'🎬',name:'Simple Date',desc:'An age-appropriate date with no adult commitment.'},{id:'talk',icon:'💬',name:'Talk & Listen',desc:'Build trust through honest conversation.'},{id:'space',icon:'🌿',name:'Keep Balance',desc:'Protect school, friends and personal boundaries.'}]:[{id:'meet',icon:'💘',name:'Meet a Crush',desc:'Start a normal teen relationship slowly.'}],'AgeLogic.teenRomanceAction');
      html+=`<section class="age-lock-roadmap"><span>💍 Marriage unlocks at age 18</span><span>👶 Parenthood and private adult actions unlock at age 18</span></section>`;
    }else html+=`<section class="age-lock-roadmap"><span>💞 Teen romance unlocks at age 16</span><span>💍 Adult commitments unlock at age 18</span></section>`;
    el.innerHTML=html;
  }

  function renderYouthHealth(){
    const G=window.G,el=document.getElementById('tab-health');if(!G||!el)return;ensure(G);const risk=(G.health||0)>=75?'Strong':(G.health||0)>=50?'Stable':'Needs attention';
    el.innerHTML=stageHeader(G,'Age-appropriate health',G.age<13?'Pediatric health focuses on sleep, nutrition, movement, emotional safety and routine checkups.':'Teen health focuses on recovery, nutrition, exercise, stress and honest support.')+`<div class="age-metric-grid"><div><span>Health</span><b>${Math.round(G.health||0)}%</b><small>${risk}</small></div><div><span>Fitness</span><b>${Math.round(G.fitness||0)}%</b><small>Growing body</small></div><div><span>Mental wellbeing</span><b>${Math.round(G.mentalHealth||60)}%</b><small>Stress ${Math.round(G.stress||0)}%</small></div><div><span>Family support</span><b>${avgParentBond(G)}%</b><small>Parent bond</small></div></div>`+cards([
      {id:'checkup',icon:'🩺',name:'Routine Checkup',desc:'One preventive checkup per year.'},
      {id:'sleep',icon:'😴',name:'Sleep Routine',desc:'Improve recovery, mood and health.'},
      {id:'meal',icon:'🥗',name:'Balanced Meals',desc:'Family-supported nutrition, no child bill.'},
      {id:'outdoor',icon:'🌤️',name:'Outdoor Movement',desc:'Build fitness through age-safe activity.'},
      {id:'talk',icon:'💬',name:'Talk About Feelings',desc:'Protect mental wellbeing and reduce stress.'},
    ],'AgeLogic.healthAction')+`<section class="age-note"><b>No adult medical clutter</b><p>Insurance, surgery pricing, sexual health, supplements and household food bills stay hidden until they are actually relevant.</p></section>`;
  }
  function renderSchool(){
    const G=window.G,el=document.getElementById('tab-career');if(!G||!el)return;ensure(G);const next=G.age<6?'School begins around age 5–6':G.age<13?'Build foundations before secondary school':G.age<16?'Prepare for exams and future paths':'Prepare for adulthood without pretending you already have a full career';
    const base=G.age<5?'':cards([{id:'study',icon:'✏️',name:'Do Homework',desc:'Improve school performance and smarts.'},{id:'read',icon:'📚',name:'Read More',desc:'Build attention and knowledge.'},{id:'sport',icon:'⚽',name:'School Sport',desc:'Fitness, teamwork and confidence.'},{id:'create',icon:'🎨',name:'Creative Club',desc:'Develop music, art or writing.'},{id:'friends',icon:'🫶',name:'See Friends',desc:'Build healthy social confidence.'},{id:'rest',icon:'🌙',name:'Recover',desc:'Reduce stress and avoid burnout.'}],'AgeLogic.schoolAction');
    const older=G.age>=16?`<div class="sec">🧭 Next-step preparation</div>${cards([{id:'exam_plan',icon:'📝',name:'Plan Exams & Applications',desc:'Improve school performance with a realistic plan.'},{id:'career_explore',icon:'🧭',name:'Explore Paths',desc:'Compare work, vocational and university options.'}],'AgeLogic.schoolAction')}<section class="age-note"><b>Part-time work has its own Teen Gigs tab</b><p>Full-time careers, university enrollment, loans and professional promotions unlock at 18.</p></section>`:'';
    el.innerHTML=stageHeader(G,G.age<5?'Childhood before school':G.age<16?'School & development':'School & adult preparation',next)+`<div class="age-metric-grid"><div><span>School performance</span><b>${Math.round(G.schoolPerformance||0)}%</b><small>${G.age<5?'Not enrolled yet':'Current progress'}</small></div><div><span>Smarts</span><b>${Math.round(G.smarts||0)}%</b><small>Learning capacity</small></div><div><span>Reading talent</span><b>${G.youthTalents?.reading||0}</b><small>Practice points</small></div><div><span>Social talent</span><b>${G.youthTalents?.social||0}</b><small>Friendship practice</small></div></div>${G.age<5?`<section class="age-lock-panel"><div>🎒</div><h3>School has not started yet</h3><p>Use Activities and Family to develop safely. There is no career pressure during infancy.</p><b>Unlocks at age 5</b></section>`:base}${older}<section class="age-lock-roadmap"><span>💼 Full careers unlock at age 18</span><span>🎓 University and adult finance unlock at age 18</span></section>`;
  }

  function renderYouthHustle(){
    const G=window.G,el=document.getElementById('tab-hustle');if(!G||!el)return;ensure(G);
    const gigs=(typeof HUSTLE_GIGS!=='undefined'?HUSTLE_GIGS:[]).filter(g=>g.minAge<=G.age&&g.minAge<18&&(!g.need||g.need(G)));
    const cardsHtml=gigs.length?`<div class="age-card-grid">${gigs.map(g=>`<button type="button" class="age-action-card" onclick="AgeLogic.teenGig('${g.id}')"><span>${g.icon}</span><b>${esc(g.name)}</b><small>${esc(g.desc)}</small></button>`).join('')}</div>`:`<section class="age-lock-panel"><div>🧰</div><h3>No suitable gig yet</h3><p>Build school, fitness or talent foundations first.</p><b>More options unlock as you grow</b></section>`;
    el.innerHTML=stageHeader(G,'Teen gigs & responsibility','One small paid gig per year can build confidence and personal savings. Adult ventures, agencies and high-risk work stay completely hidden until 18.')+cardsHtml+`<section class="age-note"><b>Teen money is personal savings</b><p>You are not charged adult rent, insurance, food bills, loans or business costs before age 18.</p></section>`;
  }

  function renderYouthSocial(){
    const G=window.G,el=document.getElementById('tab-social');if(!G||!el)return;ensure(G);try{Social?.ensure?.();}catch(_){}
    const S=G.social||{};const followers=Math.max(0,Math.round(G.followers||0));
    el.innerHTML=stageHeader(G,'Teen creator practice','Create safely, learn real media skills and protect your privacy. Brand deals, managers, paid memberships and business spending stay locked until adulthood.')+`<div class="age-metric-grid"><div><span>Followers</span><b>${followers.toLocaleString()}</b><small>Audience, not income</small></div><div><span>Creator skill</span><b>${Math.round(S.contentSkill||35)}%</b><small>Editing & storytelling</small></div><div><span>Community quality</span><b>${Math.round(S.audienceQuality||45)}%</b><small>Healthy engagement</small></div><div><span>Burnout</span><b>${Math.round(S.burnout||0)}%</b><small>Protect your wellbeing</small></div></div>`+cards([
      {id:'post',icon:'📱',name:'Make a Safe Post',desc:'Practice creativity and grow a small audience.'},
      {id:'learn',icon:'🎬',name:'Learn Editing',desc:'Improve storytelling, editing and media literacy.'},
      {id:'community',icon:'💬',name:'Build Community',desc:'Reply kindly without sharing private information.'},
      {id:'break',icon:'🌿',name:'Take a Screen Break',desc:'Lower burnout and protect mental wellbeing.'},
    ],'AgeLogic.socialAction')+`<section class="age-note"><b>No adult creator economy before 18</b><p>Teen accounts do not receive sponsorships, hire managers, sell products or pay production bills. At age 18, the full Creator system unlocks and the audience you built remains.</p></section>`;
  }

  function renderYouthSkills(){
    const G=window.G,el=document.getElementById('tab-skills');if(!G||!el)return;ensure(G);
    const broad=[['reading','📚','Reading'],['sport','⚽','Sport'],['creative','🎨','Creativity'],['social','🫶','Social confidence'],['curiosity','🧩','Curiosity']];
    const broadHtml=`<div class="age-talent-list">${broad.map(([id,icon,name])=>`<article><span>${icon}</span><div><b>${name}</b><div class="age-mini-bar"><i style="width:${Math.min(100,(G.youthTalents?.[id]||0)*8)}%"></i></div><small>${G.youthTalents?.[id]||0} practice points</small></div><button type="button" onclick="AgeLogic.talentAction('${id}')">Practice</button></article>`).join('')}</div>`;
    if(G.age<13){el.innerHTML=stageHeader(G,'Talents grow over years','Children build broad foundations before choosing specialist paths.')+broadHtml+`<section class="age-note"><b>Starter skill tracks unlock at 13</b><p>Coding, finance, speaking, music and fitness become structured teen paths before the full adult skill system opens at 18.</p></section>`;return;}
    const tracks=[['coding','💻','Coding'],['finance','📊','Finance'],['public_sp','🎤','Public Speaking'],['music','🎵','Music'],['fitness','🏋️','Fitness']];
    const tracksHtml=`<div class="sec">🎓 Starter skill tracks</div><div class="age-talent-list">${tracks.map(([id,icon,name])=>{const lv=G.skills?.[id]||0;return`<article><span>${icon}</span><div><b>${name}</b><div class="age-mini-bar"><i style="width:${Math.min(100,lv*50)}%"></i></div><small>Starter level ${lv}/2</small></div><button type="button" ${lv>=2?'disabled':''} onclick="AgeLogic.teenSkillAction('${id}')">${lv>=2?'Ready for adulthood':'Train'}</button></article>`;}).join('')}</div>`;
    el.innerHTML=stageHeader(G,'Build capability before independence','Teen skill tracks are family-supported, limited, and designed to prepare for adult education or work—not to sell instant mastery.')+tracksHtml+`<details class="age-broad-talents"><summary>View broad childhood talents</summary>${broadHtml}</details><section class="age-note"><b>Full skill system unlocks at 18</b><p>Advanced levels, professional training costs and mastery paths begin with adult independence.</p></section>`;
  }
  function renderYouthPets(){
    const G=window.G,el=document.getElementById('tab-pets');if(!G||!el)return;ensure(G);if(!Array.isArray(G.pets))G.pets=[];
    const alive=G.pets.filter(p=>p&&p.alive!==false);
    const petCards=alive.length?`<div class="age-people-grid">${alive.map(p=>`<article class="age-person-card"><span>${esc(p.icon||'🐾')}</span><div><b>${esc(p.name||p.type)}</b><small>${esc(p.type||'Family pet')} · age ${Math.max(0,Math.round(p.age||0))}</small><div class="age-mini-bar"><i style="width:${clamp(p.bond||50)}%"></i></div><em>${Math.round(p.bond||50)}% bond · ${Math.round(p.health||70)}% health</em></div></article>`).join('')}</div>`:'';
    const adopt=alive.length<2?cards([
      {id:'adopt_dog',icon:'🐶',name:'Ask for a Dog',desc:'A family decision; adults cover the cost.'},
      {id:'adopt_cat',icon:'🐱',name:'Ask for a Cat',desc:'A family decision; adults cover the cost.'},
      {id:'adopt_rabbit',icon:'🐰',name:'Ask for a Rabbit',desc:'A smaller family pet.'},
      {id:'adopt_fish',icon:'🐟',name:'Ask for Fish',desc:'A calm beginner family pet.'},
    ],'AgeLogic.familyPetAction'):'';
    const care=alive.length?cards([
      {id:'play',icon:'🎾',name:'Play Together',desc:'Improve happiness and bond.'},
      {id:'care',icon:'🥣',name:'Help with Care',desc:'Build responsibility without paying adult bills.'},
      {id:'walk',icon:'🦮',name:'Active Pet Time',desc:'Movement, bonding and stress relief.'},
    ],'AgeLogic.familyPetAction'):'';
    el.innerHTML=stageHeader(G,'Family pets & responsibility','Children can bond with and help care for family pets, but they are never charged adoption fees or yearly upkeep.')+petCards+care+adopt+`<section class="age-note"><b>Adult pet ownership unlocks at 18</b><p>At adulthood, adoption prices, housing limits, vet bills and upkeep become your responsibility.</p></section>`;
  }

  function renderLocked(name){
    const G=window.G,el=document.getElementById('tab-'+name),r=TAB_RULES[name];if(!G||!el||!r)return;const years=Math.max(0,r.min-G.age);el.innerHTML=`<section class="age-lock-panel"><div>🔒</div><div class="age-kicker">Age ${G.age} · ${esc(stage(G).label)}</div><h2>${esc(r.adultLabel||r.label)} unlocks at age ${r.min}</h2><p>This path is hidden because it would not make sense for the current life stage.</p><b>${years} year${years===1?'':'s'} until unlock</b><button type="button" onclick="UI.tab('life')">Back to Life</button></section>`;
  }
  function specialRender(name){
    const G=window.G;if(!G)return false;ensure(G);const rule=TAB_RULES[name];if(rule&&G.age<rule.min){renderLocked(name);return true;}
    if(name==='mind'&&G.age<18){renderYouthActivities();return true;}
    if(name==='love'&&G.age<18){renderFamily();return true;}
    if(name==='health'&&G.age<18){renderYouthHealth();return true;}
    if(name==='career'&&G.age<18){renderSchool();return true;}
    if(name==='skills'&&G.age<18){renderYouthSkills();return true;}
    if(name==='pets'&&G.age<18){renderYouthPets();return true;}
    if(name==='hustle'&&G.age<18){renderYouthHustle();return true;}
    if(name==='social'&&G.age<18){renderYouthSocial();return true;}
    return false;
  }

  function upcoming(G){return Object.entries(TAB_RULES).filter(([,r])=>r.min>G.age).sort((a,b)=>a[1].min-b[1].min).slice(0,4);}
  function injectLifeStage(){
    const G=window.G,tab=document.getElementById('tab-life');if(!G||!tab||!tab.classList.contains('active'))return;ensure(G);
    let el=tab.querySelector('.age-life-stage');if(el)el.remove();const s=stage(G),left=Math.max(0,actionLimit(G)-(G.ageActionTotal||0));
    el=document.createElement('section');el.className='age-life-stage';el.innerHTML=`<div class="age-life-stage-main"><span>${s.icon}</span><div><div class="age-kicker">Current chapter</div><h2>${esc(s.label)}</h2><p>${esc(s.focus)}</p></div><div class="age-action-counter"><b>${left}</b><span>actions left</span></div></div><div class="age-upcoming">${upcoming(G).map(([id,r])=>`<span>${esc(r.label)} <b>age ${r.min}</b></span>`).join('')||'<span>All core life paths are unlocked</span>'}</div>`;
    const anchor=tab.querySelector('.goal-ui-quests,.life-view-shell,.v23-command-center')||tab.firstElementChild;anchor?.insertAdjacentElement('beforebegin',el);
  }

  function cleanupYouthShell(name){
    const G=window.G;if(!G||G.age>=18)return;
    const youthTabs=new Set(['mind','love','career','health','social','hustle','pets','skills']);if(!youthTabs.has(name))return;
    const el=document.getElementById('tab-'+name);if(!el)return;
    [...el.children].forEach(child=>{const cls=String(child.className||'');if(cls.includes('release-polish-panel')||cls.includes('release-plan-')||cls.includes('legacy-ui-family-clarity')||cls.includes('legacy-ui-subhub'))child.remove();});
  }

  function applyNavigation(){
    const G=window.G;if(!G)return;ensure(G);
    const app=document.getElementById('app');if(app){app.dataset.ageGroup=G.age<18?'minor':'adult';app.dataset.lifeStage=G.lifeStage||stage(G).key;}
    document.querySelectorAll('.nt[data-tab]').forEach(btn=>{
      const name=btn.dataset.tab,r=TAB_RULES[name];if(!r)return;
      const locked=G.age<r.min;btn.classList.toggle('age-tab-locked',locked);btn.hidden=locked;
      const label=btn.querySelector('.nl');if(label){
        const cleanLabels={
          life:'Life',health:'Health',mind:'Activities',assets:'Money',
          love:G.age<13?'Family':G.age<18?'People':'Relationships',
          career:G.age<18?'School':G.age>=65?'Retirement':'Career',
          goals:G.age<18?'Focus':'Goals',skills:G.age<18?'Talents':'Skills',
          social:G.age<18?'Create':'Social',hustle:G.age<18?'Gigs':'Side Hustles',
          pets:'Pets',business:'Business',stocks:'Investing',crime:'Crime',codex:'Memories'
        };
        label.textContent=cleanLabels[name]||r.adultLabel||r.label;
      }
      btn.setAttribute('aria-disabled',locked?'true':'false');btn.title=locked?`Unlocks at age ${r.min}`:'';
    });
    document.querySelectorAll('.quick-rail-btn[data-qtab]').forEach(btn=>{const r=TAB_RULES[btn.dataset.qtab];if(r)btn.hidden=G.age<r.min;});
  }

  function applyHeader(){
    const G=window.G;if(!G)return;
    const format=(v)=>{try{return typeof fmt==='function'?fmt(Math.round(v||0)):`$${Math.round(v||0).toLocaleString()}`;}catch(_){return String(Math.round(v||0));}};
    const under13=G.age<13,minor=G.age<18;
    const deskBox=document.querySelector('.sidebar-money-box');
    const deskHead=deskBox?.querySelector('.sidebar-card-head');
    const mobBlock=document.querySelector('.money-block');
    const mobHead=mobBlock?.querySelector('.money-lbl');
    const dVal=document.getElementById('g-money'),mVal=document.getElementById('g-money-m');
    const dCtx=document.getElementById('g-money-ctx'),mCtx=document.getElementById('g-money-ctx-m');
    const dCash=document.getElementById('g-cash'),mCash=document.getElementById('g-cash-m');
    const dIncome=document.getElementById('g-income'),mIncome=document.getElementById('g-income-m');
    if(under13){
      if(deskHead)deskHead.textContent='Family Future Fund';if(mobHead)mobHead.textContent='Family Fund';
      if(dVal)dVal.textContent=format(G.familySupport||0);if(mVal)mVal.textContent=format(G.familySupport||0);
      if(dCtx)dCtx.textContent='Family-managed · available in adulthood';if(mCtx)mCtx.textContent='Family-managed · available in adulthood';
      if(dCash)dCash.textContent=`Personal cash: ${format(G.money||0)}`;if(mCash)mCash.textContent=`Personal cash: ${format(G.money||0)}`;
      if(dIncome)dIncome.textContent='';if(mIncome)mIncome.textContent='';if(mobBlock)mobBlock.title='Family-managed money reserved for adulthood';
    }else if(minor){
      if(deskHead)deskHead.textContent='Youth Savings';if(mobHead)mobHead.textContent='Savings';
      if(dVal)dVal.textContent=format(G.money||0);if(mVal)mVal.textContent=format(G.money||0);
      if(dCtx)dCtx.textContent=`Future fund: ${format(G.familySupport||0)}`;if(mCtx)mCtx.textContent=`Future fund: ${format(G.familySupport||0)}`;
      if(dCash)dCash.textContent='Adult net worth begins at 18';if(mCash)mCash.textContent='Adult net worth begins at 18';if(mobBlock)mobBlock.title='Personal savings; adult net worth begins at 18';
    }else{
      if(deskHead)deskHead.textContent='Net Worth';if(mobHead)mobHead.textContent='Net Worth';if(mobBlock)mobBlock.title='';
    }
    ['lks','fam','kar','rep'].forEach(key=>{
      document.getElementById('sv-'+key)?.closest('.ssb')?.classList.toggle('age-stat-hidden',under13);
      document.getElementById('sv-'+key+'-m')?.closest('.sb')?.classList.toggle('age-stat-hidden',under13);
    });
    const statLabels=under13?{smt:'🧠 Learning',fit:'⚡ Movement',str:'😟 Distress',mnd:'🌿 Wellbeing'}:{smt:'🧠 Smarts',fit:'⚡ Fitness',str:'😤 Stress',mnd:'🧠 Mind'};
    Object.entries(statLabels).forEach(([key,label])=>{
      const desktop=document.getElementById('sv-'+key)?.closest('.ssb')?.querySelector('.ssb-l');
      if(desktop)desktop.textContent=label;
      const mobile=document.getElementById('sv-'+key+'-m')?.closest('.sb');
      if(mobile){mobile.title=label.replace(/^\S+\s*/, '');mobile.setAttribute('aria-label',`${label.replace(/^\S+\s*/, '')}: ${document.getElementById('sv-'+key+'-m')?.textContent||0}`);}
    });
    deskBox?.classList.toggle('age-youth-money',minor);mobBlock?.classList.toggle('age-youth-money',minor);
  }

  function patch(){
    if(typeof UI!=='undefined'){
      if(UI.update&&!UI.update.__ageLogic){
        const old=UI.update;const wrapped=function(...args){ensure(window.G);const out=old.apply(this,args);applyNavigation();applyHeader();cleanupYouthShell(this._activeTab);requestAnimationFrame(()=>{injectLifeStage();applyNavigation();applyHeader();cleanupYouthShell(this._activeTab);});return out;};wrapped.__ageLogic=true;UI.update=wrapped;
      }
      if(UI._renderTab&&!UI._renderTab.__ageLogic){
        const old=UI._renderTab;const wrapped=function(name,...args){if(specialRender(name)){cleanupYouthShell(name);requestAnimationFrame(()=>cleanupYouthShell(name));applyNavigation();applyHeader();return;}const out=old.call(this,name,...args);requestAnimationFrame(()=>{if(name==='life')injectLifeStage();cleanupYouthShell(name);applyNavigation();applyHeader();});return out;};wrapped.__ageLogic=true;UI._renderTab=wrapped;
      }
      if(UI.tab&&!UI.tab.__ageLogic){
        const old=UI.tab;const wrapped=function(name,...args){const G=window.G,r=TAB_RULES[name];const target=G&&r&&G.age<r.min?'life':name;if(target!==name)toast(`${r.label} unlocks at age ${r.min}.`,'neutral');const out=old.call(this,target,...args);cleanupYouthShell(target);requestAnimationFrame(()=>cleanupYouthShell(target));setTimeout(()=>cleanupYouthShell(target),30);return out;};wrapped.__ageLogic=true;UI.tab=wrapped;
      }
    }
    if(typeof Engine!=='undefined'){
      if(Engine.act&&!Engine.act.__ageLogic){
        const old=Engine.act;const wrapped=function(id,...args){const G=window.G;if(!G)return;const under18=G.age<18;const youthAllowed=['study','library','meditate','gym','run','swim','yoga','hike','nature','sports','sleep','movie','gaming','reading','museum','journal','music_play','paint','pet_visit','sunrise_watch','mindful_walk','social_media_break'];if(under18){if(!youthAllowed.includes(id))return toast('That adult action is not available at this age. Use the age-appropriate Activities screen.','neutral');return toast('Use the age-appropriate Activities screen so youth progress stays balanced and free of adult costs.','neutral');}const def=Engine._actionDefs?.()?.[id];if(!def||G.inPrison)return old.call(this,id,...args);const cost=typeof sc==='function'?sc(def.cost||0):(def.cost||0);if(cost>0&&(G.money||0)<cost)return old.call(this,id,...args);if(!spendAction(G,'adult_'+id,2))return;return old.call(this,id,...args);};wrapped.__ageLogic=true;Engine.act=wrapped;
      }
      if(Engine.ageUp&&!Engine.ageUp.__ageLogic){
        const old=Engine.ageUp;const wrapped=function(...args){const before=window.G?.age;const out=old.apply(this,args);setTimeout(()=>{if(window.G&&window.G.age!==before){ensure(window.G);applyNavigation();applyHeader();try{UI?.refreshActiveTab?.();UI?.update?.();}catch(_){}}},0);return out;};wrapped.__ageLogic=true;Engine.ageUp=wrapped;
      }
    }
    try{
      if(window.LifeSimV23?.UI&&!LifeSimV23.UI.__ageLogic){
        LifeSimV23.UI.__ageLogic=true;
        LifeSimV23.UI.avatar=function(G){const a=G?.age||0;if(a<3)return'👶';if(a<13)return G.gender==='female'?'👧':'👦';if(a<18)return G.gender==='female'?'👩‍🎓':'🧑‍🎓';if(a>64)return G.gender==='female'?'👵':'👴';if((G.health||0)<25)return'😷';if((G.happiness||0)>85)return'😁';return G.gender==='female'?'👩':'👨';};
        const oldRisk=LifeSimV23.UI.mainRisk?.bind(LifeSimV23.UI);LifeSimV23.UI.mainRisk=function(G){if((G?.age||0)<3)return'healthy early development';if((G?.age||0)<6)return'confidence and family safety';if((G?.age||0)<13)return'school balance';if((G?.age||0)<18)return'stress and direction';return oldRisk?oldRisk(G):'complacency';};
        const oldMotto=LifeSimV23.UI.lifeMotto?.bind(LifeSimV23.UI);LifeSimV23.UI.lifeMotto=function(G){if((G?.age||0)<6)return'Every safe moment helps a child grow.';if((G?.age||0)<13)return'Curiosity turns small years into big foundations.';if((G?.age||0)<18)return'Growing up means learning what matters.';return oldMotto?oldMotto(G):'Every year writes a sentence I cannot erase.';};
      }
    }catch(_){ }
    if(window.G){ensure(window.G);applyNavigation();applyHeader();}
  }

  window.AgeLogic={STAGES,TAB_RULES,stage,ensure,actionLimit,youthAction,familyAction,healthAction,schoolAction,teenRomanceAction,teenGig,socialAction,talentAction,teenSkillAction,familyPetAction,renderYouthActivities,renderFamily,renderYouthHealth,renderSchool,renderYouthHustle,renderYouthSocial,renderYouthSkills,renderYouthPets,renderLocked,injectLifeStage,applyNavigation,applyHeader,avgParentBond,youthTalentTotal};
  patch();
  document.addEventListener('DOMContentLoaded',()=>{patch();setTimeout(patch,0);setTimeout(patch,120);});
  window.addEventListener('load',()=>{patch();setTimeout(patch,250);});
  setTimeout(patch,500);
})();
