# V81 — profile overview and campaign navigation

Base V80 1902fc0333f99ab5b882249db12f50552337c4fa: local and remote clean/equal; integrated CI 44214287692 SUCCESS.

- Audit: 12 viewport screenshots of the local profile, campaign overview, trial sections, archive, archive shortcuts and character dossiers in Chromium/WebKit at 390x844. Existing profile illustration and hero dossier art retained.
- Campaign's three existing profile links moved directly after the progress overview, before unrelated trial sections; no duplicate links/new navigation mechanism. Added accessible navigation label and 48px mobile touch targets.
- Profile completion number has explicit caption, confirmed stamps and live slot statistics remain distinct; damaged archive shows dash rather than zero. Existing calculation, rendering source and storage schemas unchanged. Trial section headings made consistent. Fixed inherited nested grid placement after first narrow screenshot.
- Five existing read-only profile unit tests passed; unified release and package integrity passed (527 files). profile_v81.py tests fresh isolated storage, three actual navigation links, viewport overflow, damaged record and slot, unchanged raw storage, no uncaught browser error. Final CSS check includes number/caption geometry. Final matrix: 4/4 Chromium/WebKit x 320/390 px passed after the metric alignment correction. Inspected final 320px Chromium capture. Existing mixed CSS line endings retained byte-for-byte outside the appended block (normalized comparison passed). Full manual long scenario replay not needed.
- No new images, no engine/save/reward changes, no merge to main, no Vercel release or physical phone test.
- Codex remains optional for independent review or substantial new development. Future content direction remains V80 roadmap; choose new operations or detective Case003 after current polish/acceptance.


- Remote mobile CI 44215982963 on initial V81 failed on exact lowercase label contract. Restored the original lowercase phrase without weakening the assertion; local static 19/19, profile 5/5, unified build and integrity passed. The text-only correction does not change the previously verified geometry or storage. Final remote rerun remains to be confirmed.
