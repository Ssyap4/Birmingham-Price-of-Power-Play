/* Exact scene-to-chapter artwork: all 37 Case 001 beats, no changes to story. */
(()=>{'use strict';
 const root=document.getElementById('caseGame'),side=root?.querySelector('.v18-case-art'),scene=document.getElementById('caseArt');
 if(!root||!side||!scene)return;
 const chapters=[
 {file:'intro.webp',label:'Тревожный визит'},
 {file:'office-approved.webp',label:'Следы в конторе'},
 {file:'canal-approved.webp',label:'Склад Дигбета'},
 {file:'reed.webp',label:'Полиция и интересы'},
 {file:'pump.webp',label:'Развязка'}
 ];
 const groups=[["intro"],["envelope","widow-home","interview-kitchen","office-approved","searchOffice"],["canal-approved","bribe","d17-sneak","d17-unlock","d17-warehouse","listen","heroJack","heroFinn","heroEleanor","heroVictor","heroSamuel"],["reed","reedProof","accuse","pretend","confession","escort","evelyn-warning"],["pump","yard","rescue","confront","trade","expose","pressure","endingRescue-approved","endingEvidence","endingDeal-approved","endingTruth","endingPower-approved","endingDeath"]];
 const indexByArt=new Map(groups.flatMap((list,index)=>list.map(name=>[name,index])));
 function refresh(){
  const match=(scene.style.backgroundImage||'').match(/case-scenes\/([^/)"']+)\.webp/);
  if(!match)return;
  const idx=indexByArt.get(match[1]);
  if(idx===undefined){console.warn('[Case 001] Unmapped chapter art:',match[1]);return;}
  const selected=chapters[idx];
  if(side.dataset.chapterImage!==selected.file){
   // Legacy release CSS used !important on the sidebar image. The active scene always wins.
   side.style.setProperty('background-image','linear-gradient(0deg,rgba(0,0,0,.5),rgba(0,0,0,.08)),url("assets/case-scenes/'+selected.file+'")','important');
   side.dataset.chapterImage=selected.file;
   side.setAttribute('role','img');side.setAttribute('aria-label',selected.label);
  }
  root.querySelectorAll('.v18-chapters li').forEach((li,n)=>{
   li.classList.toggle('active',n===idx);li.classList.toggle('complete',n<idx);
   if(n===idx)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');
  });
 }
 new MutationObserver(refresh).observe(scene,{attributes:true,attributeFilter:['style']});
 refresh();
})();