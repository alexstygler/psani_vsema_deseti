import { readFile, appendFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

const { version } = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const base = new URL(process.env.SITE_URL || '');
if (!['https:', 'http:'].includes(base.protocol)) throw new Error('SITE_URL must be HTTP(S)');
let lastError;
for (let attempt = 0; attempt < 6; attempt++) {
  try {
    const pageUrl = new URL(base);
    pageUrl.searchParams.set('deployment-check', Date.now());
    const response = await fetch(pageUrl, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`Page HTTP ${response.status}`);
    const html = await response.text();
    if (!/<title>Lehce\b/i.test(html)) throw new Error('The page is not the Lehce application');
    const script = html.match(/<script\b[^>]*\bsrc="([^"]+)"/i)?.[1];
    const css = html.match(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"/i)?.[1];
    if (!script || !css) throw new Error('Missing application JS or CSS');
    let scriptBody = '';
    for (const asset of [script, css]) {
      const url = new URL(asset, base);
      if (url.origin !== base.origin) throw new Error('Unexpected external application asset');
      const resource = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (!resource.ok) throw new Error(`Asset HTTP ${resource.status}: ${url.pathname}`);
      const body = await resource.text();
      if (!body.length || /^<!doctype html/i.test(body.trim()))
        throw new Error('Asset did not return code');
      if (asset === script) scriptBody = body;
    }
    if (!scriptBody.includes(version))
      throw new Error(`Waiting for application version ${version}`);
    console.log(`Lehce ${version}: public HTML, JavaScript and CSS verified at ${base.href}`);
    if (process.env.GITHUB_STEP_SUMMARY)
      await appendFile(
        process.env.GITHUB_STEP_SUMMARY,
        `## Veřejný web ověřen\n\nAdresa: ${base.href}\n\nVerze: **${version}**. HTML, JavaScript a CSS vracejí úspěšné odpovědi.\n`,
      );
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.warn(`Verification attempt ${attempt + 1}: ${error.message}`);
  }
  if (attempt < 5) await setTimeout(5000);
}
throw lastError;
