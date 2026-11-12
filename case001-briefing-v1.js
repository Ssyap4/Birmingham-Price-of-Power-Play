/* Case 001 briefing: one lightweight screen before a fresh investigation.
   No extra game mechanics; never blocks a saved investigation or replaces progress. */
(()=>{'use strict';
const STORAGE='birmingham_case001_briefing_seen_v1';
const root=document.createElement('div');
root.id='case001Briefing';root.className='case001-briefing';root.hidden=true;
root.innerHTML=`<div class="case001-briefing-panel" role="dialog" aria-modal="true" aria-labelledby="case001BriefingTitle">
 <header><small>АРХИВ ДЕЛ · ИНСТРУКТАЖ</small><h2 id="case001BriefingTitle">Перед началом расследования</h2><p>Дело №001 · «Долг, который не прощают»</p></header>
 <div class="case001-briefing-points">
  <section><span class="briefing-number">I</span><div><h3>Ищи и сопоставляй</h3><p>Осматривай места, собирай улики. В инвентаре выбери два предмета, чтобы проверить возможную связь.</p></div></section>
  <section><span class="briefing-number">II</span><div><h3>Решения имеют цену</h3><p>Разговоры, маршруты и действия влияют на расследование. Опасные варианты могут отнять здоровье.</p></div></section>
  <section><span class="briefing-number">III</span><div><h3>Шесть исходов</h3><p>Спасение, доказательства, сделка, разоблачение, власть или гибель. Не все пути доступны при одинаковых решениях.</p></div></section>
  <section><span class="briefing-number">IV</span><div><h3>Помни о попытке</h3><p>Прогресс сохраняется в браузере. Возврат к карте позволяет продолжить, а выход из игры во время незавершённого дела сбрасывает попытку.</p></div></section>
 </div>
 <div class="case001-briefing-footer"><label><input id="case001BriefingRemember" type="checkbox" checked> Не показывать перед следующей новой попыткой</label><div class="case001-briefing-actions"><button class="briefing-cancel" type="button">НАЗАД</button><button class="briefing-start" type="button">ВСЁ ПОНЯТНО · НАЧАТЬ →</button></div></div>
</div>`;
document.body.append(root);
const start=root.querySelector('.briefing-start'),cancel=root.querySelector('.briefing-cancel');
let onStart=null,returnFocus=null;
function close(){root.hidden=true;document.body.classList.remove('case001-briefing-open');const el=returnFocus;onStart=null;returnFocus=null;el?.focus?.();}
function open(callback,{force=false}={}){
 if(typeof callback!=='function')return;
 if(!force){try{if(localStorage.getItem(STORAGE)==='1'){callback();return}}catch{}}
 onStart=callback;returnFocus=document.activeElement;
 start.textContent=force?'ПОНЯТНО · К ВЫБОРУ':'ВСЁ ПОНЯТНО · НАЧАТЬ →';root.hidden=false;
 document.body.classList.add('case001-briefing-open');start.focus();
}
cancel.addEventListener('click',close);
start.addEventListener('click',()=>{
 const cb=onStart;
 try{if(root.querySelector('#case001BriefingRemember').checked)localStorage.setItem(STORAGE,'1');else localStorage.removeItem(STORAGE)}catch{}
 close();cb?.();
});
root.addEventListener('keydown',e=>{
 if(e.key==='Escape'){e.preventDefault();close();return}
 if(e.key!=='Tab')return;
 const focusable=[...root.querySelectorAll('button,input')];
 const i=focusable.indexOf(document.activeElement);
 if(e.shiftKey&&i===0){e.preventDefault();focusable.at(-1).focus()}
 else if(!e.shiftKey&&i===focusable.length-1){e.preventDefault();focusable[0].focus()}
});
window.BirminghamCaseRules={open,showAgain:()=>open(()=>{},{force:true})};
})();