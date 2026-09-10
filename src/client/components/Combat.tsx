import { useState } from "react";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { abilities, hero } from "../../content/heroes";
import { UnitCard } from "./UnitCard";
import { usePlayback } from "../usePlayback";
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
  const named = (id?: string) =>
    [...s.players, ...s.enemies].find((u) => u.id === id)?.name ?? "";
  /** Presentation for one unit during replay: impact, floating number, spotlight. */
  const beatFor = (id: string) => {
    if (!replay.playing || !b) return {};
    // Written as an if-chain so the beat kind narrows to what a card can show.
    let impact: "damage" | "heal" | "block" | "combo" | "defeat" | null = null;
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
  const list = abilities(me.heroId, s.combatVersion, me.upgrades, me.evolution);
  const [ability, setAbility] = useState(list[0].id);
  const [target, setTarget] = useState("");
  const chosen = list.find((a) => a.id === ability) ?? list[0];
  const locked = s.locked.includes(me.id);
  const selectedTarget = chosen.target === "self" ? me.id : target;
  const targetValid =
    chosen.target === "self" ||
    (chosen.target === "ally"
      ? s.players.some((p) => p.id === target && !p.fallen)
      : s.enemies.some((e) => e.id === target && e.hp > 0));
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE EMBER FOUNDRY · ROUND {s.round}</span>
          <h1>{s.map.find((n) => n.id === s.currentNode)?.name}</h1>
        </div>
        <span className="badge">
          {s.locked.length}/{s.players.filter((p) => p.hp > 0).length} plans
          locked
        </span>
      </div>
      <div
        className={`combat-field ${replay.playing ? "replaying" : ""} ${b?.kind === "damage" && (b.amount ?? 0) >= 20 ? "jolt" : ""}`}
      >
        {replay.playing && b && (
          <div className="beat-layer" aria-hidden="true">
            {b.kind === "cast" && (
              <div className="callout" key={`${b.actor}-${b.label}`}>
                <small>{named(b.actor)}</small>
                <strong>{b.label}</strong>
              </div>
            )}
            {b.kind === "combo" && (
              <div className="combo-banner" key={`${b.label}-${b.target}`}>
                {b.label}
              </div>
            )}
            {b.kind === "defeat" && (
              <div className="combo-banner defeat" key={`down-${b.target}`}>
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
        <div className="arena-caption">
          ENEMY FORMATION{" "}
          <span>Intentions are fixed. Make your move together.</span>
        </div>
        {(["back", "front"] as const).map((row) => (
          <div className="battle-row" key={row}>
            <span className="row-label">{row}</span>
            {s.enemies
              .filter((e) => e.row === row)
              .map((e) => (
                <div className="enemy-wrap" key={e.id}>
                  <div
                    className="intent"
                    title={e.intent.ability.effects
                      .map((x) =>
                        x.kind === "damage"
                          ? `${x.amount + e.power} damage before defenses`
                          : x.kind,
                      )
                      .join(", ")}
                  >
                    {e.hp > 0 ? (
                      <>
                        {e.intent.ability.interruptible && (
                          <strong className="windup-label">
                            WINDUP · interruptible
                          </strong>
                        )}
                        {e.intent.ability.name}
                        <span>
                          {e.intent.ability.effects
                            .map((effect) =>
                              effect.kind === "damage"
                                ? `${effect.amount + e.power} damage before defenses`
                                : effect.kind === "heal"
                                  ? `${effect.amount} healing`
                                  : "",
                            )
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        <span>
                          →{" "}
                          {e.intent.ability.target === "enemyRow"
                            ? `${s.players.find((p) => p.id === e.intent.target)?.row} row`
                            : (s.players.find((p) => p.id === e.intent.target)
                                ?.name ??
                              s.enemies.find((n) => n.id === e.intent.target)
                                ?.name)}
                        </span>
                      </>
                    ) : (
                      "Defeated"
                    )}
                  </div>
                  <UnitCard
                    unit={e}
                    selected={target === e.id}
                    onClick={() => setTarget(e.id)}
                    {...beatFor(e.id)}
                  />
                </div>
              ))}
          </div>
        ))}
        <div className="field-divider">
          <span>✦</span>
        </div>
        {(["front", "back"] as const).map((row) => (
          <div className="battle-row party-row" key={row}>
            <span className="row-label">{row}</span>
            {s.players
              .filter((p) => p.row === row)
              .map((p) => (
                <UnitCard
                  key={p.id}
                  unit={p}
                  selected={selectedTarget === p.id}
                  onClick={() => setTarget(p.id)}
                  locked={s.locked.includes(p.id)}
                  connected={s.connected.includes(p.id)}
                  {...beatFor(p.id)}
                />
              ))}
          </div>
        ))}
      </div>
      <section className="action-dock">
        {s.combatVersion === 2 && (
          <p className="tactical-note">
            One action each. Break a windup, intercept an ally’s next hit, or
            weaken a heavy attack.
          </p>
        )}
        <div className="dock-heading">
          <strong>
            {hero(me.heroId).glyph} {me.name}{" "}
            <small>{hero(me.heroId).name}</small>
          </strong>
          <span>
            {me.resource}/{hero(me.heroId).maxResource}{" "}
            {hero(me.heroId).resource}
          </span>
        </div>
        {me.hp <= 0 ? (
          <p>
            Your pact still holds. Ping priorities and help choose the next
            route. Allies can revive you; the camp restores fallen heroes.
          </p>
        ) : (
          <>
            <div className="abilities">
              {list.map((a) => (
                <button
                  className={`ability ${a.id === chosen.id ? "selected" : ""}`}
                  key={a.id}
                  disabled={
                    locked ||
                    me.resource < a.cost ||
                    (me.cooldowns[a.id] ?? 0) > 0
                  }
                  onClick={() => setAbility(a.id)}
                >
                  <strong>{a.name}</strong>
                  <small>
                    {a.id === "revive"
                      ? "90 team gold"
                      : a.cost
                        ? `${a.cost} ${hero(me.heroId).resource}`
                        : "Free"}{" "}
                    · Speed {me.speed + a.speed}
                    {(me.cooldowns[a.id] ?? 0) > 0
                      ? ` · CD ${me.cooldowns[a.id]}`
                      : ""}
                  </small>
                </button>
              ))}
            </div>
            <div className="plan-line">
              <p>
                {chosen.description}
                <br />
                <small>
                  {chosen.target === "enemyRow"
                    ? "Choose an enemy to target its row."
                    : `Target: ${chosen.target}.`}{" "}
                  {selectedTarget
                    ? `Selected: ${[...s.players, ...s.enemies].find((u) => u.id === selectedTarget)?.name ?? "—"}`
                    : ""}
                </small>
              </p>
              <button
                className="primary"
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
                {locked ? "Unlock plan" : "Lock action →"}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
