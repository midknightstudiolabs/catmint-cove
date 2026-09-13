/* Midknight complete painted pose study. Prepared offline; no runtime pixel processing. */
const mkNativeCat=drawCat;
const mkSupported=new Set(['idle','resting','wandering','walking','sleeping','being_pet','wantpet','sulking','socializing']);
const mkPoses={};let mkPosesLoaded=0;
for(const name of ['rest','walk','pull']){
  const im=new Image();im.onload=()=>mkPosesLoaded++;im.src=`art/midknight-pose-${name}.png`;mkPoses[name]=im;
}
function mkPaintCat(g,c){
  if(mkPosesLoaded!==3)return;
  const pose=c._mkPose||(Math.abs(c._tugLean||0)>.01?'pull':(c.walkAmt||0)>.15?'walk':'rest');
  const im=mkPoses[pose],height=pose==='pull'?61:55,width=height*im.naturalWidth/im.naturalHeight;
  const age=c.ageScale*(c._chonkBase||1);
  g.save();g.translate(c.x,c.y);g.scale(age,age);
  g.fillStyle='rgba(45,49,28,.15)';g.beginPath();g.ellipse(0,1,width*.43,3.2,0,0,7);g.fill();
  g.scale(c.face||1,1);
  // Only a small breathing deformation; do not pretend a single pose is a walk cycle.
  const breathe=1+Math.sin(c.bob||performance.now()/700)*.004;
  g.scale(1,breathe);g.drawImage(im,-width/2,-height,width,height);
  if(c.worn&&c.worn.length){
    const p={bw:width*.4,top:-38,hx:pose==='walk'?15:5,hy:-height*.64,hr:12};
    for(const k of wornList(c))drawAccessory(g,k,p,c.coat,c.isKitten);
  }
  g.restore();
}
drawCat=function(g,c,isPhoto){
  if(c.coat?.mascot&&mkPosesLoaded===3&&
    (mkSupported.has(c.state)||c.walkAmt>.02||c._tugLean||c._mkPreview)){
    mkPaintCat(g,c);return;
  }
  mkNativeCat(g,c,isPhoto);
};

// A review-only stage drives copies, never the saved character or game rules.
if(new URLSearchParams(location.search).has('midknight')){
  const b=document.createElement('button');b.textContent='Review Midknight';
  b.style.cssText='position:fixed;top:82px;left:20px;z-index:10000;border:0;border-radius:22px;padding:12px 20px;background:#ffcf55;color:#302717;cursor:pointer';document.body.append(b);
  b.onclick=()=>{
    const d=document.createElement('dialog');d.style.cssText='width:min(850px,94vw);background:#fff5dd;border:0;border-radius:24px;padding:22px;color:#3f3527';
    d.innerHTML='<h2>Midknight · painted pose study</h2><p>Complete 2D poses. Breathing preview; the walk cycle is still to be drawn.</p><canvas width="840" height="330" style="width:100%"></canvas><output style="display:block;margin-bottom:12px">Measuring preview…</output><button>Back to the Cove</button>';
    document.body.append(d);d.showModal();let frame;const cv=d.querySelector('canvas'),g=cv.getContext('2d');
    const stop=()=>{cancelAnimationFrame(frame);d.remove();};d.querySelector('button').onclick=stop;d.onclose=stop;
    let last=0,frames=0,elapsed=0,cost=0;
    function render(now){
      if(!d.isConnected)return;
      const start=performance.now();
      g.clearRect(0,0,840,330);const c=cats.find(c=>c.coat.mascot);
      if(c&&mkPosesLoaded===3)for(let i=0;i<3;i++){
        const t=performance.now()/1000;
        g.save();g.translate(140+i*280,250);g.scale(3,3);
        mkPaintCat(g,{...c,coat:c.coat,ageScale:1,face:1,x:0,y:0,worn:[],state:i===0?'sleeping':'walking',
          _mkPose:['rest','walk','pull'][i],
          walkAmt:i===1?1:0,walk:t*4,bob:t*2,tail:t*2,blink:(t%4)<.12?0:1,_tugLean:i===2?.12+Math.sin(t*2.3)*.06:0});
        g.restore();g.fillStyle='#4c4030';g.font='18px Georgia';g.textAlign='center';g.fillText(['Rest pose','Walk pose','Pull pose'][i],140+i*280,300);
      }
      if(last&&now-last<100){elapsed+=now-last;frames++;cost+=performance.now()-start;}
      last=now;
      if(frames>=120){d.querySelector('output').textContent=`Preview: ${Math.round(frames*1000/elapsed)} FPS · three cats drawn in ${(cost/frames).toFixed(2)} ms average`;frames=0;elapsed=0;cost=0;}
      frame=requestAnimationFrame(render);
    }frame=requestAnimationFrame(render);
  };
}
