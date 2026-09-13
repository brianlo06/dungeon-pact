# Warpath — Vanguard · Warlord

**The idea, in one sentence:** the Warlord breaks trail — it roars a plume of
breath out of its visor into a blizzard and wades first through snow too deep
for anyone else, and the party comes after it in its footprints, all the way
to the enemy the trail ends at.

Only the Warlord could have it. The Vanguard's title is *Stand between fate
and your friends*; every other Vanguard film is about standing still in front
of the party. The Warlord path is *Fight louder. They follow the noise.* It
traded Shieldbreaker for Warcry and the Vanguard's pure guarding for command.
So this is the one Vanguard film where the party is **behind it because it is
following**, not because it is hiding: who follows is the party, and where to
is exactly where the Warlord walked. The Vanguard is the widest thing in the
party and the only one whose front is a wall; in deep snow that makes it the
one who can go first. And it has no face: the warcry is not drawn as sound at
all, but as the one thing a helm can show in the cold — breath.

## Gameplay purpose

`ultimate-defs/van-warlord.ts`, target an enemy, cost 100, speed 14:

1. **22 damage** to the chosen enemy (with the path's +2 power, ~27 before Guard);
2. that enemy is **Marked** for two rounds — the end of the trail;
3. and **Vulnerable** for two rounds;
4. **the whole party, the Warlord included, moves into the front row**, each
   with **8 Barrier**;
5. **+2 Resolve**.

A team play through the reach rules and the reactions: from the front row a
melee hero may strike a Marked enemy even behind a screen of front-line
enemies (`shared/reach.ts`), so the Reaver or a second Vanguard can follow the
Warlord to a sniper at the back; a Ranger's precision cashes the Mark as an
Exploit; everyone's blows land on Vulnerable. The cost is the Vanguard's
identity: with everyone in the front row, the enemy's blows spread across the
party instead of all landing on the one built to take them.

| | Lantern Wall (base) | **Warpath** (Warlord) |
| --- | --- | --- |
| The party | +12 Barrier **and guarded** by the Vanguard | **moved into the front line** with 8 Barrier; nobody guarded |
| The caster | +6 Barrier per ally, +8 | 8 Barrier, like everyone who followed |
| The target | charge: 20, WINDUP broken, Vulnerable | struck for 22, **Marked** and Vulnerable — no interrupt |
| The enemy's next blows | all drawn to the Vanguard | spread across a party standing in the front |
| Resolve | +2 | +2 |

Not **Into the Din** either (self-Empowered, a strike, Vulnerable, the party
Empowered for the round): nobody is Empowered, and what the party gains is
**position and reach**, not courage.

## Space, palette, sound

- **Space: a snowfield at dusk, in a blizzard.** Open white ground to a low
  horizon, wind-carved drifts in blue shadow, a slate sky and snow driving
  sideways across everything. No hall, forge, gate, causeway, storm-drowned
  hall, sky at dusk with ribbons, no-man's-land, meadow, vault, wood, pit,
  mirror room or labyrinth. The only film in snow.
- **Palette:** snow `#e9eef2`, drift shadow `#8ea2b6`, slate dusk `#1c2430`,
  ink `#0b0e13`, and the Warlord's own rust `#e0664a` (its crest, cape and
  shield, the accent), which is the only warm thing in the film.
- **Signature effect — the trail.** The Warlord wades hip-deep, heaving the
  snow aside with its shield; behind it the snow is broken into a trench, and
  the party wades in it, stepping where it stepped. From above, the trail is
  one dark stroke across the white from the edge of the world to the enemy.
  On the board after, it is a line of snowy boot prints: into the front for
  every ally, and on up to the enemy it ends at.
- **The warcry, drawn as breath:** a plume of vapour out of the visor slit,
  torn away by the wind.
- **Motif (original):** four notes on a low war-horn, each on a heavy footfall
  in snow — A2, C3, B2, then down to E2. A trudge: up a minor third, down a
  step, down a fifth. Not the Vanguard's fifth-and-octave horn, not the
  Breaker's anvils, not the Warcaller's drum and brass on D-D-F.
- **Signature sound:** a roar inside a helm — a throat through the steel's
  own ring — and boots breaking snow crust.
- **The impact, layered:** a crack of steel (transient), a sub drop, a heavy
  crump of snow and a low horn stab on the motif's E (body), and the wind
  rushing back in with a hiss of powder falling (tail).
- **The quiet:** the wind drops dead with the cut; the snow stops driving and
  sinks straight down, slowly; the music is ducked to 5%; a cloud's shadow
  crosses the plain. Only the creak of a boot in the snow.

## Rhythm

identity (the roar: the helm thrown back, breath torn out of the visor) →
stakes and escalation (breaking trail: the Warlord wades straight at the lens,
heaving the drifts aside, the real party in its trench behind it, the real
enemy waiting far ahead; title) → **quiet** (from high above the plain: the
trail is one dark line across the white, the file of tiny figures on it, the
enemy a step from its end; the wind dies) → **impact** (the last step: the
sword over the top and down; an ink-and-snow frame; the snow thrown up behind
the enemy; the party arrives in the Warlord's tracks behind it) → release (the
real board: the party standing in the front line, snowy prints leading into
each of them and on to the enemy, trampled round its feet).

The camera looks down on the Warlord exactly once, from far above, where every
other Vanguard film looks up at it or rides beside it.

## Shots — FULL 4120ms, FAST 2640ms (64%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Warlord `ult:warpath-call` — sword thrown forward at the enemy, helm up | real battlefield goes slate, bars close | rust call aura; snow starts driving across the real board (`warpath-snow`, screen) | wind rising, a scrape of steel; music ducks | on board | — | break the round: the weather turns |
| 1 | Roar · face close-up | 620 (380) | tight on the helm in profile, pushing in a little | `ult:warpath-roar` — the helm drawn back (the breath in), then thrown forward and up: the roar; crest and cape whip back in the wind (`root: false`) | snowfield, dusk, slate; rust rim | snow driving past the lens; **a plume of breath bursts from the visor slit and is torn back** (`warpath-breath`) | wind; the roar in the helm; "In my tracks. All of you." | no | black 80ms | identity: a faceless helm's warcry, as breath |
| 2 | Breaking trail · wide | 1000 (560) | low at the snow surface; the Warlord wades diagonally toward the lens, the camera easing back and right | Warlord `ult:warpath-wade` (loop), shield low as a plough; the real allies `ult:warpath-follow` (loop, in step) in the trench behind it, receding up the frame | snowfield; exposure 0.7; rust rim on the Warlord | **snow to the hips round every figure, heaved aside ahead of the Warlord and broken into a trench behind** (`warpath-drift`); clods thrown off the shield; snow driving | the motif on the footfalls; crunches; wind | **yes**, small, far ahead on the rise, bracing at 0.72 | a sheet of snow across the lens hides the cut (`warpath-gust`) | stakes: who follows, and where to; title |
| 3 | The trail · extreme wide, from above (the quiet) | 560 (380) | high and far, dead still | Warlord `ult:warpath-step` (sword drawn back, held); allies `ult:warpath-follow` frozen mid-stride | the plain from above; exposure 0.34 → 0.16 as a cloud's shadow crosses; heavy vignette | **the trail: one dark stroke from the frame's edge to the Warlord**, a step short of the enemy (`warpath-trail`); the snow stops driving and sinks slowly (`warpath-snow` settle) | music ducked to 5%; the wind cut dead; one boot creaks | **yes**, tiny, braced | cut (the wind cuts with it) | the quiet: the whole idea in one frame |
| 4 | The last step · impact | 820 (600) | medium profile on the contact, Dutch −5° → −2°, easing back | Warlord `ult:warpath-cleave` (contact 0.06): the sword over the top and down on the enemy, the shield flung back; allies step into the frame behind it at 0.45 in its tracks (`ult:warpath-follow`); target `hurt`, shoved, tilted | snowfield; exposure blown to 1, falling; rust tint | **70ms two-tone** (snow to white, figures to ink); the hit-stop holds the blade on the enemy; **a hand-cut wedge of white split open at the contact** (`warpath-cleave`); **snow ripped up and thrown in a fan behind the enemy** (`warpath-throw`); snow to the hips (`warpath-drift`) | layered impact; **150ms stop**; heavy shake | **yes** | cut on the two-tone frame (FAST: invert) | impact: the damage and Marked/Vulnerable on the held frame; "HERE!"; the party arriving where it walked |
| 5 | Front line · return | 720 (480) | battle camera | real Warlord `ult:warpath-stand` — sword forward, shield up | real battlefield; bars open | **snowy boot prints into the front for every ally, and on from the Warlord to the enemy, trampled round its feet** (`warpath-board`); the snow thinning away | the motif's last two notes on the horn, soft; tail | on board | flash 80ms | release: the party in the front line, the enemy marked by the trail |

## Framing

- **Large and boss.** The trail shot keeps the boss on the rise at its real
  size, pulled back so it stands whole; the quiet's plain keeps it at the
  trail's end; the blow frames up at the boss with the Warlord smaller, the
  blade landing on its body, a bigger wedge and throw, and a short shove.
- **Party size.** The trail and the blow are laid out for one, two or three
  allies along the trench, each later ally further up the trail.

## FAST

Keeps all six shots, shorter. The trail is cut to 560ms (the title, the file
and the target are still in it); the quiet and the impact keep their shape.

## Voice

"In my tracks. All of you." · "HERE!" · "The front is wherever I'm standing."
