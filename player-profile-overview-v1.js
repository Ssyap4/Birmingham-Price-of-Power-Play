/* Read-only profile overview across three independent local modes.
 * Does not mint achievements, assign unique user IDs or migrate save namespaces.
 */
(function(root, factory) {
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  else {root.BirminghamPlayerOverview=api;api.attach(root);}
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function case001(store) {
    try{
      const raw=store.getItem("birmingham_campaign_records_v1");
      if(raw===null)return {count:0,unique:0,status:"empty"};
      const rows=JSON.parse(raw);
      if(!Array.isArray(rows) || rows.some(r=>!r||r.caseId!=="001"||
        typeof r.heroId!=="string"||typeof r.ending!=="string"||
        typeof r.key!=="string"))return {status:"damaged"};
      const keys=new Set(rows.map(r=>r.key));
      if(keys.size!==rows.length)return {status:"damaged"};
      return {count:rows.length,unique:new Set(rows.map(r=>r.heroId+":"+r.ending)).size,status:"ready"};
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
      if(r.status!=="ready" || r.records.status!=="ready" || r.rewards.status!=="ready")
        return {status:"damaged"};
      return {status:"ready",count:r.completed.length,unique:r.confirmed.size};
    }catch(_){return {status:"unavailable"};}
  }
  function criminal(root,store) {
    const api=root.CriminalArchive;
    if(!api)return {status:"unavailable"};
    try{
      const r=api.ledger(store);
      if(!r.ok)return {status:"damaged"};
      return {status:"ready",count:r.value.attempts.length,unique:Object.keys(r.value.rewards).length};
    }catch(_){return {status:"unavailable"};}
  }
  function snapshot(root){
    let store;
    try{store=root.localStorage;}catch(_){return [{name:"Дело №001",status:"unavailable"},{name:"Дело №002",status:"unavailable"},{name:"Работа для своих",status:"unavailable"}];}
    return [
      {name:"Дело №001",...case001(store)},
      {name:"Дело №002",...case002(root,store)},
      {name:"Работа для своих",...criminal(root,store)}
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
      count.textContent=item.status==="ready"||item.status==="empty"?String(item.count):"—";
      const desc=root.document.createElement("small");
      desc.textContent=item.status==="ready"||item.status==="empty"
        ?"Завершений: "+item.count+" · уникальных знаков/исходов: "+item.unique
        :item.status==="damaged"?"Архив требует проверки":"Локальный архив недоступен";
      card.append(h,count,desc);holder.append(card);
    }
  }
  function attach(root){
    if(!root.document)return;
    root.document.addEventListener("DOMContentLoaded",()=>{
      const entry=root.document.getElementById("cabinetProfile");
      const top=root.document.getElementById("profileBtn");
      entry?.addEventListener("click",()=>{
        top?.click();render(root);
      });
      top?.addEventListener("click",()=>render(root));
    });
  }
  return {snapshot,render,attach};
});
