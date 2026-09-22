import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
const w = ms => p.waitForTimeout(ms); const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`);
await p.goto('http://localhost:8879/'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('neo.product.analytics.v1', 'no'); }); await p.goto('http://localhost:8879/', { waitUntil: 'load' }); await w(5500);
if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2200);
if (await p.locator('#own-skip').isVisible().catch(() => false)) await p.locator('#own-skip').click({ force: true });
await p.evaluate(() => { const c = window.__cove, g = c.G; g.tutorialDone = true; g.shells = 5000; document.getElementById('app')?.classList.remove('cold-open'); document.getElementById('hint').hidden = true; for (const k of ['ginger', 'tuxedo']) c.giveCat(k, 2); });
await w(1000);
await p.locator('#neo-activities-nav').click({ force: true }); await w(700);
await p.locator('#neo-go-cafe').click({ force: true }); await w(1200);
// Pre-unlock: the guide card must NOT be stacked into the intro
const intro = await p.evaluate(() => { const el = document.querySelector('#cafe-kiosk .cc-intro'); return el ? { hasGuideCard: !!el.querySelector('.cc-guide'), text: el.textContent.replace(/\s+/g, ' ').trim().slice(0, 160) } : null; });
ok('The pre-unlock intro no longer has a guide card stacked inside it', intro && !intro.hasGuideCard, JSON.stringify(intro));
await p.screenshot({ path: 'cafe-intro-fixed.png' });
// unlock, then complete the guided lesson
await p.locator('#cafe-kiosk [data-start]').click({ force: true }); await w(600);
await p.locator('#cafe-kiosk [data-create]').click({ force: true }); await w(500);
for (let i = 0; i < 3; i++) { await p.locator('#cafe-kiosk [data-lesson]').click({ force: true }); await w(400); }
await w(400);
// step back to the cove — the overview fires on close, not mid-café (the café sheet sits above the modal layer)
await p.locator('#cafe-kiosk [data-close]').first().click({ force: true }); await w(1000);
const modal = await p.evaluate(() => { const m = document.getElementById('modal'); return { on: document.getElementById('scrim')?.classList.contains('on'), text: m ? m.textContent.replace(/\s+/g, ' ').trim() : '', liCount: document.querySelectorAll('#modal li').length }; });
ok('Stepping back to the cove after brewing shows the complete café guide', modal.on && /running catmint caf/i.test(modal.text) && /pantry/i.test(modal.text) && /upgrades/i.test(modal.text) && modal.liCount === 8, modal.text.slice(0, 200) + ` | li=${modal.liCount}`);
await p.screenshot({ path: 'cafe-first-brew-overview.png' });
if (modal.on) { await p.locator('#fbo-close').click({ force: true }); await w(500); }
const afterClose = await p.evaluate(() => document.getElementById('scrim')?.classList.contains('on'));
ok('Closing it dismisses cleanly', !afterClose, String(afterClose));
// shouldn't show again on a later café visit
await p.locator('#neo-activities-nav').click({ force: true }); await w(600);
await p.locator('#neo-go-cafe').click({ force: true }); await w(800);
await p.locator('#cafe-kiosk [data-close]').first().click({ force: true }).catch(() => {}); await w(700);
const again = await p.evaluate(() => document.getElementById('scrim')?.classList.contains('on'));
ok('It does not show again on a later visit', !again);
console.log(out.join(String.fromCharCode(10))); console.log(errs.join('|') || 'no errors'); await b.close();
