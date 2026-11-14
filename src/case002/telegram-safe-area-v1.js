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
 const element=host&&host.document&&host.document.documentElement;
 const style=element&&element.style;
 if(!app||!style)return ()=>{};
 // Safari/WebKit can ignore max(env(...),var(...)) on Telegram WebViews.
 // Mark the root only when Telegram actually provides inset metadata;
 // CSS can then use a direct pixel fallback without double counting notches.
 const supportsInsets=Boolean(app.safeAreaInset||app.contentSafeAreaInset);
 if(supportsInsets&&typeof element.setAttribute==="function")
   element.setAttribute("data-case002-telegram","true");
 // Some Safari/WebKit builds report the correct --case002-safe-top but
 // compute padding-top:var(--case002-safe-top) as 0px. Apply the same
 // measured Telegram inset in actual pixel padding to layout surfaces.
 // These are presentation-only overrides; restore preexisting inline
 // declarations on disconnect, leaving game and save state untouched.
 const saved=new Map();
 const query=selector=>typeof host.document?.querySelector==="function"?
   host.document.querySelector(selector):null;
 const pixel=(node,name,value)=>{
   if(!node?.style||typeof node.style.setProperty!=="function")return;
   if(!saved.has(node))saved.set(node,new Map());
   const props=saved.get(node);
   if(!props.has(name))
     props.set(name,typeof node.style.getPropertyValue==="function"?
       node.style.getPropertyValue(name):"");
   node.style.setProperty(name,value+"px");
 };
 let active=true;
 const update=()=>{
   if(!active)return;
   const edges=resolveInsets(app);
   for(const side of SIDES)
     style.setProperty("--case002-safe-"+side,edges[side]+"px");
   if(!supportsInsets)return;
   const screenWidth=Number(host.innerWidth)||390;
   const side=screenWidth>=580?20:14;
   const navSide=screenWidth<=359?4:8;
   const shell=query(".app-shell"),game=query("#game"),nav=query(".case-quick-nav");
   pixel(shell,"padding-top",edges.top);
   pixel(shell,"padding-bottom",24+edges.bottom);
   pixel(shell,"padding-left",side+edges.left);
   pixel(shell,"padding-right",side+edges.right);
   pixel(game,"padding-bottom",92+edges.bottom);
   pixel(nav,"padding-bottom",8+edges.bottom);
   pixel(nav,"padding-left",navSide+edges.left);
   pixel(nav,"padding-right",navSide+edges.right);
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
   for(const [node,props] of saved)for(const [name,oldValue] of props){
     if(oldValue)node.style.setProperty(name,oldValue);
     else node.style.removeProperty(name);
   }
   saved.clear();
   if(supportsInsets&&typeof element.removeAttribute==="function")
     element.removeAttribute("data-case002-telegram");
 };
}
return {SIDES,EVENTS,resolveInsets,bind};
});
