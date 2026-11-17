# Дело №001 — адаптация оригинальной художки к портретному телефону (V52)

Базовый утверждённый main: cba573d9865ef25b0584d8f9b7d6fb392c2aeecc. V51: 1109e7bf19f5b5a2477ef609cdedaa07caddfb14. Визуальная адаптация — отдельная рабочая задача, не замена сценария. 37 реально используемых сцен по `const ART` в case-v14.js, а не устаревшему SCENE_MANIFEST_v5.json. Перечень ниже — предварительные группы по сюжетному назначению, НЕ результат просмотра изображений. Не принимать кропы автоматически.

## Задание для Codex / художественного исполнителя

1. Запустить `python tests/case001/portrait_art_audit.py` (Pillow). Галерея сравнивает полный оригинал и центральную пробу 4:5, показывает долю сохранённой площади, размеры и SHA-256. Проба — только диагностика. Не пересохранять исходники и не добавлять тестовые картинки в игру.
2. Просмотреть каждую из 37 пар в реальном масштабе 320–430px. Заполнить решение по каждому scene ID: keep-wide / safe-reframe / outpaint / needs-artist. Если нет инструмента визуального просмотра или редактирования, пометить соответствующий блокер, не выдавать автоматический кроп за художественную приёмку.
3. Для keep-wide сохранить оригинал. Для safe-reframe подобрать индивидуальную область по оригиналу, без растягивания. Для outpaint сохранять персонажей, объекты, композицию и цвет, достраивать только окружение. Формат кандидатов WebP 720×900; отсутствие читабельной улики, некорректные пальцы/лица или изменение сюжетного события — отклонение. Не создавать запечённые UI надписи. Если требуется генерация, следовать правилу автора: одна новая иллюстрация за сообщение; массовую генерацию не считать разрешённой.
4. Отдельная директория кандидатов assets/case001/portrait-candidates/ с исходным hash, новым hash, координатами кадрирования (если применимо), обоснованием и статусом review. Никогда не перезаписывать оригинальные 37 файлов. Не добавлять кандидатов в сборку до приёмки. Начать с репрезентативной группы intro/envelope/widow/confront/endingRescue, затем расширять по фактическим результатам. Никаких подмен сюжетных кадров случайными аналогами.
5. После художественного принятия подключать отдельный мобильный вариант с fallback на оригинал только по точному scene ID или уникальному filename; оставить desktop и оригинальный ART без изменений. Проверить реальное декодирование, отсутствие растяжения и отсечения важного содержания, PNG скриншоты 320/390/430, Chromium/WebKit. Сохранения, флаги, награды, механика, Дело №002 и CR01–CR05 не меняются.
6. Работать в отдельной ветке от актуальной проверенной базы, вернуть отчёт и PR, без merge/publish. Если нужна новая художественная версия, подготовить точное ТЗ для генератора; не делать вид, что Codex имеет доступ к недоступному инструменту. Владелец проекта не переносит файлы вручную.

## Реестр по действующему ART

| Scene ID | Оригинал | Предварительная группа |
|---|---|---|
| canal | assets/case-scenes/canal-approved.webp | Панорама: оставить полный кадр до просмотра; не подменять ради формата. |
| yard | assets/case-scenes/yard.webp | Панорама: оставить полный кадр до просмотра; не подменять ради формата. |
| escort | assets/case-scenes/escort.webp | Панорама: оставить полный кадр до просмотра; не подменять ради формата. |
| envelope | assets/case-scenes/envelope.webp | Проверить предмет/улику и читаемость; вертикальный кроп только при сохранении всего значимого. |
| searchOffice | assets/case-scenes/searchOffice.webp | Проверить предмет/улику и читаемость; вертикальный кроп только при сохранении всего значимого. |
| unlock | assets/case-scenes/d17-unlock.webp | Проверить предмет/улику и читаемость; вертикальный кроп только при сохранении всего значимого. |
| warehouse | assets/case-scenes/d17-warehouse.webp | Проверить предмет/улику и читаемость; вертикальный кроп только при сохранении всего значимого. |
| heroFinn | assets/case-scenes/heroFinn.webp | Проверить предмет/улику и читаемость; вертикальный кроп только при сохранении всего значимого. |
| heroEleanor | assets/case-scenes/heroEleanor.webp | Проверить предмет/улику и читаемость; вертикальный кроп только при сохранении всего значимого. |
| heroSamuel | assets/case-scenes/heroSamuel.webp | Проверить предмет/улику и читаемость; вертикальный кроп только при сохранении всего значимого. |
| confession | assets/case-scenes/confession.webp | Проверить предмет/улику и читаемость; вертикальный кроп только при сохранении всего значимого. |
| intro | assets/case-scenes/intro.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| widow | assets/case-scenes/widow-home.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| interview | assets/case-scenes/interview-kitchen.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| office | assets/case-scenes/office-approved.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| warn | assets/case-scenes/evelyn-warning.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| bribe | assets/case-scenes/bribe.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| sneak | assets/case-scenes/d17-sneak.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| listen | assets/case-scenes/listen.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| reed | assets/case-scenes/reed.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| reedProof | assets/case-scenes/reedProof.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| accuse | assets/case-scenes/accuse.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| pretend | assets/case-scenes/pretend.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| pump | assets/case-scenes/pump.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| rescue | assets/case-scenes/rescue.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| confront | assets/case-scenes/confront.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| trade | assets/case-scenes/trade.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| expose | assets/case-scenes/expose.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| pressure | assets/case-scenes/pressure.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| heroJack | assets/case-scenes/heroJack.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| heroVictor | assets/case-scenes/heroVictor.webp | Сверить лица, одежду, место, действие; при необходимости расширение кадра, а не перерисовка. |
| endingRescue | assets/case-scenes/endingRescue-approved.webp | Сохранить исход и не добавлять выбранного героя в нейтральный финал; особая ручная приёмка. |
| endingEvidence | assets/case-scenes/endingEvidence.webp | Сохранить исход и не добавлять выбранного героя в нейтральный финал; особая ручная приёмка. |
| endingDeal | assets/case-scenes/endingDeal-approved.webp | Сохранить исход и не добавлять выбранного героя в нейтральный финал; особая ручная приёмка. |
| endingTruth | assets/case-scenes/endingTruth.webp | Сохранить исход и не добавлять выбранного героя в нейтральный финал; особая ручная приёмка. |
| endingPower | assets/case-scenes/endingPower-approved.webp | Сохранить исход и не добавлять выбранного героя в нейтральный финал; особая ручная приёмка. |
| endingDeath | assets/case-scenes/endingDeath.webp | Сохранить исход и не добавлять выбранного героя в нейтральный финал; особая ручная приёмка. |

Готовность: реестр создан, проверка исходных файлов и галерея должны пройти в отдельном CI; ни один вертикальный вариант пока не принят/установлен.


## V55 — визуальная диагностика всех 37 кадров (17.11.2026)

Просмотрены все семь сравнительных JPG из CI 44158204733, artifact 14362156735 (`case001-portrait-art-inventory`). Видны исходные композиции и диагностический центральный кроп 4:5. Это просмотр уменьшенных галерей, не попиксельная приёмка исходных WebP, не скриншоты реального интерфейса и не утверждение новых вариантов.

Решение перед техническим проходом: safe-reframe: 12; outpaint: 18; keep-portrait: 2; keep-wide: 5. Для outpaint сохранять оригинал в игре до принятия отдельного варианта; генерация не обязательна для текущего релиза. Для safe-reframe подобрать индивидуальный кроп в оригинальном разрешении и перепроверить сюжетные метки, руки, лица, количество людей, предметы и контекст; не считать центральную пробу готовым файлом. Если кандидат не проходит, keep-wide/outpaint. Keep-portrait сохранять исходное соотношение, не превращать подходящие портреты 3:4 в 4:5 только ради стандарта. Ни один исходный файл не менялся.

| Scene ID | Решение | Composition review (en) |
|---|---|---|
| intro | safe-reframe | Woman, envelope and doorway stay in frame; retain enough wet street/industrial setting. |
| envelope | safe-reframe | Preserve whole D-17 seal/mark; bias to envelope, not background; check all plot-bearing marks. |
| widow | safe-reframe | Evelyn's face, extended hand and D-17 tag remain visible; protect hand and tag. |
| interview | safe-reframe | Center test cuts Evelyn at the left. Shift left to preserve face, hands and meaningful table items; fall back wide if needed. |
| warn | outpaint | Empty chair, window, stove and letter establish the altered kitchen; do not cut to only the letter. |
| heroJack | keep-portrait | Original 900×1200 already portrait. Keep full cap/face; no compulsory 4:5 crop. |
| heroFinn | outpaint | Ledger and D-17 warehouse label extend across the frame. Center test cuts ledger and side context. |
| heroEleanor | safe-reframe | Try individualized bias toward invoice and D-17 lettering; center test cuts document edge. Require full key marks/stamps. |
| heroVictor | keep-portrait | Original 900×1200 already portrait. Keep full cap/face and coat. |
| heroSamuel | outpaint | Valve and access doorway both relevant; center crop cuts valve and surrounding mechanics. |
| office | outpaint | Document and office environment are split sideways; retain both, avoid cutting D-17 markings. |
| searchOffice | outpaint | Charred papers, fire and surrounding desk matter; central trial truncates document context. |
| canal | keep-wide | Canal, industrial skyline and D-17 entrance establish geography; wide composition is intentional. |
| bribe | safe-reframe | Shift toward man, map and purse; retain face, both hands and exchange context. Reject if cropped. |
| sneak | outpaint | Paper in foreground and D-17 facade span width; maintain both. |
| unlock | keep-wide | Door, lock, D-17 facade and nearby crate/entry context spread horizontally; keep original until a better variant is justified. |
| warehouse | outpaint | Preserve both ledgers and loose document, not only the centered book. |
| listen | outpaint | Center trial cuts the second conversational participant; retain both and the listening vantage. |
| reed | safe-reframe | Face, clasped hands, desk dossier readable together; preserve uniform and hands. |
| reedProof | outpaint | Reed and document both essential; center trial cuts right side of paper. |
| accuse | outpaint | Center trial removes background person and extended hand; maintain the full action. |
| pretend | safe-reframe | Reed and handwritten note in center; preserve gesture and note as legible plot element. |
| confession | outpaint | Face, extended hand and held document span image; center trial loses most of document. |
| escort | keep-wide | Escort at station entrance and surrounding route; keep station signage/setting. |
| pump | outpaint | Wide two-person composition shows bound Arthur and armed Crane. Central crop removes Arthur's face. |
| yard | keep-wide | Establish the yard and stairs/entrance; do not lose the location geography. |
| rescue | outpaint | Arthur and Crane, gun and physical movement must survive; center trial cuts both sides. |
| confront | outpaint | Arthur, Crane and document need to remain in one frame; central crop removes Arthur's face. |
| trade | outpaint | Center trial drops background Arthur; keep both people and document exchange. |
| expose | safe-reframe | Crane reading documents is dominant; bias toward face, both hands and full plot-bearing dossier. |
| pressure | outpaint | Reaching hand, documents and Crane are parts of one action; central frame trims papers. |
| endingRescue | safe-reframe | The 4:3 original centers Evelyn and Arthur's reunion; preserve both faces, embrace and enough kitchen. |
| endingEvidence | outpaint | Sealed papers, photographs and stained cloth form one evidence still life; center crop cuts side objects. |
| endingDeal | outpaint | Keep Arthur, Crane, burning D-17 document and the fire; center crop loses Arthur and part of Crane. |
| endingTruth | keep-wide | Public scene, press/documents and multiple people collectively establish ending; original width helps. |
| endingPower | safe-reframe | Preserve complete evidence folder, title, stamp and photograph; adjust crop to avoid clipping folder. |
| endingDeath | safe-reframe | Shift toward the full cap and pool, retaining industrial background; center sample cuts cap's right side. No added people. |

### Пакет Codex: первая волна
- Отдельная ветка от актуальной проверенной рабочей базы, никакого merge/publish. Считать данный реестр художественными направлениями, а не утверждением кандидатов. Сохранить SHA всех оригиналов. Подготовить индивидуальные координаты и кандидаты только для safe-reframe, начать с intro/envelope/widow/endingRescue, затем остальные. На каждой паре показать оригинал целиком и вариант в реальном масштабе 320/390/430; скачать/декодировать реально доступные оригиналы. Для outpaint оформить индивидуальное ТЗ без подмены кадра, оставлять оригинал до дальнейшей работы. Не обещать генератор при отсутствии доступа; не массово генерировать. Для keep-wide и keep-portrait не создавать бессмысленные дубликаты.
- Не трогать активный ART, screenplay, engines, progress/rewards, V50 main и V39. Отчёт с индивидуальными координатами и хешами, сравнительные PNG/JPG, кандидаты отдельно; только после художественной приёмки отдельный интеграционный PR с fallback и Chromium/WebKit. Читаемость документов оценивать по оригиналам, уменьшенные галереи не доказательство читаемости.


## V67 — pilot from original approved WebP bytes (17/18.11.2026)
Reviewed the four originals from unified package V65 artifact 14370102417 and individualized 4:5 crop diagnostics at 720×900. Not generative artwork; no stretching or original replacement. Coordinates are zero-origin Pillow (left, top, right, bottom), exclusive right/bottom.

| Scene | Source dimensions | Crop trial | Decision |
|---|---:|---|---|
| intro | 1672×941 | (510,0,1262,940) | Reject this crop: envelope and woman survive, but most wet industrial street, signs/door context disappear. Keep original; consider outpaint or less narrow format. |
| envelope | 1672×941 | (465,0,1217,940) | Reject: D-17 seal stays visible but envelope edges and adjacent papers are clipped. Keep original. |
| widow | 1671×941 | (470,0,1222,940) | Reject: face, hand and tag survive, but photograph on table and contextual kitchen objects lost. Keep original. |
| endingRescue | 1448×1086 | (290,0,1158,1085) | Accept as candidate only: both faces, embrace, hands, injury, stove/window context remain; peripheral lamp/table lost, not necessary to this ending. Reviewed static scale 320/390/430 px. Real browser integration QA still required. |

Source SHA-256 values are embedded in scripts/case001-portrait-pilot-v1.py; it verifies bytes, dimensions, and crop size before export. Candidate output is 720×900, WebP quality 92 method 6. Local prototype candidate SHA-256 d3712533d2f6f7d7070fca0a1269f4ec68023379eb5f8ca7070ac2d97e7f27a6 (encoder versions may differ; report actual output hash). Script exports only the accepted candidate and comparison sheets, no game or original files. Separate branch dedicated to reproducible art experiment. The existing ART remains untouched. Do not infer acceptance of other 33 scenes from this pilot. No actual phone/browser integration of candidate yet.
