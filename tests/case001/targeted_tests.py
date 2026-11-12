"""Additional independent semantic expectations, rather than just graph consistency."""
import run_tests as q
import json, contextlib
from playwright.sync_api import sync_playwright

def retreat(browser):
 g=q.game(browser,roll=0);g.path(['widow','canal','bribe','pump','confront'])
 text=g.p.locator('#caseChoices button').filter(has_text='Отступить').inner_text()
 before=g.state()['health'];g.go('yard');damage=before-g.state()['health']
 assert f'−{damage} HP' in text,{'choice_text':text,'actual_damage':damage}

def trade(browser):
 g=q.game(browser);g.path(['widow','canal','unlock','pump','trade'])
 assert 'ledger' not in g.state()['items'],'Крейн забирает ведомость, but ledger remains usable in inventory'

def no_evidence_deadend(browser):
 g=q.game(browser);g.path(['widow','canal','unlock','warehouse','reed','reedProof','confession','pump','confront','pressure'])
 enabled=g.p.locator('#caseChoices button:enabled').all_text_contents()
 assert enabled,{'node':g.state()['node'],'items':g.state()['items'],'choices':g.p.locator('#caseChoices').inner_text()}

def basic_gate(browser):
 g=q.game(browser);g.path(['envelope','canal'])
 b=g.p.locator('#caseChoices button').filter(has_text='Открыть дверь ключом');assert b.is_disabled()
 g.path(['reed']);assert g.p.locator('#caseChoices button').filter(has_text='Показать ему найденную ведомость').is_disabled()
 return {'missing_key':'blocked','missing_ledger':'blocked'}

def reactions(browser,who):
 g=q.game(browser)
 if who=='reed':
  g.path(['envelope','widow','office','canal','listen','sneak','warehouse','reed','reedProof','confession','warn','office','reed']);a,b='testimony','overheard'
 elif who=='evelyn':
  g.path(['widow','interview','office','canal','bribe','warehouse','warn']);a,b='note','witness'
 else:
  q.full(g);g.path(['confront']);a,b='receipt','ledger'
 g.combine(a,b)
 assert g.p.locator('.v20-interrogate').count()==1,'New deduction does not reveal contextual question without a scene rerender'
 g.p.locator('.v20-interrogate').click();assert g.p.locator('.case-v18-overlay').is_visible()
 g.p.locator('.v18-close').click();assert g.p.locator('.v20-interrogate').count()==0

def reaction_precomputed(browser,who):
 g=q.game(browser)
 if who=='evelyn':
  g.path(['widow','interview','office','canal','bribe','warehouse','warn','office']);g.combine('note','witness');g.go('widow');g.go('canal');g.go('bribe');g.go('warehouse');g.go('warn')
 elif who=='reed':
  g.path(['envelope','widow','office','canal','listen','sneak','warehouse','reed','reedProof','confession','warn','office']);g.combine('testimony','overheard');g.go('reed')
 g.p.locator('.v20-interrogate').click();assert g.p.locator('.case-v18-overlay').is_visible();g.p.locator('.v18-close').click()
 assert g.p.locator('.v20-interrogate').count()==0
 # Enter the same scene again and verify no duplicate reaction.
 if who=='evelyn':g.path(['office','canal','bribe','warehouse','warn'])
 else:g.path(['canal','reed'])
 assert g.p.locator('.v20-interrogate').count()==0
 assert len(g.meta()['reactions'])==1
 return {'reaction_count':1}

def one_time(browser):
 g=q.game(browser);g.path(['envelope','widow','interview'])
 assert g.p.locator('#caseChoices button').filter(has_text='Попросить показать последнее письмо').count()==0
 g.path(['office','searchOffice','office'])
 assert g.p.locator('#caseChoices button').filter(has_text='Осмотреть следы в задней комнате').count()==0
 return {'ordinary_one_time_visits':'hidden'}

def long_history(browser):
 g=q.game(browser);g.path(['widow','interview','office','searchOffice','office'])
 for _ in range(41):g.path(['widow','office'])
 assert g.p.locator('#caseChoices button').filter(has_text='Осмотреть следы в задней комнате').count()==0,'One-time scene reappears after trail truncates at 80 entries'

def death_rules(browser):
 g=q.game(browser,'jack',0);g.path(['widow','canal','sneak','warehouse','pump','yard','rescue','endingEvidence'])
 assert g.state()['health']==0 and g.state()['node']=='endingDeath'
 assert g.p.locator('#caseChoices button').count()==1
 assert 'Использовать' not in g.p.locator('#caseChoices').inner_text()
 assert g.p.locator('.v33-ending-report').count()==1,'Death ending has no dedicated final report unlike other five endings'

def hero_actions(browser):
 labels={}
 for hero in q.HEROES:
  g=q.game(browser,hero);g.path(['widow','canal'])
  labels[hero]=g.p.locator('#caseChoices button').all_text_contents()
  g.ctx.close();q.G=None
 assert len({tuple(x) for x in labels.values()})==5,'All five heroes have identical canal actions; unique abilities/gear actions are not implemented'

def drag(browser):
 g=q.game(browser);g.path(['envelope','widow']);g.p.locator('.v34-open-inventory').click()
 a=g.p.locator('.v33-tile[data-id="key"]');b=g.p.locator('.v33-tile[data-id="envelope"]');a.scroll_into_view_if_needed();b.scroll_into_view_if_needed()
 aa=a.bounding_box();bb=b.bounding_box();g.p.mouse.move(aa['x']+aa['width']/2,aa['y']+aa['height']/2);g.p.mouse.down();g.p.mouse.move(bb['x']+bb['width']/2,bb['y']+bb['height']/2,steps=15);g.p.mouse.up()
 assert g.p.locator('.v33-result-layer').is_visible();assert len(g.meta()['deductions'])==1

def restart_end(browser):
 g=q.game(browser);g.path(['envelope','canal','bribe','pump','confront','endingDeal']);old=g.state()
 g.p.once('dialog',lambda d:d.accept());g.p.locator('#caseChoices button').click()
 s=g.state();assert s['node']=='intro' and s['ending'] is None and s['items']==[]
 assert g.p.locator('.v33-ending-report').count()==0
 return {'started_changed':s['started']!=old['started']}

with sync_playwright() as p:
 browser=q.launch_browser(p)
 for name,fn in [('retreat_label',retreat),('trade_consumption',trade),('pressure_deadend',no_evidence_deadend),('requirement_gates',basic_gate),('one_time',one_time),('long_history',long_history),('death_report',death_rules),('hero_unique_actions',hero_actions),('inventory_drag',drag),('restart_from_ending',restart_end)]:q.test('semantic/'+name,lambda f=fn:f(browser))
 for who in ['evelyn','reed','crane']:q.test('reaction_refresh/'+who,lambda who=who:reactions(browser,who))
 for who in ['evelyn','reed']:q.test('reaction_once/'+who,lambda who=who:reaction_precomputed(browser,who))
 for h,t,r,e in [('jack','rescue',.25,0),('finn','sneak',.2,0),('eleanor','sneak',.28,0),('victor','rescue',.32,0),('samuel','yard',.2,0),('jack','sneak',.2,25),('jack','yard',.2,30),('jack','endingEvidence',.32,0),('finn','yard',.25,0)]:q.test(f'isolated_risk/{h}/{t}/{r}',lambda h=h,t=t,r=r,e=e:q.risk_bonus(browser,h,t,r,e))
 browser.close()
q.server.shutdown()
(q.OUT/__import__('os').environ.get('CASE001_QA_OUTPUT','targeted-results.json')).write_text(json.dumps({'results':q.RESULTS,'page_errors':q.ERRORS,'http_errors':sorted(q.RESOURCES)},ensure_ascii=False,indent=2))
print('Passed',sum(x['status']=='passed' for x in q.RESULTS),'Failed',sum(x['status']=='failed' for x in q.RESULTS))
raise SystemExit(1 if any(x['status']=='failed' for x in q.RESULTS) else 0)
