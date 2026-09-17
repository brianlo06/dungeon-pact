import type { Effect, Enemy, Player, RunState, Unit } from "./model";
import { baseAmount, hitDamage } from "./damage";

/**
 * What an enemy's announced intent will do, read the way the round will
 * resolve it: whom it reaches, how much each hit takes off after Guard,
 * Weak, Empowered and Vulnerable, how much of that Barrier will soak, and the
 * riders that come with it. Pure: the battlefield shows it on the intent chip,
 * and `tests/forecast.test.ts` checks it against what a resolved round did.
 *
 * It is a forecast of the intent as it stands when the party plans. What the
 * party does before the enemy acts — a shield, an interception, a Weak, a
 * kill — changes the outcome, which is the point of showing it.
 */
export interface Forecast {
  /** Nobody is hurt: a brace, a heal, a pressing, a clock still counting. */
  harmless: boolean;
  /** Each hero the intent reaches, with what it does to them. */
  hits: { id: string; name: string; damage: number; blocked: number }[];
  /** How many times each target is struck (a double bite is 2). */
  strikes: number;
  /** Short riders, in the order they read: "Burn 3", "−10 gold", "seizes gear". */
  riders: string[];
  /** Who it is aimed at, in words: a name, "front row", "every hero". */
  aim: string;
}

type State = Pick<RunState, "players" | "enemies" | "gold">;

const standing = (s: State) =>
  s.players.filter((p) => p.hp > 0 && !p.fallen);

function damageOf(list: Effect[]) {
  const direct = list.filter(
    (e): e is Extract<Effect, { kind: "damage" }> =>
      e.kind === "damage" && !e.self,
  );
  const scoped = list.flatMap((e) =>
    e.kind === "enemies"
      ? e.effects.filter(
          (x): x is Extract<Effect, { kind: "damage" }> =>
            x.kind === "damage" && !x.self,
        )
      : [],
  );
  return { direct, scoped };
}

const STATUS_NAMES: Record<string, string> = {
  burn: "Burn",
  poison: "Poison",
  weak: "Weak",
  vulnerable: "Vulnerable",
  marked: "Marked",
  wet: "Wet",
  barrier: "Barrier",
  regen: "Regen",
  empowered: "Empowered",
  heat: "Heat",
  encrusted: "Encrusted",
  lien: "Lien",
  pressure: "Pressure",
  debt: "Debt",
  confused: "Confused",
};

function ridersOf(list: Effect[]): string[] {
  const out: string[] = [];
  for (const e of list) {
    if (e.kind === "status" && !e.self)
      out.push(`${STATUS_NAMES[e.status] ?? e.status} ${e.stacks}`);
    if (e.kind === "gold" && e.amount < 0) out.push(`−${-e.amount} gold`);
    if (e.kind === "seize") out.push("seizes gear");
    if (e.kind === "removeStatus" && e.status === "barrier")
      out.push("strips Barrier");
    if (e.kind === "enemies") out.push(...ridersOf(e.effects));
    if (e.kind === "conditional") {
      const bonus = e.effects.reduce(
        (n, x) => n + (x.kind === "damage" && !x.self ? x.amount : 0),
        0,
      );
      if (bonus) out.push(`+${bonus} ${STATUS_NAMES[e.status] ?? e.status}`);
      for (const r of ridersOf(e.effects)) out.push(`${r} if ${STATUS_NAMES[e.status] ?? e.status}`);
    }
    // Short enough to sit on the chip beside the figure and the aim.
    if (e.kind === "move")
      out.push(
        e.self
          ? "shifts row"
          : e.row === "front"
            ? "pulls front"
            : e.row === "back"
              ? "pushes back"
              : "swaps row",
      );
    if (e.kind === "spawn") out.push(e.on === "target" ? "seals it" : "spawns");
    if (e.kind === "damage" && e.damageType === "lightning") out.push("chains 12");
    if (e.kind === "damage" && e.precision) out.push("+20 Marked");
  }
  return [...new Set(out)];
}

/** Every hero an enemy's announced move will strike directly, if any. */
function directVictims(s: State, enemy: Enemy): Player[] {
  const a = enemy.intent.ability;
  if (!a.effects.some((e) => e.kind === "damage" && !e.self)) return [];
  if (enemy.statuses.some((x) => x.id === "interrupted")) return [];
  if (a.target === "enemyRow") {
    const row =
      enemy.intent.row ??
      s.players.find((p) => p.id === enemy.intent.target)?.row;
    return standing(s).filter((p) => p.row === row);
  }
  if (a.target !== "enemy") return [];
  const aimed = s.players.find((p) => p.id === enemy.intent.target);
  const target = aimed && aimed.hp > 0 ? aimed : standing(s)[0];
  return target ? [target] : [];
}

/**
 * The enemy whose hit calls in a hero's lien: the first, in the order enemies
 * act (fastest first), to land a direct hit on its carrier. A lien is called
 * once; every later hit that round finds it gone.
 */
function lienCaller(s: State, heroId: string): string | undefined {
  return [...s.enemies]
    .filter((e) => e.hp > 0)
    .sort((a, b) => b.speed - a.speed)
    .find((e) => directVictims(s, e).some((v) => v.id === heroId))?.id;
}

export function forecastIntent(s: State, enemy: Enemy): Forecast {
  const a = enemy.intent.ability;
  const { direct, scoped } = damageOf(a.effects);
  const riders = ridersOf(a.effects);
  const aimed = [...s.players, ...s.enemies].find(
    (u) => u.id === enemy.intent.target,
  );
  let victims: Player[] = [];
  let aim = "";
  if (scoped.length) {
    victims = standing(s);
    aim = "every hero";
  } else if (a.target === "enemyRow") {
    const row =
      enemy.intent.row ??
      s.players.find((p) => p.id === enemy.intent.target)?.row;
    victims = standing(s).filter((p) => p.row === row);
    aim = row ? `${row} row` : "";
  } else if (a.target === "enemy") {
    // A fallen target is replaced by the first hero still standing, as the
    // engine does when the enemy acts.
    const target =
      aimed && "heroId" in aimed && aimed.hp > 0
        ? (aimed as Player)
        : standing(s)[0];
    victims = target ? [target] : [];
    aim = target?.name ?? "";
  } else {
    aim = aimed && aimed.id !== enemy.id ? aimed.name : "";
  }
  const strikes = [...direct, ...scoped];
  const hits = strikes.length
    ? victims.map((v: Unit) => {
        // A guarded hero's first direct hit is taken by whoever guards them.
        const link = v.statuses.find((x) => x.id === "guarded");
        const guard = link
          ? s.players.find(
              (p) => p.id === link.sourceId && p.hp > 0 && !p.fallen,
            )
          : undefined;
        const struck = (i: number): Unit =>
          guard && i === 0 && direct.length ? guard : v;
        const damage =
          strikes.reduce(
            (n, e, i) =>
              n +
              hitDamage(baseAmount(e, enemy), enemy, struck(i), {
                pierce: e.pierce,
                precision: e.precision,
              }),
            0,
          ) +
          // A bonus the move carries against a status its target already has.
          a.effects.reduce(
            (n, fx) =>
              fx.kind === "conditional" &&
              v.statuses.some((x) => x.id === fx.status)
                ? n +
                  fx.effects.reduce(
                    (m, x) =>
                      x.kind === "damage" && !x.self
                        ? m +
                          hitDamage(baseAmount(x, enemy), enemy, v, {
                            pierce: x.pierce,
                            precision: x.precision,
                          })
                        : m,
                    0,
                  )
                : n,
            0,
          );
        // A direct hit calls in a lien on the one it lands on.
        const struckUnit = guard && direct.length ? guard : v;
        const lien =
          direct.length && lienCaller(s, struckUnit.id) === enemy.id
            ? (struckUnit.statuses.find((x) => x.id === "lien")?.stacks ?? 0)
            : 0;
        const barrier =
          v.statuses.find((x) => x.id === "barrier")?.stacks ?? 0;
        return {
          id: v.id,
          name: guard && direct.length ? `${guard.name} for ${v.name}` : v.name,
          damage: damage + lien,
          blocked:
            guard && direct.length ? 0 : Math.min(barrier, damage + lien),
        };
      })
    : [];
  return {
    harmless: hits.length === 0,
    hits,
    strikes: strikes.length,
    riders,
    aim,
  };
}

/**
 * The damage that cracks an enemy's announced move this round: `per` for each
 * hero, halved while the enemy is Wet (quenched). Infinity for a move that
 * does not crack. The engine resolves with this, and the chip counts toward it.
 */
export function crackAt(
  s: Pick<RunState, "players">,
  e: Pick<Enemy, "intent" | "statuses">,
) {
  const cracks = e.intent.ability.cracks;
  if (!cracks) return Infinity;
  const wet = e.statuses.some((x) => x.id === "wet");
  return Math.round(cracks.per * s.players.length * (wet ? 0.5 : 1));
}

/** The damage line a chip shows: "34", "12–18 each", or "2 × 9". */
export function damageLabel(f: Forecast) {
  if (f.harmless) return "";
  const values = f.hits.map((h) => h.damage);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const each = f.hits.length > 1 ? " each" : "";
  if (f.strikes > 1 && f.hits.length === 1 && low % f.strikes === 0)
    return `${f.strikes} × ${low / f.strikes}`;
  return low === high ? `${low}${each}` : `${low}–${high}${each}`;
}
