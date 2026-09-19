/* Graphics-only overrides, embedded into the original game's closure at build time.
   No economy, input, state-machine, progression, save, or activity rules live here. */
const ART2D = { cove: new Image() };
ART2D.cove.src = 'art/cove-2d.png';

// The active shared standard uses matte vector shading, with no fur image load.
const art2dReady = image => image.complete && image.naturalWidth > 0;
const art2dStill = matchMedia('(prefers-reduced-motion: reduce)').matches;
// Bake theme scenery once per selection, not once per animation frame.
let neoThemePlateKey='',neoThemePlate=null;
function neoThemeKey(){return atmospherePreview ? atmospherePreview.key : G.cosmetics.theme;}
function neoCovePlate(){
 const key=neoThemeKey(),im=ART2D.cove;
 if(key==='default'||!art2dReady(im))return im;
 if(neoThemePlateKey===key&&neoThemePlate)return neoThemePlate;
 const cv=document.createElement('canvas');cv.width=im.naturalWidth;cv.height=im.naturalHeight;
 const g=cv.getContext('2d');g.drawImage(im,0,0);
 const data=g.getImageData(0,0,cv.width,cv.height),a=data.data;
 const palettes={meadow:[133,178,96],seaside:[231,216,175],autumn:[197,160,103],frost:[216,228,230]};
 const base=palettes[key];if(!base)return im;
 for(let y=Math.floor(cv.height*.30);y<cv.height;y++)for(let x=0;x<cv.width;x++){
  const i=(y*cv.width+x)*4,r=a[i],green=a[i+1],b=a[i+2];
  const ground=y>=cv.height*.405||(y>=cv.height*.375&&green>b*1.08);
  if(ground){
   // Retain the illustration's shadows, rock shapes and texture.
   const lum=(r*.3+green*.59+b*.11)/170;
   const foliage=key==='autumn'&&green>r*1.04&&green>b*1.12&&(r*.3+green*.59+b*.11)<175;
   const tint=foliage?((x+Math.floor(y/24)*13)%91<45?[185,104,58]:[210,158,66]):base;
   const strength=key==='frost'?.88:key==='seaside'?.86:key==='autumn'?.85:.70;
   for(let c=0;c<3;c++)a[i+c]=a[i+c]*(1-strength)+Math.min(255,tint[c]*lum)*strength;
  }else if(key==='autumn'&&y>cv.height*.24&&green>r*1.08&&green>b*1.02){
   // Warm the distant green tree silhouettes, preserving the blue mountains.
   const lum=(r*.3+green*.59+b*.11)/170;
   const tint=[192,146,85];for(let c=0;c<3;c++)a[i+c]=a[i+c]*.3+tint[c]*lum*.7;
  }else if(y<cv.height*.40&&b>r*1.05){
   const water=key==='seaside'?[91,181,188]:key==='frost'?[157,187,205]:null;
   if(water)for(let c=0;c<3;c++)a[i+c]=a[i+c]*.52+water[c]*.48;
  }
 }
 g.putImageData(data,0,0);
 const w=cv.width,h=cv.height;
 // Small, grounded details leave the central play space readable.
 for(let i=0;i<95;i++){
  const x=((i*137.507)%w),y=h*(.44+((i*71.39)%100)/100*.53);
  const edge=x<w*.20||x>w*.80||y>h*.85;
  if(!edge&&i%4!==0)continue;
  const size=2.2+(y/h-.4)*4;
  if(key==='meadow'){
   g.strokeStyle='#678d47';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y+size*2);g.lineTo(x,y);g.stroke();
   g.fillStyle=['#faf1cc','#e4a8bb','#b9b2d6'][i%3];
   for(let j=0;j<5;j++){const t=j*Math.PI*2/5;g.beginPath();g.ellipse(x+Math.cos(t)*size,y+Math.sin(t)*size,size*.8,size*.65,t,0,7);g.fill();}
   g.fillStyle='#dab75e';g.beginPath();g.arc(x,y,size*.5,0,7);g.fill();
  }else if(key==='seaside'&&i%3===0){
   g.fillStyle=i%2?'#f8eed7':'#d4bfa0';g.beginPath();g.ellipse(x,y,size*1.6,size*.8,-.3,0,7);g.fill();
   g.strokeStyle='#bca787';g.lineWidth=.8;g.beginPath();g.moveTo(x-size,y);g.lineTo(x+size,y);g.stroke();
  }else if(key==='frost'){
   g.fillStyle='rgba(249,253,250,.65)';g.beginPath();g.ellipse(x,y,size*4,size*1.3,-.12,0,7);g.fill();
  }else if(key==='autumn'){
   // Small maple-like leaves, gathered at the edges rather than covering the board.
   const count=edge?3:1;
   for(let n=0;n<count;n++){
    g.save();g.translate(x+n*size*2.7,y+(n%2)*size*1.8);g.rotate(i+n*1.7);g.scale(size*.85,size*.85);
    g.fillStyle=['#b66c42','#deb45d','#a87948'][(i+n)%3];
    g.beginPath();g.moveTo(0,1.2);g.lineTo(-1.7,.5);g.lineTo(-1.1,-.15);g.lineTo(-1.8,-1.1);g.lineTo(-.65,-.9);g.lineTo(0,-2.2);g.lineTo(.65,-.9);g.lineTo(1.8,-1.1);g.lineTo(1.1,-.15);g.lineTo(1.7,.5);g.closePath();g.fill();
    g.strokeStyle='#88643e';g.lineWidth=.18;g.beginPath();g.moveTo(0,1.7);g.lineTo(0,-1.1);g.stroke();g.restore();
   }
  }
 }
 neoThemePlateKey=key;neoThemePlate=cv;return cv;
}
const art2dNativeBackground = drawBackground;
drawBackground = function(dt) {
  if (!art2dReady(ART2D.cove)) { art2dNativeBackground(dt); return; }
  const sky = timeOfDay(); window._sky = sky;
  ctx.save();
  ctx.drawImage(neoCovePlate(), -_overX, 0, W + _overX * 2, H);
  neoExtendCove(ctx);
  neoClearSky(ctx,W,H*300/1024,_overX);
  neoAtmosphere(ctx,sky,W,H,H*300/1024,_overX);
  drawCelestial(ctx, sky);

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
  const im=neoCovePlate(),iw=im.width||im.naturalWidth,ih=im.height||im.naturalHeight;
  // Cover the visible world even when a portrait activity fits a wide screen.
  const tr=g.getTransform();
  if(tr.a>0 && tr.d>0){
    over=Math.max(over, tr.e/tr.a+2, (g.canvas.width-tr.e)/tr.a-w+2,
      tr.f/tr.d+2, (g.canvas.height-tr.f)/tr.d-h+2);
  }
  g.save();
  g.fillStyle='#c2dfe7';g.fillRect(-over,-over,w+over*2,h+over*2);
  g.drawImage(im,0,0,iw,ih*.38,-over,0,w+over*2,horizon);
  g.drawImage(im,iw*.20,ih*.40,iw*.60,ih*.38,-over,horizon,w+over*2,h-horizon+over);
  if(sand){g.fillStyle='#ebddba';g.fillRect(-over,horizon,w+over*2,h-horizon+over);}
  const sky=timeOfDay();
  neoClearSky(g,w,horizon*(300/1024)/.38,over);
  neoAtmosphere(g,sky,w,h,horizon*(300/1024)/.38,over,true);
  neoSky(g,sky,w,horizon*(300/1024)/.38,over);
  neoFestivalGroundLights(g,w,h,horizon);
  g.restore();
}

// Stylized game-time sky: continuous east-to-west arcs, twelve-hour days.
// This is an art clock, not a location-specific astronomical ephemeris.
function neoOrbit(hour,rise,w,horizon) {
  const phase=((hour-rise)%24+24)%24;
  return {x:w*(.5-.42*Math.cos(Math.PI*phase/12)),y:horizon-Math.sin(Math.PI*phase/12)*horizon*.55,visible:Math.sin(Math.PI*phase/12)>-.15};
}
function neoSky(g,sky,w,hz,over){
  g.save();neoSkyClip(g,w,hz,over);
  const night=neoLight(nowHours()).night;
  if(night>.1){
    g.fillStyle=`rgba(255,247,220,${night*.65})`;
    for(let i=0;i<38;i++){const x=((i*137.51)%w),y=12+((i*71.37)%(hz*.72));g.beginPath();g.arc(x,y,i%4===0?1.3:.7,0,Math.PI*2);g.fill();}
  }
  for(const [rise,isSun] of [[6,true],[18,false]]){
    const p=neoOrbit(nowHours(),rise,w,hz);if(!p.visible)continue;
    const r=isSun?20:15;
    const light=neoLight(nowHours());
    const glowR=isSun?65:48+light.night*45;
    const glow=g.createRadialGradient(p.x,p.y,r*.4,p.x,p.y,glowR);
    glow.addColorStop(0,isSun?'rgba(255,204,113,.38)':`rgba(196,222,255,${.12+light.night*.24})`);
    glow.addColorStop(1,isSun?'rgba(255,184,100,0)':'rgba(177,208,255,0)');
    g.fillStyle=glow;g.fillRect(p.x-glowR,p.y-glowR,glowR*2,glowR*2);
    g.fillStyle=isSun?(light.twilight>.4?'#ffd398':'#fff0b8'):'#f3f6e9';
    g.beginPath();g.arc(p.x,p.y,r,0,Math.PI*2);g.fill();
    if(!isSun){
      // Surface details stay inside the moon; never erase the scene beneath it.
      g.fillStyle='rgba(164,177,169,.22)';
      for(const [x,y,s]of [[-5,-3,3],[4,6,2], [5,-7,1.5]]){g.beginPath();g.arc(p.x+x,p.y+y,s,0,Math.PI*2);g.fill();}
    }
  }
  neoMovingClouds(g,w,hz,over);
  g.restore();
};

drawCelestial=function(g,sky){neoSky(g,sky,W,H*300/1024,_overX);};

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

// Upper edge of the painted mountains, in original 1536 x 1024 art coordinates.
// The same transform is used for each outdoor scene, including extra side coverage.
const NEO_SKYLINE=[[0,194],[28,200],[54,213],[86,241],[111,244],[145,244],[168,253],[193,272],[223,275],[253,279],[274,286],[298,299],[1208,299],[1224,287],[1248,283],[1270,286],[1302,274],[1332,275],[1365,274],[1391,271],[1410,260],[1433,263],[1454,247],[1482,247],[1504,233],[1524,228],[1536,228]];
function neoSkyClip(g,w,hz,over){
  const span=w+2*over,sx=span/1536,sy=hz/300;
  g.beginPath();g.moveTo(-10000,-10000);g.lineTo(10000,-10000);g.lineTo(10000,193*sy);
  for(let col=1;col>=-1;col--){
    const flip=col!==0;
    for(let j=0;j<NEO_SKYLINE.length;j++){
      const i=flip?j:NEO_SKYLINE.length-1-j,[x,y]=NEO_SKYLINE[i];
      g.lineTo(-over+col*span+(flip?span-x*sx:x*sx),(y-1)*sy);
    }
  }
  g.lineTo(-10000,227*sy);g.closePath();g.clip();
}
function neoLight(hour){
  const altitude=Math.sin((hour-6)*Math.PI/12);
  const n=Math.max(0,-altitude);
  return {night:n*n*(3-2*n),twilight:Math.pow(Math.max(0,1-Math.abs(altitude)/.5),2)};
}
function neoAtmosphere(g,sky,w,h,hz,over,festival=false){
  const light=neoLight(nowHours());
  const darkness=Math.min(festival?.38:.84,(1-sky.df)*.36+light.night*.48);
  g.save();g.fillStyle=`rgba(9,19,43,${darkness})`;g.fillRect(-10000,-10000,20000,h+20000);
  if(light.twilight>.005){
    const warmth=g.createLinearGradient(0,0,0,hz*1.4);
    warmth.addColorStop(0,`rgba(99,77,141,${light.twilight*.16})`);
    warmth.addColorStop(.65,`rgba(236,153,144,${light.twilight*.29})`);
    warmth.addColorStop(.87,`rgba(255,190,117,${light.twilight*.52})`);
    warmth.addColorStop(1,'rgba(255,192,131,0)');
    g.fillStyle=warmth;g.fillRect(-over,0,w+2*over,hz*1.4);
  }
  if(light.night>.15){
    const moon=neoOrbit(nowHours(),18,w,hz);
    g.save();g.beginPath();g.rect(0,hz+2,w,hz*.28);g.clip();
    for(let i=0;i<12;i++){
      const y=hz+5+i*hz*.022,spread=5+i*2.3;
      g.strokeStyle=`rgba(190,215,244,${light.night*.17*(1-i/14)})`;
      g.lineWidth=1+i*.12;g.beginPath();g.moveTo(moon.x-spread,y);g.lineTo(moon.x+spread,y);g.stroke();
    }
    g.restore();
  }
  g.restore();
}

// Replace only the sky at render time: the source mountains/shore stay untouched.
function neoClearSky(g,w,hz,over){
  g.save();neoSkyClip(g,w,hz,over);
  const fill=g.createLinearGradient(0,0,0,hz);
  const theme=DECOR_THEMES[neoThemeKey()];
  fill.addColorStop(0,theme?.sky?.[0]||'#91d0ed');fill.addColorStop(1,theme?.sky?.[1]||'#b2def0');
  g.fillStyle=fill;g.fillRect(-10000,-10000,20000,hz+10000);g.restore();
  g.save();
  const haze=g.createLinearGradient(0,hz-8,0,hz+18);
  haze.addColorStop(0,'rgba(207,229,227,0)');haze.addColorStop(.32,'rgba(207,229,227,.20)');haze.addColorStop(1,'rgba(207,229,227,0)');
  g.fillStyle=haze;g.fillRect(-10000,hz-8,20000,26);g.restore();
}
let neoCloudTime=0,neoCloudLast=performance.now();
function neoCloudPose(i,t,w,hz,over){
  const span=w+2*over+200;
  const speed=[2.1,3.2,2.5,1.8][i];
  return {x:-over-100+((span*[.12,.40,.68,.88][i]+t*speed)%span),y:hz*[.24,.52,.34,.68][i],s:[1.15,.8,1.3,.7][i]};
}
function neoMovingClouds(g,w,hz,over){
  const now=performance.now();
  if(!art2dStill)neoCloudTime+=Math.min(.05,Math.max(0,(now-neoCloudLast)/1000));
  neoCloudLast=now;
  const light=neoLight(nowHours());
  const c=Math.round(250-light.night*174);
  g.fillStyle=`rgba(${c},${c+2},${Math.min(255,c+8)},${.55-light.night*.17})`;
  for(let i=0;i<4;i++){
    const {x,y,s}=neoCloudPose(i,neoCloudTime,w,hz,over);
    g.beginPath();g.ellipse(x,y,34*s,16*s,0,0,7);
    g.ellipse(x+26*s,y+4*s,24*s,13*s,0,0,7);
    g.ellipse(x-24*s,y+5*s,20*s,11*s,0,0,7);g.fill();
  }
}

// Continue the actual image edge beyond the play area; the camera never reveals a card.
function neoExtendCove(g){
  const im=neoCovePlate(),left=-_overX,width=W+2*_overX;
  for(let row=0;row<=1;row++)for(let col=-1;col<=1;col++){
    if(row===0&&col===0)continue;
    g.save();
    const flipX=col!==0;
    g.translate(left+col*width+(flipX?width:0),row*H);
    g.scale(flipX?-1:1,1);
    if(row===0)g.drawImage(im,0,0,width+.25,H+.25);
    else {
      // Only continue the last grass strip: do not repeat upside-down rocks or shrubs.
      g.drawImage(im,0,(im.height||im.naturalHeight)-2,im.width||im.naturalWidth,2,0,0,width+.25,H+.25);
      const fade=g.createLinearGradient(0,0,0,120);
      const ground=DECOR_THEMES[neoThemeKey()]?.ground||'#a6c06f';
      fade.addColorStop(0,ground+'00');fade.addColorStop(1,ground);
      g.fillStyle=fade;g.fillRect(0,0,width+.25,H+.25);
    }
    g.restore();
  }
}

// Inland festival lawn: the furthest spectator row stands at y=291 or below.
// Keep a generous bank of solid grass behind it, independent of crowd size.
function neoRaceMeadow(g,w,h){
  if(!art2dReady(ART2D.cove))return;
  const im=neoCovePlate(),iw=im.width||im.naturalWidth,ih=im.height||im.naturalHeight,bank=170;
  g.save();
  const sky=g.createLinearGradient(0,0,0,bank);
  const theme=DECOR_THEMES[neoThemeKey()];
  sky.addColorStop(0,theme?.sky?.[0]||'#91d0ed');sky.addColorStop(1,theme?.sky?.[1]||'#d2e8d7');
  g.fillStyle=sky;g.fillRect(0,0,w,h);
  g.fillStyle='#91b798';g.beginPath();g.moveTo(0,bank);
  g.bezierCurveTo(w*.18,80,w*.27,155,w*.43,130);
  g.bezierCurveTo(w*.65,95,w*.8,145,w,105);
  g.lineTo(w,bank+30);g.lineTo(0,bank+30);g.fill();
  g.drawImage(im,iw*.20,ih*.40,iw*.60,ih*.38,0,bank,w,h-bank);
  const light=neoLight(nowHours()),day=timeOfDay();
  g.fillStyle='rgba(9,19,43,'+Math.min(.38,(1-day.df)*.36+light.night*.48)+')';
  g.fillRect(0,0,w,h);
  g.save();g.beginPath();g.moveTo(0,0);g.lineTo(w,0);g.lineTo(w,105);
  g.bezierCurveTo(w*.8,145,w*.65,95,w*.43,130);
  g.bezierCurveTo(w*.27,155,w*.18,80,0,bank);g.closePath();g.clip();
  neoSky(g,day,w,bank,0);g.restore();
  neoFestivalGroundLights(g,w,h,bank);
  g.restore();
}

// Repaint only the near-bank foliage silhouette over the inhabitants. These
// curves follow the existing corner plants and rocks, in source-art units.
// No new bitmap, image processing, or per-frame pixel reads are needed.
const NEO_FOREGROUND_PATH=new Path2D(
  'M0 790 Q18 749 41 757 Q61 770 40 817 Q68 823 73 790 Q79 769 86 784 Q110 762 121 770 Q132 783 110 809 Q151 794 132 836 L139 856 Q174 819 185 838 Q200 861 179 891 Q208 866 209 885 Q247 865 269 876 Q280 891 252 920 Q291 913 300 931 Q299 950 278 962 L303 976 L317 1024 L0 1024 Z '+
  'M1536 735 Q1510 751 1509 788 Q1487 734 1462 731 Q1438 746 1462 801 Q1421 777 1411 793 Q1410 814 1449 835 Q1422 835 1408 849 Q1414 811 1392 795 Q1374 781 1389 820 Q1400 835 1384 847 Q1364 859 1361 883 Q1350 825 1328 828 Q1307 839 1322 873 Q1282 855 1286 879 Q1289 899 1312 912 Q1273 900 1277 931 Q1255 931 1248 945 Q1239 908 1224 891 Q1206 889 1217 923 Q1186 908 1182 918 Q1179 931 1210 947 Q1176 940 1169 955 Q1188 975 1217 981 L1200 1024 L1536 1024 Z');
function neoCoveForeground(g,over=_overX){
  if(!art2dReady(ART2D.cove))return;
  g.save();g.translate(-over,0);g.scale((W+2*over)/1536,H/1024);
  g.clip(NEO_FOREGROUND_PATH);g.drawImage(neoCovePlate(),0,0,1536,1024);
  // Match the background's base night tint; the scene-wide wash comes later.
  const light=neoLight(nowHours()),sky=timeOfDay();
  g.fillStyle='rgba(9,19,43,'+Math.min(.84,(1-sky.df)*.36+light.night*.48)+')';
  g.fillRect(0,0,1536,1024);g.restore();
}

// One reusable soft-light bitmap; no blur filters or per-frame gradients.
let neoLanternGlow=null;
function neoWarmGlow(g,x,y,rx,ry,alpha){
  if(!neoLanternGlow){
    neoLanternGlow=document.createElement('canvas');neoLanternGlow.width=neoLanternGlow.height=128;
    const c=neoLanternGlow.getContext('2d'),r=c.createRadialGradient(64,64,0,64,64,64);
    r.addColorStop(0,'rgba(255,220,151,.85)');r.addColorStop(.35,'rgba(255,207,121,.4)');r.addColorStop(1,'rgba(255,207,121,0)');
    c.fillStyle=r;c.fillRect(0,0,128,128);
  }
  g.save();g.globalAlpha*=alpha;g.drawImage(neoLanternGlow,x-rx,y-ry,rx*2,ry*2);g.restore();
}
function neoFestivalGroundLights(g,w,h,horizon){
  const night=neoLight(nowHours()).night;if(night<=0)return;
  g.save();
  // A soft field wash and ground pools behind the cats and activity objects.
  neoWarmGlow(g,w*.5,horizon+(h-horizon)*.50,w*.66,(h-horizon)*.60,night*.19);
  const count=Math.min(6,Math.max(2,Math.ceil(w/400)));
  for(let i=0;i<count;i++){
    const x=w*(-.12+1.24*i/(count-1)),y=horizon+38;
    neoWarmGlow(g,x,y+16,95,35,night*.48);
    neoWarmGlow(g,x,y-34,52,64,night*.38);
    g.strokeStyle='#786348';g.lineWidth=3;g.beginPath();g.moveTo(x,y+5);g.lineTo(x,y-47);g.stroke();
    g.fillStyle='#6a5b45';roundRect(g,x-9,y-48,18,27,4);g.fill();
    g.fillStyle='#d6c296';roundRect(g,x-6,y-44,12,19,3);g.fill();
    g.globalAlpha=night;g.fillStyle='#ffe5ac';roundRect(g,x-5,y-43,10,17,3);g.fill();g.globalAlpha=1;
  }
  g.restore();
}
