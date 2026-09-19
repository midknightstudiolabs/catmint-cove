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
  function bubble(x,y){const r=active?E.recipes.find(r=>r.id===s.pending.id):null;const greetings=['Something warm, please.','One cup. Two paws.','Is the sunny seat taken?','I came for the company.','Make mine extra cozy.','My whiskers smelled coffee.'];round(x-132,y-25,264,35,12,'#faf3df');label(r?r.name+', please.':greetings[s.sequence%greetings.length],x,y-3,16);}
  const extra=Math.max(0,c.canvas.height-380),offset=extra*.45;c.save();
  rect(0,0,720,c.canvas.height,night?'#405a65':'#dce8db');rect(0,offset+220,720,c.canvas.height,inside?'#dbc5a1':night?'#777663':'#dacbad');c.translate(0,offset);
  rect(0,0,720,380,night?'#405a65':'#dce8db');rect(0,100,720,160,night?'#64878c':'#a8cdcc');rect(0,220,720,160,night?'#777663':'#dacbad');
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
    round(235,22,250,58,12,palette.dark);label('CATMINT CAFÉ',360,60,25,'#fff0d5');
    for(let x=left+20;x<right-10;x+=22){if(x<228||x>485)rect(x,roof+13,9,5,palette.light);}
   }else{
    round(left+24,roof-43,right-left-48,39,5,palette.dark);
    label('CATMINT CAFÉ',360,roof-16,tier?26:23,'#fff0d5');
   }
   const wx=tier===0?left+25:205,ww=tier===0?310:310,wy=tier===0?124:116;
   rect(wx-7,wy-7,ww+14,113,'#b68b5d');rect(wx,wy,ww,99,night?'#5d6047':'#45624e');
   rect(wx+9,wy+22,ww-18,5,'#bfa278');
   for(let i=0;i<4;i++){rect(wx+15+i*15,wy+6,9,15,palette.light);rect(wx+16+i*15,wy+11,7,3,palette.shade);}
   rect(wx+16,wy+53,57,39,'#99ad94');rect(wx+24,wy+62,41,18,'#334b3e');rect(wx+37,wy+82,13,10,'#f6ead1');
   a.cat(c,actors[0],360,wy+103,1.35,reduced?0:t,false);
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
   // A public resting bench is distinct from the purchasable café table.
   rect(28,318,86,8,'#ba9971');rect(33,300,76,7,'#ba9971');rect(33,309,76,5,'#ba9971');rect(38,325,5,20,'#786046');rect(99,325,5,20,'#786046');
   if(!stocked&&!active&&actors.length>1){a.cat(c,actors[1],73,320,.85,reduced?0:t,false);}
   if(stocked||active){queued(382,336,.58,lead);queued(285,343,.6,lead+1);queued(188,350,.62,lead+2);}
   if(depart>=0&&depart<1)customer(382+depart*390,336+depart*18,.58,s.sequence-1,true);
   if(s.seats){rect(659,299,8,42,'#927550');oval(663,294,32,12,'#c5aa7d');round(651,276,12,16,3,'#f6edd7');oval(657,276,6,2,'#7b5a42');if(actors.length>2)a.cat(c,actors[2],615,350,.9,reduced?0:t,false);}
  }
  if(active&&!reduced){c.strokeStyle='#f8f0d7';c.lineWidth=2;for(let i=0;i<3;i++){const x=inside?89:198,y=(inside?230:145)-(t/80+i*8)%24;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+7,y-7,x,y-14);c.stroke();}}
  c.restore();
 };
})(globalThis);
