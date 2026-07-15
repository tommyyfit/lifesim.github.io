/* story_events.js — LifeSim
   Local narrative story events that fire automatically every 3–6 years.
   No AI required. Events are contextual (age, stats, career, family, wealth). */

const StoryEvents = {
  VERSION:1,
  MIN_GAP: 3,      // min years between story events
  BASE_CHANCE: 0.6, // base chance per year (when gap is met)

  // ── Core pool organised by life stage ─────────────────────────────────
  EVENTS: {

    teen: [
      {
        id:'teen_identity', icon:'🪞',
        title:'Who Am I?',
        text(G){ return `${G.name} spends a restless night staring at the ceiling, wondering what kind of person they're becoming. The choices ahead feel both exciting and terrifying.`; },
        choices:[
          {t:'💪 Decide to work harder',     e:{smarts:4,  happiness:3,  stress:3}},
          {t:'🎭 Explore different things',  e:{happiness:8,looks:2,     smarts:2}},
          {t:'😴 Not worry about it yet',    e:{stress:-5,  happiness:2}},
        ]
      },
      {
        id:'teen_crush', icon:'💌',
        title:'First Crush',
        text(G){ return `Someone in ${G.name}'s life catches their eye. The butterflies, the awkwardness, the daydreams — it's all new and overwhelming.`; },
        choices:[
          {t:'📝 Write a note',              e:{happiness:12, looks:2,  stress:4}},
          {t:'👫 Just hang out more',         e:{happiness:8,  karma:3}},
          {t:'🙈 Keep it secret',             e:{happiness:4,  stress:2}},
        ]
      },
      {
        id:'teen_fight', icon:'🤜',
        title:'School Conflict',
        text(G){ return `A conflict breaks out between ${G.name} and another student. Tensions have been building for weeks and finally exploded.`; },
        choices:[
          {t:'🕊️ Talk it out',               e:{karma:8,  smarts:3,  happiness:3}},
          {t:'💪 Stand your ground',         e:{happiness:6,health:-2,karma:-3}},
          {t:'🚶 Walk away',                 e:{stress:-4, karma:4,  happiness:2}},
        ]
      },
      {
        id:'teen_passion', icon:'🔥',
        title:'A Spark of Passion',
        text(G){ return `${G.name} discovers something they truly love — it might be art, sport, code, music or something else entirely. For the first time, hours pass like minutes.`; },
        choices:[
          {t:'📚 Pour into it',               e:{smarts:6, happiness:12, stress:4}},
          {t:'👥 Share it with friends',      e:{happiness:9, fame:3, karma:4}},
          {t:'⚖️ Keep it as a side thing',    e:{happiness:6, stress:-2}},
        ]
      },
      {
        id:'teen_parttime', icon:'💼',
        title:'First Job Offer',
        text(G){ return `A neighbour offers ${G.name} a part-time job — nothing glamorous, but real money and real responsibility for the first time.`; },
        choices:[
          {t:'✅ Take the job',                e:{money:800,  smarts:3, stress:6, happiness:5}},
          {t:'📖 Focus on school instead',    e:{smarts:6,   stress:3, happiness:3}},
          {t:'🏖️ Enjoy being young',          e:{happiness:9, stress:-4}},
        ]
      },
    ],

    young_adult: [
      {
        id:'ya_direction', icon:'🗺️',
        title:'Which Way Now?',
        text(G){ return `At ${G.age}, ${G.name} feels the pressure of life's big fork in the road. Friends are choosing paths — some safe, some bold, some strange.`; },
        choices:[
          {t:'🎓 Double down on education',   e:{smarts:10, money:-2000, stress:6, happiness:4}},
          {t:'💼 Chase money fast',           e:{money:5000, stress:10, happiness:3}},
          {t:'✈️ Take a gap year',             e:{happiness:14, smarts:3, money:-1500}},
        ]
      },
      {
        id:'ya_friendship', icon:'🍻',
        title:'The Friend Group Splits',
        text(G){ return `${G.name}'s close friend group is starting to drift apart — different cities, jobs and priorities pulling everyone in different directions.`; },
        choices:[
          {t:'📞 Make the effort to stay close', e:{happiness:9, karma:8, stress:4}},
          {t:'🤷 Accept it naturally',           e:{stress:-3,  happiness:4}},
          {t:'🆕 Build a new social circle',     e:{fame:5, happiness:7, stress:6}},
        ]
      },
      {
        id:'ya_heartbreak', icon:'💔',
        title:'Heartbreak',
        text(G){ return `A relationship ends and ${G.name} is left picking up the pieces. It hurts more than they expected, but also teaches things no textbook could.`; },
        choices:[
          {t:'🎭 Throw yourself into work/art', e:{smarts:5,  happiness:-3, stress:8, money:2000}},
          {t:'🧘 Take time to heal',            e:{health:5,  happiness:5,  stress:-6}},
          {t:'🍻 Go out and forget',            e:{happiness:4,health:-4,   stress:-3}},
        ]
      },
      {
        id:'ya_money_stress', icon:'💸',
        title:'Financial Wake-Up Call',
        text(G){ return `The bills are real, the rent is real, and the credit card feels very real. ${G.name} gets a harsh first lesson in adult finances.`; },
        choices:[
          {t:'📊 Make a proper budget',         e:{smarts:6,  money:1500,  stress:-4}},
          {t:'💪 Pick up extra work',           e:{money:2500, stress:10}},
          {t:'😬 Ignore and hope for the best', e:{stress:12,  money:-800}},
        ]
      },
      {
        id:'ya_mentor', icon:'🧑‍🏫',
        title:'A Mentor Appears',
        text(G){ return `Someone older and wiser takes a genuine interest in ${G.name}'s potential. Their advice, if followed, could reshape everything.`; },
        choices:[
          {t:'🤝 Listen closely, meet often',   e:{smarts:10, happiness:6, career_boost:1}},
          {t:'📝 Take notes and apply it',      e:{smarts:7,  money:3000}},
          {t:'😐 Be polite but sceptical',      e:{smarts:2}},
        ]
      },
      {
        id:'ya_risk', icon:'🎲',
        title:'A Big Gamble',
        text(G){ return `An opportunity lands in ${G.name}'s lap that could pay off enormously — or blow up spectacularly. Everyone says the risk is too high.`; },
        choices:[
          {t:'🚀 Go all in',                   e:{money:8000, happiness:8, stress:15, luck:1}},
          {t:'⚖️ Take a calculated half-step',  e:{money:3000, stress:5,  happiness:4}},
          {t:'🛡️ Play it safe this time',       e:{stress:-4, happiness:2, smarts:3}},
        ]
      },
    ],

    midlife: [
      {
        id:'mid_purpose', icon:'🔭',
        title:'Searching for More',
        text(G){ return `Somewhere between meetings, meals, and routines, ${G.name} starts asking: "Is this it?" The feeling isn't quite a crisis — more like a compass spinning.`; },
        choices:[
          {t:'🎯 Pivot toward something meaningful', e:{happiness:12, stress:8,  money:-3000}},
          {t:'📖 Read, reflect, go slow',            e:{smarts:7,  happiness:7,  stress:-5}},
          {t:'💼 Stay the course, build wealth',     e:{money:6000, stress:4,  happiness:-3}},
        ]
      },
      {
        id:'mid_health_wake', icon:'🩺',
        title:'Body Sends a Warning',
        text(G){ return `A routine check-up gives ${G.name} a small but clear warning. Nothing critical yet — but the body is asking for more care.`; },
        choices:[
          {t:'🥗 Overhaul diet and exercise',        e:{health:14, fitness:8, happiness:4,  money:-500}},
          {t:'💊 Follow doctor\'s advice closely',   e:{health:10, stress:-4}},
          {t:'😬 Nod and change nothing',            e:{health:-6, stress:3}},
        ]
      },
      {
        id:'mid_parent_age', icon:'👴',
        title:'Parents Are Getting Older',
        text(G){ return `${G.name} notices for the first time that their parents look old. It's a quiet, heavy realisation that changes the shape of every conversation.`; },
        choices:[
          {t:'🏡 Spend more time with them',         e:{happiness:10, karma:12, stress:4, money:-1000}},
          {t:'💌 Call and write more often',         e:{happiness:7,  karma:8}},
          {t:'📱 Stay in occasional touch',          e:{karma:3,  stress:-2}},
        ]
      },
      {
        id:'mid_old_friend', icon:'📸',
        title:'Reunion',
        text(G){ return `An old friend reaches out after years of silence. Catching up over coffee becomes one of the most honest conversations ${G.name} has had in years.`; },
        choices:[
          {t:'☕ Meet regularly going forward',      e:{happiness:13, karma:6,  stress:-4}},
          {t:'📞 Keep it to a call or two',          e:{happiness:7,  karma:4}},
          {t:'📤 Reply politely but stay distant',   e:{happiness:3}},
        ]
      },
      {
        id:'mid_money_plateau', icon:'📊',
        title:'The Wealth Ceiling',
        text(G){ return `${G.name} has hit a plateau. Income is steady but growth has stalled, and the gap between where they are and where they imagined being feels bigger every year.`; },
        choices:[
          {t:'📚 Learn something new and pivot',     e:{smarts:8,  money:5000, stress:8}},
          {t:'🤝 Seek a business partner',           e:{money:8000, happiness:5, stress:6}},
          {t:'🧘 Redefine what "enough" means',      e:{happiness:12, stress:-8}},
        ]
      },
      {
        id:'mid_regret', icon:'🌅',
        title:'The Road Not Taken',
        text(G){ return `Lying awake, ${G.name} replays a choice they made years ago and wonders what the other path would have looked like. They can still feel the weight of it.`; },
        choices:[
          {t:'🔧 Start making a late change',        e:{happiness:8,  smarts:5, stress:10, money:-2000}},
          {t:'✍️ Write it out, let it go',           e:{happiness:9,  stress:-7, karma:5}},
          {t:'🗿 Accept it and find peace',           e:{happiness:6,  stress:-5}},
        ]
      },
    ],

    elder: [
      {
        id:'el_legacy', icon:'🌳',
        title:'What Will Remain',
        text(G){ return `${G.name} thinks about what they will leave behind — not in a morbid way, but with a quiet urgency to make the remaining years mean something.`; },
        choices:[
          {t:'📝 Write your story down',             e:{happiness:12, karma:8,  smarts:4}},
          {t:'🤲 Give time and money to others',     e:{karma:14,  happiness:10, money:-3000}},
          {t:'👨‍👩‍👧 Invest in the next generation',   e:{happiness:13, karma:10}},
        ]
      },
      {
        id:'el_peace', icon:'☁️',
        title:'A Quiet Afternoon',
        text(G){ return `For a few rare hours, everything is still. ${G.name} sits in a patch of sunlight, watching the world pass, and feels — for the first time in a long time — simply content.`; },
        choices:[
          {t:'🧘 Savour it fully',                   e:{happiness:14, stress:-10, health:4}},
          {t:'📖 Write about it',                    e:{happiness:10, smarts:3,   karma:4}},
          {t:'📞 Call someone you love',             e:{happiness:12, karma:6}},
        ]
      },
      {
        id:'el_wisdom', icon:'🦉',
        title:'The Younger Ones Ask',
        text(G){ return `A younger relative or colleague asks ${G.name} for life advice. After a pause, the words come more clearly than expected.`; },
        choices:[
          {t:'🗣️ Share everything you\'ve learned',  e:{happiness:12, karma:10, fame:4}},
          {t:'📖 Tell one story that matters',       e:{happiness:9,  karma:7}},
          {t:'🙂 Keep it short and honest',          e:{happiness:7,  karma:5}},
        ]
      },
      {
        id:'el_loss', icon:'🕯️',
        title:'A Goodbye',
        text(G){ return `Someone from ${G.name}'s past — a peer, an old friend, someone who shaped them — passes away. The world feels a little smaller.`; },
        choices:[
          {t:'🤝 Attend, say goodbye properly',      e:{happiness:-4, karma:12, stress:5, health:3}},
          {t:'✍️ Write them a private tribute',      e:{happiness:2,  karma:8,  stress:-3}},
          {t:'🚶 Need some time alone',              e:{stress:4,  happiness:-3}},
        ]
      },
      {
        id:'el_last_chapter', icon:'🌙',
        title:'Last Chapter',
        text(G){ return `${G.name} senses a shift — something in the quality of light, or in how quickly time moves now. This is the last chapter, and there's still so much to feel.`; },
        choices:[
          {t:'🌍 Do something you\'ve always delayed', e:{happiness:16, stress:-5, money:-2000}},
          {t:'🏡 Stay close to what matters most',    e:{happiness:12, karma:8, health:4}},
          {t:'📿 Find a spiritual anchor',            e:{happiness:10, stress:-8, karma:6}},
        ]
      },
    ],

    // Universal events that can fire at any age (filtered by condition)
    universal: [
      {
        id:'uni_lucky_break', icon:'🍀',
        title:'Lucky Break',
        text(G){ return `Out of nowhere, something unexpected goes right for ${G.name}. A small twist of fate that opens a door they didn't know existed.`; },
        choices:[
          {t:'🚀 Seize it fully',                   e:{money:4000, happiness:10, stress:6}},
          {t:'⚖️ Take it steady',                   e:{money:2000, happiness:7}},
          {t:'🙏 Feel grateful and pay it forward', e:{karma:10, happiness:8, money:1000}},
        ]
      },
      {
        id:'uni_travel_moment', icon:'✈️',
        title:'A Trip Changes You',
        text(G){ return `A journey — planned or spontaneous — puts ${G.name} in a place so different from home that something internal quietly resets.`; },
        choices:[
          {t:'📸 Explore everything',               e:{happiness:14, smarts:5,  money:-2000}},
          {t:'🤝 Connect with locals',              e:{happiness:10, karma:6,   smarts:4}},
          {t:'😌 Rest and recharge',                e:{stress:-10,  happiness:8, health:4}},
        ]
      },
      {
        id:'uni_small_kindness', icon:'💛',
        title:'A Small Act of Kindness',
        text(G){ return `Someone does something unexpectedly kind for ${G.name} — or ${G.name} gets the chance to do it for someone else. It ripples outward.`; },
        choices:[
          {t:'🤲 Pay it forward generously',        e:{karma:14, happiness:10, money:-500}},
          {t:'😊 Accept it with grace',             e:{happiness:8, karma:5}},
          {t:'📣 Share the story with others',      e:{happiness:6, fame:3, karma:6}},
        ]
      },
      {
        id:'uni_creative_spark', icon:'✨',
        title:'Sudden Inspiration',
        text(G){ return `An idea arrives — vivid and unexpected. Whether it becomes something real depends entirely on what ${G.name} does in the next 24 hours.`; },
        choices:[
          {t:'🎨 Drop everything and create',       e:{happiness:13, smarts:4,  looks:3}},
          {t:'📓 Capture it carefully',             e:{smarts:6,  happiness:8}},
          {t:'⏳ Wait until the timing is better',  e:{stress:3,  smarts:2}},
        ]
      },
      {
        id:'uni_reconnect', icon:'📱',
        title:'Old Message',
        text(G){ return `A name appears on ${G.name}'s phone — someone from long ago. The message is simple, but it carries weight.`; },
        choices:[
          {t:'☕ Arrange to meet up',               e:{happiness:11, karma:7,  stress:-3}},
          {t:'💬 Reply warmly but keep distance',   e:{happiness:6,  karma:5}},
          {t:'👋 Leave it for now',                 e:{stress:-2}},
        ]
      },
    ]
  },

  // ── API helpers ─────────────────────────────────────────────────────────

  _onlineExtrasEnabled(){
    if(typeof fetch!=='function')return false;
    if(typeof AbortSignal==='undefined'||typeof AbortSignal.timeout!=='function')return false;
    if(typeof UI==='undefined'||!UI._settings)return false;
    return UI._settings.onlineExtras===true;
  },

  _fetchQuote(){
    if(!this._onlineExtrasEnabled())return Promise.resolve(null);
    return fetch('https://api.quotable.io/random?maxLength=120', {signal: AbortSignal.timeout(3500)})
      .then(r => r.ok ? r.json() : null)
      .then(d => d ? `"${d.content}" — ${d.author}` : null)
      .catch(() => null);
  },

  _fetchAdvice(){
    if(!this._onlineExtrasEnabled())return Promise.resolve(null);
    return fetch('https://api.adviceslip.com/advice', {cache:'no-cache', signal: AbortSignal.timeout(3500)})
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.slip?.advice || null)
      .catch(() => null);
  },

  async _fetchNumberFact(age){
    if(!this._onlineExtrasEnabled())return null;
    try{
      const r = await fetch(`https://numbersapi.com/${age}/age?json`, {signal: AbortSignal.timeout(3000)});
      const d = await r.json();
      return d?.text || null;
    } catch(e){ return null; }
  },

  // ── State helpers ────────────────────────────────────────────────────────

  _ensure(G){
    if(!Number.isFinite(G.lastStoryAge)) G.lastStoryAge = -99;
    if(!G.storySeenIds)                 G.storySeenIds = {};
  },

  canFire(G){
    this._ensure(G);
    if((G.age||0)<13)return false;
    const gap = G.age - G.lastStoryAge;
    if(gap < this.MIN_GAP) return false;
    // Probability ramps up as time since last event grows
    const ramp = Math.min(1, (gap - this.MIN_GAP + 1) / 4);
    return Math.random() < (this.BASE_CHANCE * ramp);
  },

  // ── Event selection ─────────────────────────────────────────────────────

  _pool(G){
    const age = G.age || 0;
    if(age < 13)        return [];
    if(age <= 15)       return this.EVENTS.teen.filter(e=>e.id!=='teen_parttime');
    if(age <= 17)       return [...this.EVENTS.teen];
    if(age <= 29)       return [...this.EVENTS.young_adult, ...this.EVENTS.universal];
    if(age <= 59)       return [...this.EVENTS.midlife, ...this.EVENTS.universal];
    return               [...this.EVENTS.elder,        ...this.EVENTS.universal];
  },

  pick(G){
    this._ensure(G);
    const pool = this._pool(G);
    const unseen = pool.filter(e => !G.storySeenIds[e.id]);
    const candidates = unseen.length ? unseen : pool; // recycle if exhausted
    // Weight by relevance
    const scored = candidates.map(e => ({e, w: this._score(e, G)}));
    scored.sort((a,b) => b.w - a.w);
    const top = scored.slice(0, Math.min(5, scored.length));
    return top[Math.floor(Math.random() * top.length)].e;
  },

  _score(evt, G){
    let w = 1;
    const id = evt.id;
    // Boost context-relevant events
    if(id === 'mid_health_wake' && (G.health||100) < 60)    w += 3;
    if(id === 'ya_money_stress' && (G.money||0) < 2000)     w += 3;
    if(id === 'mid_purpose' && (G.happiness||50) < 45)      w += 2;
    if(id === 'uni_lucky_break' && (G.karma||0) > 30)       w += 2;
    if(id === 'ya_heartbreak' && G.rels?.partner && !G.rels.partner.married) w += 2;
    if(id === 'mid_parent_age' && (G.age||0) > 35)          w += 2;
    if(id === 'el_legacy' && (G.age||0) > 65)               w += 3;
    if(id === 'teen_parttime' && (G.age||0) >= 14)          w += 2;
    return w;
  },

  // ── Apply choice effects ─────────────────────────────────────────────────

  applyChoice(G, effects){
    const cap  = (v,mn,mx) => Math.max(mn, Math.min(mx, v));
    const clamp= (k,v)     => cap((G[k]||0)+v, 0, 100);
    if(effects.happiness !== undefined) G.happiness = clamp('happiness', effects.happiness);
    if(effects.health    !== undefined) G.health    = clamp('health',    effects.health);
    if(effects.smarts    !== undefined) G.smarts    = clamp('smarts',    effects.smarts);
    if(effects.looks     !== undefined) G.looks     = clamp('looks',     effects.looks);
    if(effects.fitness   !== undefined) G.fitness   = clamp('fitness',   effects.fitness);
    if(effects.stress    !== undefined) G.stress    = cap((G.stress||0)+effects.stress, 0, 100);
    if(effects.karma     !== undefined) G.karma     = cap((G.karma||0)+effects.karma, -100, 100);
    if(effects.fame      !== undefined) G.fame      = clamp('fame',      effects.fame);
    if(effects.money     !== undefined) G.money     = Math.max(-99999, (G.money||0)+effects.money);
    if(effects.mentalHealth !== undefined) G.mentalHealth = clamp('mentalHealth', effects.mentalHealth);
    if(effects.career_boost) G.careerBoostPending = true;
  },

  // ── Main fire method (called from engine) ───────────────────────────────

  tryFire(G, queue){
    if(!this.canFire(G)) return;
    this._ensure(G);
    const evt = this.pick(G);
    G.storySeenIds[evt.id] = true;
    G.lastStoryAge = G.age;

    // Build engine-compatible event object
    const storyEvt = {
      icon: evt.icon,
      type: 'special',
      title: evt.title,
      text: evt.text(G),
      _isStory: true,
      choices: evt.choices.map(c => ({
        t: c.t,
        e: c.e,
        fn: ()=> this.applyChoice(G, c.e)
      }))
    };
    queue.push(storyEvt);
    if(typeof Engine !== 'undefined'){
      Engine.log(`${evt.icon} Life Story: "${evt.title}"`, 'special');
    }
  },

  // ── Milestone quotes from Numbers API ───────────────────────────────────

  MILESTONES: [18, 21, 30, 40, 50, 60, 70, 80],

  async fireMilestoneIfNeeded(G){
    if(!this.MILESTONES.includes(G.age)) return;
    const fact = await this._fetchNumberFact(G.age);
    if(!fact) return;
    if(typeof UI !== 'undefined'){
      UI.toast(`🔢 Age ${G.age}: ${fact}`, 'neutral', 5000);
    }
  },

  // ── Death-screen quote via Quotable API ────────────────────────────────

  async enrichDeathScreen(){
    const quote = await this._fetchQuote();
    if(!quote) return;
    const el = document.getElementById('dt-quote');
    if(el && (!el.textContent || el.textContent.length < 5)){
      el.textContent = quote;
    }
  },

  // ── Occasional "Life Wisdom" card via Advice Slip ──────────────────────

  async maybeShowWisdom(G){
    if(!G || (G.age % 7 !== 0)) return; // every ~7 years
    const advice = await this._fetchAdvice();
    if(!advice) return;
    if(typeof Engine !== 'undefined'){
      Engine.log(`💡 Life Wisdom: "${advice}"`, 'neutral');
    }
  }
};
