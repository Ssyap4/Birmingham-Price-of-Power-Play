"""Regressions for the three scoped case fixes, using real browser story actions."""
import json
import run_tests as q
from playwright.sync_api import sync_playwright

MINIMAL=['widow','canal','unlock','warehouse','reed','reedProof','confession','pump','confront','pressure']

def fallback(browser,hero):
 g=q.game(browser,hero);g.path(MINIMAL);before=g.state()
 # Neither best ending is available and no financial pair can be made here.
 for target in ['endingTruth','endingPower']:
  label=next(c[0] for c in q.SCENES['pressure']['choices'] if c[1]==target)
  assert g.p.locator('#caseChoices button').filter(has_text=label).is_disabled()
 assert before['items']==['key','ledger','testimony']
 exits=[c for c in q.SCENES['pressure']['choices'] if c[1]=='endingRescue']
 assert exits,'pressure must have an unconditional, narratively consistent rescue exit'
 g.go('endingRescue');assert g.state()['ending']=='endingRescue'
 assert g.state()['health']==before['health'] and g.state()['items']==before['items']
 return {'hero':hero,'ending':'endingRescue'}

def immediate_ending(browser,scene,ending):
 g=q.game(browser);q.full(g);g.path(['confront',scene]);before=g.state()
 label=next(c[0] for c in q.SCENES[scene]['choices'] if c[1]==ending)
 assert g.p.locator('#caseChoices button').filter(has_text=label).is_disabled()
 g.combine('ash','ledger')
 assert g.state()==before,'deduction refresh must not change the investigation save'
 assert g.p.locator('#caseChoices button').filter(has_text=label).is_enabled()
 g.go(ending);assert g.state()['node']==ending


def repeated_deduction(browser):
 g=q.game(browser);q.full(g);g.path(['confront']);before=g.state()
 g.p.evaluate("window.__findingEvents=[];document.addEventListener('birmingham:case-findings-changed',e=>window.__findingEvents.push(e.detail))")
 g.combine('receipt','ledger');assert g.p.locator('.v20-interrogate').count()==1
 metadata=g.meta();g.combine('receipt','ledger')
 assert g.meta()==metadata and g.state()==before
 assert g.p.locator('.v20-interrogate').count()==1
 assert g.p.evaluate('window.__findingEvents.length')==1,'repeat pair must not re-emit a new discovery'
 g.p.locator('.v20-interrogate').click();g.p.locator('.v18-close').click()
 g.combine('receipt','ledger');assert g.p.locator('.v20-interrogate').count()==0


def other_attempt_event(browser):
 g=q.game(browser);q.full(g);g.path(['confront','expose']);before=g.state()
 g.p.evaluate("""([started])=>{
  window.__choiceMutations=0;
  new MutationObserver(()=>window.__choiceMutations++).observe(document.getElementById('caseChoices'),{childList:true});
  document.dispatchEvent(new CustomEvent('birmingham:case-findings-changed',{detail:{heroId:'finn',started}}));
  document.dispatchEvent(new CustomEvent('birmingham:case-findings-changed',{detail:{heroId:'jack',started:started-1}}));
 }""",[before['started']])
 assert g.p.evaluate('window.__choiceMutations')==0
 assert g.state()==before


def long_cycle(browser):
 g=q.game(browser,roll=0);g.path(q.FULL[:-1]+['warn','office']);before=g.state()
 for _ in range(45):g.path(['widow','office'])
 assert len(g.state()['trail'])==80
 assert 'searchOffice' not in g.state()['trail'] and 'interview' not in g.state()['trail']
 assert g.p.locator('#caseChoices button').filter(has_text='Осмотреть следы в задней комнате').count()==0
 g.go('widow');assert g.p.locator('#caseChoices button').filter(has_text='Подробно расспросить Эвелин').count()==0
 assert g.state()['medicalKits']==before['medicalKits'],'repeat supply event'
 g.go('canal');assert g.p.locator('#caseChoices button').filter(has_text='Подслушать разговоры').count()==0
 g.go('sneak');assert g.state()['health']==before['health'],'repeat danger event'
 assert g.state()['items']==before['items'],'repeat evidence grant'
 assert g.state()['riskSeen']==before['riskSeen']
 return {'cyclic_transitions':90,'trail_length':80,'health':g.state()['health']}


def envelope_cycle(browser):
 g=q.game(browser);g.path(['envelope','widow','office'])
 for _ in range(45):g.path(['widow','office'])
 assert 'envelope' not in g.state()['trail']
 g.path(['widow','interview'])
 assert g.p.locator('#caseChoices button').filter(has_text='Попросить показать последнее письмо').count()==0


def new_attempt(browser):
 g=q.game(browser);g.path(['widow','office','searchOffice','office'])
 g.p.mouse.move(0,0);g.p.wait_for_function("!document.querySelector('#caseHealthToasts .case-health-toast')",timeout=18000)
 g.p.once('dialog',lambda d:d.accept());g.p.locator('#caseRestart').click()
 g.path(['widow','office'])
 assert g.p.locator('#caseChoices button').filter(has_text='Осмотреть следы в задней комнате').is_enabled()
 g.go('searchOffice');assert g.state()['items'].count('ash')==1

with sync_playwright() as p:
 b=q.launch_browser(p)
 for hero in q.HEROES:q.test('regression/pressure/'+hero,lambda h=hero:fallback(b,h))
 for scene in ['expose','pressure']:
  for ending in ['endingTruth','endingPower']:q.test(f'regression/immediate/{scene}/{ending}',lambda s=scene,e=ending:immediate_ending(b,s,e))
 q.test('regression/deduction_idempotence',lambda:repeated_deduction(b))
 q.test('regression/event_attempt_scope',lambda:other_attempt_event(b))
 q.test('regression/long_cycle_scenes_and_events',lambda:long_cycle(b))
 q.test('regression/envelope_after_90_transitions',lambda:envelope_cycle(b))
 q.test('regression/new_attempt_one_time_reset',lambda:new_attempt(b))
 b.close()
q.server.shutdown()
(q.OUT/'regression-results.json').write_text(json.dumps({'results':q.RESULTS,'page_errors':q.ERRORS,'http_errors':sorted(q.RESOURCES)},ensure_ascii=False,indent=2))
print('Passed',sum(r['status']=='passed' for r in q.RESULTS),'Failed',sum(r['status']=='failed' for r in q.RESULTS))
raise SystemExit(1 if any(r['status']=='failed' for r in q.RESULTS) else 0)
