"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const C=require("../../src/criminal/content.js"),E=require("../../src/criminal/engine.js"),A=require("../../src/criminal/archive.js"),ep=require("../../src/criminal/epilogues.js");
require("../../src/criminal/missions/cr08.js");
const M=C.missions.CR08;
const route=(path,seed=0,id="cr08_test_route")=>{let s=E.create("CR08",seed,id,1);for(const key of path){assert.ok(E.availability(s,key),s.sceneId+":"+key);s=E.choose(s,key,s.revision);}assert.ok(E.validateState(s).ok);return s;};
const clean=["accept","source","promise","photo","confirm","compare","verify","promise","consent","agree","exact","submit","finish"];
const deal=["accept","lawyer","take","record","skip","offer","deal","limited","submit","finish"];
const exposed=[...clean.slice(0,-2),"name","finish"];
const refused=["accept","source","listen","skip","record","skip","pressure","leave","return"];
test("CR08 routes distinguish evidence, consent, source disclosure and refusal",()=>{
 const good=route(clean),bad=route(deal),leak=route(exposed),walk=route(refused);
 assert.equal(good.terminalId,"clean");assert.ok(good.flags.print&&good.flags.witness&&good.flags.dates&&good.flags.authorship&&good.flags.consent&&good.flags.accurate&&!good.flags.exposed);
 assert.equal(bad.terminalId,"costly");assert.ok(bad.flags.deal&&!bad.flags.accurate);
 assert.equal(leak.terminalId,"costly");assert.ok(leak.flags.exposed&&leak.flags.breach);
 assert.equal(walk.terminalId,"failed");assert.ok(walk.flags.refused);
 for(const s of [good,bad,leak,walk]){const cards=ep.describe(s);assert.equal(cards.length,2);assert.doesNotMatch(cards.map(x=>x.text).join(" "),/виновник пожара установлен|статья опубликована/);}
 assert.equal(C.awardName("CR08","clean"),"Чистый оттиск");
 assert.equal(Object.keys(M.scenes).length,20);assert.equal(Object.values(M.scenes).flatMap(x=>x.choices).length,55);
});
test("CR08 seeded genuine playthroughs cover every choice, all four endings and final deadline",()=>{
 const nodes=new Set(),choices=new Set(),ends=new Set();let late=0,boundary=0,healed=0,cleanCount=0,dead=0;
 for(let k=0;k<6000;k++){
  let s=E.create("CR08",k,"cr08_seed_"+k,1),r=k+1;
  for(let i=0;i<30&&s.status==="active";i++){
   nodes.add(s.sceneId);const a=E.choices(s).filter(x=>x.available);if(E.availability(s,"heal"))a.push({id:"heal"});assert.ok(a.length,s.sceneId);
   r=(Math.imul(r,1664525)+1013904223)>>>0;const c=a[Math.floor((r/4294967296)*a.length)];choices.add(s.sceneId+":"+c.id);if(c.id==="heal")healed++;
   s=E.choose(s,c.id,s.revision);
  }
  assert.equal(s.status,"finished");assert.ok(E.validateState(s).ok);ends.add(s.terminalId);
  if(s.terminalId==="clean"){cleanCount++;assert.ok(s.flags.print&&s.flags.witness&&s.flags.dates&&s.flags.authorship&&s.flags.accurate&&s.flags.consent&&!s.flags.breach&&!s.flags.overclaim&&!s.flags.deal&&s.stats.time<=21);}
  if(s.flags.accepted&&s.stats.time>21&&s.hp>0){late++;assert.equal(s.terminalId,"failed");}
  if(s.objective&&s.stats.time===21)boundary++;
  if(s.terminalId==="dead"){dead++;assert.equal(s.hp,0);}
 }
 const missing=Object.entries(M.scenes).flatMap(([id,n])=>n.choices.map(c=>id+":"+c.id)).filter(x=>!choices.has(x));
 console.log("coverage",nodes.size,choices.size,"missing",missing,"ends",[...ends],"late",late,"boundary",boundary,"heal",healed,"clean",cleanCount,"dead",dead);
 assert.deepEqual(missing,[]);assert.equal(nodes.size,20);assert.equal(ends.size,4);assert.ok(late&&boundary&&healed&&cleanCount&&dead);
});
test("CR08 independent save replay and unique reward",()=>{
 const data=new Map(),store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 for(const [id,wanted] of [["cr08_save_first",true],["cr08_save_repeat",false]]){const s=route(clean,0,id);assert.ok(A.save(store,s).ok);const r=A.recover(store,s);assert.ok(r.ok);assert.equal(r.awardAdded,wanted);}
});
