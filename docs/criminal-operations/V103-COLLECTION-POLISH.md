# V103 — Chronicle, collection and profile

Base: 293963f62417189e95c598f7056dd9cec281ae51 (V102, CI 44369070045 SUCCESS).
Presentation/read-only projection only. No engine, reward, save schema, story, or art changes.

- Chronicle uses mission titles, counts, compact expandable reports, paginated attempt history and grouped reward collection. Mission filter also applies to reward and memory projections. Common archive shortcut near top.
- Common archive displays actual mission titles and collection totals; unreached endings are represented by outcome types, without their story titles.
- Profile displays confirmed local reward count and a catalog-derived collection capacity. Active slots remain independent from completed attempts.
- Existing final-return behavior is retained. No migration or write from viewing the archive/profile.

Local acceptance:
- JavaScript syntax and 11/11 relevant Node tests (archive bridge/profile/scalability) passed.
- Both package exports passed (654 files / 68.15 MiB; standalone 216 files, 162 frames). Final minor profile typography change followed by unified export.
- tests/criminal/collection_v103.py: Chromium and WebKit at 320/390, all four PASS. Isolated genuine engine replay and archive recovery produced 40 distinct rewarded outcomes across ten missions plus one repeat (41 attempts), 20 memory marks, one active slot; tested empty archive, paging, filtering, collection, common archive, history/dossiers, profile, and damaged ledger. Storage bytes unchanged while browsing; corrupted bytes remain untouched. These are replay-generated QA fixtures, not new end-to-end touch playthroughs.
- Chromium 320 screenshots reviewed for filtered reports, collection, common archive and profile. Test corrections: malformed-ledger literal mismatch and DOM text inspection for collapsed folds; final suite passed.
- No physical iPhone, Telegram WebView, deployment, or merge. Prior V101 CI canceled during browser install; V102 CI passed.

