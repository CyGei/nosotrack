import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
const base = process.env.AUDIT_URL || 'http://localhost:3000';
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1366, height: 768 }]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'no-preference' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(base + '/pitch-deck/index.html');
    await page.waitForTimeout(1800);
    const sample = () => page.evaluate(() => ({
      curve: parseFloat(getComputedStyle(document.querySelector('#ocClip')).width),
      bar: parseFloat(getComputedStyle(document.querySelector('.pen-bar')).width),
      value: document.querySelector('.pen-val').textContent,
      donut: parseFloat(getComputedStyle(document.querySelector('.dn-seg')).strokeDashoffset),
    }));
    assert.equal((await sample()).curve, 0, 'Slide 2 must wait for entry');
    for (let pass = 0; pass < 2; pass++) {
      for (const slide of [2, 3, 4]) {
        await page.evaluate(n => document.getElementById('slide-' + n).scrollIntoView({ behavior: 'instant' }), slide);
        await page.waitForFunction(n => document.getElementById('slide-' + n).classList.contains('active-slide'), slide);
        await page.waitForTimeout(180);
        const during = await sample();
        await page.waitForTimeout(1800);
        const after = await sample();
        if (slide === 2) assert(during.curve > 0 && during.curve < after.curve && after.curve === 100, 'Curve must animate');
        if (slide === 3) {
          assert(during.bar > 0 && during.bar < after.bar, 'Penalty bars must animate');
          assert.notEqual(during.value, after.value, 'Penalty amounts must count up');
        }
        if (slide === 4) assert.notEqual(during.donut, after.donut, 'Donut must animate');
      }
      await page.keyboard.press('Home');
      await page.waitForTimeout(1800);
    }
    for (const selector of ['[data-transmission-tree]', '#pzSvg']) {
      const graphic = page.locator(selector);
      await graphic.evaluate(el => el.closest('.slide').scrollIntoView({ behavior: 'instant' }));
      await page.waitForTimeout(200);
      const early = await graphic.innerHTML();
      await page.waitForTimeout(3000);
      assert.notEqual(await graphic.innerHTML(), early, selector + ' must animate');
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`Animation entry and replay passed at ${viewport.width} × ${viewport.height}`);
  }
} finally {
  await browser.close();
}
