"""V103: full collection replay, read-only archive, profile and damage isolation."""
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
OUT=ROOT/'work/criminal/v103';OUT.mkdir(parents=True,exist_ok=True)
DOC=ROOT/'docs/criminal-operations'
FINALS=['clean','costly','failed','dead']
plans=[]
for mid,m in json.loads((DOC/'v2-evidence/routes.json').read_text(encoding='utf-8'))['missions'].items():
 for end in FINALS:
  r=m['terminalProofs'][end];plans.append(dict(mid=mid,end=end,seed=r['seed'],path=[x['choiceId'] for x in r['path']]))
for end in FINALS:plans.append(dict(mid='CR06',end=end,seed=None,path=CR06[end]))
for i in range(7,11):
 mid=f'CR{i:02}'
 for r in json.loads((DOC/f'{mid}-MOBILE-ROUTES.json').read_text(encoding='utf-8'))[:4]:
  plans.append(dict(mid=mid,end=r['end'],seed=r['seed'],path=r['path']))
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
    page.route('https://**/*',lambda r:r.abort())
    page.goto(origin+'/index.html',wait_until='load')
    def tap(s):
     e=page.locator(s).first;e.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})");e.tap()
    def fit():assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    def snap(name,sel):
     page.locator(sel).first.evaluate("e=>e.scrollIntoView({block:'start',behavior:'instant'})")
     page.wait_for_timeout(250);page.screenshot(path=str(OUT/f'{engine}-{width}-{name}.png'),animations='disabled')
    def saved():return page.evaluate("JSON.stringify(Object.entries(localStorage).filter(([k])=>k.startsWith('birmingham_')).sort())")
    def ledger():return page.evaluate("localStorage.getItem('birmingham_criminal_v2_ledger')")
    tap('#criminalEntry');tap('.cr-top [data-action=chronicle]')
    assert page.locator('.cr-archive-overview strong').all_inner_texts()==['0','0/40','0']
    assert page.locator('.cr-collection-fold').count()==10 and page.locator('.cr-record').count()==0
    assert ledger() is None
    tap('[data-action=commonArchive]')
    assert page.locator('#campaignCriminalAchievements .campaign-criminal-seal.earned').count()==0
    assert page.locator('#campaignCriminalAchievements .campaign-criminal-seal').count()==40
    assert all('не открыт' in x for x in page.locator('#campaignCriminalAchievements .campaign-criminal-seal').all_text_contents()), page.locator('#campaignCriminalAchievements .campaign-criminal-seal').all_text_contents()
    assert ledger() is None
    tap('#homeBtn');tap('#criminalEntry')
    fixture=page.evaluate("""plans=>{const E=CriminalEngine,A=CriminalArchive;const proofs=[];for(const [i,r] of plans.entries()){let s=null;for(let seed=r.seed??0;seed<=(r.seed??499);seed++){try{let t=E.create(r.mid,seed,'v103_'+i+'_fixture',1);for(const id of r.path)t=E.choose(t,id,t.revision);if(t.terminalId===r.end){s=t;break}}catch(e){if(r.seed!==null)throw e}}if(!s)throw Error('Missing proof '+r.mid+' '+r.end);if(!A.save(localStorage,s).ok||!A.recover(localStorage,s).ok)throw Error('Cannot archive '+r.mid);proofs.push(s)}const r=plans[0];let s=E.create(r.mid,r.seed,'v103_repeat_fixture',2);for(const id of r.path)s=E.choose(s,id,s.revision);if(!A.save(localStorage,s).ok||!A.recover(localStorage,s).ok)throw Error('repeat');A.save(localStorage,E.create('CR10',0,'v103_active_fixture',3));return {total:proofs.length+1,unique:new Set(proofs.map(s=>s.missionId+':'+s.terminalId)).size}}""",plans)
    assert fixture=={'total':41,'unique':40},fixture
    base=saved()
    tap('.cr-top [data-action=chronicle]')
    assert page.locator('.cr-archive-overview strong').all_inner_texts()==['41','40/40','20']
    assert page.locator('.cr-record').count()==10
    assert page.locator('.cr-record-seal').first.inner_text().startswith('Повторный')
    assert page.locator('.cr-collection-fold[open]').count()==0
    snap('overview','.cr-archive-overview')
    for i in range(4):tap('[data-action=archiveNext]')
    assert page.locator('.cr-record').count()==1 and page.locator('[data-action=archiveNext]').is_disabled()
    tap('[data-archive-mission=CR10]')
    assert page.locator('.cr-record').count()==4
    assert page.locator('.cr-collection-fold').count()==1
    assert page.locator('.cr-collection-fold[open] .cr-awards article').count()==4
    assert page.locator('.cr-memory-fold summary').inner_text().endswith('2')
    assert page.locator('[data-archive-mission=CR10]').evaluate('e=>document.activeElement===e')
    tap('.cr-record-body summary')
    assert page.locator('.cr-record-body[open]').count()==1
    snap('filtered','.cr-archive-count');snap('collection','.cr-collection-fold')
    tap('[data-archive-mission=all]')
    assert page.locator('.cr-record').count()==10 and saved()==base
    tap('[data-action=commonArchive]')
    section=page.locator('#campaignCriminalAchievements')
    assert section.locator('.campaign-criminal-fold[data-archive-fold^="criminal:reward:"]').count()==10
    assert '40 / 40' in section.locator('.campaign-criminal-intro').inner_text()
    assert section.locator('.campaign-criminal-seal.earned').count()==40
    tap('[data-archive-fold="criminal:reward:CR10"] summary')
    snap('common','#campaignCriminalAchievements [data-archive-fold="criminal:reward:CR10"]')
    tap('#campaignAchievements [data-open-section=campaignHistory]')
    assert page.locator('#campaignCriminalHistory .campaign-criminal-attempt').count()==8
    assert 'Повторный исход' in page.locator('#campaignCriminalHistory .campaign-criminal-attempt').first.inner_text()
    tap('#campaignHistory [data-open-section=campaignDossiers]')
    assert page.locator('#campaignCriminalDossiers .campaign-criminal-mission-title').count()==10
    tap('#homeBtn');tap('#cabinetProfile')
    profile=page.locator('#playerCampaignOverview .player-overview-card').last
    assert profile.locator('.player-overview-completion strong').inner_text()=='41'
    assert profile.locator('progress').get_attribute('max')=='40'
    assert profile.locator('progress').get_attribute('value')=='40'
    assert profile.locator('.player-overview-live').get_attribute('data-active')=='1'
    snap('profile','#playerCampaignOverview')
    fit();assert saved()==base
    page.evaluate("localStorage.setItem('birmingham_criminal_v2_ledger','{broken');window.dispatchEvent(new StorageEvent('storage',{key:'birmingham_criminal_v2_ledger'}))")
    assert profile.get_attribute('data-status')=='damaged'
    assert profile.locator('progress').count()==0
    tap('#profile .campaign-profile-links [data-open-section=campaignAchievements]')
    assert page.locator('#campaignCriminalAchievements .campaign-criminal-alert').is_visible()
    assert page.locator('#campaignCriminalAchievements .earned').count()==0
    assert ledger()=='{broken'
    fit();assert not errors,errors
    results.append([engine,width,fixture])
    print(engine,width,'PASS 41 attempts / 40 unique / filter / pagination / collection / profile / damage',flush=True)
    c.close();b.close()
 finally:server.shutdown()
 (OUT/'results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
if __name__=='__main__':run()

