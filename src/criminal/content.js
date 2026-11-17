(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CriminalContent = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const missions = {};
  const awardNames = {
    CR01: [
      "Квитанция без крови",
      "Медная касса",
      "Пустой навес",
      "Последняя монета",
    ],
    CR02: ["Красная пломба", "Мокрый канат", "Пустой причал", "Кольцо в воде"],
    CR03: [
      "Чистая печать",
      "Треснувшая маска",
      "Снимок без подписи",
      "Чёрная перчатка",
    ],
    CR04: ["Ключ от утра", "Пепел дома", "Пустое кресло", "Погасшая лампа"],
    CR05: [
      "Целая накладная",
      "Последний ремень",
      "Пустой кузов",
      "Остывший мотор",
    ],
  };
  function awardName(missionId, endingId) {
    return awardNames[missionId]?.[
      ["clean", "costly", "failed", "dead"].indexOf(endingId)
    ];
  }
  const items = {
    gun: ["◈", "Револьвер «Уэбли»"],
    ammo: ["•", "Патроны"],
    bandage: ["✚", "Перевязка"],
    receipt: ["▤", "Квитанция-ключ"],
    coins: ["◉", "Монеты"],
    decoy: ["▣", "Пустая сумка"],
    case: ["▣", "Касса и книга"],
    picks: ["⚿", "Отмычки"],
    shiv: ["◇", "Заточка"],
    rope: ["∞", "Верёвка"],
    lamp: ["☼", "Фонарь"],
    coat: ["♧", "Сухая куртка"],
    chest: ["▣", "Опломбированный ящик"],
    camera: ["◎", "Фотоаппарат"],
    contacts: ["▤", "Книжка контактов"],
    card: ["▤", "Карточка гостя"],
    key: ["⚿", "Ключ от шкафа"],
    original: ["▤", "Оригинал соглашения"],
    copy: ["▤", "Фотокопия"],
    papers: ["▤", "Удостоверение"],
    cash: ["◉", "Наличные"],
    password: ["◇", "Проверенный сигнал"],
    gardenKey: ["⚿", "Ключ от сада"],
    tools: ["⚒", "Инструменты"],
    smoke: ["≋", "Дымовая шашка"],
    belt: ["∞", "Запасной ремень"],
    petrol: ["◉", "Канистра топлива"],
    manifest: ["▤", "Накладная"],
  };
  // A small declarative vocabulary; no script or expression is evaluated from a save.
  const I = (item, n = 1) => ({ item, n }),
    F = (flag) => ({ flag }),
    N = (not) => ({ not }),
    S = (stat, op, value) => ({ stat, op, value }),
    AND = (...all) => ({ all }),
    OR = (...any) => ({ any });
  const fx = (items = {}, stats = {}, flags = {}, hp = 0) => ({
    items,
    stats,
    flags,
    hp,
  });
  function c(id, label, to, options = {}) {
    return { id, label, to, ...options };
  }
  function d(base, damage, reason, mods = [], lethal = 0) {
    return { base, damage, reason, mods, lethal };
  }
  function mod(when, delta, why) {
    return { when, delta, why };
  }
  function node(act, title, text, lines, choices) {
    return { act, title, text, lines, choices };
  }
  function register(m) {
    if (missions[m.id]) throw Error("Duplicate mission");
    missions[m.id] = m;
  }
  return {
    missions,
    awardName,
    items,
    I,
    F,
    N,
    S,
    AND,
    OR,
    fx,
    c,
    d,
    mod,
    node,
    register,
  };
});
