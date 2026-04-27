/* js/save.js — LifeSim v13 Reforged save / HOF / achievements system */
const Save={
  VERSION:13,

  K:'lsv13_save',
  H:'lsv13_hof',
  U:'lsv13_ach',

  OLD_SAVE_KEYS:['lsv12_save','lsv11_save','lsv10_save','lsv9_save','lsv8_save'],
  OLD_HOF_KEYS:['lsv12_hof','lsv11_hof','lsv10_hof','lsv9_hof','lsv8_hof'],
  OLD_ACH_KEYS:['lsv12_ach','lsv11_ach','lsv10_ach','lsv9_ach','lsv8_ach'],

  _read(key,fallback=null){
    try{
      const raw=localStorage.getItem(key);
      if(!raw)return fallback;
      return JSON.parse(raw);
    }catch(e){
      console.warn('Save read failed:',key,e);
      return fallback;
    }
  },

  _write(key,value){
    try{
      localStorage.setItem(key,JSON.stringify(value));
      return true;
    }catch(e){
      console.warn('Save write failed:',key,e);
      if(typeof UI!=='undefined'&&UI.toast)UI.toast('Save failed. Browser storage may be full.','bad');
      return false;
    }
  },

  _remove(key){
    try{localStorage.removeItem(key);}
    catch(e){}
  },

  _firstExisting(keys){
    for(const k of keys){
      try{
        const raw=localStorage.getItem(k);
        if(raw)return{key:k,raw};
      }catch(e){}
    }
    return null;
  },

  _migrateOne(newKey,oldKeys,fallback){
    let current=this._read(newKey,null);
    if(current!==null)return current;

    const old=this._firstExisting(oldKeys);
    if(!old)return fallback;

    try{
      const parsed=JSON.parse(old.raw);
      this._write(newKey,parsed);
      return parsed;
    }catch(e){
      return fallback;
    }
  },

  save(G){
    if(!G||typeof G!=='object')return false;
    const payload={
      ...G,
      version:this.VERSION,
      savedAt:Date.now(),
    };
    return this._write(this.K,payload);
  },

  load(){
    const migrated=this._migrateOne(this.K,this.OLD_SAVE_KEYS,null);
    if(!migrated||typeof migrated!=='object')return null;
    migrated.version=migrated.version||8;
    return migrated;
  },

  has(){
    try{
      if(!!localStorage.getItem(this.K))return true;
      return !!this._firstExisting(this.OLD_SAVE_KEYS);
    }catch(e){
      return false;
    }
  },

  clear(){
    this._remove(this.K);
  },

  clearAllSaves(){
    this._remove(this.K);
    this.OLD_SAVE_KEYS.forEach(k=>this._remove(k));
  },

  hof(entry){
    try{
      if(!entry||typeof entry!=='object')return false;
      const h=this.hofAll();

      const clean={
        ...entry,
        score:Math.round(entry.score||0),
        netWorth:Math.round(entry.netWorth||0),
        age:Math.round(entry.age||0),
        savedAt:Date.now(),
      };

      h.unshift(clean);
      h.sort((a,b)=>(b.score||0)-(a.score||0)||((b.netWorth||0)-(a.netWorth||0)));
      const trimmed=h.slice(0,25);
      return this._write(this.H,trimmed);
    }catch(e){
      console.warn('HOF save failed',e);
      return false;
    }
  },

  hofAll(){
    const data=this._migrateOne(this.H,this.OLD_HOF_KEYS,[]);
    if(!Array.isArray(data))return[];
    return data
      .filter(e=>e&&typeof e==='object')
      .map(e=>({...e,score:Math.round(e.score||0),netWorth:Math.round(e.netWorth||0)}))
      .sort((a,b)=>(b.score||0)-(a.score||0)||((b.netWorth||0)-(a.netWorth||0)))
      .slice(0,25);
  },

  clearHOF(){
    this._remove(this.H);
  },

  unlockAch(id){
    if(!id)return false;
    try{
      const a=this.unlockedAchs();
      if(!a.includes(id)){
        a.push(id);
        a.sort();
        this._write(this.U,a);
        return true;
      }
      return false;
    }catch(e){
      return false;
    }
  },

  unlockedAchs(){
    const data=this._migrateOne(this.U,this.OLD_ACH_KEYS,[]);
    if(!Array.isArray(data))return[];
    return [...new Set(data.filter(Boolean))];
  },

  lockAch(id){
    if(!id)return false;
    const a=this.unlockedAchs().filter(x=>x!==id);
    return this._write(this.U,a);
  },

  clearAchievements(){
    this._remove(this.U);
  },

  exportAll(){
    return{
      version:this.VERSION,
      exportedAt:Date.now(),
      save:this.load(),
      hof:this.hofAll(),
      achievements:this.unlockedAchs(),
      prestige:typeof Legacy!=='undefined'&&Legacy.load?Legacy.load():null,
    };
  },

  importAll(data){
    if(!data||typeof data!=='object')return false;
    if(data.save)this._write(this.K,{...data.save,version:this.VERSION,savedAt:Date.now()});
    if(Array.isArray(data.hof))this._write(this.H,data.hof.slice(0,25));
    if(Array.isArray(data.achievements))this._write(this.U,[...new Set(data.achievements)]);
    if(data.prestige&&typeof Legacy!=='undefined'&&Legacy.save)Legacy.save(data.prestige);
    return true;
  },
};