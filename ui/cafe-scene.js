(function(root){
 'use strict';
 const queues=new WeakMap();
 root.CoveCafeScene=function(c,{inside,s,stock,E,a,actors,t,height=380,offset:forcedOffset,previewTier=null,previewFinish=null}){
  const tier=previewTier??s.shopTier??0;
  const palette=E.finishes[previewFinish||s.finish]||E.finishes.sage;
  const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},oval=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  const round=(x,y,w,h,r,col)=>{c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
  const label=(str,x,y,size=16,col='#405842')=>{c.fillStyle=col;c.font=`${size}px Georgia`;c.textAlign='center';c.fillText(str,x,y);};
  const fitLabel=(str,x,y,maxW,size,col)=>{let z=size;c.font=`${z}px Georgia`;while(z>11&&c.measureText(str).width>maxW){z--;c.font=`${z}px Georgia`;}c.fillStyle=col;c.textAlign='center';c.fillText(str,x,y);};
  const cafeTitle=E.cafeName?E.cafeName(s).toUpperCase():'CATMINT CAFÉ';
  const has=id=>!!(s.decor&&s.decor[id]);
  const heart=(x,y,z,col)=>{c.fillStyle=col;c.beginPath();c.moveTo(x,y+z*.9);c.bezierCurveTo(x-z*1.6,y-z*.2,x-z*.7,y-z*1.3,x,y-z*.4);c.bezierCurveTo(x+z*.7,y-z*1.3,x+z*1.6,y-z*.2,x,y+z*.9);c.fill();};
  const sparkle=(x,y,z,col)=>{c.fillStyle=col;c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?z*.38:z;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();c.fill();};
  // The guest's first sip: hearts for a favourite, sparkles for a good cup, a quiet "…" for fine, a green squint for too bitter.
  const emote=(x,y,mood,u)=>{c.save();c.globalAlpha=Math.max(0,u<.1?u/.1:1-Math.max(0,(u-.55)/.45));const rise=u*34;
   if(mood==='love'){for(let i=0;i<3;i++)heart(x+(i-1)*13+Math.sin(u*7+i)*3,y-rise-i*8,i===1?8:6,'#e8798f');}
   else if(mood==='happy'){for(let i=0;i<3;i++)sparkle(x+(i-1)*12,y-rise-Math.abs(i-1)*7,5,'#f2c65c');}
   else if(mood==='meh'){round(x-14,y-rise-14,28,18,9,'#faf3df');label('…',x,y-rise-1,15,'#7a7563');}
   else{const fy=y-rise-10;oval(x,fy,11,11,'#bcd68b');c.strokeStyle='#4f6b35';c.lineWidth=1.6;c.beginPath();c.moveTo(x-6,fy-3);c.lineTo(x-2,fy-1);c.moveTo(x+6,fy-3);c.lineTo(x+2,fy-1);c.stroke();c.beginPath();c.moveTo(x-4,fy+5);c.quadraticCurveTo(x-2,fy+2,x,fy+5);c.quadraticCurveTo(x+2,fy+8,x+4,fy+5);c.stroke();oval(x+14,fy-4+u*8,2.2,3,'#9fd0e6');}
   c.restore();};
  const now=Date.now(),night=new Date().getHours()<6||new Date().getHours()>=18,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stocked=s.unlocked&&s.open&&E.available(s,stock).length,active=!!s.pending,depart=s.lastCompleted?(now-s.lastCompleted.at)/12000:99;
  const lead=active?s.sequence-1:s.sequence;
  let queue=queues.get(s);if(!queue){queue=new Map();queues.set(s,queue);}
  function queued(x,y,scale,id){
   let p=queue.get(id);if(!p){p={x:-55-(id-lead)*97,y,last:t,walk:0};queue.set(id,p);}
   const dt=Math.min(.05,Math.max(0,(t-p.last)/1000));p.last=t;
   const distance=Math.hypot(x-p.x,y-p.y),step=Math.min(distance,dt*55);
   if(reduced){p.x=x;p.y=y;p.walk=0;}else{if(distance>0){p.x+=(x-p.x)/distance*step;p.y+=(y-p.y)/distance*step;}p.walk+=(Number(distance>1)-p.walk)*Math.min(1,dt*9);}
   customer(p.x,p.y,scale,id,p.walk);
   for(const key of queue.keys())if(key<lead-2||key>lead+3)queue.delete(key);
  }
  function customer(x,y,scale,id,walking=false){
   const pool=actors.length>1?actors.slice(1):actors;
   const cat=pool[((id%pool.length)+pool.length)%pool.length];
   a.cat(c,cat,x,y,scale*1.5,reduced?0:t,reduced?0:walking);
  }
  function machine(x,y){
   const color=['#93a392','#758f80','#536e60'][s.speed||0];round(x,y,132,103,10,color);rect(x+10,y+12,112,22,'#344d42');
   for(let i=0;i<=s.speed;i++)oval(x+22+i*25,y+23,5,5,'#e1ca89');rect(x+18,y+45,96,43,'#3f5046');rect(x+14,y+87,104,7,'#b9bdac');
   for(let i=0;i<(s.speed?2:1);i++){rect(x+36+i*42,y+43,5,17,'#d1d0b8');round(x+26+i*42,y+66,24,20,3,'#fbf1d9');}
   label(['Little brewer','Twin brewer','Cove brewer'][s.speed||0],x+66,y+121,13);
  }
  function kettle(x,y){oval(x,y,28,22,s.cookware?'#b48657':'#9aab9c');rect(x-9,y-28,18,7,'#596e59');c.strokeStyle='#596e59';c.lineWidth=6;c.beginPath();c.arc(x+26,y-2,15,-1.4,1.4);c.stroke();c.fillStyle=s.cookware?'#b48657':'#9aab9c';c.beginPath();c.moveTo(x-24,y-5);c.lineTo(x-44,y-20);c.lineTo(x-31,y+9);c.fill();}
  function bubble(x,y){const r=active?E.recipes.find(r=>r.id===s.pending.id):null;const greetings=['Something warm, please.','One cup. Two paws.','Is the sunny seat taken?','I came for the company.','Make mine extra cozy.','My whiskers smelled coffee.'];round(x-132,y-25,264,35,12,'#faf3df');label(r?E.displayName(s,r)+', please.':greetings[s.sequence%greetings.length],x,y-3,16);}
  const extra=Math.max(0,height-380),offset=Number.isFinite(forcedOffset)?forcedOffset:extra*.45;c.save();
  rect(0,0,720,height,night?'#405a65':'#dce8db');rect(0,offset+220,720,height,inside?'#dbc5a1':night?'#777663':'#dacbad');c.translate(0,offset);
  rect(0,0,720,380,night?'#405a65':'#dce8db');rect(0,100,720,160,night?'#64878c':'#a8cdcc');rect(0,220,720,160,night?'#777663':'#dacbad');
  for(let i=0;i<6;i++)rect(i*133,145+(i%2)*19,70,2,'#c1d7cf');if(night)oval(647,49,16,16,'#f3e5be');
  if(inside){
   // Behind the counter: only the serving opening, the customer and the working bench.
   rect(0,-offset,720,offset,palette.body);rect(0,0,720,35,palette.dark);rect(0,35,50,245,palette.body);rect(670,35,50,245,palette.body);
   if(tier>0){rect(0,35,35,220,palette.shade);rect(685,35,35,220,palette.shade);for(const x of [17,703]){rect(x-8,150,16,20,'#af8a5f');oval(x,136,14,24,'#758e66');}}
   if(tier===2){rect(0,0,720,35,palette.dark);for(const x of [76,643]){rect(x-2,36,4,19,'#8d704a');round(x-10,55,20,30,5,'#e2c98e');}}
   if(stocked||active){customer(465,232,.52,lead+1);customer(545,241,.55,lead+2);customer(350,266,1.05,lead);bubble(350,117);}
   else label(s.unlocked?'A quiet moment by the sea.':'Your customers will order here.',360,156,21);
   rect(44,30,632,10,'#e3d4b5');rect(45,38,9,230,'#846748');rect(666,38,9,230,'#846748');
   rect(0,255,720,22,'#a68058');rect(0,277,720,103,'#dbc5a1');for(let y=300;y<380;y+=30)rect(0,y,720,1,'#c8ae86');
   if(tier===2){rect(0,255,720,22,'#ece2ca');rect(0,277,720,103,'#bbac8d');for(let x=0;x<720;x+=45){rect(x,278,1,102,'#d3c8ad');}rect(0,326,720,1,'#d3c8ad');}
   machine(31,235);kettle(578,302);round(620,285,40,54,6,'#9aaa87');
   for(let i=0;i<3;i++){c.strokeStyle='#816b4e';c.lineWidth=5;c.beginPath();c.moveTo(630+i*10,299);c.lineTo(625+i*12,263);c.stroke();oval(625+i*12,259,4,8,'#816b4e');}
   if(s.cookware){round(435,286,80,40,7,'#b98d60');rect(427,286,95,7,'#806849');oval(475,280,10,5,'#806849');label('Copper cookware',488,354,13);}
   oval(344,311,46,11,'#b99c70');round(329,273,30,34,4,'#faf2df');oval(344,274,15,4,'#856547');label('Pickup',344,352,15);
   label('THE VIEW FROM YOUR COUNTER',360,24,13,'#f8eed9');
   if(night){const light=c.createRadialGradient(360,285,15,360,285,330);light.addColorStop(0,'#ffd88a20');light.addColorStop(1,'#ffd88a00');rect(0,35,720,345,light);}
  }else{
   // A quiet seaside garden surrounds the café; props remain flat illustrations.
   const breeze=reduced?0:Math.sin(t/2400)*2;
   for(const [x,y,r] of [[50,70,36],[660,85,42]]){oval(x,y,r,11,night?'#607782':'#f0f1df');oval(x+19,y-7,r*.6,12,night?'#607782':'#f0f1df');}
   rect(0,226,720,154+extra,night?'#596c54':'#8ea577');
   c.fillStyle=night?'#8b8870':'#d8c6a0';c.beginPath();c.moveTo(310,304);c.lineTo(410,304);c.lineTo(545,380+extra);c.lineTo(100,380+extra);c.closePath();c.fill();
   for(let i=0;i<6;i++){const y=345+i*50;oval(340-i*8,y,29+i*3,6,night?'#a19c82':'#eee0bd');}
   for(const side of [0,1])for(let i=0;i<9;i++){const x=side?605+(i%3)*32:20+(i%3)*32,y=247+Math.floor(i/3)*45;oval(x,y+8,17,8,night?'#536d50':'#8da577');rect(x+breeze,y-10,2,19,'#506d4c');for(let k=0;k<5;k++)oval(x+breeze+Math.cos(k*1.26)*4,y-11+Math.sin(k*1.26)*4,3,3,i%2?'#d7bb91':'#b3b6c6');oval(x+breeze,y-11,2,2,'#ead09a');}
   for(const x of [132,586]){rect(x-2,280,4,55,'#685e48');round(x-8,271,16,23,4,night?'#ffe0a0':'#e5d3a8');if(night){oval(x,337,29,8,'#f4d69322');const halo=c.createRadialGradient(x,282,0,x,282,40);halo.addColorStop(0,'#ffdc9340');halo.addColorStop(1,'#ffdc9300');oval(x,282,40,40,halo);}}
   // Orthographic elevation: every stage has its own silhouette, never an angled side wall.
   const left=[180,113,40][tier],right=720-left,roof=[99,76,47][tier];
   const glow=(x,y,r,alpha=.18)=>{if(!night)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(255,211,135,'+alpha+')');g.addColorStop(1,'rgba(255,211,135,0)');oval(x,y,r,r,g);};
   const lamp=(x,y)=>{rect(x-2,y-14,4,14,'#705c41');round(x-7,y,14,22,4,night?'#ffe2a6':'#d6cbae');glow(x,y+12,42);};
   const plant=(x,y)=>{rect(x-19,y,38,24,'#aa805a');for(let i=-1;i<=1;i++){oval(x+i*12,y-10,11,18,'#69835e');oval(x+i*12,y-23,4,4,'#d4b477');}};
   oval(360,322,(right-left)/2+16,10,night?'#5b6054':'#b7a78b');
   rect(left-8,309,right-left+16,12,'#a48660');
   round(left,roof,right-left,230+(99-roof)-18,5,palette.body);
   for(let x=left+10;x<right;x+=18)rect(x,232,1,76,palette.shade);
   rect(left,roof,right-left,9,palette.dark);
   if(tier===2){
    // Full café: broad façade with two lit display windows and a raised central sign.
    for(const x of [left+20,right-106]){
     round(x,119,86,132,24,palette.dark);round(x+7,128,72,112,18,night?'#9b835a':'#cbd5b7');
     rect(x+41,128,4,111,'#ddc79f');rect(x+7,181,72,4,'#ddc79f');
     glow(x+43,188,58,.13);plant(x+43,274);
    }
    rect(left+8,roof+12,8,242,palette.light);rect(right-16,roof+12,8,242,palette.light);
    round(235,22,250,58,12,palette.dark);fitLabel(cafeTitle,360,60,226,25,'#fff0d5');
    for(let x=left+20;x<right-10;x+=22){if(x<228||x>485)rect(x,roof+13,9,5,palette.light);}
   }else{
    round(left+24,roof-43,right-left-48,39,5,palette.dark);
    fitLabel(cafeTitle,360,roof-16,right-left-70,tier?26:23,'#fff0d5');
   }
   const wx=tier===0?left+25:205,ww=tier===0?310:310,wy=tier===0?124:116;
   rect(wx-7,wy-7,ww+14,113,'#b68b5d');rect(wx,wy,ww,99,night?'#5d6047':'#45624e');
   rect(wx+9,wy+22,ww-18,5,'#bfa278');
   for(let i=0;i<4;i++){rect(wx+15+i*15,wy+6,9,15,palette.light);rect(wx+16+i*15,wy+11,7,3,palette.shade);}
   rect(wx+16,wy+53,57,39,'#99ad94');rect(wx+24,wy+62,41,18,'#334b3e');rect(wx+37,wy+82,13,10,'#f6ead1');
   a.cat(c,actors[0],360,wy+103,1.05,reduced?0:t,false);
   round(wx+ww-70,wy+37,58,50,3,palette.dark);label('MENU',wx+ww-41,wy+50,10,'#f7e9c9');
   for(let i=0;i<3;i++)rect(wx+ww-61,wy+58+i*7,39-i*5,2,'#bfcbae');
   rect(wx-13,wy+100,ww+26,10,'#d0ac79');rect(wx-8,wy+110,ww+16,5,'#816444');
   if(tier>0){
    // Garden's scalloped cloth canopy becomes a long café awning at the final stage.
    const ax=tier===1?left-8:185,aw=tier===1?right-left+16:350;
    rect(ax,87,aw,23,palette.light);
    for(let x=ax;x<ax+aw;x+=28){rect(x,87,14,23,palette.shade);round(x,104,14,13,5,palette.shade);round(x+14,104,14,13,5,palette.light);}
    if(tier===1){plant(left+35,278);plant(right-35,278);for(const x of [left+30,right-30]){rect(x-12,142,24,15,'#ad8b61');oval(x,132,18,22,'#71875c');}}
   }else{rect(left-5,107,right-left+10,9,palette.light);}
   label(tier===0?'A LITTLE CUP OF COVE':tier===1?'GROWN HERE · BREWED WITH LOVE':'COFFEE · CATMINT · COMPANY',360,266,tier===0?12:13,palette.dark);
   if(tier===2){label('YOUR LITTLE HOME BY THE SEA',360,287,10,palette.dark);}
   const lamps=tier===0?[left+12,right-12]:tier===1?[left+17,right-17]:[left+119,right-119];
   lamps.forEach(x=>lamp(x,178));
   if(night){glow(360,wy+63,115,.12);oval(360,316,ww*.46,14,'#eed09118');}
   if(tier===2){for(const x of [248,360,472]){rect(x-1,111,2,10,'#756344');oval(x,124,4,5,night?'#ffe5a4':'#dbc791');glow(x,128,25,.12);}}
   // ---- outdoor décor (bought in Upgrades) ----
   if(has('lights')){const y0=roof+18;c.strokeStyle='rgba(60,46,32,.55)';c.lineWidth=1.4;c.beginPath();c.moveTo(left-6,y0);c.quadraticCurveTo(360,y0+34,right+6,y0);c.stroke();
    for(let i=0;i<=10;i++){const u=i/10,bx=left-6+(right-left+12)*u,by=y0+2*(1-u)*u*34;const twinkle=.75+.25*Math.sin(t/500+i);
     if(night){const gl=c.createRadialGradient(bx,by+5,0,bx,by+5,22);gl.addColorStop(0,'rgba(255,219,140,'+(.45*twinkle)+')');gl.addColorStop(1,'rgba(255,219,140,0)');oval(bx,by+5,22,22,gl);}
     oval(bx,by+5,3.2,4,night?'#ffe6a8':'#e8d7a4');}}
   if(has('flowerbox')){const bx=wx-8,bw=ww+16;round(bx,wy+112,bw,15,3,'#8a6a49');rect(bx,wy+112,bw,4,'#a58459');
    for(let i=0;i<bw/13;i++){const fx=bx+8+i*13,col=['#e7a2a7','#f2d27a','#c6b2e6','#f4efe1'][i%4];rect(fx,wy+104-(i%3)*2,2,10,'#5f7c4f');oval(fx-2,wy+103-(i%3)*2,4,3,'#6f8f5a');oval(fx+3,wy+102-(i%3)*2,4,3,'#6f8f5a');oval(fx+1,wy+100-(i%3)*2,3.2,3.2,col);}}
   if(has('chalkboard')){const cx=468,cy=336;c.fillStyle='rgba(36,31,23,.13)';oval(cx,cy+2,19,4,'rgba(36,31,23,.13)');
    c.strokeStyle='#7a5c3d';c.lineWidth=3;c.beginPath();c.moveTo(cx-13,cy);c.lineTo(cx-8,cy-40);c.moveTo(cx+13,cy);c.lineTo(cx+8,cy-40);c.stroke();
    round(cx-15,cy-44,30,34,3,'#8a6a49');round(cx-12,cy-41,24,28,2,'#2f4a3d');
    const sp=E.recipes.find(r=>s.menu&&s.menu.includes(r.id));label('TODAY',cx,cy-31,7,'#f4efe1');const nm=sp?E.displayName(s,sp).toUpperCase().slice(0,11):'COFFEE';fitLabel(nm,cx,cy-19,21,8,'#f6e7b4');c.strokeStyle='#f4efe1';c.lineWidth=.7;c.beginPath();c.moveTo(cx-8,cy-27);c.lineTo(cx+8,cy-27);c.stroke();}
   if(has('parasol')){const px=548,py=344;oval(px,py+2,26,6,'rgba(36,31,23,.13)');rect(px-1.5,py-52,3,52,'#8a6a49');
    for(let i=0;i<6;i++){c.fillStyle=i%2?'#f4efe1':'#d9887f';c.beginPath();c.moveTo(px,py-66);c.lineTo(px-34+i*11.3,py-46);c.lineTo(px-34+(i+1)*11.3,py-46);c.closePath();c.fill();}
    oval(px,py-66,2.5,2.5,'#8a6a49');round(px-15,py-12,30,4,2,'#a58459');rect(px-1.5,py-12,3,12,'#7a5c3d');round(px-9,py-19,18,7,3,'#f4efe1');oval(px-12,py-2,4,2,'#7a5c3d');if(actors.length>3&&!(s.seats))a.cat(c,actors[3],px+30,py+8,.75,reduced?0:t,false);}
   if(has('statue')){const sx=150,sy=326;oval(sx,sy+2,20,5,'rgba(36,31,23,.13)');round(sx-15,sy-10,30,12,3,'#9ea79f');round(sx-12,sy-14,24,6,2,'#b1b9b0');
    c.fillStyle='#8f9a94';c.beginPath();c.moveTo(sx-9,sy-13);c.quadraticCurveTo(sx-13,sy-30,sx-6,sy-38);c.lineTo(sx-8,sy-47);c.lineTo(sx-1,sy-43);c.lineTo(sx+4,sy-43);c.lineTo(sx+9,sy-47);c.lineTo(sx+8,sy-38);c.quadraticCurveTo(sx+13,sy-30,sx+9,sy-13);c.closePath();c.fill();
    c.strokeStyle='#8f9a94';c.lineWidth=4;c.beginPath();c.moveTo(sx+9,sy-14);c.quadraticCurveTo(sx+24,sy-14,sx+21,sy-28);c.stroke();
    c.fillStyle='rgba(255,255,255,.22)';c.beginPath();c.ellipse(sx-4,sy-30,2.5,9,0,0,7);c.fill();oval(sx-3,sy-33,1.1,1.1,'#5d675f');oval(sx+3,sy-33,1.1,1.1,'#5d675f');}
   if(has('fountain')){const fx=214,fy=318;oval(fx,fy+2,24,6,'rgba(36,31,23,.13)');round(fx-20,fy-10,40,12,5,'#a7b0a8');oval(fx,fy-10,18,5,'#9fc9cf');rect(fx-3,fy-30,6,20,'#a7b0a8');oval(fx,fy-31,10,3.5,'#b7c0b8');
    if(!reduced){c.strokeStyle='rgba(175,220,228,.85)';c.lineWidth=1.6;for(let i=0;i<4;i++){const ph=(t/700+i*.25)%1,dx=(i-1.5)*6;c.beginPath();c.moveTo(fx,fy-33);c.quadraticCurveTo(fx+dx*.7,fy-46+ph*8,fx+dx*1.6,fy-12);c.stroke();}
     oval(fx+Math.sin(t/300)*8,fy-10,2.4,1.1,'rgba(255,255,255,.7)');}else{c.strokeStyle='rgba(175,220,228,.85)';c.lineWidth=1.6;c.beginPath();c.moveTo(fx,fy-33);c.quadraticCurveTo(fx-8,fy-42,fx-13,fy-12);c.moveTo(fx,fy-33);c.quadraticCurveTo(fx+8,fy-42,fx+13,fy-12);c.stroke();}}
   // A public resting bench is distinct from the purchasable café table.
   rect(28,318,86,8,'#ba9971');rect(33,300,76,7,'#ba9971');rect(33,309,76,5,'#ba9971');rect(38,325,5,20,'#786046');rect(99,325,5,20,'#786046');
   if(!stocked&&!active&&actors.length>1){a.cat(c,actors[1],73,320,.85,reduced?0:t,false);}
   if(stocked||active){queued(382,336,.58,lead);queued(285,343,.6,lead+1);queued(188,350,.62,lead+2);}
   if(depart>=0&&depart<1)customer(382+depart*390,336+depart*18,.58,s.sequence-1,true);
   if(s.seats){rect(659,299,8,42,'#927550');oval(663,294,32,12,'#c5aa7d');round(651,276,12,16,3,'#f6edd7');oval(657,276,6,2,'#7b5a42');if(actors.length>2)a.cat(c,actors[2],615,350,.9,reduced?0:t,false);}
  }
  // a small enamel-and-cord sign, like the one in a real shop door: it sways a hair and says nothing loudly
  {const word=s.open?'OPEN':s.pending?'FINISHING':'CLOSED',sx=inside?586:498,sy=inside?190:214,sw=58,sh=20,ang=reduced?0:Math.sin(now/1100)*.035;
   c.save();c.translate(sx,sy);c.strokeStyle='rgba(74,58,40,.7)';c.lineWidth=1;c.beginPath();c.moveTo(-14,-9);c.lineTo(0,-16);c.lineTo(14,-9);c.stroke();oval(0,-16,1.6,1.6,'#6a5238');
   c.rotate(ang);c.fillStyle='rgba(36,31,23,.16)';c.beginPath();c.roundRect(-sw/2+1.5,-9+2.5,sw,sh,5);c.fill();
   c.fillStyle='#f7efd9';c.strokeStyle=s.open?'#6f9a78':'#b9a884';c.lineWidth=1.4;c.beginPath();c.roundRect(-sw/2,-9,sw,sh,5);c.fill();c.stroke();
   c.fillStyle=s.open?'#3d6b4b':'#8b7660';c.font=(word.length>6?'bold 8px':'bold 10px')+' Georgia';c.textAlign='center';c.fillText(word.split('').join(word.length>6?'':'\u200a'),0,5);
   c.restore();}
  if(active&&!reduced){c.strokeStyle='#f8f0d7';c.lineWidth=2;for(let i=0;i<3;i++){const x=inside?89:198,y=(inside?230:145)-(t/80+i*8)%24;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+7,y-7,x,y-14);c.stroke();}}
  if(depart>=0&&depart<.5&&s.lastCompleted&&s.lastCompleted.reaction)emote(inside?350:382+depart*390,inside?208:262+depart*18,s.lastCompleted.reaction.mood,depart/.5);
  if(depart>=0&&depart<1&&s.lastCompleted.response){const response=s.lastCompleted.response;round(125,354,470,24,10,'#fff1d8');label(response.text,360,371,12,'#496247');}
  c.restore();
 };
})(globalThis);
