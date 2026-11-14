#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {validateBatch,promptFor,reviewFor}=require("../../docs/case002/art-wave-prompt-builder-v1.js");
const cards=validateBatch(JSON.parse(fs.readFileSync(path.join(__dirname,"../../docs/case002/art-wave-17-shotcards-v1.json"),"utf8")));
assert.deepEqual(cards.map(c=>c.id),["C06","C07","C08","C09","C10"]);
assert.deepEqual(cards.map(c=>c.sceneKind),["aftermath","dialogue","action","evidence","evidence"]);
for(const card of cards){
 const visual=promptFor(card),review=reviewFor(card);
 assert(visual.includes(card.focus));
 assert(!visual.includes(card.knowledgeBoundary));
 assert(!visual.includes("infographic"));
 assert(!visual.includes("collage"));
 assert(!/\b[A-F]\d{2}\b/.test(visual));
 assert.equal(review.knowledgeBoundary,card.knowledgeBoundary);
}
assert(promptFor(cards[0]).includes("eleven forty-seven"));
assert(reviewFor(cards[1]).knowledgeBoundary.includes("not proof of murder"));
assert(reviewFor(cards[2]).knowledgeBoundary.includes("registration and signature comparison"));
assert(promptFor(cards[3]).includes("three sets of human footprints"));
assert(reviewFor(cards[4]).knowledgeBoundary.includes("conditional on independent clues"));
console.log("PASS: five wave17 shot types and isolated render prompts");
