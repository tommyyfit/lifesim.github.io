/* js/travel.js — LifeSim module */
'use strict';

const Travel = {
  VERSION:1,

  DESTINATIONS: [
    { id:'paris',     name:'Paris',         country:'France',       region:'Europe',      cost:2800, icon:'🗼', culture:['french','art','romance'],     bonus:{looks:2,happiness:4},    hiddenChance:0.12 },
    { id:'tokyo',     name:'Tokyo',          country:'Japan',        region:'Asia',        cost:3200, icon:'🗾', culture:['japanese','tech','zen'],        bonus:{smarts:2,happiness:5},   hiddenChance:0.14 },
    { id:'nyc',       name:'New York',       country:'USA',          region:'Americas',    cost:2600, icon:'🗽', culture:['hustle','finance','art'],       bonus:{smarts:3,stress:2},      hiddenChance:0.15 },
    { id:'bali',      name:'Bali',           country:'Indonesia',    region:'Asia',        cost:1400, icon:'🌴', culture:['spiritual','nature','yoga'],    bonus:{mentalHealth:5,stress:-4},hiddenChance:0.10 },
    { id:'dubai',     name:'Dubai',          country:'UAE',          region:'MiddleEast',  cost:3800, icon:'🏙️', culture:['luxury','business','modern'],  bonus:{looks:3,reputation:3},   hiddenChance:0.18 },
    { id:'rio',       name:'Rio de Janeiro', country:'Brazil',       region:'Americas',    cost:1800, icon:'🌟', culture:['carnival','music','beach'],    bonus:{fitness:3,happiness:6},  hiddenChance:0.11 },
    { id:'london',    name:'London',         country:'UK',           region:'Europe',      cost:2900, icon:'🎡', culture:['history','finance','culture'], bonus:{smarts:2,reputation:2},  hiddenChance:0.13 },
    { id:'sydney',    name:'Sydney',         country:'Australia',    region:'Oceania',     cost:3100, icon:'🦘', culture:['outdoor','beach','relaxed'],   bonus:{fitness:3,happiness:4},  hiddenChance:0.09 },
    { id:'rome',      name:'Rome',           country:'Italy',        region:'Europe',      cost:2500, icon:'🏛️', culture:['history','food','art'],        bonus:{happiness:5,looks:1},    hiddenChance:0.10 },
    { id:'bangkok',   name:'Bangkok',        country:'Thailand',     region:'Asia',        cost:1200, icon:'🏯', culture:['street_food','temples','buzz'],bonus:{happiness:4,stress:-2},  hiddenChance:0.16 },
    { id:'capetown',  name:'Cape Town',      country:'S. Africa',    region:'Africa',      cost:1600, icon:'🌍', culture:['nature','history','diverse'],  bonus:{happiness:4,fitness:2},  hiddenChance:0.12 },
    { id:'marrakech', name:'Marrakech',      country:'Morocco',      region:'Africa',      cost:1300, icon:'🕌', culture:['markets','spice','history'],   bonus:{smarts:2,happiness:3},   hiddenChance:0.11 },
    { id:'iceland',   name:'Reykjavik',      country:'Iceland',      region:'Europe',      cost:3400, icon:'🌋', culture:['aurora','nature','wellness'],  bonus:{mentalHealth:6,stress:-5},hiddenChance:0.08 },
    { id:'maldives',  name:'Maldives',       country:'Maldives',     region:'Asia',        cost:5200, icon:'🏝️', culture:['luxury','ocean','relaxation'],bonus:{happiness:7,stress:-6},  hiddenChance:0.07 },
    { id:'seoul',     name:'Seoul',          country:'South Korea',  region:'Asia',        cost:2400, icon:'🎎', culture:['kpop','tech','food'],          bonus:{looks:3,smarts:2},        hiddenChance:0.13 },
    { id:'barcelona', name:'Barcelona',      country:'Spain',        region:'Europe',      cost:2300, icon:'🎨', culture:['art','beach','nightlife'],     bonus:{happiness:5,looks:2},    hiddenChance:0.12 },
    { id:'buenos',    name:'Buenos Aires',   country:'Argentina',    region:'Americas',    cost:1500, icon:'💃', culture:['tango','beef','culture'],     bonus:{happiness:4,fitness:2},  hiddenChance:0.10 },
    { id:'mumbai',    name:'Mumbai',         country:'India',        region:'Asia',        cost:1100, icon:'🙏', culture:['bollywood','food','chaos'],    bonus:{smarts:2,happiness:3},   hiddenChance:0.17 },
    { id:'lisbon',    name:'Lisbon',         country:'Portugal',     region:'Europe',      cost:2000, icon:'🐟', culture:['fado','pastry','history'],     bonus:{happiness:4,stress:-3},  hiddenChance:0.09 },
    { id:'phuket',    name:'Phuket',         country:'Thailand',     region:'Asia',        cost:1300, icon:'🐘', culture:['beach','party','temples'],     bonus:{happiness:5,stress:-3},  hiddenChance:0.14 },
  ],

  HIDDEN_EVENTS: [
    { id:'startup_idea',    icon:'💡', text:'While exploring {dest}, you meet an entrepreneur who sparks a game-changing business idea.', effect:{smarts:3,karma:2}, log:'Got a startup idea in {dest}' },
    { id:'romance_abroad',  icon:'💕', text:'You fall into a whirlwind romance in {dest}. It may not last, but it will never leave you.', effect:{happiness:8,stress:-3}, log:'Had a romance in {dest}' },
    { id:'pickpocketed',    icon:'🦹', text:'A skilled pickpocket targets you in {dest}. You lose some cash but gain hard-won wisdom.', effect:{money:-800,smarts:1}, log:'Got pickpocketed in {dest}' },
    { id:'art_inspiration', icon:'🎨', text:'The art scene in {dest} ignites something in you. Your creativity has been permanently elevated.', effect:{happiness:5,smarts:2}, log:'Found artistic inspiration in {dest}' },
    { id:'food_poisoning',  icon:'🤢', text:'Street food in {dest} hits your stomach hard. You spend two days ill but recover fully.', effect:{health:-3,happiness:-2,stress:3}, log:'Got food poisoning in {dest}' },
    { id:'new_connection',  icon:'🤝', text:'You build an unexpected professional connection in {dest} — a contact that could open doors.', effect:{reputation:4,smarts:2}, log:'Made a key connection in {dest}' },
    { id:'spiritual_moment',icon:'✨', text:'Something shifts in you in {dest}. A moment of clarity you didn\'t see coming.', effect:{mentalHealth:7,happiness:4,stress:-4}, log:'Had a spiritual moment in {dest}' },
    { id:'lost_wallet',     icon:'👛', text:'You lose your wallet in {dest}. A kind local helps you out — restoring your faith in humanity.', effect:{money:-300,karma:3,happiness:2}, log:'Lost wallet, found kindness in {dest}' },
    { id:'bar_fight',       icon:'🥊', text:'A heated argument in a {dest} bar gets physical. You walk away bruised and wiser.', effect:{health:-4,fitness:2,stress:5}, log:'Got into a bar fight in {dest}' },
    { id:'local_friend',    icon:'👫', text:'You befriend a local in {dest} who shows you a side of the city no tourist ever sees.', effect:{happiness:6,smarts:2,karma:3}, log:'Made a local friend in {dest}' },
  ],

  EXPAT_JOBS: [
    { id:'teach_english', icon:'📚', name:'Teach English Abroad', minSmarts:40, salary:18000,  stress:3, happiness:4, desc:'Teach English as a foreign language, immerse in local culture.' },
    { id:'remote_work',   icon:'💻', name:'Work Remotely',         minSmarts:55, salary:45000,  stress:5, happiness:5, desc:'Keep your current income, experience a new country.' },
    { id:'digital_nomad', icon:'🌐', name:'Digital Nomad',         minSmarts:50, salary:35000,  stress:4, happiness:7, desc:'Freelance while hopping between cities.' },
    { id:'ngo_worker',    icon:'❤️', name:'NGO / Aid Worker',       minSmarts:45, salary:22000,  stress:8, happiness:8, desc:'Serve communities abroad. High purpose, modest pay.' },
    { id:'tour_guide',    icon:'🗺️', name:'Tour Guide',             minSmarts:35, salary:15000,  stress:4, happiness:6, desc:'Lead groups through your adopted homeland.' },
  ],

  _esc(v) { return typeof escHTML === 'function' ? escHTML(v) : String(v ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c])); },


  _adultOnly(G = window.G) {
    if (!G || (G.age || 0) < 18) {
      if (typeof UI !== 'undefined' && UI?.toast) UI.toast('Independent travel unlocks at age 18.', 'neutral');
      return false;
    }
    return true;
  },

  _ensure(G = window.G) {
    if (!G) return;
    if (!G.travel) G.travel = { passportStamps: [], totalTrips: 0, expat: null, expatYears: 0, culturalPoints: 0, travelActionYear: -1, travelActionUses: {} };
    if (!Array.isArray(G.travel.passportStamps)) G.travel.passportStamps = [];
    if (!Number.isFinite(G.travel.totalTrips)) G.travel.totalTrips = 0;
    if (!Number.isFinite(G.travel.culturalPoints)) G.travel.culturalPoints = 0;
    if (!Number.isFinite(G.travel.expatYears)) G.travel.expatYears = 0;
    if (!G.travel.travelActionUses) G.travel.travelActionUses = {};
    if (!Number.isFinite(G.travel.travelActionYear)) G.travel.travelActionYear = -1;
    if (G.travel.travelActionYear !== (G.age || 0)) { G.travel.travelActionYear = G.age || 0; G.travel.travelActionUses = {}; }
  },

  _canAct(key, limit = 1) {
    const G = window.G; if (!G) return false;
    this._ensure(G);
    const used = G.travel.travelActionUses[key] || 0;
    if (used >= limit) { UI.toast('You\'ve already done that this year — Age Up to travel again.', 'bad'); return false; }
    return true;
  },
  _markAct(key) { const G = window.G; if (!G) return; this._ensure(G); G.travel.travelActionUses[key] = (G.travel.travelActionUses[key] || 0) + 1; },

  _destById(id) { return this.DESTINATIONS.find(d => d.id === id); },

  _tripCostScale(dest, type) {
    const base = dest.cost;
    if (type === 'budget') return Math.round(base * 0.55);
    if (type === 'luxury') return Math.round(base * 2.2);
    return base; // standard
  },

  takeTripUI(destId, type = 'standard') {
    const G = window.G; if (!G || !G.alive) return;
    if (!this._adultOnly(G)) return;
    if (!this._canAct('trip')) return;
    const dest = this._destById(destId); if (!dest) return;
    this._ensure(G);
    const cost = sc(this._tripCostScale(dest, type), G);
    if ((G.money || 0) < cost) { UI.toast(`You need ${fmt(cost)} for this trip.`, 'bad'); return; }
    G.money -= cost;
    this._markAct('trip');
    G.travel.totalTrips++;
    if (!G.travel.passportStamps.includes(destId)) G.travel.passportStamps.push(destId);
    G.travel.culturalPoints = (G.travel.culturalPoints || 0) + (type === 'luxury' ? 4 : type === 'budget' ? 2 : 3);

    // Apply bonuses
    const bonus = dest.bonus || {};
    if (bonus.happiness) G.happiness = cl((G.happiness || 50) + bonus.happiness);
    if (bonus.smarts) G.smarts = cl((G.smarts || 50) + bonus.smarts);
    if (bonus.looks) G.looks = cl((G.looks || 50) + bonus.looks);
    if (bonus.fitness) G.fitness = cl((G.fitness || 50) + bonus.fitness);
    if (bonus.stress) G.stress = cl((G.stress || 0) + bonus.stress, 0, 100);
    if (bonus.mentalHealth) G.mentalHealth = cl((G.mentalHealth || 60) + bonus.mentalHealth);
    if (bonus.reputation) G.reputation = cl((G.reputation || 50) + bonus.reputation);

    Engine.log(`✈️ Visited ${dest.icon} ${dest.name}, ${dest.country}!`, 'special');

    // Hidden event check
    if (Math.random() < dest.hiddenChance) {
      const ev = pick(this.HIDDEN_EVENTS);
      if (ev) {
        const text = ev.text.replace(/{dest}/g, dest.name);
        const logText = ev.log.replace(/{dest}/g, dest.name);
        const eff = ev.effect || {};
        if (eff.money) G.money = Math.max(0, G.money + eff.money);
        if (eff.smarts) G.smarts = cl((G.smarts || 50) + eff.smarts);
        if (eff.happiness) G.happiness = cl((G.happiness || 50) + eff.happiness);
        if (eff.health) G.health = cl((G.health || 60) + eff.health);
        if (eff.stress) G.stress = cl((G.stress || 0) + eff.stress, 0, 100);
        if (eff.mentalHealth) G.mentalHealth = cl((G.mentalHealth || 60) + eff.mentalHealth);
        if (eff.karma) G.karma = cl((G.karma || 0) + eff.karma, -100, 100);
        if (eff.reputation) G.reputation = cl((G.reputation || 50) + eff.reputation);
        Engine.log(`${ev.icon} ${logText}`, 'special');
        UI.toast(`${ev.icon} ${text}`, 'good');
      }
    }

    UI.toast(`✈️ ${type === 'luxury' ? 'Luxury trip' : type === 'budget' ? 'Budget adventure' : 'Trip'} to ${dest.name}! —${fmt(cost)}`, 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  goExpat(destId, jobId) {
    const G = window.G; if (!G || !G.alive) return;
    if (!this._adultOnly(G)) return;
    if (!this._canAct('expat')) return;
    const dest = this._destById(destId); if (!dest) return;
    const job = this.EXPAT_JOBS.find(j => j.id === jobId); if (!job) return;
    this._ensure(G);
    if ((G.smarts || 50) < job.minSmarts) { UI.toast(`You need ${job.minSmarts} Smarts for that expat role.`, 'bad'); return; }
    if ((G.age || 0) < 20) { UI.toast('You need to be at least 20 to live abroad.', 'bad'); return; }
    this._markAct('expat');
    G.travel.expat = { destId, jobId, destName: dest.name, jobName: job.name, startAge: G.age };
    if (!G.travel.passportStamps.includes(destId)) G.travel.passportStamps.push(destId);
    Engine.log(`🌍 Moved abroad to ${dest.name} as a ${job.name}.`, 'special');
    UI.toast(`🌍 You\'re now living in ${dest.name}!`, 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  returnHome() {
    const G = window.G; if (!G || !G.alive) return;
    if (!this._adultOnly(G)) return;
    this._ensure(G);
    if (!G.travel.expat) return;
    const dest = this._destById(G.travel.expat.destId);
    const years = (G.age || 0) - (G.travel.expat.startAge || G.age);
    G.travel.expatYears = (G.travel.expatYears || 0) + years;
    G.travel.culturalPoints = (G.travel.culturalPoints || 0) + Math.floor(years * 2);
    Engine.log(`🏠 Returned home after ${years} year${years !== 1 ? 's' : ''} in ${dest ? dest.name : 'abroad'}.`, 'neutral');
    UI.toast('🏠 Welcome back home!', 'neutral');
    G.travel.expat = null;
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  tick(G = window.G) {
    if (!G || !G.alive) return;
    this._ensure(G);
    if ((G.age || 0) < 18) return;
    const expat = G.travel.expat;
    if (expat) {
      const job = this.EXPAT_JOBS.find(j => j.id === expat.jobId);
      if (job) {
        G.money += salaryScale(job.salary, G);
        G.happiness = cl((G.happiness || 50) + job.happiness * 0.4);
        G.stress = cl((G.stress || 0) + job.stress * 0.3, 0, 100);
        G.travel.expatYears = (G.travel.expatYears || 0) + 0.1;
      }
      G.travel.culturalPoints = (G.travel.culturalPoints || 0) + 2;
      // Language skill boost from expat life
      if (G.skills && Math.random() < 0.3) {
        const lang = G.skills.language || 0;
        if (lang < 5) G.skills.language = lang + 1;
      }
    }
  },

  _passportTier(stamps) {
    if (stamps >= 20) return { label: 'Legendary Explorer', icon: '🌐', color: 'var(--gold)' };
    if (stamps >= 15) return { label: 'World Traveler', icon: '✈️', color: 'var(--green)' };
    if (stamps >= 10) return { label: 'Globetrotter', icon: '🗺️', color: 'var(--teal)' };
    if (stamps >= 5)  return { label: 'Adventurer', icon: '🧳', color: 'var(--yellow)' };
    if (stamps >= 2)  return { label: 'Wanderer', icon: '🗿', color: 'var(--muted)' };
    return { label: 'Homebody', icon: '🏠', color: 'var(--muted)' };
  },

  render() {
    const G = window.G; if (!G) return;
    this._ensure(G);
    const el = document.getElementById('tab-travel'); if (!el) return;
    if ((G.age || 0) < 18) {
      el.innerHTML = '<div class="empty"><span class="ei">✈️</span><p>Independent travel unlocks at age 18. Childhood travel appears through family life events.</p></div>';
      return;
    }
    const t = G.travel;
    const stamps = t.passportStamps.length;
    const tier = this._passportTier(stamps);
    const isExpat = !!t.expat;

    let h = `<div class="travel-header" style="background:linear-gradient(135deg,rgba(14,165,233,.12),rgba(6,182,212,.08));border:1px solid rgba(14,165,233,.25);border-radius:12px;padding:14px;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:28px">✈️</span>
        <div>
          <div style="font-size:15px;font-weight:700">${tier.icon} ${tier.label}</div>
          <div style="font-size:12px;color:var(--muted)">${stamps} countries visited · ${t.totalTrips} trips taken · ${t.culturalPoints} cultural points</div>
        </div>
      </div>`;

    if (stamps > 0) {
      h += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">`;
      t.passportStamps.forEach(id => {
        const d = this._destById(id);
        if (d) h += `<span style="font-size:18px" title="${this._esc(d.name)}">${d.icon}</span>`;
      });
      h += `</div>`;
    }
    h += `</div>`;

    // Expat status
    if (isExpat) {
      const expatDest = this._destById(t.expat.destId);
      const job = this.EXPAT_JOBS.find(j => j.id === t.expat.jobId);
      const expatYrs = (G.age || 0) - (t.expat.startAge || G.age);
      h += `<div style="background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.3);border-radius:10px;padding:12px;margin-bottom:14px">
        <div style="font-weight:700;color:var(--green);margin-bottom:4px">🌍 Living Abroad</div>
        <div style="font-size:13px">${expatDest ? expatDest.icon + ' ' + expatDest.name : 'Abroad'} · ${job ? job.name : ''}</div>
        <div style="font-size:12px;color:var(--muted)">${expatYrs} year${expatYrs !== 1 ? 's' : ''} away · ${fmt(salaryScale(job?.salary || 0, G))}/yr income</div>
        <button class="act-btn" style="margin-top:8px;background:rgba(239,68,68,.1);border-color:rgba(239,68,68,.4);color:var(--red);width:100%" onclick="Travel.returnHome()">🏠 Return Home</button>
      </div>`;
    }

    // Expat options (if not expat)
    if (!isExpat && (G.age || 0) >= 20) {
      h += `<div class="sec">🌍 Live Abroad</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:14px">`;
      this.EXPAT_JOBS.forEach(job => {
        const locked = (G.smarts || 50) < job.minSmarts;
        h += `<div class="row-card${locked ? ' locked' : ''}" onclick="${locked ? '' : `Travel._expatPick('${job.id}')`}">
          <span class="ri">${job.icon}</span>
          <div class="rd"><div class="rt">${this._esc(job.name)}</div><div class="rs">${fmt(salaryScale(job.salary, G))}/yr · Smarts ${job.minSmarts}+</div></div>
        </div>`;
      });
      h += `</div>`;
    }

    // Destination tabs by region
    const regions = [...new Set(this.DESTINATIONS.map(d => d.region))];
    h += `<div class="sec">🗺️ Destinations</div>`;

    regions.forEach(region => {
      const dests = this.DESTINATIONS.filter(d => d.region === region);
      h += `<div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin:8px 0 4px">${region}</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-bottom:8px">`;
      dests.forEach(dest => {
        const visited = t.passportStamps.includes(dest.id);
        const stdCost = sc(dest.cost, G);
        const canAfford = (G.money || 0) >= stdCost;
        h += `<div class="row-card${visited ? '' : ''}" style="${visited ? 'border-color:rgba(16,185,129,.3);background:rgba(16,185,129,.04)' : ''}" onclick="Travel._tripPick('${dest.id}')">
          <span class="ri" style="font-size:20px">${dest.icon}</span>
          <div class="rd">
            <div class="rt" style="font-size:13px">${this._esc(dest.name)} ${visited ? '✓' : ''}</div>
            <div class="rs" style="font-size:11px">${this._esc(dest.country)} · from ${fmt(sc(this._tripCostScale(dest, 'budget'), G))}</div>
          </div>
        </div>`;
      });
      h += `</div>`;
    });

    el.innerHTML = h;
  },

  _tripPick(destId) {
    const G = window.G; if (!G) return;
    const dest = this._destById(destId); if (!dest) return;
    const budget = sc(this._tripCostScale(dest, 'budget'), G);
    const standard = sc(dest.cost, G);
    const luxury = sc(this._tripCostScale(dest, 'luxury'), G);

    UI.openModal(document.getElementById('ev-modal'));
    document.getElementById('m-ico').textContent = dest.icon;
    document.getElementById('m-title').textContent = `Travel to ${dest.name}`;
    document.getElementById('m-text').textContent = `${dest.country} · ${dest.culture?.join(', ')} · Hidden events possible`;
    const c = document.getElementById('m-choices');
    c.innerHTML = `
      <button class="choice-btn" onclick="UI.closeAnyModal();Travel.takeTripUI('${destId}','budget')">🎒 Budget Trip (${fmt(budget)})</button>
      <button class="choice-btn" onclick="UI.closeAnyModal();Travel.takeTripUI('${destId}','standard')">✈️ Standard Trip (${fmt(standard)})</button>
      <button class="choice-btn" onclick="UI.closeAnyModal();Travel.takeTripUI('${destId}','luxury')">💎 Luxury Trip (${fmt(luxury)})</button>
      <button class="choice-btn" style="opacity:.6" onclick="UI.closeAnyModal()">Cancel</button>`;
  },

  _expatPick(jobId) {
    const G = window.G; if (!G) return;
    const job = this.EXPAT_JOBS.find(j => j.id === jobId); if (!job) return;

    UI.openModal(document.getElementById('ev-modal'));
    document.getElementById('m-ico').textContent = job.icon;
    document.getElementById('m-title').textContent = `Go Expat: ${job.name}`;
    document.getElementById('m-text').textContent = `${job.desc} · ${fmt(salaryScale(job.salary, G))}/yr · Choose your destination:`;
    const c = document.getElementById('m-choices');
    let btns = '';
    const regions = ['Europe', 'Asia', 'Americas', 'Oceania', 'Africa', 'MiddleEast'];
    regions.forEach(reg => {
      this.DESTINATIONS.filter(d => d.region === reg).slice(0, 2).forEach(dest => {
        btns += `<button class="choice-btn" onclick="UI.closeAnyModal();Travel.goExpat('${dest.id}','${jobId}')">${dest.icon} ${dest.name}</button>`;
      });
    });
    btns += `<button class="choice-btn" style="opacity:.6" onclick="UI.closeAnyModal()">Cancel</button>`;
    c.innerHTML = btns;
  },
};