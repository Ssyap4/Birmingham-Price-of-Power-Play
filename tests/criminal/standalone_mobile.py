#!/usr/bin/env python3
"""Real-touch QA of the isolated criminal-only WebKit/Chromium preview."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler
from local_http import LocalServer
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "criminal-preview-dist"
OUT = ROOT / "work/criminal/standalone"
OUT.mkdir(parents=True, exist_ok=True)

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):
        pass

def tap(page, selector):
    item = page.locator(selector).first
    item.scroll_into_view_if_needed()
    item.tap()

def run():
    server = LocalServer(("127.0.0.1", 0), partial(Quiet,directory=str(DIST)))
    Thread(target=server.serve_forever,daemon=True).start()
    origin = f"http://127.0.0.1:{server.server_port}"
    try:
        with sync_playwright() as p:
            for browser_name in ("chromium", "webkit"):
                browser = getattr(p,browser_name).launch(headless=True)
                for width in (320,390,430):
                    ctx = browser.new_context(
                        viewport={"width":width,"height":844},
                        is_mobile=True,has_touch=True,device_scale_factor=1
                    )
                    page = ctx.new_page()
                    errors, missing = [], []
                    page.on("pageerror",lambda e: errors.append(str(e)))
                    page.on("response",lambda r: missing.append(r.url) if r.status>=400 and r.url.startswith(origin) else None)
                    page.route("https://**/*",lambda r:r.abort())
                    page.goto(origin+"/index.html",wait_until="domcontentloaded")
                    assert page.locator("#home").is_visible()
                    assert page.locator("#criminalEntry").is_visible()
                    tap(page,"#criminalEntry")
                    assert page.locator("#criminalScreen").is_visible()
                    assert page.locator(".cr-pin").count()==5
                    assert page.locator("#criminalScreen h1").inner_text()=="Работа для своих"
                    assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
                    if width==390:
                        page.screenshot(path=str(OUT/(browser_name+"-standalone-map.png")),full_page=True)
                    for mission in ("CR01","CR02","CR03","CR04","CR05"):
                        # Some file/sandbox browsers prohibit history.replaceState;
                        # mission identity must not depend on a writable hash.
                        blocked_hash = mission == "CR01" and width == 390
                        if blocked_hash:
                            page.evaluate("() => {window.__oldReplace=history.replaceState;history.replaceState=()=>{throw Error('history denied')};}")
                        tap(page,f'.cr-pin[data-mission="{mission}"]')
                        assert page.locator("#criminalScreen h1").first.is_visible()
                        image = page.locator(".cr-frame img").first
                        page.wait_for_function("""() => {
                          const im=document.querySelector('#criminalScreen .cr-frame img');
                          return im&&im.complete&&im.naturalWidth===720&&im.naturalHeight===900;
                        }""")
                        assert image.is_visible()
                        tap(page,'[data-action="start"]')
                        assert page.locator(".cr-choices button").count()>=1
                        tap(page, ".cr-inventory summary")
                        page.wait_for_function("() => [...document.querySelectorAll('#criminalScreen .cr-gear-illustration')].length>0 && [...document.querySelectorAll('#criminalScreen .cr-gear-illustration')].every(i=>i.complete&&i.naturalWidth===96)")
                        tap(page, ".cr-inventory summary")
                        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
                        first=page.locator(".cr-choices button:not([disabled])").first
                        first.tap()
                        assert page.locator(".cr-consequence").is_visible()
                        if blocked_hash:
                            page.evaluate("() => {history.replaceState=window.__oldReplace;}")
                        page.reload(wait_until="domcontentloaded")
                        assert page.locator("#criminalScreen").is_visible()
                        tap(page,'[data-action="resume"]') if page.locator('[data-action="resume"]').count() else None
                        assert page.evaluate("document.documentElement.scrollWidth<=innerWidth+1")
                        tap(page,'[data-action="home"]')
                        assert page.locator("#home").is_visible()
                        tap(page,"#criminalEntry")
                    assert not errors, errors
                    assert not missing, missing
                    if width==390:
                        page.screenshot(path=str(OUT/(browser_name+"-standalone-last.png")),full_page=True)
                    ctx.close()
                browser.close()
        print("PASS standalone mobile Chromium/WebKit 320/390/430: all five missions, art, scenes, save, back nav")
    finally:
        server.shutdown()
if __name__=="__main__":
    run()
