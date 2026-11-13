#!/usr/bin/env node
"use strict";
/* Production-wave gate: match a large visual batch to the real 89-scene
 * storyboard and canonical NPCs. A brief NEVER proves that an asset exists.
 * Binary approval and browser decode remain separate CI gates.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const repoRoot=path.resolve(__dirname,"../..");
function verifyCommittedWebP(folder,name){
 const full=path.join(repoRoot,"assets/case002",folder,name);
 assert(fs.existsSync(full),"Approved art is not committed: "+name);
 const bytes=fs.readFileSync(full);
 assert(bytes.length>4000&&bytes.toString("ascii",0,4)==="RIFF"&&
   bytes.toString("ascii",8,12)==="WEBP",
   "Approved art is not a real WebP file: "+name);
}
const wave=require("../../docs/case002/art-wave-01-v1.json");
const board=require("../../docs/case002/case002-art-storyboard-v1.json");
const registry=require("../../src/case002/cast-registry-v1.js");
const {manifest}=require("../../src/case002/approved-art-v1.js");

function validateWave(plan=wave,storyboard=board,cast=registry,approved=manifest){
 assert(plan&&plan.schemaVersion===1&&plan.caseId==="002","Unsupported art-wave contract");
 assert.equal(plan.status,"PRODUCTION_QUEUE_NOT_APPROVED_ART",
   "A queue is not a proof of finished illustrations");
 assert.equal(plan.autonomousApproval,true,
   "Production art is approved by art director under ADR-0003");
 assert(Array.isArray(plan.shots)&&plan.shots.length>=8,
   "Use a meaningful batch of scenes, not one-off releases");
 assert(Array.isArray(plan.portraitIds)&&plan.portraitIds.length>=3);
 assert(storyboard&&Array.isArray(storyboard.sceneAssets)&&
   storyboard.sceneAssets.length===89,"Canonical 89-scene storyboard required");
 assert(approved&&approved.schemaVersion===1&&
   Array.isArray(approved.sceneImages)&&Array.isArray(approved.npcPortraits),
   "Real approved-art registry required");

 const names=new Set(),allScenes=new Map(storyboard.sceneAssets.map(x=>[x.id,x]));
 const shots=[];
 for(const item of plan.shots){
   assert(item&&/^(?:P|[A-F])\d{2}$/.test(item.id),
     "Invalid or out-of-scope scene ID in production wave");
   assert(!names.has(item.id),"Duplicate art-wave scene "+item.id);
   names.add(item.id);
   const canonical=allScenes.get(item.id);
   assert(canonical,"Unscripted art-wave scene "+item.id);
   assert(Array.isArray(canonical.stateVariants)&&canonical.stateVariants.length===0,
     "State-dependent scene needs a separately specified variant: "+item.id);
   assert(canonical.asset==="case002-"+item.id.toLowerCase()+"-scene.webp",
     "Unexpected destination filename for "+item.id);
   assert(typeof item.focus==="string"&&item.focus.length>=30,
     "Missing scene-specific camera direction: "+item.id);
   assert(Array.isArray(item.forbid)&&item.forbid.length>=2&&
     item.forbid.every(x=>typeof x==="string"&&x.length>=8),
     "Scene must declare real spoiler and visual errors: "+item.id);
   const registered=approved.sceneImages.filter(e=>e.sceneId===item.id);
   assert(registered.every(e=>e.variantKey==="default"&&e.review==="approved"),
     "Unexpected/unreviewed registration for "+item.id);
   assert(registered.length<=1,"Multiple approved images for "+item.id);
   if(registered.length){
     assert.equal(registered[0].file,canonical.asset,"Incorrect image filename");
     verifyCommittedWebP("scenes",canonical.asset);
   }
   shots.push({id:item.id,file:canonical.asset,location:canonical.location,
     cast:canonical.cast,approved:registered.length===1});
 }
 assert(names.has("P01")&&names.has("P02")&&names.has("A01"),
   "Opening P01/P02/A01 must remain in the first wave");
 assert(plan.shots.find(x=>x.id==="P01").forbid.some(x=>/23:31/.test(x)),
   "Opening must not accidentally depict Hale's later death");
 assert(plan.shots.find(x=>x.id==="A05").forbid.some(x=>/1920/.test(x)),
   "The antique passenger ticket is not valid in 1920");

 const portraitIds=new Set(),portraits=[];
 for(const id of plan.portraitIds){
   assert(typeof id==="string"&&!portraitIds.has(id),
     "Duplicate/invalid NPC reference "+String(id));
   portraitIds.add(id);
   const npc=cast.character(id);
   assert(npc,"Unknown person in art wave: "+id);
   assert(npc.portrait===null,"Do not pretend cast already has unapproved portrait");
   const registered=approved.npcPortraits.filter(e=>e.id===id);
   assert(registered.length<=1&&registered.every(e=>e.review==="approved"),
     "Invalid registered portrait for "+id);
   if(registered.length){
     const filename="case002-"+id+"-portrait.webp";
     assert.equal(registered[0].file,filename,"Wrong portrait identity filename");
     verifyCommittedWebP("portraits",filename);
   }
   portraits.push({id,name:npc.name,approved:registered.length===1});
 }
 assert(portraitIds.has("mabel")&&portraitIds.has("ada")&&portraitIds.has("tommy"),
   "The first batch must establish the Mabel/Tommy/Ada identity references");
 return {
   waveId:plan.waveId,
   plannedScenes:shots.length,
   approvedScenes:shots.filter(x=>x.approved).length,
   plannedPortraits:portraits.length,
   approvedPortraits:portraits.filter(x=>x.approved).length,
   scenes:shots,portraits
 };
}
if(require.main===module){
 try{
   const report=validateWave();
   console.log("PASS Case002 art wave "+report.waveId+": "+
     report.plannedScenes+" scene briefs ("+report.approvedScenes+" approved files), "+
     report.plannedPortraits+" face references ("+report.approvedPortraits+" approved files)");
   if(process.argv.includes("--require-complete")){
     assert.equal(report.approvedScenes,report.plannedScenes,
       "Art wave still contains unapproved scene images");
     assert.equal(report.approvedPortraits,report.plannedPortraits,
       "Art wave still contains unapproved reference portraits");
   }
 }catch(error){console.error("FAIL Case002 art wave: "+error.message);process.exitCode=1;}
}
module.exports={validateWave};
