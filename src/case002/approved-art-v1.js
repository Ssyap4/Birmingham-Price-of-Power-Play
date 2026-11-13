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
   sceneId:"P02",variantKey:"default",review:"approved",
   file:"case002-p02-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"0d490d87cc7a48ddb7094443515e613b001fe0c06c3b693617b3f64fa8ed9cb8",
   mobileFile:"case002-p02-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"fa9399ff7bcbe07635042f2b1b4458adc2d5d84031422d5a8f2e0d0a198e3774"
  }),
  Object.freeze({
   sceneId:"A02",variantKey:"default",review:"approved",
   file:"case002-a02-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"681f5553aff23502d9d6882573f6450c7f4247943ec378596e8bc88aa31910cd",
   mobileFile:"case002-a02-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"396ced336efec4faf8a5d9131a58edbe2ce8ec2ffe0f3bab9eb5d0e3c552249d"
  }),
  Object.freeze({
   sceneId:"A10",variantKey:"default",review:"approved",
   file:"case002-a10-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"e36da533ee45e26d59aee636cab29c89b7be3779ccf4e0d555928b68c8a1f181",
   mobileFile:"case002-a10-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"71f4be91f544d5d2263203f8fd0b9f03b21e1d907bea6c7c29f55eb6c72307c6"
  }),
  Object.freeze({
   sceneId:"B03",variantKey:"default",review:"approved",
   file:"case002-b03-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"fd54e0972f7e326373338e936981fa19cc87558c0c1070d61359785150a4a363",
   mobileFile:"case002-b03-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"505e41792bc77ce761ea184efac9847adf89e9bdf6dc096c40624727d2d12074"
  }),
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
  }),
  Object.freeze({
   sceneId:"A03",variantKey:"default",review:"approved",
   file:"case002-a03-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"5b711552b70cc7a1dfe97492e241e636c2161375b5998b8c8759e9c67994697e",
   mobileFile:"case002-a03-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"44e2b910e2889fc6e0f6b981d6917c1753bd9690e96bb350dd0ee78935c1fe49"
  }),
  Object.freeze({
   sceneId:"A05",variantKey:"default",review:"approved",
   file:"case002-a05-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"d835b86a92a7e3197cac7c9b35a8a28c6706339095a829314819990e6b73b301",
   mobileFile:"case002-a05-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"6c27d14f0764caec4c48f3113d60e8ad602b75861c11a22ecde5cbf3ac711e80"
  }),
  Object.freeze({
   sceneId:"A06",variantKey:"default",review:"approved",
   file:"case002-a06-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"c8fc586bddc6479dc5fd473cd67d0848e2599c5f4391174a74fc32bae7c5d9e1",
   mobileFile:"case002-a06-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"39ccfd3ef6652bb3c101033ba9d599f82fb681dd3a744c6e71954bad6ecbd686"
  }),
  Object.freeze({
   sceneId:"A07",variantKey:"default",review:"approved",
   file:"case002-a07-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"e44e7a879c4cf7e5c4a8a08fbd43904a497d2f367bab604a725237d503699f4e",
   mobileFile:"case002-a07-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"142ec94de2cba10cfb133bfc0c646bb8a4ed860da7a8058d0380ee94b276ee1c"
  }),
  Object.freeze({
   sceneId:"A08",variantKey:"default",review:"approved",
   file:"case002-a08-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"f8620d5d630aaf8c193ddabf51a5a46f7fb9d088864ca70c75d180f5a3682431",
   mobileFile:"case002-a08-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"aaea067fd038a26ee5d1f26171d2847a27fc1f15e04221305b9d0b9a9e37fa08"
  }),
  Object.freeze({
   sceneId:"A09",variantKey:"default",review:"approved",
   file:"case002-a09-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"0d9eb292c8dab14292946f16ffee84737cae2e9cae7fa47c41a968a1c0a0e2aa",
   mobileFile:"case002-a09-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"66d7f735b1a405171fa806c8fa55d33fd905cba4f408ba68d109ef6f93c46e67"
  }),
  Object.freeze({
   sceneId:"B01",variantKey:"default",review:"approved",
   file:"case002-b01-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"3216aac661649cac2365b2cde9eccbd99aea86477966a96c01dfa5ca6ad585ed",
   mobileFile:"case002-b01-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"c2d776c49497f634c88878ffcc24362073c6e76156cac0f157cc090f2842d3ec"
  }),
  Object.freeze({
   sceneId:"B02",variantKey:"default",review:"approved",
   file:"case002-b02-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"d1cdba90fec790c5eb7a9ac41b846b7f3884061e752f33d341b93a42547e90a4",
   mobileFile:"case002-b02-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"e0dd49c50f846eaf41915dd57b94cb0e8bc3b4868d118cd957c144fe97db49d7"
  }),
  Object.freeze({
   sceneId:"B04",variantKey:"default",review:"approved",
   file:"case002-b04-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"bd202b8a0934b6245ec6692e0ea8a57ed2e7534992afef774cb0ca6e19e10e93",
   mobileFile:"case002-b04-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"3d386a581cd00f7c2d303ebb0ecf039971e251adeccf0877750e2582a8b63f97"
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
