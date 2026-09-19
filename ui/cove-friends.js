// Lazy-loaded social pilot. No background network traffic before a player opts in.
import { socialConfig } from './social-config.js';
const SESSION='neo.friends.session',CONSENT='neo.friends.analytics';
let session=null,refreshing=null,api=null,dialog=null,email='',busy=false;
try{session=JSON.parse(localStorage.getItem(SESSION)||'null');}catch{}
function keep(s){session={access_token:s.access_token,refresh_token:s.refresh_token,expires_at:Date.now()+s.expires_in*1000};localStorage.setItem(SESSION,JSON.stringify(session));}
async function request(path,data,token){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
 try{const r=await fetch(socialConfig.url+path,{method:'POST',headers:{apikey:socialConfig.key,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(data),signal:controller.signal});const result=await r.json();if(!r.ok)throw Error(result.msg||result.message||'Please try again in a moment.');return result;}
 catch(e){if(e.name==='AbortError'||e instanceof TypeError)throw Error('Could not connect. Your Cove is safe on this device. Please try again.');throw e;}finally{clearTimeout(timer);}
}
async function token(){if(!session)throw Error('Please sign in first.');if(session.expires_at<Date.now()+60000){if(!refreshing)refreshing=request('/auth/v1/token?grant_type=refresh_token',{refresh_token:session.refresh_token}).then(keep).catch(e=>{session=null;localStorage.removeItem(SESSION);throw e;}).finally(()=>refreshing=null);await refreshing;}return session.access_token;}
async function rpc(action,payload={}){return request('/rest/v1/rpc/neo_social',{action,payload},await token());}
export function track(event){if(session&&localStorage.getItem(CONSENT)==='yes')rpc('event',{event}).catch(()=>{});}
function el(tag,text,cls){const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;}
function button(text,fn,primary=false){const b=el('button',text,'btn'+(primary?' primary':''));b.type='button';b.onclick=()=>run(fn,b);return b;}
async function run(fn,b){if(busy)return;busy=true;if(b)b.disabled=true;const status=dialog?.querySelector('[role=status]');if(status)status.textContent='';try{await fn();}catch(e){if(status)status.textContent=e.message;}finally{busy=false;if(b?.isConnected)b.disabled=false;}}
function page(title,description){
 if(busy&&dialog&&!dialog.open)throw Error('Closed.');
 if(!dialog){dialog=el('dialog',null,'friends-sheet');dialog.setAttribute('aria-label','Cove Friends');document.body.append(dialog);}
 dialog.replaceChildren();dialog.append(el('h2',title),el('p',description,'muted'));
 const body=el('div',null,'friends-body');dialog.append(body);
 const status=el('p',null,'friends-status');status.setAttribute('role','status');dialog.append(status);
 dialog.append(button('Back to Cove',()=>dialog.close()));if(!dialog.open)dialog.showModal();return body;
}
function input(parent,label,type='text',max=80){const wrap=el('label',label),i=el('input');i.type=type;i.maxLength=max;wrap.append(i);parent.append(wrap);return i;}
function login(){const body=page('A little closer, even apart','Sign in to add friends. Your game stays on this device; only a Cove picture you choose to share is visible to accepted friends.');
 const form=el('form');body.append(form);const address=input(form,'Email address','email');address.autocomplete='email';address.value=email;const b=button('Send sign-in code',async()=>{if(!address.reportValidity()||!address.value.trim())return;email=address.value.trim();await request('/auth/v1/otp',{email,create_user:true});verify();},true);form.append(b);form.onsubmit=e=>{e.preventDefault();b.click();};
 body.append(el('p','No password to remember. Use the code in your email.','muted'));
}
function verify(){const body=page('Check your email','Enter the sign-in code sent to '+email+'.');const code=input(body,'Sign-in code','text',10);code.inputMode='numeric';code.autocomplete='one-time-code';body.append(button('Continue',async()=>{if(!/^\d{6,10}$/.test(code.value.trim()))throw Error('Enter the code from your email.');keep(await request('/auth/v1/verify',{email,token:code.value.trim(),type:'email'}));await join();},true),button('Use another email',login));}
async function join(){const body=page('Your name in the Cove','Friends will see this name beside your invitation.');const name=input(body,'Cove name','text',24);name.value=api.name().slice(0,24);body.append(button('Meet your friends',async()=>{await rpc('join',{name:name.value.trim()});await home();},true));}
async function home(){
 let data;try{data=await rpc('list');}catch(e){if(e.message.includes('Choose your Cove name'))return join();throw e;}
 const body=page('Cove Friends','A small circle. A place to drop by.');
 const code=el('section',null,'friends-card');code.append(el('span','Your friend code','muted'),el('strong',data.profile.code.match(/.{1,4}/g).join(' ')),button('Copy code',async()=>{await navigator.clipboard.writeText(data.profile.code);dialog.querySelector('[role=status]').textContent='Friend code copied.';}));body.append(code);
 const invite=el('form',null,'friends-invite');const field=input(invite,'Add by friend code','text',16);const send=button('Invite',async()=>{await rpc('request',{code:field.value});await home();},true);invite.append(send);invite.onsubmit=e=>{e.preventDefault();send.click();};body.append(invite);
 const sharing=el('section',null,'friends-card');sharing.append(el('strong','Your shared Cove'),el('p',data.shared_at?'Shared '+new Date(data.shared_at).toLocaleDateString():'Only you can see your Cove until you share it.','muted'),button(data.shared_at?'Update shared picture':'Share my Cove',preview,true));if(data.shared_at)sharing.append(button('Stop sharing',async()=>{await rpc('unpublish');await home();}));body.append(sharing);
 body.append(el('h3','Your circle'));
 if(!data.friends.length)body.append(el('p','Give your code to a friend to begin.','muted'));
 for(const friend of data.friends){const row=el('section',null,'friends-card');row.append(el('strong',friend.name));const actions=el('div',null,'friends-actions');if(friend.status==='accepted'){row.append(el('span',friend.shared_at?'A Cove to visit':'Has not shared a Cove yet','muted'));const visit=button('Visit',()=>visitFriend(friend),true);visit.disabled=!friend.shared_at;actions.append(visit,button('Manage',()=>manage(friend)));}else if(friend.incoming){row.append(el('span','Would like to be friends','muted'));actions.append(button('Accept',async()=>{await rpc('accept',{id:friend.id});await home();},true),button('Decline',async()=>{await rpc('remove',{id:friend.id});await home();}));}else{row.append(el('span','Invitation sent','muted'));actions.append(button('Cancel invitation',async()=>{await rpc('remove',{id:friend.id});await home();}));}row.append(actions);body.append(row);}
 if(data.hellos)body.append(el('p',data.hellos+' little hello'+(data.hellos===1?'':'s')+' received today.'));
 const consent=el('label',null,'friends-consent'),check=el('input');check.type='checkbox';check.checked=localStorage.getItem(CONSENT)==='yes';check.onchange=()=>localStorage.setItem(CONSENT,check.checked?'yes':'no');consent.append(check,document.createTextNode('Share basic feature counts to help improve the game. No messages, names or game saves are included.'));body.append(consent,button('Sign out',async()=>{try{await request('/auth/v1/logout',{},await token());}finally{session=null;localStorage.removeItem(SESSION);login();}}));
}
async function preview(){const picture=await api.picture();const body=page('Share this little home?','Accepted friends can view this saved picture while you are away. Your balances, purchases and save file stay private.');const img=el('img');img.src=picture;img.alt='Preview of your Cove';body.append(img,button('Share with friends',async()=>{await rpc('publish',{picture});track('snapshot_shared');await home();},true),button('Back to friends',home));}
async function visitFriend(friend){const v=await rpc('visit',{id:friend.id});if(!/^data:image\/webp;base64,/.test(v.picture))throw Error('This picture could not be opened.');const body=page(v.name,'A saved glimpse of your friend’s Cove · '+new Date(v.updated_at).toLocaleDateString());const img=el('img');img.src=v.picture;img.alt=friend.name+' shared Cove';body.append(img,el('p','Pinch to look closer. Your friend’s items and cats stay safe.','muted'),button('Leave a little hello',async()=>{await rpc('hello',{id:friend.id});track('hello_sent');dialog.querySelector('[role=status]').textContent='A little hello left for your friend. One per friend each day.';},true),button('Back to friends',home));track('visit_opened');}
function manage(friend){const body=page(friend.name,'You choose who is welcome in your circle.');body.append(button('Remove friend',async()=>{await rpc('remove',{id:friend.id});await home();}),button('Block invitations & visits',async()=>{await rpc('block',{id:friend.id});await home();}),button('Back to friends',home));}
export async function open(game){api=game;page('Cove Friends','Opening your circle…');if(!socialConfig.enabled){page('Cove Friends','Friends are being prepared for Neo testing. Your Cove stays safely on this device.');return;}await run(async()=>{if(session)await home();else login();});}
