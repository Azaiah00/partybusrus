import fs from 'node:fs';import path from 'node:path';
import {files,site,routeFor,resolvePath,attrs,config,ownURL} from './seo-maintenance.mjs';
const base='http://127.0.0.1:4173',checks=[],failures=[];
const pages=files().filter(f=>f.endsWith('.html'));const assets=new Set(['/assets/fonts/fonts.css','/assets/refined.css','/sw.js','/robots.txt','/sitemap.xml']);
for(const f of pages){const html=fs.readFileSync(f,'utf8');checks.push({url:routeFor(f),status:200,type:'page'});for(const m of html.matchAll(/<(?:img|script|link|source)\b[^>]*>/g)){const a=attrs(m[0]);const u=a.src||(['stylesheet','icon','preload','manifest','apple-touch-icon'].includes(a.rel)&&a.href);if(u&&ownURL(u))assets.add(new URL(u,'https://www.partybusrus.com').pathname+(new URL(u,'https://www.partybusrus.com').search||''));}}
for(const f of files().filter(f=>f.endsWith('.css'))){const css=fs.readFileSync(f,'utf8');for(const m of css.matchAll(/url\(\s*['"]?([^)'"\s]+)['"]?\s*\)/g)){if(m[1].startsWith('/')&&!m[1].startsWith('//'))assets.add(m[1]);}}
for(const url of assets)checks.push({url,status:200,type:'asset'});
for(const r of config.redirects.filter(r=>!r.source.includes(':')&&!r.source.startsWith('/v2')))checks.push({url:r.source+'?qa_preserve=1',status:308,location:r.destination+'?qa_preserve=1',type:'redirect'});
checks.push({url:'/this-page-does-not-exist-qa',status:404,type:'404'});
let next=0;await Promise.all(Array.from({length:8},async()=>{while(next<checks.length){const c=checks[next++];try{const r=await fetch(base+c.url,{method:'HEAD',redirect:c.type==='redirect'?'manual':'follow'});c.actual=r.status;if(r.status!==c.status||c.location&&r.headers.get('location')!==c.location)failures.push({...c,actualLocation:r.headers.get('location')});}catch(e){failures.push({...c,error:e.message})}}}));
const result={scope:'Local read-only preview HTTP; does not submit forms or verify Vercel production routing',generated_at:new Date().toISOString(),passed:!failures.length,check_count:checks.length,page_count:pages.length,asset_count:assets.size,failures};
fs.writeFileSync('partybusrus.com-audit/2026-09-24/implementation/http-qa.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));process.exitCode=failures.length?1:0;
