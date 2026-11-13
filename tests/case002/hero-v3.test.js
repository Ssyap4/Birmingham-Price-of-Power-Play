#!/usr/bin/env node
"use strict";
/* Exercise all 15 specialized scenes via the real draft Case 002 engine.
 * In particular: expert routes may never skip the person/safety/document checkpoint.
 */
const assert=require("node:assert/strict");
const {createEngine}=require("../../src/case002/engine-v3.js");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
function make(hero){return createEngine({graph,contract,hero,attemptId:"specialist-"+hero});}
function move(game,steps){for(const step of steps){const [to,action]=Array.isArray(step)?step:[step,"continue"];const opts=game.availableChoices();
  const option=opts.find(o=>o.to===to&&o.action===action);
  assert(option,"missing "+game.snapshot().node+"->"+to+"/"+action);
  assert(option.enabled,game.snapshot().node+"->"+to+"/"+action+": "+option.reason);
  game.choose(to,action);
 }return game;}
const intro=["P02","A01","A03","A06","A08","A10","B01"];
const finalThird=["B11","B12","B13","B14","C01","C02","C03","C04","C05","C06","C07","C08","C09","C10"];
const toFourth=["D11","E01"];
// Jack: intimidate guard, rescue Tommy via a special gate, refrain from shooting.
{
 const g=make("jack");
 move(g,[...intro,"B05","HJ01","B07","B01","B02","B03","B04",...finalThird,
  "D01","D04","HJ02",["D06","extractTommy"],"D10",...toFourth,
  "E02","E03","E08","HJ03","E09","E10"]);
 assert.equal(g.snapshot().flags.jackHeldFire,true);
 assert.equal(g.snapshot().flags.jackGuardConfronted,true);
 assert.equal(g.snapshot().witnesses.tommy,"protected");
}
// Finn: copies authentic manifest, obtains the points record without stealing,
// and copies the inspector's document without inventing signed testimony.
{
 const g=make("finn");
 move(g,[...intro,"B02","HF01",["B04","copyManifest"],"B01","B05","B06","B07",
  "B11","B12","B13","B14","C01","C02","C03","HF02","C04","C05","C06","C07","C08","C09","C10",
  "D01","D07","D08","HF03",["D10","copyInspection"],...toFourth]);
 assert(g.snapshot().evidence.includes("dispatch_manifest"));
 assert(g.snapshot().flags.finnPostCopied && g.snapshot().flags.finnInspectionCopy);
 assert(!g.snapshot().evidence.includes("mercer_signed_statement"),
   "signed testimony requires Mercer to consent");
}
// Eleanor: photo evidence is not duplicated, obtains trust from Ada, checks
// independent proof before publication; skips no necessary late checkpoint.
{
 const g=make("eleanor");
 move(g,[...intro,"B02","HE01","B03","B04","B01","B08","B09","B10",
  ...finalThird,"D01","D02","HE02","D03",["D10","hideAda"],"D11","E01",
  "E02","HE03",["E03","verifyForPublication"],"E08","E09","E10"]);
 assert(g.snapshot().flags.eleanorPhotoLogged && g.snapshot().flags.adaTrust);
 assert.equal(g.snapshot().flags.publicContactSecured,true);
 assert.equal(g.snapshot().evidence.filter(x=>x==="dispatch_manifest").length,1);
}
// Victor's second detour must not jump directly into Mercer without introduction.
// His Vale meeting must visit legal guarantee scene before Brackett.
{
 const g=make("victor");
 move(g,[...intro,"B08","HV01","B10","B01","B05","B06","B07",
  ...finalThird,"D01","D02","D03",["D10","hideAda"],"D01","D04","D05","D06",
  "HV02",["D10","verifyTommyGuarantee"],"D11","E01","E06","HV03","E07",
  ["E08","verifyGuarantee"],"E09","E10"]);
 assert(g.snapshot().flags.valeDebt && g.snapshot().flags.valeContact);
 assert(g.snapshot().flags.victorGuaranteedTommy && g.snapshot().flags.valeGuarantee);
 assert.equal(g.snapshot().witnesses.tommy,"protected");
 assert.equal(g.snapshot().witnesses.ada,"protected");
}
// Samuel must pass the 23:31 clue and evacuate workers before line sabotage.
{
 const g=make("samuel");
 move(g,[...intro,"B05","HS01","B07","B01","B08","B09","B10",
  "B11","B12","B13","B14","C01","C02","HS02","C03","C04","C05","C06","C07","C08","C09","C10",
  "D01","D02","D03",["D10","hideAda"],"D11","E01","E04","HS03",
  ["E05","safeAccess"],["E08","clearWorkers"],"E09","E10","E11","F01",
  "F02","F03","F04","F05","F06","F08","F09","Z05"]);
 assert.equal(g.snapshot().ending,"trainSabotage");
 assert(g.snapshot().flags.samuelMappedSiding && g.snapshot().flags.samuelCouplingTraced);
 assert.equal(g.snapshot().flags.workersCleared,true);
}
console.log("PASS: 15 distinctive hero scenes, no bypass of key plot facts or safety, no phantom witness rescue.");
