import assert from 'node:assert/strict';
import path from 'node:path';
import { site, normalizeURL, normalizeHTML, normalizeSchema, resolvePath } from '../../../scripts/seo-maintenance.mjs';
const base = 'https://www.partybusrus.com/services/weddings';
for (const [input, expected] of [
  ['/quote.html?bus=35#form', '/quote?bus=35#form'],
  ['https://partybusrus.com/blog/index.html?ref=home#latest', 'https://www.partybusrus.com/blog?ref=home#latest'],
  ['/cities/tysons-mclean-va.html?x=1', '/cities/tysons-va?x=1'],
  ['/IMG_0894-768.webp?v=af1', '/IMG_0894-768.webp?v=af1'],
  ['tel:+17033994394', 'tel:+17033994394'],
  ['sms:+17033994394?body=hello', 'sms:+17033994394?body=hello'],
  ['mailto:info@partybusrus.com', 'mailto:info@partybusrus.com'],
  ['https://external.example/about.html?a=1#ok', 'https://external.example/about.html?a=1#ok'],
  ['#details', '#details'],
  ['/fleet/bus-40pax.html', '/fleet/bus-35pax'],
  ['/v2/services/weddings.html', '/services/weddings']
]) assert.equal(normalizeURL(input, base), expected, input);
assert.equal(resolvePath('/services/index.html'), '/services');
const schema = normalizeSchema({'@type':['LimousineService','LocalBusiness'],url:'https://partybusrus.com/',aggregateRating:{'@type':'AggregateRating'},review:[{'@type':'Review'}]},base);
assert.deepEqual(schema, {'@type':'LocalBusiness',url:'https://www.partybusrus.com/'});
assert.equal(normalizeSchema({'@type':'Product',name:'Vehicle guide'},base,true)['@type'],'Service');
const html = `<html><head><link rel="canonical" href="https://partybusrus.com/quote.html"><meta property="og:url" content="https://partybusrus.com/quote.html"><script>const a = '<a href="/leave-this.html">';</script><script type="application/ld+json">{"@type":"LimousineService","url":"https://partybusrus.com/quote.html"}</script></head><body><a href="/fleet.html?bus=35&amp;ref=a#details">Fleet</a></body></html>`;
const normalized = normalizeHTML(html,path.join(site,'quote.html'));
assert(normalized.includes(`const a = '<a href="/leave-this.html">';`));
assert(normalized.includes('href="/fleet?bus=35&amp;ref=a#details"'));
assert(normalized.includes('href="https://www.partybusrus.com/quote"'));
assert.equal(normalizeHTML(normalized,path.join(site,'quote.html')),normalized);
console.log('Passed all targeted URL/schema/HTML normalization assertions, including query/hash and script preservation plus idempotence. No production HTML changed.');
