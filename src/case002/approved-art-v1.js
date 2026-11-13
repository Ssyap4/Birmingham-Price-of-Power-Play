/* Case 002 approved-art gate v1.
 * Only an explicitly registered, reviewed asset may be shown.
 * Draft storyboard paths and generation candidates are NEVER approvals.
 * Only existing, visually reviewed WebP files are registered.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002ApprovedArt=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const manifest=Object.freeze({
 schemaVersion:1,
 sceneImages:Object.freeze([
  Object.freeze({
   sceneId:"P01",variantKey:"default",review:"approved",
   file:"case002-p01-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"bc460b5919d603e50e1ea98ad8fec7e30616006ef09347697486960f52ee08f5",
   mobileFile:"case002-p01-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"dd53cf2459852779f8f1552153342c43e977423a7cd99888e7be9838513b27bd"
  }),
  Object.freeze({
   sceneId:"A01",variantKey:"default",review:"approved",
   file:"case002-a01-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"8a3fa26b875d47a43b0b886b65d8b8c9af66be671628796f59e139015456161c",
   mobileFile:"case002-a01-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"7fd9ed6fbfa7e00d370216800626b6c3a583372732bd738f702144ffbc31e4ae"
  }),
  Object.freeze({
   sceneId:"A04",variantKey:"default",review:"approved",
   file:"case002-a04-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"e0176d8c3c2b94cf0491b12ece40360a128851272b960545728a83d63b4f2193",
   mobileFile:"case002-a04-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"5468c285c746bf7942aabdf72cbf454f7361fd327cfb53cb8d5e7d83479c93df"
  })
 ]),
 npcPortraits:Object.freeze([])
});
const safeId=id=>typeof id==="string"&&/^[A-Z]{1,2}\d{2}$/.test(id);
const safeVariant=id=>typeof id==="string"&&/^[a-z][a-z0-9-]*$/.test(id);
const safeNpc=id=>typeof id==="string"&&/^[a-z]+$/.test(id);
function resolveScene(stage,source=manifest){
 if(!stage||!safeId(stage.sceneId)||!safeVariant(stage.variantKey)||
    !Array.isArray(stage.visibleCast)||!stage.desiredAsset||
    typeof stage.desiredAsset!=="string")throw Error("Invalid Case 002 stage");
 if(!source||source.schemaVersion!==1||!Array.isArray(source.sceneImages))
    throw Error("Invalid approved art manifest");
 const entries=source.sceneImages.filter(x=>x.sceneId===stage.sceneId&&
   x.variantKey===stage.variantKey&&x.review==="approved");
 if(entries.length>1)throw Error("Duplicate Case 002 approved scene art");
 if(!entries.length)return null;
 const e=entries[0];
 // Stage names are deterministic from the screenplay, not URLs in user data.
 const name="case002-"+stage.sceneId.toLowerCase()+"-scene"+
   (stage.variantKey==="default"?"":"--"+stage.variantKey)+".webp";
 if(stage.desiredAsset!==name||e.file!==name||
   !Array.isArray(e.cast)||!e.cast.every(x=>stage.visibleCast.includes(x))||
   !Number.isInteger(e.width)||e.width<800||
   !Number.isInteger(e.height)||e.height<450)
   throw Error("Approved art conflicts with actual scene state");
 // Mobile composition is a separately approved WebP, NEVER a guessed URL.
 // Without one the landscape master remains the only allowed source.
 let mobileSrc=null;
 if(e.mobileFile!==undefined){
   const mobileName=name.replace(/\.webp$/,"--mobile.webp");
   if(e.mobileFile!==mobileName||
      !Number.isInteger(e.mobileWidth)||e.mobileWidth<500||
      !Number.isInteger(e.mobileHeight)||e.mobileHeight<700)
      throw Error("Approved mobile crop conflicts with actual scene");
   mobileSrc="../../assets/case002/scenes/"+mobileName;
 }
 return {src:"../../assets/case002/scenes/"+name,
   mobileSrc,
   alt:"Иллюстрация эпизода "+stage.sceneId,
   sceneId:stage.sceneId,variantKey:stage.variantKey};
}
function resolveNpc(person,source=manifest){
 if(!person||!safeNpc(person.id))throw Error("Invalid Case 002 person");
 if(!source||source.schemaVersion!==1||!Array.isArray(source.npcPortraits))
   throw Error("Invalid approved art manifest");
 const entries=source.npcPortraits.filter(x=>x.id===person.id&&x.review==="approved");
 if(entries.length>1)throw Error("Duplicate Case 002 approved NPC portrait");
 if(!entries.length)return null;
 const e=entries[0];
 if(e.file!=="case002-"+person.id+"-portrait.webp"||
   !Number.isInteger(e.width)||e.width<500||
   !Number.isInteger(e.height)||e.height<600)
   throw Error("Approved portrait is not bound to canonical character identity");
 return {src:"../../assets/case002/portraits/"+e.file,
   alt:"Портрет: "+person.name};
}
return {manifest,resolveScene,resolveNpc};
});
