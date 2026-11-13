"""Apply one approved ornamental border to all five existing mobile menu illustrations.

No plot, portraits, UI behaviour, or source artwork is changed. This script only
creates five derivative preview assets, preserving all original content positions.
"""
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'preview/dossier-cinematic/assets'
FRAME = OUTPUT / 'unified-gold-frame.webp'
SOURCES = {
    'campaign': ROOT / 'assets/mobile-menu/approved-campaign.webp',
    'trials': ROOT / 'assets/mobile-menu/approved-trials.webp',
    'achievements': ROOT / 'assets/mobile-menu/approved-achievements.webp',
    'characters': ROOT / 'assets/mobile-menu/approved-dossiers.webp',
    'player': ROOT / 'preview/dossier-cinematic/my-dossier-menu-final.webp',
}
TARGET_SIZE = (984,183)

def build():
    OUTPUT.mkdir(parents=True,exist_ok=True)
    with Image.open(FRAME) as frame_file:
        frame=frame_file.convert('RGBA')
    assert frame.size==TARGET_SIZE, f'Approved frame has unexpected geometry: {frame.size}'
    assert frame.getpixel((492,90))[3]==0, 'Approved frame must keep center transparent'
    for name,source in SOURCES.items():
        with Image.open(source) as img:
            current=img.convert('RGB')
        assert current.size==TARGET_SIZE,(name,current.size)
        # Replace mismatched outer border bands with contiguous pixels
        # extrapolated from just inside the artwork. No text stretching.
        pixels=np.array(current, dtype=np.uint8)
        height,width=pixels.shape[:2]
        xx=np.clip(np.arange(width),31,width-32)
        yy=np.clip(np.arange(height),18,height-19)
        clean=Image.fromarray(pixels[yy[:,None],xx[None,:]],'RGB').convert('RGBA')
        clean.alpha_composite(frame)
        outfile=OUTPUT / f'framed-{name}.webp'
        clean.convert('RGB').save(outfile,format='WEBP',quality=92,method=6)
        with Image.open(outfile) as verify:
            assert verify.size==TARGET_SIZE
        assert outfile.stat().st_size>25000,(name,outfile.stat().st_size)
        print(f'{name:14} {outfile.stat().st_size:6d} bytes   {outfile}')
    assert len(list(OUTPUT.glob('framed-*.webp')))==5
    print('PASS: five uniformly framed approved menu illustrations; originals unchanged')

if __name__=='__main__':
    build()
