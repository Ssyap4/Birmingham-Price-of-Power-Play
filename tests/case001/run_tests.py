#!/usr/bin/env python3
"""Black-box Playwright audit; game sources are never rewritten.
Run: python3 tests/case001/run_tests.py
Starts its own static server; output: results.json, coverage.json, failure screenshots.
Math.random is controlled for deterministic risk branches; boundary fixtures are labelled.
"""
import contextlib, functools, http.server, json, threading, traceback, time, os, re, subprocess, shutil
from pathlib import Path
from collections import deque
from playwright.sync_api import sync_playwright
TEST_DIR=Path(__file__).resolve().parent
ROOT=TEST_DIR.parents[1]
OUT=Path(os.environ.get('CASE001_QA_ARTIFACTS',TEST_DIR/'artifacts'));OUT.mkdir(parents=True,exist_ok=True)
def launch_browser(playwright):
 executable=os.environ.get('CASE001_CHROMIUM_EXECUTABLE') or (playwright.chromium.executable_path if os.environ.get('CI') else shutil.which('chromium') or playwright.chromium.executable_path)
 return playwright.chromium.launch(executable_path=executable,headless=True,args=['--no-sandbox'])
SCENES=json.loads(subprocess.check_output(['node',str(TEST_DIR/'extract-scenes.cjs')],text=True))
BASELINE_EDGES=json.loads((TEST_DIR/'baseline_edges.json').read_text())
BASELINE_EDGE_SET={tuple(edge) for edge in BASELINE_EDGES}
HEROES=['jack','finn','eleanor','victor','samuel']
BASE='birmingham_case_smol_heath_v1_'; META='birmingham_case_v20_findings_'
PAIRS=[('key','envelope'),('receipt','ledger'),('invoice','route'),('note','witness'),('testimony','overheard'),('ash','ledger')]
ONE={'envelope','interview','searchOffice','listen'}
RESULTS=[]; EDGES=set(); NODES=set(); ERRORS=[]; RESOURCES=set()
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
 def copyfile(self,source,outputfile):
  with contextlib.suppress(BrokenPipeError,ConnectionResetError):super().copyfile(source,outputfile)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start(); URL=f'http://127.0.0.1:{server.server_port}'
def route(target, required=frozenset()):
 q=deque([('intro',frozenset(),frozenset(),[])]); seen=set()
 while q:
  n,items,visited,path=q.popleft()
  if n==target and set(required)<=items:return path
  key=(n,items,visited&ONE)
  if key in seen:continue
  seen.add(key)
  for label,dest,*req in SCENES[n].get('choices',[]):
   if (n,dest) not in BASELINE_EDGE_SET:continue # Keep the original audit routes; hero branches have separate regressions.
   if req and req[0] not in items:continue
   if dest in ONE and dest in visited:continue
   if dest.startswith('ending'):continue
   q.append((dest,items|frozenset(SCENES[dest].get('give',[])),visited|{n},path+[dest]))
 raise AssertionError('No route to '+target)
class Game:
 def __init__(self,browser,hero='jack',roll=.99,mobile=False):
  self.hero=hero;self.errors=[];self.console=[];self.requests=[]
  self.ctx=browser.new_context(viewport={'width':812,'height':375} if mobile else {'width':1440,'height':1000},reduced_motion='reduce',is_mobile=mobile,has_touch=mobile)
  self.ctx.add_init_script(f'window.__qaRoll={roll}; Math.random=()=>window.__qaRoll;')
  self.p=self.ctx.new_page(); self.p.set_default_timeout(10000)
  self.p.on('pageerror',lambda e:(self.errors.append(str(e)),ERRORS.append(str(e))))
  self.p.on('console',lambda m:self.console.append(m.text) if m.type=='error' else None)
  self.p.on('response',lambda r:RESOURCES.add((r.status,r.url)) if r.status>=400 else None)
  self.p.goto(URL,wait_until='domcontentloaded');self.p.locator('#districtsCard').click();self.launch()
 def launch(self):
  before=self.state()
  self.p.locator('#launchFirstCase').click()
  self.p.locator('.hero-card').nth(HEROES.index(self.hero)).click();self.p.locator('.hero-begin').click()
  if self.p.locator('#case001Briefing').is_visible():
   self.p.locator('#case001Briefing .briefing-start').click()
   self.p.locator('#case001Briefing .briefing-start').click()
  assert self.p.locator('#caseGame').is_visible()
  if before is not None:assert self.state()==before,'Continue must preserve the entire saved investigation'
  else:assert self.state()['node']=='intro'
  NODES.add(self.state()['node'])
 def state(self):return self.p.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',BASE+self.hero)
 def meta(self):return self.p.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',META+self.hero)
 def go(self,dest):
  before=self.state();n=before['node']; c=next(c for c in SCENES[n]['choices'] if c[1]==dest)
  self.p.locator('#caseChoices button').filter(has_text=c[0]).click()
  after=self.state();actual=after['node'];assert actual in (dest,'endingDeath'),(n,dest,actual)
  EDGES.add((n,dest));NODES.add(actual)
  for item in SCENES[actual].get('give',[]):assert item in after['items'],(actual,item)
  assert len(after['items'])==len(set(after['items']))
  assert self.p.locator('#caseTitle').inner_text()==SCENES[actual]['title']
  return after
 def path(self,path):
  for dest in path:self.go(dest)
 def combine(self,a,b):
  self.p.locator('.v34-open-inventory').click();self.p.locator(f'.v33-tile[data-id="{a}"]').click();self.p.locator(f'.v33-tile[data-id="{b}"]').click()
  assert self.p.locator('.v33-result-layer').is_visible()
  self.p.locator('.v33-result button').click()
 def close(self):
  try:assert not self.errors,self.errors
  finally:self.ctx.close()
G=None
def test(name,fn):
 global G
 if os.environ.get('CASE001_QA_FILTER') and not re.search(os.environ['CASE001_QA_FILTER'],name):return
 G=None; start=time.time()
 try:
  detail=fn() or {}; assert not (G and G.errors),G.errors
  RESULTS.append({'name':name,'status':'passed','seconds':round(time.time()-start,2),'detail':detail})
 except Exception as e:
  if G:
   with contextlib.suppress(Exception):G.p.screenshot(path=str(OUT/(name.replace('/','--')+'-failure.png')),full_page=True)
  RESULTS.append({'name':name,'status':'failed','seconds':round(time.time()-start,2),'error':str(e),'traceback':traceback.format_exc()})
 finally:
  if G:G.ctx.close()
 print(RESULTS[-1]['status'].upper(),name,RESULTS[-1].get('error',''),flush=True)
def game(browser,hero='jack',roll=.99,mobile=False):
 global G
 G=Game(browser,hero,roll,mobile);return G
# All clues through legitimate story actions, no injected save.
FULL=['widow','interview','envelope','widow','office','searchOffice','canal','listen','sneak','warehouse','warn','office','canal','bribe','warehouse','reed','reedProof','confession','pump']
def full(g):g.path(FULL)
def endings(browser,hero,ending):
 g=game(browser,hero,0 if ending=='endingDeath' else .99)
 if ending in ('endingTruth','endingPower'):
  full(g);g.combine('ash','ledger');g.path(['confront','expose',ending])
 elif ending=='endingDeal':g.path(['widow','canal','bribe','pump','confront',ending])
 else:
  g.path(['envelope','canal','sneak','warehouse','pump','yard','rescue'])
  if ending=='endingDeath':g.go('endingEvidence')
  else:g.go(ending)
 s=g.state();assert s['node']==ending,(ending,s)
 assert s['ending']==ending;assert g.p.locator('#caseOutcome').is_visible()
 assert ('Репутация' not in g.p.locator('#caseOutcome').inner_text()) if ending=='endingDeath' else ('Репутация +'+str(SCENES[ending]['reputation']) in g.p.locator('#caseOutcome').inner_text())
 return {'hero':hero,'ending':ending,'health':s['health'],'items':s['items'],'trail':s['trail']}
def edge(browser,source,target):
 g=game(browser)
 if target in ('endingTruth','endingPower'):full(g);g.combine('ash','ledger');g.path(['confront']+(['expose'] if source=='expose' else ['pressure']))
 else:g.path(route(source,next((c[2:] for c in SCENES[source]['choices'] if c[1]==target),[])))
 assert g.state()['node']==source
 g.go(target)
 return {'source':source,'target':target}
def inventory(browser,mobile=False):
 g=game(browser,mobile=mobile);full(g)
 assert len(g.state()['items'])==11,g.state()['items']
 for a,b in PAIRS:g.combine(a,b)
 m=g.meta();assert len(m['deductions'])==6
 for a,b in PAIRS:g.combine(a,b)
 assert g.meta()==m,'Repeated combinations changed rewards/findings'
 g.p.locator('.v34-open-inventory').click(); assert g.p.locator('.v33-tile').count()==11
 g.p.locator('.v33-tile[data-id="key"]').click();g.p.locator('.v33-tile[data-id="ledger"]').click()
 assert g.p.locator('.v33-result-layer').count()==0
 g.p.keyboard.press('Escape');assert not g.p.locator('.v33-shade').is_visible()
 return {'items':11,'deductions':6,'repeated_pairs':'unchanged','mobile':mobile}
def healing(browser,hero):
 g=game(browser,hero,0);g.path(['widow']);initial=g.state()['medicalKits'];assert initial==(2 if hero=='jack' else 1)
 g.path(['office','widow']);assert g.state()['medicalKits']==initial,'Repeated kit grant'
 g.path(['canal','sneak']);assert g.state()['health']==75
 g.p.locator('#caseChoices button').filter(has_text='Использовать перевязочный пакет').click()
 assert g.state()['health']==(100 if hero=='jack' else 90)
 assert g.state()['medicalKits']==initial-1
 g.path(['reed','canal','sneak']);assert g.state()['health']==(100 if hero=='jack' else 90),'Repeated danger damage'
 assert g.state()['items'].count('receipt')==1
 return {'initial_kits':initial,'healed_health':g.state()['health']}
def resume(browser,mode):
 g=game(browser);g.path(['widow','office','canal','sneak']);before=g.state()
 if mode=='reload':g.p.reload(wait_until='domcontentloaded');assert g.state()==before;g.p.locator('#districtsCard').click()
 else:
  g.p.mouse.move(0,0);g.p.wait_for_function("document.querySelectorAll('#caseHealthToasts .case-health-toast').length===0",timeout=18000)
  g.p.locator('#caseBack').click();assert g.state()==before
 g.launch();assert g.state()==before,'Saved investigation reset to intro on reopening: '+json.dumps({'before':before,'after':g.state()},ensure_ascii=False)
def restart(browser,hero):
 g=game(browser,hero);full(g);g.combine('ash','ledger');before=g.state()
 g.p.mouse.move(0,0);g.p.wait_for_function("document.querySelectorAll('#caseHealthToasts .case-health-toast').length===0",timeout=18000)
 g.p.once('dialog',lambda d:d.dismiss());g.p.locator('#caseRestart').click();assert g.state()==before
 g.p.once('dialog',lambda d:d.accept());g.p.locator('#caseRestart').click();s=g.state()
 assert s['node']=='intro' and s['items']==[] and s['health']==100 and s['trail']==[] and s['ending'] is None
 assert s['started']!=before['started'];g.p.locator('.v34-open-inventory').click();assert '0 / 6' in g.p.locator('.v33-stats').inner_text()
 return {'old_metadata_still_stored':g.meta(),'new_started':s['started']}
def gate_refresh(browser,source):
 g=game(browser);full(g);g.path(['confront',source]);g.combine('ash','ledger')
 for target in ['endingTruth','endingPower']:
  label=next(c[0] for c in SCENES[source]['choices'] if c[1]==target)
  assert g.p.locator('#caseChoices button').filter(has_text=label).is_enabled(),'Valid deduction does not unlock '+target+' at '+source

def reaction(browser,who):
 g=game(browser);full(g);g.combine('receipt','ledger');g.path(['confront'])
 g.p.locator('.v20-interrogate').click();assert g.p.locator('.case-v18-overlay').is_visible()
 g.p.locator('.v18-close').click();assert g.p.locator('.v20-interrogate').count()==0
 assert len(g.meta()['reactions'])==1

def risk_bonus(browser,hero,target,roll,expected):
 g=game(browser,hero,.99);g.path(route({'sneak':'canal','yard':'pump','rescue':'yard','endingEvidence':'rescue'}[target]));g.p.evaluate('(v)=>window.__qaRoll=v',roll)
 before=g.state()['health'];after=g.go(target);damage=before-after['health'];assert damage==expected,(hero,target,roll,expected,damage)
 return {'roll':roll,'damage':damage}
if __name__=='__main__':
 with sync_playwright() as p:
  browser=launch_browser(p)
  for hero in HEROES:
   for ending in [k for k,v in SCENES.items() if v.get('end')]:test(f'ending/{hero}/{ending}',lambda h=hero,e=ending:endings(browser,h,e))
  for source,target in BASELINE_EDGES:
   test(f'edge/{source}/{target}',lambda s=source,t=target:edge(browser,s,t))
  for mobile in [False,True]:test('inventory/'+('mobile' if mobile else 'desktop'),lambda m=mobile:inventory(browser,m))
  for h in HEROES:
   test('healing/'+h,lambda h=h:healing(browser,h));test('restart/'+h,lambda h=h:restart(browser,h))
  for mode in ['reload','map']:test('resume/'+mode,lambda m=mode:resume(browser,m))
  for source in ['expose','pressure']:test('gate_refresh/'+source,lambda s=source:gate_refresh(browser,s))
  test('reaction/crane',lambda:reaction(browser,'crane'))
  for h,t,r,e in [('jack','rescue',.25,0),('finn','sneak',.2,0),('eleanor','sneak',.28,0),('victor','rescue',.32,0),('samuel','yard',.2,0),('jack','sneak',.2,25),('jack','yard',.2,30)]:
   test(f'risk/{h}/{t}/{r}',lambda h=h,t=t,r=r,e=e:risk_bonus(browser,h,t,r,e))
  browser.close()
 server.shutdown()
 (OUT/os.environ.get('CASE001_QA_OUTPUT','results.json')).write_text(json.dumps({'results':RESULTS,'page_errors':ERRORS,'http_errors':sorted(RESOURCES)},ensure_ascii=False,indent=2))
 (OUT/os.environ.get('CASE001_QA_COVERAGE','coverage.json')).write_text(json.dumps({'nodes':sorted(NODES),'edges':[list(e) for e in sorted(EDGES)],'total_scenes':len(SCENES),'total_story_edges':sum(len(s.get('choices',[])) for s in SCENES.values())},ensure_ascii=False,indent=2))
 print(json.dumps({'passed':sum(r['status']=='passed' for r in RESULTS),'failed':sum(r['status']=='failed' for r in RESULTS),'nodes':len(NODES),'edges':len(EDGES),'page_errors':len(ERRORS)},ensure_ascii=False))
 raise SystemExit(1 if any(r['status']=='failed' for r in RESULTS) else 0)
