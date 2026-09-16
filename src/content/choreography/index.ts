import type { CreatureChoreography } from "../../shared/presentation";
import common from "./common";
import vanguard from "./vanguard";
import arcanist from "./arcanist";
import ranger from "./ranger";
import warden from "./warden";
import broker from "./broker";
import herald from "./herald";
import reaver from "./reaver";
import beguiler from "./beguiler";
import stoker from "./stoker";
import bulwark from "./bulwark";
import acolyte from "./acolyte";
import mender from "./mender";
import hound from "./hound";
import sniper from "./sniper";
import thief from "./thief";
import bellows from "./bellows";
import strongbox from "./strongbox";
import collector from "./collector";
import miser from "./miser";
import notary from "./notary";
import assayer from "./assayer";
import waxSeal from "./wax-seal";

/**
 * Choreography annotations, by hero id or enemy definition id. One file per
 * creature, every creature already listed, so annotating one never touches
 * this file or anyone else's. `common` holds the actions every hero shares.
 */
export const CHOREOGRAPHY: Record<string, CreatureChoreography> = {
  vanguard,
  arcanist,
  ranger,
  warden,
  broker,
  herald,
  reaver,
  beguiler,
  stoker,
  bulwark,
  acolyte,
  mender,
  hound,
  sniper,
  thief,
  bellows,
  strongbox,
  collector,
  miser,
  notary,
  assayer,
  "wax-seal": waxSeal,
};

export const COMMON: CreatureChoreography = common;
