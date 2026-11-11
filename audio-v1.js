(()=>{'use strict';
const base='assets/audio/';
// Menu track supplied for this project.
const playlists={menu:['night-on-the-docks.mp3'],case:['case-fog.ogg','case-ledger.ogg','case-shadows.ogg']};
const saved=(key,def)=>{try{const v=localStorage.getItem(key);return v===null?def:v==='true'}catch{return def}};
let musicOn=saved('bh_music_enabled',true),effectsOn=saved('bh_effects_enabled',true),ctx=null,mode='',index=0,active=0,transitioning=false,started=false;
const players=[new Audio(),new Audio()];players.forEach(p=>{p.preload='auto';p.volume=0;p.addEventListener('error',()=>{if(musicOn&&started)console.warn('Аудиофайл недоступен:',p.src)})});
const wrap=document.createElement('div');wrap.className='bh-audio-controls';wrap.innerHTML='<button id="bhMusic" type="button" aria-label="Включить или выключить музыку"></button><button id="bhEffects" type="button" aria-label="Включить или выключить звуковые эффекты"></button>';
document.body.append(wrap);
const mBtn=wrap.querySelector('#bhMusic'),sBtn=wrap.querySelector('#bhEffects');
function paint(){mBtn.textContent=musicOn?'♫ Музыка: вкл':'♫ Музыка: выкл';sBtn.textContent=effectsOn?'♧ Эффекты: вкл':'♧ Эффекты: выкл';mBtn.setAttribute('aria-pressed',String(musicOn));sBtn.setAttribute('aria-pressed',String(effectsOn))}paint();
const volume=.19;let fadeToken=0;
function ramp(p,from,to,duration,token,done){const began=performance.now();function tick(now){if(token!==fadeToken)return;const x=Math.min(1,(now-began)/duration);p.volume=Math.max(0,Math.min(1,from+(to-from)*(x*x*(3-2*x))));if(x<1)requestAnimationFrame(tick);else if(done)done()}requestAnimationFrame(tick)}
function changeTrack(nextMode,nextIndex,fade=1900){if(!musicOn||!started)return;const next=1-active,old=players[active],fresh=players[next],token=++fadeToken;transitioning=true;fresh.pause();fresh.src=base+playlists[nextMode][nextIndex];fresh.currentTime=0;fresh.volume=0;fresh.play().then(()=>{ramp(fresh,0,volume,fade,token,()=>{transitioning=false});ramp(old,old.volume,0,fade,token,()=>old.pause());active=next;mode=nextMode;index=nextIndex}).catch(()=>{transitioning=false;old.pause()})}
function contextMode(){if(!document.querySelector('#heroSelection[hidden]')&&document.querySelector('#heroSelection'))return 'menu';const c=document.querySelector('#caseGame');return c&&!c.hidden?'case':'menu'}
function sync(){const target=contextMode();if(!started||!musicOn)return;if(mode!==target){changeTrack(target,0,1600);return}const p=players[active];if(!transitioning&&p.duration&&p.duration-p.currentTime<2.6){changeTrack(mode,(index+1)%playlists[mode].length,2200)}}
function start(){if(started||!musicOn)return;started=true;mode=contextMode();index=0;const p=players[active];p.src=base+playlists[mode][0];p.volume=0;p.play().then(()=>{ramp(p,0,volume,1800,++fadeToken)}).catch(()=>{started=false})}
function resume(){if(musicOn&&!started)start();else sync()}
mBtn.addEventListener('click',()=>{musicOn=!musicOn;try{localStorage.setItem('bh_music_enabled',musicOn)}catch{};paint();if(musicOn){started=false;start()}else{started=false;++fadeToken;players.forEach(p=>p.pause())}});
sBtn.addEventListener('click',()=>{effectsOn=!effectsOn;try{localStorage.setItem('bh_effects_enabled',effectsOn)}catch{};paint();if(effectsOn)beep('click')});
function beep(type){if(!effectsOn)return;try{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();const now=ctx.currentTime;const o=ctx.createOscillator(),g=ctx.createGain(),f=ctx.createBiquadFilter();o.type=type==='evidence'?'sine':'triangle';o.frequency.setValueAtTime(type==='evidence'?540:type==='open'?370:260,now);o.frequency.exponentialRampToValueAtTime(type==='evidence'?740:145,now+.085);f.type='lowpass';f.frequency.value=1300;o.connect(f);f.connect(g);g.connect(ctx.destination);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(type==='evidence'?.085:.045,now+.012);g.gain.exponentialRampToValueAtTime(.0001,now+(type==='evidence'?.3:.13));o.start(now);o.stop(now+.32)}catch{}}
document.addEventListener('pointerdown',e=>{resume();const b=e.target.closest('button,[role="button"],.case-evidence-card,.inventory-card');if(!b||wrap.contains(b))return;const label=(b.textContent||'').toLowerCase();beep(/улика|сопостав|инвентар/.test(label)?'evidence':/откры|начать|дело|выбр/.test(label)?'open':'click')},{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){resume();if(e.target.matches('button'))beep('click')}});
setInterval(sync,450);window.BirminghamAudio={sync,playEffect:beep};
})();
