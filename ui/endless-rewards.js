/* DRAFT — Endless mode milestone cosmetics (rounds 50..1000, every 50). Not
   yet wired into gameplay; this file only exists so the designs can be
   previewed on a real cat before anything is finalized. */
window.ENDLESS_REWARDS=[
{round:50,key:'en_pinwheel',label:'Paper Pinwheel',slot:'ear',blurb:'A little spinner for a little win.'},
{round:100,key:'en_acorncap',label:'Acorn Cap',slot:'head',blurb:'Somewhere, a squirrel is filing a complaint.'},
{round:150,key:'en_seaglass',label:'Sea-glass Collar',slot:'neck',blurb:'Found by the shore, kept by the cove.'},
{round:200,key:'en_mothbow',label:'Moth-wing Bowtie',slot:'neck',blurb:'Delicate, a little dramatic, entirely earned.'},
{round:250,key:'en_pressedflower',label:'Pressed-Flower Crown',slot:'head',blurb:'Picked, pressed, worn with quiet pride.'},
{round:300,key:'en_fishercap',label:"Fisherman's Cap",slot:'head',blurb:'This cat has clearly seen some things.'},
{round:350,key:'en_stormcape',label:'Storm-cloud Cape',slot:'back',blurb:'Small, grey, faintly dramatic. Thunder optional.'},
{round:400,key:'en_lantern',label:'Lantern Charm',slot:'neck',blurb:'A little light for a lot of matching.'},
{round:450,key:'en_sweater',label:'Knit Sweater',slot:'back',blurb:'Four hundred and fifty rounds deserves something warm.'},
{round:500,key:'en_sailor',label:"Sailor's Neckerchief",slot:'neck',blurb:'Halfway to a thousand. The cove salutes you.'},
{round:550,key:'en_telescope',label:'Telescope Pendant',slot:'neck',blurb:'For a cat who has clearly been paying close attention.'},
{round:600,key:'en_trowel',label:'Garden Trowel Charm',slot:'neck',blurb:'Six hundred rounds of digging up the right memory.'},
{round:650,key:'en_lanternwings',label:'Paper Lantern Wings',slot:'back',blurb:'Light enough to float. Earned enough to matter.'},
{round:700,key:'en_compass',label:'Compass Rose Badge',slot:'neck',blurb:'Seven hundred rounds and still finding the way.'},
{round:750,key:'en_midnightcloak',label:'Midnight Cloak',slot:'back',blurb:'Three-quarters of the way to something legendary.'},
{round:800,key:'en_starmap',label:'Star-map Collar',slot:'neck',blurb:'Charted, memorized, worn with a wink.'},
{round:850,key:'en_antlers',label:'Driftwood Antlers',slot:'head',blurb:'Found on the shore. Worn like royalty.'},
{round:900,key:'en_comettail',label:'Comet-tail Scarf',slot:'neck',blurb:'Trailing sparkle optional. Earned, not optional.'},
{round:950,key:'en_aurora',label:'Aurora Cloak',slot:'back',blurb:'So close to a thousand the cove practically glows.'},
{round:1000,key:'en_founderscrown',label:"Founder's Crown",slot:'head',blurb:'One thousand rounds. Basically the mayor at this point.'}
];
window.drawEndlessAccessory=function(g,kind,P,coat,kit,lum){
if(typeof kind!=='string'||!kind.startsWith('en_'))return false;
const hr=P.hr,hx=P.hx,hy=P.hy;
g.save();g.translate(hx,hy);g.scale(hr,hr);g.lineJoin='round';g.lineCap='round';
if(kind==='en_pinwheel'){
 const cx=.98,cy=-.35;g.save();g.translate(cx,cy);
 const cols=['#e488ac','#7ea6c9','#e8c05a','#8fb47a'];
 for(let i=0;i<4;i++){g.save();g.rotate(i*Math.PI/2);g.fillStyle=cols[i];g.beginPath();g.moveTo(0,0);g.lineTo(.32,-.1);g.lineTo(.26,.22);g.closePath();g.fill();g.restore();}
 g.fillStyle='#7a5a3a';g.beginPath();g.arc(0,0,.07,0,7);g.fill();
 g.strokeStyle='#b99a6b';g.lineWidth=.06;g.beginPath();g.moveTo(0,.1);g.lineTo(0,.55);g.stroke();
 g.restore();
}else if(kind==='en_acorncap'){
 g.fillStyle='#8a6a42';g.beginPath();g.ellipse(0,-.98,.62,.34,0,0,Math.PI,true);g.fill();
 g.strokeStyle='#6e5232';g.lineWidth=.05;
 for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(-.55,-.98+i*.02);g.lineTo(.55,-.98+i*.02+.06);g.stroke();}
 g.fillStyle='#5f4527';g.beginPath();g.ellipse(0,-1.3,.5,.16,0,0,7);g.fill();
 g.fillStyle='#7a5a3a';g.beginPath();g.arc(0,-1.42,.07,0,7);g.fill();
}else if(kind==='en_seaglass'){
 g.strokeStyle='#8fae9c';g.lineWidth=.09;g.beginPath();g.arc(0,0,.98,Math.PI*.16,Math.PI*.84);g.stroke();
 const y=.82;g.fillStyle='rgba(150,214,196,.85)';g.beginPath();g.moveTo(0,y-.05);g.lineTo(.16,y+.24);g.lineTo(0,y+.4);g.lineTo(-.16,y+.24);g.closePath();g.fill();
 g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=.03;g.beginPath();g.moveTo(-.05,y+.02);g.lineTo(.03,y+.22);g.stroke();
}else if(kind==='en_mothbow'){
 const bx=0,by=.88;
 for(const side of [-1,1]){g.fillStyle='#8c7f6a';g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx+side*.3,by-.26,bx+side*.56,by-.06);g.quadraticCurveTo(bx+side*.6,by+.16,bx+side*.32,by+.22);g.quadraticCurveTo(bx+side*.12,by+.14,bx,by);g.closePath();g.fill();
  g.fillStyle='rgba(224,208,176,.75)';for(let i=0;i<3;i++){g.beginPath();g.arc(bx+side*(.2+i*.13),by-.04+i*.03,.05,0,7);g.fill();}
  g.strokeStyle='rgba(70,58,42,.5)';g.lineWidth=.02;g.beginPath();g.moveTo(bx+side*.06,by-.16);g.lineTo(bx+side*.5,by-.02);g.stroke();}
 g.fillStyle='#5c503f';g.beginPath();g.arc(bx,by,.08,0,7);g.fill();
}else if(kind==='en_pressedflower'){
 g.strokeStyle='#79876a';g.lineWidth=.1;g.beginPath();g.ellipse(0,-.86,.86,.24,0,0,7);g.stroke();
 const cols=['#e3b6c4','#f2d98a','#c7ceea'];
 for(let n=0;n<5;n++){const x=(n-2)*.4,y=-.94-Math.sin(n/4*Math.PI)*.15;g.fillStyle=cols[n%cols.length];g.beginPath();g.ellipse(x,y,.16,.07,0,0,7);g.fill();g.fillStyle='#c99a39';g.beginPath();g.arc(x,y,.05,0,7);g.fill();}
}else if(kind==='en_fishercap'){
 g.fillStyle='#3d5a6c';g.beginPath();g.ellipse(0,-1.0,.86,.5,0,Math.PI,0,true);g.fill();
 g.fillStyle='#2e4552';g.beginPath();g.ellipse(0,-.86,.9,.2,0,0,7);g.fill();
 g.fillStyle='#e8dcc0';g.beginPath();g.arc(-.62,-1.28,.09,0,7);g.fill();
}else if(kind==='en_stormcape'){
 const capePath=()=>{g.beginPath();g.moveTo(-.92,.15);g.quadraticCurveTo(0,.55,.92,.15);g.quadraticCurveTo(1.02,1.15,.4,1.65);g.quadraticCurveTo(0,1.35,-.4,1.65);g.quadraticCurveTo(-1.02,1.15,-.92,.15);};
 g.fillStyle='#848e9a';capePath();g.fill();
 // Mottled tonal blotches clipped to the cape read as cloud cover instead of
 // one flat plate of grey (which was reading as a shield).
 g.save();capePath();g.clip();
 g.fillStyle='#9aa4ae';for(const[px,py,r]of[[-.5,.5,.34],[.3,.4,.4],[.6,.85,.3],[-.15,1.0,.36]])  {g.beginPath();g.arc(px,py,r,0,7);g.fill();}
 g.fillStyle='#6d7680';for(const[px,py,r]of[[-.6,1.1,.28],[.5,1.3,.26],[.05,.75,.3]]){g.beginPath();g.arc(px,py,r,0,7);g.fill();}
 g.restore();
 // A small offset bolt charm, not a big centred emblem.
 g.fillStyle='#e8c05a';g.save();g.translate(.3,1.05);g.rotate(.15);g.beginPath();g.moveTo(-.06,-.14);g.lineTo(.08,-.14);g.lineTo(-.02,.06);g.lineTo(.09,.06);g.lineTo(-.09,.32);g.lineTo(-.01,.09);g.lineTo(-.12,.09);g.closePath();g.fill();g.restore();
}else if(kind==='en_lantern'){
 const y=.9;g.strokeStyle='#8a6a42';g.lineWidth=.05;g.beginPath();g.moveTo(0,.55);g.lineTo(0,y-.16);g.stroke();
 g.fillStyle='#e8b84a';g.beginPath();g.moveTo(-.16,y-.16);g.lineTo(.16,y-.16);g.lineTo(0,y-.32);g.closePath();g.fill();
 g.fillStyle='rgba(232,184,74,.85)';g.beginPath();g.ellipse(0,y+.1,.17,.24,0,0,7);g.fill();
 g.strokeStyle='#a8791f';g.lineWidth=.03;g.beginPath();g.moveTo(0,y-.1);g.lineTo(0,y+.32);g.stroke();
}else if(kind==='en_sweater'){
 // Shoulder humps (not one smooth bib curve) plus vertical ribbing read as
 // knitwear instead of a flat bib.
 g.fillStyle='#c1694f';g.beginPath();g.moveTo(-.98,.42);g.quadraticCurveTo(-.8,.18,-.5,.28);g.quadraticCurveTo(-.2,.1,0,.24);g.quadraticCurveTo(.2,.1,.5,.28);g.quadraticCurveTo(.8,.18,.98,.42);g.lineTo(1.04,1.2);g.quadraticCurveTo(0,1.58,-1.04,1.2);g.closePath();g.fill();
 g.save();g.clip();
 g.strokeStyle='rgba(0,0,0,.14)';g.lineWidth=.05;
 for(let i=-4;i<=4;i++){g.beginPath();g.moveTo(i*.22,.15);g.lineTo(i*.22,1.6);g.stroke();}
 g.restore();
 g.fillStyle='#e8dcc0';g.beginPath();g.ellipse(0,.42,.34,.16,0,0,Math.PI,true);g.fill();
 g.strokeStyle='#c9baa0';g.lineWidth=.03;g.beginPath();g.ellipse(0,.42,.34,.16,0,0,Math.PI,true);g.stroke();
}else if(kind==='en_sailor'){
 g.fillStyle='#33506e';g.beginPath();g.moveTo(-.8,.64);g.quadraticCurveTo(0,1.0,.82,.63);g.lineTo(.2,1.6);g.quadraticCurveTo(-.28,1.4,-.8,.64);g.fill();
 g.strokeStyle='#e8dcc0';g.lineWidth=.06;g.beginPath();g.moveTo(-.62,.78);g.lineTo(.05,1.42);g.lineTo(.6,.77);g.stroke();
}else if(kind==='en_telescope'){
 const y=.86;g.save();g.translate(0,y);g.rotate(-.25);
 g.fillStyle='#8a9aa6';g.fillRect(-.09,-.3,.18,.24);g.fillStyle='#6c7d89';g.fillRect(-.13,-.08,.26,.16);g.fillStyle='#4d5b66';g.fillRect(-.16,.08,.32,.14);
 g.fillStyle='#dfe6e8';g.beginPath();g.arc(0,-.3,.09,0,7);g.fill();
 g.restore();
}else if(kind==='en_trowel'){
 const y=.86;g.save();g.translate(0,y);g.rotate(.3);
 g.fillStyle='#a8794a';g.fillRect(-.05,-.4,.1,.32);
 g.fillStyle='#8b98a1';g.beginPath();g.moveTo(-.16,-.08);g.quadraticCurveTo(0,.3,.16,-.08);g.quadraticCurveTo(0,-.2,-.16,-.08);g.fill();
 g.restore();
}else if(kind==='en_lanternwings'){
 // Small paired lanterns, not full-size ellipses — the earlier version read
 // as oversized ears rather than a pair of hanging lanterns.
 for(const side of [-1,1]){
  g.strokeStyle='#a8791f';g.lineWidth=.025;g.beginPath();g.moveTo(side*.5,.42);g.lineTo(side*.72,.56);g.stroke();
  g.fillStyle='rgba(232,184,74,.85)';g.beginPath();g.ellipse(side*.72,.78,.15,.19,0,0,7);g.fill();
  g.strokeStyle='#a8791f';g.lineWidth=.02;g.beginPath();g.moveTo(side*.6,.7);g.lineTo(side*.84,.7);g.stroke();g.beginPath();g.moveTo(side*.6,.86);g.lineTo(side*.84,.86);g.stroke();
  g.fillStyle='#8a6a42';g.beginPath();g.arc(side*.72,.59,.03,0,7);g.fill();g.beginPath();g.arc(side*.72,.97,.03,0,7);g.fill();
 }
}else if(kind==='en_compass'){
 const y=.92;g.fillStyle='#c9a24a';g.beginPath();g.arc(0,y,.24,0,7);g.fill();
 g.fillStyle='#3a4a52';g.beginPath();g.arc(0,y,.17,0,7);g.fill();
 g.fillStyle='#e8dcc0';for(let i=0;i<4;i++){g.save();g.translate(0,y);g.rotate(i*Math.PI/2);g.beginPath();g.moveTo(0,-.14);g.lineTo(.045,0);g.lineTo(0,.14);g.lineTo(-.045,0);g.closePath();g.fill();g.restore();}
}else if(kind==='en_midnightcloak'){
 g.fillStyle='#28324a';g.beginPath();g.moveTo(-.92,.1);g.quadraticCurveTo(0,.52,.92,.1);g.quadraticCurveTo(1.02,1.15,.4,1.7);g.quadraticCurveTo(0,1.4,-.4,1.7);g.quadraticCurveTo(-1.02,1.15,-.92,.1);g.fill();
 g.fillStyle='#e8dcc0';for(const[px,py]of[[-.4,.6],[.3,.8],[-.1,1.1],[.5,1.3]]){g.beginPath();g.arc(px,py,.03,0,7);g.fill();}
}else if(kind==='en_starmap'){
 g.strokeStyle='#2e3a4a';g.lineWidth=.14;g.beginPath();g.arc(0,0,.98,Math.PI*.16,Math.PI*.84);g.stroke();
 g.fillStyle='#e8dcc0';for(const t of[.28,.5,.72]){const a=Math.PI*t;g.beginPath();g.arc(Math.cos(a)*.98,Math.sin(a)*.98,.045,0,7);g.fill();}
}else if(kind==='en_antlers'){
 for(const side of [-1,1]){g.strokeStyle='#a08a6e';g.lineWidth=.07;g.beginPath();g.moveTo(side*.5,-.9);g.lineTo(side*.62,-1.5);g.stroke();
  g.beginPath();g.moveTo(side*.56,-1.2);g.lineTo(side*.78,-1.34);g.stroke();
  g.beginPath();g.moveTo(side*.6,-1.38);g.lineTo(side*.8,-1.5);g.stroke();}
}else if(kind==='en_comettail'){
 g.fillStyle='#5c6bb0';g.beginPath();g.moveTo(-.7,.6);g.quadraticCurveTo(0,.95,.72,.58);g.lineTo(.5,.9);g.quadraticCurveTo(0,1.1,-.5,.9);g.closePath();g.fill();
 g.fillStyle='rgba(196,206,240,.8)';g.beginPath();g.moveTo(.4,.85);g.quadraticCurveTo(1.1,1.1,1.6,1.7);g.quadraticCurveTo(.9,1.4,.35,1.2);g.closePath();g.fill();
 g.fillStyle='#e8dcc0';for(const[px,py]of[[1.0,1.2],[1.3,1.5],[.75,1.05]]){g.beginPath();g.arc(px,py,.03,0,7);g.fill();}
}else if(kind==='en_aurora'){
 g.fillStyle='#28324a';g.beginPath();g.moveTo(-.92,.1);g.quadraticCurveTo(0,.52,.92,.1);g.quadraticCurveTo(1.02,1.15,.4,1.7);g.quadraticCurveTo(0,1.4,-.4,1.7);g.quadraticCurveTo(-1.02,1.15,-.92,.1);g.fill();
 const bands=['rgba(126,214,170,.55)','rgba(158,140,214,.5)','rgba(126,182,214,.45)'];
 for(let i=0;i<3;i++){g.fillStyle=bands[i];g.beginPath();g.moveTo(-.7+i*.1,.4+i*.25);g.quadraticCurveTo(0,.7+i*.25,.7-i*.1,.4+i*.25);g.quadraticCurveTo(.6-i*.1,.65+i*.25,0,.85+i*.25);g.quadraticCurveTo(-.6+i*.1,.65+i*.25,-.7+i*.1,.4+i*.25);g.fill();}
}else if(kind==='en_founderscrown'){
 g.fillStyle='#c9a24a';g.beginPath();g.moveTo(-.7,-.7);g.lineTo(-.7,-1.05);g.lineTo(-.42,-.82);g.lineTo(-.2,-1.28);g.lineTo(0,-.86);g.lineTo(.2,-1.28);g.lineTo(.42,-.82);g.lineTo(.7,-1.05);g.lineTo(.7,-.7);g.closePath();g.fill();
 g.fillStyle='#8f6d2a';g.beginPath();g.rect(-.7,-.72,1.4,.14);g.fill();
 g.fillStyle='#c94f5c';for(const px of[-.35,0,.35]){g.beginPath();g.arc(px,-.65,.055,0,7);g.fill();}
}
g.restore();return true;};
