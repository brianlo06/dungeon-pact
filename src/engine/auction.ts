import type { RunState } from "../shared/model";
import { items } from "../content/items";
import { pick } from "./rng";
import { log, spend } from "./effects";
/**
 * Lots per exchange. A single lot per node left the treasury with almost
 * nothing to decide about; a sequence makes the shared purse the pressure the
 * design intends.
 */
export const LOTS = 3;
/**
 * Opening ask as a fraction of an item's reference value. This was 0.65 when a
 * run offered two lots in total and the treasury had nothing to spend on. With
 * a sequence of lots per exchange the party can afford roughly half the
 * catalogue, which is the scarcity the shared purse is supposed to create.
 */
export const ASK = 1;
/**
 * Supplies are sold by the case. A route reaches at most two exchanges, so a
 * single bottle a lot left a party buying about one consumable per run, which
 * is not enough of anything to be a decision.
 */
export const CASE = 2;
export function enterAuction(s: RunState, mystery: boolean) {
  s.phase = "AUCTION";
  openLot(s, mystery, 1, []);
  log(
    s,
    "“A fine investment. Whether you survive to enjoy it is another matter.”",
  );
}
/** Prefers lots nobody owns and never repeats one within the same exchange. */
function openLot(
  s: RunState,
  mystery: boolean,
  lot: number,
  offered: string[],
) {
  // Worn equipment nobody owns is preferred, but supplies are consumed, so a
  // party holding one is still a customer for another.
  const owned = new Set(
    s.players
      .flatMap((p) => p.items)
      .filter((id) => items.find((i) => i.id === id)?.slot !== "supply"),
  );
  // Every exchange closes with the consumables tray. A party that fielded no
  // protector has to be able to decide to buy protection, not hope one is
  // offered: with supplies mixed into the general pool a run saw about one,
  // which is not a decision anybody gets to make.
  const catalogue = items.filter(
    (i) => (i.slot === "supply") === (lot === LOTS),
  );
  const fresh = catalogue.filter(
    (i) => !offered.includes(i.id) && !owned.has(i.id),
  );
  const pool = fresh.length
    ? fresh
    : catalogue.filter((i) => !offered.includes(i.id));
  const item = pick(s, pool.length ? pool : catalogue);
  s.auction = {
    mode: s.expeditionVersion === 1 && lot === 2 ? "descending" : "ascending",
    floor: Math.max(30, Math.floor((item.price * 0.5) / 10) * 10),
    itemId: item.id,
    revealed: !mystery,
    price: Math.floor((item.price * ASK) / 10) * 10,
    active: [],
    acted: [],
    stage: "interest",
    approvals: {},
    round: 1,
    lot,
    lots: LOTS,
    mystery,
    offered: [...offered, item.id],
  };
}
/** Advances to the next lot. False means the exchange is finished. */
export function nextLot(s: RunState) {
  const a = s.auction!;
  const lot = a.lot ?? 1;
  if (lot >= (a.lots ?? 1)) return false;
  openLot(s, !!a.mystery, lot + 1, a.offered ?? []);
  log(s, "“Next lot. Do try to keep up.”");
  return true;
}
export function nominate(s: RunState) {
  const a = s.auction!;
  if (a.mode === "descending") {
    if (!a.active.length && a.price > (a.floor ?? 30)) {
      a.price = Math.max(a.floor ?? 30, a.price - 30);
      a.round++;
      a.acted = [];
      log(s, `No takers. The descending ask falls to ${a.price} gold.`);
      return;
    }
    // Simultaneous claims share a seeded draw, not a network-speed race.
    if (a.active.length > 1) {
      a.active = [pick(s, a.active)];
      log(
        s,
        "Multiple claims: the auctioneer draws one paddle at the posted price.",
      );
    }
  }
  if (a.active.length === 0) {
    a.stage = "sold";
    log(s, "No sale. “Prudence. How disappointing.”");
    return;
  }
  if (a.active.length === 1) {
    a.owner = a.active[0];
    if (a.price > s.gold) {
      a.stage = "sold";
      a.owner = undefined;
      log(s, "The treasury cannot cover this lot.");
    } else if (a.price >= s.gold * s.approvalThreshold) {
      a.stage = "approval";
      a.approvals = {};
      log(s, `Pact approval required: ${a.price} gold.`);
    } else purchase(s);
  } else {
    a.stage = "bidding";
    a.acted = [];
  }
}
export function purchase(s: RunState) {
  const a = s.auction!;
  const p = s.players.find((p) => p.id === a.owner)!;
  const item = items.find((i) => i.id === a.itemId)!;
  spend(s, a.price);
  p.spent += a.price;
  // A supply is packed alongside whatever the hero is wearing; only worn
  // equipment displaces the piece already in its slot.
  const old =
    item.slot === "supply"
      ? undefined
      : p.items.find(
          (id) => items.find((i) => i.id === id)!.slot === item.slot,
        );
  p.items = p.items.filter((id) => id !== old);
  for (let n = 0; n < (item.slot === "supply" ? CASE : 1); n++)
    p.items.push(item.id);
  a.revealed = true;
  a.stage = "sold";
  log(
    s,
    `${p.name} buys ${item.slot === "supply" ? `a case of ${CASE} × ${item.name}` : item.name} for ${a.price} gold.${old ? " Previous equipment is surrendered." : ""}`,
  );
}
