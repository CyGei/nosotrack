/* Shared playback wiring. Each [data-demo] figure owns its iframe and controls. */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-demo]').forEach(figure => {
        const frame = figure.querySelector('iframe');
        const mount = figure.querySelector('.demo-playbar');
        if (!frame || !mount || !window.Nosotrack?.createPlaybar)
            return;
        const french = document.documentElement.lang.startsWith('fr');
        let state = { time: 0, duration: 1, playing: true, speed: 1 };
        const send = (cmd, extra = {}) => frame.contentWindow.postMessage({ source: 'nosotrack-host', cmd, ...extra }, location.origin);
        const labelFullscreen = expanded => {
            const button = mount.querySelector('.playbar-fs');
            const label = french
                ? (expanded ? 'Réduire la vidéo' : 'Agrandir la vidéo')
                : (expanded ? 'Exit fullscreen' : 'Fullscreen');
            button.setAttribute('aria-label', label);
            button.setAttribute('aria-pressed', String(expanded));
            button.title = label;
        };
        const bar = window.Nosotrack.createPlaybar(mount, {
            variant: 'light', speeds: [1, 1.5, 2, 3], initialSpeedIdx: 0,
            showTime: true, showFullscreen: true, fullscreenTarget: figure,
            onFullscreen: labelFullscreen,
            onTogglePlay() { send('toggle'); },
            onSeek(t) { send('seek', { t }); state.time = t; bar.update(state); },
            onSpeedChange(value) { send('speed', { value }); state.speed = value; bar.update(state); },
        });
        labelFullscreen(false);
        window.addEventListener('message', event => {
            const data = event.data;
            if (event.source !== frame.contentWindow || event.origin !== location.origin || data?.source !== 'nosotrack-demo')
                return;
            if (data.type === 'ready')
                state.duration = data.duration || state.duration;
            else if (data.type === 'tick')
                state = { time: data.time, duration: data.duration, playing: data.playing, speed: data.speed };
            else
                return;
            bar.update(state);
        });
    });
});
