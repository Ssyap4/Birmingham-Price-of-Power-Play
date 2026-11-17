"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../../src/criminal/engine");
const epilogues = require("../../src/criminal/epilogues");
const evidence = require("../../docs/criminal-operations/v2-evidence/routes.json");
require("../../src/criminal/content");
for (let i = 1; i <= 5; i++)
  require("../../src/criminal/missions/cr0" + i);

function replay(missionId, proof) {
  let s = E.create(missionId, proof.seed, proof.attemptId, proof.startedAt);
  for (const h of proof.path) {
    assert.equal(s.sceneId, h.from);
    s = E.choose(s, h.choiceId, s.revision);
  }
  return s;
}

test("20 real recorded endings render bounded nonempty mission-specific cards without mutating save", () => {
  let total = 0;
  for (const [id, mission] of Object.entries(evidence.missions)) {
    for (const [terminal, proof] of Object.entries(mission.terminalProofs)) {
      const s = replay(id, proof);
      assert.equal(s.terminalId, terminal, id + "/" + terminal);
      assert.equal(E.validateState(s).ok, true);
      const prior = E.canonical(s);
      const cards = epilogues.describe(s);
      assert.ok(cards.length >= 1 && cards.length <= 2, id + "/" + terminal);
      assert.ok(cards.every(c => typeof c.title === "string" &&
        c.title.length > 2 && typeof c.text === "string" &&
        c.text.length > 60 && ["hope","loss","cost","unknown","neutral"].includes(c.tone)));
      assert.equal(E.canonical(s), prior);
      assert.deepEqual(epilogues.describe(s), cards, "epilogues deterministic");
      total++;
    }
  }
  assert.equal(total, 20);
});

test("personal fates are conditional on actual completed flags, never a generic invented rescue", () => {
  const targets = [
    ["CR01", "eliSafe", "Лили и Илай", "Илай остался"],
    ["CR02", "benSaved", "Бен выбрался", "Закрытый трюм"],
    ["CR03", "ruthSafe", "Рут не оставили", "Чужое обвинение"],
    ["CR04", "evacuated", "Живой свидетель", "Дэниел не вышел"],
    ["CR05", "passengerSaved", "Гарри добрался", "Человек на обочине"],
  ];
  for (const [id, flag, successTitle, failureTitle] of targets) {
    const finals = Object.values(evidence.missions[id].terminalProofs)
      .map(p => replay(id, p));
    for (const s of finals) {
      const texts = epilogues.describe(s).map(c => c.title);
      if (s.flags[flag] === true) {
        if (id !== "CR04" || s.objective) assert.ok(texts.includes(successTitle), id);
      } else {
        assert.equal(texts.includes(successTitle), false, id + " cannot invent rescue");
      }
      if (id === "CR04" && s.stats.witness === 0)
        assert.ok(texts.includes(failureTitle));
    }
  }
});

test("different outcomes retain the actual cost rather than inheriting a clean epilogue", () => {
  const proof = evidence.missions.CR05.terminalProofs;
  const clean = replay("CR05", proof.clean);
  const costly = replay("CR05", proof.costly);
  assert.equal(clean.flags.exposed, undefined);
  assert.equal(costly.flags.exposed, true);
  assert.ok(epilogues.describe(costly).some(c => c.title === "Рейс замечен"));
  assert.ok(!epilogues.describe(clean).some(c => c.title === "Рейс замечен"));
  assert.notDeepEqual(epilogues.describe(clean), epilogues.describe(costly));

  const jack = replay("CR01", evidence.missions.CR01.terminalProofs.costly);
  assert.equal(jack.flags.violence, true);
  assert.ok(epilogues.describe(jack).some(c => c.title === "Цена силы"));
});

test("active or unrelated game state does not produce criminal epilogues", () => {
  const s = E.create("CR01", 1, "unsaved_intro_01", 1);
  assert.deepEqual(epilogues.describe(s), []);
  assert.deepEqual(epilogues.describe({ ...s, mode: "detective", status: "finished" }), []);
  assert.deepEqual(epilogues.describe(null), []);
});
