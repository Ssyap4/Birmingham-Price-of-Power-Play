#!/usr/bin/env node
"use strict";
/* Universal visual-shot compiler for Case 002.
 * The render prompt is visual-only. Plot restrictions, negative examples,
 * and production language appear ONLY in a separate review card.
 * This module DOES NOT invoke image generation or approve its results.
 */
const fs=require("node:fs"),path=require("node:path");
const SHOT_KINDS=Object.freeze({
 environment:"Establish the place as a lived-in environment, with clear foreground, middle distance, and depth.",
 dialogue:"Capture a particular moment of human exchange through expression, gesture, and spatial relationships.",
 action:"Capture a physically legible instant of motion and its consequences within the same continuous space.",
 emotion:"Convey the emotional turning point through posture, hands, expression, and stillness.",
 evidence:"Give a specific physical object or trace clear visual priority within its real surroundings.",
 transition:"Show the change of place or situation through a readable cinematic event and environmental context.",
 aftermath:"Show what remains after an event, allowing absence and physical surroundings to carry the drama."
});
const UNSAFE_RENDER=/\b(?:infographic|collage|poster|dashboard|GitHub|workflow|CI|approval|approved|generator|prompt|checklist|roadmap|case002|art wave)\b/i;
function requiredString(v,name,max=500){
 if(typeof v!=="string"||!v.trim()||v.length>max)throw Error("Invalid "+name);
 return v.trim();
}
function validateCard(c,{requiresKind=false}={}){
 if(!c||typeof c!=="object")throw Error("Invalid scene card");
 const id=requiredString(c.id,"id",3);
 if(!/^[A-Z]\d{2}$/.test(id))throw Error("Invalid scene ID "+id);
 if(requiresKind&&!Object.hasOwn(SHOT_KINDS,c.sceneKind))
  throw Error(id+": missing or unsupported sceneKind");
 if(c.sceneKind!==undefined&&!Object.hasOwn(SHOT_KINDS,c.sceneKind))
  throw Error(id+": unsupported sceneKind");
 for(const k of ["focus","camera","location","background","light","npc","knowledgeBoundary"])
  requiredString(c[k],id+"."+k);
 if(!Array.isArray(c.required)||c.required.length<2||c.required.length>4)
  throw Error(id+": 2-4 required visual markers needed");
 if(!Array.isArray(c.avoid)||c.avoid.length<1||c.avoid.length>7)
  throw Error(id+": 1-7 review exclusions needed");
 c.required.forEach((v,i)=>requiredString(v,id+".required"+i,220));
 c.avoid.forEach((v,i)=>requiredString(v,id+".avoid"+i,220));
 const details=JSON.stringify(Object.fromEntries(Object.entries(c).filter(([k])=>k!=="id")));
 if(/\b[A-F]\d{2}\b/i.test(details))throw Error(id+": another scene ID leaked into card");
 return c;
}
function validateBatch(spec){
 if(!spec||![1,2].includes(spec.schemaVersion)||!Array.isArray(spec.scenes)||!spec.scenes.length)
  throw Error("Invalid scene card batch");
 const seen=new Set();
 for(const card of spec.scenes){
  validateCard(card,{requiresKind:spec.schemaVersion===2});
  if(seen.has(card.id))throw Error("Duplicate scene ID "+card.id);
  seen.add(card.id);
 }
 return spec.scenes;
}
function promptFor(card){
 const c=validateCard(card);
 const kind=SHOT_KINDS[c.sceneKind||"evidence"];
 // Do not include the card ID, knowledgeBoundary, avoid list, or meta-process.
 // Negative strings like "infographic" and "collage" were contaminating outputs.
 const p=[
  "A single continuous photorealistic cinematic moment in industrial England during the 1920s. Vertical portrait composition, 4:5.",
  kind,
  "The scene takes place in "+c.location+".",
  "The main visual moment: "+c.focus+".",
  "Camera placement: "+c.camera+".",
  "Essential visible details: "+c.required.join("; ")+".",
  "Surroundings: "+c.background+".",
  "Lighting: "+c.light+".",
  "People in view: "+c.npc+".",
  "Believable physical materials, realistic perspective, natural atmospheric depth, restrained period color grading."
 ].join("\n");
 if(UNSAFE_RENDER.test(p))throw Error(c.id+": production/status words contaminated render-only prompt");
 if(/\b[A-F]\d{2}\b/.test(p))throw Error(c.id+": scene ID contaminated render-only prompt");
 return p;
}
function reviewFor(card){
 const c=validateCard(card);
 return {id:c.id,sceneKind:c.sceneKind||"evidence",visualMoment:c.focus,
  knowledgeBoundary:c.knowledgeBoundary,doNotDepict:c.avoid,
  essentialMarkers:c.required,
  requiresHumanArtReview:true,automationDoesNotApprove:true};
}
function main(argv=process.argv.slice(2)){
 const args={};
 for(let i=0;i<argv.length;i++){
  const a=argv[i];
  if(["--all","--review"].includes(a))args[a.slice(2)]=true;
  else if(["--cards","--id","--out-dir"].includes(a)){
   if(!argv[i+1]||argv[i+1].startsWith("--"))throw Error("Missing "+a+" value");
   args[a.slice(2).replace("-","")]=argv[++i];
  }else throw Error("Unexpected CLI argument "+a);
 }
 if(!args.cards||Boolean(args.id)===Boolean(args.all)||
     args.all&&!args.outdir||args.id&&args.outdir||args.review&&!args.id)
  throw Error("Usage: --cards FILE (--id C09 [--review] | --all --out-dir DIR)");
 const cards=validateBatch(JSON.parse(fs.readFileSync(args.cards,"utf8")));
 if(args.id){
  const card=cards.find(x=>x.id===args.id);
  if(!card)throw Error("Unknown scene card "+args.id);
  process.stdout.write(args.review?JSON.stringify(reviewFor(card),null,2)+"\n":promptFor(card)+"\n");
  return;
 }
 const dir=path.resolve(args.outdir);
 fs.mkdirSync(dir,{recursive:true});
 for(const c of cards)
  fs.writeFileSync(path.join(dir,"case002-"+c.id.toLowerCase()+"-single-shot.txt"),
    promptFor(c)+"\n","utf8");
 console.log("Prepared "+cards.length+" independent visual-only scene prompts in "+dir);
}
if(require.main===module)try{main()}catch(e){console.error("SCENE-PROMPT FAILED: "+e.message);process.exit(2)}
module.exports={SHOT_KINDS,validateCard,validateBatch,promptFor,reviewFor,main};
