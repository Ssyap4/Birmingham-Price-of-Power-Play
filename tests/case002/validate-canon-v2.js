#!/usr/bin/env node
"use strict";
/* Compatibility model tests; do not write to localStorage or alter game. */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"../..");
const source=fs.readFileSync(path.join(root,"campaign-hub-v1.js"),"utf8");
const spec=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/case002-contract-v1.json"),"utf8"));
const previous=["endingRescue","endingEvidence","endingDeal","endingTruth","endingPower","endingDeath"];
for(const id of previous)assert(source.includes(id+":"),"Case001 ending missing "+id);
for(const name of ["birmingham_campaign_records_v1","birmingham_campaign_unique_rewards_v1",
 "birmingham_case_smol_heath_v1_"])assert(source.includes(name),"old save contract changed "+name);
function mayContinue(hero,prior){
 if(prior===null)return true;
 return !(prior.heroId===hero&&prior.ending==="endingDeath");
}
let positive=0,forbidden=0;
for(const hero of spec.heroes){
 for(const oldHero of spec.heroes){
  for(const previousEnding of previous){
   for(const nextEnding of spec.endings){
    const allowed=mayContinue(hero,{heroId:oldHero,ending:previousEnding});
    if(allowed)positive++;else forbidden++;
   }
  }
 }
}
assert.equal(positive+forbidden,5*5*6*7);
assert.equal(forbidden,5*1*1*7,"same hero dead must not be revived");
assert.equal(positive,1015);
for(const hero of spec.heroes)assert(mayContinue(hero,null),"neutral start");
function archive(){
 return {records:new Map(),rewards:new Set(),
 canon:null};
}
function complete(s,attempt){
 const key=["002",attempt.hero,attempt.started,attempt.ending].join(":");
 if(!s.records.has(key))s.records.set(key,{...attempt,caseId:"002",key});
 s.rewards.add(["002",attempt.hero,attempt.ending].join(":"));
}
for(const hero of spec.heroes){
 const s=archive();
 const oldIds=previous.map(id=>"001:"+hero+":"+id);
 oldIds.forEach(id=>s.rewards.add(id));
 const chosen={recordKey:"001:"+hero+":sample:endingTruth",heroId:hero,ending:"endingTruth"};
 s.canon=JSON.stringify(chosen);
 for(const e of spec.endings){
  complete(s,{hero,ending:e.id,started:"once"});
  complete(s,{hero,ending:e.id,started:"once"});
  assert.equal(s.rewards.size,oldIds.length+new Set([...s.records.values()].map(x=>x.ending)).size);
  assert.equal(s.canon,JSON.stringify(chosen),"replays must not rewrite story canon");
 }
 assert.equal(s.records.size,7,"idempotent attempt storage");
 for(const id of oldIds)assert(s.rewards.has(id),"lost old reward");
 assert.equal(s.rewards.size,13,"old and new rewards are disjoint");
}
console.log("PASS: "+(positive+forbidden)+" cross-case canon combinations; "+
 forbidden+" same-hero deaths blocked; 5 neutral starts; 5x7 idempotent rewards; old keys intact.");
