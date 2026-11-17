/* One presentation layer shared with the Case 002 mobile design vocabulary.
 * Uses Case 001's existing data and board, never owns state or saves. */
(()=>{
 "use strict";
 const game=document.getElementById("caseGame");
 const layout=game?.querySelector(".case-v18-layout");
 const topline=game?.querySelector(".case-topline");
 const chapter=document.getElementById("caseChapter");
 const title=document.getElementById("caseTitle");
 const count=document.getElementById("caseJournalCount");
 const progress=document.getElementById("caseProgressBar");
 const choices=document.getElementById("caseChoices");
 if(!game||!layout||!topline||!chapter||!title||!count||!progress||!choices)return;
 const compact=window.matchMedia("(orientation: portrait) and (max-width: 700px)");
 const pulse=document.createElement("section");
 pulse.id="case001CampaignPulse";
 pulse.className="case001-campaign-pulse";
 pulse.setAttribute("aria-label","Текущее состояние расследования №001");
 pulse.innerHTML=
  '<div class="case001-pulse-heading"><strong>ДЕЛО №001 · РАССЛЕДОВАНИЕ</strong>'+
  '<span id="case001PulseChapter"></span></div>'+
  '<div class="case001-pulse-metrics">'+
  '<div><small>НАЙДЕНО УЛИК</small><b id="case001PulseClues">0</b></div>'+
  '<div><small>СВЯЗЕЙ УСТАНОВЛЕНО</small><b id="case001PulseLinks">0</b></div>'+
  '<div><small>СОСТОЯНИЕ</small><b id="case001PulseHealth">—</b></div>'+
  '</div><div class="case001-pulse-track" aria-hidden="true">'+
  '<i id="case001PulseProgress"></i></div>';
 topline.after(pulse);
 const goal=game.querySelector(".case-v19-goals");
 let goalDrawer=null,goalLabel=null,lastCompact=null;
 if(goal){
  goalDrawer=document.createElement("details");
  goalDrawer.id="case001GoalDrawer";
  goalDrawer.className="case001-goal-drawer";
  const summary=document.createElement("summary");
  summary.textContent="ОРИЕНТИРЫ РАССЛЕДОВАНИЯ";
  goalLabel=document.createElement("span");
  goalLabel.className="case001-goal-count";
  summary.append(goalLabel);
  goal.before(goalDrawer);goalDrawer.append(summary,goal);
  const goals=goal.querySelector("#v19Goals");
  if(goals){
   const updateGoals=()=>{
    const items=[...goals.querySelectorAll("li")];
    const done=items.filter(li=>li.classList.contains("done")).length;
    goalLabel.textContent="· "+done+" / "+items.length;
   };
   new MutationObserver(updateGoals).observe(goals,{childList:true,subtree:true});
   updateGoals();
  }
 }
 function syncMode(){
  if(lastCompact===compact.matches)return;
  lastCompact=compact.matches;
  if(goalDrawer)goalDrawer.open=!compact.matches;
 }
 const knownLinks=new Set([
  "След склада D-17","Деньги и двойной учёт","Путь груза",
  "Слова Артура","Две версии разговора","Уничтоженные записи"
 ]);
 function linksForCurrentAttempt(){
  const hero=window.BirminghamHero?.selectedId||"jack";
  try{
   const save=JSON.parse(localStorage.getItem("birmingham_case_smol_heath_v1_"+hero)||"null");
   const meta=JSON.parse(localStorage.getItem("birmingham_case_v20_findings_"+hero)||"null");
   if(!save||!meta||save.started!==meta.started||!Array.isArray(meta.deductions))return 0;
   return new Set(meta.deductions.filter(link=>knownLinks.has(link))).size;
  }catch{return 0}
 }
 let observedHealth=null;
 const healthObserver=new MutationObserver(update);
 const paper=game.querySelector(".case-paper");
 const choiceLabel=paper?[...paper.children].find(el=>
  el.classList.contains("case-section-label") &&
  (el.textContent.trim()==="ВАШЕ РЕШЕНИЕ"||el.textContent.trim()==="СЛЕДУЮЩИЙ ШАГ")):null;
 function update(){
  syncMode();
  pulse.hidden=game.hidden;
  if(game.hidden)return;
  pulse.querySelector("#case001PulseChapter").textContent=chapter.textContent.trim();
  pulse.querySelector("#case001PulseClues").textContent=count.textContent.trim()||"0";
  pulse.querySelector("#case001PulseLinks").textContent=String(linksForCurrentAttempt());
  const health=game.querySelector("#caseHealthStatus");
  if(health && observedHealth!==health){
   healthObserver.disconnect();
   healthObserver.observe(health,{childList:true,characterData:true,subtree:true});
   observedHealth=health;
  }
  // Move existing health status before the decision heading, not within
  // the numbered decision list. The engine continues to update this node.
  if(health&&choiceLabel&&health.parentElement===paper &&
    health.nextElementSibling!==choiceLabel)choiceLabel.before(health);
  const hp=health?.querySelector(".case-health-head b")?.textContent.trim();
  pulse.querySelector("#case001PulseHealth").textContent=hp||"—";
  const amount=Number.parseFloat(progress.style.width)||0;
  pulse.querySelector("#case001PulseProgress").style.width=Math.max(0,Math.min(amount,100))+"%";
 }
 new MutationObserver(update).observe(chapter,{childList:true,characterData:true,subtree:true});
 new MutationObserver(update).observe(count,{childList:true,characterData:true,subtree:true});
 new MutationObserver(update).observe(progress,{attributes:true,attributeFilter:["style"]});
 new MutationObserver(update).observe(game,{attributes:true,attributeFilter:["hidden"]});
 if(paper)new MutationObserver(update).observe(paper,{childList:true});
 document.addEventListener("birmingham:case-findings-changed",update);
 window.addEventListener("resize",syncMode,{passive:true});
 window.addEventListener("orientationchange",syncMode,{passive:true});
 // V33 board now owns its sole selection guide and focus restoration.
 update();
})();