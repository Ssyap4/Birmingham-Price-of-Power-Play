#!/usr/bin/env python3
"""Real unified release acceptance: packaged static files, phone Chromium + WebKit.
Walk main menu -> Digbeth -> Case 002 -> map -> Small Heath -> Case 001 ->
map -> resume Case 002, all with one browser origin and durable save keys.
"""
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
import contextlib
import json

ROOT=Path(__file__).resolve().parents[2]/"campaign-unified-dist"
SHOTS=Path(__file__).resolve().parents[2]/"campaign-unified-qa-screens"

class Silent(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def run():
    assert (ROOT/"index.html").is_file(), "Build campaign-unified-dist first"
    SHOTS.mkdir(parents=True,exist_ok=True)
    server=ThreadingHTTPServer(("127.0.0.1",0),partial(Silent,directory=str(ROOT)))
    Thread(target=server.serve_forever,daemon=True).start()
    try:
        with sync_playwright() as p:
            for name in ("chromium","webkit"):
                browser=getattr(p,name).launch(headless=True)
                try:
                    context=browser.new_context(
                        viewport={"width":390,"height":844},
                        device_scale_factor=3,is_mobile=True,has_touch=True)
                    page=context.new_page()
                    errors=[]
                    page.on("pageerror",lambda e:errors.append(str(e)))
                    page.route("https://telegram.org/js/telegram-web-app.js",
                               lambda route:route.abort())
                    origin=f"http://127.0.0.1:{server.server_port}"
                    response=page.goto(origin+"/index.html",wait_until="domcontentloaded")
                    assert response.status==200
                    assert page.locator("#home").is_visible()
                    assert page.locator("#districtsCard").is_visible()
                    page.evaluate("""() => {
                        localStorage.setItem('birmingham_campaign_unique_rewards_v1',
                         JSON.stringify({'001:jack:endingTruth':1700000000000}));
                        localStorage.setItem('birmingham_campaign_records_v1',
                         JSON.stringify([{
                           key:'001:jack:1699999999000:endingTruth',
                           caseId:'001',caseTitle:'Долг, который не прощают',
                           heroId:'jack',started:1699999999000,
                           finished:1700000000000,ending:'endingTruth',
                           items:[],deductions:[],visited:[],health:100
                         }]));
                    }""")
                    old_rewards=page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_unique_rewards_v1')""")
                    old_records=page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_records_v1')""")
                    page.locator("#districtsCard").click()
                    assert page.locator("#districts").is_visible()
                    assert page.locator(".map-pin").count()==5
                    page.locator('.map-pin[data-district="digbeth"]').click()
                    assert page.locator("#launchSecondCase").is_visible()
                    assert page.locator("#launchFirstCase").is_hidden()
                    assert page.locator("#districtCase").inner_text()==(
                        "Последний поезд из Бирмингема")
                    assert "Пропавший груз" in page.locator(
                        ".campaign-case002-future").inner_text()
                    page.screenshot(path=str(SHOTS/f"{name}-digbeth.png"))
                    page.locator("#launchSecondCase").click()
                    page.wait_for_url("**/preview/case002-prototype/index.html?from=map")
                    assert page.url.startswith(origin+"/")
                    assert page.locator("#case002MapReturnBar").is_visible()
                    assert page.locator("#caseBriefing").is_visible()
                    assert page.locator(".briefing-visual img").evaluate(
                        "img => img.complete && img.naturalWidth===720 && img.naturalHeight===900")
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_records_v1')""")==old_records
                    page.screenshot(path=str(SHOTS/f"{name}-case002-briefing.png"))
                    page.locator("#briefContinue").click()
                    assert page.locator("#launch").is_visible()
                    assert page.locator("#heroGallery .hero-card").count()==5
                    assert page.locator("#priorDetails").is_visible(), (
                        "Case 002 must see the actual saved Case 001 canon on same origin")
                    assert page.locator("#prior option").count()>=2
                    page.locator("#begin").click()
                    assert page.locator("#game").is_visible()
                    assert page.locator("#sceneId").inner_text().startswith("P01")
                    assert page.locator("#case002MapReturnBar").is_visible()
                    page.locator('button.choice[data-to="P02"]').first.click()
                    assert page.locator("#sceneId").inner_text().startswith("P02")
                    case2=page.evaluate("""() => localStorage.getItem(
                        'birmingham_case002_draft_v3_jack')""")
                    assert case2 and json.loads(case2)["node"]=="P02"
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_unique_rewards_v1')""")==old_rewards
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_records_v1')""")==old_records
                    page.locator("#case002MapReturn").click()
                    page.wait_for_url("**/index.html#district-digbeth")
                    assert page.locator("#districts").is_visible()
                    assert page.locator('.map-pin[data-district="digbeth"]').get_attribute(
                        "aria-pressed")=="true"
                    assert page.locator("#launchSecondCase").is_visible()
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_case002_draft_v3_jack')""")==case2
                    page.locator('.map-pin[data-district="small-heath"]').click()
                    assert page.locator("#launchFirstCase").is_visible()
                    assert page.locator("#launchSecondCase").is_hidden()
                    page.locator("#launchFirstCase").click()
                    assert page.locator("#heroSelection").is_visible()
                    page.locator("#heroSelection .hero-begin").click()
                    assert page.locator("#case001Briefing").is_visible()
                    page.locator("#case001Briefing .briefing-start").click()
                    assert page.locator("#caseGame").is_visible()
                    case1=page.evaluate("""() => localStorage.getItem(
                        'birmingham_case_smol_heath_v1_jack')""")
                    assert case1, "The original Case 001 must create its own save"
                    page.screenshot(path=str(SHOTS/f"{name}-case001.png"))
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_case002_draft_v3_jack')""")==case2
                    page.locator("#caseBack").click()
                    assert page.locator("#districts").is_visible()
                    page.locator('.map-pin[data-district="digbeth"]').click()
                    page.locator("#launchSecondCase").click()
                    page.wait_for_url("**/preview/case002-prototype/index.html?from=map")
                    assert page.locator("#launch").is_visible()
                    assert page.locator("#caseBriefing").is_hidden()
                    assert page.locator("#resume").is_visible()
                    page.locator("#resume").click()
                    assert page.locator("#sceneId").inner_text().startswith("P02")
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_case002_draft_v3_jack')""")==case2
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_case_smol_heath_v1_jack')""")==case1
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_unique_rewards_v1')""")==old_rewards
                    assert page.evaluate("""() => localStorage.getItem(
                        'birmingham_campaign_records_v1')""")==old_records
                    assert page.locator("#caseRewardCount").inner_text()=="0"
                    assert page.locator("#caseUnlockToast").is_hidden()
                    page.set_viewport_size({"width":320,"height":790})
                    assert not page.evaluate(
                        "() => document.documentElement.scrollWidth > window.innerWidth+1"), (
                        name+" case002 overflows 320px vertical phone")
                    assert not errors, name+" page errors: "+str(errors)
                    page.screenshot(path=str(SHOTS/f"{name}-resumed-002-320.png"))
                    context.close()
                    print("PASS "+name+": unified map, 002 intro+P02 save, 001 native "
                          "hero+briefing, 002 resume, Case001 canon and awards preserved")
                finally:
                    browser.close()
    finally:
        server.shutdown()
        server.server_close()

if __name__=="__main__":
    run()
