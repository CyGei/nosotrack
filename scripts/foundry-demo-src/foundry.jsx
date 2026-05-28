// foundry.jsx — Section A: brand intro + Palantir-style stack
//
// Pass 1 changes:
//   • Standardized cabinet projection: skew = depth × 0.16 (top=16, mid=32, bot=16)
//   • Scripted SD1 path so the staff diamond actually visits A3 then crosses to Ward B
//   • Three hospital callouts: index case / staff exposure / cross-ward transmission
//   • Continuous A→B transition: bottom-platform network spins on cue, then
//     the entire foundry stack collapses (scale + fade) toward the logo
//     position (552, 596) while the dashboard expands from that same point.

// ─────────────────────────────────────────────────────────────────────────
// BrandIntro — port of original SceneBrand + end-of-intro network spin
// ─────────────────────────────────────────────────────────────────────────
function BrandIntro() {
  const { localTime: t } = useSprite();

  const segLen = 20;
  const bOff = (i) => segLen * (1 - clamp((t - i * 0.12) / 0.18, 0, 1));

  const netOp = clamp((t - 0.4) / 0.5, 0, 1);

  const dotScale = t < 0.85
    ? 0
    : 1 + (t < 1.05
        ? Easing.easeOutBack((t - 0.85) / 0.2) * 0.3
        : 0.3 * Math.exp(-(t - 1.05) * 4));

  const lockupOp = clamp((t - 1.1) / 0.4, 0, 1);
  const lockupTypeP = clamp((t - 1.2) / 0.6, 0, 1);
  const lockupChars = Math.floor(lockupTypeP * 9);
  const noso = 'NosoTrack'.slice(0, lockupChars);

  const tagOp = clamp((t - 1.9) / 0.4, 0, 1);

  const spinP = clamp((t - 2.3) / 0.7, 0, 1);
  const networkSpin = Easing.easeInOutCubic(spinP) * 360;

  const exitP = t > 3.0 ? clamp((t - 3.0) / 0.5, 0, 1) : 0;
  const exitY = -exitP * 30;
  const exitOp = 1 - exitP;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: exitOp, transform: `translateY(${exitY}px)` }}>
      <FdyChrome />

      <div style={{
        position: 'absolute', left: 640, top: 320,
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      }}>
        <svg width={160} height={160} viewBox="0 0 32 32" fill="none"
          stroke={COLOR.ink} strokeLinecap="square">
          <path d="M3 8 L3 3 L8 3"     strokeWidth="0.8"
            strokeDasharray={segLen} strokeDashoffset={bOff(0)} />
          <path d="M24 3 L29 3 L29 8"  strokeWidth="0.8"
            strokeDasharray={segLen} strokeDashoffset={bOff(1)} />
          <path d="M29 24 L29 29 L24 29" strokeWidth="0.8"
            strokeDasharray={segLen} strokeDashoffset={bOff(2)} />
          <path d="M8 29 L3 29 L3 24"  strokeWidth="0.8"
            strokeDasharray={segLen} strokeDashoffset={bOff(3)} />
          <g transform={`rotate(${networkSpin} 16 16)`} opacity={netOp}>
            <line x1="16" y1="11.2" x2="16" y2="15.6" strokeWidth="0.35" strokeLinecap="round" />
            <line x1="11.31" y1="19.3" x2="15.13" y2="17.1" strokeWidth="0.35" strokeLinecap="round" />
            <line x1="20.69" y1="19.3" x2="16.87" y2="17.1" strokeWidth="0.35" strokeLinecap="round" />
            <circle cx="16" cy="9"    r="2.2" strokeWidth="0.25" />
            <circle cx="9.4" cy="20.4" r="2.2" strokeWidth="0.25" />
            <circle cx="22.6" cy="20.4" r="2.2" strokeWidth="0.25" />
            <circle cx="16" cy="16.6" r={1.05 * dotScale} fill={COLOR.alert} stroke="none" />
          </g>
        </svg>

        <div style={{ height: 64, display: 'flex', alignItems: 'baseline', opacity: lockupOp }}>
          <div style={{
            fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 56,
            letterSpacing: '-0.035em', lineHeight: 1,
          }}>
            <span style={{ color: COLOR.ink }}>{noso.slice(0, 4)}</span>
            <span style={{ color: COLOR.alert }}>{noso.slice(4)}</span>
            <span style={{
              display: 'inline-block', width: 3, height: 48,
              background: COLOR.ink, marginLeft: 4,
              opacity: lockupTypeP < 1 ? 1 : (Math.floor(t * 4) % 2 ? 0.7 : 0),
              verticalAlign: 'middle',
            }} />
          </div>
        </div>

        <div style={{
          opacity: tagOp,
          fontFamily: FONT_MONO, fontSize: 13, letterSpacing: '0.22em',
          textTransform: 'uppercase', color: COLOR.mute,
        }}>
          Outbreak Forensics and Control
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Hospital layout (mid platform)
// ─────────────────────────────────────────────────────────────────────────
const WARDS = {
  A: { x0: 220, x1: 500, y0: 332, y1: 488, label: 'Ward A' },
  B: { x0: 510, x1: 770, y0: 332, y1: 488, label: 'Ward B' },
  C: { x0: 780, x1: 1060, y0: 332, y1: 488, label: 'Ward C' },
};

const ROOM_TOP_Y    = 376;
const ROOM_BOT_Y    = 456;
const ROOM_HEIGHT   = 60;
const ROOM_INSET_X  = 12;
const ROOM_PAT_DX   = [-90, 0, 90];

const PATIENTS = [];
['A', 'B', 'C'].forEach((wardKey) => {
  const w = WARDS[wardKey];
  const wcx = (w.x0 + w.x1) / 2;
  ROOM_PAT_DX.forEach((dx, i) => {
    PATIENTS.push({
      id: `${wardKey}${i + 1}`, ward: wardKey, room: 'top',
      bx: wcx + dx, by: ROOM_TOP_Y,
    });
  });
  ROOM_PAT_DX.forEach((dx, i) => {
    PATIENTS.push({
      id: `${wardKey}${i + 4}`, ward: wardKey, room: 'bot',
      bx: wcx + dx, by: ROOM_BOT_Y,
    });
  });
});
const PATIENT_BY_ID = Object.fromEntries(PATIENTS.map(p => [p.id, p]));

// ─────────────────────────────────────────────────────────────────────────
// Staff motion: SD1 is scripted so it actually visits A3, then crosses to
// Ward B before infecting B2. Other 3 staff use generic wander.
// ─────────────────────────────────────────────────────────────────────────
const SD1_PATH = [
  { t: 0,    x: 280, y: 412 },   // start in Ward A left corridor
  { t: 6,    x: 380, y: 414 },   // drift right
  { t: 9,    x: 460, y: 410 },   // arrive near A3 (Ward A right)
  { t: 11,   x: 470, y: 410 },   // dwell near A3 (gets infected at t=10.5)
  { t: 12,   x: 600, y: 412 },   // crossing to Ward B
  { t: 13,   x: 640, y: 410 },   // arrive at B2 (Ward B middle)
  { t: 15,   x: 660, y: 414 },   // dwell in Ward B
  { t: 21,   x: 660, y: 414 },
];

function sd1Pos(t) {
  if (t <= SD1_PATH[0].t) return [SD1_PATH[0].x, SD1_PATH[0].y];
  for (let i = 0; i < SD1_PATH.length - 1; i++) {
    const a = SD1_PATH[i], b = SD1_PATH[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t;
      const local = span === 0 ? 1 : (t - a.t) / span;
      const eased = Easing.easeInOutQuad(local);
      return [a.x + (b.x - a.x) * eased, a.y + (b.y - a.y) * eased];
    }
  }
  const last = SD1_PATH[SD1_PATH.length - 1];
  return [last.x, last.y];
}

const STAFF_LIST = [
  { id: 'SD1', seed: 0.4, scripted: true },
  { id: 'SD2', seed: 2.1 },
  { id: 'SD3', seed: 3.8 },
  { id: 'SD4', seed: 5.5 },
  { id: 'SD5', seed: 7.2 },
  { id: 'SD6', seed: 8.9 },
];

function staffPos(staff, t) {
  if (staff.scripted) return sd1Pos(t);
  const seed = staff.seed;
  const x = 640 + Math.sin(t * 0.20 + seed) * 360
                + Math.cos(t * 0.07 + seed * 2) * 50;
  const y = 416 + Math.cos(t * 0.55 + seed * 1.3) * 14
                + Math.sin(t * 0.3 + seed) * 6;
  return [clamp(x, 240, 1040), clamp(y, 396, 436)];
}

// Infection chain
const INFECTIONS = [
  { id: 'A3',  t: 7.0,  source: null   },
  { id: 'A1',  t: 8.5,  source: 'A3'   },
  { id: 'A2',  t: 9.5,  source: 'A3'   },
  { id: 'SD1', t: 10.5, source: 'A3'   },
  { id: 'B2',  t: 13.0, source: 'SD1'  },   // bumped a bit later so SD1 has crossed
  { id: 'B1',  t: 14.0, source: 'B2'   },
  { id: 'B3',  t: 15.0, source: 'B2'   },
];
const A3_GOLD_T = 17.5;

function infectionStateAt(t) {
  const state = {};
  PATIENTS.forEach(p => { state[p.id] = { infected: false, gold: false, infT: null }; });
  STAFF_LIST.forEach(s => { state[s.id] = { infected: false, gold: false, infT: null }; });
  INFECTIONS.forEach(ev => {
    if (t >= ev.t) state[ev.id] = { infected: true, gold: false, infT: ev.t };
  });
  if (t >= A3_GOLD_T) state['A3'] = { infected: true, gold: true, infT: 7.0 };
  return state;
}

// Hex color mix utility — used in steady mode to fade reds back to grey.
function mixColor(a, b, t) {
  const pa = a.startsWith('#') ? a.slice(1) : a;
  const pb = b.startsWith('#') ? b.slice(1) : b;
  if (pa.length !== 6 || pb.length !== 6) return a;
  const r1 = parseInt(pa.slice(0, 2), 16), g1 = parseInt(pa.slice(2, 4), 16), b1 = parseInt(pa.slice(4, 6), 16);
  const r2 = parseInt(pb.slice(0, 2), 16), g2 = parseInt(pb.slice(2, 4), 16), b2 = parseInt(pb.slice(4, 6), 16);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const bl = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${bl})`;
}

// ─────────────────────────────────────────────────────────────────────────
// Node helper — ring pulses ONLY at moment of infection, then settles
// (item 4 prep — no perpetual rings on every infected node)
// ─────────────────────────────────────────────────────────────────────────
function FdyNode({ x, y, r, isStaff, infected, gold, infT, t, label, infFade = 0 }) {
  // In steady mode (About 0.2) infFade ramps 0 → 1 near the loop seam,
  // mixing the alert/gold colour back toward the susceptible baseline so
  // the cycle restart is invisible.
  const baseFill = isStaff ? COLOR.staff : COLOR.patient;
  const activeFill = gold ? COLOR.gold : infected ? COLOR.alert : baseFill;
  const activeStroke = gold ? COLOR.gold : infected ? COLOR.alert : COLOR.mute;
  const fill = (infected || gold) && infFade > 0 ? mixColor(activeFill, baseFill, infFade) : activeFill;
  const stroke = (infected || gold) && infFade > 0 ? mixColor(activeStroke, COLOR.mute, infFade) : activeStroke;
  const dim = 1 - infFade;
  // One-shot ring at moment of infection (1.4s window after infT)
  const onsetP = (infected && infT != null && !gold)
    ? clamp((t - infT) / 1.4, 0, 1)
    : 0;
  const showOnset = onsetP > 0 && onsetP < 1;
  const showGoldPulse = gold && infFade < 0.5;
  return (
    <g transform={`translate(${x}, ${y})`}>
      {showOnset && (
        <circle r={6 + onsetP * 14} fill="none"
          stroke={COLOR.alert} strokeWidth="1.2"
          opacity={(1 - onsetP) * dim} />
      )}
      {showGoldPulse && (
        <circle r={14} fill="none" stroke={COLOR.gold} strokeWidth="0.9" opacity={0.7 * dim}>
          <animate attributeName="r" values="12;22;12" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.7;0;0.7" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
      {isStaff ? (
        <polygon points={`0,${-r} ${r},0 0,${r} ${-r},0`}
          fill={fill} stroke={stroke} strokeWidth="1" />
      ) : (
        <circle r={r} fill={fill} stroke={stroke} strokeWidth="1" />
      )}
      {label && (
        <text x="0" y={r + 11} textAnchor="middle"
          fontFamily={FONT_MONO} fontSize="8"
          fill={gold ? COLOR.gold : COLOR.mute} letterSpacing="1.3">{label}</text>
      )}
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Hospital callout — small label with leader line, fades in/out
// ─────────────────────────────────────────────────────────────────────────
function HospitalCallout({ t, startT, duration, x, y, dx, dy, text }) {
  const fadeIn = clamp((t - startT) / 0.4, 0, 1);
  const fadeOut = clamp((t - startT - duration + 0.4) / 0.4, 0, 1);
  const op = fadeIn * (1 - fadeOut);
  if (op < 0.01) return null;
  const tx = x + dx;
  const ty = y + dy;
  return (
    <g opacity={op}>
      <line x1={x} y1={y} x2={tx} y2={ty}
        stroke={COLOR.ink} strokeWidth="0.7" strokeDasharray="2 2" opacity="0.55" />
      <circle cx={x} cy={y} r="2" fill={COLOR.ink} opacity="0.7" />
      <text
        x={tx + (dx >= 0 ? 6 : -6)}
        y={ty + 4}
        fontFamily={FONT_MONO} fontSize="9"
        fill={COLOR.ink} letterSpacing="1.6"
        textAnchor={dx >= 0 ? 'start' : 'end'}
        style={{ textTransform: 'uppercase' }}>
        {text}
      </text>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Platform geometry — standardized cabinet skew = depth × 0.16
// ─────────────────────────────────────────────────────────────────────────
const TOP_Y       = 220;
const MID_Y       = 410;
const BOT_Y       = 600;
const TOP_PLATFORM_W = 260;
const MID_PLATFORM_W = 920;
const BOT_PLATFORM_W = 360;
const TOP_PLATFORM_D = 100;
const MID_PLATFORM_D = 200;
const BOT_PLATFORM_D = 100;
const SKEW_RATIO  = 0.16;
const TOP_SKEW    = Math.round(TOP_PLATFORM_D * SKEW_RATIO);   // 16
const MID_SKEW    = Math.round(MID_PLATFORM_D * SKEW_RATIO);   // 32
const BOT_SKEW    = Math.round(BOT_PLATFORM_D * SKEW_RATIO);   // 16

const LOGO_X = 552;
const LOGO_Y = 596;

function FoundryStack({ mode = 'default' }) {
  const { localTime: rawT } = useSprite();

  // ── Steady mode (About 0.2: integration loop) ──
  // Skip the build-up and the collapse-to-dashboard exit. Loop the
  // infection chain on a 22 s cycle, offset so reds appear immediately
  // and fade back to grey near the loop seam. No robot, no bubble.
  const STEADY_CYCLE = 22;
  const STEADY_OFFSET = 6;   // shifts the chain so A3 infects at stage t≈1
  const STEADY_FADE_START = 18;
  const STEADY_FADE_END   = STEADY_CYCLE;
  const steady = mode === 'steady';
  const t = steady ? ((rawT + STEADY_OFFSET) % STEADY_CYCLE) : rawT;

  // Reveal progresses — in steady mode everything is at 1 from the start.
  const headerOp        = steady ? 1 : clamp(t / 0.6, 0, 1);
  const topPlatformsP   = steady ? 1 : clamp((t - 0.8) / 1.4, 0, 1);
  const topIconsP       = steady ? 1 : clamp((t - 2.0) / 1.0, 0, 1);
  const flowTopP        = steady ? 1 : clamp((t - 2.8) / 1.4, 0, 1);
  const midPlatformP    = steady ? 1 : clamp((t - 3.6) / 1.4, 0, 1);
  const wardsP          = steady ? 1 : clamp((t - 4.8) / 1.0, 0, 1);
  const dotsP           = steady ? 1 : clamp((t - 5.6) / 1.4, 0, 1);
  const bottomPlatformP = steady ? 1 : clamp((t - 13.5) / 1.4, 0, 1);
  const flowBottomP     = steady ? 1 : clamp((t - 14.3) / 1.2, 0, 1);
  // No alert in steady mode — the alert is the moment the user clicks
  // through to 0.3.
  const robotApppearP   = steady ? 0 : clamp((t - 15.0) / 0.8, 0, 1);
  const bubbleP         = steady ? 0 : clamp((t - 16.0) / 1.0, 0, 1);
  const goldP           = clamp((t - A3_GOLD_T) / 1.2, 0, 1);

  const bubbleText = 'Superspreader detected: Patient A3';
  const bubbleChars = Math.floor(clamp((t - 16.3) / 2.2, 0, 1) * bubbleText.length);

  // ── Continuous transition (default mode only) ──
  // At total time ≈ 24.5 (= localTime 21) the cursor (in DashboardScene)
  // clicks the bottom logo. We trigger the network spin and the collapse
  // in lockstep so this scene's exit is the dashboard's entrance.
  const bottomLogoSpin = steady
    ? 0
    : (t > 21 ? Easing.easeInOutCubic(clamp((t - 21) / 1.0, 0, 1)) * 360 : 0);
  const collapseP    = steady ? 0 : clamp((t - 22) / 1.5, 0, 1);
  const collapseScale = 1 - collapseP * 0.95;
  const collapseOp    = 1 - collapseP;

  // Fade reds back to grey near the end of the steady cycle so the loop
  // seam is invisible. Applied to FdyNode below via the infFade prop.
  const infFade = steady
    ? clamp((t - STEADY_FADE_START) / (STEADY_FADE_END - STEADY_FADE_START), 0, 1)
    : 0;

  const infState = infectionStateAt(t);

  const topPlatforms = [
    { id: 'ehr',  cx: 320,  label: 'Electronic Health Records' },
    { id: 'lab',  cx: 640,  label: 'Diagnostic Lab' },
    { id: 'hw',   cx: 960,  label: 'Hardware Tracking' },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Chrome stays fixed at top-left during collapse, fades with collapse */}
      <div style={{ opacity: 1 - collapseP }}>
        <FdyChrome chapter="Integration" />
      </div>

      {/* Everything visual collapses toward (LOGO_X, LOGO_Y) */}
      <div style={{
        position: 'absolute', inset: 0,
        opacity: collapseOp,
        transform: `scale(${collapseScale})`,
        transformOrigin: `${LOGO_X}px ${LOGO_Y}px`,
        willChange: 'transform, opacity',
      }}>
        {/* Centered NosoTrack header */}
        <div style={{
          position: 'absolute', left: '50%', top: 80,
          transform: `translateX(-50%) translateY(${(1 - headerOp) * -8}px)`,
          opacity: headerOp,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <FdyBrandMark size={26} pulse />
          <FdyWordmark size={28} />
        </div>

        {/* Main SVG canvas */}
        <svg width="1280" height="720" viewBox="0 0 1280 720"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>

          {/* ========== TOP PLATFORMS ========== */}
          {topPlatforms.map((p, i) => {
            const reveal = clamp((t - 0.8 - i * 0.15) / 1.0, 0, 1);
            const eased = Easing.easeOutCubic(reveal);
            return (
              <g key={p.id}
                opacity={eased}
                transform={`translate(0, ${(1 - eased) * -16})`}>
                <FdyPlatform
                  cx={p.cx} cy={TOP_Y}
                  w={TOP_PLATFORM_W} d={TOP_PLATFORM_D}
                  skew={TOP_SKEW}
                  fill="#ffffff"
                />
                <text x={p.cx} y={TOP_Y + TOP_PLATFORM_D / 2 + 28}
                  textAnchor="middle"
                  fontFamily={FONT_MONO} fontSize="10"
                  fill={COLOR.ink}
                  style={{ textTransform: 'uppercase', letterSpacing: '2.5px' }}>
                  {p.label}
                </text>
              </g>
            );
          })}

          {/* Top platform vizzes (uniform 200×60 box at platform center) */}
          {topIconsP > 0 && (
            <g opacity={topIconsP}>
              <foreignObject x={320 - 100} y={TOP_Y - 30} width="200" height="60">
                <div xmlns="http://www.w3.org/1999/xhtml"
                  style={{ width: '200px', height: '60px', overflow: 'hidden' }}>
                  <FdyEHRViz t={t - 2.0} w={200} h={60} bg="#ffffff" />
                </div>
              </foreignObject>
              <foreignObject x={640 - 100} y={TOP_Y - 30} width="200" height="60">
                <div xmlns="http://www.w3.org/1999/xhtml"
                  style={{ width: '200px', height: '60px', overflow: 'hidden' }}>
                  <FdyDNAViz t={t - 2.0} w={200} h={60} />
                </div>
              </foreignObject>
              <BluetoothCard t={t - 2.0} cx={960} cy={TOP_Y} />
            </g>
          )}

          {/* Flow lines: top → mid */}
          {topPlatforms.map((p, i) => (
            <FdyFlow key={p.id + 'f'}
              from={[p.cx, TOP_Y + TOP_PLATFORM_D / 2 + 6]}
              to={[p.cx - 60 + i * 60, MID_Y - MID_PLATFORM_D / 2 - 4]}
              progress={flowTopP}
              color={COLOR.ruleStrong}
              curve={0.45}
            />
          ))}

          {/* ========== MID PLATFORM — Hospital ========== */}
          <g opacity={midPlatformP} transform={`translate(0, ${(1 - midPlatformP) * 12})`}>
            <FdyPlatform
              cx={640} cy={MID_Y}
              w={MID_PLATFORM_W} d={MID_PLATFORM_D}
              skew={MID_SKEW}
              fill="#ffffff"
            />
            <text x={640} y={MID_Y + MID_PLATFORM_D / 2 + 28}
              textAnchor="middle"
              fontFamily={FONT_MONO} fontSize="10"
              fill={COLOR.ink}
              style={{ textTransform: 'uppercase', letterSpacing: '2.5px' }}>
              Healthcare Facility
            </text>

            {Object.entries(WARDS).map(([key, w], i) => {
              const reveal = clamp((wardsP - i * 0.12) * 1.5, 0, 1);
              return (
                <g key={key} opacity={reveal}>
                  <rect x={w.x0} y={w.y0} width={w.x1 - w.x0} height={w.y1 - w.y0}
                    fill={COLOR.wardTint}
                    stroke={COLOR.wardLine}
                    strokeWidth="0.7"
                    strokeDasharray="2 3" />
                  <text x={w.x0 + 8} y={w.y0 + 14}
                    fontFamily={FONT_MONO} fontSize="9"
                    fill={COLOR.ink} letterSpacing="2.2"
                    style={{ textTransform: 'uppercase' }}>
                    {w.label}
                  </text>

                  {['top', 'bot'].map((room) => {
                    const cy = room === 'top' ? ROOM_TOP_Y : ROOM_BOT_Y;
                    return (
                      <rect key={room}
                        x={w.x0 + ROOM_INSET_X}
                        y={cy - ROOM_HEIGHT / 2}
                        width={(w.x1 - w.x0) - ROOM_INSET_X * 2}
                        height={ROOM_HEIGHT}
                        rx="3"
                        fill="#fff"
                        stroke={COLOR.ruleStrong}
                        strokeWidth="0.7" />
                    );
                  })}
                </g>
              );
            })}

            {/* Patients */}
            {dotsP > 0 && PATIENTS.map((p, i) => {
              const reveal = clamp((dotsP - (i % 6) * 0.04) * 1.4, 0, 1);
              const seed = i * 1.3;
              const ox = Math.sin(t * 0.6 + seed) * 0.7;
              const oy = Math.cos(t * 0.7 + seed) * 0.7;
              const inf = infState[p.id];
              const showLabel = p.id === 'A3' && goldP > 0.2;
              return (
                <g key={p.id} opacity={reveal}>
                  <FdyNode
                    x={p.bx + ox} y={p.by + oy}
                    r={6}
                    isStaff={false}
                    infected={inf.infected}
                    gold={inf.gold}
                    infT={inf.infT}
                    t={t}
                    label={showLabel ? p.id : null}
                    infFade={infFade}
                  />
                </g>
              );
            })}

            {/* Staff diamonds */}
            {dotsP > 0 && STAFF_LIST.map((s, i) => {
              const reveal = clamp((dotsP - 0.4 - i * 0.08) * 1.4, 0, 1);
              const [x, y] = staffPos(s, t);
              const inf = infState[s.id];
              return (
                <g key={s.id} opacity={reveal}>
                  <FdyNode
                    x={x} y={y}
                    r={7}
                    isStaff={true}
                    infected={inf.infected}
                    gold={inf.gold}
                    infT={inf.infT}
                    t={t}
                    infFade={infFade}
                  />
                </g>
              );
            })}

          </g>

          {/* Flow lines: mid → bottom */}
          <FdyFlow
            from={[640 - 60, MID_Y + MID_PLATFORM_D / 2 + 6]}
            to={[640 - 30, BOT_Y - BOT_PLATFORM_D / 2 - 4]}
            progress={flowBottomP}
            color={COLOR.ruleStrong}
            curve={0.5}
          />
          <FdyFlow
            from={[640 + 60, MID_Y + MID_PLATFORM_D / 2 + 6]}
            to={[640 + 30, BOT_Y - BOT_PLATFORM_D / 2 - 4]}
            progress={flowBottomP}
            color={COLOR.ruleStrong}
            curve={0.5}
          />

          {/* ========== BOTTOM PLATFORM — NosoTrack ========== */}
          <g opacity={bottomPlatformP}
            transform={`translate(0, ${(1 - bottomPlatformP) * 14})`}>
            <FdyPlatform
              cx={640} cy={BOT_Y}
              w={BOT_PLATFORM_W} d={BOT_PLATFORM_D}
              skew={BOT_SKEW}
              fill="#ffffff"
            />
            <text x={640} y={BOT_Y + BOT_PLATFORM_D / 2 + 28}
              textAnchor="middle"
              fontFamily={FONT_MONO} fontSize="10"
              fill={COLOR.ink}
              style={{ textTransform: 'uppercase', letterSpacing: '2.5px' }}>
              Outbreak Analytics
            </text>
          </g>
        </svg>

        {/* Bottom platform overlays */}
        {bottomPlatformP > 0 && (
          <React.Fragment>
            <div style={{
              position: 'absolute',
              left: LOGO_X, top: LOGO_Y - 16,
              opacity: bottomPlatformP,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <FdyBrandMark size={28} pulse networkSpin={bottomLogoSpin} />
              <FdyWordmark size={18} />
            </div>

            {robotApppearP > 0 && (
              <div style={{
                position: 'absolute',
                left: 640 + 70, top: BOT_Y - 24,
                opacity: robotApppearP,
                transform: `scale(${0.8 + robotApppearP * 0.2})`,
                transformOrigin: 'left center',
              }}>
                <FdyRobot size={48} glowing accent={COLOR.ink} />
              </div>
            )}

            {bubbleP > 0 && bubbleChars > 0 && (
              <div style={{
                position: 'absolute',
                left: 640 + 130, top: BOT_Y - 36,
                opacity: bubbleP,
                padding: '10px 14px',
                background: '#fff',
                border: `1px solid ${COLOR.ruleStrong}`,
                borderRadius: 8,
                fontFamily: FONT_MONO, fontSize: 11,
                color: COLOR.ink,
                maxWidth: 320,
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                transform: `translateY(${(1 - bubbleP) * 6}px)`,
                letterSpacing: '0.04em',
              }}>
                <div style={{
                  position: 'absolute', left: -7, top: 14,
                  width: 14, height: 14,
                  background: '#fff',
                  borderLeft: `1px solid ${COLOR.ruleStrong}`,
                  borderBottom: `1px solid ${COLOR.ruleStrong}`,
                  transform: 'rotate(45deg)',
                }} />
                <span>{bubbleText.slice(0, bubbleChars)}</span>
                {bubbleChars < bubbleText.length && (
                  <span style={{ color: COLOR.alert }}>▌</span>
                )}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// BluetoothCard — 3 glyphs (middle red, sides grey) connected by dashed
// lines, occupying the same 200×60 viz box as EHR/Lab cards.
// ─────────────────────────────────────────────────────────────────────────
function BluetoothCard({ t, cx, cy }) {
  const positions = [
    [cx - 70, cy - 12],
    [cx,      cy + 18],
    [cx + 70, cy - 12],
  ];
  const pulses = positions.map((_, i) => {
    const phase = ((t - i * 0.3) % 1.6) / 1.6;
    return clamp(phase, 0, 1);
  });
  return (
    <g>
      {positions.map((from, i) => {
        const to = positions[(i + 1) % 3];
        const phase = ((t * 0.7 + i * 0.4) % 1.0);
        return (
          <line key={i}
            x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}
            stroke={COLOR.mute}
            strokeWidth="0.9"
            strokeDasharray="3 4"
            strokeDashoffset={-phase * 14}
            opacity="0.55" />
        );
      })}
      {positions.map((p, i) => {
        const isMiddle = i === 1;
        return (
          <FdyBluetooth key={i}
            cx={p[0]} cy={p[1]}
            size={20}
            color={isMiddle ? COLOR.alert : COLOR.mute}
            pulse={pulses[i]} />
        );
      })}
    </g>
  );
}

Object.assign(window, {
  BrandIntro, FoundryStack,
  FOUNDRY_PATIENTS: PATIENTS,
  FOUNDRY_STAFF: STAFF_LIST,
  FOUNDRY_WARDS: WARDS,
  FOUNDRY_INFECTIONS: INFECTIONS,
  FOUNDRY_SUPERSPREADER_ID: 'A3',
});
