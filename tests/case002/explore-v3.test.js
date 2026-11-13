#!/usr/bin/env node
"use strict";
/* Deterministic exploration of the ACTUAL Case 002 draft engine.
 * Do not confuse this with browser or narrative editorial approval.
 * 400 seeded playthroughs, all five heroes, reloading progress along the way.
 */
const assert=require("node:assert/strict");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract,narration}=require("../../src/case002/browser-data-v3.js");
const {render}=require("../../src/case002/story-variants-v4.js");
const story={graph,contract,narration};
const board=require("../../docs/case002/case002-art-storyboard-v1.json");
const art=require("../../src/case002/scene-art-v1.js");
const consequences=require("../../src/case002/consequences-v1.js");
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
   const selectedArtwork=art.select(board,v);
   assert.equal(selectedArtwork.sceneId,s.node);
   assert.equal(selectedArtwork.assetVerified,false,"Uncreated art falsely claimed available");
   if(s.node==="Z02"){
     for(const id of ["ada","tommy","mercer"])
       assert.equal(selectedArtwork.visibleCast.includes(id),
         s.witnesses[id]==="evacuated","Artwork contradicts who escaped");
   }
   const narrationText=render(story,v);
   assert(narrationText.length>20,"missing actual story text: "+hero+"/"+s.node);
   assert(!narrationText.includes("undefined"),"unresolved text interpolation: "+s.node);
   if(s.node==="D06"&&s.witnesses.tommy==="detained")
     assert(narrationText.includes("не выходит"),"detained Tommy described as freed");
   if(s.node==="F09"&&s.flags.accountsGivenToWorkers)
     assert(!narrationText.includes("сохранение власти над счетами"),"handed accounts still grant power");
   if(s.node==="Z02"&&!Object.values(s.witnesses).includes("evacuated"))
     assert(narrationText.includes("Никто из свидетелей не покинул город"),
       "narrative invented witness evacuation");

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
   const changes=consequences.receipts(s,next,selected.action);
   for(const id of next.evidence.filter(id=>!s.evidence.includes(id)))
     assert(changes.some(x=>x.kind==="evidence"&&x.text.includes(id)),
       "A newly collected item has no evidence notice");
   for(const [id,status] of Object.entries(next.witnesses)){
     if(status!==s.witnesses[id])
       assert(changes.some(x=>x.kind==="witness"),"Witness change omitted from notice");
   }

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
