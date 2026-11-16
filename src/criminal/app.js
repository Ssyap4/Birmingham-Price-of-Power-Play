(function () {
  "use strict";
  const C = globalThis.CriminalContent,
    E = globalThis.CriminalEngine,
    A = globalThis.CriminalArchive;
  const root = document.createElement("section");
  root.id = "criminalScreen";
  root.className = "screen";
  root.hidden = true;
  root.setAttribute("aria-label", "Криминальные дела");
  document.querySelector("main.shell").append(root);
  let store;
  try {
    store = globalThis.localStorage;
  } catch {
    store = {
      getItem() {
        throw Error("Браузер запретил доступ");
      },
      setItem() {
        throw Error("Браузер запретил запись");
      },
    };
  }
  let state = null,
    raw = null,
    pending = null,
    memory = false,
    notice = "",
    rewardNotice = null,
    mode = "map";
  const esc = (x) =>
    String(x ?? "").replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );
  const btn = (id, text, cls = "") =>
    `<button type="button" data-action="${id}" class="${cls}">${text}</button>`;
  function top() {
    return `<div class="cr-top">${btn("map", "← Карта")}${btn("chronicle", "Хроника")}${btn("home", "Меню")}</div>`;
  }
  function setHash(value) {
    try {
      history.replaceState(
        null,
        "",
        location.pathname +
          location.search +
          (value ? "#criminal/" + value : ""),
      );
    } catch {}
  }
  function open() {
    for (const el of document.querySelectorAll(".screen")) el.hidden = true;
    root.hidden = false;
    document.body.dataset.criminal = "active";
    document.getElementById("homeBtn").hidden = false;
  }
  function confirmPendingLeave() {
    return (
      !pending ||
      confirm(
        "Последний ход рассчитан, но не сохранён. Выход потеряет этот результат. Покинуть поручение?",
      )
    );
  }
  function close() {
    pending = null;
    state = null;
    rewardNotice = null;
    root.hidden = true;
    delete document.body.dataset.criminal;
    setHash("");
    document.getElementById("homeBtn").click();
    document.getElementById("criminalEntry")?.focus({ preventScroll: true });
  }
  function render(html) {
    open();
    root.innerHTML = top() + html;
    root.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        const f = document.createElement("p");
        f.className = "cr-art-fallback";
        f.textContent =
          "Кадр недоступен. История и управление продолжают работать.";
        img.replaceWith(f);
      });
    });
    root.querySelector("h1,h2")?.setAttribute("tabindex", "-1");
    window.scrollTo(0, 0);
  }
  function art(m, sceneId) {
    const M = globalThis.CriminalArt;
    const entry =
      M?.frames.find(
        (f) => f.missionId === m.id && f.scenes.includes(sceneId),
      ) ||
      M?.frames.find(
        (f) =>
          f.missionId === m.id &&
          f.kind === (sceneId?.startsWith("end:") ? "aftermath" : "arrival"),
      );
    return entry
      ? `<figure class="cr-frame"><img src="${entry.path}" width="720" height="900" alt="${esc(entry.alt)}" decoding="async"><figcaption>${esc(m.district)} · ${sceneId?.startsWith("end:") ? "После этой ночи" : "Бирмингем, 1920-е"}</figcaption></figure>`
      : '<div class="cr-art-fallback">Для этой сцены кадр ещё не установлен. Игра доступна полностью.</div>';
  }
  function hero(m) {
    return `<div class="cr-hero"><img src="assets/heroes/${m.hero.id}.webp" width="58" height="72" alt="${esc(m.hero.name)}"><div><b>${esc(m.hero.name)}</b><small>${esc(m.hero.alias)} · ${esc(m.hero.role)}</small></div></div>`;
  }
  function warning(text) {
    return `<div class="cr-warning" role="status">${esc(text)}</div>`;
  }
  function map() {
    mode = "map";
    state = null;
    pending = null;
    rewardNotice = null;
    setHash("map");
    const points = [
        [9, 9],
        [60, 26],
        [8, 41],
        [10, 69],
        [60, 77],
      ],
      icons = ["♜", "⚓", "◇", "▤", "⚒"];
    render(
      `<header class="cr-heading"><span>ПОРУЧЕНИЯ БЛИЖНЕГО КРУГА</span><h1>Криминальные дела</h1><p class="cr-tagline">Пять приказов. Пять человек.<br>Вернутся не все.</p></header><p>Здесь нужно <b>выполнить поручение и остаться в живых</b>. Риск выше, чем в расследованиях. Решения необратимы внутри попытки; каждый ход сохраняется до показа результата, если браузер разрешает запись.</p><div class="cr-map" aria-label="Схематическая карта пяти криминальных районов"><svg viewBox="0 0 360 460" aria-hidden="true"><defs><pattern id="crBlocks" width="36" height="38" patternUnits="userSpaceOnUse"><path d="M4 6h24v24H4z" fill="none" stroke="#584c3b" stroke-width=".8"/></pattern></defs><rect width="360" height="460" fill="#171c1c"/><path d="M18 12L327 20 348 412 279 447 29 414Z" fill="url(#crBlocks)" stroke="#8e7955"/><path d="M50 0Q120 180 210 220T350 460M0 250Q160 180 360 235M180 0Q170 180 120 460M0 370Q180 300 360 320" fill="none" stroke="#64543d" stroke-width="8"/><path d="M5 193Q90 120 171 228T355 270" fill="none" stroke="#315c64" stroke-width="12"/><path d="M5 193Q90 120 171 228T355 270" fill="none" stroke="#9baca6" stroke-width="1"/><path d="M10 335L348 120" stroke="#888073" stroke-dasharray="5 5" stroke-width="2"/><text x="185" y="250" fill="#c4b18b" font-size="14">ЦЕНТР</text><text x="15" y="438" fill="#baa578" font-size="12">С ↑ · СХЕМА ГОРОДА</text></svg>${[
        "CR04",
        "CR02",
        "CR05",
        "CR03",
        "CR01",
      ]
        .map((id, i) => {
          const m = C.missions[id];
          return `<button type="button" class="cr-pin" data-mission="${id}" style="left:${points[i][0]}%;top:${points[i][1]}%"><span>${icons[i]} ${id}</span><strong>${esc(m.district)}</strong></button>`;
        })
        .join(
          "",
        )}</div><p class="cr-small">Север сверху. Канал и дороги показаны схематически. Все адреса поручений вымышлены; это игровая карта, а не исторический план.</p><div class="cr-mission-list">${Object.values(
        C.missions,
      )
        .map(
          (m) =>
            `<button type="button" data-mission="${m.id}"><small>${m.id} · ${esc(m.district)}</small><b>${esc(m.title)}</b><span>${esc(m.hero.name)} →</span></button>`,
        )
        .join("")}</div>${btn("chronicle", "Открыть локальную хронику")}`,
    );
  }
  function brief(id) {
    rewardNotice = null;
    mode = "brief";
    const m = C.missions[id];
    if (!m) return map();
    state = null;
    pending = null;
    setHash(id);
    const slot = A.load(store, id);
    raw = slot.raw ?? null;
    let actions;
    if (slot.kind === "corrupt")
      actions =
        warning(
          slot.error +
            " Исходные байты оставлены на месте. Обычный старт заблокирован.",
        ) +
        btn("exportCorrupt", "Скачать повреждённые байты") +
        btn(
          "resetCorrupt",
          "Сохранить резервную копию и явно сбросить слот",
          "cr-danger",
        );
    else if (slot.kind === "unavailable")
      actions =
        warning(
          "Прогресс не будет сохраняться. После закрытия страницы попытка исчезнет; хроника и награды недоступны.",
        ) + btn("memoryStart", "Играть без сохранения и наград");
    else if (slot.kind === "valid")
      actions =
        btn(
          "resume",
          slot.state.status === "active"
            ? "Продолжить сохранённое поручение"
            : "Открыть сохранённый итог",
          "cr-primary",
        ) + btn("restart", "Начать новую попытку вместо этой");
    else actions = btn("start", "Начать поручение", "cr-primary");
    render(
      `<header class="cr-heading"><span>${id} · ${esc(m.district)}</span><h1>${esc(m.title)}</h1></header>${hero(m)}${art(m, m.start)}<h2>Приказ</h2><p>${esc(m.brief)}</p><h2>Правила этой ночи</h2><p>${esc(m.rules)}</p><p>HP: 0–100. При нуле попытка заканчивается гибелью. Перевязка восстанавливает 35 HP и расходуется. Смерть здесь не затрагивает героя в Делах №001 и №002.</p><p class="cr-small">Автосохранение локальное, на этом устройстве. Отдельные попытки и награды не синхронизируются с другими браузерами. Случайный результат закреплён внутри попытки; перезагрузка его не меняет.</p><div class="cr-actions" data-brief="${id}">${actions}</div>`,
    );
  }
  function entropy() {
    const a = new Uint32Array(2);
    crypto.getRandomValues(a);
    return {
      seed: a[0],
      id: "cr_" + Date.now().toString(36) + "_" + a[1].toString(36),
    };
  }
  function start(id, inMemory = false, expected = raw) {
    const m = C.missions[id],
      e = entropy();
    const s = E.create(id, e.seed, e.id);
    memory = inMemory;
    rewardNotice = null;
    notice = "";
    raw = expected;
    if (memory) {
      state = s;
      scene(false);
      return;
    }
    const w = A.save(store, s, expected);
    if (w.ok) {
      state = s;
      raw = w.raw;
      scene(false);
    } else {
      state = null;
      render(
        `<h1>Попытка не начата</h1>${warning(w.error)}<p>Старые байты не заменены без подтверждённой записи.</p>${btn("retryBrief", "Вернуться к приказу")}${btn("memoryStart", "Играть без сохранения и наград")}`,
      );
      mode = "brief";
      setHash(id);
    }
  }
  function resume(id) {
    const s = A.load(store, id);
    if (s.kind !== "valid") return brief(id);
    state = s.state;
    raw = s.raw;
    memory = false;
    rewardNotice = null;
    notice = "";
    scene(true);
  }
  function hud(m) {
    const names = {
      time: "Ходы",
      alert: "Тревога",
      suspicion: "Подозрение",
      trust: "Доверие",
      witness: "Дэниел",
      cover: "Укрытие",
      siege: "Осада",
      car: "Машина",
      fuel: "Топливо",
      cargo: "Груз",
    };
    return `${hero(m)}<div class="cr-hud"><b class="${state.hp < 40 ? "cr-wounded" : ""}">♥ HP ${state.hp}/100</b>${Object.entries(
      state.stats,
    )
      .map(([k, v]) => `<span>${names[k]} <b>${v}</b></span>`)
      .join("")}</div><div class="cr-hp-track" role="progressbar" aria-label="Здоровье героя" aria-valuenow="${state.hp}" aria-valuemin="0" aria-valuemax="100"><span style="width:${state.hp}%"></span></div>`;
  }
  function inventory() {
    return `<details class="cr-inventory"><summary>Снаряжение · ${Object.keys(state.inventory).length} позиций</summary><div>${
      Object.entries(state.inventory)
        .map(
          ([k, v]) =>
            `<p><span aria-hidden="true">${C.items[k][0]}</span> ${esc(C.items[k][1])} <b>×${v}</b></p>`,
        )
        .join("") || "<p>Пусто</p>"
    }</div></details>`;
  }
  function resourceChanges() {
    // Reconstruct the previous confirmed state; no presentation data enters the save.
    let before = E.create(
      state.missionId,
      state.rng.seed,
      state.attemptId,
      state.startedAt,
    );
    for (const h of state.history.slice(0, -1))
      before = E.choose(before, h.choiceId, before.revision);
    const changes = Object.keys(C.items).flatMap((id) => {
      const delta = (state.inventory[id] || 0) - (before.inventory[id] || 0);
      return delta
        ? [
            `<span>${C.items[id][0]} ${esc(C.items[id][1])} ${delta > 0 ? "+" : ""}${delta}</span>`,
          ]
        : [];
    });
    const names = {
      time: "Ходы",
      alert: "Тревога",
      suspicion: "Подозрение",
      trust: "Доверие",
      witness: "Дэниел",
      cover: "Укрытие",
      siege: "Осада",
      car: "Машина",
      fuel: "Топливо",
      cargo: "Груз",
    };
    for (const [id, value] of Object.entries(state.stats)) {
      const delta = value - before.stats[id];
      if (delta)
        changes.push(
          `<span>${names[id]} ${delta > 0 ? "+" : ""}${delta}</span>`,
        );
    }
    return `<div class="cr-resource-changes" aria-label="Изменение ресурсов">${changes.join("")}</div>`;
  }
  function journal() {
    return `<details class="cr-journal"><summary>Журнал решений · ${state.revision}</summary><ol>${state.history
      .map((h) => {
        const n = C.missions[state.missionId].scenes[h.from],
          label =
            h.choiceId === "heal"
              ? "Перевязать раны"
              : n.choices.find((c) => c.id === h.choiceId).label;
        return `<li><b>${esc(n.title)}</b> — ${esc(label)}</li>`;
      })
      .join("")}</ol></details>`;
  }
  function actProgress(current) {
    return `<div class="cr-act-progress" aria-label="Акт ${current} из 3">${[1, 2, 3]
      .map((act) => `<span class="${act <= current ? "is-reached" : ""}" aria-hidden="true"></span>`)
      .join("")}</div>`;
  }
  function scene(showResult) {
    mode = "scene";
    const m = C.missions[state.missionId];
    setHash(m.id);
    if (state.status === "finished") return ending();
    const n = m.scenes[state.sceneId];
    let result = "";
    if (showResult && state.lastEvent) {
      const e = state.lastEvent;
      result = `<section class="cr-consequence" aria-live="polite"><small class="cr-consequence-origin">ИТОГ: ${esc(m.scenes[e.from]?.title || "Последний выбор")}</small><h2>Цена решения</h2><p>${esc(e.text)}</p><p>HP ${e.hpDelta >= 0 ? "+" : ""}${e.hpDelta} · ${e.roll === null ? "Без случайной проверки" : e.failed ? "Риск сработал" : "Опасности удалось избежать"}</p>${resourceChanges()}${btn("ack", "Продолжить →", "cr-primary")}</section>`;
    }
    const choiceViews = E.choices(state);
    const choicesHtml = choiceViews
      .map(
        (c) =>
          `<button type="button" data-choice="${c.id}" data-revision="${state.revision}" data-risk="${c.risk.probability}" ${c.available ? "" : "disabled"}><b>${esc(c.label)}</b><small>${esc(c.risk.level)}${c.risk.probability ? " · " + c.risk.probability + "%" : ""}${c.risk.lethal ? " · Возможна гибель" : ""}: ${esc(c.risk.reason)}</small>${
            Object.keys(c.cost || {}).length
              ? `<small>Расход: ${Object.entries(c.cost)
                  .map(([k, v]) => esc(C.items[k][1]) + " ×" + v)
                  .join(", ")}</small>`
              : ""
          }${!c.available ? "<small>Недоступно: не выполнено условие или не хватает ресурса.</small>" : ""}</button>`,
      )
      .join("");
    render(
      `<header class="cr-heading"><span>${m.id} · АКТ ${n.act}/3 · ${esc(m.acts[n.act - 1])}</span><h1>${esc(n.title)}</h1>${actProgress(n.act)}</header>${hud(m)}${memory ? warning("Игра без сохранения. Награды и хроника недоступны; после закрытия страницы прогресс исчезнет.") : notice ? warning(notice) : '<p class="cr-save-status">Ход сохранён на этом устройстве.</p>'}${inventory()}${
        result ||
        `${art(m, state.sceneId)}<article class="cr-story"><p>${esc(n.text)}</p><div class="cr-dialogue">${n.lines
          .filter((l) => !l[2] || E.test(state, l[2]))
          .map(
            ([name, text]) =>
              `<p><strong>${esc(name)}</strong><span>— ${esc(text)}</span></p>`,
          )
          .join(
            "",
          )}</div></article><h2>Ваше решение</h2><div class="cr-choices">${choicesHtml}${E.availability(state, "heal") ? `<button type="button" data-choice="heal" data-revision="${state.revision}"><b>✚ Перевязать раны · +35 HP</b><small>1 перевязка и 1 ход. Без броска.</small></button>` : ""}</div>`
      }${journal()}`,
    );
  }
  function advance(choiceId, revision) {
    if (!state || pending) return;
    let next;
    try {
      next = E.choose(state, choiceId, revision);
    } catch (e) {
      notice = e.message;
      return scene(false);
    }
    root.querySelectorAll("[data-choice]").forEach((b) => (b.disabled = true));
    if (memory) {
      state = next;
      scene(true);
      return;
    }
    const w = A.save(store, next, raw);
    if (w.ok) {
      state = next;
      raw = w.raw;
      notice = "";
      scene(true);
    } else {
      pending = next;
      render(
        `<h1>Ход рассчитан, но не сохранён</h1>${warning(w.error)}<p>Бросок закреплён в памяти страницы. Повторная запись использует тот же результат. Закрытие страницы может вернуть последний подтверждённый ход.</p>${btn("retryWrite", "Повторить запись этого результата", "cr-primary")}${btn("continueMemory", "Продолжить без сохранения и наград")}${btn("reloadSlot", "Загрузить последний подтверждённый ход")}`,
      );
    }
  }
  function awardBanner() {
    if (!rewardNotice) return "";
    return `<aside class="cr-reward-toast" role="status" aria-live="assertive" aria-label="Новая награда">
      <span class="cr-reward-symbol" aria-hidden="true">✦</span>
      <div><b>${rewardNotice.award ? "Новый знак получен" : "Новое достижение"}</b>
      ${rewardNotice.award ? `<span>${esc(rewardNotice.award)}</span>` : ""}
      ${rewardNotice.achievement ? `<small>${esc(rewardNotice.achievement)}</small>` : ""}</div>
      ${btn("dismissReward", "Закрыть ×")}
    </aside>`;
  }
  function ending() {
    mode = "ending";
    const m = C.missions[state.missionId],
      r = E.report(state),
      a = memory
        ? {
            ok: false,
            error: "Эта попытка проходила без сохранения; награды не выдаются.",
          }
        : A.recover(store, state);
    if (a.ok && (a.awardAdded || a.achievementAdded)) {
      rewardNotice = {
        award: a.awardAdded ? C.awardName(m.id, state.terminalId) : null,
        achievement: a.achievementAdded
          ? state.terminalId === "clean"
            ? "Приказ выполнен без тяжёлых потерь"
            : "Память о невозвращении"
          : null,
      };
    }
    render(
      `${awardBanner()}<header class="cr-heading"><span>${m.id} · ПОПЫТКА ЗАВЕРШЕНА</span><h1>${esc(r.title)}</h1></header>${hero(m)}${art(m, "end:" + state.terminalId)}<p>${esc(r.text)}</p><div class="cr-result"><b>Вы ${state.hp === 0 ? "погибли" : "выжили"} · HP ${state.hp}/100</b><p>Приказ ${["clean", "costly"].includes(state.terminalId) ? "выполнен" : "не выполнен"} · ${state.stats.time} ходов</p></div><ul>${r.notes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>${a.ok ? `<p class="cr-save-status">Финал записан в хронику. Знак «${esc(C.awardName(m.id, state.terminalId))}» учтён один раз за этот исход.</p>` : warning(a.error + " Финал не объявляется награждённым. При сохранённом слоте хроника восстановится после устранения ошибки.")}${journal()}<div class="cr-actions">${btn("chronicle", "Открыть хронику")}${btn("restart", "Новая попытка", "cr-primary")}${!a.ok && !memory ? btn("retryArchive", "Повторить запись хроники") : ""}</div>`,
    );
  }
  function chronicle() {
    rewardNotice = null;
    mode = "chronicle";
    setHash("chronicle");
    const l = A.ledger(store);
    if (!l.ok)
      return render(
        `<h1>Локальная хроника</h1>${warning(l.error + " Существующие байты хроники не изменены.")}`,
      );
    render(
      `<header class="cr-heading"><span>ТОЛЬКО НА ЭТОМ УСТРОЙСТВЕ</span><h1>Хроника криминальных дел</h1></header><p>${l.value.attempts.length} завершённых попыток · ${Object.keys(l.value.rewards).length} уникальных знаков · ${Object.keys(l.value.achievements).length} памятных отметок</p><p class="cr-small">Знак хранит ссылку на доказанный завершённый исход. Повтор того же финала тем же героем остаётся новой попыткой, но второго знака не даёт. Детективный архив не изменяется.</p><h2>Знаки этой ночи</h2><div class="cr-awards">${
        Object.entries(l.value.rewards)
          .map(([key, attemptId]) => {
            const s = l.value.attempts.find((s) => s.attemptId === attemptId);
            return `<article><span aria-hidden="true">${s.terminalId === "clean" ? "✦" : s.terminalId === "dead" ? "†" : "◈"}</span><b>${esc(C.awardName(s.missionId, s.terminalId))}</b><small>${s.missionId} · ${esc(C.missions[s.missionId].endings[s.terminalId].title)}</small><small>Подтверждено завершённым отчётом</small></article>`;
          })
          .join("") || "<p>Первый знак появится после записанного финала.</p>"
      }</div><h2>Достижения и память</h2>${
        Object.entries(l.value.achievements)
          .map(([key, attemptId]) => {
            const s = l.value.attempts.find((s) => s.attemptId === attemptId);
            return `<p class="cr-achievement">${key.startsWith("clean:") ? "✦ Приказ выполнен без тяжёлых потерь" : "† Память о невозвращении"} · ${s.missionId} · ${esc(C.missions[s.missionId].hero.name)}</p>`;
          })
          .join("") || "<p>Эта страница ещё ждёт имён.</p>"
      }<h2>Завершённые попытки</h2>${
        l.value.attempts
          .slice()
          .reverse()
          .map((s) => {
            const m = C.missions[s.missionId],
              r = E.report(s);
            return `<article class="cr-record"><small>${m.id} · ${esc(m.hero.name)}</small><h2>${esc(r.title)}</h2><p>${esc(r.text)}</p><p>HP ${s.hp}/100 · ${s.revision} решений</p><ul>${r.notes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>`;
          })
          .join("") || "<p>Завершённых попыток пока нет.</p>"
      }${btn("commonArchive", "Открыть общие достижения кампании")}`,
    );
  }
  function currentId() {
    return state?.missionId || location.hash.split("/")[1];
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    if (b.dataset.mission) return brief(b.dataset.mission);
    if (b.dataset.choice)
      return advance(b.dataset.choice, Number(b.dataset.revision));
    const id = currentId();
    switch (b.dataset.action) {
      case "map":
        if (!confirmPendingLeave()) return;
        return map();
      case "home":
        if (!confirmPendingLeave()) return;
        return close();
      case "dismissReward":
        rewardNotice = null;
        root.querySelector(".cr-reward-toast")?.remove();
        return;
      case "chronicle":
        if (pending) return;
        return chronicle();
      case "retryBrief":
        return brief(id);
      case "start":
        return start(id);
      case "memoryStart":
        return start(id, true);
      case "resume":
        return resume(id);
      case "ack":
        return scene(false);
      case "restart":
        if (
          !confirm(
            "Заменить текущий слот новой попыткой? Архив завершённых попыток останется.",
          )
        )
          return;
        if (state?.status === "finished" && !memory) {
          const r = A.recover(store, state);
          if (!r.ok) {
            notice = r.error;
            return ending();
          }
        }
        return start(id, false, A.load(store, id).raw);
      case "retryWrite": {
        const w = A.save(store, pending, raw);
        if (w.ok) {
          state = pending;
          pending = null;
          raw = w.raw;
          return scene(true);
        }
        return alert(w.error);
      }
      case "continueMemory":
        memory = true;
        state = pending;
        pending = null;
        return scene(true);
      case "reloadSlot":
        pending = null;
        return resume(id);
      case "retryArchive":
        return ending();
      case "commonArchive":
        close();
        document.getElementById("storyStart").click();
        return;
      case "exportCorrupt": {
        const slot = A.load(store, id);
        const a = document.createElement("a");
        const url = URL.createObjectURL(
          new Blob([slot.raw || ""], { type: "application/octet-stream" }),
        );
        a.href = url;
        a.download = id + "-corrupt-save.txt";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        return;
      }
      case "resetCorrupt": {
        const slot = A.load(store, id);
        if (
          slot.kind !== "corrupt" ||
          !confirm(
            "Повреждённый слот будет заменён. Сначала сохранится его точная резервная копия в отдельном криминальном ключе. Продолжить?",
          )
        )
          return;
        const r = A.backupCorrupt(store, id, slot.raw, Date.now());
        if (!r.ok) return alert(r.error);
        return start(id, false, slot.raw);
      }
    }
  });
  document.getElementById("criminalEntry").addEventListener("click", map);
  document.getElementById("homeBtn").addEventListener(
    "click",
    (e) => {
      if (root.hidden) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!confirmPendingLeave()) return;
      close();
    },
    true,
  );
  document.getElementById("profileBtn").addEventListener(
    "click",
    (e) => {
      if (root.hidden) return;
      if (!confirmPendingLeave()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      pending = null;
      state = null;
      rewardNotice = null;
      root.hidden = true;
      delete document.body.dataset.criminal;
      setHash("");
    },
    true,
  );
  // The legacy exit control is outside .screen. Handle it only while this mode is open.
  document.addEventListener(
    "click",
    (e) => {
      if (root.hidden || !e.target.closest("#gameExitBtn")) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!confirmPendingLeave()) return;
      close();
    },
    true,
  );
  // Bridge is optional. This mode owns its inset variables and never touches Case002.
  function safeArea() {
    const t = globalThis.Telegram?.WebApp;
    if (!t?.safeAreaInset && !t?.contentSafeAreaInset) return;
    for (const side of ["top", "right", "bottom", "left"]) {
      const val = [
        t.safeAreaInset?.[side],
        t.contentSafeAreaInset?.[side],
      ].reduce(
        (a, v) => a + (Number.isFinite(v) ? Math.max(0, Math.min(160, v)) : 0),
        0,
      );
      root.style.setProperty("--cr-safe-" + side, val + "px");
    }
    root.dataset.telegram = "true";
  }
  safeArea();
  for (const event of [
    "safeAreaChanged",
    "contentSafeAreaChanged",
    "viewportChanged",
  ])
    globalThis.Telegram?.WebApp?.onEvent?.(event, safeArea);
  if (location.hash.startsWith("#criminal/")) {
    const id = location.hash.split("/")[1];
    if (id === "chronicle") chronicle();
    else if (C.missions[id]) brief(id);
    else map();
  }
})();
