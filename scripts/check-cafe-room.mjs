import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const text=fs.readFileSync(new URL('../ui/cafe-room.js',import.meta.url),'utf8');const c={};vm.createContext(c);vm.runInContext(text.slice(0,text.indexOf('function neoPaintCafe')),c);
const h={tables:3},items=c.neoCafeFurniture(h);assert.equal(items.length,6);assert(c.neoCafeCanPlace(items,'table0',0,2));assert(!c.neoCafeCanPlace(items,'table0',3,4));assert(!c.neoCafeCanPlace(items,'table0',4,0));assert(!c.neoCafeCanPlace(items,'table0',8,0));
const wall=Array.from({length:8},(_,x)=>({id:'w'+x,type:'plant',x,y:3}));assert.equal(c.neoCafeRoute(wall,{x:1,y:0}),null);
items.find(f=>f.id==='table0').x=0;const reload=JSON.parse(JSON.stringify(h));c.neoCafeFurniture(reload);assert.equal(reload.furniture.find(f=>f.id==='table0').x,0);
console.log('PASS: furniture migration, persistent layout, occupied tiles, room bounds, doorway and unreachable routes.');
