"""V106: disabled choice remains visibly legible and inert in both mobile builds."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
import json
from playwright.sync_api import sync_playwright
from local_http import LocalServer
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v106'
OUT.mkdir(parents=True,exist_ok=True)
routes={f'CR{i:02}':json.loads((ROOT/f'docs/criminal-operations/CR{i:02}-MOBILE-ROUTES.json').read_text(encoding='utf-8')) for i in range(7,11)}
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
with sync_playwright() as p:
 for build in ('campaign-unified-dist','criminal-preview-dist'):
  server=LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/build)))
  Thread(target=server.serve_forever,daemon=True).start()
  try:
   for engine,width in [('chromium',320),('webkit',390)]:
    browser=getattr(p,engine).launch()
    ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
    page=ctx.new_page();page.set_default_timeout(10000)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.route('https://**/*',lambda r:r.abort())
    page.goto(f'http://127.0.0.1:{server.server_port}/index.html',wait_until='load')
    def tap(sel):
     e=page.locator(sel).first;e.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})");e.tap()
    tap('#criminalEntry')
    state=page.evaluate("""rs=>{for(const [mid,routes] of Object.entries(rs))for(const r of routes){let s=CriminalEngine.create(mid,r.seed,'v106_style_'+mid+'_'+r.label,1);for(const id of r.path){const cs=CriminalEngine.choices(s);if(cs.some(c=>!c.available)&&cs.some(c=>c.available))return s;s=CriminalEngine.choose(s,id,s.revision)}}return null}""",routes)
    assert state
    saved=page.evaluate("s=>{const w=CriminalArchive.save(localStorage,s);if(!w.ok)throw Error(w.error);return w.raw}",state)
    tap(f'.cr-mission-list [data-mission={state["missionId"]}]');tap('[data-action=resume]')
    if page.locator('[data-action=ack]').count():tap('[data-action=ack]')
    tap('[data-action=choices]')
    locked=page.locator('.cr-choices button[data-choice]:disabled').first
    assert locked.is_disabled() and locked.is_visible()
    metrics=locked.evaluate("""e=>{const style=getComputedStyle(e),small=e.querySelector('small:last-child'),fg=getComputedStyle(small).color,bg=style.backgroundColor;function lum(s){return s.match(/[0-9.]+/g).slice(0,3).map(Number).map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((v,x,i)=>v+x*[.2126,.7152,.0722][i],0)}return {opacity:style.opacity,contrast:(Math.max(lum(fg),lum(bg))+.05)/(Math.min(lum(fg),lum(bg))+.05),label:small.textContent}}""")
    assert metrics['opacity']=='1' and metrics['contrast']>=4.5,metrics
    assert 'Недоступно' in metrics['label'],metrics
    locked.evaluate('e=>e.click()')
    assert page.evaluate("id=>localStorage.getItem(CriminalArchive.key(id))",state['missionId'])==saved
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    locked.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
    page.screenshot(path=str(OUT/f'{build}-{engine}-{width}-locked.png'),animations='disabled')
    assert not errors,errors
    print(build,engine,width,'PASS',json.dumps(metrics,ensure_ascii=True),flush=True)
    ctx.close();browser.close()
  finally:server.shutdown()
