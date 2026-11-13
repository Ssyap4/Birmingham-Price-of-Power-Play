#!/usr/bin/env node
"use strict";
/* Deterministic production briefs. This does not generate or approve images.
 * Art generation consumes these briefs; the approved-art gate remains separate.
 */
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,"../..");
const wave=require("../../docs/case002/art-wave-01-v1.json");
const storyboard=require("../../docs/case002/case002-art-storyboard-v1.json");
const cast=require("../../src/case002/cast-registry-v1.js");
const sceneMap=new Map(storyboard.sceneAssets.map(s=>[s.id,s]));
const mobileRules=[
 "1920s industrial Birmingham, original cinematic noir; realistic period materials and costume",
 "compose TWO separate masters: 16:9 landscape and 9:16 portrait; never crop a horizontal master blindly",
 "keep every clue and character legible on 360px phone, with narrative action inside central 60%",
 "leave lower 25% free of crucial clues for the HTML dialogue and decision controls",
 "naturalistic sepia-gold and coal-blue light; no modern props, captions, readable AI-generated labels or UI",
 "no likeness of actors or copyrighted TV characters; do not reveal future evidence or villains"
];
const personRules=[
 "same face and distinguishing traits in every scene; no substitutions with Case 001 people",
 "neutral front, three-quarter and profile reference before scene rendering",
 "1920 Birmingham, period-accurate clothes, no captions, no copyrighted actor likeness",
 "separate original 4:5 portrait master, 9:16 phone-safe version when used in a scene"
];
function build(){
 if(wave.status!=="PRODUCTION_QUEUE_NOT_APPROVED_ART")throw Error("Wave already changed status");
 const shots=wave.shots.map(entry=>{
  const scene=sceneMap.get(entry.id);
  if(!scene||scene.stateVariants.length)throw Error("Unknown or variant-dependent scene "+entry.id);
  const people=scene.cast.filter(id=>cast.character(id)).map(id=>{
    const c=cast.character(id);return {id,name:c.name,appearance:c.appearance};
  });
  return {
   sceneId:entry.id,title:scene.title,location:scene.location,
   filename:scene.asset,mobileFilename:scene.asset.replace(/\.webp$/,"--mobile.webp"),
   cast:scene.cast,characterReferences:people,
   directorFocus:entry.focus,canonicalStoryboardShot:scene.shot,
   constraints:mobileRules,forbidden:entry.forbid,
   output:{landscape:"16:9",mobile:"9:16",format:"WebP",review:"manual visual+technical review before approval"}
  };
 });
 const portraits=wave.portraitIds.map(id=>{
  const person=cast.character(id);
  if(!person)throw Error("Unknown portrait "+id);
  return {id,name:person.name,role:person.role,appearance:person.appearance,
   filename:"case002-"+id+"-portrait.webp",constraints:personRules,
   output:{aspect:"4:5",format:"WebP",review:"identity match across all scene art"}};
 });
 return {schemaVersion:1,waveId:wave.waveId,caseId:"002",
   status:"BRIEFS_ONLY_NOT_GENERATED_NOT_APPROVED",
   sceneCount:shots.length,portraitCount:portraits.length,
   shots,portraits};
}
if(require.main===module){
 const result=build();
 const out=path.join(root,"docs/case002/art-production-pack-01-v1.json");
 const encoded=JSON.stringify(result,null,2)+"\n";
 if(process.argv.includes("--check")){
   if(!fs.existsSync(out)||fs.readFileSync(out,"utf8")!==encoded)
     throw Error("Art production pack is stale; regenerate using node tools/case002/build-art-production-pack-v1.js");
   console.log("PASS Case002 art production pack: "+result.sceneCount+" scene briefs + "+result.portraitCount+" identity sheets");
 }else{
   fs.writeFileSync(out,encoded);
   console.log("WROTE "+out);
 }
}
module.exports={build};
