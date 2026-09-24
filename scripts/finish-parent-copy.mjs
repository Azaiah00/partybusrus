import fs from 'node:fs';
const files=['index','fleet','contact','privacy',...['20','24','25','28','30','32','35'].map(n=>'fleet/bus-'+n+'pax')];
for(const p of files){let s=fs.readFileSync('site/'+p+'.html','utf8');let desc=p==='index'?'Party bus rentals for weddings, prom, nights out and winery trips in DC, Maryland and Northern Virginia. Compare the fleet and request a custom quote.':p==='fleet'?'Compare Party Bus R Us fleet options for groups of 20–35 in DC, Maryland and Northern Virginia. Explore photographs and request your preferred vehicle.':p==='contact'?'Contact Party Bus R Us by phone, text or email about party bus rentals in DC, Maryland and Northern Virginia. Share your date, group size and pickup city.':p==='privacy'?'Learn how the Party Bus R Us website handles quote requests, temporary trip drafts, source information and optional analytics choices.':`Explore the listed ${p.match(/bus-(\d+)/)[1]}-passenger party bus option from Party Bus R Us. View photographs and request a vehicle preference for your DMV trip.`;
s=s.replace(/(<meta\b[^>]*(?:name="description"|property="og:description"|name="twitter:description")[^>]*content=")[^"]*("[^>]*>)/g,'$1'+desc+'$2');
if(p==='index'){
 s=s.replaceAll("Party Bus R Us | DMV's Premier Party Bus &amp; Limo Bus Fleet",'Party Bus Rentals in DC, Maryland &amp; Northern VA | Party Bus R Us');
 s=s.replace(/<div class="ds">[^<]*<\/div>/g,'<div class="ds">Explore the interior photographs and ask about the vehicle and features available for your date.</div>').replace(/<div class="am">[\s\S]*?<\/div>/g,'');
 s=s.replaceAll('Party bus at night in the DMV','Black party bus exterior in daylight').replace('Party bus night','Black party bus exterior').replace('Flagship · Largest','35-passenger option');
}
fs.writeFileSync('site/'+p+'.html',s);
}
console.log('Parent metadata and proof copy aligned.');
