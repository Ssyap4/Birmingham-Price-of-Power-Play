# Case №001 browser tests

These tests retain the 154 scenarios from `/workspace/case001-qa/REPORT.md` and include 48 regression scenarios: 14 for earlier scoped fixes, 29 for Issue #3 and five for session exit behavior. `baseline_scenarios.json` records the exact original case IDs. `baseline_edges.json` retains the original 71 story transitions; the added `pressure → endingRescue` exit and the 15 transitions in five new hero branches are exercised separately by regression tests. The current scene graph is extracted from the checked-out source at runtime.

Verified environment: Python 3.12, Playwright 1.62.0, system Chromium at `/usr/bin/chromium`, Node.js 24. No application build or package installation is needed in the prepared cloud environment. On another Linux machine, install Python Playwright and Chromium with its runtime libraries before running the suite.

## GitHub Actions

The `Case 001 Playwright tests` workflow runs on every pull request targeting `main` (including each new commit pushed to the PR branch) and can also be started with **Actions → Case 001 Playwright tests → Run workflow**. It installs Python 3.12, Node.js 24, Playwright 1.62.0, Chromium and the browser's Linux dependencies, then runs the full 202-scenario suite. A missing dependency, failed assertion or incomplete baseline/regression group fails the check. Logs, JSON results and failure screenshots are uploaded as the `case001-playwright-results-*` artifact even when tests fail.

From the repository root:

```sh
python3 tests/case001/run_all.py
```

The runner starts temporary loopback HTTP servers and isolated browser contexts, runs independent suites concurrently by default, and writes current results, logs and failure screenshots to the ignored `tests/case001/artifacts/` directory. Set `CASE001_QA_WORKERS=1` to run suites sequentially, as GitHub Actions does to avoid Chromium startup contention on hosted runners. GitHub Actions uses the Chromium binary installed by Playwright; local runs prefer system Chromium when available. UI waits allow up to 10 seconds for slower hosted machines. It rejects missing, stale, duplicated or incomplete baseline results. It exits nonzero if any assertion fails. Existing assertions are not disabled or marked as expected failures; the full runner also checks that all 14 earlier, 29 Issue #3 and five session exit regressions executed.

Individual suites:

```sh
python3 tests/case001/run_tests.py          # 125 original scenarios
python3 tests/case001/targeted_tests.py     # 24 original semantic/risk scenarios
python3 tests/case001/health_tests.py       # 5 original health/reward scenarios
python3 tests/case001/regression_tests.py   # 14 earlier scoped regressions
python3 tests/case001/issue3_tests.py       # 29 Issue #3 regressions
python3 tests/case001/session_exit_tests.py # 5 session exit regressions
```

For an individual suite, `CASE001_QA_FILTER` selects case IDs by regex, and `CASE001_QA_ARTIFACTS` selects an output directory. The full runner deliberately clears the filter so it always runs all 154 baseline scenarios. `CASE001_QA_OUTPUT` and `CASE001_QA_COVERAGE` may be used to preserve individual rerun evidence separately.

The browser follows real story buttons and uses actual localStorage. Only `Math.random` is controlled to reproduce safe actions, wounds and death. The tests do not replace game source or disable assertions. Ordinary story scenarios do not inject clue/deduction saves; explicitly labelled boundary fixtures cover corrupted saves and the old handed-over ledger bug. The event scope regression dispatches wrong-attempt notifications to ensure they cannot refresh another investigation's choices.

The one-time completion fix reuses the existing permanent clues granted by the four affected scenes. Save keys and top-level fields remain compatible. Five hero-action flags use the existing flags object. Continuing keeps the same attempt; starting a new one is an explicit confirmed action. Loading an older traded save removes its already handed-over ledger while preserving the remaining data and deductions. Health balance and clue-combination rules are unchanged.

Initial regressions reproduced the original dead end, stale ending buttons and reappearing scenes before any game changes. The current validation is recorded in `ISSUE3_REPORT.md` and `issue3-validation-results.json`. `VALIDATION.md` and `validation-results.json` retain the earlier audit snapshot for comparison.

The launch helper now distinguishes a fresh context (must open at intro) from Continue/Open report (must preserve the entire prior save). The original resume tests still assert complete equality before and after reopening. The route planner keeps original audit edges so baseline tests cannot accidentally take another hero’s new shortcut. No baseline case IDs or assertions were removed.
