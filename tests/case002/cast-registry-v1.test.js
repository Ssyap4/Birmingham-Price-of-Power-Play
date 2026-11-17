#!/usr/bin/env node
"use strict";
/* No NPC names or portraits leak in the dossier before an actual introduction.
 * This is also the gate for future portrait asset registration.
 */
const assert=require("node:assert/strict");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
const {CAST,discovered,character}=require("../../src/case002/cast-registry-v1.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
const rosterIds=["mabel","tommy","ada","mercer","vale","brackett","nora","hale","rowan","signalman"];
assert.equal(CAST.length,10);
assert.deepEqual(CAST.map(x=>x.id),rosterIds);
const seenNames=new Set(),seenRoles=new Set();
for(const npc of CAST){
 assert(typeof npc.name==="string"&&npc.name.length>=5);
 assert(typeof npc.role==="string"&&npc.role.length>=7);
 assert(typeof npc.appearance==="string"&&npc.appearance.length>=35);
 assert.equal(npc.portrait,null,"new art must not be silently invented");
 assert(Array.isArray(npc.intro)&&npc.intro.length);
 for(const id of npc.intro)assert(graph.nodes.some(n=>n.id===id),"unknown intro scene "+npc.id+"/"+id);
 assert(!seenNames.has(npc.name),"reused cast name");
 seenNames.add(npc.name);seenRoles.add(npc.role);
}
assert.equal(seenRoles.size,10);
assert.equal(character("nobody"),null);
let scenes=0,restarts=0,proper=0;
for(const hero of contract.heroes)for(const ending of contract.endings){
 const e=createEngine({graph,contract,hero,attemptId:"cast-"+hero+"-"+ending.id});
 const visit=()=>{
  const s=e.snapshot();
  const known=discovered(s);
  assert.deepEqual(known.map(x=>x.id),CAST.filter(npc=>
    npc.intro.some(id=>s.visited.includes(id))).map(x=>x.id));
  assert(known.every(x=>x.portrait===null));
  if(!s.visited.includes("E08")&&!s.visited.includes("HJ03")){
    assert(!known.some(x=>x.id==="brackett"),"spoiled Brackett before meeting him");
  }
  if(!s.visited.includes("D02")&&!s.visited.includes("HE02")){
    assert(!known.some(x=>x.id==="ada"),"Ada exposed before investigation");
  }
  if(!s.visited.includes("D04")&&!s.visited.includes("HJ02")&&!s.visited.includes("HV02")){
    assert(!known.some(x=>x.id==="tommy"),"Tommy shown before introduction");
  }
  scenes++;
 };
 visit();
 for(const [from,to,action] of goodRoute(hero,ending.id).actionLog){
   assert.equal(e.snapshot().node,from);
   e.choose(to,action);visit();
 }
 proper++;
}
assert.deepEqual(discovered({visited:["P01"]}),[]);
assert.deepEqual(discovered({visited:["P01","P02"]}).map(x=>x.id),["mabel"]);
assert.equal(discovered({visited:["P01","P02","D04"],witnesses:{tommy:"detained"}})
 .find(x=>x.id==="tommy").status,"detained");
const oldVisit={visited:["P01","P02","D04","E08"]};
assert.deepEqual(discovered(oldVisit).map(x=>x.id),["mabel","tommy","brackett"]);
for(const hero of contract.heroes){
 const s={visited:["P01","P02"],witnesses:{ada:"missing",tommy:"detained",mercer:"located"}};
 assert.deepEqual(discovered(s).map(x=>x.id),["mabel"]);
 restarts++;
}
console.log("PASS Case002 cast discovery: "+proper+" real hero/ending routes, "+
 scenes+" scene states, 10 canonical unique NPC identities; no premature spoilers or phantom portraits.");
