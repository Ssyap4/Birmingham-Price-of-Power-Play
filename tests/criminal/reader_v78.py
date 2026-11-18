"""V78: targeted mobile investigation reading and evidence UI acceptance."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from local_http import LocalServer
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v78'
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
                for width in (320,390):
                    for case,district in ((1,'small-heath'),(2,'digbeth')):
                        ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
                        page=ctx.new_page();page.set_default_timeout(12000)
                        errors=[]
                        page.on('pageerror',lambda e:errors.append(str(e)))
                        page.route('https://**/*',lambda r:r.abort())
                        page.goto(origin+'/index.html',wait_until='load')
                        def tap(s):
                            target=page.locator(s).first
                            target.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
                            target.tap()
                        def snap(n):
                            page.screenshot(path=str(OUT/f'{engine}-{width}-{case}-{n}-after.png'),animations='disabled')
                        def save(k):return page.evaluate("(k)=>localStorage.getItem(k)",k)
                        def fit():
                            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                        tap('#districtsCard');tap(f'.map-pin[data-district="{district}"]')
                        if case==1:
                            tap('#launchFirstCase');tap('#heroSelection .hero-begin');tap('#case001Briefing .briefing-start')
                            key='birmingham_case_smol_heath_v1_jack'
                            meta='birmingham_case_v20_findings_jack'
                            first=save(key)
                            tap('#case001QuickNav [data-go=evidence]')
                            assert page.locator('.v33-board .v33-empty').is_visible()
                            snap('empty')
                            tap('.v33-close')
                            assert save(key)==first
                            page.evaluate("""()=>{const h=window.BirminghamHero.selectedId,k='birmingham_case_smol_heath_v1_'+h,m='birmingham_case_v20_findings_'+h,s=JSON.parse(localStorage.getItem(k));s.items=['invoice','route'];localStorage.setItem(k,JSON.stringify(s));localStorage.setItem(m,JSON.stringify({started:s.started,deductions:[],reactions:[]}));window.BirminghamCase.resume()}""")
                            fixture=save(key)
                            tap('#case001QuickNav [data-go=evidence]')
                            tap('.v33-tile[data-id=invoice]')
                            assert page.locator('.v33-tile[data-id=route]').get_attribute('data-selection')=='compatible'
                            assert save(key)==fixture
                            tap('.v33-tile[data-id=route]')
                            assert page.locator('.v33-result-status').get_attribute('data-saved')=='true'
                            assert page.evaluate("(k)=>JSON.parse(localStorage.getItem(k)).deductions",meta)==['\u041f\u0443\u0442\u044c \u0433\u0440\u0443\u0437\u0430']
                            tap('.v33-result button')
                            assert page.locator('.v33-shade').is_hidden()
                            assert save(key)==fixture
                        else:
                            tap('#launchSecondCase');page.wait_for_url('**/preview/case002-prototype/index.html?from=map')
                            tap('#briefContinue');tap('#begin')
                            key='birmingham_case002_draft_v3_jack'
                            for target in ('P02','A01','A03','A05'):
                                tap(f'button.choice[data-to="{target}"]')
                            page.wait_for_function("document.querySelector('#game').dataset.artVerified==='true'")
                            assert page.evaluate("document.querySelector('#readScene').getBoundingClientRect().top>=document.querySelector('#sceneArtwork').getBoundingClientRect().bottom-1")
                            raw=save(key)
                            tap('#readScene')
                            assert page.evaluate("document.activeElement===document.querySelector('#sceneText')")
                            tap('#quickNav [data-go=evidence]')
                            assert page.locator('.evidence-card').count()>=1
                            tap('#quickNav [data-go=deductions]')
                            assert page.locator('.pair-board').get_attribute('data-availability')=='awaiting-second'
                            assert page.locator('.pair-item').count()==1
                            assert page.locator('.pair-item').evaluate("e=>e.getBoundingClientRect().width>=e.parentElement.clientWidth-2")
                            tap('.pair-item')
                            assert page.locator('.pair-item-hint').is_visible()
                            assert page.locator('.pair-item[aria-pressed=true]').count()==1
                            assert page.locator('.pair-connection-slot').last.inner_text()=='\u041d\u0423\u0416\u041d\u0410 \u0415\u0429\u0401 \u0423\u041b\u0418\u041a\u0410'
                            fit();snap('single')
                            tap('.pair-item')
                            assert page.locator('.pair-item[aria-pressed=true]').count()==0
                            tap('#quickNav [data-go=journal]')
                            assert page.locator('.journal-compass-kicker').is_visible()
                            assert save(key)==raw
                            tap('#bhEffects')
                            tap('#case002AudioDock .bh-music-credits summary')
                            assert page.locator('#case002AudioDock .bh-music-credits').get_attribute('open') is not None
                            assert save(key)==raw
                            assert page.evaluate("document.querySelector('#case002AudioDock').getBoundingClientRect().top-document.querySelector('#game').getBoundingClientRect().bottom<40")
                            # Follow the actual next available story choices until two clues exist.
                            tap('#quickNav [data-go=choices]')
                            for _ in range(12):
                                raw_state=page.evaluate("(k)=>JSON.parse(localStorage.getItem(k))",key)
                                if page.locator('#pulseEvidence').inner_text().isdigit():break
                                count=int(page.locator('#pulseEvidence').inner_text().split(':')[-1].strip())
                                if count>=2:break
                                tap('.choice-available .choice:not([disabled])')
                            tap('#quickNav [data-go=deductions]')
                            assert page.locator('.pair-item').count()>=2
                            assert page.locator('.pair-board').get_attribute('data-availability')=='ready'
                            before=save(key)
                            tap('.pair-item')
                            tap('.pair-item[aria-pressed=false]')
                            assert page.locator('.pair-result').is_visible()
                            assert save(key)==before
                            fit();snap('multiple')
                        assert not errors,errors
                        print(engine,width,'case',case,'PASS',flush=True)
                        ctx.close()
                browser.close()
    finally:server.shutdown()

if __name__=='__main__':run()

