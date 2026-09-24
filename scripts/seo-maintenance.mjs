import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const site = path.join(root, 'site');
export const origin = 'https://www.partybusrus.com';
const ownHosts = new Set(['partybusrus.com', 'www.partybusrus.com']);
export const decode = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'");
export const encode = value => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
export function files(dir = site) {
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry =>
    entry.name.startsWith('.') ? [] : entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
export function cleanPath(value) {
  let p = value.replace(/\/index\.html$/i, '/').replace(/\.html$/i, '');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}
export const config = JSON.parse(fs.readFileSync(path.join(site, 'vercel.json'), 'utf8'));
const redirects = new Map((config.redirects || []).filter(r => !r.source.includes(':')).map(r => [cleanPath(r.source), cleanPath(r.destination)]));
export function resolvePath(value) {
  let p = cleanPath(value);
  if (p.startsWith('/v2/')) p = cleanPath(p.slice(3));
  for (let i = 0; redirects.has(p) && i < 12; i++) {
    const next = redirects.get(p);
    if (next === p) break;
    p = next;
  }
  return p;
}
export const routeFor = file => cleanPath('/' + path.relative(site, file).split(path.sep).join('/'));
export function ownURL(value, base = origin + '/') {
  if (!value || /^(?:#|mailto:|tel:|sms:|javascript:|data:|blob:)/i.test(value)) return null;
  try { const u = new URL(decode(value), base); return ownHosts.has(u.hostname) && /^https?:$/.test(u.protocol) ? u : null; }
  catch { return null; }
}
export function normalizeURL(value, base, absolute = false) {
  const u = ownURL(value, base);
  if (!u) return value;
  const pathname = /\.[a-z\d]+$/i.test(u.pathname) && !/\.html$/i.test(u.pathname) ? u.pathname : resolvePath(u.pathname);
  const relative = pathname + u.search + u.hash;
  return absolute || /^(?:https?:)?\/\//i.test(value) ? origin + relative : relative;
}
export function attrs(tag) {
  const result = {};
  for (const m of tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) result[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4]);
  return result;
}
export function normalizeSchema(value, base, fleet = false) {
  if (Array.isArray(value)) return value.map(x => normalizeSchema(x, base, fleet)).filter(x => x !== undefined);
  if (value && typeof value === 'object') {
    const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
    if (types.includes('Review') || types.includes('AggregateRating')) return undefined;
    const result = {};
    for (const [key, v] of Object.entries(value)) {
      if (['aggregateRating', 'review', 'reviews', 'openingHours', 'openingHoursSpecification', 'offers', 'priceRange'].includes(key)) continue;
      if (key === '@type') {
        const fixed = [...new Set(types.map(t => t === 'LimousineService' ? 'LocalBusiness' : t))];
        result[key] = fixed.length === 1 ? fixed[0] : fixed;
      } else {
        const cleaned = normalizeSchema(v, base, fleet);
        if (cleaned !== undefined) result[key] = cleaned;
      }
    }
    if (fleet && types.includes('Product')) {
      result['@type'] = 'Service';
      result.serviceType = 'Party bus rental';
      result.provider = { '@id': origin + '/#business' };
      delete result.brand;
    }
    return result;
  }
  return typeof value === 'string' && /^(?:https?:)?\/\//.test(value) ? normalizeURL(value, base, true) : value;
}
export function normalizeHTML(html, file) {
  const route = routeFor(file), canonical = origin + resolvePath(route);
  // Mask scripts and styles before editing markup so inline JavaScript is never rewritten as HTML.
  const blocks = [];
  html = html.replace(/<(script|style)\b([^>]*)>([\s\S]*?)<\/\1>/gi, (whole, tag, attributes, body) => {
    let output = whole;
    if (tag.toLowerCase() === 'script' && attrs(attributes).type === 'application/ld+json') {
      const schema = normalizeSchema(JSON.parse(body), canonical, route.startsWith('/fleet/bus-'));
      output = schema ? `<script${attributes}>${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>` : '';
    } else if (tag.toLowerCase() === 'script') {
      output = `<script${attributes.replace(/\bsrc=(['"])(.*?)\1/gi, (m, quote, value) => `src=${quote}${encode(normalizeURL(decode(value), canonical))}${quote}`)}>${body}</script>`;
    }
    blocks.push(output); return `<!--SEO-BLOCK-${blocks.length - 1}-->`;
  });
  html = html.replace(/<[a-z][^>]*>/gi, tag => {
    const at = attrs(tag);
    if (/^<link\b/i.test(tag) && at.rel === 'canonical') return tag.replace(/\bhref=(['"])(.*?)\1/i, `href="${canonical}"`);
    if (/^<meta\b/i.test(tag) && at.property === 'og:url') return tag.replace(/\bcontent=(['"])(.*?)\1/i, `content="${canonical}"`);
    return tag.replace(/\b(href|src|action|poster|data-src)=(['"])(.*?)\2/gi, (m, name, quote, value) => {
      const force = at.hreflang !== undefined;
      return `${name}=${quote}${encode(normalizeURL(decode(value), canonical, force))}${quote}`;
    }).replace(/\bcontent=(['"])(.*?)\1/gi, (m, quote, value) =>
      /^(?:https?:)?\/\//i.test(decode(value)) ? `content=${quote}${encode(normalizeURL(decode(value), canonical, true))}${quote}` : m);
  });
  return html.replace(/<!--SEO-BLOCK-(\d+)-->/g, (m, index) => blocks[Number(index)]);
}
export function buildSitemap(htmlFiles, original) {
  const dates = new Map();
  for (const match of original.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = match[1].match(/<loc>(.*?)<\/loc>/)?.[1];
    const date = match[1].match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
    if (loc && date) dates.set(normalizeURL(decode(loc), origin, true), date);
  }
  const urls = new Set();
  for (const file of htmlFiles) {
    const route = routeFor(file), html = fs.readFileSync(file, 'utf8');
    const noindex = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attrs(m[0])).some(a => ['robots', 'googlebot'].includes(a.name) && /noindex/i.test(a.content || ''));
    if (!noindex && route === resolvePath(route)) urls.add(origin + route);
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + [...urls].sort().map(u => `  <url>\n    <loc>${encode(u)}</loc>${dates.has(u) ? `\n    <lastmod>${dates.get(u)}</lastmod>` : ''}\n  </url>`).join('\n') + '\n</urlset>\n';
}
export function run(write = false) {
  const htmlFiles = files().filter(f => f.endsWith('.html'));
  const changes = [];
  for (const file of htmlFiles) {
    const before = fs.readFileSync(file, 'utf8'), after = normalizeHTML(before, file);
    if (before !== after) { changes.push(path.relative(root, file)); if (write) fs.writeFileSync(file, after); }
  }
  const sitemap = path.join(site, 'sitemap.xml');
  const before = fs.readFileSync(sitemap, 'utf8'), after = buildSitemap(htmlFiles, before);
  if (before !== after) { changes.push('site/sitemap.xml'); if (write) fs.writeFileSync(sitemap, after); }
  return { mode: write ? 'write' : 'dry-run', html_pages: htmlFiles.length, changed_files: changes.length, files: changes };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(run(process.argv.includes('--write')), null, 2));
