import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { root, site, files, attrs, routeFor, decode } from './seo-maintenance.mjs';

// Source lint, not a browser or a substitute for HTML5 conformance/interaction testing.
// Inline code is compiled only; nothing from the site is executed.
const failures = [], warnings = [], inventory = [];
const failure = (file, code, detail) => failures.push({ file: path.relative(root, file), code, detail });
const warning = (file, code, detail) => warnings.push({ file: path.relative(root, file), code, detail });
const decodeAttribute = v => decode(v).replace(/&#(x[\da-f]+|\d+);/gi, (_, n) => String.fromCodePoint(n[0].toLowerCase() === 'x' ? parseInt(n.slice(1),16) : Number(n)));
const voidTags = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const optionalClose = new Set('p li dt dd option optgroup thead tbody tfoot tr td th'.split(' '));
const blockTags = new Set('address article aside blockquote div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hr main nav ol p pre section table ul'.split(' '));
function tokens(html) {
  const result = [];
  for (let start=0; start<html.length; start++) {
    if (html[start] !== '<' || !/[a-z/]/i.test(html[start+1] || '')) continue;
    let quote = null, end = start+1;
    for (; end<html.length; end++) {
      const c=html[end];
      if (quote) { if(c===quote)quote=null; }
      else if(c==='"'||c==="'")quote=c;
      else if(c==='>')break;
    }
    const raw=html.slice(start,end+1), match=raw.match(/^<(\/?)\s*([a-z][\w:-]*)/i);
    if(match)result.push({raw,close:!!match[1],tag:match[2].toLowerCase(),at:attrs(raw),offset:start});
    start=end;
  }
  return result;
}
function compile(file, code, label) {
  try { new vm.Script(code, { filename: path.relative(root,file)+':'+label }); }
  catch(e) { failure(file,'javascript_syntax',{label,error:e.message}); }
}
const htmlFiles=files().filter(f=>f.endsWith('.html'));
const compiledExternal=new Set();
for (const file of htmlFiles) {
  const source=fs.readFileSync(file,'utf8');
  const noComments=source.replace(/<!--[\s\S]*?-->/g,'');
  const scripts=[...noComments.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((m,i)=>({at:attrs(m[1]),body:m[2],position:m.index,index:i}));
  let inlineCount=0;
  for(const script of scripts) {
    if(script.at.type==='application/ld+json'||script.at.type==='application/json')continue;
    if(script.at.type==='module'){warning(file,'module_compile_not_covered',script.at.src||script.index);continue;}
    if(script.at.src) {
      if(script.at.src.startsWith('/')) {
        const local=path.resolve(site,'.'+script.at.src.split('?')[0]);
        if(!local.startsWith(site+path.sep)||!fs.existsSync(local)){failure(file,'missing_script',script.at.src);continue;}
        if(!compiledExternal.has(local)){compile(local,fs.readFileSync(local,'utf8'),'external');compiledExternal.add(local);}
      } else warning(file,'external_script_not_compiled',script.at.src);
    } else {compile(file,script.body,'inline-'+script.index);inlineCount++;}
  }
  const markup=noComments.replace(/<(script|style)\b([^>]*)>[\s\S]*?<\/\1>/gi,'<$1$2></$1>');
  const all=tokens(markup), stack=[], ids=new Map(), labels=[], controls=[];
  for(const token of all) {
    if(token.close) {
      const pos=stack.map(t=>t.tag).lastIndexOf(token.tag);
      if(pos<0){if(!optionalClose.has(token.tag))failure(file,'unmatched_close_tag',token.tag);continue;}
      const unclosed=stack.slice(pos+1).filter(t=>!optionalClose.has(t.tag));
      if(unclosed.length)failure(file,'unbalanced_markup',{closing:token.tag,unclosed:unclosed.map(t=>t.tag)});
      stack.splice(pos);continue;
    }
    if(token.at.id) {
      if(ids.has(token.at.id))failure(file,'duplicate_id',token.at.id);
      ids.set(token.at.id,token.tag);
    }
    if(token.tag==='label'&&token.at.for)labels.push(token.at.for);
    if(['input','select','textarea'].includes(token.tag)&&token.at.type!=='hidden')controls.push({id:token.at.id,name:token.at.name,label:token.at['aria-label']||token.at['aria-labelledby'],wrapped:stack.some(t=>t.tag==='label'),type:token.at.type});
    for(const [key,value] of Object.entries(token.at))if(/^on[a-z]+$/i.test(key))compile(file,`function handler(event){${decodeAttribute(value)}\n}`,'event-'+key);
    const top=stack[stack.length-1];
    if(top?.tag==='p'&&blockTags.has(token.tag))stack.pop();
    if(top?.tag==='li'&&token.tag==='li')stack.pop();
    if(!voidTags.has(token.tag)&&!token.raw.endsWith('/>'))stack.push(token);
  }
  const dangling=stack.filter(t=>!optionalClose.has(t.tag));
  if(dangling.length)failure(file,'unclosed_tags',dangling.map(t=>t.tag));
  for(const label of labels)if(!ids.has(label))failure(file,'label_target_missing',label);
  for(const control of controls)if(!control.label&&!control.wrapped&&!labels.includes(control.id)&&!['submit','button','reset'].includes(control.type))failure(file,'unlabeled_control',control.id||control.name||'unnamed');
  const mains=all.filter(t=>!t.close&&(t.tag==='main'||t.at.role==='main'));
  if(mains.length!==1)failure(file,'main_landmark_count',mains.length);
  const localScripts=scripts.map(s=>s.at.src?.split('?')[0]).filter(Boolean);
  const configIndex=localScripts.indexOf('/assets/analytics-config.js'),analyticsIndex=localScripts.indexOf('/assets/analytics.js');
  if(configIndex<0||analyticsIndex<0||configIndex>analyticsIndex)failure(file,'analytics_script_order',localScripts);
  for(const name of ['/assets/analytics-config.js','/assets/analytics.js','/assets/site-ui.js'])if(localScripts.filter(s=>s===name).length!==1)failure(file,'shared_script_count',name);
  for(const name of ['/assets/quote.js','/assets/quote-return.js'])if(localScripts.includes(name)&&localScripts.indexOf(name)<analyticsIndex)failure(file,'quote_before_analytics',name);
  for(const script of scripts.filter(s=>s.at.src?.startsWith('/assets/')))if(!/\bdefer\b/.test(noComments.match(new RegExp('<script\\b[^>]*src=["\']'+script.at.src.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'["\'][^>]*>'))?.[0]||''))warning(file,'shared_script_not_deferred',script.at.src);
  if(/function\s+gtag\s*\(|window\.fbq\s*=|ANALYTICS PLACEHOLDER|G-XXXXXXXX|GTM-XXXX|YOUR_PIXEL/i.test(source))failure(file,'legacy_tracking_placeholder','Old inline collector stub or placeholder remains');
  if(/alert\([^)]*(?:video|tour)|video tour coming|fake[-_ ]?availability|class=["'][^"']*\blive-now\b/i.test(noComments))failure(file,'misleading_video_or_availability','Fake player/availability marker requires review');
  const inlineJS=scripts.filter(s=>!s.at.src).map(s=>s.body).join('\n');
  if(/localStorage\s*(?:\.setItem|\[["']setItem["']\])\s*\(/.test(inlineJS))failure(file,'inline_localstorage_write','Review for PII; shared consent module is the only approved persistent writer');
  if(/(?:localStorage|sessionStorage)[\s\S]{0,100}JSON\.stringify\(\s*(?:new\s+FormData|Object\.fromEntries\(\s*new\s+FormData)/.test(inlineJS))failure(file,'form_serialization_to_storage','Entire form serialization may retain PII');
  inventory.push({file:path.relative(root,file),route:routeFor(file),main_landmarks:mains.length,inline_scripts:inlineCount,local_scripts:localScripts,controls:controls.length});
}
// Independently compile unreferenced frontend scripts too, including the service worker.
for(const file of files().filter(f=>f.endsWith('.js')))if(!compiledExternal.has(file)){compile(file,fs.readFileSync(file,'utf8'),'external');compiledExternal.add(file);}
const quote=fs.readFileSync(path.join(site,'assets/quote.js'),'utf8');
if(/localStorage\s*\.setItem\s*\(/.test(quote))failure(path.join(site,'assets/quote.js'),'quote_localstorage_write','Personal form data must not persist in localStorage');
const safeList=quote.match(/safeDraftFields\s*=\s*\[([^\]]*)\]/)?.[1];
if(!safeList)failure(path.join(site,'assets/quote.js'),'missing_draft_allowlist','Explicit non-contact draft allowlist not found');
else {
  const names=[...safeList.matchAll(/['"]([^'"]+)['"]/g)].map(m=>m[1]);
  const approved=['qfDate','qfTime','qfHeadcount','qfHours','qfEventType','qfVehicle'];
  if(names.some(n=>!approved.includes(n)))failure(path.join(site,'assets/quote.js'),'unsafe_draft_field',names);
}
const result={generated_at:new Date().toISOString(),scope:'Static source lint and JavaScript compile only; no website code executed, no browser or form submission',passed:failures.length===0,pages:htmlFiles.length,external_scripts_compiled:compiledExternal.size,failure_count:failures.length,warning_count:warnings.length,failures,warnings,inventory};
const index=process.argv.indexOf('--output');
if(index>=0){const target=path.resolve(process.argv[index+1]);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(result,null,2)+'\n');}
console.log(JSON.stringify(index>=0?{passed:result.passed,pages:result.pages,external_scripts_compiled:result.external_scripts_compiled,failure_count:failures.length,warning_count:warnings.length,failures:failures.slice(0,20)}:result,null,2));
process.exitCode=failures.length?1:0;
