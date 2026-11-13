/* Case 002 scene speaker contract (v1).
 * Derives only physically present, previously introduced named characters.
 * The storyboard's state-aware cast is authoritative; dossier discovery
 * prevents revealing names before the narrative introduces them.
 * All NPC portraits remain absent until original art is verified.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002SceneCast=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
function participants(stage,state,registry){
 if(!stage||!Array.isArray(stage.visibleCast))
  throw new Error("Case002 stage with visible cast is required");
 if(!state||!Array.isArray(state.visited))
  throw new Error("Case002 visited scene state is required");
 if(!registry||typeof registry.discovered!=="function")
  throw new Error("Case002 canonical cast registry is required");
 const known=new Map(registry.discovered(state).map(person=>[person.id,person]));
 const seen=new Set(),result=[];
 for(const id of stage.visibleCast){
   // Unnamed extras and the player's chosen protagonist are not guest portraits.
   if(seen.has(id)||!known.has(id))continue;
   const person=known.get(id);
   seen.add(id);
   result.push({
     id,name:person.name,role:person.role,status:person.status||"",
     portrait:person.portrait||null
   });
 }
 return result;
}
return {participants};
});
