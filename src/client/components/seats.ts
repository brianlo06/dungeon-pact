/**
 * Seat colours, in join order. The same four a party of friends would recognise
 * from any couch fighting game: whoever sat down first is red.
 */
export const SEATS = [
  { label: "P1", color: "#d9513c" },
  { label: "P2", color: "#3f86d9" },
  { label: "P3", color: "#e3b13a" },
  { label: "P4", color: "#4fa85e" },
] as const;
export type Seat = (typeof SEATS)[number];
