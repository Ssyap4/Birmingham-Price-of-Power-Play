#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const {SIDES,EVENTS,resolveInsets,bind}=require("../../src/case002/telegram-safe-area-v1.js");
assert.deepEqual(SIDES,["top","right","bottom","left"]);
assert.deepEqual(EVENTS,["safeAreaChanged","contentSafeAreaChanged","viewportChanged"]);
assert.deepEqual(resolveInsets(null),{top:0,right:0,bottom:0,left:0});
assert.deepEqual(resolveInsets({
 safeAreaInset:{top:20,bottom:34,left:1,right:0},
 contentSafeAreaInset:{top:40,bottom:0,left:2,right:3}
}),{top:60,right:3,bottom:34,left:3});
assert.deepEqual(resolveInsets({
 safeAreaInset:{top:-11,bottom:999,left:Infinity,right:"bad"},
 contentSafeAreaInset:{top:2.7,bottom:"7.4",left:null,right:NaN}
}),{top:3,right:0,bottom:247,left:0},
 "Malformed bridge fields must be clamped and rounded");
const values=new Map(),handlers=new Map();
const style={
 setProperty:(name,value)=>values.set(name,value),
 removeProperty:name=>values.delete(name)
};
const app={
 safeAreaInset:{top:20,bottom:34,left:0,right:0},
 contentSafeAreaInset:{top:48,bottom:0,left:0,right:0},
 onEvent:(name,cb)=>{assert(EVENTS.includes(name));handlers.set(name,cb)},
 offEvent:(name,cb)=>{assert.equal(handlers.get(name),cb);handlers.delete(name)}
};
assert.equal(typeof bind({document:{documentElement:{style}}}),"function");
assert.equal(values.size,0,"Standalone browser mode must never inject fake insets");
const unbind=bind({document:{documentElement:{style}},Telegram:{WebApp:app}});
assert.equal(values.get("--case002-safe-top"),"68px");
assert.equal(values.get("--case002-safe-bottom"),"34px");
assert.equal(handlers.size,3);
app.contentSafeAreaInset.top=72;
handlers.get("contentSafeAreaChanged")();
assert.equal(values.get("--case002-safe-top"),"92px");
app.safeAreaInset.left=10;
handlers.get("safeAreaChanged")();
assert.equal(values.get("--case002-safe-left"),"10px");
app.safeAreaInset.bottom=0;
handlers.get("viewportChanged")();
assert.equal(values.get("--case002-safe-bottom"),"0px");
unbind();
assert.equal(values.size,0);
assert.equal(handlers.size,0);
unbind();
assert.equal(typeof bind(null),"function");
console.log("PASS Case002 Telegram safe area: offline fallback, combined insets, events, cleanup and clamped values.");
