/* js/social.js — LifeSim v13.1
   Improved creator/social system
   - safer rendering helpers
   - stronger dashboard feedback
   - better growth forecasting by action type
   - creator momentum/risk/advice system
   - guards against missing UI/Engine helpers
*/
const Social = {
  platforms: {
    short: {
      icon: '🎞️',
      name: 'Short Video',
      desc: 'Fast discovery, viral spikes, higher burnout',
      growth: 1.35,
      engagement: 1.05,
      burnout: 3,
      monetization: .95,
      skill: 'consistency'
    },
    long: {
      icon: '🎬',
      name: 'Long Video',
      desc: 'Slower grind, stronger sponsors and archives',
      growth: 1.05,
      engagement: 1.15,
      burnout: 2,
      monetization: 1.15,
      skill: 'contentSkill'
    },
    photo: {
      icon: '📸',
      name: 'Photo Feed',
      desc: 'Looks, lifestyle, travel, visual branding',
      growth: .95,
      engagement: 1.0,
      burnout: 1,
      monetization: .95,
      skill: 'looks'
    },
    writing: {
      icon: '✍️',
      name: 'Writing',
      desc: 'Smarts-led audience with loyal readers',
      growth: .82,
      engagement: 1.3,
      burnout: 1,
      monetization: 1.05,
      skill: 'smarts'
    },
    audio: {
      icon: '🎙️',
      name: 'Podcasting',
      desc: 'Slow growth, deep trust, excellent monetization',
      growth: .75,
      engagement: 1.25,
      burnout: 1,
      monetization: 1.25,
      skill: 'reputation'
    }
  },

  niches: {
    lifestyle: { icon: '✨', name: 'Lifestyle', stat: 'looks', desc: 'Beauty, daily life, trends' },
    education: { icon: '🎓', name: 'Education', stat: 'smarts', desc: 'Teaching, tutorials, advice' },
    fitness: { icon: '🏋️', name: 'Fitness', stat: 'fitness', desc: 'Training, food, discipline' },
    comedy: { icon: '🎭', name: 'Comedy', stat: 'happiness', desc: 'Personality and relatability' },
    finance: { icon: '💳', name: 'Finance', stat: 'smarts', desc: 'Money, careers, investing' },
    fame: { icon: '⭐', name: 'Celebrity', stat: 'fame', desc: 'Public persona and status' },
    gaming: { icon: '🎮', name: 'Gaming', stat: 'smarts', desc: 'Streams, clips, guides, reactions' },
    art: { icon: '🎨', name: 'Art & Design', stat: 'looks', desc: 'Creative projects and visual identity' }
  },

  postTypes: {
    quick: {
      icon: '⚡',
      name: 'Quick Post',
      desc: 'Low effort, reliable small growth',
      cost: 0,
      stress: 0,
      req: null
    },
    quality: {
      icon: '🎥',
      name: 'Quality Upload',
      desc: 'Better growth, improves creator skill',
      cost: 0,
      stress: 3,
      req: null
    },
    trend: {
      icon: '🔥',
      name: 'Chase Trend',
      desc: 'Viral upside, reputation and brand risk',
      cost: 0,
      stress: 4,
      req: null
    },
    series: {
      icon: '📚',
      name: 'Content Series',
      desc: 'Builds loyal audience and long-term trust',
      cost: 0,
      stress: 2,
      req: null
    },
    live: {
      icon: '📡',
      name: 'Go Live',
      desc: 'Tips, engagement, burnout risk',
      cost: 0,
      stress: 2,
      req: null
    },
    collab: {
      icon: '🤝',
      name: 'Collaborate',
      desc: 'Cross-pollinate audiences',
      cost: 0,
      stress: 2,
      req: { followers: 1000, label: '1K followers' }
    },
    premium: {
      icon: '💎',
      name: 'Premium Drop',
      desc: 'High-effort flagship content',
      cost: 250,
      stress: 5,
      req: { followers: 5000, label: '5K followers' }
    },
    documentary: {
      icon: '🎞️',
      name: 'Mini Documentary',
      desc: 'Big reputation play, expensive to produce',
      cost: 1200,
      stress: 6,
      req: { smarts: 45, label: '45+ Smarts' }
    }
  },

  render() {
    const G = window.G;
    if (!G) return;
    this.ensure();

    const el = document.getElementById('tab-social');
    if (!el) return;

    const S = G.social;
    const f = G.followers || 0;
    const tier = this.tier(f);
    const platform = this.platforms[S.platform] || this.platforms.short;
    const niche = this.niches[S.niche] || this.niches.lifestyle;
    const yearly = this.projectedIncome();
    const engagement = this.engagementRate();
    const next = this.nextTier(f);
    const progress = next ? Math.min(100, Math.round((f / next.need) * 100)) : 100;
    const health = this.creatorHealth();
    const trend = this.currentTrend();
    const momentum = this.momentumScore();
    const risk = this.riskScore();
    const advice = this.creatorAdvice();
    const panel = this.getPanel();

    el.innerHTML = `
      ${this.alertsHTML()}
      ${this.heroHTML({ G, S, f, tier, platform, niche, next, progress, momentum, risk, yearly, engagement })}
      ${this.nextMoveHTML(this.bestMove())}
      ${this.quickActionsHTML()}
      ${this.socialNavHTML(panel)}
      ${this.panelHTML(panel)}
      ${this.contextHTML({ health, trend, advice })}
    `;
  },

  getPanel() {
    const G = window.G;
    const allowed = ['create', 'strategy', 'monetize', 'ops', 'history'];
    const current = G?.social?.panel || 'create';
    return allowed.includes(current) ? current : 'create';
  },

  setPanel(id) {
    const G = window.G;
    if (!G) return;
    this.ensure();
    const allowed = ['create', 'strategy', 'monetize', 'ops', 'history'];
    G.social.panel = allowed.includes(id) ? id : 'create';
    this.render();
  },

  heroHTML(ctx) {
    const { G, S, f, tier, platform, niche, next, progress, momentum, risk, yearly, engagement } = ctx;
    const repCol = this.colorFor(S.reputation, 'goodHigh');
    const burnCol = this.colorFor(S.burnout, 'badHigh');
    const momentumCol = this.colorFor(momentum, 'goodHigh');
    const riskCol = this.colorFor(risk, 'badHigh');
    const nextText = next ? `${fmtFollowers(Math.max(0, next.need - f))} followers to ${this.esc(next.label)}` : 'You are at the top creator tier.';
    const best = this.bestPostType();
    const forecast = this.growthForecast(best);

    return `
      <div class="fame-card" style="text-align:left;overflow:hidden;position:relative;margin-bottom:12px">
        <div style="position:absolute;inset:-80px -90px auto auto;width:210px;height:210px;border-radius:50%;background:${tier.c}24;filter:blur(18px);pointer-events:none"></div>
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:12px;position:relative">
          <div style="width:60px;height:60px;border-radius:20px;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:31px;box-shadow:0 10px 28px rgba(0,0,0,.28)">${this.esc(tier.icon)}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <div style="font-size:25px;font-weight:950;color:${tier.c};line-height:1">${fmtFollowers(f)}</div>
              ${S.verified ? '<span class="badge badge-a">✅ Verified</span>' : ''}
              ${S.manager ? '<span class="badge badge-g">🧑‍💼 Manager</span>' : ''}
              ${S.membership ? '<span class="badge badge-p">🔒 Membership</span>' : ''}
            </div>
            <div style="font-size:11px;font-weight:950;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-top:4px">${this.esc(tier.label)}</div>
            <div style="font-size:12px;color:var(--txt);font-weight:850;margin-top:5px">${this.esc(platform.icon)} ${this.esc(platform.name)} · ${this.esc(niche.icon)} ${this.esc(niche.name)}</div>
          </div>
        </div>

        <div style="height:9px;background:var(--s3);border-radius:999px;overflow:hidden;margin-bottom:7px;position:relative">
          <div style="height:100%;width:${progress}%;background:${tier.c};border-radius:999px"></div>
        </div>
        <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:11px;color:var(--muted);font-weight:750;margin-bottom:12px">
          <span>${nextText}</span>
          <span title="Recommended next post forecast">Best post ↗ ${fmtFollowers(forecast.low)}–${fmtFollowers(forecast.high)}</span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px">
          ${this.compactMetric('Engagement', engagement + '%', 'Quality ' + Math.round(S.audienceQuality) + '%', 'var(--cyan)')}
          ${this.compactMetric('Income', fmt(yearly) + '/yr', 'Lifetime ' + fmt(G.socialEarnings || 0), 'var(--yellow)')}
          ${this.compactMetric('Momentum', Math.round(momentum) + '%', 'Growth power', momentumCol)}
          ${this.compactMetric('Risk', Math.round(risk) + '%', 'Burnout/image', riskCol)}
        </div>

        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:8px">
          ${this.miniBar('Reputation', S.reputation, '⭐', repCol)}
          ${this.miniBar('Burnout', S.burnout, '🔥', burnCol)}
        </div>
      </div>`;
  },

  compactMetric(label, value, sub, color) {
    return `<div style="background:rgba(255,255,255,.035);border:1.5px solid var(--b1);border-radius:13px;padding:9px 10px;min-width:0">
      <div style="font-size:9px;font-weight:950;color:var(--muted);letter-spacing:.7px;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${this.esc(label)}</div>
      <div style="font-size:15px;font-weight:950;color:${color};line-height:1.15;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${this.esc(value)}</div>
      <div style="font-size:10px;font-weight:750;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${this.esc(sub)}</div>
    </div>`;
  },

  miniBar(label, val, icon, color) {
    val = Math.round(cl(val));
    return `<div style="background:var(--s1);border:1.5px solid var(--b1);border-radius:12px;padding:8px 9px">
      <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;align-items:center">
        <span style="font-size:10px;font-weight:950;color:var(--txt)">${this.esc(icon)} ${this.esc(label)}</span>
        <span style="font-size:10px;font-weight:950;color:${color}">${val}%</span>
      </div>
      <div style="height:6px;background:var(--s3);border-radius:999px;overflow:hidden"><div style="height:100%;width:${val}%;background:${color};border-radius:999px"></div></div>
    </div>`;
  },

  bestMove() {
    const G = window.G;
    if (!G) return { icon: '📌', title: 'No Life Loaded', text: 'Start a life to use Social.', action: '', color: 'var(--muted)' };
    this.ensure();
    const S = G.social;
    const f = G.followers || 0;
    const bestPost = this.bestPostType();
    const bestDef = this.postTypes[bestPost] || this.postTypes.quick;

    if (S.burnout >= 78) return { icon: '🌿', title: 'Recover first', text: 'Burnout is too high. Rest now to protect growth.', action: `Social.fame('break')`, color: 'var(--orange)' };
    if (S.reputation < 35 || S.brandSafety < 35) return { icon: '🛡️', title: 'Repair public image', text: 'Sponsors and followers need trust before you scale again.', action: (G.money || 0) >= sc(1200) ? `Social.fame('pr')` : `Social.fame('charity')`, color: 'var(--red)' };
    if (f >= 100000 && !S.verified && S.reputation >= 65) return { icon: '✅', title: 'Apply for verification', text: 'You qualify for a major trust boost.', action: `Social.ops('verify')`, color: 'var(--accent)' };
    if (f >= 50000 && !S.membership && this.engagementRate() >= 6) return { icon: '🔒', title: 'Launch membership', text: 'Your audience is ready for recurring income.', action: `Social.monetize('membership')`, color: 'var(--yellow)' };
    if (S.audienceQuality < 40) return { icon: '📊', title: 'Study analytics', text: 'Improve audience quality before chasing bigger posts.', action: `Social.ops('analytics')`, color: 'var(--cyan)' };
    return { icon: bestDef.icon, title: `Create: ${bestDef.name}`, text: `Best expected move right now based on trend, burnout and audience.`, action: `Social.post('${bestPost}')`, color: 'var(--green)' };
  },

  nextMoveHTML(move) {
    const disabled = !move.action;
    const safeAction = disabled ? `Social.toast('No action available.')` : move.action;
    return `<div class="info-box" style="margin-bottom:12px;border-color:${move.color}55;background:${move.color}10">
      <div style="display:flex;gap:10px;align-items:center;justify-content:space-between">
        <div style="display:flex;gap:10px;align-items:center;min-width:0">
          <div style="width:38px;height:38px;border-radius:14px;background:${move.color}18;display:flex;align-items:center;justify-content:center;font-size:21px;flex-shrink:0">${this.esc(move.icon)}</div>
          <div style="min-width:0">
            <div style="font-size:13px;font-weight:950;color:${move.color}">${this.esc(move.title)}</div>
            <div style="font-size:11px;color:var(--muted);font-weight:750;margin-top:2px">${this.esc(move.text)}</div>
          </div>
        </div>
        <button type="button" class="btn-primary btn-sm" style="width:auto;white-space:nowrap;background:${move.color}22;border-color:${move.color}66;color:${move.color}" onclick="${safeAction}">Do it</button>
      </div>
    </div>`;
  },

  quickActionsHTML() {
    const G = window.G;
    if (!G) return '';
    this.ensure();
    const best = this.bestPostType();
    const bestDef = this.postTypes[best] || this.postTypes.quick;
    const canBest = this.canPost(best);
    const f = G.followers || 0;
    const S = G.social;
    const monetizeAction = f >= 50000 && !S.membership ? `Social.monetize('membership')` : f >= 10000 ? `Social.monetize('sponsor')` : `Social.ops('analytics')`;
    const monetizeText = f >= 50000 && !S.membership ? 'Membership' : f >= 10000 ? 'Brand Deal' : 'Analytics';
    return `<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin-bottom:12px">
      ${this.quickButton(bestDef.icon, bestDef.name, canBest.ok ? `Social.post('${best}')` : `Social.toast('${this.attr(canBest.reason)}')`, 'Best content')}
      ${this.quickButton('📊', 'Analytics', `Social.ops('analytics')`, '+Skill +Audience')}
      ${this.quickButton('🌿', 'Break', `Social.fame('break')`, 'Lower burnout')}
      ${this.quickButton(f >= 10000 ? '💼' : '🧭', monetizeText, monetizeAction, f >= 10000 ? 'Earn money' : 'Improve plan')}
    </div>`;
  },

  quickButton(icon, label, action, sub) {
    return `<button type="button" onclick="${action}" style="background:var(--s1);border:1.5px solid var(--b1);border-radius:13px;padding:9px 8px;color:var(--txt);cursor:pointer;text-align:center;min-width:0">
      <div style="font-size:18px;line-height:1">${this.esc(icon)}</div>
      <div style="font-size:10px;font-weight:950;margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${this.esc(label)}</div>
      <div style="font-size:9px;color:var(--muted);font-weight:750;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${this.esc(sub)}</div>
    </button>`;
  },

  socialNavHTML(active) {
    const tabs = [
      ['create', '⚡', 'Create'],
      ['strategy', '🧭', 'Strategy'],
      ['monetize', '💰', 'Money'],
      ['ops', '🛠️', 'Ops'],
      ['history', '🕘', 'History']
    ];
    return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">${tabs.map(([id, icon, label]) => this.panelButton(id, icon, label, active === id)).join('')}</div>`;
  },

  panelButton(id, icon, label, active) {
    return `<button type="button" onclick="Social.setPanel('${id}')" style="border:1.5px solid ${active ? 'var(--accent)' : 'var(--b1)'};background:${active ? 'var(--accent)22' : 'var(--s1)'};color:${active ? 'var(--accent)' : 'var(--muted)'};border-radius:999px;padding:6px 10px;font-size:11px;font-weight:950;cursor:pointer">${icon} ${this.esc(label)}</button>`;
  },

  panelHTML(panel) {
    if (panel === 'strategy') return this.strategyPanelHTML();
    if (panel === 'monetize') return this.monetizePanelHTML();
    if (panel === 'ops') return this.opsPanelHTML();
    if (panel === 'history') return this.historyPanelHTML();
    return this.createPanelHTML();
  },

  createPanelHTML() {
    const G = window.G;
    if (!G) return '';
    this.ensure();
    const S = G.social;
    const best = this.bestPostType();

    return `
      <div class="sec">Create Content</div>
      <div class="act-grid">
        ${Object.entries(this.postTypes).map(([id, p]) => this.contentCard(id, p, id === best)).join('')}
      </div>
      <div class="sec">Creator Dashboard</div>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">
        ${this.progressBox('Content Skill', S.contentSkill, '🎥', 'var(--accent)')}
        ${this.progressBox('Consistency', S.consistency, '📅', this.colorFor(S.consistency, 'goodHigh'))}
        ${this.progressBox('Audience Quality', S.audienceQuality, '🧲', 'var(--cyan)')}
        ${this.progressBox('Brand Safety', S.brandSafety, '🛡️', this.colorFor(S.brandSafety, 'goodHigh'))}
      </div>
    `;
  },

  contentCard(id, p, recommended = false) {
    const can = this.canPost(id);
    const forecast = this.growthForecast(id);
    const risk = this.postRiskLabel(id);
    const cost = sc(p.cost || 0);
    const meta = can.ok
      ? `${fmtFollowers(forecast.low)}–${fmtFollowers(forecast.high)} followers · ${risk.label}${cost > 0 ? ` · ${fmt(cost)}` : ''}`
      : can.reason;
    const action = can.ok ? `Social.post('${id}')` : `Social.toast('${this.attr(can.reason)}')`;
    return `<div class="card ${can.ok ? '' : 'locked'} ${recommended ? 'special' : ''}" onclick="${action}" title="${this.esc(p.desc)}">
      <span class="ci">${can.ok ? this.esc(p.icon) : '🔒'}</span>
      <span class="cn">${this.esc(p.name)} ${recommended ? '⭐' : ''}</span>
      <span class="cd">${can.ok ? this.esc(p.desc) : this.esc(can.reason)}</span>
      <span class="cd" style="opacity:.82;font-size:10px;color:${risk.color}">${this.esc(meta)}</span>
    </div>`;
  },

  postRiskLabel(id) {
    const G = window.G;
    const S = G?.social || {};
    const def = this.postTypes[id] || this.postTypes.quick;
    let score = (def.stress || 0) * 9 + (S.burnout || 0) * .35;
    if (id === 'trend') score += Math.max(0, 60 - (S.brandSafety || 60)) * .5 + 12;
    if (id === 'premium' || id === 'documentary') score += 8;
    if (score >= 55) return { label: 'High risk', color: 'var(--red)' };
    if (score >= 32) return { label: 'Medium risk', color: 'var(--orange)' };
    return { label: 'Safe', color: 'var(--green)' };
  },

  bestPostType() {
    const G = window.G;
    if (!G) return 'quick';
    this.ensure();
    const S = G.social;
    const available = Object.keys(this.postTypes).filter(id => this.canPost(id).ok);
    if (!available.length) return 'quick';

    let best = available[0];
    let bestScore = -Infinity;
    available.forEach(id => {
      const fc = this.growthForecast(id);
      const def = this.postTypes[id];
      let score = (fc.low + fc.high) / 2;
      score += (id === 'series' ? S.audienceQuality * 8 : 0);
      score += (id === 'quality' ? S.contentSkill * 6 : 0);
      score += (id === 'trend' ? Math.max(0, S.brandSafety - 45) * 18 : 0);
      score -= (S.burnout || 0) * (def.stress || 1) * 16;
      if (this.trendMultiplier(id) > 1.08) score *= 1.12;
      if (score > bestScore) { bestScore = score; best = id; }
    });
    return best;
  },

  strategyPanelHTML() {
    const G = window.G;
    if (!G) return '';
    this.ensure();
    const S = G.social;
    const platform = this.platforms[S.platform] || this.platforms.short;
    const niche = this.niches[S.niche] || this.niches.lifestyle;
    const fit = Math.round(this.statFit() * 100);

    return `
      <div class="sec">Current Strategy</div>
      <div class="info-box" style="margin-bottom:12px">
        <p style="margin:0"><strong>${this.esc(platform.icon)} ${this.esc(platform.name)} + ${this.esc(niche.icon)} ${this.esc(niche.name)}</strong> · Stat fit ${fit}% · ${this.esc(niche.desc)}</p>
      </div>

      <div class="sec">Main Platform</div>
      <div class="act-grid">
        ${Object.entries(this.platforms).map(([id, p]) => this.selectCard({
          active: S.platform === id,
          icon: p.icon,
          name: p.name,
          desc: p.desc,
          meta: `Growth ×${p.growth} · Money ×${p.monetization} · Burnout +${p.burnout}`,
          action: `Social.setPlatform('${id}')`
        })).join('')}
      </div>

      <div class="sec">Content Niche</div>
      <div class="act-grid">
        ${Object.entries(this.niches).map(([id, n]) => this.selectCard({
          active: S.niche === id,
          icon: n.icon,
          name: n.name,
          desc: n.desc,
          meta: `Uses ${this.statName(n.stat)}`,
          action: `Social.setNiche('${id}')`
        })).join('')}
      </div>
    `;
  },

  monetizePanelHTML() {
    return `
      <div class="sec">Monetization</div>
      <div class="act-grid">
        ${this.monetizeCard('sponsor', '💼', 'Brand Deal', '10K followers', 'Best with high brand safety')}
        ${this.monetizeCard('merch', '👕', 'Launch Merch', '10K followers', 'Better with strong engagement')}
        ${this.monetizeCard('course', '🎓', 'Online Course', '55+ Smarts', 'Boosts authority')}
        ${this.monetizeCard('book', '📖', 'Write Book', 'No hard requirement', 'Big prestige swing')}
        ${this.monetizeCard('app', '📱', 'Launch App', '60+ Smarts', 'High upside product')}
        ${this.monetizeCard('membership', '🔒', 'Membership', '50K followers', 'Unlocks recurring income')}
      </div>`;
  },

  opsPanelHTML() {
    const G = window.G;
    if (!G) return '';
    this.ensure();
    const S = G.social;
    const f = G.followers || 0;
    return `
      <div class="sec">Public Image</div>
      <div class="act-grid">
        ${this.actionCard({ icon: '📰', name: 'Press Interview', desc: '+Fame +Reputation', meta: 'Safe credibility boost', action: `Social.fame('interview')` })}
        ${this.actionCard({ icon: '🎟️', name: 'Public Event', desc: `${fmt(sc(250))} · +Fame`, meta: '+Followers +Looks', action: `Social.fame('event')`, locked: (G.money || 0) < sc(250), lock: `Need ${fmt(sc(250))}` })}
        ${this.actionCard({ icon: '🤲', name: 'Charity Campaign', desc: '+Karma +Brand safety', meta: 'Best for clean image', action: `Social.fame('charity')` })}
        ${this.actionCard({ icon: '🔥', name: 'Court Controversy', desc: 'Huge risk, huge reach', meta: 'Can destroy reputation', action: `Social.fame('scandal')`, danger: true })}
        ${this.actionCard({ icon: '🛡️', name: 'Hire PR Help', desc: `${fmt(sc(1200))} · repair image`, meta: '+Reputation +Brand safety', action: `Social.fame('pr')`, locked: (G.money || 0) < sc(1200), lock: `Need ${fmt(sc(1200))}` })}
        ${this.actionCard({ icon: '🌿', name: 'Take Break', desc: 'Reduce burnout', meta: 'Consistency dips slightly', action: `Social.fame('break')` })}
      </div>

      <div class="sec">Creator Operations</div>
      <div class="act-grid">
        ${this.actionCard({ icon: '✅', name: 'Apply for Verification', desc: 'Requires 100K followers + reputation', meta: S.verified ? 'Already verified' : 'Public trust boost', action: `Social.ops('verify')`, locked: S.verified || f < 100000 || S.reputation < 65, lock: S.verified ? 'Already verified' : f < 100000 ? 'Need 100K followers' : 'Need 65+ reputation' })}
        ${this.actionCard({ icon: '🧑‍💼', name: 'Hire Manager', desc: `${fmt(sc(2500))} · improves deals`, meta: S.manager ? 'Manager hired' : 'Better sponsorships', action: `Social.ops('manager')`, locked: S.manager || (G.money || 0) < sc(2500) || f < 25000, lock: S.manager ? 'Already hired' : f < 25000 ? 'Need 25K followers' : `Need ${fmt(sc(2500))}` })}
        ${this.actionCard({ icon: '🧹', name: 'Clean Old Posts', desc: 'Repair brand safety', meta: `${fmt(sc(600))} · −scandal risk`, action: `Social.ops('cleanup')`, locked: (G.money || 0) < sc(600), lock: `Need ${fmt(sc(600))}` })}
        ${this.actionCard({ icon: '📊', name: 'Study Analytics', desc: '+Audience quality +Skill', meta: 'Free · small stress', action: `Social.ops('analytics')` })}
      </div>`;
  },

  historyPanelHTML() {
    return `${this.lastPostHTML(window.G?.social?.lastPost || { text: 'No creator moves yet.', type: 'neutral' })}${this.historyHTML()}`;
  },

  contextHTML({ health, trend, advice }) {
    return `<div style="display:grid;grid-template-columns:1fr;gap:8px;margin-top:12px;margin-bottom:8px">
      <div class="info-box" style="margin:0;border-color:${health.color}55;background:${health.color}10">
        <p style="margin:0"><strong>${health.icon} Creator Health:</strong> <span style="color:${health.color};font-weight:900">${this.esc(health.label)}</span> · ${this.esc(health.text)}</p>
      </div>
      <div class="info-box" style="margin:0;border-color:var(--accent)55;background:var(--accent)10">
        <p style="margin:0"><strong>${this.esc(trend.icon)} Platform Trend:</strong> ${this.esc(trend.label)} · <span style="color:var(--muted)">${this.esc(trend.desc)}</span></p>
      </div>
      <div class="info-box" style="margin:0;border-color:${advice.color}55;background:${advice.color}10">
        <p style="margin:0"><strong>${this.esc(advice.icon)} Coach Note:</strong> <span style="font-weight:900;color:${advice.color}">${this.esc(advice.title)}</span> · ${this.esc(advice.text)}</p>
      </div>
    </div>`;
  },

  ensure() {
    const G = window.G;
    if (!G) return;
    if (!G.social) G.social = {};
    const S = G.social;

    S.platform = this.platforms[S.platform] ? S.platform : 'short';
    S.niche = this.niches[S.niche] ? S.niche : 'lifestyle';
    S.contentSkill = Number.isFinite(S.contentSkill) ? S.contentSkill : 35;
    S.consistency = Number.isFinite(S.consistency) ? S.consistency : 45;
    S.audienceQuality = Number.isFinite(S.audienceQuality) ? S.audienceQuality : 45;
    S.reputation = Number.isFinite(S.reputation) ? S.reputation : 60;
    S.brandSafety = Number.isFinite(S.brandSafety) ? S.brandSafety : 60;
    S.burnout = Number.isFinite(S.burnout) ? S.burnout : 0;
    S.membership = !!S.membership;
    S.verified = !!S.verified;
    S.manager = !!S.manager;
    S.lastPost = S.lastPost || null;
    S.postHistory = Array.isArray(S.postHistory) ? S.postHistory : [];
    S.totalPosts = Number.isFinite(S.totalPosts) ? S.totalPosts : 0;
    S.viralHits = Number.isFinite(S.viralHits) ? S.viralHits : 0;
    S.bestPost = Number.isFinite(S.bestPost) ? S.bestPost : 0;
    S.streak = Number.isFinite(S.streak) ? S.streak : 0;
    S.lastPostAge = Number.isFinite(S.lastPostAge) ? S.lastPostAge : null;
    S.trendSeed = Number.isFinite(S.trendSeed) ? S.trendSeed : this.rand(0, 999999);
    S.trendYear = Number.isFinite(S.trendYear) ? S.trendYear : -1;
    S.trendId = S.trendId || 'authentic';
    S.panel = ['create', 'strategy', 'monetize', 'ops', 'history'].includes(S.panel) ? S.panel : 'create';

    S.contentSkill = cl(S.contentSkill);
    S.consistency = cl(S.consistency);
    S.audienceQuality = cl(S.audienceQuality);
    S.reputation = cl(S.reputation);
    S.brandSafety = cl(S.brandSafety);
    S.burnout = cl(S.burnout);
  },

  tier(f) {
    if (f >= 5000000) return { label: 'Global Celebrity', icon: '🌍', c: 'var(--yellow)', rank: 6 };
    if (f >= 1000000) return { label: 'Mega Influencer', icon: '💎', c: 'var(--yellow)', rank: 5 };
    if (f >= 100000) return { label: 'Macro Creator', icon: '⭐', c: 'var(--accent)', rank: 4 };
    if (f >= 10000) return { label: 'Rising Creator', icon: '🌟', c: 'var(--cyan)', rank: 3 };
    if (f >= 1000) return { label: 'Niche Creator', icon: '✨', c: 'var(--pink)', rank: 2 };
    return { label: 'Getting Started', icon: '👤', c: 'var(--muted)', rank: 1 };
  },

  nextTier(f) {
    const tiers = [
      { need: 1000, label: 'Niche Creator' },
      { need: 10000, label: 'Rising Creator' },
      { need: 100000, label: 'Macro Creator' },
      { need: 1000000, label: 'Mega Influencer' },
      { need: 5000000, label: 'Global Celebrity' }
    ];
    return tiers.find(t => f < t.need) || null;
  },

  engagementRate() {
    const G = window.G;
    if (!G) return 1;
    this.ensure();
    const S = G.social;
    const p = this.platforms[S.platform] || this.platforms.short;
    const raw = 2 + (S.audienceQuality / 15) + (S.consistency / 35) + (S.reputation / 45) + (S.verified ? 0.8 : 0) + (S.manager ? 0.3 : 0);
    const burnPenalty = Math.max(.68, 1 - (S.burnout || 0) / 260);
    const brandPenalty = Math.max(.82, .92 + (S.brandSafety || 60) / 750);
    return Math.max(1, Math.min(22, Math.round(raw * p.engagement * burnPenalty * brandPenalty * 10) / 10));
  },

  projectedIncome() {
    const G = window.G;
    if (!G) return 0;
    this.ensure();
    const f = G.followers || 0;
    const S = G.social;
    const p = this.platforms[S.platform] || this.platforms.short;
    const base = f * 0.012 * (this.engagementRate() / 5) * p.engagement * p.monetization;
    const repMult = 0.55 + (S.brandSafety || 60) / 100;
    const managerMult = S.manager ? 1.18 : 1;
    const verifiedMult = S.verified ? 1.08 : 1;
    const membership = S.membership ? f * 0.018 * (this.engagementRate() / 7) : 0;
    return sc(Math.floor((base + membership) * repMult * managerMult * verifiedMult));
  },

  statFit() {
    const G = window.G;
    if (!G) return 1;
    this.ensure();
    const niche = this.niches[G.social.niche] || this.niches.lifestyle;
    const val = niche.stat === 'fitness' ? (G.fitness || 50) : (G[niche.stat] || 50);
    return Math.max(.75, Math.min(1.38, val / 65));
  },

  growthForecast(kind = 'general') {
    const G = window.G;
    if (!G) return { low: 0, high: 0 };
    this.ensure();
    const S = G.social;
    const p = this.platforms[S.platform] || this.platforms.short;
    const def = this.postTypes[kind] || null;
    const fit = this.statFit();
    const quality = (S.contentSkill + S.consistency + S.audienceQuality) / 300;
    const burnoutPenalty = Math.max(.35, 1 - (S.burnout || 0) / 140);
    const trend = this.trendMultiplier(kind);
    const base = Math.max(40, (G.followers || 0) * 0.015 + 450);
    const typeMult = this.postGrowthMultiplier(kind);
    const riskDampener = kind === 'trend' ? Math.max(.8, (S.brandSafety || 60) / 80) : 1;
    const mid = base * p.growth * fit * (.7 + quality) * burnoutPenalty * trend * typeMult * riskDampener;
    const low = Math.max(0, Math.floor(mid * .45));
    const high = Math.max(10, Math.floor(mid * (def && kind !== 'quick' ? 1.95 : 1.55)));
    return { low, high };
  },

  postGrowthMultiplier(kind) {
    const map = {
      quick: .65,
      quality: 1.05,
      trend: 1.45,
      series: .92,
      live: .72,
      collab: 1.35,
      premium: 1.55,
      documentary: 1.7,
      general: 1
    };
    return map[kind] || 1;
  },

  momentumScore() {
    const G = window.G;
    if (!G) return 0;
    this.ensure();
    const S = G.social;
    const platform = this.platforms[S.platform] || this.platforms.short;
    const score =
      (S.contentSkill * .22) +
      (S.consistency * .25) +
      (S.audienceQuality * .20) +
      (S.reputation * .16) +
      (S.brandSafety * .10) +
      (Math.min(100, Math.log10((G.followers || 0) + 10) * 18) * .07) +
      ((platform.growth - 1) * 12) -
      ((S.burnout || 0) * .22);
    return cl(Math.round(score));
  },

  riskScore() {
    const G = window.G;
    if (!G) return 0;
    this.ensure();
    const S = G.social;
    const score =
      (S.burnout * .52) +
      ((100 - S.brandSafety) * .27) +
      ((100 - S.reputation) * .16) +
      (S.consistency < 25 ? 8 : 0) +
      ((G.stress || 0) > 75 ? 5 : 0);
    return cl(Math.round(score));
  },

  creatorAdvice() {
    const G = window.G;
    if (!G) return { icon: '📌', title: 'No Data', color: 'var(--muted)', text: 'Start creating to get advice.' };
    this.ensure();
    const S = G.social;
    const f = G.followers || 0;

    if (S.burnout >= 78) {
      return { icon: '🌿', title: 'Recover first', color: 'var(--orange)', text: 'Take a break before pushing another high-stress upload.' };
    }
    if (S.brandSafety < 35 || S.reputation < 35) {
      return { icon: '🛡️', title: 'Repair image', color: 'var(--red)', text: 'Use PR, charity, or cleanup before chasing trends again.' };
    }
    if (f >= 100000 && !S.verified && S.reputation >= 65) {
      return { icon: '✅', title: 'Get verified', color: 'var(--accent)', text: 'Verification can boost trust and long-term monetization.' };
    }
    if (f >= 50000 && !S.membership && this.engagementRate() >= 6) {
      return { icon: '🔒', title: 'Launch membership', color: 'var(--yellow)', text: 'Your audience is big enough for recurring income.' };
    }
    if (S.audienceQuality < 40) {
      return { icon: '📊', title: 'Study the audience', color: 'var(--cyan)', text: 'Analytics will improve quality and make future growth cleaner.' };
    }
    if (S.contentSkill < 45) {
      return { icon: '🎥', title: 'Build skill', color: 'var(--accent)', text: 'Quality uploads or series will improve your creator foundation.' };
    }
    if (this.trendMultiplier('quality') > 1.08) {
      return { icon: '💎', title: 'Ride the trend safely', color: 'var(--green)', text: 'The current platform trend rewards polished content.' };
    }
    return { icon: '🚀', title: 'Scale smart', color: 'var(--green)', text: 'Your best move is consistent quality without burning out.' };
  },

  creatorHealth() {
    const G = window.G;
    if (!G) return { icon: '❔', label: 'Unknown', color: 'var(--muted)', text: 'No active life loaded.' };
    this.ensure();
    const S = G.social;
    if (S.burnout >= 82) return { icon: '🔥', label: 'Burnout Danger', color: 'var(--red)', text: 'Take a break or your happiness and growth will suffer.' };
    if (S.reputation < 35) return { icon: '📉', label: 'Reputation Crisis', color: 'var(--red)', text: 'Brands and followers are losing trust.' };
    if (S.brandSafety < 35) return { icon: '⚠️', label: 'Brand Risk', color: 'var(--orange)', text: 'Sponsors may pay less until your image improves.' };
    if (S.consistency < 25) return { icon: '📅', label: 'Inconsistent', color: 'var(--orange)', text: 'Post or study analytics to rebuild momentum.' };
    if ((G.followers || 0) >= 100000 && !S.verified) return { icon: '✅', label: 'Verification Ready Soon', color: 'var(--accent)', text: 'Keep reputation high and apply for verification.' };
    return { icon: '💚', label: 'Healthy Momentum', color: 'var(--green)', text: 'Your creator career is stable and ready to scale.' };
  },

  currentTrend() {
    const G = window.G;
    if (!G) return { icon: '💬', label: 'Authentic Stories', desc: 'Reputation and audience quality matter more.', boost: {} };
    this.ensure();
    const S = G.social;
    const age = Number.isFinite(G.age) ? G.age : 0;

    if (S.trendYear !== age) {
      const ids = ['authentic', 'educational', 'shorts', 'community', 'premium', 'controversy'];
      S.trendId = ids[Math.abs((S.trendSeed + age * 17 + this.rand(0, 5))) % ids.length];
      S.trendYear = age;
    }

    const map = {
      authentic: {
        icon: '💬',
        label: 'Authentic Stories',
        desc: 'Reputation and audience quality matter more.',
        boost: { reputation: 1.08, audienceQuality: 1.08 }
      },
      educational: {
        icon: '🎓',
        label: 'Helpful Content',
        desc: 'Education, finance, and writing-style content perform better.',
        boost: { education: 1.18, finance: 1.14, writing: 1.12 }
      },
      shorts: {
        icon: '⚡',
        label: 'Short-Form Wave',
        desc: 'Short video gets a discovery boost this year.',
        boost: { short: 1.18 }
      },
      community: {
        icon: '🤝',
        label: 'Community Era',
        desc: 'Live streams, collabs, and memberships are stronger.',
        boost: { live: 1.14, collab: 1.16, membership: 1.1 }
      },
      premium: {
        icon: '💎',
        label: 'Premium Production',
        desc: 'High-quality uploads and documentaries perform better.',
        boost: { quality: 1.14, premium: 1.22, documentary: 1.18 }
      },
      controversy: {
        icon: '🔥',
        label: 'Drama Cycle',
        desc: 'Trend chasing grows faster, but scandal risk is higher.',
        boost: { trend: 1.18, scandal: 1.15 }
      }
    };

    return map[S.trendId] || map.authentic;
  },

  trendMultiplier(kind = 'general') {
    const G = window.G;
    if (!G) return 1;
    this.ensure();
    const S = G.social;
    const trend = this.currentTrend();
    const boost = trend.boost || {};
    let mult = 1;

    if (boost[S.platform]) mult *= boost[S.platform];
    if (boost[S.niche]) mult *= boost[S.niche];
    if (boost[kind]) mult *= boost[kind];
    if (boost.reputation) mult *= .95 + ((S.reputation || 60) / 100) * .13;
    if (boost.audienceQuality) mult *= .95 + ((S.audienceQuality || 45) / 100) * .15;

    return mult;
  },

  setPlatform(id) {
    const G = window.G;
    if (!G) return;
    this.ensure();
    if (!this.platforms[id]) return;

    const S = G.social;
    if (S.platform === id) {
      this.toast('Already focused on ' + this.platforms[id].name + '.');
      return;
    }

    S.platform = id;
    S.consistency = cl((S.consistency || 45) - 4);
    S.burnout = cl((S.burnout || 0) + 2);
    S.lastPost = {
      text: `You repositioned your brand around ${this.platforms[id].name}. Expect a short adjustment period.`,
      type: 'neutral'
    };

    this.log(`${this.platforms[id].icon} Switched your main platform to ${this.platforms[id].name}.`, 'fame');
    this.update();
    this.render();
  },

  setNiche(id) {
    const G = window.G;
    if (!G) return;
    this.ensure();
    if (!this.niches[id]) return;

    const S = G.social;
    if (S.niche === id) {
      this.toast('Already creating in ' + this.niches[id].name + '.');
      return;
    }

    S.niche = id;
    S.audienceQuality = cl((S.audienceQuality || 45) + 3);
    S.consistency = cl((S.consistency || 45) - 2);
    S.lastPost = {
      text: `Your audience is learning to know you for ${this.niches[id].name}.`,
      type: 'good'
    };

    this.log(`${this.niches[id].icon} Your content niche is now ${this.niches[id].name}.`, 'fame');
    this.update();
    this.render();
  },

  canPost(type) {
    const G = window.G;
    if (!G) return { ok: false, reason: 'No active life' };
    this.ensure();
    const def = this.postTypes[type];
    if (!def) return { ok: false, reason: 'Unavailable' };

    const req = def.req;
    const cost = sc(def.cost || 0);

    if (cost > 0 && (G.money || 0) < cost) return { ok: false, reason: `Need ${fmt(cost)}` };
    if (!req) return { ok: true, reason: '' };
    if (req.followers && (G.followers || 0) < req.followers) return { ok: false, reason: `Need ${req.label}` };
    if (req.smarts && (G.smarts || 0) < req.smarts) return { ok: false, reason: `Need ${req.label}` };
    if (req.fame && (G.fame || 0) < req.fame) return { ok: false, reason: `Need ${req.label}` };

    return { ok: true, reason: '' };
  },

  post(type) {
    const G = window.G;
    if (!G) return;
    this.ensure();
    const S = G.social;
    const can = this.canPost(type);

    if (!can.ok) {
      this.toast(can.reason || 'This content is locked.');
      return;
    }

    const f = G.followers || 0;
    const p = this.platforms[S.platform] || this.platforms.short;
    const def = this.postTypes[type] || this.postTypes.quick;
    const cost = sc(def.cost || 0);
    if (cost > 0) G.money -= cost;

    const burnoutPenalty = Math.max(.35, 1 - (S.burnout || 0) / 140);
    const fit = this.statFit();
    const quality = (S.contentSkill + S.consistency + S.audienceQuality) / 300;
    const lucky = G.trait === 'lucky' ? 1.25 : 1;
    const manager = S.manager ? 1.08 : 1;
    const trendMult = this.trendMultiplier(type);
    const brandShield = Math.max(.72, (S.brandSafety || 60) / 100);

    let base = 0;
    let viralChance = .04;
    let msg = '';
    let money = 0;
    let typeLog = 'fame';
    let repDelta = 0;
    let brandDelta = 0;
    let aqDelta = 0;
    let skillDelta = 0;
    let consistencyDelta = 0;
    let burnoutAdd = p.burnout;

    if (type === 'quick') {
      base = this.rand(40, 500) + Math.floor(f * .004);
      viralChance = .035;
      consistencyDelta = 4;
      burnoutAdd += 0;
      msg = 'Quick post kept your audience warm.';
    } else if (type === 'quality') {
      base = this.rand(300, 2800) + Math.floor(f * .008);
      viralChance = .075;
      skillDelta = 4;
      burnoutAdd += 5;
      G.stress = cl((G.stress || 0) + 3);
      msg = 'Quality upload landed well.';
    } else if (type === 'trend') {
      base = this.rand(500, 7000) + Math.floor(f * .012);
      viralChance = .13;
      consistencyDelta = 2;
      brandDelta = -this.rand(0, 4);
      burnoutAdd += 7;
      msg = 'Trend post caught attention.';
    } else if (type === 'series') {
      base = this.rand(220, 1800) + Math.floor(f * .006);
      viralChance = .055;
      aqDelta = 6;
      skillDelta = 3;
      burnoutAdd += 2;
      msg = 'Series episode deepened audience loyalty.';
    } else if (type === 'live') {
      base = this.rand(90, 950) + Math.floor(f * .005);
      viralChance = .045;
      money = sc(this.rand(20, 320) + Math.floor(f * .002));
      aqDelta = 3;
      burnoutAdd += 4;
      msg = `Live stream brought in ${fmt(money)} in tips.`;
    } else if (type === 'collab') {
      base = this.rand(800, 9000) + Math.floor(f * .018);
      viralChance = .08;
      aqDelta = 2;
      repDelta = 2;
      burnoutAdd += 4;
      msg = 'Collab introduced you to a new audience.';
    } else if (type === 'premium') {
      base = this.rand(1800, 15000) + Math.floor(f * .014);
      viralChance = .09;
      skillDelta = 6;
      aqDelta = 4;
      repDelta = 2;
      burnoutAdd += 8;
      G.stress = cl((G.stress || 0) + 5);
      msg = 'Premium drop felt like a major creator moment.';
    } else if (type === 'documentary') {
      base = this.rand(2500, 22000) + Math.floor(f * .012);
      viralChance = .07;
      skillDelta = 7;
      repDelta = 6;
      aqDelta = 5;
      burnoutAdd += 9;
      G.stress = cl((G.stress || 0) + 6);
      msg = 'Mini documentary elevated your credibility.';
    }

    const crisisRisk =
      Math.max(0, (100 - (S.brandSafety || 60)) / 450) +
      (type === 'trend' ? .035 : 0) +
      (S.reputation < 35 ? .04 : 0) +
      ((S.burnout || 0) > 82 ? .025 : 0);
    const crisis = Math.random() < crisisRisk;
    const viral = Math.random() < viralChance * lucky * burnoutPenalty * trendMult * brandShield;

    let gain = Math.max(0, Math.floor(base * p.growth * fit * (.65 + quality) * burnoutPenalty * lucky * manager * trendMult * (viral ? this.rand(8, 24) : 1)));

    if (crisis) {
      const loss = Math.min(gain + Math.floor(f * .08), this.rand(300, 18000));
      gain = Math.max(0, gain - loss);
      repDelta -= this.rand(5, 13);
      brandDelta -= this.rand(6, 16);
      G.happiness = cl((G.happiness || 50) - this.rand(4, 10));
      msg += ' A backlash started in the comments.';
      typeLog = 'bad';
    }

    S.consistency = cl(S.consistency + consistencyDelta);
    S.contentSkill = cl(S.contentSkill + skillDelta);
    S.audienceQuality = cl(S.audienceQuality + aqDelta);
    S.reputation = cl(S.reputation + repDelta);
    S.brandSafety = cl(S.brandSafety + brandDelta);
    S.burnout = cl(S.burnout + burnoutAdd);

    if (money > 0) {
      G.money += money;
      G.socialEarnings = (G.socialEarnings || 0) + money;
    }

    G.followers = Math.max(0, (G.followers || 0) + gain);
    G.fame = cl((G.fame || 0) + Math.max(1, Math.floor(gain / 1200)) + (viral ? 2 : 0));
    G.happiness = cl((G.happiness || 50) + (viral ? 14 : this.rand(4, 9)) - (crisis ? 5 : 0));

    S.totalPosts++;
    S.lastPostAge = G.age;
    S.streak = Number.isFinite(S.streak) ? S.streak + 1 : 1;
    S.bestPost = Math.max(S.bestPost || 0, gain);

    if (viral) {
      S.viralHits++;
      S.reputation = cl(S.reputation + this.rand(1, 4));
      if (!G.achievements) G.achievements = {};
      G.achievements.viral = true;
      typeLog = crisis ? 'bad' : 'special';
      msg = `${msg} It went viral: +${fmtFollowers(gain)} followers.`;
    } else {
      msg = `${msg} +${fmtFollowers(gain)} followers.`;
    }

    if (cost > 0) msg += ` Production cost: ${fmt(cost)}.`;

    S.lastPost = { text: msg, type: typeLog, gain, age: G.age, kind: type };
    this.addHistory({ age: G.age, kind: type, text: msg, gain, type: typeLog });

    this.log(`${p.icon} ${msg}`, typeLog);
    this.checkAch();
    this.update();
    this.render();
  },

  fame(type) {
    const G = window.G;
    if (!G) return;
    this.ensure();
    const S = G.social;

    if (type === 'interview') {
      G.fame = cl((G.fame || 0) + this.rand(4, 10));
      G.followers = (G.followers || 0) + this.rand(250, 2800);
      S.reputation = cl(S.reputation + this.rand(5, 9));
      S.brandSafety = cl(S.brandSafety + this.rand(2, 6));
      S.burnout = cl(S.burnout + 2);
      S.lastPost = { text: 'A press interview improved your credibility and visibility.', type: 'good' };
      this.log('📰 Press interview improved your credibility and visibility.', 'fame');
    } else if (type === 'event') {
      const c = sc(250);
      if ((G.money || 0) < c) {
        this.toast('Need ' + fmt(c) + '!');
        return;
      }
      G.money -= c;
      G.fame = cl((G.fame || 0) + this.rand(5, 12));
      G.looks = cl((G.looks || 50) + this.rand(2, 5));
      G.followers = (G.followers || 0) + this.rand(500, 6500);
      S.reputation = cl(S.reputation + this.rand(1, 4));
      S.burnout = cl(S.burnout + 3);
      S.lastPost = { text: 'Public event raised your profile and created new photo opportunities.', type: 'good' };
      this.log('🎟️ Public event raised your profile.', 'fame');
    } else if (type === 'charity') {
      G.fame = cl((G.fame || 0) + this.rand(6, 14));
      G.happiness = cl((G.happiness || 50) + this.rand(8, 14));
      G.karma = cl((G.karma || 0) + this.rand(3, 8), -100, 100);
      G.followers = (G.followers || 0) + this.rand(300, 4500);
      S.reputation = cl(S.reputation + this.rand(5, 10));
      S.brandSafety = cl(S.brandSafety + this.rand(8, 14));
      S.lastPost = { text: 'Charity campaign made your public image shine.', type: 'good' };
      this.log('🤲 Charity campaign made your public image shine.', 'fame');
    } else if (type === 'scandal') {
      const trend = this.trendMultiplier('scandal');
      if (Math.random() > 0.48 / trend) {
        G.fame = cl((G.fame || 0) + this.rand(10, 22));
        G.followers = (G.followers || 0) + this.rand(5000, 65000);
        S.reputation = cl(S.reputation - this.rand(8, 18));
        S.brandSafety = cl(S.brandSafety - this.rand(12, 24));
        S.burnout = cl(S.burnout + this.rand(8, 16));
        G.karma = cl((G.karma || 0) - this.rand(2, 7), -100, 100);
        S.lastPost = { text: 'Controversy brought massive attention, but brands got nervous.', type: 'bad' };
        this.log('🔥 Controversy brought massive attention, but brands got nervous.', 'fame');
      } else {
        G.fame = cl((G.fame || 0) - this.rand(8, 18));
        G.followers = Math.max(0, (G.followers || 0) - this.rand(1000, 28000));
        G.happiness = cl((G.happiness || 50) - 13);
        S.reputation = cl(S.reputation - this.rand(14, 26));
        S.brandSafety = cl(S.brandSafety - this.rand(18, 30));
        S.burnout = cl(S.burnout + this.rand(12, 24));
        S.lastPost = { text: 'Controversy backfired. Reputation damaged.', type: 'bad' };
        this.log('🔥 Controversy backfired. Reputation damaged.', 'bad');
      }
    } else if (type === 'pr') {
      const c = sc(1200);
      if ((G.money || 0) < c) {
        this.toast('Need ' + fmt(c) + '!');
        return;
      }
      G.money -= c;
      S.reputation = cl(S.reputation + this.rand(10, 18));
      S.brandSafety = cl(S.brandSafety + this.rand(8, 16));
      G.stress = cl((G.stress || 0) - this.rand(3, 7));
      S.lastPost = { text: 'PR help repaired your public image.', type: 'good' };
      this.log('🛡️ PR help repaired your public image.', 'good');
    } else if (type === 'break') {
      S.burnout = cl(S.burnout - this.rand(18, 30));
      S.consistency = cl(S.consistency - this.rand(2, 6));
      S.streak = 0;
      G.happiness = cl((G.happiness || 50) + this.rand(6, 12));
      G.stress = cl((G.stress || 0) - this.rand(8, 14));
      S.lastPost = { text: 'You took a creator break. Burnout dropped, but consistency dipped.', type: 'good' };
      this.log('🌿 You took a creator break. Burnout dropped, but consistency dipped.', 'good');
    }

    this.update();
    this.render();
  },

  monetize(type) {
    const G = window.G;
    if (!G) return;
    this.ensure();
    const S = G.social;
    let rev = 0;
    let msg = '';
    let kind = 'money';
    const brandMult = (.45 + (S.brandSafety || 60) / 100) * (.55 + (S.reputation || 60) / 100) * (S.manager ? 1.18 : 1) * (S.verified ? 1.08 : 1);

    if (type === 'sponsor') {
      if ((G.followers || 0) < 10000) {
        this.toast('Need 10K followers!');
        return;
      }
      rev = sc(Math.round(this.rand(800, 9000) * brandMult));
      S.brandSafety = cl(S.brandSafety - this.rand(0, 3));
      S.reputation = cl(S.reputation + 1);
      msg = `💼 Brand deal paid ${fmt(rev)}.`;
    } else if (type === 'merch') {
      if ((G.followers || 0) < 10000) {
        this.toast('Need 10K followers!');
        return;
      }
      rev = sc(Math.round(this.rand(600, 7000) * (this.engagementRate() / 5)));
      S.audienceQuality = cl(S.audienceQuality + 2);
      msg = `👕 Merch launch earned ${fmt(rev)}.`;
    } else if (type === 'course') {
      if ((G.smarts || 0) < 55) {
        this.toast('Need 55+ Smarts!');
        return;
      }
      rev = sc(this.rand(1200, 11000));
      S.reputation = cl(S.reputation + 4);
      S.contentSkill = cl(S.contentSkill + 3);
      msg = `🎓 Online course earned ${fmt(rev)}.`;
    } else if (type === 'book') {
      rev = sc(this.rand(2000, 26000));
      G.fame = cl((G.fame || 0) + this.rand(5, 15));
      S.reputation = cl(S.reputation + this.rand(4, 8));
      msg = `📖 Book published. First wave earned ${fmt(rev)}.`;
      kind = 'special';
    } else if (type === 'app') {
      if ((G.smarts || 0) < 60) {
        this.toast('Need 60+ Smarts!');
        return;
      }
      rev = sc(this.rand(5000, 55000));
      S.contentSkill = cl(S.contentSkill + 5);
      msg = `📱 App launch generated ${fmt(rev)}.`;
      kind = 'special';
    } else if (type === 'membership') {
      if ((G.followers || 0) < 50000) {
        this.toast('Need 50K followers!');
        return;
      }
      if (S.membership) {
        this.toast('Membership is already active.');
        return;
      }
      S.membership = true;
      rev = sc(this.rand(1500, 8500));
      S.audienceQuality = cl(S.audienceQuality + 5);
      msg = `🔒 Membership launched with ${fmt(rev)} in early support.`;
    }

    G.money = (G.money || 0) + rev;
    G.socialEarnings = (G.socialEarnings || 0) + rev;
    G.happiness = cl((G.happiness || 50) + this.rand(3, 8));
    S.burnout = cl(S.burnout + this.rand(1, 4));
    S.lastPost = { text: msg, type: kind, gain: 0, age: G.age, kind: type };
    this.addHistory({ age: G.age, kind: type, text: msg, gain: 0, type: kind });

    this.log(msg, kind);
    this.checkAch();
    this.update();
    this.render();
  },

  ops(type) {
    const G = window.G;
    if (!G) return;
    this.ensure();
    const S = G.social;

    if (type === 'verify') {
      if (S.verified) {
        this.toast('You are already verified.');
        return;
      }
      if ((G.followers || 0) < 100000) {
        this.toast('Need 100K followers.');
        return;
      }
      if ((S.reputation || 0) < 65) {
        this.toast('Need 65+ reputation.');
        return;
      }
      const pass = Math.random() < (.55 + (S.reputation || 65) / 180);
      if (pass) {
        S.verified = true;
        S.reputation = cl(S.reputation + 5);
        S.brandSafety = cl(S.brandSafety + 4);
        G.fame = cl((G.fame || 0) + 5);
        S.lastPost = { text: 'Verification approved. Your profile now carries more trust.', type: 'special' };
        this.log('✅ Verification approved. Your profile now carries more trust.', 'special');
      } else {
        S.reputation = cl(S.reputation - 2);
        S.lastPost = { text: 'Verification was denied. Try again with stronger reputation.', type: 'neutral' };
        this.log('✅ Verification was denied. Try again later.', 'neutral');
      }
    } else if (type === 'manager') {
      const c = sc(2500);
      if (S.manager) {
        this.toast('You already have a manager.');
        return;
      }
      if ((G.followers || 0) < 25000) {
        this.toast('Need 25K followers.');
        return;
      }
      if ((G.money || 0) < c) {
        this.toast('Need ' + fmt(c) + '!');
        return;
      }
      G.money -= c;
      S.manager = true;
      S.reputation = cl(S.reputation + 3);
      S.brandSafety = cl(S.brandSafety + 3);
      S.lastPost = { text: 'You hired a manager. Deals should become more profitable.', type: 'good' };
      this.log('🧑‍💼 You hired a creator manager.', 'good');
    } else if (type === 'cleanup') {
      const c = sc(600);
      if ((G.money || 0) < c) {
        this.toast('Need ' + fmt(c) + '!');
        return;
      }
      G.money -= c;
      S.brandSafety = cl(S.brandSafety + this.rand(8, 16));
      S.reputation = cl(S.reputation + this.rand(2, 6));
      G.stress = cl((G.stress || 0) - this.rand(1, 4));
      S.lastPost = { text: 'You cleaned up old posts and reduced future scandal risk.', type: 'good' };
      this.log('🧹 You cleaned up old posts and improved brand safety.', 'good');
    } else if (type === 'analytics') {
      S.audienceQuality = cl(S.audienceQuality + this.rand(3, 7));
      S.contentSkill = cl(S.contentSkill + this.rand(2, 5));
      S.consistency = cl(S.consistency + this.rand(1, 4));
      G.stress = cl((G.stress || 0) + this.rand(1, 3));
      S.lastPost = { text: 'Analytics review revealed what your audience actually wants.', type: 'good' };
      this.log('📊 Studied analytics and improved your content strategy.', 'good');
    }

    this.checkAch();
    this.update();
    this.render();
  },

  tick() {
    const G = window.G;
    if (!G) return;
    this.ensure();
    const S = G.social;
    const f = G.followers || 0;

    if (f > 0) {
      const inc = this.projectedIncome();
      if (inc > 0) {
        G.money = (G.money || 0) + inc;
        G.socialEarnings = (G.socialEarnings || 0) + inc;
        this.log(`📱 Social platforms paid ${fmt(inc)} this year.`, 'money');
      }

      const decay = Math.floor(f * (.003 + Math.max(0, (S.burnout - 60)) / 10000 + Math.max(0, (40 - S.consistency)) / 16000));
      G.followers = Math.max(0, f - decay);
      if (decay > 0 && decay > Math.max(80, f * .015)) this.log(`📉 Inactive followers drifted away: −${fmtFollowers(decay)}.`, 'bad');
    }

    if (Number.isFinite(S.lastPostAge) && S.lastPostAge !== null && Number.isFinite(G.age) && G.age > S.lastPostAge) {
      S.streak = 0;
    }

    S.burnout = cl((S.burnout || 0) - this.rand(2, 6));
    S.consistency = cl((S.consistency || 45) - this.rand(0, 2));

    if (S.reputation < 35 && Math.random() < .18) {
      const loss = this.rand(400, 9000);
      G.followers = Math.max(0, (G.followers || 0) - loss);
      this.log(`📉 Low reputation caused ${fmtFollowers(loss)} followers to leave.`, 'bad');
    }

    if (S.burnout > 80 && Math.random() < .2) {
      G.happiness = cl((G.happiness || 50) - this.rand(4, 9));
      G.stress = cl((G.stress || 0) + this.rand(4, 9));
      this.log('🔥 Creator burnout made social media feel exhausting.', 'bad');
    }

    if (S.brandSafety < 25 && Math.random() < .12) {
      const loss = sc(this.rand(600, 6000));
      G.money = Math.max(0, (G.money || 0) - loss);
      S.reputation = cl(S.reputation - this.rand(2, 6));
      this.log(`🛡️ A sponsor pulled out after reviewing your brand risk. Lost ${fmt(loss)}.`, 'bad');
    }
  },

  monetizeCard(type, icon, name, req, meta) {
    const G = window.G;
    if (!G) return '';
    this.ensure();
    const S = G.social;
    let locked = false;
    let lock = '';

    if (type === 'sponsor' && (G.followers || 0) < 10000) { locked = true; lock = 'Need 10K followers'; }
    if (type === 'merch' && (G.followers || 0) < 10000) { locked = true; lock = 'Need 10K followers'; }
    if (type === 'course' && (G.smarts || 0) < 55) { locked = true; lock = 'Need 55+ Smarts'; }
    if (type === 'app' && (G.smarts || 0) < 60) { locked = true; lock = 'Need 60+ Smarts'; }
    if (type === 'membership' && (G.followers || 0) < 50000) { locked = true; lock = 'Need 50K followers'; }
    if (type === 'membership' && S.membership) { locked = true; lock = 'Already active'; }

    return this.actionCard({ icon, name, desc: req, meta, action: `Social.monetize('${type}')`, locked, lock });
  },

  postMeta(type) {
    const def = this.postTypes[type] || this.postTypes.quick;
    const cost = sc(def.cost || 0);
    const can = this.canPost(type);
    const forecast = this.growthForecast(type);
    const costTxt = cost > 0 ? ` · ${fmt(cost)}` : '';
    const stressTxt = def.stress ? ` · Stress +${def.stress}` : '';
    return can.ok ? `~${fmtFollowers(forecast.low)}–${fmtFollowers(forecast.high)}${costTxt}${stressTxt}` : can.reason;
  },

  metricBox(label, value, sub, color) {
    return `<div class="nw-box" style="margin-bottom:0"><div class="nw-lbl">${this.esc(label)}</div><div class="nw-amt" style="font-size:20px;color:${color || 'var(--txt)'}">${this.esc(value)}</div><div class="nw-sub">${this.esc(sub)}</div></div>`;
  },

  progressBox(label, val, icon, color) {
    val = Math.round(cl(val));
    return `<div style="background:var(--s1);border:1.5px solid var(--b1);border-radius:13px;padding:10px">
      <div style="display:flex;justify-content:space-between;gap:8px;margin-bottom:7px;align-items:center">
        <span style="font-size:11px;font-weight:900;color:var(--txt)">${this.esc(icon)} ${this.esc(label)}</span>
        <span style="font-size:11px;font-weight:900;color:${color}">${val}%</span>
      </div>
      <div style="height:6px;background:var(--s3);border-radius:999px;overflow:hidden"><div style="height:100%;width:${val}%;background:${color};border-radius:999px"></div></div>
    </div>`;
  },

  selectCard({ active, icon, name, desc, meta, action }) {
    return `<div class="card ${active ? 'special' : ''}" onclick="${action}" title="${this.esc(desc)}">
      <span class="ci">${this.esc(icon)}</span>
      <span class="cn">${this.esc(name)} ${active ? '✓' : ''}</span>
      <span class="cd">${this.esc(desc)}</span>
      <span class="cd" style="opacity:.75;font-size:10px">${this.esc(meta || '')}</span>
    </div>`;
  },

  actionCard({ icon, name, desc, meta, action, locked = false, lock = '', danger = false }) {
    const cls = 'card ' + (locked ? 'locked ' : '') + (danger ? 'danger ' : '');
    const safeTitle = this.esc(locked ? (lock || 'Locked') : desc);
    const onclick = locked ? `Social.toast('${this.attr(lock || 'Locked')}')` : action;
    return `<div class="${cls.trim()}" onclick="${onclick}" title="${safeTitle}">
      <span class="ci">${locked ? '🔒' : this.esc(icon)}</span>
      <span class="cn">${this.esc(name)}</span>
      <span class="cd">${locked ? this.esc(lock || 'Locked') : this.esc(desc)}</span>
      ${meta ? `<span class="cd" style="opacity:.75;font-size:10px">${this.esc(meta)}</span>` : ''}
    </div>`;
  },

  alertsHTML() {
    const G = window.G;
    if (!G) return '';
    this.ensure();
    const S = G.social;
    let h = '';

    if (S.burnout >= 75) {
      h += `<div class="crit-banner orange"><span class="crit-banner-ico">🔥</span><div class="crit-banner-txt">Creator burnout is high (${Math.round(S.burnout)}%). Take a break before growth collapses.</div><button type="button" class="crit-go" onclick="Social.fame('break')">Rest</button></div>`;
    }
    if (S.reputation < 30) {
      h += `<div class="crit-banner red"><span class="crit-banner-ico">📉</span><div class="crit-banner-txt">Your reputation is in crisis. PR or charity can repair trust.</div><button type="button" class="crit-go" onclick="Social.fame('pr')">PR</button></div>`;
    }
    if ((G.followers || 0) >= 100000 && !S.verified && S.reputation >= 65) {
      h += `<div class="crit-banner"><span class="crit-banner-ico">✅</span><div class="crit-banner-txt">You may qualify for verification. Apply in Creator Operations.</div><button type="button" class="crit-go" onclick="Social.ops('verify')">Apply</button></div>`;
    }

    return h;
  },

  lastPostHTML(post) {
    const col = post.type === 'bad' ? 'var(--red)' : post.type === 'special' ? 'var(--yellow)' : post.type === 'money' ? 'var(--yellow)' : 'var(--green)';
    const gain = Number.isFinite(post.gain) && post.gain > 0 ? ` <span style="color:${col};font-weight:900">+${fmtFollowers(post.gain)}</span>` : '';
    return `<div class="info-box" style="margin:0;border-color:${col}55;background:${col}10"><p style="margin:0"><strong>Last move:</strong> ${this.esc(post.text)}${gain}</p></div>`;
  },

  emptyStateHTML() {
    return `<div class="info-box" style="margin:0"><p style="margin:0"><strong>Creator tip:</strong> Start with Quick Posts to build consistency, then use Quality Uploads or Series when burnout is low.</p></div>`;
  },

  historyHTML() {
    const G = window.G;
    if (!G) return '';
    this.ensure();
    const hist = (G.social.postHistory || []).slice(-5).reverse();
    if (!hist.length) return '';

    return `<div class="sec">Recent Creator History</div><div class="log-list" style="margin-bottom:8px">${hist.map(x => {
      const col = x.type === 'bad' ? 'var(--red)' : x.type === 'special' ? 'var(--accent)' : x.type === 'money' ? 'var(--yellow)' : 'var(--muted)';
      return `<div class="log-entry ${['bad', 'special', 'money', 'good'].includes(x.type) ? x.type : 'neutral'}"><div class="log-age" style="color:${col}">Age ${this.esc(x.age)}</div><div class="log-txt">${this.esc(x.text)}</div></div>`;
    }).join('')}</div>`;
  },

  addHistory(entry) {
    const G = window.G;
    if (!G) return;
    this.ensure();
    G.social.postHistory.push(entry);
    if (G.social.postHistory.length > 16) G.social.postHistory = G.social.postHistory.slice(-16);
  },

  colorFor(v, mode = 'goodHigh') {
    v = Number(v) || 0;
    if (mode === 'badHigh') return v >= 70 ? 'var(--red)' : v >= 40 ? 'var(--orange)' : 'var(--green)';
    return v >= 75 ? 'var(--green)' : v >= 45 ? 'var(--yellow)' : 'var(--red)';
  },

  statName(stat) {
    return { looks: 'Looks', smarts: 'Smarts', fitness: 'Fitness', happiness: 'Happiness', fame: 'Fame', reputation: 'Reputation' }[stat] || stat;
  },

  rand(min, max) {
    if (typeof r === 'function') return r(min, max);
    min = Math.ceil(Number(min) || 0);
    max = Math.floor(Number(max) || min);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  toast(message) {
    if (typeof UI !== 'undefined' && UI && typeof UI.toast === 'function') {
      UI.toast(message);
      return;
    }
    console.log('[LifeSim]', message);
  },

  log(message, type = 'neutral') {
    if (typeof Engine !== 'undefined' && Engine && typeof Engine.log === 'function') {
      Engine.log(message, type);
      return;
    }
    console.log(`[${type}]`, message);
  },

  update() {
    if (typeof UI !== 'undefined' && UI && typeof UI.update === 'function') UI.update();
  },

  checkAch() {
    if (typeof Engine !== 'undefined' && Engine && typeof Engine.checkAch === 'function') Engine.checkAch();
  },

  esc(v) {
    if (typeof UI !== 'undefined' && UI && UI._esc) return UI._esc(v);
    return String(v ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  },

  attr(v) {
    return String(v ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, ' ');
  }
};