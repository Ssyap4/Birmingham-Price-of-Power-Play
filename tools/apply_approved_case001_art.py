#!/usr/bin/env python3
"""Install the eight user-approved Case 001 WebP illustrations, and no others."""
from __future__ import annotations
import hashlib
import json
import sys
from pathlib import Path
from zipfile import ZipFile, BadZipFile

ROOT = Path(__file__).resolve().parents[1]
APPROVED = {
    "assets/districts/centre.webp": "8a39b94cb91b32970da83d471c2fb96c7d8db6c661a0d1ae7faaa8a19f7fb9a5",
    "assets/districts/small-heath.webp": "3e736b2bc718f51477dda35e146f1e8e9f2cfa3d9e873b68dd4987d40825bc90",
    "assets/districts/digbeth.webp": "477bbfc1426438ee6f75e1206330408942bd42bf1a99b52011df8a3209247a2b",
    "assets/districts/aston.webp": "b642458df8f7300bc52d1283009b76ebb8c86659bd711f62819ed13c757422e9",
    "assets/heroes/jack.webp": "0085fd9ffb886094ce8c2ec4f349a64eb9eda8efa8958799060bdb95111b8454",
    "assets/heroes/victor.webp": "30462c2118dde1a16375fb59822d0dec856dc7aac281a5e0662df93593f1c3ea",
    "assets/case-scenes/heroJack.webp": "cc24acb300183e71094253cd29df5d9f394bbc01b5fa98d9cc870e6a3a1ef4f0",
    "assets/case-scenes/heroVictor.webp": "5a07dd915e60ec0e97bae45343ed7f769cbae18153a0e3486875d63584360566",
}
KEEP = (
    "assets/districts/jewellery.webp",
    "assets/heroes/finn.webp",
    "assets/heroes/eleanor.webp",
    "assets/heroes/samuel.webp",
    "assets/case-scenes/heroFinn.webp",
    "assets/case-scenes/heroEleanor.webp",
    "assets/case-scenes/heroSamuel.webp",
)

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def install(archive: Path) -> None:
    unchanged = {name: digest((ROOT / name).read_bytes()) for name in KEEP}
    with ZipFile(archive) as source:
        files = set(source.namelist())
        required = set(APPROVED)
        if not required.issubset(files):
            raise ValueError("Approved art archive missing: " + ", ".join(sorted(required - files)))
        allowed_extra = {"README.md", "manifest.json"}
        if files - required - allowed_extra:
            raise ValueError("Unexpected archive members: " + ", ".join(sorted(files-required-allowed_extra)))
        manifest = json.loads(source.read("manifest.json"))
        indexed = {item["path"]: item for item in manifest}
        if set(indexed) != required:
            raise ValueError("Manifest and allowed art filenames disagree")
        verified = {}
        for path, expected_sha in APPROVED.items():
            data = source.read(path)
            if not (data.startswith(b"RIFF") and data[8:12] == b"WEBP"):
                raise ValueError("Not a WebP file: " + path)
            if digest(data) != expected_sha or indexed[path]["sha256"] != expected_sha:
                raise ValueError("Approved SHA-256 mismatch: " + path)
            if len(data) > 2_000_000:
                raise ValueError("Unusually large mobile image: " + path)
            verified[path] = data
    # Only write after the entire archive has passed validation.
    for path, data in verified.items():
        (ROOT / path).write_bytes(data)
        print(f"Approved: {path} ({len(data):,} bytes)")
    for name, prior in unchanged.items():
        assert digest((ROOT / name).read_bytes()) == prior, f"Protected art changed: {name}"
    print("PASS: 8 approved assets installed, 7 protected assets untouched")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit("Usage: python tools/apply_approved_case001_art.py <approved.zip>")
    install(Path(sys.argv[1]))
