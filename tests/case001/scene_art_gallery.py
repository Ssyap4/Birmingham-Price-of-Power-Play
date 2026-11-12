"""Create a visual, truthful contact sheet of actual Case 001 illustrations.

Uses checked-in WebP assets, not conceptual art. Generated output is QA material,
not approval. Run in CI to inspect every scene, including repeated-file mappings.
"""
from __future__ import annotations

import hashlib
import json
import math
import re
from collections import defaultdict
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SOURCE = (ROOT / 'case-v14.js').read_text(encoding='utf-8')
ART_DIR = ROOT / 'assets' / 'case-scenes'
OUT = ROOT / 'tests' / 'case001' / 'artifacts' / 'scene-art-gallery'
OUT.mkdir(parents=True, exist_ok=True)
match = re.search(r'const ART=\{(.*?)\};', SOURCE, re.S)
assert match, 'Cannot find ART manifest in case-v14.js'
art = dict(re.findall(r'([A-Za-z]\w*):\s*\'([^\']+)\'', match.group(1)))
assert len(art) == 37, f'Expected 37 Case 001 scenes, got {len(art)}'
scene_order = [
    'intro', 'envelope', 'widow', 'interview', 'office', 'searchOffice',
    'warn', 'canal', 'bribe', 'sneak', 'unlock', 'warehouse', 'listen',
    'reed', 'reedProof', 'accuse', 'pretend', 'confession', 'escort',
    'pump', 'yard', 'rescue', 'confront', 'trade', 'expose', 'pressure',
    'heroJack', 'heroFinn', 'heroEleanor', 'heroVictor', 'heroSamuel',
    'endingRescue', 'endingEvidence', 'endingDeal', 'endingTruth',
    'endingPower', 'endingDeath',
]
assert set(scene_order) == set(art), f'Missing from scene order: {set(art) - set(scene_order)}'

try:
    font_path = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
    title_font = ImageFont.truetype(font_path, 24)
    meta_font = ImageFont.truetype(font_path, 18)
    header_font = ImageFont.truetype(font_path, 32)
except OSError:
    title_font = meta_font = header_font = ImageFont.load_default()

by_file = defaultdict(list)
records = []
for scene in scene_order:
    filename = art[scene] + '.webp'
    by_file[filename].append(scene)
    path = ART_DIR / filename
    r = {'scene': scene, 'filename': filename, 'exists': path.is_file()}
    if path.is_file():
        data = path.read_bytes()
        r['bytes'] = len(data)
        r['sha256'] = hashlib.sha256(data).hexdigest()
        try:
            with Image.open(path) as image:
                image.load()
                r['dimensions'] = [image.width, image.height]
                r['format'] = image.format
        except (OSError, ValueError) as exc:
            r['decode_error'] = str(exc)
    records.append(r)

WIDTH, HEIGHT = 480, 270
GAP, LABEL_HEIGHT, TOP = 14, 70, 75
COLS, ROWS = 3, 7
PAGE_SIZE = COLS * ROWS
sheet_w = COLS * WIDTH + (COLS + 1) * GAP
sheet_h = TOP + ROWS * (HEIGHT + LABEL_HEIGHT + GAP) + GAP
for page in range(math.ceil(len(scene_order) / PAGE_SIZE)):
    sheet = Image.new('RGB', (sheet_w, sheet_h), (17, 17, 21))
    draw = ImageDraw.Draw(sheet)
    draw.text((GAP, 16), f'CASE 001 - ACTUAL ASSETS - SHEET {page+1}/{math.ceil(len(scene_order) / PAGE_SIZE)}', fill=(230, 218, 190), font=header_font)
    group = records[page * PAGE_SIZE:(page+1) * PAGE_SIZE]
    for i, record in enumerate(group):
        col, row = i % COLS, i // COLS
        x = GAP + col * (WIDTH + GAP)
        y = TOP + row * (HEIGHT + LABEL_HEIGHT + GAP)
        scene = record['scene']
        name = record['filename']
        path = ART_DIR / name
        if record.get('decode_error') or not path.exists():
            thumb = Image.new('RGB', (WIDTH, HEIGHT), (85, 24, 24))
            ImageDraw.Draw(thumb).text((24, 100), 'MISSING / UNREADABLE', fill='white', font=title_font)
        else:
            with Image.open(path) as source:
                source = ImageOps.exif_transpose(source).convert('RGB')
                thumb = ImageOps.fit(source, (WIDTH, HEIGHT), Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        sheet.paste(thumb, (x, y))
        draw.rectangle((x, y, x + WIDTH - 1, y + HEIGHT - 1), outline=(111, 94, 69), width=2)
        reused = len(by_file[name]) > 1
        marker = ' [REUSED]' if reused else ''
        draw.text((x + 7, y + HEIGHT + 5), f'{page*PAGE_SIZE+i+1:02d}. {scene}{marker}',
                  fill=(246, 205, 130) if reused else (235, 232, 224), font=title_font)
        draw.text((x + 7, y + HEIGHT + 37), f'{name} - {record.get("dimensions", "NO IMAGE")}',
                  fill=(174, 177, 180), font=meta_font)
    sheet.save(OUT / f'contact-{page+1}.jpg', quality=88, optimize=True)

manifest = {
    'note': 'Visual review only. Reused or existing artwork is NOT automatically story-approved.',
    'total_scenes': len(records),
    'distinct_files': len(by_file),
    'reused_files': {file: scenes for file, scenes in by_file.items() if len(scenes) > 1},
    'scene_assets': records,
}
(OUT / 'asset-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
missing = [r['scene'] for r in records if not r['exists'] or r.get('decode_error')]
print(f'Case 001 gallery: {len(records)} scenes, {len(by_file)} distinct files, {len(missing)} missing or unreadable')
if missing:
    raise SystemExit(f'Missing or unreadable art: {missing}')