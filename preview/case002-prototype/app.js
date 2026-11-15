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
let dossierTrail=null; // One-hop navigation between already earned dossier cards.
let activeNoticeSummary="",activeNoticeDetails=null;
let activeArtStage=null;
let newRewardOnFinish=null; // First-ever earned key in this UI session only.
let newAchievements=[]; // First-time persisted milestones of one committed action.
let unlockToastDismissed=false; // Ephemeral notice only; never in game saves.
let collectionReturnPoint=null; // In-memory completed-finale bookmark only.
// Presentation-only state: never written to the game engine or the awards archive.
let unseenEvidence=0,pendingEvidence=[],pendingWitnesses=[],pendingProofs=[],
 journalExpanded=false,navSection="scene";
let lastDecisionReceipt=null; // Presentation only: latest committed choice.
let dossierReturnPoint=null; // Temporary dossier bookmark; never persisted.
let sceneReturnPoint=null; // Reading-to-decisions bookmark, never persisted.
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
 $("collectionReturnFromLaunch").addEventListener("click",returnFromCollection);
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
  hideNotice();dossierTrail=null;
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
   const fromDossier=dossierReturnPoint&&isDossierSection(navSection);
   const fromChoices=sceneReturnPoint&&navSection==="choices"&&engine&&
    sceneReturnPoint.sceneId===engine.snapshot().node;
   const point=fromDossier?dossierReturnPoint:fromChoices?sceneReturnPoint:null;
   setText(button,fromDossier?"НАЗАД":fromChoices?
    (point.reading?"ТЕКСТ":"КАДР"):"СЦЕНА");
   button.dataset.returnPoint=String(Boolean(point));
   if(fromDossier)button.setAttribute("aria-label",point.section==="choices"?
     (engine?.snapshot().finished?"Вернуться к итогу расследования":
      "Вернуться к месту выбора"):"Вернуться к месту чтения");
   else if(fromChoices)button.setAttribute("aria-label",point.reading?
     "Вернуться к месту чтения":"Вернуться к кадру сцены");
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
   button.dataset.unreadCount=String(n);
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
  const toggle=make("button",undefined,"scene-update-group-toggle");
  toggle.id="sceneUpdateToggle";toggle.type="button";
  toggle.setAttribute("aria-controls","sceneUpdateContent");
  toggle.setAttribute("aria-expanded","true");
  toggle.append(make("span","ПОСЛЕ ВАШЕГО РЕШЕНИЯ","scene-update-group-kicker"));
  const info=make("span",undefined,"scene-update-group-summary");
  info.id="sceneUpdateSummary";
  toggle.append(info);
  // The same earned changes as the dock, summarized before long story text.
  // No aria-live spam on re-render; the complete count is on the button.
  const urgency=make("span",undefined,"scene-update-group-urgency");
  urgency.id="sceneUpdateUrgency";
  urgency.setAttribute("aria-hidden","true");
  urgency.hidden=true;
  toggle.append(urgency);
  const action=make("span","СВЕРНУТЬ −","scene-update-group-state");
  action.id="sceneUpdateAction";
  toggle.append(action);
  toggle.addEventListener("click",()=>{
   toggle.setAttribute("aria-expanded",
    String(toggle.getAttribute("aria-expanded")!=="true"));
   refreshSceneUpdateGroup();
  });
  head.append(toggle);
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
 // A new, actually reached scene gets a fresh expanded report. Folding is
 // temporary UI state, not an engine flag or a saved-game preference.
 const sceneId=engine?.snapshot().node;
 if(group.dataset.sceneId!==sceneId){
  group.dataset.sceneId=sceneId;
  $("sceneUpdateToggle").setAttribute("aria-expanded","true");
 }
 refreshSceneUpdateGroup();
}
function refreshSceneUpdateGroup(){
 const group=$("sceneUpdateGroup");
 if(!group)return;
 const parts=[
  ["sceneFinds","НОВЫЕ УЛИКИ",pendingEvidence.length],
  ["sceneDossierUpdates","ВЫВОДЫ И СВЕДЕНИЯ",
   $("sceneDossierUpdates")?.querySelectorAll(".scene-dossier-update").length||0],
  ["lastDecisionReceipt","ПОСЛЕДСТВИЯ РЕШЕНИЯ",lastDecisionReceipt?.count||0]
 ];
 const active=parts.filter(([id])=>$(id)&&!$(id).hidden);
 group.hidden=active.length===0;
 const toggle=$("sceneUpdateToggle"),open=toggle.getAttribute("aria-expanded")==="true";
 $("sceneUpdateContent").hidden=group.hidden||!open;
 setText($("sceneUpdateAction"),open?"СВЕРНУТЬ −":"РАСКРЫТЬ +");
 const visibleWitnesses=$("sceneDossierUpdates")?.querySelectorAll(
  '.scene-dossier-update[data-section="witnesses"]').length||0;
 const unread=pendingEvidence.length+pendingProofs.length+visibleWitnesses;
 const urgency=$("sceneUpdateUrgency");
 urgency.hidden=unread===0;
 if(unread)setText(urgency,"НЕ ПРОСМОТРЕНО · "+unread);
 group.dataset.needsReview=String(unread>0);
 if(active.length)setText($("sceneUpdateSummary"),
  active.map(([,label,count])=>label+" ("+count+")").join(" · "));
 toggle.setAttribute("aria-label","Материалы расследования. "+
  (unread?"Непросмотрено: "+unread+". ":"Все новые материалы просмотрены. ")+
  (active.length?active.map(([,label,count])=>label+": "+count).join(". ")+". ":"")+
  (open?"Свернуть":"Раскрыть"));
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
 if(pendingProofs.length)links.append(make("span",
  "ПОДТВЕРЖДЁННЫЕ ВЫВОДЫ · "+pendingProofs.length,"scene-update-kind"));
 for(const id of pendingProofs){
  const name=proofLabels[id]||"Подтверждённая связь";
  const button=make("button","ДОКАЗАНО · "+name,"scene-dossier-update");
  button.type="button";button.dataset.section="deductions";button.dataset.recordId=id;
  button.setAttribute("aria-label","Открыть новый доказанный вывод: "+name);
  button.addEventListener("click",()=>jumpTo("deductions",id));
  links.append(button);
 }
 if(witnessed.length)links.append(make("span",
  "ИЗМЕНЕНИЯ У СВИДЕТЕЛЕЙ · "+witnessed.length,"scene-update-kind"));
 for(const id of witnessed){
  const name=known.get(id).name;
  const status=engine.snapshot().witnesses?.[id];
  const readable=status?witnessLabel(id,status):"изменены сведения";
  const button=make("button",undefined,"scene-dossier-update scene-witness-update");
  button.type="button";button.dataset.section="witnesses";button.dataset.recordId=id;
  button.dataset.status=status||"";
  button.append(make("strong","ЛЮДИ · "+name,"scene-witness-name"),
   make("span",readable,"scene-witness-status"));
  button.setAttribute("aria-label","Открыть обновлённое досье: "+name+". "+readable);
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
/* Anchor to current narration, not absolute page position: when an earned
 * clue gets acknowledged, its vanished banner must not shift the bookmark. */
function captureScenePoint(){
 const narrative=$("sceneText"),bounds=narrative.getBoundingClientRect();
 const fromReaderButton=document.activeElement?.id==="readerToChoices";
 return {
  sceneId:engine.snapshot().node,
  anchorTop:bounds.top,
  reading:fromReaderButton||
    (bounds.top<window.innerHeight-105&&bounds.bottom>35)
 };
}
function restoreScenePoint(point,section="scene"){
 if(!engine||!point||engine.snapshot().node!==point.sceneId)return false;
 const target=section==="choices"?$("choicesPanel"):
  point.reading?$("sceneText"):$("storyPanel");
 navSection=section;refreshNavigation();
 target.focus({preventScroll:true});
 const narrative=$("sceneText");
 window.scrollTo(0,Math.max(0,window.scrollY+
  narrative.getBoundingClientRect().top-point.anchorTop));
 return true;
}
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
  const label=point.section==="choices"?
   (engine?.snapshot().finished?"К ИТОГУ":"К МЕСТУ ВЫБОРА"):
   "К МЕСТУ ЧТЕНИЯ";
  setText(button,"← "+label+" · СЦЕНА "+point.sceneId);
 }
}
function returnFromDossier(){
 const point=dossierReturnPoint;
 if(!engine||!point||engine.snapshot().node!==point.sceneId){
  dossierReturnPoint=null;
  jumpTo("scene");return;
 }
 dossierReturnPoint=null;dossierTrail=null;hideNotice();
 // If the source was choices, retain the earlier passage bookmark. The
 // player may return through decisions to the interrupted paragraph.
 restoreScenePoint(point,point.section);
}
function showSelection({focus=false}={}){
 $("caseBriefing").hidden=true;
 $("launch").hidden=false;
 $("app").dataset.screen="selection";
 refreshResume();
 $("collectionReturnBar").hidden=!collectionReturnPoint;
 if(focus)selectedHeroButton()?.focus({preventScroll:true});
 window.scrollTo(0,0);
}
function returnToLaunch(){
 hideNotice();dismissUnlockToast();
 collectionReturnPoint=null;$("collectionReturnBar").hidden=true;
 dossierReturnPoint=null;sceneReturnPoint=null;dossierTrail=null;
 $("game").hidden=true;showSelection({focus:true});
}
function openFinaleCollection(kind){
 if(!engine||!engine.snapshot().finished)return;
 const s=engine.snapshot();
 collectionReturnPoint={hero:s.hero,attemptId:s.attemptId,node:s.node,kind};
 hideNotice();dismissUnlockToast();
 $("game").hidden=true;
 $("caseRewardArchive").open=false;
 $("caseAchievementArchive").open=false;
 showSelection();
 const archive=kind==="achievements"?$("caseAchievementArchive"):$("caseRewardArchive");
 archive.open=true;
 const summary=archive.querySelector("summary");
 summary.scrollIntoView({block:"start",behavior:"auto"});
 summary.focus({preventScroll:true});
}
function returnFromCollection(){
 const point=collectionReturnPoint;
 collectionReturnPoint=null;$("collectionReturnBar").hidden=true;
 if(!point||!engine)return;
 const s=engine.snapshot();
 // Refuse an obsolete bookmark rather than open a different character's case.
 if(!s.finished||s.hero!==point.hero||s.attemptId!==point.attemptId||
    s.node!==point.node)return;
 $("launch").hidden=true;$("game").hidden=false;
 $("app").dataset.screen="game";
 navSection="choices";refreshNavigation();
 const report=$("finalePanel");
 if(report){
  report.setAttribute("tabindex","-1");
  report.scrollIntoView({block:"start",behavior:"auto"});
  report.focus({preventScroll:true});
 }
}
/* Only actual draft keys are listed; no locked ending names, invented
 * achievements, duplicate awards or writes into Case 001 storage. */
function caseRewardArchiveSnapshot(){
 if(!store)return {status:"unavailable",items:[]};
 try{
  const raw=JSON.parse(store.getItem(api.REWARD_KEY)||"[]");
  const records=JSON.parse(store.getItem(api.RECORD_KEY)||"[]");
  if(!Array.isArray(raw)||!Array.isArray(records))
   throw Error("Invalid reward or completion archive");
  const keys=new Set(raw.filter(x=>typeof x==="string"));
  const items=[];
  for(const hero of data.contract.heroes){
   for(const ending of data.contract.endings){
    const key="002:"+hero+":"+ending.id;
    if(!keys.has(key))continue;
    items.push({key,hero,ending:ending.id,title:ending.title,
     verified:records.some(row=>row&&row.caseId==="002"&&
      row.heroId===hero&&row.ending===ending.id)});
   }
  }
  return {status:"ready",items};
 }catch(_){return {status:"damaged",items:[]};}
}
function renderRewardArchive(){
 const archive=$("caseRewardArchive");
 if(!archive)return;
 const snapshot=caseRewardArchiveSnapshot();
 const items=snapshot.items,root=$("caseRewardList");
 setText($("caseRewardCount"),String(items.length));
 archive.dataset.status=snapshot.status;
 root.replaceChildren();
 const note=snapshot.status==="damaged"?
  "Архив повреждён: проверенные награды нельзя перечислить. Сохранение игры не изменено.":
  snapshot.status==="unavailable"?
  "Хранилище недоступно. Полученные награды здесь не сохраняются.":
  items.length?
  "Только действительно записанные комбинации «герой × концовка». Награды Дела №001 хранятся отдельно; повторный исход не даёт второй жетон.":
  "Здесь появятся уникальные награды после завершения Дела №002. Закрытые концовки не раскрываются.";
 root.append(make("p",note,"case-reward-note"));
 if(!items.length){
  if(collectionReturnPoint?.kind==="rewards"){
   const returnButton=make("button","← ВЕРНУТЬСЯ К ИТОГУ","collection-return-inline");
   returnButton.type="button";returnButton.addEventListener("click",returnFromCollection);
   root.append(returnButton);
  }
  return;
 }
 const gallery=make("ul",undefined,"case-reward-gallery");
 for(const item of items){
  const row=make("li",undefined,"case-reward-entry");
  row.dataset.key=item.key;row.dataset.verified=String(item.verified);
  const seal=make("span","✦","case-reward-seal");
  seal.setAttribute("aria-hidden","true");
  const copy=make("div",undefined,"case-reward-description");
  copy.append(make("strong",item.title),
   make("span",heroNames[item.hero]||item.hero),
   make("small",item.verified?"ЗАПИСЬ ПРОХОЖДЕНИЯ НАЙДЕНА":
    "КЛЮЧ ЕСТЬ · ПРОХОЖДЕНИЕ НЕ ПОДТВЕРЖДЕНО"));
  row.append(seal,copy);gallery.append(row);
 }
 root.append(gallery);
 if(collectionReturnPoint?.kind==="rewards"){
  const returnButton=make("button","← ВЕРНУТЬСЯ К ИТОГУ","collection-return-inline");
  returnButton.type="button";returnButton.addEventListener("click",returnFromCollection);
  root.append(returnButton);
 }
}
/* Distinct from the 35 hero × ending seals. This archive only contains
 * 18 actual verified milestones, never a projected future character or route.
 * Display logic is read-only; unlock writes happen after engine.choose. */
function renderAchievementArchive(){
 const award=window.BirminghamCase002Achievements;
 const snapshot=award.read(store),known=new Set(snapshot.items.map(a=>a.id));
 const root=$("caseAchievementList");root.replaceChildren();
 const count=known.size,archive=$("caseAchievementArchive");
 setText($("caseAchievementCount"),count+" / "+award.catalog.length);
 archive.dataset.status=snapshot.status;
 root.append(make("p",snapshot.status==="damaged"?
  "Архив достижений повреждён. Данные сохранения не изменены.":
  snapshot.status==="unavailable"?
  "Хранилище недоступно: достижения не могут быть зарегистрированы.":
  "Достижения выдаются один раз за реальные поступки в Деле №002. Закрытые условия и незнакомые персонажи заранее не раскрываются.",
  "case-achievement-note"));
 const listing=make("div",undefined,"case-achievement-gallery");
 for(const achievement of award.catalog){
  const unlocked=known.has(achievement.id);
  const card=make("article",undefined,"case-achievement-item");
  card.dataset.achievementId=achievement.id;
  card.dataset.unlocked=String(unlocked);
  const sigil=make("span",unlocked?"✦":"◇","case-achievement-sigil");
  sigil.setAttribute("aria-hidden","true");
  const copy=make("div",undefined,"case-achievement-copy");
  copy.append(make("strong",unlocked?achievement.name:"НЕИЗВЕСТНОЕ ДОСТИЖЕНИЕ"),
   make("small",unlocked?achievement.description:"Закрыто · условие не раскрыто"));
  card.append(sigil,copy);listing.append(card);
 }
 root.append(listing);
 if(collectionReturnPoint?.kind==="achievements"){
  const returnButton=make("button","← ВЕРНУТЬСЯ К ИТОГУ","collection-return-inline");
  returnButton.type="button";returnButton.addEventListener("click",returnFromCollection);
  root.append(returnButton);
 }
}
function renderAchievementReceipt(){
 const root=$("caseAchievementReceipt");
 root.replaceChildren();
 root.hidden=!newAchievements.length;
 if(root.hidden)return;
 root.append(make("p","✦  ДОСТИЖЕНИЯ ОТКРЫТЫ · "+newAchievements.length,
  "case-achievement-receipt-kicker"));
 const list=make("ul",undefined,"case-achievement-receipt-list");
 for(const milestone of newAchievements){
  const li=make("li");
  li.append(make("strong",milestone.name),make("span",milestone.description));
  list.append(li);
 }
 root.append(list);
 const dismiss=make("button","ПОНЯТНО","case-achievement-receipt-dismiss");
 dismiss.type="button";
 dismiss.addEventListener("click",()=>{
  newAchievements=[];root.hidden=true;root.replaceChildren();
  dismissUnlockToast();
  $("storyPanel").focus({preventScroll:true});
 });
 root.append(dismiss);
}
/* A visible-on-arrival, nonmodal ceremony for genuinely earned keys.
 * The durable scene/finale receipt remains available after dismissal.
 * No engine or localStorage writes happen in these presentation functions.
 */
function dismissUnlockToast(){
 unlockToastDismissed=true;
 const toast=$("caseUnlockToast");
 if(toast){toast.hidden=true;toast.dataset.token="";}
}
function renderUnlockToast(){
 const toast=$("caseUnlockToast");
 if(!toast||!engine)return;
 const s=engine.snapshot();
 const hasAchievement=newAchievements.length>0;
 const rewardKey="002:"+s.hero+":"+s.ending;
 const hasReward=Boolean(s.finished&&newRewardOnFinish===rewardKey&&
  completionArchiveStatus(s).status==="verified");
 if(unlockToastDismissed||(!hasAchievement&&!hasReward)){
  toast.hidden=true;toast.dataset.token="";toast.replaceChildren();
  return;
 }
 const token=s.attemptId+"|"+s.node+"|"+newAchievements.map(a=>a.id).join(",")+
  "|"+(hasReward?rewardKey:"");
 if(!toast.hidden&&toast.dataset.token===token)return;
 const count=newAchievements.length;
 const kicker=hasReward&&hasAchievement?"✦ ДОСТИЖЕНИЯ И НАГРАДА":
  hasReward?"✦ НОВАЯ УНИКАЛЬНАЯ НАГРАДА":
  count===1?"✦ ОТКРЫТО ДОСТИЖЕНИЕ":"✦ НОВЫЕ ДОСТИЖЕНИЯ · "+count;
 const name=hasAchievement?newAchievements[0].name:
  data.contract.endings.find(ending=>ending.id===s.ending)?.title||"Новый исход";
 const note=hasReward&&hasAchievement?
  (count>1?"Ещё "+(count-1)+" достижений. ":"")+"Получена также уникальная награда за эту концовку.":
  hasReward?"Исход впервые зарегистрирован в коллекции наград Дела №002.":
  count>1?"Ещё "+(count-1)+" достижений. Все открытия сохранены.":"Открытие сохранено в коллекции достижений.";
 toast.replaceChildren();
 const seal=make("span","✦","case-unlock-toast-seal");
 seal.setAttribute("aria-hidden","true");
 const copy=make("div",undefined,"case-unlock-toast-copy");
 copy.append(make("small",kicker,"case-unlock-toast-kicker"),
  make("strong",name,"case-unlock-toast-name"),
  make("span",note,"case-unlock-toast-note"));
 const controls=make("div",undefined,"case-unlock-toast-actions");
 const details=make("button","ПОСМОТРЕТЬ ↗","case-unlock-toast-details");
 details.type="button";
 details.setAttribute("aria-label","Посмотреть подробности нового открытия");
 details.addEventListener("click",()=>{
  const target=hasAchievement?$("caseAchievementReceipt"):
   document.querySelector("#finalePanel .finale-new-reward");
  dismissUnlockToast();
  if(target&&!target.hidden){
   target.setAttribute("tabindex","-1");
   target.scrollIntoView({block:"center",behavior:"auto"});
   target.focus({preventScroll:true});
  }
 });
 const close=make("button","ПОНЯТНО","case-unlock-toast-close");
 close.type="button";
 close.setAttribute("aria-label","Закрыть уведомление, сохранив награду в коллекции");
 close.addEventListener("click",dismissUnlockToast);
 controls.append(details,close);
 toast.append(seal,copy,controls);
 toast.dataset.token=token;
 toast.hidden=false;
}
function grantCommittedAchievements(){
 const award=window.BirminghamCase002Achievements;
 if(!store)return [];
 let records=[];
 try{
  const raw=JSON.parse(store.getItem(api.RECORD_KEY)||"[]");
  if(!Array.isArray(raw))return [];
  records=raw;
 }catch(_){return [];}
 const result=award.grant(store,engine.view(),data.contract,records);
 if(result.status!=="ready")
  console.warn("[Case002] achievements not persisted; collection unchanged",result.status);
 return result.newly;
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
 renderRewardArchive();
 renderAchievementArchive();
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
  collectionReturnPoint=null;$("collectionReturnBar").hidden=true;
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
  collectionReturnPoint=null;$("collectionReturnBar").hidden=true;
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
 lastDecisionReceipt=null;dossierReturnPoint=null;sceneReturnPoint=null;dossierTrail=null;
 newRewardOnFinish=null; // Never replay a first-time reward upon resume/reload.
 newAchievements=[]; // A loaded milestone is not a new pop-up.
 unlockToastDismissed=true; // Resume cannot replay a first-time ceremony.
 $("caseUnlockToast").hidden=true;$("caseUnlockToast").dataset.token="";
 refreshNavigation();
 render();
 showCurrentScene();
}
// Preserve chapter titles on their first scene, then enter directly at the
// next illustrated scene instead of resetting the viewport to the masthead.
function showCurrentScene(){
 dossierReturnPoint=null;sceneReturnPoint=null;dossierTrail=null;
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
 // A one-thumb trip to decisions is reversible to the source viewport.
 // A second SCENE tap goes to the actual opening illustration as before.
 if((where==="scene"||where==="reading")&&navSection==="choices"&&
    sceneReturnPoint&&sceneReturnPoint.sceneId===engine.snapshot().node&&
    (where==="scene"||sceneReturnPoint.reading)){
  const point=sceneReturnPoint;
  sceneReturnPoint=null;dossierReturnPoint=null;hideNotice();
  restoreScenePoint(point);return;
 }
 if(where==="choices"&&navSection==="scene"){
  sceneReturnPoint=captureScenePoint();
 }
 const toDossier=isDossierSection(where);
 if(toDossier&&!isDossierSection(navSection)){
  dossierReturnPoint={
   ...captureScenePoint(),
   section:navSection==="choices"?"choices":"scene"
  };
 }else if(!toDossier){
  dossierReturnPoint=null;dossierTrail=null;
 }
 if(where==="scene"||where==="reading")sceneReturnPoint=null;
 let target;
 if(where==="scene")target=$("storyPanel");
 else if(where==="choices")target=$("choicesPanel");
 else if(where==="reading")target=$("sceneText");
 else if(["evidence","deductions","witnesses","journal"].includes(where)){
   tab=where;
   evidenceFocus=where==="evidence"?recordId:null;
   // A direct return to a historic note must disclose a collapsed row first.
   if(where==="journal"&&recordId!==null&&Number(recordId)>=6)
    journalExpanded=true;
   acknowledgeSection(where);
   renderTools();
   target=$("caseTools");
 }else return;
 hideNotice();
 navSection=where==="reading"?"scene":where;refreshNavigation();
 // Scroll to a real on-screen panel; never change story state or spend a choice.
 const selector=where==="evidence"?".evidence-card":
  where==="deductions"?".deduction-card":
  where==="witnesses"?".person-entry":
  where==="journal"?".journal-event":null;
 const field=where==="evidence"?"evidenceId":
  where==="deductions"?"deductionId":
  where==="journal"?"journalIndex":"person";
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
   const open=make("button","ЛИЧНОЕ ДЕЛО ↗","scene-participant-open");
   open.type="button";open.dataset.person=person.id;
   open.setAttribute("aria-label","Открыть досье: "+person.name);
   open.addEventListener("click",()=>jumpTo("witnesses",person.id));
   desc.append(open);
   card.append(desc);root.append(card);
 }
}
// The ending scene is durable before separate completion/reward archive writes.
// Never promise an award without checking both archive records on disk.
function completionArchiveStatus(state){
 // Read both existing independent archives; a stored reward combination
 // is not a new award for a repeated ending.
 if(!store)return {status:"unavailable",recorded:false,reward:false,
  message:"Расследование завершено. Хранилище недоступно: итог и награда не записаны."};
 try{
  const records=JSON.parse(store.getItem(api.RECORD_KEY)||"null");
  const rewards=JSON.parse(store.getItem(api.REWARD_KEY)||"null");
  const recorded=Array.isArray(records)&&records.some(record=>record&&
   record.attemptId===state.attemptId&&record.heroId===state.hero&&
   record.ending===state.ending);
  const reward=Array.isArray(rewards)&&rewards.includes(
   "002:"+state.hero+":"+state.ending);
  const status=recorded&&reward?"verified":
   recorded||reward?"partial":"unconfirmed";
  const message=status==="verified"?
   "Расследование завершено. Итог и уникальная награда зарегистрированы в черновом архиве.":
   "Расследование завершено. Текущая попытка сохранена, но запись итога или награды в архиве пока не подтверждена.";
  return {status,recorded,reward,message};
 }catch(_){
  return {status:"damaged",recorded:false,reward:false,
   message:"Расследование завершено. Архив итогов или наград повреждён. Запись достижения не подтверждена."};
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
 renderAchievementReceipt();
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
   let allowed=0,blocked=0,dangerous=0,revisited=0;
   for(const c of v.choices){
    if(s.node==="F09"&&!c.enabled)continue;
    const visited=s.visited.includes(c.to);
    const btn=make("button",undefined,"choice"+(!c.enabled?" is-disabled":"")+
      (c.confirm?" is-danger":"")+(visited?" is-visited":""));
    btn.type="button";btn.disabled=!c.enabled;
    btn.dataset.to=c.to;btn.dataset.action=c.action;
    btn.dataset.decisionState=!c.enabled?"locked":c.confirm?"danger":
     visited?"visited":"available";
    let title=actionLabels[s.node+":"+c.to+":"+c.action]||c.actionTitle;
    if(c.action==="continue")title=c.title+(actionLabels[s.node+":"+c.to+":continue"]?" · "+title:"");
    btn.append(make("span",title,"choice-label"));
    if(c.action!=="continue")btn.append(make("span","Следующая сцена: "+c.title,"choice-detail"));
    if(!c.enabled){
     btn.append(make("span","ПОКА ЗАКРЫТО","choice-locked-note"));
     btn.append(make("span",translateReason(c,v),"choice-detail lock-reason"));
    }else if(c.confirm){
     dangerous++;
     btn.append(make("span","ОПАСНО · СМЕРТЕЛЬНЫЙ РИСК","choice-risk-note"));
     btn.append(make("span","Перед этим действием потребуется подтверждение.",
      "choice-detail choice-risk-explainer"));
    }else if(visited){
     revisited++;
     btn.append(make("span","УЖЕ ПОСЕЩАЛИ","choice-visited-note"));
    }
    // Detached old buttons cannot repeat a committed transition.
    btn.addEventListener("click",()=>select(c,s.node));
    if(c.enabled){available.append(btn);allowed++;}
    else{locked.append(btn);blocked++;}
   }
   // The same currently visible choice set drives every number, including
   // the spoiler-filtered finale. The preflight cannot offer an unearned route.
   const preflight=make("section",undefined,"decision-preflight");
   preflight.id="decisionPreflight";
   preflight.dataset.available=String(allowed);
   preflight.dataset.blocked=String(blocked);
   preflight.dataset.dangerous=String(dangerous);
   preflight.dataset.revisited=String(revisited);
   preflight.setAttribute("aria-label","Подготовка к решению");
   preflight.append(make("span","ПЕРЕД РЕШЕНИЕМ · "+scene.id,"decision-preflight-kicker"));
   const metrics=make("div",undefined,"decision-preflight-metrics");
   for(const [number,label,kind] of [
     [allowed,"ДОСТУПНО","available"],
     ...(dangerous?[[dangerous,"С РИСКОМ","danger"]]:[]),
     ...(blocked?[[blocked,"ПОКА ЗАКРЫТО","blocked"]]:[])
   ]){
     const metric=make("div",undefined,"decision-preflight-metric");
     metric.dataset.kind=kind;
     metric.append(make("strong",String(number)),make("span",label));
     metrics.append(metric);
   }
   preflight.append(metrics);
   preflight.append(make("p",dangerous?
     "Среди доступных действий есть смертельно опасное. Оно выделено и потребует отдельного подтверждения.":
     revisited?
     "Некоторые открытые пути уже посещались. Выберите дальнейшее действие осознанно.":
     "Ниже показаны действия, доступные именно сейчас. Выбор изменит ход расследования.",
     "decision-preflight-note"));
   if(s.evidence.length){
     const check=make("button","СВЕРИТЬ УЛИКИ НА ДОСКЕ ↗","decision-check-evidence");
     check.id="decisionCheckEvidence";check.type="button";
     check.setAttribute("aria-label","Проверить найденные улики и выводы перед решением");
     check.addEventListener("click",()=>{
       // This control physically lives at the decision threshold. A player
       // may arrive by ordinary scrolling (navSection still reads "scene").
       // Give the dossier the correct return origin before switching tabs.
       navSection="choices";refreshNavigation();
       jumpTo("deductions");
     });
     preflight.append(check);
   }
   const count=make("p",allowed===1?"1 доступное действие":
     allowed>=2&&allowed<=4?allowed+" доступных действия":allowed+" доступных действий",
     "choice-availability");
   choices.append(preflight,count,available);
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
    locked.insertBefore(make("p",
     "Это пути, условия которых сейчас не выполнены. Просмотр причин не меняет маршрут и не расходует попытку.",
     "choice-locked-explanation"),locked.firstChild);
    choices.append(toggle,locked);
   }
 }
 renderTools();
 renderReadingBridge(v);
 renderDecisionReceipt();
 renderSceneUpdateGroup();
 renderUnlockToast(); // Scene and finale detail targets already exist.
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
 panel.append(make("p","История "+heroNames[recap.hero]+" · "+recap.sceneId+
  " · Принято решений: "+recap.decisionCount,"finale-subtitle"));
 const currentReward="002:"+recap.hero+":"+recap.endingId;
 const achievementCheck=completionArchiveStatus(view.state);
 if(newRewardOnFinish===currentReward&&achievementCheck.status==="verified"){
  const gain=make("section",undefined,"finale-new-reward");
  gain.setAttribute("role","status");
  gain.append(make("span","✦  ПОЛУЧЕНА НОВАЯ УНИКАЛЬНАЯ НАГРАДА","finale-new-reward-title"),
   make("p","Ключ этого исхода впервые зарегистрирован в черновом архиве Дела №002. Жетон доступен в разделе наград при выборе сыщика."));
  panel.append(gain);
 }
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
 panel.append(make("p","«В безопасности» — защищённые и эвакуированные. Защита не означает, что человека уже вывезли из города.","finale-metric-note"));
 // A trip to an earned dossier starts from the report, not from the art.
 const openFinaleSection=(section,id=null)=>{
  navSection="choices";refreshNavigation();jumpTo(section,id);
 };
 if(recap.people.length){
   const people=make("section",undefined,"finale-people");
   people.append(make("h5","Судьбы знакомых"));
   people.append(make("p","Только свидетели, с которыми сыщик познакомился. Положение показано на момент развязки.","finale-people-note"));
   const categories=[
    ["evacuated","ВЫВЕЗЕНЫ ИЗ ГОРОДА"],["protected","ПОД ЗАЩИТОЙ"],
    ["located","НАЙДЕНЫ, НЕ ЗАЩИЩЕНЫ"],["detained","ЗАДЕРЖАНЫ ОХРАНОЙ"],
    ["deceased","ПОГИБЛИ"],["missing","МЕСТО НЕИЗВЕСТНО"]
   ];
   const chips=make("div",undefined,"finale-witness-statuses");
   for(const [status,label] of categories){
    const n=recap.people.filter(person=>person.status===status).length;
    if(!n)continue;
    const chip=make("span",n+" · "+label,"finale-witness-status");
    chip.dataset.status=status;
    chips.append(chip);
   }
   people.append(chips);
   const list=make("ul");
   for(const person of recap.people){
     const li=make("li");
     li.dataset.person=person.id;li.dataset.status=person.status;
     li.append(make("strong",person.name),
      make("span",witnessLabel(person.id,person.status)));
     const open=make("button","ОТКРЫТЬ ДОСЬЕ ↗","finale-person-open");
     open.type="button";open.dataset.person=person.id;
     open.setAttribute("aria-label","Открыть досье свидетеля: "+person.name);
     open.addEventListener("click",()=>openFinaleSection("witnesses",person.id));
     li.append(open);list.append(li);
   }
   people.append(list);panel.append(people);
 }
 const journal=window.BirminghamCase002Journal.entries(view.state,evidenceName);
 const recent=journal.slice(0,3);
 if(recent.length){
   const history=make("section",undefined,"finale-history");
   history.append(make("h5","Последние события расследования"));
   history.append(make("p","Выписка из уже принятых решений. Полная хронология — в журнале.","finale-history-note"));
   const list=make("ul");
   for(const entry of recent){
    const li=make("li",undefined,"finale-history-event");
    li.dataset.scene=entry.to;
    const scene=data.graph.nodes.find(node=>node.id===entry.to);
    li.append(make("small","СЦЕНА "+entry.to,"finale-history-scene"),
     make("strong",scene?.title||"Запись дела","finale-history-name"),
     make("span",entry.notes.slice(0,2).join(" · "),"finale-history-description"));
    list.append(li);
   }
   history.append(list);panel.append(history);
 }
 const archiveCheck=completionArchiveStatus(view.state);
 const archive=make("section",undefined,"finale-archive");
 archive.id="finaleArchive";
 archive.dataset.status=archiveCheck.status;
 archive.setAttribute("role","status");
 archive.append(make("span","СТАТУС АРХИВА","finale-archive-kicker"));
 const statusText=archiveCheck.status==="verified"?"ОБЕ ЗАПИСИ ПОДТВЕРЖДЕНЫ":
   archiveCheck.status==="damaged"?"АРХИВ ПОВРЕЖДЁН":
   archiveCheck.status==="unavailable"?"ХРАНИЛИЩЕ НЕДОСТУПНО":
   "ТРЕБУЕТ ПРОВЕРКИ";
 archive.append(make("strong",statusText,"finale-archive-status"));
 archive.append(make("p",archiveCheck.message));
 const checks=make("div",undefined,"finale-archive-checks");
 for(const [kind,label,ok] of [
  ["result","ЗАПИСЬ ПРОХОЖДЕНИЯ",archiveCheck.recorded],
  ["reward","КЛЮЧ УНИКАЛЬНОЙ НАГРАДЫ",archiveCheck.reward]
 ]){
  const entry=make("div",undefined,"finale-archive-check");
  entry.dataset.kind=kind;entry.dataset.verified=String(Boolean(ok));
  entry.append(make("span",label),make("strong",ok?"НАЙДЕНО":"НЕ ПОДТВЕРЖДЕНО"));
  checks.append(entry);
 }
 archive.append(checks);
 archive.append(make("small","Наличие ключа награды не означает повторную выдачу за уже полученную комбинацию «дело × герой × концовка».","finale-archive-note"));
 panel.append(archive);
 // Read the existing archives without guessing which awards a run would
 // have earned. The counts distinguish verified keys from unconfirmed ones.
 const achievements=window.BirminghamCase002Achievements.read(store);
 const rewards=caseRewardArchiveSnapshot();
 const collection=make("section",undefined,"finale-collection-compass");
 collection.id="finaleCollectionCompass";
 collection.setAttribute("aria-label","Коллекции после завершения Дела №002");
 collection.append(make("h5","Ваши открытия в архиве"));
 collection.append(make("p","Полученные достижения и награды сохраняются отдельно от истории этого прохождения. Откройте коллекцию и вернитесь сюда одним нажатием.","finale-collection-note"));
 for(const kind of ["achievements","rewards"]){
  const snapshot=kind==="achievements"?achievements:rewards;
  const count=kind==="achievements"?achievements.items.length:
   rewards.items.filter(item=>item.verified).length;
  const verified=snapshot.status==="ready";
  const total=kind==="achievements"?
   window.BirminghamCase002Achievements.catalog.length:
   data.contract.heroes.length*data.contract.endings.length;
  const slot=make("div",undefined,"finale-collection-slot");
  slot.dataset.kind=kind;slot.dataset.status=snapshot.status;
  slot.append(make("strong",verified?count+" / "+total:"АРХИВ НЕ ПОДТВЕРЖДЁН",
   "finale-collection-count"));
  slot.append(make("span",kind==="achievements"?"ДОСТИЖЕНИЯ":"НАГРАДЫ ЗА ИСХОДЫ",
   "finale-collection-label"));
  const open=make("button",kind==="achievements"?"ОТКРЫТЬ ДОСТИЖЕНИЯ ↗":
   "ОТКРЫТЬ НАГРАДЫ ↗","finale-collection-open");
  open.type="button";open.dataset.collection=kind;
  open.setAttribute("aria-label",kind==="achievements"?
   "Открыть коллекцию достижений Дела 002":"Открыть коллекцию наград Дела 002");
  open.addEventListener("click",()=>openFinaleCollection(kind));
  slot.append(open);collection.append(slot);
 }
 panel.append(collection);
 const actions=make("div",undefined,"finale-actions");
 const journalButton=make("button","ПРОСМОТРЕТЬ ХОД ДЕЛА","finale-action secondary");
 journalButton.type="button";
 journalButton.addEventListener("click",()=>openFinaleSection("journal"));
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
 // A reversible dossier-to-dossier hop is useful when reading long evidence
 // cards. It is strictly ephemeral and never becomes a saved history item.
 if(dossierTrail&&(dossierTrail.targetSection!==tab||
    dossierTrail.sceneId!==v.state.node))dossierTrail=null;
 if(dossierTrail){
   const back=dossierTrail;
   const names={evidence:"К УЛИКЕ",deductions:"К ВЫВОДУ",journal:"К ЗАПИСИ"};
   const button=make("button","← "+(names[back.fromSection]||"НАЗАД")+
    " · "+back.label,"dossier-cross-return");
   button.type="button";
   button.dataset.returnSection=back.fromSection;
   button.setAttribute("aria-label","Вернуться к материалу: "+back.label);
   button.addEventListener("click",()=>{
    dossierTrail=null;
    jumpTo(back.fromSection,back.recordId);
   });
   root.append(button);
 }
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
   if(leads.length){
    const proved=leads.filter(lead=>lead.verified).length;
    const count=make("p","ОТКРЫТО СВЯЗЕЙ · "+leads.length+
     "   /   ДОКАЗАНО · "+proved+"   /   ЗАЦЕПОК · "+(leads.length-proved),
     "deduction-map-summary");
    count.setAttribute("aria-label","Известных выводов: "+leads.length+
     ". Подтверждено: "+proved+". Зацепок: "+(leads.length-proved));
    root.append(count);
   }
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
         dossierTrail={sceneId:engine.snapshot().node,
          fromSection:"deductions",recordId:lead.id,label:lead.title,
          targetSection:"evidence"};
         jumpTo("evidence",id);
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
   // Present-tense case state, derived from the live attempt, never a hint
   // about a future ending or an unearned witness.
   const held=v.state.evidence||[];
   const knownPeople=window.BirminghamCase002Cast.discovered(v.state);
   const verified=Object.values(v.facts).filter(Boolean).length;
   const compass=make("section",undefined,"journal-compass");
   compass.setAttribute("aria-label","Состояние расследования сейчас");
   compass.append(make("span","НА ТЕКУЩИЙ МОМЕНТ · "+v.scene.id,"journal-compass-kicker"));
   const figures=make("div",undefined,"journal-compass-stats");
   for(const [number,title] of [
    [held.length,"Улик в деле"],[verified,"Доказанных выводов"],
    [knownPeople.length,"Известных людей"]
   ]){
    const cell=make("div",undefined,"journal-compass-stat");
    cell.append(make("strong",number),make("span",title));figures.append(cell);
   }
   compass.append(figures);
   const links=make("div",undefined,"journal-compass-actions");
   for(const [section,title,enabled] of [
    ["evidence","К УЛИКАМ",held.length>0],
    ["deductions","К ВЫВОДАМ",held.length>0],
    ["witnesses","К ЛЮДЯМ",knownPeople.length>0],
    ["choices",v.state.finished?"К ИТОГУ":"К ТЕКУЩЕМУ ВЫБОРУ",true]
   ]){
    if(!enabled)continue;
    const action=make("button",title,"journal-compass-action");
    action.type="button";action.dataset.go=section;
    action.addEventListener("click",()=>jumpTo(section));
    links.append(action);
   }
   compass.append(links);
   compass.append(make("p","Ниже — уже совершённые действия. Старые записи можно открыть для справки, но повторить их из журнала нельзя.","journal-compass-note"));
   root.append(compass);
   if(!entries.length){
     root.append(make("p","Важные решения появятся здесь после первого значимого поступка.","empty"));
     return;
   }
   const listing=make("ol",undefined,"case-journal");
   listing.setAttribute("aria-label","История решений, новые события первыми");
   const owned=new Map(held.map(id=>[evidenceName(id),id]));
   const byName=new Map(knownPeople.map(person=>[person.name,person.id]));
   const older=[];
   for(const [index,item] of entries.entries()){
     const li=make("li",undefined,"journal-event");
     li.dataset.scene=item.to;
     li.dataset.journalIndex=String(index);
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
       // Keep historic text intact. Navigation must be grounded in currently
       // held evidence and actually discovered people, not guessed flag names.
       const clue=line.startsWith("Улика: ")?owned.get(line.slice(7)):null;
       const personName=note.dataset.kind==="witness"?line.split(":")[0]:null;
       const witness=personName?byName.get(personName):null;
       if(clue||witness){
        const destination=clue?"evidence":"witnesses";
        const record=clue||witness;
        const link=make("button",clue?"ОТКРЫТЬ УЛИКУ ↗":"ОТКРЫТЬ ДОСЬЕ ↗",
         "journal-source");
        link.type="button";link.dataset.sourceKind=clue?"evidence":"witness";
        link.dataset.recordId=record;
        link.setAttribute("aria-label","Открыть "+(clue?"улику: "+evidenceName(clue):
         "сведения о свидетеле: "+personName));
        link.addEventListener("click",()=>{
         dossierTrail={sceneId:engine.snapshot().node,
          fromSection:"journal",recordId:String(index),
          label:"запись "+String(entries.length-index).padStart(2,"0"),
          targetSection:destination};
         jumpTo(destination,record);
        });
        note.append(link);
       }
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
    // Only already held clues and their currently disclosed deductions:
    // the board itself is the spoiler-safe source of all associations.
    const discoveredLeads=window.BirminghamCase002DeductionBoard.board(
     data.contract,v.state.evidence);
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
       dossierTrail={sceneId:engine.snapshot().node,
        fromSection:"evidence",recordId:item.id,label:evidenceName(item.id),
        targetSection:"deductions"};
       tab="deductions";evidenceFocus=null;navSection="deductions";
       renderTools();refreshNavigation();
       const selected=root.querySelector('.pair-item[data-evidence-id="'+item.id+'"]');
       selected?.focus({preventScroll:true});
       selected?.scrollIntoView({block:"center",behavior:"auto"});
      });
      li.append(icon,description,openPair);
      const known=discoveredLeads.filter(lead=>
       lead.knownEvidence.includes(item.id));
      if(known.length){
       const details=make("details",undefined,"evidence-connections");
       const summary=make("summary","СВЯЗИ В РАССЛЕДОВАНИИ · "+known.length,
        "evidence-connections-summary");
       details.append(summary);
       const links=make("div",undefined,"evidence-connected-leads");
       for(const lead of known){
        const button=make("button",lead.status+" · "+lead.title,
         "evidence-linked-lead");
        button.type="button";button.dataset.deductionId=lead.id;
        button.dataset.verified=String(lead.verified);
        button.setAttribute("aria-label","Открыть известную связь: "+lead.title);
        button.addEventListener("click",()=>{
         dossierTrail={sceneId:engine.snapshot().node,
          fromSection:"evidence",recordId:item.id,label:evidenceName(item.id),
          targetSection:"deductions"};
         jumpTo("deductions",lead.id);
        });
        links.append(button);
       }
       details.append(links);li.append(details);
      }
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
    const tracked=contacts.filter(person=>Boolean(person.status));
    if(tracked.length){
     const stats=make("div",undefined,"people-status-compass");
     stats.setAttribute("aria-label","Подтверждённое положение известных свидетелей");
     const groups=[
      ["protected","ПОД ЗАЩИТОЙ",p=>p.status==="protected"],
      ["evacuated","ЭВАКУИРОВАНЫ",p=>p.status==="evacuated"],
      ["unprotected","БЕЗ ПОДТВЕРЖДЁННОЙ ЗАЩИТЫ",
       p=>["missing","located","detained"].includes(p.status)],
      ["deceased","ПОГИБЛИ",p=>p.status==="deceased"]
     ];
     for(const [key,title,accept] of groups){
      const count=tracked.filter(accept).length;
      if(!count)continue;
      const item=make("div",undefined,"people-status-count");
      item.dataset.kind=key;
      item.append(make("strong",String(count)),make("span",title));
      stats.append(item);
     }
     root.append(stats);
     root.append(make("p","Учитываются только уже встреченные свидетели. «Найдён» и «задержан» не означают «защищён».","people-status-caption"));
    }
    const records=window.BirminghamCase002Journal.entries(v.state,evidenceName);
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
      personRow.append(avatar,copy);
      // No invented biography: a first encountered scene and only committed
      // status transitions visible in this attempt.
      const identity=window.BirminghamCase002Cast.character(person.id);
      const intro=v.state.visited.find(id=>identity?.intro.includes(id));
      const timeline=make("details",undefined,"person-case-history");
      const changes=(v.state.history||[]).filter(entry=>
       entry?.changes?.witnesses?.[person.id]&&
       typeof entry.changes.witnesses[person.id].to==="string");
      timeline.append(make("summary","ИСТОРИЯ В ДЕЛЕ · "+(1+changes.length),
       "person-case-history-toggle"));
      const chronology=make("ol",undefined,"person-history-list");
      if(intro){
       const scene=data.graph.nodes.find(node=>node.id===intro);
       const item=make("li",undefined,"person-history-entry");
       item.dataset.kind="introduction";
       item.append(make("span","ПЕРВОЕ ПОЯВЛЕНИЕ · "+intro,"person-history-kicker"),
        make("span",scene?scene.title:"Первая встреча","person-history-description"));
       chronology.append(item);
      }
      for(const entry of changes){
       const code=entry.changes.witnesses[person.id].to;
       const scene=data.graph.nodes.find(node=>node.id===entry.to);
       const item=make("li",undefined,"person-history-entry");
       item.dataset.kind="status";item.dataset.status=code;
       item.append(make("span","СЦЕНА "+entry.to+
        (scene?" · "+scene.title:""),"person-history-kicker"),
        make("span","Тогда: "+witnessLabel(person.id,code),
         "person-history-description"));
       chronology.append(item);
      }
      timeline.append(chronology);
      if(changes.length){
       const latest=changes[changes.length-1];
       const journalIndex=records.findIndex(item=>item.to===latest.to&&
        item.notes.some(line=>line.startsWith(person.name+": ")));
       if(journalIndex!==-1){
        const jump=make("button","ПОСЛЕДНЕЕ ИЗМЕНЕНИЕ В ЖУРНАЛЕ ↗",
         "person-history-journal");
        jump.type="button";jump.dataset.journalIndex=String(journalIndex);
        jump.addEventListener("click",()=>{
         dossierTrail={sceneId:engine.snapshot().node,
          fromSection:"witnesses",recordId:person.id,label:person.name,
          targetSection:"journal"};
         jumpTo("journal",String(journalIndex));
        });
        timeline.append(jump);
       }
      }
      personRow.append(timeline);
      gallery.append(personRow);
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
  const beforeKeys=caseRewardArchiveSnapshot();
  const next=engine.choose(choice.to,choice.action);
  newRewardOnFinish=null;
  if(next.finished&&beforeKeys.status==="ready"){
   const key="002:"+next.hero+":"+next.ending;
   const now=caseRewardArchiveSnapshot();
   if(!beforeKeys.items.some(item=>item.key===key)&&
      now.items.some(item=>item.key===key&&item.verified)&&
      completionArchiveStatus(next).status==="verified")
     newRewardOnFinish=key;
  }
  // The committed transition is the ONLY source of newly granted achievements.
  // A storage failure cannot invalidate or replay the already saved action.
  newAchievements=grantCommittedAchievements();
  unlockToastDismissed=false; // A committed action may reveal new keys.
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
   newRewardOnFinish=null;newAchievements=[]; // No false reward on archive errors.
   unlockToastDismissed=true;
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