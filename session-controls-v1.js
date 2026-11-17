/* V37: ordinary exit never deletes a save. The legacy discard action is
 * retained as a separate, explicitly named Case001 control. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),game=$('caseGame');
 const btn=document.createElement('button');btn.type='button';btn.id='gameExitBtn';btn.textContent='⏻ В МЕНЮ';
 btn.setAttribute('aria-label','Вернуться в главное меню с сохранением записанного прогресса');
 (document.querySelector('.bh-audio-controls')||document.body).append(btn);
 btn.addEventListener('click',()=>{
  if(!$('home')?.hidden)return;
  // Criminal and trial screens use their own guarded navigation handlers.
  if(!$('criminalScreen')?.hidden||!$('play')?.hidden){$('homeBtn')?.click();return}
  if(!confirm('Вернуться на главную? Сохранённые расследования и награды останутся.'))return;
  $('homeBtn')?.click();
 });
 if(!game)return;
 const discard=document.createElement('button');discard.id='caseDiscardBtn';discard.className='case-secondary';discard.type='button';discard.textContent='Сбросить попытку и выйти';discard.hidden=true;
 $('caseRestart')?.after(discard);
 const read=()=>{
  try{
   const hero=window.BirminghamHero?.selectedId||'jack';
   if(!window.BirminghamCase?.hasProgress?.(hero))return null;
   const key='birmingham_case_smol_heath_v1_'+hero,meta='birmingham_case_v20_findings_'+hero;
   const raw=localStorage.getItem(key),state=JSON.parse(raw);
   if(!state||!Number.isFinite(state.started))return null;
   return {hero,key,meta,raw,state};
  }catch{return null}
 };
 function paint(){discard.hidden=game.hidden||!read()}
 discard.addEventListener('click',()=>{
  const current=read();if(!current||game.hidden)return;
  if(!confirm('Удалить незавершённую попытку этого героя и выйти? Улики и выводы этой попытки будут сброшены. Архив наград и другие герои останутся.'))return;
  try{
   if(localStorage.getItem(current.key)!==current.raw)throw Error('Сохранение изменилось в другой вкладке.');
   const metaRaw=localStorage.getItem(current.meta);
   // Invalid or unrelated metadata is never deleted.
   let meta=null;try{meta=JSON.parse(metaRaw)}catch{}
   localStorage.removeItem(current.key);
   if(localStorage.getItem(current.key)!==null)throw Error('Браузер не подтвердил удаление.');
   if(meta?.started===current.state.started&&localStorage.getItem(current.meta)===metaRaw){
    try{localStorage.removeItem(current.meta)}catch{}
   }
  }catch(e){alert('Сброс не подтверждён. '+e.message);return}
  $('homeBtn')?.click();
 });
 new MutationObserver(paint).observe(game,{attributes:true,attributeFilter:['hidden']});
 const title=$('caseTitle');if(title)new MutationObserver(paint).observe(title,{childList:true,subtree:true,characterData:true});
 window.addEventListener('storage',paint);paint();
})();