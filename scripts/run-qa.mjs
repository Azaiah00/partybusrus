import fs from 'node:fs';import {spawnSync} from 'node:child_process';
const out='partybusrus.com-audit/2026-09-24/implementation';
fs.mkdirSync(out,{recursive:true});
const jobs=[['technical',['scripts/audit-site.mjs','--output',out+'/local-technical-qa.json']],['markup',['scripts/test-markup.mjs','--output',out+'/markup-qa.json']],['http',['scripts/test-http.mjs']],['quote',['scripts/test-quote.mjs']],['analytics',['scripts/test-analytics.mjs']],['service-worker',['scripts/test-service-worker.mjs']]];
const results=[];
for(const [name,args] of jobs){const r=spawnSync(process.execPath,args,{encoding:'utf8'});fs.writeFileSync(out+'/'+name+'-test-output.txt',(r.stdout||'')+(r.stderr||''));results.push({name,passed:r.status===0,exit_code:r.status,output:name+'-test-output.txt'});if(r.status!==0)console.log((r.stdout||r.stderr||'Failed').slice(-3000));}
const summary={generated_at:new Date().toISOString(),scope:'Local files and read-only preview. No real provider submission, deployment or GA4 receipt.',passed:results.every(x=>x.passed),results};fs.writeFileSync(out+'/final-qa-summary.json',JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));process.exitCode=summary.passed?0:1;
