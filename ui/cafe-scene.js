(function(root){
 'use strict';
 const queues=new WeakMap();
 root.CoveCafeScene=function(c,{inside,s,stock,E,a,actors,t,previewTier=null,previewFinish=null}){
  const tier=previewTier??s.shopTier??0;
  const palette=E.finishes[previewFinish||s.finish]||E.finishes.sage;
  const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},oval=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  const round=(x,y,w,h,r,col)=>{c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
  const label=(str,x,y,size=16,col='#405842')=>{c.fillStyle=col;c.font=`${size}px Georgia`;c.textAlign='center';c.fillText(str,x,y);};
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
   a.cat(c,cat,x,y,scale*2,reduced?0:t,reduced?0:walking);
  }
  function machine(x,y){
   const color=['#93a392','#758f80','#536e60'][s.speed||0];round(x,y,132,103,10,color);rect(x+10,y+12,112,22,'#344d42');
   for(let i=0;i<=s.speed;i++)oval(x+22+i*25,y+23,5,5,'#e1ca89');rect(x+18,y+45,96,43,'#3f5046');rect(x+14,y+87,104,7,'#b9bdac');
   for(let i=0;i<(s.speed?2:1);i++){rect(x+36+i*42,y+43,5,17,'#d1d0b8');round(x+26+i*42,y+66,24,20,3,'#fbf1d9');}
   label(['Little brewer','Twin brewer','Cove brewer'][s.speed||0],x+66,y+121,13);
  }
  function kettle(x,y){oval(x,y,28,22,s.cookware?'#b48657':'#9aab9c');rect(x-9,y-28,18,7,'#596e59');c.strokeStyle='#596e59';c.lineWidth=6;c.beginPath();c.arc(x+26,y-2,15,-1.4,1.4);c.stroke();c.fillStyle=s.cookware?'#b48657':'#9aab9c';c.beginPath();c.moveTo(x-24,y-5);c.lineTo(x-44,y-20);c.lineTo(x-31,y+9);c.fill();}
  function bubble(x,y){const r=active?E.recipes.find(r=>r.id===s.pending.id):null;round(x-132,y-25,264,35,12,'#faf3df');label(r?r.name+', please.':'Something warm, please.',x,y-3,16);}
  rect(0,0,720,380,night?'#405a65':'#dce8db');rect(0,100,720,160,night?'#64878c':'#a8cdcc');rect(0,220,720,160,'#dacbad');
  for(let i=0;i<6;i++)rect(i*133,145+(i%2)*19,70,2,'#c1d7cf');if(night)oval(647,49,16,16,'#f3e5be');
  if(inside){
   // Behind the counter: only the serving opening, the customer and the working bench.
   rect(0,0,720,35,palette.dark);rect(0,35,50,245,palette.body);rect(670,35,50,245,palette.body);
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
  }else{
   const left=tier?79:107,right=tier?623:593;
   oval(351,326,tier?308:276,17,'#a99b7f');
   // Timber base and a shaded side panel give the kiosk depth without changing the game's flat style.
   rect(left-10,307,right-left+35,14,'#b8956a');rect(left+4,320,13,12,'#70583d');rect(right-15,320,13,12,'#70583d');
   rect(left,81,right-left,230,palette.body);
   c.fillStyle=palette.shade;c.beginPath();c.moveTo(right,81);c.lineTo(right+31,99);c.lineTo(right+31,306);c.lineTo(right,311);c.closePath();c.fill();
   for(let x=left+9;x<right;x+=14)rect(x,227,2,77,palette.shade+'60');
   rect(left,83,right-left,6,palette.light);rect(left+5,91,right-left-10,5,palette.shade);
   // Deep serving opening, wooden frame, menu panel and branded cups.
   rect(142,111,416,108,'#263f35');rect(154,120,391,89,'#4d6250');rect(155,137,388,6,'#ab8a60');
   for(let i=0;i<5;i++){rect(168+i*17,119,10,17,palette.light);rect(169+i*17,126,8,3,palette.shade);}
   rect(164,163,80,46,['#b6c0ac','#8eaa92','#5e7c65'][s.speed||0]);rect(175,173,57,21,'#354b3e');rect(194,195,17,13,'#f6ead1');
   a.cat(c,actors[0],350,219,1.65,t,false);
   round(458,149,74,52,4,palette.dark);label('MENU',495,163,12,'#f6e9cf');for(let i=0;i<3;i++)rect(470,171+i*8,48-i*6,2,'#becbad');
   rect(133,104,9,117,'#ac8051');rect(558,104,9,117,'#ac8051');rect(133,104,434,8,'#c6a171');rect(131,217,438,12,'#c6a171');rect(136,229,428,7,'#7d603e');
   // Lift-up canopy and a strong, own-brand roof wordmark.
   c.fillStyle=palette.light;c.beginPath();c.moveTo(132,88);c.lineTo(568,88);c.lineTo(593,106);c.lineTo(108,106);c.closePath();c.fill();rect(108,105,485,7,palette.shade);
   c.strokeStyle='#9b825e';c.lineWidth=3;for(const x of [143,558]){c.beginPath();c.moveTo(x,111);c.lineTo(x+(x<300?-18:18),143);c.stroke();}
   round(180,35,348,44,6,palette.dark);label('CATMINT CAFÉ',354,65,29,'#fff3d9');
   label('COFFEE · CATMINT · COMPANY',351,260,15,palette.dark);
   label(tier===0?'A LITTLE CUP OF COVE':tier===1?'GROWN HERE. BREWED WITH LOVE.':'YOUR LITTLE HOME BY THE SEA',351,285,11,palette.dark);
   // A small cat crest ties the blade sign and cups to the café identity.
   rect(left-24,101,26,4,'#795e41');round(left-56,97,37,46,8,palette.dark);oval(left-37,122,10,8,'#f9ecd0');
   c.fillStyle='#f9ecd0';c.beginPath();c.moveTo(left-46,119);c.lineTo(left-46,110);c.lineTo(left-39,115);c.lineTo(left-30,110);c.lineTo(left-28,121);c.fill();
   for(const x of [left+15,right-15]){rect(x-2,132,4,13,'#6d6248');round(x-7,144,14,22,4,night?'#f1d49a':palette.light);}
   if(tier>0){for(const x of [left+12,right-46]){rect(x,268,34,28,'#b48a62');for(let i=0;i<3;i++){oval(x+6+i*11,258,10,18,'#718961');oval(x+6+i*11,245,4,4,'#d6bd82');}}}
   if(tier===2){rect(left-7,75,right-left+15,7,palette.dark);rect(left-2,82,7,225,'#f0e3c4');rect(right-5,82,7,225,'#f0e3c4');for(let i=0;i<8;i++)oval(160+i*54,93,3,3,night?'#f6d792':'#e8d7b0');}
   if(stocked||active){queued(382,336,.58,lead);queued(285,343,.6,lead+1);queued(188,350,.62,lead+2);}
   if(depart>=0&&depart<1)customer(382+depart*390,336+depart*18,.58,s.sequence-1,true);
   if(s.seats){rect(659,299,8,42,'#927550');oval(663,294,32,12,'#c5aa7d');}
  }
  if(active&&!reduced){c.strokeStyle='#f8f0d7';c.lineWidth=2;for(let i=0;i<3;i++){const x=inside?89:198,y=(inside?230:145)-(t/80+i*8)%24;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+7,y-7,x,y-14);c.stroke();}}
 };
})(globalThis);
