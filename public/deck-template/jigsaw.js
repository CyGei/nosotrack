/* Slide 4 — fragmented evidence. */
(function () {
  var svg = document.getElementById('pzSvg');
  if (!svg) return;
  const labels = name => svg.dataset[name].split('|');

  var CX = 282, CY = 273, R = 228;
  var G = 76, OX = -8, OY = 6;               // centre piece half-width, and its offset off dead centre
  var K = 13, NECK = 11, CR = 9, FR = 4;     // seam knob lobe / neck / corner fillet / neck fillet
  var CK = 17, CNECK = 15, CFR = 5;          // corona knob: the puzzle tab doubles as the spike protein
  var NS = 'http://www.w3.org/2000/svg';
  var UP = [0, -1], DOWN = [0, 1], LEFT = [-1, 0], RIGHT = [1, 0];
  var DEG = 180 / Math.PI;

  var ICONS = {
    route: '<path d="M3.6 19.4c2.9 0 3.4-2.9 6.1-2.9 2.5 0 3-2.3 5.4-2.3" stroke-dasharray="2.6 2.8"/>' +
           '<circle cx="3.6" cy="19.4" r="1.5"/>' +
           '<path d="M17.4 3.4a3.8 3.8 0 0 0-3.8 3.8c0 2.8 3.8 6.7 3.8 6.7s3.8-3.9 3.8-6.7a3.8 3.8 0 0 0-3.8-3.8z"/>' +
           '<circle cx="17.4" cy="7.2" r="1.3"/>',
    paper: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6"/>',
    ehr:   '<rect x="3" y="4.5" width="18" height="15" rx="2"/>' +
           '<path d="M3 12h4l1.8-3.4 2.6 6.8 1.8-3.4H21"/>',
    dna:   '<path d="M6.8 3c0 4.6 10.4 5.6 10.4 9.9s-10.4 5.3-10.4 9.1"/>' +
           '<path d="M17.2 3c0 4.6-10.4 5.6-10.4 9.9s10.4 5.3 10.4 9.1"/>' +
           '<path d="M8.6 6.6h6.8M6.9 11.2h10.2M8.6 17.6h6.8"/>',
    prox:  '<circle cx="7.4" cy="10.2" r="2.8"/><path d="M3.4 18.8a4 4 0 0 1 8 0"/>' +
           '<circle cx="16.6" cy="10.2" r="2.8"/><path d="M12.6 18.8a4 4 0 0 1 8 0"/>' +
           '<path d="M9.7 5.2a7.4 7.4 0 0 1 4.6 0" stroke-dasharray="1.8 2"/>'
  };

  function f(n) { return Math.round(n * 100) / 100; }
  function el(tag, attrs, html) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function P(x, y) { return [CX + x, CY + y]; }
  function A(deg) { var t = deg / DEG; return P(R * Math.cos(t), R * Math.sin(t)); }
  function ang(x, y) { return Math.atan2(y, x) * DEG; }
  function pstr(p) { return f(p[0]) + ' ' + f(p[1]); }
  function onRim(v) { return Math.sqrt(R * R - v * v); }

  function lobe(m, u, bulge, sweep, k, neck, fr) {
    var half = neck / 2, h = Math.sqrt(k * k - half * half), sgn = sweep ? 1 : -1;
    var o = [m[0] + bulge[0] * h, m[1] + bulge[1] * h];
    var b1 = [m[0] - u[0] * half, m[1] - u[1] * half], b2 = [m[0] + u[0] * half, m[1] + u[1] * half];
    var d = fr / k;
    var a1 = Math.atan2(b1[1] - o[1], b1[0] - o[0]) + sgn * d;
    var a2 = Math.atan2(b2[1] - o[1], b2[0] - o[0]) - sgn * d;
    return 'L ' + pstr([b1[0] - u[0] * fr, b1[1] - u[1] * fr]) +
           ' Q ' + pstr(b1) + ' ' + pstr([o[0] + k * Math.cos(a1), o[1] + k * Math.sin(a1)]) +
           ' A ' + f(k) + ' ' + f(k) + ' 0 1 ' + sweep + ' ' + pstr([o[0] + k * Math.cos(a2), o[1] + k * Math.sin(a2)]) +
           ' Q ' + pstr(b2) + ' ' + pstr([b2[0] + u[0] * fr, b2[1] + u[1] * fr]);
  }

  function C(a, b, bulge, pos) { return { k: 'c', a: a, b: b, g: bulge, t: pos }; }
  function RV(c) { return { k: c.k, a: c.b, b: c.a, g: c.g, t: c.t }; }
  function Rim(d0, d1) { return { k: 'r', d0: d0, d1: d1 }; }
  function lex(a, b) { return a[0] > b[0] || (a[0] === b[0] && a[1] > b[1]); }
  /* A piece spanning only part of a cut still has to put that cut's knob where the piece on
     the far side expects it, so measure the knob on the parent and re-express it on the slice.
     A slice that misses the knob is a plain line ('l'). */
  function sub(c, t0, t1) {
    var dx = c.b[0] - c.a[0], dy = c.b[1] - c.a[1];
    var tk = lex(c.a, c.b) ? 1 - c.t : c.t;
    var a = [c.a[0] + dx * t0, c.a[1] + dy * t0], b = [c.a[0] + dx * t1, c.a[1] + dy * t1];
    if (tk <= t0 || tk >= t1) return { k: 'l', a: a, b: b };
    var ts = (tk - t0) / (t1 - t0);
    return { k: 'c', a: a, b: b, g: c.g, t: lex(a, b) ? 1 - ts : ts };
  }

  function cutBody(s, to) {
    var dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], L = Math.hypot(dx, dy);
    var u = [dx / L, dy / L];
    var sweep = (s.g[0] * -u[1] + s.g[1] * u[0]) > 0 ? 0 : 1;
    /* Measure from the lexicographically smaller end so both pieces sharing this cut put
       the knob in the same place whichever way each of them traces it. */
    var t = lex(s.a, s.b) ? 1 - s.t : s.t;
    return lobe([s.a[0] + u[0] * L * t, s.a[1] + u[1] * L * t], u, s.g, sweep, K, NECK, FR) + ' L ' + pstr(to);
  }
  function rimBody(d0, d1) {
    var kd = (d0 + d1) / 2;
    var sc = 0.88 + 0.26 * (Math.abs(Math.round(kd * 13)) % 100) / 100;
    var w = ((CNECK * sc / 2 + CFR * sc) / R) * DEG, t = kd / DEG;
    return ' A ' + R + ' ' + R + ' 0 0 1 ' + pstr(A(kd - w)) +
           lobe(A(kd), [-Math.sin(t), Math.cos(t)], [Math.cos(t), Math.sin(t)], 1,
                CK * sc, CNECK * sc, CFR * sc) +
           ' A ' + R + ' ' + R + ' 0 0 1 ' + pstr(A(d1));
  }

  function build(segs) {
    var trim = (CR / R) * DEG;
    var e = segs.map(function (s) {
      if (s.k !== 'r') {
        var dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], L = Math.hypot(dx, dy);
        var u = [dx / L, dy / L];
        return { s: s, corner: s.b,
                 p0: [s.a[0] + u[0] * CR, s.a[1] + u[1] * CR],
                 p1: [s.b[0] - u[0] * CR, s.b[1] - u[1] * CR] };
      }
      return { s: s, corner: A(s.d1), d0: s.d0 + trim, d1: s.d1 - trim,
               p0: A(s.d0 + trim), p1: A(s.d1 - trim) };
    });
    var p = 'M ' + pstr(e[0].p0);
    e.forEach(function (o, i) {
      p += o.s.k === 'r' ? rimBody(o.d0, o.d1)
         : o.s.k === 'l' ? ' L ' + pstr(o.p1) : cutBody(o.s, o.p1);
      p += ' Q ' + pstr(o.corner) + ' ' + pstr(e[(i + 1) % e.length].p0);
    });
    return p + ' Z';
  }

  var XL = -G + OX, XR = G + OX, YU = -G + OY, YD = G + OY;
  var xlT = -onRim(XL), xlB = onRim(XL), xrT = -onRim(XR), xrB = onRim(XR);
  var yuL = -onRim(YU), yuR = onRim(YU), ydL = -onRim(YD), ydR = onRim(YD);

  var aTL = ang(XL, xlT), aTR = ang(XR, xrT), aRT = ang(yuR, YU), aRB = ang(ydR, YD);
  var aBR = ang(XR, xrB), aBL = ang(XL, xlB), aLB = ang(ydL, YD), aLT = ang(yuL, YU) + 360;

  var v1 = C(P(XL, xlT), P(XL, YU), RIGHT, 0.38), v4 = C(P(XR, xrT), P(XR, YU), LEFT, 0.63);
  var v3 = C(P(XL, YD), P(XL, xlB), RIGHT, 0.60), v6 = C(P(XR, YD), P(XR, xrB), LEFT, 0.37);
  var h1 = C(P(yuL, YU), P(XL, YU), DOWN, 0.40),  h3 = C(P(XR, YU), P(yuR, YU), DOWN, 0.62);
  var h4 = C(P(ydL, YD), P(XL, YD), UP, 0.63),    h6 = C(P(XR, YD), P(ydR, YD), UP, 0.39);
  /* The centre's diagonal seam lands partway down these two, so their knobs sit clear of where
     it cuts (see s2/s5) — a lobe crossing the split would be sheared in half — and one ends up
     on each half. */
  var v2 = C(P(XL, YU), P(XL, YD), LEFT, 0.56),   v5 = C(P(XR, YU), P(XR, YD), RIGHT, 0.42);
  var h2 = C(P(XL, YU), P(XR, YU), UP, 0.55),     h5 = C(P(XL, YD), P(XR, YD), DOWN, 0.44);

  var PIECES = [
    { key: 'tm', land:  700, from: [ -50, -400], rot:  5, dim: 1, segs: [Rim(aTL, aTR), v4, RV(h2), RV(v1)] },
    { key: 'mr', land:  850, from: [ 420,  -40], rot: -5, dim: 1, segs: [Rim(aRT, aRB), RV(h6), RV(v5), h3] },
    { key: 'bm', land: 1000, from: [  50,  400], rot: -4, dim: 1, segs: [Rim(aBR, aBL), RV(v3), h5, v6] },
    { key: 'ml', land: 1150, from: [-420,   40], rot:  6, dim: 1, segs: [Rim(aLB, aLT), h1, v2, RV(h4)] },

    { key: 'tl', land: 1750, from: [-250, -320], rot: -8, icon: 'route', lines: labels('movements'),
      segs: [Rim(aLT - 360, aTL), v1, RV(h1)] },
    { key: 'tr', land: 2270, from: [ 260, -310], rot:  7, icon: 'dna', lines: labels('genomics'),
      segs: [Rim(aTR, aRT), RV(h3), RV(v4)] },
    { key: 'br', land: 2790, from: [ 270,  310], rot:  6, icon: svg.dataset.contactsIcon || 'prox', lines: labels('contacts'),
      segs: [Rim(aRB, aBR), RV(v6), h6] },
    { key: 'bl', land: 3310, from: [-260,  320], rot: -6, icon: svg.dataset.recordsIcon || 'ehr', lines: labels('records'),
      segs: [Rim(aBL, aLB), h4, v3] }
  ];
  var VOID = build([h2, v5, RV(h5), RV(v2)]);          // the hole stays the whole square

  /* The centre arrives as two interlocking halves cut by a diagonal seam. It runs edge to edge
     rather than corner to corner: corner-to-corner leaves triangles too tight to hold the
     questions — the widest line is 108 units and the narrow end of such a triangle gives it
     barely 42 to sit in. The knob sits at t=0.75, out where neither question reaches. */
  var SY0 = -20, SY1 = 32;                             // where the seam meets the left/right edges
  var s2 = (SY0 - YU) / (YD - YU), s5 = (SY1 - YU) / (YD - YU);
  var sv = [XR - XL, SY1 - SY0], sl = Math.hypot(sv[0], sv[1]);
  var dg = C(P(XL, SY0), P(XR, SY1), [sv[1] / sl, -sv[0] / sl], 0.75);   // normal points into the upper half
  /* Each half's text is nudged towards its own wide end, which sets it along the seam. */
  var HALVES = [
    { land: 4300, from: [ 90, -330], rot:  20, tx:   6, ty: -40, lines: labels('source'),
      segs: [h2, sub(v5, 0, s5), RV(dg), RV(sub(v2, 0, s2))] },
    { land: 5700, from: [-80,  340], rot: -16, tx: -22, ty:  37, lines: labels('risk'),
      segs: [dg, sub(v5, s5, 1), RV(h5), RV(sub(v2, s2, 1))] }
  ];

  var LW = 78, LH_ = 66;
  function labelPos(x0, x1, y0, y1) {
    var cx = Math.max(x0 + LW / 2 + 9, Math.min(x1 - LW / 2 - 9, (x0 + x1) / 2));
    var cy = Math.max(y0 + LH_ / 2 + 9, Math.min(y1 - LH_ / 2 - 9, (y0 + y1) / 2));
    var sx = cx < 0 ? -1 : 1, sy = cy < 0 ? -1 : 1;
    for (var i = 0; i < 80; i++) {
      if (Math.hypot(cx + sx * LW / 2, cy + sy * LH_ / 2) <= R - 7) break;
      var nx = Math.max(x0 + LW / 2 + 8, Math.min(x1 - LW / 2 - 8, cx - sx * 1.5));
      var ny = Math.max(y0 + LH_ / 2 + 8, Math.min(y1 - LH_ / 2 - 8, cy - sy * 1.5));
      if (nx === cx && ny === cy) break;
      cx = nx; cy = ny;
    }
    return [cx, cy];
  }
  var LAB = { tl: labelPos(yuL, XL, xlT, YU), tr: labelPos(XR, yuR, xrT, YU),
              br: labelPos(XR, ydR, YD, xrB), bl: labelPos(ydL, XL, YD, xlB) };

  var BRAND =
    '<path d="M3 8 L3 3 L8 3" stroke-width="1.1"/><path d="M24 3 L29 3 L29 8" stroke-width="1.1"/>' +
    '<path d="M29 24 L29 29 L24 29" stroke-width="1.1"/><path d="M8 29 L3 29 L3 24" stroke-width="1.1"/>' +
    '<g class="pz-brand-net">' +
      '<line x1="16" y1="11.2" x2="16" y2="15.6" stroke-width="0.55"/>' +
      '<line x1="11.31" y1="19.3" x2="15.13" y2="17.1" stroke-width="0.55"/>' +
      '<line x1="20.69" y1="19.3" x2="16.87" y2="17.1" stroke-width="0.55"/>' +
      '<circle cx="16" cy="9" r="2.2" stroke-width="0.35"/>' +
      '<circle cx="9.4" cy="20.4" r="2.2" stroke-width="0.35"/>' +
      '<circle cx="22.6" cy="20.4" r="2.2" stroke-width="0.35"/>' +
      '<circle cx="16" cy="16.6" r="1.05" fill="#ff073a" stroke="none"/>' +
    '</g>';

  var defs = el('defs');
  defs.innerHTML =
    '<filter id="pzHole" x="-30%" y="-30%" width="160%" height="160%">' +
      '<feOffset dx="0" dy="1.5"/><feGaussianBlur stdDeviation="3.5" result="o"/>' +
      '<feComposite operator="out" in="SourceGraphic" in2="o" result="i"/>' +
      '<feFlood flood-color="#1e1e2b" flood-opacity="0.38"/>' +
      '<feComposite operator="in" in2="i"/><feComposite operator="in" in2="SourceGraphic"/>' +
    '</filter>';
  var gShape = el('g'), gVoid = el('g'), gCentre = el('g'), gLabel = el('g'), gAsk = el('g');
  svg.appendChild(defs);
  [gShape, gVoid, gCentre, gLabel, gAsk].forEach(function (l) { svg.appendChild(l); });

  var pieceG = PIECES.map(function (pc) {
    var gg = el('g', { class: 'pz-piece' });
    gg.appendChild(el('path', { class: 'pz-shape', d: build(pc.segs) }));
    gShape.appendChild(gg);
    return gg;
  });

  var labelG = {};
  PIECES.filter(function (p) { return p.icon; }).forEach(function (pc) {
    var c = P(LAB[pc.key][0], LAB[pc.key][1]), gg = el('g'), IS = 24, LH = 17.5;
    var H = IS + 8 + LH * pc.lines.length, top = c[1] - H / 2;
    var ic = el('g', { class: 'pz-icon', transform: 'translate(' + f(c[0] - IS / 2) + ' ' + f(top) + ') scale(' + f(IS / 24) + ')' });
    ic.innerHTML = ICONS[pc.icon];
    gg.appendChild(ic);
    pc.lines.forEach(function (ln, i) {
      gg.appendChild(el('text', { class: 'pz-lbl', x: f(c[0]), y: f(top + IS + 8 + LH * (i + 0.78)) }, ln));
    });
    gLabel.appendChild(gg);
    labelG[pc.key] = gg;
  });

  var voidEl = el('path', { class: 'pz-void', d: VOID, filter: 'url(#pzHole)', opacity: 0 });
  gVoid.appendChild(voidEl);

  /* The mark turns in the empty hole first, then clears out as the two halves fly in. */
  var BS = 50, ALH = 22, bc = P(OX, OY);
  var brandG = el('g', { class: 'pz-brand', opacity: 0, transform: 'translate(' + f(bc[0] - BS / 2) + ' ' + f(bc[1] - BS / 2) + ') scale(' + f(BS / 32) + ')' });
  brandG.innerHTML = BRAND;
  gCentre.appendChild(brandG);
  var brandNet = brandG.querySelector('.pz-brand-net');

  var halfG = HALVES.map(function (h) {
    var gg = el('g', { class: 'pz-piece', opacity: 0 });
    gg.appendChild(el('path', { class: 'pz-shape', d: build(h.segs) }));
    gCentre.appendChild(gg);
    h.ask = el('g', { opacity: 0 });
    h.lines.forEach(function (ln, i) {
      h.ask.appendChild(el('text', { class: 'pz-ask', x: f(CX + h.tx), y: f(CY + h.ty + ALH * i) }, ln));
    });
    gAsk.appendChild(h.ask);
    return gg;
  });

  /* Both halves stroke the seam they share, so it reads as strong as the outer cuts. Soften it
     with one pass of the piece fill over the top — and only once the second half is seated,
     since until then each half still needs its own edge fully drawn. */
  var sd = [dg.b[0] - dg.a[0], dg.b[1] - dg.a[1]], sdl = Math.hypot(sd[0], sd[1]);
  var su = [sd[0] / sdl, sd[1] / sdl];
  var seamEl = el('path', { class: 'pz-seam', opacity: 0,
    d: 'M ' + pstr([dg.a[0] + su[0] * CR, dg.a[1] + su[1] * CR]) +
       cutBody(dg, [dg.b[0] - su[0] * CR, dg.b[1] - su[1] * CR]) });
  gCentre.appendChild(seamEl);

  var T = 7000, TRAVEL = 950, DIM = 0.55;
  var MARK = 1900, SPIN = 2100, SPIN_MS = 1500, FADE = 3550;
  function ease(p) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 3); }
  function span(now, at, dur) { return Math.max(0, Math.min(1, (now - at) / dur)); }

  function render(prog) {
    var now = prog * T;

    pieceG.forEach(function (gg, i) {
      var o = PIECES[i], p = ease(span(now, o.land - TRAVEL, TRAVEL));
      var tr = 'translate(' + f(o.from[0] * (1 - p)) + ' ' + f(o.from[1] * (1 - p)) +
               ') rotate(' + f(o.rot * (1 - p)) + ' ' + CX + ' ' + CY + ')';
      gg.setAttribute('transform', tr);
      gg.setAttribute('opacity', f(Math.min(1, p * 1.7) * (o.dim ? DIM : 1)));
      gg.classList.toggle('pz-lift', p > 0.02 && p < 0.99);
      if (o.icon) {
        labelG[o.key].setAttribute('transform', tr);
        labelG[o.key].setAttribute('opacity', f(ease(span(now, o.land - 280, 620))));
      }
    });

    voidEl.setAttribute('opacity', f(span(now, 1250, 900)));

    halfG.forEach(function (gg, i) {
      var h = HALVES[i], p = ease(span(now, h.land - TRAVEL, TRAVEL));
      var tr = 'translate(' + f(h.from[0] * (1 - p)) + ' ' + f(h.from[1] * (1 - p)) +
               ') rotate(' + f(h.rot * (1 - p)) + ' ' + CX + ' ' + CY + ')';
      gg.setAttribute('transform', tr);
      gg.setAttribute('opacity', f(Math.min(1, p * 1.7)));
      gg.classList.toggle('pz-lift', p > 0.02 && p < 0.99);
      h.ask.setAttribute('transform', tr);
      h.ask.setAttribute('opacity', f(ease(span(now, h.land - 150, 700))));   // each half speaks as it seats
    });
    seamEl.setAttribute('opacity', f(span(now, HALVES[1].land, 420)));
    /* Filtered on the wrapper so the halo wraps the completed centre, not each half — a halo
       per half would light the seam between them. */
    gCentre.classList.toggle('pz-centre', now >= HALVES[HALVES.length - 1].land);
    brandNet.setAttribute('transform', 'rotate(' + f(360 * ease(span(now, SPIN, SPIN_MS))) + ' 16 16)');
    brandG.setAttribute('opacity', f(ease(span(now, MARK, 600)) * (1 - span(now, FADE, 450))));
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { render(1); return; }

  var raf = 0;
  function play() {
    cancelAnimationFrame(raf);
    var start = null;
    (function tick(now) {
      if (start === null) start = now;
      var p = Math.min(1, (now - start) / T);
      render(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    })(performance.now());
  }
  render(0);

  window.observeSlideAnimation(svg, play, function () {
        cancelAnimationFrame(raf);
        render(0);
    });
})();
