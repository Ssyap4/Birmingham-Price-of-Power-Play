/* Pure, isolated Case003 state machine, Node prototype. */
"use strict";
const {nodes,contract,start}=require("./graph-v1");
const VERSION=1;
const SAVE_PREFIX="birmingham_case003_draft_v1_";
const unique=xs=>[...new Set(xs)];
const includes=(all,needed=[])=>needed.every(x=>all.includes(x));
function endingAllowed(s,id){
 const e=contract.endings.find(x=>x.id===id);
 if(!e||e.alive!==s.alive||!includes(s.claims,e.claims)||!includes(s.flags,e.flags))return false;
 // Evidence can be retained, but exclusive agreements change the permissible final tactics.
 if(id==="Z02"&&s.flags.includes("vossAgreement"))return false;
 if(id==="Z03"&&s.flags.some(x=>["vossAgreement","darnAgreement"].includes(x)))return false;
 return true;
}
function enter(s,to){
 const n=nodes[to]; if(!n||n.virtual)throw Error("Unknown destination");
 return {...s,node:to,visited:unique([...s.visited,to]),evidence:unique([...s.evidence,...n.grants]),ending:n.ending||null};
}
function create(hero){
 if(!contract.heroes.includes(hero))throw Error("Unknown hero");
 return enter({version:VERSION,hero,node:start,visited:[],evidence:[],claims:[],flags:[],alive:true,ending:null,history:[]},start);
}
function available(s){
 if(s.ending)return [];
 return nodes[s.node].actions.filter(a=>
 (!a.hero||a.hero===s.hero)&&(!a.once||!s.visited.includes(a.to))&&
 includes(s.evidence,a.needEvidence)&&includes(s.flags,a.needFlags)&&includes(s.claims,a.needClaims)&&
 !(a.forbidFlags||[]).some(x=>s.flags.includes(x))&&(!a.ending||endingAllowed(s,a.ending)));
}
function step(s,id){
 const a=available(s).find(x=>x.id===id);if(!a)throw Error("Unavailable action "+s.node+":"+id);
 let n={...s,flags:unique([...s.flags,...(a.set||[])]),alive:!a.fatal&&s.alive,history:[...s.history,{type:"step",id}]};
 if(nodes[a.to].ending&&!endingAllowed(n,a.to))throw Error("Ending requirements unmet");
 return enter(n,a.to);
}
function prove(s,id,evidence){
 const c=contract.claims.find(x=>x.id===id);
 if(s.ending||!c||!Array.isArray(evidence)||evidence.some(x=>!s.evidence.includes(x)))throw Error("Invalid deduction");
 const exact=c.alternatives.some(a=>a.length===evidence.length&&unique(evidence).length===a.length&&includes(evidence,a));
 if(!exact)return {state:s,accepted:false};
 if(s.claims.includes(id))return {state:s,accepted:true};
 return {accepted:true,state:{...s,claims:[...s.claims,id],history:[...s.history,{type:"prove",id,evidence:[...evidence]}]}};
}
// Rebuild state from validated actions rather than trusting arbitrary saved flags, claims or endings.
function same(a,b){
 if(a===b)return true;
 if(!a||!b||typeof a!=="object"||typeof b!=="object"||Array.isArray(a)!==Array.isArray(b))return false;
 const keys=Object.keys(a);
 return keys.length===Object.keys(b).length&&keys.every(k=>Object.prototype.hasOwnProperty.call(b,k)&&same(a[k],b[k]));
}
function restore(raw,hero){
 try{
  const v=JSON.parse(raw);
  if(!v||v.version!==VERSION||v.hero!==hero||!Array.isArray(v.history)||v.history.length>250)return null;
  let s=create(hero);
  for(const h of v.history){
   if(h.type==="step")s=step(s,h.id);
   else if(h.type==="prove"){const p=prove(s,h.id,h.evidence);if(!p.accepted||p.state===s)return null;s=p.state;}
   else return null;
  }
  if(!same(s,v))return null;
  return s;
 }catch{return null;}
}
function rewardId(s){return s.ending?["003",s.hero,s.ending].join(":"):null;}
module.exports={VERSION,SAVE_PREFIX,create,available,step,prove,restore,endingAllowed,rewardId};
