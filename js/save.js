/* js/save.js — LifeSim module */
const Save={
  VERSION:1,
  _autosaveTimer:null,

  K:'lifesim_save',
  H:'lifesim_hof',
  U:'lifesim_ach',
  B:'lifesim_save_backup',
  META:'lifesim_meta',

  _legacyKey(n,suffix){ return `ls${'v'}${n}_${suffix}`; },
  get OLD_SAVE_KEYS(){ return [19,18,17,16,15,14,12,11,10,9,8].map(n=>this._legacyKey(n,'save')); },
  get OLD_HOF_KEYS(){ return [19,18,17,16,15,14,13,12,11,10,9,8].map(n=>this._legacyKey(n,'hof')); },
  get OLD_ACH_KEYS(){ return [19,18,17,16,15,14,13,12,11,10,9,8].map(n=>this._legacyKey(n,'ach')); },

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
    const current=this._read(newKey,null);
    if(current!==null)return current;

    const old=this._firstExisting(oldKeys);
    if(!old)return fallback;

    try{
      const parsed=JSON.parse(old.raw);
      this._write(newKey,parsed);
      this._write(this.META,{migratedFrom:old.key,migratedAt:Date.now(),version:this.VERSION});
      return parsed;
    }catch(e){
      console.warn('Save migration failed:',old.key,e);
      return fallback;
    }
  },

  _safeClone(value){
    try{return JSON.parse(JSON.stringify(value));}
    catch(e){return null;}
  },

  _normalizeSave(G,{touchTimestamp=true}={}){
    if(!G||typeof G!=='object')return null;
    const clone=this._safeClone(G);
    if(!clone)return null;

    const finite=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
    const bounded=(value,min,max,fallback)=>Math.max(min,Math.min(max,finite(value,fallback)));
    const list=value=>Array.isArray(value)?value:[];

    if(typeof clone.name!=='string'||!clone.name.trim())return null;
    clone.name=clone.name.trim().slice(0,40);
    clone.surname=typeof clone.surname==='string'?clone.surname.trim().slice(0,60):'';
    clone.age=Math.round(bounded(clone.age,0,250,0));
    clone.year=Math.max(clone.age,Math.round(bounded(clone.year,0,10000,clone.age)));
    clone.alive=clone.alive!==false;
    ['happiness','health','smarts','looks','fitness','fame','stress','mentalHealth','reputation'].forEach(key=>{
      const fallback=key==='stress'||key==='fame'?0:key==='reputation'||key==='mentalHealth'?60:50;
      clone[key]=bounded(clone[key],0,100,fallback);
    });
    clone.karma=bounded(clone.karma,-100,100,0);
    ['money','debt','familySupport','lifetimeEarnings','lifetimeDonated'].forEach(key=>{clone[key]=finite(clone[key],0);});

    clone.version=this.VERSION;
    clone.savedAt=touchTimestamp?Date.now():Math.max(0,finite(clone.savedAt,Date.now()));
    clone.saveSchema='lifesim-release';

    clone.log=list(clone.log).filter(entry=>entry&&typeof entry==='object'&&typeof entry.text==='string');
    if(clone.log.length>500)clone.log=clone.log.slice(0,500);
    clone.statHistory=list(clone.statHistory).filter(entry=>entry&&typeof entry==='object');
    if(clone.statHistory.length>80)clone.statHistory=clone.statHistory.slice(-80);
    if(!clone.achievements||typeof clone.achievements!=='object')clone.achievements={};
    if(!clone.rels||typeof clone.rels!=='object')clone.rels={father:null,mother:null,siblings:[],partner:null,children:[],friends:[],exes:[]};
    if(!clone.assets||typeof clone.assets!=='object')clone.assets={properties:[],vehicles:[]};
    ['siblings','children','friends','exes'].forEach(key=>{clone.rels[key]=list(clone.rels[key]).filter(person=>person&&typeof person==='object');});
    clone.assets.properties=list(clone.assets.properties).filter(asset=>asset&&typeof asset==='object');
    clone.assets.vehicles=list(clone.assets.vehicles).filter(asset=>asset&&typeof asset==='object');
    if(!clone.hustle||typeof clone.hustle!=='object')clone.hustle={};
    if(!clone.food||typeof clone.food!=='object')clone.food={};
    clone.pets=list(clone.pets).filter(item=>item&&typeof item==='object');
    clone.conditions=list(clone.conditions).filter(item=>item&&typeof item==='object');
    clone.crimes=list(clone.crimes).filter(item=>item&&typeof item==='object');

    return clone;
  },

  save(G){
    const payload=this._normalizeSave(G);
    if(!payload)return false;

    const existing=this._read(this.K,null);
    if(existing&&typeof existing==='object'){
      this._write(this.B,{...existing,backupAt:Date.now()});
    }

    const ok=this._write(this.K,payload);
    if(ok)this._write(this.META,{lastSavedAt:payload.savedAt,version:this.VERSION,name:payload.name||'',age:payload.age||0});
    return ok;
  },

  autoSaveEnabled(){
    return !(typeof UI!=='undefined'&&UI?._settings?.autoSave===false);
  },

  autosave(G){
    if(!this.autoSaveEnabled())return false;
    if(this._autosaveTimer){
      clearTimeout(this._autosaveTimer);
      this._autosaveTimer=null;
    }
    return this.save(G);
  },

  scheduleAutosave(G=window.G,delay=250){
    if(!G||!this.autoSaveEnabled())return false;
    if(this._autosaveTimer)clearTimeout(this._autosaveTimer);
    this._autosaveTimer=setTimeout(()=>{
      this._autosaveTimer=null;
      if(G===window.G&&G?.alive!==false&&this.autoSaveEnabled())this.save(G);
    },Math.max(0,Number(delay)||0));
    return true;
  },

  load(){
    const migrated=this._migrateOne(this.K,this.OLD_SAVE_KEYS,null);
    if(migrated&&typeof migrated==='object'){
      migrated.version=migrated.version||8;
      const normalized=this._normalizeSave(migrated,{touchTimestamp:false});
      if(normalized)return normalized;
    }

    const backup=this._read(this.B,null);
    if(backup&&typeof backup==='object'){
      backup.version=backup.version||8;
      const normalized=this._normalizeSave(backup,{touchTimestamp:false});
      if(normalized){
        if(typeof UI!=='undefined'&&UI.toast)UI.toast('Loaded backup save because main save was missing/corrupt.','neutral');
        return normalized;
      }
    }

    return null;
  },

  loadBackup(){
    const backup=this._read(this.B,null);
    if(!backup||typeof backup!=='object')return null;
    backup.version=backup.version||8;
    return this._normalizeSave(backup,{touchTimestamp:false});
  },

  restoreBackup(){
    const backup=this.loadBackup();
    if(!backup)return false;
    return this._write(this.K,{...backup,restoredAt:Date.now(),version:this.VERSION});
  },

  has(){
    const validObject=(key)=>{
      try{
        const raw=localStorage.getItem(key);
        if(!raw)return false;
        const parsed=JSON.parse(raw);
        return !!this._normalizeSave(parsed,{touchTimestamp:false});
      }catch(e){
        return false;
      }
    };

    if(validObject(this.K)||validObject(this.B))return true;

    for(const key of this.OLD_SAVE_KEYS){
      if(validObject(key))return true;
    }
    return false;
  },

  clear(){
    this.clearAllSaves();
  },

  clearBackup(){
    this._remove(this.B);
  },

  clearAllSaves(){
    if(this._autosaveTimer){
      clearTimeout(this._autosaveTimer);
      this._autosaveTimer=null;
    }
    this._remove(this.K);
    this._remove(this.B);
    this._remove(this.META);
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
      h.sort((a,b)=>(b.score||0)-(a.score||0)||((b.netWorth||0)-(a.netWorth||0))||((b.age||0)-(a.age||0)));
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
      .map(e=>({
        ...e,
        score:Math.round(e.score||0),
        netWorth:Math.round(e.netWorth||0),
        age:Math.round(e.age||0),
      }))
      .sort((a,b)=>(b.score||0)-(a.score||0)||((b.netWorth||0)-(a.netWorth||0))||((b.age||0)-(a.age||0)))
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
    return [...new Set(data.filter(Boolean).map(String))].sort();
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
      backup:this.loadBackup(),
      hof:this.hofAll(),
      achievements:this.unlockedAchs(),
      prestige:typeof Legacy!=='undefined'&&Legacy.load?Legacy.load():null,
      meta:this._read(this.META,{}),
    };
  },

  exportString(){
    try{return JSON.stringify(this.exportAll());}
    catch(e){return'';}
  },

  downloadExport(filename='lifesim-save.json'){
    try{
      const blob=new Blob([JSON.stringify(this.exportAll(),null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;
      a.download=filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return true;
    }catch(e){
      console.warn('Export download failed',e);
      if(typeof UI!=='undefined'&&UI.toast)UI.toast('Export failed.','bad');
      return false;
    }
  },

  importAll(data){
    try{
      if(typeof data==='string')data=JSON.parse(data);
      if(!data||typeof data!=='object'||Array.isArray(data))return false;

      let recognized=false;
      let ok=true;
      const looksLikeSave=value=>{
        if(!value||typeof value!=='object'||Array.isArray(value))return false;
        return ['name','age','alive','country','log','rels','stats','version','saveSchema']
          .some(key=>Object.prototype.hasOwnProperty.call(value,key));
      };

      if(looksLikeSave(data.save)){
        recognized=true;
        const current=this._read(this.K,null);
        if(current)ok=this._write(this.B,{...current,backupAt:Date.now(),reason:'before import'})&&ok;
        const imported=this._normalizeSave(data.save);
        if(!imported)return false;
        imported.importedAt=Date.now();
        ok=this._write(this.K,imported)&&ok;
      }else if(data.save!=null){
        return false;
      }

      if(looksLikeSave(data.backup)){
        recognized=true;
        const importedBackup=this._normalizeSave(data.backup);
        if(!importedBackup)return false;
        importedBackup.importedAt=Date.now();
        ok=this._write(this.B,importedBackup)&&ok;
      }else if(data.backup!=null){
        return false;
      }

      if(Array.isArray(data.hof)){
        recognized=true;
        ok=this._write(this.H,data.hof.filter(e=>e&&typeof e==='object').slice(0,25))&&ok;
      }else if(data.hof!=null){
        return false;
      }

      if(Array.isArray(data.achievements)){
        recognized=true;
        ok=this._write(this.U,[...new Set(data.achievements.filter(Boolean).map(String))].sort())&&ok;
      }else if(data.achievements!=null){
        return false;
      }

      if(data.prestige!=null){
        if(!data.prestige||typeof data.prestige!=='object'||Array.isArray(data.prestige))return false;
        recognized=true;
        if(typeof Legacy!=='undefined'&&Legacy.save)Legacy.save(data.prestige);
      }

      if(!recognized||!ok)return false;
      return this._write(this.META,{importedAt:Date.now(),version:this.VERSION});
    }catch(e){
      console.warn('Import failed',e);
      if(typeof UI!=='undefined'&&UI.toast)UI.toast('Import failed. File may be invalid.','bad');
      return false;
    }
  },

  storageInfo(){
    try{
      const keys=[this.K,this.B,this.H,this.U,this.META];
      const rows=keys.map(k=>({key:k,bytes:(localStorage.getItem(k)||'').length}));
      const total=rows.reduce((s,r)=>s+r.bytes,0);
      return{rows,total};
    }catch(e){
      return{rows:[],total:0};
    }
  },
};
