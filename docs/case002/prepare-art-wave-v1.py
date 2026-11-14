#!/usr/bin/env python3
"""Prepare mobile-only Case 002 art candidates; does NOT approve/install them.

Requirements: Pillow >= 9.0
Example:
  python docs/case002/prepare-art-wave-v1.py \
    --input-dir /path/to/candidate-webps --output-dir /path/to/staging \
    --ids C01 C02 C03 C04 C05

Input: case002-<id>-scene--mobile.webp or .png.
Output: validated WebP + report JSON/Markdown. Art approval and repository
manifest changes remain explicitly separate, human-reviewed operations.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import sys
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError

TARGET = (720, 900)
MIN_BYTES = 15_000
MAX_BYTES = 600_000
MAX_RATIO_DEVIATION = 0.007


def dhash(image: Image.Image) -> int:
    image = ImageOps.grayscale(image).resize((9, 8), Image.Resampling.LANCZOS)
    pixels = image.load()
    bits = 0
    for y in range(8):
        for x in range(8):
            bits = (bits << 1) | (pixels[x, y] > pixels[x + 1, y])
    return bits


def prepare_one(id_: str, source: Path, target: Path) -> dict:
    if not source.exists():
        raise FileNotFoundError(f"{id_}: input missing: {source}")
    with Image.open(source) as opened:
        opened.load()
        w, h = opened.size
        if h <= w or abs(w / h - TARGET[0] / TARGET[1]) > MAX_RATIO_DEVIATION:
            raise ValueError(f"{id_}: expected portrait 4:5 input, got {w}x{h}")
        image = opened.convert("RGB")
        if image.size != TARGET:
            image = image.resize(TARGET, Image.Resampling.LANCZOS)
        if source.suffix.lower() == ".webp" and opened.size == TARGET:
            if source.resolve() != target.resolve():
                shutil.copyfile(source, target)
        else:
            image.save(target, format="WEBP", quality=85, method=6)
    with Image.open(target) as decoded:
        decoded.load()
        if decoded.format != "WEBP" or decoded.size != TARGET:
            raise ValueError(f"{id_}: invalid output WebP, {decoded.format} {decoded.size}")
        fingerprint = dhash(decoded.convert("RGB"))
    filebytes = target.read_bytes()
    if not MIN_BYTES <= len(filebytes) <= MAX_BYTES:
        raise ValueError(f"{id_}: unexpected WebP size {len(filebytes)} bytes")
    if not filebytes.startswith(b"RIFF") or filebytes[8:12] != b"WEBP":
        raise ValueError(f"{id_}: not RIFF WebP")
    return {
        "sceneId": id_, "file": target.name,
        "width": TARGET[0], "height": TARGET[1],
        "bytes": len(filebytes), "sha256": hashlib.sha256(filebytes).hexdigest(),
        "dhash64": f"{fingerprint:016x}",
        "status": "candidate-not-installed",
        "visualReview": "separate-required",
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--input-dir", type=Path, required=True)
    ap.add_argument("--output-dir", type=Path, required=True)
    ap.add_argument("--ids", nargs="+", required=True)
    args = ap.parse_args()
    ids = [x.upper() for x in args.ids]
    if len(ids) != len(set(ids)) or any(len(x) != 3 or x[0] not in "ABCDEF" or not x[1:].isdigit() for x in ids):
        ap.error("--ids must be unique IDs like C01 C02")
    args.output_dir.mkdir(parents=True, exist_ok=True)
    report = []
    for id_ in ids:
        stem = f"case002-{id_.lower()}-scene--mobile"
        candidates = [args.input_dir / f"{stem}{suffix}" for suffix in (".webp", ".png")]
        matches = [x for x in candidates if x.is_file()]
        if len(matches) != 1:
            raise RuntimeError(f"{id_}: require exactly one candidate .webp or .png; found {len(matches)}")
        report.append(prepare_one(id_, matches[0], args.output_dir / f"{stem}.webp"))
    duplicates = []
    for i in range(len(report)):
        for j in range(i+1, len(report)):
            a,b=report[i],report[j]
            hamming = (int(a["dhash64"],16) ^ int(b["dhash64"],16)).bit_count()
            if a["sha256"] == b["sha256"] or hamming <= 5:
                duplicates.append({"pair":[a["sceneId"],b["sceneId"]],"hamming":hamming})
    result = {"schemaVersion":1, "batch":ids, "stage":"candidate-only", "items":report,
              "duplicateWarnings": duplicates, "approvedArtManifestModified":False}
    (args.output_dir / "candidate-report.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n", encoding="utf-8")
    rows=["# Case 002 — image candidate audit", "", "> This report is **not** an art approval or manifest install.", "",
          "| Scene | Dimensions | Bytes | SHA-256 | Review |", "|---|---:|---:|---|---|"]
    for item in report:
        rows.append(f'| {item["sceneId"]} | {item["width"]}×{item["height"]} | {item["bytes"]:,} | \`{item["sha256"]}\` | **pending install** |')
    rows += ["",f'Near-duplicate warnings: **{len(duplicates)}**.',"", "Visual approval is mandatory before adding these images to approved-art-v1.js.",""]
    (args.output_dir / "candidate-report.md").write_text("\n".join(rows),encoding="utf-8")
    print(json.dumps({"stage":result["stage"],"images":len(report),"duplicateWarnings":duplicates,
                      "output":str(args.output_dir)},ensure_ascii=False))
    return 1 if duplicates else 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except (OSError, ValueError, UnidentifiedImageError, RuntimeError) as e:
        print(f"ART GATE FAILED: {e}",file=sys.stderr)
        sys.exit(2)
