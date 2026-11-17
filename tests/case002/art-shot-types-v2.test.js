#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const {SHOT_KINDS,validateBatch,promptFor,reviewFor}=require("../../docs/case002/art-wave-prompt-builder-v1.js");
const names=Object.keys(SHOT_KINDS);
assert.deepEqual(names,["environment","dialogue","action","emotion","evidence","transition","aftermath"]);
const base={id:"T01",focus:"two workers exchanging a silent glance on a factory staircase",
camera:"eye-level medium shot",location:"factory stairwell",required:["two workers","wet stone stairs"],
background:"brick arches",light:"one warm electric bulb",npc:"two anonymous workers",
knowledgeBoundary:"the workers' private intentions remain unknown",
avoid:["guilty confession"]};
for(const kind of names){
 const card={...base,sceneKind:kind};
 const visual=promptFor(card);
 assert(visual.includes(SHOT_KINDS[kind]));
 assert(!visual.includes("guilty confession"));
 assert(!visual.includes("private intentions"));
 assert.equal(reviewFor(card).sceneKind,kind);
}
const scenery={...base,id:"T02",sceneKind:"environment",focus:"deserted foggy Birmingham street",
npc:"no people",required:["wet cobbles","gaslights"]};
assert(promptFor(scenery).includes("lived-in environment"));
assert.throws(()=>validateBatch({schemaVersion:2,scenes:[{...base,sceneKind:"mystery"}]}),/sceneKind/);
assert.throws(()=>promptFor({...base,sceneKind:"evidence",focus:"GitHub status dashboard"}),/contaminated/);
console.log("PASS: seven shot types, atmosphere without evidence, and contamination guard");
