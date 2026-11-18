"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const C=require("../../src/criminal/content.js"),E=require("../../src/criminal/engine.js"),A=require("../../src/criminal/archive.js");
const P=require("../../campaign-criminal-archive-v1.js"),ep=require("../../src/criminal/epilogues.js");
const proof=require("../../docs/criminal-operations/v2-evidence/routes.json");
for(let i=1;i<=6;i++)require("../../src/criminal/missions/cr0"+i);
const M=C.missions.CR06;
const route=(choices,seed=0,id="cr06_test_attempt")=>{
 let s=E.create("CR06",seed,id,1);
 for(const c of choices){assert.ok(E.availability(s,c),s.sceneId+":"+c);s=E.choose(s,c,s.revision);}
 assert.ok(E.validateState(s).ok);return s;
};
const paths={
 clean:["accept","papers","listen","compare","consent","ask","compare","substantiate","sign"],
 medical:["accept","friend","promise","confirm","present","askBell","compare","substantiate","sign"],
 costly:["accept","official","trust","insist","calm","comply","sign"],
 failed:["accept","official","trust","abandon","return"],
 late:["accept","friend","hear","clinic","confirm","compare","consent","ask","compare","substantiate","sign"],
 danger:["accept","official","trust","insist","confront"],
 together:["accept","friend","hear","together","hurry","confront","clear"],
};
test("CR06 graph and independent endings",()=>{
 assert.equal(Object.keys(M.scenes).length,22);
 assert.equal(Object.values(M.scenes).flatMap(n=>n.choices).length,60);
 assert.equal(M.acts.length,4);
 for(const [id,n] of Object.entries(M.scenes)){
  assert.ok(n.lines.length,id+" missing dialogue");
  assert.ok(n.choices.some(c=>!c.when),id);
  for(const c of n.choices){assert.ok(M.scenes[c.to]||["@deliver","@withdraw"].includes(c.to));assert.ok(c.result);}
 }
 for(const [key,end,time] of [["clean","clean",17],["medical","clean",13],["costly","costly",7],["failed","failed",5],["late","failed",25]]){
  const s=route(paths[key]);assert.equal(s.terminalId,end,key);assert.equal(s.stats.time,time,key);
 }
 assert.equal(C.catalog().filter(e=>e.heroId==="jack").length,2);
});
test("seeded exploration covers every scene, choice, terminal, exact deadline and wound/heal",()=>{
 const seen=new Set(),nodes=new Set(),ends=new Set();let boundary,late,dead,wound,escaped,failedExit;
 // Deterministic choice sampling; genuine engine state and RNG, no injected flags or stats.
 for(let k=0;k<4000;k++){
  let s=E.create("CR06",k,"cr06_sample_"+k,1),r=(k+1)>>>0;
  for(let i=0;i<30&&s.status==="active";i++){
   nodes.add(s.sceneId);const available=E.choices(s).filter(c=>c.available);
   if(E.availability(s,"heal"))available.push({id:"heal"});
   assert.ok(available.length,s.sceneId);
   r=(Math.imul(r,1664525)+1013904223)>>>0;
   const c=available[r%available.length],from=s.sceneId;
   seen.add(from+":"+c.id);const before=s;s=E.choose(s,c.id,s.revision);
   if(c.id==="heal"){assert.equal(s.hp,Math.min(100,before.hp+35));assert.equal(s.stats.time,before.stats.time+1);wound=s;}
   if(from==="confrontation"&&c.id==="clear"){
    if(s.lastEvent.failed){assert.equal(s.flags.leftTogether,false);failedExit=s;}
    else {assert.equal(s.flags.leftTogether,true);escaped=s;}
   }
   if(s.status==="finished"){
    ends.add(s.terminalId);assert.ok(E.validateState(s).ok);
    if(s.terminalId==="dead")dead=s;
    if(s.stats.time===22&&s.objective)boundary=s;
    if(s.flags.accepted&&s.stats.time>22)late=s;
   }
  }
  assert.equal(s.status,"finished","stalled seed "+k);
 }
 const missing=Object.entries(M.scenes).flatMap(([id,n])=>n.choices.map(c=>id+":"+c.id)).filter(k=>!seen.has(k));
 console.log("CR06 coverage",nodes.size,seen.size,"missing",missing,"ends",[...ends],"boundary",!!boundary,"late",!!late,"dead",!!dead,"healed",!!wound,"escaped",!!escaped,"failedExit",!!failedExit);
 assert.deepEqual(missing,[]);assert.equal(nodes.size,22);assert.equal(ends.size,4);
 assert.ok(boundary&&late&&dead&&wound&&escaped&&failedExit);
 assert.equal(late.terminalId,"failed");assert.equal(dead.hp,0);
});
test("legacy 20 terminal proofs replay unchanged, new rewards independent and epilogues report only established facts",()=>{
 const data=new Map(),store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 for(let i=1;i<=5;i++){
  const id="CR0"+i;
  for(const ending of ["clean","costly","failed","dead"]){
   const p=proof.missions[id].terminalProofs[ending];
   let s=E.create(id,p.seed,p.attemptId,p.startedAt);
   for(const step of p.path)s=E.choose(s,step.choiceId,s.revision);
   assert.equal(s.terminalId,ending);assert.equal(A.save(store,s).ok,true);assert.equal(A.recover(store,s).ok,true);
  }
 }
 const oldSlots=[...data.entries()].filter(([key])=>key.includes("save_")),before=A.ledger(store).value;
 assert.equal(Object.keys(before.rewards).length,20);
 const s=route(paths.clean,0,"cr06_clean_first"),again=route(paths.clean,0,"cr06_clean_repeat");
 for(const state of [s,again]){assert.ok(A.save(store,state).ok);const r=A.recover(store,state);assert.ok(r.ok);assert.equal(r.awardAdded,state===s);}
 for(const [k,v] of oldSlots)assert.equal(store.getItem(k),v);
 const snap=P.snapshot(store,A,C);assert.equal(snap.unique,21);assert.equal(snap.missions.length,6);
 assert.equal(snap.rewards.find(r=>r.missionId==="CR06").title,"Неподписанный приговор");
 for(const [k,v] of Object.entries(before.rewards))assert.equal(A.ledger(store).value.rewards[k],v);
 assert.equal(ep.describe(s).length,2);
 const late=route(paths.late);assert.match(ep.describe(late).map(x=>x.text).join(" "),/срок/);
 assert.doesNotMatch(ep.describe(late).map(x=>x.text).join(" "),/пересмотр принят в срок/);
});
