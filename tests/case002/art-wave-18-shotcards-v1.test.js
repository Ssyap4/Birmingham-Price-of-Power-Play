#!/usr/bin/env node
"use strict";
/* Chapter IV art-preparation invariants; never claims an image is approved. */
const assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const builder = require("../../docs/case002/art-wave-prompt-builder-v1.js");
const {manifest} = require("../../src/case002/approved-art-v1.js");
const root = path.resolve(__dirname, "../..");
const cards = builder.validateBatch(JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-18-shotcards-v1.json"),"utf8")));
const storyboard = JSON.parse(fs.readFileSync(path.join(root,"docs/case002/case002-art-storyboard-v1.json"),"utf8"));
const storyboardIds = storyboard.sceneAssets.filter(x=>/^D\d{2}$/.test(x.id)).map(x=>x.id);
assert.deepEqual(cards.map(x=>x.id),storyboardIds,"Chapter IV storyboard/card sequence mismatch");
assert.equal(cards.length,11);
const stageArt = manifest.sceneImages.filter(x=>/^D\d{2}$/.test(x.sceneId)&&x.review==="approved");
const installedIds = new Set(stageArt.map(x=>x.sceneId));
assert.equal(new Set(stageArt.map(x=>x.sceneId+"|"+x.variantKey)).size,stageArt.length,"No duplicate Chapter IV scene-variant approvals");
assert([...installedIds].every(id=>storyboardIds.includes(id)),"Only original storyboard D scenes may be approved");
for (const c of cards){
 const render = builder.promptFor(c);
 const review = builder.reviewFor(c);
 assert(render.includes(c.focus));
 assert(!render.includes(c.knowledgeBoundary));
 assert(!render.includes(c.id));
 assert(!/\b(?:infographic|collage|poster|GitHub|workflow|approved|approval)\b/i.test(render));
 for(const prohibited of c.avoid)assert(!render.includes(prohibited));
 assert.equal(review.id,c.id);
 assert.equal(review.requiresHumanArtReview,true);
 assert.equal(review.automationDoesNotApprove,true);
 assert.deepEqual(review.essentialMarkers,c.required);
 assert.equal(review.knowledgeBoundary,c.knowledgeBoundary);
}
for (const id of ["ada","tommy","mercer","mabel"]){
 const found=manifest.npcPortraits.find(x=>x.id===id&&x.review==="approved");
 assert(found&&found.sha256.length===64,"Canonical cast portrait missing: "+id);
}
assert(cards.find(x=>x.id==="D06").knowledgeBoundary.includes("detained"),"D06 must allow no-rescue outcome");
assert(cards.find(x=>x.id==="D10").knowledgeBoundary.includes("game UI"),"D10 witness statuses must remain dynamic");
if (!installedIds.has("D01") && !installedIds.has("D02")){
 const candidates=[
 ["D01","dd5a2469746898d6564f02a862944ebb81347c81b5937e0c867bc3ae9bc97206"],
 ["D02","1f6378d43e65772f29abd841ec3bf840a3b0478d9b106259e460abee7ffeaa32"]
 ];
 for (const [id,hash] of candidates){
  const file=path.join(root,"assets/case002/candidates/case002-"+id.toLowerCase()+"-scene--mobile.webp");
  assert(fs.existsSync(file),"Staged candidate missing: "+id);
  const bytes=fs.readFileSync(file);
  assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),hash,"Candidate bytes changed without review");
  assert.equal(bytes.subarray(0,4).toString("ascii"),"RIFF");
  assert.equal(bytes.subarray(8,12).toString("ascii"),"WEBP");
 }
}
const heroes = builder.validateBatch(JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-18-hero-shotcards-v1.json"),"utf8")));
const heroStory = storyboard.sceneAssets.filter(x=>x.chapter==="IV"&&/^H[A-Z]\d{2}$/.test(x.id));
assert.deepEqual(heroes.map(x=>x.id),heroStory.map(x=>x.id),"Hero-specific Chapter IV art is part of complete chapter");
assert.equal(heroes.length,4);
for (const c of heroes){
 const render=builder.promptFor(c),review=builder.reviewFor(c);
 assert(render.includes(c.focus));
 assert(!render.includes(c.knowledgeBoundary));
 assert(!render.includes(c.id));
 assert(!/\\b(?:infographic|collage|poster|GitHub|workflow|approved|approval)\\b/i.test(render));
 for(const forbidden of c.avoid)assert(!render.includes(forbidden));
 assert.equal(review.automationDoesNotApprove,true);
}
const allIds=new Set([...storyboardIds,...heroStory.map(x=>x.id)]);
const installed=manifest.sceneImages.filter(x=>allIds.has(x.sceneId)&&x.review==="approved");
assert(installed.every(x=>allIds.has(x.sceneId)));
console.log("PASS: Chapter IV 11 core + 4 hero shots isolated, staged candidates and canonical NPCs");
