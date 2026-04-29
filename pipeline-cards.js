// pipeline-cards.js — mini-canvas animations for the four input/anonymisation
// cards on #platform: DNA, Contact, EHR, Anonymisation.
// Self-bootstrapping: owns its frame counter and rAF loop.

(function () {
    'use strict';
    if (!window.NosoTrack || !window.NosoTrack.initCanvas) {
        console.warn('[pipeline-cards] pipeline-utils.js must load first.');
        return;
    }
    const { initCanvas, ACCENT, ACTIVE, MONO } = window.NosoTrack;
    let frame = 0;

    const vizCanvases = {};

    function init() {
        document.querySelectorAll('.p-card-canvas[data-viz]').forEach(c => {
            if (c.dataset.viz === 'engine') return;  // engine card is its own module
            const info = initCanvas(c);
            if (info) vizCanvases[c.dataset.viz] = { el: c, ctx: info.ctx, w: info.w, h: info.h };
        });
    }

    // ── DNA helix ──
    function vizDNA() {
        const v = vizCanvases.dna; if (!v) return;
        const { ctx, w, h } = v; ctx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2, amp = 26, len = h * 0.8;
        for (let strand = -1; strand <= 1; strand += 2) {
            ctx.strokeStyle = strand === 1 ? ACCENT : ACTIVE;
            ctx.lineWidth = 1.5; ctx.globalAlpha = strand === 1 ? 0.7 : 0.3;
            ctx.beginPath();
            for (let i = 0; i <= 40; i++) {
                const t = i / 40;
                const y = cy - len / 2 + t * len;
                const x = cx + Math.sin(t * Math.PI * 3 + frame * 0.025) * amp * strand;
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // Monochrome DNA rungs — one accent tracer for alert markers only.
        const baseCols = ['#6b7d8f', '#8a7966', '#7a8a70', '#1e1e2b'];
        for (let i = 0; i < 7; i++) {
            const t = (i + 0.3) / 7;
            const y = cy - len / 2 + t * len;
            const off = Math.sin(t * Math.PI * 3 + frame * 0.025) * amp;
            ctx.strokeStyle = baseCols[i % 4]; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.4;
            ctx.beginPath(); ctx.moveTo(cx + off, y); ctx.lineTo(cx - off, y); ctx.stroke();
        }
        ctx.globalAlpha = 1;
        const scanY = cy - len / 2 + ((frame * 1.2) % len);
        ctx.strokeStyle = ACCENT; ctx.lineWidth = 1; ctx.globalAlpha = 0.3;
        ctx.beginPath(); ctx.moveTo(cx - amp - 8, scanY); ctx.lineTo(cx + amp + 8, scanY); ctx.stroke();
        ctx.globalAlpha = 1;
    }

    // ── Contact network ──
    function vizContact() {
        const v = vizCanvases.contact; if (!v) return;
        const { ctx, w, h } = v; ctx.clearRect(0, 0, w, h);
        const cx = w / 2, cy = h / 2;
        const nodes = [
            { x: cx, y: cy, r: 5, staff: true },
            { x: cx - 45, y: cy - 22, r: 3.5 },
            { x: cx + 50, y: cy - 18, r: 3.5 },
            { x: cx - 35, y: cy + 26, r: 3.5 },
            { x: cx + 40, y: cy + 24, r: 3.5 },
            { x: cx - 8,  y: cy - 34, r: 3 },
            { x: cx + 12, y: cy + 36, r: 3 }
        ];
        const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,5],[2,4],[3,6]];
        edges.forEach(([a, b]) => {
            ctx.strokeStyle = 'rgba(30,30,43,0.07)'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(nodes[a].x, nodes[a].y); ctx.lineTo(nodes[b].x, nodes[b].y); ctx.stroke();
        });
        nodes.forEach((n, i) => {
            const maxPhase = n.staff ? 30 : 22;
            const waveColor = n.staff ? ACCENT : 'rgba(30,30,43,0.35)';
            for (let ring = 0; ring < 2; ring++) {
                const phase = (frame * 0.5 + i * 13 + ring * 15) % maxPhase;
                const pulseR = n.r + 5 + phase;
                ctx.strokeStyle = waveColor; ctx.lineWidth = 1;
                ctx.globalAlpha = 0.3 * (1 - phase / maxPhase);
                ctx.beginPath(); ctx.arc(n.x, n.y, pulseR, 0, Math.PI * 2); ctx.stroke();
            }
        });
        ctx.globalAlpha = 1;
        nodes.forEach(n => {
            ctx.fillStyle = n.staff ? ACCENT : 'rgba(30,30,43,0.45)';
            ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
        });
    }

    // ── EHR scrolling ──
    function vizEHR() {
        const v = vizCanvases.ehr; if (!v) return;
        const { ctx, w, h } = v; ctx.clearRect(0, 0, w, h);
        const rowH = 20;
        const cols = [w * 0.08, w * 0.28, w * 0.55, w * 0.78];
        const scrollY = (frame * 0.35) % (rowH * 8);
        ctx.save(); ctx.beginPath(); ctx.rect(0, 0, w, h); ctx.clip();
        for (let r = -1; r < 8; r++) {
            const y = r * rowH - scrollY + h / 2;
            if (y < -rowH || y > h + rowH) continue;
            const rowAlpha = 1 - Math.abs(y - h / 2) / (h * 0.6);
            ctx.globalAlpha = Math.max(0.04, Math.min(0.45, rowAlpha));
            if (r === 0) {
                ctx.font = `500 10px ${MONO}`; ctx.fillStyle = ACCENT;
                ['ID', 'WARD', 'DATE', 'STATUS'].forEach((t, i) => {
                    ctx.textAlign = 'left'; ctx.fillText(t, cols[i], y);
                });
            } else {
                ctx.font = `400 10px ${MONO}`; ctx.fillStyle = '#1e1e2b';
                const ids = ['P001','P002','S003','P004','S005','P006','P007'];
                const wards = ['A','B','C','A','B','C','A'];
                const stati = ['POS','NEG','POS','NEG','POS','NEG','POS'];
                const ri = ((r - 1) + Math.floor(frame * 0.01)) % 7;
                ctx.textAlign = 'left';
                ctx.fillText(ids[ri], cols[0], y);
                ctx.fillText(wards[ri], cols[1], y);
                ctx.fillText('2025-0' + (ri + 1), cols[2], y);
                ctx.fillStyle = stati[ri] === 'POS' ? ACCENT : '#1e1e2b';
                ctx.fillText(stati[ri], cols[3], y);
            }
        }
        ctx.restore(); ctx.globalAlpha = 1;
        const fadeH = 18;
        let gradTop = ctx.createLinearGradient(0, 0, 0, fadeH);
        gradTop.addColorStop(0, 'rgba(239,238,239,0.7)'); gradTop.addColorStop(1, 'transparent');
        ctx.fillStyle = gradTop; ctx.fillRect(0, 0, w, fadeH);
        let gradBot = ctx.createLinearGradient(0, h - fadeH, 0, h);
        gradBot.addColorStop(0, 'transparent'); gradBot.addColorStop(1, 'rgba(239,238,239,0.7)');
        ctx.fillStyle = gradBot; ctx.fillRect(0, h - fadeH, w, fadeH);
    }

    // ── Anonymisation ──
    // Symmetric two-column layout: identifiable data right-aligned at the
    // divider, anonymised data left-aligned away from it, red arrow at centre.
    function vizAnon() {
        const v = vizCanvases.anon; if (!v) return;
        const { ctx, w, h } = v; ctx.clearRect(0, 0, w, h);

        const cycle = (frame * 0.007) % 1;
        const TRANSFORM_END = 0.60, HOLD_END = 0.85;
        const globalFade = cycle > HOLD_END ? 1 - (cycle - HOLD_END) / (1 - HOLD_END) : 1;

        const fields = [
            { raw: 'Smith, John A.',     anon: 'SUBJ_7f3a9b2c' },
            { raw: 'DOB 1985-03-12',     anon: 'AGE_GRP 35-44' },
            { raw: 'NHS 485 777 3291',   anon: 'REF_██████' },
            { raw: 'Room 14-B',          anon: 'LOC_████' },
            { raw: 'Ward Birch North',   anon: 'ZONE_BN' },
            { raw: 'Nurse K. Evans',     anon: 'STAFF_A3' },
            { raw: 'Admit 2025-03-01',   anon: 'ADM_Q1_25' },
            { raw: 'PCR+ / MRSA+',       anon: 'FLAG_HAI_POS' },
            { raw: 'GP St. Jude Prac.',  anon: 'PRAC_███' },
        ];
        const nRows = fields.length;
        const headerH = 14, statusH = 10, topPad = 3;
        const rowH = Math.floor((h - headerH - statusH - topPad) / nRows);
        const tableH = nRows * rowH;
        const topY = topPad;
        const headerY = topY + headerH - 4;
        const startY = topY + headerH + 2;
        const midX = w / 2;
        const colGap = 18;
        const leftColCentre  = w * 0.25;
        const rightColCentre = w * 0.75;
        const leftDataX  = midX - colGap / 2;
        const rightDataX = midX + colGap / 2;

        // Headers
        ctx.font = `500 9px ${MONO}`; ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(30,30,43,${0.55 * globalFade})`;
        ctx.fillText('IDENTIFIABLE', leftColCentre, headerY);
        ctx.fillStyle = `rgba(106,140,102,${0.7 * globalFade})`;
        ctx.fillText('ANONYMISED', rightColCentre, headerY);

        // Centre divider
        ctx.strokeStyle = `rgba(255,7,58,${0.18 * globalFade})`; ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        ctx.beginPath(); ctx.moveTo(midX, topY + 2); ctx.lineTo(midX, topY + headerH + tableH); ctx.stroke();
        ctx.setLineDash([]);

        fields.forEach((f, i) => {
            const y = startY + i * rowH;
            const rowStart = (i / nRows) * TRANSFORM_END;
            const t = Math.max(0, Math.min(1, (cycle - rowStart) / 0.14));

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

            // Centre arrow
            if (t > 0.15 && t < 0.9) {
                const arrowAlpha = Math.sin(((t - 0.15) / 0.75) * Math.PI) * 0.85;
                ctx.font = `500 11px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = `rgba(255,7,58,${arrowAlpha * globalFade})`;
                ctx.fillText('→', midX, y - 3);
                ctx.textBaseline = 'alphabetic';
            }

            // Right column
            const anonAlpha = t > 0.45 ? Math.min(0.9, (t - 0.45) / 0.4) : 0;
            ctx.font = `400 9px ${MONO}`; ctx.textAlign = 'left';
            ctx.fillStyle = `rgba(106,140,102,${anonAlpha * globalFade})`;
            ctx.fillText(f.anon, rightDataX, y);
        });

        // Status label
        const statusY = topY + headerH + tableH + 8;
        ctx.font = `500 9px ${MONO}`; ctx.textAlign = 'center';
        if (cycle < TRANSFORM_END) {
            ctx.fillStyle = `rgba(255,7,58,${(0.6 + Math.sin(frame * 0.06) * 0.15) * globalFade})`;
            ctx.fillText('ANONYMISING...', midX, statusY);
        } else if (cycle < HOLD_END) {
            ctx.fillStyle = `rgba(106,140,102,${0.75 * globalFade})`;
            ctx.fillText('GDPR/HIPAA COMPLIANT ✓', midX, statusY);
        }
    }

    function loop() { frame++; vizDNA(); vizContact(); vizEHR(); vizAnon(); requestAnimationFrame(loop); }

    init();
    requestAnimationFrame(loop);
    window.addEventListener('resize', init);
})();
