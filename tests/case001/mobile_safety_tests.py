"""Phone-first Chromium/WebKit smoke: real taps, landscape cabinet, safe controls, dialogs."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'tests'/'case001'/'artifacts'/'mobile-platform'
OUT.mkdir(parents=True,exist_ok=True)
ENGINE=os.environ.get('BIRMINGHAM_MOBILE_BROWSER','chromium')
SIZES=[(667,375),(812,375),(844,390),(932,430),(915,412)]
def rect(page,selector):
 return page.locator(selector).evaluate("""e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom}}""")
def intersects(a,b):
 return (a['left']<b['right']-1 and a['right']>b['left']+1 and a['top']<b['bottom']-1 and a['bottom']>b['top']+1)
with sync_playwright() as p:
 engine=getattr(p,ENGINE)
 browser=engine.launch(headless=True)
 for width,height in SIZES:
  ctx=browser.new_context(viewport={"width":width,"height":height},device_scale_factor=2,is_mobile=True,has_touch=True,reduced_motion='reduce')
  page=ctx.new_page()
  errors=[];page.on('pageerror',lambda err:errors.append(str(err)))
  page.goto((ROOT/'index.html').as_uri(),wait_until='load')
  page.locator('#home.cabinet-art-ready').wait_for(timeout=15000)
  assert page.locator('#cabinetRotatePrompt').is_hidden(),(ENGINE,width,height,'unexpected rotate prompt')
  if width in (667,844,932):page.screenshot(path=str(OUT/f'{ENGINE}-home-{width}.png'),full_page=True)
  assert page.locator('#home .cabinet-entry').count()==5
  # Regression for iPhone landscape: all five art-backed buttons must be
  # visible inside the actual visual viewport, without scrolling the document.
  page.wait_for_timeout(750)
  bounds=page.evaluate("""() => {
   const vv=window.visualViewport;
   const h=Math.min(window.innerHeight,vv?.height||window.innerHeight);
   const scene=document.querySelector('#home .cabinet-scene').getBoundingClientRect();
   const menu=document.querySelector('#home .cabinet-menu').getBoundingClientRect();
   const buttons=[...document.querySelectorAll('#home .cabinet-entry')].map(e=>{
    const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height};
   });
   return {active:document.documentElement.classList.contains('bh-phone-landscape'),
    h,scene:{top:scene.top,bottom:scene.bottom},menu:{top:menu.top,bottom:menu.bottom},buttons,
    header:getComputedStyle(document.querySelector('body>.shell>.top')).display,
    docWidth:document.documentElement.scrollWidth};
  }""")
  assert bounds['active'],(ENGINE,width,height,'iPhone layout not active',bounds)
  assert bounds['header']=='none',(ENGINE,width,height,'duplicate global header remains',bounds)
  assert bounds['scene']['top']>=-3,(ENGINE,width,height,'cabinet starts offscreen',bounds)
  assert bounds['scene']['bottom']<=bounds['h']+3,(ENGINE,width,height,'cabinet exceeds visual viewport',bounds)
  assert all(b['top']>=-2 and b['bottom']<=bounds['h']+3 for b in bounds['buttons']),(ENGINE,width,height,'illustrated button clipped',bounds)
  assert bounds['menu']['bottom']<=bounds['h']+3,(ENGINE,width,height,'menu clipped',bounds)
  assert bounds['docWidth']<=width+3,(ENGINE,width,height,'horizontal overflow',bounds)
  shade=page.evaluate("getComputedStyle(document.querySelector('#home .cabinet-scene'),'::before').display")
  assert shade=='none',(ENGINE,width,height,'portrait gradient still obscures cabinet in landscape',shade)
  # Baked-in artwork labels and DOM labels must never paint simultaneously on WebKit.
  layer=page.locator('#home.cabinet-art-ready .cabinet-entry').first
  assert layer.get_attribute('aria-label'), (ENGINE,width,'illustrated button has no accessible name')
  assert layer.locator('.cabinet-entry-copy').evaluate("el=>getComputedStyle(el).display")=='none',(ENGINE,width,'DOM text overlaps artwork')
  assert page.locator('#home.cabinet-art-ready .cabinet-heading').locator('*').first.evaluate("el=>getComputedStyle(el).display")=='none',(ENGINE,width,'heading text overlaps artwork')

  heights=page.locator('#home .cabinet-entry').evaluate_all("els=>els.map(e=>e.getBoundingClientRect().height)")
  assert all(h>=43 for h in heights),(ENGINE,width,'small menu tap target',heights)
  assert page.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth+3'),(ENGINE,width,'horizontal home overflow')
  # Campaign hubs must remain reachable and tappable on landscape devices.
  page.locator('#profileCard').click()
  assert page.locator('#campaignDossiers').is_visible(),(ENGINE,width,'dossiers hidden')
  assert page.locator('#campaignDossiers .campaign-card').count()==5
  if width in (667,844,932):
   page.screenshot(path=str(OUT/f'{ENGINE}-dossiers-{width}.png'),full_page=True)
  page.locator('#campaignDossiers .campaign-tabs [data-open-section=campaignAchievements]').click()
  assert page.locator('#campaignAchievements .campaign-award').count()==42
  assert page.locator('#campaignAchievements .campaign-reward-card').count()==30
  if width in (667,844,932):
   page.screenshot(path=str(OUT/f'{ENGINE}-achievements-{width}.png'),full_page=True)
  page.locator('#campaignAchievements .campaign-tabs [data-open-section=campaignHistory]').click()
  assert page.locator('#campaignHistory').is_visible()
  if width in (667,844,932):
   page.screenshot(path=str(OUT/f'{ENGINE}-history-{width}.png'),full_page=True)
  page.locator('#homeBtn').click()
  page.locator('#districtsCard').click()
  assert page.locator('#districts').is_visible()
  if width in (667,844,932):
   page.screenshot(path=str(OUT/f'{ENGINE}-districts-{width}.png'),full_page=True)
  page.locator('#launchFirstCase').click()
  assert page.locator('#heroSelection').is_visible()
  assert page.locator('#heroCards .hero-card').count()==5
  if width in (667,844,932):
   page.screenshot(path=str(OUT/f'{ENGINE}-heroes-{width}.png'),full_page=False)
  page.locator('#heroSelection .hero-begin').click()
  if page.locator('#case001Briefing').is_visible():
   page.locator('#case001Briefing .briefing-start').click()
  assert page.locator('#caseGame').is_visible()
  assert page.locator('body>.shell>.top').evaluate('e=>getComputedStyle(e).display')=='none',(ENGINE,width,'redundant top header covers case scene')
  assert page.locator('#caseGame > .bh-audio-controls').count()==1,(ENGINE,width,'utilities must dock in the story layout')
  heights=page.locator('#caseGame > .bh-audio-controls button').evaluate_all('els=>els.map(e=>e.getBoundingClientRect().height)')
  assert all(h>=43 for h in heights),(ENGINE,width,'toolbar targets too small',heights)
  toolbar=rect(page,'#caseGame > .bh-audio-controls')
  storyRect=rect(page,'#caseScene')
  assert toolbar['bottom']<=storyRect['top']+1,(ENGINE,width,'toolbar obstructs story',toolbar,storyRect)

  page.wait_for_timeout(480) # Allow screenshot frame to settle.
  if width in (667,844,932):page.screenshot(path=str(OUT/f'{ENGINE}-case-{width}.png'),full_page=True)
  # Every case beat must map to the correct one of the five left-side images.
  cases=[('intro','intro.webp'),('office','office-approved.webp'),('canal','canal-approved.webp'),('reed','reed.webp'),('pump','pump.webp')]
  for node,image in cases:
   page.evaluate("""([node])=>{
    const key='birmingham_case_smol_heath_v1_jack';
    const s=JSON.parse(localStorage.getItem(key));s.node=node;
    localStorage.setItem(key,JSON.stringify(s));window.BirminghamCase.resume();
   }""",[node])
   page.wait_for_function("expected=>document.querySelector('.v18-case-art').dataset.chapterImage===expected",arg=image)
   file=page.locator('.v18-case-art').get_attribute('data-chapter-image')
   assert file==image,(ENGINE,width,'incorrect chapter image',node,file,image)
   painted=page.locator('.v18-case-art').evaluate("el=>getComputedStyle(el).backgroundImage")
   assert '/'+image in painted,(ENGINE,width,'wrong actually painted sidebar image',node,image,painted)
   assert 'city.webp' not in painted,(ENGINE,width,'stale hard-coded city image',node,painted)
  page.evaluate("""()=>{
    const key='birmingham_case_smol_heath_v1_jack';
    const s=JSON.parse(localStorage.getItem(key));s.node='intro';
    localStorage.setItem(key,JSON.stringify(s));window.BirminghamCase.resume();
  }""")
  assert page.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth+3'),(ENGINE,width,'horizontal case overflow')
  assert page.locator('.case-v18-footer').count()==0
  # Non-intersecting audio/exit controls, even across Telegram-like landscape sizes.
  controls=[rect(page,'#bhMusic'),rect(page,'#bhEffects'),rect(page,'#gameExitBtn')]
  assert all(0<=r['left'] and r['right']<=width+3 for r in controls),(ENGINE,width,controls)
  assert all(not intersects(controls[i],controls[j]) for i in range(3) for j in range(i+1,3)),(ENGINE,width,'controls overlap',controls)
  page.locator('#caseChoices .case-choice').first.click()
  assert page.locator('#caseGame').is_visible()
  # Supply and wound notifications are informative and must not intercept taps.
  toast=page.locator('#caseHealthToasts .case-health-toast')
  if toast.count():
   assert toast.first.evaluate("e=>getComputedStyle(e).pointerEvents")=='none'
  page.locator('.v34-open-inventory').click()
  assert page.locator('.v33-shade').is_visible()
  shadeRect=rect(page,'.v33-shade')
  assert abs(shadeRect['left'])<=2 and abs(shadeRect['top'])<=2,(ENGINE,width,'modal not fixed to screen',shadeRect)
  assert abs(shadeRect['right']-width)<=2,(ENGINE,width,'modal not viewport wide',shadeRect)
  toastVisible=page.evaluate("()=>{const el=document.getElementById('caseHealthToasts');return el?getComputedStyle(el).display:'none'}")
  assert toastVisible=='none',(ENGINE,width,'health toast overlaps inventory',toastVisible)

  if width in (667,844,932):
   page.screenshot(path=str(OUT/f'{ENGINE}-inventory-{width}.png'),full_page=False)
   page.locator('.v33-window').evaluate('el=>el.scrollTop=Math.min(el.scrollHeight,Math.floor(el.scrollHeight/2))')
   page.screenshot(path=str(OUT/f'{ENGINE}-inventory-middle-{width}.png'),full_page=False)
   page.locator('.v33-window').evaluate('el=>el.scrollTop=el.scrollHeight')
   page.screenshot(path=str(OUT/f'{ENGINE}-inventory-bottom-{width}.png'),full_page=False)
  win=rect(page,'.v33-window')
  assert win['left']>=-2 and win['right']<=width+2,(ENGINE,width,'inventory overflows',win)
  page.locator('.v33-close').click()
  assert page.locator('.v33-shade').is_hidden()
  page.locator('#caseBack').click()
  assert page.locator('#districts').is_visible(),(ENGINE,width,'cannot return to city')
  assert page.locator('#gameExitBtn').is_visible(),(ENGINE,width,'exit hidden after returning to city')

  assert not errors,(ENGINE,width,errors)
  print('PASS',ENGINE,width,'x',height,flush=True)
  ctx.close()
 portrait=browser.new_context(viewport={"width":390,"height":844},device_scale_factor=3,is_mobile=True,has_touch=True)
 page=portrait.new_page();page.goto((ROOT/'index.html').as_uri(),wait_until='load')
 assert page.locator('#cabinetRotatePrompt').count()==0,'Obsolete rotate overlay remains'
 assert page.locator('#home.cabinet-art-ready').is_visible(),'Portrait home must be accessible immediately'
 page.screenshot(path=str(OUT/f'{ENGINE}-portrait-guide.png'),full_page=False)
 print('PASS',ENGINE,'portrait startup without rotation',flush=True)
 portrait.close();browser.close()
