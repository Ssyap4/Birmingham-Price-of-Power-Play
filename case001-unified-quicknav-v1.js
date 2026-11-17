/* Case 001 thumb navigation, delegating to the existing evidence board.
   Read-only: no new evidence, plot decisions, reward or save state. */
(()=>{
 "use strict";
 const game=document.getElementById("caseGame");
 const inventory=game?.querySelector("#caseInventory");
 const scene=game?.querySelector("#caseScene");
 const choices=game?.querySelector("#caseChoices");
 const counter=game?.querySelector("#caseJournalCount");
 if(!game||!inventory||!scene||!choices||!counter)return;
 const compact=window.matchMedia("(orientation: portrait) and (max-width: 700px)");
 const detail=document.createElement("details");
 detail.className="case001-inline-evidence";
 const summary=document.createElement("summary");
 detail.append(summary);
 inventory.before(detail);
 detail.append(inventory);
 const nav=document.createElement("nav");
 nav.id="case001QuickNav";
 nav.className="case001-quick-nav";
 nav.setAttribute("aria-label","Быстрый переход по Делу №001");
 nav.innerHTML='<button type="button" data-go="scene">СЦЕНА</button>'+
  '<button type="button" data-go="choices">РЕШЕНИЯ</button>'+
  '<button type="button" data-go="evidence">УЛИКИ <span class="case001-quick-count" aria-hidden="true">0</span></button>'+
  '<button type="button" data-go="deduction">ДОСКА</button>';
 nav.hidden=true;
 document.body.append(nav);
 const buttons=[...nav.querySelectorAll("button")];
 const buttonBy=(go)=>nav.querySelector('button[data-go="'+go+'"]');
 // Display only: the existing story engine remains sole owner of gates.
 const feedback=document.createElement("p");
 feedback.id="case001DecisionFeedback";
 feedback.className="case001-decision-feedback";
 feedback.hidden=true;
 feedback.tabIndex=-1;
 feedback.setAttribute("role","status");
 feedback.setAttribute("aria-live","polite");
 choices.before(feedback);
 const decisionButton=buttonBy("choices");
 const sceneButton=buttonBy("scene");
 let readingPoint=null;
 function clearReadingPoint(){
  readingPoint=null;
  sceneButton.removeAttribute("data-return-point");
  sceneButton.setAttribute("aria-label","Вернуться к началу сцены");
 }
 function rememberReadingPoint(){
  // Only capture when leaving the scene, not on repeated decisions taps.
  if(readingPoint||choices.getBoundingClientRect().top<=window.innerHeight*.43)return;
  const anchors=[scene,game.querySelector(".case-dialogue:not([hidden])"),game.querySelector("#caseText")]
   .filter(el=>el&&el.getClientRects().length);
  const anchor=anchors.filter(el=>el.getBoundingClientRect().top<=24).pop()||scene;
  readingPoint={anchor,offset:-anchor.getBoundingClientRect().top,hero:window.BirminghamHero?.selectedId,width:window.innerWidth};
  sceneButton.dataset.returnPoint="true";
  sceneButton.setAttribute("aria-label","Вернуться к месту чтения");
 }
 function restoreReadingPoint(){
  const point=readingPoint;
  clearReadingPoint();
  if(!point||!point.anchor.isConnected||!point.anchor.getClientRects().length||
     point.hero!==window.BirminghamHero?.selectedId||point.width!==window.innerWidth)return false;
  const y=window.scrollY+point.anchor.getBoundingClientRect().top+point.offset;
  point.anchor.tabIndex=-1;
  point.anchor.focus({preventScroll:true});
  window.scrollTo({top:Math.max(0,y),left:0,behavior:"instant"});
  scheduleActive();
  return true;
 }
 clearReadingPoint();
 function markRead(){
  decisionButton.dataset.newDecision="false";
  decisionButton.setAttribute("aria-label",scene.dataset.ending?"Перейти к итогу":"Перейти к решениям");
 }
 function clearDecisionFeedback(){
  feedback.hidden=true;
  feedback.textContent="";
  markRead();
 }
 document.getElementById("caseTitle") &&
  new MutationObserver(()=>{clearDecisionFeedback();clearReadingPoint();}).observe(
   document.getElementById("caseTitle"),{childList:true,characterData:true,subtree:true});
 // The Case 001 engine handles this event without replaying the scene.
 // Capture before its listener, then compare the updated DOM in a microtask.
 document.addEventListener("birmingham:case-findings-changed",event=>{
  if(game.hidden||!compact.matches)return;
  const hero=window.BirminghamHero?.selectedId||"jack";
  if(event.detail?.heroId!==hero)return;
  let sameAttempt=false;
  try{
   const saved=JSON.parse(localStorage.getItem(
    "birmingham_case_smol_heath_v1_"+hero)||"null");
   sameAttempt=saved?.started===event.detail?.started;
  }catch{}
  if(!sameAttempt)return;
  const before=[...choices.querySelectorAll(":scope > .case-choice")]
   .map(button=>button.disabled);
  queueMicrotask(()=>{
   if(game.hidden)return;
   const after=[...choices.querySelectorAll(":scope > .case-choice")];
   if(before.length!==after.length)return;
   // Health UI can be inserted before the choices after this module loads.
   // Keep the notice immediately adjacent to the decisions, not above HP.
   choices.before(feedback);
   const unlocked=after.filter((button,i)=>before[i]&&!button.disabled);
   if(unlocked.length){
    const count=unlocked.length;
    feedback.textContent=count===1?
     "НОВЫЙ ПУТЬ · Открыто решение: "+unlocked[0].textContent.trim():
     "НОВЫЕ ПУТИ · Открыто решений: "+count+". Проверь доступные варианты.";
    decisionButton.dataset.newDecision="true";
    decisionButton.setAttribute("aria-label","Решения: открыты новые варианты");
   }else{
    feedback.textContent="Вывод сохранён на доске. Для новых решений могут потребоваться другие доказательства.";
   }
   feedback.hidden=false;
  });
 },true);
 buttonBy("evidence").setAttribute("aria-description","Найденные предметы и их описание");
 buttonBy("deduction").setAttribute("aria-description","Сопоставление найденных улик и выводы");
 // Real Case 001 modal capture handler only accepts button[data-tool]
 // events descending from the Case 001 screen, so bridge to that handler.
 const bridge=document.createElement("button");
 bridge.type="button";bridge.hidden=true;
 bridge.className="case001-board-bridge";
 game.append(bridge);
 const modal=game.querySelector(".v33-shade");
 function syncEndingLabel(){
  const label=scene.dataset.ending?"ИТОГ":"РЕШЕНИЯ";
  if(decisionButton.textContent!==label)decisionButton.textContent=label;
  if(scene.dataset.ending)markRead();
 }
 new MutationObserver(syncEndingLabel).observe(scene,{attributes:true,attributeFilter:["data-ending"]});
 syncEndingLabel();
 let lastMode=null;
 let lastCount=null;
 let knownItems=null;
 const unreadItems=new Map();
 let unread=false;
 const discovery=document.createElement('section');
 discovery.className='case001-evidence-discovery';discovery.hidden=true;
 const discoveryText=document.createElement('p');discoveryText.setAttribute('role','status');discoveryText.setAttribute('aria-live','polite');
 const discoveryButton=document.createElement('button');discoveryButton.type='button';discoveryButton.textContent='ОТКРЫТЬ УЛИКИ ↗';
 discovery.tabIndex=-1;discovery.append(discoveryText,discoveryButton);feedback.before(discovery);
 let frame=0;
 function updateCount(){
  const parsed=Number.parseInt(counter.textContent.trim(),10);
  const count=Number.isFinite(parsed)?parsed:0;
  lastCount=count;
  const items=new Map([...inventory.querySelectorAll('[data-evidence-id]')].map(el=>[el.dataset.evidenceId,el.querySelector('span')?.textContent.trim()||el.textContent.trim()]));
  if(!game.hidden&&knownItems!==null){
   // An attempt reset removes items; never carry unread clues into a new run.
   if([...knownItems].some(id=>!items.has(id)))unreadItems.clear();
   else for(const [id,name] of items)if(!knownItems.has(id))unreadItems.set(id,name);
  }
  knownItems=game.hidden?null:new Set(items.keys());
  unread=unreadItems.size>0;discovery.hidden=!unread;
  const message=unread?'НОВЫЕ УЛИКИ · '+[...unreadItems.values()].join(' · '):'';
  if(discoveryText.textContent!==message)discoveryText.textContent=message;
  summary.textContent="СОБРАННЫЕ УЛИКИ · "+count+" · раскрыть список";
  const evidence=buttonBy("evidence");
  evidence.querySelector(".case001-quick-count").textContent=String(count);
  evidence.dataset.unread=unread?"true":"false";
  evidence.setAttribute("aria-label",
   "Открыть инвентарь: "+count+" улик"+(unread?", есть новые":""));
 }
 // The original engine sets the exact missing clue only in a mouse title.
 // Surface that existing reason on narrow touch screens; do not change gating.
 function explainLockedChoices(){
  for(const choice of choices.querySelectorAll(".case-choice:disabled[title]")){
   const reason=choice.getAttribute("title")?.trim();
   if(!reason?.startsWith("Нужна улика:")||choice.dataset.case001GateHint===reason)continue;
   choice.dataset.case001GateHint=reason;
   const label=choice.textContent.replace(/\s*·\s*нужна улика$/u,"").trim();
   if(label!==choice.textContent)choice.textContent=label;
   choice.setAttribute("aria-label",label+". "+reason);
  }
 }
 new MutationObserver(explainLockedChoices).observe(choices,{
  childList:true
 });
 explainLockedChoices();
 function active(){
  if(nav.hidden)return;
  let current;
  if(modal&&!modal.hidden){
   current=modal.dataset.mode==="deduction"?"deduction":"evidence";
  }else{
   const threshold=window.innerHeight*.43;
   current=choices.getBoundingClientRect().top<=threshold?"choices":"scene";
  }
  for(const b of buttons){
   if(b.dataset.go===current)b.setAttribute("aria-current","location");
   else b.removeAttribute("aria-current");
  }
 }
 function scheduleActive(){
  if(frame)return;
  frame=requestAnimationFrame(()=>{frame=0;active()});
 }
 function visibility(){
  nav.hidden=game.hidden||!compact.matches||
   document.body.classList.contains("v34-board-open");
  if(game.hidden){clearDecisionFeedback();clearReadingPoint();}
  scheduleActive();
 }
 function syncLayout(){
  if(readingPoint&&readingPoint.width!==window.innerWidth)clearReadingPoint();
  if(lastMode!==compact.matches){
   clearReadingPoint();
   detail.open=!compact.matches;
   lastMode=compact.matches;
  }
  visibility();
 }
 function jump(target){
  if(!target)return;
  // Direct scroll avoids Safari's animated repositioning during scene layout.
  target.scrollIntoView({behavior:"instant",block:"start"});
  target.focus({preventScroll:true});
  scheduleActive();
 }
 scene.tabIndex=-1;
 choices.tabIndex=-1;
 nav.addEventListener("click",event=>{
  const button=event.target.closest("button[data-go]");
  if(!button)return;
  const go=button.dataset.go;
  if(go==="scene"){if(!restoreReadingPoint())jump(scene);return}
  if(go==="choices"){
   rememberReadingPoint();
   const award=game.querySelector('#case001UnlockReceipt:not([hidden])');
   jump(!discovery.hidden?discovery:!feedback.hidden?feedback:award||choices);
   markRead();
   return;
  }
  if(go==="evidence"||go==="deduction"){
   if(go==="evidence"){unreadItems.clear();updateCount()}
   bridge.dataset.tool=go==="deduction"?"deduction":"evidence";
   bridge.click();
   visibility();
  }
 });
 discoveryButton.addEventListener('click',()=>{unreadItems.clear();updateCount();bridge.dataset.tool='evidence';bridge.click();visibility()});
 detail.addEventListener('toggle',()=>{if(detail.open&&!game.hidden){unreadItems.clear();updateCount()}});
 new MutationObserver(updateCount).observe(inventory,{childList:true,subtree:true});
 new MutationObserver(updateCount).observe(counter,{
  childList:true,characterData:true,subtree:true
 });
 if(modal)new MutationObserver(()=>{if(!modal.hidden){unreadItems.clear();updateCount()}scheduleActive()}).observe(modal,{
  attributes:true,attributeFilter:["hidden","data-mode"]
 });
 // Entering or resuming a case is not a fresh clue discovery. The real
 // item counter may jump when switching heroes; only changes inside an
 // already visible investigation should set the NEW badge.
 new MutationObserver(()=>{
  if(!game.hidden){
   unreadItems.clear();knownItems=null;
   unread=false;
   lastCount=null;
   updateCount();
  }else{knownItems=null;unreadItems.clear();updateCount()}
  visibility();
 }).observe(game,{
  attributes:true,attributeFilter:["hidden"]
 });
 new MutationObserver(visibility).observe(document.body,{
  attributes:true,attributeFilter:["class"]
 });
 window.addEventListener("scroll",scheduleActive,{passive:true});
 window.addEventListener("resize",syncLayout,{passive:true});
 window.addEventListener("orientationchange",syncLayout,{passive:true});
 updateCount();
 syncLayout();
})();
