#!/usr/bin/env node
"use strict";
/* Case 002 deductions must reflect only the clues the player owns as knowledge.
 * No suspect reveal on a single unverified trace; no hidden future IDs.
 */
const assert=require("node:assert/strict");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {board,NAMES}=require("../../src/case002/deduction-board-v1.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
const expected=Object.keys(contract.deductionRules);
assert.deepEqual(Object.keys(NAMES),expected);
assert.deepEqual(board(contract,[]),[],"No early case spoilers");
assert.deepEqual(board(contract,["old_excursion_ticket"]),[],"Unrelated ticket is not a fabricated deduction");
const first=board(contract,["hale_coat"]);
assert.equal(first.length,1);
assert.equal(first[0].id,"provedHaleMurder");
assert.equal(first[0].verified,false);
assert.equal(first[0].title,"Следы у кирпичного виадука");
assert(!first[0].title.includes("Брэкетт"));
assert.deepEqual(first[0].knownEvidence,["hale_coat"]);
assert.deepEqual(first[0].relatedEvidence,["hale_coat"]);
assert.deepEqual(first[0].proofChains,[],"Unverified lead cannot claim complete proof");
const confirmed=board(contract,["hale_coat","brackett_wire"]);
assert.equal(confirmed.length,1);
assert.equal(confirmed[0].verified,true);
assert.equal(confirmed[0].title,"Убийство Хейла Брэкеттом");
assert.deepEqual(confirmed[0].proofChains,[["hale_coat","brackett_wire"]]);
assert.throws(()=>board(contract,["invented_note"]),/Invalid/);
assert.throws(()=>board(contract,["hale_coat","hale_coat"]),/Invalid/);
let checks=0,proved=0,unproved=0;const touched=new Set();
for(const hero of contract.heroes)for(const ending of contract.endings){
 const engine=createEngine({graph,contract,hero,attemptId:"deduction-"+hero+"-"+ending.id});
 const test=()=>{
  const state=engine.snapshot(),view=engine.view(),rows=board(contract,state.evidence);
  const actual=new Set(state.evidence);
  for(const row of rows){
   assert(expected.includes(row.id));
   assert(actual.size>0);
   assert.equal(row.verified,view.facts[row.id],
     "UI contradicts actual engine deduction for "+row.id);
   assert(row.knownEvidence.length>0);
   assert(row.knownEvidence.every(id=>actual.has(id)));
   assert(row.relatedEvidence.every(id=>actual.has(id)));
   if(row.verified){
     assert(row.proofChains.length>0);
     assert(row.proofChains.some(pair=>pair.every(id=>actual.has(id))));
     assert.equal(row.status,"ДОКАЗАНО");proved++;
   }else{
     assert.equal(row.proofChains.length,0);
     assert.equal(row.status,"ЗАЦЕПКА");
     assert(!row.title.includes("Брэкеттом"),
       "Murderer must not be named until the murderer proof is verified");
     unproved++;
   }
   touched.add(row.id);
  }
  for(const id of expected){
   const relevant=contract.deductionRules[id].flat().some(key=>actual.has(key));
   assert.equal(rows.some(row=>row.id===id),relevant,
    "Incomplete board incorrectly leaked or hid clue "+id);
  }
  checks++;
 };
 test();
 for(const [from,to,action] of goodRoute(hero,ending.id).actionLog){
   assert.equal(engine.snapshot().node,from);
   engine.choose(to,action);
   test();
 }
}
assert.equal(touched.size,6,"All real conclusion types must be reachable");
assert(checks>=1700);
console.log("PASS Case002 spoiler-free deduction board: "+checks+
 " actual case states over 35 endings, "+proved+" proven and "+unproved+
 " partial observations, six genuine deduction groups, zero unearned suspect reveals.");
