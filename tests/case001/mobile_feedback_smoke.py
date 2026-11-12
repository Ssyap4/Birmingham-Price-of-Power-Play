"""Focused mobile Case 001 smoke — no full story regression."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
EVIDENCE=['envelope','key','invoice','receipt','route','ledger','testimony','note','witness','ash','overheard']
for engine in ('chromium','webkit'):
 with sync_playwright() as p:
  browser=getattr(p,engine).launch(headless=True)
  try:
   for width,height in ((375,812),(390,844)):
    ctx=browser.new_context(viewport={'width':width,'height':height},is_mobile=True,has_touch=True,reduced_motion='reduce')
    page=ctx.new_page();errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto((ROOT/'index.html').as_uri(),wait_until='load')
    page.locator('#home.cabinet-art-ready').wait_for(timeout=15000)
    assert page.locator('#home .cabinet-entry').count()==5,('home',engine,width)
    page.evaluate("window.BirminghamHero.openSelection()")
    page.locator('#heroSelection .hero-card').nth(1).click()
    location=page.locator('#heroDetails').evaluate('e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom})')
    panel=page.locator('#heroSelection .hero-panel').evaluate('e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom})')
    assert location['top']>=panel['top']-5 and location['top']<panel['bottom'],('hero detail not visible',engine,width,location,panel)
    page.locator('#heroSelection .hero-close').click()
    page.evaluate("""() => {
     localStorage.setItem('birmingham_hero_selection_v1','jack');
     localStorage.setItem('birmingham_case_smol_heath_v1_jack',JSON.stringify({
      node:'intro',items:['envelope','key','invoice','receipt','route','ledger','testimony','note','witness','ash'],
      flags:{},trail:[],started:Date.now(),health:100,riskSeen:[],bandaged:false,medicalKits:1
     }));
     window.BirminghamCase.resume();
    }""")
    page.locator('.v34-open-inventory').click()
    modal=page.locator('.v33-window')
    assert modal.is_visible(),('inventory not visible',engine,width)
    metrics=modal.evaluate('e=>({height:e.clientHeight,scroll:e.scrollHeight,overflow:getComputedStyle(e).overflowY})')
    assert metrics['scroll']>metrics['height'] and metrics['overflow'] in ('auto','scroll'),('inventory cannot scroll',engine,width,metrics)
    modal.evaluate('e=>e.scrollTop=e.scrollHeight')
    page.wait_for_timeout(150)
    position=modal.evaluate('e=>({top:e.scrollTop,max:e.scrollHeight-e.clientHeight})')
    assert position['top']>0 and position['top']>=position['max']-5,('cannot reach bottom',engine,width,position)
    page.locator('.v33-close').click()
    page.evaluate("""() => {
     const key='birmingham_case_smol_heath_v1_jack';
     const state=JSON.parse(localStorage.getItem(key));state.items.push('overheard');
     localStorage.setItem(key,JSON.stringify(state));
     window.BirminghamCase.resume();
    }""")
    page.locator('#bh-feedback-stage').wait_for(state='visible',timeout=5000)
    notice=page.locator('#bh-feedback-stage')
    assert 'Подслушанный разговор' in notice.inner_text(),('clue title',engine,width)
    bounds=notice.bounding_box()
    assert bounds and bounds['y']>=0 and bounds['y']<height,('notice outside viewport',engine,width,bounds)
    notice.get_by_role('button',name='ОТКРЫТЬ ИНВЕНТАРЬ').click()
    assert modal.is_visible(),('notice inventory action failed',engine,width)
    assert not errors,('JS errors',engine,width,errors)
    print('PASS',engine,width,'inventory bottom / new clue / hero biography / no JS errors',flush=True)
    ctx.close()
  finally:
   browser.close()
