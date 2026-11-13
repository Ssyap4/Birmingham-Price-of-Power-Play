/* Case 002 decision-receipt layer. A successful, committed transition may
 * generate player-visible consequences; no fake rewards or unearned rescues.
 * Pure functions only: unchanged inputs produce identical receipts.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002Consequences=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const witnesses={ada:"Ада Уэбб",tommy:"Томми Кросс",mercer:"Дэниел Мерсер"};
const statuses={
 missing:"местонахождение неизвестно",located:"найден, но не под защитой",
 detained:"под охраной",protected:"под защитой",evacuated:"вывезен из города",deceased:"погиб"
};
const knownFlags={
 publicContactSecured:"Нора Келл проверила независимые доказательства. Публикация ещё не вышла.",
 workersCleared:"Рабочие выведены с опасного пути. Остановка стрелки теперь не угрожает смене.",
 valeGuarantee:"Письменная гарантия Вейла подтверждена, но его вина от этого не исчезла.",
 brackettCanBeHandedOver:"Против Брэкетта подготовлена доказательная цепь.",
 localIntermediary:"Найден посредник для работы с копией счетов.",
 evacuationRoutePrepared:"Подготовлен маршрут для уже защищённых свидетелей.",
 mercerWilling:"Мерсер согласился на защищённые показания.",
 safeSidingAccess:"Проверен технический доступ к частному отводу.",
 brackettAccountsHeld:"Проверенная копия счетов Брэкетта теперь у героя."
};
function receipts(before,after,action,describeEvidence){
 const items=[];
 if(!before||!after||!Array.isArray(before.evidence)||!Array.isArray(after.evidence))
   throw new Error("Two Case 002 snapshots required");
 const label=typeof describeEvidence==="function"?describeEvidence:id=>id;
 const add=(kind,text)=>items.push({kind,text});
 if(action==="withdrawAda")add("choice","Вы отошли без показаний Ады. Это расследование с ней завершено без защиты.");
 if(action==="betrayAda")add("danger","Убежище Ады раскрыто охране. Переданный адрес нельзя отозвать.");
 if(action==="passAccountsToWorkers")
   add("custody","Копия счетов передана рабочим. Знание осталось, но личная концовка власти теперь закрыта.");
 for(const [id,status] of Object.entries(after.witnesses||{})){
   if(status!==before.witnesses?.[id]){
     let msg=witnesses[id]+": "+(statuses[status]||status)+".";
     if(status==="protected")msg+=" Это ещё не означает эвакуацию.";
     if(status==="detained"&&before.witnesses[id]!=="detained")msg+=" Освободить свидетеля в прежнем укрытии нельзя.";
     add("witness",msg);
   }
 }
 for(const id of after.evidence){
   if(!before.evidence.includes(id))add("evidence","Новая улика в досье: "+label(id)+".");
 }
 for(const [flag,message] of Object.entries(knownFlags)){
   if(after.flags?.[flag]===true && before.flags?.[flag]!==true)
     add("consequence",message);
 }
 if(after.finished&&!before.finished)add("final","Расследование завершено. Зафиксирована выбранная развязка.");
 return items;
}
function primary(before,after,action,label){
 const all=receipts(before,after,action,label);
 // Dramatic irreversible outcomes must remain visible ahead of minor incidental loot.
 const order={danger:0,custody:1,witness:2,choice:3,evidence:4,consequence:5,final:6};
 all.sort((a,b)=>order[a.kind]-order[b.kind]);
 return all.slice(0,2).map(x=>x.text).join(" ");
}
return {receipts,primary};
});
