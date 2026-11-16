(function (root, factory) {
  const api = factory(
    typeof module === "object" && module.exports
      ? require("./content.js")
      : root.CriminalContent,
  );
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CriminalEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (C) {
  "use strict";
  const VERSION = 2,
    clamp = (x, a, b) => Math.max(a, Math.min(b, x)),
    clone = (x) => JSON.parse(JSON.stringify(x));
  function canonical(x) {
    if (Array.isArray(x)) return "[" + x.map(canonical).join(",") + "]";
    if (x && typeof x === "object")
      return (
        "{" +
        Object.keys(x)
          .sort()
          .map((k) => JSON.stringify(k) + ":" + canonical(x[k]))
          .join(",") +
        "}"
      );
    return JSON.stringify(x);
  }
  function test(s, p) {
    if (!p) return true;
    if (p.all) return p.all.every((x) => test(s, x));
    if (p.any) return p.any.some((x) => test(s, x));
    if (p.not) return !test(s, p.not);
    if (p.item) return (s.inventory[p.item] || 0) >= (p.n || 1);
    if (p.flag) return s.flags[p.flag] === true;
    if (p.stat) {
      const v = p.stat === "hp" ? s.hp : s.stats[p.stat];
      return p.op === ">="
        ? v >= p.value
        : p.op === "<="
          ? v <= p.value
          : p.op === ">"
            ? v > p.value
            : p.op === "<"
              ? v < p.value
              : v === p.value;
    }
    return false;
  }
  function create(missionId, seed, attemptId, startedAt = Date.now()) {
    const m = C.missions[missionId];
    if (
      !m ||
      !Number.isInteger(seed) ||
      seed < 0 ||
      seed > 4294967295 ||
      typeof attemptId !== "string" ||
      !/^[a-zA-Z0-9_-]{8,100}$/.test(attemptId) ||
      !Number.isSafeInteger(startedAt) ||
      startedAt < 0
    )
      throw Error("Неверный заголовок попытки");
    return {
      schemaVersion: VERSION,
      mode: "criminal",
      missionId,
      heroId: m.hero.id,
      attemptId,
      startedAt,
      sceneId: m.start,
      hp: 100,
      inventory: clone(m.inventory),
      stats: clone(m.stats),
      flags: {},
      rng: { seed, cursor: 0 },
      revision: 0,
      status: "active",
      terminalId: null,
      objective: false,
      history: [],
      lastEvent: null,
    };
  }
  function getChoice(s, id) {
    if (typeof id !== "string") throw Error("choiceId должен быть строкой");
    const m = C.missions[s.missionId];
    return id === "heal"
      ? {
          id: "heal",
          label: "Перевязать раны",
          to: s.sceneId,
          when: {
            all: [
              { item: "bandage" },
              { not: { stat: "hp", op: "=", value: 100 } },
            ],
          },
          cost: { bandage: 1 },
          heal: true,
        }
      : m?.scenes[s.sceneId]?.choices.find((c) => c.id === id);
  }
  function availability(s, id) {
    if (s.status !== "active") return false;
    const c = getChoice(s, id);
    if (!c) return false;
    if (c.heal && s.hp >= 100) return false;
    if (c.when && !test(s, c.when)) return false;
    return (
      Object.entries(c.cost || {}).every(
        ([k, n]) => (s.inventory[k] || 0) >= n,
      ) &&
      !s.history.some(
        (h) => h.from === s.sceneId && h.choiceId === id && id !== "heal",
      )
    );
  }
  function risk(s, choiceId) {
    const c = getChoice(s, choiceId);
    if (!c) throw Error("Неизвестный выбор");
    function hpEffect(e) {
      if (!e) return 0;
      if (Array.isArray(e)) return e.reduce((sum, x) => sum + hpEffect(x), 0);
      return e.when && !test(s, e.when) ? 0 : e.hp || 0;
    }
    const directHp = Math.min(0, hpEffect(c.effect));
    if (!c.danger)
      return {
        probability: 0,
        level: "Без броска",
        reason:
          directHp < 0
            ? `Цена холодной воды: ${directHp} HP`
            : c.hint || "Последствия определяются решением",
        lethal: s.hp + directHp <= 0,
      };
    let p = c.danger.base;
    const reasons = [c.danger.reason];
    for (const x of c.danger.mods || [])
      if (test(s, x.when)) {
        p += x.delta;
        reasons.push(x.why);
      }
    if (s.hp < 40) {
      p += 15;
      reasons.push("тяжёлое ранение");
    }
    p = clamp(p, 2, 95);
    return {
      probability: p,
      level:
        p >= 60
          ? "Крайний риск"
          : p >= 35
            ? "Высокий риск"
            : p >= 15
              ? "Умеренный риск"
              : "Низкий риск",
      reason: reasons.join("; "),
      lethal:
        c.danger.lethal > 0 ||
        s.hp + directHp + Math.min(0, hpEffect(c.fail)) <= c.danger.damage,
    };
  }
  function choices(s) {
    return (C.missions[s.missionId].scenes[s.sceneId]?.choices || []).map(
      (c) => ({ ...c, available: availability(s, c.id), risk: risk(s, c.id) }),
    );
  }
  function roll(s, id) {
    let x = (s.rng.seed ^ Math.imul(s.rng.cursor + 1, 0x9e3779b9)) >>> 0;
    for (let i = 0; i < id.length; i++) {
      x ^= id.charCodeAt(i);
      x = Math.imul(x, 16777619) >>> 0;
    }
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d);
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b);
    x ^= x >>> 16;
    s.rng.cursor++;
    return (x >>> 0) / 4294967296;
  }
  function effect(s, e) {
    if (!e) return;
    if (Array.isArray(e)) {
      e.forEach((x) => effect(s, x));
      return;
    }
    if (e.when && !test(s, e.when)) return;
    for (const [k, v] of Object.entries(e.items || {})) {
      if (!C.items[k] || !Number.isInteger(v)) throw Error("Неверный предмет");
      const n = (s.inventory[k] || 0) + v;
      if (n < 0) throw Error("Нет расходника");
      if (n) s.inventory[k] = n;
      else delete s.inventory[k];
    }
    for (const [k, v] of Object.entries(e.stats || {})) {
      if (!Object.hasOwn(s.stats, k) || !Number.isInteger(v))
        throw Error("Неверная статистика " + k);
      s.stats[k] = clamp(s.stats[k] + v, 0, 100);
    }
    Object.assign(s.flags, e.flags || {});
    s.hp = clamp(s.hp + (e.hp || 0), 0, 100);
  }
  function target(s, t) {
    if (typeof t === "string") return t;
    return t.find((x) => !x.when || test(s, x.when))?.to;
  }
  function finish(s, requested) {
    const m = C.missions[s.missionId];
    s.objective = test(s, m.goal);
    s.status = "finished";
    s.terminalId =
      s.hp === 0
        ? "dead"
        : requested === "deliver" && s.objective
          ? s.hp < 55 || test(s, m.costly)
            ? "costly"
            : "clean"
          : "failed";
    s.sceneId = "end:" + s.terminalId;
  }
  function step(state, choiceId, expectedRevision) {
    if (expectedRevision !== state.revision)
      throw Error("Этот выбор уже обработан");
    if (!availability(state, choiceId)) throw Error("Выбор недоступен");
    const s = clone(state),
      c = getChoice(s, choiceId),
      r = risk(s, choiceId),
      from = s.sceneId,
      before = {
        hp: s.hp,
        inventory: clone(s.inventory),
        stats: clone(s.stats),
      };
    let draw = null,
      failed = false;
    effect(s, {
      items: Object.fromEntries(
        Object.entries(c.cost || {}).map(([k, n]) => [k, -n]),
      ),
    });
    s.stats.time++;
    if (c.danger) {
      draw = roll(s, from + ":" + choiceId);
      failed = draw * 100 < r.probability;
    }
    effect(s, c.effect);
    if (c.heal) s.hp = clamp(s.hp + 35, 0, 100);
    if (failed) {
      const catastrophic = draw * 100 < r.probability * (c.danger.lethal || 0);
      s.hp = clamp(s.hp - (catastrophic ? 100 : c.danger.damage), 0, 100);
      effect(s, c.fail);
    }
    const to = target(s, failed && c.failTo ? c.failTo : c.to);
    s.revision++;
    s.history.push({ revision: s.revision, from, choiceId });
    if (s.hp === 0) finish(s, "dead");
    else if (to === "@deliver" || to === "@withdraw") finish(s, to.slice(1));
    else {
      if (!C.missions[s.missionId].scenes[to]) throw Error("Нет сцены " + to);
      s.sceneId = to;
    }
    s.lastEvent = {
      choiceId,
      from,
      to: s.sceneId,
      roll: draw,
      risk: r,
      failed,
      text: failed
        ? c.failure || "Риск обернулся ранением. Цена решения уже учтена."
        : c.result ||
          "Решение принято. Обратного хода внутри этой попытки нет.",
      hpDelta: s.hp - before.hp,
      items: clone(s.inventory),
      stats: clone(s.stats),
    };
    // Capacity counts equipment types; ammunition, money and dressings are compact supplies.
    if (
      Object.keys(s.inventory).filter(
        (k) => !["ammo", "cash", "coins", "bandage"].includes(k),
      ).length > 8
    )
      throw Error("Инвентарь заполнен");
    return s;
  }
  function validateState(s) {
    try {
      if (
        !s ||
        s.schemaVersion !== VERSION ||
        s.mode !== "criminal" ||
        !C.missions[s.missionId] ||
        s.heroId !== C.missions[s.missionId].hero.id ||
        !Array.isArray(s.history) ||
        s.history.length > 100 ||
        !Number.isInteger(s.hp) ||
        s.hp < 0 ||
        s.hp > 100 ||
        !Number.isInteger(s.revision) ||
        s.revision !== s.history.length
      )
        throw Error("Неверная схема");
      let replay = create(s.missionId, s.rng?.seed, s.attemptId, s.startedAt);
      for (const h of s.history) {
        if (h.from !== replay.sceneId || h.revision !== replay.revision + 1)
          throw Error("Нарушена история");
        replay = step(replay, h.choiceId, replay.revision);
      }
      if (canonical(replay) !== canonical(s))
        throw Error("Состояние не подтверждается историей");
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
  function choose(s, id, revision) {
    const v = validateState(s);
    if (!v.ok) throw Error(v.error);
    return step(s, id, revision);
  }
  function report(s) {
    if (!validateState(s).ok || s.status !== "finished")
      throw Error("Нет доказанного финала");
    const m = C.missions[s.missionId];
    return {
      title: m.endings[s.terminalId].title,
      text: m.endings[s.terminalId].text,
      notes: m.notes.filter((n) => test(s, n.when)).map((n) => n.text),
      objective: s.objective,
      hp: s.hp,
    };
  }
  return {
    VERSION,
    create,
    choose,
    validateState,
    availability,
    risk,
    choices,
    test,
    report,
    canonical,
  };
});
