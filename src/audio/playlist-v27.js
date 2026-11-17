/* Independent, side-effect-free playlist core; staged until all seven audio files are installed. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.BirminghamPlaylistV27=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const groups=Object.freeze({menu:Object.freeze(['covert-affair','just-as-soon']),detective:Object.freeze(['spy-glass','moil']),criminal:Object.freeze(['hard-boiled','dances-and-dames','deadly-roulette'])});
 function createDeck(ids,rng=Math.random){
  if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)throw new TypeError('Unique tracks required');
  let queue=[],last=null;
  function refill(){queue=ids.slice();for(let i=queue.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]];}
   if(queue.length>1&&queue[0]===last){[queue[0],queue[1]]=[queue[1],queue[0]];}}
  return Object.freeze({next(){if(!queue.length)refill();last=queue.shift();return last;},reset(){queue=[];},get last(){return last;}});
 }
 function createRotation(rng=Math.random){const decks=Object.fromEntries(Object.entries(groups).map(([key,ids])=>[key,createDeck(ids,rng)]));let mode=null;
  return Object.freeze({enter(target){if(!decks[target])throw new RangeError('Unknown soundtrack context');if(mode===target)return null;mode=target;return decks[mode].next();},next(){if(!mode)throw new Error('No soundtrack context');return decks[mode].next();},get mode(){return mode;}});
 }
 function resolveContext(doc,{casePage=false}={}){if(casePage)return 'detective';const visible=id=>{const el=doc.getElementById(id);return !!el&&!el.hidden;};
  if(visible('criminalScreen'))return 'criminal';if(visible('caseGame'))return 'detective';return 'menu';}
 function fadeGains(progress){const n=Math.max(0,Math.min(1,progress));return [Math.cos(n*Math.PI/2),Math.sin(n*Math.PI/2)];}
 return Object.freeze({groups,createDeck,createRotation,resolveContext,fadeGains});
});
