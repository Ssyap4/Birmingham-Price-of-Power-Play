"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const {snapshot}=require("../../player-profile-overview-v1.js");
function store(initial) {
  const data=new Map(Object.entries(initial));
  let reads=0,writes=0;
  return {getItem(k){reads++;return data.get(k)??null;},
    setItem(){writes++;throw Error("profile must never write");},
    removeItem(){writes++;throw Error("profile must never remove");},
    get writes(){return writes;},get reads(){return reads;}};
}
test("personal profile displays true local archives read only",()=>{
 const st=store({
  birmingham_campaign_records_v1:JSON.stringify([
    {key:"001:jack:1",caseId:"001",heroId:"jack",ending:"endingEvidence"},
    {key:"001:jack:2",caseId:"001",heroId:"jack",ending:"endingEvidence"}
  ]),
  birmingham_campaign_unique_rewards_v1:JSON.stringify({"001:jack:endingEvidence":1700000000000})
 });
 const root={localStorage:st,
  BirminghamCase002CampaignArchive:{snapshot:()=>({status:"ready",records:{status:"ready"},rewards:{status:"ready"},completed:[{},{}],confirmed:new Set(["a"])})},
  BirminghamCase002Data:{contract:{},graph:{}},BirminghamCase002Engine:{},BirminghamCase002Achievements:{},
  CriminalArchive:{ledger:()=>({ok:true,value:{attempts:[{},{}],rewards:{a:"id"},achievements:{}}})}};
 const r=snapshot(root);
 assert.deepEqual(r.map(x=>[x.name,x.count,x.unique]),
  [["Дело №001",2,1],["Дело №002",2,1],["Работа для своих",2,1]]);
 assert.equal(st.writes,0);
});
test("a damaged archive never counts phantom rewards",()=>{
 const st=store({birmingham_campaign_records_v1:"{bad"});
 const r=snapshot({localStorage:st,CriminalArchive:{ledger:()=>({ok:false})}});
 assert.equal(r[0].status,"damaged");
 assert.equal(r[1].status,"unavailable");
 assert.equal(r[2].status,"damaged");
 assert.equal(st.writes,0);
});

test("profile counts only confirmed stamps, preserves invalid and incomplete records",()=>{
 const record={key:"001:jack:1",caseId:"001",heroId:"jack",ending:"endingEvidence"};
 const st=store({birmingham_campaign_records_v1:JSON.stringify([record]),
  birmingham_campaign_unique_rewards_v1:JSON.stringify({"001:finn:endingTruth":1700000000000})});
 const p=snapshot({localStorage:st})[0];
 assert.equal(p.status,"partial");assert.equal(p.count,1);assert.equal(p.unique,0);
 assert.equal(st.writes,0);
 const wrong=store({birmingham_campaign_records_v1:JSON.stringify([{...record,heroId:"unknown"}])});
 assert.equal(snapshot({localStorage:wrong})[0].status,"damaged");
 const invalid=store({birmingham_campaign_records_v1:JSON.stringify([record]),birmingham_campaign_unique_rewards_v1:"{bad"});
 assert.equal(snapshot({localStorage:invalid})[0].status,"damaged");
 assert.equal(invalid.writes,0);
});
