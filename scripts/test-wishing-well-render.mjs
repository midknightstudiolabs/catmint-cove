// Dependency-free lifecycle/animation smoke test; no player save or reward is touched.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
let nextFrame, pulls=0, disconnected=0, balance=0;
const gradient={addColorStop(){}};
const ctx=new Proxy({save(){balance++;},restore(){balance--;assert.ok(balance>=0);},createRadialGradient(){return gradient;},createLinearGradient(){return gradient;}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});
const elements={};
function element(){return {hidden:false,offsetHeight:80,classList:{add(){},remove(){}},getContext(){return ctx;}};}
const panel={...element(),isConnected:true,clientWidth:390,clientHeight:844,querySelector(q){return elements[q]??=element();}};
const sandbox={Math,Date,console,devicePixelRatio:3,Path2D:class{},matchMedia:()=>({matches:false}),ResizeObserver:class{observe(){}disconnect(){disconnected++;}},document:{hidden:false,getElementById:()=>panel},requestAnimationFrame(fn){nextFrame=fn;return 1;},cancelAnimationFrame(){nextFrame=null;},setInterval(){return 1;},clearInterval(){},setTimeout(fn){fn();}};
vm.createContext(sandbox);vm.runInContext(readFileSync(new URL('../ui/wishing-well.js',import.meta.url),'utf8'),sandbox);
sandbox.CoveWishingWell.open({close(){},cats:()=>[],hud(){},bg(){},night:()=>1,ritualState:()=>({available:pulls===0,readyAt:Date.now()+86400000}),ritualPull(){pulls++;return {reward:{shells:10}};},sfx(){},accInfo(){}});
assert.equal(elements.canvas.width,780);
elements['#ww-wish'].onclick();elements['#ww-wish'].onclick();assert.equal(pulls,1,'double tap must not pull twice');
for(let t=40;t<=4000;t+=40){nextFrame(t);assert.equal(balance,0,'canvas transforms balanced');}
assert.equal(elements['#ww-card'].hidden,false,'reward revealed');
elements['#ww-ok'].onclick();assert.equal(elements['#ww-wish'].disabled,true,'cooldown remains enforced');
panel.hidden=true;nextFrame(4040);assert.equal(disconnected,1,'hidden view releases observer');assert.equal(nextFrame,null);
console.log('PASS: sharp canvas, balanced rendering, single reward, reveal, cooldown, hidden-view cleanup');
