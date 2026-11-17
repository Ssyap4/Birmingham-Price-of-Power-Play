(()=>{'use strict';
const core=window.BirminghamPlaylistV27,script=document.currentScript;
if(!core||!script)return;
const casePage=script.dataset.soundtrack==='detective';
const base=new URL('assets/audio/soundtrack/',script.src).href;
const rotation=core.createRotation();
const credits=[{"title":"Covert Affair","author":"Kevin MacLeod","license":"CC BY 4.0","source":"https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100795","licenseUrl":"https://creativecommons.org/licenses/by/4.0/"},{"title":"Just As Soon","author":"Kevin MacLeod","license":"CC BY 4.0","source":"https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100185","licenseUrl":"https://creativecommons.org/licenses/by/4.0/"},{"title":"Spy Glass","author":"Kevin MacLeod","license":"CC BY 4.0","source":"https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1500058","licenseUrl":"https://creativecommons.org/licenses/by/4.0/"},{"title":"Moil","author":"Ruskerdax","license":"CC0 1.0","source":"https://opengameart.org/content/moil","licenseUrl":"https://creativecommons.org/publicdomain/zero/1.0/"},{"title":"Hard Boiled","author":"Kevin MacLeod","license":"CC BY 4.0","source":"https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700076","licenseUrl":"https://creativecommons.org/licenses/by/4.0/"},{"title":"Dances and Dames","author":"Kevin MacLeod","license":"CC BY 4.0","source":"https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100595","licenseUrl":"https://creativecommons.org/licenses/by/4.0/"},{"title":"Deadly Roulette","author":"Kevin MacLeod","license":"CC BY 4.0","source":"https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600033","licenseUrl":"https://creativecommons.org/licenses/by/4.0/"}];
const saved=(key,def)=>{try{const v=localStorage.getItem(key);return v===null?def:v==='true'}catch{return def}};
let musicOn=saved('bh_music_enabled',true),effectsOn=saved('bh_effects_enabled',true),ctx=null;
const players=[new Audio(),new Audio()],gains=[null,null],levels=[0,0];
players.forEach(p=>{p.preload='metadata';p.volume=0});
const volume=.075,fadeMs=3400;
let active=-1,mode=null,trackId=null,phase='idle',token=0,unlocked=false,pending=null,blocked=false;
const wrap=document.createElement('div');wrap.className='bh-audio-controls';
wrap.innerHTML='<button id="bhMusic" type="button" aria-label="Включить или выключить музыку"></button><button id="bhEffects" type="button" aria-label="Включить или выключить звуковые эффекты"></button><button id="bhMenuTrack" type="button" aria-label="Следующая композиция"></button>';
(casePage?document.getElementById('case002AudioDock')||document.body:document.body).append(wrap);
const mBtn=wrap.querySelector('#bhMusic'),sBtn=wrap.querySelector('#bhEffects'),trackBtn=wrap.querySelector('#bhMenuTrack');
function paint(){trackBtn.textContent='♪ Следующая запись';mBtn.textContent=musicOn?'♫ Музыка: вкл':'♫ Музыка: выкл';sBtn.textContent=effectsOn?'♧ Эффекты: вкл':'♧ Эффекты: выкл';mBtn.setAttribute('aria-pressed',String(musicOn));sBtn.setAttribute('aria-pressed',String(effectsOn))}
function addCredits(){
 const host=casePage?document.getElementById('case002AudioDock'):document.getElementById('profile');
 if(!host)return;const details=document.createElement('details');details.className='bh-music-credits';
 const summary=document.createElement('summary');summary.textContent='Музыка и авторы';details.append(summary);
 for(const item of credits){const p=document.createElement('p');p.append(document.createTextNode(item.title+' — '+item.author+' · '));
 const license=document.createElement('a');license.href=item.licenseUrl;license.textContent=item.license;license.rel='noopener noreferrer';license.target='_blank';
 const source=document.createElement('a');source.href=item.source;source.textContent='источник';source.rel='noopener noreferrer';source.target='_blank';p.append(license,document.createTextNode(' · '),source);details.append(p)}
 const note=document.createElement('p');note.textContent='Записи перекодированы в MP3 96 кбит/с; метаданные удалены. Изменена громкость воспроизведения.';details.append(note);host.append(details);
}paint();addCredits();
function audioContext(){
 try{
  ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();
  if(ctx.state==='suspended')ctx.resume().catch(()=>{});
  for(let i=0;i<2;i++)if(!gains[i]){
   const gain=ctx.createGain();gain.gain.value=levels[i];
   const source=ctx.createMediaElementSource(players[i]);source.connect(gain);gain.connect(ctx.destination);gains[i]=gain;players[i].volume=1;
  }
 }catch{}
}
function setLevel(i,v){if(i<0)return;levels[i]=Math.max(0,Math.min(1,v));if(gains[i])gains[i].gain.value=levels[i];else players[i].volume=levels[i]}
function mark(){document.body.classList.toggle('bh-music-playing',musicOn&&active>=0&&!players[active].paused&&!document.hidden)}
function halt(){++token;phase='idle';active=-1;mode=null;trackId=null;pending=null;blocked=false;players.forEach((p,i)=>{p.pause();setLevel(i,0)});mark()}
function targetMode(){return core.resolveContext(document,{casePage})}
function planFor(target){if(pending?.mode===target)return pending;return {mode:target,id:rotation.mode===target?rotation.next():rotation.enter(target)}}
function playPlan(plan){
 if(!plan?.id||!musicOn||!unlocked||document.hidden||phase!=='idle')return;
 const old=active,next=old===0?1:0,p=players[next],epoch=++token,oldLevel=old>=0?levels[old]:0;
 pending=plan;phase='loading';p.pause();setLevel(next,0);p.src=base+plan.id+'.mp3';
 function failed(){if(epoch!==token)return;phase='idle';blocked=true;p.pause();setLevel(next,0);mark()}
 let playing;try{playing=p.play()}catch{failed();return}
 Promise.resolve(playing).then(()=>{
  if(epoch!==token)return;
  active=next;mode=plan.mode;trackId=plan.id;pending=null;blocked=false;phase='fading';mark();
  const begin=performance.now();
  function tick(now){
   if(epoch!==token)return;
   const t=Math.min(1,Math.max(0,(now-begin)/fadeMs)),[out,inc]=core.fadeGains(t);
   setLevel(next,volume*inc);if(old>=0)setLevel(old,oldLevel*out);
   if(t<1)requestAnimationFrame(tick);
   else{if(old>=0){players[old].pause();setLevel(old,0)}phase='idle';sync()}
  }requestAnimationFrame(tick);
 }).catch(failed);
}
function sync(){
 if(!musicOn||!unlocked||document.hidden||phase!=='idle'||blocked)return;
 const target=targetMode(),p=active>=0?players[active]:null;
 if(!p||mode!==target||p.ended||Number.isFinite(p.duration)&&p.duration>0&&p.duration-p.currentTime<=fadeMs/1000+.4)playPlan(planFor(target));
}
function gesture(){if(!musicOn||document.hidden)return;unlocked=true;audioContext();blocked=false;sync()}
players.forEach((p,i)=>{p.addEventListener('ended',()=>{mark();sync()});p.addEventListener('pause',mark);p.addEventListener('playing',mark);p.addEventListener('error',()=>{if(i===active){halt();blocked=true}})});
mBtn.addEventListener('click',()=>{musicOn=!musicOn;try{localStorage.setItem('bh_music_enabled',musicOn)}catch{}paint();if(musicOn)gesture();else halt()});
trackBtn.addEventListener('click',()=>{if(musicOn&&phase==='idle'){gesture();if(phase==='idle')playPlan({mode:targetMode(),id:rotation.mode===targetMode()?rotation.next():rotation.enter(targetMode())})}});
sBtn.addEventListener('click',()=>{effectsOn=!effectsOn;try{localStorage.setItem('bh_effects_enabled',effectsOn)}catch{}paint();if(effectsOn)beep('click')});
function beep(type){if(!effectsOn)return;try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();const now=ctx.currentTime;const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type=type==='evidence'?'sine':'triangle';o.frequency.setValueAtTime(type==='evidence'?540:type==='open'?370:260,now);o.frequency.exponentialRampToValueAtTime(type==='evidence'?740:145,now+.085);f.type='lowpass';f.frequency.value=1300;o.connect(f);f.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(type==='evidence'?.085:.045,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+(type==='evidence'?.3:.13));o.start(now);o.stop(now+.32)}catch{}}

document.addEventListener('pointerdown',e=>{if(wrap.contains(e.target))return;gesture();const btn=e.target.closest('button,[role="button"],.case-evidence-card,.inventory-card');if(!btn)return;const label=(btn.textContent||'').toLowerCase();beep(/улика|сопостав|инвентар/.test(label)?'evidence':/откры|начать|дело|выбр/.test(label)?'open':'click')},{passive:true});
document.addEventListener('click',e=>{if(!wrap.contains(e.target))gesture()},{capture:true,passive:true});
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!wrap.contains(e.target)){gesture();if(e.target.matches('button'))beep('click')}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)halt();else sync()});
window.addEventListener('pagehide',halt);
setInterval(sync,450);
window.BirminghamAudio={sync,playEffect:beep,getState:()=>({mode,trackId,phase,musicOn,levels:[...levels],playing:active>=0&&!players[active].paused})};
})();
