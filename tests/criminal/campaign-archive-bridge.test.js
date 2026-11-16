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
 const repeat=ending("CR01","clean");
 // A second run with same ending and hero but unique attemptId => no second seal.
 const duplicate={...repeat,attemptId:"different"};
 // validateState rejects tampering with the completed attempt, so no award may be forged.
 assert.equal(E.validateState(duplicate).ok,false);
 assert.equal(projection.snapshot(storage,A,C).unique,10);
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
