"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const d=require("../../docs/case003/investigation-contract-v1.json");
const unique=(xs)=>assert.equal(new Set(xs).size,xs.length);
const ids=xs=>xs.map(x=>x.id);
test("design namespace and six chapters",()=>{assert.equal(d.caseId,"003");assert.equal(d.district,"jewellery");assert.equal(d.status,"design-only");assert.equal(d.chapters.length,6);unique(ids(d.chapters));unique(d.heroes);assert.equal(d.heroes.length,5)});
test("planned evidence has a named source and acquisition beat",()=>{unique(ids(d.evidence));const nodes=d.chapters.flatMap(x=>x.nodes);unique(ids(nodes));const gains=nodes.flatMap(n=>n.grants);for(const ev of d.evidence){assert.ok(ev.title&&ev.source);assert.ok(gains.includes(ev.id),ev.id)}for(const id of gains)assert.ok(ids(d.evidence).includes(id),id)});
test("alternative proof bundles use distinct source IDs",()=>{unique(ids(d.claims));const byId=new Map(d.evidence.map(e=>[e.id,e]));for(const c of d.claims){assert.ok(c.alternatives.length>=2);for(const a of c.alternatives){assert.ok(a.length>=2);unique(a);const sources=a.map(id=>{assert.ok(byId.has(id),id);return byId.get(id).source});unique(sources)}unique(c.alternatives.map(a=>JSON.stringify([...a].sort())))}});
function eligible(e,claims,flags,alive){return e.alive===alive&&e.claims.every(c=>claims.has(c))&&e.flags.every(f=>flags.has(f))}
test("seven outcome identities; verified gate inputs and safe fallback",()=>{unique(ids(d.endings));assert.equal(d.endings.length,7);for(const e of d.endings){for(const c of e.claims)assert.ok(ids(d.claims).includes(c));for(const f of e.flags)assert.ok(d.flags.includes(f))}assert.deepEqual(d.endings.filter(e=>eligible(e,new Set(),new Set(),true)).map(x=>x.id),["Z06"]);assert.equal(d.endings.filter(e=>eligible(e,new Set(),new Set(),false)).length,0);assert.deepEqual(d.endings.filter(e=>eligible(e,new Set(),new Set(["warnedRisk","confirmedDeath"]),false)).map(x=>x.id),["Z07"]);assert.equal(d.endings.filter(e=>eligible(e,new Set(ids(d.claims)),new Set(d.flags),true)).length,6)});
test("five hero blocks, thirty-five unique planned reward identities",()=>{assert.deepEqual(Object.keys(d.heroBeats).sort(),[...d.heroes].sort());for(const h of d.heroes){assert.equal(d.heroBeats[h].length,3);unique(d.heroBeats[h])}const rewards=d.heroes.flatMap(h=>d.endings.map(e=>[d.caseId,h,e.id].join(":")));unique(rewards);assert.equal(rewards.length,35)});

test("killer proof bundles have no single mandatory evidence ID",()=>{const a=d.claims.find(x=>x.id==="killer").alternatives;assert.equal(a[0].filter(x=>a.slice(1).every(b=>b.includes(x))).length,0)});
