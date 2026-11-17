# V15 — Единая живая Safari-бета всей игры

Дата 17.11.2026. Это **первый отдельный HTTPS-показ объединённого проекта** V12–V14: не новый сюжетный движок, не `main` и не прежний `preview/unified-campaign-safari`.

## Актуальная ссылка

**https://birmingham-unified-v15-safari.vercel.app/**

Открывать в Safari на iPhone в обычной портретной ориентации. В этой версии доступны обновлённое главное меню с V12 WebP, две существующие композиции, детективная карта пяти районов с Делами №001 и №002, пять криминальных поручений CR01–CR05, общий архив, достижения, досье и локальный профиль. Вход во второе дело из Дигбета открывает `/preview/case002-prototype/index.html?from=map` **на том же HTTPS-домене**, не на чужом сервисе. Сохранения привязаны к браузеру/домену; это **не серверный публичный профиль**.

## Точные Vercel параметры

- Team: `team_HQEjI82hZplvw449udSmyKrE` (`lillineeb51-9659`).
- **Новый самостоятельный проект:** `birmingham-unified-v15-safari`, ID `prj_4zubRzlXYeM0X7TfFl8iprm2yl2E`; другие проекты `birmingham-criminal-v3-safari` и `birmingham-case002-safari-beta` не изменялись.
- **Deployment:** `dpl_BudZmSMU5XmtbTfRw4Fdgf2TdaW9` — `READY`, основной алиас `birmingham-unified-v15-safari.vercel.app`.
- GitSource: GitHub `Ssyap4/Birmingham-Price-of-Power-Play`, ветка `feat/criminal-operations-polish-v3`, **строго закреплённый опубликованный SHA `6207bdf86a18dc96e216738a364901c6d3dfeecb`**. Более поздние коммиты только тестов/документации **не меняют развернутый сайт**.
- Build: `node deployment/campaign-unified-release.js`; output: `campaign-unified-dist`; framework: `null` (статический HTML/CSS/JS). Логи: **PASS 89 scenes / 102 approved WebPs, 10 NPC, Cases 001+002, 515 files, 256 references, 43.54 MiB**.
- Важно: Vercel API присвоил `target: production` внутри **нового изолированного V15-проекта**, хотя исходный запрос был для `preview`. Это **не релиз `main`**, не изменение ни одной старой публикации и не объединение веток. Адрес публичен именно в отдельном экспериментальном проекте, защита SSO выключена только для него, чтобы автор мог открыть Safari без входа в Vercel.
- Отдельный проект создать можно `create_project` с `skipGitConnectDuringLink:true`, после чего **прямая `create_deployment` c `gitSource:{type:'github',org:'Ssyap4',repo:'Birmingham-Price-of-Power-Play',ref:'feat/criminal-operations-polish-v3',sha:'<PINNED>'}` работает**, даже если попытка подключить постоянную GitHub-интеграцию через `gitRepository` ранее ответила 400. Не требовать от автора ручной загрузки и не выдумывать отсутствие способности развернуть GitSource. Проверять target и отдельный project ID перед каждой следующей публикацией.

## Доказанная приёмка

- Vercel деплой `READY`, основной URL и `index.html`, фото `assets/cabinet/cinema-home-art-v12.webp`, `audio-v1.js` HTTP **200**.
- **Последний удалённый HTTPS WebKit+Chromium тест:** GitHub Actions [№44003868799](https://github.com/Ssyap4/Birmingham-Price-of-Power-Play/actions/runs/44003868799) — **SUCCESS** на тестовом SHA `f2836a14cef4861da61e74ef5ff31bbdf4339e25`. WebKit 390 px, Chromium 320 px: `home → detective map → Case002 → criminal map → shared archive → profile`, плюс возвраты. `jsErrors:0`, `httpErrors:0`. Проверены доступность обоих старых аудиофайлов, V12 меню, кадров Case002/CR01, runtime V13 и `mobile-runtime-v1.js`.
- Артефакт: `unified-v15-live-safari-proof`, ID `14292969189`, с `report.json` и PNG реальных HTTPS-экранов. Примеры `webkit-390-home.png`, `webkit-390-detective.png`, `webkit-390-case002.png`, `webkit-390-archive.png`. В первоначальном тесте карта Дигбета была снята до decode WebP; после адресной коррекции дождались декодирования `assets/districts/digbeth.webp` — финальный кадр показывает реальную фотографию. **Это был момент раннего снимка, не отсутствующий файл**.
- Прошлый full game CI: [№43997890294](https://github.com/Ssyap4/Birmingham-Price-of-Power-Play/actions/runs/43997890294) SUCCESS для V13; мобильный локальный UI smoke [№44001163029](https://github.com/Ssyap4/Birmingham-Price-of-Power-Play/actions/runs/44001163029) SUCCESS для V14. Полные игровые 105 сцен в live-прогоне **не** переигрывали, т.к. в V15 не менялись движки и сохранения.
- Ветка `main` проверена неизменной: `3dbadc9cf0f60fd5f5fb209fba9c573e7be6c595`; старая `preview/unified-campaign-safari`: `65f1fb9444f84e2117c2bf42669854c628f60356`.

## Дальше

Автор смотрит новую HTTPS-ссылку в Safari и при необходимости сообщает замечания. Не менять V15 опубликованный SHA неожиданно: следующие правки сначала сделать в рабочей ветке и протестировать адресно, затем выпускать **новый отделённый тестовый deployment с точным SHA**, сохраняя прошлый URL/сборку для сравнения, насколько это нужно. Следующие UX-темы: художественная консистентность карточек архива/районов, мобильный опыт реального iPhone/Telegram WebView и точная работа возвратов из Дела №002. Только после приёмки с автором обсуждать `main`.

Внутричатовый счётчик: V15 — **рабочий ответ №9/10**. Следующий ответ №10 — развитие/проверка по новой задаче, ответ №11 — только полный промпт-передача. Чистые вопросы и помощь с UI не входят в счёт.
