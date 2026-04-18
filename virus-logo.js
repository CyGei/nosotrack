// ==========================================
// SHARED VIRUS LOGO COMPONENT
// Palantir design v2 — monochrome, takes a base RGB triplet
// so the same component can render ink-on-light and light-on-ink.
// ==========================================
window.drawVirusLogo = function (ctx, frame, cx, cy, opts) {
    opts = opts || {};
    // Base color as "R,G,B" triplet (for rgba composition). Defaults to ink.
    var base = opts.color || '30,30,43';
    var coreR = 12, spikeCount = 10, spikeLen = 9, bulbR = 2.5;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(frame * 0.006);

    // Outer subtle glow
    var outerGlow = ctx.createRadialGradient(0, 0, coreR + spikeLen, 0, 0, coreR + spikeLen + 8);
    outerGlow.addColorStop(0, 'rgba(' + base + ',0.05)');
    outerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlow;
    ctx.beginPath(); ctx.arc(0, 0, coreR + spikeLen + 8, 0, Math.PI * 2); ctx.fill();

    // Spike proteins
    for (var si = 0; si < spikeCount; si++) {
        var angle = (si / spikeCount) * Math.PI * 2;
        var wobble = Math.sin(frame * 0.03 + si * 1.7) * 1;
        var sx = Math.cos(angle) * coreR, sy = Math.sin(angle) * coreR;
        var ex = Math.cos(angle) * (coreR + spikeLen + wobble);
        var ey = Math.sin(angle) * (coreR + spikeLen + wobble);
        ctx.strokeStyle = 'rgba(' + base + ',0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
        var bGrad = ctx.createRadialGradient(ex, ey, 0, ex, ey, bulbR);
        bGrad.addColorStop(0, 'rgba(' + base + ',0.8)');
        bGrad.addColorStop(1, 'rgba(' + base + ',0.2)');
        ctx.fillStyle = bGrad;
        ctx.beginPath(); ctx.arc(ex, ey, bulbR, 0, Math.PI * 2); ctx.fill();
    }

    // Core body
    var bodyGrad = ctx.createRadialGradient(-2, -2, 0, 0, 0, coreR);
    bodyGrad.addColorStop(0, 'rgba(' + base + ',0.55)');
    bodyGrad.addColorStop(0.6, 'rgba(' + base + ',0.28)');
    bodyGrad.addColorStop(1, 'rgba(' + base + ',0.10)');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(' + base + ',0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(0, 0, coreR, 0, Math.PI * 2); ctx.stroke();

    // Membrane rings
    ctx.strokeStyle = 'rgba(' + base + ',0.12)';
    ctx.lineWidth = 0.4;
    for (var ri = 0; ri < 2; ri++) {
        ctx.beginPath(); ctx.arc(0, 0, 4 + ri * 4, 0, Math.PI * 2); ctx.stroke();
    }

    // Highlight (always a soft light hint for depth)
    var hlGrad = ctx.createRadialGradient(-3, -3, 0, -2, -2, 6);
    hlGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
    hlGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = hlGrad;
    ctx.beginPath(); ctx.arc(-2, -2, 6, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
};
