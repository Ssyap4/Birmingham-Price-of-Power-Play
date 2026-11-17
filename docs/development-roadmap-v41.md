# Согласованный план развития после V40 — 17.11.2026

1. Сценарная ревизия обоих дел и всех пяти героев: хронология, перемещения, знания героя, необратимые события, уход/гибель NPC, повторные находки, циклы, последствия решений, логика концовок, возобновление сейвов. Проверять сценарий и реальные условия переходов, а не только достижимость. Не запрещать оправданные возвраты. Сохранять старые сейвы и доступность концовок.
2. Финальная полировка вертикального интерфейса и визуальной целостности. Искать конкретные дефекты, не переписывать работающие системы.
3. Копить пакет, проводить адресные тесты, затем крупная приёмка на Safari.
4. Новые дела/криминальные поручения после приёмки. Для крупных пакетов прямо предлагать автору Codex и готовить единое подробное ТЗ: сценарий, граф, герои, оригинальный арт, контракты, интеграция, тесты, защита существующего. Независимая приёмка/полировка в ChatGPT.
5. Общую прогрессию и публичную инфраструктуру отложить до достаточного количества содержания, отдельно согласовать.

## Принципы
- №001 — компактная законченная история (5–7 минут при повторном прохождении по оценке автора). Не раздувать ради длительности.
- №002 масштабнее; будущие расследования не обязаны увеличиваться в объёме. Можно обозначать масштаб/сложность в карточке; не обещать неизмеренное время.
- Пять героев уже в ближнем круге; не делать их неизвестными новичками. Личный прогресс игрока не равен сюжетной репутации. Новые звания/репутация пока не утверждены.
- До публичного выпуска далеко; сервер, регистрацию, рейтинги пока не начинать.
- 10+1: рабочие ответы 1–10, 11-й — полный промпт в кодовом блоке; обсуждения не считаются. Ссылаться на этот файл в будущих передачах.
- Ветка feat/criminal-operations-polish-v3; main и стабильную Safari не менять. Проверять HEAD/CI, не объявлять PASS без результата. Не больше одной иллюстрации на сообщение, только при необходимости.

## V41 — первый пакет ревизии №001
Единая проверка сюжетного допуска в UI и обработчике, запрет повторного освобождения Артура и повторного предупреждения Эвелин, одноразовые сцены проверяются также обработчиком. Уточнены причины знания адреса насосной, убрана невозможная реплика через окно. Тест на пять героев и возобновление добавлен; CI не подтверждён. Полный аудит №001 и №002 ещё впереди. Проверить V40/V41 до приёмки.

## V42 — ревизия повторных посещений и развязок №001
- Контекстный текст повторных визитов (Эвелин, участок, причалы, склад), сохранение отметок при вытеснении записей из журнала, прежние сейвы читаются без изменения ключей.
- Повтор обвинения исключён после предупреждения Рида; обновлены описания после освобождения Артура и в момент обмена, пока Крейн ещё на месте.
- Дополнительные вопросы требуют действительного владения уликами; диалог с Крейном только до сделки. Проверены пять героев, маршруты к шести концовкам, повторные визиты и возобновление через исполнение реального JS с подменой отрисовки и случайности. Это не браузерный тест; CI всё ещё не подтверждён. Следом аудит второго дела и отдельная проверка UI/реакций/дедукции.


## V43 — первая ревизия сценарных состояний №002
- B01 учитывает завершённые маршруты; C04 без ведомости больше не обещает недоступный возврат к ней. HF03, HE03, HV02, HS03 описывают действие до выбора, а не свершившийся результат. E03 различает отсутствие доказательств и отказ от проверки. F07/F09 отделяют временную защиту от будущего вывоза; результат Z02 соответствует сохранённым флагам.
- Адресная проверка на реальном движке и текстовом рендерере: 556 переходов, 10 прохождений, все пять героев, два варианта вывоза, перезагрузка сохранения. Не браузерная проверка. Продолжить аудит остальных сцен, финалов и портретов, проверить CI и крупную приёмку.


## V44 — восстановление наблюдаемого CI
- Открыт черновой PR #8 из рабочей ветки в main исключительно для QA, без слияния. Первый обнаруженный run: 44141539523. Scope и artwork checks PASS; быстрая проверка остановилась на устаревшем требовании ссылок профиля в profile-page.js. Проверка теперь учитывает актуального владельца ссылок campaign-hub-v1.js и их маршрут; игровое поведение не изменено.
- Браузерные и сюжетные проверки на этом запуске ещё не подтверждены. Для следующих передач сохранять PR #8 и проверять результаты по конкретному HEAD. Не публиковать Safari и не сливать main до согласования.


## V45 — подготовка основного релиза
- Автор разрешил обновить main актуальной объединённой игрой после исправлений переходов №001/002 и QA. Это новая стабильная база разработки, не публичный коммерческий запуск.
- PR #8, V44 run 44141842904: структурная и художественная проверка PASS; старые browser jobs FAIL из-за ожидания удалённого пятиэлементного кабинета и landscape. 202 сценария ещё не подтверждены.
- Устаревшие UI проверки заменены действующим portrait iPhone regression в PR (оба движка, 4 ширины WebKit). Старые тесты оставлены в репозитории для истории; сохранены 202 сценария, архивы, обучение, выходы и контроль арта. Добавлены пакетный экспорт, проверка ресурсов, архивов/движка №002 и криминальных поручений. Тесты пакета/маршрута приведены в соответствие V40 (нет быстрого перехода в №002).
- Merge только после подтверждения релевантных тестов; сохранить прежний main как точку отката. Стабильную Safari V39 не менять; основной релиз публиковать осознанно. CI проверять по конкретному HEAD.

- V45 follow-up: F09 preserves already evacuated witnesses, distinguishes prepared routes and no-evacuation. Restored heroine-specific F07 phrasing; added assertion for protected/not yet evacuated witness. Existing narrative variant script executed against actual engine in isolated JS with in-memory file and assert adapters. First V45 run 44142612820 failed before browser launch on F09 expectation; rerun needed.
- Rollback branch backup/main-before-unified-v45 created from 3dbadc9cf0f60fd5f5fb209fba9c573e7be6c595; main unchanged.

## V46 — согласование QA с действующей объединённой игрой
- V45 PR #8, run 44143038476 SUCCESS: Chromium/WebKit, экспорт, JS и проверки №002/криминального режима. Run 44143038460: быстрый контроль SUCCESS, архивный smoke FAIL на старом глобальном счётчике 18; полный прогон ещё не подтверждён.
- Архивные проверки теперь требуют отдельно 18 достижений/30 знаков №001 и 18/35 №002. Полный агрегатор сохраняет 154 исходных сценария и 49 регрессий, включая все шесть существующих проверок выхода/изоляции сохранений (203, а не 202). Мобильный инвентарь проверяется в актуальном портрете 390×844 через нижнюю навигацию, desktop проверка сохранена.
- Только QA и документация, игровые файлы не изменены. Слияние PR #8 в main разрешено автором только после успешной финальной проверки; стабильный Safari V39 не перезаписывать. Новый CI пока не подтверждён.

## V47 — безопасный выход, повторное возвращение в Дигбет и очередность QA
- V46: архив, инвентарь и обучение/выдача достижений прошли в Chromium; 5 из 6 выходов прошли. Старый тест с карты использовал намеренно скрытый #gameExitBtn. Реальный маршрут #caseBack → #districtBack теперь проверяет неизменность всех localStorage, отсутствие лишнего подтверждения и возобновление точного сохранения. Подтверждение активного выхода/отмена/выход из финала и раздельный сброс героев остаются.
- V46 mobile run 44145776958: пакет, 35 маршрутов №002, 1750 переходов, 1785 рендеров и статические проверки прошли; второй физический тап возврата после resume не привёл на карту в пределах тайм-аута. Причина не установлена. В V47 тест явно завершает прокрутку к верхней навигации, проверяет hit-test, ждёт реальной навигации от единственного тапа и сравнивает сохранение при обоих возвратах; при повторении сохраняет диагностику. Игровой код не изменён. Не считать сбой устранённым до браузерной проверки.
- Полный 203-прогон теперь зависит от зелёных быстрых проверок, чтобы не запускать дорогую матрицу на заведомо красном кандидате. Старый незавершённый V46 run может быть отменён при обновлении PR. Не сливать main до полной QA. V39 Safari не перезаписывать.

## V48 — актуальные маршруты вместо повторного сюжетного события
- V47 full CI 44146650851: 193/203, 10 ошибок, 0 page/http errors. Все 30 исходов первого дела и шесть выходов прошли; оба мобильных CI зелёные.
- Стабильный data-choice-target для существующих решений: тесты выбирают реальный видимый вариант по назначению, а не по старой подписи. Для изменённых сюжетных подписей есть отдельные утверждения. Игровой граф и условия доступа не изменены.
- Перепроверены причины всех десяти отказов: пять перевязок при повторном проходе, два маршрута к Риду, реакция Эвелин и цикл с повторным предупреждением, критическое ранение после освобождения Артура. Тесты предупреждают семью ровно один раз, проверяют недоступность повторного предупреждения, одноразовую реакцию, сохранность 11 улик, риск при реальном финальном действии. Все 203 идентификатора сохранены. Адресный preflight 10 сценариев перед полной матрицей; результат ещё не подтверждён. Main и V39 не менялись.

## V49 — восстановление полного QA без ложного зелёного статуса
- V48 mobile 44150568829 PASS. Case001 run 44150568869: быстрые проверки PASS, 203 и preflight SKIPPED: sync классифицировал только HEAD^ (исправление YAML) и потерял предшествующий сюжетный коммит. Теперь используем verified before либо PR base, при отсутствии диапазона полный QA; изменения самого селектора/сценарного workflow тоже требуют полного QA. Добавлены регрессии на многокоммитный PR и отсутствие before. Не считать skipped успешной матрицей.
- Criminal run 44150413842: 39/40 node tests, старое ожидание заголовка архива, перечисляющего ровно два дела. Обновлены статическая и браузерная проверки общей надписи, сохранены отдельные секции №001/002, поручений, испытаний и отсутствие лишней ссылки Дигбета. Игровые файлы в V49 не менялись. Main/V39 не тронуты. Полный QA новой версии ещё не подтверждён.

## V50 — реальная последовательность улик и полная диагностика короткого прогона
- V49 PR 44151966794: scope full, archive/smoke/quick PASS, preflight 5/5 лечения и semantic requirement gates PASS, reaction_once/evelyn FAIL: note выдаётся только в warn, нельзя объединить заранее на складе. Исправлена последовательность: предупреждение один раз → кабинет (объединение note+witness) → Эвелин у соседки (реакция) → повторный визит без реакции → склад без повторного предупреждения. Не менять выдачу улик ради теста.
- Все пять адресных наборов теперь выполняются независимо с точными ожидаемыми ID, даже если один падает; сохраняются JSON/tracebacks/скриншоты в общем QA-артефакте. Полный 203 запуск только при всех 10 PASS. V49 mobile 44151966543 SUCCESS. Criminal 44151955769 ещё работает; игровые файлы V50 не менялись. Main/V39 без изменений.

## V50 release / V51 — common visual language
- V50: full 203/203, preflight 10/10, no page/HTTP errors (44152821954); mobile 44152821996 attempt 2 PASS; criminal 44151955769 PASS, no game-code differences between V49 and V50. Author-approved merge PR #8: main cba573d9865ef25b0584d8f9b7d6fb392c2aeecc, exact tested tree e05c7cd6872984bb86b8704946a67a5d2e359157. Pages 44156040143 SUCCESS. Old main backup/main-before-unified-v45 retained, V39 not overwritten.
- V51 begins from that merge, in feat/criminal-operations-polish-v3 only. A shared stylesheet is loaded by 001, 002 and criminal unified/standalone entries; common warm bronze narrative typography, choice materials, dialogue and inventory frame language, named design tokens. Preserve cold map identity, distinction of danger/disabled/visited decisions, all artwork and story/saves. Case001 wide artwork remains a known artistic difference (no forced crop/stretch). Packaged-browser test compares actual reading metrics in all three modes. Actual physical iPhone and visual screenshot acceptance still pending. Do not merge new changes into main without author approval.

## V53 — единый кабинет и карты
- V51 mobile 44157219327 SUCCESS, criminal 44157219319 SUCCESS, actual common narrative material/readability on Chromium and WebKit, standalone 5 missions, saves intact. V52 art audit 44158204733 SUCCESS: 37 decoded originals (35 wide, 2 portrait), seven comparative sheets; visual review remains pending, no actual candidate approved.
- V53 extends shared portrait visual tokens to district cards, profile overview, common archive, case and criminal folds and navigation; retains map geometry and art, earned/locked and damaged/dead distinctions, all existing routes and records. One CSS layer, no engine/HTML/asset changes. Addressed browser computed-material checks on existing portrait matrix. Main/V39 unchanged. V53 browser QA pending.

## V54 — единый ритм эпизода: инструктажи, подтверждённые открытия, финалы
- V53 44158754708 SUCCESS (mobile five combinations). V54 only shared portrait CSS and addressed browser assertions. Standardized briefing rule cards/primary actions, persistent verified receipt materials and final report frames across three modes. Preserves ending-specific moods, sequence, local saves, awards, timers, and existing navigation. Criminal brief has separate visual treatment for its own prose; no extra overlay. Browser checks compare first/second actual briefing and earned receipts, criminal earned toast and persistent ending receipt, with existing no-repeat and save tests retained. Main V50 and Safari V39 unchanged. V54 QA pending, visual and physical Safari acceptance pending.


## V55 — выбор героя, живые показатели и рабочее досье
- V54 mobile 44159834336 and criminal/unified 44159834678: SUCCESS, both completed. Verified stable main cba573d9865ef25b0584d8f9b7d6fb392c2aeecc and V54 branch 60bc1834051957a1fd8addf4f59f43b976a5a132 before editing.
- V55 extends the existing portrait-only visual layer: common selected/unselected hero covers and portrait frames; fixed criminal hero identity retains its own semantics; numeric status readability, explicit preserved wounded distinction; working dossier/inventory/journal materials; consistent consequence sheet and removes nested resource-chip decoration. No changed engine, hero choice logic, evidence ownership, board matching, health values, navigation, art or saves.
- Browser assertions use the two actual hero pickers and compare computed selected/unselected materials, check case pulse, board and criminal inventory/hud/HP on the existing matrix, retain existing touch/save/board tests; additional hero-picker screenshots. Pending remote QA and visual inspection. Case001 portrait audit still not artist-reviewed. Main V50 and Safari V39 unchanged.

- V55 art follow-up: downloaded and visually inspected all 7 Case001 inventory comparison sheets, 37 scene rows. Initial human-style composition triage in docs/case001-portrait-adaptation-v1.md: safe-reframe 12, outpaint 18, keep-portrait 2, keep-wide 5. No image candidate or source art installed; gallery sizes insufficient for final clue/pixel review. Codex first reframe batch specified; don't block other interface work.


## V56 — ясный переход между решением и сценой, рамки без кадрирования
- V55 criminal/unified CI 44161564047 SUCCESS on fa614a4b4cee33bd6e8f7999a0ea8e888fdc1562; art follow-up f766b84f54ccbac3a26b526acb265f7d9596c216 docs only.
- Case001 decoded source frame now follows original aspect ratio at full available width; no extra blur of duplicate art or fixed-height letterbox after decoding. Loading/error fallback retained. No original artwork/crop choices changed. Shared captions/read/decision action presentation and first-case numeric pulse readability across readers.
- Criminal reader used to display destination scene title/act while the previous decision receipt was still open. During the existing receipt phase show origin scene and act, explicitly marked outcome; ack shows destination. Engine, event, confirmed saved bytes, HP, rewards, available choices and navigation handlers not changed. On reload existing receipt semantics preserved.
- Existing browser matrix now asserts actual original/display Case001 ratio and fit, status typography, Case002 read action, actual receipt origin title, destination after acknowledgement and identical saved state; retains existing full criminal route checks. Remote QA pending; no new deployment/main change. Gallery review is not visual acceptance of artwork variants.


## V57 — обратимый переход к решениям, навигация во время чтения
- V56 44162783794: pure engine/persistence/static and unified package steps green when checked, browser step in progress. Not marked accepted.
- Case001 uses the existing SCENE/DECISIONS nav pair for a transient return to the reader's exact viewport anchor, like the Case002 reading detour. Repeated taps to decisions do not replace the bookmark. Clear after return, scene title mutation, leaving the case, or changed portrait width; no save/engine keys. Second scene tap still jumps to the heading. Existing read-scene control focuses its real visible dialogue/paper before scrolling; no new destinations.
- Harmonized portrait bottom-bar materials, bookmark signal and focus states; improved three existing criminal navigation touch targets without adding any menu buttons. No mechanics, state, rewards, artwork, export, or map transitions changed.
- Extended existing legacy unified chromium/webkit test with real touch reading/choice/return, exact viewport and unchanged serialized save. Existing mobile/engine regressions retained; remote QA pending. Main and old Safari untouched.


## V58 — достоверные финалы и возвращение в игровой мир
- V57 mobile 44163492013 SUCCESS; V56 44162783794 superseded/cancelled after engine and package steps succeeded. V57 unified 44163491996 still running at last observation.
- Case001 report now reads validated record/reward archive status from the existing hub, never writes/retries. Confirmation requires the exact attempt and a proven combination. Damaged/unavailable/partial states do not promise a reward; sidebar decisions label becomes outcome in terminal scenes.
- Case002 player-facing recap no longer uses draft/technical node labels in its report or new reward; campaign entry's final action returns directly to Digbeth using existing map link, isolated entry retains hero selection. No new campaign link, no changed story, reward key or archive bytes.
- Criminal chronicle opened from a saved final gets a temporary return point, filtered to that mission. Exact raw slot/attempt validated before reopening; changed/unavailable slot refused, no memory-only bookmark. Existing idempotent resume, no award reissue. Map/menu/other entry clears bookmark.
- Browser matrix extended: Case001 terminal display with explicit synthetic archive-damage fixture, same existing real Case002 route completed to map with exact saved bytes, CR01 confirmed final/chronicle/return with byte-identical slot/ledger. Remote browser results pending; no Safari publication/main change.


## V59 — связность карты, досье и личного профиля
- V58 44164904955 and 44164904959 SUCCESS (unified and mobile, real Chromium/WebKit touch scenarios).
- Profile now displays active saved slots for Case001, Case002 and criminal missions separately from accumulated confirmed terminal records and unique stamps; slot damage remains separate from archive damage. All slot queries read-only and use existing validators; no new keys. Never treats inaccessible API as zero when absent.
- Detective district progress explicitly counts current character slots, not cumulative archived completions. Corrupt slots no longer show the empty-state message; valid active slots remain visible alongside warning. Refresh on actual map visibility. Dossier no longer exposes internal Case001 scene identifier in in-progress label.
- Added pure unit test for active slot and corruption independence without writes, existing combined browser flow extends to profile and dossier, portrait layout check. No new menu links, no new story/mechanics, no main/Safari publication. Remote acceptance pending.


## V60 — визуальная ревизия по реальным браузерным снимкам
- Reviewed actual V58 WebKit screenshots from CI artifacts 14364747904 and 14366220196: common home/map/profile/archive/dossier, Case001 first scene, Case002 receipt, CR reader/final, narrow 320px home/profile/archive/trial. V59 mobile 44167940899 SUCCESS; unified 44167940985 was still running at initial review. These are not new V60 renders.
- Profile visual hierarchy: original illustration and identity retained; active/cumulative story overview now above trial stats; rank moved into trial section with original IDs and updates. No lost rank, metrics or archive links.
- Case001 screenshot showed whole reader dimmed behind opaque dock during entry; eliminate translucent full-screen entry in portrait as already done for trials/archive; retain scene effects. Include Case001 in compact internal header rules to address clipped logotype/action collision. 
- CR had residual blue-green full-page ground and top navigation despite warm cards; unify portrait neutral warm canvas, top buttons, archive cards and caption. Do not alter map art, risk/locked/return semantics or existing controls.
- Add actual style/geometry checks and settled Case001 header capture; profile order across current mobile matrix. Local package obtained from V58 but browser blocked file:// and localhost (ERR_BLOCKED_BY_ADMINISTRATOR); use CI WebKit/Chromium. No actual V60 visual acceptance yet; no main or pinned release changes.

## V61 — устранение блокеров приёмки V60
- V59 mobile passed; unified cancelled by V60 after engine/package checks. V60 mobile 44169021386 failed on the obsolete exact compact-header selector assertion; V60 unified 44169021478 passed engine/package and all CR width/private/quota browser checks, then failed Case002 read button geometry assertion. No evidence of engine failure. Exact geometry was not logged; root cause of the latter is not proven.
- Static contract now tests the actual compact-header scope membership including Case001, rather than the previous literal selector. Real reader target minimum grows 48→50 px across all three modes, preserving the 48 px acceptance criterion. Browser test waits for visible/released control, reports measured height, layout height, width, radius and transform; keeps strict geometry assertion. No tests removed.
- Cross-mode integrated smoke now runs before the slower exhaustive CR mobile routes to expose UI regressions earlier; shared CSS/route/finale path filters added. No new broad styling until green. Main and pinned Safari unchanged.

## V62 candidate — различимость решений и единство заголовков
- V61 mobile run 44170226435 SUCCESS; unified run 44170226352 still executing when candidate prepared. Do not cancel this run to submit the candidate.
- Shared reader heading/speaker typography on portrait only, existing content and layouts preserved. Normal decisions stay bronze, already displayed injury risk gets amber edge, already signalled lethal risk in Case002/CR gets red edge. Disabled actions retain their own style; Case001 still warns of possible injury, not a fabricated accurate mortality estimate.
- Tiny render-only metadata added from existing calculated risk in Case001 and CR; no altered engine values, decisions or probabilities. Case001 synthetic canal fixture verifies warning before/after riskSeen, CR existing route check compares visual border and metadata with actual engine risk. Tests not run for this candidate yet. Main/pinned Safari unchanged.


## V63 — читаемая доска и единый порядок игрового журнала
- V62 unified 44171260860 SUCCESS including legacy integrated reader and risk/route tests. V61 mobile 44170226435 SUCCESS. No new V62 mobile workflow (existing path filter).
- Case001 tiles add explicit selected/compatible labels and accessible linked-clue names, alongside existing visual cues; repeat tap already clears selection and is now explained. Existing matched pairs, storage, deduction receipts unchanged.
- Case002 selected pair token explicit, existing confirmed pair feedback distinct, journal uses actual scene titles rather than player-facing technical IDs. Reversible links/data IDs unchanged. CR journal renders a reversed copy of existing history, newest first with true ordinals and empty guidance; no mutation, revision or route changed.
- Added existing-flow browser proofs for selection, clearing, linked cards, Case002 journal and selection without save change, CR ordinal and save equality. All styling scoped to portrait; test result pending. Main and pinned Safari untouched.

## V64 — точный переход к итогу и карте
- Case001 terminal quick deck's existing outcome action seeks the actual final report (or visible outcome fallback), not unread notices/replay below it. Active section follows that same target; retain existing temporary reading return and independent evidence/award controls. No new in-game navigation.
- Final map action delegates to existing Case001 back action and focuses the correct district pin, explicitly selects Small Heath only if necessary. No saved progress or reward changes.
- Existing synthetic terminal proof now checks focus and active tab on report and exact raw slot through direct map return, restores all fixtures. New screenshot at the outcome. V63 remote acceptance was still running at candidate preparation; do not supersede unfinished QA. Main/pinned Safari unchanged.

## V65 — согласованность карты и профиля (кандидат)
- V63 run 44172753873 / job 134355919585 success. V64 fast-forward to work branch at 02edd4cc97f2b1d1de9bbb627ec5768201eefa84; acceptance 44174649735 started.
- Map distinguishes missing raw slots from stored JSON null, malformed values and unavailable storage. Case001 active status now uses existing engine hasProgress, matching profile; a contradictory nonterminal ending is not an active route. Neutral entry wording where only problematic slots exist; no engine, save or reward changes.
- Profile surfaces finished current slots separately from historical completions and unique rewards across all three story modes. Browser proof compares actual profile and Small Heath/Digbeth counters, hides summary for unavailable district, verifies stored fixture bytes and restores them; unit proof separates finished slots from history. Candidate only, no browser result yet. Main and pinned Safari untouched.

## V66 — явный выбор сохранения и завершение навигации (кандидат)
- V64 run 44174649735 / job 134362644725 SUCCESS; V65 fast-forward to working branch 3f42df6d7680e6f3175ba43ea7b574dc4a7d54b0; run 44175643118 started. V66 held separately while V65 acceptance runs.
- Case001 hero picker now distinguishes active, finished, absent, damaged and unavailable slots. No implicit overwrite on ordinary entry; explicit replacement requires confirmation, checking the raw slot again after briefing and before launch. No save schema/engine/reward change; existing deliberate restart stays available. Unreadable storage blocks entry rather than presenting a false empty slot.
- Case002 treats existing empty-string bytes as replacement requiring confirmation, labels completed saves as reports. General archive navigation copy no longer says two cases. Trial screen switching hides all actual .screen sections rather than a stale enumerated list; profile trial history refreshes on storage/pageshow and displays unknown legacy answer counts without inventing zero answers.
- Added addressable browser proof for both cancelled replacements and trial entry/exit after story archive, exact detective raw slots preserved. Candidate only; browser CI pending. Main and pinned Safari untouched.

## V67 — ревизия реальных мобильных кадров (кандидат)
- V65 CI 44175643118 / job 134366131773 SUCCESS. V66 fast-forward at b19e5a5437fdd8a99e2872a265a5900d8a91cbd0; iPhone run 44178313445 SUCCESS, integrated 44178312600 running at time of review.
- Inspected real V65 WebKit/Chromium artifact 14368859037. WebKit profile screenshot was blank in the hero artwork area; Chromium displayed the original. Removed deferred lazy loading from this single existing profile asset, added decode/geometry proof before capture; do not claim a persistent iPhone reproduction from one screenshot.
- Case001 portrait screenshots showed a second Menu in the audio controls while the header already has Menu, plus a legacy footer Home action. Hide those duplicate actions in portrait and keep one visible ordinary Menu, with confirmation on trusted direct activation. Existing explicit reset, map, profile and internal safe redirects remain. Browser proof now uses actual visible header action, cancels/accepts exit and checks unchanged save bytes.
- Artwork adaptation separately reviewed from original V65 package artifact 14370102417. No original art changed, no V50 main or pinned Safari changes. V67 held separately until V66 integrated CI finishes.

## V68 — reviewed rescue-frame integration and precise browser failure diagnostics
- V67 HEAD ba10b086eca88073aebad4bc4b13f6674924ba47: iPhone run 44179573509 SUCCESS; integrated 44179573459 failed in legacy_smoke on WebKit. Chromium cross-mode route passed. Final stack TargetClosedError during parity fixture cleanup masked the earlier point of failure; cause not established. No failed assertion removed. Add page crash/close events, stage traces and exception-preserving cleanup; all mode transitions, byte checks and parity assertions remain mandatory. V67 not fully accepted.
- Art pilot 44179494719 SUCCESS (artifact 14370659316). Use the identical center 4:5 composition of endingRescue-approved.webp through a scene- and image-specific CSS rule; original dimensions 1448×1086, central crop equivalent to the pilot within subpixel rounding. No new binary dependency, no replacement of original, no crop of the other scenes. Existing fallback remains. Verify actual geometry, natural dimensions, no horizontal overflow, unchanged save bytes at 320/390/430, screenshot the portrait candidate; verify contain after restored normal scene. Real iPhone still not tested.

## V69 — stop redundant hidden-screen rendering across all campaign entry paths
- V68 integrated run 44180552406 / job 134383410268 FAILED. Pipeline and Chromium full route passed, WebKit reached exact parity assertions incl. Aston; real touch #homeBtn timed out (visible/enabled/stable; scrolled into view), then page crash. This supersedes the earlier ambiguous cleanup stack. Exact rendering/runtime cause not yet established.
- Idempotent screen visibility across trials, maps, shared archive, both Case001 navigation paths, personal profile and criminal mode. Already hidden screens no longer receive redundant hidden attribute writes and observer work. Preserve all navigation guards, save schemas, engine outcomes, content and reward logic. Case001 portrait display releases its duplicate decoded image on hide and reloads same original when visible, including V68 rescue composition. Map reveal request invalidated on next pointerdown, always immediate. Profile overview no longer rebuilt twice for storage-all and pageshow. No screenshot/test exclusions or retries added. Exact map->menu->profile touch remains with new idle-case mutation and image-release assertions. Root cause not proven until repeat CI; main and pinned Safari unaffected.

- V69 mobile static run 44181842467 failed only because V17 source assertion expected the literal behavior:"auto" replaced by stronger instant reveal. Align assertion with new instant behavior and cancellation token; preserve existing no-smooth and scroll-distance conditions. Tests-only follow-up triggers mobile QA without cancelling integrated run 44181842384.

## V70 — portrait composition and reader rhythm
- V69 general run 44181842384 / job 134387920478 SUCCESS and mobile run 44182121726 / job 134388907635 SUCCESS. Fresh V69 artifact 14373625885 inspected: profile art painted in WebKit; rescue frame decoded but screenshot automatic crop overlaid fixed nav, so require real viewport centering and unobstructed bottom before art capture. Previous exact WebKit failure route now passed; root cause not proven independently.
- Eight further artistic comparisons; individually reviewed three crops: interview/bribe square and pretend 4:5. Hold five others, including the special Eleanor camera scene (cannot lose camera), and candidate death square not installed. No new binary, no art overwritten. See portrait adaptation ledger. Keep natural original for all unmatched images.
- Move reading action after artwork (DOM order), reduce duplicate top status height, dock music/effects at end of Case001 in portrait. Same touch controls and handlers, old landscape placement retained. Browser test verifies reading action and audio order, all three frame aspect/position variants at 320/390/430, normal art restoration and exact slot bytes while viewing; center previous rescue before screenshot. No physical phone verification, no main/production release.

## V71 — isolated fixed-viewport art matrix, compact reader and map exit
- V70 mobile 44183912975 SUCCESS; integrated 44183912930 failed at the same WebKit real #homeBtn tap after Aston, following all four art geometry checks and Chromium full route. The previous V69 success does not prove permanent resolution. Inspected six V70 cropped captures, all preserve plot-bearing details and accepted for visual composition, not physical phone acceptance.
- Separate 2 engines × 3 fixed widths × 4 frames in case001_art_browser.py, independent browser processes and no resize of the long legacy route. Existing long map/profile parity/terminal/route assertions retained; its 390px rescue geometry stays. Added byte snapshots of all case/record/reward slots during art viewing, unobstructed captures and real map/menu/profile return at every width. No failed retries or skipped engines. This separates test-session resource accumulation from genuine regression without hiding a browser crash.
- Game show() hides old screen first and resets scrolled atlas before revealing cabinet; keep same guarded actions and updateStats. Hidden cabinet animation fully released, active menu visuals unchanged. Hide duplicate chapter/location labels in portrait and compact HP metric, full injury block unchanged. Hypotheses only; repeat CI needed. No main/production release.

## V72 — continuously reachable map header and criminal scene readiness
- V71 mobile 44185638428 SUCCESS; integrated 44185638420 FAILED in long WebKit scroll_into_view_if_needed on Menu after Aston, with renderer crash. All 24 fixed-width frame assertions and 6 real map/profile returns SUCCESS before long route; Chromium entire route passed. Not a resolved WebKit issue or physical iPhone proof.
- V69 artifact 14373625885 review: CR02 terminal capture blank in art area; other four final frames painted. Criminal art eager/sync decode hint, loading/ready/unavailable and cached failure handling; capture proof waits for decode and paint. No binary changes. Two cross-mode portal buttons per map; unified criminal contextual Map/Chronicle, local Menu hidden but retained for bridge; standalone unchanged. Visible controls tests use shell Menu, all guards/save assertions retained.
- Sticky real header on maps only, no blur; six isolated scrolled map hit tests and long route hit-test. Keep atlas footer exit. No new mechanics. Candidate pending QA; main and old Safari untouched.


## V73 — единый выход с карт и конечное ожидание кадра
- V72 HEAD `3b08a054e4391cf2c28de46d985b574ce6ced109`; run 44187201864 / job 134406788152 SUCCESS: 24 fixed-width art checks, 6 fixed-width map returns, full Chromium/WebKit legacy route including Aston, eight viewport touch suites and standalone all five missions. Artifact 14374478497 visually inspected: five clean endings per browser including CR02 all show images; profile art visible. Full-page atlas captures still showed the legacy districtBack button.
- Hide only duplicate districtBack in portrait CSS; retain its desktop event binding. Add targeted scroll margin for case and mission actions. Add actual scrolled map hit tests, normal shared Menu touch, screenshots and overflow checks at existing viewport matrix; retain full legacy route and save checks. Update iPhone assertion (also triggers existing mobile workflow).
- CR story image waits at most 12 seconds while page timers are running, then existing nonblocking fallback (status announcement). Timer clears on successful decode, error, render replacement or close. No game-state/manifest/reward change. Added real request abort and held request acceptance in fresh browser contexts; verify unchanged save/ledger bytes before genuine Start and scene continuation. No retry or removal of previous checks.
- Local downloaded package syntax checked; local Chromium navigation refused ERR_BLOCKED_BY_ADMINISTRATOR. Remote verification pending. Main and pinned Safari remain untouched.
