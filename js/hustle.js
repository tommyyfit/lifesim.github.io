/* js/hustle.js - LifeSim module */

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const HUSTLE_GIGS = [
  {
    id: 'yardwork', icon: '🌿', name: 'Yard Work', minAge: 13,
    base: [45, 170], stat: 'fitness',
    need: G => (G.fitness || 50) >= 25,
    desc: 'Manual cash jobs around the neighbourhood.',
    tags: ['physical'],
  },
  {
    id: 'resell', icon: '📦', name: 'Flip Items Online', minAge: 14,
    base: [95, 360], stat: 'smarts',
    need: G => G.smarts >= 30 || (G.skills?.negotiation || 0) >= 1,
    desc: 'Buy low, list well, sell for margin.',
    tags: ['business'],
  },
  {
    id: 'tutor', icon: '📚', name: 'Private Tutoring', minAge: 16,
    base: [190, 780], stat: 'smarts',
    need: G => G.smarts >= 55 || (G.skills?.psychology || 0) >= 1,
    desc: 'Help students and charge by the hour.',
    tags: ['education'],
  },
  {
    id: 'photo', icon: '📸', name: 'Photo Shoot', minAge: 16,
    base: [230, 920], stat: 'fame',
    need: G => (G.skills?.photo || 0) >= 1 || G.looks >= 60,
    desc: 'Portraits, parties and social content.',
    tags: ['creative', 'fame'],
  },
  {
    id: 'music', icon: '🎸', name: 'Local Gig', minAge: 16,
    base: [160, 980], stat: 'fame',
    need: G => (G.skills?.music || 0) >= 1,
    desc: 'Bars, weddings and paid live sets.',
    tags: ['creative', 'fame'],
  },
  {
    id: 'editing', icon: '✍️', name: 'Ghostwriting / Editing', minAge: 17,
    base: [190, 880], stat: 'smarts',
    need: G => (G.skills?.writing || 0) >= 1 || (G.skills?.language || 0) >= 1,
    desc: 'Write, polish and package ideas for others.',
    tags: ['creative'],
  },
  {
    id: 'coding', icon: '💻', name: 'Freelance Coding', minAge: 18,
    base: [450, 2400], stat: 'smarts',
    need: G => (G.skills?.coding || 0) >= 2 || (G.skills?.hacking || 0) >= 2,
    desc: 'Build websites, fix bugs and automate tasks.',
    tags: ['tech'],
  },
  {
    id: 'translate', icon: '🗣️', name: 'Translation Work', minAge: 18,
    base: [240, 1250], stat: 'smarts',
    need: G => (G.skills?.language || 0) >= 2,
    desc: 'Documents, subtitles and bilingual support.',
    tags: ['education'],
  },
  {
    id: 'coach', icon: '🏋️', name: 'Fitness Coaching Session', minAge: 18,
    base: [300, 1500], stat: 'fitness',
    need: G => (G.skills?.fitness || 0) >= 2 || (G.fitness || 50) >= 72,
    desc: 'Train clients and sell discipline.',
    tags: ['physical'],
  },
  {
    id: 'escort', icon: '💋', name: 'Private Companion Booking', minAge: 18,
    base: [2800, 14500], stat: 'looks',
    need: G => (G.looks || 50) >= 62 || (G.skills?.beauty || 0) >= 1 || (G.skills?.public_sp || 0) >= 1,
    desc: 'High-paying private bookings with charm, discretion, stress and reputation risk.',
    tags: ['adult'],
  },
  {
    id: 'sales', icon: '🤝', name: 'Commission Sales', minAge: 18,
    base: [320, 1900], stat: 'smarts',
    need: G => (G.skills?.negotiation || 0) >= 2 || (G.skills?.public_sp || 0) >= 2,
    desc: 'Close deals and earn on performance.',
    tags: ['business'],
  },
  {
    id: 'consult', icon: '📊', name: 'Consulting Sprint', minAge: 21,
    base: [750, 3600], stat: 'smarts',
    need: G => (G.skills?.finance || 0) >= 2 || (G.skills?.negotiation || 0) >= 3,
    desc: 'Advisory work for people with money.',
    tags: ['business'],
  },
  {
    id: 'ai_agency', icon: '🤖', name: 'AI Tools Agency', minAge: 18,
    base: [600, 3800], stat: 'smarts',
    need: G => (G.skills?.ai_ml || 0) >= 1 || (G.skills?.coding || 0) >= 2,
    desc: 'Build and sell AI-powered workflows, automations and tools to businesses.',
    tags: ['tech'],
  },
  {
    id: 'crypto_consult', icon: '🪙', name: 'Crypto Consulting', minAge: 20,
    base: [400, 2800], stat: 'smarts',
    need: G => (G.skills?.crypto || 0) >= 2 || (G.skills?.finance || 0) >= 2,
    desc: 'Advise clients on wallets, DeFi, portfolio strategy and blockchain integration.',
    tags: ['tech', 'business'],
  },
  {
    id: 'digital_art', icon: '🎨', name: 'Digital Art & NFTs', minAge: 18,
    base: [200, 4200], stat: 'fame',
    need: G => (G.skills?.art || 0) >= 1 || (G.skills?.ai_ml || 0) >= 1 || (G.looks || 50) >= 60,
    desc: 'Create and sell original digital art, generative pieces and limited-edition drops.',
    tags: ['creative'],
  },
  {
    id: 'ux_design', icon: '🖌️', name: 'UX / Product Design', minAge: 18,
    base: [380, 2600], stat: 'smarts',
    need: G => (G.skills?.art || 0) >= 1 || (G.skills?.coding || 0) >= 1,
    desc: 'Design interfaces, wireframes and brand systems for startups.',
    tags: ['creative', 'tech'],
  },
  {
    id: 'podcast', icon: '🎙️', name: 'Guest Podcast Spot', minAge: 18,
    base: [0, 800], stat: 'fame',
    need: G => (G.fame || 0) >= 20 || (G.skills?.public_sp || 0) >= 2,
    desc: 'Appear on shows and monetise through affiliate deals and exposure.',
    tags: ['fame', 'creative'],
  },
  {
    id: 'dropship', icon: '🚚', name: 'Dropshipping Order', minAge: 18,
    base: [120, 1400], stat: 'smarts',
    need: G => (G.skills?.negotiation || 0) >= 1 || G.smarts >= 45,
    desc: 'Run a no-inventory store and take orders on margin.',
    tags: ['business'],
  },
];

const HUSTLE_VENTURES = [
  {
    id: 'resale_page', icon: '🛍️', name: 'Resale Flip Page', minAge: 14,
    startCost: 80, basePassive: 130, workPay: [75, 300],
    progress: 'clients',
    need: G => G.smarts >= 28 || (G.skills?.negotiation || 0) >= 1,
    unlock: '28+ Smarts or Lv1 Negotiation',
    desc: 'Turn sourcing and bargaining into a small commerce engine.',
  },
  {
    id: 'tutor_network', icon: '📘', name: 'Tutor Network', minAge: 16,
    startCost: 70, basePassive: 250, workPay: [130, 440],
    progress: 'clients',
    need: G => G.smarts >= 55 || (G.skills?.psychology || 0) >= 1,
    unlock: '55+ Smarts or Lv1 Psychology',
    desc: 'Recurring students, referrals and premium sessions.',
  },
  {
    id: 'premium_creator', icon: '📸', name: 'Premium Creator Club',
    legacyIds: ['onlyfans'],
    minAge: 18, startCost: 160, basePassive: 1800, workPay: [900, 5200],
    progress: 'audience',
    need: G => (G.looks || 50) >= 60 || (G.skills?.beauty || 0) >= 1 || (G.skills?.photo || 0) >= 1 || (G.followers || 0) >= 1000,
    unlock: '18+ and looks, beauty/photo skill, or 1K followers',
    desc: 'Premium subscription content with fast attention, higher stress and real reputation tradeoffs.',
  },
  {
    id: 'escort_service', icon: '👠', name: 'Private Companion Agency',
    minAge: 18, startCost: 1200, basePassive: 7200, workPay: [4200, 28000],
    progress: 'clients',
    need: G => (G.looks || 50) >= 66 || ((G.skills?.beauty || 0) >= 1 && (G.skills?.public_sp || 0) >= 1) || (G.followers || 0) >= 2500,
    unlock: '18+ and strong looks, beauty plus social skill, or 2.5K followers',
    desc: 'A high-end private booking operation built on looks, discretion, repeat clients and reputation.',
  },
  {
    id: 'dev_shop', icon: '🧑‍💻', name: 'Freelance Dev Shop',
    minAge: 18, startCost: 420, basePassive: 540, workPay: [280, 1300],
    progress: 'clients',
    need: G => (G.skills?.coding || 0) >= 2 || (G.skills?.hacking || 0) >= 2,
    unlock: 'Lv2 Coding or Lv2 Hacking',
    desc: 'Retainers, bug-fixes and product builds for clients.',
  },
  {
    id: 'fitness_brand', icon: '💪', name: 'Coaching Brand',
    minAge: 18, startCost: 180, basePassive: 340, workPay: [160, 750],
    progress: 'clients',
    need: G => (G.skills?.fitness || 0) >= 2 || (G.fitness || 50) >= 70,
    unlock: 'Lv2 Fitness or 70+ Fitness',
    desc: 'Sell programs, accountability and one-on-one coaching.',
  },
  {
    id: 'consulting_practice', icon: '💼', name: 'Consulting Practice',
    minAge: 21, startCost: 500, basePassive: 800, workPay: [350, 1750],
    progress: 'clients',
    need: G => (G.skills?.finance || 0) >= 2 || (G.skills?.negotiation || 0) >= 3 || (G.smarts || 0) >= 75,
    unlock: 'Lv2 Finance, Lv3 Negotiation, or 75+ Smarts',
    desc: 'Premium clients pay for judgment, positioning and expertise.',
  },
  {
    id: 'ai_saas', icon: '🤖', name: 'AI SaaS Product',
    minAge: 20, startCost: 1800, basePassive: 1400, workPay: [800, 4200],
    progress: 'clients',
    need: G => (G.skills?.ai_ml || 0) >= 2 || (G.skills?.coding || 0) >= 3,
    unlock: 'Lv2 AI or Lv3 Coding',
    desc: 'Build a recurring AI product that earns while you sleep.',
  },
  {
    id: 'nft_studio', icon: '🎨', name: 'Digital Art Studio',
    minAge: 18, startCost: 600, basePassive: 900, workPay: [500, 6500],
    progress: 'audience',
    need: G => (G.skills?.art || 0) >= 1 || (G.skills?.ai_ml || 0) >= 1,
    unlock: 'Lv1 Art or Lv1 AI',
    desc: 'A brand-driven studio selling drops, commissions and digital collectibles.',
  },
  {
    id: 'crypto_fund', icon: '🪙', name: 'Crypto Investment Fund',
    minAge: 22, startCost: 8000, basePassive: 2200, workPay: [1200, 12000],
    progress: 'clients',
    need: G => (G.skills?.crypto || 0) >= 3 || (G.skills?.finance || 0) >= 3,
    unlock: 'Lv3 Crypto or Lv3 Finance',
    desc: 'Manage client capital in DeFi, tokens and crypto markets for a fee.',
  },
  {
    id: 'content_agency', icon: '📣', name: 'Content & Social Agency',
    minAge: 19, startCost: 350, basePassive: 480, workPay: [200, 1100],
    progress: 'clients',
    need: G => (G.skills?.writing || 0) >= 2 || (G.skills?.public_sp || 0) >= 2 || (G.followers || 0) >= 5000,
    unlock: 'Lv2 Writing, Lv2 Public Speaking, or 5K followers',
    desc: 'Run campaigns, grow social accounts and package brand deals for clients.',
  },
  {
    id: 'ecom_store', icon: '🏪', name: 'E-commerce Store',
    minAge: 18, startCost: 650, basePassive: 620, workPay: [300, 1600],
    progress: 'clients',
    need: G => G.smarts >= 50 || (G.skills?.negotiation || 0) >= 2,
    unlock: '50+ Smarts or Lv2 Negotiation',
    desc: 'A product store with real inventory, supplier deals and repeat customers.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ICON FIXES (cross-platform emoji normalisation)
// ─────────────────────────────────────────────────────────────────────────────

const _ICON_FIXES = {
  gig: {
    yardwork: '\u{1F33F}', resell: '\u{1F4E6}', tutor: '\u{1F4DA}',
    photo: '\u{1F4F8}', music: '\u{1F3B8}', editing: '\u{270D}\u{FE0F}',
    coding: '\u{1F4BB}', translate: '\u{1F5E3}\u{FE0F}', coach: '\u{1F3CB}\u{FE0F}',
    escort: '\u{1F48B}', sales: '\u{1F91D}', consult: '\u{1F4CA}',
    ai_agency: '\u{1F916}', crypto_consult: '\u{1FA99}', digital_art: '\u{1F3A8}',
    ux_design: '\u{1F58C}\u{FE0F}', podcast: '\u{1F399}\u{FE0F}',
    dropship: '\u{1F69A}',
  },
  venture: {
    resale_page: '\u{1F6CD}\u{FE0F}', tutor_network: '\u{1F4D8}',
    premium_creator: '\u{1F4F8}', escort_service: '\u{1F460}',
    dev_shop: '\u{1F4BB}', fitness_brand: '\u{1F4AA}',
    consulting_practice: '\u{1F4BC}', ai_saas: '\u{1F916}',
    nft_studio: '\u{1F3A8}', crypto_fund: '\u{1FA99}',
    content_agency: '\u{1F4E3}', ecom_store: '\u{1F3EA}',
  },
};

HUSTLE_GIGS.forEach(g => { if (_ICON_FIXES.gig[g.id]) g.icon = _ICON_FIXES.gig[g.id]; });
HUSTLE_VENTURES.forEach(v => { if (_ICON_FIXES.venture[v.id]) v.icon = _ICON_FIXES.venture[v.id]; });

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const _PREMIUM_OVERRIDES = {
  icon: '\u{1F4F8}', name: 'Premium Creator Club', startCost: 220, basePassive: 4200,
  workPay: [3200, 22000],
  desc: 'A premium subscription creator brand. Strong upside, fast audience growth, privacy pressure and brand risk.',
};

const _BRAND_RISK_DEFAULTS = {
  premium_creator: 35, escort_service: 24, creator_channel: 12,
  consulting_practice: 8,
};

const _VENTURE_PERKS = {
  creator_channel:      { fame: [1,4],  happiness: [3,7],  stress: [2,6] },
  premium_creator:      { fame: [3,7],  looks: [1,4],  happiness: [3,8],  stress: [4,10], karma: [-2,0] },
  escort_service:       { fame: [2,5],  looks: [1,3],  happiness: [2,6],  stress: [3,8] },
  dev_shop:             { smarts: [1,4], stress: [2,7] },
  fitness_brand:        { fitness: [1,4], health: [1,3], stress: [1,5] },
  consulting_practice:  { smarts: [1,3], fame: [1,3],  stress: [3,8] },
  tutor_network:        { smarts: [1,3], happiness: [2,5] },
  resale_page:          { smarts: [1,2], happiness: [1,4] },
  content_agency:       { smarts: [1,2], fame: [1,3],  stress: [2,6] },
  ecom_store:           { smarts: [1,3], stress: [2,6] },
  ai_saas:              { smarts: [2,4], stress: [3,8] },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS  (module-level, not exported but used internally by Hustle)
// ─────────────────────────────────────────────────────────────────────────────

/** Clamp a number between lo and hi (default 0–100). */
function _clamp(v, lo = 0, hi = 100) { return Math.max(lo, Math.min(hi, v)); }

/** Random integer in [lo, hi]. */
function _rand(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

/** Economy scale wrapper — falls back to identity if `sc` not present globally. */
function _sc(v) { return typeof sc === 'function' ? sc(v) : v; }

/** Format currency — falls back to plain number if `fmt` not present globally. */
function _fmt(v) { return typeof fmt === 'function' ? fmt(v) : `$${v.toLocaleString()}`; }

// ─────────────────────────────────────────────────────────────────────────────
// MAIN MODULE
// ─────────────────────────────────────────────────────────────────────────────

const Hustle = {
  VERSION:1,
  HISTORY_LIMIT: 20,
  ACTION_LIMITS: { focus: 1, start: 2, improve: 2, rebrand: 1, cashOut: 2 },

  // ── Utility ──────────────────────────────────────────────────────────────

  _esc(v) {
    if (typeof escHTML === 'function') return escHTML(v);
    return String(v ?? '').replace(/[&<>'"]/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]
    ));
  },

  _G() { return window.G || null; },

  // ── Action tracking ───────────────────────────────────────────────────────

  _resetActionYearIfNeeded(G = this._G()) {
    if (!G) return;
    if (!G.hustle || typeof G.hustle !== 'object') G.hustle = {};
    if (!Number.isFinite(G.hustle.actionYear)) G.hustle.actionYear = G.age || 0;
    if (!G.hustle.actionUses || typeof G.hustle.actionUses !== 'object') G.hustle.actionUses = {};
    if (G.hustle.actionYear !== (G.age || 0)) {
      G.hustle.actionYear = G.age || 0;
      G.hustle.actionUses = {};
    }
  },

  _usesLeft(action, G = this._G()) {
    if (!G) return 0;
    this._resetActionYearIfNeeded(G);
    const limit = this.ACTION_LIMITS[action] ?? 99;
    return Math.max(0, limit - (G.hustle?.actionUses?.[action] || 0));
  },

  _canUseAction(action, msg = 'That action is already used enough.') {
    const G = this._G(); if (!G) return false;
    this._resetActionYearIfNeeded(G);
    if (this._usesLeft(action, G) <= 0) { UI.toast(msg, 'bad'); return false; }
    return true;
  },

  _markAction(action, G = this._G()) {
    if (!G) return;
    this._resetActionYearIfNeeded(G);
    G.hustle.actionUses[action] = (G.hustle.actionUses[action] || 0) + 1;
  },

  // ── History ───────────────────────────────────────────────────────────────

  _recordHistory(type, label, amount = 0, meta = '') {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    G.hustle.history.unshift({ age: G.age || 0, type, label, amount, meta });
    if (G.hustle.history.length > this.HISTORY_LIMIT) G.hustle.history.length = this.HISTORY_LIMIT;
  },

  // ── State initialisation ─────────────────────────────────────────────────

  ensureState(G = this._G()) {
    if (!G) return;
    const h = (G.hustle && typeof G.hustle === 'object') ? G.hustle : {};
    G.hustle = {
      rep:          _clamp(Number.isFinite(h.rep) ? h.rep : 0, 0, 100),
      earnings:     Math.max(0, Math.round(Number.isFinite(h.earnings) ? h.earnings : 0)),
      lastGigAge:   Number.isFinite(h.lastGigAge) ? h.lastGigAge : -1,
      lastActionAge: Number.isFinite(h.lastActionAge) ? h.lastActionAge : (Number.isFinite(h.lastGigAge) ? h.lastGigAge : -1),
      streak:       Math.max(0, Math.round(Number.isFinite(h.streak) ? h.streak : 0)),
      clients:      Math.max(0, Math.round(Number.isFinite(h.clients) ? h.clients : 0)),
      bestYear:     Math.max(0, Math.round(Number.isFinite(h.bestYear) ? h.bestYear : 0)),
      totalActions: Math.max(0, Math.round(Number.isFinite(h.totalActions) ? h.totalActions : 0)),
      actionYear:   Number.isFinite(h.actionYear) ? h.actionYear : (G.age || 0),
      actionUses:   (h.actionUses && typeof h.actionUses === 'object') ? h.actionUses : {},
      history:      Array.isArray(h.history) ? h.history : [],
      ventures:     (h.ventures && typeof h.ventures === 'object' && !Array.isArray(h.ventures)) ? h.ventures : {},
    };
    this._resetActionYearIfNeeded(G);
    this._migrateLegacyVentures(G);
    this._sanitiseVentures(G);
    G.hustle.clients = Object.values(G.hustle.ventures || {}).reduce((s, v) => s + (v.clients || 0), 0);
  },

  _migrateLegacyVentures(G) {
    // onlyfans → premium_creator
    if (G.hustle.ventures.onlyfans && !G.hustle.ventures.premium_creator) {
      G.hustle.ventures.premium_creator = { ...G.hustle.ventures.onlyfans, id: 'premium_creator' };
      delete G.hustle.ventures.onlyfans;
    }
    // creator_channel → Social stats (absorbed into Social system)
    if (G.hustle.ventures.creator_channel) {
      const legacy = G.hustle.ventures.creator_channel;
      G.followers = (G.followers || 0) + Math.max(150, Math.round((legacy.audience || 0) * 0.65));
      G.fame = _clamp((G.fame || 0) + Math.max(2, Math.round((legacy.level || 1) * 1.5)));
      if (typeof Social !== 'undefined' && Social.ensure) {
        Social.ensure();
        const S = G.social || {};
        S.contentSkill   = _clamp((S.contentSkill || 35)   + Math.max(4, (legacy.level || 1) * 4), 0, 100);
        S.consistency    = _clamp((S.consistency || 45)    + Math.max(3, Math.round((legacy.momentum || 35) / 10)), 0, 100);
        S.audienceQuality= _clamp((S.audienceQuality || 45) + Math.max(3, Math.round((legacy.quality || 45) / 12)), 0, 100);
      }
      Engine.log('🎥 Your old Creator Channel was folded into Social growth and followers.', 'neutral');
      delete G.hustle.ventures.creator_channel;
    }
  },

  _sanitiseVentures(G) {
    Object.entries(G.hustle.ventures).forEach(([id, v]) => {
      if (!v || typeof v !== 'object') { delete G.hustle.ventures[id]; return; }
      const def = this._ventureDef(id);
      if (!def) { delete G.hustle.ventures[id]; return; }
      v.id           = def.id;
      v.level        = _clamp(Number.isFinite(v.level)    ? Math.round(v.level) : 1, 1, 6);
      v.progress     = _clamp(Number.isFinite(v.progress) ? v.progress : 0, 0, 100);
      v.momentum     = _clamp(Number.isFinite(v.momentum) ? v.momentum : 35, 0, 100);
      v.audience     = Math.max(0, Math.round(Number.isFinite(v.audience) ? v.audience : 0));
      v.clients      = Math.max(0, Math.round(Number.isFinite(v.clients) ? v.clients : 0));
      v.earned       = Math.max(0, Math.round(Number.isFinite(v.earned) ? v.earned : 0));
      v.startedAge   = Number.isFinite(v.startedAge) ? v.startedAge : (G.age || 0);
      v.lastWorkedAge= Number.isFinite(v.lastWorkedAge) ? v.lastWorkedAge : -1;
      v.brandRisk    = _clamp(Number.isFinite(v.brandRisk) ? v.brandRisk : this._defaultBrandRisk(def), 0, 100);
      v.quality      = _clamp(Number.isFinite(v.quality)  ? v.quality : 45, 0, 100);
      // Venture-specific fields
      if (def.id === 'premium_creator') {
        v.loyalty    = _clamp(Number.isFinite(v.loyalty)    ? v.loyalty    : _rand(40, 58), 0, 100);
        v.boundaries = _clamp(Number.isFinite(v.boundaries) ? v.boundaries : _rand(45, 62), 0, 100);
        v.whales     = Math.max(0, Math.round(Number.isFinite(v.whales) ? v.whales : _rand(0, 2)));
      } else if (def.id === 'escort_service') {
        v.vipClients = Math.max(0, Math.round(Number.isFinite(v.vipClients) ? v.vipClients : _rand(0, 1)));
        v.screening  = _clamp(Number.isFinite(v.screening)  ? v.screening  : _rand(40, 56), 0, 100);
        v.discretion = _clamp(Number.isFinite(v.discretion) ? v.discretion : _rand(45, 62), 0, 100);
        v.roster     = Math.max(1, Math.round(Number.isFinite(v.roster) ? v.roster : 1));
      }
    });
  },

  // ── Queries ───────────────────────────────────────────────────────────────

  availableGigs(G = this._G()) {
    this.ensureState(G);
    return HUSTLE_GIGS.filter(g => (G.age || 0) >= g.minAge && g.need(G));
  },

  activeVentures(G = this._G()) {
    this.ensureState(G);
    return Object.values(G.hustle.ventures || {});
  },

  ventureLimit(G = this._G()) {
    const skillDepth = Object.values(G.skills || {}).filter(v => v >= 3).length;
    if ((G.hustle?.rep || 0) >= 75 || skillDepth >= 5) return 4;
    if ((G.hustle?.rep || 0) >= 35 || skillDepth >= 2) return 2;
    return 1;
  },

  projectedIncome(G = this._G()) {
    this.ensureState(G);
    return this.activeVentures(G).reduce((sum, v) => {
      const def = this._ventureDef(v.id);
      return sum + (def ? this._ventureAnnualPayout(v, def, G) : 0);
    }, 0);
  },

  portfolioQuality(G = this._G()) {
    const ventures = this.activeVentures(G);
    if (!ventures.length) return { label: 'No portfolio', color: 'var(--muted)', score: 0 };
    const score = Math.round(
      ventures.reduce((s, v) =>
        s + (v.quality || 45) + (v.momentum || 35) + (v.level || 1) * 8 - (v.brandRisk || 0) * 0.25, 0
      ) / ventures.length
    );
    if (score >= 85) return { label: 'Elite machine 🔥', color: 'var(--green)', score };
    if (score >= 65) return { label: 'Strong engine',    color: 'var(--teal)',  score };
    if (score >= 42) return { label: 'Promising',        color: 'var(--yellow)', score };
    return             { label: 'Messy',                color: 'var(--red)',   score };
  },

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    const el = document.getElementById('tab-hustle');
    if (!el) return;

    if ((G.age || 0) < 13) {
      el.innerHTML = '<div class="empty"><span class="ei">🧰</span><p>Too young for side hustles.<br>Quick cash starts at 13, ventures open as your stats and skills improve.</p></div>';
      return;
    }

    const focusUsed = this._usesLeft('focus', G) <= 0;
    const ventures  = this.activeVentures(G);
    const limit     = this.ventureLimit(G);
    const startable = this._startableVentures(G);
    const nextIdeas = this._lockedVentures(G).slice(0, 3);
    const gigs      = this.availableGigs(G);
    const passive   = this.projectedIncome(G);
    const quality   = this.portfolioQuality(G);
    const rep       = G.hustle.rep;
    const repColor  = rep >= 65 ? 'var(--green)' : rep >= 35 ? 'var(--yellow)' : 'var(--muted)';
    const repSub    = rep >= 65 ? 'Booked and buzzing' : rep >= 35 ? 'Trusted locally' : 'Still building a name';

    let h = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
      ${this._metricBox('Hustle Rep', rep, repColor, repSub)}
      ${this._metricBox('Lifetime Earnings', _fmt(G.hustle.earnings || 0), 'var(--green)', focusUsed ? 'Major move used this year' : '1 major move ready')}
      ${this._metricBox('Passive / yr', _fmt(passive), passive > 0 ? 'var(--accent)' : 'var(--muted)', ventures.length ? `From ${ventures.length} venture${ventures.length !== 1 ? 's' : ''}` : 'No passive income yet')}
      ${this._metricBox('Portfolio', quality.score ? `${quality.score}/100` : '—', quality.color, `${quality.label} · ${ventures.length}/${limit} slots`)}
    </div>`;

    if (G.hustle.streak >= 2) {
      h += `<div class="info-box" style="border-color:var(--accent)">🔥 ${G.hustle.streak}-year hustle streak! Consistency compounds your earnings and reputation.</div>`;
    } else {
      h += '<div class="info-box"><p>💼 Quick gigs pay instantly. Ventures compound every year. Work at least one major hustle move annually to keep the streak alive.</p></div>';
    }

    h += this._renderActiveVentures(G, ventures, focusUsed);
    h += this._renderStartableVentures(G, startable, ventures.length, limit);
    h += this._renderLockedVentures(nextIdeas);
    h += this._renderQuickGigs(G, gigs, focusUsed);
    h += this._renderHistory(G);

    el.innerHTML = h;
  },

  _metricBox(label, value, color, sub) {
    return `<div class="nw-box" style="margin-bottom:0">
      <div class="nw-lbl">${this._esc(label)}</div>
      <div class="nw-amt" style="font-size:22px${color ? `;color:${color}` : ''}">${value}</div>
      <div class="nw-sub">${this._esc(sub)}</div>
    </div>`;
  },

  _miniMetric(label, value, color) {
    return `<div style="background:var(--s1);border:1px solid var(--b1);border-radius:10px;padding:7px 9px">
      <div style="font-size:10px;font-weight:800;color:var(--muted)">${this._esc(label)}</div>
      <div style="font-size:15px;font-weight:900;color:${color}">${value}</div>
    </div>`;
  },

  _renderActiveVentures(G, ventures, focusUsed) {
    let h = '<div class="sec">Active Ventures</div>';
    if (!ventures.length) {
      return h + '<div class="empty"><p>No active ventures yet.<br>Launch one below to start building recurring income.</p></div>';
    }
    h += '<div style="display:grid;gap:8px">';
    ventures.forEach(v => {
      const def = this._ventureDef(v.id); if (!def) return;
      const yearly     = this._ventureAnnualPayout(v, def, G);
      const prog       = v.level >= 6 ? 100 : (v.progress || 0);
      const isAudience = def.progress === 'audience';
      const metricVal  = isAudience ? (typeof fmtFollowers === 'function' ? fmtFollowers(v.audience || 0) : (v.audience || 0)) : (v.clients || 0);
      const cashout    = this._cashoutValue(v, def, G);
      const riskColor  = (v.brandRisk || 0) >= 60 ? 'var(--red)' : (v.brandRisk || 0) >= 30 ? 'var(--yellow)' : 'var(--green)';
      const idle       = v.lastWorkedAge >= 0 && (G.age - v.lastWorkedAge) >= 2;

      h += `<div class="row-card hustle-venture-card" style="display:block${idle ? ';opacity:.85' : ''}">
        ${idle ? '<div style="font-size:10px;font-weight:800;color:var(--yellow);margin-bottom:4px">⚠️ Idle — work it to maintain momentum</div>' : ''}
        <div style="display:flex;gap:12px;align-items:flex-start">
          <span class="ri" style="font-size:24px">${def.icon}</span>
          <div class="rd" style="flex:1;min-width:0">
            <div class="rt">${this._esc(def.name)}</div>
            <div class="rs">${this._esc(def.desc)}</div>
            <div class="hustle-metric-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:8px">
              ${this._miniMetric('Level', `Lv ${v.level}`, 'var(--accent)')}
              ${this._miniMetric(isAudience ? 'Audience' : 'Clients', metricVal, 'var(--txt)')}
              ${this._miniMetric('Passive / yr', _fmt(yearly), 'var(--green)')}
              ${this._miniMetric('Brand Risk', `${v.brandRisk || 0}%`, riskColor)}
            </div>
            ${this._ventureInsightRow(def, v)}
            <div style="margin-top:8px">
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;font-weight:800;color:var(--muted);margin-bottom:4px">
                <span>Momentum ${v.momentum}% · Quality ${v.quality}%</span>
                <span>${v.level >= 6 ? '✅ Max level' : `Next level ${prog}%`}</span>
              </div>
              <div class="prog-bar"><div class="prog-fill" style="width:${prog}%;background:${v.level >= 6 ? 'var(--yellow)' : 'var(--accent)'}"></div></div>
            </div>
            <div class="hustle-action-row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
              <button type="button" class="btn-primary btn-sm" style="width:auto;opacity:${focusUsed ? '.55' : '1'}" onclick="${focusUsed ? '' : `Hustle.workVenture('${def.id}')`}" ${focusUsed ? 'disabled' : ''}>${focusUsed ? 'Focus used' : 'Work it'}</button>
              <button type="button" class="btn-secondary btn-sm" style="width:auto" onclick="Hustle.improveVenture('${def.id}')">Invest ${_fmt(this._improveCost(v, def))}</button>
              <button type="button" class="btn-secondary btn-sm" style="width:auto" onclick="Hustle.cashOut('${def.id}')">Cash out ${_fmt(cashout)}</button>
              ${this._ventureActionExtras(def, v, G, focusUsed)}
            </div>
          </div>
        </div>
      </div>`;
    });
    return h + '</div>';
  },

  _ventureInsightRow(def, v) {
    if (def.id === 'premium_creator') {
      return `<div class="hustle-insight-row">
        <span class="hustle-insight-chip"><b>Audience Trust</b>${v.loyalty || 45}%</span>
        <span class="hustle-insight-chip"><b>Privacy Score</b>${v.boundaries || 50}%</span>
        <span class="hustle-insight-chip"><b>VIP Supporters</b>${v.whales || 0}</span>
      </div>`;
    }
    if (def.id === 'escort_service') {
      return `<div class="hustle-insight-row">
        <span class="hustle-insight-chip"><b>VIP Clients</b>${v.vipClients || 0}</span>
        <span class="hustle-insight-chip"><b>Screening</b>${v.screening || 45}%</span>
        <span class="hustle-insight-chip"><b>Discretion</b>${v.discretion || 50}%</span>
        <span class="hustle-insight-chip"><b>Roster</b>${v.roster || 1}</span>
      </div>`;
    }
    return '';
  },

  _ventureActionExtras(def, v, G, focusUsed) {
    const fo = focusUsed;
    if (def.id === 'premium_creator') {
      const btn = (label, fn) =>
        `<button type="button" class="btn-secondary btn-sm" style="width:auto;opacity:${fo ? '.55' : '1'}" onclick="${fo ? '' : `Hustle.${fn}()`}" ${fo ? 'disabled' : ''}>${fo ? 'Used' : label}</button>`;
      return `
        ${btn('Premium Drop',   'onlyFansDrop')}
        ${btn('VIP Offer',      'onlyFansCustoms')}
        ${btn('Community Care',    'onlyFansRetention')}
        ${btn('Creator Collab',   'onlyFansCollab')}
        <button type="button" class="btn-secondary btn-sm" style="width:auto" onclick="Hustle.onlyFansRebrand()">Brand Refresh</button>
      `;
    }
    if (def.id === 'escort_service') {
      const btn = (label, fn, needsFocus) =>
        `<button type="button" class="btn-secondary btn-sm" style="width:auto;opacity:${needsFocus && fo ? '.55' : '1'}" onclick="${needsFocus && fo ? '' : `Hustle.${fn}()`}" ${needsFocus && fo ? 'disabled' : ''}>${needsFocus && fo ? 'Used' : label}</button>`;
      return `
        ${btn('VIP Night',      'agencyVipNight', true)}
        <button type="button" class="btn-secondary btn-sm" style="width:auto" onclick="Hustle.agencyScreening()">Safety Upgrade</button>
        <button type="button" class="btn-secondary btn-sm" style="width:auto" onclick="Hustle.agencyRecruit()">Recruit Talent</button>
      `;
    }
    return '';
  },

  _renderStartableVentures(G, startable, count, limit) {
    let h = '<div class="sec">Launch a Venture</div>';
    if (!startable.length) {
      const txt = count >= limit
        ? `You're at your venture cap (${limit}/${limit}). Cash out, raise reputation, or deepen skills to unlock another slot.`
        : 'Nothing else is unlocked yet — age up and build skills.';
      return h + `<div class="empty"><p>${this._esc(txt)}</p></div>`;
    }
    h += '<div style="display:grid;gap:8px">';
    startable.forEach(def => {
      const cost = _sc(def.startCost || 0);
      const canAfford = (G.money || 0) >= cost;
      h += `<div class="row-card" style="display:flex;align-items:center;gap:12px">
        <span class="ri">${def.icon}</span>
        <div class="rd" style="flex:1">
          <div class="rt">${this._esc(def.name)}</div>
          <div class="rs">${this._esc(def.desc)}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">Start ${_fmt(cost)} · Base passive ${_fmt(_sc(def.basePassive))}/yr</div>
        </div>
        <button type="button" class="btn-primary btn-sm" style="width:auto;opacity:${canAfford ? 1 : .55}" onclick="Hustle.startVenture('${def.id}')">${canAfford ? 'Launch' : 'Need cash'}</button>
      </div>`;
    });
    return h + '</div>';
  },

  _renderLockedVentures(nextIdeas) {
    if (!nextIdeas.length) return '';
    let h = '<div class="sec">What Unlocks Next</div><div style="display:grid;gap:8px">';
    nextIdeas.forEach(def => {
      h += `<div class="row-card locked" style="display:flex;align-items:center;gap:12px">
        <span class="ri">${def.icon}</span>
        <div class="rd">
          <div class="rt">${this._esc(def.name)}</div>
          <div class="rs">${this._esc(def.desc)}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">🔒 ${this._esc(def.unlock)}</div>
        </div>
      </div>`;
    });
    return h + '</div>';
  },

  _renderQuickGigs(G, gigs, focusUsed) {
    let h = '<div class="sec">Quick Cash Gigs</div>';
    if (!gigs.length) {
      return h + '<div class="empty"><p>No quick gigs unlocked yet.<br>Age up, raise stats, or build a few skills.</p></div>';
    }
    h += '<div style="display:grid;gap:8px">';
    gigs.forEach(g => {
      const [lo, hi] = this._estimateGig(g, G);
      h += `<div class="row-card ${focusUsed ? 'locked' : ''}" onclick="${focusUsed ? '' : `Hustle.doGig('${g.id}')`}">
        <span class="ri">${g.icon}</span>
        <div class="rd">
          <div class="rt">${this._esc(g.name)}</div>
          <div class="rs">${this._esc(g.desc)}</div>
        </div>
        <div class="rv" style="white-space:nowrap">${focusUsed ? '—' : `${_fmt(lo)}–${_fmt(hi)}`}</div>
      </div>`;
    });
    return h + '</div>';
  },

  _renderHistory(G) {
    const rows = (G.hustle?.history || []).slice(0, 8);
    if (!rows.length) return '';
    const typeIcon = { cashout: '💰', passive: '📈', start: '🚀', improve: '🛠️', rebrand: '✨', gig: '⚡', venture: '💼' };
    let h = '<div class="sec">Hustle History</div>';
    rows.forEach(row => {
      h += `<div class="row-card">
        <span class="ri">${typeIcon[row.type] || '💼'}</span>
        <div class="rd">
          <div class="rt">Age ${row.age} · ${this._esc(row.label)}</div>
          <div class="rs">${this._esc(row.meta || row.type)}</div>
        </div>
        <div class="rv">${row.amount ? (row.amount < 0 ? `−${_fmt(-row.amount)}` : _fmt(row.amount)) : ''}</div>
      </div>`;
    });
    return h;
  },

  // ── Actions ───────────────────────────────────────────────────────────────

  startVenture(id) {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    if ((G.age || 0) < 18) { UI.toast('Ventures unlock at age 18. Teen Gigs are available before then.'); return; }
    const def = this._ventureDef(id);
    if (!def || (G.age || 0) < def.minAge || !def.need(G)) { UI.toast('That venture is not unlocked yet.'); return; }
    if (G.hustle.ventures[def.id]) { UI.toast('You already run that venture.'); return; }
    if (this.activeVentures(G).length >= this.ventureLimit(G)) { UI.toast('You cannot manage another venture yet. Cash one out or raise your rep.'); return; }
    if (!this._canUseAction('start', 'You already launched enough ventures this year.')) return;
    const cost = _sc(def.startCost || 0);
    if ((G.money || 0) < cost) { UI.toast(`Need ${_fmt(cost)} to start this.`); return; }

    G.money -= cost;
    this._markAction('start', G);
    const created = {
      id: def.id, level: 1,
      progress:     _rand(18, 34),
      momentum:     _rand(28, 44),
      audience:     def.progress === 'audience' ? (def.id === 'premium_creator' ? _rand(220, 850) : _rand(80, 260)) : 0,
      clients:      def.progress === 'clients' ? _rand(1, 3) : 0,
      earned: 0,
      startedAge: G.age,
      lastWorkedAge: -1,
      brandRisk: this._defaultBrandRisk(def),
      quality: _rand(38, 52),
    };
    if (def.id === 'premium_creator') {
      created.loyalty    = _rand(42, 58);
      created.boundaries = _rand(46, 62);
      created.whales     = _rand(0, 2);
    } else if (def.id === 'escort_service') {
      created.vipClients = _rand(0, 1);
      created.screening  = _rand(42, 56);
      created.discretion = _rand(46, 62);
      created.roster     = 1;
    }
    G.hustle.ventures[def.id] = created;
    G.hustle.rep     = _clamp((G.hustle.rep || 0) + _rand(2, 5));
    G.happiness      = _clamp(G.happiness + _rand(2, 6));
    G.stress         = _clamp((G.stress || 0) + _rand(1, 4));
    if (def.progress === 'audience') {
      G.followers = (G.followers || 0) + _rand(40, 180);
      this._touchSocial(def, G, 2);
    }
    this._recordHistory('start', `Started ${def.name}`, -cost, 'venture launched');
    Engine.log(`${def.icon} Started ${def.name} for ${_fmt(cost)}.`, 'special');
    UI.update(); this.render();
  },

  doGig(id) {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    if ((G.age || 0) < 13) { UI.toast('Too young for hustle work.'); return; }
    if (!this._canUseAction('focus', 'You already made your big hustle move. Rest up.')) return;

    const g = HUSTLE_GIGS.find(x => x.id === id);
    if (!g || (G.age || 0) < g.minAge || !g.need(G)) return;

    const statBoost  = (G[g.stat] || 50) / 125;
    const skillBoost = this._gigSkillBonus(g, G) * 0.18;
    const repBoost   = (G.hustle.rep || 0) / 185;
    const streakBonus= Math.min(0.25, (G.hustle.streak || 0) * 0.04); // streak multiplier
    const base       = _sc(_rand(g.base[0], g.base[1]));
    const payout     = Math.round(base * (1 + statBoost + skillBoost + repBoost + streakBonus));
    const continued  = G.hustle.lastActionAge === G.age - 1;

    G.money                  = (G.money || 0) + payout;
    G.hustle.earnings        = (G.hustle.earnings || 0) + payout;
    G.hustle.rep             = _clamp((G.hustle.rep || 0) + _rand(4, 10));
    G.hustle.clients         = Math.max(0, (G.hustle.clients || 0) + _rand(1, 3));
    G.hustle.lastGigAge      = G.age;
    G.hustle.lastActionAge   = G.age;
    this._markAction('focus', G);
    G.hustle.streak          = continued ? (G.hustle.streak || 0) + 1 : 1;
    G.hustle.totalActions    = (G.hustle.totalActions || 0) + 1;
    G.happiness              = _clamp(G.happiness + _rand(2, 7));
    G.stress                 = _clamp((G.stress || 0) + _rand(2, 7));

    // Stat side-effects by gig type
    if (['photo', 'music', 'sales', 'escort', 'podcast'].includes(g.id)) G.fame = _clamp((G.fame || 0) + _rand(1, 4));
    if (['tutor', 'coding', 'consult', 'editing', 'translate', 'ai_agency'].includes(g.id)) G.smarts = _clamp(G.smarts + _rand(1, 3));
    if (['coach', 'yardwork'].includes(g.id)) G.fitness = _clamp((G.fitness || 50) + _rand(1, 3));
    if (['photo', 'editing', 'ux_design', 'digital_art'].includes(g.id) && Math.random() < 0.45) G.followers = (G.followers || 0) + _rand(30, 260);
    if (g.id === 'podcast') G.followers = (G.followers || 0) + _rand(100, 800);
    if (g.id === 'escort') {
      G.looks     = _clamp(G.looks + _rand(1, 3));
      G.happiness = _clamp(G.happiness + _rand(1, 4));
      G.stress    = _clamp((G.stress || 0) + _rand(3, 9));
      G.karma     = _clamp((G.karma || 0) - _rand(1, 4), -100, 100);
      if (Math.random() < 0.35) G.followers = (G.followers || 0) + _rand(20, 140);
      this._adultPartnerImpact({
        icon: '💔', label: 'private companion booking',
        loveHit: 10, intimacyHit: 12, exposure: 0.58, breakChance: 0.24, directCheating: true,
      });
    }

    this._recordHistory('gig', g.name, payout, 'quick gig');
    Engine.log(`${g.icon} ${g.name} paid ${_fmt(payout)}.${G.hustle.streak >= 3 ? ' 🔥 On a streak!' : ''}`, 'money');
    UI.update(); this.render();
  },

  workVenture(id) {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    if (!this._canUseAction('focus', 'You already focused on a hustle this year.')) return;

    const v   = G.hustle.ventures[id];
    const def = this._ventureDef(id);
    if (!v || !def) return;

    const skill        = this._ventureSkillScore(def, G);
    const statFit      = this._ventureStatFit(def, G);
    const repBoost     = (G.hustle.rep || 0) / 140;
    const momentumBoost= (v.momentum || 0) / 170;
    const levelBoost   = (v.level || 1) * 0.11;
    const qualityBoost = (v.quality || 45) / 220;
    const streakBonus  = Math.min(0.30, (G.hustle.streak || 0) * 0.05);
    const cashBase     = _sc(_rand(def.workPay[0], def.workPay[1]));
    const payout       = Math.round(cashBase * (1 + skill * 0.16 + statFit + repBoost + momentumBoost + levelBoost + qualityBoost + streakBonus));
    const growth       = this._ventureGrowth(def, G, v, skill);
    const progressGain = _rand(20, 34) + (skill * 5) + Math.floor((v.momentum || 0) / 15) + Math.floor((v.quality || 45) / 18);
    const beforeLevel  = v.level;
    const continued    = G.hustle.lastActionAge === G.age - 1;

    G.money                = (G.money || 0) + payout;
    G.hustle.earnings      = (G.hustle.earnings || 0) + payout;
    G.hustle.rep           = _clamp((G.hustle.rep || 0) + _rand(5, 11));
    G.hustle.lastGigAge    = G.age;
    G.hustle.lastActionAge = G.age;
    this._markAction('focus', G);
    G.hustle.streak        = continued ? (G.hustle.streak || 0) + 1 : 1;
    G.hustle.totalActions  = (G.hustle.totalActions || 0) + 1;

    v.earned     = (v.earned || 0) + payout;
    v.momentum   = _clamp((v.momentum || 0) + _rand(10, 18) + (skill * 2));
    v.quality    = _clamp((v.quality || 45) + _rand(2, 6));
    v.progress   = (v.progress || 0) + progressGain;
    v.lastWorkedAge = G.age;

    if (def.progress === 'audience') {
      v.audience = (v.audience || 0) + growth;
      const spill = Math.max(20, Math.round(growth * (def.id === 'premium_creator' ? 0.55 : 0.45)));
      G.followers = (G.followers || 0) + spill;
    } else {
      const newClients = Math.max(1, Math.round(growth / 3));
      v.clients        = Math.max(0, (v.clients || 0) + newClients);
      G.hustle.clients = (G.hustle.clients || 0) + newClients;
    }

    // Venture-specific updates
    if (def.id === 'premium_creator') {
      v.brandRisk  = _clamp((v.brandRisk || 40) + _rand(1, 4));
      v.loyalty    = _clamp((v.loyalty || 45) + _rand(2, 6));
      v.boundaries = _clamp((v.boundaries || 50) - _rand(0, 2));
      if (Math.random() < 0.24) v.whales = Math.max(0, (v.whales || 0) + 1);
    }
    if (def.id === 'escort_service') {
      v.brandRisk  = _clamp((v.brandRisk || 24) + _rand(1, 3));
      v.vipClients = Math.max(0, (v.vipClients || 0) + (Math.random() < 0.28 ? 1 : 0));
      v.discretion = _clamp((v.discretion || 50) - _rand(0, 2));
      v.screening  = _clamp((v.screening || 45) - _rand(0, 1));
    }

    this._levelUp(v, G);
    this._applyVenturePerks(def, G);
    this._touchSocial(def, G, 4);
    if (def.id === 'premium_creator') this._adultPartnerImpact({ icon: '📸', label: 'premium creator work', loveHit: 4, intimacyHit: 5, exposure: 0.24, breakChance: 0.08 });
    else if (def.id === 'escort_service') this._adultPartnerImpact({ icon: '👠', label: 'private companion agency work', loveHit: 7, intimacyHit: 8, exposure: 0.42, breakChance: 0.16 });

    const levelTxt   = v.level > beforeLevel ? ` Level up to Lv ${v.level}!` : '';
    const metricTxt  = def.progress === 'audience'
      ? `+${typeof fmtFollowers === 'function' ? fmtFollowers(growth) : growth} subscribers`
      : `+${Math.max(1, Math.round(growth / 3))} clients`;
    this._recordHistory('venture', def.name, payout, `${metricTxt}${levelTxt}`);
    Engine.log(`${def.icon} ${def.name} generated ${_fmt(payout)} and ${metricTxt}.${levelTxt}`, v.level > beforeLevel ? 'special' : 'money');
    UI.update(); this.render();
  },

  improveVenture(id) {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    const v   = G.hustle.ventures[id];
    const def = this._ventureDef(id);
    if (!v || !def) return;
    if (!this._canUseAction('improve', 'You already invested in enough ventures this year.')) return;
    const cost = this._improveCost(v, def);
    if ((G.money || 0) < cost) { UI.toast(`Need ${_fmt(cost)} to invest.`); return; }

    G.money -= cost;
    this._markAction('improve', G);
    v.quality   = _clamp((v.quality || 45) + _rand(9, 16));
    v.momentum  = _clamp((v.momentum || 35) + _rand(4, 10));
    v.brandRisk = _clamp((v.brandRisk || 0) - _rand(3, 8));
    v.progress  = _clamp((v.progress || 0) + _rand(5, 12));
    if (def.id === 'premium_creator') {
      v.loyalty    = _clamp((v.loyalty || 45) + _rand(4, 9));
      v.boundaries = _clamp((v.boundaries || 50) + _rand(3, 7));
    }
    if (def.id === 'escort_service') {
      v.screening  = _clamp((v.screening || 45) + _rand(5, 10));
      v.discretion = _clamp((v.discretion || 50) + _rand(4, 9));
    }
    G.hustle.rep = _clamp((G.hustle.rep || 0) + _rand(1, 4));
    this._recordHistory('improve', `Invested in ${def.name}`, -cost, 'quality and momentum up');
    Engine.log(`🛠️ Invested in ${def.name}. Quality and momentum rose; brand risk dropped.`, 'good');
    UI.update(); this.render();
  },

  cashOut(id) {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    const v   = G.hustle.ventures[id];
    const def = this._ventureDef(id);
    if (!v || !def) return;
    if (!this._canUseAction('cashOut', 'You already cashed out enough this year.')) return;

    const cash = this._cashoutValue(v, def, G);
    if (!confirm(`Cash out ${def.name}?\n\nYou receive ${_fmt(cash)}.\n\nThis permanently removes the venture.`)) return;

    this._markAction('cashOut', G);
    G.money           = (G.money || 0) + cash;
    G.hustle.earnings = (G.hustle.earnings || 0) + cash;
    G.hustle.rep      = _clamp((G.hustle.rep || 0) + _rand(1, 4));
    delete G.hustle.ventures[id];
    G.hustle.clients  = this.activeVentures(G).reduce((s, x) => s + (x.clients || 0), 0);
    this._recordHistory('cashout', `Cashed out ${def.name}`, cash, 'venture sold');
    Engine.log(`${def.icon} Cashed out ${def.name} for ${_fmt(cash)}.`, 'money');
    UI.update(); this.render();
  },

  // ── Premium creator actions ───────────────────────────────────────────────

  onlyFansDrop() {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    if (!this._canUseAction('focus', 'You already used your major hustle action.')) return;
    const { def, v } = this._premiumCheck(); if (!def) return;

    const skill         = this._ventureSkillScore(def, G);
    const audienceFactor= Math.min(2.4, Math.max(0.2, (v.audience || 0) / 2600));
    const levelFactor   = (v.level || 1) * 0.18;
    const qualityFactor = (v.quality || 45) / 120;
    const payout        = _sc(Math.round(_rand(3500, 18000) * (1 + skill * 0.15 + ((G.looks || 50) / 90) + ((G.fame || 0) / 100) + audienceFactor + levelFactor + qualityFactor)));
    const growth        = Math.max(300, Math.round(_rand(1200, 7200) * (1 + skill * 0.08 + audienceFactor * 0.25 + levelFactor + qualityFactor * 0.35)));

    this._premiumWork(def, v, G, payout, growth, 'Exclusive drop', 'premium creator exclusive post', { brandRisk: [2, 6], fame: [2, 6], looks: [1, 2], happiness: [3, 8], stress: [5, 10] }, 6, 30, 40, 4, 0.55, 0.3, 0.1, 'exclusive premium creator post');
  },

  onlyFansCustoms() {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    if (!this._canUseAction('focus', 'You already used your major hustle action.')) return;
    const { def, v } = this._premiumCheck(); if (!def) return;

    const skill         = this._ventureSkillScore(def, G);
    const audienceFactor= Math.min(2.8, Math.max(0.25, (v.audience || 0) / 2200));
    const qualityFactor = (v.quality || 45) / 115;
    const payout        = _sc(Math.round(_rand(7000, 32000) * (1 + skill * 0.18 + ((G.looks || 50) / 95) + ((G.fame || 0) / 120) + audienceFactor + qualityFactor)));
    const growth        = Math.max(140, Math.round(_rand(300, 1800) * (1 + skill * 0.06 + qualityFactor * 0.2)));

    this._premiumWork(def, v, G, payout, growth, 'VIP customs', 'premium creator VIP request', { brandRisk: [5, 10], fame: [1, 4], happiness: [1, 5], stress: [8, 14] }, 5, 18, 32, 3, 0.28, 0.38, 0.15, 'VIP request work', true);
  },

  onlyFansRetention() {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    if (!this._canUseAction('focus', 'You already used your major hustle action.')) return;
    const { def, v } = this._premiumCheck(); if (!def) return;

    const payout = _sc(Math.round(_rand(900, 5200) + (v.whales || 0) * 850 + ((v.loyalty || 45) * 28)));
    const growth = Math.max(120, Math.round((v.audience || 0) * (0.03 + Math.random() * 0.03)));
    const beforeLevel = v.level;
    const continued   = G.hustle.lastActionAge === G.age - 1;

    G.money                = (G.money || 0) + payout;
    G.hustle.earnings      = (G.hustle.earnings || 0) + payout;
    G.hustle.lastGigAge    = G.age;
    G.hustle.lastActionAge = G.age;
    this._markAction('focus', G);
    G.hustle.streak        = continued ? (G.hustle.streak || 0) + 1 : 1;
    G.hustle.totalActions  = (G.hustle.totalActions || 0) + 1;

    v.earned    = (v.earned || 0) + payout;
    v.audience  = (v.audience || 0) + growth;
    v.loyalty   = _clamp((v.loyalty || 45) + _rand(8, 16));
    v.boundaries= _clamp((v.boundaries || 50) + _rand(4, 9));
    v.whales    = Math.max(0, (v.whales || 0) + (Math.random() < 0.42 ? 1 : 0));
    v.brandRisk = _clamp((v.brandRisk || 35) - _rand(1, 4));
    v.momentum  = _clamp((v.momentum || 35) + _rand(6, 12));
    v.progress  = (v.progress || 0) + _rand(14, 24);
    this._levelUp(v, G, 3);
    G.followers = (G.followers || 0) + Math.max(60, Math.round(growth * 0.22));
    G.stress    = _clamp((G.stress || 0) + _rand(2, 6));
    this._touchSocial(def, G, 4);
    this._adultPartnerImpact({ icon: '📸', label: 'subscriber retention work', loveHit: 3, intimacyHit: 4, exposure: 0.18, breakChance: 0.05 });

    const levelTxt = v.level > beforeLevel ? ` Level up to Lv ${v.level}!` : '';
    this._recordHistory('venture', 'Community care', payout, `+${typeof fmtFollowers === 'function' ? fmtFollowers(growth) : growth} fans${levelTxt}`);
    Engine.log(`${def.icon} Community care earned ${_fmt(payout)} and deepened loyalty.${levelTxt}`, v.level > beforeLevel ? 'special' : 'money');
    UI.update(); this.render();
  },

  onlyFansCollab() {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    if (!this._canUseAction('focus', 'You already used your major hustle action.')) return;
    const { def, v } = this._premiumCheck(); if (!def) return;

    const audienceBoost = Math.max(350, Math.round(_rand(1800, 9800) * (1 + ((G.fame || 0) / 140) + ((v.quality || 45) / 120))));
    const payout        = _sc(Math.round(_rand(2800, 14000) * (1 + ((v.loyalty || 45) / 90) + ((v.whales || 0) * 0.18))));
    const beforeLevel   = v.level;
    const continued     = G.hustle.lastActionAge === G.age - 1;

    G.money                = (G.money || 0) + payout;
    G.hustle.earnings      = (G.hustle.earnings || 0) + payout;
    G.hustle.rep           = _clamp((G.hustle.rep || 0) + _rand(4, 8));
    G.hustle.lastGigAge    = G.age;
    G.hustle.lastActionAge = G.age;
    this._markAction('focus', G);
    G.hustle.streak        = continued ? (G.hustle.streak || 0) + 1 : 1;
    G.hustle.totalActions  = (G.hustle.totalActions || 0) + 1;

    v.earned    = (v.earned || 0) + payout;
    v.audience  = (v.audience || 0) + audienceBoost;
    v.whales    = Math.max(0, (v.whales || 0) + _rand(1, 3));
    v.momentum  = _clamp((v.momentum || 35) + _rand(10, 18));
    v.quality   = _clamp((v.quality || 45) + _rand(2, 5));
    v.brandRisk = _clamp((v.brandRisk || 35) + _rand(6, 14));
    v.boundaries= _clamp((v.boundaries || 50) - _rand(2, 6));
    v.progress  = (v.progress || 0) + _rand(20, 36);
    this._levelUp(v, G, 4);
    G.followers = (G.followers || 0) + Math.max(180, Math.round(audienceBoost * 0.32));
    G.fame      = _clamp((G.fame || 0) + _rand(2, 5));
    G.stress    = _clamp((G.stress || 0) + _rand(6, 12));
    this._touchSocial(def, G, 6);
    this._adultPartnerImpact({ icon: '📸', label: 'creator collab content', loveHit: 6, intimacyHit: 7, exposure: 0.42, breakChance: 0.14, directCheating: true });

    const levelTxt = v.level > beforeLevel ? ` Level up to Lv ${v.level}!` : '';
    this._recordHistory('venture', 'Creator collab', payout, `+${typeof fmtFollowers === 'function' ? fmtFollowers(audienceBoost) : audienceBoost} fans${levelTxt}`);
    Engine.log(`${def.icon} A collab pulled in ${_fmt(payout)} and boosted audience, but brand risk climbed.${levelTxt}`, 'special');
    UI.update(); this.render();
  },

  onlyFansRebrand() {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    const { def, v } = this._premiumCheck(); if (!def) return;
    if (!this._canUseAction('rebrand', 'You already refreshed the brand enough this year.')) return;
    const cost = _sc(Math.round(2400 + ((v.level || 1) * 850) + ((v.brandRisk || 0) * 22)));
    if ((G.money || 0) < cost) { UI.toast(`Need ${_fmt(cost)} to rebrand.`); return; }

    G.money -= cost;
    this._markAction('rebrand', G);
    v.brandRisk  = _clamp((v.brandRisk || 35) - _rand(12, 22));
    v.quality    = _clamp((v.quality || 45) + _rand(6, 12));
    v.momentum   = _clamp((v.momentum || 35) + _rand(4, 9));
    v.progress   = _clamp((v.progress || 0) + _rand(6, 12));
    v.loyalty    = _clamp((v.loyalty || 45) + _rand(3, 8));
    v.boundaries = _clamp((v.boundaries || 50) + _rand(8, 15));
    G.fame       = _clamp((G.fame || 0) + _rand(1, 3));
    G.happiness  = _clamp(G.happiness + _rand(2, 5));
    G.stress     = _clamp((G.stress || 0) - _rand(2, 6));
    this._recordHistory('rebrand', `Rebranded ${def.name}`, -cost, 'brand risk down, quality up');
    Engine.log(`${def.icon} Rebranded ${def.name}. Quality improved and brand risk dropped.`, 'good');
    UI.update(); this.render();
  },

  // ── Escort agency actions ─────────────────────────────────────────────────

  agencyVipNight() {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    if (!this._canUseAction('focus', 'You already used your major hustle action.')) return;
    const { def, v } = this._escortCheck(); if (!def) return;

    const vipGain    = _rand(1, 3);
    const clientGain = _rand(2, 6) + Math.max(0, Math.round((v.roster || 1) / 2));
    const payout     = _sc(Math.round(_rand(9000, 38000) * (1 + ((v.vipClients || 0) * 0.18) + ((v.discretion || 50) / 120) + ((G.fame || 0) / 150))));
    const beforeLevel= v.level;
    const continued  = G.hustle.lastActionAge === G.age - 1;

    G.money                = (G.money || 0) + payout;
    G.hustle.earnings      = (G.hustle.earnings || 0) + payout;
    G.hustle.rep           = _clamp((G.hustle.rep || 0) + _rand(6, 11));
    G.hustle.lastGigAge    = G.age;
    G.hustle.lastActionAge = G.age;
    this._markAction('focus', G);
    G.hustle.streak        = continued ? (G.hustle.streak || 0) + 1 : 1;
    G.hustle.totalActions  = (G.hustle.totalActions || 0) + 1;

    v.earned    = (v.earned || 0) + payout;
    v.vipClients= Math.max(0, (v.vipClients || 0) + vipGain);
    v.clients   = Math.max(0, (v.clients || 0) + clientGain);
    v.momentum  = _clamp((v.momentum || 35) + _rand(10, 17));
    v.quality   = _clamp((v.quality || 45) + _rand(1, 4));
    v.brandRisk = _clamp((v.brandRisk || 24) + _rand(4, 9));
    v.discretion= _clamp((v.discretion || 50) - _rand(1, 4));
    v.progress  = (v.progress || 0) + _rand(18, 30);
    this._levelUp(v, G, 4);
    G.hustle.clients = (G.hustle.clients || 0) + clientGain;
    G.fame  = _clamp((G.fame || 0) + _rand(1, 4));
    G.stress= _clamp((G.stress || 0) + _rand(7, 14));
    this._touchSocial(def, G, 5);
    this._adultPartnerImpact({ icon: '👠', label: 'VIP private agency work', loveHit: 8, intimacyHit: 9, exposure: 0.5, breakChance: 0.2, directCheating: true });

    const levelTxt = v.level > beforeLevel ? ` Level up to Lv ${v.level}!` : '';
    this._recordHistory('venture', 'Agency VIP night', payout, `+${vipGain} VIPs, +${clientGain} clients${levelTxt}`);
    Engine.log(`${def.icon} VIP night generated ${_fmt(payout)} and expanded your highest-paying client pool.${levelTxt}`, 'special');
    UI.update(); this.render();
  },

  agencyScreening() {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    const { def, v } = this._escortCheck(); if (!def) return;
    if (!this._canUseAction('rebrand', 'You already upgraded safety enough this year.')) return;
    const cost = _sc(Math.round(3200 + ((v.vipClients || 0) * 850) + ((v.roster || 1) * 1200)));
    if ((G.money || 0) < cost) { UI.toast(`Need ${_fmt(cost)} for safety upgrades.`); return; }

    G.money -= cost;
    this._markAction('rebrand', G);
    v.screening  = _clamp((v.screening || 45) + _rand(10, 18));
    v.discretion = _clamp((v.discretion || 50) + _rand(8, 16));
    v.brandRisk  = _clamp((v.brandRisk || 24) - _rand(8, 16));
    v.quality    = _clamp((v.quality || 45) + _rand(4, 8));
    v.progress   = _clamp((v.progress || 0) + _rand(4, 9));
    G.stress     = _clamp((G.stress || 0) - _rand(2, 5));
    this._recordHistory('rebrand', 'Agency safety upgrade', -cost, 'screening and discretion up');
    Engine.log(`${def.icon} Invested ${_fmt(cost)} in screening and security. Agency risk came down.`, 'good');
    UI.update(); this.render();
  },

  agencyRecruit() {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    const { def, v } = this._escortCheck(); if (!def) return;
    if (!this._canUseAction('improve', 'You already recruited enough this year.')) return;
    const cost = _sc(Math.round(4500 + ((v.roster || 1) * 2600) + ((v.vipClients || 0) * 750)));
    if ((G.money || 0) < cost) { UI.toast(`Need ${_fmt(cost)} to recruit.`); return; }

    G.money -= cost;
    this._markAction('improve', G);
    v.roster     = Math.max(1, (v.roster || 1) + 1);
    v.clients    = Math.max(0, (v.clients || 0) + _rand(2, 5));
    v.vipClients = Math.max(0, (v.vipClients || 0) + (Math.random() < 0.38 ? 1 : 0));
    v.quality    = _clamp((v.quality || 45) + _rand(5, 10));
    v.momentum   = _clamp((v.momentum || 35) + _rand(5, 10));
    v.brandRisk  = _clamp((v.brandRisk || 24) + _rand(2, 6));
    v.progress   = _clamp((v.progress || 0) + _rand(10, 18));
    G.hustle.clients = (G.hustle.clients || 0) + _rand(1, 3);
    this._recordHistory('improve', 'Agency recruited talent', -cost, 'roster expanded');
    Engine.log(`${def.icon} Spent ${_fmt(cost)} recruiting talent. Capacity rose, but management complexity too.`, 'good');
    UI.update(); this.render();
  },

  // ── Year tick ─────────────────────────────────────────────────────────────

  tick() {
    const G = this._G(); if (!G) return;
    this.ensureState(G);
    // Teen gigs are resolved immediately by the age-aware UI. Recurring
    // ventures are an adult system and must never run from an old child save.
    if ((G.age || 0) < 18) return;
    const ventures     = this.activeVentures(G);
    const workedLastYear = (G.hustle.lastActionAge || -1) === G.age - 1;

    if (!ventures.length) {
      if (!workedLastYear) G.hustle.streak = 0;
      return;
    }

    let total = 0;
    ventures.forEach(v => {
      const def = this._ventureDef(v.id); if (!def) return;
      const freshness = workedLastYear ? 1 : 0.82;
      let annual = Math.round(this._ventureAnnualPayout(v, def, G) * freshness * Math.max(0.7, 0.8 + (v.momentum || 0) / 160));

      if (annual > 0) {
        G.money           = (G.money || 0) + annual;
        G.hustle.earnings = (G.hustle.earnings || 0) + annual;
        v.earned          = (v.earned || 0) + annual;
        total             += annual;
      }

      // Audience / client drift
      if (def.progress === 'audience') {
        const driftRate = def.id === 'premium_creator'
          ? Math.max(0.02, 0.10 - ((v.loyalty || 45) / 900) - ((v.boundaries || 50) / 1200))
          : 0.07;
        const drift = workedLastYear ? _rand(20, 120) : Math.max(40, Math.round((v.audience || 0) * driftRate));
        v.audience = Math.max(0, (v.audience || 0) - drift);
        if (workedLastYear && Math.random() < 0.18) G.followers = (G.followers || 0) + Math.max(15, Math.round((v.audience || 0) * 0.015));
      } else {
        const clientLoss = workedLastYear ? 0 : (def.id === 'escort_service'
          ? Math.max(0, _rand(0, 2) - Math.floor((v.discretion || 50) / 40) - Math.floor((v.screening || 45) / 45))
          : _rand(0, 2));
        v.clients = Math.max(0, (v.clients || 0) - clientLoss);
      }

      // Decay
      v.momentum = _clamp((v.momentum || 0) - (workedLastYear ? _rand(2, 6) : _rand(8, 14)));
      v.quality  = _clamp((v.quality || 45) - _rand(0, 2));
      if (def.id === 'premium_creator') {
        v.loyalty    = _clamp((v.loyalty || 45) - (workedLastYear ? _rand(0, 2) : _rand(3, 7)));
        v.boundaries = _clamp((v.boundaries || 50) - (workedLastYear ? _rand(0, 1) : _rand(1, 4)));
        if (workedLastYear && Math.random() < 0.16) v.whales = Math.max(0, (v.whales || 0) + 1);
      } else if (def.id === 'escort_service') {
        v.discretion = _clamp((v.discretion || 50) - (workedLastYear ? _rand(0, 1) : _rand(2, 5)));
        v.screening  = _clamp((v.screening || 45) - (workedLastYear ? _rand(0, 1) : _rand(1, 4)));
      }

      // Controversy risk
      if ((v.brandRisk || 0) >= 70) {
        const controversyChance = def.id === 'premium_creator'
          ? Math.max(0.05, 0.12 - ((v.boundaries || 50) / 1200))
          : def.id === 'escort_service'
            ? Math.max(0.04, 0.11 - ((v.discretion || 50) / 1400) - ((v.screening || 45) / 1600))
            : 0.12;
        if (Math.random() < controversyChance) {
          G.fame  = _clamp((G.fame || 0) - _rand(1, 4));
          G.stress= _clamp((G.stress || 0) + _rand(3, 8));
          Engine.log(`⚠️ Brand controversy around ${def.name} created stress and hurt reputation.`, 'bad');
        }
      }

      // Breakout year
      if (v.momentum >= 82 && Math.random() < 0.16) {
        const breakout = _sc(_rand(150, 1200) + (v.level * 120));
        G.money           = (G.money || 0) + breakout;
        G.hustle.earnings = (G.hustle.earnings || 0) + breakout;
        v.earned          = (v.earned || 0) + breakout;
        total             += breakout;
        Engine.log(`${def.icon} ${def.name} had a breakout year and added ${_fmt(breakout)}!`, 'special');
      }
    });

    G.hustle.clients  = ventures.reduce((s, v) => s + (v.clients || 0), 0);
    G.hustle.bestYear = Math.max(G.hustle.bestYear || 0, total);

    if (total > 0) {
      this._recordHistory('passive', 'Portfolio income', total, `${ventures.length} active venture${ventures.length !== 1 ? 's' : ''}`);
      Engine.log(`💼 Your hustle portfolio brought in ${_fmt(total)}.`, 'money');
    }
    if (!workedLastYear) Engine.log('📉 Your side hustles cooled — you did not push them last year.', 'neutral');

    // Referral bonus
    if ((G.hustle.rep || 0) >= 45 && Math.random() < 0.18) {
      const referral = _sc(_rand(180, 900) + Math.round((G.hustle.rep || 0) * 7));
      G.money           = (G.money || 0) + referral;
      G.hustle.earnings = (G.hustle.earnings || 0) + referral;
      Engine.log(`🧾 Referrals added ${_fmt(referral)}.`, 'money');
    }

    // Streak bonus
    if ((G.hustle.streak || 0) >= 3 && workedLastYear) {
      const bonus = _sc(_rand(100, 500) * (G.hustle.streak || 1));
      G.money           = (G.money || 0) + bonus;
      G.hustle.earnings = (G.hustle.earnings || 0) + bonus;
      Engine.log(`🔥 ${G.hustle.streak}-year streak bonus: +${_fmt(bonus)}.`, 'special');
    }

    if (!workedLastYear) G.hustle.streak = 0;
  },

  // ── Internal helpers ──────────────────────────────────────────────────────

  /** Shared helper for premium_creator action methods. */
  _premiumWork(def, v, G, payout, growth, histLabel, logLabel, statDeltas, socialAmt, progLo, progHi, skillProgMult, followerFrac, exposure, breakChance, partnerLabel, directCheating = false) {
    const beforeLevel = v.level;
    const continued   = G.hustle.lastActionAge === G.age - 1;

    G.money                = (G.money || 0) + payout;
    G.hustle.earnings      = (G.hustle.earnings || 0) + payout;
    G.hustle.rep           = _clamp((G.hustle.rep || 0) + _rand(5, 10));
    G.hustle.lastGigAge    = G.age;
    G.hustle.lastActionAge = G.age;
    this._markAction('focus', G);
    G.hustle.streak        = continued ? (G.hustle.streak || 0) + 1 : 1;
    G.hustle.totalActions  = (G.hustle.totalActions || 0) + 1;

    v.earned   = (v.earned || 0) + payout;
    v.audience = (v.audience || 0) + growth;
    v.momentum = _clamp((v.momentum || 0) + _rand(8, 16) + (this._ventureSkillScore(def, G) * 2));
    v.quality  = _clamp((v.quality || 45) + _rand(2, 5));
    v.progress = (v.progress || 0) + _rand(progLo, progHi) + (this._ventureSkillScore(def, G) * skillProgMult);
    if (statDeltas.brandRisk) v.brandRisk = _clamp((v.brandRisk || 35) + _rand(...statDeltas.brandRisk));

    this._levelUp(v, G, 4);
    G.followers = (G.followers || 0) + Math.max(90, Math.round(growth * followerFrac));
    if (statDeltas.fame)      G.fame      = _clamp((G.fame || 0) + _rand(...statDeltas.fame));
    if (statDeltas.looks)     G.looks     = _clamp(G.looks + _rand(...statDeltas.looks));
    if (statDeltas.happiness) G.happiness = _clamp(G.happiness + _rand(...statDeltas.happiness));
    if (statDeltas.stress)    G.stress    = _clamp((G.stress || 0) + _rand(...statDeltas.stress));

    this._touchSocial(def, G, socialAmt);
    this._adultPartnerImpact({ icon: '📸', label: partnerLabel, loveHit: 4, intimacyHit: 5, exposure, breakChance, directCheating });

    const levelTxt   = v.level > beforeLevel ? ` Level up to Lv ${v.level}!` : '';
    const growthTxt  = typeof fmtFollowers === 'function' ? fmtFollowers(growth) : growth;
    this._recordHistory('venture', histLabel, payout, `+${growthTxt} subscribers${levelTxt}`);
    Engine.log(`${def.icon} ${logLabel} earned ${_fmt(payout)} and +${growthTxt} subscribers.${levelTxt}`, v.level > beforeLevel ? 'special' : 'money');
    UI.update(); this.render();
  },

  _premiumCheck() {
    const def = this._ventureDef('premium_creator');
    const v   = this._G()?.hustle?.ventures?.premium_creator;
    if (!def || !v) { UI.toast('You need an active premium creator venture first.'); return { def: null, v: null }; }
    return { def, v };
  },

  _escortCheck() {
    const def = this._ventureDef('escort_service');
    const v   = this._G()?.hustle?.ventures?.escort_service;
    if (!def || !v) { UI.toast('You need an active Private Companion Agency first.'); return { def: null, v: null }; }
    return { def, v };
  },

  _levelUp(v, G, repPerLevel = 4) {
    while (v.progress >= 100 && v.level < 6) {
      v.progress -= 100;
      v.level++;
      G.hustle.rep = _clamp((G.hustle.rep || 0) + repPerLevel);
    }
    if (v.level >= 6) v.progress = 100;
  },

  _applyVenturePerks(def, G) {
    const perks = _VENTURE_PERKS[def.id];
    if (!perks) return;
    if (perks.fame)     G.fame     = _clamp((G.fame || 0) + _rand(...perks.fame));
    if (perks.looks)    G.looks    = _clamp(G.looks + _rand(...perks.looks));
    if (perks.fitness)  G.fitness  = _clamp((G.fitness || 50) + _rand(...perks.fitness));
    if (perks.health)   G.health   = _clamp(G.health + _rand(...perks.health));
    if (perks.smarts)   G.smarts   = _clamp(G.smarts + _rand(...perks.smarts));
    if (perks.happiness)G.happiness= _clamp(G.happiness + _rand(...perks.happiness));
    if (perks.stress)   G.stress   = _clamp((G.stress || 0) + _rand(...perks.stress));
    if (perks.karma)    G.karma    = _clamp((G.karma || 0) + _rand(...perks.karma), -100, 100);
  },

  _touchSocial(def, G, amt) {
    if (typeof Social === 'undefined' || !Social.ensure) return;
    Social.ensure();
    const S = G.social || {};
    if (def.id === 'creator_channel') {
      S.contentSkill    = _clamp((S.contentSkill || 35) + amt);
      S.consistency     = _clamp((S.consistency || 45) + Math.max(1, Math.floor(amt / 2)));
      S.audienceQuality = _clamp((S.audienceQuality || 45) + Math.max(1, Math.floor(amt / 2)));
      S.burnout         = _clamp((S.burnout || 0) + Math.max(1, Math.floor(amt / 2)));
    } else if (def.id === 'premium_creator') {
      S.contentSkill = _clamp((S.contentSkill || 35) + amt);
      S.reputation   = _clamp((S.reputation || 60) + 1);
      S.brandSafety  = _clamp((S.brandSafety || 60) - Math.max(1, Math.floor(amt / 2)));
      S.burnout      = _clamp((S.burnout || 0) + Math.max(2, Math.floor(amt / 2) + 1));
    } else if (def.id === 'escort_service') {
      S.reputation  = _clamp((S.reputation || 60) + 1);
      S.brandSafety = _clamp((S.brandSafety || 60) - Math.max(1, Math.floor(amt / 3)));
      S.burnout     = _clamp((S.burnout || 0) + Math.max(1, Math.floor(amt / 2)));
    } else if (def.id === 'content_agency') {
      S.contentSkill    = _clamp((S.contentSkill || 35) + Math.floor(amt / 2));
      S.consistency     = _clamp((S.consistency || 45) + Math.max(1, Math.floor(amt / 3)));
      S.audienceQuality = _clamp((S.audienceQuality || 45) + Math.max(1, Math.floor(amt / 3)));
    }
  },

  _adultPartnerImpact(opts = {}) {
    const G = this._G();
    if (!G || !G.rels?.partner) return;
    if (typeof Relations !== 'undefined' && typeof Relations._ensureState === 'function') Relations._ensureState(G);
    const partner = (typeof Relations !== 'undefined' && typeof Relations._ensurePartnerDefaults === 'function')
      ? Relations._ensurePartnerDefaults(G.rels.partner)
      : G.rels.partner;
    if (!partner) return;

    const stage     = partner.stage || (partner.married ? 'married' : 'dating');
    const stageMult = { dating: 1, serious: 1.25, engaged: 1.45, married: 1.65 }[stage] || 1;
    const loveHit   = Math.max(2, Math.round((opts.loveHit || 4) * stageMult));
    const intimHit  = Math.max(2, Math.round((opts.intimacyHit || 4) * stageMult));
    const exposure  = Math.min(0.95, (opts.exposure || 0.2) + Math.min(0.22, (G.followers || 0) / 600000) + Math.min(0.18, (G.fame || 0) / 320));

    partner.love    = _clamp((partner.love || 50) - loveHit);
    partner.intimacy= _clamp((partner.intimacy || 35) - intimHit);
    partner.outsideExposure = true;
    G.stress = _clamp((G.stress || 0) + _rand(1, 4));

    if (Math.random() >= exposure) {
      Engine.log(`${opts.icon || '🙈'} Your ${opts.label || 'adult side work'} stayed private — but it still created distance at home.`, 'neutral');
      return;
    }

    G.stress = _clamp((G.stress || 0) + _rand(4, 10));
    Engine.log(`${opts.icon || '💔'} ${partner.name} found out about your ${opts.label || 'adult side work'}. The relationship took a hit.`, 'bad');

    const breakChance = Math.min(0.88, (opts.breakChance || 0.08) * stageMult + (opts.directCheating ? 0.18 : 0));
    if ((partner.love || 0) <= Math.max(22, opts.breakLove || 34) || Math.random() < breakChance) {
      if (typeof Relations !== 'undefined' && typeof Relations._separate === 'function') {
        Relations._separate({ cause: 'cheating', forced: true });
      }
    }
  },

  // ── Calculation helpers ───────────────────────────────────────────────────

  _ventureDef(id) {
    const def = HUSTLE_VENTURES.find(v => v.id === id || v.legacyIds?.includes(id)) || null;
    if (!def) return null;
    if (def.id === 'creator_channel') return null; // absorbed
    if (def.id === 'premium_creator') return { ...def, ..._PREMIUM_OVERRIDES };
    return def;
  },

  _startableVentures(G) {
    return HUSTLE_VENTURES
      .map(def => this._ventureDef(def.id))
      .filter(Boolean)
      .filter(def => (G.age || 0) >= def.minAge && def.need(G) && !G.hustle.ventures[def.id] && this.activeVentures(G).length < this.ventureLimit(G));
  },

  _lockedVentures(G) {
    return HUSTLE_VENTURES
      .map(def => this._ventureDef(def.id))
      .filter(Boolean)
      .filter(def => !G.hustle.ventures[def.id] && ((G.age || 0) < def.minAge || !def.need(G)));
  },

  _estimateGig(g, G) {
    const skill = this._gigSkillBonus(g, G);
    return [_sc(Math.round(g.base[0] * (1 + skill * 0.12))), _sc(Math.round(g.base[1] * (1 + skill * 0.22)))];
  },

  _gigSkillBonus(g, G) {
    const s = G.skills || {};
    const map = {
      photo:   () => (s.photo || 0) + (s.beauty || 0),
      music:   () => (s.music || 0) + (s.public_sp || 0),
      coding:  () => (s.coding || 0) + (s.hacking || 0),
      translate: () => (s.language || 0),
      coach:   () => (s.fitness || 0) + (s.psychology || 0),
      escort:  () => (s.beauty || 0) + (s.public_sp || 0) + (s.psychology || 0) * 0.5,
      sales:   () => (s.negotiation || 0) + (s.public_sp || 0),
      consult: () => (s.finance || 0) + (s.negotiation || 0),
      tutor:   () => (s.psychology || 0) + (s.language || 0),
      editing: () => (s.writing || 0) + (s.language || 0),
      resell:  () => (s.negotiation || 0) + (s.finance || 0),
      ai_agency:     () => (s.ai_ml || 0) + (s.coding || 0),
      crypto_consult:() => (s.crypto || 0) + (s.finance || 0),
      digital_art:   () => (s.art || 0) + (s.ai_ml || 0),
      ux_design:     () => (s.art || 0) + (s.coding || 0),
      podcast:       () => (s.public_sp || 0) + (s.writing || 0),
      dropship:      () => (s.negotiation || 0) + (s.finance || 0),
    };
    return map[g.id] ? map[g.id]() : 0;
  },

  _ventureSkillScore(def, G) {
    const s = G.skills || {};
    const map = {
      resale_page:          () => (s.negotiation || 0) + (s.finance || 0) + (s.mechanics || 0) * 0.5,
      tutor_network:        () => (s.psychology || 0) + (s.language || 0) + (s.writing || 0) * 0.5,
      creator_channel:      () => (s.photo || 0) + (s.public_sp || 0) + (s.beauty || 0) * 0.5,
      premium_creator:      () => (s.beauty || 0) + (s.photo || 0) + (s.public_sp || 0) * 0.5,
      escort_service:       () => (s.beauty || 0) + (s.public_sp || 0) + (s.negotiation || 0) * 0.5 + (s.psychology || 0) * 0.5,
      dev_shop:             () => (s.coding || 0) + (s.hacking || 0),
      fitness_brand:        () => (s.fitness || 0) + (s.psychology || 0) + (s.public_sp || 0) * 0.5,
      consulting_practice:  () => (s.finance || 0) + (s.negotiation || 0) + (s.public_sp || 0) * 0.5,
      ai_saas:              () => (s.ai_ml || 0) + (s.coding || 0),
      nft_studio:           () => (s.art || 0) + (s.ai_ml || 0),
      crypto_fund:          () => (s.crypto || 0) + (s.finance || 0),
      content_agency:       () => (s.writing || 0) + (s.public_sp || 0) + (s.photo || 0) * 0.5,
      ecom_store:           () => (s.negotiation || 0) + (s.finance || 0) + (s.mechanics || 0) * 0.5,
    };
    return map[def.id] ? map[def.id]() : 0;
  },

  _ventureStatFit(def, G) {
    const fits = {
      resale_page:         () => Math.max(0.12, (G.smarts || 50) / 100),
      tutor_network:       () => Math.max(0.15, (G.smarts || 50) / 95),
      creator_channel:     () => ((G.looks || 50) + (G.fame || 0) + Math.min(100, G.happiness || 50)) / 180,
      premium_creator:     () => ((G.looks || 50) + (G.fame || 0) + (G.happiness || 50)) / 120,
      escort_service:      () => ((G.looks || 50) + (G.fame || 0) + (G.happiness || 50)) / 145,
      dev_shop:            () => ((G.smarts || 50) + Math.max(45, G.health || 50)) / 150,
      fitness_brand:       () => ((G.fitness || 50) + (G.health || 50)) / 150,
      consulting_practice: () => ((G.smarts || 50) + (G.fame || 0) + (G.happiness || 50)) / 180,
      ai_saas:             () => ((G.smarts || 50) + Math.max(45, G.health || 50)) / 160,
      nft_studio:          () => ((G.looks || 50) + (G.fame || 0)) / 180,
      crypto_fund:         () => Math.max(0.2, (G.smarts || 50) / 90),
      content_agency:      () => ((G.smarts || 50) + (G.fame || 0)) / 160,
      ecom_store:          () => Math.max(0.15, (G.smarts || 50) / 100),
    };
    return fits[def.id] ? fits[def.id]() : 0.5;
  },

  _ventureAnnualPayout(v, def, G) {
    const skill       = this._ventureSkillScore(def, G);
    const statFit     = this._ventureStatFit(def, G);
    const level       = (v.level || 1) - 1;
    const repBoost    = (G.hustle?.rep || 0) / 150;
    const qualityBoost= (v.quality || 45) / 180;
    const riskDrag    = (v.brandRisk || 0) / 500;
    const base        = def.basePassive * (1 + level * 0.34 + skill * 0.12 + statFit * 0.35 + repBoost + qualityBoost - riskDrag);

    const clientRate = def.id === 'escort_service'
      ? 420 + (skill * 55) + (level * 90) + ((v.vipClients || 0) * 85) + ((v.discretion || 50) * 2.2) + ((v.roster || 1) * 60)
      : 110 + (skill * 18) + (level * 25);

    let scale = def.progress === 'audience'
      ? (v.audience || 0) * (def.id === 'premium_creator' ? 1.45 : 0.16)
      : (v.clients || 0) * clientRate;

    if (def.id === 'premium_creator') scale *= 1 + ((v.loyalty || 45) / 220) + ((v.whales || 0) * 0.08) + ((v.boundaries || 50) - 50) / 260;
    if (def.id === 'escort_service')  scale *= 1 + ((v.screening || 45) / 320) + ((v.vipClients || 0) * 0.05);

    return _sc(Math.max(0, Math.round(base + scale)));
  },

  _ventureGrowth(def, G, v, skill) {
    const level    = v.level || 1;
    const momentum = Math.max(18, v.momentum || 35);
    const quality  = (v.quality || 45) / 100;
    if (def.progress === 'audience') {
      const fameFit    = 1 + ((G.fame || 0) / 160) + ((G.looks || 50) / 220);
      const base       = def.id === 'premium_creator' ? _rand(850, 5200) : _rand(180, 1350);
      const loyaltyFit = def.id === 'premium_creator' ? 1 + ((v.loyalty || 45) / 180) + ((v.whales || 0) * 0.04) : 1;
      return Math.max(40, Math.round(base * fameFit * loyaltyFit * (1 + skill * 0.08 + (momentum / 150) + (level * 0.06) + quality * 0.25)));
    }
    const escortFit = def.id === 'escort_service'
      ? ((v.vipClients || 0) * 0.7) + ((v.screening || 45) / 24) + ((v.discretion || 50) / 24) + ((v.roster || 1) * 0.6)
      : 0;
    const base = _rand(2, 8) + (skill * 0.55) + (momentum / 26) + (level * 0.5) + quality * 2 + escortFit;
    return Math.max(2, Math.round(base));
  },

  _cashoutValue(v, def, G) {
    const base  = (def.basePassive * 1.8) + (v.level * 240) + (v.momentum * 18) + (v.progress * 12) + (v.quality * 16);
    let scale   = def.progress === 'audience'
      ? (v.audience || 0) * (def.id === 'premium_creator' ? 3.1 : 1.1)
      : (v.clients || 0) * 185;
    if (def.id === 'premium_creator') scale += ((v.whales || 0) * _sc(1800)) + ((v.loyalty || 45) * 55) + ((v.boundaries || 50) * 28);
    if (def.id === 'escort_service')  scale += ((v.vipClients || 0) * _sc(4200)) + ((v.screening || 45) * 48) + ((v.discretion || 50) * 52) + ((v.roster || 1) * _sc(2800));
    const reputation  = (G.hustle?.rep || 0) * 14;
    const riskPenalty = (v.brandRisk || 0) * 10;
    return _sc(Math.max(50, Math.round(base + scale + reputation - riskPenalty)));
  },

  _improveCost(v, def) {
    return _sc(Math.round((def.startCost || 100) * (1.2 + (v.level || 1) * 0.35) + ((v.quality || 45) * 4)));
  },

  _defaultBrandRisk(def) {
    return _BRAND_RISK_DEFAULTS[def.id] ?? 4;
  },
};