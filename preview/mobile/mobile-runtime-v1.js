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