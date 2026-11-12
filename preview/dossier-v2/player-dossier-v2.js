/* Player dossier v2: one local identity, campaign-derived progress, no legacy quiz values. */
(()=>{'use strict';
const $=id=>document.getElementById(id), PROFILE=$('profile');
if(!PROFILE)return;
const RECORDS='birmingham_campaign_records_v1',AWARDS='birmingham_campaign_awards_v1',UNIQUE='birmingham_campaign_unique_rewards_v1';
const LOCAL_ID='birmingham_player_dossier_id_v2',ALIAS='birmingham_player_alias_v2';
const ENDINGS=['endingRescue','endingEvidence','endingDeal','endingTruth','endingPower','endingDeath'];
const ENDING_LABELS={endingRescue:'Человек важнее бумаг',endingEvidence:'Цена доказательств',endingDeal:'Договор с тенью',endingTruth:'Город узнает правду',endingPower:'Власть в твоих руках',endingDeath:'Последняя ошибка'};
const HEROES=['jack','finn','eleanor','victor','samuel'];
const RANKS=[['НОВИЧОК СМОЛЛ-ХИТА',0],['ЧЕЛОВЕК С УЛИЦЫ',48],['ДОВЕРЕННОЕ ЛИЦО',130],['ПРАВАЯ РУКА',255],['ХОЗЯИН БИРМИНГЕМА',450]];
const read=(key,fallback)=>{try{const data=JSON.parse(localStorage.getItem(key)||'null');return data??fallback}catch{return fallback}};
const safeString=(value,limit)=>String(value??'').trim().slice(0,limit);
function localId(){
 try{let id=localStorage.getItem(LOCAL_ID);if(id&&/^BH-L-[A-Z0-9]{8}$/.test(id))return id;
 let chars='';if(globalThis.crypto?.getRandomValues){const bytes=new Uint8Array(8);crypto.getRandomValues(bytes);chars=Array.from(bytes,n=>(n%36).toString(36).toUpperCase()).join('')}
 else chars=(Date.now().toString(36)+Math.random().toString(36).slice(2)).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(-8).padStart(8,'0');
 id='BH-L-'+chars;localStorage.setItem(LOCAL_ID,id);return id
 }catch{return 'ЛОКАЛЬНОЕ ДОСЬЕ'}
}
const goodRun=r=>r&&typeof r==='object'&&typeof r.caseId==='string'&&HEROES.includes(r.heroId)&&ENDINGS.includes(r.ending)&&typeof r.key==='string';
function model(){
 // Refresh finished runs through the campaign's existing archive, not a competing recording system.
 const runs=(window.BirminghamCampaign?.records?.()||read(RECORDS,[]));
 const finished=(Array.isArray(runs)?runs:[]).filter(goodRun);
 const combos=new Set(finished.map(r=>r.caseId+':'+r.heroId+':'+r.ending));
 const distinctEndings=new Set(finished.map(r=>r.caseId+':'+r.ending));
 const distinctCases=new Set(finished.map(r=>r.caseId));
 const heroIds=new Set(finished.map(r=>r.heroId));
 const awards=read(AWARDS,{}),uniqueRewards=read(UNIQUE,{});
 const rewardKeys=uniqueRewards&&typeof uniqueRewards==='object'&&!Array.isArray(uniqueRewards)?Object.keys(uniqueRewards).filter(k=>uniqueRewards[k]):[];
 // Only the campaign's recognized 18 achievements count; avoid stale legacy quiz badges.
 const achieved=awards&&typeof awards==='object'&&!Array.isArray(awards)?Object.keys(awards).filter(k=>awards[k]&&ACHIEVEMENT_IDS.has(k)):[];
 const score=combos.size*12+achieved.length*4+distinctCases.size*16;
 let tier=0;for(let i=0;i<RANKS.length;i++)if(score>=RANKS[i][1])tier=i;
 const current=RANKS[tier],next=RANKS[tier+1];
 const progress=next?Math.min(100,Math.max(0,(score-current[1])/(next[1]-current[1])*100)):100;
 const active=HEROES.map(heroId=>({heroId,state:read('birmingham_case_smol_heath_v1_'+heroId,null)})).filter(({state})=>state&&Array.isArray(state.items)&&!ENDINGS.includes(state.node)&&Number.isFinite(Number(state.started)));
 return {finished,combos,distinctEndings,distinctCases,heroIds,achieved,rewardKeys,score,tier,current,next,progress,active};
}
const ACHIEVEMENT_IDS=new Set(['clue9','clue11','deduce3','deduce6','end2','end4','end6','hero3','hero5','combos5','combos15','combos30','unbroken','lastBreath','paperTrail','nightRoute','reedSecret','allPaths']);
const recentName=heroId=>window.BirminghamHero?.heroes?.find(h=>h.id===heroId)?.name||({jack:'Джек',finn:'Финн',eleanor:'Элеонора',victor:'Виктор',samuel:'Сэмюэл'}[heroId]||'Сыщик');
const fmt=date=>{const n=Number(date);return Number.isFinite(n)&&n>0?new Date(n).toLocaleDateString('ru-RU',{day:'numeric',month:'short',year:'numeric'}):'—'};
function sectionHeading(eyebrow,title,subtext){
 const box=document.createElement('div');box.className='pd-section-heading';
 const tag=document.createElement('span');tag.className='pd-kicker';tag.textContent=eyebrow;
 const h=document.createElement('h3');h.textContent=title;box.append(tag,h);
 if(subtext){const p=document.createElement('p');p.textContent=subtext;box.append(p)}return box;
}
const textEl=(tag,cls,content)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(content!==undefined)el.textContent=String(content);return el};
function archiveLink(destination,label,descr){
 const button=textEl('button','pd-archive-link','');
 button.type='button';button.dataset.archive=destination;
 button.append(textEl('strong','',label),textEl('small','',descr),textEl('span','pd-arrow','↗'));
 return button;
}
function create(){
 PROFILE.classList.add('player-dossier-v2');
 PROFILE.replaceChildren();
 const shell=textEl('div','pd-shell','');
 const heading=textEl('header','pd-hero','');
 const kicker=textEl('div','pd-kicker','PRIVATE ARCHIVE · BIRMINGHAM · 1920');
 const h=textEl('h2','','ЛИЧНОЕ ДЕЛО');
 const intro=textEl('p','','Имя оставляет след. Решения создают репутацию. Каждое расследование меняет твою историю в Бирмингеме.');
 heading.append(kicker,h,intro);
 const identity=textEl('div','pd-identity','');
 const mark=textEl('div','pd-mark','♛');
 const details=textEl('div','pd-identity-details','');
 details.append(textEl('span','pd-kicker','АРХИВНАЯ ЛИЧНОСТЬ'),textEl('strong','pd-alias',''),textEl('small','pd-number',''));
 const rename=textEl('button','pd-edit-alias','ИЗМЕНИТЬ ПСЕВДОНИМ');rename.type='button';
 rename.addEventListener('click',()=>{
  const before=localStorage.getItem(ALIAS)||'';
  const value=prompt('Псевдоним для личного досье (до 28 символов)',before);
  if(value===null)return;const clean=safeString(value,28).replace(/[\u0000-\u001F<>]/g,'');
  try{if(clean)localStorage.setItem(ALIAS,clean);else localStorage.removeItem(ALIAS)}catch{}
  render();
 });
 details.append(rename);identity.append(mark,details);
 const rank=textEl('section','pd-rank','');rank.append(textEl('div','pd-rank-title',''),textEl('div','pd-track',''),textEl('small','pd-rank-caption',''));
 const trackFill=textEl('span','pd-track-fill','');rank.querySelector('.pd-track').append(trackFill);
 const stats=textEl('div','pd-stats','');
 const labels=[['cases','Завершённых дел'],['runs','Прохождений'],['outcomes','Уникальных исходов'],['awards','Достижений'],['seals','Памятных знаков'],['heroes','Героев с финалом']];
 for(const [id,label]of labels){const tile=textEl('div','pd-stat','');tile.append(textEl('b','pd-stat-'+id,'0'),textEl('small','',label));stats.append(tile)}
 const status=textEl('section','pd-current','');
 const activity=textEl('section','pd-activity','');
 const archive=textEl('section','pd-archive','');
 archive.append(sectionHeading('КНИГИ АРХИВА','Разделы личного дела','Одна система прогресса, разные способы посмотреть свою историю.'));
 const linkGrid=textEl('div','pd-archive-grid','');
 linkGrid.append(archiveLink('campaignDossiers','Пять героев','Личные пути и открытые концовки'),archiveLink('campaignAchievements','Награды','18 достижений и 30 знаков Дела №001'),archiveLink('campaignHistory','История дел','Полные записи завершённых расследований'));
 archive.append(linkGrid);
 const foot=textEl('p','pd-footnote','Прогресс пока хранится только в этом браузере. Номер BH-L — локальный номер устройства, не публичный Telegram ID.');
 shell.append(heading,identity,rank,stats,status,activity,archive,foot);PROFILE.append(shell);
 PROFILE.addEventListener('click',event=>{const button=event.target.closest('[data-archive]');if(button){const target=button.dataset.archive;window.BirminghamCampaign?.open?.(target)}});
}
function render(){
 if(!PROFILE.classList.contains('player-dossier-v2'))create();
 const m=model();
 PROFILE.querySelector('.pd-alias').textContent=localStorage.getItem(ALIAS)||'Неизвестный сыщик';
 PROFILE.querySelector('.pd-number').textContent='№ '+localId()+' · ЛОКАЛЬНЫЙ ПРОФИЛЬ';
 PROFILE.querySelector('.pd-rank-title').textContent=m.current[0];
 PROFILE.querySelector('.pd-track-fill').style.width=m.progress.toFixed(1)+'%';
 PROFILE.querySelector('.pd-rank-caption').textContent=m.next?'Репутация: '+m.score+' · до звания «'+m.next[0]+'»: '+(m.next[1]-m.score)+' очков':'Репутация: '+m.score+' · высший ранг';
 const values={cases:m.distinctCases.size,runs:m.finished.length,outcomes:m.distinctEndings.size,awards:m.achieved.length+'/18',seals:m.rewardKeys.length+'/30',heroes:m.heroIds.size+'/5'};
 for(const [key,val]of Object.entries(values))PROFILE.querySelector('.pd-stat-'+key).textContent=String(val);
 const status=PROFILE.querySelector('.pd-current');status.replaceChildren(sectionHeading('НАСТОЯЩЕЕ ВРЕМЯ','Текущие расследования'));
 if(!m.active.length)status.append(textEl('p','pd-muted','Незавершённых расследований пока нет. Выбери дело на карте и начни свой путь.'));
 else for(const {heroId,state}of m.active){const row=textEl('div','pd-current-row','');row.append(textEl('strong','',recentName(heroId)),textEl('span','','Дело №001 · '+state.items.length+' улик · начато '+fmt(state.started)));status.append(row)}
 const activity=PROFILE.querySelector('.pd-activity');activity.replaceChildren(sectionHeading('ХРОНИКА РЕШЕНИЙ','Последние события'));
 if(!m.finished.length){activity.append(textEl('p','pd-muted','Архив ждёт первого завершённого расследования. Здесь появятся реальные итоги твоих решений.'))}
 else{const list=textEl('div','pd-event-list','');for(const run of [...m.finished].sort((a,b)=>(Number(b.finished)||0)-(Number(a.finished)||0)).slice(0,3)){const row=textEl('div','pd-event','');row.append(textEl('span','pd-event-emblem','✦'));const body=textEl('div','pd-event-content','');body.append(textEl('strong','',ENDING_LABELS[run.ending]||run.ending),textEl('small','', 'Дело №'+run.caseId+' · '+recentName(run.heroId)+' · '+fmt(run.finished)));row.append(body);list.append(row)}activity.append(list)}
}
function open(){
 for(const element of document.querySelectorAll('main .screen'))element.hidden=element.id!=='profile';
 const home=$('homeBtn');if(home)home.hidden=false;
 render();window.scrollTo({top:0,behavior:'instant'});
}
window.BirminghamProfileV2={open,render,model};
$('profileBtn')?.addEventListener('click',e=>{e.preventDefault();open()});
const observer=new MutationObserver(()=>{if(!PROFILE.hidden)render()});observer.observe(PROFILE,{attributes:true,attributeFilter:['hidden']});
create();
})();