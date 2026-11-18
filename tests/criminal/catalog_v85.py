"""Catalog after CR06: real touch with and without a synthetic next-wave mission."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from local_http import LocalServer, tap_mission_pin
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v85'
OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
def run():
 dist=ROOT/'campaign-unified-dist'
 server=LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(dist)))
 Thread(target=server.serve_forever,daemon=True).start()
 origin=f'http://127.0.0.1:{server.server_port}'
 try:
  with sync_playwright() as p:
   for engine in ('chromium','webkit'):
    browser=getattr(p,engine).launch()
    for width in (320,390):
     for extra in (False,True):
      ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
      page=ctx.new_page()
      page.set_default_timeout(12000)
      errors=[]
      page.on('pageerror',lambda e:errors.append(str(e)))
      page.route('https://**/*',lambda r:r.abort())
      if extra:
       # Test-only registration in the browser; not shipped in the game.
       source=(dist/'src/criminal/missions/cr05.js').read_text(encoding='utf-8')
       source+=';CriminalContent.register({...CriminalContent.missions.CR01,id:"CR9999",title:"QA catalog fixture",catalog:{districtId:"balsall-heath",wave:2},awardNames:["A","B","C","D"]});'
       page.route('**/src/criminal/missions/cr05.js',lambda r:r.fulfill(status=200,content_type='application/javascript',body=source))
      page.goto(origin+'/index.html',wait_until='load')
      def tap(selector):
       b=page.locator(selector).first
       b.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
       b.tap()
      def snapshot():return page.evaluate("JSON.stringify(Object.entries(localStorage).filter(([k])=>k.startsWith('birmingham_')).sort())")
      tap('#criminalEntry')
      before=snapshot()
      assert page.evaluate("Boolean(CriminalContent.missions.CR9999)")==extra
      totals=page.evaluate("""()=>({all:CriminalContent.catalog().length,jack:CriminalContent.catalog().filter(m=>m.heroId==="jack").length,district:CriminalContent.catalog().filter(m=>m.districtId==="balsall-heath").length})""")
      assert page.locator('.cr-pin:visible').count()==5
      assert page.locator('.cr-mission-list [data-mission]').count()==totals["all"]
      assert page.locator("#crCatalogFilter optgroup").count()==2
      assert page.locator(".cr-catalog-count").inner_text()==f"Показано {totals['all']} из {totals['all']}"
      assert page.locator('#criminalScreen [data-action="chronicle"]:visible').count()==1
      assert page.locator(".cr-card-art").count()==10
      assert page.evaluate("new Set([...document.querySelectorAll('.cr-card-art')].map(i=>i.src)).size")==10
      tap('#criminalScreen [data-action="catalog"]')
      assert page.locator("#crCatalogHeading").evaluate("e=>e===document.activeElement")
      assert page.locator("#crCatalogHeading").bounding_box()["y"]>=60
      if not extra:
       page.locator(".cr-card-art").first.evaluate("i=>i.decode()")
       page.wait_for_timeout(500)
       page.screenshot(path=str(OUT/f'v100-{engine}-{width}-list.png'),animations="disabled")
      if extra:
       tap('.cr-pin[data-catalog-district="balsall-heath"]')
       assert page.locator('#crCatalogFilter').input_value()=='district:balsall-heath'
       assert page.locator('.cr-pin[data-catalog-district="balsall-heath"]').get_attribute("aria-pressed")=="true"
       assert page.locator(".cr-catalog-count").inner_text()==f"Показано {totals['district']} из {totals['all']}"
       assert page.locator('.cr-mission-list [data-mission]').count()==totals["district"]
       assert page.locator('.cr-mission-list [data-mission="CR9999"]').is_visible()
      page.locator('#crCatalogFilter').select_option('hero:jack')
      assert page.locator('.cr-mission-list [data-mission]').count()==totals["jack"]
      assert page.locator(".cr-catalog-count").inner_text()==f"Показано {totals['jack']} из {totals['all']}"
      assert page.locator('.cr-pin[aria-pressed="true"]').count()==0
      assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
      if extra:
       page.screenshot(path=str(OUT/f'{engine}-{width}-group.png'),animations='disabled')
      tap('.cr-mission-list [data-mission="CR01"]')
      assert page.locator('#criminalScreen [data-action="start"]').is_visible()
      tap('#criminalScreen [data-action="map"]')
      assert page.locator('#crCatalogFilter').input_value()=='all'
      if extra:
       tap_mission_pin(page,'CR9999',tap)
       assert page.locator('#criminalScreen [data-action="start"]').is_visible()
       tap('#criminalScreen [data-action="map"]')
      tap('#criminalScreen [data-campaign-jump="archive"]')
      assert page.locator('#campaignCriminalAchievements .campaign-criminal-hero-folds details').count()==totals["all"]
      assert snapshot()==before
      assert not errors,errors
      print(engine,width,'extra',extra,'PASS',flush=True)
      ctx.close()
    browser.close()
 finally:server.shutdown()
if __name__=='__main__':run()
