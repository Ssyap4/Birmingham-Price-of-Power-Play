/* Case 002 mobile event navigator.
 * Converts consequences into a visible, actionable message without mutating
 * the engine or pretending that an unearned reward was received.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002UIEvents=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const priorities={danger:0,custody:1,witness:2,choice:3,evidence:4,consequence:5,final:6};
function plan(before,after,action,receipts,describeEvidence){
 if(!receipts||typeof receipts.receipts!=="function")
   throw Error("Case002 consequence processor required");
 const changes=receipts.receipts(before,after,action,describeEvidence)
   .map((entry,i)=>({...entry,index:i}))
   .sort((a,b)=>(priorities[a.kind]??9)-(priorities[b.kind]??9)||a.index-b.index);
 const main=changes.slice(0,2);
 const extra=changes.length-main.length;
 const message=main.map(x=>x.text).join(" ")+
   (extra?" Ещё "+extra+" "+(extra===1?"изменение":"изменения")+" — в ходе дела.":"");
 if(!changes.length)return {message:"",kind:null,focus:null,count:0};
 const primary=changes[0];
 const added=after.evidence.filter(id=>!before.evidence.includes(id));
 const focus=primary.kind==="evidence"&&added.length?
   {tab:"evidence",id:added[0]}:
   primary.kind==="witness"?{tab:"witnesses",id:null}:
   primary.kind==="custody"?{tab:"evidence",id:"brackett_accounts"}:
   {tab:"journal",id:null};
 return {message,kind:primary.kind,focus,count:changes.length};
}
return {plan};
});
