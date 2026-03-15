// ==========================================
// IPC Co-Pilot: chat bubbles, engine canvas,
// epidemic curves, scenario cycling
// ==========================================
(function () {
    /* ============================================================
       1. CHAT BUBBLES — looping typewriter pop-ups between icons
       ============================================================ */
    const bubbleArea = document.getElementById('ipc-bubble-area');
    const chatMessages = [
        { who: 'expert', text: 'Generate 4 interventions for this outbreak.' },
        { who: 'ai', text: '4 scenarios ready. Run simulations?' },
        { who: 'expert', text: 'Max 12 beds offline in Ward C.' },
        { who: 'ai', text: 'Bed cap applied. Updating all scenarios.' },
        { who: 'expert', text: 'Lab capacity: 15 swabs/day.' },
        { who: 'ai', text: 'Screening re-allocated. Run?' },
        { who: 'expert', text: 'Go. Show projections.' },
    ];
    let chatIdx = 0, charIdx = 0, visibleBubbles = [];
    const MAX_VISIBLE = 3;
    let chatTimer, cursorEl;

    /* ── Terminal-edit helpers for scenario cards ── */
    function getDetailEl(scenarioIdx, detailIdx) {
        const card = document.querySelectorAll('#ipc-scenarios .ipc-scenario-card')[scenarioIdx];
        if (!card) return null;
        return card.querySelectorAll('.ipc-sc-detail')[detailIdx];
    }
    function getDetailValue(el) {
        // Value is the text node(s) after the <span class="ipc-sc-k"> key
        const nodes = Array.from(el.childNodes);
        const keySpan = el.querySelector('.ipc-sc-k');
        let val = '';
        nodes.forEach(n => { if (n !== keySpan) val += n.textContent; });
        return val.replace(/^\s+/, ' ');  // keep leading space
    }
    function setDetailValue(el, text) {
        // Remove all child nodes except the key span and cursor
        const keySpan = el.querySelector('.ipc-sc-k');
        const cursor = el.querySelector('.ipc-sc-cursor');
        Array.from(el.childNodes).forEach(n => {
            if (n !== keySpan && n !== cursor) n.remove();
        });
        const textNode = document.createTextNode(text);
        if (cursor) el.insertBefore(textNode, cursor);
        else keySpan.after(textNode);
    }

    // Terminal delete-then-type on a single detail element
    function terminalEdit(el, newValue, onDone) {
        if (!el) { if (onDone) onDone(); return; }
        el.classList.add('editing');
        const oldVal = getDetailValue(el);
        const cursor = document.createElement('span');
        cursor.className = 'ipc-sc-cursor';
        el.appendChild(cursor);

        let current = oldVal;
        const DEL_SPEED = 35, TYPE_SPEED = 40;

        // Phase 1: delete characters
        function deleteChar() {
            if (current.length > 1) { // keep leading space
                current = current.slice(0, -1);
                setDetailValue(el, current);
                setTimeout(deleteChar, DEL_SPEED + Math.random() * 15);
            } else {
                setTimeout(typeNewChar, 200);
            }
        }
        // Phase 2: type new characters
        let tIdx = 0;
        function typeNewChar() {
            if (tIdx < newValue.length) {
                current += newValue[tIdx];
                setDetailValue(el, current);
                tIdx++;
                setTimeout(typeNewChar, TYPE_SPEED + Math.random() * 20);
            } else {
                setTimeout(() => {
                    el.classList.remove('editing');
                    if (cursor.parentNode) cursor.remove();
                    if (onDone) onDone();
                }, 400);
            }
        }
        setTimeout(deleteChar, 300);
    }

    // Run terminal edits on multiple detail elements in sequence
    function terminalEditSequence(edits, onAllDone) {
        let i = 0;
        function next() {
            if (i >= edits.length) { if (onAllDone) onAllDone(); return; }
            const e = edits[i]; i++;
            const el = getDetailEl(e.scenario, e.detail);
            terminalEdit(el, e.value, () => setTimeout(next, 150));
        }
        next();
    }

    /* ── Edits triggered by chat messages ── */
    // Detail indices: 0=Screening, 1=Staff, 2=Beds, 3=Duration, 4=Units

    // Phase 1 — Expert: "Max 12 beds offline in Ward C"
    // S1 (28) and S2 (18) exceed cap → beds capped, staff scaled, duration extends.
    // S3/S4 under cap but tighter bed pool slows isolation → duration extends.
    const bedEdits = [
        // S1 Ward closure: 28→12 beds, proportional staff cut, lose 1 unit, slower
        { scenario: 0, detail: 2, value: '12' },
        { scenario: 0, detail: 1, value: '12' },
        { scenario: 0, detail: 4, value: '1' },
        { scenario: 0, detail: 3, value: '16d' },
        // S2 Cohorting: 18→12 beds, fewer staff needed, slower clearance
        { scenario: 1, detail: 2, value: '12' },
        { scenario: 1, detail: 1, value: '8' },
        { scenario: 1, detail: 3, value: '18d' },
        // S3 Surveillance: 8 beds under cap, but fewer isolation beds available → longer
        { scenario: 2, detail: 3, value: '12d' },
        // S4 Isolation: 0 beds, but tighter system capacity → longer tail
        { scenario: 3, detail: 3, value: '24d' },
    ];

    // Phase 2 — Expert: "Lab capacity: 15 swabs/day"
    // Every screening strategy must fit 15/day throughput → prioritised, slower detection.
    const testEdits = [
        // S1 Ward closure: can't screen all patients at 15/day → prioritised
        { scenario: 0, detail: 0, value: '15/day priority' },
        { scenario: 0, detail: 3, value: '20d' },
        // S2 Cohorting: exposed contacts exceed 15/day → risk-ranked
        { scenario: 1, detail: 0, value: 'Risk-ranked' },
        { scenario: 1, detail: 3, value: '22d' },
        // S3 Surveillance: all contacts → risk-ranked within cap; flex pool cut
        { scenario: 2, detail: 0, value: 'Risk-ranked' },
        { scenario: 2, detail: 1, value: '6 + 2 flex' },
        { scenario: 2, detail: 3, value: '14d' },
        // S4 Isolation: low-volume testing, but slower detection → needs extra staff
        { scenario: 3, detail: 1, value: '2 added' },
        { scenario: 3, detail: 3, value: '28d' },
    ];

    function onBubbleComplete(msgIdx) {
        if (msgIdx === 3) { terminalEditSequence(bedEdits); setCurvePhase(1); }
        if (msgIdx === 5) { terminalEditSequence(testEdits); setCurvePhase(2); }
    }

    function addBubble() {
        if (!bubbleArea) return;
        const msg = chatMessages[chatIdx % chatMessages.length];
        const bubble = document.createElement('div');
        bubble.className = 'ipc-bubble ipc-bubble--' + msg.who;
        bubbleArea.appendChild(bubble);
        visibleBubbles.push(bubble);

        // Remove old bubbles
        while (visibleBubbles.length > MAX_VISIBLE) {
            const old = visibleBubbles.shift();
            old.classList.add('exit');
            setTimeout(() => old.remove(), 250);
        }

        // Typewriter effect
        charIdx = 0;
        cursorEl = document.createElement('span');
        cursorEl.className = 'ipc-bubble-cursor';
        bubble.appendChild(cursorEl);

        const currentMsgIdx = chatIdx % chatMessages.length;

        function typeChar() {
            if (charIdx < msg.text.length) {
                bubble.insertBefore(document.createTextNode(msg.text[charIdx]), cursorEl);
                charIdx++;
                chatTimer = setTimeout(typeChar, 22 + Math.random() * 28);
            } else {
                setTimeout(() => {
                    if (cursorEl.parentNode) cursorEl.remove();
                    onBubbleComplete(currentMsgIdx);
                    chatIdx++;
                    chatTimer = setTimeout(addBubble, 1200);
                }, 600);
            }
        }
        chatTimer = setTimeout(typeChar, 200);
    }

    /* ============================================================
       2. SIMULATION ENGINE CANVAS — scrolling waveform / data stream
       ============================================================ */
    const engCanvas = document.getElementById('ipc-engine-canvas');
    let engCtx, engW, engH, engDpr;
    const engParticles = [];

    function initEngineCanvas() {
        if (!engCanvas) return;
        engCtx = engCanvas.getContext('2d');
        engDpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = engCanvas.getBoundingClientRect();
        engW = rect.width; engH = rect.height;
        engCanvas.width = engW * engDpr;
        engCanvas.height = engH * engDpr;
        engCtx.setTransform(engDpr, 0, 0, engDpr, 0, 0);
        // Seed particles
        for (let i = 0; i < 40; i++) {
            engParticles.push({
                x: Math.random() * engW,
                y: Math.random() * engH,
                vx: 0.3 + Math.random() * 0.8,
                size: 1 + Math.random() * 1.5,
                opacity: 0.15 + Math.random() * 0.35,
            });
        }
    }

    let engPhase = 0;
    function drawEngine() {
        if (!engCtx) return;
        engCtx.clearRect(0, 0, engW, engH);
        engPhase += 0.02;

        // Scrolling waveform lines
        for (let row = 0; row < 3; row++) {
            const yBase = engH * (0.25 + row * 0.25);
            engCtx.beginPath();
            engCtx.strokeStyle = 'rgba(255,7,58,' + (0.08 + row * 0.03) + ')';
            engCtx.lineWidth = 0.8;
            for (let x = 0; x < engW; x += 2) {
                const y = yBase + Math.sin((x * 0.04) + engPhase + row * 2) * (4 + row * 2)
                    + Math.sin((x * 0.09) + engPhase * 1.5) * 2;
                x === 0 ? engCtx.moveTo(x, y) : engCtx.lineTo(x, y);
            }
            engCtx.stroke();
        }

        // Floating data particles
        engParticles.forEach(p => {
            p.x += p.vx;
            if (p.x > engW + 2) { p.x = -2; p.y = Math.random() * engH; }
            engCtx.beginPath();
            engCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            engCtx.fillStyle = 'rgba(255,7,58,' + p.opacity + ')';
            engCtx.fill();
        });

        requestAnimationFrame(drawEngine);
    }

    /* ============================================================
       3. THREE PROJECTION CANVASES — infections, bed-days, cost
       ============================================================ */
    const canvasIds = ['ipc-canvas-infections', 'ipc-canvas-beddays', 'ipc-canvas-cost'];
    const canvases = canvasIds.map(id => document.getElementById(id));
    if (!canvases[0]) return;
    const ctxs = canvases.map(c => c.getContext('2d'));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resizeAllCanvases() {
        canvases.forEach((c, i) => {
            const rect = c.getBoundingClientRect();
            c.width = rect.width * dpr;
            c.height = rect.height * dpr;
            ctxs[i].setTransform(dpr, 0, 0, dpr, 0, 0);
        });
    }
    resizeAllCanvases();

    const cW = (ci) => canvases[ci].width / dpr;
    const cH = (ci) => canvases[ci].height / dpr;

    // Scenario colors (same order as scenario cards)
    const colors = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b'];

    /* --- Baselines (no action — unchanged across constraint phases) --- */
    const infectBaseline = t => 0.05 + 0.9 * (1 - Math.exp(-3.5 * t));
    const bedBaseline = t => 0.15 + 0.82 * t;
    const costBaseline = t => 0.1 + 0.85 * t;

    /* --- Curve phases: initial → post-bed-cap → post-screening-cap --- */
    const curvePhases = [
        { // Phase 0: no constraints — S1 contains best but at high cost
            infect: [
                t => 0.05 + 0.12 * (1 - Math.exp(-5.5 * t)),
                t => 0.05 + 0.28 * (1 - Math.exp(-3.8 * t)),
                t => 0.05 + 0.16 * (1 - Math.exp(-5.0 * t)),
                t => 0.05 + 0.55 * (1 - Math.exp(-2.5 * t)),
            ],
            bed: [
                t => 0.12 + 0.60 * t * (1 - 0.1 * t),
                t => 0.08 + 0.30 * t * (1 - 0.15 * t),
                t => 0.04 + 0.14 * t * (1 - 0.25 * t),
                t => 0.02 + 0.08 * t * (1 - 0.3 * t),
            ],
            cost: [
                t => 0.12 + 0.65 * t,
                t => 0.08 + 0.38 * t,
                t => 0.06 + 0.20 * t,
                t => 0.04 + 0.45 * t,
            ],
            optimal: 0,
        },
        { // Phase 1: bed cap at 12 — S1 can't fully close, ring-fence leads
            infect: [
                t => 0.05 + 0.30 * (1 - Math.exp(-3.2 * t)),
                t => 0.05 + 0.26 * (1 - Math.exp(-3.8 * t)),
                t => 0.05 + 0.15 * (1 - Math.exp(-5.0 * t)),
                t => 0.05 + 0.55 * (1 - Math.exp(-2.5 * t)),
            ],
            bed: [
                t => 0.10 + 0.38 * t * (1 - 0.1 * t),
                t => 0.07 + 0.28 * t * (1 - 0.15 * t),
                t => 0.04 + 0.14 * t * (1 - 0.25 * t),
                t => 0.02 + 0.08 * t * (1 - 0.3 * t),
            ],
            cost: [
                t => 0.10 + 0.48 * t,
                t => 0.07 + 0.34 * t,
                t => 0.06 + 0.20 * t,
                t => 0.04 + 0.45 * t,
            ],
            optimal: 2,
        },
        { // Phase 2: screening cap (15/day) — S2 degrades, S3 holds via risk ranking
            infect: [
                t => 0.05 + 0.32 * (1 - Math.exp(-3.0 * t)),
                t => 0.05 + 0.34 * (1 - Math.exp(-3.2 * t)),
                t => 0.05 + 0.13 * (1 - Math.exp(-5.2 * t)),
                t => 0.05 + 0.58 * (1 - Math.exp(-2.3 * t)),
            ],
            bed: [
                t => 0.10 + 0.40 * t * (1 - 0.1 * t),
                t => 0.08 + 0.32 * t * (1 - 0.12 * t),
                t => 0.04 + 0.12 * t * (1 - 0.28 * t),
                t => 0.02 + 0.10 * t * (1 - 0.25 * t),
            ],
            cost: [
                t => 0.10 + 0.48 * t,
                t => 0.08 + 0.40 * t,
                t => 0.05 + 0.18 * t,
                t => 0.04 + 0.50 * t,
            ],
            optimal: 2,
        },
    ];

    let currentPhase = 0;
    let optimalIdx = curvePhases[0].optimal;

    const allBaselines = [infectBaseline, bedBaseline, costBaseline];
    let allCurves = [curvePhases[0].infect, curvePhases[0].bed, curvePhases[0].cost];
    const xLabels = [
        [0, 7, 14, 21, 28],
        [0, 7, 14, 21, 28],
        [0, 7, 14, 21, 28],
    ];

    // Continuous loop: draw-in (2s) → hold (4s) → fade (0.5s) → restart
    const DRAW_DUR = 2, HOLD_DUR = 4, FADE_DUR = 0.5;
    const CYCLE_DUR = DRAW_DUR + HOLD_DUR + FADE_DUR;
    let revealed = false;
    let loopStart = 0;

    function setCurvePhase(phase) {
        currentPhase = phase;
        const p = curvePhases[phase];
        allCurves = [p.infect, p.bed, p.cost];
        optimalIdx = p.optimal;
        loopStart = 0; // reset draw-in animation
    }

    function drawAllProjections(timestamp) {
        if (!loopStart) loopStart = timestamp;
        const elapsed = ((timestamp - loopStart) / 1000) % CYCLE_DUR;

        let ease, globalAlpha;
        if (elapsed < DRAW_DUR) {
            const p = elapsed / DRAW_DUR;
            ease = 1 - Math.pow(1 - p, 3);
            globalAlpha = 1;
        } else if (elapsed < DRAW_DUR + HOLD_DUR) {
            ease = 1;
            globalAlpha = 1;
        } else {
            ease = 1;
            globalAlpha = 1 - (elapsed - DRAW_DUR - HOLD_DUR) / FADE_DUR;
        }

        for (let ci = 0; ci < 3; ci++) {
            const ctx = ctxs[ci];
            const w = cW(ci), h = cH(ci);
            const padL = 8, padR = 8, padT = 10, padB = 18;
            const plotW = w - padL - padR;
            const plotH = h - padT - padB;

            ctx.clearRect(0, 0, w, h);
            ctx.globalAlpha = globalAlpha;

            // X-axis ticks
            ctx.save();
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            xLabels[ci].forEach(d => {
                const x = padL + (d / 28) * plotW;
                ctx.fillStyle = 'rgba(255,255,255,0.22)';
                ctx.fillText(d + 'd', x, h - 4);
                ctx.strokeStyle = 'rgba(255,255,255,0.04)';
                ctx.lineWidth = 0.5;
                ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, h - padB); ctx.stroke();
            });
            ctx.restore();

            // Horizontal grid
            ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 0.5;
            for (let i = 0; i <= 4; i++) {
                const y = padT + (i / 4) * plotH;
                ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
            }

            const steps = Math.floor(120 * ease);
            const blFn = allBaselines[ci];
            const scFns = allCurves[ci];

            // Baseline (no action) — dashed, prominent
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1.2;
            ctx.beginPath();
            for (let i = 0; i <= steps; i++) {
                const t = i / 120, x = padL + t * plotW;
                const y = padT + plotH - blFn(t) * plotH;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke(); ctx.setLineDash([]);

            if (ease > 0.5) {
                ctx.save(); ctx.font = '7px monospace';
                ctx.fillStyle = 'rgba(255,255,255,0.35)';
                ctx.textAlign = 'right';
                ctx.fillText('no action', w - padR, padT + plotH - blFn(1) * plotH - 4);
                ctx.restore();
            }

            // Scenario curves
            scFns.forEach((fn, si) => {
                const delay = si * 0.08;
                const scP = Math.max(0, Math.min((ease - delay) / (1 - delay), 1));
                const scSteps = Math.floor(120 * scP);
                if (scSteps < 2) return;

                ctx.strokeStyle = colors[si]; ctx.lineWidth = 1.5; ctx.globalAlpha = globalAlpha * 0.85;
                ctx.beginPath();
                for (let i = 0; i <= scSteps; i++) {
                    const t = i / 120, x = padL + t * plotW;
                    const y = padT + plotH - Math.max(0, fn(t)) * plotH;
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Glow
                ctx.lineWidth = 5; ctx.globalAlpha = globalAlpha * 0.07;
                ctx.beginPath();
                for (let i = 0; i <= scSteps; i++) {
                    const t = i / 120, x = padL + t * plotW;
                    const y = padT + plotH - Math.max(0, fn(t)) * plotH;
                    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.globalAlpha = globalAlpha;

                // Extra glow for optimal scenario (dynamic)
                if (si === optimalIdx && ease >= 1) {
                    ctx.lineWidth = 8; ctx.globalAlpha = globalAlpha * 0.06;
                    ctx.strokeStyle = colors[optimalIdx];
                    ctx.beginPath();
                    for (let i = 0; i <= 120; i++) {
                        const t = i / 120, x = padL + t * plotW;
                        const y = padT + plotH - Math.max(0, fn(t)) * plotH;
                        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                    ctx.globalAlpha = globalAlpha;
                }

                // Tip dot during draw-in
                if (scP < 1) {
                    const tipT = scSteps / 120;
                    const tipX = padL + tipT * plotW;
                    const tipY = padT + plotH - Math.max(0, fn(tipT)) * plotH;
                    ctx.beginPath(); ctx.arc(tipX, tipY, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = colors[si]; ctx.globalAlpha = globalAlpha * 0.9;
                    ctx.fill(); ctx.globalAlpha = globalAlpha;
                }
            });

            ctx.globalAlpha = 1;
        }

        requestAnimationFrame(drawAllProjections);
    }

    /* ============================================================
       5. INTERSECTION OBSERVER — start everything on scroll reveal
       ============================================================ */
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !revealed) {
                revealed = true;
                // Terminal chat
                if (bubbleArea) addBubble();
                // Engine canvas
                initEngineCanvas();
                drawEngine();
                // Projection canvases
                loopStart = 0;
                requestAnimationFrame(drawAllProjections);
            }
        });
    }, { threshold: 0.2 });

    observer.observe(canvases[0]);

    // Handle resize
    window.addEventListener('resize', () => {
        resizeAllCanvases();
        initEngineCanvas();
    });
})();
