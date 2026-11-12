/* Compact phone controls belong in normal document flow — never on top of story text. */
(()=>{'use strict';
 const caseScreen=document.getElementById('caseGame');
 const controls=document.querySelector('.bh-audio-controls');
 const top=caseScreen?.querySelector('.case-topline');
 if(!caseScreen||!controls||!top)return;
 const compact=window.matchMedia('(orientation: portrait) and (max-width: 700px), (orientation: landscape) and (max-height: 650px) and (max-width: 980px)');
 function arrange(){
  if(controls.closest('#cabinetSettingsDialog'))return;
  const inCase=controls.parentElement===caseScreen;
  const shouldDock=!caseScreen.hidden&&compact.matches;
  if(shouldDock&&!inCase)top.after(controls);
  else if(!shouldDock&&inCase)document.body.append(controls);
 }
 new MutationObserver(arrange).observe(caseScreen,{attributes:true,attributeFilter:['hidden']});
 window.addEventListener('resize',arrange,{passive:true});
 window.addEventListener('orientationchange',arrange,{passive:true});
 arrange();
})();