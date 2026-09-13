# Still Life (Arcanist · Chronomancer) — storyboard

**The idea, in one sentence:** the Chronomancer's spark is a shutter — every
time it flickers it takes a still of whatever moves, and the Chronomancer
takes the enemy's next moment that way, still by still, tucks the stills up
its sleeve while the whole room hangs where it was, and then throws every one
of them back into the enemy in a single instant.

Only the Chronomancer could have it. The path's title is the plot: *A moment
taken from them is a moment given to you.* The drawing supplies the tools.
The Arcanist has no staff: it holds a **spark** out in a gloved hand, so the
spark is the thing that sees. It wears a **long sleeve** hanging off that arm,
so it has somewhere to keep what it takes (the oldest place to keep a trick is
up a sleeve). It has **no face** under the brim, only two eye-lights, so it
never shows effort; and the **tip of its hat** flops about on its own in every
round, so the one time it stops mid-flop the stopped moment has a shape. The
kit supplies the payoff: the Chronomancer traded the Arcanist's Break focus
for Stillness, four points of speed for its storm, and its Pact Charge comes
from interrupts and from the reactions it sets up.

Time is never drawn as a clock. It is drawn the way a still is: a moment
printed once and left behind. A **still** in this film is a real figure,
copied off the stage at the instant the spark flickers, printed as a pale
wash with its lines in amber, and left hanging where it was while the figure
goes on.

## Gameplay

`src/content/ultimate-defs/arc-chronomancer.ts`, target an enemy, cost 100,
speed 0:

| | Debt of Thunder (base) | **Still Life** (Chronomancer) |
| --- | --- | --- |
| The target | 26 lightning | **WINDUP broken**; **22 arcane through armour** |
| Every enemy | **Wet** (applied); Chain Shock 12 on the rest | **nothing new is applied**: whatever the party already laid on it (Wet, Marked, Vulnerable, Weak, Burn, Poison) is **held for three rounds**; the rest take a 0-base arcane sliver |
| The party | — | every ally, the Chronomancer too, **keeps its Empowered and Regeneration for three rounds** |
| Order | speed 10 | **speed 0: waits for every other Ultimate** queued that round, so it holds what they lay down |
| Mana | +3 | +2 |

It differs in what it does, not only in numbers. Debt of Thunder *makes* the
setup (Wet on every enemy) and spends it at once. Still Life makes nothing and
spends nothing. It takes one enemy's moment away and stops the clock on the
rest of the fight: the party's afflictions on the enemy stop running out, and
the party's own boons stop running out. Its team play is the reactions the
others build. A held Wet is a Chain Shock the Arcanist, a Tidecaller or a
Pyromancer's ally can still set off two rounds later; a held Mark is an
Exploit the Ranger has not had to re-mark; a held Vulnerable is every blow a
quarter harder for three rounds; a held Empowered makes a Herald's Anthem or a
Warcaller's din last. At speed 0 it is the last Ultimate to resolve, so
pairing it with an ally's Ultimate in the same round holds that Ultimate
(tested with the Anthem: two rounds of Empowered held to three).

It turns nobody on their own side. Stillness does that in a round; Hall of
Mirrors does it as a whole Ultimate. This one is about time, not control.

Holding re-applies each status at one stack, the least the effect system
accepts. A status capped at one stack (Wet, Marked, Vulnerable, Weak,
Empowered) is unchanged except for its duration; Burn, Poison and
Regeneration gain one stack. The sliver on every other enemy is there for the
film as much as the fight: a film's cast is the enemies an Ultimate damaged.

Quick balance (`scripts/ultimate-report.ts 4 --sample=6`, 324 runs, same
machine), against the same sample with this path's stub still `null` (the
Chronomancer on Debt of Thunder):

| Win rate | off | on, baseline (Debt of Thunder) | on, Still Life at 18 | **on, Still Life at 22** |
| --- | ---: | ---: | ---: | ---: |
| 2 players | 75% | 83% | 83% | **83%** |
| 3 players | 94% | 95% | 95% | **95%** |
| 4 players | 92% | 93% | 92% | **93%** |
| all | 91% | 93% | 92% | **93%** |

At 18 damage it was a point light at four players; at 22 it matches the
baseline everywhere. Arcanist uses per run 2.71 → 2.70, charge earned 293 →
293. The tests are `tests/ultimates-still-life.test.ts`.

## Space, palette, sound

- **Space: the held fall.** A dungeon chamber at the instant its roof gave
  way, stopped. Blocks of the vault hang in the air at every height, each one
  with the faint stepped outlines above it of where it was a moment earlier;
  a pillar leans, toppling, and does not arrive; dust hangs in the air as
  points. The floor is still dark and clear, lit by one pale horizontal band
  of light, the light a still is taken in. Nothing in it is weather, and
  nothing in it is a hall of light, a forge, a drowned ledger, a ridge, a
  causeway, a garden, a vault of goods, the ground under the floor, a pit, a
  woodcut field, a wood, a labyrinth or a page.
- **A still** (`still-plates`), drawn one way everywhere: a copy of a real
  figure taken off the stage at a flicker of the spark, every fill a pale
  lavender wash, every line amber. It never moves on its own. A run of them is
  a figure's moment laid out.
- **Palette:** indigo black `#0a0914`, still-light lavender `#e6e1f6`, amber
  `#ffb870` (the eye-lights, deepened, and every line of a still). The
  Arcanist's storm blue is nowhere except in its own drawn spark.
- **Motif (original):** four notes, each played *backwards* (a tone that
  swells up out of nothing and is cut at its peak): E5, B4, C5, then G4 held.
  The reversed envelope is the whole signature of the film's sound: time run
  the wrong way.
- **Signature sound:** the take (`still-take`), a reversed breath of noise
  that snaps shut on a dry double click, like a shutter.
- **Impact, layered:** a click and a hard noise crack (transient); a sub
  dropping (weight); every still arriving at once, four detuned reversed
  tones cut on the same sample (the body); the stones of the roof landing,
  a lowpassed room, and a long falling ring (tail).

## Rhythm

identity (the spark takes its first stills: a hand laid out in time) →
stakes and target (the real line winding up; every flicker of the spark takes
a still of each enemy's coming blow and leaves it hanging ahead of it; title)
→ escalation (from behind the brim: every still is pulled off the line and up
the sleeve) → **quiet** (the profile against the still-light: the hat's tip
stopped mid-flop, nothing moving, not even the dust; the eye-lights come up)
→ impact (the sleeve flung open: every still goes back into the target at
once; the roof comes down) → release (the real board: a still left hanging on
every enemy, and the taken moments given to the party as rising light).

## Shots — 4.44s FULL, 2.34s FAST (53%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Arcanist `ult:still-pinch`: the spark comes up and is pinched small | real battlefield sinks to indigo, bars close | amber call aura; the spark flickers once (`still-flicker`, anchored) | `still-call`: a reversed swell snapping shut; music ducks | on board | — | break the round |
| 1 | Pinch · extreme close-up | 620 (380) | tight on the glove and spark, Dutch 6° → 4°, a slow push | `ult:still-pinch`: the hand sweeps up across the frame, pinching the spark down to a hard point (`root: false`) | the held fall, far behind and dark; the still-light behind the hand | on each flicker a **still of the hand and spark** is taken and left in the air (`still-plates`, caster, hand only): the gesture laid out in four stills | `still-take` ×3 | no | black 60ms | identity: this spark takes moments |
| 2 | Windup · target | 900 (—) | low on the real line, level, a slow truck left | — (the Chronomancer is not in the shot) | the held fall, stones hanging overhead; the still-light across the floor | **the real line winding up** (`anticipate` → `windup`); at three flickers each enemy's **coming blow is taken as stills**, stepping out ahead of it towards the party, each a little further on, each paler (`still-plates`, targets, step) | **motif**; `still-take` on each flicker | **the real line**, winding up | cut | stakes and target: their next moment, laid out; title |
| 3 | Sleeve · over the shoulder | 520 (360) | from behind the brim, the hat's black shape filling the top left, the line small beyond; pushes in | `ult:still-gather`: the hand goes back up by the brim, the sleeve turned open towards the line | the held fall; amber back light | every still is **pulled off the line** and streams back past the lens into the sleeve, growing as it comes (`still-plates`, targets, stream); at the end the brim sweeps across the lens (`still-brim`) | a reversed rush (`still-gather`) | the line, small, stills leaving it | cut | escalation: the moments, taken |
| 4 | Stopped · profile close-up | 560 (380) | side-on, dead level, locked off | `ult:still-hold`: nothing moves; the hat's tip is caught mid-flop and stays there (`root: false`) | exposure right down; the Chronomancer's profile black against the pale band of still-light | the eye-lights come up amber, the only thing that changes (`still-eyes`); the dust hangs (`still-dust`, still) | **music ducked to 5%**; one thin held tone, then a reversed breath drawing in (`still-hush`) | no | the brim, in-folder | the quiet: time stopped, and the Chronomancer the one thing outside it |
| 5 | Release · impact | 740 (520) | on the target, the Chronomancer's flung arm and sleeve in the left foreground; eases back | `ult:still-release` (contact 0.1): the sleeve flung open at the target, the spark gone | the held fall, blown out amber, then settling | **70ms amber two-tone** held by the stop; **every still arrives in the target at once**, overprinted on it, and blows out through it (`still-plates`, converge); a stepped burst (`still-burst`); the roof comes down: the hanging stones fall and break (`still-fall`); each other enemy's own still arrives in it a beat later | `still-impact` layered; **150ms stop**, heavy shake, a second small shake | **target** `hurt`, shoved and tipped; **the line** `hurt` at 0.36 | cut on the two-tone | impact: the damage on the frame; "There. Have it back." |
| 6 | Given · return | 680 (460) | battle camera | real Arcanist `ult:still-settle`: the hand to the brim, the spark back in the glove | real battlefield; bars open | a **still left hanging** ahead of every real enemy, fading slowly: its moment, held (`still-held`, anchored); **amber stills of light rising** off every ally: the moments given (`still-given`, anchored) | `still-after`: the motif's last two notes, forwards this time; tail | on board | flash 80ms | release: held on them, given to the party |

### Boss framing

The stills are copies of the real figure, so a Collector's stills are a
Collector's size. In **Windup** the camera pulls back and up to take in its
height and the stills stepping out ahead of it; in **Release** the camera
frames the boss whole and big, the Chronomancer's arm is smaller in the
corner, and the stills converge on the boss's middle, with a small shove. A
boss is struck, not shrunk. Large framing (the Iron Bulwark) sits between.

### FAST

Drops **Windup**. The title rides **Sleeve**. It keeps the stills (the hand's,
and the line's, taken in **Sleeve**), the quiet and the impact.

## Performance, without a face

The Arcanist is not one of the five face heroes: under the brim it has two
eye-lights and nothing else. Debt of Thunder acts under the brim, with the
tome and the pages. This film never looks under the brim and never opens the
book. It acts with **the hand** (the sweep and the pinch, the flung sleeve),
**the spark** (pinched small, gone at the release, back after), **the hat's
tip** (the lag that stops) and **the eye-lights**, drawn over the profile in
the quiet. No part was added to `Arcanist.tsx`; the combat `spark` part is
used as it is.
