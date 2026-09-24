import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'site/assets/fonts');
const approvedHosts = new Set(['fonts.googleapis.com', 'fonts.gstatic.com', 'raw.githubusercontent.com']);
const cssURL = 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400..700&display=swap';
async function download(url, redirects = 0) {
  const u = new URL(url);
  if (u.protocol !== 'https:' || !approvedHosts.has(u.hostname) || redirects > 3) throw new Error('Unapproved font source: ' + url);
  if (u.hostname === 'raw.githubusercontent.com' && !u.pathname.startsWith('/google/fonts/main/ofl/')) throw new Error('Unapproved license source');
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(30000), headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
  } });
  if ([301, 302, 303, 307, 308].includes(response.status)) return download(new URL(response.headers.get('location'), u).href, redirects + 1);
  if (!response.ok) throw new Error(`Font source HTTP ${response.status}: ${url}`);
  return Buffer.from(await response.arrayBuffer());
}
await fs.mkdir(out, { recursive: true });
const remoteCSS = (await download(cssURL)).toString('utf8');
const output = [], evidence = [], written = new Map();
for (const match of remoteCSS.matchAll(/\/\*\s*([^*]+?)\s*\*\/\s*(@font-face\s*\{[\s\S]*?\})/g)) {
  const subset = match[1].trim();
  if (!['latin', 'latin-ext'].includes(subset)) continue;
  let block = match[2];
  const family = block.match(/font-family:\s*['"]([^'"]+)['"]/)?.[1];
  const weight = block.match(/font-weight:\s*([^;]+);/)?.[1].trim();
  const source = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/)?.[1];
  if (!['Anton', 'Inter'].includes(family) || !source?.endsWith('.woff2')) throw new Error('Unexpected Google Fonts face');
  let name = written.get(source);
  if (!name) {
    const data = await download(source);
    if (data.subarray(0, 4).toString('ascii') !== 'wOF2') throw new Error('Not a WOFF2 font: ' + source);
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    name = `${family.toLowerCase()}-${subset}-${hash.slice(0,12)}.woff2`;
    await fs.writeFile(path.join(out, name), data);
    written.set(source, name);
    evidence.push({ family, subset, source, filename: name, bytes: data.length, sha256: hash });
  }
  block = block.replace(source, '/assets/fonts/' + name).replace(/font-display:\s*[^;]+;/, 'font-display: swap;');
  output.push(`/* ${family} ${subset}, weight ${weight} */\n${block}`);
}
for (const family of ['Anton', 'Inter']) for (const subset of ['latin', 'latin-ext']) {
  if (!output.some(b => b.startsWith(`/* ${family} ${subset},`))) throw new Error(`Missing ${family} ${subset}`);
}
for (const family of ['anton', 'inter']) {
  const source = `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`;
  const license = await download(source);
  if (!license.toString('utf8').includes('SIL OPEN FONT LICENSE')) throw new Error('Unexpected font license');
  await fs.writeFile(path.join(out, `${family}-OFL.txt`), license);
  evidence.push({ family, license_source: source, license_file: `${family}-OFL.txt` });
}
await fs.writeFile(path.join(out, 'fonts.css'), '/* Self-hosted official Google Fonts. Licenses alongside font files. */\n' + output.join('\n\n') + '\n');
await fs.writeFile(path.join(out, 'sources.json'), JSON.stringify({ css_source: cssURL, subsets: ['latin', 'latin-ext'], display: 'swap', faces: output.length, sources: evidence }, null, 2) + '\n');
console.log(JSON.stringify({ faces: output.length, unique_woff2_files: written.size, directory: path.relative(root, out), licenses: 2 }, null, 2));
