/* Campaign archive v1: case/hero/ending-aware local progression, no server claims. */
(()=>{'use strict';
const CASE_ID='001', CASE_TITLE='Долг, который не прощают', RECORD_KEY='birmingham_campaign_records_v1', AWARD_KEY='birmingham_campaign_awards_v1', UNIQUE_KEY='birmingham_campaign_unique_rewards_v1';
const HEROES=()=>window.BirminghamHero?.heroes||[], ENDINGS={
 endingRescue:'Человек важнее бумаг',endingEvidence:'Цена доказательств',endingDeal:'Договор с тенью',
 endingTruth:'Город узнает правду',endingPower:'Власть в твоих руках',endingDeath:'Последняя ошибка'};
const readJSON=(k,fallback)=>{try{const x=JSON.parse(localStorage.getItem(k)||'null');return x??fallback}catch{return fallback}};
const put=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){console.warn('[campaign] Local archive unavailable',e)}};
function state(hero){const s=readJSON('birmingham_case_smol_heath_v1_'+hero,null);return s&&Array.isArray(s.items)&&Array.isArray(s.trail)&&typeof s.started==='number'?s:null}
function findings(hero,s){const f=readJSON('birmingham_case_v20_findings_'+hero,null);return f&&f.started===s?.started&&Array.isArray(f.deductions)?f.deductions:[]}
function records(){const a=readJSON(RECORD_KEY,[]);return Array.isArray(a)?a.filter(x=>x&&x.caseId&&x.heroId&&x.ending&&x.key):[]}
function persistFinished(){
 let runs=records(),dirty=false;
 for(const hero of HEROES()){
  const s=state(hero.id);if(!s||!Object.prototype.hasOwnProperty.call(ENDINGS,s.node))continue;
  const key=[CASE_ID,hero.id,s.started,s.node].join(':');
  if(runs.some(r=>r.key===key))continue;
  const rec={key,caseId:CASE_ID,caseTitle:CASE_TITLE,heroId:hero.id,started:s.started,finished:Date.now(),
   ending:s.node,items:[...new Set(s.items)],deductions:[...new Set(findings(hero.id,s))],
   visited:[...new Set(s.trail)],health:Math.max(0,Number(s.health)||0),cause:s.deathCause||''};
  runs.push(rec);dirty=true;
 }
 if(dirty)put(RECORD_KEY,runs);
 uniqueRewards(runs);
 return runs;
}
function uniqueRewards(runs){
 let rewards=readJSON(UNIQUE_KEY,{});
 if(!rewards||typeof rewards!=='object'||Array.isArray(rewards))rewards={};
 let changed=false;
 for(const r of runs){
  if(r.caseId!==CASE_ID||!HEROES().some(h=>h.id===r.heroId)||!Object.prototype.hasOwnProperty.call(ENDINGS,r.ending))continue;
  const key=[r.caseId,r.heroId,r.ending].join(':');
  if(!rewards[key]){rewards[key]=r.finished||Date.now();changed=true}
 }
 if(changed)put(UNIQUE_KEY,rewards);
 return rewards;
}
const screens=[
 ['campaignDossiers','Досье персонажей','ПЯТЬ ПУТЕЙ · ОДИН ГОРОД'],
 ['campaignAchievements','Достижения и награды','АРХИВ СВЕРШЕНИЙ'],
 ['campaignHistory','История прохождений','АРХИВ ДЕЛ']
];
const main=document.querySelector('main');if(!main)return;
for(const [id,title,kicker] of screens){const section=document.createElement('section');section.id=id;section.className='screen campaign-hub';section.hidden=true;section.innerHTML='<div class="campaign-head"><small></small><h2></h2><p>Дело №001 · '+CASE_TITLE+'. Другие дела будут пополнять этот архив.</p></div><div class="campaign-content"></div><button class="campaign-return" type="button">← В ГЛАВНОЕ МЕНЮ</button>';section.querySelector('small').textContent=kicker;section.querySelector('h2').textContent=title;const tabs=document.createElement('nav');tabs.className='campaign-tabs';tabs.setAttribute('aria-label','Разделы архива');for(const [target,label] of [['campaignDossiers','ПЕРСОНАЖИ'],['campaignAchievements','ДОСТИЖЕНИЯ'],['campaignHistory','ПРОХОЖДЕНИЯ']]){const button=document.createElement('button');button.type='button';button.dataset.openSection=target;button.textContent=label;button.setAttribute('aria-current',String(target===id));tabs.append(button)}section.querySelector('.campaign-head').after(tabs);main.append(section);section.querySelector('.campaign-return').onclick=()=>open('home')}
const $=id=>document.getElementById(id),allScreens=()=>document.querySelectorAll('.screen');
function open(id){if(id==='campaignHistory'||id==='campaignAchievements'||id==='campaignDossiers'){render(id)}allScreens().forEach(s=>s.hidden=s.id!==id);const top=$('homeBtn');if(top)top.hidden=id==='home';window.scrollTo(0,0)}
document.addEventListener('click',e=>{
 const target=e.target.closest('#storyStart,#profileCard');
 if(!target)return;
 e.preventDefault();e.stopImmediatePropagation();
 open(target.id==='storyStart'?'campaignAchievements':'campaignDossiers');
},true);
for(const id of ['campaignDossiers','campaignAchievements','campaignHistory'])$(id).addEventListener('click',e=>{if(e.target.closest('[data-open-section]'))open(e.target.closest('[data-open-section]').dataset.openSection)});
$('homeBtn')?.addEventListener('click',()=>{screens.forEach(([id])=>$(id).hidden=true)},true);
// Legacy quiz achievements/history live only in the old quiz data; do not mislabel them as campaign awards.
for(const id of ['achievementList','dossierHistory','levelRecords']){const el=$(id);if(el){const parent=el.closest('.profile-section');if(parent)parent.hidden=true}}
const profile=$('profile');if(profile){const link=document.createElement('div');link.className='campaign-profile-links';link.innerHTML='<button type="button" data-open-section="campaignDossiers">ДОСЬЕ ПЯТИ ГЕРОЕВ</button><button type="button" data-open-section="campaignAchievements">ДОСТИЖЕНИЯ</button><button type="button" data-open-section="campaignHistory">ИСТОРИЯ ДЕЛ</button>';profile.append(link);link.addEventListener('click',e=>{const b=e.target.closest('button');if(b)open(b.dataset.openSection)})}
function make(tag,cls,txt){const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el}
function stat(run){return ENDINGS[run.ending]||run.ending}
function renderDossiers(el,runs){
 const intro=make('p','campaign-intro','За каждым детективом сохраняется отдельный путь в каждом деле. Повторное получение уже открытой концовки не создаёт новую награду.');el.append(intro);
 const grid=make('div','campaign-grid');
 for(const hero of HEROES()){
  const own=runs.filter(x=>x.heroId===hero.id&&x.caseId===CASE_ID), s=state(hero.id);
  const unique=[...new Set(own.map(x=>x.ending))],card=make('article','campaign-card');
  const image=make('img','campaign-portrait');image.src='assets/heroes/'+hero.id+'.webp';image.alt='Портрет: '+hero.name;image.loading='lazy';card.append(image);
  const body=make('div','campaign-card-body');body.append(make('small','campaign-eyebrow',hero.alias+' · '+hero.role),make('h3','',hero.name),make('p','',hero.trait));
  body.append(make('p','campaign-count','Дело №001: '+own.length+' прохождений · '+unique.length+' / 6 разных концовок'));
  if(s&&!Object.prototype.hasOwnProperty.call(ENDINGS,s.node))body.append(make('p','campaign-live','Продолжается: '+s.node+' · найдено '+s.items.length+' улик'));
  const tags=make('div','campaign-tags');for(const [id,name] of Object.entries(ENDINGS)){const t=make('span',unique.includes(id)?'earned':'locked',(unique.includes(id)?'✦ ':'◇ ')+name);tags.append(t)}body.append(tags);
  body.append(make('p','campaign-future','Следующие сюжетные и побочные дела появятся здесь после их выпуска.'));card.append(body);grid.append(card);
 }el.append(grid);
}
/* Curated Case 001 achievements: no free entry or one-clue rewards.
   Unique hero × ending seals remain in their independent 30-item archive. */
const ACH=[
 ['clue9','Внимательный сыщик','Собрать девять улик в одной попытке','Расследование',c=>c.maxClues>=9],
 ['clue11','Ни одна деталь','Собрать все 11 улик в одной попытке','Расследование',c=>c.maxClues>=11],
 ['deduce3','Три нити','Установить три доказательные связи в одной попытке','Дедукция',c=>c.maxLinks>=3],
 ['deduce6','Целая картина','Установить все шесть связей в одной попытке','Дедукция',c=>c.maxLinks>=6],
 ['end2','На распутье','Открыть две разных концовки','Разные исходы',c=>c.endings.size>=2],
 ['end4','Цена выбора','Открыть четыре разных концовки','Разные исходы',c=>c.endings.size>=4],
 ['end6','Шесть судеб','Открыть все шесть концовок','Разные исходы',c=>c.endings.size>=6],
 ['hero3','Три судьбы','Завершить дело тремя разными героями','Персонажи',c=>c.heroes.size>=3],
 ['hero5','Ближний круг','Завершить дело всеми пятью героями','Персонажи',c=>c.heroes.size>=5],
 ['combos5','Пять уникальных путей','Получить пять уникальных сочетаний героя и концовки','Мастерство',c=>c.combos.size>=5],
 ['combos15','Пятнадцать путей','Получить 15 уникальных сочетаний героя и концовки','Мастерство',c=>c.combos.size>=15],
 ['combos30','Хозяин всех исходов','Открыть все 30 сочетаний героя и концовки','Мастерство',c=>c.combos.size>=30,true],
 ['unbroken','Ни царапины','Завершить дело живым со 100 HP','Выживание',c=>c.runs.some(r=>r.ending!=='endingDeath'&&r.health===100)],
 ['lastBreath','Последний вздох','Выжить и завершить дело с 30 HP или меньше','Выживание',c=>c.runs.some(r=>r.ending!=='endingDeath'&&r.health>0&&r.health<=30),true],
 ['paperTrail','Тайная бухгалтерия','Осмотреть кабинет и заднюю комнату в одной попытке','Скрытые пути',c=>c.runs.some(r=>r.visited?.includes('office')&&r.visited?.includes('searchOffice'))],
 ['nightRoute','Ночной маршрут','Посетить склад и насосную станцию за одну попытку','Скрытые пути',c=>c.runs.some(r=>r.visited?.includes('warehouse')&&r.visited?.includes('pump'))],
 ['reedSecret','Две стороны значка','Найти доказательство против сержанта Рида','Скрытые пути',c=>c.runs.some(r=>r.visited?.includes('reedProof'))],
 ['allPaths','Пять секретов склада','Исследовать личный путь каждого из пяти героев','Скрытые пути',c=>['jack','finn','eleanor','victor','samuel'].every(id=>c.runs.some(r=>r.heroId===id&&r.visited?.includes('hero'+id[0].toUpperCase()+id.slice(1)))),true]
];
function metrics(runs){
 let s=0,maxClues=0,maxLinks=0;for(const h of HEROES()){const cur=state(h.id);if(cur){s++;maxClues=Math.max(maxClues,cur.items.length);maxLinks=Math.max(maxLinks,findings(h.id,cur).length)}}
 for(const r of runs){maxClues=Math.max(maxClues,r.items?.length||0);maxLinks=Math.max(maxLinks,r.deductions?.length||0)}
 return {started:s,runs,maxClues,maxLinks,heroes:new Set(runs.map(r=>r.heroId)),endings:new Set(runs.map(r=>r.ending)),combos:new Set(runs.map(r=>r.caseId+':'+r.heroId+':'+r.ending))};
}
/* Notify only as the player earns an award during this session.
   Historic achievements are backfilled silently to avoid a startup avalanche. */
const unlockQueue=[];let unlockBusy=false;
const toastRoot=document.createElement('div');toastRoot.className='campaign-unlock-tray';
toastRoot.setAttribute('role','status');toastRoot.setAttribute('aria-live','polite');
document.body.append(toastRoot);
function celebrate(title,group){
 unlockQueue.push({title,group});
 if(unlockBusy)return;
 function next(){
  if(!unlockQueue.length){unlockBusy=false;return}
  unlockBusy=true;
  const prize=unlockQueue.shift();
  const card=make('div','campaign-unlock-popup');
  card.append(make('span','campaign-unlock-star','✦'));
  const text=make('div','campaign-unlock-copy');
  text.append(make('small','','ДОСТИЖЕНИЕ ОТКРЫТО · '+prize.group),make('strong','',prize.title));
  card.append(text);toastRoot.replaceChildren(card);
  // Never intercept taps or leave a modal in the player’s way.
  setTimeout(()=>{card.classList.add('leaving');setTimeout(()=>{card.remove();next()},350)},2900);
 }
 next();
}
function awards(runs,announce=false){
 const m=metrics(runs),stored=readJSON(AWARD_KEY,{});
 const a=stored&&typeof stored==='object'&&!Array.isArray(stored)?stored:{};
 let dirty=stored!==a;
 for(const [id,title,,group,pred] of ACH){
  if(!a[id]&&pred(m)){a[id]=Date.now();dirty=true;if(announce)celebrate(title,group)}
 }
 if(dirty)put(AWARD_KEY,a);
 return a;
}
function renderUniqueRewards(el,runs){
 const earned=uniqueRewards(runs),total=HEROES().length*Object.keys(ENDINGS).length;
 const n=Object.keys(earned).filter(k=>k.startsWith(CASE_ID+':')).length;
 el.append(make('h3','campaign-group-title','Награды за уникальные судьбы'));
 el.append(make('p','campaign-intro','Открыто '+n+' / '+total+' памятных знаков. Каждая комбинация «дело × герой × концовка» приносит свой знак ровно один раз. Повторное прохождение сохраняется в истории, но не повторяет награду.'));
 const epithets={endingRescue:'Спаситель',endingEvidence:'Хранитель доказательств',endingDeal:'Мастер компромисса',endingTruth:'Голос города',endingPower:'Тайный властитель',endingDeath:'Последняя тень'};
 for(const hero of HEROES()){
  const details=make('details','campaign-reward-group');
  details.open=hero.id===(window.BirminghamHero?.selectedId||'jack');
  const count=Object.keys(ENDINGS).filter(ending=>earned[[CASE_ID,hero.id,ending].join(':')]).length;
  details.append(make('summary','',hero.name+' · '+count+' / 6 знаков'));
  const grid=make('div','campaign-reward-grid');
  for(const [ending,title] of Object.entries(ENDINGS)){
   const key=[CASE_ID,hero.id,ending].join(':'),isEarned=!!earned[key];
   const card=make('article','campaign-reward-card '+(isEarned?'earned':'locked'));
   card.append(make('span','campaign-medal',isEarned?'✦':'◇'));
   const info=make('div');
   info.append(make('strong','',epithets[ending]),make('small','',title),make('p','',isEarned?'Награда получена · Дело №001':'Не получено · Дело №001'));
   card.append(info);grid.append(card);
  }
  details.append(grid);el.append(details);
 }
}
function renderAchievements(el,runs){
 const a=awards(runs),n=Object.keys(a).filter(k=>ACH.some(v=>v[0]===k)).length;
 el.append(make('p','campaign-intro','Открыто '+n+' / '+ACH.length+'. Награды учитываются один раз и сохраняются локально в браузере. Условия будущих дел получат отдельные наборы достижений.'));
 for(const group of [...new Set(ACH.map(x=>x[3]))]){el.append(make('h3','campaign-group-title',group));const grid=make('div','campaign-award-grid');
  for(const achievement of ACH.filter(x=>x[3]===group)){
   const [id,title,desc]=achievement,secret=achievement[5]===true&&!a[id];
   const item=make('article','campaign-award '+(a[id]?'unlocked':'locked'));
   item.append(make('span','campaign-medal',a[id]?'✦':'◇'));
   const info=make('div');
   info.append(make('strong','',secret?'ТАЙНОЕ ДОСТИЖЕНИЕ':title),make('p','',secret?'Условия откроются после получения.':desc),make('small','',a[id]?'ОТКРЫТО':'ЕЩЁ НЕ ОТКРЫТО'));
   item.append(info);grid.append(item)
  }
  el.append(grid)}
 renderUniqueRewards(el,runs);
}
function renderHistory(el,runs){
 el.append(make('p','campaign-intro','Архив не зависит от выбранного героя. Здесь сохраняются завершения по каждому делу, включая повторные попытки. Разные комбинации «дело × герой × концовка» учитываются лишь однажды для уникальных наград.'));
 const unique=new Set(runs.map(r=>r.caseId+':'+r.heroId+':'+r.ending));
 const summary=make('div','campaign-summary');for(const [label,value] of [['ПРОХОЖДЕНИЙ',runs.length],['УНИКАЛЬНЫХ ИСХОДОВ',unique.size+' / 30'],['ДЕЛ В АРХИВЕ',new Set(runs.map(r=>r.caseId)).size]]){const card=make('div');card.append(make('small','',label),make('strong','',String(value)));summary.append(card)}el.append(summary);
 const title=make('h3','campaign-group-title','Дело №001 · '+CASE_TITLE);el.append(title);
 if(!runs.length)el.append(make('p','campaign-intro','Завершённых расследований пока нет. Пройди дело до одной из концовок, и запись появится здесь.'));
 const list=make('div','campaign-history-list');
 const names={envelope:'Конверт D-17',key:'Ключ №17',invoice:'Копия накладной',receipt:'Квитанция',route:'Маршрут станции',ledger:'Двойная ведомость',testimony:'Слова Рида',note:'Записка Артура',witness:'Показания Эвелин',ash:'Обгоревший лист',overheard:'Подслушанный разговор'};
 const renderList=(body,title,items)=>{const section=make('section','campaign-attempt-section');section.append(make('h4','',title));if(!items.length)section.append(make('p','campaign-intro','Записей нет.'));else{const ul=make('ul','campaign-attempt-list');for(const item of items)ul.append(make('li','',item));section.append(ul)}body.append(section)};
 for(const r of [...runs].sort((a,b)=>b.finished-a.finished)){
  const hero=HEROES().find(h=>h.id===r.heroId),card=make('details','campaign-attempt'),summary=make('summary','campaign-attempt-summary');
  summary.append(make('strong','',hero?.name||r.heroId),make('span','',stat(r)),make('small','',new Date(r.finished).toLocaleDateString('ru-RU')+' · '+(r.items?.length||0)+' улик · '+(r.deductions?.length||0)+' связей'));card.append(summary);
  const detail=make('div','campaign-attempt-detail');
  detail.append(make('p','', 'Дело №'+r.caseId+' · '+(r.caseTitle||CASE_TITLE)));
  detail.append(make('p','', 'Начало: '+new Date(r.started).toLocaleString('ru-RU')+' · Завершение: '+new Date(r.finished).toLocaleString('ru-RU')));
  detail.append(make('p','', 'Здоровье: '+(Number(r.health)||0)+' HP · Посещено эпизодов: '+(r.visited?.length||0)));
  renderList(detail,'Собранные улики',Array.isArray(r.items)?r.items.map(id=>names[id]||id):[]);
  renderList(detail,'Дедуктивные выводы',Array.isArray(r.deductions)?r.deductions:[]);
  if(r.cause)detail.append(make('p','', 'Причина гибели: '+r.cause));
  card.append(detail);list.append(card)
 }el.append(list);
 el.append(make('h3','campaign-group-title','Следующие дела'));el.append(make('p','campaign-intro','Основные, связанные и побочные дела будут добавляться в общий архив по их постоянным идентификаторам. Пока доступны только записи дела №001.'));
}
function render(id){const runs=persistFinished();const box=$(id)?.querySelector('.campaign-content');if(!box)return;box.replaceChildren();if(id==='campaignDossiers')renderDossiers(box,runs);if(id==='campaignAchievements')renderAchievements(box,runs);if(id==='campaignHistory')renderHistory(box,runs)}
function sync(){const runs=persistFinished();awards(runs,true);const achievements=$( 'campaignAchievements');if(achievements&&!achievements.hidden)render('campaignAchievements')}
const outcome=$('caseOutcome');if(outcome)new MutationObserver(sync).observe(outcome,{childList:true,subtree:true});
// Existing history is registered without retroactive celebrations on page load.
awards(persistFinished(),false);
const chapter=$('caseChapter');if(chapter)new MutationObserver(sync).observe(chapter,{childList:true});
document.addEventListener('birmingham:case-findings-changed',sync);
window.BirminghamCampaign={open,records:()=>persistFinished()};
})();