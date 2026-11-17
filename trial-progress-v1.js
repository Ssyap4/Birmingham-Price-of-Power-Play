/* Read/write boundary for the existing trial stats key. No migration or new key. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.BirminghamTrialProgress=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const KEY="birmingham_price_of_power_stats_v1",levels={veryEasy:"Новичок Смолл-Хита",easy:"Человек с улицы",medium:"Правая рука",hard:"Хозяин Бирмингема"};
const blank=()=>({played:0,wins:0,best:0,perfect:0,completed:{},history:[]});
const integer=v=>Number.isSafeInteger(v)&&v>=0;
const object=v=>!!v&&typeof v==="object"&&!Array.isArray(v);
function decode(raw){
 if(raw===null)return {status:"ready",value:blank()};
 try{
  const s=JSON.parse(raw);if(!object(s))throw Error();
  for(const k of ["played","wins","best","perfect"])if(s[k]!==undefined&&!integer(s[k]))throw Error();
  if(s.completed!==undefined&&(!object(s.completed)||Object.values(s.completed).some(v=>!integer(v))))throw Error();
  if(s.history!==undefined&&(!Array.isArray(s.history)||s.history.some(h=>!object(h)||typeof h.won!=="boolean"||!integer(h.score)||typeof h.date!=="string"||!Number.isFinite(Date.parse(h.date)))))throw Error();
  const value={...blank(),...s};
  if(value.wins>value.played||value.perfect>value.wins)throw Error();
  return {status:"ready",value};
 }catch{return {status:"damaged",value:blank()}}
}
function read(store){try{return decode(store.getItem(KEY))}catch{return {status:"unavailable",value:blank()}}}
function update(store,mutate){
 const before=read(store);if(before.status!=="ready")return before;
 try{
  const next=mutate(before.value),raw=JSON.stringify(next),checked=decode(raw);
  if(checked.status!=="ready")return {status:"damaged",value:before.value};
  store.setItem(KEY,raw);
  if(store.getItem(KEY)!==raw)return {status:"unavailable",value:before.value};
  return checked;
 }catch{return {status:"unavailable",value:before.value}}
}
function start(store){return update(store,s=>({...s,played:s.played+1}))}
function finish(store,row,started){
 return update(store,s=>({...s,played:s.played+(started?0:1),wins:s.wins+(row.won?1:0),best:Math.max(s.best,row.score),perfect:s.perfect+(row.won&&row.errors===0?1:0),completed:row.won?{...s.completed,[row.difficulty]:(s.completed[row.difficulty]||0)+1}:s.completed,history:[row,...s.history].slice(0,20)}));
}
const catalog=[
 ["♠","ПЕРВЫЙ ШАГ","Начать первое испытание",s=>s.played>=1],
 ["♛","ПЕРВАЯ ПОБЕДА","Пройти испытание из 50 вопросов",s=>s.wins>=1],
 ["✦","ХОЛОДНЫЙ РАСЧЁТ","Победить без единой ошибки",s=>s.perfect>=1],
 ["◆","ВЕТЕРАН УЛИЦ","Завершить 10 попыток",s=>Math.max(s.history.length,s.wins)>=10],
 ["★","НЕСЛОМЛЕННЫЙ","Одержать пять побед",s=>s.wins>=5],
 ["♜","ВСЕ РАЙОНЫ","Победить на всех четырёх уровнях",s=>Object.keys(levels).every(k=>(s.completed[k]||0)>0)]
];
function awards(s){return catalog.map(([icon,title,description,done])=>({icon,title,description,earned:done(s)}))}
return {KEY,levels,read,start,finish,awards};
});
