import {readFile,mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import path from 'node:path';import {execFileSync} from 'node:child_process';
import {recoveryPlan,recoverEmptyStore} from '../lib/recovery.mjs';
const [file,storeName,mode]=process.argv.slice(2);
if(!file)throw Error('Usage: node scripts/recover-backup.mjs <private-backup.json> [inquiry-recovery-NAME] [--apply]');
const text=await readFile(file,'utf8');const plan=recoveryPlan(text);
console.log(`Validated ${plan.length-1} records. No customer data printed.`);
if(mode==='--apply'){
 if(!/^inquiry-recovery-[a-z0-9-]{1,60}$/.test(storeName||''))throw Error('Use a new isolated inquiry-recovery-NAME store; live and preview stores are forbidden.');
 const cli=process.env.NETLIFY_CLI_PATH;if(!cli)throw Error('Set NETLIFY_CLI_PATH to the installed official Netlify CLI entrypoint.');
 const temp=await mkdtemp(path.join(tmpdir(),'pbru-recovery-'));
 const run=args=>execFileSync(process.execPath,[cli,...args],{encoding:'utf8',timeout:300000,stdio:['ignore','pipe','pipe']});
 let sequence=0;
 const store={
  async list(){const result=JSON.parse(run(['blobs:list',storeName,'--json']));const blobs=Array.isArray(result)?result:result.blobs;if(!Array.isArray(blobs))throw Error('Unknown listing response');return {blobs:blobs.map(b=>typeof b==='string'?{key:b}:b)};},
  async setJSON(key,value){const listing=await this.list();if(listing.blobs.some(b=>b.key===key))return {modified:false};const file=path.join(temp,'record.json');await writeFile(file,JSON.stringify(value));run(['blobs:set',storeName,key,'--input',file]);return {modified:true};},
  async get(key){const file=path.join(temp,`verified-${sequence++}.json`);run(['blobs:get',storeName,key,'--output',file]);return JSON.parse(await readFile(file,'utf8'));}
 };
 try{console.log(await recoverEmptyStore(store,text));}catch{throw Error('Recovery stopped. Inspect the isolated recovery store; the live store was not touched.');}finally{if(path.dirname(path.resolve(temp))===path.resolve(tmpdir())&&path.basename(temp).startsWith('pbru-recovery-'))await rm(temp,{recursive:true,force:true});}
}else console.log('Dry run only. To recover, supply an empty inquiry-recovery-NAME store and --apply.');
