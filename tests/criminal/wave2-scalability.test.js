"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),crypto=require("node:crypto");
const art=require("../../src/criminal/art-manifest");
const C=require("../../src/criminal/content");
const validate=require("../../deployment/criminal-art-contract");
const budget=require("../../deployment/criminal-package-budget");
const scripts=[...fs.readFileSync("index.html","utf8").matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(m=>m[1]);
const actualIds=validate(art,scripts);
const hash=s=>crypto.createHash("sha256").update(s).digest("hex");
function expanded(){
 const missions={...C.missions},manifest={...art,frames:art.frames.map(f=>({...f,scenes:[...f.scenes]}))};
 const ids=[...actualIds], added=[];
 for(let n=7;n<=10;n++){
  const id="CR"+String(n).padStart(2,"0");
  if(ids.includes(id))continue;
  const scenes=Object.fromEntries(Array.from({length:12+n},(_,i)=>["scene"+i,{}]));
  const endings={clean:{},costly:{},failed:{},dead:{}};
  missions[id]={scenes,endings};ids.push(id);added.push(id);
  for(const moment of [...Object.keys(scenes),...Object.keys(endings).map(x=>"end:"+x)]){
   const key=id.toLowerCase()+"-"+moment.replace(":","-");
   manifest.frames.push({id:key,missionId:id,path:"assets/criminal/"+key+".webp",width:720,height:900,sha256:hash(key),sourceSha256:hash("source"+key),review:"approved",alt:"Test-only art metadata",scenes:[moment]});
  }
 }
 return {missions,manifest,ids,added};
}
test("wave two: ten different-sized mission graphs retain legacy exceptions and require every independent scene and ending",()=>{
 const {missions,manifest,ids}=expanded();
 assert.ok(ids.length>=10);
 assert.deepEqual(validate.validateCoverage(manifest,ids,missions),ids);
 const recent=manifest.frames.find(f=>!actualIds.includes(f.missionId))||manifest.frames.find(f=>f.missionId==="CR06");
 assert.ok(recent);
 const broken={...manifest,frames:manifest.frames.filter(f=>f.id!==recent.id)};
 assert.throws(()=>validate.validateCoverage(broken,ids,missions),/Incomplete art count/);
 const shared={...manifest,frames:manifest.frames.map(f=>f.id===recent.id?{...f,scenes:[f.scenes[0],f.scenes[0]]}:f)};
 assert.throws(()=>validate.validateCoverage(shared,ids,missions),/independent frame/);
 assert.throws(()=>validate.validateCoverage(manifest,ids.filter(x=>x!=="CR01"),missions),/Missing legacy mission/);
});
test("byte budget grows with approved frames, rejects oversized modern files and excessive overhead",()=>{
 const {manifest}=expanded();
 const get=p=>fs.existsSync(p)?fs.statSync(p).size:180*1024;
 const total=manifest.frames.reduce((x,f)=>x+get(f.path),750*1024);
 const result=budget(manifest,get,total);
 assert.ok(total<=result.maxBytes);
 assert.equal(result.coreBytes,750*1024);
 const frame=manifest.frames.find(f=>f.missionId==="CR06");
 assert.throws(()=>budget(manifest,p=>p===frame.path?256*1024+1:get(p),total),/Frame exceeds/);
 assert.throws(()=>budget(manifest,get,total+3*1024*1024),/core budget/);
});
