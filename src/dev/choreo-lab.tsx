import { useEffect, useRef, useState } from "react";
import type { Beat, GameLog, RunState, Snapshot } from "../shared/model";
import type { Archetype } from "../shared/presentation";
import { abilities } from "../content/heroes";
import { enemies, enemyAbilities } from "../content/enemies";
import { reduce } from "../engine/game";
import type { LabApi, LabHooks } from "../client/components/Combat";
import type { TraceEvent } from "../client/battle/trace";
import { finishPreviewRound } from "./boss-fixture";

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
  // A blow that empties a health bar is followed by the fall, as the engine
  // logs it; a second blow on a fallen target is never synthesised.
  const hp = new Map(units.map((u) => [u.id, u.hp]));
  const hit = (to: typeof target, n = amount): Beat[] => {
    const left = hp.get(to.id) ?? 0;
    if (left <= 0) return [];
    const dealt = Math.min(left, n);
    hp.set(to.id, left - dealt);
    const beat: Beat = {
      kind: "damage",
      actor: actor.id,
      target: to.id,
      amount: dealt,
      hp: left - dealt,
    };
    return left - dealt > 0
      ? [beat]
      : [beat, { kind: "defeat", target: to.id, hp: 0 }];
  };
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
    return { beats: [cast, ...row.flatMap((u) => hit(u))], archetype: "area" };
  }
  if (move === "multi")
    return {
      beats: [
        cast,
        ...hit(target, Math.ceil(amount / 2)),
        ...hit(target, Math.ceil(amount / 2)),
      ],
      archetype: "melee",
    };
  if (target.id === actor.id)
    return {
      beats: [cast, { kind: "heal", actor: actor.id, target: actor.id, amount: 8, hp: actor.hp }],
    };
  return { beats: [cast, ...hit(target)], archetype: ARCHETYPE[move] };
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

/** One hero's plan for a real round: names or ids. */
export interface LabPlan {
  actor: string;
  ability: string;
  target?: string;
}

/** A trace record: a replay event, or what the page itself showed. */
export type LabTrace =
  | (TraceEvent & { at: number })
  | {
      /** A damage number appeared, a health bar changed, a rig changed clip. */
      kind: "pop" | "hp" | "clip";
      t: number;
      at: number;
      unit: string;
      name: string;
    };

interface LabWindow {
  __lab?: {
    play: (req: LabRequest) => void;
    /** Several synthesised moves as one round, in order. */
    playRound: (reqs: LabRequest[]) => void;
    /** A real round: these plans, everyone else braces, the engine resolves. */
    round: (plans: LabPlan[]) => void;
    api: () => LabApi | null;
    setDebug: (on: boolean) => void;
    /**
     * Everything recorded since the last `clearTrace`. `at` is presentation
     * milliseconds since the round it belongs to began.
     */
    trace: () => LabTrace[];
    /** Start tracing, or start again from nothing. */
    clearTrace: () => void;
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
  const pending = useRef<
    {
      key: string;
      archetype?: Archetype;
      strikes?: number;
    }[]
  >([]);
  const keyOf = (b: Beat) => `${b.actor}|${b.target}|${b.label}`;
  const forced = (cast: Beat) =>
    pending.current.find((p) => p.key === keyOf(cast));
  /** The trace, and when the round each record belongs to began. */
  const records = useRef<LabTrace[]>([]);
  const roundAt = useRef(0);
  const record = (e: TraceEvent) => {
    if (e.kind === "round") roundAt.current = e.t;
    records.current.push({ ...e, at: e.t - roundAt.current });
  };
  const [debug, setDebug] = useState(debugAtStart);
  const runRef = useRef(run);
  runRef.current = run;
  const snapRef = useRef(s);
  snapRef.current = s;

  // Tracing costs a mutation observer over the whole stage and a marker
  // check on every rig every frame, so it is off until something asks for it
  // — the frame-rate checks run in this lab too.
  const [tracing, setTracing] = useState(false);
  const base = useRef<LabHooks>({
    attach: (a) => {
      api.current = a;
      if (a) a.stagehand.debug = debugRef.current;
    },
    plan: {
      archetype: (cast) => forced(cast)?.archetype,
      strikes: (cast) => forced(cast)?.strikes,
    },
  });
  const traced = useRef<LabHooks>({ ...base.current, trace: (e) => record(e) });
  const hooks = tracing ? traced.current : base.current;
  const debugRef = useRef(debug);
  debugRef.current = debug;
  useEffect(() => {
    if (api.current) api.current.stagehand.debug = debug;
  }, [debug]);

  const playRound = (reqs: LabRequest[]) => {
    const all: Beat[] = [];
    pending.current = [];
    for (const req of reqs) {
      const { beats, archetype } = synthesise(snapRef.current, req);
      if (!beats.length) continue;
      pending.current.push({
        key: keyOf(beats[0]),
        archetype,
        strikes: req.move === "multi" ? 2 : undefined,
      });
      all.push(...beats);
    }
    if (all.length) setRun(withBeats(runRef.current, all));
  };
  const play = (req: LabRequest) => playRound([req]);

  /** A real round, resolved by the engine from these plans. */
  const round = (plans: LabPlan[]) => {
    const snap = snapRef.current;
    const units = [...snap.players, ...snap.enemies];
    const find = (key?: string) =>
      units.find((u) => u.id === key || u.name === key);
    let r = runRef.current;
    const before = r.round;
    for (const plan of plans) {
      const player = snap.players.find(
        (p) => p.id === plan.actor || p.name === plan.actor,
      );
      if (!player) throw Error(`No hero ${plan.actor}`);
      const ability = abilities(
        player.heroId,
        snap.combatVersion,
        player.upgrades,
        player.evolution,
        player.items,
      ).find((a) => a.id === plan.ability || a.name === plan.ability);
      if (!ability) throw Error(`${player.name} has no ${plan.ability}`);
      const target =
        ability.target === "self"
          ? player.id
          : (find(plan.target)?.id ?? player.id);
      r = reduce(r, player.id, { type: "plan", ability: ability.id, target }, 0);
    }
    pending.current = [];
    // Everyone not planned braces — unless the plans already resolved it.
    setRun(r.round === before && r.phase === "COMBAT" ? finishPreviewRound(r) : r);
  };

  // What the page showed, as it showed it: numbers appearing, health bars
  // changing and rigs changing clip, stamped with the presentation clock.
  useEffect(() => {
    if (!tracing) return;
    let observer: MutationObserver | null = null;
    const find = setInterval(() => {
      const layer = document.querySelector(".layer-units");
      if (!layer || !api.current || observer) return;
      const unitOf = (n: Element) =>
        n.closest<HTMLElement>(".combatant")?.dataset.unit ?? "";
      const push = (kind: "pop" | "hp" | "clip", unit: string, name: string) => {
        const t = api.current?.loop.clock.time ?? 0;
        records.current.push({ kind, t, at: t - roundAt.current, unit, name });
      };
      observer = new MutationObserver((list) => {
        for (const m of list) {
          if (m.type === "childList") {
            for (const n of m.addedNodes)
              if (n instanceof HTMLElement && n.classList.contains("combatant-pop"))
                push("pop", unitOf(n), n.textContent ?? "");
            continue;
          }
          const el = m.target as HTMLElement;
          if (m.attributeName === "data-clip") {
            if (el.classList.contains("combatant-rig"))
              push("clip", unitOf(el), el.dataset.clip ?? "");
          } else if (
            el.tagName === "I" &&
            el.parentElement?.classList.contains("combatant-bar") &&
            !(m.oldValue ?? "").includes(el.style.transform)
          )
            push(
              "hp",
              unitOf(el),
              el.parentElement.querySelector("u")?.textContent ?? el.style.transform,
            );
        }
      });
      observer.observe(layer, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ["data-clip", "style"],
      });
    }, 50);
    return () => {
      clearInterval(find);
      observer?.disconnect();
    };
  }, [tracing]);

  useEffect(() => {
    (window as LabWindow).__lab = {
      play,
      playRound,
      round,
      api: () => api.current,
      setDebug,
      trace: () => records.current,
      clearTrace: () => {
        records.current = [];
        setTracing(true);
      },
    };
  });

  /** A real round is about to play: the lab's overrides no longer apply. */
  const clear = () => (pending.current = []);

  return { hooks, play, clear, debug, setDebug, api, tracing };
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
        <button onClick={() => lab.api.current?.step()}>Beat ▸</button>
        <button onClick={() => lab.api.current?.skip()}>Skip</button>
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
