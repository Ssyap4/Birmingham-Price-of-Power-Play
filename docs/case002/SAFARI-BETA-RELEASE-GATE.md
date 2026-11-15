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
   required Case002 JavaScript, 10 approved NPC portraits and five legacy
   hero portrait files, without Case001 gameplay or landscape scene assets.
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
