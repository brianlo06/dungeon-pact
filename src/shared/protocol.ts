import { z } from "zod";
const id = z.string().min(1).max(80);
export const intentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hero"), hero: id }),
  z.object({ type: z.literal("ready"), ready: z.boolean() }),
  z.object({ type: z.literal("start") }),
  z.object({ type: z.literal("vote"), choice: id }),
  z.object({ type: z.literal("plan"), ability: id, target: id }),
  z.object({ type: z.literal("unlock") }),
  z.object({
    type: z.literal("spirit"),
    aid: z.enum(["ward", "inspire"]),
    target: id,
  }),
  z.object({ type: z.literal("offerTrade"), item: id, target: id }),
  z.object({
    type: z.literal("answerTrade"),
    from: id,
    item: id,
    accept: z.boolean(),
  }),
  z.object({ type: z.literal("proposeService"), service: id }),
  z.object({ type: z.literal("serviceVote"), approve: z.boolean() }),
  z.object({ type: z.literal("upgrade"), choice: id }),
  z.object({ type: z.literal("train"), accept: z.boolean() }),
  z.object({ type: z.literal("continue") }),
  z.object({ type: z.literal("shopOffer"), item: id, recipient: id }),
  z.object({ type: z.literal("shopApprove"), approve: z.boolean() }),
  z.object({ type: z.literal("interest"), interested: z.boolean() }),
  z.object({ type: z.literal("bid"), stay: z.boolean() }),
  z.object({ type: z.literal("approve"), approve: z.boolean() }),
  z.object({ type: z.literal("reveal") }),
  z.object({
    type: z.literal("ping"),
    message: z.enum(["Save gold", "Buy this", "Need healing", "Focus target"]),
    target: id.optional(),
  }),
]);
/**
 * The decision context a command was chosen in. Both `RunState` and `Snapshot`
 * satisfy it, so client and server derive the same string from the same facts.
 */
export interface Decision {
  phase: string;
  round: number;
  currentNode: string | null;
  eventId?: string | null;
  serviceVote?: { id: string };
  shop?: { sequence: number };
  mentorId?: string | null;
  auction: { lot?: number; stage: string; round: number } | null;
}
/**
 * What a command was decided against. This replaces an exact-revision match,
 * which treated every accepted command as invalidating every other: two heroes
 * locking plans in the same round were not in conflict, but the second was
 * rejected as stale and had to re-send. An epoch changes only when the thing
 * being decided changes — the round resolves, the lot moves on, the phase ends
 * — so simultaneous decisions inside one moment all stand, and a decision made
 * against a moment that has passed still does not.
 *
 * Duplicate and racing commands stay safe because every handler in `reduce`
 * guards its own idempotency: a vote already cast, a lot already revealed and a
 * plan already locked are each refused on their own terms, not by the epoch.
 */
export function epoch(s: Decision): string {
  return [
    s.phase,
    s.currentNode ?? "",
    s.round,
    s.auction
      ? `${s.auction.lot ?? 1}.${s.auction.stage}.${s.auction.round}`
      : "",
    s.eventId ?? "",
    s.mentorId ?? "",
    s.serviceVote?.id ?? "",
    s.shop?.sequence ?? "",
  ].join("|");
}
export const commandSchema = z
  .object({
    version: z.literal(1),
    id: z.string().uuid(),
    revision: z.number().int().nonnegative(),
    epoch: z.string().min(1).max(200),
    intent: intentSchema,
  })
  .strict();
export type Intent = z.infer<typeof intentSchema>;
export type Command = z.infer<typeof commandSchema>;
export const joinSchema = z
  .object({ name: z.string().trim().min(1).max(24) })
  .strict();
