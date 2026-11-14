#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const {catalog,nextAction,reviewGate}=require("../../tools/case002/art-feedback-v1.js");
assert.equal(catalog.schemaVersion,1);
assert.equal(Object.keys(catalog.failureTypes).length,6);
for(const name of Object.keys(catalog.failureTypes)){
 const second=nextAction(name,2);
 assert.equal(second.contextResetRequired,true);
 assert.equal(second.approach,"isolated-render-only");
 assert.equal(second.autoApproved,false);
 assert.equal(second.modelRetrained,false);
 assert.equal(nextAction(name,1).contextResetRequired,false);
}
assert.throws(()=>nextAction("unknown_category",1));
assert.throws(()=>nextAction("wrong_scene",0));
const markers={correctNarrativeMoment:true,requiredMarkersVisible:true,singleContinuousImage:true,
 canonIdentityCompatible:true,noFabricatedFacts:true,notNearDuplicate:true};
assert.equal(reviewGate({sceneId:"C09",markers}).candidateEligible,false);
assert.equal(reviewGate({sceneId:"C09",markers:{...markers,requiredMarkersVisible:false},humanReviewed:true}).candidateEligible,false);
const reviewed=reviewGate({sceneId:"C09",markers,humanReviewed:true});
assert.equal(reviewed.candidateEligible,true);
assert.equal(reviewed.autoInstalled,false);
assert.equal(catalog.observedSuccess.sha256,"6d43714b19d674780b528f84495e1de56e05aa45817ea3eff38a4a0c4e5dbbf8");
assert(catalog.lessons.some(x=>x.scene==="C09"&&x.category==="missing_required_marker"));
console.log("PASS: six art-error categories, context-reset policy and human-only review gate");
