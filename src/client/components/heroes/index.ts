import type { ComponentType } from "react";
import type { HeroProps } from "./kit";
import { PORTRAIT } from "./kit";
import { Vanguard } from "./Vanguard";
import { Arcanist } from "./Arcanist";
import { Ranger } from "./Ranger";
import { Warden } from "./Warden";
import { Broker } from "./Broker";
import { Herald } from "./Herald";
import { Reaver } from "./Reaver";
import { Beguiler } from "./Beguiler";

/**
 * The party, by `presentation.spriteSet`.
 *
 * Spread into `CREATURES`, so combat draws a hero the same way it draws any
 * authored creature, and read by `Sprite`, so the lobby, results, HUD and guild
 * hall draw the same art at rest instead of an atlas cell.
 */
export const PARTY: Record<string, ComponentType<HeroProps>> = {
  vanguard: Vanguard,
  arcanist: Arcanist,
  ranger: Ranger,
  warden: Warden,
  broker: Broker,
  herald: Herald,
  reaver: Reaver,
  beguiler: Beguiler,
};

/** Head-and-shoulders crops for the party HUD, where a whole body is too small. */
export const PORTRAITS: Record<string, string> = {
  vanguard: PORTRAIT,
  arcanist: PORTRAIT,
  ranger: PORTRAIT,
  warden: PORTRAIT,
  broker: PORTRAIT,
  herald: PORTRAIT,
  reaver: PORTRAIT,
  beguiler: PORTRAIT,
};
