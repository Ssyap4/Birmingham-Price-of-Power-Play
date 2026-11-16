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
  if(go==="choices"){jump(choices);return}
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
