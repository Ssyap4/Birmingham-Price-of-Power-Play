"""Issue #3 acceptance tests: saves, handover, death reports and hero actions."""
import json
import run_tests as q
from playwright.sync_api import sync_playwright

ACTIONS={
 'jack':('heroJack','jackGuardDistracted','receipt',['warehouse','pump','yard','rescue','endingRescue']),
 'finn':('heroFinn','finnLockOpened','ledger',['warehouse','pump','yard','rescue','endingRescue']),
 'eleanor':('heroEleanor','eleanorPhotoTaken','invoice',['reed','pretend','pump','yard','rescue','endingRescue']),
 'victor':('heroVictor','victorCoverUsed','route',['pump','yard','rescue','endingRescue']),
 'samuel':('heroSamuel','samuelServiceOpened',None,['yard','rescue','endingRescue']),
}

def settle(g):
 g.p.mouse.move(0,0)
 g.p.wait_for_function("!document.querySelector('#caseHealthToasts .case-health-toast')",timeout=18000)

def resume(browser,hero,mode):
 g=q.game(browser,hero,0)
 g.path(['envelope','widow','canal',ACTIONS[hero][0],'canal','sneak'])
 g.combine('key','envelope')
 g.p.locator('#caseChoices button').filter(has_text='Использовать перевязочный пакет').click()
 before=g.state();findings=g.meta()
 assert before['health'] in (90,100) and before['flags'][ACTIONS[hero][1]]
 if mode=='reload':
  g.p.reload(wait_until='domcontentloaded')
  assert g.state()==before
  g.p.locator('#districtsCard').click()
 else:
  settle(g);g.p.locator('#caseBack').click()
 g.launch()
 assert g.state()==before and g.meta()==findings
 assert str(before['health'])+' / 100 HP' in g.p.locator('#caseHealthStatus').inner_text()
 g.path(['reed','canal'])
 assert g.p.locator('#caseChoices [data-hero-action]').count()==0
 return {'hero':hero,'mode':mode,'node_restored':before['node'],'health':before['health'],'deductions_preserved':len(findings['deductions'])}

def new_attempt(browser):
 g=q.game(browser);g.path(['envelope','widow']);g.combine('key','envelope')
 before=g.state();settle(g);g.p.locator('#caseBack').click();g.p.locator('#launchFirstCase').click()
 assert 'ПРОДОЛЖИТЬ' in g.p.locator('.hero-begin').inner_text()
 assert g.p.locator('.hero-new').is_visible()
 g.p.once('dialog',lambda d:d.dismiss());g.p.locator('.hero-new').click()
 assert g.state()==before and g.p.locator('#heroSelection').is_visible()
 g.p.once('dialog',lambda d:d.accept());g.p.locator('.hero-new').click()
 s=g.state();assert s['node']=='intro' and s['items']==[] and s['flags']=={} and s['trail']==[]
 assert s['started']!=before['started'] and s['health']==100 and s['medicalKits']==1
 g.p.locator('.v34-open-inventory').click();assert '0 / 6' in g.p.locator('.v33-stats').inner_text()


def switch_heroes(browser):
 g=q.game(browser);g.path(['envelope','widow','office']);jack=g.state()
 settle(g);g.p.locator('#caseBack').click();g.hero='finn';g.launch()
 g.path(['widow','canal','heroFinn']);finn=g.state()
 settle(g);g.p.locator('#caseBack').click();g.hero='jack';g.launch()
 assert g.state()==jack
 assert g.p.evaluate('(key)=>JSON.parse(localStorage.getItem(key))',q.BASE+'finn')==finn
 # Changing hero within the case must also preserve the active attempt before selection.
 g.p.locator('#caseChangeHero').evaluate("el=>el.scrollIntoView({block:'center'})")
 g.p.once('dialog',lambda d:d.accept());g.p.locator('#caseChangeHero').click()
 assert g.state()==jack
 g.p.locator('.hero-close').click();assert g.state()==jack


def invalid_save(browser,kind):
 # Boundary fixture only: corrupted storage is not injected in ordinary story tests.
 g=q.game(browser);g.path(['envelope']);g.p.locator('#caseBack').click()
 raw='{' if kind=='json' else json.dumps({'node':'intro','items':[],'flags':[],'trail':[]})
 g.p.evaluate('([key,value])=>localStorage.setItem(key,value)',[q.BASE+'jack',raw])
 g.p.locator('#launchFirstCase').click()
 assert 'НАЧАТЬ' in g.p.locator('.hero-begin').inner_text()
 g.p.locator('.hero-begin').click()
 assert g.state()['node']=='intro' and g.state()['items']==[]


def trade(browser,mode):
 g=q.game(browser);q.full(g);g.combine('receipt','ledger');findings=g.meta()
 g.go('trade');before=g.state()
 assert before['flags']['traded'] and 'ledger' not in before['items']
 assert g.p.locator('#caseInventory [data-evidence-id="ledger"]').count()==0
 g.p.locator('.v34-open-inventory').click()
 assert g.p.locator('.v33-tile[data-id="ledger"]').count()==0
 assert len(g.meta()['deductions'])==1 and g.meta()==findings
 g.p.locator('.v33-close').click()
 if mode=='reload':g.p.reload(wait_until='domcontentloaded');g.p.locator('#districtsCard').click()
 else:settle(g);g.p.locator('#caseBack').click()
 g.launch();assert g.state()==before and 'ledger' not in g.state()['items']
 g.go('endingDeal');assert 'ledger' not in g.state()['items']



def legacy_trade(browser):
 # Boundary fixture: reproduce the old version's handed-over but still carried ledger.
 g=q.game(browser);q.full(g);g.go('trade');old=g.state();old['items'].append('ledger')
 g.p.evaluate('([key,s])=>localStorage.setItem(key,JSON.stringify(s))',[q.BASE+'jack',old])
 g.p.reload(wait_until='domcontentloaded');g.p.locator('#districtsCard').click();g.p.locator('#launchFirstCase').click();g.p.locator('.hero-begin').click()
 assert g.state()['node']=='trade' and g.state()['flags']['traded']
 assert 'ledger' not in g.state()['items']
 for key in old:
  if key!='items':assert g.state()[key]==old[key]


def death_report(browser,hero):
 g=q.game(browser,hero,0);g.path(['envelope','canal','sneak','warehouse','pump','yard','rescue','endingEvidence'])
 before=g.state();assert before['node']=='endingDeath' and before['health']==0
 report=g.p.locator('.v33-ending-report');assert report.is_visible()
 name=g.p.evaluate('BirminghamHero.heroes.find(h=>h.id===BirminghamHero.selectedId).name')
 text=report.inner_text()
 for value in [name,'0 / 100 HP',before['deathCause'],'УЛИК НАЙДЕНО','СВЯЗЕЙ УСТАНОВЛЕНО']:assert value in text
 assert g.p.locator('#caseChoices button').count()==1
 g.p.reload(wait_until='domcontentloaded');g.p.locator('#districtsCard').click()
 g.p.locator('#launchFirstCase').click();g.p.locator('.hero-card').nth(q.HEROES.index(hero)).click();assert 'ОТКРЫТЬ ОТЧЁТ' in g.p.locator('.hero-begin').inner_text()
 g.p.locator('.hero-begin').click()
 assert g.state()==before,{'before':before,'after':g.state()}
 assert report.is_visible()
 assert name in report.inner_text(),report.inner_text()
 return {'hero':hero,'cause':before['deathCause'],'report_restored':True}


def hero_action(browser,hero):
 target,flag,item,path=ACTIONS[hero]
 g=q.game(browser,hero);g.path(['envelope','canal']);before=g.state()
 actions=g.p.locator('#caseChoices [data-hero-action]')
 assert actions.count()==1 and actions.get_attribute('data-hero-action')==target
 assert g.p.locator('#caseChoices button').filter(has_text='Открыть дверь ключом').is_disabled()
 g.go(target);s=g.state();assert s['flags'][flag] is True
 if item:assert item in s['items'] and item not in before['items']
 else:assert s['items']==before['items']
 assert s['health']==before['health'] and s['medicalKits']==before['medicalKits'] and s['riskSeen']==before['riskSeen']
 assert g.meta() is None,'hero actions must not fabricate deductions'
 g.path(path);assert g.state()['ending']=='endingRescue'
 return {'hero':hero,'action':target,'clue':item,'ending':'endingRescue'}


def long_cycle(browser):
 g=q.game(browser);g.path(['widow','canal','heroJack','canal']);before=g.state()
 for _ in range(45):g.path(['reed','canal'])
 assert len(g.state()['trail'])==80 and 'heroJack' not in g.state()['trail']
 assert g.p.locator('#caseChoices [data-hero-action]').count()==0
 assert g.state()['items']==before['items'] and g.state()['health']==before['health']
 assert g.state()['flags']['jackGuardDistracted']


def completed_new_run(browser):
 g=q.game(browser);g.path(['envelope','canal','bribe','pump','confront','endingDeal']);before=g.state()
 settle(g);g.p.locator('#caseBack').click();g.p.locator('#launchFirstCase').click()
 assert 'ОТКРЫТЬ ОТЧЁТ' in g.p.locator('.hero-begin').inner_text()
 g.p.once('dialog',lambda d:d.accept());g.p.locator('.hero-new').click()
 assert g.state()['node']=='intro' and g.state()['ending'] is None and g.state()['started']!=before['started']
 assert g.p.locator('.v33-ending-report').count()==0

with sync_playwright() as p:
 b=q.launch_browser(p)
 for hero in q.HEROES:
  for mode in ['reload','map']:q.test(f'issue3/resume/{hero}/{mode}',lambda h=hero,m=mode:resume(b,h,m))
 q.test('issue3/new_attempt_explicit',lambda:new_attempt(b))
 q.test('issue3/hero_save_isolation',lambda:switch_heroes(b))
 for kind in ['json','shape']:q.test('issue3/invalid_save/'+kind,lambda k=kind:invalid_save(b,k))
 for mode in ['reload','map']:q.test('issue3/trade/'+mode,lambda m=mode:trade(b,m))
 q.test('issue3/legacy_trade_save',lambda:legacy_trade(b))
 for hero in q.HEROES:
  q.test('issue3/death_report/'+hero,lambda h=hero:death_report(b,h))
  q.test('issue3/hero_action/'+hero,lambda h=hero:hero_action(b,h))
 q.test('issue3/hero_action_after_90_transitions',lambda:long_cycle(b))
 q.test('issue3/completed_case_new_run',lambda:completed_new_run(b));b.close()
q.server.shutdown()
(q.OUT/'issue3-results.json').write_text(json.dumps({'results':q.RESULTS,'page_errors':q.ERRORS,'http_errors':sorted(q.RESOURCES)},ensure_ascii=False,indent=2))
print('Passed',sum(r['status']=='passed' for r in q.RESULTS),'Failed',sum(r['status']=='failed' for r in q.RESULTS))
raise SystemExit(1 if any(r['status']=='failed' for r in q.RESULTS) else 0)
