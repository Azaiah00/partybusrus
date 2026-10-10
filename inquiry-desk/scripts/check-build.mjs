import {readFile,copyFile,writeFile} from 'node:fs/promises';
const store=process.argv.includes('--production')?'inquiry-production-v1':'inquiry-preview-v1';
await writeFile('lib/deployment.mjs',`// Generated server-only deployment target.\nexport const STORE_NAME = ${JSON.stringify(store)};\n`);
await copyFile('lib/model.mjs','public/model.mjs');
const html=await readFile('public/index.html','utf8');
for(const path of ['app.js','app.css','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','icon-maskable.png'])await readFile('public/'+path);
if(!html.includes('noindex,nofollow'))throw new Error('Private desk must remain noindex.');
console.log('Build complete for '+store+'. Public files contain application code only; private records are served by the gated API.');
