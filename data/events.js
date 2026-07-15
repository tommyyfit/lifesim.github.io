/* data/events.js — LifeSim data */

const EV=(icon,type,title,text,choices)=>({icon,type,title,text,choices});
const CH=(t,e={})=>({t,e});

const EVENTS={
  earlyChildhood:[
    EV('👣','special','First Steps','You found your balance and took a few brave steps across the room.',[
      CH('👏 Keep trying',{fitness:5,happiness:7,health:2}),
      CH('🤗 Walk into a parent’s arms',{happiness:9,stress:-3,parentBond:3}),
    ]),
    EV('📖','good','Bedtime Story','A familiar voice turned a simple picture book into a whole new world.',[
      CH('🌙 Listen quietly',{smarts:5,happiness:5,stress:-4}),
      CH('👉 Point at every picture',{smarts:7,happiness:4}),
    ]),
    EV('🧸','neutral','Favorite Toy','One toy became your trusted companion everywhere you went.',[
      CH('😊 Keep it close',{happiness:7,stress:-4}),
      CH('🤝 Share it during playtime',{happiness:6,karma:2}),
    ]),
    EV('🗣️','special','A New Word','You surprised your family by clearly saying a new word.',[
      CH('😄 Say it again',{smarts:6,happiness:8}),
      CH('🎵 Turn it into a little song',{smarts:4,happiness:9}),
    ]),
    EV('🌳','good','Family Picnic','Your family spent a calm afternoon outside together.',[
      CH('⚽ Move and explore',{fitness:5,health:3,happiness:6}),
      CH('🧺 Stay close to family',{happiness:8,stress:-4,parentBond:3}),
    ]),
    EV('🩺','neutral','Routine Checkup','A normal childhood checkup made sure your development was on track.',[
      CH('🙂 Stay calm',{health:5,stress:-3}),
      CH('❓ Ask curious questions',{health:3,smarts:4}),
    ]),
    EV('🌧️','neutral','Rainy Day Indoors','Rain kept everyone inside, so the living room became a play space.',[
      CH('🎨 Make something',{happiness:6,smarts:3}),
      CH('🧩 Solve a simple puzzle',{smarts:6,happiness:4}),
    ]),
    EV('😨','bad','A Small Scare','A loud noise frightened you more than anyone expected.',[
      CH('🤗 Seek comfort',{happiness:4,stress:-5,parentBond:3}),
      CH('🫁 Breathe and settle',{mentalHealth:4,stress:-4}),
    ]),
    EV('🍌','good','Helping in the Kitchen','You were given one tiny, safe job while the family prepared food.',[
      CH('🥣 Help carefully',{smarts:4,happiness:6,karma:1}),
      CH('😋 Taste the result',{health:2,happiness:8}),
    ]),
    EV('🫶','good','Play Date','Another child visited and the two of you slowly learned to play together.',[
      CH('🤝 Share and cooperate',{happiness:7,karma:2}),
      CH('🏃 Invent a game',{fitness:4,happiness:7,smarts:2}),
    ]),
  ],
  childhood:[
    EV('🍦','good','Ice Cream Day','Your parent bought you ice cream on the walk home. For a few minutes, life felt perfect.',[
      CH('😋 Savour every bite',{happiness:8}),
      CH('🤝 Share with another kid',{happiness:11,karma:2}),
    ]),
    EV('😤','bad','Playground Bully','A bigger kid keeps pushing you around during breaks at school.',[
      CH('📢 Tell a teacher',{happiness:4,smarts:2,stress:-3}),
      CH('🥊 Fight back',{happiness:5,health:-8,stress:4}),
      CH('😢 Avoid them',{happiness:-10,stress:6}),
    ]),
    EV('📚','neutral','Spelling Bee','Your teacher chose you for the school spelling bee.',[
      CH('📚 Study hard',{smarts:11,happiness:5,stress:3}),
      CH('😬 Wing it',{smarts:3,happiness:1}),
      CH('🙅 Refuse',{happiness:-3}),
    ]),
    EV('🐶','special','A Puppy!','Your family surprised you with a puppy for your birthday.',[
      CH('😍 Love it completely',{happiness:18,health:3,stress:-4}),
    ]),
    EV('🤒','bad','Bad Illness','You caught a nasty virus and missed school for a week.',[
      CH('🛌 Rest properly',{health:-3,happiness:3,stress:-3}),
      CH('💊 Let family handle medicine',{health:-2,stress:-1}),
      CH('🏃 Push through',{health:-12,happiness:-5,stress:7}),
    ]),
    EV('🎂','special','Birthday Party','Your birthday party was full of friends, music and chaos.',[
      CH('🎉 Enjoy every second',{happiness:17,fame:2}),
      CH('😊 Stay close to family',{happiness:12,karma:2}),
    ]),
    EV('🎮','neutral','New Video Game','Your friend got a brand-new game and invited you over all weekend.',[
      CH('🎮 Play all weekend',{happiness:13,smarts:-2}),
      CH('⏰ Set a limit',{happiness:7,smarts:2}),
      CH('📚 Read instead',{smarts:7,happiness:2}),
    ]),
    EV('🏅','special','Academic Award','You received a certificate for excellent school performance.',[
      CH('🏆 Feel proud',{happiness:12,smarts:7}),
    ]),
    EV('💔','bad','Best Friend Moves Away','Your best friend is moving far away this weekend.',[
      CH('📱 Promise to stay in touch',{happiness:-4,stress:-2}),
      CH('🤗 Throw a goodbye party',{happiness:-2,karma:2}),
      CH('😢 Cry alone',{happiness:-13,stress:5}),
    ]),
    EV('⚽','neutral','Sports Team Tryout','A coach says you have real talent and wants you on the team.',[
      CH('⚽ Join and train',{health:8,fitness:10,happiness:9}),
      CH('🤷 Try casually',{health:3,fitness:4,happiness:4}),
      CH('🙅 Too busy',{happiness:-1}),
    ]),
    EV('🎭','neutral','School Play','You landed a role in the school play.',[
      CH('🎭 Rehearse seriously',{happiness:9,smarts:4,looks:3,fame:2}),
      CH('😰 Quit from stage fright',{happiness:-6,stress:4}),
    ]),
    EV('🔬','neutral','Science Fair','A regional science fair is coming up, and your class needs projects.',[
      CH('🔬 Build something amazing',{smarts:12,happiness:6,stress:4}),
      CH('📋 Do a simple project',{smarts:4}),
      CH('🙅 Skip it',{happiness:-1}),
    ]),
    EV('🎸','good','Music Lessons','Your family offered to pay for music lessons.',[
      CH('🎸 Guitar',{happiness:9,smarts:5,fame:1}),
      CH('🎹 Piano',{smarts:8,happiness:7}),
      CH('🙅 Not interested',{}),
    ]),
    EV('🏕️','good','Camping Trip','Your family is going camping for two weeks.',[
      CH('🏕️ Embrace nature',{happiness:14,health:7,fitness:6,stress:-5}),
      CH('📱 Miss home',{happiness:4,stress:2}),
    ]),
    EV('🐱','neutral','Injured Stray Cat','You found a small injured cat behind the school.',[
      CH('🏥 Ask an adult to take it to the vet',{happiness:10,karma:4}),
      CH('🏠 Nurse it at home',{happiness:7,karma:2}),
      CH('😞 Walk past',{happiness:-7,karma:-3}),
    ]),
    EV('🎨','good','Art Contest','Your painting won a regional youth contest.',[
      CH('🖼️ Hang it proudly',{happiness:9,smarts:3,looks:3,fame:2}),
    ]),
    EV('🍋','good','Lemonade Stand','Your lemonade stand sold out three times.',[
      CH('💼 Expand the operation',{money:300,smarts:6,happiness:9}),
      CH('😊 Keep it fun',{money:150,happiness:8}),
    ]),
    EV('📖','good','Life-Changing Book','You found a book that changed how you see the world.',[
      CH('📖 Read it twice',{smarts:12,happiness:8}),
      CH('📝 Write notes',{smarts:9,happiness:5}),
    ]),
    EV('⛈️','bad','Terrible Storm','A huge storm damaged part of your family home.',[
      CH('🏠 Help clean up',{happiness:-4,health:-2,karma:3}),
      CH('😰 Hide away',{happiness:-9,stress:6}),
    ]),
    EV('👑','special','Class President','You ran for class president and somehow won.',[
      CH('🎤 Lead confidently',{happiness:14,smarts:5,fame:5}),
      CH('😅 Stay humble',{happiness:10,karma:3}),
    ]),
    EV('🌱','good','School Garden','Your class started a vegetable garden.',[
      CH('🌿 Tend it daily',{happiness:9,health:4,stress:-3}),
      CH('🥗 Harvest vegetables',{happiness:7,health:5}),
    ]),
    EV('🎤','special','Choir Solo','You were given the solo in the school choir.',[
      CH('🎵 Sing your heart out',{happiness:14,looks:3,fame:5}),
      CH('😰 Freeze on stage',{happiness:-5,stress:5}),
    ]),
    EV('✈️','good','First Flight','Your family is taking you abroad for the first time.',[
      CH('🌍 Be amazed by everything',{happiness:15,smarts:5}),
      CH('😨 Fear the flight',{happiness:5,stress:5}),
    ]),
    EV('🔐','neutral','Secret Clubhouse','You and your friends built a secret den in the woods.',[
      CH('🏕️ Make it amazing',{happiness:12,smarts:3}),
      CH('🤐 Guard the secret',{happiness:8}),
    ]),
  ],

  teen:[
    EV('💘','special','First Crush','You developed serious feelings for someone in your class.',[
      CH('💌 Write a note',{happiness:12,stress:2}),
      CH('😅 Tell your best friend',{happiness:8,stress:-2}),
      CH('🙈 Say nothing',{happiness:3,stress:4}),
    ]),
    EV('💋','special','First Kiss','Someone you like kissed you after a school event.',[
      CH('😍 Kiss back',{happiness:20,looks:2}),
      CH('😊 Smile shyly',{happiness:14}),
      CH('😳 Freeze',{happiness:5,stress:3}),
    ]),
    EV('🍺','neutral','House Party','A huge house party is happening while someone’s parents are away.',[
      CH('🚫 Stay sober',{happiness:-2,smarts:4,health:2}),
      CH('🕐 Leave early',{happiness:6,stress:-2}),
      CH('🍺 Drink too much',{happiness:11,health:-8,stress:-4}),
    ]),
    EV('📱','special','Post Goes Viral','One of your posts unexpectedly hit 100K views overnight.',[
      CH('📸 Lean into it',{happiness:14,looks:4,fame:16,money:650}),
      CH('😬 Keep low profile',{happiness:6,stress:-2}),
    ]),
    EV('😡','bad','Family Drama','Arguments at home are getting loud and constant.',[
      CH('💬 Try to mediate',{happiness:-5,smarts:4,stress:3}),
      CH('🏃 Stay at a friend’s',{happiness:-2,stress:-4}),
      CH('🚪 Hide in your room',{happiness:-11,stress:8}),
    ]),
    EV('🏆','special','Regional Championship','Your team made the regional finals.',[
      CH('💪 Give everything',{happiness:18,health:6,fitness:10}),
      CH('🤷 Play normally',{happiness:9,health:3}),
    ]),
    EV('📝','neutral','Final Exams','Your most important exams begin tomorrow.',[
      CH('📚 Study hard',{smarts:15,health:-5,stress:10}),
      CH('😴 Sleep properly',{health:7,smarts:2,stress:-3}),
      CH('🤫 Cheat sheet',{smarts:5,happiness:-8,karma:-5}),
    ]),
    EV('💔','bad','First Heartbreak','Someone you liked started dating another person.',[
      CH('🏋️ Channel pain at gym',{health:9,fitness:9,happiness:-4}),
      CH('💬 Talk it through',{happiness:-2,stress:-5}),
      CH('🍦 Comfort food binge',{happiness:-9,health:-5,fitness:-3}),
    ]),
    EV('🎓','special','Honor Roll','You made honor roll for the second year in a row.',[
      CH('🎉 Celebrate',{happiness:14,smarts:6}),
    ]),
    EV('💻','good','Discovered Coding','You found a free programming course online.',[
      CH('💻 Dive in',{smarts:14,happiness:6}),
      CH('🔖 Save for later',{smarts:2}),
    ]),
    EV('🛵','bad','Illegal Joyride','An older friend dares you to take a scooter without a licence.',[
      CH('🚫 Hard no',{smarts:2,karma:1}),
      CH('🛵 Do it',{happiness:12,health:-14,karma:-4}),
    ]),
    EV('🎤','neutral','Talent Show','Your friends dare you to perform at the school talent show.',[
      CH('🎤 Perform confidently',{happiness:14,looks:5,fame:7}),
      CH('👥 Help backstage',{happiness:5,karma:2}),
      CH('🪑 Just watch',{}),
    ]),
    EV('💅','neutral','Image Makeover','Your friends offer you a full style makeover.',[
      CH('✨ Embrace it',{looks:14,happiness:11}),
      CH('💙 Mix old and new',{looks:8,happiness:7}),
      CH('😬 Go back',{looks:-2}),
    ]),
    EV('🚀','special','Teen Entrepreneur','A product you built started selling online.',[
      CH('💼 Treat it seriously',{money:4200,smarts:8,happiness:11,stress:4}),
      CH('📦 Sell remaining stock',{money:1500,happiness:4}),
      CH('🙅 Stop there',{}),
    ]),
    EV('🎵','good','First Band Gig','Your band played its first real gig.',[
      CH('🎸 Rehearse daily',{happiness:14,smarts:4,fame:5}),
      CH('🍕 Just enjoy it',{happiness:15}),
    ]),
    EV('😰','bad','Panic Attack','You had a panic attack during class.',[
      CH('🏥 See counsellor',{happiness:7,health:5,stress:-10}),
      CH('🏠 Rest at home',{happiness:-2,health:4,stress:-4}),
      CH('😤 Hide it',{happiness:-10,health:-5,stress:9}),
    ]),
    EV('🚬','bad','Peer Pressure','Your friend group pressures you to try cigarettes.',[
      CH('🚫 Refuse',{health:3,smarts:2}),
      CH('🏃 Find better friends',{happiness:-4,smarts:4,karma:2}),
      CH('🚬 Try one',{health:-10,happiness:-3}),
    ]),
    EV('💸','neutral','First Part-Time Job','A local café wants to hire you for weekends.',[
      CH('☕ Take the job',{money:2500,smarts:5,happiness:7,stress:3}),
      CH('📚 Focus on school',{smarts:7,stress:-2}),
    ]),
    EV('📖','good','Reading Challenge','You read 25 books in a year.',[
      CH('📖 Go bigger',{smarts:13,happiness:9}),
    ]),
    EV('🏋️','good','Started Weight Training','You discovered you love lifting weights.',[
      CH('🏋️ Train hard',{health:11,fitness:15,looks:7}),
      CH('🚶 Casual training',{health:4,fitness:5}),
    ]),
    EV('✈️','good','Exchange Year','You can study abroad for a year.',[
      CH('✈️ Take the adventure',{happiness:22,smarts:11,looks:4,fame:6}),
      CH('🏠 Stay near family',{happiness:-3,stress:-2}),
    ]),
    EV('🔬','neutral','STEM Competition','You entered a regional STEM competition.',[
      CH('🏆 Push to win',{smarts:12,happiness:13,fame:4}),
      CH('🙂 Do your best',{smarts:6,happiness:4}),
    ]),
    EV('🎪','good','Summer Festival Job','You spent summer working at a music festival.',[
      CH('🎵 Embrace experience',{happiness:18,fame:5,looks:4,stress:-8}),
      CH('💰 Focus on money',{money:1800,happiness:8}),
    ]),
    EV('🎨','neutral','Youth Art Exhibition','Your art teacher submitted your work to an exhibition.',[
      CH('🖼️ Attend and network',{happiness:10,looks:4,fame:6}),
      CH('😊 Let it show',{happiness:5}),
    ]),
    // v21: new teen events
    EV('📱','neutral','Social Media Comparison','Scrolling through perfect lives online makes you feel inadequate.',[
      CH('📵 Take a week off screens',{happiness:10,stress:-8,mentalHealth:5}),
      CH('🤳 Post your own highlights',{happiness:6,fame:4,stress:2}),
      CH('📓 Journal about it',{happiness:8,smarts:3,stress:-4}),
    ]),
    EV('🛹','neutral','New Hobby','A friend introduced you to skateboarding and you are hooked.',[
      CH('🛹 Train seriously',{fitness:9,health:4,happiness:13,stress:-6}),
      CH('😊 Fun on weekends',{fitness:4,happiness:8}),
      CH('😬 Too risky',{happiness:-2}),
    ]),
    EV('🍳','good','Cooking Discovery','You tried making a meal from scratch and it turned out amazing.',[
      CH('👨‍🍳 Take cooking seriously',{happiness:12,health:5,smarts:3,stress:-5}),
      CH('😊 Keep it casual',{happiness:7,health:2}),
    ]),
    EV('🤝','neutral','Mentorship Offer','An older student offered to mentor you through tough coursework.',[
      CH('📚 Accept gratefully',{smarts:10,happiness:8,stress:-5}),
      CH('🙅 Handle it alone',{smarts:3,stress:4}),
    ]),
  ],

  adult:[
    EV('🎓','special','Graduation Day','You crossed the stage and received your diploma.',[
      CH('🎉 Celebrate hard',{happiness:20,stress:-12}),
      CH('🧳 Plan next steps',{happiness:10,smarts:5}),
    ]),
    EV('💒','special','Surprise Proposal','Your partner dropped to one knee with a ring.',[
      CH('💍 Say yes',{happiness:28}),
      CH('😟 Ask for time',{happiness:-8,stress:5}),
    ]),
    EV('💼','special','Dream Job Offer','A recruiter offered you a role paying much more than your current job.',[
      CH('📞 Take the meeting',{money:12000,happiness:12,stress:3}),
      CH('🙅 Stay loyal',{happiness:5,karma:1}),
    ]),
    EV('🚗','bad','Fender Bender','You rear-ended someone at a red light.',[
      CH('🏥 Handle responsibly',{health:-3,money:-3000,stress:7}),
      CH('😰 Exchange details',{money:-1600,stress:5}),
      CH('🏃 Drive away',{happiness:-20,money:-9000,karma:-10}),
    ]),
    EV('🤒','bad','Serious Illness','A normal cold escalated into a hospital stay.',[
      CH('🏥 Full treatment',{health:-6,money:-5500,stress:10}),
      CH('💊 Basic treatment',{health:-12,money:-900}),
      CH('🏡 Manage at home',{health:-22,stress:6}),
    ]),
    EV('💸','bad','Tax Investigation','The tax authority says you owe unpaid taxes.',[
      CH('💳 Pay immediately',{money:-4500,happiness:-6,stress:8}),
      CH('📋 Hire accountant',{money:-1500,happiness:3,smarts:2}),
      CH('🙅 Ignore letters',{money:-10000,happiness:-18,stress:16}),
    ]),
    EV('🏆','special','Employee of the Year','Your boss praised you at the company gala.',[
      CH('🎉 Accept proudly',{money:8500,happiness:22,looks:3,fame:3}),
    ]),
    EV('🎰','neutral','Vegas Trip','Friends booked a last-minute Vegas trip.',[
      CH('🍸 Go but stay disciplined',{happiness:12,money:-1200,stress:-5}),
      CH('🎰 Go all in',{happiness:16,money:-7000}),
      CH('🏠 Stay home',{}),
    ]),
    EV('🌴','good','Dream Vacation','You finally booked a trip you have wanted for years.',[
      CH('✈️ Luxury version',{happiness:25,health:7,money:-9000,stress:-18}),
      CH('🎒 Budget version',{happiness:15,money:-2500,stress:-10}),
    ]),
    EV('🔥','bad','Kitchen Fire','A grease fire spread fast through your kitchen.',[
      CH('🚒 Call fire department',{money:-4500,stress:12}),
      CH('🧯 Fight it yourself',{health:-15,money:-1400}),
      CH('🏃 Barely escape',{health:-8,money:-22000,stress:18}),
    ]),
    EV('📈','neutral','Hot Stock Tip','A coworker insists a certain stock is about to explode.',[
      CH('📊 Research first',{smarts:5,stress:-2}),
      CH('📈 Invest blindly',{money:4000,happiness:6}),
      CH('🙅 Ignore it',{}),
    ]),
    EV('👴','bad','Ageing Parent Crisis','One of your parents needs serious support.',[
      CH('🏥 Pay for better care',{happiness:-8,money:-12000,karma:8,stress:6}),
      CH('🏡 Move them in',{happiness:-5,money:-3500,karma:5,stress:8}),
      CH('😰 Emotional support only',{happiness:-14,stress:5}),
    ]),
    EV('🎁','special','Lottery Prize','You bought a ticket on impulse and won a real prize.',[
      CH('🎉 Claim it',{money:18000,happiness:24}),
    ]),
    EV('🏃','neutral','Marathon Challenge','Your gym partner dared you to run a marathon.',[
      CH('🏃 Train properly',{health:16,fitness:20,happiness:14,stress:5}),
      CH('🚶 Casual walk-run',{health:8,fitness:8}),
      CH('🙅 Not happening',{}),
    ]),
    EV('💡','neutral','Business Idea','A strong business idea hit you out of nowhere.',[
      CH('🌙 Build after work',{money:-3500,smarts:7,stress:4}),
      CH('💼 Quit and go all in',{money:-17000,happiness:15,stress:12}),
      CH('🙅 Too risky now',{}),
    ]),
    EV('🤝','good','Powerful Mentor','A successful person offered to mentor you.',[
      CH('🌟 Accept gratefully',{smarts:14,money:7000,happiness:11,karma:4}),
      CH('🙂 Keep it casual',{smarts:6,happiness:5}),
    ]),
    EV('🐕','good','Rescue Dog','A dog at the shelter stole your heart.',[
      CH('🐕 Adopt immediately',{happiness:22,money:-900,karma:5}),
      CH('😢 Walk away',{happiness:-9}),
    ]),
    EV('💻','good','Remote Work Offer','Your company offered full-time remote work.',[
      CH('🏠 Accept',{happiness:16,health:7,stress:-10}),
      CH('🏢 Stay in office',{happiness:4}),
    ]),
    EV('🔑','special','Director Promotion','The board wants to promote you to director level.',[
      CH('💪 Accept',{money:19000,happiness:14,stress:9}),
      CH('🙅 Decline',{money:3500,happiness:2,stress:-3}),
    ]),
    EV('📉','bad','Market Crash','Markets dropped sharply in a global panic.',[
      CH('💎 Hold steady',{money:-6000,happiness:-4,smarts:4}),
      CH('🔄 Buy the dip',{money:-9000,smarts:6,stress:4}),
      CH('💸 Panic sell',{money:-22000,happiness:-12,stress:8}),
    ]),
    EV('🌿','good','Garden Project','You planted tomatoes and somehow built a thriving garden.',[
      CH('🌱 Tend it weekly',{happiness:14,health:8,fitness:4,stress:-6}),
      CH('🥗 Cook fresh meals',{happiness:11,health:7}),
    ]),
    EV('🎤','neutral','Conference Keynote','Your company asked you to speak to 500 professionals.',[
      CH('💪 Prepare hard',{smarts:8,happiness:12,fame:9,stress:4}),
      CH('😰 Wing it',{happiness:3,stress:8}),
      CH('🤢 Avoid it',{happiness:-8,stress:5}),
    ]),
    EV('🏠','good','Property Value Surge','Your neighbourhood became desirable and property values jumped.',[
      CH('🏠 Keep equity',{happiness:10}),
      CH('💰 Sell at peak',{money:60000,happiness:16}),
    ]),
    EV('🚀','special','Side Hustle Takes Off','A small project started generating real money.',[
      CH('🔥 Go all in',{money:30000,happiness:20,stress:8}),
      CH('⚖️ Keep both running',{money:14000,smarts:7,stress:5}),
    ]),
    EV('😤','bad','Mid-Life Crisis','You turned 42 and questioned every major life choice.',[
      CH('💭 Reflect deeply',{happiness:6,smarts:5,stress:-8}),
      CH('🧘 Meditation retreat',{happiness:12,money:-1500,stress:-15}),
      CH('🏎️ Buy impulsively',{happiness:8,money:-15000}),
    ]),
    EV('🌟','good','Life Clarity Moment','A quiet moment made you rethink what actually matters.',[
      CH('🌱 Restructure priorities',{happiness:16,smarts:8,stress:-15}),
      CH('📓 Journal it',{happiness:11,smarts:5,stress:-7}),
    ]),
    EV('🏆','special','Industry Award','You received a respected award in your field.',[
      CH('🎉 Enjoy spotlight',{happiness:20,fame:12,looks:3}),
      CH('🙏 Stay humble',{happiness:14,fame:8,karma:3}),
    ]),
    EV('👼','special','Unexpected Inheritance','A distant relative left you money in their will.',[
      CH('💰 Invest it',{money:35000,happiness:12,smarts:3}),
      CH('🎉 Enjoy it',{money:15000,happiness:22}),
      CH('🤲 Donate half',{money:17500,happiness:18,karma:12}),
    ]),
    EV('🏔️','neutral','Solo Adventure','You have a chance to tackle a major mountain trek alone.',[
      CH('🧗 Challenge yourself',{happiness:22,health:12,fitness:16,stress:-14}),
      CH('👥 Guided group',{happiness:16,health:8}),
      CH('🏠 Too risky',{}),
    ]),
    EV('📜','neutral','Legal Battle','A contract dispute escalated into a court case.',[
      CH('⚖️ Top lawyer',{money:-18000,happiness:-8,stress:14}),
      CH('🤝 Settle',{money:-6000,stress:6}),
      CH('🙅 Represent yourself',{money:-2000,happiness:-14,stress:18}),
    ]),
    EV('🧬','neutral','Genetic Discovery','A DNA test revealed a health predisposition.',[
      CH('🏥 See specialist',{health:10,money:-4000,smarts:2}),
      CH('🌿 Lifestyle overhaul',{health:7,fitness:8,stress:-4}),
      CH('😶 Ignore it',{health:-5}),
    ]),
    EV('📰','bad','Tabloid Story','A journalist wants to run an unflattering story about you.',[
      CH('📣 Speak truth',{fame:10,happiness:7,stress:10}),
      CH('😶 Say nothing',{fame:-7,happiness:-5}),
      CH('💰 Pay to kill story',{money:-8000,fame:-5,happiness:4}),
    ]),
    EV('🧘','good','Wellness Retreat','A luxury wellness retreat opened a discounted slot.',[
      CH('🌿 Full immersion',{happiness:22,health:12,stress:-24,looks:5,money:-2500}),
      CH('💻 Work remotely there',{happiness:10,stress:-8,money:-1000}),
      CH('🏠 Too expensive',{}),
    ]),
    EV('💸','bad','Identity Theft','Someone stole your identity and opened debts in your name.',[
      CH('🚔 Report and freeze accounts',{money:-3000,happiness:-9,stress:14}),
      CH('🧑‍💻 Handle it yourself',{money:-8000,happiness:-13,stress:18}),
      CH('💳 Pay everything',{money:-12000,happiness:-8,stress:8}),
    ]),
    // v21: new adult events
    EV('🧘','good','Wellness Retreat','A wellness retreat advertisement caught your eye.',[
      CH('🌿 Book the full retreat',{happiness:22,stress:-20,health:8,money:-1800}),
      CH('🧘 Try local classes',{happiness:12,stress:-10,money:-200}),
      CH('📵 Ignore it',{}),
    ]),
    EV('🎂','special','Milestone Birthday','You just turned 40. Friends threw you a surprise party.',[
      CH('🎉 Party hard',{happiness:22,stress:-8,fame:4}),
      CH('🪞 Reflect quietly',{happiness:14,smarts:4}),
      CH('😔 Feel old',{happiness:-6,stress:5}),
    ]),
    EV('📉','bad','Market Crash','The economy dipped sharply and your savings took a hit.',[
      CH('🧮 Rebalance portfolio',{money:-8000,smarts:5,stress:8}),
      CH('😰 Panic sell',{money:-15000,stress:14}),
      CH('🧘 Ride it out',{stress:6}),
    ]),
    EV('🧑‍🤝‍🧑','good','Old Friend Reconnects','Someone you lost touch with reached out after ten years.',[
      CH('☕ Meet for coffee',{happiness:16,stress:-6,karma:3}),
      CH('💬 Catch up online',{happiness:10,stress:-3}),
      CH('🙅 Too busy right now',{happiness:-2}),
    ]),
    EV('🏆','special','Personal Record','You smashed a personal fitness goal you set two years ago.',[
      CH('💪 Train even harder',{fitness:10,health:6,happiness:16}),
      CH('🎉 Celebrate the moment',{happiness:14,stress:-8}),
    ]),
  ],

  elder:[
    EV('🦴','bad','Joint Pain','Your knees and back are painful every day.',[
      CH('🏥 Specialist',{health:11,money:-5500}),
      CH('🧘 Physiotherapy',{health:7,money:-1500,fitness:3}),
      CH('💊 Painkillers only',{health:-8}),
    ]),
    EV('🎊','special','Retirement Day','After decades of work, today is your last day at the office.',[
      CH('🎉 Retire joyfully',{happiness:26,stress:-20}),
      CH('💼 Work more',{money:11000,happiness:-4,stress:4}),
    ]),
    EV('👴','special','First Grandchild','Your child just had a baby. You are a grandparent.',[
      CH('😍 Celebrate',{happiness:30}),
    ]),
    EV('🏡','neutral','Downsizing Decision','The family home feels too large now.',[
      CH('🏡 Sell and downsize',{happiness:11,money:90000}),
      CH('🏰 Keep memories',{money:-4500,happiness:4}),
    ]),
    EV('🧓','bad','Memory Concerns','You are forgetting names, dates and simple things.',[
      CH('🏥 Neurologist',{health:8,money:-5500,stress:-2}),
      CH('🧩 Brain training',{health:5,smarts:4}),
      CH('😰 Ignore it',{health:-17,stress:8}),
    ]),
    EV('🌅','good','World Travel Dream','Retirement gives you time to see the world.',[
      CH('✈️ Grand tour',{happiness:36,health:9,money:-32000}),
      CH('🗺️ Local adventures',{happiness:17,money:-3500}),
    ]),
    EV('🎨','good','Creative Awakening','You discovered a passion for painting.',[
      CH('🎨 Classes',{happiness:19,smarts:7,looks:2}),
      CH('🖼️ Paint freely',{happiness:14,stress:-5}),
    ]),
    EV('🌳','good','Community Volunteering','A local charity needs weekly volunteers.',[
      CH('🤲 Give back',{happiness:19,health:8,karma:8}),
      CH('🏠 Rest instead',{}),
    ]),
    EV('👨‍👩‍👧','special','Family Reunion','Three generations gathered together.',[
      CH('🥰 Cherish it',{happiness:24}),
      CH('😊 Enjoy quietly',{happiness:14}),
    ]),
    EV('🏅','special','Lifetime Achievement','Your community honoured your life’s work.',[
      CH('🙏 Accept humbly',{happiness:28,fame:11,karma:5}),
    ]),
    EV('💊','bad','Daily Medications','Your doctor prescribed several daily medications.',[
      CH('💊 Take them properly',{health:11,money:-1500}),
      CH('🙅 Skip some',{health:-16}),
    ]),
    EV('📖','good','Memoirs','Your family encouraged you to write your life story.',[
      CH('📖 Write it',{happiness:17,smarts:7,fame:3}),
      CH('🎙️ Record audio',{happiness:13}),
    ]),
    EV('🌻','good','Senior Fitness Class','A senior fitness class opened nearby.',[
      CH('🏃 Join often',{health:11,fitness:13,happiness:10}),
      CH('🧘 Gentle yoga',{health:7,fitness:5,stress:-5}),
    ]),
    EV('🎓','special','Honorary Degree','A university offered you an honorary doctorate.',[
      CH('🎓 Accept honour',{happiness:22,fame:14}),
    ]),
    EV('💝','special','Letter from Your Child','Your grown child wrote a heartfelt letter about what you meant to them.',[
      CH('😭 Read with tears',{happiness:24}),
      CH('💌 Frame it',{happiness:18}),
    ]),
    EV('🌿','good','Garden of a Lifetime','Your garden became the most admired on the street.',[
      CH('🌸 Enter contest',{happiness:16,fame:7}),
      CH('🍅 Grow vegetables',{happiness:12,health:6}),
    ]),
    EV('📻','neutral','Radio Interview','A local station wants to interview you about your life.',[
      CH('🎙️ Share honestly',{happiness:14,fame:10}),
      CH('😊 Keep it warm',{happiness:10,fame:6}),
    ]),
    EV('🎸','good','Music Comes Back','You picked up an old instrument and the music returned.',[
      CH('🎸 Play daily',{happiness:18,smarts:5,stress:-12}),
      CH('🎵 Join senior band',{happiness:22,fame:5,health:5}),
    ]),
    EV('🌍','good','Reconnect with Old World','Social media helped you reconnect with old friends abroad.',[
      CH('✈️ Visit them',{happiness:24,money:-4000,health:6}),
      CH('📹 Weekly video calls',{happiness:14}),
    ]),
    EV('🕯️','neutral','Quiet Reflection','A calm evening makes you reflect on everything you have survived.',[
      CH('🙏 Feel grateful',{happiness:16,stress:-10,karma:3}),
      CH('📓 Write it down',{happiness:12,smarts:4}),
    ]),
  ],
};