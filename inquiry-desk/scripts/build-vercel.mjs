import {readFile,copyFile,writeFile} from 'node:fs/promises';
// CLI packages are prepared with the canonical shared parser. Full-repository
// builds regenerate it directly; a missing parser is always a build failure.
try{await writeFile('lib/formsubmit-core.mjs',(await readFile('../integrations/formsubmit-sheet-sync/Core.gs','utf8'))+'\nexport default FormSubmitSyncCore;\n');}
catch(e){if(e.code!=='ENOENT')throw e;await readFile('lib/formsubmit-core.mjs','utf8');}
await copyFile('lib/model.mjs','public/model.mjs');await copyFile('lib/workflow.mjs','public/workflow.mjs');
const html=await readFile('public/index.html','utf8');if(!html.includes('noindex,nofollow'))throw Error('Private desk must remain noindex.');
for(const path of ['app.js','app.css','sw.js','manifest.webmanifest','icon.svg','icon-192.png','icon-512.png','icon-maskable.png'])await readFile('public/'+path);
console.log('Vercel package ready. Access gate and private storage must be verified before activation.');
