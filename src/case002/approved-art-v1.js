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
   sceneId:"D01",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d01-scene.webp",cast:[],
   mobileFile:"case002-d01-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"dd5a2469746898d6564f02a862944ebb81347c81b5937e0c867bc3ae9bc97206"
  }),
  Object.freeze({
   sceneId:"D02",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d02-scene.webp",cast:["ada"],
   applicableVariants:Object.freeze(["ada-located","ada-protected"]),
   mobileFile:"case002-d02-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"1f6378d43e65772f29abd841ec3bf840a3b0478d9b106259e460abee7ffeaa32"
  }),
  Object.freeze({
   sceneId:"D03",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d03-scene.webp",cast:["ada"],
   applicableVariants:Object.freeze(["ada-located","ada-protected"]),
   mobileFile:"case002-d03-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"5a59485966557a647b0642375430b73d19db1e31b11e5b7d82cbbc8445337c5b"
  }),
  Object.freeze({
   sceneId:"D04",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d04-scene.webp",cast:["tommy"],
   mobileFile:"case002-d04-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"8cfa3ab645487888da098e9af627ba29887d5134e36a893ea32f1433b76ca6ed"
  }),
  Object.freeze({
   sceneId:"D05",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d05-scene.webp",cast:[],
   mobileFile:"case002-d05-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"a0d32d35b64ab1124eef109aaa04c24a57903c1c0bac5e05348788195db236fb"
  }),
  Object.freeze({
   sceneId:"D06",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d06-scene.webp",cast:["mabel"],
   applicableVariants:Object.freeze(["tommy-detained","tommy-protected","tommy-evacuated","tommy-unknown"]),
   mobileFile:"case002-d06-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"1449e53d7e9dcfb862c8b9bf46e298fa5132c31691c5fb074d0f55d16cfc0ec8"
  }),
  Object.freeze({
   sceneId:"D07",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d07-scene.webp",cast:["mercer"],
   mobileFile:"case002-d07-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"b58ecdba1310d800609bdb41512d9e1466cf7caf4cbb75926ba639a8067a645e"
  }),
  Object.freeze({
   sceneId:"D08",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d08-scene.webp",cast:["mercer"],
   mobileFile:"case002-d08-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"a1cd6f58fb7c29e6975ed8a2e0136f98c751476e0547ec37443c8c72ffaa1f9d"
  }),
  Object.freeze({
   sceneId:"D09",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d09-scene.webp",cast:["mercer"],
   applicableVariants:Object.freeze(["ada-unknown","ada-known","ada-captured"]),
   mobileFile:"case002-d09-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"605381467e9c899c397415d15fe478a9d4aa6426c716312e883393fe8a424a72"
  }),
  Object.freeze({
   sceneId:"D10",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d10-scene.webp",cast:[],
   mobileFile:"case002-d10-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"8bbc19a1736a2bf0b1d549466f439c2dc1ead0d93ff8304f314cae7441c64c43"
  }),
  Object.freeze({
   sceneId:"D11",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-d11-scene.webp",cast:["mabel"],
   mobileFile:"case002-d11-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"571a0a32083063747945ee8f95780459486f34643e445a401c2e2ce70be9b415"
  }),
  Object.freeze({
   sceneId:"HJ02",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-hj02-scene.webp",cast:["tommy"],
   mobileFile:"case002-hj02-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"ef5d10ff4a2571a4b3b655817260bd0590760cd6ab95c93dfc638509585a523a"
  }),
  Object.freeze({
   sceneId:"HF03",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-hf03-scene.webp",cast:[],
   mobileFile:"case002-hf03-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"96ed4db0f1c5d4d7bbcdf8bcfb080c499bb9b5c37ac3440bd3c58cdd9fb57419"
  }),
  Object.freeze({
   sceneId:"HE02",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-he02-scene.webp",cast:["ada"],
   applicableVariants:Object.freeze(["ada-located","ada-protected"]),
   mobileFile:"case002-he02-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"439dc7f0234a9984d9ceb49b33c8594f1cd7a80e11a80ddccda4998467038001"
  }),
  Object.freeze({
   sceneId:"HV02",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-hv02-scene.webp",cast:["mabel"],
   mobileFile:"case002-hv02-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"9e900f043f09706ef837914a2fe7ea01cadb596ce88ebfa29e06b40c599fbaa3"
  }),
  Object.freeze({
   sceneId:"C06",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-c06-scene.webp",cast:[],
   mobileFile:"case002-c06-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"3d839286c4b5b24876c0b8931229f5f1b4421cd85c9868fd3eb9c343ff686b63"
  }),
  Object.freeze({
   sceneId:"C07",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-c07-scene.webp",cast:["signalman"],
   mobileFile:"case002-c07-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"9268e78a5b78340f55cc77f912341e14f21dc4003be6f316b306980a33cb2f50"
  }),
  Object.freeze({
   sceneId:"C08",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-c08-scene.webp",cast:[],
   mobileFile:"case002-c08-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"f322dfbc9eac008acfbb94997c88a7bf1f74ef4c57e6d0aeec78aaede0806b98"
  }),
  Object.freeze({
   sceneId:"C09",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-c09-scene.webp",cast:[],
   mobileFile:"case002-c09-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"6d43714b19d674780b528f84495e1de56e05aa45817ea3eff38a4a0c4e5dbbf8"
  }),
  Object.freeze({
   sceneId:"C10",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-c10-scene.webp",cast:[],
   mobileFile:"case002-c10-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"e165a0657abeafa836f1d0025ad793fcb62a8e349e2053dd560144a3d21af707"
  }),
  Object.freeze({
   sceneId:"C01",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-c01-scene.webp",cast:[],
   mobileFile:"case002-c01-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"1133a4c5ce3a66620c143648513d1cc28b9ced14459b05567ddfc1c8fc399137"
  }),
  Object.freeze({
   sceneId:"C02",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-c02-scene.webp",cast:[],
   mobileFile:"case002-c02-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"4d56c26a865fb3507ccd29cf8f3a4d094d24ebc2cc918510c4e9b0ca7d9946a4"
  }),
  Object.freeze({
   sceneId:"C03",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-c03-scene.webp",cast:[],
   mobileFile:"case002-c03-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"8c71f8242e10b1b5f8f4dfe2951479b99e4155edb8d10e4682b37e69d4c67569"
  }),
  Object.freeze({
   sceneId:"C04",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-c04-scene.webp",cast:["mabel"],
   mobileFile:"case002-c04-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"445d00cfc81736104d2d3f190cee87879d318d5d3ae5787c4c09fa0e0eb8e9b6"
  }),
  Object.freeze({
   sceneId:"C05",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-c05-scene.webp",cast:[],
   mobileFile:"case002-c05-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"fe05ef08354ae2133b550972d05b6c4dbdac702b4e5cd77ecf7e6f6e2394d7fb"
  }),
  Object.freeze({
   sceneId:"B11",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-b11-scene.webp",cast:[],
   mobileFile:"case002-b11-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"a5e092001fb258ed007777563656f16dba6a3cd002ba6e0bfbc1e48ff3c3a68b"
  }),
  Object.freeze({
   sceneId:"B12",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-b12-scene.webp",cast:["night-clerk"],
   mobileFile:"case002-b12-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"3e8205a1d72cb6942bd4427b39147d26cb5e35f2143fe3225164710a2d371048"
  }),
  Object.freeze({
   sceneId:"B13",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-b13-scene.webp",cast:[],
   mobileFile:"case002-b13-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"fb12931ae8a0d0389ff3a6204da1d1704aa51a8cc4e6c64bb808ba3ab816819d"
  }),
  Object.freeze({
   sceneId:"B14",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-b14-scene.webp",cast:[],
   mobileFile:"case002-b14-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"306e8aa02cbd895198373aba7477da9ecb037cf7588f2e31cfa57345fda4ab56"
  }),
  Object.freeze({
   sceneId:"B06",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-b06-scene.webp",cast:[],
   mobileFile:"case002-b06-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"944bfc4d81f5a24afb5a43914c35541e9d2ee7f0171ba6b216a8d1ad04ed9f10"
  }),
  Object.freeze({
   sceneId:"B07",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-b07-scene.webp",cast:[],
   mobileFile:"case002-b07-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"e58222ba77c56d93e62c9fa3596ad0748044688335eb3ce3e32d7efb793787f9"
  }),
  Object.freeze({
   sceneId:"B08",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-b08-scene.webp",cast:["gatekeeper"],
   mobileFile:"case002-b08-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"bbbad3d85651f55af3558b502a290c33b0f089e29497d7b15b0cf16a54d77053"
  }),
  Object.freeze({
   sceneId:"B09",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-b09-scene.webp",cast:["worker"],
   mobileFile:"case002-b09-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"9b285069a128e3611b6978309beed15b4b5ce3ef2d69280f137f6cb1a092bc35"
  }),
  Object.freeze({
   sceneId:"B10",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-b10-scene.webp",cast:[],
   mobileFile:"case002-b10-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"47d40555017a053f0e227cc47d329cbc26b1da5987f31bc32c9f795fb104a798"
  }),
  Object.freeze({
   sceneId:"B05",variantKey:"default",review:"approved",
   file:"case002-b05-scene.webp",cast:[],
   width:1200,height:675,
   sha256:"407818603d36d08ef93b3507f689d0e1aee08282a634afca4c179fe05577372a",
   mobileFile:"case002-b05-scene--mobile.webp",
   mobileWidth:720,mobileHeight:900,
   mobileSha256:"43cd41f45047899d5ef367cd8f282cda0a569e7fed6b1ac6d4358e4568316432"
  }),
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
 npcPortraits:Object.freeze([
  Object.freeze({id:"nora",review:"approved",file:"case002-nora-portrait.webp",width:640,height:800,sha256:"8403e29e7d3ad519afa126684cd6c62567628ec76056a9e7de81770600dbf43a"}),
  Object.freeze({id:"hale",review:"approved",file:"case002-hale-portrait.webp",width:640,height:800,sha256:"6eaba7d0b0eb52310ee482d349395ce2bcd5025b66d816f9155b7815ae0ea0da"}),
  Object.freeze({id:"rowan",review:"approved",file:"case002-rowan-portrait.webp",width:640,height:800,sha256:"ffe8774c41be69b5074f30afa017e547288b9c4458c7d654c3bfbb75d21ba44f"}),
  Object.freeze({id:"signalman",review:"approved",file:"case002-signalman-portrait.webp",width:640,height:800,sha256:"946a6d9f6173e5a68be6ee537b37ad49537680e51a535350bd5215fead7e27f8"}),
  Object.freeze({id:"brackett",review:"approved",file:"case002-brackett-portrait.webp",width:640,height:800,sha256:"e7b822fd2930d3d794bb6b33424a3b4607f349909ad119310402a0ce7bebfb98"}),
  Object.freeze({id:"vale",review:"approved",file:"case002-vale-portrait.webp",width:640,height:800,sha256:"e30c59ba1e4ac2f6965d9e82d52dce69cc00cebc0a8fa555873723caead95b0f"}),
  Object.freeze({id:"mercer",review:"approved",file:"case002-mercer-portrait.webp",width:640,height:800,sha256:"5638d2c9a2a04f34f70249a8561cef9f7296fce1517f0f42ad8ce1c0a6f67294"}),
  Object.freeze({id:"mabel",review:"approved",file:"case002-mabel-portrait.webp",width:640,height:800,sha256:"5c100098f856fe0d487de76c3fe11d49e92b208531611c537dccacb18a089ac7"}),
  Object.freeze({id:"tommy",review:"approved",file:"case002-tommy-portrait.webp",width:640,height:800,sha256:"815b46969f4d7a4caac82ac83ee0d880219be47bb1ff2c1aa8e5347529a0f075"}),
  Object.freeze({id:"ada",review:"approved",file:"case002-ada-portrait.webp",width:640,height:800,sha256:"c6d43de26733e10c7489920f850e21e9adab0e47640b0e60288088e15224f63c"})
 ])
});
// Audited Chapter IV portraits used across explicitly safe witness states.
// One physical WebP per shot; no automatic fallback into absent-witness states.
const neutralSceneVariants=Object.freeze({
 D02:Object.freeze(["ada-located","ada-protected"]),
 D03:Object.freeze(["ada-located","ada-protected"]),
 HE02:Object.freeze(["ada-located","ada-protected"]),
 D06:Object.freeze(["tommy-detained","tommy-protected","tommy-evacuated","tommy-unknown"]),
 D09:Object.freeze(["ada-unknown","ada-known","ada-captured"])
});
function permittedVariantReuse(entry,variant){
 const permitted=neutralSceneVariants[entry.sceneId];
 return entry.variantKey==="default"&&Array.isArray(entry.applicableVariants)&&
   Array.isArray(permitted)&&permitted.includes(variant)&&
   entry.applicableVariants.includes(variant);
}
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
   x.review==="approved"&&
   (x.variantKey===stage.variantKey||permittedVariantReuse(x,stage.variantKey)));
 if(entries.length>1)throw Error("Duplicate Case 002 approved scene art");
 if(!entries.length)return null;
 const e=entries[0];
 // Stage names are deterministic from the screenplay, not URLs in user data.
 const stageName="case002-"+stage.sceneId.toLowerCase()+"-scene"+
   (stage.variantKey==="default"?"":"--"+stage.variantKey)+".webp";
 const name="case002-"+e.sceneId.toLowerCase()+"-scene"+
   (e.variantKey==="default"?"":"--"+e.variantKey)+".webp";
 // Existing art retains wide+mobile pairs; later waves can be portrait-only.
 const mobileOnly=e.mobileOnly===true;
 if(e.mobileOnly!==undefined&&!mobileOnly)throw Error("Invalid mobile-only art flag");
 if(stage.desiredAsset!==stageName||e.file!==name||
   !Array.isArray(e.cast)||!e.cast.every(x=>stage.visibleCast.includes(x))||
   (!mobileOnly&&(!Number.isInteger(e.width)||e.width<800||
                 !Number.isInteger(e.height)||e.height<450))||
   (mobileOnly&&(e.mobileFile===undefined||e.width!==undefined||
                 e.height!==undefined||e.sha256!==undefined)))
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
 const src=mobileOnly?mobileSrc:"../../assets/case002/scenes/"+name;
 return {src,mobileSrc,mobileOnly,
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
return {manifest,resolveScene,resolveNpc,permittedVariantReuse};
});
