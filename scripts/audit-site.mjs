import fs from 'node:fs';
import path from 'node:path';
import { root, site, origin, files, attrs, ownURL, normalizeURL, routeFor, resolvePath, decode, config } from './seo-maintenance.mjs';

const failures = [], warnings = [], pages = [], routeMap = new Map(), edges = new Map();
const fail = (code, file, detail) => failures.push({ code, file: path.relative(root, file), detail });
const warn = (code, file, detail) => warnings.push({ code, file: path.relative(root, file), detail });
const htmlFiles = files().filter(f => f.endsWith('.html'));
const contents = new Map(htmlFiles.map(f => [f, fs.readFileSync(f, 'utf8')]));
for (const file of htmlFiles) routeMap.set(routeFor(file), file);
function localTarget(url) {
  const decoded = decodeURIComponent(url.pathname);
  const target = path.resolve(site, '.' + decoded);
  if (target !== site && !target.startsWith(site + path.sep)) return null;
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return target;
  return routeMap.get(resolvePath(decoded)) || null;
}
function inspectReference(value, file, kind, requireCanonical = false) {
  const base = origin + routeFor(file);
  // Fragment-only anchors still need an existence check.
  const u = value.startsWith('#') ? new URL(value, base) : ownURL(value, base);
  if (!u) return;
  const target = localTarget(u);
  if (!target) { fail('missing_internal_' + kind, file, value); return; }
  if (requireCanonical && normalizeURL(value, base) !== value && !value.startsWith('#')) fail('redirecting_internal_link', file, value);
  if (kind === 'link' && target.endsWith('.html')) {
    edges.get(routeFor(file)).add(routeFor(target));
    if (u.hash && u.hash !== '#') {
      const id = decodeURIComponent(u.hash.slice(1));
      const ids = [...contents.get(target).matchAll(/\b(?:id|name)=(['"])(.*?)\1/g)].map(m => decode(m[2]));
      if (!ids.includes(id)) fail('missing_anchor', file, value);
    }
  }
}
function walkSchema(value, file) {
  if (Array.isArray(value)) { value.forEach(v => walkSchema(v, file)); return; }
  if (!value || typeof value !== 'object') return;
  const types = [].concat(value['@type'] || []);
  if (types.includes('LimousineService')) fail('unsupported_schema_type', file, 'LimousineService');
  if (types.some(t => ['Review', 'AggregateRating'].includes(t)) || value.aggregateRating || value.review || value.reviews) fail('unverified_review_schema', file, types.join(','));
  if (routeFor(file).startsWith('/fleet/bus-') && types.includes('Product')) fail('fleet_product_schema', file, 'Use the truthful Service representation');
  for (const [key, v] of Object.entries(value)) {
    if (typeof v === 'string' && /^https?:\/\//.test(v) && ownURL(v)) {
      if (normalizeURL(v, origin, true) !== v) fail('noncanonical_schema_url', file, key + ': ' + v);
    } else walkSchema(v, file);
  }
}
const titleGroups = new Map(), descriptionGroups = new Map();
for (const file of htmlFiles) {
  const html = contents.get(file), route = routeFor(file), canonical = origin + resolvePath(route), redirected = route !== resolvePath(route);
  edges.set(route, new Set());
  const tags = [...html.replace(/<!--([\s\S]*?)-->/g, '').replace(/<(script|style)\b([^>]*)>[\s\S]*?<\/\1>/gi, '<$1$2></$1>').matchAll(/<[a-z][^>]*>/gi)].map(m => ({ tag: m[0], at: attrs(m[0]) }));
  const meta = name => tags.filter(t => /^<meta\b/i.test(t.tag) && t.at.name === name).map(t => t.at.content || '');
  const linkCanonical = tags.filter(t => /^<link\b/i.test(t.tag) && t.at.rel === 'canonical').map(t => t.at.href);
  const title = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)].map(m => m[1].trim());
  const noindex = meta('robots').some(v => /noindex/i.test(v));
  const description = meta('description');
  if (title.length !== 1 || !title[0]) fail('title', file, title);
  if (description.length !== 1 || !description[0]) fail('description', file, description);
  if (linkCanonical.length !== 1 || linkCanonical[0] !== canonical) fail('canonical', file, { expected: canonical, actual: linkCanonical });
  if ([...html.matchAll(/<h1\b/gi)].length !== 1) fail('h1_count', file, 'Expected one H1');
  if (!meta('viewport').some(v => /width=device-width/.test(v))) fail('viewport', file, 'Missing responsive viewport');
  const og = tags.filter(t => t.at.property === 'og:url').map(t => t.at.content);
  if (og.length !== 1 || og[0] !== canonical) fail('og_url', file, { expected: canonical, actual: og });
  if (!noindex && !redirected) {
    for (const [map, value] of [[titleGroups, title[0]], [descriptionGroups, description[0]]]) { const group = map.get(value) || []; group.push(file); map.set(value, group); }
  }
  for (const {tag, at} of tags) {
    if (/^<a\b/i.test(tag) && at.href) inspectReference(at.href, file, 'link', true);
    if (/^<(script|img|source|video|audio|iframe)\b/i.test(tag) && at.src) inspectReference(at.src, file, 'asset');
    if (/^<link\b/i.test(tag) && ['stylesheet', 'icon', 'manifest', 'apple-touch-icon', 'preload'].includes(at.rel) && at.href) inspectReference(at.href, file, 'asset');
    if (at.poster) inspectReference(at.poster, file, 'asset');
    if (at.srcset && !at.srcset.startsWith('data:')) for (const item of at.srcset.split(',')) inspectReference(item.trim().split(/\s+/)[0], file, 'srcset');
    if (/^<img\b/i.test(tag) && at.alt === undefined) fail('missing_alt', file, at.src);
    if (/^<img\b/i.test(tag) && (!at.width || !at.height)) warn('image_dimensions', file, at.src);
    if (at.onclick && /location\.href/.test(at.onclick) && !/^<a\b/i.test(tag)) warn('javascript_navigation', file, at.onclick);
    if (at.hreflang && at.href !== normalizeURL(at.href, canonical, true)) fail('noncanonical_hreflang', file, at.href);
  }
  for (const m of html.matchAll(/url\(\s*(['"]?)([^'"\)]+)\1\s*\)/g)) if (!m[2].includes('${')) inspectReference(m[2], file, 'css_asset');
  const schemas = [...html.matchAll(/<script\b[^>]*type=(['"])application\/ld\+json\1[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of schemas) { try { walkSchema(JSON.parse(m[2]), file); } catch(e) { fail('schema_json', file, e.message); } }
  if (!noindex && !redirected && schemas.length === 0) fail('missing_schema', file, 'No JSON-LD');
  const visible = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]*>/g, ' ');
  for (const pattern of [/most[- ]booked/gi, /industry typical/gi, /we owe you/gi, /full refund\s+30/gi, /50% refund/gi, /parent[- ]vetted/gi, /background[- ]checked/gi, /inspected weekly/gi, /ABRA permit/gi]) {
    const hits = [...visible.matchAll(pattern)].map(m => m[0]);
    if (hits.length) warn('claim_requires_evidence', file, [...new Set(hits)].join(', '));
  }
  pages.push({ file: path.relative(root, file), route, canonical, noindex, redirected, title: title[0], schema_blocks: schemas.length });
}
for (const [kind, map] of [['duplicate_title', titleGroups], ['duplicate_description', descriptionGroups]]) for (const [value, group] of map) if (group.length > 1) fail(kind, group[0], {value, files: group.map(f => path.relative(root, f))});
for (const file of files().filter(f => f.endsWith('.css'))) {
  for (const m of fs.readFileSync(file, 'utf8').matchAll(/url\(\s*(['"]?)([^'"\)]+)\1\s*\)/g)) inspectReference(m[2], file, 'css_asset');
}
for (const file of htmlFiles) {
  const alternates = [...contents.get(file).matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0])).filter(a => a.hreflang && a.href);
  for (const alternate of alternates) {
    const u = ownURL(alternate.href);
    const target = u && localTarget(u);
    if (!target || !target.endsWith('.html')) { fail('missing_hreflang_target', file, alternate.href); continue; }
    const returns = [...contents.get(target).matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0])).filter(a => a.hreflang && a.href);
    if (!returns.some(a => a.href === origin + resolvePath(routeFor(file)))) fail('missing_hreflang_return', file, alternate.href);
  }
}
for (const redirect of config.redirects || []) {
  if (redirect.destination.includes(':') || !redirect.destination.startsWith('/')) continue;
  if (!localTarget(new URL(redirect.destination, origin))) fail('missing_redirect_destination', path.join(site, 'vercel.json'), redirect);
}
const reachable = new Set(['/']), queue = ['/'];
while (queue.length) for (const target of edges.get(queue.shift()) || []) if (!reachable.has(target)) { reachable.add(target); queue.push(target); }
const indexable = pages.filter(p => !p.noindex && !p.redirected);
for (const p of indexable) if (!reachable.has(p.route)) fail('orphan_page', path.join(root, p.file), p.route);
const sitemap = fs.readFileSync(path.join(site, 'sitemap.xml'), 'utf8');
const sitemapURLs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => decode(m[1]));
for (const u of sitemapURLs) if (!indexable.some(p => p.canonical === u)) fail('invalid_sitemap_url', path.join(site, 'sitemap.xml'), u);
for (const p of indexable) if (!sitemapURLs.includes(p.canonical)) fail('missing_sitemap_url', path.join(root, p.file), p.canonical);
if (new Set(sitemapURLs).size !== sitemapURLs.length) fail('duplicate_sitemap_url', path.join(site, 'sitemap.xml'), 'Repeated loc');
if (config.cleanUrls !== true || config.trailingSlash !== false) fail('url_config', path.join(site, 'vercel.json'), 'Expected clean URLs without trailing slash');
const robots = fs.readFileSync(path.join(site, 'robots.txt'), 'utf8');
if (!robots.includes('Sitemap: ' + origin + '/sitemap.xml')) fail('robots_sitemap', path.join(site, 'robots.txt'), 'Canonical sitemap location missing');
if (/Disallow:\s*\/(thank-you|404)/i.test(robots)) fail('utility_noindex_blocked', path.join(site, 'robots.txt'), 'Crawler must see utility noindex');
const output = { generated_at: new Date().toISOString(), scope: 'local static source only; not deployed/live performance or provider delivery verification', passed: failures.length === 0, page_count: pages.length, indexable_pages: indexable.length, sitemap_urls: sitemapURLs.length, failure_count: failures.length, warning_count: warnings.length, failures, warnings, pages };
const outputArg = process.argv.indexOf('--output');
if (outputArg >= 0) { const filename = path.resolve(process.argv[outputArg + 1]); fs.mkdirSync(path.dirname(filename), { recursive: true }); fs.writeFileSync(filename, JSON.stringify(output, null, 2) + '\n'); }
console.log(JSON.stringify(outputArg >= 0 ? { passed: output.passed, page_count: output.page_count, indexable_pages: output.indexable_pages, failure_count: failures.length, warning_count: warnings.length, failures: failures.slice(0, 15) } : output, null, 2));
process.exitCode = failures.length ? 1 : 0;
