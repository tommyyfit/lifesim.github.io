/* js/military.js — LifeSim module */
'use strict';

const Military = {
  VERSION:1,

  BRANCHES: [
    { id:'army',    name:'Army',       icon:'🪖', salary:28000, stressAdd:12, fitnessReq:45, desc:'Ground forces. Most deployments, strongest pension, housing benefit.' },
    { id:'navy',    name:'Navy',       icon:'⚓', salary:30000, stressAdd:11, fitnessReq:42, desc:'Sea & maritime ops. Good technical training and travel.' },
    { id:'airforce',name:'Air Force',  icon:'✈️', salary:32000, stressAdd:10, fitnessReq:40, desc:'Aviation & tech roles. Highest pay, most transferable skills.' },
    { id:'marines', name:'Marines',    icon:'💪', salary:26000, stressAdd:16, fitnessReq:60, desc:'Elite ground forces. Hardest training, most prestige.' },
    { id:'specops', name:'Special Ops',icon:'🎯', salary:52000, stressAdd:20, fitnessReq:75, desc:'Black ops, counter-terrorism. Extreme risk, extreme reward.' },
  ],

  ENLISTED_RANKS: [
    { id:'e1', label:'E-1 Private',         salaryBonus:0,     years:0  },
    { id:'e2', label:'E-2 Private 2nd',     salaryBonus:2000,  years:1  },
    { id:'e3', label:'E-3 Private 1st',     salaryBonus:4000,  years:2  },
    { id:'e4', label:'E-4 Specialist',      salaryBonus:7000,  years:3  },
    { id:'e5', label:'E-5 Sergeant',        salaryBonus:12000, years:5  },
    { id:'e6', label:'E-6 Staff Sergeant',  salaryBonus:18000, years:8  },
    { id:'e7', label:'E-7 Sergeant 1st',    salaryBonus:26000, years:12 },
    { id:'e8', label:'E-8 Master Sergeant', salaryBonus:36000, years:16 },
    { id:'e9', label:'E-9 Sergeant Major',  salaryBonus:50000, years:20 },
  ],

  OFFICER_RANKS: [
    { id:'o1', label:'O-1 Second Lieutenant',salaryBonus:8000,  years:0  },
    { id:'o2', label:'O-2 First Lieutenant', salaryBonus:14000, years:2  },
    { id:'o3', label:'O-3 Captain',          salaryBonus:22000, years:5  },
    { id:'o4', label:'O-4 Major',            salaryBonus:32000, years:9  },
    { id:'o5', label:'O-5 Lt. Colonel',      salaryBonus:44000, years:13 },
    { id:'o6', label:'O-6 Colonel',          salaryBonus:58000, years:18 },
    { id:'o7', label:'O-7 Brigadier Gen.',   salaryBonus:80000, years:23 },
    { id:'o8', label:'O-8 Major General',    salaryBonus:105000,years:28 },
  ],

  DEPLOYMENT_EVENTS: [
    { id:'combat_hero',   icon:'🏅', chance:0.12, text:'Your unit came under heavy fire. You led a critical maneuver that saved lives.', ptsd:8,  honor:15, health:-5,  fitness:6,  log:'Led heroic combat action' },
    { id:'ied_injury',    icon:'💥', chance:0.10, text:'Your convoy hit an IED. You survived with shrapnel wounds — and a story you\'ll never forget.', ptsd:15, honor:5,  health:-12, fitness:-3, log:'Injured by IED in deployment' },
    { id:'routine_tour',  icon:'🗺️', chance:0.35, text:'A standard deployment. Long, gruelling, but professionally valuable.', ptsd:4,  honor:5,  health:0,   fitness:4,  log:'Completed standard deployment' },
    { id:'rescue_op',     icon:'🚁', chance:0.15, text:'You participated in a successful rescue operation. The mission was textbook.', ptsd:3,  honor:12, health:0,   fitness:3,  log:'Completed rescue operation' },
    { id:'psych_toll',    icon:'😔', chance:0.18, text:'The psychological toll of extended deployment is weighing heavily. Sleep is a stranger now.', ptsd:20, honor:3,  health:-3,  fitness:0,  log:'Suffered psychological toll from deployment' },
    { id:'decorated',     icon:'⭐', chance:0.10, text:'Your commanding officer commended your performance. A medal and a handshake.', ptsd:2,  honor:20, health:0,   fitness:0,  log:'Received military commendation' },
  ],

  SPEC_OPS_MISSIONS: [
    { id:'hostage_rescue',icon:'🚀', label:'Hostage Rescue', reward:85000, risk:0.3,  ptsd:18, honor:25, fitness:-3, desc:'Extract hostages from hostile territory.' },
    { id:'intelligence',  icon:'🔎', label:'Intelligence Op', reward:60000, risk:0.15, ptsd:10, honor:18, fitness:0,  desc:'Deep cover intelligence gathering mission.' },
    { id:'asset_extract', icon:'🛩️', label:'Asset Extraction', reward:70000, risk:0.22, ptsd:14, honor:20, fitness:-2, desc:'Extract a valuable source from enemy lines.' },
    { id:'direct_action', icon:'💣', label:'Direct Action',   reward:95000, risk:0.38, ptsd:22, honor:30, fitness:-5, desc:'High-tempo strike mission. Highest risk, highest reward.' },
  ],

  _esc(v) { return typeof escHTML === 'function' ? escHTML(v) : String(v ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); },


  _adultOnly(G = window.G) {
    if (!G || (G.age || 0) < 18) {
      if (typeof UI !== 'undefined' && UI?.toast) UI.toast('Military service unlocks at age 18.', 'neutral');
      return false;
    }
    return true;
  },

  _ensure(G = window.G) {
    if (!G) return;
    if (!G.military) G.military = { enlisted: false, discharged: false, branchId: null, rankIdx: 0, isOfficer: false, yearsServed: 0, deployments: 0, ptsd: 0, honor: 0, benefits: { housing: false, education: false, pension: 0 }, milActionYear: -1, milActionUses: {} };
    if (!Number.isFinite(G.military.ptsd)) G.military.ptsd = 0;
    if (!Number.isFinite(G.military.honor)) G.military.honor = 0;
    if (!Number.isFinite(G.military.yearsServed)) G.military.yearsServed = 0;
    if (!Number.isFinite(G.military.deployments)) G.military.deployments = 0;
    if (!G.military.benefits) G.military.benefits = { housing: false, education: false, pension: 0 };
    if (!G.military.milActionUses) G.military.milActionUses = {};
    if (!Number.isFinite(G.military.milActionYear)) G.military.milActionYear = -1;
    if (G.military.milActionYear !== (G.age || 0)) { G.military.milActionYear = G.age || 0; G.military.milActionUses = {}; }
  },

  _canAct(key, limit = 1) {
    const G = window.G; if (!G) return false;
    this._ensure(G);
    const used = G.military.milActionUses[key] || 0;
    if (used >= limit) { UI.toast('You\'ve already done that this year.', 'bad'); return false; }
    return true;
  },
  _markAct(key) { const G = window.G; if (!G) return; this._ensure(G); G.military.milActionUses[key] = (G.military.milActionUses[key] || 0) + 1; },

  _branch(G = window.G) { return this.BRANCHES.find(b => b.id === G?.military?.branchId); },
  _rankList(G = window.G) { return G?.military?.isOfficer ? this.OFFICER_RANKS : this.ENLISTED_RANKS; },
  _rank(G = window.G) { const ranks = this._rankList(G); return ranks[G?.military?.rankIdx || 0]; },

  _salary(G = window.G) {
    this._ensure(G);
    const branch = this._branch(G);
    const rank = this._rank(G);
    if (!branch || !rank) return 0;
    return salaryScale(branch.salary + rank.salaryBonus, G);
  },

  _ptsdLabel(v) {
    if (v >= 80) return { label: 'Severe PTSD', color: 'var(--red)' };
    if (v >= 55) return { label: 'Significant PTSD', color: 'var(--orange)' };
    if (v >= 30) return { label: 'Moderate PTSD', color: 'var(--yellow)' };
    if (v >= 10) return { label: 'Mild Stress', color: 'var(--muted)' };
    return { label: 'Resilient', color: 'var(--green)' };
  },

  enlist(branchId, asOfficer = false) {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (G.military.enlisted) { UI.toast('You\'re already in the military.', 'bad'); return; }
    const branch = this.BRANCHES.find(b => b.id === branchId); if (!branch) return;
    if ((G.age || 0) < 18 || (G.age || 0) > 35) { UI.toast('Military enlistment is for ages 18–35.', 'bad'); return; }
    if ((G.fitness || 50) < branch.fitnessReq) { UI.toast(`You need ${branch.fitnessReq} Fitness to join the ${branch.name}.`, 'bad'); return; }
    if (asOfficer && (G.education || '') !== 'university') { UI.toast('Officer track requires a university degree.', 'bad'); return; }
    if (G.career) { UI.toast('You must quit your current job to enlist.', 'bad'); return; }

    G.military.enlisted = true;
    G.military.branchId = branchId;
    G.military.rankIdx = 0;
    G.military.isOfficer = asOfficer;
    G.military.yearsServed = 0;
    G.military.benefits.housing = true;
    G.fitness = cl((G.fitness || 50) + 8);
    G.stress = cl((G.stress || 0) + 10, 0, 100);
    Engine.log(`${branch.icon} Enlisted in the ${branch.name}${asOfficer ? ' as an Officer' : ''}.`, 'special');
    UI.toast(`${branch.icon} Welcome to the ${branch.name}!`, 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  train() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!G.military.enlisted) return;
    if (!this._canAct('train', 2)) return;
    this._markAct('train');
    G.fitness = cl((G.fitness || 50) + r(2, 5));
    G.smarts = cl((G.smarts || 50) + r(1, 3));
    G.stress = cl((G.stress || 0) + 3, 0, 100);
    G.military.honor = (G.military.honor || 0) + r(1, 4);
    Engine.log('🏋️ Completed intensive military training.', 'health');
    UI.toast('🏋️ Training complete. Fitness and Honor improved.', 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  deploy() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!G.military.enlisted) return;
    if (!this._canAct('deploy')) return;
    this._markAct('deploy');

    G.military.deployments = (G.military.deployments || 0) + 1;
    const ev = weightedPick(this.DEPLOYMENT_EVENTS, e => e.chance * 100);
    if (ev) {
      G.military.ptsd = cl((G.military.ptsd || 0) + ev.ptsd, 0, 100);
      G.military.honor = (G.military.honor || 0) + ev.honor;
      G.health = cl((G.health || 60) + ev.health);
      G.fitness = cl((G.fitness || 50) + ev.fitness);
      G.stress = cl((G.stress || 0) + ev.ptsd * 0.5, 0, 100);
      Engine.log(`${ev.icon} ${ev.log}.`, ev.ptsd > 10 ? 'bad' : 'neutral');
      UI.toast(`${ev.icon} ${ev.text}`, ev.ptsd > 10 ? 'bad' : 'good');
    }

    // Salary during deployment
    const branch = this._branch(G);
    if (branch) G.money += salaryScale(branch.salary * 0.7, G);

    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  applyPromotion() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!G.military.enlisted) return;
    if (!this._canAct('promote')) return;
    this._markAct('promote');
    const ranks = this._rankList(G);
    const idx = G.military.rankIdx || 0;
    if (idx >= ranks.length - 1) { UI.toast('You\'ve reached the highest rank!', 'neutral'); return; }
    const nextRank = ranks[idx + 1];
    const yearsNeeded = nextRank.years;
    if ((G.military.yearsServed || 0) < yearsNeeded) {
      UI.toast(`Need ${yearsNeeded} years served for ${nextRank.label}. You have ${G.military.yearsServed}.`, 'bad'); return;
    }
    const honorNeeded = (idx + 1) * 15;
    if ((G.military.honor || 0) < honorNeeded) {
      UI.toast(`Need ${honorNeeded} Honor for this promotion. You have ${G.military.honor}.`, 'bad'); return;
    }
    G.military.rankIdx = idx + 1;
    Engine.log(`⬆️ Promoted to ${nextRank.label}!`, 'special');
    UI.toast(`⬆️ Promoted to ${nextRank.label}!`, 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  seekTherapy() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!G.military.enlisted && (G.military.ptsd || 0) < 10) return;
    if (!this._canAct('therapy', 2)) return;
    this._markAct('therapy');
    const cost = 2000;
    if ((G.money || 0) < cost) { UI.toast(`PTSD therapy costs ${fmt(cost)}.`, 'bad'); return; }
    G.money -= cost;
    const ptsdReduce = r(8, 20);
    G.military.ptsd = Math.max(0, (G.military.ptsd || 0) - ptsdReduce);
    G.mentalHealth = cl((G.mentalHealth || 60) + r(5, 12));
    G.stress = cl((G.stress || 0) - 8, 0, 100);
    Engine.log('🧠 Attended PTSD therapy session.', 'health');
    UI.toast('🧠 Therapy helped. PTSD reduced.', 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  useGiBill() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!G.military.benefits?.education && !G.military.discharged) { UI.toast('GI Bill unlocks after 4+ years of service.', 'bad'); return; }
    if (G.education === 'university') { UI.toast('You already have a university degree.', 'neutral'); return; }
    G.education = 'university';
    G.smarts = cl((G.smarts || 50) + 8);
    G.reputation = cl((G.reputation || 50) + 6);
    Engine.log('🎓 Used the GI Bill to earn a university degree!', 'special');
    UI.toast('🎓 GI Bill paid for your university education!', 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  runSpecOps(missionId) {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (G.military.branchId !== 'specops') { UI.toast('Special Ops missions require the Special Ops branch.', 'bad'); return; }
    if (!this._canAct('specops')) return;
    this._markAct('specops');
    const mission = this.SPEC_OPS_MISSIONS.find(m => m.id === missionId); if (!mission) return;

    const success = Math.random() > mission.risk;
    if (success) {
      G.money += mission.reward;
      G.military.honor = (G.military.honor || 0) + mission.honor;
      G.military.ptsd = cl((G.military.ptsd || 0) + mission.ptsd * 0.5, 0, 100);
      G.fitness = cl((G.fitness || 50) + mission.fitness);
      Engine.log(`🎯 Special Ops: ${mission.label} — SUCCESS. +${fmt(mission.reward)}`, 'special');
      UI.toast(`🎯 Mission successful! +${fmt(mission.reward)}`, 'good');
    } else {
      G.health = cl((G.health || 60) - r(10, 25));
      G.military.ptsd = cl((G.military.ptsd || 0) + mission.ptsd, 0, 100);
      G.stress = cl((G.stress || 0) + 15, 0, 100);
      Engine.log(`💥 Special Ops: ${mission.label} — FAILED. Injured.`, 'bad');
      UI.toast(`💥 Mission failed. Injuries sustained.`, 'bad');
    }
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  discharge(honorable = true) {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!G.military.enlisted) return;
    G.military.enlisted = false;
    G.military.discharged = true;
    const yrs = G.military.yearsServed || 0;
    if (yrs >= 20) {
      const pension = salaryScale(Math.round((this._branch(G)?.salary || 28000) * 0.5), G);
      G.military.benefits.pension = pension;
      Engine.log(`🎖️ Honorably discharged after ${yrs} years. Military pension: ${fmt(pension)}/yr`, 'special');
      UI.toast(`🎖️ Honorable discharge! Military pension locked in.`, 'good');
    } else {
      G.military.benefits.pension = 0;
      if (yrs >= 4) G.military.benefits.education = true;
      Engine.log(`🎖️ ${honorable ? 'Honorably' : 'Dishonorably'} discharged after ${yrs} years.`, honorable ? 'neutral' : 'bad');
      UI.toast(`🎖️ Discharged from military service.`, 'neutral');
    }
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  tick(G = window.G) {
    if (!G || !G.alive) return;
    this._ensure(G);
    if ((G.age || 0) < 18) return;
    if (!G.military.enlisted) {
      // Pension payment post-discharge
      if (G.military.benefits?.pension > 0) {
        G.money += G.military.benefits.pension;
        Engine.log(`🎖️ Military pension received: ${fmt(G.military.benefits.pension)}`, 'money');
      }
      return;
    }
    G.military.yearsServed = (G.military.yearsServed || 0) + 1;
    // Annual salary
    G.money += this._salary(G);
    Engine.log(`🪖 Military salary: +${fmt(this._salary(G))}`, 'money');
    // GI Bill unlocks at 4 years
    if ((G.military.yearsServed || 0) >= 4) G.military.benefits.education = true;
    // PTSD bleeds stress and mental health
    const ptsd = G.military.ptsd || 0;
    if (ptsd > 30) {
      G.stress = cl((G.stress || 0) + Math.floor(ptsd * 0.1), 0, 100);
      G.mentalHealth = cl((G.mentalHealth || 60) - Math.floor(ptsd * 0.05));
      if (ptsd > 60 && Math.random() < 0.3) {
        Engine.log('😔 PTSD symptoms flaring. Therapy recommended.', 'bad');
      }
    }
    // Branch stress
    const branch = this._branch(G);
    if (branch) G.stress = cl((G.stress || 0) + branch.stressAdd * 0.3, 0, 100);
    // Fitness boost
    G.fitness = cl((G.fitness || 50) + r(1, 3));
  },

  render() {
    const G = window.G; if (!G) return;
    this._ensure(G);
    const el = document.getElementById('tab-military'); if (!el) return;
    if ((G.age || 0) < 18) {
      el.innerHTML = '<div class="empty"><span class="ei">🎖️</span><p>Military service unlocks at age 18.</p></div>';
      return;
    }
    const mil = G.military;
    const branch = this._branch(G);
    const rank = this._rank(G);
    const ptsdMeta = this._ptsdLabel(mil.ptsd || 0);

    let h = '';

    if (mil.enlisted && branch) {
      h += `<div style="background:linear-gradient(135deg,rgba(100,116,139,.12),rgba(71,85,105,.08));border:1px solid rgba(100,116,139,.3);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <span style="font-size:28px">${branch.icon}</span>
          <div>
            <div style="font-size:15px;font-weight:700">${this._esc(rank?.label || 'Enlisted')}</div>
            <div style="font-size:12px;color:var(--muted)">${this._esc(branch.name)} · ${mil.yearsServed} yrs served · ${mil.deployments} deployments</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;font-size:12px;text-align:center">
          <div style="background:var(--b1);border-radius:6px;padding:6px"><div style="font-weight:700;color:var(--green)">${fmt(this._salary(G))}/yr</div><div style="color:var(--muted)">Salary</div></div>
          <div style="background:var(--b1);border-radius:6px;padding:6px"><div style="font-weight:700;color:var(--yellow)">${mil.honor || 0}</div><div style="color:var(--muted)">Honor</div></div>
          <div style="background:var(--b1);border-radius:6px;padding:6px"><div style="font-weight:700;color:${ptsdMeta.color}">${mil.ptsd || 0}</div><div style="color:var(--muted)">PTSD</div></div>
        </div>
      </div>`;

      if ((mil.ptsd || 0) > 20) {
        h += `<div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px;margin-bottom:12px;font-size:13px">
          <strong style="color:var(--red)">⚠️ ${ptsdMeta.label}</strong> — Combat trauma is affecting your mental health. Seek therapy.
        </div>`;
      }

      h += `<div class="sec">🎯 Actions</div><div class="act-grid">
        <div class="act-card" onclick="Military.train()"><div class="ac-ico">🏋️</div><div class="ac-lbl">Train</div><div class="ac-sub">+Fitness +Honor</div></div>
        <div class="act-card" onclick="Military.deploy()"><div class="ac-ico">🪖</div><div class="ac-lbl">Deploy</div><div class="ac-sub">Salary + events</div></div>
        <div class="act-card" onclick="Military.applyPromotion()"><div class="ac-ico">⬆️</div><div class="ac-lbl">Promotion</div><div class="ac-sub">Need yrs + honor</div></div>
        <div class="act-card" onclick="Military.seekTherapy()"><div class="ac-ico">🧠</div><div class="ac-lbl">Therapy</div><div class="ac-sub">Reduce PTSD</div></div>
      </div>`;

      if (mil.branchId === 'specops') {
        h += `<div class="sec">🎯 Special Ops Missions</div><div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">`;
        this.SPEC_OPS_MISSIONS.forEach(m => {
          h += `<div class="row-card" onclick="Military.runSpecOps('${m.id}')">
            <span class="ri" style="font-size:20px">${m.icon}</span>
            <div class="rd"><div class="rt">${this._esc(m.label)}</div><div class="rs">+${fmt(m.reward)} · ${Math.round(m.risk * 100)}% fail risk</div></div>
          </div>`;
        });
        h += `</div>`;
      }

      if (mil.benefits?.education) {
        h += `<div class="row-card" onclick="Military.useGiBill()" style="border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.06)">
          <span class="ri">🎓</span><div class="rd"><div class="rt" style="color:var(--yellow)">Use GI Bill — Free University</div><div class="rs">Education benefit unlocked</div></div>
        </div>`;
      }

      h += `<div class="row-card" style="margin-top:12px;border-color:rgba(239,68,68,.3)" onclick="Military.discharge(true)">
        <span class="ri">🎖️</span><div class="rd"><div class="rt">Honorable Discharge</div><div class="rs">${(mil.yearsServed || 0) >= 20 ? 'Pension unlocks at 20 yrs ✓' : `${20 - (mil.yearsServed || 0)} yrs until pension`}</div></div>
      </div>`;

    } else if (mil.discharged) {
      h += `<div style="background:rgba(100,116,139,.08);border:1px solid rgba(100,116,139,.3);border-radius:12px;padding:14px;margin-bottom:14px;text-align:center">
        <div style="font-size:28px;margin-bottom:6px">🎖️</div>
        <div style="font-weight:700">Veteran — ${(mil.yearsServed || 0)} years served</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">${mil.benefits?.pension > 0 ? `Pension: ${fmt(mil.benefits.pension)}/yr` : 'No pension (under 20 yrs)'}</div>
      </div>`;
      if ((mil.ptsd || 0) > 10) {
        h += `<div class="act-card" style="margin-bottom:12px" onclick="Military.seekTherapy()"><div class="ac-ico">🧠</div><div class="ac-lbl">Veteran Therapy</div><div class="ac-sub">PTSD: ${mil.ptsd}</div></div>`;
      }
    } else {
      // Enlistment screen
      h += `<div style="text-align:center;padding:16px 0 8px"><div style="font-size:32px">🎖️</div><div style="font-size:15px;font-weight:700;margin-top:6px">Join the Military</div><div style="font-size:12px;color:var(--muted);margin-top:4px">Ages 18–35 · Fitness requirement varies by branch</div></div>`;
      const age = G.age || 0;
      if (age < 18 || age > 35) {
        h += `<div class="empty"><p>Military enlistment is only available ages 18–35.</p></div>`;
      } else {
        h += `<div class="sec">Choose Your Branch</div><div style="display:flex;flex-direction:column;gap:8px">`;
        this.BRANCHES.forEach(b => {
          const canJoin = (G.fitness || 50) >= b.fitnessReq;
          const canJoinOfficer = canJoin && (G.education || '') === 'university';
          h += `<div class="row-card${canJoin ? '' : ' locked'}" style="${canJoin ? '' : 'opacity:.5'}">
            <span class="ri" style="font-size:22px">${b.icon}</span>
            <div class="rd">
              <div class="rt">${this._esc(b.name)}</div>
              <div class="rs">${fmt(salaryScale(b.salary, G))}/yr · Fitness ${b.fitnessReq}+ · ${this._esc(b.desc)}</div>
            </div>
            ${canJoin ? `<div style="display:flex;flex-direction:column;gap:4px">
              <button class="act-btn" style="font-size:11px;padding:4px 8px" onclick="Military.enlist('${b.id}',false)">Enlist</button>
              ${canJoinOfficer ? `<button class="act-btn" style="font-size:11px;padding:4px 8px;background:rgba(251,191,36,.15)" onclick="Military.enlist('${b.id}',true)">Officer</button>` : ''}
            </div>` : `<span style="font-size:11px;color:var(--muted)">Need ${b.fitnessReq} Fit</span>`}
          </div>`;
        });
        h += `</div>`;
      }
    }

    el.innerHTML = h;
  },
};