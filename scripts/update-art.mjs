import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const file=new URL('index.html',root);
const html=await readFile(file,'utf8');
const art=await readFile(new URL('art/scenery.js',root),'utf8');
const marker=/\n\/\* NEO_SCENERY_BEGIN \*\/\n[\s\S]*?\n\/\* NEO_SCENERY_END \*\/\n/;
if(!marker.test(html))throw Error('Scenery marker missing');
await writeFile(file,html.replace(marker,()=> '\n/* NEO_SCENERY_BEGIN */\n'+art+'\n/* NEO_SCENERY_END */\n'));
