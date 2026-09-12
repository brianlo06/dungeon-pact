/**
 * The Ember Foundry.
 *
 * Four parallax layers of authored silhouette rather than abstract gradients:
 * a furnace hall behind, machinery and gantries in the middle, the platform the
 * fight stands on, and chains and pipe edges in front. The point is that the
 * battle happens somewhere, and that the camera has something to move against.
 *
 * Parallax depth is declared per layer and applied by the stage, so the camera
 * stays the only thing that decides how far anything moves.
 */
export function Foundry({
  district = "furnace",
}: {
  district?: "furnace" | "coolant" | "ledger";
}) {
  return (
    <>
      {/* ---------------------------------------------------------- far -- */}
      <div className="layer layer-far" data-parallax="0.15" aria-hidden="true">
        <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice">
          <defs>
            <linearGradient id="hall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#2b2033" />
              <stop
                offset="0.52"
                stopColor={
                  district === "coolant"
                    ? "#203e42"
                    : district === "ledger"
                      ? "#41302a"
                      : "#43262e"
                }
              />
              <stop
                offset="1"
                stopColor={
                  district === "coolant"
                    ? "#34575a"
                    : district === "ledger"
                      ? "#6e522c"
                      : "#7a3c28"
                }
              />
            </linearGradient>
            <radialGradient id="mouth">
              <stop offset="0" stopColor="#ffc070" stopOpacity="0.85" />
              <stop offset="0.45" stopColor="#ff8a3c" stopOpacity="0.4" />
              <stop offset="1" stopColor="#ff8a3c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="furnace-far" cx="0.5" cy="1" r="0.8">
              <stop offset="0" stopColor="#ff8a3c" stopOpacity="0.5" />
              <stop offset="1" stopColor="#ff8a3c" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="1600" height="700" fill="url(#hall)" />
          {district === "coolant" && (
            <g fill="none" stroke="#547b79" strokeWidth="18" opacity=".55">
              <path d="M80 0V320H390V600M1510 0V270H1220V620" />
              <circle cx="390" cy="390" r="38" />
              <circle cx="1220" cy="380" r="38" />
            </g>
          )}
          {district === "ledger" && (
            <g fill="#79603c" stroke="#b69a61" strokeWidth="3" opacity=".65">
              {[180, 680, 1180].map((x) => (
                <g key={x}>
                  <path d={`M${x} 80h130v260l-65-40-65 40Z`} />
                  <path
                    d={`M${x + 25} 140h80m-80 30h80m-80 30h50`}
                    fill="none"
                  />
                </g>
              ))}
            </g>
          )}
          {/* The hall's vault, receding */}
          <path
            d="M0 250 Q800 90 1600 250 V700 H0 Z"
            fill="#221b2b"
            opacity="0.42"
          />
          {/* Chimneys and stacks */}
          <g fill="#191320" opacity="0.85">
            <rect x="90" y="40" width="70" height="300" />
            <rect x="70" y="24" width="110" height="20" />
            <rect x="250" y="86" width="46" height="260" />
            <rect x="1340" y="18" width="86" height="330" />
            <rect x="1320" y="0" width="126" height="22" />
            <rect x="1480" y="96" width="52" height="250" />
          </g>
          {/* Molten channels at the far wall */}
          <rect
            x="0"
            y="150"
            width="1600"
            height="260"
            fill="url(#furnace-far)"
          />
          <g className="molten" fill="#ff8a3c">
            <rect x="250" y="286" width="1100" height="14" rx="7" />
            <rect
              x="180"
              y="612"
              width="1240"
              height="10"
              rx="5"
              opacity="0.7"
            />
          </g>
          {/* Distant furnace mouths: glow, not discs. */}
          <g className="furnace-mouth">
            <ellipse cx="470" cy="250" rx="58" ry="30" fill="url(#mouth)" />
            <ellipse cx="1130" cy="262" rx="46" ry="24" fill="url(#mouth)" />
            <rect
              x="440"
              y="236"
              width="60"
              height="26"
              rx="4"
              fill="#ff9c42"
              opacity="0.35"
            />
            <rect
              x="1104"
              y="250"
              width="50"
              height="20"
              rx="4"
              fill="#ff8f36"
              opacity="0.3"
            />
          </g>
        </svg>
      </div>

      {/* ---------------------------------------------------------- mid -- */}
      <div className="layer layer-mid" data-parallax="0.4" aria-hidden="true">
        <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice">
          <g fill="#15111c">
            {/* Gantry running the width of the hall */}
            <rect x="0" y="150" width="1600" height="13" />
            <rect x="0" y="163" width="1600" height="6" opacity="0.5" />
            {[120, 300, 520, 760, 1010, 1260, 1480].map((x) => (
              <rect key={x} x={x} y="163" width="12" height="58" />
            ))}
            {/* Pipework */}
            <path
              d="M0 214 H280 Q310 214 310 244 V330 H400"
              fill="none"
              stroke="#15111c"
              strokeWidth="22"
            />
            <path
              d="M1600 196 H1320 Q1288 196 1288 228 V320 H1200"
              fill="none"
              stroke="#15111c"
              strokeWidth="26"
            />
            {/* Machinery blocks */}
            <rect x="40" y="228" width="170" height="150" rx="6" />
            <rect x="1400" y="214" width="180" height="164" rx="6" />
          </g>
          {/* Slow gears */}
          <g className="gear" transform="translate(126 292)">
            <circle r="42" fill="#1d1826" stroke="#2c2436" strokeWidth="8" />
            {Array.from({ length: 8 }, (_, i) => (
              <rect
                key={i}
                x="-5"
                y="-52"
                width="10"
                height="14"
                fill="#2c2436"
                transform={`rotate(${i * 45})`}
              />
            ))}
          </g>
          <g className="gear gear-slow" transform="translate(1486 286)">
            <circle r="52" fill="#1d1826" stroke="#2c2436" strokeWidth="9" />
            {Array.from({ length: 10 }, (_, i) => (
              <rect
                key={i}
                x="-5"
                y="-63"
                width="11"
                height="15"
                fill="#2c2436"
                transform={`rotate(${i * 36})`}
              />
            ))}
          </g>
          {/* Hanging chains, swaying out of phase with one another */}
          <g stroke="#241e2e" strokeWidth="7" strokeLinecap="round" fill="none">
            <path className="sway sway-a" d="M430 163 V300" />
            <path className="sway sway-b" d="M1150 163 V320" />
            <path className="sway sway-c" d="M880 163 V258" />
          </g>
        </svg>
      </div>

      {/* ------------------------------------------------------- ground -- */}
      <div className="layer layer-ground" aria-hidden="true">
        <svg viewBox="0 0 1600 420" preserveAspectRatio="none">
          <defs>
            <linearGradient id="deck" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5a4148" />
              <stop offset="0.14" stopColor="#3b2c37" />
              <stop offset="1" stopColor="#1a141f" />
            </linearGradient>
          </defs>
          <rect width="1600" height="420" fill="url(#deck)" />
          {/* Plate seams receding toward the far wall */}
          <g stroke="#3d3348" strokeWidth="3" opacity="0.65">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <path key={i} d={`M${-260 + i * 250} 420 L${480 + i * 82} 0`} />
            ))}
            <path d="M0 96 H1600" opacity="0.5" />
            <path d="M0 200 H1600" opacity="0.4" />
            <path d="M0 320 H1600" opacity="0.3" />
          </g>
          {/* A grate with furnace light under it */}
          <g className="grate">
            <rect
              x="560"
              y="330"
              width="480"
              height="56"
              fill="#100d16"
              opacity="0.55"
            />
            {Array.from({ length: 12 }, (_, i) => (
              <rect
                key={i}
                x={570 + i * 39}
                y="330"
                width="18"
                height="56"
                fill="#ff8a3c"
                opacity="0.16"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* --------------------------------------------------- foreground -- */}
      <div
        className="layer layer-foreground"
        data-parallax="1.3"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice">
          {/* Deliberately confined to the top corners and the very bottom edge,
              so nothing ever occludes a combatant or an intent chip. */}
          <g fill="#0d0b12">
            <path d="M0 0 H210 L172 44 Q96 62 0 52 Z" />
            <path d="M1600 0 H1400 L1442 40 Q1520 60 1600 50 Z" />
            <rect x="0" y="686" width="1600" height="14" />
          </g>
          <g
            stroke="#0d0b12"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          >
            <path className="sway sway-b" d="M140 0 V92" />
            <path className="sway sway-a" d="M1476 0 V78" />
          </g>
        </svg>
      </div>
    </>
  );
}
