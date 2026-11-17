(()=>{'use strict';
const $=id=>document.getElementById(id),P=window.BirminghamTrialProgress;
const ranks=['НОВИЧОК СМОЛЛ-ХИТА','ЧЕЛОВЕК С УЛИЦЫ','ДОВЕРЕННОЕ ЛИЦО','ПРАВАЯ РУКА','ХОЗЯИН БИРМИНГЕМА'];
function snapshot(){let store;try{store=localStorage}catch{}return P.read(store)}
function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el}
function awardRows(root,s){root.replaceChildren();for(const a of P.awards(s)){const div=node('div','achievement'+(a.earned?'':' locked'));const copy=node('span');copy.append(node('b','',a.title),node('small','',a.description+' · '+(a.earned?'ОТКРЫТО':'ЗАКРЫТО')));div.append(node('span','medal',a.icon),copy);root.append(div)}}
function statusText(status){return status==='damaged'?'Архив испытаний повреждён. Исходные данные не сброшены.':'Локальная статистика испытаний недоступна.'}
function update(){
 const {status,value:s}=snapshot(),ok=status==='ready';
 for(const [id,k] of [['profilePlayed','played'],['profileWins','wins'],['profileBest','best']])$(id).textContent=ok?String(s[k]):'—';
 const wins=s.wins,tier=Math.min(4,Math.floor(wins/5));
 $('rankName').textContent=ok?ranks[tier]:'РАНГ НЕДОСТУПЕН';
 $('rankProgress').style.width=(ok?(tier===4?100:(wins%5)/5*100):0)+'%';
 $('rankInfo').textContent=ok?(tier===4?'Высший ранг достигнут':wins%5+' / 5 побед до следующего ранга'):statusText(status);
 for(const id of ['achievementList','levelRecords'])$(id).replaceChildren();
 if(ok){awardRows($('achievementList'),s);for(const [id,name] of Object.entries(P.levels)){const div=node('div','achievement'),copy=node('span'),n=s.completed[id]||0;copy.append(node('b','',name),node('small','','Побед: '+n));div.append(node('span','medal',n?'♛':'◇'),copy);$('levelRecords').append(div)}}
 else for(const id of ['achievementList','levelRecords'])$(id).append(node('p','trial-archive-warning',statusText(status)));
 window.BirminghamPlayerOverview?.render(window);
}
function open(){update();const target=$('profile');target.hidden=false;document.querySelectorAll('.screen').forEach(el=>{if(el!==target)el.hidden=true});$('homeBtn').hidden=false;window.scrollTo({top:0,behavior:'instant'});}
$('profileBtn').onclick=open;
window.addEventListener('storage',e=>{if((e.key===P.KEY||e.key===null)&&!$('profile').hidden)update()});
window.addEventListener('pageshow',()=>{if(!$('profile').hidden)update()});
// Separate read-only projection in the common archive. No duplicate grants.
document.addEventListener('birmingham:campaign-render',({detail})=>{
 if(!detail?.box||!['campaignAchievements','campaignHistory'].includes(detail.id))return;
 const {status,value:s}=snapshot(),section=node('section','trial-archive-section');section.id='campaignTrials'+(detail.id==='campaignAchievements'?'Achievements':'History');
 section.append(node('small','campaign-criminal-kicker','ИСПЫТАНИЯ · ОТДЕЛЬНЫЙ ПРОГРЕСС'),node('h3','campaign-group-title','Испытания'));
 if(status!=='ready'){section.append(node('p','trial-archive-warning',statusText(status)));detail.box.append(section);return}
 if(detail.id==='campaignAchievements'){const earned=P.awards(s).filter(a=>a.earned).length;section.append(node('p','campaign-intro',earned+' / 6 достижений · '+s.wins+' побед · '+s.played+' начатых попыток'));const fold=node('details','trial-archive-fold');fold.dataset.archiveFold='trials:awards';fold.append(node('summary','','Достижения испытаний'));const grid=node('div','achievement-grid');awardRows(grid,s);fold.append(grid);section.append(fold)}
 else{section.append(node('p','campaign-intro','Последние '+s.history.length+' завершённых попыток. Начатые, но брошенные испытания не входят в историю.'));const fold=node('details','trial-archive-fold');fold.dataset.archiveFold='trials:history';fold.append(node('summary','','История испытаний'));if(!s.history.length)fold.append(node('p','','Завершённых испытаний пока нет.'));for(const h of s.history){const row=node('article','trial-history-row');row.append(node('strong','',h.won?'Испытание пройдено':'Попытка завершена'),node('small','',(P.levels[h.difficulty]||'Испытание')+' · '+(h.mode==='timed'?'На время':'Классика')+' · '+new Date(h.date).toLocaleDateString('ru-RU')),node('span','',h.score+' очков · '+(Number.isInteger(h.answered)?h.answered+' / 50 вопросов':'Результат из архива')));fold.append(row)}section.append(fold)}
 detail.box.append(section);
});
})();