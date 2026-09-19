(function(root){
 'use strict';
 root.CoveCafeScene=function(c,{inside,s,stock,E,a,actors,t,previewTier=null}){
  const tier=previewTier??s.shopTier??0;
  const rect=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h);},oval=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
  const round=(x,y,w,h,r,col)=>{c.fillStyle=col;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
  const label=(str,x,y,size=16,col='#405842')=>{c.fillStyle=col;c.font=`${size}px Georgia`;c.textAlign='center';c.fillText(str,x,y);};
  const now=Date.now(),night=new Date().getHours()<6||new Date().getHours()>=18,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stocked=s.unlocked&&s.open&&E.available(s,stock).length,active=!!s.pending,depart=s.lastCompleted?(now-s.lastCompleted.at)/12000:99;
  const lead=active?s.sequence-1:s.sequence;
  function customer(x,y,scale,id,walking=false){
   const pool=actors.length>1?actors.slice(1):actors;
   const cat=pool[((id%pool.length)+pool.length)%pool.length];
   a.cat(c,cat,x,y,scale*2,t,walking&&!reduced);
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
   rect(0,0,720,35,'#6c8068');rect(0,35,50,245,'#a8b894');rect(670,35,50,245,'#a8b894');
   if(tier>0){rect(0,35,35,220,'#7c967a');rect(685,35,35,220,'#7c967a');for(const x of [17,703]){rect(x-8,150,16,20,'#af8a5f');oval(x,136,14,24,'#758e66');}}
   if(tier===2){rect(0,0,720,35,'#435f50');for(const x of [76,643]){rect(x-2,36,4,19,'#8d704a');round(x-10,55,20,30,5,'#e2c98e');}}
   if(stocked||active){customer(465,232,.8,lead+1);customer(545,241,.85,lead+2);customer(350,266,1.65,lead);bubble(350,87);}
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
   oval(350,310,tier?316:252,17,'#b5a78d');
   if(tier>0){rect(61,114,580,197,'#809979');rect(49,306,604,15,'#b18d64');rect(57,321,588,7,'#91724e');for(const x of [67,593]){rect(x,147,40,79,'#c8ddd0');rect(x+18,147,4,79,'#f1e7ce');rect(x,185,40,4,'#f1e7ce');rect(x-3,230,46,15,'#b38b61');for(let i=0;i<3;i++)oval(x+7+i*13,224,9,12,'#6f8a5c');}}
   if(tier===2){rect(51,79,600,54,'#cbb591');c.fillStyle='#8b6954';c.beginPath();c.moveTo(31,106);c.lineTo(123,37);c.lineTo(589,37);c.lineTo(676,106);c.closePath();c.fill();for(let y=54;y<105;y+=17)rect(102-(y-54),y,505+(y-54)*2,2,'#a48064');}
   rect(110,69,480,239,tier===2?'#82997e':'#a6b491');for(let y=210;y<302;y+=18)rect(116,y,466,2,'#8a9e7e');rect(137,104,426,103,'#eadfc5');
   rect(158,150,85,54,['#93a392','#758f80','#536e60'][s.speed||0]);rect(170,164,61,21,'#405648');a.cat(c,actors[0],349,210,1.3,t,false);
   rect(128,207,445,12,'#a68058');rect(130,219,441,7,'#795f42');rect(100,70,500,12,'#59765b');
   for(let i=0;i<12;i++)rect(106+i*41,82,41,19,i%2?'#f7ecd3':'#839c7c');round(241,25,228,39,5,'#f9eed6');label('Catmint Café',355,52,24);
   rect(120,302,12,20,'#7b6145');rect(567,302,12,20,'#7b6145');
   if(tier>0){for(const x of [98,604]){rect(x,101,8,208,'#e4d4ad');}rect(85,97,535,10,'#dfcda6');}
   if(tier===2){for(const x of [81,628]){rect(x,111,3,22,'#735d40');round(x-9,132,22,32,4,'#e4cb91');}round(292,237,125,25,4,'#ece0bf');label('Seaside Café',355,255,15);}
   if(stocked||active){customer(372,342,.9,lead);customer(270,350,.95,lead+1);customer(165,357,1,lead+2);}
   if(depart>=0&&depart<1)customer(438+depart*280,354,.95,s.sequence-1,true);
   if(s.seats){rect(646,298,8,46,'#927550');oval(650,294,39,13,'#c5aa7d');}
   label('ORDER',470,166,15);label('HERE',470,185,15);
  }
  if(active&&!reduced){c.strokeStyle='#f8f0d7';c.lineWidth=2;for(let i=0;i<3;i++){const x=inside?89:198,y=(inside?230:145)-(t/80+i*8)%24;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+7,y-7,x,y-14);c.stroke();}}
 };
})(globalThis);
