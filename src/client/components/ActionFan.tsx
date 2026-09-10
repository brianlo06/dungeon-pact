import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Ability, Player } from "../../shared/model";
import { hero, supplyFor } from "../../content/heroes";
import type { Placement } from "../battle/layout";

/**
 * Your actions, belonging to your hero.
 *
 * They used to be a strip of buttons along the bottom of the page, which made
 * choosing an action a form-filling exercise happening somewhere else. These
 * are contract slips torn off the hero: they cascade away from them, the
 * signature abilities nearest to hand and the things every class can do further
 * out and quieter, and they lean away from whichever screen edge the hero is
 * standing near.
 *
 * The fan never covers the enemies it is aimed at, because it opens along the
 * hero's own side of the field.
 */

export interface FanAbility {
  ability: Ability;
  /** Why it cannot be used, or null when it can. */
  blocked: string | null;
  /** Signature abilities read louder than the things every class shares. */
  common: boolean;
  /** Pushed forward when the situation calls for it — a revival with a body on the floor. */
  urgent?: boolean;
  cost: string;
}

export function ActionFan({
  me,
  place,
  options,
  chosen,
  onChoose,
  onCancel,
  mode,
  disabled,
  occupied,
}: {
  me: Player;
  place: Placement;
  /** Everyone else on the field, so the fan can open where nobody is standing. */
  occupied: Placement[];
  options: FanAbility[];
  chosen: Ability;
  onChoose: (id: string) => void;
  onCancel: () => void;
  /** "ability" fans everything out; "target" collapses to the chosen slip. */
  mode: "ability" | "target";
  disabled: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const usable = options.filter((o) => !o.blocked);
  // Signature abilities cascade; the things every class can do sit in a tight
  // cluster by the hero's feet so they never dominate the composition.
  const primary = options.filter((o) => !o.common || o.urgent);
  const secondary = options.filter((o) => o.common && !o.urgent);

  /**
   * Open where nobody is standing. "Outward from centre" is not good enough —
   * outward can point straight at a creature. Both sides are scored by what
   * the fan would cover up-field, and the emptier one wins; ties open outward.
   */
  const SPAN = 0.24;
  const covered = (d: -1 | 1) =>
    occupied.filter((o) => {
      const lo = Math.min(place.x, place.x + d * SPAN);
      const hi = Math.max(place.x, place.x + d * SPAN);
      return o.x > lo - 0.06 && o.x < hi + 0.06 && o.y < place.y - 0.02;
    }).length;
  const outward: -1 | 1 = place.x <= 0.5 ? -1 : 1;
  const dir: -1 | 1 =
    covered(-1) === covered(1) ? outward : covered(-1) < covered(1) ? -1 : 1;

  /**
   * The cascade must not climb into enemy territory. Its total rise is capped
   * by the gap between this hero and the nearest thing standing up-field, and
   * the per-slip step shrinks to fit rather than the fan growing taller.
   */
  const ceilingY = occupied
    .filter((o) => o.y < place.y - 0.02)
    .reduce((n, o) => Math.max(n, o.y), 0.18);
  const rise = Math.max(0.1, place.y - ceilingY - 0.03);

  /**
   * Slips must never cover each other's text, so the cascade wraps into a
   * second column rather than squeezing the step below a slip's own height.
   * That needs the stage's real size, so it is measured rather than guessed.
   */
  const SLIP = 31;
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const commonRef = useRef<HTMLUListElement>(null);
  const [commonX, setCommonX] = useState(0);
  useLayoutEffect(() => {
    const parent = box.current?.offsetParent as HTMLElement | null;
    if (!parent) return;
    const measure = () => {
      const b = parent.getBoundingClientRect();
      setStage({ w: b.width, h: b.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, []);
  const stageH = stage.h;
  // The shared-action row is wider than a slip and sits at the hero's feet, so
  // a hero near an edge would push it off the stage. Clamp it to the stage.
  useLayoutEffect(() => {
    const width = commonRef.current?.getBoundingClientRect().width ?? 0;
    if (!stage.w || !width) return;
    const anchor = place.x * stage.w;
    const ideal = anchor - width / 2;
    const clamped = Math.max(8, Math.min(stage.w - width - 8, ideal));
    setCommonX(clamped - anchor);
  }, [stage.w, place.x, secondary.length]);
  const perColumn = Math.max(
    1,
    Math.floor((stageH ? rise * stageH : 140) / SLIP),
  );
  // Keyboard: move through what is actually usable, commit, and back out.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (mode !== "ability") return;
      const index = usable.findIndex((o) => o.ability.id === chosen.id);
      if (e.key === "ArrowUp" || e.key === "ArrowRight") {
        e.preventDefault();
        onChoose(
          usable[Math.min(usable.length - 1, index + 1)]?.ability.id ??
            chosen.id,
        );
      } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
        e.preventDefault();
        onChoose(usable[Math.max(0, index - 1)]?.ability.id ?? chosen.id);
      } else if (/^[1-9]$/.test(e.key)) {
        const pick = usable[Number(e.key) - 1];
        if (pick) onChoose(pick.ability.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [usable, chosen.id, mode, onChoose, onCancel, disabled]);

  const def = hero(me.heroId);
  return (
    <div
      ref={box}
      className="action-fan"
      data-mode={mode}
      data-dir={dir > 0 ? "right" : "left"}
      style={
        {
          left: `${place.x * 100}%`,
          top: `${place.y * 100}%`,
          "--rise": `${rise * 100}cqh`,
          "--count": Math.max(1, primary.length),
          "--slip": `${SLIP}px`,
          "--common-x": `${commonX}px`,
        } as React.CSSProperties
      }
    >
      <div className="fan-anchor" aria-hidden="true">
        <span className="fan-seal" />
        <span className="fan-who">
          {me.resource}/{def.maxResource} {def.resource}
        </span>
      </div>
      <ul
        className="fan-slips"
        role="listbox"
        aria-label={`${me.name}'s actions`}
      >
        {primary.map((o, i) => {
          const isChosen = o.ability.id === chosen.id;
          if (mode === "target" && !isChosen) return null;
          return (
            <li
              key={o.ability.id}
              className="fan-slip"
              style={
                {
                  "--i": i,
                  "--col": Math.floor(i / perColumn),
                  "--row": i % perColumn,
                } as React.CSSProperties
              }
              data-common={o.common ? "" : undefined}
              data-urgent={o.urgent ? "" : undefined}
              data-chosen={isChosen ? "" : undefined}
              data-blocked={o.blocked ? "" : undefined}
            >
              <button
                type="button"
                role="option"
                aria-selected={isChosen}
                disabled={disabled || !!o.blocked}
                onClick={() => onChoose(o.ability.id)}
                title={o.ability.description}
              >
                <strong>{o.ability.name}</strong>
                <small>{o.blocked ?? o.cost}</small>
              </button>
              <span className="fan-detail" role="tooltip">
                {o.ability.description}
                {supplyFor(o.ability.id) && <i> · consumed on use</i>}
                {o.ability.cooldown > 0 && (
                  <i> · {o.ability.cooldown} round cooldown</i>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {mode === "ability" && (
        <ul className="fan-common" ref={commonRef} aria-label="Common actions">
          {secondary.map((o) => (
            <li
              key={o.ability.id}
              className="fan-slip"
              data-common=""
              data-chosen={o.ability.id === chosen.id ? "" : undefined}
              data-blocked={o.blocked ? "" : undefined}
            >
              <button
                type="button"
                role="option"
                aria-selected={o.ability.id === chosen.id}
                disabled={disabled || !!o.blocked}
                onClick={() => onChoose(o.ability.id)}
                title={`${o.ability.name} — ${o.ability.description}`}
              >
                <strong>{o.ability.name}</strong>
              </button>
              <span className="fan-detail" role="tooltip">
                {o.ability.description}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
