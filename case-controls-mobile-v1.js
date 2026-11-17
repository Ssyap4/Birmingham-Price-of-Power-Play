/* Compact phone controls belong in normal document flow — never on top of story text. */
(()=>{'use strict';
 const caseScreen=document.getElementById('caseGame');
 const controls=document.querySelector('.bh-audio-controls');
 const top=caseScreen?.querySelector('.case-topline');
 if(!caseScreen||!controls||!top)return;
 const portrait=window.matchMedia('(orientation: portrait) and (max-width: 700px)');
 const compact=window.matchMedia('(orientation: portrait) and (max-width: 700px), (orientation: landscape) and (max-height: 650px) and (max-width: 980px)');
 function arrange(){
  if(controls.closest('#cabinetSettingsDialog'))return;
  const inCase=controls.parentElement===caseScreen;
  const shouldDock=!caseScreen.hidden&&compact.matches;
  if(shouldDock){
   if(portrait.matches){
    if(!inCase||controls!==caseScreen.lastElementChild)caseScreen.append(controls);
   }else if(!inCase||top.nextElementSibling!==controls)top.after(controls);
  }else if(inCase)document.body.append(controls);
 }
 new MutationObserver(arrange).observe(caseScreen,{attributes:true,attributeFilter:['hidden']});
 window.addEventListener('resize',arrange,{passive:true});
 window.addEventListener('orientationchange',arrange,{passive:true});
 arrange();
})();
/* V32: retain the single shared player, but place it below trial content.
   The global Menu button remains the only exit during an active attempt. */
(()=>{'use strict';
 const controls=document.querySelector('.bh-audio-controls');
 const screens=['choose','play','result'].map(id=>document.getElementById(id)).filter(Boolean);
 if(!controls||screens.length!==3)return;
 const docks=screens.map(screen=>{const dock=document.createElement('div');dock.className='trial-audio-dock';dock.setAttribute('aria-label','Звук испытания');screen.append(dock);return dock});
 const sync=()=>{const index=screens.findIndex(screen=>!screen.hidden);if(index>=0){if(controls.parentElement!==docks[index])docks[index].append(controls)}else if(docks.includes(controls.parentElement)){document.body.append(controls)}};
 const queue=()=>queueMicrotask(sync);
 const observer=new MutationObserver(queue);screens.forEach(screen=>observer.observe(screen,{attributes:true,attributeFilter:['hidden']}));sync();
})();
