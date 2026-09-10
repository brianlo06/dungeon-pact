import { Sprite } from "./Sprite";
/** Pixel-grid scene geometry stays source-editable; no blurred layers or image filters. */
export function GuildScene() {
  return (
    <div
      className="guild-scene"
      aria-label="Four adventurers gather by the fire in a crooked little dungeon tavern"
      role="img"
    >
      <svg
        viewBox="0 0 480 280"
        shapeRendering="crispEdges"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect width="480" height="280" fill="#282432" />
        {Array.from({ length: 8 }, (_, y) =>
          Array.from({ length: 11 }, (_, x) => (
            <g key={`${x}-${y}`}>
              <rect
                x={x * 48 - (y % 2) * 24}
                y={y * 24}
                width="44"
                height="20"
                fill={(x + y) % 4 === 0 ? "#403849" : "#342e3e"}
              />
              <path
                d={`M${x * 48 - (y % 2) * 24 + 4} ${y * 24 + 3}h32`}
                stroke="#484051"
                strokeWidth="2"
              />
            </g>
          )),
        )}
        <path d="M0 192h480v88H0z" fill="#3a3037" />
        {Array.from({ length: 5 }, (_, y) => (
          <path
            key={y}
            d={`M0 ${198 + y * 20}h480`}
            stroke="#211e2c"
            strokeWidth="3"
          />
        ))}
        {Array.from({ length: 12 }, (_, x) => (
          <path
            key={x}
            d={`M${x * 44} 192v88`}
            stroke="#2d2530"
            strokeWidth="2"
          />
        ))}
        <path d="M316 60h90v132h-90z" fill="#171820" />
        <path
          d="M308 60h8v132h-8zM406 60h8v132h-8zM324 44h74v8h-74zM316 52h90v8h-90z"
          fill="#726174"
        />
        <path
          d="M320 68h18v124h-18zM388 68h14v124h-14zM342 176h42v16h-42zM348 164h30v12h-30zM354 154h18v10h-18z"
          fill="#373243"
        />
        <rect x="42" y="57" width="100" height="89" fill="#1b1c29" />
        <path
          d="M42 57h100v8H42zM88 60h8v86h-8zM42 99h100v7H42z"
          fill="#846654"
        />
        <rect x="49" y="67" width="35" height="29" fill="#59637b" />
        <rect x="99" y="67" width="35" height="29" fill="#59637b" />
        <rect x="49" y="109" width="35" height="30" fill="#48475e" />
        <rect x="99" y="109" width="35" height="30" fill="#48475e" />
        <path d="M49 67h10v8H49zM124 116h10v8h-10z" fill="#8993a0" />
        <rect x="172" y="75" width="88" height="63" fill="#715041" />
        <rect x="178" y="81" width="76" height="51" fill="#332d37" />
        <path
          d="M188 93h50v4h-50zM188 104h38v4h-38zM188 115h45v4h-45z"
          fill="#bc936b"
        />
        <path
          d="M170 139h110v10H170zM180 149h12v38h-12zM258 149h12v38h-12z"
          fill="#997053"
        />
        <rect x="183" y="149" width="78" height="16" fill="#654737" />
        <path d="M193 125h9v14h-9zM230 129h13v10h-13z" fill="#e5c78e" />
        <path d="M196 113h4v12h-4z" fill="#e5a157" />
        <path
          d="M415 207h47v15h-47zM424 192h29v23h-29zM430 180h17v30h-17z"
          fill="#b65c45"
        />
        <path d="M431 194h15v18h-15zM437 184h5v24h-5z" fill="#efbd67" />
        <path
          d="M411 218h53v7h-53zM419 227h8v6h-8zM451 227h8v6h-8z"
          fill="#171820"
        />
        <path
          d="M22 190h32v29H22zM18 197h40v5H18zM18 212h40v5H18z"
          fill="#785843"
        />
        <path d="M22 192h32v3H22z" fill="#ae805b" />
      </svg>
      <div className="scene-party">
        {["vanguard", "arcanist", "ranger", "warden"].map((id) => (
          <Sprite key={id} id={id} />
        ))}
      </div>
      <span className="scene-caption">THE LAST LANTERN · GUILD HALL</span>
    </div>
  );
}
