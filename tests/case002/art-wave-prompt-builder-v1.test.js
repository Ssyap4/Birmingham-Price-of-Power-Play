#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {execFileSync}=require("node:child_process");
const mod=require("../../docs/case002/art-wave-prompt-builder-v1.js");
const cardsPath=path.join(__dirname,"../../docs/case002/art-wave-16-shotcards-v1.json");
const cards=mod.validateBatch(JSON.parse(fs.readFileSync(cardsPath,"utf8")));
assert.deepEqual(cards.map(c=>c.id),["C01","C02","C03","C04","C05"]);
assert.deepEqual(cards.map(c=>c.sceneKind),["transition","evidence","evidence","emotion","evidence"]);
for(const c of cards){
 const prompt=mod.promptFor(c);
 assert(prompt.includes("single continuous photorealistic cinematic moment"));
 assert(prompt.includes(c.focus));
 assert(!/\b(?:infographic|collage|poster|dashboard|GitHub|workflow|manifest|approval|approved|generator)\b/i.test(prompt));
 assert(!/\b[A-F]\d{2}\b/.test(prompt),"Scene ID must not leak to render prompt");
 for(const forbidden of c.avoid)assert(!prompt.includes(forbidden),"Review exclusions should not leak into render prompt");
 assert(!prompt.includes(c.knowledgeBoundary),"Narrative review boundary must not leak");
 const rev=mod.reviewFor(c);
 assert.deepEqual(rev.doNotDepict,c.avoid);
 assert.equal(rev.knowledgeBoundary,c.knowledgeBoundary);
}
assert.throws(()=>mod.validateBatch({schemaVersion:2,scenes:[cards[0],cards[0]]}),/Duplicate scene ID/);
assert.throws(()=>mod.validateBatch({schemaVersion:2,scenes:[{...cards[0],sceneKind:undefined}]}),/sceneKind/);
assert.throws(()=>mod.validateCard({...cards[0],focus:"Refer to C03"}),/another scene ID/);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"case002-shots-"));
try{
 const bin=path.join(__dirname,"../../docs/case002/art-wave-prompt-builder-v1.js");
 execFileSync(process.execPath,[bin,"--cards",cardsPath,"--all","--out-dir",tmp]);
 assert.equal(fs.readdirSync(tmp).length,5);
 for(const name of fs.readdirSync(tmp))assert(fs.readFileSync(path.join(tmp,name),"utf8").includes("Camera placement:"));
 const review=JSON.parse(execFileSync(process.execPath,[bin,"--cards",cardsPath,"--id","C04","--review"],{encoding:"utf8"}));
 assert.equal(review.id,"C04");
 assert(review.requiresHumanArtReview);
}finally{fs.rmSync(tmp,{force:true,recursive:true})}
console.log("PASS: five wave16 scene types and split render/review payloads");
