#!/usr/bin/env node
"use strict";
/* Chapter V production cards and SHA-locked candidate images; not game approvals. */
const assert=require("node:assert/strict");
const fs=require("node:fs"), path=require("node:path"), crypto=require("node:crypto");
const builder=require("../../docs/case002/art-wave-prompt-builder-v1.js");
const {dimensions}=require("../../tools/case002/art-audit-v1.js");
const board=require("../../docs/case002/case002-art-storyboard-v1.json");
const {manifest}=require("../../src/case002/approved-art-v1.js");
const root=path.resolve(__dirname,"../..");
const cards=builder.validateBatch(JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-19-chapter-v-shotcards-v1.json"),"utf8")));
const chapter=board.sceneAssets.filter(x=>x.chapter==="V");
assert.equal(chapter.length,15,"Chapter V must preserve the exact 15-scene storyboard");
assert(cards.length>=1&&cards.length<=chapter.length);
assert.deepEqual(cards.map(c=>c.id),chapter.slice(0,cards.length).map(c=>c.id),
 "Each new shotcard must follow original Chapter V story order");
for(const c of cards){
 const p=builder.promptFor(c),r=builder.reviewFor(c);
 assert(p.includes(c.focus)&&p.includes(c.location)&&p.includes(c.camera));
 assert(!p.includes(c.knowledgeBoundary)&&!p.includes(c.id));
 for(const v of c.avoid)assert(!p.includes(v));
 assert.equal(r.automationDoesNotApprove,true);
 assert.equal(r.requiresHumanArtReview,true);
}
const staged=[["E01","d51e1cc93da287449afdc05ef3d24831cf43bd01f223136a13f294854ac39820"],["E02","bf70a47b8de22da12e67d1a7a9a8cff3011f3a83db0d80df2e6a16e4aeeeca96"],["E03","2f38e6f629766003d082ed99f788a9acd65ffb2c5a834d0102718c2d99b576a6"],["E04","96201947a7cf6ac64d0f3eaf25c9c9b33420d3a961c8f14289970797397bd1a1"],["E05","2754e12b356908d5ccd8f8bca519ddc0d99dcd766675fa8f05448e399b2c093b"],["E06","6c5002a1c6cc5ae44ba02c3ab0eb2dcadc8582aecfa72e7ef99c63e7c9c6374a"],["E07","d7213a919ddc63ec99a9fb4df9f1f14eeb8dc22d522cd00e6e44942e5b8a626e"],["E08","dc834c8d6e0949d2f8cf14a85371e2b4762d880582799d5724f884feea59ef0c"],["E09","d8f82744f720b22124a2fd56fbf03bd4f73b441350d2266422f0b7a9c1d375b8"],["E10","04fa94b79aa89d164c926439a0886e44565255fb02d525632a24c62b60529cbf"],["E11","2e4bc6c7ba248af6e8c4cce970da5129de8a47dda539728677d7969617d994ab"],["HJ03","157802e3dab8ad86a5bdb10dca910ce054717eed64a9cd77a8cbfbb785799814"],["HE03","a2d722ba3315e0aa71618b7921f192c4a2d765f5ea726307387a6a668f92ab2a"],["HV03","6868c63425f715e5b521fb5a7690a8a0223c50916cd3dd9568ba3978a92f975b"],["HS03","1d311b7256e2f326e15bd7a0bbba7f733b2d502a147541e42b622ab97e5b64e0"]];
for(const [id,sha] of staged){
 assert(cards.some(c=>c.id===id),"Candidate missing shotcard: "+id);
 const f=path.join(root,"assets/case002/candidates/case002-"+id.toLowerCase()+"-scene--mobile.webp");
 assert(fs.existsSync(f),"Candidate image missing: "+id);
 const bytes=fs.readFileSync(f);
 assert.equal(crypto.createHash("sha256").update(bytes).digest("hex"),sha);
 assert.deepEqual([dimensions(bytes).width,dimensions(bytes).height],[720,900]);
 // The candidate stays in the archive after a later separately reviewed batch install.
 const installed=manifest.sceneImages.filter(x=>x.sceneId===id&&x.review==="approved");
 assert(installed.length<=1,"Duplicate Chapter V installed scene: "+id);
 if(installed.length)assert.equal(installed[0].mobileSha256,sha,
   "Installed asset must remain byte-identical to reviewed candidate: "+id);
}
// E07's physical candidate depicts no signed guarantee; do not bind its hash to the signed state.
const e07=cards.find(c=>c.id==="E07");
assert.equal(e07?.intendedVariant,"unsigned");
assert.equal(board.sceneAssets.find(x=>x.id==="E07")?.stateVariants?.[0],"flags.valeGuarantee");
const approvedSigned=manifest.sceneImages.filter(x=>x.sceneId==="E07"&&x.variantKey==="signed");
assert(approvedSigned.every(x=>x.mobileSha256!=="d7213a919ddc63ec99a9fb4df9f1f14eeb8dc22d522cd00e6e44942e5b8a626e"),"Unsigned E07 art cannot be installed as signed guarantee");
// The closed book remains Brackett's: no scenario-flag variant may imply transfer.
const e08=cards.find(c=>c.id==="E08");
assert.equal(e08?.intendedVariant,"brackett-book-on-desk");
const director=require("../../src/case002/scene-art-v1.js");
for(const flags of [{},{valeGuarantee:true},{publicContactSecured:true},{workersCleared:true},{valeGuarantee:true,publicContactSecured:true,workersCleared:true}]){
 const v={scene:{id:"E08"},state:{flags,witnesses:{}}};
 assert.equal(director.variant(v),"brackett-book-on-desk","E08 ledger remains on Brackett's desk in each route");
}
// The worker's hands are empty; this picture cannot mean workers received account books.
const e09=cards.find(c=>c.id==="E09");
assert.equal(e09?.intendedVariant,"accounts-brackett");
assert.deepEqual(board.sceneAssets.find(x=>x.id==="E09")?.stateVariants,
 ["flags.brackettAccountsHeld","flags.accountsGivenToWorkers"]);
for(const [flags,want] of [[{},"accounts-brackett"],[{brackettAccountsHeld:true},"accounts-hero"],[{accountsGivenToWorkers:true},"accounts-workers"],[{brackettAccountsHeld:true,accountsGivenToWorkers:true},"accounts-workers"]]){
 assert.equal(director.variant({scene:{id:"E09"},state:{flags,witnesses:{}}}),want);
}
for(const other of ["accounts-workers","accounts-hero"]){
 assert(manifest.sceneImages.filter(x=>x.sceneId==="E09"&&x.variantKey===other)
  .every(x=>x.mobileSha256!=="d8f82744f720b22124a2fd56fbf03bd4f73b441350d2266422f0b7a9c1d375b8"),
  "Untransferred E09 candidate cannot be reused as an acquired account-book variant");
}
// A neutral checkpoint is not proof that the intermediary exists or accounts were transferred.
const e10=cards.find(c=>c.id==="E10");
assert.equal(e10?.intendedVariant,"audit");
assert.deepEqual(board.sceneAssets.find(x=>x.id==="E10")?.stateVariants,
 ["flags.localIntermediary","flags.accountsGivenToWorkers"]);
for(const [flags,variant] of [[{},"audit"],[{localIntermediary:true},"intermediary"],[{accountsGivenToWorkers:true},"accounts-workers"],[{localIntermediary:true,accountsGivenToWorkers:true},"accounts-workers"]]){
 assert.equal(director.variant({scene:{id:"E10"},state:{flags,witnesses:{}}}),variant);
}
for(const bad of ["accounts-workers","intermediary"]){
 assert(manifest.sceneImages.filter(x=>x.sceneId==="E10"&&x.variantKey===bad)
 .every(x=>x.mobileSha256!=="04fa94b79aa89d164c926439a0886e44565255fb02d525632a24c62b60529cbf"),
 "Neutral E10 file must not falsely certify dynamic report state");
}
// The threshold scene shows no finale: it must remain available without inventing a witness outcome.
const e11=cards.find(c=>c.id==="E11");
assert.equal(e11.sceneKind,"emotion");
assert.deepEqual(board.sceneAssets.find(x=>x.id==="E11")?.stateVariants,[]);
assert.deepEqual(board.sceneAssets.find(x=>x.id==="E11")?.cast,["mabel","hero"]);
assert(!e11.focus.toLowerCase().includes("rescued"));
// Jack's Chapter V choice is explicitly non-violent; rendering cannot prove cooperation.
const jack=cards.find(c=>c.id==="HJ03");
assert.equal(jack.sceneKind,"emotion");
assert.equal(jack.intendedVariant,"default");
const jackBoard=board.sceneAssets.find(x=>x.id==="HJ03");
assert.deepEqual(jackBoard?.stateVariants,[]);
assert.deepEqual(jackBoard?.cast,["jack","brackett"]);
assert(jack.required.some(x=>/holster/i.test(x)));
assert(jack.avoid.some(x=>/pistol drawn/i.test(x)));
// A halted typesetting operation is not evidence that two independent sources passed verification.
const eleanor=cards.find(c=>c.id==="HE03");
assert.equal(eleanor?.sceneKind,"action");
assert.equal(eleanor?.intendedVariant,"default");
assert.deepEqual(board.sceneAssets.find(x=>x.id==="HE03")?.cast,["eleanor","nora"]);
assert.deepEqual(board.sceneAssets.find(x=>x.id==="HE03")?.stateVariants,[]);
assert(eleanor.required.some(x=>/composing stick/i.test(x)));
assert(eleanor.avoid.some(x=>/confirmed publicContactSecured/.test(x)));
// Victor demands a real signature; the paper remains unsigned and witness safety unproven.
const victor=cards.find(c=>c.id==="HV03");
assert.equal(victor?.sceneKind,"dialogue");
assert.equal(victor?.intendedVariant,"default");
assert.deepEqual(board.sceneAssets.find(x=>x.id==="HV03")?.cast,["victor","vale"]);
assert.deepEqual(board.sceneAssets.find(x=>x.id==="HV03")?.stateVariants,[]);
assert(victor.focus.includes("empty signature line"));
assert(victor.avoid.some(x=>/completed contract signature/.test(x)));
assert(victor.knowledgeBoundary.includes("valeGuarantee"));
// All fifteen chapter V primary scenes are present as physical candidates, not automatically installed.
const sourceIds=chapter.map(x=>x.id);
assert.equal(staged.length,15,"Chapter V primary staging must have exactly fifteen image records");
assert.deepEqual(staged.map(x=>x[0]),sourceIds);
const samuel=cards.find(c=>c.id==="HS03");
assert.equal(samuel?.sceneKind,"action");
assert.equal(samuel?.intendedVariant,"default");
assert.deepEqual(board.sceneAssets.find(x=>x.id==="HS03")?.cast,["samuel","worker"]);
assert.deepEqual(board.sceneAssets.find(x=>x.id==="HS03")?.stateVariants,[]);
assert(samuel.required.some(x=>/no person touching it/.test(x)),
 "Samuel must not touch the switch before worker evacuation");
assert(samuel.knowledgeBoundary.includes("every worker was cleared"));
assert(samuel.avoid.some(x=>/switch already thrown/.test(x)));
// Dynamic chapter V variants are produced one per user turn, independently of primary IDs.
const variantsSpec=JSON.parse(fs.readFileSync(path.join(root,"docs/case002/art-wave-19-chapter-v-variants-v1.json"),"utf8"));
assert.equal(variantsSpec.schemaVersion,1);
assert.equal(variantsSpec.chapter,"V");
assert(Array.isArray(variantsSpec.variants)&&variantsSpec.variants.length>=1);
const variantKeys=new Set();
for(const row of variantsSpec.variants){
 assert(board.sceneAssets.some(s=>s.chapter==="V"&&s.id===row.sceneId));
 assert(/^[a-z][a-z0-9-]*$/.test(row.variantKey));
 const key=row.sceneId+":"+row.variantKey;
 assert(!variantKeys.has(key),"Duplicate staged cinematic route: "+key);
 variantKeys.add(key);
 const card=builder.validateCard(row.shotCard,{requiresKind:true});
 assert.equal(card.id,row.sceneId);
 const p=builder.promptFor(card);
 assert(p.includes(card.focus)&&p.includes(card.location));
 assert(!p.includes(card.knowledgeBoundary));
 assert.equal(builder.reviewFor(card).requiresHumanArtReview,true);
 const file="case002-"+row.sceneId.toLowerCase()+"-scene--"+row.variantKey+"--mobile.webp";
 assert.equal(row.candidateFile,file);
 assert.equal(row.status,"staged-candidate-not-installed");
 const actual=fs.readFileSync(path.join(root,"assets/case002/candidates",file));
 assert.equal(actual.subarray(0,4).toString("ascii"),"RIFF");
 assert.equal(actual.subarray(8,12).toString("ascii"),"WEBP");
 assert.equal(actual.readUInt32LE(4)+8,actual.length);
 assert.deepEqual([dimensions(actual).width,dimensions(actual).height],[720,900]);
 assert.equal(actual.length,row.bytes);
 assert.equal(crypto.createHash("sha256").update(actual).digest("hex"),row.sha256);
 assert.equal(crypto.createHash("sha1").update(Buffer.concat([Buffer.from("blob "+actual.length),Buffer.from([0]),actual])).digest("hex"),row.gitBlobSha1);
 const copies=manifest.sceneImages.filter(e=>e.sceneId===row.sceneId&&e.variantKey===row.variantKey);
 assert(copies.length<=1,"Installed variant must be unique: "+key);
 if(copies.length)assert.equal(copies[0].mobileSha256,row.sha256,"Installed variant changed without review: "+key);
}
const signed=variantsSpec.variants.find(x=>x.sceneId==="E07"&&x.variantKey==="signed");
assert(signed,"Signed Vale guarantee version must be staged separately from unsigned");
assert.notEqual(signed.sha256,staged.find(x=>x[0]==="E07")[1]);
assert.equal(director.variant({scene:{id:"E07"},state:{flags:{valeGuarantee:true},witnesses:{}}}),"signed");
assert.equal(director.variant({scene:{id:"E07"},state:{flags:{},witnesses:{}}}),"unsigned");

const newArchive=variantsSpec.variants.find(x=>x.sceneId==="E03"&&x.variantKey==="still-unverified");
assert(newArchive,"Independently staged archive edit must be bound to the unverified public-contact state");
assert.notEqual(newArchive.sha256,staged.find(x=>x[0]==="E03")[1],"New archive shot must not duplicate the old editorial art");
assert.equal(director.variant({scene:{id:"E03"},state:{flags:{publicContactSecured:false},witnesses:{}}}),"still-unverified");
assert.equal(director.variant({scene:{id:"E03"},state:{flags:{publicContactSecured:true},witnesses:{}}}),"verified-not-published");
assert(newArchive.shotCard.knowledgeBoundary.includes("no publication"),"Archive art must remain unpublished");
const newCleared=variantsSpec.variants.find(x=>x.sceneId==="E05"&&x.variantKey==="cleared");
assert(newCleared,"Cleared siding must be a separate physically verified variant");
assert.notEqual(newCleared.sha256,staged.find(x=>x[0]==="E05")[1],"Old on-rails artwork cannot be reused for cleared siding");
assert.equal(director.variant({scene:{id:"E05"},state:{flags:{workersCleared:false},witnesses:{}}}),"workers-on-rails");
assert.equal(director.variant({scene:{id:"E05"},state:{flags:{workersCleared:true},witnesses:{}}}),"cleared");
assert(newCleared.shotCard.knowledgeBoundary.includes("workersCleared"),"Only narrative state can mark workers as cleared");

console.log("PASS: chapter V isolated cards and SHA-locked candidates: "+staged.map(x=>x[0]).join(", "));
