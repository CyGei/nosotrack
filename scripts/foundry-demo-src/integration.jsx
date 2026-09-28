const CYCLE = 20;
const T = {
  ehrInfect: 0.9, ehrCard: 1.0, ehrDock: 2.4,
  labInfect: 2.3, labCard: 2.4, labDock: 3.5,
  rtlsCard: 3.4, spin: 4.4, treeStart: 5.6,
  reset: 19, resetEnd: CYCLE,
};

const NT = [1190, 78];

const ORIGIN = { x: 54, y: 568 };
const EX = { x: 0.94, y: 0.07 };
const EY = { x: 0.47, y: -0.88 };
const THICK = 14;
function P(px, py) { return [ORIGIN.x + px * EX.x + py * EY.x, ORIGIN.y + px * EX.y + py * EY.y]; }
function poly(pts) { return pts.map((p) => `${p[0]},${p[1]}`).join(' '); }

const WARDS = [
  { key: 'A', x0: 0,   x1: 360,  cx: 180, accent: '#6b7d8f', label: 'Ward A' },
  { key: 'B', x0: 360, x1: 720,  cx: 540, accent: '#8a7966', label: 'Ward B' },
  { key: 'C', x0: 720, x1: 1080, cx: 900, accent: '#7a8a70', label: 'Ward C' },
];
// Three small rooms on each side of each ward's shared corridor.
const ROOMS = WARDS.flatMap((ward) => [0, 1, 2].flatMap((column) => [
  { x0: ward.x0 + 25 + column * 105, x1: ward.x0 + 125 + column * 105, y0: 180, y1: 275, upper: true },
  { x0: ward.x0 + 25 + column * 105, x1: ward.x0 + 125 + column * 105, y0: 35, y1: 130, upper: false },
]));
const PATIENTS = WARDS.flatMap((ward) => [
  { id: `${ward.key}1`, px: ward.x0 + 75, py: 240 },
  { id: `${ward.key}2`, px: ward.x0 + 180, py: 230 },
  { id: `${ward.key}3`, px: ward.x0 + 285, py: 230 },
  { id: `${ward.key}4`, px: ward.x0 + 75, py: 80 },
  { id: `${ward.key}5`, px: ward.x0 + 180, py: 80 },
  { id: `${ward.key}6`, px: ward.x0 + 285, py: 65 },
  { id: `${ward.key}7`, px: ward.x0 + 75, py: 200 },
  { id: `${ward.key}8`, px: ward.x0 + 285, py: 105 },
]);
const STAFF = [
  { id: 'SD1', scripted: true },
  ...Array.from({ length: 7 }, (_, i) => ({ id: `SD${i + 2}`, ward: i % 3, phase: i * 0.137, upper: i % 2 === 0 })),
];
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
  const phase = ((t / 26 + s.phase) % 1) * 8;
  const x = s.ward * 360;
  const roomY = s.upper ? 200 : 110;
  const corridorY = s.upper ? 162 : 146;
  // Walk between doorways, enter a room, pause, and return to the corridor.
  const route = [[x + 75, corridorY], [x + 180, corridorY], [x + 180, roomY],
    [x + 180, roomY], [x + 180, corridorY], [x + 285, corridorY],
    [x + 285, roomY], [x + 285, corridorY], [x + 75, corridorY]];
  const step = Math.floor(phase);
  const ease = Easing.easeInOutQuad(phase - step);
  return route[step].map((value, axis) => value + (route[step + 1][axis] - value) * ease);
}

const CONTACTS = [{ id: 'SD1', t: 3.5 }, { id: 'A1', t: 3.7 }, { id: 'A2', t: 3.9 }, { id: 'B1', t: 4.1 }, { id: 'B3', t: 4.3 }];
const CONTACT_T = Object.fromEntries(CONTACTS.map((c) => [c.id, c.t]));
const AT_RISK = [
  { id: 'A7', from: 'A1', t: 7.3 }, { id: 'A8', from: 'A3', t: 7.5 },
  { id: 'B7', from: 'B1', t: 7.7 }, { id: 'B5', from: 'B2', t: 7.9 },
];
const RISK_T = Object.fromEntries(AT_RISK.map((risk) => [risk.id, risk.t]));
function stateOf(id, t) {
  if (id === 'A3') { if (t >= T.ehrInfect) return { kind: 'case', infT: T.ehrInfect }; return { kind: 'sus' }; }
  if (id === 'B2') { if (t >= T.labInfect) return { kind: 'case', infT: T.labInfect }; return { kind: 'sus' }; }
  if (CONTACT_T[id] != null && t >= CONTACT_T[id]) return { kind: 'contact', infT: CONTACT_T[id] };
  if (RISK_T[id] != null && t >= RISK_T[id]) return { kind: 'risk', infT: RISK_T[id] };
  return { kind: 'sus' };
}
const EDGES = [
  { from: 'A3', to: 'A1', t: 5.6 }, { from: 'A3', to: 'A2', t: 5.8 }, { from: 'A3', to: 'SD1', t: 6.0 },
  { from: 'SD1', to: 'B2', t: 6.3 }, { from: 'B2', to: 'B1', t: 6.6 }, { from: 'B2', to: 'B3', t: 6.9 },
];
const EDGE_DUR = 0.55;
const RECORD_SIGNALS = [
  { label: 'Symptoms', value: 'Date of onset', at: 1.0, kind: 'symptoms' },
  { label: 'Lab results', value: 'Genomic sequence', at: 2.4, kind: 'lab' },
  { label: 'Exposures & contacts', value: 'Shared ward', at: 3.4, kind: 'contacts' },
  { label: 'Risk factors', value: 'Vulnerability', at: 4.2, kind: 'risk' },
];

function ClinicalSignal({ kind, active }) {
  const ink = COLOR.ink;
  return <svg width="62" height="28" viewBox="0 0 62 28" fill="none" aria-hidden="true">
    <path d="M1 23H61" stroke={COLOR.rule} />
    <g stroke={ink} strokeWidth="1.3" strokeLinecap="round" opacity={0.2 + active * 0.8}>
      {kind === 'symptoms' && <path d="M2 18H17L23 9L29 22L37 4L43 18H60" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - active} />}
      {kind === 'lab' && <><path d="M2 18H24M38 18H60" /><circle cx="31" cy="12" r="5" fill={ink} fillOpacity={active * 0.12} /><path d="M31 9V15M28 12H34" /></>}
      {kind === 'contacts' && <><path d="M9 16L30 8L52 16" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - active} />{[[9,16],[30,8],[52,16]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="3" fill="#efeeef" />)}</>}
      {kind === 'risk' && <>{[7,18,29,40,51].map((x,i) => <path key={x} d={`M${x} 20V${18-i*3}`} opacity={0.25 + active * (i+1)/7} />)}</>}
    </g>
  </svg>;
}

function mix(a, b, t) {
  const pa = a.replace('#', ''), pb = b.replace('#', '');
  const k = (i) => Math.round(parseInt(pa.slice(i, i + 2), 16) + (parseInt(pb.slice(i, i + 2), 16) - parseInt(pa.slice(i, i + 2), 16)) * t);
  return `rgb(${k(0)},${k(2)},${k(4)})`;
}
function Node({ sx, sy, isStaff, state, t, resetP, dim }) {
  const r = isStaff ? 10.5 : 9;
  const base = isStaff ? COLOR.staff : COLOR.patient;
  const isCase = state.kind === 'case';
  const isContact = state.kind === 'contact';
  const isRisk = state.kind === 'risk';
  let fill = base, stroke = COLOR.mute;
  if (isCase) { fill = COLOR.alert; stroke = COLOR.alert; }
  else if (isContact) { fill = base; stroke = COLOR.alert; }
  if (resetP > 0 && (isCase || isContact)) { fill = mix(isContact ? base : COLOR.alert, base, resetP); stroke = mix(stroke, COLOR.mute, resetP); }
  const onset = state.infT != null ? clamp((t - state.infT) / 0.7, 0, 1) : 1;
  const showOnset = onset > 0 && onset < 1 && resetP < 0.5 && !isRisk;
  return (
    <g opacity={dim} data-person={isStaff ? 'staff' : 'patient'} data-state={state.kind}>
      <ellipse cx={sx} cy={sy + r * 0.78} rx={r * 0.95} ry={r * 0.42} fill="rgba(30,30,43,0.07)" />
      {showOnset && <circle cx={sx} cy={sy} r={r + 2 + onset * 16} fill="none" stroke={COLOR.alert} strokeWidth="1.3" opacity={(1 - onset) * 0.9} />}
      {isContact && (1 - resetP) > 0.02 && <circle cx={sx} cy={sy} r={r + 4} fill="none" stroke={stroke} strokeWidth="1.3" opacity={0.85 * (1 - resetP)} />}
      {isRisk && <circle cx={sx} cy={sy} r={r + 5} fill="none" stroke={COLOR.alert} strokeWidth="1.6" strokeDasharray="3 2" opacity={1 - resetP} />}
      {isStaff
        ? <polygon points={`${sx},${sy - r} ${sx + r},${sy} ${sx},${sy + r} ${sx - r},${sy}`} fill={fill} stroke={stroke} strokeWidth="1.3" />
        : <circle cx={sx} cy={sy} r={r} fill={fill} stroke={stroke} strokeWidth="1.3" />}
    </g>
  );
}

function Edge({ from, to, p, op, risk = false }) {
  if (p <= 0 || op < 0.02) return null;
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  const tx = from[0] + ux * (len - 12) * p, ty = from[1] + uy * (len - 12) * p;
  const ang = Math.atan2(uy, ux), a = 7;
  return (
    <g opacity={op} data-transmission={risk ? 'risk' : 'inferred'}>
      <line x1={from[0]} y1={from[1]} x2={tx} y2={ty} stroke={COLOR.alert} strokeWidth={risk ? 1.2 : 1.8} strokeDasharray={risk ? "4 3" : undefined} opacity={risk ? 0.7 : 0.9} strokeLinecap="round" />
      {risk && p > 0.92 && <polyline points={`${tx - Math.cos(ang - 0.5) * a},${ty - Math.sin(ang - 0.5) * a} ${tx},${ty} ${tx - Math.cos(ang + 0.5) * a},${ty - Math.sin(ang + 0.5) * a}`} fill="none" stroke={COLOR.alert} strokeWidth="1.2" opacity="0.7" />}
      {!risk && p > 0.9 && <polygon points={`${tx},${ty} ${tx - Math.cos(ang - 0.5) * a},${ty - Math.sin(ang - 0.5) * a} ${tx - Math.cos(ang + 0.5) * a},${ty - Math.sin(ang + 0.5) * a}`} fill={COLOR.alert} opacity="0.95" />}
    </g>
  );
}

function IntegrationScene() {
  const { localTime: rawT } = useSprite();
  const [reducedMotion, setReducedMotion] = React.useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  React.useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const t = reducedMotion ? 12 : ((rawT % CYCLE) + CYCLE) % CYCLE;
  const resetP = clamp((t - T.reset) / (T.resetEnd - T.reset), 0, 1);

  // Brisk activity, a smooth deceleration, then a stable field for reading the tree.
  const settle = clamp((t - 4.4) / 1.2, 0, 1);
  const heldTime = t < 4.4 ? t * 2.4 : 10.56 + 2.88 * (settle - settle * settle / 2);
  const movementTime = heldTime + (26 - heldTime) * Easing.easeInOutCubic(resetP);

  const POS = {};
  PATIENTS.forEach((pt) => {
    const j = Math.sin((2 * Math.PI * movementTime) / 26 * 3 + pt.px) * 0.9;
    const k = Math.cos((2 * Math.PI * movementTime) / 26 * 3 + pt.py) * 0.9;
    const s = P(pt.px, pt.py); POS[pt.id] = [s[0] + j, s[1] + k];
  });
  STAFF.forEach((s) => { POS[s.id] = P(...staffPlan(s, movementTime)); });

  let focus = null;
  if (t >= T.ehrCard && t < T.ehrDock) focus = 'A3';
  else if (t >= T.labCard && t < T.labDock) focus = 'B2';
  const dimOf = (id) => (!focus || id === focus ? 1 : stateOf(id, t).kind !== 'sus' ? 1 : 0.4);

  // The original brand gesture: one eased turn as inference begins, then rest.
  const spin = reducedMotion ? 0 : Easing.easeInOutCubic(clamp((t - T.spin) / 1.1, 0, 1)) * 360;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width="1280" height="720" viewBox="0 0 1280 720" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {(() => {
          const fl = P(-16, -8), fr = P(1092, -8), br = P(1092, 308);
          return (
            <g>
              <polygon points={poly([fr, br, [br[0], br[1] + THICK], [fr[0], fr[1] + THICK]])} fill="#dbdbdb" stroke={COLOR.ruleStrong} strokeWidth="0.6" />
              <polygon points={poly([fl, fr, [fr[0], fr[1] + THICK], [fl[0], fl[1] + THICK]])} fill="#efeeef" stroke={COLOR.ruleStrong} strokeWidth="0.6" />
            </g>
          );
        })()}
        <polygon points={poly([P(-16, -8), P(1092, -8), P(1092, 308), P(-16, 308)])} fill="#f3f3f3" stroke={COLOR.ruleStrong} strokeWidth="1" />
        {WARDS.map((w) => <polygon key={w.key} points={poly([P(w.x0, -8), P(w.x1, -8), P(w.x1, 308), P(w.x0, 308)])} fill="rgba(30,30,43,0.018)" />)}
        {[360, 720].map((x) => <line key={x} x1={P(x, -8)[0]} y1={P(x, -8)[1]} x2={P(x, 308)[0]} y2={P(x, 308)[1]} stroke={COLOR.ruleStrong} strokeWidth="0.8" strokeDasharray="3 4" opacity="0.6" />)}
        <polygon points={poly([P(-16, 130), P(1092, 130), P(1092, 180), P(-16, 180)])} fill="rgba(30,30,43,0.025)" />
        <line x1={P(-16, 155)[0]} y1={P(-16, 155)[1]} x2={P(1092, 155)[0]} y2={P(1092, 155)[1]} stroke={COLOR.ruleStrong} strokeWidth="0.6" strokeDasharray="2 6" opacity="0.5" />
        {ROOMS.map((room, i) => {
          const { x0, x1, y0, y1, upper } = room;
          const doorX = (x0 + x1) / 2;
          const nearY = upper ? y0 : y1;
          const farY = upper ? y1 : y0;
          const outline = [P(doorX - 14, nearY), P(x0, nearY), P(x0, farY), P(x1, farY), P(x1, nearY), P(doorX + 14, nearY)];
          return <g key={i}>
            <polygon points={poly([P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)])} fill="rgba(255,255,255,0.6)" />
            <polyline points={poly(outline)} fill="none" stroke={COLOR.ruleStrong} strokeWidth="0.9" />
          </g>;
        })}
        {WARDS.map((w) => { const s = P(w.cx, -8); return <text key={w.key} x={s[0]} y={s[1] + THICK + 18} textAnchor="middle" fontFamily={FONT_MONO} fontSize="12" fill={COLOR.mute} letterSpacing="3" style={{ textTransform: 'uppercase' }}>{w.label}</text>; })}


        {EDGES.map((e, i) => <Edge key={i} from={POS[e.from]} to={POS[e.to]} p={Easing.easeOutCubic(clamp((t - e.t) / EDGE_DUR, 0, 1))} op={1 - resetP} />)}
        {AT_RISK.map((risk) => <Edge key={risk.id} risk from={POS[risk.from]} to={POS[risk.id]} p={Easing.easeOutCubic(clamp((t - risk.t) / EDGE_DUR, 0, 1))} op={1 - resetP} />)}
        {PATIENTS.map((p) => <Node key={p.id} sx={POS[p.id][0]} sy={POS[p.id][1]} isStaff={false} state={stateOf(p.id, t)} t={t} resetP={resetP} dim={dimOf(p.id)} />)}
        {STAFF.map((s) => <Node key={s.id} sx={POS[s.id][0]} sy={POS[s.id][1]} isStaff={true} state={stateOf(s.id, t)} t={t} resetP={resetP} dim={dimOf(s.id)} />)}
      </svg>

      <div style={{ position: 'absolute', left: 100, top: 48, width: 942, fontFamily: FONT_DISPLAY }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 22, letterSpacing: '-.015em', color: COLOR.ink }}>Electronic health records</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {RECORD_SIGNALS.map((signal) => {
            const active = Easing.easeOutCubic(clamp((t - signal.at) / 0.55, 0, 1)) * (1 - resetP);
            const arriving = Math.sin(clamp((t - signal.at) / 1.0, 0, 1) * Math.PI) * (1 - resetP);
            return <div key={signal.label} data-clinical-signal={signal.kind} style={{ padding: '15px 17px 17px', borderRadius: 10, background: `rgba(243,243,243,${0.35 + active * 0.65})`, border: `1px solid rgba(30,30,43,${0.04 + active * 0.04})`, boxShadow: `0 ${4 + arriving * 4}px ${14 + arriving * 8}px rgba(30,30,43,${0.02 + arriving * 0.025})`, transform: `translateY(${-arriving * 4}px)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 30 }}>
                <ClinicalSignal kind={signal.kind} active={active} />
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: COLOR.ink, opacity: active * 0.5 }} />
              </div>
              <div style={{ fontSize: 17, marginTop: 12, color: COLOR.mute }}>{signal.label}</div>
              <div style={{ fontSize: 22, letterSpacing: '-.015em', marginTop: 5, color: COLOR.ink, opacity: active, transform: `translateY(${(1-active)*5}px)` }}>{signal.value}</div>
            </div>;
          })}
        </div>
      </div>
      <div aria-label="Nosotrack" style={{ position: 'absolute', left: NT[0], top: NT[1], transform: 'translate(-50%, -50%)' }}>
        <FdyBrandMark size={72} networkSpin={spin} />
      </div>

    </div>
  );
}

Object.assign(window, { IntegrationScene, INTEGRATION_DURATION: CYCLE });
