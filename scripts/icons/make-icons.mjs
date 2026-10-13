// Renders the brand icon (scripts/icons/icon.html) into every file browsers and search engines look for:
// favicon.ico (16, 32 and 48 px), PNG icons in multiples of 48 px (Google shows favicons from 48×48), the Apple
// touch icon and the web app manifest icons. Needs Google Chrome; set CHROME if it is not in the default path.
//   node scripts/icons/make-icons.mjs
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const output = resolve(root, 'public');
const chrome =
  process.env.CHROME ??
  {
    win32: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  }[process.platform] ??
  'google-chrome';

// [file, size, shape, scale of the letter]
const icons = [
  ['favicon-16.png', 16, 'rounded', 1],
  ['favicon-32.png', 32, 'rounded', 1],
  ['favicon-48x48.png', 48, 'rounded', 1],
  ['favicon-96x96.png', 96, 'rounded', 1],
  ['favicon-192x192.png', 192, 'rounded', 1],
  ['apple-touch-icon.png', 180, 'full', 0.86],
  ['icon-512.png', 512, 'rounded', 1],
  ['icon-maskable-512.png', 512, 'full', 0.72],
];

const server = createServer((request, response) => {
  const file = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://x').pathname));
  if (!file.startsWith(root + sep) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.end(readFileSync(file));
});
server.listen(0, '127.0.0.1');
await once(server, 'listening');

// Chrome is driven through the DevTools protocol: a headless window has a minimum width, so the page size is
// set with device metrics and every icon is captured clipped to its exact size, on a transparent background.
const port = 9400 + Math.floor(Math.random() * 400);
const profile = mkdtempSync(join(tmpdir(), 'icons-chrome-'));
const browser = spawn(
  chrome,
  [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    'about:blank',
  ],
  { stdio: 'ignore' },
);
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
let socket;
for (let attempt = 0; attempt < 50 && !socket; attempt++) {
  try {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
    const page = targets.find((target) => target.type === 'page');
    if (page) socket = new WebSocket(page.webSocketDebuggerUrl);
  } catch {}
  if (!socket) await sleep(200);
}
if (!socket) throw new Error('No se pudo conectar con Chrome.');
await new Promise((done) => socket.addEventListener('open', done, { once: true }));
let sequence = 0;
const pending = new Map();
const waiters = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  } else if (message.method && waiters.has(message.method)) {
    waiters.get(message.method)();
    waiters.delete(message.method);
  }
});
const send = (method, params = {}) =>
  new Promise((done) => {
    const id = ++sequence;
    pending.set(id, done);
    socket.send(JSON.stringify({ id, method, params }));
  });
const next = (method) => new Promise((done) => waiters.set(method, done));

const rendered = {};
try {
  await send('Page.enable');
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  for (const [file, size, shape, scale] of icons) {
    await send('Emulation.setDeviceMetricsOverride', {
      width: size,
      height: size,
      deviceScaleFactor: 1,
      mobile: false,
    });
    const loaded = next('Page.loadEventFired');
    await send('Page.navigate', {
      url: `http://127.0.0.1:${server.address().port}/scripts/icons/icon.html?shape=${shape}&scale=${scale}`,
    });
    await loaded;
    await sleep(100);
    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      clip: { x: 0, y: 0, width: size, height: size, scale: 1 },
    });
    if (!shot.result?.data) throw new Error(`Chrome no pudo generar ${file}.`);
    rendered[file] = Buffer.from(shot.result.data, 'base64');
  }
} finally {
  socket.close();
  browser.kill();
  server.close();
}

// favicon.ico with PNG entries (supported by every current browser and by Windows).
const entries = ['favicon-16.png', 'favicon-32.png', 'favicon-48x48.png'].map(
  (file) => rendered[file],
);
const header = Buffer.alloc(6 + 16 * entries.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(entries.length, 4);
let offset = header.length;
entries.forEach((png, index) => {
  const size = png.readUInt32BE(16);
  const at = 6 + 16 * index;
  header.writeUInt8(size >= 256 ? 0 : size, at);
  header.writeUInt8(size >= 256 ? 0 : size, at + 1);
  header.writeUInt16LE(1, at + 4);
  header.writeUInt16LE(32, at + 6);
  header.writeUInt32LE(png.length, at + 8);
  header.writeUInt32LE(offset, at + 12);
  offset += png.length;
});
writeFileSync(join(output, 'favicon.ico'), Buffer.concat([header, ...entries]));

for (const [file] of icons) {
  if (file === 'favicon-16.png' || file === 'favicon-32.png') continue;
  writeFileSync(join(output, file), rendered[file]);
}
await sleep(300);
rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
console.log(`Iconos generados en ${output}`);
