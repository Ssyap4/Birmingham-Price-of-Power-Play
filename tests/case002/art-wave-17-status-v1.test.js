#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.join(__dirname,"../..");
const o=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-17-status-v1.json"),"utf8"));
const {manifest}=require("../../src/case002/approved-art-v1.js");
assert.equal(o.waveId,17);
assert.deepEqual(o.items.map(x=>x.id),["C06","C07","C08","C09","C10"]);
for(const v of o.items){
 assert.equal(v.state,"approved");
 assert.equal(v.installed,true);
 const expected="assets/case002/scenes/case002-"+v.id.toLowerCase()+"-scene--mobile.webp";
 assert.equal(v.installedAsset,expected);
 const registered=manifest.sceneImages.filter(x=>x.sceneId===v.id&&x.variantKey==="default");
 assert.equal(registered.length,1);
 assert.equal(registered[0].review,"approved");
 assert.equal(registered[0].mobileOnly,true);
 assert.equal(registered[0].mobileFile,path.basename(expected));
 assert.equal(registered[0].mobileSha256,v.installedSha256);
 const image=fs.readFileSync(path.join(root,expected));
 assert.equal(image.length,v.installedBytes);
 assert.equal(image.toString("ascii",0,4),"RIFF");
 assert.equal(image.toString("ascii",8,12),"WEBP");
 assert.equal(crypto.createHash("sha256").update(image).digest("hex"),v.installedSha256);
}
const c09=o.items.find(x=>x.id==="C09");
assert(c09.manualReview&&Object.values(c09.manualReview).every(Boolean));
assert.equal(c09.installedSha256,"6d43714b19d674780b528f84495e1de56e05aa45817ea3eff38a4a0c4e5dbbf8");
console.log("PASS wave17 five approved game files: exact SHA-256 and one manifest entry each");
