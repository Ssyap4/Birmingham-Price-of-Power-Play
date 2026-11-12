/* Keep the approved five-entry cabinet menu connected to existing game screens. */
document.addEventListener('DOMContentLoaded',()=>{
 const achievements=document.getElementById('storyStart');
 const dossier=document.getElementById('profileCard');
 if(achievements&&dossier)achievements.addEventListener('click',()=>dossier.click());
});

/* Never show blank illustrated buttons if the image pack has not been committed. */
document.addEventListener('DOMContentLoaded',async()=>{
 const home=document.getElementById('home');
 if(!home)return;
 const names=['scene','title','campaign','trials','achievements','dossier','settings'];
 const images=names.map(n=>'assets/cabinet/cabinet-'+n+'.webp');
 const ready=await Promise.all(images.map(src=>new Promise(resolve=>{
   const img=new Image();
   img.onload=()=>resolve(img.naturalWidth>100);
   img.onerror=()=>resolve(false);
   img.src=src;
 })));
 if(ready.every(Boolean))home.classList.add('cabinet-art-ready');
});


