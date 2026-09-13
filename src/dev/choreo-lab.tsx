import { useEffect, useRef, useState } from "react";
import type { Beat, GameLog, RunState, Snapshot } from "../shared/model";
import type { Archetype } from "../shared/presentation";
import { abilities } from "../content/heroes";
import { enemies, enemyAbilities } from "../content/enemies";
import type { LabApi, LabHooks } from "../client/components/Combat";

/**
 * The Battle Lab's choreography panel. Development only.
 *
 * It plays one move on demand — a chosen actor, target and ability, and
 * optionally a forced archetype — by appending synthesised beats to the
 * lab's own copy of the run's chronicle, which the director then replays
 * exactly as it replays a real round. Nothing in the run changes: no health,
 * no statuses, no turn order. When the replay ends the board is the board it
 * was, so a health bar that dipped springs back. That is the point: this is a
 * stage for looking at choreography, not a way to play.
 *
 * Everything is reachable from the page as `window.__lab`, which is what the
 * browser tests drive.
 */

export type LabMove =
  | "ability"
  | "melee"
  | "bow"
  | "projectile"
  | "beam"
  | "area"
  | "multi"
  | "interrupt";

export interface LabRequest {
  actor: string;
  target: string;
  /** An ability name from the actor's own list; defaults to its first strike. */
  ability?: string;
  move?: LabMove;
  /** Damage each beat reports. */
  amount?: number;
}

/** The abilities a unit could be shown using, by name. */
export function abilityNames(s: Snapshot, id: string): string[] {
  const enemy = s.enemies.find((e) => e.id === id);
  if (enemy) {
    const def = enemies.find((d) => d.id === enemy.definition);
    return def ? enemyAbilities(def, s.combatVersion).map((a) => a.name) : [];
  }
  const hero = s.players.find((p) => p.id === id);
  return hero
    ? abilities(
        hero.heroId,
        s.combatVersion,
        hero.upgrades,
        hero.evolution,
        hero.items,
      ).map((a) => a.name)
    : [];
}

/** Whether a named ability of a unit's heals and deals no damage. */
function heals(s: Snapshot, id: string, name: string): boolean {
  const enemy = s.enemies.find((e) => e.id === id);
  const hero = s.players.find((p) => p.id === id);
  const list = enemy
    ? enemyAbilities(enemies.find((d) => d.id === enemy.definition)!, s.combatVersion)
    : hero
      ? abilities(hero.heroId, s.combatVersion, hero.upgrades, hero.evolution, hero.items)
      : [];
  const a = list.find((x) => x.name === name);
  return (
    !!a &&
    a.effects.some((e) => e.kind === "heal") &&
    !a.effects.some((e) => e.kind === "damage")
  );
}

const ARCHETYPE: Partial<Record<LabMove, Archetype>> = {
  melee: "melee",
  bow: "bow",
  projectile: "projectile",
  beam: "beam",
  area: "area",
};

/**
 * The beats one requested move would produce, and the archetype to force.
 * The numbers are for show; nothing reads them back into the run.
 */
export function synthesise(
  s: Snapshot,
  req: LabRequest,
): { beats: Beat[]; archetype?: Archetype } {
  const units = [...s.players, ...s.enemies];
  const actor = units.find((u) => u.id === req.actor);
  const target = units.find((u) => u.id === req.target);
  if (!actor || !target) return { beats: [] };
  const names = abilityNames(s, actor.id);
  const move = req.move ?? "ability";
  const label =
    move === "interrupt"
      ? (names.find((n) => /break|stillness|flash/i.test(n)) ?? "Break focus")
      : (req.ability ?? names[0] ?? "Strike");
  const amount = req.amount ?? 14;
  const hit = (to: typeof target, n = amount): Beat => ({
    kind: "damage",
    actor: actor.id,
    target: to.id,
    amount: n,
    hp: Math.max(0, to.hp - n),
  });
  const cast: Beat = { kind: "cast", actor: actor.id, target: target.id, label };
  if (move === "interrupt")
    return {
      beats: [
        cast,
        { kind: "combo", label: "INTERRUPTED", actor: actor.id, target: target.id },
      ],
      archetype: "spell",
    };
  if (move === "area") {
    const side = s.enemies.some((e) => e.id === target.id) ? s.enemies : s.players;
    const row = side.filter((u) => u.row === target.row && u.hp > 0);
    return { beats: [cast, ...row.map((u) => hit(u))], archetype: "area" };
  }
  if (move === "multi")
    return { beats: [cast, hit(target, 7), hit(target, 7)], archetype: "melee" };
  if (target.id === actor.id)
    return {
      beats: [cast, { kind: "heal", actor: actor.id, target: actor.id, amount: 8, hp: actor.hp }],
    };
  // A repair on an ally is shown as the heal it is, not as a hit.
  if (move === "ability" && heals(s, actor.id, label))
    return {
      beats: [cast, { kind: "heal", actor: actor.id, target: target.id, amount: amount, hp: target.hp }],
    };
  return { beats: [cast, hit(target)], archetype: ARCHETYPE[move] };
}

/** Append beats to the lab's run as chronicle entries. */
export function withBeats(run: RunState, beats: Beat[]): RunState {
  let seq = run.eventSeq;
  const logs: GameLog[] = beats.map((beat) => ({
    seq: ++seq,
    text: `[lab] ${beat.kind} ${beat.label ?? ""}`,
    kind: "info",
    beat,
  }));
  return { ...run, logs: [...run.logs, ...logs].slice(-100), eventSeq: seq };
}

interface LabWindow {
  __lab?: {
    play: (req: LabRequest) => void;
    api: () => LabApi | null;
    setDebug: (on: boolean) => void;
  };
}

/**
 * The panel, and the hooks it hands the fight. `forced` carries the
 * archetype each synthesised move asked for; it applies to lab beats only,
 * found by their cast beat's identity.
 */
export function useChoreoLab(
  s: Snapshot,
  run: RunState,
  setRun: (r: RunState) => void,
  debugAtStart: boolean,
) {
  const api = useRef<LabApi | null>(null);
  /**
   * The move the lab last asked for, matched by actor, target and label —
   * the snapshot clones every beat, so identity cannot be used. Cleared
   * when a real round is played.
   */
  const pending = useRef<{
    key: string;
    archetype?: Archetype;
    strikes?: number;
  } | null>(null);
  const keyOf = (b: Beat) => `${b.actor}|${b.target}|${b.label}`;
  const [debug, setDebug] = useState(debugAtStart);
  const runRef = useRef(run);
  runRef.current = run;
  const snapRef = useRef(s);
  snapRef.current = s;

  const hooks = useRef<LabHooks>({
    attach: (a) => {
      api.current = a;
      if (a) a.stagehand.debug = debugRef.current;
    },
    plan: {
      archetype: (cast) =>
        pending.current?.key === keyOf(cast)
          ? pending.current.archetype
          : undefined,
      strikes: (cast) =>
        pending.current?.key === keyOf(cast)
          ? pending.current.strikes
          : undefined,
    },
  });
  const debugRef = useRef(debug);
  debugRef.current = debug;
  useEffect(() => {
    if (api.current) api.current.stagehand.debug = debug;
  }, [debug]);

  const play = (req: LabRequest) => {
    const { beats, archetype } = synthesise(snapRef.current, req);
    if (!beats.length) return;
    pending.current = {
      key: keyOf(beats[0]),
      archetype,
      strikes: req.move === "multi" ? 2 : undefined,
    };
    setRun(withBeats(runRef.current, beats));
  };

  useEffect(() => {
    (window as LabWindow).__lab = {
      play,
      api: () => api.current,
      setDebug,
    };
  });

  /** A real round is about to play: the lab's overrides no longer apply. */
  const clear = () => (pending.current = null);

  return { hooks: hooks.current, play, clear, debug, setDebug, api };
}

export function ChoreoPanel({
  s,
  lab,
}: {
  s: Snapshot;
  lab: ReturnType<typeof useChoreoLab>;
}) {
  const units = [...s.players, ...s.enemies].filter((u) => u.hp > 0);
  const [actor, setActor] = useState(units[0]?.id ?? "");
  const [target, setTarget] = useState(
    s.enemies.find((e) => e.hp > 0)?.id ?? "",
  );
  const names = abilityNames(s, actor);
  const [ability, setAbility] = useState("");
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [phase, setPhase] = useState("");
  useEffect(() => {
    const id = setInterval(() => {
      const el = document.querySelector<HTMLElement>(
        `.combatant[data-unit="${actor}"]`,
      );
      setPhase(el?.dataset.choreo ?? "");
    }, 100);
    return () => clearInterval(id);
  }, [actor]);
  const go = (move: LabMove) =>
    lab.play({ actor, target, ability: ability || names[0], move });
  return (
    <aside className="choreo-panel" aria-label="Choreography lab">
      <strong>CHOREOGRAPHY</strong>
      <label>
        Actor
        <select value={actor} onChange={(e) => setActor(e.target.value)}>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Target
        <select value={target} onChange={(e) => setTarget(e.target.value)}>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Ability
        <select value={ability} onChange={(e) => setAbility(e.target.value)}>
          {names.map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <div className="choreo-buttons">
        <button onClick={() => go("ability")}>Its own</button>
        <button onClick={() => go("melee")}>Melee</button>
        <button onClick={() => go("bow")}>Bow</button>
        <button onClick={() => go("projectile")}>Projectile</button>
        <button onClick={() => go("beam")}>Beam</button>
        <button onClick={() => go("area")}>AoE</button>
        <button onClick={() => go("multi")}>Multi-hit</button>
        <button onClick={() => go("interrupt")}>Interrupt</button>
      </div>
      <div className="choreo-buttons">
        {[0.25, 0.5, 1, 2].map((n) => (
          <button
            key={n}
            data-on={speed === n ? "" : undefined}
            onClick={() => {
              setSpeed(n);
              lab.api.current?.setSpeed(n);
            }}
          >
            {n}×
          </button>
        ))}
        <button
          onClick={() => {
            setPaused(!paused);
            lab.api.current?.setPaused(!paused);
          }}
        >
          {paused ? "Resume" : "Pause"}
        </button>
        <button onClick={() => lab.api.current?.frameStep()}>Frame ▸</button>
      </div>
      <label>
        <input
          type="checkbox"
          checked={lab.debug}
          onChange={(e) => lab.setDebug(e.target.checked)}
        />{" "}
        Debug overlay
      </label>
      <output>{phase || "—"}</output>
    </aside>
  );
}
