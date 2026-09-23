(function(root){
 'use strict';let stop=()=>{};
 root.CoveGardenScene={stop(){stop();},mount(host,actors,drawCat){
  stop();const canvas=document.createElement('canvas');canvas.className='garden-coast';canvas.setAttribute('aria-label','The sea beyond your garden, with cats wandering along the sandy path');canvas.setAttribute('role','img');host.prepend(canvas);
  const ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),cats=actors.slice(0,3);let frame=0,last=0,clock=0,ended=false;
  const resize=()=>{const width=Math.max(280,host.clientWidth),dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(170*dpr);canvas.style.height='170px';ctx.setTransform(dpr,0,0,dpr,0,0);};
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  let visible=true;const visibility=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});visibility.observe(canvas);
  stop=()=>{ended=true;cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();};
  function paint(t){if(ended)return;if(!host.isConnected||host.closest('[hidden]')){stop();return;}frame=requestAnimationFrame(paint);if(document.hidden||!visible){last=t;return;}if(t-last<50)return;const dt=Math.min(.08,(t-last)/1000);last=t;if(!reduced.matches)clock+=dt;
   const w=host.clientWidth;ctx.clearRect(0,0,w,170);const sky=ctx.createLinearGradient(0,0,0,110);sky.addColorStop(0,'#a4cbd0');sky.addColorStop(1,'#e7e8c9');ctx.fillStyle=sky;ctx.fillRect(0,0,w,100);
   ctx.fillStyle='#fff0bb';ctx.beginPath();ctx.arc(w*.82,27,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#719c90';ctx.beginPath();ctx.moveTo(0,73);ctx.quadraticCurveTo(w*.14,42,w*.28,73);ctx.lineTo(0,79);ctx.fill();
   ctx.fillStyle='#83b9bd';ctx.fillRect(0,78,w,34);ctx.strokeStyle='#d7e9de';ctx.lineWidth=1.5;for(let i=0;i<6;i++){const x=((i*103+clock*5)%(w+65))-65;ctx.beginPath();ctx.moveTo(x,86+i%3*8);ctx.lineTo(x+36,86+i%3*8);ctx.stroke();}
   ctx.fillStyle='#c8d8a7';ctx.fillRect(0,112,w,58);ctx.fillStyle='#e4d3ac';ctx.fillRect(0,131,w,30);
   ctx.strokeStyle='#a78c65';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,123);ctx.lineTo(w,123);ctx.stroke();for(let x=12;x<w;x+=52){ctx.fillStyle='#b99e74';ctx.fillRect(x,111,4,21);}
   cats.forEach((cat,i)=>{const span=Math.max(100,w-80),period=22+i*5,u=(clock+i*9)%period,walk=u<period*.72,phase=Math.min(1,u/(period*.72)),forward=Math.floor((clock+i*9)/period)%2===0,x=40+span*(forward?phase:1-phase);drawCat(ctx,cat,x,158,.66,clock*1000,walk&&!reduced.matches,forward?1:-1);});
  }frame=requestAnimationFrame(paint);
 }};
})(globalThis);
