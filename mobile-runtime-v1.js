/* Portrait-first mobile: no forced rotation and no blocking orientation overlay.
   Telegram Mini App expands without requesting a disruptive fullscreen mode. */
(()=>{'use strict';
 document.addEventListener('DOMContentLoaded',()=>{
  const tg=window.Telegram?.WebApp;
  const isTelegram=!!(tg && typeof tg.initData==='string' && tg.initData.length>0);
  document.getElementById('cabinetRotatePrompt')?.remove();
  if(!isTelegram)return;
  try{
   tg.ready?.();
   tg.expand?.();
   tg.setBackgroundColor?.('#10100e');
   tg.setHeaderColor?.('#10100e');
  }catch(e){console.warn('[mobile] Telegram initialization limited',e)}
 });
})();
/* V14: On the detective atlas, music controls live between the heading and map.
   This MOVES the one player, never creates a second player or changes saves.
   Other screens continue to use their existing docking and volume behavior. */
(()=>{'use strict';
 document.addEventListener('DOMContentLoaded',()=>{
  const map=document.getElementById('districts');
  const home=document.getElementById('home');
  const controls=document.querySelector('.bh-audio-controls');
  if(!map||!controls||!home)return;
  const anchor=map.querySelector('.campaign-portal-v13')||map.querySelector('.districts-heading');
  if(!anchor)return;
  const dock=document.createElement('div');
  dock.id='districtAudioDock';
  dock.setAttribute('aria-label','Звук на карте детективных дел');
  anchor.after(dock);
  function sync(){
   if(!map.hidden){
    if(controls.parentElement!==dock)dock.append(controls);
   }else if(controls.parentElement===dock){
    const homeDock=!home.hidden?home.querySelector('#cinemaAudioDock'):null;
    (homeDock||document.body).append(controls);
   }
  }
  // By the next microtask all legacy screen visibility mutations are settled.
  const queue=()=>queueMicrotask(sync);
  new MutationObserver(queue).observe(map,{attributes:true,attributeFilter:['hidden']});
  new MutationObserver(queue).observe(home,{attributes:true,attributeFilter:['hidden']});
  sync();
 });
})();