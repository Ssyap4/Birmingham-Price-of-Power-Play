/* Shared city atlas: show real Case 001 / 002 progress beside each
 * district without inventing plot state, changing saves or granting rewards.
 * One renderer owns the status; the existing map and launches own actions. */
(()=>{
 "use strict";
 const map=document.getElementById("districts");
 const detail=map?.querySelector(".district-detail");
 const desc=document.getElementById("districtCaseDescription");
 const first=document.getElementById("launchFirstCase");
 const second=document.getElementById("launchSecondCase");
 if(!map||!detail||!desc||!first||!second)return;
 const heroes=["jack","finn","eleanor","victor","samuel"];
 const names={jack:"Джек Харпер",finn:"Финн О’Коннор",
  eleanor:"Элеонора Блэквуд",victor:"Виктор Мэллоу",samuel:"Сэмюэл Рид"};
 const board=document.createElement("section");
 board.id="campaignDistrictState";
 board.className="campaign-district-state";
 board.setAttribute("aria-label","Сохранения выбранного дела");
 const kicker=document.createElement("small");
 const headline=document.createElement("strong");
 const note=document.createElement("p");
 board.append(kicker,headline,note);
 desc.after(board);
 const compact=window.matchMedia("(orientation: portrait) and (max-width: 700px)");
 const known001=new Set(["endingRescue","endingEvidence","endingDeal",
  "endingTruth","endingPower","endingDeath"]);
 const known002=new Set(
  (window.BirminghamCase002Data?.graph?.nodes||[]).map(x=>x.id));
 const prefix002=window.BirminghamCase002Engine?.SAVE_PREFIX||
  "birmingham_case002_draft_v3_";
 function read(key){
  try{const raw=localStorage.getItem(key);return raw===null?null:JSON.parse(raw);}
  catch{return "damaged"}
 }
 function case001(hero){
  const s=read("birmingham_case_smol_heath_v1_"+hero);
  if(s===null)return null;
  if(s==="damaged"||!Number.isFinite(s?.started)||
    !window.BirminghamCase?.hasSavedCase(hero))return "damaged";
  return {hero,started:Number.isFinite(s.started)?s.started:0,
   status:known001.has(s.node)?"finished":"active"};
 }
 function case002(hero){
  const s=read(prefix002+hero);
  if(s===null)return null;
  const archive=window.BirminghamCase002CampaignArchive;
  const contract=window.BirminghamCase002Data?.contract;
  if(s==="damaged"||!contract||
    !archive?.validSave?.(s,hero,contract,known002))return "damaged";
  return {hero,started:s.startedAt,status:s.finished?"finished":"active"};
 }
 function paint(){
  if(map.hidden)return;
  const district=map.querySelector(".map-pin.selected")?.dataset.district;
  const id=district==="small-heath"?"001":district==="digbeth"?"002":null;
  board.hidden=!id;
  if(!id)return;
  const rows=heroes.map(hero=>id==="001"?case001(hero):case002(hero));
  const valid=rows.filter(row=>row&&row!=="damaged");
  const active=valid.filter(row=>row.status==="active");
  const complete=valid.filter(row=>row.status==="finished");
  const damaged=rows.filter(row=>row==="damaged").length;
  kicker.textContent="АРХИВ НА ЭТОМ УСТРОЙСТВЕ · ДЕЛО №"+id;
  headline.textContent=valid.length?
   "В РАБОТЕ: "+active.length+" · ЗАВЕРШЕНО: "+complete.length:
   "ЕЩЁ НЕТ СОХРАНЁННЫХ ПРОХОЖДЕНИЙ";
  // The map and hero entry must agree: lead with an unfinished case even
  // when another hero's completed report was the last viewed slot.
  const selected=id==="001"?(window.BirminghamHero?.selectedId||"jack"):null;
  const current=active.find(row=>row.hero===selected)||
   [...active].sort((a,b)=>b.started-a.started)[0]||
   valid.find(row=>row.hero===selected)||
   [...complete].sort((a,b)=>b.started-a.started)[0];
  const name=current?names[current.hero]:"";
  note.textContent=damaged?
   "Не удалось прочитать "+damaged+" сохранение(й). Данные не изменены.":
   current&&current.status==="active"?
    "Можно продолжить за персонажа: "+name+".":
   active.length?
    "Выбери персонажа с незавершённым расследованием.":
   complete.length?
    "Отчёты доступны через выбор героя и общий архив.":
    "Выбери одного из пяти участников ближнего круга и начни дело.";
  if(id==="001"){
   first.textContent=active.length?
    "ВЫБРАТЬ ГЕРОЯ · ПРОДОЛЖИТЬ №001 →":
    valid.length?"ВЫБРАТЬ ГЕРОЯ · ОТЧЁТ ИЛИ НОВОЕ ДЕЛО →":
    "ОТКРЫТЬ ДЕЛО · ДОЛГ, КОТОРЫЙ НЕ ПРОЩАЮТ →";
   first.setAttribute("aria-label","Дело №001: выбор героя и расследования");
  }else{
   second.textContent=active.length?
    "ВЫБРАТЬ ГЕРОЯ · ПРОДОЛЖИТЬ №002 →":
    valid.length?"ВЫБРАТЬ ГЕРОЯ · ОТЧЁТ ИЛИ НОВОЕ ДЕЛО №002 →":
    "ОТКРЫТЬ ДЕЛО №002 · ПОСЛЕДНИЙ ПОЕЗД ИЗ БИРМИНГЕМА →";
   second.setAttribute("aria-label","Дело №002: выбор героя и расследования");
  }
 }
 function selectedFromTap(e){
  if(!e.isTrusted||e.detail===0||!compact.matches)return;
  // On a phone the map pins are above the fold; reveal the selected case
  // and its action rather than leaving the player looking at the old map.
  const district=e.target.closest(".map-pin")?.dataset.district;
  const y=window.scrollY;
  requestAnimationFrame(()=>{
   if(map.hidden||map.querySelector(".map-pin.selected")?.dataset.district!==district||
      Math.abs(window.scrollY-y)>2)return;
   const target=document.getElementById("districtCase");
   if(!target||target.getBoundingClientRect().top<innerHeight-115)return;
   // One immediate reveal per genuine tap, never a smooth scroll that
   // can continue competing with the player's next swipe or map exit.
   target.scrollIntoView({block:"center",behavior:"auto"});
  });
 }
 map.addEventListener("click",e=>{
  if(!e.target.closest(".map-pin"))return;
  queueMicrotask(paint);
  selectedFromTap(e);
 });
 document.getElementById("districtsCard")?.addEventListener("click",()=>queueMicrotask(paint));
 document.getElementById("caseBack")?.addEventListener("click",()=>queueMicrotask(paint));
 window.addEventListener("hashchange",()=>queueMicrotask(paint));
 window.addEventListener("pageshow",paint);
 window.addEventListener("storage",paint);
 paint();
})();