"""V101: real briefing, first decision, receipt and resume in both mission waves."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
import json
import sys
from playwright.sync_api import sync_playwright
from local_http import LocalServer

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v101'
OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass

def run():
 server=LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'campaign-unified-dist')))
 Thread(target=server.serve_forever,daemon=True).start()
 origin=f'http://127.0.0.1:{server.server_port}'
 results=[]
 try:
  with sync_playwright() as p:
   for engine,width,full in [('chromium',320,True),('webkit',390,True),('chromium',390,False),('webkit',320,False)]:
    browser=getattr(p,engine).launch()
    ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
    page=ctx.new_page();page.set_default_timeout(15000)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.route('https://**/*',lambda r:r.abort())
    page.goto(origin+'/index.html',wait_until='load',timeout=30000)
    def tap(s):
     b=page.locator(s).first
     b.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
     b.tap()
    def fit():
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    def raw(mid):
     return page.evaluate("id=>localStorage.getItem('birmingham_criminal_v2_save_'+id)",mid)
    def state(mid):return json.loads(raw(mid))
    def snap(mid,name):
     page.wait_for_timeout(300)
     page.screenshot(path=str(OUT/f'after-{engine}-{width}-{mid}-{name}.png'),animations='disabled',full_page=True)
    tap('#criminalEntry')
    ids=page.evaluate('CriminalContent.catalog().map(e=>e.id)') if full and '--smoke' not in sys.argv else ['CR05','CR10']
    for mid in ids:
     before=page.evaluate("JSON.stringify(Object.entries(localStorage).filter(([k])=>k.startsWith('birmingham_criminal_v2_save_')).sort())")
     tap(f'.cr-mission-list [data-mission="{mid}"]')
     assert page.locator(f'[data-brief="{mid}"]').count()==1
     assert page.locator('.cr-brief-order p').inner_text()==page.evaluate('id=>CriminalContent.missions[id].brief',mid)
     assert page.locator('.cr-brief-rules p').inner_text()==page.evaluate('id=>CriminalContent.missions[id].rules',mid)
     tap('.cr-common-rules summary')
     assert page.locator('.cr-common-rules').get_attribute('open') is not None
     tap('.cr-common-rules summary')
     fit()
     assert page.evaluate("JSON.stringify(Object.entries(localStorage).filter(([k])=>k.startsWith('birmingham_criminal_v2_save_')).sort())")==before
     if mid in ('CR05','CR10'):snap(mid,'brief')
     tap('[data-action="start"]')
     assert state(mid)['revision']==0
     assert page.locator('.cr-save-status').inner_text()=='Поручение сохранено · на этом устройстве'
     assert page.locator('.cr-health .cr-hp-track').get_attribute('aria-valuenow')=='100'
     assert page.locator('.cr-health-label strong').inner_text()=='100/100'
     assert page.locator('.cr-hud > span').count()==len(state(mid)['stats'])
     assert all('undefined' not in x for x in page.locator('.cr-hud > span').all_inner_texts())
     assert page.locator('.cr-heading[data-phase="scene"] > span').inner_text().startswith('АКТ')
     page.locator('.cr-frame img').evaluate('i=>i.decode()')
     assert page.locator('.cr-frame img').evaluate('i=>i.naturalWidth===720&&i.naturalHeight===900')
     old=raw(mid)
     tap('.cr-inventory summary')
     assert page.locator('.cr-equipment-item').count()==len(state(mid)['inventory'])
     tap('.cr-inventory summary')
     assert raw(mid)==old
     fit()
     if mid in ('CR05','CR10'):snap(mid,'scene')
     tap('[data-action="choices"]')
     assert page.locator('#crDecisionHeading').evaluate('e=>e===document.activeElement')
     choice=page.locator('.cr-choices [data-choice]:not([disabled])').first
     cid=choice.get_attribute('data-choice')
     assert choice.locator('.cr-risk-info strong').is_visible()
     assert choice.locator('.cr-risk-info span').is_visible()
     expected=page.evaluate("([s,id])=>CriminalEngine.choose(s,id,s.revision)",[state(mid),cid])
     tap(f'[data-choice="{cid}"]')
     assert state(mid)==expected
     assert page.locator('.cr-save-status').inner_text()=='Ход сохранён · на этом устройстве'
     assert page.locator('.cr-consequence').is_visible()
     assert page.locator('.cr-health .cr-hp-track').get_attribute('aria-valuenow')==str(expected['hp'])
     if mid in ('CR05','CR10'):snap(mid,'receipt')
     confirmed=raw(mid)
     tap('[data-action="ack"]')
     assert raw(mid)==confirmed
     tap('[data-action="map"]')
     tap(f'.cr-mission-list [data-mission="{mid}"]')
     assert page.locator('.cr-brief-progress').is_visible()
     assert str(expected['hp'])+'/100' in page.locator('.cr-brief-progress').inner_text()
     tap('[data-action="resume"]')
     assert raw(mid)==confirmed
     assert page.locator('.cr-consequence').is_visible()
     tap('[data-action="ack"]')
     assert raw(mid)==confirmed
     fit()
     tap('[data-action="map"]')
     results.append(dict(engine=engine,width=width,mission=mid))
     print(engine,width,mid,'PASS',flush=True)
    assert not errors,errors
    ctx.close();browser.close()
 finally:server.shutdown()
 (OUT/'results.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
 print('PASS',len(results),'attempts',flush=True)
if __name__=='__main__':run()

