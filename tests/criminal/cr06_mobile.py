"""V87 source-only CR06 candidate, real browser touch; no public registration."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from contextlib import suppress
from local_http import LocalServer
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
DIST=ROOT/'campaign-unified-dist'
OUT=ROOT/'work/criminal/v87'
OUT.mkdir(parents=True,exist_ok=True)
KEY='birmingham_criminal_v2_save_CR06'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def copyfile(self,source,outputfile):
  with suppress(BrokenPipeError,ConnectionResetError,ConnectionAbortedError):
   super().copyfile(source,outputfile)
def run():
 assert not (DIST/'src/criminal/missions/cr06.js').exists()
 server=LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(DIST)))
 Thread(target=server.serve_forever,daemon=True).start()
 origin=f'http://127.0.0.1:{server.server_port}'
 injected=(DIST/'src/criminal/missions/cr05.js').read_text(encoding='utf-8')+'\n'+(ROOT/'src/criminal/missions/cr06.js').read_text(encoding='utf-8')
 try:
  with sync_playwright() as p:
   for engine,width in [('chromium',390),('webkit',320)]:
    browser=getattr(p,engine).launch()
    ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
    page=ctx.new_page();page.set_default_timeout(12000)
    errors=[];missing=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:missing.append(r.url) if r.status>=400 and r.url.startswith(origin) else None)
    page.route('https://**/*',lambda r:r.abort())
    page.route('**/src/criminal/missions/cr05.js',lambda r:r.fulfill(status=200,content_type='application/javascript',body=injected))
    page.goto(origin+'/index.html',wait_until='domcontentloaded')
    def tap(s):
     el=page.locator(s).first
     el.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
     el.tap()
    def raw():return page.evaluate('(k)=>localStorage.getItem(k)',KEY)
    def state():
     import json
     return json.loads(raw())
    def choose(c):
     tap(f'#criminalScreen [data-choice="{c}"]')
     if page.locator('#criminalScreen [data-action="ack"]').count():tap('#criminalScreen [data-action="ack"]')
    tap('#criminalEntry')
    tap('.cr-pin[data-catalog-district="balsall-heath"]')
    tap('.cr-mission-list [data-mission="CR06"]')
    assert 'Цена неповиновения' in page.locator('#criminalScreen h1').inner_text()
    tap('#criminalScreen [data-action="start"]')
    assert page.locator('.cr-act-progress span').count()==4
    for c in ['accept','papers','listen','compare']:choose(c)
    before=raw()
    page.reload(wait_until='domcontentloaded')
    tap('#criminalScreen [data-action="resume"]')
    assert raw()==before
    assert page.locator('#criminalScreen [data-action="ack"]').is_visible()
    tap('#criminalScreen [data-action="ack"]')
    assert raw()==before
    for c in ['consent','ask','compare','substantiate','sign']:choose(c)
    assert state()['terminalId']=='clean'
    assert state()['stats']['time']==17
    assert 'Неподписанный приговор' in page.locator('.cr-final-receipt').inner_text()
    assert page.locator('.cr-reward-toast').is_visible()
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    page.screenshot(path=str(OUT/f'{engine}-{width}-ending.png'),animations='disabled')
    tap('#criminalScreen [data-action="finalChronicle"]')
    assert 'Неподписанный приговор' in page.locator('#criminalScreen').inner_text()
    tap('#criminalScreen [data-action="returnFinal"]')
    assert state()['terminalId']=='clean'
    assert not errors,errors
    assert not missing,missing
    print(engine,width,'CR06 start, four acts, replay, final, archive PASS',flush=True)
    ctx.close();browser.close()
 finally:server.shutdown()
if __name__=='__main__':run()
