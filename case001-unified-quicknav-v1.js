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
 function markRead(){
  decisionButton.dataset.newDecision="false";
  decisionButton.setAttribute("aria-label","Перейти к решениям");
 }
 function clearDecisionFeedback(){
  feedback.hidden=true;
  feedback.textContent="";
  markRead();
 }
 document.getElementById("caseTitle") &&
  new MutationObserver(clearDecisionFeedback).observe(
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
 let lastMode=null;
 let lastCount=null;
 let unread=false;
 let frame=0;
 function updateCount(){
  const parsed=Number.parseInt(counter.textContent.trim(),10);
  const count=Number.isFinite(parsed)?parsed:0;
  if(lastCount!==null&&count>lastCount)unread=true;
  lastCount=count;
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
  if(game.hidden)clearDecisionFeedback();
  scheduleActive();
 }
 function syncLayout(){
  if(lastMode!==compact.matches){
   detail.open=!compact.matches;
   lastMode=compact.matches;
  }
  visibility();
 }
 function jump(target){
  if(!target)return;
  const behavior=window.matchMedia("(prefers-reduced-motion: reduce)").matches?
   "auto":"smooth";
  target.scrollIntoView({behavior,block:"start"});
  target.focus({preventScroll:true});
  scheduleActive();
 }
 scene.tabIndex=-1;
 choices.tabIndex=-1;
 nav.addEventListener("click",event=>{
  const button=event.target.closest("button[data-go]");
  if(!button)return;
  const go=button.dataset.go;
  if(go==="scene"){jump(scene);return}
  if(go==="choices"){
   jump(feedback.hidden?choices:feedback);
   markRead();
   return;
  }
  if(go==="evidence"||go==="deduction"){
   if(go==="evidence"){unread=false;updateCount()}
   bridge.dataset.tool=go==="deduction"?"deduction":"evidence";
   bridge.click();
   visibility();
  }
 });
 new MutationObserver(updateCount).observe(counter,{
  childList:true,characterData:true,subtree:true
 });
 if(modal)new MutationObserver(scheduleActive).observe(modal,{
  attributes:true,attributeFilter:["hidden","data-mode"]
 });
 new MutationObserver(visibility).observe(game,{
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
