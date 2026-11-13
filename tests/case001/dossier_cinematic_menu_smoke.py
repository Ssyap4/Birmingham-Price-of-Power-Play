"""Focused Case 001 cosmetic and navigation audit on real Chromium/WebKit."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re,subprocess
ROOT=Path(__file__).resolve().parents[2]
base=subprocess.check_output(['git','show','origin/main:case-v14.js'],cwd=ROOT,text=True)
current=(ROOT/'case-v14.js').read_text()
for n in ('ART','ACTORS'):
 pattern=r'const '+n+r'=\{[\s\S]*?\};'
 assert re.search(pattern,base).group()==re.search(pattern,current).group(),'Approved '+n+' changed'
for name in ('dossier-archive-scene.svg','dossier-unknown-detective.svg'):
 assert (ROOT/'assets'/'dossier'/name).is_file(),name
for engine in ('chromium','webkit'):
 with sync_playwright() as p:
  browser=getattr(p,engine).launch(headless=True)
  try:
   for width,height in ((375,812),(390,844),(1280,800)):
    ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=width<700,has_touch=width<700,reduced_motion='reduce')
    page=ctx.new_page();errors=[];missing=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('requestfailed',lambda req:missing.append(req.url))
    page.goto((ROOT/'index.html').as_uri(),wait_until='load')
    page.locator('#home.cabinet-art-ready').wait_for(timeout=15000)
    assert page.locator('#cabinetSettings').count()==0,('old menu settings',engine,width)
    assert page.locator('#cabinetPlayerDossier').is_visible(),('new dossier entry',engine,width)
    assert page.locator('#profileCard').is_visible(),('five heroes entry vanished',engine,width)
    assert page.locator('#bhMusic').count()==1 and page.locator('#bhEffects').count()==1,('audio toggles missing',engine,width)
    page.locator('#cabinetPlayerDossier').click()
    assert page.locator('#profile').is_visible() and page.locator('.pd-alias').is_visible(),('wrong player profile',engine,width)
    for selector,path in [('.pd-hero','dossier-archive-scene.svg'),('.pd-identity','dossier-unknown-detective.svg')]:
     image=page.locator(selector).evaluate('e=>getComputedStyle(e).backgroundImage')
     assert path in image,(engine,width,selector,image)
    assert page.evaluate("document.documentElement.scrollWidth")<=width+3,('overflow in profile',engine,width)
    page.locator('#homeBtn').click()
    assert page.locator('#home').is_visible()
    page.locator('#profileCard').click()
    assert page.locator('#campaignDossiers').is_visible() and page.locator('#profile').is_hidden(),('hero/player dossier confusion',engine,width)
    page.locator('#campaignDossiers .campaign-back-profile').click()
    assert page.locator('#profile').is_visible(),('back to profile',engine,width)
    assert not errors,('Javascript runtime',engine,width,errors)
    assert not [r for r in missing if 'dossier' in r],('missing dossier images',engine,width,missing)
    ctx.close()
    print('PASS',engine,width,'player vs heroes, 2 art assets, settings removed, music remains, no overflow',flush=True)
  finally:browser.close()
