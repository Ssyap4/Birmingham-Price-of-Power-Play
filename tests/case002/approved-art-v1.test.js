#!/usr/bin/env node
"use strict";
/* Case 002 art approval gate: no placeholder generation can masquerade as
 * production art. Test all canonical states and malicious/stale entries.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {createHash}=require("node:crypto");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract,storyboard}=require("../../src/case002/browser-data-v3.js");
const director=require("../../src/case002/scene-art-v1.js");
const {manifest,resolveScene,resolveNpc}=require("../../src/case002/approved-art-v1.js");
const cast=require("../../src/case002/cast-registry-v1.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
assert.equal(manifest.schemaVersion,1);
assert(Array.isArray(manifest.sceneImages),"scene approval list required");
assert(Array.isArray(manifest.npcPortraits),"NPC approval list required");
let states=0,verifiedSceneViews=0,verifiedPortraitViews=0;
const visibleKeys=new Set();
const check=view=>{
 const stage=director.select(storyboard,view);
 visibleKeys.add(stage.sceneId+":"+stage.variantKey);
 // Only explicitly approved art may be exposed. An absent file remains null.
 const actual=resolveScene(stage);
 const matching=manifest.sceneImages.filter(e=>e.sceneId===stage.sceneId&&
   e.variantKey===stage.variantKey);
 if(matching.length){
   assert.equal(matching.length,1,"duplicate art registration");
   assert.equal(matching[0].review,"approved","unreviewed scene exposed");
   assert(actual && actual.src.endsWith("/"+matching[0].file),
     "registered art does not match the actual game state");
   verifiedSceneViews++;
 }else assert.equal(actual,null,"unregistered scene image was exposed");
 for(const person of cast.discovered(view.state)){
   const portrait=resolveNpc(person);
   const registered=manifest.npcPortraits.filter(e=>e.id===person.id);
   if(registered.length){
     assert.equal(registered.length,1,"duplicate NPC approval");
     assert.equal(registered[0].review,"approved","unreviewed portrait exposed");
     assert(portrait && portrait.src.endsWith("/"+registered[0].file));
     verifiedPortraitViews++;
   }else assert.equal(portrait,null,"unregistered NPC portrait exposed");
 }
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
// Golden routes do not visit every optional node (A04 is one such example).
// Validate the art gate against ALL 89 storyboard nodes as well, without
// changing the engine or requiring 400 complete campaign permutations.
for(const node of graph.nodes){
 const e=createEngine({graph,contract,hero:node.hero||"jack",
   attemptId:"art-gate-node-"+node.id});
 check({...e.view(),scene:node});
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
assert.equal(resolveScene(sampleStage,fake).mobileSrc,null,
 "A non-existent mobile crop must never be guessed");
const mobileFile="case002-p01-scene--mobile.webp";
const mobileFixture={...fake,sceneImages:[{...fake.sceneImages[0],
 mobileFile,mobileWidth:900,mobileHeight:1200}]};
assert.equal(resolveScene(sampleStage,mobileFixture).mobileSrc,
 "../../assets/case002/scenes/"+mobileFile);
// The physical file of a mobile-only scene is the approved vertical WebP.
const {width:_w,height:_h,...portraitEntry}=mobileFixture.sceneImages[0];
const portraitOnly={...fake,sceneImages:[{...portraitEntry,mobileOnly:true}]};
assert.equal(resolveScene(sampleStage,portraitOnly).src,
 "../../assets/case002/scenes/"+mobileFile);
assert.equal(resolveScene(sampleStage,portraitOnly).mobileOnly,true);
assert.throws(()=>resolveScene(sampleStage,{
 ...fake,sceneImages:[{...portraitEntry,mobileOnly:true,mobileFile:undefined}]
}),/conflicts/);
assert.throws(()=>resolveScene(sampleStage,{
 ...fake,sceneImages:[{...portraitEntry,mobileOnly:true,width:1200}]
}),/conflicts/);
assert.throws(()=>resolveScene(sampleStage,{...fake,sceneImages:[{
 ...mobileFixture.sceneImages[0],mobileFile:"case002-a01-scene--mobile.webp"}]}),
 /mobile crop conflicts/);
assert.throws(()=>resolveScene(sampleStage,{...fake,sceneImages:[{
 ...mobileFixture.sceneImages[0],mobileWidth:120}]}),
 /mobile crop conflicts/);
assert.throws(()=>resolveScene(sampleStage,{...fake,sceneImages:[{
 ...mobileFixture.sceneImages[0],mobileHeight:400}]}),
 /mobile crop conflicts/);

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
assert.equal(resolveNpc(npc,manifest).src,"../../assets/case002/portraits/case002-mabel-portrait.webp");
for(const id of ["tommy","ada","mercer","vale","brackett"]){
 const p=cast.character(id);
 assert(p&&resolveNpc(p,manifest).src.endsWith("/case002-"+id+"-portrait.webp"),"Missing reviewed portrait for "+id);
}
assert.throws(()=>resolveNpc(npc,{...pretend,npcPortraits:[{
 ...pretend.npcPortraits[0],file:"evelyn.webp"}]}),/canonical/);
assert.throws(()=>resolveNpc(npc,{...pretend,npcPortraits:[
 pretend.npcPortraits[0],pretend.npcPortraits[0]]}),/Duplicate/);
// On any future acceptance, CI must refuse a registered file without actual
// WebP bytes in the correct folder and expected header.
const base=path.resolve(__dirname,"../..");
const digest=bytes=>createHash("sha256").update(bytes).digest("hex");
const approvedFingerprints=new Map();
const evelynFingerprint=digest(fs.readFileSync(
 path.join(base,"assets/case-scenes/evelyn.webp")));
for(const e of manifest.sceneImages){
 assert(visibleKeys.has(e.sceneId+":"+e.variantKey),
   "Registered art has no verified reachable scene state: "+e.sceneId+
   ":"+e.variantKey);
 assert.equal(e.review,"approved","Only reviewed scene files may be registered");
 const expected=path.join(base,"assets/case002/scenes",e.file);
 let bytes=null;
 if(e.mobileOnly){
   assert(!fs.existsSync(expected),"Mobile-only scene should not have desktop file");
   assert(e.mobileFile,"Mobile-only scene must have a real portrait");
 }else{
   assert(fs.existsSync(expected),"Approved scene asset missing: "+e.file);
   bytes=fs.readFileSync(expected);
   assert(bytes.length>4000 && bytes.toString("ascii",0,4)==="RIFF" &&
     bytes.toString("ascii",8,12)==="WEBP","Invalid registered scene image");
   if(e.sha256)assert.equal(digest(bytes),e.sha256,
     "Scene bytes changed after art review");
 }
 if(e.mobileFile!==undefined){
   const expectedMobile=e.file.replace(/\.webp$/,"--mobile.webp");
   assert.equal(e.mobileFile,expectedMobile,
     "Approved mobile crop must belong to the exact same scene/variant");
   assert(Number.isInteger(e.mobileWidth)&&e.mobileWidth>=500 &&
     Number.isInteger(e.mobileHeight)&&e.mobileHeight>=700,
     "Portrait crop dimensions are required");
   const mobilePath=path.join(base,"assets/case002/scenes",e.mobileFile);
   assert(fs.existsSync(mobilePath),"Approved mobile WebP missing: "+e.mobileFile);
   const mobileBytes=fs.readFileSync(mobilePath);
   assert(mobileBytes.length>4000 &&
     mobileBytes.toString("ascii",0,4)==="RIFF" &&
     mobileBytes.toString("ascii",8,12)==="WEBP",
     "Approved mobile crop is not a valid WebP: "+e.mobileFile);
   if(e.mobileSha256)assert.equal(digest(mobileBytes),e.mobileSha256,
     "Mobile image bytes changed after art review");
   if(!e.mobileOnly)assert.notEqual(digest(bytes),digest(mobileBytes),
     "Mobile crop must be a separate export, not a relabelled desktop image");
 }
}
for(const e of manifest.npcPortraits){
 assert.equal(e.review,"approved","Only reviewed portraits may be registered");
 assert(cast.character(e.id),"Unknown registered NPC identity: "+e.id);
 const expected=path.join(base,"assets/case002/portraits",e.file);
 assert(fs.existsSync(expected),"Approved portrait missing: "+e.file);
 const bytes=fs.readFileSync(expected);
 assert(bytes.length>4000 && bytes.toString("ascii",0,4)==="RIFF" &&
   bytes.toString("ascii",8,12)==="WEBP","Invalid registered NPC portrait");
 const fingerprint=digest(bytes);
 assert.notEqual(fingerprint,evelynFingerprint,
   "New Case002 NPC cannot reuse Case001 Evelyn portrait");
 assert(!approvedFingerprints.has(fingerprint),
   "Two NPCs share identical image bytes: "+approvedFingerprints.get(fingerprint)+" and "+e.id);
 approvedFingerprints.set(fingerprint,e.id);
}
console.log("PASS Case002 approved-art gate: "+states+
 " state views; "+manifest.sceneImages.length+" approved scenes / "+
 manifest.npcPortraits.length+" approved portraits; "+
 verifiedSceneViews+" scene and "+verifiedPortraitViews+
 " portrait display checks; strict id, cast, variant and real-file checks.");
