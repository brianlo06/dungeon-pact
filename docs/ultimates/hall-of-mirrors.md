# Hall of Mirrors (Beguiler) — storyboard

**The idea, in one sentence:** the Beguiler never lays a finger on anyone —
it shows every enemy its own painted smile on the face beside it, and when it
pulls the strings the line turns round and strikes itself, and the mirror the
lie was told in breaks.

Only the Beguiler could have it: the cracked porcelain half-mask with the
too-wide smile is its face, the shard of mirror is in its hand, and the
control with the limp doll is how it acts at all ("it attacks by yanking the
control"). Its class line is the film's plot: *Why fight them? Let them fight
each other.*

## Gameplay purpose

For one round the enemy side is its own worst enemy: every enemy is Confused
and turns its action on its own side (a lone enemy lashes at nothing and
wastes it), and the glass cuts — a sliver for every enemy, 10 more arcane on
the target.

**Small gameplay change, and why.** The Ultimate used to deal 14 to the target
and nothing to the rest. A film's cast is the enemies an Ultimate *hit*
(`cinematic/segments.ts`), and Confused alone logs no beat, so the film could
only ever have shown the target. Every enemy now also takes a 0-base arcane
sliver (the Beguiler's power, less guard, at least 1), and the target's own
share went from 14 to 10 so that, against an unarmoured target, what it takes
in all is unchanged. The cost is a few points of damage on each other enemy.
Measured against the old definition on the same sample
(`ultimate-report.ts 10 --sample=3`, 1,620 runs): 92% "all" with Ultimates
on, before and after; Beguiler uses 1.06 per run either way.

## Space, palette, sound

- **Space:** a hall whose walls are tall funhouse mirrors in tarnished frames,
  a black glass floor that reflects them, a sickly green footlight glow from
  below. Not a hall of light (Vanguard), a forge (Breaker) or a storm
  (Arcanist): a room made of surfaces that lie.
- **Palette:** violet `#c9a3ff`, porcelain `#f3eee6`, sickly green `#c7f06a`,
  one crimson — the smile.
- **Motif:** a music box — four notes, each answered a hair later by its
  reflection a semitone wrong. The reflection that lies, as sound.
- **Signature sounds:** a wet-finger glass ring; a wooden creak and one taut
  string in silence; the yank; the break (a transient, a sub drop, a body of
  glass partials, a long falling tinkle).

## Rhythm

identity (the smile) → stakes and target (the Beguiler in every mirror, the
real line among them) → escalation (the smile appears on every face) →
**anticipation, quiet** (music ducked to nothing: the strings drawn taut) →
impact (the yank; the line turns and strikes itself; the lens breaks) →
release (the broken mirror falls away off the real board).

The quiet is immediately before the loudest, and the tightest shot (the
strings) is immediately before the widest-feeling one (the impact).

## Leaving room for the paths

The base film owns *the smile in the mirror*. It keeps the puppet control to
one gesture (a pull), so **Puppeteer** can have strings on the enemies
themselves; it never shows the Beguiler stepping out of a mirror or doubling,
so **Illusionist** (Mirrorstep) can; and it never goes inside a mind, so
**Mindflayer** can.

## Shots — 4.34s FULL, 2.26s FAST (52%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 400 (240) | battle camera | real Beguiler `ult:lift` — the shard comes up to the mask, the head tilts too far | real battlefield dims violet, bars close | violet call aura; a hairline crack runs across the lens from the caster (`hom-crack`) | glass ring (`hom-call`); music ducks | on board | — | break the round: the screen you are watching is glass |
| 1 | Smile · face close-up | 620 (380) | tight on the mask, Dutch 9° → 5°, slow push | `ult:smile` — the head tilts over, the shard rises beside the face | hall of mirrors, near black; violet rim, green from below | the eye kindles (`hom-eye`), a glint runs up the shard, glass glitter | the eye note; motif's first reflection | no | black 50ms | identity: the face that will be on every face |
| 2 | Hall · target wide | 900 (—) | wide, trucking left across the line | — (the Beguiler is not in the room) | hall of mirrors lit; panes glowing violet | **the Beguiler in every mirror** (`hom-panes`: the real caster drawing, in ink with the porcelain mask), glitter | **motif**; a whisper passing pane to pane | **the whole real line**, looking round (`anticipate`) | cut | stakes and target; title |
| 3 | Masks · Dutch | 480 (300) | close along the line, Dutch −8° → −11° | — | hall, darker, green under-light rising | the porcelain smile is projected onto each enemy in turn (`hom-mask`, each target) | a rising glass-harmonica chord, one note per face | **line**, flinching (`block`) | cut | escalation: each sees the Beguiler in the one beside it |
| 4 | Strings · detail | 520 (340) | on the doll hanging from the control, Dutch 5° → 3°, held; the smile just in the corner | `ult:pull` — the control held out and drawn back, the strings plumb and taut, the doll turns edge-on and back | near black; one violet rim | glitter frozen; a glint runs down the string on the pluck | music ducked to 6%; a creak, then one plucked string | no | cut | anticipation by subtraction |
| 5 | Turn · impact | 760 (540) | medium wide, Dutch the *other* way 6° → 3°, easing out | `ult:yank` (contact 0.04), in silhouette | a white glare behind everyone for the drawn frame (`hom-glare`), then the hall | the lens shatters from the contact (`hom-shatter`, ink under light so it reads on the white frame), slivers burst off the target (`hom-burst`); at 0.46 the line's blows land: the smiles break off every face and slivers burst at each contact | `hom-yank`, layered break (`hom-impact`: click, sub, glass body, ring, room), `impact-heavy` when the blows land; **140ms stop**, heavy shake, a second shake | **line, turned to face its own side**: `attack`, then `hurt` and shoved when the blows land | cut on a **70ms violet two-tone** (FAST: invert) | impact, in two beats: the glass breaks (damage revealed on every enemy), then they strike each other; "There. It was them all along." |
| 6 | Fall · return | 660 (460) | battle camera | real Beguiler `ult:bow` | real battlefield; bars open | the broken lens falls away in pieces (`hom-fall`); a small porcelain smile hangs askew over every real enemy (`hom-mask`, anchored) | falling glass (`hom-tinkle`), tail | on board | flash 80ms | release: every enemy on the board is beguiled |

### Boss framing

A boss has nobody its own size beside it — often nobody at all. In **Hall**
the camera pulls back to take in its height, with the Beguiler still in every
pane. In **Masks** the smile appears not on an ally but on the boss's *own
reflection* in the pane beside it (`hom-panes` with `who: target`). In
**Turn** the boss swings round at that reflection, the pane explodes, and
there is nothing behind it: the blow is wasted on glass. The film never
claims how many allies the boss has; it frames the one thing beside it that
looks like one.

### FAST

Drops **Hall**; keeps the smile, the masks, the silence and the break. The
title rides the Masks shot instead.

## What the engine could not do, and what was built instead

- **A cast of enemies an Ultimate did not damage.** `splitUltimates` only puts
  enemies with a damage/combo/defeat beat into `targets`, so Confused alone
  would have left the line out of the film. Solved in gameplay (the sliver,
  above). The engine would need statuses from an Ultimate to count as reach.
- **A cast member drawn twice.** Only the shared `reflection` effect is handed
  a figure. `hom-panes` copies the presentation figure's DOM into each mirror
  once, on its first frame (a static pose, the real equipment); the engine
  would need a `slot` for any effect that asks for one.
- **Per-figure facing inside `targets`.** One cue faces the whole line, so the
  line turns as one, rightwards, onto the back of the next.
- **An occlusion with another object.** The occluder is always the cape, so
  this film uses `black` and `flash` cuts and breaks the lens itself instead.
