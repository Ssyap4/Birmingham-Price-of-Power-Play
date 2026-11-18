"use strict";
// Both offline exporters enforce the same complete, reviewed scene coverage.
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
function validateCriminalArt(manifest, scripts) {
  const C = require("../src/criminal/content.js");
  const missionFiles = scripts.filter(s => /^src\/criminal\/missions\/cr\d+\.js$/.test(s));
  for (const file of missionFiles) require(path.join(ROOT, file));
  const ids = missionFiles.map(s => path.basename(s, ".js").toUpperCase());
  return validateCoverage(manifest, ids, C.missions);
}
function validateCoverage(manifest, ids, missions) {
  const legacy = new Set(["CR01","CR02","CR03","CR04","CR05"]);
  if (new Set(ids).size !== ids.length) throw Error("Duplicate registered mission");
  if ([...legacy].some(id=>!ids.includes(id))) throw Error("Missing legacy mission");
  const seen = new Set(), paths = new Set(), names = new Set();
  if (manifest.schemaVersion !== 2) throw Error("Unsupported criminal art schema");
  for (const frame of manifest.frames) {
    if (!ids.includes(frame.missionId)) throw Error("Art for unregistered mission " + frame.id);
    if (frame.review !== "approved" || frame.width !== 720 || frame.height !== 900 ||
        !/^[a-f0-9]{64}$/.test(frame.sha256) || !/^[a-f0-9]{64}$/.test(frame.sourceSha256) ||
        !/^assets\/criminal\/[a-z0-9-]+\.webp$/.test(frame.path) ||
        !Array.isArray(frame.scenes) || !frame.scenes.length || !frame.alt)
      throw Error("Incomplete reviewed art " + frame.id);
    if (seen.has(frame.sha256) || paths.has(frame.path) || names.has(frame.id))
      throw Error("Duplicate criminal illustration " + frame.id);
    seen.add(frame.sha256); paths.add(frame.path); names.add(frame.id);
  }
  for (const id of ids) {
    const mission = missions[id], frames = manifest.frames.filter(f => f.missionId === id);
    if (!mission) throw Error("Mission script did not register "+id);
    const expected = new Set([...Object.keys(mission.scenes), ...Object.keys(mission.endings).map(e => "end:" + e)]);
    const covered = new Set();
    // Only the original five have grandfathered shared illustrations.
    if (frames.length !== (legacy.has(id) ? 8 : expected.size)) throw Error("Incomplete art count " + id);
    for (const frame of frames) {
      if (!legacy.has(id) && frame.scenes.length !== 1) throw Error(id + " needs an independent frame per moment");
      for (const scene of frame.scenes) {
        if (!expected.has(scene) || covered.has(scene)) throw Error("Invalid/duplicate art scene " + id + ":" + scene);
        covered.add(scene);
      }
    }
    if (covered.size !== expected.size) throw Error("Missing illustrated moments " + id);
  }
  return ids;
}
module.exports = validateCriminalArt;
module.exports.validateCoverage = validateCoverage;
