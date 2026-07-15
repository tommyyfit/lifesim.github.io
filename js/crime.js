/* js/crime.js — LifeSim module 
   Full rewrite.
   Copy-paste this entire file into js/crime.js.

   Main goals:
   - Money rewards actually add to wallet
   - Simple and fun crime loop
   - More jobs
   - Better rewards
   - No yearly cooldown nonsense
   - No gangs / huge filters / overcomplicated menus
   - Cleaner UI
   - Old function names kept as compatibility shims
*/

const CRIME_JOBS = {
  quick_flip: {
    tier: 'Starter',
    icon: '🧤',
    label: 'Quick Flip',
    reward: [1500, 9000],
    catch: 0.08,
    heat: 3,
    rep: 2,
    stress: 1,
    sentence: [0, 0],
    minAge: 18,
    need: null,
    desc: 'Tiny risk, small money, good first move.'
  },

  street_hustle: {
    tier: 'Starter',
    icon: '💵',
    label: 'Street Hustle',
    reward: [3500, 18000],
    catch: 0.12,
    heat: 5,
    rep: 3,
    stress: 2,
    sentence: [0, 1],
    minAge: 18,
    need: null,
    desc: 'Fast cash with manageable risk.'
  },

  street_race: {
    tier: 'Starter',
    icon: '🏁',
    label: 'Street Race',
    reward: [8000, 42000],
    catch: 0.17,
    heat: 8,
    rep: 5,
    stress: 4,
    sentence: [0, 1],
    minAge: 18,
    need: 'fitness',
    desc: 'Fitness helps. Higher money, higher danger.'
  },

  private_deal: {
    tier: 'Starter',
    icon: '🤝',
    label: 'Private Deal',
    reward: [12000, 65000],
    catch: 0.20,
    heat: 10,
    rep: 6,
    stress: 4,
    sentence: [0, 2],
    minAge: 18,
    need: null,
    desc: 'Better payout. Heat starts to matter.'
  },

  confidence_trick: {
    tier: 'Smart',
    icon: '🎭',
    label: 'Confidence Trick',
    reward: [25000, 140000],
    catch: 0.24,
    heat: 12,
    rep: 8,
    stress: 5,
    sentence: [0, 3],
    minAge: 18,
    need: 'smarts',
    desc: 'Smarts and intel make this safer.'
  },

  fake_invoice: {
    tier: 'Smart',
    icon: '🧾',
    label: 'Fake Invoice Scheme',
    reward: [42000, 220000],
    catch: 0.27,
    heat: 14,
    rep: 10,
    stress: 6,
    sentence: [1, 4],
    minAge: 18,
    need: 'smarts',
    needRep: 8,
    desc: 'Good money if you avoid a paper trail.'
  },

  digital_job: {
    tier: 'Smart',
    icon: '💻',
    label: 'Digital Job',
    reward: [60000, 320000],
    catch: 0.25,
    heat: 13,
    rep: 11,
    stress: 6,
    sentence: [1, 5],
    minAge: 18,
    need: 'hacking',
    needIntel: 10,
    desc: 'Coding, smarts, and intel reduce the risk.'
  },

  nightlife_skim: {
    tier: 'Smart',
    icon: '🎰',
    label: 'Nightlife Skim',
    reward: [70000, 390000],
    catch: 0.31,
    heat: 17,
    rep: 12,
    stress: 7,
    sentence: [1, 5],
    minAge: 18,
    need: 'smarts',
    needRep: 14,
    desc: 'Strong payout. Needs some reputation.'
  },

  warehouse_hit: {
    tier: 'Heavy',
    icon: '📦',
    label: 'Warehouse Hit',
    reward: [110000, 650000],
    catch: 0.35,
    heat: 20,
    rep: 15,
    stress: 9,
    sentence: [2, 7],
    minAge: 18,
    need: 'fitness',
    needRep: 20,
    desc: 'Physical, loud, and profitable.'
  },

  luxury_flip: {
    tier: 'Heavy',
    icon: '⌚',
    label: 'Luxury Goods Flip',
    reward: [150000, 820000],
    catch: 0.36,
    heat: 21,
    rep: 16,
    stress: 9,
    sentence: [2, 8],
    minAge: 20,
    need: 'smarts',
    needRep: 24,
    desc: 'Big money through luxury items.'
  },

  white_collar: {
    tier: 'Heavy',
    icon: '📊',
    label: 'White-Collar Scheme',
    reward: [220000, 1200000],
    catch: 0.38,
    heat: 23,
    rep: 18,
    stress: 10,
    sentence: [2, 10],
    minAge: 21,
    need: 'smarts',
    needRep: 30,
    needIntel: 20,
    desc: 'Huge upside. Requires planning.'
  },

  cyber_breach: {
    tier: 'Heavy',
    icon: '🛰️',
    label: 'Cyber Breach',
    reward: [260000, 1500000],
    catch: 0.36,
    heat: 24,
    rep: 19,
    stress: 11,
    sentence: [2, 11],
    minAge: 21,
    need: 'hacking',
    needRep: 32,
    needIntel: 25,
    desc: 'High payout digital move.'
  },

  black_card: {
    tier: 'Elite',
    icon: '💳',
    label: 'Black Card Operation',
    reward: [450000, 2500000],
    catch: 0.44,
    heat: 30,
    rep: 24,
    stress: 13,
    sentence: [3, 13],
    minAge: 21,
    need: 'smarts',
    needRep: 42,
    needIntel: 35,
    desc: 'Elite level operation with serious upside.'
  },

  port_container: {
    tier: 'Elite',
    icon: '🚢',
    label: 'Port Container Job',
    reward: [600000, 3400000],
    catch: 0.48,
    heat: 34,
    rep: 28,
    stress: 15,
    sentence: [4, 15],
    minAge: 21,
    need: 'fitness',
    needRep: 48,
    needIntel: 40,
    desc: 'Big physical operation. Dangerous but rewarding.'
  },

  luxury_heist: {
    tier: 'Elite',
    icon: '💎',
    label: 'Luxury Heist',
    reward: [850000, 4800000],
    catch: 0.52,
    heat: 38,
    rep: 32,
    stress: 16,
    sentence: [4, 18],
    minAge: 22,
    need: 'smarts',
    needRep: 56,
    needIntel: 45,
    desc: 'High-status heist. Big money, big risk.'
  },

  secure_vault: {
    tier: 'Finale',
    icon: '🏛️',
    label: 'Secure Vault',
    reward: [1500000, 8500000],
    catch: 0.60,
    heat: 48,
    rep: 40,
    stress: 20,
    sentence: [5, 22],
    minAge: 23,
    need: 'hacking',
    needRep: 68,
    needIntel: 60,
    desc: 'Massive payout. Needs serious intel.'
  },

  one_big_job: {
    tier: 'Finale',
    icon: '🏦',
    label: 'One Big Job',
    reward: [3000000, 18000000],
    catch: 0.68,
    heat: 60,
    rep: 60,
    stress: 28,
    sentence: [8, 30],
    minAge: 24,
    need: null,
    needRep: 82,
    needIntel: 75,
    desc: 'Endgame score. Life-changing money, life-changing risk.'
  }
};

const CRIME_GANGS = {};

const Crime = {
  VERSION:1,
  MEMORY_LIMIT: 10,

  /* =========================
     CORE HELPERS
  ========================= */

  _num(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  },

  _cl(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, this._num(value, min)));
  },

  _r(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  _sc(value) {
    try {
      return typeof sc === 'function' ? sc(value) : value;
    } catch (_) {
      return value;
    }
  },

  _fmt(value) {
    const n = Math.round(Number(value) || 0);

    try {
      if (typeof fmt === 'function') return fmt(n);
    } catch (_) {}

    if (Math.abs(n) >= 1000000000) return `Kč${(n / 1000000000).toFixed(1)}B`;
    if (Math.abs(n) >= 1000000) return `Kč${(n / 1000000).toFixed(1)}M`;
    if (Math.abs(n) >= 1000) return `Kč${(n / 1000).toFixed(1)}K`;

    return `Kč${n.toLocaleString('en-US')}`;
  },

  esc(value) {
    return String(value ?? '').replace(/[&<>'"]/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[m]));
  },

  attr(value) {
    return this.esc(value).replace(/`/g, '&#96;');
  },

  _toast(message, type = 'neutral') {
    try {
      if (window.UI && typeof UI.toast === 'function') {
        UI.toast(message, type);
        return;
      }
    } catch (_) {}

    console.log(`[Crime] ${message}`);
  },


  _adultOnly() {
    const G = window.G;
    if (!G || (G.age || 0) < 18) {
      this._toast('Crime unlocks at age 18.', 'neutral');
      return false;
    }
    return true;
  },

  _log(message, type = 'neutral') {
    try {
      if (window.Engine && typeof Engine.log === 'function') {
        Engine.log(message, type);
        return;
      }
    } catch (_) {}

    console.log(`[Crime] ${message}`);
  },

  /* =========================
     MONEY FIX — IMPORTANT
  ========================= */

  _moneyKeys() {
    const G = window.G || {};
    const keys = ['money'];

    // If your game has another wallet alias, this keeps it synced too.
    ['cash', 'wallet', 'balance'].forEach(key => {
      if (Object.prototype.hasOwnProperty.call(G, key)) keys.push(key);
    });

    return [...new Set(keys)];
  },

  _money() {
    const G = window.G;
    if (!G) return 0;

    for (const key of this._moneyKeys()) {
      const n = Number(G[key]);
      if (Number.isFinite(n)) return n;
    }

    return 0;
  },

  _setMoney(value) {
    const G = window.G;
    if (!G) return 0;

    const clean = Math.max(0, Math.round(Number(value) || 0));

    for (const key of this._moneyKeys()) {
      G[key] = clean;
    }

    G.money = clean;
    return clean;
  },

  _addMoney(amount) {
    const before = this._money();
    const add = Math.round(Number(amount) || 0);
    const after = before + add;

    this._setMoney(after);
    this._persist();

    return Math.max(0, after) - before;
  },

  _removeMoney(amount) {
    const before = this._money();
    const remove = Math.abs(Math.round(Number(amount) || 0));
    const after = Math.max(0, before - remove);

    this._setMoney(after);
    this._persist();

    return before - after;
  },

  _canAfford(amount) {
    return this._money() >= Math.round(Number(amount) || 0);
  },

  _persist() {
    const G = window.G;
    if (!G) return;

    try {
      if (window.Save && typeof Save.autosave === 'function') Save.autosave(G);
    } catch (_) {}

    try {
      if (window.Storage && typeof Storage.save === 'function') Storage.save();
    } catch (_) {}

    try {
      if (window.Engine && typeof Engine.save === 'function') Engine.save();
    } catch (_) {}
  },

  _refresh() {
    this._persist();

    try {
      if (window.UI && typeof UI.update === 'function') UI.update();
    } catch (_) {}

    this.render();
  },

  /* =========================
     STATE
  ========================= */

  _ensure() {
    const G = window.G;
    if (!G) return;

    if (!Array.isArray(G.crimes)) G.crimes = [];
    if (!Array.isArray(G.crimeHistory)) G.crimeHistory = [];

    if (!Number.isFinite(G.crimeHeat)) G.crimeHeat = 0;
    if (!Number.isFinite(G.underworldRep)) G.underworldRep = 0;
    if (!Number.isFinite(G.crimeIntel)) G.crimeIntel = 0;
    if (!Number.isFinite(G.crimeStreak)) G.crimeStreak = 0;
    if (!Number.isFinite(G.reformScore)) G.reformScore = 0;
    if (!Number.isFinite(G.lawyerRetainer)) G.lawyerRetainer = 0;
    if (!Number.isFinite(G.prisonYears)) G.prisonYears = 0;

    if (G.inPrison && G.prisonYears <= 0) {
      G.prisonYears = 1;
    }

    this._setMoney(this._money());
  },

  /* =========================
     CSS
  ========================= */

  _styles() {
    return `
      <style>
        #tab-crime .crime-ui,
        #tab-crime .crime-ui * {
          box-sizing: border-box;
        }

        #tab-crime .crime-ui *,
        #tab-crime .crime-ui *::before,
        #tab-crime .crime-ui *::after {
          filter: none !important;
          box-shadow: none !important;
        }

        #tab-crime .crime-ui button::before,
        #tab-crime .crime-ui .move::before,
        #tab-crime .crime-ui .mini-btn::before {
          display: none !important;
          content: none !important;
        }

        .crime-ui {
          animation: fadeIn .18s ease-out;
          color: var(--txt);
          font-family: 'Nunito', system-ui, sans-serif;
        }

        .crime-ui .hero {
          margin-bottom: 12px;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.04);
          border-radius: 20px;
          padding: 14px 15px;
        }

        .crime-ui .hero-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .crime-ui .hero-title {
          color: var(--txt);
          font-size: 25px;
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -.02em;
        }

        .crime-ui .hero-sub {
          margin-top: 5px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.45;
          font-weight: 750;
          max-width: 520px;
        }

        .crime-ui .wallet-card {
          min-width: 185px;
          border: 1px solid rgba(255,255,255,.11);
          border-radius: 18px;
          background: rgba(255,255,255,.05);
          padding: 12px;
          text-align: right;
        }

        .crime-ui .wallet-card b {
          display: block;
          color: var(--green);
          font-size: 23px;
          line-height: 1;
          font-weight: 950;
        }

        .crime-ui .wallet-card span {
          display: block;
          margin-top: 4px;
          color: var(--muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .8px;
          font-weight: 950;
        }

        .crime-ui .heatbar {
          position: relative;
          z-index: 1;
          height: 9px;
          margin-top: 15px;
          border-radius: 999px;
          overflow: hidden;
          background: var(--s3);
        }

        .crime-ui .heatbar i {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: var(--accent);
        }

        .crime-ui .result {
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.05);
          color: var(--txt);
          border-radius: 18px;
          padding: 12px;
          margin-bottom: 12px;
          font-weight: 850;
          line-height: 1.4;
        }

        .crime-ui .result.good {
          border-color: rgba(34,197,94,.35);
          background: rgba(34,197,94,.10);
        }

        .crime-ui .result.bad {
          border-color: rgba(239,68,68,.35);
          background: rgba(239,68,68,.10);
        }

        .crime-ui .actions {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 12px;
        }

        .crime-ui .mini-btn {
          appearance: none;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.045);
          color: var(--txt);
          border-radius: 16px;
          padding: 11px 10px;
          text-align: left;
          cursor: pointer;
          transition: transform .16s ease, border-color .16s ease, background .16s ease;
        }

        .crime-ui .mini-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(255,255,255,.24);
          background: rgba(255,255,255,.075);
        }

        .crime-ui .mini-btn:active {
          transform: translateY(0);
        }

        .crime-ui .mini-btn b {
          display: block;
          font-size: 12px;
          font-weight: 950;
        }

        .crime-ui .mini-btn small {
          display: block;
          margin-top: 3px;
          color: var(--muted);
          font-size: 10px;
          line-height: 1.25;
          font-weight: 800;
        }

        .crime-ui .stats {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 13px;
        }

        .crime-ui .stat {
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.04);
          border-radius: 16px;
          padding: 11px;
          text-align: left;
        }

        .crime-ui .stat span {
          display: block;
          margin-bottom: 4px;
          color: var(--muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .7px;
          font-weight: 950;
        }

        .crime-ui .stat b {
          display: block;
          color: var(--txt);
          font-size: 18px;
          font-weight: 950;
        }

        .crime-ui .stat small {
          display: block;
          margin-top: 2px;
          color: var(--muted);
          font-size: 10px;
          font-weight: 750;
        }

        .crime-ui .good { color: var(--green) !important; }
        .crime-ui .warn { color: var(--yellow) !important; }
        .crime-ui .bad { color: var(--red) !important; }
        .crime-ui .accent { color: var(--accent) !important; }

        .crime-ui .moves {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .crime-ui .move {
          appearance: none;
          position: relative;
          min-height: 148px;
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.045);
          color: var(--txt);
          border-radius: 19px;
          padding: 14px;
          cursor: pointer;
          text-align: left;
          transition: transform .16s ease, border-color .16s ease, background .16s ease, opacity .16s ease;
        }

        .crime-ui .move:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,.24);
          background: rgba(255,255,255,.075);
        }

        .crime-ui .move:active {
          transform: translateY(0);
        }

        .crime-ui .move.locked {
          opacity: .46;
          cursor: not-allowed;
        }

        .crime-ui .move-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .crime-ui .ico {
          font-size: 29px;
          line-height: 1;
        }

        .crime-ui .tier {
          color: var(--muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .8px;
          font-weight: 950;
        }

        .crime-ui .move h4 {
          margin: 9px 0 5px;
          color: var(--txt);
          font-size: 15px;
          font-weight: 950;
        }

        .crime-ui .move p {
          margin: 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.35;
          font-weight: 730;
        }

        .crime-ui .chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 10px;
        }

        .crime-ui .chip {
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(0,0,0,.14);
          border-radius: 999px;
          padding: 5px 7px;
          color: var(--txt);
          font-size: 10px;
          font-weight: 950;
        }

        .crime-ui .history {
          margin-top: 13px;
        }

        .crime-ui .simple-list {
          display: grid;
          gap: 7px;
        }

        .crime-ui .simple-log {
          border: 1px solid rgba(255,255,255,.08);
          background: rgba(255,255,255,.035);
          border-radius: 14px;
          padding: 9px 10px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 750;
        }

        @media (max-width: 1000px) {
          .crime-ui .actions,
          .crime-ui .stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 760px) {
          .crime-ui .hero-row {
            flex-direction: column;
            align-items: stretch;
          }

          .crime-ui .actions,
          .crime-ui .stats,
          .crime-ui .moves {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .crime-ui .hero-title {
            font-size: 21px;
          }

          .crime-ui .wallet-card {
            width: 100%;
            text-align: left;
          }
        }

        @media (max-width: 520px) {
          .crime-ui .actions,
          .crime-ui .stats,
          .crime-ui .moves {
            grid-template-columns: 1fr;
          }
        }
      </style>
    `;
  },

  /* =========================
     RENDER
  ========================= */

  render() {
    const G = window.G;
    if (!G) return;

    const el = document.getElementById('tab-crime');
    if (!el) return;

    this._ensure();

    if ((G.age || 0) < 18) {
      el.innerHTML = this._styles() + `
        <div class="empty">
          <span class="ei">👮</span>
          <p>Crime unlocks at age 18.</p>
        </div>
      `;
      return;
    }

    if (G.inPrison) {
      el.innerHTML = this._styles() + this._renderPrison();
      return;
    }

    const heat = this._cl(G.crimeHeat || 0);
    const heatColor = this._heatColor(heat);
    const rep = this._cl(G.underworldRep || 0);
    const intel = this._cl(G.crimeIntel || 0);
    const streak = Math.max(0, Math.round(G.crimeStreak || 0));
    const record = (G.crimes || []).length;
    const lawyer = Math.max(0, Math.round(G.lawyerRetainer || 0));

    const jobs = Object.entries(CRIME_JOBS)
      .map(([id, job]) => this._moveCard(id, job))
      .join('');

    el.innerHTML = this._styles() + `
      <div class="crime-ui">
        ${G.lastCrimeOutcome ? this._resultHTML(G.lastCrimeOutcome) : ''}

        <div class="actions">
          ${this._quick('🕵️', 'Plan Move', '+Intel, lower risk', 'Crime.scoutTargets()')}
          ${this._quick('🧊', 'Lay Low', 'Drop heat fast', 'Crime.layLow()')}
          ${this._quick('⚖️', 'Lawyer', 'Protect next fail', 'Crime.lawyer()')}
          ${this._quick('🛠️', 'Legal Cash', 'Safe money', 'Crime.secondChanceGig()')}
          ${this._quick('🧠', 'Reform', 'Lower stress', 'Crime.reform()')}
        </div>

        <div class="stats">
          ${this._stat('Heat', Math.round(heat) + '%', this._heatLabel(heat), heat >= 65 ? 'bad' : heat >= 35 ? 'warn' : 'good')}
          ${this._stat('Rep', Math.round(rep) + '%', 'Unlocks bigger jobs', 'accent')}
          ${this._stat('Intel', Math.round(intel) + '%', 'Cuts risk', 'good')}
          ${this._stat('Streak', 'x' + Math.max(1, streak), 'Reward bonus', 'warn')}
          ${this._stat('Lawyer', lawyer + '/3', 'Fail protection', lawyer ? 'good' : 'accent')}
        </div>

        <div class="sec">Choose a Move</div>
        <div class="moves">
          ${jobs}
        </div>

        ${this._historyHTML()}
      </div>
    `;
  },

  _resultHTML(result) {
    return `
      <div class="result ${result.type === 'bad' ? 'bad' : 'good'}">
        ${this.esc(result.text || '')}
      </div>
    `;
  },

  _quick(icon, title, sub, action) {
    return `
      <button type="button" class="mini-btn" onclick="${this.attr(action)}">
        <b>${this.esc(icon)} ${this.esc(title)}</b>
        <small>${this.esc(sub)}</small>
      </button>
    `;
  },

  _stat(label, value, sub, tone = 'accent') {
    return `
      <div class="stat">
        <span>${this.esc(label)}</span>
        <b class="${this.esc(tone)}">${this.esc(value)}</b>
        <small>${this.esc(sub)}</small>
      </div>
    `;
  },

  _moveCard(id, job) {
    const lock = this._locked(job);
    const risk = this._risk(job);
    const reward = this._previewReward(job);

    const riskClass =
      risk >= 60 ? 'bad' :
      risk >= 35 ? 'warn' :
      'good';

    const onclick = lock
      ? `UI.toast('${this.attr(lock)}','bad')`
      : `Crime.do('${this.attr(id)}')`;

    return `
      <button type="button" class="move ${lock ? 'locked' : ''}" onclick="${onclick}" title="${this.esc(lock || job.desc)}">
        <div class="move-top">
          <span class="ico">${this.esc(lock ? '🔒' : job.icon)}</span>
          <span class="tier">${this.esc(job.tier)}</span>
        </div>

        <h4>${this.esc(job.label)}</h4>
        <p>${this.esc(lock || job.desc)}</p>

        <div class="chips">
          <span class="chip good">~${this._fmt(reward)}</span>
          <span class="chip ${riskClass}">${risk}% risk</span>
          <span class="chip accent">+${job.rep} rep</span>
        </div>
      </button>
    `;
  },

  _historyHTML() {
    const G = window.G || {};
    const history = (G.crimeHistory || []).slice(-6).reverse();

    if (!history.length) return '';

    return `
      <div class="history">
        <div class="sec">🧾 Recent Outcomes</div>
        <div class="simple-list">
          ${history.map(item => `
            <div class="simple-log">
              Age ${this.esc(item.age)} · ${this.esc(item.label)} · ${this.esc(item.result)}
              ${item.money ? ` · ${item.money > 0 ? '+' : ''}${this._fmt(item.money)}` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /* =========================
     GAME LOGIC
  ========================= */

  _locked(job) {
    const G = window.G || {};

    if ((G.age || 0) < (job.minAge || 16)) {
      return `Unlocks at age ${job.minAge}`;
    }

    if (job.needRep && (G.underworldRep || 0) < job.needRep) {
      return `Need ${job.needRep}% reputation`;
    }

    if (job.needIntel && (G.crimeIntel || 0) < job.needIntel) {
      return `Need ${job.needIntel}% intel`;
    }

    if (job.need === 'smarts' && (G.smarts || 50) < 35) {
      return 'Need more smarts';
    }

    if (job.need === 'fitness' && (G.fitness || 50) < 32) {
      return 'Need more fitness';
    }

    if (job.need === 'hacking') {
      const skill = Math.max(G.coding || 0, G.hacking || 0, G.smarts || 0);
      if (skill < 35) return 'Need coding/smarts';
    }

    return '';
  },

  _risk(job) {
    const G = window.G || {};

    let risk = (job.catch || 0.2) * 100;

    risk += (G.crimeHeat || 0) * 0.35;
    risk += Math.min(9, (G.stress || 0) / 16);

    risk -= Math.min(24, (G.crimeIntel || 0) * 0.24);
    risk -= Math.min(10, (G.lawyerRetainer || 0) * 4.5);
    risk -= Math.min(7, (G.underworldRep || 0) * 0.055);

    if (G.trait === 'lucky') risk -= 5;
    if (G.trait === 'reckless') risk += 6;

    if (job.need === 'smarts') {
      risk -= Math.max(0, ((G.smarts || 50) - 50) * 0.18);
    }

    if (job.need === 'fitness') {
      risk -= Math.max(0, ((G.fitness || 50) - 50) * 0.16);
    }

    if (job.need === 'hacking') {
      const skill = Math.max(G.coding || 0, G.hacking || 0, G.smarts || 0);
      risk -= Math.max(0, (skill - 45) * 0.20);
    }

    return Math.round(this._cl(risk, 4, 90));
  },

  _previewReward(job) {
    const avg = (job.reward[0] + job.reward[1]) / 2;
    const G = window.G || {};

    const repBonus = 1 + Math.min(0.70, (G.underworldRep || 0) / 125);
    const streakBonus = 1 + Math.min(0.55, (G.crimeStreak || 0) * 0.08);
    const intelBonus = 1 + Math.min(0.25, (G.crimeIntel || 0) / 400);

    return Math.floor(this._sc(avg) * repBonus * streakBonus * intelBonus);
  },

  _realReward(job) {
    const G = window.G || {};

    let money = this._sc(this._r(job.reward[0], job.reward[1]));

    const repBonus = 1 + Math.min(0.70, (G.underworldRep || 0) / 125);
    const streakBonus = 1 + Math.min(0.55, (G.crimeStreak || 0) * 0.08);
    const intelBonus = 1 + Math.min(0.25, (G.crimeIntel || 0) / 400);

    money = Math.floor(money * repBonus * streakBonus * intelBonus);

    return Math.max(0, money);
  },

  do(id) {
    const G = window.G;
    if (!G) return;

    this._ensure();
    if (!this._adultOnly()) return;

    const job = CRIME_JOBS[id];

    if (!job) {
      this._toast('Unknown move.', 'bad');
      return;
    }

    if (G.inPrison) {
      this._toast('You are in prison.', 'bad');
      return;
    }

    const lock = this._locked(job);

    if (lock) {
      this._toast(lock, 'bad');
      return;
    }

    const risk = this._risk(job);
    const caught = Math.random() * 100 < risk;

    let text = '';
    let type = caught ? 'bad' : 'good';
    let earned = 0;

    if (caught) {
      G.crimeStreak = 0;

      const fineBase = this._sc(this._r(1500, 12000) + Math.round(job.reward[0] * 0.16));
      const fine = this._removeMoney(fineBase);

      G.crimeHeat = this._cl((G.crimeHeat || 0) + this._r(8, 18) + (job.heat || 8), 0, 100);
      G.stress = this._cl((G.stress || 0) + this._r(6, 14) + (job.stress || 3), 0, 100);
      G.karma = this._cl((G.karma || 0) - this._r(2, 7), -100, 100);

      const sentenceRaw = this._r(job.sentence?.[0] || 0, job.sentence?.[1] || 1);
      const lawyerHelp = Math.min(2, Math.round(G.lawyerRetainer || 0));
      const sentence = Math.max(0, sentenceRaw - lawyerHelp);

      G.lawyerRetainer = Math.max(0, (G.lawyerRetainer || 0) - 1);

      G.crimes.push({
        age: G.age || 0,
        label: job.label,
        result: 'Caught',
        fine
      });

      if (sentence > 0 && risk >= 25) {
        G.inPrison = true;
        G.prisonYears = Math.max(1, sentence);

        text = `🚔 Caught during ${job.label}. Fine ${this._fmt(fine)}. Prison: ${G.prisonYears} year${G.prisonYears !== 1 ? 's' : ''}.`;
      } else {
        text = `🚔 Caught during ${job.label}. Fine ${this._fmt(fine)}. No prison, but heat increased.`;
      }
    } else {
      const reward = this._realReward(job);
      earned = this._addMoney(reward);

      const repGain = this._r(Math.max(1, job.rep - 2), job.rep + 3);

      G.crimeStreak = (G.crimeStreak || 0) + 1;
      G.underworldRep = this._cl((G.underworldRep || 0) + repGain, 0, 100);
      G.crimeHeat = this._cl((G.crimeHeat || 0) + this._r(Math.max(2, job.heat - 4), job.heat + 5), 0, 100);
      G.crimeIntel = this._cl((G.crimeIntel || 0) - this._r(2, 8), 0, 100);
      G.stress = this._cl((G.stress || 0) + this._r(1, job.stress || 4), 0, 100);
      G.karma = this._cl((G.karma || 0) - this._r(1, 5), -100, 100);

      text = `✅ ${job.label} succeeded. +${this._fmt(earned)} added to wallet. +${repGain}% rep. Streak x${G.crimeStreak}.`;
    }

    const entry = {
      age: G.age || 0,
      label: job.label,
      result: caught ? 'Caught' : 'Success',
      money: caught ? 0 : earned,
      type
    };

    G.crimeHistory.push(entry);
    G.crimeHistory = G.crimeHistory.slice(-this.MEMORY_LIMIT);

    G.lastCrimeOutcome = {
      text,
      type,
      age: G.age || 0
    };

    this._log(text, type);
    this._refresh();
  },

  /* =========================
     QUICK ACTIONS
  ========================= */

  scoutTargets() {
    const G = window.G;
    if (!G) return;

    this._ensure();
    if (!this._adultOnly()) return;

    const cost = this._sc(1200 + Math.round((G.crimeIntel || 0) * 30));

    if (!this._canAfford(cost)) {
      this._toast(`Need ${this._fmt(cost)}.`, 'bad');
      return;
    }

    this._removeMoney(cost);

    const gain = this._r(14, 26);

    G.crimeIntel = this._cl((G.crimeIntel || 0) + gain, 0, 100);
    G.stress = this._cl((G.stress || 0) + 1, 0, 100);

    G.lastCrimeOutcome = {
      text: `🕵️ Planned the next move. Intel +${gain}%. Risk is lower now.`,
      type: 'good',
      age: G.age || 0
    };

    this._log(`🕵️ Intel increased by ${gain}%.`, 'good');
    this._refresh();
  },

  layLow() {
    const G = window.G;
    if (!G) return;

    this._ensure();
    if (!this._adultOnly()) return;

    const drop = this._r(22, 40);

    G.crimeHeat = this._cl((G.crimeHeat || 0) - drop, 0, 100);
    G.stress = this._cl((G.stress || 0) - this._r(4, 12), 0, 100);
    G.happiness = this._cl((G.happiness || 50) - this._r(0, 3), 0, 100);
    G.crimeStreak = 0;

    G.lastCrimeOutcome = {
      text: `🧊 Laid low. Heat -${drop}%. Streak reset, but you are safer.`,
      type: 'good',
      age: G.age || 0
    };

    this._refresh();
  },

  lawyer() {
    const G = window.G;
    if (!G) return;

    this._ensure();
    if (!this._adultOnly()) return;

    const current = Math.max(0, Math.round(G.lawyerRetainer || 0));

    if (current >= 3) {
      this._toast('Lawyer protection already maxed.', 'neutral');
      return;
    }

    const cost = this._sc(8500 + current * 5000);

    if (!this._canAfford(cost)) {
      this._toast(`Need ${this._fmt(cost)}.`, 'bad');
      return;
    }

    this._removeMoney(cost);

    G.lawyerRetainer = Math.min(3, current + 1);

    G.lastCrimeOutcome = {
      text: `⚖️ Lawyer ready. Protection stacks: ${G.lawyerRetainer}/3.`,
      type: 'good',
      age: G.age || 0
    };

    this._refresh();
  },

  secondChanceGig() {
    const G = window.G;
    if (!G) return;

    this._ensure();
    if (!this._adultOnly()) return;

    const earn = this._sc(
      this._r(6000, 30000) +
      Math.round((G.reformScore || 0) * 120) +
      Math.round((G.smarts || 50) * 45)
    );

    const added = this._addMoney(earn);

    G.reformScore = this._cl((G.reformScore || 0) + this._r(3, 8), 0, 100);
    G.crimeHeat = this._cl((G.crimeHeat || 0) - this._r(2, 8), 0, 100);
    G.stress = this._cl((G.stress || 0) - this._r(1, 5), 0, 100);

    G.lastCrimeOutcome = {
      text: `🛠️ Legal cash earned. +${this._fmt(added)} added to wallet.`,
      type: 'good',
      age: G.age || 0
    };

    this._refresh();
  },

  reform() {
    const G = window.G;
    if (!G) return;

    this._ensure();
    if (!this._adultOnly()) return;

    const cost = this._sc(2200);

    if (!this._canAfford(cost)) {
      this._toast(`Need ${this._fmt(cost)}.`, 'bad');
      return;
    }

    this._removeMoney(cost);

    G.reformScore = this._cl((G.reformScore || 0) + this._r(9, 16), 0, 100);
    G.stress = this._cl((G.stress || 0) - this._r(4, 10), 0, 100);
    G.crimeHeat = this._cl((G.crimeHeat || 0) - this._r(1, 5), 0, 100);

    G.lastCrimeOutcome = {
      text: '🧠 Reform improved. Stress down, future cleanup easier.',
      type: 'good',
      age: G.age || 0
    };

    this._refresh();
  },

  expunge() {
    const G = window.G;
    if (!G) return;

    this._ensure();
    if (!this._adultOnly()) return;

    if (!(G.crimes || []).length) {
      this._toast('No record to clean.', 'neutral');
      return;
    }

    const cost = this._sc(14000 + G.crimes.length * 3000);

    if (!this._canAfford(cost)) {
      this._toast(`Need ${this._fmt(cost)}.`, 'bad');
      return;
    }

    this._removeMoney(cost);

    const amount = Math.min(G.crimes.length, 1 + Math.floor((G.reformScore || 0) / 40));
    G.crimes.splice(0, amount);

    G.crimeHeat = this._cl((G.crimeHeat || 0) - this._r(10, 22), 0, 100);

    G.lastCrimeOutcome = {
      text: `📋 Cleaned ${amount} record item${amount !== 1 ? 's' : ''}.`,
      type: 'good',
      age: G.age || 0
    };

    this._refresh();
  },

  communityService() {
    const G = window.G;
    if (!G) return;

    this._ensure();
    if (!this._adultOnly()) return;

    G.reformScore = this._cl((G.reformScore || 0) + this._r(6, 12), 0, 100);
    G.crimeHeat = this._cl((G.crimeHeat || 0) - this._r(6, 14), 0, 100);
    G.karma = this._cl((G.karma || 0) + this._r(3, 8), -100, 100);

    G.lastCrimeOutcome = {
      text: '🤲 Community work helped your image. Heat down, karma up.',
      type: 'good',
      age: G.age || 0
    };

    this._refresh();
  },

  bribe() {
    const G = window.G;
    if (!G) return;

    this._ensure();
    if (!this._adultOnly()) return;

    const cost = this._sc(18000);

    if (!this._canAfford(cost)) {
      this._toast(`Need ${this._fmt(cost)}.`, 'bad');
      return;
    }

    this._removeMoney(cost);

    if (Math.random() < 0.25) {
      G.crimeHeat = this._cl((G.crimeHeat || 0) + this._r(10, 24), 0, 100);

      G.lastCrimeOutcome = {
        text: '💵 Bribe backfired. Heat jumped.',
        type: 'bad',
        age: G.age || 0
      };
    } else {
      G.crimeHeat = this._cl((G.crimeHeat || 0) - this._r(14, 28), 0, 100);

      G.lastCrimeOutcome = {
        text: '💵 Bribe worked. Heat dropped.',
        type: 'good',
        age: G.age || 0
      };
    }

    this._refresh();
  },

  /* =========================
     PRISON
  ========================= */

  _renderPrison() {
    const G = window.G;
    this._ensure();

    const years = Math.max(1, Math.round(G.prisonYears || 1));
    const parole = this._paroleChance();
    const mental = Math.round(G.mentalHealth || 60);
    const mentalTone = mental >= 70 ? 'good' : mental <= 35 ? 'bad' : 'warn';

    return `
      <div class="crime-ui">
        <div class="hero">
          <div class="hero-row">
            <div>
              <div class="hero-title">🔒 Prison Chapter</div>
              <div class="hero-sub">
                Choose your prison approach: keep your head down, improve yourself, work for cash, or act out and risk real consequences.
              </div>
            </div>

            <div class="wallet-card">
              <b class="bad">${years}</b>
              <span>Years Left</span>
            </div>
          </div>
        </div>

        ${G.lastCrimeOutcome ? this._resultHTML(G.lastCrimeOutcome) : ''}

        <div class="stats">
          ${this._stat('Years Left', String(years), 'Sentence clock', years <= 1 ? 'warn' : 'bad')}
          ${this._stat('Parole', Math.round(parole * 100) + '%', 'Chance now', 'good')}
          ${this._stat('Reform', Math.round(G.reformScore || 0) + '%', 'Helps release', 'accent')}
          ${this._stat('Stress', Math.round(G.stress || 0) + '%', 'Keep low', (G.stress || 0) > 70 ? 'bad' : 'warn')}
          ${this._stat('Mental', mental + '/100', 'Mindset matters', mentalTone)}
          ${this._stat('Health', Math.round(G.health || 0) + '%', 'Body condition', (G.health || 0) < 35 ? 'bad' : 'good')}
          ${this._stat('Fitness', Math.round(G.fitness || 50) + '%', 'Training payoff', (G.fitness || 50) < 35 ? 'warn' : 'good')}
          ${this._stat('Smarts', Math.round(G.smarts || 50) + '%', 'Study payoff', 'accent')}
          ${this._stat('Rep', Math.round(G.underworldRep || 0) + '%', 'Street name', 'warn')}
          ${this._stat('Wallet', this._fmt(this._money()), 'Cash outside', 'good')}
        </div>

        <div class="actions">
          ${this._quick('😇', 'Good Behavior', 'Better parole, maybe shorter time', 'Crime.prisonAct("behave")')}
          ${this._quick('🏋️', 'Train', 'Fitness + health', 'Crime.prisonAct("train")')}
          ${this._quick('📚', 'Study', 'Smarts + reform', 'Crime.prisonAct("study")')}
          ${this._quick('🧘', 'Therapy', 'Stress down + mental health', 'Crime.prisonAct("therapy")')}
          ${this._quick('🛠️', 'Work Detail', 'Earn cash, harder routine', 'Crime.prisonAct("work")')}
          ${this._quick('😈', 'Bad Behavior', 'Rep up, injury or death risk', 'Crime.prisonAct("bad")')}
          ${this._quick('🕊️', 'Parole', 'Try release', 'Crime.prisonAct("parole")')}
        </div>
      </div>
    `;
  },

  prisonAct(kind) {
    const G = window.G;
    if (!G) return;

    this._ensure();

    if (!G.inPrison) {
      this._toast('You are not in prison.', 'neutral');
      return;
    }

    if (kind === 'behave') {
      const reformGain = this._r(8, 14);
      const stressDrop = this._r(4, 9);
      let yearCut = 0;
      G.reformScore = this._cl((G.reformScore || 0) + reformGain, 0, 100);
      G.stress = this._cl((G.stress || 0) - stressDrop, 0, 100);
      if (Math.random() < 0.28 + ((G.reformScore || 0) / 320) && (G.prisonYears || 0) > 1) {
        G.prisonYears = Math.max(1, Math.round(G.prisonYears || 1) - 1);
        yearCut = 1;
      }

      G.lastCrimeOutcome = {
        text: `😇 Good behavior: +${reformGain}% reform, -${stressDrop}% stress${yearCut ? ', sentence reduced by 1 year.' : '.'}`,
        type: 'good',
        age: G.age || 0
      };
    }

    else if (kind === 'train' || kind === 'workout') {
      const fitGain = this._r(3, 7);
      const healthGain = this._r(1, 5);
      const stressDrop = this._r(1, 5);
      const mentalGain = this._r(1, 4);
      G.fitness = this._cl((G.fitness || 50) + fitGain, 0, 100);
      G.health = this._cl((G.health || 50) + healthGain, 0, 100);
      G.stress = this._cl((G.stress || 0) - stressDrop, 0, 100);
      G.mentalHealth = this._cl((G.mentalHealth || 60) + mentalGain, 0, 100);

      G.lastCrimeOutcome = {
        text: `🏋️ Training paid off: +${fitGain}% fitness, +${healthGain}% health, +${mentalGain} mental, -${stressDrop}% stress.`,
        type: 'good',
        age: G.age || 0
      };
    }

    else if (kind === 'study') {
      const smartsGain = this._r(3, 7);
      const reformGain = this._r(4, 9);
      let yearCut = 0;
      G.smarts = this._cl((G.smarts || 50) + smartsGain, 0, 100);
      G.reformScore = this._cl((G.reformScore || 0) + reformGain, 0, 100);
      if (Math.random() < 0.18 + ((G.smarts || 50) / 500) && (G.prisonYears || 0) > 1) {
        G.prisonYears = Math.max(1, Math.round(G.prisonYears || 1) - 1);
        yearCut = 1;
      }

      G.lastCrimeOutcome = {
        text: `📚 Study worked: +${smartsGain}% smarts, +${reformGain}% reform${yearCut ? ', sentence reduced by 1 year.' : '.'}`,
        type: 'good',
        age: G.age || 0
      };
    }

    else if (kind === 'therapy') {
      const stressDrop = this._r(8, 18);
      const reformGain = this._r(4, 8);
      const mentalGain = this._r(6, 14);
      const happinessGain = this._r(1, 4);
      G.stress = this._cl((G.stress || 0) - stressDrop, 0, 100);
      G.reformScore = this._cl((G.reformScore || 0) + reformGain, 0, 100);
      G.mentalHealth = this._cl((G.mentalHealth || 60) + mentalGain, 0, 100);
      G.happiness = this._cl((G.happiness || 50) + happinessGain, 0, 100);

      G.lastCrimeOutcome = {
        text: `🧘 Therapy helped: -${stressDrop}% stress, +${mentalGain} mental, +${reformGain}% reform.`,
        type: 'good',
        age: G.age || 0
      };
    }

    else if (kind === 'work') {
      const pay = this._sc(this._r(700, 2600));
      const reformGain = this._r(2, 6);
      const stressGain = this._r(2, 5);
      const healthDrop = this._r(0, 2);
      this._setMoney(this._money() + pay);
      G.reformScore = this._cl((G.reformScore || 0) + reformGain, 0, 100);
      G.stress = this._cl((G.stress || 0) + stressGain, 0, 100);
      G.health = this._cl((G.health || 50) - healthDrop, 0, 100);

      G.lastCrimeOutcome = {
        text: `🛠️ Work detail paid ${this._fmt(pay)}. +${reformGain}% reform, +${stressGain}% stress${healthDrop ? `, -${healthDrop}% health.` : '.'}`,
        type: 'money',
        age: G.age || 0
      };
    }

    else if (kind === 'bad') {
      const repGain = this._r(5, 12);
      const reformLoss = this._r(7, 15);
      const stressGain = this._r(5, 11);
      let yearAdd = 0;
      let injuryLoss = 0;
      G.underworldRep = this._cl((G.underworldRep || 0) + repGain, 0, 100);
      G.reformScore = this._cl((G.reformScore || 0) - reformLoss, 0, 100);
      G.stress = this._cl((G.stress || 0) + stressGain, 0, 100);

      if (Math.random() < 0.45) {
        G.prisonYears = Math.max(1, Math.round(G.prisonYears || 1) + 1);
        yearAdd = 1;
      }

      if (Math.random() < 0.34) {
        injuryLoss = this._r(8, 24);
        G.health = this._cl((G.health || 50) - injuryLoss, 0, 100);
        G.mentalHealth = this._cl((G.mentalHealth || 60) - this._r(2, 8), 0, 100);
      }

      if ((G.health || 0) <= 0 || ((G.health || 0) < 16 && Math.random() < 0.18)) {
        if (window.Engine && typeof Engine._die === 'function') {
          Engine._die('fatal prison violence');
          return;
        }
      }

      G.lastCrimeOutcome = {
        text: `😈 Bad behavior: +${repGain}% rep, -${reformLoss}% reform, +${stressGain}% stress${yearAdd ? ', sentence +1 year' : ''}${injuryLoss ? `, -${injuryLoss}% health from injuries.` : '.'}`,
        type: injuryLoss ? 'bad' : 'warn',
        age: G.age || 0
      };
    }

    else if (kind === 'parole') {
      if (Math.random() < this._paroleChance()) {
        this._release('parole');
        this._refresh();
        return;
      }

      G.stress = this._cl((G.stress || 0) + this._r(4, 9), 0, 100);

      G.lastCrimeOutcome = {
        text: '🕊️ Parole denied. Improve reform and try again.',
        type: 'bad',
        age: G.age || 0
      };
    }

    this._refresh();
  },

  _paroleChance() {
    const G = window.G || {};

    let chance =
      0.16 +
      (G.reformScore || 0) / 135 +
      (G.karma || 0) / 650 -
      Math.min(0.18, (G.crimes || []).length * 0.025);

    return Math.max(0.06, Math.min(0.82, chance));
  },

  _release(reason = 'served') {
    const G = window.G;
    if (!G) return;

    G.inPrison = false;
    G.prisonYears = 0;

    G.crimeHeat = this._cl((G.crimeHeat || 0) - 24, 0, 100);
    G.reformScore = this._cl((G.reformScore || 0) + 8, 0, 100);
    G.stress = this._cl((G.stress || 0) - 12, 0, 100);
    G.mentalHealth = this._cl((G.mentalHealth || 60) + 8, 0, 100);

    G.lastCrimeOutcome = {
      text: reason === 'parole'
        ? '🕊️ Parole approved. You are free early.'
        : '🚪 Released. Time to rebuild.',
      type: 'good',
      age: G.age || 0
    };

    this._log(G.lastCrimeOutcome.text, 'good');
  },

  prisonTick() {
    const G = window.G;
    if (!G || !G.inPrison) return false;

    this._ensure();

    G.prisonYears = Math.max(0, Math.round(G.prisonYears || 1) - 1);
    G.stress = this._cl((G.stress || 0) + this._r(3, 8), 0, 100);
    G.reformScore = this._cl((G.reformScore || 0) + this._r(1, 4), 0, 100);
    G.mentalHealth = this._cl((G.mentalHealth || 60) - this._r(1, 4), 0, 100);

    if (G.prisonYears <= 0) {
      this._release('served');
      return true;
    }

    G.lastCrimeOutcome = {
      text: `🔒 Another year passed inside. ${G.prisonYears} year${G.prisonYears !== 1 ? 's' : ''} left.`,
      type: 'bad',
      age: G.age || 0
    };
    this._log(G.lastCrimeOutcome.text, 'bad');

    return true;
  },

  tick() {
    const G = window.G;
    if (!G) return;

    this._ensure();

    if ((G.age || 0) < 18) {
      const hadImpossibleState = !!G.inPrison || (G.prisonYears || 0) > 0;
      G.inPrison = false;
      G.prisonYears = 0;
      G.crimeHeat = 0;
      G.gangHeat = 0;
      G.crimeIntel = 0;
      G.crimeStreak = 0;
      G.lawyerRetainer = 0;
      if (hadImpossibleState) {
        this._log('🧾 An invalid juvenile prison state from an older save was cleared.', 'neutral');
      }
      return;
    }

    if (G.inPrison) {
      this.prisonTick();
      return;
    }

    if ((G.crimeHeat || 0) > 0) {
      G.crimeHeat = this._cl((G.crimeHeat || 0) - this._r(3, 9), 0, 100);
    }

    if ((G.crimeIntel || 0) > 0) {
      G.crimeIntel = this._cl((G.crimeIntel || 0) - this._r(1, 5), 0, 100);
    }

    if ((G.lawyerRetainer || 0) > 0 && Math.random() < 0.15) {
      G.lawyerRetainer = Math.max(0, G.lawyerRetainer - 1);
    }

    if ((G.crimeHeat || 0) > 80 && Math.random() < 0.10) {
      G.stress = this._cl((G.stress || 0) + this._r(4, 9), 0, 100);
      this._log('🚨 High heat is stressing you out. Lay low soon.', 'bad');
    }
  },

  /* =========================
     VISUAL HELPERS
  ========================= */

  _heatColor(heat) {
    if (heat >= 75) return 'var(--red)';
    if (heat >= 45) return 'var(--orange)';
    if (heat >= 20) return 'var(--yellow)';
    return 'var(--green)';
  },

  _heatLabel(heat) {
    if (heat >= 75) return 'Danger zone';
    if (heat >= 45) return 'Risky';
    if (heat >= 20) return 'Watch it';
    return 'Safe';
  },

  /* =========================
     COMPATIBILITY SHIMS
     Keeps old buttons from breaking.
  ========================= */

  buyBurner() {
    this.scoutTargets();
  },

  recruitCrew() {
    const G = window.G;
    if (!G) return;

    this._ensure();
    if (!this._adultOnly()) return;

    G.underworldRep = this._cl((G.underworldRep || 0) + 4, 0, 100);
    G.crimeIntel = this._cl((G.crimeIntel || 0) + 8, 0, 100);

    G.lastCrimeOutcome = {
      text: '🤝 Network improved. Rep and intel increased.',
      type: 'good',
      age: G.age || 0
    };

    this._refresh();
  },

  setupSafehouse() {
    this.layLow();
  },

  setFilter() {
    this.render();
  },

  joinGang() {
    this._toast('Gangs were removed in release to keep crime fast and fun.', 'neutral');
  },

  leaveGang() {
    this._toast('Gangs are disabled in release.', 'neutral');
  },

  gangTask() {
    this._toast('Gang tasks are disabled in release.', 'neutral');
  },

  _checkCrimeAchievements() {}
};

// Make sure inline onclick="Crime.do(...)" always works.
window.CRIME_JOBS = CRIME_JOBS;
window.CRIME_GANGS = CRIME_GANGS;
window.Crime = Crime;
/* release HOTFIX — direct wallet sync for this LifeSim build.
   The app UI reads G.money directly, so this patch avoids aliases and forces the header cash/net worth DOM to refresh. */
(function(){
  'use strict';
  if(!window.Crime)return;

  Crime.VERSION=20.4;

  Crime._money=function(){
    const G=window.G;
    if(!G)return 0;
    const n=Number(G.money);
    if(Number.isFinite(n))return Math.max(0,Math.round(n));
    G.money=0;
    return 0;
  };

  Crime._setMoney=function(value){
    const G=window.G;
    if(!G)return 0;
    const clean=Math.max(0,Math.round(Number(value)||0));
    G.money=clean;
    this._forceWalletUI();
    return clean;
  };

  Crime._addMoney=function(amount){
    const before=this._money();
    const add=Math.max(0,Math.round(Number(amount)||0));
    const after=before+add;
    window.G.money=after;
    this._forceWalletUI();
    this._persist();
    return after-before;
  };

  Crime._removeMoney=function(amount){
    const before=this._money();
    const remove=Math.max(0,Math.round(Number(amount)||0));
    const after=Math.max(0,before-remove);
    window.G.money=after;
    this._forceWalletUI();
    this._persist();
    return before-after;
  };

  Crime._canAfford=function(amount){
    return this._money()>=Math.max(0,Math.round(Number(amount)||0));
  };

  Crime._forceWalletUI=function(){
    const G=window.G;
    if(!G)return;

    try{
      ['g-cash','g-cash-m'].forEach(id=>{
        const el=document.getElementById(id);
        if(el)el.textContent='';
      });
    }catch(e){}

    try{
      const nw=typeof netWorth==='function'?netWorth(G):(Number(G.money)||0);
      const nwText=typeof fmtFull==='function'?fmtFull(nw):`Kč${Math.round(nw).toLocaleString()}`;
      ['g-money','g-money-m'].forEach(id=>{
        const el=document.getElementById(id);
        if(el)el.textContent=nwText;
      });
    }catch(e){}
  };

  Crime._persist=function(){
    const G=window.G;
    if(!G)return;
    try{ if(window.Save&&typeof Save.autosave==='function')Save.autosave(G); }catch(e){}
  };

  Crime._refresh=function(){
    this._forceWalletUI();
    try{ if(window.UI&&typeof UI.update==='function')UI.update(); }catch(e){}
    this._forceWalletUI();
    this._persist();
    try{ this.render(); }catch(e){ console.warn('Crime render failed after wallet update',e); }
  };
})();