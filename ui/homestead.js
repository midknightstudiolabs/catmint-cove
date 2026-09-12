// Permanent Cove activities. Timestamp-based progress; harvested stock never spoils.
function drawHomesteadEntrance(g,d){
  g.save();g.translate(d.x,d.y);g.lineWidth=2;g.strokeStyle='#80694c';
  if(d.place==='cafe'){
    g.fillStyle='#eddcba';g.fillRect(-29,-48,58,48);g.strokeRect(-29,-48,58,48);
    g.fillStyle='#769581';g.beginPath();g.moveTo(-35,-48);g.lineTo(0,-65);g.lineTo(35,-48);g.closePath();g.fill();
    g.fillStyle='#927657';g.fillRect(-8,-25,16,25);g.fillStyle='#c4dcd7';g.fillRect(-23,-34,12,15);g.fillRect(11,-34,12,15);
  }else{
    g.fillStyle='#a98861';g.fillRect(-32,-24,64,24);g.fillStyle='#72583d';g.fillRect(-28,-20,56,16);
    for(const x of [-19,0,19]){g.fillStyle='#8da56c';g.beginPath();g.ellipse(x,-21,5,13,-.4,0,Math.PI*2);g.fill();g.beginPath();g.ellipse(x+5,-23,5,12,.4,0,Math.PI*2);g.fill();}
  }
  g.fillStyle='#faf2dc';g.beginPath();g.roundRect(-36,3,72,19,6);g.fill();g.stroke();g.fillStyle='#43543f';g.font='bold 11px sans-serif';g.textAlign='center';g.fillText(d.place==='cafe'?'Catmint Café':'Cove Garden',0,16);g.restore();
}
const COVE_CROPS={carrot:{name:'Carrots',seconds:60,cost:2,yield:3},pumpkin:{name:'Pumpkins',seconds:600,cost:6,yield:6},berry:{name:'Berries',seconds:3600,cost:12,yield:12}};
const COVE_RECIPES={carrot:{name:'Carrot bites',seconds:30,ingredient:'carrot',amount:2,servings:4},pumpkin:{name:'Pumpkin nibbles',seconds:120,ingredient:'pumpkin',amount:3,servings:8},berry:{name:'Berry biscuits',seconds:300,ingredient:'berry',amount:4,servings:12}};
function neoHomestead(){
  G.homestead ||= {plots:[null,null,null,null],stock:{carrot:2,pumpkin:0,berry:0},batch:null,counter:0,earned:0,served:0,lastSale:Date.now(),tables:3};
  G.homestead.cloth ||= 'cream';
  G.homestead.layout ||= 'together';
  return G.homestead;
}
function neoExpandHomestead(kind){
  const h=neoHomestead(),garden=kind==='garden',n=garden?h.plots.length:h.tables,max=garden?8:5;
  const cost=garden?100+(n-4)*75:150+(n-3)*100;
  if(n>=max||G.shells<cost)return false;
  G.shells-=cost;if(garden)h.plots.push(null);else h.tables++;
  save();syncHud();return true;
}
function neoCropArt(key,ready){
  return `<svg viewBox="0 0 120 70" aria-hidden="true" class="homestead-crop-art"><path fill="#bea17b" d="M8 49 60 39l52 10-52 17Z"/><path fill="#745b42" d="m17 48 43-7 43 7-43 10Z"/>${[32,60,88].map(x=>`<path stroke="#6d885b" stroke-width="3" d="M${x} 48V${ready?20:35}"/><path fill="#8fa770" d="M${x} 39q-20-2-14-15 15 1 14 15m0-5q17-2 15-15-15 2-15 15"/>${ready?key==='carrot'?`<path fill="#ce9060" d="m${x-5} 42 10 0-5 13Z"/>`:key==='pumpkin'?`<ellipse fill="#ca9862" cx="${x}" cy="43" rx="10" ry="8"/>`:`<circle fill="#ad777e" cx="${x-5}" cy="35" r="5"/><circle fill="#ad777e" cx="${x+4}" cy="39" r="5"/>`:''}`).join('')}</svg>`;
}
function neoCafeSettle(now=Date.now()){
  const h=neoHomestead();
  const n=Math.min(h.counter,Math.max(0,Math.floor((now-h.lastSale)/60000)));
  if(n){h.counter-=n;h.earned+=n*2;h.served+=n;h.lastSale+=n*60000;}
  if(!h.counter)h.lastSale=now;
}
function neoPlant(i,key){
  const h=neoHomestead(),c=COVE_CROPS[key];
  if(!c||i<0||i>=h.plots.length||h.plots[i]||G.shells<c.cost)return;
  G.shells-=c.cost;h.plots[i]={key,ready:Date.now()+c.seconds*1000};save();syncHud();neoOpenHomestead('garden');
}
function neoHarvest(i){
  const h=neoHomestead(),p=h.plots[i];if(!p||Date.now()<p.ready)return;
  h.stock[p.key]=(h.stock[p.key]||0)+COVE_CROPS[p.key].yield;h.plots[i]=null;save();neoOpenHomestead('garden');
}
function neoCook(key){
  const h=neoHomestead(),r=COVE_RECIPES[key];if(!r||h.batch||(h.stock[r.ingredient]||0)<r.amount)return;
  h.stock[r.ingredient]-=r.amount;h.batch={key,ready:Date.now()+r.seconds*1000};save();neoOpenHomestead('cafe');
}
function neoStockCounter(){
  const h=neoHomestead();if(!h.batch||Date.now()<h.batch.ready)return;
  neoCafeSettle();if(!h.counter)h.lastSale=Date.now();h.counter+=COVE_RECIPES[h.batch.key].servings;h.batch=null;save();neoOpenHomestead('cafe');
}
let neoHomesteadTimer;
let neoCafeFrame=0;
function neoPaintCafe(cv,h){
  cancelAnimationFrame(neoCafeFrame);
  const resident=cats.filter(c=>!c.visitor);
  const guests=resident.slice(0,h.tables).map(c=>{const copy=new Cat({coatKey:c.coatKey,mascot:c.mascot,markSeed:c.markSeed,x:0,y:0});copy.state='loafing';copy.worn=[...(c.worn||[])];return {copy,name:c.name};});
  const g=cv.getContext('2d'),cloth={cream:'#f8efd8',sage:'#d5e1c6',rose:'#ead0c3'}[h.cloth]||'#f8efd8';
  let last=-Infinity;
  function paint(t){
    if(!cv.isConnected||document.getElementById('neo-homestead').hidden)return;
    neoCafeFrame=requestAnimationFrame(paint);if(document.hidden||t-last<80)return;last=t;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)t=1000;
    g.clearRect(0,0,640,360);g.fillStyle='#ede0c3';g.fillRect(0,0,640,360);
    g.fillStyle='#cadfdb';g.fillRect(205,16,230,86);g.strokeStyle='#bca27b';g.lineWidth=7;g.strokeRect(205,16,230,86);g.beginPath();g.moveTo(320,16);g.lineTo(320,102);g.stroke();
    g.fillStyle='#d9c59d';g.fillRect(0,115,640,245);g.strokeStyle='#cdb88f';g.lineWidth=1;for(let y=140;y<360;y+=35){g.beginPath();g.moveTo(0,y);g.lineTo(640,y);g.stroke();}
    for(let i=0;i<h.tables;i++){
      const x=h.layout==='window'?90+i*115:125+(i%3)*195,y=h.layout==='window'?190:175+Math.floor(i/3)*112;
      if(h.counter&&guests[i]){g.save();g.translate(x,y-8);g.scale(1.4,1.4);guests[i].copy.bob=Math.sin(t/1400+i)*.25;guests[i].copy.blink=t%4800<140?0:3;drawCat(g,guests[i].copy,true);g.restore();}
      g.fillStyle='#a68861';g.fillRect(x-5,y+6,10,35);g.fillStyle=cloth;g.beginPath();g.ellipse(x,y+7,48,20,0,0,Math.PI*2);g.fill();g.strokeStyle='#b59b73';g.stroke();
      if(h.counter){g.fillStyle='#fbf6e8';g.beginPath();g.ellipse(x,y+5,17,8,0,0,Math.PI*2);g.fill();g.fillStyle='#c7965c';g.beginPath();g.ellipse(x,y+3,9,5,0,0,Math.PI*2);g.fill();}
      g.fillStyle='#43543f';g.font='13px sans-serif';g.textAlign='center';g.fillText(h.counter&&guests[i]?guests[i].name:'Table '+(i+1),x,y+60);
    }
  }
  neoCafeFrame=requestAnimationFrame(paint);
}
function neoOpenHomestead(kind){
  closeAllPanels();neoCafeSettle();save();clearInterval(neoHomesteadTimer);cancelAnimationFrame(neoCafeFrame);
  const h=neoHomestead(),garden=kind==='garden';
  let sheet=document.getElementById('neo-homestead');
  if(!sheet){sheet=document.createElement('div');sheet.id='neo-homestead';sheet.className='sheet';document.getElementById('app').append(sheet);panels.homestead=sheet;}
  sheet.hidden=false;
  const time=t=>Math.max(0,Math.ceil((t-Date.now())/1000));
  sheet.innerHTML=`<button class="x" aria-label="Back to the Cove">×</button><div class="kicker">YOUR LITTLE CORNER OF THE COVE</div><h2>${garden?'Cove Garden':'Catmint Café'}</h2><p>${garden?'Plant a patch, return when it is ready, and bring your harvest to the café. Crops never wither.':'Choose what to cook and stock the counter. Your café serves one treat each minute, including while you are away. No shift timer.'}</p><div class="homestead-stock">${Object.entries(COVE_CROPS).map(([k,c])=>`<span>${c.name}: <b>${h.stock[k]||0}</b></span>`).join('')}</div>`;
  if(garden){
    const grid=document.createElement('div');grid.className='homestead-grid';
    h.plots.forEach((p,i)=>{const card=document.createElement('article');card.className='homestead-patch';card.innerHTML=`<h3>Patch ${i+1}</h3>${neoCropArt(p?.key||'carrot',!!p&&!time(p.ready))}`;
      if(p){card.innerHTML+=`<p>${COVE_CROPS[p.key].name}</p><button class="btn" data-ready="${p.ready}" ${time(p.ready)?'disabled':''}>${time(p.ready)?'Growing · '+time(p.ready)+'s':'Harvest'}</button>`;card.querySelector('button').onclick=()=>neoHarvest(i);}
      else for(const [k,c]of Object.entries(COVE_CROPS)){const b=document.createElement('button');b.className='btn';b.textContent=`${c.name} · ${c.cost} shells · ${c.seconds<60?c.seconds+'s':c.seconds/60+'m'}`;b.disabled=G.shells<c.cost;b.onclick=()=>neoPlant(i,k);card.append(b);}
      grid.append(card);});sheet.append(grid);
  }else{
    const room=document.createElement('div');room.className='homestead-cafe-room';room.innerHTML=`<p>${h.counter} treats on the counter · ${h.served} served</p><div class="homestead-tables">${Array.from({length:h.tables},(_,i)=>`<span>Table ${i+1}<br>${h.counter?'Open for guests':'Waiting for treats'}</span>`).join('')}</div>`;sheet.append(room);
    room.querySelector('.homestead-tables').remove();
    const cv=document.createElement('canvas');cv.width=640;cv.height=360;cv.className='homestead-room-art';cv.setAttribute('role','img');cv.setAttribute('aria-label','Your café with '+h.tables+' tables'+(h.counter?' and familiar cat guests':''));room.append(cv);neoPaintCafe(cv,h);
    const note=document.createElement('p');note.className='homestead-greeting';note.setAttribute('aria-live','polite');note.textContent=h.counter?'A familiar table. A little company.':'The tables are ready. Stock the counter to welcome your cats.';room.append(note);
    const welcome=document.createElement('button');welcome.className='btn';welcome.textContent='Welcome a regular';welcome.disabled=!h.counter||!cats.some(c=>!c.visitor);welcome.onclick=()=>{const pool=cats.filter(c=>!c.visitor),c=pool[Math.floor(Math.random()*pool.length)];note.textContent=c.name+[' settles into a favourite seat.',' sniffs the treats and gives a slow blink.',' has come for a snack—and your company.'][Math.floor(Math.random()*3)];};room.append(welcome);
    const style=document.createElement('details');style.className='homestead-style';style.innerHTML='<summary>Make it yours · free styles</summary>';
    for(const key of ['cream','sage','rose']){const b=document.createElement('button');b.className='btn';b.textContent=key+' tablecloth';b.setAttribute('aria-pressed',h.cloth===key);b.onclick=()=>{h.cloth=key;save();neoOpenHomestead('cafe');};style.append(b);}
    for(const key of ['together','window']){const b=document.createElement('button');b.className='btn';b.textContent=key==='together'?'Cozy clusters':'Window seats';b.setAttribute('aria-pressed',h.layout===key);b.onclick=()=>{h.layout=key;save();neoOpenHomestead('cafe');};style.append(b);}sheet.append(style);
    const earnings=document.createElement('button');earnings.className='btn';earnings.textContent=`Collect ${h.earned} shells`;earnings.disabled=!h.earned;earnings.onclick=()=>{neoCafeSettle();G.shells+=h.earned;h.earned=0;save();syncHud();neoOpenHomestead('cafe');};sheet.append(earnings);
    if(h.batch){const b=document.createElement('button');b.className='btn';b.dataset.ready=h.batch.ready;b.textContent=time(h.batch.ready)?`Cooking · ${time(h.batch.ready)}s`:'Stock the counter';b.disabled=!!time(h.batch.ready);b.onclick=neoStockCounter;sheet.append(b);}
    else{const recipes=document.createElement('div');recipes.className='homestead-grid';for(const[k,r]of Object.entries(COVE_RECIPES)){const b=document.createElement('button');b.className='neo-destination';b.innerHTML=`<b>${r.name}</b><small>${r.amount} ${COVE_CROPS[r.ingredient].name.toLowerCase()} · ${r.seconds}s · ${r.servings} servings</small>`;b.disabled=(h.stock[r.ingredient]||0)<r.amount;b.onclick=()=>neoCook(k);recipes.append(b);}sheet.append(recipes);}
  }
  const n=garden?h.plots.length:h.tables,max=garden?8:5,cost=garden?100+(n-4)*75:150+(n-3)*100;
  if(n<max){const expand=document.createElement('button');expand.className='btn';expand.textContent=`Add ${garden?'a garden patch':'a table'} · ${cost} shells`;expand.disabled=G.shells<cost;expand.onclick=()=>{if(neoExpandHomestead(kind))neoOpenHomestead(kind);};sheet.append(expand);}
  const other=document.createElement('button');other.className='btn';other.textContent=garden?'Visit Catmint Café':'Visit Cove Garden';other.onclick=()=>neoOpenHomestead(garden?'cafe':'garden');sheet.append(other);
  sheet.querySelector('.x').onclick=()=>{sheet.hidden=true;clearInterval(neoHomesteadTimer);cancelAnimationFrame(neoCafeFrame);};
  neoHomesteadTimer=setInterval(()=>{if(sheet.hidden){clearInterval(neoHomesteadTimer);return;}if(document.hidden)return;const before=h.served;neoCafeSettle();if(before!==h.served){neoOpenHomestead(kind);return;}for(const b of sheet.querySelectorAll('[data-ready]')){const seconds=time(+b.dataset.ready);b.disabled=seconds>0;b.textContent=seconds?`${garden?'Growing':'Cooking'} · ${seconds}s`:garden?'Harvest':'Stock the counter';}},1000);
}
