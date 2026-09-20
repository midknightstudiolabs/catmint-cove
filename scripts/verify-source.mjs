import fs from 'node:fs';import crypto from 'node:crypto';import path from 'node:path';
const root=new URL('../',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('source-sync.json',root)));const source=process.argv[2];
if(!source)throw Error('Pass the original game folder to verify-source.mjs');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
if(hash(path.join(source,'index.html'))!==manifest.sourceIndexSha256)throw Error('Claude source changed: merge the new changes before publishing Neo.');
for(const [name,expected]of Object.entries(manifest.assets)){if(hash(path.join(source,name))!==expected||hash(new URL(name,root))!==expected)throw Error('Audio source out of sync: '+name);}
for(const [name,expected]of Object.entries(manifest.neoAssets||{})){if(hash(new URL(name,root))!==expected)throw Error("Neo audio changed: "+name);}
console.log('PASS: Claude source and latest audio match the recorded synchronization baseline.');
