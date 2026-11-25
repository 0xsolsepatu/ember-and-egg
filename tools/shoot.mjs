// Screenshot + play-test driver for Ember & Egg (Node 22+, stdlib only).
// Drives the Playwright Chromium build over CDP: loads each ?shot= scene,
// waits for window.__shotReady, captures a JPEG, then plays the live game
// with real mouse clicks and checks the state. Usage:
//   node tools/shoot.mjs [port]   (serve.ts must already be running on port)
import { writeFileSync } from 'node:fs';
import { execFile } from 'node:child_process';

const PORT = Number(process.argv[2] ?? 8080);
const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`;
const SHOTS = [
  ['1-play.jpg', '?shot=play&seed=1'],
  ['2-start.jpg', '?shot=start&seed=1'],
  ['3-serve.jpg', '?shot=serve&seed=1'],
  ['4-end.jpg', '?shot=end&seed=1'],
];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path) {
  const res = await fetch(`http://127.0.0.1:9223${path}`);
  return res.json();
}

const chrome = execFile(CHROME, [
  '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
  '--remote-debugging-port=9223', '--window-size=1280,720', '--force-device-scale-factor=1',
  `http://127.0.0.1:${PORT}/index.html`,
], { stdio: 'ignore' });
chrome.on('error', (e) => { console.error('chrome launch failed', e); process.exit(1); });

let target = null;
for (let i = 0; i < 40 && !target; i += 1) {
  await sleep(500);
  try {
    const list = await getJson('/json/list');
    target = list.find((t) => t.type === 'page');
  } catch { /* not up yet */ }
}
if (!target) { console.error('no CDP target'); chrome.kill(); process.exit(1); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const pending = new Map();
const consoleErrors = [];
const failedRequests = [];
const requests = [];
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(msg.params.exceptionDetails?.exception?.description || JSON.stringify(msg.params.exceptionDetails));
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '));
  }
  if (msg.method === 'Network.loadingFailed') failedRequests.push(msg.params.errorText);
  if (msg.method === 'Network.responseReceived') {
    if (msg.params.response.status >= 400) failedRequests.push(`${msg.params.response.status} ${msg.params.response.url}`);
    requests.push(msg.params.response.url);
  }
};
function send(method, params = {}) {
  const mid = ++id;
  return new Promise((resolve, reject) => {
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
}

await send('Runtime.enable');
await send('Network.enable');
await send('Page.enable');
// The headless window reports a shorter viewport than its size; force the
// metrics so the game renders at its native 1280x720.
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });

async function navigate(url) {
  await send('Page.navigate', { url });
  await sleep(1200);
}
async function evalJs(expression) {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
}
async function waitForShotReady() {
  for (let i = 0; i < 30; i += 1) {
    if (await evalJs('window.__shotReady === true')) return true;
    await sleep(200);
  }
  return false;
}

// --- Screenshots ---
for (const [name, query] of SHOTS) {
  await navigate(`http://127.0.0.1:${PORT}/index.html${query}`);
  const ready = await waitForShotReady();
  await sleep(400);
  const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 82 });
  writeFileSync(`screenshots/${name}`, Buffer.from(shot.data, 'base64'));
  console.log(`${name}: shotReady=${ready}`);
}

// --- Live play-test with real mouse clicks ---
await navigate(`http://127.0.0.1:${PORT}/index.html?seed=7`);
await sleep(800);
async function click(x, y) {
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
}
async function key(k, type = 'keyDown') {
  await send('Input.dispatchKeyEvent', { type, key: k, code: k === ' ' ? 'Space' : `Key${k.toUpperCase()}`, windowsVirtualKeyCode: k === ' ' ? 32 : k.toUpperCase().charCodeAt(0) });
}
async function press(k) {
  await key(k, 'keyDown');
  await key(k, 'keyUp');
}
const state = async () => evalJs(`(() => { const s = window.__world.state; return { coins: s.coins, served: s.served, lives: s.lives, orders: s.orders.map(o => o.dish), chef: { x: Math.round(s.chef.x), y: Math.round(s.chef.y), carrying: s.chef.carrying }, board: s.board, grill: s.grill.map(g => g.item && g.item.name), pot: s.pot, plating: s.plating.plate, timeLeft: Math.round(s.timeLeft) }; })()`);

await press(' '); // start
await sleep(500);
console.log('after start:', JSON.stringify(await state()));
await click(290, 337); // tomato bin
await sleep(2500);
console.log('after tomato bin click:', JSON.stringify(await state()));
await click(775, 336); // chopping board
await sleep(1500);
console.log('after board click:', JSON.stringify(await state()));
await sleep(2500); // chopping finishes (~2.2s)
await click(775, 336); // take chopped tomato
await sleep(2000);
console.log('after taking chopped tomato:', JSON.stringify(await state()));
await click(1175, 336); // soup pot
await sleep(2500);
console.log('after pot click:', JSON.stringify(await state()));
await press('p'); // pause
await sleep(300);
const paused = await evalJs(`document.getElementById('status').textContent`);
console.log('paused status:', paused);
await press('p');
await sleep(300);

console.log('console errors:', JSON.stringify(consoleErrors));
console.log('failed requests:', JSON.stringify(failedRequests));
console.log('requests made:', JSON.stringify(requests));
ws.close();
chrome.kill();
process.exit(0);
