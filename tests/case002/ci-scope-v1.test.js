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
for(const doc of ["ARCHITECTURE.md","Architecture.md","CHANGELOG.md",
 "docs/decisions/README.md","docs/decisions/0001-branches-save-ownership-history.md",
 "tools/case002/docs-guard-v1.js"]){
 const selected=one(doc);
 assert.equal(selected.scope_label,"docs","Project documentation should avoid full 400-route QA: "+doc);
 assert.equal(selected.run_full,false);
}
const css=one("preview/case002-prototype/style.css");
assert(css.run_ui&&css.run_browser&&!css.run_full&&!css.browser_full);
const mobile=one("preview/case002-prototype/app.js");
assert(mobile.run_ui&&mobile.run_browser&&!mobile.run_full);
const deductions=one("src/case002/deduction-board-v1.js");
assert(deductions.run_evidence&&deductions.run_browser&&!deductions.run_full);
const events=one("src/case002/ui-events-v1.js");
assert(events.run_ui&&events.run_browser&&!events.run_full&&!events.run_art);
assert(one("tests/case002/ui-events-v1.test.js").run_ui);
const proseSafety=one("tests/case002/narrative-production-v1.test.js");
assert(proseSafety.run_story&&!proseSafety.run_full);
const compiledStory=one("src/case002/browser-data-v3.js");
assert(compiledStory.run_story&&compiledStory.run_bundle&&!compiledStory.run_full,
  "A text-only bundle rebuild must not trigger 400 complete campaigns");
const prose=one("src/case002/scene-prose-v1.js");
assert(prose.run_ui&&!prose.run_full);
for(const artistic of [
 "tools/case002/validate-art-wave-v1.js",
 "docs/case002/art-wave-01-v1.json",
 "tests/case002/art-wave-v1.test.js"
]){
 const scope=one(artistic);
 assert(scope.run_art&&scope.run_browser&&!scope.run_full&&!scope.browser_full,
   "Batch art must never trigger full gameplay QA by default: "+artistic);
}
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
