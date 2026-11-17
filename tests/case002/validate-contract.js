#!/usr/bin/env node
/* Planning-only validation of Case 002 outcome contract.
 * This tests design constraints; it does NOT claim the game's scene engine exists.
 * Run: node tests/case002/validate-contract.js
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const spec=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../docs/case002/case002-contract-v1.json"),"utf8"));
const unique=a=>new Set(a).size===a.length;
const factsFor=ids=>Object.fromEntries(Object.entries(spec.deductionRules).map(([fact,alternatives])=>
 [fact,alternatives.some(pair=>pair.every(id=>ids.has(id)))]));
const safeCount=st=>Object.values(st.witnesses).filter(x=>x==="protected"||x==="evacuated").length;
function available(e,st){
 if(st.health<=0 && e.id!=="trainDeath")return false;
 if(e.id!=="trainDeath" && !st.flags.chapterAtLeastV)return false;
 const facts=factsFor(st.evidence);
 return e.requiresFacts.every(f=>facts[f])&&e.requiresFlags.every(f=>st.flags[f]===true)&&
 safeCount(st)>=e.minSafe && (e.requiresHealthLte===undefined||st.health<=e.requiresHealthLte);
}
function sample(e,hero){
 const ids=new Set();
 for(const fact of e.requiresFacts)for(const id of spec.deductionRules[fact][0])ids.add(id);
 const witnesses={ada:"missing",tommy:"detained",mercer:"located"};
 const order=spec.witnessIds;
 for(let i=0;i<e.minSafe;i++)witnesses[order[i]]="protected";
 const flags={chapterAtLeastV:true};
 for(const f of e.requiresFlags)flags[f]=true;
 return {hero,health:e.id==="trainDeath"?0:100,witnesses,evidence:ids,flags};
}
assert.equal(spec.caseId,"002");
assert.equal(spec.status,"planning-only");
assert.equal(spec.heroes.length,5);
assert.equal(spec.endings.length,7);
assert(unique(spec.heroes)&&unique(spec.witnessIds)&&unique(spec.supportedEvidence));
assert(unique(spec.endings.map(e=>e.id)));
assert.equal(spec.endings.filter(x=>x.alwaysFallback).length,1);
const all=new Set(spec.supportedEvidence);
for(const variants of Object.values(spec.deductionRules)){
 assert(variants.length>=2,"critical deduction needs alternate evidence pairs");
 for(const pair of variants){
  assert.equal(pair.length,2);
  assert.notEqual(pair[0],pair[1]);
  for(const id of pair)assert(all.has(id),"undefined evidence: "+id);
 }
}
for(const ending of spec.endings){
 for(const f of ending.requiresFacts)assert(spec.deductionRules[f]);
 assert(ending.minSafe>=0&&ending.minSafe<=3);
}
let positives=0,negatives=0;
for(const hero of spec.heroes){
 for(const ending of spec.endings){
  const st=sample(ending,hero);
  assert(available(ending,st),"positive ending route "+hero+"/"+ending.id);
  positives++;
  if(ending.id!=="trainDeath"){
   const noChapter={...st,flags:{...st.flags,chapterAtLeastV:false}};
   assert(!available(ending,noChapter));negatives++;
   const dead={...st,health:0};
   assert(!available(ending,dead));negatives++;
  }else{
   const alive={...st,health:100};
   assert(!available(ending,alive));negatives++;
  }
  for(const flag of ending.requiresFlags){
   const without={...st,flags:{...st.flags,[flag]:false}};
   assert(!available(ending,without),"missing flag "+flag);negatives++;
  }
  if(ending.minSafe>0){
   const none={...st,witnesses:{ada:"missing",tommy:"detained",mercer:"located"}};
   assert(!available(ending,none),"witnesses can't be invented");negatives++;
  }
 }
}
// Nonlinear story never softlocks at final chapter: explicit withdrawal is always permitted.
const exit=spec.endings.find(x=>x.id==="trainEscape");
assert(available(exit,{health:100,flags:{chapterAtLeastV:true},evidence:new Set(),witnesses:{ada:"missing",tommy:"detained",mercer:"located"}}));
assert(!available(exit,{health:0,flags:{chapterAtLeastV:true},evidence:new Set(),witnesses:{ada:"missing",tommy:"detained",mercer:"located"}}));
console.log("PASS: "+positives+" planned hero×ending paths, "+negatives+" guards, 7 unique outcomes, no dead-end at finale.");
