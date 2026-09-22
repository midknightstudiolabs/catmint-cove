(function (root) {
  'use strict';
  // The Wishing Well — a universal, once-a-day ritual. No café, no garden, no purchase: every cove
  // has a well, and every cove gets one wish a day. `a` (the bridge) supplies game state, the cat
  // drawing helper, sound and the actual reward roll (kept in index.html, alongside grantReward).
  let stopActive = () => { };
  root.CoveWishingWell = {
    open(a) {
      stopActive();
      const g = a.game();
      a.close();   // close every other panel FIRST — closeAllPanels hides everything it knows about, including this one once registered
      let panel = document.getElementById('wishwell');
      if (!panel) { panel = document.createElement('section'); panel.id = 'wishwell'; panel.className = 'sheet ww-v1'; document.getElementById('app').append(panel); a.register(panel); }
      panel.hidden = false;

      // A handful of resident cats gather at the well each visit — different faces, same ritual.
      const cast = a.cats().slice(0, 3);
      const seats = [{ x: 210, y: 300, s: .95 }, { x: 545, y: 292, s: .9 }, { x: 470, y: 340, s: .78 }];
      let phase = 'idle', phaseT = 0, frame = 0, last = 0, timer = 0;
      let ripples = [], sparks = [], toss = null, resultInfo = null;

      panel.innerHTML = `<canvas width="720" height="480"></canvas>
        <div class="ww-top"><button class="btn ww-back" data-close aria-label="Return to Cove">&lsaquo; Cove</button><h2>The Wishing Well</h2><span class="ww-top-end"></span></div>
        <div class="ww-card" id="ww-card" hidden></div>
        <div class="ww-bottom"><button class="btn primary ww-wish" id="ww-wish"></button><p class="ww-note" id="ww-note"></p></div>`;
      panel.querySelector('[data-close]').onclick = () => { stopActive(); panel.hidden = true; a.hud(); };

      const fmtCountdown = (ms) => { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 3600) + 'h ' + Math.floor((s % 3600) / 60) + 'm'; };
      const REWARD_LINE = (r) => {
        if (r.accessory) { const acc = a.accInfo(r.accessory); return { title: 'A wish, answered', text: (acc ? acc.label : 'Something rare') + ' — ' + (acc ? acc.blurb : 'it was waiting at the bottom of the well.'), rare: true }; }
        if (r.wishOnly) return { title: 'A quiet wish', text: 'Nothing surfaced but a few shells and a nice, settled feeling.' };
        if (r.pearls) return { title: 'A pearl!', text: 'It catches the light on the way up. Worth the wish.' };
        if (r.driftwood) return { title: 'Driftwood', text: 'Smooth, sea-worn wood — good for mending something.' };
        return { title: 'A little luck', text: 'A handful of shells, warm from sitting at the bottom.' };
      };

      function syncButton() {
        const st = a.ritualState(), btn = panel.querySelector('#ww-wish'), note = panel.querySelector('#ww-note');
        if (phase !== 'idle') return;
        if (st.available) { btn.disabled = false; btn.textContent = 'Make a wish'; btn.classList.add('ready'); note.textContent = 'One wish a day. Always something.'; }
        else { btn.disabled = true; btn.textContent = 'Come back tomorrow'; btn.classList.remove('ready'); note.textContent = 'Next wish in ' + fmtCountdown(st.readyAt - Date.now()); }
      }
      panel.querySelector('#ww-wish').onclick = () => {
        if (phase !== 'idle') return;
        const pulled = a.ritualPull(); if (!pulled) { syncButton(); return; }
        resultInfo = pulled;
        phase = 'toss'; phaseT = 0;
        toss = { x0: 360, y0: 430, x1: 360, y1: 268, t: 0, dur: 0.55 };
        {const b=panel.querySelector('#ww-wish'); b.disabled=true; b.textContent='Wishing…'; b.classList.remove('ready');}
        try { a.sfx('collect'); } catch (e) { }
      };

      function drawWell(ctx, t) {
        const cx = 360, cy = 268;
        // mossy stone base ring
        ctx.save(); ctx.translate(cx, cy);
        ctx.fillStyle = '#5c6b4e'; ctx.beginPath(); ctx.ellipse(0, 40, 108, 34, 0, 0, 7); ctx.fill();
        const stone = ctx.createLinearGradient(0, -40, 0, 42);
        stone.addColorStop(0, '#cdbfa0'); stone.addColorStop(1, '#a89473');
        ctx.fillStyle = stone;
        ctx.beginPath(); ctx.moveTo(-96, 30); ctx.bezierCurveTo(-96, -8, 96, -8, 96, 30); ctx.lineTo(96, 44); ctx.bezierCurveTo(96, 60, -96, 60, -96, 44); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(90,74,50,.35)'; ctx.lineWidth = 2;
        for (let i = -70; i <= 70; i += 24) { ctx.beginPath(); ctx.moveTo(i, 12); ctx.lineTo(i - 3, 52); ctx.stroke(); }
        // moss patches
        ctx.fillStyle = 'rgba(120,150,90,.55)';
        [[-70, 20, 16], [55, 34, 13], [10, 44, 11]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.ellipse(x, y, r, r * .55, 0, 0, 7); ctx.fill(); });
        // the water — dark, with a soft golden reflection of the sky
        ctx.fillStyle = 'rgba(28,52,58,.9)'; ctx.beginPath(); ctx.ellipse(0, 10, 76, 22, 0, 0, 7); ctx.fill();
        const shine = ctx.createRadialGradient(0, 4, 2, 0, 4, 70);
        shine.addColorStop(0, 'rgba(255,224,150,.30)'); shine.addColorStop(1, 'rgba(255,224,150,0)');
        ctx.fillStyle = shine; ctx.beginPath(); ctx.ellipse(0, 10, 76, 22, 0, 0, 7); ctx.fill();
        // posts + peaked roof
        ctx.fillStyle = '#8a6b48';
        ctx.fillRect(-92, -96, 12, 96); ctx.fillRect(80, -96, 12, 96);
        ctx.beginPath(); ctx.moveTo(-104, -92); ctx.lineTo(0, -140); ctx.lineTo(104, -92); ctx.lineTo(92, -84); ctx.lineTo(0, -122); ctx.lineTo(-92, -84); ctx.closePath();
        ctx.fillStyle = '#7a5b3c'; ctx.fill();
        ctx.fillStyle = '#93745a'; ctx.fillRect(-100, -94, 200, 8);
        // rope + little bucket
        ctx.strokeStyle = '#a9946f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -118); ctx.lineTo(0, -30); ctx.stroke();
        ctx.fillStyle = '#8a6b48'; ctx.beginPath(); ctx.moveTo(-14, -30); ctx.lineTo(14, -30); ctx.lineTo(11, -8); ctx.lineTo(-11, -8); ctx.closePath(); ctx.fill();
        // idle ripple, always faintly alive
        const idle = 0.5 + Math.sin(t * 1.3) * 0.5;
        ctx.strokeStyle = 'rgba(255,240,200,' + (0.08 + idle * 0.06) + ')'; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.ellipse(0, 10, 40 + idle * 14, 12 + idle * 4, 0, 0, 7); ctx.stroke();
        ctx.restore();
      }

      function paint(t) {
        if (panel.hidden || !panel.isConnected) return; frame = requestAnimationFrame(paint);
        if (document.hidden || t - last < 33) return; const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
        const canvas = panel.querySelector('canvas'), ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 720, 480);
        a.bg(ctx, 720, 480);
        drawWell(ctx, t / 1000);
        cast.forEach((c, i) => { const s = seats[i]; a.cat(ctx, c, s.x, s.y, s.s, t, false); });

        // ---- the wish animation: toss -> ripple -> glow -> reveal ----
        if (phase === 'toss' && toss) {
          toss.t += dt; const f = Math.min(1, toss.t / toss.dur);
          const x = toss.x0 + (toss.x1 - toss.x0) * f, y = toss.y0 + (toss.y1 - toss.y0) * f - Math.sin(f * Math.PI) * 90;
          ctx.fillStyle = '#e8b45a'; ctx.strokeStyle = '#8a6b2c'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.stroke();
          if (f >= 1) { phase = 'ripple'; phaseT = 0; ripples = [{ r: 4, a: 0.6 }, ]; }
        } else if (phase === 'ripple') {
          phaseT += dt;
          if (phaseT < 0.9 && Math.random() < 0.4) ripples.push({ r: 2, a: 0.5 });
          for (const r of ripples) { r.r += dt * 70; r.a -= dt * 0.55; }
          ripples = ripples.filter(r => r.a > 0.02);
          for (const r of ripples) { ctx.strokeStyle = 'rgba(255,236,190,' + Math.max(0, r.a) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(360, 278, r.r * 1.9, r.r * 0.55, 0, 0, 7); ctx.stroke(); }
          if (phaseT > 1.15) { phase = 'glow'; phaseT = 0; }
        } else if (phase === 'glow' || phase === 'reveal') {
          phaseT += dt;
          const rare = resultInfo && resultInfo.reward && resultInfo.reward.rare;
          const bloom = Math.min(1, phaseT / 0.7);
          const grad = ctx.createRadialGradient(360, 268, 4, 360, 268, (rare ? 210 : 140) * bloom);
          grad.addColorStop(0, 'rgba(255,232,170,' + (rare ? 0.5 : 0.32) * bloom + ')'); grad.addColorStop(1, 'rgba(255,232,170,0)');
          ctx.fillStyle = grad; ctx.fillRect(0, 0, 720, 480);
          if (phase === 'glow' && phaseT > 0.5) {
            phase = 'reveal'; phaseT = 0;
            for (let i = 0; i < (rare ? 26 : 12); i++) sparks.push({ x: 360, y: 268, a: rand(0, Math.PI * 2), sp: rand(40, rare ? 150 : 95), t: 0, life: rand(0.6, 1.3), rare });
            const card = panel.querySelector('#ww-card'), line = REWARD_LINE(resultInfo.reward);
            card.className = 'ww-card' + (line.rare ? ' rare' : '') + ' on';
            card.innerHTML = '<b>' + line.title + '</b><p>' + line.text + '</p><button class="btn primary" id="ww-ok">Nice</button>';
            card.hidden = false;
            panel.querySelector('#ww-ok').onclick = () => { card.classList.remove('on'); setTimeout(() => { card.hidden = true; phase = 'idle'; syncButton(); }, 180); };
            if (resultInfo.cat) { resultInfo.cat.state = 'zooming'; setTimeout(() => { if (resultInfo.cat) resultInfo.cat.state = 'loafing'; }, 1400); }
          }
        }
        for (let i = sparks.length - 1; i >= 0; i--) { const p = sparks[i]; p.t += dt; if (p.t > p.life) { sparks.splice(i, 1); continue; }
          const f = p.t / p.life, x = p.x + Math.cos(p.a) * p.sp * f, y = p.y + Math.sin(p.a) * p.sp * f - 40 * f;
          ctx.globalAlpha = Math.max(0, 1 - f); ctx.fillStyle = p.rare ? '#ffd76a' : '#fff3cf';
          ctx.beginPath(); ctx.arc(x, y, p.rare ? 3 : 2, 0, 7); ctx.fill(); ctx.globalAlpha = 1; }
      }
      const rand = (a, b) => a + Math.random() * (b - a);
      syncButton();
      timer = setInterval(() => { if (panel.hidden || !panel.isConnected) { clearInterval(timer); return; } if (phase === 'idle') syncButton(); }, 1000);
      frame = requestAnimationFrame(paint);
      stopActive = () => { cancelAnimationFrame(frame); clearInterval(timer); };
    }
  };
})(globalThis);
