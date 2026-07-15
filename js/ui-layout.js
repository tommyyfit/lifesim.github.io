
(function(){
  'use strict';
  const APP_TITLE='LifeSim';
  const APP_SUMMARY='Life simulation game with career, family, health, and legacy systems.';
  const BUILD='release-layout';
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const attr=(v)=>esc(v).replace(/`/g,'&#96;');
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function syncMeta(){
    document.title=APP_TITLE;
    document.querySelectorAll('meta[name="description"],meta[property="og:description"]').forEach(m=>m.setAttribute('content',APP_SUMMARY));
    document.querySelectorAll('meta[name="application-name"],meta[property="og:title"]').forEach(m=>m.setAttribute('content',APP_TITLE));
  }

  function restoreStaticLabels(root=document){
    $$('[data-label]',root).forEach(el=>{
      const label=(el.getAttribute('data-label')||'').trim();
      if(label)el.textContent=label;
    });
  }

  function setVersionLabels(){
    try{
      syncMeta();
      const app=$('#app'); if(app){app.dataset.version='release'; app.dataset.build=BUILD;}
      document.body.classList.add('release-layout');
      restoreStaticLabels(document);
      if(window.App)App.VERSION=1;
      if(window.UI)UI.VERSION=1;
      if(window.Engine)Engine.VERSION=1;
      if(window.Save)Save.VERSION=1;
    }catch(e){console.warn('[release layout labels]',e);}
  }

  function stripPhaseNotes(root=document){
    try{
      syncMeta();
      $$('.release-phase-pill,.release-settings-note,.release-ach-note',root).forEach(el=>el.remove());
      restoreStaticLabels(root);
    }catch(e){console.warn('[release layout strip]',e);}
  }

  function cleanTextNode(node){
    if(!node||!node.nodeValue)return;
    let t=node.nodeValue;
    const old=t;
    t=t.replace(/\b\d+\s+available\b/gi,'');
    t=t.replace(/\bAlways available\b/gi,'');
    t=t.replace(/\bOpen only when you need them\b/gi,'');
    t=t.replace(/\bCleaner nav\s*·?\s*less scrolling\s*·?\s*same systems\b/gi,'');
    t=t.replace(/\bExtra paths\b/gi,'');
    t=t.replace(/\bAttraction\b/g,'Chemistry');
    t=t.replace(/\bOffice Affair\b/g,'Risky Office Drama');
    t=t.replace(/\bSleep with Boss\b/gi,'Risky Office Drama');
    t=t.replace(/\s{2,}/g,' ');
    if(t!==old)node.nodeValue=t;
  }

  function cleanVisibleText(root=document){
    try{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
        const t=node.nodeValue||'';
        return /(\d+\s+available|Always available|Cleaner nav|Open only when|Extra paths|Attraction|Office Affair|Sleep with Boss)/i.test(t)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;
      }});
      const nodes=[]; while(walker.nextNode())nodes.push(walker.currentNode);
      nodes.forEach(cleanTextNode);
      // Hide only text placeholders. Decorative/control spans often have no text by design.
      const protectedEmpty='.toggle-knob,.tab-dot,.splash-build-dot,.life-feed-node,.life-passive-switch > span,[id^="spark-"],[aria-hidden="true"],button span,label span';
      $$(protectedEmpty,root).forEach(el=>el.classList.remove('release-hidden-empty'));
      $$('.rv,.cd,.rs,small',root).forEach(el=>{
        const t=(el.textContent||'').trim();
        if(!t && !el.children.length)el.classList.add('release-hidden-empty');
        else el.classList.remove('release-hidden-empty');
      });
    }catch(e){console.warn('[release clean text]',e);}
  }

  function tabHeadline(name){
    const map={
      life:['🌟','Life Overview','Your timeline, goals and the story of this run.'],
      mind:['🧠','Mind & Recovery','Energy, stress, discipline and personal growth.'],
      love:['❤️','Love & Family','Relationships, partner trust, children and legacy.'],
      career:['💼','Career Path','Jobs, education, performance and long-term income.'],
      assets:['🏠','Assets & Wealth','Homes, vehicles, portfolio value and maintenance.'],
      health:['❤️‍🩹','Health','Medical care, habits, fitness and risk control.'],
      crime:['🚔','Crime Path','Optional high-risk route. Build intel, manage heat and avoid spam.'],
      social:['📱','Social Media','Audience, posts, fame and creator health.'],
      business:['🏢','Business','Build, scale and protect companies.'],
      hustle:['⚡','Hustle','Quick income and venture experiments.'],
      pets:['🐾','Pets','Companions, care and happiness.'],
      skills:['🎓','Skills','Level up talents that unlock better lives.'],
      stocks:['📈','Stocks','Investing, portfolio value and market risk.'],
      goals:['🎯','Goals','Yearly quests and long-term targets.']
    };
    return map[name]||['✨',name,''];
  }

  function addPolishPanel(name){
    const el=$('#tab-'+name); if(!el||el.querySelector(':scope > .release-polish-panel'))return;
    const [ico,title,sub]=tabHeadline(name);
    const html=`<section class="release-polish-panel"><div><b>${ico} ${esc(title)}</b><span>${esc(sub)}</span></div></section>`;
    el.insertAdjacentHTML('afterbegin',html);
  }

  function normalizeCards(root=document){
    try{
      $$('.card,.row-card,.crime-ui-move,.crime-ui-action,.legacy-ui-subtoggle,.goal-ui-quest',root).forEach(el=>{
        if(el.tagName!=='BUTTON' && el.getAttribute('onclick') && !el.hasAttribute('tabindex')){el.setAttribute('tabindex','0'); el.setAttribute('role','button');}
      });
      $$('.act-grid',root).forEach(grid=>{
        const items=[...grid.children].filter(ch=>(ch.textContent||'').trim());
        if(!items.length)grid.style.display='none';
      });
    }catch(_){ }
  }

  function emptyFallback(name){
    const el=$('#tab-'+name); if(!el)return;
    if((el.textContent||'').trim().length<4){
      const [ico,title]=tabHeadline(name);
      el.innerHTML=`<section class="release-polish-panel"><div><b>${ico} ${esc(title)}</b><span>This section is temporarily empty. Try Age Up, start a new life, or switch tabs.</span></div><button type="button" onclick="UI._renderTab('${attr(name)}')">Reload tab</button></section>`;
    }
  }

  function afterRender(name){
    addPolishPanel(name);
    cleanVisibleText($('#tab-'+name)||document);
    normalizeCards($('#tab-'+name)||document);
    emptyFallback(name);
  }

  function patchRenderSafety(){
    if(!window.UI||UI._releasePhase1Patched)return;
    const oldRender=UI._renderTab?.bind(UI);
    UI._renderTab=function(name){
      try{
        const result=oldRender?oldRender(name):undefined;
        requestAnimationFrame(()=>afterRender(name));
        return result;
      }catch(e){
        console.error('[LifeSim] Tab render failed:',name,e);
        const el=$('#tab-'+name);
        if(el){
          const [ico,title]=tabHeadline(name);
          el.innerHTML=`<section class="release-polish-panel"><div><b>${ico} ${esc(title)} recovered</b><span>A UI error was caught so the whole game does not break. Open console for details.</span></div><button type="button" onclick="UI._renderTab('${attr(name)}')">Try again</button></section>`;
        }
        UI.toast?.('This tab recovered from a UI issue.','neutral');
      }
    };
    const oldTab=UI.tab?.bind(UI);
    UI.tab=function(name){
      const out=oldTab?oldTab(name):undefined;
      requestAnimationFrame(()=>afterRender(name));
      return out;
    };
    UI._releasePhase1Patched=true;
  }

  function patchModalCards(){
    try{
      const oldOpen=UI?.openModal?.bind(UI);
      if(oldOpen&&!UI._releaseModalPatched){
        UI.openModal=function(modal){ const out=oldOpen(modal); requestAnimationFrame(()=>{cleanVisibleText(modal);normalizeCards(modal);}); return out; };
        UI._releaseModalPatched=true;
      }
    }catch(_){ }
  }

  function patchSettingsNote(){
    try{
      const settings=$('#settings-modal .modal-box > div[style]');
      settings?.querySelector('.release-settings-note')?.remove();
    }catch(_){ }
  }

  function patchAchievements(){
    if(!window.App||App._releaseAchPatched)return;
    const oldShow=App.showAchievements?.bind(App);
    if(oldShow){
      App.showAchievements=function(){
        const out=oldShow();
        requestAnimationFrame(()=>{
          const body=$('#ach-body'); if(!body)return;
          body.querySelector('.release-ach-note')?.remove();
          cleanVisibleText(body); normalizeCards(body);
        });
        return out;
      };
      App._releaseAchPatched=true;
    }
  }

  function livePolish(){
    setVersionLabels();
    cleanVisibleText(document);
    normalizeCards(document);
    stripPhaseNotes(document);
    const active=$('.tab-panel.active'); if(active){ const name=(active.id||'').replace('tab-',''); if(name)afterRender(name); }
  }

  function boot(){
    setVersionLabels();
    patchRenderSafety();
    patchModalCards();
    patchAchievements();
    patchSettingsNote();
    stripPhaseNotes(document);
    livePolish();
  }

  document.addEventListener('DOMContentLoaded',boot);
  window.addEventListener('load',()=>{boot(); setTimeout(boot,120); setTimeout(boot,650);});
  // Important: do NOT run livePolish after every in-tab click.
  // It rewrites/normalizes active tab DOM after action buttons, which caused
  // visible delayed jumps/blinks after Love/Skills/Stocks actions.
  // Render/tab wrappers already polish after real renders, so click polishing
  // is intentionally disabled for gameplay stability.
  // document.addEventListener('click',()=>setTimeout(livePolish,40),true);
  window.ReleaseLayout={BUILD,boot,cleanVisibleText,normalizeCards,afterRender};
})();
