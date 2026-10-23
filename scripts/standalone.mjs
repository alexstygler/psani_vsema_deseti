import { readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Package the normal production build into one portable, offline HTML file.
// No network requests or additional libraries are needed to generate or run it.
const root = fileURLToPath(new URL('../', import.meta.url));
const dist = resolve(root, 'dist');
const output = resolve(root, 'lehce.html');
const mime = {
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function localAsset(base, relative) {
  if (/^(?:[a-z]+:|\/\/)/i.test(relative)) {
    throw new Error(`Standalone build requires a local asset: ${relative}`);
  }
  const path = resolve(base, relative);
  if (!path.startsWith(`${dist}${sep}`)) throw new Error('Asset escapes dist/');
  return path;
}

async function dataUrl(path) {
  const type = mime[extname(path)];
  if (!type) throw new Error(`Unsupported inline asset: ${path}`);
  return `data:${type};base64,${(await readFile(path)).toString('base64')}`;
}

let html = await readFile(resolve(dist, 'index.html'), 'utf8');
for (const match of [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)]) {
  const path = localAsset(dist, match[1]);
  const code = await readFile(path, 'utf8');
  // Vite emits a single entry chunk for this app. Fail if this stops being true.
  if (/\b(?:from\s*|import\s*\()\s*["']\./.test(code)) {
    throw new Error('Standalone build cannot contain external JavaScript chunks');
  }
  html = html.replace(
    match[0],
    () => `<script type="module">${code.replace(/<\/script/gi, '<\\/script')}</script>`,
  );
}
for (const match of [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)]) {
  const path = localAsset(dist, match[1]);
  let css = await readFile(path, 'utf8');
  for (const url of [...css.matchAll(/url\(([^)]+)\)/g)]) {
    const relative = url[1].replace(/^["']|["']$/g, '');
    if (relative.startsWith('data:')) continue;
    const inline = await dataUrl(localAsset(dirname(path), relative));
    css = css.replaceAll(url[0], `url("${inline}")`);
  }
  html = html.replace(match[0], () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style>`);
}
html = html.replace(/<link\b[^>]*rel="icon"[^>]*>/g, '<!-- All app assets are embedded. -->');
html = html.replace(
  '</head>',
  `<link rel="icon" href="${await dataUrl(resolve(dist, 'favicon.svg'))}" /></head>`,
);
if (/<(?:script|link)\b[^>]*(?:src|href)="\.\/assets\//.test(html)) {
  throw new Error('Standalone build still references external assets');
}
await writeFile(output, html);
console.log(`Standalone app: lehce.html (${Math.round(Buffer.byteLength(html) / 1024)} KiB)`);
