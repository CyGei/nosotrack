// pipeline-bg.js — background particle field + step-to-step connectors for #platform.
// Self-bootstrapping: owns its frame counter and rAF loop.

(function () {
    'use strict';
    if (!window.NosoTrack || !window.NosoTrack.initCanvas) {
        console.warn('[pipeline-bg] pipeline-utils.js must load first.');
        return;
    }
    const { initCanvas } = window.NosoTrack;
    let frame = 0;

    // ── Background field ──
    const bgCanvas = document.getElementById('pipeline-bg');
    let bgCtx, bgW, bgH;
    const bgParticles = [];

    function initBg() {
        if (!bgCanvas) return;
        const dpr = Math.min(window.devicePixelRatio, 2);
        const section = bgCanvas.parentElement;
        bgW = section.clientWidth; bgH = section.clientHeight;
        bgCanvas.width = bgW * dpr; bgCanvas.height = bgH * dpr;
        bgCtx = bgCanvas.getContext('2d'); bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bgParticles.length = 0;
        for (let i = 0; i < 35; i++) {
            bgParticles.push({
                x: Math.random() * bgW, y: Math.random() * bgH,
                vy: 0.12 + Math.random() * 0.25,
                size: Math.random() * 1 + 0.3,
                opacity: Math.random() * 0.12 + 0.02
            });
        }
    }
    function drawBg() {
        if (!bgCtx) return;
        bgCtx.clearRect(0, 0, bgW, bgH);
        bgParticles.forEach(p => {
            p.y += p.vy;
            if (p.y > bgH + 4) { p.y = -4; p.x = Math.random() * bgW; }
            bgCtx.fillStyle = `rgba(255,7,58,${p.opacity})`;
            bgCtx.beginPath(); bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2); bgCtx.fill();
        });
    }

    // ── Inter-step connectors ──
    const connectors = [];

    function makeConnector(c, count) {
        const info = initCanvas(c); if (!info) return null;
        const { ctx, w, h } = info;
        const particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: w * (0.35 + Math.random() * 0.3),
                y: Math.random() * h,
                vy: 0.3 + Math.random() * 0.4,
                size: Math.random() * 1.5 + 0.5,
                phase: Math.random() * Math.PI * 2
            });
        }
        return { ctx, w, h, particles, el: c };
    }

    function initConnectors() {
        connectors.length = 0;
        for (let i = 1; i <= 4; i++) {
            const c = makeConnector(document.getElementById('connector-' + i), 7);
            if (c) connectors.push(c);
        }
    }

    function drawConnector(c) {
        if (!c) return;
        c.ctx.clearRect(0, 0, c.w, c.h);
        c.ctx.strokeStyle = 'rgba(30,30,43,0.03)'; c.ctx.lineWidth = 1;
        c.ctx.setLineDash([2, 6]);
        c.ctx.beginPath(); c.ctx.moveTo(c.w / 2, 0); c.ctx.lineTo(c.w / 2, c.h); c.ctx.stroke();
        c.ctx.setLineDash([]);
        c.particles.forEach(p => {
            p.y += p.vy; p.x += Math.sin(frame * 0.02 + p.phase) * 0.25;
            if (p.y > c.h + 4) { p.y = -4; p.x = c.w * (0.4 + Math.random() * 0.2); }
            const grad = c.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
            grad.addColorStop(0, 'rgba(255,7,58,0.5)');
            grad.addColorStop(1, 'transparent');
            c.ctx.fillStyle = grad;
            c.ctx.beginPath(); c.ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2); c.ctx.fill();
            c.ctx.fillStyle = '#1e1e2b';
            c.ctx.beginPath(); c.ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2); c.ctx.fill();
        });
    }

    function init() { initBg(); initConnectors(); }
    function loop() { frame++; drawBg(); connectors.forEach(drawConnector); requestAnimationFrame(loop); }

    init();
    requestAnimationFrame(loop);
    window.addEventListener('resize', init);
})();
