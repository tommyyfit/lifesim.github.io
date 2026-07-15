/* js/sports.js — LifeSim module */
'use strict';

const Sports = {
  VERSION:1,

  SPORTS_LIST: [
    { id:'football',   name:'Football',        icon:'⚽', type:'team',   statKey:'fitness',  smarts:20, fitnessReq:55, minAge:18, maxRetire:35, peakAge:[22,30], baseSalary:45000,   starSalary:2800000, desc:'The beautiful game. Global fame awaits the elite.' },
    { id:'basketball', name:'Basketball',       icon:'🏀', type:'team',   statKey:'fitness',  smarts:30, fitnessReq:58, minAge:18, maxRetire:38, peakAge:[22,32], baseSalary:55000,   starSalary:4500000, desc:'Court craft and teamwork, rewarded in millions.' },
    { id:'tennis',     name:'Tennis',           icon:'🎾', type:'solo',   statKey:'fitness',  smarts:40, fitnessReq:52, minAge:18, maxRetire:40, peakAge:[20,32], baseSalary:35000,   starSalary:3200000, desc:'Solo, mental, global. The most international sport.' },
    { id:'boxing',     name:'Boxing',           icon:'🥊', type:'combat', statKey:'fitness',  smarts:35, fitnessReq:65, minAge:18, maxRetire:38, peakAge:[24,34], baseSalary:30000,   starSalary:5000000, desc:'The sweet science. Pain and glory in equal measure.' },
    { id:'swimming',   name:'Swimming',         icon:'🏊', type:'solo',   statKey:'fitness',  smarts:30, fitnessReq:50, minAge:18, maxRetire:32, peakAge:[18,28], baseSalary:20000,   starSalary:800000,  desc:'Speed in the water. Olympic dreams start in the lane.' },
    { id:'athletics',  name:'Track & Field',    icon:'🏃', type:'solo',   statKey:'fitness',  smarts:25, fitnessReq:60, minAge:18, maxRetire:34, peakAge:[20,30], baseSalary:18000,   starSalary:600000,  desc:'Pure speed and power. The oldest sport in the Games.' },
    { id:'golf',       name:'Golf',             icon:'⛳', type:'solo',   statKey:'smarts',   smarts:50, fitnessReq:35, minAge:18, maxRetire:55, peakAge:[28,45], baseSalary:40000,   starSalary:2200000, desc:'The gentleman\'s grind. Longevity and precision rewarded.' },
    { id:'mma',        name:'MMA / UFC',        icon:'🥋', type:'combat', statKey:'fitness',  smarts:40, fitnessReq:70, minAge:18, maxRetire:38, peakAge:[25,35], baseSalary:35000,   starSalary:3500000, desc:'Every discipline. One cage. The pinnacle of combat.' },
    { id:'rugby',      name:'Rugby',            icon:'🏉', type:'team',   statKey:'fitness',  smarts:30, fitnessReq:65, minAge:18, maxRetire:36, peakAge:[22,32], baseSalary:40000,   starSalary:1200000, desc:'Raw power and strategy. Brotherhood on the pitch.' },
    { id:'esports',    name:'Esports / Gaming', icon:'🎮', type:'solo',   statKey:'smarts',   smarts:65, fitnessReq:20, minAge:18, maxRetire:28, peakAge:[16,24], baseSalary:30000,   starSalary:1500000, desc:'The new arena. Reflexes and strategy at inhuman speed.' },
  ],

  TIERS: [
    { id:'amateur',  label:'Amateur',      icon:'🌱', mult:0.02,  fameGain:1,  trainBonus:3, injuryRisk:0.06 },
    { id:'semipro',  label:'Semi-Pro',     icon:'🌿', mult:0.12,  fameGain:3,  trainBonus:4, injuryRisk:0.08 },
    { id:'pro',      label:'Professional', icon:'⭐', mult:0.4,   fameGain:8,  trainBonus:5, injuryRisk:0.10 },
    { id:'star',     label:'Star',         icon:'🌟', mult:1.0,   fameGain:15, trainBonus:6, injuryRisk:0.12 },
    { id:'legend',   label:'Legend',       icon:'👑', mult:2.5,   fameGain:25, trainBonus:7, injuryRisk:0.14 },
  ],

  COMPETITIONS: [
    { id:'local',      name:'Local Tournament', icon:'🏅', tier:'amateur',  reward:r(500,2000),   fame:3,  winChance:0.6 },
    { id:'regional',   name:'Regional League',  icon:'🥈', tier:'semipro',  reward:r(2000,8000),  fame:6,  winChance:0.5 },
    { id:'national',   name:'National Cup',     icon:'🥇', tier:'pro',      reward:r(8000,35000), fame:12, winChance:0.45 },
    { id:'intl',       name:'International',    icon:'🌍', tier:'star',     reward:r(35000,150000),fame:22, winChance:0.4 },
    { id:'world',      name:'World Championship',icon:'🏆',tier:'legend',   reward:r(150000,800000),fame:40,winChance:0.35 },
  ],

  INJURY_EVENTS: [
    { icon:'🦵', text:'You pulled a hamstring. Out for rest of season.', skillLoss:5, happLoss:8, recovery:true },
    { icon:'🦴', text:'Stress fracture sidelined you for months.', skillLoss:8, happLoss:10, recovery:true },
    { icon:'🧠', text:'Concussion protocol put you on the shelf.', skillLoss:3, happLoss:5, mentalLoss:5, recovery:true },
    { icon:'💪', text:'Shoulder dislocation during competition.', skillLoss:6, happLoss:8, recovery:true },
    { icon:'🏥', text:'Torn ligament — career-threatening injury.', skillLoss:15, happLoss:15, recovery:true, severe:true },
  ],

  _esc(v) { return typeof escHTML === 'function' ? escHTML(v) : String(v ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); },


  _adultOnly(G = window.G) {
    if (!G || (G.age || 0) < 18) {
      if (typeof UI !== 'undefined' && UI?.toast) UI.toast('Professional sports unlock at age 18. Use Activities and Talents for youth sport.', 'neutral');
      return false;
    }
    return true;
  },

  _ensure(G = window.G) {
    if (!G) return;
    if (!G.sports) G.sports = { career: null, sportId: null, tierId: 'amateur', skill: 0, totalEarnings: 0, trophies: 0, retired: false, injured: false, recoveryAge: 0, sportActionYear: -1, sportActionUses: {} };
    if (!G.sports.sportActionUses) G.sports.sportActionUses = {};
    if (!Number.isFinite(G.sports.sportActionYear)) G.sports.sportActionYear = -1;
    if (G.sports.sportActionYear !== (G.age || 0)) { G.sports.sportActionYear = G.age || 0; G.sports.sportActionUses = {}; }
  },

  _canAct(key, limit = 2) {
    const G = window.G; if (!G) return false;
    this._ensure(G);
    const used = G.sports.sportActionUses[key] || 0;
    if (used >= limit) { UI.toast('You\'ve already done that this year. Age Up to continue.', 'bad'); return false; }
    return true;
  },
  _markAct(key) { const G = window.G; if (!G) return; this._ensure(G); G.sports.sportActionUses[key] = (G.sports.sportActionUses[key] || 0) + 1; },

  _sport(G = window.G) { return this.SPORTS_LIST.find(s => s.id === G?.sports?.sportId); },
  _tier(G = window.G) { return this.TIERS.find(t => t.id === G?.sports?.tierId) || this.TIERS[0]; },
  _tierIdx(G = window.G) { return this.TIERS.findIndex(t => t.id === G?.sports?.tierId); },

  _salary(G = window.G) {
    const sport = this._sport(G); const tier = this._tier(G);
    if (!sport || !tier) return 0;
    return salaryScale(Math.round(sport.starSalary * tier.mult), G);
  },

  _isAtPeak(G = window.G) {
    const sport = this._sport(G); if (!sport) return false;
    const age = G.age || 0;
    return age >= sport.peakAge[0] && age <= sport.peakAge[1];
  },

  startCareer(sportId) {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (G.sports.career) { UI.toast('You\'re already in a sports career.', 'bad'); return; }
    const sport = this.SPORTS_LIST.find(s => s.id === sportId); if (!sport) return;
    const age = G.age || 0;
    if (age < sport.minAge) { UI.toast(`${sport.name} minimum age is ${sport.minAge}.`, 'bad'); return; }
    if ((G.fitness || 50) < sport.fitnessReq) { UI.toast(`Need ${sport.fitnessReq} Fitness for ${sport.name}.`, 'bad'); return; }
    if ((G.smarts || 50) < sport.smarts) { UI.toast(`Need ${sport.smarts} Smarts for ${sport.name}.`, 'bad'); return; }
    if (G.career) { UI.toast('Quit your current job first to go pro.', 'bad'); return; }

    G.sports.sportId = sportId;
    G.sports.tierId = 'amateur';
    G.sports.skill = Math.round((G.fitness || 50) * 0.6 + (G.smarts || 50) * 0.4);
    G.sports.career = true;
    G.sports.retired = false;
    Engine.log(`${sport.icon} Started ${sport.name} career as an Amateur!`, 'special');
    UI.toast(`${sport.icon} Welcome to ${sport.name}!`, 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  train() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!G.sports.career || G.sports.retired) return;
    if (G.sports.injured) { UI.toast('You\'re injured! Rest before training.', 'bad'); return; }
    if (!this._canAct('train')) return;
    this._markAct('train');
    const sport = this._sport(G); const tier = this._tier(G);
    const skillGain = tier.trainBonus + r(1, 4) + (this._isAtPeak(G) ? 3 : 0);
    G.sports.skill = cl((G.sports.skill || 0) + skillGain, 0, 100);
    G.fitness = cl((G.fitness || 50) + r(1, 3));
    G.stress = cl((G.stress || 0) + 4, 0, 100);
    const cost = sc(500, G);
    G.money = Math.max(0, (G.money || 0) - cost);
    Engine.log(`🏋️ ${sport?.name || 'Sports'} training session. Skill +${skillGain}`, 'health');
    UI.toast(`🏋️ Training complete! Skill +${skillGain}`, 'good');
    // Tier up check
    this._checkPromotion(G);
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  compete(compId) {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!G.sports.career || G.sports.retired) return;
    if (G.sports.injured) { UI.toast('Can\'t compete while injured!', 'bad'); return; }
    if (!this._canAct('compete')) return;
    this._markAct('compete');
    const comp = this.COMPETITIONS.find(c => c.id === compId); if (!comp) return;
    const tierIdx = this._tierIdx(G);
    const compTierIdx = this.TIERS.findIndex(t => t.id === comp.tier);
    if (tierIdx < compTierIdx) { UI.toast(`This competition requires ${comp.tier} tier or higher.`, 'bad'); return; }
    const sport = this._sport(G);
    const skill = G.sports.skill || 0;
    const skillBonus = (skill - 50) * 0.005;
    const peakBonus = this._isAtPeak(G) ? 0.06 : 0;
    const winChance = Math.min(0.8, comp.winChance + skillBonus + peakBonus);

    // Injury risk during competition
    const tier = this._tier(G);
    if (Math.random() < tier.injuryRisk) {
      const ev = pick(this.INJURY_EVENTS);
      if (ev) {
        G.sports.skill = cl((G.sports.skill || 0) - ev.skillLoss, 0, 100);
        G.happiness = cl((G.happiness || 50) - ev.happLoss);
        if (ev.mentalLoss) G.mentalHealth = cl((G.mentalHealth || 60) - ev.mentalLoss);
        if (ev.recovery) { G.sports.injured = true; G.sports.recoveryAge = (G.age || 0) + 1; }
        Engine.log(`${ev.icon} ${ev.text}`, 'bad');
        UI.toast(`${ev.icon} ${ev.text}`, 'bad');
        if (typeof Save !== 'undefined') Save.autosave(G);
        UI.refreshActiveTab();
        return;
      }
    }

    if (Math.random() < winChance) {
      const reward = comp.reward;
      G.money += reward;
      G.sports.totalEarnings = (G.sports.totalEarnings || 0) + reward;
      G.sports.trophies = (G.sports.trophies || 0) + 1;
      G.fame = cl((G.fame || 0) + comp.fame);
      G.happiness = cl((G.happiness || 50) + 6);
      Engine.log(`${comp.icon} WON ${comp.name}! +${fmt(reward)}`, 'special');
      UI.toast(`${comp.icon} Victory! Won ${comp.name}. +${fmt(reward)}`, 'good');
      this._checkPromotion(G);
    } else {
      G.happiness = cl((G.happiness || 50) - 3);
      G.stress = cl((G.stress || 0) + 4, 0, 100);
      Engine.log(`${comp.icon} Lost the ${comp.name}. Better luck next year.`, 'neutral');
      UI.toast(`${comp.icon} You lost this one. Train harder.`, 'bad');
    }
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  hireCoach() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!this._canAct('coach', 1)) return;
    this._markAct('coach');
    const cost = sc(3500, G);
    if ((G.money || 0) < cost) { UI.toast(`Personal coach costs ${fmt(cost)}.`, 'bad'); return; }
    G.money -= cost;
    const gain = r(5, 12);
    G.sports.skill = cl((G.sports.skill || 0) + gain, 0, 100);
    G.smarts = cl((G.smarts || 50) + r(1, 3));
    Engine.log(`🧑‍🏫 Hired a personal coach. Skill +${gain}`, 'career');
    UI.toast(`🧑‍🏫 Personal coach hired. Skill +${gain}`, 'good');
    this._checkPromotion(G);
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  rest() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!G.sports.injured) { UI.toast('You\'re not injured.', 'neutral'); return; }
    if (!this._canAct('rest', 1)) return;
    this._markAct('rest');
    G.sports.injured = false;
    G.health = cl((G.health || 60) + r(4, 10));
    G.sports.skill = cl((G.sports.skill || 0) + r(1, 3), 0, 100);
    Engine.log('🛌 Rested and recovered from injury.', 'health');
    UI.toast('🛌 Fully recovered! Back in action.', 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  retire() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._adultOnly(G)) return;
    if (!G.sports.career || G.sports.retired) return;
    const sport = this._sport(G);
    G.sports.retired = true;
    G.sports.career = false;
    const tier = this._tier(G);
    G.fame = cl((G.fame || 0) + (G.sports.trophies || 0) * 2);
    Engine.log(`${sport?.icon || '🏅'} Retired from ${sport?.name || 'sport'} as a ${tier.label}. ${G.sports.trophies} trophies, ${fmt(G.sports.totalEarnings)} earned.`, 'special');
    UI.toast(`🏅 Retired from ${sport?.name || 'sport'}! ${tier.icon} ${tier.label}`, 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  _checkPromotion(G) {
    const skill = G.sports.skill || 0;
    const tiers = this.TIERS;
    const thresholds = [0, 35, 55, 72, 88];
    const tierIdx = this._tierIdx(G);
    const nextIdx = tierIdx + 1;
    if (nextIdx < tiers.length && skill >= thresholds[nextIdx]) {
      G.sports.tierId = tiers[nextIdx].id;
      const newTier = tiers[nextIdx];
      Engine.log(`${newTier.icon} Promoted to ${newTier.label}!`, 'special');
      UI.toast(`${newTier.icon} You\'re now a ${newTier.label}!`, 'good');
    }
  },

  tick(G = window.G) {
    if (!G || !G.alive) return;
    this._ensure(G);
    if ((G.age || 0) < 18) return;
    if (!G.sports.career || G.sports.retired) return;
    const sport = this._sport(G);
    if (!sport) return;
    // Annual salary
    const salary = this._salary(G);
    G.money += salary;
    G.sports.totalEarnings = (G.sports.totalEarnings || 0) + salary;
    // Fame gain
    const tier = this._tier(G);
    G.fame = cl((G.fame || 0) + tier.fameGain);
    // Age vs peak — natural skill drift
    const age = G.age || 0;
    if (age > sport.peakAge[1]) {
      const decline = Math.floor((age - sport.peakAge[1]) * 0.8);
      G.sports.skill = cl((G.sports.skill || 0) - decline, 0, 100);
      if (age > sport.maxRetire) {
        Engine.log(`${sport.icon} You're past prime retirement age for ${sport.name}.`, 'neutral');
      }
    } else if (this._isAtPeak(G)) {
      G.sports.skill = cl((G.sports.skill || 0) + r(1, 3), 0, 100);
    }
    // Recovery
    if (G.sports.injured && age >= (G.sports.recoveryAge || age)) {
      G.sports.injured = false;
    }
  },

  render() {
    const G = window.G; if (!G) return;
    this._ensure(G);
    const el = document.getElementById('tab-sports'); if (!el) return;
    if ((G.age || 0) < 18) {
      el.innerHTML = '<div class="empty"><span class="ei">⚽</span><p>Professional sports unlock at age 18. Youth sport belongs in Activities and Talents.</p></div>';
      return;
    }
    const sp = G.sports;
    const sport = this._sport(G);
    const tier = this._tier(G);
    let h = '';

    if (sp.career && sport) {
      const atPeak = this._isAtPeak(G);
      h += `<div style="background:linear-gradient(135deg,rgba(34,197,94,.12),rgba(16,185,129,.08));border:1px solid rgba(34,197,94,.3);border-radius:12px;padding:14px;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <span style="font-size:32px">${sport.icon}</span>
          <div>
            <div style="font-size:15px;font-weight:700">${tier.icon} ${tier.label} ${this._esc(sport.name)}</div>
            <div style="font-size:12px;color:var(--muted)">${fmt(this._salary(G))}/yr · ${sp.trophies || 0} trophies ${atPeak ? '· <span style="color:var(--green)">Peak Years!</span>' : ''}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;font-size:12px;text-align:center">
          <div style="background:var(--b1);border-radius:6px;padding:6px"><div style="font-weight:700;color:var(--teal)">${sp.skill || 0}/100</div><div style="color:var(--muted)">Skill</div></div>
          <div style="background:var(--b1);border-radius:6px;padding:6px"><div style="font-weight:700;color:var(--yellow)">${sp.trophies || 0}</div><div style="color:var(--muted)">Trophies</div></div>
          <div style="background:var(--b1);border-radius:6px;padding:6px"><div style="font-weight:700;color:var(--green)">${fmt(sp.totalEarnings || 0)}</div><div style="color:var(--muted)">Earned</div></div>
        </div>`;

      // Skill bar
      const skillColor = (sp.skill || 0) >= 72 ? 'var(--green)' : (sp.skill || 0) >= 50 ? 'var(--yellow)' : 'var(--orange)';
      h += `<div style="margin-top:8px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:2px"><span>Skill</span><span>${sp.skill}/100</span></div>
        <div style="height:6px;background:var(--b1);border-radius:999px;overflow:hidden"><div style="height:100%;background:${skillColor};width:${sp.skill}%;border-radius:999px;transition:width .3s"></div></div>
      </div>
      </div>`;

      if (sp.injured) {
        h += `<div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:10px;margin-bottom:12px">
          <strong style="color:var(--red)">🤕 Injured!</strong> Rest before competing or training. 
          <button class="act-btn" style="margin-top:6px;width:100%" onclick="Sports.rest()">🛌 Rest & Recover</button>
        </div>`;
      }

      h += `<div class="sec">🏋️ Actions</div><div class="act-grid">
        <div class="act-card${sp.injured ? ' locked' : ''}" onclick="${sp.injured ? '' : 'Sports.train()'}"><div class="ac-ico">🏋️</div><div class="ac-lbl">Train</div><div class="ac-sub">+Skill +Fitness</div></div>
        <div class="act-card${sp.injured ? ' locked' : ''}" onclick="${sp.injured ? '' : 'Sports.hireCoach()'}"><div class="ac-ico">🧑‍🏫</div><div class="ac-lbl">Hire Coach</div><div class="ac-sub">Big skill boost</div></div>
      </div>`;

      h += `<div class="sec">🏆 Compete</div><div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">`;
      this.COMPETITIONS.forEach(comp => {
        const compTierIdx = this.TIERS.findIndex(t => t.id === comp.tier);
        const locked = this._tierIdx(G) < compTierIdx || sp.injured;
        h += `<div class="row-card${locked ? ' locked' : ''}" onclick="${locked ? '' : `Sports.compete('${comp.id}')`}">
          <span class="ri">${comp.icon}</span>
          <div class="rd"><div class="rt">${this._esc(comp.name)}</div><div class="rs">${this._esc(comp.tier)} tier · up to ${fmt(sc(comp.reward*3,G))} · +${comp.fame} Fame</div></div>
        </div>`;
      });
      h += `</div>`;

      const canRetire = (G.age || 0) >= 28 || (G.age || 0) > sport.maxRetire;
      h += `<div class="row-card${canRetire ? '' : ' locked'}" style="border-color:rgba(239,68,68,.3)" onclick="${canRetire ? 'Sports.retire()' : ''}">
        <span class="ri">🏅</span><div class="rd"><div class="rt">Retire</div><div class="rs">${canRetire ? 'End your playing career with grace' : 'Available from age 28'}</div></div>
      </div>`;

    } else if (sp.retired) {
      const retiredSport = this.SPORTS_LIST.find(s => s.id === sp.sportId);
      const retiredTier = this.TIERS.find(t => t.id === sp.tierId) || this.TIERS[0];
      h += `<div style="text-align:center;padding:20px 0;background:rgba(251,191,36,.06);border:1px solid rgba(251,191,36,.2);border-radius:12px;margin-bottom:14px">
        <div style="font-size:36px">${retiredSport?.icon || '🏅'}</div>
        <div style="font-weight:700;font-size:15px;margin:6px 0">${retiredTier.icon} ${retiredTier.label} (Retired)</div>
        <div style="font-size:12px;color:var(--muted)">${sp.trophies || 0} trophies · ${fmt(sp.totalEarnings || 0)} career earnings</div>
      </div>
      <div style="text-align:center;color:var(--muted);font-size:13px">Start a new sport career or enjoy your retirement.</div>`;
      h += this._startScreen(G);
    } else {
      h += `<div style="text-align:center;padding:16px 0 8px"><div style="font-size:32px">⚽</div><div style="font-size:15px;font-weight:700;margin-top:6px">Sports Career</div><div style="font-size:12px;color:var(--muted);margin-top:4px">Choose your sport and chase greatness</div></div>`;
      h += this._startScreen(G);
    }
    el.innerHTML = h;
  },

  _startScreen(G) {
    let h = `<div class="sec">Choose Your Sport</div><div style="display:flex;flex-direction:column;gap:8px">`;
    this.SPORTS_LIST.forEach(sport => {
      const ageOk = (G.age || 0) >= sport.minAge && (G.age || 0) <= sport.maxRetire;
      const fitOk = (G.fitness || 50) >= sport.fitnessReq;
      const smrtOk = (G.smarts || 50) >= sport.smarts;
      const canStart = ageOk && fitOk && smrtOk && !G.career;
      h += `<div class="row-card${canStart ? '' : ' locked'}" style="${canStart ? '' : 'opacity:.6'}" onclick="${canStart ? `Sports.startCareer('${sport.id}')` : ''}">
        <span class="ri" style="font-size:22px">${sport.icon}</span>
        <div class="rd">
          <div class="rt">${this._esc(sport.name)} <span style="font-size:10px;color:var(--muted)">(${sport.type})</span></div>
          <div class="rs">Fit ${sport.fitnessReq}+ · Smarts ${sport.smarts}+ · ${this._esc(sport.desc)}</div>
        </div>
      </div>`;
    });
    h += `</div>`;
    return h;
  },
};