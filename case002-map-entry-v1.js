/* Digbeth -> Case 002 inside the same publication. Does not touch Case 001. */
(()=>{"use strict";
 const map=document.getElementById("districts"),first=document.getElementById("launchFirstCase");
 const locked=document.querySelector(".district-locked");
 if(!map||!first||!locked)return;
 const selected=()=>document.querySelector(".map-pin.selected")?.dataset.district;
 const launch=document.createElement("button");
 launch.type="button";launch.id="launchSecondCase";launch.className="case-choice campaign-case002-launch";
 launch.textContent="ОТКРЫТЬ ДЕЛО №002 · ПОСЛЕДНИЙ ПОЕЗД ИЗ БИРМИНГЕМА →";
 launch.setAttribute("aria-label","Открыть Дело номер два: Последний поезд из Бирмингема");
 launch.addEventListener("click",()=>{
   window.location.assign(new URL("preview/case002-prototype/index.html?from=map",window.location.href).href);
 });
 first.after(launch);
 const future=document.createElement("p");
 future.className="campaign-case002-future";future.textContent="ИЗ БУДУЩИХ ДЕЛ: «Пропавший груз»";
 launch.after(future);
 const label=document.querySelector(".district-case-label");
 function refresh(){
   const digbeth=selected()==="digbeth";
   launch.hidden=!digbeth;future.hidden=!digbeth;
   // Case 001 retains its original launch button and its independent save.
   locked.hidden=selected()==="small-heath"||digbeth;
   if(digbeth){
     document.getElementById("districtCase").textContent="Последний поезд из Бирмингема";
     document.getElementById("districtCaseDescription").textContent=
       "На железнодорожных путях исчезает вагон F-4182. За двумя поддельными ведомостями скрываются жизни свидетелей.";
   }
   if(label)label.textContent=digbeth?"ДЕЛО №002 · ДОСТУПНО":"ИЗ АРХИВА БУДУЩИХ ДЕЛ";
 }
 document.querySelectorAll(".map-pin").forEach(pin=>pin.addEventListener("click",refresh));
 function openHash(){
   if(window.location.hash!=="#district-digbeth")return;
   document.getElementById("districtsCard")?.click();
   document.querySelector('.map-pin[data-district="digbeth"]')?.click();
   launch.focus({preventScroll:true});
 }
 refresh();openHash();window.addEventListener("hashchange",openHash);
})();
