/* One portrait-first home scene. The DOM owns all six existing navigation buttons:
   no duplicate listeners, no save writes, no forced orientation or autoplay. */
(()=>{"use strict";
 const home=document.getElementById("home");
 if(!home||!home.classList.contains("cinema-home"))return;
 // Pause decorative effects when the menu isn't the visible screen or the page is hidden.
 const dock=home.querySelector("#cinemaAudioDock");
 const controls=document.querySelector("body > .bh-audio-controls");
 const sync=()=>{
  home.classList.toggle("cinema-still",!!home.hidden||document.hidden);
  if(!dock||!controls)return;
  const destination=home.hidden?document.body:dock;
  if(controls.parentElement!==destination)destination.append(controls);
 };
 const observer=new MutationObserver(sync);
 observer.observe(home,{attributes:true,attributeFilter:["hidden"]});
 document.addEventListener("visibilitychange",sync,{passive:true});
 sync();
})();
