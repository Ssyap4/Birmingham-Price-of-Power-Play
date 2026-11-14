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
const attributes=new Map();
const element={style,
 setAttribute:(name,value)=>attributes.set(name,value),
 removeAttribute:name=>attributes.delete(name)
};
const node=()=>{
 const values=new Map();
 return {values,style:{
   setProperty:(name,value)=>values.set(name,value),
   getPropertyValue:name=>values.get(name)||"",
   removeProperty:name=>values.delete(name)
 }};
};
const elements={".app-shell":node(),"#game":node(),".case-quick-nav":node(),
 "#storyPanel":node(),"#choicesPanel":node(),"#caseTools":node(),
 "#chapterIntertitle":node(),"#sceneText":node()};
const unbind=bind({innerWidth:390,
 document:{documentElement:element,querySelector:selector=>elements[selector]},
 Telegram:{WebApp:app}});

assert.equal(attributes.get("data-case002-telegram"),"true");
assert.equal(values.get("--case002-safe-top"),"68px");
assert.equal(values.get("--case002-safe-bottom"),"34px");
assert.equal(handlers.size,3);
assert.equal(elements[".app-shell"].values.get("padding-top"),"68px");
assert.equal(elements[".app-shell"].values.get("padding-bottom"),"58px");
assert.equal(elements[".case-quick-nav"].values.get("padding-bottom"),"42px");
assert.equal(elements["#game"].values.get("padding-bottom"),"126px");
for(const id of ["#storyPanel","#choicesPanel","#caseTools","#chapterIntertitle","#sceneText"])
 assert.equal(elements[id].values.get("scroll-margin-top"),"86px",
  "A jump target must remain below the 68px Telegram header");

app.contentSafeAreaInset.top=72;
handlers.get("contentSafeAreaChanged")();
assert.equal(values.get("--case002-safe-top"),"92px");
assert.equal(elements[".app-shell"].values.get("padding-top"),"92px");
for(const id of ["#storyPanel","#choicesPanel","#caseTools","#chapterIntertitle","#sceneText"])
 assert.equal(elements[id].values.get("scroll-margin-top"),"110px",
  "Navigation offset must react to a changed Telegram header");
app.safeAreaInset.left=10;
handlers.get("safeAreaChanged")();
assert.equal(values.get("--case002-safe-left"),"10px");
app.safeAreaInset.bottom=0;
handlers.get("viewportChanged")();
assert.equal(values.get("--case002-safe-bottom"),"0px");
assert.equal(elements[".case-quick-nav"].values.get("padding-bottom"),"8px");
unbind();
assert.equal(values.size,0);
assert.equal(handlers.size,0);
assert.equal(attributes.size,0,"Telegram-only CSS override must be removed");
for(const entry of Object.values(elements))
 assert.equal(entry.values.size,0,"CSS fallback must be removed on cleanup");
unbind();
assert.equal(typeof bind(null),"function");
console.log("PASS Case002 Telegram safe area: offline fallback, combined insets, scroll target offsets, events, cleanup and clamped values.");
