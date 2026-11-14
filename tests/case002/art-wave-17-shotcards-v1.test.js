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
assert(!promptFor(cards[0]).includes("23:47"));
assert(!promptFor(cards[0]).includes("watch"));
assert(reviewFor(cards[0]).knowledgeBoundary.includes("23:47"));
assert(reviewFor(cards[1]).knowledgeBoundary.includes("not proof of murder"));
assert(promptFor(cards[2]).includes("written front faces down"));
assert(promptFor(cards[2]).includes("folded shut"));
assert(!promptFor(cards[2]).includes("4738"));
assert(reviewFor(cards[2]).knowledgeBoundary.includes("registration identifier"));
assert(promptFor(cards[3]).includes("three separately visible lines"));
assert(!/\b(?:lorry|truck)\b/i.test(promptFor(cards[3])));
assert(reviewFor(cards[3]).doNotDepict.some(x=>x.includes("truck")));
assert(promptFor(cards[4]).includes("wagon-shaped paper cutout"));
assert(promptFor(cards[4]).includes("text sides turned downward"));
assert(reviewFor(cards[4]).knowledgeBoundary.includes("working hypothesis"));
const isolated=fs.readFileSync(path.join(__dirname,"../../docs/case002/isolated-render-c09-v1.txt"),"utf8");
assert(isolated.includes("three clearly distinct chains of human boot impressions"));
assert(isolated.includes("left-hand chain")&&isolated.includes("middle chain")&&isolated.includes("right-hand chain"));
assert(!/\\b(?:C0[1-9]|C10|manifest|github|workflow|infographic|collage|prompt|review)\\b/i.test(isolated));
assert(!isolated.includes("signalman"));
console.log("PASS: isolated one-shot C09 visual-only prompt is clean");
console.log("PASS: five wave17 shot types and isolated render prompts");
