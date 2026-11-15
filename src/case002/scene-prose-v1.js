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
// Presentation-only speaker metadata, never part of saved state or script.
const SPEAKER_LINES=Object.freeze({"P01":["Неизвестный голос"],"P02":["Мэйбл Кросс","Вы","Мэйбл Кросс","Мэйбл Кросс"],"A01":["Вы"],"A02":["Вы","Мэйбл Кросс","Вы","Мэйбл Кросс","Вы"],"A03":["Констебль Роуэн","Вы"],"A04":["Мысли"],"A05":["Вы","Констебль Роуэн","Вы"],"A06":["Вы"],"A07":["Бывший кассир"],"A10":["Мэйбл Кросс","Вы","Мэйбл Кросс"],"B01":["Вы"],"B02":["Клерк","Вы","Клерк"],"B03":["Клерк"],"B05":["Грузчик"],"B08":["Вы","Вахтёр","Вы"],"B09":["Рабочий"],"B12":["Ночной служащий","Вы","Ночной служащий"],"B14":["Вы"],"C02":["Сменный начальник","Вы","Сменный начальник"],"C03":["Стрелочник"],"C04":["Мэйбл Кросс","Вы","Мэйбл Кросс"],"C05":["Вы"],"C06":["Вы"],"C07":["Стрелочник"],"C08":["Посыльный","Вы"],"C09":["Вы"],"C10":["Вы"],"D01":["Хозяин лодки"],"D02":["Ада Уэбб","Вы","Ада Уэбб"],"D03":["Ада Уэбб","Вы","Ада Уэбб"],"D04":["Томми Кросс"],"D05":["Вы"],"D06":["Томми Кросс","Томми Кросс"],"D07":["Дэниел Мерсер","Вы","Дэниел Мерсер"],"D08":["Вы","Дэниел Мерсер","Дэниел Мерсер"],"D09":["Дэниел Мерсер","Вы"],"D10":["Хозяйка пансиона","Вы","Хозяйка пансиона"],"D11":["Мэйбл Кросс"],"E01":["Вы"],"E02":["Нора Келл","Вы","Нора Келл"],"E03":["Нора Келл"],"E04":["Механик"],"E05":["Вахтёр","Вы","Вахтёр"],"E06":["Гидеон Вейл","Вы","Гидеон Вейл"],"E07":["Гидеон Вейл","Вы"],"E08":["Льюис Брэкетт","Вы","Льюис Брэкетт"],"E09":["Рабочий"],"E11":["Мэйбл Кросс","Вы","Мэйбл Кросс"],"F02":["Вы","Вы"],"F03":["Вы"],"F05":["Мэйбл Кросс"],"F06":["Спутник"],"F07":["Часовой"],"F08":["Мэйбл Кросс"],"F09":["Вы"],"Z04":["Гидеон Вейл","Вы"],"Z05":["Механик","Вы"],"Z06":["Посредник"],"HJ01":["Вы","Охранник","Вы"],"HJ02":["Вы","Часовой","Вы"],"HJ03":["Льюис Брэкетт","Вы"],"HF01":["Вы"],"HF02":["Вы"],"HF03":["Вы","Вы"],"HE01":["Вы"],"HE02":["Ада Уэбб","Вы","Вы"],"HE03":["Нора Келл","Вы"],"HV01":["Вы"],"HV02":["Мэйбл Кросс","Вы","Мэйбл Кросс","Вы"],"HV03":["Вы","Гидеон Вейл","Вы"],"HS01":["Вы"],"HS02":["Вы","Стрелочник","Вы"],"HS03":["Вы"]});
function parse(raw){
 if(typeof raw!=="string")throw Error("Case 002 narration must be text");
 return raw.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).map(paragraph=>({
   lines:paragraph.split("\n").map(line=>({
     text:line,spoken:/^\s*[—–]\s*\S/.test(line)
   }))
 }));
}
function render(container,raw,doc=typeof document!=="undefined"?document:null,sceneId=null){
 if(!container||!doc||!doc.createElement||!doc.createTextNode)
   throw Error("Case 002 story needs a document and target");
 container.replaceChildren();
 const paragraphs=parse(raw);
 const voices=SPEAKER_LINES[sceneId]||[];
 const count=paragraphs.flatMap(x=>x.lines).filter(x=>x.spoken).length;
 let index=0;
 for(const entry of paragraphs){
   const p=doc.createElement("p");
   p.className="story-paragraph";
   entry.lines.forEach((part,lineIndex)=>{
     if(lineIndex)p.append(doc.createTextNode("\n"));
     const span=doc.createElement("span");
     span.className=part.spoken?"scene-spoken-line":"scene-prose-line";
     if(part.spoken){
       const speaker=voices.length===count?voices[index]:
        (sceneId==="C04"?"Мэйбл Кросс":sceneId==="C10"?"Вы":sceneId==="D02"?"Ада Уэбб":null);
       index++;
       if(speaker&&typeof span.setAttribute==="function"){
         span.setAttribute("data-speaker",speaker);
         span.setAttribute("role","group");
         span.setAttribute("aria-label",speaker+": "+part.text.replace(/^\s*[—–]\s*/,""));
       }
     }
     span.textContent=part.text;
     p.append(span);
   });
   container.append(p);
 }
 return paragraphs.length;
}
return {parse,render,SPEAKER_LINES};
});
