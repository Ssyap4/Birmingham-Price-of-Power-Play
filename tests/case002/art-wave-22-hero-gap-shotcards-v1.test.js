#!/usr/bin/env node
"use strict";
/* Seven independently reviewed hero-specific 720x900 WebPs are installed with
 * exact story IDs. Archived candidate bytes must equal playable scene bytes. */
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
assert.equal(metadata.chapter,"HERO-GAPS");
assert(["hero-gap-art-installed-feature-branch-awaiting-full-QA","hero-gap-art-installed-feature-branch-verified"].includes(metadata.status));
assert.deepEqual(cards.map(c=>c.id),["HJ01","HF01","HE01","HV01","HS01","HF02","HS02"]);
assert.deepEqual(metadata.candidates.map(c=>c.sceneId),["HJ01","HF01","HE01","HV01","HS01","HF02","HS02"]);
const expected={
 HJ01:{chapter:"II",cast:["jack","guard"],kind:"dialogue",
  filename:"case002-hj01-scene--mobile.webp",
  sha:"b3a1fb848a308c7e63f0245b08d1a58c46eef1049cc1af5a1130a16da85c1567",
  bytes:76750,required:/railway watchman/,avoid:/unlocked gate/},
 HF01:{chapter:"II",cast:["finn"],kind:"transition",
  filename:"case002-hf01-scene--mobile.webp",
  sha:"1b08c9b8357df7d79e1c53d6741836e17d1c1fccbc79aa55560a7b76ca5ca83b",
  bytes:118254,required:/open weathered wooden window/,avoid:/safe door/},
 HE01:{chapter:"II",cast:["eleanor"],kind:"evidence",
  filename:"case002-he01-scene--mobile.webp",
  sha:"8385375c533fecebb7a6dc2cd57e507dd1d4120e2ba8c856daf98840db076c4f",
  bytes:117714,required:/brass articulated period desk lamp/,avoid:/legible accusation/},
 HV01:{chapter:"II",cast:["victor","vale"],kind:"dialogue",
  filename:"case002-hv01-scene--mobile.webp",
  sha:"11a39e3c9af87662c9c33f7c83084a8b2a5e16497f926135bd9e7061a7e78208",
  bytes:82992,required:/heavy vintage iron safe/,avoid:/signed confession/},
 HS01:{chapter:"II",cast:["samuel"],kind:"evidence",
  filename:"case002-hs01-scene--mobile.webp",
  sha:"7c04a95024f22506d450a0991103a5160aaf0dd6009050ae7fd6dfbbdbfd73c9",
  bytes:115446,required:/railway coupling/,avoid:/police uniform/},
 HF02:{chapter:"III",cast:["finn"],kind:"evidence",
  filename:"case002-hf02-scene--mobile.webp",
  sha:"e77f6769bf37cda0e9f2259fd4537277aae2bb45589528d90b84c220d3282852",
  bytes:121910,required:/wooden shift marker/,avoid:/marker detached/},
 HS02:{chapter:"III",cast:["samuel","signalman"],kind:"evidence",
  filename:"case002-hs02-scene--mobile.webp",
  sha:"e622a45a43c652d289a9ac92d8bbcb28c499b75cfc2c97e1cf220a6c19b0220c",
  bytes:139404,required:/paper rail junction diagram/,avoid:/signed map/}
};
const hashes=new Set();
for(const [index,card] of cards.entries()){
 const e=expected[card.id],candidate=metadata.candidates[index];
 assert(e,"Unexpected completed hero-specific artwork");
 assert.equal(card.sceneKind,e.kind);
 assert.equal(card.intendedVariant,"default");
 assert(card.required.some(s=>e.required.test(s)));
 assert(card.avoid.some(s=>e.avoid.test(s)));
 const canonical=storyboard.sceneAssets.find(x=>x.id===card.id);
 assert(canonical&&canonical.chapter===e.chapter);
 assert.deepEqual(canonical.cast,e.cast);
 assert.equal(canonical.asset,"case002-"+card.id.toLowerCase()+"-scene.webp");
 const render=builder.promptFor(card),review=builder.reviewFor(card);
 assert(render.includes(card.focus)&&render.includes(card.camera));
 assert(!render.includes(card.knowledgeBoundary));
 assert.equal(review.requiresHumanArtReview,true);
 assert.equal(review.automationDoesNotApprove,true);
 assert.equal(candidate.sceneId,card.id);
 assert.equal(candidate.variantKey,"default");
 assert.equal(candidate.status,"installed-feature-branch-source-retained");
 assert.equal(candidate.renderCountInArtworkTurn,1);
 assert.equal(candidate.acceptedRendering,1);
 assert.equal(candidate.candidateFile,e.filename);
 assert.equal(candidate.bytes,e.bytes);
 assert.equal(candidate.sha256,e.sha);
 assert.deepEqual(candidate.dimensions,[720,900]);
 assert(typeof candidate.visualReview==="string"&&candidate.visualReview.length>70);
 const imageFile=path.join(root,"assets/case002/candidates",candidate.candidateFile);
 const data=fs.readFileSync(imageFile);
 assert.equal(data.length,candidate.bytes);
 assert.equal(data.toString("ascii",0,4),"RIFF");
 assert.equal(data.toString("ascii",8,12),"WEBP");
 assert.equal(data.readUInt32LE(4)+8,data.length);
 assert.deepEqual([dimensions(data).width,dimensions(data).height],[720,900]);
 const sh=crypto.createHash("sha256").update(data).digest("hex");
 assert.equal(sh,candidate.sha256);
 assert(!hashes.has(sh),"Hero-specific frames must have different photographic content");
 hashes.add(sh);
 const git=crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+data.length+"\0"),data])).digest("hex");
 assert.equal(git,candidate.gitBlobSha1);
 const installedBytes=fs.readFileSync(path.join(root,"assets/case002/scenes",candidate.candidateFile));
 assert.deepEqual(installedBytes,data,"Installed WebP must be byte-identical to reviewed candidate");
 const entries=manifest.sceneImages.filter(x=>x.sceneId===card.id&&x.variantKey==="default");
 assert.equal(entries.length,1,"Each personal scene must have exactly one approved registration");
 const chosen=entries[0];
 assert.equal(chosen.review,"approved");
 assert.equal(chosen.mobileOnly,true);
 assert.equal(chosen.file,canonical.asset);
 assert.equal(chosen.mobileFile,candidate.candidateFile);
 assert.equal(chosen.mobileSha256,candidate.sha256);
 assert.deepEqual([chosen.mobileWidth,chosen.mobileHeight],[720,900]);
 const expectedCast={HJ01:["guard"],HF01:[],HE01:[],HV01:["vale"],
   HS01:[],HF02:[],HS02:["signalman"]};
 assert.deepEqual(chosen.cast,expectedCast[card.id]);
 const stage={sceneId:card.id,variantKey:"default",
  visibleCast:canonical.cast,desiredAsset:canonical.asset};
 const art=resolveScene(stage);
 assert(art&&art.mobileOnly&&art.src.endsWith("/"+candidate.candidateFile),
  "Canonical character route must show its exact reviewed art: "+card.id);
 assert.equal(art.mobileSrc,art.src);
}
const installedIds=["HJ01","HF01","HE01","HV01","HS01","HF02","HS02"];
assert.deepEqual(installedIds,cards.map(x=>x.id));
assert.equal(hashes.size,7,"Every personal hero image must remain visually distinct");
assert.equal(manifest.sceneImages.length,102,"7 new scenes added to previous 95 registrations");
assert.equal(new Set(manifest.sceneImages.map(x=>x.sceneId)).size,89);
assert.deepEqual([...new Set(manifest.sceneImages.map(x=>x.sceneId))].sort(),
 storyboard.sceneAssets.map(x=>x.id).sort(),"89/89 canonical storyboard IDs must have art");
for(const id of installedIds){
 const entry=manifest.sceneImages.find(e=>e.sceneId===id);
 assert(entry&&entry.variantKey==="default");
 assert.equal(resolveScene({sceneId:id,variantKey:"unapproved-state",
  visibleCast:storyboard.sceneAssets.find(x=>x.id===id).cast,
  desiredAsset:"case002-"+id.toLowerCase()+"-scene--unapproved-state.webp"}),null,
  "Never display personal artwork for unknown variants");
}
console.log("PASS Case002 hero-gap art: 7/7 installed, 89/89 unique storyboard IDs covered, physical WebP bytes equal reviewed candidates, hero cast and unknown-variant guards verified.");
