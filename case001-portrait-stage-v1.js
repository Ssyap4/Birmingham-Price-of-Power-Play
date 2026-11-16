/* Project existing Case 001 scene artwork into a portrait-friendly, full
   widescreen image. Never write to story state or saved progress. */
(()=>{
 "use strict";
 const stage=document.getElementById("caseArt");
 if(!stage)return;
 const photo=document.createElement("img");
 photo.className="case001-portrait-image";
 photo.alt="";
 photo.setAttribute("aria-hidden","true");
 photo.decoding="async";
 photo.loading="eager";
 photo.hidden=true;
 stage.append(photo);
 const heading=document.querySelector("#caseScene .case-scene-inner");
 const readButton=document.createElement("button");
 readButton.type="button";
 readButton.className="case001-read-scene";
 readButton.textContent="К ТЕКСТУ СЦЕНЫ ↓";
 readButton.addEventListener("click",()=>{
  const game=document.getElementById("caseGame");
  if(!game||game.hidden)return;
  const target=game.querySelector(".case-dialogue:not([hidden])")||
   game.querySelector(".case-paper");
  target?.scrollIntoView({block:"start",behavior:"smooth"});
 });
 heading?.append(readButton);
 let current="";
 function refresh(){
  const urls=[...((stage.style.backgroundImage||"").matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi))];
  const url=urls.length?urls[urls.length-1][1]:"";
  if(url===current)return;
  current=url;
  photo.hidden=true;
  stage.classList.remove("case001-art-fallback");
  if(!url){stage.classList.add("case001-art-fallback");photo.removeAttribute("src");return;}
  photo.onload=()=>{if(current===url)photo.hidden=false;};
  photo.onerror=()=>{if(current===url)stage.classList.add("case001-art-fallback");};
  photo.src=url;
  if(photo.complete&&photo.naturalWidth>0)photo.hidden=false;
 }
 new MutationObserver(refresh).observe(stage,{attributes:true,attributeFilter:["style"]});
 refresh();
})();
