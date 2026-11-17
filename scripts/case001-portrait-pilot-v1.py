#!/usr/bin/env python3
"""Reproduce reviewed Case001 pilot; candidates and diagnostics only."""
import argparse
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw
from PIL import __version__ as pillow_version

SPECS = [
    ("intro", "intro.webp", (1672, 941), (510, 0, 1262, 940), "33e511c0362063675bb4f79a7a35faebea213c88188318637ff35740ee600065", "rejected"),
    ("envelope", "envelope.webp", (1672, 941), (465, 0, 1217, 940), "4005ac22ada654fce5e19a833941f3259f6aaa6730fc4938b2ef99942a926c20", "rejected"),
    ("widow", "widow-home.webp", (1671, 941), (470, 0, 1222, 940), "572811a0262bd11aebf16ad36bc221b7e827313b5d73f21d8b97e5a64340edcf", "rejected"),
    ("endingRescue", "endingRescue-approved.webp", (1448, 1086), (290, 0, 1158, 1085), "aa0bdb13ee24b2d5aa964ff7af5e5de55c80e7092e8224ce5507b16bd7493dc0", "candidate"),
]
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--root", type=Path, default=Path("."))
    ap.add_argument("--output", type=Path, default=Path("work/case001-portrait-pilot"))
    args = ap.parse_args()
    original_dir = (args.root / "assets/case-scenes").resolve()
    output = args.output.resolve()
    if output == original_dir or original_dir in output.parents:
        raise ValueError("Never write candidates under the original art directory")
    output.mkdir(parents=True, exist_ok=True)
    candidates = output / "portrait-candidates"
    candidates.mkdir(exist_ok=True)
    rows = []
    sheet = Image.new("RGB", (1280, 710), "#25221e")
    draw = ImageDraw.Draw(sheet)
    for i, (scene, filename, dims, box, expected, decision) in enumerate(SPECS):
        source = original_dir / filename
        if sha(source) != expected:
            raise ValueError("Source hash changed: " + filename)
        with Image.open(source) as im:
            if im.size != dims:
                raise ValueError("Unexpected source dimensions: " + filename)
            original = im.convert("RGB")
        left, top, right, bottom = box
        if not (0 <= left < right <= dims[0] and 0 <= top < bottom <= dims[1]
                and (right-left)*5 == (bottom-top)*4):
            raise ValueError("Invalid exact 4:5 crop: " + scene)
        crop = original.crop(box).resize((720, 900), Image.Resampling.LANCZOS)
        x = i*320
        thumbnail = original.copy()
        thumbnail.thumbnail((310, 250))
        sheet.paste(thumbnail, (x+(320-thumbnail.width)//2, 24))
        sheet.paste(crop.resize((310, 388), Image.Resampling.LANCZOS), (x+5, 283))
        draw.text((x+5, 5), scene + " / " + decision, fill="white")
        draw.text((x+5, 680), str(box), fill="white")
        row = {"scene": scene, "source": filename, "source_sha256": expected,
               "source_dimensions": dims, "crop": box, "decision": decision}
        if decision == "candidate":
            dest = candidates / (scene + "--mobile.webp")
            crop.save(dest, "WEBP", quality=92, method=6)
            with Image.open(dest) as check:
                check.load()
                if check.size != (720, 900):
                    raise ValueError("Candidate dimensions incorrect")
                candidate = check.convert("RGB")
            row["candidate_sha256"] = sha(dest)
            row["candidate_dimensions"] = [720, 900]
            widths = (320, 390, 430)
            compare = Image.new("RGB", (sum(widths)+32, 950), "#25221e")
            labels = ImageDraw.Draw(compare)
            offset = 8
            for width in widths:
                labels.text((offset, 7), f"{width} px / original then candidate", fill="white")
                a = original.resize((width, round(width / original.width * original.height)), Image.Resampling.LANCZOS)
                b = candidate.resize((width, round(width*900/720)), Image.Resampling.LANCZOS)
                compare.paste(a, (offset, 30))
                compare.paste(b, (offset, 40+a.height))
                offset += width+8
            compare.save(output / "endingRescue-widths.jpg", quality=95)
        if sha(source) != expected:
            raise ValueError("Original changed during export")
        rows.append(row)
    sheet.save(output / "pilot-comparison.jpg", quality=95)
    (output / "manifest.json").write_text(json.dumps({"pillow": pillow_version, "scenes": rows}, indent=2)+"\n", encoding="utf-8")
    print("Pilot only: 1 candidate, 3 rejected trials, original hashes unchanged.")

if __name__ == "__main__":
    main()
