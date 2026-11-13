#!/usr/bin/env node
"use strict";
/* Committed Case002 choices must survive restarts as a player-readable journal.
 * This tests historical effects, not future achievements.
 */
const assert=require("node:assert/strict");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
const journal=require("../../src/case002/journal-v1.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
const make=(hero="jack",store=null)=>createEngine({
 graph,contract,hero,store,attemptId:"journal-"+hero,now:()=>1700000000000
});
function memoryStore(){
 const data=new Map();
 return {getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,String(v))};
}
const label=id=>id==="brackett_accounts"?"Копия счетов Брэкетта":id;
let visits=0,lines=0;
for(const hero of contract.heroes){
 for(const ending of contract.endings){
  const store=memoryStore(),game=make(hero,store);
  const route=goodRoute(hero,ending.id).actionLog;
  for(const [from,to,action] of route){
   assert.equal(game.snapshot().node,from);
   const before=game.snapshot(),after=game.choose(to,action);
   const item=after.history.at(-1);
   assert(item.changes && Array.isArray(item.changes.evidence),"new event delta missing");
   for(const id of after.evidence.filter(x=>!before.evidence.includes(x)))
     assert(item.changes.evidence.includes(id),"new evidence lost from event");
   for(const [id,state] of Object.entries(after.witnesses)){
    if(state!==before.witnesses[id])
      assert.deepEqual(item.changes.witnesses[id],{from:before.witnesses[id],to:state},
       "incorrect witness status transition "+hero+"/"+id);
   }
   const list=journal.entries(after,label);
   assert(Array.isArray(list));
   assert(list.every(x=>x.to&&Array.isArray(x.notes)&&x.notes.length>0),
      "empty or invalid journal entry");
   visits++;
  }
  const finalEntries=journal.entries(game.snapshot(),label);
  assert(finalEntries.length>0,"history must keep at least one real consequence");
  assert(finalEntries.every(x=>!x.notes.some(note=>note.includes("undefined"))));
  const reloaded=make(hero,store);
  reloaded.load();
  assert.deepEqual(journal.entries(reloaded.snapshot(),label),finalEntries,
   "reloading changed earned journal history");
  lines+=finalEntries.length;
 }
}
// A handed-over original is history, not a current possession.
{
 const game=make("jack");
 for(const [from,to,action] of goodRoute("jack","trainControl").actionLog){
  if(from==="E09"&&to==="E10")break;
  game.choose(to,action);
 }
 game.choose("E10","passAccountsToWorkers");
 const all=journal.entries(game.snapshot(),label);
 assert(all[0].notes.some(s=>s.includes("Передано: Копия счетов Брэкетта")));
 assert(all[0].notes.some(s=>s.includes("Копия счетов передана")));
 assert(!game.snapshot().flags.brackettAccountsHeld);
}
// The betrayal is marked as the loss of safety, not as a second rescue.
{
 const game=make("jack");
 for(const [from,to,action] of goodRoute("jack","trainTruth").actionLog){
  if(from==="D10"&&to==="D01")break;game.choose(to,action);
 }
 for(const to of ["D01","D07","D08","D09"])game.choose(to);
 game.choose("D10","betrayAda");
 const item=journal.entries(game.snapshot(),label)[0];
 assert(item.notes.some(s=>s.includes("Ада Уэбб: под охраной")));
 assert(item.notes.some(s=>s.includes("Укрытие Ады раскрыто")));
 assert(!item.notes.some(s=>s.includes("эвакуирован")));
}
// A draft save created before the journal existed is still readable.
// We do not reconstruct unknown historical consequences or claim missing loot.
{
 const store=memoryStore(),g=make("jack",store);
 for(const to of ["P02","A01","A03","A05"])g.choose(to);
 const save=JSON.parse(store.getItem(g.storageKey));
 save.history=save.history.map(({from,to,action})=>({from,to,action}));
 store.setItem(g.storageKey,JSON.stringify(save));
 const reopened=make("jack",store);
 reopened.load();
 const old=journal.entries(reopened.snapshot(),label);
 assert(Array.isArray(old));
 assert(!old.some(x=>x.notes.some(t=>t.startsWith("Улика:"))),
   "old journal must not invent retrospective pickups");
 reopened.choose("A07");
 assert(Array.isArray(journal.entries(reopened.snapshot(),label)));
}
console.log("PASS Case002 persistent journal: "+visits+" verified transitions in "+
 contract.heroes.length*contract.endings.length+" paths, "+lines+
 " readable entries, save reload, custody and betrayal integrity.");
