/* Use the actual visible viewport on mobile Safari and Telegram WebViews. */
(()=>{'use strict';
 const root=document.documentElement;let last='';
 function update(){
  const phone=/iPhone|iPod|Android|Mobile/i.test(navigator.userAgent)||
   (Math.min(innerWidth,innerHeight)<=700&&Math.max(innerWidth,innerHeight)<=1200);
  const landscape=matchMedia('(orientation:landscape)').matches&&innerHeight<=720;
  root.classList.toggle('bh-phone-landscape',phone&&landscape);
  const v=window.visualViewport;
  const h=Math.max(1,Math.min(innerHeight,v?.height||innerHeight));
  const next=h+'px';
  if(last!==next){root.style.setProperty('--bh-visible-height',next);last=next}
 }
 update();
 addEventListener('resize',update,{passive:true});
 addEventListener('orientationchange',update,{passive:true});
 window.visualViewport?.addEventListener('resize',update,{passive:true});
 document.addEventListener('visibilitychange',update,{passive:true});
})();
