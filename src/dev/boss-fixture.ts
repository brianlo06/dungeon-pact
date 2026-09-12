import { addPlayer, createRun, reduce } from "../engine/game";
import { enterCombat, prepareIntents, standing } from "../engine/combat";
import { effects } from "../engine/effects";
import { items } from "../content/items";
import { encounters } from "../content/encounters";
import type { RunState } from "../shared/model";

export type Boss = "collector" | "miser";
/**
 * `windup` is the first round in which the boss — or, in an ordinary
 * encounter, any enemy — has an interruptible move announced, so the held
 * windup pose can be looked at without playing rounds to reach it.
 */
export type Stage =
  "opening" | "objective" | "resolved" | "released" | "windup";
export interface FixtureOptions {
  boss: Boss;
  size: 2 | 3 | 4;
  stage: Stage;
  gold: number;
  legacy: boolean;
  /** Drop a hero, so the downed and revival presentation can be inspected. */
  downed?: boolean;
  /** Give a hero an absurd name, to prove the layout survives real content. */
  longNames?: boolean;
  /**
   * Fight an ordinary encounter instead of the boss, so every enemy in the
   * bestiary can be put on the stage by URL. `boss` is ignored when set.
   */
  encounter?: string;
  /** Which classes the party fields, in seat order. */
  heroes?: string[];
  /**
   * One enemy left on one hit point and the rest already down, so the blow
   * that ends a chamber can be struck on purpose. The stage used to cut to the
   * upgrade screen the instant the server called it, and there was no way to
   * stage that moment without playing a whole fight to reach it.
   */
  finisher?: boolean;
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
  const classes = options.heroes?.length
    ? options.heroes
    : ["vanguard", "arcanist", "ranger", "warden"];
  const formation = options.encounter
    ? encounters.find((e) => e.id === options.encounter)?.formations[
        options.size
      ]
    : undefined;
  if (options.encounter && !formation)
    throw Error(`No encounter called ${options.encounter}`);
  const names = options.longNames
    ? [
        "Adelheid of the Long Ledger",
        "Bramwell Thricebound",
        "Coraline Quillbreaker",
        "Dainsleif the Unpaid",
      ]
    : ["Ada", "Bram", "Cora", "Dain"];
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
        biome: encounters.find((e) => e.id === options.encounter)?.biome,
        lane: 0,
        type: formation ? "combat" : "boss",
        name: formation ? "A Foundry Chamber" : "The Counting House",
        next: [],
        visited: true,
      },
    ];
    s.currentNode = "preview-vault";
    enterCombat(s, !formation);
    if (formation) {
      // The encounter is picked by the run's RNG, so search seeds for it.
      if (s.enemies.map((e) => e.definition).join() !== formation.join())
        continue;
    } else if (s.enemies[0].definition !== options.boss) continue;
    if (options.stage === "windup") {
      const watched = formation ? s.enemies : s.enemies.slice(0, 1);
      const winding = () =>
        watched.some((e) => e.hp > 0 && e.intent.ability.interruptible);
      // Rounds past the escalation clock would change the numbers; stop short.
      for (let round = 2; round <= 6 && !winding(); round++) {
        s.round = round;
        prepareIntents(s);
      }
    } else if (!formation && options.stage !== "opening") {
      s.round = options.boss === "collector" ? (options.legacy ? 2 : 3) : 1;
      prepareIntents(s);
    }
    if (options.stage === "resolved" || options.stage === "released")
      s = finishPreviewRound(s);
    if (options.downed) {
      const victim = s.players[s.players.length - 1];
      effects(s, s.enemies[0], victim, [
        { kind: "damage", amount: victim.maxHp + 50 },
      ]);
      prepareIntents(s);
    }
    if (options.stage === "released") {
      const box = s.enemies.find((e) => e.definition === "strongbox");
      // A visual fixture for the break moment; normal play remains available below.
      if (box && box.hp > 0)
        effects(s, s.players[0], box, [
          { kind: "damage", amount: box.hp + 100 },
        ]);
      prepareIntents(s);
    }
    if (options.finisher) {
      s.enemies.forEach((e, i) => {
        e.hp = i === 0 ? 1 : 0;
        e.statuses = [];
      });
      s.players.forEach((p) => {
        p.items = [];
        p.statuses = [];
      });
      s.players
        .slice(1)
        .forEach((p) => (s.plans[p.id] = { ability: "brace", target: p.id }));
    }
    return s;
  }
  throw Error(`No fixture seed found for ${options.encounter ?? options.boss}`);
}
