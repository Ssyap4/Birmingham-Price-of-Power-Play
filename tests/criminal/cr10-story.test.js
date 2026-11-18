"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const C=require("../../src/criminal/content.js"),E=require("../../src/criminal/engine.js"),A=require("../../src/criminal/archive.js"),ep=require("../../src/criminal/epilogues.js");
require("../../src/criminal/missions/cr10.js");
const M=C.missions.CR10;
const run=(path,seed=0,id="cr10_test_route")=>{let s=E.create("CR10",seed,id,1);for(const key of path){assert.ok(E.availability(s,key),s.sceneId+":"+key);s=E.choose(s,key,s.revision);}assert.ok(E.validateState(s).ok);return s;};
const clean=["accept","foreman","floor","assess","observe","confirm","compare","review","pause","clear","verify","sign","finish"];
const cost=["accept","manager","rush","rush","deal","guarantee","finish"];
const refused=["accept","foreman","promise","review","pause","withdraw","return"];
const late=["accept","foreman","floor","log","record","observe","confirm","complete","review","pause","talk","basis","clear","verify","cost","guarantee","finish"];
test("CR10 explicit routes distinguish observation, pause, worker exit, review and accepted report",()=>{
 const good=run(clean),bad=run(cost),walk=run(refused),over=run(late);
 assert.equal(good.terminalId,"clean");assert.ok(good.flags.log&&good.flags.observed&&good.flags.witness&&good.flags.records&&good.flags.paused&&good.flags.clear&&good.flags.review&&good.flags.agreed);
 assert.equal(bad.terminalId,"costly");assert.ok(bad.flags.pressureDeal&&bad.flags.circleCost&&!bad.flags.review&&!bad.flags.clear);
 assert.equal(walk.terminalId,"failed");assert.ok(walk.flags.paused&&!walk.flags.clear&&!walk.flags.agreed);
 assert.equal(over.terminalId,"failed");assert.ok(over.flags.accepted&&over.stats.time>23);
 for(const s of [good,bad,walk,over])assert.equal(ep.describe(s).length,2);
 assert.equal(C.awardName("CR10","clean"),"Смена без потерь");
 assert.equal(Object.keys(M.scenes).length,20);assert.equal(Object.values(M.scenes).flatMap(x=>x.choices).length,54);
});
test("CR10 seeded actual engine routes cover every choice, all endings and safety invariants",()=>{
 const nodes=new Set(),choices=new Set(),ends=new Set();let late=0,boundary=0,healed=0,clean=0,dead=0;
 for(let k=0;k<6000;k++){
  let s=E.create("CR10",k,"cr10_seed_"+k,1),r=k+1;
  for(let i=0;i<32&&s.status==="active";i++){
   nodes.add(s.sceneId);const a=E.choices(s).filter(x=>x.available);if(E.availability(s,"heal"))a.push({id:"heal"});assert.ok(a.length,s.sceneId);
   r=(Math.imul(r,1664525)+1013904223)>>>0;const c=a[Math.floor(r/4294967296*a.length)];choices.add(s.sceneId+":"+c.id);if(c.id==="heal")healed++;
   s=E.choose(s,c.id,s.revision);
   if(s.flags.clear)assert.ok(s.flags.paused);
   if(s.flags.review)assert.ok(s.flags.clear&&s.flags.paused&&s.flags.agreed&&s.flags.log&&s.flags.observed&&s.flags.witness&&s.flags.records);
  }
  assert.equal(s.status,"finished");assert.ok(E.validateState(s).ok);ends.add(s.terminalId);
  if(s.terminalId==="clean"||s.terminalId==="costly")assert.ok(s.flags.agreed&&s.flags.accepted&&s.stats.time<=23);
  if(s.terminalId==="clean"){clean++;assert.ok(s.flags.review&&s.flags.clear&&!s.flags.pressureDeal&&!s.flags.circleCost&&!s.flags.rushed&&!s.flags.force);}
  if(s.flags.accepted&&s.stats.time>23&&s.hp>0){late++;assert.equal(s.terminalId,"failed");}
  if(s.objective&&s.stats.time===23)boundary++;
  if(s.terminalId==="dead"){dead++;assert.equal(s.hp,0);}
 }
 const missing=Object.entries(M.scenes).flatMap(([id,n])=>n.choices.map(c=>id+":"+c.id)).filter(x=>!choices.has(x));
 console.log("coverage",nodes.size,choices.size,"missing",missing,"ends",[...ends],"late",late,"boundary",boundary,"heal",healed,"clean",clean,"dead",dead);
 assert.deepEqual(missing,[]);assert.equal(nodes.size,20);assert.equal(ends.size,4);assert.ok(late&&boundary&&healed&&clean&&dead);
});
test("CR10 save replay and unique reward",()=>{
 const data=new Map(),store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 for(const [id,wanted] of [["cr10_save_first",true],["cr10_save_repeat",false]]){const s=run(clean,0,id);assert.ok(A.save(store,s).ok);const r=A.recover(store,s);assert.ok(r.ok);assert.equal(r.awardAdded,wanted);}
});
