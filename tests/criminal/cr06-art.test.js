"use strict";
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), path = require("node:path"), crypto = require("node:crypto");
const ROOT = path.resolve(__dirname, "../..");
const art = require("../../src/criminal/art-manifest.js");
const validate = require("../../deployment/criminal-art-contract.js");
const shell = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const scripts = [...shell.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m => m[1]);
test("CR06 complete reviewed art, one original image per scene and ending; accepted order preserved", () => {
  assert.ok(validate(art, scripts).includes("CR06"));
  const frames = art.frames.filter(f => f.missionId === "CR06");
  assert.equal(frames.length, 26);
  const candidates = require("../../docs/criminal-operations/CR06-ART-CANDIDATES.json");
  assert.equal(candidates.frames.length, 26);
  for (const frame of frames) {
    const bytes = fs.readFileSync(path.join(ROOT, frame.path));
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"), frame.sha256);
    assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`), bytes])).digest("hex"), frame.gitBlobSha1);
    assert.equal(bytes.length, frame.bytes);
    const candidate = candidates.frames.find(f => f.id === frame.id);
    assert.equal(candidate.sha256, frame.sha256);
    assert.equal(candidate.sourceSha256, frame.sourceSha256);
  }
  const order = fs.readFileSync(path.join(ROOT, "assets/criminal/candidates/cr06-order.webp"));
  assert.equal(crypto.createHash("sha256").update(order).digest("hex"), "dc055950336ef31da1b74fdf6f328367853405c7c46d1b0187318cad075f8726");
  assert.deepEqual(order, fs.readFileSync(path.join(ROOT, "assets/criminal/cr06-order.webp")));
});
test("export guard rejects missing endings, duplicate scenes and reused pictures", () => {
  const changed = () => JSON.parse(JSON.stringify(art));
  let m = changed(); m.frames = m.frames.filter(f => f.id !== "cr06-end-dead");
  assert.throws(() => validate(m, scripts), /Incomplete art count/);
  m = changed(); m.frames.find(f => f.id === "cr06-end-dead").scenes = ["end:clean"];
  assert.throws(() => validate(m, scripts), /duplicate art scene/);
  m = changed(); m.frames.find(f => f.id === "cr06-exit").sha256 = m.frames.find(f => f.id === "cr06-retreat").sha256;
  assert.throws(() => validate(m, scripts), /Duplicate criminal illustration/);
});
test("CR06 is loaded by both entries and both exporters enforce complete art", () => {
  const ref = 'src="src/criminal/missions/cr06.js"';
  for (const file of ["index.html", "preview/criminal/index.html"])
    assert.equal(fs.readFileSync(path.join(ROOT, file), "utf8").split(ref).length - 1, 1);
  for (const file of ["deployment/campaign-unified-release.js", "deployment/criminal-standalone-preview.js"])
    assert.match(fs.readFileSync(path.join(ROOT, file), "utf8"), /criminal-art-contract/);
});
