"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {nodes,contract}=require("../../src/case003/graph-v1");
const e=require("../../src/case003/engine-v1");
function take(s,...ids){for(const id of ids)s=e.step(s,id);return s;}
function proveAll(s){for(const c of contract.claims){const a=c.alternatives.find(a=>a.every(x=>s.evidence.includes(x)));if(a)s=e.prove(s,c.id,a).state;}return s;}
function full(hero){
 let s=take(e.create(hero),"continue","glass","continue","safe","continue","neighbour","continue","summarize","investigate",
 "office","terms","continue","ida","continue","return","market","dealer","continue","carrier","continue","return","service","watch","continue","return","owner","continue","finish","continue","continue","continue","alibi","continue","continue",
 "witness","continue","object","continue","receipt","cuff","continue","protect","protect","finish","continue");
 return proveAll(s);
}
test("production graph covers design IDs, exact sources, links and 15 individual beats",()=>{
 const flat=contract.chapters.flatMap(c=>c.nodes);
 for(const n of flat){assert.ok(nodes[n.id],n.id);assert.deepEqual(n.grants,[...nodes[n.id].grants,...(n.id==="D03"?nodes.D03a.grants:[])]);}
 for(const n of Object.values(nodes)){assert.ok(n.title&&n.chapter&&n.text.length);assert.equal(new Set(n.actions.map(a=>a.id)).size,n.actions.length);for(const a of n.actions)assert.ok(nodes[a.to],a.to);}
 assert.equal(Object.values(nodes).filter(n=>n.hero).length,15);
});
test("all seven outcomes via legitimate actions for each hero",()=>{
 let rewards=new Set();
 for(const hero of contract.heroes){
  const s=full(hero);assert.equal(s.claims.length,3); // provenance needs recovered object.
  const goods=proveAll(take(s,"dealer","leave","secure","secure"));
  const pub=take(goods,"ash","submit","finish","continue","public");
  const restore=take(goods,"finish","continue","restore");
  const murder=take(s,"finish","continue","murder");
  const deal=take(s,"voss","agree","dealer","leave","secure","secure","finish","continue","deal");
  const control=take(s,"dealer","agree","finish","continue","control");
  const empty=take(e.create(hero),"continue","summarize","investigate","finish","continue","continue","continue","summary","continue","finish","continue","finish","continue","report");
  const death=take(s,"danger","risk","fatal");
  const states=[pub,restore,murder,deal,control,empty,death];
  assert.deepEqual(states.map(s=>s.ending),contract.endings.map(x=>x.id));
  for(const x of states){assert.equal(e.available(x).length,0);rewards.add(e.rewardId(x));assert.deepEqual(e.restore(JSON.stringify(x),hero),x);}
 }
 assert.equal(rewards.size,35);
});
test("wrong deductions, unavailable choices and repeated evidence cannot farm",()=>{
 let s=take(e.create("jack"),"continue","glass","continue");
 assert.throws(()=>e.step(s,"glass"));assert.throws(()=>e.step(s,"hero-HE01"));
 assert.equal(e.prove(s,"staged",["glass"]).state,s);
 assert.throws(()=>e.prove(s,"killer",["trace"]));
 s=take(s,"neighbour","continue");s=e.prove(s,"staged",["glass","sound"]).state;
 assert.equal(e.prove(s,"staged",["glass","sound"]).state,s);
 assert.throws(()=>e.step(s,"fatal"));
});
test("both killer proof routes independently available for every hero",()=>{
 for(const hero of contract.heroes){
  const base=take(e.create(hero),"continue","summarize","investigate","service","watch","continue","return","finish","continue","continue","continue","summary","continue");
  let a=take(base,"witness","continue","object","continue");
  assert.equal(e.prove(a,"killer",["marsh","trace","key"]).accepted,true);
  let b=take(base,"receipt","cuff","continue");
  assert.equal(e.prove(b,"killer",["watch","cuff","voss"]).accepted,true);
  assert.ok(!b.evidence.includes("marsh")&&!b.evidence.includes("trace"));
 }
});
test("invalid save shape, forged flags, history or mismatched hero rejected",()=>{
 const s=e.create("jack");
 for(const raw of ["{","{}",JSON.stringify({...s,flags:["goodsSecured"]}),JSON.stringify({...s,history:[{type:"step",id:"fatal"}]})])assert.equal(e.restore(raw,"jack"),null);
 assert.equal(e.restore(JSON.stringify(s),"finn"),null);
 assert.deepEqual(e.restore(JSON.stringify(s),"jack"),s);
});
test("exclusive bargains and danger confirmation are enforced",()=>{
 let s=take(full("finn"),"voss","agree","dealer");
 assert.ok(!e.available(s).some(a=>a.id==="agree"));
 s=take(s,"leave","danger","risk","retreat");
 assert.equal(s.alive,true);assert.ok(!s.flags.includes("confirmedDeath"));
 assert.throws(()=>e.step(s,"fatal"));
});
test("all hero episodes have proper route, return and no repeat",()=>{
 for(const n of Object.values(nodes).filter(x=>x.hero)){
  const from=Object.values(nodes).find(x=>x.actions.some(a=>a.to===n.id));
  const s={...e.create(n.hero),node:from.id,visited:[from.id]};
  const a=from.actions.find(a=>a.to===n.id);
  const result=e.step(s,a.id);assert.equal(result.node,n.id);
  const back=e.step(result,"continue");assert.equal(back.node,from.id);
  assert.ok(!e.available(back).some(a=>a.to===n.id));
  const other=contract.heroes.find(h=>h!==n.hero);
  assert.ok(!e.available({...s,hero:other}).some(a=>a.to===n.id));
 }
});
test("sampled legitimate routes always offer progress and terminate",()=>{
 let seed=193;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(const hero of contract.heroes){
  for(let i=0;i<200;i++){
   let s=e.create(hero),steps=0;
   while(!s.ending && steps<120){
    s=proveAll(s);const actions=e.available(s);assert.ok(actions.length,s.node);
    s=e.step(s,actions[Math.floor(rnd()*actions.length)].id);steps++;
   }
   assert.ok(s.ending,"stuck at "+s.node);assert.ok(s.history.length<250);
   assert.equal(new Set(s.evidence).size,s.evidence.length);
  }
 }
});
test("alternate provenance bundle does not require the widow's property",()=>{
 let s=take(e.create("samuel"),"continue","summarize","investigate","market","carrier","continue","return","owner","continue","finish","continue","continue","continue","summary","continue","finish","continue","dealer","leave");
 assert.ok(s.evidence.includes("parcel"));
 const alternate=e.prove(s,"provenance",["parcel","owner","transfer"]);
 assert.equal(alternate.accepted,true);assert.ok(!s.evidence.includes("returnbook"));
});