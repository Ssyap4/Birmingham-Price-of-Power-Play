from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
RUNS=[{'key':'001:jack:123:endingRescue','caseId':'001','heroId':'jack','ending':'endingRescue','started':123,'finished':456,'items':['key'],'deductions':[],'visited':['office'],'health':100},{'key':'001:jack:789:endingRescue','caseId':'001','heroId':'jack','ending':'endingRescue','started':789,'finished':901,'items':['key'],'deductions':[],'visited':['canal'],'health':80},{'key':'001:finn:999:endingTruth','caseId':'001','heroId':'finn','ending':'endingTruth','started':999,'finished':1000,'items':['key','ledger'],'deductions':[],'visited':['office'],'health':90}]
for engine in ('chromium','webkit'):
 with sync_playwright() as p:
  browser=getattr(p,engine).launch(headless=True)
  try:
   for w,h in ((375,812),(390,844),(1280,800)):
    ctx=browser.new_context(viewport={'width':w,'height':h},is_mobile=w<700,has_touch=w<700,reduced_motion='reduce')
    page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto((ROOT/'index.html').as_uri(),wait_until='load')
    page.locator('#home.cabinet-art-ready').wait_for(timeout=15000)
    page.locator('#profileCard').click()
    assert page.locator('#profile').is_visible() and page.locator('.pd-identity').is_visible(),('wrong profile page',engine,w)
    assert page.locator('.pd-stat-runs').inner_text()=='0','legacy quiz stats shown'
    number=page.locator('.pd-number').inner_text()
    assert number.startswith('№ BH-L-') and len(number.split(' · ')[0])==15,number
    page.evaluate("""runs=>{localStorage.setItem('birmingham_campaign_records_v1',JSON.stringify(runs));localStorage.setItem('birmingham_campaign_unique_rewards_v1',JSON.stringify({'001:jack:endingRescue':100,'001:finn:endingTruth':200}));localStorage.setItem('birmingham_campaign_awards_v1',JSON.stringify({'clue9':100,'hero3':200}));}""",RUNS)
    page.evaluate("window.BirminghamProfileV2.render()")
    for c,v in {'runs':'3','cases':'1','outcomes':'2','seals':'2/30','heroes':'2/5'}.items():
     assert page.locator('.pd-stat-'+c).inner_text()==v,(engine,w,c)
    assert page.locator('.pd-event').count()==3
    score=page.evaluate('window.BirminghamProfileV2.model().score')
    assert score>=48 and page.locator('.pd-rank-title').inner_text()!='НОВИЧОК СМОЛЛ-ХИТА'
    page.reload(wait_until='load');page.locator('#home.cabinet-art-ready').wait_for(timeout=15000)
    page.locator('#profileBtn').click()
    assert page.locator('.pd-number').inner_text()==number,'local ID changed'
    assert page.locator('.pd-stat-runs').inner_text()=='3','campaign stats lost'
    assert page.evaluate('window.BirminghamProfileV2.model().score')==score,'reputation inflated'
    for dest in ('campaignDossiers','campaignAchievements','campaignHistory'):
     page.locator('.pd-archive-link[data-archive="'+dest+'"]').click()
     assert page.locator('#'+dest).is_visible(),('wrong archive destination',dest)
     page.locator('#profileBtn').click()
    assert page.evaluate('document.documentElement.scrollWidth')<=w+2,'horizontal overflow'
    assert not errors,(engine,w,errors)
    ctx.close();print('PASS',engine,w,'identity rank stats history navigation')
  finally:browser.close()
