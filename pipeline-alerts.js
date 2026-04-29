// pipeline-alerts.js — alerts chart (ward exposure score) + terminal typewriter
// for the Reporting card on #platform.
// Self-bootstrapping: owns its frame counter and rAF loop.

(function () {
    'use strict';
    if (!window.NosoTrack || !window.NosoTrack.initCanvas) {
        console.warn('[pipeline-alerts] pipeline-utils.js must load first.');
        return;
    }
    const { MONO } = window.NosoTrack;
    let frame = 0;

    // ── Chart ──
    const alertsChartEl = document.getElementById('alertsChart');
    let alertsCtx, alertsW, alertsH;

    function initAlertsChart() {
        if (!alertsChartEl) return;
        const rect = alertsChartEl.getBoundingClientRect();
        alertsChartEl.width  = rect.width  * 2;
        alertsChartEl.height = rect.height * 2;
        alertsCtx = alertsChartEl.getContext('2d');
        alertsCtx.setTransform(1, 0, 0, 1, 0, 0);
        alertsCtx.scale(2, 2);
        alertsW = rect.width; alertsH = rect.height;
    }

    function drawAlertsChart() {
        if (!alertsCtx) return;
        const ctx = alertsCtx, w = alertsW, h = alertsH;
        ctx.clearRect(0, 0, w, h);

        const pad = { top: 16, right: 22, bottom: 20, left: 28 };
        const cw = w - pad.left - pad.right;
        const ch = h - pad.top - pad.bottom;
        const N = 30;

        // Y-axis labels & grid
        ctx.font = `400 10px ${MONO}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let i = 0; i <= 4; i++) {
            const y = pad.top + ch - (i / 4) * ch;
            ctx.fillStyle = 'rgba(30,30,43,0.42)';
            ctx.fillText(String(i * 25), pad.left - 4, y);
            ctx.strokeStyle = 'rgba(30,30,43,0.08)'; ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
        }
        ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(30,30,43,0.42)';
        ctx.font = `500 9px ${MONO}`;
        ctx.fillText('TIME', w / 2, h - 4);

        const progress = Math.min(1, frame * 0.008);
        const visibleSteps = Math.floor(N * progress);

        function wA(t) { return 18 + Math.sin(t * 0.5) * 5 + Math.sin(t * 1.3) * 3; }
        function wB(t) { return 22 + Math.sin(t * 0.7 + 1) * 4 + Math.cos(t * 0.9) * 3; }
        function wC(t) {
            if (t < N * 0.55) return 20 + Math.sin(t * 0.6 + 2) * 4;
            const ramp = (t - N * 0.55) / (N * 0.45);
            return 20 + ramp * ramp * 65 + Math.sin(t * 1.2) * 3;
        }

        function sx(i) { return pad.left + (i / N) * cw; }
        function sy(fn, i) { return pad.top + ch - (Math.min(100, fn(i)) / 100) * ch; }

        function drawLine(fn, color, lineWidth) {
            if (visibleSteps < 2) return;
            ctx.beginPath();
            for (let i = 0; i <= visibleSteps; i++) {
                i === 0 ? ctx.moveTo(sx(i), sy(fn, i)) : ctx.lineTo(sx(i), sy(fn, i));
            }
            ctx.strokeStyle = color; ctx.lineWidth = lineWidth || 1.2;
            ctx.lineJoin = 'round'; ctx.stroke();
        }

        const INK_LIGHT  = 'rgba(30,30,43,0.32)';
        const INK_MEDIUM = 'rgba(30,30,43,0.55)';
        const INK_HEAVY  = 'rgba(30,30,43,0.92)';

        drawLine(wA, INK_LIGHT,  1.1);
        drawLine(wB, INK_MEDIUM, 1.2);
        drawLine(wC, INK_HEAVY,  2.2);

        // Ward C alert spike highlight
        if (visibleSteps > N * 0.55) {
            ctx.save();
            const s0 = Math.floor(N * 0.55);
            ctx.beginPath();
            for (let i = s0; i <= visibleSteps; i++) {
                i === s0 ? ctx.moveTo(sx(i), sy(wC, i)) : ctx.lineTo(sx(i), sy(wC, i));
            }
            ctx.strokeStyle = 'rgba(255,7,58,0.55)'; ctx.lineWidth = 2.2; ctx.stroke();
            ctx.restore();

            if (visibleSteps >= N) {
                const ex = sx(N), ey = sy(wC, N);
                const pulse = 0.4 + Math.sin(frame * 0.08) * 0.25;
                ctx.fillStyle = `rgba(255,7,58,${pulse})`;
                ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(255,7,58,0.95)';
                ctx.beginPath(); ctx.arc(ex, ey, 2.4, 0, Math.PI * 2); ctx.fill();
            }
        }

        // End-of-line ward labels
        if (visibleSteps >= N) {
            ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
            ctx.font = `500 10px ${MONO}`;
            const endX = sx(N) + 8;
            ctx.fillStyle = 'rgba(30,30,43,0.55)';
            ctx.fillText('A', Math.min(endX, w - 14), sy(wA, N));
            ctx.fillText('B', Math.min(endX, w - 14), sy(wB, N));
            ctx.fillStyle = 'rgba(255,7,58,0.95)';
            ctx.fillText('C', Math.min(endX + 6, w - 14), sy(wC, N));
        }

        // In-line event annotations
        ctx.font = `500 10px ${MONO}`; ctx.textBaseline = 'bottom';

        // Ward C — patient admission drives the spike
        const cLabelStep = Math.floor(N * 0.52);
        if (visibleSteps >= cLabelStep) {
            const lx = sx(cLabelStep), ly = sy(wC, cLabelStep);
            ctx.save();
            ctx.strokeStyle = 'rgba(30,30,43,0.45)'; ctx.lineWidth = 0.6; ctx.setLineDash([2, 2]);
            ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly - 18); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(30,30,43,0.95)'; ctx.textAlign = 'center';
            ctx.fillText('Patient C9 admitted', lx, ly - 20);
            ctx.restore();
        }

        // Ward A — staff rotation event
        const aLabelStep = Math.floor(N * 0.2);
        if (visibleSteps >= aLabelStep) {
            const lx = sx(aLabelStep), ly = sy(wA, aLabelStep);
            ctx.save();
            ctx.strokeStyle = 'rgba(30,30,43,0.3)'; ctx.lineWidth = 0.6; ctx.setLineDash([2, 2]);
            ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly - 14); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(30,30,43,0.75)'; ctx.textAlign = 'center';
            ctx.fillText('Staff rotation', lx, ly - 16);
            ctx.restore();
        }

        // Ward B — discharge event
        const bLabelStep = Math.floor(N * 0.4);
        if (visibleSteps >= bLabelStep) {
            const lx = sx(bLabelStep), ly = sy(wB, bLabelStep);
            ctx.save();
            ctx.strokeStyle = 'rgba(30,30,43,0.3)'; ctx.lineWidth = 0.6; ctx.setLineDash([2, 2]);
            ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx, ly + 14); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(30,30,43,0.75)'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText('Patient discharge', lx, ly + 16);
            ctx.restore();
        }
    }

    // ── Terminal typewriter — fully event-driven, no frame loop. ──
    function initAlertsTerminal() {
        const terminal = document.getElementById('alertsTerminal');
        const cursor   = document.getElementById('alertsCursor');
        if (!terminal || !cursor) return;

        const BELL_SVG =
            '<svg class="alerts-terminal-icon" viewBox="0 0 12 12" fill="none">' +
            '<path d="M6 1c-2.2 0-4 1.8-4 4v2.8l-.8.8v.4h9.6v-.4l-.8-.8V5c0-2.2-1.8-4-4-4z" stroke="#ff073a" stroke-width=".8" fill="none" opacity=".7"/>' +
            '<path d="M4.5 10a1.5 1.5 0 003 0" stroke="#ff073a" stroke-width=".6" fill="none" opacity=".7"/></svg>';

        const alerts = [
            { text: 'Patient P4 — high exposure risk', score: 'score 0.82', ward: 'Ward C' },
            { text: 'Patient P9 — high exposure risk', score: 'score 0.76', ward: 'Ward C' },
            { text: 'Patient P11 imported case',       score: 'score 0.78', ward: 'Ward A' },
            { text: 'Transmission event: P7 → P2',     score: 'score 0.91', ward: 'Ward B' },
            { text: 'Undetected case in Ward C',       score: 'score 0.55', ward: 'Ward C' },
        ];
        const MAX_LINES = 5;
        let alertIdx = 0;

        function typeAlert() {
            const alert = alerts[alertIdx % alerts.length];
            alertIdx++;

            const line = document.createElement('div');
            line.className = 'alerts-terminal-line';
            const wardCls = 'alerts-terminal-badge--ward-' + alert.ward.replace('Ward ', '').toLowerCase();
            line.innerHTML =
                BELL_SVG +
                '<span class="alerts-terminal-text"></span>' +
                '<span class="alerts-terminal-badges">' +
                  '<span class="alerts-terminal-badge alerts-terminal-badge--score">' + alert.score + '</span>' +
                  '<span class="alerts-terminal-badge alerts-terminal-badge--ward ' + wardCls + '">' + alert.ward + '</span>' +
                '</span>';
            terminal.insertBefore(line, cursor);

            const textEl = line.querySelector('.alerts-terminal-text');
            let charIdx = 0;

            const lines = terminal.querySelectorAll('.alerts-terminal-line');
            if (lines.length > MAX_LINES) {
                lines[0].style.opacity = '0';
                lines[0].style.transition = 'opacity 0.3s';
                setTimeout(() => lines[0].remove(), 300);
            }

            function typeChar() {
                if (charIdx <= alert.text.length) {
                    textEl.textContent = alert.text.slice(0, charIdx);
                    charIdx++;
                    setTimeout(typeChar, 35 + Math.random() * 25);
                } else {
                    setTimeout(typeAlert, 1800);
                }
            }
            setTimeout(typeChar, 200);
        }
        setTimeout(typeAlert, 800);
    }

    function loop() { frame++; drawAlertsChart(); requestAnimationFrame(loop); }

    initAlertsChart();
    initAlertsTerminal();
    requestAnimationFrame(loop);
    window.addEventListener('resize', initAlertsChart);
})();
