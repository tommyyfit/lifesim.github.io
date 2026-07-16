/* LifeSim startup guard: records load failures and verifies the required app contract. */
(function(){
  'use strict';

  const state={
    build:'24.2.1-fun-first',
    status:'starting',
    startedAt:Date.now(),
    readyAt:0,
    resourceErrors:[],
    runtimeErrors:[]
  };

  const keep=(list,value)=>{
    list.push(value);
    if(list.length>20)list.shift();
  };

  function resourceName(target){
    return target?.getAttribute?.('src')||target?.getAttribute?.('href')||target?.tagName||'unknown resource';
  }

  window.addEventListener('error',event=>{
    const target=event.target;
    if(target&&target!==window&&/^(SCRIPT|LINK)$/i.test(target.tagName||'')){
      keep(state.resourceErrors,resourceName(target));
      return;
    }
    if(event.message)keep(state.runtimeErrors,{message:String(event.message),source:String(event.filename||''),line:Number(event.lineno)||0});
  },true);

  window.addEventListener('unhandledrejection',event=>{
    const reason=event.reason;
    keep(state.runtimeErrors,{message:String(reason?.message||reason||'Unhandled promise rejection'),source:'promise',line:0});
  });

  function removeFailure(){
    document.getElementById('lifesim-startup-error')?.remove();
  }

  function showFailure(problems){
    state.status='failed';
    document.documentElement.dataset.appReady='false';
    let panel=document.getElementById('lifesim-startup-error');
    if(!panel){
      if(!document.getElementById('lifesim-startup-fallback-style')){
        const style=document.createElement('style');
        style.id='lifesim-startup-fallback-style';
        style.textContent='#lifesim-startup-error{position:fixed;inset:0;z-index:100000;display:grid;place-items:center;padding:24px;background:#05070d;color:#fff;font-family:system-ui,sans-serif}#lifesim-startup-error>div{width:min(520px,100%);box-sizing:border-box;padding:28px;border:1px solid #7f1d1d;border-radius:20px;background:#101522;text-align:center}#lifesim-startup-error p,#lifesim-startup-error small{color:#b8c2d4}#lifesim-startup-error button{margin:10px;padding:11px 16px;border:0;border-radius:12px;background:#6d5dfc;color:#fff;font-weight:800;cursor:pointer}';
        document.head?.appendChild(style);
      }
      panel=document.createElement('section');
      panel.id='lifesim-startup-error';
      panel.setAttribute('role','alert');
      panel.setAttribute('aria-live','assertive');
      panel.innerHTML='<div><span aria-hidden="true">⚠️</span><h1>LifeSim could not finish starting</h1><p></p><button type="button">Reload LifeSim</button><small>Your local save has not been deleted.</small></div>';
      panel.querySelector('button').addEventListener('click',()=>location.reload());
      document.body.appendChild(panel);
    }
    panel.querySelector('p').textContent=problems.join(' ');
  }

  function verify(){
    const requiredGlobals=['App','UI','Engine','Save','AgeLogic','LifeSimV24','FunFirst'];
    const requiredMounts=['app','splash-screen','create-screen','game-screen','death-screen','game-content','settings-modal','ev-modal'];
    const missingGlobals=requiredGlobals.filter(name=>typeof window[name]==='undefined');
    const missingMounts=requiredMounts.filter(id=>!document.getElementById(id));
    const problems=[];
    if(state.resourceErrors.length)problems.push(`Failed resources: ${state.resourceErrors.join(', ')}.`);
    if(missingGlobals.length)problems.push(`Missing modules: ${missingGlobals.join(', ')}.`);
    if(missingMounts.length)problems.push(`Missing interface mounts: ${missingMounts.join(', ')}.`);
    if(problems.length){showFailure(problems);return false;}

    removeFailure();
    state.status='ready';
    state.readyAt=Date.now();
    document.documentElement.dataset.appReady='true';
    return true;
  }

  window.LifeSimBoot=Object.freeze({
    state,
    verify,
    report:()=>JSON.parse(JSON.stringify(state))
  });

  window.addEventListener('load',()=>setTimeout(verify,300),{once:true});
})();
