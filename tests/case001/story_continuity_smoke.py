"""Focused narrative + illustration invariants. Not the full 202-story suite."""
from pathlib import Path
import re, subprocess, json, os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
SOURCE=(ROOT/'case-v14.js').read_text(encoding='utf-8')
ART_RE=r'const ART=\{[\s\S]*?\};'
ACTORS_RE=r'const ACTORS=\{[\s\S]*?\};'
def block(source, pattern):
 m=re.search(pattern,source)
 assert m,('missing manifest',pattern)
 return m.group()
# Compare with untouched stable main directly: artwork and actor identity must not shift.
BASE=subprocess.check_output(['git','show','origin/main:case-v14.js'],cwd=ROOT,text=True)
assert block(SOURCE,ART_RE)==block(BASE,ART_RE),'ART mapping has changed'
assert block(SOURCE,ACTORS_RE)==block(BASE,ACTORS_RE),'ACTORS/portrait mapping has changed'
art=dict(re.findall(r'(\w+):\s*\'([^\']+)\'',block(SOURCE,ART_RE)))
assert len(art)==37,('scene art mapping count',len(art))
for scene,picture in art.items():
 assert (ROOT/'assets'/'case-scenes'/(picture+'.webp')).exists(),(scene,picture)
print('PASS approved art: all 37 scene mappings byte-identical to main and assets exist',flush=True)
def fresh(node='intro',items=(),trail=(),flags=None):
 return dict(node=node,items=list(items),flags=flags or {},trail=list(trail),ending=None,started=987654321,
 health=100,riskSeen=[],bandaged=False,medicalKits=1,medicalKitFound=False,deathCause='')
def choose(page,text):
 btn=page.locator('#caseChoices button').filter(has_text=text).first
 assert btn.count() and btn.is_visible() and btn.is_enabled(),('choice unavailable',text)
 btn.click()
def has(page,text):
 return page.locator('#caseChoices button').filter(has_text=text).count()>0
def state(page):
 return page.evaluate("JSON.parse(localStorage.getItem('birmingham_case_smol_heath_v1_jack'))")
def load(page,node='intro',items=(),trail=(),flags=None):
 value=fresh(node,items,trail,flags)
 page.evaluate("""data=>{
  localStorage.setItem('birmingham_hero_selection_v1','jack');
  localStorage.setItem('birmingham_case_smol_heath_v1_jack',JSON.stringify(data));
  window.BirminghamCase.resume();
 }""",value)
def art_for(page,key):
 background=page.locator('#caseArt').evaluate('e=>e.style.backgroundImage')
 assert art[key]+'.webp' in background,(key,background)
def check(browser,engine):
 page=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
 errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
 page.goto((ROOT/'index.html').as_uri(),wait_until='load')
 page.locator('#home.cabinet-art-ready').wait_for(timeout=15000)
 # All approved pictures are still picked for their own scene (including each ending).
 for key in art:
  load(page,key)
  art_for(page,key)
 print('PASS',engine,'all 37 illustrations assigned to their original scene',flush=True)
 # Returning to Evelyn must not replay her first encounter.
 load(page,'office',items=('key','invoice'),trail=('intro','widow'))
 choose(page,'Вернуться к Эвелин')
 assert state(page)['node']=='widow'
 assert 'Ключ от склада уже у тебя' in page.locator('#caseText').inner_text()
 art_for(page,'widow')
 # Guard deal is irreversible.
 load(page,'canal',items=('route',),trail=('intro','canal','bribe','warehouse','reed'),flags={'guard':True})
 assert not has(page,'Подкупить сторожа')
 # No reset of Reed after accusation/exposure.
 load(page,'canal',trail=('intro','reed','accuse'),flags={'reedAlert':True})
 assert not has(page,'Сначала поговорить с Ридом')
 load(page,'canal',items=('ledger','testimony'),trail=('intro','reed','reedProof','confession'),flags={})
 assert not has(page,'Сначала поговорить с Ридом')
 assert state(page)['flags']['reedExposed']
 # Arthur can be rescued exactly once, then the finale remains completable.
 load(page,'pump')
 choose(page,'Осмотреть двор')
 choose(page,'Пробраться через решётку')
 assert state(page)['flags']['arthurFreed']
 choose(page,'Остановить Крейна')
 assert 'Артур уже освобождён' in page.locator('#caseText').inner_text()
 assert not has(page,'Отступить и искать другой вход')
 assert has(page,'Увести освобождённого Артура')
 choose(page,'Увести освобождённого Артура')
 assert state(page)['node']=='endingRescue'
 art_for(page,'endingRescue')
 # Retreat from Crane cannot create an endless yard <-> confront loop.
 load(page,'confront')
 choose(page,'Отступить и искать другой вход')
 assert state(page)['node']=='yard'
 assert not has(page,'Выйти к Крейну')
 assert has(page,'Пробраться через решётку')
 # Trading away the ledger has a coherent chase ending, not a teleport.
 load(page,'trade',items=('route',),flags={'traded':True})
 choose(page,'Попытаться перехватить папку')
 assert state(page)['node']=='endingEvidence'
 assert 'автомобилю' in page.locator('#caseText').inner_text()
 art_for(page,'endingEvidence')
 # The original evidence scene retains its visual even after the ledger was collected earlier.
 load(page,'warehouse',items=('ledger',),trail=('intro','widow','canal','unlock'))
 assert 'дополнительные записи' in page.locator('#caseText').inner_text()
 art_for(page,'warehouse')
 # Six ending illustration assignments checked above; no browser script errors.
 assert not errors,(engine,errors)
 print('PASS',engine,'one-time actions, saved flags, Arthur, Reed, trade and no JS errors',flush=True)
 page.context.close()
with sync_playwright() as p:
 for engine in ('chromium','webkit'):
  browser=getattr(p,engine).launch(headless=True)
  try: check(browser,engine)
  finally:browser.close()
