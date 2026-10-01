/** Transmission story geometry and scroll regression checks. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.AUDIT_URL || 'http://localhost:3000';
const sizes = [[320, 568], [390, 844], [844, 390], [768, 1024], [900, 700], [1024, 768], [1440, 900], [1920, 1080]];
for (const name of (process.env.AUDIT_BROWSERS || 'chromium,firefox,webkit').split(',')) {
  const browser = await playwright[name].launch({ headless: true,
    ...(name === 'chromium' ? { channel: process.env.BROWSER_CHANNEL || 'chrome' } : {}),
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForSelector('[data-ready]');
    await page.waitForFunction(() => !document.querySelector('[data-hero-snap]'));
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(250);
      const failures = await page.evaluate(() => {
        const root = document.querySelector('[data-ready]');
        const svg = root.querySelector(':scope > svg');
        const failures = [];
        for (const el of document.querySelectorAll('[data-story-title], [data-story-branch], [data-story-leaf], #contact a, #contact input, #contact textarea')) {
          const r = el.getBoundingClientRect();
          if (r.left < 0 || r.right > innerWidth + 1) failures.push('Content overflow: ' + el.tagName);
        }
        for (const path of svg.querySelectorAll('path')) {
          const length = path.getTotalLength();
          for (let i = 0; i <= 20; i++) {
            const p = path.getPointAtLength(length * i / 20);
            if (!Number.isFinite(p.x) || p.x < 0 || p.x > innerWidth || p.y < 0 || p.y > root.offsetHeight + 1) failures.push('Invalid path: ' + path.getAttribute('d'));
          }
        }
        const chapters = [...root.querySelectorAll('[data-story-chapter]')];
        const layers = [...svg.children];
        chapters.forEach((chapter, i) => {
          const title = chapter.querySelector('[data-story-title]');
          const titleY = title.getBoundingClientRect().top + parseFloat(getComputedStyle(title).lineHeight) / 2;
          const node = layers[i].querySelector('g');
          const nodeY = node.getBoundingClientRect().top + node.getBoundingClientRect().height / 2;
          if (Math.abs(titleY - nodeY) > 3) failures.push('Title/node misalignment: ' + chapter.id);
          if (innerWidth < 900 && Math.abs(node.getBoundingClientRect().left + node.getBoundingClientRect().width / 2 - 24) > 1) failures.push('Mobile gutter shifted');
        });
        return failures;
      });
      assert.deepEqual(failures, [], `${name} ${width}×${height}`);
    }
    // Tab replacement must remeasure the path without losing title alignment.
    await page.getByRole('tab', { name: 'Details', exact: true }).first().click();
    await page.waitForTimeout(300);
    assert.equal(await page.locator('[data-ready] > svg > g').count(), 10);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);
    const origin = await page.locator('[data-ready]').evaluate(el => el.getBoundingClientRect().top + scrollY);
    async function sample(y) {
      await page.evaluate(y => scrollTo({ top: y, behavior: 'instant' }), y);
      await page.waitForTimeout(100);
      return page.locator('[data-ready] > svg').evaluate(svg => {
        const root = svg.parentElement;
        const front = innerHeight * 0.64 - root.getBoundingClientRect().top;
        const failures = [];
        const offsets = [];
        for (const p of svg.querySelectorAll('path[pathLength]')) {
          const offset = parseFloat(p.style.strokeDashoffset);
          offsets.push(offset);
          if (!Number.isFinite(offset)) failures.push('Invalid progress');
          const length = p.getTotalLength();
          const start = p.getPointAtLength(0);
          if (front < start.y && offset < 0.999) failures.push('Branch painted ahead of junction');
          if (!p.hasAttribute('data-story-sweep') && getComputedStyle(p).strokeWidth === '2.6px' && offset > 0 && offset < 1) {
            const tip = p.getPointAtLength(length * (1 - offset));
            if (Math.abs(tip.y - front) > 1) failures.push('Trunk tip drifted from scroll front');
          }
        }
        if (svg.querySelectorAll('[data-state="current"]').length > 1) failures.push('Multiple current nodes');
        return { offsets, failures };
      });
    }
    const first = await sample(origin + 900);
    const next = await sample(origin + 1500);
    const back = await sample(origin + 900);
    assert.deepEqual(first.failures.concat(next.failures, back.failures), []);
    assert.deepEqual(first.offsets, back.offsets, 'Reverse scroll must restore the same progress');
    assert.notDeepEqual(first.offsets, next.offsets, 'Scroll must advance transmission');
    assert.deepEqual(errors, [], `${name} browser errors`);
    console.log(`${name}: 8 viewports, title alignment, tab replacement, reduced motion, forward/reverse progression passed.`);
  } finally { await browser.close(); }
}
