"""Focused real-browser contract for Case 001 briefing and achievement balancing."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
def start(page):
 page.goto((ROOT/'index.html').as_uri(),wait_until='load')
 page.locator('#districtsCard').click()
 page.locator('#launchFirstCase').click()
 page.locator('#heroSelection .hero-begin').click()
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 context=browser.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,reduced_motion='reduce')
 page=context.new_page()
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 start(page)
 briefing=page.locator('#case001Briefing')
 assert briefing.is_visible(),'First attempt needs concise rules'
 assert briefing.locator('.case001-briefing-points section').count()==4
 assert 'Шесть исходов' in briefing.inner_text()
 briefing.locator('.briefing-cancel').click()
 assert briefing.is_hidden() and page.locator('#heroSelection').is_visible(),'Back from rules should not start case'
 page.locator('#heroSelection .hero-rules').click()
 assert briefing.is_visible(),'Rules must be rereadable on demand'
 briefing.locator('.briefing-start').click()
 assert briefing.is_hidden() and page.locator('#heroSelection').is_visible(),'Manual rules must not start case'
 page.locator('#heroSelection .hero-begin').click()
 assert briefing.is_visible(),'Fresh attempt shows rules before case story'
 briefing.locator('.briefing-start').click()
 assert briefing.locator('.case001-story-intro').is_visible(),'Case story must follow rules'
 briefing.locator('.briefing-start').click()
 assert page.locator('#caseGame').is_visible(),'Begin after story overview'
 assert page.evaluate("localStorage.getItem('birmingham_case001_briefing_seen_v1')")=='1'
 # Six different completed outcomes in the archive are represented by actual
 # game-defined IDs, not fake DOM markup. Opening this archive never replays
 # previously earned popups.
 page.locator('#caseBack').click()
 if page.locator('#districts').is_visible():
  page.locator('#districtBack').click()
 page.locator('#storyStart').click()
 assert page.locator('#campaignAchievements .campaign-award').count()==18
 assert page.locator('#campaignAchievements .campaign-reward-card').count()==30
 assert page.locator('.campaign-unlock-popup').count()==0
 page.locator('#homeBtn').click()
 page.locator('#districtsCard').click()
 page.locator('#launchFirstCase').click()
 page.locator('#heroSelection .hero-card').nth(1).click()
 page.locator('#heroSelection .hero-begin').click()
 assert briefing.is_visible() and briefing.locator('.case001-story-intro').is_visible(),'Rules preference skips rules but retains story'
 briefing.locator('.briefing-start').click()
 assert briefing.is_hidden() and page.locator('#caseGame').is_visible(),'Resume after story overview'
 # Store four genuine past endings, then trigger the existing chapter observer.
 # No fake achievement event is used; the normal evaluation grants rewards.
 page.evaluate("""() => {
   const names=['endingRescue','endingEvidence','endingDeal','endingTruth'];
   const runs=names.map((ending,i)=>({
      key:'001:jack:'+String(10000+i)+':'+ending,caseId:'001',
      heroId:'jack',ending,started:10000+i,finished:20000+i,
      items:['envelope','key'],deductions:[],visited:['intro'],health:75
   }));
   localStorage.setItem('birmingham_campaign_records_v1',JSON.stringify(runs));
   document.querySelector('#caseChapter').textContent += ' ';
 }""")
 page.locator('#bh-feedback-stage .bh-feedback-achievement').wait_for(state='visible',timeout=6000)
 names=page.evaluate("Object.keys(JSON.parse(localStorage.getItem('birmingham_campaign_awards_v1')||'{}'))")
 assert 'end2' in names and 'end4' in names,(names,'new milestone awards missing')
 assert 'start' not in names and 'clue1' not in names,'trivial rewards returned'
 assert page.locator('.campaign-unlock-popup').evaluate('e=>getComputedStyle(e.parentElement).pointerEvents')=='none'
 page.reload(wait_until='load')
 assert page.locator('.campaign-unlock-popup').count()==0,'Old rewards should not replay on load'
 assert not errors,errors
 context.close();browser.close()
 print('PASS briefing, opt-out, manual reread, 18 achievements, 30 seals, genuine one-time fly-ins')
