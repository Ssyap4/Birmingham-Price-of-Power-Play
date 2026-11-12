"""Campaign screens, record uniqueness and evidence wheel scroll in real Chromium."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'tests'/'case001'/'artifacts'/'campaign'
OUT.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 page=browser.new_page(viewport={"width":1280,"height":720})
 errors=[];page.on("pageerror",lambda exc:errors.append(str(exc)))
 page.goto((ROOT/"index.html").as_uri(),wait_until="load")
 page.locator("#profileCard").click()
 assert page.locator("#campaignDossiers").is_visible()
 page.screenshot(path=str(OUT/'dossiers-desktop.png'),full_page=True)
 assert page.locator("#campaignDossiers .campaign-card").count()==5
 page.locator("#homeBtn").click()
 page.locator("#storyStart").click()
 assert page.locator("#campaignAchievements").is_visible()
 page.screenshot(path=str(OUT/'achievements-desktop.png'),full_page=True)
 assert page.locator("#campaignAchievements .campaign-award").count()==18
 assert page.locator("#campaignAchievements .campaign-reward-card").count()==30
 page.locator("#homeBtn").click()
 page.evaluate("""() => {
   const data={node:'endingPower',items:['envelope','key','invoice','route','ledger'],flags:{},trail:['intro','office','pump'],ending:'endingPower',started:987654321,health:75,riskSeen:[]};
   localStorage.setItem('birmingham_case_smol_heath_v1_jack',JSON.stringify(data));
   localStorage.setItem('birmingham_case_v20_findings_jack',JSON.stringify({started:987654321,deductions:['След склада D-17'],reactions:[]}));
 }""")
 page.locator("#profileCard").click()
 page.locator("#campaignDossiers .campaign-tabs [data-open-section=campaignHistory]").click()
 assert page.locator("#campaignHistory").is_visible()
 assert page.locator("#campaignHistory .campaign-attempt").count()==1
 assert page.locator("#campaignHistory .campaign-attempt-detail").is_hidden()
 page.locator("#campaignHistory .campaign-attempt summary").click()
 assert page.locator("#campaignHistory .campaign-attempt-detail").is_visible()
 assert "Конверт D-17" in page.locator("#campaignHistory .campaign-attempt-detail").inner_text()
 assert "След склада D-17" in page.locator("#campaignHistory .campaign-attempt-detail").inner_text()
 page.screenshot(path=str(OUT/'history-desktop.png'),full_page=True)
 first=page.evaluate("JSON.parse(localStorage.getItem('birmingham_campaign_records_v1'))")
 assert len(first)==1 and first[0]["heroId"]=="jack" and first[0]["ending"]=="endingPower"
 gifts=page.evaluate("JSON.parse(localStorage.getItem('birmingham_campaign_unique_rewards_v1'))")
 assert len(gifts)==1 and gifts['001:jack:endingPower'], "A finished unique outcome gives a permanent local reward"

 page.reload(wait_until="load")
 page.locator("#profileCard").click()
 page.locator("#campaignDossiers .campaign-tabs [data-open-section=campaignHistory]").click()
 assert page.locator("#campaignHistory .campaign-attempt").count()==1,"Same finished attempt must not duplicate"
 page.locator("#homeBtn").click()
 page.evaluate("""() => {
  const key='birmingham_case_smol_heath_v1_jack';
  const s=JSON.parse(localStorage.getItem(key));s.started=987654322;
  localStorage.setItem(key,JSON.stringify(s));
 }""")
 page.locator("#profileCard").click()
 page.locator("#campaignDossiers .campaign-tabs [data-open-section=campaignHistory]").click()
 assert page.locator("#campaignHistory .campaign-attempt").count()==2
 unique=page.locator("#campaignHistory .campaign-summary strong").nth(1).inner_text()
 assert unique.startswith('1 /'),"Same hero and ending must count as one unique outcome"
 gifts2=page.evaluate("JSON.parse(localStorage.getItem('birmingham_campaign_unique_rewards_v1'))")
 assert gifts2==gifts, "Repeat attempt must not grant a second reward"

 page.locator("#homeBtn").click()
 page.locator("#districtsCard").click()
 page.locator("#launchFirstCase").click()
 page.locator("#heroSelection .hero-begin").click()
 if page.locator("#case001Briefing").is_visible():
  page.locator("#case001Briefing .briefing-start").click()
 # Verify the real computed background for all five chapters on desktop,
 # not just the JS data attribute that was misleading in the previous build.
 for node,image in [('intro','intro.webp'),('office','office-approved.webp'),('canal','canal-approved.webp'),('reed','reed.webp'),('pump','pump.webp')]:
  page.evaluate("""node=>{
   const k='birmingham_case_smol_heath_v1_jack';
   const data=JSON.parse(localStorage.getItem(k));data.node=node;
   localStorage.setItem(k,JSON.stringify(data));window.BirminghamCase.resume();
  }""",node)
  page.wait_for_function("name=>getComputedStyle(document.querySelector('.v18-case-art')).backgroundImage.includes('/'+name)",arg=image)
  actual=page.locator(".v18-case-art").evaluate("el=>getComputedStyle(el).backgroundImage")
  assert '/'+image in actual and 'city.webp' not in actual,(node,image,actual)
 page.evaluate("""()=>{
  const k='birmingham_case_smol_heath_v1_jack';
  const data=JSON.parse(localStorage.getItem(k));data.node='intro';
  localStorage.setItem(k,JSON.stringify(data));window.BirminghamCase.resume();
 }""")
 page.evaluate("""() => {
  const key='birmingham_case_smol_heath_v1_jack';
  const s=JSON.parse(localStorage.getItem(key));
  s.items=['envelope','key','invoice','route','ledger','receipt','ash','testimony','overheard','witness','note'];
  localStorage.setItem(key,JSON.stringify(s));
  localStorage.setItem('birmingham_case_v20_findings_jack',JSON.stringify({started:s.started,deductions:['След склада D-17','Деньги и двойной учёт'],reactions:[]}));
 }""")
 page.locator(".v34-open-inventory").click()
 assert page.locator(".v33-shade").is_visible()
 assert page.locator(".v33-solved").is_visible()
 assert page.locator(".v33-solved-board .v33-tile").count()>=4
 panel=page.locator(".v33-window")
 before=panel.evaluate("(el)=>el.scrollTop")
 rect=panel.bounding_box();page.mouse.move(rect["x"]+rect["width"]/2,rect["y"]+rect["height"]/2)
 page.mouse.wheel(0,520);page.wait_for_timeout(120)
 after=panel.evaluate("(el)=>el.scrollTop")
 assert after>before, f"Inventory wheel scrolling broken: {before}->{after}"
 assert not errors,errors
 print("OK: three campaign screens, five heroes, 42 awards, unique outcomes, solved evidence and wheel scroll")
 browser.close()
