import type { Cinematic, VfxCue } from "../../shared/cinematic";

/**
 * HAMMER PRICE — the Broker · Magnate's Ultimate.
 *
 * The idea, in one sentence: the Magnate buys the enemy at an auction in a
 * dark saleroom where every rival paddle is a light, and every rival it
 * outbids goes out and adds its weight to the Magnate's hammer — so when the
 * room is dark and the hammer comes down, the hammer price falls on the lot.
 *
 * Only the Magnate could have it: its Hostile bid is the one Broker ability
 * that pays gold to hit, so it is the one Broker that buys, and an auction is
 * the one place where buying is a fight. The drawing supplies the bidder — a
 * bid is a nod, and the Broker's face is a cap, spectacles and a pleased
 * mouth — and the balance is gone from its fist: the Magnate does not weigh.
 *
 * Rhythm: identity (the nod, and the nearest paddles going out behind it) →
 * stakes and escalation (the saleroom outbid row by row, the room going dark,
 * the hammer swelling; the real target on the sale block; title) →
 * anticipation (going twice: the hammer hoisted over the lot, which cowers) →
 * the quiet (the last paddle, shaking in a gloved hand, and going down; music
 * to 4%) → impact (gone: the hammer on the lot, the knock stamped round it,
 * the block split; Tyrian-and-ink frame) → release (on the real board, the
 * split block under the target and a paddle laid down at every other enemy).
 *
 * Gameplay it shows, each where it happens: the WINDUP bought and 36 through
 * armour (the hammer, and the damage on the held frame), Vulnerable (the
 * block left split under the real target), every other enemy Weak (a paddle
 * lowered at each of them on the board). The gold spent has no beat: the
 * room going dark is the price being paid.
 *
 * It shares nothing with Foreclosure, Compound Interest or The Small Print:
 * no coin, no balance, no ledger blow, no copper, no paper, no brass, no
 * counting house, sink or page. Storyboard: `docs/ultimates/hammer-price.md`.
 */

const TYRIAN = "#e05bd8";
const HOT = "#ffd6f6";
const LACQUER = "#0b0709";
const BARS = 0.1;
const ROOM = "hammer-saleroom";
/**
 * The knock, as a fraction of the impact shot: 128ms into it, 3ms after the
 * hammer's contact 125ms into `ult:hammer-knock`. The impact shot is the same
 * length in FULL and FAST, because the swing plays at one rate in both and a
 * hit-stop that fell before the head arrived would hold the hammer in the air.
 */
const IMPACT_MS = 760;
const HIT = 128 / IMPACT_MS;

/**
 * The blow's effects, placed for the lot's size: the lot pressed down (`down`,
 * `wide`), the swing's arc, the light behind the lot, the block split under
 * it, the knock where the head's face meets it (`ox`, `oy`, in the lot's drawn
 * heights from its feet) and the splinters.
 */
function blow(o: { ox: number; oy: number; size: number; down: number; wide: number; block: number; splinters: number }): VfxCue[] {
  return [
    { kind: "hammer-crush", at: 0, until: 1, layer: "back", params: { hit: HIT, down: o.down, wide: o.wide } },
    { kind: "hammer-glow", at: 0, until: 1, follow: "target", layer: "back" },
    { kind: "hammer-smear", at: 0, until: 0.6, layer: "back", params: { a0: -40, a1: 118, r: 61, from: 55, hit: 125 } },
    { kind: "hammer-block", at: 0, until: 1, follow: "target", layer: "back", params: { mode: "split", hit: HIT, w: o.block } },
    { kind: "hammer-knock", at: HIT, until: 0.75, follow: "target", layer: "back", params: { half: "back", ox: o.ox, oy: o.oy, size: o.size } },
    { kind: "hammer-knock", at: HIT, until: 0.75, follow: "target", layer: "front", params: { half: "front", ox: o.ox, oy: o.oy, size: o.size } },
    { kind: "hammer-splinters", at: HIT, until: 0.85, follow: "target", layer: "front", params: { count: o.splinters } },
  ];
}

export const hammerPrice: Cinematic = {
  id: "hammer-price",
  heroId: "broker",
  motif: "hammer-motif",
  shots: [
    /* 0 · CALL — the target is a lot. */
    {
      id: "call",
      kind: "call",
      purpose: "The round stops: the battlefield sinks to lacquer black, the Broker touches its cap, and the target stands on a sale block.",
      space: "battlefield",
      ms: 400,
      fastMs: 240,
      background: "battlefield",
      lighting: { tint: [LACQUER, 0], letterbox: 0 },
      toLighting: { tint: [LACQUER, 0.55], letterbox: BARS },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:hammer-call" }],
      vfx: [
        { kind: "hammer-block", at: 0.2, until: 1, anchor: "targets", layer: "back", params: { mode: "call", w: 0.5, uw: 0.55 } },
        { kind: "call-aura", at: 0, until: 1, anchor: "caster", color: TYRIAN },
      ],
      sound: [
        { at: 0, sfx: "ult-call" },
        { at: 0.42, sfx: "hammer-rap" },
      ],
      duck: [{ at: 0, level: 0.3, ms: 4800 }],
      markers: [{ at: 0, label: "called" }],
    },

    /* 1 · THE NOD — face close-up. */
    {
      id: "nod",
      kind: "face-close-up",
      purpose:
        "Identity. Face and sale hammer, the balance gone from the fist: the eyes open to the lot, the brows come up a hair, and the Magnate bids the way the rich bid — one slow nod. Behind it, the nearest paddles in the room go out.",
      space: "cinematic",
      ms: 620,
      fastMs: 400,
      transition: { kind: "black", ms: 60 },
      camera: {
        from: { x: 830, y: 610, zoom: 1.95, rotate: -6 },
        to: { x: 836, y: 614, zoom: 2.08, rotate: -3 },
        ease: "out",
      },
      background: ROOM,
      lighting: { exposure: 0.5, rim: [TYRIAN, 0.4, 1], vignette: 0.66, letterbox: BARS },
      toLighting: { exposure: 0.42, rim: [TYRIAN, 0.5, 1], vignette: 0.66, letterbox: BARS },
      actors: [
        { role: "caster", at: [640, 1330], size: 1100, clip: "ult:hammer-nod", then: "ult:hammer-nod", look: "lit", rim: TYRIAN, root: false },
      ],
      vfx: [{ kind: "hammer-paddles", at: 0, until: 1, layer: "back", params: { keys: "0:0 0.46:0 0.7:0.1", soft: 1 } }],
      // The tock lands on the nod, 294ms into the clip, which plays at one rate in both cuts.
      sound: [
        { at: 0.087, sfx: "hammer-nod", mode: "full" },
        { at: 0.135, sfx: "hammer-nod", mode: "fast" },
      ],
      text: [{ kind: "voice", at: 0.12, until: 1, text: "$voice.activation" }],
      markers: [{ at: 0.46, label: "nod" }],
    },

    /* 2 · THE ROOM — wide. */
    {
      id: "room",
      kind: "wide-hero",
      purpose:
        "Stakes and escalation. The saleroom, lit only by rival paddles; the real target stands on the sale block. In three waves every rival is outbid and its paddle goes out, the room darkening, and with each wave the hammer's head swells: the price, as weight. The lot looks round and braces. Title.",
      space: "cinematic",
      ms: 1000,
      fastMs: 520,
      transition: { kind: "whip", ms: 110, dir: 1 },
      camera: {
        from: { x: 790, y: 540, zoom: 1.06 },
        to: { x: 810, y: 520, zoom: 1.12 },
        ease: "inOut",
      },
      background: ROOM,
      lighting: { exposure: 0.9, rim: [TYRIAN, 0.7, 1], vignette: 0.4, letterbox: BARS },
      toLighting: { exposure: 0.45, rim: [TYRIAN, 0.85, 1], vignette: 0.62, letterbox: BARS },
      actors: [
        { role: "target", at: [1150, 850], size: 250, face: -1, z: 1, react: [{ at: 0.5, clip: "anticipate", then: "idle" }] },
        { role: "caster", at: [330, 880], size: 600, clip: "ult:hammer-outbid", look: "rim", rim: TYRIAN, z: 3 },
      ],
      vfx: [
        { kind: "hammer-paddles", at: 0, until: 1, layer: "back", params: { keys: "0:0.07 0.18:0.07 0.3:0.33 0.43:0.33 0.55:0.64 0.68:0.64 0.8:0.93 1:0.95" } },
        { kind: "hammer-block", at: 0, until: 1, follow: "target", layer: "back", params: { mode: "stand", w: 0.72 } },
      ],
      sound: [
        { at: 0.1, sfx: "hammer-motif" },
        { at: 0.18, sfx: "hammer-slaps", mode: "full" },
        { at: 0.18, sfx: "hammer-slaps-fast", mode: "fast" },
      ],
      text: [
        { kind: "name", at: 0.42, until: 1, text: "$name", x: 0.5, y: 0.2 },
        { kind: "epithet", at: 0.5, until: 1, text: "$epithet", x: 0.5, y: 0.29 },
      ],
      markers: [{ at: 0.42, label: "title" }],
    },

    /* 3 · GOING TWICE — low angle. */
    {
      id: "hoist",
      kind: "dutch",
      purpose:
        "Anticipation: going twice. On a Dutch angle the hammer is hoisted straight up at its full price, the round body leaning back under it, the brows down on the rims; the lot in the foreground cowers. The last few paddles at the back of the room go out.",
      space: "cinematic",
      ms: 540,
      fastMs: 340,
      transition: { kind: "cut" },
      camera: {
        from: { x: 760, y: 520, zoom: 1.2, rotate: 7 },
        to: { x: 764, y: 512, zoom: 1.28, rotate: 10 },
        ease: "out",
      },
      background: ROOM,
      lighting: { exposure: 0.4, rim: [TYRIAN, 0.9, 1], vignette: 0.7, letterbox: BARS },
      toLighting: { exposure: 0.3, rim: [HOT, 1, 1], vignette: 0.78, letterbox: BARS },
      actors: [
        { role: "caster", at: [560, 1000], size: 700, clip: "ult:hammer-hoist", then: "ult:hammer-hoist", look: "rim", rim: TYRIAN, z: 3 },
        { role: "target", at: [1150, 900], size: 480, face: -1, z: 5, look: "rim", rim: TYRIAN, react: [{ at: 0.3, clip: "block", then: "block" }] },
      ],
      vfx: [{ kind: "hammer-paddles", at: 0, until: 1, layer: "back", params: { keys: "0:0.95 0.6:0.99" } }],
      sound: [{ at: 0, sfx: "hammer-hoist" }],
      markers: [{ at: 0.35, label: "hoisted" }],
      framing: {
        large: {
          actors: [
            { role: "caster", at: [560, 1000], size: 700, clip: "ult:hammer-hoist", then: "ult:hammer-hoist", look: "rim", rim: TYRIAN, z: 3 },
            { role: "target", at: [1180, 830], size: 360, face: -1, z: 5, look: "rim", rim: TYRIAN, react: [{ at: 0.3, clip: "block", then: "block" }] },
          ],
        },
        boss: {
          camera: {
            from: { x: 780, y: 500, zoom: 1.12, rotate: 7 },
            to: { x: 784, y: 492, zoom: 1.18, rotate: 10 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [540, 1000], size: 700, clip: "ult:hammer-hoist", then: "ult:hammer-hoist", look: "rim", rim: TYRIAN, z: 3 },
            { role: "target", at: [1240, 920], size: 290, face: -1, z: 5, look: "rim", rim: TYRIAN, react: [{ at: 0.3, clip: "block", then: "block" }] },
          ],
        },
      },
    },

    /* 4 · THE LAST PADDLE — the quiet. */
    {
      id: "last",
      kind: "extreme-close-up",
      purpose:
        "The quiet. One paddle left up in the black, in a gloved hand that cannot hold it still, its light the only light in the room; the music gone. Then the hand gives and it goes down out of the frame. Nobody else.",
      space: "cinematic",
      ms: 560,
      fastMs: 380,
      transition: { kind: "cut" },
      camera: { from: { x: 800, y: 450, zoom: 1.35 }, to: { x: 800, y: 452, zoom: 1.38 }, ease: "linear" },
      background: ROOM,
      lighting: { exposure: 0.2, vignette: 0.9, letterbox: 0.13 },
      toLighting: { exposure: 0.08, vignette: 0.94, letterbox: 0.14 },
      vfx: [{ kind: "hammer-last", at: 0, until: 1, x: 800, y: 500, layer: "front", params: { give: 0.56 } }],
      duck: [{ at: 0, level: 0.04, ms: 620 }],
      sound: [
        { at: 0.06, sfx: "hammer-tremble" },
        { at: 0.34, sfx: "hammer-tremble", mode: "full" },
      ],
      markers: [{ at: 0.56, label: "it gives" }],
    },

    /* 5 · GONE — impact. */
    {
      id: "gone",
      kind: "impact",
      purpose:
        "Impact: gone. The hammer comes over the cap and down on the lot with the whole body behind it; on a Tyrian-and-ink frame the knock is stamped round the head, the split runs down through the lot and the sale block breaks under it. The damage lands on the held frame. Sold.",
      space: "cinematic",
      ms: IMPACT_MS,
      fastMs: IMPACT_MS,
      transition: { kind: "cut" },
      camera: {
        from: { x: 820, y: 720, zoom: 1.12, rotate: -5 },
        to: { x: 820, y: 730, zoom: 1.05, rotate: -2 },
        ease: "out",
      },
      background: ROOM,
      lighting: { exposure: 1, tint: [TYRIAN, 0.28], back: [TYRIAN, 0.9], rim: [HOT, 1, 1], vignette: 0.32, letterbox: BARS },
      toLighting: { exposure: 0.6, tint: [TYRIAN, 0], back: [TYRIAN, 0.26], rim: [TYRIAN, 0.7, 1], vignette: 0.44, letterbox: BARS },
      actors: [
        { role: "caster", at: [520, 980], size: 700, clip: "ult:hammer-knock", then: "ult:hammer-knock", look: "rim", rim: TYRIAN, z: 3 },
        { role: "target", at: [920, 1060], size: 330, face: -1, z: 1, react: [{ at: HIT, clip: "hurt" }], shove: { at: HIT, by: [14, 10] }, toTilt: 4 },
      ],
      vfx: blow({ ox: 0.1, oy: -0.64, size: 0.6, down: 0.3, wide: 0.22, block: 0.72, splinters: 24 }),
      screen: [{ kind: "two-tone", at: HIT, ms: 70 }],
      stop: [{ at: HIT, ms: 150 }],
      sound: [
        { at: 0.09, sfx: "hammer-swing" },
        { at: HIT - 0.004, sfx: "hammer-impact" },
      ],
      shake: [
        { at: HIT, amount: 0.034 },
        { at: 0.4, amount: 0.011 },
      ],
      reveal: [{ at: HIT, reveal: "impact" }],
      text: [
        { kind: "impact", at: HIT + 0.01, until: 0.9, text: "$damage", x: 0.66, y: 0.2, rotate: 5 },
        { kind: "voice", at: 0.36, until: 1, text: "$voice.impact" },
      ],
      markers: [{ at: HIT, label: "sold" }],
      framing: {
        large: {
          camera: {
            from: { x: 820, y: 730, zoom: 1.08, rotate: -5 },
            to: { x: 820, y: 740, zoom: 1.02, rotate: -2 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [520, 980], size: 700, clip: "ult:hammer-knock", then: "ult:hammer-knock", look: "rim", rim: TYRIAN, z: 3 },
            { role: "target", at: [930, 1080], size: 300, face: -1, z: 1, react: [{ at: HIT, clip: "hurt" }], shove: { at: HIT, by: [22, 8] }, toTilt: 4 },
          ],
          vfx: blow({ ox: 0, oy: -0.6, size: 0.55, down: 0.16, wide: 0.1, block: 0.66, splinters: 26 }),
        },
        boss: {
          camera: {
            from: { x: 820, y: 750, zoom: 1.0, rotate: -4 },
            to: { x: 820, y: 760, zoom: 0.95, rotate: -1.5 },
            ease: "out",
          },
          actors: [
            { role: "caster", at: [500, 980], size: 700, clip: "ult:hammer-knock", then: "ult:hammer-knock", look: "rim", rim: TYRIAN, z: 3 },
            { role: "target", at: [990, 1080], size: 300, face: -1, z: 1, react: [{ at: HIT, clip: "hurt" }], shove: { at: HIT, by: [48, 6] }, toTilt: 4 },
          ],
          vfx: blow({ ox: -0.2, oy: -0.4, size: 0.45, down: 0.1, wide: 0.07, block: 0.55, splinters: 30 }),
        },
      },
    },

    /* 6 · KNOCKED DOWN — return. */
    {
      id: "knocked-down",
      kind: "return",
      purpose:
        "Release, over the real battlefield: the split sale block under the real target, which stays open (Vulnerable), and over every other real enemy a paddle held up and laid down at its feet (outbid: Weak this round). The Broker dusts its palms and tips its cap.",
      space: "battlefield",
      ms: 820,
      fastMs: 520,
      transition: { kind: "flash", ms: 70 },
      background: "battlefield",
      lighting: { tint: [LACQUER, 0.42], letterbox: BARS },
      toLighting: { tint: [LACQUER, 0], letterbox: 0 },
      actors: [{ role: "caster", at: [0, 0], size: 0, clip: "ult:hammer-settle" }],
      vfx: [
        { kind: "hammer-block", at: 0, until: 1, anchor: "targets", params: { mode: "board", w: 0.5, uw: 0.55 } },
        { kind: "hammer-outbid", at: 0, until: 1, layer: "screen" },
      ],
      sound: [
        { at: 0.2, sfx: "hammer-down" },
        { at: 0.62, sfx: "ult-tail" },
      ],
      reveal: [{ at: 0.58, reveal: "all" }],
      text: [{ kind: "voice", at: 0.14, until: 1, text: "$voice.after" }],
      markers: [{ at: 0.3, label: "outbid" }],
    },
  ],
};
