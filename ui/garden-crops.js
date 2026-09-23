(function(root){
 'use strict';
 // A shallow overhead ground plane: every seed, sprout and mature plant
 // uses the same six planting positions. Art never changes the tap target.
 root.CoveGardenCrops={draw(key,ready,stage=ready?3:1){
  const soil='<path d="M13 21Q10 21 10 26L8 75Q8 80 14 80H107Q113 80 112 74L110 26Q110 21 104 21Z" fill="#799258" opacity=".3"/><path d="M14 20H105L109 73Q109 77 104 77H15Q11 77 11 72Z" fill="#8b6849"/><path d="M16 23H102L106 71H14Z" fill="#a17b51"/>'+[35,53,71].map(y=>`<path d="M17 ${y}Q60 ${y-2} 103 ${y}" fill="none" stroke="#775638" stroke-width="3"/><path d="M18 ${y-3}Q60 ${y-5} 102 ${y-3}" fill="none" stroke="#b69466" stroke-width="1.5"/>`).join('');
  const leaf=(x,y,r,fill)=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="10" transform="rotate(${r} ${x} ${y})" fill="${fill}"/>`;
  let art='';
  for(const [i,[x,y]] of [[31,35],[60,35],[89,35],[31,57],[60,57],[89,57]].entries()){
   if(!key)continue;
   if(key==='honey')break;
   const scale=stage===0?.46:stage===1?.67:stage===2?.86:1;
   let plant='<ellipse cy="2" rx="11" ry="4" fill="#574d32" opacity=".18"/>';
   if(key==='carrot'){
    if(ready)plant+='<ellipse cy="0" rx="5" ry="4" fill="#d79a57"/>';
    plant+=leaf(-4,-7,-35,'#648750')+leaf(4,-8,32,'#81994f')+leaf(0,-11,0,'#78974e');
   }else if(key==='pumpkin'){
    plant+='<path d="M-9 0Q0-7 10 0" fill="none" stroke="#68844c" stroke-width="2"/>'+leaf(-6,-5,-55,'#829154');
    if(ready)plant+='<ellipse cy="-4" rx="10" ry="8" fill="#bb8047"/><ellipse cy="-4" rx="6" ry="8" fill="#d9a162"/><path d="M0-12 1-15" stroke="#5d7347" stroke-width="2"/>';
   }else{
    plant+='<path d="M0 1V-17" stroke="#756347" stroke-width="2"/>'+leaf(-5,-9,-48,'#698754')+leaf(5,-13,48,'#82995c')+leaf(-4,-19,-38,'#90a46b');
    if(ready&&key==='coffee')plant+='<g fill="#b76d50"><circle cx="-6" cy="-8" r="2.6"/><circle cx="4" cy="-13" r="2.6"/><circle cx="2" cy="-4" r="2.6"/></g>';
    if(ready&&key==='berry')plant+='<g fill="#a6667a"><circle cx="-5" cy="-7" r="3.5"/><circle cx="5" cy="-12" r="3.5"/><circle cx="3" cy="-3" r="3.5"/></g>';
    if(ready&&key==='catmint')plant+='<path d="M-4-19v-7M3-15v-8" stroke="#ad9dbe" stroke-width="4"/>';
   }
   art+=`<g transform="translate(${x} ${y+6}) scale(${scale})">${plant}</g>`;
  }
  if(key==='honey')art='<ellipse cx="61" cy="63" rx="25" ry="8" fill="#5b5837" opacity=".18"/><path d="M40 30H81V65H40Z" fill="#c5a16c"/><path d="M39 39H82M39 49H82M39 59H82" stroke="#9a794e" stroke-width="2"/><path d="M35 30 60 16 86 30Z" fill="#698262"/><path d="M55 65V56Q60 49 66 56V65" fill="#64533c"/>';
  return `<svg viewBox="0 0 120 90" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">${soil}${art}</svg>`;
 }};
})(globalThis);
