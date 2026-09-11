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
  G.food=Math.max(G.food||0,foodPerDay());
  for(const c of cats){if(c.visitor)continue;c.hunger=Math.min(c.hunger||0,30);c.thirst=Math.min(c.thirst||0,25);
    if(c.sick)clearSick(c,70);c.health=Math.max(c.health||0,70);c._criticalSince=0;c._leaveSince=0;}
  syncHud();save();toast('The community pantry has covered the basics. Everyone is safe.');
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
  let root=document.getElementById('neo-cat-roster');if(!root){root=document.createElement('div');root.id='neo-cat-roster';panels.dex.querySelector('h2').after(root);}
  root.innerHTML=`<p class="muted">A familiar face, a favorite spot, a story of their own.</p><div class="neo-cat-grid"></div><div class="neo-roster-actions"><button class="btn primary" id="neo-invite">Invite a cat · ◈ ${coaxPrice()}</button><button class="btn" id="neo-care">Free basic care</button></div><h3 class="neo-section-label">Coats you have met</h3>`;
  const grid=root.querySelector('.neo-cat-grid');
  for(const c of cats.filter(c=>!c.visitor)){
    const b=document.createElement('button');b.className='neo-cat-tile';
    b.innerHTML=`<canvas width="120" height="110"></canvas><b>${esc(c.name)}</b><span>${esc(c.title||bondName(c.bond||0))}</span>${c.friend?`<small>Often with ${esc(c.friend)}</small>`:''}`;
    b.onclick=()=>neoOpenStory(c);grid.append(b);neoPortrait(b.querySelector('canvas'),c,1.6);
  }
  document.getElementById('neo-invite').onclick=()=>{closeAllPanels();document.getElementById('coaxBtn').click();};
  document.getElementById('neo-care').onclick=()=>{neoCommunityCare();neoRenderCats();};
}
function neoRenderJournal(){
  const root=document.getElementById('neoJournal');if(!root)return;
  const home=neoHome(),residents=cats.filter(c=>!c.visitor);
  root.innerHTML=`<div class="neo-journal-cover"><span class="kicker">THE LITTLE THINGS STAY</span><h3>${esc(coveName())}</h3><p>${residents.length} familiar faces. A place to come back to.</p><p class="neo-promise">Your cats are cared for while you are away. Lovely days never reset.</p></div><div class="neo-journal-pins"></div><div class="neo-journal-tools"><button class="btn" id="neo-journal-photo">Capture a moment</button><button class="btn" id="neo-journal-cats">Their stories</button></div>`;
  const pins=root.querySelector('.neo-journal-pins');
  for(const c of residents.filter(c=>neoRecord(c).favorite).slice(0,6)){const b=document.createElement('button');b.className='btn';b.textContent='♥ '+c.name;b.onclick=()=>neoOpenStory(c);pins.append(b);}
  const activeKeys=new Set(residents.map(neoCatKey));
  for(const [key,r] of Object.entries(home.cats)){if(activeKeys.has(key)||!r.name)continue;
    const entry=document.createElement('details');entry.className='neo-memory-list';const title=document.createElement('summary');title.textContent=r.name+' · always part of the story';entry.append(title);
    for(const text of [r.note,...r.memories.map(m=>m.text)].filter(Boolean)){const line=document.createElement('p');line.textContent=text;entry.append(line);}root.append(entry);
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
  const originals=['coaxBtn','shopBtn','photoBtn'];
  for(const id of originals){document.getElementById(id).classList.add('neo-secondary-action');}
  const home=document.createElement('button');home.className='btn';home.id='neo-home-nav';home.textContent='⌂ Cove';
  home.onclick=()=>{closeAllPanels();hideCatCard(true);};actions.prepend(home);
  const catsBtn=document.getElementById('dexBtn');catsBtn.setAttribute('aria-label','Your cats');catsBtn.querySelector('.lbl').textContent='Cats';
  const journal=document.getElementById('todayBtn');journal.querySelector('.lbl').textContent='Journal';
  const explore=document.createElement('button');explore.className='btn';explore.textContent='✧ Explore';explore.onclick=neoOpenExplore;journal.before(explore);
  const sheet=document.createElement('div');sheet.className='sheet';sheet.hidden=true;sheet.id='neo-explore';
  sheet.innerHTML=`<button class="x" id="neo-explore-close" aria-label="Close Explore">✕</button><div class="kicker">A LITTLE ADVENTURE, AT YOUR PACE</div><h2>Beyond the everyday</h2><p class="muted">Stay for a game, send a postcard, or settle in somewhere quiet.</p><div class="neo-explore-grid">
  <button class="neo-destination" id="neo-go-festival"><span>🎏</span><b>Cove Festival</b><small>Your familiar cats. A little friendly chaos.</small></button>
  <button class="neo-destination" id="neo-go-adventure"><span>✉</span><b>Adventures</b><small>A little trip. Something to bring home.</small></button>
  <button class="neo-destination" id="neo-go-rest"><span>☾</span><b>Rainy retreat</b><small>No chores. Just rain and company.</small></button>
  <button class="neo-destination" id="neo-go-shop"><span>❀</span><b>Tideline Shop</b><small>Make a corner of the Cove your own.</small></button></div>
  <details class="neo-feedback"><summary>Help shape the Cove</summary><p>Your feedback can help us make this little home better.</p><button class="btn" id="neo-playtest">Private playtest notebook</button></details>`;
  document.getElementById('app').append(sheet);panels.explore=sheet;
  document.getElementById('neo-explore-close').onclick=closeAllPanels;
  document.getElementById('neo-go-festival').onclick=()=>{closeAllPanels();document.getElementById('festBtn').click();};
  document.getElementById('neo-go-adventure').onclick=()=>{closeAllPanels();openAdventurePicker();};
  document.getElementById('neo-go-rest').onclick=()=>{closeAllPanels();document.getElementById('restBtn').click();};
  document.getElementById('neo-go-shop').onclick=()=>togglePanel('shop');
  document.getElementById('neo-playtest').onclick=neoPlaytest;
  panels.dex.querySelector('h2').textContent='Your cats';panels.shop.querySelector('h2').textContent='Tideline Shop';
}
function neoPlaytest(){
  const h=neoHome();openModal(`<h2>Your private playtest notebook</h2><p>Optional interaction counts stay on this device. No names, notes, or memories are exported. Nothing is sent automatically.</p><button class="btn" id="neo-metrics">${h.metrics?'Stop':'Start'} recording interactions</button><button class="btn" id="neo-export">Download anonymous counts</button><button class="btn" id="neo-metrics-close">Close</button>`);
  document.getElementById('neo-metrics').onclick=()=>{h.metrics=!h.metrics;save();neoPlaytest();};
  document.getElementById('neo-export').onclick=()=>{const counts={};for(const e of h.events)counts[e.name]=(counts[e.name]||0)+1;const blob=new Blob([JSON.stringify({build:'neo-home-1',counts},null,2)],{type:'application/json'});const a=document.createElement('a');const url=URL.createObjectURL(blob);a.href=url;a.download='cove-playtest.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  document.getElementById('neo-metrics-close').onclick=closeModal;
}
function neoFestivalLanterns(g,x0,y,w,sagAt){
  const night=neoLight(nowHours()).night;if(night<.05)return;
  g.save();for(let i=0;i<Math.min(12,Math.ceil(w/120));i++){
    const f=(i+.5)/Math.min(12,Math.ceil(w/120)),x=x0+f*w,yy=sagAt(f)+13;
    const glow=g.createRadialGradient(x,yy,2,x,yy,34);glow.addColorStop(0,'rgba(255,210,128,'+(night*.26)+')');glow.addColorStop(1,'rgba(255,210,128,0)');
    g.fillStyle=glow;g.fillRect(x-34,yy-34,68,68);g.strokeStyle='#796649';g.lineWidth=1;g.beginPath();g.moveTo(x,yy-13);g.lineTo(x,yy-5);g.stroke();
    g.fillStyle='#ffdda0';g.beginPath();g.ellipse(x,yy,5,7,0,0,Math.PI*2);g.fill();
  }g.restore();
}