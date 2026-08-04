import type { CSSProperties } from "react";

type Props = { className?: string; style?: CSSProperties };

export const FARM_PASTURE = { x: 80, y: 130, w: 400, h: 690 } as const;
export const FARM_STALLS = { x: 520, y: 130, w: 420, h: 170 } as const;
export const FARM_HOLDING = { x: 520, y: 330, w: 240, h: 160 } as const;
export const FARM_PARLOR = { x: 780, y: 330, w: 160, h: 160 } as const;
export const FARM_CALVES = { x: 520, y: 520, w: 240, h: 300 } as const;
export const FARM_MILK_ROOM = { x: 780, y: 520, w: 160, h: 300 } as const;
export const FARM_ALLEY = { x: 80, y: 850, w: 860, h: 50 } as const;

export function FarmBlueprint({ className, style }: Props) {
  const stroke = "rgba(239,238,239,0.34)";
  const strokeFaint = "rgba(239,238,239,0.16)";
  const textFaint = "rgba(239,238,239,0.34)";

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
          DAIRY FARM
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
          BARN 02
          <tspan fill="rgba(239,238,239,0.22)">{"  ·  "}</tspan>
          MILKING SHIFT
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
        <rect x="60" y="60" width="880" height="880" />
        <rect x="70" y="70" width="860" height="860" stroke={strokeFaint} />

        <rect
          x={FARM_PASTURE.x}
          y={FARM_PASTURE.y}
          width={FARM_PASTURE.w}
          height={FARM_PASTURE.h}
        />
        <line
          x1={FARM_PASTURE.x}
          y1={FARM_PASTURE.y + 360}
          x2={FARM_PASTURE.x + FARM_PASTURE.w}
          y2={FARM_PASTURE.y + 360}
          stroke={strokeFaint}
          strokeDasharray="4 6"
        />
        <rect
          x={FARM_PASTURE.x + 250}
          y={FARM_PASTURE.y + 170}
          width="60"
          height="14"
          stroke={strokeFaint}
        />
        <rect
          x={FARM_PASTURE.x + 40}
          y={FARM_PASTURE.y + 510}
          width="130"
          height="80"
          stroke={strokeFaint}
        />
        <line
          x1={FARM_PASTURE.x + 40}
          y1={FARM_PASTURE.y + 540}
          x2={FARM_PASTURE.x + 170}
          y2={FARM_PASTURE.y + 540}
          stroke={strokeFaint}
        />
        <line
          x1={FARM_PASTURE.x + FARM_PASTURE.w}
          y1={FARM_PASTURE.y + 200}
          x2={FARM_PASTURE.x + FARM_PASTURE.w}
          y2={FARM_PASTURE.y + 280}
          stroke="rgba(33,35,38,1)"
          strokeWidth="2"
        />

        <rect
          x={FARM_STALLS.x}
          y={FARM_STALLS.y}
          width={FARM_STALLS.w}
          height={FARM_STALLS.h}
        />
        <line
          x1={FARM_STALLS.x}
          y1={FARM_STALLS.y + FARM_STALLS.h / 2}
          x2={FARM_STALLS.x + FARM_STALLS.w}
          y2={FARM_STALLS.y + FARM_STALLS.h / 2}
          stroke={strokeFaint}
        />
        {Array.from({ length: 10 }, (_, i) => {
          const x = FARM_STALLS.x + (i + 1) * (FARM_STALLS.w / 10);
          return (
            <line
              key={`stall-N-${i}`}
              x1={x}
              y1={FARM_STALLS.y}
              x2={x}
              y2={FARM_STALLS.y + FARM_STALLS.h / 2 - 4}
              stroke={strokeFaint}
            />
          );
        })}
        {Array.from({ length: 10 }, (_, i) => {
          const x = FARM_STALLS.x + (i + 1) * (FARM_STALLS.w / 10);
          return (
            <line
              key={`stall-S-${i}`}
              x1={x}
              y1={FARM_STALLS.y + FARM_STALLS.h / 2 + 4}
              x2={x}
              y2={FARM_STALLS.y + FARM_STALLS.h}
              stroke={strokeFaint}
            />
          );
        })}
        <line
          x1={FARM_STALLS.x + 60}
          y1={FARM_STALLS.y + FARM_STALLS.h}
          x2={FARM_STALLS.x + 180}
          y2={FARM_STALLS.y + FARM_STALLS.h}
          stroke="rgba(33,35,38,1)"
          strokeWidth="2"
        />

        <rect
          x={FARM_HOLDING.x}
          y={FARM_HOLDING.y}
          width={FARM_HOLDING.w}
          height={FARM_HOLDING.h}
        />
        <line
          x1={FARM_HOLDING.x + 20}
          y1={FARM_HOLDING.y + 30}
          x2={FARM_HOLDING.x + FARM_HOLDING.w - 6}
          y2={FARM_HOLDING.y + FARM_HOLDING.h - 30}
          stroke={strokeFaint}
          strokeDasharray="3 4"
        />
        <line
          x1={FARM_HOLDING.x + FARM_HOLDING.w}
          y1={FARM_HOLDING.y + 60}
          x2={FARM_HOLDING.x + FARM_HOLDING.w}
          y2={FARM_HOLDING.y + 110}
          stroke="rgba(33,35,38,1)"
          strokeWidth="2"
        />

        <rect
          x={FARM_PARLOR.x}
          y={FARM_PARLOR.y}
          width={FARM_PARLOR.w}
          height={FARM_PARLOR.h}
        />
        <line
          x1={FARM_PARLOR.x + FARM_PARLOR.w / 2}
          y1={FARM_PARLOR.y + 24}
          x2={FARM_PARLOR.x + FARM_PARLOR.w / 2}
          y2={FARM_PARLOR.y + FARM_PARLOR.h - 16}
          stroke={strokeFaint}
        />
        {Array.from({ length: 4 }, (_, i) => {
          const y = FARM_PARLOR.y + 28 + i * 30;
          const halfW = FARM_PARLOR.w / 2 - 18;
          return (
            <g key={`milk-${i}`}>
              <rect
                x={FARM_PARLOR.x + 14}
                y={y}
                width={halfW}
                height={20}
                stroke={strokeFaint}
              />
              <rect
                x={FARM_PARLOR.x + FARM_PARLOR.w / 2 + 4}
                y={y}
                width={halfW}
                height={20}
                stroke={strokeFaint}
              />
            </g>
          );
        })}

        <rect
          x={FARM_CALVES.x}
          y={FARM_CALVES.y}
          width={FARM_CALVES.w}
          height={FARM_CALVES.h}
        />
        {Array.from({ length: 6 }, (_, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const pw = (FARM_CALVES.w - 24) / 3;
          const ph = (FARM_CALVES.h - 50) / 2;
          return (
            <rect
              key={`calf-${i}`}
              x={FARM_CALVES.x + 8 + col * (pw + 4)}
              y={FARM_CALVES.y + 32 + row * (ph + 6)}
              width={pw}
              height={ph}
              stroke={strokeFaint}
            />
          );
        })}

        <rect
          x={FARM_MILK_ROOM.x}
          y={FARM_MILK_ROOM.y}
          width={FARM_MILK_ROOM.w}
          height={FARM_MILK_ROOM.h}
        />
        <circle
          cx={FARM_MILK_ROOM.x + FARM_MILK_ROOM.w / 2}
          cy={FARM_MILK_ROOM.y + 130}
          r={48}
          stroke={strokeFaint}
        />
        <circle
          cx={FARM_MILK_ROOM.x + FARM_MILK_ROOM.w / 2}
          cy={FARM_MILK_ROOM.y + 130}
          r={6}
          stroke={strokeFaint}
        />
        <rect
          x={FARM_MILK_ROOM.x + 18}
          y={FARM_MILK_ROOM.y + 220}
          width={56}
          height={28}
          stroke={strokeFaint}
        />
        <rect
          x={FARM_MILK_ROOM.x + FARM_MILK_ROOM.w - 64}
          y={FARM_MILK_ROOM.y + 220}
          width={46}
          height={28}
          stroke={strokeFaint}
        />
        <line
          x1={FARM_MILK_ROOM.x + 50}
          y1={FARM_MILK_ROOM.y}
          x2={FARM_MILK_ROOM.x + 110}
          y2={FARM_MILK_ROOM.y}
          stroke="rgba(33,35,38,1)"
          strokeWidth="2"
        />

        <rect
          x={FARM_ALLEY.x}
          y={FARM_ALLEY.y}
          width={FARM_ALLEY.w}
          height={FARM_ALLEY.h}
          stroke={strokeFaint}
        />
        <line
          x1={FARM_ALLEY.x + 20}
          y1={FARM_ALLEY.y + FARM_ALLEY.h / 2}
          x2={FARM_ALLEY.x + FARM_ALLEY.w - 20}
          y2={FARM_ALLEY.y + FARM_ALLEY.h / 2}
          stroke={strokeFaint}
          strokeDasharray="8 8"
        />
      </g>

      <g
        fill={textFaint}
        fontFamily="var(--font-mono)"
        fontSize="9"
        letterSpacing="0.15em"
      >
        <text
          x={FARM_PASTURE.x + FARM_PASTURE.w / 2}
          y={FARM_PASTURE.y + 24}
          textAnchor="middle"
        >
          PASTURE
        </text>
        <text
          x={FARM_STALLS.x + FARM_STALLS.w / 2}
          y={FARM_STALLS.y + 20}
          textAnchor="middle"
        >
          FREE STALLS
        </text>
        <text
          x={FARM_HOLDING.x + FARM_HOLDING.w / 2}
          y={FARM_HOLDING.y + 20}
          textAnchor="middle"
        >
          HOLDING PEN
        </text>
        <text
          x={FARM_PARLOR.x + FARM_PARLOR.w / 2}
          y={FARM_PARLOR.y + 18}
          textAnchor="middle"
        >
          PARLOR
        </text>
        <text
          x={FARM_CALVES.x + FARM_CALVES.w / 2}
          y={FARM_CALVES.y + 22}
          textAnchor="middle"
        >
          CALF HOUSING
        </text>
        <text
          x={FARM_MILK_ROOM.x + FARM_MILK_ROOM.w / 2}
          y={FARM_MILK_ROOM.y + 22}
          textAnchor="middle"
        >
          MILK ROOM
        </text>
        <text
          x={FARM_ALLEY.x + FARM_ALLEY.w / 2}
          y={FARM_ALLEY.y - 6}
          textAnchor="middle"
        >
          SERVICE ALLEY
        </text>
        <text x="60" y="926">
          ◀ PADDOCK
        </text>
        <text x="940" y="926" textAnchor="end">
          BARN ▶
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
