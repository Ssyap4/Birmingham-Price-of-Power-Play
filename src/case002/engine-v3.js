/* Birmingham: Price of Power — Case 002, isolated draft engine v3.
 * Browser global: BirminghamCase002Engine. Node: require(...).
 * No DOM, no remote calls, no Case 001 writes. Stable story graph/contract injected.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.BirminghamCase002Engine = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSION = 3;
  const SAVE_PREFIX = "birmingham_case002_draft_v3_";
  const RECORD_KEY = "birmingham_case002_records_draft_v3";
  const REWARD_KEY = "birmingham_case002_rewards_draft_v3";
  const END_NODES = {
    Z01:"trainTruth",Z02:"trainEscape",Z03:"trainScapegoat",
    Z04:"trainDeal",Z05:"trainSabotage",Z06:"trainControl",Z07:"trainDeath"
  };
  const ROUTES = {B04:"rail",B07:"canal",B10:"factory"};
  // A branch is resolved only when its consequences have been committed at D10.
  // Derive from the existing action history so previous v3 saves remain readable.
  const WITNESS_BRANCH = {
    "D02":"ada","D03":"ada","HE02":"ada",
    "D06":"tommy","HV02":"tommy",
    "D09":"mercer","HF03":"mercer"
  };
  const WITNESS_ENTRANCES = {D02:"ada",D04:"tommy",D07:"mercer"};
  const RAIL_ENTRANCES = {B02:"rail",B05:"canal",B08:"factory"};
  function resolvedWitnessBranches(s) {
    const resolved = new Set();
    for (const entry of s.history) {
      if (entry.to === "D10" && WITNESS_BRANCH[entry.from])
        resolved.add(WITNESS_BRANCH[entry.from]);
    }
    return resolved;
  }
  const EVIDENCE_BY_NODE = {
    A05:["old_excursion_ticket"],A06:["hale_coat"],A08:["guard_bootmark"],
    B03:["dispatch_manifest"],B05:["freight_chalk"],B06:["seal_scrap"],
    B09:["victim_register"],B10:["inspection_copy"],B12:["clerk_witness"],
    B13:["guard_payment"],C02:["private_siding_map"],C03:["points_log"],
    C04:["mabel_confession"],C05:["arrival_manifest"],C07:["bridge_witness"],
    C08:["brackett_wire"],D03:["pressure_log","ada_statement"],
    E08:["brackett_boots"]
  };
  const ACTIONS = {
    "D02:D10": ["withdrawAda"],
    "HE02:D10": ["withdrawAda"],
    "D03:D10": ["continue","hideAda"],
    "HJ02:D06": ["continue","extractTommy"],
    "HF01:B04": ["continue","copyManifest"],
    "HF03:D10": ["continue","copyInspection"],
    "HE03:E03": ["continue","verifyForPublication"],
    "HV02:D10": ["continue","verifyTommyGuarantee"],
    "HS03:E05": ["continue","safeAccess"],
    "D07:D08": ["continue","offerProtectedTestimony"],
    "D05:D06": ["continue","extractTommy"],
    "D09:D10": ["continue","protectMercer","betrayAda"],
    "E02:E03": ["continue","verifyForPublication"],
    "E04:E05": ["continue","safeAccess"],
    "E05:E08": ["continue","clearWorkers"],
    "E07:E08": ["continue","verifyGuarantee"],
    "E08:E09": ["continue","copyAccounts","handoverMurderEvidence"],
    "E08:HJ03": ["continue","copyAccounts","handoverMurderEvidence"],
    "E09:E10": ["continue","trustedIntermediary"],
    "E11:F01": ["continue","prepareEvacuation"],
    "F06:F07": ["acknowledgeDanger"],
    "F07:Z07": ["acceptFatalRisk"]
  };
  const ACTION_TITLES = {
    continue:"Продолжить",hideAda:"Найти Аде безопасное убежище",
    withdrawAda:"Отступить без показаний Ады и продолжить поиски",
    copyManifest:"Сделать заверенную копию грузовой ведомости",
    copyInspection:"Скопировать акт и записать его происхождение",
    verifyTommyGuarantee:"Получить письменное освобождение Томми",
    offerProtectedTestimony:"Обеспечить Мерсеру условия для показаний",
    extractTommy:"Вывести Томми из-под охраны",
    protectMercer:"Защитить Мерсера",betrayAda:"Передать адрес Ады",
    verifyForPublication:"Сверить независимые доказательства",
    safeAccess:"Найти безопасный доступ к стрелке",
    clearWorkers:"Вывести всех рабочих с пути",
    verifyGuarantee:"Проверить условия гарантии Вейла",
    copyAccounts:"Снять копию счетов Брэкетта",
    handoverMurderEvidence:"Подготовить доказательства против Брэкетта",
    trustedIntermediary:"Договориться с независимым посредником",
    prepareEvacuation:"Подготовить путь вывода свидетелей",
    acknowledgeDanger:"Войти в опасный проход",
    acceptFatalRisk:"Не отступать, несмотря на смертельную опасность"
  };

  function ensure(condition, message) { if (!condition) throw new Error(message); }
  const copy = obj => JSON.parse(JSON.stringify(obj));
  function validSet(values, supported) {
    return Array.isArray(values) && values.every(x => supported.includes(x))
       && values.length === new Set(values).size;
  }
  function stableJSON(value) { return JSON.stringify(value); }
  function safeCount(s) {
    return Object.values(s.witnesses).filter(x => x==="protected"||x==="evacuated").length;
  }
  function factsFor(contract, evidence) {
    const ids = new Set(evidence);
    return Object.fromEntries(Object.entries(contract.deductionRules).map(([name,groups]) =>
      [name,groups.some(pair => pair.every(item => ids.has(item)))]));
  }
  function endingAllowed(s, ending, contract) {
    if (!ending) return false;
    if (s.health <= 0 && ending.id !== "trainDeath") return false;
    if (ending.id !== "trainDeath" && !s.flags.chapterAtLeastV) return false;
    const facts = factsFor(contract, s.evidence);
    return ending.requiresFacts.every(id=>facts[id]===true) &&
      ending.requiresFlags.every(id=>s.flags[id]===true) &&
      safeCount(s)>=ending.minSafe &&
      (ending.requiresHealthLte===undefined || s.health<=ending.requiresHealthLte);
  }
  function addUnique(target, value) {
    if (!target.includes(value)) target.push(value);
  }
  function storageRead(store, key, fallback) {
    const raw=store.getItem(key);
    if(raw===null)return fallback;
    try { return JSON.parse(raw); }
    catch (_) { throw new Error("Draft archive is damaged; refusing to overwrite existing records"); }
  }
  function assertState(s, graph, contract, hero, nodes) {
    ensure(s && typeof s==="object" && !Array.isArray(s),"Invalid saved state");
    ensure(s.version===VERSION && s.caseId==="002" && s.hero===hero,"Unsupported save format");
    ensure(typeof s.attemptId==="string" && s.attemptId.length>0 && s.attemptId.length<160,"Invalid attempt");
    ensure(nodes.has(s.node),"Unknown saved scene");
    ensure(validSet(s.evidence, contract.supportedEvidence),"Invalid evidence IDs");
    ensure(validSet(s.routes, ["rail","canal","factory"]),"Invalid route list");
    ensure(validSet(s.visited, [...nodes.keys()]),"Invalid visited list");
    ensure(typeof s.flags==="object" && s.flags!==null && !Array.isArray(s.flags),"Invalid flags");
    ensure(["ada","tommy","mercer"].every(id=>contract.witnessStates.includes(s.witnesses?.[id])),"Invalid witnesses");
    ensure(Object.keys(s.witnesses).length===3,"Unexpected witness ID");
    ensure(Number.isFinite(s.health) && s.health>=0 && s.health<=100,"Invalid health");
    ensure(typeof s.finished==="boolean","Invalid finished flag");
    ensure(s.ending===null || contract.endings.some(x=>x.id===s.ending),"Unknown ending");
    ensure(!s.finished || s.ending===END_NODES[s.node],"Contradictory ending");
    ensure(s.finished || s.ending===null,"Ending without completion");
    ensure(!s.prior || !(s.prior.heroId===hero && s.prior.ending==="endingDeath"),
      "Dead hero cannot continue same canon");
    ensure(Array.isArray(s.history) && s.history.length<=2000,"Invalid history");
    ensure(s.visited.includes(s.node),"Current scene not visited");
    return s;
  }

  function createEngine(config) {
    ensure(config && config.graph && config.contract,"Graph and contract required");
    const graph=config.graph,contract=config.contract;
    ensure(graph.caseId==="002" && contract.caseId==="002","Mismatched case data");
    ensure(graph.nodes.length>=80 && contract.endings.length===7,"Incomplete content package");
    const nodes=new Map(graph.nodes.map(n=>[n.id,n]));
    ensure(nodes.size===graph.nodes.length && nodes.has("P01"),"Invalid scene graph");
    const hero=config.hero||"jack";
    ensure(contract.heroes.includes(hero),"Unknown hero");
    const store=config.store||null;
    const key=SAVE_PREFIX+hero;
    const now=typeof config.now==="function"?config.now:()=>Date.now();
    const attemptId=config.attemptId||("attempt-"+now()+"-"+Math.random().toString(36).slice(2,10));
    const prior=config.prior||null;
    if(prior) {
      ensure(typeof prior==="object" && typeof prior.heroId==="string","Invalid prior record");
      ensure(!(prior.heroId===hero && prior.ending==="endingDeath"),"Dead hero cannot continue same canon");
    }
    function fresh(){
      return {version:VERSION,caseId:"002",hero,attemptId,node:"P01",
        startedAt:now(),prior:prior?copy(prior):null,health:100,
        evidence:[],routes:[],visited:["P01"],flags:{},
        witnesses:{ada:"missing",tommy:"detained",mercer:"located"},
        history:[],finished:false,ending:null,completedAt:null};
    }
    let state = fresh();
    function snapshot() { return copy(state); }
    function persist(candidate){
      assertState(candidate,graph,contract,hero,nodes);
      if(store) store.setItem(key,stableJSON(candidate)); // commit before mutating memory
      state=candidate;
      if(state.finished && store) flushCompletion();
      return snapshot();
    }
    function flushCompletion(){
      if(!store || !state.finished)return false;
      const entry={caseId:"002",heroId:hero,attemptId:state.attemptId,started:state.startedAt,
        finished:state.completedAt,ending:state.ending,prior:copy(state.prior),
        witnesses:copy(state.witnesses),evidence:[...state.evidence],
        flags:copy(state.flags)};
      const records=storageRead(store,RECORD_KEY,[]);
      ensure(Array.isArray(records),"Draft record archive corrupted");
      if(!records.some(r=>r.attemptId===entry.attemptId)){
        store.setItem(RECORD_KEY,stableJSON([...records,entry]));
      }
      const rewards=storageRead(store,REWARD_KEY,[]);
      ensure(Array.isArray(rewards),"Draft reward archive corrupted");
      const award="002:"+hero+":"+state.ending;
      if(!rewards.includes(award))store.setItem(REWARD_KEY,stableJSON([...rewards,award]));
      return true;
    }
    function load(){
      if(!store)return snapshot();
      const raw=store.getItem(key);
      if(raw===null)return snapshot();
      const candidate=JSON.parse(raw);
      assertState(candidate,graph,contract,hero,nodes);
      state=copy(candidate);
      if(state.finished)flushCompletion(); // recover an interrupted completion write
      return snapshot();
    }
    function reset(newAttemptId){
      ensure(typeof newAttemptId==="string" && newAttemptId.length>0,"New attemptId required");
      const next=fresh();next.attemptId=newAttemptId;
      return persist(next);
    }
    function applyArrival(s,to) {
      const firstVisit=!s.visited.includes(to);
      s.node=to;
      addUnique(s.visited,to);
      if(firstVisit){
        for(const id of EVIDENCE_BY_NODE[to]||[]){
          if(to!=="C04"||s.evidence.includes("dispatch_manifest"))addUnique(s.evidence,id);
        }
      }
      if(to==="D08" && s.flags.mercerWilling)addUnique(s.evidence,"mercer_signed_statement");
      if(ROUTES[to])addUnique(s.routes,ROUTES[to]);
      if(to==="D02"&&s.witnesses.ada==="missing")s.witnesses.ada="located";
      if(to==="E01")s.flags.chapterAtLeastV=true;
      if(to==="E06")s.flags.valeContact=true;
      if(to==="HJ01"){s.flags.jackGuardConfronted=true;s.flags.mabelTrustWary=true;}
      if(to==="HJ03")s.flags.jackHeldFire=true;
      if(to==="HF02")s.flags.finnPostCopied=true;
      if(to==="HE01")s.flags.eleanorPhotoLogged=true;
      if(to==="HE02")s.flags.adaTrust=true;
      if(to==="HV01")s.flags.valeDebt=true;
      if(to==="HS01")s.flags.samuelCouplingTraced=true;
      if(to==="HS02")s.flags.samuelMappedSiding=true;
      if(to in END_NODES){
        s.finished=true;s.ending=END_NODES[to];s.completedAt=now();
        if(to==="Z02" && s.flags.evacuationRoutePrepared){
          for(const id of contract.witnessIds)
            if(s.witnesses[id]==="protected")s.witnesses[id]="evacuated";
        }
      }
    }
    function transitionCandidate(to,action) {
      ensure(!state.finished,"This case is already finished");
      const from=state.node;
      const node=nodes.get(from),dst=nodes.get(to);
      ensure(dst && node.next.includes(to),"Scene transition not found");
      ensure(!dst.hero || dst.hero===hero,"This scene belongs to another hero");
      const permitted=ACTIONS[from+":"+to]||["continue"];
      ensure(permitted.includes(action),"Invalid action for this transition");
      const s=snapshot();
      // No re-entering a completed investigation route to farm the same scene.
      if(from==="B01" && RAIL_ENTRANCES[to])
        ensure(!s.routes.includes(RAIL_ENTRANCES[to]),
          "This investigation route was completed; consult collected evidence instead");
      if(to==="B11")ensure(s.routes.length>=2,"Inspect at least two independent routes");
      // Irreversible witness consequences: a finished interview cannot be replayed.
      const witnessResolved=resolvedWitnessBranches(s);
      if(from==="D01" && WITNESS_ENTRANCES[to])
        ensure(!witnessResolved.has(WITNESS_ENTRANCES[to]),
          "This witness storyline is closed; its consequences cannot be undone");
      if(from==="D10" && to==="D01")
        ensure(witnessResolved.size<3,"All witness storylines are closed; proceed to the next chapter");
      if(to==="D03" && (from==="D02" || from==="HE02")){
        ensure(s.witnesses.ada==="located",
          "Ada is no longer available at the hideout");
        const proofs=factsFor(contract,s.evidence);
        ensure(proofs.provedWagonDiversion || s.evidence.includes("inspection_copy") ||
          s.evidence.includes("victim_register"),"Ada needs a credible independent clue");
      }
      if(to==="D11")ensure(["D03","D06","D09","HF03","HV02"].some(x=>s.visited.includes(x)),
        "Investigate at least one witness");
      if(action==="betrayAda")
        ensure(s.witnesses.ada==="located" || s.witnesses.ada==="protected",
          "You cannot disclose a hideout you have not found");
      if(action==="hideAda")ensure(s.witnesses.ada==="located",
        "Ada cannot be hidden again after the hideout was compromised");
      if(action==="verifyTommyGuarantee")ensure(s.witnesses.tommy==="detained",
        "Tommy is no longer detained; this guarantee cannot be used twice");
      if(action==="protectMercer")ensure(s.flags.mercerWilling && s.witnesses.mercer==="located",
        "Mercer has not agreed to protected testimony");
      if(action==="verifyForPublication"){
        const f=factsFor(contract,s.evidence);
        ensure(f.provedFactoryCoverup && f.provedWagonDiversion,
          "Two independent proof chains required");
      }
      if(action==="safeAccess")ensure(s.evidence.includes("private_siding_map"),
        "The siding plan is missing");
      if(action==="clearWorkers")ensure(s.flags.safeSidingAccess,
        "Workers cannot be cleared from an unsafe siding");
      if(action==="verifyGuarantee")
        ensure(factsFor(contract,s.evidence).provedFactoryCoverup && safeCount(s)>=1,
          "Need verified cover-up and at least one protected witness");
      if(action==="handoverMurderEvidence")
        ensure(factsFor(contract,s.evidence).provedHaleMurder,
          "Insufficient proof to hand over Brackett");
      if(action==="trustedIntermediary")ensure(s.evidence.includes("brackett_accounts"),
        "Need a documented leverage route");
      if(action==="prepareEvacuation")ensure(safeCount(s)>0,"No protected witness to evacuate");
      if(action==="acknowledgeDanger")s.flags.dangerWasExplained=true;
      if(action==="acceptFatalRisk"){
        ensure(s.flags.dangerWasExplained,"Fatal danger wasn't acknowledged");
        s.flags.fatalChoiceAcknowledged=true;s.health=0;
      }
      if(action==="copyManifest"){addUnique(s.evidence,"dispatch_manifest");s.flags.finnManifestCopy=true;}
      if(action==="copyInspection"){addUnique(s.evidence,"inspection_copy");s.flags.finnInspectionCopy=true;}
      if(action==="verifyTommyGuarantee"){
        s.flags.victorGuaranteedTommy=true;
        s.witnesses.tommy="protected";
      }
      if(action==="hideAda")s.witnesses.ada="protected";
      if(action==="offerProtectedTestimony")s.flags.mercerWilling=true;
      if(action==="extractTommy")s.flags.tommyExtraction=true;
      if(to==="D06"&&s.flags.tommyExtraction&&s.witnesses.tommy==="detained")
        s.witnesses.tommy="protected";
      if(action==="protectMercer")s.witnesses.mercer="protected";
      if(action==="betrayAda"){
        if(s.witnesses.ada==="protected")s.witnesses.ada="detained";
        s.flags.mercerBetrayed=true;
      }
      if(action==="verifyForPublication")s.flags.publicContactSecured=true;
      if(action==="safeAccess")s.flags.safeSidingAccess=true;
      if(action==="clearWorkers")s.flags.workersCleared=true;
      if(from==="E06" && to==="E07")s.flags.valeContact=true;
      if(action==="verifyGuarantee")s.flags.valeGuarantee=true;
      if(action==="copyAccounts"){
        addUnique(s.evidence,"brackett_accounts");s.flags.brackettAccountsHeld=true;
      }
      if(action==="handoverMurderEvidence")s.flags.brackettCanBeHandedOver=true;
      if(action==="trustedIntermediary")s.flags.localIntermediary=true;
      if(action==="prepareEvacuation"){
        addUnique(s.evidence,"evacuation_route");s.flags.evacuationRoutePrepared=true;
      }
      applyArrival(s,to);
      if(to in END_NODES){
        const ending=contract.endings.find(x=>x.id===END_NODES[to]);
        ensure(endingAllowed(s,ending,contract),"Ending requirements not met");
        if(to==="Z07")ensure(s.flags.dangerWasExplained,"Unexpected fatal ending");
      }
      s.history.push({from,to,action});
      ensure(s.history.length<=2000,"Attempt requires an explicit new run");
      assertState(s,graph,contract,hero,nodes);
      return s;
    }
    function choose(to,action="continue"){
      return persist(transitionCandidate(to,action));
    }
    function availableChoices(){
      const node=nodes.get(state.node);
      if(state.finished)return [];
      const out=[];
      for(const to of node.next){
        const dst=nodes.get(to);
        if(dst.hero&&dst.hero!==hero)continue;
        const variants=ACTIONS[state.node+":"+to]||["continue"];
        for(const action of variants){
          let enabled=true,reason="";
          try{transitionCandidate(to,action);}
          catch(err){enabled=false;reason=err.message;}
          out.push({to,action,title:dst.title,
            actionTitle:ACTION_TITLES[action]||action,
            enabled,reason,confirm:action==="acceptFatalRisk"});
        }
      }
      return out;
    }
    function view(){
      const node=nodes.get(state.node);
      const facts=factsFor(contract,state.evidence);
      return {scene:copy(node),state:snapshot(),facts,
        safeWitnessCount:safeCount(state),choices:availableChoices(),
        endingCatalog:contract.endings.map(x=>({id:x.id,title:x.title,
           unlocked:state.finished?state.ending===x.id:endingAllowed(state,x,contract)}))};
    }
    return {view,snapshot,choose,load,reset,flushCompletion,
      facts:()=>factsFor(contract,state.evidence),
      resolvedWitnessBranches:()=>[...resolvedWitnessBranches(state)],availableChoices,
      storageKey:key,recordKey:RECORD_KEY,rewardKey:REWARD_KEY};
  }

  return {createEngine,VERSION,SAVE_PREFIX,RECORD_KEY,REWARD_KEY,
    END_NODES,EVIDENCE_BY_NODE,ACTIONS,factsFor,endingAllowed};
});
