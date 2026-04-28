// dashboard.jsx — Section B: cursor opens the dashboard, drills into A3,
// chats with the Co-Pilot, reviews 4 strategies, and deploys the
// recommended one.
//
// Pass 1 changes:
//   • Continuous A→B transition: scene starts during foundry overlap so
//     the cursor enters while foundry is still on-screen, then dashboard
//     expands FROM the logo position (552, 596) as foundry collapses.
//   • Orthogonal (Manhattan) tree edges with rounded corners + arrowheads.
//   • Strategy drawer slides up from the bottom (no full-screen overlay).
//   • Cursor walks to Scenario 03 and clicks; "Deploy" confirmation lands.
//   • Stats strip in dashboard header (replaces "POSTERIOR 0.94 · MCMC").
//   • Red reserved for infection state; AI Co-Pilot chrome moves to ink;
//     Recommended badge moves to gold (ties to the gold superspreader).

const LOGO_X = 552;
const LOGO_Y = 596;

// ── Cursor scripted path ───────────────────────────────────────────────────
// DashboardScene starts at total t=23 (overlapping foundry). Cursor enters,
// reaches the logo at localTime 1.5 = total 24.5, which is exactly when
// FoundryStack triggers the network spin and begins to collapse.
const CURSOR_PATH = [
  { t: 0.0,  x: 1180, y: 660 },
  { t: 0.9,  x: 800,  y: 620 },
  { t: 1.5,  x: LOGO_X, y: LOGO_Y, click: true },   // arrive + click logo
  { t: 4.0,  x: LOGO_X, y: LOGO_Y },                 // hold while foundry collapses + dashboard expands
  // Drill into A3.
  // Tree pane SVG (viewBox 1120×472, preserveAspectRatio=xMidYMid meet)
  // renders 1120×472 inside the 1120×516 body with 22px vertical letterbox.
  // A3 viewBox (290, 130) → stage (80 + 290, 80 + 44 + 22 + 130) = (370, 276).
  { t: 6.5,  x: 470,  y: 400 },
  { t: 8.5,  x: 370,  y: 276 },
  { t: 8.7,  x: 370,  y: 276, click: true },
  // Move to AI Co-Pilot icon
  { t: 13.5, x: 1130, y: 110 },
  { t: 14.0, x: 1130, y: 110, click: true },
  // Move to chat input
  { t: 15.0, x: 1010, y: 600 },
  { t: 19.5, x: 1010, y: 600 },                      // hold while typing
  { t: 19.7, x: 1158, y: 600, click: true },         // send
  // Strategy drawer appears.
  // With chat sidebar open the body is 740 wide → drawer is 740 wide;
  // Scenario 03 (recommended) sits roughly at stage x ≈ 540.
  { t: 22.5, x: 1158, y: 600 },
  { t: 23.5, x: 540,  y: 510 },                      // walk to Scenario 03
  { t: 24.0, x: 540,  y: 510, click: true },         // click recommended
  { t: 25.5, x: 540,  y: 510 },                      // hold on deploy
];

function cursorAt(t) {
  let click = false;
  for (let i = 0; i < CURSOR_PATH.length - 1; i++) {
    const a = CURSOR_PATH[i];
    const b = CURSOR_PATH[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t;
      const local = span === 0 ? 1 : (t - a.t) / span;
      const eased = Easing.easeInOutCubic(local);
      const x = a.x + (b.x - a.x) * eased;
      const y = a.y + (b.y - a.y) * eased;
      const nextClickWp = CURSOR_PATH.find((wp) => wp.click && Math.abs(wp.t - t) < 0.3);
      click = !!nextClickWp;
      return { x, y, click };
    }
  }
  const last = CURSOR_PATH[CURSOR_PATH.length - 1];
  return { x: last.x, y: last.y, click: false };
}

// ── Dashboard tree pane: all 22 entities laid out ward-by-ward ───────────
const WARD_LAYOUT = [
  { key: 'A', label: 'Ward A', x0: 40,  x1: 380  },
  { key: 'B', label: 'Ward B', x0: 400, x1: 740  },
  { key: 'C', label: 'Ward C', x0: 760, x1: 1100 },
];

const TREE_ROOM_TOP_Y = 130;
const TREE_ROOM_BOT_Y = 320;

const TREE_PATIENTS = [];
WARD_LAYOUT.forEach(({ key, x0, x1 }) => {
  const wcx = (x0 + x1) / 2;
  const dxs = [-80, 0, 80];
  dxs.forEach((dx, i) => {
    TREE_PATIENTS.push({ id: `${key}${i + 1}`, ward: key, x: wcx + dx, y: TREE_ROOM_TOP_Y });
    TREE_PATIENTS.push({ id: `${key}${i + 4}`, ward: key, x: wcx + dx, y: TREE_ROOM_BOT_Y });
  });
});

const TREE_STAFF = [
  { id: 'SD1', x: 360, y: 230 },   // infected
  { id: 'SD2', x: 200, y: 230 },
  { id: 'SD3', x: 540, y: 230 },
  { id: 'SD4', x: 870, y: 230 },
  { id: 'SD5', x: 700, y: 230 },
  { id: 'SD6', x: 1030, y: 230 },
];

const TREE_BY_ID = {};
TREE_PATIENTS.forEach(p => { TREE_BY_ID[p.id] = { x: p.x, y: p.y, isStaff: false }; });
TREE_STAFF.forEach(s => { TREE_BY_ID[s.id] = { x: s.x, y: s.y, isStaff: true }; });

const INFECTED_IDS = ['A3', 'A1', 'A2', 'SD1', 'B2', 'B1', 'B3'];
const TREE_EDGES = [
  ['A3', 'A1'],
  ['A3', 'A2'],
  ['A3', 'SD1'],
  ['SD1', 'B2'],
  ['B2', 'B1'],
  ['B2', 'B3'],
];

const A3_DETAILS = {
  id: 'A3',
  ward: 'Ward A',
  estimatedInfection: '2026-04-14',
  likelyInfector: 'index case (none)',
  likelyInfectees: ['A1', 'A2', 'SD1'],
  highRiskContacts: ['A4', 'A5', 'A6'],
  posterior: 0.94,
};

const STRATEGIES = [
  {
    num: '01', name: 'Standard Precautions',
    color: '#7d8aa3', containment: 0.42,
    details: [
      ['Screening', 'Symptomatic'],
      ['PCR', '8/day'],
      ['Staffing', '1:10'],
      ['Scope', 'All wards'],
    ],
  },
  {
    num: '02', name: 'Patient Cohorting',
    color: '#8a7da3', containment: 0.71,
    details: [
      ['Screening', 'Risk-ranked'],
      ['PCR', '10/day'],
      ['Staffing', '1:6'],
      ['Scope', 'Ward B + C'],
    ],
  },
  {
    num: '03', name: 'Patient + Staff Cohorting',
    color: COLOR.gold, containment: 0.93,
    details: [
      ['Screening', 'Risk-ranked'],
      ['PCR', '10/day'],
      ['Staffing', '1:4 (locked)'],
      ['Scope', 'Ward B + C'],
    ],
    recommended: true,
  },
  {
    num: '04', name: 'Ward Closure',
    color: '#a39474', containment: 0.96,
    details: [
      ['Screening', 'Symptomatic'],
      ['PCR', '10/day'],
      ['Staffing', '1:3'],
      ['Scope', 'Ward A unchanged'],
    ],
    cost: true,
  },
];

const PROMPT_TEXT = 'Devise 4 control strategies. Max 10 PCR/day. I cannot transfer anyone from Ward A.';

// ─────────────────────────────────────────────────────────────────────────
// Manhattan path with rounded corners + endpoint retraction
// ─────────────────────────────────────────────────────────────────────────
function manhattanPath(ax, ay, bx, by, r = 6, childR = 13) {
  const dirH = bx > ax ? 1 : (bx < ax ? -1 : 0);
  const dirV = by > ay ? 1 : (by < ay ? -1 : 0);
  // Same y — straight horizontal, retract by childR
  if (dirV === 0) {
    const ex = bx - dirH * childR;
    const d = `M ${ax} ${ay} L ${ex} ${ay}`;
    return { d, len: Math.abs(ex - ax) };
  }
  // Same x — straight vertical
  if (dirH === 0) {
    const ey = by - dirV * childR;
    const d = `M ${ax} ${ay} L ${ax} ${ey}`;
    return { d, len: Math.abs(ey - ay) };
  }
  // Manhattan: down to midY, horizontal, then down to b (with rounded corners)
  const midY = (ay + by) / 2;
  const ey = by - dirV * childR;
  // If too narrow for a clean corner radius, fall back to a single L
  if (Math.abs(midY - ay) < r * 1.5 || Math.abs(by - midY) < r * 1.5 || Math.abs(bx - ax) < r * 2) {
    const d = `M ${ax} ${ay} L ${ax} ${midY} L ${bx} ${midY} L ${bx} ${ey}`;
    return { d, len: Math.abs(midY - ay) + Math.abs(bx - ax) + Math.abs(ey - midY) };
  }
  const corner1y = midY - r * dirV;
  const corner1x = ax + r * dirH;
  const corner2x = bx - r * dirH;
  const corner2y = midY + r * dirV;
  const d =
    `M ${ax} ${ay} ` +
    `L ${ax} ${corner1y} ` +
    `Q ${ax} ${midY}, ${corner1x} ${midY} ` +
    `L ${corner2x} ${midY} ` +
    `Q ${bx} ${midY}, ${bx} ${corner2y} ` +
    `L ${bx} ${ey}`;
  // Approximate path length
  const len =
    Math.abs(corner1y - ay)
    + 1.57 * r
    + Math.abs(corner2x - corner1x)
    + 1.57 * r
    + Math.abs(ey - corner2y);
  return { d, len };
}

// ─────────────────────────────────────────────────────────────────────────
// DashboardScene
// ─────────────────────────────────────────────────────────────────────────
function DashboardScene() {
  const { localTime: t } = useSprite();

  const cursorVisP   = clamp(t / 0.4, 0, 1);
  // Dashboard frame expands FROM (LOGO_X, LOGO_Y) starting at lt 2.0
  const dashOpen     = clamp((t - 2.0) / 1.8, 0, 1);
  const treeP        = clamp((t - 4.5) / 2.4, 0, 1);
  const popupP       = clamp((t - 8.7) / 0.8, 0, 1);
  const popupOutP    = clamp((t - 13.0) / 0.6, 0, 1);
  const chatP        = clamp((t - 14.0) / 1.0, 0, 1);

  const typeStart = 15.5;
  const typeEnd   = 19.5;
  const promptChars = Math.floor(clamp((t - typeStart) / (typeEnd - typeStart), 0, 1) * PROMPT_TEXT.length);
  const sent = t >= typeEnd;
  const thinkingP = sent && t < 21.0
    ? clamp((t - typeEnd) / 0.4, 0, 1) * (1 - clamp((t - 21.0) / 0.4, 0, 1))
    : 0;
  const strategiesP = clamp((t - 21.0) / 1.5, 0, 1);
  const deployClickP = clamp((t - 24.0) / 0.6, 0, 1);

  const cursor = cursorAt(t);

  const popupVisible = t > 8.7 && t < 13.0;
  // Chrome only when dashboard is at least mostly open (avoids overlap with foundry chrome)
  const showChrome = dashOpen > 0.6;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {showChrome && <FdyChrome chapter="Analytics" />}

      {/* Dashboard frame — present from lt 2.0; expands FROM logo position */}
      {dashOpen > 0 && (
        <DashboardFrame
          openP={dashOpen}
          treeP={treeP}
          popupP={popupP * (1 - popupOutP)}
          popupVisible={popupVisible}
          chatP={chatP}
          promptChars={promptChars}
          sent={sent}
          thinkingP={thinkingP}
          strategiesP={strategiesP}
          deployClickP={deployClickP}
          t={t}
        />
      )}

      <FdyCursor
        x={cursor.x} y={cursor.y}
        clicking={cursor.click}
        hidden={cursorVisP < 0.5}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// DashboardFrame — expands FROM logo (LOGO_X, LOGO_Y) toward full size
// ─────────────────────────────────────────────────────────────────────────
function DashboardFrame({
  openP, treeP, popupP, popupVisible, chatP,
  promptChars, sent, thinkingP, strategiesP, deployClickP, t,
}) {
  const eased = Easing.easeOutCubic(openP);
  // Frame fills (80, 80) to (1200, 640). Origin in local space:
  // (LOGO_X - 80, LOGO_Y - 80) = (472, 516)
  const ox = LOGO_X - 80;
  const oy = LOGO_Y - 80;

  return (
    <div style={{
      position: 'absolute', left: 80, top: 80,
      width: 1120, height: 560,
      opacity: openP,
      transform: `scale(${eased})`,
      transformOrigin: `${ox}px ${oy}px`,
      background: '#fff',
      border: `1px solid ${COLOR.panelLine}`,
      borderRadius: 6,
      boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
      overflow: 'hidden',
    }}>
      {/* Header — stats strip replaces the MCMC tag */}
      <div style={{
        height: 44,
        borderBottom: `1px solid ${COLOR.rule}`,
        display: 'flex', alignItems: 'center',
        padding: '0 18px', gap: 18,
        background: '#fcfcfb',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FdyBrandMark size={18} />
          <FdyWordmark size={13} />
        </div>
        <div style={{ width: 1, height: 18, background: COLOR.rule }} />
        <div style={{
          fontFamily: FONT_MONO, fontSize: 10,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: COLOR.mute,
        }}>Outbreak Forensics</div>
        <div style={{ flex: 1 }} />
        {/* Stats strip — counts tick up as the tree builds */}
        <StatsStrip treeP={treeP} />
        {/* AI Co-Pilot icon */}
        <div style={{
          width: 30, height: 30,
          marginLeft: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${COLOR.ruleStrong}`,
          borderRadius: 6,
          background: chatP > 0.1 ? 'rgba(30,30,43,0.06)' : '#fff',
          transition: 'background 200ms',
        }}>
          <FdyRobot size={22} glowing={chatP < 0.5 && t > 12.5} accent={COLOR.ink} />
        </div>
      </div>

      {/* Body */}
      <div style={{
        position: 'absolute', left: 0, right: chatP > 0.1 ? 380 : 0, top: 44, bottom: 0,
        transition: 'right 400ms cubic-bezier(.4,.2,.2,1)',
      }}>
        <TransmissionTreePane treeP={treeP} t={t} />

        {popupVisible && popupP > 0 && (
          <PatientPopup p={popupP} />
        )}

        {strategiesP > 0 && (
          <StrategyDrawer p={strategiesP} deployClickP={deployClickP} />
        )}
      </div>

      {/* AI Co-Pilot chat sidebar */}
      <div style={{
        position: 'absolute', right: 0, top: 44, bottom: 0,
        width: 380,
        transform: `translateX(${(1 - chatP) * 380}px)`,
        background: '#fcfcfb',
        borderLeft: `1px solid ${COLOR.rule}`,
        display: 'flex', flexDirection: 'column',
        opacity: chatP,
      }}>
        <CoPilotChat
          promptChars={promptChars}
          sent={sent}
          thinkingP={thinkingP}
          strategiesP={strategiesP}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Stats strip — 4 ticking counters in the dashboard header
// ─────────────────────────────────────────────────────────────────────────
function StatsStrip({ treeP }) {
  const eased = Easing.easeOutQuart(clamp(treeP, 0, 1));
  const stats = [
    { v: Math.round(7 * eased), label: 'infected' },
    { v: Math.round(1 * eased), label: 'superspreader' },
    { v: Math.round(2 * eased), label: 'wards affected' },
    { v: (0.94 * eased).toFixed(2), label: 'posterior' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      {stats.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 16,
            letterSpacing: '-0.02em', color: COLOR.ink,
            fontVariantNumeric: 'tabular-nums',
          }}>{s.v}</span>
          <span style={{
            fontFamily: FONT_MONO, fontSize: 9,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: COLOR.mute,
          }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Transmission tree pane — orthogonal edges with rounded corners
// ─────────────────────────────────────────────────────────────────────────
function TransmissionTreePane({ treeP, t }) {
  const isInfected = (id) => INFECTED_IDS.includes(id);
  const isGold = (id) => id === 'A3' && treeP > 0.3;
  const highlightA3 = t > 8.7 && t < 13.0;

  return (
    <svg width="100%" height="100%" viewBox="0 0 1120 472" preserveAspectRatio="xMidYMid meet">
      {/* Arrowhead marker */}
      <defs>
        <marker id="fdyTreeArrow" viewBox="0 0 10 10"
          refX="9" refY="5"
          markerWidth="8" markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={COLOR.alert} />
        </marker>
      </defs>

      {/* Ward backgrounds */}
      <g opacity={treeP}>
        {WARD_LAYOUT.map((w) => (
          <g key={w.key}>
            <rect x={w.x0} y={70} width={w.x1 - w.x0} height={340}
              fill={COLOR.wardTint}
              stroke={COLOR.wardLine} strokeWidth="0.7"
              strokeDasharray="2 3" />
            <text x={w.x0 + 10} y={88}
              fontFamily={FONT_MONO} fontSize="10"
              fill={COLOR.ink} letterSpacing="2.4"
              style={{ textTransform: 'uppercase' }}>{w.label}</text>
            {[TREE_ROOM_TOP_Y, TREE_ROOM_BOT_Y].map((cy, j) => (
              <rect key={j}
                x={w.x0 + 14} y={cy - 30}
                width={(w.x1 - w.x0) - 28} height={60}
                rx="3"
                fill="#fff"
                stroke={COLOR.ruleStrong} strokeWidth="0.7" />
            ))}
          </g>
        ))}
      </g>

      {/* Tree edges — orthogonal Manhattan paths */}
      <g>
        {TREE_EDGES.map(([from, to], i) => {
          const a = TREE_BY_ID[from];
          const b = TREE_BY_ID[to];
          if (!a || !b) return null;
          const reveal = clamp((treeP - 0.25 - i * 0.05) * 1.6, 0, 1);
          const childR = b.isStaff ? 14 : 13;
          const { d, len } = manhattanPath(a.x, a.y, b.x, b.y, 8, childR);
          return (
            <path key={i}
              d={d}
              stroke={COLOR.alert}
              strokeWidth="1.3"
              fill="none"
              strokeDasharray={`${len}`}
              strokeDashoffset={len * (1 - reveal)}
              opacity={reveal}
              markerEnd={reveal > 0.92 ? 'url(#fdyTreeArrow)' : undefined} />
          );
        })}
      </g>

      {/* Patient nodes */}
      {TREE_PATIENTS.map((p, i) => {
        const reveal = clamp((treeP - i * 0.03) * 1.6, 0, 1);
        const eased = Easing.easeOutBack(clamp(reveal, 0, 1));
        const inf = isInfected(p.id);
        const gold = isGold(p.id);
        const r = gold ? 13 : 10;
        const fill = gold ? COLOR.gold : inf ? COLOR.alert : COLOR.patient;
        const stroke = gold ? COLOR.gold : inf ? COLOR.alert : COLOR.mute;
        const showHighlight = p.id === 'A3' && highlightA3;
        return (
          <g key={p.id} transform={`translate(${p.x}, ${p.y}) scale(${eased})`}>
            {gold && (
              <circle r="22" fill="none" stroke={COLOR.gold} strokeWidth="0.9" opacity="0.6">
                <animate attributeName="r" values="14;26;14" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0;0.7" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            {showHighlight && (
              <circle r="28" fill="none" stroke={COLOR.alert} strokeWidth="1.2" opacity="0.9" strokeDasharray="3 3">
                <animate attributeName="r" values="20;30;20" dur="1.0s" repeatCount="indefinite" />
              </circle>
            )}
            <circle r={r} fill={fill} stroke={stroke} strokeWidth="1" />
            <text x="0" y={r + 13}
              fontFamily={FONT_MONO} fontSize="9"
              fill={gold ? COLOR.gold : (inf ? COLOR.alert : COLOR.mute)}
              letterSpacing="1.2" textAnchor="middle"
              fontWeight={gold ? 600 : 400}>{p.id}</text>
          </g>
        );
      })}

      {/* Staff nodes */}
      {TREE_STAFF.map((s, i) => {
        const reveal = clamp((treeP - 0.4 - i * 0.05) * 1.6, 0, 1);
        const eased = Easing.easeOutBack(clamp(reveal, 0, 1));
        const inf = isInfected(s.id);
        const r = 11;
        const fill = inf ? COLOR.alert : COLOR.staff;
        const stroke = inf ? COLOR.alert : COLOR.mute;
        return (
          <g key={s.id} transform={`translate(${s.x}, ${s.y}) scale(${eased})`}>
            <polygon points={`0,${-r} ${r},0 0,${r} ${-r},0`}
              fill={fill} stroke={stroke} strokeWidth="1" />
            <text x="0" y={r + 13}
              fontFamily={FONT_MONO} fontSize="9"
              fill={inf ? COLOR.alert : COLOR.mute}
              letterSpacing="1.2" textAnchor="middle">{s.id}</text>
          </g>
        );
      })}

      {/* Legend */}
      <g opacity={treeP * 0.85} transform="translate(40, 440)">
        <circle cx="6" cy="0" r="6" fill={COLOR.patient} stroke={COLOR.mute} strokeWidth="1" />
        <text x="18" y="3" fontFamily={FONT_MONO} fontSize="9" fill={COLOR.text} letterSpacing="0.5">susceptible patient</text>
        <polygon points="146,-6 152,0 146,6 140,0" fill={COLOR.staff} stroke={COLOR.mute} strokeWidth="1" />
        <text x="158" y="3" fontFamily={FONT_MONO} fontSize="9" fill={COLOR.text} letterSpacing="0.5">susceptible staff</text>
        <circle cx="276" cy="0" r="6" fill={COLOR.alert} stroke={COLOR.alert} strokeWidth="1" />
        <text x="288" y="3" fontFamily={FONT_MONO} fontSize="9" fill={COLOR.alert} letterSpacing="0.5">infected</text>
        <circle cx="356" cy="0" r="6" fill={COLOR.gold} stroke={COLOR.gold} strokeWidth="1" />
        <text x="368" y="3" fontFamily={FONT_MONO} fontSize="9" fill={COLOR.gold} letterSpacing="0.5">superspreader</text>
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Patient popup card (anchored to A3)
// ─────────────────────────────────────────────────────────────────────────
function PatientPopup({ p }) {
  const eased = Easing.easeOutCubic(p);
  return (
    <div style={{
      position: 'absolute',
      left: 412, top: 32,
      width: 340,
      background: '#fff',
      border: `2px solid ${COLOR.gold}`,
      borderRadius: 8,
      padding: '14px 16px',
      boxShadow: '0 12px 28px rgba(0,0,0,0.14)',
      opacity: eased,
      transform: `translateY(${(1 - eased) * 8}px)`,
      pointerEvents: 'none',
      zIndex: 5,
    }}>
      <div style={{
        position: 'absolute', left: -8, top: 60,
        width: 14, height: 14,
        background: '#fff',
        borderLeft: `2px solid ${COLOR.gold}`,
        borderBottom: `2px solid ${COLOR.gold}`,
        transform: 'rotate(45deg)',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          fontFamily: FONT_MONO, fontSize: 9,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: COLOR.gold, fontWeight: 600,
        }}>Superspreader · Patient</span>
      </div>
      <div style={{
        fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 24,
        color: COLOR.ink, letterSpacing: '-0.02em',
      }}>{A3_DETAILS.id} <span style={{ color: COLOR.mute, fontSize: 14, fontWeight: 400 }}>· {A3_DETAILS.ward}</span></div>

      <div style={{ marginTop: 14, display: 'grid', gap: 10, fontFamily: FONT_MONO, fontSize: 11 }}>
        <Row label="Estimated infection" value={A3_DETAILS.estimatedInfection} />
        <Row label="Likely infector"     value={A3_DETAILS.likelyInfector} />
        <Row label="Likely infectees"    value={A3_DETAILS.likelyInfectees.join(', ')} valueColor={COLOR.alert} />
        <Row label="High-risk contacts"  value={A3_DETAILS.highRiskContacts.join(', ')} />
        <Row label="Posterior"           value={A3_DETAILS.posterior.toFixed(2)} valueColor={COLOR.alert} />
      </div>
    </div>
  );
}

function Row({ label, value, valueColor = COLOR.ink }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{
        color: COLOR.mute, letterSpacing: '0.16em',
        textTransform: 'uppercase', fontSize: 9,
      }}>{label}</span>
      <span style={{ color: valueColor, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// AI Co-Pilot chat sidebar
//   • Chat input border uses ink (was red while typing)
//   • Thinking dots use ink (was red)
// ─────────────────────────────────────────────────────────────────────────
function CoPilotChat({ promptChars, sent, thinkingP, strategiesP }) {
  const promptShown = PROMPT_TEXT.slice(0, promptChars);
  const isTyping = promptChars > 0 && !sent;
  const showThinking = thinkingP > 0;
  const showFollowUp = strategiesP > 0.2;

  return (
    <React.Fragment>
      <div style={{
        padding: '14px 16px',
        borderBottom: `1px solid ${COLOR.rule}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <FdyRobot size={26} glowing accent={COLOR.ink} />
        <div>
          <div style={{
            fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 14,
            color: COLOR.ink, letterSpacing: '-0.01em',
          }}>IPC Co-Pilot</div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 9,
            letterSpacing: '0.2em', color: COLOR.mute, textTransform: 'uppercase',
          }}>Online</div>
        </div>
      </div>

      <div style={{
        flex: 1,
        padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
        overflow: 'hidden',
      }}>
        <ChatBubble who="bot">
          Outbreak detected on Ward A, index case A3. How can I help?
        </ChatBubble>

        {sent && (
          <ChatBubble who="user">{PROMPT_TEXT}</ChatBubble>
        )}

        {showThinking && (
          <ChatBubble who="bot">
            <span style={{ display: 'inline-flex', gap: 4 }}>
              <ThinkingDot delay="0s" />
              <ThinkingDot delay="0.2s" />
              <ThinkingDot delay="0.4s" />
            </span>
          </ChatBubble>
        )}

        {showFollowUp && (
          <ChatBubble who="bot">
            Generated 4 strategies respecting your constraints. See main view.
          </ChatBubble>
        )}
      </div>

      <div style={{
        padding: '12px 16px',
        borderTop: `1px solid ${COLOR.rule}`,
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <div style={{
          flex: 1,
          padding: '8px 10px',
          background: '#fff',
          // Reserved red — input border uses ink while active
          border: `1px solid ${isTyping ? COLOR.ink : COLOR.ruleStrong}`,
          borderRadius: 6,
          fontFamily: FONT_MONO, fontSize: 11,
          color: sent ? COLOR.faint : (promptShown ? COLOR.ink : COLOR.mute),
          letterSpacing: '0.04em',
          minHeight: 16,
          transition: 'border-color 200ms',
        }}>
          {sent
            ? <span style={{ color: COLOR.faint }}>Ask Co-Pilot…</span>
            : (promptShown
                ? <span>{promptShown}{isTyping && <span style={{ color: COLOR.ink }}>▌</span>}</span>
                : <span>Ask Co-Pilot…</span>
              )
          }
        </div>
        <button style={{
          padding: '8px 12px',
          background: COLOR.ink, color: '#fff',
          border: 'none', borderRadius: 6,
          fontFamily: FONT_MONO, fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Send</button>
      </div>
    </React.Fragment>
  );
}

function ChatBubble({ who, children }) {
  const isBot = who === 'bot';
  return (
    <div style={{
      alignSelf: isBot ? 'flex-start' : 'flex-end',
      maxWidth: '88%',
      padding: '8px 12px',
      background: isBot ? '#fff' : COLOR.ink,
      color: isBot ? COLOR.ink : '#fff',
      border: isBot ? `1px solid ${COLOR.ruleStrong}` : 'none',
      borderRadius: 10,
      borderTopLeftRadius: isBot ? 2 : 10,
      borderTopRightRadius: isBot ? 10 : 2,
      fontFamily: FONT_MONO, fontSize: 11,
      lineHeight: 1.5, letterSpacing: '0.02em',
    }}>
      {children}
    </div>
  );
}

function ThinkingDot({ delay }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 5, height: 5, borderRadius: '50%',
      background: COLOR.ink,
      animation: `fdyPulse 1s ${delay} infinite`,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Strategy drawer — slides up from the bottom of the body (220 tall),
// keeps the tree visible above. Cursor walks to recommended (Scenario 03)
// and clicks; "Deploying" confirmation slides up over the card.
// ─────────────────────────────────────────────────────────────────────────
function StrategyDrawer({ p, deployClickP }) {
  const slideP = Easing.easeOutCubic(clamp(p, 0, 1));
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      height: 220,
      transform: `translateY(${(1 - slideP) * 220}px)`,
      opacity: slideP,
      background: '#fff',
      borderTop: `1px solid ${COLOR.ruleStrong}`,
      boxShadow: '0 -8px 24px rgba(0,0,0,0.10)',
      padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <FdyRobot size={18} accent={COLOR.ink} />
        <div style={{
          fontFamily: FONT_MONO, fontSize: 9,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: COLOR.ink, fontWeight: 600,
        }}>IPC Co-Pilot · 4 strategies</div>
        <div style={{ flex: 1 }} />
        <div style={{
          fontFamily: FONT_MONO, fontSize: 9,
          letterSpacing: '0.16em', color: COLOR.mute,
        }}>10 PCR/day · no Ward A transfers</div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10, flex: 1,
      }}>
        {STRATEGIES.map((s, i) => {
          const reveal = clamp((p - i * 0.10) * 1.5, 0, 1);
          const eased = Easing.easeOutCubic(reveal);
          const containmentEased = Easing.easeOutQuart(reveal);
          const isS3 = s.recommended;
          const deployed = isS3 && deployClickP > 0;
          return (
            <div key={s.num} style={{
              opacity: eased,
              transform: `translateY(${(1 - eased) * 8}px)`,
              padding: 12,
              background: '#fff',
              border: `${isS3 ? 2 : 1}px solid ${isS3 ? COLOR.gold : COLOR.ruleStrong}`,
              borderRadius: 6,
              position: 'relative',
              display: 'flex', flexDirection: 'column', gap: 6,
              overflow: 'hidden',
            }}>
              {isS3 && (
                <div style={{
                  position: 'absolute', top: -10, right: 8,
                  background: COLOR.gold, color: COLOR.ink,
                  padding: '2px 6px',
                  fontFamily: FONT_MONO, fontSize: 8,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  borderRadius: 3,
                  fontWeight: 600,
                }}>★ Recommended</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.color }} />
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 9,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: COLOR.mute,
                }}>Scenario {s.num}</span>
              </div>
              <div style={{
                fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 13,
                color: COLOR.ink, lineHeight: 1.2, letterSpacing: '-0.01em',
              }}>{s.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                  fontFamily: FONT_DISPLAY, fontWeight: 500, fontSize: 26,
                  color: isS3 ? COLOR.gold : COLOR.ink,
                  letterSpacing: '-0.04em', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {Math.round(s.containment * containmentEased * 100)}%
                </span>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 8,
                  color: COLOR.mute, letterSpacing: '0.16em',
                  textTransform: 'uppercase', fontWeight: 400,
                }}>containment</span>
              </div>
              <div style={{ height: 2, background: COLOR.rule, position: 'relative' }}>
                <div style={{
                  height: '100%',
                  width: `${s.containment * containmentEased * 100}%`,
                  background: isS3 ? COLOR.gold : s.color,
                }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 2 }}>
                {s.details.map(([k, v], j) => (
                  <div key={j} style={{
                    fontFamily: FONT_MONO, fontSize: 8.5,
                    color: COLOR.text,
                    display: 'flex', justifyContent: 'space-between',
                  }}>
                    <span style={{ color: COLOR.mute }}>{k}</span>
                    <span style={{ color: COLOR.ink }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Deploy confirmation overlay */}
              {deployed && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(245,179,1,0.10)',
                  border: `2px solid ${COLOR.gold}`,
                  borderRadius: 6,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  opacity: deployClickP,
                }}>
                  <div style={{
                    fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 600,
                    color: COLOR.ink, letterSpacing: '-0.01em',
                  }}>
                    <span style={{ color: COLOR.gold }}>✓</span> Deploying
                  </div>
                  <div style={{
                    fontFamily: FONT_MONO, fontSize: 8,
                    color: COLOR.mute, letterSpacing: '0.18em',
                    textTransform: 'uppercase', marginTop: 4, textAlign: 'center', padding: '0 8px',
                  }}>Ward B + C cohort initiated</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { DashboardScene });
