// ==========================================
// SHARED BRAND MARK COMPONENT  (Networked Trilobe)
// Canvas-drawn version of the inline SVG used in the nav & footer.
// Palantir-restrained: 4 corner brackets + 3 nodes + 3 spokes + red hub.
// Called by pipeline-viz.js inside the inference node animation.
// ==========================================
window.drawBrandMark = function (ctx, frame, cx, cy, opts) {
    opts = opts || {};
    var size = opts.size || 34;                    // total px width/height
    var ink = opts.color || 'rgba(30,30,43,1)';    // bracket + node stroke color
    var alert = opts.alert || '#ff073a';           // hub color
    var s = size / 32;                             // viewBox is 32 units

    // Coordinate mapping: viewBox center (16, 16) becomes (0, 0) via translate
    function X(x) { return (x - 16) * s; }
    function Y(y) { return (y - 16) * s; }

    ctx.save();
    ctx.translate(cx, cy);

    // ── Corner brackets (heaviest stroke — 1.2 in viewBox units) ──
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.2 * s;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    // TL
    ctx.beginPath(); ctx.moveTo(X(3), Y(8)); ctx.lineTo(X(3), Y(3)); ctx.lineTo(X(8), Y(3)); ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(X(24), Y(3)); ctx.lineTo(X(29), Y(3)); ctx.lineTo(X(29), Y(8)); ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(X(29), Y(24)); ctx.lineTo(X(29), Y(29)); ctx.lineTo(X(24), Y(29)); ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(X(8), Y(29)); ctx.lineTo(X(3), Y(29)); ctx.lineTo(X(3), Y(24)); ctx.stroke();

    // ── Spokes: hub → three outer nodes (thin, 0.55) ──
    ctx.lineCap = 'round';
    ctx.lineWidth = Math.max(0.5, 0.55 * s);
    ctx.beginPath();
    ctx.moveTo(X(16.00), Y(11.20)); ctx.lineTo(X(16.00), Y(15.60));
    ctx.moveTo(X(11.31), Y(19.30)); ctx.lineTo(X(15.13), Y(17.10));
    ctx.moveTo(X(20.69), Y(19.30)); ctx.lineTo(X(16.87), Y(17.10));
    ctx.stroke();

    // ── Three outer nodes (thinnest hairline, 0.35) ──
    ctx.lineWidth = Math.max(0.4, 0.35 * s);
    var NODES = [[16, 9], [9.4, 20.4], [22.6, 20.4]];
    for (var i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(X(NODES[i][0]), Y(NODES[i][1]), 2.2 * s, 0, Math.PI * 2);
        ctx.stroke();
    }

    // ── Central red hub, with a very subtle breathing pulse tied to frame ──
    var pulse = 1 + Math.sin((frame || 0) * 0.05) * 0.08;   // ±8% diameter
    ctx.fillStyle = alert;
    ctx.beginPath();
    ctx.arc(X(16), Y(16.6), 1.05 * s * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
};
