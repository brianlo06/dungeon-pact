import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Ability, Player } from "../../shared/model";
import { hero, supplyFor } from "../../content/heroes";
import type { Placement } from "../battle/layout";
import { layoutFan } from "../battle/fan-layout";

/**
 * Your actions, belonging to your hero.
 *
 * They used to be a strip of buttons along the bottom of the page, which made
 * choosing an action a form-filling exercise happening somewhere else. These
 * are contract slips torn off the hero: they stand beside them and step away
 * from them, the signature abilities stacked above and the things every class
 * can do in a quiet block at the foot.
 *
 * The fan covers nobody — not the enemies it is aimed at, not the allies beside
 * the hero, and not the hero themselves. Where it opens is measured against
 * the stage rather than set by offsets, because a drawn hero is too wide for
 * any fixed offset to clear.
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
   * Where the fan opens is measured, not assumed: beside the hero, clear of
   * every figure, name plate and intent chip on the stage — the hero's own
   * figure included — and as close to the hero as that allows. See
   * `battle/fan-layout.ts`. It is placed before the first paint, so it never
   * appears in one spot and jumps to another.
   */
  const block = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState<{
    x: number;
    y: number;
    side: "left" | "right";
    cols: number;
    commonCols: number;
  } | null>(null);
  const place_ = useCallback(() => {
    const anchor = box.current;
    const world = anchor?.offsetParent as HTMLElement | null;
    if (!anchor || !world || !block.current) return;
    // While choosing, the camera is looking at this hero (see Combat.tsx), so
    // what is on screen is known exactly. While targeting it moves, and the
    // single remaining slip keeps to what every framing shows.
    const found = layoutFan(
      world,
      anchor,
      block.current,
      me.id,
      mode === "ability" ? { preset: "hero", at: place } : undefined,
    );
    if (!found) return;
    const next = {
      x: found.x,
      y: found.y,
      side: found.side,
      cols: found.shape.cols,
      commonCols: found.shape.commonCols,
    };
    setSpot((prev) =>
      prev &&
      prev.x === next.x &&
      prev.y === next.y &&
      prev.side === next.side &&
      prev.cols === next.cols &&
      prev.commonCols === next.commonCols
        ? prev
        : next,
    );
  }, [me.id, mode, place]);
  useLayoutEffect(() => {
    place_();
    // The intent chips are laid out by the stage after this effect runs, and
    // fonts can land late; one more pass on the next frame sees both.
    const frame = requestAnimationFrame(place_);
    const world = box.current?.offsetParent as HTMLElement | null;
    const watch =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(place_);
    if (world) watch?.observe(world);
    if (block.current) watch?.observe(block.current);
    return () => {
      cancelAnimationFrame(frame);
      watch?.disconnect();
    };
  }, [place_, mode, options.length, place.x, place.y, occupied.length]);
  const side = spot?.side ?? "right";
  const cols = mode === "target" ? 1 : (spot?.cols ?? 1);
  const rows = Math.max(1, Math.ceil(primary.length / cols));
  /** Grid cell for the i-th slip: the first sits nearest the hero's hand, at
   * the foot of the inner column, and each column fills upward. */
  const cell = (i: number) => {
    const col = Math.floor(i / rows);
    const up = i % rows;
    return {
      "--i": up,
      gridColumn: side === "right" ? col + 1 : cols - col,
      gridRow: rows - up,
    };
  };

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
      data-dir={side}
      style={
        {
          left: `${place.x * 100}%`,
          top: `${place.y * 100}%`,
        } as React.CSSProperties
      }
    >
      {/*
       * The anchor is gone. It marked whose fan this was with a pulsing gold
       * diamond and spelled the class resource out beneath the hero's feet,
       * seven pixels tall. The resource is pips on the name plate now, where a
       * player is already looking, and the plate itself is gold for the hero
       * you control — so the diamond was left covering the very row that
       * replaced it. Its going also takes one perpetual animation with a glow
       * on it off the stage for the whole planning phase.
       */}
      <div
        ref={block}
        className="fan-block"
        data-side={side}
        style={
          {
            left: `${spot?.x ?? 0}px`,
            top: `${spot?.y ?? 0}px`,
            visibility: spot ? undefined : "hidden",
            "--common-cols": spot?.commonCols ?? 2,
          } as React.CSSProperties
        }
      >
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
                  (mode === "target" ? {} : cell(i)) as React.CSSProperties
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
          <ul className="fan-common" aria-label="Common actions">
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
    </div>
  );
}
