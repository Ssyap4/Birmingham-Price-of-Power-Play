/* Additive, read-only "Работа для своих" projection in the common
 * detective achievements, characters and history. Never writes localStorage,
 * grants rewards, imports corrupt records or modifies the detective engines.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else { root.BirminghamCriminalCampaignArchive = api; api.attach(root); }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const IDS = ["CR01", "CR02", "CR03", "CR04", "CR05"];
  const FINALS = ["clean", "costly", "failed", "dead"];
  function snapshot(store, archive, content) {
    if (!archive || typeof archive.ledger !== "function" ||
        !content || !content.missions || typeof content.awardName !== "function" ||
        IDS.some(id => !content.missions[id])) return {status: "unavailable"};
    const result = archive.ledger(store);
    if (!result.ok) return {status: /недоступ|запрет|чтени/i.test(result.error || "") ?
      "unavailable" : "damaged", error: result.error || "Повреждена хроника"};
    // The archive provider checks every finish by replay and validates all seals.
    const l = result.value;
    const lookup = new Map(l.attempts.map(a => [a.attemptId, a]));
    const rewards = Object.entries(l.rewards).map(([key, attemptId]) => {
      const state = lookup.get(attemptId);
      if (!state || key !== [state.missionId,state.heroId,state.terminalId].join(":"))
        throw Error("Награда без доказанного финала");
      const mission = content.missions[state.missionId];
      return {key, attemptId, missionId: state.missionId, hero: mission.hero.name,
        title: content.awardName(state.missionId,state.terminalId),
        ending: mission.endings[state.terminalId].title, terminalId: state.terminalId};
    });
    const achievements = Object.entries(l.achievements).map(([key, attemptId]) => {
      const state=lookup.get(attemptId);
      if(!state || !key.endsWith(":"+state.missionId))throw Error("Отметка без финала");
      return {key, missionId:state.missionId,
        title:key.startsWith("clean:")?"Выполнено без тяжёлых потерь":"Память о невозвращении"};
    });
    const missions=IDS.map(id=>{
      const m=content.missions[id];
      const finished=l.attempts.filter(s=>s.missionId===id);
      return {id, title:m.title, hero:m.hero.name, district:m.district,
        attempts:finished.length, rewards:rewards.filter(r=>r.missionId===id),
        endings:FINALS.map(outcome=>({id:outcome,title:m.endings[outcome].title,
          unlocked:rewards.some(r=>r.missionId===id && r.terminalId===outcome)}))};
    });
    const history=l.attempts.slice(-8).reverse().map(s=>{
      const m=content.missions[s.missionId];
      return {attemptId:s.attemptId, missionId:s.missionId,
        hero:m.hero.name, title:m.endings[s.terminalId].title,
        outcome:s.terminalId, hp:s.hp, decisions:s.revision,
        newSeal:l.rewards[[s.missionId,s.heroId,s.terminalId].join(":")]===s.attemptId};
    });
    return {status:"ready",total:l.attempts.length,unique:rewards.length,
      memories:achievements.length,missions,rewards,achievements,history};
  }
  function make(doc,tag,cls,txt){
    const el=doc.createElement(tag);
    if(cls)el.className=cls;
    if(txt!==undefined)el.textContent=String(txt);
    return el;
  }
  function render(doc,id,box,data){
    const wrap=make(doc,"section","campaign-criminal-section");
    wrap.id="campaignCriminal"+({campaignAchievements:"Achievements",
      campaignHistory:"History",campaignDossiers:"Dossiers"}[id]);
    const kicker=make(doc,"small","campaign-criminal-kicker","ДРУГАЯ СТОРОНА ГОРОДА · ОБЩИЙ ЛОКАЛЬНЫЙ АРХИВ");
    wrap.append(kicker,make(doc,"h3","campaign-group-title","Работа для своих"));
    if(data.status!=="ready"){
      wrap.append(make(doc,"p","campaign-criminal-alert",
        data.status==="damaged"?"Криминальная хроника повреждена. Неподтверждённые знаки здесь не показываются.":"Локальный архив криминальной кампании недоступен в этом браузере."));
      box.append(wrap);return;
    }
    wrap.append(make(doc,"p","campaign-criminal-intro",
      data.total+" завершённых попыток · "+data.unique+" уникальных знаков · "+
      data.memories+" памятных отметок. Детективные награды хранятся отдельно."));
    if(id==="campaignDossiers"){
      const grid=make(doc,"div","campaign-criminal-heroes");
      for(const m of data.missions){
        const item=make(doc,"article","campaign-criminal-hero");
        item.append(make(doc,"small","",m.id+" · "+m.district),
          make(doc,"h4","",m.hero),make(doc,"strong","",m.attempts+" прохождений"));
        item.append(make(doc,"p","",m.rewards.length+" / 4 уникальных исхода"));
        grid.append(item);
      }
      wrap.append(grid);
    }
    if(id==="campaignAchievements"){
      const grid=make(doc,"div","campaign-criminal-hero-folds");
      for(const m of data.missions){
        const fold=make(doc,"details","campaign-criminal-fold");
        fold.dataset.archiveFold="criminal:reward:"+m.id;
        const summary=make(doc,"summary","",m.id+" · "+m.hero+" · "+
          m.rewards.length+" / 4 знака");
        fold.append(summary);
        const items=make(doc,"div","campaign-criminal-seals");
        for(const ending of m.endings){
          const el=make(doc,"div",ending.unlocked?"campaign-criminal-seal earned":"campaign-criminal-seal",
            (ending.unlocked?"✦ ":"◇ ")+ending.title);
          if(ending.unlocked){
            const reward=m.rewards.find(r=>r.terminalId===ending.id);
            el.append(make(doc,"small","",reward.title+" · подтверждено"));
          }
          items.append(el);
        }
        fold.append(items);grid.append(fold);
      }
      wrap.append(grid);
      if(data.achievements.length){
        const memory=make(doc,"details","campaign-criminal-fold");
        memory.dataset.archiveFold="criminal:memory";
        memory.append(make(doc,"summary","","Памятные отметки · "+data.achievements.length));
        const group=make(doc,"div","campaign-criminal-seals");
        for(const x of data.achievements)
          group.append(make(doc,"p","campaign-criminal-memory",x.missionId+" · "+x.title));
        memory.append(group);wrap.append(memory);
      }
    }
    if(id==="campaignHistory"){
      const history=make(doc,"div","campaign-criminal-history");
      if(!data.history.length) history.append(make(doc,"p","","Завершённых попыток пока нет."));
      for(const attempt of data.history){
        const card=make(doc,"article","campaign-criminal-attempt");
        card.append(make(doc,"small","",attempt.missionId+" · "+attempt.hero),
          make(doc,"h4","",attempt.title),make(doc,"p","",
            "HP "+attempt.hp+"/100 · "+attempt.decisions+" решений · "+
            (attempt.newSeal?"Уникальный знак":"Повторный исход без новой награды")));
        history.append(card);
      }
      if(data.total>data.history.length)
        history.append(make(doc,"p","campaign-criminal-intro",
          "Показаны последние "+data.history.length+" попыток. Полная хроника доступна внутри режима."));
      wrap.append(history);
    }
    box.append(wrap);
  }
  function attach(root){
    if(!root.document)return;
    root.document.addEventListener("birmingham:campaign-render",event=>{
      const {id,box}=event.detail||{};
      if(!box || !["campaignAchievements","campaignHistory","campaignDossiers"].includes(id))return;
      let data;
      let store;
      try{store=root.localStorage;}catch(_){store=null;}
      try{data=snapshot(store,root.CriminalArchive,root.CriminalContent);}
      catch(_){data={status:"damaged"};}
      render(root.document,id,box,data);
    });
  }
  return {snapshot,render,attach};
});
