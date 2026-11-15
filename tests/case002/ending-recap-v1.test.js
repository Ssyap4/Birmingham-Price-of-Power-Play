#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
const {createEngine}=require("../../src/case002/engine-v3.js");
const cast=require("../../src/case002/cast-registry-v1.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
const {build}=require("../../src/case002/ending-recap-v1.js");
let tested=0;
for(const hero of contract.heroes)for(const ending of contract.endings){
 const g=createEngine({graph,contract,hero,attemptId:"recap-"+hero+"-"+ending.id});
 assert.equal(build(g.view(),contract,cast.discovered(g.snapshot())),null,
   "No finale or ending spoilers before a real terminal scene");
 for(const [from,to,action] of goodRoute(hero,ending.id).actionLog){
  assert.equal(g.snapshot().node,from);
  g.choose(to,action);
 }
 const s=g.snapshot(),v=g.view();
 assert(s.finished,"Model fixture must end in a verified terminal node");
 const contacts=cast.discovered(s);
 const archived=JSON.stringify(s),repeated=build(v,contract,contacts),next=build(v,contract,contacts);
 assert.deepEqual(repeated,next,"Recap must be deterministic");
 assert.equal(JSON.stringify(s),archived,"Recap must not mutate engine state");
 assert.equal(repeated.endingId,ending.id);
 assert.equal(repeated.title,ending.title);
 assert.equal(repeated.sceneId,v.scene.id);
 assert.equal(repeated.hero,hero);
 assert.equal(repeated.evidenceCount,s.evidence.length);
 assert.equal(repeated.proofCount,Object.values(v.facts).filter(Boolean).length);
 assert.deepEqual(repeated.proofIds,
   Object.keys(v.facts).filter(id=>v.facts[id]===true),
   "The report must list exactly the demonstrated facts of this real ending");
 assert.equal(repeated.proofIds.length,repeated.proofCount,
   "Number and labels of verified facts must agree");
 assert.equal(repeated.safeCount,v.safeWitnessCount);
 assert.equal(repeated.decisionCount,s.history.length);
 assert(repeated.people.every(person=>contacts.some(c=>c.id===person.id)),
   "No undiscovered witness may appear in the final recap");
 assert(repeated.people.every(person=>person.status===s.witnesses[person.id]),
   "Witness status must reflect the actual committed terminal state");
 assert(!("reward" in repeated)&&!("archived" in repeated),
   "Pure recap cannot claim an achievement or durable archive write");
 tested++;
}
assert.equal(tested,35);
// Synthetic result state for an earned-only privacy boundary: a never-met
// witness must not appear merely because its internal status is present.
const sample=createEngine({graph,contract,hero:"jack",attemptId:"recap-visibility"}).view();
const fakeView={...sample,scene:{id:"Z03"},facts:{
  provedHaleMurder:true,provedFactoryCoverup:false
},state:{...sample.state,finished:true,ending:"trainScapegoat"}};
const visible=build(fakeView,contract,[{id:"tommy",name:"Томми Кросс"}]);
assert.deepEqual(visible.proofIds,["provedHaleMurder"]);
assert.deepEqual(visible.people.map(person=>person.id),["tommy"],
 "Unencountered Ada and Mercer must stay off the finale report");
assert.equal(visible.proofCount,1);
assert.throws(()=>build({state:{finished:true,ending:"fake"},scene:{id:"Z02"}},
 contract,[]),/Unknown/);
console.log("PASS Case002 ending recap: 35 verified hero × finale paths, truthful statuses, no spoilers or reward claims.");
