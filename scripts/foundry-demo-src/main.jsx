// main.jsx — root component for the Foundry demo. Used to be inline at the
// bottom of index.html when JSX was Babel-transformed in the browser; now
// pre-compiled by esbuild into bundle.js (see ../package.json `build:demo`).
//
// Scene routing — when loaded with `?scene=integration` or `?scene=endtoend`
// the demo mounts a tailored Stage instead of the full marketing reel:
//
//   • integration — FoundryStack alone in "steady" mode (no build-up, no
//     robot/bubble, no collapse), looping the infection chain. Drives the
//     About 0.2 block on the marketing site.
//
//   • endtoend    — BrandIntro skipped. FoundryStack picks up at lt=14.5
//     (bottom platform present, robot about to alert); robot bubble types
//     out; click + spin + collapse run as usual; DashboardScene plays
//     through tree reconstruction, A3 popup, IPC Co-Pilot chat and
//     strategy drawer with deploy. Drives About 0.3.
//
//   • (default)   — full reel (BrandIntro + FoundryStack + DashboardScene),
//     same as the standalone foundry-demo/index.html.

const PARAMS = new URLSearchParams(window.location.search);
const SCENE = PARAMS.get('scene');

const DURATION_FULL = 48.5;

// Integration: 26 s loop. IntegrationScene plays the surveillance narrative
// on one live hospital — EHR flag → LAB genomic match → RTLS contacts →
// Nosotrack fuses the three streams → transmission tree + superspreader,
// then resets cleanly.
const DURATION_STEADY = 26;

// End-to-end: total loop ≈ 30 s. Plays as:
//   • Phase A (0 – 2.0 s): NotificationLogo — centred brand mark with
//     iOS-style notification badge counting 1 → 3.
//   • Phase B (2.0 – 3.4): Cursor click + network spin + collapse.
//   • Phase C (0 – 30):    DashboardScene (cursor entry at lt 1.0, click
//                          at lt 2.0, expand from (640, 360), tree → A3
//                          popup → IPC chat → strategies → deploy).
// Logo position for this scene is stage centre, so we pass logoX/logoY
// into DashboardScene to redirect the cursor's click target and the
// dashboard frame's transform-origin.
const ENDTOEND_LOGO_X = 640;
const ENDTOEND_LOGO_Y = 360;
const DURATION_ENDTOEND = 30;

function IntegrationLoop() {
  return (
    <Stage width={1280} height={720} duration={DURATION_STEADY} background="#fafafa" loop={true}>
      <Sprite start={0} end={DURATION_STEADY}>
        <IntegrationScene />
      </Sprite>
    </Stage>
  );
}

function EndToEndLoop() {
  // NotificationLogo runs from stage_t 0..4 (its lt 2.0 = click moment,
  // matching DashboardScene's cursor click at its own lt 2.0 = stage_t 2.0).
  // DashboardScene starts at stage_t 0 alongside it; the cursor stays
  // hidden until lt 1.0, then hops in and clicks the logo. logoX/logoY
  // redirect both the cursor target and the dashboard transform-origin
  // to stage centre.
  return (
    <Stage width={1280} height={720} duration={DURATION_ENDTOEND} background="#fafafa" loop={true}>
      <Sprite start={0} end={4}>
        <NotificationLogo logoX={ENDTOEND_LOGO_X} logoY={ENDTOEND_LOGO_Y} />
      </Sprite>
      <Sprite start={0} end={DURATION_ENDTOEND}>
        <DashboardScene logoX={ENDTOEND_LOGO_X} logoY={ENDTOEND_LOGO_Y} />
      </Sprite>
    </Stage>
  );
}

function NosotrackFoundryDemo() {
  if (SCENE === 'integration') return <IntegrationLoop />;
  if (SCENE === 'endtoend')    return <EndToEndLoop />;

  return (
    <Stage width={1280} height={720} duration={DURATION_FULL} background="#fafafa" persistKey="nosotrack-foundry-v3">
      <Sprite start={0}    end={3.5}>   <BrandIntro /></Sprite>
      {/* FoundryStack and DashboardScene OVERLAP from t=23..27 so that foundry
          collapses toward the logo while dashboard expands FROM the logo, in
          a single continuous camera move. */}
      <Sprite start={3.5}  end={27}>    <FoundryStack /></Sprite>
      <Sprite start={23}   end={48.5}>  <DashboardScene /></Sprite>
    </Stage>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<NosotrackFoundryDemo />);
