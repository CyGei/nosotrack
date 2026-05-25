// playbar.js — shared playback bar for the demo iframe and the engine card.
//
// One implementation, two consumers (#demo, the engine card on #platform).
// Owns: pause/play, scrub (mouse + touch), speed cycle, fullscreen.
//
// Fullscreen is CSS-pinned (toggles `.is-fullscreen` on a target element) so it
// works on iPhone, where Webkit doesn't expose requestFullscreen on non-<video>
// elements. Press Escape to exit.
//
// Usage:
//   const bar = NosoTrack.createPlaybar(mountEl, {
//     variant: 'light' | 'dark',         // colour scheme
//     trackLabel: 'OUTBREAK',            // small mono caption (optional)
//     speeds: [1, 1.5, 2, 3, 5],         // speed cycle
//     initialSpeedIdx: 0,
//     showTime: true,                    // show "M:SS" readout
//     showFullscreen: true,              // show FS button
//     fullscreenTarget: someContainerEl, // element pinned in fullscreen
//     onTogglePlay() { ... },
//     onSeek(timeInSec) { ... },
//     onSpeedChange(speed) { ... },
//     onFullscreen(isFs) { ... }
//   });
//   bar.update({ time, duration, playing, speed });

(function () {
    'use strict';

    const PAUSE_SVG =
        '<svg viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">' +
        '<rect x="0" y="0" width="3" height="12" rx=".5"/>' +
        '<rect x="7" y="0" width="3" height="12" rx=".5"/></svg>';
    const PLAY_SVG =
        '<svg viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">' +
        '<path d="M1 1 L1 11 L9 6 Z"/></svg>';
    const FS_SVG =
        '<svg viewBox="0 0 16 16" width="12" height="12" fill="none" ' +
        'stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">' +
        '<path d="M2 6V2h4"/><path d="M14 6V2h-4"/>' +
        '<path d="M2 10v4h4"/><path d="M14 10v4h-4"/></svg>';

    function fmtTime(t) {
        const total = Math.max(0, t);
        const m = Math.floor(total / 60);
        const s = Math.floor(total % 60);
        return m + ':' + String(s).padStart(2, '0');
    }

    function fmtSpeed(s) {
        return (s % 1 === 0 ? s.toFixed(0) : String(s)) + '×';
    }

    function createPlaybar(mount, opts) {
        opts = opts || {};
        const speeds = opts.speeds || [1, 1.5, 2, 3, 5];
        let speedIdx = Math.max(0, Math.min(speeds.length - 1, opts.initialSpeedIdx | 0));
        const showTime = opts.showTime !== false;
        const showFullscreen = !!opts.showFullscreen;
        const fsTarget = opts.fullscreenTarget || null;

        // ── Render ──
        mount.classList.add('playbar');
        if (opts.variant === 'dark') mount.classList.add('playbar--dark');
        mount.setAttribute('role', 'group');
        mount.setAttribute('aria-label', 'Playback controls');
        mount.innerHTML =
            (opts.trackLabel ? '<span class="playbar-tl">' + opts.trackLabel + '</span>' : '') +
            '<button type="button" class="playbar-pause" aria-label="Pause">' + PAUSE_SVG + '</button>' +
            '<div class="playbar-track"><div class="playbar-fill"></div><div class="playbar-handle"></div></div>' +
            (showTime ? '<span class="playbar-time">0:00</span>' : '') +
            '<button type="button" class="playbar-spd">' + fmtSpeed(speeds[speedIdx]) + '</button>' +
            (showFullscreen ? '<button type="button" class="playbar-fs" aria-label="Toggle fullscreen">' + FS_SVG + '</button>' : '');

        const pauseBtn = mount.querySelector('.playbar-pause');
        const track    = mount.querySelector('.playbar-track');
        const fill     = mount.querySelector('.playbar-fill');
        const handle   = mount.querySelector('.playbar-handle');
        const timeLbl  = mount.querySelector('.playbar-time');
        const spdBtn   = mount.querySelector('.playbar-spd');
        const fsBtn    = mount.querySelector('.playbar-fs');

        // Local mirror — driven by `update()`, used to paint without round-trips.
        let state = { time: 0, duration: 1, playing: true, speed: speeds[speedIdx] };

        function paint() {
            const pct = state.duration > 0
                ? Math.max(0, Math.min(100, (state.time / state.duration) * 100))
                : 0;
            fill.style.width  = pct + '%';
            handle.style.left = pct + '%';
            if (timeLbl) timeLbl.textContent = fmtTime(state.time);
            pauseBtn.innerHTML = state.playing ? PAUSE_SVG : PLAY_SVG;
            pauseBtn.setAttribute('aria-label', state.playing ? 'Pause' : 'Play');
        }
        paint();

        // ── Pause / play ──
        pauseBtn.addEventListener('click', () => {
            if (typeof opts.onTogglePlay === 'function') opts.onTogglePlay();
        });

        // ── Speed cycle ──
        spdBtn.addEventListener('click', () => {
            speedIdx = (speedIdx + 1) % speeds.length;
            const s = speeds[speedIdx];
            spdBtn.textContent = fmtSpeed(s);
            if (typeof opts.onSpeedChange === 'function') opts.onSpeedChange(s);
        });

        // ── Scrub (mouse + touch) ──
        function seekFromClientX(x) {
            const r = track.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (x - r.left) / r.width));
            const t = pct * state.duration;
            // Optimistically paint, then defer to host's seek handler.
            state.time = t; paint();
            if (typeof opts.onSeek === 'function') opts.onSeek(t);
        }
        let dragging = false;
        track.addEventListener('mousedown', (e) => { dragging = true; seekFromClientX(e.clientX); e.preventDefault(); });
        window.addEventListener('mousemove', (e) => { if (dragging) seekFromClientX(e.clientX); });
        window.addEventListener('mouseup',   () => { dragging = false; });
        track.addEventListener('touchstart', (e) => { dragging = true; seekFromClientX(e.touches[0].clientX); }, { passive: true });
        window.addEventListener('touchmove', (e) => { if (dragging && e.touches[0]) seekFromClientX(e.touches[0].clientX); }, { passive: true });
        window.addEventListener('touchend',  () => { dragging = false; });

        // ── Fullscreen (CSS-pinned, works on iPhone) ──
        let isFs = false;
        function setFs(v) {
            if (v === isFs) return;
            isFs = v;
            if (fsTarget) fsTarget.classList.toggle('is-fullscreen', v);
            document.body.classList.toggle('has-playbar-fs', v);
            if (typeof opts.onFullscreen === 'function') opts.onFullscreen(v);
        }
        if (fsBtn && fsTarget) {
            fsBtn.addEventListener('click', () => setFs(!isFs));
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && isFs) setFs(false);
            });
        }

        return {
            update(s) {
                if (!s) return;
                if (typeof s.time === 'number')                          state.time     = s.time;
                if (typeof s.duration === 'number' && s.duration > 0)    state.duration = s.duration;
                if (typeof s.playing === 'boolean')                      state.playing  = s.playing;
                if (typeof s.speed === 'number') {
                    state.speed = s.speed;
                    const idx = speeds.indexOf(s.speed);
                    if (idx >= 0 && idx !== speedIdx) {
                        speedIdx = idx;
                        spdBtn.textContent = fmtSpeed(s.speed);
                    }
                }
                paint();
            },
            isFullscreen() { return isFs; },
            exitFullscreen() { setFs(false); }
        };
    }

    window.NosoTrack = window.NosoTrack || {};
    window.NosoTrack.createPlaybar = createPlaybar;
})();
