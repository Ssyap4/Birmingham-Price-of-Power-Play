# V104 — Contextual navigation and return points

Base: 326e2e32deeebb71d2e44b9ef50f04d49e5ff6c5 (V103).
Scope: shared criminal UI/route state only; no engine, stories, artwork, reward schema, or archive writes added.

- Exact read-only Chronicle return points for briefing, active scene (including unacknowledged receipt), and completed attempt. Slot bytes, kind and attempt identity verified before return. Changed/unavailable slots are not overwritten.
- Chronicle opens filtered to the originating mission; from map it opens all attempts. No self-opening Chronicle button. Existing completed-attempt return and reward behavior retained.
- Contextual return to filtered catalog from briefing restores selection and focus to its card; the ordinary Map action still resets to all missions.
- Standalone Chronicle no longer offers a nonexistent common archive; unified common archive remains available.
- Home/profile/map/brief transitions clear temporary runtime state where appropriate; profile stops pending art timeout. Existing guards for pending writes and memory-only runs retained.

Local acceptance on Alina-PC:
- JS syntax, git diff --check and both package exports passed: unified 654 files/68.15 MiB, standalone 216 files/162 frames/20,401,981 bytes.
- tests/criminal/navigation_v104.py initially 8/8 across Chromium/WebKit, 320/390, unified/standalone. Actual taps verified context return, receipt vs acknowledged scene, catalog focus, changed slot refusal, profile/home navigation, no nonexistent standalone archive, no JS errors or missing resources.
- Added completed-attempt return assertion; final smoke 2/2 (Chromium 320 in both packages), using a valid engine-replayed CR10 conclusion. No duplicate reward toast, ledger and slot byte-identical on return.
- Screenshots inspected for selected catalog and Chronicle return in both package variants. No actual device, Telegram WebView or full route regression for this UI-only step; no deployment or merge.

