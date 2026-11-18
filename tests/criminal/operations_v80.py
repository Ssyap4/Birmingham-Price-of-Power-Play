"""V80: brief/consequence/final, using actual touch and existing engine-backed QA fixtures."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
import json
from local_http import LocalServer
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v80';OUT.mkdir(parents=True,exist_ok=True)
PLANS=json.loads((ROOT/'work/criminal/playthroughs.json').read_text(encoding='utf-8'))
PREFIX='birmingham_criminal_v2_'
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
                    page=ctx.new_page();page.set_default_timeout(12000)
                    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
                    page.route('https://**/*',lambda r:r.abort())
                    page.goto(origin+'/index.html',wait_until='load')
                    def tap(s):
                        e=page.locator(s).first;e.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})");e.tap()
                    def save(k):return page.evaluate("(k)=>localStorage.getItem(k)",PREFIX+k)
                    def snap(n,s):
                        page.locator(s).first.evaluate("e=>e.scrollIntoView({block:'start',behavior:'instant'})")
                        page.screenshot(path=str(OUT/f'{engine}-{width}-{n}-after.png'),animations='disabled')
                    def fit():assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                    tap('#criminalEntry');tap('.cr-pin[data-mission=CR02]')
                    assert page.locator('.cr-actions[data-brief=CR02]').is_visible()
                    tap('[data-action=start]');raw=save('save_CR02')
                    tap('[data-choice=go]')
                    assert page.locator('.cr-consequence').is_visible()
                    assert page.locator('.cr-hp-delta').get_attribute('data-change')=='none'
                    assert page.locator('.cr-hp-delta').inner_text().startswith('HP \u0431\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439')
                    confirmed=save('save_CR02');assert confirmed!=raw
                    tap('[data-action=ack]');assert save('save_CR02')==confirmed
                    tap('[data-action=map]')
                    for id in ('CR01','CR02','CR03','CR04','CR05'):
                        state=PLANS[id]['care']
                        page.evaluate("([id,s])=>localStorage.setItem('birmingham_criminal_v2_save_'+id,JSON.stringify(s))",[id,state])
                        before=save('save_'+id)
                        tap(f'.cr-pin[data-mission={id}]');tap('[data-action=resume]')
                        assert page.locator('.cr-result').is_visible() and page.locator('.cr-final-receipt').is_visible()
                        assert page.locator('.cr-final-consequence').is_visible()
                        assert page.locator('.cr-hp-delta').is_visible()
                        order=page.evaluate("""()=>{const r=document.querySelector('#criminalScreen'),a=[...r.children];return ['.cr-result','.cr-final-receipt','.cr-save-status','.cr-final-actions','.cr-final-detail-heading','.cr-final-consequence','.cr-epilogue','.cr-journal'].map(s=>a.indexOf(r.querySelector(s)))}""")
                        assert min(order)>=0 and order==sorted(order),order
                        assert page.locator('.cr-final-actions').count()==1
                        toast=page.locator('[data-action=dismissReward]')
                        if toast.is_visible():tap('[data-action=dismissReward]')
                        assert page.locator('.cr-final-receipt').is_visible()
                        assert save('save_'+id)==before
                        assert page.locator('.cr-final-actions button').evaluate_all("es=>es.every(e=>e.getBoundingClientRect().height>=44)")
                        ledger=save('ledger')
                        if id=='CR02':
                            snap('final','.cr-result')
                            tap('[data-action=finalChronicle]');tap('[data-action=returnFinal]')
                            assert page.locator('.cr-final-receipt').is_visible()
                            assert save('ledger')==ledger
                        fit();tap('#criminalScreen .cr-top [data-action=map]')
                        assert save('save_'+id)==before
                    # Damaged ledger cannot claim a verified award; retry is ahead of optional details.
                    page.evaluate("localStorage.setItem('birmingham_criminal_v2_ledger','{broken')")
                    tap('.cr-pin[data-mission=CR03]');tap('[data-action=resume]')
                    assert page.locator('.cr-final-receipt').count()==0
                    assert page.locator('.cr-final-actions [data-action=retryArchive]').is_visible()
                    assert save('ledger')=='{broken'
                    fit();assert not errors,errors
                    print(engine,width,'PASS: early real choice, 5 finals, chronicle return, damaged ledger',flush=True)
                    ctx.close()
                browser.close()
    finally:server.shutdown()
if __name__=='__main__':run()

