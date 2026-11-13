"""Rebuild the approved personal-dossier button with exactly the approved menu frame.
Only touches a single preview artwork. No gameplay or scenes are modified.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
root=Path(__file__).resolve().parents[1]
base=root/'preview/dossier-cinematic'
source=Image.open(base/'approved-my-dossier-menu-hq.webp').convert('RGB')
reference=Image.open(root/'assets/mobile-menu/approved-dossiers.webp').convert('RGB')
W,H=reference.size
w,h=source.size
# The original extracted HQ image carries the prior panel's lower rim at its top.
# Preserve the art, and compress just enough to fit all title/subtitle inside frame.
content=source.crop((0,round(h*0.17),w,h)).resize((W,H-34),Image.Resampling.LANCZOS)
scene=Image.new('RGB',(W,H),(15,10,7))
scene.paste(content,(0,13))
# Exact border pixels copied from the same approved button family, including corners.
mask=Image.new('L',(W,H),0)
draw=ImageDraw.Draw(mask)
ex,ey=round(W*.024),round(H*.115)
draw.rectangle((0,0,W-1,ey),fill=255)
draw.rectangle((0,H-ey,W-1,H-1),fill=255)
draw.rectangle((0,0,ex,H-1),fill=255)
draw.rectangle((W-ex,0,W-1,H-1),fill=255)
mask=mask.filter(ImageFilter.GaussianBlur(1))
out=Image.composite(reference,scene,mask)
destination=base/'approved-my-dossier-menu-framed.webp'
out.save(destination,'WEBP',quality=91,method=6)
check=Image.open(destination)
assert check.size==(W,H) and destination.stat().st_size>25000
print(f'PASS: framed button {W}x{H}, {destination.stat().st_size} bytes')
