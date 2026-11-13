#!/usr/bin/env node
"use strict";
/* No editor's stage directions, status notes or next-section headings should
 * ever reach the player's offline narrative, across all 89 Case 002 scenes.
 */
const assert=require("node:assert/strict");
const {graph,narration}=require("../../src/case002/browser-data-v3.js");
const {parse}=require("../../src/case002/scene-prose-v1.js");
const ids=graph.nodes.map(x=>x.id);
assert.equal(ids.length,89);
assert.equal(Object.keys(narration).length,89);
const forbidden=[
  /(?:^|\n)#{2,6}\s/m,
  /(?:^|\n)\s*\d+\.\s+(?:Не подменять|Любая физическая|Герои не|В мобильной)/mi,
  /\b(?:Игрок|Если игрок|При выборе|семь одинаковых кнопок)\b/iu,
  /\b(?:редакторские проверки|Контроль персональных ветвей|Повтор визита не|не закрывает навсегда)\b/iu,
  /\[(?:Выбор|Не выдавать|Дополнительный способ|Флаг|Получает путь)[^\]]*\]/iu
];
for(const id of ids){
 const prose=narration[id];
 assert(typeof prose==="string"&&prose.length>=60,"Blank/truncated narrative "+id);
 assert(!prose.includes("undefined")&&!prose.includes("[object Object]"),"Broken interpolation "+id);
 for(const expression of forbidden)
   assert(!expression.test(prose),"Editor-only text leaked in scene "+id+": "+expression);
 const paragraphs=parse(prose);
 assert(paragraphs.length>=1,"Unreadable scene "+id);
 const words=paragraphs.flatMap(p=>p.lines.map(l=>l.text)).join("");
 assert(words.length>35,"Scene lacks readable text "+id);
}
const canon={
 A01:["На столе лежали два листа.","— С чего начнём?"],
 B01:["Сыщик развернул три потрёпанные карты.","Бирмингем жил своей жизнью"],
 C02:["Сменный начальник провёл ногтем","Об этом бумага скажет больше"],
 A10:["Мэйбл ждала у окна конторы.","— Вы боитесь за Томми?"],
 D10:["На доске пансиона висели три записки","Не спутайте найденного человека"],
 F02:["Герой разложил под лампой два листа.","— Две подделки. Две причины."],
 F07:["Охранники заняли узкий проход","ради чего стоит рисковать"],
 F09:["Утренний свет едва пробивался","За дверью уже ждали решения"]
};
for(const [id,signals] of Object.entries(canon)){
 for(const signal of signals)assert(narration[id].includes(signal),"Lost rewritten line "+id+": "+signal);
}
for(const id of ["C10","HJ03","HF03","HV03","HS03"]){
 const text=narration[id];
 assert(!text.includes("##"),"Future chapter heading leaked into "+id);
 assert(!/редакторские|контроль персональных|Глава [IVX]+|Финн О’Коннор · «Призрак|Сэмюэл Рид · «Механик»/.test(text),
   "Editorial guide leaked into "+id);
}
const {createEngine}=require("../../src/case002/engine-v3.js");
const {contract}=require("../../src/case002/browser-data-v3.js");
const {render}=require("../../src/case002/story-variants-v4.js");
const game=createEngine({graph,contract,hero:"jack",attemptId:"narrative-production-qa"});
const example=game.view();
for(const id of ["D10","F02","F09"]){
 const text=render({graph,contract,narration},{...example,scene:{...example.scene,id}});
 assert(!/Доступные тактики|Завершённых личных расследований|не закрывает навсегда/.test(text),
   "Internal UI direction leaked from state narrative "+id);
 assert(!text.includes("##"),"Editorial heading leaked from variant "+id);
}
assert(narration.C10.length<700,"C10 includes leaked editorial appendix");
for(const id of ["HJ03","HF03","HV03","HS03"])
 assert(narration[id].length<600,"Hero-only scene includes next actor section: "+id);
console.log("PASS Case002 playable prose: 89/89 scenes free of editor instructions; "+
 "8 rewritten in-world scenes; 5 chapter/editor boundaries trimmed.");
