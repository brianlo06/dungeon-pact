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
import { Notary } from "./Notary";
import { Assayer } from "./Assayer";
import { Salvor } from "./Salvor";
import { Bailiff } from "./Bailiff";
import { SalvagePlate } from "./SalvagePlate";
import { WaxSeal } from "./WaxSeal";
import { Sniper } from "./Sniper";
import { Leech } from "./Leech";
import { Maw } from "./Maw";
import { Eel } from "./Eel";
import { Tender } from "./Tender";
import { TenderPlate } from "./TenderPlate";
import { Dredger } from "./Dredger";
import { PressureEngine } from "./PressureEngine";
import { Scribe } from "./Scribe";
import { SentenceSeal } from "./SentenceSeal";
import { Wraith } from "./Wraith";
import { Indexer } from "./Indexer";
import { Stalker } from "./Stalker";
import { PARTY } from "./heroes";

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
  notary: Notary,
  assayer: Assayer,
  salvor: Salvor,
  bailiff: Bailiff,
  "salvage-plate": SalvagePlate,
  "wax-seal": WaxSeal,
  sniper: Sniper,
  thief: Leech,
  maw: Maw,
  eel: Eel,
  tender: Tender,
  "tender-plate": TenderPlate,
  dredger: Dredger,
  engine: PressureEngine,
  scribe: Scribe,
  "sentence-seal": SentenceSeal,
  wraith: Wraith,
  indexer: Indexer,
  stalker: Stalker,
  ...PARTY,
};
