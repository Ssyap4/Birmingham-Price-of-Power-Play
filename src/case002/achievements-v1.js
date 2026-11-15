/* Case 002 achievements, separate from Case 001 and the 35 existing
 * hero × ending reward keys. Derived only from the committed engine view
 * and successfully archived Case 002 completion records. No engine writes.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002Achievements=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const KEY="birmingham_case002_achievements_draft_v1";
const safe=s=>Object.values(s.witnesses||{}).filter(v=>v==="protected"||v==="evacuated").length;
const witness=(s,id)=>["protected","evacuated"].includes(s.witnesses?.[id]);
const catalog=Object.freeze([
 {id:"two-tracks",name:"Два следа на карте",description:"Исследовать два независимых маршрута.",type:"investigation",
  done:({state:s})=>s.routes.length>=2},
 {id:"three-tracks",name:"Три дороги к правде",description:"Проверить все три независимых маршрута.",type:"investigation",
  done:({state:s})=>s.routes.length>=3},
 {id:"eight-clues",name:"Архив без пробелов",description:"Собрать не менее восьми разных улик.",type:"investigation",
  done:({state:s})=>s.evidence.length>=8},
 {id:"twelve-clues",name:"Ни одного пустого листа",description:"Собрать не менее двенадцати разных улик.",type:"investigation",
  done:({state:s})=>s.evidence.length>=12},
 {id:"three-proofs",name:"Три крепких довода",description:"Установить три независимых вывода.",type:"investigation",
  done:({facts})=>Object.values(facts).filter(Boolean).length>=3},
 {id:"first-forgery",name:"Рука фальсификатора",description:"Доказать первый подлог отправления.",type:"investigation",
  done:({facts})=>Boolean(facts.provedFirstForgery)},
 {id:"wagon-diversion",name:"Пропавший вагон",description:"Доказать перехват вагона.",type:"investigation",
  done:({facts})=>Boolean(facts.provedWagonDiversion)},
 {id:"factory-coverup",name:"Пепел под печатью",description:"Доказать сокрытие заводской аварии.",type:"investigation",
  done:({facts})=>Boolean(facts.provedFactoryCoverup)},
 {id:"hale-murder",name:"Правда у виадука",description:"Доказать убийство Эдварда Хейла.",type:"investigation",
  done:({facts})=>Boolean(facts.provedHaleMurder)},
 {id:"brackett-network",name:"Сеть Брэкетта",description:"Подтвердить связь счетов с преступной сетью.",type:"investigation",
  done:({facts})=>Boolean(facts.provedBrackettNetwork)},
 {id:"ada-shelter",name:"Убежище для Ады",description:"Обеспечить защиту Ады.",type:"people",
  done:({state:s})=>witness(s,"ada")},
 {id:"tommy-freed",name:"Младший Кросс свободен",description:"Обеспечить защиту Томми.",type:"people",
  done:({state:s})=>witness(s,"tommy")},
 {id:"mercer-safeguarded",name:"Слово под защитой",description:"Обеспечить защиту Мерсера.",type:"people",
  done:({state:s})=>witness(s,"mercer")},
 {id:"two-safe",name:"Не один голос",description:"Сохранить безопасность двух свидетелей одновременно.",type:"people",
  done:({state:s})=>safe(s)>=2},
 {id:"workers-cleared",name:"Пути свободны",description:"Вывести рабочих из опасной зоны.",type:"people",
  done:({state:s})=>Boolean(s.flags.workersCleared)},
 {id:"publication-ready",name:"Типографская правда",description:"Подготовить подтверждённые материалы для редакции.",type:"choices",
  done:({state:s})=>Boolean(s.flags.publicContactSecured)},
 {id:"three-outcomes",name:"Три цены власти",description:"Завершить дело тремя разными концовками.",type:"mastery",
  done:(_view,records,contract)=>new Set(records.filter(r=>
   r.caseId==="002"&&contract.endings.some(e=>e.id===r.ending)).map(r=>r.ending)).size>=3},
 {id:"five-detectives",name:"Пять взглядов на город",description:"Завершить дело за всех пятерых людей ближнего круга.",type:"mastery",
  done:(_view,records,contract)=>new Set(records.filter(r=>
   r.caseId==="002"&&contract.heroes.includes(r.heroId)&&
   contract.endings.some(e=>e.id===r.ending)).map(r=>r.heroId)).size>=5}
]);
const names=new Set(catalog.map(a=>a.id));
if(names.size!==catalog.length)throw Error("Duplicate Case 002 achievement IDs");
function eligible(view,contract,records=[]){
 if(!view||!view.state||!Array.isArray(view.state.history)||
    !view.state.history.length||!Array.isArray(view.state.evidence)||
    !Array.isArray(view.state.routes)||!view.facts||
    !contract||!Array.isArray(contract.endings)||!Array.isArray(contract.heroes))
  return [];
 return catalog.filter(a=>a.done(view,Array.isArray(records)?records:[],contract))
  .map(a=>a.id);
}
function read(store){
 if(!store)return {status:"unavailable",items:[],rows:[]};
 try{
  const rows=JSON.parse(store.getItem(KEY)||"[]");
  if(!Array.isArray(rows)||rows.some(r=>!r||typeof r.id!=="string"||
   !names.has(r.id)||typeof r.hero!=="string"||
   typeof r.attemptId!=="string"||typeof r.scene!=="string"))
    throw Error("Invalid achievement archive");
  const ids=new Set(rows.map(r=>r.id));
  if(ids.size!==rows.length)throw Error("Duplicate achievement archive entries");
  return {status:"ready",items:catalog.filter(a=>ids.has(a.id)),rows};
 }catch(_){return {status:"damaged",items:[],rows:[]};}
}
function grant(store,view,contract,completedRecords=[]){
 const archive=read(store);
 if(archive.status!=="ready")return {...archive,newly:[]};
 const ids=new Set(archive.rows.map(r=>r.id));
 const fresh=eligible(view,contract,completedRecords).filter(id=>!ids.has(id));
 if(!fresh.length)return {...archive,newly:[]};
 const s=view.state;
 const created=fresh.map(id=>({id,hero:s.hero,attemptId:s.attemptId,
  scene:s.node,unlockedAt:s.finished?s.completedAt||null:null}));
 try{
  store.setItem(KEY,JSON.stringify([...archive.rows,...created]));
  // An acknowledged write may still be discarded by some browser storage.
  // Only the exact saved entry can justify a new achievement notification.
  const verified=read(store);
  if(verified.status!=="ready"||created.some(row=>
    !verified.rows.some(saved=>saved.id===row.id&&
      saved.hero===row.hero&&saved.attemptId===row.attemptId&&
      saved.scene===row.scene)))
    return {status:verified.status==="ready"?"unavailable":verified.status,
      items:archive.items,rows:archive.rows,newly:[]};
  return {...verified,newly:catalog.filter(a=>fresh.includes(a.id))};
 }catch(_){
  return {status:"unavailable",items:archive.items,rows:archive.rows,newly:[]};
 }
}
return {KEY,catalog,eligible,read,grant};
});
