(()=>{"use strict";
/* Isolated portrait-first Case 002 UI. Never modifies Case 001 records. */
const data=window.BirminghamCase002Data,api=window.BirminghamCase002Engine;
const $=id=>document.getElementById(id);
const heroNames={jack:"Джек Харпер",finn:"Финн О’Коннор",eleanor:"Элеонора Блэквуд",victor:"Виктор Мэллоу",samuel:"Сэмюэл Рид"};
const approvedHeroPortraits={
  jack:"../../assets/heroes/jack.webp",
  finn:"../../assets/heroes/finn.webp",
  eleanor:"../../assets/heroes/eleanor.webp",
  victor:"../../assets/heroes/victor.webp",
  samuel:"../../assets/heroes/samuel.webp"
};
const sceneLocations={
 "private-siding":"Частная железнодорожная ветка",
 "detective-office":"Контора сыщика",
 "bridge-viaduct":"Кирпичный виадук",
 "freight-office":"Грузовая контора",
 "police-desk":"Полицейский участок",
 "old-ticket-counter":"Старая билетная касса",
 "archive-room":"Городской архив",
 "map-table":"Стол расследования",
 "canal-lock":"Шлюзы Дигбета",
 "old-boiler-house":"Заброшенная котельная",
 "aston-factory-gate":"Заводская проходная Астона",
 "factory-records":"Архив завода",
 "freight-yard":"Грузовой двор",
 "signal-box":"Стрелочный пост",
 "arrival-office":"Контора прибытия",
 "railway-office":"Железнодорожное управление",
 "factory-alley":"Переулок у завода",
 "mercer-room":"Комната Мерсера",
 "newsroom":"Редакция газеты",
 "vale-office":"Кабинет Вейла",
 "brackett-office":"Кабинет Брэкетта",
 "railway-platform":"Железнодорожная платформа"
};
const witnessLabel=(id,status)=>window.BirminghamCase002Narrative.witnessStatus(id,status);
const evidenceLabels={
 dispatch_manifest:"Грузовая ведомость отправления",arrival_manifest:"Подложная ведомость прибытия",
 points_log:"Журнал стрелочного поста",seal_scrap:"Обрывок пломбы вагона",
 guard_payment:"Расходный ордер охраны",freight_chalk:"Меловая пометка груза",
 pressure_log:"Журнал давления на заводе",valve_photo:"Фотография защитного клапана",
 inspection_copy:"Копия акта Мерсера",victim_register:"Реестр погибших работников",
 ada_statement:"Показания Ады Уэбб",mercer_signed_statement:"Подписанные показания Мерсера",
 old_excursion_ticket:"Старинный билет Курзон-стрит",hale_coat:"Описание шинели Эдварда Хейла",
 brackett_wire:"Заверенная телеграмма Брэкетта",bridge_witness:"Показания сторожа у моста",
 guard_bootmark:"След каблука у моста",brackett_boots:"Отпечаток каблука Брэкетта",
 evacuation_route:"Маршрут эвакуации",private_siding_map:"Схема частного отвода",
 brackett_accounts:"Копия счетов Брэкетта",vale_guarantee:"Гарантия Гидеона Вейла",
 public_contact:"Контакт Норы Келл",family_protection:"Гарантия безопасности семьи",
 mabel_confession:"Признание Мэйбл Кросс",clerk_witness:"Показания ночного клерка"
};
const evidenceName=id=>evidenceLabels[id]||id.replaceAll("_"," ");
const evidenceHints={
 dispatch_manifest:"Сравните строку отправления с показаниями того, кто её заполнял.",
 mabel_confession:"Сопоставьте признание с документом отправления.",
 clerk_witness:"Ищите запись, подтверждающую слова ночного служащего.",
 arrival_manifest:"Сравните время прибытия с независимой записью движения вагона.",
 points_log:"Проверьте, подтверждает ли другой след работу стрелки.",
 seal_scrap:"Подумайте, какая запись фиксирует перемещение опломбированного вагона.",
 guard_payment:"Ищите связь между платежом, грузом и денежными документами.",
 freight_chalk:"Номер на грузе может объяснять движение денег и охраны.",
 pressure_log:"Сравните журнал с другими сведениями о безопасности завода.",
 valve_photo:"Ищите независимое свидетельство о состоянии клапана.",
 inspection_copy:"Сопоставьте акт проверки с реальными показаниями завода.",
 victim_register:"Сравните список погибших с техническими записями.",
 hale_coat:"Вспомните документы, связывающие смерть Хейла с охраной.",
 brackett_wire:"Сопоставьте сообщение со следами погибшего.",
 bridge_witness:"Найдите материальный след, который подтвердит слова очевидца.",
 brackett_boots:"Сравните след обуви с показаниями у моста.",
 brackett_accounts:"Сверьте денежные записи с платежами или ведомостями."
};

const proofLabels={provedFirstForgery:"Подлог отправления Мэйбл",provedWagonDiversion:"Перехват вагона F-4182",provedSecondForgery:"Подложная запись о прибытии",provedFactoryCoverup:"Сокрытие заводской аварии",provedHaleMurder:"Убийство Хейла Брэкеттом",provedBrackettNetwork:"Счета преступной сети"};
const stageLabels={P:"ПРОЛОГ",I:"ГЛАВА I · МЁРТВЫЙ ПАССАЖИР",II:"ГЛАВА II · ТРИ МАРШРУТА",III:"ГЛАВА III · НОЧНОЙ СТРЕЛОЧНИК",IV:"ГЛАВА IV · ТЕ, КТО НЕ ДОЛЖЕН ГОВОРИТЬ",V:"ГЛАВА V · ЦЕНА МОЛЧАНИЯ",VI:"ГЛАВА VI · ПОСЛЕДНИЙ СИГНАЛ",END:"ИСХОД РАССЛЕДОВАНИЯ"};
const chapterOpenings={P:"P01",I:"A01",II:"B01",III:"C01",IV:"D01",V:"E01",VI:"F01"};
const chapterMood={
 P:"Ночь, когда в путевых книгах появилась первая ложь.",
 I:"Под аркой виадука дождь смыл следы, но не вопросы.",
 II:"У каждого пути — своё молчание.",
 III:"Поезд исчез не там, где его искали.",
 IV:"Найти свидетеля ещё не значит спасти его.",
 V:"Цена молчания написана чужой рукой.",
 VI:"Последний сигнал нельзя подать дважды.",
 END:"Теперь город узнает цену принятого решения."
};
const actionLabels={
 "D03:D10:continue":"Оставить убежище пока незащищённым",
 "D05:D06:continue":"Остаться без официального освобождения",
 "D09:D10:continue":"Прервать переговоры без гарантий",
 "D07:D08:continue":"Выслушать Мерсера без обещаний",
 "E02:E03:continue":"Отложить публикацию и продолжить",
 "E04:E05:continue":"Осмотреть отвод без подготовки",
 "E05:E08:continue":"Продолжить без очистки путей",
 "E07:E08:continue":"Оставить условия Вейла без гарантий",
 "E08:E09:continue":"Уйти без копии счетов",
 "E08:HJ03:continue":"Не брать документы",
 "E09:E10:continue":"Продолжить без посредника",
 "E11:F01:continue":"Идти к финалу без плана эвакуации"
};
let store=null,engine=null,tab="evidence",priorRecords=[],evidenceFocus=null,activeNoticeFocus=null;
let pairFirst=null,pairFeedback=null;
let activeNoticeSummary="",activeNoticeDetails=null;
let activeArtStage=null;
// Presentation-only state: never written to the game engine or the awards archive.
let unseenEvidence=0,pendingEvidence=[],pendingWitnesses=[],pendingProofs=[],
 journalExpanded=false,navSection="scene";
let lastDecisionReceipt=null; // Presentation only: latest committed choice.
let dossierReturnPoint=null; // Temporary reading bookmark; never persisted.
function appError(message){$("launchError").hidden=false;$("launchError").textContent=String(message);}
function readStorage(){
 try{
  const ls=window.localStorage,probe="case002_draft_probe";
  ls.setItem(probe,"1");ls.removeItem(probe);return ls;
 }catch(_){return null;}
}
function init(){
 // Works in ordinary Safari/file:// too; only reads the Telegram bridge if present.
 window.BirminghamCase002TelegramSafeArea?.bind(window);
 if(!data||!api||!data.narration||data.graph.nodes.length!==89){
  appError("Не удалось загрузить сценарный пакет. Откройте страницу из полной папки проекта.");
  $("begin").disabled=true;$("resume").disabled=true;return;
 }
 store=readStorage();
 if(!store)appError("Хранилище браузера недоступно. Можно читать прототип, но прогресс не сохранится.");
 try{
  const raw=store&&store.getItem("birmingham_campaign_records_v1");
  const records=raw?JSON.parse(raw):[];
  priorRecords=Array.isArray(records)?records.filter(r=>
    r&&r.caseId==="001"&&data.contract.heroes.includes(r.heroId)&&
    ["endingRescue","endingEvidence","endingDeal","endingTruth","endingPower","endingDeath"].includes(r.ending)):[];
  const select=$("prior");
  for(let i=0;i<priorRecords.length;i++){
   const r=priorRecords[i],opt=document.createElement("option");
   opt.value=String(i);
   opt.textContent=(heroNames[r.heroId]||r.heroId)+" · "+r.ending+
    " · "+new Date(r.finished||r.started||Date.now()).toLocaleDateString("ru-RU");
   select.append(opt);
  }
 }catch(e){console.warn("[Case 002] Old archive is unreadable; neutral start available",e);}
 $("priorDetails").hidden=priorRecords.length===0;
 // A returning player with any Case 002 save goes directly to the hero screen.
 // Never write a new preference or touch the saved game just to display UI.
 let hasSave=false;
 if(store)try{
  hasSave=data.contract.heroes.some(hero=>Boolean(store.getItem(api.SAVE_PREFIX+hero)));
 }catch(e){console.warn("[Case 002] Cannot inspect saved slots",e);}
 $("caseBriefing").hidden=hasSave;
 $("launch").hidden=!hasSave;
 $("app").dataset.screen=hasSave?"selection":"briefing";
 $("briefContinue").addEventListener("click",()=>showSelection({focus:true}));
 $("backToBriefing").addEventListener("click",()=>{
  $("launch").hidden=true;$("caseBriefing").hidden=false;
  $("app").dataset.screen="briefing";
  $("caseBriefing").focus({preventScroll:true});
  window.scrollTo(0,0);
 });
 $("begin").addEventListener("click",start);
 $("resume").addEventListener("click",resume);
 $("backToLaunch").addEventListener("click",returnToLaunch);
 // The stale-save receipt must offer an exit above the fixed mobile dock.
 $("noticeExit").addEventListener("click",returnToLaunch);
 $("noticeDismiss").addEventListener("click",()=>{
  hideNotice();
  // The button is now inside a hidden panel: restore a live focus target.
  $("storyPanel").focus({preventScroll:true});
 });
 $("noticeExpand").addEventListener("click",()=>{
  if(!activeNoticeDetails)return;
  const button=$("noticeExpand"),expanded=button.getAttribute("aria-expanded")==="true";
  setText($("noticeContent"),expanded?activeNoticeSummary:
    activeNoticeDetails.map(item=>"• "+item).join("\n"));
  button.setAttribute("aria-expanded",String(!expanded));
  $("notice").classList.toggle("is-expanded",!expanded);
  setText(button,expanded?"ВСЕ ИЗМЕНЕНИЯ ("+activeNoticeDetails.length+")":"СВЕРНУТЬ");
 });
 $("readScene").addEventListener("click",()=>jumpTo("reading"));
 $("artRetry").addEventListener("click",()=>{
  // Retry the current approved portrait without advancing or saving the case.
  if(engine&&!$("game").hidden&&activeArtStage)
   renderApprovedSceneArt(activeArtStage);
 });
 $("noticeJump").addEventListener("click",()=>{
   if(activeNoticeFocus)jumpTo(activeNoticeFocus.tab,activeNoticeFocus.id);
 });
 for(const button of document.querySelectorAll("#quickNav [data-go]")){
   button.addEventListener("click",()=>jumpTo(button.dataset.go));
 }
 for(const button of document.querySelectorAll(".tool-tab"))button.addEventListener("click",()=>{
  // A deliberate dossier switch supersedes any floating old receipt.
  hideNotice();
  tab=button.dataset.tab;evidenceFocus=null;
  acknowledgeSection(tab);
  navSection=tab;renderTools();refreshNavigation();
  // Keep focus on the selected tab (keyboard/VoiceOver convention), but
  // return its newly rendered content to view after a long journal entry.
  $("caseTools").scrollIntoView({block:"start",behavior:"auto"});
 });
 for(const card of document.querySelectorAll("#heroGallery [data-hero]")){
  card.addEventListener("click",()=>{$("hero").value=card.dataset.hero;refreshResume();});
 }
 refreshResume();
}
function selectedHeroButton(){
 return document.querySelector('#heroGallery [data-hero="'+$("hero").value+'"]');
}
function refreshNavigation(){
 for(const button of document.querySelectorAll('#quickNav [data-go]')){
  if(button.dataset.go===navSection)button.setAttribute("aria-current","location");
  else button.removeAttribute("aria-current");
  if(button.dataset.go==="scene"){
   if(dossierReturnPoint&&isDossierSection(navSection))
    button.setAttribute("aria-label",dossierReturnPoint.section==="choices"?
      "Вернуться к месту выбора":"Вернуться к месту чтения");
   else button.removeAttribute("aria-label");
  }
 }
 refreshDossierReturn();
 // Unread marks must reflect genuine state transitions, not a speculative
 // scene or unearned ending. These dots are transient and never persisted.
 const counts={evidence:unseenEvidence,deductions:pendingProofs.length,
  witnesses:pendingWitnesses.length};
 const grammar=(n,one,few,many)=>{
  const last=n%10,tail=n%100;
  return tail>=11&&tail<=14?many:
   last===1?one:[2,3,4].includes(last)?few:many;
 };
 const names={evidence:"УЛИКИ",deductions:"ВЫВОДЫ",witnesses:"ЛЮДИ"};
 for(const [section,n] of Object.entries(counts)){
  const kind=section==="evidence"?
   grammar(n,"новая улика","новые улики","новых улик"):
   section==="deductions"?
    grammar(n,"новый вывод","новых вывода","новых выводов"):
    grammar(n,"новое сведение","новых сведения","новых сведений");
  for(const button of document.querySelectorAll(
   '#quickNav [data-go="'+section+'"],.tool-tab[data-tab="'+section+'"]')){
   button.dataset.unread=String(n>0);
   if(n)button.setAttribute("aria-label",names[section]+" · "+n+" "+kind);
   else button.removeAttribute("aria-label");
  }
 }
}
function recordNewDossierChanges(before,after){
 for(const id of (after.evidence||[])){
  if(!(before.evidence||[]).includes(id)&&!pendingEvidence.includes(id))
   pendingEvidence.push(id);
 }
 // Proofs are verified only through already held evidence and the contract.
 const oldFacts=api.factsFor(data.contract,before.evidence||[]);
 const newFacts=api.factsFor(data.contract,after.evidence||[]);
 for(const [id,verified] of Object.entries(newFacts)){
  if(verified&&!oldFacts[id]&&!pendingProofs.includes(id))pendingProofs.push(id);
 }
 // A status change is announced only if this character has been encountered.
 const known=new Set(window.BirminghamCase002Cast.discovered(after).map(x=>x.id));
 for(const [id,status] of Object.entries(after.witnesses||{})){
  if(known.has(id)&&before.witnesses?.[id]!==status&&!pendingWitnesses.includes(id))
   pendingWitnesses.push(id);
 }
 unseenEvidence=pendingEvidence.length;
 refreshNavigation();
}
function acknowledgeSection(section){
 if(section==="evidence"){
  pendingEvidence=[];unseenEvidence=0;renderNewFinds();
 }else if(section==="witnesses")pendingWitnesses=[];
 else if(section==="deductions")pendingProofs=[];
 renderSceneUpdates();
 refreshSceneUpdateGroup();
}
/* Stage 15: show cinematic art before aftermath; reuse the existing
 * actual evidence, proof, witness and decision receipt components unchanged. */
function renderSceneUpdateGroup(){
 let group=$("sceneUpdateGroup");
 if(!group){
  group=make("section",undefined,"scene-update-group");
  group.id="sceneUpdateGroup";
  group.setAttribute("aria-label","Изменения в текущей сцене");
  const head=make("div",undefined,"scene-update-group-head");
  head.append(make("span","ПОСЛЕ ВАШЕГО РЕШЕНИЯ","scene-update-group-kicker"));
  const info=make("span",undefined,"scene-update-group-summary");
  info.id="sceneUpdateSummary";
  head.append(info);
  const content=make("div",undefined,"scene-update-group-content");
  content.id="sceneUpdateContent";
  const next=make("button","ПРОДОЛЖИТЬ ЧТЕНИЕ СЦЕНЫ ↓","scene-update-group-read");
  next.id="sceneUpdateRead";next.type="button";
  next.setAttribute("aria-controls","sceneText");
  next.addEventListener("click",()=>jumpTo("reading"));
  group.append(head,content,next);
  $("sceneCast").insertAdjacentElement("afterend",group);
 }
 const content=$("sceneUpdateContent");
 for(const id of ["sceneFinds","sceneDossierUpdates","lastDecisionReceipt"]){
  const element=$(id);
  if(element&&element.parentElement!==content)content.append(element);
 }
 refreshSceneUpdateGroup();
}
function refreshSceneUpdateGroup(){
 const group=$("sceneUpdateGroup");
 if(!group)return;
 const parts=[
  ["sceneFinds","НОВЫЕ УЛИКИ"],
  ["sceneDossierUpdates","ВЫВОДЫ И СВЕДЕНИЯ"],
  ["lastDecisionReceipt","ПОСЛЕДСТВИЯ РЕШЕНИЯ"]
 ];
 const active=parts.filter(([id])=>$(id)&&!$(id).hidden).map(([,label])=>label);
 group.hidden=active.length===0;
 if(active.length)setText($("sceneUpdateSummary"),active.join(" · "));
}
function renderNewFinds(){
 // A missed receipt is not a lost clue: all newly earned items remain
 // reachable directly from the current scene until the player opens evidence.
 let tray=$("sceneFinds");
 if(!tray){
  tray=make("section",undefined,"scene-finds");
  tray.id="sceneFinds";
  tray.setAttribute("aria-label","Новые материалы расследования");
  $("sceneLocation").insertAdjacentElement("afterend",tray);
 }
 tray.replaceChildren();
 tray.hidden=pendingEvidence.length===0;
 if(tray.hidden)return;
 tray.append(make("span","НОВЫЕ УЛИКИ · ОТКРЫТЬ В ДОСЬЕ","scene-finds-title"));
 const links=make("div",undefined,"scene-finds-links");
 for(const id of pendingEvidence){
  const link=make("button",evidenceName(id),"scene-finds-link");
  link.type="button";
  link.dataset.evidenceId=id;
  link.setAttribute("aria-label","Открыть новую улику: "+evidenceName(id));
  link.addEventListener("click",()=>jumpTo("evidence",id));
  links.append(link);
 }
 tray.append(links);
}
/* In-scene shortcuts only for verified deductions and encountered witnesses.
 * This never shows future leads or unknown NPC identities. */
function renderSceneUpdates(){
 let panel=$("sceneDossierUpdates");
 if(!panel){
  panel=make("section",undefined,"scene-dossier-updates");
  panel.id="sceneDossierUpdates";
  panel.setAttribute("aria-label","Новые подтверждённые материалы");
  $("sceneFinds").insertAdjacentElement("afterend",panel);
 }
 panel.replaceChildren();
 const known=new Map(engine?
  window.BirminghamCase002Cast.discovered(engine.snapshot()).map(x=>[x.id,x]):[]);
 const witnessed=pendingWitnesses.filter(id=>known.has(id));
 const count=pendingProofs.length+witnessed.length;
 panel.hidden=count===0;
 if(panel.hidden)return;
 panel.append(make("span","НОВОЕ В РАССЛЕДОВАНИИ · "+count,
  "scene-dossier-updates-title"));
 const links=make("div",undefined,"scene-dossier-updates-links");
 for(const id of pendingProofs){
  const name=proofLabels[id]||"Подтверждённая связь";
  const button=make("button","ВЫВОД · "+name,"scene-dossier-update");
  button.type="button";button.dataset.section="deductions";button.dataset.recordId=id;
  button.setAttribute("aria-label","Открыть новый доказанный вывод: "+name);
  button.addEventListener("click",()=>jumpTo("deductions",id));
  links.append(button);
 }
 for(const id of witnessed){
  const name=known.get(id).name;
  const button=make("button","ЛЮДИ · "+name,"scene-dossier-update");
  button.type="button";button.dataset.section="witnesses";button.dataset.recordId=id;
  button.setAttribute("aria-label","Открыть обновлённое досье: "+name);
  button.addEventListener("click",()=>jumpTo("witnesses",id));
  links.append(button);
 }
 panel.append(links);
}
/* Keep only the real committed choice's consequences within the new scene.
 * The floating receipt can close without losing the third or fourth event. */
function renderDecisionReceipt(){
 let panel=$("lastDecisionReceipt");
 if(!panel){
  panel=make("section",undefined,"last-decision-receipt");
  panel.id="lastDecisionReceipt";
  panel.setAttribute("aria-label","Последствия последнего решения");
  $("sceneFinds").insertAdjacentElement("afterend",panel);
 }
 const record=lastDecisionReceipt;
 panel.replaceChildren();
 panel.hidden=!record||!record.count;
 if(panel.hidden){refreshSceneUpdateGroup();return;}
 panel.dataset.sceneId=record.sceneId;
 const lines=Array.isArray(record.details)&&record.details.length?
  record.details:[record.message];
 const count=record.count;
 const countText=count===1?"1 изменение":
  count%10>=2&&count%10<=4&&(count<12||count>14)?
    count+" изменения":count+" изменений";
 const toggle=make("button",undefined,"last-decision-toggle");
 toggle.id="lastDecisionToggle";
 toggle.type="button";
 toggle.setAttribute("aria-expanded","false");
 toggle.setAttribute("aria-controls","lastDecisionDetails");
 toggle.append(make("span","ПОСЛЕДСТВИЯ РЕШЕНИЯ","last-decision-label"),
   make("span",countText+" · РАСКРЫТЬ","last-decision-count"));
 const body=make("div",undefined,"last-decision-body");
 body.id="lastDecisionDetails";
 body.hidden=true;
 const list=make("ul",undefined,"last-decision-list");
 for(const line of lines)list.append(make("li",line));
 body.append(list);
 if(record.focus){
  const open=make("button","ОТКРЫТЬ В ДОСЬЕ ↗","last-decision-open");
  open.type="button";
  open.addEventListener("click",()=>jumpTo(record.focus.tab,record.focus.id));
  body.append(open);
 }
 toggle.addEventListener("click",()=>{
  const show=body.hidden;
  body.hidden=!show;
  toggle.setAttribute("aria-expanded",String(show));
  setText(toggle.querySelector(".last-decision-count"),
   countText+(show?" · СВЕРНУТЬ":" · РАСКРЫТЬ"));
 });
 panel.append(toggle,body);
 refreshSceneUpdateGroup();
}
/* Remember the original reading viewport, not merely the scene's opening.
 * Using a stable text landmark compensates for disappearing clue banners. */
function isDossierSection(section){
 return ["evidence","deductions","witnesses","journal"].includes(section);
}
function refreshDossierReturn(){
 const panel=$("caseTools");
 let button=$("dossierReturn");
 if(!button){
  button=make("button","← К МЕСТУ ЧТЕНИЯ","dossier-return");
  button.id="dossierReturn";button.type="button";
  button.addEventListener("click",returnFromDossier);
  panel.insertBefore(button,panel.querySelector(".tool-tabs"));
 }
 const point=dossierReturnPoint;
 button.hidden=!point||!isDossierSection(navSection);
 if(!button.hidden){
  const label=point.section==="choices"?"К МЕСТУ ВЫБОРА":"К МЕСТУ ЧТЕНИЯ";
  setText(button,"← "+label+" · СЦЕНА "+point.sceneId);
 }
}
function returnFromDossier(){
 const point=dossierReturnPoint;
 if(!engine||!point||engine.snapshot().node!==point.sceneId){
  dossierReturnPoint=null;
  jumpTo("scene");return;
 }
 dossierReturnPoint=null;
 hideNotice();
 navSection=point.section;refreshNavigation();
 const target=point.section==="choices"?$("choicesPanel"):$("storyPanel");
 target.focus({preventScroll:true});
 // Narrative anchor stays in the DOM while evidence, journal or deduction
 // content changes. Its viewport delta restores the same reading position.
 const narrative=$("sceneText");
 const newTop=window.scrollY+narrative.getBoundingClientRect().top-point.anchorTop;
 window.scrollTo(0,Math.max(0,newTop));
}
function showSelection({focus=false}={}){
 $("caseBriefing").hidden=true;
 $("launch").hidden=false;
 $("app").dataset.screen="selection";
 refreshResume();
 if(focus)selectedHeroButton()?.focus({preventScroll:true});
 window.scrollTo(0,0);
}
function returnToLaunch(){
 hideNotice();dossierReturnPoint=null;$("game").hidden=true;
 showSelection({focus:true});
}
function refreshResume(){
 const hero=$("hero").value;
 let available=false;
 try{
  for(const card of document.querySelectorAll("#heroGallery [data-hero]")){
   const selected=card.dataset.hero===hero;
   card.setAttribute("aria-pressed",String(selected));
   const hasSave=Boolean(store&&store.getItem(api.SAVE_PREFIX+card.dataset.hero));
   card.dataset.hasSave=String(hasSave);
   let badge=card.querySelector(".hero-save-badge");
   if(!badge){
    badge=make("small","СОХРАНЕНО","hero-save-badge");
    card.querySelector("span")?.append(badge);
   }
   badge.hidden=!hasSave;
   if(selected)available=hasSave;
  }
 }catch(e){
  appError("Не удалось прочитать сохранение. Проверьте доступность хранилища браузера.");
  console.warn("[Case002] save availability check failed",e);
 }
 $("resume").disabled=!available;
 $("resume").hidden=!available;
 setText($("selectedHeroStatus"),"Выбран: "+heroNames[hero]+
  (available?" · Можно продолжить сохранённое расследование":" · Готов к новому расследованию"));
}
// Guard against an older Safari/Telegram tab overwriting a newer saved run.
// This compares existing slot data; the engine and save schema stay untouched.
function assertCurrentSave(){
 if(!store)return;
 let raw;
 try{raw=store.getItem(engine.storageKey);}
 catch(_){throw Error("Хранилище временно недоступно. Решение не записано.");}
 if(raw===null)throw Error("Сохранение пропало из хранилища. Перезагрузите дело перед новым решением.");
 let disk;
 try{disk=JSON.parse(raw);}
 catch(_){throw Error("Сохранение повреждено. Новые решения заблокированы до проверки архива.");}
 const active=engine.snapshot();
 if(!disk||disk.attemptId!==active.attemptId||disk.node!==active.node||
    JSON.stringify(disk.history)!==JSON.stringify(active.history))
  throw Error("Сохранение обновилось в другой вкладке. Вернитесь к выбору героя и откройте актуальное прохождение.");
}
function chosenPrior(){
 const index=$("prior").value;
 if(index==="")return null;
 const record=priorRecords[Number(index)];
 if(!record)throw Error("Выбранное предыдущее прохождение недоступно");
 return {heroId:record.heroId,ending:record.ending,recordKey:record.key};
}
function beginGame(ignorePrior=false){
 $("launchError").hidden=true;
 const hero=$("hero").value,prior=ignorePrior?null:chosenPrior();
 return api.createEngine({graph:data.graph,contract:data.contract,hero,prior,store});
}
function start(){
 try{
  const hero=$("hero").value;
  if(store&&store.getItem(api.SAVE_PREFIX+hero)&&
     !window.confirm("Начать новую попытку? Текущее сохранение этого героя будет заменено, но история завершённых попыток останется."))return;
  engine=beginGame();
  engine.reset("002-"+Date.now()+"-"+Math.random().toString(36).slice(2,9));
  showGame();
 }catch(e){appError(e.message);}
}
function resume(){
 try{
  engine=beginGame(true);
  engine.load();
  showGame();
 }catch(e){
  // load() validates/restores the primary save before retrying the separate
  // completion archive. If only that second phase fails, show the real
  // finished scene rather than denying access to a valid saved attempt.
  if(engine&&engine.snapshot().finished){
   showGame();
   showNotice("Расследование восстановлено из сохранения, но архив итогов или наград не обновлён: "+
    e.message+". Не начинайте новую попытку до восстановления архива.",
    {tab:"journal",id:null});
   console.warn("[Case002] completion archive recovery failed after valid load",e);
  }else appError("Не удалось открыть сохранение: "+e.message);
 }
}
function showGame(){
 $("launch").hidden=true;$("game").hidden=false;
 $("app").dataset.screen="game";
 $("saveStatus").textContent=store?"Автосохранение после каждого решения":"Нет постоянного сохранения в этом браузере";
 hideNotice();tab="evidence";evidenceFocus=null;pairFirst=null;pairFeedback=null;
 unseenEvidence=0;pendingEvidence=[];pendingWitnesses=[];pendingProofs=[];
 journalExpanded=false;navSection="scene";
 lastDecisionReceipt=null;dossierReturnPoint=null;refreshNavigation();
 render();
 showCurrentScene();
}
// Preserve chapter titles on their first scene, then enter directly at the
// next illustrated scene instead of resetting the viewport to the masthead.
function showCurrentScene(){
 dossierReturnPoint=null;
 navSection="scene";refreshNavigation();
 const story=$("storyPanel"),chapter=$("chapterIntertitle");
 story.focus({preventScroll:true});
 (chapter.hidden?story:chapter).scrollIntoView({block:"start",behavior:"auto"});
}
function setText(element,value){element.textContent=String(value);}
function make(tag,text,cls){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function sceneNarration(view){
 return window.BirminghamCase002Narrative.render(data,view);
}
/* Stage 10: reversible reading-to-decision navigation. UI state only.
 * These controls never invoke engine choose/reset or modify saves/rewards. */
function renderReadingBridge(view){
 let footer=$("readerBridge");
 if(!footer){
  footer=make("div",undefined,"reader-bridge");
  footer.id="readerBridge";
  footer.setAttribute("aria-label","Переход от текста сцены к решениям");
  const marker=make("span","КОНЕЦ СЦЕНЫ","reader-bridge-marker");
  marker.id="readerBridgeMarker";
  const summary=make("p",undefined,"reader-bridge-summary");
  summary.id="readerBridgeSummary";
  const button=make("button","К РЕШЕНИЮ ↓","reader-bridge-button");
  button.id="readerToChoices";
  button.type="button";
  button.setAttribute("aria-controls","choicesPanel");
  button.addEventListener("click",()=>jumpTo("choices"));
  footer.append(marker,summary,button);
  $("sceneText").insertAdjacentElement("afterend",footer);
  const back=make("button","↑ ВЕРНУТЬСЯ К ТЕКСТУ СЦЕНЫ","reader-return");
  back.id="choicesBackToText";
  back.type="button";
  back.setAttribute("aria-controls","sceneText");
  back.addEventListener("click",()=>jumpTo("reading"));
  $("choiceList").insertAdjacentElement("beforebegin",back);
 }
 const finished=Boolean(view.state.finished);
 const available=[...$("choiceList").querySelectorAll("button.choice:not(:disabled)")].length;
 setText($("readerBridgeMarker"),finished?"РАЗВЯЗКА ДЕЛА":"КОНЕЦ СЦЕНЫ · "+view.scene.id);
 const count=available===1?"1 доступное действие":
  available>=2&&available<=4?available+" доступных действия":
  available+" доступных действий";
 setText($("readerBridgeSummary"),finished?
  "История завершена. Ниже — итог вашего расследования.":count+". Решения находятся сразу под сценой.");
 setText($("readerToChoices"),finished?"ПОСМОТРЕТЬ ИТОГ ↓":"ПЕРЕЙТИ К РЕШЕНИЯМ ↓");
 setText($("choicesBackToText"),finished?
  "↑ ВЕРНУТЬСЯ К ЭПИЛОГУ":"↑ ВЕРНУТЬСЯ К ТЕКСТУ СЦЕНЫ");
 footer.dataset.finished=String(finished);
}
function hideNotice(){
 $("notice").hidden=true;
 $("notice").classList.remove("is-expanded");
 $("noticeJump").hidden=true;
 $("noticeExpand").hidden=true;
 $("noticeExit").hidden=true;
 activeNoticeFocus=null;
 activeNoticeDetails=null;
 activeNoticeSummary="";
}
function showNotice(text,focus=null,details=null){
 const notice=$("notice");
 notice.classList.remove("is-expanded");
 // Receipt visuals are advisory only; the original verified text remains intact.
 notice.dataset.section=focus?.tab||"general";
 activeNoticeSummary=String(text||"");
 const kicker={evidence:"НОВЫЕ МАТЕРИАЛЫ",witnesses:"СВЕДЕНИЯ О ЛЮДЯХ",
  deductions:"ХОД ДЕДУКЦИИ",journal:"АРХИВ РЕШЕНИЙ"};
 setText($("noticeKicker"),kicker[notice.dataset.section]||"ИЗМЕНЕНИЯ В ДЕЛЕ");
 $("noticeExit").hidden=!activeNoticeSummary.includes("Сохранение обновилось в другой вкладке");
 activeNoticeDetails=Array.isArray(details)&&details.length>2?details.slice():null;
 setText($("noticeContent"),activeNoticeSummary);
 notice.hidden=!text;
 const expand=$("noticeExpand");
 expand.hidden=!activeNoticeDetails;
 expand.setAttribute("aria-expanded","false");
 if(activeNoticeDetails)setText(expand,"ВСЕ ИЗМЕНЕНИЯ ("+activeNoticeDetails.length+")");
 activeNoticeFocus=text&&focus?focus:null;
 const jump=$("noticeJump");
 jump.hidden=!activeNoticeFocus;
 if(activeNoticeFocus){
   const names={evidence:"УЛИКУ",witnesses:"ЛЮДЕЙ",journal:"ХОД ДЕЛА",deductions:"ВЫВОДЫ"};
   setText(jump,"ОТКРЫТЬ: "+(names[activeNoticeFocus.tab]||"ДОСЬЕ"));
 }
}
function jumpTo(where,recordId=null){
 if(!engine)return;
 if(where==="scene"&&dossierReturnPoint&&isDossierSection(navSection)){
  returnFromDossier();return;
 }
 const toDossier=isDossierSection(where);
 if(toDossier&&!isDossierSection(navSection)){
  dossierReturnPoint={
   sceneId:engine.snapshot().node,
   section:navSection==="choices"?"choices":"scene",
   anchorTop:$("sceneText").getBoundingClientRect().top
  };
 }else if(!toDossier)dossierReturnPoint=null;
 let target;
 if(where==="scene")target=$("storyPanel");
 else if(where==="choices")target=$("choicesPanel");
 else if(where==="reading")target=$("sceneText");
 else if(["evidence","deductions","witnesses","journal"].includes(where)){
   tab=where;
   evidenceFocus=where==="evidence"?recordId:null;
   acknowledgeSection(where);
   renderTools();
   target=$("caseTools");
 }else return;
 hideNotice();
 navSection=where==="reading"?"scene":where;refreshNavigation();
 // Scroll to a real on-screen panel; never change story state or spend a choice.
 const selector=where==="evidence"?".evidence-card":
  where==="deductions"?".deduction-card":
  where==="witnesses"?".person-entry":null;
 const field=where==="evidence"?"evidenceId":
  where==="deductions"?"deductionId":"person";
 const row=recordId&&selector?
  [...$("toolContent").querySelectorAll(selector)]
   .find(item=>item.dataset[field]===recordId):null;
 const focusTarget=row||target;
 if(row)row.tabIndex=-1;
 focusTarget.focus({preventScroll:true});
 focusTarget.scrollIntoView({block:"start",behavior:"auto"});
}
function translateReason(choice,view){
 const reason=choice.reason||"";
 if(!reason)return "";
 if(reason.includes("Ending requirements")) {
  const id=api.END_NODES[choice.to],ending=data.contract.endings.find(x=>x.id===id);
  const missingFacts=ending.requiresFacts.filter(x=>!view.facts[x]).map(x=>proofLabels[x]);
  const missingFlags=ending.requiresFlags.filter(x=>!view.state.flags[x]);
  const missingSafe=Math.max(0,ending.minSafe-view.safeWitnessCount);
  const reasons=[];
  if(missingFacts.length)reasons.push("не доказано: "+missingFacts.join(", "));
  if(missingFlags.length)reasons.push("не выполнено: "+missingFlags.join(", "));
  if(missingSafe)reasons.push("нужно защитить ещё "+missingSafe+" свид.");
  if(id==="trainControl" && view.state.flags.accountsGivenToWorkers)
    reasons.push("единственная копия счетов передана представителю рабочих");
  return reasons.join("; ")||"условия развязки пока не выполнены";
 }
 const rules=[
 ["two independent routes","Сначала изучите хотя бы два независимых маршрута"],
 ["Ada needs","Сначала найдите независимую улику о перевозке или фабрике"],
 ["witness","Для этого решения не хватает безопасных свидетелей или их показаний"],
 ["cannot be hidden","Укрытие Ады раскрыто: повторно спрятать её здесь нельзя"],
 ["Two independent proof","Для публикации нужны обе доказательные цепочки"],
 ["siding plan","Не найдена техническая схема отвода"],
 ["unsafe siding","Рабочие ещё не выведены из опасной зоны"],
 ["Insufficient proof","Убийство пока нельзя надёжно доказать"],
 ["documented leverage","Нет проверенных счетов Брэкетта"],
 ["protected witness","Сначала обеспечьте безопасность хотя бы одному свидетелю"],
 ["another hero","Этот путь принадлежит другому герою"],
 ["Fatal danger","Сначала нужно явно принять опасность"]
 ];
 for(const [part,label] of rules)if(reason.includes(part))return label;
 return "Этот вариант пока недоступен";
}
let artRenderSerial=0;
function renderApprovedSceneArt(stage){
 const root=$("sceneArtwork"),img=$("sceneArtworkImage"),host=$("game");
 const recovery=$("artRecovery");
 const serial=++artRenderSerial;
 root.hidden=true;
 recovery.hidden=true;
 root.dataset.portrait="true";
 host.dataset.artVerified="false";
 host.dataset.artFallback="false";
 img.onload=null;
 img.onerror=null;
 // Game art is portrait-only. Clear the old source before requesting this
 // scene's independently approved WebP. Never show an unverified old frame.
 img.removeAttribute("src");
 const approved=window.BirminghamCase002ApprovedArt.resolveScene(stage);
 const stillCurrent=()=>serial===artRenderSerial&&
  host.dataset.artScene===stage.sceneId&&host.dataset.artVariant===stage.variantKey;
 const failed=()=>{
  if(!stillCurrent())return;
  root.hidden=true;
  host.dataset.artVerified="false";
  recovery.hidden=false;
 };
 if(!approved||!approved.mobileSrc){failed();return;}
 img.alt=approved.alt;
 img.onload=()=>{
  if(!stillCurrent())return;
  // Delayed load events from an old scene must never reveal the wrong face.
  const valid=img.currentSrc===img.src&&
   img.naturalWidth>=500&&img.naturalHeight>=700;
  if(!valid){failed();return;}
  root.hidden=false;
  recovery.hidden=true;
  host.dataset.artVerified="true";
 };
 img.onerror=failed;
 img.src=approved.mobileSrc;
}
function renderSceneCast(stage,state){
 const root=$("sceneCast");
 const people=window.BirminghamCase002SceneCast.participants(
   stage,state,window.BirminghamCase002Cast);
 root.replaceChildren();
 root.dataset.people=people.map(person=>person.id).join(",");
 root.hidden=people.length===0;
 for(const person of people){
   const card=make("div",undefined,"scene-participant");
   card.dataset.person=person.id;
   // Until original portrait artwork is accepted, never substitute a random face.
   const mark=make("span",person.name.split(" ").map(word=>word[0]).join("").slice(0,2),
     "scene-participant-monogram");
   mark.setAttribute("aria-hidden","true");
   card.append(mark);
   const approvedPortrait=window.BirminghamCase002ApprovedArt.resolveNpc(person);
   if(approvedPortrait){
     const portraitImg=make("img",undefined,"scene-participant-portrait");
     portraitImg.alt=approvedPortrait.alt;
     portraitImg.decoding="async";
     portraitImg.hidden=true;
     portraitImg.onload=()=>{
       if(portraitImg.naturalWidth>=500&&portraitImg.naturalHeight>=600){
         portraitImg.hidden=false;mark.hidden=true;
       }
     };
     portraitImg.onerror=()=>{portraitImg.hidden=true;mark.hidden=false;};
     portraitImg.src=approvedPortrait.src;
     card.append(portraitImg);
   }
   const desc=make("div",undefined,"scene-participant-description");
   desc.append(make("strong",person.name));
   desc.append(make("span",person.role,"scene-participant-role"));
   if(person.status)desc.append(make("small",witnessLabel(person.id,person.status),
     "scene-participant-status"));
   card.append(desc);root.append(card);
 }
}
// The ending scene is durable before separate completion/reward archive writes.
// Never promise an award without checking both archive records on disk.
function completionMessage(state){
 if(!store)return "Расследование завершено. Хранилище недоступно: итог и награда не записаны.";
 try{
  const records=JSON.parse(store.getItem(api.RECORD_KEY)||"null");
  const rewards=JSON.parse(store.getItem(api.REWARD_KEY)||"null");
  const archived=Array.isArray(records)&&records.some(record=>record&&
   record.attemptId===state.attemptId&&record.heroId===state.hero&&record.ending===state.ending);
  const awarded=Array.isArray(rewards)&&rewards.includes("002:"+state.hero+":"+state.ending);
  if(archived&&awarded)return "Расследование завершено. Итог и уникальная награда зарегистрированы в черновом архиве.";
  return "Расследование завершено. Текущая попытка сохранена, но запись итога или награды в архиве пока не подтверждена.";
 }catch(_){
  return "Расследование завершено. Архив итогов или наград повреждён. Запись достижения не подтверждена.";
 }
}
function render(){
 const v=engine.view(),s=v.state,scene=v.scene;
 $("game").dataset.completed=String(Boolean(s.finished));
 setText($("choicesHeading"),s.finished?"Итог расследования":"Ваше решение");
 // Local context is repeated only at the destinations of long mobile jumps.
 // It describes the current earned scene, never a future branch or ending.
 const chapterName=stageLabels[scene.chapter]||"РАССЛЕДОВАНИЕ";
 const sceneMarker=chapterName+" · "+scene.id;
 setText($("readingSceneMarker"),sceneMarker);
 setText($("decisionSceneMarker"),sceneMarker);
 setText($("toolsSceneMarker"),sceneMarker);
 setText($("decisionSceneTitle"),scene.title);
 const visibleChoices=s.finished?[]:v.choices.filter(choice=>s.node!=="F09"||choice.enabled);
 const risky=visibleChoices.some(choice=>choice.enabled&&choice.confirm);
 const unavailable=visibleChoices.some(choice=>!choice.enabled);
 setText($("choicesHint"),s.finished?"Здесь показан исход этой попытки.":
  risky?"Есть действие со смертельным риском. Оно выделено отдельно.":
  unavailable?"Доступные действия — первыми. Причины закрытых путей можно раскрыть.":
  "Доступные действия показаны ниже. Каждый выбор имеет последствия.");
 const dockChoice=document.querySelector('#quickNav [data-go="choices"]');
 if(dockChoice)setText(dockChoice,s.finished?"ИТОГ":"ВЫБОР");
 setText($("pulseEvidence"),"Улик: "+s.evidence.length);
 setText($("pulseProof"),"Выводов: "+Object.values(v.facts).filter(Boolean).length);
 setText($("pulseSafe"),"В безопасности: "+v.safeWitnessCount);
 // Future artwork is selected by game state, but never displayed until a
 // verified asset exists. Stage metadata is useful for browser QA now.
 const stage=window.BirminghamCase002ArtDirector.select(data.storyboard,v);
 activeArtStage=stage;
 const host=$("game");
 host.dataset.artScene=stage.sceneId;
 host.dataset.artVariant=stage.variantKey;
 host.dataset.artLocation=stage.location;
 host.dataset.artVerified="false";
 const scenePlace=sceneLocations[stage.location]||"Место расследования";
 setText($("sceneLocation"),scenePlace);
 setText($("readingScenePlace"),scenePlace);
 renderNewFinds();
 renderSceneUpdates();
 setText($("sceneArtChapter"),"СЦЕНА "+scene.id+" · "+(stageLabels[scene.chapter]||"РАССЛЕДОВАНИЕ"));
 setText($("sceneArtPlace"),scenePlace);
 renderApprovedSceneArt(stage);
 renderSceneCast(stage,s);
 const chapterCard=$("chapterIntertitle");
 const isFirst=scene.chapter==="END"||chapterOpenings[scene.chapter]===scene.id;
 chapterCard.hidden=!isFirst;
 if(isFirst){
   chapterCard.dataset.chapter=scene.chapter;
   setText($("intertitleName"),stageLabels[scene.chapter]||scene.chapter);
   setText($("intertitleLine"),chapterMood[scene.chapter]||"Расследование продолжается.");
 }
 setText($("chapterLabel"),stageLabels[scene.chapter]||scene.chapter);
 setText($("sceneId"),scene.id+" · "+heroNames[s.hero]);
 setText($("sceneTitle"),scene.title);
 setText($("heroName"),heroNames[s.hero]);
 const portrait=$("heroPortrait");
 if(portrait.dataset.hero!==s.hero){
   portrait.dataset.hero=s.hero;
   portrait.alt="Портрет сыщика: "+heroNames[s.hero];
   portrait.src=approvedHeroPortraits[s.hero];
   portrait.hidden=false;
 }
 portrait.onerror=()=>{portrait.hidden=true;};
 portrait.onload=()=>{portrait.hidden=false;};
 const region=$("sceneText");
 window.BirminghamCase002SceneProse.render(region,sceneNarration(v),document,scene.id);
 const choices=$("choiceList");choices.replaceChildren();
 if(s.finished){
   renderEndingRecap(choices,v);
 }else{
   // Keep available actions together, with unavailable routes opt-in below.
   // This grouping does NOT alter the engine's choice ordering, conditions,
   // or any saved state. F09 hidden ending routes remain undiscoverable.
   const available=make("div",undefined,"choice-available");
   available.setAttribute("role","group");
   available.setAttribute("aria-label","Доступные действия");
   const locked=make("div",undefined,"choice-locked");
   locked.id="lockedChoices";
   locked.hidden=true;
   locked.setAttribute("role","group");
   locked.setAttribute("aria-label","Пока недоступные действия и причины");
   let allowed=0,blocked=0;
   for(const c of v.choices){
    if(s.node==="F09"&&!c.enabled)continue;
    const visited=s.visited.includes(c.to);
    const btn=make("button",undefined,"choice"+(!c.enabled?" is-disabled":"")+
      (c.confirm?" is-danger":"")+(visited?" is-visited":""));
    btn.type="button";btn.disabled=!c.enabled;
    btn.dataset.to=c.to;btn.dataset.action=c.action;
    let title=actionLabels[s.node+":"+c.to+":"+c.action]||c.actionTitle;
    if(c.action==="continue")title=c.title+(actionLabels[s.node+":"+c.to+":continue"]?" · "+title:"");
    btn.append(make("span",title,"choice-label"));
    if(c.action!=="continue")btn.append(make("span","Следующая сцена: "+c.title,"choice-detail"));
    if(!c.enabled)btn.append(make("span",translateReason(c,v),"choice-detail lock-reason"));
    else if(c.confirm)btn.append(make("span","ОПАСНО · СМЕРТЕЛЬНЫЙ РИСК","choice-risk-note"));
    else if(visited)btn.append(make("span","УЖЕ ПОСЕЩАЛИ","choice-visited-note"));
    // Detached old buttons cannot repeat a committed transition.
    btn.addEventListener("click",()=>select(c,s.node));
    if(c.enabled){available.append(btn);allowed++;}
    else{locked.append(btn);blocked++;}
   }
   const count=make("p",allowed===1?"1 доступное действие":
     allowed>=2&&allowed<=4?allowed+" доступных действия":allowed+" доступных действий",
     "choice-availability");
   choices.append(count,available);
   if(blocked){
    const toggle=make("button","ПОКА ЗАКРЫТО: "+blocked+" · ПОКАЗАТЬ ПРИЧИНЫ",
      "choice-locked-toggle");
    toggle.type="button";
    toggle.setAttribute("aria-controls","lockedChoices");
    toggle.setAttribute("aria-expanded","false");
    toggle.addEventListener("click",()=>{
     const opening=locked.hidden;
     locked.hidden=!opening;
     toggle.setAttribute("aria-expanded",String(opening));
     setText(toggle,opening?"СКРЫТЬ НЕДОСТУПНЫЕ ПУТИ ("+blocked+")":
      "ПОКА ЗАКРЫТО: "+blocked+" · ПОКАЗАТЬ ПРИЧИНЫ");
    });
    choices.append(toggle,locked);
   }
 }
 renderTools();
 renderReadingBridge(v);
 renderDecisionReceipt();
 renderSceneUpdateGroup();
}
// The finale is a read-only view over the already committed Case 002 state.
// It never unlocks a second ending, changes a saved slot, or awards a reward.
function renderEndingRecap(target,view){
 const recap=window.BirminghamCase002EndingRecap.build(
   view,data.contract,window.BirminghamCase002Cast.discovered(view.state));
 if(!recap)return;
 const panel=make("section",undefined,"finale-panel");
 panel.id="finalePanel";
 panel.setAttribute("aria-label","Итог Дела №002");
 panel.dataset.ending=recap.endingId;
 panel.append(make("p","БИРМИНГЕМ · ДЕЛО №002 ЗАКРЫТО","finale-eyebrow"));
 panel.append(make("h4",recap.title,"finale-title"));
 panel.append(make("p","История "+heroNames[recap.hero]+" · "+recap.sceneId,"finale-subtitle"));
 const facts=make("div",undefined,"finale-metrics");
 for(const [name,value] of [
   ["Собрано улик",recap.evidenceCount],
   ["Доказано выводов",recap.proofCount],
   ["В безопасности",recap.safeCount]
 ]){
   const cell=make("div",undefined,"finale-metric");
   cell.append(make("strong",String(value)),make("span",name));
   facts.append(cell);
 }
 panel.append(facts);
 if(recap.people.length){
   const people=make("section",undefined,"finale-people");
   people.append(make("h5","Судьбы знакомых"));
   const list=make("ul");
   for(const person of recap.people){
     const li=make("li");
     li.append(make("strong",person.name),make("span",witnessLabel(person.id,person.status)));
     li.dataset.status=person.status;
     list.append(li);
   }
   people.append(list);panel.append(people);
 }
 const journal=window.BirminghamCase002Journal.entries(view.state,evidenceName);
 const recent=journal.flatMap(item=>item.notes).slice(0,3);
 if(recent.length){
   const history=make("section",undefined,"finale-history");
   history.append(make("h5","Что осталось в деле"));
   const list=make("ul");
   for(const line of recent)list.append(make("li",line));
   history.append(list);panel.append(history);
 }
 const archive=make("div",undefined,"finale-archive");
 archive.id="finaleArchive";
 archive.setAttribute("role","status");
 archive.append(make("span","СТАТУС АРХИВА","finale-archive-kicker"));
 archive.append(make("p",completionMessage(view.state)));
 panel.append(archive);
 const actions=make("div",undefined,"finale-actions");
 const journalButton=make("button","ПРОСМОТРЕТЬ ХОД ДЕЛА","finale-action secondary");
 journalButton.type="button";
 journalButton.addEventListener("click",()=>jumpTo("journal"));
 const back=make("button","К ВЫБОРУ СЫЩИКА","finale-action");
 back.type="button";back.addEventListener("click",returnToLaunch);
 actions.append(journalButton,back);
 panel.append(actions);
 target.append(panel);
}
function renderTools(){
 const sectionLabels={evidence:"УЛИКИ",deductions:"ВЫВОДЫ",witnesses:"ЛЮДИ",journal:"ХОД ДЕЛА"};
 setText($("toolsSectionLabel"),sectionLabels[tab]||"МАТЕРИАЛЫ");
 for(const b of document.querySelectorAll(".tool-tab"))b.setAttribute("aria-pressed",String(b.dataset.tab===tab));
 const root=$("toolContent");root.replaceChildren();const v=engine.view();
 if(tab==="deductions"){
   const compare=window.BirminghamCase002DeductionBoard,held=v.state.evidence;
   if(pairFirst&&!held.includes(pairFirst)){pairFirst=null;pairFeedback=null;}
   if(held.length){
    const panel=make("section",undefined,"pair-board");
    panel.setAttribute("aria-label","Доска сопоставления улик");
    panel.append(make("p","ЛИЧНОЕ ДОСЬЕ · ДОСКА СВЯЗЕЙ","pair-kicker"));
    const header=make("div",undefined,"pair-board-head");
    header.append(make("h4","Найти связь"));
    header.append(make("span",held.length+" "+(held.length===1?"улика":"улик")+" в деле","pair-total"));
    panel.append(header);
    panel.append(make("p","Выберите две находки. При первом касании появится подсказка. Ошибки не мешают расследованию.","pair-instruction"));
    const wire=make("div",undefined,"pair-connection");
    wire.setAttribute("aria-label",pairFirst?"Первая улика выбрана: "+evidenceName(pairFirst)+". Выберите вторую.":"Первая и вторая улики пока не выбраны");
    const left=make("span",pairFirst?evidenceName(pairFirst):"ПЕРВАЯ УЛИКА","pair-connection-slot");
    const join=make("span","◆","pair-connection-symbol");
    join.setAttribute("aria-hidden","true");
    const right=make("span",pairFirst?"ВЫБЕРИТЕ ВТОРУЮ":"ВТОРАЯ УЛИКА","pair-connection-slot");
    if(pairFirst)left.classList.add("is-filled");
    wire.append(left,join,right);
    panel.append(wire);
    const gallery=make("div",undefined,"pair-items");
    for(const id of held){
     const btn=make("button",undefined,"pair-item");
     btn.type="button";btn.dataset.evidenceId=id;
     btn.setAttribute("aria-pressed",String(pairFirst===id));
     btn.setAttribute("aria-label",evidenceName(id)+(pairFirst===id?", выбрана первая улика":""));
     const icon=window.BirminghamCase002EvidenceArt.create(id);
     icon.setAttribute("aria-hidden","true");
     const copy=make("span",undefined,"pair-item-copy");
     copy.append(make("strong",evidenceName(id)));
     if(pairFirst===id)copy.append(make("small",evidenceHints[id]||"Сравните с независимым свидетельством.","pair-item-hint"));
     btn.append(icon,copy);
     btn.addEventListener("click",()=>{
      const first=pairFirst;
      if(!first||first===id){
       pairFirst=first===id?null:id;
       pairFeedback=null;
      }else{
       pairFeedback=compare.comparePair(data.contract,engine.view().state.evidence,first,id);
       pairFeedback.first=first;pairFeedback.second=id;
       pairFirst=null;
      }
      renderTools();
      if(pairFirst){
       const fresh=root.querySelector('.pair-item[data-evidence-id="'+pairFirst+'"]');
       fresh?.focus({preventScroll:true});
      }else if(pairFeedback){
       const result=root.querySelector(".pair-result");
       result?.focus({preventScroll:true});
       result?.scrollIntoView({block:"nearest",behavior:"auto"});
      }else{
       root.querySelector('.pair-item[data-evidence-id="'+id+'"]')?.focus({preventScroll:true});
      }
     });
     gallery.append(btn);
    }
    panel.append(gallery);
    if(pairFeedback){
     const result=make("div",undefined,"pair-result");
     result.dataset.kind=pairFeedback.kind||"hint";
     result.setAttribute("role","status");result.setAttribute("aria-live","polite");
     result.tabIndex=-1;
     result.append(make("span",pairFeedback.kind==="match"?"СВЯЗЬ ПОДТВЕРЖДЕНА":
       pairFeedback.kind==="unrelated"?"ЕСТЬ ДРУГОЙ ПУТЬ":"ПОДСКАЗКА","pair-result-status"));
     if(pairFeedback.first&&pairFeedback.second)
       result.append(make("div",evidenceName(pairFeedback.first)+" + "+evidenceName(pairFeedback.second),"pair-result-sources"));
     result.append(make("strong",pairFeedback.title),make("span",pairFeedback.message));
     panel.append(result);
    }
    root.append(panel);
   }
   const leads=compare.board(data.contract,held);
   if(!leads.length){
     root.append(make("p","Пока нет подтверждённых выводов или зацепок. Продолжайте искать доказательства.","empty"));
     return;
   }
   const listing=make("div",undefined,"deduction-gallery");
   for(const lead of leads){
     const card=make("article",undefined,"deduction-card"+(lead.verified?" is-proven":" is-lead"));
     card.dataset.deductionId=lead.id;
     card.dataset.verified=String(lead.verified);
     const status=make("span",lead.status,"deduction-status");
     card.append(status,make("h4",lead.title),make("p",lead.explanation,"deduction-explanation"));
     const caption=make("span",lead.verified?"Подтверждающие материалы":"Обнаруженная зацепка","deduction-caption");
     card.append(caption);
     const sources=make("div",undefined,"deduction-sources");
     for(const id of lead.relatedEvidence){
       const btn=make("button",evidenceName(id),"deduction-source");
       btn.type="button";
       btn.dataset.evidenceId=id;
       btn.setAttribute("aria-label","Открыть улику: "+evidenceName(id));
       btn.addEventListener("click",()=>{
         tab="evidence";evidenceFocus=id;acknowledgeSection("evidence");navSection="evidence";
         renderTools();refreshNavigation();
         const evidenceCard=[...root.querySelectorAll(".evidence-card")]
           .find(row=>row.dataset.evidenceId===id);
         if(evidenceCard){
           evidenceCard.tabIndex=-1;
           evidenceCard.focus({preventScroll:true});
           evidenceCard.scrollIntoView({block:"center",behavior:"auto"});
         }
       });
       sources.append(btn);
     }
     card.append(sources);listing.append(card);
   }
   root.append(listing);return;
 }
 if(tab==="journal"){
   const entries=window.BirminghamCase002Journal.entries(v.state,evidenceName);
   const header=make("header",undefined,"case-journal-heading");
   header.append(make("span","АРХИВ РАССЛЕДОВАНИЯ · ДЕЛО №002","case-journal-eyebrow"));
   header.append(make("h3","Ход расследования"));
   header.append(make("p",entries.length?
     entries.length+" значимых записей. Новые события расположены первыми.":"Здесь будут только события, которые действительно произошли.","case-journal-intro"));
   root.append(header);
   if(!entries.length){
     root.append(make("p","Важные решения появятся здесь после первого значимого поступка.","empty"));
     return;
   }
   const listing=make("ol",undefined,"case-journal");
   listing.setAttribute("aria-label","История решений, новые события первыми");
   const older=[];
   for(const [index,item] of entries.entries()){
     const li=make("li",undefined,"journal-event");
     li.dataset.scene=item.to;
     const number=entries.length-index;
     const entryHeader=make("div",undefined,"journal-event-header");
     entryHeader.append(make("span","ЗАПИСЬ "+String(number).padStart(2,"0"),"journal-event-number"));
     entryHeader.append(make("span","Сцена "+item.to,"journal-event-scene"));
     const scene=data.graph.nodes.find(node=>node.id===item.to);
     li.append(entryHeader);
     if(scene)li.append(make("h4",scene.title,"journal-event-title"));
     const notes=make("ul",undefined,"journal-event-notes");
     for(const line of item.notes){
       const note=make("li",line,"journal-event-note");
       note.dataset.kind=line.startsWith("Улика:")?"evidence":
         line.startsWith("Передано:")?"custody":
         /^(Ада Уэбб|Томми Кросс|Дэниел Мерсер):/.test(line)?"witness":"decision";
       notes.append(note);
     }
     li.append(notes);
     if(index>=6){li.hidden=!journalExpanded;older.push(li);}
     listing.append(li);
   }
   root.append(listing);
   if(older.length&&!journalExpanded){
     const more=make("button","ПОКАЗАТЬ РАННИЕ ЗАПИСИ ("+older.length+")","journal-show-all");
     more.type="button";
     more.addEventListener("click",()=>{
       journalExpanded=true;
       for(const item of older)item.hidden=false;
       more.hidden=true;
       const first=older[0];
       first.tabIndex=-1;
       first.focus({preventScroll:true});
       first.scrollIntoView({block:"nearest",behavior:"auto"});
     });
     root.append(more);
   }
   return;
 }
 let items=[];
 if(tab==="evidence"){
    const dossier=v.evidenceDossier;
    if(!dossier.length){
      root.append(make("p","Улик пока нет. Найденные предметы и записи появятся здесь.","empty"));
      return;
    }
    root.append(make("p","Собранные материалы: "+dossier.length,"evidence-heading"));
    const list=make("ul",undefined,"evidence-gallery");
    for(const item of dossier){
      const place=item.holder==="workers"?"Передано представителю рабочих":
        ["copy","certified-copy","authenticated-copy"].includes(item.form)?"Копия у героя":
        ["photograph","impression","rubbing","sketch"].includes(item.form)?"Зафиксированный след":
        ["statement","signed-statement"].includes(item.form)?"Записанные показания":"Сведения в досье";
      const li=make("li",undefined,"evidence-card");
      li.dataset.evidenceId=item.id;
      li.dataset.holder=item.holder;
      if(item.id===evidenceFocus)li.classList.add("is-focused");
      const icon=window.BirminghamCase002EvidenceArt.create(item.id);
      icon.classList.add("evidence-symbol");
      icon.setAttribute("aria-hidden","true");
      const description=make("div",undefined,"evidence-description");
      description.append(make("strong",evidenceName(item.id)));
      description.append(make("span",place,"evidence-custody"));
      const source=data.graph.nodes.find(node=>node.id===item.source);
      if(source)description.append(make("small","Получено: "+source.title,"evidence-origin"));
      else if(item.source==="legacy-save")description.append(
        make("small","Перенесено из старого сохранения","evidence-origin"));
      const openPair=make("button","НА ДОСКУ","evidence-to-board");
      openPair.type="button";
      openPair.setAttribute("aria-label","Сопоставить улику: "+evidenceName(item.id));
      openPair.addEventListener("click",()=>{
       pairFirst=item.id;pairFeedback=null;
       tab="deductions";evidenceFocus=null;navSection="deductions";
       renderTools();refreshNavigation();
       const selected=root.querySelector('.pair-item[data-evidence-id="'+item.id+'"]');
       selected?.focus({preventScroll:true});
       selected?.scrollIntoView({block:"center",behavior:"auto"});
      });
      li.append(icon,description,openPair);
      list.append(li);
    }
    root.append(list);
    return;
  }

 if(tab==="witnesses"){
    const contacts=window.BirminghamCase002Cast.discovered(v.state);
    const hd=make("header",undefined,"people-dossier-header");
    hd.append(make("span","КАРТОТЕКА · ЛИЧНЫЕ ДЕЛА","people-dossier-kicker"));
    hd.append(make("h3","Участники расследования"));
    hd.append(make("p",contacts.length?
      "В досье появляются только те, о ком вы уже узнали. Статусы отражают события текущей попытки.":
      "Имена будут появляться по мере расследования.","people-dossier-description"));
    root.append(hd);
    const gallery=make("div",undefined,"people-dossier-gallery");
    for(const person of contacts){
      const personRow=make("article",undefined,"person-entry");
      personRow.dataset.person=person.id;
      const avatar=make("div",undefined,"person-avatar");
      const mark=make("span",person.name.split(" ").map(word=>word[0]).join("").slice(0,2),"person-monogram");
      mark.setAttribute("aria-hidden","true");
      avatar.append(mark);
      // Use only identity-bound, reviewed WebP. A missing image retains
      // the monogram; never substitute an unknown or future character.
      const approved=window.BirminghamCase002ApprovedArt.resolveNpc(person);
      if(approved){
        const photo=make("img",undefined,"person-portrait");
        photo.alt=approved.alt;
        // A hidden lazy <img> may never load in Safari; load the approved
        // portrait eagerly, reveal it only after validating its dimensions.
        photo.decoding="async";photo.loading="eager";photo.hidden=true;
        photo.onload=()=>{
          if(photo.naturalWidth>=500&&photo.naturalHeight>=600){
            photo.hidden=false;mark.hidden=true;
          }
        };
        photo.onerror=()=>{photo.hidden=true;mark.hidden=false;};
        photo.src=approved.src;
        avatar.append(photo);
      }
      const copy=make("div",undefined,"person-copy");
      copy.append(make("span","ДОСЬЕ · "+person.id.toUpperCase(),"person-index"));
      copy.append(make("strong",person.name));
      copy.append(make("span",person.role,"person-role"));
      if(person.status){
        const status=make("span",witnessLabel(person.id,person.status),"person-status");
        status.dataset.status=person.status;
        copy.append(status);
      }
      personRow.append(avatar,copy);gallery.append(personRow);
    }
    root.append(gallery);
    if(!contacts.length)root.append(make("p","Знакомства появятся по мере расследования. Чужие личности заранее не раскрываются.","empty"));
    return;
  }
 if(!items.length){root.append(make("p","Здесь пока нет записей.","empty"));return;}
 const ul=make("ul");for(const i of items)ul.append(make("li",i));root.append(ul);
}
function select(choice,fromScene){
 if(!engine||!choice.enabled||engine.snapshot().node!==fromScene)return;
 const before=engine.snapshot();
 try{
  // Check the current save BEFORE asking confirmation for dangerous actions.
  assertCurrentSave();
  if(choice.confirm&&!window.confirm("Этот поступок может закончиться гибелью героя. Вы действительно принимаете смертельный риск?"))return;
  const next=engine.choose(choice.to,choice.action);
  recordNewDossierChanges(before,next);
  const event=window.BirminghamCase002UIEvents.plan(
    before,next,choice.action,window.BirminghamCase002Consequences,evidenceName);
  evidenceFocus=null;pairFirst=null;pairFeedback=null;
  lastDecisionReceipt=!next.finished&&event.count>0?
   {sceneId:next.node,count:event.count,message:event.message,
    details:event.details,focus:event.focus}:null;
  render();
  // A completed finale already contains the outcome. Do not cover it with a
  // redundant floating receipt; exceptional archival failures still warn below.
  if(next.finished)hideNotice();
  else showNotice(event.message,event.focus,event.details);
  // The old clicked choice no longer exists. Give the next scene focus and
  // scroll to its opening, including a new chapter intertitle when present.
  showCurrentScene();
 }catch(e){
  // A terminal scene is persisted first, then the engine writes the separate
  // records/rewards archives. If only that second phase fails, the decision
  // DID happen. Show the actual reached ending, never stale choice buttons.
  const current=engine.snapshot();
  const committed=current.history.length>before.history.length;
  if(committed){
   recordNewDossierChanges(before,current);
   lastDecisionReceipt=null;
   render();
   showCurrentScene();
   showNotice("Решение принято и состояние расследования сохранено, но архив итогов или наград не обновлён: "+e.message+
    ". Не начинайте новую попытку до восстановления архива.",{tab:"journal",id:null});
   console.warn("[Case002] transition saved but completion archive failed",e);
  }else{
   lastDecisionReceipt=null;
   renderDecisionReceipt();
   showNotice("Действие не применено: "+e.message);
   console.warn("[Case002] transition rejected",e);
  }
 }
}
init();
})();