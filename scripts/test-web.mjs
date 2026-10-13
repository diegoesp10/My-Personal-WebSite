// HTTP regression checks against the local production-like Docker frontend.
import assert from 'node:assert/strict';
const base = process.env.PORTFOLIO_TEST_URL || 'http://127.0.0.1:8080';
const nonces = new Set();
let asset;
for (const route of [
  '/',
  '/proyectos',
  '/experiencia',
  '/visitas',
  '/proyectos/peluqueria-lucia',
  '/',
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
  asset ??= html.match(/(?:src|href)="(\/assets\/[^"\s]+)"/)?.[1];
}
assert.ok(asset);
const resource = await fetch(base + asset);
assert.equal(resource.status, 200);
assert.match(resource.headers.get('cache-control'), /immutable/);
const api = await fetch(base + '/api/health');
assert.equal(api.status, 200);
assert.match(api.headers.get('content-security-policy'), /default-src 'none'/);
console.log(
  'OK: fresh CSP nonces, inline scripts restricted, uncached HTML, immutable assets, SEO and API health.',
);
