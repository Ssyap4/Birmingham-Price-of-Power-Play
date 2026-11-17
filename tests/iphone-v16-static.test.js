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
 assert.ok(map.includes('scrollIntoView({block:"center",behavior:"instant"})'));
 assert.ok(map.includes("generation!==revealGeneration"));
 assert.ok(map.includes('document.addEventListener("pointerdown",()=>{revealGeneration++}'));
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

test("Compact header includes both the legacy Case001 reader and shared internal screens",()=>{
 const css=read("iphone-ux-v16.css");
 const scopes=[...css.matchAll(/body:has\(>\.shell>:is\(([^)]+)\):not\(\[hidden\]\)\)>\.shell>\.top/g)];
 assert.ok(scopes.length>=6);
 for(const scope of scopes)for(const required of ["#districts",".campaign-hub","#criminalScreen","#choose","#play","#result","#caseGame"])
  assert.ok(scope[1].split(",").includes(required),"Missing compact-header screen: "+required);
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


test("V41 Case001 irreversible transitions for all heroes and resumed saves",()=>{
 const vm=require("node:vm"),source=read("case-v14.js");
 const at=source.indexOf("window.BirminghamCase={");
 assert.ok(at>0);
 const injected=source.slice(0,at)+`render=()=>save();notify=()=>{};window.audit={fresh:()=>{state=fresh();return state},load:()=>{state=load();return state},state:()=>state,move,storyAllows};})();`;
 for(const hero of ["jack","finn","eleanor","victor","samuel"]){
  const store=new Map(),window={BirminghamHero:{selectedId:hero},scrollTo(){}};
  const math=Object.create(Math);math.random=()=>.99;
  vm.runInNewContext(injected,{window,document:{addEventListener(){}},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},Math:math,console});
  const api=window.audit;
  const go=(...nodes)=>{for(const node of nodes){api.move(node);assert.equal(api.state().node,node,hero+" -> "+node);}};
  api.fresh();go("widow","office","canal","bribe","warehouse","pump","yard","rescue","confront");
  assert.equal(api.storyAllows("yard"),false);api.move("yard");assert.equal(api.state().node,"confront");
  api.load();assert.equal(api.storyAllows("yard"),false);api.move("yard");assert.equal(api.state().node,"confront");go("endingDeal");
  api.fresh();go("widow","canal","bribe","pump","confront","yard","confront");
  assert.equal(api.storyAllows("yard"),false);go("endingDeal");
  api.fresh();go("widow","office","canal","bribe","warehouse","warn","office","canal","bribe","warehouse");
  assert.equal(api.storyAllows("warn"),false);api.move("warn");assert.equal(api.state().node,"warehouse");go("pump","yard","rescue","endingRescue");
  api.fresh();go("widow","interview","envelope","widow");assert.equal(api.storyAllows("interview"),false);api.move("interview");assert.equal(api.state().node,"widow");
 }
});


test("V42 revisit continuity and all six endings remain reachable for every hero",()=>{
 const vm=require("node:vm"),source=read("case-v14.js");
 const injected=source.slice(0,source.indexOf("window.BirminghamCase={"))+"render=()=>save();notify=()=>{};window.audit={fresh:()=>{state=fresh();return state},load:()=>{state=load();return state},state:()=>state,move,storyAllows,text:()=>sceneText(scenes[state.node])};})();";
 const run=function(factory,assert){
 let count=0;
 for(const hero of ["jack","finn","eleanor","victor","samuel"]){
  const store=new Map(),window={BirminghamHero:{selectedId:hero},scrollTo(){}},math=Object.create(Math); math.random=()=>.99;
  factory(window,{addEventListener(){}},{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},math);
  const api=window.audit;
  const start=()=>{store.clear();math.random=()=>.99;api.fresh()};
  const go=(...nodes)=>{for(const node of nodes){api.move(node);assert(api.state().node===node,hero+" -> "+node+" actual "+api.state().node);count++}};
  start();go("widow","office","widow");assert(api.text().includes("уже у тебя"),"key repeated");go("office","canal","bribe","warehouse","reed","accuse","canal","bribe");assert(api.text().includes("помнит уговор"),"bribe repeated");go("warehouse","reed");assert(api.text().includes("настороженно"),"Reed forgot accusation");assert(!api.storyAllows("accuse"),"repeat accusation");go("canal","bribe","warehouse","warn","office","widow");assert(api.text().includes("у соседки"),"Evelyn location");api.load();assert(api.text().includes("у соседки"),"Evelyn resume");
  go("canal","bribe","warehouse","pump","yard","rescue","confront");assert(!api.storyAllows("yard"),"rescue rewind");assert(api.text().includes("уже освобождён"),"Arthur status");go("endingDeal");
  start();go("widow","office","searchOffice","office","canal","bribe","warehouse","reed","reedProof","confession","pump","confront","expose");
  const key="birmingham_case_v20_findings_"+hero;store.set(key,JSON.stringify({started:api.state().started,deductions:["Уничтоженные записи"]}));go("endingTruth");
  start();go("widow","office","searchOffice","office","canal","bribe","warehouse","reed","reedProof","confession","pump","confront","expose");store.set(key,JSON.stringify({started:api.state().started,deductions:["Уничтоженные записи"]}));go("endingPower");
  start();go("widow","canal","bribe","pump","yard","rescue","endingRescue");
  start();go("widow","canal","bribe","warehouse","pump","trade");assert(!api.state().items.includes("ledger"),"ledger not traded");go("endingEvidence");
  start();go("widow","canal");math.random=()=>0;go("sneak","warehouse","pump","yard","rescue");api.move("endingEvidence");assert(api.state().node==="endingDeath","death route");count++;
 }
 return count;
};
 run((window,document,localStorage,Math)=>vm.runInNewContext(injected,{window,document,localStorage,Math,console}),assert.ok);
 const reactions=read("case-v20-reactions.js");
 assert.match(reactions,/nodes:\['confront'\]/);
 assert.doesNotMatch(reactions,/nodes:\['confront','trade'/);
 assert.ok(reactions.includes("e.requires.every(item=>current.items.includes(item))"));
});


test("V42 contextual location follows Evelyn and introduces Reed when not yet known",()=>{
 const source=read("case-v14.js");
 assert.ok(source.includes("$('casePlace').textContent=scenePlace(n)"));
 assert.ok(source.includes("Смолл-Хит · дом соседки · кухня"));
 assert.ok(source.includes("В участке тебя направляют к сержанту Риду"));
});


test("V43 Case002 prose follows actual transitions, pending decisions, and saved evacuation",()=>{
 const data=require("../src/case002/browser-data-v3.js"),engine=require("../src/case002/engine-v3.js"),narr=require("../src/case002/story-variants-v4.js");
 const suite=function(data,engine,narr,check){
 let transitions=0,cases=0;
 const heroes=data.contract.heroes;
 for(const hero of heroes){
  const store=new Map(),storage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  const create=()=>engine.createEngine({graph:data.graph,contract:data.contract,hero,store:storage,now:()=>1000,attemptId:"audit-"+hero});
  let e=create();
  const choice=(to,action="continue")=>{e.choose(to,action);transitions++;};
  const go=(...ids)=>ids.forEach(id=>choice(id));const raw=()=>narr.render(data,e.view());
  const ok=(v,msg)=>check(v,hero+": "+msg);
  const start=(manifest)=>{e.reset("audit-"+hero+"-"+(++cases));go("P02","A01","A02","A04","A06","A08","A10","B01");
    go("B05","B06","B07","B01");ok(raw().includes("Проверенные направления: канал"),"repeat B01");
    if(manifest)go("B02","B03","B04","B01");
    go("B08","B09","B10","B11","B12","B13","B14","C01","C02","C03","C04");
    if(!manifest)ok(raw().includes("На возвращение")&&!raw().includes("Принесите"),"impossible return instruction");else ok(raw().includes("Да."),"confession with manifest");
    go("C05","C06","C07","C08","C09","C10","D01");
  };
  const finale=(prepare)=>{go("D11","E01","E04");choice("E05","safeAccess");choice("E08","clearWorkers");
    go("E09","E10","E11");choice("F01",prepare?"prepareEvacuation":"continue");go("F02","F03","F04","F05","F06");choice("F07","acknowledgeDanger");
    ok(!raw().includes("кого удалось вывести"),"premature evacuation");
    go("F08","F09");
    if(prepare){ok(raw().includes("Подготовлен маршрут вывоза")&&raw().includes("Пока они только под защитой"),"evacuation anticipated not completed");e=create();e.load();ok(raw().includes("Подготовлен маршрут вывоза"),"evacuation resume");}
    else ok(raw().includes("подготовленного вывоза"),"no evacuation preparation");
    go("Z02");ok(e.snapshot().witnesses.ada===(prepare?"evacuated":"protected"),"end witness state");ok(raw().includes(prepare?"уехали":"Никто"),"end prose");
  };
  start(false);go("D02","D03");choice("D10","hideAda");go("D01","D04","D05");choice("D06","extractTommy");
  if(hero==="victor"){go("HV02");ok(raw().includes("уже выведен"),"Tommy already released");ok(!e.availableChoices().find(c=>c.action==="verifyTommyGuarantee").enabled,"second guarantee blocked");go("D10");}
  else go("D10");
  finale(true);
  start(true);go("D02","D03");choice("D10","hideAda");
  finale(false);
 }
 // Specialist decisions must be legible prior to commitment.
 for(const hero of ["finn","samuel","eleanor","victor"]){
   for(const [id,expected] of Object.entries({finn:["HF03","всё ещё в сейфе"],samuel:["HS03","ещё предстоит"],eleanor:["HE03","не закончена"],victor:["HV02","не получено"]}).filter(([k])=>k===hero).map(([,v])=>v).map(([a,b])=>[a,b])){
     const node=data.graph.nodes.find(n=>n.id===id);const state={hero,flags:{},evidence:[],witnesses:{ada:"missing",tommy:"detained",mercer:"located"}};
     check(narr.render(data,{scene:node,state,facts:{}}).includes(expected),hero+" prior to choice "+id);
   }
 }
 return {transitions,cases};
};
 suite(data,engine,narr,assert.ok);
});
