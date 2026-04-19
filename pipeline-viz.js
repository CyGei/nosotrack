// ==========================================
// PIPELINE — multi-step flow with mini-canvas
// animations, engine transmission tree viz,
// background particles + connectors
// ==========================================
(function () {
    const ACCENT = '#ff073a';
    const ACTIVE = '#1e1e2b';
    const MONO = '"JetBrains Mono", monospace';
    let frame = 0;

    function initCanvas(c) {
        if (!c) return null;
        const dpr = Math.min(window.devicePixelRatio, 2);
        const r = c.getBoundingClientRect();
        c.width = r.width * dpr; c.height = r.height * dpr;
        const ctx = c.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, w: r.width, h: r.height };
    }

    // Background
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
            bgParticles.push({ x: Math.random() * bgW, y: Math.random() * bgH, vy: 0.12 + Math.random() * 0.25, size: Math.random() * 1 + 0.3, opacity: Math.random() * 0.12 + 0.02 });
        }
    }
    function drawBg() {
        if (!bgCtx) return;
        bgCtx.clearRect(0, 0, bgW, bgH);
        bgParticles.forEach(p => {
            p.y += p.vy; if (p.y > bgH + 4) { p.y = -4; p.x = Math.random() * bgW; }
            bgCtx.fillStyle = `rgba(255,7,58,${p.opacity})`;
            bgCtx.beginPath(); bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2); bgCtx.fill();
        });
    }

    // 3 Connectors
    function makeConnector(c, count) {
        const info = initCanvas(c); if (!info) return null;
        const { ctx, w, h } = info;
        const particles = [];
        for (let i = 0; i < count; i++) particles.push({ x: w * (0.35 + Math.random() * 0.3), y: Math.random() * h, vy: 0.3 + Math.random() * 0.4, size: Math.random() * 1.5 + 0.5, phase: Math.random() * Math.PI * 2 });
        return { ctx, w, h, particles, el: c };
    }
    const connectors = [];
    for (let i = 1; i <= 4; i++) { const c = makeConnector(document.getElementById('connector-' + i), 7); if (c) connectors.push(c); }

    function animateConnector(c) {
        if (!c) return;
        c.ctx.clearRect(0, 0, c.w, c.h);
        c.ctx.strokeStyle = 'rgba(30,30,43,0.03)'; c.ctx.lineWidth = 1; c.ctx.setLineDash([2, 6]);
        c.ctx.beginPath(); c.ctx.moveTo(c.w / 2, 0); c.ctx.lineTo(c.w / 2, c.h); c.ctx.stroke();
        c.ctx.setLineDash([]);
        c.particles.forEach(p => {
            p.y += p.vy; p.x += Math.sin(frame * 0.02 + p.phase) * 0.25;
            if (p.y > c.h + 4) { p.y = -4; p.x = c.w * (0.4 + Math.random() * 0.2); }
            const grad = c.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
            grad.addColorStop(0, 'rgba(255,7,58,0.5)'); grad.addColorStop(1, 'transparent');
            c.ctx.fillStyle = grad;
            c.ctx.beginPath(); c.ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2); c.ctx.fill();
            c.ctx.fillStyle = '#1e1e2b';
            c.ctx.beginPath(); c.ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2); c.ctx.fill();
        });
    }

    // Mini-canvas animations (2D)
    const vizCanvases = {};
    document.querySelectorAll('.p-card-canvas[data-viz]').forEach(c => {
        if (c.dataset.viz === 'engine') return;
        const info = initCanvas(c);
        if (info) vizCanvases[c.dataset.viz] = { el: c, ...info };
    });

    // DNA helix
    function vizDNA() {
        const v = vizCanvases.dna; if (!v) return;
        const { ctx, w, h } = v; ctx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2, amp = 26, len = h * 0.8;
        for (let strand = -1; strand <= 1; strand += 2) {
            ctx.strokeStyle = strand === 1 ? ACCENT : ACTIVE;
            ctx.lineWidth = 1.5; ctx.globalAlpha = strand === 1 ? 0.7 : 0.3;
            ctx.beginPath();
            for (let i = 0; i <= 40; i++) { const t = i / 40; const y = cy - len / 2 + t * len; const x = cx + Math.sin(t * Math.PI * 3 + frame * 0.025) * amp * strand; i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // Monochrome DNA rungs — one accent tracer for alert markers only.
        const baseCols = ['#6b7d8f', '#8a7966', '#7a8a70', '#1e1e2b'];
        for (let i = 0; i < 7; i++) { const t = (i + 0.3) / 7; const y = cy - len / 2 + t * len; const off = Math.sin(t * Math.PI * 3 + frame * 0.025) * amp; ctx.strokeStyle = baseCols[i % 4]; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.moveTo(cx + off, y); ctx.lineTo(cx - off, y); ctx.stroke(); }
        ctx.globalAlpha = 1;
        const scanY = cy - len / 2 + ((frame * 1.2) % len);
        ctx.strokeStyle = ACCENT; ctx.lineWidth = 1; ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.moveTo(cx - amp - 8, scanY); ctx.lineTo(cx + amp + 8, scanY); ctx.stroke(); ctx.globalAlpha = 1;
    }

    // Contact network
    function vizContact() {
        const v = vizCanvases.contact; if (!v) return;
        const { ctx, w, h } = v; ctx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        const nodes = [{ x: cx, y: cy, r: 5, staff: true }, { x: cx - 45, y: cy - 22, r: 3.5 }, { x: cx + 50, y: cy - 18, r: 3.5 }, { x: cx - 35, y: cy + 26, r: 3.5 }, { x: cx + 40, y: cy + 24, r: 3.5 }, { x: cx - 8, y: cy - 34, r: 3 }, { x: cx + 12, y: cy + 36, r: 3 }];
        const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 5], [2, 4], [3, 6]];
        edges.forEach(([a, b]) => { ctx.strokeStyle = 'rgba(30,30,43,0.07)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke(); });
        nodes.forEach((n, i) => {
            const maxPhase = n.staff ? 30 : 22;
            const waveColor = n.staff ? ACCENT : 'rgba(30,30,43,0.35)';
            for (let ring = 0; ring < 2; ring++) {
                const phase = (frame * 0.5 + i * 13 + ring * 15) % maxPhase;
                const pulseR = n.r + 5 + phase;
                ctx.strokeStyle = waveColor; ctx.lineWidth = 1; ctx.globalAlpha = 0.3 * (1 - phase / maxPhase);
                ctx.beginPath(); ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2); ctx.stroke();
            }
        });
        ctx.globalAlpha = 1;
        nodes.forEach(n => { ctx.fillStyle = n.staff ? ACCENT : 'rgba(30,30,43,0.45)'; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill(); });
    }

    // EHR scrolling
    function vizEHR() {
        const v = vizCanvases.ehr; if (!v) return;
        const { ctx, w, h } = v; ctx.clearRect(0, 0, w, h);
        const rowH = 20, cols = [w * 0.08, w * 0.28, w * 0.55, w * 0.78], scrollY = (frame * 0.35) % (rowH * 8);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
        for (let r = -1; r < 8; r++) {
            const y = r * rowH - scrollY + h / 2; if (y < -rowH || y > h + rowH) continue;
            const rowAlpha = 1 - Math.abs(y - h / 2) / (h * 0.6);
            ctx.globalAlpha = Math.max(0.04, Math.min(0.45, rowAlpha));
            if (r === 0) { ctx.font = `500 10px ${MONO}`; ctx.fillStyle = ACCENT;['ID', 'WARD', 'DATE', 'STATUS'].forEach((t, i) => { ctx.textAlign = 'left'; ctx.fillText(t, cols[i], y); }); }
            else { ctx.font = `400 10px ${MONO}`; ctx.fillStyle = '#1e1e2b'; const ids = ['P001', 'P002', 'S003', 'P004', 'S005', 'P006', 'P007'], wards = ['A', 'B', 'C', 'A', 'B', 'C', 'A'], stati = ['POS', 'NEG', 'POS', 'NEG', 'POS', 'NEG', 'POS']; const ri = ((r - 1) + Math.floor(frame * 0.01)) % 7; ctx.textAlign = 'left'; ctx.fillText(ids[ri], cols[0], y); ctx.fillText(wards[ri], cols[1], y); ctx.fillText('2025-0' + (ri + 1), cols[2], y); ctx.fillStyle = stati[ri] === 'POS' ? ACCENT : '#1e1e2b'; ctx.fillText(stati[ri], cols[3], y); }
        }
        ctx.restore(); ctx.globalAlpha = 1;
        const fadeH = 18; let gradTop = ctx.createLinearGradient(0, 0, 0, fadeH); gradTop.addColorStop(0, 'rgba(239,238,239,0.7)'); gradTop.addColorStop(1, 'transparent'); ctx.fillStyle = gradTop; ctx.fillRect(0, 0, w, fadeH);
        let gradBot = ctx.createLinearGradient(0, h - fadeH, 0, h); gradBot.addColorStop(0, 'transparent'); gradBot.addColorStop(1, 'rgba(239,238,239,0.7)'); ctx.fillStyle = gradBot; ctx.fillRect(0, h - fadeH, w, fadeH);
    }

    // Anonymisation
    // Symmetric two-column layout:
    //   header labels are centred in their respective halves
    //   identifiable data is right-aligned toward the divider
    //   anonymised data is left-aligned away from the divider
    //   the red arrow sits precisely at the centre between the two
    function vizAnon() {
        const v = vizCanvases.anon; if (!v) return;
        const { ctx, w, h } = v; ctx.clearRect(0, 0, w, h);

        const cycle = (frame * 0.007) % 1;
        const TRANSFORM_END = 0.60, HOLD_END = 0.85;
        const globalFade = cycle > HOLD_END ? 1 - (cycle - HOLD_END) / (1 - HOLD_END) : 1;

        const fields = [
            { raw: 'Smith, John A.',      anon: 'SUBJ_7f3a9b2c' },
            { raw: 'DOB 1985-03-12',      anon: 'AGE_GRP 35-44' },
            { raw: 'NHS 485 777 3291',    anon: 'REF_\u2588\u2588\u2588\u2588\u2588\u2588' },
            { raw: 'Room 14-B',           anon: 'LOC_\u2588\u2588\u2588\u2588' },
            { raw: 'Ward Birch North',    anon: 'ZONE_BN' },
            { raw: 'Nurse K. Evans',      anon: 'STAFF_A3' },
            { raw: 'Admit 2025-03-01',    anon: 'ADM_Q1_25' },
            { raw: 'PCR+ / MRSA+',        anon: 'FLAG_HAI_POS' },
            { raw: 'GP St. Jude Prac.',   anon: 'PRAC_\u2588\u2588\u2588' },
        ];
        const nRows = fields.length;
        const headerH = 14, statusH = 10, topPad = 3;
        const rowH = Math.floor((h - headerH - statusH - topPad) / nRows);
        const tableH = nRows * rowH;
        const topY = topPad;
        const headerY = topY + headerH - 4;
        const startY = topY + headerH + 2;
        const midX = w / 2;
        // Symmetric column centres and data anchors
        const colGap = 18;                 // gap around the centre arrow
        const leftColCentre  = w * 0.25;
        const rightColCentre = w * 0.75;
        const leftDataX  = midX - colGap / 2;   // right-aligned endpoint
        const rightDataX = midX + colGap / 2;   // left-aligned startpoint

        // ── Column headers — centred in each half
        ctx.font = `500 9px ${MONO}`; ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(30,30,43,${0.55 * globalFade})`;
        ctx.fillText('IDENTIFIABLE', leftColCentre, headerY);
        ctx.fillStyle = `rgba(106,140,102,${0.7 * globalFade})`;
        ctx.fillText('ANONYMISED', rightColCentre, headerY);

        // ── Centre divider
        ctx.strokeStyle = `rgba(255,7,58,${0.18 * globalFade})`; ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(midX, topY + 2); ctx.lineTo(midX, topY + headerH + tableH); ctx.stroke();
        ctx.setLineDash([]);

        fields.forEach((f, i) => {
            const y = startY + i * rowH;
            const rowStart = (i / nRows) * TRANSFORM_END;
            const t = Math.max(0, Math.min(1, (cycle - rowStart) / 0.14));

            // Left column — right-aligned, pointing inward at divider
            const rawAlpha = t < 0.5 ? 0.78 : Math.max(0.18, 0.78 - (t - 0.5) * 1.2);
            ctx.font = `400 9px ${MONO}`; ctx.textAlign = 'right';
            ctx.fillStyle = `rgba(30,30,43,${rawAlpha * globalFade})`;
            ctx.fillText(f.raw, leftDataX, y);

            // Red redaction bar sweeping across raw text
            if (t > 0.2) {
                const barT = Math.min(1, (t - 0.2) / 0.4);
                const rawW = ctx.measureText(f.raw).width;
                ctx.fillStyle = `rgba(255,7,58,${barT * 0.28 * globalFade})`;
                ctx.fillRect(leftDataX - rawW * barT - 1, y - 8, rawW * barT + 2, 10);
            }

            // Centre arrow — pulses during the transform window
            if (t > 0.15 && t < 0.9) {
                const arrowAlpha = Math.sin(((t - 0.15) / 0.75) * Math.PI) * 0.85;
                ctx.font = `500 11px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = `rgba(255,7,58,${arrowAlpha * globalFade})`;
                ctx.fillText('\u2192', midX, y - 3);
                ctx.textBaseline = 'alphabetic';
            }

            // Right column — left-aligned, flowing outward
            const anonAlpha = t > 0.45 ? Math.min(0.9, (t - 0.45) / 0.4) : 0;
            ctx.font = `400 9px ${MONO}`; ctx.textAlign = 'left';
            ctx.fillStyle = `rgba(106,140,102,${anonAlpha * globalFade})`;
            ctx.fillText(f.anon, rightDataX, y);
        });

        // ── Status label — centred under the table
        const statusY = topY + headerH + tableH + 8;
        ctx.font = `500 9px ${MONO}`; ctx.textAlign = 'center';
        if (cycle < TRANSFORM_END) {
            ctx.fillStyle = `rgba(255,7,58,${(0.6 + Math.sin(frame * 0.06) * 0.15) * globalFade})`;
            ctx.fillText('ANONYMISING...', midX, statusY);
        } else if (cycle < HOLD_END) {
            ctx.fillStyle = `rgba(106,140,102,${0.75 * globalFade})`;
            ctx.fillText('GDPR/HIPAA COMPLIANT \u2713', midX, statusY);
        }
    }

    // ═══════════════════════════════════════════
    // ALERTS CHART — Ward Exposure Score
    // ═══════════════════════════════════════════
    const alertsChartEl = document.getElementById('alertsChart');
    let alertsCtx, alertsW, alertsH;
    if (alertsChartEl) {
        const rect = alertsChartEl.getBoundingClientRect();
        alertsChartEl.width = rect.width * 2; alertsChartEl.height = rect.height * 2;
        alertsCtx = alertsChartEl.getContext('2d');
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

        // Animation progress
        const progress = Math.min(1, frame * 0.008);
        const visibleSteps = Math.floor(N * progress);

        // Ward data functions
        function wA(t) { return 18 + Math.sin(t * 0.5) * 5 + Math.sin(t * 1.3) * 3; }
        function wB(t) { return 22 + Math.sin(t * 0.7 + 1) * 4 + Math.cos(t * 0.9) * 3; }
        function wC(t) {
            if (t < N * 0.55) return 20 + Math.sin(t * 0.6 + 2) * 4;
            const ramp = (t - N * 0.55) / (N * 0.45);
            return 20 + ramp * ramp * 65 + Math.sin(t * 1.2) * 3;
        }

        // Helper: x/y from step index
        function sx(i) { return pad.left + (i / N) * cw; }
        function sy(fn, i) { return pad.top + ch - (Math.min(100, fn(i)) / 100) * ch; }

        function drawLine(fn, color, lineWidth) {
            if (visibleSteps < 2) return;
            ctx.beginPath();
            for (let i = 0; i <= visibleSteps; i++) {
                i === 0 ? ctx.moveTo(sx(i), sy(fn, i)) : ctx.lineTo(sx(i), sy(fn, i));
            }
            ctx.strokeStyle = color; ctx.lineWidth = lineWidth || 1.2; ctx.lineJoin = 'round'; ctx.stroke();
        }

        // Neutral mono-ink plot; Ward C (the spiking one) gets a heavier stroke + spike highlight.
        const INK_LIGHT  = 'rgba(30,30,43,0.32)';
        const INK_MEDIUM = 'rgba(30,30,43,0.55)';
        const INK_HEAVY  = 'rgba(30,30,43,0.92)';

        drawLine(wA, INK_LIGHT, 1.1);
        drawLine(wB, INK_MEDIUM, 1.2);
        drawLine(wC, INK_HEAVY, 2.2);

        // Ward C alert spike highlight — red tracer where the curve climbs above threshold.
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

        // End-of-line ward labels (replaces the external colour legend).
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

        // In-line event annotations (replace ward colour coding with neutral ink callouts).
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

    // ═══════════════════════════════════════════
    // ALERTS TERMINAL — Typewriter loop
    // ═══════════════════════════════════════════
    (function initAlertsTerminal() {
        const terminal = document.getElementById('alertsTerminal');
        const cursor = document.getElementById('alertsCursor');
        if (!terminal || !cursor) return;

        const BELL_SVG = '<svg class="alerts-terminal-icon" viewBox="0 0 12 12" fill="none"><path d="M6 1c-2.2 0-4 1.8-4 4v2.8l-.8.8v.4h9.6v-.4l-.8-.8V5c0-2.2-1.8-4-4-4z" stroke="#ff073a" stroke-width=".8" fill="none" opacity=".7"/><path d="M4.5 10a1.5 1.5 0 003 0" stroke="#ff073a" stroke-width=".6" fill="none" opacity=".7"/></svg>';

        const alerts = [
            { text: 'Patient P4 — high exposure risk', score: 'score 0.82', ward: 'Ward C' },
            { text: 'Patient P9 — high exposure risk', score: 'score 0.76', ward: 'Ward C' },
            { text: 'Patient P11 imported case', score: 'score 0.78', ward: 'Ward A' },
            { text: 'Transmission event: P7 → P2', score: 'score 0.91', ward: 'Ward B' },
            { text: 'Undetected case in Ward C', score: 'score 0.55', ward: 'Ward C' },
        ];

        const MAX_LINES = 5;
        let alertIdx = 0;

        function typeAlert() {
            const alert = alerts[alertIdx % alerts.length];
            alertIdx++;

            // Create line element
            const line = document.createElement('div');
            line.className = 'alerts-terminal-line';
            const wardCls = 'alerts-terminal-badge--ward-' + alert.ward.replace('Ward ', '').toLowerCase();
            line.innerHTML = BELL_SVG + '<span class="alerts-terminal-text"></span><span class="alerts-terminal-badges"><span class="alerts-terminal-badge alerts-terminal-badge--score">' + alert.score + '</span><span class="alerts-terminal-badge alerts-terminal-badge--ward ' + wardCls + '">' + alert.ward + '</span></span>';
            // Insert before cursor
            terminal.insertBefore(line, cursor);

            const textEl = line.querySelector('.alerts-terminal-text');
            let charIdx = 0;

            // Remove overflow lines
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
                    // Pause then start next
                    setTimeout(typeAlert, 1800);
                }
            }
            // Small delay before starting to type
            setTimeout(typeChar, 200);
        }

        // Start after a brief delay
        setTimeout(typeAlert, 800);
    })();

    // ═══════════════════════════════════════════
    // ENGINE — Full Outbreak Reconstruction
    // Adapted from Engine.html (event-based, time-driven)
    // ═══════════════════════════════════════════
    const engineCanvas = document.getElementById('engine-canvas');
    let engineCtx, engineW, engineH;
    const ENG_SPEEDS = [1, 1.5, 2, 3, 5];
    let engSpeedIdx = 2; // default 2×
    let engSpeed = ENG_SPEEDS[engSpeedIdx];

    // Colours — unified with the About transmission tree + ward palette.
    //  grey  = --ink       (same base as About viz)
    //  red   = --alert     (reserved for confirmed/alert states)
    //  blue  = --ward-a
    //  tan   = --ward-b    (re-used for superspreader)
    //  purple= mute violet (undetected — visually distinct but monochrome-adjacent)
    // Inference palette — node-type colours intensified slightly so Undetected / Superspreader / Imported
    // read as distinct signals on the light canvas without tipping into the branded brand colours.
    const ECL = {
        grey:   '#1e1e2b',
        red:    '#ff073a',
        orange: '#b47a45',   // Superspreader — warmer ochre
        purple: '#7a5488',   // Undetected   — deeper violet
        blue:   '#3d6b8c',   // Imported     — richer slate-blue
        gR: 'rgba(255,7,58,.22)',
        gO: 'rgba(180,122,69,.30)',
        gP: 'rgba(122,84,136,.26)',
        gB: 'rgba(61,107,140,.26)',
        eN: 'rgba(30,30,43,.32)',
        eI: 'rgba(122,84,136,.70)'
    };

    // Nodes
    const ENG_NODES = [
        // Ward A
        { id: 0, l: 'P1', sh: 'c', w: 'A', xf: .11, yf: .16 },
        { id: 1, l: 'P2', sh: 'c', w: 'A', xf: .23, yf: .13 },
        { id: 2, l: 'P3', sh: 'c', w: 'A', xf: .08, yf: .32 },  // TRUE PATIENT ZERO
        { id: 3, l: 'P4', sh: 'c', w: 'A', xf: .21, yf: .30 },
        { id: 4, l: 'P5', sh: 'c', w: 'A', xf: .15, yf: .44 },
        { id: 5, l: 'N1', sh: 'd', w: 'A', xf: .30, yf: .22 },  // nurse (hidden)
        // Ward B
        { id: 6, l: 'P6', sh: 'c', w: 'B', xf: .70, yf: .13 },
        { id: 7, l: 'P7', sh: 'c', w: 'B', xf: .84, yf: .15 },  // imported
        { id: 8, l: 'P8', sh: 'c', w: 'B', xf: .74, yf: .29 },
        { id: 9, l: 'P9', sh: 'c', w: 'B', xf: .88, yf: .31 },
        { id: 10, l: 'P10', sh: 'c', w: 'B', xf: .80, yf: .44 },
        { id: 11, l: 'N2', sh: 'd', w: 'B', xf: .63, yf: .25 },
        { id: 12, l: 'A1', sh: 'd', w: 'B', xf: .92, yf: .23 },
        // Ward C (ICU)
        { id: 13, l: 'P11', sh: 'c', w: 'C', xf: .34, yf: .70 },
        { id: 14, l: 'P12', sh: 'c', w: 'C', xf: .50, yf: .68 },
        { id: 15, l: 'P13', sh: 'c', w: 'C', xf: .66, yf: .72 },
        { id: 16, l: 'P14', sh: 'c', w: 'C', xf: .42, yf: .86 },
        { id: 17, l: 'P15', sh: 'c', w: 'C', xf: .58, yf: .86 },
        { id: 18, l: 'N3', sh: 'd', w: 'C', xf: .74, yf: .84 },
        // Cross-ward doctor (superspreader)
        { id: 19, l: 'Dr1', sh: 'd', w: 'X', xf: .46, yf: .48 },
        // External source
        { id: 20, l: '?', sh: 'q', w: 'E', xf: .94, yf: .06 },
    ];

    // Forecast edges
    const ENG_FC_EDGES = [{ from: 2, to: 3 }, { from: 11, to: 8 }, { from: 14, to: 16 }, { from: 14, to: 17 }];

    // Module-level state
    let engNS = [], engEdges = [], engForecastEdges = [], engNodeAnns = [], engParticles = [];
    let engSIdx = 0, engElapsed = 0, engFrame2 = 0;
    let engBannOn = false, engBannLabel = '', engBannText = '', engBannCol = '', engBannEnd = 0;
    let engBannAlert = false, engLogoActive = false;
    let engPlaying = true, engDragging = false;
    let engOutbreakAnim = null;
    let engScript = [], ENG_TOTAL_T = 60000;
    // Cached DOM refs (set in initEngineViz)
    let engFillEl = null, engHandleEl = null, engTrackEl = null;

    function buildEngScript() {
        engScript = [];
        let T = 0;
        function at(dt) { T += dt; return T; }
        function ev(type, p) { engScript.push({ t: T, type, ...p }); }
        T = 1200;
        ev('ann', { label: 'INITIAL DETECTION', text: 'First confirmed case in Ward A', col: ECL.red, dur: 2800, alert: false });
        at(600); ev('confirm', { id: 0, ann: 'First Confirmed Case', acol: ECL.red });
        at(3600); ev('ann', { label: 'CASES EMERGING', text: 'New cases confirmed across wards', col: ECL.red, dur: 2600, alert: false });
        at(800); ev('confirm', { id: 1, ann: 'Confirmed' });
        at(1200); ev('confirm', { id: 2, ann: 'Confirmed' });
        at(1200); ev('confirm', { id: 6, ann: 'Confirmed' });
        at(1200); ev('confirm', { id: 11 });
        at(1000); ev('confirm', { id: 19, ann: 'Confirmed' });
        at(3000); ev('ann', { label: 'OUTBREAK DECLARED', text: 'NosoTrack engine deployed', col: ECL.red, dur: 3500, alert: false, logo: true });
        at(4200); ev('ann', { label: 'SOURCE IDENTIFICATION', text: 'Patient Zero identified', col: '#1e1e2b', dur: 3000, alert: false });
        at(600); ev('p0', { id: 2 });
        at(3500); ev('edge', { from: 2, to: 0, inf: false });
        at(1200); ev('ann', { label: 'ALERT: SUSPECTED CASES', text: 'N1 is a likely undetected case', col: ECL.purple, dur: 3000, alert: true });
        at(800); ev('hidden', { id: 5, ann: 'Undetected Case Identified' });
        at(1000); ev('edge', { from: 2, to: 5, inf: false });
        at(1200); ev('edge', { from: 5, to: 1, inf: true });
        at(800); ev('edge', { from: 5, to: 11, inf: true });
        at(1000); ev('edge', { from: 5, to: 19, inf: true });
        at(1200); ev('edge', { from: 19, to: 6, inf: false });
        at(1500); ev('confirm', { id: 13, ann: 'Confirmed' });
        at(900); ev('confirm', { id: 14, ann: 'Confirmed' });
        at(900); ev('confirm', { id: 15, ann: 'Confirmed' });
        at(1200); ev('edge', { from: 19, to: 13, inf: false });
        at(800); ev('edge', { from: 19, to: 14, inf: false });
        at(800); ev('edge', { from: 19, to: 15, inf: false });
        at(1200); ev('ann', { label: 'ALERT: SUPERSPREADER', text: 'Dr1 linked to 4 cases across wards', col: ECL.orange, dur: 3500, alert: true });
        at(600); ev('super', { id: 19 });
        at(4200); ev('confirm', { id: 7, ann: 'Confirmed' });
        at(2000); ev('ann', { label: 'ALERT: IMPORTATION EVENT', text: 'P7 is an imported case', col: ECL.blue, dur: 3500, alert: true });
        at(800); ev('imported_p7', { id: 7 });
        at(1000); ev('show_source', { id: 20 });
        at(800); ev('edge', { from: 20, to: 7, inf: false });
        at(4000); ev('ann', { label: 'ALERT: RISK FORECAST', text: 'P[4,8,14,15] at risk', col: 'rgba(30,30,43,.75)', dur: 4500, alert: true });
        at(1200); ev('forecast', {});
        at(6000);
        ENG_TOTAL_T = T + 500;
    }

    function engNPos(n) {
        const nh = engineH - 40;
        return { x: n.xf * engineW, y: n.yf * nh };
    }
    function engNR(n) { return n.sh === 'd' || n.sh === 'q' ? 6 : 7; }

    function initEngState() {
        engNS = ENG_NODES.map(() => ({
            col: ECL.grey, glow: 'transparent', sc: 1, tSc: 1, al: 0, tAl: 0,
            blue: false, sup: false, pulse: false, rev: false, p0: false, p0ring: 0
        }));
        engEdges = []; engForecastEdges = []; engNodeAnns = []; engParticles = [];
        engSIdx = 0; engElapsed = 0;
        engBannOn = false; engBannAlert = false; engLogoActive = false;
        engOutbreakAnim = null;
        engPlaying = true;
    }

    function processEngEventsUpTo(t) {
        // Reset all state then replay instantly up to time t
        engNS.forEach(s => Object.assign(s, {
            col: ECL.grey, glow: 'transparent', sc: 1, tSc: 1, al: 0, tAl: 0,
            blue: false, sup: false, pulse: false, rev: false, p0: false, p0ring: 0
        }));
        engEdges = []; engForecastEdges = []; engNodeAnns = []; engParticles = [];
        engBannOn = false; engBannAlert = false; engLogoActive = false; engOutbreakAnim = null; engSIdx = 0;
        ENG_NODES.forEach((n, i) => { engNS[i].tAl = .55; engNS[i].al = .55; });
        for (let i = 0; i < engScript.length; i++) {
            if (engScript[i].t > t) break;
            engApplyEv(engScript[i], true); engSIdx = i + 1;
        }
        engEdges.forEach(e => e.prog = 1);
        engForecastEdges.forEach(e => e.prog = 1);
        // Restore active banner
        let ab = null;
        for (let i = 0; i < engScript.length; i++) {
            if (engScript[i].t > t) break;
            if (engScript[i].type === 'ann') {
                const end = engScript[i].t + (engScript[i].dur || 2500);
                ab = (t >= engScript[i].t && t <= end) ? engScript[i] : null;
            }
        }
        if (ab) {
            engBannLabel = ab.label; engBannText = ab.text; engBannCol = ab.col;
            engBannOn = true; engBannEnd = ab.t + (ab.dur || 2500);
            engBannAlert = !!ab.alert;
        }
    }

    function engApplyEv(e, instant) {
        switch (e.type) {
            case 'confirm': {
                const s = engNS[e.id]; s.col = ECL.red; s.glow = ECL.gR; s.tAl = 1; s.rev = true;
                if (instant) { s.al = 1; s.sc = 1; } else { s.tSc = 1.25; setTimeout(() => { s.tSc = 1; }, 420); }
                if (e.ann) engNodeAnns.push({ id: e.id, text: e.ann, col: e.acol || ECL.red, alpha: instant ? 0 : 1, born: engElapsed });
                break;
            }
            case 'hidden': {
                const s = engNS[e.id]; s.col = ECL.purple; s.glow = ECL.gP; s.tAl = 1; s.rev = true;
                if (instant) { s.al = 1; s.sc = 1; } else { s.tSc = 1.3; setTimeout(() => { s.tSc = 1; }, 500); }
                if (e.ann) engNodeAnns.push({ id: e.id, text: e.ann, col: ECL.purple, alpha: instant ? 0 : 1, born: engElapsed });
                break;
            }
            case 'imported_p7': {
                const s = engNS[e.id]; s.blue = true; s.glow = ECL.gB;
                if (!instant) { s.tSc = 1.2; setTimeout(() => { s.tSc = 1; }, 400); }
                break;
            }
            case 'show_source': {
                const s = engNS[e.id]; s.col = ECL.blue; s.tAl = 1; s.rev = true;
                if (instant) { s.al = 1; s.sc = 1; } else { s.tSc = 1.2; setTimeout(() => { s.tSc = 1; }, 400); }
                break;
            }
            case 'super': {
                const s = engNS[e.id]; s.col = ECL.orange; s.glow = ECL.gO; s.sup = true;
                if (instant) { s.sc = 1.05; } else { s.tSc = 1.35; setTimeout(() => { s.tSc = 1.05; }, 520); }
                engNodeAnns.push({ id: e.id, text: 'Superspreader Detected', col: ECL.orange, alpha: instant ? 0 : 1, born: engElapsed });
                break;
            }
            case 'p0': {
                const s = engNS[e.id]; s.p0 = true; s.p0ring = instant ? 1 : 0;
                if (!instant) { s.tSc = 1.4; setTimeout(() => { s.tSc = 1; }, 600); }
                engNodeAnns.push({ id: e.id, text: 'Patient Zero Identified', col: '#1e1e2b', alpha: instant ? 0 : 1, born: engElapsed });
                break;
            }
            case 'edge': {
                engEdges.push({ from: e.from, to: e.to, inf: e.inf, prog: instant ? 1 : 0 });
                if (!instant) engSpawnParts(e);
                break;
            }
            case 'forecast': {
                ENG_FC_EDGES.forEach(fe => {
                    engForecastEdges.push({ from: fe.from, to: fe.to, prog: instant ? 1 : 0 });
                    engNS[fe.to].pulse = true; engNS[fe.to].tAl = Math.max(engNS[fe.to].tAl, .65);
                    if (instant) engNS[fe.to].al = .65;
                });
                break;
            }
            case 'ann': {
                if (e.logo) {
                    engLogoActive = true;
                    if (!instant) {
                        engOutbreakAnim = { startT: engElapsed, overlayDur: 3000, slideStartT: 600, slideDur: 2200 };
                    }
                }
                if (!instant) {
                    engBannLabel = e.label; engBannText = e.text; engBannCol = e.col;
                    engBannOn = true; engBannEnd = engElapsed + (e.dur || 2500);
                    engBannAlert = !!e.alert;
                }
                break;
            }
        }
    }

    function engSpawnParts(e) {
        const f = engNPos(ENG_NODES[e.from]), t = engNPos(ENG_NODES[e.to]);
        const c = e.inf ? ECL.purple : ECL.red;
        for (let i = 0; i < 4; i++)
            engParticles.push({
                x: f.x, y: f.y, tx: t.x, ty: t.y, p: -i * .08, sp: .011 + Math.random() * .005,
                dr: (Math.random() - .5) * 7, sz: 1 + Math.random() * 1.5, al: .35 + Math.random() * .4, c
            });
    }

    function drawEngEdge(ctx, fn, tn, prog, inf) {
        const f = engNPos(fn), t = engNPos(tn);
        const mx = f.x + (t.x - f.x) * prog, my = f.y + (t.y - f.y) * prog;
        ctx.save(); ctx.globalAlpha = Math.min(1, prog * 4);
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(mx, my);
        if (inf) { ctx.setLineDash([5, 3]); ctx.strokeStyle = ECL.eI; ctx.lineWidth = 1.5; }
        else { ctx.setLineDash([]); ctx.strokeStyle = ECL.eN; ctx.lineWidth = 1.3; }
        ctx.stroke(); ctx.setLineDash([]);
        if (prog > .92) {
            const a = Math.atan2(t.y - f.y, t.x - f.x), rr = 10, sz = 4;
            const ax = t.x - Math.cos(a) * rr, ay = t.y - Math.sin(a) * rr;
            ctx.globalAlpha = Math.min(1, (prog - .92) / .08);
            ctx.beginPath(); ctx.moveTo(ax, ay);
            ctx.lineTo(ax - sz * Math.cos(a - .4), ay - sz * Math.sin(a - .4));
            ctx.lineTo(ax - sz * Math.cos(a + .4), ay - sz * Math.sin(a + .4));
            ctx.closePath(); ctx.fillStyle = inf ? ECL.eI : 'rgba(30,30,43,.3)'; ctx.fill();
        }
        if (prog < 1) {
            ctx.globalAlpha = .85; ctx.beginPath(); ctx.arc(mx, my, 2, 0, Math.PI * 2);
            ctx.fillStyle = inf ? ECL.purple : ECL.red; ctx.fill();
        }
        ctx.restore();
    }

    function drawBiohazardSymbol(ctx, cx, cy, r, alpha) {
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy);
        ctx.strokeStyle = '#ff073a'; ctx.lineCap = 'round';
        const pw = r * 0.26, pr = r * 0.60;
        ctx.lineWidth = pw;
        const span = (Math.PI * 2 / 3) * 0.68, gap = (Math.PI * 2 / 3) - span;
        for (let i = 0; i < 3; i++) {
            const base = (i / 3) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath(); ctx.arc(0, 0, pr, base + gap / 2, base + gap / 2 + span); ctx.stroke();
        }
        ctx.lineWidth = pw * 0.35;
        const spkIn = r * 0.16, spkOut = r * 0.36;
        for (let i = 0; i < 3; i++) {
            const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
            ctx.beginPath(); ctx.moveTo(Math.cos(a) * spkIn, Math.sin(a) * spkIn);
            ctx.lineTo(Math.cos(a) * spkOut, Math.sin(a) * spkOut); ctx.stroke();
        }
        ctx.lineWidth = pw * 0.45;
        ctx.beginPath(); ctx.arc(0, 0, r * 0.13, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
    }

    let engListenersAdded = false;
    function initEngineViz() {
        if (!engineCanvas) return;
        const info = initCanvas(engineCanvas);
        if (!info) return;
        engineCtx = info.ctx; engineW = info.w; engineH = info.h;
        buildEngScript();
        initEngState();
        // Cache timeline DOM elements
        engFillEl = document.getElementById('engFill');
        engHandleEl = document.getElementById('engHandle');
        engTrackEl = document.getElementById('engTrack');
        if (!engListenersAdded) {
            engListenersAdded = true;
            // Pause / play button
            const pauseBtn = document.getElementById('engPause');
            const pauseSvg = '<svg viewBox="0 0 10 12" fill="currentColor"><rect x="0" y="0" width="3" height="12" rx=".5"/><rect x="7" y="0" width="3" height="12" rx=".5"/></svg>';
            const playSvg = '<svg viewBox="0 0 10 12" fill="currentColor"><polygon points="0,0 10,6 0,12"/></svg>';
            function updatePauseIcon() {
                if (pauseBtn) {
                    pauseBtn.innerHTML = engPlaying ? pauseSvg : playSvg;
                    pauseBtn.setAttribute('aria-label', engPlaying ? 'Pause' : 'Play');
                }
            }
            if (pauseBtn) pauseBtn.addEventListener('click', () => {
                engPlaying = !engPlaying;
                updatePauseIcon();
            });
            // Speed button
            const spdBtn = document.getElementById('engSpd');
            if (spdBtn) spdBtn.addEventListener('click', () => {
                engSpeedIdx = (engSpeedIdx + 1) % ENG_SPEEDS.length;
                engSpeed = ENG_SPEEDS[engSpeedIdx];
                const lbl = engSpeed === 1 ? '1×' : engSpeed === 1.5 ? '1.5×' : engSpeed === 2 ? '2×' : engSpeed === 3 ? '3×' : '5×';
                spdBtn.textContent = lbl;
            });
            // Replay button
            const replayBtn = document.getElementById('engReplay');
            if (replayBtn) replayBtn.addEventListener('click', () => {
                initEngState(); engPlaying = true; updatePauseIcon();
            });
            // Timeline scrubbing — mouse
            function engGetPct(e) {
                if (!engTrackEl) return 0;
                const r = engTrackEl.getBoundingClientRect();
                return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
            }
            if (engTrackEl) {
                engTrackEl.addEventListener('mousedown', e => {
                    engDragging = true; engPlaying = false;
                    const pct = engGetPct(e);
                    engElapsed = pct * ENG_TOTAL_T;
                    processEngEventsUpTo(engElapsed);
                });
            }
            window.addEventListener('mousemove', e => {
                if (!engDragging) return;
                const pct = engGetPct(e);
                engElapsed = pct * ENG_TOTAL_T;
                processEngEventsUpTo(engElapsed);
            });
            window.addEventListener('mouseup', () => {
                if (engDragging) { engDragging = false; engPlaying = true; updatePauseIcon(); }
            });
            // Touch support
            if (engTrackEl) {
                engTrackEl.addEventListener('touchstart', e => {
                    engDragging = true; engPlaying = false;
                    const r = engTrackEl.getBoundingClientRect();
                    const pct = Math.max(0, Math.min(1, (e.touches[0].clientX - r.left) / r.width));
                    engElapsed = pct * ENG_TOTAL_T;
                    processEngEventsUpTo(engElapsed);
                }, { passive: true });
            }
            window.addEventListener('touchmove', e => {
                if (!engDragging || !engTrackEl) return;
                const r = engTrackEl.getBoundingClientRect();
                const pct = Math.max(0, Math.min(1, (e.touches[0].clientX - r.left) / r.width));
                engElapsed = pct * ENG_TOTAL_T;
                processEngEventsUpTo(engElapsed);
            }, { passive: true });
            window.addEventListener('touchend', () => {
                if (engDragging) { engDragging = false; engPlaying = true; updatePauseIcon(); }
            });
        }
    }

    function drawEngineViz() {
        if (!engineCtx) return;
        const ctx = engineCtx, W = engineW, H = engineH;
        ctx.clearRect(0, 0, W, H);

        // Advance time (only when playing and not scrubbing)
        const msPerFrame = (1000 / 60) * engSpeed;
        if (engPlaying && !engDragging) {
            engElapsed += msPerFrame; engFrame2++;
            if (engElapsed >= ENG_TOTAL_T) { initEngState(); }
        } else {
            engFrame2++;
        }

        // Apply pending events
        while (engSIdx < engScript.length && engElapsed >= engScript[engSIdx].t) {
            engApplyEv(engScript[engSIdx], false); engSIdx++;
        }
        if (engBannOn && engElapsed > engBannEnd) { engBannOn = false; }

        // Update progress bar
        const pct = ENG_TOTAL_T > 0 ? Math.min(1, engElapsed / ENG_TOTAL_T) : 0;
        if (engFillEl) engFillEl.style.width = (pct * 100) + '%';
        if (engHandleEl) engHandleEl.style.left = (pct * 100) + '%';

        // Update edges
        engEdges.forEach(e => { if (e.prog < 1) e.prog = Math.min(1, e.prog + .018); });
        engForecastEdges.forEach(e => { if (e.prog < 1) e.prog = Math.min(1, e.prog + .012); });

        // Update particles
        for (let i = engParticles.length - 1; i >= 0; i--) {
            engParticles[i].p += engParticles[i].sp;
            if (engParticles[i].p > 1.15) engParticles.splice(i, 1);
        }

        // Annotation fade
        engNodeAnns.forEach(a => { if (engElapsed - a.born > 3200) a.alpha = Math.max(0, a.alpha - .018); });
        engNodeAnns = engNodeAnns.filter(a => a.alpha > .005);

        // Node smooth update
        ENG_NODES.forEach((n, i) => {
            if (!engNS[i].rev) engNS[i].tAl = .55;
            const s = engNS[i];
            s.al += (s.tAl - s.al) * .045;
            s.sc += (s.tSc - s.sc) * .065;
            if (s.p0 && s.p0ring < 1) s.p0ring = Math.min(1, s.p0ring + .015);
        });

        const nodeH = H - 40;

        // ── Ward ellipse backgrounds (neutral grey shading — ward zones are labelled inline) ──
        const WARD_ELL = [
            { l: 'WARD A',       cx: .17, cy: .28, rx: .18, ry: .22 },
            { l: 'WARD B',       cx: .79, cy: .28, rx: .18, ry: .22 },
            { l: 'WARD C (ICU)', cx: .53, cy: .76, rx: .22, ry: .17 },
        ];
        WARD_ELL.forEach(w => {
            const cx = w.cx * W, cy = w.cy * nodeH, rx = w.rx * W, ry = w.ry * nodeH;
            ctx.save();
            ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(30,30,43,0.045)'; ctx.fill();
            ctx.strokeStyle = 'rgba(30,30,43,0.22)'; ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(30,30,43,0.6)';
            ctx.font = `500 10px ${MONO}`; ctx.textAlign = 'center';
            ctx.fillText(w.l, cx, cy - ry + 14);
            ctx.restore();
        });

        // ── Edges ──
        engEdges.forEach(e => drawEngEdge(ctx, ENG_NODES[e.from], ENG_NODES[e.to], e.prog, e.inf));

        // Forecast edges
        engForecastEdges.forEach(e => {
            const f = engNPos(ENG_NODES[e.from]), t = engNPos(ENG_NODES[e.to]);
            const prog = e.prog, mx = f.x + (t.x - f.x) * prog, my = f.y + (t.y - f.y) * prog;
            const pulse = .3 + Math.sin(engFrame2 * .05) * .15;
            ctx.save(); ctx.globalAlpha = Math.min(pulse, prog * 2);
            ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(mx, my);
            ctx.setLineDash([6, 4]); ctx.strokeStyle = 'rgba(255,7,58,.45)'; ctx.lineWidth = 1.8; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(mx, my);
            ctx.strokeStyle = 'rgba(255,7,58,.12)'; ctx.lineWidth = 5; ctx.stroke(); ctx.setLineDash([]);
            if (prog > .9) {
                const a = Math.atan2(t.y - f.y, t.x - f.x), rr = 12, sz = 5;
                const ax = t.x - Math.cos(a) * rr, ay = t.y - Math.sin(a) * rr;
                ctx.globalAlpha = Math.min(pulse, (prog - .9) / .1);
                ctx.beginPath(); ctx.moveTo(ax, ay);
                ctx.lineTo(ax - sz * Math.cos(a - .4), ay - sz * Math.sin(a - .4));
                ctx.lineTo(ax - sz * Math.cos(a + .4), ay - sz * Math.sin(a + .4));
                ctx.closePath(); ctx.fillStyle = 'rgba(255,7,58,.5)'; ctx.fill();
            }
            ctx.restore();
        });

        // ── Particles ──
        engParticles.forEach(p => {
            if (p.p < 0) return;
            const t = Math.min(1, p.p), x = p.x + (p.tx - p.x) * t + Math.sin(t * Math.PI) * p.dr;
            const y = p.y + (p.ty - p.y) * t - Math.sin(t * Math.PI) * 5;
            const fi = Math.min(1, t * 5), fo = t > .75 ? 1 - (t - .75) / .25 : 1;
            ctx.save(); ctx.globalAlpha = p.al * fi * fo;
            ctx.beginPath(); ctx.arc(x, y, p.sz, 0, Math.PI * 2); ctx.fillStyle = p.c; ctx.fill();
            ctx.restore();
        });

        // ── Nodes ──
        ENG_NODES.forEach((n, i) => {
            const s = engNS[i], p = engNPos(n), r = engNR(n);
            if (s.al < .01) return;
            ctx.save(); ctx.globalAlpha = s.al;
            // Glow
            if (s.glow !== 'transparent') {
                const g = ctx.createRadialGradient(p.x, p.y, r * .3, p.x, p.y, r * 2.8);
                g.addColorStop(0, s.glow); g.addColorStop(1, 'transparent');
                ctx.fillStyle = g; ctx.fillRect(p.x - r * 3, p.y - r * 3, r * 6, r * 6);
            }
            // Patient Zero ring
            if (s.p0 && s.p0ring > 0) {
                const ra = .15 + Math.sin(engFrame2 * .033) * .08;
                ctx.beginPath(); ctx.arc(p.x, p.y, (r + 8) * s.sc, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(30,30,43,${ra})`; ctx.lineWidth = 2; ctx.stroke();
                const gr = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r * 3);
                gr.addColorStop(0, 'rgba(30,30,43,.08)'); gr.addColorStop(1, 'transparent');
                ctx.fillStyle = gr; ctx.fillRect(p.x - r * 3, p.y - r * 3, r * 6, r * 6);
                ctx.globalAlpha = s.al * (.3 + Math.sin(engFrame2 * .033) * .1);
                ctx.strokeStyle = 'rgba(30,30,43,.3)'; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(p.x - r * 1.6, p.y); ctx.lineTo(p.x + r * 1.6, p.y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(p.x, p.y - r * 1.6); ctx.lineTo(p.x, p.y + r * 1.6); ctx.stroke();
                ctx.globalAlpha = s.al;
            }
            // Forecast pulse
            if (s.pulse) {
                const pr = r + 4 + Math.sin(engFrame2 * .05) * 3;
                ctx.beginPath(); ctx.arc(p.x, p.y, pr, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255,7,58,${.15 + Math.sin(engFrame2 * .042) * .1})`;
                ctx.lineWidth = 1.8; ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
                const fg = ctx.createRadialGradient(p.x, p.y, r, p.x, p.y, r * 2.5);
                fg.addColorStop(0, 'rgba(255,7,58,.06)'); fg.addColorStop(1, 'transparent');
                ctx.fillStyle = fg; ctx.fillRect(p.x - r * 3, p.y - r * 3, r * 6, r * 6);
            }
            // Blue ring (imported)
            if (s.blue) {
                ctx.beginPath(); ctx.arc(p.x, p.y, r * s.sc + 4, 0, Math.PI * 2);
                ctx.strokeStyle = ECL.blue; ctx.lineWidth = 2.5; ctx.stroke();
            }
            // Superspreader ring
            if (s.sup) {
                const pr = 1 + Math.sin(engFrame2 * .05) * .1;
                ctx.beginPath(); ctx.arc(p.x, p.y, (r + 6) * pr * s.sc, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(180,122,69,${.35 + Math.sin(engFrame2 * .042) * .15})`; ctx.lineWidth = 2; ctx.stroke();
            }
            // Purple dashed ring
            if (s.col === ECL.purple) {
                ctx.beginPath(); ctx.arc(p.x, p.y, r * s.sc + 4, 0, Math.PI * 2);
                ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(122,84,136,.55)'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.setLineDash([]);
            }
            // Shape
            const sr = r * s.sc;
            if (n.sh === 'q') {
                ctx.beginPath(); ctx.arc(p.x, p.y, sr, 0, Math.PI * 2);
                ctx.fillStyle = s.col !== ECL.grey ? s.col : ECL.grey; ctx.fill();
                ctx.fillStyle = '#1e1e2b'; ctx.font = `bold ${sr * 1.3}px "Inter Tight",sans-serif`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('?', p.x, p.y + 1); ctx.textBaseline = 'alphabetic';
            } else if (n.sh === 'd') {
                ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.PI / 4);
                ctx.beginPath(); ctx.rect(-sr * .7, -sr * .7, sr * 1.4, sr * 1.4);
                ctx.fillStyle = s.col; ctx.fill(); ctx.restore();
            } else {
                ctx.beginPath(); ctx.arc(p.x, p.y, sr, 0, Math.PI * 2); ctx.fillStyle = s.col; ctx.fill();
            }
            // Specular shine
            if (s.col !== ECL.grey && n.sh !== 'q') {
                const ig = ctx.createRadialGradient(p.x - sr * .2, p.y - sr * .2, 0, p.x, p.y, sr);
                ig.addColorStop(0, 'rgba(30,30,43,.15)'); ig.addColorStop(1, 'transparent');
                if (n.sh === 'd') {
                    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.PI / 4);
                    ctx.beginPath(); ctx.rect(-sr * .7, -sr * .7, sr * 1.4, sr * 1.4); ctx.fillStyle = ig; ctx.fill(); ctx.restore();
                } else {
                    ctx.beginPath(); ctx.arc(p.x, p.y, sr, 0, Math.PI * 2); ctx.fillStyle = ig; ctx.fill();
                }
            }
            // Label
            ctx.font = `500 10px ${MONO}`; ctx.fillStyle = 'rgba(30,30,43,.65)'; ctx.textAlign = 'center';
            if (n.sh !== 'q') ctx.fillText(n.l, p.x, p.y + sr + 14);
            ctx.restore();
        });

        // ── Node annotations ──
        engNodeAnns.forEach(a => {
            const n = ENG_NODES[a.id], p = engNPos(n), r = engNR(n), s = engNS[a.id];
            ctx.save(); ctx.globalAlpha = a.alpha;
            ctx.font = `500 10px ${MONO}`;
            const tw = ctx.measureText(a.text).width;
            const bx = p.x - tw / 2 - 8, by = p.y - r * s.sc - 26, bw = tw + 16, bh = 18;
            // Light callout on light canvas — colored hairline border preserves semantics.
            ctx.fillStyle = 'rgba(239,238,239,0.96)';
            ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 0); else ctx.rect(bx, by, bw, bh); ctx.fill();
            ctx.strokeStyle = a.col; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = a.col; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(a.text, p.x, by + bh / 2 + 0.5);
            ctx.restore();
        });

        // ── OUTBREAK DECLARED full-canvas overlay ──
        let overlayActive = false;
        if (engOutbreakAnim) {
            const oa = engOutbreakAnim;
            const age = engElapsed - oa.startT;
            if (age < oa.overlayDur) {
                overlayActive = true;
                const progress = age / oa.overlayDur;
                ctx.save();
                // Dark vignette (fade in, hold, fade out)
                const vAlpha = progress < 0.1 ? (progress / 0.1) * 0.65 : progress < 0.72 ? 0.65 : 0.65 * (1 - (progress - 0.72) / 0.28);
                const vg = ctx.createRadialGradient(W / 2, nodeH / 2, 0, W / 2, nodeH / 2, Math.max(W, nodeH) * 0.75);
                vg.addColorStop(0, `rgba(239,238,239,${vAlpha * 0.35})`);
                vg.addColorStop(1, `rgba(239,238,239,${vAlpha})`);
                ctx.fillStyle = vg; ctx.fillRect(0, 0, W, nodeH);
                // Shockwave rings
                for (let ri = 0; ri < 3; ri++) {
                    const rp = (progress * 1.1 + ri * 0.18) % 1;
                    const rr = rp * Math.max(W, nodeH) * 0.65;
                    ctx.globalAlpha = (1 - rp) * 0.16;
                    ctx.strokeStyle = '#ff073a'; ctx.lineWidth = 1.8;
                    ctx.beginPath(); ctx.arc(W / 2, nodeH * 0.42, rr, 0, Math.PI * 2); ctx.stroke();
                }
                // Biohazard: expand then fade
                const bioIn = progress < 0.22 ? progress / 0.22 : 1;
                const bioFade = progress < 0.45 ? 1 : progress < 0.88 ? 1 - (progress - 0.45) / 0.43 : 0;
                if (bioFade > 0.01) drawBiohazardSymbol(ctx, W / 2, nodeH * 0.38, bioIn * W * 0.17, bioFade * 0.78);
                // Large centered text
                const tFade = progress < 0.1 ? progress / 0.1 : progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
                if (tFade > 0.01) {
                    const fsBig = Math.round(Math.max(14, W * 0.058));
                    const fsSub = Math.round(Math.max(9, W * 0.034));
                    ctx.globalAlpha = tFade;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#ff073a';
                    ctx.font = `800 ${fsBig}px "Inter Tight",sans-serif`;
                    ctx.fillText('OUTBREAK DECLARED', W / 2, nodeH * 0.66);
                    ctx.fillStyle = 'rgba(30,30,43,0.88)';
                    ctx.font = `600 ${fsSub}px "Inter Tight",sans-serif`;
                    ctx.fillText('NOSOTRACK DEPLOYED', W / 2, nodeH * 0.66 + fsBig * 1.45);
                }
                ctx.restore();
            }
        }

        // ── Banner overlay (with alert envelope icon) — hidden during OUTBREAK overlay ──
        if (engBannOn && !overlayActive) {
            const bw = Math.min(W - 24, 360), bh = 58, bx = (W - bw) / 2, by = 12;
            ctx.save();
            // Light panel on the light canvas; colored hairline encodes the event type.
            ctx.fillStyle = 'rgba(239,238,239,0.97)';
            ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 0); else ctx.rect(bx, by, bw, bh); ctx.fill();
            ctx.strokeStyle = engBannCol; ctx.lineWidth = 1.2;
            ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 0); else ctx.rect(bx, by, bw, bh); ctx.stroke();
            // Alert envelope icon
            let textShift = 0;
            if (engBannAlert) {
                const ix = bx + 20, iy = by + bh / 2;
                ctx.strokeStyle = engBannCol; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.95;
                ctx.beginPath(); ctx.rect(ix - 9, iy - 7, 18, 13); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(ix - 9, iy - 7); ctx.lineTo(ix, iy + 1); ctx.lineTo(ix + 9, iy - 7); ctx.stroke();
                textShift = 14;
            }
            const textX = bx + bw / 2 + textShift;
            ctx.globalAlpha = 1; ctx.fillStyle = engBannCol;
            ctx.font = `500 10px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(engBannLabel, textX, by + 18);
            ctx.fillStyle = '#1e1e2b';
            ctx.font = `500 13px "Inter Tight",sans-serif`;
            ctx.fillText(engBannText, textX, by + 40);
            ctx.restore();
        }

        // ── Virus logo: animated slide from center → bottom-left, then stays ──
        if (engLogoActive) {
            const destX = 22, destY = nodeH - 20;
            let logoX = destX, logoY = destY, logoAlpha = 0.88;
            if (engOutbreakAnim) {
                const oa = engOutbreakAnim;
                const age = engElapsed - oa.startT;
                const slideAge = age - oa.slideStartT;
                if (slideAge < 0) {
                    // Logo appearing at center, not yet sliding
                    const showP = Math.max(0, Math.min(1, age / oa.slideStartT));
                    logoX = W / 2; logoY = nodeH * 0.58;
                    logoAlpha = showP * 0.9;
                } else if (slideAge < oa.slideDur) {
                    // Sliding from center to bottom-left (ease-out cubic)
                    const t = slideAge / oa.slideDur;
                    const ease = 1 - Math.pow(1 - t, 3);
                    logoX = W / 2 + (destX - W / 2) * ease;
                    logoY = nodeH * 0.58 + (destY - nodeH * 0.58) * ease;
                    logoAlpha = 0.9;
                }
            }
            ctx.save(); ctx.globalAlpha = logoAlpha;
            window.drawBrandMark(ctx, engFrame2, logoX, logoY, { size: 32 });
            ctx.fillStyle = '#1e1e2b'; ctx.globalAlpha = logoAlpha * 0.62;
            ctx.font = `600 10px "Inter Tight",sans-serif`;
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText('Noso', logoX + 20, logoY);
            ctx.fillStyle = ACCENT; ctx.globalAlpha = logoAlpha * 0.74;
            ctx.fillText('Track', logoX + 20 + ctx.measureText('Noso').width, logoY);
            ctx.restore();
        }

        // ── Legend strip (node types only — ward zones are annotated in-viz) ──
        const stripH = 40, stripY = H - stripH;
        ctx.save();
        ctx.fillStyle = 'rgba(243,243,243,0.96)';
        ctx.fillRect(0, stripY, W, stripH);
        ctx.strokeStyle = 'rgba(30,30,43,0.24)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, stripY + 0.5); ctx.lineTo(W, stripY + 0.5); ctx.stroke();

        // Node type legend (single row)
        const LY1 = stripY + 20, iR = 5, iGap = 6, sp = 14;
        const LEG = [
            { type: 'c', col: ECL.grey, lbl: 'Susceptible' },
            { type: 'c', col: ECL.red, lbl: 'Confirmed' },
            { type: 'c', col: ECL.purple, lbl: 'Undetected' },
            { type: 'd', col: ECL.orange, lbl: 'Superspreader' },
            { type: 'r', col: ECL.blue, lbl: 'Imported' },
            { type: '-', col: '#ff073a', lbl: 'Forecast' },
        ];
        ctx.font = `500 10px ${MONO}`; ctx.globalAlpha = 1;
        let tw2 = 0;
        LEG.forEach(it => { tw2 += iR * 2 + iGap + ctx.measureText(it.lbl).width + sp; }); tw2 -= sp;
        let lx2 = Math.max(10, (W - tw2) / 2);
        LEG.forEach(it => {
            const ix = lx2 + iR;
            if (it.type === 'c') {
                ctx.fillStyle = it.col; ctx.beginPath(); ctx.arc(ix, LY1, iR, 0, Math.PI * 2); ctx.fill();
            } else if (it.type === 'd') {
                ctx.fillStyle = it.col; ctx.beginPath();
                ctx.moveTo(ix, LY1 - iR * 1.3); ctx.lineTo(ix + iR * 1.3, LY1); ctx.lineTo(ix, LY1 + iR * 1.3); ctx.lineTo(ix - iR * 1.3, LY1);
                ctx.closePath(); ctx.fill();
            } else if (it.type === 'r') {
                ctx.beginPath(); ctx.arc(ix, LY1, iR, 0, Math.PI * 2); ctx.strokeStyle = it.col; ctx.lineWidth = 1.6; ctx.stroke();
            } else {
                ctx.strokeStyle = it.col; ctx.lineWidth = 1.4; ctx.setLineDash([3, 3]);
                ctx.beginPath(); ctx.moveTo(lx2, LY1); ctx.lineTo(lx2 + iR * 2 - 1, LY1); ctx.stroke(); ctx.setLineDash([]);
                ctx.fillStyle = it.col; ctx.beginPath();
                ctx.moveTo(lx2 + iR * 2 + 3, LY1); ctx.lineTo(lx2 + iR * 2 - 2, LY1 - 3); ctx.lineTo(lx2 + iR * 2 - 2, LY1 + 3);
                ctx.closePath(); ctx.fill();
            }
            lx2 += iR * 2 + iGap;
            ctx.fillStyle = '#1e1e2b'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText(it.lbl, lx2, LY1);
            lx2 += ctx.measureText(it.lbl).width + sp;
        });

        // (Ward colour band row removed — ward zones are annotated directly in the viz.)
        ctx.restore();
    }

    // Init
    initBg();
    initEngineViz();

    window.addEventListener('resize', () => {
        initBg();
        Object.keys(vizCanvases).forEach(k => { const c = vizCanvases[k]; const info = initCanvas(c.el); if (info) { c.ctx = info.ctx; c.w = info.w; c.h = info.h; } });
        connectors.forEach(c => { const info = initCanvas(c.el); if (info) { c.ctx = info.ctx; c.w = info.w; c.h = info.h; } });
        initEngineViz();
    });

    function animate() {
        requestAnimationFrame(animate);
        frame++;
        drawBg();
        connectors.forEach(animateConnector);
        vizDNA(); vizContact(); vizEHR(); vizAnon(); drawAlertsChart();
        drawEngineViz();
    }
    setTimeout(() => { requestAnimationFrame(animate); }, 150);
})();
