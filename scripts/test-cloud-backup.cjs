const fs=require('fs'),path=require('path'),assert=require('assert');
const pw=require(process.env.PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(__dirname,'..');
(async()=>{for(const engine of ['chromium','webkit']){
 const browser=await pw[engine].launch(engine==='chromium'?{channel:'msedge',headless:true}:{headless:true});
 try{
 const p=await browser.newPage({viewport:{width:390,height:844}});let saved=null;const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>localStorage.setItem('neo.friends.session',JSON.stringify({access_token:'test',refresh_token:'test',expires_at:Date.now()+3600000})));
 await p.route('https://gbkkiejmqocbijhnzoxg.supabase.co/**',r=>{const d=r.request().postDataJSON();let out;
  if(r.request().url().endsWith('/neo_backup')){
   if(d.action==='save'){saved={id:'test-backup',created_at:new Date().toISOString(),code:d.code};out=saved;}
   else if(d.action==='list')out=saved?[saved]:[];else out=saved;
  }else out={profile:{code:'ABCD1234EFGH'},friends:[],shared_at:null,hellos:0};
  return r.fulfill({json:out});
 });
 await p.route('http://neo.backup/**',r=>{const u=new URL(r.request().url()),file=path.join(root,u.pathname==='/'?'index.html':u.pathname);if(!fs.existsSync(file))return r.abort();if(u.pathname.endsWith('social-config.js'))return r.fulfill({body:fs.readFileSync(file,'utf8').replace('enabled:false','enabled:true'),contentType:'text/javascript'});return r.fulfill({path:file});});
 await p.goto('http://neo.backup/');await p.waitForTimeout(1200);
 await p.evaluate(()=>{document.getElementById('titleScreen').hidden=true;__cove.G.tutorialDone=true;});
 await p.locator('#todayBtn').click();await p.locator('#coveFriendsBtn').click();
 await p.getByText('Account & privacy',{exact:true}).click();await p.getByRole('button',{name:'Cove backups',exact:true}).click();
 await p.getByText('No cloud backup yet.',{exact:false}).waitFor();
 await p.getByRole('button',{name:'Back up this Cove',exact:true}).click();
 await p.getByRole('button',{name:'Review restore',exact:true}).click();assert(saved.code.startsWith('CMC1.'));
 await p.getByRole('button',{name:'Cancel',exact:true}).click();
 assert.equal(await p.evaluate(()=>localStorage.getItem('catmintCove.neo.before-cloud-restore')),null);
 await p.getByRole('button',{name:'Review restore',exact:true}).click();
 await Promise.all([p.waitForEvent('load'),p.getByRole('button',{name:'Restore backup',exact:true}).click()]);
 assert(await p.evaluate(()=>JSON.parse(localStorage.getItem('catmintCove.neo.before-cloud-restore')).cats.length>0));
 assert.deepEqual(errors,[]);console.log(engine+' backup review, cancel, restore and local safety copy PASS (mock backend)');
 }finally{await browser.close();}
}})().catch(e=>{console.error(e);process.exit(1);});
