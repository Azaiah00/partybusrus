import fs from 'node:fs';
for(const folder of ['cities','services'])for(const name of fs.readdirSync('site/'+folder).filter(n=>n.endsWith('.html')&&n!=='index.html')){
 const p='site/'+folder+'/'+name;let s=fs.readFileSync(p,'utf8'),slug=name.slice(0,-5),key=folder==='cities'?'area':'event';
 s=s.replace(/<header class="page-hero"[^>]*>[\s\S]*?<\/header>/,(header)=>{
  if(/class="(?:btn|pill)/.test(header))return header;
  return header.replace(/(<\/p>)([\s\S]*?)(<\/div>\s*<\/header>)$/,`$1<div class="refined-hero-action"><a class="btn gold" href="/quote?${key}=${slug}">Request a Quote →</a></div>$2$3`);
 });
 s=s.replace(/Request a ([^<]+) Quote/g,'Request a Quote for $1');
 fs.writeFileSync(p,s);
}
let p='site/services/index.html',s=fs.readFileSync(p,'utf8');s=s.replace('Wedding Portfolio<small>See real weddings</small>','Wedding Photo Gallery<small>Vehicle photographs</small>');fs.writeFileSync(p,s);
p='site/reviews.html';s=fs.readFileSync(p,'utf8').replaceAll('Reviews & Testimonials','Reviews & Feedback');fs.writeFileSync(p,s);
p='site/index.html';s=fs.readFileSync(p,'utf8').replace('<span class="bdg">Star Ceiling</span>','<span class="bdg">24-passenger option</span>');s=s.replace(/<!-- TICKER -->[\s\S]*?(?=<section class="stats")/,'');fs.writeFileSync(p,s);
console.log('Service and city hero quote links added; proof wording aligned.');
