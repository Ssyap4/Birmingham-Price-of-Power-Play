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
