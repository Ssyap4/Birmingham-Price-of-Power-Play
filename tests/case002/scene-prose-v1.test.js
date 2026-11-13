#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const {parse,render}=require("../../src/case002/scene-prose-v1.js");
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
 return {tag,children:[],textContent:"",className:"",
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
console.log("PASS Case002 local dialogue presentation: 13 structural assertions, source text preserved, no HTML or invented voices.");
