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
  const owned = new Set(s.players.flatMap((p) => p.items));
  const fresh = items.filter(
    (i) => !offered.includes(i.id) && !owned.has(i.id),
  );
  const pool = fresh.length
    ? fresh
    : items.filter((i) => !offered.includes(i.id));
  const item = pick(s, pool.length ? pool : items);
  s.auction = {
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
  const old = p.items.find(
    (id) => items.find((i) => i.id === id)!.slot === item.slot,
  );
  p.items = p.items.filter((id) => id !== old);
  p.items.push(item.id);
  a.revealed = true;
  a.stage = "sold";
  log(
    s,
    `${p.name} buys ${item.name} for ${a.price} gold.${old ? " Previous equipment is surrendered." : ""}`,
  );
}
