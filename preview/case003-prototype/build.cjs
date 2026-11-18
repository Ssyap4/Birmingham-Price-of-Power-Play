"use strict";
// Build from the same Node modules exercised by QA; no fetch or server.
const fs=require("node:fs"),path=require("node:path");
const here=__dirname,root=path.resolve(here,"../..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const modules={
 "./graph-v1":read("src/case003/graph-v1.js"),
 "./screenplay-v2":read("src/case003/screenplay-v2.js"),
 "./engine-v1":read("src/case003/engine-v1.js"),
 "./narrative-v2":read("src/case003/narrative-v2.js"),
 "./storage-v1":read("src/case003/storage-v1.js"),
 "../../docs/case003/investigation-contract-v1.json":"module.exports="+read("docs/case003/investigation-contract-v1.json")
};
const runtime="(()=>{const factories={"+Object.entries(modules).map(([id,code])=>JSON.stringify(id)+":(module,exports,require)=>{\n"+code+"\n}").join(",\n")+"};const cache=Object.create(null);function require(id){if(cache[id])return cache[id].exports;if(!factories[id])throw Error('Module '+id);const m={exports:{}};cache[id]=m;factories[id](m,m.exports,require);return m.exports;}\n"+read("preview/case003-prototype/app.js")+"\n})();";
const template=read("preview/case003-prototype/template.html");
const css=read("preview/case003-prototype/style.css");
const html=template.replace("/* BUILD_STYLE */",()=>css).replace("/* BUILD_SCRIPT */",()=>runtime.replace(/<\/script/gi,"<\\/script"));
fs.writeFileSync(path.join(here,"play.html"),html);
console.log("Built",path.join(here,"play.html"),Buffer.byteLength(html),"bytes");
