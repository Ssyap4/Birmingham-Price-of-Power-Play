"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),P=require("../trial-progress-v1.js");
function store(raw=null){return {raw,getItem(){return this.raw},setItem(k,v){this.raw=v}}}
const row={date:"2026-11-17T10:00:00.000Z",won:false,score:0,errors:3,answered:3,total:50,mode:"classic",difficulty:"veryEasy"};
test("latest stats are merged instead of overwriting another tab",()=>{const s=store();P.start(s);P.start(s);P.finish(s,row,true);assert.equal(P.read(s).value.played,2);assert.equal(P.read(s).value.history.length,1)});
test("corrupt and silently rejected stores are not reported as saved",()=>{const s=store("{broken");assert.equal(P.start(s).status,"damaged");assert.equal(s.raw,"{broken");const denied=store();denied.setItem=()=>{};assert.equal(P.start(denied).status,"unavailable");assert.equal(denied.raw,null)});
test("started and completed attempts remain distinct; earned wins are derived from valid levels",()=>{const s=store();for(let i=0;i<10;i++)P.start(s);assert.equal(P.awards(P.read(s).value)[3].earned,false);for(let i=0;i<10;i++)P.finish(s,row,true);assert.equal(P.awards(P.read(s).value)[3].earned,true);assert.equal(P.read(s).value.played,10);const a=P.read(s).value;a.completed={veryEasy:1,easy:1,medium:1,other:1};assert.equal(P.awards(a)[5].earned,false)});
