import { useEffect, useMemo, useRef, useState } from "react";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { abilities, hero, supplyFor } from "../../content/heroes";
import { enemies as enemyDefs, isBoss, isObject } from "../../content/enemies";
import { useDirector } from "../battle/director";
import { BattleStage } from "./BattleStage";
import { PartyHud } from "./PartyHud";
import { HistoryDrawer } from "./HistoryDrawer";
import { PixelIcon } from "./PixelIcon";
import { ActionFan, type FanAbility } from "./ActionFan";
import { treasuryBarrier } from "../combat-presentation";
import type { Impact } from "./BattleUnit";
import { bulk, placements } from "../battle/layout";
import type { StageShapes } from "../battle/unit-layout";
import { useCamera } from "../battle/camera";
import { BattleVfx } from "./BattleVfx";
import { useAnimators, type Animators } from "../battle/useAnimators";
import { introFor, reducedIntro } from "../../content/boss-intros";
import type { FilmCredit } from "../cinematic/segments";
import { framingFor } from "../cinematic/timeline";
import { unitPresentation } from "../battle/layout";
import { mixer } from "../audio/engine";
import { useFrameLoop, type FrameLoop } from "../battle/clock";
import { useStagehand, type Stagehand } from "../battle/stagehand";
import { stageGeometry } from "../battle/stage-geometry";
import type { PlanOptions } from "../battle/round-plan";
import type { RoundTimeline } from "../battle/choreography";
import { flattenEffects, ultimateFor, ULTIMATE_MAX } from "../../content/ultimates";
import { UltimateCinematic } from "../cinematic/UltimateCinematic";
import type { CinematicRun, CinematicDebug } from "../cinematic/run";
import type { Framing } from "../../shared/cinematic";
import { audio } from "../audio";
import { ULTIMATE_SFX } from "../audio/engine";
import "../cinematic/ultimate-ui.css";

/** Which cinematics this browser has already played in full. */
const SEEN = "pact.ultimates.seen";
function seenBefore(id: string) {
  try {
    return (JSON.parse(localStorage.getItem(SEEN) ?? "[]") as string[]).includes(id);
  } catch {
    return false;
  }
}
function markSeen(id: string) {
  try {
    const seen = new Set(JSON.parse(localStorage.getItem(SEEN) ?? "[]") as string[]);
    seen.add(id);
    localStorage.setItem(SEEN, JSON.stringify([...seen]));
  } catch {
    // A player who cannot store this simply sees full films.
  }
}
import type { Tracer } from "../battle/trace";

/** What the Battle Lab reaches into. Development only. */
export interface LabApi {
  stagehand: Stagehand;
  loop: FrameLoop;
  animators: Animators;
  timeline: () => RoundTimeline | null;
  elapsed: () => number | null;
  frameStep: () => void;
  /** Jump to the next beat. */
  step: () => void;
  skip: () => void;
  setPaused: (v: boolean) => void;
  setSpeed: (n: number) => void;
  /** The Ultimate cinematic playing, if any. */
  cinematic: () => CinematicRun | null;
  skipCinematic: () => void;
  /** Play this chamber's boss intro now, whether or not it has played. */
  playIntro: () => void;
}
export interface LabHooks {
  plan?: PlanOptions;
  attach?: (api: LabApi | null) => void;
  /** Force a cinematic's target framing. */
  framing?: Framing;
  /** The Ultimate lab's switches. */
  debug?: CinematicDebug;
  /** Record what each replay presents and when: see `battle/trace.ts`. */
  trace?: Tracer;
}

/**
 * The battle screen. It owns one viewport and never scrolls: a fixed strip of
 * context, the stage taking every pixel that is left, and one band of controls.
 * Everything that used to sit permanently beside the fight — the chronicle, the
 * full stat blocks, the standing explanation of the rules — is either on the
 * stage itself or one keystroke away.
 */
export function Combat({
  s,
  send,
  disabled,
  reducedMotion = false,
  cinematics = "full",
  bossIntros = true,
  lab,
  onSettled,
  onLeave,
}: {
  s: Snapshot;
  send: (i: Intent) => void;
  disabled: boolean;
  reducedMotion?: boolean;
  /** How Ultimates play; see `Settings.cinematics`. */
  cinematics?: "full" | "fast" | "first";
  /**
   * Whether a boss chamber opens with its boss's intro. The labs turn it off
   * so a staged fight is the fight, and play it on request instead.
   */
  bossIntros?: boolean;
  onSettled?: () => void;
  /**
   * Asks to leave the pact. The page's top bar is hidden in a fight, so this
   * strip is the only place a way out can be seen.
   */
  onLeave?: () => void;
  /** The Battle Lab's hooks into the stage. Never set in the game. */
  lab?: LabHooks;
}) {
  const choreoPlan = lab?.plan;
  const me = s.players.find((p) => p.id === s.you)!;
  const [history, setHistory] = useState(false);
  // The entrance plays once for an encounter, not once a round.
  const introPlayed = useRef(false);
  // The stage measures what each combatant paints, and everyone is placed by
  // it: the units, and everything that aims at them — camera, effects, fan.
  const [shapes, setShapes] = useState<StageShapes | null>(null);
  const places = useMemo(() => placements(s, shapes), [s, shapes]);
  // One frame loop and one presentation clock for everything that moves.
  const loop = useFrameLoop();
  const camera = useCamera(reducedMotion, loop);
  const animators = useAnimators({ still: reducedMotion, loop });
  const stagehand = useStagehand(loop, camera, reducedMotion);
  // The choreographer aims at where the stage has placed everyone, as
  // measured; read when a round is planned, never written back.
  const geometry = useRef({ places, shapes, s });
  geometry.current = { places, shapes, s };
  const replay = useDirector(
    s,
    reducedMotion,
    {
      onShake: camera.shake,
      onClip: animators.play,
      onRest: animators.setRest,
      onSettle: animators.settle,
      onSound: (name) => mixer.play(name),
      geometry: (alive) => {
        const g = geometry.current;
        return stageGeometry(
          g.places,
          g.shapes,
          stagehand.stageSize(),
          alive,
          (id) => bulk(g.s.enemies.find((e) => e.id === id)?.definition),
        );
      },
      plan: choreoPlan,
      framing: lab?.framing,
      cinematicMode: (u) =>
        cinematics === "fast" ||
        (cinematics === "first" && seenBefore(u.presentation.cinematic ?? u.id))
          ? "fast"
          : "full",
      onCinematicSeen: (u) => markSeen(u.presentation.cinematic ?? u.id),
      openChannel: () => mixer.channel(),
      onDuck: (level, ms) => audio.duck(level, ms / 1000),
      onCinematicFocus: (unit) => {
        const at = unit ? geometry.current.places.get(unit) : null;
        camera.look(at ? { preset: "action", at } : { preset: "neutral" });
      },
      onTrace: lab?.trace,
    },
    { loop, stagehand },
  );
  const replayRef = useRef(replay);

  /**
   * A boss chamber opens with its boss's entrance, once. Presentation only:
   * the fight is live behind it, nothing is sent to the room, and each
   * player's screen plays its own, starting on the snapshot that put the
   * party in the chamber. A reconnect in the same chamber does not play it
   * again (`sessionStorage`, keyed by room, floor and chamber).
   */
  const startIntro = (force: boolean) => {
    if (!force && (introPlayed.current || !bossIntros)) return;
    if (s.phase !== "COMBAT" || (!force && s.round > 1)) return;
    const unit = s.enemies.find((e) => e.hp > 0 && isBoss(e.definition));
    const def = unit && enemyDefs.find((d) => d.id === unit.definition);
    if (!unit || !def) return;
    const key = `pact.intro.${s.room}:${s.floor ?? 0}:${s.currentNode}`;
    if (!force)
      try {
        if (sessionStorage.getItem(key)) {
          introPlayed.current = true;
          return;
        }
        sessionStorage.setItem(key, "1");
      } catch {
        // Without storage the intro may play again after a reload.
      }
    introPlayed.current = true;
    const film = reducedMotion ? reducedIntro(def) : introFor(def);
    const credit: FilmCredit = {
      id: `intro:${def.id}`,
      name: def.name,
      epithet: def.epithet ?? "",
      place: def.lair ?? s.map.find((n) => n.id === s.currentNode)?.name,
      presentation: {
        accent: film.accent,
        cinematic: `intro:${def.id}`,
        voice: film.line ? { activation: film.line } : undefined,
      },
    };
    const escort = s.enemies
      .filter((e) => e.hp > 0 && e.id !== unit.id && !isObject(e.definition))
      .map((e) => e.id);
    const mode =
      reducedMotion ||
      !(cinematics === "fast" || (cinematics === "first" && seenBefore(credit.id)))
        ? "full"
        : "fast";
    replayRef.current.playIntro(
      film,
      { cast: { kind: "cast" }, def: credit, beats: [], targets: [unit.id, ...escort] },
      mode,
      lab?.framing ?? framingFor(unitPresentation(def.id).footprint),
      reducedMotion,
    );
  };
  const startIntroRef = useRef(startIntro);
  startIntroRef.current = startIntro;
  useEffect(() => {
    if (!replay.playing) startIntroRef.current(false);
  }, [s.phase, s.round, s.currentNode, replay.playing]);
  // Tell whoever is holding the stage that the round has finished playing.
  // `replay.playing` is true from the render a round arrives in, not from the
  // effect that starts it — see the director's `pending` — so this cannot fire
  // in the gap and release the hold before the last blow has been shown.
  useEffect(() => {
    if (onSettled && !replay.playing) onSettled();
  }, [onSettled, replay.playing]);
  replayRef.current = replay;
  useEffect(() => {
    lab?.attach?.({
      stagehand,
      loop,
      animators,
      timeline: () => replayRef.current.timeline(),
      elapsed: () => replayRef.current.elapsed(),
      frameStep: () => replayRef.current.frameStep(),
      step: () => replayRef.current.step(),
      skip: () => replayRef.current.skip(),
      setPaused: (v) => replayRef.current.setPaused(v),
      setSpeed: (n) => replayRef.current.setSpeed(n),
      cinematic: () => replayRef.current.cinematicRun(),
      skipCinematic: () => replayRef.current.skipCinematic(),
      playIntro: () => startIntroRef.current(true),
    });
    return () => lab?.attach?.(null);
  }, [lab, stagehand, loop, animators]);
  // Development only: the lab's tracer hears the rigs' markers and the
  // projectiles as well as the director.
  const trace = lab?.trace;
  const unitIds = [...s.players, ...s.enemies].map((u) => u.id).join("|");
  useEffect(() => {
    if (!trace) return;
    stagehand.trace = trace;
    const ids = unitIds.split("|");
    for (const id of ids)
      animators.trace(
        id,
        s.enemies.some((e) => e.id === id) ? -1 : 1,
        (marker, clip, at) => trace({ kind: marker, t: at, unit: id, name: clip }),
      );
    return () => {
      stagehand.trace = undefined;
      for (const id of ids) animators.trace(id, 1, null);
    };
    // The side of a unit never changes; the ids are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trace, stagehand, animators, unitIds]);
  const b = replay.beat;

  // A room with boss pools sells no lives, so Pact revival is not offered.
  const list = abilities(
    me.heroId,
    s.combatVersion,
    me.upgrades,
    me.evolution,
    me.items,
  )
    .filter((a) => a.id !== "revive" || s.bossVersion !== 1)
    // Serving a lien back is only an action while you carry one.
    .filter(
      (a) =>
        !a.effects.some((e) => e.kind === "transfer") ||
        a.effects.some(
          (e) =>
            e.kind === "transfer" &&
            me.statuses.some((st) => st.id === e.status),
        ),
    );
  const [ability, setAbility] = useState(list[0].id);
  const [target, setTarget] = useState("");
  /**
   * Choosing what to do, choosing who to do it to, or choosing who the
   * Ultimate lands on — the extra action, chosen beside the plan.
   */
  const [mode, setMode] = useState<"ability" | "target" | "ultimate">("ability");
  const chosen = list.find((a) => a.id === ability) ?? list[0];
  const locked = s.locked.includes(me.id);
  const ult = s.ultimateVersion === 1 ? ultimateFor(me) : undefined;
  const charge = me.ultimateCharge ?? 0;
  const ultReady = !!ult && charge >= ult.cost && me.hp > 0 && !me.fallen;
  const ultQueued = s.myUltimate;
  const aiming = mode === "ultimate" && ultReady && !ultQueued;
  const rule = aiming ? ult!.target : chosen.target;

  /*
   * Every round starts where the first one did: choosing an ability, with
   * nothing aimed at anyone.
   *
   * This state outlived the round it was made in. A player who struck an enemy
   * came back next round already in target mode, with last round's move named
   * in the commit bar and "Lock action" live under a target they had not
   * chosen this round — so playing the same move twice took one click and
   * playing anything else took a trip through "← Back" first. Unlocking
   * mid-round is untouched: that is a decision being edited, not a new one.
   */
  const [plannedRound, setPlannedRound] = useState(s.round);
  if (plannedRound !== s.round) {
    setPlannedRound(s.round);
    setAbility(list[0].id);
    setTarget("");
    setMode("ability");
  }
  if (mode === "ultimate" && (!ultReady || ultQueued)) setMode("ability");
  const selectedTarget = rule === "self" ? me.id : target;

  /** Every unit the chosen ability may legally be aimed at. */
  const targetable = useMemo(() => {
    const ids = new Set<string>();
    if (aiming) {
      // An Ultimate reaches wherever it is aimed: no screen, no windup rule.
      if (rule === "self") ids.add(me.id);
      else if (rule === "ally" || rule === "allyRow") {
        // As the server aims it: a downed ally counts (Living Bone revives),
        // and a guard cannot be aimed at the one giving it.
        const guards = flattenEffects(ult?.effects ?? []).some(
          (e) => e.kind === "protect",
        );
        for (const p of s.players)
          if (!p.fallen && !(guards && p.id === me.id)) ids.add(p.id);
      } else for (const e of s.enemies) if (e.hp > 0) ids.add(e.id);
      return ids;
    }
    if (chosen.target === "self") {
      ids.add(me.id);
    } else if (chosen.target === "ally" || chosen.target === "allyRow") {
      for (const p of s.players) {
        const revives = chosen.id === "revive" || !!chosen.revive;
        if (p.fallen || (revives ? p.hp > 0 : p.hp <= 0))
          continue;
        if (chosen.effects.some((e) => e.kind === "protect") && p.id === me.id)
          continue;
        ids.add(p.id);
      }
    } else {
      for (const e of s.enemies) {
        if (e.hp <= 0) continue;
        if (reachError(s, me, chosen, e)) continue;
        if (
          chosen.effects.some((effect) => effect.kind === "interrupt") &&
          (!e.intent.ability.interruptible ||
            e.statuses.some((st) => st.id === "interrupted"))
        )
          continue;
        ids.add(e.id);
      }
    }
    return ids;
  }, [chosen, s.players, s.enemies, s.reachVersion, me, aiming, rule, ult]);
  const targetValid = targetable.has(selectedTarget);

  // A target that stops being legal should not silently stay selected.
  useEffect(() => {
    if (target && !targetable.has(target)) setTarget("");
  }, [target, targetable]);

  // The camera follows the decision being made. During a replay the
  // choreography frames the action instead (see `stagehand.ts`).
  useEffect(() => {
    const mine = places.get(me.id) ?? null;
    if (replay.playing) return;
    if (locked || me.hp <= 0) {
      camera.look({ preset: "neutral" });
      return;
    }
    if (mode !== "ability" && selectedTarget)
      camera.look({
        preset: "target",
        at: places.get(selectedTarget) ?? null,
        and: mine,
      });
    else camera.look({ preset: "hero", at: mine });
  }, [
    mode,
    selectedTarget,
    locked,
    replay.playing,
    places,
    me.id,
    me.hp,
    camera,
  ]);

  // The meter filling is announced once, when it fills, not every round.
  const wasReady = useRef(ultReady);
  const [justReady, setJustReady] = useState(false);
  useEffect(() => {
    if (ultReady && !wasReady.current && !replay.playing) {
      mixer.play("ult-ready");
      setJustReady(true);
      const t = setTimeout(() => setJustReady(false), 1600);
      wasReady.current = true;
      return () => clearTimeout(t);
    }
    if (!ultReady) wasReady.current = false;
  }, [ultReady, replay.playing]);
  // Build the Ultimate's sounds before they are needed, once a meter is close.
  const warmed = useRef(false);
  useEffect(() => {
    if (warmed.current || !s.players.some((p) => (p.ultimateCharge ?? 0) >= ULTIMATE_MAX * 0.7))
      return;
    warmed.current = true;
    mixer.prewarm(ULTIMATE_SFX);
  }, [s.players]);

  const named = (id?: string) =>
    [...s.players, ...s.enemies].find((u) => u.id === id)?.name ?? "";
  const beatFor = (id: string) => {
    const gear = {
      equipment: replay.equipment?.worn[id],
      heldEquipment: replay.equipment?.held[id],
      gearPulse: replay.gearPulses?.[id],
    };
    if (!replay.playing || !b) return gear;
    let impact: Impact = null;
    if (b.target === id) {
      if (b.kind === "damage") impact = "damage";
      else if (b.kind === "heal") impact = "heal";
      else if (b.kind === "block") impact = "block";
      else if (b.kind === "defeat") impact = "defeat";
      else if (b.kind === "combo") impact = "combo";
    }
    const sign = b.kind === "heal" ? "+" : b.kind === "block" ? "⬡" : "−";
    const shows = impact !== null && impact !== "combo" && impact !== "defeat";
    return {
      ...gear,
      hp: replay.hp?.[id],
      acting: b.actor === id,
      impact,
      pop: shows && b.amount !== undefined ? `${sign}${b.amount}` : undefined,
    };
  };

  const boss = s.enemies.find(
    (e) => e.hp > 0 && enemyDefs.find((d) => d.id === e.definition)?.objective,
  );
  const bossDef = enemyDefs.find((d) => d.id === boss?.definition);
  const bank = boss?.intent.ability.effects.find((e) => e.kind === "bank");
  const chamber = s.map.find((n) => n.id === s.currentNode)?.name;
  const alive = s.players.filter((p) => p.hp > 0).length;

  const choose = (id: string) => {
    setAbility(id);
    const next = list.find((a) => a.id === id)!;
    setMode(next.target === "self" ? "ability" : "target");
    if (next.target === "self") setTarget("");
  };
  const cancel = () => {
    if (mode !== "ability") {
      setMode("ability");
      setTarget("");
    }
  };
  const aimUltimate = () => {
    setTarget("");
    setMode("ultimate");
  };
  const queueUltimate = () => {
    if (!ult) return;
    send({ type: "ultimate", target: selectedTarget });
    setTarget("");
    setMode("ability");
  };
  const pickTarget = (id: string) => {
    setTarget(id);
    if (mode === "ability") setMode("target");
  };
  const queuedName = ultQueued ? named(ultQueued.target) : "";

  const cost = (a: (typeof list)[number]) => {
    if (a.id === "revive")
      return `${90 + (s.combatVersion === 2 ? 60 * (s.revivals ?? 0) : 0)} gold`;
    const supply = supplyFor(a.id);
    if (supply)
      return `${me.items.filter((id) => id === supply.id).length} left`;
    return a.cost ? `${a.cost} ${hero(me.heroId).resource}` : "Free";
  };
  const why = (a: (typeof list)[number]) => {
    if ((me.cooldowns[a.id] ?? 0) > 0)
      return `Cooling down · ${me.cooldowns[a.id]}`;
    if (me.resource < a.cost)
      return `${a.cost} ${hero(me.heroId).resource} required`;
    return null;
  };

  const COMMON = new Set(["brace", "advance", "retreat", "revive", "serve"]);
  const indebted = me.statuses.some((st) => st.id === "lien");
  const someoneDown = s.players.some((p) => p.hp <= 0 && !p.fallen);
  const fanOptions: FanAbility[] = list
    .map((a) => ({
      ability: a,
      blocked: why(a),
      common: COMMON.has(a.id),
      urgent:
        ((a.id === "revive" || !!a.revive) && someoneDown) ||
        (a.id === "serve" && indebted),
      cost: cost(a),
    }))
    // Signature abilities sit nearest the hero; shared ones cascade further
    // out. A revival jumps the queue exactly when it matters.
    .sort(
      (x, y) => Number(x.common && !x.urgent) - Number(y.common && !y.urgent),
    );

  return (
    <div className="battle">
      <div className="battle-strip">
        <span className="strip-chamber">
          <b>ROUND {s.round}</b>
          {chamber}
        </span>
        {/* A hazard is told the way a boss's objective is: on the strip,
            for the whole fight, because it is a rule of this room and a
            player deciding a round needs it in front of them. */}
        {s.hazard && (
          <span className="strip-objective strip-hazard">
            <b>HAZARD</b>
            {s.hazard === "vents"
              ? `Vents scald the front row for ${VENT_SCALD} as each round begins, from round two.`
              : s.round < COLLAPSE_ROUND
                ? `The back catwalk gives way on round ${COLLAPSE_ROUND}: anyone standing there drops to the front.`
                : "The catwalk is gone. There is only the front now."}
          </span>
        )}
        {bossDef?.objective && (
          <span className="strip-objective" title={bossDef.objective}>
            <b>OBJECTIVE</b>
            {bossDef.objective}
            {bank?.kind === "bank" && (
              <i> · +{treasuryBarrier(s.gold, bank)} Barrier from your gold</i>
            )}
          </span>
        )}
        <span className="strip-right">
          <span className="strip-treasury" title="Shared treasury">
            <PixelIcon name="coin" /> {s.gold.toLocaleString()}
          </span>
          <span className="strip-locked">
            {s.locked.length}/{alive} ready
          </span>
          {replay.playing && (
            <span className="strip-playback">
              <button
                onClick={() => replay.setPaused(!replay.paused)}
                title={replay.paused ? "Resume" : "Pause"}
                aria-label={replay.paused ? "Resume" : "Pause"}
              >
                {replay.paused ? "▶" : "▮▮"}
              </button>
              {replay.paused && (
                <button onClick={replay.step} title="Next beat">
                  ⏭
                </button>
              )}
              {[0.5, 1, 2].map((n) => (
                <button
                  key={n}
                  data-on={replay.speed === n ? "" : undefined}
                  onClick={() => replay.setSpeed(n)}
                >
                  {n}×
                </button>
              ))}
            </span>
          )}
          {onLeave && (
            <button className="strip-history" onClick={onLeave}>
              Leave
            </button>
          )}
          <button
            className="strip-history"
            onClick={() => setHistory(true)}
            title="Battle history"
            aria-label="Battle history"
          >
            ☰
          </button>
        </span>
      </div>

      <BattleStage
        stagehand={stagehand}
        animators={animators}
        frozen={replay.frozen}
        s={s}
        places={places}
        onShapes={setShapes}
        camera={camera}
        target={selectedTarget}
        onTarget={pickTarget}
        targetable={targetable}
        targeting={
          (mode === "target" || aiming) &&
          (!locked || aiming) &&
          !replay.playing &&
          me.hp > 0
        }
        beat={{
          beatFor,
          playing: replay.playing,
          world: (
            <BattleVfx vfx={replay.vfx} pops={replay.pops} places={places} />
          ),
          overlay: (
            <>
              <div className="screen-centre" aria-hidden="true">
                {replay.playing && b?.kind === "cast" && replay.title && (
                  <div className="ability-title" key={replay.title.text}>
                    <small>{named(replay.title.actor)}</small>
                    <strong>{replay.title.text}</strong>
                  </div>
                )}
                {replay.playing && b?.kind === "combo" && (
                  <div className="combo-banner" key={`${b.label}-${b.target}`}>
                    {b.label}
                  </div>
                )}
                {replay.playing && b?.kind === "defeat" && (
                  <div className="combo-banner defeat" key={`down-${b.target}`}>
                    {named(b.target)} DOWN
                  </div>
                )}
              </div>
              {replay.playing && !replay.cinematic && (
                <button className="skip-replay" onClick={replay.skip}>
                  Skip ▸▸
                </button>
              )}
            </>
          ),
        }}
      >
        {/* Hidden while a round plays back: attackers now cross the stage,
            and the move being performed names itself in the callout. Held
            open after locking only to call or aim an Ultimate. */}
        {me.hp > 0 &&
          !replay.cinematic &&
          !replay.playing &&
          (!locked || aiming || (ultReady && !ultQueued)) &&
          places.get(me.id) && (
          <ActionFan
            me={me}
            place={places.get(me.id)!}
            options={locked || aiming ? [] : fanOptions}
            chosen={chosen}
            onChoose={choose}
            onCancel={cancel}
            occupied={[...places.values()].filter((pl) => pl.id !== me.id)}
            mode={mode === "ability" && !locked ? "ability" : "target"}
            disabled={disabled}
            top={
              ult &&
              (ultQueued ? (
                <div className="ult-slip" data-queued="">
                  <strong>✦ {ult.name}</strong>
                  <small>
                    Queued{queuedName ? ` → ${queuedName}` : ""} · resolves first
                  </small>
                  <button
                    type="button"
                    disabled={disabled || replay.playing}
                    onClick={() => send({ type: "cancelUltimate" })}
                  >
                    Cancel
                  </button>
                </div>
              ) : ultReady ? (
                <button
                  type="button"
                  className="ult-slip"
                  data-fresh={justReady ? "" : undefined}
                  data-aiming={aiming ? "" : undefined}
                  disabled={disabled || replay.playing}
                  onClick={aiming ? cancel : aimUltimate}
                  title={ult.description}
                >
                  <b>ULTIMATE</b>
                  <strong>✦ {ult.name}</strong>
                  <small>{aiming ? "Choose its target on the field" : "Extra action · your plan still happens"}</small>
                </button>
              ) : null)
            }
          />
        )}
      </BattleStage>

      <div className="battle-controls" data-locked={locked ? "" : undefined}>
        <PartyHud s={s} />
        {me.hp <= 0 ? (
          <div className="control-note">
            Your pact still holds. Ping priorities and help choose the route.
            {s.bossVersion === 1
              ? "A Writ of Reprieve can return you; the camp restores fallen heroes."
              : "Allies can revive you; the camp restores fallen heroes."}
            <p>
              Spirit aid: once per round, give a standing ally 4 Barrier or 1
              class resource. The party can continue without waiting for you.
            </p>
            {s.players
              .filter((p) => p.hp > 0 && !p.fallen)
              .map((p) => (
                <span key={p.id}>
                  {p.name}
                  <button
                    disabled={
                      disabled || replay.playing || me.spiritRound === s.round
                    }
                    onClick={() =>
                      send({ type: "spirit", aid: "ward", target: p.id })
                    }
                  >
                    Ward +4
                  </button>
                  <button
                    disabled={
                      disabled || replay.playing || me.spiritRound === s.round
                    }
                    onClick={() =>
                      send({ type: "spirit", aid: "inspire", target: p.id })
                    }
                  >
                    Inspire +1
                  </button>
                </span>
              ))}
          </div>
        ) : aiming && ult ? (
          <div className="commit-bar" data-mode="ultimate">
            <p className="commit-what">
              <strong>✦ {ult.name}</strong>
              <small>{ult.description}</small>
              <small>
                {selectedTarget
                  ? `→ ${named(selectedTarget)}`
                  : ult.target === "enemyRow"
                    ? "Choose an enemy to hit its whole row."
                    : "Choose a target on the field."}{" "}
                · Extra action: it resolves before the round, and your planned
                action still happens.
              </small>
            </p>
            <button className="commit-back" onClick={cancel}>
              ← Back
            </button>
            <button
              className="primary lock-action ult-lock"
              disabled={disabled || !targetValid}
              onClick={queueUltimate}
            >
              Queue Ultimate ✦
            </button>
          </div>
        ) : (
          <div className="commit-bar" data-mode={mode}>
            <p className="commit-what">
              <strong>{chosen.name}</strong>
              {s.reachVersion && chosen.reach && (
                <small>{reachText(chosen)}</small>
              )}
              <small>
                {locked
                  ? "Locked. The round resolves when everyone has decided."
                  : chosen.target === "self"
                    ? "Targets you."
                    : selectedTarget
                      ? `→ ${named(selectedTarget)}`
                      : chosen.target === "enemyRow"
                        ? "Choose an enemy on the field to hit its row."
                        : "Choose a target on the field."}
              </small>
              {selectedTarget && (
                <button
                  disabled={disabled}
                  onClick={() =>
                    send({
                      type: "ping",
                      message: "Focus target",
                      target: selectedTarget,
                    })
                  }
                >
                  Ping {named(selectedTarget)}
                </button>
              )}
            </p>
            {mode === "target" && !locked && (
              <button className="commit-back" onClick={cancel}>
                ← Back
              </button>
            )}
            <button
              className="primary lock-action"
              disabled={disabled || (!locked && !targetValid)}
              onClick={() =>
                send(
                  locked
                    ? { type: "unlock" }
                    : {
                        type: "plan",
                        ability: chosen.id,
                        target: selectedTarget,
                      },
                )
              }
            >
              {locked ? "Unlock" : "Lock action →"}
            </button>
          </div>
        )}
      </div>

      <HistoryDrawer s={s} open={history} onClose={() => setHistory(false)} />
      {replay.cinematic && (
        <UltimateCinematic
          key={replay.cinematic.key}
          run={replay.cinematic}
          s={s}
          loop={loop}
          animators={animators}
          equipment={replay.equipment}
          onSkip={replay.skipCinematic}
          debug={lab?.debug}
        />
      )}
    </div>
  );
}
import { reachError, reachText } from "../../shared/reach";
import { COLLAPSE_ROUND, VENT_SCALD } from "../../content/hazards";
