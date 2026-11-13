#!/usr/bin/env node
"use strict";
/* Change-aware Case 002 QA policy. Fail closed for unfamiliar paths.
 * Full depth runs for branching/game state changes, targeted suites for UI,
 * art and presentation. workflow_dispatch always means a full release gate.
 */
const fs=require("node:fs");
const {execFileSync}=require("node:child_process");
const CATEGORIES=["deep","story","art","evidence","reporting","ui","visual","docs","ci"];
function category(file){
 const p=String(file||"").replace(/\\/g,"/");
 if(p==="docs/case002/README.md"||p==="docs/case002/case002-first-portrait-production-brief-v1.md")
   return "docs";
 if(/^docs\/case002\/.*(?:art-storyboard|visual-bible)/.test(p))return "art";
 if(/^docs\/case002\/.*(?:screenplay|hero-scenes|story-bible)/.test(p))return "story";
 if(/^docs\/case002\/(?:case002-contract|case002-beat-graph)/.test(p))return "deep";
 if(p.startsWith("docs/case002/"))return "docs";
 if(/^src\/case002\/(?:engine-v3|browser-data-v3)/.test(p))return "deep";
 if(p==="src/case002/story-variants-v4.js")return "story";
 if(/^src\/case002\/(?:evidence-icons|deduction-board)/.test(p))return "evidence";
 if(/^src\/case002\/(?:consequences|journal)/.test(p))return "reporting";
 if(/^src\/case002\/(?:scene-prose|scene-presentation)/.test(p))return "ui";
 if(p.startsWith("src/case002/"))return "art";
 if(p==="preview/case002-prototype/style.css")return "visual";
 if(p.startsWith("preview/case002-prototype/"))return "ui";
 if(p==="tools/case002/ci-scope-v1.js"||p==="tests/case002/ci-scope-v1.test.js")return "ci";
 if(p.startsWith("tools/case002/"))return "deep";
 if(p.startsWith("tests/case002/")){
   if(/(?:explore-v3|engine-v3|evidence-custody|validate-contract|validate-beat-graph|validate-canon|simulate-story-model)/.test(p))return "deep";
   if(/(?:story-variants|hero-v3)/.test(p))return "story";
   if(/(?:deduction-board|evidence-icons)/.test(p))return "evidence";
   if(/(?:journal|consequences)/.test(p))return "reporting";
   if(/(?:mobile_browser|scene-prose|scene-presentation)/.test(p))return "ui";
   return "art";
 }
 if(p===".github/workflows/case002-story-qa.yml")return "ci";
 if(p===".github/workflows/case002-mobile-smoke.yml")return "ui";
 // Unknown files may change a live dependency. They get the complete gate.
 return "deep";
}
function classify(files,{manual=false}={}){
 const known=new Set(files.map(category));
 if(manual||files.length===0)known.add("deep");
 const has=k=>known.has(k);
 const full=has("deep");
 const outputs={
   run_full:full,
   run_story:full||has("story"),
   run_art:full||has("art"),
   run_evidence:full||has("evidence"),
   run_reporting:full||has("reporting"),
   run_ui:full||has("ui")||has("visual"),
   run_bundle:full||has("story")||has("art"),
   run_browser:full||has("story")||has("art")||has("evidence")||
     has("reporting")||has("ui")||has("visual"),
   browser_full:full,
   scope_label:full?"full":CATEGORIES.filter(k=>known.has(k)).join("+")||"docs"
 };
 return outputs;
}
function changedFiles(env=process.env){
 if(env.CASE002_CHANGED_FILES)
   return env.CASE002_CHANGED_FILES.split("\n").filter(Boolean);
 const base=env.BASE_SHA,head=env.HEAD_SHA||"HEAD";
 if(env.EVENT_NAME==="workflow_dispatch"||!base||/^0+$/.test(base))
   return ["src/case002/engine-v3.js"];
 try{
   return execFileSync("git",["diff","--name-only",base,head,"--"],
     {encoding:"utf8",maxBuffer:1024*1024}).trim().split("\n").filter(Boolean);
 }catch(error){
   // A missing shallow base or a malformed event is a reason to test MORE.
   process.stderr.write("[Case002 scope] diff unavailable: "+error.message+"; full gate.\n");
   return ["src/case002/engine-v3.js"];
 }
}
if(require.main===module){
 const files=changedFiles();
 const outcome=classify(files,{manual:process.env.EVENT_NAME==="workflow_dispatch"});
 console.log("[Case002 scope] files="+JSON.stringify(files)+
   " selected="+JSON.stringify(outcome));
 if(process.argv.includes("--github-output")){
   if(!process.env.GITHUB_OUTPUT)throw Error("GITHUB_OUTPUT missing");
   fs.appendFileSync(process.env.GITHUB_OUTPUT,
     Object.entries(outcome).map(([k,v])=>k+"="+String(v)+"\n").join(""));
 }
}
module.exports={category,classify,changedFiles};
