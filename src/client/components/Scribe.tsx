import { useRigParts, type CreatureProps } from "../battle/useRigParts";
import "../creatures-clerks.css";

/**
 * The Seal Scribe.
 *
 * A clerk that has spent its life bent over a page, and the shape says so: a
 * stooped ash-grey bell of a robe with the hump of its back high on the far
 * side and everything it owns hanging off the near one. The heavy brass stamp
 * is held low on the party's side, already down near the work, so the rig's
 * raise-and-slam has somewhere to fall from.
 *
 * Riding its back is the bundle of unsigned deeds — a fan of loose sheets
 * strapped on with a ribbon and sealed shut, deliberately not the Notary's
 * neat column of bound ledgers. A lantern on a hook over the near shoulder is
 * the only light in the drawing: it lays a cold wash on the one thing turned
 * towards the party, the face under the eyeshade.
 *
 * Silhouette: a low forward-leaning lump with a paper fan standing off its
 * back, a brim jutting left, and a square block of a stamp at knee height.
 * Nothing else on the roster is that bottom-heavy.
 */
const PARTS = ["robe", "arm", "head", "stack"] as const;

/** The bundle on its back: four loose deeds, fanned from one strapped corner. */
const SHEETS: [string, string][] = [
  ["M60 54 L52 18 L62 15 L68 52 Z", "url(#scr-paper)"],
  ["M64 54 L65 11 L75 13 L72 52 Z", "#c6bc9a"],
  ["M67 53 L79 17 L88 22 L75 52 Z", "url(#scr-paper)"],
  ["M69 53 L86 30 L92 37 L75 54 Z", "#c6bc9a"],
];

export function Scribe({ unitId, animators, className = "" }: CreatureProps) {
  const hold = useRigParts(unitId, animators, PARTS);
  return (
    <svg
      className={`scribe clerks-creature ${className}`}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Seal Scribe"
    >
      <defs>
        <linearGradient id="scr-robe" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#5b5765" />
          <stop offset="0.55" stopColor="#3a3743" />
          <stop offset="1" stopColor="#1c1a23" />
        </linearGradient>
        <linearGradient id="scr-paper" x1="0.1" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#e8dfc6" />
          <stop offset="1" stopColor="#a89c78" />
        </linearGradient>
        <linearGradient id="scr-brass" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#e0c38a" />
          <stop offset="0.5" stopColor="#b89a6a" />
          <stop offset="1" stopColor="#6d5730" />
        </linearGradient>
        <linearGradient id="scr-wax" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#c04b36" />
          <stop offset="0.6" stopColor="#a8352a" />
          <stop offset="1" stopColor="#5a1812" />
        </linearGradient>
        <linearGradient id="scr-skin" x1="0.2" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#cfc9d6" />
          <stop offset="1" stopColor="#7d7488" />
        </linearGradient>
      </defs>

      {/* ---- stack: unsigned deeds, fanned and strapped to its back ---- */}
      <g ref={hold("stack")} style={{ transformOrigin: "66px 48px" }}>
        <g stroke="#171420" strokeWidth="1.5" strokeLinejoin="round">
          {SHEETS.map(([d, fill]) => (
            <path key={d} d={d} fill={fill} />
          ))}
        </g>
        {/* Ruled lines, so the sheets read as forms rather than feathers. */}
        <g stroke="#7d7250" strokeWidth="0.9" opacity="0.8">
          <path d="M55 26 L63 24" />
          <path d="M56 32 L64 30" />
          <path d="M67 24 L73 25" />
          <path d="M67 31 L73 32" />
          <path d="M79 26 L84 29" />
        </g>
        {/* The strap, and the seal holding the bundle shut. */}
        <g fill="none" stroke="#6b1f19" strokeWidth="3.4">
          <path d="M57 46 Q72 39 89 44" />
        </g>
        <circle cx="70" cy="42" r="3.6" fill="url(#scr-wax)" />
        <circle cx="69.2" cy="41.2" r="1.2" fill="#dd9a78" opacity="0.7" />
      </g>

      {/* ---- robe: stooped, hunched high behind, hem stained with wax ---- */}
      <g ref={hold("robe")} style={{ transformOrigin: "50px 90px" }}>
        <g stroke="#171420" strokeWidth="2.4" strokeLinejoin="round">
          <path
            d="M46 36 C52 27 64 29 66 44 L70 68 L75 94 H25 L31 68 L36 48 C37 41 41 37 46 36 Z"
            fill="url(#scr-robe)"
          />
        </g>
        <path
          d="M25 94 L31 88 L37 94 L43 87 L50 94 L57 87 L63 94 L69 88 L75 94 Z"
          fill="#171420"
        />
        {/* The apron: a blank form worn as a bib, ruled and ink-blotted. Duller
         * than the lantern — the lamp is the light in this drawing. */}
        <g stroke="#171420" strokeWidth="1.4">
          <path d="M39 47 L52 44.6 L54 85 L41 86 Z" fill="#a89c78" />
        </g>
        <g stroke="#6d6349" strokeWidth="0.9">
          {[52, 57, 62, 71, 76, 81].map((y) => (
            <path key={y} d={`M42 ${y} H52`} />
          ))}
        </g>
        <g fill="#241f2e">
          <path d="M43.5 65 Q47 61 50 65 Q48 70 43.5 68 Z" />
          <circle cx="51" cy="72.5" r="1.6" />
          <circle cx="44" cy="55" r="1.2" />
        </g>
        {/* Belt, and the pot of wax it dips the stamp in. */}
        <g stroke="#171420" strokeWidth="1.5">
          <path d="M33 57 Q47 62 69 57 L69 63 Q47 68 33 63 Z" fill="#2c2733" />
          <rect
            x="58"
            y="62"
            width="9"
            height="11"
            rx="1.4"
            fill="url(#scr-brass)"
          />
        </g>
        <ellipse cx="62.5" cy="62.5" rx="4.4" ry="1.8" fill="url(#scr-wax)" />
        {/* The lantern hook, rising from the near shoulder over the work. */}
        <g fill="none" strokeLinecap="round">
          <path d="M49 40 Q45 26 34 17" stroke="#171420" strokeWidth="3.4" />
          <path
            d="M49 40 Q45 26 34 17"
            stroke="url(#scr-brass)"
            strokeWidth="1.6"
          />
          <path d="M28 7 Q30.5 3.6 33 7" stroke="#171420" strokeWidth="1.6" />
        </g>
        <ellipse className="scr-glow" cx="30.5" cy="15.5" rx="13" ry="12" />
        <g stroke="#171420" strokeWidth="1.8" strokeLinejoin="round">
          <path
            d="M26.6 9 H34.4 L36.4 21 L37 23.4 H24 L24.6 21 Z"
            fill="url(#scr-brass)"
          />
        </g>
        <path className="scr-lamp" d="M27.8 11 H33.2 L34.4 19.6 H26.6 Z" />
        {/* Bars across the glass: without them the lamp is a white rectangle. */}
        <g stroke="#4a3c1e" strokeWidth="1.1">
          <path d="M29.4 10.8 L30 19.8" />
          <path d="M31.8 10.8 L32.6 19.8" />
        </g>
      </g>

      {/* ---- arm: the stamp hand, held low on the party's side ---- */}
      <g ref={hold("arm")} style={{ transformOrigin: "48px 42px" }}>
        {/* Sleeve from the near shoulder down to the fist, cuffed so the eye
         * follows the robe out to the block rather than losing the arm in it. */}
        <g stroke="#171420" strokeWidth="2.1" strokeLinejoin="round">
          <path
            d="M54 36 C45 38 35 43 29 48 L35 57 Q42 47 55 45 Z"
            fill="url(#scr-robe)"
          />
        </g>
        <g stroke="#171420" strokeWidth="1.5" strokeLinejoin="round">
          <path
            d="M28.6 43.6 Q33 46 35.6 51.4 L31.4 54 Q28.6 49 25.6 47 Z"
            fill="#2c2733"
          />
          {/* Handle: a turned brass grip with a knob, the fist closed on it. */}
          <circle cx="29.6" cy="40" r="4.4" fill="url(#scr-brass)" />
          <rect
            x="26.6"
            y="40"
            width="6"
            height="14"
            rx="1.4"
            fill="url(#scr-brass)"
          />
          <path
            d="M25 46 Q29.6 43.2 34.2 46 L33.6 52.6 Q29.6 50 25.6 52.6 Z"
            fill="url(#scr-skin)"
          />
        </g>
        {/* The matrix: a heavy block, wax on the face that bites. */}
        <g stroke="#171420" strokeWidth="2.4" strokeLinejoin="round">
          <path d="M7 53 H35 L33 65 H9 Z" fill="url(#scr-brass)" />
        </g>
        <path d="M10 57 H31" stroke="#6d5730" strokeWidth="1.4" />
        <path d="M9.6 61.6 H32.4" stroke="#4a3c1e" strokeWidth="1.6" />
        <rect
          x="8.4"
          y="64.4"
          width="24.2"
          height="5"
          rx="1"
          fill="url(#scr-wax)"
          stroke="#171420"
          strokeWidth="1.5"
        />
        <path d="M12 67 H28" stroke="#5a1812" strokeWidth="1.1" />
      </g>

      {/* ---- head: an eyeshade, and a face the lantern is the only light on -- */}
      <g ref={hold("head")} style={{ transformOrigin: "46px 36px" }}>
        <g stroke="#171420" strokeWidth="1.8" strokeLinejoin="round">
          <path d="M31 34 Q40 40 50 35 L52 41 Q40 48 30 41 Z" fill="#2c2733" />
          <path
            d="M32 24 C34 18 43 17 47 22 C51 27 50 36 45 39 C38 42 32 38 31 32 Z"
            fill="url(#scr-skin)"
            strokeWidth="2.1"
          />
          {/* Skullcap, flat and close to the skull: a clerk's, not a mitre. */}
          <path
            d="M30.5 27 C31 18 44 15 48 23 L47.2 27 C42 23 35 24 30.5 27 Z"
            fill="#3a3743"
          />
        </g>
        {/* The lantern's wash, held on the cheek nearest the party. */}
        <path
          className="scr-lit"
          d="M32 24 C34 18 43 17 47 22 L42 27 Q35 28 33 33 Z"
        />
        <path d="M35.5 36.4 H42" stroke="#4a4354" strokeWidth="1.1" />
        {/* The shadow the brim throws, so the eyes have something to be pale
         * against, and over it the dark brass visor pulled down. */}
        <path
          d="M30.4 30.4 L48 27.6 L47.6 34.4 Q39 37 32.4 34.6 Z"
          fill="#2a2434"
        />
        <path
          d="M26.6 26 L47.4 23.4 L48.4 29 L28.4 32.4 Z"
          fill="#5f4d26"
          stroke="#171420"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M28.6 29 L46.6 26.2" stroke="#b89a6a" strokeWidth="0.9" />
        <circle className="scr-eye" cx="35" cy="32.6" r="1.8" />
        <circle className="scr-eye" cx="41.4" cy="31.6" r="1.5" />
      </g>
    </svg>
  );
}
