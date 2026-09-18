// A slide touching the viewport edge is not yet being presented.
// Share the deck's active state instead of starting animations offscreen.
window.observeSlideAnimation = function (element, play, reset) {
    const slide = element.closest('.slide');
    if (!slide) return;
    let active = false;
    reset();
    function update() {
        const next = slide.classList.contains('active-slide');
        if (next === active) return;
        active = next;
        if (active) play();
        else reset();
    }
    new MutationObserver(update).observe(slide, { attributes: true, attributeFilter: ['class'] });
    update();
};

document.addEventListener('DOMContentLoaded', function () {
    const header = "<a class=\"slide-mark\" href=\"/\" target=\"_top\" aria-label=\"Return to nosotrack.com\" title=\"Return to nosotrack.com\"><svg viewBox=\"0 0 32 32\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"square\">\r\n<path d=\"M3 8 L3 3 L8 3\" stroke-width=\"1.2\"/><path d=\"M24 3 L29 3 L29 8\" stroke-width=\"1.2\"/>\r\n<path d=\"M29 24 L29 29 L24 29\" stroke-width=\"1.2\"/><path d=\"M8 29 L3 29 L3 24\" stroke-width=\"1.2\"/>\r\n<line x1=\"16.00\" y1=\"11.20\" x2=\"16.00\" y2=\"15.60\" stroke-width=\"0.55\"/>\r\n<line x1=\"11.31\" y1=\"19.30\" x2=\"15.13\" y2=\"17.10\" stroke-width=\"0.55\"/>\r\n<line x1=\"20.69\" y1=\"19.30\" x2=\"16.87\" y2=\"17.10\" stroke-width=\"0.55\"/>\r\n<circle cx=\"16\" cy=\"9\" r=\"2.2\" stroke-width=\"0.35\"/><circle cx=\"9.4\" cy=\"20.4\" r=\"2.2\" stroke-width=\"0.35\"/>\r\n<circle cx=\"22.6\" cy=\"20.4\" r=\"2.2\" stroke-width=\"0.35\"/><circle cx=\"16\" cy=\"16.6\" r=\"1.05\" fill=\"#ff073a\" stroke=\"none\"/></svg><span class=\"wordmark\">NOSO<span class=\"accent\">TRACK</span></span></a><span class=\"slide-tag\">Outbreak Forensics &amp; Control</span>";
    const heroLogo = "<svg class=\"hero-brand-svg\" viewBox=\"0 0 32 32\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"square\" aria-hidden=\"true\">\r\n<path d=\"M3 8 L3 3 L8 3\" stroke-width=\"1.1\"/><path d=\"M24 3 L29 3 L29 8\" stroke-width=\"1.1\"/>\r\n<path d=\"M29 24 L29 29 L24 29\" stroke-width=\"1.1\"/><path d=\"M8 29 L3 29 L3 24\" stroke-width=\"1.1\"/>\r\n<g class=\"hero-brand-net\">\r\n<line x1=\"16.00\" y1=\"11.20\" x2=\"16.00\" y2=\"15.60\" stroke-width=\"0.55\"/>\r\n<line x1=\"11.31\" y1=\"19.30\" x2=\"15.13\" y2=\"17.10\" stroke-width=\"0.55\"/>\r\n<line x1=\"20.69\" y1=\"19.30\" x2=\"16.87\" y2=\"17.10\" stroke-width=\"0.55\"/>\r\n<circle cx=\"16\" cy=\"9\" r=\"2.2\" stroke-width=\"0.35\"/><circle cx=\"9.4\" cy=\"20.4\" r=\"2.2\" stroke-width=\"0.35\"/>\r\n<circle cx=\"22.6\" cy=\"20.4\" r=\"2.2\" stroke-width=\"0.35\"/><circle cx=\"16\" cy=\"16.6\" r=\"1.05\" fill=\"#ff073a\" stroke=\"none\"/></g></svg>";
    const customChrome = document.body.hasAttribute('data-custom-chrome');
    if (!customChrome)
        document.querySelectorAll('.slide-top').forEach(el => { el.innerHTML = header; });
    const tagline = document.body.dataset.deckTagline;
    if (tagline)
        document.querySelectorAll('.slide-tag').forEach(el => { el.textContent = tagline; });
    if (!customChrome)
        document.querySelectorAll('.hero-brand').forEach(el => { el.innerHTML = heroLogo; });
    const slides = [...document.querySelectorAll('.slide')];
    slides.forEach((slide, index) => {
        slide.querySelector('.slide-bottom').innerHTML = '<span>nosotrack.com</span><span>' + String(index + 1).padStart(2, '0') + ' / ' + slides.length + '</span>';
    });
    if (!customChrome)
        document.getElementById('kbdHint').textContent = '↓ / Space / → to advance';
    const deck = document.getElementById('deck');
    const hint = document.getElementById('kbdHint');
    // Keep the banners at the viewport edges. Fit only the content between them,
    // using its actual rendered height (including fonts, images and embeds).
    const bodies = slides.map(slide => {
        const body = slide.querySelector('.slide-body');
        const content = document.createElement('div');
        content.className = 'slide-content';
        content.append(...body.childNodes);
        body.append(content);
        return { body, content };
    });
    let fitPending = false;
    function fitSlides() {
        fitPending = false;
        bodies.forEach(({ body, content }) => {
            const style = getComputedStyle(body);
            const room = Math.max(1, body.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom));
            content.style.setProperty('--slide-room', room + 'px');
            const scale = Math.min(1, room / Math.max(content.scrollHeight, content.offsetHeight), content.clientWidth / Math.max(content.scrollWidth, content.offsetWidth));
            content.style.setProperty('--slide-scale', scale);
        });
    }
    function scheduleFit() {
        if (!fitPending) {
            fitPending = true;
            requestAnimationFrame(fitSlides);
        }
    }
    const fitObserver = new ResizeObserver(scheduleFit);
    bodies.forEach(({ body, content }) => { fitObserver.observe(body); fitObserver.observe(content); });
    window.addEventListener('resize', scheduleFit);
    document.fonts.ready.then(scheduleFit);
    fitSlides();
    // Compare visible pixels, not a fraction of the entire slide: tall phone
    // slides can never reach a 55% intersection threshold.
    let pending = false;
    function updateActive() {
        const bounds = deck.getBoundingClientRect();
        let best = -1, next = 0;
        slides.forEach((slide, index) => {
            const r = slide.getBoundingClientRect();
            const visible = Math.max(0, Math.min(r.bottom, bounds.bottom) - Math.max(r.top, bounds.top));
            if (visible > best) {
                best = visible;
                next = index;
            }
        });
        setActive(next);
        pending = false;
    }
    function scheduleActive() {
        if (!pending) {
            pending = true;
            requestAnimationFrame(updateActive);
        }
    }
    deck.addEventListener('scroll', scheduleActive, { passive: true });
    window.addEventListener('resize', scheduleActive);
    const layoutObserver = new ResizeObserver(scheduleActive);
    slides.forEach(slide => layoutObserver.observe(slide));
    function spinBrand(brand) {
        if (brand && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            brand.classList.remove('spin');
            void brand.offsetWidth; // force reflow so the animation restarts
            brand.classList.add('spin');
        }
    }
    function typeTIP(title) {
        if (!title)
            return;
        const spans = Array.prototype.slice.call(title.querySelectorAll('.hw'));
        if (!spans.length)
            return;
        const lines = spans.map(function (s) {
            if (s.dataset.full == null)
                s.dataset.full = s.textContent;
            return s.dataset.full;
        });
        if (title._typeTimers)
            title._typeTimers.forEach(clearTimeout);
        const timers = [];
        title._typeTimers = timers;
        const setLine = function (i, num) {
            spans[i].textContent = num > 0 ? lines[i].slice(0, num) : ' ';
        };
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            spans.forEach(function (s, i) { s.textContent = lines[i]; });
            return;
        }
        const CHAR = 26, STAGGER = 200, HOLD = 550, LINE = 140, START = 420;
        const steps = [];
        lines.forEach(function (line, i) { if (line.length)
            steps.push({ line: i, count: 1 }); });
        let holdDone = false;
        lines.forEach(function (line, i) {
            for (let c = 2; c <= line.length; c++) {
                let delay = CHAR;
                if (c === 2) {
                    delay = holdDone ? LINE : HOLD;
                    holdDone = true;
                }
                steps.push({ line: i, count: c, delay: delay });
            }
        });
        steps.forEach(function (s, i) { if (s.delay == null)
            s.delay = (i === 0 ? START : STAGGER); });
        spans.forEach(function (s, i) { setLine(i, 0); });
        let idx = 0;
        const run = function () {
            const s = steps[idx];
            setLine(s.line, s.count);
            idx += 1;
            if (idx < steps.length)
                timers.push(setTimeout(run, steps[idx].delay));
        };
        if (steps.length)
            timers.push(setTimeout(run, steps[0].delay));
    }
    function prepTitle(el) {
        if (el._prepped)
            return;
        el._prepped = true;
        el._full = el.textContent;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
            return;
        el.textContent = '';
        el._spans = [];
        for (let i = 0; i < el._full.length; i++) {
            const s = document.createElement('span');
            s.textContent = el._full[i];
            s.style.opacity = '0';
            el.appendChild(s);
            el._spans.push(s);
        }
    }
    function typeTitle(el) {
        if (!el || !el._spans)
            return;
        if (el._tt)
            el._tt.forEach(clearTimeout);
        el._tt = [];
        if (el._cursor && el._cursor.parentNode)
            el._cursor.parentNode.removeChild(el._cursor);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            el._spans.forEach(s => { s.style.opacity = '1'; });
            return;
        }
        el._spans.forEach((s) => { s.style.opacity = '0'; });
        const cur = document.createElement('span');
        cur.className = 'typewriter-cursor';
        cur.setAttribute('aria-hidden', 'true');
        el.appendChild(cur);
        el._cursor = cur;
        const STEP = 1000 / 32; // 32 cps, matching the site
        el._spans.forEach((s, i) => {
            el._tt.push(setTimeout(() => {
                s.style.opacity = '1';
                if (cur.parentNode)
                    el.insertBefore(cur, s.nextSibling);
                if (i === el._spans.length - 1) {
                    el._tt.push(setTimeout(() => { if (cur.parentNode)
                        cur.parentNode.removeChild(cur); }, 420));
                }
            }, 260 + i * STEP));
        });
    }
    if (!customChrome)
        slides.forEach((s) => { const t = s.querySelector('.slide-title'); if (t)
            prepTitle(t); });
    let activeIdx = -1;
    function setActive(idx) {
        if (idx === activeIdx || idx < 0 || idx >= slides.length)
            return;
        activeIdx = idx;
        slides.forEach((s, i) => {
            s.classList.toggle('active-slide', i === idx);
        });
        const _st = slides[idx] && slides[idx].querySelector('.slide-title');
        if (_st)
            typeTitle(_st);
        slides[idx].querySelectorAll('.hero-brand').forEach(brand => spinBrand(brand));
        slides[idx].querySelectorAll('.hero-title').forEach(typeTIP);
    }
    function go(idx) {
        if (idx < 0 || idx >= slides.length)
            return;
        slides[idx].scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
    document.addEventListener('keydown', (e) => {
        if (e.defaultPrevented || document.body.classList.contains('has-playbar-fs') ||
            e.target.closest('input,textarea,select,button,a,[contenteditable="true"],[role="slider"]'))
            return;
        const k = e.key;
        // Native vertical scrolling must remain available inside long slides.
        if (slides[activeIdx]?.offsetHeight > deck.clientHeight + 2 &&
            ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(k))
            return;
        if (k === 'ArrowDown' || k === 'ArrowRight' || k === 'PageDown' || k === ' ') {
            e.preventDefault();
            go(activeIdx + 1);
        }
        else if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'PageUp') {
            e.preventDefault();
            go(activeIdx - 1);
        }
        else if (k === 'Home') {
            e.preventDefault();
            go(0);
        }
        else if (k === 'End') {
            e.preventDefault();
            go(slides.length - 1);
        }
        else if (/^[1-9]$/.test(k)) {
            e.preventDefault();
            go(parseInt(k, 10) - 1);
        }
        else if (k === 'f' || k === 'F') {
            e.preventDefault();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.().catch(() => { });
            }
            else {
                document.exitFullscreen?.().catch(() => { });
            }
        }
    });
    // Both embedded website views report their natural height. Never crop them.
    window.addEventListener('message', function (e) {
        const frame = document.querySelector('.adoption-frame');
        if (!frame || e.source !== frame.contentWindow || e.origin !== location.origin ||
            !e.data || e.data.type !== 'nt-embed-height' ||
            !Number.isFinite(e.data.height) || e.data.height <= 0)
            return;
        frame.style.height = e.data.height + 'px';
    });
    setTimeout(() => hint?.classList.add('fade'), 6000);
    deck.classList.add('anim');
    updateActive();
});
