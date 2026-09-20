import assert from 'node:assert/strict';
await import('../ui/cafe-engine.js');
const E = globalThis.CoveCafeEngine;
const g = { shells: 1000, homestead: { stock: { coffee: 50, catmint: 50, honey: 50, carrot: 50 } } };
E.unlock(g, 0); g.cafe.menu = ['coffee', 'tea']; g.cafe.discovered = ['coffee', 'tea']; g.cafe.open = true;
const day1 = new Date(2026, 8, 21, 9).getTime(), day2 = new Date(2026, 8, 22, 9).getTime();
let d = E.daily(g, day1);
assert(d && ['serve', 'special', 'earn'].includes(d.kind) && d.target > 0 && d.reward > 0, 'a goal exists');
assert.equal(d.progress, 0); assert.equal(d.done, false); assert.equal(E.claimDaily(g, day1), 0, 'nothing to claim before it is done');
assert.deepEqual(E.daily(g, day1 + 3600e3).kind, d.kind, 'stable for the whole day');
// serve guests: bump the counters the way settle() does
g.cafe.served += 15; g.cafe.revenue += 400; g.cafe.sales[d.special || 'coffee'] = (g.cafe.sales[d.special || 'coffee'] || 0) + 8;
d = E.daily(g, day1 + 7200e3); assert.equal(d.done, true, 'done after enough service (any kind)');
const before = g.shells; assert.equal(E.claimDaily(g, day1 + 7200e3), d.reward); assert.equal(g.shells, before + d.reward);
assert.equal(E.claimDaily(g, day1 + 7300e3), 0, 'cannot claim twice');
assert.equal(E.daily(g, day1 + 7300e3).claimed, true);
// next day: fresh goal, baselines reset, nothing carried over
const n = E.daily(g, day2); assert.equal(n.progress, 0); assert.equal(n.claimed, false);
// a one-drink menu can never be handed the "special" goal
const g2 = { shells: 1000, homestead: { stock: {} } }; E.unlock(g2, 0); g2.cafe.menu = ['coffee']; for (let i = 0; i < 40; i++) assert.notEqual(E.daily(g2, new Date(2026, 9, 1 + i, 9).getTime()).kind, 'special');
assert.equal(E.daily({ shells: 0, homestead: { stock: {} } }, day1), null, 'no goal before the café exists');
console.log('PASS: daily goal rotation, progress, one claim a day, next-day reset, no special goal on a one-drink menu.');
