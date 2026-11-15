(()=>{"use strict";
/* Text-only iPhone/Telegram draft interface. Never modifies Case 001 records. */
const data=window.BirminghamCase002Data,api=window.BirminghamCase002Engine;
const $=id=>document.getElementById(id);
const heroNames={jack:"Джек Харпер",finn:"Финн О’Коннор",eleanor:"Элеонора Блэквуд",victor:"Виктор Мэллоу",samuel:"Сэмюэл Рид"};
const approvedHeroPortraits={
  jack:"../../assets/case-scenes/heroJack.webp",
  finn:"../../assets/case-scenes/heroFinn.webp",
  eleanor:"../../assets/case-scenes/heroEleanor.webp",
  victor:"../../assets/case-scenes/heroVictor.webp",
  samuel:"../../assets/case-scenes/heroSamuel.webp"
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
  tab=button.dataset.tab;evidenceFocus=null;renderTools();
 });
 $("hero").addEventListener("change",refreshResume);
 for(const card of document.querySelectorAll("#heroGallery [data-hero]")){
  card.addEventListener("click",()=>{$("hero").value=card.dataset.hero;refreshResume();});
 }
 refreshResume();
}
function returnToLaunch(){
 hideNotice();$("game").hidden=true;$("launch").hidden=false;
 refreshResume();
 $("hero").focus({preventScroll:true});
 window.scrollTo(0,0);
}
function refreshResume(){
 const hero=$("hero").value;
 for(const card of document.querySelectorAll("#heroGallery [data-hero]"))card.setAttribute("aria-pressed",String(card.dataset.hero===hero));
 let available=false;
 try{available=Boolean(store&&store.getItem(api.SAVE_PREFIX+hero));}
 catch(e){
  appError("Не удалось прочитать сохранение. Проверьте доступность хранилища браузера.");
  console.warn("[Case002] save availability check failed",e);
 }
 $("resume").disabled=!available;
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
 $("saveStatus").textContent=store?"Автосохранение после каждого решения":"Нет постоянного сохранения в этом браузере";
 hideNotice();tab="evidence";evidenceFocus=null;pairFirst=null;pairFeedback=null;
 render();
 showCurrentScene();
}
// Preserve chapter titles on their first scene, then enter directly at the
// next illustrated scene instead of resetting the viewport to the masthead.
function showCurrentScene(){
 const story=$("storyPanel"),chapter=$("chapterIntertitle");
 story.focus({preventScroll:true});
 (chapter.hidden?story:chapter).scrollIntoView({block:"start",behavior:"auto"});
}
function setText(element,value){element.textContent=String(value);}
function make(tag,text,cls){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function sceneNarration(view){
 return window.BirminghamCase002Narrative.render(data,view);
}
function hideNotice(){
 $("notice").hidden=true;
 $("noticeJump").hidden=true;
 $("noticeExpand").hidden=true;
 $("noticeExit").hidden=true;
 activeNoticeFocus=null;
 activeNoticeDetails=null;
 activeNoticeSummary="";
}
function showNotice(text,focus=null,details=null){
 const notice=$("notice");
 activeNoticeSummary=String(text||"");
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
function jumpTo(where,evidenceId=null){
 if(!engine)return;
 let target;
 if(where==="scene")target=$("storyPanel");
 else if(where==="choices")target=$("choicesPanel");
 else if(where==="reading")target=$("sceneText");
 else if(["evidence","deductions","witnesses","journal"].includes(where)){
   tab=where;
   evidenceFocus=where==="evidence"?evidenceId:null;
   renderTools();
   target=$("caseTools");
 }else return;
 hideNotice();
 // Scroll to a real on-screen panel; never change story state or spend a choice.
 const row=evidenceId&&where==="evidence"?
   [...$("toolContent").querySelectorAll(".evidence-card")]
      .find(item=>item.dataset.evidenceId===evidenceId):null;
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
 setText($("sceneLocation"),sceneLocations[stage.location]||"Место расследования");
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
   choices.append(make("p",completionMessage(s),"muted"));
 }else{
   for(const c of v.choices){
    // Do not spoil undiscovered final endings with disabled grey buttons.
    if(s.node==="F09"&&!c.enabled)continue;
    const btn=make("button",undefined,"choice"+(!c.enabled?" is-disabled":"")+
      (c.confirm?" is-danger":"")+(s.visited.includes(c.to)?" is-visited":""));
    btn.type="button";btn.disabled=!c.enabled;
    btn.dataset.to=c.to;btn.dataset.action=c.action;
    let title=actionLabels[s.node+":"+c.to+":"+c.action]||c.actionTitle;
    if(c.action==="continue")title=c.title+(actionLabels[s.node+":"+c.to+":continue"]?" · "+title:"");
    btn.append(make("span",title,"choice-label"));
    if(c.action!=="continue")btn.append(make("span","Следующая сцена: "+c.title,"choice-detail"));
    if(!c.enabled)btn.append(make("span",translateReason(c,v),"choice-detail lock-reason"));
    // A detached old button cannot repeat an already committed transition.
    btn.addEventListener("click",()=>select(c,s.node));
    choices.append(btn);
   }
 }
 renderTools();
}
function renderTools(){
 for(const b of document.querySelectorAll(".tool-tab"))b.setAttribute("aria-pressed",String(b.dataset.tab===tab));
 const root=$("toolContent");root.replaceChildren();const v=engine.view();
 if(tab==="deductions"){
   const compare=window.BirminghamCase002DeductionBoard,held=v.state.evidence;
   if(held.length){
    const panel=make("section",undefined,"pair-board");
    panel.setAttribute("aria-label","Доска сопоставления улик");
    panel.append(make("h4","Доска расследования"));
    panel.append(make("p","Коснитесь улики, прочитайте подсказку и выберите вторую. Ошибки не влияют на сюжет и сохранение."));
    const gallery=make("div",undefined,"pair-items");
    for(const id of held){
     const btn=make("button",undefined,"pair-item");
     btn.type="button";btn.dataset.evidenceId=id;
     btn.setAttribute("aria-pressed",String(pairFirst===id));
     const icon=window.BirminghamCase002EvidenceArt.create(id);
     icon.setAttribute("aria-hidden","true");
     btn.append(icon,make("span",evidenceName(id)));
     btn.addEventListener("click",()=>{
      if(!pairFirst||pairFirst===id){
       pairFirst=pairFirst===id?null:id;
       pairFeedback=pairFirst?{title:evidenceName(id),message:evidenceHints[id]||"Сравните материал с независимыми свидетельствами."}:null;
      }else{
       pairFeedback=compare.comparePair(data.contract,engine.view().state.evidence,pairFirst,id);
       pairFirst=null;
      }
      renderTools();
     });
     gallery.append(btn);
    }
    panel.append(gallery);
    if(pairFeedback){
     const result=make("div",undefined,"pair-result");
     result.setAttribute("role","status");result.setAttribute("aria-live","polite");
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
         tab="evidence";evidenceFocus=id;renderTools();
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
   if(!entries.length){
     root.append(make("p","Важные решения появятся здесь после первого значимого поступка.","empty"));
     return;
   }
   const listing=make("ol",undefined,"case-journal");
   for(const item of entries){
     const li=make("li");
     li.append(make("strong","Сцена "+item.to));
     const ul=make("ul");
     for(const entry of item.notes)ul.append(make("li",entry));
     li.append(ul);listing.append(li);
   }
   root.append(listing);return;
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
      li.append(icon,description);
      list.append(li);
    }
    root.append(list);
    return;
  }

 if(tab==="witnesses"){
    const contacts=window.BirminghamCase002Cast.discovered(v.state);
    const hd=make("p","Обнаруженные персонажи","people-heading");
    root.append(hd);
    for(const person of contacts){
      const personRow=make("div",undefined,"person-entry");
      const monogram=make("span",person.name.split(" ").map(word=>word[0]).join("").slice(0,2),"person-monogram");
      monogram.setAttribute("aria-hidden","true");
      const copy=make("div",undefined,"person-copy");
      copy.append(make("strong",person.name));
      copy.append(make("span",person.role,"person-role"));
      if(person.status)copy.append(make("span",witnessLabel(person.id,person.status),"person-status"));
      personRow.append(monogram,copy);root.append(personRow);
    }
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
  const event=window.BirminghamCase002UIEvents.plan(
    before,next,choice.action,window.BirminghamCase002Consequences,evidenceName);
  evidenceFocus=null;
  render();
  showNotice(event.message,event.focus,event.details);
  // The old clicked choice no longer exists. Give the next scene focus and
  // scroll to its opening, including a new chapter intertitle when present.
  showCurrentScene();
 }catch(e){
  // A terminal scene is persisted first, then the engine writes the separate
  // records/rewards archives. If only that second phase fails, the decision
  // DID happen. Show the actual reached ending, never stale choice buttons.
  const committed=engine.snapshot().history.length>before.history.length;
  if(committed){
   render();
   showCurrentScene();
   showNotice("Решение принято и состояние расследования сохранено, но архив итогов или наград не обновлён: "+e.message+
    ". Не начинайте новую попытку до восстановления архива.",{tab:"journal",id:null});
   console.warn("[Case002] transition saved but completion archive failed",e);
  }else{
   showNotice("Действие не применено: "+e.message);
   console.warn("[Case002] transition rejected",e);
  }
 }
}
init();
})();