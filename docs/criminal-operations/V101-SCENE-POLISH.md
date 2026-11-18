# V101 — Shared mission briefing and scene presentation

Base: 4bf3995701160b26823464b3fd205d308ecf0684 (V100, CI 44361424655 SUCCESS).
Scope: shared criminal presentation only. No change to mission scripts, engine, archive, persistence or art.

- Briefing has separate order and mission-specific rules; shared health/save rules in accessible native disclosure. Saved attempt summary uses the same loaded slot as the action buttons.
- Health and its bar now form one panel; all actual mission statistics remain visible, with one shared label dictionary. Critical health is styled separately.
- Risk level/probability/lethal warning and explanatory reason are visually separated. No change to probabilities, costs, enabled choices or consequence calculation.
- Internal mission IDs removed from briefing, scene and final headings; stage labels retained. Initial save confirmation distinguishes a fresh attempt from a saved turn.

Local acceptance:
- Node syntax, git diff --check, unified/standalone package exports PASS (654 files/68.14 MiB, 216 files/162 frames/20,392,658 bytes).
- tests/criminal/brief_scene_v101.py: initial 24 mission-entry/first decision/receipt/resume routes PASS: all ten in Chromium 320 and WebKit 390, CR05/CR10 also Chromium 390 and WebKit 320. Actual state compared with engine output and reading/navigation checked not to modify saves.
- Visual review detected literal template text in save confirmation. Corrected source and added exact initial/turn confirmation assertions. Final targeted smoke: 8/8 PASS, CR05 and CR10 on all four browser/size configurations.
- Before screenshots and final screenshots reviewed for representative first/second wave scenes. Initial screenshot attempt used same-document hash navigation and timed out; discarded and captured fresh contexts successfully.
- Not a complete story-route regression; final screens, critical-health appearance and all risky/disabled choices not exhaustively visually accepted in this step. No physical iPhone/Telegram WebView or publication.

