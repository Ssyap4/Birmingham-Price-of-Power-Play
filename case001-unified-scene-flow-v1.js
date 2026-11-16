/* Case 001 presentation only: protagonist identity and reading order from
   Case 002. Story nodes, approved art, saves and award rules are untouched. */
(()=>{
 "use strict";
 const scene=document.getElementById("caseScene");
 const inner=scene?.querySelector(".case-scene-inner");
 const art=document.getElementById("caseArt");
 const place=document.getElementById("casePlace");
 const title=document.getElementById("caseTitle");
 const portrait=art?.querySelector(".case001-portrait-image");
 if(!scene||!inner||!art||!place||!title||!portrait)return;
 const heroRow=document.createElement("div");
 heroRow.className="case001-scene-hero";
 const heroImage=document.createElement("img");
 heroImage.alt="";heroImage.decoding="async";heroImage.loading="eager";
 heroImage.setAttribute("aria-hidden","true");
 const heroInfo=document.createElement("div");
 heroInfo.className="case001-scene-hero-info";
 const kicker=document.createElement("span");
 kicker.className="case001-hero-kicker";
 kicker.textContent="ЧЕЛОВЕК БЛИЖНЕГО КРУГА";
 const name=document.createElement("span");
 name.className="case001-hero-name";
 heroInfo.append(kicker,place,title,name);
 heroRow.append(heroImage,heroInfo);
 inner.prepend(heroRow);
 const caption=document.createElement("div");
 caption.className="case001-art-caption";
 const captionId=document.createElement("span");
 captionId.textContent="ДЕЛО №001 · КАДР";
 const captionPlace=document.createElement("span");
 caption.append(captionId,captionPlace);
 art.append(caption);
 const heroes=new Set(["jack","finn","eleanor","victor","samuel"]);
 let lastHero="";
 function refresh(){
  const id=window.BirminghamHero?.selectedId||"jack";
  const hero=heroes.has(id)?id:"jack";
  const data=window.BirminghamHero?.heroes?.find(h=>h.id===hero);
  if(hero!==lastHero){
   lastHero=hero;
   heroImage.src="assets/heroes/"+hero+".webp";
  }
  name.textContent=data?.name||"Участник ближнего круга";
  captionPlace.textContent=(place.textContent.trim()||"Бирмингем · 1920").toLocaleUpperCase("ru-RU");
 }
 new MutationObserver(refresh).observe(place,{childList:true,characterData:true,subtree:true});
 new MutationObserver(refresh).observe(scene,{attributes:true,attributeFilter:["hidden"]});
 refresh();
 /* First-scene facts only, shown before hero cards like the Case 002
    synopsis; this is not a new story beat or an alternate briefing. */
 const selection=document.getElementById("heroSelection");
 const cards=selection?.querySelector(".hero-cards");
 if(cards){
  const eyebrow=selection.querySelector(".hero-eyebrow");
  if(eyebrow)eyebrow.textContent="БЛИЖНИЙ КРУГ · ВЫБОР ГЕРОЯ";
  const premise=document.createElement("section");
  premise.className="case001-unified-premise";
  premise.setAttribute("aria-label","Краткое содержание Дела №001");
  const label=document.createElement("strong");
  label.textContent="СМОЛЛ-ХИТ · ДЕЛО №001 · БЕЗ СПОЙЛЕРОВ";
  const text=document.createElement("p");
  text.textContent="Исчез счетовод Артур Прайс. Его жена получила угрозу, а вместе с ним пропала долговая книга. Выберите человека ближнего круга, который возьмётся за расследование.";
  premise.append(label,text);
  cards.before(premise);
 }
})();
