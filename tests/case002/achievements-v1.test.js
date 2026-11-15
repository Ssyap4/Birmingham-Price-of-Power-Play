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
const denied={getItem:()=>null,setItem:()=>{throw Error("Denied")}};
assert.equal(achievements.grant(denied,e.view(),contract,[]).newly.length,0);
assert.equal(achievements.read(null).status,"unavailable");
console.log("PASS 18 Case002 achievements: actual routes, proof, witnesses, 3 endings/5 heroes, no duplicates, read-only gallery and damaged-storage safety.");
