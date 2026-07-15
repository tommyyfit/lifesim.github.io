/* js/career.js — LifeSim module 
 * legacy changelog vs UI:
 *   Fix  — Pension income was dead code (incomeTick returned early before reaching it)
 *   Fix  — Alimony was never deducted from income tick
 *   Fix  — Incomplete toast string in sleepWithBoss ("already .")
 *   Fix  — network() boosted jobPerf even without a career
 *   Fix  — Deadline career event used r(-3,4) which could IMPROVE performance on a "bad" event
 *   Fix  — apply() silently failed when player already had a job (no feedback)
 *   Fix  — suckyUp() method name inconsistent with 'suckUp' action key; renamed to suckUp()
 *   NEW     — Mentor system: seek a mentor early, mentor juniors later
 *   NEW     — Side hustle / freelance gig income
 *   NEW     — Overtime action (extra pay vs stress)
 *   NEW     — Job hunting while employed (competitive offers)
 *   NEW     — Negotiate equity / stock options (tech/finance jobs)
 *   NEW     — Remote work toggle with productivity effects
 *   NEW     — Union membership system
 *   NEW     — Promotion track with explicit check
 *   NEW     — Professional certifications (beyond basic courses)
 *   NEW     — Extended career event pool (15 events vs 4)
 *   NEW     — Company-level events: merger, layoff, culture award
 *   NEW     — Student loan mechanic for university enrollment
 *   IMPROVED — History panel shows full timeline, collapsed by default
 *   IMPROVED — jobFit scoring uses more stats
 *   IMPROVED — Boss gender now includes non-binary option
 *   IMPROVED — Promotion now affects title and prestige properly
 */

const Career = {
  VERSION:1,

  ACTION_LIMITS: {
    apply:3, workHard:2, askRaise:1, network:2, takeCourse:2,
    suckUp:1, bossAffair:1, sabotage:1, blowOff:1,
    studyUni:2, internship:1, cheatSchool:1, enroll:1, vocational:1,
    quit:1, retire:1, overtime:2, seekMentor:1, mentorJunior:1,
    lookForJob:2, sideHustle:2, negotiateEquity:1, requestRemote:1,
    joinUnion:1, getPromoted:1, getCertified:1,
  },

  HISTORY_LIMIT: 20,
  EVENT_MEMORY_LIMIT: 15,

  /* ═══════════════════════════════════════════════════════════════
   * RENDER — main tab paint
   * ═══════════════════════════════════════════════════════════════ */
  render() {
    const G = window.G;
    if (!G) return;
    const el = document.getElementById('tab-career');
    if (!el) return;
    this._ensure();

    let h = '';

    if ((G.age || 0) < 18) {
      el.innerHTML = `<div class="empty">
        <span class="ei">🎒</span>
        <p>Still preparing for adulthood.<br>Full careers unlock at age 18.</p>
      </div>`;
      return;
    }

    /* ── Retirement banner ── */
    if (G.retired) {
      h += `<div class="info-box" style="border-color:rgba(74,222,128,.4);background:rgba(74,222,128,.06)">
        <p>🏖️ <strong>Retired!</strong> Pension: <strong>${fmt(salaryScale(G.retirementPension || 0))}/yr</strong> paid automatically.
        ${G.careerMentor ? `<br>🎓 Your mentor ${this._esc(G.careerMentor.name)} still cheers you on.` : ''}
        Enjoy your golden years!</p>
      </div>`;
    }

    /* ── Student loan notice ── */
    if ((G.studentLoan || 0) > 0) {
      h += `<div class="info-box" style="border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.05)">
        <p>📋 <strong>Student Loan:</strong> ${fmt(salaryScale(G.studentLoan))} remaining
        · ${fmt(salaryScale(Math.ceil(G.studentLoan * 0.08)))}/yr auto-deducted from income.</p>
      </div>`;
    }

    /* ── Alimony notice ── */
    if (G.alimony && (G.alimony.yearsLeft || 0) > 0) {
      h += `<div class="info-box" style="border-color:rgba(239,68,68,.4);background:rgba(239,68,68,.05)">
        <p>💔 <strong>Alimony to ${this._esc(G.alimony.recipient)}:</strong>
        ${fmt(salaryScale(G.alimony.amount))}/yr · ${G.alimony.yearsLeft} yr${G.alimony.yearsLeft !== 1 ? 's' : ''} remaining.</p>
      </div>`;
    }

    /* ── Remote work badge ── */
    if (G.career && G.remoteWork) {
      h += `<div class="info-box" style="border-color:rgba(99,102,241,.4);background:rgba(99,102,241,.05)">
        <p>🏠 <strong>Working Remotely.</strong> Stress slightly lower, boss visibility reduced.</p>
      </div>`;
    }

    /* ── Union badge ── */
    if (G.career && G.unionMember) {
      h += `<div class="info-box" style="border-color:rgba(245,158,11,.4);background:rgba(245,158,11,.05)">
        <p>✊ <strong>Union Member.</strong> Protected from arbitrary firing. Dues: ${fmt(salaryScale(Math.floor((G.career.salary || 0) * 0.02)))}/yr.</p>
      </div>`;
    }

    /* ═══════════════════════ EMPLOYED ═══════════════════════════ */
    if (G.career) {
      const boss       = this._ensureBoss();
      const perf       = this._perf();
      const perfMeta   = this._perfMeta(perf);
      const stress     = G.career.stressAdd || 6;
      const health     = this._careerHealth();
      const actionSum  = this._actionSummary();
      const mentor     = G.careerMentor;
      const burnout    = this._burnoutRisk();

      /* ── Hero card ── */
      h += `<div class="career-hero">
        <div class="ch-ico">${G.career.icon}</div>
        <div class="ch-title">${this._esc(G.career.title)}${G.career.isTeamLead ? ' <span style="font-size:12px;color:var(--accent)">👑 Team Lead</span>' : ''}</div>
        <div class="ch-co">${this._esc(G.careerCompany)} · ${this._esc(G.career.cat)}</div>
        <div class="ch-sal">${fmtFull(salaryScale(G.career.salary))} / year${(G.career.equity || 0) > 0 ? ` + ${fmt(salaryScale(G.career.equity))} equity` : ''}</div>
        <div class="ch-meta">
          📅 ${G.yearsAtJob || 0} yr${(G.yearsAtJob || 0) !== 1 ? 's' : ''}
          · ⭐ Prestige ${G.career.prestige}
          · 😤 Stress +${stress}/yr
          ${(G.promotionCount || 0) > 0 ? `· 🏆 ${G.promotionCount} promotion${G.promotionCount !== 1 ? 's' : ''}` : ''}
        </div>
      </div>`;

      /* ── Metric grid ── */
      h += `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:12px">
        ${this._metricBox('Career Health', `${health.score}%`, health.label, health.color)}
        ${this._metricBox('Boss Favor', `${boss?.favor || 0}/100`, `Attraction ${boss?.attraction || 0}/100`, this._scoreColor(boss?.favor || 0))}
        ${this._metricBox('Actions Used', actionSum, 'Refreshes on Age Up', 'var(--accent)')}
        ${this._metricBox('Burnout Risk', `${burnout}%`, 'High stress hurts health', burnout > 60 ? 'var(--red)' : burnout > 35 ? 'var(--yellow)' : 'var(--green)')}
      </div>`;

      /* ── Mentor box ── */
      if (mentor) {
        h += `<div class="info-box" style="border-color:rgba(99,102,241,.4);margin-bottom:12px">
          <p>🎓 <strong>Mentor: ${this._esc(mentor.name)}</strong> (${this._esc(mentor.field)}) · Guidance ${mentor.guidance || 0}/100.
          Mentors boost raise chances and help you navigate office politics.</p>
        </div>`;
      }

      /* ── Boss card ── */
      const bossMood = boss.favor >= 70 ? 'Supportive' : boss.favor >= 40 ? 'Neutral' : 'Difficult';
      const bossAdvice = boss.favor >= 70 ? 'Good timing for raise or promotion plays.' : boss.favor >= 40 ? 'Keep performance steady and network carefully.' : 'Protect your performance and avoid office drama.';
      h += `<section class="career-ui-boss-card">
        <div class="career-ui-boss-avatar">${boss.favor >= 70 ? '😊' : boss.favor >= 40 ? '😐' : '😤'}</div>
        <div>
          <div class="legacy-ui-kicker">Manager relationship</div>
          <h3>${this._esc(boss.name)} · ${bossMood}</h3>
          <p>${bossAdvice}</p>
        </div>
        <div class="career-ui-boss-metrics">
          <span>Favor ${boss.favor || 0}/100</span>
          <span>Workplace chemistry ${boss.attraction || 0}/100</span>
        </div>
      </section>`;

      /* ── Performance bar ── */
      h += `<div style="margin-bottom:12px">
        <div class="sb-top" style="margin-bottom:4px">
          <span class="sb-l">Job Performance</span>
          <span class="sb-v" style="color:${perfMeta.color}">${perfMeta.label} (${perf}%)</span>
        </div>
        <div class="prog-bar"><div class="prog-fill" style="width:${perf}%;background:${perfMeta.color}"></div></div>
      </div>`;

      /* ── Primary action grid ── */
      h += `<div class="act-grid">
        ${this._actionCard('💪', 'Work Hard',         '+Performance +Stress',               'Career.workHard()',         'workHard')}
        ${this._actionCard('📈', 'Ask for Raise',     'Negotiate salary up',                 'Career.askRaise()',         'askRaise')}
        ${this._actionCard('🤝', 'Network',           '+Smarts +Contacts',                   'Career.network()',          'network')}
        ${this._actionCard('⏰', 'Work Overtime',     '+Pay +Stress, chance of recognition', 'Career.overtime()',         'overtime')}
      </div>`;

      /* ── Secondary action grid ── */
      h += `<div class="act-grid" style="margin-top:8px">
        ${this._actionCard('📚', 'Take Course',       `+Smarts (${fmt(sc(300))})`,           'Career.takeCourse()',       'takeCourse')}
        ${this._actionCard('📜', 'Get Certified',     `+Prestige (${fmt(sc(500))})`,         'Career.getCertified()',     'getCertified')}
        ${this._actionCard('🔍', 'Job Hunt',          'Look for better offers',              'Career.lookForJob()',       'lookForJob')}
        ${this._actionCard('💻', 'Side Hustle',       'Extra freelance income',              'Career.sideHustle()',       'sideHustle')}
      </div>`;

      /* ── Office politics grid ── */
      h += `<div class="act-grid" style="margin-top:8px">
        ${this._actionCard('😊', 'Suck Up to Boss',   '+Favor, risky',                      'Career.suckUp()',           'suckUp')}
        ${this._actionCard('🔥', 'Office Affair',     'High bonus, high risk',              'Career.sleepWithBoss()',    'bossAffair', false, true)}
        ${this._actionCard('😈', 'Sabotage Rival',    'Risky office politics',              'Career.sabotage()',         'sabotage',   false, true)}
        ${this._actionCard('🏖️', 'Skip Work',        '+Happiness −Performance',             'Career.blowOff()',          'blowOff')}
      </div>`;

      /* ── Management & perks grid ── */
      const equityJobs = ['finance', 'tech', 'startup', 'executive'];
      const showEquity = equityJobs.some(k => (G.career.cat || '').toLowerCase().includes(k));
      h += `<div class="act-grid" style="margin-top:8px">
        ${(G.promotionCount || 0) >= 2 && !G.careerMentor ? this._actionCard('🎓', 'Seek Mentor', 'Career guidance +boost', 'Career.seekMentor()', 'seekMentor') : ''}
        ${(G.promotionCount || 0) >= 4 ? this._actionCard('👨‍🏫', 'Mentor Junior', '+Prestige +Happiness', 'Career.mentorJunior()', 'mentorJunior') : ''}
        ${showEquity ? this._actionCard('📊', 'Negotiate Equity', '+Stock options', 'Career.negotiateEquity()', 'negotiateEquity') : ''}
        ${!G.remoteWork ? this._actionCard('🏠', 'Request Remote', 'Work from home', 'Career.requestRemote()', 'requestRemote') : this._actionCard('🏢', 'Return to Office', 'Back to office', 'Career.requestRemote()', 'requestRemote')}
        ${!G.unionMember ? this._actionCard('✊', 'Join Union', 'Job protection + dues', 'Career.joinUnion()', 'joinUnion') : ''}
        ${(G.jobPerf || 0) >= 80 ? this._actionCard('🏆', 'Push for Promotion', 'Seek title upgrade', 'Career.getPromoted()', 'getPromoted') : ''}
      </div>`;

      /* ── Danger row ── */
      h += `<div class="act-grid" style="margin-top:8px">
        ${this._actionCard('🚪', 'Quit Job', 'Resign permanently', 'Career.quit()', 'quit', false, true)}
      </div>`;

      /* ── Retire button (age 55+) ── */
      if ((G.age || 0) >= 55) {
        const pension = this._pensionEstimate();
        const retireLocked = this._usesLeft('retire') <= 0;
        h += `<div class="row-card ${retireLocked ? 'locked' : ''}" onclick="${retireLocked ? '' : 'Career.retire()'}"
          style="margin-top:12px;border-color:rgba(251,191,36,.5);background:rgba(251,191,36,.06)">
          <span class="ri">🏖️</span>
          <div class="rd">
            <div class="rt" style="color:var(--yellow)">Retire Now</div>
            <div class="rs">Age 55+ · Pension: ~${fmt(salaryScale(pension))}/yr · ${(G.yearsAtJob || 0)} years of service</div>
          </div>
          <div class="rv" style="color:var(--yellow)">✓</div>
        </div>`;
      }
    }

    /* ═══════════════════════ NOT EMPLOYED ═══════════════════════ */
    if (!G.career) {

      /* ── In school message ── */
      if (G.inSchool) {
        h += `<div class="info-box"><p>📚 Currently in school — age ${G.age}.
          Study hard to unlock more options after graduation!</p></div>`;
      }

      /* ── University enrollment options ── */
      if (G.education === 'high_school' && !G.inUniversity && (G.age || 0) >= 18 && (G.age || 0) <= 35) {
        h += `<div class="sec">🎓 Higher Education</div>`;
        UNIVERSITIES.forEach(u => {
          const cost   = sc(u.cost);
          const canPay = (G.money || 0) >= cost;
          const loan   = (G.age || 0) <= 22; // young can take student loans
          const locked = (!canPay && !loan) || this._usesLeft('enroll') <= 0;
          const loanNote = loan && !canPay ? ' · Student loan option' : '';
          h += `<div class="row-card ${locked ? 'locked' : ''}" onclick="${locked ? '' : `Career.enroll('${u.id}')`}">
            <span class="ri">🏛️</span>
            <div class="rd">
              <div class="rt">${this._esc(u.name)}</div>
              <div class="rs">${this._esc(u.label)} · +${u.smartsBonus} Smarts · ${u.duration || 4} yrs${loanNote}</div>
            </div>
            <div class="rv">${fmt(cost)}</div>
          </div>`;
        });

        /* Vocational option */
        const vocCost   = sc(6000);
        const vocLocked = ((G.money || 0) < vocCost && (G.age || 0) > 22) || this._usesLeft('vocational') <= 0;
        h += `<div class="row-card ${vocLocked ? 'locked' : ''}" onclick="${vocLocked ? '' : 'Career.vocational()'}">
          <span class="ri">🔧</span>
          <div class="rd"><div class="rt">Vocational Training</div><div class="rs">2-yr trade cert · Skilled jobs · Faster path</div></div>
          <div class="rv">${fmt(vocCost)}</div>
        </div>`;
      }

      /* ── In university panel ── */
      if (G.inUniversity) {
        const dur       = this._univDuration();
        const remaining = Math.max(0, dur - (G.univYear || 0));
        const u         = UNIVERSITIES.find(x => x.id === G.univType) || UNIVERSITIES[1] || UNIVERSITIES[0];
        h += `<div class="row-card" style="border-color:var(--accent)">
          <span class="ri">🏛️</span>
          <div class="rd">
            <div class="rt">University — Year ${G.univYear || 0}/${dur}</div>
            <div class="rs">${this._esc(u?.name || 'University')} · Graduating in ${remaining} year${remaining !== 1 ? 's' : ''}</div>
          </div>
          <div class="rv">${Math.round(((G.univYear || 0) / dur) * 100)}%</div>
        </div>`;
        h += `<div class="act-grid">
          ${this._actionCard('📖', 'Study Extra',      '+Smarts faster',                'Career.studyUni()',    'studyUni')}
          ${this._actionCard('💼', 'Internship',       '+Smarts +Money',                'Career.internship()', 'internship')}
          ${this._actionCard('📝', 'Cheat / Sell Notes','Money + expulsion risk',       'Career.cheatSchool()','cheatSchool', false, true)}
          ${this._actionCard('🚪', 'Drop Out',          'Leave university permanently', 'Career.dropout()',    'quit',        false, true)}
        </div>`;
      }
    }

    /* ═══════════════════════ JOB BOARD ══════════════════════════ */
    if (!G.career && !G.inUniversity && !G.retired) {
      const avail = CAREERS.filter(j => {
        if ((G.age || 0) < j.minAge) return false;
        if (j.req === 'university' && G.education !== 'university') return false;
        if (j.req === 'vocational' && G.education !== 'vocational' && G.education !== 'university') return false;
        return true;
      }).sort((a, b) => this._jobFit(b).score - this._jobFit(a).score || b.salary - a.salary);

      h += `<section class="career-ui-career-section-head"><div><div class="legacy-ui-kicker">Job market</div><h3>📋 Job Board</h3><p>Best matches are sorted by fit, salary and requirements. Pick a role that improves long-term income without crushing your health.</p></div><span class="career-ui-career-count">${avail.length} open role${avail.length !== 1 ? 's' : ''}</span></section>`;
      if (!avail.length) {
        h += `<div class="empty"><p>No jobs match your profile yet.<br>Get more education or wait until you're older.</p></div>`;
      } else {
        avail.forEach(job => {
          const fit    = this._jobFit(job);
          const locked = this._usesLeft('apply') <= 0;
          h += `<div class="row-card ${locked ? 'locked' : ''}" onclick="${locked ? '' : `Career.apply('${job.id}')`}">
            <span class="ri">${job.icon}</span>
            <div class="rd">
              <div class="rt">${this._esc(job.title)}</div>
              <div class="rs">${this._esc(job.cat)} · Age ${job.minAge}+ · ${fit.label} chance · Stress +${job.stressAdd}/yr</div>
            </div>
            <div class="rv">${fmt(salaryScale(job.salary))}/yr</div>
          </div>`;
        });
      }
    }

    h += this._renderHistory();
    el.innerHTML = h;
  },

  /* ═══════════════════════════════════════════════════════════════
   * INIT / ENSURE
   * ═══════════════════════════════════════════════════════════════ */
  _ensure() {
    const G = window.G;
    if (!G) return;
    if (!Array.isArray(G.careerHistory))     G.careerHistory     = [];
    if (!Array.isArray(G.educationHistory))  G.educationHistory  = [];
    if (!Array.isArray(G.careerEventMemory)) G.careerEventMemory = [];
    if (!G.careerActionUses || typeof G.careerActionUses !== 'object') G.careerActionUses = {};
    if (!Number.isFinite(G.careerActionYear)) G.careerActionYear = G.age || 0;
    if (!Number.isFinite(G.jobPerf))          G.jobPerf          = G.career ? 52 : 50;
    if (!Number.isFinite(G.yearsAtJob))       G.yearsAtJob       = 0;
    if (!Number.isFinite(G.promotionCount))   G.promotionCount   = 0;
    if (!Number.isFinite(G.retirementPension))G.retirementPension= 0;
    if (G.inUniversity && !Number.isFinite(G.univYear)) G.univYear = 0;
    if (G.inUniversity && !G.univType && UNIVERSITIES?.[0])  G.univType = UNIVERSITIES[0].id;
    if (!Number.isFinite(G.studentLoan))      G.studentLoan      = 0;
    if (typeof G.remoteWork !== 'boolean')    G.remoteWork       = false;
    if (typeof G.unionMember !== 'boolean')   G.unionMember      = false;
    this._resetActionYearIfNeeded();
    if (G.career) this._ensureBoss();
  },

  _resetActionYearIfNeeded() {
    const G = window.G;
    if (!G) return;
    if (!Number.isFinite(G.careerActionYear)) G.careerActionYear = G.age || 0;
    if (!G.careerActionUses || typeof G.careerActionUses !== 'object') G.careerActionUses = {};
    if (G.careerActionYear !== (G.age || 0)) {
      G.careerActionYear = G.age || 0;
      G.careerActionUses = {};
    }
  },

  /* ═══════════════════════════════════════════════════════════════
   * ACTION SYSTEM
   * ═══════════════════════════════════════════════════════════════ */
  _usesLeft(action) {
    const G = window.G;
    if (!G) return 0;
    this._resetActionYearIfNeeded();
    const limit = this.ACTION_LIMITS[action] ?? 99;
    const used  = G.careerActionUses?.[action] || 0;
    return Math.max(0, limit - used);
  },

  _canUseAction(action, msg = "That action is not ready right now.") {
    if (this._usesLeft(action) <= 0) { UI.toast(msg, 'bad'); return false; }
    return true;
  },

  _markAction(action) {
    const G = window.G;
    if (!G) return;
    this._resetActionYearIfNeeded();
    G.careerActionUses[action] = (G.careerActionUses[action] || 0) + 1;
  },

  _actionSummary() {
    const G = window.G;
    if (!G) return 'fresh year';
    this._resetActionYearIfNeeded();
    const used = Object.values(G.careerActionUses || {}).reduce((a, n) => a + (Number(n) || 0), 0);
    return used ? `${used} used age ${G.age}` : 'fresh year';
  },

  _actionCard(icon, label, sub, onclick, action, forceLocked = false, danger = false) {
    const left     = action ? this._usesLeft(action) : 99;
    const locked   = forceLocked || left <= 0;
    const leftTxt  = '';
    return `<div class="card ${danger ? 'danger ' : ''}${locked ? 'locked' : ''}" onclick="${locked ? '' : onclick}">
      <span class="ci">${icon}</span>
      <span class="cn">${this._esc(label)}</span>
      <span class="cd">${this._esc(sub)}${leftTxt}</span>
    </div>`;
  },

  _metricBox(label, value, sub, color) {
    return `<div class="nw-box" style="margin-bottom:0">
      <div class="nw-lbl">${this._esc(label)}</div>
      <div class="nw-amt" style="font-size:22px${color ? `;color:${color}` : ''}">${this._esc(value)}</div>
      <div class="nw-sub">${this._esc(sub)}</div>
    </div>`;
  },

  /* ═══════════════════════════════════════════════════════════════
   * HISTORY PANEL
   * ═══════════════════════════════════════════════════════════════ */
  _renderHistory() {
    const G = window.G;
    if (!G) return '';
    const career = (G.careerHistory  || []).slice(0, 8);
    const edu    = (G.educationHistory || []).slice(0, 6);
    if (!career.length && !edu.length) return '';

    let h = '<details class="history-toggle"><summary>📋 Career &amp; Education History</summary><div class="history-toggle-body">';

    if (edu.length) {
      h += `<div class="sec" style="font-size:12px;margin:8px 0 4px">Education</div>`;
      edu.forEach(row => {
        h += `<div class="row-card">
          <span class="ri">${row.icon || '🎓'}</span>
          <div class="rd">
            <div class="rt">Age ${row.age} · ${this._esc(row.label)}</div>
            <div class="rs">${this._esc(row.detail || '')}</div>
          </div>
        </div>`;
      });
    }

    if (career.length) {
      h += `<div class="sec" style="font-size:12px;margin:8px 0 4px">Work</div>`;
      career.forEach(row => {
        const color = row.type === 'good' ? 'var(--green)' : row.type === 'bad' ? 'var(--red)' : row.type === 'special' ? 'var(--yellow)' : 'var(--text-muted)';
        h += `<div class="row-card">
          <span class="ri">${row.icon || '💼'}</span>
          <div class="rd">
            <div class="rt">Age ${row.age} · ${this._esc(row.label)}</div>
            <div class="rs">${this._esc(row.detail || '')}</div>
          </div>
          <div class="rv" style="color:${color}">${this._esc(row.type || '')}</div>
        </div>`;
      });
    }

    return h + '</div></details>';
  },

  _recordCareer(label, detail = '', type = 'work', icon = '💼') {
    const G = window.G;
    if (!G) return;
    if (!Array.isArray(G.careerHistory)) G.careerHistory = [];
    G.careerHistory.unshift({ age: G.age || 0, label, detail, type, icon });
    if (G.careerHistory.length > this.HISTORY_LIMIT) G.careerHistory.length = this.HISTORY_LIMIT;
  },

  _recordEducation(label, detail = '', icon = '🎓') {
    const G = window.G;
    if (!G) return;
    if (!Array.isArray(G.educationHistory)) G.educationHistory = [];
    G.educationHistory.unshift({ age: G.age || 0, label, detail, icon });
    if (G.educationHistory.length > this.HISTORY_LIMIT) G.educationHistory.length = this.HISTORY_LIMIT;
  },

  _rememberEvent(id) {
    const G = window.G;
    if (!G) return;
    if (!Array.isArray(G.careerEventMemory)) G.careerEventMemory = [];
    G.careerEventMemory.unshift({ id, age: G.age || 0 });
    if (G.careerEventMemory.length > this.EVENT_MEMORY_LIMIT) G.careerEventMemory.length = this.EVENT_MEMORY_LIMIT;
  },

  _recentEvent(id, windowSize = 4) {
    const G = window.G;
    if (!G) return false;
    return (G.careerEventMemory || []).slice(0, windowSize).some(e => e.id === id);
  },

  /* ═══════════════════════════════════════════════════════════════
   * HELPER UTILITIES
   * ═══════════════════════════════════════════════════════════════ */
  _esc(s) {
    return String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  },

  _scoreColor(v) {
    const n = Number(v) || 0;
    if (n >= 75) return 'var(--green)';
    if (n >= 55) return 'var(--teal)';
    if (n >= 35) return 'var(--yellow)';
    return 'var(--red)';
  },

  _perf() {
    const G = window.G;
    return cl(Math.round(Number(G?.jobPerf ?? 50)), 0, 100);
  },

  _perfMeta(perf = this._perf()) {
    if (perf > 85) return { label: 'Excellent', color: 'var(--green)'  };
    if (perf > 65) return { label: 'Good',      color: 'var(--teal)'   };
    if (perf > 42) return { label: 'Average',   color: 'var(--yellow)' };
    if (perf > 22) return { label: 'Poor',      color: 'var(--orange)' };
    return               { label: 'Terrible',   color: 'var(--red)'    };
  },

  _careerHealth() {
    const G      = window.G;
    const perf   = this._perf();
    const stress = G?.stress  || 0;
    const boss   = G?.careerBoss?.favor || 40;
    const years  = G?.yearsAtJob || 0;
    const mentor = G?.careerMentor ? 8 : 0;
    const union  = G?.unionMember  ? 5 : 0;
    const remote = G?.remoteWork   ? 3 : 0;
    const score  = cl(Math.round(
      perf * 0.50 +
      boss * 0.18 +
      Math.min(15, years * 1.5) -
      Math.max(0, stress - 50) * 0.30 +
      mentor + union + remote + 10
    ));
    if (score >= 78) return { score, label: 'Promotion track', color: 'var(--green)'  };
    if (score >= 58) return { score, label: 'Stable role',     color: 'var(--teal)'   };
    if (score >= 38) return { score, label: 'Needs attention', color: 'var(--yellow)' };
    return                  { score, label: 'Job at risk',      color: 'var(--red)'    };
  },

  _burnoutRisk() {
    const G      = window.G;
    if (!G) return 0;
    const stress = G.stress || 0;
    const add    = G.career?.stressAdd || 0;
    const health = G.health || 50;
    const remote = G.remoteWork ? -5 : 0;
    return cl(Math.round(stress * 0.60 + add * 2.0 - Math.max(0, health - 60) * 0.20 + remote), 0, 100);
  },

  _univDuration() {
    const G = window.G;
    const u = UNIVERSITIES.find(x => x.id === G?.univType) || UNIVERSITIES[1] || UNIVERSITIES[0];
    return Math.max(1, Math.round(u?.duration || 4));
  },

  _jobFit(job) {
    const G            = window.G;
    const smartBonus   = G.trait === 'ambitious' ? 8 : G.trait === 'intellectual' ? 6 : 0;
    const effectiveSmarts = (G.smarts || 0) + smartBonus;
    const adultIndustry = job.cat === 'Adult Entertainment';
    const mentorBonus  = G.careerMentor ? 0.06 : 0;
    const certBonus    = (G.certifications || 0) * 0.03;
    let base = effectiveSmarts >= job.smartsReq ? 0.74 : effectiveSmarts >= job.smartsReq * 0.6 ? 0.42 : 0.22;
    const looksBonus  = (G.looks || 0)  > 70 ? 0.08 : 0;
    const fameBonus   = (G.fame  || 0)  > 25 ? 0.08 : 0;
    const skillBonus  = ((G.skills?.negotiation || 0) * 0.025) + ((G.skills?.leadership || 0) * 0.025);
    if (adultIndustry) base = Math.max(base, 0.35 + (G.looks || 50) / 250 + ((G.fame || 0) / 500));
    const chance = Math.min(0.95, base + looksBonus + (adultIndustry ? fameBonus : 0) + skillBonus + mentorBonus + certBonus);
    const pct    = Math.round(chance * 100);
    const label  = pct >= 75 ? '🟢 High' : pct >= 50 ? '🟡 Medium' : pct >= 30 ? '🟠 Fair' : '🔴 Low';
    return { chance, pct, label, score: pct + (job.salary || 0) / 1000 };
  },

  /* ── Boss ── */
  _bossGender() {
    const G = window.G;
    // Opposite gender with small non-binary chance for inclusivity
    const roll = Math.random();
    if (roll < 0.05) return 'non-binary';
    return G.gender === 'female' ? 'male' : 'female';
  },

  _ensureBoss() {
    const G = window.G;
    if (!G || !G.career) return null;
    const gender = this._bossGender();
    if (!G.careerBoss || G.careerBoss.jobId !== G.career.id) {
      G.careerBoss = {
        jobId:        G.career.id,
        name:         typeof randomNameForCountry === 'function'
                        ? randomNameForCountry(G.country?.name, gender)
                        : pick(gender === 'female' ? FNAMES : MNAMES),
        gender,
        age:          Math.max((G.age || 18) + 6, r(28, 58)),
        favor:        r(12, 38),
        attraction:   r(35, 85),
        lastFavorAge: -1,
      };
    } else {
      G.careerBoss.gender      = G.careerBoss.gender || gender;
      G.careerBoss.favor       = Number.isFinite(G.careerBoss.favor)       ? G.careerBoss.favor       : r(12, 38);
      G.careerBoss.attraction  = Number.isFinite(G.careerBoss.attraction)  ? G.careerBoss.attraction  : r(35, 85);
      G.careerBoss.lastFavorAge= Number.isFinite(G.careerBoss.lastFavorAge)? G.careerBoss.lastFavorAge: -1;
      if (!G.careerBoss.name)  G.careerBoss.name = typeof randomNameForCountry === 'function'
        ? randomNameForCountry(G.country?.name, G.careerBoss.gender)
        : pick(G.careerBoss.gender === 'female' ? FNAMES : MNAMES);
    }
    return G.careerBoss;
  },

  _clearBoss() {
    const G = window.G;
    if (G) G.careerBoss = null;
  },

  /* ── Scandal / fallout ── */
  _workScandal() {
    const G = window.G;
    G.jobPerf    = cl((G.jobPerf    || 50) - r(10, 24));
    G.happiness  = cl((G.happiness  || 50) - r(8,  16));
    G.stress     = cl((G.stress     || 0)  + r(14, 24));

    // Union members harder to fire
    const fireChance = G.unionMember ? 0.22 : 0.42;
    if (Math.random() < fireChance) {
      const t = G.career?.title || 'your job';
      G.career = null; G.yearsAtJob = 0; G.careerCompany = ''; G.jobPerf = 50; G.remoteWork = false;
      this._clearBoss();
      if (!G.achievements) G.achievements = {};
      G.achievements.fired = true;
      this._recordCareer('Fired after office scandal', t, 'bad', '🔥');
      Engine.log(`🔥 Office scandal exploded. You were fired from ${t}.`, 'bad');
      Engine.checkAch();
      return true;
    }
    Engine.log('🔥 Rumours spread around the office. Your reputation took a serious hit.', 'bad');
    this._recordCareer('Office scandal', `Performance damaged at ${G.careerCompany || 'work'}`, 'bad', '🔥');
    return false;
  },

  _relationshipFallout() {
    const G = window.G;
    const p = G.rels?.partner;
    if (!p) return;
    const caughtChance = (p.intimacy || 35) > 55 ? 0.72 : 0.55;
    if (Math.random() >= caughtChance) return;
    p.intimacy = Math.max(0, (p.intimacy || 35) - r(18, 32));
    G.happiness = cl((G.happiness || 50) - r(10, 20));
    G.karma     = cl((G.karma     || 0)  - r(8,  16), -100, 100);
    if (p.married && Math.random() < 0.5) {
      const split   = Math.min(netWorth(G) * 0.45, Math.max(0, (G.money || 0) * 0.55));
      if (split > 0) G.money = Math.max(0, (G.money || 0) - split);
      const alimony = Math.max(0, Math.floor((G.career?.salary || 0) * 0.12));
      G.alimony = { amount: alimony, yearsLeft: r(2, 5), recipient: p.name };
      Engine.log(`💔 Your spouse caught the affair. Divorce followed, costing ${fmt(split)}${alimony ? ` plus ${fmt(salaryScale(alimony))}/yr alimony` : ''}.`, 'bad');
      if (typeof Relations !== 'undefined' && Relations._registerEx) Relations._registerEx(p, { cause: 'cheating', causeLabel: 'Cheating fallout' });
      G.rels.partner = null;
      return;
    }
    if (Math.random() < 0.68) {
      Engine.log(`💔 ${p.name} found out about the affair and left you.`, 'bad');
      if (typeof Relations !== 'undefined' && Relations._registerEx) Relations._registerEx(p, { cause: 'cheating', causeLabel: 'Cheating fallout' });
      G.rels.partner = null;
      return;
    }
    Engine.log(`⚠️ ${p.name} found out about the affair. The relationship survived — barely.`, 'bad');
  },

  /* ── Pension ── */
  _pensionEstimate() {
    const G = window.G;
    if (!G?.career) return 0;
    const perfBonus  = Math.max(0, (G.jobPerf || 50) - 50) * 18;
    const unionBonus = G.unionMember ? (G.career.salary || 0) * 0.03 : 0;
    return Math.floor((G.career.salary || 0) * 0.28 + ((G.yearsAtJob || 0) * 280) + perfBonus + unionBonus);
  },

  /* ═══════════════════════════════════════════════════════════════
   * EDUCATION ACTIONS
   * ═══════════════════════════════════════════════════════════════ */
  enroll(id) {
    const G = window.G;
    this._ensure();
    if (!this._canUseAction('enroll')) return;
    const u = UNIVERSITIES.find(x => x.id === id);
    if (!u) return;
    if (G.inUniversity) { UI.toast('You are already in university.'); return; }
    const cost    = sc(u.cost);
    const canPay  = (G.money || 0) >= cost;
    const canLoan = (G.age   || 0) <= 22;
    if (!canPay && !canLoan) { UI.toast(`Need ${fmt(cost)}!`); return; }

    if (!canPay && canLoan) {
      // Student loan — taken automatically for young students
      G.studentLoan = (G.studentLoan || 0) + Math.floor(cost * 0.85); // 85% is loaned
      G.money       = Math.max(0, (G.money || 0) - Math.floor(cost * 0.15)); // 15% upfront
      Engine.log(`🏛️ Student loan taken for ${fmt(cost)}. ${fmt(Math.floor(cost * 0.85))} to repay at 8%/yr.`, 'neutral');
    } else {
      G.money = Math.max(0, (G.money || 0) - cost);
    }

    G.inUniversity = true;
    G.univYear     = 0;
    G.univType     = id;
    this._markAction('enroll');
    this._recordEducation(`Enrolled at ${u.name}`, `${u.duration || 4}-year programme`, '🏛️');
    Engine.log(`🏛️ Enrolled at ${u.name}! ${u.duration || 4}-year journey begins.`, 'special');
    G.smarts = cl((G.smarts || 0) + 5);
    UI.update(); this.render();
  },

  vocational() {
    const G = window.G;
    this._ensure();
    if (!this._canUseAction('vocational')) return;
    const cost = sc(6000);
    if ((G.money || 0) < cost && (G.age || 0) > 22) { UI.toast(`Need ${fmt(cost)}!`); return; }
    // Young students can take small loan
    if ((G.money || 0) < cost) {
      G.studentLoan = (G.studentLoan || 0) + Math.floor(cost * 0.7);
      G.money       = Math.max(0, (G.money || 0) - Math.floor(cost * 0.3));
    } else {
      G.money -= cost;
    }
    G.education = 'vocational';
    this._markAction('vocational');
    this._recordEducation('Vocational certificate', 'Skilled jobs unlocked', '🔧');
    Engine.log('🔧 Vocational training complete! Trade certificate earned.', 'good');
    G.smarts = cl((G.smarts || 0) + 7);
    UI.update(); this.render();
  },

  studyUni() {
    const G = window.G;
    this._ensure();
    if (!G.inUniversity) { UI.toast('You need to be in university.'); return; }
    if (!this._canUseAction('studyUni')) return;
    this._markAction('studyUni');
    G.smarts = cl((G.smarts || 0) + r(3, 7));
    G.stress  = cl((G.stress  || 0) + r(2, 5));
    Engine.log('📖 Extra study session. Brain working overtime.', 'good');
    UI.update(); this.render();
  },

  internship() {
    const G = window.G;
    this._ensure();
    if (!G.inUniversity) { UI.toast('You need to be in university.'); return; }
    if (!this._canUseAction('internship')) return;
    this._markAction('internship');
    const pay = sc(r(600, 2500));
    G.money   = (G.money  || 0) + pay;
    G.smarts  = cl((G.smarts  || 0) + r(2, 5));
    G.jobPerf = cl((G.jobPerf || 50) + r(2, 5));
    G.happiness= cl((G.happiness || 50) + r(3, 7));
    Engine.log(`💼 Internship landed! Gained real-world experience and earned ${fmt(pay)}.`, 'money');
    UI.update(); this.render();
  },

  cheatSchool() {
    const G = window.G;
    this._ensure();
    if (!G.inUniversity) { UI.toast('You need to be in university.'); return; }
    if (!this._canUseAction('cheatSchool')) return;
    this._markAction('cheatSchool');
    const caughtChance = 0.28 + ((G.smarts || 0) < 35 ? 0.14 : 0) - (G.trait === 'lucky' ? 0.08 : 0);
    if (Math.random() < caughtChance) {
      G.smarts    = cl((G.smarts    || 0) - r(3,  8));
      G.happiness = cl((G.happiness || 50) - r(8, 14));
      G.stress    = cl((G.stress    || 0) + r(12, 20));
      G.karma     = cl((G.karma     || 0) - r(4,  10), -100, 100);
      if (Math.random() < 0.35) {
        G.inUniversity = false; G.univYear = 0;
        this._recordEducation('Expelled from university', 'Caught cheating', '📝');
        Engine.log('📝 You got caught cheating and were expelled. Brutal.', 'bad');
      } else {
        Engine.log('📝 Caught cheating — academic warning, stress spike, reputation damaged.', 'bad');
      }
    } else {
      const cash = sc(r(300, 1800));
      G.money  = (G.money  || 0) + cash;
      G.smarts = cl((G.smarts || 0) + r(1, 3));
      G.stress = cl((G.stress || 0) + r(4, 9));
      G.karma  = cl((G.karma  || 0) - r(2, 6), -100, 100);
      Engine.log(`📝 You cheated smart and sold notes for ${fmt(cash)}. Risky money, questionable ethics.`, 'money');
    }
    UI.update(); this.render();
  },

  dropout() {
    const G = window.G;
    this._ensure();
    if (!G.inUniversity) { UI.toast('You are not in university.'); return; }
    if (!confirm('⚠️ Drop out of university?\n\nYou will lose your degree progress permanently. Student loan debt stays. This cannot be undone.')) return;
    G.inUniversity = false;
    G.univYear     = 0;
    G.happiness = cl((G.happiness || 50) - 10);
    G.stress    = cl((G.stress    || 0)  - 8);
    if (!G.achievements) G.achievements = {};
    G.achievements.dropout = true;
    this._recordEducation('Dropped out', 'University progress lost', '🚪');
    Engine.log('🚪 You dropped out of university. A controversial choice.', 'bad');
    Engine.checkAch(); UI.update(); this.render();
  },

  /* ═══════════════════════════════════════════════════════════════
   * JOB ACTIONS
   * ═══════════════════════════════════════════════════════════════ */
  apply(id) {
    const G = window.G;
    this._ensure();
    if ((G.age || 0) < 18) { UI.toast('Full-time careers unlock at age 18. Use School or Teen Gigs for now.'); return; }
    if (!this._canUseAction('apply')) return;
    /* Fix: was silently returning without feedback */
    if (G.career) { UI.toast('You already have a job. Quit first or use Job Hunt instead.'); return; }
    const job = CAREERS.find(j => j.id === id);
    if (!job) return;
    const fit = this._jobFit(job);
    this._markAction('apply');
    if (Math.random() < fit.chance) {
      G.career       = { ...job };
      G.yearsAtJob   = 0;
      G.careerCompany= pick(COMPANIES);
      G.jobPerf      = 52;
      G.careerBoss   = null;
      G.remoteWork   = false;
      this._ensureBoss();
      G.promotionCount = G.promotionCount || 0;
      this._recordCareer(`Hired as ${job.title}`, `${G.careerCompany} · ${fmtFull(salaryScale(job.salary))}/yr`, 'good', job.icon || '💼');
      Engine.log(`🎉 Hired as ${job.title} at ${G.careerCompany}! ${fmtFull(salaryScale(job.salary))}/yr`, 'special');
      G.happiness = cl((G.happiness || 50) + 14);
    } else {
      Engine.log(`😞 Applied for ${job.title} but didn't get the position. Keep improving.`, 'bad');
      G.happiness = cl((G.happiness || 50) - 6);
    }
    UI.update(); this.render();
  },

  workHard() {
    const G = window.G;
    this._ensure();
    if (!G.career) return;
    if (!this._canUseAction('workHard')) return;
    this._markAction('workHard');
    G.jobPerf = cl((G.jobPerf || 50) + r(5, 13));
    G.stress  = cl((G.stress  || 0) + r(4, 9));
    const mentorBonus  = (G.careerMentor?.guidance || 0) / 500;
    const raiseChance  = 0.25 + (G.jobPerf || 50) / 220 + ((G.careerBoss?.favor || 0) / 400) + mentorBonus;
    if (Math.random() < raiseChance) {
      const raise = Math.floor((G.career.salary || 0) * (0.035 + Math.random() * 0.05));
      G.career.salary += raise;
      Engine.log(`📈 Extra effort paid off — ${fmt(salaryScale(raise))} raise!`, 'special');
      G.happiness = cl((G.happiness || 50) + 9);
    } else {
      Engine.log('💪 You worked hard. Management noticed but no raise yet. Keep at it.', 'neutral');
    }
    UI.update(); this.render();
  },

  askRaise() {
    const G = window.G;
    this._ensure();
    if (!G.career) return;
    if (!this._canUseAction('askRaise')) return;
    if ((G.yearsAtJob || 0) < 1) { UI.toast('Need at least 1 year of experience first!'); return; }
    const boss         = this._ensureBoss();
    const mentorBonus  = (G.careerMentor?.guidance || 0) / 600;
    const unionBonus   = G.unionMember ? 0.08 : 0;
    const chance       = Math.min(0.90,
      ((G.jobPerf || 50) > 70 ? 0.56 : (G.jobPerf || 50) > 50 ? 0.36 : 0.18) +
      ((boss?.favor || 0) / 300) +
      ((G.skills?.negotiation || 0) * 0.035) +
      mentorBonus + unionBonus
    );
    this._markAction('askRaise');
    if (Math.random() < chance) {
      const pct   = r(8, 24);
      const raise = Math.floor((G.career.salary || 0) * (pct / 100));
      G.career.salary += raise;
      G.money = (G.money || 0) + salaryScale(raise);
      G.promotionCount = (G.promotionCount || 0) + 1;
      if (boss) boss.favor = cl((boss.favor || 0) + r(1, 5), 0, 100);
      this._recordCareer('Raise approved', `+${pct}% · ${fmtFull(salaryScale(G.career.salary))}/yr`, 'good', '📈');
      Engine.log(`🏆 Raise approved: +${pct}% — now ${fmtFull(salaryScale(G.career.salary))}/yr`, 'special');
      G.happiness = cl((G.happiness || 50) + 16);
      Engine.checkAch();
    } else {
      if (boss) boss.favor = cl((boss.favor || 0) - r(1, 4), 0, 100);
      Engine.log('📋 Raise denied. "Come back next review cycle." Their loss.', 'neutral');
      G.happiness = cl((G.happiness || 50) - 6);
    }
    UI.update(); this.render();
  },

  network() {
    const G = window.G;
    this._ensure();
    if (!this._canUseAction('network')) return;
    this._markAction('network');
    G.smarts    = cl((G.smarts    || 0) + r(2, 5));
    G.happiness = cl((G.happiness || 50) + r(3, 7));
    /* Fix: was always boosting jobPerf even without a career */
    if (G.career) {
      G.jobPerf = cl((G.jobPerf || 50) + r(2, 5));
      if (G.careerBoss) G.careerBoss.favor = cl((G.careerBoss.favor || 0) + r(1, 4), 0, 100);
      Engine.log('🤝 Networking event. Great contacts, new opportunities, boss is impressed.', 'good');
    } else {
      Engine.log('🤝 Networking event. You met industry contacts and expanded your knowledge.', 'good');
    }
    UI.update(); this.render();
  },

  takeCourse() {
    const G = window.G;
    this._ensure();
    if (!this._canUseAction('takeCourse')) return;
    const cost = sc(300);
    if ((G.money || 0) < cost) { UI.toast('Need ' + fmt(cost) + '!'); return; }
    G.money -= cost;
    this._markAction('takeCourse');
    G.smarts  = cl((G.smarts  || 0) + r(4, 9));
    if (G.career) G.jobPerf = cl((G.jobPerf || 50) + r(3, 7));
    Engine.log('📚 Professional course completed. Skills levelled up.', 'good');
    UI.update(); this.render();
  },

  getCertified() {
    const G = window.G;
    this._ensure();
    if (!this._canUseAction('getCertified')) return;
    const cost = sc(500);
    if ((G.money || 0) < cost) { UI.toast(`Need ${fmt(cost)} to get certified!`); return; }
    G.money -= cost;
    this._markAction('getCertified');
    G.smarts        = cl((G.smarts || 0) + r(3, 7));
    G.certifications= (G.certifications || 0) + 1;
    if (G.career) {
      G.career = { ...G.career, prestige: (G.career.prestige || 1) + 1 };
      G.jobPerf= cl((G.jobPerf || 50) + r(2, 5));
    }
    Engine.log(`📜 Professional certification earned! Total certs: ${G.certifications}.`, 'good');
    UI.update(); this.render();
  },

  /* Fix: renamed from suckyUp → suckUp to match action key 'suckUp' */
  suckUp() {
    const G = window.G;
    this._ensure();
    if (!G.career) return;
    if (!this._canUseAction('suckUp')) return;
    this._markAction('suckUp');
    const boss = this._ensureBoss();
    /* Success: 62% chance (Math.random() > 0.38) */
    if (Math.random() > 0.38) {
      G.jobPerf   = cl((G.jobPerf   || 50) + r(5,  12));
      G.happiness = cl((G.happiness || 50) - r(1,   3));
      if (boss) boss.favor = cl((boss.favor || 0) + r(5, 11), 0, 100);
      Engine.log('😊 Complimenting the boss worked out. Performance score up.', 'good');
    } else {
      if (boss) boss.favor = cl((boss.favor || 0) - r(4, 9), 0, 100);
      G.happiness = cl((G.happiness || 50) - r(3, 6));
      Engine.log('😊 Your sucking up was painfully obvious to everyone. Embarrassing.', 'bad');
    }
    UI.update(); this.render();
  },

  sleepWithBoss() {
    const G = window.G;
    this._ensure();
    if (!G.career) { UI.toast('You need a job first.'); return; }
    if ((G.age || 0) < 18) { UI.toast('Adults only (18+).'); return; }
    if (!this._canUseAction('bossAffair')) return;
    const boss = this._ensureBoss();
    /* Fix: was 'already .' — now complete message */
    if ((boss?.lastFavorAge || -1) === G.age) { UI.toast('That office shortcut is already on cooldown this year.'); return; }

    const choose = (typeof Relations !== 'undefined' && Relations._chooseProtection)
      ? Relations._chooseProtection.bind(Relations)
      : (cb => cb(true));

    choose(protectedSex => {
      if (!window.G?.career) return;
      this._markAction('bossAffair');
      const chemistry    = ((boss.attraction || 50) + (G.looks || 50) + (G.smarts || 50) + ((G.skills?.negotiation || 0) * 6) + ((G.skills?.beauty || 0) * 5)) / 4;
      const scandalChance= Math.max(0.12, 0.34 - ((boss.favor || 0) / 250) - (protectedSex ? 0.04 : 0) + (G.rels?.partner ? 0.08 : 0));
      const bonusBase    = (G.career.salary || 0) * (0.05 + Math.random() * 0.11);
      const bossPartner  = { id: `boss_${G.career.id}`, name: boss.name, gender: boss.gender, age: boss.age };

      if (typeof Relations !== 'undefined' && Relations._recordEncounter) {
        Relations._recordEncounter(bossPartner, {
          protectedSex, baseSti: 0.04, pregnancyBoost: 0.7, forcedKeep: null,
          logText: `🔥 You slept with your boss ${boss.name}.`, logType: 'bad'
        });
      }

      boss.lastFavorAge = G.age;

      if (chemistry >= 58) {
        const cash    = salaryScale(Math.round(bonusBase));
        const raisePct= r(4, 11);
        G.money     = (G.money     || 0) + cash;
        G.jobPerf   = cl((G.jobPerf   || 50) + r(8,  16));
        G.happiness = cl((G.happiness || 50) + r(4,  10));
        G.stress    = cl((G.stress    || 0)  + r(4,   9));
        boss.favor  = cl((boss.favor  || 0)  + r(12, 22), 0, 100);
        if (Math.random() < 0.52) {
          const raise = Math.floor((G.career.salary || 0) * (raisePct / 100));
          G.career.salary += raise;
          G.promotionCount = (G.promotionCount || 0) + 1;
          Engine.log(`🔥 The affair paid off. Your boss pushed through a ${raisePct}% raise and a ${fmt(cash)} bonus.`, 'special');
        } else {
          Engine.log(`🔥 Your boss rewarded the fling with a ${fmt(cash)} bonus and better treatment at work.`, 'special');
        }
      } else {
        G.jobPerf   = cl((G.jobPerf   || 50) - r(4, 10));
        G.happiness = cl((G.happiness || 50) - r(4,  9));
        G.stress    = cl((G.stress    || 0)  + r(8, 15));
        boss.favor  = cl((boss.favor  || 0)  - r(6, 12), 0, 100);
        Engine.log('🔥 Sleeping with your boss turned awkward and did not help your position at all.', 'bad');
      }

      this._recordCareer('Office affair', `Boss favor ${boss.favor}/100 · scandal risk taken`, 'risk', '🔥');

      if (Math.random() < scandalChance) {
        const fired = this._workScandal();
        if (fired) { UI.update(); this.render(); return; }
      }
      if (G.rels?.partner) this._relationshipFallout();
      UI.update(); this.render();
    }, { risky: true, title: 'Office Affair', text: `Sleep with your boss ${boss.name}? This may help your career, but it can wreck your job and relationship.` });
  },

  sabotage() {
    const G = window.G;
    this._ensure();
    if (!G.career) return;
    if (!this._canUseAction('sabotage')) return;
    this._markAction('sabotage');
    /* 55% success chance */
    if (Math.random() > 0.45) {
      G.jobPerf = cl((G.jobPerf || 50) + r(5, 10));
      G.karma   = cl((G.karma   || 0) - r(5, 10), -100, 100);
      Engine.log('😈 Sabotage worked. Your rival was passed over for the promotion.', 'bad');
    } else {
      G.jobPerf   = cl((G.jobPerf   || 50) - r(15, 30));
      G.happiness = cl((G.happiness || 50) - 10);
      if (Math.random() < 0.35 && !G.unionMember) {
        const t = G.career?.title || 'your job';
        G.career = null; G.yearsAtJob = 0; G.careerCompany = ''; G.jobPerf = 50; G.remoteWork = false;
        this._clearBoss();
        if (!G.achievements) G.achievements = {};
        G.achievements.fired = true;
        this._recordCareer('Fired for sabotage', t, 'bad', '😈');
        Engine.log('😈 Sabotage discovered. Fired on the spot.', 'bad');
        Engine.checkAch(); UI.update(); this.render(); return;
      } else if (G.unionMember) {
        Engine.log('😈 Sabotage backfired badly, but your union protected you from termination — barely.', 'bad');
      } else {
        Engine.log('😈 Sabotage backfired. Trust completely destroyed at the office.', 'bad');
      }
    }
    UI.update(); this.render();
  },

  blowOff() {
    const G = window.G;
    this._ensure();
    if (!G.career) return;
    if (!this._canUseAction('blowOff')) return;
    this._markAction('blowOff');
    G.happiness = cl((G.happiness || 50) + r(8,  14));
    G.jobPerf   = cl((G.jobPerf   || 50) - r(5,  12));
    G.stress    = cl((G.stress    || 0)  - r(5,  10));
    // Small boss disfavor if you skip too many times
    const boss = G.careerBoss;
    if (boss && Math.random() < 0.35) boss.favor = cl((boss.favor || 0) - r(1, 4), 0, 100);
    Engine.log('🏖️ Skipped work to enjoy the day. Worth it... probably.', 'neutral');
    UI.update(); this.render();
  },

  quit() {
    const G = window.G;
    this._ensure();
    if (!G.career) return;
    if (!confirm(`⚠️ Quit your job as ${G.career.title}?\n\nThis is permanent — you'll lose your income immediately.`)) return;
    const t = G.career.title;
    this._recordCareer('Resigned', t, 'neutral', '🚪');
    G.career = null; G.yearsAtJob = 0; G.careerCompany = ''; G.jobPerf = 50; G.remoteWork = false;
    this._clearBoss();
    G.happiness = cl((G.happiness || 50) - 7);
    G.stress    = cl((G.stress    || 0)  - 10);
    Engine.log(`🚪 Resigned from ${t}. A new chapter begins.`, 'neutral');
    UI.update(); this.render();
  },

  retire() {
    const G = window.G;
    this._ensure();
    if (!G.career) return;
    if ((G.age || 0) < 55) { UI.toast('Retirement unlocks at age 55.'); return; }
    if (!this._canUseAction('retire')) return;
    const pension        = this._pensionEstimate();
    G.retirementPension  = pension;
    G.retired            = true;
    const t              = G.career.title;
    this._markAction('retire');
    this._recordCareer('Retired', `${t} · Pension ${fmt(salaryScale(pension))}/yr`, 'special', '🏖️');
    G.career = null; G.yearsAtJob = 0; G.careerCompany = ''; G.remoteWork = false;
    this._clearBoss();
    G.happiness = cl((G.happiness || 50) + 22);
    G.stress    = cl((G.stress    || 0)  - 20);
    Engine.log(`🏖️ Retired from ${t}! Pension: ${fmt(salaryScale(pension))}/yr. Golden years begin!`, 'special');
    if (!G.achievements) G.achievements = {};
    G.achievements.retired = true;
    Engine.checkAch(); UI.update(); this.render();
  },

  /* ═══════════════════════════════════════════════════════════════
   * NEW ACTIONS
   * ═══════════════════════════════════════════════════════════════ */

  overtime() {
    const G = window.G;
    this._ensure();
    if (!G.career) { UI.toast('You need a job to work overtime.'); return; }
    if (!this._canUseAction('overtime')) return;
    this._markAction('overtime');
    const bonus = salaryScale(Math.floor((G.career.salary || 0) * (0.04 + Math.random() * 0.06)));
    G.money     = (G.money     || 0) + bonus;
    G.stress    = cl((G.stress    || 0) + r(6,  12));
    G.happiness = cl((G.happiness || 50) - r(3,   7));
    G.jobPerf   = cl((G.jobPerf   || 50) + r(3,   8));
    const boss  = G.careerBoss;
    if (boss && Math.random() < 0.45) boss.favor = cl((boss.favor || 0) + r(2, 6), 0, 100);
    Engine.log(`⏰ Overtime grind paid ${fmt(bonus)} extra. Stress is rising though.`, 'money');
    UI.update(); this.render();
  },

  seekMentor() {
    const G = window.G;
    this._ensure();
    if (!G.career) { UI.toast('You need a job to find a career mentor.'); return; }
    if (G.careerMentor) { UI.toast('You already have a mentor.'); return; }
    if ((G.promotionCount || 0) < 2) { UI.toast('Earn 2 promotions first to attract a senior mentor.'); return; }
    if (!this._canUseAction('seekMentor')) return;
    const cost = sc(r(200, 600));
    if ((G.money || 0) < cost) { UI.toast(`Need ${fmt(cost)} to hire a mentor.`); return; }
    G.money -= cost;
    this._markAction('seekMentor');
    const gender = Math.random() < 0.5 ? 'female' : 'male';
    const name   = typeof randomNameForCountry === 'function'
      ? randomNameForCountry(G.country?.name, gender)
      : pick(gender === 'female' ? FNAMES : MNAMES);
    const fields = ['Leadership', 'Strategy', 'Finance', 'Tech', 'Negotiation', 'Management'];
    G.careerMentor = {
      name,
      gender,
      field:    pick(fields),
      guidance: r(40, 70),
      hiredAge: G.age || 0,
    };
    Engine.log(`🎓 Found a mentor: ${name} specialising in ${G.careerMentor.field}. They'll guide your career growth.`, 'special');
    UI.update(); this.render();
  },

  mentorJunior() {
    const G = window.G;
    this._ensure();
    if (!G.career) { UI.toast('You need a job to mentor someone.'); return; }
    if ((G.promotionCount || 0) < 4) { UI.toast('You need 4+ promotions to be seen as a senior mentor.'); return; }
    if (!this._canUseAction('mentorJunior')) return;
    this._markAction('mentorJunior');
    G.happiness  = cl((G.happiness  || 50) + r(6, 12));
    G.career     = { ...G.career, prestige: (G.career.prestige || 1) + 1 };
    if (G.careerMentor) G.careerMentor.guidance = Math.min(100, (G.careerMentor.guidance || 0) + 5);
    Engine.log(`👨‍🏫 You mentored a junior colleague. Prestige up. Giving back feels good.`, 'good');
    UI.update(); this.render();
  },

  lookForJob() {
    const G = window.G;
    this._ensure();
    if (!this._canUseAction('lookForJob')) return;
    this._markAction('lookForJob');
    const hasJob    = !!G.career;
    const mentorBonus = (G.careerMentor?.guidance || 0) / 400;
    const baseChance  = hasJob ? (0.30 + (G.jobPerf || 50) / 250 + mentorBonus) : 0.55;

    if (Math.random() < baseChance) {
      // Found a better offer
      const salaryCap    = hasJob ? Math.floor((G.career.salary || 0) * (1.10 + Math.random() * 0.30)) : null;
      const offerOptions = CAREERS.filter(j => {
        if ((G.age || 0) < j.minAge) return false;
        if (j.req === 'university' && G.education !== 'university') return false;
        if (j.req === 'vocational' && G.education !== 'vocational' && G.education !== 'university') return false;
        if (hasJob && (j.salary || 0) <= (G.career.salary || 0)) return false;
        return true;
      });

      if (!offerOptions.length) {
        Engine.log('🔍 Job hunt: you are already at the top of your field. No better offers found.', 'neutral');
        return;
      }

      const offer = offerOptions[Math.floor(Math.random() * Math.min(3, offerOptions.length))];
      const offerSalary = salaryCap || offer.salary;

      if (hasJob) {
        // Competitive offer: can jump ship or use as leverage
        if (confirm(`💼 Offer received from a rival company!\n\n${offer.title} · ${fmtFull(salaryScale(offerSalary))}/yr\n\nAccept and switch jobs?`)) {
          const oldTitle = G.career.title;
          G.career       = { ...offer, salary: offerSalary };
          G.yearsAtJob   = 0;
          G.careerCompany= pick(COMPANIES);
          G.jobPerf      = 52;
          G.careerBoss   = null;
          G.remoteWork   = false;
          this._ensureBoss();
          this._recordCareer(`Jumped to ${offer.title}`, `Left ${oldTitle} · ${G.careerCompany}`, 'good', offer.icon || '💼');
          Engine.log(`💼 Career move! Now ${offer.title} at ${G.careerCompany} · ${fmtFull(salaryScale(offerSalary))}/yr`, 'special');
          G.happiness = cl((G.happiness || 50) + 12);
        } else {
          Engine.log('💼 Rival offer declined. Used it to feel better about your current role.', 'neutral');
        }
      } else {
        // Apply for the job directly
        G.career       = { ...offer, salary: offerSalary };
        G.yearsAtJob   = 0;
        G.careerCompany= pick(COMPANIES);
        G.jobPerf      = 52;
        G.careerBoss   = null;
        G.remoteWork   = false;
        this._ensureBoss();
        G.promotionCount = 0;
        this._recordCareer(`Hired as ${offer.title}`, `${G.careerCompany} · ${fmtFull(salaryScale(offerSalary))}/yr`, 'good', offer.icon || '💼');
        Engine.log(`🎉 Job hunt paid off! Hired as ${offer.title} at ${G.careerCompany}!`, 'special');
        G.happiness = cl((G.happiness || 50) + 14);
      }
    } else {
      Engine.log('🔍 Job hunt: no strong offers right now. Keep building your skills.', 'neutral');
      G.happiness = cl((G.happiness || 50) - 3);
    }
    UI.update(); this.render();
  },

  sideHustle() {
    const G = window.G;
    this._ensure();
    if (!this._canUseAction('sideHustle')) return;
    this._markAction('sideHustle');
    const hustle     = r(300, 2200);
    const earnings   = sc(hustle + (G.smarts || 0) * 8);
    G.money          = (G.money || 0) + earnings;
    G.stress         = cl((G.stress || 0) + r(3, 8));
    G.happiness      = cl((G.happiness || 50) + r(2, 6));
    const hustles    = [
      'Freelance consulting gig',
      'Online tutoring sessions',
      'Weekend photography work',
      'Ride-sharing side income',
      'Selling handmade goods online',
      'Content creation sponsorship',
      'Dog walking and pet sitting',
    ];
    Engine.log(`💻 ${pick(hustles)} earned you ${fmt(earnings)}. The hustle is real.`, 'money');
    UI.update(); this.render();
  },

  negotiateEquity() {
    const G = window.G;
    this._ensure();
    if (!G.career) { UI.toast('You need a job to negotiate equity.'); return; }
    if (!this._canUseAction('negotiateEquity')) return;
    const boss  = this._ensureBoss();
    const chance= Math.min(0.75, ((G.jobPerf || 50) / 160) + ((boss?.favor || 0) / 250) + ((G.promotionCount || 0) * 0.05));
    this._markAction('negotiateEquity');
    if (Math.random() < chance) {
      const equity = Math.floor((G.career.salary || 0) * (0.05 + Math.random() * 0.10));
      G.career     = { ...G.career, equity: (G.career.equity || 0) + equity };
      Engine.log(`📊 Equity negotiated! +${fmt(salaryScale(equity))} in stock options/year.`, 'special');
      G.happiness = cl((G.happiness || 50) + 8);
    } else {
      Engine.log('📊 Equity request declined. "Not in the budget right now."', 'neutral');
    }
    UI.update(); this.render();
  },

  requestRemote() {
    const G = window.G;
    this._ensure();
    if (!G.career) { UI.toast('You need a job to work remotely.'); return; }
    if (!this._canUseAction('requestRemote')) return;
    const boss = this._ensureBoss();
    if (!G.remoteWork) {
      const chance = Math.min(0.80, 0.40 + ((boss?.favor || 0) / 200) + ((G.jobPerf || 50) / 300));
      this._markAction('requestRemote');
      if (Math.random() < chance) {
        G.remoteWork = true;
        Engine.log('🏠 Remote work approved! Stress slightly reduced, but boss visibility drops.', 'good');
        G.happiness = cl((G.happiness || 50) + 7);
      } else {
        if (boss) boss.favor = cl((boss.favor || 0) - r(1, 3), 0, 100);
        Engine.log('🏠 Remote request denied. "We value in-person collaboration."', 'neutral');
      }
    } else {
      G.remoteWork = false;
      this._markAction('requestRemote');
      if (boss) boss.favor = cl((boss.favor || 0) + r(2, 5), 0, 100); // boss likes you back in the office
      Engine.log('🏢 Back to the office. Boss pleased to see you.', 'neutral');
    }
    UI.update(); this.render();
  },

  joinUnion() {
    const G = window.G;
    this._ensure();
    if (!G.career) { UI.toast('You need a job to join a union.'); return; }
    if (G.unionMember) { UI.toast('You are already a union member.'); return; }
    if (!this._canUseAction('joinUnion')) return;
    this._markAction('joinUnion');
    G.unionMember = true;
    const dues    = Math.floor((G.career.salary || 0) * 0.02);
    Engine.log(`✊ Joined the union! Protected from arbitrary firing. Annual dues: ${fmt(salaryScale(dues))}.`, 'good');
    // Boss may not love this
    const boss = G.careerBoss;
    if (boss) boss.favor = cl((boss.favor || 0) - r(3, 8), 0, 100);
    UI.update(); this.render();
  },

  getPromoted() {
    const G = window.G;
    this._ensure();
    if (!G.career) { UI.toast('You need a job to seek a promotion.'); return; }
    if ((G.jobPerf || 0) < 80) { UI.toast('Performance needs to be at least 80% to push for a promotion.'); return; }
    if (!this._canUseAction('getPromoted')) return;
    const boss        = this._ensureBoss();
    const mentorBonus = (G.careerMentor?.guidance || 0) / 500;
    const chance      = Math.min(0.72,
      ((G.jobPerf || 50) - 70) / 150 +
      ((boss?.favor || 0) / 220) +
      ((G.yearsAtJob || 0) * 0.03) +
      mentorBonus
    );
    this._markAction('getPromoted');
    if (Math.random() < chance) {
      const salaryBump = Math.floor((G.career.salary || 0) * (0.12 + Math.random() * 0.10));
      G.career.salary += salaryBump;
      G.career = {
        ...G.career,
        prestige: (G.career.prestige || 1) + 1,
        stressAdd: (G.career.stressAdd || 6) + 1,
        isTeamLead: (G.promotionCount || 0) >= 3 ? true : G.career.isTeamLead,
      };
      G.promotionCount = (G.promotionCount || 0) + 1;
      G.jobPerf        = cl((G.jobPerf || 50) - 10); // higher bar now
      G.happiness      = cl((G.happiness || 50) + 18);
      if (boss) boss.favor = cl((boss.favor || 0) + r(3, 8), 0, 100);
      const title = G.career.isTeamLead ? `${G.career.title} (Team Lead)` : G.career.title;
      this._recordCareer(`Promoted to ${title}`, `+${fmt(salaryScale(salaryBump))}/yr · Prestige ${G.career.prestige}`, 'special', '🏆');
      Engine.log(`🏆 Promoted! +${fmt(salaryScale(salaryBump))}/yr · Now ${title} · Prestige ${G.career.prestige}`, 'special');
      Engine.checkAch();
    } else {
      if (boss) boss.favor = cl((boss.favor || 0) - r(1, 3), 0, 100);
      Engine.log('🏆 Promotion not granted this cycle. Keep performing — you\'re close.', 'neutral');
      G.happiness = cl((G.happiness || 50) - 5);
    }
    UI.update(); this.render();
  },

  /* ═══════════════════════════════════════════════════════════════
   * TICKS (called by Engine on age-up)
   * ═══════════════════════════════════════════════════════════════ */
  educTick() {
    const G = window.G;
    if (!G) return;
    this._ensure();

    if ((G.age || 0) === 5)  { Engine.log('🏫 Started elementary school.', 'neutral'); G.inSchool = true; this._recordEducation('Started elementary school', '', '🏫'); }
    if ((G.age || 0) === 14) { Engine.log('📓 Started high school.', 'neutral'); this._recordEducation('Started high school', '', '📓'); }
    if (G.inSchool)          { G.smarts = cl((G.smarts || 0) + r(1, 3)); }

    if (G.inUniversity) {
      G.smarts   = cl((G.smarts || 0) + r(2, 5));
      G.univYear = (G.univYear || 0) + 1;
      G.stress   = cl((G.stress || 0) + r(2, 4));
      // Student loan annual interest
      if ((G.studentLoan || 0) > 0) {
        G.studentLoan = Math.floor((G.studentLoan || 0) * 1.04); // 4% annual interest while studying
      }
    }

    if ((G.age || 0) === 18 && G.inSchool) {
      G.inSchool  = false;
      G.education = 'high_school';
      this._recordEducation('Graduated high school', '', '🎓');
      Engine.log('🎓 Graduated from high school!', 'special');
      G.happiness = cl((G.happiness || 50) + 13);
    }

    if (G.inUniversity && (G.univYear || 0) >= this._univDuration()) {
      G.inUniversity = false;
      G.education    = 'university';
      const u        = UNIVERSITIES.find(x => x.id === G.univType) || UNIVERSITIES[1] || UNIVERSITIES[0];
      this._recordEducation(`Graduated from ${u.name}`, 'University degree earned', '🎓');
      Engine.log(`🎓 Graduated from ${u.name} with a degree! The world is yours.`, 'special');
      G.happiness = cl((G.happiness || 50) + 22);
      G.smarts    = cl((G.smarts    || 0) + (u.smartsBonus || 8));
      Engine.checkAch();
    }
  },

  incomeTick() {
    const G = window.G;
    if (!G) return;
    this._ensure();
    // Career pay, pensions, alimony, loan repayments and passive side income
    // are adult systems. This also prevents malformed legacy saves from
    // paying or charging a child during the yearly tick.
    if ((G.age || 0) < 18) return;

    /* ── Fix: Pension income — this used to be INSIDE the career block, so
       it was dead code because we returned early if !G.career above.
       Now it runs separately BEFORE the career check. ── */
    if (G.retired && (G.retirementPension || 0) > 0) {
      G.money = (G.money || 0) + salaryScale(G.retirementPension);
      // Annual pension cost-of-living adjustment (+1.5%)
      G.retirementPension = Math.floor((G.retirementPension || 0) * 1.015);
    }

    /* ── Fix: Alimony deduction — was never processed anywhere ── */
    if (G.alimony && (G.alimony.yearsLeft || 0) > 0) {
      const aliAmt = salaryScale(G.alimony.amount || 0);
      G.money      = Math.max(0, (G.money || 0) - aliAmt);
      G.alimony.yearsLeft -= 1;
      if (G.alimony.yearsLeft <= 0) {
        Engine.log(`💔 Alimony payments to ${G.alimony.recipient} are finally complete.`, 'neutral');
        G.alimony = null;
      }
    }

    /* ── Student loan repayment ── */
    if ((G.studentLoan || 0) > 0 && G.career) {
      const repayment  = Math.min(G.studentLoan, Math.ceil(G.studentLoan * 0.08));
      G.money          = Math.max(0, (G.money || 0) - salaryScale(repayment));
      G.studentLoan    = Math.max(0, (G.studentLoan || 0) - repayment);
      if (G.studentLoan <= 0) {
        G.studentLoan = 0;
        Engine.log('🎓 Student loan fully repaid! One less weight off your shoulders.', 'good');
      }
    }

    /* ── Side hustle passive (if they built one up) ── */
    if ((G.sideHustlePassive || 0) > 0) {
      G.money = (G.money || 0) + salaryScale(G.sideHustlePassive);
    }

    /* ── Career income ── */
    if (!G.career) return;

    const income = salaryScale(G.career.salary);
    G.money       = (G.money       || 0) + income;
    G.yearsAtJob  = (G.yearsAtJob  || 0) + 1;
    G.stress      = cl((G.stress   || 0) + (G.career.stressAdd || 6) - (G.remoteWork ? 1 : 0));

    /* ── Union dues deduction ── */
    if (G.unionMember) {
      const dues = Math.floor((G.career.salary || 0) * 0.02);
      G.money    = Math.max(0, (G.money || 0) - salaryScale(dues));
    }

    /* ── Equity payout ── */
    if ((G.career.equity || 0) > 0) {
      G.money = (G.money || 0) + salaryScale(G.career.equity);
    }

    /* ── Annual salary drift (+3% every 2 yrs, performance gated) ── */
    if ((G.yearsAtJob % 2 === 0) && (G.jobPerf || 50) >= 40) {
      G.career = { ...G.career, salary: Math.floor((G.career.salary || 0) * 1.035) };
    }

    /* ── Mentor passive guidance boost ── */
    if (G.careerMentor) {
      const mentorAge = G.careerMentor.hiredAge || 0;
      const tenureBonus = Math.min(20, (G.age || 0) - mentorAge);
      G.careerMentor.guidance = Math.min(100, (G.careerMentor.guidance || 0) + (tenureBonus > 5 ? 1 : 0));
      G.jobPerf = cl((G.jobPerf || 50) + Math.floor((G.careerMentor.guidance || 0) / 60));
    }

    /* ── Random career events ── */
    this._rollCareerEvent();

    /* ── Performance drift ── */
    G.jobPerf = cl((G.jobPerf || 50) + r(-3, 4));

    /* ── Burnout health damage ── */
    if (this._burnoutRisk() > 72 && Math.random() < 0.18) {
      G.health  = cl((G.health  || 50) - r(2, 6));
      G.jobPerf = cl((G.jobPerf || 50) - r(2, 6));
      Engine.log('🧯 Burnout caught up with you. Health and performance took a hit.', 'bad');
    }

    /* ── Firing for terrible performance ── */
    if ((G.jobPerf || 50) < 8 && Math.random() < (G.unionMember ? 0.12 : 0.32)) {
      const t = G.career.title;
      G.career = null; G.yearsAtJob = 0; G.careerCompany = ''; G.jobPerf = 50; G.remoteWork = false;
      this._clearBoss();
      if (!G.achievements) G.achievements = {};
      G.achievements.fired = true;
      this._recordCareer('Fired for poor performance', t, 'bad', '🚪');
      Engine.log(`🚪 Fired from ${t} due to poor performance!`, 'bad');
      G.happiness = cl((G.happiness || 50) - 14);
      Engine.checkAch();
    }
  },

  /* ═══════════════════════════════════════════════════════════════
   * CAREER EVENTS — expanded from 4 to 15+ distinct events
   * ═══════════════════════════════════════════════════════════════ */
  _rollCareerEvent() {
    const G = window.G;
    if (!G?.career) return;

    const perf    = G.jobPerf    || 50;
    const boss    = G.careerBoss?.favor || 40;
    const stress  = G.stress     || 0;
    const years   = G.yearsAtJob || 0;
    const remote  = G.remoteWork ? true : false;
    const union   = G.unionMember ? true : false;
    const mentor  = G.careerMentor ? true : false;

    const pool = [];

    /* ── Positive events ── */
    pool.push({ id: 'review_pos', weight: perf > 65 ? 0.12 : 0.05, run: () => {
      const msgs = [
        'Positive performance review this quarter.',
        'Navigated a tough project with success.',
        'Mentored a junior team member.',
        'Got recognition from senior management.',
        'Delivered an outstanding client presentation.',
        'Named employee of the month.',
      ];
      G.jobPerf   = cl((G.jobPerf   || 50) + r(2, 6));
      G.happiness = cl((G.happiness || 50) + r(2, 5));
      Engine.log(`💼 ${pick(msgs)}`, 'neutral');
    }});

    pool.push({ id: 'boss_help', weight: boss > 60 ? 0.08 : 0.025, run: () => {
      G.jobPerf   = cl((G.jobPerf   || 50) + r(2, 6));
      G.happiness = cl((G.happiness || 50) + r(2, 5));
      Engine.log('🧭 Your boss quietly backed you on a difficult work issue.', 'good');
    }});

    pool.push({ id: 'opportunity', weight: perf > 72 ? 0.08 : 0.03, run: () => {
      const bonus = salaryScale(Math.floor((G.career.salary || 0) * r(2, 7) / 100));
      G.money     = (G.money   || 0) + bonus;
      G.jobPerf   = cl((G.jobPerf || 50) + r(2, 5));
      Engine.log(`🌟 A visible work opportunity paid a ${fmt(bonus)} bonus.`, 'money');
    }});

    pool.push({ id: 'team_win', weight: boss > 50 && perf > 55 ? 0.07 : 0.02, run: () => {
      const bonus = salaryScale(Math.floor((G.career.salary || 0) * r(1, 4) / 100));
      G.money     = (G.money     || 0) + bonus;
      G.happiness = cl((G.happiness || 50) + r(3, 8));
      G.jobPerf   = cl((G.jobPerf   || 50) + r(1, 4));
      Engine.log(`🏅 Your team won a company award. Team bonus of ${fmt(bonus)} awarded.`, 'good');
    }});

    pool.push({ id: 'conference', weight: 0.05, run: () => {
      G.smarts     = cl((G.smarts    || 0) + r(2, 4));
      G.happiness  = cl((G.happiness || 50) + r(2, 6));
      if (mentor) G.careerMentor.guidance = Math.min(100, G.careerMentor.guidance + 3);
      Engine.log('🎤 You attended an industry conference. Inspiration and networking paid off.', 'good');
    }});

    pool.push({ id: 'innovation', weight: perf > 70 ? 0.06 : 0.02, run: () => {
      const bonus = salaryScale(Math.floor((G.career.salary || 0) * r(3, 8) / 100));
      G.money      = (G.money     || 0) + bonus;
      G.career     = { ...G.career, prestige: (G.career.prestige || 1) + 1 };
      Engine.log(`💡 Your innovative idea was adopted company-wide. ${fmt(bonus)} recognition bonus + Prestige up.`, 'special');
    }});

    pool.push({ id: 'remote_perk', weight: remote ? 0.08 : 0, run: () => {
      G.happiness = cl((G.happiness || 50) + r(4, 8));
      G.stress    = cl((G.stress    || 0) - r(3, 7));
      Engine.log('🏠 Another productive work-from-home year. Work-life balance is paying off.', 'good');
    }});

    pool.push({ id: 'union_win', weight: union ? 0.06 : 0, run: () => {
      const bump = Math.floor((G.career.salary || 0) * 0.02);
      G.career   = { ...G.career, salary: (G.career.salary || 0) + bump };
      Engine.log(`✊ The union negotiated a 2% across-the-board raise. +${fmt(salaryScale(bump))}/yr.`, 'good');
    }});

    /* ── Negative events ── */
    pool.push({ id: 'deadline', weight: stress > 65 ? 0.10 : 0.04, run: () => {
      G.stress    = cl((G.stress    || 0) + r(5, 10));
      /* Fix: was r(-3,4) which could accidentally be positive — now always negative */
      G.jobPerf   = cl((G.jobPerf   || 50) - r(1, 5));
      G.happiness = cl((G.happiness || 50) - r(2, 5));
      Engine.log('⏱️ A brutal deadline made work feel heavier this year.', 'bad');
    }});

    pool.push({ id: 'conflict', weight: boss < 40 ? 0.09 : 0.03, run: () => {
      const bossFight = G.careerBoss;
      if (bossFight) bossFight.favor = cl((bossFight.favor || 0) - r(5, 12), 0, 100);
      G.jobPerf   = cl((G.jobPerf   || 50) - r(3,  8));
      G.happiness = cl((G.happiness || 50) - r(3,  7));
      Engine.log('😤 A serious conflict with management hurt morale and your standing.', 'bad');
    }});

    pool.push({ id: 'illness', weight: stress > 70 ? 0.07 : 0.02, run: () => {
      G.health    = cl((G.health    || 50) - r(3,  8));
      G.jobPerf   = cl((G.jobPerf   || 50) - r(4, 10));
      G.happiness = cl((G.happiness || 50) - r(3,  7));
      Engine.log('🤒 Work-related illness struck this year. Health and performance dipped.', 'bad');
    }});

    pool.push({ id: 'restructure', weight: years > 3 ? 0.06 : 0.02, run: () => {
      G.stress    = cl((G.stress    || 0)  + r(8, 15));
      G.happiness = cl((G.happiness || 50) - r(5, 10));
      G.jobPerf   = cl((G.jobPerf   || 50) - r(2,  6));
      if (G.careerBoss) G.careerBoss.favor = cl((G.careerBoss.favor || 0) - r(3, 8), 0, 100);
      Engine.log('🏗️ Company restructure announced. Morale is low and your role feels uncertain.', 'bad');
    }});

    pool.push({ id: 'layoff_risk', weight: perf < 35 && !union ? 0.08 : 0.01, run: () => {
      if (Math.random() < 0.30) {
        const t = G.career?.title || 'your job';
        G.career = null; G.yearsAtJob = 0; G.careerCompany = ''; G.jobPerf = 50; G.remoteWork = false;
        this._clearBoss();
        if (!G.achievements) G.achievements = {};
        G.achievements.fired = true;
        this._recordCareer('Laid off in restructure', t, 'bad', '📋');
        Engine.log(`📋 Company downsized. You were in the layoff round for ${t}.`, 'bad');
        G.happiness = cl((G.happiness || 50) - 18);
        Engine.checkAch();
      } else {
        G.stress    = cl((G.stress    || 0)  + r(10, 18));
        G.happiness = cl((G.happiness || 50) - r(8,  14));
        Engine.log('📋 Layoff rumours swept the office. You survived — this round.', 'bad');
      }
    }});

    pool.push({ id: 'toxic_culture', weight: boss < 30 ? 0.07 : 0.02, run: () => {
      G.stress    = cl((G.stress    || 0)  + r(6, 12));
      G.happiness = cl((G.happiness || 50) - r(5, 10));
      G.health    = cl((G.health    || 50) - r(1,  4));
      Engine.log('☠️ Toxic workplace culture is grinding you down. Mental health matters.', 'bad');
    }});

    pool.push({ id: 'merger', weight: years > 5 ? 0.04 : 0.01, run: () => {
      const newCo = pick(COMPANIES);
      const old   = G.careerCompany;
      G.careerCompany = newCo;
      G.careerBoss    = null;
      this._ensureBoss();
      G.stress    = cl((G.stress    || 0)  + r(5, 10));
      G.happiness = cl((G.happiness || 50) - r(3,  8));
      Engine.log(`🏢 ${old} merged with ${newCo}. New company, new boss — uncertain times.`, 'neutral');
    }});

    /* ── Filter recent events and roll ── */
    const fresh = pool.filter(e => !this._recentEvent(e.id, 3));
    let roll    = Math.random();
    let sum     = 0;
    for (const evt of fresh) {
      sum += evt.weight;
      if (roll < sum) {
        this._rememberEvent(evt.id);
        evt.run();
        return;
      }
    }
  },
};