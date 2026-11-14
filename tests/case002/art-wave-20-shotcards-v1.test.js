#!/usr/bin/env node
"use strict";
/* Chapter VI: independent candidate must not silently become game approval. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const builder=require("../../docs/case002/art-wave-prompt-builder-v1.js");
const {dimensions}=require("../../tools/case002/art-audit-v1.js");
const board=require("../../docs/case002/case002-art-storyboard-v1.json");
const {manifest,resolveScene}=require("../../src/case002/approved-art-v1.js");
const root=path.resolve(__dirname,"../..");
const spec=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-20-chapter-vi-shotcards-v1.json"),"utf8"));
const batch=builder.validateBatch(spec);
assert.equal(spec.schemaVersion,2);
assert.equal(spec.chapter,"VI");
const chapter=board.sceneAssets.filter(x=>x.chapter==="VI");
assert.equal(chapter.length,9);
assert.equal(chapter[0].id,"F01");
assert.deepEqual(batch.map(x=>x.id),chapter.slice(0,batch.length).map(x=>x.id));
const metadata=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-20-chapter-vi-candidates-v1.json"),"utf8"));
assert.equal(metadata.chapter,"VI");
assert.equal(metadata.candidates.length,batch.length);
for(const [idx,card] of batch.entries()){
 const m=metadata.candidates[idx];
 assert.equal(m.sceneId,card.id);
 assert.equal(m.status,"staged-candidate-not-installed");
 assert.equal(m.renderCountInArtworkTurn,1);
 assert.equal(m.acceptedRendering,1);
 assert.equal(m.variantKey,"default");
 assert.equal(m.candidateFile,"case002-"+card.id.toLowerCase()+"-scene--mobile.webp");
 assert.equal(card.sceneKind,"evidence");
 const p=builder.promptFor(card),r=builder.reviewFor(card);
 assert(p.includes(card.focus)&&p.includes(card.location)&&p.includes(card.camera));
 assert(!p.includes(card.id)&&!p.includes(card.knowledgeBoundary));
 for(const avoid of card.avoid)assert(!p.includes(avoid));
 assert.equal(r.automationDoesNotApprove,true);
 assert.equal(r.requiresHumanArtReview,true);
 const f=path.join(root,"assets/case002/candidates",m.candidateFile);
 const bytes=fs.readFileSync(f);
 assert.equal(bytes.subarray(0,4).toString("ascii"),"RIFF");
 assert.equal(bytes.subarray(8,12).toString("ascii"),"WEBP");
 assert.equal(bytes.readUInt32LE(4)+8,bytes.length);
 assert.deepEqual([dimensions(bytes).width,dimensions(bytes).height],[720,900]);
 assert.equal(bytes.length,m.bytes);
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),m.sha256);
 assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bytes.length),Buffer.from([0]),bytes])).digest("hex"),m.gitBlobSha1);
 assert.equal(manifest.sceneImages.filter(x=>x.sceneId===card.id).length,0,
   "A chapter VI candidate cannot be prematurely installed");
 assert.equal(resolveScene({sceneId:card.id,variantKey:"default",visibleCast:["hero"],desiredAsset:"case002-"+card.id.toLowerCase()+"-scene.webp"}),null);
 assert.equal(card.required.length,3);
 assert(card.knowledgeBoundary.includes("Only one wagon"));
}
console.log("PASS: Chapter VI opening F01 reviewed as one physically verified candidate (uninstalled).");
