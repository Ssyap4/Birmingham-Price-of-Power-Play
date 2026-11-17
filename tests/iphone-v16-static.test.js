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
test("V30 preserves quiet playback, two players and isolated playlists",()=>{
 const audio=read("audio-v1.js");
 assert.match(audio,/const volume=\.075/);
 assert.doesNotMatch(audio,/const volume=\.19/);
 const core=require("../src/audio/playlist-v27.js");
 assert.deepEqual(Object.values(core.groups).map(g=>g.length),[2,2,3]);
 assert.ok(audio.includes("core.fadeGains")&&audio.includes("fadeMs=3400"));
 assert.equal((audio.match(/new Audio\(\)/g)||[]).length,2);
});
test("V16 archive tabs update active destination and profile opens only the requested screen",()=>{
 const hub=read("campaign-hub-v1.js"),profile=read("profile-page.js");
 assert.match(hub,/tab\.setAttribute\('aria-current',String\(tab\.dataset\.openSection===id\)\)/);
 assert.match(profile,/document\.querySelectorAll\('\.screen'\)/);
 for(const id of ["campaignDossiers","campaignAchievements","campaignHistory"])
  assert.ok(hub.includes(id));
});

test("V17 stabilizes mobile shell and does not steal map audio on visibilitychange",()=>{
 const css=read("iphone-ux-v16.css"),home=read("cinema-home-v1.js");
 assert.match(css,/min-height:100svh/);
 assert.match(css,/padding-left:max\(12px,var\(--bh-inset-left/);
 assert.match(css,/padding-right:max\(12px,var\(--bh-inset-right/);
 assert.match(css,/cinema-still \.cinema-rain::after\{animation-play-state:paused!important\}/);
 assert.ok(home.includes("if(controls.parentElement===dock)document.body.append(controls)"));
 assert.ok(!home.includes("home.hidden?document.body:dock"));
});


test("V17 archive view state is restored by stable fold IDs, not save data",()=>{
 const hub=read("campaign-hub-v1.js");
 assert.ok(hub.includes("folds.set(key,el.open)"));
 assert.ok(hub.includes("if(folds.has(key))el.open=folds.get(key)"));
 assert.ok(hub.includes("if(!visible)return"));
 assert.ok(hub.includes("focus.focus({preventScroll:true})"));
 assert.ok(hub.includes("001:reward:"));
 assert.ok(hub.includes("001:attempt:"));
 assert.ok(read("campaign-case002-archive-v1.js").includes("002:attempt:"));
 assert.ok(read("campaign-criminal-archive-v1.js").includes("criminal:reward:"));
});


test("V17 map return works even for the current URL fragment and avoids smooth auto-scroll",()=>{
 const entry=read("case002-map-entry-v1.js"),map=read("campaign-map-journey-v1.js");
 assert.ok(entry.includes('window.location.hash!=="#district-digbeth"'));
 assert.ok(entry.includes("e.preventDefault();openHash()"));
 assert.ok(map.includes('scrollIntoView({block:"center",behavior:"auto"})'));
 assert.ok(map.includes("Math.abs(window.scrollY-y)>2"));
 assert.ok(!map.includes('behavior:reduce?"auto":"smooth"'));
});


test("V18 decorative motion pauses offscreen and archive remains mobile safe",()=>{
 const home=read("cinema-home-v1.js"),css=read("iphone-ux-v16.css");
 assert.ok(home.includes("new IntersectionObserver"));
 assert.ok(home.includes("||!heroVisible"));
 assert.ok(css.includes("object-fit:contain!important"));
 assert.ok(css.includes('content:"−"'));
 assert.ok(css.includes("translate3d(0,180px,0)"));
 assert.ok(read("campaign-achievements-rebalance-v1.css").includes("var(--bh-inset-top"));
});


test("V19 damaged Case001 archive is not overwritten or counted as confirmed",()=>{
 const hub=read("campaign-hub-v1.js");
 assert.ok(hub.includes("archive.status!=='ready'"));
 assert.ok(hub.includes("proven.has(k)"));
 assert.ok(hub.includes("campaign-001-alert"));
 assert.ok(read("player-profile-overview-v1.js").includes("подтверждённых знаков"));
});


test("V21 uses image panels and removes redundant profile/archive portals",()=>{
 const h=read("index.html"),css=read("cinema-home-v1.css"),bridge=read("campaign-bridge-v13.js");
 assert.equal((h.match(/class="cabinet-entry-art(?: |")/g)||[]).length,6);
 assert.doesNotMatch(h,/class="cabinet-entry-icon/);
 for(const file of ["assets/districts/centre.webp","assets/cabinet/criminal-menu-v23.webp","assets/cabinet/trials-menu-v25.webp","assets/cabinet/achievements-menu-v24.webp","assets/heroes/jack.webp","assets/heroes/eleanor.webp","assets/cabinet/profile-v21.webp","assets/cabinet/profile-header-v22.webp"]){
  assert.ok(h.includes(file));assert.ok(fs.statSync(path.join(root,file)).size>1000);
 }
 assert.match(css,/\.cabinet-entry::before,#home \.cabinet-entry::after\{content:none!important/);
 assert.ok(!bridge.includes('makeBar("archive")'));assert.ok(!bridge.includes('makeBar("profile")'));
 assert.ok(!read("campaign-criminal-archive-v1.js").includes('doc.getElementById("criminalEntry")?.click()'));
 assert.match(h,/class="profile-v21-art"/);
});


test("V22 profile artwork is shown in its natural aspect and detective copy scales to future cases",()=>{
 const h=read("index.html"),css=read("player-overview-cinema-v1.css"),menu=read("cinema-home-v1.css");
 assert.match(h,/<strong>Детективные дела<\/strong><small>Расследования<\/small>/);
 assert.match(h,/class="profile-v21-art"><img src="assets\/cabinet\/profile-header-v22\.webp"/);
 assert.match(css,/aspect-ratio:959\/540/);
 assert.match(css,/object-fit:contain;object-position:center;max-width:none;transform:none/);
 assert.doesNotMatch(menu,/transform:translate\(-80%,-50%\)/);
 assert.match(menu,/\.cabinet-art-medal img\{object-position:50% 57%/);
});

test("V26 maps decorative motion to the approved photograph without touching gameplay",()=>{
 const home=read("cinema-home-v1.js"),css=read("iphone-ux-v16.css"),menu=read("cinema-home-v1.css");
 assert.ok(home.includes("Math.max(width/720,height/900)"));
 assert.ok(home.includes("(height-900*scale)*.54"));
 assert.ok(home.includes("new ResizeObserver(syncCabinetGeometry)"));
 assert.ok(css.includes("536px * var(--cabinet-scale)"));
 assert.ok(css.includes("470px * var(--cabinet-scale)"));
 assert.ok(css.includes("146px * var(--cabinet-scale)"));
 assert.ok(css.includes("cinema-vinyl-glint::before{animation-play-state:paused!important}"));
 assert.match(menu,/cabinet-art-portraits\{[^}]*gap:1px;padding:0/);
 assert.match(menu,/cabinet-art-portraits img\{[^}]*border:0/);
});

test("V28 atlas heading and archive visual refinements preserve routes",()=>{
 const h=read("index.html"),css=read("iphone-ux-v16.css"),archive=read("campaign-case002-archive-v1.js");
 assert.ok(h.includes('<h2 class="district-atlas-title"><span>ТЕНИ</span> <span>БИРМИНГЕМА</span></h2>'));
 assert.ok(css.includes(".district-atlas-title span{display:block;white-space:nowrap}"));
 assert.ok(css.includes("#campaignDossiers .campaign-002-jumps>button:last-child:nth-child(odd){grid-column:1/-1}"));
 assert.ok(archive.includes("СВОДКА РАССЛЕДОВАНИЙ"));
 assert.ok(!archive.includes('back.href="#district-digbeth"'));
});

test("V39 uses the same compact header and directly readable portrait trial screens",()=>{
 const css=read("iphone-ux-v16.css");
 assert.ok(css.includes(":is(#districts,.campaign-hub,#criminalScreen,#choose,#play,#result)"));
 assert.match(css,/:is\(#choose,#play,#result\)\.screen:not\(\[hidden\]\)\{\s*animation:none!important;opacity:1!important/);
 assert.ok(css.includes("#play.screen::before{content:none!important;display:none!important}"));
});

test("V40 common archive excludes case launch and obsolete future-case placeholder",()=>{
 const archive=read("campaign-case002-archive-v1.js"),hub=read("campaign-hub-v1.js");
 for(const source of [archive,hub,read("campaign-case002-archive-v1.css")])assert.doesNotMatch(source,/campaign-002-to-digbeth|Следующие дела|Другие дела — впереди/);
 assert.ok(hub.includes("Расследования · «Работа для своих» · Испытания."));
 assert.ok(archive.includes('title.dataset.caseId="002"'));
 assert.ok(archive.includes("campaignSecondCaseAchievements"));
 assert.ok(archive.includes("campaignSecondCaseHistory"));
});
