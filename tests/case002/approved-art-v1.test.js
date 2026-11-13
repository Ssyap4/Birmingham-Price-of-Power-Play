#!/usr/bin/env node
"use strict";
/* Case 002 art approval gate: no placeholder generation can masquerade as
 * production art. Test all canonical states and malicious/stale entries.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract,storyboard}=require("../../src/case002/browser-data-v3.js");
const director=require("../../src/case002/scene-art-v1.js");
const {manifest,resolveScene,resolveNpc}=require("../../src/case002/approved-art-v1.js");
const cast=require("../../src/case002/cast-registry-v1.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
assert.equal(manifest.schemaVersion,1);
assert.deepEqual(manifest.sceneImages,[],"unreviewed scene images must not be registered");
assert.deepEqual(manifest.npcPortraits,[],"unreviewed NPC portraits must not be registered");
let states=0;
const check=view=>{
 const stage=director.select(storyboard,view);
 assert.equal(resolveScene(stage),null,"unapproved story art was exposed");
 for(const person of cast.discovered(view.state))
   assert.equal(resolveNpc(person),null,"unapproved NPC portrait exposed");
 states++;
};
for(const hero of contract.heroes)for(const ending of contract.endings){
 const e=createEngine({graph,contract,hero,attemptId:"art-gate-"+hero+ending.id});
 check(e.view());
 for(const [from,to,action] of goodRoute(hero,ending.id).actionLog){
   assert.equal(e.snapshot().node,from);
   e.choose(to,action);
   check(e.view());
 }
}
const sampleStage=director.select(storyboard,createEngine({
 graph,contract,hero:"jack",attemptId:"art-gate-fixture"}).view());
const file=sampleStage.desiredAsset;
const fake={schemaVersion:1,sceneImages:[{
 sceneId:"P01",variantKey:"default",review:"approved",file,
 cast:[],width:1600,height:900
}],npcPortraits:[]};
assert.equal(resolveScene(sampleStage,fake).src,
 "../../assets/case002/scenes/"+file);
assert.equal(resolveScene(sampleStage,{...fake,sceneImages:[]}),null);
assert.throws(()=>resolveScene(sampleStage,{...fake,sceneImages:[fake.sceneImages[0],
 fake.sceneImages[0]]}),/Duplicate/);
for(const wrong of ["../../other.webp","case002-a02-scene.webp","case002-p01-scene.png"])
 assert.throws(()=>resolveScene(sampleStage,{...fake,sceneImages:[{
 ...fake.sceneImages[0],file:wrong}]}),/conflicts/);
assert.throws(()=>resolveScene(sampleStage,{...fake,sceneImages:[{
 ...fake.sceneImages[0],cast:["mabel"]}]}),/conflicts/);
assert.throws(()=>resolveScene(sampleStage,{...fake,sceneImages:[{
 ...fake.sceneImages[0],width:0}]}),/conflicts/);
assert.equal(resolveScene({...sampleStage,variantKey:"workers-on-rails"},fake),null);
assert.equal(resolveScene({...sampleStage,sceneId:"D06"},fake),null);
const npc={id:"mabel",name:"Мэйбл Кросс"};
const pretend={schemaVersion:1,sceneImages:[],npcPortraits:[{
 id:"mabel",review:"approved",file:"case002-mabel-portrait.webp",width:800,height:1000
}]};
assert.equal(resolveNpc(npc,pretend).alt,"Портрет: Мэйбл Кросс");
assert.equal(resolveNpc(npc,manifest),null);
assert.throws(()=>resolveNpc(npc,{...pretend,npcPortraits:[{
 ...pretend.npcPortraits[0],file:"evelyn.webp"}]}),/canonical/);
assert.throws(()=>resolveNpc(npc,{...pretend,npcPortraits:[
 pretend.npcPortraits[0],pretend.npcPortraits[0]]}),/Duplicate/);
// On any future acceptance, CI must refuse a registered file without actual
// WebP bytes in the correct folder and expected header.
const base=path.resolve(__dirname,"../..");
for(const e of manifest.sceneImages){
 const expected=path.join(base,"assets/case002/scenes",e.file);
 assert(fs.existsSync(expected),"Approved scene asset missing: "+e.file);
 const bytes=fs.readFileSync(expected);
 assert(bytes.length>4000 && bytes.toString("ascii",0,4)==="RIFF" &&
   bytes.toString("ascii",8,12)==="WEBP","Invalid registered scene image");
}
for(const e of manifest.npcPortraits){
 const expected=path.join(base,"assets/case002/portraits",e.file);
 assert(fs.existsSync(expected),"Approved portrait missing: "+e.file);
 const bytes=fs.readFileSync(expected);
 assert(bytes.length>4000 && bytes.toString("ascii",0,4)==="RIFF" &&
   bytes.toString("ascii",8,12)==="WEBP","Invalid registered NPC portrait");
}
console.log("PASS Case002 approved-art gate: "+states+
 " state views; zero unapproved portraits or story images; strict id, cast, "+
 "variant and file checks for future real art.");
