import type { CSSProperties } from "react";

type Props = { className?: string; style?: CSSProperties };

export const SHIP_PORT_CABIN_Y = 280;
export const SHIP_PORT_CABIN_H = 70;
export const SHIP_STBD_CABIN_Y = 450;
export const SHIP_STBD_CABIN_H = 70;

export const SHIP_PORT_CORR = { x: 160, y: 355, w: 660, h: 18 } as const;
export const SHIP_STBD_CORR = { x: 160, y: 425, w: 660, h: 18 } as const;

export const SHIP_AFT_BLOCK_X = 165;
export const SHIP_AFT_CABINS = 9;
const SHIP_AFT_CABIN_W = 28;
const SHIP_AFT_CABIN_GAP = 2;
export const shipAftX = (i: number) =>
  SHIP_AFT_BLOCK_X + i * (SHIP_AFT_CABIN_W + SHIP_AFT_CABIN_GAP);
export const SHIP_AFT_CABIN_W_EXPORT = SHIP_AFT_CABIN_W;

export const SHIP_FWD_BLOCK_X = 665;
export const SHIP_FWD_CABINS = 5;
const SHIP_FWD_CABIN_W = 28;
const SHIP_FWD_CABIN_GAP = 2;
export const shipFwdX = (i: number) =>
  SHIP_FWD_BLOCK_X + i * (SHIP_FWD_CABIN_W + SHIP_FWD_CABIN_GAP);
export const SHIP_FWD_CABIN_W_EXPORT = SHIP_FWD_CABIN_W;

// Must fit between the two corridors (y 355..373 and y 425..443).
export const SHIP_ATRIUM = { x: 425, y: 374, w: 50, h: 50 } as const;
export const SHIP_DINING = { x: 485, y: 374, w: 170, h: 50 } as const;

export function CruiseShipBlueprint({ className, style }: Props) {
  const stroke = "rgba(239,238,239,0.34)";
  const strokeFaint = "rgba(239,238,239,0.16)";
  const textFaint = "rgba(239,238,239,0.34)";

  const hull =
    "M 80 260 L 860 260 Q 940 260 960 360 Q 970 400 960 440 Q 940 540 860 540 L 80 540 Q 40 540 40 460 L 40 340 Q 40 260 80 260 Z";
  const hullInner =
    "M 86 268 L 858 268 Q 932 268 952 362 Q 962 400 952 438 Q 932 532 858 532 L 86 532 Q 48 532 48 458 L 48 342 Q 48 268 86 268 Z";

  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g fontFamily="var(--font-mono)">
        <text
          x="60"
          y="52"
          fontSize="18"
          fontWeight="500"
          letterSpacing="0.12em"
          fill="rgba(239,238,239,0.95)"
        >
          CARIBBEAN CRUISE
        </text>
        <text
          x="940"
          y="52"
          textAnchor="end"
          fontSize="11"
          letterSpacing="0.22em"
          fill={textFaint}
        >
          DIGITAL TWIN
          <tspan fill="rgba(239,238,239,0.22)">{"  ·  "}</tspan>
          MAIN FLOOR
        </text>
      </g>

      <g
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      >
        <path d={hull} />
        <path d={hullInner} stroke={strokeFaint} />

        <line x1="160" y1="260" x2="160" y2="540" stroke={strokeFaint} />
        <line x1="820" y1="260" x2="820" y2="540" stroke={strokeFaint} />

        <rect x="80" y="280" width="78" height="240" stroke={strokeFaint} />
        <line x1="120" y1="280" x2="120" y2="520" stroke={strokeFaint} />
        <line x1="80" y1="400" x2="158" y2="400" stroke={strokeFaint} />

        <rect
          x={SHIP_PORT_CORR.x}
          y={SHIP_PORT_CORR.y - 3}
          width={SHIP_PORT_CORR.w}
          height={SHIP_PORT_CORR.h + 6}
          stroke={strokeFaint}
        />
        <rect
          x={SHIP_STBD_CORR.x}
          y={SHIP_STBD_CORR.y - 3}
          width={SHIP_STBD_CORR.w}
          height={SHIP_STBD_CORR.h + 6}
          stroke={strokeFaint}
        />

        {Array.from({ length: SHIP_AFT_CABINS }, (_, i) => {
          const x = shipAftX(i);
          return (
            <g key={`A-P-${i}`}>
              <rect
                x={x}
                y={SHIP_PORT_CABIN_Y}
                width={SHIP_AFT_CABIN_W}
                height={SHIP_PORT_CABIN_H}
              />
              <line
                x1={x + 4}
                y1={SHIP_PORT_CABIN_Y + SHIP_PORT_CABIN_H}
                x2={x + SHIP_AFT_CABIN_W / 2 - 3}
                y2={SHIP_PORT_CABIN_Y + SHIP_PORT_CABIN_H}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <line
                x1={x + SHIP_AFT_CABIN_W / 2 + 3}
                y1={SHIP_PORT_CABIN_Y + SHIP_PORT_CABIN_H}
                x2={x + SHIP_AFT_CABIN_W - 4}
                y2={SHIP_PORT_CABIN_Y + SHIP_PORT_CABIN_H}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
            </g>
          );
        })}

        {Array.from({ length: SHIP_AFT_CABINS }, (_, i) => {
          const x = shipAftX(i);
          return (
            <g key={`A-S-${i}`}>
              <rect
                x={x}
                y={SHIP_STBD_CABIN_Y}
                width={SHIP_AFT_CABIN_W}
                height={SHIP_STBD_CABIN_H}
              />
              <line
                x1={x + 4}
                y1={SHIP_STBD_CABIN_Y}
                x2={x + SHIP_AFT_CABIN_W / 2 - 3}
                y2={SHIP_STBD_CABIN_Y}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <line
                x1={x + SHIP_AFT_CABIN_W / 2 + 3}
                y1={SHIP_STBD_CABIN_Y}
                x2={x + SHIP_AFT_CABIN_W - 4}
                y2={SHIP_STBD_CABIN_Y}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
            </g>
          );
        })}

        {Array.from({ length: SHIP_FWD_CABINS }, (_, i) => {
          const x = shipFwdX(i);
          return (
            <g key={`F-P-${i}`}>
              <rect
                x={x}
                y={SHIP_PORT_CABIN_Y}
                width={SHIP_FWD_CABIN_W}
                height={SHIP_PORT_CABIN_H}
              />
              <line
                x1={x + 4}
                y1={SHIP_PORT_CABIN_Y + SHIP_PORT_CABIN_H}
                x2={x + SHIP_FWD_CABIN_W / 2 - 3}
                y2={SHIP_PORT_CABIN_Y + SHIP_PORT_CABIN_H}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <line
                x1={x + SHIP_FWD_CABIN_W / 2 + 3}
                y1={SHIP_PORT_CABIN_Y + SHIP_PORT_CABIN_H}
                x2={x + SHIP_FWD_CABIN_W - 4}
                y2={SHIP_PORT_CABIN_Y + SHIP_PORT_CABIN_H}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
            </g>
          );
        })}

        {Array.from({ length: SHIP_FWD_CABINS }, (_, i) => {
          const x = shipFwdX(i);
          return (
            <g key={`F-S-${i}`}>
              <rect
                x={x}
                y={SHIP_STBD_CABIN_Y}
                width={SHIP_FWD_CABIN_W}
                height={SHIP_STBD_CABIN_H}
              />
              <line
                x1={x + 4}
                y1={SHIP_STBD_CABIN_Y}
                x2={x + SHIP_FWD_CABIN_W / 2 - 3}
                y2={SHIP_STBD_CABIN_Y}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <line
                x1={x + SHIP_FWD_CABIN_W / 2 + 3}
                y1={SHIP_STBD_CABIN_Y}
                x2={x + SHIP_FWD_CABIN_W - 4}
                y2={SHIP_STBD_CABIN_Y}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
            </g>
          );
        })}

        <rect
          x={SHIP_ATRIUM.x}
          y={SHIP_ATRIUM.y}
          width={SHIP_ATRIUM.w}
          height={SHIP_ATRIUM.h}
        />
        <circle
          cx={SHIP_ATRIUM.x + SHIP_ATRIUM.w / 2}
          cy={SHIP_ATRIUM.y + SHIP_ATRIUM.h / 2}
          r={10}
          stroke={strokeFaint}
        />
        <line
          x1={SHIP_ATRIUM.x + 10}
          y1={SHIP_ATRIUM.y}
          x2={SHIP_ATRIUM.x + SHIP_ATRIUM.w - 10}
          y2={SHIP_ATRIUM.y}
          stroke="rgba(33,35,38,1)"
          strokeWidth="2"
        />
        <line
          x1={SHIP_ATRIUM.x + 10}
          y1={SHIP_ATRIUM.y + SHIP_ATRIUM.h}
          x2={SHIP_ATRIUM.x + SHIP_ATRIUM.w - 10}
          y2={SHIP_ATRIUM.y + SHIP_ATRIUM.h}
          stroke="rgba(33,35,38,1)"
          strokeWidth="2"
        />

        <rect
          x={SHIP_DINING.x}
          y={SHIP_DINING.y}
          width={SHIP_DINING.w}
          height={SHIP_DINING.h}
        />
        {Array.from({ length: 9 }, (_, c) => {
          const cx = SHIP_DINING.x + 14 + c * 18;
          const cy = SHIP_DINING.y + SHIP_DINING.h / 2;
          return (
            <circle
              key={`tbl-${c}`}
              cx={cx}
              cy={cy}
              r={4}
              stroke={strokeFaint}
            />
          );
        })}
        <line
          x1={SHIP_DINING.x + 30}
          y1={SHIP_DINING.y}
          x2={SHIP_DINING.x + SHIP_DINING.w - 30}
          y2={SHIP_DINING.y}
          stroke="rgba(33,35,38,1)"
          strokeWidth="2"
        />
        <line
          x1={SHIP_DINING.x + 30}
          y1={SHIP_DINING.y + SHIP_DINING.h}
          x2={SHIP_DINING.x + SHIP_DINING.w - 30}
          y2={SHIP_DINING.y + SHIP_DINING.h}
          stroke="rgba(33,35,38,1)"
          strokeWidth="2"
        />

        <rect x="822" y="270" width="40" height="14" stroke={strokeFaint} />
        <rect x="822" y="516" width="40" height="14" stroke={strokeFaint} />

        <path
          d="M 822 286 L 858 286 Q 920 296 940 380 L 940 420 Q 920 504 858 514 L 822 514 Z"
          stroke={strokeFaint}
        />

        <rect x="868" y="385" width="42" height="30" stroke={strokeFaint} />
        <circle cx="889" cy="400" r="5" stroke={strokeFaint} />

        <rect x="832" y="388" width="22" height="24" stroke={strokeFaint} />

        <circle cx="950" cy="400" r="3" stroke={strokeFaint} />
      </g>

      <g
        fill={textFaint}
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="0.15em"
      >
        <text x="119" y="274" textAnchor="middle">
          ENG
        </text>
        <text x={SHIP_DINING.x + SHIP_DINING.w / 2} y={376} textAnchor="middle">
          DINING
        </text>
        <text x={SHIP_ATRIUM.x + SHIP_ATRIUM.w / 2} y={376} textAnchor="middle">
          ATR
        </text>
        <text x="885" y="360" textAnchor="middle">
          BRG
        </text>
        <text x="60" y="566">
          ◀ STERN
        </text>
        <text x="940" y="566" textAnchor="end">
          BOW ▶
        </text>
      </g>

      <g stroke={stroke} strokeWidth="1" fill="none" strokeLinecap="square">
        <path d="M30 60 L30 30 L60 30" />
        <path d="M940 30 L970 30 L970 60" />
        <path d="M30 940 L30 970 L60 970" />
        <path d="M970 940 L970 970 L940 970" />
      </g>
    </svg>
  );
}
