import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
const w = ms => p.waitForTimeout(ms); const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`);
await p.goto('http://localhost:8879/'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('neo.product.analytics.v1', 'no'); }); await p.goto('http://localhost:8879/', { waitUntil: 'load' }); await w(5500);
if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2200);
if (await p.locator('#own-skip').isVisible().catch(() => false)) await p.locator('#own-skip').click({ force: true });
await p.evaluate(() => { const c = window.__cove, g = c.G; g.tutorialDone = true; g.shells = 5000; document.getElementById('app')?.classList.remove('cold-open'); document.getElementById('hint').hidden = true; for (const k of ['ginger', 'tuxedo']) c.giveCat(k, 2); });
await w(1000);
await p.evaluate(() => window.__cove.ritualForce("moonpendant"));
await p.locator('#neo-activities-nav').click({ force: true }); await w(700);
await p.locator('#neo-go-wishwell').click({ force: true }); await w(1000);
await p.locator('#wishwell .ww-wish').click({ force: true });
await w(2600);
const card = await p.evaluate(() => { const el = document.getElementById('ww-card'); return { hidden: el.hidden, rare: el.classList.contains('rare'), text: el.textContent.trim() }; });
ok('A rare pull shows the special rare card', !card.hidden && card.rare, card.text);
await p.screenshot({ path: 'ww-rare-reveal.png' });
const wonKey = await p.evaluate(() => (window.__cove.G.wonAccessories || [])[0]);
ok('The accessory is recorded as won', !!wonKey, wonKey);

await p.locator('#ww-ok').click({ force: true }); await w(400);
await p.locator('.ww-back').click({ force: true }); await w(400);
// confirm it now shows in the dress-up rack
await p.locator('#shopBtn').click({ force: true }); await w(700);
await p.locator('#shop').getByRole('button', { name: 'Dress-up', exact: true }).click({ force: true }); await w(700);
const rackHas = await p.evaluate((k) => [...document.querySelectorAll('.dp-acc')].some(b => b.dataset.acc === k), wonKey);
ok('The won accessory now appears in the dress-up rack', rackHas);
console.log(out.join(String.fromCharCode(10))); console.log(errs.join('|') || 'no errors'); await b.close();
