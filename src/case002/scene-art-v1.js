/* Scene art selection contract for the *future* Case 002 art library.
 * This module NEVER assumes that a rendered asset exists and never fetches one.
 * Shared by browser and Node: decides who/what is allowed to be depicted.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002ArtDirector=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const order=["ada","tommy","mercer"];
const present=s=>s==="protected"||s==="evacuated";
const knownCast=["hero","jack","finn","eleanor","victor","samuel","ada","tommy","mercer"];
const attr=(state,key)=>Boolean(state.flags?.[key]);
const proof=(view,key)=>Boolean(view.facts?.[key]);
function visibleFrom(boardScene,view){
 const s=view.state,scene=boardScene.id;
 let cast=[...boardScene.cast];
 // The cast is a visual brief, not a license to resurrect a witness.
 if(["D02","D03","HE02"].includes(scene)&&s.witnesses.ada==="detained")
    cast=cast.filter(x=>x!=="ada");
 if(scene==="D06"&&s.witnesses.tommy==="detained")
    cast=cast.filter(x=>x!=="tommy");
 if(scene==="Z02"){
    cast=["hero",...order.filter(x=>s.witnesses[x]==="evacuated")];
 }
 if(scene==="Z07")cast=cast.filter(x=>x!=="hero"); // death shown through aftermath, not a live hero
 return cast;
}
function variant(view){
 const s=view.state,n=view.scene.id,w=s.witnesses;
 const flag=k=>attr(s,k),yes=k=>proof(view,k);
 switch(n){
 case "D02":case "D03":case "HE02":
   return w.ada==="detained"?"ada-absent":w.ada==="protected"?"ada-protected":"ada-located";
 case "D06":
   return w.tommy==="detained"?"tommy-detained":w.tommy==="protected"?"tommy-protected":
     w.tommy==="evacuated"?"tommy-evacuated":"tommy-unknown";
 case "D09":return w.ada==="missing"?"ada-unknown":w.ada==="detained"?"ada-captured":"ada-known";
 case "E03":return flag("publicContactSecured")?"verified-not-published":"still-unverified";
 case "E05":return flag("workersCleared")?"cleared":"workers-on-rails";
 case "E07":return flag("valeGuarantee")?"signed":"unsigned";
 case "E08":return "brackett-book-on-desk"; // other consequences belong in text, not fake prop variants
 case "E09":return flag("accountsGivenToWorkers")?"accounts-workers":
       flag("brackettAccountsHeld")?"accounts-hero":"accounts-brackett";
 case "E10":return flag("accountsGivenToWorkers")?"accounts-workers":
       flag("localIntermediary")?"intermediary":"audit";
 case "F02":return yes("provedFirstForgery")&&yes("provedSecondForgery")?"both-proven":"incomplete";
 case "F03":return yes("provedHaleMurder")?"hale-proven":"hale-unproven";
 case "F04":return yes("provedFactoryCoverup")?"factory-proven":"factory-unproven";
 case "F05":return "statuses-in-html"; // no three people pasted in one image
 case "F08":return flag("accountsGivenToWorkers")?"accounts-workers":
       flag("brackettAccountsHeld")?"accounts-hero":"accounts-not-held";
 case "F09":return "available-options-in-html";
 case "Z02":return "evacuated-"+(order.filter(x=>w[x]==="evacuated").join("-")||"none");
 case "Z04":return "guarantee-signed";
 case "Z05":return "empty-safe-siding";
 case "Z06":return "accounts-hero";
 case "Z07":return "after-danger";
 default:return "default";
 }
}
function select(board,view){
 if(!board||!Array.isArray(board.sceneAssets)||!view||!view.scene||!view.state)
   throw new Error("Case002 storyboard and story view are required");
 if(board.status!=="STORYBOARD_ONLY_NO_IMAGES_YET")
   throw new Error("Unexpected art manifest format");
 const scene=board.sceneAssets.find(x=>x.id===view.scene.id);
 if(!scene)throw new Error("No storyboard for scene "+view.scene.id);
 const key=variant(view);
 const visibleCast=visibleFrom(scene,view);
 for(const actor of visibleCast)if(typeof actor!=="string")throw Error("Invalid cast data");
 // This is a desired path ONLY. No asset is present until a future build manifest
 // registers a verified, actual file. A path alone must not be rendered.
 const stem=scene.asset.replace(/\.webp$/,"");
 return {
  sceneId:scene.id,location:scene.location,variantKey:key,visibleCast,
  desiredAsset:stem+(key==="default"?"":"--"+key)+".webp",
  scriptedShot:scene.shot,
  requiresDynamicOverlay:["F05","F09","D10"].includes(scene.id),
  assetVerified:false
 };
}
return {select,variant,visibleFrom};
});
