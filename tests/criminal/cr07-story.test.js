"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const C=require("../../src/criminal/content.js"),E=require("../../src/criminal/engine.js"),A=require("../../src/criminal/archive.js");
const ep=require("../../src/criminal/epilogues.js");
require("../../src/criminal/missions/cr07.js");
const M=C.missions.CR07;
const run=(path,seed=0,id="cr07_test_route")=>{let s=E.create("CR07",seed,id,1);for(const key of path){assert.ok(E.availability(s,key),s.sceneId+":"+key);s=E.choose(s,key,s.revision);}assert.ok(E.validateState(s).ok);return s;};
const clean=["accept","clerk","respect","cabinet","read","confirm","limited","refuse","prepare","agree","submit","finish"];
const costly=["accept","owner","deal","take","copy","deal","limited","finish"];
const exposed=["accept","dockman","listen","names","take","full","refuse","full","full","full","finish"];
const refused=["accept","owner","question","cabinet","leave","full","argue","leave","return"];
test("CR07 explicit routes, evidence, consent, non-disclosure",()=>{
 const good=run(clean),bad=run(costly),leak=run(exposed),walk=run(refused);
 assert.equal(good.terminalId,"clean");assert.ok(good.flags.originalSeen&&good.flags.provenance&&good.flags.voluntary&&good.flags.limited);assert.ok(!good.flags.exposed);
 assert.equal(bad.terminalId,"costly");assert.ok(bad.flags.ownerDeal&&!bad.flags.provenance);
 assert.equal(leak.terminalId,"costly");assert.ok(leak.flags.exposed&&!leak.flags.voluntary);
 assert.equal(walk.terminalId,"failed");assert.ok(walk.flags.refused);
 for(const s of [good,bad,leak,walk])assert.equal(ep.describe(s).length,2);
 assert.equal(C.awardName("CR07","clean"),"Закрытое имя");
 assert.equal(Object.keys(M.scenes).length,20);
 assert.equal(Object.values(M.scenes).flatMap(s=>s.choices).length,55);
});
test("CR07 genuine engine exploration: all nodes, decisions, endings, deadline, no fabricated clean result",()=>{
 const nodes=new Set(),choices=new Set(),ends=new Set();let late=0,boundary=0,healed=0;
 for(let k=0;k<6000;k++){
  let s=E.create("CR07",k,"cr07_seed_"+k,1),r=k+1;
  for(let i=0;i<30&&s.status==="active";i++){
   nodes.add(s.sceneId);const a=E.choices(s).filter(x=>x.available);if(E.availability(s,"heal"))a.push({id:"heal"});assert.ok(a.length,s.sceneId);
   r=(Math.imul(r,1664525)+1013904223)>>>0;
   const choice=a[r%a.length];choices.add(s.sceneId+":"+choice.id);if(choice.id==="heal")healed++;
   s=E.choose(s,choice.id,s.revision);
  }
  assert.equal(s.status,"finished");assert.ok(E.validateState(s).ok);
  ends.add(s.terminalId);
  if(s.terminalId==="clean"){assert.ok(s.flags.originalSeen&&s.flags.provenance&&s.flags.voluntary&&s.flags.limited&&!s.flags.exposed&&!s.flags.coerced&&!s.flags.ownerDeal&&s.stats.time<=20);}
  if(s.flags.accepted&&s.stats.time>20&&s.hp>0){assert.equal(s.terminalId,"failed");late++;}
  if(s.objective&&s.stats.time===20)boundary++;
 }
 const missing=Object.entries(M.scenes).flatMap(([id,n])=>n.choices.map(c=>id+":"+c.id)).filter(x=>!choices.has(x));
 console.log("coverage",nodes.size,choices.size,"missing",missing,"ends",[...ends],"late",late,"boundary",boundary,"heal",healed);
 assert.deepEqual(missing,[]);assert.equal(nodes.size,20);assert.equal(ends.size,4);assert.ok(late&&boundary&&healed);
});
test("CR07 save replay and unique reward",()=>{
 const data=new Map(),store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 for(const [id,newAward] of [["cr07_save_first",true],["cr07_save_repeat",false]]){
  const s=run(clean,0,id);assert.ok(A.save(store,s).ok);const recovered=A.recover(store,s);assert.ok(recovered.ok);assert.equal(recovered.awardAdded,newAward);
 }
});
