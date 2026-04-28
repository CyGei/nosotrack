// ==========================================
// BACKGROUND NETWORK ANIMATION (Canvas 2D)
// ==========================================
(function () {
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    const particleCount = 100;
    let heroRings = [];
    const connectionDistance = 130;
    const particleSpeed = 0.35;
    const infectionChance = 0.012;
    const recoveryTime = 700;

    // The canvas now lives inside .dark-band (which spans hero + demo) so
    // the particle field is one continuous surface behind both sections.
    // Fall back to the viewport if the wrapper isn't found, so the
    // standalone hero still works.
    const surface = canvas.parentElement || document.body;

    function resize() {
        // clientWidth/Height reflects the wrapper's current rendered size
        // including hero (100vh) and demo content below it.
        width  = canvas.width  = surface.clientWidth  || window.innerWidth;
        height = canvas.height = surface.clientHeight || window.innerHeight;
    }
    window.addEventListener('resize', resize);
    // ResizeObserver picks up height changes from demo content (the
    // lazy-loaded iframe finishing layout, fullscreen exit, etc.) without
    // polling.
    if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(resize);
        ro.observe(surface);
    }
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width; this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * particleSpeed;
            this.vy = (Math.random() - 0.5) * particleSpeed;
            this.size = Math.random() * 1.5 + 0.5;
            this.isInfected = false; this.infectionTimer = 0;
        }
        infect() { if (!this.isInfected) { this.isInfected = true; this.infectionTimer = recoveryTime; if (Math.random() < 0.2) heroRings.push({ x: this.x, y: this.y, r: this.size, alpha: 0.4 }); } }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            if (this.isInfected) { this.infectionTimer--; if (this.infectionTimer <= 0) this.isInfected = false; }
        }
        draw() {
            ctx.fillStyle = this.isInfected ? 'rgba(255, 7, 58, 0.85)' : 'rgba(201, 201, 204, 0.45)';
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            if (this.isInfected) {
                const pulse = 0.08 + Math.sin(this.infectionTimer * 0.09) * 0.035;
                ctx.fillStyle = `rgba(255, 7, 58, ${pulse})`;
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size + 7, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(255, 7, 58, 0.035)';
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size + 16, 0, Math.PI * 2); ctx.fill();
            }
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) { const p = new Particle(); if (Math.random() < 0.04) p.infect(); particles.push(p); }
    }
    initParticles();

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Expanding infection rings (sparse, subtle)
        for (let ri = heroRings.length - 1; ri >= 0; ri--) {
            const ring = heroRings[ri];
            ring.r += 0.65; ring.alpha -= 0.026;
            if (ring.alpha <= 0) { heroRings.splice(ri, 1); continue; }
            ctx.strokeStyle = `rgba(255, 7, 58, ${ring.alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2); ctx.stroke();
        }

        if (!particles.some(p => p.isInfected)) particles[Math.floor(Math.random() * particles.length)].infect();
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(); particles[i].draw();
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < connectionDistance) {
                    if (particles[i].isInfected && !particles[j].isInfected && Math.random() < infectionChance) particles[j].infect();
                    else if (!particles[i].isInfected && particles[j].isInfected && Math.random() < infectionChance) particles[i].infect();
                    const opacity = 1 - (dist / connectionDistance);
                    const bothInfected = particles[i].isInfected && particles[j].isInfected;
                    const eitherInfected = particles[i].isInfected || particles[j].isInfected;
                    ctx.strokeStyle = bothInfected
                        ? `rgba(255, 7, 58, ${opacity * 0.6})`
                        : eitherInfected
                            ? `rgba(255, 7, 58, ${opacity * 0.35})`
                            : `rgba(201, 201, 204, ${opacity * 0.14})`;
                    ctx.lineWidth = bothInfected ? 0.8 : 0.4;
                    ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
})();

// ==========================================
// NAV TOGGLE
// ==========================================
document.getElementById('navToggle').addEventListener('click', function () { document.getElementById('navLinks').classList.toggle('open'); });
document.querySelectorAll('.nav-links a').forEach(a => { a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open')); });

// Nav scroll shrink + dark-over-hero toggle
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 60;
    document.querySelector('.main-nav').classList.toggle('scrolled', scrolled);

    // Drop the `nav-on-dark` body flag once we've passed the dark hero band,
    // so the nav inverts back to ink-on-light for the body of the page.
    const hero = document.getElementById('hero');
    if (hero) {
        const past = window.scrollY > hero.offsetHeight - 80;
        document.body.classList.toggle('nav-on-dark', !past);
    }
}, { passive: true });

// Scroll hint
const heroHint = document.getElementById('heroScrollHint');
if (heroHint) heroHint.addEventListener('click', () => document.getElementById('about').scrollIntoView({ behavior: 'smooth' }));

// ==========================================
// SCROLL REVEAL
// ==========================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
window.__revealObserver = observer;

// Nav + footer marks are now inline SVGs in index.html (networked trilobe).
// They inherit color from currentColor, so the existing .nav-logo color rules
// (ink on light, inv-hi on dark via body.nav-on-dark) cascade into them — no JS needed.
