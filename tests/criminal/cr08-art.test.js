"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),crypto=require("node:crypto");
const manifest=require("../../src/criminal/art-manifest"),candidate=require("../../docs/criminal-operations/CR08-ART-CANDIDATES.json");
const contract=require("../../deployment/criminal-art-contract"),C=require("../../src/criminal/content");
const scripts=[...fs.readFileSync("index.html","utf8").matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
test("CR08 accepted bytes exactly equal candidate and cover every moment",()=>{
 assert.ok(contract(manifest,scripts).includes("CR08"));
 const frames=manifest.frames.filter(f=>f.missionId==="CR08");assert.equal(frames.length,24);
 let total=0;
 for(const f of frames){const c=candidate.frames.find(x=>x.sceneId===f.scenes[0]),b=fs.readFileSync(f.path);
 assert.ok(c);assert.deepEqual(b,fs.readFileSync(c.path));assert.equal(f.sha256,c.sha256);assert.equal(f.sourceSha256,c.sourceSha256);
 assert.equal(crypto.createHash("sha256").update(b).digest("hex"),f.sha256);assert.equal(f.scenes.length,1);assert.equal(f.scenes[0],c.sceneId);assert.ok(b.length<=262144);total+=b.length;}
 assert.equal(total,3226876);assert.ok(total<=3932160);
 assert.equal(Object.keys(C.missions.CR08.scenes).length,20);
 for(const f of ["index.html","preview/criminal/index.html"])assert.equal(fs.readFileSync(f,"utf8").split('src="src/criminal/missions/cr08.js"').length-1,1);
 assert.equal(Object.keys(C.missions).length,10);
});
