/* Shared 2D art standard. Uses the ORIGINAL articulated animation renderer. */
const CAT_ART_STANDARD=Object.freeze({version:2,bodyWidth:1.0,headRadius:1.0,pawWidth:1.15,
  palette:{ink:'#222222',white:'#f6f6f6',gold:'#ffc107'}});
poseParams=function(pose,sleepStyle){
  const p=art2dNativePose(pose,sleepStyle);p.bw*=CAT_ART_STANDARD.bodyWidth;
  p.hr*=CAT_ART_STANDARD.headRadius;if(pose!=='sleep'){p.hy-=3;p.top-=2;}return p;
};
drawLeg=function(g,hx,hy,theta,stride,lift,w,col,paw,plant){
  art2dNativeLeg(g,hx,hy,theta,stride,lift,w*CAT_ART_STANDARD.pawWidth,col,paw,plant);
};
// Tapered cheek planes and chin replace the round toy-like head outline.
catSil=function(g,p){
  g.moveTo(-p.bw,0);
  g.bezierCurveTo(-p.bw-2,p.top*.46,-p.bw*.86,p.top*.90,-p.bw*.40,p.top);
  g.bezierCurveTo(-p.bw*.10,p.top-1,p.bw*.35,p.top+3,p.bw*.61,p.top*.66);
  g.bezierCurveTo(p.bw*.90,p.top*.45,p.bw,-8,p.bw,0);
  g.quadraticCurveTo(0,3,-p.bw,0);g.closePath();
  const x=p.hx,y=p.hy,r=p.hr;
  g.moveTo(x,y-r);
  g.bezierCurveTo(x+r*.65,y-r,x+r*.86,y-r*.56,x+r*.91,y-r*.02);
  g.lineTo(x+r*1.04,y+r*.22);g.lineTo(x+r*.91,y+r*.25);
  g.lineTo(x+r*1.01,y+r*.40);g.lineTo(x+r*.83,y+r*.42);
  g.bezierCurveTo(x+r*.66,y+r*.69,x+r*.38,y+r*.91,x,y+r*.94);
  g.bezierCurveTo(x-r*.38,y+r*.91,x-r*.66,y+r*.69,x-r*.83,y+r*.42);
  g.lineTo(x-r*1.01,y+r*.40);g.lineTo(x-r*.91,y+r*.25);g.lineTo(x-r*1.04,y+r*.22);
  g.bezierCurveTo(x-r*.86,y-r*.56,x-r*.65,y-r,x,y-r);g.closePath();
};
drawEye=function(g,x,y,mode,iris,wide,kit){
  if(mode==='closed'||mode==='happy'||mode==='blink'){art2dNativeEye(g,x,y,mode,iris,wide,kit);return;}
  const r=kit?3.8:3.6,h=mode==='half'?1.55:wide?3.3:2.45;
  g.save();g.beginPath();g.moveTo(x-r,y);
  g.bezierCurveTo(x-r*.5,y-h*1.4,x+r*.45,y-h*1.35,x+r,y-.3);
  g.bezierCurveTo(x+r*.5,y+h*1.2,x-r*.45,y+h*1.2,x-r,y);
  g.closePath();g.fillStyle=iris;g.fill();g.strokeStyle='#302c28';g.lineWidth=.65;g.stroke();g.clip();
  g.fillStyle='#171b19';g.beginPath();g.ellipse(x,y,wide?1.5:.85,h*1.16,0,0,7);g.fill();
  g.fillStyle='#fff9e8';g.beginPath();g.arc(x-.9,y-.9,.65,0,7);g.fill();g.restore();
};
// All coats share matte two-tone shading, with no raster overlay per frame.
art2dFur=function(g,c,p){
  g.save();g.beginPath();catSil(g,p);g.clip();
  g.fillStyle='rgba(35,29,24,.06)';g.beginPath();g.ellipse(p.bw*.5,-7,p.bw*.6,11,-.2,0,7);g.fill();
  if(c.coat.mascot){
    const x=p.hx,y=p.hy,r=p.hr;
    // The supplied model sheet supersedes the old freckle/goatee design.
    g.fillStyle=CAT_ART_STANDARD.palette.white;
    g.beginPath();g.moveTo(x-r*.09,y-r*.10);
    for(const [dx,dy] of [[-.16,-.28],[-.13,-.48],[-.08,-.37],[-.09,-.69],[-.02,-.56],[.01,-.85],[.06,-.60],[.12,-.70],[.15,-.43],[.20,-.49],[.16,-.19],[.07,-.35]])g.lineTo(x+r*dx,y+r*dy);
    g.closePath();g.fill();
  }
  g.restore();
};
drawMidknightMarks=function(g,p,coat){
  // Dark bridge between the muzzle lobes; no invented forehead spots.
  g.fillStyle=coat.base;g.beginPath();g.moveTo(p.hx-p.hr*.14,p.hy+p.hr*.03);
  g.lineTo(p.hx+p.hr*.14,p.hy+p.hr*.03);g.lineTo(p.hx+p.hr*.11,p.hy+p.hr*.40);
  g.lineTo(p.hx-p.hr*.10,p.hy+p.hr*.40);g.closePath();g.fill();
};

if(new URLSearchParams(location.search).has('midknight')||new URLSearchParams(location.search).has('standard')){
  const launch=document.createElement('button');launch.textContent='Cat animation standard';
  launch.style.cssText='position:fixed;left:20px;top:82px;z-index:10000;padding:12px 20px;border:0;border-radius:22px;background:#ffcf55;color:#302717;cursor:pointer';document.body.append(launch);
  launch.onclick=()=>{
    const panel=document.createElement('dialog');panel.style.cssText='width:min(920px,94vw);padding:22px;border:0;border-radius:24px;background:#fff5df;color:#443927';
    panel.innerHTML='<h2 style="margin:0">One cat system · every coat</h2><p>Actual articulated movement. The same anatomy and animation across all cats.</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button data-motion="walk">Walk</button><button data-motion="sleeping">Sleep</button><button data-motion="grooming">Groom</button><button data-motion="playing">Play</button><button data-motion="being_pet">Pet</button></div><canvas width="900" height="400" style="width:100%;display:block"></canvas><output>Measuring…</output><button data-close style="float:right">Back to the Cove</button>';
    document.body.append(panel);panel.showModal();
    let motion='walk',frame,last=0,elapsed=0,n=0,cost=0;
    panel.querySelectorAll('[data-motion]').forEach(b=>b.onclick=()=>{motion=b.dataset.motion;});
    const stop=()=>{cancelAnimationFrame(frame);panel.remove();};panel.querySelector('[data-close]').onclick=stop;panel.onclose=stop;
    const cv=panel.querySelector('canvas'),g=cv.getContext('2d');
    const specimens=cats.slice(0,4).map(c=>({...c,coat:c.coat,isKitten:false,growth:1,ageScale:1,worn:[],_chonkBase:1,partner:null,_fx:null,_jumpT:0,_jumpH:0,_tugLean:0,_groomFrozen:0}));
    function tick(now){
      if(!panel.isConnected)return;const start=performance.now(),t=now/1000;
      g.clearRect(0,0,900,400);
      for(let i=0;i<specimens.length;i++){
        const c=specimens[i],travel=Math.sin(t*.55)*23;
        c.x=0;c.y=0;c.face=motion==='walk'?(Math.cos(t*.55)>0?1:-1):1;
        c.state=motion==='walk'?'wandering':motion;c.walkAmt=motion==='walk'?1:0;
        c.walk=t*5+i*.4;c.bob=t*2+i;c.tail=t*2+i;c.blink=(t+i*.6)%4<.12?0:1;
        c.stateT=t;c.squash=0;c._slowBlink=0;c._groomMove='face';
        g.save();g.translate(120+i*220+(motion==='walk'?travel:0),255);g.scale(2.4,2.4);
        drawCat(g,c,true);g.restore();
        g.fillStyle='#514330';g.font='17px Georgia';g.textAlign='center';g.fillText(c.name,120+i*220,300);
      }
      if(last&&now-last<100){elapsed+=now-last;n++;cost+=performance.now()-start;}last=now;
      if(n>=90){panel.querySelector('output').textContent=`${Math.round(n*1000/elapsed)} FPS · drawing ${specimens.length} cats: ${(cost/n).toFixed(2)} ms`;n=0;elapsed=0;cost=0;}
      frame=requestAnimationFrame(tick);
    }frame=requestAnimationFrame(tick);
  };
}

