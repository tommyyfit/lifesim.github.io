const LIFESIM_UPDATES=[
  {
    version:'v24.2.1',
    title:'Fun First Stability Rebuild',
    date:'2026-07-11',
    tag:'Major Repair',
    highlights:[
      'Replaced the overloaded dashboard with one clear yearly screen focused on four enjoyable actions, recent moments and important people.',
      'Reduced the main navigation to five age-relevant sections; advanced systems now live in an optional More menu.',
      'Simplified the sidebar to four understandable wellbeing stats and removed repeated goals, world data and personality meters from the main screen.',
      'Restored a consistent post-setup background, cleaner cards, reliable responsive layouts and a compact mobile experience.',
      'Simplified Settings while keeping themes, sound, save tools and optional local Ollama support.'
    ]
  },
  {
    version:'v24.1',
    title:'UX, Background and Settings Overhaul',
    date:'2026-07-11',
    tag:'Major UX Update',
    highlights:[
      'Rebuilt Settings into five clear categories: Gameplay, Appearance, Audio, Local AI and Data.',
      'Fixed invisible toggles and decorative controls caused by an over-broad empty-span cleanup rule.',
      'Replaced the inconsistent post-setup background with a calm, coherent game shell and removed startup confetti clutter.',
      'Fixed mobile settings overflow, clipped buttons and inaccessible categories; all five categories now remain visible.',
      'Integrated Live Data diagnostics into the Data panel instead of injecting it outside the settings layout.'
    ]
  },
  {
    version:'v24.0',
    title:'Living World Update',
    date:'2026-07-11',
    tag:'Major Update',
    highlights:[
      'Added adaptive yearly priorities based on age, health, stress, relationships, education, career and financial pressure.',
      'Added connected multi-year story arcs whose choices change personality, memories and relationship dimensions.',
      'Important people now track trust, closeness, respect and conflict instead of one frozen relationship percentage.',
      'Added a living world dashboard, clearer yearly recaps, developing personality and stronger life-stage identity.'
    ]
  },
  {
    version:'v24.0',
    title:'Optional Local Ollama Storyteller',
    date:'2026-07-11',
    tag:'Local AI',
    highlights:[
      'Settings can connect to a locally running Ollama server, discover installed models and test the connection.',
      'Local AI can enhance yearly recaps and create one validated, age-appropriate optional story moment per year.',
      'The simulation remains fully playable without AI, and Ollama text cannot directly grant major life outcomes or unbounded rewards.'
    ]
  },
  {
    version:'v23.3',
    title:'Main Menu And Dialog Repair',
    date:'2026-07-11',
    tag:'Critical UX Fix',
    highlights:[
      'Fixed the CSS cascade that turned every full-screen dialog into a clipped relative element, making Updates and other modals appear broken or off-screen.',
      'Rebuilt the main menu to fit normal desktop and mobile viewports without cutting off the logo or hiding content.',
      'Removed duplicate feature-tag clutter and the floating sound button; sound remains available in Settings.',
      'Moved global dialogs outside the app shell, added reliable focus handling, backdrop closing and body scroll locking.'
    ]
  },
  {
    version:'v23.2',
    title:'Age-Aware Life Progression',
    date:'2026-07-11',
    tag:'Major Fix',
    highlights:[
      'Infants and children now receive development, family, school, health and talent goals instead of adult money or property targets.',
      'Adult tabs and source-level actions stay locked until the correct age, including careers, investing, business, crime and independent travel.',
      'Family future funds, youth savings, school performance and the age-18 transition now behave as separate systems.'
    ]
  },
  {
    version:'v23.2',
    title:'Logical Events And Consequences',
    date:'2026-07-11',
    tag:'Gameplay',
    highlights:[
      'Events now check age and state: proposals need a partner, job awards need a career, market crashes need investments and property surges need property.',
      'Teen procedural stories focus on school, friendships, family, health and identity without adult financial pressure.',
      'Yearly event queues are limited without silently marking unseen events as completed or on cooldown.'
    ]
  },
  {
    version:'v23.2',
    title:'UX, Goals And Reliability Pass',
    date:'2026-07-11',
    tag:'Polish',
    highlights:[
      'Young-life navigation, labels, stats and screens now change with the current life stage.',
      'Repeated farmable actions have realistic annual limits and clear remaining-action feedback.',
      'Sound controls are available in Settings on mobile, save/import logic is hardened and senior goals reward wellbeing instead of unrelated cash.'
    ]
  },

  {
    version:'v21',
    title:'Daily Mood System',
    date:'2026-05-13',
    tag:'New Feature',
    highlights:[
      'Each year now calculates a prevailing Mood (Euphoric → Miserable) based on happiness, mental health, stress, relationships and career.',
      'Mood streaks of 3+ years give happiness bonuses or penalties.',
      'Mood is displayed prominently on the Life tab and in detail on the Mind tab.'
    ]
  },
  {
    version:'v21',
    title:'Life Milestones Tracker',
    date:'2026-05-13',
    tag:'UI',
    highlights:[
      'The Life tab now shows a row of key life milestones: Education, Career, Partner, Children, Own Home, Savings.',
      'Milestones highlight green when achieved and grey when still pending.',
      'Quick visual check on how your life is progressing at any age.'
    ]
  },
  {
    version:'v21',
    title:'New Actions',
    date:'2026-05-13',
    tag:'Gameplay',
    highlights:[
      'Added 7 new actions in the Mind tab: Cooking Class, Cold Shower, Mindful Walk, Watch Sunrise, Screen Detox, Animal Shelter visit, and Read the News.',
      'Each new action has unique stat effects and several track progress toward new achievements.',
      'Cooking Class costs a small fee and improves happiness, health, and smarts.'
    ]
  },
  {
    version:'v21',
    title:'More Life Events',
    date:'2026-05-13',
    tag:'Content',
    highlights:[
      'Added 8 new story events across teen and adult stages.',
      'Teen events include Social Media Comparison, New Hobby (skateboarding), Cooking Discovery, and Mentorship Offer.',
      'Adult events include Wellness Retreat, Milestone Birthday, Market Crash, Old Friend Reconnects, and Personal Record.'
    ]
  },
  {
    version:'v21',
    title:'New Achievements',
    date:'2026-05-13',
    tag:'Content',
    highlights:[
      'Added 10 new achievements tied to mood streaks, new actions, and lifestyle patterns.',
      'Achievements include Euphoric Life, Ice Warrior, Home Chef, Mindful Walker, Community Hero, and more.',
      'Mood Comeback achievement unlocks when recovering from a long Miserable streak.'
    ]
  },
  {
    version:'Release',
    title:'Settings And Accessibility',
    date:'2026-05-12',
    tag:'Polish',
    highlights:[
      'Expanded Settings with theme style, larger text, reduced motion, sidebar feel, story extras and log detail controls.',
      'Settings now save cleanly and apply visual classes immediately.',
      'Release health checks cover script loading, local references, CSS balance, duplicate IDs and mocked startup.'
    ]
  },
  {
    version:'Release',
    title:'Relationship Age Flow',
    date:'2026-05-12',
    tag:'Gameplay',
    highlights:[
      'Romance actions now start cleanly at age 16.',
      'Removed the old confusing under-18 relationship message.',
      'Friend-to-romance actions now respect the age-16 romance flow while private adult actions stay separately gated.'
    ]
  },
  {
    version:'Release',
    title:'Family Summary Fix',
    date:'2026-05-12',
    tag:'Fix',
    highlights:[
      'Love and Family summaries now count father and mother correctly.',
      'The Parents metric shows a real alive count instead of a blank dash when parent data exists.',
      'Older parent-array saves remain supported.'
    ]
  },
  {
    version:'Release',
    title:'Release Cleanup',
    date:'2026-05-11',
    tag:'Stability',
    highlights:[
      'Removed visible version-number style labels from the app shell, storage keys and polish layers.',
      'Release CSS selectors now target semantic release markers instead of old numeric build markers.',
      'Save migration still supports older local saves without exposing old key names in the UI.'
    ]
  },
  {
    version:'Release',
    title:'Live Data And Assets',
    date:'2026-05-10',
    tag:'Gameplay',
    highlights:[
      'Country data, holidays and exchange-rate helpers use cached public data with offline fallback.',
      'Assets, vehicles, property, collectibles and upgrades have clearer dashboards and quick actions.',
      'Net worth, yearly costs and ownership summaries are easier to scan.'
    ]
  },
  {
    version:'Release',
    title:'Career, Crime And Goals',
    date:'2026-05-10',
    tag:'Systems',
    highlights:[
      'Career guidance, promotion paths and performance feedback are clearer.',
      'Crime systems include heat, gangs, risk, reform paths and stronger consequences.',
      'Goals and achievements include better progress, rewards and detail views.'
    ]
  },
  {
    version:'Release',
    title:'Love, Family And Health',
    date:'2026-05-10',
    tag:'Systems',
    highlights:[
      'Relationships, family, children, adoption and parent care are unified in the Love area.',
      'Stable partner actions no longer create random health-risk events without a real risk flag.',
      'Health checkup wording and relationship wellbeing panels are calmer and clearer.'
    ]
  },
  {
    version:'Release',
    title:'Interface Polish',
    date:'2026-05-09',
    tag:'UI',
    highlights:[
      'Desktop and mobile layouts use cleaner spacing, readable cards and stable scrolling.',
      'Life log, yearly summaries, decision cards and timeline filters are easier to read.',
      'Family, sports, military and travel systems are grouped under their natural parent tabs.'
    ]
  }
];

if(typeof window!=='undefined')window.LIFESIM_UPDATES=LIFESIM_UPDATES;
