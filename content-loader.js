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

    // Split "NosoTrack" into "Noso" + <span>Track</span> for accent styling
    function logoHtml(str) {
        const idx = str.indexOf('Track');
        return idx > -1
            ? str.slice(0, idx) + '<span>' + str.slice(idx) + '</span>'
            : str;
    }

    // ── META ──────────────────────────────────────────────────────────────────

    document.title = c.meta.title + ' — Real-Time Nosocomial Outbreak Analytics';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', c.meta.description);

    // ── NAV ───────────────────────────────────────────────────────────────────

    const navLogoEl = document.querySelector('.nav-logo');
    if (navLogoEl) navLogoEl.innerHTML = logoHtml(c.nav.logo);

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

    setText('.hero-subtitle', c.hero.subtitle);

    const heroBtns = document.querySelector('.hero-buttons');
    if (heroBtns) {
        heroBtns.innerHTML =
            `<a href="${c.hero.primaryCta.href}" class="btn-primary">${c.hero.primaryCta.label} &darr;</a>` +
            `<a href="${c.hero.secondaryCta.href}" class="btn-secondary">${c.hero.secondaryCta.label}</a>`;
    }

    // ── MARQUEE ───────────────────────────────────────────────────────────────

    const track = document.querySelector('.marquee-track');
    if (track) {
        // Double the items so the infinite-scroll CSS animation works
        const doubled = [...c.marquee, ...c.marquee];
        track.innerHTML = doubled.map(s => `<span>${s}</span>`).join('');
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
            p.innerHTML = para; // supports <strong>, <em>, <span class="...">, etc.
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

    // ── PROCESS ───────────────────────────────────────────────────────────────

    setText('#how-it-works .section-tag', c.process.tag);
    setText('#how-it-works .section-title', c.process.title);
    setText('.pipeline-subtitle', c.process.subtitle);

    const steps = c.process.steps;

    // Step badges (num + label)
    const stepDefs = [steps.inputs, steps.anonymisation, steps.engine, steps.earlyWarning];
    document.querySelectorAll('.pipeline-step-badge').forEach((badge, i) => {
        if (!stepDefs[i]) return;
        badge.querySelector('.pipeline-step-num').textContent = stepDefs[i].stepNum;
        badge.querySelector('.pipeline-step-label').textContent = stepDefs[i].stepLabel;
    });

    // Step 1 — input cards (text only; canvases and glows are untouched)
    const inputCards = document.querySelectorAll('.pipeline-sources .p-card');
    steps.inputs.cards.forEach((card, i) => {
        if (!inputCards[i]) return;
        inputCards[i].querySelector('.p-card-tag').textContent = card.tag;
        inputCards[i].querySelector('.p-card-title').textContent = card.title;
        inputCards[i].querySelector('.p-card-desc').textContent = card.desc;
    });

    // Step 2 — anonymisation card
    const anonCard = document.querySelector('[data-pipeline="anon"]');
    if (anonCard) {
        anonCard.querySelector('.p-card-tag').textContent = steps.anonymisation.tag;
        anonCard.querySelector('.p-card-title').textContent = steps.anonymisation.title;
        anonCard.querySelector('.p-card-desc').textContent = steps.anonymisation.desc;
    }

    // Step 3 — engine card
    const engineCard = document.querySelector('[data-pipeline="engine"]');
    if (engineCard) {
        engineCard.querySelector('.p-card-tag').textContent = steps.engine.tag;
        engineCard.querySelector('.p-card-title').textContent = steps.engine.title;
        engineCard.querySelector('.p-card-desc').textContent = steps.engine.desc;
        const feats = engineCard.querySelectorAll('.engine-feat');
        steps.engine.features.forEach((feat, i) => {
            if (feats[i]) feats[i].innerHTML = `<strong>${feat.title}</strong>${feat.desc}`;
        });
    }

    // Step 4 — early warning card
    const alertCard = document.querySelector('[data-pipeline="alert"]');
    if (alertCard) {
        alertCard.querySelector('.p-card-tag').textContent = steps.earlyWarning.tag;
        alertCard.querySelector('.p-card-title').textContent = steps.earlyWarning.title;
        alertCard.querySelector('.p-card-desc').textContent = steps.earlyWarning.desc;
    }

    // ── RESEARCH ──────────────────────────────────────────────────────────────

    setText('#research .section-tag', c.research.tag);
    setHtml('#research .section-title', c.research.title.join('<br>'));
    setHtml('.research-intro', c.research.intro); // supports <span class="nosotrack-highlight">

    function pubCardHtml(item) {
        return `<a class="pub-card" href="${item.url}" target="_blank">
            <span class="pub-tag">${item.tag}</span>
            <div class="pub-title">${item.title}</div>
            <div class="pub-desc">${item.desc}</div>
            <span class="pub-arrow">&rarr;</span>
        </a>`;
    }

    const pubGrids = document.querySelectorAll('.pub-grid');
    if (pubGrids[0]) pubGrids[0].innerHTML = c.research.publications.map(pubCardHtml).join('');
    if (pubGrids[1]) pubGrids[1].innerHTML = c.research.software.map(pubCardHtml).join('');

    // ── TEAM ──────────────────────────────────────────────────────────────────

    setText('#team .section-tag', c.team.tag);
    setHtml('#team .section-title', c.team.title.join('<br>'));

    const teamGrid = document.querySelector('.team-grid');
    if (teamGrid) {
        teamGrid.innerHTML = c.team.members.map((m, i) => `
            <div class="team-card reveal" ${i > 0 ? `style="transition-delay:${i * 0.1}s;"` : ''}>
                <img src="${m.photo}" alt="${m.name}" class="team-photo">
                <div class="team-info">
                    <div class="team-name">${m.name}</div>
                    <div class="team-role">${m.role}</div>
                    <p class="team-bio">${m.bio}</p>
                </div>
            </div>`).join('');

        // Re-observe new .reveal elements for the scroll animation
        const obs = window.__revealObserver;
        if (obs) teamGrid.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    }

    // ── CONTACT ───────────────────────────────────────────────────────────────

    setText('#contact .section-tag', c.contact.tag);
    setHtml('#contact .contact-heading', c.contact.title.join('<br>'));
    setText('.contact-sub', c.contact.subtitle);

    // GitHub link: contains an SVG icon + a text node
    const ghLink = document.querySelector('#contact a[href*="github"]');
    if (ghLink && c.contact.github) {
        ghLink.href = c.contact.github.url;
        ghLink.childNodes.forEach(node => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                node.textContent = c.contact.github.label;
            }
        });
    }

    const form = document.querySelector('.contact-form');
    if (form && c.contact.formAction) form.action = c.contact.formAction;

    // ── FOOTER ────────────────────────────────────────────────────────────────

    const footerLogoEl = document.querySelector('.footer-logo');
    if (footerLogoEl) footerLogoEl.innerHTML = logoHtml(c.footer.logo);

    const footerLinks = document.querySelector('.footer-links');
    if (footerLinks) {
        footerLinks.innerHTML = c.footer.links
            .map(l => `<li><a href="${l.href}"${l.external ? ' target="_blank"' : ''}>${l.label}</a></li>`)
            .join('');
    }

    const footerCopy = document.querySelector('.footer-copy');
    if (footerCopy) footerCopy.innerHTML = `&copy; ${c.footer.copy}.`;

})();
