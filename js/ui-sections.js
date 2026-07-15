(function(){
  'use strict';
  const APP_TITLE='LifeSim';
  const APP_SUMMARY='Life simulation game with career, family, health, and legacy systems.';
  const BUILD='release-sections';
  const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,Number(n)||0));
  const money=(n)=>{
    const v=Math.round(Number(n)||0);
    try{return new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(v);}catch(_){return 'Kč'+v.toLocaleString('cs-CZ');}
  };

  function game(){ return window.G || window.App?.G || null; }
  function parentsOf(G){
    const rels=G?.rels||{};
    const parents=[rels.father,rels.mother,...(Array.isArray(rels.parents)?rels.parents:[])].filter(Boolean);
    return parents.filter((parent,index,all)=>{
      const key=parent.id||`${parent.role||''}:${parent.name||''}:${parent.surname||''}`;
      return all.findIndex(other=>(other.id||`${other.role||''}:${other.name||''}:${other.surname||''}`)===key)===index;
    });
  }
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
  function insertAfterHeader(tab,html){
    const panel=$('#tab-'+tab); if(!panel)return;
    const anchor=panel.querySelector(':scope > .release-polish-panel') || panel.firstElementChild;
    if(anchor)anchor.insertAdjacentHTML('afterend',html); else panel.insertAdjacentHTML('afterbegin',html);
  }
  function removeOld(panel,selectors){ selectors.forEach(s=> $$(s,panel).forEach(el=>el.remove())); }

  function setLabels(){
    try{
      syncMeta();
      const app=$('#app'); if(app){ app.dataset.version='release'; app.dataset.build=BUILD; }
      document.body.classList.add('release-layout','release-sections');
      $$('.release-phase-pill').forEach(el=>el.remove());
      restoreStaticLabels(document);
      if(window.App)App.VERSION=1;
      if(window.UI)UI.VERSION=1;
    }catch(e){ console.warn('[release labels]',e); }
  }

  function stripPhaseLabels(root=document){
    try{
      syncMeta();
      $$('.release-phase-pill',root).forEach(el=>el.remove());
      restoreStaticLabels(root);
    }catch(e){ console.warn('[release strip]',e); }
  }

  function familyScore(G){
    const partner=G?.rels?.partner||null;
    const kids=G?.rels?.children||[];
    const parents=parentsOf(G);
    const bond=partner?Math.round(partner.love||partner.relationship||partner.trust||65):0;
    const base=partner?bond:35;
    return Math.round(clamp(base*.55 + Math.min(30,kids.length*10) + (parents.length?8:0) + Math.min(12,(G.happiness||50)/10)));
  }

  function patchLove(){
    const panel=$('#tab-love'), G=game(); if(!panel||!G)return;
    removeOld(panel,['.legacy-ui-family-clarity','.advisor-ui-love-health','.release-plan-love-panel']);
    const p=G.rels?.partner||null;
    const kids=G.rels?.children||[];
    const parents=parentsOf(G);
    const bond=p?Math.round(p.love||p.relationship||p.trust||65):0;
    const status=p?(p.married?'Married':(p.stage==='engaged'?'Engaged':'Dating')):'Single';
    const score=familyScore(G);
    const sh=G.sexualHealth||{};
    const checkup=Number.isFinite(sh.lastCheckupAge)?`${Math.max(0,(G.age||0)-sh.lastCheckupAge)}y ago`:'not needed yet';
    const riskFlag=!!(sh.sti||sh.std||p?.outsideExposure||(!p && (sh.partners||0)>0));
    const risk=riskFlag?'Checkup smart':'Low';
    const healthText=p?'Stable partner actions stay clean. Health flags only appear after clear risk events.':'Dating is optional. Health checks matter after new or risky contacts.';
    const html=`<section class="release-plan-love-panel release-plan-section">
      <div class="release-plan-section-head">
        <div><span class="release-plan-kicker">Love & Family</span><h3>❤️ Relationship overview</h3></div>
        <strong class="release-plan-score ${score>=70?'good':score>=45?'warn':'bad'}">${score}/100</strong>
      </div>
      <div class="release-plan-metrics love">
        <div><span>Partner</span><b>${esc(status)}</b></div>
        <div><span>Bond</span><b>${p?bond+'%':'—'}</b></div>
        <div><span>Children</span><b>${kids.length?kids.length:'0'}</b></div>
        <div><span>Parents</span><b>${parents.length?parents.filter(x=>x.alive!==false).length+'/'+parents.length+' alive':'—'}</b></div>
      </div>
      <div class="release-plan-note-row"><span>🛡️ Relationship health</span><b>${esc(risk)}</b><em>${esc(healthText)} Last checkup: ${esc(checkup)}.</em></div>
    </section>`;
    insertAfterHeader('love',html);
  }

  function careerMove(G){
    if(!G.career) return ['Choose a path','Apply for a job or education track to unlock stable income.','Start'];
    if((G.stress||0)>75) return ['Recover first','Your stress is high. A balanced year protects performance and health.','Recovery'];
    if((G.jobPerf||50)<45) return ['Stabilize performance','Work steady before asking for promotion or salary moves.','Focus'];
    if((G.jobPerf||50)>72) return ['Push for growth','Your performance is strong. Promotion or raise actions make sense now.','Growth'];
    return ['Build momentum','Improve performance, skills and networking before taking bigger risks.','Steady'];
  }

  function patchCareer(){
    const panel=$('#tab-career'), G=game(); if(!panel||!G)return;
    removeOld(panel,['.advisor-ui-career-best','.release-plan-career-plan']);
    const [move,why,tag]=careerMove(G);
    const role=G.career?.title||G.career?.name||'No career yet';
    const perf=Math.round(G.jobPerf||0);
    const salary=G.career?.salary||G.salary||0;
    const html=`<section class="release-plan-career-plan release-plan-plan-card">
      <div class="release-plan-plan-icon">💼</div>
      <div class="release-plan-plan-body"><span class="release-plan-kicker">Career plan</span><h3>${esc(move)}</h3><p>${esc(why)}</p></div>
      <div class="release-plan-plan-stats"><span>${esc(tag)}</span><b>${esc(role)}</b><small>${salary?money(salary)+'/yr':'income not set'} · perf ${perf||'—'}%</small></div>
    </section>`;
    insertAfterHeader('career',html);
  }

  function assetSnapshot(G){
    const a=G.assets||{};
    const props=a.properties||[], vehs=a.vehicles||[];
    const loans=G.loans||[];
    const propValue=props.reduce((s,x)=>s+(x.value||x.price||0),0);
    const vehValue=vehs.reduce((s,x)=>s+(x.value||x.price||0),0);
    const rent=props.reduce((s,x)=>s+(x.rent||0),0);
    const upkeep=Math.round(propValue*.012 + vehValue*.045);
    const debt=loans.reduce((s,x)=>s+(x.balance||x.remaining||x.amount||0),0);
    const condition=[...props,...vehs].length?Math.round([...props,...vehs].reduce((s,x)=>s+(x.condition??80),0)/([...props,...vehs].length)):100;
    return {props,vehs,propValue,vehValue,rent,upkeep,debt,condition};
  }
  function assetMove(G,s){
    if((G.money||0)<50000) return ['Build cash runway','Save before taking on properties, cars or debt.','Cash'];
    if(s.debt>Math.max(1,s.propValue)*0.65) return ['Reduce debt risk','Your portfolio is too leveraged for safe growth.','Risk'];
    if(s.condition<65) return ['Repair weak assets','Poor condition creates future costs and value loss.','Repair'];
    if(!s.props.length) return ['Buy first home','A stable base unlocks safer asset growth.','Starter'];
    if(s.rent<=s.upkeep && s.props.length) return ['Improve cashflow','Upgrade or rent assets so ownership pays back.','Cashflow'];
    return ['Scale carefully','Your portfolio is stable. Add income assets, not random purchases.','Scale'];
  }
  function patchAssets(){
    const panel=$('#tab-assets'), G=game(); if(!panel||!G)return;
    removeOld(panel,[':scope > .advisor-ui-bestmove','.legacy-ui-assets-panel.advisor-ui-assets-panel','.release-plan-assets-panel']);
    const s=assetSnapshot(G), [move,why,tag]=assetMove(G,s);
    const html=`<section class="release-plan-assets-panel release-plan-section">
      <div class="release-plan-section-head">
        <div><span class="release-plan-kicker">Assets plan</span><h3>🏠 ${esc(move)}</h3><p>${esc(why)}</p></div>
        <strong class="release-plan-score">${esc(tag)}</strong>
      </div>
      <div class="release-plan-metrics assets">
        <div><span>Property</span><b>${money(s.propValue)}</b></div>
        <div><span>Vehicles</span><b>${money(s.vehValue)}</b></div>
        <div><span>Cashflow</span><b class="${s.rent>=s.upkeep?'good':'warn'}">${money(s.rent-s.upkeep)}/yr</b></div>
        <div><span>Condition</span><b>${s.condition}%</b></div>
      </div>
      <div class="release-plan-button-row"><button type="button" onclick="Assets.serviceWeakest?.()">🔧 Repair weakest</button><button type="button" onclick="Assets.sellWeakestVehicle?.()">🚗 Sell weak car</button><button type="button" onclick="UI.tab('stocks')">📈 Portfolio</button></div>
    </section>`;
    insertAfterHeader('assets',html);
  }

  function hustleMove(G){
    const ventures=Object.values(G.hustle?.ventures||{});
    if(!ventures.length) return ['Start one venture','Pick one serious project. Quick gigs are only temporary cash.','Launch'];
    const risky=ventures.find(v=>(v.brandRisk||0)>65);
    if(risky) return ['Lower risk','Protect the brand before scaling harder.','Protect'];
    const idle=ventures.find(v=>Number.isFinite(v.lastWorkedAge)&&((G.age||0)-v.lastWorkedAge)>1);
    if(idle) return [`Reactivate ${idle.name||idle.id||'venture'}`,'Idle ventures lose momentum and future income.','Reactivate'];
    const best=ventures.slice().sort((a,b)=>(b.level||1)-(a.level||1)||(b.momentum||0)-(a.momentum||0))[0];
    return [`Scale ${best?.name||best?.id||'best venture'}`,'Put effort where compounding is already working.','Scale'];
  }
  function patchHustle(){
    const panel=$('#tab-hustle'), G=game(); if(!panel||!G)return;
    removeOld(panel,['.advisor-ui-hustle-best','.release-plan-hustle-plan']);
    const [move,why,tag]=hustleMove(G);
    const ventures=Object.values(G.hustle?.ventures||{});
    const q=G.hustle?.quickCount||G.hustle?.gigsDone||0;
    const html=`<section class="release-plan-hustle-plan release-plan-plan-card">
      <div class="release-plan-plan-icon">⚡</div>
      <div class="release-plan-plan-body"><span class="release-plan-kicker">Hustle plan</span><h3>${esc(move)}</h3><p>${esc(why)}</p></div>
      <div class="release-plan-plan-stats"><span>${esc(tag)}</span><b>${ventures.length} venture${ventures.length===1?'':'s'}</b><small>${q||0} quick moves logged</small></div>
    </section>`;
    insertAfterHeader('hustle',html);
  }

  function cleanLabels(root=document){
    try{
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){return /(Best move this year|Family status is summarized|Relationship and family signals|With a trusted partner|Choose a stable path|quick gigs pay once|Build cash and credit|available|Always available)/i.test(n.nodeValue||'')?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_SKIP;}});
      const nodes=[]; while(walker.nextNode())nodes.push(walker.currentNode);
      nodes.forEach(n=>{ n.nodeValue=(n.nodeValue||'')
        .replace(/Best move this year/gi,'')
        .replace(/Family status is summarized here so Love stays clean and does not duplicate another full tab\.?/gi,'')
        .replace(/Relationship and family signals are summarized here without opening a duplicate Family panel\.?/gi,'')
        .replace(/\b\d+\s+available\b/gi,'')
        .replace(/Always available/gi,'')
        .replace(/\s{2,}/g,' ');
      });
    }catch(_){ }
  }

  function polishTab(name){
    const panel=$('#tab-'+name); if(!panel)return;
    if(name==='love')patchLove();
    if(name==='career')patchCareer();
    if(name==='assets')patchAssets();
    if(name==='hustle')patchHustle();
    cleanLabels(panel);
  }
  function polishActive(){
    setLabels();
    stripPhaseLabels(document);
    ['love','career','assets','hustle'].forEach(polishTab);
    const active=$('.tab-panel.active'); if(active)cleanLabels(active);
  }
  function patchUI(){
    if(!window.UI||UI._release12Patched)return;
    const oldRender=UI._renderTab?.bind(UI);
    UI._renderTab=function(name){
      const out=oldRender?oldRender(name):undefined;
      requestAnimationFrame(()=>polishTab(name));
      setTimeout(()=>polishTab(name),80);
      return out;
    };
    const oldTab=UI.tab?.bind(UI);
    UI.tab=function(name){
      const out=oldTab?oldTab(name):undefined;
      requestAnimationFrame(()=>polishTab(name));
      setTimeout(()=>polishTab(name),80);
      return out;
    };
    UI._release12Patched=true;
  }
  function shouldPolishAfterClick(target){
    if(!target)return true;
    // Do not repolish after gameplay action clicks inside tab content.
    // These delayed DOM edits caused visual jumps after value-only actions.
    if(target.closest?.('.tab-panel,.content-area,.game-main'))return false;
    return true;
  }
  function boot(){ setLabels(); stripPhaseLabels(document); patchUI(); polishActive(); setTimeout(polishActive,180); setTimeout(polishActive,700); }
  document.addEventListener('DOMContentLoaded',boot);
  window.addEventListener('load',boot);
  document.addEventListener('click',e=>{ if(shouldPolishAfterClick(e.target))setTimeout(polishActive,60); },true);
  window.ReleaseSections={BUILD,boot,polishTab};
})();
