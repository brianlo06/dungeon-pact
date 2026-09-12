/** Optional presentation only. Ownership remains Player.items. */
export type GearAnchor =
  "mainHand" | "torso" | "shoulderBack" | "waist" | "root" | "head" | "back";
export type GearLayer = "back" | "body" | "weapon" | "front";
export interface GearAttachment {
  anchor: GearAnchor;
  layer: GearLayer;
  asset: string;
  x?: number;
  y?: number;
  rotation?: number;
  scale?: number;
}
export interface EquipmentVisual {
  slot: "weapon" | "armor" | "relic";
  attachments: GearAttachment[];
  accent: string;
  reaction?: "shield" | "thorns" | "coins" | "healing" | "energy" | "blood";
  replacesBaseWeapon?: boolean;
  attack?: "lightning" | "blood" | "water" | "precision" | "ember" | "toxin";
  /** Overrides are keyed by presentation rig/skin, never by combat rules. */
  rigOverrides?: Record<string, GearAttachment[]>;
  fallback?: "generic" | "hidden";
}
export interface EquipmentCue {
  action: "trigger" | "seize" | "return";
  ownerId: string;
  itemId: string;
  containerId?: string;
}
