/** Browser regression audit; Playwright may be supplied by the developer environment. */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const base = process.env.AUDIT_URL || 'http://localhost:3000';
const sizes = [[320,568], [390,844], [844,390], [768,1024], [1024,768], [1366,600], [1920,1080]];
let checks = 0;
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/for-partners/', '/news/', '/for-hospitals/', '/for-farms/', '/cooperl-pitch/']) {
    await page.goto(base + route);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);
    const frameElement = page.locator('[data-pitch-deck]');
    const isDeck = await frameElement.count();
    for (const [width, height] of sizes) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(300);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${route} horizontal overflow at ${width}`);
      checks++;
      if (!isDeck) continue;
      assert.equal(await frameElement.evaluate(el => {
        const r = el.getBoundingClientRect();
        return r.x === 0 && r.y === 0 && Math.abs(r.width - innerWidth) < 1 && Math.abs(r.height - innerHeight) < 1;
      }), true, `${route} must fill the viewport at ${width} × ${height}`);
      const frame = await frameElement.elementHandle().then(el => el.contentFrame());
      const overflow = await frame.evaluate(() => [...document.querySelectorAll('.slide')].flatMap(slide => {
        const body = slide.querySelector('.slide-body').getBoundingClientRect();
        const failures = [...slide.querySelectorAll('.slide-content,h1,h2,.slide-body p,.slide-body figure,.hero-credit,.closing-credit,.adoption-frame')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.top < body.top - 2 || r.bottom > body.bottom + 2 || r.left < body.left - 2 || r.right > body.right + 2;
        }).map(el => el.className);
        if (Math.abs(slide.clientHeight - innerHeight) > 1) failures.push('slide-height');
        return failures.length ? [{ slide: slide.id, failures }] : [];
      }));
      assert.deepEqual(overflow, [], `${route} clipped content at ${width} × ${height}`);
      checks += await frame.locator('.slide').count();
    }
    if (!isDeck) continue;
    const frame = page.frameLocator('[data-pitch-deck]');
    await frame.locator('body').click({ position: { x: 200, y: 150 } });
    await page.keyboard.press('Home');
    await page.waitForTimeout(150);
    for (const [key, expected] of [['ArrowDown', 1], ['Space', 2], ['ArrowUp', 1]]) {
      await page.keyboard.press(key);
      await page.waitForTimeout(150);
      assert.equal(await frame.locator('.active-slide').evaluate(el => [...el.parentElement.children].indexOf(el)), expected, `${route} ${key}`);
    }
    await page.keyboard.press('f');
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => Boolean(document.fullscreenElement)), true, `${route} fullscreen`);
    await page.evaluate(() => document.exitFullscreen());
    console.log(`Verified ${route}`);
  }
  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  console.log(`Passed ${checks} viewport and slide checks, plus keyboard and fullscreen navigation.`);
} finally { await browser.close(); }
