/* Settings are local to the cabinet; no server or Telegram dependency. */
document.addEventListener('DOMContentLoaded',()=>{
 const button=document.getElementById('cabinetSettings');
 const dialog=document.getElementById('cabinetSettingsDialog');
 const toggle=document.getElementById('cabinetReduceMotion');
 if(!button||!dialog||!toggle)return;
 try{toggle.checked=localStorage.getItem('birmingham-reduce-motion')==='true';}catch(_e){}
 document.documentElement.classList.toggle('cabinet-reduced-motion',toggle.checked);
 button.addEventListener('click',()=>{const audio=document.querySelector('.bh-audio-controls');if(audio)dialog.querySelector('form')?.append(audio);if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');});
 dialog.addEventListener('close',()=>{const audio=dialog.querySelector('.bh-audio-controls');if(audio)document.body.append(audio);});
 toggle.addEventListener('change',()=>{
   document.documentElement.classList.toggle('cabinet-reduced-motion',toggle.checked);
   try{localStorage.setItem('birmingham-reduce-motion',String(toggle.checked));}catch(_e){}
 });
});
