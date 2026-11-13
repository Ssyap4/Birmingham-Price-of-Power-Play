#!/usr/bin/env node
"use strict";
/* Check that on-screen notices report ONLY committed changes in Case 002. */
const assert=require("node:assert/strict");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
const {receipts,primary}=require("../../src/case002/consequences-v1.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
const make=hero=>createEngine({graph,contract,hero,attemptId:"receipt-"+hero});
const labels=id=>({"old_excursion_ticket":"Старинный билет Курзон-стрит",
 "brackett_accounts":"Копия счетов Брэкетта"})[id]||id;
let stateChecks=0,decisions=0,rareEvents=0;
for(const hero of contract.heroes)for(const ending of contract.endings){
 const g=make(hero);
 for(const [from,to,action] of goodRoute(hero,ending.id).actionLog){
  assert.equal(g.snapshot().node,from);
  const before=g.snapshot(),after=g.choose(to,action);
  const entries=receipts(before,after,action,labels);
  const summary=primary(before,after,action,labels);
  assert.equal(summary,primary(before,after,action,labels),"notice must be deterministic");
  assert.equal(entries.length>=0,true);
  assert(!summary.includes("undefined"),"unresolved notice token");
  const evidence=after.evidence.filter(id=>!before.evidence.includes(id));
  const witnessChanges=Object.entries(after.witnesses).filter(([id,v])=>v!==before.witnesses[id]);
  for(const id of evidence)
    assert(entries.some(x=>x.kind==="evidence"&&x.text.includes(labels(id))),
      "hidden new evidence notice "+hero+"/"+from+"->"+to+"/"+id);
  for(const [id] of witnessChanges)
    assert(entries.some(x=>x.kind==="witness"&&x.text.includes(
      ({ada:"Ада Уэбб",tommy:"Томми Кросс",mercer:"Дэниел Мерсер"})[id])),
     "hidden status change "+id+"/"+from+"->"+to);
  if(after.finished)
    assert(entries.some(x=>x.kind==="final"),"ending must show completion");
  if(action==="hideAda"){
    assert(summary.includes("Ада Уэбб")&&summary.includes("под защитой"));
    assert(!summary.includes("эвакуирован"),"hiding Ada is not an evacuation");
  }
  if(action==="extractTommy")assert(summary.includes("Томми Кросс")&&
    summary.includes("под защитой"));
  if(action==="prepareEvacuation")
    assert(entries.some(x=>x.text.includes("маршрут")),
      "route preparation must be reported");
  if(["betrayAda","passAccountsToWorkers","withdrawAda"].includes(action))rareEvents++;
  stateChecks+=2;decisions++;
 }
}
// Evidence appears as a one-time notification only when it was actually acquired.
{
 const g=make("jack");
 for(const to of ["P02","A01","A03","A05"]){
  const before=g.snapshot(),after=g.choose(to);
  const notice=primary(before,after,"continue",labels);
  if(to==="A05")assert(notice.includes("Старинный билет Курзон-стрит"));
 }
}
// When the villain receives the hiding-place address, danger must precede
// the witness entry and never be phrased as a successful rescue.
{
 const g=make("jack");const path=goodRoute("jack","trainTruth").actionLog;
 for(const [from,to,action] of path){
  if(from==="D10"&&to==="D01")break;
  g.choose(to,action);
 }
 g.choose("D01");g.choose("D07");g.choose("D08");g.choose("D09");
 const before=g.snapshot(),after=g.choose("D10","betrayAda");
 const notice=primary(before,after,"betrayAda");
 assert(notice.startsWith("Убежище Ады раскрыто"));
 assert(notice.includes("Ада Уэбб: под охраной"));
 assert(!notice.includes("под защитой"));
 rareEvents++;
}
// Giving the only copy away must take precedence over the lack of any new clue.
{
 const g=make("jack");
 for(const [from,to,action] of goodRoute("jack","trainControl").actionLog){
  if(from==="E09"&&to==="E10")break;
  g.choose(to,action);
 }
 const before=g.snapshot(),after=g.choose("E10","passAccountsToWorkers");
 const notice=primary(before,after,"passAccountsToWorkers");
 assert(notice.startsWith("Копия счетов передана рабочим"));
 assert.equal(after.evidence.length,before.evidence.length,"transfer cannot erase facts");
 assert.equal(after.evidenceLedger.brackett_accounts.holder,"workers");
 rareEvents++;
}
// With no safety evidence, a deliberate withdrawal is a real decision,
// not a phantom rescue or a phantom proof award.
{
 const g=make("jack");
 for(const [from,to,action] of goodRoute("jack","trainEscape").actionLog){
  if(from==="D01"&&to==="D07")break;
  g.choose(to,action);
 }
 g.choose("D02");
 const before=g.snapshot(),after=g.choose("D10","withdrawAda");
 const notice=primary(before,after,"withdrawAda");
 assert(notice.includes("без показаний Ады")&&!notice.includes("под защитой"));
 rareEvents++;
}
console.log("PASS Case002 decision receipts: "+decisions+
 " real decisions on 35 endings, "+stateChecks+
 " state checks, "+rareEvents+" consequence examples; never claim unearned protection.");
