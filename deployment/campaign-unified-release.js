#!/usr/bin/env node
"use strict";
/* Unified, same-origin campaign export — Cases 001 + 002.
 * Keep the isolated Case 002 beta exporter intact for comparison.
 * No game saves, engine rules or stable main are altered by this build.
 */
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,"..");
const DIST=path.join(ROOT,"campaign-unified-dist");
const approved=require("../src/case002/approved-art-v1.js").manifest;
const copied=new Set();let bytes=0;
// The active menu is cinema-home-v1. Keep its retired cabinet sources in Git,
// but never ship dead CSS/JS in the unified offline campaign.
const RETIRED_CABINET_ROOT=new Set([
 "home-lighting-v1.css","home-story-first-v1.css","home-story-first-v1.js",
 "cabinet-menu-v1.css","mobile-approved-menu-v1.css",
 "home-two-paths-v1.css","cabinet-profile-v2.css"
]);
const liveMarkup=fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
for(const retired of RETIRED_CABINET_ROOT)
 if(liveMarkup.includes(retired))
  throw Error("Cannot omit still-active menu dependency: "+retired);

function safe(name){
 if(typeof name!=="string"||!name||path.isAbsolute(name)||
    name.split(/[\\/]/).includes("..")||name.includes("\\"))
  throw Error("Unsafe campaign path: "+name);
 return name;
}
function copy(name,hash,output=name){
 safe(name);safe(output);
 if(copied.has(output))throw Error("Duplicate staged resource: "+name);
 const source=path.join(ROOT,name);
 const stat=fs.lstatSync(source);
 if(!stat.isFile()||stat.isSymbolicLink())
  throw Error("Non-regular campaign resource: "+name);
 const payload=fs.readFileSync(source);
 if(hash&&crypto.createHash("sha256").update(payload).digest("hex")!==hash)
  throw Error("Approved asset hash differs: "+name);
 if(name.endsWith(".webp")&&
   (payload.length<1000||payload.toString("ascii",0,4)!=="RIFF"||
    payload.toString("ascii",8,12)!=="WEBP"))
  throw Error("Invalid WebP: "+name);
 const dest=path.join(DIST,output);
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.writeFileSync(dest,payload);
 copied.add(output);bytes+=payload.length;
}
function recurseAssets(relative){
 const abs=path.join(ROOT,relative);
 for(const entry of fs.readdirSync(abs,{withFileTypes:true})){
  const item=relative+"/"+entry.name;
  if(entry.isSymbolicLink())throw Error("Symlink in published assets: "+item);
  if(entry.isDirectory()){
   if(item==="assets/case002"||item==="assets/criminal")continue; // only approved manifest assets may enter this subtree
   recurseAssets(item);continue;
  }
  if(entry.name===".gitkeep")continue; // source marker, never a web resource
  if(!entry.isFile()||!/\.(?:webp|jpg|jpeg|png|svg|ogg|mp3)$/i.test(entry.name))
   throw Error("Unexpected campaign asset (do not ship silently): "+item);
  copy(item);
 }
}
function assertReference(from,ref){
 const raw=String(ref||"").trim();
 let decoded="";
 try{decoded=decodeURIComponent(raw)}catch{throw Error("Bad asset escape: "+raw);}
 // CSS commonly encodes SVG paint/filter fragment references as url(%23n).
 // These are in-document IDs, never missing disk files.
 if(!raw||decoded.startsWith("#")||/^(?:data:|blob:)/i.test(decoded))
  return false;
 if(/^https?:\/\//i.test(raw)){
  if(from==="index.html"&&raw==="https://telegram.org/js/telegram-web-app.js")
   return false; // optional Telegram bridge; game works without it.
  if(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//i.test(raw))
   return false; // typographic enhancement only; local fallbacks exist.
  throw Error("Unexpected external runtime reference in "+from+": "+raw);
 }
 if(raw.startsWith("/")||/^[a-z][a-z\d+.-]*:/i.test(raw))
  throw Error("Nonportable campaign asset in "+from+": "+raw);
 const base=path.dirname(path.join(DIST,from));
 let name=raw.split(/[?#]/,1)[0];
 try{name=decodeURIComponent(name)}catch{throw Error("Invalid percent encoding: "+raw);}
 const full=path.resolve(base,name);
 if(!full.startsWith(DIST+path.sep)||!fs.existsSync(full)||
    !fs.statSync(full).isFile())
  throw Error("Missing packaged campaign reference: "+from+" -> "+raw);
 return true;
}
if(fs.existsSync(DIST)&&fs.lstatSync(DIST).isSymbolicLink())
 throw Error("Refusing to replace a symlink release directory");
fs.rmSync(DIST,{recursive:true,force:true});
// First ship the original campaign shell, its 001 scripts and styles.
for(const name of fs.readdirSync(ROOT)){
 if((name==="index.html"||/\.(?:js|css)$/.test(name))&&
    !RETIRED_CABINET_ROOT.has(name))copy(name);
}
// All historic Case 001 visual families remain available, including
// dynamically constructed scene/image/audio paths. Never ship drafts.
recurseAssets("assets");
copy("src/audio/playlist-v27.js");
copy("docs/criminal-operations/MUSIC-CREDITS-v30.txt",null,"MUSIC-CREDITS.txt");
const soundtrack=require("../docs/criminal-operations/soundtrack-proof-v30.json");
const approvedAudio=Object.values(require("../src/audio/playlist-v27.js").groups).flat().map(id=>"assets/audio/soundtrack/"+id+".mp3").sort();
const stagedAudio=[...copied].filter(name=>name.startsWith("assets/audio/")).sort();
if(JSON.stringify(stagedAudio)!==JSON.stringify(approvedAudio))throw Error("Unexpected soundtrack paths: "+stagedAudio.join(", "));
if(soundtrack.length!==approvedAudio.length)throw Error("Incomplete soundtrack proof");
for(const name of approvedAudio){
 const proof=soundtrack.find(row=>row.file===name);
 if(!proof||crypto.createHash("sha256").update(fs.readFileSync(path.join(DIST,name))).digest("hex")!==proof.sha256)throw Error("Packaged soundtrack mismatch "+name);
}
// Remove any Case 002 directory copied by the general enumerator if present.
// The recursive call is intentionally excluded for that directory below.
if(approved.schemaVersion!==1||approved.sceneImages.length!==102||
   approved.npcPortraits.length!==10)
 throw Error("Approved Case 002 manifest is incomplete");
const scenes=new Set(),shots=new Set();
for(const shot of approved.sceneImages){
 if(shot.review!=="approved"||shot.mobileWidth!==720||
    shot.mobileHeight!==900||!shot.mobileSha256||!shot.mobileFile)
  throw Error("Unapproved Case 002 frame: "+shot.sceneId);
 scenes.add(shot.sceneId);
 const name="assets/case002/scenes/"+shot.mobileFile;
 if(shots.has(name))throw Error("Duplicate scene image in approved manifest");
 shots.add(name);
 copy(name,shot.mobileSha256);
}
if(scenes.size!==89||shots.size!==102)throw Error("89/102 scene coverage missing");
const briefing=approved.briefingImage;
if(!briefing||briefing.review!=="approved"||
 briefing.path!=="assets/case002/briefing/case002-briefing-viaduct--mobile.webp"||
 briefing.mobileWidth!==720||briefing.mobileHeight!==900)
 throw Error("Missing reviewed Case 002 briefing");
copy(briefing.path,briefing.sha256);
for(const npc of approved.npcPortraits){
 if(npc.review!=="approved"||!npc.sha256)throw Error("Unapproved NPC image");
 copy("assets/case002/portraits/"+npc.file,npc.sha256);
}
for(const name of fs.readdirSync(path.join(ROOT,"src/case002")))
 if(name.endsWith(".js"))copy("src/case002/"+name);
for(const name of ["index.html","style.css","app.js"])
 copy("preview/case002-prototype/"+name);
// Criminal v2 is an additive, ordinary-script subtree: local HTML needs no fetch.
function copyCriminalScripts(relative){
 for(const entry of fs.readdirSync(path.join(ROOT,relative),{withFileTypes:true})){
  const name=relative+"/"+entry.name;
  if(entry.isSymbolicLink())throw Error("Symlink in criminal sources: "+name);
  if(entry.isDirectory())copyCriminalScripts(name);
  else if(entry.isFile()&&name.endsWith(".js")){
   // A story candidate is not a release resource until index explicitly loads it.
   if(/^src\/criminal\/missions\/cr[0-9]+\.js$/.test(name)&&!liveMarkup.includes('src="'+name+'"'))continue;
   copy(name);
  }
  else throw Error("Unexpected criminal runtime file: "+name);
 }
}
copyCriminalScripts("src/criminal");
const criminalArt=require("../src/criminal/art-manifest.js");
require("./criminal-art-contract.js")(criminalArt,
 [...liveMarkup.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]));
for(const frame of criminalArt.frames){
 if(frame.review!=="approved"||frame.width!==720||frame.height!==900||
   !/^assets\/criminal\/[a-z0-9-]+\.webp$/.test(frame.path)||!frame.sha256)
  throw Error("Invalid criminal art manifest entry: "+frame.id);
 copy(frame.path,frame.sha256);
}
const gearIds=Object.keys(require("../src/criminal/content.js").items);
if(gearIds.length!==28)throw Error("Expected exactly 28 registered criminal items");
for(const id of gearIds){
 if(!/^[a-zA-Z]+$/.test(id))throw Error("Unsafe equipment id: "+id);
 const name="assets/criminal/equipment/"+id+".svg";
 const svg=fs.readFileSync(path.join(ROOT,name),"utf8");
 if(!/^<svg\b/.test(svg)||/<script|<foreignObject|\bon\w+\s*=|\bhref\s*=/i.test(svg))
  throw Error("Unsafe criminal equipment SVG "+id);
 copy(name);
}
let references=0;
for(const frame of criminalArt.frames)
 if(assertReference("index.html",frame.path))references++;

for(const entry of ["index.html","preview/case002-prototype/index.html"]){
 const markup=fs.readFileSync(path.join(DIST,entry),"utf8");
 for(const match of markup.matchAll(/<(?:script|link|img|source)\b[^>]*?\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi))
  if(assertReference(entry,match[2]))references++;
}
for(const name of copied){
 if(!name.endsWith(".css"))continue;
 const css=fs.readFileSync(path.join(DIST,name),"utf8");
 for(const match of css.matchAll(/url\(\s*(["']?)([^"'()]+)\1\s*\)/gi))
  if(assertReference(name,match[2]))references++;
}
const home=fs.readFileSync(path.join(DIST,"index.html"),"utf8");
const second=fs.readFileSync(path.join(DIST,"preview/case002-prototype/index.html"),"utf8");
if(!home.includes('id="launchFirstCase"')&&!copied.has("case-v14.js"))
 throw Error("Case 001 campaign code absent");
if(!home.includes('case002-map-entry-v1.js')||
   !second.includes('../../index.html#district-digbeth'))
 throw Error("Broken main-map-to-Digbeth integration");
if(references<75)throw Error("Incomplete static reference scan: "+references);
if(bytes>75*1024*1024)throw Error("Unified publication exceeds 75 MiB: "+bytes);
for(const forbidden of ["assets/case002/candidates",
 "assets/case002/scenes/case002-p01-scene.webp"]){
 if(fs.existsSync(path.join(DIST,forbidden)))
  throw Error("Unapproved Case 002 material shipped: "+forbidden);
}
console.log("PASS unified campaign release: "+scenes.size+" scenes / "+shots.size+
 " reviewed WebPs, "+approved.npcPortraits.length+" NPCs, Cases 001+002, "+
 copied.size+" files, "+references+" staged references, "+
 (bytes/1048576).toFixed(2)+" MiB");
