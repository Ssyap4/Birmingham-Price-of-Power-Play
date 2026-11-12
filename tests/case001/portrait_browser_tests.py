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
  # Reduced-motion users must not be forced through entrance effects.
  entry_motion=page.locator('#choose').evaluate('e=>getComputedStyle(e).animationName')
  assert entry_motion=='none',(ENGINE,width,'reduced-motion screen animation remains',entry_motion)
  home_nav=page.locator('#homeBtn').evaluate("""e=>{
   const r=e.getBoundingClientRect();return {w:r.width,h:r.height,focus:getComputedStyle(e).outlineStyle};
  }""")
  assert home_nav['w']>=44 and home_nav['h']>=44,(ENGINE,width,'back navigation tap target too small',home_nav)

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
  if page.locator('#case001Briefing').is_visible():
   assert page.locator('#case001Briefing .case001-briefing-points section').count()==4
   page.locator('#case001Briefing .briefing-start').click()
   page.locator('#case001Briefing .briefing-start').click()
  assert page.locator('#caseGame').is_visible()
  toolbar=page.evaluate("""() => {
   const screen=document.querySelector('#caseGame');
   const bar=screen.querySelector(':scope > .bh-audio-controls');
   const scene=screen.querySelector('.case-scene');
   if(!bar)return {docked:false};
   const b=bar.getBoundingClientRect(),s=scene.getBoundingClientRect();
   return {docked:true,barTop:b.top,barBottom:b.bottom,sceneTop:s.top,
    barLeft:b.left,barRight:b.right,
    viewport:document.documentElement.clientWidth,
    position:getComputedStyle(bar).position,
    buttons:[...bar.querySelectorAll('button')].map(el=>{
      const r=el.getBoundingClientRect();return {height:r.height,width:r.width};
    })};
  }""")
  assert toolbar['docked'],(ENGINE,width,'sound and exit toolbar not inside case',toolbar)
  assert toolbar['position']!='fixed',(ENGINE,width,'toolbar still overlays story',toolbar)
  assert toolbar['barBottom']<=toolbar['sceneTop']+3,(ENGINE,width,'toolbar obscures scene',toolbar)
  assert toolbar['barLeft']>=-3 and toolbar['barRight']<=width+3,(ENGINE,width,'toolbar exceeds phone',toolbar)
  assert len(toolbar['buttons'])==3 and all(b['height']>=44 for b in toolbar['buttons']),(ENGINE,width,'toolbar button missing or too small',toolbar)
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
  # Stress the actual story UI with deliberately long dialogue and answer text,
  # then restore the DOM immediately. This does not touch the story or saves.
  stress=page.evaluate("""() => {
   const scene=document.querySelector('#caseGame .case-scene h2');
   const dialogue=document.querySelector('#caseGame .case-dialogue');
   const speaker=document.querySelector('#caseSpeaker');
   const line=document.querySelector('#caseDialogue');
   const paragraph=document.querySelector('#caseText');
   const choices=document.querySelector('#caseChoices');
   const previous={title:scene.textContent,hidden:dialogue.hidden,
    speaker:speaker.textContent,line:line.textContent,
    paragraph:paragraph.textContent};
   const testButton=document.createElement('button');
   testButton.className='case-choice';testButton.type='button';
   testButton.textContent='Потребовать подробного объяснения всех обстоятельств исчезновения Артура, проверить документы и сопоставить показания свидетелей прежде, чем принимать окончательное решение';
   try{
    dialogue.hidden=false;
    scene.textContent='ПРОМЫШЛЕННЫЙ БИРМИНГЕМ — ЗАПУТАННАЯ ИСТОРИЯ ИСЧЕЗНОВЕНИЯ';
    speaker.textContent='СВИДЕТЕЛЬ ИЗ ЮВЕЛИРНОГО КВАРТАЛА';
    line.textContent='Вчера я видел Артура у склада, но затем человек в тёмном пальто передал ему конверт. Я пытался предупредить его, однако никто не слушал, а разговор продолжался достаточно долго, чтобы мы успели заметить автомобиль у ворот.';
    paragraph.textContent='Вы изучаете следы на полу и сопоставляете показания сразу нескольких свидетелей. В документах обнаружились противоречия, которые невозможно разрешить без подробного изучения маршрута, бухгалтерской ведомости и записки пропавшего человека.';
    choices.append(testButton);
    const root=document.documentElement;
    const box=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height}};
    const cards=[scene,dialogue,line,paragraph,testButton].map(box);
    const style=getComputedStyle(testButton);
    return {viewport:root.clientWidth,doc:root.scrollWidth,cards,
     choiceFont:parseFloat(style.fontSize),choiceHeight:cards.at(-1).height,
     portraitWidth:box(document.querySelector('#casePortrait')).width,
     dialogueGrid:getComputedStyle(dialogue).gridTemplateColumns};
   }finally{
    testButton.remove();scene.textContent=previous.title;
    speaker.textContent=previous.speaker;line.textContent=previous.line;
    paragraph.textContent=previous.paragraph;dialogue.hidden=previous.hidden;
   }
  }""")
  assert stress['doc']<=stress['viewport']+3,(ENGINE,width,'long story causes horizontal scrolling',stress)
  assert all(card['left']>=-3 and card['right']<=width+3 for card in stress['cards']),(ENGINE,width,'long dialogue extends beyond phone',stress)
  assert stress['choiceHeight']>=52 and stress['choiceFont']>=13,(ENGINE,width,'long decision target too small',stress)
  assert stress['portraitWidth']>=50,(ENGINE,width,'dialogue portrait squeezed',stress)
  page.locator('.v34-open-inventory').click()
  assert page.locator('.v33-window').is_visible()
  win=page.locator('.v33-window').bounding_box()
  assert win and win['x']>=-2 and win['x']+win['width']<=width+2,(ENGINE,width,'inventory clipped',win)
  if page.locator('.v33-tile span').count():
   item_font=page.locator('.v33-tile span').first.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')
   assert item_font>=13,(ENGINE,width,'evidence label too small',item_font)
  board_layout=page.locator('.v33-window').evaluate("""el => {
   const r=el.getBoundingClientRect(),c=getComputedStyle(el);
   const h=document.documentElement.clientHeight;
   const metrics=document.querySelector('.v33-ending-metrics');
   return {x:r.x,right:r.right,top:r.top,bottom:r.bottom,h,
    overflowY:c.overflowY,boardBackground:c.backgroundImage,
    metricColumns:metrics?getComputedStyle(metrics).gridTemplateColumns:null};
  }""")
  assert board_layout['top']>=-2 and board_layout['bottom']<=height+2,(ENGINE,width,'inventory clips vertically',board_layout)
  assert board_layout['overflowY']=='auto',(ENGINE,width,'inventory cannot scroll',board_layout)
  assert 'radial-gradient' in board_layout['boardBackground'],(ENGINE,width,'evidence polish not loaded',board_layout)
  page.screenshot(path=str(OUT/f'{ENGINE}-portrait-inventory-{width}.png'),full_page=False)
  if width in (320,390):
   page.locator('.v33-window').evaluate('el=>el.scrollTop=el.scrollHeight')
   page.screenshot(path=str(OUT/f'{ENGINE}-portrait-inventory-bottom-{width}.png'),full_page=False)
  page.locator('.v33-close').click()
  assert page.locator('.v33-shade').is_hidden()
  # Exercise a genuinely populated case inventory, never a mocked HTML panel.
  # Each browser context is isolated; these fixture saves are discarded on close.
  page.evaluate("""() => {
   const hero=window.BirminghamHero.selectedId;
   const key='birmingham_case_smol_heath_v1_'+hero;
   const s=JSON.parse(localStorage.getItem(key));
   s.node='intro';
   s.items=['envelope','key','invoice','route','ledger','receipt',
            'ash','testimony','overheard','witness','note'];
   localStorage.setItem(key,JSON.stringify(s));
   localStorage.setItem('birmingham_case_v20_findings_'+hero,
    JSON.stringify({started:s.started,
      deductions:['След склада D-17','Деньги и двойной учёт'],reactions:[]}));
   window.BirminghamCase.resume();
  }""")
  page.locator('.v34-open-inventory').click()
  assert page.locator('.v33-shade').is_visible()
  assert page.locator('.v33-tile').count()>=11,(ENGINE,width,'missing collected evidence')
  assert page.locator('.v33-solved-board .v33-tile').count()>=4,(ENGINE,width,'solved evidence missing')
  page.wait_for_function("""() => {
   const imgs=[...document.querySelectorAll('.v33-shade .v33-tile img')];
   return imgs.length>=11 && imgs.every(i=>i.complete && i.naturalWidth>0);
  }""",timeout=15000)
  page.locator('.v33-window').evaluate('el=>el.scrollTop=0')
  if width in (320,390):
   page.screenshot(path=str(OUT/f'{ENGINE}-portrait-inventory-filled-{width}.png'),full_page=False)
  scrollability=page.locator('.v33-window').evaluate("""el=>{
   el.scrollTop=el.scrollHeight;
   return {top:el.scrollTop,limit:el.scrollHeight-el.clientHeight,
    doc:document.documentElement.scrollWidth,
    viewport:document.documentElement.clientWidth};
  }""")
  assert scrollability['limit']>50 and scrollability['top']>50,(ENGINE,width,'filled inventory does not scroll',scrollability)
  assert scrollability['doc']<=scrollability['viewport']+3,(ENGINE,width,'filled inventory horizontal overflow',scrollability)
  if width in (320,390):
   page.screenshot(path=str(OUT/f'{ENGINE}-portrait-inventory-filled-bottom-{width}.png'),full_page=False)
  # Tap-to-connect must open a real deduction result for a known pair.
  page.locator('.v33-tile[data-id="invoice"]').first.click()
  page.locator('.v33-tile[data-id="route"]').first.click()
  assert page.locator('.v33-result-layer').is_visible(),(ENGINE,width,'deduction result not visible')
  result_rect=page.locator('.v33-result').bounding_box()
  assert result_rect and result_rect['x']>=-2 and result_rect['x']+result_rect['width']<=width+2,(ENGINE,width,'deduction result clipped',result_rect)
  if width in (320,390):
   page.screenshot(path=str(OUT/f'{ENGINE}-portrait-deduction-{width}.png'),full_page=False)
  page.keyboard.press('Escape')
  assert page.locator('.v33-result-layer').count()==0
  page.locator('.v33-close').click()
  assert page.locator('.v33-shade').is_hidden()
  # Verify all actual ending reports including the longer death report.
  endings=['endingRescue','endingEvidence','endingDeal',
           'endingTruth','endingPower','endingDeath']
  for ending in endings:
   page.evaluate("""ending => {
    const hero=window.BirminghamHero.selectedId;
    const key='birmingham_case_smol_heath_v1_'+hero;
    const s=JSON.parse(localStorage.getItem(key));
    s.node=ending;
    if(ending==='endingDeath')s.deathCause='Опасное столкновение на складе D-17';
    localStorage.setItem(key,JSON.stringify(s));
    window.BirminghamCase.resume();
   }""",ending)
   page.locator('#caseGame .v33-ending-report').wait_for(state='visible',timeout=10000)
   metrics=page.locator('#caseGame .v33-ending-report').evaluate("""el=>{
    const r=el.getBoundingClientRect(),cells=[...el.querySelectorAll('.v33-ending-metrics>div')];
    const first=cells[0]?.getBoundingClientRect();
    return {width:r.width,left:r.left,right:r.right,
      viewport:document.documentElement.clientWidth,
      columns:getComputedStyle(el.querySelector('.v33-ending-metrics')).gridTemplateColumns,
      cells:cells.length,cellWidth:first?.width};
   }""")
   assert metrics['right']<=width+3 and metrics['left']>=-3,(ENGINE,width,ending,'ending report clipped',metrics)
   assert metrics['cells']>=(6 if ending=='endingDeath' else 3),(ENGINE,width,ending,'missing ending metrics',metrics)
   assert metrics['cellWidth']>width*.55,(ENGINE,width,ending,'ending metrics not stacked',metrics)
   if width in (320,390) and ending in ('endingTruth','endingDeath'):
    # Ensure the last metric is readable above the fixed sound/exit HUD.
    page.evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})")
    page.wait_for_timeout(120)
    last_metric=page.locator('#caseGame .v33-ending-metrics>div').last.evaluate("""el=>{
     const r=el.getBoundingClientRect();
     return {bottom:r.bottom,visibleHeight:window.visualViewport?.height||innerHeight};
    }""")
    assert last_metric['bottom']<=last_metric['visibleHeight']-75,(ENGINE,width,ending,'final metric covered by floating HUD',last_metric)
    page.locator('#caseGame .v33-ending-report').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT/f'{ENGINE}-portrait-{ending}-{width}.png'),full_page=False)
  assert not errors,(ENGINE,width,errors)
  print('PASS',ENGINE,width,height,flush=True)
  ctx.close()
 browser.close()
