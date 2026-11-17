#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const {validateWave}=require("../../tools/case002/validate-art-wave-v1.js");
const wave=require("../../docs/case002/art-wave-01-v1.json");
const board=require("../../docs/case002/case002-art-storyboard-v1.json");
const cast=require("../../src/case002/cast-registry-v1.js");
const {manifest}=require("../../src/case002/approved-art-v1.js");
const clone=()=>JSON.parse(JSON.stringify(wave));
const check=p=>validateWave(p,board,cast,manifest);
const report=check(clone());
assert.equal(report.plannedScenes,16);
assert.equal(report.approvedScenes,manifest.sceneImages.filter(e=>
  wave.shots.some(s=>s.id===e.sceneId)&&e.review==="approved").length);
assert(report.approvedScenes>=1,"Opening P01 must have a real registered shot");
assert.equal(report.plannedPortraits,5);
assert.equal(report.approvedPortraits,manifest.npcPortraits.filter(e=>
  wave.portraitIds.includes(e.id)&&e.review==="approved").length);
assert.deepEqual(report.scenes.map(x=>x.id),
 ["P01","P02",..."A01 A02 A03 A04 A05 A06 A07 A08 A09 A10".split(" "),
 "B01","B02","B03","B04"]);
assert.equal(report.scenes.find(x=>x.id==="P01").file,"case002-p01-scene.webp");
assert.equal(report.portraits.find(x=>x.id==="mabel").name,"Мэйбл Кросс");
const fails=(edit,pattern)=>{
 const p=clone();
 edit(p);
 assert.throws(()=>check(p),pattern);
};
fails(p=>p.status="ALL_IMAGES_READY",/queue is not a proof/i);
fails(p=>p.shots.push(p.shots[0]),/Duplicate art-wave scene/);
fails(p=>p.shots[0].id="X55",/out-of-scope/);
fails(p=>p.shots[0].id="A99",/Unscripted art-wave scene/);
fails(p=>p.shots[0].focus="d",/Missing scene-specific camera direction/);
fails(p=>p.shots[0].forbid=[],/Scene must declare/);
fails(p=>p.shots[0].forbid=p.shots[0].forbid.filter(x=>!x.includes("23:31")),
 /must not accidentally depict/);
fails(p=>p.shots.find(x=>x.id==="A05").forbid=["No gun","No logo"],
 /must declare real|not valid in 1920/);
fails(p=>p.portraitIds.push("mabel"),/Duplicate\/invalid NPC/);
fails(p=>p.portraitIds[0]="evelyn",/Unknown person/);
fails(p=>p.portraitIds.splice(1,2),/Mabel\/Tommy\/Ada/);
fails(p=>p.shots.splice(0,1),/Opening P01\/P02\/A01/);
const dishonest=JSON.parse(JSON.stringify(manifest));
dishonest.sceneImages.push({sceneId:"P01",variantKey:"default",review:"draft"});
assert.throws(()=>validateWave(clone(),board,cast,dishonest),/Unexpected\/unreviewed/);
const dishonestApproved=JSON.parse(JSON.stringify(manifest));
dishonestApproved.sceneImages.push({
 sceneId:"A02",variantKey:"default",review:"approved",
 file:"case002-a02-scene.webp",width:1600,height:900,cast:[]
});
assert.throws(()=>validateWave(clone(),board,cast,dishonestApproved),
 /Multiple approved images/);
console.log("PASS Case002 first art wave: 16 canonical scene shots, five original identity references, "+
 "14 malformed/spoiler-sensitive cases, no false approval claims.");
