// Cove Friends — hosted transport. Same shape as the preview backend in friends-hub.js, but every action goes to the
// server (neo_social / neo_friends2). Shells never live on the server: it only meters daily caps and delivers.
// Session storage is shared with cove-friends.js (same key), so a player who already joined stays joined.
import { socialConfig } from './social-config.js';

const SESSION = 'neo.friends.session', BADGE = 'neo.friends.badge', PUB = 'neo.friends.pub', CARDS = 'neo.friends.cards.v1';
export const GIFT_STEPS = [50, 100, 250, 500, 1000], DAILY_CAP = 1000, LOVE_GIVE = 10, LOVE_DAILY = 3;

let session = null, refreshing = null;
try { session = JSON.parse(localStorage.getItem(SESSION) || 'null'); } catch { }
function keep(s) { const next = { access_token: s.access_token, refresh_token: s.refresh_token, expires_at: s.expires_at ? s.expires_at * 1000 : Date.now() + s.expires_in * 1000 }; localStorage.setItem(SESSION, JSON.stringify(next)); session = next; }

async function request(path, data, token) {
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
  try {
    const r = await fetch(socialConfig.url + path, { method: 'POST', headers: { apikey: socialConfig.key, 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: JSON.stringify(data), signal: controller.signal });
    let result = null; try { result = await r.json(); } catch { }
    if (!r.ok) { const error = Error(result?.msg || result?.message || 'Please try again in a moment.'); error.status = r.status; throw error; }
    return result;
  } catch (e) {
    if (e.name === 'AbortError' || e instanceof TypeError) throw Error('Could not connect. Your Cove is safe on this device. Please try again.');
    throw e;
  } finally { clearTimeout(timer); }
}
async function token() {
  if (!session) throw Error('Please sign in first.');
  if (session.expires_at < Date.now() + 60000) {
    if (!refreshing) refreshing = request('/auth/v1/token?grant_type=refresh_token', { refresh_token: session.refresh_token }).then(keep).catch(e => { if (e.status === 400 || e.status === 401) throw Error('This Friends session needs recovery. Open Account & recovery from Friends.'); throw e; }).finally(() => { refreshing = null; });
    await refreshing;
  }
  return session.access_token;
}
const social = async (action, payload = {}) => request('/rest/v1/rpc/neo_social', { action, payload }, await token());
const f2 = async (action, payload = {}) => request('/rest/v1/rpc/neo_friends2', { action, payload }, await token());

export const hasSession = () => !!session;
export function badgeCount() { try { return Number(localStorage.getItem(BADGE) || 0); } catch { return 0; } }
const setBadge = n => { try { localStorage.setItem(BADGE, String(n)); } catch { } };
function readCards() { try { return JSON.parse(localStorage.getItem(CARDS) || '[]'); } catch { return []; } }
function writeCards(list) { try { localStorage.setItem(CARDS, JSON.stringify(list.slice(0, 40))); } catch { } }

// Server rows → the shape the hub screens already use (friends without a shared card just have no cats yet).
const person = row => ({ id: row.id, name: row.name, tag: row.tag, since: row.since, cats: row.card?.cats || [], team: row.card?.team?.length ? row.card.team : [0, 1, 2], guardian: row.card?.guardian ?? 0, theme: row.card?.theme || 'default', cafe: row.card?.cafe || null });

export function create(api) {
  const s = { v: 3, day: '', sent: 0, loveSent: 0, cardsSent: {}, received: {}, pending: [], me: { code: '', name: '', tag: '' }, friends: [], requests: [], directory: [], inbox: [] };
  const friend = id => s.friends.find(f => f.id === id);
  const receiveLeft = id => DAILY_CAP - (s.received[id] || 0);
  async function load() {
    const st = await f2('state');
    Object.assign(s, { me: st.me, sent: st.sent || 0, loveSent: st.loveSent || 0, cardsSent: st.cardsSent || {}, received: st.received || {}, pending: st.pending || [], inbox: st.inbox || [], friends: (st.friends || []).map(person), requests: (st.requests || []).map(r => person(r)) });
    setBadge(s.inbox.length + s.requests.length);
    return s;
  }
  const be = {
    hosted: true, state: s, save() { },
    // 'ready' | 'join'. A first-time player has no profile yet: the hub shows the welcome screen.
    async start() {
      if (!session) return 'join';
      try { await load(); return 'ready'; } catch (e) { if (/Choose your Cove name/.test(e.message)) return 'join'; throw e; }
    },
    async join(name) {
      const nm = String(name || '').trim().slice(0, 24); if (nm.length < 1) throw Error('Give your cove a name (1–24 characters).');
      if (!session) keep(await request('/auth/v1/signup', { data: {} }));
      await social('join', { name: nm }); await load();
    },
    async find(query) { const r = await f2('find', { q: String(query || '') }); return { id: null, name: r.name, tag: r.tag, code: r.code, cats: [] }; },
    async invite(f) { await social('request', { code: f.code }); await load(); },
    async accept(r) { await social('accept', { id: r.id }); await load(); },
    async decline(r) { await social('remove', { id: r.id }); await load(); },
    async remove(f) { await social('remove', { id: f.id }); await load(); },
    async love(f) { await f2('love', { id: f.id }); await load(); },
    async gift(f, amount) {
      if (!GIFT_STEPS.includes(amount)) throw Error('Choose one of the gift sizes.');
      if (api.shells() < amount) throw Error('You need ' + amount.toLocaleString() + ' Shells to send this.');
      await f2('gift', { id: f.id, amount });
      api.spend(amount);           // the server accepted it: now the Shells leave this device
      await load();
    },
    async card(f, text, style) { await f2('card', { id: f.id, text, style }); await load(); },
    async claimAll() {
      const r = await f2('claim'); const shells = r.shells || 0, cards = r.cards || [];
      if (shells) api.add(shells);   // credit straight away so a closed tab cannot lose it
      if (cards.length) { const got = readCards(); for (const c of cards) got.unshift({ id: 'c' + c.id, kind: 'card', fromName: c.fromName, text: c.text, style: c.style, at: c.at }); writeCards(got); }
      await load(); return { shells, cards: cards.length };
    },
    // Share this cove's cats, Guardian and café with accepted friends. Quiet: skips when nothing changed in the last few minutes.
    async publish(force) {
      const card = api.myCard?.(); if (!card) return;
      const sig = JSON.stringify(card); let last = null; try { last = JSON.parse(localStorage.getItem(PUB) || 'null'); } catch { }
      if (!force && last && last.sig === sig && Date.now() - last.at < 6 * 36e5) return;
      await f2('publish_card', { card }); try { localStorage.setItem(PUB, JSON.stringify({ sig, at: Date.now() })); } catch { }
    },
    sentLeft: () => Math.max(0, DAILY_CAP - s.sent),
    heartsLeft: () => Math.max(0, LOVE_DAILY - s.loveSent),
    receiveLeft, friend,
  };
  return be;
}

// A quiet check for the badge dot: only for players who already joined, so nobody is contacted before they opt in.
export async function pollBadge() {
  if (!socialConfig.enabled || !session) return badgeCount();
  try { const st = await f2('state'); const n = (st.inbox?.length || 0) + (st.requests?.length || 0); setBadge(n); return n; } catch { return badgeCount(); }
}
