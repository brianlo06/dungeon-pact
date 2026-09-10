import { z } from "zod";
const id = z.string().min(1).max(80);
export const intentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("hero"), hero: id }),
  z.object({ type: z.literal("ready"), ready: z.boolean() }),
  z.object({ type: z.literal("start") }),
  z.object({ type: z.literal("vote"), choice: id }),
  z.object({ type: z.literal("plan"), ability: id, target: id }),
  z.object({ type: z.literal("unlock") }),
  z.object({ type: z.literal("upgrade"), choice: id }),
  z.object({ type: z.literal("train"), accept: z.boolean() }),
  z.object({ type: z.literal("continue") }),
  z.object({ type: z.literal("interest"), interested: z.boolean() }),
  z.object({ type: z.literal("bid"), stay: z.boolean() }),
  z.object({ type: z.literal("approve"), approve: z.boolean() }),
  z.object({ type: z.literal("reveal") }),
  z.object({
    type: z.literal("ping"),
    message: z.enum(["Save gold", "Buy this", "Need healing", "Focus target"]),
  }),
]);
export const commandSchema = z
  .object({
    version: z.literal(1),
    id: z.string().uuid(),
    revision: z.number().int().nonnegative(),
    intent: intentSchema,
  })
  .strict();
export type Intent = z.infer<typeof intentSchema>;
export type Command = z.infer<typeof commandSchema>;
export const joinSchema = z
  .object({ name: z.string().trim().min(1).max(24) })
  .strict();
