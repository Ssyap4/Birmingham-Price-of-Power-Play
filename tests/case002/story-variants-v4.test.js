#!/usr/bin/env node
"use strict";
/* Narrative consistency tests against the real isolated Case 002 draft engine.
 * Do not claim human editorial approval from these automated checks.
 */
const assert=require("node:assert/strict");
const {graph,contract,narration}=require("../../src/case002/browser-data-v3.js");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {render,witnessStatus,witnessName,personalizeEleanor,eleanorEdits}=require("../../src/case002/story-variants-v4.js");
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
   if(v.scene.id==="F09")
     assert(!text.includes("Оставались трудные пути") &&
       !text.includes("публичное расследование;"),"Finale prose must not duplicate menu options");
   if(v.scene.id==="Z02"){
     const evacuated=Object.keys(v.state.witnesses).filter(x=>v.state.witnesses[x]==="evacuated");
     if(!evacuated.length)assert(text.includes("Никто из свидетелей не покинул город"),"no fictitious escape");
   }
   if(v.scene.chapter==="END"){
     terminal++;
     assert(!text.includes("Итоговая запись о свидетелях:") &&
       !text.includes("\nДоказано:"),"The dramatic ending must not repeat an audit ledger");
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
assert(mut("D01",()=>{}).includes("задержан частной охраной"),
 "witness list distinguishes detention from protection");
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
assert(mut("F09",()=>{}).includes("обещать кому-либо выезд из города пока было нельзя"),
 "A protected witness alone must not be called evacuated");
assert(mut("F09",s=>{s.witnesses.ada="protected";s.flags.evacuationRoutePrepared=true}).includes("Пока они только под защитой"), "A prepared route is not a completed evacuation");
assert(mut("F09",s=>{s.witnesses.ada="evacuated"}).includes("кого уже удалось вывезти"),
 "A recorded evacuation must remain visible without inventing other rescues");
assert(!mut("F09",()=>{}).includes("Оставались трудные пути"),
 "Final decision should not repeat the choice menu inside the story");
assert(!mut("F09",()=>{}).includes("договор с Вейлом"),
 "Final shouldn't advertise an unearned deal");
assert(mut("F09",s=>{s.flags.accountsGivenToWorkers=true}).includes("отказаться"));
assert(mut("F02",()=>{}).includes("ещё не всё могу доказать"));
assert(mut("F03",()=>{}).includes("пока недостаточно независимых доказательств"));
assert(mut("F04",()=>{}).includes("ещё предстоит подтвердить"));
assert(mut("P02",s=>{s.prior={ending:"endingDeath"}}).includes("другой человек"));
assert(!mut("P02",()=>{}).includes("Предыдущее расследование стоило"));

/* Grammatical and factual safety: 3 people x 6 statuses x 5 in-world
 * investigative summaries. The seven endings use the discovered-only
 * report instead of repeating the complete witness ledger. */
const recaps=["D01","D10","D11","F05","F08"];
const witnessIds=["ada","tommy","mercer"];
const witnessStates=["missing","located","detained","protected","evacuated","deceased"];
const feminineAda={
 located:"найдена, но не защищена",
 detained:"задержана частной охраной",
 evacuated:"вывезена из города",deceased:"погибла"
};
for(const status of witnessStates)for(const id of witnessIds){
 const label=witnessStatus(id,status);
 if(id==="ada"&&feminineAda[status])
   assert.equal(label,feminineAda[status],"Ada's status must use a feminine form");
 if(id!=="ada"&&status==="located")assert.equal(label,"найден, но не защищён");
 if(id!=="ada"&&status==="evacuated")assert.equal(label,"вывезен из города");
 if(id!=="ada"&&status==="deceased")assert.equal(label,"погиб");
 if(status==="protected")assert.equal(label,"под защитой");
 if(status==="detained")assert(label.includes("частной охраной"));
 for(const sceneId of recaps){
   const copy=mut(sceneId,s=>{s.finished=true;s.witnesses[id]=status});
   const prefix=witnessName[id]+(sceneId==="D01"?": ":" — ");
   assert(copy.includes(prefix+label),
     sceneId+"/"+id+"/"+status+": missing correct status in recap");
 }
}
assert(mut("D06",()=>{}).includes("Томми Кросс — задержан частной охраной."),
 "Detained Tommy should never be mistaken for protected Tommy");


/* Gender-safe editorial replay: common scenes must identify Eleanor naturally,
 * while NPC dialogue, other playable heroes and evidence outcomes remain intact. */
const heroine=make("eleanor").view();
const male=make("jack").view();
const commonNode=id=>graph.nodes.find(x=>x.id===id);
const asHero=(heroView,id,options={})=>render(data,{
 ...heroView,scene:commonNode(id),
 state:{...heroView.state,...(options.state||{})},
 facts:{...heroView.facts,...(options.facts||{})}
});
for(const [id,replacements] of Object.entries(eleanorEdits)){
 assert(commonNode(id),"editorial mapping must refer to an authored scene: "+id);
 assert(!commonNode(id).hero,"personal hero scenes must remain authored: "+id);
 for(const [original,revised] of replacements){
   assert.equal(personalizeEleanor(id,original),revised,id+" editorial text replacement");
   assert(!personalizeEleanor(id,original).includes(original),id+" retains male hero phrase");
 }
 const femaleText=asHero(heroine,id);
 for(const [original] of replacements)
   assert(!femaleText.includes(original),id+" retains an inappropriate masculine expression");
}
for(const id of ["A01","A08","B01","B02","B11","C08","D02","D10","F02","F07","F09","Z02"]){
 assert.notEqual(asHero(heroine,id),asHero(male,id),id+" must differ by protagonist");
}
assert(asHero(heroine,"A01").includes("спросила она"));
assert(asHero(heroine,"B02").includes("Тогда сначала проверьте"));
assert(!asHero(heroine,"B02").includes("сэр"));
assert(asHero(heroine,"D02").includes("Разве человек Вейла"));
assert(asHero(heroine,"D10").includes("Элеонора записала"));
assert(asHero(heroine,"F02").includes("произнесла Элеонора"));
assert(asHero(heroine,"F02",{facts:{provedFirstForgery:true,provedSecondForgery:true}})
 .includes("сказала Элеонора"));
assert(asHero(heroine,"C10",{facts:{provedFirstForgery:true,provedWagonDiversion:true}})
 .includes("сказала Элеонора"));
assert(asHero(heroine,"E07",{state:{flags:{...heroine.state.flags,valeGuarantee:true}}})
 .includes("отвечает Элеонора"));
assert(asHero(heroine,"Z02").includes("Элеонора оставила расследование"));
assert(asHero(male,"D02").includes("Если бы я был от него"));
assert(asHero(male,"B02").includes("сэр"));
assert(asHero(male,"F02").includes("произнёс он"));
assert(asHero(heroine,"E10").includes("представитель рабочих")===false ||
 !asHero(heroine,"E10").includes("сказала Элеонора"),
 "Do not feminize male NPC voices");

assert(asHero(heroine,"D09").includes("сама не обнаружила"));
assert(asHero(heroine,"E08").includes("Элеонора должна отдельно решить"));
assert(asHero(heroine,"E09",{state:{flags:{...heroine.state.flags,accountsGivenToWorkers:true}}})
 .includes("Элеонора сохранила записанные сведения"));
assert(asHero(heroine,"E09").includes("Элеонора не может распорядиться"));
assert(asHero(heroine,"E10",{state:{flags:{...heroine.state.flags,accountsGivenToWorkers:true}}})
 .includes("Элеонора осталась со знанием"));
assert(asHero(heroine,"F08",{state:{flags:{...heroine.state.flags,brackettAccountsHeld:true}}})
 .includes("Ей предстоит решить"));
assert(asHero(heroine,"Z04").includes("Элеонора уже сумела"));
assert(asHero(heroine,"Z06").includes("Она не опубликовала их и не передала"));
assert(asHero(heroine,"Z06").includes("Элеонора действительно сумела"));
const fs=require("node:fs");
const preview=fs.readFileSync(require("node:path").join(__dirname,"../../preview/case002-prototype/app.js"),"utf8");
assert(preview.includes("BirminghamCase002Narrative.witnessStatus(id,status)"),
 "mobile witness labels must reuse canonical gender-sensitive statuses");
assert(!preview.includes("const witnessLabels="),
 "old ambiguous mobile labels must not diverge from narration");

assert.equal(Object.keys(narration).length,89);
console.log("PASS Case002 narrative variants: "+tested+" real-scene renders in 35 paths; "+
  scenes.size+" fixture scenes, "+terminal+" full epilogues, 89 authored nodes and "+
  "26 contradiction-focused variants, 90 witness-status recaps and "+
  Object.keys(eleanorEdits).length+" heroine scene edit groups.");
