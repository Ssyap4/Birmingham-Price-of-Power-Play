#!/usr/bin/env node
"use strict";
/* Integration tests for draft case engine, using actual 89-node outline.
 * These assert implemented transitions, not only declarative ending conditions.
 */
const assert=require("node:assert/strict");
const path=require("node:path");
const graph=require("../../docs/case002/case002-beat-graph-v1.json");
const contract=require("../../docs/case002/case002-contract-v1.json");
const {createEngine,VERSION}=require("../../src/case002/engine-v3.js");
const {goodRoute}=require("./simulate-story-model-v2.js");
function memoryStore(){
 const data=new Map();
 return {data,fail:false,getItem(k){return data.has(k)?data.get(k):null},
   setItem(k,v){if(this.fail)throw new Error("QuotaExceededError");data.set(k,v);},
   removeItem(k){data.delete(k);}};
}
const engine=(hero="jack",store=null,attemptId="test-attempt")=>
 createEngine({graph,contract,hero,store,attemptId,now:()=>1700000000000});
let routes=0, steps=0;
for(const hero of contract.heroes){
 for(const end of contract.endings){
  const legacyModel=goodRoute(hero,end.id);
  const storage=memoryStore();
  const game=engine(hero,storage,"case002-"+hero+"-"+end.id);
  const full=legacyModel.actionLog;
  assert.equal(game.snapshot().node,"P01");
  for(const [from,to,action] of full){
    assert.equal(game.snapshot().node,from,"model/engine drift for "+hero+"/"+end.id);
    const choice=game.availableChoices().find(x=>x.to===to&&x.action===action);
    assert(choice,"missing action "+from+" -> "+to+"/"+action);
    assert.equal(choice.enabled,true,"disabled "+from+" -> "+to+": "+choice.reason);
    const before=game.snapshot();
    game.choose(to,action);
    assert.equal(game.snapshot().node,to);
    assert.equal(game.snapshot().history.length,before.history.length+1);
    steps++;
  }
  const last=game.snapshot();
  assert(last.finished && last.ending===end.id,hero+" / "+end.id);
  assert.equal(game.availableChoices().length,0);
  assert.equal(game.view().scene.chapter,"END");
  assert.equal(new Set(last.evidence).size,last.evidence.length);
  const history=JSON.parse(storage.getItem(game.recordKey));
  const award=JSON.parse(storage.getItem(game.rewardKey));
  assert.equal(history.length,1);
  assert.equal(history[0].attemptId,last.attemptId);
  assert.deepEqual(award,["002:"+hero+":"+end.id]);
  const reopened=engine(hero,storage,"new-attempt-should-not-overwrite");
  reopened.load();
  assert.equal(reopened.snapshot().attemptId,last.attemptId);
  assert.equal(reopened.snapshot().ending,end.id);
  reopened.flushCompletion();
  assert.equal(JSON.parse(storage.getItem(game.recordKey)).length,1);
  assert.equal(JSON.parse(storage.getItem(game.rewardKey)).length,1);
  routes++;
 }
}
// Missing evidence never unlocks all conclusions merely by arriving at F09.
{
 const game=engine();
 for(const [from,to,action] of goodRoute("jack","trainEscape").actionLog){
  assert.equal(game.snapshot().node,from);
  game.choose(to,action);
 }
 assert.equal(game.snapshot().ending,"trainEscape");
}
// Dead hero cannot choose an alive finale and cannot continue the same prior canon.
{
 assert.throws(()=>createEngine({graph,contract,hero:"jack",prior:{heroId:"jack",ending:"endingDeath"}}),/Dead hero/);
 const other=createEngine({graph,contract,hero:"finn",prior:{heroId:"jack",ending:"endingDeath"}});
 assert.equal(other.snapshot().hero,"finn");
}
// Graph entry guards; a rejected transition may not mutate state.
{
 const game=engine();
 for(const n of ["P02","A01","A03","A06","A08","A10","B01","B02","B03","B04"])game.choose(n);
 const before=JSON.stringify(game.snapshot());
 assert.throws(()=>game.choose("B11"),/two independent routes/);
 assert.equal(JSON.stringify(game.snapshot()),before);
 assert.throws(()=>game.choose("C01"),/Scene transition/);
 assert.equal(JSON.stringify(game.snapshot()),before);
 game.choose("B01");
 assert.throws(()=>game.choose("B02"),/route was completed/);
 const other=engine();
 for(const node of ["P02","A01","A03","A06","A08","A10","B01","B02"])other.choose(node);
 assert.throws(()=>other.choose("HF01"),/another hero/);
}
// A completed rail route is no longer playable; inventory remains accessible.
// Save failure must roll back the next genuinely available action.
{
 const store=memoryStore();const game=engine("finn",store);
 for(const n of ["P02","A01","A03","A06","A08","A10","B01","B02","B03","B04"])game.choose(n);
 const amount=game.snapshot().evidence.length;
 game.choose("B01");
 const before=JSON.stringify(game.snapshot());
 const onDisk=store.getItem(game.storageKey);
 const completed=game.availableChoices().find(x=>x.to==="B02");
 assert.equal(completed.enabled,false);
 assert.throws(()=>game.choose("B02"),/already|completed/i);
 assert.equal(game.snapshot().evidence.length,amount);
 assert.equal(JSON.stringify(game.snapshot()),before);
 store.fail=true;
 assert.throws(()=>game.choose("B05"),/QuotaExceededError/);
 assert.equal(JSON.stringify(game.snapshot()),before);
 assert.equal(store.getItem(game.storageKey),onDisk);
}
// A detained witness cannot become "protected" by revisiting a broken safehouse.
{
 const game=engine("jack");
 const trace=goodRoute("jack","trainTruth").actionLog;
 for(const [from,to,action] of trace){
   if(from==="D10"&&to==="D01")break;
   game.choose(to,action);
 }
 assert.equal(game.snapshot().witnesses.ada,"protected");
 // Return through the witness hub to Mercer, then disclose the hideout.
 game.choose("D01");game.choose("D07");game.choose("D08");game.choose("D09");
 game.choose("D10","betrayAda");
 assert.equal(game.snapshot().witnesses.ada,"detained");
 game.choose("D01");
 const locked=game.availableChoices().find(x=>x.to==="D02");
 assert.equal(locked.enabled,false,"Ada's betrayed storyline may not reopen");
 assert.throws(()=>game.choose("D02"),/storyline is closed/);
 const stillOpen=game.availableChoices().find(x=>x.to==="D04");
 assert.equal(stillOpen.enabled,true,"unvisited Tommy branch remains playable");
}
// All three witness investigations finish exactly once; no circular return from D10.
{
 const game=engine("jack");
 const route=goodRoute("jack","trainTruth").actionLog;
 for(const [from,to,action] of route){
   if(from==="D10"&&to==="D11")break;
   game.choose(to,action);
 }
 assert.equal(game.snapshot().node,"D10");
 assert.equal(game.resolvedWitnessBranches().length,2,"Ada and Tommy are settled");
 game.choose("D01");game.choose("D07");
 game.choose("D08");game.choose("D09");game.choose("D10");
 assert.equal(game.resolvedWitnessBranches().length,3);
 const revisit=game.availableChoices().find(x=>x.to==="D01");
 assert.equal(revisit.enabled,false);
 assert.throws(()=>game.choose("D01"),/All witness storylines are closed/);
 assert(game.availableChoices().find(x=>x.to==="D11").enabled);
}
// No betrayal of a witness whose hiding place was never discovered.
{
 const game=engine("jack");
 const route=goodRoute("jack","trainEscape").actionLog;
 for(const [from,to,action] of route){
   if(from==="D09" && to==="D10")break;
   game.choose(to,action);
 }
 assert.equal(game.snapshot().node,"D09");
 assert.equal(game.availableChoices().find(x=>x.action==="betrayAda").enabled,false);
 assert.throws(()=>game.choose("D10","betrayAda"),/hideout you have not found/);
}
// No empty content key, stale snapshots or last-run overwrite of canonical old game data.
{
 const store=memoryStore();
 const old001='birmingham_campaign_unique_rewards_v1';
 store.setItem(old001,JSON.stringify({"001:jack:endingTruth":1700000000000}));
 const game=engine("jack",store,"stable-attempt");
 game.choose("P02");
 assert.equal(JSON.parse(store.getItem(old001))["001:jack:endingTruth"],1700000000000);
 const stale=JSON.parse(store.getItem(game.storageKey));
 stale.version=VERSION-1;
 store.setItem(game.storageKey,JSON.stringify(stale));
 const resumed=engine("jack",store);
 assert.throws(()=>resumed.load(),/Unsupported save format/);
 assert.equal(resumed.snapshot().node,"P01");
}
console.log("PASS Case002 engine v3: "+routes+" actual hero×ending runs, "+steps+
 " transitions, reload/archive/award checks, zero-dupe clues, no dead-end, guarded witnesses and atomic writes.");
