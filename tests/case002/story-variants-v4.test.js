#!/usr/bin/env node
"use strict";
/* Narrative consistency tests against the real isolated Case 002 draft engine.
 * Do not claim human editorial approval from these automated checks.
 */
const assert=require("node:assert/strict");
const {graph,contract,narration}=require("../../src/case002/browser-data-v3.js");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {render}=require("../../src/case002/story-variants-v4.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
const data={graph,contract,narration};
const make=hero=>createEngine({graph,contract,hero,attemptId:"dialogue-"+hero,now:()=>1700000000000});
let tested=0,scenes=new Set(),terminal=0;
const textFor=(g)=>render(data,g.view());
for(const hero of contract.heroes){
 for(const end of contract.endings){
  const g=make(hero),model=goodRoute(hero,end.id);
  const check=()=>{
   const v=g.view(),text=textFor(g);
   scenes.add(v.scene.id);
   assert(typeof text==="string"&&text.trim().length>20,hero+"/"+end.id+"/"+v.scene.id+" missing text");
   assert(!text.includes("undefined")&&!text.includes("[object Object]"));
   assert(!text.includes("\\n"),"accidentally escaped newline on "+v.scene.id);
   assert.equal(text,textFor(g),"dialogue must be deterministic");
   if(v.scene.id==="F05"||v.scene.id==="D10"||v.scene.id==="D11"||v.scene.id==="F08"){
     for(const name of ["Ада Уэбб","Томми Кросс","Дэниел Мерсер"])
       assert(text.includes(name),"current witness must be accounted for");
   }
   if(v.scene.id==="D06"&&v.state.witnesses.tommy==="detained")
     assert(text.includes("не выходит")&&!text.includes("меня спасли"),"no false Tommy rescue");
   if(v.scene.id==="F04"&&!v.facts.provedFactoryCoverup)
     assert(!text.includes("официально доказан"),"factory must not be declared proved");
   if(v.scene.id==="Z02"){
     const evacuated=Object.keys(v.state.witnesses).filter(x=>v.state.witnesses[x]==="evacuated");
     if(!evacuated.length)assert(text.includes("Никто из свидетелей не покинул город"),"no fictitious escape");
   }
   if(v.scene.chapter==="END"){
     terminal++;
     for(const name of ["Ада Уэбб","Томми Кросс","Дэниел Мерсер"])
       assert(text.includes(name),"ending must show real witness fates");
   }
   tested++;
  };
  check();
  for(const [from,to,action] of model.actionLog){
   assert.equal(g.snapshot().node,from,hero+"/"+end.id);
   g.choose(to,action);
   check();
  }
  assert(g.snapshot().finished);
 }
}
// Check presentation for every authored beat, not only routes encountered by fixtures.
for(const node of graph.nodes){
 const g=make(node.hero||"jack");
 const v=g.view();
 const faux={...v,scene:node};
 const text=render(data,faux);
 assert(text.length>20,"no prose for scene "+node.id);
 assert.equal(text,render(data,faux),"narrative output varies without changing state");
}
// State-dependent examples: unit snapshots are copies and never change game state.
const g=make("jack");
const view=g.view();
const mut=(id,configure)=>{
 const s=JSON.parse(JSON.stringify(view.state));
 configure(s);
 return render(data,{...view,scene:{...view.scene,id},state:s,
   facts:{...view.facts}});
};
assert(mut("D06",()=>{}).includes("не выходит"),"detained Tommy must not speak from freedom");
assert(mut("D09",()=>{}).includes("не может выдать убежище"),"unknown Ada hideout cannot be betrayed");
assert(mut("D01",()=>{}).includes("под охраной"),"witness list reflects detention");
assert(mut("E03",()=>{}).includes("публичного разоблачения ещё нет"),"no automatic newspaper publication");
assert(mut("E05",()=>{}).includes("Рабочие ещё находятся"),"sabotage not yet safe");
assert(mut("E07",()=>{}).includes("нет проверенной гарантии"),"no automatic Vale deal");
assert(mut("E10",s=>{s.flags.accountsGivenToWorkers=true}).includes("представитель рабочих"));
assert(mut("F08",s=>{s.flags.accountsGivenToWorkers=true}).includes("уже передана рабочим"));
assert(mut("Z04",()=>{}).includes("безопасность только тех свидетелей"),
 "Vale deal must not claim every witness is free");
assert(mut("Z02",()=>{}).includes("Никто из свидетелей не покинул город"));
assert(mut("Z02",s=>{s.witnesses.ada="protected"}).includes("Под временной защитой остались"),
 "protected is not evacuated");
assert(mut("Z02",s=>{s.witnesses.ada="evacuated"}).includes("Ада Уэбб"));
assert(mut("E08",s=>{s.flags.valeGuarantee=true}).includes("Вейл дал письменную гарантию"));
assert(mut("E08",s=>{s.flags.publicContactSecured=true}).includes("материалы ещё не опубликованы"));
assert(mut("E09",s=>{s.flags.brackettAccountsHeld=true}).includes("В папке героя лежит"));
assert(mut("E09",s=>{s.flags.accountsGivenToWorkers=true}).includes("Представитель рабочих получил"));
assert(mut("E09",()=>{}).includes("осталась у владельца"));
assert(mut("E10",s=>{s.flags.localIntermediary=true}).includes("Посредник подтвердил"));
assert(mut("F09",()=>{}).includes("отказаться от дальнейшей борьбы"));
assert(!mut("F09",()=>{}).includes("договор с Вейлом"),
 "Final shouldn't advertise an unearned deal");
assert(mut("F09",s=>{s.flags.accountsGivenToWorkers=true}).includes("отказаться"));
assert(mut("F02",()=>{}).includes("ещё не всё могу доказать"));
assert(mut("F03",()=>{}).includes("пока недостаточно независимых доказательств"));
assert(mut("F04",()=>{}).includes("ещё предстоит подтвердить"));
assert(mut("P02",s=>{s.prior={ending:"endingDeath"}}).includes("другой человек"));
assert(!mut("P02",()=>{}).includes("Предыдущее расследование стоило"));
assert.equal(Object.keys(narration).length,89);
console.log("PASS Case002 narrative variants: "+tested+" real-scene renders in 35 paths; "+
  scenes.size+" fixture scenes, "+terminal+" full epilogues, 89 authored nodes and "+
  "26 contradiction-focused variants.");
