import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require('../.verify/node_modules/sharp');
const root=path.resolve('site');
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.name.startsWith('.')?[]:e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
function removeDiv(html,id){const start=html.search(new RegExp('<div[^>]*id="'+id+'"[^>]*>'));if(start<0)return html;const re=/<\/?div\b[^>]*>/g;re.lastIndex=start;let depth=0,m;while((m=re.exec(html))){depth+=m[0].startsWith('</')?-1:1;if(!depth)return html.slice(0,start)+html.slice(re.lastIndex)}throw Error('Unclosed '+id)}
const dims=new Map(); let images=0;
for(const file of walk(root).filter(f=>f.endsWith('.html')&&(!process.argv[2]||path.relative(root,f).replaceAll('\\','/')===process.argv[2]))){
 let s=fs.readFileSync(file,'utf8');
 s=s.replace(/<!-- ====== ANALYTICS SCAFFOLDING[\s\S]*?END ANALYTICS SCAFFOLDING ====== -->/g,'').replace(/<!-- ====== CONVERSION \+ INTERACTION EVENT TRACKING[\s\S]*?END EVENT TRACKING ====== -->/g,'');
 s=s.replace(/<noscript>\s*<iframe[^>]*googletagmanager[\s\S]*?<\/noscript>/g,'');
 s=s.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/g,(tag,attrs,code)=>{
  if(/application\/ld\+json/.test(attrs))return tag;
  if(/afterglow\.js|gsap|ScrollTrigger/.test(attrs)||/gsap\.|ScrollTrigger|Availability banner|beforeinstallprompt|liveNow|gtag\(|fbq\(/.test(code))return '';
  return tag;
 });
 s=removeDiv(s,'availBanner');s=removeDiv(s,'liveNow');
 s=s.replace(/<link\b[^>]*https:\/\/fonts\.(?:googleapis|gstatic)\.com[^>]*>/g,'').replace(/<noscript>\s*<\/noscript>/g,'');
 s=s.replace(/<link\b[^>]*href="\/assets\/refined\.css[^>]*>/g,'').replace(/<script[^>]*src="\/assets\/(?:analytics-config|analytics|site-ui)\.js[^>]*><\/script>/g,'');
 s=s.replace(/(href="\/(?:assets\/afterglow|mobile)\.css)(?:\?[^" ]*)?"/g,'$1?v=20260924"');
 s=s.replace('</head>','<link rel="stylesheet" href="/assets/refined.css?v=20260924">\n<script defer src="/assets/analytics-config.js?v=20260924"></script>\n<script defer src="/assets/analytics.js?v=20260924"></script>\n<script defer src="/assets/site-ui.js?v=20260924"></script>\n</head>');
 s=s.replace(/Operating 24\/7 across/g,'Serving').replace(/24\/7\s*\|\s*DC\s*[·&]\s*MD\s*[·&]\s*VA/g,'DC · MD · Northern Virginia').replace(/24\/7 Dispatch/gi,'Trip inquiries').replace(/Available 24\/7/gi,'Call about your trip');
 s=s.replace(/href="\/services\/?(?:index\.html)?">(<b>)?All Locations/gi,'href="/cities">$1All Locations');
 s=s.replace(/<a\b[^>]*href="\/contact(?:\.html)?"[^>]*>G<\/a>/g,'');
 if(/<main\b/.test(s)&&!s.includes('class="skip-link"')){s=s.replace(/<main\b(?:\s+id="main-content")?>/,'<main id="main-content" tabindex="-1">');s=s.replace(/<body([^>]*)>/,'<body$1>\n<a class="skip-link" href="#main-content">Skip to content</a>');}
 s=s.replace(/(\bsrc=")([^"?]+)\.(?:jpg|jpeg)(\?[^" ]*)?"/gi,(tag,start,stem,query)=>fs.existsSync(path.join(root,stem+'.webp'))?start+stem+'.webp'+(query||'')+'"':tag);
 const tags=[...s.matchAll(/<img\b[^>]*>/g)].map(m=>m[0]);
 for(const tag of tags){const src=tag.match(/\bsrc="([^"?]+)(?:\?[^"]*)?"/);if(!src||!src[1].startsWith('/'))continue;const p=path.join(root,src[1]);if(!fs.existsSync(p))continue;
  let meta=dims.get(p);if(!meta){try{meta=await sharp(p).metadata();dims.set(p,meta)}catch{continue}}
  let next=tag;if(!/\bwidth=/.test(next))next=next.replace(/\s*\/?\s*>$/,` width="${meta.width}" height="${meta.height}">`);else if(!/\bheight=/.test(next))next=next.replace(/\s*>$/,` height="${meta.height}">`);
  if(!/\bdecoding=/.test(next))next=next.replace(/>$/,' decoding="async">');
  if(!/\bloading=|fetchpriority="high"/.test(next)&&!/(logo|wordmark)/.test(src[1]))next=next.replace(/>$/,' loading="lazy">');
  if(next!==tag){s=s.replace(tag,next);images++}
 }
 s=s.replace(/\bfont-family:\s*(["'])Cormorant Garamond\1\s*,?\s*(?:Georgia,)?\s*serif/gi,'font-family:Inter,Arial,sans-serif');
 fs.writeFileSync(file,s);
}
const css=path.join(root,'assets/afterglow.css');let c=fs.readFileSync(css,'utf8');c=c.replace(/@import\s+url\([^;]+\);/g,'');fs.writeFileSync(css,c);
console.log('Shared integration complete; enhanced image tags: '+images);
