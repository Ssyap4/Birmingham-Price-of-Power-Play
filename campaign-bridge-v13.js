/* V13: presentation-only wayfinding for two maps, common archive, profile.
   Original launch buttons own the actual navigation; no save/engine access. */
(()=>{
 "use strict";
 const d=document,detective=d.getElementById("districts"),
       criminal=d.getElementById("criminalScreen"),
       profile=d.getElementById("profile"),hub=window.BirminghamCampaign;
 if(!detective||!criminal||!profile||!hub)return;
 const screens=["campaignAchievements","campaignDossiers","campaignHistory"].map(id=>d.getElementById(id));
 if(screens.some(el=>!el))return;
 const choices={
  detective:[["criminal","Работа для своих"],["archive","Общий архив"]],
  criminal:[["detective","Детективная карта"],["archive","Общий архив"]],
 };
 function makeBar(kind){
  const nav=d.createElement("nav");
  nav.className="campaign-portal-v13";
  nav.dataset.portal=kind;
  nav.setAttribute("aria-label","Переходы между игровыми направлениями");
  for(const [target,label] of choices[kind]){
   const b=d.createElement("button");
   b.type="button";b.dataset.campaignJump=target;b.textContent=label;nav.append(b);
  }
  return nav;
 }
 detective.querySelector(".districts-heading")?.after(makeBar("detective"));
 // V21: the archive and profile are destinations, not secondary main menus.
 // Maps retain their contextual exit/archives; no portal is inserted above personal data.
 // The criminal renderer replaces its HTML on every move. Add links to
 // MAP only, never while choosing or recovering a pending game action.
 function syncCriminal(){
  const heading=criminal.querySelector(".cr-heading");
  if(heading&&criminal.querySelector(".cr-map")&&!criminal.querySelector(".campaign-portal-v13"))
   heading.after(makeBar("criminal"));
 }
 new MutationObserver(syncCriminal).observe(criminal,{childList:true});
 syncCriminal();
 let navigating=false;
 d.addEventListener("click",e=>{
  const b=e.target.closest(".campaign-portal-v13 [data-campaign-jump]");
  if(!b||b.disabled||navigating)return;
  const target=b.dataset.campaignJump;
  if(!["home","detective","criminal","archive","profile"].includes(target))return;
  e.preventDefault();navigating=true;
  try{
   // Always use the game's own leave action, including its pending-save guard.
   if(!criminal.hidden){
    criminal.querySelector('[data-action="home"]')?.click();
    if(!criminal.hidden)return;
   }
   // Avoid an intermediate home page for archive/profile transitions.
   if(target==="archive")hub.open("campaignAchievements");
   else if(target==="profile")d.getElementById("cabinetProfile")?.click();
   else{
    hub.open("home");
    if(target==="detective")d.getElementById("districtsCard")?.click();
    if(target==="criminal")d.getElementById("criminalEntry")?.click();
   }
   window.scrollTo({top:0,behavior:"instant"});
   const title=target==="detective"?d.querySelector("#districts .districts-heading h2"):
    target==="criminal"?d.querySelector("#criminalScreen .cr-heading h1"):
    target==="archive"?d.querySelector("#campaignAchievements .campaign-head h2"):
    target==="profile"?d.querySelector("#profile .profile-hero h2"):null;
   if(title&&!title.closest("[hidden]")){
    if(!title.hasAttribute("tabindex"))title.tabIndex=-1;
    title.focus({preventScroll:true});
   }
  }finally{navigating=false;}
 });
})();
