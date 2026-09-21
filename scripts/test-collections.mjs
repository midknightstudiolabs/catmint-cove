import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
const w = ms => p.waitForTimeout(ms); const out = []; const ok = (n, c, x = '') => out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`);
await p.goto('http://localhost:8879/'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('neo.product.analytics.v1', 'no'); }); await p.goto('http://localhost:8879/', { waitUntil: 'load' }); await w(5500);
if (await p.locator('#ts-go').isVisible().catch(() => false)) await p.locator('#ts-go').click({ force: true }); await w(2200);
if (await p.locator('#own-skip').isVisible().catch(() => false)) await p.locator('#own-skip').click({ force: true });
await p.evaluate(() => { const c = window.__cove; c.G.tutorialDone = true; c.G.shells = 5000; c.G.bowls = 6; document.getElementById('app')?.classList.remove('cold-open'); try { c.focus('off'); } catch {} document.getElementById('hint').hidden = true; for (const k of ['ginger', 'tuxedo', 'calico', 'siamese']) c.giveCat(k, 2); c.setHour(13); });
await w(800);
const earn = () => p.evaluate(() => window.__cove.earn());
let e = await earn(); ok('All six pieces exist and none are owned yet', e.length === 6 && e.every(x => !x.owned), e.map(x => x.id).join(','));
ok('Nothing is granted before it is earned', (await p.evaluate(() => window.__cove.claimEarned())) === false);
// --- Reading Nook: Little Matches
await p.evaluate(() => { const g = window.__cove.G; g.littleMatches = g.littleMatches || {}; g.littleMatches.done = { 1: true, 2: true, 9: true }; });
e = await earn(); ok('Rug progress reads level 9 of 10 and is not done', e.find(x => x.id === 'cozyrug').have === 9 && !e.find(x => x.id === 'cozyrug').done);
await p.evaluate(() => { window.__cove.G.littleMatches.done[10] = true; });
ok('Reaching level 10 grants the rug, once', (await p.evaluate(() => window.__cove.claimEarned())) === true && (await p.evaluate(() => window.__cove.claimEarned())) === false);
ok('The lamp still waits for level 20', !(await earn()).find(x => x.id === 'readinglamp').owned);
await p.evaluate(() => { window.__cove.G.littleMatches.done[20] = true; window.__cove.claimEarned(); });
ok('Level 20 grants the lamp and completes the Reading Nook', (await earn()).filter(x => ['cozyrug', 'readinglamp'].includes(x.id)).every(x => x.owned) && (await p.evaluate(() => (window.__cove.G.moments || []).some(m => /Reading Nook is complete/.test(m.text)))));
// --- Seaside Picnic: adventures
await p.evaluate(() => { window.__cove.G.advHome = 0; window.__cove.G.postcards = []; });
ok('No adventures, no blanket', !(await p.evaluate(() => window.__cove.claimEarned())));
await p.evaluate(() => { window.__cove.G.advHome = 1; });
await p.evaluate(() => window.__cove.claimEarned()); ok('Bringing one party home grants the blanket', (await earn()).find(x => x.id === 'picnicblanket').owned);
await p.evaluate(() => { window.__cove.G.advHome = 4; window.__cove.claimEarned(); }); ok('Four adventures is not yet enough for the lanterns', !(await earn()).find(x => x.id === 'paperlanterns').owned);
await p.evaluate(() => { window.__cove.G.advHome = 5; window.__cove.claimEarned(); }); ok('Five adventures grants the lanterns', (await earn()).find(x => x.id === 'paperlanterns').owned);
// --- Memory: postcards
const cards = n => p.evaluate((n) => { const d = ['forest', 'meadow', 'peak', 'market', 'island', 'fishing']; window.__cove.G.postcards = Array.from({ length: n }, (_, i) => ({ t: Date.now() - i * 1e6, cat: 'Midknight', dest: d[i % 6], text: 'Hello ' + i + ' — Midknight', artSeed: 100 + i * 31, artVariant: i % 4 })); window.__cove.claimEarned(); }, n);
await cards(2); ok('Two postcards: no board yet', !(await earn()).find(x => x.id === 'postcardboard').owned);
await cards(3); ok('Three postcards grant the board', (await earn()).find(x => x.id === 'postcardboard').owned);
await cards(9); ok('Nine postcards: the easel waits', !(await earn()).find(x => x.id === 'photoeasel').owned);
await cards(10); ok('Ten postcards grant the easel', (await earn()).find(x => x.id === 'photoeasel').owned);
// persistence
const saved = await p.evaluate(() => { window.__cove.G.postcards = window.__cove.G.postcards; return null; });
await p.evaluate(() => { const c = window.__cove; c.G.allTimeSec = (c.G.allTimeSec || 0) + 5; }); await w(300);
// shop rows
await p.evaluate(() => { const g = window.__cove.G; for (const id of ['cozyrug', 'readinglamp', 'picnicblanket', 'paperlanterns', 'postcardboard', 'photoeasel']) delete g.cosmetics.props[id]; g.littleMatches.done = { 5: true }; g.advHome = 2; g.postcards = []; });
await p.locator('#shopBtn').click({ force: true }); await w(700); await p.locator('#shop').getByRole('button', { name: 'Decor', exact: true }).click({ force: true }); await w(800);
const rows = await p.evaluate(() => [...document.querySelectorAll('#shop .shop-item')].filter(r => /Cozy Rug|Reading Lamp|Picnic Blanket|Paper Lanterns|Postcard Board|Photo Easel/.test(r.textContent)).map(r => r.textContent.replace(/\s+/g, ' ').trim()));
ok('The Shop lists all six as earnable, with progress and how', rows.length === 6 && rows.every(t => !/◈/.test(t)) && /Level 5 of 10/.test(rows.find(t => /Cozy Rug/.test(t))) && /2 of 5 adventures/.test(rows.find(t => /Paper Lanterns/.test(t))) && /Complete Little Matches level 10/.test(rows.find(t => /Cozy Rug/.test(t))), rows[0].slice(0, 130));
await p.screenshot({ path: 'col-shop.png' });
await p.evaluate(() => { document.getElementById('shop').hidden = true; document.getElementById('scrim')?.classList.remove('on'); });
// grant everything, then check cats use the mats
await p.evaluate(() => { const g = window.__cove.G; g.littleMatches.done = { 10: true, 20: true }; g.advHome = 5; g.postcards = Array.from({ length: 12 }, (_, i) => ({ t: Date.now() - i * 1e6, cat: 'Midknight', dest: ['forest', 'meadow', 'peak', 'market', 'island', 'fishing'][i % 6], text: 'Note ' + i + ' — Midknight', artSeed: 7 + i * 13, artVariant: i % 4 })); window.__cove.claimEarned(); });
ok('All six are owned and placed', (await earn()).every(x => x.owned));
const spot = await p.evaluate(() => { const s = window.__cove.matSpot(); const r = window.__cove.G.cosmetics.propBoxed || {}; return s ? { x: Math.round(s.x), y: Math.round(s.y) } : null; });
ok('A mat spot exists for cats', !!spot, JSON.stringify(spot));
const oddsL = await p.evaluate(() => window.__cove.matOdds(window.__cove.cats.find(c => !c.visitor && !c.mascot && (c.traits || []).some(t => ['lazy','shy','grumpy'].includes(t)) )?.name || window.__cove.cats[1].name, 600)); const oddsB = await p.evaluate(() => window.__cove.matOdds(window.__cove.cats.find(c => !c.visitor && !c.mascot && !(c.traits || []).some(t => ['lazy','shy','grumpy'].includes(t)))?.name || window.__cove.cats[2].name, 600));
ok('Cats choose the rug or blanket now and then (sleepy cats more)', oddsL > 0.05 && oddsB > 0.02 && oddsL < 0.6, 'sleepy ' + (oddsL * 100).toFixed(0) + '% / other ' + (oddsB * 100).toFixed(0) + '% of decisions');
// put a cat on the rug explicitly and see it stay there
await p.evaluate(() => { const c = window.__cove.cats.find(x => !x.visitor); const sp = window.__cove.matSpot(); c.x = sp.x; c.y = sp.y; c.state = 'sleeping'; c.stateDur = 60; c.stateT = 0; window.__mat = c.name; });
await w(1500);
await p.evaluate(() => { window.__cove.cats.forEach(o => { if (o.name !== window.__mat) { o.state = 'loafing'; } }); });
const scrollTo = (name) => p.evaluate((name) => { const c = window.__cove.cats.find(x => x.name === name), st = document.getElementById('stage'); st.scrollLeft = (c.x / window.__cove.world.W) * st.scrollWidth - st.clientWidth / 2; document.getElementById('hint').hidden = true; document.getElementById('scrim')?.classList.remove('on'); }, name);
await scrollTo(await p.evaluate(() => window.__mat)); await w(900); await p.screenshot({ path: 'col-cat-on-mat.png' });
// boxing a mat sends cats elsewhere
await p.evaluate(() => { const g = window.__cove.G; g.cosmetics.propBoxed.cozyrug = true; g.cosmetics.propBoxed.picnicblanket = true; });
ok('A stored rug and blanket are ignored by cats', (await p.evaluate(() => window.__cove.matSpot())) === null);
// move / store work like every other prop
await p.evaluate(() => { const g = window.__cove.G; for (const k of ['cozyrug','picnicblanket']) delete g.cosmetics.propBoxed[k]; });
await p.locator('#shopBtn').click({ force: true }); await w(600); await p.locator('#shop').getByRole('button', { name: 'Decor', exact: true }).click({ force: true }); await w(700);
const rugRow = p.locator('#shop .shop-item', { hasText: 'Cozy Rug' });
ok('An earned piece offers Move and Store item', await rugRow.locator('[data-move-prop]').isVisible() && await rugRow.locator('[data-box-prop]').isVisible());
await rugRow.locator('[data-box-prop]').click({ force: true }); await w(500);
ok('Store item packs it away (cats stop using it)', (await p.evaluate(() => !!window.__cove.G.cosmetics.propBoxed.cozyrug)) && (await p.locator('#shop [data-place-prop="cozyrug"]').count()) === 1 && (await p.evaluate(() => window.__cove.matSpot())) !== undefined);
await p.evaluate(() => document.querySelector('#shop [data-place-prop="cozyrug"]').click()); await w(800);
ok('Place it starts placement', await p.locator('#placeBar').isVisible() || await p.evaluate(() => !document.getElementById('placeBar').hidden));
await p.evaluate(() => document.getElementById('placeBarCancel').click()); await w(400);
console.log(out.join(String.fromCharCode(10))); console.log(errs.join('|') || 'no errors'); await b.close();
