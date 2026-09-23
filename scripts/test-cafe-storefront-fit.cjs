const fs=require('node:fs'),assert=require('node:assert/strict');
const source=fs.readFileSync('ui/cafe-kiosk.js','utf8');
const fit=source.match(/cap=(Math\.max\(1,floor-top-24\)\/420)/);
assert(fit,'Storefront must fit available height rather than enforce a minimum zoom');
const cap=new Function('floor','top','return '+fit[1]);
for(const [width,height,top,dock] of [[1506,989,370,110],[1024,768,290,78],[768,1024,320,78],[390,844,240,92],[320,568,260,58]]){
 const floor=height-dock,css=Math.min(width/720,cap(floor,top));
 const vh=height/css,bandPx=420*css;
 const offset=Math.max(0,Math.min(vh-420,((top+Math.max(top+bandPx,floor))/2-bandPx/2)/css));
 assert(offset*css>=top,'Scene must clear header');
 assert((offset+420)*css<=floor,'Full scene must clear dock');
 assert((offset+390)*css<floor-12,'Queue paws must remain visible');
}
assert(fs.readFileSync('ui/cafe-kiosk.css','utf8').includes(':has(.cc-service-progress:not([hidden])) .cc-visit-hint{display:none}'));
console.log('PASS: storefront and queue fit tablet/phone bounds; active progress excludes entrance hint.');
