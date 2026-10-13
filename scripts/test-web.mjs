// HTTP regression checks against the local production-like Docker frontend.
import assert from 'node:assert/strict';
const base = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:8080';
const nonces = new Set();
let asset;
for (const route of [
  '/es',
  '/es/proyectos',
  '/en/experiencia',
  '/en/visitas',
  '/es/proyectos/peluqueria-lucia',
  '/en',
]) {
  const response = await fetch(base + route, { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, route);
  const policy = response.headers.get('content-security-policy');
  const scripts = policy?.split(';').find((part) => part.trim().startsWith('script-src '));
  assert.ok(scripts);
  assert.match(scripts, /'self'/);
  assert.doesNotMatch(scripts, /unsafe-inline|unsafe-eval/);
  const nonce = scripts.match(/'nonce-([a-f0-9]{32})'/)?.[1];
  assert.ok(nonce, '128-bit nonce in the HTTP header');
  assert.ok(!nonces.has(nonce), 'Fresh nonce on every HTML response');
  nonces.add(nonce);
  assert.match(response.headers.get('cache-control'), /no-store/);
  const html = await response.text();
  assert.ok(html.includes('application/ld+json'), 'SEO preserved');
  assert.ok(!html.includes('<!--#'), 'SSI resolved');
  const language = route.split('/')[1];
  assert.match(
    html,
    new RegExp(`<html lang=['"]${language}['"]>`),
    `lang from the address: ${route}`,
  );
  assert.ok(html.includes('hreflang="x-default"'), `language alternates: ${route}`);
  asset ??= html.match(/(?:src|href)="(\/assets\/[^"\s]+)"/)?.[1];
}
assert.ok(asset);

// Languages: the bare domain follows the browser, older addresses move to Spanish for good.
const redirect = (path, headers = {}) => fetch(base + path, { redirect: 'manual', headers });
const english = await redirect('/', { 'Accept-Language': 'en-GB,en;q=0.9,es;q=0.5' });
assert.equal(english.status, 302);
assert.equal(english.headers.get('location'), '/en');
assert.match(english.headers.get('vary'), /Accept-Language/);
assert.equal(
  (await redirect('/', { 'Accept-Language': 'es-ES,es;q=0.9' })).headers.get('location'),
  '/es',
);
const legacy = await redirect('/proyectos/murmur?ref=cv');
assert.equal(legacy.status, 301);
assert.equal(legacy.headers.get('location'), '/es/proyectos/murmur?ref=cv');
assert.equal((await redirect('/editor')).status, 200, 'the editor keeps its address');
const resource = await fetch(base + asset);
assert.equal(resource.status, 200);
assert.match(resource.headers.get('cache-control'), /immutable/);
const api = await fetch(base + '/api/health');
assert.equal(api.status, 200);
assert.match(api.headers.get('content-security-policy'), /default-src 'none'/);
console.log(
  'OK: fresh CSP nonces, inline scripts restricted, uncached HTML, immutable assets, SEO, languages and API health.',
);
