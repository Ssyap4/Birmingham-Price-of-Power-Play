#!/usr/bin/env node
"use strict";
/* Reproducible compilation of Case 002 story files for offline HTML preview.
 * node tools/case002/build-browser-data.js [--check]
 */
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const file=p=>fs.readFileSync(path.join(root,p),"utf8");
const graph=JSON.parse(file("docs/case002/case002-beat-graph-v1.json"));
const contract=JSON.parse(file("docs/case002/case002-contract-v1.json"));
const storyboard=JSON.parse(file("docs/case002/case002-art-storyboard-v1.json"));
const docs=[
 "docs/case002/case002-screenplay-acts-1-3-v2.md",
 "docs/case002/case002-screenplay-acts-4-6-and-endings-v2.md",
 "docs/case002/case002-hero-scenes-v2.md"
];
const narration={};
for(const doc of docs){
 const text=file(doc),headers=[...text.matchAll(/^\*\*([A-Z]{1,2}\d{2}) — ([^\n]*?)\*\*/gm)];
 for(let i=0;i<headers.length;i++){
  const id=headers[i][1],start=headers[i].index+headers[i][0].length;
  const end=i+1<headers.length?headers[i+1].index:text.length;
  if(Object.hasOwn(narration,id))throw Error("duplicate story ID "+id);
  narration[id]=text.slice(start,end).replace(/\n###\s[\s\S]*$/,"")
   .replace(/\[[^\]]*\]/g,"").replace(/\*\*/g,"").replace(/\*/g,"")
   .replace(/^[ \t]*---[ \t]*$/gm,"").replace(/\n{3,}/g,"\n\n").trim();
 }
}
const names=graph.nodes.map(x=>x.id);
if(names.length!==89||names.some(x=>!narration[x])||Object.keys(narration).length!==names.length)
 throw Error("Case 002 prose must cover every one of 89 nodes exactly once");
if(storyboard.sceneAssets.length!==89 ||
 storyboard.sceneAssets.some(x=>!names.includes(x.id)))
 throw Error("Art storyboard must match all 89 narrative nodes");
const payload={graph,contract,narration,storyboard};
const output="/* GENERATED from docs/case002 source — edit those documents, not this file. */\n"+
 "(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();"+
 "else root.BirminghamCase002Data=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){return "+
 JSON.stringify(payload)+";});\n";
const target=path.join(root,"src/case002/browser-data-v3.js");
if(process.argv.includes("--check")){
 if(!fs.existsSync(target)||fs.readFileSync(target,"utf8")!==output)
  throw Error("Stale generated browser-data-v3.js — rebuild from scenario docs");
 console.log("PASS: Case 002 generated data matches 89 story scenes + verified graph");
}else{
 fs.writeFileSync(target,output);
 console.log("Generated 89-scene offline story payload ("+output.length+" bytes)");
}
