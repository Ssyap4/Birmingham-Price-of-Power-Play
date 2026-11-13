#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const {plan}=require("../../src/case002/ui-events-v1.js");
const receipts=require("../../src/case002/consequences-v1.js");
const s=()=>({evidence:[],witnesses:{ada:"missing",tommy:"detained",mercer:"missing"},flags:{},finished:false});
{
 const b=s(),a={...b,evidence:["old_excursion_ticket"]};
 const p=plan(b,a,"continue",receipts,id=>id==="old_excursion_ticket"?"Старинный билет":id);
 assert.equal(p.focus.tab,"evidence");
 assert.equal(p.focus.id,"old_excursion_ticket");
 assert(p.message.includes("Старинный билет"));
 assert.equal(p.count,1);
}
{
 const b=s(),a={...b,witnesses:{...b.witnesses,ada:"protected"}};
 const p=plan(b,a,"hideAda",receipts);
 assert.equal(p.focus.tab,"witnesses");
 assert.equal(p.kind,"witness");
 assert(p.message.includes("под защитой"));
 assert(!p.message.includes("эвакуирован"));
}
{
 const b=s(),a={...b,witnesses:{...b.witnesses,ada:"detained"}};
 const p=plan(b,a,"betrayAda",receipts);
 assert.equal(p.kind,"danger");
 assert.equal(p.focus.tab,"journal");
 assert(p.message.startsWith("Убежище Ады раскрыто"));
}
{
 const b=s(),a={...b,flags:{accountsGivenToWorkers:true}};
 const p=plan(b,a,"passAccountsToWorkers",receipts);
 assert.equal(p.focus.tab,"evidence");
 assert.equal(p.focus.id,"brackett_accounts");
 assert.equal(p.kind,"custody");
}
{
 const b=s(),a={...b,evidence:["hale_coat","bridge_witness","guard_bootmark"],
   witnesses:{ada:"protected",tommy:"protected",mercer:"missing"}};
 const p=plan(b,a,"continue",receipts);
 assert(p.count>2);
 assert(p.message.includes("Ещё "));
 assert.equal(p.focus.tab,"witnesses");
}
{
 const b=s();
 const p=plan(b,b,"continue",receipts);
 assert.equal(p.message,"");
 assert.equal(p.focus,null);
}
assert.throws(()=>plan(s(),s(),"continue",{}),/processor/);
console.log("PASS Case002 mobile events: 7 focused cases covering new clue, witness, betrayal, custody, multiple changes and no-op.");
