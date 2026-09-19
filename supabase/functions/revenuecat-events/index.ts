// Server only. Deploy with verify_jwt=false: RevenueCat authenticates with its
// dedicated Authorization header, never a player token. No entitlement grants.
export async function handle(req, env = Deno.env, send = fetch) {
 const reply=(status,message)=>Response.json({message},{status});
 if(req.method!=='POST')return reply(405,'POST required');
 const secret=env.get('REVENUECAT_WEBHOOK_TOKEN');
 if(!secret)return reply(503,'Webhook secret missing');
 if(secret.length<32)return reply(503,'Webhook secret must contain at least 32 characters');
 const supplied=req.headers.get('authorization')||'';
 const expected='Bearer '+secret;
 const digest=async s=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));
 const [a,b]=await Promise.all([digest(supplied),digest(expected)]);
 let different=0;for(let i=0;i<a.length;i++)different|=a[i]^b[i];
 if(different)return reply(401,'Unauthorized');
 let body;
 try{
  const reader=req.body?.getReader();if(!reader)return reply(400,'Body required');
  const chunks=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();return reply(413,'Too large');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  body=JSON.parse(new TextDecoder().decode(bytes));
 }catch{return reply(400,'Invalid JSON');}
 const e=body?.event;
 const str=(v,max=200)=>typeof v==='string'&&v.length>0&&v.length<=max;
 if(body?.api_version!=='1.0'||!e||!str(e.id)||!str(e.type)||!Number.isSafeInteger(e.event_timestamp_ms)||e.event_timestamp_ms<0)return reply(400,'Invalid event');
 // Test deliveries contain no real transaction. They verify connectivity only.
 if(e.type==='TEST')return reply(200,'Test accepted');
 if(!['app12b6a84e70','app515504ac46'].includes(e.app_id)||!['SANDBOX','PRODUCTION'].includes(e.environment))return reply(400,'Unknown app or environment');
 const optional=k=>e[k]==null?null:str(e[k],512)?e[k]:undefined;
 const row={event_id:e.id,app_id:e.app_id,environment:e.environment,event_type:e.type,event_timestamp_ms:e.event_timestamp_ms,related_ids:{}};
 for(const k of ['app_user_id','original_app_user_id','product_id','store','transaction_id','original_transaction_id']){row[k]=optional(k);if(row[k]===undefined)return reply(400,'Invalid field');}
 for(const k of ['aliases','transferred_from','transferred_to']){if(e[k]!==undefined){if(!Array.isArray(e[k])||e[k].length>100||!e[k].every(v=>str(v,512)))return reply(400,'Invalid identities');row.related_ids[k]=e[k];}}
 const url=env.get('SUPABASE_URL'),key=env.get('SUPABASE_SERVICE_ROLE_KEY');
 if(!url||!key)return reply(503,'Not configured');
 try{
  const result=await send(url+'/rest/v1/neo_purchase_events?on_conflict=event_id',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json',Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(row),signal:AbortSignal.timeout(8000)});
  if(!result.ok)return reply(503,'Please retry');
  return reply(200,'Recorded');
 }catch{return reply(503,'Please retry');}
}
if(import.meta.main)Deno.serve(req=>handle(req));
