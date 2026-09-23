const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('index.html','utf8');
function section(a,b){return source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));}
const nodes=new Map();const node=()=>({classList:{remove(){},contains(){return false;}},hidden:false,textContent:''});
const context={G:{tutorialDone:false,bowls:1,moments:[]},cats:[{mascot:true}],_cold:{},_coldTarget:{},visitorTimer:0,
 document:{getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id);}},
 panels:{dex:{hidden:true}},setTimeout(){},rebuildAttractors(){},sfx(){},logMoment(){},rand:()=>60,save(){},syncHud(){},closeAllPanels(){this.closed=true;},
 scriptArrival(){const cat={mascot:false};context.cats.push(cat);return cat;},Date,
};
vm.createContext(context);
vm.runInContext(section('const COLD = [','function startColdOpen()')+'\nthis.steps=COLD;',context);
assert.equal(context.steps.length,4);
const progress={};assert.equal(context.steps[3].test(progress),false);
context.panels.dex.hidden=false;assert.equal(context.steps[3].test(progress),false,'do not close Catdex as soon as it opens');
context.panels.dex.hidden=true;assert.equal(context.steps[3].test(progress),true);
vm.runInContext(section('function endColdOpen(skipped)','/* ---------- reference card'),context);
context.endColdOpen(true);assert.equal(context.G.tutorialDone,true);assert.equal(context.G.bowls,2);assert.equal(context.cats.length,2);assert.equal(context.G.coldStep,4);
context.endColdOpen(true);assert.equal(context.cats.length,2,'completion must not grant duplicate cats');
let prompts=0;Object.assign(context,{analyticsAskDue:()=>true,_cold:null,festMode:false,restMode:false,_placing:false,_arranging:false,anyPanelOpen:()=>false,scrim:node(),window:{_sessionStart:Date.now()},showAnalyticsAsk:()=>prompts++});
vm.runInContext(section('function analyticsAskTick()','window._sessionStart ='),context);
context.analyticsAskTick();assert.equal(prompts,0);
context.window._sessionStart=Date.now()-600000;context.analyticsAskTick();assert.equal(prompts,0,'recent intro still blocks consent prompt');
context.G.coldCompletedAt=Date.now()-600000;context.analyticsAskTick();assert.equal(prompts,1,'consent remains available after settling in');
console.log('PASS: four-step intro, Catdex browsing, skip completion, idempotent rewards and first-five-minute consent protection.');
