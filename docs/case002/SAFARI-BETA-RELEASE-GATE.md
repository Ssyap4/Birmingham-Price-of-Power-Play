# Case 002 — Safari beta release gate (2026-11-15)

Scope: separate HTTPS beta of Case №002, isolated from stable main and Case №001.

Verified: 89 illustrated scenes, 102 approved shot/variant entries, 35 routes,
5 heroes, 7 endings. Full mobile GitHub Actions Chromium+WebKit run
43655644928 on commit 428210718dd0f854cae383d018a76baf01f74c5f
completed successfully. Story QA run 43655641451 also succeeded.
Prior real failure 43654770794 was an inaccessible stale-tab return button;
fixed with noticeExit and new mobile regression.

Release gate:
1. Block only P0/P1 issues: progression, persisted saves, layout obstruction,
   art integrity and browser failures. Defer cosmetic micro-polish.
2. Build independent static package using
   node deployment/case002-safari-preview.js
   The builder checks SHA-256 of all 102 portrait originals, copies all
   required Case002 JavaScript, 10 approved NPC portraits and five actual
   protagonist portraits from assets/heroes/, without Case001 gameplay or landscape scene assets.
3. Workflow case002-safari-package.yml builds an artifact on the feature
   branch. An artifact is not a public HTTPS website.
4. vercel.json can deploy that package to Vercel, once a Vercel account is
   explicitly connected and the deployment has been authorized.
5. Verify the actual HTTPS URL and iPhone Safari startup, dialogue, art,
   decision, dossier, resume and ending on the live site.
6. Never merge Case002 into main simply to expose a test link.

Unresolved: isolated site deployment and independent live Safari acceptance.
No final live link should be claimed before the host confirms deployment.

### Package CI correction

Workflow 43656108077 verified all 102 SHA-256 portrait assets and created a 134-file, 12.4 MiB package successfully; only the upload step failed because `actions/upload-artifact@v4` excludes dot-prefixed directories by default. The staging output directory is now `case002-preview-dist` (without a leading dot) everywhere: in the builder, Vercel configuration and upload workflow. This is a packaging failure, not a game or image QA failure.

### Verified static-package artifact — 2026-11-15

GitHub Actions run **43656197899** on commit `4d92449ca811e47851f3801f6906bba44c224ede` finished **success**. The portrait-only exporter verified and packaged all **89** illustrated scenes, **102** SHA-256-verified 720×900 WebPs, **10** NPC portraits and **five** hero portraits. Output: **134 files / 12.4 MiB**. Artifact: `case002-safari-beta`, ID `14138800019`, downloadable from the successful Actions run. The package deliberately excludes Case001 gameplay and landscape scene files.

The previous failed package run `43656108077` was caused solely by a dot-prefixed output directory hidden from `actions/upload-artifact@v4`; it is resolved. This confirms a deployable ZIP **but not a live HTTPS URL**. The remaining milestone is an isolated host connection and live Safari validation. The Vercel connector was suggested but is not connected/installed yet; deployment must wait for explicit user action.

### Standalone Safari UX milestone (development branch)

The preview now uses the five actual portraits in assets/heroes/ instead of the
legacy role illustrations from assets/case-scenes/hero*.webp. These role
illustrations represented a crate, ledger or industrial doorway for some
protagonists and were unsuitable for hero selection. The exporter still copies
only five hero images, preserving the isolated package scope. Existing
published HTTPS beta must not be treated as updated until a new Vercel deployment
is explicitly checked and accepted.

### UI milestone: scene presentation and evidence wall

Case 002 adds a scene-film caption below each independently approved 720×900
image, character-specific dialogue treatments, numbered decision cards and an
optional two-clue deduction wall. Every evidence card can be sent to the wall.
Hints appear when the first clue is selected, and comparisons do not mutate
engine state, save records, rewards or story logic. The layout must be checked
at mobile phone widths and with Chromium + WebKit before a later Safari release.

### Cinematic dossier milestone (branch-only)

The "Люди" dossier now uses only identity-bound reviewed NPC portraits from
approved-art-v1.js for discovered characters, retaining a monogram when an
image fails. Unintroduced people are never listed. "Ход дела" is a newest-first
ledger of committed journal events, with scene titles drawn only from visited
records; after the newest six, an optional button reveals older entries.
Decision receipts keep their exact original content, while their film-style
border and category label use the existing focus type. No save schema, script,
ending predicates, or Case001 state is changed. Prior Safari URL is not republished.

### Finale presentation milestone — branch only

The terminal scene now renders a spoiler-safe, read-only cinematic outcome dossier:
real ending title, current hero, evidence/proof/safety counts, only discovered
witness statuses, a few already-recorded journal notes, and a separate
completion archival status derived from existing storage records. Returning to
hero selection or opening the journal does not mutate the save, award new
rewards, or change any of the 35 tested endings. The end title is never shown
before a committed Z01–Z07 scene. Publish only after browser and model QA.

### Stage 15/15 mobile acceptance boundary — development branch, 2026-11-15

The independent Case 002 preview now includes (on the feature branch)
18 distinct once-per-case achievements, a separate 35-combination
hero×ending reward shelf, visible earned-only unlock receipts, and
reversible finale↔collection links. The final UI cycle also handles
simultaneous milestone + reward unlocks, small-viewport notification
stacking, keyboard focus after closing a toast, and an unobtrusive
actual-scroll reading rail that is hidden outside the scene section.

These are local preview features: the previous packaged artifact and
any external Safari URL do NOT receive them automatically. The next
major preview should manually rebuild the independent Safari package,
verify its immutable WebP inventory and run the justified Chromium/WebKit
acceptance gate, then deploy on an isolated host only when authorized.
No link is declared live by this document. Preserve stable main,
Case 001 and the existing save/archive schema.

### New-cycle stage 1/15 — isolated package reliability

The package exporter now fails if any directly referenced HTML script, stylesheet,
initial image or CSS URL/import is missing, points outside the isolated output,
or depends on an absolute website root or external host. Its landing page now
uses a relative redirect and fallback link, allowing standalone subpath hosting.
The post-build integrity test checks the actual staged dependency closure,
102 approved 720×900 scenes, ten NPCs, all five heroes and exclusion of legacy
Case 001 assets. This is package correctness, **not** live iPhone Safari acceptance.

ADR-0005 classification explicitly recognizes exporter and package-test edits as
`package`: their push CI performs the package build plus targeted integrity
check, without unrelated 400-route gameplay simulation or WebKit. Manual
Safari distribution still requires a deliberate workflow_dispatch and the
full separate browser/release gate; this update does not deploy anything.

### New-cycle stage 2/15 — safe interruption of finale collection navigation

A cancelled restart from an earned collection must retain the original live
finale bookmark and return button. An invalid save for a different hero must
not replace the old completed engine. Only a successfully reset or loaded
candidate becomes the active game. If an actual terminal primary save loads
before its separate archive recovery fails, the existing honest partial
recovery warning remains in place. Targeted mobile Chromium now checks these
paths against a genuinely completed Z02, including focus and save immutability.
This is not yet the separate full WebKit/iPhone acceptance gate.

### New-cycle stage 3/15 — decision error recovery and focus

The phone UI offers the explicit return-to-hero selection action for all
actual primary save-guard failures (stale tab, missing save, unreadable
storage or malformed slot) using an error property, not translated string
matching. Ordinary decision-rule rejections do not enable that exit.
Dismissing a fixed consequence/error notice restores keyboard focus to the
current decision or dossier landmark instead of always moving focus back
to the distant story opening. The scoped Chromium regression exercises
missing and corrupt saves from a real A01 decision, checks no progress write,
and verifies recovery focus and reachable exit above the mobile dock.
No storage schema, game rules, art, Case001, or main are changed. Safari/WebKit
release acceptance remains a separate milestone.

### Chat handoff is independent of Safari beta readiness (ADR-0006)

The author's 15+1 rule is solely a context continuity mechanism: 15 useful
development replies and a comprehensive handoff prompt on reply 16. It is not
a release countdown, readiness gate, or scheduled Safari demonstration.
Showcase the isolated beta only when its actual QA and verified HTTPS preview
are ready, regardless of the reply number.

The evidence-card "НА ДОСКУ" shortcut now enters deductions via the normal
scoped navigation path, so actually viewed leads are acknowledged and the
same clue can be reached again via its return bookmark. The phone regression
uses a real F09 state; no engine, save schema or reward changes were made.

### In-memory dossier disclosure continuity — next mobile polish

When the player briefly switches dossier tabs, expanded evidence associations
and encountered witness histories should remain open when they return within
the current story scene. The UI now snapshots only genuine open <details>
cards before re-rendering the section; those disclosure states are cleared on
new scenes and sessions and are never persisted in Case002/Case001 storage.
Scoped Chromium covers Rowan's existing history at A03 and a proven source
link at F09, including saved-progress immutability. No new plot or rewards.

### Correct origin anchors for reversible mobile dossier navigation

Scene/reading bookmarks track the narration, while bookmarks created at the
decisions now track the choices panel itself. Both the dossier return button
and the thumb dock restore the same source viewport even when the height of
intermediate scene presentation changes while the dossier is open. Browser
regression uses the real A05 decision and a temporary presentation-only
height change, asserting exact viewport restoration, focus, and unchanged
localStorage. No plot, save schema, reward or unrelated Case001/main edits.

### Exact journal note and witness history return targets

An earned journal note's source link now includes its current note index as
presentation-only metadata. A one-hop dossier visit returns focus to that
exact source link, rather than to the top of a long historical row.
Witness-history-to-journal visits likewise return to the original action
inside the (still expanded) encountered witness timeline. Scoped Chromium
covers an A05 evidence note and existing witness transitions. No plot, save,
reward, main or Case001 changes.

### Current branch deployment preflight (2026-11-15)

A new independent Vercel preview from source commit
`dff0726da1476f48bd96561af3eb713854cad67e` reached READY.
Vercel build logs independently verified 89 scenes, 102 approved portrait
WebPs, ten NPCs, five heroes and 136 output files (11.8 MiB). The published
HTTPS landing page, game entry and first portrait returned HTTP 200. Its URL
is a preview deployment; the older production alias remains untouched.
This source/HTTP evidence alone is not real iPhone Safari/WebKit acceptance.

For the next full mobile QA gate, the same workflow now assembles and verifies
the standalone Safari package before running Chromium and WebKit. Routine
quick UI pushes continue to skip this extra release work under ADR-0005.

### Final polish phase I — original briefing art and streamlined decision handoff

The previous Mabel portrait on the Case002 briefing has been replaced with
one original, scene-setting railway viaduct illustration (actual 720×900 WebP).
Its file and SHA-256 are registered separately from the existing 102 approved
story frames. The isolated exporter copies and verifies that asset. The scene
reader bridge now contains only the existing decisions CTA (or finale CTA),
and the pre-decision panel keeps important risk/availability information without
duplicating an extra action count. All interactions are presentation-only.
See [the accepted final polish plan](CASE002-FINAL-POLISH-PLAN.md).

A pre-existing preview URL from an earlier commit will NOT have these changes
until the distinct preview deployment is intentionally rebuilt and verified.
