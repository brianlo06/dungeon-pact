import { addPlayer, createRun, reduce } from "../engine/game";
import { enterCombat, prepareIntents, standing } from "../engine/combat";
import { effects } from "../engine/effects";
import { items } from "../content/items";
import type { RunState } from "../shared/model";

export type Boss = "collector" | "miser";
export type Stage = "opening" | "objective" | "resolved" | "released";
export interface FixtureOptions {
  boss: Boss;
  size: 2 | 3 | 4;
  stage: Stage;
  gold: number;
  legacy: boolean;
}

/** Supply the remaining players' legal Brace plans through the real reducer. */
export function finishPreviewRound(state: RunState): RunState {
  let s = state;
  const round = s.round;
  for (const p of standing(s)) {
    if (s.phase !== "COMBAT" || s.round !== round) break;
    if (!s.plans[p.id])
      s = reduce(s, p.id, { type: "plan", ability: "brace", target: p.id }, 0);
  }
  return s;
}

/** Seed selection preserves the engine's actual boss stats and support formation. */
export function bossFixture(options: FixtureOptions): RunState {
  const classes = ["vanguard", "arcanist", "ranger", "warden"];
  const names = ["Ada", "Bram", "Cora", "Dain"];
  for (let seed = 0; seed < 100; seed++) {
    let s = createRun("PREVIEW", `boss-preview-${seed}`);
    if (options.legacy) {
      delete s.combatVersion;
      delete s.encounterVersion;
    }
    for (let i = 0; i < options.size; i++) {
      addPlayer(s, `preview-${i}`, names[i]);
      s = reduce(s, `preview-${i}`, { type: "hero", hero: classes[i] }, 0);
      const p = s.players[i];
      p.row = i < 2 ? "front" : "back";
      p.items = ["thornmail", "stormglass"];
      p.spent = p.items.reduce(
        (sum, id) => sum + items.find((x) => x.id === id)!.price,
        0,
      );
    }
    s.gold = options.gold;
    s.map = [
      {
        id: "preview-vault",
        depth: 6,
        lane: 0,
        type: "boss",
        name: "The Counting House",
        next: [],
        visited: true,
      },
    ];
    s.currentNode = "preview-vault";
    enterCombat(s, true);
    if (s.enemies[0].definition !== options.boss) continue;
    if (options.stage !== "opening") {
      s.round = options.boss === "collector" ? (options.legacy ? 2 : 3) : 1;
      prepareIntents(s);
    }
    if (options.stage === "resolved" || options.stage === "released")
      s = finishPreviewRound(s);
    if (options.stage === "released") {
      const box = s.enemies.find((e) => e.definition === "strongbox");
      // A visual fixture for the break moment; normal play remains available below.
      if (box && box.hp > 0)
        effects(s, s.players[0], box, [
          { kind: "damage", amount: box.hp + 100 },
        ]);
      prepareIntents(s);
    }
    return s;
  }
  throw Error(`No fixture seed found for ${options.boss}`);
}
