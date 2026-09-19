const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
class Element{
 constructor(tag){this.tag=tag;this.children=[];this.textContent='';this.open=false;this.isConnected=true;this.attrs={};}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(){this.children=[];}
 setAttribute(k,v){this.attrs[k]=v;}
 showModal(){this.open=true;}
 close(){this.open=false;}
 querySelector(selector){return all(this).find(e=>selector==='[role=status]'&&e.attrs.role==='status');}
}
function all(e){return [e,...e.children.flatMap(all)];}
const body=new Element('body'),store=new Map([['neo.friends.session',JSON.stringify({access_token:'fixture',expires_at:Date.now()+3600000})]]),calls=[];
const fixture={profile:{code:'ABCD1234EFGH'},friends:[{id:'peer',name:'Test Cove',status:'accepted',shared_at:'2026-09-20T00:00:00Z'}],hellos:0};
const context=vm.createContext({console,Date,JSON,Error,TypeError,AbortController,setTimeout,clearTimeout,socialConfig:{enabled:true,url:'https://fixture.invalid',key:'fixture'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},navigator:{clipboard:{writeText:async()=>{}}},document:{body,createElement:t=>new Element(t),createTextNode:t=>Object.assign(new Element('text'),{textContent:t})},fetch:async(url,opts)=>{const data=JSON.parse(opts.body);calls.push(data);return {ok:true,json:async()=>data.action==='list'?fixture:{ok:true}};}});
let source=fs.readFileSync(require('node:path').join(__dirname,'../ui/cove-friends.js'),'utf8').replace("import { socialConfig } from './social-config.js';",'').replace(/export /g,'');
vm.runInContext(source,context);
function find(text){const e=all(body).find(e=>e.tag==='button'&&e.textContent===text);assert(e,'Missing '+text);return e;}
async function click(text){await find(text).onclick();}
(async()=>{
 await vm.runInContext("open({name:()=> 'My Cove'})",context);
 assert(find('Refresh friends'));
 const input=all(body).find(e=>e.tag==='input'&&e.type==='text');
 input.value='bad';await click('Find friend');assert(!calls.some(c=>c.action==='request'));
 assert(all(body).some(e=>e.textContent==='Enter the 12-character friend code.'));
 input.value='ABCD1234EFGH';await click('Find friend');assert(!calls.some(c=>c.action==='request'));
 context.fetch=async(url,opts)=>{const d=JSON.parse(opts.body);calls.push(d);return {ok:true,json:async()=>d.action==='list'?fixture:d.action==='preview'?{name:'Test Cove',code:'ZZZZ1111AAAA'}:{ok:true}};};
 input.value='zzzz 1111 aaaa';await click('Find friend');assert(!calls.some(c=>c.action==='request'));assert(all(body).some(e=>e.textContent==='Test Cove'));
 await click('Send invitation');assert(calls.some(c=>c.action==='request'&&c.payload.code==='ZZZZ1111AAAA'));
 assert(all(body).some(e=>e.textContent.startsWith('Invitation sent.')));
 await click('Manage');await click('Remove friend');assert(!calls.some(c=>c.action==='remove'));
 await click('Cancel');await click('Block invitations & visits');assert(!calls.some(c=>c.action==='block'));
 await click('Block friend');assert(calls.some(c=>c.action==='block'));
 await vm.runInContext("run(async()=>{page('New page','');throw Error('Visible on current page');})",context);
 assert(all(body).some(e=>e.textContent==='Visible on current page'));
 assert(!calls.some(c=>c.action==='event'),'Analytics must remain opt-in');
 console.log('PASS: code validation, normalized invitation, refresh control, remove/block confirmation, current-page errors and analytics opt-in (mock backend).');
})().catch(e=>{console.error(e);process.exitCode=1;});
