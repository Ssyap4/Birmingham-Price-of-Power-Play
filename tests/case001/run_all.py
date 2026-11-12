#!/usr/bin/env python3
"""Run the original 154 audit cases plus scoped regressions, preserving failures."""
import concurrent.futures, json, os, subprocess, sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
OUT=Path(os.environ.get('CASE001_QA_ARTIFACTS',HERE/'artifacts'));OUT.mkdir(parents=True,exist_ok=True)
SUITES={'run_tests.py':'results.json','targeted_tests.py':'targeted-results.json','health_tests.py':'health-results.json','regression_tests.py':'regression-results.json','issue3_tests.py':'issue3-results.json','session_exit_tests.py':'session-exit-results.json'}
expected=set(json.loads((HERE/'baseline_scenarios.json').read_text()))

def run(script):
 env=dict(os.environ,CASE001_QA_ARTIFACTS=str(OUT))
 for key in ['CASE001_QA_FILTER','CASE001_QA_OUTPUT','CASE001_QA_COVERAGE']:env.pop(key,None)
 result=OUT/SUITES[script]
 if result.exists():result.unlink() # Never accept stale results from a previous run.
 with (OUT/(script+'.log')).open('w') as log:
  code=subprocess.run([sys.executable,str(HERE/script)],cwd=HERE.parents[1],env=env,stdout=log,stderr=subprocess.STDOUT).returncode
 print(f'{script}: exit {code}',flush=True)
 if not result.exists():raise RuntimeError(f'{script} produced no current result; see {script}.log')
 data=json.loads(result.read_text());data['exit_code']=code
 return script,data

workers=int(os.environ.get('CASE001_QA_WORKERS','3'))
if workers<1:raise ValueError('CASE001_QA_WORKERS must be at least 1')
with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as pool:
 suites=dict(pool.map(run,SUITES))
baseline=[r for script,data in suites.items() if script in ['run_tests.py','targeted_tests.py','health_tests.py'] for r in data['results']]
regressions=suites['regression_tests.py']['results']+suites['issue3_tests.py']['results']
session_exit=suites['session_exit_tests.py']['results']
regressions+=session_exit
assert len(suites['regression_tests.py']['results'])==14,'Incomplete earlier regression suite'
assert len(suites['issue3_tests.py']['results'])==29,'Incomplete Issue #3 regression suite'
assert len(session_exit)==5,'Incomplete session exit regression suite'
assert len({r['name'] for r in regressions})==48,'Duplicate regression IDs'
actual=[r['name'] for r in baseline]
assert len(actual)==154 and len(set(actual))==154 and set(actual)==expected,{'missing':sorted(expected-set(actual)),'unexpected':sorted(set(actual)-expected),'count':len(actual)}
errors=[e for d in suites.values() for e in d['page_errors']]
http=[e for d in suites.values() for e in d['http_errors']]
summary={'baseline':{'total':len(baseline),'passed':sum(r['status']=='passed' for r in baseline),'failed':sum(r['status']=='failed' for r in baseline)},'regressions':{'total':len(regressions),'passed':sum(r['status']=='passed' for r in regressions),'failed':sum(r['status']=='failed' for r in regressions)},'regression_groups':{script:{'total':len(suites[script]['results']),'passed':sum(r['status']=='passed' for r in suites[script]['results']),'failed':sum(r['status']=='failed' for r in suites[script]['results'])} for script in ['regression_tests.py','issue3_tests.py','session_exit_tests.py']},'page_errors':errors,'http_errors':http,'results':baseline+regressions}
(OUT/'all-results.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps({k:v for k,v in summary.items() if k!='results'},ensure_ascii=False),flush=True)
for r in summary['results']:
 if r['status']=='failed':print('FAILED',r['name'],r.get('error',''),flush=True)
raise SystemExit(1 if errors or http or any(r['status']=='failed' for r in summary['results']) else 0)
