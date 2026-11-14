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
 assert.equal(manifest.sceneImages.filter(x=>x.sceneId===card.id).length,0,
   "A chapter VI candidate cannot be prematurely installed");
 assert.equal(resolveScene({sceneId:card.id,variantKey:"default",visibleCast:["hero"],desiredAsset:"case002-"+card.id.toLowerCase()+"-scene.webp"}),null);
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
   assert(card.required.some(x=>/closed brown leather folder/.test(x)));
   assert(card.required.some(x=>/railway woman/.test(x)));
   assert(card.avoid.some(x=>/Tommy or any other possibly absent witness/.test(x)));
   assert(card.avoid.some(x=>/opened legible ledger/.test(x)));
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
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F03").length,0);
const factoryView=bool=>({scene:{id:"F04"},state:{flags:{},witnesses:{}},facts:{provedFactoryCoverup:bool}});
assert.equal(director.variant(factoryView(false)),"factory-unproven");
assert.equal(director.variant(factoryView(true)),"factory-proven");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F04").length,0);
const witnessView=w=>({scene:{id:"F05"},state:{flags:{},witnesses:w},facts:{}});
for(const witnesses of [
  {ada:"missing",tommy:"detained",mercer:"missing"},
  {ada:"protected",tommy:"evacuated",mercer:"deceased"},
  {ada:"evacuated",tommy:"evacuated",mercer:"evacuated"}
]){
  assert.equal(director.variant(witnessView(witnesses)),"statuses-in-html",
    "The image cannot silently declare witness fate for a particular route");
}
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F05").length,0);
const threatView={scene:{id:"F06"},state:{flags:{},witnesses:{}},facts:{}};
assert.equal(director.variant(threatView),"default",
 "The choice of guarded or safe route must be a player decision, never a photograph-triggered state");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F06").length,0);
const guardsView={scene:{id:"F07"},state:{flags:{},witnesses:{}},facts:{}};
assert.equal(director.variant(guardsView),"default",
 "An illustrated guard warning cannot infer the hero's subsequent risk choice or death");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F07").length,0);
const preVerdictFlags=(held,given)=>({scene:{id:"F08"},state:{flags:{brackettAccountsHeld:held,accountsGivenToWorkers:given},witnesses:{}}});
assert.equal(director.variant(preVerdictFlags(false,false)),"accounts-not-held");
assert.equal(director.variant(preVerdictFlags(true,false)),"accounts-hero");
assert.equal(director.variant(preVerdictFlags(true,true)),"accounts-workers");
assert.equal(director.variant(preVerdictFlags(false,true)),"accounts-workers");
assert.equal(manifest.sceneImages.filter(x=>x.sceneId==="F08").length,0);
console.log("PASS: Chapter VI candidates F01–F08 physically verified and uninstalled.");
