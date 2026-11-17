#!/usr/bin/env python3
"""Fixed-viewport art acceptance in a separate browser process from legacy smoke.
Exercises real reader DOM using isolated, explicitly synthetic scene fixtures.
No browser resizing during the long route, no mocked renderer or production data.
"""
from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer
from threading import Thread
from functools import partial
from legacy_smoke import ROOT, OUT, Quiet, tap

FRAMES = (
    ("interview","interview-kitchen.webp",1,31.43),
    ("bribe","bribe.webp",1,31.46),
    ("pretend","pretend.webp",.8,50),
    ("endingRescue","endingRescue-approved.webp",.8,50),
)
ARCHIVE_KEYS = (
    "birmingham_campaign_records_v1","birmingham_campaign_unique_rewards_v1",
    "birmingham_campaign_awards_v1",
)
KEY = "birmingham_case_smol_heath_v1_jack"
META = "birmingham_case_v20_findings_jack"

def run():
    server=ThreadingHTTPServer(("127.0.0.1",0), partial(Quiet,directory=str(ROOT/"campaign-unified-dist")))
    Thread(target=server.serve_forever,daemon=True).start()
    origin=f"http://127.0.0.1:{server.server_port}"
    try:
        with sync_playwright() as pw:
            for engine in ("chromium","webkit"):
                for width in (320,390,430):
                    # Fresh browser and fixed viewport. Never recycle a crash
                    # as a pass, and never retry a failed assertion.
                    browser=getattr(pw,engine).launch(headless=True)
                    ctx=browser.new_context(viewport={"width":width,"height":844},is_mobile=True,has_touch=True)
                    page=ctx.new_page()
                    errors=[]
                    page.on("pageerror",lambda e:errors.append(str(e)))
                    page.route("https://**/*",lambda r:r.abort())
                    try:
                        page.goto(origin+"/index.html",wait_until="domcontentloaded")
                        tap(page,"#districtsCard")
                        tap(page,"#launchFirstCase")
                        tap(page,"#heroCards [data-hero=jack]")
                        tap(page,"#heroSelection .hero-begin")
                        tap(page,"#case001Briefing .briefing-start")
                        page.locator("#caseGame").wait_for(state="visible")
                        all_keys=[KEY,META,*ARCHIVE_KEYS]
                        original=page.evaluate("keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]))",all_keys)
                        assert original[KEY] is not None
                        image=page.locator("#caseArt .case001-portrait-image")
                        for node,filename,ratio,position in FRAMES:
                            page.evaluate("""({original,key,node})=>{const s=JSON.parse(original[key]);s.node=node;if(node==='endingRescue')s.ending=node;localStorage.setItem(key,JSON.stringify(s));window.BirminghamCase.resume()}""",{"original":original,"key":KEY,"node":node})
                            page.wait_for_function("""filename=>{const i=document.querySelector('#caseArt .case001-portrait-image');return !i.hidden&&i.complete&&i.naturalWidth>0&&i.getAttribute('src').endsWith('/'+filename)}""",arg=filename)
                            if node=="endingRescue":
                                page.wait_for_function("document.querySelector('.case001-finale-archive-note')?.dataset.status==='verified'")
                                assert image.evaluate("i=>[i.naturalWidth,i.naturalHeight]")==[1448,1086]
                            raw=page.evaluate("keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]))",all_keys)
                            page.wait_for_function("""ratio=>{const i=document.querySelector('#caseArt .case001-portrait-image'),r=i.getBoundingClientRect();return getComputedStyle(i).objectFit==='cover'&&Math.abs(r.width/r.height-ratio)<.015&&r.width>240&&document.documentElement.scrollWidth<=innerWidth+1}""",arg=ratio)
                            assert abs(float(image.evaluate("i=>parseFloat(getComputedStyle(i).objectPosition)"))-position)<.1
                            image.evaluate("i=>i.scrollIntoView({block:'center',behavior:'instant'})")
                            page.wait_for_function("""()=>{const r=document.querySelector('#caseArt .case001-portrait-image').getBoundingClientRect(),n=document.querySelector('#case001QuickNav').getBoundingClientRect();return r.top>=0&&r.bottom<n.top-2}""")
                            image.screenshot(path=str(OUT/f"{engine}-v71-{node}-{width}.png"))
                            assert page.evaluate("keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]))",all_keys)==raw
                            print("PASS fixed-width artwork",engine,width,node,flush=True)
                        # Restore all fixture bytes before returning to original
                        # full frame; verify the genuine map/menu buttons.
                        page.evaluate("""original=>{for(const [k,v] of Object.entries(original)){if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}window.BirminghamCase.resume()}""",original)
                        page.wait_for_function("""()=>{const i=document.querySelector('#caseArt .case001-portrait-image');return !i.hidden&&i.complete&&getComputedStyle(i).objectFit==='contain'}""")
                        assert page.locator("#case001PulseHealth").inner_text()=="100/100"
                        assert page.locator("#case001PulseHealth").get_attribute("aria-label").startswith("Состояние героя:")
                        assert page.locator("#case001PulseChapter").is_hidden()
                        assert page.locator("#caseArt .case001-art-caption span:last-child").is_hidden()
                        tap(page,"#caseBack")
                        for district in ("small-heath","digbeth","aston"):
                            tap(page,f'.map-pin[data-district="{district}"]')
                            assert page.locator(f'.map-pin[data-district="{district}"]').get_attribute("aria-pressed")=="true"
                        page.evaluate("window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})")
                        page.wait_for_function("""()=>{const e=document.querySelector('#homeBtn'),r=e.getBoundingClientRect();return scrollY>0&&r.top>=0&&r.bottom<=innerHeight&&document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('#homeBtn')===e}""")
                        tap(page,"#homeBtn")
                        page.locator("#home").wait_for(state="visible")
                        page.wait_for_function("scrollY<=1")
                        tap(page,"#cabinetProfile")
                        page.locator("#profile").wait_for(state="visible")
                        assert page.evaluate("k=>localStorage.getItem(k)",KEY)==original[KEY]
                        assert not errors,errors
                        print("PASS fixed-width map return",engine,width,flush=True)
                    finally:
                        ctx.close()
                        browser.close()
    finally:
        server.shutdown()

if __name__=="__main__":
    run()
