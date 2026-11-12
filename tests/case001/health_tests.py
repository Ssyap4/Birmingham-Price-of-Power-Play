import json
import run_tests as q
from playwright.sync_api import sync_playwright

def severity(browser):
 g=q.game(browser,roll=0);g.path(['widow','canal','sneak'])
 for path,hp,label in [([],75,'ЛЁГКОЕ РАНЕНИЕ'),(['warehouse','pump','yard'],45,'СЕРЬЁЗНОЕ РАНЕНИЕ'),(['rescue'],10,'КРИТИЧЕСКОЕ СОСТОЯНИЕ')]:
  g.path(path);assert g.state()['health']==hp;assert label in g.p.locator('#caseHealthStatus').inner_text()
 g.p.locator('#caseChoices button').filter(has_text='Использовать перевязочный пакет').click();assert g.state()['health']==35
 g.p.locator('#caseChoices button').filter(has_text='Использовать перевязочный пакет').click();assert g.state()['health']==60
 assert g.state()['medicalKits']==0;assert g.p.locator('#caseChoices button').filter(has_text='Использовать перевязочный пакет').count()==0
 return {'health_sequence':[100,75,45,10,35,60],'kits_remaining':0}

def penalty(browser,level):
 g=q.game(browser,roll=0);g.path(['envelope','canal','sneak','warehouse','pump'])
 if level=='light':
  g.p.evaluate('window.__qaRoll=.34');before=g.state()['health'];g.go('yard');expected=30
 elif level=='serious':
  g.go('yard');g.p.evaluate('window.__qaRoll=.30');before=g.state()['health'];g.go('rescue');expected=35
 else:
  g.path(['yard','rescue','confront']);g.p.evaluate('window.__qaRoll=.45');before=g.state()['health'];g.go('yard');expected=10 # lethal damage clamped at zero
 assert before-g.state()['health']==expected,(level,before,g.state())
 return {'before':before,'after':g.state()['health']}

def reputation(browser):
 g=q.game(browser);g.path(['widow','canal','bribe','pump','confront','endingDeal'])
 # Capture actual persistence: no invented account-level reputation contract.
 data=g.p.evaluate('Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))')
 assert 'Репутация +1' in g.p.locator('#caseOutcome').inner_text()
 return {'persistent_keys':list(data),'case_fields':list(g.state()),'note':'Reputation is an ending label; no accumulated reputation account exists in current implementation.'}

with sync_playwright() as p:
 b=q.launch_browser(p)
 q.test('health/severity_and_exhaustion',lambda:severity(b))
 for level in ['light','serious','critical']:q.test('health/risk_penalty/'+level,lambda l=level:penalty(b,l))
 q.test('reward/reputation_storage',lambda:reputation(b));b.close()
q.server.shutdown()
(q.OUT/__import__('os').environ.get('CASE001_QA_OUTPUT','health-results.json')).write_text(json.dumps({'results':q.RESULTS,'page_errors':q.ERRORS,'http_errors':sorted(q.RESOURCES)},ensure_ascii=False,indent=2))
raise SystemExit(1 if any(r['status']=='failed' for r in q.RESULTS) else 0)
