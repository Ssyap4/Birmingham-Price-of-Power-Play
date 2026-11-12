/* Case 001: viewport-anchored mobile feedback, sequential and non-blocking. */
(()=>{
'use strict';
const game=document.getElementById('caseGame'), inventory=document.getElementById('caseInventory');
if(!game||!inventory)return;
const names={envelope:'Конверт D-17',key:'Ключ №17',invoice:'Копия накладной',receipt:'Квитанция',route:'Маршрут станции',ledger:'Двойная ведомость',testimony:'Слова Рида',note:'Записка Артура',witness:'Показания Эвелин',ash:'Обгоревший лист',overheard:'Подслушанный разговор'};
const media=window.matchMedia('(max-width:700px)');
const panel=document.createElement('div');
panel.id='bh-feedback-stage';
panel.hidden=true;
panel.setAttribute('role','region');
panel.setAttribute('aria-label','Уведомления расследования');
panel.setAttribute('aria-live','polite');
document.body.append(panel);
const queue=[];let active=null,hideTimer=null,session='',prior=new Set(),initialized=false;
const modalActive=()=>!document.querySelector('.v33-shade:not([hidden]),.hero-selection:not([hidden]),.case-v18-overlay:not([hidden])');
function dismiss(){
 clearTimeout(hideTimer);hideTimer=null;
 panel.replaceChildren();panel.hidden=true;active=null;
 next();
}
function next(){
 if(active||!queue.length||!media.matches||modalActive())return;
 active=queue.shift();
 const card=document.createElement('section');
 card.className='bh-feedback-card bh-feedback-'+active.type;
 const head=document.createElement('div');head.className='bh-feedback-head';
 const symbol=document.createElement('span');symbol.className='bh-feedback-symbol';symbol.textContent=active.type==='achievement'?'✦':'▤';
 const copy=document.createElement('div');copy.className='bh-feedback-copy';
 const eyebrow=document.createElement('small');eyebrow.textContent=active.type==='achievement'?'ДОСТИЖЕНИЕ ОТКРЫТО':'НОВАЯ УЛИКА · '+active.count+' / 11';
 const title=document.createElement('strong');title.textContent=active.title;
 copy.append(eyebrow,title);
 if(active.subtitle){const sub=document.createElement('p');sub.textContent=active.subtitle;copy.append(sub)}
 if(active.type==='clue'&&active.evidenceId){const photo=document.createElement('img');photo.className='bh-feedback-evidence-photo';photo.alt='';photo.src='assets/evidence-cinematic/'+active.evidenceId+'.webp';photo.onerror=()=>{photo.onerror=null;photo.src='assets/case-v17/icon-'+active.evidenceId+'.svg'};head.append(photo,copy)}else head.append(symbol,copy);
 const close=document.createElement('button');close.type='button';close.className='bh-feedback-dismiss';close.setAttribute('aria-label','Закрыть уведомление');close.textContent='×';close.onclick=dismiss;
 card.append(head,close);
 if(active.type==='clue'){
   const actions=document.createElement('div');actions.className='bh-feedback-actions';
   const open=document.createElement('button');open.type='button';open.textContent='ОТКРЫТЬ ИНВЕНТАРЬ';
   open.onclick=()=>{document.querySelector('.v34-open-inventory')?.click();dismiss()};
   actions.append(open);card.append(actions);
 }
 panel.replaceChildren(card);panel.hidden=false;
 hideTimer=setTimeout(dismiss,active.type==='achievement'?5200:6500);
}
function enqueue(item){
 if(!media.matches)return;
 queue.push(item);next();
}
function snapshot(){
 const ids=new Set([...inventory.querySelectorAll('[data-evidence-id]')].map(n=>n.dataset.evidenceId).filter(Boolean));
 const hero=window.BirminghamHero?.selectedId||'jack';
 let data=null;try{data=JSON.parse(localStorage.getItem('birmingham_case_smol_heath_v1_'+hero)||'null')}catch{}
 const key=hero+':'+(data?.started||'');
 // On loading or resuming a hero, existing clues must never be presented as new.
 if(game.hidden||!data?.started||session!==key||!initialized){
   session=key;prior=ids;initialized=true;return;
 }
 const gained=[...ids].filter(id=>!prior.has(id));prior=ids;
 if(gained.length)enqueue({type:'clue',title:gained.map(id=>names[id]||id).join(' · '),subtitle:'Добавлено в инвентарь расследования',count:ids.size,evidenceId:gained[0]});
}
new MutationObserver(snapshot).observe(inventory,{childList:true,subtree:true});
new MutationObserver(snapshot).observe(game,{attributes:true,attributeFilter:['hidden']});
snapshot();
// The existing achievements engine remains the only award authority.
// Mirror only its *new* unlock popups on mobile; no save edits and no repeated awards.
const tray=document.querySelector('.campaign-unlock-tray');
if(tray){
 const seen=new WeakSet();
 const onAward=()=>{
  for(const card of tray.querySelectorAll('.campaign-unlock-popup')){
   if(seen.has(card))continue;seen.add(card);
   const title=card.querySelector('strong')?.textContent?.trim();
   const group=card.querySelector('small')?.textContent?.trim();
   if(title)enqueue({type:'achievement',title,subtitle:group||'Сохранено в достижениях'});
  }
 };
 new MutationObserver(onAward).observe(tray,{childList:true,subtree:true});onAward();
}
const observer=new MutationObserver(()=>{if(queue.length&&!active)next()});
observer.observe(document.body,{subtree:false,childList:true});
document.addEventListener('click',()=>{if(queue.length&&!active)setTimeout(next,30)},true);
media.addEventListener?.('change',()=>{if(!media.matches){queue.length=0;if(active)dismiss()}else next()});
})();
