"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const root=path.join(__dirname,"../.."),read=p=>fs.readFileSync(path.join(root,p),"utf8");
test("portrait cinema home has exactly two narrative entrances and four utilities",()=>{
 const h=read("index.html"),css=read("cinema-home-v1.css");
 assert.match(h,/id="home" class="screen cinema-home"/);
 for(const id of ["districtsCard","criminalEntry","storyStart","profileCard","cabinetProfile"])
  assert.equal((h.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id);
 assert.equal((h.match(/<button class="cabinet-entry/g)||[]).length,6);
 assert.ok(h.indexOf('id="districtsCard"')<h.indexOf('id="criminalEntry"'));
 assert.ok(h.indexOf('id="criminalEntry"')<h.indexOf('data-mode="classic"'));
 assert.match(h,/id="cabinetProfile" aria-label="Профиль"/);
 assert.match(h,/id="profileCard" aria-label="Досье персонажей"/);
 assert.doesNotMatch(h,/cabinetSettings|Настройки/);
 for(const old of ["cabinet-menu-v1.css","mobile-approved-menu-v1.css",
  "home-two-paths-v1.css","cabinet-profile-v2.css","home-story-first-v1.js"])
  assert.ok(!h.includes(old),"old live dependency: "+old);
 assert.match(h,/player-overview-cinema-v1\.css/);
 assert.match(h,/cinema-home-v1\.js/);
 assert.match(h,/id="cinemaAudioDock"/);
 const docking=read("cinema-home-v1.js");
 assert.match(docking,/if\(controls.parentElement===dock\)document.body.append\(controls\)/);
 assert.match(docking,/else if\(controls.parentElement!==dock\)/);
 assert.doesNotMatch(docking,/destination=home.hidden\?document.body:dock/);
 assert.match(css,/#home \.cinema-audio-dock \.bh-audio-controls/);
 assert.match(h,/src="assets\/districts\/centre\.webp"/);
 assert.match(css,/assets\/cabinet\/cinema-home-art-v12\.webp/);
 assert.doesNotMatch(css,/\.cinema-gramophone\{/);
 assert.doesNotMatch(h,/class="cinema-gramophone"/);
 const photo=fs.readFileSync(path.join(root,"assets/cabinet/cinema-home-art-v12.webp"));
 assert.equal(photo.length,136048);
 assert.equal(photo.toString("ascii",0,4),"RIFF");
 assert.equal(photo.toString("ascii",8,12),"WEBP");
 assert.equal(photo.toString("ascii",12,16),"VP8 ");
 assert.equal(photo.readUInt16LE(26)&0x3fff,720);
 assert.equal(photo.readUInt16LE(28)&0x3fff,900);

 assert.equal(crypto.createHash("sha256").update(photo).digest("hex"),"173dc43614f1870fb21e48ac5f40de89ecf69f8a8fbef4a96f2446ef29958799");

 assert.match(h,/src="assets\/cabinet\/profile-header-v22\.webp"/);
 const header=fs.readFileSync(path.join(root,"assets/cabinet/profile-header-v22.webp"));
 assert.equal(header.length,118550);
 assert.equal(header.toString("ascii",0,4),"RIFF");
 assert.equal(header.toString("ascii",8,12),"WEBP");
 assert.equal(header.toString("ascii",12,16),"VP8 ");
 assert.equal(header.readUInt16LE(26)&0x3fff,959);
 assert.equal(header.readUInt16LE(28)&0x3fff,540);
 assert.equal(crypto.createHash("sha256").update(header).digest("hex"),"4a83d9b7496b741879d970932c24483d4c7f447690a8b8b3137478c0bcaa2d91");
 const detective=h.match(/<button[^>]+id="districtsCard"[\s\S]*?<\/button>/)?.[0]||"";
 assert.match(detective,/<small>Расследования<\/small>/);
 assert.doesNotMatch(detective,/№00[1-9]/);
 assert.match(h,/src="assets\/cabinet\/profile-v21\.webp"/);
 const profileArt=fs.readFileSync(path.join(root,"assets/cabinet/profile-v21.webp"));
 assert.equal(profileArt.length,170164);
 assert.equal(profileArt.toString("ascii",0,4),"RIFF");
 assert.equal(profileArt.toString("ascii",8,12),"WEBP");
 assert.equal(profileArt.readUInt16LE(26)&0x3fff,720);
 assert.equal(profileArt.readUInt16LE(28)&0x3fff,900);
 assert.equal(crypto.createHash("sha256").update(profileArt).digest("hex"),"d25ace6393253524b5457239e648a3f94946939b2323601a30e375e062537b46");
 assert.match(h,/src="assets\/cabinet\/profile-seal\.svg"/);
 assert.doesNotMatch(h,/class="cabinet-entry-icon/);
 assert.equal((h.match(/class="cabinet-entry-art(?: |")/g)||[]).length,6);
 assert.match(css,/grid-template-columns:minmax\(0,43%\) minmax\(0,1fr\)/);
 assert.match(css,/cinema-rainfall/);assert.match(css,/cinema-smoke/);
 assert.match(css,/cinema-lamp/);assert.match(css,/cinema-vinyl/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/safe-area-inset-bottom/);
 assert.match(read("player-overview-cinema-v1.css"),/#profile \.player-campaign-overview/);
 assert.match(read("cinema-home-v1.js"),/MutationObserver/);
});
test("approved 2+2+3 local tracks, existing toggles and both real entries",()=>{
 const js=read("audio-v1.js"),h=read("index.html"),core=require("../../src/audio/playlist-v27.js");
 assert.deepEqual(core.groups,{menu:["covert-affair","just-as-soon"],detective:["spy-glass","moil"],criminal:["hard-boiled","dances-and-dames","deadly-roulette"]});
 for(const key of ["bh_music_enabled","bh_effects_enabled","id=\"bhMenuTrack\"","fadeMs=3400","core.fadeGains"])assert.ok(js.includes(key));
 assert.equal((js.match(/new Audio\(\)/g)||[]).length,2);
 assert.match(h,/audio-v1\.js/);assert.match(h,/audio-v1\.css/);assert.match(h,/src\/audio\/playlist-v27\.js/);
 assert.ok(read("preview/case002-prototype/index.html").includes('data-soundtrack="detective"'));
 for(const id of Object.values(core.groups).flat())assert.ok(fs.statSync(path.join(root,"assets/audio/soundtrack",id+".mp3")).size>1000,id);
 for(const stale of ["night-on-the-docks.mp3","menu-original.ogg","case-fog.ogg","case-ledger.ogg","case-shadows.ogg"])assert.ok(!fs.existsSync(path.join(root,"assets/audio",stale)),stale);
});

test("V23 criminal menu uses independent verified artwork, never the CR01 scene",()=>{
 const h=read("index.html");
 const card=h.match(/<button[^>]+id="criminalEntry"[\s\S]*?<\/button>/)?.[0]||"";
 assert.ok(card.includes("assets/cabinet/criminal-menu-v23.webp"));
 assert.ok(!card.includes("assets/criminal/cr01-arrival.webp"));
 const art=fs.readFileSync(path.join(root,"assets/cabinet/criminal-menu-v23.webp"));
 assert.equal(art.length,132566);
 assert.equal(art.toString("ascii",0,4),"RIFF");
 assert.equal(art.toString("ascii",8,12),"WEBP");
 assert.equal(art.toString("ascii",12,16),"VP8 ");
 assert.equal(art.readUInt16LE(26)&0x3fff,792);
 assert.equal(art.readUInt16LE(28)&0x3fff,720);
 assert.equal(crypto.createHash("sha256").update(art).digest("hex"),"782ec1f2867afe471ea653e57e5b162aea6a79a31cc4ef4f3ee046d1cdcde86d");
});

test("V24 achievement card uses independent verified artwork without a stretched banner",()=>{
 const h=read("index.html"),css=read("cinema-home-v1.css");
 const card=h.match(/<button[^>]+id="storyStart"[\s\S]*?<\/button>/)?.[0]||"";
 assert.ok(card.includes("assets/cabinet/achievements-menu-v24.webp"));
 assert.ok(!card.includes("assets/mobile-menu/approved-achievements.webp"));
 assert.match(card,/width="788" height="720"/);
 assert.doesNotMatch(css,/transform:translate\(-80%,-50%\)/);
 const art=fs.readFileSync(path.join(root,"assets/cabinet/achievements-menu-v24.webp"));
 assert.equal(art.length,145436);
 assert.equal(art.toString("ascii",0,4),"RIFF");
 assert.equal(art.toString("ascii",8,12),"WEBP");
 assert.equal(art.toString("ascii",12,16),"VP8 ");
 assert.equal(art.readUInt16LE(26)&0x3fff,788);
 assert.equal(art.readUInt16LE(28)&0x3fff,720);
 assert.equal(crypto.createHash("sha256").update(art).digest("hex"),"75ec252d844485b031d1fe767137e099f9bf0f693fe3428b5cb35e8182ab3aa7");
});

test("V25 trials card has independent pocket-watch artwork with natural proportions",()=>{
 const h=read("index.html"),css=read("cinema-home-v1.css");
 const card=h.match(/<button[^>]+data-mode="classic"[\s\S]*?<\/button>/)?.[0]||"";
 assert.ok(card.includes("assets/cabinet/trials-menu-v25.webp"));
 assert.ok(!card.includes("assets/original-art/clock.webp"));
 assert.match(card,/width="960" height="720"/);
 assert.match(css,/\.cabinet-art-clock img\{object-position:54% 52%/);
 const art=fs.readFileSync(path.join(root,"assets/cabinet/trials-menu-v25.webp"));
 assert.equal(art.length,158850);
 assert.equal(art.toString("ascii",0,4),"RIFF");
 assert.equal(art.toString("ascii",8,12),"WEBP");
 assert.equal(art.toString("ascii",12,16),"VP8 ");
 assert.equal(art.readUInt16LE(26)&0x3fff,960);
 assert.equal(art.readUInt16LE(28)&0x3fff,720);
 assert.equal(crypto.createHash("sha256").update(art).digest("hex"),"616d77c0811645c026a4ba8e87d3c71544d9018478307e7e5d962e517a677098");
});
