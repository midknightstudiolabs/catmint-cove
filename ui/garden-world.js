(function(root){
 'use strict';let stop=()=>{};
 root.CoveGardenScene={stop(){stop();},mount(host,actors,drawCat){
  stop();const canvas=document.createElement('canvas');canvas.className='garden-coast';canvas.setAttribute('aria-hidden','true');host.prepend(canvas);
  const ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),cats=actors.slice(0,3);let frame=0,last=0,clock=0,ended=false,w=0,h=0,lanes=[130];
  const resize=()=>{w=host.clientWidth;h=host.clientHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);const box=host.getBoundingClientRect();lanes=[130];for(const tile of host.querySelectorAll('.field-plot')){const r=tile.getBoundingClientRect(),y=r.bottom-box.top+28;if(!lanes.some(v=>Math.abs(v-y)<8))lanes.push(y);} };
  const observer=new ResizeObserver(resize);observer.observe(host);resize();let visible=true;const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});visibility.observe(host);
  stop=()=>{ended=true;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();};
  function paint(t){if(ended)return;if(!host.isConnected||host.closest('[hidden]')){stop();return;}frame=requestAnimationFrame(paint);if(document.hidden||!visible){last=t;return;}if(t-last<50)return;const dt=Math.min(.08,(t-last)/1000);last=t;if(!reduced.matches)clock+=dt;
   ctx.clearRect(0,0,w,h);ctx.fillStyle='#c5d5a4';ctx.fillRect(0,0,w,h);const sky=ctx.createLinearGradient(0,0,0,105);sky.addColorStop(0,'#9fc6ce');sky.addColorStop(1,'#e7e6c9');ctx.fillStyle=sky;ctx.fillRect(0,0,w,80);
   ctx.fillStyle='#fff0bb';ctx.beginPath();ctx.arc(w*.82,25,15,0,Math.PI*2);ctx.fill();ctx.fillStyle='#789c8b';ctx.beginPath();ctx.moveTo(0,61);ctx.quadraticCurveTo(w*.16,30,w*.3,61);ctx.lineTo(0,65);ctx.fill();ctx.fillStyle='#82b6b9';ctx.fillRect(0,64,w,39);ctx.strokeStyle='#d7e9de';ctx.lineWidth=1.5;for(let i=0;i<6;i++){const x=((i*103+clock*4)%(w+65))-65;ctx.beginPath();ctx.moveTo(x,72+i%3*9);ctx.lineTo(x+36,72+i%3*9);ctx.stroke();}
   ctx.fillStyle='#e0d0a9';ctx.fillRect(w/2-18,103,36,h-103);for(const y of lanes)ctx.fillRect(0,y-17,w,28);
   ctx.strokeStyle='#ad9167';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,109);ctx.lineTo(w,109);ctx.stroke();for(let x=12;x<w;x+=48){ctx.fillStyle='#bea47b';ctx.fillRect(x,98,4,22);}
   for(let i=0;i<12;i++){const x=i%2?8:w-9,y=160+i*49;if(y>h-10)break;ctx.strokeStyle='#94af77';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y-8);ctx.moveTo(x,y);ctx.lineTo(x+4,y-10);ctx.stroke();}
   cats.forEach((cat,i)=>{const y=lanes[Math.min(i+1,lanes.length-1)],span=Math.max(100,w-70),period=24+i*5,u=(clock+i*8)%period,walk=u<period*.76,phase=Math.min(1,u/(period*.76)),forward=Math.floor((clock+i*8)/period)%2===0,x=35+span*(forward?phase:1-phase);drawCat(ctx,cat,x,y+9,.66,clock*1000,walk&&!reduced.matches,forward?1:-1);});
  }frame=requestAnimationFrame(paint);
 }};
})(globalThis);
