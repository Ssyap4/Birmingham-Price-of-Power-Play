# V100 — Единый каталог поручений

Base: e44a33b7ad2167828392b4d650593a1e5ed8f500 (V99).
Scope: shared criminal catalog UI and targeted catalog acceptance. No scenario, engine, save, reward or artwork changes.

- Shorter introduction, progress summary and direct jump to catalog before the map.
- Native grouped district/hero filters with counts and visible total; selected district is marked visually and by aria-pressed.
- Ten mission cards have distinct existing arrival/start frames (lazy loading), clear district, hero, status and action; internal mission identifiers are no longer displayed on the cards. Missing thumbnail does not block navigation.
- Removed duplicated bottom Chronicle action. Existing map-reset-on-return behavior retained.
- No new art or new dependencies.

Local acceptance on Alina-PC, 18.11.2026:
- node --check src/criminal/app.js: PASS.
- Unified export: 654 files, 68.13 MiB, 393 staged references.
- Standalone export: 216 files, 162 frames, 20 390 715 bytes.
- tests/criminal/catalog_v85.py: 8/8 PASS, Chromium and WebKit at 320 and 390 px, ordinary and synthetic additional-mission configurations. Checks include map/filter/count, ten distinct thumbnails, jump target focus, mission briefing/return, common archive, no JS errors, unchanged saves, horizontal overflow. Loopback server logged connection aborts during browser navigation/teardown; no assertion failed.
- Actual before/after browser screenshots captured locally in work/criminal/v100 and work/criminal/v85; Chromium 320/390 and WebKit 320 after-list images visually reviewed.
- No physical iPhone or Telegram WebView test. No full gameplay regression repeated for catalog-only changes.
- Prior V99 GitHub Actions acceptance 44356752139 success. main remains protected; no deployment.

