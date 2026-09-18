/* Shared transmission illustration. data-transmission-tree selects hospital or farm semantics. */
document.querySelectorAll('[data-transmission-tree]').forEach((svg, index) => {
    var NS = 'http://www.w3.org/2000/svg';
    var C = { case: '#e61a43', gold: '#f5b301', goldLine: '#b8860b',
        edge: 'rgba(230,26,67,.55)', edgeHi: 'rgba(230,26,67,.9)', mute: '#767676', alert: '#ff073a',
        grey: '#bfbfbe', undet: '#8b5cf6', undetLine: '#6d28d9' };
    var N = {
        n1: { x: 74, y: 180, kind: 'patient', imp: true, label: '1' },
        n2: { x: 198, y: 108, kind: 'patient', label: '2' },
        n3: { x: 198, y: 262, kind: 'staff', label: '3' },
        n4: { x: 332, y: 66, kind: 'patient', label: '4' },
        n5: { x: 332, y: 170, kind: 'super', label: '5' },
        n6: { x: 332, y: 292, kind: 'patient', label: '6' },
        n7: { x: 480, y: 96, kind: 'patient', label: '7' },
        n8: { x: 480, y: 172, kind: 'patient', label: '8' },
        n9: { x: 480, y: 248, kind: 'patient', label: '9' },
        n10: { x: 478, y: 320, kind: 'atrisk', label: '10' }
    };
    if (svg.dataset.transmissionTree === 'farm') {
        Object.values(N).forEach(n => { if (n.kind === 'patient')
            n.kind = 'farm'; });
        N.n3.kind = N.n8.kind = 'building';
    }
    var E = [['n1', 'n2'], ['n1', 'n3'], ['n2', 'n4'], ['n2', 'n5'],
        ['n5', 'n7'], ['n5', 'n8'], ['n5', 'n9'], ['n3', 'n6']];
    var RISK = [['n6', 'n10']];
    var UNDET = [{ x: 238, y: 262, at: 332 }];
    const hierarchical = svg.dataset.transmissionTree === 'farm-hierarchy';
    if (hierarchical) {
        // The lower tree is a closer view of B, not transmission from a farm to a building.
        N = {
            a: { x: 90, y: 64, kind: 'farm', imp: true, label: 'Farm A', at: 0 },
            b: { x: 300, y: 64, kind: 'farm', status: 'super', label: 'Farm B', at: 160 },
            c: { x: 540, y: 64, kind: 'farm', label: 'Farm C', at: 320 },
            b1: { x: 110, y: 245, kind: 'building', label: 'B1', at: 480 },
            b2: { x: 290, y: 210, kind: 'building', label: 'B2', at: 640 },
            b3: { x: 500, y: 195, kind: 'building', label: 'B3', at: 800 },
            b4: { x: 500, y: 280, kind: 'building', status: 'atrisk', label: 'B4', at: 960 }
        };
        E = [['a', 'b'], ['b', 'c'], ['b1', 'b2'], ['b2', 'b3']];
        RISK = [['b2', 'b4']];
        UNDET = [{ x: 165, y: 245, at: 640 }];
    }
    function rOf(k) { return k === 'super' ? 15 : k === 'building' ? 10 : k === 'staff' || k === 'farm' ? 13 : 12; }
    function path(ax, ay, bx, by, r, childR) {
        var dH = bx > ax ? 1 : bx < ax ? -1 : 0, dV = by > ay ? 1 : by < ay ? -1 : 0;
        if (dV === 0) {
            return 'M ' + ax + ' ' + ay + ' L ' + (bx - dH * childR) + ' ' + ay;
        }
        if (dH === 0) {
            return 'M ' + ax + ' ' + ay + ' L ' + ax + ' ' + (by - dV * childR);
        }
        var mx = (ax + bx) / 2, ex = bx - dH * childR;
        if (Math.abs(mx - ax) < r * 1.5 || Math.abs(bx - mx) < r * 1.5 || Math.abs(by - ay) < r * 2) {
            return 'M ' + ax + ' ' + ay + ' L ' + mx + ' ' + ay + ' L ' + mx + ' ' + by + ' L ' + ex + ' ' + by;
        }
        return 'M ' + ax + ' ' + ay + ' L ' + (mx - r * dH) + ' ' + ay + ' Q ' + mx + ' ' + ay + ', ' + mx + ' ' + (ay + r * dV) +
            ' L ' + mx + ' ' + (by - r * dV) + ' Q ' + mx + ' ' + by + ', ' + (mx + r * dH) + ' ' + by + ' L ' + ex + ' ' + by;
    }
    function el(tag, attrs) { var e = document.createElementNS(NS, tag); for (var k in attrs)
        e.setAttribute(k, attrs[k]); return e; }
    const markerId = name => `tree-${index}-${name}`;
    var defs = el('defs', {});
    [['ttHead', C.edge], ['ttHeadHi', C.edgeHi], ['ttHeadR', C.alert]].forEach(function (m) {
        var mk = el('marker', { id: markerId(m[0]), viewBox: '0 0 10 10', refX: '8.5', refY: '5', markerWidth: '7', markerHeight: '7', orient: 'auto' });
        mk.appendChild(el('path', { d: 'M0 0 L10 5 L0 10 z', fill: m[1] }));
        defs.appendChild(mk);
    });
    svg.appendChild(defs);
    if (hierarchical) {
        svg.appendChild(el('path', { d: 'M300 101V133', fill: 'none', stroke: C.grey, 'stroke-width': '1' }));
        svg.appendChild(el('rect', { x: 52, y: 133, width: 548, height: 203, rx: 9,
            fill: 'none', stroke: C.grey, 'stroke-width': '1' }));
        [['BETWEEN FARMS', 90, 22], ['WITHIN FARM B · BUILDINGS', 74, 158]].forEach(([label, x, y]) => {
            const text = el('text', { x, y, fill: C.mute, 'font-family': 'var(--mono)', 'font-size': '11', 'letter-spacing': '1' });
            text.textContent = label;
            svg.appendChild(text);
        });
    }
    var edges = E.map(function (e) {
        var a = N[e[0]], b = N[e[1]];
        var d = path(a.x, a.y, b.x, b.y, 7, rOf(b.kind) + 3);
        var p = el('path', { d: d, fill: 'none', stroke: C.edge, 'stroke-width': '2.2',
            'stroke-linecap': 'round', pathLength: '1', 'stroke-dasharray': '1', 'stroke-dashoffset': '1' });
        svg.appendChild(p);
        return { p: p, childX: b.at ?? b.x };
    });
    var riskEdges = RISK.map(function (e) {
        var a = N[e[0]], b = N[e[1]];
        var d = path(a.x, a.y, b.x, b.y, 7, rOf(b.kind) + 6);
        var p = el('path', { d: d, fill: 'none', stroke: C.alert, 'stroke-width': '1.5',
            'stroke-dasharray': '4 3', opacity: '0', 'marker-end': `url(#${markerId("ttHeadR")})` });
        svg.appendChild(p);
        return { p: p, childX: b.at ?? b.x };
    });
    var undets = UNDET.map(function (u) {
        var c = el('circle', { cx: u.x, cy: u.y, r: '6', fill: C.undet, stroke: C.undetLine, 'stroke-width': '1', opacity: '0' });
        svg.appendChild(c);
        return { c: c, at: u.at };
    });
    var nodes = Object.keys(N).map(function (id) {
        var n = N[id], r = rOf(n.kind);
        var status = n.status || n.kind;
        var g = el('g', { transform: 'translate(' + n.x + ',' + n.y + ')', opacity: '0' });
        if (status === 'super') {
            var halo = el('circle', { r: r + 6, fill: 'none', stroke: C.gold, 'stroke-width': '1', opacity: '.55' });
            halo.appendChild(el('animate', { attributeName: 'r', values: (r + 4) + ';' + (r + 9) + ';' + (r + 4), dur: '1.8s', repeatCount: 'indefinite' }));
            halo.appendChild(el('animate', { attributeName: 'opacity', values: '.6;0;.6', dur: '1.8s', repeatCount: 'indefinite' }));
            g.appendChild(halo);
        }
        if (n.imp)
            g.appendChild(el('circle', { r: r + 5, fill: 'none', stroke: C.alert, 'stroke-width': '2' }));
        if (status === 'atrisk')
            g.appendChild(el('circle', { r: r + 4, fill: 'none', stroke: C.alert, 'stroke-width': '1.5', 'stroke-dasharray': '3 3' }));
        if (n.kind === 'building') {
            g.appendChild(el('polygon', { points: `0,${-r} ${r},${r * .8} ${-r},${r * .8}`, fill: status === 'atrisk' ? C.grey : C.case, stroke: C.mute, 'stroke-width': '1' }));
        }
        else if (n.kind === 'staff') {
            g.appendChild(el('polygon', { points: '0,' + (-r) + ' ' + r + ',0 0,' + r + ' ' + (-r) + ',0', fill: C.case, stroke: C.mute, 'stroke-width': '1' }));
        }
        else {
            g.appendChild(el('circle', { r: r, fill: status === 'super' ? C.gold : status === 'atrisk' ? C.grey : C.case, stroke: status === 'super' ? C.goldLine : C.mute, 'stroke-width': '1' }));
        }
        var t = el('text', { x: '0', y: r + 15, class: 'tt-lbl' });
        t.textContent = n.label;
        g.appendChild(t);
        svg.appendChild(g);
        return { g: g, x: n.at ?? n.x };
    });
    var xs = nodes.map(function (o) { return o.x; });
    var xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
    var SPREAD = 0.82, NODE_WIN = 0.12, EDGE_WIN = 0.18, EDGE_LEAD = 0.06, DUR = 2400;
    var clamp01 = function (n) { return n < 0 ? 0 : n > 1 ? 1 : n; };
    var appearAt = function (x) { return (xMax > xMin ? (x - xMin) / (xMax - xMin) : 0) * SPREAD; };
    function render(prog) {
        nodes.forEach(function (o) { o.g.setAttribute('opacity', clamp01((prog - appearAt(o.x)) / NODE_WIN)); });
        edges.forEach(function (o) {
            var rev = clamp01((prog - Math.max(0, appearAt(o.childX) - EDGE_LEAD)) / EDGE_WIN);
            o.p.setAttribute('stroke-dashoffset', 1 - rev);
            if (rev > 0.92) {
                o.p.setAttribute('stroke', C.edgeHi);
                o.p.setAttribute('marker-end', `url(#${markerId("ttHeadHi")})`);
            }
            else {
                o.p.setAttribute('stroke', C.edge);
                o.p.removeAttribute('marker-end');
            }
        });
        undets.forEach(function (o) { o.c.setAttribute('opacity', clamp01((prog - Math.max(0, appearAt(o.at) - EDGE_LEAD)) / EDGE_WIN)); });
        riskEdges.forEach(function (o) { o.p.setAttribute('opacity', 0.85 * clamp01((prog - appearAt(o.childX)) / EDGE_WIN)); });
    }
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
        render(1);
        return;
    }
    var raf = 0;
    function play() {
        cancelAnimationFrame(raf);
        var start = null;
        (function tick(now) {
            if (start === null)
                start = now;
            var prog = Math.min(1, (now - start) / DUR);
            render(prog);
            if (prog < 1)
                raf = requestAnimationFrame(tick);
        })(performance.now());
    }
    render(0);
    window.observeSlideAnimation(svg, play, function () {
        cancelAnimationFrame(raf);
        render(0);
    });
});
