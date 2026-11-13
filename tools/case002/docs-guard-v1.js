#!/usr/bin/env node
"use strict";
/* Small, fail-fast, offline architecture documentation check.
 * Ensures the canonical architecture, milestone history and ADR register
 * don't silently lose links as the game grows.
 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"../..");
const mandatory=[
 "ARCHITECTURE.md",
 "Architecture.md",
 "CHANGELOG.md",
 "docs/decisions/README.md",
 "docs/decisions/0001-branches-save-ownership-history.md",
 "docs/decisions/0002-art-approval-and-visual-canon.md",
 "docs/decisions/0003-autonomous-art-review-and-scoped-qa.md"
];
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
for(const file of mandatory)assert(fs.existsSync(path.join(root,file)),
 "Missing documentation: "+file);
let references=0;
for(const file of mandatory){
 const source=read(file);
 assert(source.length>400,"Too little useful documentation in "+file);
 for(const match of source.matchAll(/\]\(([^)]+)\)/g)){
   const url=match[1].trim();
   if(/^(?:https?:|mailto:|#)/.test(url))continue;
   const loc=url.split("#")[0].split("?")[0];
   const resolved=path.resolve(root,path.dirname(file),loc);
   assert(resolved===root||resolved.startsWith(root+path.sep),
     "Documentation link escapes repository: "+file+" => "+url);
   assert(fs.existsSync(resolved),"Broken documentation link: "+file+" => "+url);
   references++;
 }
}
const architecture=read("ARCHITECTURE.md"),history=read("CHANGELOG.md");
for(const term of ["main","сохранен","CI","Дело №001","CHANGELOG.md","89","Telegram"]){
 assert(architecture.toLowerCase().includes(term.toLowerCase()),
  "Architecture lost necessary context: "+term);
}
assert(architecture.includes("Дело №002")||architecture.includes("Case 002"),
 "Architecture must cover second case");
const actualVersion=/· v(\d+\.\d+)\s*\(/.exec(read("docs/case002/README.md"));
assert(actualVersion,"Case002 milestone label missing");
assert(history.includes("v"+actualVersion[1]),
 "Latest Case002 milestone v"+actualVersion[1]+" absent from CHANGELOG.md");
assert(!/89 (?:готовых|утверждённых) иллюстраций/.test(history),
 "Planned storyboard falsely described as finished assets");
const decisions=read("docs/decisions/README.md");
assert(decisions.includes("0001")&&decisions.includes("0002"));
console.log("PASS project docs: "+mandatory.length+" canonical documents, "+references+
 " valid repository links, case002 v"+actualVersion[1]+
 " milestone synchronized, architecture/ADR present.");
