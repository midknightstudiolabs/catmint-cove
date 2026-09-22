import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
const w = ms => p.waitForTimeout(ms); const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`);
await p.goto('http://localhost:8879/'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('neo.product.analytics.v1', 'no'); }); await p.goto('http://localhost:8879/', { waitUntil: 'load' }); await w(5500);
if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2200);
if (await p.locator('#own-skip').isVisible().catch(() => false)) await p.locator('#own-skip').click({ force: true });
await p.evaluate(() => { const c = window.__cove; c.G.tutorialDone = true; document.getElementById('app')?.classList.remove('cold-open'); try { window.__cove.endColdOpen && window.__cove.endColdOpen(true); } catch(e){} document.getElementById('hint').hidden = true; for (const k of ['ginger', 'tuxedo']) c.giveCat(k, 2); });
await w(800);
// zoom out to the whole-cove view
await p.evaluate(() => window.__cove.ovSet(1));
await w(1200);
let st = await p.evaluate(() => window.__cove.ov());
ok('Pinch zoom-out settles with the step-back bar showing', st.target === 1 && st.active && st.focusing, JSON.stringify(st));
await p.evaluate(() => window.__cove.stepBack());
await w(1200);
st = await p.evaluate(() => window.__cove.ov());
ok('Tapping step back while zoomed out actually zooms back in', st.target === 0 && !st.active, JSON.stringify(st));
// focus mode still works as before
console.log('pre-focus state:', JSON.stringify(await p.evaluate(() => window.__cove.ov())));
await p.evaluate(() => window.__cove.forceFocus());
await w(500);
st = await p.evaluate(() => window.__cove.ov());
ok('Tapping a cat opens focus mode', st.focus && st.focusing, JSON.stringify(st));
await p.evaluate(() => window.__cove.stepBack());
await w(600);
st = await p.evaluate(() => window.__cove.ov());
ok('Step back also still exits ordinary cat focus', !st.focus && !st.focusing, JSON.stringify(st));
console.log(out.join(String.fromCharCode(10))); console.log(errs.join('|') || 'no errors'); await b.close();
