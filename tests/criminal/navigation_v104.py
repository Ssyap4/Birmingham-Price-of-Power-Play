"""V104: exact return points and navigation in both exported packages."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from contextlib import suppress
from playwright.sync_api import sync_playwright
from local_http import LocalServer
import json,sys
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v104';OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def copyfile(self,s,o):
  with suppress(BrokenPipeError,ConnectionResetError,ConnectionAbortedError):super().copyfile(s,o)
def run():
 servers=[LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/x))) for x in ('campaign-unified-dist','criminal-preview-dist')]
 for server in servers:Thread(target=server.serve_forever,daemon=True).start()
 results=[]
 try:
  with sync_playwright() as p:
   configs=[('chromium',320),('webkit',390),('chromium',390),('webkit',320)]
   for engine,width in (configs[:1] if '--smoke' in sys.argv else configs):
    browser=getattr(p,engine).launch()
    for standalone,server in enumerate(servers):
     ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
     page=ctx.new_page();page.set_default_timeout(15000)
     errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
     missing=[];page.on('response',lambda r:missing.append(r.url) if r.status>=400 and r.url.startswith('http://127.0.0.1:') else None)
     page.route('https://**/*',lambda r:r.abort())
     page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='load')
     def tap(s):
      e=page.locator(s).first;e.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})");e.tap()
     def fit():assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
     def raw(mid='CR01'):return page.evaluate("id=>localStorage.getItem('birmingham_criminal_v2_save_'+id)",mid)
     def ledger():return page.evaluate("localStorage.getItem('birmingham_criminal_v2_ledger')")
     def snap(name):
      page.wait_for_timeout(200)
      page.screenshot(path=str(OUT/f'{engine}-{width}-{standalone}-{name}.png'),animations='disabled')
     def chronicle():tap('.cr-top [data-action=chronicle]')
     def back():tap('.cr-top [data-action=returnFinal]')
     tap('#criminalEntry')
     page.locator('#crCatalogFilter').select_option('hero:jack')
     tap('.cr-mission-list [data-mission=CR01]')
     assert raw() is None
     chronicle()
     assert page.locator('[data-archive-mission=CR01]').get_attribute('aria-pressed')=='true'
     assert page.locator('[data-action=returnFinal]').inner_text()=='← К приказу'
     assert page.locator('[data-action=commonArchive]').count()==(0 if standalone else 1)
     back()
     assert page.locator('[data-brief=CR01]').is_visible() and raw() is None
     tap('[data-action=returnCatalog]')
     assert page.locator('#crCatalogFilter').input_value()=='hero:jack'
     assert page.locator('.cr-mission-list [data-mission=CR01]').evaluate('e=>document.activeElement===e')
     snap('catalog-return');fit()
     tap('.cr-mission-list [data-mission=CR01]');tap('[data-action=start]')
     tap('[data-choice=accept]')
     confirmed=raw();assert json.loads(confirmed)['revision']==1
     chronicle();assert page.locator('[data-action=returnFinal]').inner_text()=='← К поручению'
     assert page.locator('.cr-top [data-action=chronicle]').count()==0
     snap('chronicle-return');back()
     assert page.locator('.cr-consequence').is_visible() and raw()==confirmed
     tap('[data-action=ack]')
     title=page.locator('.cr-heading h1').inner_text()
     chronicle();back()
     assert page.locator('.cr-consequence').count()==0 and page.locator('.cr-choices').is_visible()
     assert page.locator('.cr-heading h1').inner_text()==title and raw()==confirmed and ledger() is None
     chronicle()
     # Other tab replacement, represented by a valid engine-generated slot.
     page.evaluate("()=>{const s=CriminalEngine.create('CR01',17,'v104_other_tab',1);if(!CriminalArchive.save(localStorage,s).ok)throw Error('save')}")
     changed=raw();assert changed!=confirmed
     back();assert page.locator('.cr-warning').inner_text().find('Возврат отменён')>=0
     assert page.locator('[data-action=returnFinal]').count()==0 and raw()==changed
     assert page.locator('.cr-top [data-action=chronicle]').count()==0
     tap('.cr-top [data-action=map]')
     assert page.locator('#crCatalogFilter').input_value()=='all'
     tap('.cr-mission-list [data-mission=CR01]');tap('[data-action=resume]')
     assert raw()==changed
     if not standalone:
      tap('#profileBtn')
      assert page.locator('#profile').is_visible()
      assert page.locator('#criminalScreen').is_hidden()
      assert page.evaluate("!document.body.dataset.criminal")
      tap('#homeBtn')
     else:tap('.cr-top [data-action=home]')
     assert page.locator('#home').is_visible() and raw()==changed
     tap('#criminalEntry');chronicle()
     assert page.locator('[data-archive-mission=all]').get_attribute('aria-pressed')=='true'
     assert page.locator('[data-action=returnFinal]').count()==0
     assert page.locator('.cr-top [data-action=chronicle]').count()==0
     tap('.cr-top [data-action=map]')
     route=json.loads((ROOT/'docs/criminal-operations/CR10-MOBILE-ROUTES.json').read_text(encoding='utf-8'))[0]
     page.evaluate("r=>{let s=CriminalEngine.create('CR10',r.seed,'v104_final_fixture',1);for(const id of r.path)s=CriminalEngine.choose(s,id,s.revision);if(s.status!=='finished'||!CriminalArchive.save(localStorage,s).ok)throw Error('fixture')}",route)
     end=raw('CR10')
     tap('.cr-mission-list [data-mission=CR10]');tap('[data-action=resume]')
     assert page.locator('.cr-final-receipt').is_visible()
     archive=ledger();assert archive is not None
     tap('[data-action=finalChronicle]')
     assert page.locator('[data-action=returnFinal]').inner_text()=='← К итогу'
     back()
     assert page.locator('.cr-final-receipt').is_visible()
     assert raw('CR10')==end and ledger()==archive
     assert page.locator('.cr-reward-toast').count()==0
     tap('.cr-top [data-action=chronicle]')
     if standalone:
      assert page.locator('[data-action=commonArchive]').count()==0
      assert 'Общий архив доступен в основной кампании.' in page.locator('#criminalScreen').inner_text()
     else:
      tap('[data-action=commonArchive]')
      assert page.locator('#campaignCriminalAchievements').is_visible()
     fit();assert raw()==changed and raw('CR10')==end and ledger()==archive
     assert not errors,errors
     assert not missing,missing
     results.append([engine,width,'standalone' if standalone else 'unified'])
     print(engine,width,'standalone' if standalone else 'unified','PASS',flush=True)
     ctx.close()
    browser.close()
 finally:
  for server in servers:server.shutdown()
 (OUT/'results.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
 print('PASS',len(results),'navigation paths',flush=True)
if __name__=='__main__':run()

