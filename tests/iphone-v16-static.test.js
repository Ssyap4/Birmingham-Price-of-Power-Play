"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const root=path.resolve(__dirname,".."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("V16 restores direct mobile scrolling without changing Case001 saves",()=>{
 const css=read("iphone-ux-v16.css");
 assert.match(read("index.html"),/iphone-ux-v16\.css/);
 assert.match(css,/html\{scroll-behavior:auto!important\}/);
 assert.match(css,/overflow-anchor:none/);
 assert.match(read("profile-page.js"),/behavior:'instant'/);
 assert.doesNotMatch(read("profile-page.js"),/behavior:'smooth'/);
 const bridge=read("campaign-bridge-v13.js");
 assert.match(bridge,/if\(target==="archive"\)hub\.open\("campaignAchievements"\)/);
 assert.match(bridge,/if\(target==="profile"\)d\.getElementById\("cabinetProfile"\)/);
 for(const bad of ["localStorage","setItem(","removeItem("])
  assert.ok(!bridge.includes(bad),"unexpected saving side effect "+bad);
});
test("V16 atmosphere uses drops instead of CSS stripes, motion has reduced-motion fallback",()=>{
 const css=read("iphone-ux-v16.css");
 for(const word of ["cinema-v16-raindrops","cinema-v16-small-drops","cinema-v16-lamplight","cinema-v16-smoke","prefers-reduced-motion"])
  assert.ok(css.includes(word),word);
 const rain=css.split("#home .cinema-rain{")[1].split("}")[0];
 assert.match(rain,/radial-gradient/);
 assert.doesNotMatch(rain,/repeating-linear-gradient/);
 assert.match(css,/mix-blend-mode:screen/);
 assert.match(read("cinema-home-v1.css"),/cinema-home-art-v12\.webp/);
});
test("V16 volume lowered while keeping both original menu songs and one audio engine",()=>{
 const audio=read("audio-v1.js");
 assert.match(audio,/const volume=\.075/);
 assert.doesNotMatch(audio,/const volume=\.19/);
 for(const file of ["night-on-the-docks.mp3","menu-original.ogg","case-fog.ogg","case-ledger.ogg","case-shadows.ogg"])
  assert.ok(audio.includes(file));
 assert.equal((audio.match(/new Audio\(\)/g)||[]).length,2);
});
test("V16 archive tabs update active destination and profile opens only the requested screen",()=>{
 const hub=read("campaign-hub-v1.js"),profile=read("profile-page.js");
 assert.match(hub,/tab\.setAttribute\('aria-current',String\(tab\.dataset\.openSection===id\)\)/);
 assert.match(profile,/document\.querySelectorAll\('\.screen'\)/);
 for(const id of ["campaignDossiers","campaignAchievements","campaignHistory"])
  assert.ok(hub.includes(id));
});