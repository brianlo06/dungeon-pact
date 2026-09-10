# Combat presentation

Updated 2026-09-10. How the battle screen is composed and why. The rules here
exist to stop combat drifting back into a dashboard; `ART_DIRECTION.md` covers
the wider visual identity.

## The one non-negotiable rule

**Combat owns exactly one viewport and never scrolls.**

The screen is three grid rows and only the middle one grows:

```
--strip      44px   context: round, chamber, boss objective, treasury, history
minmax(0,1fr)       the stage — everything left over
--controls   ≤186px party HUD and your actions
```

`minmax(0, 1fr)` rather than `1fr` is load-bearing: it lets the stage shrink
instead of pushing the controls off the bottom. Any new section has to take its
height from the strip or the controls, never from the document.

While `s.phase === "COMBAT"` the shell carries `data-combat`, which makes it
`100dvh`, hides the topbar and the run footer, and sets `overflow: hidden` on
`html` and `body`. Every other phase is unaffected.

Verified by hand with zero overflow at 1280×720, 1366×768, 1440×900 and
1920×1080. `tests/battle-layout.test.ts` locks the contract that makes it true —
it is not a pixel measurement, because the project has no headless browser yet.
**A real browser regression test is still owed**; it needs a Playwright-shaped
dependency decision that has not been made.

Breakpoints key off **height**, not width, because height is the constraint that
was actually being violated.

## The stage

Four depth bands, not four rows of cells:

| Band        | Depth | Reads as                                   |
| ----------- | ----- | ------------------------------------------ |
| enemy back  | 0.0   | furthest into the scene, smallest, coolest |
| enemy front | 0.3   | the fight's centre                         |
| hero front  | 0.72  | nearer the camera                          |
| hero back   | 1.0   | nearest the camera, largest                |

Depth is a number the stage supplies and the combatant consumes. It drives size
(`0.74 + depth × 0.36`) and saturation, so front and back are legible without a
label reading FRONT. Bands lean away from each other (`--lean`, ±7% and ±14%) so
the fight reads as a confrontation across a space rather than two stacked lists.

Combatant size comes from **container query units against the stage**
(`clamp(52px, 19cqh, 138px)`), not viewport units. The stage is the box a
fighter should be sized against, and this is also what makes the preview lab
honest: it renders the battle at an explicit resolution inside a larger window.

`footprint()` in `BattleStage.tsx` gives creatures different scale — a boss is
1.5, a container 1.05, a swarm-ish enemy 0.9. Scale is threat. These live in
presentation for now; they move to content presentation metadata when that
schema lands.

## Enemy intentions

Attached to the creature, never a detached card elsewhere on screen. A windup
gets a pulsing bordered chip and the word WINDUP, because interrupting it is a
real decision. Below 680px of height the back-row chips collapse to hover, since
the front row is where the pressure is.

## What is no longer permanently on screen

- The chronicle. It is now an opt-in drawer that **overlays** the stage and can
  never change the battlefield layout. `☰` in the strip, Escape to close.
- Full stat blocks. A combatant shows name, health, barrier, statuses and any
  seized equipment; everything else is a tooltip.
- The standing explanation of the rules.

## Beats

`resolveRound` emits `Beat { kind, actor, target, label, amount, hp }` and
`usePlayback` schedules them. Presentation consumes beats; it never decides
anything. Current mapping:

| Beat   | Presentation                                       |
| ------ | -------------------------------------------------- |
| cast   | ability name slams in over the stage; actor lunges |
| damage | recoil, floating number, health interpolates       |
| heal   | green rim light, floating number                   |
| block  | blue rim light, ⬡ number                           |
| combo  | full-stage banner (EXPLOIT, CHAIN SHOCK…)          |
| defeat | banner, unit desaturates                           |

## Still to build

Phases C–I of the overhaul are not done. In rough priority:

- **C** real 2.5D — parallax scenery, atmospheric particles, foreground
  occlusion, camera translation and zoom.
- **D** character-attached action menu. The actions are currently a compact row
  in the controls band; they should emerge from the controlled hero.
- **E** a frame loop. Playback is `setTimeout`-driven with a fixed 4200ms round
  budget, which is enough for timed reveals and not enough for camera
  interpolation, hit-stop or particles.
- **F** a reusable VFX vocabulary (projectile, beam, slash, burst, shockwave,
  aura, chain, dissolve) keyed by content metadata rather than hardcoded.
- **G** boss entrances, boss HUD, phase transitions.
- **H** creature art direction.
- **I** timing, shake control, audio balance.

## Rules any of that must keep

- Presentation never computes a result. No damage, RNG, gold or enemy decision
  moves into the client.
- No content is known by name in combat code. Presentation may key animations
  and effects off metadata the content supplies; it may not branch on
  `enemy.name === "The Collector"`.
- Presentation metadata is optional and defaults cleanly, so old runs render.
- Reduced motion keeps every piece of tactical information.
