import fs from 'node:fs';
const root=new URL('../',import.meta.url),file=new URL('index.html',root);let html=fs.readFileSync(file,'utf8');
for(const [name,pattern,wrap] of [['home.js',/\/\* NEO_HOME_BEGIN \*\/[\s\S]*?\/\* NEO_HOME_END \*\//,x=>'/* NEO_HOME_BEGIN */\n'+x+'\n/* NEO_HOME_END */'],['home.css',/<style id="neo-home-style">[\s\S]*?<\/style>/,x=>'<style id="neo-home-style">'+x+'</style>']]){
if(!pattern.test(html))throw Error('Missing '+name+' marker');html=html.replace(pattern,()=>wrap(fs.readFileSync(new URL('ui/'+name,root),'utf8')));}
fs.writeFileSync(file,html);
