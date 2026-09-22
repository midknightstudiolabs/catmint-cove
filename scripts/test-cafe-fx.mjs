import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
const w = ms => p.waitForTimeout(ms); const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`);
await p.goto('http://localhost:8879/'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('neo.product.analytics.v1', 'no'); }); await p.goto('http://localhost:8879/', { waitUntil: 'load' }); await w(5500);
if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2200);
if (await p.locator('#own-skip').isVisible().catch(() => false)) await p.locator('#own-skip').click({ force: true });
await p.evaluate(() => { const c = window.__cove; c.G.tutorialDone = true; c.G.shells = 5000; c.G.opens = 4; document.getElementById('app')?.classList.remove('cold-open'); document.getElementById('hint').hidden = true; for (const k of ['ginger', 'tuxedo', 'calico']) c.giveCat(k, 2); });
await p.mouse.click(200, 400); await w(600);
// spy on sfx calls by wrapping window.__cove.sfx? Not exposed. Instead patch AudioContext to count oscillator starts as a proxy, and hook a.sfx via monkey-patching sfx function isn't exposed either.
// Simplest: expose a counter by monkey-patching before café loads via injecting into window before opening — the game already defines `sfx` in module scope (not on window), so wrap AudioContext.createOscillator/createBufferSource calls as a signal something played.
await p.evaluate(() => { window.__osc = 0; window.__buf = 0; const AC = window.AudioContext || window.webkitAudioContext; const proto = AC.prototype; const oOsc = proto.createOscillator; proto.createOscillator = function (...a) { window.__osc++; return oOsc.apply(this, a); }; const oBuf = proto.createBufferSource; proto.createBufferSource = function (...a) { window.__buf++; return oBuf.apply(this, a); }; });
await p.locator('#neo-activities-nav').click({ force: true }); await w(600); await p.locator('#neo-go-cafe').click({ force: true }); await w(1500);
await p.locator('#cafe-kiosk [data-start]').click({ force: true }).catch(() => {}); await w(500);
await p.evaluate(() => { const g = window.__cove.G, c = g.cafe; c.guideDone = true; c.lessonComplete = true; c.discovered = ['coffee']; c.menu = ['coffee']; c.open = true; g.homestead.stock.coffee = 30; c.speed = 2; c.cursor = Date.now() - 1000; c.pending = { id: "coffee", price: 12, cost: 0, at: Date.now() + 2500 }; });
await p.locator('#cafe-kiosk [data-close]').first().click({ force: true }).catch(() => {}); await w(400);
await p.locator('#neo-activities-nav').click({ force: true }); await w(600); await p.locator('#neo-go-cafe').click({ force: true }); await w(1000);
const before = await p.evaluate(() => ({ osc: window.__osc, buf: window.__buf, served: window.__cove.G.cafe.served }));
await w(4000);
const after = await p.evaluate(() => ({ osc: window.__osc, buf: window.__buf, served: window.__cove.G.cafe.served, note: document.querySelector('#cafe-kiosk .cc-sale')?.textContent || '' }));
ok('A guest was served during the wait', after.served > before.served, JSON.stringify(after));
ok('Something audible fired (oscillator or buffer source) around the serve', (after.osc - before.osc) + (after.buf - before.buf) > 0, `osc ${before.osc}->${after.osc} buf ${before.buf}->${after.buf}`);
ok('The order note text still shows a reaction', /loved|enjoyed|fine|bitter|sure/.test(after.note), after.note);
console.log(out.join(String.fromCharCode(10))); console.log(errs.join('|') || 'no errors'); await b.close();
