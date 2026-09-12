// Neo home layer: bounded local data, existing cats, no new per-frame DOM work.
function neoReadSave(){
  let raw = null;
  try {
    // One-time copy only: Neo never writes to or deletes the original save.
    raw = localStorage.getItem(SAVE_KEY);
    if (!raw && !localStorage.getItem("catmintCove.neo.migrated")) {
      const legacy = localStorage.getItem("catmintCove.save.v9");
      if (legacy) {
        const candidate = JSON.parse(legacy);
        if (candidate && candidate.v === 9 && Array.isArray(candidate.cats)) {
          localStorage.setItem("catmintCove.neo.original-backup", legacy);
          localStorage.setItem(SAVE_KEY, legacy); raw = legacy;
          const rights = localStorage.getItem("catmintCove.iap.v1");
          if (rights) localStorage.setItem(IAP_STORE_KEY, rights);
        }
      }
      localStorage.setItem("catmintCove.neo.migrated", "1");
    }
    if (!raw) for (const k of OLD_SAVE_KEYS) { raw = localStorage.getItem(k); if (raw) break; }
  } catch (e) {}
  return raw;
}
function neoHome(){
  if(!G.neoHome)G.neoHome={cats:{},visits:[],events:[],metrics:false};
  return G.neoHome;
}
function neoCatKey(c){return String(c.markSeed)+'|'+c.coatKey+'|'+String(c.bornAt);}
function neoRecord(c){
  const h=neoHome(),key=neoCatKey(c);
  if(!h.cats[key])h.cats[key]={memories:[],note:'',favorite:false};
  Object.assign(h.cats[key],{name:c.name,coatKey:c.coatKey,markSeed:c.markSeed});
  return h.cats[key];
}
function neoRemember(c,id,text){
  if(!G||!c||c.visitor)return;
  const r=neoRecord(c);if(r.memories.some(m=>m.id===id))return;
  r.memories.push({id,text,t:Date.now()});if(r.memories.length>32)r.memories.shift();
}
function neoGoalEligible(g){
  if(!g)return false;
  // Discovery depends on luck; never make it a required daily ritual.
  if(g.id==='discover')return false;
  if(g.id==='coax')return residentCount()<capacity() && G.shells>=coaxPrice();
  return true;
}
function neoReplaceGoal(g,notify){
  if(g.done||g.claimed)return;
  const used=G.goals.filter(x=>x!==g).map(x=>x.id);
  const choices=GOAL_POOL.filter(d=>neoGoalEligible(d)&&!used.includes(d.id)&&d.id!==g.id);
  const d=choices[0];if(!d){if(notify)toast('These are the available rituals for your Cove today.');return;}
  Object.assign(g,{id:d.id,target:d.gen(),prog:0,done:false,claimed:false,reward:typeof d.reward==='function'?d.reward():{...d.reward}});
  if(notify){save();renderGoals();toast('A fresh little ritual. No cost, no penalty.');}
}
function neoCommunityCare(){
  const beforeFood=G.food||0;let helped=0;
  G.food=Math.max(beforeFood,foodPerDay());
  for(const c of cats){if(c.visitor)continue;if(c.hunger>30||c.thirst>25||c.sick||c.health<70)helped++;c.hunger=Math.min(c.hunger||0,30);c.thirst=Math.min(c.thirst||0,25);
    if(c.sick)clearSick(c,70);c.health=Math.max(c.health||0,70);c._criticalSince=0;c._leaveSince=0;}
  const added=Math.max(0,G.food-beforeFood);
  const message=added>0||helped>0?`Pantry supplies received. ${added>0?'Food topped up to one day. ':''}${helped>0?`${helped} ${helped===1?'cat received':'cats received'} care.`:'Your cats already have their basic care covered.'}`:'Everyone is already cared for, and you have at least one day of food. No supplies needed right now.';
  syncHud();save();toast(message,5);
  const status=document.getElementById('neo-care-status');if(status)status.textContent=message;
  return message;
  neoEvent('community_care');
}
function neoRestoreHome(){
  const h=neoHome();const day=todayKey();if(!h.visits.includes(day)){h.visits.push(day);h.visits=h.visits.slice(-90);}
  for(const c of cats){c._criticalSince=0;c._leaveSince=0;if(!c.visitor)neoRecord(c);}
  neoBuildNavigation();
}
function neoEvent(name){
  if(!G)return;const h=neoHome();if(!h.metrics)return;
  if(!/^[a-z_]{1,60}$/.test(name))return;h.events.push({name,t:Date.now()});if(h.events.length>400)h.events.shift();
}
function neoPortrait(canvasEl,c,scale){
  const g=canvasEl.getContext('2d');g.clearRect(0,0,canvasEl.width,canvasEl.height);
  const portrait=new Cat({coatKey:c.coatKey,star:c.star,markSeed:c.markSeed,mascot:c.mascot,bornAt:c.bornAt,x:0,y:0});
  portrait.worn=[...(c.worn||[])];portrait.state='loafing';portrait.blink=3;portrait.bob=.6;portrait.tail=.3;portrait.trotting=false;
  g.save();g.translate(canvasEl.width/2,canvasEl.height-6);g.scale(scale,scale);drawCat(g,portrait,true);g.restore();
}
function neoCatStoryLink(c){
  let b=document.getElementById('neo-story-link');
  if(!b){b=document.createElement('button');b.id='neo-story-link';b.className='btn small';cc.prefEl.after(b);}
  b.hidden=c.visitor;b.textContent='Our story';b.onclick=()=>neoOpenStory(c);
}
function neoOpenStory(c){
  const r=neoRecord(c);
  openModal(`<div class="neo-story" role="dialog" aria-label="Cat story"><button class="x neo-story-x" id="neo-story-x" aria-label="Close cat story">✕</button><div class="kicker">A little life, shared with you</div>
    <canvas id="neo-portrait" width="220" height="180"></canvas>
    <h2>${esc(c.name)}</h2><p class="neo-story-sub">${esc(c.title||bondName(c.bond||0))}</p>
    <div class="neo-story-facts"><p><b>Loves</b> ${esc(catPrefLine(c))}</p>
    <p><b>Company</b> ${c.friend?esc(c.friend)+' is a familiar friend.':'Still finding their favorite company.'}</p>
    <p>${c.quirkKnown?esc(catQuirkLine(c)):'There are still little habits to discover together.'}</p></div>
    <label class="neo-note-label" for="neo-note">What makes ${esc(c.name)} special to you?</label>
    <textarea id="neo-note" maxlength="240" placeholder="A nickname, a real-life resemblance, a little thing you love…">${esc(r.note)}</textarea>
    <button class="btn" id="neo-pin">${r.favorite?'♥ Pinned to your journal':'♡ Pin to your journal'}</button>
    <div class="neo-memory-list">${r.memories.length?r.memories.map(m=>`<article><span>${new Date(m.t).toLocaleDateString(undefined,{month:'short',day:'numeric'})}</span><p>${esc(m.text)}</p></article>`).join(''):'<p>Your shared memories begin with a hello. Spend time together; the little things will stay here.</p>'}</div>
    <div class="row"><button class="btn primary" id="neo-story-save">Keep this memory</button><button class="btn" id="neo-story-close">Close</button></div>
    </div>`);
  neoPortrait(document.getElementById('neo-portrait'),c,2.4);
  document.getElementById('neo-pin').onclick=()=>{r.favorite=!r.favorite;document.getElementById('neo-pin').textContent=r.favorite?'♥ Pinned to your journal':'♡ Pin to your journal';save();};
  document.getElementById('neo-story-save').onclick=()=>{r.note=document.getElementById('neo-note').value.trim().slice(0,240);save();neoEvent('personal_note_saved');closeModal();if(!panels.today.hidden)neoRenderJournal();};
  document.getElementById('neo-story-close').onclick=closeModal;
  document.getElementById('neo-story-x').onclick=closeModal;
  document.getElementById('neo-story-x').focus();
  neoEvent('cat_story_open');
}
function neoRenderCats(){
  let root=document.getElementById('neo-cat-roster');if(!root){root=document.createElement('div');root.id='neo-cat-roster';panels.dex.querySelector('.neo-dex-header').after(root);}
  root.innerHTML=`<p class="muted">Little paws. Familiar faces. A story for every cat.</p><label class="neo-search-label" for="neo-cat-search">Find a cat</label><input id="neo-cat-search" type="search" placeholder="Search by name" autocomplete="off"><p id="neo-cat-count" class="muted" aria-live="polite"></p><div class="neo-cat-grid"></div><div class="neo-roster-actions"><button class="btn primary" id="neo-invite">Invite a cat · ◈ ${coaxPrice()}</button><button class="btn" id="neo-care" aria-describedby="neo-care-desc">${neoUIIcon("pantry")} Community Pantry</button></div><p id="neo-care-desc" class="muted">Free help when supplies or care run low: tops food up to one day, eases hunger and thirst, clears sickness, and restores health to at least 70%. If everyone is already cared for, nothing is added.</p><p id="neo-care-status" role="status" aria-live="polite"></p><h3 class="neo-section-label">Coats you have met</h3>`;
  const grid=root.querySelector('.neo-cat-grid');
  for(const c of cats.filter(c=>!c.visitor)){
    const b=document.createElement('button');b.className='neo-cat-tile';b.dataset.name=c.name.toLocaleLowerCase();
    b.innerHTML=`<canvas width="120" height="110"></canvas><b>${esc(c.name)}</b><span>${esc(c.title||bondName(c.bond||0))}</span>`;
    b.onclick=()=>neoOpenStory(c);grid.append(b);neoPortrait(b.querySelector('canvas'),c,1.6);
  }
  const search=document.getElementById('neo-cat-search'),count=document.getElementById('neo-cat-count');
  const filter=()=>{let shown=0;const query=search.value.trim().toLocaleLowerCase();for(const tile of grid.children){tile.hidden=!tile.dataset.name.includes(query);if(!tile.hidden)shown++;}count.textContent=query?`${shown} ${shown===1?"cat":"cats"} found`:`${grid.children.length} cats · tap one for their story`;};
  search.oninput=filter;filter();
  document.getElementById('neo-invite').onclick=()=>{closeAllPanels();document.getElementById('coaxBtn').click();};
  document.getElementById('neo-care').onclick=()=>{neoCommunityCare();};
}
function neoRenderJournal(){
  const root=document.getElementById('neoJournal');if(!root)return;
  const home=neoHome(),residents=cats.filter(c=>!c.visitor);
  root.innerHTML=`<div class="neo-journal-cover"><span class="kicker">THE LITTLE THINGS STAY</span><h3>${esc(coveName())}</h3><p>${residents.length} familiar faces. A place to come back to.</p><p class="neo-promise">Your cats are cared for while you are away. Lovely days never reset.</p></div><div class="neo-journal-pins"></div><div class="neo-journal-tools"><button class="btn" id="neo-journal-photo">Capture a moment</button><button class="btn" id="neo-journal-cats">Their stories</button></div>`;
  const pins=root.querySelector('.neo-journal-pins');
  for(const c of residents.filter(c=>neoRecord(c).favorite).slice(0,6)){const b=document.createElement('button');b.className='btn';b.textContent='♥ '+c.name;b.onclick=()=>neoOpenStory(c);pins.append(b);}
  const activeKeys=new Set(residents.map(neoCatKey));
  const remembered=Object.entries(home.cats).filter(([key,r])=>!activeKeys.has(key)&&r.name).map(([,r])=>r);
  if(remembered.length){
    const archive=document.createElement('details');archive.className='neo-journal-archive';
    const heading=document.createElement('summary');heading.textContent=`Cove memories · ${remembered.length} ${remembered.length===1?'cat':'cats'}`;archive.append(heading);
    const intro=document.createElement('p');intro.className='muted';intro.textContent='Notes and moments from cats who have shared your cove.';archive.append(intro);
    const list=document.createElement('div');list.className='neo-archive-cats';
    if(remembered.length>8){const search=document.createElement('input');search.type='search';search.placeholder='Find a cat by name';search.setAttribute('aria-label','Search Cove memories');search.oninput=()=>{const query=search.value.trim().toLocaleLowerCase();for(const entry of list.children)entry.hidden=!entry.dataset.name.includes(query);};archive.append(search);}
    for(const r of remembered){
      const entry=document.createElement('details');entry.className='neo-memory-list';entry.dataset.name=r.name.toLocaleLowerCase();
      const title=document.createElement('summary');title.textContent=r.name;entry.append(title);
      if(r.note){const note=document.createElement('p');note.textContent=r.note;entry.append(note);}
      const memories=Array.isArray(r.memories)?r.memories:[];
      for(const m of memories){if(!m.text)continue;const moment=document.createElement('article');if(Number.isFinite(m.t)){const date=document.createElement('span');date.textContent=new Date(m.t).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});moment.append(date);}const line=document.createElement('p');line.textContent=m.text;moment.append(line);entry.append(moment);}
      if(!r.note&&!memories.some(m=>m.text)){const empty=document.createElement('p');empty.className='muted';empty.textContent='No saved notes or moments yet.';entry.append(empty);}
      list.append(entry);
    }
    archive.append(list);root.append(archive);
  }
  if((G.postcards||[]).length){
    const mail=document.createElement('details');mail.className='neo-journal-archive';
    const title=document.createElement('summary');title.textContent=`Postcards · ${G.postcards.length}`;mail.append(title);
    for(const pc of G.postcards){const button=document.createElement('button');button.className='neo-postcard-preview';button.textContent=`${pc.cat} · ${(ADV_DESTS[pc.dest]||ADV_DESTS.forest).name}`;button.onclick=()=>showPostcard(pc.text,pc.cat,pc.dest,undefined,pc);mail.append(button);}root.append(mail);
  }
  document.getElementById('neo-journal-photo').onclick=()=>{closeAllPanels();document.getElementById('photoBtn').click();};
  document.getElementById('neo-journal-cats').onclick=()=>togglePanel('dex');
}
function neoOpenExplore(){
  const b=document.getElementById('neo-go-festival'),ready=festUnlocked()||volleyReady();
  b.disabled=!ready;b.querySelector('small').textContent=ready?'Your familiar cats. A little friendly chaos.':'Welcome two cats and finish meeting Midknight.';
  togglePanel('explore');neoEvent('explore_open');
}
function neoBuildNavigation(){
  const actions=document.getElementById('actions');
  const originals=['coaxBtn','photoBtn'];
  for(const id of originals){document.getElementById(id).classList.add('neo-secondary-action');}
  const catsBtn=document.getElementById('dexBtn');catsBtn.setAttribute('aria-label','Catdex');catsBtn.querySelector('.lbl').textContent='Catdex';
  const journal=document.getElementById('todayBtn');journal.querySelector('.lbl').textContent='Journal';
  const explore=document.createElement('button');explore.className='btn';explore.id='neo-activities-nav';explore.innerHTML='<span class="ico" aria-hidden="true"><img class="neo-ui-icon" src="art/icon-keepsake-activities.svg" alt="" width="28" height="28"></span><span class="lbl">Activities</span>';explore.onclick=neoOpenExplore;journal.before(explore);
  const shop=document.getElementById('shopBtn');shop.setAttribute('aria-label','Shop');journal.before(shop);

  const menuIcons={"dexBtn": "<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"#67543f\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path fill=\"#34312f\" d=\"M24 23 22 8l10 7 11-7 1 16Z\"/><path fill=\"#f8efd7\" d=\"m31 16-2 7h7l-3-7-1 3Z\" stroke=\"none\"/><path fill=\"#e2d0a6\" d=\"M12 21q19-3 39 0v34H17q-6 0-6-6Z\"/><path fill=\"#faf2dc\" d=\"M17 19q19-2 35 1l-1 30H18q-4 0-4 3V23q0-4 3-4Z\"/><path stroke=\"#92a58a\" stroke-width=\"5\" d=\"M19 22v25\"/><path fill=\"#94aa91\" d=\"M28 32q8-5 14 0v9q-8 4-14-1Z\"/><path stroke=\"#f8efd7\" stroke-width=\"2\" d=\"m31 36 3 3 5-6\"/><path fill=\"#c98770\" d=\"m41 48 6 0v10l-3-2-3 2Z\"/></svg>", "todayBtn": "<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"#67543f\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path fill=\"#e5d6b5\" d=\"m16 12 31 1q5 0 5 5l-2 36-35-1q-5 0-5-5l2-31q0-5 4-5Z\"/><path fill=\"#89a7a6\" d=\"m17 9 31 2q4 0 4 4l-2 34-33-1q-5 0-5 4l1-37q0-6 4-6Z\"/><path stroke=\"#d9e3d5\" d=\"m20 14-1 29\"/><path fill=\"#f4ecd5\" d=\"m29 20 15 1-1 20-16-1Z\"/><path stroke=\"#768d68\" d=\"m33 36 5-12\"/><path fill=\"#91a77c\" stroke=\"none\" d=\"M36 29q-9 0-6-6 7 0 6 6m0 2q8-7 9-1-4 5-9 1\"/><path fill=\"#c88c75\" d=\"m38 49 7 0-1 10-3-3-3 2Z\"/></svg>", "shopBtn": "<svg viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"#67543f\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path stroke-width=\"4\" d=\"M19 29q0-20 13-20t13 20\"/><path fill=\"#d9b47e\" d=\"m9 29 6 24q17 5 34-1l6-23Z\"/><path fill=\"#91aa91\" d=\"M29 24q10-2 20 2l-3 18-7-3-5 2-2-12Z\"/><path fill=\"#efe1bd\" d=\"M9 27q19 3 46 0v7q-27 4-46 0Z\"/><path stroke=\"#ad875b\" stroke-width=\"1.8\" d=\"m20 39 2 11m7-11 1 12m9-4v4m-24-7 17 1m16 0h3\"/><path stroke=\"#d6e0c6\" d=\"m38 26 2 12\"/></svg>", "neo-activities-nav": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 64 64\" fill=\"none\" stroke=\"#67543f\" stroke-width=\"2.3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path fill=\"#faf2dc\" d=\"m8 16 15-5 18 5 15-5v41l-15 4-18-6-15 5Z\"/><path stroke=\"#c9bd9e\" d=\"M23 12v37m18-32v37\"/><circle cx=\"32\" cy=\"32\" r=\"13\" fill=\"#91aa91\"/><path fill=\"#faf2dc\" d=\"m32 20 4 9 8 3-9 4-3 8-4-9-8-3 9-4Z\"/><circle cx=\"32\" cy=\"32\" r=\"2\" fill=\"#c88c75\"/></svg>"};
  for(const [id,svg] of Object.entries(menuIcons)){const icon=document.getElementById(id).querySelector(".ico");if(icon){icon.innerHTML=svg;icon.setAttribute("aria-hidden","true");}}
  actions.setAttribute('role','navigation');actions.setAttribute('aria-label','Main menu');
  const sheet=document.createElement('div');sheet.className='sheet';sheet.hidden=true;sheet.id='neo-explore';
  sheet.innerHTML=`<button class="x" id="neo-explore-close" aria-label="Close Activities">✕</button><div class="kicker">A LITTLE ADVENTURE, AT YOUR PACE</div><h2>Activities</h2><p class="muted">Stay for a game, send a postcard, or settle in somewhere quiet.</p><div class="neo-explore-grid">
  <button class="neo-destination" id="neo-go-festival"><span>${neoUIIcon("festival")}</span><b>Cove Festival</b><small>Your familiar cats. A little friendly chaos.</small></button>
  <button class="neo-destination" id="neo-go-adventure"><span>${neoUIIcon("adventure")}</span><b>Adventures</b><small>A little trip. Something to bring home.</small></button>
  <button class="neo-destination" id="neo-go-rest"><span>${neoUIIcon("rest")}</span><b>Rainy retreat</b><small>No chores. Just rain and company.</small></button>
  </div>
  <details class="neo-feedback"><summary>Help shape the Cove</summary><p>Your feedback can help us make this little home better.</p><button class="btn" id="neo-playtest">Private playtest notebook</button></details>`;
  document.getElementById('app').append(sheet);panels.explore=sheet;
  document.getElementById('neo-explore-close').onclick=closeAllPanels;
  document.getElementById('neo-go-festival').onclick=()=>{closeAllPanels();document.getElementById('festBtn').click();};
  document.getElementById('neo-go-adventure').onclick=()=>{closeAllPanels();openAdventurePicker();};
  document.getElementById('neo-go-rest').onclick=()=>{closeAllPanels();document.getElementById('restBtn').click();};
  document.getElementById('neo-playtest').onclick=neoPlaytest;
  panels.dex.querySelector('h2').textContent='Catdex';panels.shop.querySelector('h2').textContent='Tideline Shop';
}
function neoPlaytest(){
  const h=neoHome();openModal(`<h2>Your private playtest notebook</h2><p>Optional interaction counts stay on this device. No names, notes, or memories are exported. Nothing is sent automatically.</p><button class="btn" id="neo-metrics">${h.metrics?'Stop':'Start'} recording interactions</button><button class="btn" id="neo-export">Download anonymous counts</button><button class="btn" id="neo-metrics-close">Close</button>`);
  document.getElementById('neo-metrics').onclick=()=>{h.metrics=!h.metrics;save();neoPlaytest();};
  document.getElementById('neo-export').onclick=()=>{const counts={};for(const e of h.events)counts[e.name]=(counts[e.name]||0)+1;const blob=new Blob([JSON.stringify({build:'neo-home-1',counts},null,2)],{type:'application/json'});const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download='cove-playtest.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  document.getElementById('neo-metrics-close').onclick=closeModal;
}
function neoFestivalLanterns(g,x0,y,w,sagAt){
  const night=neoLight(nowHours()).night;if(night<=0)return;
  g.save();for(let i=0;i<Math.min(12,Math.ceil(w/120));i++){
    const f=(i+.5)/Math.min(12,Math.ceil(w/120)),x=x0+f*w,yy=sagAt(f)+13;
    neoWarmGlow(g,x,yy,42,46,night*.45);
    g.strokeStyle='#796649';g.lineWidth=1;g.beginPath();g.moveTo(x,yy-13);g.lineTo(x,yy-5);g.stroke();
    g.globalAlpha=night;g.fillStyle='#ffdda0';g.beginPath();g.ellipse(x,yy,5,7,0,0,Math.PI*2);g.fill();
  }g.restore();
}
// A Little Hello: empty foreground taps, no rewards or camera changes.
let neoHelloCount=0,neoHelloTarget=3+Math.floor(Math.random()*3),neoHelloLast=0,neoHelloUntil=0,neoHelloPrevious=null;
function neoHelloTap(x,y,sx,sy){
  const now=performance.now();
  if(!Number.isFinite(sx)||sy<innerHeight*.68||_focus||_placing||_arranging||restMode||festMode||anyPanelOpen()||now<neoHelloUntil||movableAt(x,y))return;
  if(now-neoHelloLast>2500)neoHelloCount=0;
  neoHelloLast=now;if(++neoHelloCount<neoHelloTarget)return;
  neoHelloCount=0;neoHelloTarget=3+Math.floor(Math.random()*3);
  const available=cats.filter(c=>!c.visitor&&!c.sick&&c.state!=='sleeping');if(!available.length)return;
  const choices=available.filter(c=>c!==neoHelloPrevious),pool=choices.length?choices:available;
  const c=pool[Math.floor(Math.random()*pool.length)];neoHelloPrevious=c;neoHelloUntil=now+30000;
  const shell=document.createElement('div');shell.className='neo-little-hello';shell.setAttribute('role','status');shell.setAttribute('aria-live','polite');
  const size=Math.min(300,innerWidth*.68),center=clamp(sx,size/2+12,innerWidth-size/2-12);
  shell.style.width=size+'px';shell.style.left=center+'px';
  const portrait=document.createElement('canvas');portrait.width=400;portrait.height=320;portrait.setAttribute('aria-hidden','true');
  const line=document.createElement('p');line.textContent=c.name+[' noticed your tapping.',' has come to investigate.',' heard there might be snacks.',' would like a word.'][Math.floor(Math.random()*4)];
  // Attach to the viewport, not the Cove/menu layout: the shoulder crop meets the screen edge.
  shell.append(line,portrait);document.body.append(shell);
  const copy=new Cat({coatKey:c.coatKey,star:c.star,markSeed:c.markSeed,mascot:c.mascot,bornAt:c.bornAt,x:0,y:0});copy.worn=[...(c.worn||[])];Object.assign(copy,{mood:75,face:1,squash:0,bob:.6,tail:.3,blink:3,walk:0,walkAmt:0,state:'wantpet',stateT:0,stateDur:12});
  const g=portrait.getContext('2d');g.save();g.translate(200,435.2);g.scale(6,6);drawCat(g,copy,true);g.restore();
  let step=0;const lines=['Sniff… sniff.','No snacks? Just you? Perfect.'];
  const timer=setInterval(()=>{if(anyPanelOpen()||restMode||festMode||_placing||_arranging){clearInterval(timer);shell.remove();return;}step++;if(step===3)line.textContent=lines[0];if(step===6)line.textContent=lines[1];if(step>=10){clearInterval(timer);shell.remove();}},500);
}
