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
test("existing two menu compositions remain in one audio player and settings persist",()=>{
 const js=read("audio-v1.js"),h=read("index.html");
 assert.match(js,/menu:\['night-on-the-docks\.mp3','menu-original\.ogg'\]/);
 assert.match(js,/case:\['case-fog\.ogg','case-ledger\.ogg','case-shadows\.ogg'\]/);
 assert.match(js,/bh_music_enabled/);
 assert.match(js,/bh_effects_enabled/);
 assert.match(js,/id="bhMenuTrack"/);
 assert.match(js,/trackBtn\.addEventListener/);
 assert.match(js,/p\.src=base\+playlists\[mode\]\[index\]/);
 assert.match(h,/audio-v1\.js/);assert.match(h,/audio-v1\.css/);
 for(const f of ["night-on-the-docks.mp3","menu-original.ogg","case-fog.ogg","case-ledger.ogg","case-shadows.ogg"])
  assert.ok(fs.statSync(path.join(root,"assets/audio",f)).size>1000,f);
});
