#!/usr/bin/env python3
"""Install ONLY the eight pre-reviewed Case 002 WebPs, atomically into a checkout.
Usage: python3 tools/case002/install-art-wave-07.py /tmp/case002-art.zip
No scripts, assets outside allowlist, nor metadata inside the ZIP are trusted.
"""
import hashlib, json, os, pathlib, subprocess, sys, tempfile, zipfile
ROOT=pathlib.Path(__file__).resolve().parents[2]
EXPECTED={"P02": ["0d490d87cc7a48ddb7094443515e613b001fe0c06c3b693617b3f64fa8ed9cb8", "fa9399ff7bcbe07635042f2b1b4458adc2d5d84031422d5a8f2e0d0a198e3774"],
  "A02": ["681f5553aff23502d9d6882573f6450c7f4247943ec378596e8bc88aa31910cd", "396ced336efec4faf8a5d9131a58edbe2ce8ec2ffe0f3bab9eb5d0e3c552249d"],
  "A10": ["e36da533ee45e26d59aee636cab29c89b7be3779ccf4e0d555928b68c8a1f181", "71f4be91f544d5d2263203f8fd0b9f03b21e1d907bea6c7c29f55eb6c72307c6"],
  "B03": ["fd54e0972f7e326373338e936981fa19cc87558c0c1070d61359785150a4a363", "505e41792bc77ce761ea184efac9847adf89e9bdf6dc096c40624727d2d12074"]}
SHA_RE="0123456789abcdef"
def main():
    if len(sys.argv)!=2:
        raise SystemExit("Provide precisely one original wave-07 ZIP")
    archive=pathlib.Path(sys.argv[1])
    source=ROOT/"src/case002/approved-art-v1.js"
    old=source.read_text(encoding="utf-8")
    if 'sceneId:"P01"' not in old or "npcPortraits:Object.freeze([])" not in old:
        raise SystemExit("Manifest structure unexpectedly changed; abort")
    needle=" sceneImages:Object.freeze([\n"
    if old.count(needle)!=1: raise SystemExit("Manifest insertion point ambiguous")
    names={}
    for scene,(wide_hash,mobile_hash) in EXPECTED.items():
        if ('sceneId:"'+scene+'"') in old: raise SystemExit("Already installed: "+scene)
        for suffix,digest,dimensions in [("",wide_hash,(1200,675)),("--mobile",mobile_hash,(720,900))]:
            name="case002-"+scene.lower()+"-scene"+suffix+".webp"
            names["assets/case002/scenes/"+name]=(digest,dimensions,scene,suffix)
    checked={}
    with zipfile.ZipFile(archive) as z:
        if len(z.infolist())>20: raise SystemExit("Unexpected ZIP entries")
        for path,(digest,(w,h),scene,suffix) in names.items():
            entries=[x for x in z.infolist() if x.filename==path]
            if len(entries)!=1: raise SystemExit("Missing/duplicate ZIP entry: "+path)
            member=entries[0]
            if member.file_size>450000: raise SystemExit("Too large: "+path)
            raw=z.read(member)
            if hashlib.sha256(raw).hexdigest()!=digest: raise SystemExit("Checksum mismatch: "+path)
            if raw[:4]!=b"RIFF" or raw[8:12]!=b"WEBP":
                raise SystemExit("Not a WebP: "+path)
            checked[path]=raw
    records=[]
    for scene,(wide,mobile) in EXPECTED.items():
        n="case002-"+scene.lower()+"-scene.webp"
        m="case002-"+scene.lower()+"-scene--mobile.webp"
        records.append('  Object.freeze({\n'
         '   sceneId:"'+scene+'",variantKey:"default",review:"approved",\n'
         '   file:"'+n+'",cast:[],\n'
         '   width:1200,height:675,\n'
         '   sha256:"'+wide+'",\n'
         '   mobileFile:"'+m+'",\n'
         '   mobileWidth:720,mobileHeight:900,\n'
         '   mobileSha256:"'+mobile+'"\n'
         '  })')
    new=old.replace(needle,needle+",\n".join(records)+",\n",1)
    gate=ROOT/"tests/case002/b03-art-continuity.test.js"
    gate_old=gate.read_text(encoding="utf-8")
    assertion='assert(!manifest.sceneImages.some(x=>x.sceneId==="B03"),"B03 requires visual QA and real WebP before approval");'
    replacement='assert(manifest.sceneImages.some(x=>x.sceneId==="B03"),"B03 reviewed WebP must be physically installed");'
    if assertion not in gate_old: raise SystemExit("B03 gate changed unexpectedly; abort")
    # All checks passed before any tracked file is touched.
    for path,raw in checked.items():
        dest=ROOT/path
        if dest.exists(): raise SystemExit("Refusing overwrite: "+path)
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(raw)
    source.write_text(new,encoding="utf-8")
    gate.write_text(gate_old.replace(assertion,replacement),encoding="utf-8")
    print("Installed four scenes, eight hash-verified WebP files.")
if __name__=="__main__": main()
