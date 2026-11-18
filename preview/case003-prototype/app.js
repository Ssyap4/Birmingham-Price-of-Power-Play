"use strict";
const e=require("./engine-v1"),{nodes,contract}=require("./graph-v1"),n=require("./narrative-v2"),store=require("./storage-v1");
const $=id=>document.getElementById(id);
const heroes={
 jack:["Джек Харпер","Сила и защита"],finn:["Финн О’Коннор","Скрытность"],eleanor:["Элеонора Блэквуд","Наблюдение"],victor:["Виктор Мэллоу","Переговоры"],samuel:["Сэмюэл Рид","Механика"]
};
const claims={
 staged:["Что произошло в мастерской?","Сопоставьте физические следы с порядком событий или документами. Достаточно двух независимых наблюдений."],
 substitution:["Что случилось с вещами?","Сравните запись о возврате с фактическим движением предмета. Нужны три независимых источника."],
 killer:["Кто ответственен за смерть?","Свяжите присутствие в нужное время с предметом или следом. Одного подозрения недостаточно. Нужны три источника."],
 provenance:["Чьи вещи найдены?","Сопоставьте найденный предмет с независимыми приметами и его путём. Нужны три источника."]
};
const evidenceTitles={
 glass:"Осколки и рама",sound:"Порядок звуков",body:"Положение тела и стекла",safe:"Опись сейфа и корешки",receipt:"Квитанция Клары",returnbook:"Книга возвратов",repair:"Ремонтная запись",invoice:"Накладная Дарна",note:"Контрольная копия Коула",ida:"Отдельная ведомость Иды",key:"Журнал ключей",watch:"Журнал дежурства",marsh:"Показания Марша",trace:"След на прижиме",voss:"Расписка поставщика",alibi:"Расписка и слова Нелл",parcel:"Приметы найденных вещей",owner:"Описание часов владельцем",contract:"Договор хранения",transfer:"Корешок перевозчика",cuff:"Сопоставление ткани"
};
const clueFacts={glass:"Удар по раме изнутри; значительная часть стекла снаружи.",sound:"Нелл слышала тяжёлый стук раньше стекла. Лиц не видела.",body:"Осколки на фартуке, чистый пол под телом. Врач отметил тяжёлую травму.",safe:"Даты отправки вещей предшествуют ночи смерти.",receipt:"Кольцо отдано в залог; Клара отрицает выдачу.",returnbook:"Номер 47: запись возврата и подпись К. Хейт.",repair:"Косая царапина на кольце и повторный ремонт после заявленной выдачи.",invoice:"Партия Дарна содержит номера старых заказов, включая 47.",note:"Коул сверял наличие вещей; у заявленных возвратов пометы о невыдаче.",ida:"В личной ведомости Иды независимые пометы о невыданных заказах.",key:"Восс получал ключ до закрытия; один ключ не доказывает присутствие.",watch:"Дежурный записал приход Восса после девяти и разговор у верстака.",marsh:"Марш видел приход и уход Восса, слышал спор и удар, но не видел самого удара.",trace:"Скол оттиска папки Восса совпадает с фрагментом сургуча на прижиме.",voss:"Поставщик фиксировал передачу прижима Воссу для встречи с Коулом к девяти.",alibi:"Слова Нелл и расписка помещают Белла в её лавке во время предполагаемого убийства.",parcel:"Кольцо с косой царапиной, часы с неровными буквами, номер партии на ящике.",owner:"Владелец заранее описал неровные буквы Р и М на крышке часов.",contract:"Приём на хранение и выдача требуют разных подтверждений.",transfer:"Перевозчик фиксировал номер партии, дату и получателя Дарна.",cuff:"Край обрывка из руки Коула совпадает с разрывом манжеты Восса."};
function confirmed(id,s){
 if(id==="staged")return "Картина ночного ограбления не сходится с независимыми следами. Есть основания считать её инсценировкой.";
 if(id==="substitution")return "Записи о выдаче не соответствуют фактическому движению вещей. Подтверждена подмена возвратов.";
 if(id==="killer")return "Независимые следы связывают Эдмунда Восса с последней встречей и смертью Коула. Это основание для обвинения, не судебный приговор.";
 const have=a=>a.every(x=>s.evidence.includes(x));let parts=[];
 if(have(["parcel","repair","receipt"]))parts.push("Кольцо Клары опознано по независимым записям и приметам.");
 if(have(["parcel","owner","transfer"]))parts.push("Часы опознаны по описанию владельца и пути партии.");
 return parts.join(" ")+" Выдача возможна только после сохранения вещей.";
}
const flagTitles={witnessProtected:"Нужна защита свидетеля",materialsAccepted:"Передайте материалы Эш",goodsSecured:"Обеспечьте хранение вещей",vossAgreement:"Требуется принятая сделка",darnAgreement:"Требуется соглашение о партии",warnedRisk:"Требуется предупреждение"};
const storage={getItem:k=>window.localStorage.getItem(k),setItem:(k,v)=>window.localStorage.setItem(k,v)};
let hero="jack",active=null,tab="scene",busy=false,claimOpen=null;
const make=(tag,text,cls)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(cls)el.className=cls;return el;};
const button=(text,fn,cls)=>{const b=make("button",text,cls);b.type="button";b.onclick=fn;return b;};
function alertText(text=""){$("status").hidden=!text;$("status").textContent=text;}
function show(id){for(const x of ["brief","launch","game","tools"])$(x).hidden=x!==id;$("nav").hidden=!["game","tools"].includes(id);}
function top(el){window.scrollTo(0,0);if(el){el.focus({preventScroll:true});}}
function attempt(){return Date.now().toString(36)+"-"+Array.from(crypto.getRandomValues(new Uint32Array(2))).map(x=>x.toString(36)).join("-");}
function launch(){
 active=null;tab="scene";show("launch");renderHeroes();top();
}
function renderHeroes(){
 const wrap=$("heroes");wrap.replaceChildren();
 for(const [id,[name,trait]] of Object.entries(heroes)){
  const b=button("",()=>{hero=id;renderHeroes();$("heroes").querySelector('[data-hero="'+id+'"]').focus({preventScroll:true});},"hero");
  b.dataset.hero=id;b.setAttribute("aria-pressed",String(id===hero));
  const img=make("img");img.src="../../assets/heroes/"+id+".webp";img.alt="";img.width=52;img.height=65;
  const text=make("span",name);text.append(make("small",trait));b.append(img,text);
  const status=store.read(storage,id).status;
  if(status!=="empty")text.append(make("small",({active:"Сохранено",finished:"Отчёт сохранён",damaged:"Требует проверки",unavailable:"Хранилище недоступно"})[status]));
  wrap.append(b);
 }
 const r=store.read(storage,hero);
 $("slotInfo").textContent=({empty:"Начните отдельное расследование.",active:"Можно продолжить сохранённую попытку.",finished:"Можно открыть итог или начать новое расследование.",damaged:"Сохранение повреждено. Не будет заменено без вашего подтверждения и резервной копии.",unavailable:"Хранилище недоступно. Начало и продолжение заблокированы."})[r.status];
 $("resume").hidden=!["active","finished"].includes(r.status);
 $("resume").textContent=r.status==="finished"?"Открыть отчёт":"Продолжить расследование";
 $("begin").disabled=r.status==="unavailable";$("begin").textContent=r.status==="damaged"?"Заменить повреждённую попытку":r.status==="empty"?"Начать расследование":"Начать новую попытку";
 const rewards=new Map();for(const id of contract.heroes){for(const record of store.read(storage,id).slot?.records||[])rewards.set(record.reward,record);}
 $("rewardCount").textContent=rewards.size+" / 35";$("rewards").replaceChildren();
 if(!rewards.size)$("rewards").append(make("p","Пока нет завершённых расследований."));
 for(const [id,r] of rewards)$("rewards").append(make("p",heroes[id.split(":")[1]][0]+" · "+nodes[r.ending].title));
}
function open(r){
 active=r;tab="scene";claimOpen=null;alertText();renderScene([],false);top($("sceneTitle"));
}
$("choose").onclick=()=>{alertText();launch();};$("briefBack").onclick=()=>{show("brief");top();};
$("resume").onclick=()=>{const r=store.read(storage,hero);if(r.slot)open(r);else renderHeroes();};
$("begin").onclick=()=>{
 const r=store.read(storage,hero);if(r.status==="unavailable")return;
 if(r.status!=="empty"&&!confirm(r.status==="damaged"?"Сохранить повреждённую запись в резерве и начать заново?":"Начать новую попытку? Текущая заменится, полученные награды останутся."))return;
 try{open(r.status==="damaged"?store.replaceDamaged(storage,hero,r.raw,attempt()):store.begin(storage,hero,r.raw,attempt()));}
 catch{alertText("Не удалось начать: хранилище недоступно или запись изменилась.");renderHeroes();}
};
function errorFor(a,s){
 if(a.ending){
  const end=contract.endings.find(x=>x.id===a.ending);
  const missing=end.claims.filter(x=>!s.claims.includes(x));
  if(missing.length)return "Не подтверждены необходимые выводы.";
  const flag=end.flags.find(x=>!s.flags.includes(x));
  return flag?flagTitles[flag]||"Не выполнено условие":"Несовместимо с принятым обязательством.";
 }
 if((a.needEvidence||[]).some(x=>!s.evidence.includes(x)))return "Сначала проверьте соответствующее направление.";
 if((a.needClaims||[]).some(x=>!s.claims.includes(x)))return "Сначала подтвердите вывод в журнале.";
 return "Несовместимо с принятым решением.";
}
function renderScene(gained=[],earned=false){
 if(!active)return;show("game");tab="scene";navState();
 const s=active.slot.state,node=nodes[s.node];
 $("chapter").textContent="ГЛАВА "+node.chapter+" · "+contract.chapters.find(c=>c.id===node.chapter).title;
 $("heroName").textContent=heroes[s.hero][0];$("heroPortrait").src="../../assets/heroes/"+s.hero+".webp";
 $("sceneKicker").textContent=s.ending?"ИТОГ РАССЛЕДОВАНИЯ":"МАТЕРИАЛЫ ДЕЛА";
 $("sceneTitle").textContent=node.title;$("sceneText").replaceChildren();
 for(const line of n.sceneText(s)){
  const p=make("p");const m=line.match(/^([^—]{1,35}) — (.+)$/);
  if(m){p.className="dialogue";p.append(make("strong",m[1]+" — "),document.createTextNode(m[2]));}else p.textContent=line;
  $("sceneText").append(p);
 }
 $("found").hidden=!gained.length;$("found").textContent=gained.length?"Найдено: "+gained.map(x=>evidenceTitles[x]).join(" · "):"";
 $("award").hidden=!earned;$("award").textContent=earned?"Новая уникальная награда дела":"";
 const choices=$("choices");choices.replaceChildren(); $("choiceSection").querySelector("h3").textContent=s.ending?"Расследование завершено":"Ваше решение";
 if(s.ending){
  choices.append(button("К выбору героя",launch,"primary"));
  return;
 }
 const available=e.available(s);
 for(const a of node.actions){
  if(a.hero&&a.hero!==s.hero||a.once&&s.visited.includes(a.to))continue;
  // In the finale, avoid spoiling locked outcomes; explain that evidence unlocks further actions.
  if(a.ending&&!available.includes(a))continue;
  const b=button(a.label,()=>apply({type:"step",id:a.id}),"choice");
  b.dataset.action=a.id;
  if(a.fatal||a.id==="risk")b.dataset.danger="true";
  if(!available.includes(a)){b.disabled=true;b.append(make("small",errorFor(a,s)));}
  choices.append(b);
 }
 if(s.node==="F02"&&available.length<node.actions.length)choices.append(make("p","Другие решения требуют подтверждённых выводов или ранее принятых обязательств. Можно открыть «Выводы»."));
}
function apply(operation){
 if(busy||!active)return;
 busy=true;
 try{
  const prev=active.slot.state,r=store.advance(storage,hero,active.raw,operation);
  if(!r.changed){if(operation.type==="prove")return false;return;}
  active=r;alertText();
  if(operation.type==="step"){renderScene(r.slot.state.evidence.filter(x=>!prev.evidence.includes(x)),r.earned);top($("sceneTitle"));}
  return true;
 }catch{alertText("Запись не сохранена. Возможно, другая вкладка изменила попытку. Вернитесь к выбору героя.");return false;}
 finally{busy=false;}
}
function navState(){for(const b of $("nav").querySelectorAll("button"))b.setAttribute("aria-pressed",String(b.dataset.tab===tab));}
function switchTab(which){
 if(!active)return;
 if(which==="exit"){launch();return;}
 if(which==="scene"){renderScene();top($("sceneTitle"));return;}
 tab=which;show("tools");navState();renderTools();top($("toolTitle"));
}
function renderTools(){
 const s=active.slot.state,p=$("toolContent");p.replaceChildren();
 $("toolTitle").textContent=tab==="evidence"?"Улики":"Выводы";
 if(tab==="evidence"){
  if(!s.evidence.length)p.append(make("p","Пока ничего не найдено."));
  for(const id of s.evidence){const card=make("div",undefined,"evidence");card.append(make("strong",evidenceTitles[id]),make("p",clueFacts[id]));p.append(card);}
  return;
 }
 p.append(make("p","Выберите вопрос и сопоставьте найденные улики. Ошибочный выбор не отнимает находки."));
 for(const c of contract.claims){
  const box=make("div",undefined,"claim"),heading=make("h3",claims[c.id][0]);box.append(heading);
  if(s.claims.includes(c.id)){box.append(make("p","✓ Вывод подтверждён."),make("p",confirmed(c.id,s)));p.append(box);continue;}
  if(s.ending){box.append(make("p","Не подтверждён в этой попытке."));p.append(box);continue;}
  const toggle=button(claimOpen===c.id?"Скрыть улики":"Сопоставить улики",()=>{claimOpen=claimOpen===c.id?null:c.id;renderTools();});
  toggle.dataset.claim=c.id;box.append(toggle);
  if(claimOpen===c.id){
   const hint=make("details");hint.append(make("summary","Подсказка"),make("p",claims[c.id][1]));box.append(hint);
   const selected=new Set();
   for(const id of s.evidence){
    const label=make("label"),input=make("input");input.type="checkbox";input.value=id;input.onchange=()=>{if(input.checked)selected.add(id);else selected.delete(id);};
    label.append(input,document.createTextNode(evidenceTitles[id]));box.append(label);
   }
   const feedback=make("p");feedback.setAttribute("role","status");
   const check=button("Проверить вывод",()=>{if(apply({type:"prove",id:c.id,evidence:[...selected]})){claimOpen=null;renderTools();}else feedback.textContent="Эти улики пока не образуют нужную цепочку. Попробуйте другой набор или продолжите расследование.";});
   check.dataset.prove=c.id;box.append(check,feedback);
  }
  p.append(box);
 }
}

for(const b of $("nav").querySelectorAll("button"))b.onclick=()=>switchTab(b.dataset.tab);
window.addEventListener("storage",ev=>{
 if(active&&(ev.key===null||ev.key===store.key(hero))){launch();alertText("Сохранение изменилось в другой вкладке. Откройте актуальную попытку.");}
 else if(!$("launch").hidden)renderHeroes();
});
