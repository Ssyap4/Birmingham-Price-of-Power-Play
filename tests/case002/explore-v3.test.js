#!/usr/bin/env node
"use strict";
/* Deterministic exploration of the ACTUAL Case 002 draft engine.
 * Do not confuse this with browser or narrative editorial approval.
 * 400 seeded playthroughs, all five heroes, reloading progress along the way.
 */
const assert=require("node:assert/strict");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
function storage(){
 const db=new Map();
 return {getItem:k=>db.has(k)?db.get(k):null,setItem:(k,v)=>db.set(k,String(v))};
}
function prng(seed){
 let x=seed>>>0;
 return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
const endings=new Map(),coverage=new Set(),actionCoverage=new Set();
let paths=0,steps=0,reloads=0;
for(const [index,hero] of contract.heroes.entries()){
 for(let seed=1;seed<=80;seed++){
  const rand=prng(12739+seed*1511+index*10129),store=storage();
  const opts={graph,contract,hero,store,attemptId:"fuzz-"+hero+"-"+seed,now:()=>1700000000000+seed};
  let e=createEngine(opts);
  const once=new Set(),resolved=new Set();
  for(let step=0;step<170;step++){
   const v=e.view(),s=e.snapshot();
   coverage.add(s.node);
   assert(v.choices.every(x=>typeof x.enabled==="boolean"));
   assert.equal(new Set(s.evidence).size,s.evidence.length);
   for(const id of ["ada","tommy","mercer"])assert(contract.witnessStates.includes(s.witnesses[id]));
   if(s.node==="B01"){
     const locked={B02:"rail",B05:"canal",B08:"factory"};
     for(const c of v.choices.filter(x=>locked[x.to] && s.routes.includes(locked[x.to])))
       assert(!c.enabled,"completed route incorrectly reopened "+c.to);
   }
   if(s.node==="D01"){
     const locked={D02:"ada",D04:"tommy",D07:"mercer"};
     const closed=e.resolvedWitnessBranches();
     for(const c of v.choices.filter(x=>closed.includes(locked[x.to])))
       assert(!c.enabled,"completed witness investigation reopened "+c.to);
   }
   if(s.finished){
     assert.equal(v.choices.length,0);
     assert(contract.endings.some(x=>x.id===s.ending));
     assert.equal(s.history.length,step);
     const saved=JSON.parse(store.getItem(e.storageKey));
     assert.deepEqual(saved,s);
     const archive=JSON.parse(store.getItem(e.recordKey));
     assert(archive.length===1 && archive[0].ending===s.ending);
     endings.set(s.ending,(endings.get(s.ending)||0)+1);
     paths++;
     break;
   }
   const legal=v.choices.filter(x=>x.enabled);
   assert(legal.length>0,"stuck "+hero+" seed "+seed+" node "+s.node+
     " visited="+s.visited.join(","));
   // Pick enabled actions randomly. All choices on this engine must be reversible
   // only while the branch remains narratively accessible.
   const selected=legal[Math.floor(rand()*legal.length)];
   actionCoverage.add(s.node+":"+selected.to+":"+selected.action);
   const before=JSON.stringify(s);
   const next=e.choose(selected.to,selected.action);
   assert.notEqual(JSON.stringify(next),before);
   assert.equal(next.history.length,s.history.length+1);
   assert(!once.has(next.attemptId+":"+next.history.length));
   once.add(next.attemptId+":"+next.history.length);
   steps++;
   if(step%9===4){
     const reconstructed=createEngine({...opts,attemptId:"will-not-override"});
     reconstructed.load();
     assert.deepEqual(reconstructed.snapshot(),e.snapshot(),"failed deterministic save/reload");
     e=reconstructed;reloads++;
   }
   if(step===169)assert.fail("nonterminating traversal "+hero+" seed "+seed+" at "+next.node);
  }
 }
}
assert.equal(paths,400);
assert(coverage.size>=70,"fuzzer did not explore enough unique scenes: "+coverage.size);
assert(steps>=400*25,"suspiciously short traversal lengths");
assert(endings.has("trainEscape"),"fallback ending never appeared");
assert(endings.has("trainDeath"),"risk ending never appeared");
console.log("PASS Case002 deterministic exploration: "+paths+" full playthroughs, "+steps+
 " transitions, "+reloads+" save/resume cycles, "+coverage.size+
 "/89 scenes, "+actionCoverage.size+" unique transition choices. Endings: "+
 JSON.stringify(Object.fromEntries(endings)));
