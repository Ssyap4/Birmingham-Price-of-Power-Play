#!/usr/bin/env node
"use strict";
/* Isolated, faithful criminal-mode preview. Does not export legacy detective files. */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "criminal-preview-dist");
const scripts = [
  "src/criminal/content.js",
  ...[1,2,3,4,5].map(n => "src/criminal/missions/cr0" + n + ".js"),
  "src/criminal/engine.js",
  "src/criminal/archive.js",
  "src/criminal/art-manifest.js",
  "src/criminal/epilogues.js",
  "src/criminal/app.js",
  "preview/criminal/bridge.js"
];
const styles = [
  "criminal-operations-v2.css",
  "preview/criminal/preview.css"
];
const heroes = ["jack", "finn", "eleanor", "victor", "samuel"]
  .map(x => "assets/heroes/" + x + ".webp");
const manifest = require("../src/criminal/art-manifest");
const images = manifest.frames.map(f => f.path);
const required = [ ...scripts, ...styles, ...heroes, ...images ];
if(manifest.frames.length !== 40)
  throw Error("Unexpected reviewed image count");
if(new Set(required).size !== required.length)
  throw Error("Duplicate preview reference");
if(!required.every(name => !name.startsWith("/") && !name.split(/[\\/]/).includes("..")))
  throw Error("Unsafe preview source path");
fs.rmSync(OUT,{recursive:true,force:true});
fs.mkdirSync(OUT,{recursive:true});
function copy(name,expectedHash){
  const source = path.join(ROOT,name);
  const stat = fs.lstatSync(source);
  if(!stat.isFile() || stat.isSymbolicLink())throw Error("Non-file source "+name);
  const bytes = fs.readFileSync(source);
  if(expectedHash && crypto.createHash("sha256").update(bytes).digest("hex")!==expectedHash)
    throw Error("Unverified image hash "+name);
  if(name.endsWith(".webp") &&
    (bytes.toString("ascii",0,4)!=="RIFF" || bytes.toString("ascii",8,12)!=="WEBP"))
    throw Error("Not WebP "+name);
  const dest = path.join(OUT,name);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,bytes);
}
for(const f of manifest.frames)
  if(f.review!=="approved" || f.width!==720 || f.height!==900)
    throw Error("Unreviewed scene art "+f.id);
const byPath=new Map(manifest.frames.map(f=>[f.path,f.sha256]));
for(const name of required)copy(name,byPath.get(name));
const main = fs.readFileSync(path.join(ROOT,"preview/criminal/index.html"),"utf8");
if(!main.includes('<base href="../../">'))throw Error("Non-portable standalone base");
fs.writeFileSync(path.join(OUT,"index.html"),main);
const files=Array.from(new Set([...required,"index.html"]));
for(const s of scripts.concat(styles))
  if(!fs.statSync(path.join(OUT,s)).size)throw Error("Empty resource "+s);
for(const name of required)
  if(!fs.existsSync(path.join(OUT,name)))throw Error("Missing preview file "+name);
for(const id of ["CR01","CR02","CR03","CR04","CR05"])
  if(manifest.frames.filter(f=>f.missionId===id).length!==8)
    throw Error("Wrong art count for "+id);
const size = files.reduce((total,f)=>total+fs.statSync(path.join(OUT,f)).size,0);
if(size>9*1024*1024)throw Error("Standalone preview unexpectedly large");
console.log(JSON.stringify({ok:true,files:files.length,frames:images.length,heroes:heroes.length,bytes:size,directory:"criminal-preview-dist",entry:"index.html"},null,2));
