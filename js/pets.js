/* js/pets.js — LifeSim v9 */
const PET_TYPES=[
  {id:'dog',    icon:'🐶',name:'Dog',     cost:900,  upkeep:120,happBonus:12,desc:'Loyal companion. Loves walks.'},
  {id:'cat',    icon:'🐱',name:'Cat',     cost:450,  upkeep:65, happBonus:8, desc:'Independent and cuddly.'},
  {id:'rabbit', icon:'🐰',name:'Rabbit',  cost:160,  upkeep:35, happBonus:6, desc:'Gentle and fluffy.'},
  {id:'fish',   icon:'🐟',name:'Fish',    cost:65,   upkeep:12, happBonus:3, desc:'Calming to watch.'},
  {id:'hamster',icon:'🐹',name:'Hamster', cost:85,   upkeep:18, happBonus:5, desc:'Tiny adventurer.'},
  {id:'parrot', icon:'🦜',name:'Parrot',  cost:1400, upkeep:90, happBonus:9, desc:'Talks back. Smart.'},
  {id:'turtle', icon:'🐢',name:'Turtle',  cost:220,  upkeep:22, happBonus:4, desc:'Slow and wise.'},
  {id:'horse',  icon:'🐴',name:'Horse',   cost:12000,upkeep:600,happBonus:14,desc:'Noble and majestic.'},
];
const PET_NAMES_M=['Buddy','Max','Charlie','Milo','Rocky','Oscar','Bear','Teddy','Zeus','Biscuit','Finn','Hank','Leo','Bruno','Jasper'];
const PET_NAMES_F=['Bella','Luna','Daisy','Molly','Coco','Ruby','Rosie','Lily','Penny','Lola','Nala','Stella','Willow','Honey','Peanut'];

const Pets={
  render(){
    const G=window.G; if(!G)return;
    const el=document.getElementById('tab-pets');
    let h='';
    if(G.pets&&G.pets.length){
      h+=`<div class="sec">🐾 Your Companions (${G.pets.filter(p=>p.alive).length} alive)</div>`;
      G.pets.forEach((p,i)=>{
        if(!p.alive){
          h+=`<div style="background:var(--s1);border:1px solid var(--b1);border-radius:13px;padding:12px;margin-bottom:8px;opacity:.6">
            <div style="display:flex;align-items:center;gap:10px"><div style="font-size:28px">${p.icon}</div><div><div style="font-size:14px;font-weight:800">${p.name} 🪦</div><div style="font-size:11px;color:var(--muted)">Age ${p.age} · Deceased · Forever in your heart 💙</div></div></div>
          </div>`;
          return;
        }
        const hpC=p.happiness>65?'var(--green)':p.happiness>35?'var(--yellow)':'var(--red)';
        const hhC=p.health>65?'var(--green)':p.health>35?'var(--yellow)':'var(--red)';
        h+=`<div style="background:var(--s1);border:1.5px solid var(--b1);border-radius:var(--r);padding:14px;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
            <div style="font-size:32px">${p.icon}</div>
            <div style="flex:1"><div style="font-size:15px;font-weight:900">${p.name} <span style="color:var(--muted);font-size:11px">(${p.type})</span></div>
            <div style="font-size:11px;color:var(--muted);font-weight:600">Age ${p.age}</div></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
            <div><div class="sb-l" style="margin-bottom:2px">😊 Happiness</div><div class="rel-bar"><div class="rel-fill" style="width:${p.happiness}%;background:${hpC}"></div></div><div style="font-size:10px;font-weight:800;color:${hpC};margin-top:2px">${p.happiness}%</div></div>
            <div><div class="sb-l" style="margin-bottom:2px">❤️ Health</div><div class="rel-bar"><div class="rel-fill" style="width:${p.health}%;background:${hhC}"></div></div><div style="font-size:10px;font-weight:800;color:${hhC};margin-top:2px">${p.health}%</div></div>
          </div>
          <div class="act-grid">
            ${p.type==='Dog'?`<div class="card" onclick="Pets.walk(${i})"><span class="ci">🦮</span><span class="cn">Walk</span><span class="cd">+Hap +Health</span></div>`:''}
            <div class="card" onclick="Pets.play(${i})"><span class="ci">🎾</span><span class="cn">Play</span><span class="cd">+Happiness</span></div>
            <div class="card" onclick="Pets.feed(${i})"><span class="ci">🍖</span><span class="cn">Feed</span><span class="cd">+Health</span></div>
            <div class="card" onclick="Pets.vet(${i})"><span class="ci">🏥</span><span class="cn">Vet Visit</span><span class="cd">+Health (${fmt(sc(150))})</span></div>
            <div class="card danger" onclick="Pets.rehome(${i})"><span class="ci">💔</span><span class="cn">Rehome</span><span class="cd">Give away</span></div>
          </div>
        </div>`;
      });
    } else {
      h+=`<div class="empty compact"><span class="ei">🐾</span><p>No pets yet.<br>Adopt a companion when you are ready.</p></div>`;
    }
    const alivePets=(G.pets||[]).filter(p=>p.alive);
    if(alivePets.length<3){
      h+=`<div class="sec">🐾 Adopt a Pet</div>`;
      PET_TYPES.forEach(pt=>{
        const cost=sc(pt.cost); const can=G.money>=cost;
        h+=`<div class="row-card ${can?'':'locked'}" onclick="${can?`Pets.adopt('${pt.id}')`:``}">
          <span class="ri">${pt.icon}</span>
          <div class="rd"><div class="rt">${pt.name}</div><div class="rs">${pt.desc} · +${pt.happBonus} Happiness/yr · Upkeep ${fmt(sc(pt.upkeep))}/yr</div></div>
          <div class="rv">${fmt(cost)}</div>
        </div>`;
      });
    } else {
      h+=`<div class="info-box"><p>You have 3 pets — hands full! Rehome one first to adopt another.</p></div>`;
    }
    el.innerHTML=h;
  },

  adopt(typeId){
    const G=window.G; const pt=PET_TYPES.find(p=>p.id===typeId); if(!pt)return;
    const cost=sc(pt.cost); if(G.money<cost){UI.toast(`Need ${fmt(cost)}!`);return;}
    G.money-=cost; if(!G.pets)G.pets=[];
    const petName=pick(Math.random()>0.5?PET_NAMES_M:PET_NAMES_F);
    G.pets.push({id:Math.random().toString(36).slice(2),type:pt.name,icon:pt.icon,typeId,name:petName,age:0,happiness:75,health:82,alive:true,upkeep:pt.upkeep,happBonus:pt.happBonus});
    G.happiness=cl(G.happiness+10);
    Engine.log(`🐾 You adopted ${petName} the ${pt.name}! Welcome to the family!`,'special');
    Engine.checkAch(); UI.update(); this.render();
  },

  walk(i){const G=window.G;const p=(G.pets||[])[i];if(!p||!p.alive)return;p.happiness=cl(p.happiness+r(8,15));p.health=cl(p.health+r(4,8));G.happiness=cl(G.happiness+6);G.fitness=cl((G.fitness||50)+r(1,3));Engine.log(`🦮 Took ${p.name} for a walk. Both of you are happier!`,'good');UI.update();this.render();},
  play(i){const G=window.G;const p=(G.pets||[])[i];if(!p||!p.alive)return;p.happiness=cl(p.happiness+r(10,18));G.happiness=cl(G.happiness+8);Engine.log(`🎾 Played with ${p.name}. Pure joy for both of you!`,'good');UI.update();this.render();},
  feed(i){const G=window.G;const p=(G.pets||[])[i];if(!p||!p.alive)return;p.health=cl(p.health+r(5,10));Engine.log(`🍖 Fed ${p.name} a good meal. Content and healthy.`,'good');UI.update();this.render();},
  vet(i){const G=window.G;const p=(G.pets||[])[i];if(!p||!p.alive)return;const c=sc(150);if(G.money<c){UI.toast('Need '+fmt(c)+'!');return;}G.money-=c;p.health=cl(p.health+r(14,24));Engine.log(`🏥 ${p.name} got a vet checkup. Clean bill of health!`,'good');UI.update();this.render();},
  rehome(i){const G=window.G;const p=(G.pets||[])[i];if(!p)return;const nm=p.name;G.pets.splice(i,1);G.happiness=cl(G.happiness-8);Engine.log(`💔 You rehomed ${nm}. You'll miss them terribly.`,'bad');UI.update();this.render();},

  tick(){
    const G=window.G; if(!G.pets||!G.pets.length)return;
    G.pets.forEach(p=>{
      if(!p.alive)return;
      p.age++;
      // Upkeep cost
      G.money=Math.max(0,G.money-sc(p.upkeep));
      // Happiness bonus to owner
      G.happiness=cl(G.happiness+Math.floor(p.happBonus/4));
      // Natural decay
      p.happiness=cl(p.happiness-r(2,6));
      p.health=cl(p.health-r(1,3));
      // Age-based death
      const maxAge={Dog:15,Cat:18,Rabbit:10,Fish:5,Hamster:3,Parrot:40,Turtle:80,Horse:30}[p.type]||12;
      if(p.age>=maxAge&&Math.random()<0.3){p.alive=false;G.happiness=cl(G.happiness-15);Engine.log(`💔 Your beloved ${p.type} ${p.name} passed away at age ${p.age}. RIP 🌈`,'bad');}
      if(p.health<15&&Math.random()<0.2){p.alive=false;G.happiness=cl(G.happiness-12);Engine.log(`💔 ${p.name} passed away due to poor health. Please take better care of pets.`,'bad');}
    });
  },
};
