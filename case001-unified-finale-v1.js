/* Read-only Case 001 closing-report projection in the Case 002 visual language.
   No save writes, achievement calculations, plot changes or new rewards. */
(()=>{
 "use strict";
 const game=document.getElementById("caseGame");
 const paper=game?.querySelector(".case-paper");
 if(!game||!paper)return;
 const knownLinks=new Set([
  "След склада D-17","Деньги и двойной учёт","Путь груза",
  "Слова Артура","Две версии разговора","Уничтоженные записи"
 ]);
 const choiceHeading=[...paper.children].find(child=>
  child.classList.contains("case-section-label")&&
  child.textContent.trim()==="ВАШЕ РЕШЕНИЕ");
 function pickState(){
  const heroId=window.BirminghamHero?.selectedId||"jack";
  let state,conclusions;
  try{
   state=JSON.parse(localStorage.getItem("birmingham_case_smol_heath_v1_"+heroId)||"null");
   conclusions=JSON.parse(localStorage.getItem("birmingham_case_v20_findings_"+heroId)||"null");
  }catch{return null}
  if(!state||!/^ending(?:Rescue|Evidence|Deal|Truth|Power|Death)$/.test(state.node))return null;
  const names=conclusions?.started===state.started&&Array.isArray(conclusions.deductions)
   ? [...new Set(conclusions.deductions.filter(x=>knownLinks.has(x)))]:[];
  const hero=window.BirminghamHero?.heroes?.find(h=>h.id===heroId);
  return {state,hero,heroId,names};
 }
 function el(tag,cls,value){
  const e=document.createElement(tag);
  if(cls)e.className=cls;
  if(value!==undefined)e.textContent=value;
  return e;
 }
 function refreshArchive(report,data){
  const note=report.querySelector(".case001-finale-archive-note");
  if(!note)return;
  const result=window.BirminghamCampaign?.completionStatus(data.heroId,data.state.started,data.state.node)||{status:"unconfirmed"};
  note.dataset.status=result.status;
  const message=result.status==="verified"?
   "Итог и уникальный знак подтверждены в локальном архиве. Повторный исход не даёт второй награды.":
   result.status==="damaged"?"Архив требует проверки. Итог или награда не подтверждены; данные не удалены.":
   result.status==="unavailable"?"Хранилище недоступно. Запись итога и награды не подтверждена.":
   "Расследование завершено, но запись итога или уникального знака пока не подтверждена.";
  if(note.textContent!==message)note.textContent=message;
 }
 function decorate(){
  const report=paper.querySelector(":scope > .v33-ending-report");
  if(!report||game.hidden){
   if(choiceHeading&&choiceHeading.textContent!=="ВАШЕ РЕШЕНИЕ")
    choiceHeading.textContent="ВАШЕ РЕШЕНИЕ";
   return;
  }
  if(choiceHeading&&choiceHeading.textContent!=="СЛЕДУЮЩИЙ ШАГ")
   choiceHeading.textContent="СЛЕДУЮЩИЙ ШАГ";
  const data=pickState();if(!data)return;
  if(report.dataset.unifiedFinale==="true"){refreshArchive(report,data);return;}
  report.dataset.unifiedFinale="true";
  report.setAttribute("aria-label","Итог Дела №001");
  const kicker=report.querySelector(".v33-ending-head small");
  if(kicker)kicker.textContent="БИРМИНГЕМ · ДЕЛО №001 ЗАКРЫТО";
  const subtitle=el("p","case001-finale-subtitle",
   "Герой: "+(data.hero?.name||"участник ближнего круга")+
   " · Завершённое расследование");
  const metrics=report.querySelector(".v33-ending-metrics");
  if(metrics)report.insertBefore(subtitle,metrics);

  /* Only clues already shown by Case 001 and verified findings from this
     exact attempt. This is not an alternate story or achievement record. */
  const evidence=[...game.querySelectorAll("#caseInventory .case-item")].map(item=>
   item.querySelector("span")?.textContent?.trim()||"").filter(Boolean);
  const materials=el("details","case001-finale-materials");
  materials.append(el("summary","",
   "МАТЕРИАЛЫ ДЕЛА · "+evidence.length+" УЛИК · "+data.names.length+" СВЯЗЕЙ"));
  const body=el("div","case001-finale-materials-body");
  if(evidence.length){
   const section=el("section","");
   section.append(el("h4","","СОБРАННЫЕ УЛИКИ"));
   const list=el("ul","");
   for(const name of evidence)list.append(el("li","",name));
   section.append(list);body.append(section);
  }
  if(data.names.length){
   const section=el("section","");
   section.append(el("h4","","ПОДТВЕРЖДЁННЫЕ СВЯЗИ"));
   const list=el("ul","");
   for(const name of data.names)list.append(el("li","",name));
   section.append(list);body.append(section);
  }
  if(!evidence.length&&!data.names.length)
   body.append(el("p","","В этом прохождении не сохранены улики или подтверждённые связи."));
  materials.append(body);report.append(materials);
  const status=el("p","case001-finale-archive-note");
  status.setAttribute("role","status");report.append(status);refreshArchive(report,data);
  const actions=el("nav","case001-finale-actions");
  actions.setAttribute("aria-label","После завершения Дела №001");
  const archive=el("button","","ОТКРЫТЬ АРХИВ ДОСТИЖЕНИЙ");
  archive.type="button";
  archive.addEventListener("click",()=>window.BirminghamCampaign?.open("campaignAchievements"));
  const map=el("button","secondary","ВЕРНУТЬСЯ К КАРТЕ");
  map.type="button";map.addEventListener("click",()=>{
   document.getElementById("caseBack")?.click();
   const district=document.querySelector('#districts:not([hidden]) .map-pin[data-district="small-heath"]');
   if(!district)return;
   if(!district.classList.contains("selected"))district.click();
   district.focus({preventScroll:true});
  });
  actions.append(archive,map);report.append(actions);
 }
 new MutationObserver(decorate).observe(paper,{childList:true});
 new MutationObserver(decorate).observe(game,{attributes:true,attributeFilter:["hidden"]});
 document.addEventListener("birmingham:case-findings-changed",decorate);
 window.addEventListener("storage",event=>{
  if(event.key===null||event.key==="birmingham_campaign_records_v1"||event.key==="birmingham_campaign_unique_rewards_v1")decorate();
 });
 decorate();
})();
