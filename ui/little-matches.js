/* Little Matches — isolated activity state, persisted in the existing Neo save. */
window.createLittleMatches=function(api){
'use strict';
const rewards=api.rewards;
let previewCat=null;
let raf=0,lastFrame=0,lastAction=Date.now(),mood='watching',jumpAt=-10000,walkUntil=0,misses=0,finishTimer=0,activePopup=null;
const chapters=['Familiar Faces','Favourite Things','A Place Together'];
// Pair counts stay in {3,4,6,8} on purpose — deck.length (size*2) then always
// divides evenly into the board's 3-or-4-column grid (renderBoard's --cols).
// 5s and 7s used to sneak in here and leave a half-empty last row of 2 cards
// on about a third of the levels.
const curve=[3,3,4,3,4,4,3,4,4,4,4,4,6,4,6,6,4,6,4,6,6,8,6,8,6,8,6,8,6,8];
const coatPools=[['ginger','black','white','siamese','calico','rosewater','tuxedo','browntab'],['ginger','white','calico','siamese','tuxedo','russian','cream','rosewater'],['prism','rosewater','van','smoke','lynxpoint','silver','greytab','tuxedo','ginger','white']];
const objKeys=['food','bed','toy','flowers','lantern','birdbath','windmill','bunting'];
const favours={peek:['Little peek','Choose four cards to see briefly.'],friend:['Find a friend','Turn over one card; your cat finds its pair.'],second:['Second look','See your previous two cards again.']};
let roster=[],catalog=null,dlg=null,round=null,first=null,busy=false,picking=false,picks=[],timer=null,countdownTimer=null,epoch=0,revealed=[],speaker=0;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const state=()=>{const s=api.state();s.done ||= {};s.tone ||= 'sage';s.endless ||= {rounds:0};return s};
const persist=()=>{state().round=round;api.save()};
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function shuffle(a,r){a=a.slice();for(let i=a.length-1;i;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function build(n){const r=rng(n*1777+83),ch=Math.floor((n-1)/10),size=curve[n-1];let keys=shuffle(coatPools[ch],r).slice(0,ch===0?size:Math.ceil(size/2)).map(k=>'cat:'+k);if(ch>0)keys.push(...shuffle(objKeys,r).slice(0,size-keys.length).map(k=>'obj:'+k));return shuffle(keys.flatMap(k=>[k,k]),r)}
function buildEndless(){const size=8,pool=[...new Set(coatPools.flat())];let keys=shuffle(pool,Math.random).slice(0,Math.ceil(size/2)).map(k=>'cat:'+k);keys.push(...shuffle(objKeys,Math.random).slice(0,size-keys.length).map(k=>'obj:'+k));return shuffle(keys.flatMap(k=>[k,k]),Math.random)}
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function button(text,fn,primary=false){const b=el('button','lm-btn'+(primary?' lm-primary':''),text);b.type='button';b.onclick=()=>{if(text)api.feedback?.('tap');fn()};return b}
// Same as button(), but with one of the game's own hand-drawn icons in
// front of the label instead of an emoji — keeps every control on the
// same visual language as the rest of Catmint Cove's UI.
function iconButton(iconKey,label,fn,primary=false){const b=button('',fn,primary);b.classList.add('lm-icon-btn');b.innerHTML=neoUIIcon(iconKey)+'<span>'+label+'</span>';return b}
function img(key,cls){const i=el('img',cls);i.src=catalog[key].image;i.alt='';return i}
function companion(){return roster.find(c=>c.id===(previewCat||round?.cat))||roster[0]||{name:'Your companion',key:'midknight'}}
function say(text){const t=dlg.querySelector('.lm-speech');if(t)t.textContent=text}
function clear(){cancelAnimationFrame(raf);raf=0;clearTimeout(finishTimer);finishTimer=0;activePopup?.close();activePopup?.remove();activePopup=null;if(round?.shufflePending)openingShuffle();epoch++;clearTimeout(timer);timer=null;clearInterval(countdownTimer);countdownTimer=null;busy=false;picking=false;picks=[];revealed=[];first=null}
function close(){clear();persist();dlg.close()}
function pauseReveal(indices,message,wrong=false){busy=true;revealed=indices;renderBoard();if(wrong){api.feedback?.('miss');for(const i of indices){const card=dlg.querySelector('[data-card="'+i+'"]');card?.classList.add('lm-miss');if(card&&!reduced())card.animate([{transform:'scale(1)'},{transform:'scale(.985)'},{transform:'scale(1)'}],{duration:380,easing:'ease-in-out'})}}say(message);const e=epoch;timer=setTimeout(()=>{if(e!==epoch)return;revealed=[];busy=false;renderBoard();persist()},2200)}
function start(n,favour,cat){clear();if(!allDone())n=nextLevel();lastAction=Date.now();mood='watching';misses=0;round={level:n,deck:build(n),matched:[],turns:0,used:false,favour,cat,last:[],finished:false};persist();play();openingLook();}
function startEndless(favour,cat){if(state().endless.rounds>=1000){endlessSetup();return}clear();lastAction=Date.now();mood='watching';misses=0;round={endless:true,deck:buildEndless(),matched:[],turns:0,used:false,favour,cat,last:[],finished:false};persist();play();openingLook();}
function openingShuffle(){
 let order=shuffle(round.deck.map((_,i)=>i),Math.random);
 if(order.every((old,i)=>round.deck[old]===round.deck[i])){const shift=round.deck.findIndex(k=>k!==round.deck[0]);order=round.deck.map((_,i)=>(i+shift)%round.deck.length);}
 round.deck=order.map(i=>round.deck[i]);round.shufflePending=false;persist();return order;
}
function openingLook(){
 busy=true;round.shufflePending=true;persist();revealed=round.deck.map((_,i)=>i);renderBoard();say('Meet this little gathering. A shuffle comes next.');
 const board=dlg.querySelector('.lm-board');if(!reduced())board.classList.add('lm-deal');
 let mixing=false;
 const AUTO_MS=3000;
 const skip=button('',()=>{if(e!==epoch||mixing)return;clearTimeout(timer);mix();},true);skip.id='lm-start-now';dlg.querySelector('.lm-main .lm-actions').prepend(skip);
 const e=epoch;
 const countStart=performance.now();
 // A silent 3s wait read as "is this stuck?" — ticking the button's own
 // label down doubles as the shuffle's countdown, so the pause reads as
 // "starting" rather than "waiting."
 function tickLabel(){const left=Math.max(0,Math.ceil((AUTO_MS-(performance.now()-countStart))/1000));skip.textContent=left>0?'Starting in '+left+'…':'Start now';}
 tickLabel();
 countdownTimer=setInterval(tickLabel,200);
 function finish(){if(e!==epoch)return;clearTimeout(timer);timer=null;clearInterval(countdownTimer);countdownTimer=null;board.getAnimations?.({subtree:true}).forEach(a=>a.cancel());revealed=[];busy=false;board.classList.remove('lm-deal');skip.remove();renderBoard();say('Find their friends. Their places stay fixed now.');persist();}
 function mix(){if(e!==epoch||mixing)return;mixing=true;clearInterval(countdownTimer);countdownTimer=null;skip.disabled=true;skip.textContent='Shuffling…';revealed=[];board.classList.remove('lm-deal');renderBoard();const old=[...board.children].map(c=>c.getBoundingClientRect());const order=openingShuffle();renderBoard();say('A little shuffle…');
 const still=reduced(),area=board.getBoundingClientRect();
 [...board.children].forEach((card,i)=>{
  const to=card.getBoundingClientRect(),from=old[order[i]];
  card.style.zIndex=i+1;
  card.style.setProperty('--from-x',(from.left-to.left)+'px');card.style.setProperty('--from-y',(from.top-to.top)+'px');
  card.style.setProperty('--mix-x',(area.left+area.width/2-to.left-to.width/2)+'px');card.style.setProperty('--mix-y',(area.top+area.height/2-to.top-to.height/2)+'px');
  card.style.setProperty('--mix-turn',(i%2?8:-8)+'deg');
  card.classList.add(still?'lm-shuffle-gentle':'lm-shuffling');
 });
 if(still)say('A gentle shuffle. New places, same little friends.');
 timer=setTimeout(finish,still?1000:1700);
 }
 timer=setTimeout(mix,AUTO_MS);
}
function nextLevel(){for(let n=1;n<=30;n++)if(!state().done[n])return n;return 30}
function allDone(){return Array.from({length:30},(_,i)=>i+1).every(n=>state().done[n])}
// The entry point from Activities: always the two-mode chooser, even
// with a round in progress — picking that round's mode again then
// shows a "Continue" button there. Mid-flow "Back" buttons instead call
// seasonSetup()/endlessSetup() directly, since they already know which
// mode they're in and re-asking would just be an extra click.
function home(){modeSelect();}
function catPicker(){const options=el('div','lm-setup'),label=el('label','','Keep me company'),select=el('select');select.id='lm-cat';for(const c of roster){const o=el('option','',c.name);o.value=c.id;select.append(o)}if(!select.children.length){const o=el('option','','Your companion');o.value='';select.append(o)}select.value=round?.cat||roster[0]?.id||'';previewCat=select.value;select.onchange=()=>{previewCat=select.value};label.append(select);options.append(label);return{options,select}}
const favourIcons={peek:'peek',friend:'paw',second:'rewind'};
// Each card leads with the ACTUAL companion portrait (same render used
// everywhere else in the game) instead of a hand-drawn face — a small
// abstract badge in the corner is enough to tell the three apart, and
// the cat itself carries the visual quality rather than a flat icon
// trying to imitate one.
function favourFieldset(spent,skipLegend){const f=el('fieldset','lm-favours');f.disabled=spent;if(!skipLegend)f.append(el('legend','',spent?'Favour used':'Choose one free favour'));const c=companion();for(const [key,[title,desc]]of Object.entries(favours)){const l=el('label');const input=el('input');input.type='radio';input.name='lm-favour';input.value=key;input.checked=key===(round?.favour||'peek');l.classList.toggle('lm-selected',input.checked);input.onchange=()=>f.querySelectorAll('label').forEach(x=>x.classList.toggle('lm-selected',x.querySelector('input').checked));const icon=el('span','lm-favour-icon');if(c&&c.image){const portrait=el('img');portrait.src=c.image;portrait.alt='';icon.append(portrait);}const badge=el('span','lm-favour-badge');badge.innerHTML=neoUIIcon(favourIcons[key]||'paw');icon.append(badge);l.append(input,icon);const textWrap=el('div','lm-favour-text');textWrap.append(el('strong','',title),el('small','',desc));l.append(textWrap,el('span','lm-favour-check','✓ Selected'));f.append(l)}return f}
function modeSelect(){clear();dlg.replaceChildren();
 const top=el('div','lm-top');top.append(el('div','lm-kicker','LITTLE MATCHES'));
 dlg.append(top,el('h2','','Little Matches'),el('p','lm-intro','Choose how you’d like to play.'));
 const seasonDone=allDone(),endlessRounds=state().endless.rounds;
 const grid=el('div','lm-mode-grid');

 // Season 1 — a big portrait of the final reward (the Little Lion) plus a
 // small paw trail + level tag, standing in for "30 levels of progress"
 // without needing any new illustration assets.
 const seasonCard=el('div','lm-mode-card lm-mode-season');
 seasonCard.setAttribute('role','button');seasonCard.tabIndex=0;seasonCard.setAttribute('aria-label','Play Season 1');
 const sArt=el('div','lm-mode-art');
 sArt.append(rewardArt(rewards[5]));
 const trail=el('div','lm-paw-trail');for(let i=0;i<4;i++){const p=el('span','');p.innerHTML=neoUIIcon('paw');p.style.setProperty('--i',i);trail.append(p)}
 sArt.append(trail,el('span','lm-mode-tag','Level 30'));
 seasonCard.append(sArt);
 const sBody=el('div','lm-mode-body');
 const completedLevels=seasonDone?30:nextLevel()-1;
 sBody.append(el('h3','','Season 1'),
  el('div','lm-mode-status '+(seasonDone?'lm-status-done':'lm-status-endless'),(seasonDone?'✓ ':'')+completedLevels+' / 30'+(seasonDone?' · Complete':' levels')),
  el('p','lm-mode-desc','30 levels of familiar faces, little challenges, and accessories to collect.'));
 const sCta=iconButton('play',seasonDone?'Play Again':'Continue',seasonSetup,true);sCta.classList.add('lm-mode-cta');sBody.append(sCta);
 seasonCard.append(sBody);
 const goSeason=()=>seasonSetup();
 seasonCard.onclick=e=>{if(e.target.closest('.lm-mode-cta'))return;goSeason()};
 seasonCard.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();goSeason()}};
 grid.append(seasonCard);

 // Endless — the round-50 reward portrait plus a couple of the game's own
 // card-back icons "floating" around it, so the decoration is literally
 // made of the same pieces as the game itself.
 const endlessCard=el('div','lm-mode-card lm-mode-endless'+(seasonDone?'':' lm-locked'));
 if(seasonDone){endlessCard.setAttribute('role','button');endlessCard.tabIndex=0;endlessCard.setAttribute('aria-label','Continue Endless');}
 const eArt=el('div','lm-mode-art');
 eArt.append(rewardArt((window.ENDLESS_REWARDS||[])[0]||rewards[5]));
 const floaters=el('div','lm-card-floaters');
 for(let i=0;i<3;i++){const c=el('span','lm-float-card lm-float-'+i);c.innerHTML='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 23 11 10l11 7h6l9-7 0 14q2 15-13 15T12 23Z"/></svg>';floaters.append(c)}
 eArt.append(floaters);
 if(seasonDone){const badge=el('span','lm-mode-badge');badge.innerHTML=neoUIIcon('infinity')+'<span>YOUR NEXT MATCH</span>';eArt.append(badge);}
 endlessCard.append(eArt);
 const eBody=el('div','lm-mode-body');
 eBody.append(el('h3','','Endless'),
  el('div','lm-mode-status lm-status-endless',seasonDone?(endlessRounds?'Round '+(endlessRounds+1)+' awaits':'A fresh board every round'):'Unlocks after Season 1'),
  el('p','lm-mode-desc',seasonDone?'No finish line. Just matches, cats, and a new accessory every 50 rounds.':'Complete all 30 Season 1 levels to unlock.'));
 if(seasonDone){
  const eCta=iconButton('play','Continue',endlessSetup,true);eCta.classList.add('lm-mode-cta');eBody.append(eCta);
  const goEndless=()=>endlessSetup();
  endlessCard.onclick=e=>{if(e.target.closest('.lm-mode-cta'))return;goEndless()};
  endlessCard.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();goEndless()}};
 }else{
  const eCta=iconButton('lock','Locked',()=>{});eCta.disabled=true;eCta.classList.add('lm-mode-cta');eBody.append(eCta);
 }
 endlessCard.append(eBody);
 grid.append(endlessCard);
 dlg.append(grid);

 const acts=el('div','lm-actions lm-actions-secondary');
 acts.append(iconButton('box','View rewards',showRewards),iconButton('back','Back to Cove',close));
 dlg.append(acts);
}
function seasonSetup(){clear();dlg.replaceChildren();const top=el('div','lm-top');top.append(iconButton('back','Little Matches',modeSelect),el('div','lm-kicker','SEASON 1 · 30 LEVELS'));dlg.append(top,el('h2','','Little Matches'),el('p','lm-intro','Familiar faces. Favourite things. Your favourite company.'));
 const {options,select}=catPicker();
 let levels=null;if(allDone()){const l=el('label','','Replay a level');levels=el('select');levels.id='lm-level';for(let n=1;n<=30;n++){const o=el('option','','Level '+n);o.value=n;levels.append(o)}l.append(levels);options.append(l)}dlg.append(options);
 dlg.append(el('p','lm-note',allDone()?'All 30 levels complete. Every level is yours to revisit.':'Complete each level to continue. Earn an accessory every five levels. No timer, lives, or entry cost.'));
 const spent=!!(round&&!round.finished&&!round.endless&&round.used);const f=favourFieldset(spent);if(spent)dlg.append(el('p','lm-note','Your next level comes with a fresh favour.'));dlg.append(f);
 const acts=el('div','lm-actions lm-cta-row');
 if(round&&!round.finished&&!round.endless){acts.append(iconButton('play','Continue · Level '+round.level,()=>{round.cat=select.value;persist();if(!round.used){round.favour=f.querySelector('input:checked').value;persist()}play()},true))}
 else{acts.append(iconButton('play',allDone()?'Play Again':'Continue · Level '+nextLevel(),()=>start(levels?+levels.value:nextLevel(),f.querySelector('input:checked').value,select.value),true))}
 dlg.append(acts);
 const sec=el('div','lm-actions lm-actions-secondary');
 sec.append(iconButton('box','View rewards',showRewards),iconButton('back','Back to Cove',close));
 dlg.append(sec);
}
function endlessSetup(){clear();dlg.replaceChildren();dlg.classList.add('lm-setup-screen');
 const top=el('div','lm-top');top.append(iconButton('back','Little Matches',modeSelect),el('div','lm-kicker','ENDLESS MODE'));dlg.append(top);
 const introPaw=el('span','lm-inline-icon');introPaw.innerHTML=neoUIIcon('paw');
 const intro=el('p','lm-intro','No finish line. Just one more match. ');intro.append(introPaw);
 dlg.append(el('h2','','Endless'),intro);

 const endlessRounds=state().endless.rounds,currentRound=endlessRounds+1;
 const capped=endlessRounds>=1000;
 const nextEndlessReward=(window.ENDLESS_REWARDS||[]).find(r=>r.round>endlessRounds);
 // Progress within the CURRENT 50-round stretch (not overall progress to
 // 1000) — reaching the next reward is the thing worth showing, not a
 // battle-pass-style bar toward a distant total.
 const prevMilestone=nextEndlessReward?nextEndlessReward.round-50:950;
 const pct=nextEndlessReward?Math.max(4,Math.min(100,(endlessRounds-prevMilestone)/50*100)):100;
 const progress=el('div','lm-round-progress');
 progress.append(el('strong','lm-round-now','Round '+(capped?1000:currentRound)));
 const track=el('div','lm-progress-track');
 const fill=el('div','lm-progress-fill');fill.style.width=pct+'%';
 const dot=el('span','lm-progress-dot');dot.style.left=pct+'%';
 track.append(fill,dot);
 const nextEl=el('span','lm-round-next');
 if(nextEndlessReward){nextEl.innerHTML=neoUIIcon('box');nextEl.append(' Next reward · Round '+nextEndlessReward.round)}else{nextEl.textContent='All rewards earned'}
 progress.append(track,nextEl);
 dlg.append(progress);

 const select=el('select');select.id='lm-cat';
 for(const c of roster){const o=el('option','',c.name);o.value=c.id;select.append(o)}
 if(!select.children.length){const o=el('option','','Your companion');o.value='';select.append(o)}
 select.value=round?.cat||roster[0]?.id||'';previewCat=select.value;
 const preview=el('img','lm-companion-preview');
 const setPreview=()=>{const c=roster.find(x=>x.id===select.value)||roster[0];if(c){preview.src=c.image;preview.alt=c.name}};
 setPreview();
 select.onchange=()=>{previewCat=select.value;setPreview()};
 const companionBox=el('div','lm-companion-picker');
 const textCol=el('div','lm-companion-text');textCol.append(el('div','lm-kicker','KEEPING YOU COMPANY'),select);
 companionBox.append(preview,textCol);dlg.append(companionBox);

 dlg.append(el('div','lm-section-label','Choose one free favour'));
 const spent=!!(round&&!round.finished&&round.endless&&round.used);
 const f=favourFieldset(spent,true);
 if(spent)dlg.append(el('p','lm-note','Your next round comes with a fresh favour.'));
 dlg.append(f);

 const primary=el('div','lm-actions lm-cta-row');
 if(round&&!round.finished&&round.endless){
  primary.append(iconButton('play','Continue · Round '+currentRound,()=>{round.cat=select.value;persist();if(!round.used){round.favour=f.querySelector('input:checked').value;persist()}play()},true));
 }else if(capped){
  const cb=button('Endless complete ★',()=>{});cb.disabled=true;cb.title='All 1000 endless rounds played';primary.append(cb);
 }else{
  primary.append(iconButton('play','Play Round '+currentRound,()=>startEndless(f.querySelector('input:checked').value,select.value),true));
 }
 dlg.append(primary);
 const sec=el('div','lm-actions lm-actions-secondary');
 sec.append(iconButton('box','View rewards',showRewards),iconButton('back','Back to Cove',close));
 dlg.append(sec);
}
function nook(){const c=el('canvas','lm-companion');c.width=300;c.height=270;c.setAttribute('role','img');c.setAttribute('aria-label',companion().name+' keeping you company');return c}
function play(){clear();previewCat=null;lastAction=Date.now();mood='watching';dlg.replaceChildren();
 const top=el('div','lm-top');
 const roundLabel=el('span','lm-round-label');
 if(round.endless){roundLabel.innerHTML=neoUIIcon('infinity')+'<span>ENDLESS · ROUND '+(state().endless.rounds+1)+'</span>';}
 else{roundLabel.textContent='LEVEL '+round.level+' / 30';}
 top.append(iconButton('back','Little Matches',()=>round.endless?endlessSetup():seasonSetup()),roundLabel,iconButton('back','Back to Cove',close));
 dlg.append(top);
 const layout=el('div','lm-layout'),side=el('aside','lm-side');
 side.append(nook(),el('p','lm-speech',companion().name+' is keeping you company.'));
 side.querySelector('.lm-speech').setAttribute('role','status');side.querySelector('.lm-speech').setAttribute('aria-live','polite');
 const main=el('section','lm-main');main.append(el('div','lm-stats'),el('div','lm-board'));
 const actions=el('div','lm-actions'),favour=button(favours[round.favour][0],useFavour);favour.id='lm-use';actions.append(favour);
 main.append(actions,el('p','lm-hint',favours[round.favour][1]+' No penalty for a helping paw.'));
 layout.append(side,main);dlg.append(layout);renderBoard();
 if(round.endless){animateCat()}else{dlg.append(el('section','lm-trail'));renderTrail();animateCat()}
 if(round.finished)round.endless?finishEndlessView():finishView();}
function touch(){lastAction=Date.now();mood='watching'}
function refreshNook(){touch();jumpAt=performance.now()}
function animateCat(now=performance.now()){if(!dlg.open)return;if(!document.hidden&&now-lastFrame>32){lastFrame=now;const idle=Date.now()-lastAction;if(!round.finished&&!busy){if(idle>16000)mood='sleep';else if(idle>8000)mood='groom'}const cv=dlg.querySelector('.lm-companion');const jump=(now-jumpAt)/700;if(cv)api.draw(cv,companion(),mood,reduced()?0:jump>0&&jump<1?jump:0,false);const marker=dlg.querySelector('.lm-walker');if(marker)api.draw(marker,companion(),'watching',0,!reduced()&&now<walkUntil)}raf=requestAnimationFrame(animateCat)}
function renderBoard(){const board=dlg.querySelector('.lm-board');if(!board)return;const previous=new Map([...board.children].map(c=>[+c.dataset.card,{open:c.classList.contains('lm-open'),matched:c.classList.contains('lm-matched')}]));const focusIndex=document.activeElement?.dataset?.card;board.replaceChildren();board.style.setProperty('--cols',round.deck.length===6?3:4);round.deck.forEach((key,i)=>{const matched=round.matched.includes(i),open=matched||i===first||revealed.includes(i)||picks.includes(i);const card=button('',()=>flip(i));card.className='lm-card'+(open?' lm-open':'')+(matched?' lm-matched':'');card.dataset.card=i;card.disabled=matched||busy||round.finished;card.setAttribute('aria-label',open?catalog[key].name+(matched?', matched':''):`Face-down card ${i+1}`);if(open){card.append(img(key,''),el('span','',catalog[key].name));if(matched)card.append(el('b','lm-check','✓'))}else{const back=el('span','lm-card-back');back.innerHTML='<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 23 11 10l11 7h6l9-7 0 14q2 15-13 15T12 23Z"/><path d="M17 27q3 4 5 0m6 0q3 4 5 0m-10 6 2 2 2-2"/></svg>';card.append(back)}board.append(card);const was=previous.get(i);if(was&&!reduced()){if(matched&&!was.matched)card.animate([{transform:'scale(.96)'},{transform:'scale(1.055)'},{transform:'scale(1)'}],{duration:360,easing:'ease-out'});else if(open!==was.open)card.animate([{transform:'scaleX(.15)',opacity:.65},{transform:'scaleX(1)',opacity:1}],{duration:190,easing:'ease-out'})}});dlg.querySelector('.lm-stats').textContent=`${round.matched.length/2} / ${round.deck.length/2} pairs · ${round.turns} turns · No rush`;const f=dlg.querySelector('#lm-use');f.disabled=round.used||busy||round.finished;f.textContent=round.used?'Favour used':picking?'Choose four cards':favours[round.favour][0];if(focusIndex!==undefined)board.querySelector(`[data-card="${focusIndex}"]`)?.focus({preventScroll:true});}
function flip(i){if(busy||round.finished||round.matched.includes(i))return;
 touch();if(picking){if(picks.includes(i))return;if(!round.used){round.used=true;persist()}picks.push(i);api.feedback?.('flip');renderBoard();const remaining=round.deck.length-round.matched.length;if(picks.length===Math.min(4,remaining)){round.used=true;picking=false;const chosen=picks.slice();picks=[];persist();pauseReveal(chosen,'Four little clues. They will stay right where they are.')}else say(`Choose ${Math.min(4,remaining)-picks.length} more cards.`);return}
 if(i===first)return;if(first===null){first=i;api.feedback?.('flip');renderBoard();return}const a=first;round.turns++;round.last=[a,i];if(round.deck[a]===round.deck[i]){first=null;matched(a,i)}else{first=null;misses++;if(misses>=2)mood='groom';persist();pauseReveal([a,i],'Not quite. Two little faces to remember.',true)}}
function matched(a,b){api.feedback?.(round.matched.length+2===round.deck.length?'win':'match');misses=0;round.matched.push(a,b);persist();renderBoard();refreshNook();const key=round.deck[a],name=companion().name;const lines=key==='obj:food'?[`${name} heard “bowl.” A brief misunderstanding.`, 'A picture of dinner. An ambitious promise.']:key==='obj:bed'?[`${name} is already considering the cushion.`, 'Apparently this one was for them.']:key.startsWith('cat:')?['A familiar face. A very flattering resemblance.',`${name} approves. Quietly, of course.`]:['Found them. A small hop felt appropriate.','A very good match. A very pleased cat.'];say(lines[speaker++%lines.length]);if(round.matched.length===round.deck.length)complete();}
function useFavour(){if(round.used||busy||round.finished)return;if(round.favour==='peek'){if(first!==null){say('Finish this pair before choosing your four cards.');return}picking=true;renderBoard();say('Tap four face-down cards for a little look.');return}
 if(round.favour==='friend'){if(first===null){say('Turn over one card first. Then ask for a helping paw.');return}const a=first,b=round.deck.findIndex((key,i)=>key===round.deck[a]&&i!==a&&!round.matched.includes(i));round.used=true;first=null;round.turns++;matched(a,b);return}
 if(first!==null||round.last.length!==2||round.last.some(i=>round.matched.includes(i))){say('Try an unmatched pair first, then ask for a second look.');return}round.used=true;persist();pauseReveal(round.last.slice(),`${companion().name} remembers these two.`);}
function complete(){round.finished=true;walkUntil=performance.now()+850;
 if(round.endless){const s=state();s.endless.rounds++;const milestone=s.endless.rounds%20===0;const reward=(window.ENDLESS_REWARDS||[]).find(r=>r.round===s.endless.rounds);persist();if(milestone)api.pearls(4);finishTimer=setTimeout(()=>{finishTimer=0;if(dlg.open)finishEndlessView(milestone,reward)},reduced()?0:950);return}
 const s=state(),previous=s.done[round.level],firstCompletion=!previous;if(!previous||round.turns<previous.turns)s.done[round.level]={turns:round.turns,helped:round.used};persist();if(firstCompletion&&(round.level===1||round.level%5===0))api.keepsake(round.level,companion());renderTrail(true);finishTimer=setTimeout(()=>{finishTimer=0;if(dlg.open){if(firstCompletion&&(allDone()||rewards.some(r=>r.level===round.level)))showReward(allDone()?rewards[5]:rewards.find(r=>r.level===round.level),true);else finishView()}},reduced()?0:950)}
function finishEndlessView(milestone,reward){
 dlg.querySelector('.lm-finish')?.remove();
 const rounds=state().endless.rounds,name=companion().name;
 const quips=[name+' did the victory hop. You did the remembering.',name+' is taking the credit. We both know who turned the cards.',name+' checked under a paw. No missing matches.',name+' would high-five you, but that paw was just washed.'];
 const capped=rounds>=1000;
 const box=popup('Endless round complete');box.classList.add('lm-completion');
 if(reward){
  box.classList.toggle('lm-unlock',!reduced());
  box.append(el('div','lm-kicker','ROUND '+rounds),el('h2','',reward.label+' unlocked'),rewardArt(reward),
   el('p','',name+' earned something new for reaching round '+rounds+'. Ready for a little dress-up.'));
  if(!reduced()){const sparks=el('div','lm-sparks');sparks.setAttribute('aria-hidden','true');for(let i=0;i<8;i++){const star=el('span','','✦');star.style.setProperty('--x',Math.cos(i*Math.PI/4)*125+'px');star.style.setProperty('--y',Math.sin(i*Math.PI/4)*100+'px');sparks.append(star)}box.append(sparks)}
 }else{
  box.append(el('h2','',capped?'One thousand rounds.':'Round '+rounds+' complete!'),el('p','',capped?name+' has matched every little face a thousand times over. There may not be a thousand and first — for now, this is the top of the cove.':milestone?name+' has done this twenty more times now. A small pearl for the trouble.':quips[(rounds-1)%quips.length]));
 }
 if(milestone)box.append(el('p','lm-season',capped?'+4 pearls · the last of the endless rewards':'+4 pearls · every 20 rounds'));
 const actions=el('div','lm-actions');
 if(reward){const wear=button('Wear it',()=>{if(api.wear(companion(),reward.key)){wear.textContent='Wearing it ✓';wear.disabled=true}},true);actions.append(wear);}
 if(!capped)actions.append(button('Next round',()=>startEndless(round.favour,round.cat),!reward));
 actions.append(button('Back to setup',endlessSetup,capped));
 popupLayout(box,actions);renderBoard();actions.querySelector('button')?.focus({preventScroll:true});
}
function finishView(){
 dlg.querySelector('.lm-finish')?.remove();
 const box=popup('Level '+round.level+' complete'),done=state().done,finished=allDone(),name=companion().name;box.classList.add('lm-completion');
 const quips=[name+' did the victory hop. You did the remembering.',name+' is taking the credit. We both know who turned the cards.',name+' checked under a paw. No missing matches.',name+' has postponed the nap. This is getting interesting.',name+' would high-five you, but that paw was just washed.',name+' celebrated with a tiny hop. Very big feelings.'];
 box.append(el('h2','',finished?'Small paws. A mighty finish.':'Level '+round.level+' complete!'),el('p','',finished?'Watch out for the next drop next season.':quips[(round.level-1)%quips.length]));
 if(!finished){
  const next=rewards.find(r=>!done[r.level]);
  if(next){
   const remaining=Array.from({length:next.level},(_,i)=>i+1).filter(n=>!done[n]).length;
   const preview=button('',()=>showReward(next));preview.className='lm-next-reward';
   const copy=el('span');copy.append(el('strong','',remaining===1?'One more level to earn your '+next.label+'!':remaining+' levels to your '+next.label),el('span','','Level '+next.level+' reward · Tap to try it on'));
   preview.append(rewardArt(next),copy);box.append(preview);
  }else{
   const remaining=Array.from({length:30},(_,i)=>i+1).filter(n=>!done[n]).length;
   box.append(el('p','lm-season',remaining+' level'+(remaining===1?'':'s')+' left to finish all 30 and unlock free replay.'));
  }
 }
 const actions=el('div','lm-actions');
 actions.append(button(finished?'Replay a level':'Play Level '+nextLevel(),()=>finished?seasonSetup():start(nextLevel(),round.favour,round.cat),true));
 actions.append(button('View rewards',showRewards));actions.append(button('Back to Cove',close));popupLayout(box,actions);renderBoard();actions.querySelector('button')?.focus({preventScroll:true});
}
function rewardArt(r){const image=el('img');image.src=api.rewardImage(companion(),r.key);image.alt=companion().name+' wearing '+r.label;return image}
function renderTrail(animate=false){const trail=dlg.querySelector('.lm-trail');if(!trail)return;const old=trail.querySelector('.lm-walker'),from=old?parseFloat(old.style.left):null;trail.replaceChildren();const level=round.level,target=Math.ceil(level/5)*5,start=target-5,r=rewards.find(r=>r.level===target),done=state().done;let count=0;for(let n=start+1;n<=target;n++)if(done[n])count++;const head=el('div','lm-trail-head');head.append(el('span','',r.label+(count===5?' · Earned':' · '+(5-count)+' level'+(5-count===1?'':'s')+' to go')),button('View rewards',showRewards));trail.append(head);const track=el('div','lm-track'),line=el('div','lm-trail-line'),fill=el('div','lm-trail-fill');fill.style.width=count*20+'%';line.append(fill);track.append(line);const walker=el('canvas','lm-walker');walker.width=100;walker.height=95;walker.style.left=count*20+'%';walker.setAttribute('aria-label','Progress: '+count+' of 5 levels');track.append(walker);for(let i=0;i<=5;i++){const mark=el('span','lm-trail-mark'+(i===0||done[start+i]?' lm-earned':''));mark.style.left=i*20+'%';mark.append(el('i'),el('span','',String(start+i||'Start')));track.append(mark)}const reward=button('',()=>showReward(r));reward.className='lm-trail-reward';reward.setAttribute('aria-label','Preview '+r.label);reward.append(rewardArt(r));track.append(reward);trail.append(track);api.draw(walker,companion(),'watching',0,false);
 if(animate&&!reduced()&&from!==null&&from<count*20){
  walker.style.left=from+'%';fill.style.width=from+'%';
  track.getBoundingClientRect();
  walker.style.left=count*20+'%';fill.style.width=count*20+'%';
 }
}
function popupLayout(p,footer){const body=el('div','lm-popup-body');while(p.firstChild)body.append(p.firstChild);footer.classList.add('lm-popup-footer');p.append(body,footer)}
function introduction(){
 const p=popup('Welcome to Little Matches');p.classList.add('lm-welcome');
 p.append(el('div','lm-kicker','LITTLE MATCHES · SEASON 1'),el('h2','','Little matches. Big cat energy.'),rewardArt(rewards[5]),el('p','',"You do the remembering. Your cat takes the credit."));
 const list=el('ol','lm-intro-steps');for(const line of ['Meet the cards, watch them shuffle, then find their pairs.','Take your time. Bring one free helping paw to each level.','Play 30 levels and earn an accessory every five. The Little Lion mane awaits.'])list.append(el('li','',line));p.append(list,el('p','lm-season','New drops every season.'),el('p','lm-note','Your earned accessories stay yours.'));
 const footer=el('div','lm-actions');footer.append(button("Let's play",()=>{state().introSeen=true;api.save();dismiss()},true),button('Back to Cove',close));popupLayout(p,footer);footer.querySelector('button').focus();
}
function popup(title){activePopup?.close();activePopup?.remove();const p=el('dialog','lm-popup');p.setAttribute('aria-label',title);p.addEventListener('keydown',e=>e.stopPropagation());p.addEventListener('cancel',e=>{e.preventDefault();dismiss()});dlg.append(p);activePopup=p;p.showModal();return p}
function dismiss(){const completion=activePopup?.classList.contains('lm-completion');activePopup?.close();activePopup?.remove();activePopup=null;if(completion){(round&&round.endless?endlessSetup:seasonSetup)();return}if(round?.finished&&dlg.querySelector('.lm-main')){finishView();return}dlg.querySelector('.lm-trail-head button,.lm-actions button')?.focus()}
function showRewards(){const p=popup('Accessory rewards');p.append(el('h2','','A little something to wear'),el('p','lm-note','An accessory every five levels, up to level 30. Yours to keep, for all your cats.'));const grid=el('div','lm-reward-grid');for(const r of rewards){const b=button('',()=>showReward(r,false,true));b.append(rewardArt(r),el('strong','',r.label),el('span','', 'Level '+r.level+' · '+(state().done[r.level]?'Earned':'Locked')));grid.append(b)}p.append(grid);
 if(window.ENDLESS_REWARDS?.length){
  p.append(el('h3','','Endless rewards'),el('p','lm-note','A new accessory every 50 rounds in Endless mode, all the way to round 1000.'));
  const egrid=el('div','lm-reward-grid');
  for(const r of window.ENDLESS_REWARDS){const b=button('',()=>showEndlessReward(r));b.append(rewardArt(r),el('strong','',r.label),el('span','','Round '+r.round+' · '+((state().endless.rounds||0)>=r.round?'Earned':'Locked')));egrid.append(b)}
  p.append(egrid);
 }
 const footer=el('div','lm-actions');footer.append(button('Back',dismiss));popupLayout(p,footer)}
function showEndlessReward(r){const earned=(state().endless.rounds||0)>=r.round;const p=popup(r.label);p.append(el('div','lm-kicker','ROUND '+r.round+(earned?' · EARNED':' · REWARD')),el('h2','',r.label),rewardArt(r));p.append(el('p','',earned?'Ready for a little dress-up.':'Reach round '+r.round+' in Endless mode to make it yours.'));const acts=el('div','lm-actions');if(earned){const wear=button('Wear it',()=>{if(api.wear(companion(),r.key)){wear.textContent='Wearing it ✓';wear.disabled=true}},true);acts.append(wear)}acts.append(button('Back',showRewards));popupLayout(p,acts);acts.querySelector('button')?.focus()}
function showReward(r,celebrate=false,collection=false){const earned=!!state().done[r.level],final=celebrate&&allDone(),p=popup(r.label);p.classList.toggle('lm-unlock',celebrate&&!reduced());p.append(el('div','lm-kicker',final?'ALL 30 LEVELS COMPLETE':'LEVEL '+r.level+(earned?' · EARNED':' · REWARD')),el('h2','',final?'Small paws. A mighty finish.':celebrate?'A little something, earned.':r.label),rewardArt(r));if(celebrate){p.append(el('h3','',r.label+' unlocked'),el('p','',final?'Congratulations! You and '+companion().name+' matched your way through all 30 levels. The mane is magnificent. The roar needs practice.':companion().name+' helped. Mostly by looking adorable. Your new accessory is ready to wear.'));if(final)p.append(el('p','lm-season','Watch out for the next drop next season.'),el('p','lm-note','For now, every level is yours to revisit.'));if(!reduced()){const sparks=el('div','lm-sparks');sparks.setAttribute('aria-hidden','true');for(let i=0;i<8;i++){const star=el('span','','✦');star.style.setProperty('--x',Math.cos(i*Math.PI/4)*125+'px');star.style.setProperty('--y',Math.sin(i*Math.PI/4)*100+'px');sparks.append(star)}p.append(sparks)}}else p.append(el('p','',earned?'Ready for a little dress-up.':'Complete Level '+r.level+' to make it yours.'));const acts=el('div','lm-actions');if(earned){const wear=button('Wear it',()=>{if(api.wear(companion(),r.key)){wear.textContent='Wearing it ✓';wear.disabled=true}else{p.querySelector('.lm-wear-note')?.remove();p.querySelector('.lm-popup-body').append(el('p','lm-note lm-wear-note','Your companion is away. This reward is safe in Dress-up for your resident cats.'))}},true);acts.append(wear)}acts.append(button(celebrate?(final?'Replay a level':'Play Level '+nextLevel()):'Back',()=>{if(collection){showRewards();return}dismiss();if(celebrate){if(allDone())modeSelect();else start(nextLevel(),round.favour,round.cat)}},!earned));popupLayout(p,acts);acts.querySelector('button')?.focus()}
function open(){roster=api.cats();if(!catalog)catalog=api.catalog();if(!dlg){dlg=el('dialog','lm-dialog');dlg.setAttribute('aria-label','Little Matches');document.body.append(dlg);dlg.addEventListener('cancel',e=>{e.preventDefault();close()});dlg.addEventListener('keydown',e=>e.stopPropagation())}round=state().round||null;if(round&&(!Array.isArray(round.deck)||round.deck.some(k=>!catalog[k])||!Array.isArray(round.matched)))round=null;api.hide();dlg.showModal();for(const r of rewards)if(state().done[r.level])api.keepsake(r.level,companion());home();if(!state().introSeen)introduction()}
return{open,build};
};
