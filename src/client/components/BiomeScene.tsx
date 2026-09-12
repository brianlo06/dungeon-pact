import type { BiomeId } from "../../content/biomes";
import { Foundry } from "./Foundry";

/** Architecture lives at the perimeter; the center stays quiet for the party. */
export function BiomeScene({
  biome,
  ledger = false,
}: {
  biome: BiomeId;
  ledger?: boolean;
}) {
  if (biome === "foundry")
    return <Foundry district={ledger ? "ledger" : "furnace"} />;
  const water = biome === "cistern";
  return (
    <>
      <div
        className="layer layer-far"
        data-parallax="0.15"
        data-biome={biome}
        aria-hidden="true"
      >
        <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice">
          <rect
            width="1600"
            height="700"
            fill={water ? "#142a32" : "#282334"}
          />
          {[80, 390, 700, 1010, 1320].map((x, i) => (
            <g key={x}>
              <path
                d={`M${x} 500V180Q${x + 110} 15 ${x + 220} 180V500`}
                fill={water ? "#101e28" : "#171822"}
                stroke={water ? "#37565a" : "#50404c"}
                strokeWidth="18"
              />
              {water ? (
                <>
                  <path
                    d={`M${x + 30} 0V170H${x + 190}V470`}
                    fill="none"
                    stroke="#496364"
                    strokeWidth="14"
                  />
                  <circle
                    cx={x + 190}
                    cy="260"
                    r="26"
                    fill="#273e45"
                    stroke="#7b8c79"
                    strokeWidth="5"
                  />
                  <path
                    d={`M${x + 190} 236V284M${x + 166} 260H${x + 214}`}
                    stroke="#7b8c79"
                    strokeWidth="4"
                  />
                </>
              ) : (
                <>
                  {[180, 240, 300, 360].map((y) => (
                    <g key={y}>
                      <path
                        d={`M${x + 20} ${y + 35}H${x + 200}`}
                        stroke="#64515a"
                        strokeWidth="6"
                      />
                      {Array.from({ length: 9 }, (_, j) => (
                        <rect
                          key={j}
                          x={x + 22 + j * 20}
                          y={y}
                          width={13}
                          height={30 - (j % 3) * 5}
                          fill={j % 3 === 0 ? "#836b5a" : "#4a454e"}
                        />
                      ))}
                    </g>
                  ))}
                  <path
                    d={`M${x + 92} 55h40v100l-20-12-20 12Z`}
                    fill={i % 2 ? "#817259" : "#635367"}
                  />
                </>
              )}
            </g>
          ))}
          {water && (
            <>
              <path d="M0 470Q400 450 800 470T1600 470V700H0Z" fill="#27474c" />
              <path
                d="M50 484H350M520 480H680M870 486H1180M1290 478H1550"
                stroke="#709590"
                strokeWidth="3"
                opacity=".45"
              />
            </>
          )}
        </svg>
      </div>
      <div className="layer layer-mid" data-parallax="0.4" aria-hidden="true">
        <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice">
          {water ? (
            <g fill="none" stroke="#14232a" strokeWidth="28">
              <path d="M0 70H110V410H210M1600 90H1480V430H1380" />
              <circle cx="80" cy="320" r="52" />
              <circle cx="1520" cy="330" r="60" />
            </g>
          ) : (
            <g fill="#11131e">
              <path d="M0 0H100V500H0ZM1500 0H1600V500H1500Z" />
              <path d="M30 170H210V185H30M1390 200H1570V215H1390" />
              <path
                d="M110 0V150L160 190L210 150V0ZM1390 0V180L1440 220L1490 180V0Z"
                fill="#493c4d"
              />
            </g>
          )}
          <path
            d="M0 440H1600"
            stroke={water ? "#455b5c" : "#62505a"}
            strokeWidth="12"
          />
        </svg>
      </div>
      <div className="layer layer-ground" aria-hidden="true">
        <svg viewBox="0 0 1600 420" preserveAspectRatio="none">
          <rect
            width="1600"
            height="420"
            fill={water ? "#223438" : "#302935"}
          />
          <g
            stroke={water ? "#415758" : "#514450"}
            strokeWidth="3"
            opacity=".65"
          >
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M${-260 + i * 250} 420L${480 + i * 82} 0`} />
            ))}
            <path d="M0 96H1600M0 200H1600M0 320H1600" />
          </g>
          {water ? (
            <path
              d="M0 365H410L470 420H0ZM1600 365H1190L1130 420H1600Z"
              fill="#49706e"
              opacity=".45"
            />
          ) : (
            <path
              d="M650 350L800 310L950 350L800 390ZM700 350H900M800 325V375"
              fill="none"
              stroke="#8b7156"
              opacity=".4"
              strokeWidth="4"
            />
          )}
        </svg>
      </div>
      <div
        className="layer layer-foreground"
        data-parallax="1.3"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice">
          <path
            d="M0 0H170L140 40H0ZM1600 0H1430L1460 40H1600ZM0 688H1600V700H0Z"
            fill="#0c121b"
          />
        </svg>
      </div>
    </>
  );
}
