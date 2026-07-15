/* js/family.js — LifeSim module 
   Covers: fertility struggles, miscarriage, twins, adoption process,
   child development stages, kids getting careers, parent aging & care,
   legacy inheritance.
*/
'use strict';

const Family = {
  VERSION:1,

  CHILD_STAGES: [
    { id:'newborn',  label:'Newborn',   ages:[0,1],   icon:'👶', desc:'Sleepless nights and endless wonder.' },
    { id:'toddler',  label:'Toddler',   ages:[2,4],   icon:'🧒', desc:'Learning to walk and talk. Exhausting and magical.' },
    { id:'child',    label:'Child',     ages:[5,12],  icon:'🧑', desc:'School years, friendships, first adventures.' },
    { id:'teen',     label:'Teenager',  ages:[13,17], icon:'👦', desc:'Rebellious, curious, finding their identity.' },
    { id:'young',    label:'Young Adult',ages:[18,25],icon:'🧑‍🎓', desc:'University, first job, first love.' },
    { id:'adult',    label:'Adult',     ages:[26,99], icon:'👨', desc:'Building their own life and legacy.' },
  ],

  TEEN_TRAITS: ['ambitious','creative','rebellious','athletic','studious','social','artistic','tech-savvy','musical','entrepreneurial'],
  CAREER_PATHS: ['Doctor','Engineer','Artist','Musician','Entrepreneur','Teacher','Athlete','Lawyer','Scientist','Writer','Chef','Developer'],

  FERTILITY_EVENTS: [
    { id:'success',       chance:0.5,  icon:'🍼', text:'The fertility treatment worked! A pregnancy is underway.', outcome:'pregnant' },
    { id:'partial',       chance:0.25, icon:'💊', text:'Partial response to treatment. Try again next year for better odds.', outcome:'retry' },
    { id:'fail',          chance:0.15, icon:'😔', text:'The treatment didn\'t work this cycle. It\'s hard, but hope remains.', outcome:'fail' },
    { id:'twins_boost',   chance:0.10, icon:'👶👶', text:'The fertility treatment dramatically increased your chances — and you\'re expecting TWINS!', outcome:'twins' },
  ],

  MISCARRIAGE_EVENTS: [
    { text:'You suffered a miscarriage. This is one of the hardest things a family can go through. You are not alone.', icon:'🤍' },
    { text:'The pregnancy ended in a miscarriage. Give yourselves time to grieve and heal.', icon:'🕯️' },
    { text:'You lost the pregnancy. The grief is profound. Lean on each other.', icon:'💔' },
  ],

  PARENT_CARE_EVENTS: [
    { id:'fall',     ageMin:70, icon:'🏥', text:'{name} had a fall and needs medical attention. The cost: {cost}.', cost:3500, healthLoss:8, stress:6 },
    { id:'dementia', ageMin:78, icon:'🧠', text:'{name} is showing signs of memory loss and needs more support.', cost:0, healthLoss:5, stress:10, recurring:true },
    { id:'surgery',  ageMin:72, icon:'⚕️', text:'{name} needs surgery. Do you help cover the costs?', cost:8000, healthLoss:0, stress:8 },
    { id:'moves_in', ageMin:80, icon:'🏠', text:'{name} can no longer live alone. You take them in.', cost:1200, healthLoss:0, stress:12, recurring:true },
    { id:'palliative',ageMin:85,icon:'🕯️', text:'{name} is in palliative care. Treasure the time you have.', cost:2500, healthLoss:0, stress:15, recurring:false },
  ],

  INHERITANCE_ITEMS: [
    { id:'cash',       icon:'💰', label:'Cash Inheritance',       value: g => Math.round((g.money||0) * r(20,55) / 100) },
    { id:'property',   icon:'🏠', label:'Family Property',        value: g => wealthScale(r(80000,350000), g) },
    { id:'business',   icon:'🏢', label:'Family Business Share',  value: g => (g.business ? Math.round((g.business.value||0) * 0.3) : 0) },
    { id:'wisdom',     icon:'📜', label:'Family Wisdom',          value: () => 0, bonus: { smarts:5, karma:5 } },
    { id:'debts',      icon:'💳', label:'Family Debts',           value: g => -Math.round(debtTotal(g) * r(20,40) / 100) },
  ],

  _esc(v) { return typeof escHTML === 'function' ? escHTML(v) : String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); },

  _ensure(G = window.G) {
    if (!G) return;
    if (!G.family) G.family = { fertilityTreatments: 0, miscarriages: 0, adoptionPending: false, adoptionAge: -1, twinPreg: false, parentCareEvents: [], inheritanceReceived: [], familyActionYear: -1, familyActionUses: {} };
    if (!Number.isFinite(G.family.fertilityTreatments)) G.family.fertilityTreatments = 0;
    if (!Number.isFinite(G.family.miscarriages)) G.family.miscarriages = 0;
    if (!Array.isArray(G.family.parentCareEvents)) G.family.parentCareEvents = [];
    if (!Array.isArray(G.family.inheritanceReceived)) G.family.inheritanceReceived = [];
    if (!G.family.familyActionUses) G.family.familyActionUses = {};
    if (!Number.isFinite(G.family.familyActionYear)) G.family.familyActionYear = -1;
    if (G.family.familyActionYear !== (G.age || 0)) { G.family.familyActionYear = G.age || 0; G.family.familyActionUses = {}; }
  },

  _canAct(key, limit = 1) {
    const G = window.G; if (!G) return false;
    this._ensure(G);
    const used = G.family.familyActionUses[key] || 0;
    if (used >= limit) { UI.toast('You\'ve already done that this year — Age Up to continue.', 'bad'); return false; }
    return true;
  },
  _markAct(key) { const G = window.G; if (!G) return; this._ensure(G); G.family.familyActionUses[key] = (G.family.familyActionUses[key] || 0) + 1; },

  _childStage(age) {
    return this.CHILD_STAGES.find(s => age >= s.ages[0] && age <= s.ages[1]) || this.CHILD_STAGES[this.CHILD_STAGES.length - 1];
  },

  _activePregnancies(G = window.G) {
    if (!G) return [];
    if (typeof Relations !== 'undefined' && Relations._activePregnancies) return Relations._activePregnancies(G);
    if (!Array.isArray(G.pregnancies)) G.pregnancies = [];
    if (G.pregnancy && typeof G.pregnancy === 'object' && !G.pregnancies.includes(G.pregnancy)) G.pregnancies.push(G.pregnancy);
    G.pregnancy = G.pregnancies[0] || null;
    return G.pregnancies;
  },

  _canStartFamilyPregnancy(partner, G = window.G) {
    if (!G) return false;
    if (typeof Relations !== 'undefined' && Relations._pregnancyBlockReason) {
      const fallback = { id:null, name:'donor', gender:G.gender === 'female' ? 'male' : 'female', age:G.age || 30 };
      const reason = Relations._pregnancyBlockReason(partner || fallback, G);
      if (reason) { UI.toast(reason, 'neutral'); return false; }
    } else if (G.pregnancy) {
      UI.toast('A pregnancy is already active.', 'neutral'); return false;
    }
    return true;
  },

  _addPregnancyRecord(record, G = window.G) {
    if (typeof Relations !== 'undefined' && Relations._addPregnancyRecord) return Relations._addPregnancyRecord(record, G);
    if (!Array.isArray(G.pregnancies)) G.pregnancies = [];
    G.pregnancies.push(record);
    G.pregnancy = G.pregnancies[0] || null;
    return record;
  },

  // ─────────────────── FERTILITY ───────────────────
  seekFertilityTreatment() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._canAct('fertility')) return;
    const playerGender = typeof Relations !== 'undefined' && Relations._genderKey ? Relations._genderKey(G.gender) : String(G.gender || '').toLowerCase();
    const maxFertilityAge = playerGender === 'male' ? 75 : 55;
    if ((G.age || 0) < 18 || (G.age || 0) > maxFertilityAge) { UI.toast(`Fertility treatment is available ages 18–${maxFertilityAge}.`, 'bad'); return; }
    const partner = G.rels?.partner || { id:null, name:'donor', gender:G.gender === 'female' ? 'male' : 'female', age:G.age || 30 };
    if (!this._canStartFamilyPregnancy(partner, G)) return;
    const cost = sc(7500, G);
    if ((G.money || 0) < cost) { UI.toast(`Fertility treatment costs ${fmt(cost)}.`, 'bad'); return; }
    G.money -= cost;
    G.family.fertilityTreatments = (G.family.fertilityTreatments || 0) + 1;
    this._markAct('fertility');

    const roll = Math.random();
    let outcome = 'fail';
    if (roll < 0.10) { outcome = 'twins'; }
    else if (roll < 0.60) { outcome = 'pregnant'; }
    else if (roll < 0.80) { outcome = 'retry'; }

    if (outcome === 'pregnant' || outcome === 'twins') {
      const isTwins = outcome === 'twins';
      this._addPregnancyRecord({ partnerId: partner?.id || null, partnerName: partner?.name || 'donor', partnerGender: partner?.gender || null, dueAge: (G.age || 0) + 1, keep: true, assisted: true, twins: isTwins, source:'fertility' }, G);
      G.family.twinPreg = !!G.pregnancy?.twins;
      const msg = isTwins ? '👶👶 TWINS are on the way! Fertility treatment was a huge success!' : '🍼 Fertility treatment worked! A pregnancy is underway.';
      Engine.log(msg, 'special');
      UI.toast(msg, 'good');
    } else if (outcome === 'retry') {
      Engine.log('💊 Partial fertility response. Try again next year.', 'neutral');
      UI.toast('💊 Treatment partially worked. Try again next year.', 'neutral');
    } else {
      Engine.log('😔 Fertility treatment did not work this cycle.', 'bad');
      UI.toast('😔 Treatment didn\'t work this cycle. You can try again.', 'bad');
    }
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  // ─────────────────── ADOPTION ───────────────────
  startAdoptionProcess() {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._canAct('adopt_start')) return;
    if ((G.age || 0) < 21) { UI.toast('You must be 21+ to adopt.', 'bad'); return; }
    if (G.family.adoptionPending) { UI.toast('Your adoption application is already pending.', 'neutral'); return; }
    const cost = sc(4000, G);
    if ((G.money || 0) < cost) { UI.toast(`Adoption application costs ${fmt(cost)}.`, 'bad'); return; }
    G.money -= cost;
    this._markAct('adopt_start');
    G.family.adoptionPending = true;
    G.family.adoptionAge = (G.age || 0) + r(1, 2);
    Engine.log('📋 Adoption application filed. The process takes 1–2 years.', 'special');
    UI.toast('📋 Adoption process started! Check back next year.', 'good');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  _resolveAdoption(G) {
    if (!G.family.adoptionPending) return;
    if ((G.age || 0) < (G.family.adoptionAge || 0)) return;
    G.family.adoptionPending = false;

    // Pick a child age — can adopt baby, toddler, child or teen
    const adoptAgeOptions = [0, 0, 1, 2, 3, 5, 7, 10, 13];
    const adoptedAge = pick(adoptAgeOptions);
    if (!G.rels) G.rels = {};
    if (!Array.isArray(G.rels.children)) G.rels.children = [];

    const child = { id: uid('child'), role: 'child', adopted: true, age: adoptedAge, love: r(55, 78), school: 65, wellbeing: 70, issue: '', issueSeverity: 0, independent: false };
    const isFem = Math.random() > 0.5;
    child.name = typeof randomNameForCountry === 'function' ? randomNameForCountry(G?.country?.name, isFem ? 'female' : 'male') : pick(isFem ? (window.FNAMES || ['Alex']) : (window.MNAMES || ['Sam']));
    child.surname = G.surname || '';
    child.gender = isFem ? 'female' : 'male';
    G.rels.children.push(child);
    G.happiness = cl((G.happiness || 50) + 14);
    G.stress = cl((G.stress || 0) + 8, 0, 100);
    Engine.log(`💛 You adopted ${child.name} (age ${adoptedAge}). Welcome to the family!`, 'special');
    UI.toast(`💛 ${child.name} is now part of your family!`, 'good');
  },

  // ─────────────────── CHILD DEVELOPMENT ───────────────────
  investInChild(childId, type) {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._canAct('child_invest', 3)) return;
    const child = (G.rels?.children || []).find(c => c.id === childId);
    if (!child || !child.alive) return;
    let didAction = false;

    if (type === 'tutor') {
      const cost = sc(800, G);
      if ((G.money || 0) < cost) { UI.toast(`Tutoring costs ${fmt(cost)}.`, 'bad'); return; }
      G.money -= cost;
      child.school = cl((child.school || 65) + r(4, 9));
      child.love = cl((child.love || 65) + 2);
      Engine.log(`📚 Hired a tutor for ${child.name}. School: ${child.school}`, 'career');
      UI.toast(`📚 ${child.name}'s school performance improved!`, 'good');
      didAction = true;
    } else if (type === 'sport') {
      const cost = sc(600, G);
      if ((G.money || 0) < cost) { UI.toast(`Sports club costs ${fmt(cost)}.`, 'bad'); return; }
      G.money -= cost;
      child.wellbeing = cl((child.wellbeing || 70) + r(4, 8));
      child.love = cl((child.love || 65) + 3);
      Engine.log(`⚽ Enrolled ${child.name} in sports.`, 'health');
      UI.toast(`⚽ ${child.name} is loving their new sport!`, 'good');
      didAction = true;
    } else if (type === 'therapy') {
      const cost = sc(1200, G);
      if ((G.money || 0) < cost) { UI.toast(`Child therapy costs ${fmt(cost)}.`, 'bad'); return; }
      G.money -= cost;
      child.wellbeing = cl((child.wellbeing || 70) + r(8, 15));
      if (child.issue) { child.issueSeverity = Math.max(0, (child.issueSeverity || 0) - 2); }
      Engine.log(`🧠 Got therapy for ${child.name}.`, 'health');
      UI.toast(`🧠 ${child.name} is feeling more supported.`, 'good');
      didAction = true;
    } else if (type === 'quality_time') {
      child.love = cl((child.love || 65) + r(4, 8));
      child.wellbeing = cl((child.wellbeing || 70) + r(2, 5));
      Engine.log(`❤️ Spent quality time with ${child.name}.`, 'family');
      UI.toast(`❤️ ${child.name} loved spending time with you.`, 'good');
      didAction = true;
    }

    if (!didAction) return;
    this._markAct('child_invest');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  // ─────────────────── PARENT CARE ───────────────────
  helpParent(parentRole, actionType) {
    const G = window.G; if (!G || !G.alive) return;
    this._ensure(G);
    if (!this._canAct('parent_care', 2)) return;
    const parent = G.rels?.[parentRole];
    if (!parent || parent.alive === false) { UI.toast('No living parent found.', 'neutral'); return; }
    let didAction = false;

    if (actionType === 'visit') {
      parent.love = cl((parent.love || 60) + r(5, 10));
      G.happiness = cl((G.happiness || 50) + 4);
      G.karma = cl((G.karma || 0) + 2, -100, 100);
      Engine.log(`👴 Visited ${parent.name}. They were so happy to see you.`, 'family');
      UI.toast(`👴 Great visit with ${parent.name}!`, 'good');
      didAction = true;
    } else if (actionType === 'financial') {
      const amt = sc(r(1500, 5000), G);
      if ((G.money || 0) < amt) { UI.toast(`You can\'t afford to help financially right now.`, 'bad'); return; }
      G.money -= amt;
      parent.love = cl((parent.love || 60) + 8);
      G.karma = cl((G.karma || 0) + 5, -100, 100);
      Engine.log(`💸 Helped ${parent.name} financially with ${fmt(amt)}.`, 'money');
      UI.toast(`💸 You supported ${parent.name} financially.`, 'good');
      didAction = true;
    } else if (actionType === 'medical') {
      const cost = sc(r(2000, 6000), G);
      if ((G.money || 0) < cost) { UI.toast(`Medical care costs ${fmt(cost)}.`, 'bad'); return; }
      G.money -= cost;
      parent.love = cl((parent.love || 60) + 12);
      G.karma = cl((G.karma || 0) + 7, -100, 100);
      Engine.log(`🏥 Arranged medical care for ${parent.name}.`, 'health');
      UI.toast(`🏥 ${parent.name} is getting proper medical care.`, 'good');
      didAction = true;
    } else if (actionType === 'move_in') {
      parent.livesWithYou = true;
      G.stress = cl((G.stress || 0) + 8, 0, 100);
      parent.love = cl((parent.love || 60) + 15);
      G.karma = cl((G.karma || 0) + 10, -100, 100);
      Engine.log(`🏠 ${parent.name} moved in with you. It\'s a big adjustment.`, 'family');
      UI.toast(`🏠 ${parent.name} is living with you now.`, 'neutral');
      didAction = true;
    }

    if (!didAction) return;
    this._markAct('parent_care');
    if (typeof Save !== 'undefined') Save.autosave(G);
    UI.refreshActiveTab();
  },

  // ─────────────────── INHERITANCE ───────────────────
  _resolveParentDeath(G, parent) {
    if (!parent || !G) return;
    this._ensure(G);

    const relationship = parent.love || 50;
    const items = [];

    // Cash always passes
    const cashAmt = Math.round((parent.savedMoney || 0) + wealthScale(r(5000, 80000), G));
    if (cashAmt > 0) items.push({ type: 'cash', label: 'Cash', amount: cashAmt });

    // Property chance
    if (Math.random() < 0.35) {
      const propVal = wealthScale(r(40000, 250000), G);
      items.push({ type: 'property', label: 'Family Property', amount: propVal });
    }

    // Wisdom always
    if (relationship >= 60) {
      items.push({ type: 'wisdom', label: 'Life Wisdom', bonus: { smarts: r(2, 5), karma: r(1, 3) } });
    }

    // Debt sometimes
    if (Math.random() < 0.2) {
      const debt = wealthScale(r(5000, 40000), G);
      items.push({ type: 'debt', label: 'Inherited Debt', amount: -debt });
    }

    let totalMoney = 0;
    items.forEach(item => {
      if (item.type === 'cash' || item.type === 'property' || item.type === 'debt') {
        totalMoney += item.amount;
        if (item.type === 'property' || item.type === 'cash') {
          if (!G.assets) G.assets = {};
          if (!G.assets.properties) G.assets.properties = [];
          if (item.type === 'property') {
            G.assets.properties.push({ id: uid('prop'), name: 'Inherited Family Home', value: item.amount, type: 'house', inherited: true });
          }
        }
      }
      if (item.bonus) {
        Object.entries(item.bonus).forEach(([k, v]) => {
          if (k === 'smarts') G.smarts = cl((G.smarts || 50) + v);
          if (k === 'karma') G.karma = cl((G.karma || 0) + v, -100, 100);
        });
      }
    });

    if (totalMoney > 0) G.money = Math.max(0, (G.money || 0) + totalMoney);
    G.family.inheritanceReceived = G.family.inheritanceReceived || [];
    G.family.inheritanceReceived.push({ from: parent.name, age: G.age, items });

    const itemLabels = items.map(i => i.label).join(', ');
    if (totalMoney > 0) {
      Engine.log(`🏛️ Inheritance from ${parent.name}: ${itemLabels} (+${fmt(totalMoney)})`, 'money');
    } else {
      Engine.log(`📜 Inheritance from ${parent.name}: ${itemLabels}`, 'family');
    }
  },

  // ─────────────────── ANNUAL TICK ───────────────────
  tick(G = window.G) {
    if (!G || !G.alive) return;
    this._ensure(G);

    // Resolve pending adoption
    this._resolveAdoption(G);

    // Age up all children — give them careers/lives when grown
    const children = G.rels?.children || [];
    children.forEach(child => {
      if (!child || child.alive === false) return;
      child.age = (child.age || 0) + 1;

      // Teen milestone
      if (child.age === 13 && !child.trait) {
        child.trait = pick(this.TEEN_TRAITS);
        Engine.log(`🧒 ${child.name} is now a teenager — a ${child.trait} one.`, 'family');
      }

      // Going to university
      if (child.age === 18 && (child.school || 65) >= 60) {
        child.inUni = true;
        G.money = Math.max(0, (G.money || 0) - sc(r(4000, 12000), G));
        Engine.log(`🎓 ${child.name} started university. Proud moment (and tuition bill).`, 'family');
      }

      // Getting a career when adult
      if (child.age === 22 && !child.adultCareer) {
        child.inUni = false;
        child.adultCareer = pick(this.CAREER_PATHS);
        child.independent = true;
        Engine.log(`💼 ${child.name} (22) became a ${child.adultCareer}. They\'re building their own life.`, 'family');
      }

      // Random child issues (teens more prone)
      if (!child.independent && child.age >= 5 && Math.random() < 0.05) {
        const issues = ['struggling at school', 'bullying issues', 'mood swings', 'social difficulties', 'test anxiety'];
        child.issue = pick(issues);
        child.issueSeverity = r(1, 3);
      }

      // Natural issue resolution
      if (child.issue && child.issueSeverity <= 0) child.issue = '';
    });

    // Age parents — fire care events
    ['father', 'mother'].forEach(role => {
      const parent = G.rels?.[role];
      if (!parent || parent.alive === false) return;
      parent.age = (parent.age || 60) + 1;

      // Care events for elderly parents
      const age = parent.age;
      if (age >= 70 && Math.random() < 0.12) {
        const ev = this.PARENT_CARE_EVENTS.find(e => age >= e.ageMin && (!e.recurring || !G.family.parentCareEvents.includes(e.id + parent.id)));
        if (ev) {
          const costAmt = sc(ev.cost, G);
          const text = ev.text.replace('{name}', parent.name).replace('{cost}', fmt(costAmt));
          Engine.log(`${ev.icon} ${text}`, 'bad');
          G.stress = cl((G.stress || 0) + ev.stress, 0, 100);
          if (ev.recurring) G.family.parentCareEvents.push(ev.id + parent.id);
        }
      }

      // Parent natural death risk
      let deathChance = 0;
      if (age >= 95) deathChance = 0.60;
      else if (age >= 88) deathChance = 0.30;
      else if (age >= 80) deathChance = 0.12;
      else if (age >= 72) deathChance = 0.05;

      if (deathChance > 0 && Math.random() < deathChance) {
        parent.alive = false;
        parent.causeOfDeath = age >= 88 ? 'old age' : pick(['heart failure', 'illness', 'natural causes']);
        G.happiness = cl((G.happiness || 50) - r(12, 20));
        G.stress = cl((G.stress || 0) + r(8, 14), 0, 100);
        Engine.log(`🕯️ Your ${role} ${parent.name} passed away at ${age}. You carry them with you.`, 'bad');
        this._resolveParentDeath(G, parent);
      }
    });

    // Miscarriage chance for active pregnancies that are not due yet.
    // Relations resolves births before Family.tick, so this only handles pregnancy loss.
    const activePregnancies = this._activePregnancies(G);
    activePregnancies.slice().forEach(preg => {
      if (!preg || (G.age || 0) >= (preg.dueAge || 0)) return;
      if (Math.random() < 0.06) {
        G.family.miscarriages = (G.family.miscarriages || 0) + 1;
        G.happiness = cl((G.happiness || 50) - 18);
        G.stress = cl((G.stress || 0) + 15, 0, 100);
        G.mentalHealth = cl((G.mentalHealth || 60) - 12);
        if (G.rels?.partner && (!preg.partnerId || G.rels.partner.id === preg.partnerId)) {
          G.rels.partner.love = cl((G.rels.partner.love || 60) - 5);
        }
        const ev = pick(this.MISCARRIAGE_EVENTS);
        Engine.log(`${ev.icon} ${ev.text} (${preg.partnerName || 'unknown parent'})`, 'bad');
        if (typeof Relations !== 'undefined' && Relations._removePregnancyRecord) Relations._removePregnancyRecord(preg.id, G);
        else {
          G.pregnancies = (G.pregnancies || []).filter(p => p.id !== preg.id);
          G.pregnancy = G.pregnancies[0] || null;
        }
      }
    });
  },

  _createBaby(G, adopted = false) {
    const isFem = Math.random() > 0.5;
    const name = typeof randomNameForCountry === 'function' ? randomNameForCountry(G?.country?.name, isFem ? 'female' : 'male') : (isFem ? 'Emma' : 'Liam');
    return { id: uid('child'), role: 'child', name, gender: isFem ? 'female' : 'male', surname: G.surname || '', age: 0, love: r(60, 82), school: 70, wellbeing: 75, issue: '', issueSeverity: 0, independent: false, adopted };
  },

  // ─────────────────── RENDER ───────────────────
  render() {
    const G = window.G; if (!G) return;
    this._ensure(G);
    const el = document.getElementById('tab-family'); if (!el) return;
    const children = G.rels?.children || [];
    const father = G.rels?.father;
    const mother = G.rels?.mother;
    let h = '';

    // Family at a glance
    const livingKids = children.filter(c => c.alive !== false);
    const dependents = livingKids.filter(c => (c.age || 0) < 18);
    const adults = livingKids.filter(c => (c.age || 0) >= 18);
    const fatherAlive = father && father.alive !== false;
    const motherAlive = mother && mother.alive !== false;

    h += `<div style="background:linear-gradient(135deg,rgba(236,72,153,.10),rgba(244,114,182,.06));border:1px solid rgba(236,72,153,.25);border-radius:12px;padding:14px;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:28px">👨‍👩‍👧‍👦</span>
        <div>
          <div style="font-size:15px;font-weight:700">Your Family</div>
          <div style="font-size:12px;color:var(--muted)">${livingKids.length} child${livingKids.length !== 1 ? 'ren' : ''} · ${dependents.length} dependent · ${adults.length} grown up</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;font-size:11px;text-align:center">
        <div style="background:var(--b1);border-radius:6px;padding:5px"><div style="font-weight:700;color:var(--pink)">${livingKids.length}</div><div style="color:var(--muted)">Children</div></div>
        <div style="background:var(--b1);border-radius:6px;padding:5px"><div style="font-weight:700;color:var(--teal)">${G.family.miscarriages || 0}</div><div style="color:var(--muted)">Losses</div></div>
        <div style="background:var(--b1);border-radius:6px;padding:5px"><div style="font-weight:700;color:var(--green)">${(G.family.inheritanceReceived || []).length}</div><div style="color:var(--muted)">Inherited</div></div>
        <div style="background:var(--b1);border-radius:6px;padding:5px"><div style="font-weight:700;color:var(--yellow)">${G.family.fertilityTreatments || 0}</div><div style="color:var(--muted)">Treatments</div></div>
      </div>
    </div>`;

    // Pregnancy status
    const pregnancies = this._activePregnancies(G);
    if (pregnancies.length) {
      h += `<div style="background:rgba(236,72,153,.08);border:1px solid rgba(236,72,153,.3);border-radius:10px;padding:12px;margin-bottom:14px">
        <div style="font-weight:700;color:var(--pink)">🍼 ${pregnancies.length === 1 ? `Expecting ${pregnancies[0].twins ? 'TWINS 👶👶' : 'a Baby 👶'}` : `${pregnancies.length} Active Pregnancies`}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">${pregnancies.map(p => `${this._esc(p.partnerName || 'partner')} · due age ${p.dueAge}${p.twins ? ' · twins' : ''}`).join('<br>')}</div>
      </div>`;
    }

    // Adoption pending
    if (G.family.adoptionPending) {
      h += `<div style="background:rgba(234,179,8,.08);border:1px solid rgba(234,179,8,.3);border-radius:10px;padding:12px;margin-bottom:14px">
        <div style="font-weight:700;color:var(--yellow)">📋 Adoption In Progress</div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px">Expected to complete around age ${G.family.adoptionAge}.</div>
      </div>`;
    }

    // Children list
    if (livingKids.length > 0) {
      h += `<div class="sec">👧 Your Children</div>`;
      livingKids.forEach(c => {
        const stage = this._childStage(c.age || 0);
        const loveColor = (c.love || 65) >= 70 ? 'var(--green)' : (c.love || 65) >= 45 ? 'var(--yellow)' : 'var(--red)';
        h += `<div class="rel-card" style="margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:24px">${stage.icon}</span>
            <div style="flex:1">
              <div style="font-weight:700">${this._esc(c.name)} <span style="font-size:11px;color:var(--muted)">(${c.age})</span>${c.adopted ? ' <span style="font-size:10px;color:var(--teal)">Adopted</span>' : ''}</div>
              <div style="font-size:12px;color:var(--muted)">${stage.label}${c.trait ? ` · ${c.trait}` : ''}${c.adultCareer ? ` · ${c.adultCareer}` : ''}${c.independent ? ' · Independent 🏠' : ''}</div>
            </div>
            <div style="text-align:right;font-size:12px"><span style="color:${loveColor}">❤️ ${c.love}</span></div>
          </div>`;

        if (c.issue) {
          h += `<div style="font-size:12px;color:var(--orange);margin-bottom:6px">⚠️ ${this._esc(c.issue)}</div>`;
        }

        if (!c.independent) {
          // School/wellbeing bars
          const wellColor = (c.wellbeing || 70) >= 70 ? 'var(--green)' : (c.wellbeing || 70) >= 45 ? 'var(--yellow)' : 'var(--red)';
          const schoolColor = (c.school || 65) >= 70 ? 'var(--teal)' : (c.school || 65) >= 45 ? 'var(--yellow)' : 'var(--orange)';
          h += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px;margin-bottom:8px">
            <div><div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="color:var(--muted)">📚 School</span><span style="color:${schoolColor}">${c.school}</span></div><div style="height:4px;background:var(--b1);border-radius:999px"><div style="height:100%;background:${schoolColor};width:${c.school}%;border-radius:999px"></div></div></div>
            <div><div style="display:flex;justify-content:space-between;margin-bottom:2px"><span style="color:var(--muted)">😊 Wellbeing</span><span style="color:${wellColor}">${c.wellbeing}</span></div><div style="height:4px;background:var(--b1);border-radius:999px"><div style="height:100%;background:${wellColor};width:${c.wellbeing}%;border-radius:999px"></div></div></div>
          </div>`;
          h += `<div class="act-grid" style="gap:5px">
            <div class="act-card" style="padding:6px" onclick="Family.investInChild('${c.id}','quality_time')"><div class="ac-ico" style="font-size:16px">❤️</div><div class="ac-lbl" style="font-size:11px">Bond</div></div>
            <div class="act-card" style="padding:6px" onclick="Family.investInChild('${c.id}','tutor')"><div class="ac-ico" style="font-size:16px">📚</div><div class="ac-lbl" style="font-size:11px">Tutor</div></div>
            <div class="act-card" style="padding:6px" onclick="Family.investInChild('${c.id}','sport')"><div class="ac-ico" style="font-size:16px">⚽</div><div class="ac-lbl" style="font-size:11px">Sports</div></div>
            <div class="act-card" style="padding:6px" onclick="Family.investInChild('${c.id}','therapy')"><div class="ac-ico" style="font-size:16px">🧠</div><div class="ac-lbl" style="font-size:11px">Therapy</div></div>
          </div>`;
        } else {
          h += `<div style="font-size:12px;color:var(--muted);font-style:italic">Living their own life as a ${c.adultCareer || 'professional'}.</div>`;
        }
        h += `</div>`;
      });
    }

    // Family planning actions
    const hasBlockingFamilyPregnancy = pregnancies.length && (G.gender === 'female' || (G.rels?.partner && pregnancies.some(p => p.partnerId && p.partnerId === G.rels.partner.id)));
    if (!hasBlockingFamilyPregnancy && !G.family.adoptionPending) {
      h += `<div class="sec">🍼 Family Planning</div><div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">`;
      const canFertility = (G.age || 0) >= 18 && (G.age || 0) <= 55;
      h += `<div class="row-card${canFertility ? '' : ' locked'}" onclick="${canFertility ? 'Family.seekFertilityTreatment()' : ''}">
        <span class="ri">🧬</span>
        <div class="rd"><div class="rt">Fertility Treatment</div><div class="rs">${fmt(sc(7500, G))} · Boosts pregnancy chance · Twin possibility</div></div>
      </div>`;
      const canAdopt = (G.age || 0) >= 21;
      h += `<div class="row-card${canAdopt ? '' : ' locked'}" onclick="${canAdopt ? 'Family.startAdoptionProcess()' : ''}">
        <span class="ri">💛</span>
        <div class="rd"><div class="rt">Start Adoption Process</div><div class="rs">${fmt(sc(4000, G))} · Takes 1–2 years · Any age child</div></div>
      </div>`;
      h += `</div>`;
    }

    // Parent care section
    if (fatherAlive || motherAlive) {
      h += `<div class="sec">👴 Parent Care</div>`;
      [['father', father], ['mother', mother]].forEach(([role, parent]) => {
        if (!parent || parent.alive === false) return;
        const age = parent.age || 0;
        const loveColor = (parent.love || 60) >= 70 ? 'var(--green)' : (parent.love || 60) >= 45 ? 'var(--yellow)' : 'var(--red)';
        h += `<div class="rel-card" style="margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:22px">${role === 'father' ? '👴' : '👵'}</span>
            <div style="flex:1">
              <div style="font-weight:700">${this._esc(parent.name)} <span style="font-size:11px;color:var(--muted)">(${age})</span></div>
              <div style="font-size:12px;color:${age >= 80 ? 'var(--orange)' : 'var(--muted)'}">Your ${role} · ${age >= 80 ? '⚠️ Elderly care needed' : age >= 70 ? 'Senior years' : 'Active'}</div>
            </div>
            <span style="color:${loveColor};font-size:13px">❤️ ${parent.love}</span>
          </div>
          <div class="act-grid" style="gap:5px">
            <div class="act-card" style="padding:6px" onclick="Family.helpParent('${role}','visit')"><div class="ac-ico" style="font-size:16px">🤗</div><div class="ac-lbl" style="font-size:11px">Visit</div></div>
            <div class="act-card" style="padding:6px" onclick="Family.helpParent('${role}','financial')"><div class="ac-ico" style="font-size:16px">💸</div><div class="ac-lbl" style="font-size:11px">Support</div></div>
            <div class="act-card" style="padding:6px" onclick="Family.helpParent('${role}','medical')"><div class="ac-ico" style="font-size:16px">🏥</div><div class="ac-lbl" style="font-size:11px">Medical</div></div>
            ${age >= 75 ? `<div class="act-card" style="padding:6px" onclick="Family.helpParent('${role}','move_in')"><div class="ac-ico" style="font-size:16px">🏠</div><div class="ac-lbl" style="font-size:11px">Move In</div></div>` : ''}
          </div>
        </div>`;
      });
    }

    // Inheritance history
    if ((G.family.inheritanceReceived || []).length > 0) {
      h += `<div class="sec">🏛️ Legacy Received</div>`;
      G.family.inheritanceReceived.forEach(inh => {
        const items = (inh.items || []).map(i => i.label).join(', ');
        h += `<div style="font-size:12px;color:var(--muted);padding:6px 0;border-bottom:1px solid var(--b1)">From ${this._esc(inh.from)} (age ${inh.age}): ${this._esc(items)}</div>`;
      });
    }

    if (livingKids.length === 0 && !fatherAlive && !motherAlive && pregnancies.length === 0 && !G.family.adoptionPending) {
      h += `<div class="empty"><span class="ei">👨‍👩‍👧</span><p>No family yet.<br>Start a pregnancy or adoption to build yours.</p></div>`;
    }

    el.innerHTML = h;
  },
};