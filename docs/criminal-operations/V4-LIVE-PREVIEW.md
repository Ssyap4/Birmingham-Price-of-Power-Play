# Criminal Operations V4 — isolated Safari preview handoff

Date: 2026-11-16. Status: **live HTTPS smoke PASS**; unified/offline scoped matrix tracked separately.

## Operational isolation
- Repo: `Ssyap4/Birmingham-Price-of-Power-Play`
- Dev branch: `feat/criminal-operations-polish-v3`. No merge to `main`.
- Existing Case001/Case002 browser beta and its Vercel project **unchanged**.
- New **separate** Vercel project `birmingham-criminal-v3-safari` (`prj_qYKyrE6KbuRFy459gnVGhilz8WSx`).
- Latest tested deployed build: `dpl_3AZNswbSAGzx4kQoZUoi8V8hz8xt`; source gameplay commit `534ba2a4c383d15e12bfa05bb33f9230a80e1bc4`.
- Stable isolated URL: https://birmingham-criminal-v3-safari.vercel.app/
- Immutable built URL: https://birmingham-criminal-v3-safari-mkqi48w6l-lillineeb51-9659.vercel.app/
- Vercel alias was moved **only within this new project**, never the existing Case002 Safari beta.

## Preview architecture and limitations
The published HTTPS preview is a *small launcher HTML* that loads the public reviewed runtime, stylesheet, five hero portraits, and 40 existing approved criminal WebP frames from **commit-pinned jsDelivr GitHub CDN URLs**. It is online and **not an offline copy**.

The actual self-contained local browser package is built separately by `deployment/criminal-standalone-preview.js` into `criminal-preview-dist`, using the same runtime, portraits and WebPs, with hash validation and no external dependency. This is what the standalone CI checks. The old full unified package `campaign-unified-dist` still exists for Cases 001, 002 and criminal mode together.

No back-end, account registration or cross-device sync: criminal history and rewards use isolated localStorage namespacing; users should not expect continuity between distinct origins.

## Important real bug fixed by live test
The first version of the HTTPS launcher exposed a shipping UI fragility: because `<base href="https://cdn.jsdelivr.net/...">` changed URL resolution, `history.replaceState` could not modify the page URL as expected. The app then inferred the selected mission solely from `location.hash`, so clicking Start called `Engine.create` without a valid mission ID, emitting “Неверный заголовок попытки”.

**Permanent source correction:** `src/criminal/app.js` now updates the hash against the document's own absolute URL and retains `selectedMissionId` in volatile UI state if hash mutation is denied. No save fields, mission graphs, RNG, schema or rewards changed. A blocked-`replaceState` browser regression was added to `tests/criminal/standalone_mobile.py`.

An unrelated preview CSS-relative background `404` was also corrected to use `../../assets/criminal/cr01-arrival.webp`. The original URL was never shipped as approved.

## Verification
- **PASS real live HTTPS**: [run 43943646202](https://github.com/Ssyap4/Birmingham-Price-of-Power-Play/actions/runs/43943646202), both WebKit and Chromium, CR01 and CR05 start and selectable actions, returning home, live 720×900 frames, zero 4xx/5xx responses and zero JS errors. The recorded screenshot `live-webkit-map.png` was inspected visually; there are no obvious label/control overlaps on the 390 px map.
- A complete *local* isolated mode and shared package WebKit/Chromium mobile matrix is in `criminal-v2.yml`; use its latest successful run for a full acceptance claim. **Live smoke is not a physical iPhone test.**
- The original Codex v2 graph/asset baseline and previous V3 epilogue, archive and save-integrity QA remain separately recorded.
- No claim of production Telegram validation or public release acceptance.

## Art protocol
**One new illustrative scene per user message.** In this message the only new generated image was CR02 `rescue` (“Мальчик знает воду”): Ben under the barge hatch, Nora above with lantern. Candidate WebP 720×900; 124874 bytes; SHA256 `0028823f363e87bb87da80fec54a487cd8f4e4bebc4e44c7f06b8318b79789fd`. Ben's outfit/age/texture follow `cr02-pressure`; Nora's facial continuity needs another direct check before approval. Do **not** claim this file is in GitHub, the art manifest or the deployed app.

The previous CR01 `ambush` candidate remains also uninstalled: WebP 720×900, SHA256 `75a886eb51e3e1de4b922b4b2a70dede0223c61c6c059c1d6abb8a05b638628c`. Both file bytes are available in this conversation's generated artifacts, not under `assets/criminal` in GitHub. The existing 40 approved Codex artworks and all detective artworks are intact.

Next image candidates after actual binary handoff and continuity check: CR03 discovery, CR04 lastStand, CR05 gate, one scene per author message. Do not silently replace multi-scene art for unrelated scenes.

## Suggested next milestone
1. Finish the latest scoped offline/unified QA and record its exact SHA, artifact and status.
2. If the author accepts the Safari test, improve the scene pacing and illustration-to-scene matching without expanding mechanics unnecessarily.
3. Integrate any approved raster candidate as a *new* manifest entry for precisely its intended scene, verify SHA and full package.
4. Later, decide unified archive cross-mode visibility and server profiles separately, preserving legacy save namespaces.
