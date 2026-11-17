/* Unified campaign archive: read-only Case 002 projection beside intact Case 001.
 * Never grant achievements, mint rewards, flush completions or modify any save.
 * Case 002's own engine remains the sole writer for its namespace.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else {root.BirminghamCase002CampaignArchive=api;api.attach(root);}
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const CASE_NAME="Последний поезд из Бирмингема";
const SAVE_VERSION=3;
function readArray(store,key,validate){
 if(!store)return {status:"unavailable",rows:[]};
 try{
  const data=store.getItem(key);
  if(data===null)return {status:"ready",rows:[]};
  const rows=JSON.parse(data);
  if(!Array.isArray(rows)||rows.some(r=>!validate(r))||
     (key.includes("rewards")&&new Set(rows).size!==rows.length))
   return {status:"damaged",rows:[]};
  return {status:"ready",rows};
 }catch(_){return {status:"damaged",rows:[]};}
}
function validRecord(row,contract){
 return !!row&&row.caseId==="002"&&contract.heroes.includes(row.heroId)&&
  contract.endings.some(e=>e.id===row.ending)&&
  typeof row.attemptId==="string"&&row.attemptId.length>0&&
  Number.isFinite(row.started)&&row.started>0&&
  Number.isFinite(row.finished)&&row.finished>=row.started&&
  Array.isArray(row.evidence)&&row.evidence.every(id=>
   typeof id==="string"&&contract.supportedEvidence.includes(id))&&
  row.witnesses&&typeof row.witnesses==="object"&&!Array.isArray(row.witnesses)&&
  row.flags&&typeof row.flags==="object"&&!Array.isArray(row.flags);
}
function validSave(state,hero,contract,nodes){
 return !!state&&state.version===SAVE_VERSION&&
  state.caseId==="002"&&state.hero===hero&&
  typeof state.attemptId==="string"&&state.attemptId.length>0&&
  Number.isFinite(state.startedAt)&&state.startedAt>0&&
  typeof state.node==="string"&&nodes.has(state.node)&&
  Array.isArray(state.history)&&Array.isArray(state.routes)&&
  Array.isArray(state.evidence)&&state.evidence.every(id=>
   contract.supportedEvidence.includes(id))&&
  typeof state.finished==="boolean"&&
  (state.finished?contract.endings.some(e=>e.id===state.ending):
   state.ending===null);
}
function snapshot(store,contract,engine,achievements,graph){
 if(!contract||!engine||!achievements||!graph||
   !Array.isArray(contract.heroes)||contract.heroes.length!==5||
   !Array.isArray(contract.endings)||contract.endings.length!==7||
   !Array.isArray(graph.nodes)||achievements.catalog.length!==18)
  return {status:"unavailable",reason:"contract"};
 const nodes=new Set(graph.nodes.map(n=>n.id));
 const outcomes=new Map(contract.endings.map(e=>[e.id,e.title]));
 let records=readArray(store,engine.RECORD_KEY,r=>validRecord(r,contract));
 // Two different results cannot come from the same immutable attempt ID.
 // Report this as a damaged archive rather than counting phantom outcomes.
 if(records.status==="ready"&&
    new Set(records.rows.map(r=>r.attemptId)).size!==records.rows.length)
  records={status:"damaged",rows:[]};
 const validKeys=new Set(contract.heroes.flatMap(hero=>
  contract.endings.map(e=>"002:"+hero+":"+e.id)));
 const rewards=readArray(store,engine.REWARD_KEY,key=>
  typeof key==="string"&&validKeys.has(key));
 const completed=records.rows;
 const combos=new Set(completed.map(r=>"002:"+r.heroId+":"+r.ending));
 const confirmed=rewards.status==="ready"?
  new Set(rewards.rows.filter(key=>combos.has(key))):new Set();
 const orphaned=records.status==="ready"&&rewards.status==="ready"?
  rewards.rows.filter(key=>!combos.has(key)).length:0;
 const withoutSeals=records.status==="ready"&&rewards.status==="ready"?
  [...combos].filter(key=>!confirmed.has(key)).length:0;
 let earned={status:"unavailable",items:[],rows:[]};
 if(store)try{earned=achievements.read(store)}catch(_){earned={status:"damaged",items:[],rows:[]};}
 if(earned.status==="ready"&&earned.rows.some(row=>
  !contract.heroes.includes(row.hero)||!row.attemptId||
  !nodes.has(row.scene)))earned={status:"damaged",items:[],rows:[]};
 const saves={};
 for(const hero of contract.heroes){
  if(!store){saves[hero]={status:"unavailable"};continue;}
  try{
   const raw=store.getItem(engine.SAVE_PREFIX+hero);
   if(raw===null){saves[hero]={status:"empty"};continue;}
   const state=JSON.parse(raw);
   const stage=graph.nodes.find(scene=>scene.id===state.node);
  saves[hero]=validSave(state,hero,contract,nodes)?
    {status:"ready",node:state.node,sceneTitle:stage?.title||"Текущая сцена",
     sceneChapter:stage?.chapter||null,finished:state.finished,
     ending:state.ending,evidence:state.evidence.length}:
    {status:"damaged"};
  }catch(_){saves[hero]={status:"damaged"};}
 }
 return {
  status:"ready",records,completed,combos,confirmed,orphaned,withoutSeals,
  rewards,earned,saves,outcomes,heroes:contract.heroes,
  catalog:achievements.catalog,
  totalCombinations:contract.heroes.length*contract.endings.length
 };
}
function make(doc,tag,cls,content){
 const el=doc.createElement(tag);
 if(cls)el.className=cls;
 if(content!==undefined)el.textContent=String(content);
 return el;
}
function appendText(doc,parent,tag,cls,content){
 const el=make(doc,tag,cls,content);parent.append(el);return el;
}
function sentence(archive){
 const alerts=[];
 if(archive.status!=="ready")return "Архив второго дела недоступен в этой сборке.";
 if(archive.records.status!=="ready")alerts.push("История №002 повреждена: данные не учитываются");
 if(archive.rewards.status!=="ready")alerts.push("Архив наград №002 недоступен или повреждён");
 if(archive.earned.status!=="ready")alerts.push("Архив достижений №002 недоступен или повреждён");
 if(archive.orphaned)alerts.push(
  "Ключей наград без подтверждённого прохождения: "+archive.orphaned);
 if(archive.withoutSeals)alerts.push(
  "Уникальных прохождений без записанного знака: "+archive.withoutSeals);
 if(Object.values(archive.saves).some(x=>x.status==="damaged"))
  alerts.push("Обнаружено повреждённое или несовместимое сохранение №002");
 return alerts.join(". ")+(alerts.length?".":"");
}
function showAlert(doc,container,archive){
 const message=sentence(archive);
 if(message)appendText(doc,container,"p","campaign-002-alert",message);
}
// The long mobile archive is navigable without forcing players to scroll
// past every hero or all 65 reward tiles. These are native 48px controls.
function jumpNav(doc,items,label){
 const nav=make(doc,"nav","campaign-002-jumps");
 nav.setAttribute("aria-label",label);
 for(const [id,title] of items){
  const button=appendText(doc,nav,"button","campaign-002-jump",title);
  button.type="button";button.dataset.jumpTo=id;
  button.addEventListener("click",()=>{
   const target=doc.getElementById(id);
   if(!target)return;
   if(target.tagName==="DETAILS")target.open=true;
   target.tabIndex=-1;
   target.scrollIntoView({block:"start",behavior:"auto"});
   const focusTarget=target.tagName==="DETAILS"?
    target.querySelector("summary")||target:target;
   focusTarget.focus({preventScroll:true});
  });
 }
 return nav;
}
function renderDossiers(doc,box,archive,heroes){
 const cards=[...box.querySelectorAll(".campaign-grid .campaign-card")];
 const nav=jumpNav(doc,archive.heroes.map(id=>[
  "campaignHero"+id,heroes.find(h=>h.id===id)?.name||id
 ]),"Переход к досье героя");
 const intro=box.querySelector(".campaign-intro");
 if(intro)intro.after(nav);else box.prepend(nav);
 archive.heroes.forEach((heroId,i)=>{
  const card=cards[i],body=card?.querySelector(".campaign-card-body");
  if(!body)return;
  card.id="campaignHero"+heroId;card.tabIndex=-1;
  const complete=archive.completed.filter(r=>r.heroId===heroId);
  const unique=new Set(complete.map(r=>r.ending));
  const title=appendText(doc,body,"h4","campaign-002-card-title",
   "ДЕЛО №002 · "+CASE_NAME);
  title.dataset.caseId="002";
  appendText(doc,body,"p","campaign-002-count",
   complete.length+" прохождений · "+unique.size+" / 7 разных концовок");
  const saved=archive.saves[heroId];
  if(saved?.status==="ready"){
   if(!saved.finished){
    appendText(doc,body,"p","campaign-002-progress",
     "В работе: «"+saved.sceneTitle+"» · улик: "+saved.evidence);
   }else if(!complete.some(r=>r.ending===saved.ending)){
    appendText(doc,body,"p","campaign-002-alert",
     "Завершённая попытка ожидает записи в архив.");
   }
  }else if(saved?.status==="damaged"){
   appendText(doc,body,"p","campaign-002-alert",
    "Сохранение требует проверки в самом деле.");
  }
  const badges=make(doc,"div","campaign-tags campaign-002-tags");
  for(const [ending,title] of archive.outcomes){
   const known=unique.has(ending);
   const b=appendText(doc,badges,"span",known?"earned":"locked",
    known?"✦ "+title:"◇ Закрытая концовка");
   b.dataset.ending=ending;b.dataset.unlocked=String(known);
  }
  body.append(badges);
  const future=body.querySelector(".campaign-future");
  if(future)future.textContent="Дело №002 доступно в Дигбете; новые истории появятся позже.";
  const returnButton=appendText(doc,body,"button",
   "campaign-002-back-to-heroes","↑ К СПИСКУ ГЕРОЕВ");
  returnButton.type="button";
  returnButton.addEventListener("click",()=>{
   nav.scrollIntoView({block:"start",behavior:"auto"});
   nav.querySelector("button")?.focus({preventScroll:true});
  });
 });
 showAlert(doc,box,archive);
}
function renderAchievements(doc,box,archive,oldAchievements,heroes){
 const intro=box.querySelector(".campaign-intro");
 if(intro)intro.textContent="Достижения и знаки обоих дел учитываются отдельно. В этом архиве показаны только сохранённые записи; повторное прохождение не создаёт новый знак.";
 const oldCount=Array.isArray(oldAchievements)?
  oldAchievements.length:0;
 // For Case 001 the existing archive is the authority; we never backfill it.
 const oldOpen=box.querySelectorAll(".campaign-award.unlocked").length;
 const originalRewards=box.querySelectorAll(".campaign-reward-card.earned").length;
 const top=make(doc,"section","campaign-002-overview");
 top.dataset.caseId="all";
 appendText(doc,top,"h3","campaign-group-title","СВОДКА РАССЛЕДОВАНИЙ");
 const total=make(doc,"div","campaign-002-metrics");
 for(const [label,value] of [
  ["ДОСТИЖЕНИЯ",oldOpen+archive.earned.items.length+" / "+(oldCount+18)],
  ["ЗНАКИ СУДЬБЫ",originalRewards+archive.confirmed.size+" / 65"],
  ["ДЕЛА В КАМПАНИИ","2"]
 ]){
  const cell=make(doc,"div","campaign-002-metric");
  appendText(doc,cell,"small","",label);
  appendText(doc,cell,"strong","",value);
  total.append(cell);
 }
 top.append(total);
 // Fold the original Case 001 achievement and reward cards rather than
 // forcing 18 + 30 tiles ahead of the Case 002 archive on a phone.
 const firstFold=make(doc,"details","campaign-002-fold campaign-002-first-fold");
 firstFold.id="campaignFirstCaseAchievements";
 const originalBody=make(doc,"div","campaign-002-fold-body");
 appendText(doc,firstFold,"summary","campaign-002-fold-summary",
  "ДЕЛО №001 · 18 ДОСТИЖЕНИЙ · 30 ЗНАКОВ");
 for(const node of [...box.children])if(node!==intro)originalBody.append(node);
 firstFold.append(originalBody);
 box.append(firstFold);
 if(intro)intro.after(jumpNav(doc,[
  ["campaignFirstCaseAchievements","ДЕЛО №001"],
  ["campaignSecondCaseAchievements","ДЕЛО №002"]
 ],"Быстрый переход между наградами двух дел"));
 box.prepend(top);
 // Preserve the original Case 001 cards and their live notification lifecycle.
 const headings=[...box.querySelectorAll("h3.campaign-group-title")];
 for(const heading of headings){
  if(heading.textContent==="Награды за уникальные судьбы")
   heading.textContent="Награды за уникальные судьбы · Дело №001";
 }
 const group=make(doc,"section","campaign-002-section");
 group.dataset.caseId="002";group.id="campaignSecondCaseAchievements";
 appendText(doc,group,"h3","campaign-group-title",
  "ДЕЛО №002 · ДОСТИЖЕНИЯ И НАГРАДЫ");
 appendText(doc,group,"p","campaign-intro",
  "Достижений: "+archive.earned.items.length+" / 18. Подтверждённых знаков: "+
  archive.confirmed.size+" / "+archive.totalCombinations+
  ". Новые достижения выдаются только внутри расследования.");
 const gained=new Set(archive.earned.items.map(x=>x.id));
 const grid=make(doc,"div","campaign-award-grid campaign-002-awards");
 for(const a of archive.catalog){
  const unlocked=gained.has(a.id);
  const card=make(doc,"article",
   "campaign-award campaign-002-achievement "+(unlocked?"unlocked":"locked"));
  card.dataset.achievementId=a.id;
  card.dataset.unlocked=String(unlocked);
  appendText(doc,card,"span","campaign-medal",unlocked?"✦":"◇");
  const info=make(doc,"div");
  // Mirror the in-case collection: locked outcomes must not reveal spoilers.
  appendText(doc,info,"strong","",unlocked?a.name:"НЕИЗВЕСТНОЕ ДОСТИЖЕНИЕ");
  appendText(doc,info,"p","",unlocked?a.description:
   "Условие откроется после получения.");
  appendText(doc,info,"small","",unlocked?"ОТКРЫТО · №002":"ЕЩЁ НЕ ОТКРЫТО");
  card.append(info);grid.append(card);
 }
 const milestones=make(doc,"details","campaign-002-fold campaign-002-milestone-fold");
 milestones.id="campaignSecondCaseMilestones";
 appendText(doc,milestones,"summary","campaign-002-fold-summary",
  "18 ДОСТИЖЕНИЙ №002 · ОТКРЫТО "+archive.earned.items.length+
  " · ПОКАЗАТЬ СПИСОК");
 milestones.append(grid);group.append(milestones);
 appendText(doc,group,"h4","campaign-002-subhead","35 уникальных знаков по персонажам");
 const list=make(doc,"div","campaign-002-reward-list");
 for(const heroId of archive.heroes){
  const hero=heroes.find(x=>x.id===heroId);
  const details=make(doc,"details","campaign-reward-group campaign-002-reward-group");
  details.dataset.hero=heroId;
  details.dataset.archiveFold="002:reward:"+heroId;
  const count=[...archive.outcomes].filter(([ending])=>
   archive.confirmed.has("002:"+heroId+":"+ending)).length;
  appendText(doc,details,"summary","", (hero?.name||heroId)+" · "+count+" / 7 знаков");
  const rewards=make(doc,"div","campaign-reward-grid");
  for(const [ending,title] of archive.outcomes){
   const key="002:"+heroId+":"+ending,has=archive.confirmed.has(key);
   const card=make(doc,"article","campaign-reward-card "+(has?"earned":"locked"));
   card.dataset.key=key;card.dataset.verified=String(has);
   appendText(doc,card,"span","campaign-medal",has?"✦":"◇");
   const info=make(doc,"div");
   appendText(doc,info,"strong","",has?title:"Неизвестный исход");
   appendText(doc,info,"small","",has?"Награда получена · №002":"Не получено · №002");
   card.append(info);rewards.append(card);
  }
  details.append(rewards);list.append(details);
 }
 group.append(list);
 showAlert(doc,group,archive);
 box.append(group);
}
function renderHistory(doc,box,archive,oldRuns,heroes){
 const intro=box.querySelector(".campaign-intro");
 if(intro)intro.textContent="Архив завершённых расследований обоих дел. Повторные попытки сохраняются в истории, но уникальные знаки считаются только один раз за сочетание «дело × герой × концовка».";
 const oldCombos=new Set(oldRuns.filter(r=>r.caseId==="001").map(r=>
  "001:"+r.heroId+":"+r.ending));
 const totals=[
  oldRuns.length+archive.completed.length,
  oldCombos.size+archive.combos.size+" / 65",
  Number(oldRuns.length>0)+Number(archive.completed.length>0)
 ];
 const summary=box.querySelector(".campaign-summary");
 if(summary){
  [...summary.children].forEach((cell,i)=>{
   const value=cell.querySelector("strong");
   if(value)value.textContent=String(totals[i]);
  });
 }
 const firstHeading=[...box.querySelectorAll(".campaign-group-title")].find(h=>
  h.textContent.startsWith("Дело №001 ·"));
 if(firstHeading){firstHeading.id="campaignFirstCaseHistory";firstHeading.tabIndex=-1;}
 const jumps=jumpNav(doc,[
  ["campaignFirstCaseHistory","ДЕЛО №001"],
  ["campaignSecondCaseHistory","ДЕЛО №002"]
 ],"Переход к истории одного из двух дел");
 if(summary)summary.after(jumps);else box.prepend(jumps);
 const future=[...box.querySelectorAll(".campaign-group-title")].find(h=>
  h.textContent==="Следующие дела");
 const group=make(doc,"section","campaign-002-section campaign-002-history");
 group.dataset.caseId="002";group.id="campaignSecondCaseHistory";
 appendText(doc,group,"h3","campaign-group-title","Дело №002 · "+CASE_NAME);
 if(!archive.completed.length){
  appendText(doc,group,"p","campaign-intro",
   archive.records.status==="ready"?
   "Завершённых прохождений №002 пока нет. Войти можно через Дигбет.":
   "История №002 не читается: исходы не будут показаны как подтверждённые.");
 }else{
  const entries=make(doc,"div","campaign-history-list");
  for(const r of [...archive.completed].sort((a,b)=>b.finished-a.finished)){
   const hero=heroes.find(h=>h.id===r.heroId),details=make(doc,"details","campaign-attempt campaign-002-attempt");
   details.dataset.attemptId=r.attemptId;
   details.dataset.archiveFold="002:attempt:"+r.attemptId;
   const heading=make(doc,"summary","campaign-attempt-summary");
   appendText(doc,heading,"strong","",hero?.name||r.heroId);
   appendText(doc,heading,"span","",archive.outcomes.get(r.ending)||r.ending);
   appendText(doc,heading,"small","",new Date(r.finished).toLocaleDateString("ru-RU")+
    " · "+r.evidence.length+" улик");
   details.append(heading);
   const body=make(doc,"div","campaign-attempt-detail");
   appendText(doc,body,"p","","Дело №002 · "+CASE_NAME);
   appendText(doc,body,"p","","Начало: "+new Date(r.started).toLocaleString("ru-RU")+
    " · Завершение: "+new Date(r.finished).toLocaleString("ru-RU"));
   const key="002:"+r.heroId+":"+r.ending;
   appendText(doc,body,"p","",archive.confirmed.has(key)?
    "Уникальный знак подтверждён.":
    "Знак исхода пока не подтверждён в архиве наград.");
   const safeguarded=Object.entries(r.witnesses).filter(([,status])=>
    status==="protected"||status==="evacuated").length;
   appendText(doc,body,"p","", "Защищено свидетелей: "+safeguarded+
    ". Улик: "+r.evidence.length+".");
   details.append(body);entries.append(details);
  }
  group.append(entries);
 }
 showAlert(doc,group,archive);
 if(future){
  future.before(group);
  future.textContent="Другие дела — впереди";
  const p=future.nextElementSibling;
  if(p?.classList.contains("campaign-intro"))
   p.textContent="Дела №001 и №002 доступны в Смолл-Хите и Дигбете. Новые расследования будут добавляться в этот архив.";
 }else box.append(group);
}
function append(id,box,oldRuns,root){
 const doc=root.document;
 const data=root.BirminghamCase002Data,engine=root.BirminghamCase002Engine;
 const achievements=root.BirminghamCase002Achievements;
 if(!data||!engine||!achievements){
  appendText(doc,box,"p","campaign-002-alert",
   "Архив №002 пока недоступен: не загружены данные второго дела.");
  return;
 }
 let store=null;
 try{store=root.localStorage}catch(_){}
 const archive=snapshot(store,data.contract,engine,achievements,data.graph);
 if(archive.status!=="ready"){
  appendText(doc,box,"p","campaign-002-alert",
   "Архив №002 не удалось открыть: данные контракта дела недоступны.");
  return;
 }
 const heroes=root.BirminghamHero?.heroes||[];
 const title=doc.querySelector("#"+id+" .campaign-head p");
 const heading=doc.querySelector("#"+id+" .campaign-head");
 // One persistent, direct way back into the playable Digbeth investigation.
 // The campaign map handles the hash without a second publication origin.
 if(heading&&!heading.querySelector(".campaign-002-to-digbeth")){
  const back=make(doc,"a","campaign-002-to-digbeth",
   "↗ К ДЕЛУ №002 · ДИГБЕТ");
  back.href="#district-digbeth";heading.append(back);
 }
 if(title)title.textContent="Расследования и «Работа для своих». Общий архив этого устройства.";
 if(id==="campaignDossiers")renderDossiers(doc,box,archive,heroes);
 if(id==="campaignAchievements")renderAchievements(doc,box,archive,
  [...box.querySelectorAll(".campaign-award")],heroes);
 if(id==="campaignHistory")renderHistory(doc,box,archive,
  Array.isArray(oldRuns)?oldRuns:[],heroes);
}
function attach(root){
 if(!root.document)return;
 root.document.addEventListener("birmingham:campaign-render",event=>{
  const {id,box,runs}=event.detail||{};
  if(!box||!["campaignDossiers","campaignAchievements","campaignHistory"].includes(id))return;
  append(id,box,runs,root);
 });
 const entry=root.document.querySelector("#storyStart .cabinet-entry-copy small");
 if(entry)entry.textContent="Знаки расследований и поручений · Общий архив";
}
return {readArray,validRecord,validSave,snapshot,append,attach};
});
