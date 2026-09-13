/**
 * The workbench's keys and prices, shared by the engine that reforges and the
 * screen that offers it. A reforge is keyed to its owner, `hero:item`, because
 * two heroes can carry the same piece and reforging one does nothing for the
 * other.
 */
export const forgeKey = (owner: string, item: string) => `${owner}:${item}`;
export const parseForgeKey = (key: string) => {
  const at = key.indexOf(":");
  return { owner: key.slice(0, at), item: key.slice(at + 1) };
};
/** Reforging costs most of what the piece is worth, never trivially little. */
export const reforgeCost = (item: { price: number }) =>
  Math.max(50, Math.round((item.price * 0.6) / 10) * 10);
