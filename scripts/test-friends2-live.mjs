// Hosted API test for neo_friends2 (gifts, hearts, cards, cove card). Uses the publishable key and throwaway anonymous accounts only.
// Run: node scripts/test-friends2-live.mjs   (creates 3 anonymous test accounts; nothing else is touched)
const URL_ = 'https://gbkkiejmqocbijhnzoxg.supabase.co', KEY = 'sb_publishable_WWIQb4Oearl1lIyXwifNCg_foWu1aFv';
const post = async (path, body, token) => { const r = await fetch(URL_ + path, { method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(body) }); let j = null; try { j = await r.json(); } catch { } return { s: r.status, j }; };
const out = []; let fails = 0;
const ok = (n, c, x = '') => { if (!c) fails++; out.push(`${c ? 'PASS' : 'FAIL'}  ${n}${x ? '  — ' + x : ''}`); };
async function account(name) {
  const su = await post('/auth/v1/signup', { data: {} }); const t = su.j.access_token;
  const social = (action, payload = {}) => post('/rest/v1/rpc/neo_social', { action, payload }, t);
  const f2 = (action, payload = {}) => post('/rest/v1/rpc/neo_friends2', { action, payload }, t);
  const j = await social('join', { name }); return { t, social, f2, code: j.j.code, name };
}
const err = r => r.s >= 400 ? (r.j?.message || '') : '';
const A = await account('Alpha Test Cove'), B = await account('Beta Test Cove'), C = await account('Gamma Test Cove');
ok('Three guests joined', A.code && B.code && C.code);

// ---- find
let r = await A.f2('find', { q: B.code }); ok('Find by exact code', r.s === 200 && r.j.name === 'Beta Test Cove', JSON.stringify(r.j));
const tag = B.code.slice(-4);
r = await A.f2('find', { q: 'Beta Test#' + tag }); ok('Find by name#tag (without the word Cove)', r.s === 200 && r.j.code === B.code, JSON.stringify(r.j));
r = await A.f2('find', { q: 'Beta Test Cove#' + tag.toLowerCase() }); ok('Find by full name#tag, any case', r.s === 200 && r.j.code === B.code);
r = await A.f2('find', { q: A.code }); ok('Cannot find yourself', r.s >= 400 && /No Cove found/.test(err(r)), err(r));
r = await A.f2('find', { q: 'nope' }); ok('Too-short search is rejected', r.s >= 400, err(r));
r = await A.f2('find', { q: 'ZZZZZZZZZZZZ' }); ok('Unknown code says no Cove found', r.s >= 400 && /No Cove found/.test(err(r)));

// ---- not friends yet: nothing works
r = await A.f2('state'); ok('State loads for a new player', r.s === 200 && r.j.friends.length === 0 && r.j.inbox.length === 0 && r.j.me.code === A.code && r.j.me.tag === A.code.slice(-4), JSON.stringify(r.j).slice(0, 160));
const bId = (await (async () => { await A.social('request', { code: B.code }); const st = await B.f2('state'); return st.j.requests[0]?.id; })());
ok('Invitation shows up for the recipient', !!bId);
const aId = bId;
r = await B.f2('state'); ok('Recipient sees who invited them', r.j.requests[0].name === 'Alpha Test Cove');
r = await A.f2('state'); ok('Sender sees the pending invitation', r.j.pending.length === 1);
// find B's id from A's side after accept
r = await A.f2('gift', { id: aId, amount: 50 }); ok('No gifts to a stranger (bad id)', r.s >= 400);
r = await B.f2('gift', { id: aId, amount: 50 }); ok('No gifts while the invitation is pending', r.s >= 400 && /Accept/.test(err(r)), err(r));
r = await B.social('accept', { id: aId }); ok('Recipient accepts', r.s === 200);
const aSt = await A.f2('state'), bSt = await B.f2('state');
const bIdFromA = aSt.j.friends[0]?.id; ok('Friendship appears on both sides', aSt.j.friends.length === 1 && bSt.j.friends.length === 1);

// ---- cove card
const card = { cats: [{ name: 'Biscuit', coatKey: 'orangewhite', star: 3, markSeed: 1234, worn: ['cap'] }, { name: 'Juno<script>', coatKey: 'tux edo!', star: 99, markSeed: 5.7, worn: [] }], team: [0, 1, 9], guardian: 1, theme: 'sea side', cafe: { name: 'Alpha Beans', shopTier: 1, finish: 'blue', speed: 1, seats: 1, cookware: true, decor: { flowerbox: true, hacker: true, fountain: true }, served: 312, rating: 4.66, menu: ['coffee', 'tea'] }, junk: 'x'.repeat(50) };
r = await A.f2('publish_card', { card }); ok('Publish a cove card', r.s === 200, err(r));
r = await B.f2('state'); const got = r.j.friends[0]?.card;
ok('Friend sees the card, sanitised', got && got.cats.length === 2 && got.cats[1].star === 5 && got.cats[1].coatKey === 'tuxedo' && got.cats[1].markSeed === 5 && got.team.length === 3 && got.team[2] === 7 && got.guardian === 1 && got.theme === 'seaside' && !('junk' in got), JSON.stringify(got).slice(0, 200));
ok('Café is sanitised (unknown décor dropped, rating rounded)', got.cafe && got.cafe.decor.flowerbox && got.cafe.decor.fountain && !('hacker' in got.cafe.decor) && got.cafe.rating === 4.7 && got.cafe.name === 'Alpha Beans', JSON.stringify(got.cafe));
r = await C.f2('state'); ok('An unrelated player sees nothing of it', r.j.friends.length === 0);
r = await A.f2('publish_card', { card }); ok('Quick republish is skipped, not an error', r.s === 200 && r.j.skipped === true);
r = await A.f2('publish_card', { card: 'nope' }); ok('Bad card is rejected', r.s >= 400);

// ---- hearts, gifts, cards
r = await A.f2('gift', { id: bIdFromA, amount: 75 }); ok('Odd gift size is rejected', r.s >= 400 && /gift sizes/.test(err(r)));
r = await A.f2('gift', { id: bIdFromA, amount: 500 }); ok('Send 500', r.s === 200, err(r));
r = await A.f2('gift', { id: bIdFromA, amount: 250 }); ok('Send 250', r.s === 200, err(r));
r = await A.f2('gift', { id: bIdFromA, amount: 500 }); ok('Daily cap of 1,000 blocks the third gift', r.s >= 400 && /1,000 Shells a day/.test(err(r)), err(r));
r = await A.f2('love', { id: bIdFromA }); ok('Heart 1', r.s === 200, err(r));
r = await A.f2('love', { id: bIdFromA }); ok('Heart 2', r.s === 200, err(r));
r = await A.f2('love', { id: bIdFromA }); ok('Heart 3', r.s === 200, err(r));
r = await A.f2('love', { id: bIdFromA }); ok('Heart 4 is blocked', r.s >= 400 && /3 hearts/.test(err(r)), err(r));
r = await A.f2('card', { id: bIdFromA, text: 'Hacked message', style: 'sage' }); ok('Custom card text is rejected', r.s >= 400 && /card messages/.test(err(r)), err(r));
r = await A.f2('card', { id: bIdFromA, text: 'Lovely cove!', style: 'neon' }); ok('Unknown card colour is rejected', r.s >= 400, err(r));
r = await A.f2('card', { id: bIdFromA, text: 'Lovely cove!', style: 'butter' }); ok('Leave a card', r.s === 200, err(r));
r = await A.f2('card', { id: bIdFromA, text: 'Thinking of you', style: 'sage' }); ok('One card a day per friend', r.s >= 400 && /card today/.test(err(r)), err(r));
r = await C.f2('gift', { id: bIdFromA, amount: 50 }); ok('A stranger cannot send B a gift', r.s >= 400);
r = await A.f2('state'); ok('Sender state reflects today (sent 750, 3 hearts, card left)', r.j.sent === 750 && r.j.loveSent === 3 && r.j.cardsSent[bIdFromA] === true && r.j.received[bIdFromA] === 780, JSON.stringify({ sent: r.j.sent, love: r.j.loveSent, recv: r.j.received }));

// ---- inbox + claim
r = await B.f2('state'); ok('Recipient inbox has 3 hearts + 2 gifts + 1 card', r.j.inbox.length === 6 && r.j.inbox.filter(i => i.type === 'card').length === 1 && r.j.inbox.every(i => i.fromName === 'Alpha Test Cove'), String(r.j.inbox.length));
r = await B.f2('claim'); ok('Claim delivers 780 Shells and 1 card', r.s === 200 && r.j.shells === 780 && r.j.cards.length === 1 && r.j.cards[0].text === 'Lovely cove!' && r.j.cards[0].fromName === 'Alpha Test Cove', JSON.stringify(r.j));
r = await B.f2('claim'); ok('Claiming twice pays nothing', r.s === 200 && r.j.shells === 0 && r.j.cards.length === 0, JSON.stringify(r.j));
r = await B.f2('state'); ok('Inbox is empty afterwards', r.j.inbox.length === 0);
// ---- B sends back; recipient inbound cap
r = await B.f2('gift', { id: aId, amount: 1000 }); ok('B can gift A too', r.s === 200, err(r));
r = await A.f2('claim'); ok('A collects 1,000', r.j.shells === 1000);
// ---- privacy: block cuts everything
r = await B.social('block', { id: aId }); ok('Block works', r.s === 200);
r = await A.f2('gift', { id: bIdFromA, amount: 50 }); ok('No gifts after a block', r.s >= 400);
r = await A.f2('state'); ok('Blocked friend disappears from the circle', r.j.friends.length === 0);
console.log(out.join('\n')); console.log(fails ? `\n${fails} FAILED` : '\nALL PASSED');
process.exit(fails ? 1 : 0);
