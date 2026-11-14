#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.join(__dirname,"../..");
const o=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-17-status-v1.json"),"utf8"));
const approved=require("../../src/case002/approved-art-v1.js");
const registered=new Set((approved.sceneImages||approved.manifest?.sceneImages||[]).map(x=>x.sceneId));
assert.equal(o.schemaVersion,1);
assert.equal(o.waveId,17);
assert.deepEqual(o.items.map(x=>x.id),["C06","C07","C08","C09","C10"]);
for(const scene of o.items){
 assert(["rejected","candidate","approved"].includes(scene.state));
 assert.equal(typeof scene.reason,"string");
 if(scene.state!=="approved")assert(!registered.has(scene.id),scene.id+" illegally registered");
 if(scene.state==="candidate"){
  const target=path.resolve(root,scene.candidateAsset);
  assert(target.startsWith(path.join(root,"assets/case002/candidates")+path.sep));
  assert(fs.existsSync(target),scene.id+" missing candidate");
  const bytes=fs.readFileSync(target);
  assert.equal(bytes.length,scene.candidateBytes);
  assert.equal(bytes.toString("ascii",0,4),"RIFF");
  assert.equal(bytes.toString("ascii",8,12),"WEBP");
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),scene.candidateSha256);
 }
}
assert.equal(o.items.filter(x=>x.state==="rejected").length,1);
assert.equal(o.items.find(x=>x.id==="C07").canonPortraitSha256.length,64);
assert.equal(o.items.filter(x=>x.state==="candidate").length,4);
console.log("PASS Case002 wave 17: no rejected scene registered in game manifest");
