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
  return G.homestead;
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
function neoOpenHomestead(kind){
  closeAllPanels();neoCafeSettle();save();clearInterval(neoHomesteadTimer);
  const h=neoHomestead(),garden=kind==='garden';
  let sheet=document.getElementById('neo-homestead');
  if(!sheet){sheet=document.createElement('div');sheet.id='neo-homestead';sheet.className='sheet';document.getElementById('app').append(sheet);panels.homestead=sheet;}
  sheet.hidden=false;
  const time=t=>Math.max(0,Math.ceil((t-Date.now())/1000));
  sheet.innerHTML=`<button class="x" aria-label="Back to the Cove">×</button><div class="kicker">YOUR LITTLE CORNER OF THE COVE</div><h2>${garden?'Cove Garden':'Catmint Café'}</h2><p>${garden?'Plant a patch, return when it is ready, and bring your harvest to the café. Crops never wither.':'Choose what to cook and stock the counter. Your café serves one treat each minute, including while you are away. No shift timer.'}</p><div class="homestead-stock">${Object.entries(COVE_CROPS).map(([k,c])=>`<span>${c.name}: <b>${h.stock[k]||0}</b></span>`).join('')}</div>`;
  if(garden){
    const grid=document.createElement('div');grid.className='homestead-grid';
    h.plots.forEach((p,i)=>{const card=document.createElement('article');card.className='homestead-patch';card.innerHTML=`<h3>Patch ${i+1}</h3>`;
      if(p){card.innerHTML+=`<p>${COVE_CROPS[p.key].name}</p><button class="btn" data-ready="${p.ready}" ${time(p.ready)?'disabled':''}>${time(p.ready)?'Growing · '+time(p.ready)+'s':'Harvest'}</button>`;card.querySelector('button').onclick=()=>neoHarvest(i);}
      else for(const [k,c]of Object.entries(COVE_CROPS)){const b=document.createElement('button');b.className='btn';b.textContent=`${c.name} · ${c.cost} shells · ${c.seconds<60?c.seconds+'s':c.seconds/60+'m'}`;b.disabled=G.shells<c.cost;b.onclick=()=>neoPlant(i,k);card.append(b);}
      grid.append(card);});sheet.append(grid);
  }else{
    const room=document.createElement('div');room.className='homestead-cafe-room';room.innerHTML=`<p>${h.counter} treats on the counter · ${h.served} served</p><div class="homestead-tables">${Array.from({length:h.tables},(_,i)=>`<span>Table ${i+1}<br>${h.counter?'Open for guests':'Waiting for treats'}</span>`).join('')}</div>`;sheet.append(room);
    const residents=cats.filter(c=>!c.visitor);
    for(const [i,table]of [...room.querySelectorAll('.homestead-tables>span')].entries()){
      if(!h.counter||!residents.length)continue;const cv=document.createElement('canvas');cv.width=152;cv.height=128;table.prepend(cv);
      const source=residents[i%residents.length],copy=new Cat({coatKey:source.coatKey,mascot:source.mascot,markSeed:source.markSeed,x:0,y:0});copy.state='loafing';copy.worn=[...(source.worn||[])];const g=cv.getContext('2d');g.translate(76,110);g.scale(2,2);drawCat(g,copy,true);
    }
    const earnings=document.createElement('button');earnings.className='btn';earnings.textContent=`Collect ${h.earned} shells`;earnings.disabled=!h.earned;earnings.onclick=()=>{neoCafeSettle();G.shells+=h.earned;h.earned=0;save();syncHud();neoOpenHomestead('cafe');};sheet.append(earnings);
    if(h.batch){const b=document.createElement('button');b.className='btn';b.dataset.ready=h.batch.ready;b.textContent=time(h.batch.ready)?`Cooking · ${time(h.batch.ready)}s`:'Stock the counter';b.disabled=!!time(h.batch.ready);b.onclick=neoStockCounter;sheet.append(b);}
    else{const recipes=document.createElement('div');recipes.className='homestead-grid';for(const[k,r]of Object.entries(COVE_RECIPES)){const b=document.createElement('button');b.className='neo-destination';b.innerHTML=`<b>${r.name}</b><small>${r.amount} ${COVE_CROPS[r.ingredient].name.toLowerCase()} · ${r.seconds}s · ${r.servings} servings</small>`;b.disabled=(h.stock[r.ingredient]||0)<r.amount;b.onclick=()=>neoCook(k);recipes.append(b);}sheet.append(recipes);}
  }
  const other=document.createElement('button');other.className='btn';other.textContent=garden?'Visit Catmint Café':'Visit Cove Garden';other.onclick=()=>neoOpenHomestead(garden?'cafe':'garden');sheet.append(other);
  sheet.querySelector('.x').onclick=()=>{sheet.hidden=true;clearInterval(neoHomesteadTimer);};
  neoHomesteadTimer=setInterval(()=>{if(sheet.hidden){clearInterval(neoHomesteadTimer);return;}if(document.hidden)return;const before=h.served;neoCafeSettle();if(before!==h.served){neoOpenHomestead(kind);return;}for(const b of sheet.querySelectorAll('[data-ready]')){const seconds=time(+b.dataset.ready);b.disabled=seconds>0;b.textContent=seconds?`${garden?'Growing':'Cooking'} · ${seconds}s`:garden?'Harvest':'Stock the counter';}},1000);
}
