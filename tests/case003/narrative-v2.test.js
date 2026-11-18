"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const e=require("../../src/case003/engine-v1");
const {nodes,contract}=require("../../src/case003/graph-v1");
const n=require("../../src/case003/narrative-v2");
const take=(s,...ids)=>ids.reduce((s,id)=>e.step(s,id),s);
const atB=(h)=>take(e.create(h),"continue","summarize","investigate");
const atD=(h)=>take(atB(h),"finish","continue","continue","continue","summary","continue");
const atE=(h)=>take(atD(h),"finish","continue");
test("13 new scenes reachable by real paths, once-only access; no new clues",()=>{
 const found=new Set();
 for(const h of contract.heroes){
  let seed=817;
  for(let i=0;i<180;i++){
   let s=e.create(h);
   while(!s.ending){
    const actions=e.available(s);
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const a=actions[seed%actions.length];
    s=e.step(s,a.id);
    if(a.id.startsWith("visit-")){found.add(s.node);assert.equal(nodes[s.node].grants.length,0);}
   }
   assert.ok(s.history.length<250);
  }
 }
 assert.equal(found.size,13);
 assert.equal(Object.values(nodes).filter(n=>!n.virtual).length,73);
});
test("five personal paths commit actual events via legitimate hero actions",()=>{
 let jack=take(atD("jack"),"witness","hero-HJ01","escort","hero-HJ02","escort");
 assert.ok(jack.flags.includes("witnessProtected"));assert.equal(jack.node,"D00");
 let finn=take(atB("finn"),"service","hero-HF01","watch");
 assert.equal(finn.node,"B08");assert.ok(finn.evidence.includes("watch"));
 let eleanor=take(atE("eleanor"),"ash","hero-HE03","submit");
 assert.ok(eleanor.flags.includes("materialsAccepted"));
 let victor=take(atB("victor"),"office","terms","hero-HV02","ida");
 assert.equal(victor.node,"B03");assert.ok(victor.evidence.includes("ida"));
 let samuel=take(atE("samuel"),"dealer","leave","secure","hero-HS03","secure");
 assert.ok(samuel.flags.includes("goodsSecured"));
 for(const s of [jack,finn,eleanor,victor,samuel])assert.deepEqual(e.restore(JSON.stringify(s),s.hero),s);
});
test("return prose never repeats initial scene; reading never modifies state",()=>{
 let s=take(e.create("jack"),"continue");const initial=n.sceneText(s);
 const back=take(s,"glass","continue");let snapshot=JSON.stringify(back);
 assert.equal(n.visitCount(back),2);assert.notDeepEqual(n.sceneText(back),initial);
 assert.deepEqual(n.sceneText(e.restore(snapshot,"jack")),n.sceneText(back));
 assert.equal(JSON.stringify(back),snapshot);
});
test("restoration epilogues describe only supported owner route",()=>{
 let s=take(atB("samuel"),"owner","carrier","street","finish","continue","continue","continue","summary","continue","finish","continue","dealer","leave","secure","secure");
 s=e.prove(s,"provenance",["parcel","owner","transfer"]).state;
 s=take(s,"finish","continue","restore");
 assert.ok(n.sceneText(s).some(x=>x.includes("Владелец часов")));
 assert.ok(!s.evidence.includes("repair")); assert.ok(!n.sceneText(s).some(x=>x.includes("Клара узнаёт")));
 assert.deepEqual(n.sceneText(e.restore(JSON.stringify(s),"samuel")),n.sceneText(s));
});
test("unconfirmed clues are not asserted in epilogue",()=>{
 const s=take(atE("jack"),"finish","continue","report");
 assert.ok(n.sceneText(s).some(x=>x.includes("Ни одно")));
 assert.ok(!n.sceneText(s).some(x=>x.includes("Марш находится")));
 assert.equal(n.epilogueDetails(take(atE("jack"),"danger","risk","fatal")).length,0);
});
