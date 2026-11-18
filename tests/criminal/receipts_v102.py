"""V102: final presentation, real decisions and memory-only exit; isolated saves."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from contextlib import suppress
import json
from playwright.sync_api import sync_playwright
from local_http import LocalServer
from cr06_art_mobile import ROUTES as CR06

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v102';OUT.mkdir(parents=True,exist_ok=True)
DOC=ROOT/'docs/criminal-operations'
ROUTES={f'CR{i:02}':json.loads((DOC/f'CR{i:02}-MOBILE-ROUTES.json').read_text(encoding='utf-8')) for i in range(7,11)}
OLD=json.loads((ROOT/'work/criminal/playthroughs.json').read_text(encoding='utf-8'))
PREFIX='birmingham_criminal_v2_'
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
 def copyfile(self,s,o):
  with suppress(BrokenPipeError,ConnectionResetError,ConnectionAbortedError):super().copyfile(s,o)

def run():
 server=LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'campaign-unified-dist')))
 Thread(target=server.serve_forever,daemon=True).start()
 origin=f'http://127.0.0.1:{server.server_port}'
 results=[]
 try:
  with sync_playwright() as p:
   for engine,width in [('chromium',320),('webkit',390),('chromium',390),('webkit',320)]:
    b=getattr(p,engine).launch()
    c=b.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
    page=c.new_page();page.set_default_timeout(15000)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    missing=[];page.on('response',lambda r:missing.append(r.url) if r.status>=400 and r.url.startswith(origin) else None)
    page.route('https://**/*',lambda r:r.abort())
    page.goto(origin+'/index.html',wait_until='load',timeout=30000)
    def tap(s):
     el=page.locator(s).first;el.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})");el.tap()
    def raw(mid):return page.evaluate("k=>localStorage.getItem(k)",PREFIX+'save_'+mid)
    def ledger():return page.evaluate("k=>localStorage.getItem(k)",PREFIX+'ledger')
    def fit():assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    def snap(name,sel):
     page.locator(sel).first.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
     page.wait_for_timeout(300)
     page.screenshot(path=str(OUT/f'after-{engine}-{width}-{name}.png'),animations='disabled')
    def enter(mid):
     tap(f'.cr-mission-list [data-mission="{mid}"]')
    def fixture(mid,route):
     return page.evaluate("""([mid,r])=>{let s=CriminalEngine.create(mid,r.seed,'v102_'+mid+'_'+r.label,1);for(const id of r.path)s=CriminalEngine.choose(s,id,s.revision);if(s.terminalId!==r.end)throw Error(mid+':'+s.terminalId);return s}""",[mid,route])
    def check_final(s):
     assert page.locator('.cr-result').get_attribute('data-outcome')==s['terminalId']
     assert page.locator('.cr-final-metrics strong').all_inner_texts()==[str(s['hp'])+'/100',str(s['stats']['time']),'погиб' if s['hp']==0 else 'выжил']
     assert page.locator('.cr-epilogue-card').count()>=1
     assert page.locator('.cr-final-consequence .cr-receipt-choice b').inner_text()==page.evaluate("""s=>s.lastEvent.choiceId==='heal'?'Перевязать раны':CriminalContent.missions[s.missionId].scenes[s.lastEvent.from].choices.find(c=>c.id===s.lastEvent.choiceId).label""",s)
     fit()
    tap('#criminalEntry')
    # Actual early decision, gear and journal.
    enter('CR05');tap('[data-action=start]');tap('.cr-inventory summary')
    assert page.locator('.cr-equipment-item').count()==4
    assert page.locator('.cr-equipment-meta span').evaluate_all("es=>es.every(e=>e.clientWidth>=85&&getComputedStyle(e).overflowWrap==='break-word')")
    snap('gear','.cr-equipment-grid');before=raw('CR05')
    tap('.cr-choices [data-choice]:not([disabled])')
    s=json.loads(raw('CR05'));assert s['revision']==1 and raw('CR05')!=before
    assert page.locator('.cr-receipt-choice b').inner_text()==page.evaluate("s=>CriminalContent.missions.CR05.scenes[s.lastEvent.from].choices.find(c=>c.id===s.lastEvent.choiceId).label",s)
    snap('receipt','.cr-consequence')
    tap('.cr-journal summary')
    assert page.locator('.cr-journal-act').count()==1
    assert page.locator('.cr-journal-last').inner_text()==s['lastEvent']['text']
    snap('journal','.cr-journal')
    confirmed=raw('CR05');tap('[data-action=ack]');assert raw('CR05')==confirmed
    tap('[data-action=map]')
    # Real engine-produced terminal states, not invented flags.
    plans=[]
    if (engine,width)==('chromium',320):
     plans += [(mid,OLD[mid]['care']) for mid in OLD]
     plans += [('CR06',fixture('CR06',dict(seed=0,label='clean',end='clean',path=CR06['clean'])))]
    if (engine,width)==('webkit',390):
     plans += [(mid,fixture(mid,r)) for mid in ROUTES for r in ROUTES[mid][:4]]
    if not plans:
     plans += [('CR10',fixture('CR10',r)) for r in ROUTES['CR10'][:4]]
    for mid,s in plans:
     assert s['status']=='finished' and page.evaluate('s=>CriminalEngine.validateState(s).ok',s)
     page.evaluate("s=>localStorage.setItem('birmingham_criminal_v2_save_'+s.missionId,JSON.stringify(s))",s)
     stored=raw(mid);enter(mid);tap('[data-action=resume]');check_final(s)
     assert page.locator('.cr-final-receipt').is_visible()
     if page.locator('[data-action=dismissReward]').is_visible():tap('[data-action=dismissReward]')
     if mid=='CR10':snap(s['terminalId'],'.cr-result')
     l=ledger()
     if mid=='CR10' and s['terminalId']=='clean':
      tap('[data-action=finalChronicle]');tap('[data-action=returnFinal]')
      assert ledger()==l and not page.locator('.cr-reward-toast').count()
     tap('.cr-final-actions [data-action=map]')
     assert raw(mid)==stored and ledger()==l
     results.append([engine,width,mid,s['terminalId']])
    # Damaged archive remains byte-identical, and no confirmed reward.
    page.evaluate("localStorage.setItem('birmingham_criminal_v2_ledger','{broken')")
    last=plans[-1][0];enter(last);tap('[data-action=resume]')
    assert page.locator('.cr-final-receipt').count()==0
    assert page.locator('[data-action=retryArchive]').is_visible()
    assert ledger()=='{broken'
    tap('.cr-final-actions [data-action=map]')
    assert not errors,errors
    assert not missing,missing
    print(engine,width,'PASS',len(plans),'terminal fixtures, actual early choice, journal, archive',flush=True)
    c.close()
    # Fresh context: actual memory-only route without writing anything.
    c=b.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
    page=c.new_page();page.set_default_timeout(15000)
    page.route('https://**/*',lambda r:r.abort())
    page.goto(origin+'/index.html',wait_until='load',timeout=30000)
    tap('#criminalEntry')
    route=ROUTES['CR10'][3]
    page.evaluate("""seed=>{window.__v102Get=Storage.prototype.getItem;Storage.prototype.getItem=function(k){if(k==='birmingham_criminal_v2_save_CR10')throw Error('QA blocked slot');return window.__v102Get.call(this,k)};window.__v102Random=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=a=>{if(a instanceof Uint32Array&&a.length===2){a[0]=seed;a[1]=12345;return a}return window.__v102Random(a)}}""",route['seed'])
    enter('CR10');tap('[data-action=memoryStart]')
    page.evaluate("()=>{Storage.prototype.getItem=window.__v102Get;crypto.getRandomValues=window.__v102Random}")
    for cid in route['path']:
     tap(f'[data-choice="{cid}"]')
     if page.locator('[data-action=ack]').count():tap('[data-action=ack]')
    expected=fixture('CR10',route);check_final(expected)
    assert not page.locator('.cr-final-receipt').count()
    assert not page.locator('[data-action=retryArchive], [data-action=finalChronicle], .cr-top [data-action=chronicle]').count()
    assert 'только до выхода' in page.locator('.cr-warning').inner_text()
    assert raw('CR10') is None and ledger() is None
    page.once('dialog',lambda d:d.dismiss());tap('.cr-final-actions [data-action=map]')
    assert page.locator('.cr-result').is_visible()
    page.once('dialog',lambda d:d.accept());tap('.cr-final-actions [data-action=map]')
    assert page.locator('.cr-mission-list').is_visible()
    assert raw('CR10') is None and ledger() is None
    print(engine,width,'PASS memory-only real route, cancel/confirm exit',flush=True)
    c.close();b.close()
 finally:server.shutdown()
 (OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print('PASS',len(results),'final fixtures and 4 memory-only routes',flush=True)
if __name__=='__main__':run()

