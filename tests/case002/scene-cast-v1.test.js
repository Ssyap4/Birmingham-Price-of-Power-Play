#!/usr/bin/env node
"use strict";
/* Guard the voice/portrait cast of every reachable Case 002 scene.
 * Discovery and physical presence must agree with the actual game state.
 */
const assert=require("node:assert/strict");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract,storyboard}=require("../../src/case002/browser-data-v3.js");
const art=require("../../src/case002/scene-art-v1.js");
const registry=require("../../src/case002/cast-registry-v1.js");
const {participants}=require("../../src/case002/scene-cast-v1.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
const create=hero=>createEngine({graph,contract,hero,attemptId:"dialogue-cast-"+hero});
let checks=0,displayed=0,states=0;
function verify(v){
 const stage=art.select(storyboard,v);
 const people=participants(stage,v.state,registry);
 const known=new Set(registry.discovered(v.state).map(x=>x.id));
 const ids=people.map(x=>x.id);
 assert.equal(ids.length,new Set(ids).size,"duplicate character in a scene");
 for(const npc of people){
   assert(stage.visibleCast.includes(npc.id),"guest not physically in storyboard scene");
   assert(known.has(npc.id),"guest shown before first introduction");
   assert.equal(npc.portrait,null,"unapproved face rendered");
   assert(registry.character(npc.id),"unknown guest character");
   assert(!["Рид","Картрайт","Грин"].some(alias=>npc.name.includes("Томми "+alias)||
      npc.name.includes("Мэйбл "+alias)),"false poster surname leaked");
   displayed++;
 }
 if(["D02","D03","HE02"].includes(v.scene.id)&&v.state.witnesses.ada==="detained")
   assert(!ids.includes("ada"),"detained Ada cannot appear in hideout");
 if(v.scene.id==="D06"&&v.state.witnesses.tommy==="detained")
   assert(!ids.includes("tommy"),"Tommy cannot reunite with Mabel from detention");
 if(v.scene.id==="Z02"){
   for(const id of ["ada","tommy","mercer"])
     assert.equal(ids.includes(id),v.state.witnesses[id]==="evacuated"&&known.has(id),
        "evacuation speaker is invented or wrong");
 }
 if(v.scene.id==="P01")assert.equal(people.length,0,"prologue betrays unknown identity");
 if(v.scene.id==="Z07")assert(!ids.includes("hero"),"dead hero shown as speaker");
 checks++;states++;
}
for(const hero of contract.heroes)for(const ending of contract.endings){
 const e=create(hero);
 verify(e.view());
 for(const [from,to,action] of goodRoute(hero,ending.id).actionLog){
   assert.equal(e.snapshot().node,from);
   e.choose(to,action);verify(e.view());
 }
}
assert(states>=1700,"too few story states tested");
{
 const e=create("jack");
 assert.deepEqual(participants(art.select(storyboard,e.view()),e.snapshot(),registry),[]);
 e.choose("P02");
 assert.deepEqual(participants(art.select(storyboard,e.view()),e.snapshot(),registry)
  .map(x=>x.name),["Мэйбл Кросс"]);
 const state=e.snapshot(),scene={id:"D06"};
 const original=storyboard.sceneAssets.find(x=>x.id===scene.id);
 assert(original.cast.includes("tommy")&&original.cast.includes("mabel"));
 const fake={...e.view(),scene,state:{...state,visited:[...state.visited,"D04","D06"],
   witnesses:{...state.witnesses,tommy:"detained"}}};
 const jailed=participants(art.select(storyboard,fake),fake.state,registry);
 assert(jailed.some(x=>x.id==="mabel"));
 assert(!jailed.some(x=>x.id==="tommy"));
 const freed={...fake,state:{...fake.state,
  witnesses:{...fake.state.witnesses,tommy:"protected"}}};
 const rescued=participants(art.select(storyboard,freed),freed.state,registry);
 assert(rescued.some(x=>x.id==="tommy"));
 const ada={...fake,scene:{id:"D02"},state:{...fake.state,
  visited:[...fake.state.visited,"D02"],witnesses:{...fake.state.witnesses,ada:"detained"}}};
 assert(!participants(art.select(storyboard,ada),ada.state,registry).some(x=>x.id==="ada"));
}
console.log("PASS Case002 dialogue cast: "+checks+" validated scene states over 35 endings, "+
 displayed+" correctly introduced guest appearances, no fake faces, sibling errors or impossible reunions.");
