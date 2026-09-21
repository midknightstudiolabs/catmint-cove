import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
const w = ms => p.waitForTimeout(ms); const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`);
await p.goto('http://localhost:8879/'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('neo.product.analytics.v1', 'no'); }); await p.goto('http://localhost:8879/', { waitUntil: 'load' }); await w(5500);
if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2200);
if (await p.locator('#own-skip').isVisible().catch(() => false)) await p.locator('#own-skip').click({ force: true });
await p.evaluate(() => { const c = window.__cove; c.G.tutorialDone = true; c.G.shells = 5000; c.G.opens = 4; document.getElementById('app')?.classList.remove('cold-open'); document.getElementById('hint').hidden = true; for (const k of ['ginger', 'tuxedo', 'calico']) c.giveCat(k, 2); });
await p.mouse.click(200, 400); await w(3500);   // unlock audio
const s0 = await p.evaluate(() => window.__cove.sound()); ok('The cove soundscape is playing in the cove', s0.amb > 0.01 && !s0.duck, JSON.stringify(s0));
await p.locator('#neo-activities-nav').click({ force: true }); await w(600); await p.locator('#neo-go-cafe').click({ force: true }); await w(2500);
const s1 = await p.evaluate(() => window.__cove.sound()); ok('Opening the café silences the cove soundscape', s1.duck && s1.amb < 0.01, JSON.stringify(s1));
await p.locator('#cafe-kiosk [data-close]').first().click({ force: true }); await w(2500);
const s2 = await p.evaluate(() => window.__cove.sound()); ok('Leaving the café brings it back', !s2.duck && s2.amb > 0.01, JSON.stringify(s2));
console.log(out.join(String.fromCharCode(10))); console.log(errs.join('|') || 'no errors'); await b.close();
