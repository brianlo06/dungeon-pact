import { useEffect, useMemo, useState } from "react";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { abilities, hero, supplyFor } from "../../content/heroes";
import { enemies as enemyDefs } from "../../content/enemies";
import { usePlayback } from "../usePlayback";
import { BattleStage } from "./BattleStage";
import { PartyHud } from "./PartyHud";
import { HistoryDrawer } from "./HistoryDrawer";
import { PixelIcon } from "./PixelIcon";
import { treasuryBarrier } from "../combat-presentation";
import type { Impact } from "./BattleUnit";

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
  const replay = usePlayback(s, reducedMotion);
  const b = replay.beat;
  const [history, setHistory] = useState(false);

  const list = abilities(
    me.heroId,
    s.combatVersion,
    me.upgrades,
    me.evolution,
    me.items,
  );
  const [ability, setAbility] = useState(list[0].id);
  const [target, setTarget] = useState("");
  const chosen = list.find((a) => a.id === ability) ?? list[0];
  const locked = s.locked.includes(me.id);
  const selectedTarget = chosen.target === "self" ? me.id : target;

  /** Every unit the chosen ability may legally be aimed at. */
  const targetable = useMemo(() => {
    const ids = new Set<string>();
    if (chosen.target === "self") ids.add(me.id);
    else if (chosen.target === "ally" || chosen.target === "allyRow")
      for (const p of s.players)
        if (!p.fallen) ids.add(p.id);
        else for (const e of s.enemies) if (e.hp > 0) ids.add(e.id);
    return ids;
  }, [chosen, s.players, s.enemies, me.id]);
  const targetValid = targetable.has(selectedTarget);

  // A target that stops being legal should not silently stay selected.
  useEffect(() => {
    if (target && !targetable.has(target)) setTarget("");
  }, [target, targetable]);

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
        s={s}
        target={selectedTarget}
        onTarget={setTarget}
        targetable={targetable}
        beat={{
          beatFor,
          playing: replay.playing,
          overlay: (
            <>
              {replay.playing && b && (
                <div className="beat-layer" aria-hidden="true">
                  {b.kind === "cast" && (
                    <div className="callout" key={`${b.actor}-${b.label}`}>
                      <small>{named(b.actor)}</small>
                      <strong>{b.label}</strong>
                    </div>
                  )}
                  {b.kind === "combo" && (
                    <div
                      className="combo-banner"
                      key={`${b.label}-${b.target}`}
                    >
                      {b.label}
                    </div>
                  )}
                  {b.kind === "defeat" && (
                    <div
                      className="combo-banner defeat"
                      key={`down-${b.target}`}
                    >
                      {named(b.target)} DOWN
                    </div>
                  )}
                </div>
              )}
              {replay.playing && (
                <button className="skip-replay" onClick={replay.skip}>
                  Skip ▸▸
                </button>
              )}
            </>
          ),
        }}
      />

      <div className="battle-controls" data-locked={locked ? "" : undefined}>
        <PartyHud s={s} />
        {me.hp <= 0 ? (
          <p className="control-note">
            Your pact still holds. Ping priorities and help choose the route.
            Allies can revive you; the camp restores fallen heroes.
          </p>
        ) : (
          <div className="action-area">
            <div className="action-menu" role="group" aria-label="Your actions">
              {list.map((a) => {
                const blocked = why(a);
                return (
                  <button
                    key={a.id}
                    className={`action ${a.id === chosen.id ? "is-chosen" : ""}`}
                    data-blocked={blocked ? "" : undefined}
                    disabled={locked || !!blocked}
                    onClick={() => setAbility(a.id)}
                    title={a.description}
                  >
                    <strong>{a.name}</strong>
                    <small>{blocked ?? cost(a)}</small>
                  </button>
                );
              })}
            </div>
            <div className="action-commit">
              <p>
                {chosen.description}
                <small>
                  {chosen.target === "self"
                    ? "Targets you."
                    : selectedTarget
                      ? `Target: ${named(selectedTarget)}`
                      : chosen.target === "enemyRow"
                        ? "Pick an enemy to hit its row."
                        : `Pick a target on the field.`}
                </small>
              </p>
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
          </div>
        )}
      </div>

      <HistoryDrawer s={s} open={history} onClose={() => setHistory(false)} />
    </div>
  );
}
