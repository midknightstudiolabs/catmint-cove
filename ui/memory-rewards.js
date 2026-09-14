/* Little Matches earned cosmetics. Shared by the Cove, portraits and reward previews. */
window.LITTLE_MATCH_REWARDS=[
{level:5,key:'lm_gingham',label:'Gingham Bow',slot:'neck',blurb:'A little sage check, earned together.'},
{level:10,key:'lm_daisy',label:'Daisy Crown',slot:'head',blurb:'Cream daisies for a familiar friend.'},
{level:15,key:'lm_kerchief',label:'Cozy Neckerchief',slot:'neck',blurb:'Soft terracotta with a stitched edge.'},
{level:20,key:'lm_bonnet',label:'Sleepy Bonnet',slot:'head',blurb:'A blue bedtime cap for a very accomplished napper.'},
{level:25,key:'lm_explorer',label:'Explorer Hat',slot:'head',blurb:'A sage band, a little brim, a big adventure.'},
{level:30,key:'lm_lion',label:'Little Lion',slot:'head',blurb:'The mane is magnificent. The roar needs practice.'}
];
window.drawMemoryAccessory=function(g,kind,P,coat,kit,lum){
if(typeof kind!=='string'||!kind.startsWith('lm_'))return false;
if(kind==='lm_lion'){
 const {hx:x,hy:y,hr:r}=P;
 g.save();g.translate(x,y);g.scale(r,r);
 // Gently compress the lower mane while keeping ears and facial opening aligned.
 const manePointY=v=>v>1?1+(v-1)*.64:v;
 const path={};for(const k of ['moveTo','lineTo','quadraticCurveTo','bezierCurveTo'])path[k]=(...args)=>{for(let i=1;i<args.length;i+=2)args[i]=manePointY(args[i]);g[k](...args)};
 g.lineJoin='round';g.lineCap='round';

 const dark=lum<.22,base=dark?'#946039':'#ad753e',light=dark?'#c4914e':'#d4a458',shadow=dark?'#71472f':'#895830';
 g.fillStyle=base;g.beginPath();
 path.moveTo(-.82,-1.3);path.quadraticCurveTo(-.48,-1.65,-.15,-1.48);path.lineTo(.05,-1.66);path.quadraticCurveTo(.3,-1.42,.72,-1.4);
 path.quadraticCurveTo(1.22,-1.28,1.35,-.75);path.lineTo(1.48,-.42);path.lineTo(1.34,-.43);path.quadraticCurveTo(1.63,.12,1.5,.46);path.lineTo(1.34,.36);path.lineTo(1.46,.86);path.lineTo(1.2,.77);
 path.quadraticCurveTo(1.27,1.23,.93,1.54);path.lineTo(.91,1.32);path.quadraticCurveTo(.7,1.84,.38,1.94);path.lineTo(.39,1.72);path.lineTo(.02,2.13);path.lineTo(-.19,1.88);path.lineTo(-.4,1.97);
 path.quadraticCurveTo(-.78,1.71,-.92,1.34);path.lineTo(-1.08,1.51);path.quadraticCurveTo(-1.34,1.15,-1.21,.78);path.lineTo(-1.47,.9);path.lineTo(-1.35,.44);path.lineTo(-1.52,.51);path.quadraticCurveTo(-1.65,.07,-1.37,-.4);path.lineTo(-1.51,-.38);path.quadraticCurveTo(-1.32,-1.14,-.82,-1.3);g.closePath();
 path.moveTo(-.78,-.6);path.quadraticCurveTo(-.56,-.9,-.25,-.82);path.lineTo(-.08,-.94);path.quadraticCurveTo(.35,-.94,.73,-.64);path.quadraticCurveTo(.95,-.28,.91,.12);path.lineTo(.78,.32);path.lineTo(.88,.39);path.quadraticCurveTo(.64,.92,.12,1.01);path.quadraticCurveTo(-.52,1.04,-.87,.45);path.lineTo(-.76,.31);path.lineTo(-.94,.18);path.quadraticCurveTo(-1,-.25,-.78,-.6);g.closePath();g.fill('evenodd');
 for(const side of [-1,1]){
 g.fillStyle=shadow;g.beginPath();g.ellipse(side*.91,-1.22,.39,.4,side*.28,0,7);g.fill();g.fillStyle=light;g.beginPath();g.ellipse(side*.91,-1.25,.29,.28,side*.28,0,7);g.fill();g.fillStyle=dark?'#644532':'#805737';g.beginPath();g.ellipse(side*.91,-1.23,.15,.15,side*.28,0,7);g.fill();
 for(let j=0;j<3;j++){g.fillStyle=j===1?shadow:light;g.beginPath();path.moveTo(side*(.98+j*.025),-.51+j*.48);path.bezierCurveTo(side*(1.34+j*.02),-.08+j*.46,side*1.15,.5+j*.38,side*(.92-j*.16),.83+j*.39);path.quadraticCurveTo(side*(1.08-j*.06),.39+j*.37,side*(.98+j*.025),-.51+j*.48);g.fill();}
 }
 g.fillStyle=light;g.beginPath();path.moveTo(-.38,1.04);path.quadraticCurveTo(-.45,1.49,-.02,1.93);path.quadraticCurveTo(.13,1.39,.34,1.03);path.quadraticCurveTo(0,1.21,-.38,1.04);g.fill();g.restore();

return true;}
g.save();g.translate(P.hx,P.hy);g.scale(P.hr,P.hr);g.lineJoin='round';g.lineCap='round';
if(kind==='lm_gingham'){
 g.save();g.beginPath();g.moveTo(0,.95);g.quadraticCurveTo(-.85,.4,-.77,1.23);g.quadraticCurveTo(-.5,1.45,0,1.02);g.quadraticCurveTo(.85,1.5,.77,.7);g.quadraticCurveTo(.5,.55,0,.95);g.clip();g.fillStyle='#dddcc0';g.fillRect(-1,.4,2,1.2);g.fillStyle='#84977a';for(let i=-4;i<5;i++){g.fillRect(i*.23,.4,.11,1.2);g.fillRect(-1,.5+i*.23,2,.11)}g.restore();g.fillStyle='#617853';g.beginPath();g.ellipse(0,1,.16,.19,0,0,7);g.fill();
}else if(kind==='lm_daisy'){
 g.strokeStyle='#71855e';g.lineWidth=.13;g.beginPath();g.ellipse(0,-.84,.88,.25,0,0,7);g.stroke();for(let n=0;n<5;n++){const x=(n-2)*.4,y=-.94-Math.sin(n/4*Math.PI)*.17;g.fillStyle='#f8efcf';for(let j=0;j<5;j++){g.beginPath();g.ellipse(x+Math.cos(j*1.256)*.13,y+Math.sin(j*1.256)*.13,.12,.08,j*1.256,0,7);g.fill()}g.fillStyle='#c99a39';g.beginPath();g.arc(x,y,.09,0,7);g.fill()}
}else if(kind==='lm_kerchief'){
 g.fillStyle='#ba7654';g.beginPath();g.moveTo(-.75,.66);g.quadraticCurveTo(0,.98,.78,.65);g.lineTo(.18,1.58);g.quadraticCurveTo(-.3,1.37,-.75,.66);g.fill();g.strokeStyle='#e4c49b';g.lineWidth=.045;g.setLineDash([.08,.09]);g.beginPath();g.moveTo(-.5,.89);g.lineTo(.17,1.43);g.lineTo(.57,.9);g.stroke();g.setLineDash([]);g.fillStyle='#a86248';g.beginPath();g.ellipse(.77,.78,.2,.13,-.6,0,7);g.fill();
}else if(kind==='lm_bonnet'){
 g.fillStyle='#7e9baf';g.beginPath();g.moveTo(-.93,-.77);g.quadraticCurveTo(-.8,-1.78,.04,-1.53);g.quadraticCurveTo(.74,-1.5,1.05,-.57);g.quadraticCurveTo(.71,-.88,.57,-1.02);g.quadraticCurveTo(.32,-.65,-.93,-.77);g.fill();g.strokeStyle='#ebdfc3';g.lineWidth=.18;g.beginPath();g.moveTo(-.93,-.77);g.quadraticCurveTo(-.1,-1.05,.57,-1.02);g.stroke();g.fillStyle='#eee3c9';g.beginPath();g.arc(1.04,-.58,.19,0,7);g.fill();
}else if(kind==='lm_explorer'){
 g.fillStyle='#bc9862';g.beginPath();g.ellipse(0,-.88,1.2,.23,-.04,0,7);g.fill();g.fillStyle='#d7b883';g.beginPath();g.moveTo(-.73,-.92);g.lineTo(-.55,-1.55);g.quadraticCurveTo(0,-1.37,.55,-1.56);g.lineTo(.75,-.96);g.quadraticCurveTo(0,-.69,-.73,-.92);g.fill();g.strokeStyle='#687e55';g.lineWidth=.16;g.beginPath();g.moveTo(-.65,-1.08);g.quadraticCurveTo(0,-.9,.66,-1.1);g.stroke();
}
g.restore();return true;};
