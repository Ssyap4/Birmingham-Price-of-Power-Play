#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const {category,classify,changedFiles}=require("../../tools/case002/ci-scope-v1.js");
const one=(p)=>classify([p]);
assert.equal(category("preview/case002-prototype/style.css"),"visual");
assert.deepEqual(one("docs/case002/README.md"),{
 run_full:false,run_story:false,run_art:false,run_evidence:false,
 run_reporting:false,run_ui:false,run_bundle:false,run_browser:false,
 browser_full:false,scope_label:"docs"
});
const css=one("preview/case002-prototype/style.css");
assert(css.run_ui&&css.run_browser&&!css.run_full&&!css.browser_full);
const mobile=one("preview/case002-prototype/app.js");
assert(mobile.run_ui&&mobile.run_browser&&!mobile.run_full);
const deductions=one("src/case002/deduction-board-v1.js");
assert(deductions.run_evidence&&deductions.run_browser&&!deductions.run_full);
const events=one("src/case002/ui-events-v1.js");
assert(events.run_ui&&events.run_browser&&!events.run_full&&!events.run_art);
assert(one("tests/case002/ui-events-v1.test.js").run_ui);
const prose=one("src/case002/scene-prose-v1.js");
assert(prose.run_ui&&!prose.run_full);
const portraits=one("src/case002/cast-registry-v1.js");
assert(portraits.run_art&&portraits.run_bundle&&!portraits.run_full);
const epilogue=one("src/case002/story-variants-v4.js");
assert(epilogue.run_story&&epilogue.run_bundle&&!epilogue.run_full);
const journal=one("src/case002/journal-v1.js");
assert(journal.run_reporting&&journal.run_browser&&!journal.run_full);
const branchChange=one("src/case002/engine-v3.js");
assert(branchChange.run_full&&branchChange.browser_full&&branchChange.run_story);
assert(one("docs/case002/case002-contract-v1.json").run_full);
assert(one("tests/case002/explore-v3.test.js").run_full);
assert(one("unknown-script-that-may-affect-the-build.js").run_full);
assert(one(".github/workflows/case002-story-qa.yml").scope_label==="ci");
const mixed=classify(["docs/case002/README.md","preview/case002-prototype/style.css"]);
assert(mixed.run_browser&&!mixed.run_full&&!mixed.run_story);
const joined=classify(["preview/case002-prototype/app.js","src/case002/engine-v3.js"]);
assert(joined.run_full&&joined.browser_full);
assert(classify(["preview/case002-prototype/style.css"],{manual:true}).run_full);
assert(classify([]).run_full,"Empty/unknown git diff must fail closed");
assert.deepEqual(changedFiles({CASE002_CHANGED_FILES:"a\nb\n"}),["a","b"]);
assert.deepEqual(changedFiles({BASE_SHA:"00000000000000",HEAD_SHA:"HEAD"}),["src/case002/engine-v3.js"]);
console.log("PASS Case002 CI selection: 18 scenarios covering docs, visual, UI, evidence, art, narrative, gameplay and unknown files.");
