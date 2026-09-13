import type { Snapshot } from "../../shared/model";
import { hero } from "../../content/heroes";
import { chargeShare, ULTIMATE_MAX } from "../../content/ultimates";
import { Sprite } from "./Sprite";

/**
 * The party, compressed. Everything a player needs about their teammates at a
 * glance — health, resource, whether they have decided — and nothing else. The
 * detail that used to sit permanently on screen is available by hovering.
 */
export function PartyHud({ s }: { s: Snapshot }) {
  return (
    <div className="party-hud">
      {s.players.map((p) => {
        const def = hero(p.heroId);
        const state = p.fallen
          ? "spirit"
          : p.hp <= 0
            ? "down"
            : s.locked.includes(p.id)
              ? "locked"
              : "thinking";
        return (
          <div
            className="hud-hero"
            key={p.id}
            data-state={state}
            data-you={p.id === s.you ? "" : undefined}
            title={`${p.name} · ${def.name} · ${p.hp}/${p.maxHp} HP · ${p.resource}/${def.maxResource} ${def.resource}`}
          >
            <span className="hud-portrait">
              <Sprite id={p.heroId} crop="portrait" />
              {!s.connected.includes(p.id) && <i className="hud-away">○</i>}
            </span>
            <span className="hud-lines">
              <span className="hud-name">{p.name}</span>
              <span className="hud-bar hud-hp">
                <i
                  style={{
                    transform: `scaleX(${Math.max(0, p.hp / p.maxHp)})`,
                  }}
                />
              </span>
              <span className="hud-bar hud-resource">
                <i
                  style={{
                    transform: `scaleX(${p.resource / def.maxResource})`,
                  }}
                />
              </span>
              {p.ultimateCharge !== undefined && (
                <span
                  className="hud-bar hud-charge"
                  data-ready={p.ultimateCharge >= ULTIMATE_MAX ? "" : undefined}
                  data-queued={s.ultimateQueued?.includes(p.id) ? "" : undefined}
                  title={`Pact Charge ${Math.floor(p.ultimateCharge)}/${ULTIMATE_MAX}`}
                >
                  <i style={{ transform: `scaleX(${chargeShare(p)})` }} />
                </span>
              )}
            </span>
            <span className="hud-state">
              {state === "locked"
                ? "READY"
                : state === "down"
                  ? `DOWN ${p.downedRounds}`
                  : state === "spirit"
                    ? "SPIRIT"
                    : "…"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
