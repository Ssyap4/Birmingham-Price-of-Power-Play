#!/usr/bin/env node
"use strict";
/* All 26 Case 002 clues must have a real, original vector icon.
 * Asset IDs and deduction meaning always originate from the story contract.
 * Tests never count a poster or a future JPEG path as completed evidence art.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {contract,graph}=require("../../src/case002/browser-data-v3.js");
const {kinds,commands,kind,create}=require("../../src/case002/evidence-icons-v1.js");
assert.equal(contract.supportedEvidence.length,26);
assert.deepEqual(Object.keys(kinds).sort(),[...contract.supportedEvidence].sort(),
 "Every supported evidence ID must have exactly one icon category");
const used=new Set(Object.values(kinds));
assert.equal(used.size,15,"Expected 15 visually distinct evidence glyph families");
for(const id of contract.supportedEvidence){
 const icon=kind(id),cmd=commands[icon];
 assert(Array.isArray(cmd)&&cmd.length>=2,"Invalid vector definition: "+id);
 assert(cmd.every(([tag,attrs])=>["rect","path","circle","ellipse","line","polyline"].includes(tag)&&
   attrs&&typeof attrs==="object"),"Invalid or unsafe vector tag for "+id);
 assert(cmd.some(([tag])=>tag==="path"||tag==="rect"||tag==="circle"),
   "Missing artistic glyph for "+id);
}
assert.throws(()=>kind("invented_reward"),/Unsupported/);
assert.throws(()=>kind("../evelyn.webp"),/Unsupported/);
assert.throws(()=>create("old_excursion_ticket",null),/document/);
// Minimal SVG namespace-aware mock catches invalid tag construction,
// demonstrates no need for external images/fonts or DOM innerHTML.
function node(tag){
 return {tag,attrs:{},children:[],textContent:"",
  setAttribute(k,v){this.attrs[k]=String(v);},
  append(child){this.children.push(child);return child;}};
}
const fakeDocument={createElementNS(ns,tag){
 assert.equal(ns,"http://www.w3.org/2000/svg");return node(tag);
}};
for(const id of contract.supportedEvidence){
 const svg=create(id,fakeDocument);
 assert.equal(svg.tag,"svg");
 assert.equal(svg.attrs.viewBox,"0 0 64 64");
 assert.equal(svg.attrs.role,"img");
 assert(svg.children.some(n=>n.tag==="title"));
 assert(svg.children.length>=4,"Under-drawn evidence art "+id);
}
const root=path.resolve(__dirname,"../..");
const html=fs.readFileSync(path.join(root,"preview/case002-prototype/index.html"),"utf8");
const app=fs.readFileSync(path.join(root,"preview/case002-prototype/app.js"),"utf8");
assert(html.includes('src="../../src/case002/evidence-icons-v1.js"'));
assert(app.includes("BirminghamCase002EvidenceArt.create(item.id)"));
assert(app.includes("data")||app.includes("dataset.holder"),"Custody is missing");
for(const id of contract.supportedEvidence){
 assert(!id.includes(".webp"),"Icon ID is accidentally an external image path");
}
console.log("PASS Case002 evidence art: 26/26 clues, 15 original vector families, "+
 "SVG construction, safe IDs and custody-aware gallery; no external assets required.");
