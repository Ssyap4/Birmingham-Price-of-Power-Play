/* Case 002 — optional Telegram Mini App safe-area adapter.
 * Runs entirely offline in Safari/Android browsers when Telegram SDK is absent.
 * No registration, storage or gameplay state changes. Mobile UI only.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002TelegramSafeArea=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const SIDES=["top","right","bottom","left"];
const EVENTS=["safeAreaChanged","contentSafeAreaChanged","viewportChanged"];
const bounded=value=>{
 const n=Number(value);
 return Number.isFinite(n)?Math.max(0,Math.min(240,Math.round(n))):0;
};
function resolveInsets(webApp){
 const safe=webApp&&webApp.safeAreaInset||{};
 const content=webApp&&webApp.contentSafeAreaInset||{};
 return Object.fromEntries(SIDES.map(side=>[
   side,bounded(safe[side])+bounded(content[side])
 ]));
}
function bind(host){
 const app=host&&host.Telegram&&host.Telegram.WebApp;
 const style=host&&host.document&&host.document.documentElement&&
   host.document.documentElement.style;
 if(!app||!style)return ()=>{};
 let active=true;
 const update=()=>{
   if(!active)return;
   const edges=resolveInsets(app);
   for(const side of SIDES)
     style.setProperty("--case002-safe-"+side,edges[side]+"px");
 };
 update();
 if(typeof app.onEvent==="function"){
   for(const event of EVENTS)app.onEvent(event,update);
 }
 return ()=>{
   if(!active)return;
   active=false;
   if(typeof app.offEvent==="function")
     for(const event of EVENTS)app.offEvent(event,update);
   for(const side of SIDES)style.removeProperty("--case002-safe-"+side);
 };
}
return {SIDES,EVENTS,resolveInsets,bind};
});
