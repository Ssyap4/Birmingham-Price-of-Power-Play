from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
from local_http import LocalServer
import json,time
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v106';OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'campaign-unified-dist')))
Thread(target=server.serve_forever,daemon=True).start()
origin=f'http://127.0.0.1:{server.server_port}'
route=json.loads((ROOT/'docs/criminal-operations/CR10-MOBILE-ROUTES.json').read_text(encoding='utf-8'))[0]
results=[]
try:
 with sync_playwright() as p:
  for engine,width in [('chromium',320),('webkit',390)]:
   b=getattr(p,engine).launch()
   c=b.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
   page=c.new_page();page.set_default_timeout(18000)
   errors=[];missing=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:missing.append(r.url) if r.url.startswith(origin) and r.status>=400 else None)
   page.route('https://**/*',lambda r:r.abort())
   page.goto(origin+'/index.html',wait_until='load')
   def tap(s):
    e=page.locator(s).first;e.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})");e.tap()
   def snap(n):
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),n
    page.screenshot(path=str(OUT/f'{engine}-{width}-{n}.png'),animations='disabled')
   def audio(mode):
    page.wait_for_function("m=>{const s=BirminghamAudio.getState();return s.mode===m&&s.playing&&s.currentTime>.15}",arg=mode)
    assert page.locator('.bh-audio-controls').count()==1
   if page.locator('#bhMusic').get_attribute('aria-pressed')=='true':tap('#bhMusic')
   tap('#bhMusic');audio('menu')
   tap('#criminalEntry');audio('criminal');snap('criminal-audio')
   tap('#homeBtn');audio('menu')
   tap('#districtsCard');audio('menu')
   tap('.map-pin[data-district=digbeth]');tap('#launchSecondCase')
   page.wait_for_url('**/preview/case002-prototype/index.html?from=map')
   tap('#briefContinue');tap('#begin');audio('detective');snap('case002-audio')
   tap('#case002MapReturn');page.wait_for_url('**/index.html#district-digbeth')
   tap('.map-pin[data-district=small-heath]');tap('#launchFirstCase')
   tap('#heroCards [data-hero=jack]');tap('#heroSelection .hero-begin')
   tap('#case001Briefing .briefing-start');audio('detective');snap('case001-audio')
   page.once('dialog',lambda d:d.accept());tap('#homeBtn');audio('menu');tap('#bhMusic')
   page.wait_for_function("BirminghamAudio.getState().activeCount===0&&BirminghamAudio.getState().levels.every(x=>x===0)")
   if page.locator('#bhEffects').get_attribute('aria-pressed')=='true':tap('#bhEffects')
   assert page.evaluate("localStorage.getItem('bh_music_enabled')==='false'&&localStorage.getItem('bh_effects_enabled')==='false'")
   tap('#criminalEntry')
   # Ledger built from exactly reproducible valid engine states, no real user data.
   info=page.evaluate("""r=>{const E=CriminalEngine,A=CriminalArchive;const attempts=[];for(let i=0;i<200;i++){let s=E.create('CR10',r.seed,'v106_stress_'+i,i+1);for(const id of r.path)s=E.choose(s,id,s.revision);if(s.status!=='finished')throw Error('fixture');attempts.push(s)}const s=attempts[0],combo=[s.missionId,s.heroId,s.terminalId].join(':');const achievements={};if(s.terminalId==='clean')achievements['clean:CR10']=s.attemptId;if(s.terminalId==='dead')achievements['remember:CR10']=s.attemptId;const raw=JSON.stringify({schemaVersion:2,attempts,rewards:{[combo]:s.attemptId},achievements});localStorage.setItem(A.LEDGER,raw);const t=performance.now();if(!A.ledger(localStorage).ok)throw Error('invalid ledger');return {bytes:raw.length,validateMs:performance.now()-t}}""",route)
   before=page.evaluate("localStorage.getItem(CriminalArchive.LEDGER)")
   def timed(sel,target):
    # Time synchronous browser click handler + render, excluding automation overhead.
    ms=page.locator(sel).first.evaluate("e=>{const t=performance.now();e.click();return performance.now()-t}")
    assert page.locator(target).first.is_visible()
    return round(ms,1)
   info['openMs']=timed('.cr-top [data-action=chronicle]','.cr-archive-overview')
   assert page.locator('.cr-archive-overview strong').all_inner_texts()[0]=='200'
   assert page.locator('.cr-record').count()==10
   info['pageMs']=[timed('[data-action=archiveNext]','.cr-record') for _ in range(3)]
   info['filterMs']=timed('[data-archive-mission=CR10]','.cr-record')
   assert page.evaluate("localStorage.getItem(CriminalArchive.LEDGER)")==before
   snap('chronicle-200')
   tap('[data-action=commonArchive]');assert page.locator('#campaignCriminalAchievements').is_visible();snap('archive')
   tap('#profileBtn');assert page.locator('#profile').is_visible();snap('profile')
   assert page.evaluate("localStorage.getItem(CriminalArchive.LEDGER)")==before
   tap('#homeBtn');tap('#criminalEntry')
   # Real separate browser tab modifies a save while the first is active.
   tap('.cr-mission-list [data-mission=CR01]');tap('[data-action=start]')
   other=c.new_page();other.goto(origin+'/index.html',wait_until='load')
   changed=other.evaluate("()=>{const s=CriminalEngine.create('CR01',31,'v106_other_tab',1);const w=CriminalArchive.save(localStorage,s);if(!w.ok)throw Error(w.error);return w.raw}")
   tap('[data-choice=accept]')
   assert page.locator('[data-action=retryWrite]').is_visible()
   assert page.evaluate("localStorage.getItem(CriminalArchive.key('CR01'))")==changed
   tap('[data-action=reloadSlot]')
   assert page.evaluate("localStorage.getItem(CriminalArchive.key('CR01'))")==changed
   other.close()
   tap('[data-action=map]')
   page.evaluate("localStorage.setItem(CriminalArchive.key('CR02'),'{broken')")
   tap('.cr-mission-list [data-mission=CR02]')
   assert page.locator('.cr-warning').is_visible()
   assert page.evaluate("localStorage.getItem(CriminalArchive.key('CR02'))")=='{broken'
   tap('[data-action=map]')
   page.evaluate("()=>{const g=Storage.prototype.getItem;Storage.prototype.getItem=function(k){if(k===CriminalArchive.key('CR03'))throw Error('QA denied');return g.call(this,k)}}")
   tap('.cr-mission-list [data-mission=CR03]');tap('[data-action=memoryStart]')
   assert page.locator('.cr-warning').is_visible()
   page.evaluate("()=>{if(!document.querySelector('.cr-choices'))throw Error('memory choices absent')}")
   page.once('dialog',lambda d:d.accept());tap('[data-action=map]')
   assert not errors,errors
   assert not missing,missing
   print(engine,width,'PASS',json.dumps(info),flush=True)
   results.append(dict(engine=engine,width=width,**info))
   c.close();b.close()
finally:server.shutdown()
(OUT/'metrics.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
