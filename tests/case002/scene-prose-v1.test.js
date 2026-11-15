#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const {parse,render,SPEAKER_LINES}=require("../../src/case002/scene-prose-v1.js");
const t="Станция затихла.\n— Я видел вагон, — прошептал сторож.\nОн отвернулся от героя.\n— Уходите, пока не поздно.\n\nГерой посмотрел на часы.";
const items=parse(t);
assert.equal(items.length,2);
assert.deepEqual(items.map(p=>p.lines.map(l=>l.spoken)),[[false,true,false,true],[false]]);
assert.equal(items[0].lines[1].text,"— Я видел вагон, — прошептал сторож.");
assert.equal(items[1].lines[0].text,"Герой посмотрел на часы.");
assert.deepEqual(parse(" — Здравствуйте\n\n — Здравствуйте "),[
 {lines:[{text:"— Здравствуйте",spoken:true}]},
 {lines:[{text:"— Здравствуйте",spoken:true}]}
]);
assert.equal(parse("").length,0);
assert.equal(parse("\n\n  \n").length,0);
assert.equal(parse("«Ни слова!»").flatMap(p=>p.lines)[0].spoken,false);
assert.equal(parse("—").flatMap(p=>p.lines)[0].spoken,false);
assert.equal(parse("— ВЫБОР").flatMap(p=>p.lines)[0].spoken,true);
assert.throws(()=>parse(null),/narration must be text/);
function el(tag){
 return {tag,children:[],textContent:"",className:"",attrs:{},
  setAttribute(k,v){this.attrs[k]=v;},
  append(...x){this.children.push(...x);},replaceChildren(){this.children=[];}};
}
const doc={createElement:el,createTextNode:x=>({textContent:x,tag:"#text"})};
const target=el("div");
assert.equal(render(target,t,doc),2);
assert.equal(target.children.length,2);
assert.equal(target.children[0].children.filter(x=>x.tag==="span"&&
 x.className==="scene-spoken-line").length,2);
const flatten=x=>x.children?.length?x.children.map(flatten).join(""):x.textContent;
assert.equal(target.children.map(flatten).join("\n\n"),t);
const malicious="<script>alert('x')</script>\n— <img src=x onerror=evil>";
render(target,malicious,doc);
assert.equal(target.children[0].children.filter(x=>x.tag==="span").length,2);
assert.equal(flatten(target.children[0]),malicious);
assert.throws(()=>render(null,t,doc),/needs a document/);
const mabel="В комнату вошла Мэйбл.\n— Вы пришли?\n— К вам?\n— Тогда говорите.\n— Я расскажу.";
render(target,mabel,doc,"P02");
const labels=target.children[0].children.filter(x=>x.tag==="span"&&x.className==="scene-spoken-line");
assert.deepEqual(labels.map(x=>x.attrs["data-speaker"]),["Мэйбл Кросс","Вы","Мэйбл Кросс","Мэйбл Кросс"]);
assert.equal(flatten(target.children[0]),mabel);
assert.equal(SPEAKER_LINES.P02.length,4);
const narration=require("../../src/case002/browser-data-v3.js").narration;
let verifiedScenes=0;
for(const [id,prose] of Object.entries(narration)){
 const spoken=parse(prose).flatMap(p=>p.lines).filter(line=>line.spoken).length;
 if(!spoken)continue;
 assert.equal(SPEAKER_LINES[id]?.length,spoken,"Scene "+id+" speaker sequence is out of sync");
 verifiedScenes++;
}
assert.equal(verifiedScenes,73,"All 73 authored dialogue scenes must be covered");

/* A genuine state-sensitive dialogue may have a different number of lines
 * from the original script. Labels must remain exact and may never attribute
 * Mabel's words to Tommy merely because a base scene lists Tommy first. */
const dynamicNarrative=require("../../src/case002/story-variants-v4.js");
const {graph,contract}=require("../../src/case002/browser-data-v3.js");
const {createEngine}=require("../../src/case002/engine-v3.js");
const baseline=createEngine({
 graph,contract,hero:"jack",attemptId:"variant-speaker-labels"
}).view();
const dialogueCases=[
 ["C04",{}, {},[],"Мэйбл Кросс"],
 ["D06",{tommy:"detained"},{},[],"Мэйбл Кросс"],
 ["D09",{ada:"missing"},{},[],"Дэниел Мерсер"],
 ["D10",{}, {},[],"Хозяйка пансиона"],
 ["E05",{}, {workersCleared:false},[],"Вы"],
 ["E07",{}, {valeGuarantee:false},[],"Вы"],
 ["E07",{}, {valeGuarantee:true},[],"Вы"],
 ["E08",{}, {},[],"Льюис Брэкетт"],
 ["F02",{}, {},[],"Вы"],
 ["F02",{}, {},[], "Вы", {provedFirstForgery:true,provedSecondForgery:true}]
];
for(const [sceneId,witnesses,flags,evidence,expected,facts={}] of dialogueCases){
 const scene=graph.nodes.find(x=>x.id===sceneId);
 const view={
  ...baseline,scene,
  state:{...baseline.state,
   evidence,witnesses:{...baseline.state.witnesses,...witnesses},
   flags:{...baseline.state.flags,...flags}},
  facts:{...baseline.facts,...facts}
 };
 const narrative=dynamicNarrative.render({graph,contract,narration},view);
 render(target,narrative,doc,sceneId);
 const spoken=target.children.flatMap(p=>p.children).filter(
  x=>x.tag==="span"&&x.className==="scene-spoken-line");
 assert.equal(spoken.length,1,"Expected one state-sensitive reply in "+sceneId);
 assert.equal(spoken[0].attrs["data-speaker"],expected,
  "Wrong named speaker in state-sensitive scene "+sceneId);
 assert.equal(flatten(target.children[0]).startsWith(narrative.split("\n")[0]),true,
  "Narration must remain exact after assigning a speaker label");
}
render(target,"— Эта реплика не принадлежит известному участнику.",doc,"E08");
const unknown=target.children[0].children.find(x=>x.className==="scene-spoken-line");
assert.equal(unknown.attrs["data-speaker"],undefined,
 "An unknown variant reply must never receive a guessed identity");
// Unchanged multi-line screenplay dialogue retains its authored order.
render(target,narration.C04,doc,"C04");
const authored=target.children.flatMap(p=>p.children).filter(x=>
 x.className==="scene-spoken-line");
assert.deepEqual(authored.map(x=>x.attrs["data-speaker"]),
 ["Мэйбл Кросс","Вы","Мэйбл Кросс"]);
console.log("PASS Case002 local dialogue presentation: 89 source scenes and 10 state-sensitive spoken lines attributed without guessing.");
