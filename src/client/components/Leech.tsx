import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-debt.css";

/**
 * The Coin Leech.
 *
 * It does not fight so much as feed: it latches on, and the pact's gold goes
 * down it. So it is a leech, and drawn as something that hunts rather than
 * something that sways — a thick, bruise-dark body wound into a tight coil,
 * the neck hauled up and back into a high arch, and the head hung low and
 * forward at the end of it with the mouth already open: a lamprey's disc of
 * a sucker, red inside, ringed with hooked teeth, a coin showing in the
 * throat. The belly is translucent, and everything it has swallowed shows
 * through it as coins.
 *
 * Silhouette: a coil on the ground, a column leaning back off it, an arch
 * going over the top, and a flared disc hanging down at the front aimed at
 * the party — a cocked spring. The back of the arch is knobbed with papillae
 * so the outline is rough rather than smooth. Nothing else in the game is
 * serpentine, and nothing else stands on a spiral.
 *
 * Its idle is a strike held back: the arch breathes, the head hangs and
 * tracks, the tail tip twitches.
 */
const PARTS = ["tail", "lower", "belly", "upper", "head"] as const;

/** Bumps along the back of the arch: the rough skin that breaks the outline. */
const PAPILLAE: [number, number, number][] = [
  [79.6, 42, 1.7],
  [79.4, 34.6, 1.9],
  [77, 27.6, 1.9],
  [72.4, 21.6, 1.9],
  [66, 17.6, 1.8],
  [58.6, 16, 1.8],
  [51.2, 17.4, 1.6],
  [43.8, 21.6, 1.5],
  [37.8, 27.8, 1.3],
];

/** Where the lip hooks sit, in degrees round the sucker: the leading half. */
const FANGS = [120, 148, 176, 204, 232];

export function Leech({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);

  // The sucker: a flared disc facing down and forward at the party.
  const MOUTH = { cx: 18.6, cy: 56, rx: 7.8, ry: 13.4, tilt: 36 };
  const rim = (a: number, r: number): [number, number] => [
    Math.cos(a) * MOUTH.rx * r,
    Math.sin(a) * MOUTH.ry * r,
  ];
  const tooth = (
    i: number,
    n: number,
    outer: number,
    inner: number,
    w: number,
  ) => {
    const a = (i / n) * Math.PI * 2 + (n % 2 ? 0.2 : 0);
    const [x1, y1] = rim(a - w, outer);
    const [x2, y2] = rim(a + w, outer);
    const [x3, y3] = rim(a, inner);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)} L${x3.toFixed(2)} ${y3.toFixed(2)} Z`;
  };

  // Hooks on the lip, raked forward at whatever it is facing.
  const fang = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    const [x1, y1] = rim(a - 0.14, 1.02);
    const [x2, y2] = rim(a + 0.14, 1.02);
    const [x3, y3] = rim(a, 1.46);
    return `M${x1.toFixed(2)} ${y1.toFixed(2)} L${(x3 - 2.2).toFixed(2)} ${y3.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
  };

  return (
    <svg
      className={`leech ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Coin Leech"
    >
      <defs>
        <linearGradient id="lch-hide" x1="0" y1="0" x2="1" y2="0.5">
          <stop offset="0" stopColor="#7c3a42" />
          <stop offset="0.45" stopColor="#482029" />
          <stop offset="1" stopColor="#221019" />
        </linearGradient>
        <linearGradient id="lch-belly" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d6c087" stopOpacity="0.92" />
          <stop offset="1" stopColor="#8c6a44" stopOpacity="0.92" />
        </linearGradient>
        <linearGradient id="lch-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d888" />
          <stop offset="1" stopColor="#a8762c" />
        </linearGradient>
        <radialGradient id="lch-maw" cx="0.55" cy="0.5">
          <stop offset="0" stopColor="#0e0306" />
          <stop offset="0.7" stopColor="#3a0c14" />
          <stop offset="1" stopColor="#6e1822" />
        </radialGradient>
      </defs>

      {/* ---- tail: the coil it is wound into, the tip whipping behind ---- */}
      <g
        ref={hold("tail")}
        data-part="tail"
        style={{ transformOrigin: "66px 88px" }}
      >
        <path
          d="M89 88 C95 85 97.6 78 96.6 70.4 C96.4 68 98.6 67.4 99.4 69.6 C101 79 98 88.4 90.6 92.6 Z"
          fill="url(#lch-hide)"
          stroke="#171420"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path
          d="M42 90 C42 80.6 57 76.4 72 77.4 C86 78.4 95 83.4 93 90 C91 96.4 72 98.4 57 97.4 C47 96.8 42 94.4 42 90 Z"
          fill="url(#lch-hide)"
          stroke="#171420"
          strokeWidth="2.4"
        />
        {/* The crease where one turn of the coil lies on the next */}
        <path
          d="M47.6 92.4 C49 86.4 62 83.2 75 84 C84.4 84.6 89 87.4 87.4 91"
          fill="none"
          stroke="#171420"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path className="lch-sheen" d="M52 81.6 C60 79 72 78.8 82 81.4" />
        <g stroke="#0e070b" strokeWidth="1" fill="none">
          <path d="M54 85.6 C53 89 53.4 93 55 96.6" />
          <path d="M63 84.2 C62 88 62 92.6 63.4 97.2" />
          <path d="M72 84.2 C71 88 71 92.6 72.4 97" />
          <path d="M80.6 85 C80 88.4 80 92 81.4 95.6" />
        </g>
      </g>

      {/* ---- lower body: rising out of the coil and leaning back ---- */}
      <g
        ref={hold("lower")}
        data-part="lower"
        style={{ transformOrigin: "62px 86px" }}
      >
        <path
          d="M50 88 C48 76 52 63 60 53 C64 47.6 71.6 43.6 77.6 45 C82.4 46.6 82.4 53 80.6 59 C78.4 67 76.4 77 76.6 88 Z"
          fill="url(#lch-hide)"
          stroke="#171420"
          strokeWidth="2.4"
        />
        <path className="lch-sheen" d="M74.4 50.6 C77.4 56 76.6 68 75 80" />
        {/* Rings */}
        <g stroke="#0e070b" strokeWidth="1.1" fill="none">
          <path d="M57 58 Q67 61.4 79.4 56" />
          <path d="M53.4 65.6 Q66 69.4 78.4 63.6" />
          <path d="M51.4 73 Q64 76.6 77.4 71.4" />
          <path d="M50.4 80.6 Q63 84 76.8 79" />
        </g>
        {/* The rust stripe down its back, spotted black */}
        <path className="lch-stripe" d="M79 51 C79.6 60 77 70 76.4 84" />
        {[
          [79, 55.6],
          [78, 64],
          [77, 72.6],
          [76.6, 80.6],
        ].map(([x, y]) => (
          <circle key={y} cx={x} cy={y} r="0.9" fill="#0e070b" />
        ))}
      </g>

      {/* ---- belly: translucent, full of what it has swallowed ---- */}
      <g
        ref={hold("belly")}
        data-part="belly"
        style={{ transformOrigin: "56px 72px" }}
      >
        <path
          d="M58.4 54 C50 60 45.4 70 47.4 80.4 C48.4 84.4 51.4 87 55.6 87 C57 78 58 66 62 56 Z"
          fill="url(#lch-belly)"
          stroke="#171420"
          strokeWidth="1.8"
        />
        {/* Veins over the coins */}
        <path
          d="M56 58 C53 64 52.4 70 54 76 M51 70 C50 76 51 81 53.6 85"
          stroke="#7a3a2c"
          strokeWidth="0.7"
          fill="none"
          opacity="0.8"
        />
        {[
          [53, 66, -20],
          [50.6, 74, 10],
          [53.6, 81, -6],
          [56, 61, 24],
        ].map(([x, y, a]) => (
          <ellipse
            key={y}
            className="lch-coin"
            cx={x}
            cy={y}
            rx="3"
            ry="1.5"
            transform={`rotate(${a} ${x} ${y})`}
          />
        ))}
      </g>

      {/* ---- upper body: the neck hauled up into an arch, and over ---- */}
      <g
        ref={hold("upper")}
        data-part="upper"
        style={{ transformOrigin: "72px 50px" }}
      >
        {PAPILLAE.map(([x, y, r]) => (
          <circle
            key={`${x}`}
            cx={x}
            cy={y}
            r={r}
            fill="#5a2a32"
            stroke="#171420"
            strokeWidth="1.4"
          />
        ))}
        <path
          d="M66 55 C70 43 67.4 32 60 29.6 C52.6 27.6 45.4 33 41 45 L32 41.4 C35.4 24 49 14.6 63 17.4 C76 20 84 34 80.6 55 Z"
          fill="url(#lch-hide)"
          stroke="#171420"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <path className="lch-sheen" d="M42 27.6 C48 21.6 57 19 65 20.6" />
        {/* The rust stripe runs on over the top of the arch */}
        <path className="lch-stripe" d="M78.6 50 C80 38 74 25 62 21.6" />
        <g stroke="#0e070b" strokeWidth="1.1" fill="none">
          <path d="M76 30 Q70 32 67 38" />
          <path d="M67.4 20.6 Q63 25 62 29.6" />
          <path d="M55 18.4 Q54 24 54.4 28.6" />
          <path d="M45 23 Q47 28 48.4 31.6" />
          <path d="M80 44 Q74 44 69.6 46" />
          <path d="M36.4 33.6 Q40 36 42.6 39.4" />
        </g>
      </g>

      {/* ---- head: hung low and forward, the mouth already open ---- */}
      <g
        ref={hold("head")}
        data-part="head"
        style={{ transformOrigin: "36px 44px" }}
      >
        {/* The head behind the disc, narrowing into the neck */}
        <path
          d="M43 42.4 C40.6 37.8 34 37.6 29 41.6 C25 45 22.6 51 23.4 57.6 C24.4 62.6 29 63.6 33.6 59.6 C38.6 55.4 44.6 47.6 43 42.4 Z"
          fill="url(#lch-hide)"
          stroke="#171420"
          strokeWidth="2.2"
        />
        <path className="lch-sheen" d="M30 42 C33.6 39.4 37.6 39 41 40.2" />
        {/* A row of eye-spots along the top: it can see you, a little */}
        {[
          [30.6, 42.2],
          [33.8, 40.4],
          [37.2, 39.8],
          [40.4, 40.6],
          [42.2, 43],
        ].map(([x, y]) => (
          <circle key={`${x}`} className="lch-eye" cx={x} cy={y} r="1.25" />
        ))}
        {/* The sucker: a thick lip ring with hooks set round its leading
            edge, two rows of teeth inside, a gullet */}
        <g
          transform={`translate(${MOUTH.cx} ${MOUTH.cy}) rotate(${MOUTH.tilt})`}
        >
          <g fill="#e8dcc0" stroke="#171420" strokeWidth="1">
            {FANGS.map((a) => (
              <path key={a} d={fang(a)} />
            ))}
          </g>
          <ellipse
            rx={MOUTH.rx * 1.12}
            ry={MOUTH.ry * 1.08}
            fill="#8e2e3a"
            stroke="#171420"
            strokeWidth="2"
          />
          <ellipse
            rx={MOUTH.rx * 0.84}
            ry={MOUTH.ry * 0.84}
            fill="url(#lch-maw)"
          />
          <g fill="#e8dcc0" stroke="#171420" strokeWidth="0.5">
            {Array.from({ length: 12 }, (_, i) => (
              <path key={i} d={tooth(i, 12, 0.86, 0.5, 0.15)} />
            ))}
          </g>
          <g fill="#f0c35a" stroke="#171420" strokeWidth="0.4">
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={tooth(i, 9, 0.5, 0.24, 0.2)} />
            ))}
          </g>
          {/* A coin on its way down */}
          <ellipse className="lch-throat" cx="0.6" rx="1.3" ry="3" />
        </g>
      </g>
    </svg>
  );
}
