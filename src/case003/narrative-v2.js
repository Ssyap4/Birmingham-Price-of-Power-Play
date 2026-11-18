/* Player-facing narrative projection. No new state, rules or evidence. */
"use strict";
const {nodes,contract,start}=require("./graph-v1");
const has=(s,id)=>s.claims.includes(id);
function visitCount(s){
 let node=start,count=Number(node===s.node);
 for(const h of s.history){
  if(h.type!=="step")continue;
  const a=nodes[node].actions.find(a=>a.id===h.id);
  if(!a)throw Error("Invalid narrative history");
  node=a.to;
  if(node===s.node)count++;
 }
 return count;
}
function sceneText(s){
 const n=nodes[s.node];
 if(!n||n.virtual)throw Error("Invalid scene");
 if(s.ending)return [...n.text,...epilogueDetails(s)];
 return [...(n.revisitText&&visitCount(s)>1?n.revisitText:n.text)];
}
function epilogueDetails(s){
 if(!s.ending||!s.alive)return [];
 const out=[];
 const proof=contract.claims.filter(c=>has(s,c.id)).length;
 if(s.ending==="Z06")out.push(proof?"В отчёте остались подтверждённые выводы; те, которых не хватает, отмечены отдельно.":"Ни одно из главных утверждений не получило достаточного подтверждения.");
 if(s.flags.includes("witnessProtected")&&s.ending!=="Z01")out.push("Марш находится в безопасном месте, но дальнейшее решение о его показаниях ещё впереди.");
 if(s.flags.includes("materialsAccepted")&&s.ending!=="Z01")out.push("Эш приняла материалы. Это не означает, что по каждому из них уже начато разбирательство.");
 if(s.flags.includes("goodsSecured")&&!["Z02","Z04"].includes(s.ending))out.push("Остатки партии находятся на отдельном хранении; выдача требует подтверждения владельцев.");
 if(s.ending==="Z02"){
  const exact=(a)=>a.every(x=>s.evidence.includes(x));
  if(exact(["parcel","repair","receipt"]))out.push("Клара узнаёт косую царапину на кольце. Эш сверяет документы и разрешает выдачу. Клара не надевает кольцо сразу — сперва долго держит его в раскрытой ладони.");
  if(exact(["parcel","owner","transfer"]))out.push("Владелец часов открывает крышку, проводит пальцем по двум неровным буквам и наконец перестаёт мять шляпу. После проверки ему возвращают часы.");
 }
 if(s.ending==="Z06"&&s.flags.includes("vossAgreement"))out.push("Принятое обязательство об отсрочке огласки остаётся в силе.");
 if(s.ending==="Z06"&&s.flags.includes("darnAgreement"))out.push("Договорённость о контроле партии остаётся принятым обязательством; неполный отчёт не возвращает вещи владельцам.");
 return out;
}
module.exports={sceneText,epilogueDetails,visitCount};
