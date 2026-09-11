import { useEffect, useMemo, useState } from "react";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { abilities, hero, supplyFor } from "../../content/heroes";
import { enemies as enemyDefs } from "../../content/enemies";
import { useDirector } from "../battle/director";
import { BattleStage } from "./BattleStage";
import { PartyHud } from "./PartyHud";
import { HistoryDrawer } from "./HistoryDrawer";
import { PixelIcon } from "./PixelIcon";
import { ActionFan, type FanAbility } from "./ActionFan";
import { treasuryBarrier } from "../combat-presentation";
import type { Impact } from "./BattleUnit";
import { placements } from "../battle/layout";
import type { StageShapes } from "../battle/unit-layout";
import { useCamera } from "../battle/camera";
import { BattleVfx } from "./BattleVfx";
import { useAnimators } from "../battle/useAnimators";
import { BossIntro } from "./BossIntro";
import { mixer } from "../audio/engine";

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
}: {
  s: Snapshot;
  send: (i: Intent) => void;
  disabled: boolean;
  reducedMotion?: boolean;
}) {
  const me = s.players.find((p) => p.id === s.you)!;
  const [history, setHistory] = useState(false);
  // The entrance plays once for an encounter, not once a round.
  const [introShown, setIntroShown] = useState(false);
  // The stage measures what each combatant paints, and everyone is placed by
  // it: the units, and everything that aims at them — camera, effects, fan.
  const [shapes, setShapes] = useState<StageShapes | null>(null);
  const places = useMemo(() => placements(s, shapes), [s, shapes]);
  const camera = useCamera(reducedMotion);
  const animators = useAnimators({ still: reducedMotion });
  const replay = useDirector(s, reducedMotion, {
    onShake: camera.shake,
    onClip: animators.play,
    onRest: animators.setRest,
    onSound: (name) => mixer.play(name),
  });
  const b = replay.beat;

  const list = abilities(
    me.heroId,
    s.combatVersion,
    me.upgrades,
    me.evolution,
    me.items,
  );
  const [ability, setAbility] = useState(list[0].id);
  const [target, setTarget] = useState("");
  /** Choosing what to do, or choosing who to do it to. */
  const [mode, setMode] = useState<"ability" | "target">("ability");
  const chosen = list.find((a) => a.id === ability) ?? list[0];
  const locked = s.locked.includes(me.id);
  const selectedTarget = chosen.target === "self" ? me.id : target;

  /** Every unit the chosen ability may legally be aimed at. */
  const targetable = useMemo(() => {
    const ids = new Set<string>();
    if (chosen.target === "self") {
      ids.add(me.id);
    } else if (chosen.target === "ally" || chosen.target === "allyRow") {
      for (const p of s.players) if (!p.fallen) ids.add(p.id);
    } else {
      for (const e of s.enemies) if (e.hp > 0) ids.add(e.id);
    }
    return ids;
  }, [chosen, s.players, s.enemies, me.id]);
  const targetValid = targetable.has(selectedTarget);

  // A target that stops being legal should not silently stay selected.
  useEffect(() => {
    if (target && !targetable.has(target)) setTarget("");
  }, [target, targetable]);

  // The camera follows the decision being made, and nothing else.
  useEffect(() => {
    const mine = places.get(me.id) ?? null;
    if (replay.playing) {
      const actor = b?.actor ? places.get(b.actor) : null;
      const victim = b?.target ? places.get(b.target) : null;
      camera.look({ preset: "action", at: actor ?? mine, and: victim });
      return;
    }
    if (locked || me.hp <= 0) {
      camera.look({ preset: "neutral" });
      return;
    }
    if (mode === "target" && selectedTarget)
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
    b,
    places,
    me.id,
    me.hp,
    camera,
  ]);

  const named = (id?: string) =>
    [...s.players, ...s.enemies].find((u) => u.id === id)?.name ?? "";
  const beatFor = (id: string) => {
    if (!replay.playing || !b) return {};
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
    if (mode === "target") {
      setMode("ability");
      setTarget("");
    }
  };
  const pickTarget = (id: string) => {
    setTarget(id);
    if (mode === "ability") setMode("target");
  };

  const cost = (a: (typeof list)[number]) => {
    if (a.id === "revive") return "90 gold";
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

  const COMMON = new Set(["brace", "advance", "retreat", "revive"]);
  const someoneDown = s.players.some((p) => p.hp <= 0 && !p.fallen);
  const fanOptions: FanAbility[] = list
    .map((a) => ({
      ability: a,
      blocked: why(a),
      common: COMMON.has(a.id),
      urgent: a.id === "revive" && someoneDown,
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
        animators={animators}
        frozen={replay.frozen}
        s={s}
        places={places}
        onShapes={setShapes}
        camera={camera}
        target={selectedTarget}
        onTarget={pickTarget}
        targetable={targetable}
        targeting={mode === "target" && !locked && !replay.playing && me.hp > 0}
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
              {replay.playing && (
                <button className="skip-replay" onClick={replay.skip}>
                  Skip ▸▸
                </button>
              )}
            </>
          ),
        }}
      >
        {me.hp > 0 && !locked && places.get(me.id) && (
          <ActionFan
            me={me}
            place={places.get(me.id)!}
            options={fanOptions}
            chosen={chosen}
            onChoose={choose}
            onCancel={cancel}
            occupied={[...places.values()].filter((pl) => pl.id !== me.id)}
            mode={mode}
            disabled={disabled || replay.playing}
          />
        )}
      </BattleStage>

      <div className="battle-controls" data-locked={locked ? "" : undefined}>
        <PartyHud s={s} />
        {me.hp <= 0 ? (
          <p className="control-note">
            Your pact still holds. Ping priorities and help choose the route.
            Allies can revive you; the camp restores fallen heroes.
          </p>
        ) : (
          <div className="commit-bar" data-mode={mode}>
            <p className="commit-what">
              <strong>{chosen.name}</strong>
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

      {bossDef?.objective && !introShown && s.round <= 1 && (
        <BossIntro
          name={bossDef.name}
          epithet={bossDef.epithet}
          boss={bossDef.id}
          reduced={reducedMotion}
          onDone={() => setIntroShown(true)}
        />
      )}
      <HistoryDrawer s={s} open={history} onClose={() => setHistory(false)} />
    </div>
  );
}
