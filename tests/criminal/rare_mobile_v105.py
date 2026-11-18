"""V105: validated critical-health fixture, decorative and story asset failures."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
import sys,json
ROOT=Path(__file__).resolve().parents[2]
sys.path.insert(0,str(ROOT/'tests/criminal'))
from local_http import LocalServer
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'campaign-unified-dist')))
Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}'
with sync_playwright() as p:
 for engine,width in [('chromium',320),('webkit',390)]:
  b=getattr(p,engine).launch()
  ctx=b.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
  page=ctx.new_page();page.set_default_timeout(10000)
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.route('https://**/*',lambda r:r.abort())
  page.goto(origin+'/index.html',wait_until='load')
  def tap(sel):
   e=page.locator(sel).first;e.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})");e.tap()
  tap('#criminalEntry')
  s=page.evaluate("""()=>{for(const m of CriminalContent.catalog())for(let seed=0;seed<100;seed++){let s=CriminalEngine.create(m.id,seed,'v105_critical_'+m.id+'_'+seed,1);for(let i=0;i<35&&s.status!=='finished';i++){if(s.hp<40)return s;const cs=CriminalEngine.choices(s).filter(c=>c.available);if(!cs.length)break;cs.sort((a,b)=>b.risk.probability-a.risk.probability);const c=cs[(seed+i)%3===0?Math.min(1,cs.length-1):0];s=CriminalEngine.choose(s,c.id,s.revision)}}return null}""")
  assert s and s['hp']<40,'no critical fixture'
  page.evaluate("s=>{if(!CriminalArchive.save(localStorage,s).ok)throw Error('save')}",s)
  tap(f'.cr-mission-list [data-mission={s["missionId"]}]');tap('[data-action=resume]')
  if page.locator('[data-action=ack]').count():tap('[data-action=ack]')
  assert page.locator('.cr-health[data-health=critical]').count()==1
  assert page.locator('.cr-health-label b').inner_text().endswith('Критическое здоровье')
  assert page.locator('.cr-hp-track').get_attribute('aria-valuenow')==str(s['hp'])
  (ROOT/'work/criminal/v105').mkdir(parents=True,exist_ok=True)
  page.locator('.cr-frame img').evaluate('e=>e.decode()')
  page.screenshot(path=str(ROOT/f'work/criminal/v105/{engine}-{width}-critical.png'),animations='disabled')
  tap('.cr-inventory summary')
  icons=page.locator('.cr-equipment-item img')
  assert icons.count()
  card=page.locator('.cr-equipment-item').first
  before=card.bounding_box()['height']
  icons.first.evaluate("e=>e.src='/__missing_gear.svg'")
  card.locator('.cr-icon-fallback').wait_for(state='visible')
  after=card.bounding_box()['height']
  print(engine,width,'hp',s['hp'],'gear card height',before,after,'story fallback in gear',card.locator('.cr-art-fallback').count(),flush=True)
  page.screenshot(path=str(ROOT/f'work/criminal/v105/{engine}-{width}-gear-failure.png'),animations='disabled')
  assert not card.locator('.cr-art-fallback').count()
  assert card.locator('.cr-icon-fallback').count()==1
  assert after<=before+1
  assert card.locator('.cr-equipment-meta').is_visible()
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  # A missing story illustration retains its own distinct status and controls.
  page.locator('.cr-frame img').evaluate("e=>e.src='/__missing_frame.webp'")
  page.locator('.cr-frame[data-art-state=unavailable] .cr-art-fallback').wait_for()
  assert page.locator('.cr-choices button:not([disabled])').count()>0
  assert not errors,errors
  ctx.close();b.close()
server.shutdown()
