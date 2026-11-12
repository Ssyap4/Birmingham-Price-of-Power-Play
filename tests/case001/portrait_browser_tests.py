"""Portrait-first Safari/Chromium visual and interaction regression."""
from pathlib import Path
import os
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'tests'/'case001'/'artifacts'/'portrait'
OUT.mkdir(parents=True,exist_ok=True)
ENGINE=os.environ.get('BIRMINGHAM_MOBILE_BROWSER','chromium')
SIZES=[(320,700),(375,812),(390,844),(430,932)]
def assess(page,tag,w):
 metrics=page.evaluate("""() => {
  const de=document.documentElement;
  const buttons=[...document.querySelectorAll('#home .cabinet-entry')];
  return {width:de.clientWidth,scroll:de.scrollWidth,
   rotate:!!document.getElementById('cabinetRotatePrompt'),
   art:document.querySelector('#home .cabinet-room')?.getBoundingClientRect().height,
   buttons:buttons.map(e=>{const r=e.getBoundingClientRect();return [r.width,r.height];})};
 }""")
 assert metrics['scroll']<=metrics['width']+3,(ENGINE,w,tag,'horizontal overflow',metrics)
 assert not metrics['rotate'],(ENGINE,w,tag,'rotation prompt blocks game')
 if tag=='home':
  assert metrics['art']>=w*.48,(ENGINE,w,'cabinet art collapsed',metrics)
  assert len(metrics['buttons'])==5 and all(a>=44 and b>=44 for a,b in metrics['buttons']),(ENGINE,w,'unreachable menu entry',metrics)
  # All five real illustrated buttons must be available without a home swipe.
  limit=page.evaluate("""() => {
   const vv=window.visualViewport;
   const bottom=Math.min(innerHeight,vv?.height||innerHeight);
   const buttons=[...document.querySelectorAll('#home .cabinet-entry')];
   return {viewport:bottom,last:buttons.at(-1).getBoundingClientRect().bottom,
    header:getComputedStyle(document.querySelector('body>.shell>.top')).display,
    art:getComputedStyle(buttons[0]).backgroundImage};
  }""")
  assert limit['last']<=limit['viewport']+3,(ENGINE,w,'last approved button requires page scroll',limit)
  assert limit['header']=='none',(ENGINE,w,'old desktop header above approved menu',limit)
  assert 'approved-campaign.webp' in limit['art'],(ENGINE,w,'approved campaign image not active',limit)

with sync_playwright() as p:
 browser=getattr(p,ENGINE).launch(headless=True)
 for width,height in SIZES:
  ctx=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=2,is_mobile=True,has_touch=True,reduced_motion='reduce')
  page=ctx.new_page()
  errors=[]
  page.on('pageerror',lambda exc: errors.append(str(exc)))
  page.goto((ROOT/'index.html').as_uri(),wait_until='load')
  page.locator('#home.cabinet-art-ready').wait_for(timeout=15000)
  assess(page,'home',width)
  # All six approved artwork slices must decode at source resolution.
  decoded=page.evaluate("""async () => {
   const names=['header','campaign','trials','achievements','dossiers','settings'];
   return await Promise.all(names.map(async name => {
    const image=new Image();image.src='assets/mobile-menu/approved-'+name+'.webp';
    try { await image.decode();return [name,image.naturalWidth>=900]; }
    catch { return [name,false]; }
   }));
  }""")
  assert all(ok for name,ok in decoded),(ENGINE,width,'approved artwork missing or low-res',decoded)
  page.screenshot(path=str(OUT/f'{ENGINE}-portrait-home-{width}.png'),full_page=True)
  # Trials must present five independently tappable difficulty cards,
  # with no horizontal overflow or miniature PC-sized type.
  page.locator('#home .cabinet-entry-quiz').click()
  assert page.locator('#choose').is_visible(),(ENGINE,width,'difficulty screen missing')
  assert page.locator('#difficultyList .mode').count()==5,(ENGINE,width,'difficulty options missing')
  assess(page,'trials',width)
  quiz_cards=page.locator('#difficultyList .mode').evaluate_all("""els=>els.map(el=>{
   const r=el.getBoundingClientRect(); return {width:r.width,height:r.height};
  })""")
  assert all(card['height']>=44 and card['width']>=width*.7 for card in quiz_cards),(ENGINE,width,'trials buttons too small',quiz_cards)
  if width in (320,390):
   page.screenshot(path=str(OUT/f'{ENGINE}-portrait-trials-{width}.png'),full_page=False)
  page.locator('#homeBtn').click()
  # Archive is a primary phone destination: test real tabs, legibility and overflow.
  page.locator('#profileCard').click()
  assert page.locator('#campaignDossiers').is_visible()
  page.wait_for_function("id=>{const x=document.getElementById(id);return x&&!x.hidden&&parseFloat(getComputedStyle(x).opacity)>=.98}",arg='campaignDossiers')
  assert page.locator('#campaignDossiers .campaign-card').count()==5
  assess(page,'dossiers',width)
  archive_font=page.locator('#campaignDossiers .campaign-card p').first.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')
  assert archive_font>=14,(ENGINE,width,'archive dossier text too small',archive_font)
  if width in (320,390):
   page.screenshot(path=str(OUT/f'{ENGINE}-portrait-dossiers-{width}.png'),full_page=False)
  page.locator('#campaignDossiers .campaign-tabs [data-open-section=campaignAchievements]').click()
  assert page.locator('#campaignAchievements').is_visible()
  page.wait_for_function("id=>{const x=document.getElementById(id);return x&&!x.hidden&&parseFloat(getComputedStyle(x).opacity)>=.98}",arg='campaignAchievements')
  assess(page,'achievements',width)
  tabs=page.locator('#campaignAchievements .campaign-tabs button').first.evaluate('e=>({height:e.getBoundingClientRect().height,width:e.getBoundingClientRect().width})')
  assert tabs['height']>=44 and tabs['width']>=100,(ENGINE,width,'archive tab is too small',tabs)
  if width in (320,390):
   page.screenshot(path=str(OUT/f'{ENGINE}-portrait-achievements-{width}.png'),full_page=False)
  page.locator('#campaignAchievements .campaign-tabs [data-open-section=campaignHistory]').click()
  assert page.locator('#campaignHistory').is_visible()
  page.wait_for_function("id=>{const x=document.getElementById(id);return x&&!x.hidden&&parseFloat(getComputedStyle(x).opacity)>=.98}",arg='campaignHistory')
  assess(page,'history',width)
  if width in (320,390):
   page.screenshot(path=str(OUT/f'{ENGINE}-portrait-history-{width}.png'),full_page=False)
  page.locator('#homeBtn').click()
  page.locator('#districtsCard').click()
  assert page.locator('#districts').is_visible()
  assess(page,'map',width)
  font=page.locator('#districts .district-detail p').first.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')
  assert font>=14,(ENGINE,width,'map detail text too small',font)
  # Wait for the screen entrance and SVG art to be genuinely painted; capturing
  # the first animation frame can look like a black/empty map in WebKit.
  page.wait_for_function("""() => {
   const el=document.querySelector('#districts');
   const map=document.querySelector('#districts .map-art');
   const svg=map?.querySelector('svg');
   return el && !el.hidden && getComputedStyle(el).opacity >= .99
    && map?.getBoundingClientRect().height > 100 && !!svg;
  }""")
  page.screenshot(path=str(OUT/f'{ENGINE}-portrait-map-{width}.png'),full_page=True)
  page.locator('#launchFirstCase').click()
  assert page.locator('#heroSelection').is_visible()
  hero_font=page.locator('#heroSelection .hero-card strong').first.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')
  assert hero_font>=14,(ENGINE,width,'hero name too small',hero_font)
  # No hero portrait may be missing when the selector is presented.
  page.wait_for_function("""() => {
   const imgs=[...document.querySelectorAll('#heroSelection .hero-card img')];
   return imgs.length===5 && imgs.every(img=>img.complete && img.naturalWidth>0);
  }""",timeout=15000)
  page.screenshot(path=str(OUT/f'{ENGINE}-portrait-heroes-{width}.png'),full_page=False)
  page.locator('#heroSelection .hero-begin').click()
  assert page.locator('#caseGame').is_visible()
  assess(page,'case',width)
  story_font=page.locator('#caseGame .case-paper>p').first.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')
  assert story_font>=15,(ENGINE,width,'case story text too small',story_font)
  # Cinema styling is applied to real interactive elements rather than a
  # flattened screenshot, and must not cause horizontal overflow.
  computed=page.evaluate("""() => {
   const scene=document.querySelector('#caseGame .case-scene');
   const paper=document.querySelector('#caseGame .case-paper');
   const dialogue=document.querySelector('#caseGame .case-dialogue');
   return {viewport:document.documentElement.clientWidth,
    document:document.documentElement.scrollWidth,
    sceneBorder:getComputedStyle(scene).borderTopColor,
    paperBorder:getComputedStyle(paper).borderTopColor,
    dialogueBackground:getComputedStyle(dialogue).backgroundImage};
  }""")
  assert computed['document']<=computed['viewport']+3,(ENGINE,width,'case cinematic layout overflow',computed)
  assert 'linear-gradient' in computed['dialogueBackground'],(ENGINE,width,'case cinematic dialogue style missing',computed)
  page.screenshot(path=str(OUT/f'{ENGINE}-portrait-case-{width}.png'),full_page=True)
  page.locator('.v34-open-inventory').click()
  assert page.locator('.v33-window').is_visible()
  win=page.locator('.v33-window').bounding_box()
  assert win and win['x']>=-2 and win['x']+win['width']<=width+2,(ENGINE,width,'inventory clipped',win)
  if page.locator('.v33-tile span').count():
   item_font=page.locator('.v33-tile span').first.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')
   assert item_font>=13,(ENGINE,width,'evidence label too small',item_font)
  page.screenshot(path=str(OUT/f'{ENGINE}-portrait-inventory-{width}.png'),full_page=False)
  page.locator('.v33-close').click()
  assert page.locator('.v33-shade').is_hidden()
  assert not errors,(ENGINE,width,errors)
  print('PASS',ENGINE,width,height,flush=True)
  ctx.close()
 browser.close()
