/* Case 001 mobile evidence acknowledgement: presentation only, never modifies saves. */
(()=>{
 'use strict';
 const game=document.getElementById('caseGame');
 const inventory=document.getElementById('caseInventory');
 if(!game||!inventory)return;
 const names={envelope:'Конверт D-17',key:'Ключ №17',invoice:'Копия накладной',receipt:'Квитанция',route:'Маршрут станции',ledger:'Двойная ведомость',testimony:'Слова Рида',note:'Записка Артура',witness:'Показания Эвелин',ash:'Обгоревший лист',overheard:'Подслушанный разговор'};
 let session='',previous=new Set(),timer;
 const notice=document.createElement('div');
 notice.className='bh-mobile-find-notice';
 notice.hidden=true;
 notice.setAttribute('role','status');
 notice.setAttribute('aria-live','polite');
 const label=document.createElement('div');
 label.className='bh-mobile-find-copy';
 const action=document.createElement('button');
 action.type='button';
 action.textContent='ОТКРЫТЬ УЛИКИ';
 action.addEventListener('click',()=>{
   notice.hidden=true;
   document.querySelector('.v34-open-inventory')?.click();
 });
 notice.append(label,action);
 document.body.append(notice);
 function snapshot(){
   const ids=new Set(Array.from(inventory.querySelectorAll('[data-evidence-id]'),e=>e.dataset.evidenceId).filter(Boolean));
   const hero=window.BirminghamHero?.selectedId||'jack';
   let started='';
   try{started=JSON.parse(localStorage.getItem('birmingham_case_smol_heath_v1_'+hero)||'null')?.started||''}catch{}
   const key=hero+':'+started;
   if(game.hidden||!started||key!==session){
     session=key;previous=ids;
     notice.hidden=true;
     return;
   }
   const added=[...ids].filter(id=>!previous.has(id));
   previous=ids;
   if(!added.length)return;
   label.replaceChildren();
   const kicker=document.createElement('small');kicker.textContent='✦ НОВАЯ УЛИКА · '+ids.size+' / 11';
   const title=document.createElement('strong');
   title.textContent=added.map(id=>names[id]||id).join(' · ');
   label.append(kicker,title);
   notice.hidden=false;
   clearTimeout(timer);
   timer=setTimeout(()=>{notice.hidden=true},6500);
 }
 new MutationObserver(snapshot).observe(inventory,{childList:true,subtree:true});
 snapshot();
})();
