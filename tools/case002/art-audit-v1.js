#!/usr/bin/env node
"use strict";
/* Verify real Case 002 WebP assets without downloading native image libraries.
 * Intentionally independent of game state; never approves draft imagery.
 * Exact dimensions, SHA-256 and mobile transfer size are checked in CI.
 */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {createHash}=require("node:crypto");
const {manifest}=require("../../src/case002/approved-art-v1.js");
const ROOT=path.resolve(__dirname,"../..");
const MAX_BYTES={desktop:1300000,mobile:900000,portrait:800000};
function dimensions(bytes){
 assert(Buffer.isBuffer(bytes)&&bytes.length>=30,"WebP too short");
 assert(bytes.toString("ascii",0,4)==="RIFF" &&
   bytes.toString("ascii",8,12)==="WEBP", "Not a RIFF WebP");
 assert(bytes.readUInt32LE(4)+8===bytes.length,"RIFF length differs from file length");
 for(let p=12;p+8<=bytes.length;){
   const fourcc=bytes.toString("ascii",p,p+4);
   const len=bytes.readUInt32LE(p+4);
   const start=p+8,end=start+len;
   assert(end<=bytes.length,"WebP chunk exceeds file");
   let width=0,height=0;
   if(fourcc==="VP8X"&&len>=10){
     width=1+bytes[start+4]+(bytes[start+5]<<8)+(bytes[start+6]<<16);
     height=1+bytes[start+7]+(bytes[start+8]<<8)+(bytes[start+9]<<16);
   }else if(fourcc==="VP8 "&&len>=10){
     assert(bytes[start+3]===0x9d&&bytes[start+4]===1&&bytes[start+5]===0x2a,
       "Invalid VP8 keyframe header");
     width=bytes.readUInt16LE(start+6)&0x3fff;
     height=bytes.readUInt16LE(start+8)&0x3fff;
   }else if(fourcc==="VP8L"&&len>=5){
     assert(bytes[start]===0x2f,"Invalid lossless WebP header");
     width=1+bytes[start+1]+((bytes[start+2]&0x3f)<<8);
     height=1+(bytes[start+2]>>6)+(bytes[start+3]<<2)+((bytes[start+4]&0xf)<<10);
   }
   if(width&&height)return {width,height,format:fourcc.trim()};
   p=end+(len&1);
 }
 throw Error("WebP has no recognizable image dimensions");
}
function inspect(root,folder,file,expected,label,maxBytes,seen){
 assert(/^case002-[a-z0-9-]+\.webp$/.test(file),"Unrecognized art filename: "+file);
 const full=path.resolve(root,"assets/case002",folder,file);
 assert(full.startsWith(path.resolve(root,"assets/case002")+path.sep),
   "Art path escaped approved directory");
 assert(fs.existsSync(full),"Approved art file does not exist: "+file);
 const raw=fs.readFileSync(full);
 assert(raw.length>4000&&raw.length<=maxBytes,
   "Unoptimized or empty art: "+file+" bytes="+raw.length);
 const actual=dimensions(raw);
 assert(actual.width===expected.width && actual.height===expected.height,
   "Manifest dimensions mismatch: "+file+" "+actual.width+"x"+actual.height);
 assert(typeof expected.sha256==="string"&&/^[0-9a-f]{64}$/.test(expected.sha256),
   "Missing immutable review SHA-256 for "+file);
 const hash=createHash("sha256").update(raw).digest("hex");
 assert.equal(hash,expected.sha256,"Approved art changed without review: "+file);
 assert(!seen.has(hash),"Duplicate art file reused for different IDs: "+file);
 seen.add(hash);
 if(label==="desktop")
   assert(actual.width/actual.height>1.6&&actual.width/actual.height<1.95,
     "Landscape scene must retain cinematic frame: "+file);
 if(label==="mobile")
   assert(actual.width/actual.height>=0.52&&actual.width/actual.height<=0.86,
     "Mobile file must be a distinct tall composition: "+file);
 if(label==="portrait")
   assert(actual.height>actual.width,"NPC face reference must be portrait: "+file);
 return {file,bytes:raw.length,...actual,hash};
}
function audit({root=ROOT,source=manifest}={}){
 assert(source&&source.schemaVersion===1&&
   Array.isArray(source.sceneImages)&&Array.isArray(source.npcPortraits),
   "Invalid approved art manifest");
 const seen=new Set(),out=[];
 const keys=new Set();
 for(const scene of source.sceneImages){
   const key=scene.sceneId+"/"+scene.variantKey;
   assert(!keys.has(key),"Duplicate approved scene in manifest: "+key);
   keys.add(key);
   assert(scene.review==="approved","Unreviewed scene cannot enter production: "+key);
   assert(scene.file==="case002-"+scene.sceneId.toLowerCase()+"-scene"+
     (scene.variantKey==="default"?"":"--"+scene.variantKey)+".webp",
     "Invalid scene file binding: "+key);
   out.push(inspect(root,"scenes",scene.file,
     {width:scene.width,height:scene.height,sha256:scene.sha256},
     "desktop",MAX_BYTES.desktop,seen));
   if(scene.mobileFile!==undefined){
     assert(scene.mobileFile===scene.file.replace(/\.webp$/,"--mobile.webp"),
       "Mobile crop belongs to different scene/variant: "+key);
     out.push(inspect(root,"scenes",scene.mobileFile,
       {width:scene.mobileWidth,height:scene.mobileHeight,sha256:scene.mobileSha256},
       "mobile",MAX_BYTES.mobile,seen));
   }
 }
 const ids=new Set();
 for(const npc of source.npcPortraits){
   assert(!ids.has(npc.id),"Duplicate NPC identity: "+npc.id);
   ids.add(npc.id);
   assert(npc.review==="approved","Unreviewed portrait: "+npc.id);
   assert(npc.file==="case002-"+npc.id+"-portrait.webp",
     "NPC identity mismatched filename: "+npc.id);
   out.push(inspect(root,"portraits",npc.file,
     {width:npc.width,height:npc.height,sha256:npc.sha256},
     "portrait",MAX_BYTES.portrait,seen));
 }
 return {sceneCount:source.sceneImages.length,portraitCount:source.npcPortraits.length,
   exportedCount:out.length,totalBytes:out.reduce((a,b)=>a+b.bytes,0),files:out};
}
if(require.main===module){
 const r=audit();
 console.log("PASS Case002 art file audit: "+r.sceneCount+" approved scenes, "+
   r.portraitCount+" original NPCs, "+r.exportedCount+" real WebP files, "+
   r.totalBytes+" total bytes. All dimensions/SHA/budgets verified.");
}
module.exports={dimensions,inspect,audit,MAX_BYTES};