import fs from 'node:fs';import vm from 'node:vm';
const ctx={window:{},globalThis:{}};ctx.globalThis=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../ui/cafe-engine.js',import.meta.url),'utf8'),ctx);
const E=ctx.window.CoveCafeEngine||ctx.CoveCafeEngine;let bad=0;const ok=(n,c,x='')=>{console.log((c?'PASS':'FAIL')+': '+n+(x?' — '+x:''));if(!c)bad++;};
const day=new Date(2026,8,22).getTime(),H=3600000;
let inRush=0,total=0,wins=new Set();
for(let m=0;m<1440;m++){const r=E.rush(day+m*60000);total++;if(r.active){inRush++;wins.add(r.start);}}
ok('Two rush windows a day',wins.size===2,[...wins].map(t=>new Date(t).toTimeString().slice(0,5)).join(', '));
ok('Together 90 minutes',inRush===90,String(inRush));
const [a,b]=[...wins].sort();ok('One in the morning, one in the afternoon',new Date(a).getHours()>=7&&new Date(a).getHours()<11&&new Date(b).getHours()>=14&&new Date(b).getHours()<18);
ok('Rush windows differ from day to day',new Set([0,1,2,3,4].map(i=>new Date(E.rush(day+i*24*H+9*H).start||E.rush(day+i*24*H+9*H).next).getTime()%(24*H))).size>1);
const s={speed:0};ok('Normal interval is unchanged',E.interval(s)===240000&&E.interval(s,a-1)===240000);
ok('During a rush guests arrive 40% faster',E.interval(s,a+60000)===144000,String(E.interval(s,a+60000)));
ok('next is reported outside a rush',E.rush(a-H).active===false&&E.rush(a-H).next===a);
// same offline arithmetic as live: settle across a rush produces more guests than the same time outside one
const mk=(open)=>({homestead:{stock:{coffee:999,catmint:999,honey:999},plots:[],tables:3},shells:0,cafe:null});
function run(start){const g=mk();const s=E.init(g,start);s.unlocked=true;s.menu=['coffee'].filter(()=>false);const r=E.recipes[0];s.menu=[r.id];s.discovered=[r.id];s.open=true;s.cursor=start;for(const k of Object.keys(r.inputs))g.homestead.stock[k]=999;E.settle(g,start+H);return s.served+(s.pending?1:0);}
const inside=run(a),outside=run(a-5*H);ok('An hour inside a rush serves more guests than an ordinary hour',inside>outside,inside+' vs '+outside);
if(bad)process.exit(1);
