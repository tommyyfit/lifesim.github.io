/* js/skills.js — LifeSim v9 */
const SKILL_DEFS = [
  { id:'coding',    icon:'💻', name:'Coding',           desc:'Software & tech skills',   stat:'smarts', jobs:['Software Engineer','Data Scientist','CTO'],   maxLv:5, costBase:200  },
  { id:'cooking',   icon:'👨‍🍳', name:'Culinary Arts',    desc:'Cook and entertain',        stat:'health', jobs:['Chef','Restaurant Owner'],                    maxLv:5, costBase:50   },
  { id:'music',     icon:'🎸', name:'Music',             desc:'Instrument mastery',        stat:'fame',   jobs:['Musician','Music Producer'],                   maxLv:5, costBase:80   },
  { id:'language',  icon:'🗣️', name:'Languages',         desc:'Speak more languages',      stat:'smarts', jobs:['Diplomat','Translator'],                       maxLv:5, costBase:120  },
  { id:'fitness',   icon:'🏋️', name:'Athletic Training', desc:'Peak physical conditioning',stat:'fitness',jobs:['Personal Trainer','Athlete'],                  maxLv:5, costBase:60   },
  { id:'writing',   icon:'✍️', name:'Writing',           desc:'Prose, copy, storytelling', stat:'smarts', jobs:['Journalist','Author'],                          maxLv:5, costBase:40   },
  { id:'finance',   icon:'📊', name:'Finance & Investing',desc:'Manage and grow money',    stat:'smarts', jobs:['Investment Banker','CFO'],                      maxLv:5, costBase:150  },
  { id:'public_sp', icon:'🎤', name:'Public Speaking',   desc:'Command any room',          stat:'fame',   jobs:['Politician','Motivational Speaker'],            maxLv:5, costBase:100  },
  { id:'art',       icon:'🎨', name:'Fine Arts',         desc:'Painting, sculpture, craft',stat:'looks',  jobs:['Artist','Designer'],                            maxLv:5, costBase:70   },
  { id:'medicine',  icon:'🩺', name:'Medicine',          desc:'Health & biology knowledge',stat:'health', jobs:['Doctor','Surgeon'],                             maxLv:5, costBase:300  },
];

const Skills = {
  render() {
    const G = window.G; if (!G) return;
    const el = document.getElementById('tab-skills'); if (!el) return;
    if (!G.skills) G.skills = {};
    const sp = G.skillPoints || 0;

    let h = `<div class="nw-box" style="margin-bottom:12px">
      <div class="nw-lbl">🎓 Skill Points Available</div>
      <div class="nw-amt" style="font-size:24px;color:var(--accent)">${sp}</div>
      <div class="nw-sub">Earned by studying, training & levelling up. Each year may grant +1.</div>
    </div>`;

    // Unlocked jobs
    const allJobs = SKILL_DEFS.flatMap(s => {
      const lv = G.skills[s.id] || 0;
      return lv >= 3 ? s.jobs : [];
    });
    if (allJobs.length) {
      h += `<div class="nw-box" style="margin-bottom:12px;background:rgba(124,111,255,.08);border-color:rgba(124,111,255,.3)">
        <div class="nw-lbl">🔓 Unlocked Career Paths</div>
        <div style="font-size:13px;font-weight:700;color:var(--accent);margin-top:5px">${allJobs.join(' · ')}</div>
      </div>`;
    }

    h += `<div class="sec">📚 Your Skills</div>`;
    h += `<div style="display:grid;gap:8px">`;
    for (const sk of SKILL_DEFS) {
      const lv = G.skills[sk.id] || 0;
      const cost = sk.costBase * (lv + 1);
      const pct = (lv / sk.maxLv) * 100;
      const canAfford = G.money >= cost;
      const maxed = lv >= sk.maxLv;
      const gainLabel = sk.stat === 'health' ? '+Health/yr' : sk.stat === 'fitness' ? '+Fitness/yr' : sk.stat === 'smarts' ? '+Smarts/yr' : sk.stat === 'fame' ? '+Fame/yr' : sk.stat === 'looks' ? '+Looks/yr' : '+Stat';
      h += `<div class="row-card" style="align-items:flex-start">
        <span class="ri" style="font-size:22px">${sk.icon}</span>
        <div class="rd" style="flex:1">
          <div class="rt" style="margin-bottom:3px">${sk.name} <span style="color:var(--accent);font-size:11px">Lv ${lv}/${sk.maxLv}</span></div>
          <div class="rs">${sk.desc} · ${gainLabel} per level</div>
          <div class="prog-bar" style="margin-top:6px"><div class="prog-fill" style="width:${pct}%;background:${maxed?'var(--yellow)':'var(--accent)'}"></div></div>
          ${lv >= 3 ? `<div style="font-size:10px;color:var(--green);font-weight:700;margin-top:3px">🔓 Unlocks: ${sk.jobs.join(', ')}</div>` : ''}
        </div>
        ${maxed
          ? `<span style="font-size:12px;font-weight:800;color:var(--yellow);padding:6px 10px">MAXED ⭐</span>`
          : `<button class="btn-primary btn-sm" style="font-size:11px;padding:7px 10px;width:auto;opacity:${canAfford?1:.55}"
              onclick="Skills.learn('${sk.id}')">
              ${sp > 0 ? '🎯 Use Point' : `Train (${fmt(cost)})`}
            </button>`
        }
      </div>`;
    }
    h += `</div>`;
    el.innerHTML = h;
  },

  learn(id) {
    const G = window.G;
    if (!G.skills) G.skills = {};
    const sk = SKILL_DEFS.find(s => s.id === id); if (!sk) return;
    const lv = G.skills[id] || 0;
    if (lv >= sk.maxLv) { UI.toast('Skill maxed!'); return; }

    // Prefer spending skill points
    if ((G.skillPoints || 0) > 0) {
      G.skillPoints--;
      G.skills[id] = lv + 1;
      UI.toast(`🎓 ${sk.name} → Level ${lv + 1}!`, 'good');
      Engine.log(`🎓 Levelled up ${sk.name} to Level ${lv + 1}.`, 'special');
    } else {
      const cost = sk.costBase * (lv + 1);
      if (G.money < cost) { UI.toast(`Need ${fmt(cost)} to train!`); return; }
      G.money -= cost;
      G.skills[id] = lv + 1;
      UI.toast(`🎓 ${sk.name} → Level ${lv + 1}!`, 'good');
      Engine.log(`🎓 Trained ${sk.name} to Level ${lv + 1} (cost ${fmt(cost)}).`, 'special');
    }
    Engine.checkAch();
    UI.update();
    this.render();
  },

  tick() {
    const G = window.G; if (!G || !G.skills) return;
    // Each skill level gives small passive bonuses
    const skMap = {
      coding:   () => G.smarts  = cl(G.smarts  + Math.floor((G.skills.coding  || 0) * 0.4)),
      cooking:  () => G.health  = cl(G.health  + Math.floor((G.skills.cooking || 0) * 0.3)),
      music:    () => G.fame    = cl((G.fame||0)+ Math.floor((G.skills.music   || 0) * 0.3)),
      fitness:  () => G.fitness = cl((G.fitness||50)+ Math.floor((G.skills.fitness || 0) * 0.5)),
      writing:  () => G.smarts  = cl(G.smarts  + Math.floor((G.skills.writing || 0) * 0.3)),
      finance:  () => { if (G.skills.finance >= 2) G.money += sc(Math.floor((G.skills.finance || 0) * 400)); },
      public_sp:() => G.fame    = cl((G.fame||0)+ Math.floor((G.skills.public_sp || 0) * 0.4)),
      art:      () => G.looks   = cl(G.looks   + Math.floor((G.skills.art    || 0) * 0.2)),
      medicine: () => G.health  = cl(G.health  + Math.floor((G.skills.medicine || 0) * 0.5)),
      language: () => G.smarts  = cl(G.smarts  + Math.floor((G.skills.language || 0) * 0.3)),
    };
    for (const [k, fn] of Object.entries(skMap)) {
      if ((G.skills[k] || 0) > 0) { try { fn(); } catch(e) {} }
    }
    // Random skill point reward
    if (Math.random() < 0.18) {
      G.skillPoints = (G.skillPoints || 0) + 1;
      Engine.log('🎓 Skill Point earned!', 'special');
    }
  },
};
