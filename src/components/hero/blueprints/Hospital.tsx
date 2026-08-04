import type { CSSProperties } from "react";

type Props = { className?: string; style?: CSSProperties };

const TOP_ROOM_W = 102;
const TOP_ROOM_GAP = 4;
const TOP_ROOM_START_X = 75;
export const HOSP_NORTH_Y = 80;
export const HOSP_NORTH_H = 130;
export const HOSP_SOUTH_Y = 290;
export const HOSP_SOUTH_H = 130;
export const HOSP_TOP_ROOMS = 8;
export const hospTopX = (i: number) =>
  TOP_ROOM_START_X + i * (TOP_ROOM_W + TOP_ROOM_GAP);
export const HOSP_TOP_ROOM_W = TOP_ROOM_W;

const LW_ROOM_H = 80;
const LW_ROOM_GAP = 4;
const LW_ROOM_START_Y = 500;
export const HOSP_LEFT_ROOMS = 5;
export const hospLeftY = (i: number) =>
  LW_ROOM_START_Y + i * (LW_ROOM_H + LW_ROOM_GAP);
export const HOSP_WEST_X = 75;
export const HOSP_WEST_W = 135;
export const HOSP_EAST_X = 280;
export const HOSP_EAST_W = 200;
export const HOSP_LW_ROOM_H = LW_ROOM_H;

export function HospitalBlueprint({ className, style }: Props) {
  const stroke = "rgba(239,238,239,0.34)";
  const strokeFaint = "rgba(239,238,239,0.16)";
  const textFaint = "rgba(239,238,239,0.34)";

  const shell =
    "M 60 60 L 940 60 L 940 480 L 480 480 L 480 940 L 60 940 Z";
  const shellInner =
    "M 70 70 L 930 70 L 930 470 L 470 470 L 470 930 L 70 930 Z";

  const topIds = Array.from({ length: HOSP_TOP_ROOMS }, (_, i) => i);
  const leftIds = Array.from({ length: HOSP_LEFT_ROOMS }, (_, i) => i);

  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <g
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        strokeLinecap="square"
        strokeLinejoin="miter"
        vectorEffect="non-scaling-stroke"
      >
        <path d={shell} />
        <path d={shellInner} stroke={strokeFaint} />

        <line x1="60" y1="220" x2="940" y2="220" />
        <line x1="60" y1="270" x2="940" y2="270" />

        <line x1="220" y1="270" x2="220" y2="940" />
        <line x1="270" y1="270" x2="270" y2="940" />

        <line x1="220" y1="220" x2="270" y2="220" />

        {topIds.map((i) => {
          const x = hospTopX(i);
          return (
            <g key={`N-${i}`}>
              <rect x={x} y={HOSP_NORTH_Y} width={TOP_ROOM_W} height={HOSP_NORTH_H} />
              <line
                x1={x + 12}
                y1={220}
                x2={x + TOP_ROOM_W / 2 - 14}
                y2={220}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <line
                x1={x + TOP_ROOM_W / 2 + 14}
                y1={220}
                x2={x + TOP_ROOM_W - 12}
                y2={220}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <rect
                x={x + TOP_ROOM_W - 26}
                y={HOSP_NORTH_Y + 6}
                width="20"
                height="22"
                stroke={strokeFaint}
              />
            </g>
          );
        })}

        {topIds.map((i) => {
          const x = hospTopX(i);
          return (
            <g key={`S-${i}`}>
              <rect x={x} y={HOSP_SOUTH_Y} width={TOP_ROOM_W} height={HOSP_SOUTH_H} />
              <line
                x1={x + 12}
                y1={270}
                x2={x + TOP_ROOM_W / 2 - 14}
                y2={270}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <line
                x1={x + TOP_ROOM_W / 2 + 14}
                y1={270}
                x2={x + TOP_ROOM_W - 12}
                y2={270}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <rect
                x={x + TOP_ROOM_W - 26}
                y={HOSP_SOUTH_Y + HOSP_SOUTH_H - 28}
                width="20"
                height="22"
                stroke={strokeFaint}
              />
            </g>
          );
        })}

        {leftIds.map((i) => {
          const y = hospLeftY(i);
          return (
            <g key={`W-${i}`}>
              <rect x={HOSP_WEST_X} y={y} width={HOSP_WEST_W} height={LW_ROOM_H} />
              <line
                x1={220}
                y1={y + 12}
                x2={220}
                y2={y + LW_ROOM_H / 2 - 12}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <line
                x1={220}
                y1={y + LW_ROOM_H / 2 + 12}
                x2={220}
                y2={y + LW_ROOM_H - 12}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <rect
                x={HOSP_WEST_X + 6}
                y={y + LW_ROOM_H - 22}
                width="22"
                height="16"
                stroke={strokeFaint}
              />
            </g>
          );
        })}

        {leftIds.map((i) => {
          const y = hospLeftY(i);
          return (
            <g key={`E-${i}`}>
              <rect x={HOSP_EAST_X} y={y} width={HOSP_EAST_W} height={LW_ROOM_H} />
              <line
                x1={270}
                y1={y + 12}
                x2={270}
                y2={y + LW_ROOM_H / 2 - 12}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <line
                x1={270}
                y1={y + LW_ROOM_H / 2 + 12}
                x2={270}
                y2={y + LW_ROOM_H - 12}
                stroke="rgba(33,35,38,1)"
                strokeWidth="2"
              />
              <rect
                x={HOSP_EAST_X + HOSP_EAST_W - 26}
                y={y + 4}
                width="20"
                height="16"
                stroke={strokeFaint}
              />
              <rect
                x={HOSP_EAST_X + HOSP_EAST_W - 26}
                y={y + LW_ROOM_H - 20}
                width="20"
                height="16"
                stroke={strokeFaint}
              />
            </g>
          );
        })}

        <rect x={520} y={500} width={70} height={70} stroke={strokeFaint} />
        <line x1={520} y1={535} x2={590} y2={535} stroke={strokeFaint} />
        <line x1={555} y1={500} x2={555} y2={570} stroke={strokeFaint} />

        <rect x={850} y={500} width={80} height={70} stroke={strokeFaint} />
        <line x1={890} y1={500} x2={890} y2={570} stroke={strokeFaint} />
      </g>

      <g fontFamily="var(--font-mono)">
        <text
          x="60"
          y="52"
          fontSize="18"
          fontWeight="500"
          letterSpacing="0.12em"
          fill="rgba(239,238,239,0.95)"
        >
          ACUTE CARE HOSPITAL
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
          WARD A
          <tspan fill="rgba(239,238,239,0.22)">{"  ·  "}</tspan>
          LEVEL 3
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
