#!/usr/bin/env python3
"""A missing quiz bank cannot replace the common menu or mutate saves."""
import json
from functools import partial
from pathlib import Path
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from local_http import LocalServer
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"work/criminal"
OUT.mkdir(parents=True,exist_ok=True)

class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

def run():
    server=LocalServer(("127.0.0.1",0),partial(Quiet,directory=str(ROOT/"campaign-unified-dist")))
    Thread(target=server.serve_forever,daemon=True).start()
    origin=f"http://127.0.0.1:{server.server_port}"
    report=[]
    try:
        with sync_playwright() as p:
            for name in ("chromium","webkit"):
                browser=getattr(p,name).launch(headless=True)
                try:
                    for blocked in (False,True):
                        context=browser.new_context(viewport={"width":390,"height":844},is_mobile=True,has_touch=True)
                        page=context.new_page()
                        errors=[]; missing=[]; cancelled_audio=set()
                        page.on("pageerror",lambda e:errors.append(str(e)))
                        def failed(r):
                            if not r.url.startswith(origin) or (blocked and r.url.endswith("/questions.js")):
                                return
                            # A rapid screen change retires the previous audio request.
                            # Verify that exact MP3 independently below; never suppress
                            # unrelated request failures or a missing media file.
                            if r.url.startswith(origin+"/assets/audio/soundtrack/") and r.url.endswith(".mp3") and r.failure in ("Load request cancelled","net::ERR_ABORTED"):
                                cancelled_audio.add(r.url)
                            else:
                                missing.append([r.url,r.failure])
                        page.on("requestfailed",failed)
                        page.on("response",lambda r:missing.append([r.url,r.status]) if r.url.startswith(origin) and r.status>=400 else None)
                        page.route("https://**/*",lambda r:r.abort())
                        if blocked:page.route("**/questions.js",lambda r:r.abort())
                        try:
                            page.goto(origin+"/index.html",wait_until="domcontentloaded")
                            assert page.evaluate("Boolean(window.BIRMINGHAM_QUESTIONS)")== (not blocked)
                            original=page.evaluate("JSON.stringify(Object.entries(localStorage).sort())")
                            for button,screen in [(".cabinet-entry-quiz","#choose"),("#homeBtn","#home"),("#districtsCard","#districts"),("#homeBtn","#home"),("#criminalEntry","#criminalScreen .cr-map"),("#homeBtn","#home")]:
                                target=page.locator(button)
                                target.scroll_into_view_if_needed(timeout=10000)
                                target.tap(timeout=10000)
                                page.locator(screen).wait_for(state="visible",timeout=10000)
                                if screen=="#choose":
                                    assert page.locator("#difficultyList button:enabled").count()==(0 if blocked else 4)
                                    if blocked:
                                        assert page.locator("#choose").get_attribute("data-trial-availability")=="unavailable"
                                        assert page.locator("#chooseDescription").get_attribute("role")=="status"
                                        page.screenshot(path=str(OUT/f"startup-isolation-{name}.png"))
                                if screen=="#districts":assert page.locator(".map-pin").count()==5
                                if screen=="#criminalScreen .cr-map":assert page.locator(".cr-pin").count()==5
                            assert page.evaluate("JSON.stringify(Object.entries(localStorage).sort())")==original
                            for url in sorted(cancelled_audio):
                                response=context.request.get(url)
                                assert response.ok and len(response.body())>1024,(url,response.status)
                                response.dispose()
                            assert not errors,errors
                            assert not missing,missing
                            result={"browser":name,"bank":"blocked" if blocked else "normal","status":"PASS","verified_cancelled_audio":len(cancelled_audio)}
                        except Exception as e:
                            result={"browser":name,"bank":"blocked" if blocked else "normal","status":"FAIL","error":str(e),"missing":missing,"pageerrors":errors}
                        finally:context.close()
                        report.append(result)
                        print(json.dumps(result,ensure_ascii=True),flush=True)
                        (OUT/"startup-isolation.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
                finally:browser.close()
    finally:server.shutdown()
    assert all(r["status"]=="PASS" for r in report),report

if __name__=="__main__":run()
