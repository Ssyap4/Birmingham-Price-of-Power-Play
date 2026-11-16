"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const C = require("../../src/criminal/content.js");
const dir = path.resolve(__dirname, "../../assets/criminal/equipment");
const names = Object.keys(C.items).sort();
test("each of the 28 real inventory items has its own safe illustrated SVG", () => {
  assert.equal(names.length,28);
  const disk = fs.readdirSync(dir).filter(f=>f.endsWith(".svg")).map(f=>f.slice(0,-4)).sort();
  assert.deepEqual(disk,names);
  const drawings=new Set();
  for(const id of names){
    assert.match(id,/^[a-zA-Z]+$/);
    const s=fs.readFileSync(path.join(dir,id+".svg"),"utf8");
    assert.match(s,/^<svg[^>]*viewBox="0 0 96 96"/);
    assert.match(s,/<path /);
    assert.doesNotMatch(s,/<script|<foreignObject|\bon\w+\s*=|https?:\/\//i);
    drawings.add(s);
  }
  assert.equal(drawings.size,28,"none of the illustrations are symbol duplicates");
});
test("browser renderer includes SVG equipment art, healing and resource deltas", () => {
  const app=fs.readFileSync(path.resolve(__dirname,"../../src/criminal/app.js"),"utf8");
  assert.match(app,/cr-gear-illustration/);
  assert.match(app,/cr-resource-icon/);
  assert.match(app,/cr-heal-icon/);
  assert.doesNotMatch(app,/C\.items\[k\]\[0\]/);
  assert.doesNotMatch(app,/C\.items\[id\]\[0\]/);
});
