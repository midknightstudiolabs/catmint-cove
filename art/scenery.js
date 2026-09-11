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



