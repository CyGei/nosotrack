// pipeline-utils.js — shared helpers for the platform section's canvas modules.
//
// The platform pipeline is split across four self-bootstrapping modules:
// pipeline-bg, pipeline-cards, pipeline-alerts, pipeline-engine. Each one
// owns its own frame counter and rAF loop — there's no registry and no
// cross-module coordination. They share only the helpers and constants below.

(function () {
    'use strict';
    const NS = window.NosoTrack = window.NosoTrack || {};

    // Initialise a 2D canvas at devicePixelRatio (capped at 2). Returns
    // { ctx, w, h } in CSS pixels, or null if the element is missing.
    NS.initCanvas = function (canvas) {
        if (!canvas) return null;
        const dpr = Math.min(window.devicePixelRatio, 2);
        const r = canvas.getBoundingClientRect();
        canvas.width  = r.width  * dpr;
        canvas.height = r.height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return { ctx, w: r.width, h: r.height };
    };

    // Brand tokens used across canvas modules.
    NS.ACCENT = '#ff073a';
    NS.ACTIVE = '#1e1e2b';
    NS.MONO   = '"JetBrains Mono", monospace';
})();
