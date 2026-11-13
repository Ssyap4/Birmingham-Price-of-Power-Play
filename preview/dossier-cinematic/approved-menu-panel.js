/* Use a real image only after it has fully decoded; retain text fallback otherwise. */
document.addEventListener('DOMContentLoaded',()=>{
 const home=document.getElementById('home');
 const button=document.getElementById('cabinetPlayerDossier');
 if(!home||!button)return;
 const img=new Image();
 img.onload=()=>{if(img.naturalWidth===984&&img.naturalHeight===183)home.classList.add('dossier-menu-art-loaded')};
 img.onerror=()=>home.classList.remove('dossier-menu-art-loaded');
 img.src='preview/dossier-cinematic/approved-my-dossier-menu-framed.webp';
});
