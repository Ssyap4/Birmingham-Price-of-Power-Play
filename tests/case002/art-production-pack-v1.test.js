#!/usr/bin/env node
"use strict";
// One input wave -> 16 distinct scene briefs + 5 canonical portraits.
// This test does NOT equate textual briefs to generated or approved image files.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {build}=require("../../tools/case002/build-art-production-pack-v1.js");
const wave=require("../../docs/case002/art-wave-01-v1.json");
const board=require("../../docs/case002/case002-art-storyboard-v1.json");
const registry=require("../../src/case002/cast-registry-v1.js");
const {manifest}=require("../../src/case002/approved-art-v1.js");
const result=build();
const artifactPath=path.resolve(__dirname,"../../docs/case002/art-production-pack-01-v1.json");
const bytes=fs.readFileSync(artifactPath,"utf8");
assert.equal(bytes,JSON.stringify(result,null,2)+"\n","Generated production pack differs from canonical sources");
assert.equal(result.status,"BRIEFS_ONLY_NOT_GENERATED_NOT_APPROVED");
assert.equal(result.sceneCount,16);
assert.equal(result.portraitCount,5);
assert.deepEqual(result.shots.map(x=>x.sceneId),wave.shots.map(x=>x.id));
assert.deepEqual(result.portraits.map(x=>x.id),wave.portraitIds);
const canonical=new Map(board.sceneAssets.map(x=>[x.id,x]));
for(const shot of result.shots){
 const original=canonical.get(shot.sceneId);
 assert(original);
 assert.equal(shot.title,original.title);
 assert.equal(shot.location,original.location);
 assert.equal(shot.filename,original.asset);
 assert.equal(shot.mobileFilename,original.asset.replace(/\.webp$/,"--mobile.webp"));
 assert(shot.mobileFilename!==shot.filename);
 assert.deepEqual(shot.cast,original.cast);
 assert.equal(shot.canonicalStoryboardShot,original.shot);
 assert.equal(shot.output.mobile,"9:16");
 assert.equal(shot.output.landscape,"16:9");
 assert.equal(shot.output.format,"WebP");
 assert(shot.directorFocus.length>=30);
 assert(shot.forbidden.length>=2);
 assert(shot.constraints.some(x=>x.includes("360px phone")));
 for(const npc of shot.characterReferences){
   const c=registry.character(npc.id);
   assert(c&&c.name===npc.name&&c.appearance===npc.appearance,
     "Scene character reference drifts from canonical cast: "+shot.sceneId+"/"+npc.id);
   assert(shot.cast.includes(npc.id));
 }
}
for(const person of result.portraits){
 const c=registry.character(person.id);
 assert(c);
 for(const key of ["name","role","appearance"])
   assert.equal(person[key],c[key],"Portrait differs from the canonical cast");
 assert.equal(person.filename,"case002-"+person.id+"-portrait.webp");
 assert.equal(person.output.aspect,"4:5");
 assert(person.constraints.some(x=>x.includes("same face")));
}
const p01=result.shots.find(x=>x.sceneId==="P01");
assert(p01.forbidden.some(x=>x.includes("23:31")));
assert(!p01.characterReferences.some(x=>x.id==="brackett"));
const b03=result.shots.find(x=>x.sceneId==="B03");
assert(b03.forbidden.some(x=>x.includes("Брэкетту")));
assert.equal(manifest.sceneImages.length,0,
 "Production briefs cannot secretly register unreviewed artwork");
assert.equal(manifest.npcPortraits.length,0,
 "Production briefs cannot secretly register unreviewed portraits");
console.log("PASS Case002 mobile art production: 16 canonical unique scene briefs, 5 identity sheets, no premature asset approval.");
