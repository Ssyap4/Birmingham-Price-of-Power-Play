/* Project existing Case 001 scene artwork into a portrait-friendly, full
   widescreen image. Never write to story state or saved progress. */
(()=>{
 "use strict";
 const stage=document.getElementById("caseArt");
 const game=document.getElementById("caseGame");
 if(!stage||!game)return;
 const photo=document.createElement("img");
 photo.className="case001-portrait-image";
 photo.alt="";
 photo.setAttribute("aria-hidden","true");
 photo.decoding="async";
 photo.loading="eager";
 photo.hidden=true;
 stage.append(photo);
 const readButton=document.createElement("button");
 readButton.type="button";
 readButton.className="case001-read-scene";
 readButton.textContent="К ТЕКСТУ СЦЕНЫ ↓";
 readButton.addEventListener("click",()=>{
  const game=document.getElementById("caseGame");
  if(!game||game.hidden)return;
  const target=game.querySelector(".case-dialogue:not([hidden])")||
   game.querySelector(".case-paper");
  if(!target)return;
  target.tabIndex=-1;
  target.focus({preventScroll:true});
  target.scrollIntoView({block:"start",behavior:"instant"});
 });
 // The artwork precedes its reading action in both DOM and mobile layout.
 stage.after(readButton);
 let current="";
 function refresh(){
  // Release the duplicate decoded display image when the case is closed.
  // Keep the original CSS background and engine-selected source untouched.
  if(game.hidden){
   if(current||photo.hasAttribute("src")){
    current="";photo.onload=null;photo.onerror=null;
    photo.hidden=true;photo.removeAttribute("src");
    stage.classList.remove("case001-art-fallback");
   }
   return;
  }
  const urls=[...((stage.style.backgroundImage||"").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi))];
  const url=urls.length?urls[urls.length-1][1]:"";
  if(url===current)return;
  current=url;
  photo.hidden=true;
  stage.classList.remove("case001-art-fallback");
  if(!url){stage.classList.add("case001-art-fallback");photo.removeAttribute("src");return;}
  const matches=()=>current===url&&photo.getAttribute("src")===url;
  photo.onload=()=>{if(matches()&&photo.naturalWidth>0)photo.hidden=false;};
  photo.onerror=()=>{if(matches()){photo.hidden=true;stage.classList.add("case001-art-fallback");}};
  photo.src=url;
  if(photo.complete&&photo.naturalWidth>0)photo.hidden=false;
 }
 new MutationObserver(refresh).observe(stage,{attributes:true,attributeFilter:["style"]});
 new MutationObserver(refresh).observe(game,{attributes:true,attributeFilter:["hidden"]});
 refresh();
})();
