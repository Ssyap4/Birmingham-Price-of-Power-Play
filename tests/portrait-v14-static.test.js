"use strict";
const test=require('node:test'), assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
test('V14 detective audio dock moves ONE existing control across screens without creating audio or writing saves',()=>{
  const src=read('mobile-runtime-v1.js'), css=read('mobile-navigation-polish-v1.css');
  assert.match(src,/getElementById\('districts'\)/);
  assert.match(src,/getElementById\('home'\)/);
  assert.match(src,/querySelector\('\.bh-audio-controls'\)/);
  assert.match(src,/new MutationObserver\(queue\)/);
  assert.doesNotMatch(src,/localStorage|setItem\(|removeItem\(|new Audio\(|createElement\(['"]audio['"]\)/);
  assert.match(css,/#districtAudioDock \.bh-audio-controls/);
  assert.match(css,/#districtAudioDock #bhMenuTrack,#districtAudioDock #gameExitBtn\{display:none!important\}/);
  assert.match(css,/body\[data-criminal='active'\]>/);
  // Simulate menu -> map -> archive -> map -> menu with a tiny DOM harness.
  const listeners=[],observers=[];
  function el(id,hidden=false){return {id,hidden,children:[],parentElement:null,attributes:{},append(child){if(child.parentElement){child.parentElement.children=child.parentElement.children.filter(x=>x!==child)}this.children.push(child);child.parentElement=this;},after(child){this.afterElement=child;child.parentElement=this.parentElement;},setAttribute(k,v){this.attributes[k]=v;},querySelector(){return null}}}
  const body=el('body'),map=el('districts',true),home=el('home',false),portal=el('portal'),dockHome=el('cinemaAudioDock'),controls=el('audio');
  map.querySelector=selector=>selector==='.campaign-portal-v13'?portal:null;
  home.querySelector=selector=>selector==='#cinemaAudioDock'?dockHome:null;
  dockHome.append(controls);
  const doc={body,addEventListener:(type,fn)=>{if(type==='DOMContentLoaded')listeners.push(fn)},getElementById:id=>({districts:map,home})[id],querySelector:q=>q==='.bh-audio-controls'?controls:null,createElement:id=>el(id)};
  const observer=class {constructor(callback){this.callback=callback;observers.push(this)}observe(){} };
  const context={document:doc,window:{Telegram:null},MutationObserver:observer,queueMicrotask:fn=>fn()};
  vm.runInNewContext(src,context,{timeout:3000});
  listeners.forEach(fn=>fn());
  const atlas=portal.afterElement;
  assert.equal(atlas.id,'districtAudioDock');
  assert.equal(controls.parentElement,dockHome);
  home.hidden=true;map.hidden=false;observers.forEach(x=>x.callback());
  assert.equal(controls.parentElement,atlas);
  map.hidden=true;observers.forEach(x=>x.callback());
  assert.equal(controls.parentElement,body);
  map.hidden=false;observers.forEach(x=>x.callback());
  assert.equal(controls.parentElement,atlas);
  map.hidden=true;home.hidden=false;observers.forEach(x=>x.callback());
  assert.equal(controls.parentElement,dockHome);
});
test('V14 keeps atlas and archive fully readable from the FIRST frame and compresses tabs to one row',()=>{
  const css=read('mobile-navigation-polish-v1.css');
  assert.match(css,/#districts\.screen:not\(\[hidden\]\),\s*\.campaign-hub\.screen:not\(\[hidden\]\)\{/);
  assert.match(css,/animation:none!important;opacity:1!important;visibility:visible!important/);
  assert.match(css,/\.campaign-hub \.campaign-tabs\{\s*display:grid!important;grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important/);
  assert.match(css,/prefers-reduced-motion:reduce/);
});