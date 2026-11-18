"""Integrated CR06: real taps, actual generated art, replay, four finals and archives."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
from contextlib import suppress
import json
from local_http import LocalServer
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT/'campaign-unified-dist'
OUT = ROOT/'work/criminal/cr06-art'
OUT.mkdir(parents=True, exist_ok=True)
KEY = 'birmingham_criminal_v2_save_CR06'
ROUTES = {
 'clean': ['accept','papers','listen','compare','consent','ask','compare','substantiate','sign'],
 'costly': ['accept','official','trust','insist','calm','comply','sign'],
 'failed': ['accept','official','trust','abandon','return'],
 'dead': ['accept','official','trust','insist','confront'],
 'medical': ['accept','friend','promise','confirm','present','askBell','compare','substantiate','sign'],
 'late': ['accept','friend','hear','clinic','confirm','compare','consent','ask','compare','substantiate','sign'],
 'witness': ['accept','papers','listen','compare','consent','ask','invite','consent','sign'],
 'bargain': ['accept','official','question','present','ask','invite','decline','deny','return'],
 'escape': ['accept','friend','hear','together','hurry','confront','clear','farewell'],
}
AWARDS = ['Неподписанный приговор','Тяжёлая подпись','Невыполненный приказ','Последний приказ']

class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args): pass
 def copyfile(self,source,outputfile):
  with suppress(BrokenPipeError,ConnectionResetError,ConnectionAbortedError):
   super().copyfile(source,outputfile)

def run():
 assert (DIST/'src/criminal/missions/cr06.js').is_file(), 'CR06 must be genuinely packaged'
 server = LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(DIST)))
 Thread(target=server.serve_forever,daemon=True).start()
 origin = f'http://127.0.0.1:{server.server_port}'
 results = []
 try:
  with sync_playwright() as p:
   for engine in ('chromium','webkit'):
    browser = getattr(p,engine).launch()
    for width in (320,390):
     ctx = browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
     page = ctx.new_page(); page.set_default_timeout(15000)
     errors, missing, viewed = [], [], set()
     page.on('pageerror',lambda e: errors.append(str(e)))
     page.on('response',lambda r: missing.append(r.url) if r.status>=400 and r.url.startswith(origin) else None)
     page.route('https://**/*',lambda r:r.abort())
     page.goto(origin+'/index.html',wait_until='domcontentloaded')
     def tap(selector):
      el = page.locator(selector).first
      el.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
      el.tap()
     def raw(): return page.evaluate('(k)=>localStorage.getItem(k)',KEY)
     def state(): return json.loads(raw())
     def check_art(scene):
      expected = f'assets/criminal/cr06-{scene.replace(":","-")}.webp'
      page.wait_for_function("expected=>{const f=document.querySelector('#criminalScreen .cr-frame'),i=f?.querySelector('img');return f?.dataset.artState==='ready'&&i?.getAttribute('src')===expected&&i.complete&&i.naturalWidth===720&&i.naturalHeight===900}",arg=expected)
      assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), scene
      im=page.locator('#criminalScreen .cr-frame img')
      assert im.evaluate("i=>getComputedStyle(i).objectFit==='contain'")
      box=im.bounding_box()
      assert abs(box['width']/box['height']-0.8)<0.01, (scene,box)
      if scene not in viewed:
       im.scroll_into_view_if_needed()
       page.screenshot(path=str(OUT/f'{engine}-{width}-{scene.replace(":","-")}.png'),animations='disabled')
      viewed.add(scene)
     def choose(choice):
      check_art(state()['sceneId'])
      tap(f'#criminalScreen [data-choice="{choice}"]')
      if page.locator('#criminalScreen [data-action="ack"]').count():
       tap('#criminalScreen [data-action="ack"]')
     # Both advertised entry routes must expose the real mission without writes.
     tap('#criminalEntry')
     before=page.evaluate('JSON.stringify(Object.entries(localStorage).sort())')
     tap('.cr-pin[data-catalog-district="balsall-heath"]')
     assert page.locator('.cr-mission-list [data-mission]').count()==2
     tap('.cr-mission-list [data-mission="CR06"]')
     check_art('order')
     tap('#criminalScreen [data-action="map"]')
     page.locator('#crCatalogFilter').select_option('hero:jack')
     assert page.locator('.cr-mission-list [data-mission]').count()==2
     assert page.locator('.cr-mission-list [data-mission="CR06"]').is_visible()
     assert page.evaluate('JSON.stringify(Object.entries(localStorage).sort())')==before
     # Decode every packaged frame through the real browser decoder.
     decoded=page.evaluate("""async()=>{const frames=CriminalArt.frames.filter(f=>f.missionId==='CR06');await Promise.all(frames.map(async f=>{const i=new Image();i.src=f.path;await i.decode();if(i.naturalWidth!==720||i.naturalHeight!==900)throw Error(f.id)}));return frames.length}""")
     assert decoded==26
     # Existing slots are engine-produced and then kept byte-for-byte through CR06.
     old_slots=page.evaluate("""()=>{const out={};for(const id of ['CR01','CR02','CR03','CR04','CR05']){const s=CriminalEngine.create(id,0,'cr06_preserve_'+id,1);if(!CriminalArchive.save(localStorage,s).ok)throw Error(id);out[id]=localStorage.getItem('birmingham_criminal_v2_save_'+id)}return out}""")
     dead_seed=page.evaluate("""route=>{for(let seed=0;seed<500;seed++){let s=CriminalEngine.create('CR06',seed,'seed_probe',1);for(const c of route)s=CriminalEngine.choose(s,c,s.revision);if(s.terminalId==='dead')return seed}throw Error('No death seed')}""",ROUTES['dead'])
     escape_seed=page.evaluate("""route=>{for(let seed=0;seed<500;seed++){let s=CriminalEngine.create('CR06',seed,'escape_probe',1);try{for(const c of route)s=CriminalEngine.choose(s,c,s.revision)}catch{continue}if(s.terminalId==='failed'&&s.flags.leftTogether)return seed}throw Error('No escape seed')}""",ROUTES['escape'])
     for label in ('clean','costly','failed','dead','medical','late','witness','bargain','escape','repeat'):
      if label!='clean':
       tap('#criminalScreen [data-action="map"]')
       page.locator('#crCatalogFilter').select_option('hero:jack')
      tap('.cr-mission-list [data-mission="CR06"]')
      seed = dead_seed if label=='dead' else escape_seed if label=='escape' else 0
      # Control only entropy before starting; no flags/stats/finished saves injected.
      page.evaluate("""seed=>{window.__cr06Random=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=a=>{if(a instanceof Uint32Array&&a.length===2){a[0]=seed;a[1]=12345;return a}return window.__cr06Random(a)}}""",seed)
      tap('#criminalScreen [data-action="start"]' if label=='clean' else '#criminalScreen [data-action="restart"]')
      page.evaluate('crypto.getRandomValues=window.__cr06Random')
      assert state()['rng']['seed']==seed
      assert page.locator('.cr-act-progress span').count()==4
      route=ROUTES['clean' if label=='repeat' else label]
      for index,choice in enumerate(route):
       choose(choice)
       if label=='clean' and index==3:
        saved=raw()
        page.reload(wait_until='domcontentloaded')
        tap('#criminalScreen [data-action="resume"]')
        assert raw()==saved
        tap('#criminalScreen [data-action="ack"]')
        assert raw()==saved
      expected={'medical':'clean','late':'failed','witness':'clean','bargain':'failed','escape':'failed','repeat':'clean'}.get(label,label)
      assert state()['terminalId']==expected,(label,state())
      check_art('end:'+expected)
      assert len(page.locator('.cr-epilogue-card').all())==2
      assert page.locator('.cr-final-receipt').is_visible()
      if label in ('clean','costly','failed','dead'):
       assert page.locator('.cr-reward-toast').is_visible()
      else:
       assert not page.locator('.cr-reward-toast').count(), 'Repeated outcome granted a second reward'
      if label=='clean': assert state()['stats']['time']==17
      if label=='late':
       assert state()['stats']['time']==25 and not state()['objective']
       assert 'срок' in page.locator('.cr-epilogue').inner_text().lower()
      saved=raw()
      tap('#criminalScreen [data-action="finalChronicle"]')
      assert page.locator('[data-archive-mission="CR06"][aria-pressed="true"]').count()==1
      tap('#criminalScreen [data-action="returnFinal"]')
      assert raw()==saved
      assert page.evaluate("slots=>Object.entries(slots).every(([id,raw])=>localStorage.getItem('birmingham_criminal_v2_save_'+id)===raw)",old_slots)
     ledger=page.evaluate('CriminalArchive.ledger(localStorage)')
     assert ledger['ok'] and len(ledger['value']['rewards'])==4
     assert len(ledger['value']['attempts'])==10
     expected_scenes=page.evaluate("[...Object.keys(CriminalContent.missions.CR06.scenes),...Object.keys(CriminalContent.missions.CR06.endings).map(e=>'end:'+e)]")
     assert viewed==set(expected_scenes), sorted(set(expected_scenes)-viewed)
     tap('#criminalScreen [data-action="map"]')
     tap('#criminalScreen [data-campaign-jump="archive"]')
     fold=page.locator('[data-archive-fold="criminal:reward:CR06"]')
     fold.locator('summary').tap()
     for name in AWARDS: assert name in fold.inner_text()
     page.screenshot(path=str(OUT/f'{engine}-{width}-common-archive.png'),animations='disabled')
     assert not errors, errors
     assert not missing, missing
     row=dict(engine=engine,width=width,decoded=decoded,viewed=sorted(viewed),routes=10,rewards=4,errors=errors,missing=missing)
     results.append(row)
     (OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
     print(engine,width,'PASS CR06: district/hero, 26 decodes, save/reload, 4 finals, late/medical/repeat, old slots, epilogues, chronicle/common archive',flush=True)
     ctx.close()
    browser.close()
 finally:
  server.shutdown()
if __name__=='__main__': run()
