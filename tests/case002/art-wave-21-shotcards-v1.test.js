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
 assert.equal(candidate.variantKey,card.id==="Z02"?"evacuated-none":card.id==="Z04"?"guarantee-signed":card.id==="Z05"?"empty-safe-siding":card.id==="Z06"?"accounts-hero":card.id==="Z07"?"after-danger":"default");
 assert.equal(candidate.status,"staged-candidate-not-installed");
 assert.equal(candidate.renderCountInArtworkTurn,1);
 assert.equal(candidate.acceptedRendering,1);
 assert.equal(candidate.candidateFile,card.id==="Z02"
  ?"case002-z02-scene--evacuated-none--mobile.webp"
  :card.id==="Z04"?"case002-z04-scene--guarantee-signed--mobile.webp"
  :card.id==="Z05"?"case002-z05-scene--empty-safe-siding--mobile.webp"
  :card.id==="Z06"?"case002-z06-scene--accounts-hero--mobile.webp"
  :card.id==="Z07"?"case002-z07-scene--after-danger--mobile.webp"
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
       (card.id==="Z02"?"--evacuated-none":card.id==="Z04"?"--guarantee-signed":card.id==="Z05"?"--empty-safe-siding":card.id==="Z06"?"--accounts-hero":card.id==="Z07"?"--after-danger":"")+".webp"};
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
 }else if(card.id==="Z03"){
   assert.equal(card.sceneKind,"aftermath");
   assert(card.knowledgeBoundary.includes("wider factory-management responsibility"));
   assert(card.knowledgeBoundary.includes("conviction"));
   assert(card.required.some(v=>/private factory security chief/.test(v)));
   assert(card.required.some(v=>/young police constable/.test(v)));
   assert(card.avoid.some(v=>/Vale or factory management behind bars/.test(v)));
   const Z03Scene=chapter.find(x=>x.id==="Z03");
   assert.deepEqual(director.visibleFrom(Z03Scene,{
      scene:{id:"Z03"},state:{flags:{},
        witnesses:{ada:"missing",tommy:"detained",mercer:"protected"}},facts:{provedHaleMurder:true}
   }),["brackett","rowan"]);
   assert.equal(director.variant({scene:{id:"Z03"},
      state:{flags:{},witnesses:{}},facts:{provedHaleMurder:true}}),"default");
   assert.equal(manifest.sceneImages.filter(e=>e.sceneId==="Z03").length,0);
 }else if(card.id==="Z04"){
   assert.equal(card.sceneKind,"evidence");
   assert.equal(card.intendedVariant,"guarantee-signed");
   assert(card.knowledgeBoundary.includes("particular witnesses actually included"));
   assert(card.knowledgeBoundary.includes("all three witnesses"));
   assert(card.required.some(v=>/signed agreement paper with a red wax seal/.test(v)));
   assert(card.required.some(v=>/older man's hand/.test(v)));
   assert(card.avoid.some(v=>/readable witness names/.test(v)));
   assert(card.avoid.some(v=>/universal protection/.test(v)));
   assert.equal(director.variant({scene:{id:"Z04"},state:{flags:{valeGuarantee:true},
      witnesses:{ada:"protected",tommy:"detained",mercer:"missing"}},facts:{}}),"guarantee-signed");
   assert.equal(manifest.sceneImages.filter(e=>e.sceneId==="Z04").length,0);
 }else if(card.id==="Z05"){
   assert.equal(card.sceneKind,"aftermath");
   assert.equal(card.intendedVariant,"empty-safe-siding");
   assert(card.knowledgeBoundary.includes("workersCleared"));
   assert(card.required.some(v=>/hand-operated railway switch/.test(v)));
   assert(card.required.some(v=>/padlocked/.test(v)));
   assert(card.required.some(v=>/unmarked folded paper envelope/.test(v)));
   assert(card.avoid.some(v=>/injured people/.test(v)));
   assert(card.avoid.some(v=>/readable wage amounts/.test(v)));
   assert.equal(director.variant({scene:{id:"Z05"},state:{flags:{workersCleared:true},
      witnesses:{ada:"missing",tommy:"detained",mercer:"protected"}},facts:{}}),"empty-safe-siding");
   assert.equal(manifest.sceneImages.filter(e=>e.sceneId==="Z05").length,0);
 }else if(card.id==="Z06"){
   assert.equal(card.sceneKind,"evidence");
   assert.equal(card.intendedVariant,"accounts-hero");
   assert(card.knowledgeBoundary.includes("brackettAccountsHeld"));
   assert(card.required.some(v=>/leather-gloved hand/.test(v)));
   assert(card.required.some(v=>/duplicate account pages/.test(v)));
   assert(card.required.some(v=>/half-open dark wooden door/.test(v)));
   assert(card.avoid.some(v=>/recognizable or full-body playable protagonist/.test(v)));
   assert(card.avoid.some(v=>/published newspaper/.test(v)));
   assert.equal(director.variant({scene:{id:"Z06"},state:{flags:{brackettAccountsHeld:true},
      witnesses:{ada:"missing",tommy:"detained",mercer:"protected"}},facts:{}}),"accounts-hero");
   assert.equal(manifest.sceneImages.filter(e=>e.sceneId==="Z06").length,0);
 }else if(card.id==="Z07"){
   assert.equal(card.sceneKind,"aftermath");
   assert.equal(card.intendedVariant,"after-danger");
   assert(card.knowledgeBoundary.includes("health <= 0"));
   assert(card.required.some(v=>/unlit.*storm lantern/.test(v)));
   assert(card.required.some(v=>/closed weathered dark leather notes case/.test(v)));
   assert(card.required.some(v=>/timber lock gates/.test(v)));
   assert(card.avoid.some(v=>/visible corpse/.test(v)));
   assert(card.avoid.some(v=>/gender-specific/.test(v)));
   assert.equal(director.variant({scene:{id:"Z07"},state:{health:0,flags:{},
     witnesses:{ada:"missing",tommy:"detained",mercer:"protected"}},facts:{}}),"after-danger");
   assert.equal(manifest.sceneImages.filter(e=>e.sceneId==="Z07").length,0);
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

const artVariants=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-21-endings-variants-v1.json"),"utf8"));
assert.equal(artVariants.schemaVersion,2);
assert.equal(artVariants.chapter,"END");
assert.equal(artVariants.variants.length,1,"Exactly one added alternate artwork per author turn");
assert.equal(metadata.variants?.length,1,"Exactly one independent neutral evacuated-passenger candidate");
const vCard=artVariants.variants[0].shotCard;
const vMeta=metadata.variants[0];
assert.equal(vCard.id,"Z02");
assert.equal(vCard.intendedVariant,"evacuated-present-neutral");
assert.equal(vMeta.sceneId,"Z02");
assert.equal(vMeta.variantKey,"evacuated-present-neutral");
assert.equal(vMeta.candidateFile,"case002-z02-scene--evacuated-present-neutral--mobile.webp");
assert.equal(vMeta.status,"staged-candidate-not-installed");
assert.equal(vMeta.renderCountInArtworkTurn,1);
assert.equal(vMeta.acceptedRendering,1);
assert.equal(vMeta.reuseIsApprovedInGame,false);
builder.validateBatch({schemaVersion:2,scenes:[vCard]});
const visualPrompt=builder.promptFor(vCard),visualReview=builder.reviewFor(vCard);
assert(visualPrompt.includes(vCard.focus)&&visualPrompt.includes(vCard.location));
assert(!visualPrompt.includes(vCard.knowledgeBoundary));
assert.equal(visualReview.automationDoesNotApprove,true);
assert(vCard.required.some(x=>/conductor's two bare weathered hands/.test(x)));
assert(vCard.required.some(x=>/anonymous traveler's hand/.test(x)));
assert(vCard.knowledgeBoundary.includes("independently recorded evacuated-witness states"));
const vp=path.join(root,"assets/case002/candidates",vMeta.candidateFile);
const vb=fs.readFileSync(vp);
assert.equal(vb.toString("ascii",0,4),"RIFF");
assert.equal(vb.toString("ascii",8,12),"WEBP");
assert.equal(vb.readUInt32LE(4)+8,vb.length);
assert.deepEqual([dimensions(vb).width,dimensions(vb).height],[720,900]);
assert.equal(vb.length,vMeta.bytes);
assert.equal(crypto.createHash("sha256").update(vb).digest("hex"),vMeta.sha256);
assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+vb.length),Buffer.from([0]),vb])).digest("hex"),vMeta.gitBlobSha1);
assert.equal(manifest.sceneImages.filter(e=>e.sceneId==="Z02").length,0,"No ending art installed early");
const permittedSubsets=[
 ["ada"],["tommy"],["mercer"],["ada","tommy"],["ada","mercer"],["tommy","mercer"],["ada","tommy","mercer"]
];
const scene=chapter.find(x=>x.id==="Z02");
assert.deepEqual(vMeta.applicableVariantKeysPendingIntegrationReview,
 permittedSubsets.map(names=>"evacuated-"+names.join("-")));
for(const subset of permittedSubsets){
 const witnesses={ada:"missing",tommy:"detained",mercer:"protected"};
 for(const id of subset)witnesses[id]="evacuated";
 const view={scene:{id:"Z02"},state:{flags:{},witnesses},facts:{}};
 const key="evacuated-"+subset.join("-");
 assert.equal(director.variant(view),key,"Only state determines which witnesses boarded");
 assert.deepEqual(director.visibleFrom(scene,view),["hero",...subset],
  "The art director may not introduce a witness absent from state");
 assert.equal(resolveScene({sceneId:"Z02",variantKey:key,visibleCast:["hero",...subset],
   desiredAsset:"case002-z02-scene--"+key+".webp"}),null,
   "A proposed neutral shot must not silently install for any unreviewed combination");
}


/* Dry-run the installation map against the existing art gate without
 * installing or publishing an ending image. This is not an art approval. */
const installPlan=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-21-endings-install-plan-v1.json"),"utf8"));
assert.equal(installPlan.schemaVersion,1);
assert.equal(installPlan.chapter,"END");
assert.equal(installPlan.status,"audited-installation-plan-not-installed");
assert.equal(installPlan.entries.length,14);
assert.equal(new Set(installPlan.entries.map(x=>x.sceneId+":"+x.variantKey)).size,14);
assert.equal(new Set(installPlan.entries.map(x=>x.targetMobileFile)).size,14);
const z02Keys=[
 "evacuated-none","evacuated-ada","evacuated-tommy","evacuated-mercer",
 "evacuated-ada-tommy","evacuated-ada-mercer","evacuated-tommy-mercer",
 "evacuated-ada-tommy-mercer"
];
assert.deepEqual(installPlan.entries.filter(x=>x.sceneId==="Z02")
 .map(x=>x.variantKey).sort(),z02Keys.sort());
const exampleState={flags:{valeGuarantee:true,workersCleared:true,brackettAccountsHeld:true},
 witnesses:{ada:"missing",tommy:"detained",mercer:"located"},health:0};
const testManifest={schemaVersion:1,npcPortraits:[],sceneImages:installPlan.entries.map(e=>({
 sceneId:e.sceneId,variantKey:e.variantKey,review:"approved",
 file:e.targetMobileFile.replace("--mobile.webp",".webp"),
 mobileOnly:true,cast:e.cast,
 mobileFile:e.targetMobileFile,mobileWidth:720,mobileHeight:900,mobileSha256:e.sha256
}))};
for(const entry of installPlan.entries){
 const srcCandidate=metadata.candidates.concat(metadata.variants||[])
   .find(c=>c.sceneId===entry.sceneId&&c.variantKey===entry.sourceVariantKey);
 assert(srcCandidate,"Source candidate missing for "+entry.sceneId+":"+entry.variantKey);
 assert.equal(entry.sha256,srcCandidate.sha256);
 assert.equal(entry.bytes,srcCandidate.bytes);
 assert.equal(entry.candidateFile,srcCandidate.candidateFile);
 assert.equal(entry.requiresRuntimeText,true);
 const byteSource=fs.readFileSync(path.join(root,"assets/case002/candidates",entry.candidateFile));
 assert.equal(crypto.createHash("sha256").update(byteSource).digest("hex"),entry.sha256);
 assert.equal(byteSource.length,entry.bytes);
 assert.equal(fs.existsSync(path.join(root,"assets/case002/scenes",entry.targetMobileFile)),false,
   "Endings must still be uninstalled during audit");
 let state={...exampleState,witnesses:{...exampleState.witnesses}};
 if(entry.sceneId==="Z02"){
   for(const id of ["ada","tommy","mercer"])
     state.witnesses[id]=entry.visibleEvacuatedWitnesses.includes(id)?"evacuated":"missing";
   assert.deepEqual(entry.cast,[],"Neutral Z02 frame must not claim a named visible witness");
   assert.equal(entry.sourceVariantKey,entry.visibleEvacuatedWitnesses.length
     ?"evacuated-present-neutral":"evacuated-none");
 }else assert.deepEqual(entry.visibleEvacuatedWitnesses,[]);
 const scene=chapter.find(x=>x.id===entry.sceneId);
 const view={scene,state,facts:{}};
 const stage=director.select(board,view);
 assert.equal(stage.variantKey,entry.variantKey);
 assert.equal(resolveScene(stage),null,"Draft art may not leak into the real manifest");
 const dryRun=resolveScene(stage,testManifest);
 assert(dryRun,"Explicit future mapping should resolve, not wildcard-fallback");
 assert.equal(dryRun.mobileOnly,true);
 assert(dryRun.src.endsWith("/"+entry.targetMobileFile));
 assert(entry.cast.every(id=>stage.visibleCast.includes(id)));
 if(entry.sceneId==="Z07")assert.deepEqual(stage.visibleCast,[],"No protagonist image on fatal ending");
}
assert.equal(installPlan.entries.filter(x=>x.sceneId==="Z02").length,8);
assert.equal(new Set(installPlan.entries.filter(x=>x.sceneId==="Z02"&&
 x.variantKey!=="evacuated-none").map(x=>x.sha256)).size,1,
 "All seven nonzero witness subsets reuse the same reviewed neutral bytes");
console.log("PASS: Ending installation dry-run: 14 exact targets, 8 Z02 states, every candidate hash, hero neutrality and no early game manifest entries.");

console.log("PASS: Ending candidates Z01–Z07, Z02 neutral witness variants and archive exclusions verified; no ending art installed.");
