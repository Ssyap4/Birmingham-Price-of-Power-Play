#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {dimensions,audit,MAX_BYTES}=require("../../tools/case002/art-audit-v1.js");
const {manifest}=require("../../src/case002/approved-art-v1.js");
const root=path.resolve(__dirname,"../..");
const clone=()=>JSON.parse(JSON.stringify(manifest));
const report=audit();
assert(report.sceneCount>=1,"A real P01 should already be committed");
assert(report.exportedCount>=2,"P01 should have genuine landscape and mobile files");
assert(report.totalBytes>50000);
assert(MAX_BYTES.mobile<MAX_BYTES.desktop);
const first=manifest.sceneImages.find(x=>x.sceneId==="P01");
assert(first&&first.mobileFile,"P01 source image and vertical crop required");
for(const [filename,width,height] of [
 [first.file,first.width,first.height],
 [first.mobileFile,first.mobileWidth,first.mobileHeight]
]){
 const source=fs.readFileSync(path.join(root,"assets/case002/scenes",filename));
 const actual=dimensions(source);
 assert.deepEqual([actual.width,actual.height],[width,height]);
 assert.throws(()=>dimensions(source.subarray(0,source.length-1)),/RIFF length/);
 assert.throws(()=>dimensions(Buffer.alloc(40)),/Not a RIFF WebP/);
}
const failures=(edit,pattern)=>{
 const invalid=clone();edit(invalid);
 assert.throws(()=>audit({source:invalid}),pattern);
};
failures(v=>v.sceneImages[0].sha256="0".repeat(64),/changed without review/);
failures(v=>v.sceneImages[0].mobileSha256="a".repeat(64),/changed without review/);
failures(v=>v.sceneImages[0].width=2048,/dimensions mismatch/);
failures(v=>delete v.sceneImages[0].sha256,/Missing immutable/);
failures(v=>v.sceneImages[0].mobileFile="case002-a01-scene--mobile.webp",/different scene/);
failures(v=>v.sceneImages.push(v.sceneImages[0]),/Duplicate approved scene/);
failures(v=>{v.sceneImages[0].sceneId="A11";v.sceneImages[0].file="case002-a11-scene.webp";},/does not exist/);
failures(v=>v.sceneImages[0].review="draft",/Unreviewed scene/);
failures(v=>v.sceneImages[0].mobileOnly=true,/Mobile-only scene must not pretend/);
failures(v=>v.sceneImages[0].mobileOnly="yes",/Unknown scene display mode/);
// Positive end-to-end mobile-only binary audit, with one genuine verified WebP.
// A temporary renamed fixture tests the code path without approving B06.
const os=require("node:os");
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"case002-mobile-only-"));
try{
 const folder=path.join(tmp,"assets/case002/scenes");
 fs.mkdirSync(folder,{recursive:true});
 fs.copyFileSync(path.join(root,"assets/case002/scenes",first.mobileFile),
   path.join(folder,"case002-b06-scene--mobile.webp"));
 const fixture={schemaVersion:1,npcPortraits:[],sceneImages:[{
   sceneId:"B06",variantKey:"default",review:"approved",mobileOnly:true,
   file:"case002-b06-scene.webp",cast:[],
   mobileFile:"case002-b06-scene--mobile.webp",
   mobileWidth:first.mobileWidth,mobileHeight:first.mobileHeight,
   mobileSha256:first.mobileSha256
 }]};
 const positive=audit({root:tmp,source:fixture});
 assert.equal(positive.sceneCount,1);
 assert.equal(positive.exportedCount,1,"No phantom desktop file in a phone-only wave");
 assert.equal(positive.files[0].file,"case002-b06-scene--mobile.webp");
 fixture.sceneImages[0].mobileSha256="0".repeat(64);
 assert.throws(()=>audit({root:tmp,source:fixture}),/changed without review/);
}finally{
 fs.rmSync(tmp,{recursive:true,force:true});
}
function synthetic(format,width,height){
 const bytes=Buffer.alloc(36);
 bytes.write("RIFF",0,"ascii");bytes.writeUInt32LE(bytes.length-8,4);
 bytes.write("WEBP",8,"ascii");bytes.write(format,12,"ascii");
 bytes.writeUInt32LE(16,16);
 if(format==="VP8X"){
   const x=width-1,y=height-1;
   bytes[24]=x&255;bytes[25]=(x>>8)&255;bytes[26]=(x>>16)&255;
   bytes[27]=y&255;bytes[28]=(y>>8)&255;bytes[29]=(y>>16)&255;
 }else if(format==="VP8L"){
   const x=width-1,y=height-1;
   bytes[20]=0x2f;
   bytes[21]=x&255;
   bytes[22]=((x>>8)&0x3f)|((y&3)<<6);
   bytes[23]=(y>>2)&255;
   bytes[24]=(y>>10)&0x0f;
 }
 return bytes;
}
assert.deepEqual(
 (({width,height})=>({width,height}))(dimensions(synthetic("VP8X",1200,675))),
 {width:1200,height:675}
);
assert.deepEqual(
 (({width,height})=>({width,height}))(dimensions(synthetic("VP8L",720,900))),
 {width:720,height:900}
);
assert.throws(()=>dimensions(synthetic("JUNK",100,100)),/no recognizable image dimensions/);
console.log("PASS Case002 binary art audit: real P01 assets, 10 corruption/mismatch guards, VP8X/VP8L parsing.");