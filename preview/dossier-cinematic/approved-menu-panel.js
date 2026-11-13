/* Show the approved illustrated fifth button only when its image has loaded. */
document.addEventListener('DOMContentLoaded',()=>{
 const home=document.getElementById('home');
 const button=document.getElementById('cabinetPlayerDossier');
 if(!home||!button)return;
 const image=new Image();
 image.onload=()=>{if(image.naturalWidth>=400)home.classList.add('dossier-menu-art-loaded')};
 image.onerror=()=>home.classList.remove('dossier-menu-art-loaded');
 image.src='preview/dossier-cinematic/approved-my-dossier-menu.webp';
});
