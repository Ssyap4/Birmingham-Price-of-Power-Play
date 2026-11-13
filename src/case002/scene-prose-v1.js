/* Case 002: faithful cinematic typesetting of screenplay dialogue.
 * Source text stays byte-for-byte within each paragraph; a dash at the
 * beginning of a line is a visual cue, never automatic speaker attribution.
 * Safe text nodes only; never create HTML from story text.
 */
(function(root,factory){
 if(typeof module==="object"&&module.exports)module.exports=factory();
 else root.BirminghamCase002SceneProse=factory();
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
function parse(raw){
 if(typeof raw!=="string")throw Error("Case 002 narration must be text");
 return raw.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(paragraph=>({
   lines:paragraph.split("\n").map(line=>({
     text:line,spoken:/^\s*[—–]\s*\S/.test(line)
   }))
 }));
}
function render(container,raw,doc=typeof document!=="undefined"?document:null){
 if(!container||!doc||!doc.createElement||!doc.createTextNode)
   throw Error("Case 002 story needs a document and target");
 container.replaceChildren();
 const paragraphs=parse(raw);
 for(const entry of paragraphs){
   const p=doc.createElement("p");
   p.className="story-paragraph";
   entry.lines.forEach((part,index)=>{
     if(index)p.append(doc.createTextNode("\n"));
     const span=doc.createElement("span");
     span.className=part.spoken?"scene-spoken-line":"scene-prose-line";
     span.textContent=part.text;
     p.append(span);
   });
   container.append(p);
 }
 return paragraphs.length;
}
return {parse,render};
});
