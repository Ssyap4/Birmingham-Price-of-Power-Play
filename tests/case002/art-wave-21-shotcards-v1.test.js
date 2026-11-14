#!/usr/bin/env node
"use strict";
/* Ending artwork is an individually reviewed candidate, not an installed asset. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const builder=require("../../docs/case002/art-wave-prompt-builder-v1.js");
const {dimensions}=require("../../tools/case002/art-audit-v1.js");
const board=require("../../docs/case002/case002-art-storyboard-v1.json");
const director=require("../../src/case002/scene-art-v1.js");
const {manifest,resolveScene}=require("../../src/case002/approved-art-v1.js");
const root=path.resolve(__dirname,"../..");
const spec=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-21-endings-shotcards-v1.json"),"utf8"));
const batch=builder.validateBatch(spec);
const metadata=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-21-endings-candidates-v1.json"),"utf8"));
const chapter=board.sceneAssets.filter(x=>x.chapter==="END");
assert.equal(chapter.length,7);
assert.equal(chapter[0].id,"Z01");
assert.equal(spec.schemaVersion,2);
assert.equal(spec.chapter,"END");
assert.equal(metadata.chapter,"END");
assert.deepEqual(batch.map(x=>x.id),chapter.slice(0,batch.length).map(x=>x.id));
assert.equal(metadata.candidates.length,batch.length);
for(const [i,card] of batch.entries()){
 const candidate=metadata.candidates[i];
 assert.equal(candidate.sceneId,card.id);
 assert.equal(candidate.variantKey,card.id==="Z02"?"evacuated-none":"default");
 assert.equal(candidate.status,"staged-candidate-not-installed");
 assert.equal(candidate.renderCountInArtworkTurn,1);
 assert.equal(candidate.acceptedRendering,1);
 assert.equal(candidate.candidateFile,card.id==="Z02"
  ?"case002-z02-scene--evacuated-none--mobile.webp"
  :"case002-"+card.id.toLowerCase()+"-scene--mobile.webp");
 const render=builder.promptFor(card),review=builder.reviewFor(card);
 assert(render.includes(card.focus)&&render.includes(card.camera));
 assert(!render.includes(card.knowledgeBoundary));
 for(const avoid of card.avoid)assert(!render.includes(avoid));
 assert.equal(review.requiresHumanArtReview,true);
 assert.equal(review.automationDoesNotApprove,true);
 const f=path.join(root,"assets/case002/candidates",candidate.candidateFile);
 const bytes=fs.readFileSync(f);
 assert.equal(bytes.toString("ascii",0,4),"RIFF");
 assert.equal(bytes.toString("ascii",8,12),"WEBP");
 assert.equal(bytes.readUInt32LE(4)+8,bytes.length);
 assert.deepEqual([dimensions(bytes).width,dimensions(bytes).height],[720,900]);
 assert.equal(bytes.length,candidate.bytes);
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),candidate.sha256);
 assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+bytes.length),Buffer.from([0]),bytes])).digest("hex"),candidate.gitBlobSha1);
 assert.equal(manifest.sceneImages.filter(e=>e.sceneId===card.id).length,0,
   "Ending candidate must not be installed before full ending review");
 const stage={sceneId:card.id,variantKey:candidate.variantKey,visibleCast:["hero"],
    desiredAsset:"case002-"+card.id.toLowerCase()+"-scene"+
       (card.id==="Z02"?"--evacuated-none":"")+".webp"};
 assert.equal(resolveScene(stage),null);
 if(card.id==="Z01"){
   assert.equal(director.variant({scene:{id:card.id},state:{flags:{},witnesses:{}},facts:{}}),"default");
   assert(card.knowledgeBoundary.includes("not imply that Vale has been convicted"));
   assert(card.knowledgeBoundary.includes("witnesses"));
   assert(card.required.some(v=>/two separate dense columns/.test(v)));
   assert(card.avoid.some(v=>/identifying signatures/.test(v)));
 }else if(card.id==="Z02"){
   assert.equal(card.intendedVariant,"evacuated-none");
   assert(card.knowledgeBoundary.includes("zero-evacuee"));
   assert(card.required.some(v=>/gloved hand alone/.test(v)));
   assert(card.required.some(v=>/deserted stone platform/.test(v)));
   assert(card.avoid.some(v=>/visible male or female protagonist/.test(v)));
   assert.equal(director.variant({scene:{id:"Z02"},state:{flags:{},
     witnesses:{ada:"missing",tommy:"detained",mercer:"protected"}},facts:{}}),"evacuated-none");
   assert.equal(director.variant({scene:{id:"Z02"},state:{flags:{},
     witnesses:{ada:"evacuated",tommy:"detained",mercer:"protected"}},facts:{}}),"evacuated-ada");
   assert.equal(manifest.sceneImages.filter(e=>e.sceneId==="Z02").length,0);
 }

}
const rejectedZ02=metadata.rejectedGenerations?.find(x=>x.sceneId==="Z02"&&x.reasonCode==="playable-hero-gender-presumption");
assert(rejectedZ02,"Gender-assumptive Z02 must remain rejected pending a new author turn");
assert.equal(rejectedZ02.attemptedGenerations,1);
assert.equal(rejectedZ02.imageApproved,false);
assert.equal(rejectedZ02.installed,false);
assert.equal(rejectedZ02.candidateFile,null);
assert.equal(metadata.candidates.filter(x=>x.sceneId==="Z02"&&x.variantKey==="evacuated-none").length,1,
 "A separately generated gender-neutral replacement must be recorded as its own accepted candidate");
assert.equal(spec.scenes.filter(x=>x.id==="Z02").length,1);
assert.equal(metadata.candidates.find(x=>x.sceneId==="Z02").previousRejectedGeneratorImageId,
 rejectedZ02.generatorImageId,"Preserve failed attempt for traceability");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="Z02").length,0);
console.log("PASS: Z01 and Z02 zero-evacuee candidates verified; rejected gendered Z02 preserved.");
