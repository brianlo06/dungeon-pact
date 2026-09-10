import { useState } from "react";
import type { Snapshot } from "../../shared/model";
import type { Intent } from "../../shared/protocol";
import { abilities, hero } from "../../content/heroes";
import { UnitCard } from "./UnitCard";
export function Combat({
  s,
  send,
  disabled,
}: {
  s: Snapshot;
  send: (i: Intent) => void;
  disabled: boolean;
}) {
  const me = s.players.find((p) => p.id === s.you)!;
  const list = abilities(me.heroId);
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
      <div className="combat-field">
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
                />
              ))}
          </div>
        ))}
      </div>
      <section className="action-dock">
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
