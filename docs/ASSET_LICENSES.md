# Asset manifest

| Asset                                  | Origin / rights                                                                                                                                                                 | Status                                                                                                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/art/characters-v1.png`         | Generated for Dungeon Pact with OpenAI image generation, 2026-09-10. No external character references supplied.                                                                 | Original project generation; provenance is AI-generated, not commissioned human illustration. Source output retained in local generated-images directory. |
| `public/art/characters-v2.png`         | Generated for Dungeon Pact with Google Gemini image generation, 2026-09-10, from the prompts in `scripts/generate-sprites.ts` and two cropped v1 cells used as style reference. | Original project generation; provenance is AI-generated, not commissioned human illustration. Assembled by `scripts/build-sprite-sheet.py`.               |
| `src/client/components/GuildScene.tsx` | Source-authored SVG geometry for tavern walls, windows, furniture and fire                                                                                                      | Editable project source                                                                                                                                   |
| `src/client/components/PixelIcon.tsx`  | Source-authored 16×16 interface icon paths                                                                                                                                      | Editable project source                                                                                                                                   |
| `public/fonts/silkscreen.ttf`          | The Silkscreen Project Authors; SIL Open Font License 1.1                                                                                                                       | Self-hosted; license included at `public/fonts/OFL-Silkscreen.txt`                                                                                        |
| Synthesized oscillator cues            | Original runtime synthesis in `src/client/audio.ts`                                                                                                                             | No third-party recordings                                                                                                                                 |
| Small status glyphs                    | Platform font rendering                                                                                                                                                         | Text symbols only; hero/enemy glyph placeholders have been replaced                                                                                       |

Removed the Cormorant Garamond / DM Sans remote imports. No music, ambience or third-party sound pack is included. Music/ambient controls remain hidden until tracks exist.

## Audio

**All combat sound is synthesised at runtime.** There are no audio files in this
repository and none are downloaded at build or run time.

`src/client/audio/engine.ts` builds every sound from oscillators and shaped
noise through the Web Audio API. Authorship is unambiguous and there is nothing
to licence. This was a deliberate choice: the project's rule is that no asset
ships without a known licence, and sourcing sound effects of uncertain
provenance would have broken it.

These are development-grade sounds with a production shape. When recorded
assets are commissioned they replace the `render` function for a given name;
the mixer, the bus structure and every call site stay as they are. Any such
asset must be listed here with source, author, licence, URL and whether it was
modified, before it is committed.

### Ultimates

The Ultimate voices and motifs (`ULTIMATE_VOICES` in `audio/engine.ts`) are
the same runtime synthesis: oscillators and shaped noise, no recordings. The
two motifs are original note sequences written for this project. Nothing is
taken from any other game.

## Vector art

The Ultimate cinematic backgrounds and effects (`src/client/cinematic/
backgrounds.tsx`, `vfx.tsx`) and the Ultimate rig poses
(`battle/rigs-ultimate.ts`) are original SVG and pose data authored in this
repository. No assets, animation, camera work or effects were taken from
Honkai: Star Rail or any other game; it was a reference for principles only.


`Strongbox.tsx`, `Foundry.tsx` and `BossIntro.tsx` are original SVG authored
directly in this repository. No third-party vector assets are used.
