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
        { who: 'expert', text: 'Generate 4 intervention scenarios based on the current outbreak.' },
        { who: 'ai', text: '4 scenarios loaded. Run simulations?' },
        { who: 'expert', text: 'We cannot close more than 2 units in Ward C.' },
        { who: 'ai', text: 'Constraint applied. Scenarios updated. Run simulations?' },
        { who: 'expert', text: 'Lab capacity capped at 15 PCR tests/day.' },
        { who: 'ai', text: 'Daily screening limited to 15 tests. Run simulations?' },
        { who: 'expert', text: 'Yes.' },
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
    // Detail indices: 0=Screening, 1=Tests, 2=Staffing, 3=Isolation, 4=Scope

    // Phase 1 — Expert: "We cannot close more than 2 units in Ward C."
    // Unit closure cap limits isolation/cohorting/deep-clean space.
    // S4 Ward Closure wanted full Ward C → only 2 units → tests, staffing, isolation, scope degrade.
    // S2 Patient Cohorting → fewer beds, screening narrows to contacts, ratio worsens.
    // S3 Patient + Staff Cohorting → cohort space shrinks, can't hold 2-ward cohort.
    // S1 Standard Precautions → absorbs displaced patients, tightens.
    const bedEdits = [
        // S4 Ward Closure: full closure impossible → partial, tests/ratio/isolation slashed
        { scenario: 3, detail: 1, value: ' 35/day' },
        { scenario: 3, detail: 2, value: ' 1:5' },
        { scenario: 3, detail: 3, value: ' 12 beds' },
        { scenario: 3, detail: 4, value: ' 2 units Ward C' },
        // S2 Patient Cohorting: fewer beds → narrow screening to contacts, ratio worsens
        { scenario: 1, detail: 0, value: ' Contact-based' },
        { scenario: 1, detail: 1, value: ' 20/day' },
        { scenario: 1, detail: 2, value: ' 1:8' },
        { scenario: 1, detail: 3, value: ' 10 beds' },
        // S3 Patient + Staff Cohorting: cohort shrinks, can't sustain Ward C + B
        { scenario: 2, detail: 1, value: ' 15/day' },
        { scenario: 2, detail: 2, value: ' 1:6' },
        { scenario: 2, detail: 3, value: ' 8 beds' },
        { scenario: 2, detail: 4, value: ' Ward C' },
        // S1 Standard Precautions: displaced patients increase load
        { scenario: 0, detail: 2, value: ' 1:12' },
        { scenario: 0, detail: 3, value: ' Restricted' },
        { scenario: 0, detail: 4, value: ' Ward A + B' },
    ];

    // Phase 2 — Expert: "Lab capacity capped at 15 PCR tests/day."
    // Testing bottleneck cascades: fewer tests → fewer detected → fewer to isolate → staff rebalanced.
    // S4 Ward Closure: tests slashed, isolation shrinks, scope narrows further.
    // S2 Patient Cohorting: contact-based→symptomatic, tests capped, isolation halved.
    // S3 Patient + Staff Cohorting: risk-ranked→symptomatic, tests cut, isolation shrinks.
    // S1 Standard Precautions: tests finally capped, staffing stretched, scope narrows.
    const testEdits = [
        // S4 Ward Closure: 35→15/day, 12→10 beds, can only sustain 1 unit
        { scenario: 3, detail: 1, value: ' 15/day' },
        { scenario: 3, detail: 2, value: ' 1:6' },
        { scenario: 3, detail: 3, value: ' 10 beds' },
        { scenario: 3, detail: 4, value: ' 1 unit Ward C' },
        // S2 Patient Cohorting: contact-based→symptomatic, 20→15/day, 10→8 beds
        { scenario: 1, detail: 0, value: ' Symptomatic' },
        { scenario: 1, detail: 1, value: ' 15/day' },
        { scenario: 1, detail: 2, value: ' 1:10' },
        { scenario: 1, detail: 3, value: ' 8 beds' },
        // S3 Patient + Staff Cohorting: risk-ranked→symptomatic, 15→10/day, 8→6 beds
        { scenario: 2, detail: 0, value: ' Symptomatic' },
        { scenario: 2, detail: 1, value: ' 10/day' },
        { scenario: 2, detail: 2, value: ' 1:8' },
        { scenario: 2, detail: 3, value: ' 6 beds' },
        // S1 Standard Precautions: unlimited→15/day, ratio worsens, scope narrows
        { scenario: 0, detail: 1, value: ' 15/day' },
        { scenario: 0, detail: 2, value: ' 1:14' },
        { scenario: 0, detail: 4, value: ' Ward A' },
    ];

    function onBubbleComplete(msgIdx) {
        if (msgIdx === 3) { terminalEditSequence(bedEdits); setSpiderPhase(1); }
        if (msgIdx === 5) { terminalEditSequence(testEdits); setSpiderPhase(2); }
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
       3. SPIDER / RADAR PLOT — 5-axis outcome comparison
       ============================================================ */
    const spiderCanvas = document.getElementById('ipc-spider-canvas');
    if (!spiderCanvas) return;
    const spCtx = spiderCanvas.getContext('2d');
    const spDpr = Math.min(window.devicePixelRatio || 1, 2);

    let spW, spH;
    function resizeSpider() {
        const rect = spiderCanvas.getBoundingClientRect();
        spW = rect.width; spH = rect.height;
        spiderCanvas.width = spW * spDpr;
        spiderCanvas.height = spH * spDpr;
        spCtx.setTransform(spDpr, 0, 0, spDpr, 0, 0);
    }
    resizeSpider();

    const axisLabels = ['CASES', 'BED-DAYS\nLOST', 'COST', 'CONTAINMENT\nDURATION', 'STAFF\nBURDEN'];
    const colors = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b'];
    const NUM_AXES = 5;
    const NUM_SCENARIOS = 4;

    /* Spider data: 5 axes × 4 scenarios × 3 phases (values 0–1, outward = worse)
       Axes: Cases, Bed-days lost, Cost, Containment time, Staff burden
       Scenarios: S1 Standard, S2 Patient Cohorting, S3 Patient+Staff, S4 Ward Closure */
    const spiderPhases = [
        { // Phase 0: unconstrained
            data: [
                [0.85, 0.68, 0.62, 0.80, 0.20],  // S1 Standard Precautions
                [0.48, 0.22, 0.22, 0.52, 0.45],  // S2 Patient Cohorting
                [0.28, 0.28, 0.38, 0.30, 0.65],  // S3 Patient+Staff Cohorting
                [0.12, 0.85, 0.85, 0.18, 0.82],  // S4 Ward Closure
            ],
            optimal: 3,
        },
        { // Phase 1: 2-unit closure cap
            data: [
                [0.82, 0.65, 0.60, 0.78, 0.22],
                [0.45, 0.25, 0.25, 0.50, 0.48],
                [0.25, 0.26, 0.36, 0.28, 0.62],
                [0.38, 0.58, 0.70, 0.42, 0.72],
            ],
            optimal: 2,
        },
        { // Phase 2: 15 PCR/day cap
            data: [
                [0.88, 0.70, 0.65, 0.85, 0.25],
                [0.58, 0.30, 0.30, 0.62, 0.42],
                [0.22, 0.24, 0.34, 0.26, 0.60],
                [0.45, 0.52, 0.65, 0.50, 0.68],
            ],
            optimal: 2,
        },
    ];

    // Current and target values for smooth morphing
    let spCurrent = spiderPhases[0].data.map(row => [...row]);
    let spTarget  = spiderPhases[0].data.map(row => [...row]);
    let spOptimal = spiderPhases[0].optimal;
    const MORPH_SPEED = 0.018; // per frame, ~1.5s at 60fps

    // Continuous looping: cycle through phases automatically
    let spCurrentPhase = 0;
    let spLoopTimer = null;
    const PHASE_HOLD = 4000; // ms to hold each phase before advancing

    function advanceSpiderLoop() {
        spCurrentPhase = (spCurrentPhase + 1) % spiderPhases.length;
        const p = spiderPhases[spCurrentPhase];
        spTarget = p.data.map(row => [...row]);
        spOptimal = p.optimal;
        spLoopTimer = setTimeout(advanceSpiderLoop, PHASE_HOLD);
    }

    function startSpiderLoop() {
        if (spLoopTimer) clearTimeout(spLoopTimer);
        spLoopTimer = setTimeout(advanceSpiderLoop, PHASE_HOLD);
    }

    function setSpiderPhase(phase) {
        // Chat-triggered phase change: set phase and restart loop from here
        if (spLoopTimer) clearTimeout(spLoopTimer);
        spCurrentPhase = phase;
        const p = spiderPhases[phase];
        spTarget = p.data.map(row => [...row]);
        spOptimal = p.optimal;
        spLoopTimer = setTimeout(advanceSpiderLoop, PHASE_HOLD);
    }

    function drawSpider() {
        const cx = spW / 2, cy = spH / 2;
        const radius = Math.min(cx, cy) * 0.68;
        spCtx.clearRect(0, 0, spW, spH);

        // Morph current towards target
        let morphing = false;
        for (let s = 0; s < NUM_SCENARIOS; s++) {
            for (let a = 0; a < NUM_AXES; a++) {
                const diff = spTarget[s][a] - spCurrent[s][a];
                if (Math.abs(diff) > 0.001) {
                    spCurrent[s][a] += diff * MORPH_SPEED * 3.5;
                    morphing = true;
                } else {
                    spCurrent[s][a] = spTarget[s][a];
                }
            }
        }

        // Axis angle helper
        const angle = (i) => (Math.PI * 2 * i / NUM_AXES) - Math.PI / 2;

        // Concentric pentagon grid (levels 0.2, 0.4, 0.6, 0.8, 1.0)
        for (let lvl = 1; lvl <= 5; lvl++) {
            const r = radius * (lvl / 5);
            spCtx.beginPath();
            for (let i = 0; i <= NUM_AXES; i++) {
                const a = angle(i % NUM_AXES);
                const x = cx + Math.cos(a) * r;
                const y = cy + Math.sin(a) * r;
                i === 0 ? spCtx.moveTo(x, y) : spCtx.lineTo(x, y);
            }
            spCtx.strokeStyle = 'rgba(255,255,255,' + (lvl === 5 ? '0.08' : '0.04') + ')';
            spCtx.lineWidth = 0.5;
            spCtx.stroke();
        }

        // Axis spokes
        for (let i = 0; i < NUM_AXES; i++) {
            const a = angle(i);
            spCtx.beginPath();
            spCtx.moveTo(cx, cy);
            spCtx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
            spCtx.strokeStyle = 'rgba(255,255,255,0.06)';
            spCtx.lineWidth = 0.5;
            spCtx.stroke();
        }

        // Draw scenario polygons — all equal weight
        for (let s = 0; s < NUM_SCENARIOS; s++) {
            const vals = spCurrent[s];

            // Build polygon path helper
            function polyPath() {
                spCtx.beginPath();
                for (let i = 0; i <= NUM_AXES; i++) {
                    const ai = i % NUM_AXES;
                    const a = angle(ai);
                    const r = radius * vals[ai];
                    const x = cx + Math.cos(a) * r;
                    const y = cy + Math.sin(a) * r;
                    i === 0 ? spCtx.moveTo(x, y) : spCtx.lineTo(x, y);
                }
            }

            // Filled polygon
            polyPath();
            spCtx.fillStyle = colors[s];
            spCtx.globalAlpha = 0.06;
            spCtx.fill();
            spCtx.globalAlpha = 1;

            // Stroke
            polyPath();
            spCtx.strokeStyle = colors[s];
            spCtx.lineWidth = 1.2;
            spCtx.globalAlpha = 0.6;
            spCtx.stroke();
            spCtx.globalAlpha = 1;

            // Vertex dots
            for (let i = 0; i < NUM_AXES; i++) {
                const a = angle(i);
                const r = radius * vals[i];
                const x = cx + Math.cos(a) * r;
                const y = cy + Math.sin(a) * r;
                spCtx.beginPath();
                spCtx.arc(x, y, 1.8, 0, Math.PI * 2);
                spCtx.fillStyle = colors[s];
                spCtx.globalAlpha = 0.6;
                spCtx.fill();
                spCtx.globalAlpha = 1;
            }
        }

        // Axis labels
        spCtx.font = '10px monospace';
        spCtx.fillStyle = 'rgba(255,255,255,0.6)';
        spCtx.textAlign = 'center';
        spCtx.textBaseline = 'middle';
        for (let i = 0; i < NUM_AXES; i++) {
            const a = angle(i);
            const lbR = radius + 22;
            const lx = cx + Math.cos(a) * lbR;
            const ly = cy + Math.sin(a) * lbR;
            const lines = axisLabels[i].split('\n');
            lines.forEach((line, li) => {
                spCtx.fillText(line, lx, ly + (li - (lines.length - 1) / 2) * 10);
            });
        }

        requestAnimationFrame(drawSpider);
    }

    /* ============================================================
       5. INTERSECTION OBSERVER — start everything on scroll reveal
       ============================================================ */
    let revealed = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !revealed) {
                revealed = true;
                // Terminal chat
                if (bubbleArea) addBubble();
                // Engine canvas
                initEngineCanvas();
                drawEngine();
                // Spider plot — start rendering + continuous phase loop
                requestAnimationFrame(drawSpider);
                startSpiderLoop();
            }
        });
    }, { threshold: 0.2 });

    observer.observe(spiderCanvas);

    // Handle resize
    window.addEventListener('resize', () => {
        resizeSpider();
        initEngineCanvas();
    });
})();
