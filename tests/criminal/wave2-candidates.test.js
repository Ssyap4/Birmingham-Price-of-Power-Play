"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const C=require("../../src/criminal/content"),E=require("../../src/criminal/engine"),A=require("../../src/criminal/archive"),P=require("../../campaign-criminal-archive-v1"),ep=require("../../src/criminal/epilogues");
const proof=require("../../docs/criminal-operations/v2-evidence/routes.json");
for(let i=1;i<=10;i++)require("../../src/criminal/missions/cr"+String(i).padStart(2,"0"));
const paths={
 CR06:{clean:["accept","papers","listen","compare","consent","ask","compare","substantiate","sign"],costly:["accept","official","trust","insist","calm","comply","sign"],failed:["accept","official","trust","abandon","return"],dead:["accept","official","trust","insist","confront"]},
 CR07:{clean:["accept","clerk","respect","cabinet","read","confirm","limited","refuse","prepare","agree","submit","finish"],costly:["accept","owner","deal","take","copy","deal","limited","finish"],failed:["accept","owner","question","cabinet","leave","full","argue","leave","return"],dead:["accept","owner","question","cabinet","leave","full","argue","stand","hold"]},
 CR08:{clean:["accept","source","promise","photo","confirm","compare","verify","promise","consent","agree","exact","submit","finish"],costly:["accept","lawyer","take","record","skip","offer","deal","limited","submit","finish"],failed:["accept","source","listen","skip","record","skip","pressure","leave","return"],dead:["accept","source","listen","skip","record","skip","pressure","stay"]},
 CR09:{clean:["accept","hostess","respect","listen","verify","neutral","reconcile","honest","confirm","neutral","sign","finish"],costly:["accept","hostess","respect","draft","guarantee","reconcile","honest","confirm","guarantee","sign","finish"],failed:["accept","rival","promise","draft","neutral","reconcile","insist","leave","return"],dead:["accept","merchant","invite","draft","neutral","reconcile","raise","stand"]},
 CR10:{clean:["accept","foreman","floor","assess","observe","confirm","compare","review","pause","clear","verify","sign","finish"],costly:["accept","manager","rush","rush","deal","guarantee","finish"],failed:["accept","foreman","promise","review","pause","withdraw","return"],dead:["accept","foreman","promise","review","alarm","stay"]}
};
const ends=["clean","costly","failed","dead"];
function route(id,path,seed,attempt){let s=E.create(id,seed,attempt,1);for(const key of path){if(s.status==="finished")break;assert.ok(E.availability(s,key),id+" "+s.sceneId+":"+key);s=E.choose(s,key,s.revision);}return s;}
function terminal(id,end,attempt){for(let seed=0;seed<(end==="dead"?300:1);seed++){const s=route(id,paths[id][end],seed,attempt);if(s.terminalId===end)return s;}throw Error(id+" missing "+end);}
test("Ten-mission catalog: five heroes, two independent assignments per district, 40 isolated rewards",()=>{
 const catalog=C.catalog();assert.equal(catalog.length,10);for(const hero of C.heroes)assert.equal(catalog.filter(x=>x.heroId===hero).length,2);for(const district of C.districts)assert.equal(catalog.filter(x=>x.districtId===district.id).length,2);
 const data=new Map([["birmingham_case001_sentinel","case1"],["birmingham_case002_rewards_draft_v3","case2"]]),store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 function record(s,newAward=true){assert.ok(E.validateState(s).ok);assert.equal(s.status,"finished");assert.ok(A.save(store,s).ok);assert.equal(A.load(store,s.missionId).kind,"valid");const r=A.recover(store,s);assert.ok(r.ok,r.error);assert.equal(r.awardAdded,newAward);assert.equal(A.recover(store,s).awardAdded,false);}
 for(let i=1;i<=5;i++)for(const e of ends){const id="CR0"+i,p=proof.missions[id].terminalProofs[e];let s=E.create(id,p.seed,p.attemptId,p.startedAt);for(const step of p.path)s=E.choose(s,step.choiceId,s.revision);assert.equal(s.terminalId,e);record(s);}
 for(const e of ends)record(terminal("CR06",e,"v95_cr06_"+e));
 const oldSlots=[...data].filter(([k])=>k.startsWith(A.PREFIX+"save_")),oldLedger=A.ledger(store).value;assert.equal(Object.keys(oldLedger.rewards).length,24);
 for(const id of ["CR07","CR08","CR09","CR10"])for(const e of ends){const s=terminal(id,e,"v95_"+id+"_"+e);assert.equal(ep.describe(s).length,2);record(s);}
 for(const [k,v] of oldSlots)assert.equal(data.get(k),v);const before=A.ledger(store).value;for(const [k,v] of Object.entries(oldLedger.rewards))assert.equal(before.rewards[k],v);
 for(const id of ["CR07","CR08","CR09","CR10"])record(terminal(id,"clean","v95_repeat_"+id),false);
 const snap=P.snapshot(store,A,C);assert.equal(snap.status,"ready");assert.equal(snap.total,44);assert.equal(snap.unique,40);assert.equal(snap.missions.length,10);assert.ok(snap.missions.every(x=>x.rewards.length===4));assert.equal(new Set(snap.rewards.map(x=>x.title)).size,40);assert.equal(data.get("birmingham_case001_sentinel"),"case1");assert.equal(data.get("birmingham_case002_rewards_draft_v3"),"case2");
});
test("CR07: discarded proof cannot qualify as clean; no invented list at handoff",()=>{
 const s=route("CR07",["accept","clerk","respect","cabinet","read","confirm","copy","refuse","prepare"],0,"v95_discard");assert.ok(s.flags.originalSeen&&s.flags.provenance&&s.flags.discarded);assert.equal(E.availability(s,"agree"),false);assert.ok(E.availability(s,"limited"));
 const a=route("CR07",paths.CR07.clean.slice(0,-2),0,"v95_no_full");assert.equal(a.sceneId,"handoff");assert.equal(E.availability(a,"change"),false);
 const b=route("CR07",["accept","clerk","respect","cabinet","read","confirm","full","refuse","prepare","agree"],0,"v95_full");assert.ok(E.availability(b,"change"));const out=E.choose(b,"change",b.revision);assert.ok(out.flags.fullHeld&&!out.flags.exposed);const transfer=E.choose(out,"full",out.revision);assert.ok(transfer.flags.exposed);
});
test("CR09: verification alone cannot replace trust, consent and actual signatures",()=>{
 let s;for(let seed=0;seed<100;seed++){const state=route("CR09",["accept","rival","invite","private","relay","verify","raise","stand"],seed,"v95_trust_probe");if(state.status==="active"&&state.sceneId==="revision"){s=state;break;}}assert.ok(s);assert.ok(s.flags.ledger&&s.flags.receipt&&s.flags.merchantHeard&&s.flags.rivalHeard&&s.flags.mediator);assert.equal(s.stats.trust,25);assert.equal(E.availability(s,"neutral"),false);assert.equal(E.availability(s,"guarantee"),true);
});
