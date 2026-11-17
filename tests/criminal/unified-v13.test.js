"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=path.resolve(__dirname,"../.."),read=p=>fs.readFileSync(path.join(ROOT,p),"utf8");
test("V13 links two map screens and common archive without save writes",()=>{
 const html=read("index.html"),js=read("campaign-bridge-v13.js");
 assert.match(html,/campaign-bridge-v13\.css/);
 assert.match(html,/campaign-bridge-v13\.js/);
 for(const id of ["districtsCard","criminalEntry","storyStart","profileCard","cabinetProfile"])
  assert.equal((html.match(new RegExp('id="'+id+'"',"g"))||[]).length,1,id);
 for(const part of ["districts","criminalScreen","campaignAchievements",
  "profile","campaign-portal-v13","MutationObserver","data-campaign-jump"])
  assert.ok(js.includes(part),part);
 assert.match(js,/querySelector\('\[data-action="home"\]'\)\?\.click\(\)/);
 assert.match(js,/hub\.open\("home"\)/);
 for(const danger of ["localStorage","setItem(","removeItem(","BirminghamCase.create","CriminalEngine.choose"])
  assert.ok(!js.includes(danger),"unexpected game mutation "+danger);
 const css=read("campaign-bridge-v13.css");
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(css,/prefers-reduced-motion/);
 assert.match(css,/max-width:380px/);
});
test("shared archive copy reflects the three active story lines",()=>{
 const hub=read("campaign-hub-v1.js");
 assert.match(hub,/Общий локальный архив: Дела №001 и №002/);
 assert.match(hub,/Работа для своих/);
 assert.doesNotMatch(hub,/Пока доступны только записи дела №001/);
 assert.doesNotMatch(read("campaign-hub-v1.css"),/in cabinet settings/);
});
test("offline export excludes seven inactive menu modules only",()=>{
 const pkg=read("deployment/campaign-unified-release.js"),h=read("index.html");
 for(const name of ["home-lighting-v1.css","home-story-first-v1.css","home-story-first-v1.js",
  "cabinet-menu-v1.css","mobile-approved-menu-v1.css","home-two-paths-v1.css","cabinet-profile-v2.css"]){
  assert.ok(pkg.includes('"'+name+'"'),"missing retired source "+name);
  assert.ok(!h.includes(name),"active reference "+name);
 }
 assert.match(pkg,/RETIRED_CABINET_ROOT\.has\(name\)/);
 assert.match(h,/cinema-home-v1\.css/);
});
