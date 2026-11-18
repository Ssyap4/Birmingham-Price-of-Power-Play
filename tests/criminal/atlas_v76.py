"""V76: fixed-width unified atlas and Chronicle actual touch acceptance."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from local_http import LocalServer
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v76'
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
                    ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
                    page=ctx.new_page()
                    page.set_default_timeout(10000)
                    errors=[]
                    failed=[]
                    page.on('pageerror',lambda e:errors.append(str(e)))
                    page.on('requestfailed',lambda r:failed.append(r.url) if r.url.startswith(origin) else None)
                    page.route('https://**/*',lambda r:r.abort())
                    page.goto(origin+'/index.html',wait_until='load')
                    def tap(s):
                        target=page.locator(s).first
                        target.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
                        target.tap()
                    def rect(s):return page.locator(s).first.bounding_box()
                    def no_overflow():
                        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                    def capture(name):
                        page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
                        page.screenshot(path=str(OUT/f'{engine}-{width}-{name}.png'),animations='disabled')
                    saves=page.evaluate("JSON.stringify(Object.entries(localStorage).filter(([k])=>k.startsWith('birmingham_')).sort())")
                    tap('#districtsCard')
                    assert page.locator('.map-pin:visible').count()==5
                    assert rect('#districts .districts-heading')['y']<rect('#districts .map-panel')['y']
                    no_overflow()
                    capture('detective-after')
                    tap('#districts [data-campaign-jump="criminal"]')
                    assert page.locator('.cr-pin:visible').count()==5
                    assert page.locator('#criminalScreen .cr-top [data-action="home"]').is_hidden()
                    order=page.evaluate("""()=>{const root=document.querySelector('#criminalScreen');const a=[...root.children];return ['.cr-heading','.campaign-portal-v13','.cr-map','.cr-top','.cr-mission-list'].map(s=>a.indexOf(root.querySelector(s)))}""")
                    assert min(order)>=0 and order==sorted(order),order
                    no_overflow()
                    capture('missions-after')
                    assert rect('#criminalScreen [data-action="chronicle"]')['height']>=44
                    tap('#criminalScreen [data-action="chronicle"]')
                    assert page.locator('#criminalScreen [data-action="map"]').is_visible()
                    tap('#criminalScreen [data-action="map"]')
                    assert page.locator('.cr-pin:visible').count()==5
                    tap('.cr-pin[data-mission="CR02"]')
                    assert page.locator('#criminalScreen [data-action="start"]').is_visible()
                    tap('#criminalScreen [data-action="map"]')
                    tap('#criminalScreen [data-campaign-jump="archive"]')
                    assert page.locator('#campaignAchievements').is_visible()
                    tap('#homeBtn')
                    assert page.locator('#home').is_visible()
                    assert page.evaluate("JSON.stringify(Object.entries(localStorage).filter(([k])=>k.startsWith('birmingham_')).sort())")==saves
                    assert not errors,errors
                    assert not failed,failed
                    print(engine,width,'PASS atlas order, Chronicle, mission entry, archive, unchanged saves',flush=True)
                    ctx.close()
                browser.close()
    finally:server.shutdown()

if __name__=='__main__':run()

