import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {documentRepository} from '../lib/documents.mjs';
import {createHandler} from '../netlify/functions/desk.mjs';
import {createRecord} from '../lib/model.mjs';
const values=new Map();
const store={async list({prefix}){return {blobs:[...values.keys()].filter(k=>k.startsWith(prefix)).map(key=>({key}))};},async get(key){return values.has(key)?structuredClone(values.get(key)):null;},async setJSON(key,value,{onlyIfNew}={}){if(onlyIfNew&&values.has(key))return {modified:false};values.set(key,structuredClone(value));return {modified:true};}};
const repository=documentRepository(store);
for(let i=0;i<12;i++){
 const r=createRecord({customer:`Example Guest ${String(i+1).padStart(2,'0')}`,channel:'Web quote',status:i===1?'Quoted':'',recordType:i===11?'Test':'Inquiry',tripDate:'2026-11-14',event:i%2?'Birthday':'Wedding',phone:'2025550100',email:'guest@example.test',groupingNeedsReview:i===2||i===3},`00000000-0000-4000-8000-${String(i).padStart(12,'0')}`,'2026-10-06');
 r.submissions=[{receivedDate:'2026-10-06',channel:'Web quote',referrer:i===0?'https://chatgpt.com/':'',sourcePage:'/quote',evidence:'FICTIONAL QA RECORD. No customer contact.'}];
 await repository.create(r);
}
await store.setJSON('metadata',{capture:{state:'Not configured'},history:{through:'2026-10-06',fixture:true}});
const handler=createHandler({repository:()=>repository,isEnabled:()=>true});
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.txt':'text/plain'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1:4180');
  if(url.pathname==='/api/desk'){
   let body='';for await(const chunk of req)body+=chunk;
   const result=await handler(new Request(url,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:body}));
   res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());return;
  }
  const base=path.resolve('public');const file=path.resolve(base,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
  if(!file.startsWith(base+path.sep))throw Error('Invalid path');
  const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);
 }catch{res.writeHead(404);res.end('Not found');}
});
server.listen(4180,'127.0.0.1',()=>console.log('Synthetic inquiry desk QA: http://127.0.0.1:4180'));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit()));
