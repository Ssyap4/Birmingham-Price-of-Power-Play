#!/usr/bin/env node
"use strict";
/* Chapter V production cards and SHA-locked candidate images; not game approvals. */
const assert=require("node:assert/strict");
const fs=require("node:fs"), path=require("node:path"), crypto=require("node:crypto");
const builder=require("../../docs/case002/art-wave-prompt-builder-v1.js");
const {dimensions}=require("../../tools/case002/art-audit-v1.js");
const board=require("../../docs/case002/case002-art-storyboard-v1.json");
const {manifest}=require("../../src/case002/approved-art-v1.js");
const root=path.resolve(__dirname,"../..");
const cards=builder.validateBatch(JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-19-chapter-v-shotcards-v1.json"),"utf8")));
const chapter=board.sceneAssets.filter(x=>x.chapter==="V");
assert.equal(chapter.length,15,"Chapter V must preserve the exact 15-scene storyboard");
assert(cards.length>=1&&cards.length<=chapter.length);
assert.deepEqual(cards.map(c=>c.id),chapter.slice(0,cards.length).map(c=>c.id),
 "Each new shotcard must follow original Chapter V story order");
for(const c of cards){
 const p=builder.promptFor(c),r=builder.reviewFor(c);
 assert(p.includes(c.focus)&&p.includes(c.location)&&p.includes(c.camera));
 assert(!p.includes(c.knowledgeBoundary)&&!p.includes(c.id));
 for(const v of c.avoid)assert(!p.includes(v));
 assert.equal(r.automationDoesNotApprove,true);
 assert.equal(r.requiresHumanArtReview,true);
}
const staged=[["E01","d51e1cc93da287449afdc05ef3d24831cf43bd01f223136a13f294854ac39820"],["E02","bf70a47b8de22da12e67d1a7a9a8cff3011f3a83db0d80df2e6a16e4aeeeca96"],["E03","2f38e6f629766003d082ed99f788a9acd65ffb2c5a834d0102718c2d99b576a6"],["E04","96201947a7cf6ac64d0f3eaf25c9c9b33420d3a961c8f14289970797397bd1a1"],["E05","2754e12b356908d5ccd8f8bca519ddc0d99dcd766675fa8f05448e399b2c093b"],["E06","6c5002a1c6cc5ae44ba02c3ab0eb2dcadc8582aecfa72e7ef99c63e7c9c6374a"]];
for(const [id,sha] of staged){
 assert(cards.some(c=>c.id===id),"Candidate missing shotcard: "+id);
 const f=path.join(root,"assets/case002/candidates/case002-"+id.toLowerCase()+"-scene--mobile.webp");
 assert(fs.existsSync(f),"Candidate image missing: "+id);
 const bytes=fs.readFileSync(f);
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),sha);
 assert.deepEqual([dimensions(bytes).width,dimensions(bytes).height],[720,900]);
 // The candidate stays in the archive after a later separately reviewed batch install.
 const installed=manifest.sceneImages.filter(x=>x.sceneId===id&&x.review==="approved");
 assert(installed.length<=1,"Duplicate Chapter V installed scene: "+id);
 if(installed.length)assert.equal(installed[0].mobileSha256,sha,
   "Installed asset must remain byte-identical to reviewed candidate: "+id);
}
console.log("PASS: chapter V isolated cards and SHA-locked candidates: "+staged.map(x=>x[0]).join(", "));
