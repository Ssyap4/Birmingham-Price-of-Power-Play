#!/usr/bin/env node
"use strict";
// Lightweight, art-specific continuity gate. Never substitutes for image visual review.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const read=(file)=>JSON.parse(fs.readFileSync(path.join(root,file),"utf8"));
const board=read("docs/case002/case002-art-storyboard-v1.json");
const pack=read("docs/case002/art-production-pack-01-v1.json");
const {manifest}=require("../../src/case002/approved-art-v1.js");
const shots=board.shots || board.scenes;
assert(Array.isArray(shots),"Storyboard needs scene array");
const b03=shots.find(x=>x.id==="B03");
const production=pack.shots.find(x=>x.sceneId==="B03");
assert(b03&&production,"B03 must be declared in storyboard and production pack");
assert.equal(b03.location,"freight-office");
assert.equal(production.location,b03.location);
assert.equal(production.filename,"case002-b03-scene.webp");
assert.equal(production.mobileFilename,"case002-b03-scene--mobile.webp");
assert.deepEqual(production.cast,["hero"],"B03 must not show an unknown culprit");
assert.match(production.directorFocus,/F-4182/);
assert.match(production.directorFocus,/Мэйбл/);
assert.match(production.directorFocus,/не доказательство убийства/);
assert(production.forbidden.some(x=>/Брэкетт/.test(x)),"Do not attribute Mabel's first change to Brackett");
assert(production.forbidden.some(x=>/вторая/.test(x)),"Do not reveal later arrival forgery");
assert(production.forbidden.some(x=>/гибели Хейла/.test(x)),"No premature accusation");
assert(!manifest.sceneImages.some(x=>x.sceneId==="B03"),"B03 requires visual QA and real WebP before approval");
console.log("PASS Case002 B03 art gate: F-4182 provenance, no early reveal, no false approval");
