(()=>{'use strict';
const screen=document.getElementById('caseGame');if(!screen)return;
const SAVE=()=>'birmingham_case_smol_heath_v1_'+(window.BirminghamHero?.selectedId||'jack'),META=()=>'birmingham_case_v20_findings_'+(window.BirminghamHero?.selectedId||'jack');
const encounters=[
 {nodes:['interview','evelyn','warn'],who:'Эвелин Прайс',key:'Слова Артура',label:'Спросить о противоречии в записке Артура',answer:'Эвелин медленно перечитывает записку. «Артур никогда не писал лишнего. Если он оставил эти слова, значит, хотел, чтобы ты проверил их, а не просто поверил мне». Она просит не делать выводов без других свидетелей.'},
 {nodes:['reed','reedProof','pretend'],who:'Сержант Рид',key:'Две версии разговора',label:'Сопоставить показания Рида с услышанным',answer:'Рид смотрит на тебя дольше обычного. «Подслушанный разговор — не протокол», — отвечает он. Но отказывается объяснить, почему его имя прозвучало возле склада. Ты замечаешь, что вопрос попал в цель.'},
 {nodes:['confront','trade','pressure'],who:'Уолтер Крейн',key:'Деньги и двойной учёт',label:'Предъявить Крейну несоответствие в платежах',answer:'Крейн улыбается, но не берёт протянутые бумаги. «Цифры сами по себе никого не обвиняют». Он явно узнал суммы. Теперь понятно, что бухгалтерские записи для него опасны, хотя прямого признания ты не получил.'}
];
function saved(){try{return JSON.parse(localStorage.getItem(SAVE())||'null')}catch{return null}}
function findings(s){try{const f=JSON.parse(localStorage.getItem(META())||'null');return f&&f.started===s.started?f:null}catch{return null}}
function refresh(){if(screen.hidden)return;const s=saved();if(!s||!Array.isArray(s.items))return;const choices=document.getElementById('caseChoices');if(!choices)return;
 choices.querySelectorAll('.v20-interrogate').forEach(el=>el.remove());
 const f=findings(s);if(!f)return;
 for(const e of encounters){if(!e.nodes.includes(s.node)||!f.deductions?.includes(e.key)||f.reactions?.includes(e.key))continue;
 const btn=document.createElement('button');btn.type='button';btn.className='v20-interrogate';btn.textContent='✦ '+e.label;
 btn.addEventListener('click',()=>{const current=saved();if(!current||current.started!==s.started||current.node!==s.node)return;const fresh=findings(current);if(!fresh||fresh.reactions?.includes(e.key))return;fresh.reactions=[...new Set([...(fresh.reactions||[]),e.key])];try{localStorage.setItem(META(),JSON.stringify(fresh))}catch{return}
 const title=document.getElementById('v18ModalTitle'),content=document.getElementById('v18ModalContent'),overlay=screen.querySelector('.case-v18-overlay');if(title&&content&&overlay){title.textContent=e.who+' · новый вопрос';const p=document.createElement('p');p.textContent=e.answer;content.replaceChildren(p);overlay.hidden=false;overlay.querySelector('.v18-close')?.focus()}refresh()});choices.append(btn)
 }
}
// New findings can unlock a question without changing the scene title.
document.addEventListener('birmingham:case-findings-changed',({detail})=>{
 const s=saved();if(detail?.heroId===(window.BirminghamHero?.selectedId||'jack')&&detail.started===s?.started)refresh();
});
// A scene title changes only when the core game renders a different scene.
const title=document.getElementById('caseTitle');if(title)new MutationObserver(refresh).observe(title,{childList:true,characterData:true,subtree:true});
new MutationObserver(refresh).observe(screen,{attributes:true,attributeFilter:['hidden']});
refresh();
})();
