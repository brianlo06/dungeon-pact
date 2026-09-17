import type { Voice } from "./synth";

/**
 * Sounds written beside the Ultimate they belong to, in
 * `src/client/ultimates/<id>/sounds.ts`, each exporting `voices`. Collected
 * here so authoring an Ultimate never edits a file another Ultimate shares.
 */
const modules = import.meta.glob<{ voices: Record<string, Voice> }>(
  "../ultimates/*/sounds.ts",
  { eager: true },
);

export const FOLDER_VOICES: Record<string, Voice> = {};
for (const [path, mod] of Object.entries(modules))
  for (const [name, voice] of Object.entries(mod.voices ?? {})) {
    if (FOLDER_VOICES[name]) throw Error(`Sound ${name} is defined twice (${path})`);
    FOLDER_VOICES[name] = voice;
  }
