#!/usr/bin/env python3
"""V15 live HTTPS smoke only: exact isolated Vercel deployment, no story playthrough."""
import json, os
from pathlib import Path
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

URL=os.environ.get("V15_SAFARI_URL","").rstrip("/")
assert URL=="https://birmingham-unified-v15-safari.vercel.app", "Unexpected deployment target"
OUTPUT=Path("work/v15-live-safari")
OUTPUT.mkdir(parents=True,exist_ok=True)
reports=[]
resources=[
 "index.html",
 "assets/cabinet/cinema-home-art-v12.webp",
 "assets/audio/night-on-the-docks.mp3",
 "assets/audio/menu-original.ogg",
 "assets/case002/scenes/case002-a01-scene--mobile.webp",
 "assets/criminal/cr01-arrival.webp",
 "preview/case002-prototype/index.html",
 "campaign-bridge-v13.js",
 "mobile-runtime-v1.js"
]
def tap(page,selector):
    control=page.locator(selector).first
    control.scroll_into_view_if_needed()
    control.tap(timeout=15000)
def ready(page,selector):
    page.locator(selector).first.wait_for(state="visible",timeout=20000)

with sync_playwright() as p:
    for browser_name,width in (("webkit",390),("chromium",320)):
        browser=getattr(p,browser_name).launch(headless=True)
        ctx=browser.new_context(viewport={"width":width,"height":844},is_mobile=True,
                                has_touch=True,device_scale_factor=1)
        page=ctx.new_page()
        errors=[]
        broken=[]
        page.on("pageerror",lambda e:errors.append(str(e)))
        page.on("response",lambda r:broken.append({"status":r.status,"url":r.url}) if r.status>=400 and urlparse(r.url).netloc==urlparse(URL).netloc else None)
        # Verify independently deployed asset bytes/HTTP, not only DOM references.
        asset_sizes={}
        for resource in resources:
            resp=ctx.request.get(URL+"/"+resource,timeout=25000)
            assert resp.status==200,(browser_name,resource,resp.status)
            body=resp.body()
            assert len(body)>100,(browser_name,resource,len(body))
            if resource.endswith(".webp"):
                assert body[:4]==b"RIFF" and body[8:12]==b"WEBP",(resource,body[:12])
            asset_sizes[resource]=len(body)
        page.goto(URL+"/",wait_until="domcontentloaded",timeout=45000)
        ready(page,"#home.cinema-home")
        assert page.locator("#home .cabinet-menu > button").count()==6
        assert page.locator("#cabinetSettings").count()==0
        assert page.locator("#cinemaAudioDock .bh-audio-controls").count()==1
        assert "1 / 2" in page.locator("#bhMenuTrack").inner_text()
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
        page.screenshot(path=str(OUTPUT/f"{browser_name}-{width}-home.png"),full_page=True)
        tap(page,"#districtsCard")
        ready(page,"#districts")
        assert page.locator("#districtAudioDock .bh-audio-controls").count()==1
        assert page.locator(".map-pin").count()==5
        assert page.locator("#launchFirstCase").is_visible()
        tap(page,'.map-pin[data-district="digbeth"]')
        ready(page,"#launchSecondCase")
        assert "002" in page.locator("#launchSecondCase").inner_text()
        page.screenshot(path=str(OUTPUT/f"{browser_name}-{width}-detective.png"),full_page=True)
        tap(page,"#launchSecondCase")
        page.wait_for_url("**/preview/case002-prototype/index.html?from=map",timeout=30000)
        assert page.locator("body").count()==1
        page.screenshot(path=str(OUTPUT/f"{browser_name}-{width}-case002.png"),full_page=False)
        # Deliberately reset navigation after Case002 direct page; same HTTPS origin.
        page.goto(URL+"/",wait_until="domcontentloaded",timeout=45000)
        ready(page,"#criminalEntry")
        tap(page,"#criminalEntry")
        ready(page,"#criminalScreen .cr-map")
        assert page.locator(".cr-pin").count()==5
        tap(page,'#criminalScreen [data-campaign-jump="detective"]')
        ready(page,"#districts")
        tap(page,'#districts [data-campaign-jump="archive"]')
        ready(page,"#campaignAchievements")
        assert page.locator("#campaignAchievements .campaign-tabs button").count()==3
        assert page.locator("#campaignCriminalAchievements").count()==1
        page.screenshot(path=str(OUTPUT/f"{browser_name}-{width}-archive.png"),full_page=False)
        tap(page,'#campaignAchievements [data-campaign-jump="criminal"]')
        ready(page,"#criminalScreen .cr-map")
        tap(page,'#criminalScreen [data-campaign-jump="detective"]')
        ready(page,"#districts")
        tap(page,"#districtBack")
        ready(page,"#home.cinema-home")
        assert page.locator("#cinemaAudioDock .bh-audio-controls").count()==1
        tap(page,"#cabinetProfile")
        ready(page,"#profile")
        assert page.locator("#playerCampaignOverview").is_visible()
        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
        assert not errors, (browser_name,width,errors)
        assert not broken, (browser_name,width,broken)
        reports.append({"browser":browser_name,"width":width,"https":True,"status":"PASS",
            "routes":["main","detective","case002","criminal","archive","profile"],
            "assets":asset_sizes,"jsErrors":0,"httpErrors":0})
        ctx.close()
        browser.close()
(OUTPUT/"report.json").write_text(json.dumps(reports,ensure_ascii=False,indent=2),encoding="utf-8")
print("PASS V15 live Safari HTTPS:",json.dumps(reports,ensure_ascii=False))
