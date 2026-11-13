#!/usr/bin/env node
"use strict";
/* Case 002's identity rules. Automatically catch misleading generated
 * poster surnames and regression to two near-identical face descriptions.
 * Actual visual similarity still requires review of REAL generated portraits.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const {CAST,character}=require("../../src/case002/cast-registry-v1.js");
const active=[
 "src/case002/cast-registry-v1.js",
 "src/case002/story-variants-v4.js",
 "src/case002/browser-data-v3.js",
 "preview/case002-prototype/app.js",
 "docs/case002/case002-hero-scenes-v2.md",
 "docs/case002/case002-screenplay-acts-1-3-v2.md",
 "docs/case002/case002-screenplay-acts-4-6-and-endings-v2.md"
];
const falseNames=["Томми Рид","Томми Картрайт","Мэйбл Грин","Томми Рейд","Томми Ридд"];
for(const filename of active){
 const body=read(filename);
 for(const falseName of falseNames)
   assert(!body.includes(falseName),filename+" accidentally contains fake generated name "+falseName);
}
assert.equal(character("tommy").name,"Томми Кросс");
assert.equal(character("mabel").name,"Мэйбл Кросс");
assert.equal(character("ada").name,"Ада Уэбб");
assert.equal(character("tommy").portrait,null);
assert.equal(character("mabel").portrait,null);
assert.equal(character("ada").portrait,null);
assert.equal(CAST.length,10);
const m=character("mabel").appearance,a=character("ada").appearance,t=character("tommy").appearance;
const mabelTokens=["узкое угловатое лицо","нос с горбинкой","клиновидный подбородок","серо-зелёные глаза","короткий прямой тёмно-каштановый боб"];
const adaTokens=["широкая квадратная челюсть","короткий широкий нос","карие глаза","шрам на подбородке","рабочим платком"];
for(const token of mabelTokens)
 assert(m.includes(token),"Mabel distinct face requirement missing: "+token);
for(const token of adaTokens)
 assert(a.includes(token),"Ada working-class face requirement missing: "+token);
assert(t.includes("горбинкой как у Мэйбл"),"Tommy and Mabel must have plausible sibling traits");
for(const token of ["карие глаза","широкая квадратная челюсть"])
 assert(!m.includes(token),"Mabel's face regressed toward Ada");
for(const token of ["серо-зелёные глаза","клиновидный подбородок"])
 assert(!a.includes(token),"Ada's face regressed toward Mabel");
const brief=read("docs/case002/case002-first-portrait-production-brief-v1.md");
const bible=read("docs/case002/case002-visual-bible-v1.md");
for(const doc of [brief,bible]){
 assert(doc.includes("Эвелин"),"Missing no-Evelyn similarity review");
 assert(doc.includes("Томми Кросс"),"Lost brother's surname");
}
const posterAssets=fs.readdirSync(path.join(root,"assets/case-scenes")).filter(x=>
 /(?:case002|mabel|tommy|ada)-.*(?:poster|infographic)\.(?:png|webp)$/i.test(x));
assert.deepEqual(posterAssets,[],"Rejected report posters must never enter production assets");
console.log("PASS Case002 identity QA: 10 stable characters, canonical Cross siblings, "+
 active.length+" active narrative sources free of poster aliases; radically different Mabel/Ada face contracts; 0 falsely approved portraits.");
