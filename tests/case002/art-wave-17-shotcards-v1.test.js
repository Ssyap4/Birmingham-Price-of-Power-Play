#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {validateBatch,promptFor}=require("../../docs/case002/art-wave-prompt-builder-v1.js");
const cards=validateBatch(JSON.parse(fs.readFileSync(path.join(__dirname,"../../docs/case002/art-wave-17-shotcards-v1.json"),"utf8")));
assert.deepEqual(cards.map(x=>x.id),["C06","C07","C08","C09","C10"]);
for(const c of cards){const p=promptFor(c);assert(p.includes("exactly ONE independent vertical 4:5"));assert(p.includes(c.focus));assert(!/\b[A-F]\d{2}\b/.test(p));}
assert(promptFor(cards[0]).includes("eleven forty-seven"));
assert(promptFor(cards[1]).includes("not proof of murder"));
assert(promptFor(cards[2]).includes("registration and signature comparison"));
assert(promptFor(cards[3]).includes("three sets of human footprints"));
assert(promptFor(cards[4]).includes("conditional on independent clues"));
console.log("Five isolated shot-cards for Case 002 Chapter III C06–C10: passed.");
