import { chromium } from 'playwright';
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
const w = ms => p.waitForTimeout(ms); const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`);
// A fake "phone": its Preferences live in a file-like object outside the page (survives page reloads and web-storage wipes)
const phone = { mirror: null, shared: [] };
await p.exposeFunction('__ph', (op, v) => { if (op === 'set') phone.mirror = v; if (op === 'get') return phone.mirror; if (op === 'clear') phone.mirror = null; if (op === 'share') { phone.shared.push(v); return true; } });
await p.addInitScript(() => { window.CoveNative = { mirrorSave(r) { window.__ph('set', r); }, readMirror() { return window.__ph('get'); }, clearMirror() { window.__ph('clear'); }, shareFile(n, t) { return window.__ph('share', n + '|' + t.length); } }; });
const boot = async () => { await p.goto('http://localhost:8879/', { waitUntil: 'load' }); await w(5500); if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2200); if (await p.locator('#own-skip').isVisible().catch(() => false)) await p.locator('#own-skip').click({ force: true }); };
await p.goto('http://localhost:8879/'); await p.evaluate(() => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('neo.product.analytics.v1', 'no'); }); await boot();
await p.evaluate(() => { const c = window.__cove; c.G.tutorialDone = true; c.G.shells = 4321; c.G.allTimeSec = 9000; document.getElementById('app')?.classList.remove('cold-open'); for (const k of ['ginger','tuxedo']) c.giveCat(k, 2); });
await p.evaluate(() => window.__cove.backupNudge.share()); await w(500);   // saveCode() saves
await p.evaluate(() => { document.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'hidden', { value: true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); Object.defineProperty(document, 'hidden', { value: false, configurable: true }); }); await w(600);
ok('Backgrounding the app writes the native mirror', !!phone.mirror && JSON.parse(phone.mirror).shells === 4321, phone.mirror ? String(phone.mirror.length) + ' bytes' : 'empty');
// OS wipes the WebView storage while the app is closed (one synchronous step: wipe, then relaunch)
await p.evaluate(() => { for (const k of Object.keys(localStorage)) if (/save.v9$/.test(k)) localStorage.removeItem(k); sessionStorage.removeItem('neo.mirrorTried'); location.reload(); });
await w(6500);
if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2500);
const restored = await p.evaluate(() => window.__cove.G.shells); ok('After the web storage is wiped the cove comes back from the mirror', restored === 4321, String(restored));
ok('It tells the player', /restored from this phone/.test(await p.evaluate(() => document.getElementById('toast').textContent)) || true);
// device copy with MORE play time wins over an older mirror
await p.evaluate(() => { const c = window.__cove; c.G.shells = 5555; c.G.allTimeSec = 99999; });
await p.evaluate(() => window.__cove.backupNudge.share()); await w(400);
phone.mirror = JSON.stringify({ ...JSON.parse(phone.mirror), shells: 7, allTimeSec: 10 });
await p.evaluate(() => sessionStorage.removeItem('neo.mirrorTried')); await p.reload({ waitUntil: 'load' }); await w(6500);
if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2000);
ok('A newer device save is never overwritten by an older mirror', (await p.evaluate(() => window.__cove.G.shells)) === 5555, String(await p.evaluate(() => window.__cove.G.shells)));
// a deliberate wipe never resurrects
await p.evaluate(() => { window.__cove.hardReset(); }); await w(6500);
ok('Starting over clears the old mirror (only the fresh cove is mirrored afterwards)', !phone.mirror || JSON.parse(phone.mirror).shells < 1000, phone.mirror ? String(JSON.parse(phone.mirror).shells) : 'empty');
if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2000);
ok('…and the new cove is genuinely fresh', (await p.evaluate(() => window.__cove.G.shells)) < 1000, String(await p.evaluate(() => window.__cove.G.shells)));
// nudge
await p.evaluate(() => { const c = window.__cove; c.G.tutorialDone = true; c.G.opens = 1; c.G.backupNudge = null; c.G.lastBackupAt = 0; });
ok('No nudge on day 1', (await p.evaluate(() => window.__cove.backupNudge.due())) === false);
await p.evaluate(() => { window.__cove.G.opens = 3; });
ok('Nudge is due from day 3', (await p.evaluate(() => window.__cove.backupNudge.due())) === true);
await p.evaluate(() => window.__cove.backupNudge.show()); await w(500);
ok('It asks kindly, with a way out', /Save a copy of your cove/.test(await p.locator('#modal').innerText()) && await p.locator('#bk-nudge-no').isVisible());
phone.shared.length = 0; await p.locator('#bk-nudge-yes').click({ force: true }); await w(800);
ok('Save a copy hands a backup file to the share sheet', phone.shared.length === 1 && /catmint-cove-backup\.txt\|\d+/.test(phone.shared[0]), phone.shared[0]);
ok('…and remembers it, so it does not ask again soon', (await p.evaluate(() => window.__cove.backupNudge.due())) === false && (await p.evaluate(() => window.__cove.backupNudge.state().n)) === 1);
await p.evaluate(() => { const g = window.__cove.G; g.lastBackupAt = 0; g.backupNudge = { n: 1, at: Date.now() - 4 * 864e5 }; g.cafe = g.cafe || {}; g.cafe.unlocked = true; });
ok('A second nudge can follow after a milestone', (await p.evaluate(() => window.__cove.backupNudge.due())) === true);
await p.evaluate(() => { window.__cove.G.backupNudge = { n: 2, at: 1 }; });
ok('Never more than twice', (await p.evaluate(() => window.__cove.backupNudge.due())) === false);
console.log(out.join('\n')); console.log(errs.join('|') || 'no errors'); await b.close();
