"""Report every previously failing scenario before starting the full matrix.

Independent runs preserve diagnostics even if an earlier suite fails.
This is a fail-closed gate, not a replacement for any of the 203 tests.
"""
import json
import os
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
OUT = HERE / "artifacts" / "story-guard-preflight"
OUT.mkdir(parents=True, exist_ok=True)
SUITES = [
    ("run_tests.py", "^healing/", "results.json", {
        "healing/" + h for h in ("jack", "finn", "eleanor", "victor", "samuel")
    }),
    ("targeted_tests.py", "^(semantic/requirement_gates|reaction_once/evelyn)$",
     "targeted-results.json", {"semantic/requirement_gates", "reaction_once/evelyn"}),
    ("health_tests.py", "^health/risk_penalty/critical$", "health-results.json",
     {"health/risk_penalty/critical"}),
    ("regression_tests.py", "^regression/long_cycle_scenes_and_events$",
     "regression-results.json", {"regression/long_cycle_scenes_and_events"}),
    ("issue3_tests.py", "^issue3/hero_action/eleanor$", "issue3-results.json",
     {"issue3/hero_action/eleanor"}),
]
failures = []
passed = 0
for script, pattern, result_name, expected in SUITES:
    result = OUT / result_name
    result.unlink(missing_ok=True)
    env = dict(os.environ, CASE001_QA_FILTER=pattern, CASE001_QA_ARTIFACTS=str(OUT),
               PYTHONUNBUFFERED="1")
    for key in ("CASE001_QA_OUTPUT", "CASE001_QA_COVERAGE"):
        env.pop(key, None)
    print(f"--- {script}: {len(expected)} scenarios ---", flush=True)
    with (OUT / (script + ".log")).open("w", encoding="utf-8") as log:
        code = subprocess.run([sys.executable, str(HERE / script)], env=env,
                              cwd=HERE.parents[1], stdout=log,
                              stderr=subprocess.STDOUT).returncode
    print((OUT / (script + ".log")).read_text(encoding="utf-8"), flush=True)
    if not result.exists():
        failures.append((script, "missing current result", code))
        continue
    try:
        data = json.loads(result.read_text(encoding="utf-8"))
        rows = data["results"]
        actual = [r["name"] for r in rows]
        if len(actual) != len(expected) or set(actual) != expected:
            failures.append((script, "scenario coverage mismatch", actual))
        passed += sum(r["status"] == "passed" for r in rows)
        for row in rows:
            if row["status"] != "passed":
                failures.append((row["name"], row.get("error"), row.get("traceback")))
        if code or data["page_errors"] or data["http_errors"]:
            failures.append((script, "nonzero exit or resource errors", code,
                             data["page_errors"], data["http_errors"]))
    except (ValueError, KeyError, TypeError) as exc:
        failures.append((script, "invalid result", str(exc)))
summary = {"expected": 10, "passed": passed, "failures": failures}
(OUT / "summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2),
                                  encoding="utf-8")
print(json.dumps(summary, ensure_ascii=False), flush=True)
raise SystemExit(0 if passed == 10 and not failures else 1)
