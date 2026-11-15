#!/usr/bin/env node
"use strict";
// Isolated Case 002 Safari preview. Never edits Case 001 or stable main.
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,".."),OUT=path.join(ROOT,"case002-preview-dist");
const manifest=require("../src/case002/approved-art-v1.js").manifest;
function safe(rel){
 if(typeof rel!=="string"||rel.startsWith("/")||rel.split("/").includes(".."))
   throw Error("Unsafe preview path: "+rel);
 return rel;
}
let files=0,bytes=0;
function copy(rel,expectedHash){
 rel=safe(rel);
 const data=fs.readFileSync(path.join(ROOT,rel));
 if(expectedHash&&crypto.createHash("sha256").update(data).digest("hex")!==expectedHash)
   throw Error("Approved SHA-256 mismatch: "+rel);
 if(rel.endsWith(".webp")&&(data.length<1000||
   data.toString("ascii",0,4)!=="RIFF"||data.toString("ascii",8,12)!=="WEBP"))
   throw Error("Invalid approved WebP: "+rel);
 const dest=path.join(OUT,rel);
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.writeFileSync(dest,data);
 files++;bytes+=data.length;
}
if(fs.existsSync(OUT)&&fs.lstatSync(OUT).isSymbolicLink())
 throw Error("Refusing to replace symlink preview directory");
fs.rmSync(OUT,{recursive:true,force:true});
if(manifest.schemaVersion!==1||manifest.sceneImages.length!==102)
 throw Error("Incomplete scene manifest");
const scenes=new Set(),shots=new Set();
for(const row of manifest.sceneImages){
 if(row.review!=="approved"||row.mobileWidth!==720||row.mobileHeight!==900||
    !row.mobileFile||!row.mobileSha256)throw Error("Unapproved portrait scene: "+row.sceneId);
 scenes.add(row.sceneId);
 const rel="assets/case002/scenes/"+row.mobileFile;
 if(!shots.has(rel)){copy(rel,row.mobileSha256);shots.add(rel);}
}
if(scenes.size!==89)throw Error("Expected 89 illustrated scenes");
for(const p of manifest.npcPortraits){
 if(p.review!=="approved"||!p.sha256)throw Error("Unapproved NPC portrait");
 copy("assets/case002/portraits/"+p.file,p.sha256);
}
for(const id of ["jack","finn","eleanor","victor","samuel"])
 copy("assets/heroes/"+id+".webp");
for(const name of fs.readdirSync(path.join(ROOT,"src/case002")))
 if(name.endsWith(".js"))copy("src/case002/"+name);
for(const name of ["index.html","app.js","style.css"])
 copy("preview/case002-prototype/"+name);
// A successful copy count does not guarantee that Safari can load the entry.
// Check actual staged script, stylesheet and image references before release.
// Reject external or root-absolute links: this preview must stay portable.
function assertStagedReference(from,raw){
 const reference=String(raw||"").trim();
 if(!reference||reference.startsWith("#")||/^(?:data:|blob:)/i.test(reference))
  return;
 if(reference.startsWith("/")||/^[a-z][a-z\d+.-]*:/i.test(reference))
  throw Error("Non-portable Case002 asset reference: "+reference);
 const relative=reference.split(/[?#]/,1)[0];
 const target=path.resolve(path.dirname(from),decodeURIComponent(relative));
 if(!target.startsWith(OUT+path.sep)||!fs.existsSync(target)||
    !fs.statSync(target).isFile())
  throw Error("Missing or escaped Safari preview asset: "+reference);
}
const entry="preview/case002-prototype/index.html";
const stagedEntry=path.join(OUT,entry),html=fs.readFileSync(stagedEntry,"utf8");
let references=0;
for(const match of html.matchAll(/<(?:script|link|img|source)\b[^>]*?\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)){
 assertStagedReference(stagedEntry,match[2]);references++;
}
const stagedCss=path.join(OUT,"preview/case002-prototype/style.css");
const css=fs.readFileSync(stagedCss,"utf8");
for(const match of css.matchAll(/url\(\s*(["']?)([^"'()]+)\1\s*\)/gi)){
 assertStagedReference(stagedCss,match[2]);references++;
}
for(const match of css.matchAll(/@import\s+(?:url\(\s*)?(["'])([^"']+)\1/gi)){
 assertStagedReference(stagedCss,match[2]);references++;
}
if(references<20)throw Error("Incomplete Case002 static resource scan: "+references);
fs.writeFileSync(path.join(OUT,"index.html"),
 '<!doctype html><html lang="ru"><head><meta charset="utf-8">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<meta http-equiv="refresh" content="0;url='+entry+'">'+
 '<title>Дело №002 — Бирмингем: Цена власти</title></head><body>'+
 '<a href="'+entry+'">Открыть Дело №002</a></body></html>');
if(bytes>75*1024*1024)throw Error("Preview files exceed 75 MiB");
console.log("PASS isolated Safari beta: "+scenes.size+" scenes, "+shots.size+
 " approved portrait WebPs, "+manifest.npcPortraits.length+" NPCs, five heroes, "+
 files+" files, "+(bytes/1024/1024).toFixed(1)+" MiB");
