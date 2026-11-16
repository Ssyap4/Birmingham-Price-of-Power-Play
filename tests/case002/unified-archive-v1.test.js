#!/usr/bin/env node
"use strict";
/* Pure, read-only master-archive QA: actual 5×7 Case 002 metadata, records,
 * rewards, achievement IDs and isolated Case 001 storage namespaces.
 */
const assert=require("node:assert/strict");
const bridge=require("../../campaign-case002-archive-v1.js");
const data=require("../../src/case002/browser-data-v3.js");
const engine=require("../../src/case002/engine-v3.js");
const achievements=require("../../src/case002/achievements-v1.js");
function storage(seed={}){
 const db=new Map(Object.entries(seed));let writes=0;
 return {getItem:k=>db.has(k)?db.get(k):null,
  setItem:()=>{writes++;throw Error("Read-only archive must never write")},
  removeItem:()=>{writes++;throw Error("Read-only archive must never remove")},
  get writes(){return writes},
  dump:()=>Object.fromEntries(db)};
}
const C=data.contract,A=achievements;
const rows=[];
for(const heroId of C.heroes)for(const ending of C.endings){
 const n=rows.length;
 rows.push({caseId:"002",heroId,ending:ending.id,attemptId:"complete-"+n,
  started:1700000000000+n*1000,finished:1700000000200+n*1000,
  evidence:["dispatch_manifest"],flags:{},witnesses:{ada:"protected",tommy:"detained",mercer:"located"}});
}
const keys=rows.map(r=>"002:"+r.heroId+":"+r.ending);
const achievementsRows=A.catalog.map((a,i)=>({id:a.id,hero:C.heroes[i%5],
 attemptId:"earned-"+i,scene:"P02",unlockedAt:null}));
const priorKey="birmingham_campaign_records_v1";
const priorValue='[{"caseId":"001","heroId":"jack","ending":"endingTruth"}]';
const saveKey=engine.SAVE_PREFIX+"jack";
const saved={version:3,caseId:"002",hero:"jack",attemptId:"live-jack",
 node:"P02",startedAt:1700001000000,history:[{from:"P01",to:"P02"}],
 evidence:["old_excursion_ticket"],routes:[],finished:false,ending:null};
function setup(records=rows,rewards=keys,earned=achievementsRows){
 return storage({
  [engine.RECORD_KEY]:JSON.stringify(records),
  [engine.REWARD_KEY]:JSON.stringify(rewards),
  [A.KEY]:JSON.stringify(earned),
  [saveKey]:JSON.stringify(saved),
  [priorKey]:priorValue
 });
}
const s=setup();
const before=JSON.stringify(s.dump());
const view=bridge.snapshot(s,C,engine,A,data.graph);
assert.equal(view.status,"ready");
assert.equal(view.records.status,"ready");
assert.equal(view.completed.length,35);
assert.equal(view.combos.size,35);
assert.equal(view.confirmed.size,35);
assert.equal(view.orphaned,0);
assert.equal(view.withoutSeals,0);
assert.equal(view.earned.status,"ready");
assert.equal(view.earned.items.length,18);
assert.equal(view.saves.jack.node,"P02");
assert.equal(view.saves.finn.status,"empty");
assert.equal(JSON.stringify(s.dump()),before);
assert.equal(s.writes,0);

const repeat={...rows[0],attemptId:"repeated-case2",started:1700010000000,
 finished:1700010001000};
const duplicate=bridge.snapshot(setup([...rows,repeat]),C,engine,A,data.graph);
assert.equal(duplicate.completed.length,36);
assert.equal(duplicate.combos.size,35);
assert.equal(duplicate.confirmed.size,35);
const conflict=bridge.snapshot(setup([...rows,{...rows[0],ending:"trainTruth"}]),C,engine,A,data.graph);
assert.equal(conflict.records.status,"damaged",
 "One immutable attempt cannot own two mutually exclusive finales");
assert.equal(conflict.confirmed.size,0);
const gaps=bridge.snapshot(setup(rows,keys.slice(1)),C,engine,A,data.graph);
assert.equal(gaps.confirmed.size,34);
assert.equal(gaps.withoutSeals,1,"Do not claim unrecorded reward keys");
const orphan=bridge.snapshot(setup(rows.slice(1),keys),C,engine,A,data.graph);
assert.equal(orphan.completed.length,34);
assert.equal(orphan.confirmed.size,34);
assert.equal(orphan.orphaned,1,"A key without its completion is not earned");
const otherCase=bridge.snapshot(setup([...rows,{...rows[0],caseId:"001"}]),C,engine,A,data.graph);
assert.equal(otherCase.records.status,"damaged","Do not silently import Case 001 rows");
assert.equal(otherCase.confirmed.size,0);
assert.equal(otherCase.completed.length,0);
assert.equal(otherCase.orphaned,0,
 "A damaged completion archive must not label all reward keys as orphaned");
const unsupported=bridge.snapshot(s,{...C,heroes:[]},engine,A,data.graph);
assert.equal(unsupported.status,"unavailable");
assert.equal(s.writes,0);
const wrongTime=bridge.snapshot(setup([{...rows[0],finished:0}],[],[]),C,engine,A,data.graph);
assert.equal(wrongTime.records.status,"damaged");
const unknown=bridge.snapshot(setup(rows,[...keys,"002:jack:unknown-ending"]),C,engine,A,data.graph);
assert.equal(unknown.rewards.status,"damaged");
assert.equal(unknown.confirmed.size,0);
const dupeKeys=bridge.snapshot(setup(rows,[keys[0],keys[0]]),C,engine,A,data.graph);
assert.equal(dupeKeys.rewards.status,"damaged");
const staleAch=bridge.snapshot(setup(rows,keys,[{id:"bogus",hero:"jack",attemptId:"a",scene:"P02"}]),C,engine,A,data.graph);
assert.equal(staleAch.earned.status,"damaged");
assert.equal(staleAch.earned.items.length,0);
const invalidHero=bridge.snapshot(setup(rows,keys,[{id:"eight-clues",hero:"unlisted",attemptId:"a",scene:"P02"}]),C,engine,A,data.graph);
assert.equal(invalidHero.earned.status,"damaged");
const corruptSave=setup();corruptSave.dump;
const invalidSaved=storage({...s.dump(),[saveKey]:"{not-json"});
assert.equal(bridge.snapshot(invalidSaved,C,engine,A,data.graph).saves.jack.status,"damaged");
assert.equal(invalidSaved.getItem(saveKey),"{not-json");
const inaccessible=bridge.snapshot(null,C,engine,A,data.graph);
assert.equal(inaccessible.records.status,"unavailable");
assert.equal(inaccessible.rewards.status,"unavailable");
assert.equal(inaccessible.earned.status,"unavailable");
assert.equal(inaccessible.confirmed.size,0);
assert.equal(s.getItem(priorKey),priorValue);
assert.equal(s.writes,0);
console.log("PASS unified Case 002 archive: 35 unique heroes×endings, 18 actual achievements, replay, orphan keys, damaged data, save states and strict zero-write safety");
