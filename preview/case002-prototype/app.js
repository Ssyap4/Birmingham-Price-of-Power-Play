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
const witnessNames={ada:"Ада Уэбб",tommy:"Томми Кросс",mercer:"Дэниел Мерсер"};
const witnessLabels={missing:"местонахождение неизвестно",located:"найден",detained:"под охраной",protected:"под защитой",evacuated:"эвакуирован",deceased:"погиб"};
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
 $("backToLaunch").addEventListener("click",()=>{
   hideNotice();$("game").hidden=true;$("launch").hidden=false;window.scrollTo(0,0);
 });
 $("noticeDismiss").addEventListener("click",hideNotice);
 $("noticeJump").addEventListener("click",()=>{
   if(activeNoticeFocus)jumpTo(activeNoticeFocus.tab,activeNoticeFocus.id);
 });
 for(const button of document.querySelectorAll("#quickNav [data-go]")){
   button.addEventListener("click",()=>jumpTo(button.dataset.go));
 }
 for(const button of document.querySelectorAll(".tool-tab"))button.addEventListener("click",()=>{tab=button.dataset.tab;evidenceFocus=null;renderTools();});
 $("hero").addEventListener("change",refreshResume);
 refreshResume();
}
function refreshResume(){
 const hero=$("hero").value;
 $("resume").disabled=!store||!store.getItem(api.SAVE_PREFIX+hero);
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
 }catch(e){appError("Не удалось открыть сохранение: "+e.message);}
}
function showGame(){
 $("launch").hidden=true;$("game").hidden=false;
 $("saveStatus").textContent=store?"Автосохранение после каждого решения":"Нет постоянного сохранения в этом браузере";
 hideNotice();evidenceFocus=null;
 render();window.scrollTo(0,0);
}
function setText(element,value){element.textContent=String(value);}
function make(tag,text,cls){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function sceneNarration(view){
 return window.BirminghamCase002Narrative.render(data,view);
}
function hideNotice(){
 $("notice").hidden=true;
 $("noticeJump").hidden=true;
 activeNoticeFocus=null;
}
function showNotice(text,focus=null){
 const notice=$("notice");
 setText($("noticeContent"),text);
 notice.hidden=!text;
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
 const view=engine.view();
 let target;
 if(where==="scene")target=$("storyPanel");
 else if(where==="choices")target=$("choicesPanel");
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
 const root=$("sceneArtwork"),img=$("sceneArtworkImage"),
       mobile=$("sceneArtworkMobile"),host=$("game");
 const serial=++artRenderSerial;
 root.hidden=true;
 root.dataset.portrait="false";
 host.dataset.artVerified="false";
 img.onload=null;
 img.onerror=null;
 // Clear both sources to prevent a late load from the previous scene.
 mobile.removeAttribute("srcset");
 img.removeAttribute("src");
 const approved=window.BirminghamCase002ApprovedArt.resolveScene(stage);
 if(!approved)return;
 img.alt=approved.alt;
 if(approved.mobileSrc){
   root.dataset.portrait="true";
   mobile.srcset=approved.mobileSrc;
 }
 img.onload=()=>{
   if(serial!==artRenderSerial || host.dataset.artScene!==stage.sceneId ||
      host.dataset.artVariant!==stage.variantKey)return;
   const mobileSelected=Boolean(approved.mobileSrc)&&
     img.currentSrc.includes("--mobile.webp");
   const dimensionsOK=mobileSelected?
     img.naturalWidth>=500&&img.naturalHeight>=700:
     img.naturalWidth>=800&&img.naturalHeight>=450;
   if(dimensionsOK){
     root.hidden=false;
     host.dataset.artVerified="true";
   }
 };
 img.onerror=()=>{
   if(serial===artRenderSerial){
     root.hidden=true;
     host.dataset.artVerified="false";
   }
 };
 img.src=approved.src;
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
   if(person.status)desc.append(make("small",witnessLabels[person.status]||person.status,
     "scene-participant-status"));
   card.append(desc);root.append(card);
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
 window.BirminghamCase002SceneProse.render(region,sceneNarration(v));
 const choices=$("choiceList");choices.replaceChildren();
 if(s.finished){
   choices.append(make("p","Расследование завершено. Отчёт и уникальный исход сохранены в черновом архиве.","muted"));
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
    btn.addEventListener("click",()=>select(c));
    choices.append(btn);
   }
 }
 renderTools();
}
function renderTools(){
 for(const b of document.querySelectorAll(".tool-tab"))b.setAttribute("aria-pressed",String(b.dataset.tab===tab));
 const root=$("toolContent");root.replaceChildren();const v=engine.view();
 if(tab==="deductions"){
   const leads=window.BirminghamCase002DeductionBoard.board(data.contract,v.state.evidence);
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
      if(person.status)copy.append(make("span",witnessLabels[person.status]||person.status,"person-status"));
      personRow.append(monogram,copy);root.append(personRow);
    }
    if(!contacts.length)root.append(make("p","Знакомства появятся по мере расследования. Чужие личности заранее не раскрываются.","empty"));
    return;
  }
 if(!items.length){root.append(make("p","Здесь пока нет записей.","empty"));return;}
 const ul=make("ul");for(const i of items)ul.append(make("li",i));root.append(ul);
}
function select(choice){
 if(!engine||!choice.enabled)return;
 if(choice.confirm&&!window.confirm("Этот поступок может закончиться гибелью героя. Вы действительно принимаете смертельный риск?"))return;
 const before=engine.snapshot();
 try{
  const next=engine.choose(choice.to,choice.action);
  const event=window.BirminghamCase002UIEvents.plan(
    before,next,choice.action,window.BirminghamCase002Consequences,evidenceName);
  evidenceFocus=null;
  render();
  showNotice(event.message,event.focus);
  window.scrollTo(0,0);
 }catch(e){
  showNotice("Действие не применено: "+e.message);
  console.warn("[Case002] transition rejected",e);
 }
}
init();
})();