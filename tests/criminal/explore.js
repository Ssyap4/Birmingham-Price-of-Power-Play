"use strict";
const C = require("../../src/criminal/content");
for (let i = 1; i <= 5; i++) require("../../src/criminal/missions/cr0" + i);
const E = require("../../src/criminal/engine");
function explore(count = 400) {
  const results = {};
  for (const m of Object.values(C.missions)) {
    const endings = {},
      nodes = new Set(),
      routes = new Set(),
      samples = {},
      paths = {},
      edges = new Set();
    let deadlocks = [];
    for (let seed = 0; seed < count; seed++) {
      let s = E.create(m.id, seed, `explore_${m.id}_${seed}`, 1),
        x = (seed + 5) * 4531;
      while (s.status === "active" && s.revision < 65) {
        nodes.add(s.sceneId);
        const cs = E.choices(s).filter((c) => c.available);
        if (!cs.length) {
          deadlocks.push(s);
          break;
        }
        x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
        const c = cs[(x >>> 12) % cs.length];
        edges.add(s.sceneId + ":" + c.id);
        s = E.choose(s, c.id, s.revision);
      }
      if (s.status === "active")
        throw Error("Active or loop " + m.id + " " + s.sceneId);
      const route = s.history.map((h) => h.from).join(">");
      routes.add(route);
      endings[s.terminalId] = (endings[s.terminalId] || 0) + 1;
      samples[s.terminalId] ??= s;
      for (const h of s.history) paths[h.from] ??= s;
    }
    results[m.id] = {
      sceneCount: Object.keys(m.scenes).length,
      visited: [...nodes],
      unvisited: Object.keys(m.scenes).filter((k) => !nodes.has(k)),
      choiceCount: Object.values(m.scenes).reduce(
        (a, n) => a + n.choices.length,
        0,
      ),
      edgeCount: edges.size,
      edgeIds: [...edges],
      routes: routes.size,
      endings,
      samples,
      paths,
      deadlocks,
    };
  }
  return results;
}
module.exports = { C, E, explore };
if (require.main === module) {
  const fs = require("node:fs");
  const result = explore(Number(process.argv[2]) || 400);
  fs.mkdirSync("work/criminal", { recursive: true });
  fs.writeFileSync(
    "work/criminal/exploration.json",
    JSON.stringify(result, null, 2),
  );
  for (const [id, r] of Object.entries(result))
    console.log(
      id,
      JSON.stringify({
        scenes: r.sceneCount,
        visited: r.visited.length,
        unvisited: r.unvisited,
        routes: r.routes,
        endings: r.endings,
        edges: r.edgeCount + "/" + r.choiceCount,
        deadlocks: r.deadlocks.length,
      }),
    );
}
