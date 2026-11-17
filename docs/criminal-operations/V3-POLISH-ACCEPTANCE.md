# Criminal Operations v3 — scoped mobile polish and safety acceptance

Date: 2026-11-16. Source baseline: Codex v2 HEAD `b4ddfced0e1fedc7e17b028fb01004eb9e090483`. Working branch: `feat/criminal-operations-polish-v3`.

## Scope: only the isolated criminal mode

No changes to `main`, `preview/unified-campaign-safari`, Case001/Case002 stories, engines, legacy save keys or approved detective art. The original `feat/criminal-operations-codex-v2` remains intact for comparison. This batch modifies only:
- `src/criminal/archive.js`
- `src/criminal/app.js`
- `criminal-operations-v2.css`
- `tests/criminal/engine.test.js`
- `tests/criminal/mobile_browser.py`
- `.github/workflows/criminal-v2.yml`

## Product improvements

1. **Unsaved-result protection:** a shared `confirmPendingLeave()` guards all tested exit paths (screen's Map/Menu, legacy home and exit buttons, profile). A cancelled confirmation retains the calculated but unpersisted RNG result; an approved departure explicitly clears that in-memory attempt. This is used only after a failed save write, not on ordinary autosaved navigation.
2. **Verified rewards:** archive `recover()` now reports `awardAdded` and `achievementAdded` only when a genuinely new, persisted, replay-validated unique result is first registered. Reopening the terminal state or repeating the same `mission × hero × ending` reports false; storage write failures never announce success.
3. **Visible mobile notifications:** a top-of-viewport dismissible, accessible reward toast appears once on the newly verified ending. It remains inside the criminal screen with safe-area handling; it is not part of the detective achievement system.
4. **Decision clarity:** risk choices additionally show the real computed probability, preserving the engine/UI single `choiceId` source. The consequence card names the previous scene, and the HUD presents an accessible HP progress bar and three-act progression.
5. **Reader polish:** isolated visual enhancements for dialogue rhythm, scene frames, choice cards, consequence panels and reduced-motion behavior. No change to the old campaign selectors.

## Verified QA

**Passed:** [Criminal operations Actions run 43933176700](https://github.com/Ssyap4/Birmingham-Price-of-Power-Play/actions/runs/43933176700), tested commit `c4f718fdaf48ab41863d06243e3f928d8c02728c`. This run's scope includes:
- Node engine, branching, item effects, RNG, archive and reward assertions.
- Exported unified package integrity and unchanged Case002 art contract.
- All 40 new WebP decoded, 720×900, SHA-256 and packaged file checks.
- Chromium and WebKit mobile touch acceptance across 320/360/390/430 widths, ten scripted control playthroughs, reloads, persistence failures, corrupt slot recovery and reward-toast semantics.
- Same-package Case001/Case002 entry smoke and preservation of original save bytes.
- Artifacts: `criminal-v2-acceptance` (screenshots/evidence) and `criminal-v2-unified-package` (offline build). The artifact names remain the pre-existing CI naming convention; the tested commit above is the v3 distinction.

The preceding run 43932697401 failed **in the newly added UI assertion**, because the test checked for the one-time award toast *after* reloading the final state. The test was corrected to assert the visible toast immediately at the first recorded ending and its deliberate absence after reload. Production award logic did not require a change for this test correction. Do not cite that failed run as a passing gate.

Independent source execution of the v3 archive also confirmed first grant = true, subsequent identical recovery = false, and no duplicate ledger entry.

## Art and remaining product gates

The existing 40 scene WebPs are preserved, correctly linked to 105 playable nodes, with neutral aftermath frames shared by the four endings in each mission. In this audit, 15 individual new images were directly opened across the v2 and v3 review turns; the final five were the five aftermath frames. Visual quality is consistent. A higher-impact follow-up should consider action-specific art at CR01 `ambush` (existing frame is an empty alley), CR02 `rescue`, CR03 `discovery`, CR04 `lastStand`, and CR05 `chase` or `gate` if subjective review justifies it. Do not replace approved art merely to increase count. Keep the one-new-scene-image-per-author-message protocol for our own generation.

Before a public release: isolated HTTPS preview and real Safari iPhone author playtest, subjective balancing and narrative pacing, plus a planned additive integration of criminal achievements into the shared campaign dossier without modifying detective save namespaces. The physical iPhone and production Telegram Mini App remain **untested**. No live alias has been changed and no `main` merge has been performed.

## Next stage

Continue in the same isolated feature branch or a documented successor; prioritize the author-facing mobile milestone and select only strong art gaps. Do not treat this report as a full public release approval. Apply risk-proportionate QA, not all 202/400 legacy routes after isolated CSS changes.
