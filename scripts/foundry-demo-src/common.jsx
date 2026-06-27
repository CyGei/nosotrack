// common.jsx — Shared design helpers for the Nosotrack Foundry demo

const COLOR = {
  bg:        '#fafafa',
  bgAlt:     '#f3f3f1',
  ink:       '#1e1e2b',
  text:      '#474852',
  mute:      '#767676',
  faint:     '#a4a4a7',
  rule:      'rgba(30,30,43,.10)',
  ruleStrong:'rgba(30,30,43,.22)',
  alert:     '#ff073a',
  alertDim:  'rgba(255,7,58,.12)',
  gold:      '#f5b301',
  goldGlow:  'rgba(245,179,1,.45)',
  panel:     '#ffffff',
  panelLine: 'rgba(30,30,43,.20)',
  ward:      '#eceae6',
  wardLine:  'rgba(30,30,43,.18)',
  wardTint:  'rgba(30,30,43,.04)',  // unified light grey for all wards
  patient:   '#bfbfbe',             // susceptible patient (round, grey)
  staff:     '#a4a4a7',             // susceptible staff (diamond, grey)
};

const FONT_DISPLAY = "'Inter Tight', 'Helvetica Neue', Arial, sans-serif";
const FONT_MONO    = "'JetBrains Mono', ui-monospace, monospace";

// ─────────────────────────────────────────────────────────────────────────
// Brand mark — brackets stay fixed, inner NETWORK rotates as a unit
// (mirrors nosotrack.com/styles.css .brand-mark-network on hover)
// ─────────────────────────────────────────────────────────────────────────
function FdyBrandMark({
  size = 24,
  dotColor = COLOR.alert,
  networkSpin = 0,         // degrees, applied to the inner network only
  pulse = false,
  bracketReveal = 1,       // 0..1 — for intro bracket draw-on (4 sequential)
}) {
  // For each bracket, dasharray reveal driven by bracketReveal (0..1, full at 1)
  const segLen = 20;
  const off = (i) => segLen * (1 - clamp((bracketReveal - i * 0.18) / 0.34, 0, 1));
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none"
      stroke={COLOR.ink} strokeLinecap="square">
      {/* Brackets — fixed, no rotation */}
      <path d="M3 8 L3 3 L8 3" strokeWidth="1.4"
        strokeDasharray={segLen} strokeDashoffset={off(0)} />
      <path d="M24 3 L29 3 L29 8" strokeWidth="1.4"
        strokeDasharray={segLen} strokeDashoffset={off(1)} />
      <path d="M29 24 L29 29 L24 29" strokeWidth="1.4"
        strokeDasharray={segLen} strokeDashoffset={off(2)} />
      <path d="M8 29 L3 29 L3 24" strokeWidth="1.4"
        strokeDasharray={segLen} strokeDashoffset={off(3)} />

      {/* Inner network — rotates around viewBox center (16, 16) */}
      <g transform={`rotate(${networkSpin} 16 16)`}>
        <line x1="16" y1="11.2" x2="16" y2="15.6" strokeWidth="0.6" strokeLinecap="round" />
        <line x1="11.31" y1="19.3" x2="15.13" y2="17.1" strokeWidth="0.6" strokeLinecap="round" />
        <line x1="20.69" y1="19.3" x2="16.87" y2="17.1" strokeWidth="0.6" strokeLinecap="round" />
        <circle cx="16" cy="9" r="2.2" strokeWidth="0.4" />
        <circle cx="9.4" cy="20.4" r="2.2" strokeWidth="0.4" />
        <circle cx="22.6" cy="20.4" r="2.2" strokeWidth="0.4" />
        <circle cx="16" cy="16.6" r={pulse ? 1.4 : 1.05} fill={dotColor} stroke="none">
          {pulse && <animate attributeName="r" values="1.05;1.6;1.05" dur="1.2s" repeatCount="indefinite" />}
        </circle>
      </g>
    </svg>
  );
}

// "Nosotrack" wordmark
function FdyWordmark({ size = 24 }) {
  return (
    <span style={{
      fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: size,
      letterSpacing: '-0.03em', lineHeight: 1, whiteSpace: 'nowrap',
    }}>
      <span style={{ color: COLOR.ink }}>Noso</span>
      <span style={{ color: COLOR.alert }}>track</span>
    </span>
  );
}

// Robot character — grey/ink (was red before; now neutral)
function FdyRobot({ size = 36, glowing = false, accent = COLOR.ink }) {
  const fill = 'rgba(30,30,43,0.06)';
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect x="11" y="12" width="22" height="16" rx="3.5"
        stroke={accent} strokeWidth="1.3" fill={fill} />
      <circle cx="18" cy="19" r="2.3" stroke={accent} strokeWidth="1" fill="rgba(30,30,43,0.10)" />
      <circle cx="26" cy="19" r="2.3" stroke={accent} strokeWidth="1" fill="rgba(30,30,43,0.10)" />
      <circle cx="18" cy="19" r="0.95" fill={accent} />
      <circle cx="26" cy="19" r="0.95" fill={accent} />
      <line x1="19" y1="25" x2="25" y2="25" stroke={accent} strokeWidth="0.9" opacity="0.5" strokeLinecap="round" />
      <line x1="22" y1="12" x2="22" y2="6.5" stroke={accent} strokeWidth="1" opacity="0.7" />
      <circle cx="22" cy="5" r="1.5" fill={accent} opacity={glowing ? 1 : 0.7}>
        {glowing && <animate attributeName="opacity" values="0.5;1;0.5" dur="0.9s" repeatCount="indefinite" />}
      </circle>
    </svg>
  );
}

// Animated cursor (arrow pointer with optional click ring)
function FdyCursor({ x, y, clicking = false, hidden = false }) {
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: 22, height: 24,
      pointerEvents: 'none',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.18))',
      opacity: hidden ? 0 : 1,
      transition: 'opacity 200ms',
      zIndex: 100,
    }}>
      <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
        <path d="M2 2 L2 17.5 L7 13.5 L10 21 L13.5 19.6 L10.5 12.5 L17.5 12.5 Z"
          fill="#fff" stroke={COLOR.ink} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      {clicking && (
        <div style={{
          position: 'absolute', left: -10, top: -6,
          width: 36, height: 36,
          border: `2px solid ${COLOR.alert}`,
          borderRadius: '50%',
          transform: 'scale(0.4)',
          opacity: 0.7,
          animation: 'fdyRingOut 0.45s ease-out forwards',
        }} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Isometric platform — parallelogram top + thin front strip for depth
// (NO shadow underneath, per request)
// ─────────────────────────────────────────────────────────────────────────
function FdyPlatform({
  cx, cy, w, d = 56,
  skew = 22,
  fill = '#ffffff',
  strokeColor = COLOR.ruleStrong,
  strokeW = 1,
  children,
}) {
  const halfW = w / 2;
  const halfD = d / 2;
  const bL = [cx - halfW + skew, cy - halfD];
  const bR = [cx + halfW + skew, cy - halfD];
  const fR = [cx + halfW - skew, cy + halfD];
  const fL = [cx - halfW - skew, cy + halfD];
  const top = `${bL.join(',')} ${bR.join(',')} ${fR.join(',')} ${fL.join(',')}`;
  const depth = 8;
  const fLb = [fL[0], fL[1] + depth];
  const fRb = [fR[0], fR[1] + depth];
  const front = `${fL.join(',')} ${fR.join(',')} ${fRb.join(',')} ${fLb.join(',')}`;
  const bRb = [bR[0], bR[1] + depth];
  const right = `${bR.join(',')} ${fR.join(',')} ${fRb.join(',')} ${bRb.join(',')}`;
  return (
    <g>
      <polygon points={right} fill="#ececea" stroke={strokeColor} strokeWidth={strokeW * 0.7} />
      <polygon points={front} fill="#f3f2ef" stroke={strokeColor} strokeWidth={strokeW * 0.7} />
      <polygon points={top} fill={fill} stroke={strokeColor} strokeWidth={strokeW} />
      {children}
    </g>
  );
}

// Dashed flow line connecting two platforms
function FdyFlow({ from, to, progress = 1, color = COLOR.ruleStrong, dashed = true, curve = 0.5 }) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const dy = (y2 - y1) * curve;
  const c1x = x1, c1y = y1 + dy;
  const c2x = x2, c2y = y2 - dy;
  const d = `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`;
  return (
    <g>
      <path d={d}
        stroke={color}
        strokeWidth="1"
        fill="none"
        strokeDasharray={dashed ? "4 5" : "0"}
        strokeDashoffset={dashed ? -((1 - progress) * 24) : 0}
        opacity={progress * 0.7}
        style={{ animation: dashed && progress > 0.1 ? 'fdyDash 1.4s linear infinite' : 'none' }}
      />
      {progress > 0.4 && (
        <circle cx={x2} cy={y2} r="2" fill={color} opacity={progress} />
      )}
    </g>
  );
}

// Chrome (top-left brand label, top-right caption, corner crosshairs)
function FdyChrome({ chapter, label }) {
  return (
    <React.Fragment>
      <div style={{
        position: 'absolute', left: 48, top: 36,
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: COLOR.ink,
      }}>
        <FdyBrandMark size={18} />
        <FdyWordmark size={14} />
        {chapter && <span style={{ color: COLOR.faint }}>/</span>}
        {chapter && <span style={{ color: COLOR.mute }}>{chapter}</span>}
      </div>
      {label && (
        <div style={{
          position: 'absolute', right: 48, top: 36,
          fontFamily: FONT_MONO, fontSize: 11, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: COLOR.mute,
        }}>{label}</div>
      )}
      <FdyCorner x={28} y={28} dx={1} dy={1} />
      <FdyCorner x={1252} y={28} dx={-1} dy={1} />
      <FdyCorner x={28} y={692} dx={1} dy={-1} />
      <FdyCorner x={1252} y={692} dx={-1} dy={-1} />
    </React.Fragment>
  );
}

function FdyCorner({ x, y, dx, dy, len = 8 }) {
  return (
    <svg width={20} height={20} style={{ position: 'absolute', left: x - 10, top: y - 10, overflow: 'visible' }}>
      <path d={`M 10 ${10 + dy * len} L 10 10 L ${10 + dx * len} 10`}
        stroke={COLOR.ink} strokeWidth={1} fill="none" strokeLinecap="square" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Bluetooth glyph (the angular B)
// ─────────────────────────────────────────────────────────────────────────
function FdyBluetooth({ cx, cy, size = 28, color = COLOR.ink, opacity = 1, pulse = 0 }) {
  // viewBox 32×32 → scale to size
  const s = size / 32;
  const halfS = size / 2;
  // Pulse ring radius (animated via parent passing pulse 0..1)
  const ringR = halfS * (0.9 + pulse * 0.7);
  const ringOp = (1 - pulse) * 0.55;
  return (
    <g transform={`translate(${cx}, ${cy})`} opacity={opacity}>
      {/* Pulse halo */}
      {pulse > 0 && (
        <circle r={ringR} fill="none" stroke={color} strokeWidth="1" opacity={ringOp} />
      )}
      {/* Bluetooth glyph */}
      <g transform={`scale(${s})`}>
        <path
          d="M 16 4 L 16 28 M 16 4 L 24 12 L 8 20 M 16 28 L 24 20 L 8 12"
          stroke={color}
          strokeWidth="2.6"
          fill="none"
          strokeLinejoin="round"
          strokeLinecap="round"
          transform="translate(-16, -16)"
        />
      </g>
    </g>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// DNAViz — sliding helix bars (ported from /Users/cy/Downloads/Nosotrack)
// Used on the Diagnostic Lab platform (genomic sequencing card)
// ─────────────────────────────────────────────────────────────────────────
function FdyDNAViz({ t, w = 200, h = 70 }) {
  const bars = 14;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {Array.from({ length: bars }).map((_, i) => {
        const x = (i / bars) * w + 4;
        const phase = t * 1.5 + i * 0.4;
        const y1 = h / 2 + Math.sin(phase) * (h * 0.32);
        const y2 = h / 2 - Math.sin(phase) * (h * 0.32);
        const isAlert = i === Math.floor((t * 4) % bars);
        return (
          <g key={i}>
            <line x1={x} y1={y1} x2={x} y2={y2}
              stroke={isAlert ? COLOR.alert : COLOR.ink}
              strokeOpacity={isAlert ? 1 : 0.4}
              strokeWidth={1.1} />
            <circle cx={x} cy={y1} r="1.7" fill={isAlert ? COLOR.alert : COLOR.ink} fillOpacity={isAlert ? 1 : 0.55} />
            <circle cx={x} cy={y2} r="1.7" fill={isAlert ? COLOR.alert : COLOR.ink} fillOpacity={isAlert ? 1 : 0.55} />
          </g>
        );
      })}
      {/* Sequence label */}
      <text x="4" y={h - 4} fontFamily={FONT_MONO} fontSize="7" fill={COLOR.mute}
        letterSpacing="1.6">A·T·C·G·G·A·T·T·C·A</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// EHRViz — animated table-like rows scrolling
// Used on the EHR (Electronic Health Records) platform
// `bg` masks the scrolling rows behind the header (defaults to white to
// match the platform top).
// ─────────────────────────────────────────────────────────────────────────
function FdyEHRViz({ t, w = 200, h = 70, bg = '#ffffff' }) {
  const rows = [
    ['P-1043', 'WARD-C', '→'],
    ['P-1102', 'WARD-A', 'POS'],
    ['P-0998', 'WARD-B', 'NEG'],
    ['P-1156', 'ICU',    'ADM'],
    ['P-1077', 'WARD-C', 'DIS'],
  ];
  const offset = (t * 14) % 22;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <clipPath id="fdyEhrClip">
          <rect x="0" y="0" width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath="url(#fdyEhrClip)">
        {rows.map((row, i) => {
          const y = 14 + i * 18 - offset;
          return (
            <g key={i} transform={`translate(0, ${y})`}>
              <rect x="0" y="-10" width={w} height="16"
                fill={i % 2 ? 'rgba(30,30,43,0.04)' : 'transparent'} />
              {row.map((cell, j) => {
                const cx = [6, 60, 130][j];
                const isStatus = j === 2;
                const color = isStatus && cell === 'POS' ? COLOR.alert : COLOR.ink;
                const op = isStatus && cell === 'POS' ? 1 : 0.7;
                return (
                  <text key={j} x={cx} y={2} fontFamily={FONT_MONO} fontSize="8"
                    fill={color} fillOpacity={op} letterSpacing="0.4">{cell}</text>
                );
              })}
            </g>
          );
        })}
      </g>
      {/* Header */}
      <rect x="0" y="0" width={w} height="11" fill={bg} />
      <text x="6"  y="8" fontFamily={FONT_MONO} fontSize="6.5" fill={COLOR.mute} letterSpacing="1.2">PATIENT</text>
      <text x="60" y="8" fontFamily={FONT_MONO} fontSize="6.5" fill={COLOR.mute} letterSpacing="1.2">WARD</text>
      <text x="130" y="8" fontFamily={FONT_MONO} fontSize="6.5" fill={COLOR.mute} letterSpacing="1.2">EVENT</text>
      <line x1="0" y1="11" x2={w} y2="11" stroke={COLOR.ruleStrong} />
    </svg>
  );
}

Object.assign(window, {
  COLOR, FONT_DISPLAY, FONT_MONO,
  FdyBrandMark, FdyWordmark, FdyRobot, FdyCursor,
  FdyPlatform, FdyFlow, FdyChrome, FdyCorner,
  FdyBluetooth, FdyDNAViz, FdyEHRViz,
});
