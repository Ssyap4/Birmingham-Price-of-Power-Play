#!/usr/bin/env node
"use strict";
// Case 002: one independent scene prompt per request, never a collage.
// Prompt preparation only. This does not call an image model or approve art.
const fs=require("node:fs"),path=require("node:path");
function validString(v,name,max=400){
 if(typeof v!=="string"||!v.trim()||v.length>max)throw Error("Invalid "+name);
 return v.trim();
}
function validateCard(c){
 if(!c||typeof c!=="object")throw Error("Invalid scene card");
 const id=validString(c.id,"id",3);
 if(!/^[A-Z]\d{2}$/.test(id))throw Error("Invalid scene ID "+id);
 for(const k of ["focus","camera","location","background","light","npc","knowledgeBoundary"])
  validString(c[k],id+"."+k);
 if(!Array.isArray(c.required)||c.required.length<2||c.required.length>4)
  throw Error(id+": 2-4 required visual markers needed");
 if(!Array.isArray(c.avoid)||c.avoid.length<1||c.avoid.length>7)
  throw Error(id+": 1-7 exclusions needed");
 for(const [i,v] of c.required.entries())validString(v,id+".required"+i,180);
 for(const [i,v] of c.avoid.entries())validString(v,id+".avoid"+i,180);
 const details=JSON.stringify(Object.fromEntries(Object.entries(c).filter(([k])=>k!=="id")));
 if(/\b[A-F]\d{2}\b/i.test(details))throw Error(id+": adjacent scene ID detected");
 return c;
}
function validateBatch(spec){
 if(!spec||spec.schemaVersion!==1||!Array.isArray(spec.scenes)||!spec.scenes.length)
  throw Error("Invalid scene card batch");
 const ids=new Set();
 for(const c of spec.scenes){
  validateCard(c);
  if(ids.has(c.id))throw Error("Duplicate scene ID "+c.id);
  ids.add(c.id);
 }
 return spec.scenes;
}
function promptFor(c){
 validateCard(c);
 return [
  "Create exactly ONE independent vertical 4:5 photorealistic cinematic still, 1920s industrial Birmingham.",
  "VISUAL CENTER: "+c.focus+".",
  "CAMERA: "+c.camera+".",
  "LOCATION: "+c.location+".",
  "REQUIRED DETAILS: "+c.required.join("; ")+".",
  "BACKGROUND ONLY: "+c.background+".",
  "LIGHT: "+c.light+".",
  "PEOPLE: "+c.npc+".",
  "PLAYER KNOWLEDGE BOUNDARY: "+c.knowledgeBoundary+".",
  "AVOID: "+c.avoid.join("; ")+"; collage; infographic; multiple panels; captions; UI; fixed playable hero; invented readable facts.",
  "One continuous scene; sharply readable focal object; realistic 1920s materials."
 ].join("\n");
}
function main(argv=process.argv.slice(2)){
 const args={};
 for(let i=0;i<argv.length;i++){
  const x=argv[i];
  if(x==="--all")args.all=true;
  else if(["--cards","--id","--out-dir"].includes(x)){
   if(!argv[i+1])throw Error("Missing argument "+x);
   args[x.slice(2).replace("-","")]=argv[++i];
  }else throw Error("Unexpected argument "+x);
 }
 if(!args.cards||Boolean(args.id)===Boolean(args.all)||args.all&&!args.outdir||args.id&&args.outdir)
  throw Error("Usage: --cards FILE (--id C04 | --all --out-dir DIR)");
 const cards=validateBatch(JSON.parse(fs.readFileSync(args.cards,"utf8")));
 if(args.id){
  const card=cards.find(x=>x.id===args.id);
  if(!card)throw Error("No card for "+args.id);
  process.stdout.write(promptFor(card)+"\n");
  return;
 }
 const dir=path.resolve(args.outdir);
 fs.mkdirSync(dir,{recursive:true});
 for(const card of cards){
  const filename="case002-"+card.id.toLowerCase()+"-single-shot.txt";
  fs.writeFileSync(path.join(dir,filename),promptFor(card)+"\n","utf8");
 }
 console.log("Created "+cards.length+" separate prompts in "+dir);
}
if(require.main===module){try{main()}catch(e){console.error("PROMPT CARD FAILED: "+e.message);process.exit(2)}}
module.exports={validateCard,validateBatch,promptFor,main};
