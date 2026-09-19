(function(root){
 'use strict';
 let stopActive=()=>{};
 root.CoveCafeView={open(a){
  stopActive();
  const E=root.CoveCafeEngine,g=a.game(),s=E.init(g,Date.now());a.close();
  let panel=document.getElementById('cafe-kiosk');if(!panel){panel=document.createElement('section');panel.id='cafe-kiosk';panel.className='sheet';document.getElementById('app').append(panel);a.register(panel);}
  panel.hidden=false;let view='outside',tab='menu',frame=0,last=0,timer;const actors=a.actors();stopActive=()=>{cancelAnimationFrame(frame);clearInterval(timer);};
  const money=n=>Math.round(n*10)/10;
  function commit(fn){E.settle(g,Date.now());fn();a.save();a.hud();render();}
  function render(){
   cancelAnimationFrame(frame);clearInterval(timer);
   panel.innerHTML=`<header class="cc-head"><div><small>YOUR SEASIDE COFFEE STOP</small><h2>Catmint Café</h2></div><button class="btn" data-close>Close</button></header><div class="cc-wallet">${Math.floor(g.shells)} Shells <span>• ${s.served} drinks enjoyed</span></div><div class="cc-switch" aria-label="Café view"><button aria-pressed="${view==='outside'}" data-view="outside">Outside</button><button aria-pressed="${view==='inside'}" data-view="inside">Inside</button></div><canvas aria-label="${view==='inside'?'Cutaway café kitchen':'Seaside café kiosk'} with cats" width="720" height="380"></canvas><p class="cc-status" role="status"></p>`;
   panel.querySelector('[data-close]').onclick=()=>{a.close();cancelAnimationFrame(frame);clearInterval(timer);};
   panel.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;render();});
   if(!s.unlocked){panel.insertAdjacentHTML('beforeend',`<div class="cc-intro"><h3>A little coffee. A lot of company.</h3><p>Your cats handle every order. Grow ingredients, choose the menu, and watch your seaside café come to life.</p><p>Includes 6 coffee beans, 6 catmint and 2 honey. Stock never spoils.</p><button class="btn primary" data-start ${g.shells<120?'disabled':''}>Open your café · 120 Shells</button><small>Your first guest arrives in 30 seconds. No tapping to serve.</small></div>`);panel.querySelector('[data-start]').onclick=()=>commit(()=>E.unlock(g,Date.now()));}
   else{
    panel.insertAdjacentHTML('beforeend',`<nav class="cc-tabs" aria-label="Café management">${['menu','pantry','report','upgrades'].map(k=>`<button aria-pressed="${tab===k}" data-tab="${k}">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</nav><div class="cc-content"></div>`);
    panel.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render();});const content=panel.querySelector('.cc-content');
    if(tab==='menu'){
     content.innerHTML=`<p>Cats choose an available drink automatically. Sales go straight to your Shells.</p>${E.recipes.map(r=>{const missing=Object.entries(r.inputs).filter(([k,n])=>(g.homestead.stock[k]||0)<n).map(([k])=>E.ingredients[k].name);return `<article class="cc-card"><span class="cc-cup">${cup(r.id)}</span><div><h3>${r.name}</h3><p>${r.note}</p><small>${Object.entries(r.inputs).map(([k,n])=>n+' '+E.ingredients[k].name.toLowerCase()).join(' + ')} · ${r.price} Shells</small><small>${missing.length?'Sold out · Needs '+missing.join(', '):'Ready to brew'}</small></div><button class="btn" data-recipe="${r.id}" aria-pressed="${s.menu.includes(r.id)}">${s.menu.includes(r.id)?'On menu':'Add'}</button></article>`;}).join('')}<button class="btn" data-pause>${s.open?'Pause service':'Open café'}</button><small class="cc-note">Paused cafés finish accepted orders. Guests never mind a stockout.</small>`;
     content.querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>commit(()=>{const id=b.dataset.recipe;s.menu=s.menu.includes(id)?s.menu.filter(k=>k!==id):[...s.menu,id];}));content.querySelector('[data-pause]').onclick=()=>commit(()=>{s.open=!s.open;s.cursor=Date.now();});
    }else if(tab==='pantry'){
     content.innerHTML=`<p>Grow for better margins, or import a little convenience. Imports always require your tap.</p>${Object.entries(E.ingredients).map(([k,v])=>`<article class="cc-card"><div><h3>${v.name} <span class="cc-count">${g.homestead.stock[k]||0}</span></h3><small>Import ${v.import} Shells each · grow ${v.yield} for ${v.cost}</small></div><button class="btn" data-import="${k}" ${g.shells<v.import*5?'disabled':''}>Buy 5 · ${v.import*5}</button></article>`).join('')}<button class="btn primary" data-garden>Visit Cove Garden</button>`;content.querySelectorAll('[data-import]').forEach(b=>b.onclick=()=>commit(()=>{const k=b.dataset.import,cost=E.ingredients[k].import*5;if(g.shells>=cost){g.shells-=cost;E.acquire(g,k,5,cost);}}));content.querySelector('[data-garden]').onclick=()=>{cancelAnimationFrame(frame);clearInterval(timer);a.garden();};
    }else if(tab==='report'){
     const best=E.recipes.slice().sort((a,b)=>(s.sales[b.id]||0)-(s.sales[a.id]||0))[0];const low=Object.keys(E.ingredients).sort((a,b)=>(g.homestead.stock[a]||0)-(g.homestead.stock[b]||0))[0];
     content.innerHTML=`<p class="cc-report-line">${s.served?'“The cups are empty. The hearts are full.”':'“Midknight has inspected the counter. Twice.”'}</p><div class="cc-stats">${[['Served',s.served],['Sales',money(s.revenue)],['Ingredient cost',money(s.cost)],['Net profit',money(s.revenue-s.cost)]].map(([k,v])=>`<div><small>${k}</small><strong>${v}</strong></div>`).join('')}</div><p>${s.served?'Best seller: '+best.name+' · '+s.sales[best.id]+' cups':'Your first sale will appear here.'}</p><p>Garden tip: ${E.ingredients[low].name.toLowerCase()} is your lowest stock.</p><button class="btn primary" data-garden>Visit Cove Garden</button><small class="cc-note">Lifetime figures. Costs follow ingredients used, including growing costs. Starter ingredients are complimentary. Stock-limited offline service runs for up to 12 hours; unused ingredients stay safe.</small>`;content.querySelector('[data-garden]').onclick=()=>{cancelAnimationFrame(frame);clearInterval(timer);a.garden();};
    }else{
     content.innerHTML=`<p>Small improvements. A warmer welcome.</p><article class="cc-card"><div><h3>A smoother brew</h3><p>One guest every ${E.interval(s)/60000} minutes.</p><small>Level ${s.speed+1}/3 · no rushed cats</small></div><button class="btn" data-speed ${s.speed>=2||g.shells<(s.speed+1)*300?'disabled':''}>${s.speed>=2?'Complete':'Upgrade · '+(s.speed+1)*300}</button></article><article class="cc-card"><div><h3>A table by the sea</h3><p>A cozy outdoor table and cushion.</p><small>Visual upgrade · no extra income multiplier</small></div><button class="btn" data-seat ${s.seats||g.shells<150?'disabled':''}>${s.seats?'Placed':'Add · 150'}</button></article>`;content.querySelector('[data-speed]').onclick=()=>commit(()=>{const n=(s.speed+1)*300;if(s.speed<2&&g.shells>=n){g.shells-=n;s.speed++;}});content.querySelector('[data-seat]').onclick=()=>commit(()=>{if(!s.seats&&g.shells>=150){g.shells-=150;s.seats=1;}});
    }
   }
   const renderedServed=s.served;status();frame=requestAnimationFrame(paint);timer=setInterval(()=>{if(panel.hidden||!panel.isConnected){clearInterval(timer);cancelAnimationFrame(frame);return;}const before=s.served;E.settle(g,Date.now());if(s.served!==renderedServed){a.save();a.hud();render();}else status();},1000);
  }
  function status(){const el=panel.querySelector('.cc-status');if(!el)return;const n=Math.max(0,Math.ceil((s.cursor+E.interval(s)-Date.now())/1000));el.textContent=!s.unlocked?'A tiny place for your next big idea.':s.pending?'Brewing '+E.recipes.find(r=>r.id===s.pending.id).name+' · a guest is waiting':!s.open?'Closed for a little rest.':!E.available(s,g.homestead.stock).length?'Taking a nap · stock an ingredient or add a drink to the menu.':`Open · next guest in ${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`;}
  function cup(id){return `<svg viewBox="0 0 60 64" aria-hidden="true"><path d="M42 24h8q12 15-8 19" fill="none" stroke="#ae8761" stroke-width="5"/><path d="M10 20h34v26q-17 15-34 0Z" fill="${id==='tea'?'#8fa783':id==='midknight'?'#d0ad6b':'#e5cfa8'}"/><ellipse cx="27" cy="21" rx="17" ry="5" fill="#74523d"/><path d="M22 13q-7-6 0-11m12 11q-7-6 0-11" fill="none" stroke="#adbaa0" stroke-width="2"/></svg>`;}
  function paint(t){if(panel.hidden||!panel.isConnected)return;frame=requestAnimationFrame(paint);if(document.hidden||t-last<33)return;last=t;const cv=panel.querySelector('canvas'),c=cv.getContext('2d'),inside=view==='inside';
   const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};const ellipse=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
   const hour=new Date().getHours(),night=hour<6||hour>=18;
   rect(0,0,720,380,night?'#465d69':'#dbe7db');rect(0,110,720,140,night?'#65858b':'#a8c9c6');rect(0,220,720,160,night?'#c0b89d':'#e4d6b9');for(let i=0;i<7;i++)rect(i*120,163+i%2*12,75,2,night?'#7e9b9b':'#c8ded7');ellipse(365,336,258,21,'#b4a98b');if(night)ellipse(646,48,17,17,'#f4eac8');
   rect(119,74,475,251,'#708e72');rect(130,82,452,233,'#a9b997');for(let y=201;y<316;y+=19)rect(132,y,448,2,'#8fa583');rect(142,102,426,113,'#6a5641');
   if(inside){rect(140,112,430,192,'#eee3c9');for(let y=223;y<305;y+=20)rect(141,y,428,1,'#d5bc96');rect(170,142,358,7,'#a18058');for(let i=0;i<8;i++){rect(177+i*43,119,22,22,['#a9b997','#c5a67b','#efe6d1'][i%3]);}rect(414,159,108,82,'#9caf9b');rect(425,174,85,42,'#445a50');rect(436,212,16,12,'#f4ecd9');rect(480,212,16,12,'#f4ecd9');}
   else{rect(152,109,408,99,'#e6dec7');rect(164,151,87,57,'#9aac9a');rect(174,161,65,24,'#46534b');rect(198,187,17,17,'#fff6df');rect(460,131,82,63,'#486450');c.fillStyle='#f6eed9';c.font='12px Georgia';c.textAlign='center';c.fillText('COFFEE',501,151);c.fillText('CATMINT',501,169);c.fillText('COMPANY',501,187);}
   a.cat(c,actors[0],inside?335:345,inside?267:208,1.35,t,false);
   // Small counter details stay readable at phone size, without animated lights or particles.
   rect(270,inside?249:195,13,12,'#faf2df');rect(292,inside?249:195,13,12,'#faf2df');
   if(s.pending){c.strokeStyle='#f6f0df';c.lineWidth=2;for(let i=0;i<3;i++){const lift=(t/70+i*9)%26;c.beginPath();c.moveTo(inside?471:211,(inside?164:147)-lift);c.quadraticCurveTo(inside?464:204,(inside?158:141)-lift,inside?471:211,(inside?150:133)-lift);c.stroke();}}
   rect(133,inside?259:207,446,12,'#a47b51');rect(140,inside?271:219,432,8,'#78573e');
   if(inside){rect(168,276,112,34,'#c1a77d');rect(437,276,110,34,'#c1a77d');}
   rect(102,71,505,13,'#59775c');for(let i=0;i<12;i++)rect(108+i*41,84,41,18,i%2?'#f4ead3':'#829d7b');
   rect(242,27,229,42,'#f7eed8');c.fillStyle='#3e5843';c.font='bold 24px Georgia';c.textAlign='center';c.fillText('Catmint Café',357,55);
   rect(109,296,13,35,'#7b5c40');rect(575,296,13,35,'#7b5c40');ellipse(78,323,26,9,'#ba9870');rect(59,287,38,36,'#b88e68');ellipse(77,274,27,26,'#839c70');ellipse(89,265,16,24,'#99ac7b');
   for(const x of [123,591]){rect(x-2,104,4,20,'#5c644b');rect(x-9,124,18,25,'#665a42');rect(x-6,128,12,17,night?'#f3ce80':'#dfd6ab');if(night){const glow=c.createRadialGradient(x,140,2,x,140,31);glow.addColorStop(0,'#f4cf7130');glow.addColorStop(1,'#f4cf7100');ellipse(x,140,31,31,glow);}}
   if(s.seats){rect(612,299,9,46,'#a17d53');ellipse(616,296,45,16,'#c7ad80');ellipse(658,345,26,9,'#93a480');}
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const now=Date.now(),until=s.cursor+E.interval(s)-now,depart=s.lastCompleted?(now-s.lastCompleted.at)/12000:99;
   if(s.pending||depart<1||(s.unlocked&&s.open&&E.available(s,g.homestead.stock).length&&until<18000)){
    const progress=s.pending?1:depart<1?1:Math.max(0,1-until/18000),x=depart<1&&!s.pending?390+depart*350:70+progress*320;
    a.cat(c,actors[1]||actors[0],x,348,1.4,t,!reduced&&!s.pending);
    if(s.pending){const elapsed=30000-(s.pending.at-now);c.fillStyle='#47684e';c.font='16px Georgia';c.fillText(elapsed<10000?'One cozy cup, please.':elapsed<22000?'A sip of something lovely.':'Purrfect. Thank you!',x,289);if(elapsed>10000){rect(x+29,321,13,16,'#fff6df');rect(x+30,321,11,3,'#876443');}}
    else if(depart<1){c.fillStyle='#47684e';c.font='16px Georgia';c.fillText('See you tomorrow!',Math.min(x,625),289);}
   }
   if(s.seats&&s.served)a.cat(c,actors[2]||actors[0],659,339,1,t,false);
  }
  render();
 }};
})(globalThis);
