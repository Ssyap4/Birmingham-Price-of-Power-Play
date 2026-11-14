#!/usr/bin/env python3
"""Prepare byte-exact Base64 bridge files for approved Case 002 WebPs.

Does NOT approve, upload or alter the game manifest. One independent text
bridge file is produced per WebP, with Git-blob SHA-1 and content SHA-256.
"""
from __future__ import annotations
import argparse
import base64
import hashlib
import json
import re
from pathlib import Path

def git_blob_sha(raw: bytes) -> str:
    return hashlib.sha1(f"blob {len(raw)}\0".encode() + raw).hexdigest()

def export(input_dir: Path, output_dir: Path, ids: list[str]) -> dict:
    if not ids or len(set(ids)) != len(ids) or any(not re.fullmatch(r'[A-Z]\d\d', x) for x in ids):
        raise ValueError('Expected unique scene IDs like C01 C02')
    output_dir.mkdir(parents=True, exist_ok=True)
    items = []
    for sid in ids:
        name = f'case002-{sid.lower()}-scene--mobile.webp'
        source = input_dir / name
        if not source.is_file():
            raise ValueError(f'Missing image: {source}')
        raw = source.read_bytes()
        if len(raw) < 15000 or len(raw) > 600000 or not raw.startswith(b'RIFF') or raw[8:12] != b'WEBP':
            raise ValueError(f'Invalid WebP signature / size: {source}')
        encoded = base64.b64encode(raw).decode('ascii')
        parts = [encoded[i:i+2048] for i in range(0, len(encoded), 2048)]
        bridge = f'{sid.lower()}.b64.txt'
        (output_dir / bridge).write_text('\n'.join(parts)+'\n', encoding='ascii')
        items.append({'sceneId':sid,'webpFile':name,'bridgeFile':bridge,'bytes':len(raw),
                      'gitBlobSha1':git_blob_sha(raw),
                      'sha256':hashlib.sha256(raw).hexdigest(),
                      'base64Length':len(encoded)})
    report={'schemaVersion':1,'stage':'bridge-prepared-only',
            'approvedArtManifestModified':False,'items':items}
    (output_dir / 'bridge-report.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(json.dumps({'stage':report['stage'],'files':len(items),'output':str(output_dir)},ensure_ascii=False))
    return report

def main() -> None:
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--input-dir',type=Path,required=True)
    p.add_argument('--output-dir',type=Path,required=True)
    p.add_argument('--ids',nargs='+',required=True)
    args=p.parse_args()
    export(args.input_dir,args.output_dir,args.ids)

if __name__=='__main__':
    main()
