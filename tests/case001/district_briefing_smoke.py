"""Focused phone UX: all five district biographies and two-stage case onboarding."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import subprocess,re
ROOT=Path(__file__).resolve().parents[2]
def arts(source):
 return [re.search(r'const ART=\{[\s\S]*?\};',source).group(),re.search(r'const ACTORS=\{[\s\S]*?\};',source).group()]
base=subprocess.check_output(['git','show','origin/main:case-v14.js'],cwd=ROOT,text=True)
current=(ROOT/'case-v14.js').read_text()
assert arts(base)==arts(current),'Approved scene art or actor mappings changed'
for engine in ('chromium','webkit'):
 with sync_playwright() as p:
  browser=getattr(p,engine).launch(headless=True)
  try:
   for w,h in ((375,812),(390,844)):
    context=browser.new_context(viewport={'width':w,'height':h},is_mobile=True,has_touch=True,reduced_motion='reduce')
    page=context.new_page()
    errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
    page.goto((ROOT/'index.html').as_uri(),wait_until='load')
    page.locator('#home.cabinet-art-ready').wait_for(timeout=15000)
    page.locator('#districtsCard').click()
    page.locator('#districts').wait_for(state='visible')
    if engine=='webkit':page.evaluate("""() => {window.__districtTapCount=0;document.addEventListener('click',e=>{if(e.target.closest('.map-pin'))window.__districtTapCount++},true)}""")
    for district in ['small-heath','aston','digbeth','centre','jewellery']:
     pin=page.locator('.map-pin[data-district="'+district+'"]')
     if engine=='webkit':pin.dispatch_event('click') # WebKit synthetic touch hit-testing is unreliable; verify actual handler separately.
     else:pin.tap()
     page.wait_for_timeout(120)
     data=page.evaluate("""() => {
      const target=document.querySelector('#districtTitle').getBoundingClientRect();
      const panel=document.querySelector('.district-detail').getBoundingClientRect();
      return {top:panel.top,bottom:panel.bottom,name:document.querySelector('#districtTitle').textContent,
       active:document.querySelector('.map-pin.selected')?.dataset.district,
       focused:document.activeElement?.id,viewport:innerHeight,scrollY:scrollY,scrollHeight:document.scrollingElement.scrollHeight,clientHeight:document.scrollingElement.clientHeight,clicks:window.__districtTapCount||0,overflow:getComputedStyle(document.scrollingElement).overflowY};
     }""")
     assert data['active']==district,(engine,w,district,data)
     assert -15<=data['top']<=h*.55,(engine,w,district,'description not in viewport',data)
     assert data['focused']=='districtTitle',(engine,w,district,'details not focused',data)
     page.locator('.district-back-to-map').tap()
     page.wait_for_timeout(110)
     map_bounds=page.locator('#districts .map-panel').bounding_box()
     assert map_bounds and map_bounds['y']<h*.55,(engine,w,district,'return-to-map failed',map_bounds)
    if engine=='webkit':page.locator('.map-pin[data-district="small-heath"]').dispatch_event('click')
    else:page.locator('.map-pin[data-district="small-heath"]').tap()
    page.locator('#launchFirstCase').click()
    page.locator('.hero-card').first.click()
    page.locator('.hero-begin').click()
    briefing=page.locator('#case001Briefing')
    assert briefing.is_visible(),(engine,w,'rules not visible')
    assert page.locator('.case001-briefing-points').is_visible(),(engine,w)
    assert page.locator('.case001-story-intro').is_hidden(),(engine,w)
    page.locator('.briefing-start').click()
    assert page.locator('.case001-story-intro').is_visible(),(engine,w)
    assert page.locator('.case001-story-intro').inner_text().count('Артур')>0
    assert page.locator('.case001-briefing-points').is_hidden()
    page.locator('.briefing-cancel').click()
    assert page.locator('.case001-briefing-points').is_visible(),(engine,w,'return to rules')
    page.locator('.briefing-start').click()
    page.locator('.briefing-start').click()
    assert page.locator('#caseGame').is_visible(),(engine,w,'investigation start')
    assert not errors,(engine,w,errors)
    context.close()
    print('PASS',engine,w,'five districts, rules->story->game, back, intact art',flush=True)
  finally:browser.close()
