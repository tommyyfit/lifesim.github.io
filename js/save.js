/* js/save.js — LifeSim v9 */
const Save={
  K:'lsv9_save', H:'lsv9_hof', U:'lsv9_ach', M:'lsv9_migrated_v8',
  OLD:{K:'lsv8_save',H:'lsv8_hof',U:'lsv8_ach'},
  _read(k,fb=null){try{const raw=localStorage.getItem(k);return raw?JSON.parse(raw):fb;}catch(e){return fb;}},
  _write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){return false;}},
  _migrate(){
    try{
      if(localStorage.getItem(this.M))return;
      if(!localStorage.getItem(this.K)&&localStorage.getItem(this.OLD.K))localStorage.setItem(this.K,localStorage.getItem(this.OLD.K));
      if(!localStorage.getItem(this.H)&&localStorage.getItem(this.OLD.H))localStorage.setItem(this.H,localStorage.getItem(this.OLD.H));
      if(!localStorage.getItem(this.U)&&localStorage.getItem(this.OLD.U))localStorage.setItem(this.U,localStorage.getItem(this.OLD.U));
      localStorage.setItem(this.M,'1');
    }catch(e){}
  },
  save(G){try{localStorage.setItem(this.K,JSON.stringify(G));}catch(e){}},
  load(){this._migrate();return this._read(this.K,null);},
  has(){this._migrate();try{return!!localStorage.getItem(this.K);}catch(e){return false;}},
  clear(){try{localStorage.removeItem(this.K);}catch(e){}},
  hof(e){
    try{
      const h=this.hofAll();
      h.unshift(e);
      h.sort((a,b)=>b.score-a.score);
      if(h.length>15)h.pop();
      this._write(this.H,h);
    }catch(e){}
  },
  hofAll(){this._migrate();return this._read(this.H,[]);},
  unlockAch(id){
    try{
      this._migrate();
      let a=this._read(this.U,[]);
      if(!a.includes(id)){a.push(id);this._write(this.U,a);return true;}
      return false;
    }catch(e){return false;}
  },
  unlockedAchs(){this._migrate();return this._read(this.U,[]);},
  exportData(){
    this._migrate();
    return {
      app:'LifeSim',
      version:9,
      exportedAt:new Date().toISOString(),
      save:this._read(this.K,null),
      hallOfFame:this._read(this.H,[]),
      achievements:this._read(this.U,[]),
    };
  },
  importData(data){
    if(!data||typeof data!=='object')return false;
    if(!('save' in data)&&data.name&&data.rels){
      data={app:'LifeSim',version:9,save:data};
    }
    const hasSave='save' in data;
    const hasHof=Array.isArray(data.hallOfFame);
    const hasAch=Array.isArray(data.achievements);
    if(!hasSave&&!hasHof&&!hasAch)return false;
    if(hasSave){
      if(data.save)localStorage.setItem(this.K,JSON.stringify(data.save));
      else localStorage.removeItem(this.K);
    }
    if(hasHof)this._write(this.H,data.hallOfFame);
    if(hasAch)this._write(this.U,data.achievements);
    return true;
  },
  wipeAll(){
    try{
      [this.K,this.H,this.U,this.M,this.OLD.K,this.OLD.H,this.OLD.U].forEach(k=>localStorage.removeItem(k));
      return true;
    }catch(e){return false;}
  },
};
