#!/usr/bin/env node
"use strict";
/* Learning loop for art production. Does not invoke or retrain an image model. */
const fs=require("node:fs"),path=require("node:path");
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,"../../docs/case002/art-generator-feedback-v1.json"),"utf8"));
function nextAction(category,sameContextFailures=1){
 const rule=catalog.failureTypes[category];
 if(!rule)throw Error("Unknown failure category: "+category);
 if(!Number.isInteger(sameContextFailures)||sameContextFailures<1)throw Error("Invalid failure count");
 const reset=sameContextFailures>=catalog.policy.maxFailuresPerContext;
 return {category,correction:rule.correction,
  contextResetRequired:reset,approach:reset?"isolated-render-only":"revise-physical-framing-once",
  autoApproved:false,modelRetrained:false};
}
function reviewGate({sceneId,markers={},humanReviewed=false}={}){
 if(!/^[A-Z]\d{2}$/.test(sceneId||""))throw Error("Scene ID required");
 const required=["correctNarrativeMoment","requiredMarkersVisible","singleContinuousImage",
  "canonIdentityCompatible","noFabricatedFacts","notNearDuplicate"];
 const missing=required.filter(x=>markers[x]!==true);
 return {sceneId,missing,
  candidateEligible:missing.length===0&&humanReviewed===true,
  autoInstalled:false,
  reason:missing.length?"Missing reviews: "+missing.join(", "):
   humanReviewed?"Candidate eligible; install separately only after wave QA":"Human artistic review required"};
}
if(require.main===module)try{
 const a=process.argv.slice(2);
 if(a.length!==4||a[0]!=="--failure"||a[2]!=="--same-context-attempts")
  throw Error("Usage: --failure TYPE --same-context-attempts INTEGER");
 console.log(JSON.stringify(nextAction(a[1],Number(a[3])),null,2));
}catch(e){console.error(e.message);process.exit(2)}
module.exports={catalog,nextAction,reviewGate};
