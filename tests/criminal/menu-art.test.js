"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const root=path.join(__dirname,"../..");const read=f=>fs.readFileSync(path.join(root,f),"utf8");
test("personal Profile is its own illustration, not renamed Settings bitmap",()=>{
 const html=read("index.html"),css=read("cabinet-profile-v2.css");
 assert.match(html,/id="cabinetProfile" aria-label="Профиль"/);
 assert.match(html,/class="cabinet-entry-icon cabinet-profile-seal"/);
 assert.match(html,/id="profileCard" aria-label="Досье персонажей"/);
 assert.doesNotMatch(html,/cabinetSettings|Настройки/);
 assert.match(css,/assets\/original-art\/profile\.webp/);
 const menu=read("home-two-paths-v1.css");
 assert.match(menu,/assets\/original-art\/city-card-clean\.webp/);
 assert.doesNotMatch(menu,/assets\/cinema\/city\.webp/);
 assert.match(css,/assets\/cabinet\/profile-seal\.svg/);
 assert.doesNotMatch(read("cabinet-menu-v1.css"),/cabinetSettingsDialog|cabinet-settings\.webp/);
 assert.doesNotMatch(read("mobile-approved-menu-v1.css"),/approved-settings\.webp/);
 // Historic bitmaps with baked lettering must not be active menu layers.
 assert.doesNotMatch(read("cabinet-menu-v1.css"),/cabinet-(campaign|trials|achievements|dossier)\.webp/);
 assert.doesNotMatch(read("mobile-approved-menu-v1.css"),/approved-(campaign|trials|achievements|dossiers)\.webp/);
 assert.doesNotMatch(read("cabinet-menu-v1.css"),/cabinetRotatePrompt|orientation:landscape|cabinet-menu-open/);
 assert.doesNotMatch(read("home-story-first-v1.js"),/achievements\.addEventListener/);
 for(const art of ["assets/original-art/challenges.webp","assets/original-art/clock.webp","assets/original-art/city.webp"])
  assert.ok(fs.statSync(path.join(root,art)).size>1000,art);
 assert.match(css,/assets\/original-art\/challenges\.webp/);
 assert.match(css,/assets\/original-art\/clock\.webp/);
 const case002Bridge=read("campaign-case002-archive-v1.js");
 assert.ok(case002Bridge.includes("Знаки расследований и поручений · Общий архив"));
 assert.ok(!case002Bridge.includes("Награды дел №001 и №002 · Коллекция"));
 assert.ok(html.includes("Знаки расследований и поручений · Общий архив"));
 const seal=read("assets/cabinet/profile-seal.svg");assert.match(seal,/^<svg/);
 assert.match(seal,/<path /);assert.doesNotMatch(seal,/<script|<foreignObject|\bon\w+\s*=|\bhref\s*=/i);
 assert.ok(fs.statSync(path.join(root,"assets/original-art/profile.webp")).size>1000);
});