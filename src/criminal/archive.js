(function (root, factory) {
  const api = factory(
    typeof module === "object" && module.exports
      ? require("./engine.js")
      : root.CriminalEngine,
  );
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CriminalArchive = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (E) {
  "use strict";
  const PREFIX = "birmingham_criminal_v2_",
    LEDGER = PREFIX + "ledger",
    key = (id) => PREFIX + "save_" + id;
  function read(store, k) {
    try {
      return { ok: true, raw: store.getItem(k) };
    } catch (e) {
      return { ok: false, error: "Хранилище недоступно: " + e.message };
    }
  }
  function exactWrite(store, k, raw, expected) {
    try {
      const old = store.getItem(k);
      if (expected !== undefined && old !== expected && old !== raw)
        return {
          ok: false,
          error: "Слот изменён в другом окне. Загрузите сохранённый ход.",
        };
      if (old !== raw) store.setItem(k, raw);
      if (store.getItem(k) !== raw)
        throw Error("Запись не подтверждена чтением");
      return { ok: true, raw };
    } catch (e) {
      return { ok: false, error: "Сохранение не подтверждено: " + e.message };
    }
  }
  function load(store, id) {
    const r = read(store, key(id));
    if (!r.ok) return { ...r, kind: "unavailable" };
    if (r.raw === null) return { ...r, kind: "empty" };
    try {
      const state = JSON.parse(r.raw),
        v = E.validateState(state);
      if (!v.ok || state.missionId !== id)
        throw Error(v.error || "Чужая миссия");
      return { ...r, kind: "valid", state };
    } catch (e) {
      return {
        ...r,
        ok: false,
        kind: "corrupt",
        error: "Повреждённый слот: " + e.message,
      };
    }
  }
  function save(store, state, expected) {
    const v = E.validateState(state);
    if (!v.ok) return v;
    return exactWrite(
      store,
      key(state.missionId),
      JSON.stringify(state),
      expected,
    );
  }
  function validateLedger(l) {
    if (
      !l ||
      l.schemaVersion !== 2 ||
      !Array.isArray(l.attempts) ||
      !l.rewards ||
      !l.achievements
    )
      throw Error("Повреждена хроника");
    const ids = new Set(),
      rewards = {},
      achievements = {};
    for (const s of l.attempts) {
      if (
        !E.validateState(s).ok ||
        s.status !== "finished" ||
        ids.has(s.attemptId)
      )
        throw Error("Недоказанная запись хроники");
      ids.add(s.attemptId);
      const combo = [s.missionId, s.heroId, s.terminalId].join(":");
      rewards[combo] ??= s.attemptId;
      if (s.terminalId === "clean")
        achievements["clean:" + s.missionId] ??= s.attemptId;
      if (s.terminalId === "dead")
        achievements["remember:" + s.missionId] ??= s.attemptId;
    }
    if (
      E.canonical(rewards) !== E.canonical(l.rewards) ||
      E.canonical(achievements) !== E.canonical(l.achievements)
    )
      throw Error("Награда не подтверждена попыткой");
    return l;
  }
  function ledger(store) {
    const r = read(store, LEDGER);
    if (!r.ok) return r;
    try {
      return {
        ...r,
        ok: true,
        value:
          r.raw === null
            ? { schemaVersion: 2, attempts: [], rewards: {}, achievements: {} }
            : validateLedger(JSON.parse(r.raw)),
      };
    } catch (e) {
      return { ...r, ok: false, error: e.message };
    }
  }
  function recover(store, state) {
    if (!E.validateState(state).ok || state.status !== "finished")
      return { ok: false, error: "Нет подтверждённого окончания" };
    const persisted = load(store, state.missionId);
    if (
      persisted.kind !== "valid" ||
      E.canonical(persisted.state) !== E.canonical(state)
    )
      return { ok: false, error: "Финал ещё не сохранён" };
    const l = ledger(store);
    if (!l.ok) return l;
    const found = l.value.attempts.find((s) => s.attemptId === state.attemptId);
    if (found)
      return E.canonical(found) === E.canonical(state)
        ? { ok: true, value: l.value, recovered: false }
        : { ok: false, error: "Конфликт идентификатора попытки" };
    const next = JSON.parse(JSON.stringify(l.value)),
      combo = [state.missionId, state.heroId, state.terminalId].join(":");
    next.attempts.push(state);
    next.rewards[combo] ??= state.attemptId;
    if (state.terminalId === "clean")
      next.achievements["clean:" + state.missionId] ??= state.attemptId;
    if (state.terminalId === "dead")
      next.achievements["remember:" + state.missionId] ??= state.attemptId;
    validateLedger(next);
    const w = exactWrite(store, LEDGER, JSON.stringify(next), l.raw);
    return { ...w, value: w.ok ? next : null, recovered: w.ok };
  }
  function backupCorrupt(store, id, expected, stamp) {
    const current = load(store, id);
    if (current.kind !== "corrupt" || current.raw !== expected)
      return { ok: false, error: "Слот изменился; сброс отменён" };
    const k = PREFIX + "backup_" + id + "_" + stamp;
    return exactWrite(store, k, expected, null);
  }
  return { PREFIX, LEDGER, key, load, save, ledger, recover, backupCorrupt };
});
