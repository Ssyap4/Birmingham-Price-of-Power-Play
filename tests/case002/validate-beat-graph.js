#!/usr/bin/env node
/* Static QA for the Case 002 design skeleton, NOT a gameplay test.
 * Run: node tests/case002/validate-beat-graph.js
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const graph=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/case002-beat-graph-v1.json"),"utf8"));
const spec=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/case002-contract-v1.json"),"utf8"));
const byId=new Map(graph.nodes.map(x=>[x.id,x]));
assert.equal(graph.status,"OUTLINE_ONLY_NOT_GAME");
assert.equal(graph.caseId,"002");
assert.equal(graph.nodes.length,89);
assert.equal(byId.size,graph.nodes.length,"duplicate node ids");
assert.equal(graph.entry,"P01");
const endings=graph.nodes.filter(x=>x.chapter==="END");
assert.equal(endings.length,7);
const targetIds=new Set(endings.map(x=>x.id));
assert.equal(spec.endings.length,7);
for(const [i,id] of spec.endings.map(x=>x.id).entries())assert(targetIds.has("Z"+String(i+1).padStart(2,"0")));
assert.equal(graph.nodes.filter(x=>x.hero).length,15);
for(const node of graph.nodes){
 if(node.hero)assert(spec.heroes.includes(node.hero),node.id);
 if(node.chapter!=="END")assert(node.next.length>0,"dead-end "+node.id);
 else assert.deepEqual(node.next,[],"ending has exit");
 for(const target of node.next)assert(byId.has(target),"broken "+node.id+" -> "+target);
}
function traversable(hero,blocked=new Set()){
 const seen=new Set(),q=[graph.entry];
 while(q.length){
  const id=q.shift();
  if(seen.has(id)||blocked.has(id))continue;
  const node=byId.get(id);
  if(node.hero&&node.hero!==hero)continue;
  seen.add(id);
  for(const next of node.next)q.push(next);
 }
 return seen;
}
let checkedPaths=0;
for(const hero of spec.heroes){
 const visited=traversable(hero);
 const expected=graph.nodes.filter(n=>!n.hero||n.hero===hero);
 for(const item of expected)assert(visited.has(item.id),"unreachable "+hero+"/"+item.id);
 for(const end of endings){assert(visited.has(end.id),"no end "+hero+"/"+end.id);checkedPaths++;}
 assert.equal(graph.nodes.filter(n=>n.hero===hero).length,3,"need three hero-specific beats");
 // An exit must not skip the witness-state checkpoint or the final evidence report.
 for(const checkpoint of ["D11","E10","F05"]){
  const without=traversable(hero,new Set([checkpoint]));
  for(const end of endings)assert(!without.has(end.id),"bypass "+checkpoint+" by "+hero);
 }
}
// A literal graph proves only structural reachability; the gated ending contract
// must be validated separately and then tested in the eventual gameplay engine.
console.log("PASS: "+graph.nodes.length+" beats, 15 hero scenes, "+checkedPaths+" structural ending routes, mandatory checkpoints; NO gameplay engine tested.");
