// Boot and the one loop: input is read every frame, the world advances in fixed
// 1/60 s steps, and the renderer paints what is there. The game moves between
// four screens: title, play, paused and game over.
//
// ?seed=N fixes the order pattern. ?shot=start|play|serve|end (with &seed=N)
// stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, STEP, WALK } from './config.js';
import { createRandom } from './random.js';
import { createAudio } from './audio.js';
import {
  createWorld,
  EVENT_BURN,
  EVENT_CHOP,
  EVENT_COOK_DONE,
  EVENT_ERROR,
  EVENT_EXPIRE,
  EVENT_OVER,
  EVENT_PICKUP,
  EVENT_PLACE,
  EVENT_SERVE,
  EVENT_TRASH,
} from './world.js';
import {
  ACTION_CONFIRM,
  ACTION_MUTE,
  ACTION_PAUSE,
  ACTION_RESTART,
  createInput,
} from './input.js';
import { createRenderer, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();
// Test hook: lets an automated play-test read the live state (never used by the game itself).
window.__world = world;

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, world.stations);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();
  let clickTarget = null;
  let clickInteract = false;

  // Screen readers (and anyone watching the page's text) hear the screen changes and each hit.
  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    accumulator = 0;
    clickTarget = null;
    clickInteract = false;
    screen = SCREEN_PLAY;
    audio.unlock();
    announce('Playing. Three hearts. Serve every order before its patience runs out.');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.coins > best) {
      best = world.state.coins;
      saveBest(best);
    }
    audio.stopSizzle();
    if (world.state.won) audio.fanfare();
    announce(`Day over. ${world.state.served} dishes served, $${world.state.coins} earned. Best $${best}.`);
  }

  function playEventSound(events) {
    if (events & EVENT_SERVE) audio.coin();
    else if (events & EVENT_ERROR) audio.error();
    else if (events & EVENT_BURN) audio.burn();
    else if (events & EVENT_EXPIRE) audio.error();
    else if (events & EVENT_CHOP) audio.chop();
    else if (events & EVENT_COOK_DONE) audio.ding();
    else if (events & EVENT_PICKUP) audio.pickup();
    else if (events & EVENT_PLACE) audio.place();
    else if (events & EVENT_TRASH) audio.error();
    const cooking = world.state.grill.some((s) => s.item) || world.state.pot.cooking;
    if (cooking) audio.startSizzle();
    else audio.stopSizzle();
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (actions & ACTION_CONFIRM) {
      audio.unlock();
      if (screen === SCREEN_TITLE) startGame();
      else if (screen === SCREEN_OVER) startGame();
      else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (screen === SCREEN_PLAY) {
        const events = world.interact();
        playEventSound(events);
      }
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      audio.stopSizzle();
      announce('Paused.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
    if (actions & ACTION_RESTART && screen === SCREEN_OVER) startGame();
    if (actions & ACTION_RESTART && screen === SCREEN_PLAY) startGame();
  }

  function step() {
    if (screen === SCREEN_TITLE) {
      world.step(STEP, 0, 0);
      // The title screen shows a live kitchen: keep the demo orders coming.
      if (world.state.over) world.reset();
      return;
    }
    const click = input.takeClick();
    if (click.target) {
      // The chef walks the open floor only: clamp the target there, so a click
      // on a counter still walks the chef up to it and interacts. The interact
      // flag rides along until the chef arrives, not just for one step.
      clickTarget = {
        x: Math.min(WALK.right, Math.max(WALK.left, click.target.x)),
        y: Math.min(WALK.bottom, Math.max(WALK.top, click.target.y)),
      };
      clickInteract = click.interact;
    }
    let move = input.direction();
    if (move.x === 0 && move.y === 0 && clickTarget) {
      const chef = world.state.chef;
      const dx = clickTarget.x - chef.x;
      const dy = clickTarget.y - chef.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 12) {
        if (clickInteract) {
          const events = world.interact();
          playEventSound(events);
        }
        clickTarget = null;
        clickInteract = false;
      } else {
        move = { x: dx / dist, y: dy / dist };
      }
    }
    const events = world.step(STEP, move.x, move.y);
    playEventSound(events);
    if (events & EVENT_OVER) endGame();
    else if (events & EVENT_EXPIRE) announce(`An order walked out. ${world.state.lives} hearts left.`);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    if (screen === SCREEN_TITLE || screen === SCREEN_PLAY) {
      while (accumulator >= STEP && (screen === SCREEN_TITLE || screen === SCREEN_PLAY)) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, world.stations);
  }

  // Leaving the tab pauses a running game rather than letting tickets expire unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      audio.stopSizzle();
      announce('Paused.');
    }
  });

  // Q drops whatever the chef is holding (the hint bar says so).
  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'q' && screen === SCREEN_PLAY && world.state.chef.carrying) {
      world.state.chef.carrying = null;
      audio.error();
    }
  });

  announce('Ember and Egg. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
