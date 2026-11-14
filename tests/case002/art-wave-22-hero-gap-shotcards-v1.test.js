#!/usr/bin/env node
"use strict";
/* One accepted, archived HJ01 image; none of the seven missing hero
 * scene IDs is prematurely installed in the playable art manifest. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {dimensions}=require("../../tools/case002/art-audit-v1.js");
const builder=require("../../docs/case002/art-wave-prompt-builder-v1.js");
const storyboard=require("../../docs/case002/case002-art-storyboard-v1.json");
const {manifest,resolveScene}=require("../../src/case002/approved-art-v1.js");
const root=path.resolve(__dirname,"../..");
const spec=require("../../docs/case002/art-wave-22-hero-gap-shotcards-v1.json");
const metadata=require("../../docs/case002/art-wave-22-hero-gap-candidates-v1.json");
const cards=builder.validateBatch(spec);
assert.equal(spec.chapter,"HERO-GAPS");
assert.equal(cards.length,1);
assert.equal(metadata.candidates.length,1);
const card=cards[0],accepted=metadata.candidates[0];
assert.equal(card.id,"HJ01");
assert.equal(card.sceneKind,"dialogue");
assert.equal(card.intendedVariant,"default");
const target=storyboard.sceneAssets.find(x=>x.id===card.id);
assert(target&&target.chapter==="II");
assert.deepEqual(target.cast,["jack","guard"]);
assert.equal(target.asset,"case002-hj01-scene.webp");
const visual=builder.promptFor(card),review=builder.reviewFor(card);
assert(visual.includes(card.focus)&&visual.includes(card.camera));
assert(!visual.includes(card.knowledgeBoundary));
assert.equal(review.requiresHumanArtReview,true);
assert(card.required.some(x=>/railway watchman/.test(x)));
assert(card.required.some(x=>/canal water/.test(x)));
assert(card.avoid.some(x=>/unlocked gate/.test(x)));
assert.equal(accepted.sceneId,"HJ01");
assert.equal(accepted.variantKey,"default");
assert.equal(accepted.status,"staged-candidate-not-installed");
assert.equal(accepted.renderCountInArtworkTurn,1);
assert.equal(accepted.acceptedRendering,1);
assert.equal(accepted.candidateFile,"case002-hj01-scene--mobile.webp");
const file=path.join(root,"assets/case002/candidates",accepted.candidateFile);
const data=fs.readFileSync(file);
assert.equal(data.length,accepted.bytes);
assert.equal(data.toString("ascii",0,4),"RIFF");
assert.equal(data.toString("ascii",8,12),"WEBP");
assert.equal(data.readUInt32LE(4)+8,data.length);
assert.deepEqual([dimensions(data).width,dimensions(data).height],[720,900]);
assert.equal(crypto.createHash("sha256").update(data).digest("hex"),accepted.sha256);
const git=crypto.createHash("sha1").update(Buffer.concat([
 Buffer.from("blob "+data.length+"\0"),data])).digest("hex");
assert.equal(git,accepted.gitBlobSha1);
const pending=["HJ01","HF01","HE01","HV01","HS01","HF02","HS02"];
for(const id of pending){
 assert.equal(manifest.sceneImages.filter(e=>e.sceneId===id).length,0,
  "No unfinished personal scene art may appear in the gameplay manifest: "+id);
 assert.equal(resolveScene({
  sceneId:id,variantKey:"default",visibleCast:["hero"],
  desiredAsset:"case002-"+id.toLowerCase()+"-scene.webp"
 }),null);
}
assert.equal(fs.existsSync(path.join(root,"assets/case002/scenes",
 accepted.candidateFile)),false,"A reviewed candidate must not silently install");
console.log("PASS Case002 HJ01: 1/1 render accepted, image SHA/RIFF/dimensions verified; seven hero-gap scenes remain uninstalled.");
