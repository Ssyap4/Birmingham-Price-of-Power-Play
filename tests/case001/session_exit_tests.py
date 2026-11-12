"""Session exit must only discard the active hero's unfinished attempt."""
import json
import run_tests as q
from playwright.sync_api import sync_playwright

def keys(g):
 return g.p.evaluate('Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))')

def active_exit_keeps_other_hero(browser,hero):
 other='finn' if hero=='jack' else 'jack'
 g=q.game(browser,hero);g.path(['envelope','widow']);g.combine('key','envelope')
 own=g.state();ownmeta=g.meta()
 g.p.evaluate('([k,v])=>localStorage.setItem(k,JSON.stringify(v))',[q.BASE+other,{'node':'office','items':['note'],'flags':{},'trail':['intro'],'started':123,'health':75,'medicalKits':0}])
 other_save=g.p.evaluate('(k)=>localStorage.getItem(k)',q.BASE+other)
 g.p.once('dialog',lambda d:d.accept());g.p.locator('#gameExitBtn').click()
 assert g.p.locator('#home').is_visible() and g.p.evaluate('(k)=>localStorage.getItem(k)',q.BASE+hero) is None
 assert g.p.evaluate('(k)=>localStorage.getItem(k)',q.BASE+other)==other_save
 assert g.p.evaluate('(k)=>localStorage.getItem(k)',q.META+hero) is None
 return {'active_hero':hero,'other_hero_preserved':True,'own_findings_removed':ownmeta is not None}

def menu_exit_preserves(browser):
 g=q.game(browser);g.path(['envelope','widow']);state=g.state()
 settle_state=state
 g.p.locator('#caseBack').click();saved=g.p.evaluate('(k)=>localStorage.getItem(k)',q.BASE+'jack')
 prompts=[]
 g.p.once('dialog',lambda d:(prompts.append(d.message),d.accept()))
 g.p.locator('#gameExitBtn').click()
 assert prompts and 'останутся' in prompts[0],prompts
 assert g.p.evaluate('(k)=>localStorage.getItem(k)',q.BASE+'jack')==saved
 assert g.p.locator('#home').is_visible()
 return {'menu_save_preserved':True,'node':settle_state['node']}

def completed_report_exit_preserves(browser):
 g=q.game(browser);g.path(['envelope','canal','bribe','pump','confront','endingDeal']);before=g.state()
 assert before['ending']=='endingDeal'
 g.p.once('dialog',lambda d:d.accept());g.p.locator('#gameExitBtn').click()
 assert g.p.evaluate('(k)=>JSON.parse(localStorage.getItem(k))',q.BASE+'jack')==before
 return {'completed_ending_preserved':before['ending']}

def cancelled_exit_preserves(browser):
 g=q.game(browser);g.path(['envelope','widow']);before=g.state();all_before=keys(g)
 g.p.once('dialog',lambda d:d.dismiss());g.p.locator('#gameExitBtn').click()
 assert g.state()==before and keys(g)==all_before and g.p.locator('#caseGame').is_visible()
 return {'cancel_preserved_all_storage':True,'node':before['node']}

def settle(browser):
 with sync_playwright() as p:
  b=q.launch_browser(p)
  q.test('session_exit/active_jack_keeps_finn',lambda:active_exit_keeps_other_hero(b,'jack'))
  q.test('session_exit/active_finn_keeps_jack',lambda:active_exit_keeps_other_hero(b,'finn'))
  q.test('session_exit/from_menu_preserves_save',lambda:menu_exit_preserves(b))
  q.test('session_exit/completed_report_preserved',lambda:completed_report_exit_preserves(b))
  q.test('session_exit/cancel_preserves_everything',lambda:cancelled_exit_preserves(b))
  b.close()
 q.server.shutdown()
 (q.OUT/'session-exit-results.json').write_text(json.dumps({'results':q.RESULTS,'page_errors':q.ERRORS,'http_errors':sorted(q.RESOURCES)},ensure_ascii=False,indent=2))
 print('Passed',sum(r['status']=='passed' for r in q.RESULTS),'Failed',sum(r['status']=='failed' for r in q.RESULTS))
 raise SystemExit(1 if any(r['status']=='failed' for r in q.RESULTS) else 0)

if __name__=='__main__':settle(None)
