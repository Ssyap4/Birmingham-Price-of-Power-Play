/* Case tools: wheel over a fixed dialog scrolls the document, not a trapped inner pane.
   If the document cannot move, scroll the dialog itself (small screens). */
(()=>{'use strict';
const root=document.getElementById('caseGame');if(!root)return;
const overlay=root.querySelector('.case-v18-overlay');if(!overlay)return;
const dialog=overlay.querySelector('.v18-modal');if(!dialog)return;
function scrollWheel(event){
 if(overlay.hidden||root.hidden)return;
 if(event.ctrlKey||event.metaKey)return;
 const target=event.target;
 // Native select popups and keyboard interaction remain browser-managed.
 if(target.closest('select'))return;
 let delta=event.deltaY;
 if(event.deltaMode===1)delta*=20;
 else if(event.deltaMode===2)delta*=window.innerHeight;
 if(!delta)return;
 const page=document.scrollingElement||document.documentElement;
 const maxPage=Math.max(0,page.scrollHeight-page.clientHeight);
 const before=page.scrollTop;
 const after=Math.max(0,Math.min(maxPage,before+delta));
 if(Math.abs(after-before)>.5){event.preventDefault();event.stopImmediatePropagation();page.scrollTop=after;return;}
 const maxDialog=Math.max(0,dialog.scrollHeight-dialog.clientHeight);
 const next=Math.max(0,Math.min(maxDialog,dialog.scrollTop+delta));
 if(Math.abs(next-dialog.scrollTop)>.5){event.preventDefault();event.stopImmediatePropagation();dialog.scrollTop=next;}
}
overlay.addEventListener('wheel',scrollWheel,{passive:false,capture:true});
})();
