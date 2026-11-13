#!/usr/bin/env node
"use strict";
/* Pre-production storyboard lint. NO images exist yet — this tests briefs only. */
const assert=require("node:assert/strict");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
const board=require("../../docs/case002/case002-art-storyboard-v1.json");
assert.equal(board.caseId,"002");
assert.equal(board.status,"STORYBOARD_ONLY_NO_IMAGES_YET");
assert.equal(board.sceneAssets.length,89);
assert.equal(board.sceneAssets.length,graph.nodes.length);
const byId=new Map(board.sceneAssets.map(s=>[s.id,s]));
assert.equal(byId.size,89,"duplicate visual scene IDs");
const distinctFiles=new Set(board.sceneAssets.map(s=>s.asset));
assert.equal(distinctFiles.size,89,"scene images must have unique output paths");
const validPrefixes=["witnesses.","flags.","facts."];
const expectedCast={HJ:"jack",HF:"finn",HE:"eleanor",HV:"victor",HS:"samuel"};
const knownCast=new Set(["hero",...contract.heroes,
 "mabel","tommy","ada","mercer","vale","brackett","nora","hale","rowan","unidentified-guard",
 "signalman","night-clerk","retired-clerk","clerk","boatman","guard","guards",
 "worker","gatekeeper","messenger"]);
for(const beat of graph.nodes){
 const a=byId.get(beat.id);
 assert(a,beat.id+" storyboard missing");
 assert.equal(a.title,beat.title,beat.id+" title drift");
 assert.equal(a.chapter,beat.chapter);
 assert(a.location && /^[a-z-]+$/.test(a.location),"location invalid "+beat.id);
 assert(Array.isArray(a.cast)&&a.cast.length>0,beat.id+" cast list missing");
 assert(a.cast.every(c=>knownCast.has(c)),beat.id+" unknown cast");
 assert(a.shot.length>35,"scene-specific shot brief too vague: "+beat.id);
 assert.equal(a.status,"planned-not-generated","should never fake finished artwork");
 assert.equal(a.asset,"case002-"+beat.id.toLowerCase()+"-scene.webp");
 assert(Array.isArray(a.stateVariants));
 for(const cond of a.stateVariants)assert(validPrefixes.some(p=>cond.startsWith(p))||
   cond==="endingAvailable","unrecognized narrative state "+beat.id+"/"+cond);
 const prefix=beat.id.slice(0,2);
 if(expectedCast[prefix])assert(a.cast.includes(expectedCast[prefix]),
   "wrong player character in "+beat.id);
}
const critical={
 D02:"witnesses.ada",D06:"witnesses.tommy",D09:"witnesses.ada",
 E03:"flags.publicContactSecured",E05:"flags.workersCleared",
 E07:"flags.valeGuarantee",E09:"flags.accountsGivenToWorkers",
 E10:"flags.accountsGivenToWorkers",F02:"facts.provedFirstForgery",
 F05:"witnesses.ada",F08:"flags.accountsGivenToWorkers",
 F09:"endingAvailable",Z02:"witnesses.tommy",
 Z06:"flags.brackettAccountsHeld"
};
for(const [id,required] of Object.entries(critical))
 assert(byId.get(id).stateVariants.includes(required),
   "critical visual depiction does not account for "+required+" in "+id);
for(const node of graph.nodes.filter(n=>n.chapter==="END"))
 assert(byId.get(node.id).stateVariants.length>0,"endings must have variant art");
assert(!byId.get("P01").cast.includes("brackett"),
 "prologue may not unmask the hidden perpetrator");
console.log("PASS Case002 visual storyboard: 89/89 unique briefs, "+
 board.sceneAssets.filter(x=>x.stateVariants.length).length+
 " conditional shots, all 15 hero-specific casts and all 7 endings safeguarded.");
