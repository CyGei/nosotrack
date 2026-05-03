// content-loader.js
// Fetches content.json and populates the page with its values.
// Fields containing HTML markup (e.g. <strong>, <em>, <a>) are injected
// via innerHTML; plain-text fields use textContent.
//
// NOTE: fetch() requires a server (file:// URLs won't work).
// Use VS Code Live Server, or run: python3 -m http.server

(async function () {
    let c;
    try {
        const res = await fetch('content.json');
        if (!res.ok) throw new Error(res.status);
        c = await res.json();
    } catch (e) {
        console.warn(
            '[content-loader] Could not load content.json. ' +
            'Open index.html via a local server (e.g. VS Code Live Server or ' +
            '`python3 -m http.server`), not as a file:// URL.'
        );
        return;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function setText(sel, val) {
        const el = document.querySelector(sel);
        if (el) el.textContent = val;
    }

    function setHtml(sel, val) {
        const el = document.querySelector(sel);
        if (el) el.innerHTML = val;
    }

    // Populate a .p-card element with tag, optional title, and description.
    // Description is rendered via innerHTML with brandify so "NosoTrack" → wordmark.
    function populateCard(cardEl, data) {
        if (!cardEl || !data) return;
        const tagEl = cardEl.querySelector('.p-card-tag');
        if (tagEl) tagEl.textContent = data.tag;
        const titleEl = cardEl.querySelector('.p-card-title');
        if (titleEl) {
            if (data.title) titleEl.textContent = data.title;
            else titleEl.style.display = 'none';
        }
        const descEl = cardEl.querySelector('.p-card-desc');
        if (descEl) descEl.innerHTML = brandify(data.desc);
    }

    // Wrap every "NosoTrack" in the wordmark markup. JetBrains Mono styling is
    // applied via .brand; red "Track" is scoped to nav/footer logos via CSS.
    // Content comes from the trusted content.json source and may already contain
    // inline HTML (<strong>, <em>, etc.) — we substitute without escaping so
    // existing markup is preserved.
    const BRAND_MARKUP =
        '<span class="brand"><span class="brand-noso">Noso</span>' +
        '<span class="brand-track">Track</span></span>';
    function brandify(str) {
        return String(str).split('NosoTrack').join(BRAND_MARKUP);
    }
    // Convenience: set a container's innerHTML to brandified content
    function setBrand(sel, val) {
        const el = document.querySelector(sel);
        if (el) el.innerHTML = brandify(val);
    }

    // ── META ──────────────────────────────────────────────────────────────────

    document.title = c.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', c.meta.description);

    // ── NAV ───────────────────────────────────────────────────────────────────

    const navLogoEl = document.querySelector('.nav-logo');
    if (navLogoEl) navLogoEl.innerHTML = brandify(c.nav.logo) + '<sup class="brand-tm" aria-label="trademark">&trade;</sup>';

    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.innerHTML =
            c.nav.links.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('') +
            `<li><a href="${c.nav.cta.href}" class="nav-cta">${c.nav.cta.label}</a></li>`;
        // Re-wire close-on-click for mobile nav using event delegation
        navLinks.addEventListener('click', function (e) {
            if (e.target.tagName === 'A') navLinks.classList.remove('open');
        });
    }

    // ── HERO ──────────────────────────────────────────────────────────────────

    setText('.hero-eyebrow', c.hero.eyebrow);

    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const lines = c.hero.title;
        // All but the last line are plain; the last gets the accent class
        heroTitle.innerHTML =
            lines.slice(0, -1).map(l => l + '<br>').join('') +
            `<span class="accent">${lines[lines.length - 1]}</span>`;
    }

    setBrand('.hero-subtitle', c.hero.subtitle);
    setText('.scroll-hint-label', c.hero.scrollLabel || '');
    // Hero has no CTAs by design — the demo is the "Learn More", and the
    // dashboard CTA lives below the demo where the visitor is most warmed up.

    // ── MARQUEE ───────────────────────────────────────────────────────────────

    const track = document.querySelector('.marquee-track');
    if (track) {
        // Double the items so the infinite-scroll CSS animation works
        const doubled = [...c.marquee, ...c.marquee];
        track.innerHTML = doubled.map(s => `<span>${s}</span>`).join('');
    }

    // ── LOGO STRIP ────────────────────────────────────────────────────────────

    const logoStripInner = document.querySelector('.logo-strip-inner');
    if (logoStripInner && c.logoStrip) {
        logoStripInner.innerHTML = c.logoStrip.map(item =>
            `<div class="logo-strip-item">${item.name}</div>`
        ).join('');
    }

    // ── DEMO ──────────────────────────────────────────────────────────────────
    // Embedded interactive Foundry walkthrough. The Stage inside the iframe
    // hides its built-in bar when ?embed=1; the playbar mounted at #demoPlaybar
    // (rendered by playbar.js) is the single source of UI truth and drives the
    // iframe via postMessage. Tick messages from the Stage keep the bar in sync.

    if (c.demo && window.NosoTrack && window.NosoTrack.createPlaybar) {
        const iframe = document.getElementById('demoIframe');
        const mount  = document.getElementById('demoPlaybar');
        const frame  = document.querySelector('#demo .demo-frame');

        function send(cmd, extra) {
            if (!iframe || !iframe.contentWindow) return;
            try {
                iframe.contentWindow.postMessage(
                    Object.assign({ source: 'nosotrack-host', cmd }, extra || {}), '*');
            } catch {}
        }

        const bar = window.NosoTrack.createPlaybar(mount, {
            variant: 'dark',
            trackLabel: c.demo.trackLabel || 'DEMO',
            speeds: [1, 1.5, 2, 3, 5],
            initialSpeedIdx: 0,
            showTime: true,
            showFullscreen: true,
            fullscreenTarget: frame,
            onTogglePlay:  () => send('toggle'),
            onSeek:        (t) => send('seek', { t }),
            onSpeedChange: (s) => send('speed', { value: s })
        });

        // Tick + ready from the iframe — keep the bar in sync with the playhead.
        window.addEventListener('message', (e) => {
            const m = e && e.data;
            if (!m || typeof m !== 'object' || m.source !== 'nosotrack-demo') return;
            if (m.type === 'ready' || m.type === 'tick') bar.update(m);
        });

        // Post-demo CTA — single conversion target for visitors who finished
        // the walkthrough. Hides itself if the content has no CTA configured.
        const ctaEl = document.getElementById('demoCta');
        if (ctaEl) {
            const cta = c.demo.cta;
            if (cta && cta.href) {
                ctaEl.href = cta.href;
                if (cta.external) {
                    ctaEl.target = '_blank';
                    ctaEl.rel    = 'noopener noreferrer';
                }
                const textEl = ctaEl.querySelector('.demo-cta-text');
                if (textEl) textEl.textContent = cta.label || 'Open the dashboard';
            } else {
                ctaEl.remove();
            }
        }
    }

    // ── ABOUT ─────────────────────────────────────────────────────────────────

    setText('#about .section-tag', c.about.tag);
    setHtml('#about .section-title', c.about.title.join('<br>'));

    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
        // Remove only <p> elements, keep section-tag / section-title siblings
        aboutText.querySelectorAll('p').forEach(p => p.remove());
        c.about.paragraphs.forEach(para => {
            const p = document.createElement('p');
            // brandify replaces bare "NosoTrack" with the wordmark markup.
            // Other HTML (<strong>, <em>, <span>) in the source is preserved.
            p.innerHTML = brandify(para);
            aboutText.appendChild(p);
        });
    }

    const statEls = document.querySelectorAll('.about-stat');
    c.about.stats.forEach((stat, i) => {
        if (!statEls[i]) return;
        statEls[i].querySelector('.about-stat-label').textContent = stat.label;
        statEls[i].querySelector('.about-stat-value').textContent = stat.value;
        statEls[i].querySelector('.about-stat-detail').textContent = stat.detail;
    });

    // Viz legend (rebuild from content — horizontal layout)
    const vizLegend = document.getElementById('vizLegend');
    if (vizLegend && c.about.vizLegend) {
        const legend = c.about.vizLegend;
        const typeItems = legend.types.map(t => {
            const shape = t.shape === 'triangle'
                ? `<div class="viz-legend-diamond" style="background:${t.color};"></div>`
                : `<div class="viz-legend-dot" style="background:${t.color};"></div>`;
            return `<div class="viz-legend-item">${shape} ${t.label}</div>`;
        }).join('');
        // Ward colour legend removed — ward zones are annotated inline (grey shading + label).
        const statusItems = legend.status.map((s, i) => {
            const style = i === legend.status.length - 1
                ? `background:${s.color}; box-shadow: 0 0 6px rgba(255,7,58,0.6);`
                : `background:${s.color};`;
            return `<div class="viz-legend-item"><div class="viz-legend-dot" style="${style}"></div> ${s.label}</div>`;
        }).join('');
        vizLegend.innerHTML =
            `<div class="viz-legend-group"><div class="viz-legend-title">${legend.sections.type}</div>${typeItems}</div>` +
            `<div class="viz-legend-sep"></div>` +
            `<div class="viz-legend-group"><div class="viz-legend-title">${legend.sections.status}</div>${statusItems}</div>`;
    }

    // ── PROCESS ───────────────────────────────────────────────────────────────

    setText('#platform .section-tag', c.platform.tag);
    setText('#platform .section-title', c.platform.title);
    setBrand('.pipeline-subtitle', c.platform.subtitle);

    const steps = c.platform.steps;

    // Step badges (num + label)
    const stepDefs = [steps.inputs, steps.anonymisation, steps.engine, steps.alertsReports, steps.ipcSupport];
    document.querySelectorAll('.pipeline-step-badge').forEach((badge, i) => {
        if (!stepDefs[i]) return;
        badge.querySelector('.pipeline-step-num').textContent = stepDefs[i].stepNum;
        badge.querySelector('.pipeline-step-label').textContent = stepDefs[i].stepLabel;
    });

    // Step 1 — input cards (text only; canvases and glows are untouched)
    const inputCards = document.querySelectorAll('.pipeline-sources .p-card');
    steps.inputs.cards.forEach((card, i) => populateCard(inputCards[i], card));

    // Step 2 — anonymisation card
    populateCard(document.querySelector('[data-pipeline="anon"]'), steps.anonymisation);

    // Step 3 — engine card
    const engineCard = document.querySelector('[data-pipeline="engine"]');
    populateCard(engineCard, steps.engine);
    if (engineCard && steps.engine.features && steps.engine.features.length) {
        let featsEl = engineCard.querySelector('.engine-features');
        if (!featsEl) {
            featsEl = document.createElement('div');
            featsEl.className = 'engine-features';
            engineCard.appendChild(featsEl);
        }
        featsEl.innerHTML = steps.engine.features
            .map(f => `<div class="engine-feat"><strong>${f.title}</strong>${f.desc}</div>`)
            .join('');
    }

    // Step 4 — Alerts & Reports
    populateCard(document.querySelector('[data-pipeline="alertsReports"]'), steps.alertsReports);

    // Step 5 — IPC Co-Pilot
    populateCard(document.querySelector('[data-pipeline="ipc"]'), steps.ipcSupport);

    // ── RESEARCH ──────────────────────────────────────────────────────────────

    setText('#research .section-tag', c.research.tag);
    setHtml('#research .section-title', c.research.title.join('<br>'));
    setHtml('.research-intro', c.research.intro);

    setText('#researchTimelineLabel', c.research.timelineLabel);

    // Spike / coronavirus SVG icon for "[Spike]" pathogens
    const SPIKE_SVG =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 11" width="11" height="11" style="display:inline-block;vertical-align:middle;flex-shrink:0;">' +
        '<circle cx="5.5" cy="5.5" r="2.5" fill="#ff073a"/>' +
        '<line x1="5.5" y1="3" x2="5.5" y2="0.5" stroke="#ff073a" stroke-width="1.3" stroke-linecap="round"/>' +
        '<line x1="7.27" y1="3.73" x2="9.04" y2="1.96" stroke="#ff073a" stroke-width="1.3" stroke-linecap="round"/>' +
        '<line x1="8" y1="5.5" x2="10.5" y2="5.5" stroke="#ff073a" stroke-width="1.3" stroke-linecap="round"/>' +
        '<line x1="7.27" y1="7.27" x2="9.04" y2="9.04" stroke="#ff073a" stroke-width="1.3" stroke-linecap="round"/>' +
        '<line x1="5.5" y1="8" x2="5.5" y2="10.5" stroke="#ff073a" stroke-width="1.3" stroke-linecap="round"/>' +
        '<line x1="3.73" y1="7.27" x2="1.96" y2="9.04" stroke="#ff073a" stroke-width="1.3" stroke-linecap="round"/>' +
        '<line x1="3" y1="5.5" x2="0.5" y2="5.5" stroke="#ff073a" stroke-width="1.3" stroke-linecap="round"/>' +
        '<line x1="3.73" y1="3.73" x2="1.96" y2="1.96" stroke="#ff073a" stroke-width="1.3" stroke-linecap="round"/>' +
        '</svg>';

    function pathogenIconHtml(icon) {
        return icon === '[Spike]'
            ? SPIKE_SVG
            : `<span style="font-size:10px;line-height:1;">${icon}</span>`;
    }

    function pathogenPillHtml(p, cls) {
        const yr = (p.applicationYear && p.applicationYear !== 'N/A') ? ` (${p.applicationYear})` : '';
        return `<span class="${cls}">${pathogenIconHtml(p.icon)}<span>${p.name}${yr}</span></span>`;
    }

    const timelineTrack = document.querySelector('.timeline-track');
    const timelineDetail = document.getElementById('timelineDetail');

    if (timelineTrack && c.research.timeline) {
        timelineTrack.innerHTML = c.research.timeline.map((m, idx) => {
            const pills = m.pathogens.map(p => pathogenPillHtml(p, 'tl-pathogen')).join('');
            const cardTag = m.reference_url ? 'a' : 'div';
            const cardAttrs = m.reference_url
                ? ` href="${m.reference_url}" target="_blank" rel="noopener"`
                : '';
            const typeClass = m.type === 'application' ? ' tl-card--application' : ' tl-card--method';
            const typeLabel = m.type === 'application' ? 'Application' : 'Method';
            return `<div class="tl-milestone" tabindex="0" data-idx="${idx}">` +
                `<${cardTag} class="tl-card${typeClass}"${cardAttrs}>` +
                    `<div class="tl-card-top"><div class="tl-year-badge">${m.year}</div><span class="tl-type-badge tl-type-${m.type || 'method'}">${typeLabel}</span></div>` +
                    `<div class="tl-method">${m.method}</div>` +
                    `<div class="tl-authors">${m.authors}</div>` +
                    `<div class="tl-pathogens">${pills}</div>` +
                `</${cardTag}>` +
                `<div class="tl-connector"></div>` +
                `<div class="tl-node${m.type === 'application' ? ' tl-node--application' : ''}"></div>` +
            `</div>`;
        }).join('');

        function showDetail(m) {
            if (!timelineDetail) return;
            const pills = m.pathogens.map(p => pathogenPillHtml(p, 'tl-detail-pathogen')).join('');
            timelineDetail.classList.add('active');
            const detailTypeLabel = m.type === 'application' ? 'Application' : 'Method';
            const detailTypeCls = m.type === 'application' ? 'tl-type-application' : 'tl-type-method';
            timelineDetail.innerHTML =
                `<div class="tl-detail-header">` +
                    `<span class="tl-detail-method">${m.method}</span>` +
                    `<span class="tl-type-badge ${detailTypeCls}">${detailTypeLabel}</span>` +
                    `<span class="tl-detail-meta">${m.year} &middot; ${m.authors}</span>` +
                `</div>` +
                `<p class="tl-detail-desc">${m.description}</p>` +
                `<div class="tl-detail-pathogens">${pills}</div>`;
        }

        document.querySelectorAll('.tl-milestone').forEach((el, i) => {
            const m = c.research.timeline[i];
            el.addEventListener('mouseenter', () => showDetail(m));
            el.addEventListener('focus', () => showDetail(m));
        });

        // ── Timeline step-nav (arrow buttons + keyboard) ──────────────────
        const tlScroll = document.querySelector('.timeline-scroll');
        const tlNav = document.getElementById('timelineNav');
        if (tlScroll && tlNav) {
            const btns = tlNav.querySelectorAll('.timeline-nav-btn');

            function stepSize() {
                // Scroll by ~2 cards at a time, capped at one visible "page"
                const card = tlScroll.querySelector('.tl-milestone');
                const cardW = card ? card.getBoundingClientRect().width + 36 : 232; // card + side margins
                return Math.min(cardW * 2, tlScroll.clientWidth - cardW * 0.5);
            }

            function updateBtnState() {
                const max = tlScroll.scrollWidth - tlScroll.clientWidth - 1;
                btns.forEach(b => {
                    const dir = parseInt(b.dataset.tlDir, 10);
                    b.disabled = (dir < 0 && tlScroll.scrollLeft <= 0) ||
                                 (dir > 0 && tlScroll.scrollLeft >= max);
                });
            }

            btns.forEach(b => {
                b.addEventListener('click', () => {
                    const dir = parseInt(b.dataset.tlDir, 10);
                    tlScroll.scrollBy({ left: dir * stepSize(), behavior: 'smooth' });
                });
            });

            // Keyboard support when the scroll area has focus
            tlScroll.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    tlScroll.scrollBy({ left: -stepSize(), behavior: 'smooth' });
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    tlScroll.scrollBy({ left: stepSize(), behavior: 'smooth' });
                }
            });

            tlScroll.addEventListener('scroll', updateBtnState, { passive: true });
            window.addEventListener('resize', updateBtnState);
            updateBtnState();
        }
    }

    // ── TEAM ──────────────────────────────────────────────────────────────────

    setText('#team .section-tag', c.team.tag);
    setHtml('#team .section-title', c.team.title.join('<br>'));

    const teamGrid = document.querySelector('.team-grid');
    if (teamGrid) {
        const f = c.team.founder;
        const founderCard = `
            <div class="team-card reveal">
                <img src="${f.photo}" alt="${f.name}" class="team-photo">
                <div class="team-info">
                    <div class="team-name">${f.name}</div>
                    <div class="team-role">${f.role}</div>
                    <p class="team-bio">${f.bio}</p>
                </div>
            </div>`;

        const advisorCards = c.team.advisors.map((a, i) => `
            <div class="team-card reveal" ${i > 0 ? `style="transition-delay:${i * 0.1}s;"` : ''}>
                <img src="${a.photo}" alt="${a.name}" class="team-photo">
                <div class="team-info">
                    <div class="team-name">${a.name}</div>
                    <div class="team-role">${a.role}</div>
                    <p class="team-bio">${a.bio}</p>
                </div>
            </div>`).join('');

        teamGrid.innerHTML = `
            <div>
                <div class="team-group-label">Founder</div>
                ${founderCard}
            </div>
            <div class="team-divider"></div>
            <div>
                <div class="team-group-label">${c.team.advisorsLabel || 'Advisors'}</div>
                <div class="team-advisors-row">${advisorCards}</div>
            </div>`;
    }

    // Re-observe new .reveal elements for the scroll animation
    const obs = window.__revealObserver;
    const teamSection = document.querySelector('#team');
    if (obs && teamSection) teamSection.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    // ── ROADMAP ──────────────────────────────────────────────────────────────

    if (c.roadmap) {
        setText('#roadmap .section-tag', c.roadmap.tag);
        setHtml('#roadmap .section-title', c.roadmap.title.join('<br>'));
        setHtml('.roadmap-intro', brandify(c.roadmap.intro));

        const phases = document.querySelectorAll('.roadmap-phase');
        c.roadmap.phases.forEach((phase, i) => {
            if (!phases[i]) return;
            phases[i].querySelector('.roadmap-phase-badge').textContent = phase.badge;
            phases[i].querySelector('.roadmap-card-title').textContent = phase.title;
            phases[i].querySelector('.roadmap-card-desc').innerHTML = brandify(phase.desc);
            const tagsEl = phases[i].querySelector('.roadmap-card-tags');
            if (tagsEl && phase.tags) {
                tagsEl.innerHTML = phase.tags.map(t =>
                    `<span class="roadmap-tag">${t}</span>`
                ).join('');
            }
        });
    }

    // ── CONTACT ───────────────────────────────────────────────────────────────

    setText('#contact .section-tag', c.contact.tag);
    setHtml('#contact .contact-heading', c.contact.title.join('<br>'));
    setText('.contact-sub', c.contact.subtitle);

    // GitHub link: contains an SVG icon + a text node
    const ghLink = document.getElementById('contactGithub');
    if (ghLink && c.contact.github) {
        ghLink.href = c.contact.github.url;
        let textNode = Array.from(ghLink.childNodes).find(
            node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
        );
        if (textNode) {
            textNode.textContent = c.contact.github.label;
        } else {
            ghLink.appendChild(document.createTextNode(c.contact.github.label));
        }
    }

    // LinkedIn link
    const liLink = document.getElementById('contactLinkedin');
    if (liLink && c.contact.linkedin) {
        liLink.href = c.contact.linkedin.url;
        let textNode = Array.from(liLink.childNodes).find(
            node => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
        );
        if (textNode) {
            textNode.textContent = c.contact.linkedin.label;
        } else {
            liLink.appendChild(document.createTextNode(c.contact.linkedin.label));
        }
    }

    const form = document.querySelector('.contact-form');
    if (form && c.contact.formAction) form.action = c.contact.formAction;

    // Form labels
    if (c.contact.formLabels) {
        setText('label[for="name"]', c.contact.formLabels.name);
        setText('label[for="email"]', c.contact.formLabels.email);
        setText('label[for="message"]', c.contact.formLabels.message);
    }

    // Form buttons
    if (c.contact.formButtons) {
        setText('#btnSubmit', c.contact.formButtons.submit);
    }

    // ── FOOTER ────────────────────────────────────────────────────────────────

    const footerLogoEl = document.querySelector('.footer-logo');
    if (footerLogoEl) footerLogoEl.innerHTML = brandify(c.footer.logo) + '<sup class="brand-tm" aria-label="trademark">&trade;</sup>';

    const footerLinks = document.querySelector('.footer-links');
    if (footerLinks) {
        footerLinks.innerHTML = c.footer.links
            .map(l => `<li><a href="${l.href}"${l.external ? ' target="_blank"' : ''}>${l.label}</a></li>`)
            .join('');
    }

    const footerCopy = document.querySelector('.footer-copy');
    if (footerCopy) footerCopy.innerHTML = `&copy; ${c.footer.copy}.`;

    const footerCredit = document.querySelector('.footer-credit');
    if (footerCredit && c.footer.credit) footerCredit.textContent = c.footer.credit;

})();
