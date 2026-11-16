#!/usr/bin/env python3
"""Decode every new WebP, verify actual bytes, manifest SHA and packaged reference."""
from pathlib import Path
import json,subprocess,hashlib
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
m=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./src/criminal/art-manifest')))"],cwd=ROOT))
content=json.loads(subprocess.check_output(['node','-e',"const C=require('./src/criminal/content');for(let i=1;i<=5;i++)require('./src/criminal/missions/cr0'+i);console.log(JSON.stringify(C.missions))"],cwd=ROOT))
seen=set();covered={k:set() for k in content};count={k:0 for k in content}
for frame in m['frames']:
 p=ROOT/frame['path'];payload=p.read_bytes();assert frame['review']=='approved';assert hashlib.sha256(payload).hexdigest()==frame['sha256'];assert frame['sha256'] not in seen,'duplicate frame';seen.add(frame['sha256'])
 with Image.open(p) as im:
  assert im.format=='WEBP' and im.size==(720,900);im.load()
 assert (ROOT/'campaign-unified-dist'/frame['path']).read_bytes()==payload
 for scene in frame['scenes']:
  assert scene in content[frame['missionId']]['scenes'] or scene in ['end:clean','end:costly','end:failed','end:dead'];assert scene not in covered[frame['missionId']],scene;covered[frame['missionId']].add(scene)
 count[frame['missionId']]+=1
for id,m in content.items():
 assert set(m['scenes']).issubset(covered[id]),(id,set(m['scenes'])-covered[id])
 assert all('end:'+e in covered[id] for e in ['clean','costly','failed','dead'])
assert len(list((ROOT/'assets/criminal').glob('*.webp')))==len(seen)
print('PASS WebP decode/SHA/720x900/package:',count)
