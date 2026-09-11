import type { Pop, Vfx } from "../battle/director";
import type { Placement } from "../battle/layout";

/**
 * World-space effects.
 *
 * A small reusable vocabulary rather than an effect per ability: impact,
 * slash, cast, projectile, heal, barrier, interrupt, and the two the Collector
 * needs — a seizure travelling to the strongbox and equipment bursting back
 * out of it. Abilities get their look by combining these, which is what keeps
 * this from turning into one branch per spell.
 *
 * Everything is positioned from the same presentation-space coordinates the
 * combatants use, so effects land exactly on the unit they belong to.
 */

const at = (p: Placement) => ({
  left: `${p.x * 100}%`,
  top: `${p.y * 100}%`,
});

/** A line between two units, used for projectiles and seizure chains. */
function Link({
  from,
  to,
  className,
  life,
}: {
  from: Placement;
  to: Placement;
  className: string;
  life: number;
}) {
  const dx = (to.x - from.x) * 100;
  const dy = (to.y - from.y) * 100;
  // Aim at chest height rather than the feet, so a bolt does not scrape along
  // the floor between two fighters.
  const lift = 5;
  return (
    <span
      className={className}
      style={
        {
          left: `${from.x * 100}%`,
          top: `${from.y * 100 - lift}%`,
          "--dx": `${dx}%`,
          "--dy": `${dy}%`,
          "--life": `${life}ms`,
        } as React.CSSProperties
      }
    />
  );
}

export function BattleVfx({
  vfx,
  pops,
  places,
}: {
  vfx: Vfx[];
  pops: Pop[];
  places: Map<string, Placement>;
}) {
  /** The strongbox is addressed by role, so any container would work. */
  const container = [...places.values()].find((p) => p.id.includes("box"));
  const find = (id?: string) =>
    id === "strongbox" ? container : id ? places.get(id) : undefined;

  return (
    <>
      {vfx.map((v) => {
        const from = find(v.from);
        const to = find(v.to);
        const style = { "--life": `${v.life}ms` } as React.CSSProperties;
        switch (v.kind) {
          case "projectile":
            return from && to ? (
              <Link
                key={v.key}
                from={from}
                to={to}
                className="vfx-bolt"
                life={v.life}
              />
            ) : null;
          case "seize":
            return from && to ? (
              <Link
                key={v.key}
                from={from}
                to={to}
                className="vfx-chain"
                life={v.life}
              />
            ) : null;
          case "cast":
            return from ? (
              <span
                key={v.key}
                className="vfx-cast"
                style={{ ...at(from), ...style }}
              />
            ) : null;
          case "impact":
            return to ? (
              <span
                key={v.key}
                className="vfx-impact"
                style={{ ...at(to), ...style }}
              />
            ) : null;
          case "slash":
            return to ? (
              <span
                key={v.key}
                className="vfx-slash"
                style={{ ...at(to), ...style }}
              />
            ) : null;
          case "heal":
            return to ? (
              <span
                key={v.key}
                className="vfx-heal"
                style={{ ...at(to), ...style }}
              />
            ) : null;
          case "barrier":
            return to ? (
              <span
                key={v.key}
                className="vfx-barrier"
                style={{ ...at(to), ...style }}
              />
            ) : null;
          case "interrupt":
            return to ? (
              <span
                key={v.key}
                className="vfx-interrupt"
                style={{ ...at(to), ...style }}
              />
            ) : null;
          case "reclaim":
            return from ? (
              <span
                key={v.key}
                className="vfx-reclaim"
                style={{ ...at(from), ...style }}
              />
            ) : null;
          default:
            return null;
        }
      })}
      {pops.map((p) => {
        const place = places.get(p.unit);
        if (!place) return null;
        return (
          <span
            key={p.key}
            className={`vfx-pop pop-${p.tone}`}
            style={{ left: `${place.x * 100}%`, top: `${place.y * 100 - 9}%` }}
          >
            {p.text}
          </span>
        );
      })}
    </>
  );
}
