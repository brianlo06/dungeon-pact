# Elegy for the Standing — Herald · Dirgesinger

**The idea, in one sentence:** the Dirgesinger sings an enemy's funeral while
it is still standing, and sings it so well that the enemy's own shadow
believes it — the shadow lies down in the grave dug for it, and on the last
note the earth closes over the shadow and leaves the enemy on its feet with
nothing under it.

Only the Dirgesinger could have it. The Herald's title is *You are worth more
than you think*: it is the one who tells people what they are worth. The
Dirgesinger says it in the past tense. The path's title is the plot, *A funeral
song, sung early*, and its kit is **Dirge**, the song that takes a row's
afflictions away and turns the grief into resolve. The drawing supplies the
rite. A standard-bearer's salute to the dead is the colours dipped, and the
Herald's banner dips; its flag is lilac, which is the colour of half-mourning;
and its laurel, a victory crown, is what is laid on a grave — one leaf of it
falls in the close-up and is on the grave in the quiet. The song itself is
never drawn: it is seen in what it does to the one it is for, a shadow lying
down note by note.

## Gameplay purpose

`ultimate-defs/hrl-dirgesinger.ts`, target an enemy, cost 100, speed 22:

| | Anthem of the Unpaid (base) | Into the Din (Warcaller) | **Elegy for the Standing** (Dirgesinger) |
| --- | --- | --- | --- |
| Aimed at | self: the party | an enemy, struck | **an enemy, mourned** |
| The enemy | nothing | 24, Vulnerable 2 rounds | **12 through armour; Vulnerable 3 rounds; Weak 2 rounds** |
| The party | Empowered 2 rounds, 8 Barrier, Weak and Vulnerable cleared | Weak cleared, Empowered this round | **nothing to swing with**: Burn, Poison, Weak and Vulnerable cleared, the downed included |
| The Herald | — | Empowered 3 rounds, +2 Verse | +2 Verse |
| Order | speed 18 | speed 16 | **speed 22: sung early**, before every other Ultimate that round |

It differs in what it does, not only in numbers. Both Herald Ultimates so far
make the party stronger. This one makes the *enemy* the thing the party is
stronger against: the Herald's "your blows land harder" is moved off the
singers and onto the one being sung for, for three rounds (a round longer than
any other Vulnerable in the game), and its blows on the party land a third
softer for two. The party itself gets only the Dirge: every affliction the
dungeon put on it is buried in the same grave.

Team play: at speed 22 it resolves before any other Ultimate queued that round,
so an ally's Ultimate that same round lands on a Vulnerable target (Red
Ledger's 40, Gatebreaker, Debt of Thunder's bolt); every Exploit and Chain
Shock on the mourned for three rounds is a quarter heavier; and Weak on a boss
takes its windup down by a third in the round a Vanguard has to catch it.

### Balance

`scripts/ultimate-report.ts 4 --sample=6` (324 runs), same machine, with this
path's stub still `null` (the Dirgesinger on the Anthem) and then with Elegy
for the Standing: see the table filled in below.

## Space, palette, sound

- **Space: the burying ground, dug the night before.** A slope of raw clay
  under a flat, sunless white sky: rows of fresh graves dug and waiting, open
  pits with their spoil heaped beside them, no stones and no names yet; a line
  of black cypresses along the top of the slope; a spade left standing in a
  heap. Nothing in it casts a shadow, because nothing lights it — except the
  one the song is for. Not a hall, forge, storm, wood, ridge, causeway, field
  between the lines, the ground under the floor, a pit, a vault, mirrors, a
  mere, a labyrinth, a theatre, a page, a spillway, a snowfield, a moth garden
  or a hound run.
- **Palette: mourning's three grades, and earth.** Full mourning black (the
  shadow, `#0d0b12`), grey (the pewter sky, `#d6d7d0` to `#7e8288`), and the
  lilac of half-mourning (`#c6b4e8`, the accent), which is the Herald's own
  flag. The earth is raw clay, umber to near black. No gold and no rose: the
  Herald's warm colours are what it gives up to sing this.
- **Signature effect — the shadow laid down.** The target's shadow is its own
  drawing, copied off the stage and filled with mourning black, joined to its
  feet. It stands up behind the target when the song starts, and each note of
  the motif lays it further down, like something felled, until it lies full
  length in the open grave. On the last note the heaped earth on both sides is
  thrown in over it in one heave and it is gone. Everywhere after, the target
  stands on a filled grave and casts nothing.
- **The impact frame — the negative.** At the last note the frame goes to
  mourning black and only the shadow and the enemy it belongs to are drawn,
  in bone, as one shape joined at the feet, with the Herald's banner a black
  stake at its head. Then colour, and the earth comes down.
- **Motif (original):** a single voice on a closed "oo", falling — E4, D4, C4 —
  over a low drone, and the last note A3 sung full with the earth landing on
  it. Not the Anthem's horn and answer (A3, E4, F♯4, D chord) and not the
  Din's drum and bell (D3, D3, F3, C4).
- **Signature sound:** earth thrown into a grave — a spadeful of clay landing
  on wood, heavy, granular, with the dull knock under it.
- **The impact, layered:** the sod breaking (transient), a sub drop, the last
  note sung on an A minor chord with the thud of the whole heap landing (body),
  and soil trickling in after it with a long grey air (tail).
- **The quiet:** music ducked to 3%, and nothing but a little earth running off
  the lip of the grave, grain by grain.

## Rhythm

identity (the Herald's open face closes over the song: brows lift at the
middle, eyes shut, mouth rounds on the note; a leaf of the laurel comes loose)
→ stakes (the burying ground: the Herald and the real party standing at a
graveside, heads bowed, for the real enemy across the grave, which is still
alive and looking at them; its shadow stands up and lies down note by note;
title) → **quiet** (at the head of the grave, on the ground: the shadow laid
out full length towards the lens with the laurel leaf on it, the enemy tiny
and upright at its feet against the white sky; nothing moves) → **impact**
(the negative frame; the banner driven into the ground at the shadow's head as
a stake; the earth heaved in over the whole length of it; the enemy dragged
down by its feet) → release (the real board: the enemy standing on a fresh
grave, a laurel leaf settling on every ally).

The quietest shot sits directly before the loudest.

## Shots — FULL 4100ms, FAST 2580ms (63%)

| # | Shot | ms (FAST) | Camera | Pose | Background / light | VFX | Audio | Target | Transition in | Purpose |
|---|---|---|---|---|---|---|---|---|---|---|
| 0 | Call | 420 (240) | battle camera | real Herald `ult:elegy-dip` — the head bows, the banner dips forward and down | real battlefield sinks to pewter grey, bars close | lilac call aura; **the real target's shadow stands up behind it on the board** (`elegy-board` rise) | a low hummed note; music ducks | on board | — | break the round: someone has started a funeral |
| 1 | Sung · face close-up | 660 (400) | tight on the face in profile, laurel in frame, drifting down with the bow | `ult:elegy-sing` (`root: false`) — the earnest face closes over the song: brows lift at the inner ends, eyes shut, the mouth rounds on "oo"; the head bows, then lifts on the note | the burying ground, low; white sky behind the head, lilac rim | **a laurel leaf comes loose from the circlet and falls turning past the face** (`elegy-leaf`) | motif, first notes (E4, D4) on the voice | no | black 80ms | identity: the face that tells you your worth, singing it in the past tense |
| 2 | Graveside · wide | 920 (520) | wide across an open grave, slow push | Herald at the left, `ult:elegy-mourn`, banner dipped, singing; the real party behind it `ult:elegy-bow`, heads bowed | the burying ground: white sky, cypresses, rows of open graves | **the target's shadow, copied off its figure, stands up behind it and is laid down note by note along the grave** (`elegy-shadow` lay) | motif (D4, C4), drone | **yes** — `anticipate` as its shadow goes down | cut | stakes: who is mourning, and who for; title |
| 3 | Laid out · the quiet | 600 (380) | on the ground at the head of the grave, dead still | Herald out of frame | exposure 0.34 → 0.16, heavy vignette, the white sky behind the enemy | **the shadow laid full length towards the lens in the grave**, the laurel leaf on its chest; the enemy standing tiny at its feet, silhouetted | music ducked to 3%; earth trickling off the lip | **yes**, far off, still | cut | anticipation by stillness |
| 4 | Buried · impact | 780 (560) | low profile along the grave, Dutch −6° → −2°, easing out | Herald `ult:elegy-close` (contact 0.3) — the last note sung up at the sky, the banner driven point first into the ground at the shadow's head; target `hurt` after the stop, dragged down and tilted | exposure blown, falling to 0.6 | **the negative (70ms)**: black frame, shadow and enemy in bone as one shape; stop; **the earth thrown in over the shadow in one heave** from the stake to the enemy's feet, clods over the enemy (`elegy-bury`) | layered impact: sod, sub, the last note A3 on a chord, earth landing, trickle; 150ms stop; heavy shake | **yes** | cut on the negative | impact: damage, Vulnerable and Weak on the frame; "Lie down. The song's over." |
| 5 | Mourned · return | 720 (480) | battle camera | real Herald `ult:elegy-rest` — the banner lifted out of the earth, head up | real battlefield; bars open | **a fresh grave under the real target, its shadow sunk in it** (`elegy-board` grave); **a laurel leaf settling on every real ally** in turn (`elegy-board` laurel) | the motif's last note hummed, earth settling, tail | on board | flash 80ms | release: who is mourned, and a party with its griefs laid down |

## Framing

To be filled in from the lab.

## FAST

Keeps all six shots, shorter; the quiet and the impact keep their shape.

## Voice

"This one's for you. Sorry it's early." · "Lie down. The song's over." · "We've
done our grieving. Now finish it."
