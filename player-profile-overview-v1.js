/* Read-only profile overview across three independent local modes.
 * Does not mint achievements, assign unique user IDs or migrate save namespaces.
 */
(function(root, factory) {
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else {root.BirminghamPlayerOverview=api;api.attach(root);}
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  const heroes=new Set(["jack","finn","eleanor","victor","samuel"]);
  const endings=new Set(["endingRescue","endingEvidence","endingDeal","endingTruth","endingPower","endingDeath"]);
  const validKey=k=>{const p=k.split(":");return p.length===3&&p[0]==="001"&&heroes.has(p[1])&&endings.has(p[2])};
  // Slot status is deliberately independent from the terminal archive.
  // A new active run can coexist with historical confirmed rewards.
  function slotSummary(states){
    return {active:states.filter(s=>s==="active").length,
      finishedSlots:states.filter(s=>s==="finished").length,
      slotIssues:states.filter(s=>s==="damaged"||s==="unavailable").length};
  }
  function firstSlots(root,store){
    if(!root.BirminghamCase?.hasSavedCase||!root.BirminghamCase?.hasProgress)return {};
    return slotSummary([...heroes].map(hero=>{
      try{
        const raw=store.getItem("birmingham_case_smol_heath_v1_"+hero);
        if(raw===null)return "empty";
        const s=JSON.parse(raw);
        if(!Number.isFinite(s?.started)||!root.BirminghamCase.hasSavedCase(hero))return "damaged";
        return endings.has(s.node)?"finished":root.BirminghamCase.hasProgress(hero)?"active":"damaged";
      }catch(_){return "damaged";}
    }));
  }
  function criminalSlots(root,store){
    const api=root.CriminalArchive,missions=root.CriminalContent?.missions;
    if(!api?.load||!missions)return {};
    return slotSummary(Object.keys(missions).map(id=>{
      try{
        const slot=api.load(store,id);
        return slot.kind==="valid"?slot.state.status:slot.kind==="corrupt"?"damaged":slot.kind;
      }catch(_){return "unavailable";}
    }));
  }
  function case001(store) {
    let raw,rewardRaw;
    try{raw=store.getItem("birmingham_campaign_records_v1");rewardRaw=store.getItem("birmingham_campaign_unique_rewards_v1");}
    catch(_){return {status:"unavailable"};}
    try{
      const rows=raw===null?[]:JSON.parse(raw), rewards=rewardRaw===null?{}:JSON.parse(rewardRaw);
      if(!Array.isArray(rows)||rows.some(r=>!r||r.caseId!=="001"||!heroes.has(r.heroId)||
        !endings.has(r.ending)||typeof r.key!=="string"||!r.key||
        ["items","deductions","visited"].some(k=>r[k]!==undefined&&!Array.isArray(r[k])))||
        new Set(rows.map(r=>r.key)).size!==rows.length||
        !rewards||typeof rewards!=="object"||Array.isArray(rewards)||
        Object.entries(rewards).some(([k,v])=>!validKey(k)||!(v===true||(Number.isFinite(v)&&v>0))))return {status:"damaged"};
      const combos=new Set(rows.map(r=>"001:"+r.heroId+":"+r.ending));
      const confirmed=Object.keys(rewards).filter(k=>combos.has(k));
      const partial=confirmed.length!==combos.size||confirmed.length!==Object.keys(rewards).length;
      return {count:rows.length,unique:confirmed.length,status:partial?"partial":raw===null?"empty":"ready"};
    }catch(_){return {status:"damaged"};}
  }
  function case002(root,store) {
    const api=root.BirminghamCase002CampaignArchive;
    const data=root.BirminghamCase002Data;
    const engine=root.BirminghamCase002Engine;
    const achieves=root.BirminghamCase002Achievements;
    if(!api||!data||!engine||!achieves)return {status:"unavailable"};
    try{
      const r=api.snapshot(store,data.contract,engine,achieves,data.graph);
      if(r.status!=="ready")return {status:"unavailable"};
      const slots=r.saves?slotSummary(Object.values(r.saves).map(s=>s.status==="ready"?(s.finished?"finished":"active"):s.status)):{};
      if(r.records.status==="unavailable"||r.rewards.status==="unavailable")return {status:"unavailable",...slots};
      if(r.records.status!=="ready"||r.rewards.status!=="ready")return {status:"damaged",...slots};
      return {status:r.orphaned||r.withoutSeals||(r.earned&&r.earned.status!=="ready")?"partial":"ready",count:r.completed.length,unique:r.confirmed.size,...slots};
    }catch(_){return {status:"unavailable"};}
  }
  function criminal(root,store) {
    const api=root.CriminalArchive;
    if(!api)return {status:"unavailable"};
    try{
      const r=api.ledger(store);
      if(!r.ok)return {status:/недоступ|запрет|чтени/i.test(r.error||"")?"unavailable":"damaged"};
      return {status:"ready",count:r.value.attempts.length,unique:Object.keys(r.value.rewards).length};
    }catch(_){return {status:"unavailable"};}
  }
  function snapshot(root){
    let store;
    try{store=root.localStorage;}catch(_){return [{name:"Дело №001",status:"unavailable"},{name:"Дело №002",status:"unavailable"},{name:"Работа для своих",status:"unavailable"}];}
    if(!store)return [{name:"Дело №001",status:"unavailable"},{name:"Дело №002",status:"unavailable"},{name:"Работа для своих",status:"unavailable"}];
    return [
      {name:"Дело №001",...case001(store),...firstSlots(root,store)},
      {name:"Дело №002",...case002(root,store)},
      {name:"Работа для своих",...criminal(root,store),...criminalSlots(root,store)}
    ];
  }
  function render(root){
    const holder=root.document?.querySelector("#playerCampaignOverview .player-overview-cards");
    if(!holder)return;
    holder.replaceChildren();
    for(const item of snapshot(root)){
      const card=root.document.createElement("article");
      card.className="player-overview-card";
      card.dataset.status=item.status;
      card.setAttribute("role","listitem");
      const h=root.document.createElement("h4");h.textContent=item.name;
      const count=root.document.createElement("strong");
      const available=["ready","empty","partial"].includes(item.status);
      count.textContent=available?String(item.count):"—";
      const desc=root.document.createElement("small");
      desc.textContent=available
        ?"Завершений: "+item.count+" · подтверждённых знаков: "+item.unique+
          (item.status==="partial"?" · Есть неподтверждённые записи.":"")
        :item.status==="damaged"?"Архив требует проверки":"Локальный архив недоступен";
      card.append(h,count,desc);
      if(Number.isInteger(item.active)){
        const live=root.document.createElement("p");
        live.className="player-overview-live";
        live.dataset.active=String(item.active);
        live.dataset.issues=String(item.slotIssues||0);
        live.dataset.finished=String(item.finishedSlots);
        live.textContent="В работе: "+item.active+" · Завершённых слотов: "+item.finishedSlots+
          (item.slotIssues?" · Проблемных сохранений: "+item.slotIssues:"");
        card.append(live);
      }
      holder.append(card);
    }
  }
  function attach(root){
    if(!root.document)return;
    root.document.addEventListener("DOMContentLoaded",()=>{
      const entry=root.document.getElementById("cabinetProfile");
      const top=root.document.getElementById("profileBtn");
      entry?.addEventListener("click",()=>top?.click());
      const refreshVisible=()=>{if(!root.document.getElementById("profile")?.hidden)render(root)};
      root.addEventListener("pageshow",refreshVisible);
      root.addEventListener("storage",refreshVisible);
    });
  }
  return {snapshot,render,attach};
});
