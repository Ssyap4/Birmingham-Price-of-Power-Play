#!/usr/bin/env node
"use strict";
/* State-aware visuals: verify no art depicts impossible rescues or ownership.
 * Only outputs planned filenames; no generated files are asserted to exist.
 */
const assert=require("node:assert/strict");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
const board=require("../../docs/case002/case002-art-storyboard-v1.json");
const director=require("../../src/case002/scene-art-v1.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
const make=(hero="jack")=>createEngine({graph,contract,hero,attemptId:"art-qa"});
let states=0;const variants=new Set(),scenes=new Set();
const verify=v=>{
 const out=director.select(board,v),s=v.state;
 assert.equal(out.sceneId,v.scene.id);
 assert.equal(out.assetVerified,false,"no images have been created");
 assert(out.desiredAsset.startsWith("case002-"+v.scene.id.toLowerCase()+"-scene"));
 assert(out.desiredAsset.endsWith(".webp"));
 assert(out.visibleCast.every(x=>typeof x==="string"));
 if(["D02","D03","HE02"].includes(v.scene.id)&&s.witnesses.ada==="detained")
   assert(!out.visibleCast.includes("ada"),"Ada appeared free after capture");
 if(v.scene.id==="D06"&&s.witnesses.tommy==="detained")
   assert(!out.visibleCast.includes("tommy"),"detained Tommy illegally reunited");
 if(v.scene.id==="Z02"){
   const passengerIds=["ada","tommy","mercer"];
   for(const id of passengerIds)
     assert.equal(out.visibleCast.includes(id),s.witnesses[id]==="evacuated",
       "evacuation art invents or omits a passenger");
 }
 if(v.scene.id==="E07"&&!s.flags.valeGuarantee)
   assert.equal(out.variantKey,"unsigned","prematurely signed guarantee");
 if(v.scene.id==="E05"&&!s.flags.workersCleared)
   assert.equal(out.variantKey,"workers-on-rails","workers removed before evacuation");
 if(v.scene.id==="E09"&&s.flags.accountsGivenToWorkers)
   assert.equal(out.variantKey,"accounts-workers");
 if(v.scene.id==="Z07")assert(!out.visibleCast.includes("hero"),"dead protagonist depicted alive");
 if(v.scene.id==="F05"||v.scene.id==="F09")
   assert(out.requiresDynamicOverlay,"status flags must stay in HTML");
 variants.add(v.scene.id+"/"+out.variantKey);scenes.add(v.scene.id);states++;
};
for(const hero of contract.heroes)for(const ending of contract.endings){
 const e=make(hero);verify(e.view());
 for(const [from,to,action] of goodRoute(hero,ending.id).actionLog){
   assert.equal(e.snapshot().node,from);
   e.choose(to,action);
   verify(e.view());
 }
}
assert(scenes.size>=65);
for(const node of graph.nodes){
 const e=make(node.hero||"jack"),v=e.view();
 verify({...v,scene:node});
}
const example=make().view();
const fake=(id,witnesses={},flags={},facts={})=>director.select(board,{
 ...example,scene:{...example.scene,id},
 state:{...example.state,witnesses:{...example.state.witnesses,...witnesses},
   flags:{...example.state.flags,...flags}},
 facts:{...example.facts,...facts}
});
assert(!fake("D06",{tommy:"detained"}).visibleCast.includes("tommy"));
assert(fake("D06",{tommy:"protected"}).visibleCast.includes("tommy"));
assert(!fake("D02",{ada:"detained"}).visibleCast.includes("ada"));
assert.equal(fake("Z02",{}).variantKey,"evacuated-none");
assert.equal(fake("Z02",{ada:"evacuated",mercer:"evacuated"}).variantKey,"evacuated-ada-mercer");
assert.deepEqual(fake("Z02",{ada:"evacuated",mercer:"evacuated"}).visibleCast,
 ["hero","ada","mercer"]);
assert.equal(fake("E09",{}, {accountsGivenToWorkers:true,brackettAccountsHeld:false}).variantKey,
 "accounts-workers");
assert.equal(fake("F09").requiresDynamicOverlay,true);
assert.equal(fake("E03",{}, {publicContactSecured:false}).variantKey,"still-unverified");
assert.equal(fake("E03",{}, {publicContactSecured:true}).variantKey,"verified-not-published");
console.log("PASS Case002 planned illustrations: "+states+
 " inspected states; "+scenes.size+" scene IDs, "+variants.size+
 " specific art variants, no impossible living witnesses or invented assets.");
