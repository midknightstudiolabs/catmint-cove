import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
const w = ms => p.waitForTimeout(ms); const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`);
await p.goto('http://localhost:8879/'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('neo.product.analytics.v1', 'no'); }); await p.goto('http://localhost:8879/', { waitUntil: 'load' }); await w(5500);
if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2200);
if (await p.locator('#own-skip').isVisible().catch(() => false)) await p.locator('#own-skip').click({ force: true });
await p.evaluate(() => { const c = window.__cove; c.G.tutorialDone = true; document.getElementById('app')?.classList.remove('cold-open'); document.getElementById('hint').hidden = true; for (const k of ['ginger','tuxedo']) c.giveCat(k, 2); });
await w(800);
await p.locator('#helpBtn').click({ force: true }); await w(700);
const topics = await p.locator('.help-choice span:not([aria-hidden])').allInnerTexts();
ok('Help lists all topics', topics.length === 9, topics.join(' | '));
await p.screenshot({ path: 'help-home.png' });
const seen = [];
for (let i = 0; i < topics.length; i++) {
  await p.locator('.help-choice').nth(i).click({ force: true }); await w(350);
  const t = await p.locator('#tut .card').innerText(); seen.push(t);
  const overflow = await p.evaluate(() => { const c = document.querySelector('#tut .card'); return c.scrollHeight > c.clientHeight + 2 ? 'scrolls' : 'fits'; });
  if (i === 7) await p.screenshot({ path: 'help-safe.png' });
  await p.locator('#helpShow').click({ force: true }); await w(600);
  const opened = await p.evaluate(() => !!document.querySelector('.sheet:not([hidden]), #modal .reveal, #neo-explore:not([hidden])') || document.getElementById('scrim')?.classList.contains('on'));
  ok('Topic "' + topics[i] + '" → Show me opens something (' + overflow + ')', opened);
  await p.evaluate(() => { document.querySelectorAll('.sheet').forEach(s => s.hidden = true); document.getElementById('scrim')?.classList.remove('on'); });
  await p.locator('#helpBtn').click({ force: true }); await w(500);
}
ok('The safety topic mentions the backup file and restore', /backup file/.test(seen[7]) && /Restore from a code/.test(seen[7]));
ok('The Blessing topic says it is optional and cancellable', /optional/i.test(seen[6]) && /Cancel any time/.test(seen[6]));
// tour
await p.locator('#helpBtn').click({ force: true }); await w(400); await p.locator('#guideTour').click({ force: true }); await w(600);
const steps = []; for (let i = 0; i < 6; i++) { const t = await p.locator('#neo-tour').innerText().catch(() => ''); steps.push(t.split('\n').slice(0, 2).join(' · ')); const sel = ['#dexBtn', '#shopBtn', '#shopTabs [data-tab="inventory"]', '#shop .shop-actions button[aria-pressed]', '#neo-activities-nav', '#todayBtn'][i]; if (i === 3) { await p.locator(sel).filter({ hasText: 'In the Cove' }).click({ force: true }).catch(() => {}); } else await p.locator(sel).first().click({ force: true }).catch(() => {}); await w(700); }
ok('The tour walks 6 steps incl. Activities and Journal', steps.filter(Boolean).length === 6 && /Explore/.test(steps[4]) && /journal/i.test(steps[5]), steps.join(' || '));
// backup screen
await p.evaluate(() => { document.getElementById('neo-tour')?.remove(); document.querySelectorAll('.sheet').forEach(s => s.hidden = true); document.getElementById('scrim')?.classList.remove('on'); });
await p.getByRole('button', { name: 'Journal' }).first().click({ force: true }); await w(800); await p.locator('#backupBtn').click({ force: true }); await w(700);
ok('Back up screen offers copy, save as a file and restore', await p.locator('#bk-copy').isVisible() && await p.locator('#bk-file').isVisible() && await p.locator('#bk-restore').isVisible());
await p.screenshot({ path: 'help-backup.png' });
console.log(out.join('\n')); console.log(errs.join('|') || 'no errors'); await b.close();
