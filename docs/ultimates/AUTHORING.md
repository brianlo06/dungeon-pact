# Authoring an Ultimate

The brief for authoring one Ultimate — its gameplay if it is a path's, its
storyboard, its poses and effects and sounds, its film — to the quality of the
benchmark. Read `docs/ULTIMATES.md` first; it is the design this plugs into.

The user approved all 32 on one condition: **they keep up the quality.** A film
that is merely complete is not done.

## The bar

Study these before writing anything, and play them in the lab:

- `src/content/cinematics/lantern-wall.ts` — the Vanguard. Gold, a lantern
  hall, a planted shield, silence before the charge, wards on the real board.
- `src/content/cinematics/gatebreaker.ts` — the Breaker. Proof a path's film
  shares nothing with its class's: a forge, a gate, a ram, a row broken open.
- `src/content/cinematics/debt-of-thunder.ts` — the Arcanist (in progress).

What they have that yours must have:

1. **One idea only this character could have**, drawn from its kit, its path
   and its drawing — never a recoloured version of another film. Name it in a
   sentence at the top of the file.
2. **Rhythm**: identity → anticipation → escalation → target → impact →
   release, or a deliberate variation of it. At least one **quiet** moment
   (exposure down, music ducked, motion held) immediately before the loudest.
3. **5–7 shots** from the vocabulary (`ShotKind`), no two framed alike; hard
   cuts by default, and at least one authored transition (occlusion, whip,
   flash, black) where it hides a cut.
4. **The real target(s)**, at their real footprint, reacting (brace, flinch,
   shove) — and `framing.large` / `framing.boss` overrides so a boss is framed,
   not shrunk. A support Ultimate shows the real party instead, and no enemy.
5. **The real equipment**: nothing to do but not replace the hero's weapon
   with art, unless the Ultimate summons a signature weapon on purpose.
6. **An impact that is drawn**: a one- or two-frame accent (two-tone, invert,
   black, flash), a hit-stop, shake, and the result revealed on that frame.
7. **A return over the real battlefield** that shows what the Ultimate did
   where it matters (wards, cracks, marks, water).
8. **3–5 seconds FULL** (tests enforce 3000–5000ms), a **FAST** cut under 72%
   that keeps the anticipation and the impact.
9. **Sound**: a motif (3–4 notes, original), a signature sound, the impact
   layered (transient, sub, body, tail); duck the music under the quiet shot.
10. **Voice hooks**: `activation`, `impact`, `after` lines in the character's
    own tone. Nothing quoted from any other game.

Never copy Honkai: Star Rail shots, poses, spaces, effects or lines. Principles
only.

## What goes where

Everything for Ultimate `<id>` lives in files only that Ultimate touches.

| File | What |
| --- | --- |
| `src/content/ultimate-defs/<hero or path id>.ts` | Gameplay: effects, target, speed, name, epithet, description, `presentation` (`cinematic: "<id>"`, accent, voice). Path stubs are `null` until authored. |
| `docs/ultimates/<id>.md` | The storyboard, in the table format of `ULTIMATES.md` §7, written **before** the film. |
| `src/content/cinematics/<id>.ts` | The film. Collected automatically. |
| `src/client/ultimates/<id>/poses.ts` | `export const poses: Record<heroId, Rig>` — `ult:` clips. **A path's pose names must be prefixed** with its short name (`ult:aegis-raise`), so two Ultimates of one hero never collide; a duplicate name throws at load. |
| `src/client/ultimates/<id>/vfx.tsx` | `export const renderers` and optionally `export const frames` — new effect kinds. Import `./style.css` here. Use `seeded`, `VfxProps`, `VfxContext` from `cinematic/vfx.tsx`. |
| `src/client/ultimates/<id>/background.tsx` | `export const backgrounds: Record<string, ComponentType>` — a 3200×1800 SVG on the `viewBox="-800 -450 3200 1800"` of the existing backgrounds. |
| `src/client/ultimates/<id>/sounds.ts` | `export const voices: Record<string, Voice>` built from `audio/synth.ts` (`hit`, `crash`, `swell`, `hz`). Prefix names with the Ultimate (`aegis-bell`). |
| `src/client/ultimates/<id>/style.css` | Styles for your effects and background. Class names prefixed with the Ultimate. |
| `src/client/components/heroes/<Hero>.tsx` | Only to add parts a close-up needs (the Arcanist gained `tome` and `pages`). A new part must be invisible or unchanged at rest, so combat looks identical. |
| `tests-browser/ultimates/<id>.spec.ts` | Your film plays in the lab, shows its targets, reveals its result, skips clean, frames a boss. |

**Do not edit** anything else. In particular not `shared/cinematic.ts`,
`cinematic/UltimateCinematic.tsx`, `cinematic/vfx.tsx`,
`cinematic/backgrounds.tsx`, `cinematic.css`, `battle/director.ts`,
`battle/rigs-ultimate.ts`, `audio/engine.ts`, `content/ultimates.ts`,
`content/cinematics/index.ts`, `tests/cinematics.test.ts`, `docs/ULTIMATES.md`
or the reference films. Other Ultimates are being authored at the same time
against those files. If the engine genuinely cannot do what a shot needs,
build the smallest version you can inside your folder and **say so in your
report**, with exactly what the engine would need — do not change it.

Shared vocabulary you can use without adding anything: backgrounds `void`,
`pact-sigil`, and effects `floor-cracks dust motes glint gather call-aura
ward-dome trail speed-lines impact-star shockwave debris sparks embers rain
lightning arcs wet pages drops rune-circle` (see `vfx.tsx`); `follow`,
`each: "targets"`, `anchor` for battlefield shots; screen accents; framing
overrides. Reusing a shared effect is fine; building your film out of nothing
but shared effects is not the bar.

## Faces

The Ranger, Warden, Broker, Herald and Reaver show their faces, and each face
has three parts a close-up can move: `brow`, `eyes` and `mouth` (grouped from
the existing drawing, pivoting on each feature). They register with the
animator only inside a cinematic's copy of the figure, so a round never pays
for them. Build their tracks with `face()` from `src/client/battle/face.ts` and
spread them into a clip's `parts`:

```ts
parts: { ...face([0, FACES.focus], [0.6, FACES.fury]), head: turn([0, 0], [0.6, -8]) }
```

Preview any preset on a hero in the lab with `&face=fury` (or `rest`,
`resolve`, `shout`, `shock`, `focus`, `calm`, `grin`) on a paused close-up, and
capture it cropped with `&crop=.cine-actor[data-role=caster] [data-part=head]`.
Tune magnitudes per hero: the Reaver's brow is a shelf of bone over its eyes,
so tilting it (`knit`) more than about 5° shows the socket under it; lift and
lower it instead. A close-up without any face acting, on one of these five, is
below the bar.

## Gameplay, for a path's Ultimate

Read the path in `content/evolutions.ts` — what it trades away and what it
gains — and exaggerate that identity. It must differ from the class's
Ultimate in *what it does*, not only in numbers. Stay inside the effect system
(`allies`/`enemies` scopes included). Keep its power in line with the others in
`ultimate-defs/`: an Ultimate is worth about two strong actions plus a team
effect. Then:

```sh
npx tsx scripts/ultimate-report.ts 4 --sample=6      # the whole game, off vs on
```

must not move "all" by more than a point from the numbers in `ULTIMATES.md`
§9. Balance across all 32 is re-measured centrally after merges.

## The loop

Work in your own worktree, reset onto the commit you were given, with
`node_modules` symlinked from `/Users/brianlo/dungeon-pact/node_modules`, and
your **own ports** (given in your brief) for the dev server and `PW_PORT`.

1. Audit the kit, the path, the hero's drawing and its combat rig
   (`battle/rigs-party.ts`) and its parts.
2. Write `docs/ultimates/<id>.md`: fantasy, gameplay purpose, rhythm, and the
   shot table (camera, pose, background/light, VFX, audio, target, transition,
   purpose, FULL/FAST ms).
3. Gameplay (paths), poses, effects, background, sounds, film.
4. Run the lab: `npx vite --host 127.0.0.1 --port <port> --strictPort`, then
   `/dev/ultimates.html?hero=<hero>&evo=<path>&enemy=hound&auto=1`.
5. **Probe before you aim.** A camera or an effect is placed where the part
   really is, not where you think it is:

   ```sh
   npx tsx scripts/probe-ultimate.ts <port> "hero=<hero>&auto=1&pause=1&shot=3&at=0.5" \
     '.cine-actor[data-role=caster] [data-part=head]'
   ```

6. **Look at every shot.** Capture a contact sheet, read it, fix, repeat until
   every shot reads at a glance — composition, the subject in frame, nothing
   cut off that matters, text not covering the subject:

   ```sh
   SHEET=sheet npx tsx scripts/capture-ultimate.ts <out-dir> <port> \
     "s1=hero=<hero>&auto=1&pause=1&shot=1&at=0.5" "s2=..."
   ```

   Check `framing=boss` (`enemy=collector`), a row or party target, `mode=fast`,
   `motion=0`, and `gear=kit`.
7. Performance: `GPU=1 npx tsx scripts/profile-ultimate.ts <port> 1920x1080
   "hero=<hero>"` — the film's p50/p95 must match the round after it. **No CSS
   `filter` or `blur()` on anything that moves or is large**; no CSS keyframes
   (everything runs on the combat clock through `--p` and frame functions).
8. Tests: `npx tsc --noEmit`, `npx vitest run tests/cinematics.test.ts
   tests/ultimates.test.ts tests/party-rigs.test.ts tests/rig-facing.test.ts`,
   and `PW_PORT=<port> npx playwright test tests-browser/ultimates/<id>.spec.ts
   --project=1280x720 --workers=1`. Run `npx vitest run` once at the end.
   The machine is shared: use one browser worker.
9. Final captures (JPEG) of every shot plus boss and fast variants, into the
   output directory you were given, and commit on your worktree branch.

## The report

End with: the Ultimate's one-sentence idea; its gameplay (paths); the shot
list with FULL/FAST ms; the capture paths; test results; profile numbers; the
quick balance numbers (paths); anything you had to approximate because the
engine could not do it; and your own honest judgement of where the film is
weakest.
