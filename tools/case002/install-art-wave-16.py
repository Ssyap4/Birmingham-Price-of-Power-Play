#!/usr/bin/env python3
"""Install exactly five SHA-locked mobile-only Case 002 WebPs from a GitHub ZIP."""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import zipfile
from io import BytesIO
from pathlib import Path
from PIL import Image

LOCKED = {
 'C01': ('1133a4c5ce3a66620c143648513d1cc28b9ced14459b05567ddfc1c8fc399137', 115710),
 'C02': ('4d56c26a865fb3507ccd29cf8f3a4d094d24ebc2cc918510c4e9b0ca7d9946a4', 147878),
 'C03': ('8c71f8242e10b1b5f8f4dfe2951479b99e4155edb8d10e4682b37e69d4c67569', 127744),
 'C04': ('445d00cfc81736104d2d3f190cee87879d318d5d3ae5787c4c09fa0e0eb8e9b6', 105098),
 'C05': ('fe05ef08354ae2133b550972d05b6c4dbdac702b4e5cd77ecf7e6f6e2394d7fb', 157208),
}

def install(archive: Path, root: Path) -> dict:
    archive, root = archive.resolve(), root.resolve()
    if not archive.is_file() or archive.stat().st_size > 4_000_000:
        raise ValueError('ZIP missing or unexpectedly large')
    manifest = root / 'src/case002/approved-art-v1.js'
    scene_dir = root / 'assets/case002/scenes'
    original = manifest.read_text(encoding='utf-8')
    anchor = ' sceneImages:Object.freeze([\n'
    if original.count(anchor) != 1:
        raise ValueError('Approval manifest anchor missing or changed')
    for sid in LOCKED:
        if re.search(r'sceneId:\s*["\x27]' + sid + r'["\x27]', original):
            raise ValueError(f'Art entry already exists for {sid}')
    if not scene_dir.is_dir():
        raise ValueError('Expected scene directory missing')
    art = {}
    with zipfile.ZipFile(archive) as z:
        if len(z.namelist()) > 24:
            raise ValueError('Unexpectedly many archive entries')
        for sid, (expected_hash, expected_size) in LOCKED.items():
            fname = f'case002-{sid.lower()}-scene--mobile.webp'
            candidates = [i for i in z.infolist() if i.filename in (fname, f'staged/{fname}')]
            if len(candidates) != 1:
                raise ValueError(f'Missing/ambiguous image for {sid}')
            info = candidates[0]
            if info.file_size != expected_size or info.file_size > 600_000:
                raise ValueError(f'Invalid byte count for {sid}')
            raw = z.read(info)
            if len(raw) != expected_size or hashlib.sha256(raw).hexdigest() != expected_hash:
                raise ValueError(f'Bad SHA-256 for {sid}')
            if raw[:4] != b'RIFF' or raw[8:12] != b'WEBP':
                raise ValueError(f'Invalid RIFF WebP for {sid}')
            with Image.open(BytesIO(raw)) as im:
                im.load()
                if im.format != 'WEBP' or im.size != (720, 900):
                    raise ValueError(f'Invalid image resolution for {sid}')
            dest = scene_dir / fname
            if dest.exists():
                raise ValueError(f'Existing file must not be replaced: {fname}')
            art[sid] = (raw, dest)
    entries=[]
    for sid,(digest,_size) in LOCKED.items():
        fname=f'case002-{sid.lower()}-scene--mobile.webp'
        cast='["mabel"]' if sid=='C04' else '[]'
        entries.append(
            '  Object.freeze({\n'
            f'   sceneId:"{sid}",variantKey:"default",review:"approved",mobileOnly:true,\n'
            f'   file:"case002-{sid.lower()}-scene.webp",cast:{cast},\n'
            f'   mobileFile:"{fname}",\n'
            '   mobileWidth:720,mobileHeight:900,\n'
            f'   mobileSha256:"{digest}"\n'
            '  }),\n'
        )
    updated=original.replace(anchor,anchor+''.join(entries),1)
    if updated.count('review:"approved"') != original.count('review:"approved"')+5:
        raise ValueError('Unexpected manifest generation result')
    for raw,dest in art.values():
        dest.write_bytes(raw)
    manifest.write_text(updated,encoding='utf-8')
    print(json.dumps({'installed':sorted(LOCKED),'scene_art_count_added':5,
                      'manifest':str(manifest.relative_to(root))},ensure_ascii=False))
    return {'installed':sorted(LOCKED)}

if __name__=='__main__':
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('archive',type=Path)
    p.add_argument('--repo-root',type=Path,default=Path.cwd())
    args=p.parse_args()
    install(args.archive,args.repo_root)
