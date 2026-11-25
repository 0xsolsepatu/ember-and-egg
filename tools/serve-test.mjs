// Full serve test: build a Garden Salad and serve it, with real mouse clicks.
// Waits for the chef to arrive (moving === false) after every click.
import { execFile } from 'node:child_process';
const PORT = 8080;
const CHROME = `${process.env.HOME}/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getJson(path) { const res = await fetch(`http://127.0.0.1:9225${path}`); return res.json(); }
const chrome = execFile(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--remote-debugging-port=9225', '--window-size=1280,720', `http://127.0.0.1:${PORT}/index.html?seed=7`], { stdio: 'ignore' });
let target = null;
for (let i = 0; i < 40 && !target; i += 1) { await sleep(500); try { const list = await getJson('/json/list'); target = list.find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0; const pending = new Map(); const errors = [];
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } if (m.method === 'Runtime.exceptionThrown') errors.push(JSON.stringify(m.params.exceptionDetails)); };
function send(method, params = {}) { const mid = ++id; return new Promise((res) => { pending.set(mid, res); ws.send(JSON.stringify({ id: mid, method, params })); }); }
await send('Runtime.enable'); await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
await sleep(1000);
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value;
const click = async (x, y) => {
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};
const key = async (k) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k === ' ' ? 'Space' : `Key${k.toUpperCase()}`, windowsVirtualKeyCode: k === ' ' ? 32 : k.toUpperCase().charCodeAt(0) });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k === ' ' ? 'Space' : `Key${k.toUpperCase()}`, windowsVirtualKeyCode: k === ' ' ? 32 : k.toUpperCase().charCodeAt(0) });
};
const state = async () => ev(`(() => { const s = window.__world.state; return { coins: s.coins, served: s.served, combo: s.combo, lives: s.lives, orders: s.orders.map(o => o.dish), carrying: s.chef.carrying, moving: s.chef.moving, board: s.board.item && s.board.item.name, boardProgress: Math.round(s.board.progress * 100) / 100, plating: s.plating.plate && s.plating.plate.items, timeLeft: Math.round(s.timeLeft) }; })()`);
async function waitIdle() {
  for (let i = 0; i < 40; i += 1) {
    await sleep(250);
    const s = await state();
    if (!s.moving) return s;
  }
  return state();
}
await key(' ');
await sleep(400);
await ev(`window.__world.state.orders.push({id: 99, dish: 'salad', patience: 60, maxPatience: 60})`);
await click(91, 558); // plates stack
console.log('plate:', JSON.stringify(await waitIdle()));
await click(330, 558); // plating counter: put the plate down
console.log('plate on counter:', JSON.stringify(await waitIdle()));
await click(394, 337); // lettuce bin
console.log('lettuce picked:', JSON.stringify(await waitIdle()));
await click(775, 336); // board: place lettuce
console.log('lettuce on board:', JSON.stringify(await waitIdle()));
await sleep(2600); // chopping finishes
await click(775, 336); // take chopped lettuce
console.log('chopped lettuce held:', JSON.stringify(await waitIdle()));
await click(330, 558); // plating counter: add to the plate
console.log('lettuce on plate:', JSON.stringify(await waitIdle()));
await click(290, 337); // tomato bin
console.log('tomato picked:', JSON.stringify(await waitIdle()));
await click(775, 336); // board: place tomato
console.log('tomato on board:', JSON.stringify(await waitIdle()));
await sleep(2600);
await click(775, 336); // take chopped tomato
console.log('chopped tomato held:', JSON.stringify(await waitIdle()));
await click(330, 558); // plating counter: add to the plate
console.log('tomato on plate:', JSON.stringify(await waitIdle()));
await click(498, 337); // cheese bin
console.log('cheese picked:', JSON.stringify(await waitIdle()));
await click(330, 558); // plating counter: add cheese to the plate
console.log('cheese on plate:', JSON.stringify(await waitIdle()));
await click(330, 558); // pick the finished plate up
console.log('plate picked up:', JSON.stringify(await waitIdle()));
await click(1112, 558); // serve window
console.log('after serve:', JSON.stringify(await waitIdle()));
console.log('errors:', JSON.stringify(errors));
ws.close(); chrome.kill(); process.exit(0);
