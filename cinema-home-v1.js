/* One portrait-first home scene. The DOM owns all six existing navigation buttons:
   no duplicate listeners, no save writes, no forced orientation or autoplay. */
(()=>{"use strict";
 const home=document.getElementById("home");
 if(!home||!home.classList.contains("cinema-home"))return;
 // Pause decorative effects when the menu isn't the visible screen or the page is hidden.
 const dock=home.querySelector("#cinemaAudioDock");
 const controls=document.querySelector("body > .bh-audio-controls");
 const hero=home.querySelector(".cinema-hero");
 let heroVisible=true;
 // Map the approved 720×900 photograph's coordinates through the exact
 // background-size:cover and background-position:50% 54% transform.
 // ResizeObserver also covers iPhone browser chrome / Telegram viewport changes.
 let lastGeometry="";
 const syncCabinetGeometry=()=>{
  if(!hero||home.hidden)return;
  const {width,height}=hero.getBoundingClientRect();
  if(width<=0||height<=0)return;
  const key=width+":"+height;
  if(key===lastGeometry)return;
  lastGeometry=key;
  const scale=Math.max(width/720,height/900);
  hero.style.setProperty("--cabinet-scale",String(scale));
  hero.style.setProperty("--cabinet-x",((width-720*scale)*.5)+"px");
  hero.style.setProperty("--cabinet-y",((height-900*scale)*.54)+"px");
 };
 if(hero&&"ResizeObserver" in window){
  const geometryObserver=new ResizeObserver(syncCabinetGeometry);
  geometryObserver.observe(hero);
 }else window.addEventListener("resize",syncCabinetGeometry,{passive:true});
 const syncMotion=()=>home.classList.toggle("cinema-still",!!home.hidden||document.hidden||!heroVisible);
 const sync=()=>{
  syncMotion();
  syncCabinetGeometry();
  if(!dock||!controls)return;
  // The district observer owns its dock. Never pull controls out of
  // that dock on visibilitychange, or move them twice during navigation.
  if(home.hidden){
   if(controls.parentElement===dock)document.body.append(controls);
  }else if(controls.parentElement!==dock){
   dock.append(controls);
  }
 };
 const observer=new MutationObserver(sync);
 observer.observe(home,{attributes:true,attributeFilter:["hidden"]});
 document.addEventListener("visibilitychange",sync,{passive:true});
 // No scroll listener: suspend the five decorative layers when off screen.
 if(hero&&"IntersectionObserver" in window){
  const visibility=new IntersectionObserver(entries=>{
   heroVisible=entries[0].isIntersecting;
   syncMotion();
  });
  visibility.observe(hero);
 }
 sync();
})();
