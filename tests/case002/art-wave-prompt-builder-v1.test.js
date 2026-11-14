#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {execFileSync}=require("node:child_process");
const mod=require("../../docs/case002/art-wave-prompt-builder-v1.js");
const specPath=path.join(__dirname,"../../docs/case002/art-wave-16-shotcards-v1.json");
const specs=mod.validateBatch(JSON.parse(fs.readFileSync(specPath,"utf8")));
assert.deepEqual(specs.map(x=>x.id),["C01","C02","C03","C04","C05"]);
for(const c of specs){
 const p=mod.promptFor(c);
 assert(p.includes("exactly ONE independent vertical 4:5"));
 assert(p.includes("infographic"));
 assert(p.includes(c.focus));
 assert(!/\b[A-F]\d{2}\b/.test(p),"Scene ID leaked into prompt");
}
assert(mod.promptFor(specs[3]).includes("confession is not independently established"));
assert(mod.promptFor(specs[4]).includes("security-office stamp"));
assert.throws(()=>mod.validateBatch({schemaVersion:1,scenes:[specs[0],specs[0]]}),/Duplicate scene ID/);
assert.throws(()=>mod.validateCard({...specs[0],required:[]}),/2-4 required/);
assert.throws(()=>mod.validateCard({...specs[0],focus:"Refer to C03"}),/adjacent scene ID/);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"case002-prompts-"));
try{
 const script=path.join(__dirname,"../../docs/case002/art-wave-prompt-builder-v1.js");
 execFileSync(process.execPath,[script,"--cards",specPath,"--all","--out-dir",dir]);
 const names=fs.readdirSync(dir);
 assert.equal(names.length,5);
 for(const n of names)assert(fs.readFileSync(path.join(dir,n),"utf8").includes("VISUAL CENTER:"));
}finally{fs.rmSync(dir,{recursive:true,force:true})}
console.log("Case002 shot-card prompt compiler: passed five independent cards.");
