import { validateEquipmentVisuals } from "../../content/equipment-validation";
import {
  createContext,
  useContext,
  type ReactNode,
  type CSSProperties,
} from "react";
import { items } from "../../content/items";
import type { GearAnchor, GearLayer } from "../../shared/equipment";
import { BOW_LIMBS, EQUIPMENT_ASSETS } from "./assets";
import "./equipment.css";

export const wornItems = (ids: readonly string[]) =>
  ids.flatMap((id) => {
    const item = items.find((i) => i.id === id);
    return item && item.slot !== "supply" ? [item] : [];
  });
interface Look {
  items: readonly string[];
  preview?: string;
  highlight?: string;
  pulse?: string;
  pulseKey?: number;
}
const EquipmentContext = createContext<Look>({ items: [] });
export const RigContext = createContext("vanguard");
export function EquipmentProvider({
  children,
  ...look
}: Look & { children: ReactNode }) {
  return (
    <EquipmentContext.Provider value={look}>
      {children}
    </EquipmentContext.Provider>
  );
}
/** The authored base remains mounted so animator refs survive every swap. */
export function BaseWeapon({ children }: { children: ReactNode }) {
  const look = useContext(EquipmentContext);
  const replacement = wornItems(look.items).some(
    (i) =>
      i.slot === "weapon" &&
      i.visual?.fallback !== "hidden" &&
      i.visual?.replacesBaseWeapon !== false,
  );
  const preview = items.find((i) => i.id === look.preview)?.slot === "weapon";
  return (
    <g
      data-base-weapon=""
      style={{
        display: replacement ? "none" : undefined,
        opacity: preview ? 0.2 : undefined,
      }}
    >
      {children}
    </g>
  );
}
export function GearArt({
  asset,
  slot,
  bow = false,
}: {
  asset: string;
  slot: string;
  bow?: boolean;
}) {
  const Art = EQUIPMENT_ASSETS[asset] ?? EQUIPMENT_ASSETS[`generic-${slot}`];
  if (!Art) return null;
  if (bow && slot === "weapon")
    return (
      <g data-weapon-form="bow">
        <path
          d={BOW_LIMBS[asset] ?? BOW_LIMBS["storm-needle"]}
          fill="none"
          stroke="#171420"
          strokeWidth={5}
        />
        <path
          d={BOW_LIMBS[asset] ?? BOW_LIMBS["storm-needle"]}
          fill="none"
          stroke="var(--gear-accent)"
          strokeWidth={2.5}
        />
        <path d="M-8 -34 V34" stroke="#ecddc2" strokeWidth={0.9} />
        <g transform="translate(0 8) scale(.45)">
          <Art />
        </g>
      </g>
    );
  return <Art />;
}
const warned = new Set<string>();
if (import.meta.env.DEV)
  for (const warning of validateEquipmentVisuals(
    items,
    new Set(Object.keys(EQUIPMENT_ASSETS)),
  ))
    console.warn(warning);
/** Mount inside the animated parent, never in a stage overlay. SVG document
 * order sets layers: back before body; torso inside body; weapons before hands;
 * charms after torso plates. Animation writes only the existing ancestor. */
export function GearMount({
  anchor,
  layer,
  x,
  y,
  rotation = 0,
  scale = 1,
}: {
  anchor: GearAnchor;
  layer: GearLayer;
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
}) {
  const look = useContext(EquipmentContext);
  const rig = useContext(RigContext);
  const equipped = wornItems(look.items);
  const preview = items.find(
    (i) => i.id === look.preview && i.slot !== "supply",
  );
  return (
    <g
      data-attachment={anchor}
      data-layer={layer}
      transform={`translate(${x} ${y}) rotate(${rotation}) scale(${scale})`}
    >
      {[...equipped, ...(preview ? [preview] : [])].map((item, index) => {
        const visual = item.visual;
        if (
          (!visual ||
            visual.attachments.some((a) => !EQUIPMENT_ASSETS[a.asset])) &&
          import.meta.env.DEV &&
          !warned.has(item.id)
        ) {
          warned.add(item.id);
          console.warn(`Equipment visual fallback: ${item.id}`);
        }
        if (visual?.fallback === "hidden") return null;
        const attachments = visual?.rigOverrides?.[rig] ??
          visual?.attachments ?? [
            {
              anchor:
                item.slot === "weapon"
                  ? "mainHand"
                  : item.slot === "armor"
                    ? "torso"
                    : "waist",
              layer:
                item.slot === "weapon"
                  ? "weapon"
                  : item.slot === "armor"
                    ? "body"
                    : "front",
              asset: `generic-${item.slot}`,
            },
          ];
        const isPreview = index === equipped.length;
        return attachments
          .filter((a) => a.anchor === anchor && a.layer === layer)
          .map((a, n) => (
            <g
              key={`${item.id}-${isPreview}-${n}`}
              data-equipment={item.id}
              data-preview={isPreview || undefined}
              data-highlight={look.highlight === item.id || undefined}
              data-cursed={item.cursed || undefined}
              data-attack={visual?.attack}
              className="gear-piece"
              style={
                {
                  "--gear-accent": visual?.accent ?? "#d5c69c",
                  opacity:
                    preview?.slot === item.slot && !isPreview ? 0.2 : undefined,
                } as CSSProperties
              }
            >
              <g
                transform={`translate(${a.x ?? 0} ${a.y ?? 0}) rotate(${a.rotation ?? 0}) scale(${a.scale ?? 1})`}
                stroke="#171420"
                strokeWidth="1.7"
                strokeLinejoin="round"
              >
                {visual?.attack && (
                  <path
                    className="gear-attack-trail"
                    d="M-2 -42 Q21 -31 13 -9"
                    fill="none"
                    stroke="var(--gear-accent)"
                    strokeWidth={3}
                  />
                )}
                <GearArt
                  asset={a.asset}
                  slot={item.slot}
                  bow={rig === "ranger" && anchor === "mainHand"}
                />
                {look.pulse === item.id && (
                  <g
                    key={look.pulseKey}
                    className="gear-trigger"
                    stroke="var(--gear-accent)"
                    fill="none"
                  >
                    <GearReaction kind={visual?.reaction} />
                  </g>
                )}
              </g>
            </g>
          ));
      })}
    </g>
  );
}

function GearReaction({ kind }: { kind?: string }) {
  switch (kind) {
    case "shield":
      return <path d="M-20 -17 Q0 -10 20 -17 V3 Q16 19 0 25 Q-16 19 -20 3Z" />;
    case "thorns":
      return (
        <path d="M-10 0 L-23 -14 -11 -8 -9 -25 0 -9 13 -24 10 -6 24 -10 13 2" />
      );
    case "coins":
      return (
        <>
          {[-9, 0, 9].map((x, i) => (
            <ellipse
              key={x}
              cx={x}
              cy={-15 - i * 4}
              rx={3}
              ry={4}
              fill="#d7b15b"
            />
          ))}
        </>
      );
    case "healing":
      return <path d="M-3 -13 H3 V-4 H12 V2 H3 V11 H-3 V2 H-12 V-4 H-3Z" />;
    case "energy":
      return (
        <>
          <path d="M-10 10 Q-20 -5 0 -15 M10 10 Q20 -5 0 -15" />
          <circle cy="-15" r={3} />
        </>
      );
    case "blood":
      return <path d="M-8 -35 L3 -29 -7 -22 8 -16 -4 -8 5 3" strokeWidth={3} />;
    default:
      return (
        <>
          <circle r={10} />
          <path d="M-12 0 H-7 M7 0 H12 M0 -12 V-7 M0 7 V12" />
        </>
      );
  }
}
export function GearArrow({ children }: { children: ReactNode }) {
  const look = useContext(EquipmentContext);
  const item =
    items.find((i) => i.id === look.preview && i.slot === "weapon") ??
    wornItems(look.items).find((i) => i.slot === "weapon");
  return item ? (
    <g
      data-gear-projectile={item.id}
      stroke={item.visual?.accent ?? "#d5c69c"}
      strokeWidth={1.5}
    >
      <path d="M-5 0 H24" />
      <path d="M21 -3 L29 0 21 3Z" fill={item.visual?.accent ?? "#d5c69c"} />
      <path d="M-6 -3 L0 0 -6 3" fill="none" />
    </g>
  ) : (
    <>{children}</>
  );
}
