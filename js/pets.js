/* js/pets.js — LifeSim v13 Reforged pets system */

const PET_TYPES=[
  {id:'dog',icon:'🐶',name:'Dog',cost:900,upkeep:120,happBonus:12,maxAge:15,desc:'Loyal companion. Loves walks.',needsWalk:true},
  {id:'cat',icon:'🐱',name:'Cat',cost:450,upkeep:65,happBonus:8,maxAge:18,desc:'Independent and cuddly.'},
  {id:'rabbit',icon:'🐰',name:'Rabbit',cost:160,upkeep:35,happBonus:6,maxAge:10,desc:'Gentle and fluffy.'},
  {id:'fish',icon:'🐟',name:'Fish',cost:65,upkeep:12,happBonus:3,maxAge:5,desc:'Calming to watch.'},
  {id:'hamster',icon:'🐹',name:'Hamster',cost:85,upkeep:18,happBonus:5,maxAge:3,desc:'Tiny adventurer.'},
  {id:'parrot',icon:'🦜',name:'Parrot',cost:1400,upkeep:90,happBonus:9,maxAge:40,desc:'Talks back. Smart.'},
  {id:'turtle',icon:'🐢',name:'Turtle',cost:220,upkeep:22,happBonus:4,maxAge:80,desc:'Slow and wise.'},
  {id:'horse',icon:'🐴',name:'Horse',cost:12000,upkeep:600,happBonus:14,maxAge:30,desc:'Noble and majestic.',large:true},
];

const PET_NAMES_M=['Buddy','Max','Charlie','Milo','Rocky','Oscar','Bear','Teddy','Zeus','Biscuit','Finn','Hank','Leo','Bruno','Jasper'];
const PET_NAMES_F=['Bella','Luna','Daisy','Molly','Coco','Ruby','Rosie','Lily','Penny','Lola','Nala','Stella','Willow','Honey','Peanut'];

const Pets={
  VERSION:13,

  ACTION_LIMITS:{
    adopt:2,
    walk:4,
    play:4,
    feed:5,
    groom:3,
    vet:2,
    rehome:1,
  },

  HISTORY_LIMIT:14,

  _esc(v){
    if(typeof escHTML==='function')return escHTML(v);
    return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  },

  _attr(v){
    return String(v??'').replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,' ');
  },

  _resetActionYearIfNeeded(G=window.G){
    if(!G)return;
    if(!Number.isFinite(G.petActionYear))G.petActionYear=G.age||0;
    if(!G.petActionUses||typeof G.petActionUses!=='object')G.petActionUses={};
    if(G.petActionYear!==(G.age||0)){
      G.petActionYear=G.age||0;
      G.petActionUses={};
    }
  },

  _usesLeft(action,G=window.G){
    if(!G)return 0;
    this._resetActionYearIfNeeded(G);
    const limit=this.ACTION_LIMITS[action]??99;
    const used=G.petActionUses?.[action]||0;
    return Math.max(0,limit-used);
  },

  _canUseAction(action,msg='You already used that pet action enough this year. Age up to refresh.'){
    const G=window.G;if(!G)return false;
    this._resetActionYearIfNeeded(G);
    if(this._usesLeft(action,G)<=0){
      UI.toast(msg,'bad');
      return false;
    }
    return true;
  },

  _markAction(action,G=window.G){
    if(!G)return;
    this._resetActionYearIfNeeded(G);
    G.petActionUses[action]=(G.petActionUses[action]||0)+1;
  },

  _recordHistory(label,pet='',type='care',amount=0){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    G.petHistory.unshift({age:G.age||0,label,pet,type,amount});
    if(G.petHistory.length>this.HISTORY_LIMIT)G.petHistory.length=this.HISTORY_LIMIT;
  },

  ensureState(G=window.G){
    if(!G)return;
    if(!Array.isArray(G.pets))G.pets=[];
    if(!Array.isArray(G.petHistory))G.petHistory=[];
    if(!G.petActionUses||typeof G.petActionUses!=='object')G.petActionUses={};
    if(!Number.isFinite(G.petActionYear))G.petActionYear=G.age||0;
    this._resetActionYearIfNeeded(G);

    G.pets.forEach(p=>{
      if(!p||typeof p!=='object')return;
      const def=this._type(p.typeId)||PET_TYPES.find(x=>x.name===p.type)||PET_TYPES[0];
      p.id=p.id||Math.random().toString(36).slice(2);
      p.typeId=p.typeId||def.id;
      p.type=def.name;
      p.icon=p.icon||def.icon;
      p.name=p.name||pick(Math.random()>.5?PET_NAMES_M:PET_NAMES_F)||def.name;
      p.age=Number.isFinite(p.age)?Math.max(0,Math.round(p.age)):0;
      p.happiness=Number.isFinite(p.happiness)?cl(p.happiness):75;
      p.health=Number.isFinite(p.health)?cl(p.health):82;
      p.bond=Number.isFinite(p.bond)?cl(p.bond):45;
      p.energy=Number.isFinite(p.energy)?cl(p.energy):70;
      p.alive=p.alive!==false;
      p.upkeep=Number.isFinite(p.upkeep)?p.upkeep:def.upkeep;
      p.happBonus=Number.isFinite(p.happBonus)?p.happBonus:def.happBonus;
      p.lastVetAge=Number.isFinite(p.lastVetAge)?p.lastVetAge:null;
      p.memorial=p.memorial||'';
      p.careYears=Number.isFinite(p.careYears)?Math.max(0,Math.round(p.careYears)):0;
      p.neglectYears=Number.isFinite(p.neglectYears)?Math.max(0,Math.round(p.neglectYears)):0;
      p.lastCareAge=Number.isFinite(p.lastCareAge)?p.lastCareAge:null;
    });
  },

  _type(id){
    return PET_TYPES.find(p=>p.id===id)||null;
  },

  _alive(G=window.G){
    this.ensureState(G);
    return (G?.pets||[]).filter(p=>p.alive);
  },

  _petLimit(G=window.G){
    const hasLarge=this._alive(G).some(p=>this._type(p.typeId)?.large);
    const ownedHome=!!(G?.assets?.properties||[]).some(p=>p.rent===0);
    if(hasLarge)return ownedHome?4:3;
    return ownedHome?4:3;
  },

  _status(v){
    if(v>=75)return{label:'Great',color:'var(--green)'};
    if(v>=45)return{label:'Okay',color:'var(--yellow)'};
    return{label:'Needs care',color:'var(--red)'};
  },

  _upkeepTotal(G=window.G){
    return this._alive(G).reduce((s,p)=>s+sc(p.upkeep||0),0);
  },

  _careScore(G=window.G){
    const alive=this._alive(G);
    if(!alive.length)return{score:0,label:'No pets',color:'var(--muted)'};
    const avg=Math.round(alive.reduce((s,p)=>s+(p.happiness||0)+(p.health||0)+(p.bond||0),0)/(alive.length*3));
    if(avg>=80)return{score:avg,label:'Loved family',color:'var(--green)'};
    if(avg>=60)return{score:avg,label:'Stable care',color:'var(--teal)'};
    if(avg>=40)return{score:avg,label:'Needs attention',color:'var(--yellow)'};
    return{score:avg,label:'Neglected',color:'var(--red)'};
  },

  render(){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    const el=document.getElementById('tab-pets');if(!el)return;

    const alive=this._alive(G);
    const limit=this._petLimit(G);
    const upkeep=this._upkeepTotal(G);
    const avgBond=alive.length?Math.round(alive.reduce((s,p)=>s+(p.bond||0),0)/alive.length):0;
    const care=this._careScore(G);

    let h=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      <div class="nw-box" style="margin-bottom:0">
        <div class="nw-lbl">Pet Family</div>
        <div class="nw-amt" style="font-size:22px;color:${alive.length?'var(--accent)':'var(--muted)'}">${alive.length}/${limit}</div>
        <div class="nw-sub">${alive.length?'Active companions':'No pets yet'} · upkeep ${fmt(upkeep)}/yr</div>
      </div>
      <div class="nw-box" style="margin-bottom:0">
        <div class="nw-lbl">Average Bond</div>
        <div class="nw-amt" style="font-size:22px;color:${avgBond>=70?'var(--green)':avgBond>=40?'var(--yellow)':'var(--muted)'}">${avgBond||'—'}${avgBond?'%':''}</div>
        <div class="nw-sub">${avgBond>=70?'Deep connection':avgBond>=40?'Growing bond':'Build trust through care'}</div>
      </div>
      <div class="nw-box" style="margin-bottom:0">
        <div class="nw-lbl">Care Score</div>
        <div class="nw-amt" style="font-size:22px;color:${care.color}">${care.score||'—'}${care.score?'%':''}</div>
        <div class="nw-sub">${this._esc(care.label)}</div>
      </div>
      <div class="nw-box" style="margin-bottom:0">
        <div class="nw-lbl">Care Actions</div>
        <div class="nw-amt" style="font-size:22px;color:var(--accent)">${this._usesLeft('play')+this._usesLeft('feed')+this._usesLeft('groom')+this._usesLeft('vet')}</div>
        <div class="nw-sub">Refreshes every Age Up</div>
      </div>
    </div>`;

    h+=`<div class="info-box"><p>🐾 Pet care now has yearly action limits to prevent spam-click loops. Care, vet visits and adoption refresh after Age Up.</p></div>`;

    if(G.pets&&G.pets.length){
      h+=`<div class="sec">🐾 Your Companions</div>`;
      G.pets.forEach((p,i)=>{
        const def=this._type(p.typeId)||PET_TYPES[0];

        if(!p.alive){
          h+=`<div style="background:var(--s1);border:1px solid var(--b1);border-radius:13px;padding:12px;margin-bottom:8px;opacity:.65">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="font-size:28px">${p.icon}</div>
              <div>
                <div style="font-size:14px;font-weight:800">${this._esc(p.name)} 🪦</div>
                <div style="font-size:11px;color:var(--muted)">Age ${p.age} · Deceased · ${this._esc(p.memorial||'Forever in your heart 💙')}</div>
              </div>
            </div>
          </div>`;
          return;
        }

        const hp=this._status(p.happiness);
        const hl=this._status(p.health);
        const bd=this._status(p.bond);
        const senior=p.age>=Math.max(1,Math.round((def.maxAge||12)*0.7));
        const vetDue=p.lastVetAge===null||G.age-p.lastVetAge>=3||p.health<55;

        h+=`<div style="background:var(--s1);border:1.5px solid ${senior?'rgba(251,191,36,.35)':'var(--b1)'};border-radius:var(--r);padding:14px;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div style="font-size:32px">${p.icon}</div>
            <div style="flex:1">
              <div style="font-size:15px;font-weight:900">${this._esc(p.name)} <span style="color:var(--muted);font-size:11px">(${this._esc(p.type)})</span></div>
              <div style="font-size:11px;color:var(--muted);font-weight:600">Age ${p.age}${senior?' · Senior pet':''}${vetDue?' · Vet due':''} · cared ${p.careYears||0} yr${(p.careYears||0)!==1?'s':''}</div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px">
            ${this._bar('😊 Happiness',p.happiness,hp.color)}
            ${this._bar('❤️ Health',p.health,hl.color)}
            ${this._bar('🤝 Bond',p.bond,bd.color)}
          </div>

          <div class="act-grid">
            ${def.needsWalk?this._careCard('🦮','Walk','+Pet +Fitness',`Pets.walk(${i})`,'walk'):''}
            ${this._careCard('🎾','Play','+Bond +Happiness',`Pets.play(${i})`,'play')}
            ${this._careCard('🍖','Quality Food',`+Health (${fmt(sc(25))})`,`Pets.feed(${i})`,'feed',(G.money||0)<sc(25),(G.money||0)<sc(25)?`Need ${fmt(sc(25))}`:'')}
            ${this._careCard('🧼','Groom / Enrich',`+Mood (${fmt(sc(45))})`,`Pets.groom(${i})`,'groom',(G.money||0)<sc(45),(G.money||0)<sc(45)?`Need ${fmt(sc(45))}`:'')}
            ${this._careCard('🏥','Vet Visit',`+Health (${fmt(sc(150))})`,`Pets.vet(${i})`,'vet',(G.money||0)<sc(150),(G.money||0)<sc(150)?`Need ${fmt(sc(150))}`:'',vetDue)}
            ${this._careCard('💔','Rehome','Give away',`Pets.rehome(${i})`,'rehome',false,'',false,true)}
          </div>
        </div>`;
      });
    }

    if(alive.length<limit){
      h+=`<div class="sec">🐾 Adopt a Pet</div>`;
      PET_TYPES.forEach(pt=>{
        const cost=sc(pt.cost);
        const can=(G.money||0)>=cost;
        const largeLocked=pt.large&&!(G.assets?.properties||[]).some(p=>p.rent===0);
        const yearlyLocked=this._usesLeft('adopt')<=0;
        const locked=!can||largeLocked||yearlyLocked;
        const lockText=largeLocked?'Needs owned home':yearlyLocked?'Adoption limit reached this year':`Need ${fmt(cost)}`;
        h+=`<div class="row-card ${locked?'locked':''}" onclick="${locked?`UI.toast('${this._attr(lockText)}')`:`Pets.adopt('${pt.id}')`}">
          <span class="ri">${pt.icon}</span>
          <div class="rd">
            <div class="rt">${this._esc(pt.name)}</div>
            <div class="rs">${this._esc(pt.desc)} · +${pt.happBonus} happiness/yr · Upkeep ${fmt(sc(pt.upkeep))}/yr${largeLocked?' · Needs owned home':''}</div>
          </div>
          <div class="rv">${locked?this._esc(lockText):fmt(cost)}</div>
        </div>`;
      });
    }else{
      h+=`<div class="info-box"><p>🐾 Your home is full. Rehome one pet first if you want to adopt another.</p></div>`;
    }

    h+=this._renderHistory(G);
    el.innerHTML=h;
  },

  _careCard(icon,name,desc,action,actionKey,extraLocked=false,lockText='',special=false,danger=false){
    const noUses=this._usesLeft(actionKey)<=0;
    const locked=extraLocked||noUses;
    const msg=lockText||`${name} limit reached this year. Age up to refresh.`;
    const left=this._usesLeft(actionKey);
    return `<div class="card ${special?'special ':''}${danger?'danger ':''}${locked?'locked':''}" onclick="${locked?`UI.toast('${this._attr(msg)}')`:action}">
      <span class="ci">${locked?'🔒':icon}</span>
      <span class="cn">${this._esc(name)}</span>
      <span class="cd">${locked?this._esc(msg):`${this._esc(desc)} · ${left} left`}</span>
    </div>`;
  },

  _bar(label,value,color){
    return `<div>
      <div class="sb-l" style="margin-bottom:2px">${label}</div>
      <div class="rel-bar"><div class="rel-fill" style="width:${cl(value)}%;background:${color}"></div></div>
      <div style="font-size:10px;font-weight:800;color:${color};margin-top:2px">${cl(value)}%</div>
    </div>`;
  },

  _renderHistory(G){
    const rows=(G.petHistory||[]).slice(0,6);
    if(!rows.length)return '';
    let h='<div class="sec">🐾 Pet Care History</div>';
    rows.forEach(row=>{
      const ico=row.type==='adopt'?'🐾':row.type==='vet'?'🏥':row.type==='loss'?'💔':row.type==='rehome'?'🏡':'🎾';
      h+=`<div class="row-card">
        <span class="ri">${ico}</span>
        <div class="rd">
          <div class="rt">Age ${row.age} · ${this._esc(row.label)}</div>
          <div class="rs">${this._esc(row.pet||'')} ${row.amount?`· ${fmt(row.amount)}`:''}</div>
        </div>
      </div>`;
    });
    return h;
  },

  adopt(typeId){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    const pt=this._type(typeId);if(!pt)return;

    if(!this._canUseAction('adopt','You already adopted enough pets this year. Age up to refresh.'))return;

    const alive=this._alive(G);
    const limit=this._petLimit(G);
    if(alive.length>=limit){UI.toast('Your home is already full of pets.');return;}
    if(pt.large&&!(G.assets?.properties||[]).some(p=>p.rent===0)){UI.toast('A horse needs an owned home/property first.');return;}

    const cost=sc(pt.cost);
    if((G.money||0)<cost){UI.toast(`Need ${fmt(cost)}!`);return;}

    G.money-=cost;
    this._markAction('adopt',G);
    const petName=pick(Math.random()>.5?PET_NAMES_M:PET_NAMES_F);
    G.pets.push({
      id:Math.random().toString(36).slice(2),
      type:pt.name,
      icon:pt.icon,
      typeId:pt.id,
      name:petName,
      age:0,
      happiness:75,
      health:82,
      bond:45,
      energy:75,
      alive:true,
      upkeep:pt.upkeep,
      happBonus:pt.happBonus,
      lastVetAge:null,
      memorial:'',
      careYears:0,
      neglectYears:0,
      lastCareAge:G.age||0,
    });

    G.happiness=cl((G.happiness||50)+10);
    this._recordHistory(`Adopted ${petName}`,pt.name,'adopt',-cost);
    Engine.log(`🐾 You adopted ${petName} the ${pt.name}. Welcome to the family!`,'special');
    Engine.checkAch();
    UI.update();
    this.render();
  },

  _pet(i){
    const G=window.G;
    this.ensureState(G);
    const p=(G.pets||[])[i];
    if(!p||!p.alive)return null;
    return p;
  },

  _pay(cost,label){
    const G=window.G;
    const c=sc(cost);
    if((G.money||0)<c){UI.toast(`Need ${fmt(c)}!`);return false;}
    G.money-=c;
    if(label)Engine.log(label,'money');
    return true;
  },

  _markCare(p,type){
    const G=window.G;if(!G||!p)return;
    p.lastCareAge=G.age||0;
    p.careYears=(p.careYears||0)+1;
    p.neglectYears=Math.max(0,(p.neglectYears||0)-1);
    if((p.bond||0)>=85){
      G.happiness=cl((G.happiness||50)+1);
    }
  },

  walk(i){
    const G=window.G;
    const p=this._pet(i);if(!p)return;
    const def=this._type(p.typeId);
    if(!def?.needsWalk){UI.toast(`${p.name} does not need walks like a dog.`);return;}
    if(!this._canUseAction('walk'))return;
    this._markAction('walk',G);
    this._markCare(p,'walk');
    p.happiness=cl(p.happiness+r(8,15));
    p.health=cl(p.health+r(4,8));
    p.bond=cl((p.bond||45)+r(5,10));
    p.energy=cl((p.energy||70)-r(4,10));
    G.happiness=cl((G.happiness||50)+6);
    G.fitness=cl((G.fitness||50)+r(1,3));
    G.stress=cl((G.stress||0)-r(1,4));
    this._recordHistory(`Walked ${p.name}`,p.type,'care');
    Engine.log(`🦮 Took ${p.name} for a walk. Both of you are happier.`, 'good');
    UI.update();this.render();
  },

  play(i){
    const G=window.G;
    const p=this._pet(i);if(!p)return;
    if(!this._canUseAction('play'))return;
    this._markAction('play',G);
    this._markCare(p,'play');
    p.happiness=cl(p.happiness+r(10,18));
    p.bond=cl((p.bond||45)+r(6,12));
    p.energy=cl((p.energy||70)-r(3,8));
    G.happiness=cl((G.happiness||50)+8);
    G.stress=cl((G.stress||0)-r(1,4));
    this._recordHistory(`Played with ${p.name}`,p.type,'care');
    Engine.log(`🎾 Played with ${p.name}. Pure joy for both of you.`, 'good');
    UI.update();this.render();
  },

  feed(i){
    const p=this._pet(i);if(!p)return;
    if(!this._canUseAction('feed'))return;
    if(!this._pay(25))return;
    this._markAction('feed');
    this._markCare(p,'feed');
    p.health=cl(p.health+r(5,10));
    p.happiness=cl(p.happiness+r(2,6));
    p.energy=cl((p.energy||70)+r(4,9));
    this._recordHistory(`Quality food for ${p.name}`,p.type,'care',-sc(25));
    Engine.log(`🍖 Fed ${p.name} a good meal. Content and healthy.`, 'good');
    UI.update();this.render();
  },

  groom(i){
    const p=this._pet(i);if(!p)return;
    if(!this._canUseAction('groom'))return;
    if(!this._pay(45))return;
    this._markAction('groom');
    this._markCare(p,'groom');
    p.happiness=cl(p.happiness+r(5,12));
    p.health=cl(p.health+r(2,5));
    p.bond=cl((p.bond||45)+r(3,8));
    this._recordHistory(`Groomed ${p.name}`,p.type,'care',-sc(45));
    Engine.log(`🧼 ${p.name} got grooming and enrichment. They look and feel better.`, 'good');
    UI.update();this.render();
  },

  vet(i){
    const G=window.G;
    const p=this._pet(i);if(!p)return;
    if(!this._canUseAction('vet'))return;
    const c=150+(p.health<35?100:0);
    if(!this._pay(c))return;
    this._markAction('vet',G);
    this._markCare(p,'vet');
    p.health=cl(p.health+r(16,28));
    p.happiness=cl(p.happiness-r(0,4));
    p.lastVetAge=G.age;
    this._recordHistory(`Vet visit for ${p.name}`,p.type,'vet',-sc(c));
    Engine.log(`🏥 ${p.name} got a vet checkup. Health improved.`, 'good');
    UI.update();this.render();
  },

  rehome(i){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    const p=(G.pets||[])[i];if(!p)return;
    if(!this._canUseAction('rehome','You can only rehome one pet per year. Age up to refresh.'))return;
    if(!confirm(`Rehome ${p.name}?\n\nThis removes them from your life permanently.`))return;
    this._markAction('rehome',G);
    const nm=p.name;
    const type=p.type;
    G.pets.splice(i,1);
    G.happiness=cl((G.happiness||50)-8);
    this._recordHistory(`Rehomed ${nm}`,type,'rehome');
    Engine.log(`💔 You rehomed ${nm}. You'll miss them.`, 'bad');
    UI.update();this.render();
  },

  _chargeUpkeep(p){
    const G=window.G;
    const cost=sc(p.upkeep||0);
    if(cost<=0)return true;

    if(typeof Assets!=='undefined'&&Assets.chargeExpense){
      const res=Assets.chargeExpense(`${p.name} pet upkeep`,cost,{icon:'🐾',toCollections:true,creditPenalty:4,stress:2,happiness:2,logMiss:false});
      return !!res.paid;
    }

    if((G.money||0)>=cost){G.money-=cost;return true;}
    G.money=0;
    return false;
  },

  tick(){
    const G=window.G;if(!G)return;
    this.ensureState(G);
    if(!G.pets.length)return;

    let aliveCount=0;
    let unpaid=0;

    G.pets.forEach(p=>{
      if(!p.alive)return;
      aliveCount++;
      const def=this._type(p.typeId)||PET_TYPES[0];
      p.age++;

      const paid=this._chargeUpkeep(p);
      if(!paid){
        unpaid++;
        p.happiness=cl(p.happiness-r(8,16));
        p.health=cl(p.health-r(4,9));
        p.neglectYears=(p.neglectYears||0)+1;
      }

      const hadCareThisYear=p.lastCareAge===(G.age-1)||p.lastCareAge===G.age;
      if(hadCareThisYear){
        p.careYears=(p.careYears||0)+1;
        p.neglectYears=Math.max(0,(p.neglectYears||0)-1);
      }else{
        p.neglectYears=(p.neglectYears||0)+1;
      }

      const bondBonus=Math.floor((p.bond||0)/35);
      G.happiness=cl((G.happiness||50)+Math.floor((p.happBonus||0)/4)+bondBonus);

      p.happiness=cl(p.happiness-r(2,6)-(p.neglectYears>=2?2:0));
      p.health=cl(p.health-r(1,3)-(p.neglectYears>=3?2:0));
      p.energy=cl((p.energy||70)+r(4,10));

      if((G.stress||0)>75&&Math.random()<0.12){
        G.stress=cl((G.stress||0)-r(2,5));
        Engine.log(`🐾 ${p.name} helped you calm down during a stressful year.`, 'good');
      }

      if((p.careYears||0)>=5&&(p.bond||0)>=70&&Math.random()<0.15){
        G.happiness=cl((G.happiness||50)+r(2,5));
        Engine.log(`💞 Years of caring for ${p.name} made your bond even deeper.`, 'good');
      }

      const maxAge=def.maxAge||12;
      const oldAgeRisk=p.age>=maxAge?0.30:p.age>=Math.round(maxAge*0.85)?0.10:0;
      const poorHealthRisk=p.health<15?0.22:p.health<30?0.08:0;

      if(oldAgeRisk&&Math.random()<oldAgeRisk){
        p.alive=false;
        p.memorial='A lifetime of memories.';
        G.happiness=cl((G.happiness||50)-15);
        this._recordHistory(`${p.name} passed away`,p.type,'loss');
        Engine.log(`💔 Your beloved ${p.type} ${p.name} passed away at age ${p.age}. RIP 🌈`, 'bad');
      }else if(poorHealthRisk&&Math.random()<poorHealthRisk){
        p.alive=false;
        p.memorial='Passed after health struggles.';
        G.happiness=cl((G.happiness||50)-12);
        this._recordHistory(`${p.name} passed away`,p.type,'loss');
        Engine.log(`💔 ${p.name} passed away due to poor health.`, 'bad');
      }
    });

    if(unpaid>0)Engine.log(`⚠️ Could not fully cover yearly care for ${unpaid} pet${unpaid!==1?'s':''}. Their health and mood suffered.`, 'bad');
    if(aliveCount>=3&&!G.achievements?.pet_family){
      G.achievements=G.achievements||{};
      G.achievements.pet_family=true;
      Engine.checkAch();
    }
  },
};