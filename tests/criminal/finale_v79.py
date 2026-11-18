"""V79: targeted choices and final report acceptance, isolated browser fixtures."""
from pathlib import Path
from functools import partial
from threading import Thread
from http.server import SimpleHTTPRequestHandler
import json,subprocess
from local_http import LocalServer
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'work/criminal/v79';OUT.mkdir(parents=True,exist_ok=True)
ROUTE='P02 A01 A03 A06 A08 A10 B01 B02 B03 B04 B01 B05 B06 B07 B11 B12 B13 B14 C01 C02 C03 C04 C05 C06 C07 C08 C09 C10 D01 D07 D08 D09 D10 D11 E01 E02 E03 E08 E09 E10 E11 F01 F02 F03 F04 F05 F06 F08 F09 Z02'
BUILD_FIXTURE="""const assert=require('node:assert/strict');const {createEngine}=require('./src/case002/engine-v3.js');const graph=require('./docs/case002/case002-beat-graph-v1.json'),contract=require('./docs/case002/case002-contract-v1.json');const m=new Map(),store={getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)};const e=createEngine({graph,contract,hero:'jack',store,attemptId:'v79-qa',now:()=>1700000000000});for(const n of process.argv[1].split(' '))e.choose(n,'continue');assert.equal(e.snapshot().ending,'trainEscape');assert(e.snapshot().finished);console.log(JSON.stringify(Object.fromEntries(m)))"""
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def run():
    fixture=json.loads(subprocess.check_output(['node','-e',BUILD_FIXTURE,ROUTE],cwd=ROOT,text=True))
    server=LocalServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'campaign-unified-dist')))
    Thread(target=server.serve_forever,daemon=True).start()
    origin=f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            for engine in ('chromium','webkit'):
                browser=getattr(p,engine).launch()
                for width in (320,390):
                    for case,district in ((1,'small-heath'),(2,'digbeth')):
                        ctx=browser.new_context(viewport={'width':width,'height':844},is_mobile=True,has_touch=True)
                        page=ctx.new_page();page.set_default_timeout(12000)
                        errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
                        page.route('https://**/*',lambda r:r.abort())
                        page.goto(origin+'/index.html',wait_until='load')
                        def tap(s):
                            e=page.locator(s).first
                            e.evaluate("e=>e.scrollIntoView({block:'center',behavior:'instant'})")
                            e.tap()
                        def snap(n,s=None):
                            if s:page.locator(s).first.evaluate("e=>e.scrollIntoView({block:'start',behavior:'instant'})")
                            page.screenshot(path=str(OUT/f'{engine}-{width}-{case}-{n}-after.png'),animations='disabled')
                        def save(k):return page.evaluate("(k)=>localStorage.getItem(k)",k)
                        def fit():assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
                        tap('#districtsCard');tap(f'.map-pin[data-district="{district}"]')
                        if case==1:
                            tap('#launchFirstCase');tap('#heroSelection .hero-begin');tap('#case001Briefing .briefing-start')
                            key='birmingham_case_smol_heath_v1_jack'
                            page.evaluate("""k=>{const s=JSON.parse(localStorage.getItem(k));s.node='canal';s.riskSeen=[];localStorage.setItem(k,JSON.stringify(s));window.BirminghamCase.resume()}""",key)
                            raw=save(key);tap('#case001QuickNav [data-go=choices]')
                            risky=page.locator("#caseChoices [data-choice-target='sneak']")
                            assert risky.is_enabled() and risky.get_attribute('data-risk-kind')=='wound'
                            assert risky.evaluate("e=>getComputedStyle(e).borderLeftColor")=='rgb(211, 160, 92)'
                            assert save(key)==raw
                            page.evaluate("""k=>{const s=JSON.parse(localStorage.getItem(k));s.node='endingRescue';s.ending=s.node;localStorage.setItem(k,JSON.stringify(s));window.BirminghamCase.resume()}""",key)
                            page.wait_for_function("document.querySelector('.case001-finale-archive-note')?.dataset.status==='verified'")
                            raw=save(key)
                            tap('#case001QuickNav [data-go=choices]')
                            assert page.locator('.case001-finale-subtitle').inner_text().startswith('\u0413\u0435\u0440\u043e\u0439:')
                            tap('.case001-finale-materials summary')
                            assert page.locator('.case001-finale-materials').get_attribute('open') is not None
                            tap('.case001-finale-materials summary')
                            snap('report','.v33-ending-report');fit()
                            page.evaluate("""()=>{const key='birmingham_campaign_records_v1';localStorage.setItem(key,'{broken');window.dispatchEvent(new StorageEvent('storage',{key}));}""")
                            page.wait_for_function("document.querySelector('.case001-finale-archive-note')?.dataset.status==='damaged'")
                            assert save('birmingham_campaign_records_v1')=='{broken'
                            tap('.case001-finale-actions button:last-child')
                            assert page.locator('#districts').is_visible()
                            assert save(key)==raw
                        else:
                            tap('#launchSecondCase');page.wait_for_url('**/preview/case002-prototype/index.html?from=map')
                            tap('#briefContinue');tap('#begin');key='birmingham_case002_draft_v3_jack'
                            for target in ('P02','A01','A03','A05'):tap(f'button.choice[data-to="{target}"]')
                            raw=save(key)
                            tap('#quickNav [data-go=choices]')
                            pre=page.locator('#decisionPreflight')
                            assert pre.get_attribute('data-compact')=='true' and pre.get_attribute('data-available')=='1'
                            assert pre.locator('.decision-preflight-metric').count()==1
                            snap('choices','#decisionPreflight');fit()
                            tap('#decisionCheckEvidence');assert page.locator('.pair-board').is_visible()
                            tap('#dossierReturn');assert page.evaluate("document.activeElement===document.querySelector('#choicesPanel')")
                            assert save(key)==raw
                            page.evaluate("(entries)=>Object.entries(entries).forEach(([k,v])=>localStorage.setItem(k,v))",fixture)
                            page.reload(wait_until='load');tap('#resume')
                            panel=page.locator('#finalePanel');panel.wait_for(state='visible')
                            assert panel.get_attribute('data-ending')=='trainEscape'
                            assert panel.locator('.finale-subtitle').inner_text().startswith('\u0413\u0435\u0440\u043e\u0439:')
                            assert panel.locator('.finale-metric').count()==3
                            assert panel.locator('#finaleArchive').get_attribute('data-status')=='verified'
                            assert panel.locator('.finale-archive-check[data-verified=true]').count()==2
                            order=panel.evaluate("""e=>{const a=[...e.children];return ['.finale-metrics','#finaleArchive','.finale-actions','.finale-detail-heading','.finale-people','#finaleCollectionCompass'].map(s=>a.indexOf(e.querySelector(s)))}""")
                            assert min(order)>=0 and order==sorted(order),order
                            assert panel.locator('.finale-actions').count()==1
                            final=save(key)
                            tap('#quickNav [data-go=choices]');snap('report','#finalePanel');snap('actions','#finaleArchive');fit()
                            tap('.finale-actions button:first-child')
                            assert page.locator('#dossierReturn').is_visible()
                            tap('#dossierReturn')
                            assert page.evaluate("document.activeElement===document.querySelector('#choicesPanel')")
                            person=page.locator('.finale-person-open').first.get_attribute('data-person')
                            tap('.finale-person-open')
                            assert page.locator(f'.person-entry[data-person="{person}"]').evaluate("e=>document.activeElement===e")
                            tap('#dossierReturn')
                            tap('.finale-collection-open[data-collection=rewards]')
                            assert page.locator('#launch').is_visible()
                            tap('#collectionReturnFromLaunch')
                            assert page.locator('#finalePanel').is_visible()
                            assert save(key)==final
                            tap('.finale-actions button:last-child')
                            page.wait_for_url('**/index.html#district-digbeth')
                            assert page.locator('#districts').is_visible()
                            assert save(key)==final
                        assert not errors,errors
                        print(engine,width,'case',case,'PASS',flush=True)
                        ctx.close()
                browser.close()
    finally:server.shutdown()

if __name__=='__main__':run()

