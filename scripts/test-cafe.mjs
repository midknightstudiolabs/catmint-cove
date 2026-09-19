import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
await import('../ui/cafe-engine.js');
const E=globalThis.CoveCafeEngine;
const make=()=>({shells:1000,homestead:{stock:{carrot:9},plots:[{key:'pumpkin',ready:555}],counter:4,earned:6,trays:[{key:'carrot',servings:4}],stoves:[{key:'berry',ready:999}],tables:4}});
let g=make(),legacy=JSON.stringify(g.homestead);E.init(g,0);assert(E.unlock(g,0));assert.equal(g.shells,918);assert.equal(g.homestead.counter,4);assert.equal(g.homestead.stoves[0].key,'berry');assert(!E.unlock(g,0));
g.cafe.cursor=0;E.settle(g,240000);assert.equal(g.cafe.served,0);assert(g.cafe.pending);assert.equal(g.homestead.stock.coffee,5);E.settle(g,270000);assert.equal(g.cafe.served,1);assert.equal(g.shells,930);E.settle(g,270000);assert.equal(g.shells,930);
g=JSON.parse(JSON.stringify(g));E.settle(g,269000);assert.equal(g.cafe.served,1);
let online=make(),offline=make();E.unlock(online,0);E.unlock(offline,0);for(let t=1000;t<=3600000;t+=1000)E.settle(online,t);E.settle(offline,3600000);assert.deepEqual(online,offline);
E.settle(offline,999999999);assert(Object.values(offline.homestead.stock).every(n=>n>=0));const paid=offline.shells;E.settle(offline,999999999);assert.equal(offline.shells,paid);
offline.cafe.open=false;E.settle(offline,1000999999);const stock=JSON.stringify(offline.homestead.stock);E.settle(offline,1001999999);assert.equal(JSON.stringify(offline.homestead.stock),stock);
let fresh=make();E.acquire(fresh,'coffee',10,50);assert.equal(fresh.cafe.basis.coffee,5);E.acquire(fresh,'coffee',10,10);assert.equal(fresh.cafe.basis.coffee,3);
let cap=make();E.unlock(cap,0);cap.homestead.stock={coffee:10000,catmint:10000,honey:10000};E.settle(cap,100*86400000);assert(cap.cafe.served<=180);
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){if(m[1].trim())new vm.Script(m[1]);}
assert(html.indexOf('ui/cafe-engine.js')<html.indexOf('function save()'));
console.log('PASS: unlock, legacy preservation, pending orders, no duplicate credits, save/reload, clock rollback, online/offline equivalence, stock limits, pause, weighted costs, offline cap and inline syntax.');
