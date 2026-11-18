"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const E=require("../../src/criminal/engine.js");
const A=require("../../src/criminal/archive.js");
const C=require("../../src/criminal/content.js");
const projection=require("../../campaign-criminal-archive-v1.js");
const proof=require("../../docs/criminal-operations/v2-evidence/routes.json");
for(let i=1;i<=5;i++)require("../../src/criminal/missions/cr0"+i);
function store(){
 const m=new Map(),s={reads:0,writes:0};
 return Object.assign(s,{
  getItem(k){s.reads++;return m.get(k)??null;},
  setItem(k,v){s.writes++;m.set(k,v);},
  removeItem(){s.writes++;m.delete(k);},
 });
}
function ending(id,type){
 const p=proof.missions[id].terminalProofs[type];
 let s=E.create(id,p.seed,p.attemptId,p.startedAt);
 for(const step of p.path)s=E.choose(s,step.choiceId,s.revision);
 assert.equal(s.status,"finished");
 assert.equal(s.terminalId,type);
 return s;
}
test("valid completed operations appear in read-only unified archive, no duplicate seals",()=>{
 const storage=store();
 for(const id of ["CR01","CR02","CR03","CR04","CR05"]){
  for(const type of ["clean","costly"]){
   const s=ending(id,type);
   assert.equal(A.save(storage,s).ok,true);
   assert.equal(A.recover(storage,s).ok,true);
  }
 }
 const before=storage.getItem(A.LEDGER),writes=storage.writes;
 const out=projection.snapshot(storage,A,C);
 assert.equal(out.status,"ready");
 assert.equal(out.total,10);assert.equal(out.unique,10);assert.equal(out.memories,5);
 assert.equal(out.missions.length,5);
 assert.ok(out.missions.every(m=>m.attempts===2&&m.rewards.length===2));
 assert.equal(out.history.length,8);
 assert.ok(out.history.every(s=>s.hp>=0&&s.decisions>0));
 assert.equal(storage.writes,writes);
 assert.equal(storage.getItem(A.LEDGER),before);
 // A genuinely replayed second attempt with a different ID is valid,
 // but it MUST NOT produce a second unique ending reward.
 const p=proof.missions.CR01.terminalProofs.clean;
 let repeated=E.create("CR01",p.seed,"repeat_CR01_clean",p.startedAt+10);
 for(const step of p.path) repeated=E.choose(repeated,step.choiceId,repeated.revision);
 assert.equal(E.validateState(repeated).ok,true);
 assert.equal(repeated.terminalId,"clean");
 assert.equal(A.save(storage,repeated).ok,true);
 const recovered=A.recover(storage,repeated);
 assert.equal(recovered.ok,true);
 assert.equal(recovered.awardAdded,false);
 const after=storage.getItem(A.LEDGER),priorWrites=storage.writes;
 const projectionAgain=projection.snapshot(storage,A,C);
 assert.equal(projectionAgain.total,11);
 assert.equal(projectionAgain.unique,10);
 assert.equal(projectionAgain.missions[0].attempts,3);
 assert.equal(projectionAgain.history[0].newSeal,false);
 assert.equal(storage.getItem(A.LEDGER),after);
 assert.equal(storage.writes,priorWrites);
});
test("tampered ledger is never displayed as earned progress or rewards",()=>{
 const storage=store(),s=ending("CR04","dead");
 assert.equal(A.save(storage,s).ok,true);
 assert.equal(A.recover(storage,s).ok,true);
 const l=JSON.parse(storage.getItem(A.LEDGER));
 l.rewards["CR05:samuel:clean"]="made-up-attempt";
 storage.setItem(A.LEDGER,JSON.stringify(l));
 const before=storage.getItem(A.LEDGER),writes=storage.writes;
 const data=projection.snapshot(storage,A,C);
 assert.equal(data.status,"damaged");assert.equal(data.unique,undefined);
 assert.equal(storage.getItem(A.LEDGER),before);
 assert.equal(storage.writes,writes);
});
test("unavailable storage and missing modules show warnings without invented results",()=>{
 const bad={getItem(){throw Error("Браузер запретил чтение");}};
 const s=projection.snapshot(bad,A,C);
 assert.equal(s.status,"unavailable");
 assert.equal(projection.snapshot(null,null,C).status,"unavailable");
});

test("catalog expansion preserves old saves and reward identity with two missions for one hero",()=>{
 // Synthetic fixture only; never registered by the public application.
 const fixture={...C.missions.CR01,id:"CR06",title:"Catalog fixture",
  catalog:{districtId:"balsall-heath",wave:2},awardNames:["A","B","C","D"]};
 const storage=store(),old=ending("CR01","clean");
 assert.equal(A.save(storage,old).ok,true);
 assert.equal(A.recover(storage,old).ok,true);
 const oldRaw=storage.getItem(A.key("CR01")),ledgerRaw=storage.getItem(A.LEDGER);
 C.register(fixture);
 try{
  assert.equal(C.catalog().length,6);
  assert.deepEqual(C.catalog().filter(e=>e.heroId==="jack").map(e=>e.id),["CR01","CR06"]);
  assert.deepEqual(C.catalog().filter(e=>e.districtId==="balsall-heath").map(e=>e.id),["CR01","CR06"]);
  assert.equal(A.load(storage,"CR01").kind,"valid");
  assert.equal(A.load(storage,"CR06").kind,"empty");
  assert.equal(A.ledger(storage).ok,true);
  const view=projection.snapshot(storage,A,C);
  assert.equal(view.missions.length,6);
  assert.equal(view.unique,1);
  assert.equal(storage.getItem(A.LEDGER),ledgerRaw);
  const proofPath=proof.missions.CR01.terminalProofs.clean;
  for(const attemptId of ["catalog_test_first","catalog_test_repeat"]){
   let s=E.create("CR06",proofPath.seed,attemptId,proofPath.startedAt);
   for(const step of proofPath.path)s=E.choose(s,step.choiceId,s.revision);
   assert.equal(s.terminalId,"clean");
   assert.equal(A.save(storage,s).ok,true);
   const result=A.recover(storage,s);
   assert.equal(result.ok,true);
   assert.equal(result.awardAdded,attemptId==="catalog_test_first");
  }
  assert.equal(storage.getItem(A.key("CR01")),oldRaw);
  const after=projection.snapshot(storage,A,C);
  assert.equal(after.unique,2);
  assert.equal(after.total,3);
  assert.equal(after.rewards.find(r=>r.missionId==="CR06").title,"A");
 }finally{delete C.missions.CR06;}
});
