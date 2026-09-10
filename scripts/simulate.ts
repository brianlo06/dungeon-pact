import { createRun, addPlayer, reduce } from "../src/engine/game";
import { availableNodes } from "../src/engine/map";
import { heroes, abilities } from "../src/content/heroes";
import { events } from "../src/content/events";
import type { RunState } from "../src/shared/model";
import type { Intent } from "../src/shared/protocol";
export function simulate(seed: string, count: number): RunState {
  let s = createRun("SIMULATE", seed);
  let steps = 0;
  const send = (id: string, intent: Intent) => {
    s = reduce(s, id, intent, steps * 1000);
  };
  for (let i = 0; i < count; i++) addPlayer(s, `p${i}`, `Hero ${i}`);
  for (let i = 0; i < count; i++) {
    send(`p${i}`, { type: "hero", hero: heroes[i].id });
    send(`p${i}`, { type: "ready", ready: true });
  }
  send("p0", { type: "start" });
  while (s.phase !== "COMPLETE" && steps++ < 600) {
    if (["PACT", "MAP", "EVENT", "CAMP"].includes(s.phase)) {
      const id = s.players.find((p) => !s.votes[p.id])!.id;
      const choice =
        s.phase === "PACT"
          ? "vitality"
          : s.phase === "MAP"
            ? (
                availableNodes(s).find(
                  (n) => n.type === "auction" || n.type === "combat",
                ) ?? availableNodes(s)[0]
              ).id
            : s.phase === "CAMP"
              ? s.gold >= 120
                ? "restore"
                : "rest"
              : events.find((e) => e.id === s.eventId)!.choices.at(-1)!.id;
      send(id, { type: "vote", choice });
    } else if (s.phase === "COMBAT") {
      const p = s.players.find((p) => p.hp > 0 && !s.plans[p.id])!;
      const target = s.enemies.find((e) => e.hp > 0)!;
      const ally = [...s.players]
        .filter((p) => !p.fallen)
        .sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
      const options = abilities(p.heroId).filter(
        (a) => a.cost <= p.resource && !(p.cooldowns[a.id] > 0),
      );
      let a =
        options.find((a) => a.id === "mend" && ally.hp < ally.maxHp * 0.6) ??
        options.find(
          (a) =>
            a.id === "storm" && target.statuses.some((st) => st.id === "wet"),
        ) ??
        options.find(
          (a) =>
            a.id === "dew" && s.players.some((p) => p.heroId === "arcanist"),
        ) ??
        options.find((a) => a.effects.some((e) => e.kind === "damage"))!;
      send(p.id, {
        type: "plan",
        ability: a.id,
        target:
          a.target === "ally"
            ? ally.id
            : a.target === "self"
              ? p.id
              : target.id,
      });
    } else if (s.phase === "AUCTION") {
      const a = s.auction!;
      if (a.stage === "interest") {
        const p = s.players.find((p) => !a.acted.includes(p.id))!;
        send(p.id, {
          type: "interest",
          interested: p.id === "p0" && a.price < s.gold * 0.5,
        });
      } else if (a.stage === "approval") {
        const p = s.players.find((p) => !(p.id in a.approvals))!;
        send(p.id, { type: "approve", approve: true });
      } else if (a.stage === "sold") send("p0", { type: "continue" });
      else throw Error("Unexpected simulation auction");
    } else if (s.phase === "REWARD") send("p0", { type: "continue" });
    else throw Error(`Simulation stalled in ${s.phase}`);
    if (s.gold < 0 || s.players.some((p) => p.hp < 0 || p.hp > p.maxHp))
      throw Error(`Invariant failed on ${seed}`);
  }
  if (s.phase !== "COMPLETE")
    throw Error(`Simulation exceeded action budget: ${seed}`);
  return s;
}
if (process.argv[1]?.endsWith("simulate.ts")) {
  const n = Number(process.argv[2] ?? 50);
  for (const count of [2, 3, 4]) {
    let wins = 0,
      remaining = 0,
      rounds = 0;
    for (let i = 0; i < n; i++) {
      const s = simulate(`balance-${i}`, count);
      wins += Number(s.outcome === "victory");
      remaining += s.gold;
      rounds += s.revision;
    }
    console.log(
      JSON.stringify({
        players: count,
        runs: n,
        wins,
        winRate: wins / n,
        averageFinalGold: Math.round(remaining / n),
        averageCommands: Math.round(rounds / n),
      }),
    );
  }
}
