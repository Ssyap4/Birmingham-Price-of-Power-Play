#!/usr/bin/env node
"use strict";
/* Existing approved player portraits reused unchanged in Case 002 draft.
 * Catch missing or corrupted assets before a phone build.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const ROOT=path.resolve(__dirname,"../..");
const heroes=["heroJack","heroFinn","heroEleanor","heroVictor","heroSamuel"];
let bytes=0;
for(const hero of heroes){
 const pathname=path.join(ROOT,"assets/case-scenes",hero+".webp");
 assert(fs.existsSync(pathname),"Missing approved portrait: "+hero);
 const img=fs.readFileSync(pathname);
 assert(img.length>=2000,hero+" is empty or suspiciously small");
 assert.equal(img.toString("ascii",0,4),"RIFF","Not a RIFF WebP: "+hero);
 assert.equal(img.toString("ascii",8,12),"WEBP","Not a WebP: "+hero);
 bytes+=img.length;
}
const html=fs.readFileSync(path.join(ROOT,"preview/case002-prototype/index.html"),"utf8");
const app=fs.readFileSync(path.join(ROOT,"preview/case002-prototype/app.js"),"utf8");
assert(html.includes('id="heroPortrait"'));
for(const hero of heroes)assert(app.includes(hero+".webp"),
 "One of five hero portraits is not mapped in the mobile preview: "+hero);
assert(!html.includes('src="case002-')&&!app.includes('src="case002-'),
 "Preview must not reference fictional, not-yet-generated Case 002 scene art");
console.log("PASS: 5 approved existing hero portraits are present, real WebP files, "+
 Math.round(bytes/1024)+" KiB total; no fake new NPC asset advertised.");
