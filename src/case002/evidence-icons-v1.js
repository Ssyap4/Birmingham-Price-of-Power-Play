/* Case 002 — original inline vector evidence iconography v1.
 * No generated character images, no external fonts, no missing image requests.
 * The gallery uses hand-authored 64x64 SVG shapes; every supported clue has
 * an explicit type. Provenance and ownership remain engine facts, not art.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002EvidenceArt=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const kinds=Object.freeze({
 old_excursion_ticket:"ticket",
 hale_coat:"coat",
 guard_bootmark:"footprint",brackett_boots:"footprint",
 dispatch_manifest:"manifest",arrival_manifest:"manifest",
 points_log:"mechanism",pressure_log:"mechanism",
 seal_scrap:"seal",guard_payment:"coins",freight_chalk:"chalk",
 valve_photo:"photograph",inspection_copy:"document",victim_register:"document",
 ada_statement:"statement",mercer_signed_statement:"statement",
 mabel_confession:"statement",clerk_witness:"statement",bridge_witness:"statement",
 brackett_wire:"telegraph",evacuation_route:"map",private_siding_map:"map",
 brackett_accounts:"coins",vale_guarantee:"guarantee",
 family_protection:"guarantee",public_contact:"press"
});
const commands=Object.freeze({
 ticket:[
  ["rect",{x:10,y:18,width:44,height:28,rx:3,fill:"#4b3320"}],
  ["path",{d:"M18 18v28M46 18v28M23 24h18M23 30h18M23 36h11",strokeWidth:2}],
  ["circle",{cx:40,cy:37,r:3,fill:"#aa7b4b",stroke:"none"}]
 ],
 coat:[
  ["path",{d:"M19 13l9 5h8l9-5 8 13-8 8-3-5v23H22V29l-3 5-8-8z",fill:"#4b3829"}],
  ["path",{d:"M28 18l4 9 4-9M32 27v24M25 35h5M34 35h6",strokeWidth:1.8}],
  ["circle",{cx:34,cy:31,r:1,fill:"#edc58b"}],["circle",{cx:34,cy:39,r:1,fill:"#edc58b"}]
 ],
 footprint:[
  ["path",{d:"M19 49l7-5-2-10 6-8 12-1 3 11-3 7 5 4-4 5H22z",fill:"#493022"}],
  ["path",{d:"M29 27l9 2M27 34l13 3M25 41l16 3M21 49l22 1",strokeWidth:2}],
  ["circle",{cx:17,cy:21,r:3,fill:"#b9925e",stroke:"none"}],
  ["circle",{cx:25,cy:15,r:3,fill:"#b9925e",stroke:"none"}],
  ["circle",{cx:34,cy:13,r:3,fill:"#b9925e",stroke:"none"}]
 ],
 manifest:[
  ["path",{d:"M15 9h25l9 9v36H15z",fill:"#513b26"}],
  ["path",{d:"M40 9v9h9M21 25h22M21 31h22M21 37h22M21 43h12",strokeWidth:2}],
  ["path",{d:"M33 45l5 4 8-9",stroke:"#efc988",strokeWidth:2.5}]
 ],
 mechanism:[
  ["circle",{cx:32,cy:32,r:19,fill:"#423120"}],
  ["circle",{cx:32,cy:32,r:12}],
  ["path",{d:"M32 21v12l8 5M32 7v6M32 51v6M7 32h6M51 32h6",strokeWidth:2.4}],
  ["circle",{cx:32,cy:32,r:2.7,fill:"#dfad67",stroke:"none"}]
 ],
 seal:[
  ["path",{d:"M20 13h24l7 8-5 23-14 9-14-9-5-23z",fill:"#44301d"}],
  ["circle",{cx:32,cy:31,r:12,fill:"#7e4e30"}],
  ["path",{d:"M28 23l4 8 6-5M25 38h15",strokeWidth:2.4}],
  ["path",{d:"M14 46l-4 7M49 43l6 10",strokeWidth:2}]
 ],
 coins:[
  ["ellipse",{cx:32,cy:42,rx:20,ry:8,fill:"#5b4125"}],
  ["path",{d:"M12 35v8c0 10 40 10 40 0v-8M12 35c0-10 40-10 40 0s-40 10-40 0",fill:"#47311e"}],
  ["circle",{cx:32,cy:32,r:7,strokeWidth:1.9}],
  ["path",{d:"M35 27c-6-3-9 3-4 5s7 4-2 6M32 24v17",strokeWidth:1.5}]
 ],
 chalk:[
  ["path",{d:"M19 45l23-25 8 8-25 24-9 2z",fill:"#b1a28a",stroke:"#ddcbb4"}],
  ["path",{d:"M16 54l9-2-6-7z",fill:"#54402c"}],
  ["path",{d:"M23 39l8 7M42 20l8 8",strokeWidth:2}],
  ["path",{d:"M10 16l14 3M8 23l9 2",strokeWidth:1.5}]
 ],
 photograph:[
  ["rect",{x:11,y:14,width:42,height:35,rx:2,fill:"#4c392c"}],
  ["rect",{x:15,y:18,width:34,height:25,fill:"#342f29",stroke:"#aa8658"}],
  ["circle",{cx:25,cy:25,r:4,fill:"#d0a66d",stroke:"none"}],
  ["path",{d:"M17 40l10-11 6 5 5-7 9 13M24 53h16",strokeWidth:2}]
 ],
 document:[
  ["path",{d:"M17 11h24l7 7v36H17z",fill:"#4e3825"}],
  ["path",{d:"M41 11v8h7M23 26h19M23 32h17M23 38h16",strokeWidth:2}],
  ["path",{d:"M26 47h12M32 42v10",strokeWidth:1.8}]
 ],
 statement:[
  ["path",{d:"M15 14l9-5h25v44H15z",fill:"#4a3521"}],
  ["path",{d:"M23 22h20M23 29h20M23 36h13M22 46c6-7 9 3 15-3 3-3 4-3 8-1",strokeWidth:1.8}],
  ["circle",{cx:45,cy:50,r:3,fill:"#76502c"}]
 ],
 telegraph:[
  ["rect",{x:9,y:17,width:46,height:31,rx:3,fill:"#4d3423"}],
  ["path",{d:"M14 23h36M14 32h36M19 39h8M31 39h4M39 39h6",strokeWidth:1.8}],
  ["path",{d:"M24 14l8-7 8 7M25 51h14",strokeWidth:2}]
 ],
 map:[
  ["path",{d:"M10 17l14-5 16 5 14-5v36l-14 5-16-5-14 5z",fill:"#4c3a24"}],
  ["path",{d:"M24 12v36M40 17v36",strokeWidth:1.8}],
  ["path",{d:"M16 39l11-11 8 9 12-14",strokeWidth:2.5}],
  ["circle",{cx:16,cy:39,r:2.5,fill:"#c79558"}],["circle",{cx:47,cy:23,r:2.5,fill:"#c79558"}]
 ],
 guarantee:[
  ["path",{d:"M15 9h34v46H15z",fill:"#443321"}],
  ["path",{d:"M22 18h20M22 25h20M22 32h10",strokeWidth:2}],
  ["circle",{cx:37,cy:42,r:8,fill:"#7b4428",stroke:"#dba36a",strokeWidth:1.5}],
  ["path",{d:"M34 41l2.5 3 4-5",strokeWidth:2}]
 ],
 press:[
  ["rect",{x:10,y:12,width:44,height:40,rx:1,fill:"#463421"}],
  ["path",{d:"M18 20h28M18 25h28M18 39h28M18 44h28M18 49h21",strokeWidth:1.9}],
  ["rect",{x:18,y:29,width:13,height:8,fill:"#b28a58",stroke:"#d6b07e"}],
  ["path",{d:"M35 30h11M35 34h11",strokeWidth:1.5}]
 ]
});
function kind(id){
 if(typeof id!=="string"||!Object.hasOwn(kinds,id))
   throw Error("Unsupported Case 002 evidence art ID: "+String(id));
 return kinds[id];
}
function create(id,doc=typeof document!=="undefined"?document:null){
 if(!doc||!doc.createElementNS)throw Error("SVG icons require a document");
 const ns="http://www.w3.org/2000/svg",typ=kind(id),svg=doc.createElementNS(ns,"svg");
 const assign=(el,attrs)=>{for(const [key,value] of Object.entries(attrs)){
   const name=key==="strokeWidth"?"stroke-width":key;
   el.setAttribute(name,String(value));
 }return el;};
 assign(svg,{viewBox:"0 0 64 64",width:52,height:52,fill:"none",
   stroke:"#d8b27b","stroke-width":2,"stroke-linecap":"round",
   "stroke-linejoin":"round",role:"img","aria-label":typ});
 const back=assign(doc.createElementNS(ns,"rect"),
   {x:1.5,y:1.5,width:61,height:61,rx:7,fill:"#221a14",stroke:"#705438","stroke-width":1.5});
 svg.append(back);
 const title=doc.createElementNS(ns,"title");title.textContent=typ;svg.append(title);
 for(const [tag,attrs] of commands[typ])svg.append(assign(doc.createElementNS(ns,tag),attrs));
 return svg;
}
return {kinds,commands,kind,create};
});
