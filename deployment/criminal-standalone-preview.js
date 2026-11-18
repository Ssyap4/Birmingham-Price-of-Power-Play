#!/usr/bin/env node
"use strict";
/* Isolated, faithful criminal-mode preview. Does not export legacy detective files. */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "criminal-preview-dist");
const main = fs.readFileSync(path.join(ROOT,"preview/criminal/index.html"),"utf8");
const core = ["src/criminal/content.js","src/criminal/engine.js","src/criminal/archive.js","src/criminal/art-manifest.js","src/criminal/epilogues.js","src/criminal/app.js","preview/criminal/bridge.js"];
const scripts = [...main.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
const isMission = s=>/^src\/criminal\/missions\/cr[0-9]+\.js$/.test(s);
if(JSON.stringify(scripts.filter(s=>!isMission(s)))!==JSON.stringify(core) ||
   scripts.some(s=>isMission(s)&&(scripts.indexOf(s)<=scripts.indexOf(core[0])||scripts.indexOf(s)>=scripts.indexOf(core[1]))))
  throw Error("Invalid standalone script order");
const unified = fs.readFileSync(path.join(ROOT,"index.html"),"utf8");
const unifiedMissions = [...unified.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]).filter(isMission);
if(JSON.stringify(scripts.filter(isMission))!==JSON.stringify(unifiedMissions))throw Error("Mission lists differ between packages");
const styles = [
  "criminal-operations-v2.css",
  "preview/criminal/preview.css",
  "campaign-visual-language-v1.css"
];
const heroes = ["jack", "finn", "eleanor", "victor", "samuel"]
  .map(x => "assets/heroes/" + x + ".webp");
const manifest = require("../src/criminal/art-manifest");
const images = manifest.frames.map(f => f.path);
const equipment = Object.keys(require("../src/criminal/content.js").items).map(id => "assets/criminal/equipment/" + id + ".svg");
if(equipment.length!==28) throw Error("Incomplete illustrated equipment catalog");
const required = [ ...scripts, ...styles, ...heroes, ...images, ...equipment ];
require("./criminal-art-contract.js")(manifest, scripts);
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
  if(name.endsWith(".svg") && (!bytes.toString("utf8").startsWith("<svg") || /<script|<foreignObject|\bon\w+\s*=|\bhref\s*=/i.test(bytes.toString("utf8"))))
    throw Error("Unsafe equipment image "+name);
  const dest = path.join(OUT,name);
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,bytes);
}
for(const f of manifest.frames)
  if(f.review!=="approved" || f.width!==720 || f.height!==900)
    throw Error("Unreviewed scene art "+f.id);
const byPath=new Map(manifest.frames.map(f=>[f.path,f.sha256]));
for(const name of required)copy(name,byPath.get(name));
if(!main.includes('<base href="../../">'))throw Error("Non-portable standalone base");
fs.writeFileSync(path.join(OUT,"index.html"),main);
const files=Array.from(new Set([...required,"index.html"]));
for(const s of scripts.concat(styles))
  if(!fs.statSync(path.join(OUT,s)).size)throw Error("Empty resource "+s);
for(const name of required)
  if(!fs.existsSync(path.join(OUT,name)))throw Error("Missing preview file "+name);
const size = files.reduce((total,f)=>total+fs.statSync(path.join(OUT,f)).size,0);
const budget = require("./criminal-package-budget.js")(manifest, name=>fs.statSync(path.join(OUT,name)).size, size);
console.log(JSON.stringify({ok:true,files:files.length,frames:images.length,heroes:heroes.length,bytes:size,budgetBytes:budget.maxBytes,directory:"criminal-preview-dist",entry:"index.html"},null,2));
