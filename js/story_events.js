/* js/story_events.js - LifeSim v9 - fully local story moments */
const StoryEvents = {
  _cooldown: 0,

  canUse(){
    const G=window.G;
    if(!G||G.age<10)return false;
    return G.age-this._cooldown>=3;
  },

  yearsUntil(){
    const G=window.G;
    if(!G)return 3;
    if(G.age<10)return 10-G.age;
    return Math.max(0,3-(G.age-this._cooldown));
  },

  generate(){
    const G=window.G;
    if(!G)return;
    if(!this.canUse()){
      UI.toast(`Story Moment available in ${this.yearsUntil()} year${this.yearsUntil()!==1?'s':''}.`);
      return;
    }

    this._cooldown=G.age;
    const evt=this._build(G);
    Engine.log(`\u2728 Story Moment: "${evt.title}"`,'special');
    UI.showEvent(evt,()=>{});
  },

  _build(G){
    const ctx=this._context(G);
    const pool=[
      ...this._personalEvents(G,ctx),
      ...this._careerEvents(G,ctx),
    ];

    if(G.age>=18&&G.rels?.partner&&G.rels.partner.age>=18){
      pool.push(...this._romanceEvents(G,ctx,G.rels.partner));
    }else if(G.age>=18&&!G.rels?.partner){
      pool.push(...this._singleAdultEvents(G,ctx));
    }

    return pick(pool)||this._fallback(G,ctx);
  },

  _context(G){
    const career=G.career?G.career.title:(G.retired?'retirement':'the search for steady work');
    const country=G.country?.name||'your country';
    const partner=G.rels?.partner;
    const relationship=partner?(partner.married?`your marriage to ${partner.name}`:`your relationship with ${partner.name}`):'single life';
    const pressure=(G.stress||0)>65?'a heavy season':(G.happiness||0)>75?'a bright season':'an ordinary stretch';
    return{career,country,partner,relationship,pressure};
  },

  _personalEvents(G,c){
    return[
      {
        icon:'\u2728',type:'special',title:'Quiet Turning Point',
        text:`At ${G.age}, during ${c.pressure} in ${c.country}, ${G.name} notices a pattern: the choices that look small are shaping the whole life. Money, health, love, and ambition all feel connected for once.`,
        choices:[
          {t:'Write a clear plan',e:{smarts:5,happiness:6,stress:-6}},
          {t:'Focus on peace first',e:{happiness:9,health:3,stress:-10}},
          {t:'Chase a bold change',e:{happiness:5,stress:8,fame:2}},
        ],
      },
      {
        icon:'\uD83D\uDCDC',type:'neutral',title:'Old Message',
        text:`An old message from years ago resurfaces. It reminds ${G.name} of a promise, a mistake, and a version of life that almost happened. The moment feels strangely useful instead of sad.`,
        choices:[
          {t:'Reply with honesty',e:{happiness:7,karma:3,stress:-3}},
          {t:'Keep it as a lesson',e:{smarts:5,happiness:4}},
          {t:'Delete it and move on',e:{stress:-8,happiness:2}},
        ],
      },
      {
        icon:'\uD83C\uDF31',type:'good',title:'Health Wake-Up',
        text:`A normal day suddenly makes ${G.name} aware of the body behind every dream. Energy, sleep, food, and stress have been quietly writing their own story.`,
        choices:[
          {t:'Build a better routine',e:{health:8,fitness:5,stress:-6}},
          {t:'Start with small habits',e:{health:4,happiness:5,stress:-4}},
          {t:'Ignore it for now',e:{health:-4,stress:3}},
        ],
      },
    ];
  },

  _careerEvents(G,c){
    return[
      {
        icon:'\uD83D\uDCBC',type:'neutral',title:'A Real Conversation',
        text:`Someone asks ${G.name} a blunt question about ${c.career}: is this still ambition, or just momentum? The answer is uncomfortable, but useful.`,
        choices:[
          {t:'Ask for better terms',e:{money:sc(2500),smarts:3,stress:4}},
          {t:'Protect work-life balance',e:{happiness:7,health:3,stress:-8}},
          {t:'Double down on success',e:{fame:4,money:sc(5000),stress:9}},
        ],
      },
      {
        icon:'\uD83D\uDD0D',type:'good',title:'Hidden Opportunity',
        text:`A quiet opportunity appears through ${G.name}'s network. It is not glamorous, but it could make life in ${c.country} more stable if handled carefully.`,
        choices:[
          {t:'Research every detail',e:{smarts:7,money:sc(1200)}},
          {t:'Take the chance',e:{money:sc(7000),happiness:5,stress:6}},
          {t:'Pass politely',e:{happiness:3,stress:-4}},
        ],
      },
    ];
  },

  _romanceEvents(G,c,p){
    return[
      {
        icon:'\uD83D\uDC8C',type:'love',title:'Honest Night In',
        text:`After a long day, ${p.name} asks for a real conversation about ${c.relationship}. No drama, no performance, just two adults trying to feel chosen and understood.`,
        choices:[
          {t:'Listen without defending',e:{partnerLove:10,partnerIntimacy:7,happiness:7,stress:-8,karma:2}},
          {t:'Make romantic plans',e:{partnerLove:7,partnerIntimacy:5,happiness:9,money:-sc(250)}},
          {t:'Avoid the topic',e:{partnerLove:-8,partnerIntimacy:-5,stress:6}},
        ],
      },
      {
        icon:'\uD83C\uDF77',type:'love',title:'Slow Evening',
        text:`The night turns soft: dinner, music, quiet jokes, and the kind of eye contact that says more than flirting. With ${p.name}, the attraction feels strongest when it has patience, consent, and real affection behind it.`,
        choices:[
          {t:'Stay wrapped up together',e:{partnerLove:8,partnerIntimacy:10,happiness:10,stress:-10}},
          {t:'Share secret desires',e:{partnerLove:5,partnerIntimacy:10,karma:4,safeDating:4}},
          {t:'Let stress ruin the mood',e:{partnerLove:-4,partnerIntimacy:-6,stress:5}},
        ],
      },
      {
        icon:'\uD83D\uDD25',type:'love',title:'Private Chemistry',
        text:`A casual touch from ${p.name} changes the whole mood. The evening becomes teasing, affectionate, and quietly intense, with both of you checking in and choosing each other on purpose.`,
        choices:[
          {t:'Let the night unfold',e:{partnerLove:7,partnerIntimacy:12,happiness:12,stress:-7}},
          {t:'Keep it playful',e:{partnerLove:5,partnerIntimacy:7,happiness:8}},
          {t:'Pull back gently',e:{partnerLove:2,stress:-4}},
        ],
      },
      {
        icon:'\uD83C\uDFE0',type:'special',title:'Next Step Question',
        text:`${p.name} brings up the future: routines, home, money, family, and what commitment should look like now. It feels romantic because it is practical, not because it is perfect.`,
        choices:[
          {t:'Plan the future together',e:{partnerLove:9,partnerIntimacy:5,happiness:8,smarts:3}},
          {t:'Suggest moving in',e:{partnerLove:7,partnerIntimacy:4,happiness:5,stress:-4}},
          {t:'Keep things casual',e:{partnerLove:-6,happiness:3}},
        ],
      },
    ];
  },

  _singleAdultEvents(G,c){
    return[
      {
        icon:'\uD83D\uDC98',type:'love',title:'Unexpected Chemistry',
        text:`While living ${c.relationship}, ${G.name} meets someone with easy charm and adult confidence. There is chemistry, but also the question of what kind of connection is actually wanted.`,
        choices:[
          {t:'Ask for a real date',e:{happiness:9,stress:-3}},
          {t:'Enjoy a careful flirt',e:{happiness:6,looks:2}},
          {t:'Choose solitude tonight',e:{happiness:3,smarts:2,stress:-6}},
        ],
      },
      {
        icon:'\uD83C\uDF19',type:'neutral',title:'Single By Choice',
        text:`A quiet evening alone feels less like loneliness and more like ownership. ${G.name} realizes romance should add to life, not rescue it.`,
        choices:[
          {t:'Raise your standards',e:{happiness:7,smarts:4,karma:2}},
          {t:'Update dating profile',e:{happiness:5,looks:3,stress:2}},
          {t:'Take a social break',e:{health:3,stress:-8}},
        ],
      },
    ];
  },

  _fallback(G,c){
    return{
      icon:'\u2728',type:'special',title:'A Clear Moment',
      text:`${G.name} pauses and sees life in ${c.country} with unusual clarity. Nothing magical happens. That is what makes it feel real: a normal day becomes a chance to choose better.`,
      choices:[
        {t:'Choose gratitude',e:{happiness:10,stress:-6,karma:2}},
        {t:'Make one practical change',e:{smarts:4,health:3}},
        {t:'Keep moving',e:{stress:2}},
      ],
    };
  },
};

window.StoryEvents=StoryEvents;
