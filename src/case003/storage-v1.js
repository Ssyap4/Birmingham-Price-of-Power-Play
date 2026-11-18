"use strict";
const e=require("./engine-v1");
const {contract}=require("./graph-v1");
const key=hero=>e.SAVE_PREFIX+hero;
function parse(raw,hero){
 if(raw===null)return {status:"empty",raw,slot:null};
 try{
  const v=JSON.parse(raw);
  if(v.schema!==1||typeof v.attempt!=="string"||!v.attempt||!Array.isArray(v.records))throw Error("shape");
  const state=e.restore(JSON.stringify(v.state),hero);
  if(!state)throw Error("state");
  const seen=new Set();
  for(const r of v.records){
   if(typeof r.attempt!=="string"||!r.attempt||seen.has(r.attempt)||!contract.endings.some(x=>x.id===r.ending)||r.reward!==["003",hero,r.ending].join(":"))throw Error("record");
   seen.add(r.attempt);
  }
  const record=v.records.find(r=>r.attempt===v.attempt);
  if(state.ending ? !record||record.ending!==state.ending : !!record)throw Error("terminal record");
  return {status:state.ending?"finished":"active",raw,slot:{schema:1,attempt:v.attempt,state,records:v.records}};
 }catch{return {status:"damaged",raw,slot:null};}
}
function read(storage,hero){
 try{return parse(storage.getItem(key(hero)),hero);}catch{return {status:"unavailable",raw:null,slot:null};}
}
function write(storage,hero,expected,slot){
 const raw=JSON.stringify(slot);
 if(parse(raw,hero).status==="damaged")throw Error("Invalid slot");
 if(storage.getItem(key(hero))!==expected)throw Error("conflict");
 storage.setItem(key(hero),raw);
 if(storage.getItem(key(hero))!==raw)throw Error("conflict");
 return parse(raw,hero);
}
function begin(storage,hero,expected,attempt){
 const previous=read(storage,hero);
 if(previous.status==="unavailable"||previous.raw!==expected)throw Error("conflict");
 if(previous.status==="damaged")throw Error("damaged");
 if(previous.slot&&(previous.slot.attempt===attempt||previous.slot.records.some(r=>r.attempt===attempt)))throw Error("duplicate attempt");
 return write(storage,hero,expected,{schema:1,attempt,state:e.create(hero),records:previous.slot?.records||[]});
}
function replaceDamaged(storage,hero,expected,attempt){
 const old=read(storage,hero);
 if(old.status!=="damaged"||old.raw!==expected)throw Error("conflict");
 const archiveKey=key(hero)+"_damaged_"+attempt;
 if(storage.getItem(archiveKey)!==null)throw Error("duplicate backup");
 storage.setItem(archiveKey,expected);
 if(storage.getItem(archiveKey)!==expected)throw Error("backup failed");
 return write(storage,hero,expected,{schema:1,attempt,state:e.create(hero),records:[]});
}
function advance(storage,hero,expected,operation){
 const current=read(storage,hero);
 if(current.status!=="active"||current.raw!==expected)throw Error("conflict");
 const old=current.slot;
 const state=operation.type==="step"?e.step(old.state,operation.id):operation.type==="prove"?e.prove(old.state,operation.id,operation.evidence).state:null;
 if(!state)throw Error("operation");
 if(state===old.state)return {...current,earned:false,changed:false};
 const records=old.records.slice();
 let earned=false;
 if(state.ending){
  const reward=e.rewardId(state);
  earned=!records.some(r=>r.reward===reward);
  records.push({attempt:old.attempt,ending:state.ending,reward});
 }
 return {...write(storage,hero,expected,{...old,state,records}),earned,changed:true};
}
module.exports={key,parse,read,begin,replaceDamaged,advance};
