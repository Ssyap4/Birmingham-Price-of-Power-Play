"""V81: profile hierarchy, explicit completion labels and existing archive links."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from local_http import LocalServer
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v81';OUT.mkdir(parents=True,exist_ok=True)
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
                    def capture(n):
                        page.locator('#playerCampaignOverview').evaluate("e=>e.scrollIntoView({block:'start',behavior:'instant'})")
                        page.screenshot(path=str(OUT/f'{engine}-{width}-{n}.png'),animations='disabled')
                    def storage():return page.evaluate("JSON.stringify(Object.entries(localStorage).filter(([k])=>/birmingham_/.test(k)).sort())")
                    before=storage()
                    tap('#cabinetProfile')
                    cards=page.locator('#profile .player-overview-card')
                    assert cards.count()==3
                    assert cards.locator('.player-overview-completion strong').all_inner_texts()==['0','0','0']
                    assert cards.locator('.player-overview-completion span').count()==3
                    assert page.locator('#profile .campaign-profile-links button').count()==3
                    assert page.evaluate("document.querySelector('#playerCampaignOverview').nextElementSibling.matches('.campaign-profile-links')")
                    assert page.evaluate("document.querySelector('.campaign-profile-links').getBoundingClientRect().bottom<=document.querySelector('.profile-v21-subheading').getBoundingClientRect().top")
                    assert page.locator('#profile .campaign-profile-links button').evaluate_all("es=>es.every(e=>e.getBoundingClientRect().height>=44)")
                    assert cards.locator(".player-overview-completion").evaluate_all("es=>es.every(e=>e.querySelector('strong').getBoundingClientRect().bottom<=e.querySelector('span').getBoundingClientRect().top+1)")
                    fit();capture('ready')
                    assert storage()==before
                    for dest in ('campaignDossiers','campaignAchievements','campaignHistory'):
                        tap(f'#profile .campaign-profile-links [data-open-section="{dest}"]')
                        assert page.locator('#'+dest).is_visible()
                        fit()
                        tap('#homeBtn');tap('#cabinetProfile')
                    page.evaluate("""()=>{localStorage.setItem('birmingham_campaign_records_v1','{broken');localStorage.setItem('birmingham_case_smol_heath_v1_jack','null');window.dispatchEvent(new StorageEvent('storage',{key:'birmingham_campaign_records_v1'}))}""")
                    raw=storage()
                    assert cards.first.get_attribute('data-status')=='damaged'
                    assert cards.first.locator('.player-overview-completion strong').inner_text()=='—'
                    assert cards.first.locator('.player-overview-live').get_attribute('data-issues')=='1'
                    fit();capture('damaged')
                    assert storage()==raw
                    assert not errors,errors
                    print(engine,width,'PASS: profile labels, three archive links, damaged archive/slot untouched',flush=True)
                    ctx.close()
                browser.close()
    finally:server.shutdown()
if __name__=='__main__':run()

