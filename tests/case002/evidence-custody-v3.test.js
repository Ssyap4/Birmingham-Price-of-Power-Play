#!/usr/bin/env node
"use strict";
/* Custody tests for Case 002: 'saw it' must not mean 'still holding it'.
   No changes to Case 001 storage and no public rewards are written. */
const assert=require("node:assert/strict");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
function store(){
 const map=new Map();
 return {getItem:k=>map.has(k)?map.get(k):null,setItem:(k,v)=>map.set(k,String(v))};
}
function engine(hero="jack",storage=null){return createEngine({graph,contract,hero,store:storage,
 attemptId:"custody-"+hero,now:()=>1700000000000});}
let assertions=0;
// Records are not physical originals in the hero's pocket.
{
 const g=engine("finn");
 for(const node of ["P02","A01","A03","A06","A08","A10","B01","B02","HF01"])
  g.choose(node);
 g.choose("B04","copyManifest");
 const snapshot=g.snapshot();
 const meta=snapshot.evidenceLedger.dispatch_manifest;
 assert(meta && meta.form==="certified-copy"&&meta.originalHolder==="railway");
 assert.equal(meta.holder,"hero");
 assert.equal(meta.source,"HF01");
 assert.deepEqual(g.view().evidenceDossier.find(x=>x.id==="dispatch_manifest").holder,"hero");
 assertions+=4;
}
// Giving the only verified Brackett accounts copy to workers retains knowledge
// of the criminal network but removes the physical leverage for a power ending.
{
 const storage=store(),g=engine("jack",storage);
 for(const [from,to,action] of goodRoute("jack","trainControl").actionLog){
  if(from==="E09"&&to==="E10")break;
  assert.equal(g.snapshot().node,from);
  g.choose(to,action);
 }
 assert.equal(g.snapshot().node,"E09");
 assert.equal(g.snapshot().flags.brackettAccountsHeld,true);
 assert.equal(g.snapshot().evidenceLedger.brackett_accounts.holder,"hero");
 const choice=g.availableChoices().find(x=>x.to==="E10"&&x.action==="passAccountsToWorkers");
 assert(choice && choice.enabled);
 g.choose("E10","passAccountsToWorkers");
 assert.equal(g.snapshot().flags.accountsGivenToWorkers,true);
 assert.equal(g.snapshot().flags.brackettAccountsHeld,false);
 assert.equal(g.snapshot().evidenceLedger.brackett_accounts.holder,"workers");
 assert(g.snapshot().evidence.includes("brackett_accounts"),
  "learned facts and provenance stay recorded after transfer");
 assert(g.facts().provedBrackettNetwork,
  "independently verified known facts can remain usable for formal case");
 for(const to of ["E11","F01","F02","F03","F04","F05","F06","F08","F09"])g.choose(to);
 assert.equal(g.availableChoices().find(x=>x.to==="Z06").enabled,false);
 assert.equal(g.availableChoices().find(x=>x.to==="Z02").enabled,true);
 assert.throws(()=>g.choose("Z06"),/Ending requirements/);
 g.choose("Z02");
 assert.equal(g.snapshot().ending,"trainEscape");
 const records=JSON.parse(storage.getItem(g.recordKey));
 assert.equal(records.length,1);
 assert.equal(records[0].evidenceLedger.brackett_accounts.holder,"workers");
 assert.equal(JSON.parse(storage.getItem(g.rewardKey)).length,1,
   "The draft-only ending index remains separate from public rewards");
 assertions+=15;
}
// Legacy draft v3 saves had evidence IDs but not a custody ledger.
// The read migration reconstructs conservative records without touching Case 001.
{
 const storage=store(),g=engine("jack",storage);
 for(const to of ["P02","A01","A03","A06","A08","A10","B01","B02","B03"])g.choose(to);
 const old=JSON.parse(storage.getItem(g.storageKey));
 delete old.evidenceLedger;
 storage.setItem(g.storageKey,JSON.stringify(old));
 const reopened=engine("jack",storage);
 reopened.load();
 assert.equal(reopened.snapshot().evidenceLedger.dispatch_manifest.source,"legacy-save");
 assert.equal(reopened.snapshot().evidenceLedger.dispatch_manifest.holder,"hero");
 assert.equal(reopened.snapshot().evidence.length,old.evidence.length);
 // Corrupt custody metadata MUST be rejected rather than silently overwritten.
 const corrupted=reopened.snapshot();
 corrupted.evidenceLedger.dispatch_manifest.holder="unknown";
 storage.setItem(g.storageKey,JSON.stringify(corrupted));
 const again=engine("jack",storage);
 assert.throws(()=>again.load(),/Invalid evidence origin/);
 assertions+=4;
}
console.log("PASS Case 002 evidence custody: "+assertions+
 " checks, safe account handover, no false power ending, conservative v3 save migration.");
