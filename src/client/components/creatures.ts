import type { ComponentType } from "react";
import type { CreatureProps } from "../battle/useRigParts";
import { Collector } from "./Collector";
import { Bulwark } from "./Bulwark";
import { Mender } from "./Mender";
import { Stoker } from "./Stoker";
import { Acolyte } from "./Acolyte";
import { Bellows } from "./Bellows";
import { Hound } from "./Hound";
import { Miser } from "./Miser";
import { Sniper } from "./Sniper";
import { Leech } from "./Leech";

/**
 * Authored creatures, by `presentation.spriteSet`.
 *
 * Anything listed here is drawn as a cutout rig instead of an atlas cell. Its
 * rig in `rigs.ts` must be registered under the same key, and its parts named
 * the way that rig animates them. The Strongbox is not here: its state comes
 * from what it is holding, so the combatant renders it directly.
 */
export const CREATURES: Record<string, ComponentType<CreatureProps>> = {
  collector: Collector,
  bulwark: Bulwark,
  mender: Mender,
  stoker: Stoker,
  acolyte: Acolyte,
  bellows: Bellows,
  hound: Hound,
  miser: Miser,
  sniper: Sniper,
  thief: Leech,
};
