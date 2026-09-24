import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve('site'),config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json')));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'};
http.createServer((req,res)=>{
 try{
  const u=new URL(req.url,'http://localhost');let p=decodeURIComponent(u.pathname);
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end('Preview is read-only. No quote submitted.')}
  const helpers={'/__qa/axe.js':['node_modules/axe-core/axe.min.js','.verify/node_modules/axe-core/axe.min.js'],'/__qa/check.js':['scripts/preview-a11y.js']};
  if(helpers[p]){
   const helper=helpers[p].find(f=>fs.existsSync(f));
   if(!helper){res.writeHead(503,{'Content-Type':'text/plain','Cache-Control':'no-store'});return res.end('Optional accessibility dependency missing. Run npm ci, then reload the QA page.')}
   res.writeHead(200,{'Content-Type':'application/javascript','Cache-Control':'no-store'});
   return res.end(req.method==='HEAD'?undefined:fs.readFileSync(helper));
  }
  if(p.startsWith('/v2/'))p=p.slice(3);let r=config.redirects.find(r=>r.source===p);
  if(r){res.writeHead(308,{Location:r.destination+u.search});return res.end()}
  if(p.endsWith('.html')||p.length>1&&p.endsWith('/')){res.writeHead(308,{Location:(p.replace(/\/index\.html$/,'/').replace(/\.html$/,'').replace(/\/$/,'')||'/')+u.search});return res.end()}
  let f=path.resolve(root,'.'+p);
  if(f!==root&&!f.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
  if(!path.extname(f)&&fs.existsSync(f+'.html'))f+='.html';else if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');else if(!fs.existsSync(f)&&!path.extname(f))f+='.html';
  const status=fs.existsSync(f)?200:404;if(status===404)f=path.join(root,'404.html');
  res.writeHead(status,{'Content-Type':types[path.extname(f).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
  if(req.method==='HEAD')return res.end();
  if(u.searchParams.get('qa')==='1'&&f.endsWith('.html'))return res.end(fs.readFileSync(f,'utf8').replace('</head>','<script defer src="/__qa/axe.js"></script><script defer src="/__qa/check.js"></script></head>'));
  fs.createReadStream(f).pipe(res);
 }catch{res.writeHead(400);res.end('Bad request')}
}).listen(4173,'127.0.0.1',()=>console.log('Website preview: http://127.0.0.1:4173'));
