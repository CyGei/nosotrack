/* Recolour only pigs already present in the original pixel-art farm assets. */
(() => {
    const farmA = document.getElementById('farmAInfection'), farmC = document.getElementById('farmCInfection'), hub = document.getElementById('hubInfection');
    const slide = farmA?.closest('.slide');
    if (!slide || !farmA || !farmC || !hub)
        return;
    const DURATION = 15000, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SMALL_PIGS = [[900, 535, 160, 135], [742, 608, 175, 140], [878, 695, 180, 145]];
    const HUB_PIGS = [[365, 195, 135, 115], [438, 604, 135, 110], [920, 640, 125, 100]];
    const load = src => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
    const variant = (image, regions) => {
        const surface = document.createElement('canvas');
        surface.width = image.naturalWidth;
        surface.height = image.naturalHeight;
        const context = surface.getContext('2d', { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, surface.width, surface.height), data = pixels.data;
        regions.forEach(([x, y, w, h]) => {
            const x2 = Math.min(surface.width, x + w), y2 = Math.min(surface.height, y + h);
            for (let py = Math.max(0, y); py < y2; py++)
                for (let px = Math.max(0, x); px < x2; px++) {
                    const i = (py * surface.width + px) * 4, r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
                    if (a > 160 && r > 205 && g > 95 && b > 95 && Math.abs(g - b) < 45 && r > g + 45) {
                        const shade = Math.min(1, Math.max(.78, r / 253));
                        data[i] = Math.round(255 * shade);
                        data[i + 1] = Math.round(7 * shade);
                        data[i + 2] = Math.round(58 * shade);
                    }
                }
        });
        context.putImageData(pixels, 0, 0);
        return surface;
    };
    const paint = (canvas, frame) => { const context = canvas.getContext('2d'); context.clearRect(0, 0, canvas.width, canvas.height); context.imageSmoothingEnabled = false; context.drawImage(frame, 0, 0, canvas.width, canvas.height); };
    Promise.all([load('/deck-template/assets/pixel-farm-small.png'), load('/deck-template/assets/pixel-farm-hub.png')]).then(([smallImage, hubImage]) => {
        const smallFrames = [smallImage, variant(smallImage, [SMALL_PIGS[0]])];
        const hubFrames = [hubImage, ...HUB_PIGS.map((_, i) => variant(hubImage, HUB_PIGS.slice(0, i + 1)))];
        let started = 0, wasActive = false, lastA = -1, lastHub = -1, lastC = -1;
        const draw = (a, h, c) => { if (a !== lastA) {
            paint(farmA, smallFrames[a]);
            lastA = a;
        } if (h !== lastHub) {
            paint(hub, hubFrames[h]);
            lastHub = h;
        } if (c !== lastC) {
            paint(farmC, smallFrames[c]);
            lastC = c;
        } };
        if (reduce) {
            draw(1, 3, 1);
            slide.classList.add('infection-complete');
            return;
        }
        const tick = now => {
            const active = slide.classList.contains('active-slide');
            if (active) {
                if (!wasActive) {
                    started = now;
                    lastA = lastHub = lastC = -1;
                }
                const phase = Math.min(1, (now - started) / DURATION);
                const a = phase >= .09 ? 1 : 0;
                const h = phase < .44 ? 0 : phase < .56 ? 1 : phase < .68 ? 2 : 3;
                const c = phase < .98 ? 0 : 1;
                slide.classList.toggle('infection-complete', phase >= 1);
                draw(a, h, c);
            }
            else if (wasActive) {
                draw(0, 0, 0);
                slide.classList.remove('infection-complete');
            }
            wasActive = active;
            requestAnimationFrame(tick);
        };
        draw(0, 0, 0);
        requestAnimationFrame(tick);
    }).catch(() => { farmA.style.background = 'center/contain no-repeat url(/deck-template/assets/pixel-farm-small.png)'; farmC.style.background = 'center/contain no-repeat url(/deck-template/assets/pixel-farm-small.png)'; hub.style.background = 'center/contain no-repeat url(/deck-template/assets/pixel-farm-hub.png)'; });
})();
