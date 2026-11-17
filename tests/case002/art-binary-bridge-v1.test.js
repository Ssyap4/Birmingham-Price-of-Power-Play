#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {execFileSync}=require("node:child_process");
const {createHash}=require("node:crypto");
const repo=path.join(__dirname,"../..");
const src=path.join(repo,"assets/case002/scenes");
const script=path.join(repo,"tools/case002/export-art-binary-bridge-v1.py");
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"case002-binary-bridge-"));
try {
 const ids=["C01","C02","C03","C04","C05"];
 execFileSync("python3",[script,"--input-dir",src,"--output-dir",tmp,"--ids",...ids]);
 const report=JSON.parse(fs.readFileSync(path.join(tmp,"bridge-report.json"),"utf8"));
 assert.equal(report.stage,"bridge-prepared-only");
 assert.equal(report.approvedArtManifestModified,false);
 assert.equal(report.items.length,5);
 for(const item of report.items){
  const raw=fs.readFileSync(path.join(src,item.webpFile));
  const enc=fs.readFileSync(path.join(tmp,item.bridgeFile),"ascii").replace(/\s+/g,"");
  const decoded=Buffer.from(enc,"base64");
  assert(decoded.equals(raw),"Bridge bytes must be identical to original");
  assert.equal(item.base64Length,enc.length);
  assert.equal(item.sha256,createHash("sha256").update(raw).digest("hex"));
  assert.equal(item.gitBlobSha1,createHash("sha1")
   .update(Buffer.concat([Buffer.from("blob "+raw.length+"\0"),raw])).digest("hex"));
 }
 assert.throws(()=>execFileSync("python3",[script,"--input-dir",src,
  "--output-dir",tmp,"--ids","C01","C01"],{stdio:"pipe"}));
 console.log("PASS: byte-exact bridge for five approved Case 002 WebPs.");
} finally {fs.rmSync(tmp,{recursive:true,force:true});}
