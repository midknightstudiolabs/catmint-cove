// Adventure mini-clips — short looping scenes of your real cats on their trip (fishing, forest walk, meadow, market town).
// Pure drawing: `cat(g, i, x, y, scale, t, walking, face)` is supplied by the game so the cats are the real painted ones.
const TAU = Math.PI * 2;
const lerp = (a, b, u) => a + (b - a) * u, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function grad(g, y0, y1, c0, c1) { const r = g.createLinearGradient(0, y0, 0, y1); r.addColorStop(0, c0); r.addColorStop(1, c1); return r; }
function blob(g, x, y, rx, ry, col) { g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); }
function cloud(g, x, y, s, col = 'rgba(255,255,255,.85)') { blob(g, x, y, 34 * s, 11 * s, col); blob(g, x + 20 * s, y - 8 * s, 22 * s, 11 * s, col); blob(g, x - 18 * s, y - 5 * s, 18 * s, 9 * s, col); }
function tree(g, x, y, s, trunk, leaf, leaf2) { g.fillStyle = trunk; g.fillRect(x - 4 * s, y - 40 * s, 8 * s, 42 * s); blob(g, x, y - 62 * s, 30 * s, 34 * s, leaf); blob(g, x - 14 * s, y - 48 * s, 20 * s, 22 * s, leaf2); blob(g, x + 16 * s, y - 50 * s, 20 * s, 22 * s, leaf2); }
const wrap = (v, m) => ((v % m) + m) % m;

// ---------------- 1. fishing at the pier ----------------
function fishing(g, t, cat) {
  g.fillStyle = grad(g, 0, 190, '#bfe0ec', '#eaf3e4'); g.fillRect(0, 0, 720, 360);
  blob(g, 596, 62, 28, 28, '#fdf1c6'); blob(g, 596, 62, 44, 44, 'rgba(253,241,198,.35)');
  cloud(g, wrap(120 + t * 6, 900) - 90, 60, 1.1); cloud(g, wrap(420 + t * 4, 900) - 90, 100, .8);
  g.fillStyle = '#9fc2c9'; g.beginPath(); g.moveTo(0, 158); g.quadraticCurveTo(80, 128, 190, 150); g.lineTo(190, 165); g.lineTo(0, 165); g.fill();       // far headland
  g.fillStyle = grad(g, 160, 360, '#6fbfd8', '#3f93b8'); g.fillRect(0, 160, 720, 200);
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2;
  for (let i = 0; i < 9; i++) { const y = 180 + i * 19, x0 = wrap(i * 173 + t * (12 + i * 2), 820) - 100; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo(x0 + 30, y - 5, x0 + 60, y); g.stroke(); }
  // gulls
  g.strokeStyle = '#f7f4ee'; g.lineWidth = 2.2;
  for (const [ox, oy, sp] of [[0, 90, 22], [90, 120, 17]]) { const gx = wrap(ox + t * sp, 860) - 70, gy = oy + Math.sin(t * 1.4 + ox) * 8, fl = Math.sin(t * 7 + ox) * 4; g.beginPath(); g.moveTo(gx - 9, gy + fl); g.quadraticCurveTo(gx - 4, gy - 5, gx, gy); g.quadraticCurveTo(gx + 4, gy - 5, gx + 9, gy + fl); g.stroke(); }
  // pier
  g.fillStyle = '#7b5d3f'; for (const px of [420, 500, 580, 660]) g.fillRect(px, 262, 9, 96);
  g.fillStyle = '#a98358'; g.fillRect(380, 244, 340, 22); g.fillStyle = '#c29c6e'; g.fillRect(380, 244, 340, 6);
  g.strokeStyle = '#8a6a48'; g.lineWidth = 1.5; for (let x = 396; x < 720; x += 34) { g.beginPath(); g.moveTo(x, 250); g.lineTo(x, 266); g.stroke(); }
  // fisher cat + friend
  cat(g, 1, 470, 246, 2.0, t, false, 1);
  const fx = 585, fy = 246; cat(g, 0, fx, fy, 2.3, t, false, -1);
  // line, bobber, catch cycle (8s)
  const c = t % 8, bx = 366, by0 = 288, dip = c > 5 && c < 5.5 ? Math.sin((c - 5) / .5 * Math.PI) * 10 : 0, bob = Math.sin(t * 2.4) * 1.6 + dip;
  const tipX = fx - 66, tipY = fy - 96;
  g.strokeStyle = '#6a4d33'; g.lineWidth = 3; g.beginPath(); g.moveTo(fx - 22, fy - 34); g.lineTo(tipX, tipY); g.stroke();
  g.strokeStyle = 'rgba(40,40,40,.55)'; g.lineWidth = 1; g.beginPath(); g.moveTo(tipX, tipY); g.quadraticCurveTo(tipX - 60, tipY + 80, bx, by0 + bob); g.stroke();
  blob(g, bx, by0 + bob, 5, 5, '#e6685c'); g.fillStyle = '#fff'; g.fillRect(bx - 5, by0 + bob - 1, 10, 2.4);
  for (let r = 0; r < 2; r++) { const ph = (t * .5 + r * .5) % 1; g.strokeStyle = 'rgba(255,255,255,' + (.4 * (1 - ph)) + ')'; g.lineWidth = 1.5; g.beginPath(); g.ellipse(bx, by0 + 6, 8 + ph * 18, 3 + ph * 5, 0, 0, TAU); g.stroke(); }
  if (c > 5.5 && c < 6.9) { const u = (c - 5.5) / 1.4, fxp = lerp(bx, tipX - 18, u), fyp = by0 - Math.sin(u * Math.PI) * 130 + u * 30;   // the fish arcs up to the cat
    g.save(); g.translate(fxp, fyp); g.rotate(-.6 + u * 1.8); blob(g, 0, 0, 13, 6, '#f2a35e'); g.fillStyle = '#f2a35e'; g.beginPath(); g.moveTo(11, 0); g.lineTo(20, -6); g.lineTo(20, 6); g.fill(); blob(g, -6, -1, 1.6, 1.6, '#333'); g.restore();
    if (u < .25) for (let i = 0; i < 6; i++) blob(g, bx + (i - 2.5) * 5, by0 - (u * 70) + i, 2, 2, 'rgba(255,255,255,.8)'); }
  if (c > 6.9 && c < 7.9) { g.fillStyle = '#fff'; g.font = 'bold 20px Georgia'; g.textAlign = 'center'; g.globalAlpha = 1 - (c - 6.9); g.fillText('Got one!', fx - 30, fy - 118 - (c - 6.9) * 24); g.globalAlpha = 1; }
}

// ---------------- 2. forest walk ----------------
function forest(g, t, cat) {
  g.fillStyle = grad(g, 0, 360, '#dfeee0', '#b7d4b4'); g.fillRect(0, 0, 720, 360);
  const layer = (sp, y, s, c1, c2, count, seed) => { for (let i = 0; i < count; i++) { const x = wrap(i * (760 / count) + seed * 37 - t * sp, 760) - 20; tree(g, x, y, s, '#5d4632', c1, c2); } };
  layer(9, 240, .7, '#7fae86', '#8dbb92', 7, 1);
  layer(22, 262, 1.0, '#5f9a6d', '#6faa7b', 6, 2);
  // light shafts
  g.fillStyle = 'rgba(255,248,205,.16)'; for (let i = 0; i < 3; i++) { const sx = 120 + i * 220 + Math.sin(t * .3 + i) * 14; g.beginPath(); g.moveTo(sx, 0); g.lineTo(sx + 50, 0); g.lineTo(sx + 130, 300); g.lineTo(sx + 40, 300); g.fill(); }
  layer(48, 296, 1.5, '#3f7a52', '#4d8a5f', 4, 3);
  // path
  g.fillStyle = '#d5bf92'; g.beginPath(); g.moveTo(0, 292); g.quadraticCurveTo(360, 270, 720, 292); g.lineTo(720, 360); g.lineTo(0, 360); g.fill();
  g.fillStyle = 'rgba(120,96,60,.18)'; for (let i = 0; i < 12; i++) { const x = wrap(i * 70 - t * 70, 780) - 30; blob(g, x, 330 + (i % 3) * 8, 14, 3, 'rgba(120,96,60,.2)'); }
  g.fillStyle = '#7ba76a'; g.fillRect(0, 288, 720, 6);
  // cats trotting
  cat(g, 1, 300, 322, 1.8, t + .4, true, 1); cat(g, 0, 430, 322, 2.0, t, true, 1);
  // drifting leaves
  for (let i = 0; i < 14; i++) { const x = wrap(i * 61 - t * (30 + i * 3), 760) - 20, y = wrap(i * 47 + t * (18 + i), 300), rot = t * 2 + i; g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = i % 3 ? 'rgba(232,180,88,.85)' : 'rgba(158,196,104,.85)'; g.beginPath(); g.ellipse(0, 0, 5, 2.4, 0, 0, TAU); g.fill(); g.restore(); }
}

// ---------------- 3. meadow ----------------
function meadow(g, t, cat) {
  g.fillStyle = grad(g, 0, 200, '#a9d6ee', '#eaf5e2'); g.fillRect(0, 0, 720, 360);
  cloud(g, wrap(80 + t * 7, 900) - 90, 64, 1.2); cloud(g, wrap(460 + t * 5, 900) - 90, 96, .9); cloud(g, wrap(700 + t * 9, 900) - 90, 50, .7);
  g.fillStyle = '#a9cf83'; g.beginPath(); g.moveTo(0, 196); g.quadraticCurveTo(180, 150, 380, 190); g.quadraticCurveTo(560, 222, 720, 176); g.lineTo(720, 360); g.lineTo(0, 360); g.fill();
  g.fillStyle = '#8fc16e'; g.beginPath(); g.moveTo(0, 250); g.quadraticCurveTo(240, 214, 470, 246); g.quadraticCurveTo(620, 264, 720, 236); g.lineTo(720, 360); g.lineTo(0, 360); g.fill();
  const cols = ['#f4efe1', '#f2d27a', '#e7a2a7', '#c6b2e6'];
  for (let row = 0; row < 3; row++) for (let i = 0; i < 26; i++) { const x = (i * 29 + row * 13) % 740, y = 262 + row * 34 + (i % 3) * 5, sway = Math.sin(t * 1.6 + i * .7 + row) * 3, sc = 1 + row * .25;
    g.strokeStyle = '#5f8f4f'; g.lineWidth = 1.6 * sc; g.beginPath(); g.moveTo(x, y + 12 * sc); g.quadraticCurveTo(x + sway * .4, y + 5 * sc, x + sway, y); g.stroke(); blob(g, x + sway, y - 1, 3.2 * sc, 3.2 * sc, cols[(i + row) % 4]); blob(g, x + sway, y - 1, 1.1 * sc, 1.1 * sc, '#fbe08a'); }
  // a cat crossing the meadow, another watching butterflies
  const wx = wrap(t * 46, 900) - 90; cat(g, 0, wx, 318, 1.9, t, true, 1);
  cat(g, 1, 560, 300, 1.8, t, false, -1);
  for (let i = 0; i < 4; i++) { const bx = 380 + Math.sin(t * .9 + i * 1.7) * 150 + i * 30, by = 200 + Math.cos(t * 1.3 + i) * 30 - i * 8, fl = Math.abs(Math.sin(t * 9 + i)) * 7 + 2; g.fillStyle = ['#f4a7c0', '#f6d26b', '#a8c8f0', '#f4efe1'][i]; g.beginPath(); g.ellipse(bx - 4, by, 6, fl, -.4, 0, TAU); g.ellipse(bx + 4, by, 6, fl, .4, 0, TAU); g.fill(); g.fillStyle = '#5a4634'; g.fillRect(bx - .8, by - 3, 1.6, 6); }
}

// ---------------- 4. market town ----------------
function market(g, t, cat) {
  g.fillStyle = grad(g, 0, 300, '#f8e3c1', '#f6eedb'); g.fillRect(0, 0, 720, 360);
  // buildings
  const bcols = ['#e9c9a4', '#d9a58a', '#c9d3b5', '#ecd9a9', '#d8b9a1'];
  for (let i = 0; i < 5; i++) { const x = i * 150 - 10, h = 130 + (i % 3) * 26; g.fillStyle = bcols[i]; g.fillRect(x, 232 - h, 146, h + 40); g.fillStyle = i % 2 ? '#b5654f' : '#7b8fa0'; g.beginPath(); g.moveTo(x - 6, 232 - h); g.lineTo(x + 73, 232 - h - 34); g.lineTo(x + 152, 232 - h); g.fill();
    for (let w = 0; w < 2; w++) { g.fillStyle = '#7fa8b8'; g.fillRect(x + 20 + w * 66, 232 - h + 24, 34, 40); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + 22 + w * 66, 232 - h + 26, 12, 36); g.fillStyle = '#8a6a49'; g.fillRect(x + 16 + w * 66, 232 - h + 64, 42, 5); blob(g, x + 26 + w * 66, 232 - h + 61, 5, 3, ['#e7a2a7', '#f2d27a'][(i + w) % 2]); } }
  // bunting
  for (let k = 0; k < 2; k++) { const y0 = 92 + k * 26; g.strokeStyle = 'rgba(70,50,36,.5)'; g.lineWidth = 1.3; g.beginPath(); g.moveTo(0, y0); g.quadraticCurveTo(360, y0 + 44, 720, y0); g.stroke();
    for (let i = 1; i < 14; i++) { const u = i / 14, bx = u * 720, by = y0 + 2 * (1 - u) * u * 44, sw = Math.sin(t * 2 + i) * 1.5; g.fillStyle = ['#e7a2a7', '#f2d27a', '#a8c8f0', '#c6b2e6'][(i + k) % 4]; g.beginPath(); g.moveTo(bx - 7, by); g.lineTo(bx + 7, by); g.lineTo(bx + sw, by + 15); g.fill(); } }
  // stalls
  const stall = (x, c1, name, goods) => { g.fillStyle = '#8a6a49'; g.fillRect(x, 226, 5, 50); g.fillRect(x + 94, 226, 5, 50); g.fillStyle = '#b48a5c'; g.fillRect(x, 262, 99, 20);
    for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#f4efe1' : c1; g.beginPath(); g.moveTo(x - 4 + i * 17.3, 214); g.lineTo(x - 4 + (i + 1) * 17.3, 214); g.lineTo(x + 2 + (i + 1) * 16, 236); g.lineTo(x + 2 + i * 16, 236); g.fill(); }
    g.fillStyle = '#5a4634'; g.font = 'bold 9px Georgia'; g.textAlign = 'center'; g.fillText(name, x + 50, 276); for (let i = 0; i < goods.length; i++) blob(g, x + 18 + i * 21, 254, 8, 6, goods[i]); };
  stall(120, '#d9887f', 'FISH', ['#f2a35e', '#a8c8f0', '#f2a35e', '#a8c8f0']); stall(330, '#7fae86', 'FRUIT', ['#e7685c', '#f2d27a', '#8fc16e', '#e7685c']); stall(530, '#c6b2e6', 'YARN', ['#e7a2a7', '#a8c8f0', '#f2d27a', '#c6b2e6']);
  // cobbles
  g.fillStyle = '#cdbb9b'; g.fillRect(0, 282, 720, 78); g.strokeStyle = 'rgba(120,96,60,.22)'; g.lineWidth = 1;
  for (let r = 0; r < 4; r++) for (let i = 0; i < 20; i++) { const x = wrap(i * 40 + (r % 2) * 20 - t * 0, 740); g.beginPath(); g.ellipse(x, 296 + r * 18, 17, 6.5, 0, 0, TAU); g.stroke(); }
  // a cat trots along, stops at the fish stall to look, then trots on (14s loop)
  const c = t % 14; let x, walking = true; if (c < 4) x = lerp(-60, 170, c / 4); else if (c < 8) { x = 170; walking = false; } else x = lerp(170, 800, (c - 8) / 6);
  cat(g, 0, x, 330, 1.9, t, walking, 1); if (!walking) { g.fillStyle = '#5a4634'; g.font = 'italic 13px Georgia'; g.textAlign = 'center'; g.fillText('…fish?', x + 34, 268 + Math.sin(t * 3) * 2); }
  cat(g, 1, wrap(t * -26, 900) - 80 + 40, 340, 1.5, t, true, -1);
}

export const CLIPS = [
  { id: 'fishing', name: 'Fishing at the pier', line: 'Quiet water, patient paws.', draw: fishing },
  { id: 'forest', name: 'A walk through the forest', line: 'Dappled light, soft leaves.', draw: forest },
  { id: 'meadow', name: 'Across the meadow', line: 'Flowers, butterflies, no hurry.', draw: meadow },
  { id: 'market', name: 'Market town', line: 'Something smells like fish.', draw: market },
];
export function drawClip(id, g, t, cat) { const c = CLIPS.find(x => x.id === id); if (c) c.draw(g, t, cat); }

// a small gallery so the clips can be looked at (and, later, embedded on each running Adventure card)
export function openGallery(api, onlyId) {
  let dlg = document.getElementById('clip-gallery'); if (dlg) dlg.remove();
  dlg = document.createElement('dialog'); dlg.id = 'clip-gallery'; dlg.className = 'fh-sheet';
  const head = document.createElement('header'); head.className = 'fh-head'; head.innerHTML = '<div class="fh-title"><h2>Adventure clips</h2><p class="fh-sub">A peek at your cats on the road. Preview only.</p></div>';
  const close = document.createElement('button'); close.className = 'fh-btn fh-x'; close.textContent = 'Close'; close.onclick = () => dlg.close(); head.append(close);
  const body = document.createElement('div'); body.className = 'fh-body'; dlg.append(head, body);
  let raf = 0; const cvs = [];
  for (const c of CLIPS.filter(x => !onlyId || x.id === onlyId)) {
    const wrapEl = document.createElement('figure'); wrapEl.style.cssText = 'margin:0;display:grid;gap:6px';
    const cv = document.createElement('canvas'); cv.width = 720; cv.height = 360; cv.style.cssText = 'width:100%;height:auto;border-radius:16px;display:block'; cv.setAttribute('role', 'img'); cv.setAttribute('aria-label', c.name);
    const cap = document.createElement('figcaption'); cap.innerHTML = '<b style="font-family:Georgia,serif;font-size:16px">' + c.name + '</b><br><small style="color:#5f7060">' + c.line + '</small>';
    wrapEl.append(cv, cap); body.append(wrapEl); cvs.push([c, cv]);
  }
  const start = performance.now();
  const loop = now => { if (!dlg.open) return; raf = requestAnimationFrame(loop); const t = (now - start) / 1000; for (const [c, cv] of cvs) { const g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 720, 360); c.draw(g, t, api.clipCat); } };
  dlg.addEventListener('close', () => cancelAnimationFrame(raf));
  document.body.append(dlg); dlg.showModal(); raf = requestAnimationFrame(loop);
}
