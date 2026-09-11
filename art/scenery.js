/* Graphics-only overrides, embedded into the original game's closure at build time.
   No economy, input, state-machine, progression, save, or activity rules live here. */
const ART2D = { cove: new Image() };
ART2D.cove.src = 'art/cove-2d.png';

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




// Shared outdoor plate: one existing image, no per-frame texture generation.
function neoOutdoor(g,w,h,horizon,over,sand=false) {
  if(!art2dReady(ART2D.cove)) return;
  const im=ART2D.cove,iw=im.naturalWidth,ih=im.naturalHeight;
  g.save();
  g.fillStyle='#c2dfe7';g.fillRect(-over,-over,w+over*2,h+over*2);
  g.drawImage(im,0,0,iw,ih*.38,-over,0,w+over*2,horizon);
  g.drawImage(im,iw*.20,ih*.40,iw*.60,ih*.38,-over,horizon,w+over*2,h-horizon+over);
  if(sand){g.fillStyle='#ebddba';g.fillRect(-over,horizon,w+over*2,h-horizon+over);}
  const sky=timeOfDay();
  if(sky.df<.99){g.fillStyle=`rgba(25,36,66,${(1-sky.df)*.48})`;g.fillRect(-over,-over,w+over*2,h+over*2);}
  neoSky(g,sky,w,horizon*.76,over);
  g.restore();
}

// Stylized game-time sky: continuous east-to-west arcs, twelve-hour days.
// This is an art clock, not a location-specific astronomical ephemeris.
function neoOrbit(hour,rise,w,horizon) {
  const phase=((hour-rise)%24+24)%24;
  return {x:w*(.5-.42*Math.cos(Math.PI*phase/12)),y:horizon-Math.sin(Math.PI*phase/12)*horizon*.82,visible:Math.sin(Math.PI*phase/12)>-.15};
}
function neoSky(g,sky,w,hz,over){
  g.save();g.beginPath();g.rect(-over,0,w+2*over,hz);g.clip();
  const night=1-sky.df;
  if(night>.1){
    g.fillStyle=`rgba(255,247,220,${night*.65})`;
    for(let i=0;i<38;i++){const x=((i*137.51)%w),y=12+((i*71.37)%(hz*.72));g.beginPath();g.arc(x,y,i%4===0?1.3:.7,0,Math.PI*2);g.fill();}
  }
  for(const [rise,isSun] of [[6,true],[18,false]]){
    const p=neoOrbit(nowHours(),rise,w,hz);if(!p.visible)continue;
    const r=isSun?20:15;
    g.fillStyle=isSun?'#ffe7a4':'#f4efd4';
    g.beginPath();g.arc(p.x,p.y,r,0,Math.PI*2);g.fill();
    if(!isSun){
      // Surface details stay inside the moon; never erase the scene beneath it.
      g.fillStyle='rgba(164,177,169,.22)';
      for(const [x,y,s]of [[-5,-3,3],[4,6,2], [5,-7,1.5]]){g.beginPath();g.arc(p.x+x,p.y+y,s,0,Math.PI*2);g.fill();}
    }
  }
  g.restore();
};

drawCelestial=function(g,sky){neoSky(g,sky,W,H*.29,_overX);};

// Sort by ground contact, keeping elevated/working cats attached to their furniture.
function neoCatDepth(c){
  if(c._perchKind)return c._cotY-(c._perchKind==='perch'?5:c._perchKind==='cubby'?3:1);
  if(c.state==='indoors'&&c._cotY!=null)return c._cotY+.1;
  if(c.state==='fishing'||c.state==='baking'){
    const d=decor.find(d=>d.type==='station'&&d.station===c._station);
    if(d)return Math.max(c.y,d.y+.1);
  }
  return c.y;
}
