/* Case 002: earned-only presentation of the actual terminal scene.
 * No storage calls, no reward promises, no mutations, no unseen contacts.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002EndingRecap=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const witnesses=new Set(["ada","tommy","mercer"]);
function build(view,contract,discovered=[]){
 if(!view||!view.state||!view.state.finished)return null;
 const s=view.state;
 if(!contract||!Array.isArray(contract.endings)||!view.scene||
    !/^Z0[1-7]$/.test(view.scene.id))
   throw Error("A verified terminal scene and contract are required");
 const ending=contract.endings.find(x=>x.id===s.ending);
 if(!ending)throw Error("Unknown Case 002 ending");
 if(!Array.isArray(discovered))throw Error("Only encountered characters may be shown");
 const people=discovered.filter(x=>x&&witnesses.has(x.id))
   .map(x=>({id:x.id,name:x.name,status:s.witnesses[x.id]}))
   .filter(x=>typeof x.name==="string"&&typeof x.status==="string");
 // The report presents only conclusions actually proven in this finished
 // attempt. Raw fact IDs are labels for the UI, not new reward/save keys.
 const proofIds=Object.keys(view.facts||{}).filter(id=>view.facts[id]===true);
 return {
   hero:s.hero,sceneId:view.scene.id,endingId:s.ending,title:ending.title,
   evidenceCount:s.evidence.length,
   proofCount:proofIds.length,proofIds,
   safeCount:view.safeWitnessCount,
   decisionCount:s.history.length,
   people
 };
}
return {build};
});
