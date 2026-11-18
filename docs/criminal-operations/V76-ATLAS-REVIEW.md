# V76 — atlas-first portrait layout

Base: V75 `d50cebdafd5f8364226b73d0bcf5a9c3e92a9892`.
Local First: Windows, 390×844 screenshots of home, district atlas, mission atlas, achievements, dossiers and profile in Chromium and WebKit; 12/12 opened without horizontal overflow. Visual review selected the two atlases. Home, archive, dossier and profile deliberately retained.

- Unified mission atlas: existing Chronicle action moved after the map legend, before the mission list; the actual delegated button and hidden guarded Home action are retained. Standalone order and non-map phases unchanged.
- Portrait maps: compact headings/portal spacing, consistent centered brass/Georgia atlas title, smaller readable mission rules; map appears earlier. At 390×844 all five mission markers are visible in the first viewport in both engines. No new art, no changes to map coordinates, mission content, engines, save keys or awards.
- Local node syntax, unified package (527 files) and integrity: PASS.
- `python tests/criminal/atlas_v76.py`: Chromium/WebKit × 320/390, 4/4 PASS. Actual taps into both maps, Chronicle, CR02 briefing, archive and back to home; unchanged birmingham_ storage keys/values, no page errors or failed local requests. Screenshots: ignored `work/criminal/v76`.
- No full 202-scenario replay and no new Safari publication. Physical iPhone/Telegram hardware not tested. Main/pinned preview untouched. Remote CI to be checked after sync.
- Next: compare detective reader/briefing/hero selection, then dossier, inventory and final screens; choose real defects, not blanket redesign.

