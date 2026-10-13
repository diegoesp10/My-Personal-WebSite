// Renders scripts/og/og-image.html into public/og-image.png (1200×630), the image shown when a page of the site is
// shared or appears in search results. Needs Google Chrome; set CHROME to its path if it is not the default one.
//   node scripts/og/make-og-image.mjs
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, 'public/og-image.png');
const chrome =
  process.env.CHROME ??
  {
    win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  }[process.platform] ??
  'google-chrome';
const types = { '.html': 'text/html', '.png': 'image/png', '.woff2': 'font/woff2' };

// Same-origin server for the template, its fonts and the portrait data (a file:// page cannot read canvas pixels).
const server = createServer((request, response) => {
  const file = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://x').pathname));
  if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  response.end(readFileSync(file));
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');

const browser = spawn(
  chrome,
  [
    '--headless=new',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=8000',
    `--screenshot=${output}`,
    `http://127.0.0.1:${server.address().port}/scripts/og/og-image.html`,
  ],
  { stdio: 'ignore' },
);
const [code] = await once(browser, 'exit');
server.close();
if (code !== 0 || !existsSync(output)) throw new Error(`Chrome terminó con código ${code}.`);
console.log(`Imagen generada: ${output}`);
