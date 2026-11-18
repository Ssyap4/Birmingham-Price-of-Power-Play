"""V107 release gate: actual offline file:// entry and save isolation in both browser engines."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v107';OUT.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as p:
 for name in ('chromium','webkit'):
  b=getattr(p,name).launch()
  ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  page=ctx.new_page();page.set_default_timeout(15000)
  errors=[];failed=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('requestfailed',lambda r:failed.append((r.url,r.failure)) if r.url.startswith('file:') else None)
  page.route('https://**/*',lambda r:r.abort())
  url=(ROOT/'campaign-unified-dist/index.html').as_uri()
  page.goto(url,wait_until='load')
  def tap(s):
   e=page.locator(s).first;e.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})");e.tap()
  def snap(n):
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
   page.screenshot(path=str(OUT/f'offline-{name}-{n}.png'),animations='disabled')
  if page.locator('#bhMusic').get_attribute('aria-pressed')=='true':tap('#bhMusic')
  if page.locator('#bhEffects').get_attribute('aria-pressed')=='true':tap('#bhEffects')
  snap('menu')
  tap('#districtsCard');tap('.map-pin[data-district=digbeth]');tap('#launchSecondCase')
  page.wait_for_url('**/preview/case002-prototype/index.html?from=map')
  page.locator('#briefContinue').wait_for()
  tap('#briefContinue');tap('#heroGallery [data-hero=jack]');tap('#begin')
  tap('button.choice[data-to=P02]')
  second=page.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")
  assert second
  snap('case002')
  tap('#case002MapReturn');page.wait_for_url('**/index.html#district-digbeth')
  tap('.map-pin[data-district=small-heath]');tap('#launchFirstCase')
  tap('#heroCards [data-hero=jack]');tap('#heroSelection .hero-begin')
  tap('#case001Briefing .briefing-start')
  assert page.locator('#caseGame').is_visible()
  first=page.evaluate("localStorage.getItem('birmingham_case_smol_heath_v1_jack')")
  assert first;snap('case001')
  page.once('dialog',lambda d:d.accept());tap('#homeBtn')
  tap('#criminalEntry');assert page.locator('.cr-mission-list [data-mission]').count()==10
  tap('.cr-mission-list [data-mission=CR10]');tap('[data-action=start]')
  tap('.cr-choices [data-choice]:not([disabled])')
  raw=page.evaluate("localStorage.getItem(CriminalArchive.key('CR10'))")
  assert json.loads(raw)['revision']==1;snap('receipt')
  if page.locator('[data-action=ack]').count():tap('[data-action=ack]')
  tap('[data-action=map]');tap('.cr-top [data-action=chronicle]');snap('chronicle')
  tap('[data-action=commonArchive]');tap('#profileBtn')
  assert page.locator('#playerCampaignOverview .player-overview-card').count()==3
  assert page.evaluate("localStorage.getItem(CriminalArchive.key('CR10'))")==raw
  assert page.evaluate("localStorage.getItem('birmingham_case_smol_heath_v1_jack')")==first
  # file:// storage sharing between distinct HTML paths varies by engine.
  # Verify Case002 save on its actual file URL, not the menu's origin.
  tap('#homeBtn');tap('#districtsCard');tap('.map-pin[data-district=digbeth]');tap('#launchSecondCase')
  page.wait_for_url('**/preview/case002-prototype/index.html?from=map')
  assert page.evaluate("localStorage.getItem('birmingham_case002_draft_v3_jack')")==second
  assert not errors,errors
  assert not failed,failed
  results.append(dict(engine=name,unified='PASS'))
  print(name,'unified file:// PASS; both cases, CR10, chronicle, common archive, profile, saves',flush=True)
  ctx.close()
  ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  page=ctx.new_page();page.set_default_timeout(15000);errors=[];failed=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('requestfailed',lambda r:failed.append((r.url,r.failure)) if r.url.startswith('file:') else None)
  page.route('https://**/*',lambda r:r.abort())
  page.goto((ROOT/'criminal-preview-dist/index.html').as_uri(),wait_until='load')
  tap('#criminalEntry');assert page.locator('.cr-mission-list [data-mission]').count()==10
  tap('.cr-mission-list [data-mission=CR10]');tap('[data-action=start]')
  tap('.cr-choices [data-choice]:not([disabled])')
  raw=page.evaluate("localStorage.getItem(CriminalArchive.key('CR10'))")
  assert json.loads(raw)['revision']==1
  tap('[data-action=map]');tap('.cr-mission-list [data-mission=CR10]');tap('[data-action=resume]')
  assert page.evaluate("localStorage.getItem(CriminalArchive.key('CR10'))")==raw
  assert not errors,errors
  assert not failed,failed
  results[-1]['standalone']='PASS'
  print(name,'standalone file:// PASS',flush=True)
  ctx.close();b.close()
(OUT/'offline-results.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
