// Lazy-loaded social pilot. No background network traffic before a player opts in.
import { socialConfig } from './social-config.js';
const SESSION='neo.friends.session',CONSENT='neo.friends.analytics';
let session=null,refreshing=null,api=null,dialog=null,email='',busy=false;
try{session=JSON.parse(localStorage.getItem(SESSION)||'null');}catch{}
function keep(s){const next={access_token:s.access_token,refresh_token:s.refresh_token,expires_at:s.expires_at?s.expires_at*1000:Date.now()+s.expires_in*1000};localStorage.setItem(SESSION,JSON.stringify(next));session=next;}
async function request(path,data,token){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{const r=await fetch(socialConfig.url+path,{method:'POST',headers:{apikey:socialConfig.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data),signal:controller.signal});const result=await r.json();if(!r.ok){const error=Error(result.msg||result.message||'Please try again in a moment.');error.status=r.status;throw error;}return result;}
 catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw Error('Could not connect. Your Cove is safe on this device. Please try again.');throw e;}finally{clearTimeout(timer);}
}
async function token(){if(!session)throw Error('Please sign in first.');if(session.expires_at<Date.now()+60000){if(!refreshing)refreshing=request('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token}).then(keep).catch(e=>{if(e.status===400||e.status===401)throw Error('This Friends session needs recovery. Contact support before clearing app data.');throw e;}).finally(()=>refreshing=null);await refreshing;}return session.access_token;}
async function rpc(action,payload={}){return request('/rest/v1/rpc/neo_social',{action,payload},await token());}
export function track(event){if(session&&localStorage.getItem(CONSENT)==='yes')rpc('event',{event}).catch(()=>{});}
function el(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
function button(text,fn,primary=false){const b=el('button',text,'btn'+(primary?' primary':''));b.type='button';b.onclick=()=>run(fn,b);return b;}
async function run(fn,b){if(busy)return;busy=true;if(b)b.disabled=true;const status=dialog?.querySelector('[role=status]');if(status)status.textContent='';try{await fn();}catch(e){const current=dialog?.querySelector('[role=status]');if(current)current.textContent=e.message;}finally{busy=false;if(b?.isConnected)b.disabled=false;}}
function page(title,description){
 if(busy&&dialog&&!dialog.open)throw Error('Closed.');
 if(!dialog){dialog=el('dialog',null,'friends-sheet');dialog.setAttribute('aria-label','Cove Friends');document.body.append(dialog);}
 dialog.replaceChildren();dialog.append(el('h2',title),el('p',description,'muted'));
 const body=el('div',null,'friends-body');dialog.append(body);
 const status=el('p',null,'friends-status');status.setAttribute('role','status');dialog.append(status);
 const close=el('button','Close','btn friends-close');close.type='button';close.onclick=()=>dialog.close();dialog.append(close);if(!dialog.open)dialog.showModal();return body;
}
function input(parent,label,type='text',max=80){const wrap=el('label',label),i=el('input');i.type=type;i.maxLength=max;wrap.append(i);parent.append(wrap);return i;}
function login(){const body=page('A little closer, even apart','Sign in to add friends. Your game stays on this device; only a Cove picture you choose to share is visible to accepted friends.');
 const form=el('form');body.append(form);const address=input(form,'Email address','email');address.autocomplete='email';address.value=email;const b=button('Send sign-in code',async()=>{if(!address.reportValidity()||!address.value.trim())return;email=address.value.trim();await request('/auth/v1/otp',{email,create_user:true});verify();},true);form.append(b);form.onsubmit=e=>{e.preventDefault();b.click();};
 body.append(el('p','No password to remember. Use the code in your email.','muted'));
}
function verify(){const body=page('Check your email','Enter the sign-in code sent to '+email+'.');const code=input(body,'Sign-in code','text',10);code.inputMode='numeric';code.autocomplete='one-time-code';body.append(button('Continue',async()=>{if(!/^\d{6,10}$/.test(code.value.trim()))throw Error('Enter the code from your email.');keep(await request('/auth/v1/verify',{email,token:code.value.trim(),type:'email'}));await join();},true),button('Use another email',login));}
async function join(){const body=page('Your name in the Cove','Friends will see this name beside your invitation.');const name=input(body,'Cove name','text',24);name.value=api.name().slice(0,24);body.append(button('Meet your friends',async()=>{await rpc('join',{name:name.value.trim()});await protectAccount();},true));}
async function home(){
 let data;try{data=await rpc('list');}catch(e){if(e.message.includes('Choose your Cove name'))return join();throw e;}
 const body=page('Cove Friends','A small circle. A place to drop by.');
 body.append(button('Refresh friends',home));
 const code=el('section',null,'friends-card');code.append(el('span','Your friend code','muted'),el('strong',data.profile.code.match(/.{1,4}/g).join(' ')),button('Copy code',async()=>{await navigator.clipboard.writeText(data.profile.code);dialog.querySelector('[role=status]').textContent='Friend code copied.';}));if(navigator.share)code.append(button('Share code',async()=>{try{await navigator.share({title:'Cove Friends',text:'Visit my Catmint Cove! My friend code is '+data.profile.code+'. Add it in Journal → Cove Friends.'});}catch(e){if(e.name!=='AbortError')throw e;}}));body.append(code);
 const invite=el('form',null,'friends-invite');const field=input(invite,'Add by friend code','text',16);field.autocomplete='off';field.spellcheck=false;const send=button('Find friend',async()=>{const value=field.value.replace(/[^a-zA-Z0-9]/g,'').toUpperCase();if(!/^[A-Z0-9]{12}$/.test(value))throw Error('Enter the 12-character friend code.');if(value===data.profile.code)throw Error('That is your own code. Ask your friend for theirs.');const peer=await rpc('preview',{code:value});const review=page('Is this your friend?','Only an accepted invitation allows you to visit each other.');review.append(el('strong',peer.name),el('p',peer.code.match(/.{1,4}/g).join(' '),'muted'),button('Send invitation',async()=>{await rpc('request',{code:peer.code});await home();dialog.querySelector('[role=status]').textContent='Invitation sent. Your friend must accept before you can visit.';},true),button('Cancel',home));},true);invite.append(send);invite.onsubmit=e=>{e.preventDefault();send.click();};body.append(invite);
 const sharing=el('section',null,'friends-card');sharing.append(el('strong','Your shared Cove'),el('p',data.shared_at?'Shared '+new Date(data.shared_at).toLocaleDateString():'Only you can see your Cove until you share it.','muted'),button(data.shared_at?'Update shared picture':'Share my Cove',preview,true));if(data.shared_at)sharing.append(button('Stop sharing',async()=>{await rpc('unpublish');await home();}));body.append(sharing);
 body.append(el('h3','Friends & invitations'));let lastGroup='';
 if(!data.friends.length)body.append(el('p','Give your code to a friend to begin.','muted'));
 for(const friend of [...data.friends].sort((a,b)=>((a.status==='accepted'?1:a.incoming?0:2)-(b.status==='accepted'?1:b.incoming?0:2)))){const group=friend.status==='accepted'?'Your friends':friend.incoming?'Requests to review':'Invitations sent';if(group!==lastGroup){body.append(el('h4',group));lastGroup=group;}const row=el('section',null,'friends-card');row.append(el('strong',friend.name));const actions=el('div',null,'friends-actions');if(friend.status==='accepted'){row.append(el('span',friend.shared_at?'A Cove to visit':'Has not shared a Cove yet','muted'));const visit=button('Visit',()=>visitFriend(friend),true);visit.disabled=!friend.shared_at;actions.append(visit,button('Manage',()=>manage(friend)));}else if(friend.incoming){row.append(el('span','Would like to be friends','muted'));actions.append(button('Accept',async()=>{await rpc('accept',{id:friend.id});await home();},true),button('Decline',async()=>{await rpc('remove',{id:friend.id});await home();}));}else{row.append(el('span','Invitation sent','muted'));actions.append(button('Cancel invitation',async()=>{await rpc('remove',{id:friend.id});await home();}));}row.append(actions);body.append(row);}
 if(data.hellos)body.append(el('p',data.hellos+' little hello'+(data.hellos===1?'':'s')+' received today.'));
 const consent=el('label',null,'friends-consent'),check=el('input');check.type='checkbox';check.checked=localStorage.getItem(CONSENT)==='yes';check.onchange=()=>localStorage.setItem(CONSENT,check.checked?'yes':'no');consent.append(check,document.createTextNode('Share basic feature counts to help improve the game. No messages, names or game saves are included.'));const settings=el('details',null,'friends-settings');settings.append(el('summary','Account & privacy'));body.append(settings);settings.append(consent,button('Protect my Friends account',protectAccount),button('Blocked players',blockedPlayers),button('Recover an existing account',recoverAccount),button('Cove backups',backups),button('Recovery & support',recoveryHelp));
}
async function preview(){const picture=await api.picture();const body=page('Share this little home?','Accepted friends can view this saved picture while you are away. Your balances, purchases and save file stay private.');const img=el('img');img.src=picture;img.alt='Preview of your Cove';body.append(img,button('Share with friends',async()=>{await rpc('publish',{picture});track('snapshot_shared');await home();},true),button('Back to friends',home));}
async function visitFriend(friend){const v=await rpc('visit',{id:friend.id});if(!/^data:image\/webp;base64,/.test(v.picture))throw Error('This picture could not be opened.');const body=page(v.name,'A saved glimpse of your friend’s Cove · '+new Date(v.updated_at).toLocaleDateString());const img=el('img');img.src=v.picture;img.alt=friend.name+' shared Cove';body.append(img,el('p','Your friend’s items and cats stay safe. This is their last shared picture.','muted'),button('Leave a little hello',async()=>{await rpc('hello',{id:friend.id});track('hello_sent');dialog.querySelector('[role=status]').textContent='A little hello left for your friend. One per friend each day.';},true),button('Back to friends',home));track('visit_opened');}
function manage(friend){const body=page(friend.name,'You choose who is welcome in your circle.');body.append(button('Remove friend',()=>confirmManage(friend,false)),button('Block invitations & visits',()=>confirmManage(friend,true)),button('Back to friends',home));}
function confirmManage(friend,block){const body=page(block?'Block this friend?':'Remove this friend?',block?'You will no longer be able to visit or invite each other. You can unblock them in Account & privacy. A new invitation will be needed.':'You will no longer share Cove pictures. You can send a new invitation later.');body.append(el('strong',friend.name),button(block?'Block friend':'Remove friend',async()=>{await rpc(block?'block':'remove',{id:friend.id});await home();},true),button('Cancel',()=>manage(friend)));}
export async function open(game){api=game;page('Cove Friends','Opening your circle…');if(!socialConfig.enabled){page('Cove Friends','Friends are being prepared for Neo testing. Your Cove stays safely on this device.');return;}await run(async()=>{if(session){try{await home();}catch(e){const body=page('Reconnect to your circle',e.message);body.append(button('Try again',home,true),button('Use my recovery key',recoverAccount));}}else guestWelcome();});}

function guestWelcome(){const body=page('Your little circle','Join without an email or password. You will receive a friend code to share.');body.append(el('p','This Friends identity stays on this device. Clearing app data or reinstalling can lose access. A friend code is not a recovery password.','muted'),button('Join Cove Friends',async()=>{keep(await request('/auth/v1/signup',{data:{}}));await join();},true),button('I already have a recovery key',recoverAccount));}
async function backups(){
 const rows=await request('/rest/v1/rpc/neo_backup',{action:'list'},await token());
 const body=page('Your Cove backups','Keep up to five recent backups. Upload only when you choose.');
 body.append(el('p','Backups belong to this Friends account. Save your private recovery key before reinstalling. A recovery key restores Friends access; restoring a backup is a separate choice.','muted'));
 body.append(button('Back up this Cove',async()=>{const code=api.backup();await request('/rest/v1/rpc/neo_backup',{action:'save',code},await token());await backups();},true));
 if(!rows.length)body.append(el('p','No cloud backup yet. Your current Cove remains on this device.','muted'));
 for(const row of rows){const card=el('section',null,'friends-card');card.append(el('strong',new Date(row.created_at).toLocaleString()),button('Review restore',async()=>{
  const saved=await request('/rest/v1/rpc/neo_backup',{action:'read',backup_id:row.id},await token());
  const review=page('Restore this Cove?','This replaces progress on this device with the backup from '+new Date(saved.created_at).toLocaleString()+'.');
  review.append(el('p','We keep a local copy of this device’s current Cove before replacing it. Purchases use Restore Purchases separately; this does not transfer your Friends account.'),button('Restore backup',()=>api.restore(saved.code),true),button('Cancel',backups));
 }));body.append(card);}
 body.append(button('Back to friends',home));
}
function recoveryHelp(){const body=page('Recovery & support','Paid items, Friends access and your saved Cove have different recovery paths.');body.append(el('p','Missing a purchase? Use Restore Purchases in the game on the same Apple or Google store account. A receipt alone cannot recover cats, currency or a layout without a backup.'));const old=input(body,'Previous friend code (optional)','text',16);body.append(button('Create support case',async()=>{const out=await request('/rest/v1/rpc/neo_recovery_case',{old_code:old.value.replace(/[^a-zA-Z0-9]/g,'').toUpperCase()},await token());const next=page('Your support reference','Contact us with this reference. Do not send passwords, sign-in codes or payment-card details.');next.append(el('strong',out.reference),el('p','Case opened for review. No account has been transferred and no purchases have been granted.'));const link=el('a','Contact support','btn primary');link.href='https://www.catmintcove.com/#contact';link.target='_blank';link.rel='noopener noreferrer';next.append(link,button('Back to friends',home));},true),button('Back to friends',home));}

async function protectAccount(){
 const status=await request('/rest/v1/rpc/neo_protection',{action:'status'},await token());
 const body=page('Keep your circle safe',status.protected?'A recovery key is active. Keep it somewhere private outside this app.':'Save a private recovery key to bring your friend code and friendships to a replacement device.');
 body.append(el('p','Your friend code is public. Your recovery key is secret: anyone with it can take over your Friends account. It does not restore purchases or unsaved game progress.','muted'));
 body.append(button(status.protected?'Replace recovery key':'Create recovery key',async()=>{
  if(status.protected){const confirm=page('Replace your recovery key?','Your previous key will stop working. Save the new one before leaving.');confirm.append(button('Create replacement',issueKey,true),button('Cancel',protectAccount));}
  else await issueKey();
 },true),button('Back to friends',home));
}
async function issueKey(){
 const result=await request('/rest/v1/rpc/neo_protection',{action:'issue'},await token());
 const body=page('Save your private key','Store this in your password manager or another safe place outside the app. We cannot show this key again.');
 const field=input(body,'Private recovery key','text',80);field.value=result.key;field.readOnly=true;field.autocomplete='off';field.spellcheck=false;
 body.append(button('Copy recovery key',async()=>{await navigator.clipboard.writeText(result.key);dialog.querySelector('[role=status]').textContent='Copied. Save it privately outside the app.';}));
 const label=el('label',null,'friends-consent'),check=el('input');check.type='checkbox';label.append(check,document.createTextNode('I saved this key somewhere safe.'));
 const done=button('Done',home,true);done.disabled=true;check.onchange=()=>done.disabled=!check.checked;body.append(label,done);
}
function recoverAccount(){
 const body=page('Bring back your circle','This restores Friends access on this device and ends access on the previous device. Your current game progress stays unchanged.');
 const key=input(body,'Private recovery key','password',80);key.autocomplete='off';key.spellcheck=false;
 body.append(button('Recover Friends',async()=>{
  const secret=key.value.trim();if(!/^CR1\.[a-f0-9]{64}$/.test(secret))throw Error('Paste the complete private recovery key starting with CR1.');
  let pending;try{pending=JSON.parse(localStorage.getItem('neo.friends.recovery-session')||'null');}catch{}
  if(!pending)pending=await request('/auth/v1/signup',{data:{}});
  else if(pending.expires_at*1000<Date.now()+60000)pending=await request('/auth/v1/token?grant_type=refresh_token',{refresh_token:pending.refresh_token});
  // Preserve the new authenticated session before a one-time claim, so a lost response can retry.
  localStorage.setItem('neo.friends.recovery-session',JSON.stringify(pending));
  await request('/rest/v1/rpc/neo_protection',{action:'recover',secret},pending.access_token);
  keep(pending);localStorage.removeItem('neo.friends.recovery-session');localStorage.removeItem(CONSENT);
  const next=page('Your circle is back','Your friend code, friendships and cloud backups are preserved. Your local game has not been replaced.');
  next.append(button('Save a new recovery key',issueKey,true),button('Review Cove backups',backups),button('Back to friends',home));
 },true),button('Cancel',()=>session?home():guestWelcome()));
}
async function blockedPlayers(){
 const list=await request('/rest/v1/rpc/neo_privacy',{action:'blocked'},await token());
 const body=page('Blocked players','Unblocking allows new invitations. It does not automatically restore a friendship.');
 if(!list.length)body.append(el('p','No blocked players to manage.'));
 for(const friend of list){const row=el('section',null,'friends-card');row.append(el('strong',friend.name),button('Unblock',async()=>{await request('/rest/v1/rpc/neo_privacy',{action:'unblock',peer:friend.id},await token());await blockedPlayers();}));body.append(row);}
 body.append(button('Back to friends',home));
}
