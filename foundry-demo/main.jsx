// main.jsx — root component for the Foundry demo. Used to be inline at the
// bottom of index.html when JSX was Babel-transformed in the browser; now
// pre-compiled by esbuild into bundle.js (see ../package.json `build:demo`).

const DURATION = 48.5;

function NosoTrackFoundryDemo() {
  return (
    <Stage width={1280} height={720} duration={DURATION} background="#fafafa" persistKey="nosotrack-foundry-v3">
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
