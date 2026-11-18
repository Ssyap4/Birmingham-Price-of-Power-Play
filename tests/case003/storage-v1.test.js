"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),s=require("../../src/case003/storage-v1");
function memory(){const m=new Map();return {getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v)};}
const step=(m,r,id)=>s.advance(m,r.slot.state.hero,r.raw,{type:"step",id});
function ending(m,r){for(const id of ["continue","summarize","investigate","finish","continue","continue","continue","summary","continue","finish","continue","finish","continue","report"])r=step(m,r,id);return r;}
test("unfinished slots are isolated; stale writes cannot replace latest progress",()=>{
 const m=memory(),a=s.begin(m,"jack",null,"a"),b=s.begin(m,"finn",null,"b"),c=step(m,a,"continue");
 assert.equal(s.read(m,"jack").slot.state.node,"A01");assert.equal(s.read(m,"finn").raw,b.raw);
 assert.throws(()=>step(m,a,"continue"),/conflict/);assert.equal(s.read(m,"jack").raw,c.raw);
});
test("one reward per hero and ending, repeated attempts retain separate records",()=>{
 const m=memory();let r=ending(m,s.begin(m,"jack",null,"a"));assert.equal(r.earned,true);
 assert.equal(r.status,"finished");assert.throws(()=>step(m,r,"continue"));
 r=ending(m,s.begin(m,"jack",r.raw,"b"));assert.equal(r.earned,false);assert.equal(r.slot.records.length,2);
 assert.equal(new Set(r.slot.records.map(x=>x.reward)).size,1);
 const other=ending(m,s.begin(m,"finn",null,"c"));assert.equal(other.earned,true);
});
test("damaged slots are retained unless explicitly backed up and replaced",()=>{
 const m=memory();m.setItem(s.key("jack"),"{");
 assert.equal(s.read(m,"jack").status,"damaged");assert.throws(()=>s.begin(m,"jack","{","a"),/damaged/);
 assert.equal(m.getItem(s.key("jack")),"{");
 const r=s.replaceDamaged(m,"jack","{","b");assert.equal(m.getItem(s.key("jack")+"_damaged_b"),"{");assert.equal(r.slot.state.node,"P01");
});
test("write errors and corrupt terminal records are not reported as saved",()=>{
 const m=memory();let r=s.begin(m,"jack",null,"a");
 const failing={getItem:m.getItem,setItem(){throw Error("quota");}};
 assert.throws(()=>step(failing,r,"continue"),/quota/);assert.equal(s.read(m,"jack").raw,r.raw);
 r=ending(m,r);const fake={...r.slot,records:[]};assert.equal(s.parse(JSON.stringify(fake),"jack").status,"damaged");
});
test("wrong deduction is a no-op; successful evidence survives reload",()=>{
 const m=memory();let r=s.begin(m,"jack",null,"a");
 for(const id of ["continue","glass","continue","neighbour","continue"])r=step(m,r,id);
 const bad=s.advance(m,"jack",r.raw,{type:"prove",id:"staged",evidence:["glass"]});
 assert.equal(bad.changed,false);assert.equal(bad.raw,r.raw);
 const good=s.advance(m,"jack",r.raw,{type:"prove",id:"staged",evidence:["glass","sound"]});
 assert.equal(good.changed,true);assert.deepEqual(s.read(m,"jack").slot.state.claims,["staged"]);
});
