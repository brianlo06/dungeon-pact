import { useEffect, useRef } from "react";
import type { Animators } from "./useAnimators";

/** What every authored creature is handed by the combatant that holds it. */
export interface CreatureProps {
  unitId: string;
  animators?: Animators;
  className?: string;
}

/**
 * Wire a cutout rig's named parts to the animator.
 *
 * Returns `hold(name)`, a ref callback for the `<g>` that is that part. The
 * part names must match the keys the creature's rig animates in `rigs.ts`;
 * a part the rig never mentions simply stays still.
 */
export function useRigParts(
  unitId: string,
  animators: Animators | undefined,
  parts: readonly string[],
) {
  const refs = useRef<Record<string, SVGGElement | null>>({});
  useEffect(() => {
    if (!animators) return;
    for (const part of parts)
      animators.attachPart(unitId, part, refs.current[part]);
    return () => {
      for (const part of parts) animators.attachPart(unitId, part, null);
    };
    // `parts` is a module constant in every creature; it never changes.
  }, [animators, unitId]);
  return (name: string) => (el: SVGGElement | null) => {
    refs.current[name] = el;
    // Named in the drawing too, so the stage can measure a pose the rig
    // holds (a raised key) without waiting for the animator to reach it.
    if (el) el.dataset.part = name;
  };
}
