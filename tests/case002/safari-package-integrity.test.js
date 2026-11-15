#!/usr/bin/env node
"use strict";
/* Cheap post-build integrity check. Run after deployment/case002-safari-preview.js.
 * It reads the isolated distribution, never the Case001 game or its saves.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"../..");
const DIST=path.join(ROOT,"case002-preview-dist");
const manifest=require("../../src/case002/approved-art-v1.js").manifest;
const entry="preview/case002-prototype/index.html";
const file=p=>path.join(DIST,p);
assert(fs.existsSync(file(entry)),"Case002 entry must be present");
assert(fs.existsSync(file("preview/case002-prototype/style.css")),"Missing release stylesheet");
const start=fs.readFileSync(file("index.html"),"utf8");
assert(start.includes('content="0;url='+entry+'"'),
 "Landing redirect must be relative for subpath HTTPS hosting");
assert(start.includes('href="'+entry+'"'),
 "Manual fallback link must work at the same subpath");
const html=fs.readFileSync(file(entry),"utf8");
let refs=0;
for(const match of html.matchAll(/<(?:script|link|img|source)\b[^>]*?\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)){
 const rel=match[2];
 assert(!rel.startsWith("/")&&!/^[a-z][a-z\d+.-]*:/i.test(rel),
  "External or absolute asset reference: "+rel);
 const target=path.resolve(path.dirname(file(entry)),rel.split(/[?#]/)[0]);
 assert(target.startsWith(DIST+path.sep)&&fs.statSync(target).isFile(),
  "Missing packaged entry dependency: "+rel);
 refs++;
}
assert(refs>=20,"Must inspect scene HTML scripts, CSS, and initial art");
const allShots=new Set(manifest.sceneImages.map(x=>x.mobileFile));
assert.equal(manifest.sceneImages.length,102);
assert.equal(allShots.size,102);
for(const shot of allShots)
 assert(fs.statSync(file("assets/case002/scenes/"+shot)).size>1000);
assert.equal(manifest.npcPortraits.length,10);
for(const npc of manifest.npcPortraits)
 assert(fs.statSync(file("assets/case002/portraits/"+npc.file)).size>1000);
for(const hero of ["jack","finn","eleanor","victor","samuel"])
 assert(fs.statSync(file("assets/heroes/"+hero+".webp")).size>1000);
for(const forbidden of ["001.html","assets/case-scenes/heroFinn.webp",
 "assets/case002/scenes/case002-p01-scene.webp"])
 assert(!fs.existsSync(file(forbidden)),"Legacy/unapproved content in beta: "+forbidden);
console.log("PASS isolated Safari preview: "+refs+" entry references, "+allShots.size+
 " approved scenes, 10 NPC portraits, 5 heroes; portable redirect and no legacy art.");
