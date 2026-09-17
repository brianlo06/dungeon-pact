import type { ComponentType, ReactNode } from "react";
import { VFX, VFX_FRAME, type VfxContext, type VfxProps } from "./vfx";

/**
 * Everything an Ultimate brings with it, collected from its own folder.
 *
 * `src/client/ultimates/<id>/` holds one Ultimate's presentation: `vfx.tsx`
 * (exporting `renderers` and optionally `frames`), `background.tsx`
 * (exporting `backgrounds`), `poses.ts` (rig clips, see `battle/rigs.ts`) and
 * `sounds.ts` (see `audio/ultimate-voices.ts`). The shared vocabulary stays in
 * `vfx.tsx` and `backgrounds.tsx`. A name defined twice is an error, so two
 * Ultimates authored side by side cannot silently replace each other's work.
 */

type Renderer = (p: VfxProps) => ReactNode;
type Frame = (el: HTMLElement, p: number, age: number, ctx: VfxContext) => void;

const vfxModules = import.meta.glob<{
  renderers?: Record<string, Renderer>;
  frames?: Record<string, Frame>;
}>("../ultimates/*/vfx.tsx", { eager: true });

const backgroundModules = import.meta.glob<{
  backgrounds?: Record<string, ComponentType>;
}>("../ultimates/*/background.tsx", { eager: true });

function merge<T>(base: Record<string, T>, found: [string, Record<string, T> | undefined][], label: string) {
  const out: Record<string, T> = { ...base };
  for (const [path, entries] of found)
    for (const [name, value] of Object.entries(entries ?? {})) {
      if (out[name]) throw Error(`${label} ${name} is defined twice (${path})`);
      out[name] = value;
    }
  return out;
}

export const RENDERERS = merge(
  VFX as Record<string, Renderer>,
  Object.entries(vfxModules).map(([p, m]) => [p, m.renderers]),
  "Effect",
);

export const FRAMES = merge(
  VFX_FRAME as Record<string, Frame>,
  Object.entries(vfxModules).map(([p, m]) => [p, m.frames]),
  "Effect frame",
);

export const FOLDER_BACKGROUNDS = merge<ComponentType>(
  {},
  Object.entries(backgroundModules).map(([p, m]) => [p, m.backgrounds]),
  "Background",
);
