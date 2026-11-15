#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
const engine=require("../../src/case002/engine-v3.js");
const achievements=require("../../src/case002/achievements-v1.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
const fakeStore=()=>{const values=new Map();return {
 getItem:k=>values.has(k)?values.get(k):null,
 setItem:(k,v)=>values.set(k,v),
 values};};
assert.equal(achievements.catalog.length,18);
assert.equal(new Set(achievements.catalog.map(a=>a.id)).size,18);
const store=fakeStore();
const e=engine.createEngine({graph,contract,hero:"jack",store:null,attemptId:"achievements-jack"});
assert.deepEqual(achievements.eligible(e.view(),contract),[],
 "Starting a case without an action must not award trivial achievements");
assert.deepEqual(achievements.read(store).items,[]);
let unlocked=[];
for(const [from,to,action] of goodRoute("jack","trainEscape").actionLog){
 assert.equal(e.snapshot().node,from);
 e.choose(to,action);
 const before=JSON.stringify(e.snapshot());
 const result=achievements.grant(store,e.view(),contract,[]);
 assert.equal(result.status,"ready");
 assert.equal(JSON.stringify(e.snapshot()),before,"Grant must not alter the engine state");
 unlocked.push(...result.newly.map(a=>a.id));
}
assert(unlocked.length>0,"A long genuine investigation must earn milestones");
assert(unlocked.includes("two-tracks"),"Two actual routes need an achievement");
assert(unlocked.includes("wagon-diversion"),"Verified wagon proof needs an achievement");
assert(!unlocked.includes("ada-shelter"),"A missing Ada cannot be claimed safe");
assert(!unlocked.includes("five-detectives"),"One hero cannot unlock all heroes");
const firstCount=achievements.read(store).items.length;
assert.equal(new Set(unlocked).size,firstCount,"Every achievement can only be granted once");
assert.equal(achievements.grant(store,e.view(),contract,[]).newly.length,0,
 "Replaying a completed snapshot must never mint an achievement twice");
assert.equal(achievements.read(store).items.length,firstCount);
const readOnly=store.getItem(achievements.KEY);
achievements.read(store);achievements.eligible(e.view(),contract);
assert.equal(store.getItem(achievements.KEY),readOnly,"Opening catalog must be read-only");
const mer=engine.createEngine({graph,contract,hero:"jack",attemptId:"mercer-guard"});
for(const [from,to,action] of goodRoute("jack","trainTruth").actionLog)mer.choose(to,action);
assert(achievements.eligible(mer.view(),contract).includes("two-safe"),
 "At least two actual protected witnesses unlock the protection milestone");
const endings=contract.endings.slice(0,3).map((v,i)=>({
 caseId:"002",heroId:contract.heroes[i],ending:v.id
}));
const milestone=achievements.grant(store,e.view(),contract,endings);
assert(milestone.newly.some(x=>x.id==="three-outcomes"),
 "Three actual recorded different endings must count");
assert(!milestone.newly.some(x=>x.id==="five-detectives"));
const five=contract.heroes.map((heroId,i)=>({
 caseId:"002",heroId,ending:contract.endings[i%contract.endings.length].id
}));
assert(achievements.grant(store,e.view(),contract,five).newly
 .some(x=>x.id==="five-detectives"));
assert.equal(achievements.grant(store,e.view(),contract,five).newly.length,0);
const corrupt=fakeStore();corrupt.setItem(achievements.KEY,"{broken");
const previous=corrupt.getItem(achievements.KEY);
assert.equal(achievements.grant(corrupt,e.view(),contract,[]).status,"damaged");
assert.equal(corrupt.getItem(achievements.KEY),previous,
 "Never overwrite damaged archives with an empty collection");
// Even a non-throwing storage write may be lost.
const dropped=fakeStore();
const silent={getItem:dropped.getItem,setItem:()=>{}};
const rejected=achievements.grant(silent,e.view(),contract,[]);
assert.equal(rejected.status,"unavailable");
assert.deepEqual(rejected.newly,[],"Never announce a lost achievement");
assert.equal(dropped.getItem(achievements.KEY),null);
assert(achievements.grant(dropped,e.view(),contract,[]).newly.length>0,
 "The achievement must remain earnable after storage recovers");
assert.deepEqual(achievements.grant(dropped,e.view(),contract,[]).newly,[]);
const staleReads=fakeStore();let reads=0;
const stale={getItem:k=>++reads===2?null:staleReads.getItem(k),
 setItem:(k,v)=>staleReads.setItem(k,v)};
assert.deepEqual(achievements.grant(stale,e.view(),contract,[]).newly,[],
 "An unconfirmed read-back cannot trigger a popup");
assert.equal(achievements.read(staleReads).status,"ready");

// 35 real completed routes sharing one durable archive: five protagonists,
// seven endings, idempotent mastery and reward replay across hero saves.
const shared=fakeStore(),seen=new Set();let transitions=0;
for(const hero of contract.heroes)for(const ending of contract.endings){
 const g=engine.createEngine({graph,contract,hero,store:shared,
  attemptId:"ledger-"+hero+"-"+ending.id,now:()=>1700000000000});
 for(const [from,to,action] of goodRoute(hero,ending.id).actionLog){
  assert.equal(g.snapshot().node,from);
  g.choose(to,action);
  const complete=JSON.parse(shared.getItem(engine.RECORD_KEY)||"[]");
  const receipt=achievements.grant(shared,g.view(),contract,complete);
  assert.equal(receipt.status,"ready",hero+"/"+ending.id);
  for(const milestone of receipt.newly){
   assert(!seen.has(milestone.id),"Duplicate milestone "+milestone.id);
   seen.add(milestone.id);
  }
  transitions++;
 }
 assert(g.snapshot().finished);
 assert.equal(g.snapshot().ending,ending.id);
}
const sharedRecords=JSON.parse(shared.getItem(engine.RECORD_KEY));
const sharedRewards=JSON.parse(shared.getItem(engine.REWARD_KEY));
const milestoneArchive=achievements.read(shared);
assert.equal(sharedRecords.length,35);
assert.equal(new Set(sharedRecords.map(x=>x.attemptId)).size,35);
assert.equal(sharedRewards.length,35);
assert.equal(new Set(sharedRewards).size,35);
assert.equal(milestoneArchive.status,"ready");
assert.equal(milestoneArchive.items.length,seen.size);
assert(seen.has("three-outcomes")&&seen.has("five-detectives"));
const repeat=engine.createEngine({graph,contract,hero:"jack",store:shared,
 attemptId:"ledger-replay-jack"});
for(const [from,to,action] of goodRoute("jack","trainEscape").actionLog){
 assert.equal(repeat.snapshot().node,from);repeat.choose(to,action);
 const complete=JSON.parse(shared.getItem(engine.RECORD_KEY)||"[]");
 assert.deepEqual(achievements.grant(shared,repeat.view(),contract,complete).newly,[]);
}
assert.equal(JSON.parse(shared.getItem(engine.RECORD_KEY)).length,36,
 "Repeated completed attempts remain in history");
assert.equal(JSON.parse(shared.getItem(engine.REWARD_KEY)).length,35,
 "Repeated outcome must never create a second unique seal");
const resumed=engine.createEngine({graph,contract,hero:"jack",store:shared});
resumed.load();resumed.flushCompletion();
assert.equal(JSON.parse(shared.getItem(engine.RECORD_KEY)).length,36);
assert.equal(JSON.parse(shared.getItem(engine.REWARD_KEY)).length,35);
const denied={getItem:()=>null,setItem:()=>{throw Error("Denied")}};
assert.equal(achievements.grant(denied,e.view(),contract,[]).newly.length,0);
assert.equal(achievements.read(null).status,"unavailable");
console.log("PASS 18 Case002 achievements: "+transitions+
 " persisted transitions, 35 distinct hero/outcome keys, replay and resume idempotence, storage read-back safety.");
