/* Birmingham Case 002 — non-spoiling evidence/deduction board v1.
 * Pure projection of the actual contract and acquired evidence; no game-state
 * mutation, no new puzzles, no implied knowledge of uncollected items.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002DeductionBoard=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const NAMES=Object.freeze({
 provedFirstForgery:{lead:"Неясности в отправлении",proved:"Подлог отправления Мэйбл"},
 provedWagonDiversion:{lead:"Исчезнувший грузовой вагон",proved:"Перехват вагона F-4182"},
 provedSecondForgery:{lead:"Несовпадение записей прибытия",proved:"Подложная запись о прибытии"},
 provedFactoryCoverup:{lead:"Расхождения в заводских документах",proved:"Сокрытие заводской аварии"},
 provedHaleMurder:{lead:"Следы у кирпичного виадука",proved:"Убийство Хейла Брэкеттом"},
 provedBrackettNetwork:{lead:"Подозрительные расчёты и платежи",proved:"Счета преступной сети"}
});
function board(contract,evidence){
 if(!contract||!contract.deductionRules||!Array.isArray(contract.supportedEvidence)||
    !Array.isArray(evidence))throw Error("Case 002 contract and evidence required");
 const held=new Set(evidence);
 if(held.size!==evidence.length||evidence.some(id=>!contract.supportedEvidence.includes(id)))
   throw Error("Invalid or duplicate Case 002 evidence");
 const result=[];
 for(const [key,groups] of Object.entries(contract.deductionRules)){
  const text=NAMES[key];
  if(!text||!Array.isArray(groups)||!groups.length)throw Error("Unknown deduction: "+key);
  const complete=groups.filter(group=>group.every(id=>held.has(id)));
  const supported=new Set(groups.flat().filter(id=>held.has(id)));
  // A deduction becomes a known lead only when the hero has personally
  // collected an item relevant to it. No spoiler or empty grey title otherwise.
  if(!supported.size)continue;
  const verified=complete.length>0;
  const sourceGroups=verified?complete:groups.filter(group=>group.some(id=>held.has(id)));
  const relevant=[...supported];
  result.push({
   id:key,title:verified?text.proved:text.lead,
   verified,knownEvidence:relevant,
   proofChains:verified?complete.map(group=>[...group]):[],
   status:verified?"ДОКАЗАНО":"ЗАЦЕПКА",
   explanation:verified?
    "Вывод подтверждён сочетанием независимых материалов.":
    "Заметно противоречие, но независимой проверки пока недостаточно.",
   relatedEvidence:sourceGroups.flat().filter(id=>held.has(id))
     .filter((id,index,self)=>self.indexOf(id)===index)
  });
 }
 return result;
}
return {board,NAMES};
});
