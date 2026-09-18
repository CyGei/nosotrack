/* Slide 2 — outbreak "cumulative rise" curve. */
(function () {
    var wrap = document.getElementById('ocWrap');
    var svg = document.getElementById('ocSvg');
    if (!wrap || !svg)
        return;
    // [disease, place, YYYY-MM] — WHO Disease Outbreak News, 2025→2026.
    var D = [
        ['Marburg', 'Tanzania', '2025-01'], ['Ebola', 'Uganda', '2025-02'], ['Measles', 'United States', '2025-03'],
        ['Meningococcal', 'Saudi Arabia', '2025-04'], ['Measles', 'Morocco', '2025-05'], ['MERS', 'Saudi Arabia', '2025-05'],
        ['Polio', 'Papua New Guinea', '2025-05'], ['Nipah', 'India', '2025-08'], ['Ebola', 'DR Congo', '2025-09'],
        ['Marburg', 'Ethiopia', '2025-11'], ['Diphtheria', 'Africa', '2025-11'], ['Mpox', 'Global', '2025-12'],
        ['Measles', 'Bangladesh', '2026-04'], ['Ebola', 'DR Congo & Uganda', '2026-05'], ['Hantavirus', 'Cruise ship', '2026-06']
    ];
    // Left-hand labels hang off the plot by their own text width, so on a phone
    // the curve has to start further in or the longest name ("Meningococcal")
    // runs off the screen. The rise, not the horizontal span, is the message.
    var narrow = wrap.clientWidth > 0 && wrap.clientWidth < 420;
    var X0 = narrow ? 38 : 12, X1 = 75, Y_TOP = 10, Y_BOT = 80, Y_AXIS = 87, QX = 88, QY = 3, MIN_DX = 2;
    var MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function mi(d) { var p = d.split('-'); return (parseInt(p[0], 10) - 2025) * 12 + (parseInt(p[1], 10) - 1); }
    function shortPlace(c) { return c.indexOf(' & ') >= 0 ? c.split(' & ')[0] + ' +' : c; }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    var ord = D.slice().sort(function (a, b) { return mi(a[2]) - mi(b[2]); });
    var n = ord.length;
    var mis = ord.map(function (o) { return mi(o[2]); });
    var minMI = Math.min.apply(null, mis), maxMI = Math.max.apply(null, mis);
    var rawX = mis.map(function (m) { return X0 + ((m - minMI) / (maxMI - minMI)) * (X1 - X0); });
    var pts = [], prevX = -1e9;
    for (var i = 0; i < n; i++) {
        var x = Math.max(rawX[i], prevX + MIN_DX);
        prevX = x;
        pts.push({ x: x, y: Y_BOT - (i / (n - 1)) * (Y_BOT - Y_TOP) });
    }
    var sides = [];
    for (var i = 0; i < n; i++) {
        if (i === 0) {
            sides.push(false);
            continue;
        }
        var crowded = pts[i].x - pts[i - 1].x < 9;
        sides.push(crowded ? !sides[i - 1] : pts[i].x >= (X0 + X1) / 2);
    }
    var LABEL_GAP = 8.6, REACH = 12, labelY = {}, placed = [];
    var byY = [];
    for (var i = 0; i < n; i++)
        byY.push(i);
    byY.sort(function (a, b) { return pts[a].y - pts[b].y; });
    byY.forEach(function (i) {
        var px = pts[i].x, x0 = sides[i] ? px - REACH : px, x1 = sides[i] ? px : px + REACH, y = pts[i].y;
        for (var pass = 0; pass < placed.length + 2; pass++) {
            var bumped = false;
            for (var k = 0; k < placed.length; k++) {
                var p = placed[k];
                if (x1 > p.x0 && x0 < p.x1 && y < p.y + LABEL_GAP && y > p.y - LABEL_GAP) {
                    y = p.y + LABEL_GAP;
                    bumped = true;
                }
            }
            if (!bumped)
                break;
        }
        labelY[i] = y;
        placed.push({ x0: x0, x1: x1, y: y });
    });
    var LINE_CLEAR = 4;
    for (var i = 0; i < n; i++)
        labelY[i] += sides[i] ? -LINE_CLEAR : LINE_CLEAR;
    var lys = [];
    for (var i = 0; i < n; i++)
        lys.push(labelY[i]);
    var over = Math.max.apply(null, lys) - (Y_AXIS - 3);
    if (over > 0) {
        for (var i = 0; i < n; i++)
            labelY[i] -= over;
    }
    lys = [];
    for (var i = 0; i < n; i++)
        lys.push(labelY[i]);
    var under = 2 - Math.min.apply(null, lys);
    if (under > 0) {
        for (var i = 0; i < n; i++)
            labelY[i] += under;
    }
    function smooth(ps) {
        if (ps.length < 2)
            return ps.length ? ('M ' + ps[0].x + ' ' + ps[0].y) : '';
        var d = 'M ' + ps[0].x.toFixed(2) + ' ' + ps[0].y.toFixed(2);
        for (var i = 0; i < ps.length - 1; i++) {
            var p0 = ps[i - 1] || ps[i], p1 = ps[i], p2 = ps[i + 1], p3 = ps[i + 2] || p2;
            var lo = Math.min(p1.y, p2.y), hi = Math.max(p1.y, p2.y);
            var c1x = p1.x + (p2.x - p0.x) / 6, c1y = clamp(p1.y + (p2.y - p0.y) / 6, lo, hi);
            var c2x = p2.x - (p3.x - p1.x) / 6, c2y = clamp(p2.y - (p3.y - p1.y) / 6, lo, hi);
            d += ' C ' + c1x.toFixed(2) + ' ' + c1y.toFixed(2) + ' ' + c2x.toFixed(2) + ' ' + c2y.toFixed(2) + ' ' + p2.x.toFixed(2) + ' ' + p2.y.toFixed(2);
        }
        return d;
    }
    var linePath = smooth(pts);
    var areaPath = linePath + ' L ' + pts[n - 1].x.toFixed(2) + ' ' + Y_AXIS + ' L ' + pts[0].x.toFixed(2) + ' ' + Y_AXIS + ' Z';
    var a = pts[n - 2], b = pts[n - 1], len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    var f1x = b.x + ((b.x - a.x) / len) * 9, f1y = b.y + ((b.y - a.y) / len) * 9, f2x = QX - (QX - b.x) * 0.45, f2y = QY + (b.y - QY) * 0.35;
    var futurePath = 'M ' + b.x.toFixed(2) + ' ' + b.y.toFixed(2) + ' C ' + f1x.toFixed(2) + ' ' + f1y.toFixed(2) + ' ' + f2x.toFixed(2) + ' ' + f2y.toFixed(2) + ' ' + QX + ' ' + QY;
    function monthX(m) { return X0 + ((m - minMI) / (maxMI - minMI)) * (X1 - X0); }
    var boundaryX = clamp(monthX(12), X0, X1);
    // Fewer ticks when the plot is inset — four of them run together at this span.
    var marks = (narrow ? [6, 15] : [3, 6, 9, 15]).filter(function (m) { return m > minMI && m < maxMI; }).map(function (m) { return { x: monthX(m), label: MONTH[m % 12] }; });
    var y25 = (X0 + boundaryX) / 2, y26 = (boundaryX + X1) / 2;
    svg.innerHTML =
        '<defs>' +
            '<linearGradient id="ocFill" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="var(--ink)" stop-opacity="0.10"/>' +
            '<stop offset="100%" stop-color="var(--ink)" stop-opacity="0"/>' +
            '</linearGradient>' +
            '<clipPath id="ocReveal"><rect id="ocClip" x="0" y="0" width="0" height="100"/></clipPath>' +
            '</defs>' +
            '<line x1="' + pts[0].x + '" y1="' + Y_AXIS + '" x2="' + QX + '" y2="' + Y_AXIS + '" stroke="var(--rule-strong)" stroke-width="1.25" vector-effect="non-scaling-stroke"/>' +
            '<g clip-path="url(#ocReveal)">' +
            '<path d="' + areaPath + '" fill="url(#ocFill)"/>' +
            '<path d="' + linePath + '" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>' +
            '<path d="' + futurePath + '" fill="none" stroke="var(--ink)" stroke-width="1.5" stroke-dasharray="0.6 3" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
            '</g>';
    var html = '';
    for (var i = 0; i < n; i++) {
        var p = pts[i], left = sides[i], ly = labelY[i];
        html += '<div class="oc-node" style="transition-delay:' + Math.round((p.x / 100) * 900) + 'ms">'
            + '<div class="oc-label ' + (left ? 'oc-left' : 'oc-right') + '" style="left:' + p.x + '%;top:' + ly + '%">'
            + '<span class="oc-dis">' + ord[i][0] + '</span><span class="oc-place">' + shortPlace(ord[i][1]) + '</span>'
            + '</div>'
            + '<span class="oc-dot" style="left:' + p.x + '%;top:' + p.y + '%"></span>'
            + '</div>';
    }
    html += '<span class="oc-q" style="left:' + QX + '%;top:' + QY + '%">?</span>';
    html += '<span class="oc-div" style="left:' + boundaryX + '%;top:' + Y_AXIS + '%"></span>';
    marks.forEach(function (m) { html += '<span class="oc-month" style="left:' + m.x + '%;top:calc(' + Y_AXIS + '% + 11px)">' + m.label + '</span>'; });
    html += '<span class="oc-year dim" style="left:' + y25 + '%;top:calc(' + Y_AXIS + '% + 30px)">2025</span>';
    html += '<span class="oc-year" style="left:' + y26 + '%;top:calc(' + Y_AXIS + '% + 30px)">2026</span>';
    var overlay = document.createElement('div');
    overlay.className = 'oc-overlay';
    overlay.innerHTML = html;
    wrap.appendChild(overlay);
    var clip = document.getElementById('ocClip');
    window.observeSlideAnimation(wrap, function () {
        wrap.classList.add('revealed');
        clip.style.width = '100px';
    }, function () {
        wrap.classList.remove('revealed');
        clip.style.width = '0px';
    });
})();
/* Slide 3 — penalty bars. */
(function () {
    var chart = document.getElementById('penChart');
    var s3 = chart?.closest('.slide');
    if (!chart || !s3)
        return;
    var bars = Array.prototype.slice.call(chart.querySelectorAll('.pen-bar'));
    var vals = Array.prototype.slice.call(chart.querySelectorAll('.pen-val'));
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var timers = [], frames = [];
    function clearTimers() {
        timers.forEach(clearTimeout); timers = [];
        frames.forEach(cancelAnimationFrame); frames = [];
    }
    function play() {
        clearTimers();
        bars.forEach(function (b, i) {
            var w = b.getAttribute('data-w') + '%';
            if (reduce) {
                b.style.width = w;
                return;
            }
            timers.push(setTimeout(function () { b.style.width = w; }, i * 80));
        });
        vals.forEach(function (el, i) {
            var target = parseFloat(el.getAttribute('data-val'));
            if (reduce) {
                el.textContent = '$' + target.toFixed(2) + 'M';
                return;
            }
            timers.push(setTimeout(function () {
                var start = null, dur = 1000;
                function step(ts) {
                    if (start === null)
                        start = ts;
                    var p = Math.min(1, (ts - start) / dur);
                    var e = 1 - Math.pow(1 - p, 3);
                    el.textContent = '$' + (target * e).toFixed(2) + 'M';
                    if (p < 1)
                        frames.push(requestAnimationFrame(step));
                }
                frames.push(requestAnimationFrame(step));
            }, i * 80));
        });
    }
    function reset() {
        clearTimers();
        bars.forEach(function (b) { b.style.width = '0'; });
        vals.forEach(function (el) { el.textContent = '$0.00M'; });
    }
    window.observeSlideAnimation(chart, play, reset);
})();
/* Slide 4 — containment donut. */
(function () {
    var chart = document.getElementById('costChart'), s4 = chart?.closest('.slide');
    if (!chart || !s4)
        return;
    var segs = Array.prototype.slice.call(chart.querySelectorAll('.dn-seg'));
    var labels = chart.querySelector('.dn-labels');
    var C = 942.48, reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches, timers = [];
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function play() {
        clearTimers();
        segs.forEach(function (el, i) {
            var o = el.getAttribute('data-o');
            if (reduce) {
                el.style.strokeDashoffset = o;
                return;
            }
            timers.push(setTimeout(function () { el.style.strokeDashoffset = o; }, 80 + i * 105));
        });
        if (labels)
            labels.style.opacity = '1';
    }
    function reset() {
        clearTimers();
        segs.forEach(function (el) { el.style.strokeDashoffset = C; });
        if (labels)
            labels.style.opacity = '0';
    }
    window.observeSlideAnimation(chart, play, reset);
})();
