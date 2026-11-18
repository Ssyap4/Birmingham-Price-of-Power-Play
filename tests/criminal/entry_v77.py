"""V77 addressable mobile entry UX verification."""
import sys
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from local_http import LocalServer
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v77'
OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def run():
    server=LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'campaign-unified-dist')))
    Thread(target=server.serve_forever,daemon=True).start()
    origin=f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            for engine in ('chromium','webkit'):
                browser=getattr(p,engine).launch()
                for width in ((320,) if "--narrow-second" in sys.argv else (320,390)):
                    for case,district in (((2,'digbeth'),) if '--narrow-second' in sys.argv else ((1,'small-heath'),(2,'digbeth'))):
                        ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
                        page=ctx.new_page();page.set_default_timeout(10000)
                        errors=[];failed=[]
                        page.on('pageerror',lambda e:errors.append(str(e)))
                        page.on('requestfailed',lambda r:failed.append(r.url) if r.url.startswith(origin) else None)
                        page.route('https://**/*',lambda r:r.abort())
                        page.goto(origin+'/index.html',wait_until='load')
                        def tap(s):
                            target=page.locator(s).first
                            target.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
                            target.tap()
                        def snap(n):
                            page.screenshot(path=str(OUT/f'{engine}-{width}-{case}-{n}-after.png'),animations='disabled')
                        def cards(s):
                            assert page.locator(s+' .hero-card:visible').count()==5
                            assert page.locator(s+' .hero-card[aria-pressed="true"]').count()==1
                            assert page.locator(s+' .hero-card').evaluate_all("els=>els.every(e=>e.getBoundingClientRect().height>=44&&e.scrollWidth<=e.clientWidth+2)")
                            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                        tap('#districtsCard');tap(f'.map-pin[data-district="{district}"]')
                        if case==1:
                            tap('#launchFirstCase');cards('#heroCards');snap('heroes')
                            page.evaluate("localStorage.setItem('birmingham_case_smol_heath_v1_finn','null')")
                            tap('#heroCards [data-hero=finn]');cards('#heroCards')
                            assert page.locator('#heroCards [data-hero=finn] .hero-case-progress').is_visible()
                            assert page.locator('#heroSelection .hero-begin').is_disabled()
                            assert page.evaluate("localStorage.getItem('birmingham_case_smol_heath_v1_finn')")=='null'
                            tap('#heroCards [data-hero=jack]')
                            tap('#heroSelection .hero-begin')
                            assert page.locator('#case001Briefing').is_visible()
                            snap('brief');tap('#case001Briefing .briefing-start')
                            assert page.locator('#caseGame').is_visible()
                            assert page.locator('#caseChoices button').count()>0
                        else:
                            tap('#launchSecondCase');page.wait_for_url('**/preview/case002-prototype/index.html?from=map')
                            assert page.locator('#caseBriefing').is_visible()
                            assert page.locator('#case002AudioDock').count()==1
                            assert page.evaluate("document.querySelector('#caseBriefing').getBoundingClientRect().bottom<=document.querySelector('#case002AudioDock').getBoundingClientRect().top")
                            snap('brief')
                            tap('#briefContinue');cards('#heroGallery');snap('heroes')
                            assert page.evaluate("document.querySelector('#begin').getBoundingClientRect().bottom<=document.querySelector('#caseRewardArchive').getBoundingClientRect().top")
                            page.evaluate("localStorage.setItem('birmingham_case002_draft_v3_finn','')")
                            tap('#heroGallery [data-hero=finn]')
                            assert page.locator('#heroGallery [data-hero=finn]').get_attribute('data-save-status')=='damaged'
                            assert page.locator('#resume').is_hidden()
                            page.once('dialog',lambda d:d.dismiss())
                            tap('#begin')
                            assert page.locator('#launch').is_visible()
                            assert page.evaluate("localStorage.getItem('birmingham_case002_draft_v3_finn')")==''
                            tap('#heroGallery [data-hero=jack]');tap('#begin')
                            assert page.locator('#game').is_visible()
                            assert page.locator('#sceneId').inner_text().startswith('P01')
                            assert page.evaluate("document.querySelector('#game').getBoundingClientRect().bottom<=document.querySelector('#case002AudioDock').getBoundingClientRect().top")
                            page.evaluate("window.scrollTo({top:0,behavior:'instant'})");snap('scene')
                            key='birmingham_case002_draft_v3_jack'
                            before=page.evaluate("(k)=>localStorage.getItem(k)",key)
                            assert before
                            effect=page.locator('#bhEffects')
                            effect.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
                            assert effect.evaluate("""e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))}""")
                            tap('#bhEffects')
                            assert page.evaluate("(k)=>localStorage.getItem(k)",key)==before
                            tap('#case002AudioDock .bh-music-credits summary')
                            assert page.locator('#case002AudioDock .bh-music-credits').get_attribute('open') is not None
                        assert not errors,errors
                        assert not failed,failed
                        print(engine,width,'case',case,'PASS',flush=True)
                        ctx.close()
                browser.close()
    finally:server.shutdown()

if __name__=='__main__':run()

