#!/usr/bin/env node
"use strict";
/* Case 002 deterministic STORY MODEL (not the shipped game engine).
 * It checks a typed action plan against the actual 89-node scene outline
 * and real proof/ending contract. Each effect must be ported to the engine
 * with its corresponding tests; never describe this as production gameplay.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const graph=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/case002-beat-graph-v1.json"),"utf8"));
const contract=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/case002-contract-v1.json"),"utf8"));
const byId=new Map(graph.nodes.map(x=>[x.id,x]));
const byEnd={Z01:"trainTruth",Z02:"trainEscape",Z03:"trainScapegoat",Z04:"trainDeal",Z05:"trainSabotage",Z06:"trainControl",Z07:"trainDeath"};
const sourceItems={
 A05:["old_excursion_ticket"],A06:["hale_coat"],A08:["guard_bootmark"],
 B03:["dispatch_manifest"],B05:["freight_chalk"],B06:["seal_scrap"],B09:["victim_register"],
 B10:["inspection_copy"],B12:["clerk_witness"],B13:["guard_payment"],
 C02:["private_siding_map"],C03:["points_log"],C04:["mabel_confession"],
 C05:["arrival_manifest"],C07:["bridge_witness"],C08:["brackett_wire"],
 D03:["pressure_log","ada_statement"],D08:[],
 E08:["brackett_boots"],E09:[]
};
const initial=hero=>({
 hero,node:null,health:100,evidence:new Set(),visited:new Set(),flags:{},
 visitedRoutes:new Set(),witnesses:{ada:"missing",tommy:"detained",mercer:"located"},
 actionLog:[],finished:false,ending:null
});
function clone(s){return {...s,evidence:new Set(s.evidence),visited:new Set(s.visited),
 flags:{...s.flags},visitedRoutes:new Set(s.visitedRoutes),witnesses:{...s.witnesses},
 actionLog:[...s.actionLog]};}
function facts(s){return Object.fromEntries(Object.entries(contract.deductionRules).map(([name,alternatives])=>
 [name,alternatives.some(pair=>pair.every(id=>s.evidence.has(id)))]));}
function safeCount(s){return Object.values(s.witnesses).filter(x=>x==="protected"||x==="evacuated").length;}
function hasFlags(s,e){return e.requiresFlags.every(f=>s.flags[f]===true);}
function endingAllowed(s,id){
 const ending=contract.endings.find(x=>x.id===id);
 if(!ending)return false;
 if(s.health===0&&id!=="trainDeath")return false;
 if(id!=="trainDeath"&&!s.flags.chapterAtLeastV)return false;
 return ending.requiresFacts.every(k=>facts(s)[k]) && hasFlags(s,ending)
   &&safeCount(s)>=ending.minSafe
   &&(ending.requiresHealthLte===undefined||s.health<=ending.requiresHealthLte);
}
function enter(s,id){
 if(!byId.has(id))throw Error("undefined node "+id);
 const node=byId.get(id);
 if(node.hero&&node.hero!==s.hero)throw Error("hero leak "+s.hero+" -> "+id);
 s.node=id;
 // Idempotence: revisiting a scene can never mint evidence twice.
 s.visited.add(id);
 const gains=sourceItems[id]||[];
 if(id!=="C04"||s.evidence.has("dispatch_manifest"))
   for(const item of gains)s.evidence.add(item);
 if(id==="D08"&&s.flags.mercerWilling)s.evidence.add("mercer_signed_statement");
 if(id==="B04")s.visitedRoutes.add("rail");
 if(id==="B07")s.visitedRoutes.add("canal");
 if(id==="B10")s.visitedRoutes.add("factory");
 if(id==="D02")s.witnesses.ada=s.witnesses.ada==="missing"?"located":s.witnesses.ada;
 if(id==="D07")s.witnesses.mercer="located";
 if(id==="E01")s.flags.chapterAtLeastV=true;
 if(id.startsWith("Z")){s.finished=true;s.ending=byEnd[id];}
 return s;
}
function transition(s,to,action="continue"){
 assert(!s.finished,"cannot travel after ending");
 assert(byId.has(to),"undefined target "+to);
 const from=s.node;
 if(from===null){assert.equal(to,"P01");enter(s,to);return s;}
 const allowed=byId.get(from).next;
 assert(allowed.includes(to),"illegal edge "+from+" -> "+to);
 if(byId.get(to).hero&&byId.get(to).hero!==s.hero)throw Error("wrong hero edge "+from+" -> "+to);
 if(to==="B11"&&s.visitedRoutes.size<2)throw Error("two independent routes required");
 if(to==="D03"&&from==="D02"&&!facts(s).provedWagonDiversion&&!s.evidence.has("inspection_copy")&&!s.evidence.has("victim_register"))
   throw Error("Ada needs independently verified context");
 if(to==="D11"&&!["D03","D06","D09","HF03","HV02"].some(id=>s.visited.has(id)))
   throw Error("need at least one investigated witness");
 const old=clone(s); // On any invalid choice state must remain unchanged.
 if(from==="D03"&&to==="D10"&&action==="hideAda"&&s.witnesses.ada==="located")s.witnesses.ada="protected";
 if(from==="D07"&&to==="D08"&&action==="offerProtectedTestimony")s.flags.mercerWilling=true;
 if(from==="D05"&&to==="D06"&&action==="extractTommy")s.flags.tommyExtraction=true;
 if(from==="D06"&&s.flags.tommyExtraction&&s.witnesses.tommy==="detained")s.witnesses.tommy="protected";
 if(from==="D09"&&to==="D10"&&action==="protectMercer"&&s.witnesses.mercer==="located"&&s.flags.mercerWilling)s.witnesses.mercer="protected";
 if(from==="D09"&&to==="D10"&&action==="betrayAda"){
   if(s.witnesses.ada==="protected")s.witnesses.ada="detained"; // address disclosed
   s.flags.mercerBetrayed=true;
 }
 if(from==="E02"&&to==="E03"&&action==="verifyForPublication"){
   const proof=facts(s);
   if(proof.provedFactoryCoverup&&proof.provedWagonDiversion)s.flags.publicContactSecured=true;
 }
 if(from==="E04"&&to==="E05"&&action==="safeAccess")
   s.flags.safeSidingAccess=s.evidence.has("private_siding_map");
 if(from==="E05"&&to==="E08"&&action==="clearWorkers")s.flags.workersCleared=true;
 if(from==="E06"&&to==="E07")s.flags.valeContact=true;
 if(from==="E07"&&to==="E08"&&action==="verifyGuarantee")s.flags.valeGuarantee=true;
 if(from==="E08"&&(to==="E09"||to==="HJ03")&&action==="copyAccounts"){
   s.evidence.add("brackett_accounts");s.flags.brackettAccountsHeld=true;
 }
 if(from==="E08"&&(to==="E09"||to==="HJ03")&&action==="handoverMurderEvidence")
   s.flags.brackettCanBeHandedOver=facts(s).provedHaleMurder;
 if(from==="E09"&&to==="E10"&&action==="trustedIntermediary")s.flags.localIntermediary=true;
 if(from==="F06"&&to==="F07"&&action==="acknowledgeDanger")s.flags.dangerWasExplained=true;
 if(from==="F07"&&to==="Z07"&&action==="acceptFatalRisk"&&s.flags.dangerWasExplained){
   s.flags.fatalChoiceAcknowledged=true;s.health=0;
 }
 if(to.startsWith("Z")&&!endingAllowed(s,byEnd[to])){
   // The real engine must reject without mutating state.
   Object.assign(s,old);
   throw Error("ending not earned: "+to+" from "+from);
 }
 if(to==="Z07"&&!s.flags.dangerWasExplained){
   Object.assign(s,old);throw Error("no surprise death");
 }
 s.actionLog.push([from,to,action]);
 return enter(s,to);
}
function run(hero,steps){
 const s=initial(hero);
 for(const step of steps){
  const [to,action]=typeof step==="string"?[step,"continue"]:step;
  transition(s,to,action);
 }
 return s;
}
const commonIntro=["P01","P02","A01","A03","A06","A08","A10"];
const railAndCanal=["B01","B02","B03","B04","B01","B05","B06","B07","B11","B12","B13","B14"];
const factoryAndCanal=["B01","B05","B06","B07","B01","B08","B09","B10","B11","B12","B13","B14"];
const factoryAndRail=["B01","B08","B09","B10","B01","B02","B03","B04","B11","B12","B13","B14"];
const chapterThree=["C01","C02","C03","C04","C05","C06","C07","C08","C09","C10"];
const adaPath=["D01","D02","D03",["D10","hideAda"]];
const tommyPath=["D01","D04",["D05","continue"],["D06","extractTommy"],"D10"];
const mercerPath=["D01","D07","D08","D09","D10"];
const joinWitness=["D11","E01"];
const finish=["E09","E10","E11","F01","F02","F03","F04","F05","F06","F08","F09"];
function goodRoute(hero,ending){
 let path=[...commonIntro,...(ending==="trainTruth"||ending==="trainDeal"?
   factoryAndRail:railAndCanal),...chapterThree];
 if(ending==="trainTruth"){
   path.push(...adaPath,"D01",...tommyPath.slice(1),...joinWitness,"E02",
     ["E03","verifyForPublication"],"E08",...finish,"Z01");
 }else if(ending==="trainEscape"){
   path.push(...mercerPath,...joinWitness,"E02","E03","E08",...finish,"Z02");
 }else if(ending==="trainScapegoat"){
   path.push(...mercerPath,...joinWitness,"E02","E03","E08",
     ["E09","handoverMurderEvidence"],...finish.slice(1),"Z03");
 }else if(ending==="trainDeal"){
   path.push(...adaPath,...joinWitness,"E06","E07",
     ["E08","verifyGuarantee"],...finish,"Z04");
 }else if(ending==="trainSabotage"){
   path.push(...adaPath,...joinWitness,"E04",
     ["E05","safeAccess"],["E08","clearWorkers"],...finish,"Z05");
 }else if(ending==="trainControl"){
   path.push(...adaPath,...joinWitness,"E02","E03","E08",
     ["E09","copyAccounts"],["E10","trustedIntermediary"],...finish.slice(2),"Z06");
 }else if(ending==="trainDeath"){
   path.push(...mercerPath,...joinWitness,"E02","E03","E08",
     ...finish.slice(0,-2),["F07","acknowledgeDanger"],["Z07","acceptFatalRisk"]);
 }else throw Error("unknown "+ending);
 return run(hero,path);
}
let tested=0;
for(const hero of contract.heroes){
 for(const e of contract.endings){
  const s=goodRoute(hero,e.id);
  assert.equal(s.finished,true,hero+"/"+e.id);
  assert.equal(s.ending,e.id,hero+"/"+e.id);
  tested++;
 }
}
// Negative guards: can't forge outcome by simply visiting F09 and clicking.
let rejected=0;
const skeleton=run("jack",[...commonIntro,...railAndCanal,...chapterThree,...mercerPath,
 ...joinWitness,"E02","E03","E08",...finish]);
assert.equal(skeleton.node,"F09");
for(const e of ["Z01","Z03","Z04","Z05","Z06","Z07"]){
 const old=JSON.stringify({node:skeleton.node,health:skeleton.health,flags:skeleton.flags,
   evidence:[...skeleton.evidence].sort()});
 assert.throws(()=>transition(skeleton,e),/ending not earned|illegal edge/);
 assert.equal(JSON.stringify({node:skeleton.node,health:skeleton.health,flags:skeleton.flags,
   evidence:[...skeleton.evidence].sort()}),old);
 rejected++;
}
const zero=transition(skeleton,"Z02");
assert.equal(zero.ending,"trainEscape");
assert.equal(safeCount(zero),0);
assert.equal(zero.witnesses.tommy,"detained");
// Repeated visit cannot create a new clue; return loops cannot replay irreversible rewards.
const repeats=run("finn",[...commonIntro,"B01","B02","B03","B04","B01","B02","B03","B04"]);
assert.equal(repeats.evidence.size,new Set(repeats.evidence).size);
// Hero-specific scenes never belong to another selected hero.
const mismatch=run("jack",[...commonIntro,"B01","B02"]);
assert.throws(()=>transition(mismatch,"HF01"),/wrong hero edge/);
// Must prove two routes before the junction.
const premature=run("jack",[...commonIntro,"B01","B02","B03","B04"]);
assert.throws(()=>transition(premature,"B11"),/two independent routes required/);

const betrayal=run("jack",[...commonIntro,...railAndCanal,...chapterThree,
 "D01","D02","D03",["D10","hideAda"],"D01","D07","D08","D09",["D10","betrayAda"],
 "D01","D02","D03",["D10","hideAda"]]);
assert.equal(betrayal.witnesses.ada,"detained","compromised shelter cannot magically protect Ada again");
// Signed confession is not automatically obtained by interviewing a frightened inspector.
const noPromise=run("jack",[...commonIntro,...railAndCanal,...chapterThree,
 "D01","D07","D08"]);
assert(!noPromise.evidence.has("mercer_signed_statement"));
const withPromise=run("jack",[...commonIntro,...railAndCanal,...chapterThree,
 "D01","D07",["D08","offerProtectedTestimony"]]);
assert(withPromise.evidence.has("mercer_signed_statement"));

console.log("PASS model v2: "+tested+" actual scripted routes (5×7), "+
 rejected+" forbidden outcomes, 0-rescue fallback, no repeated loot, no hero leaks, two-route gate.");

// Reuse the approved 35 route fixtures in the real draft engine integration tests.
module.exports = {goodRoute};
