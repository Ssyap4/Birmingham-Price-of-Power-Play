# V105 — prerelease revision, rare mobile states and missing images

Base V104: 37c75d68be259d6d0dd1ce210a10f9fe81efb0fb (Actions 44374914919 acceptance SUCCESS).
No engine, story, asset, save, reward, or archive schema changes.

- Local unified release browser sweep (Chromium 320 and WebKit 390): menu, both maps, catalog, wave-one briefing, CR07 engine-replayed disabled/lethal decision states, CR10 scene/equipment, real decision/receipt, forced missing story art, Chronicle, common archive, profile. Both passed overflow, JS-error and unexpected local HTTP error checks. Deliberately failed image requests are not release defects.
- Valid engine-replayed critical state at 27 HP. Explicit critical health text complements the existing color warning.
- Reproduced layout inflation on missing decorative equipment icon: Chromium 320 grid row ~138 to ~362 px; WebKit 390 ~120 to ~260 px. Distinguish story-art fallback from decorative imagery. Compact aria-hidden placeholder maintains icon footprint; missing portrait/card thumbnail does not inject a contradictory story message. Handle images already failed before listeners attach.
- Addressed regression: tests/criminal/rare_mobile_v105.py, 2/2 (Chromium 320, WebKit 390): confirmed engine state and critical label, equipment card height unchanged at ~138 and ~120 px, names and counts remain visible, missing story frame still shows its distinct status and available decisions. Synthetic asset errors and isolated storage only.
- Both exports and JS syntax passed: unified 654 files/68.15 MiB; standalone 216 files/162 frames/20,402,783 bytes.
- Selected screenshots inspected; broad screenshot sweep recorded under work/criminal/v105. This is not exhaustive visual acceptance. Remaining: full selected-screen visual review, legacy-mode entry and audio interaction, stress/performance and storage edge-case checks as needed before candidate-wide regression. No physical iPhone, Telegram WebView, merge or deployment. Do not update stable V83.
