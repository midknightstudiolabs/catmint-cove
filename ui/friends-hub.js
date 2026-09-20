// Cove Friends hub — the friendly front door: invite, cards, love, gifts, visits and friendly matches.
// Preview mode runs on a local sample circle (nothing is sent anywhere). The hosted backend plugs in behind the same `backend` shape.
const KEY = 'neo.friends.preview.v1', CARDS = 'neo.friends.cards.v1', SEEN = 'neo.friends.seen';
export const GIFT_STEPS = [50, 100, 250, 500, 1000], DAILY_CAP = 1000, LOVE_GIVE = 10, LOVE_DAILY = 3;
const PRESETS = ['Thinking of you', 'Lovely cove!', 'Your cats are the best', 'See you at the festival', 'Save me a sunny spot', 'Purrs from my cove'];
const STYLES = [{ k: 'sage', name: 'Sage', bg: '#e6ecd2', ink: '#395a45' }, { k: 'butter', name: 'Butter', bg: '#f6ecc4', ink: '#6b5a22' }, { k: 'sky', name: 'Sky', bg: '#dcebea', ink: '#2f5a63' }, { k: 'rose', name: 'Rose', bg: '#f4dfd6', ink: '#7a4438' }];
const today = () => new Date().toISOString().slice(0, 10);
const pretty = c => String(c).replace(/\s+/g, '').match(/.{1,4}/g)?.join(' ') || '';
const norm = s => String(s || '').toUpperCase().replace(/[^A-Z0-9#]/g, '');

// ---------- preview backend (sample circle, local only) ----------
const cat = (name, coatKey, star = 2, markSeed = 1000) => ({ name, coatKey, star, markSeed, worn: [] });
function sampleState() {
  const at = Date.now();
  return {
    v: 2, day: today(), sent: 0, loveSent: 0, cardsSent: {}, received: {}, pending: [],
    me: { code: 'K7QM2XPD9RTC' },
    friends: [
      { id: 'marlow', name: 'Marlow’s Cove', tag: '2041', theme: 'seaside', since: at - 9 * 864e5, cats: [cat('Biscuit', 'orangewhite', 3, 11), cat('Juno', 'tuxedo', 2, 22), cat('Pebble', 'greytab', 2, 33), cat('Mochi', 'siamese', 3, 44)], team: [0, 1, 2],
        cafe: { name: 'Marlow’s Beans', shopTier: 1, finish: 'blue', speed: 1, seats: 1, cookware: true, decor: { flowerbox: true, chalkboard: true, lights: true }, served: 312, rating: 4.7, menu: ['coffee', 'tea'] } },
      { id: 'juniper', name: 'Juniper’s Cove', tag: '7710', theme: 'meadow', since: at - 3 * 864e5, cats: [cat('Clover', 'calico', 3, 55), cat('Nib', 'black', 2, 66), cat('Suki', 'cream', 2, 77)], team: [0, 1, 2],
        cafe: { name: 'The Purring Cup', shopTier: 0, finish: 'rose', speed: 0, seats: 1, cookware: false, decor: { flowerbox: true, parasol: true }, served: 96, rating: 4.4, menu: ['coffee'] } },
    ],
    requests: [{ id: 'pip', name: 'Pip’s Cove', tag: '3391', cats: [cat('Toast', 'ginger', 2, 88), cat('Ziggy', 'browntab', 2, 99), cat('Moss', 'smoke', 3, 12)], team: [0, 1, 2], theme: 'default',
      cafe: { name: 'Pip’s Corner', shopTier: 0, finish: 'butter', speed: 0, seats: 0, cookware: false, decor: {}, served: 18, rating: null, menu: ['coffee'] } }],
    directory: [{ id: 'lark', name: 'Lark’s Cove', tag: '4821', code: 'LARK48210007', theme: 'autumn', cats: [cat('Maple', 'golden', 3, 5), cat('Fig', 'russian', 2, 6), cat('Wren', 'lynxpoint', 3, 7)], team: [0, 1, 2],
      cafe: { name: 'Maple & Moon', shopTier: 2, finish: 'cream', speed: 2, seats: 1, cookware: true, decor: { flowerbox: true, chalkboard: true, parasol: true, lights: true, statue: true, fountain: true }, served: 1204, rating: 4.9, menu: ['coffee', 'tea', 'midknight'] } }],
    inbox: [
      { id: 'g1', type: 'gift', from: 'marlow', fromName: 'Marlow’s Cove', amount: 50, at: at - 36e5 },
      { id: 'c1', type: 'card', from: 'juniper', fromName: 'Juniper’s Cove', text: 'Your cats are the best', style: 'butter', at: at - 5 * 36e5 },
    ],
  };
}
function loadState() {
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { }
  if (!s || s.v !== 2) s = sampleState();
  if (s.day !== today()) { s.day = today(); s.sent = 0; s.loveSent = 0; s.cardsSent = {}; s.received = {}; }
  return s;
}
const saveState = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { } };
function readCards() { try { return JSON.parse(localStorage.getItem(CARDS) || '[]'); } catch { return []; } }
function writeCards(list) { try { localStorage.setItem(CARDS, JSON.stringify(list.slice(0, 40))); } catch { } }

export function badgeCount() {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (!s) return localStorage.getItem(SEEN) ? 0 : 1; return (s.inbox || []).length + (s.requests || []).length; } catch { return 0; }
}

function makeBackend(api) {
  const s = loadState();
  const friend = id => s.friends.find(f => f.id === id);
  const receiveLeft = id => DAILY_CAP - (s.received[id] || 0);
  return {
    state: s,
    save: () => saveState(s),
    find(query) {
      const q = norm(query);
      if (q.length < 3) throw Error('Enter a friend’s code or their name and tag, like Lark#4821.');
      const hit = s.directory.find(d => norm(d.code) === q || norm(d.name.replace(/’s Cove/, '') + '#' + d.tag) === q || norm(d.name) === q);
      if (hit) { if (s.friends.some(f => f.id === hit.id)) throw Error(hit.name + ' is already in your circle.'); return hit; }
      if (q === norm(s.me.code)) throw Error('That is your own code. Share it with a friend instead.');
      throw Error('No Cove found. Check the code, or try the name and tag together (like Lark#4821).');
    },
    invite(f) {
      if (s.pending.includes(f.id)) throw Error('Invitation already sent. They just need to accept.');
      s.pending.push(f.id); saveState(s);
      setTimeout(() => { if (!s.pending.includes(f.id)) return; s.pending = s.pending.filter(x => x !== f.id); s.friends.push({ ...f, since: Date.now() }); s.directory = s.directory.filter(d => d.id !== f.id); saveState(s); api.refresh?.(); }, 3500);
    },
    accept(r) { s.requests = s.requests.filter(x => x.id !== r.id); s.friends.push({ ...r, since: Date.now() }); saveState(s); },
    decline(r) { s.requests = s.requests.filter(x => x.id !== r.id); saveState(s); },
    remove(f) { s.friends = s.friends.filter(x => x.id !== f.id); saveState(s); },
    love(f) {
      if (s.loveSent >= LOVE_DAILY) throw Error('You have sent ' + LOVE_DAILY + ' hearts today. More tomorrow.');
      if (receiveLeft(f.id) < LOVE_GIVE) throw Error(f.name + ' has received a lot today. Try again tomorrow.');
      s.loveSent++; s.received[f.id] = (s.received[f.id] || 0) + LOVE_GIVE; saveState(s);
    },
    gift(f, amount) {
      if (!GIFT_STEPS.includes(amount)) throw Error('Choose one of the gift sizes.');
      if (s.sent + amount > DAILY_CAP) throw Error('You can send up to ' + DAILY_CAP.toLocaleString() + ' Shells a day. ' + Math.max(0, DAILY_CAP - s.sent).toLocaleString() + ' left today.');
      if (amount > receiveLeft(f.id)) throw Error(f.name + ' can receive ' + Math.max(0, receiveLeft(f.id)).toLocaleString() + ' more today.');
      if (!api.spend(amount)) throw Error('You need ' + amount.toLocaleString() + ' Shells to send this.');
      s.sent += amount; s.received[f.id] = (s.received[f.id] || 0) + amount; saveState(s);
    },
    card(f, text, style) {
      if (s.cardsSent[f.id]) throw Error('You left ' + f.name + ' a card today. Another tomorrow.');
      if (!PRESETS.includes(text)) throw Error('Pick one of the card messages.');
      s.cardsSent[f.id] = true; saveState(s);
    },
    claimAll() {
      let shells = 0, cards = 0; const keep = [];
      const got = readCards();
      for (const i of s.inbox) {
        if (i.type === 'gift') { shells += i.amount; }
        else if (i.type === 'card') { cards++; got.unshift({ id: i.id, kind: 'card', fromName: i.fromName, text: i.text, style: i.style, at: i.at }); }
      }
      s.inbox = keep; saveState(s); writeCards(got);
      if (shells) api.add(shells);
      return { shells, cards };
    },
    sentLeft: () => Math.max(0, DAILY_CAP - s.sent),
    heartsLeft: () => Math.max(0, LOVE_DAILY - s.loveSent),
    receiveLeft,
  };
}

// ---------- tiny DOM helpers ----------
function h(tag, props, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(String(c)));
  return e;
}
const btn = (text, fn, cls = '') => h('button', { class: 'fh-btn ' + cls, type: 'button', onclick: fn }, text);

// ---------- the hub ----------
let dialog = null, be = null, api = null, route = { name: 'home' }, sceneStop = () => { };
function ensureCss() {
  if (document.getElementById('fh-css')) return;
  const l = document.createElement('link'); l.id = 'fh-css'; l.rel = 'stylesheet'; l.href = 'ui/friends-hub.css?v=4'; document.head.append(l);
}
function shell(title, sub, opts = {}) {
  sceneStop();
  dialog.replaceChildren();
  const head = h('header', { class: 'fh-head' },
    opts.back ? btn('‹ Back', () => go(...[].concat(opts.back)), 'fh-back') : null,
    h('div', { class: 'fh-title' }, h('h2', { text: title }), sub ? h('p', { class: 'fh-sub', text: sub }) : null),
    btn('Close', () => dialog.close(), 'fh-x'));
  const body = h('div', { class: 'fh-body' });
  const status = h('p', { class: 'fh-status', role: 'status' });
  dialog.append(head, body, status);
  body.status = msg => { status.textContent = msg || ''; };
  return body;
}
function go(name, data) { route = { name, data }; ({ home, inbox, visit, gift, card, match, added, cafe })[name](data); dialog.scrollTop = 0; dialog.querySelector('.fh-body')?.scrollTo?.(0, 0); }
export function refresh() { if (dialog?.open && route.name === 'home') home(); }
function celebrate(text, kind = 'heart') {
  api.sound?.(kind);
  dialog.querySelector('.fh-thanks')?.remove();
  const t = h('div', { class: 'fh-thanks', role: 'status' }, h('span', { class: 'fh-pop', 'aria-hidden': 'true', text: kind === 'heart' ? '♥' : '★' }), h('span', { text }));
  dialog.append(t); setTimeout(() => t.remove(), 4200);
  const s = dialog.querySelector('.fh-status'); if (s) s.textContent = '';
}
const attempt = (body, fn) => { try { fn(); return true; } catch (e) { body.status(e.message || 'That did not work. Please try again.'); return false; } };

function avatar(friend, size = 56) {
  const c = h('canvas', { width: size, height: Math.round(size * .86), class: 'fh-av', 'aria-hidden': 'true' });
  const k = friend.cats?.[0]; if (k) requestAnimationFrame(() => api.miniCat(c, k.coatKey, k.star));
  return c;
}
const teamNames = f => (f.team || [0, 1, 2]).map(i => f.cats[i]?.name).filter(Boolean);

function home() {
  const body = shell('Cove Friends', 'A small circle. A place to drop by.');
  body.append(h('p', { class: 'fh-preview', text: 'Preview · sample friends. Nothing is sent to anyone yet.' }));
  const invite = new URLSearchParams(location.search).get('friend');
  const link = 'https://midknightstudiolabs.github.io/catmint-cove-neo/?friend=' + be.state.me.code;
  const mine = h('section', { class: 'fh-card fh-invite' },
    h('span', { class: 'fh-kicker', text: 'YOUR INVITE' }), h('strong', { class: 'fh-code', text: pretty(be.state.me.code) }),
    h('div', { class: 'fh-row' },
      btn('Share invite', async () => { const text = 'Come visit my cove in Catmint Cove! My code is ' + pretty(be.state.me.code) + ' — ' + link; try { if (navigator.share) await navigator.share({ title: 'Catmint Cove', text }); else { await navigator.clipboard.writeText(text); body.status('Invite copied. Paste it to a friend.'); } } catch { } }, 'primary'),
      btn('Copy code', async () => { try { await navigator.clipboard.writeText(pretty(be.state.me.code)); body.status('Code copied.'); } catch { body.status('Could not copy. Your code is ' + pretty(be.state.me.code) + '.'); } })));
  body.append(mine);
  const myCafe = api.myCafe?.();
  if (myCafe) body.append(h('button', { class: 'fh-card fh-mycafe', type: 'button', onclick: () => go('cafe', 'me') }, h('span', { class: 'fh-cup', 'aria-hidden': 'true', text: '☕' }), h('div', { class: 'fh-grow' }, h('strong', { text: myCafe.name || 'Your café' }), h('small', { text: 'See how friends see your café ›' }))));

  const found = h('div', { class: 'fh-found' });
  const field = h('input', { type: 'text', id: 'fh-find', maxlength: '24', autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', placeholder: 'Friend’s code or name#tag', 'aria-label': 'Friend’s code or name and tag' });
  if (invite && invite !== be.state.me.code) field.value = invite;
  const doFind = () => {
    found.replaceChildren();
    attempt(body, () => {
      const f = be.find(field.value); body.status('');
      found.append(h('div', { class: 'fh-card fh-match' }, avatar(f), h('div', { class: 'fh-grow' }, h('strong', { text: f.name }), h('small', { text: f.cats.length + ' cats · #' + f.tag })),
        btn('Send invite', () => { attempt(body, () => { be.invite(f); found.replaceChildren(h('p', { class: 'fh-ok', text: 'Invite sent to ' + f.name + '. They just need to accept.' })); field.value = ''; }); }, 'primary')));
    });
  };
  field.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); doFind(); } });
  body.append(h('section', { class: 'fh-add' }, h('label', { for: 'fh-find', text: 'Add a friend' }), h('div', { class: 'fh-row fh-find' }, field, btn('Find', doFind, 'primary')), h('p', { class: 'fh-hint', text: 'Preview tip: try Lark#4821' }), found));

  const gifts = be.state.inbox.filter(i => i.type === 'gift').length, cards = be.state.inbox.filter(i => i.type === 'card').length;
  if (gifts || cards) body.append(h('button', { class: 'fh-banner', type: 'button', onclick: () => go('inbox') }, h('span', { class: 'fh-dot' }), h('b', { text: [gifts && gifts + (gifts === 1 ? ' gift' : ' gifts'), cards && cards + (cards === 1 ? ' card' : ' cards')].filter(Boolean).join(' and ') + ' waiting' }), h('span', { text: 'Open ›' })));

  if (be.state.requests.length) {
    body.append(h('h3', { text: 'Wants to be friends' }));
    for (const r of be.state.requests) body.append(h('div', { class: 'fh-card fh-req' }, avatar(r), h('div', { class: 'fh-grow' }, h('strong', { text: r.name }), h('small', { text: r.cats.length + ' cats · #' + r.tag })),
      h('div', { class: 'fh-row' }, btn('Accept', () => { be.accept(r); home(); }, 'primary'), btn('Not now', () => { be.decline(r); home(); }))));
  }

  body.append(h('h3', { text: be.state.friends.length ? 'Your circle' : 'Your circle is quiet' }));
  if (!be.state.friends.length) body.append(h('p', { class: 'fh-sub', text: 'Share your invite above, or add a friend with their code.' }));
  for (const f of be.state.friends) {
    body.append(h('article', { class: 'fh-card fh-friend' }, avatar(f, 64),
      h('div', { class: 'fh-grow' }, h('strong', { text: f.name }), h('small', { text: f.cats.length + ' cats · ' + (f.cats.length >= 3 ? 'ready for a match' : 'growing their team') })),
      h('div', { class: 'fh-actions' }, btn('Visit', () => go('visit', f.id), 'primary'),
        h('button', { class: 'fh-btn fh-heart', type: 'button', 'aria-label': 'Send a heart. ' + f.name + ' gets ' + LOVE_GIVE + ' Shells.', title: 'Send a heart · they get ' + LOVE_GIVE + ' Shells', onclick: () => { attempt(body, () => { be.love(f); celebrate('Thanks for the love! ' + f.name + ' gets ' + LOVE_GIVE + ' Shells.'); }); } }, '♥'),
        btn('Gift', () => go('gift', f.id)))));
  }
  if (!localStorage.getItem(SEEN)) localStorage.setItem(SEEN, '1');
  body.append(h('p', { class: 'fh-foot', text: 'Only friends you accept can visit. Your balances, purchases and save file stay private.' }));
}

function inbox() {
  const body = shell('Waiting for you', 'Gifts and cards from your circle.', { back: 'home' });
  if (!be.state.inbox.length) { body.append(h('p', { class: 'fh-sub', text: 'Nothing waiting. Cards land here and in your Journal.' })); return; }
  let total = 0;
  for (const i of be.state.inbox) {
    if (i.type === 'gift') { total += i.amount; body.append(h('div', { class: 'fh-card' }, h('strong', { text: i.fromName + ' sent you ' + i.amount + ' Shells' }), h('small', { text: 'A gift, no strings attached.' }))); }
    else body.append(cardView(i));
  }
  body.append(btn('Collect everything' + (total ? ' · +' + total + ' Shells' : ''), () => { const r = be.claimAll(); go('home'); dialog.querySelector('.fh-status').textContent = (r.shells ? '+' + r.shells + ' Shells. ' : '') + (r.cards ? r.cards + ' card' + (r.cards === 1 ? '' : 's') + ' added to your Journal.' : ''); }, 'primary'));
}
function cardView(c) {
  const st = STYLES.find(s => s.k === c.style) || STYLES[0];
  return h('div', { class: 'fh-postcard', style: 'background:' + st.bg + ';color:' + st.ink }, h('small', { text: 'FROM ' + String(c.fromName || '').toUpperCase() }), h('strong', { text: '“' + c.text + '”' }));
}

const CAFE_TIERS = ['Little Kiosk', 'Garden Café', 'Seaside Café'];
const DECOR_NAMES = { flowerbox: 'Flower boxes', chalkboard: 'Chalkboard sign', parasol: 'Parasol table', lights: 'String lights', statue: 'Midknight statue', fountain: 'Fountain' };
const heartsLine = () => be.heartsLeft() + (be.heartsLeft() === 1 ? ' heart' : ' hearts') + ' left today · each one gives your friend ' + LOVE_GIVE + ' Shells';
function visit(id) {
  const f = be.state.friends.find(x => x.id === id); if (!f) return go('home');
  const body = shell(f.name, 'Visiting · a saved look at their cove', { back: 'home' });
  const cv = h('canvas', { class: 'fh-scene', width: 720, height: 360, role: 'img', 'aria-label': f.name + ' with ' + f.cats.length + ' cats' });
  body.append(cv);
  const themes = { default: ['#dce8db', '#8ea577'], meadow: ['#e2edd4', '#93b06d'], seaside: ['#cfe3e2', '#c9bb92'], autumn: ['#efdcc0', '#b98a55'], frost: ['#dfe9ee', '#dfe6ea'] };
  const [sky, ground] = themes[f.theme] || themes.default;
  const spots = f.cats.slice(0, 6).map((k, i, a) => ({ k, x: 110 + i * (500 / Math.max(1, a.length - 1 || 1)) * (a.length > 1 ? 1 : 0) + (a.length === 1 ? 250 : 0), y: 262 + (i % 2) * 40, ph: i * 0.9 }));
  let raf = 0, stop = false;
  const paint = t => {
    if (stop || !cv.isConnected) return; raf = requestAnimationFrame(paint);
    const g = cv.getContext('2d'); g.fillStyle = sky; g.fillRect(0, 0, 720, 360); g.fillStyle = ground; g.fillRect(0, 210, 720, 150);
    g.fillStyle = '#ffffff55'; g.beginPath(); g.ellipse(120, 70, 60, 16, 0, 0, 7); g.ellipse(580, 96, 70, 18, 0, 0, 7); g.fill();
    for (const s of spots) api.drawCat(g, s.k, s.x, s.y, 2.1, t + s.ph * 700);
  };
  raf = requestAnimationFrame(paint); sceneStop = () => { stop = true; cancelAnimationFrame(raf); };
  body.append(h('p', { class: 'fh-team', text: 'Their usual team: ' + (teamNames(f).join(', ') || '—') }));
  body.append(h('div', { class: 'fh-grid' },
    h('button', { class: 'fh-btn primary fh-loveBtn', type: 'button', onclick: () => attempt(body, () => { be.love(f); celebrate('Thanks for the love! ' + f.name + ' gets ' + LOVE_GIVE + ' Shells.'); dialog.querySelector('.fh-hearts').textContent = heartsLine(); }) }, h('span', { text: '♥ Send love' }), h('small', { text: '+' + LOVE_GIVE + ' for them' })),
    btn('Send a gift', () => go('gift', f.id)), btn('Leave a card', () => go('card', f.id))));
  if (f.cafe) body.append(btn('☕ Visit ' + (f.cafe.name || 'their café'), () => go('cafe', f.id), 'fh-cafeBtn'));
  body.append(h('p', { class: 'fh-hint fh-hearts', text: heartsLine() }));
  body.append(h('h3', { text: 'Friendly match' }), h('p', { class: 'fh-sub', text: 'Play their team, just for fun.' }),
    h('div', { class: 'fh-grid fh-two' }, btn('Volleyball', () => go('match', { id: f.id, kind: 'volley' })), btn('Tug of Paws', () => go('match', { id: f.id, kind: 'tug' }))));
  body.append(btn('Remove from circle', () => { if (confirm('Remove ' + f.name + ' from your circle?')) { be.remove(f); go('home'); } }, 'fh-quiet'));
}

function gift(id) {
  const f = be.state.friends.find(x => x.id === id); if (!f) return go('home');
  const body = shell('Send a gift to ' + f.name, 'They receive exactly what you send.', { back: ['visit', f.id] });
  body.append(h('p', { class: 'fh-balance', text: 'You have ' + Math.floor(api.shells()).toLocaleString() + ' Shells · you can send ' + be.sentLeft().toLocaleString() + ' more today' }));
  let pick = null; const grid = h('div', { class: 'fh-chips', role: 'radiogroup', 'aria-label': 'Gift size' }); const go2 = btn('Choose an amount', () => { }, 'primary');
  go2.disabled = true;
  const draw = () => { grid.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(Number(b.dataset.a) === pick))); go2.textContent = pick ? 'Send ' + pick.toLocaleString() + ' Shells' : 'Choose an amount'; go2.disabled = !pick; };
  for (const a of GIFT_STEPS) { const b = h('button', { class: 'fh-chip', type: 'button', role: 'radio', 'data-a': a, 'aria-checked': 'false', onclick: () => { pick = a; draw(); } }, h('b', { text: a.toLocaleString() }), h('small', { text: 'Shells' })); if (api.shells() < a) b.classList.add('short'); grid.append(b); }
  go2.onclick = () => attempt(body, () => { be.gift(f, pick); go('visit', f.id); celebrate('Thanks for the gift! ' + f.name + ' gets ' + pick.toLocaleString() + ' Shells.', 'gift'); });
  body.append(grid, go2, h('p', { class: 'fh-foot', text: 'Up to ' + DAILY_CAP.toLocaleString() + ' Shells a day each way. Gifts land in their Waiting box.' }));
}

function card(id) {
  const f = be.state.friends.find(x => x.id === id); if (!f) return go('home');
  const body = shell('Leave a card', 'It shows up in ' + f.name + '’s Journal with your cove name.', { back: ['visit', f.id] });
  let text = PRESETS[0], style = STYLES[0].k;
  const prev = h('div', { class: 'fh-preview-card' }); const draw = () => { prev.replaceChildren(cardView({ fromName: api.coveName(), text, style })); };
  const msgs = h('div', { class: 'fh-list', role: 'radiogroup', 'aria-label': 'Card message' }); const sw = h('div', { class: 'fh-swatches', role: 'radiogroup', 'aria-label': 'Card colour' });
  const mark = () => { msgs.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.textContent === text))); sw.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.k === style))); };
  for (const p of PRESETS) msgs.append(h('button', { type: 'button', role: 'radio', class: 'fh-opt', 'aria-checked': 'false', onclick: () => { text = p; draw(); mark(); } }, p));
  for (const s of STYLES) sw.append(h('button', { type: 'button', role: 'radio', class: 'fh-sw', 'data-k': s.k, 'aria-label': s.name, 'aria-checked': 'false', style: 'background:' + s.bg + ';border-color:' + s.ink, onclick: () => { style = s.k; draw(); mark(); } }));
  draw(); mark(); body.append(prev, msgs, sw, btn('Leave card', () => attempt(body, () => { be.card(f, text, style); go('visit', f.id); dialog.querySelector('.fh-status').textContent = 'Card left for ' + f.name + '.'; }), 'primary'));
}

function match(d) {
  const f = be.state.friends.find(x => x.id === d.id); if (!f) return go('home');
  const name = d.kind === 'volley' ? 'Volleyball' : 'Tug of Paws';
  const body = shell('Friendly ' + name, 'You against ' + f.name, { back: ['visit', f.id] });
  body.append(h('div', { class: 'fh-card' }, h('strong', { text: 'Their team' }), h('small', { text: teamNames(f).join(' · ') }), h('p', { class: 'fh-sub', text: d.kind === 'volley' ? 'Pick your own three cats next. Their usual team plays against you.' : 'Pick your team next. Their usual team pulls against you.' })));
  body.append(btn('Choose my team', () => { dialog.close(); api.startMatch(d.kind, { id: f.id, name: f.name, cats: f.cats, team: f.team }); }, 'primary'), h('p', { class: 'fh-foot', text: 'A friendly match is just for fun. The result is saved to your Journal.' }));
}
function added() { home(); }
// A café, as visitors see it: the real outside scene with the owner's name, finish, shop stage and décor.
function cafe(id) {
  const mine = id === 'me', f = mine ? null : be.state.friends.find(x => x.id === id);
  const data = mine ? api.myCafe?.() : f?.cafe;
  if (!data) return go(mine ? 'home' : 'visit', mine ? undefined : id);
  const owner = mine ? api.coveName() : f.name;
  const body = shell(data.name || 'Catmint Café', mine ? 'This is how friends see your café' : 'Visiting ' + owner, { back: mine ? ['home'] : ['visit', id] });
  const cv = h('canvas', { class: 'fh-scene', width: 720, height: 380, role: 'img', 'aria-label': (data.name || 'Café') + ', ' + CAFE_TIERS[data.shopTier || 0] });
  body.append(cv);
  const guests = mine ? (api.myCats?.() || []) : (f.cats || []);
  let raf = 0, stop = false;
  const paint = t => { if (stop || !cv.isConnected) return; raf = requestAnimationFrame(paint); api.drawCafe(cv.getContext('2d'), data, t, 380, (mine ? 'me' : id), guests); };
  raf = requestAnimationFrame(paint); sceneStop = () => { stop = true; cancelAnimationFrame(raf); };
  const decor = Object.keys(data.decor || {}).filter(k => data.decor[k]);
  body.append(h('div', { class: 'fh-cafe-stats' },
    h('div', {}, h('b', { text: data.rating ? '★ ' + Number(data.rating).toFixed(1) : '★ —' }), h('small', { text: 'guest rating' })),
    h('div', {}, h('b', { text: Number(data.served || 0).toLocaleString() }), h('small', { text: 'drinks served' })),
    h('div', {}, h('b', { text: CAFE_TIERS[data.shopTier || 0] }), h('small', { text: 'shop stage' }))));
  body.append(h('p', { class: 'fh-team', text: decor.length ? 'Outdoor décor: ' + decor.map(k => DECOR_NAMES[k] || k).join(' · ') : 'No outdoor décor yet.' }));
  if (!mine) body.append(h('div', { class: 'fh-grid fh-two' }, btn('Leave a card', () => go('card', id), 'primary'), btn('Back to their cove', () => go('visit', id))));
  else body.append(btn('Back', () => go('home')));
}

export function open(gameApi) {
  api = gameApi; ensureCss();
  be = makeBackend({ ...api, refresh });
  if (!dialog) { dialog = h('dialog', { class: 'fh-sheet', 'aria-label': 'Cove Friends' }); document.body.append(dialog); dialog.addEventListener('close', () => sceneStop()); }
  go('home'); if (!dialog.open) dialog.showModal();
}

// Cards and match results, for the Journal.
export function journalSection() {
  const list = readCards(); if (!list.length) return null;
  const sec = h('section', { class: 'fh-journal', 'aria-label': 'From your friends' }, h('h3', { text: 'From your friends' }));
  for (const c of list.slice(0, 5)) {
    if (c.kind === 'result') sec.append(h('div', { class: 'fh-result' }, h('small', { text: 'FRIENDLY ' + (c.game || '').toUpperCase() }), h('strong', { text: c.text })));
    else sec.append(cardView(c));
  }
  return sec;
}
export function recordResult(entry) { const list = readCards(); list.unshift({ id: 'r' + Date.now(), kind: 'result', at: Date.now(), ...entry }); writeCards(list); }
