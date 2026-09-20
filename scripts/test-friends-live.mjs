// Explicit opt-in: creates three retained test identities in the configured backend.
import assert from 'node:assert/strict';
import {socialConfig as config} from '../ui/social-config.js';
if(!process.argv.includes('--create-test-accounts'))throw Error('Pass --create-test-accounts to run the authorized live integration test.');
const accounts=[];
async function call(path,data,session){
 const res=await fetch(config.url+path,{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json',...(session?{Authorization:'Bearer '+session.access_token}:{})},body:JSON.stringify(data),signal:AbortSignal.timeout(15000)});
 const body=await res.json();if(!res.ok)throw Error(body.message||body.msg||body.error_description||'Request failed: '+res.status);return body;
}
const rpc=(s,action,payload={})=>call('/rest/v1/rpc/neo_social',{action,payload},s);
try{
 for(const label of ['A','B','outsider']){
  const session=await call('/auth/v1/signup',{data:{test_purpose:'Cove Friends controlled test',test_label:label}});
  assert(session.access_token&&session.refresh_token);accounts.push({label,session});
  await rpc(session,'join',{name:'QA Friends '+label});
 }
 const [a,b,c]=accounts.map(x=>x.session);
 const profileA=(await rpc(a,'list')).profile,profileB=(await rpc(b,'list')).profile;
 assert.equal((await rpc(a,'preview',{code:profileB.code})).name,'QA Friends B');
 await rpc(a,'request',{code:profileB.code});
 assert((await rpc(b,'list')).friends.some(f=>f.id===a.user.id&&f.incoming&&f.status==='pending'));
 await assert.rejects(rpc(a,'accept',{id:b.user.id}));
 await assert.rejects(rpc(a,'visit',{id:b.user.id}));
 await rpc(b,'accept',{id:a.user.id});
 // Synthetic fixture only: no player image/save is transmitted.
 const picture='data:image/webp;base64,UklGRg==';
 await rpc(b,'publish',{picture});
 assert.equal((await rpc(a,'visit',{id:b.user.id})).picture,picture);
 await assert.rejects(rpc(c,'visit',{id:b.user.id}));
 await rpc(a,'hello',{id:b.user.id});await rpc(a,'hello',{id:b.user.id});
 assert.equal((await rpc(b,'list')).hellos,1);
 const refreshed=await call('/auth/v1/token?grant_type=refresh_token',{refresh_token:a.refresh_token});
 accounts[0].session=refreshed;
 assert.equal((await rpc(refreshed,'list')).profile.code,profileA.code);
 assert((await rpc(refreshed,'list')).friends.some(f=>f.id===b.user.id&&f.status==='accepted'));
 await rpc(b,'unpublish');await assert.rejects(rpc(refreshed,'visit',{id:b.user.id}));
 await rpc(refreshed,'block',{id:b.user.id});await assert.rejects(rpc(b,'hello',{id:a.user.id}));
 const issued=await call('/rest/v1/rpc/neo_protection',{action:'issue'},refreshed);
 const recovered=await call('/auth/v1/signup',{data:{test_purpose:'Cove Friends recovery verification'}});
 accounts.push({label:'recovered',session:recovered});
 await call('/rest/v1/rpc/neo_protection',{action:'recover',secret:issued.key},recovered);
 assert.equal((await rpc(recovered,'list')).profile.code,profileA.code);
 await assert.rejects(rpc(refreshed,'list'));
 await call('/rest/v1/rpc/neo_protection',{action:'recover',secret:issued.key},recovered);
 await call('/rest/v1/rpc/neo_privacy',{action:'unblock',peer:b.user.id},recovered);
 assert.equal((await call('/rest/v1/rpc/neo_privacy',{action:'blocked'},recovered)).length,0);
 console.log('PASS: recovery preserves friend code, revokes old access, safely retries and unblocks.');
 console.log('PASS: real anonymous signup, name preview, invitation/acceptance, private snapshot access, outsider denial, greeting deduplication, refreshed-session identity/friendship preservation, stop sharing and block.');
}finally{
 console.log('Retained controlled-test account IDs (no credentials):',accounts.map(a=>({label:a.label,id:a.session.user.id})));
}
