(function (root) {
  'use strict';
  // The Wishing Well — a universal, once-a-day ritual. No café, no garden, no purchase: every cove
  // has a well, and every cove gets one wish a day. `a` (the bridge) supplies game state, the cat
  // drawing helper, sound and the actual reward roll (kept in index.html, alongside grantReward).
  let stopActive = () => { };
  root.CoveWishingWell = {
    open(a) {
      stopActive();
      a.close();   // close every other panel FIRST — closeAllPanels hides everything it knows about, including this one once registered
      let panel = document.getElementById('wishwell');
      if (!panel) { panel = document.createElement('section'); panel.id = 'wishwell'; panel.className = 'sheet ww-v1'; document.getElementById('app').append(panel); a.register(panel); }
      panel.hidden = false;

      // A handful of resident cats gather at the well each visit — different faces, same ritual.
      const cast = a.cats().slice(0, 3);
      const seats = [{ x: 205, y: 331, s: .78 }, { x: 518, y: 325, s: .74 }, { x: 453, y: 374, s: .7 }];
      let phase = 'idle', phaseT = 0, frame = 0, last = 0, timer = 0;
      let ripples = [], sparks = [], toss = null, resultInfo = null;

      panel.innerHTML = `<canvas width="720" height="480" aria-label="Your cats gathered around a stone wishing well"></canvas>
        <div class="ww-top"><button class="btn ww-back" data-close aria-label="Return to Cove">&lsaquo; Cove</button><h2>The Wishing Well</h2><span class="ww-top-end"></span></div>
        <div class="ww-card" id="ww-card" role="status" aria-live="polite" hidden></div>
        <div class="ww-bottom"><button class="btn primary ww-wish" id="ww-wish"></button><p class="ww-note" id="ww-note"></p></div>`;
      panel.querySelector('[data-close]').onclick = () => { stopActive(); panel.hidden = true; a.hud(); };
      const canvas = panel.querySelector('canvas'), ctx = canvas.getContext('2d');
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      let width = 720, height = 480, density = 1;
      function fit() {
        width = panel.clientWidth; height = panel.clientHeight;
        density = Math.min(devicePixelRatio || 1, 2, 2400 / Math.max(width, height));
        canvas.width = Math.round(width * density); canvas.height = Math.round(height * density);
      }
      const resize = new ResizeObserver(fit); resize.observe(panel); fit();

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
        const night = Math.max(0, Math.min(1, a.night?.() || 0));
        ctx.save(); ctx.translate(360, 268); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        const oval = (x,y,rx,ry,color) => {ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();};
        const line = (x,y,x2,y2,color,w=2) => {ctx.strokeStyle=color;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();};
        // A quiet clearing and a few worn stepping stones anchor the well to the lawn.
        oval(0,67,146,40,'rgba(67,83,51,.16)');
        oval(0,66,119,28,'#92936b');
        [[-17,112,25,9],[10,140,29,10],[-13,169,32,11]].forEach(([x,y,rx,ry])=>{
          oval(x,y+2,rx,ry,'rgba(66,66,43,.18)');oval(x,y,rx,ry,'#b6b29a');
          line(x-rx*.55,y-2,x+rx*.4,y-3,'#d1ccb3',1.5);
        });
        // Timber uprights and braces, behind the masonry.
        for(const x of [-83,72]){
          ctx.fillStyle='#765b42';ctx.fillRect(x,-100,12,126);
          ctx.fillStyle='#ac8960';ctx.fillRect(x+2,-99,4,121);
          line(x+6,-73,x+(x<0?27:-15),-96,'#765b42',6);
        }
        // Rounded courses of limestone, with staggered joints clipped to the wall.
        const body = new Path2D('M-100 9 Q0-24 100 9 L100 55 C88 88-87 88-100 55 Z');
        ctx.fillStyle='#b7ad8d';ctx.fill(body);ctx.save();ctx.clip(body);
        ctx.fillStyle='#c9bea0';ctx.fillRect(-100,12,200,19);
        ctx.fillStyle='#aea488';ctx.fillRect(-100,53,200,25);
        for(const y of [32,53]){ctx.strokeStyle='#918c74';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-102,y-7);ctx.quadraticCurveTo(0,y+19,102,y-7);ctx.stroke();}
        for(let row=0;row<3;row++)for(let x=-90+(row%2)*24;x<100;x+=44)line(x,10+row*22,x+2,31+row*22,'#968e74',2);
        ctx.restore();
        oval(0,9,104,30,'#d7cbaa');oval(0,7,94,24,'#eee0bc');
        oval(0,8,78,19,'#686d59');oval(0,11,75,16,'#344f4d');
        oval(-13,8,51,7,'rgba(136,179,158,.18)');
        ctx.save();ctx.beginPath();ctx.ellipse(0,11,74,16,0,0,7);ctx.clip();
        const idle = .5 + Math.sin(t*1.3)*.5;
        ctx.strokeStyle='rgba(222,231,197,.35)';ctx.lineWidth=1;
        ctx.beginPath();ctx.ellipse(0,11,34+idle*24,6+idle*5,0,0,7);ctx.stroke();ctx.restore();
        // Broad, gently bowed sage shingles: the same muted greens as Cove decor.
        const roof = new Path2D('M-121-95 Q-62-124 0-153 Q62-124 121-95 Q61-82 0-88 Q-61-82-121-95Z');
        ctx.fillStyle='#4d6955';ctx.fill(roof);ctx.save();ctx.clip(roof);
        for(let row=0;row<4;row++){
          const y=-145+row*17;
          ctx.fillStyle=['#769078','#6c866e','#617e65','#57735e'][row];ctx.fillRect(-125,y,250,15);
          for(let x=-120+(row%2)*16;x<125;x+=32)line(x,y,x-5,y+14,'rgba(43,67,49,.26)',1.3);
        }
        ctx.restore();ctx.strokeStyle='#405c49';ctx.lineWidth=3;ctx.stroke(roof);
        ctx.strokeStyle='#bb9970';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-120,-93);ctx.quadraticCurveTo(0,-76,120,-93);ctx.stroke();
        line(-4,-154,4,-154,'#bcab7b',5);
        // Rope spindle, crank and a small coopered bucket off-centre, leaving the water visible.
        line(-78,-57,82,-57,'#856342',8);line(-78,-59,80,-59,'#ba9366',2);
        for(let x=-13;x<15;x+=4)line(x,-62,x,-51,'#d0bb8a',2);
        line(86,-57,98,-57,'#645541',4);line(98,-57,98,-42,'#645541',4);oval(98,-40,5,4,'#ad8859');
        ctx.save();ctx.translate(0,-55);ctx.rotate(Math.sin(t*.8)*.018);
        line(0,0,0,29,'#c8b68c',2);
        ctx.strokeStyle='#655e48';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,38,10,Math.PI,0);ctx.stroke();
        ctx.fillStyle='#a98153';ctx.beginPath();ctx.moveTo(-13,38);ctx.lineTo(13,38);ctx.lineTo(10,58);ctx.lineTo(-10,58);ctx.closePath();ctx.fill();
        for(const x of [-6,0,6])line(x,41,x*.8,55,'#7d6246',1);
        line(-12,41,12,41,'#c5b78c',2);line(-10,54,10,54,'#c5b78c',2);ctx.restore();
        // One warm lantern; night glow stays local rather than washing out the scene.
        line(57,-85,57,-69,'#625a42',2);
        if(night>.05){const glow=ctx.createRadialGradient(57,-57,1,57,-57,64);glow.addColorStop(0,`rgba(255,216,136,${night*.36})`);glow.addColorStop(1,'rgba(255,216,136,0)');ctx.fillStyle=glow;ctx.fillRect(-9,-123,132,132);}
        ctx.fillStyle='#665a40';ctx.fillRect(49,-68,16,24);ctx.fillStyle=night>.2?'#ffe2a1':'#dbc592';ctx.fillRect(52,-65,10,17);
        line(57,-65,57,-47,'#9c8158',1);line(48,-69,66,-69,'#665a40',3);
        // Catmint at the foot, kept low so neither cats nor masonry are hidden.
        for(const side of [-1,1])for(let i=0;i<4;i++){
          const x=side*(100+i*6),y=65-i%2*3,lean=side*(5+i*2);
          line(x,y,x+lean,y-18-i*2,'#66835a',1.6);
          oval(x+lean*.4-3,y-8,5,2.5,'#78956a');oval(x+lean*.6+3,y-13,5,2.5,'#859c70');
          oval(x+lean,y-20-i*2,2.4,4,'#a29bb6');
        }
        oval(-69,67,12,3,'#7d8a61');oval(57,74,17,3,'#7d8a61');
        ctx.restore();
      }

      function paint(t) {
        if (panel.hidden || !panel.isConnected) { stopActive(); return; } frame = requestAnimationFrame(paint);
        if (document.hidden || t - last < 33) return; const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
        ctx.setTransform(density,0,0,density,0,0);ctx.clearRect(0,0,width,height);
        a.bg(ctx, width, height);
        // Uniform scale preserves cats' proportions in portrait and on wide screens.
        const top = Math.max(88,panel.querySelector('.ww-top').offsetHeight+20);
        const available = Math.max(150,height-top-panel.querySelector('.ww-bottom').offsetHeight-30);
        const scale = Math.min(width/430,available/345,1.8);
        ctx.save();ctx.translate(width/2-360*scale,top+available*.5-265*scale);ctx.scale(scale,scale);
        drawWell(ctx, reducedMotion ? 0 : t / 1000);
        cast.forEach((c, i) => { const s = seats[i]; a.cat(ctx, c, s.x, s.y, s.s, reducedMotion ? 0 : t, false); });

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
          ctx.save();ctx.beginPath();ctx.ellipse(360,279,74,16,0,0,7);ctx.clip();
          for (const r of ripples) { ctx.strokeStyle = 'rgba(255,236,190,' + Math.max(0, r.a) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(360, 278, r.r * 1.9, r.r * 0.55, 0, 0, 7); ctx.stroke(); }ctx.restore();
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
        ctx.restore();
      }
      const rand = (a, b) => a + Math.random() * (b - a);
      syncButton();
      timer = setInterval(() => { if (panel.hidden || !panel.isConnected) { clearInterval(timer); return; } if (phase === 'idle') syncButton(); }, 1000);
      frame = requestAnimationFrame(paint);
      stopActive = () => { cancelAnimationFrame(frame); clearInterval(timer); resize.disconnect(); };
    }
  };
})(globalThis);
