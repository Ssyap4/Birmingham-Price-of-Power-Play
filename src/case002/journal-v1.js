/* Case 002 personal case journal, derived from committed transition records.
 * Never infer missing evidence, never replay rewards or change game state.
 * Older draft saves may contain action history without a "changes" field.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002Journal=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const people={ada:"Ада Уэбб",tommy:"Томми Кросс",mercer:"Дэниел Мерсер"};
const statuses={missing:"не найден",located:"найден, но не защищён",
 detained:"под охраной",protected:"под защитой",evacuated:"эвакуирован",
 deceased:"погиб"};
const flags={
 mabelTrustWary:"Мэйбл насторожилась после угроз Джека",
 mercerWilling:"Мерсер согласился на защищённые показания",
 mercerBetrayed:"Мерсер выдал адрес Ады",
 adaHideoutCompromised:"Укрытие Ады раскрыто охране",
 publicContactSecured:"Редакция Норы проверила материалы, но ещё не опубликовала их",
 valeGuarantee:"Гарантия Вейла подтверждена",
 workersCleared:"Рабочие выведены из опасной зоны",
 safeSidingAccess:"Обеспечен безопасный доступ к отводу",
 brackettAccountsHeld:"Герой получил копию счетов Брэкетта",
 accountsGivenToWorkers:"Копия счетов передана представителю рабочих",
 localIntermediary:"Получена поддержка посредника",
 evacuationRoutePrepared:"Подготовлен маршрут эвакуации",
 dangerWasExplained:"Герой предупреждён о смертельной опасности",
 fatalChoiceAcknowledged:"Герой сознательно принял смертельный риск"
};
const actions={
 withdrawAda:"Отступление от убежища Ады без её показаний",
 hideAda:"Решение укрыть Аду",
 betrayAda:"Передача адреса Ады охране",
 extractTommy:"Решение освободить Томми",
 protectMercer:"Решение защитить Мерсера",
 offerProtectedTestimony:"Предложение защищённых показаний Мерсеру",
 verifyTommyGuarantee:"Письменная гарантия освобождения Томми",
 copyManifest:"Получена копия грузовой ведомости",
 copyInspection:"Скопирован акт Мерсера",
 verifyForPublication:"Проверка доказательств для публикации",
 safeAccess:"Проверка доступа к частному отводу",
 clearWorkers:"Вывод рабочих с путей",
 verifyGuarantee:"Проверка гарантии Вейла",
 copyAccounts:"Получение копии счетов Брэкетта",
 handoverMurderEvidence:"Подготовка обвинения против Брэкетта",
 trustedIntermediary:"Разговор с посредником",
 passAccountsToWorkers:"Передача копии счетов рабочим",
 prepareEvacuation:"Подготовка эвакуации",
 acknowledgeDanger:"Вход в опасный проход",
 acceptFatalRisk:"Сознательный смертельный риск"
};
function entries(snapshot,labelEvidence){
 if(!snapshot||!Array.isArray(snapshot.history))throw Error("Case 002 attempt history required");
 const label=typeof labelEvidence==="function"?labelEvidence:id=>id;
 const rows=[];
 for(const item of snapshot.history){
   if(!item||typeof item.to!=="string")continue;
   const delta=item.changes||null;
   const notes=[];
   if(delta){
     for(const [id,change] of Object.entries(delta.witnesses||{}))
       notes.push((people[id]||id)+": "+(statuses[change.to]||change.to)+
         (change.to==="protected"?" (ещё не эвакуирован)":""));
     for(const id of delta.evidence||[])notes.push("Улика: "+label(id));
     for(const [id,change] of Object.entries(delta.custody||{}))
       notes.push("Передано: "+label(id)+
         (change.to==="workers"?" представителю рабочих":" (сменился владелец)"));
     for(const id of delta.flags||[])if(flags[id])notes.push(flags[id]);
   }
   if(item.action!=="continue"&&actions[item.action]&&notes.length===0)
     notes.push(actions[item.action]);
   if(snapshot.finished&&item.to.startsWith("Z")&&notes.length===0)
     notes.push("Попытка завершена; итог сохранён");
   if(notes.length)rows.push({from:item.from,to:item.to,
     notes:[...new Set(notes)],legacy:!delta});
 }
 return rows.reverse();
}
return {entries};
});
