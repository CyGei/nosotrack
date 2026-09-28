const PARAMS = new URLSearchParams(window.location.search);
const SCENE = PARAMS.get('scene');

const DURATION_FULL = 48.5;

const DURATION_STEADY = INTEGRATION_DURATION;

const ENDTOEND_LOGO_X = 640;
const ENDTOEND_LOGO_Y = 360;
const DURATION_ENDTOEND = 30;

function IntegrationLoop() {
  return (
    <Stage width={1280} height={720} duration={DURATION_STEADY} background="#efeeef" loop={true}>
      <Sprite start={0} end={DURATION_STEADY}>
        <IntegrationScene />
      </Sprite>
    </Stage>
  );
}

function EndToEndLoop() {
  // Crop only the outer framing. Both sprites and the cursor retain their
  // original coordinate system, timing, and shared lt 2.0 click moment.
  return (
    <Stage width={1120} height={560} duration={DURATION_ENDTOEND} background="#fff" loop={true}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1120, height: 560, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: -80, top: -80, width: 1280, height: 720 }}>
          <Sprite start={0} end={4}>
            <NotificationLogo logoX={ENDTOEND_LOGO_X} logoY={ENDTOEND_LOGO_Y} frameless />
          </Sprite>
          <Sprite start={0} end={DURATION_ENDTOEND}>
            <DashboardScene logoX={ENDTOEND_LOGO_X} logoY={ENDTOEND_LOGO_Y} frameless />
          </Sprite>
        </div>
      </div>
    </Stage>
  );
}

function NosotrackFoundryDemo() {
  if (SCENE === 'integration') return <IntegrationLoop />;
  if (SCENE === 'endtoend')    return <EndToEndLoop />;

  return (
    <Stage width={1280} height={720} duration={DURATION_FULL} background="#fafafa" persistKey="nosotrack-foundry-v3">
      <Sprite start={0}    end={3.5}>   <BrandIntro /></Sprite>
      {/* The t=23..27 overlap is required: foundry collapses toward the logo as the dashboard expands from it. */}
      <Sprite start={3.5}  end={27}>    <FoundryStack /></Sprite>
      <Sprite start={23}   end={48.5}>  <DashboardScene /></Sprite>
    </Stage>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<NosotrackFoundryDemo />);
