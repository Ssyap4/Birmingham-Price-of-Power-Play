#!/usr/bin/env node
"use strict";
/* Unified distribution acceptance contract: not the isolated 002 preview. */
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.resolve(__dirname,"../.."),dist=path.join(root,"campaign-unified-dist");
const art=require("../../src/case002/approved-art-v1.js").manifest;
const entry=name=>path.join(dist,name);
function exists(name){assert(fs.existsSync(entry(name))&&fs.statSync(entry(name)).isFile(),
 "Missing unified campaign resource: "+name);}
for(const name of ["index.html","districts-v13.js","case-v14.js","heroes-v1.js",
 "campaign-hub-v1.js","campaign-case002-archive-v1.js",
 "campaign-case002-archive-v1.css","src/case002/browser-data-v3.js",
 "case002-map-entry-v1.js","case002-map-entry-v1.css",
 "case001-briefing-v1.js","case001-portrait-stage-v1.js",
 "case001-portrait-stage-v1.css","case001-unified-reader-v1.css",
 "case001-unified-evidence-v1.css",
 "case001-unified-status-v1.css",
 "case001-unified-finale-v1.css","case001-unified-finale-v1.js",
 "case001-unified-scene-flow-v1.css","case001-unified-scene-flow-v1.js",
 "session-controls-v1.js",
 "preview/case002-prototype/index.html","preview/case002-prototype/style.css",
 "preview/case002-prototype/app.js","src/case002/engine-v3.js",
 "src/case002/achievements-v1.js","assets/districts/digbeth.webp",
 "assets/districts/small-heath.webp","assets/audio/night-on-the-docks.mp3"])
 exists(name);
const shell=fs.readFileSync(entry("index.html"),"utf8"),
 map=fs.readFileSync(entry("case002-map-entry-v1.js"),"utf8"),
 old=fs.readFileSync(entry("case-v14.js"),"utf8"),
 second=fs.readFileSync(entry("preview/case002-prototype/index.html"),"utf8");
assert(shell.includes('id="districtsCard"')&&shell.includes('data-district="digbeth"'),
 "The original five-district campaign map must be the publication entry");
assert(shell.includes('case002-map-entry-v1.js')&&map.includes("launchSecondCase")&&
 map.includes("launchFirstCase")&&map.includes("from=map"),
 "The real Digbeth map button must reach Case 002 at the same origin");
assert(map.includes('preview/case002-prototype/index.html?from=map'),
 "Case 002 cannot be an external beta-domain link");
assert(map.includes("campaignAchievements")&&map.includes(
 "BirminghamCampaign?.open(target)"),
 "Campaign map must resolve shared archive URL fragments");
assert(second.includes('id="case002SharedArchiveLink"')&&second.includes(
 '../../index.html#campaignAchievements'),
 "Case 002 needs a direct same-origin shared achievement link");
const globalArchive=fs.readFileSync(entry("campaign-case002-archive-v1.js"),"utf8");
assert(globalArchive.includes('unlocked?a.name:"НЕИЗВЕСТНОЕ ДОСТИЖЕНИЕ"')&&
 globalArchive.includes("Условие откроется после получения."),
 "Locked achievements must not spoil unearned plot revelations");
const case2App=fs.readFileSync(entry("preview/case002-prototype/app.js"),"utf8");
assert(!case2App.includes("зарегистрированы в черновом архиве")&&
 case2App.includes("подтверждены в локальном архиве"),
 "A verified finale must give accurate player-facing release terminology");
assert(second.includes("Материалы ближнего круга")&&
 second.includes("не изменяет историю №001"),
 "Case 002 masthead and briefing must match connected campaign");
assert(globalArchive.includes("campaign-002-to-digbeth")&&
 globalArchive.includes('back.href="#district-digbeth"'),
 "Shared archive must offer a direct Digbeth return");
const hub=fs.readFileSync(entry("campaign-hub-v1.js"),"utf8");
assert(hub.includes('return localStorage.getItem(k)===encoded')&&
 hub.includes('if(dirty&&!put(AWARD_KEY,a))return previous'),
 "Case 001 award notifications must never precede verified storage writes");
assert(old.includes("launchFirstCase")&&old.includes("caseBack")&&
 shell.includes("Дело №001 доступно в Смолл-Хите"),
 "Case 001 district, original map return and launch must remain present");
assert(second.includes("case002MapReturnBar")&&
 second.includes('../../index.html#district-digbeth')&&
 second.includes('id="caseBriefing"'),
 "Case 002 must return to same-origin Digbeth and retain no-spoiler briefing");
assert(shell.includes('campaign-case002-archive-v1.js')&&
 shell.includes('campaign-case002-archive-v1.css')&&
 shell.includes('src/case002/browser-data-v3.js')&&
 shell.includes('src/case002/achievements-v1.js'),
 "Unified shared archive dependencies missing from entry");
const archive=fs.readFileSync(entry("campaign-case002-archive-v1.js"),"utf8");
assert(hub.includes("birmingham:campaign-render")&&
 archive.includes("birmingham:campaign-render")&&
 archive.includes("35 уникальных знаков")&&
 archive.includes("campaignSecondCaseHistory"),
 "Main menu must render Case 002 rewards and history without writing them");
assert(!shell.includes("case002-preview-dist")&&
 !map.includes("vercel.app")&&!map.includes("github.io"),
 "Do not route between two different origins");
const sceneShots=new Set(art.sceneImages.map(x=>x.mobileFile));
assert.equal(art.sceneImages.length,102);
assert.equal(sceneShots.size,102);
assert.equal(new Set(art.sceneImages.map(x=>x.sceneId)).size,89);
for(const image of art.sceneImages){
 const name="assets/case002/scenes/"+image.mobileFile;
 exists(name);
 const bytes=fs.readFileSync(entry(name));
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),
   image.mobileSha256,"Changed approved Case 002 picture: "+name);
}
const briefing=fs.readFileSync(entry(art.briefingImage.path));
assert.equal(crypto.createHash("sha256").update(briefing).digest("hex"),
 art.briefingImage.sha256);
for(const npc of art.npcPortraits){
 const name="assets/case002/portraits/"+npc.file;exists(name);
 assert.equal(crypto.createHash("sha256").update(fs.readFileSync(entry(name))).digest("hex"),
  npc.sha256);
}
for(const hero of ["jack","finn","eleanor","victor","samuel"])exists("assets/heroes/"+hero+".webp");
for(const forbidden of ["assets/case002/candidates",
 "assets/case002/scenes/case002-p01-scene.webp","docs","tests",
 "case002-preview-dist","preview/mobile","src/case001"]){
 assert(!fs.existsSync(entry(forbidden)),"Extraneous material in unified package: "+forbidden);
}
assert(!fs.existsSync(entry("deployment/campaign-unified-release.js")),
 "Build tool source must not be shipped to players");
const case1Keys=["birmingham_case_smol_heath_v1_","birmingham_campaign_records_v1"];
const case2Keys=["birmingham_case002_draft_v3_","birmingham_case002_records_draft_v3",
 "birmingham_case002_rewards_draft_v3"];
const case1=fs.readFileSync(entry("case-v14.js"),"utf8")+
 fs.readFileSync(entry("campaign-hub-v1.js"),"utf8");
const case2=fs.readFileSync(entry("src/case002/engine-v3.js"),"utf8");
for(const key of case1Keys)assert(case1.includes(key),"Old save key altered: "+key);
for(const key of case2Keys)assert(case2.includes(key),"Case 002 save key altered: "+key);
for(const key of case1Keys)assert(!case2.includes(key),"Case 001 namespace leaked into engine 002");
const total=fs.readdirSync(dist).length;
assert(total>=60,"Unexpectedly small main-campaign file list");
console.log("PASS unified campaign package: two independent save namespaces, original 001 map, 002 Digbeth entry, 102 hashed scenes, 10 NPCs, 5 heroes, no drafts; root entries "+total);
