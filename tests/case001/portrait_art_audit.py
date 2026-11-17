"""Read-only real-asset portrait audit for Case 001. No generated crop is approved."""
from pathlib import Path
import re, json, hashlib, math
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"work"/"case001-portrait-audit"
OUT.mkdir(parents=True,exist_ok=True)
source=(ROOT/"case-v14.js").read_text(encoding="utf-8")
block=re.search(r"const ART=\{(.*?)\};",source,re.S)
assert block, "No active ART"
art=dict(re.findall(r"([A-Za-z]\w*):\s*'([^']+)'",block.group(1)))
groups={"wide":["canal","yard","escort"],"detail":["envelope","searchOffice","unlock","warehouse","heroFinn","heroEleanor","heroSamuel","confession"],"scene":["intro","widow","interview","office","warn","bribe","sneak","listen","reed","reedProof","accuse","pretend","pump","rescue","confront","trade","expose","pressure","heroJack","heroVictor"],"ending":["endingRescue","endingEvidence","endingDeal","endingTruth","endingPower","endingDeath"]}
group_of={scene:kind for kind,scenes in groups.items() for scene in scenes}
assert len(art)==37 and len(group_of)==37 and set(art)==set(group_of)
W,H=216,270
try:
    font=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",16)
    small=ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",13)
except OSError:
    font=small=ImageFont.load_default()
records=[]
for n,(scene,name) in enumerate(art.items()):
    path=ROOT/"assets"/"case-scenes"/(name+".webp")
    data=path.read_bytes()
    with Image.open(path) as image:
        assert image.format=="WEBP",path
        image.load()
        im=ImageOps.exif_transpose(image).convert("RGB")
    iw,ih=im.size
    ratio=iw/ih
    keep=min(ratio/(4/5),(4/5)/ratio)
    full=ImageOps.contain(im,(W,H),Image.Resampling.LANCZOS)
    crop=ImageOps.fit(im,(W,H),Image.Resampling.LANCZOS)
    record={"scene":scene,"source":str(path.relative_to(ROOT)),"sha256":hashlib.sha256(data).hexdigest(),
      "dimensions":[iw,ih],"center_crop_retained_percent":round(keep*100,1),
      "story_group":group_of[scene],"review":"pending","decision":None}
    records.append(record)
    if n%6==0:
        sheet=Image.new("RGB",(940,1110),"#18130f")
        draw=ImageDraw.Draw(sheet)
        draw.text((14,12),"CASE 001 | ORIGINAL vs CENTER CROP TEST | NOT APPROVED",font=font,fill="#ebce9e")
    pos=n%6
    x=14+(pos%2)*460
    y=45+(pos//2)*350
    for offset,thumb,label in [(0,full,"FULL ORIGINAL"),(W+10,crop,"4:5 TEST ONLY")]:
        draw.rectangle((x+offset,y+24,x+offset+W-1,y+24+H-1),fill="#251d17",outline="#98784f")
        sheet.paste(thumb,(x+offset+(W-thumb.width)//2,y+24+(H-thumb.height)//2))
        draw.text((x+offset,y+5),label,font=small,fill="#dcc19b")
    draw.text((x,y+300),f"{scene} | {iw}x{ih} | kept {keep*100:.1f}%",font=font,fill="#f0dcc2")
    draw.text((x,y+322),f"{name}.webp | {group_of[scene]} | pending",font=small,fill="#c6ae91")
    if n%6==5 or n==len(art)-1:
        sheet.save(OUT/f"comparison-{n//6+1:02d}.jpg",quality=91,optimize=True)
assert len(records)==37
manifest={"base":"1109e7bf19f5b5a2477ef609cdedaa07caddfb14","note":"Technical evidence only. No crop or candidate is approved or integrated.","scenes":records,
          "wide":sum(x["dimensions"][0]>x["dimensions"][1] for x in records),
          "portrait":sum(x["dimensions"][0]<x["dimensions"][1] for x in records),
          "square":sum(x["dimensions"][0]==x["dimensions"][1] for x in records)}
(OUT/"portrait-review.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
print("PASS 37 decoded originals; orientation counts:",{k:manifest[k] for k in ("wide","portrait","square")})
print("Seven comparison sheets; all candidate decisions remain pending.")
