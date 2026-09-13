/* Graphics-only overrides, embedded into the original game's closure at build time.
   No economy, input, state-machine, progression, save, or activity rules live here. */
const ART2D = { cove: new Image(), tug: new Image() };
ART2D.cove.src = 'art/cove-2d.png';
ART2D.tug.src = 'art/tug-2d.png';
// The active shared standard uses matte vector shading, with no fur image load.
const art2dReady = image => image.complete && image.naturalWidth > 0;
const art2dStill = matchMedia('(prefers-reduced-motion: reduce)').matches;
const art2dNativeBackground = drawBackground;
drawBackground = function(dt) {
  if (!art2dReady(ART2D.cove)) { art2dNativeBackground(dt); return; }
  const sky = timeOfDay(); window._sky = sky;
  ctx.save();
  ctx.drawImage(ART2D.cove, -_overX, 0, W + _overX * 2, H);
  // Preserve the original clock and night palette, including the moon and stars.
  const night = 1 - sky.df;
  if (night > .01) { ctx.fillStyle = `rgba(25,36,66,${night*.65})`; ctx.fillRect(-_overX,0,W+_overX*2,H); }
  drawCelestial(ctx, sky);
  for (const cl of clouds) { cl.x += cl.v * dt; if (cl.x - 90 > W) cl.x = -90; }
  // Slow 2D water glints, not a reflective or volumetric surface.
  if (!art2dStill && !_perfLite) {
    const t = performance.now()/1000;
    ctx.lineWidth = .8;
    for (let i=0;i<19;i++) {
      const x=((i*113+t*2)%(W+60))-30, y=H*(.31+(i%5)*.012);
      ctx.strokeStyle=`rgba(250,255,235,${(.16+.08*Math.sin(t+i))*sky.df})`;
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+13+(i%3)*8,y);ctx.stroke();
    }
  }
  ctx.restore();
};

// Keep every original cat pose, coat marking, accessory, age, care indicator,
// and motion state. Only the rendering proportions and lighting are adjusted.
const art2dNativePose = poseParams;
poseParams = function(pose, sleepStyle) {
  const p=art2dNativePose(pose,sleepStyle);
  p.bw*=1.10; p.hr*=1.16;
  return p;
};
silShadeGrad = function() { return 'rgba(0,0,0,0)'; };
catShadowGrad = function() { return 'rgba(52,63,37,.16)'; };

// A soft, irregular outline gives the original animated rig a painted silhouette.
catSil = function(g,p) {
  g.moveTo(-p.bw,-7);
  g.bezierCurveTo(-p.bw-2,p.top*.62,-p.bw*.65,p.top-4,2,p.top-4);
  g.bezierCurveTo(p.bw*.75,p.top-3,p.bw+3,p.top*.58,p.bw,-7);
  g.bezierCurveTo(p.bw,-1,p.bw*.6,2,0,2);
  g.bezierCurveTo(-p.bw*.65,2,-p.bw,-1,-p.bw,-7);g.closePath();
  const x=p.hx,y=p.hy,r=p.hr;
  g.moveTo(x,y-r);
  g.bezierCurveTo(x+r*.75,y-r*1.03,x+r*.95,y-r*.4,x+r*.98,y);
  g.lineTo(x+r*1.12,y+r*.25);g.lineTo(x+r*1.02,y+r*.29);
  g.lineTo(x+r*1.13,y+r*.46);g.lineTo(x+r*.99,y+r*.44);
  g.bezierCurveTo(x+r*.99,y+r*.92,x+r*.47,y+r*1.06,x,y+r);
  g.bezierCurveTo(x-r*.65,y+r*1.06,x-r*.98,y+r*.8,x-r,y+r*.45);
  g.lineTo(x-r*1.13,y+r*.48);g.lineTo(x-r*1.02,y+r*.28);
  g.lineTo(x-r*1.12,y+r*.22);
  g.bezierCurveTo(x-r*.96,y-r*.4,x-r*.76,y-r*1.03,x,y-r);g.closePath();
};

// Cached transparent brushwork: stable in cat coordinates, no per-frame noise.
const art2dFurCache=new Map();
function art2dFur(g,c,p) {
  // One shared brush plate, including growing kittens and continuously changing poses.
  const key='fur';
  let layer=art2dFurCache.get(key);
  if(!layer){
    layer=document.createElement('canvas');layer.width=288;layer.height=320;
    const b=layer.getContext('2d');b.scale(4,4);b.translate(36,72);
    const rand=mulberry32(74219);
    b.lineCap='round';
    for(let i=0;i<650;i++){
      const x=rand()*72-36,y=rand()*76-72;
      const head=y<-20,dx=head?(x-3)/20: x/28;
      const length=.5+rand()*1.8;
      b.strokeStyle=i%3===0?'rgba(49,37,30,.065)':'rgba(255,248,224,.12)';
      b.lineWidth=.25+rand()*.7;b.beginPath();b.moveTo(x,y);
      b.quadraticCurveTo(x+dx*.45,y+length*.5,x+dx*.85,y+length);b.stroke();
    }
    art2dFurCache.set(key,layer);
  }
  g.save();g.beginPath();catSil(g,p);g.clip();
  // Broad translucent gouache shapes leave the existing coat markings readable.
  g.fillStyle='rgba(255,244,213,.085)';g.beginPath();g.ellipse(p.hx-p.hr*.35,p.hy-p.hr*.24,p.hr*.55,p.hr*.67,-.3,0,7);g.fill();
  g.fillStyle='rgba(61,44,36,.055)';g.beginPath();g.ellipse(p.bw*.42,-9,p.bw*.6,13,-.3,0,7);g.fill();
  g.drawImage(layer,-36,-72,72,80);
  if(art2dReady(ART2D.fur)){
    const f=ART2D.fur,w=f.naturalWidth,h=f.naturalHeight;
    // Overlay transfers brush values without replacing coat color or markings.
    g.globalCompositeOperation='overlay';g.globalAlpha=.88;
    g.drawImage(f,w*.523,h*.267,w*.47,h*.497,-p.bw-2,p.top-1,p.bw*2+4,-p.top+3);
    g.drawImage(f,w*.022,h*.333,w*.471,h*.386,p.hx-p.hr*1.13,p.hy-p.hr,p.hr*2.26,p.hr*2.05);
  }
  g.restore();
}
const art2dNativeEye=drawEye;
drawEar=function(g,side,p,coat,back,flop=0,kit=false){
  const x=p.hx+side*p.hr*.68,y=p.hy-p.hr*.58;
  const height=back?7:(kit?17:15);
  g.save();g.translate(x,y);g.rotate(side*(flop+(back?.4:.08)));
  g.fillStyle=coat.pattern==='points'?coat.point:coat.base;
  g.beginPath();g.moveTo(-7,5);g.quadraticCurveTo(-8,-2,-5,-height);
  g.quadraticCurveTo(-4,-height-2,-2,-height);g.quadraticCurveTo(5,-9,8,5);g.closePath();g.fill();
  g.fillStyle=coat.inner||'#d7aba5';g.beginPath();g.moveTo(-4,1);g.lineTo(-3,-height+5);g.quadraticCurveTo(2,-6,4,1);g.fill();
  g.strokeStyle='rgba(255,240,220,.24)';g.lineWidth=.8;g.beginPath();g.moveTo(-6,0);g.lineTo(-4,-height+3);g.stroke();g.restore();
};
const art2dNativeLeg=drawLeg;
drawLeg=function(g,hx,hy,theta,stride,lift,w,col,paw,plant){
  art2dNativeLeg(g,hx,hy,theta,stride,lift,w*1.65,col,paw,plant);
};
drawEye=function(g,x,y,mode,iris,wide,kit){
  if(mode==='closed'||mode==='happy'||mode==='blink') {art2dNativeEye(g,x,y,mode,iris,wide,kit);return;}
  const r=kit?4.1:3.75,h=r*(mode==='half'?.59:wide?1.08:.91);
  g.save();g.beginPath();g.ellipse(x,y,r,h,0,0,7);g.fillStyle='#fff2d5';g.fill();g.clip();
  g.fillStyle=iris;g.beginPath();g.ellipse(x,y+.2,r*.82,h*.94,0,0,7);g.fill();
  g.fillStyle='#29221f';g.beginPath();g.ellipse(x+.15,y+.2,r*.47,h*.81,0,0,7);g.fill();
  g.fillStyle='#fffdf0';g.beginPath();g.arc(x-r*.3,y-h*.36,r*.25,0,7);g.fill();
  g.beginPath();g.arc(x+r*.3,y+h*.36,r*.10,0,7);g.fill();g.restore();
  g.strokeStyle='rgba(51,39,30,.85)';g.lineWidth=.85;g.beginPath();g.ellipse(x,y,r,h,0,0,7);g.stroke();
};

// Optional close-up sheet uses the same renderer and live cats; no save edits.
if(new URLSearchParams(location.search).has('art')){
  const launch=document.createElement('button');launch.textContent='View cats close up';
  launch.style.cssText='position:fixed;right:20px;top:82px;z-index:10000;padding:12px 20px;border:1px solid #bca378;border-radius:22px;background:#fff4db;color:#514330;font:700 14px sans-serif;cursor:pointer';
  document.body.append(launch);
  launch.onclick=()=>{
    const panel=document.createElement('dialog');panel.style.cssText='width:min(900px,94vw);padding:20px;border:1px solid #bca378;border-radius:24px;background:#fbf2df;color:#514330';
    panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0;font:700 22px Georgia">Meet the painted cats</h2><button style="padding:10px 16px;border:0;border-radius:20px;background:#dce5c3;cursor:pointer">Back to the Cove</button></div><p>The same cats and movements, shown closer.</p><canvas style="width:100%;display:block" width="900" height="520"></canvas>';
    document.body.append(panel);panel.showModal();
    const cv=panel.querySelector('canvas'),g=cv.getContext('2d');let frame;
    const close=()=>{cancelAnimationFrame(frame);panel.remove();};
    panel.querySelector('button').onclick=close;panel.addEventListener('close',close);
    function paint(){
      if(!panel.isConnected)return;g.clearRect(0,0,900,520);
      cats.slice(0,6).forEach((c,i)=>{
        const x=150+(i%3)*300,y=205+Math.floor(i/3)*255;
        g.fillStyle='#e8e8cc';g.beginPath();g.ellipse(x,y,92,13,0,0,7);g.fill();
        g.save();g.translate(x,y);g.scale(2.55,2.55);
        drawCat(g,{...c,coat:c.coat,growth:c.growth,isKitten:c.isKitten,accessory:c.accessory,x:0,y:0,ageScale:1,_chonkBase:1},true);g.restore();
        g.fillStyle='#514330';g.font='700 17px Georgia';g.textAlign='center';g.fillText(c.name||'Cove cat',x,y+33);
      });frame=requestAnimationFrame(paint);
    }paint();
  };
}

const art2dNativeDecor=drawDecor;
drawDecor=function(g,d){
  if(d.type!=='tree'&&d.type!=='cottage'){art2dNativeDecor(g,d);return;}
  const oval=(x,y,rx,ry,col)=>{g.fillStyle=col;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};
  g.save();g.translate(d.x,d.y);
  oval(3,7,d.type==='tree'?29:35,7,'rgba(61,74,40,.13)');
  if(d.type==='tree'){
    g.fillStyle='#987951';g.beginPath();g.moveTo(-6,5);g.quadraticCurveTo(-3,-18,-4,-47);g.lineTo(4,-47);g.quadraticCurveTo(3,-18,7,5);g.fill();
    g.strokeStyle='#806643';g.lineWidth=2;g.beginPath();g.moveTo(-1,1);g.lineTo(-1,-34);g.moveTo(0,-23);g.lineTo(-14,-42);g.moveTo(0,-29);g.lineTo(15,-44);g.stroke();
    const sway=art2dStill?0:Math.sin(performance.now()/1600+d.seed)*.7;
    g.translate(sway,0);
    for(const [x,y,rx,ry,col] of [[-17,-50,21,19,'#769550'],[16,-51,21,18,'#7e9f53'],[0,-66,25,22,'#9cb564'],[-3,-47,27,21,'#89a759']]) oval(x,y,rx,ry,col);
    const r=mulberry32(d.seed>>>0);
    for(let i=0;i<15;i++)oval((r()-.5)*48,-76+r()*37,3+r()*3,1.6+r()*2,i%2?'#a8bd70':'#78984e');
  }else{
    g.fillStyle='#f0e2bc';roundRect(g,-26,-30,52,38,4);g.fill();
    g.fillStyle='#dbcca8';g.fillRect(-26,1,52,7);
    g.strokeStyle='#d8c79e';g.lineWidth=.8;for(let y=-23;y<0;y+=8){g.beginPath();g.moveTo(-25,y);g.lineTo(25,y);g.stroke();}
    g.fillStyle='#a8784d';g.beginPath();g.moveTo(-33,-28);g.lineTo(0,-51);g.lineTo(33,-28);g.fill();
    g.save();g.clip();for(let row=0;row<4;row++)for(let col=0;col<8;col++){g.fillStyle=['#bf9160','#c59a67','#b58856'][(row+col)%3];roundRect(g,-37+col*10+(row%2)*5,-51+row*6,9,5,2);g.fill();}g.restore();
    g.strokeStyle='#e0bd82';g.lineWidth=1.5;g.beginPath();g.moveTo(-32,-28);g.lineTo(0,-50);g.lineTo(32,-28);g.stroke();
    // The door stays at the original coordinates so sleeping faces still line up.
    g.fillStyle='#66513a';g.beginPath();g.moveTo(-9,8);g.lineTo(-9,-10);g.quadraticCurveTo(0,-20,9,-10);g.lineTo(9,8);g.fill();
    oval(16,-14,5.5,5.5,'#baa372');oval(16,-14,4,4,'#ecd598');
    g.strokeStyle='#fbefce';g.lineWidth=.8;g.beginPath();g.moveTo(16,-18);g.lineTo(16,-10);g.moveTo(12,-14);g.lineTo(20,-14);g.stroke();
    g.fillStyle='#b08a58';roundRect(g,9,-7,15,4,1);g.fill();
    for(let i=0;i<4;i++){oval(11+i*3,-8,2,2.6,'#83a45b');oval(11+i*3,-11,1.5,1.5,i%2?'#fff0c0':'#dba78d');}
  }
  g.restore();
};

const art2dNativeMidkField=drawMidkField;
drawMidkField=function(g){
  if(!art2dReady(ART2D.tug)){art2dNativeMidkField(g);return;}
  g.save();
  g.fillStyle='#b6ce80';g.fillRect(-260,-260,MIDK_W+520,MIDK_H+520);
  const img=ART2D.tug,split=Math.round(img.height*.17);
  // Match the native field's shore and footprints instead of moving gameplay.
  g.drawImage(img,0,0,img.width,split,0,-20,MIDK_W,142);
  g.drawImage(img,0,split,img.width,img.height-split,0,122,MIDK_W,MIDK_H-122);
  // Native boundary markers, with their original positions and labels.
  g.strokeStyle='rgba(78,110,57,.62)';g.lineWidth=2;g.setLineDash([9,8]);
  g.beginPath();g.moveTo(MIDK_X-120,MIDK_START_Y);g.lineTo(MIDK_X+120,MIDK_START_Y);g.stroke();g.setLineDash([]);
  for(const side of ['visit','cove']){
    const y=MIDK_WIN_Y[side],win=_midkWinner===side,lead=side==='cove';
    g.fillStyle=win?'rgba(244,201,93,.28)':'rgba(244,201,93,.12)';g.fillRect(MIDK_X-120,lead?y:y-44,240,44);
    g.strokeStyle='rgba(214,140,64,.7)';g.lineWidth=3;g.beginPath();g.moveTo(MIDK_X-120,y);g.lineTo(MIDK_X+120,y);g.stroke();
    const px=MIDK_X+128,dy=lead?-1:1;
    g.strokeStyle='#987b4e';g.lineWidth=3;g.beginPath();g.moveTo(px,y);g.lineTo(px,y+dy*34);g.stroke();
    g.fillStyle=lead?'#779c55':'#7196be';g.beginPath();g.moveTo(px,y+dy*34);g.lineTo(px-22,y+dy*28);g.lineTo(px,y+dy*22);g.fill();
    g.fillStyle='#665c3d';g.font="800 9px 'Hanken Grotesk',sans-serif";g.textAlign='center';g.fillText((lead?coveName():midkVisitName).toUpperCase().slice(0,16),MIDK_X,lead?y+15:y-8);
  }
  g.restore();
};
const art2dNativeRope=drawMidkRope;
drawMidkRope=function(g){
  art2dNativeRope(g);g.save();g.strokeStyle='#9f794e';g.lineWidth=1.1;
  const first=MIDK_WIN_Y.visit+6,last=MIDK_WIN_Y.cove-6;
  for(let y=first+4;y<last;y+=11){const k=(y-first)/(last-first),x=MIDK_X+Math.sin(midk.wob)*6*k*(1-k);g.beginPath();g.moveTo(x-2,y);g.lineTo(x+2,y+5);g.stroke();}
  g.restore();
};
