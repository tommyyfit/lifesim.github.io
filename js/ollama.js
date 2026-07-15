/* LifeSim v24 — optional local Ollama storyteller. Core simulation never depends on AI. */
const OllamaBridge={
  STORAGE_KEY:'lifesim_v24_ollama',
  defaults:{
    enabled:false,
    endpoint:'http://localhost:11434',
    model:'',
    temperature:0.65,
    yearNarratives:true,
    aiMoments:true,
    timeoutMs:20000
  },
  config:null,
  status:{state:'off',message:'Local AI is off',models:[],busy:false,lastTest:0},

  init(){
    this.load();
    this.patchSettings();
    this.updateSettingsUI();
  },

  load(){
    let saved={};
    try{saved=JSON.parse(localStorage.getItem(this.STORAGE_KEY)||'{}')||{};}catch(_){saved={};}
    this.config={...this.defaults,...saved};
    this.config.enabled=this.config.enabled===true;
    this.config.endpoint=this.normalizeEndpoint(this.config.endpoint);
    this.config.temperature=Math.max(0,Math.min(1.2,Number(this.config.temperature)||this.defaults.temperature));
    this.config.timeoutMs=Math.max(5000,Math.min(60000,Number(this.config.timeoutMs)||this.defaults.timeoutMs));
    this.status.state=this.config.enabled?'idle':'off';
    this.status.message=this.config.enabled?'Ready to test local Ollama':'Local AI is off';
    return this.config;
  },

  save(){
    try{localStorage.setItem(this.STORAGE_KEY,JSON.stringify(this.config));}catch(_){ }
    this.updateSettingsUI();
  },

  normalizeEndpoint(value){
    const raw=String(value||this.defaults.endpoint).trim().replace(/\/+$/,'');
    if(!/^https?:\/\//i.test(raw))return this.defaults.endpoint;
    return raw;
  },

  setEnabled(value){
    this.config.enabled=!!value;
    this.status.state=this.config.enabled?'idle':'off';
    this.status.message=this.config.enabled?'Ready to test local Ollama':'Local AI is off';
    this.save();
    const panel=document.getElementById('ollama-config-panel');
    if(panel)panel.hidden=!this.config.enabled;
    if(this.config.enabled)this.refreshModels(false);
  },

  setEndpoint(value){
    this.config.endpoint=this.normalizeEndpoint(value);
    this.status.state='idle';
    this.status.message='Endpoint changed — test the connection';
    this.save();
  },

  setModel(value){this.config.model=String(value||'').trim();this.save();},
  setTemperature(value){this.config.temperature=Math.max(0,Math.min(1.2,Number(value)||0.65));this.save();},
  setTimeout(value){this.config.timeoutMs=Math.max(5000,Math.min(60000,Number(value)||20000));this.status.state=this.config.enabled?'idle':'off';this.status.message=this.config.enabled?'Timeout changed — test the connection':'Local AI is off';this.save();},
  setOption(key,value){if(key in this.defaults){this.config[key]=!!value;this.save();}},

  patchSettings(){
    if(typeof UI==='undefined'||UI._v24OllamaPatched)return;
    UI._v24OllamaPatched=true;
    const oldOpen=UI.openSettings?.bind(UI);
    if(oldOpen){
      UI.openSettings=()=>{const out=oldOpen();setTimeout(()=>this.updateSettingsUI(),0);return out;};
    }
  },

  updateSettingsUI(){
    const set=(id,prop,value)=>{const el=document.getElementById(id);if(el)el[prop]=value;};
    set('set-ollama','checked',!!this.config?.enabled);
    set('set-ollama-endpoint','value',this.config?.endpoint||this.defaults.endpoint);
    set('set-ollama-model','value',this.config?.model||'');
    set('set-ollama-temp','value',String(this.config?.temperature??0.65));
    set('set-ollama-timeout','value',String(this.config?.timeoutMs??20000));
    set('set-ollama-year','checked',this.config?.yearNarratives!==false);
    set('set-ollama-moments','checked',this.config?.aiMoments!==false);
    const panel=document.getElementById('ollama-config-panel');if(panel)panel.hidden=!this.config?.enabled;
    const guide=document.getElementById('ollama-off-guide');if(guide)guide.hidden=!!this.config?.enabled;
    const badge=document.getElementById('ollama-status');
    if(badge){
      badge.dataset.state=this.status.state;
      badge.textContent=this.status.busy?'Working…':this.status.message;
    }
    const btns=document.querySelectorAll('[data-ollama-action]');btns.forEach(btn=>btn.disabled=!!this.status.busy);
    const select=document.getElementById('set-ollama-model');
    if(select&&this.status.models.length){
      const previous=this.config.model;
      select.innerHTML='<option value="">Auto-select installed model</option>'+this.status.models.map(m=>`<option value="${this.esc(m.name)}">${this.esc(m.name)}${m.size?` · ${this.humanSize(m.size)}`:''}</option>`).join('');
      select.value=previous||'';
    }
  },

  esc(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));},
  humanSize(bytes){const n=Number(bytes)||0;if(n>=1e9)return`${(n/1e9).toFixed(1)} GB`;if(n>=1e6)return`${(n/1e6).toFixed(0)} MB`;return'';},

  async fetchJSON(path,options={}){
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),this.config.timeoutMs);
    try{
      const headers={...(options.headers||{})};
      if(options.body&&!Object.keys(headers).some(k=>k.toLowerCase()==='content-type'))headers['Content-Type']='application/json';
      const res=await fetch(`${this.config.endpoint}${path}`,{...options,signal:controller.signal,headers});
      if(!res.ok)throw new Error(`Ollama returned HTTP ${res.status}`);
      return await res.json();
    }catch(err){
      if(err?.name==='AbortError')throw new Error('Ollama request timed out');
      throw err;
    }finally{clearTimeout(timer);}
  },

  friendlyError(error){
    const msg=String(error?.message||error||'Connection failed');
    if(location.protocol==='file:')return'Open LifeSim with start_lifesim.bat or start_lifesim.command so the browser can reach Ollama safely.';
    if(/Failed to fetch|NetworkError|Load failed/i.test(msg))return'Ollama is not reachable. Start Ollama, confirm the endpoint, then test again.';
    if(/timed out/i.test(msg))return'Ollama took too long to respond. Try a smaller installed model.';
    return msg;
  },

  async refreshModels(showToast=true){
    if(!this.config.enabled)return false;
    this.status.busy=true;this.status.state='testing';this.status.message='Checking local models…';this.updateSettingsUI();
    try{
      const data=await this.fetchJSON('/api/tags',{method:'GET',headers:{}});
      this.status.models=(data.models||[]).map(m=>({name:m.name||m.model,size:m.size||0})).filter(m=>m.name);
      if(!this.config.model&&this.status.models.length)this.config.model=this.pickModel(this.status.models).name;
      this.status.state='ready';
      this.status.message=this.status.models.length?`${this.status.models.length} local model${this.status.models.length===1?'':'s'} found`:'Ollama works, but no model is installed';
      this.status.lastTest=Date.now();this.save();
      if(showToast)UI?.toast?.(this.status.message,this.status.models.length?'good':'neutral');
      return true;
    }catch(err){
      this.status.state='error';this.status.message=this.friendlyError(err);
      if(showToast)UI?.toast?.(this.status.message,'bad');
      return false;
    }finally{this.status.busy=false;this.updateSettingsUI();}
  },

  pickModel(models){
    const scored=[...models].map(m=>{
      const name=m.name.toLowerCase();let score=0;
      if(/1b|2b|3b|4b/.test(name))score+=10;
      if(/instruct|chat/.test(name))score+=5;
      if(/embed/.test(name))score-=100;
      if(m.size&&m.size<7e9)score+=4;
      return{...m,score};
    }).sort((a,b)=>b.score-a.score||a.size-b.size);
    return scored[0]||models[0];
  },

  async testConnection(){
    const ok=await this.refreshModels(false);
    if(!ok){UI?.toast?.(this.status.message,'bad');return false;}
    if(!this.status.models.length){UI?.toast?.('Ollama is running, but install at least one chat model first.','neutral');return false;}
    try{
      this.status.busy=true;this.status.state='testing';this.status.message='Running a short model test…';this.updateSettingsUI();
      const reply=await this.chat([
        {role:'system',content:'Reply with exactly: LifeSim local AI ready'},
        {role:'user',content:'Connection test'}
      ],{temperature:0,maxTokens:24});
      this.status.state='ready';this.status.message='Connected · local AI ready';
      UI?.toast?.(/lifesim/i.test(reply)?'Ollama connected successfully.':'Ollama responded successfully.','good');
      return true;
    }catch(err){this.status.state='error';this.status.message=this.friendlyError(err);UI?.toast?.(this.status.message,'bad');return false;}
    finally{this.status.busy=false;this.updateSettingsUI();}
  },

  async chat(messages,opts={}){
    if(!this.config.enabled)throw new Error('Local AI is disabled');
    if(!this.config.model){
      const ok=await this.refreshModels(false);
      if(!ok||!this.config.model)throw new Error('No installed Ollama model is available');
    }
    const body={
      model:this.config.model,
      messages,
      stream:false,
      keep_alive:'5m',
      options:{temperature:opts.temperature??this.config.temperature,num_predict:opts.maxTokens||500}
    };
    const data=await this.fetchJSON('/api/chat',{method:'POST',body:JSON.stringify(body)});
    const content=data?.message?.content;
    if(!content)throw new Error('Ollama returned an empty response');
    return String(content).trim();
  },

  parseJSON(text){
    let raw=String(text||'').trim();
    raw=raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');
    const first=raw.indexOf('{'),last=raw.lastIndexOf('}');
    if(first>=0&&last>first)raw=raw.slice(first,last+1);
    return JSON.parse(raw);
  },

  compactContext(G){
    const stage=window.LifeSimV24?.stageFor?.(G.age)||{label:'Life'};
    const rels=window.LifeSimV24?.importantPeople?.(G)||[];
    const recent=(G.log||[]).slice(0,7).map(x=>String(x.text||'').replace(/\s+/g,' ').slice(0,150));
    return{
      name:G.name,age:G.age,stage:stage.label,country:G.country?.name||'Unknown',
      happiness:G.happiness,health:G.health,mentalHealth:G.mentalHealth,stress:G.stress,
      money:G.age<18?'family-managed':Math.round(G.money||0),career:G.career?.title||null,
      education:G.education||G.educLevel||null,partner:G.rels?.partner?.name||null,children:(G.rels?.children||[]).length,
      personality:G.v24?.personality||{},importantPeople:rels.slice(0,4).map(p=>({name:p.name,role:p.role,trust:p.trust,closeness:p.closeness,conflict:p.conflict})),
      priorities:(G.v24?.annualPlan?.priorities||[]).map(p=>p.title),recent
    };
  },

  async generateYearNarrative(G,recap){
    if(!this.config.enabled||!this.config.yearNarratives)return null;
    try{
      const context=this.compactContext(G);
      const prompt=`Write a grounded LifeSim yearly recap in 55-90 words. The character is age ${G.age}; keep everything age-appropriate. Use only facts in the JSON. Do not invent deaths, marriages, money, diagnoses, crimes, jobs, children or outcomes. Mention one emotional theme and one practical next step. No headings, no bullet list.\nCONTEXT=${JSON.stringify(context)}\nYEAR_DATA=${JSON.stringify(recap)}`;
      return await this.chat([{role:'system',content:'You are a careful life-simulation narrator. Never override game facts or invent major events.'},{role:'user',content:prompt}],{temperature:0.55,maxTokens:180});
    }catch(err){
      this.status.state='error';this.status.message=this.friendlyError(err);this.updateSettingsUI();
      return null;
    }
  },

  async generateMoment(G){
    if(!this.config.enabled||!this.config.aiMoments)throw new Error('AI moments are disabled');
    const context=this.compactContext(G);
    const allowed='happiness, health, smarts, fitness, stress, karma, reputation, mentalHealth';
    const prompt=`Create one realistic, age-appropriate LifeSim moment for this character. Return ONLY JSON with this exact shape: {"icon":"emoji","title":"short title","text":"2-3 grounded sentences","choices":[{"label":"2-5 words","sub":"short consequence hint","effects":{"happiness":integer}}]}. Include exactly 3 choices. Effects may use only ${allowed}; each value must be an integer from -6 to 6. No guaranteed success, no explicit sexual content, no adult system for minors, no money rewards, no medical diagnosis, no death, no crime for under 18, and no new marriage/job/child/property. Make choices meaningfully different. Context: ${JSON.stringify(context)}`;
    const raw=await this.chat([{role:'system',content:'You create safe, grounded branching events for a life simulation. Output valid JSON only.'},{role:'user',content:prompt}],{temperature:this.config.temperature,maxTokens:500});
    return this.validateMoment(this.parseJSON(raw),G);
  },

  validateMoment(obj,G){
    if(!obj||typeof obj!=='object')throw new Error('AI event was not valid JSON');
    const allowed=new Set(['happiness','health','smarts','fitness','stress','karma','reputation','mentalHealth']);
    const clean={icon:String(obj.icon||'✨').slice(0,4),title:String(obj.title||'A Life Moment').slice(0,70),text:String(obj.text||'Something unexpected asks for a decision.').slice(0,420),choices:[]};
    const source=Array.isArray(obj.choices)?obj.choices.slice(0,3):[];
    if(source.length!==3)throw new Error('AI event did not provide three choices');
    for(const choice of source){
      const effects={};
      for(const [key,value] of Object.entries(choice.effects||{})){
        if(!allowed.has(key))continue;
        const n=Math.max(-6,Math.min(6,Math.round(Number(value)||0)));
        if(n)effects[key]=n;
      }
      clean.choices.push({label:String(choice.label||'Continue').slice(0,48),sub:String(choice.sub||'Choose based on your values.').slice(0,120),effects});
    }
    const allText=[clean.title,clean.text,...clean.choices.flatMap(c=>[c.label,c.sub])].join(' ');
    if(/suicide|self[- ]?harm|rape|sexual assault/i.test(allText))throw new Error('AI event contained unsafe material');
    if((G.age||0)<18&&/sex|pregnan|marriage|mortgage|casino|gambl|alcohol|drug deal|murder|weapon|full[- ]?time job/i.test(allText))throw new Error('AI event was not age-appropriate');
    if((G.age||0)<4)clean.text=clean.text.replace(/school|job|work|money|dating/gi,'family');
    return clean;
  },

  async requestMoment(){
    const G=window.G;if(!G||!G.alive){UI?.toast?.('Start or continue a life before creating a story moment.','neutral');return;}
    if(G.v24?.aiMomentAge===G.age){UI?.toast?.('You already used the optional AI moment this year.','neutral');return;}
    if(!this.config.enabled){UI?.openSettings?.();UI?.toast?.('Turn on Ollama in Settings first.','neutral');return;}
    this.status.busy=true;this.status.state='working';this.status.message='Creating a local story moment…';this.updateSettingsUI();
    try{
      const moment=await this.generateMoment(G);
      const evt={icon:moment.icon,title:moment.title,text:moment.text,type:'special',choices:moment.choices.map(c=>({label:c.label,sub:c.sub,e:c.effects}))};
      UI.showEvent(evt,()=>{G.v24=G.v24||{};G.v24.aiMomentAge=G.age;G.v24.memories=G.v24.memories||[];G.v24.memories.unshift({age:G.age,title:moment.title,tone:'ai',text:moment.text,createdAt:Date.now()});G.v24.memories=G.v24.memories.slice(0,80);LifeSimV24?.update?.();Save?.autosave?.(G);});
      this.status.state='ready';this.status.message='Connected · local AI ready';
    }catch(err){
      this.status.state='error';this.status.message=this.friendlyError(err);UI?.toast?.(`${this.status.message} A built-in story moment is still available.`,'bad');
      LifeSimV24?.continueStory?.();
    }finally{this.status.busy=false;this.updateSettingsUI();}
  }
};

if(typeof window!=='undefined')window.OllamaBridge=OllamaBridge;
