/* iOS/Android-first landscape shell. Orientation is requested, never simulated by CSS rotation. */
(()=>{'use strict';
document.addEventListener('DOMContentLoaded',()=>{
 const tg=window.Telegram?.WebApp;
 const isTelegram=!!(tg&&typeof tg.initData==='string'&&tg.initData.length>0);
 const isTouch=()=>window.matchMedia('(pointer:coarse)').matches;
 const isPortrait=()=>window.matchMedia('(orientation:portrait)').matches;
 const prompt=document.createElement('div');
 prompt.id='cabinetRotatePrompt';prompt.hidden=true;
 prompt.setAttribute('role','status');prompt.setAttribute('aria-live','polite');
 prompt.innerHTML='<div class="cabinet-rotate-symbol" aria-hidden="true">↻</div><strong>ПОВЕРНИТЕ ТЕЛЕФОН</strong><p>«Бирмингем: Цена власти» создан для горизонтального экрана. После поворота все кнопки и расследования будут доступны.</p><button type="button" class="bh-landscape-request">ПОПРОБОВАТЬ ПОЛНЫЙ ЭКРАН</button><small>Если экран не повернулся сам, разрешите автоповорот в настройках телефона.</small>';
 document.body.append(prompt);
 let lockedInTelegram=false;
 const tgVersion8=()=>isTelegram&&!!tg.isVersionAtLeast?.('8.0');
 function lockTelegramLandscape(){
  if(!tgVersion8()||lockedInTelegram||isPortrait())return;
  try{tg.lockOrientation?.();lockedInTelegram=true}catch(e){console.warn('[mobile] Telegram orientation lock unavailable',e)}
 }
 function refresh(){
  prompt.hidden=!(isTouch()&&isPortrait()&&window.innerWidth<=900);
  if(isTelegram&&!isPortrait())lockTelegramLandscape();
 }
 async function fullscreenAndLandscape(){
  if(isTelegram){try{tg.expand?.();if(tgVersion8())tg.requestFullscreen?.()}catch(e){console.warn('[mobile] Telegram fullscreen unavailable',e)}}
  else{try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen()}catch(e){console.info('[mobile] Browser fullscreen unavailable')}}
  try{if(screen.orientation&&typeof screen.orientation.lock==='function')await screen.orientation.lock('landscape')}catch(e){console.info('[mobile] Manual device rotation required')}
  refresh();
 }
 prompt.querySelector('.bh-landscape-request').addEventListener('click',fullscreenAndLandscape);
 if(isTelegram){
  try{tg.ready?.();tg.expand?.();tg.setBackgroundColor?.('#10100e');if(tgVersion8())tg.requestFullscreen?.()}catch(e){console.warn('[mobile] Telegram initialization limited',e)}
  for(const event of ['viewportChanged','fullscreenChanged','safeAreaChanged','contentSafeAreaChanged'])try{tg.onEvent?.(event,refresh)}catch{}
 }
 refresh();
 window.addEventListener('resize',refresh,{passive:true});
 window.addEventListener('orientationchange',refresh,{passive:true});
 // Browsers often require a user gesture to lock an already-fullscreen PWA.
 document.addEventListener('pointerdown',()=>{if(isTouch()&&!isTelegram&&!isPortrait()&&document.fullscreenElement){try{const p=screen.orientation?.lock?.('landscape');p?.catch?.(()=>{})}catch{}}},{once:true,passive:true});
});
})();