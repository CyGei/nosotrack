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

// Integration: ~22 s loop. FoundryStack in steady mode plays the infection
// chain on a fixed cycle. Long enough to see A3 → A1/A2/SD1 → B2 → B1/B3,
// A3 turning gold, then resetting cleanly.
const DURATION_STEADY = 22;

// End-to-end: total loop ≈ 30 s. Plays as:
//   • Phase A (0 – 6.5 s): NotificationLogo — centred brand mark with
//     iOS-style notification badge counting 1 → 4.
//   • Phase B (6.5 – 9):   Cursor click + network spin + collapse.
//   • Phase C (5 – 30):    DashboardScene (cursor entry at lt 0 = stage 5,
//                          click at lt 1.5 = stage 6.5, expand from
//                          (640, 360), tree → A3 popup → IPC chat →
//                          strategies → deploy).
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
        <FoundryStack mode="steady" />
      </Sprite>
    </Stage>
  );
}

function EndToEndLoop() {
  // NotificationLogo runs from stage_t 0..9 (its lt 6.5 = click moment,
  // matching DashboardScene's cursor click at its own lt 1.5 = stage_t 6.5).
  // DashboardScene starts at stage_t 5 so its cursor enters the frame just
  // before the click; logoX/logoY redirect both the cursor target and the
  // dashboard transform-origin to stage centre.
  return (
    <Stage width={1280} height={720} duration={DURATION_ENDTOEND} background="#fafafa" loop={true}>
      <Sprite start={0} end={9}>
        <NotificationLogo logoX={ENDTOEND_LOGO_X} logoY={ENDTOEND_LOGO_Y} />
      </Sprite>
      <Sprite start={5} end={DURATION_ENDTOEND}>
        <DashboardScene logoX={ENDTOEND_LOGO_X} logoY={ENDTOEND_LOGO_Y} />
      </Sprite>
    </Stage>
  );
}

function NosoTrackFoundryDemo() {
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

ReactDOM.createRoot(document.getElementById('root')).render(<NosoTrackFoundryDemo />);
