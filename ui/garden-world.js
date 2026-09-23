(function(root){
'use strict';let stop=()=>{};
root.CoveGardenScene={stop(){stop();},mount(host,actors,drawCat){
stop();const canvas=document.createElement('canvas'),land=document.createElement('canvas');canvas.className='garden-coast';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
const ctx=canvas.getContext('2d'),g=land.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const cats=actors.slice(0,3).map((cat,i)=>({cat,x:.18+i*.3,from:0,to:0,wait:2+i*3,elapsed:0,duration:0,face:i%2?-1:1,visits:0}));
let frame=0,last=0,clock=0,ended=false,w=0,h=0,lanes=[],visible=true;
function landscape(){
g.clearRect(0,0,w,h);g.fillStyle='#c4d2a0';g.fillRect(0,0,w,h);
for(let i=0;i<70;i++){const x=(i*137.3)%w,y=88+(i*79.7)%Math.max(1,h-88);g.fillStyle=i%2?'#becd9840':'#e3e6b640';g.beginPath();g.ellipse(x,y,22+i%4*8,9,0,0,Math.PI*2);g.fill();}
// Overhead shoreline keeps the land and the water on one ground plane.
g.fillStyle='#91bec0';g.fillRect(0,0,w,48);g.fillStyle='#b5d3c9';g.beginPath();g.moveTo(0,38);g.bezierCurveTo(w*.3,57,w*.6,24,w,43);g.lineTo(w,63);g.lineTo(0,63);g.fill();g.fillStyle='#e5d8b1';g.beginPath();g.moveTo(0,51);g.bezierCurveTo(w*.25,68,w*.7,41,w,57);g.lineTo(w,76);g.lineTo(0,76);g.fill();
g.strokeStyle='#d8e8de';g.lineWidth=1.5;for(let i=0;i<9;i++){const x=i*111;g.beginPath();g.moveTo(x,18+i%3*7);g.lineTo(x+34,18+i%3*7);g.stroke();}
const paths=()=>{g.beginPath();g.moveTo(w/2,78);g.lineTo(w/2,h);g.stroke();for(const y of lanes){g.beginPath();g.moveTo(0,y);g.bezierCurveTo(w*.3,y-3,w*.7,y+3,w,y);g.stroke();}};
g.lineCap='round';g.strokeStyle='#b6c38e';g.lineWidth=35;paths();g.strokeStyle='#d5c69f';g.lineWidth=28;paths();g.strokeStyle='#e0d2ae';g.lineWidth=21;paths();
for(const y of lanes){g.fillStyle='#bdaa8255';for(let x=24;x<w;x+=97){g.beginPath();g.ellipse(x,y+5,2,1,0,0,Math.PI*2);g.fill();}}
g.strokeStyle='#a78c63';g.lineWidth=3;for(const [a,b] of [[10,w/2-27],[w/2+27,w-10]]){g.beginPath();g.moveTo(a,85);g.lineTo(b,85);g.stroke();for(let x=a;x<b;x+=38){g.fillStyle='#bfa57a';g.fillRect(x,77,4,17);}}
for(let i=0;i<Math.ceil(h/85);i++)for(const x of [8,w-8]){const y=117+i*85;g.strokeStyle='#91a977';g.lineWidth=1.7;g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y-5);g.moveTo(x,y);g.lineTo(x+3,y-7);g.stroke();}
}
function resize(){w=host.clientWidth;h=host.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);for(const c of [canvas,land]){c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);g.setTransform(dpr,0,0,dpr,0,0);const box=host.getBoundingClientRect();lanes=[106];for(const tile of host.querySelectorAll('.field-plot,.garden-add-patch')){const r=tile.getBoundingClientRect(),y=r.bottom-box.top+24;if(!lanes.some(v=>Math.abs(v-y)<8))lanes.push(y);}lanes.sort((a,b)=>a-b);landscape();}
const observer=new ResizeObserver(resize);observer.observe(host);resize();const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});visibility.observe(host);
stop=()=>{ended=true;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();};
function paint(t){if(ended)return;if(!host.isConnected||host.closest('[hidden]')){stop();return;}frame=requestAnimationFrame(paint);if(document.hidden||!visible){last=0;return;}const dt=last?Math.min(.05,(t-last)/1000):0;last=t;if(!reduced.matches)clock+=dt;
ctx.clearRect(0,0,w,h);ctx.drawImage(land,0,0,w,h);
cats.forEach((a,i)=>{const span=Math.max(1,w-70),before=a.x;
if(!reduced.matches){if(a.wait>0){a.wait-=dt;if(a.wait<=0){a.visits++;a.from=a.x;const target=.12+((a.visits*.381966+i*.29)%1)*.76;a.to=Math.abs(target-a.x)<.12?Math.max(.1,Math.min(.9,a.x+(a.x>.5?-.2:.2))):target;a.duration=Math.max(3,Math.abs(a.to-a.x)*span/22);a.elapsed=0;a.face=a.to>a.x?1:-1;}}else{a.elapsed=Math.min(a.duration,a.elapsed+dt);const p=a.elapsed/a.duration;a.x=a.from+(a.to-a.from)*p*p*(3-2*p);if(p===1)a.wait=3+(a.visits+i)%4*1.6;}}
const speed=dt?Math.abs(a.x-before)*span/dt:0,cat=a.cat;cat.walk=(cat.walk||0)+speed*dt/.72*.34;cat.walkAmt=(cat.walkAmt||0)+(Math.min(1,speed/18)-(cat.walkAmt||0))*(1-Math.exp(-dt*10));cat.gardenRest=a.wait>0&&a.visits%3===1?'grooming':'loafing';const y=lanes[(i+1)%lanes.length];drawCat(ctx,cat,35+a.x*span,y+9,.72,clock*1000,speed>.1,a.face);});
}frame=requestAnimationFrame(paint);
}};
})(globalThis);
