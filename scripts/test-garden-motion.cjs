const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('ui/garden-world.js','utf8');
function run(width,reduced=false){
 let next,draws=0,hidden=false;const positions=new Map(),ys=new Set(),ranges=new Map();
 const context=new Proxy({},{get:()=>()=>{},set:()=>true});
 const host={clientWidth:width,clientHeight:650,isConnected:true,prepend(){},closest(){return hidden?{}:null;},getBoundingClientRect(){return{top:0};},querySelectorAll(){return[310,310,520,520].map(bottom=>({getBoundingClientRect:()=>({bottom})}));}};
 const document={hidden:false,createElement:()=>({setAttribute(){},getContext:()=>context})};
 const scope={document,devicePixelRatio:2,matchMedia:()=>({matches:reduced}),ResizeObserver:class{observe(){}disconnect(){}},IntersectionObserver:class{observe(){}disconnect(){}},requestAnimationFrame:f=>(next=f,1),cancelAnimationFrame(){next=null;}};
 vm.runInNewContext(source,scope);
 const actors=[{},{},{}];scope.CoveGardenScene.mount(host,actors,(_,cat,x,y,scale,t,walk)=>{
  assert(Number.isFinite(x)&&Number.isFinite(y)&&Number.isFinite(cat.walk));
  assert(x>=35&&x<=width-35);const old=positions.get(cat);
  if(old!==undefined)assert(Math.abs(x-old)<1,'cat jumped between frames');
  if(reduced)assert.equal(cat.walkAmt,0,'reduced motion must suppress the bouncing gait');
  const range=ranges.get(cat)||[x,x];range[0]=Math.min(range[0],x);range[1]=Math.max(range[1],x);ranges.set(cat,range);
  positions.set(cat,x);ys.add(y);draws++;
 });
 for(let t=0;t<120000;t+=1000/60)next(t);
 assert.equal(ys.size,3,'cats need separate lanes');
 for(const [min,max] of ranges.values())assert(max-min>30,'every cat must actually roam');
 const paused=draws;hidden=true;next(120100);assert.equal(draws,paused);assert(next,'hidden panel must not destroy its animation');hidden=false;next(120200);assert(draws>paused,'animation must resume');
 const before=draws;document.hidden=true;next(121000);assert.equal(draws,before);
 scope.CoveGardenScene.stop();assert.equal(next,null);
}
run(320);run(1024);run(390,true);
console.log('PASS: bounded continuous garden motion, separate lanes, reduced motion, hidden pause and cleanup.');
