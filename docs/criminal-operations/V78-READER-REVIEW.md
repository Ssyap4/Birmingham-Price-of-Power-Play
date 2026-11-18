# V78 — reading order and evidence board

Base V77 7b30d9b7147f92de9e057694cfa06df1c166bf46: clean local/remote match; integrated CI 44210446443 SUCCESS.

- V78 local audit: 16 real viewport captures in Chromium/WebKit at 390×844 across the two investigations (scene, clue board, selected clue, Case002 evidence/journal). Case001 fixture isolated in fresh browser storage; Case002 actual A05 route.
- Case002: single clue takes full width, explicitly communicates that a second clue is needed; the existing tap still exposes its hint. Multiple clues keep the existing comparison/result behavior. Narrow board rows and longer hint type improve reading; odd last journal destination spans both columns. Corrected clue count inflection after screenshot inspection.
- Story action follows illustration/fallback in Case002, matching Case001; same focus/jump and story choices. Removed old reserve between game content and separate audio dock while retaining shell reserve for fixed quick navigation. Case001 instructions focus on selecting compatible cards; empty-state text spans the grid. No new art, changes to engines, story routes, reward rules or save keys.
- Local reader_v78.py: 8/8 (both cases × Chromium/WebKit × 320/390); real touch, Case001 empty/compatible/confirmed deduction against isolated fixture, Case002 A05 one clue and subsequent two clues, read focus, journal, audio and credits, unchanged save values during read-only interactions. Both one and multiple clue captures visually reviewed. One local server ConnectionAbortedError during navigation/teardown; browser assertions passed; exact cause unproven. Final text-only inflection follow-up checked against counts, not by rerunning all routes. Node syntax, 527-file build and integrity passed.
- AGENTS: routine mobile Chromium/WebKit touch QA; physical iPhone/Safari/Telegram WebView only for major acceptance or hardware-specific issues. No extra emulator. No physical-device validation this wave, no manual long replay, no changes to main or pinned Safari.
- Next: compare in-scene decision cards and final/archive pages; continue visual polish based on real captures, not gratuitous redesign.

