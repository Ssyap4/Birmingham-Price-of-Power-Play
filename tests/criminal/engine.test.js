"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const { C, E, explore } = require("./explore");
const A = require("../../src/criminal/archive");
const clone = (x) => JSON.parse(JSON.stringify(x));
class Store {
  constructor() {
    this.data = new Map();
    this.fail = null;
  }
  getItem(k) {
    if (this.fail === "read") throw Error("read denied");
    return this.data.get(k) ?? null;
  }
  setItem(k, v) {
    if (this.fail === "write" || this.fail === k) throw Error("quota");
    this.data.set(k, v);
  }
}
function walk(id, seed, actions) {
  let s = E.create(id, seed, "item_test_" + id, 1);
  for (const id of actions) {
    if (s.status !== "active") return null;
    if (!E.availability(s, id)) return null;
    s = E.choose(s, id, s.revision);
  }
  return s;
}
let evidence;
test("2000 seeded attempts per mission: all 105 nodes, different sceneId routes, four proven endings, no deadlock", () => {
  // A wider deterministic sample is useful here because clean routes require actual care.
  evidence = explore(2000);
  for (const [id, r] of Object.entries(evidence)) {
    assert.deepEqual(r.unvisited, [], id);
    assert.equal(r.deadlocks.length, 0);
    assert.ok(r.routes > 2);
    assert.deepEqual(Object.keys(r.endings).sort(), [
      "clean",
      "costly",
      "dead",
      "failed",
    ]);
    for (const s of Object.values(r.samples)) {
      assert.ok(E.validateState(s).ok);
      assert.equal(s.status, "finished");
      if (["clean", "costly"].includes(s.terminalId)) {
        assert.ok(s.objective);
        assert.ok(s.hp > 0);
      }
      if (s.terminalId === "dead") {
        assert.equal(s.hp, 0);
        assert.throws(() => E.choose(s, "heal", s.revision));
      }
    }
  }
  fs.mkdirSync("work/criminal", { recursive: true });
  fs.writeFileSync(
    "work/criminal/acceptance-routes.json",
    JSON.stringify(evidence, null, 2),
  );
});
test("graph contract, unique local choices, three acts, named dialogue, branch targets exist", () => {
  for (const m of Object.values(C.missions)) {
    assert.ok(Object.keys(m.scenes).length >= 18);
    assert.deepEqual(
      [...new Set(Object.values(m.scenes).map((n) => n.act))].sort(),
      [1, 2, 3],
    );
    for (const [id, n] of Object.entries(m.scenes)) {
      assert.ok(n.text.length > 90, id);
      assert.ok(n.lines.length >= 2, id);
      assert.equal(new Set(n.choices.map((c) => c.id)).size, n.choices.length);
      for (const c of n.choices) {
        for (const t of [c.to, c.failTo].filter(Boolean)) {
          for (const x of typeof t === "string" ? [t] : t.map((x) => x.to)) {
            assert.ok(x.startsWith("@") || m.scenes[x], id + " -> " + x);
          }
        }
      }
    }
  }
});
test("same UI view choiceId gives same risk object; object argument is rejected", () => {
  for (const r of Object.values(evidence)) {
    for (const final of Object.values(r.paths)) {
      let s = E.create(
        final.missionId,
        final.rng.seed,
        final.attemptId,
        final.startedAt,
      );
      for (const h of final.history) {
        for (const rendered of E.choices(s)) {
          assert.deepEqual(rendered.risk, E.risk(s, rendered.id));
          assert.equal(rendered.available, E.availability(s, rendered.id));
          assert.throws(() => E.risk(s, rendered));
        }
        s = E.choose(s, h.choiceId, s.revision);
      }
    }
  }
});
test("deterministic RNG, actual death and reload, stale revision cannot spend twice", () => {
  for (const r of Object.values(evidence)) {
    for (const expected of Object.values(r.samples)) {
      let s = E.create(
        expected.missionId,
        expected.rng.seed,
        expected.attemptId,
        expected.startedAt,
      );
      for (const h of expected.history) {
        const raw = JSON.stringify(s),
          n = E.choose(s, h.choiceId, s.revision);
        assert.equal(JSON.stringify(s), raw, "pure choose");
        assert.deepEqual(n, E.choose(JSON.parse(raw), h.choiceId, s.revision));
        assert.throws(() => E.choose(n, h.choiceId, s.revision));
        assert.ok(n.hp >= 0 && n.hp <= 100);
        for (const count of Object.values(n.inventory))
          assert.ok(Number.isInteger(count) && count > 0);
        s = JSON.parse(JSON.stringify(n));
      }
      assert.deepEqual(s, expected);
    }
  }
});
const itemCases = [
  [
    "CR01",
    "receipt",
    ["accept", "courier", "receipt", "promise", "pledge"],
    ["accept", "courier", "decline", "promise", "pledge"],
    "argue",
  ],
  [
    "CR02",
    "rope",
    ["go", "warehouse", "rope", "picks", "jump", "shade", "feel", "leave"],
    ["go", "warehouse", "none", "picks", "jump", "shade", "feel", "leave"],
    "balance",
  ],
  [
    "CR03",
    "card",
    [
      "prepare",
      "learn",
      "name",
      "card",
      "library",
      "cabinet",
      "force",
      "secure",
      "leaveBlame",
      "prepared",
    ],
    [
      "prepare",
      "learn",
      "name",
      "pass",
      "library",
      "cabinet",
      "force",
      "secure",
      "leaveBlame",
      "prepared",
    ],
    "composure",
  ],
  [
    "CR04",
    "password",
    [
      "arrive",
      "medical",
      "truth",
      "verify",
      "learn",
      "talk",
      "papersCash",
      "healGroup",
      "martha",
      "reject",
      "signal",
    ],
    [
      "arrive",
      "medical",
      "truth",
      "ignore",
      "talk",
      "papersCash",
      "healGroup",
      "martha",
      "reject",
      "signal",
    ],
    "gamble",
  ],
  [
    "CR05",
    "belt",
    ["inspect", "tune", "belt", "leaveFuel", "industrial", "yard"],
    ["inspect", "tune", "papersOnly", "leaveFuel", "industrial", "yard"],
    "improvise",
  ],
];
for (const [mission, item, yes, no, action] of itemCases)
  test(
    mission +
      " optional " +
      item +
      " changes real outcome for identical seed and choice",
    () => {
      let proof;
      for (let seed = 0; seed < 2000 && !proof; seed++) {
        const a = walk(mission, seed, yes),
          b = walk(mission, seed, no);
        if (
          !a ||
          !b ||
          a.status !== "active" ||
          b.status !== "active" ||
          a.sceneId !== b.sceneId ||
          a.rng.cursor !== b.rng.cursor ||
          !E.availability(a, action) ||
          !E.availability(b, action)
        )
          continue;
        assert.ok(a.inventory[item]);
        assert.ok(!b.inventory[item]);
        const ar = E.risk(a, action),
          br = E.risk(b, action);
        assert.ok(ar.probability < br.probability);
        const x = E.choose(a, action, a.revision),
          y = E.choose(b, action, b.revision);
        if (x.lastEvent.failed !== y.lastEvent.failed) {
          assert.equal(x.lastEvent.roll, y.lastEvent.roll);
          assert.notEqual(x.hp, y.hp);
          proof = {
            mission,
            item,
            seed,
            action,
            scene: a.sceneId,
            withItem: ar.probability,
            withoutItem: br.probability,
            withHp: x.hp,
            withoutHp: y.hp,
          };
        }
      }
      assert.ok(proof, mission);
      fs.writeFileSync(
        "work/criminal/item-" + mission + ".json",
        JSON.stringify(proof, null, 2),
      );
    },
  );
test("healing consumes real dressing, clamps at 100, missing resources unavailable in engine", () => {
  let found = Object.values(evidence.CR01.paths).find(
    (s) => s.hp < 100 && s.hp > 0 && s.status === "finished",
  );
  assert.ok(found);
  let s = E.create(found.missionId, found.rng.seed, found.attemptId, 1);
  for (const h of found.history) {
    if (s.hp < 100 && E.availability(s, "heal")) break;
    s = E.choose(s, h.choiceId, s.revision);
  }
  assert.ok(E.availability(s, "heal"));
  const before = s.inventory.bandage,
    after = E.choose(s, "heal", s.revision);
  assert.equal(after.hp, Math.min(100, s.hp + 35));
  assert.equal(after.inventory.bandage || 0, before - 1);
  assert.equal(after.stats.time, s.stats.time + 1);
  const f = clone(after);
  delete f.inventory.ammo;
  const forced = { ...f, sceneId: "ambush" };
  assert.equal(E.availability(forced, "shoot"), false);
  assert.throws(() => E.choose(forced, "shoot", forced.revision));
});
test("strict replay rejects tampered types, ownership, flags, RNG, objective and invented endings", () => {
  const good = evidence.CR01.samples.clean;
  for (const mutate of [
    (s) => (s.hp = 101),
    (s) => (s.hp = "100"),
    (s) => (s.heroId = "finn"),
    (s) => (s.stats.time = -1),
    (s) => (s.inventory.rope = 1),
    (s) => s.rng.cursor++,
    (s) => (s.schemaVersion = 1),
    (s) => (s.flags.delivered = false),
    (s) => s.history.pop(),
    (s) => (s.unknown = true),
    (s) => (s.terminalId = "dead"),
  ]) {
    const bad = clone(good);
    mutate(bad);
    assert.equal(E.validateState(bad).ok, false);
  }
  const fake = E.create("CR01", 3, "fake_ending_attempt", 1);
  fake.status = "finished";
  fake.terminalId = "clean";
  fake.objective = true;
  assert.equal(E.validateState(fake).ok, false);
  const store = new Store();
  store.data.set(A.key("CR01"), JSON.stringify(fake));
  assert.equal(A.recover(store, fake).ok, false);
  assert.equal(store.getItem(A.LEDGER), null);
});
test("archive recovers crash after terminal save, rewards require confirmed records, unique combination", () => {
  const store = new Store(),
    s = evidence.CR01.samples.clean;
  assert.ok(A.save(store, s, null).ok);
  store.fail = A.LEDGER;
  assert.equal(A.recover(store, s).ok, false);
  assert.equal(store.getItem(A.LEDGER), null);
  store.fail = null;
  assert.ok(A.recover(store, s).ok);
  assert.ok(A.recover(store, s).ok);
  assert.equal(A.ledger(store).value.attempts.length, 1);
  assert.equal(Object.keys(A.ledger(store).value.rewards).length, 1);
  let other = clone(s);
  other.attemptId = "other_valid_attempt";
  assert.ok(E.validateState(other).ok);
  assert.ok(A.save(store, other, JSON.stringify(s)).ok);
  assert.ok(A.recover(store, other).ok);
  assert.equal(A.ledger(store).value.attempts.length, 2);
  assert.equal(Object.keys(A.ledger(store).value.rewards).length, 1);
});
test("corrupt bytes are retained, backup is exact, quota/read errors never claim save or reward", () => {
  const store = new Store(),
    k = A.key("CR01"),
    bytes = '{"hp":\nBROKEN';
  store.data.set(k, bytes);
  const slot = A.load(store, "CR01");
  assert.equal(slot.kind, "corrupt");
  assert.equal(store.getItem(k), bytes);
  store.fail = "write";
  assert.equal(A.backupCorrupt(store, "CR01", bytes, 1).ok, false);
  assert.equal(A.save(store, evidence.CR01.samples.clean, bytes).ok, false);
  assert.equal(store.getItem(k), bytes);
  store.fail = null;
  assert.ok(A.backupCorrupt(store, "CR01", bytes, 1).ok);
  assert.equal(store.getItem(A.PREFIX + "backup_CR01_1"), bytes);
  store.data.set(A.LEDGER, "BROKEN ledger");
  assert.equal(A.ledger(store).ok, false);
  assert.equal(A.recover(store, evidence.CR01.samples.clean).ok, false);
  assert.equal(store.getItem(A.LEDGER), "BROKEN ledger");
  store.fail = "read";
  assert.equal(A.load(store, "CR01").kind, "unavailable");
  assert.equal(A.save(store, evidence.CR01.samples.clean).ok, false);
});
test("concurrent tab CAS refuses older revision overwrite", () => {
  const store = new Store(),
    s = E.create("CR01", 10, "concurrent_attempt", 1);
  const w = A.save(store, s, null);
  const newer = E.choose(s, "accept", 0);
  assert.ok(A.save(store, newer, w.raw).ok);
  assert.equal(A.save(store, s, w.raw).ok, false);
  assert.equal(A.load(store, "CR01").state.revision, 1);
});
test("old detective/campaign bytes are unchanged after CR01–CR05 and archive recovery", () => {
  const store = new Store();
  const names = [
    ...["jack", "finn", "eleanor", "victor", "samuel"].flatMap((hero) => [
      "birmingham_case_smol_heath_v1_" + hero,
      "birmingham_case_v20_findings_" + hero,
      "birmingham_case002_draft_v3_" + hero,
    ]),
    "birmingham_case002_records_draft_v3",
    "birmingham_case002_rewards_draft_v3",
    "birmingham_campaign_records_v1",
    "birmingham_campaign_awards_v1",
    "birmingham_campaign_unique_rewards_v1",
  ];
  for (const [i, k] of names.entries())
    store.data.set(k, " \nold-byte-" + i + " \t");
  const before = names.map((k) => store.getItem(k));
  for (const r of Object.values(evidence)) {
    for (const s of Object.values(r.samples)) {
      assert.ok(A.save(store, s).ok);
      assert.ok(A.recover(store, s).ok);
    }
  }
  assert.deepEqual(
    names.map((k) => store.getItem(k)),
    before,
  );
  assert.ok(
    [...store.data.keys()]
      .filter((k) => !names.includes(k))
      .every((k) => k.startsWith(A.PREFIX)),
  );
});
test("two peaceful bypasses per mission are reached by real histories; no invented item states", () => {
  const routes = {
    CR01: [
      [
        "accept",
        "recon",
        "meetCourier",
        "receipt",
        "promise",
        "pledge",
        "argue",
        "take",
        "yard",
        "coin",
      ],
      [
        "accept",
        "recon",
        "mark",
        "promise",
        "pledge",
        "argue",
        "take",
        "yard",
        "vouch",
      ],
    ],
    CR02: [
      [
        "go",
        "warehouse",
        "rope",
        "picks",
        "line",
        "shade",
        "feel",
        "leave",
        "tether",
      ],
      [
        "go",
        "watchman",
        "honest",
        "borrow",
        "ask",
        "deal",
        "feel",
        "leave",
        "ferry",
      ],
    ],
    CR03: [
      [
        "prepare",
        "learn",
        "name",
        "card",
        "library",
        "cabinet",
        "force",
        "secure",
        "leaveBlame",
        "card",
      ],
      [
        "prepare",
        "learn",
        "name",
        "card",
        "maid",
        "promise",
        "key",
        "portrait",
        "copy",
        "unlock",
        "secure",
        "rescue",
        "trust",
      ],
    ],
    CR04: [
      [
        "arrive",
        "garden",
        "takeKey",
        "truth",
        "verify",
        "learn",
        "talk",
        "papersCash",
        "healGroup",
        "martha",
        "reject",
        "garden",
      ],
      [
        "arrive",
        "medical",
        "truth",
        "verify",
        "learn",
        "talk",
        "verifiedBluff",
        "healGroup",
        "martha",
        "reject",
        "deal",
        "buy",
      ],
    ],
    CR05: [
      [
        "inspect",
        "tune",
        "belt",
        "takeFuel",
        "long",
        "stop",
        "help",
        "promise",
        "refuel",
        "harry",
      ],
      [
        "inspect",
        "tune",
        "belt",
        "takeFuel",
        "industrial",
        "yard",
        "replace",
        "invoice",
        "bargain",
        "leave",
        "refuel",
        "freddie",
      ],
    ],
  };
  for (const [id, paths] of Object.entries(routes))
    for (const path of paths) {
      let proof;
      for (let seed = 0; seed < 200 && !proof; seed++) {
        const s = walk(id, seed, path);
        if (s && s.status === "active") proof = s;
      }
      assert.ok(proof, id + ": " + path.join("/"));
      const last = proof.history.at(-1);
      const prior = walk(id, proof.rng.seed, path.slice(0, -1));
      assert.equal(E.risk(prior, last.choiceId).lethal, false);
      assert.ok(E.risk(prior, last.choiceId).probability < 15);
    }
});
test("both invited cabinet exchange actions are reachable with a genuine original at the end", () => {
  for (const action of ["leverage", "legendDeal"]) {
    let proof;
    for (let seed = 0; seed < 100 && !proof; seed++) {
      const s = walk("CR03", seed, [
        "prepare",
        "learn",
        "name",
        "card",
        "committee",
        "accept",
        "portrait",
        "copy",
        "ask",
        action,
        "secure",
      ]);
      if (s && s.hp > 0) proof = s;
    }
    assert.ok(proof);
    assert.equal(proof.inventory.original, 1);
  }
});
test("early suspicion actually relocates original and Ruth trust provides another reachable bypass", () => {
  let proof;
  for (let seed = 0; seed < 200 && !proof; seed++) {
    const s = walk("CR03", seed, [
      "improvise",
      "bluff",
      "pass",
      "maid",
      "promise",
      "card",
      "follow",
      "ruthTurn",
      "secure",
    ]);
    if (s && s.hp > 0) proof = s;
  }
  assert.ok(proof);
  assert.equal(proof.inventory.original, 1);
  assert.ok(
    proof.history.some(
      (h) => h.from === "conservatory" && h.choiceId === "ruthTurn",
    ),
  );
});
test("a no-roll escape warns when its direct HP cost would kill an already wounded swimmer", () => {
  let proof;
  for (let seed = 0; seed < 3000 && !proof; seed++) {
    const s = walk("CR02", seed, [
      "go",
      "warehouse",
      "rope",
      "picks",
      "jump",
      "shade",
      "feel",
      "leave",
      "balance",
    ]);
    if (s && s.status === "active" && s.sceneId === "water" && s.hp <= 15)
      proof = s;
  }
  assert.ok(proof);
  assert.equal(E.risk(proof, "ropeOut").lethal, true);
  assert.match(E.risk(proof, "ropeOut").reason, /HP/);
  const next = E.choose(proof, "ropeOut", proof.revision);
  assert.equal(next.hp, 0);
  assert.equal(next.terminalId, "dead");
});
test("the witness at zero ends CR04 immediately: no later dialogue, evacuation or revival", () => {
  let proof;
  for (let seed = 0; seed < 3000 && !proof; seed++) {
    const s = walk("CR04", seed, [
      "arrive",
      "medical",
      "command",
      "trustCall",
      "retreat",
      "wait",
      "ammo",
      "heal",
      "none",
      "pay",
      "back",
    ]);
    if (
      s &&
      s.stats.witness === 0 &&
      s.hp > 0 &&
      s.lastEvent.choiceId === "back"
    )
      proof = s;
  }
  assert.ok(proof);
  assert.equal(proof.status, "finished");
  assert.equal(proof.sceneId, "end:failed");
  assert.equal(proof.terminalId, "failed");
  assert.equal(proof.objective, false);
  assert.equal(E.availability(proof, "heal"), false);
  assert.throws(() => E.choose(proof, "persuade", proof.revision));
  assert.ok(E.validateState(proof).ok);
});
