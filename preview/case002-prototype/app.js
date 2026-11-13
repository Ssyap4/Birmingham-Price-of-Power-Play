(()=>{"use strict";
/* Text-only iPhone/Telegram draft interface. Never modifies Case 001 records. */
const data=window.BirminghamCase002Data,api=window.BirminghamCase002Engine;
const $=id=>document.getElementById(id);
const heroNames={jack:"Джек Харпер",finn:"Финн О’Коннор",eleanor:"Элеонора Блэквуд",victor:"Виктор Мэллоу",samuel:"Сэмюэл Рид"};
const witnessNames={ada:"Ада Уэбб",tommy:"Томми Кросс",mercer:"Дэниел Мерсер"};
const witnessLabels={missing:"местонахождение неизвестно",located:"найден",detained:"под охраной",protected:"под защитой",evacuated:"эвакуирован",deceased:"погиб"};
const proofLabels={provedFirstForgery:"Подлог отправления Мэйбл",provedWagonDiversion:"Перехват вагона F-4182",provedSecondForgery:"Подложная запись о прибытии",provedFactoryCoverup:"Сокрытие заводской аварии",provedHaleMurder:"Убийство Хейла Брэкеттом",provedBrackettNetwork:"Счета преступной сети"};
const stageLabels={P:"ПРОЛОГ",I:"ГЛАВА I · МЁРТВЫЙ ПАССАЖИР",II:"ГЛАВА II · ТРИ МАРШРУТА",III:"ГЛАВА III · НОЧНОЙ СТРЕЛОЧНИК",IV:"ГЛАВА IV · ТЕ, КТО НЕ ДОЛЖЕН ГОВОРИТЬ",V:"ГЛАВА V · ЦЕНА МОЛЧАНИЯ",VI:"ГЛАВА VI · ПОСЛЕДНИЙ СИГНАЛ",END:"ИСХОД РАССЛЕДОВАНИЯ"};
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
let store=null,engine=null,tab="evidence",priorRecords=[];
function appError(message){$("launchError").hidden=false;$("launchError").textContent=String(message);}
function readStorage(){
 try{
  const ls=window.localStorage,probe="case002_draft_probe";
  ls.setItem(probe,"1");ls.removeItem(probe);return ls;
 }catch(_){return null;}
}
function init(){
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
 $("backToLaunch").addEventListener("click",()=>{$("game").hidden=true;$("launch").hidden=false;window.scrollTo(0,0);});
 for(const button of document.querySelectorAll(".tool-tab"))button.addEventListener("click",()=>{tab=button.dataset.tab;renderTools();});
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
 render();window.scrollTo(0,0);
}
function setText(element,value){element.textContent=String(value);}
function make(tag,text,cls){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function sceneNarration(view){
 const n=view.scene.id,s=view.state;
 let raw=data.narration[n]||view.scene.beat;
 if(n==="C04"&&!s.evidence.includes("mabel_confession"))
  raw="Мэйбл медленно складывает лист с расписанием.\n— Вы спрашиваете меня о бумаге, которую не видели. Принесите подлинную ведомость — и я расскажу, зачем солгала.";
 if(n==="C10"&&(!view.facts.provedFirstForgery||!view.facts.provedWagonDiversion))
  raw="Поезд действительно ушёл из Бирмингема. Вагон F-4182 исчез из записей позже. Герой понимает, что между отправлением и прибытием кто-то изменил чужую историю.\n— Я знаю, что здесь две разные лжи. Теперь нужно доказать, кто их написал.";
 if((n==="D02"||n==="D03")&&s.witnesses.ada==="detained")
  raw="В котельной пахнет сырым углём. Ада уже не здесь: её убежище раскрыто, и охрана увела женщину. Остались только записанные ранее сведения.\n— Больше никого здесь не спрячешь, — говорит герой.";
 if(n==="D06"&&s.witnesses.tommy==="detained")
  raw="Мэйбл ждёт у ворот, но Томми не выходит. Караул не отпустил его.\n— Значит, мы ещё не закончили, — говорит она.\nВ отчёте герой оставляет отметку: «Томми — под охраной».";
 if(n==="E03"&&!s.flags.publicContactSecured)
  raw="Нора Келл откладывает рукопись.\n— Я не стану печатать недоказанную историю. Приходите с двумя независимыми цепочками улик.\nОна сохраняет черновик, но ни одна газета пока не получила материал.";
 if(n==="E05"&&!s.flags.workersCleared)
  raw="Рабочие ещё остаются у частного пути. Останавливать механизм сейчас опасно.\n— Я не стану рисковать чужими жизнями ради быстрой победы, — говорит герой.";
 if(n==="E07"&&!s.flags.valeGuarantee)
  raw="Вейл повторяет обещание безопасности. Но на столе нет ни подтверждённой подписи, ни залога.\n— Слов недостаточно, — отвечает герой.\nСделка пока не имеет силы.";
 if(n==="F05"){
  const entries=Object.entries(s.witnesses).map(([id,status])=>witnessNames[id]+": "+witnessLabels[status]).join("\n");
  raw="Перед окончательным решением герой проверяет судьбы трёх свидетелей:\n"+entries+
    "\n\nПодтверждённые выводы: "+
    (Object.entries(view.facts).filter(([,yes])=>yes).map(([id])=>proofLabels[id]).join("; ")||"пока нет достаточных независимых доказательств")+
    ".\nНикого нельзя назвать спасённым только потому, что его имя есть в досье.";
 }
 if(n==="Z02"){
  const evacuated=Object.entries(s.witnesses).filter(([,status])=>status==="evacuated").map(([id])=>witnessNames[id]);
  raw=evacuated.length
    ?"На окраине города затихли колёса. Под вымышленными именами уехали: "+evacuated.join(", ")+".\nДругих людей ещё ждёт опасность. Публичного правосудия не будет."
    :"Герой ушёл один. Ни одного свидетеля он не вывез. Железнодорожные книги всё так же хранили чужую ложь.\nВ городе всё спокойно — по крайней мере, на бумаге.";
 }
 return raw;
}
function showNotice(text){
 const notice=$("notice");setText(notice,text);notice.hidden=!text;
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
function render(){
 const v=engine.view(),s=v.state,scene=v.scene;
 setText($("chapterLabel"),stageLabels[scene.chapter]||scene.chapter);
 setText($("sceneId"),scene.id+" · "+heroNames[s.hero]);
 setText($("sceneTitle"),scene.title);
 const region=$("sceneText");region.replaceChildren();
 const raw=sceneNarration(v);
 for(const paragraph of raw.split(/\n\s*\n/)){
   if(paragraph.trim())region.append(make("p",paragraph.trim()));
 }
 const choices=$("choiceList");choices.replaceChildren();
 if(s.finished){
   choices.append(make("p","Расследование завершено. Отчёт и уникальный исход сохранены в черновом архиве.","muted"));
 }else{
   for(const c of v.choices){
    const btn=make("button",undefined,"choice"+(!c.enabled?" is-disabled":"")+
      (c.confirm?" is-danger":"")+(s.visited.includes(c.to)?" is-visited":""));
    btn.type="button";btn.disabled=!c.enabled;
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
 let items=[];
 if(tab==="evidence")items=v.state.evidence.map(x=>x.replaceAll("_"," "));
 if(tab==="deductions")items=Object.entries(v.facts).map(([id,proved])=>(proved?"✓ ":"○ ")+proofLabels[id]);
 if(tab==="witnesses")items=Object.entries(v.state.witnesses).map(([id,status])=>witnessNames[id]+" — "+witnessLabels[status]);
 if(!items.length){root.append(make("p","Здесь пока нет записей.","empty"));return;}
 const ul=make("ul");for(const i of items)ul.append(make("li",i));root.append(ul);
}
function select(choice){
 if(!engine||!choice.enabled)return;
 if(choice.confirm&&!window.confirm("Этот поступок может закончиться гибелью героя. Вы действительно принимаете смертельный риск?"))return;
 const before=engine.snapshot();
 try{
  const next=engine.choose(choice.to,choice.action);
  const gained=next.evidence.filter(x=>!before.evidence.includes(x));
  const moved=Object.entries(next.witnesses).filter(([id,state])=>state!==before.witnesses[id]);
  render();
  if(gained.length)showNotice("Новая улика: "+gained.map(x=>x.replaceAll("_"," ")).join(", "));
  else if(moved.length)showNotice(moved.map(([id,state])=>witnessNames[id]+" — "+witnessLabels[state]).join("; "));
  else showNotice(next.finished?"Расследование завершено. Итог сохранён.":"");
  window.scrollTo(0,0);
 }catch(e){
  showNotice("Действие не применено: "+e.message);
  console.warn("[Case002] transition rejected",e);
 }
}
init();
})();