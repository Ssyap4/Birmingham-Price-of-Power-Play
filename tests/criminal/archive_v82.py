"""V82: long common archives, section returns and hero index focus."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from local_http import LocalServer
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v82';OUT.mkdir(parents=True,exist_ok=True)
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
                    page=ctx.new_page();page.set_default_timeout(10000)
                    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
                    page.route('https://**/*',lambda r:r.abort())
                    page.goto(origin+'/index.html',wait_until='load')
                    def tap(s):
                        e=page.locator(s).first;e.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})");e.tap()
                    def fit():assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                    def storage():return page.evaluate("JSON.stringify(Object.entries(localStorage).filter(([k])=>/birmingham_/.test(k)).sort())")
                    def focus(origin):
                        assert page.evaluate("id=>document.activeElement?.dataset.jumpTo===id",origin),origin
                    tap('#storyStart');before=storage()
                    for id in ('campaignFirstCaseAchievements','campaignSecondCaseAchievements','campaignCriminalAchievements'):
                        tap(f'#campaignAchievements [data-jump-to={id}]')
                        button=f'#{id} > .campaign-section-return'
                        assert page.locator(button).is_visible()
                        if id=='campaignFirstCaseAchievements':
                            assert page.locator('#'+id).get_attribute('open') is not None
                            page.locator(button).evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
                            page.screenshot(path=str(OUT/f'{engine}-{width}-long-awards.png'),animations='disabled')
                        tap(button);focus(id);fit()
                    assert page.locator('#campaignFirstCaseAchievements').get_attribute('open') is not None
                    tap('#campaignAchievements [data-open-section=campaignHistory]')
                    for id in ('campaignFirstCaseHistory','campaignSecondCaseHistory','campaignCriminalHistory'):
                        tap(f'#campaignHistory [data-jump-to={id}]')
                        button='#campaignHistory .campaign-history-list + .campaign-section-return' if id=='campaignFirstCaseHistory' else f'#{id} > .campaign-section-return'
                        tap(button);focus(id);fit()
                    tap('#campaignHistory [data-open-section=campaignDossiers]')
                    for hero in ('jack','finn','eleanor','victor','samuel'):
                        id='campaignHero'+hero
                        tap(f'#campaignDossiers [data-jump-to={id}]')
                        tap(f'#{id} .campaign-002-back-to-heroes');focus(id)
                    tap('#campaignCriminalDossiers > .campaign-section-return');focus('campaignHerojack');fit()
                    assert page.locator('#campaignDossiers .campaign-section-return').count()==1
                    tap('#campaignDossiers .campaign-return')
                    assert page.locator('#home').is_visible()
                    assert storage()==before
                    assert not errors,errors
                    print(engine,width,'PASS: 6 archive returns, 5 hero returns, common menu, saved bytes unchanged',flush=True)
                    ctx.close()
                browser.close()
    finally:server.shutdown()
if __name__=='__main__':run()

