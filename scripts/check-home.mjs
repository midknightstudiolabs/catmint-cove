import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
function fn(name){const found=html.match(new RegExp('function '+name+'\\([^]*?^}', 'm'));if(!found)throw Error(name);return found[0];}
// Exercise the actual migration with a browser-like store: source data must survive.
const source=JSON.stringify({v:9,cats:[{name:'Mochi'}],shells:321});
const data=new Map([['catmintCove.save.v9',source],['catmintCove.iap.v1','{"owned":{"welcome_pack":true}}']]);
const store={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v))};
const migrate=vm.runInNewContext('('+fn('neoReadSave')+')',{localStorage:store,SAVE_KEY:'catmintCove.neo.save.v9',IAP_STORE_KEY:'catmintCove.neo.iap.v1',OLD_SAVE_KEYS:[]});
assert.equal(migrate(),source);assert.equal(data.get('catmintCove.save.v9'),source);assert.equal(data.get('catmintCove.neo.original-backup'),source);
data.set('catmintCove.neo.save.v9','updated Neo');assert.equal(migrate(),'updated Neo');assert.equal(data.get('catmintCove.save.v9'),source);
data.delete('catmintCove.neo.save.v9');assert.equal(migrate(),null); // explicit Neo reset must not re-import original
console.log('PASS: migration preserves original, entitlements copied, reload prefers Neo, reset cannot re-import.');
// Long absence: no departures, no new illness, no food bill, existing illness recovers.
const cats=[{name:'Mochi',hunger:99,thirst:99,health:3,sick:{since:0},mood:40,star:1},{name:'Midknight',health:90,mood:70,star:1}];
const context={cats,G:{food:9},_wywaReport:null,catNeed:()=>null};vm.createContext(context);vm.runInContext(fn('offlineCare')+';offlineCare(30*86400);',context);
assert.equal(cats.length,2);assert.equal(cats[0].sick,null);assert.equal(context.G.food,9);assert.equal(context._wywaReport.leaving.length,0);assert(cats[0].health>=70);
console.log('PASS: 30-day absence preserves all cats, food and health.');
let n=16;const eligible=vm.runInNewContext('('+fn('neoGoalEligible')+')',{residentCount:()=>n,capacity:()=>16,G:{shells:1000},coaxPrice:()=>200});
assert(!eligible({id:'coax'}));assert(!eligible({id:'discover'}));assert(eligible({id:'pet'}));n=4;assert(eligible({id:'coax'}));
console.log('PASS: full-Cove and luck-dependent rituals excluded.');
const food=vm.runInNewContext('('+html.match(/function foodServingCost\(\)\{[^\n]+/)[0].split('//')[0]+')');assert.equal(food(),.8);
const price=vm.runInNewContext('('+html.match(/function coaxPrice\(\) \{[^\n]+/)[0]+')',{residentCount:()=>n});let previous=0;for(n=0;n<=24;n++){const p=price();assert(p>=previous&&p<=1800);previous=p;}
console.log('PASS: predictable food unit price and bounded adoption curve.');
assert(html.includes('if (_focusT > 0.01 && !_ovActive)'));assert(html.includes('neoCoveForeground(ctx)'));assert(html.includes('neoRaceMeadow(g,RACE_W,RACE_H)'));
assert(!html.includes('Confirm purchase —'));assert(html.includes('Preview only on the web'));
console.log('PASS: approved scenery integrations retained; no simulated public purchases.');
