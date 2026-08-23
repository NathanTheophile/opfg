#!/usr/bin/env python3
import argparse, json, shutil
from pathlib import Path

p=argparse.ArgumentParser()
p.add_argument('repo', help='Path to local opfg checkout')
a=p.parse_args()
repo=Path(a.repo).resolve(); here=Path(__file__).resolve().parent
if not (repo/'src/game/content').exists(): raise SystemExit('Not an OPFG checkout: '+str(repo))
target=repo/'src/game/content/events/v2/ordinary/ACTIVE_PARADISE_P3_WILD_01'
if target.exists() and any(target.iterdir()): raise SystemExit('Target batch directory already exists and is non-empty: '+str(target))
target.mkdir(parents=True,exist_ok=True)
for src in sorted((here/'events').glob('*.json')):
    dst=target/src.name
    if dst.exists(): raise SystemExit('Refusing event collision: '+str(dst))
    shutil.copy2(src,dst)
for lang in ('fr','en'):
    dst=repo/f'src/game/localization/locales/{lang}.json'
    patch=json.loads((here/f'localization/{lang}.patch.json').read_text(encoding='utf-8'))
    data=json.loads(dst.read_text(encoding='utf-8'))
    collisions=sorted(set(data).intersection(patch))
    if collisions: raise SystemExit(f'Refusing {lang} locale collisions, first: {collisions[:5]}')
    data.update(patch)
    dst.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Installed {len(list((here/"events").glob("*.json")))} Event JSON files into {target}')
print(f'Merged {len(json.loads((here/"localization/fr.patch.json").read_text(encoding="utf-8")))} FR keys and {len(json.loads((here/"localization/en.patch.json").read_text(encoding="utf-8")))} EN keys.')
