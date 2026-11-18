"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const C=require("../../src/criminal/content.js"),E=require("../../src/criminal/engine.js"),A=require("../../src/criminal/archive.js"),ep=require("../../src/criminal/epilogues.js");
require("../../src/criminal/missions/cr09.js");
const M=C.missions.CR09;
const run=(path,seed=0,id="cr09_test_route")=>{let s=E.create("CR09",seed,id,1);for(const key of path){assert.ok(E.availability(s,key),s.sceneId+":"+key);s=E.choose(s,key,s.revision);}assert.ok(E.validateState(s).ok);return s;};
const clean=["accept","hostess","respect","listen","verify","neutral","reconcile","honest","confirm","neutral","sign","finish"];
const guarantee=["accept","hostess","respect","draft","guarantee","reconcile","honest","confirm","guarantee","sign","finish"];
const pledge=["accept","merchant","promise","private","pledgeRival","honest","confirm","disclose","acknowledge","finish"];
const refused=["accept","rival","promise","draft","neutral","reconcile","insist","leave","return"];
test("CR09 explicit routes require two genuine signatures, preserve prior obligations",()=>{
 const good=run(clean),cost=run(guarantee),conflict=run(pledge),walk=run(refused);
 assert.equal(good.terminalId,"clean");assert.ok(good.flags.ledger&&good.flags.receipt&&good.flags.merchantSigned&&good.flags.rivalSigned&&good.flags.neutralSigned&&!good.flags.circlePledge);
 assert.equal(cost.terminalId,"costly");assert.ok(cost.flags.circlePledge&&cost.flags.guaranteeSigned);
 assert.equal(conflict.terminalId,"costly");assert.ok(conflict.flags.merchantPledge&&conflict.flags.rivalPledge&&conflict.flags.disclosed&&conflict.flags.guaranteeSigned);
 assert.equal(walk.terminalId,"failed");assert.ok(!walk.flags.merchantSigned&&!walk.flags.rivalSigned&&walk.flags.rivalPledge);
 const pre=run(pledge.slice(0,-3));assert.equal(pre.sceneId,"revision");assert.equal(E.availability(pre,"neutral"),false);assert.equal(E.availability(pre,"guarantee"),false);
 for(const s of [good,cost,conflict,walk])assert.equal(ep.describe(s).length,2);
 assert.equal(Object.keys(M.scenes).length,20);assert.equal(Object.values(M.scenes).flatMap(s=>s.choices).length,54);
 assert.equal(C.awardName("CR09","clean"),"Две подписи");
});
test("CR09 seeded actual engine routes cover choices, four endings, deadline and agreement invariants",()=>{
 const nodes=new Set(),choices=new Set(),ends=new Set();let late=0,boundary=0,healed=0,cleanCount=0,dead=0;
 for(let k=0;k<6000;k++){
  let s=E.create("CR09",k,"cr09_seed_"+k,1),r=k+1;
  for(let i=0;i<30&&s.status==="active";i++){
   nodes.add(s.sceneId);const a=E.choices(s).filter(x=>x.available);if(E.availability(s,"heal"))a.push({id:"heal"});assert.ok(a.length,s.sceneId);
   r=(Math.imul(r,1664525)+1013904223)>>>0;const c=a[Math.floor((r/4294967296)*a.length)];choices.add(s.sceneId+":"+c.id);if(c.id==="heal")healed++;
   s=E.choose(s,c.id,s.revision);
   assert.equal(!!s.flags.merchantSigned,!!s.flags.rivalSigned);
   if(s.flags.merchantSigned)assert.ok(s.flags.mediator&&(!!s.flags.neutralSigned!==!!s.flags.guaranteeSigned));
  }
  assert.equal(s.status,"finished");assert.ok(E.validateState(s).ok);ends.add(s.terminalId);
  if(s.terminalId==="clean"||s.terminalId==="costly")assert.ok(s.flags.merchantSigned&&s.flags.rivalSigned&&s.flags.accepted&&s.stats.time<=22);
  if(s.terminalId==="clean"){cleanCount++;assert.ok(s.flags.neutralSigned&&s.flags.ledger&&s.flags.receipt&&s.flags.merchantHeard&&s.flags.rivalHeard&&!s.flags.circlePledge&&!s.flags.merchantPledge&&!s.flags.rivalPledge&&!s.flags.coerced&&!s.flags.cashSpent);}
  if(s.flags.accepted&&s.stats.time>22&&s.hp>0){late++;assert.equal(s.terminalId,"failed");}
  if(s.objective&&s.stats.time===22)boundary++;
  if(s.terminalId==="dead"){dead++;assert.equal(s.hp,0);}
 }
 const missing=Object.entries(M.scenes).flatMap(([id,n])=>n.choices.map(c=>id+":"+c.id)).filter(x=>!choices.has(x));
 console.log("coverage",nodes.size,choices.size,"missing",missing,"ends",[...ends],"late",late,"boundary",boundary,"heal",healed,"clean",cleanCount,"dead",dead);
 assert.deepEqual(missing,[]);assert.equal(nodes.size,20);assert.equal(ends.size,4);assert.ok(late&&boundary&&healed&&cleanCount&&dead);
});
test("CR09 save replay, equipment debit and unique award",()=>{
 const data=new Map(),store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 for(const [id,wanted] of [["cr09_save_first",true],["cr09_save_repeat",false]]){const s=run(clean,0,id);assert.ok(A.save(store,s).ok);const r=A.recover(store,s);assert.ok(r.ok);assert.equal(r.awardAdded,wanted);}
 const rent=run(["accept","hostess","rent","listen","verify","neutral","reconcile","honest","confirm","neutral","sign","finish"]);assert.equal(rent.inventory.cash,1);assert.equal(rent.terminalId,"costly");
});
