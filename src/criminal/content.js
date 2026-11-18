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
    return (awardNames[missionId] || missions[missionId]?.awardNames)?.[
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
  // District identity and map position are independent of the mission graph.
  const districts = Object.freeze([
    {id:"handsworth",name:"Хэндсворт",x:9,y:9,icon:"♜"},
    {id:"nechells",name:"Нечеллс",x:60,y:26,icon:"⚓"},
    {id:"ladywood",name:"Ледивуд",x:8,y:41,icon:"◇"},
    {id:"edgbaston",name:"Эджбастон",x:10,y:69,icon:"▤"},
    {id:"balsall-heath",name:"Бэлсолл-Хит",x:60,y:77,icon:"⚒"}
  ].map(Object.freeze));
  const legacy = Object.freeze({CR01:"balsall-heath",CR02:"nechells",CR03:"edgbaston",CR04:"handsworth",CR05:"ladywood"});
  const heroes = Object.freeze(["jack","finn","eleanor","victor","samuel"]);
  function catalog() {
    return Object.values(missions).map(m=>{
      const districtId=legacy[m.id] || m.catalog?.districtId;
      const district=districts.find(d=>d.id===districtId);
      const wave=legacy[m.id]?1:m.catalog?.wave;
      if(!/^CR[0-9]{2,}$/.test(m.id)||!district||district.name!==m.district||
        !heroes.includes(m.hero?.id)||!Number.isInteger(wave)||wave<1)
        throw Error("Invalid mission catalog: "+m.id);
      return {id:m.id,heroId:m.hero.id,districtId,wave,mission:m};
    }).sort((a,b)=>Number(a.id.slice(2))-Number(b.id.slice(2)));
  }
  function register(m) {
    if (missions[m.id]) throw Error("Duplicate mission");
    missions[m.id] = m;
  }
  return {
    missions,
    districts,
    heroes,
    catalog,
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
