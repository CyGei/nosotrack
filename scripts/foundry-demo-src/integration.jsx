const CYCLE = 26;
const T = {
  ehrInfect: 3.0, ehrCard: 3.3, ehrDock: 7.6,
  labInfect: 8.0, labCard: 8.3, labDock: 12.6,
  rtls:     13.0, rtlsCard: 13.3, rtlsDock: 16.6,
  integ:    17.6, spin:     18.4,
  treeStart: 19.8, gold:    21.0, treeEnd: 24.4,
  reset:    24.6, resetEnd: 26.0,
};

const DOCK_Y = 76;
const HEADER_Y = 124;
const NT = [640, 208];
const PLAT_CENTER = [640, 372];

const BOX_R = { x: 808, y: 168, w: 432 };
const BOX_L = { x: 54, y: 168, w: 320 };

const ORIGIN = { x: 152, y: 540 };
const EX = { x: 0.85, y: 0.07 };
const EY = { x: 0.44, y: -0.66 };
const THICK = 14;
function P(px, py) { return [ORIGIN.x + px * EX.x + py * EY.x, ORIGIN.y + px * EX.y + py * EY.y]; }
function poly(pts) { return pts.map((p) => `${p[0]},${p[1]}`).join(' '); }

const WARDS = [
  { key: 'A', x0: 0,   x1: 360,  cx: 180, accent: '#6b7d8f', label: 'Ward A' },
  { key: 'B', x0: 360, x1: 720,  cx: 540, accent: '#8a7966', label: 'Ward B' },
  { key: 'C', x0: 720, x1: 1080, cx: 900, accent: '#7a8a70', label: 'Ward C' },
];
const ROOMS = WARDS.flatMap((w) => [
  { x0: w.x0 + 30, y0: 170, x1: w.x1 - 30, y1: 270 },
  { x0: w.x0 + 30, y0: 40,  x1: w.x1 - 30, y1: 140 },
]);

const PATIENTS = [
  { id: 'A1', px: 80, py: 220 }, { id: 'A2', px: 180, py: 220 }, { id: 'A3', px: 280, py: 220 },
  { id: 'A4', px: 110, py: 90 }, { id: 'A5', px: 250, py: 90 },
  { id: 'B1', px: 440, py: 220 }, { id: 'B2', px: 540, py: 220 }, { id: 'B3', px: 640, py: 220 },
  { id: 'B4', px: 470, py: 90 }, { id: 'B5', px: 610, py: 90 },
  { id: 'C1', px: 800, py: 220 }, { id: 'C2', px: 900, py: 220 }, { id: 'C3', px: 1000, py: 220 },
  { id: 'C4', px: 830, py: 90 }, { id: 'C5', px: 970, py: 90 },
];
const STAFF = [{ id: 'SD1', scripted: true }, { id: 'SD2', seed: 1.7 }, { id: 'SD3', seed: 4.3 }];
const SD1_PATH = [
  { t: 0, px: 150, py: 158 }, { t: 2.5, px: 280, py: 162 }, { t: 6.5, px: 300, py: 160 },
  { t: 10, px: 540, py: 162 }, { t: 15, px: 560, py: 158 }, { t: 21, px: 430, py: 160 }, { t: 26, px: 150, py: 158 },
];
function sd1Plan(t) {
  if (t <= SD1_PATH[0].t) return [SD1_PATH[0].px, SD1_PATH[0].py];
  for (let i = 0; i < SD1_PATH.length - 1; i++) {
    const a = SD1_PATH[i], b = SD1_PATH[i + 1];
    if (t >= a.t && t <= b.t) { const e = Easing.easeInOutQuad((t - a.t) / (b.t - a.t)); return [a.px + (b.px - a.px) * e, a.py + (b.py - a.py) * e]; }
  }
  const l = SD1_PATH[SD1_PATH.length - 1]; return [l.px, l.py];
}
function staffPlan(s, t) {
  if (s.scripted) return sd1Plan(t);
  const ph = (2 * Math.PI * t) / CYCLE;
  return [clamp(520 + Math.sin(ph + s.seed) * 360, 120, 980), 156 + Math.sin(ph * 2 + s.seed * 1.4) * 5];
}

const CONTACTS = [{ id: 'SD1', t: 13.5 }, { id: 'A1', t: 14.0 }, { id: 'A2', t: 14.4 }, { id: 'B1', t: 14.9 }, { id: 'B3', t: 15.3 }];
const CONTACT_T = Object.fromEntries(CONTACTS.map((c) => [c.id, c.t]));
const AT_RISK = [
  { id: 'A4', from: 'A3', t: 22.3 }, { id: 'A5', from: 'A3', t: 22.5 },
  { id: 'B4', from: 'B2', t: 22.7 }, { id: 'B5', from: 'B2', t: 22.9 },
];
const RISK_T = Object.fromEntries(AT_RISK.map((r) => [r.id, r.t]));
function stateOf(id, t) {
  if (id === 'A3') { if (t >= T.gold) return { kind: 'index', infT: T.ehrInfect }; if (t >= T.ehrInfect) return { kind: 'case', infT: T.ehrInfect }; return { kind: 'sus' }; }
  if (id === 'B2') { if (t >= T.labInfect) return { kind: 'case', infT: T.labInfect }; return { kind: 'sus' }; }
  if (CONTACT_T[id] != null && t >= CONTACT_T[id]) return { kind: 'contact', infT: CONTACT_T[id] };
  if (RISK_T[id] != null && t >= RISK_T[id]) return { kind: 'risk', infT: RISK_T[id] };
  return { kind: 'sus' };
}
const EDGES = [
  { from: 'A3', to: 'A1', t: 19.9 }, { from: 'A3', to: 'A2', t: 20.1 }, { from: 'A3', to: 'SD1', t: 20.4 },
  { from: 'SD1', to: 'B2', t: 20.9 }, { from: 'B2', to: 'B1', t: 21.3 }, { from: 'B2', to: 'B3', t: 21.6 },
];
const EDGE_DUR = 0.8;
const FASTA = 'ATCGGATTCAGTCCGATACAGGCATTAGC';

const STREAMS = [
  {
    key: 'EHR', glyph: 'ehr', dockX: 380, plat: [380, 350], cardIn: T.ehrCard, dockT: T.ehrDock,
    kicker: 'Electronic Health Records',
    rows: [['PATIENT', 'P-A3'], ['ADMITTED', '2026-06-12'], ['WARD', 'C → A  transfer'], ['MOVEMENTS', '3 transfers'], ['__div'], ['RESULT', '⚠ C. difficile · POS', 'alert']],
  },
  {
    key: 'LAB', glyph: 'dna', dockX: 640, plat: [640, 371], fasta: true, cardIn: T.labCard, dockT: T.labDock,
    kicker: 'Lab results',
    rows: [['SAMPLE', 'P-B2.fasta'], ['__fasta'], ['CALL', '✓ C. difficile · ST-1'], ['__div'], ['2 SNP', '≡ identical strain → P-A3', 'gold']],
  },
  {
    key: 'RTLS', glyph: 'bt', dockX: 900, plat: [900, 393], cardIn: T.rtlsCard, dockT: T.rtlsDock,
    kicker: 'Real-Time Location System',
    rows: [['PROXIMITY', '5 contacts'], ['BRIDGE', 'staff SD1 · A↔B', 'alert'], ['SD1 ↔ A3', '18 min'], ['SD1 ↔ B2', '24 min']],
  },
];
const CAPS = [
  { text: 'Electronic Health Records inform on patient status, admission dates, transfers, and ward allocations.', a: T.ehrCard, b: T.labCard, box: BOX_R },
  { text: 'Lab results inform on pathogen relatedness.', a: T.labCard, b: T.rtlsCard, box: BOX_R },
  { text: 'Real-Time Location System informs on contacts.', a: T.rtlsCard, b: T.integ, box: BOX_L },
  { text: 'Nosotrack fuses the data streams into a unified analytical engine.', a: T.integ, b: T.treeStart + 2.0, box: BOX_R },
];

function rgba(hex, a) { const h = hex.replace('#', ''); return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`; }
function mix(a, b, t) {
  const pa = a.replace('#', ''), pb = b.replace('#', '');
  const k = (i) => Math.round(parseInt(pa.slice(i, i + 2), 16) + (parseInt(pb.slice(i, i + 2), 16) - parseInt(pa.slice(i, i + 2), 16)) * t);
  return `rgb(${k(0)},${k(2)},${k(4)})`;
}
const lerp = (a, b, t) => a + (b - a) * t;
const lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const accentOf = (a) => (a === 'alert' ? COLOR.alert : a === 'gold' ? COLOR.gold : COLOR.ink);

// Icon path data from Lucide (ISC).
function Glyph({ kind, size = 22, color = COLOR.ink, sw = 2 }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (kind === 'ehr') return (
    <svg {...c}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  );
  if (kind === 'dna') return (
    <svg {...c}>
      <path d="m10 16 1.5 1.5" />
      <path d="m14 8-1.5-1.5" />
      <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993" />
      <path d="m16.5 10.5 1 1" />
      <path d="m17 6-2.891-2.891" />
      <path d="M2 15c6.667-6 13.333 0 20-6" />
      <path d="m20 9 .891.891" />
      <path d="M3.109 14.109 4 15" />
      <path d="m6.5 12.5 1 1" />
      <path d="m7 18 2.891 2.891" />
      <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993" />
    </svg>
  );
  return (
    <svg {...c}>
      <path d="m7 7 10 10-5 5V2l5 5L7 17" />
    </svg>
  );
}

function Node({ sx, sy, isStaff, state, t, resetP, dim }) {
  const r = isStaff ? 10.5 : 9;
  const base = isStaff ? COLOR.staff : COLOR.patient;
  const isCase = state.kind === 'case' || state.kind === 'index';
  const isIndex = state.kind === 'index';
  const isContact = state.kind === 'contact';
  const isRisk = state.kind === 'risk';
  let fill = base, stroke = COLOR.mute;
  if (isIndex) { fill = COLOR.gold; stroke = COLOR.gold; }
  else if (isCase) { fill = COLOR.alert; stroke = COLOR.alert; }
  else if (isContact) { fill = base; stroke = COLOR.alert; }
  if (resetP > 0 && (isCase || isContact)) { fill = mix(isContact ? base : (isIndex ? COLOR.gold : COLOR.alert), base, resetP); stroke = mix(stroke, COLOR.mute, resetP); }
  const onset = state.infT != null ? clamp((t - state.infT) / 1.3, 0, 1) : 1;
  const showOnset = onset > 0 && onset < 1 && resetP < 0.5 && !isRisk;
  return (
    <g opacity={dim}>
      <ellipse cx={sx} cy={sy + r * 0.78} rx={r * 0.95} ry={r * 0.42} fill="rgba(30,30,43,0.07)" />
      {showOnset && <circle cx={sx} cy={sy} r={r + 2 + onset * 16} fill="none" stroke={isIndex ? COLOR.gold : COLOR.alert} strokeWidth="1.3" opacity={(1 - onset) * 0.9} />}
      {isContact && (1 - resetP) > 0.02 && <circle cx={sx} cy={sy} r={r + 4} fill="none" stroke={stroke} strokeWidth="1.3" opacity={0.85 * (1 - resetP)} />}
      {isRisk && (1 - resetP) > 0.02 && <circle cx={sx} cy={sy} r={r + 4} fill="none" stroke={COLOR.alert} strokeWidth="1.1" strokeDasharray="2 2.4" opacity={0.62 * (1 - resetP)} />}
      {isIndex && resetP < 0.5 && (
        <circle cx={sx} cy={sy} r={r + 6} fill="none" stroke={COLOR.gold} strokeWidth="1.1" opacity="0.6">
          <animate attributeName="r" values={`${r + 5};${r + 11};${r + 5}`} dur="1.7s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0;0.6" dur="1.7s" repeatCount="indefinite" />
        </circle>
      )}
      {isStaff
        ? <polygon points={`${sx},${sy - r} ${sx + r},${sy} ${sx},${sy + r} ${sx - r},${sy}`} fill={fill} stroke={stroke} strokeWidth="1.3" />
        : <circle cx={sx} cy={sy} r={r} fill={fill} stroke={stroke} strokeWidth="1.3" />}
    </g>
  );
}

function ContactBadge({ sx, sy, op }) {
  if (op < 0.02) return null;
  return (
    <g opacity={op} transform={`translate(${sx + 12}, ${sy - 14})`}>
      <circle r="8.5" fill="#fff" stroke={COLOR.alert} strokeWidth="1.1" />
      <g transform="translate(-6,-6) scale(0.5)"><Glyph kind="bt" size={24} color={COLOR.alert} /></g>
    </g>
  );
}

function Edge({ from, to, p, op }) {
  if (p <= 0 || op < 0.02) return null;
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  const tx = from[0] + ux * (len - 12) * p, ty = from[1] + uy * (len - 12) * p;
  const ang = Math.atan2(uy, ux), a = 7;
  return (
    <g opacity={op}>
      <line x1={from[0]} y1={from[1]} x2={tx} y2={ty} stroke={COLOR.alert} strokeWidth="1.8" opacity="0.9" strokeLinecap="round" />
      {p > 0.9 && <polygon points={`${tx},${ty} ${tx - Math.cos(ang - 0.5) * a},${ty - Math.sin(ang - 0.5) * a} ${tx - Math.cos(ang + 0.5) * a},${ty - Math.sin(ang + 0.5) * a}`} fill={COLOR.alert} opacity="0.95" />}
    </g>
  );
}

function RiskEdge({ from, to, p, op }) {
  if (p <= 0 || op < 0.02) return null;
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  const tx = from[0] + ux * (len - 11) * p, ty = from[1] + uy * (len - 11) * p;
  return (
    <g opacity={op * 0.8}>
      <line x1={from[0]} y1={from[1]} x2={tx} y2={ty} stroke={COLOR.alert} strokeWidth="1.4" strokeDasharray="3 3" opacity="0.7" strokeLinecap="round" />
      {p > 0.88 && <circle cx={tx} cy={ty} r="3" fill="none" stroke={COLOR.alert} strokeWidth="1.3" />}
    </g>
  );
}

function InfoEdge({ from, to, op, dur = 1.5 }) {
  if (op < 0.02) return null;
  const midY = (from[1] + to[1]) / 2;
  const d = `M ${from[0]} ${from[1]} C ${from[0]} ${midY}, ${to[0]} ${midY}, ${to[0]} ${to[1]}`;
  return (
    <g opacity={op * 0.8}>
      <circle cx={from[0]} cy={from[1]} r="2.4" fill={COLOR.ink} opacity="0.7" />
      <path d={d} fill="none" stroke={COLOR.ink} strokeWidth="1.1" strokeDasharray="2.5 5" opacity="0.5" style={{ animation: 'fdyDash 1.2s linear infinite' }} />
      <circle r="2.6" fill={COLOR.alert}><animateMotion dur={`${dur}s`} repeatCount="indefinite" path={d} /></circle>
    </g>
  );
}

function CardRows({ rows, fastaN }) {
  return rows.map((r, i) => {
    if (r[0] === '__div') return <div key={i} style={{ height: 1, background: COLOR.rule, margin: '7px 0' }} />;
    if (r[0] === '__fasta') return (
      <div key={i} style={{ fontSize: 13, color: COLOR.text, margin: '4px 0 7px', wordBreak: 'break-all', lineHeight: 1.5, letterSpacing: '0.04em' }}>
        <span style={{ color: COLOR.faint }}>&gt;</span>{FASTA.slice(0, fastaN)}
      </div>
    );
    const [k, v, a] = r;
    return (
      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 14, padding: '3px 0', fontSize: 14 }}>
        <span style={{ color: COLOR.faint, letterSpacing: '0.04em' }}>{k}</span>
        <span style={{ color: accentOf(a), textAlign: 'right' }}>{v}</span>
      </div>
    );
  });
}

function DetailCard({ s, op, fastaN }) {
  if (op < 0.02) return null;
  return (
    <div style={{
      position: 'absolute', left: s.dockX, top: 100, width: 300, transform: `translate(-50%, ${(1 - op) * 6}px)`, opacity: op,
      background: '#fff', border: `1px solid ${COLOR.ruleStrong}`, boxShadow: '0 10px 30px rgba(30,30,43,0.10)', fontFamily: FONT_MONO, pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${COLOR.rule}` }}>
        <Glyph kind={s.glyph} size={17} color={COLOR.ink} />
        <span style={{ fontSize: 11, letterSpacing: '0.17em', textTransform: 'uppercase', color: COLOR.mute }}>{s.kicker}</span>
      </div>
      <div style={{ padding: '9px 14px' }}><CardRows rows={s.rows} fastaN={fastaN} /></div>
    </div>
  );
}

function DockLogo({ pos, kind, op }) {
  if (op < 0.02) return null;
  const S = 66;
  return (
    <div style={{
      position: 'absolute', left: pos[0], top: pos[1], transform: 'translate(-50%, -50%)', opacity: op,
      width: S, height: S, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#fff', border: `1px solid ${COLOR.ruleStrong}`,
      boxShadow: '0 8px 22px rgba(30,30,43,0.10), 0 1px 1px rgba(30,30,43,0.04)',
      pointerEvents: 'none',
    }}>
      <Glyph kind={kind} size={36} color={COLOR.ink} sw={1.9} />
    </div>
  );
}

function IntegrationScene() {
  const { localTime: rawT } = useSprite();
  const t = ((rawT % CYCLE) + CYCLE) % CYCLE;
  const resetP = clamp((t - T.reset) / (T.resetEnd - T.reset), 0, 1);
  const mergeP = Easing.easeInOutCubic(clamp((t - T.integ) / 1.3, 0, 1));

  const POS = {};
  PATIENTS.forEach((pt) => {
    const j = Math.sin((2 * Math.PI * t) / CYCLE * 3 + pt.px) * 0.9;
    const k = Math.cos((2 * Math.PI * t) / CYCLE * 3 + pt.py) * 0.9;
    const s = P(pt.px, pt.py); POS[pt.id] = [s[0] + j, s[1] + k];
  });
  STAFF.forEach((s) => { POS[s.id] = P(...staffPlan(s, t)); });

  const SP = STREAMS.map((s) => {
    const appearP = clamp((t - s.cardIn) / 0.4, 0, 1);
    const collapseP = clamp((t - s.dockT) / 0.4, 0, 1);
    const slideP = Easing.easeInOutCubic(clamp((t - s.dockT) / 0.6, 0, 1));
    const logoPos = [s.dockX, lerp(HEADER_Y, DOCK_Y, slideP)];
    return {
      s, cardOp: appearP * (1 - collapseP) * (1 - resetP),
      logoOp: clamp((t - s.dockT) / 0.3, 0, 1) * (1 - resetP),
      logoPos, edgeFrom: [logoPos[0], logoPos[1] + 35], endPoint: NT,
      edgeOp: clamp((t - T.integ) / 0.4, 0, 1) * (1 - resetP),
    };
  });
  const fastaN = Math.floor(clamp((t - T.labCard - 0.3) / 1.9, 0, 1) * FASTA.length);

  let focus = null;
  if (t >= T.ehrCard && t < T.ehrDock) focus = 'A3';
  else if (t >= T.labCard && t < T.labDock) focus = 'B2';
  const dimOf = (id) => (!focus || id === focus ? 1 : stateOf(id, t).kind !== 'sus' ? 1 : 0.4);

  const cap = CAPS.find((c) => t >= c.a && t < c.b);
  let capText = '', capN = 0, capOp = 0, capCaret = false, capBox = BOX_R;
  if (cap) {
    capOp = clamp((t - cap.a) / 0.3, 0, 1) * (1 - clamp((t - cap.b + 0.4) / 0.4, 0, 1));
    capN = Math.floor(clamp((t - cap.a - 0.15) * 32, 0, cap.text.length));
    capText = cap.text; capBox = cap.box; capCaret = capN < cap.text.length || Math.floor(t * 2) % 2 === 0;
  }

  let status = 'LIVE SURVEILLANCE', alertDot = false;
  if (t >= T.ehrCard && t < T.labCard) { status = 'Electronic Health Records · positive flag'; alertDot = true; }
  else if (t >= T.labCard && t < T.rtlsCard) { status = 'Lab results · genomic match'; alertDot = true; }
  else if (t >= T.rtlsCard && t < T.integ) { status = 'Real-Time Location System · contact tracing'; alertDot = true; }
  else if (t >= T.integ && t < T.reset) { status = 'NOSOTRACK ENGINE'; alertDot = true; }

  const markOp = clamp((t - T.integ) / 0.4, 0, 1) * (1 - resetP);
  const spin = Easing.easeInOutCubic(clamp((t - T.spin) / 1.1, 0, 1)) * 360;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <FdyChrome chapter="Integration" />

      <div style={{ position: 'absolute', right: 48, top: 36, display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONT_MONO, fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase', color: COLOR.mute }}>
        <span style={{ width: 7, height: 7, background: alertDot ? COLOR.alert : COLOR.faint, boxShadow: alertDot ? `0 0 0 3px ${rgba('#ff073a', 0.14)}` : 'none' }} />
        {status}
      </div>

      <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {(() => {
          const fl = P(-16, -8), fr = P(1092, -8), br = P(1092, 308);
          return (
            <g>
              <polygon points={poly([fr, br, [br[0], br[1] + THICK], [fr[0], fr[1] + THICK]])} fill="#e7e6e2" stroke={COLOR.ruleStrong} strokeWidth="0.6" />
              <polygon points={poly([fl, fr, [fr[0], fr[1] + THICK], [fl[0], fl[1] + THICK]])} fill="#efeeea" stroke={COLOR.ruleStrong} strokeWidth="0.6" />
            </g>
          );
        })()}
        <polygon points={poly([P(-16, -8), P(1092, -8), P(1092, 308), P(-16, 308)])} fill="#ffffff" stroke={COLOR.ruleStrong} strokeWidth="1" />
        {WARDS.map((w) => <polygon key={w.key} points={poly([P(w.x0, -8), P(w.x1, -8), P(w.x1, 308), P(w.x0, 308)])} fill={rgba(w.accent, 0.07)} />)}
        {[360, 720].map((x) => <line key={x} x1={P(x, -8)[0]} y1={P(x, -8)[1]} x2={P(x, 308)[0]} y2={P(x, 308)[1]} stroke={COLOR.ruleStrong} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.6" />)}
        <polygon points={poly([P(-16, 142), P(1092, 142), P(1092, 168), P(-16, 168)])} fill="rgba(30,30,43,0.025)" />
        <line x1={P(-16, 155)[0]} y1={P(-16, 155)[1]} x2={P(1092, 155)[0]} y2={P(1092, 155)[1]} stroke={COLOR.ruleStrong} strokeWidth="0.6" strokeDasharray="2 6" opacity="0.5" />
        {ROOMS.map((rm, i) => <polygon key={i} points={poly([P(rm.x0, rm.y0), P(rm.x1, rm.y0), P(rm.x1, rm.y1), P(rm.x0, rm.y1)])} fill="rgba(255,255,255,0.55)" stroke={COLOR.ruleStrong} strokeWidth="0.7" />)}
        {WARDS.map((w) => { const s = P(w.cx, -8); return <text key={w.key} x={s[0]} y={s[1] + THICK + 18} textAnchor="middle" fontFamily={FONT_MONO} fontSize="13.5" fill={COLOR.mute} letterSpacing="3" style={{ textTransform: 'uppercase' }}>{w.label}</text>; })}

        {t >= T.rtls && t < T.integ && ['A3', 'B2'].map((id) => [0, 1, 2].map((kk) => {
          const ph = t - T.rtls - kk * 0.55; if (ph <= 0 || ph > 1.6) return null;
          return <circle key={id + kk} cx={POS[id][0]} cy={POS[id][1]} r={ph * 52} fill="none" stroke={COLOR.alert} strokeWidth="1" opacity={(1 - ph / 1.6) * 0.4} />;
        }))}

        {SP.map((p) => <InfoEdge key={p.s.key} from={p.edgeFrom} to={p.endPoint} op={p.edgeOp} />)}
        <InfoEdge from={NT} to={PLAT_CENTER} op={mergeP * (1 - resetP)} dur={1.3} />

        {EDGES.map((e, i) => <Edge key={i} from={POS[e.from]} to={POS[e.to]} p={Easing.easeOutCubic(clamp((t - e.t) / EDGE_DUR, 0, 1))} op={1 - resetP} />)}
        {AT_RISK.map((r, i) => <RiskEdge key={'r' + i} from={POS[r.from]} to={POS[r.id]} p={Easing.easeOutCubic(clamp((t - r.t) / EDGE_DUR, 0, 1))} op={1 - resetP} />)}

        {CONTACTS.map((c) => {
          const op = clamp((t - c.t) / 0.4, 0, 1) * (1 - clamp((t - T.integ) / 1.0, 0, 1)) * (1 - resetP);
          return <ContactBadge key={c.id} sx={POS[c.id][0]} sy={POS[c.id][1]} op={op} />;
        })}

        {PATIENTS.map((p) => <Node key={p.id} sx={POS[p.id][0]} sy={POS[p.id][1]} isStaff={false} state={stateOf(p.id, t)} t={t} resetP={resetP} dim={dimOf(p.id)} />)}
        {STAFF.map((s) => <Node key={s.id} sx={POS[s.id][0]} sy={POS[s.id][1]} isStaff={true} state={stateOf(s.id, t)} t={t} resetP={resetP} dim={dimOf(s.id)} />)}
      </svg>

      {capOp > 0.01 && (
        <div style={{ position: 'absolute', left: capBox.x, top: capBox.y, width: capBox.w, opacity: capOp, fontFamily: FONT_MONO, fontSize: 18, lineHeight: 1.55, letterSpacing: '0.01em', color: COLOR.ink, pointerEvents: 'none' }}>
          {capText.slice(0, capN)}
        </div>
      )}

      {SP.map((p) => <DetailCard key={p.s.key} s={p.s} op={p.cardOp} fastaN={fastaN} />)}
      {SP.map((p) => <DockLogo key={p.s.key} pos={p.logoPos} kind={p.s.glyph} op={p.logoOp} />)}

      {markOp > 0.01 && (
        <div style={{ position: 'absolute', left: NT[0], top: NT[1], transform: 'translate(-50%, -50%)', opacity: markOp }}>
          <FdyBrandMark size={56} pulse networkSpin={spin} />
        </div>
      )}

    </div>
  );
}

Object.assign(window, { IntegrationScene });
