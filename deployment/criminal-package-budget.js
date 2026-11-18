"use strict";
// Existing 40 frames are grandfathered; future growth is bounded per reviewed frame.
const MiB=1024*1024, MAX_FRAME=256*1024, LEGACY_BUDGET=5*MiB, CORE_BUDGET=2*MiB;
const LEGACY=new Set(["CR01","CR02","CR03","CR04","CR05"]);
module.exports=function budget(manifest,sizeOf,total){
 let legacyBytes=0,modernBytes=0,modernCount=0;
 for(const f of manifest.frames){
  const bytes=sizeOf(f.path);
  if(!Number.isSafeInteger(bytes)||bytes<=0)throw Error("Invalid frame size "+f.id);
  if(LEGACY.has(f.missionId))legacyBytes+=bytes;
  else {
   if(bytes>MAX_FRAME)throw Error("Frame exceeds 256 KiB: "+f.id);
   modernBytes+=bytes;modernCount++;
  }
 }
 const coreBytes=total-legacyBytes-modernBytes;
 if(!Number.isSafeInteger(coreBytes)||coreBytes<0||coreBytes>CORE_BUDGET)throw Error("Standalone core budget exceeded");
 if(legacyBytes>LEGACY_BUDGET)throw Error("Legacy art budget exceeded");
 return {maxBytes:CORE_BUDGET+LEGACY_BUDGET+modernCount*MAX_FRAME,coreBytes,legacyBytes,modernBytes};
};
