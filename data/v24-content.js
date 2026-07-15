/* LifeSim v24 content — structured, age-aware story material. */
const V24_STAGES=[
  {id:'infancy',min:0,max:3,icon:'🧸',label:'Infancy',focus:'Safety, attachment and early development'},
  {id:'childhood',min:4,max:11,icon:'🪁',label:'Childhood',focus:'Learning, play, family and first friendships'},
  {id:'teen',min:12,max:17,icon:'🎒',label:'Teen Years',focus:'Identity, school, independence and belonging'},
  {id:'emerging',min:18,max:25,icon:'🧭',label:'Starting Independence',focus:'Direction, stability, skills and first adult commitments'},
  {id:'adult',min:26,max:44,icon:'🏙️',label:'Adulthood',focus:'Career depth, relationships, family and financial foundations'},
  {id:'midlife',min:45,max:59,icon:'🌄',label:'Midlife',focus:'Meaning, health, responsibility and reinvention'},
  {id:'senior',min:60,max:79,icon:'🌿',label:'Later Life',focus:'Wellbeing, family, mentoring and retirement choices'},
  {id:'elder',min:80,max:130,icon:'📖',label:'Legacy Years',focus:'Connection, dignity, memory and legacy'}
];

const V24_PRIORITY_LIBRARY={
  infancy:[
    {id:'secure_bond',icon:'🤗',title:'Build a secure bond',description:'Spend calm, safe time with family.',metric:'family'},
    {id:'healthy_start',icon:'🩺',title:'Protect early health',description:'Rest, checkups and a stable routine matter most.',metric:'health'},
    {id:'explore_safely',icon:'🧸',title:'Explore safely',description:'Play and curiosity build early confidence.',metric:'learning'}
  ],
  childhood:[
    {id:'school_confidence',icon:'📚',title:'Grow learning confidence',description:'Practice without turning childhood into constant pressure.',metric:'school'},
    {id:'close_friend',icon:'🫶',title:'Nurture one real friendship',description:'Closeness matters more than popularity.',metric:'friendship'},
    {id:'discover_hobby',icon:'🎨',title:'Discover a hobby',description:'Try something that may become a lifelong talent.',metric:'talent'},
    {id:'family_trust',icon:'🏡',title:'Strengthen family trust',description:'Share time and communicate honestly.',metric:'family'}
  ],
  teen:[
    {id:'prepare_future',icon:'🧭',title:'Prepare for the next step',description:'Explore education, work and training paths.',metric:'direction'},
    {id:'school_balance',icon:'🎓',title:'Balance school and wellbeing',description:'Improve results without sacrificing mental health.',metric:'school'},
    {id:'healthy_identity',icon:'🪞',title:'Build a healthy identity',description:'Make choices based on values, not pressure.',metric:'identity'},
    {id:'repair_home',icon:'💬',title:'Repair trust at home',description:'Address tension before it becomes distance.',metric:'family'},
    {id:'starter_savings',icon:'🐷',title:'Learn responsible saving',description:'Save a small amount for a realistic personal goal.',metric:'money'}
  ],
  emerging:[
    {id:'stable_direction',icon:'🧭',title:'Choose a stable direction',description:'Commit to work, education or a practical training path.',metric:'career'},
    {id:'emergency_buffer',icon:'🛟',title:'Build a small safety buffer',description:'A modest emergency reserve comes before status spending.',metric:'money'},
    {id:'useful_skill',icon:'🧰',title:'Develop one useful skill',description:'Depth in one skill creates better opportunities.',metric:'skill'},
    {id:'adult_health',icon:'❤️‍🩹',title:'Protect your energy',description:'Sleep, movement and stress habits compound early.',metric:'health'},
    {id:'real_connections',icon:'🤝',title:'Keep real connections',description:'Independence should not become isolation.',metric:'relationship'}
  ],
  adult:[
    {id:'career_depth',icon:'💼',title:'Deepen your work',description:'Improve performance, negotiate fairly or change direction intentionally.',metric:'career'},
    {id:'financial_foundation',icon:'🏦',title:'Strengthen the foundation',description:'Reduce fragile debt and protect an emergency reserve.',metric:'money'},
    {id:'relationship_attention',icon:'❤️',title:'Give relationships attention',description:'Important people need time before distance becomes normal.',metric:'relationship'},
    {id:'prevent_burnout',icon:'🧘',title:'Prevent burnout',description:'Ambition is not sustainable without recovery.',metric:'health'},
    {id:'family_presence',icon:'👨‍👩‍👧',title:'Be present for family',description:'Responsibility includes emotional presence, not only income.',metric:'family'}
  ],
  midlife:[
    {id:'midlife_health',icon:'🫀',title:'Take health seriously',description:'Prevention now protects future independence.',metric:'health'},
    {id:'meaningful_work',icon:'🧭',title:'Make work meaningful',description:'Rebuild, mentor or change direction instead of drifting.',metric:'career'},
    {id:'repair_relationship',icon:'🕊️',title:'Repair an important relationship',description:'Unresolved distance becomes harder with time.',metric:'relationship'},
    {id:'retirement_plan',icon:'🌱',title:'Prepare for later life',description:'Build a realistic retirement and debt plan.',metric:'money'},
    {id:'life_outside_work',icon:'🎸',title:'Protect life outside work',description:'Friendship, hobbies and purpose deserve space.',metric:'wellbeing'}
  ],
  senior:[
    {id:'retirement_balance',icon:'🌤️',title:'Shape a balanced retirement',description:'Combine stability, purpose and connection.',metric:'money'},
    {id:'stay_connected',icon:'☎️',title:'Stay socially connected',description:'Regular contact protects wellbeing and meaning.',metric:'relationship'},
    {id:'mentor_someone',icon:'🧑‍🏫',title:'Pass something forward',description:'Share experience without controlling the next generation.',metric:'legacy'},
    {id:'protect_mobility',icon:'🚶',title:'Protect mobility and health',description:'Consistent gentle care matters more than extremes.',metric:'health'},
    {id:'organize_legacy',icon:'🗂️',title:'Organize your legacy',description:'Clarify wishes, memories and responsibilities.',metric:'legacy'}
  ],
  elder:[
    {id:'dignity_health',icon:'🌿',title:'Protect comfort and dignity',description:'Choose care that supports quality of life.',metric:'health'},
    {id:'share_memories',icon:'📖',title:'Share important memories',description:'Tell the stories only you can preserve.',metric:'legacy'},
    {id:'reconnect',icon:'🫂',title:'Reconnect where possible',description:'A sincere conversation can still matter.',metric:'relationship'},
    {id:'peaceful_routine',icon:'☕',title:'Build a peaceful routine',description:'Small reliable joys create a good year.',metric:'wellbeing'}
  ]
};

const V24_ARC_LIBRARY=[
  {
    id:'childhood_friendship',stages:['childhood'],icon:'🫶',title:'A New Friendship',npcRole:'friend',
    beats:[
      {title:'Someone Sits Beside You',text:'A quiet classmate chooses the seat beside you. They look nervous but interested in talking.',choices:[
        {label:'Welcome them warmly',sub:'Take the first social risk.',effects:{happiness:3,karma:2},relation:{trust:7,closeness:8}},
        {label:'Start with a small question',sub:'A slower but comfortable beginning.',effects:{smarts:1,happiness:2},relation:{trust:5,closeness:5}},
        {label:'Keep to yourself today',sub:'Protect your space, but the chance may cool.',effects:{stress:-2},relation:{closeness:-2}}
      ]},
      {title:'A Difficult Rumor',text:'Other children repeat an unfair rumor about your friend and wait to see what you will do.',choices:[
        {label:'Defend them calmly',sub:'Risk attention to protect trust.',effects:{karma:4,stress:2},relation:{trust:10,respect:8}},
        {label:'Speak to them privately',sub:'Offer support without joining the conflict.',effects:{happiness:2},relation:{trust:7,closeness:6}},
        {label:'Stay out of it',sub:'Avoid conflict, but they notice.',effects:{stress:-2},relation:{trust:-6,conflict:4}}
      ]},
      {title:'A Friendship Takes Shape',text:'The friendship has survived enough small moments to become something real.',choices:[
        {label:'Make time for them',sub:'Invest in a lasting bond.',effects:{happiness:6,stress:-3},relation:{trust:8,closeness:10}},
        {label:'Keep a healthy balance',sub:'Stay close while making room for others.',effects:{happiness:4,smarts:1},relation:{respect:6,closeness:5}},
        {label:'Let the friendship drift',sub:'People sometimes grow apart.',effects:{happiness:-2},relation:{closeness:-8}}
      ]}
    ]
  },
  {
    id:'teen_mentor',stages:['teen'],icon:'🧑‍🏫',title:'The Mentor',npcRole:'mentor',
    beats:[
      {title:'Someone Notices Your Potential',text:'An adult at school notices a strength you have not taken seriously and offers extra guidance.',choices:[
        {label:'Accept the guidance',sub:'Trade some free time for direction.',effects:{smarts:5,stress:2},relation:{trust:5,respect:6}},
        {label:'Ask what they see in you',sub:'Understand the opportunity first.',effects:{smarts:3,happiness:2},relation:{trust:4,respect:4}},
        {label:'Decline politely',sub:'Keep control of your time.',effects:{stress:-2},relation:{respect:2}}
      ]},
      {title:'A Hard Piece of Feedback',text:'Your mentor says your ability is real, but your habits are holding you back.',choices:[
        {label:'Take it seriously',sub:'Use discomfort as information.',effects:{smarts:4,stress:2},personality:{discipline:4,humility:3}},
        {label:'Ask for a practical plan',sub:'Turn criticism into steps.',effects:{smarts:3,happiness:2},personality:{discipline:3}},
        {label:'Reject the criticism',sub:'Protect confidence, but lose useful insight.',effects:{happiness:2},relation:{respect:-6,conflict:5}}
      ]},
      {title:'A Door Opens',text:'Your mentor can recommend you for a course, apprenticeship or responsibility that fits your path.',choices:[
        {label:'Take the opportunity',sub:'Commit to a demanding next step.',effects:{smarts:6,stress:3,reputation:3},relation:{respect:8}},
        {label:'Choose a smaller step',sub:'Build confidence without overloading yourself.',effects:{smarts:4,happiness:3},relation:{trust:4}},
        {label:'Choose another direction',sub:'Respect the help but follow your own path.',effects:{happiness:4},personality:{courage:3}}
      ]}
    ]
  },
  {
    id:'independence_home',stages:['emerging'],icon:'🏠',title:'Learning Independence',npcRole:null,
    beats:[
      {title:'The Move-Out Question',text:'Living arrangements are starting to shape your freedom, costs and relationships.',choices:[
        {label:'Plan before moving',sub:'Build a buffer and compare realistic costs.',effects:{smarts:3,stress:-1},personality:{discipline:3}},
        {label:'Move quickly for freedom',sub:'Gain independence with more financial pressure.',effects:{happiness:5,stress:5},personality:{courage:2}},
        {label:'Stay and contribute at home',sub:'Save money while accepting shared responsibilities.',effects:{happiness:2,karma:2},personality:{empathy:2}}
      ]},
      {title:'An Unexpected Expense',text:'A necessary expense arrives before your finances feel ready.',choices:[
        {label:'Use savings carefully',sub:'Absorb the problem without new debt.',effects:{stress:2},personality:{discipline:2}},
        {label:'Ask family for limited help',sub:'Protect stability, but accept dependence.',effects:{stress:-2,happiness:-1},personality:{humility:2}},
        {label:'Use expensive credit',sub:'Solve today and create a future problem.',effects:{happiness:2,stress:4},personality:{impulsivity:4}}
      ]},
      {title:'A Place That Feels Yours',text:'Your routines, responsibilities and choices finally make adult life feel real.',choices:[
        {label:'Build stable routines',sub:'Turn independence into a foundation.',effects:{health:3,happiness:4,stress:-3},personality:{discipline:4}},
        {label:'Fill life with experiences',sub:'Prioritize discovery while costs remain manageable.',effects:{happiness:6,stress:1},personality:{courage:3}},
        {label:'Focus almost entirely on work',sub:'Advance faster, but narrow the rest of life.',effects:{smarts:3,reputation:3,stress:4},personality:{ambition:4}}
      ]}
    ]
  },
  {
    id:'career_crossroads',stages:['adult','midlife'],icon:'🧭',title:'Career Crossroads',npcRole:'coworker',
    beats:[
      {title:'The Work No Longer Fits',text:'A normal workday leaves you wondering whether the current path still matches the person you have become.',choices:[
        {label:'Investigate alternatives',sub:'Research before making a dramatic move.',effects:{smarts:3,stress:1},personality:{courage:2}},
        {label:'Improve the current role',sub:'Seek clearer boundaries, pay or responsibility.',effects:{reputation:3,stress:2},personality:{discipline:2}},
        {label:'Ignore the feeling',sub:'Keep stability, but the question remains.',effects:{stress:3,happiness:-2}}
      ]},
      {title:'A Risky Opportunity',text:'A credible opportunity offers growth, but it would cost security and comfort.',choices:[
        {label:'Take the calculated risk',sub:'Accept uncertainty after checking the downside.',effects:{happiness:4,stress:4,reputation:3},personality:{courage:4}},
        {label:'Negotiate a safer version',sub:'Protect the upside without gambling everything.',effects:{smarts:3,reputation:2},personality:{discipline:3}},
        {label:'Decline and recommit',sub:'Choose stability intentionally, not fearfully.',effects:{stress:-3,happiness:2},personality:{honesty:2}}
      ]},
      {title:'What Success Means Now',text:'The decision has forced you to define success more honestly.',choices:[
        {label:'Prioritize mastery',sub:'Become excellent at work that matters to you.',effects:{smarts:5,reputation:4},personality:{ambition:3}},
        {label:'Prioritize balance',sub:'Protect health and relationships alongside work.',effects:{health:4,happiness:5,stress:-5},personality:{empathy:3}},
        {label:'Prioritize leadership',sub:'Take responsibility for people and outcomes.',effects:{reputation:5,stress:3},personality:{courage:3,empathy:2}}
      ]}
    ]
  },
  {
    id:'family_distance',stages:['adult','midlife','senior'],icon:'🕊️',title:'Distance in the Family',npcRole:'family',
    beats:[
      {title:'Conversations Become Shorter',text:'An important family relationship has become polite but distant. Nothing dramatic happened; attention simply disappeared.',choices:[
        {label:'Name the distance gently',sub:'Risk an honest conversation.',effects:{stress:2,karma:2},relation:{trust:6,conflict:-3}},
        {label:'Start with consistent small contact',sub:'Rebuild safety before discussing the past.',effects:{happiness:2},relation:{closeness:6,trust:3}},
        {label:'Wait for them to reach out',sub:'Avoid pressure, but accept more distance.',effects:{stress:-1},relation:{closeness:-4}}
      ]},
      {title:'The Old Hurt Surfaces',text:'A past disappointment finally comes up. Both of you remember it differently.',choices:[
        {label:'Listen before defending yourself',sub:'Understanding does not require total agreement.',effects:{stress:2,karma:3},relation:{trust:8,conflict:-6},personality:{empathy:4}},
        {label:'Explain your side honestly',sub:'Be clear without attacking.',effects:{happiness:1},relation:{respect:5,conflict:-2},personality:{honesty:3}},
        {label:'End the conversation',sub:'Protect yourself now, but leave the wound open.',effects:{stress:-2},relation:{trust:-6,conflict:6}}
      ]},
      {title:'A New Kind of Relationship',text:'The relationship cannot return to the past, but it may become healthier than it was.',choices:[
        {label:'Build something new',sub:'Choose realistic closeness and better boundaries.',effects:{happiness:6,stress:-4},relation:{trust:8,closeness:8,conflict:-5}},
        {label:'Keep respectful distance',sub:'Accept limits without turning them into hostility.',effects:{stress:-3,happiness:2},relation:{respect:6,conflict:-4}},
        {label:'Try to force the old closeness',sub:'Good intentions can still ignore boundaries.',effects:{happiness:2,stress:3},relation:{conflict:4}}
      ]}
    ]
  },
  {
    id:'legacy_story',stages:['senior','elder'],icon:'📖',title:'What You Leave Behind',npcRole:'younger',
    beats:[
      {title:'Someone Asks About Your Past',text:'A younger person asks about a choice that changed your life. They want the honest version, not the impressive one.',choices:[
        {label:'Tell the whole story',sub:'Share the mistake as well as the lesson.',effects:{happiness:5,karma:3},relation:{trust:8,respect:7},personality:{honesty:3}},
        {label:'Share one useful lesson',sub:'Keep it simple and practical.',effects:{happiness:3},relation:{respect:5}},
        {label:'Keep the memory private',sub:'Some experiences remain yours alone.',effects:{stress:-1},relation:{trust:-1}}
      ]},
      {title:'Organizing a Lifetime',text:'Objects, documents and memories have accumulated. Deciding what matters becomes an emotional task.',choices:[
        {label:'Organize wishes clearly',sub:'Reduce future confusion for the people you love.',effects:{stress:-4,karma:3},personality:{discipline:3}},
        {label:'Create a memory collection',sub:'Preserve stories, photos and personal meaning.',effects:{happiness:6,stress:-2},personality:{empathy:2}},
        {label:'Leave it for later',sub:'Avoid the discomfort for now.',effects:{happiness:1,stress:2}}
      ]},
      {title:'The Legacy Conversation',text:'You realize legacy is less about a score than the effect your presence had on other people.',choices:[
        {label:'Express gratitude',sub:'Tell important people what they gave you.',effects:{happiness:7,stress:-5,karma:4},relation:{closeness:8,trust:5}},
        {label:'Offer practical support',sub:'Turn care into something the next generation can use.',effects:{happiness:5,karma:4},relation:{respect:6}},
        {label:'Make peace with an imperfect life',sub:'Accept the whole story without pretending.',effects:{happiness:6,mentalHealth:6,stress:-7},personality:{humility:4}}
      ]}
    ]
  }
];

if(typeof window!=='undefined'){
  window.V24_STAGES=V24_STAGES;
  window.V24_PRIORITY_LIBRARY=V24_PRIORITY_LIBRARY;
  window.V24_ARC_LIBRARY=V24_ARC_LIBRARY;
}
