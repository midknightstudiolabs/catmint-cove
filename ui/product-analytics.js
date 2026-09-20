/* Optional product analytics. No save data, names, email or cat identity. */
(function(root){
'use strict';
const URL='https://gbkkiejmqocbijhnzoxg.supabase.co',KEY='sb_publishable_WWIQb4Oearl1lIyXwifNCg_foWu1aFv',CONSENT='neo.product.analytics.v1',SESSION='neo.product.session',QUEUE='neo.product.queue';
let queue=[],session=null,inflight=false,epoch=0;const rounds=new Map();
try{queue=JSON.parse(localStorage.getItem(QUEUE)||'[]').slice(-200);session=JSON.parse(localStorage.getItem(SESSION)||'null');}catch{}
const allowed=new Set(['session_started','item_purchased','activity_started','activity_completed','menu_opened']);
function enabled(){try{return localStorage.getItem(CONSENT)==='yes';}catch{return false;}}
function persist(){try{localStorage.setItem(QUEUE,JSON.stringify(queue));}catch{}}
async function request(path,body,token){const r=await fetch(URL+path,{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Analytics unavailable');return r.json();}
async function auth(){if(!session||session.expires_at*1000<Date.now()+60000){session=await request(session?'/auth/v1/token?grant_type=refresh_token':'/auth/v1/signup',session?{refresh_token:session.refresh_token}:{data:{}});try{localStorage.setItem(SESSION,JSON.stringify(session));}catch{}}return session.access_token;}
async function flush(){if(inflight||!enabled()||!queue.length||!navigator.onLine)return;inflight=true;const revision=epoch,batch=queue.slice(0,40);try{const token=await auth();if(!enabled()||revision!==epoch)return;await request('/rest/v1/rpc/neo_product_ingest',{batch},token);if(revision===epoch){const ids=new Set(batch.map(x=>x.id));queue=queue.filter(x=>!ids.has(x.id));persist();}}catch{}finally{inflight=false;}}
function emit(event,data={}){if(!enabled()||!allowed.has(event))return null;try{const id=crypto.randomUUID(),platform=root.Capacitor?.getPlatform?.()||'web';const row={id,event,at:new Date().toISOString(),platform:platform==='ios'?'iOS':platform==='android'?'Android':'Web',release:'3.2.0-analytics.1',channel:root.Capacitor?.isNativePlatform?.()?'native':'neo',entity:String(data.entity||'').slice(0,60),category:String(data.category||'').slice(0,20),round:data.round||null,shells:Math.max(0,Math.round(data.shells||0)),pearls:Math.max(0,Math.round(data.pearls||0))};queue.push(row);queue=queue.slice(-200);persist();return id;}catch{return null;}}
function start(entity){if(!enabled())return null;try{const round=crypto.randomUUID();rounds.set(entity,round);emit('activity_started',{entity,round});return round;}catch{return null;}}
function complete(entity,round){round=round||rounds.get(entity);if(!round)return;emit('activity_completed',{entity,round});rounds.delete(entity);}
function setConsent(yes){epoch++;try{localStorage.setItem(CONSENT,yes?'yes':'no');}catch{}if(!yes){queue=[];rounds.clear();persist();}else{emit('session_started');flush();}}
function mount(parent){if(!parent||parent.querySelector('[data-product-consent]'))return;const label=document.createElement('label');label.dataset.productConsent='';label.style.cssText='display:flex;gap:12px;align-items:flex-start;padding:16px 0;text-align:left;font-size:14px;line-height:1.5';const check=document.createElement('input');check.type='checkbox';check.checked=enabled();check.style.cssText='min-width:22px;min-height:22px';check.onchange=()=>setConsent(check.checked);label.append(check,document.createTextNode('Help improve the Cove: share optional counts of games played, menu use and in-game purchases. No names, messages or saves. Turn off here anytime.'));parent.append(label);}
root.CoveAnalytics={emit,start,complete,mount,enabled,setConsent,flush};
if(enabled())document.addEventListener('DOMContentLoaded',()=>emit('session_started'),{once:true});else{queue=[];persist();}
setInterval(flush,20000);addEventListener('online',flush);document.addEventListener('visibilitychange',()=>{if(document.hidden)flush();});
})(globalThis);
