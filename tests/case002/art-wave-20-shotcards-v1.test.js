#!/usr/bin/env node
"use strict";
/* Chapter VI: byte-identical reviewed candidates installed only with explicit neutral-state gates. */
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
 assert.equal(m.status,"installed-approved-in-feature");
 assert.equal(m.installedBytesIdentical,true);
 assert.equal(m.acceptedRendering,1);
 assert.equal(m.renderCountInArtworkTurn,1);
 if(card.id==="F08"){
   assert.equal(m.candidateFile,"case002-f08-scene--revised--mobile.webp");
   assert.equal(m.needsReplacement,false);
   assert.equal(m.replacedAfterCanonicalReview,true);
   assert.equal(m.canonicalReference,"assets/case002/portraits/case002-mabel-portrait.webp");
   assert.equal(m.previousRejectedCandidate?.status,"art-review-hold-not-installed");
   const rejected=fs.readFileSync(path.join(root,"assets/case002/candidates",m.previousRejectedCandidate.candidateFile));
   assert.equal(crypto.createHash("sha256").update(rejected).digest("hex"),m.previousRejectedCandidate.sha256);
   assert.notEqual(m.previousRejectedCandidate.sha256,m.sha256);
 }
 assert.equal(m.variantKey,"default");
 assert.equal(m.candidateFile,card.id==="F08"?"case002-f08-scene--revised--mobile.webp":"case002-"+card.id.toLowerCase()+"-scene--mobile.webp");
 assert.equal(card.sceneKind,card.id==="F06"?"environment":["F07","F08"].includes(card.id)?"dialogue":"evidence");
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
 const canonical="case002-"+card.id.toLowerCase()+"-scene--mobile.webp";
 assert.equal(m.installedFile,canonical);
 const installed=manifest.sceneImages.filter(x=>x.sceneId===card.id);
 assert.equal(installed.length,1,"Only one canonical Chapter VI scene approval permitted: "+card.id);
 assert.equal(installed[0].variantKey,"default");
 assert.equal(installed[0].mobileOnly,true);
 assert.equal(installed[0].mobileFile,canonical);
 assert.equal(installed[0].mobileSha256,m.sha256);
 const installedBytes=fs.readFileSync(path.join(root,"assets/case002/scenes",canonical));
 assert.equal(crypto.createHash("sha256").update(installedBytes).digest("hex"),m.sha256,
   "Installed Chapter VI scene must match the reviewed WebP bytes");
 assert.equal(installedBytes.equals(bytes),true,
   "Do not modify the accepted art while copying it into the scene library");
 assert.equal(card.required.length,3);
 if(card.id==="F01"){
   assert(card.knowledgeBoundary.includes("Only one wagon"));
 }else if(card.id==="F02"){
   assert(card.knowledgeBoundary.includes("two independent suspected falsifications"));
   assert(card.required.some(x=>/right-hand train arrival ledger/.test(x)));
   assert(card.required.some(x=>/left-hand freight paper/.test(x)));
 }
 else if(card.id==="F03"){
   assert(card.knowledgeBoundary.includes("provedHaleMurder"));
   assert(card.required.some(x=>/wool fabric fragment/.test(x)));
   assert(card.required.some(x=>/police accident report/.test(x)));
   assert(card.required.some(x=>/folded telegram/.test(x)));
   assert(card.avoid.some(x=>/Hale alive/.test(x)));
 }
 else if(card.id==="F04"){
   assert(card.knowledgeBoundary.includes("provedFactoryCoverup"));
   assert(card.required.some(x=>/only two handwritten numbered entries/.test(x)));
   assert(card.required.some(x=>/precisely six individually numbered entries/.test(x)));
   assert(card.required.some(x=>/lowest sixth ledger line/.test(x)));
   assert(card.avoid.some(x=>/legible or invented surnames/.test(x)));
 }
 else if(card.id==="F05"){
   assert(card.knowledgeBoundary.includes("witnesses.ada"));
   assert(card.knowledgeBoundary.includes("witnesses.tommy"));
   assert(card.knowledgeBoundary.includes("witnesses.mercer"));
   assert(card.required.some(x=>/exactly three separate aged witness cards/.test(x)));
   assert(card.avoid.some(x=>/rescued\/protected\/dead label/.test(x)));
   assert(card.avoid.some(x=>/recognizable witness portrait/.test(x)));
 }
 else if(card.id==="F06"){
   assert(card.knowledgeBoundary.includes("explicit choice"));
   assert(card.required.some(x=>/pedestrian bypass curving left/.test(x)));
   assert(card.required.some(x=>/two dark uniformed guards/.test(x)));
   assert(card.required.some(x=>/brass cartridge/.test(x)));
   assert(card.avoid.some(x=>/wounded, killed, captured/.test(x)));
 }
 else if(card.id==="F07"){
   assert(card.knowledgeBoundary.includes("trainDeath"));
   assert(card.focus.includes("raises one open hand"));
   assert(card.required.some(x=>/empty open palm/.test(x)));
   assert(card.required.some(x=>/second private guard/.test(x)));
   assert(card.required.some(x=>/open side archway/.test(x)));
   assert(card.avoid.some(x=>/dead or wounded person/.test(x)));
 }
 else if(card.id==="F08"){
   assert(card.knowledgeBoundary.includes("accountsGivenToWorkers"));
   assert(card.knowledgeBoundary.includes("brackettAccountsHeld"));
   assert(card.required.some(x=>/closed brown leather document folder/.test(x)));
   assert(card.required.some(x=>/angular-faced woman/.test(x)));
   assert(card.required.some(x=>/squared shoulders, crossed arms/.test(x)));
   assert(card.avoid.some(x=>/Tommy, other conditional witnesses/.test(x)));
   assert(card.avoid.some(x=>/opened, legible or transferred factory account book/.test(x)));
 }
 else if(card.id==="F09"){
   assert(card.knowledgeBoundary.includes("endingAvailable"));
   assert(card.knowledgeBoundary.includes("blank"));
   assert(card.required.some(x=>/completely blank unsigned sheet/.test(x)));
   assert(card.required.some(x=>/unlettered brown leather folder/.test(x)));
   assert(card.avoid.some(x=>/printed case number/.test(x)));
   assert(card.avoid.some(x=>/all seven endings/.test(x)));
 }

}
// chapter VI two-document state fixture: artwork is neutral; proof must come from game facts.
const director=require("../../src/case002/scene-art-v1.js");
const view=(a,b)=>({scene:{id:"F02"},state:{flags:{},witnesses:{}},
 facts:{provedFirstForgery:a,provedSecondForgery:b}});
assert.equal(director.variant(view(false,false)),"incomplete");
assert.equal(director.variant(view(true,false)),"incomplete");
assert.equal(director.variant(view(false,true)),"incomplete");
assert.equal(director.variant(view(true,true)),"both-proven");
const rowanState=bool=>({scene:{id:"F03"},state:{flags:{},witnesses:{}},facts:{provedHaleMurder:bool}});
assert.equal(director.variant(rowanState(false)),"hale-unproven");
assert.equal(director.variant(rowanState(true)),"hale-proven");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F03").length,1);
const factoryView=bool=>({scene:{id:"F04"},state:{flags:{},witnesses:{}},facts:{provedFactoryCoverup:bool}});
assert.equal(director.variant(factoryView(false)),"factory-unproven");
assert.equal(director.variant(factoryView(true)),"factory-proven");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F04").length,1);
const witnessView=w=>({scene:{id:"F05"},state:{flags:{},witnesses:w},facts:{}});
for(const witnesses of [
  {ada:"missing",tommy:"detained",mercer:"missing"},
  {ada:"protected",tommy:"evacuated",mercer:"deceased"},
  {ada:"evacuated",tommy:"evacuated",mercer:"evacuated"}
]){
  assert.equal(director.variant(witnessView(witnesses)),"statuses-in-html",
    "The image cannot silently declare witness fate for a particular route");
}
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F05").length,1);
const threatView={scene:{id:"F06"},state:{flags:{},witnesses:{}},facts:{}};
assert.equal(director.variant(threatView),"default",
 "The choice of guarded or safe route must be a player decision, never a photograph-triggered state");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F06").length,1);
const guardsView={scene:{id:"F07"},state:{flags:{},witnesses:{}},facts:{}};
assert.equal(director.variant(guardsView),"default",
 "An illustrated guard warning cannot infer the hero's subsequent risk choice or death");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F07").length,1);
const preVerdictFlags=(held,given)=>({scene:{id:"F08"},state:{flags:{brackettAccountsHeld:held,accountsGivenToWorkers:given},witnesses:{}}});
assert.equal(director.variant(preVerdictFlags(false,false)),"accounts-not-held");
assert.equal(director.variant(preVerdictFlags(true,false)),"accounts-hero");
assert.equal(director.variant(preVerdictFlags(true,true)),"accounts-workers");
assert.equal(director.variant(preVerdictFlags(false,true)),"accounts-workers");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F08").length,1);
const rejectedF09=metadata.rejectedGenerations?.find(x=>x.sceneId==="F09"&&x.reasonCode==="wrong-case-number");
assert(rejectedF09,"Unacceptable wrong-case-number artwork must be explicitly recorded");
assert.equal(rejectedF09.attemptedGenerations,1);
assert.equal(rejectedF09.imageApproved,false);
assert.equal(rejectedF09.installed,false);
assert.equal(rejectedF09.candidateFile,null);
assert.equal(metadata.candidates.filter(x=>x.sceneId==="F09").length,1,
 "The newly accepted F09 must be distinct from the rejected wrong-number rendering");
assert.equal(spec.scenes.filter(x=>x.id==="F09").length,1);
assert.equal(metadata.candidates.find(x=>x.sceneId==="F09").status,"installed-approved-in-feature");
const f09View={scene:{id:"F09"},state:{flags:{},witnesses:{}},facts:{}};
assert.equal(director.variant(f09View),"available-options-in-html",
 "Choices are derived from game logic rather than the pictured document");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F09").length,1,
 "Install exactly the accepted, unlettered F09 rather than the rejected wrong-number rendering");
const fVariants={
 F01:["default"],F02:["incomplete","both-proven"],F03:["hale-unproven","hale-proven"],
 F04:["factory-unproven","factory-proven"],F05:["statuses-in-html"],
 F06:["default"],F07:["default"],
 F08:["accounts-not-held","accounts-hero","accounts-workers"],
 F09:["available-options-in-html"]
};
const visible={F01:["hero"],F02:["hero"],F03:["hero","rowan"],F04:["hero"],F05:["hero"],
 F06:["hero"],F07:["hero","guards"],F08:["hero","mabel"],F09:["hero"]};
for(const [id,variants] of Object.entries(fVariants)){
 const canonical="case002-"+id.toLowerCase()+"-scene--mobile.webp";
 for(const variantKey of variants){
  const suffix=variantKey==="default"?"":"--"+variantKey;
  const stage={sceneId:id,variantKey,visibleCast:visible[id],
    desiredAsset:"case002-"+id.toLowerCase()+"-scene"+suffix+".webp"};
  assert(resolveScene(stage)?.src.endsWith("/"+canonical),
    "Chapter VI reviewed neutral state must resolve to its single verified file: "+id+":"+variantKey);
 }
 const illegalVariant={sceneId:id,variantKey:"fabricated-ending",
  visibleCast:visible[id],desiredAsset:"case002-"+id.toLowerCase()+"-scene--fabricated-ending.webp"};
 assert.equal(resolveScene(illegalVariant),null,
  "Unapproved Chapter VI state must never resolve to arbitrary art: "+id);
}
assert.notEqual(spec.scenes.find(x=>x.id==="F08"),undefined);
assert.equal(manifest.sceneImages.find(x=>x.sceneId==="F08").mobileSha256,
 "e4b5c0eb67b050516a656d233fe8d496d1e2c413829cd573a2bfb4354da1dbeb");
console.log("PASS: Chapter VI F01–F09 installed; all neutral story states and F08/F09 rejected predecessors guarded.");
