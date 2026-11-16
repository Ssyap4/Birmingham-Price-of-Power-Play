"use strict";
const { C, E } = require("./explore"),
  assert = require("node:assert/strict"),
  fs = require("node:fs");
const plans = {
  CR01: {
    care: [
      "accept",
      "recon",
      "mark",
      "promise",
      "pledge",
      "argue",
      "take",
      "yard",
      "vouch",
      "carry",
      "laundry",
      "decoy",
      "slip",
      "deliver",
    ],
    risk: [
      "accept",
      "front",
      "threat",
      "argue",
      "take",
      "break",
      "follow",
      "abandon",
      "rush",
      "waitGap",
      "deliver",
    ],
  },
  CR02: {
    care: [
      "go",
      "warehouse",
      "lamp",
      "picks",
      "ask",
      "delay",
      "distract",
      "light",
      "free",
      "boatPath",
      "row",
      "check",
      "intact",
      "deliver",
    ],
    risk: [
      "go",
      "planks",
      "jump",
      "brawl",
      "feel",
      "leave",
      "balance",
      "holdOn",
      "sprint",
      "deliver",
    ],
  },
  CR03: {
    care: [
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
      "garden",
      "original",
    ],
    risk: [
      "improvise",
      "bluff",
      "pass",
      "library",
      "cabinet",
      "force",
      "secure",
      "leaveBlame",
      "run",
      "sprint",
      "original",
    ],
  },
  CR04: {
    care: [
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
      "unlock",
      "verified",
      "trust",
      "deliver",
    ],
    risk: [
      "arrive",
      "barricade",
      "cover",
      "command",
      "trustCall",
      "retreat",
      "threat",
      "ammo",
      "none",
      "pay",
      "back",
      "hold",
      "shot",
      "gamble",
      "persuade",
      "deliver",
    ],
  },
  CR05: {
    care: [
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
      "enter",
      "deliver",
    ],
    risk: [
      "leaveNow",
      "fast",
      "speed",
      "race",
      "leave",
      "road",
      "force",
      "deliver",
    ],
  },
};
const result = {};
for (const [id, types] of Object.entries(plans)) {
  result[id] = {};
  for (const [type, actions] of Object.entries(types)) {
    let proof;
    for (let seed = 0; seed < 10000 && !proof; seed++) {
      let s = E.create(id, seed, "playthrough_" + id + "_" + type, 1);
      let invalid = false;
      for (const action of actions) {
        if (s.status !== "active") break;
        if (!E.availability(s, action)) {
          invalid = true;
          break;
        }
        s = E.choose(s, action, s.revision);
      }
      if (
        !invalid &&
        s.status === "finished" &&
        (type === "care" ? s.terminalId === "clean" : s.terminalId === "dead")
      )
        proof = s;
    }
    assert.ok(proof, id + " " + type);
    result[id][type] = proof;
    console.log(
      id,
      type,
      "seed",
      proof.rng.seed,
      proof.terminalId,
      "HP",
      proof.hp,
      "time",
      proof.stats.time,
      proof.history.map((h) => h.from + ":" + h.choiceId).join(" → "),
    );
  }
}
fs.writeFileSync(
  "work/criminal/playthroughs.json",
  JSON.stringify(result, null, 2),
);
module.exports = { plans };
