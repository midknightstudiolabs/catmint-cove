const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('ui/garden-world.js','utf8');
function run(width,reduced=false){
 let next,draws=0;const positions=new Map(),ys=new Set();
 const context=new Proxy({},{get:()=>()=>{},set:()=>true});
 const host={clientWidth:width,clientHeight:650,isConnected:true,prepend(){},closest(){return null;},getBoundingClientRect(){return{top:0};},querySelectorAll(){return[310,310,520,520].map(bottom=>({getBoundingClientRect:()=>({bottom})}));}};
 const document={hidden:false,createElement:()=>({setAttribute(){},getContext:()=>context})};
 const scope={document,devicePixelRatio:2,matchMedia:()=>({matches:reduced}),ResizeObserver:class{observe(){}disconnect(){}},IntersectionObserver:class{observe(){}disconnect(){}},requestAnimationFrame:f=>(next=f,1),cancelAnimationFrame(){next=null;}};
 vm.runInNewContext(source,scope);
 const actors=[{},{},{}];scope.CoveGardenScene.mount(host,actors,(_,cat,x,y,scale,t,walk)=>{
  assert(Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(cat.walk));
  assert(x>=35&&x<=width-35);const old=positions.get(cat);
  if(old!==undefined)assert(Math.abs(x-old)<1,'cat jumped between frames');
  if(reduced)assert(!walk,'reduced motion should not walk');
  positions.set(cat,x);ys.add(y);draws++;
 });
 for(let t=0;t<120000;t+=1000/60)next(t);
 assert.equal(ys.size,3,'cats need separate lanes');
 const before=draws;document.hidden=true;next(121000);assert.equal(draws,before);
 scope.CoveGardenScene.stop();assert.equal(next,null);
}
run(320);run(1024);run(390,true);
console.log('PASS: bounded continuous garden motion, separate lanes, reduced motion, hidden pause and cleanup.');
