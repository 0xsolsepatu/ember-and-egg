// The screenshot scenes behind ?shot=start|play|serve|end. Each one stages a
// real game state through the world's own fields — the same state the live
// game reaches — and the renderer paints it, so every screenshot is a render
// of the game's own code. The seed only varies which dishes the tickets ask
// for; the staging itself is fixed, so the same seed gives the same frame.
import { DISH_IDS, RECIPES } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

function addOrder(world, dish, patience) {
  const state = world.state;
  const id = state.orders.length + 1;
  state.orders.push({ id, dish, patience, maxPatience: patience });
}

/** A kitchen mid-rush: tickets on the board, food on the board and grill, a
 *  burger half-built on the plating counter, a plate ready to serve. */
function stagePlay(world) {
  const state = world.state;
  state.timeLeft = 108;
  state.elapsed = 42;
  state.level = 2;
  state.coins = 46;
  state.served = 3;
  state.combo = 2;
  state.bestCombo = 2;
  state.orders = [];
  addOrder(world, 'burger', 38);
  addOrder(world, 'salad', 24);
  addOrder(world, 'omelette', 47);
  state.chef.x = 930;
  state.chef.y = 452;
  state.chef.carrying = { kind: 'ingredient', name: 'grilled patty' };
  state.board.item = { name: 'lettuce', result: 'chopped lettuce', seconds: 2.2 };
  state.board.progress = 0.55;
  state.grill[0].item = { name: 'patty', result: 'grilled patty', seconds: 6, burnAfter: 6 };
  state.grill[0].progress = 0.8;
  state.grill[1].item = { name: 'egg', result: 'fried egg', seconds: 4, burnAfter: 5 };
  state.grill[1].progress = 0.4;
  state.pot.tomatoes = 1;
  state.plating.plate = { kind: 'plate', items: ['bun', 'grilled patty'] };
  state.floaters.push({ x: 1080, y: 480, text: '+$18', life: 1 });
}

/**
 * Set `world` to the named scene (start, play, serve or end; any other name is
 * start) and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'play') {
    stagePlay(world);
    return { screen: SCREEN_PLAY, best: 86 };
  }
  if (name === 'serve') {
    const state = world.state;
    state.timeLeft = 64;
    state.elapsed = 86;
    state.level = 3;
    state.coins = 92;
    state.served = 7;
    state.combo = 3;
    state.bestCombo = 3;
    state.orders = [];
    addOrder(world, 'soup', 30);
    addOrder(world, 'burger', 18);
    // A finished burger waits on the plating counter, ready to serve.
    state.plating.plate = { kind: 'plate', items: [...RECIPES.burger.components] };
    // The chef carries a finished salad toward the serve window.
    state.chef.x = 880;
    state.chef.y = 452;
    state.chef.carrying = { kind: 'plate', items: [...RECIPES.salad.components] };
    state.board.item = { name: 'tomato', result: 'chopped tomato', seconds: 2.2 };
    state.board.progress = 1;
    state.pot.tomatoes = 2;
    state.pot.cooking = true;
    state.pot.progress = 0.6;
    state.floaters.push({ x: 1080, y: 480, text: '+$24', life: 1 });
    return { screen: SCREEN_PLAY, best: 118 };
  }
  if (name === 'end') {
    const state = world.state;
    state.timeLeft = 0;
    state.elapsed = 150;
    state.level = 4;
    state.coins = 132;
    state.served = 9;
    state.combo = 0;
    state.bestCombo = 4;
    state.lives = 2;
    state.orders = [];
    state.over = true;
    state.won = true;
    state.chef.x = 640;
    state.chef.y = 455;
    state.chef.carrying = null;
    return { screen: SCREEN_OVER, best: 132 };
  }
  // Title: the kitchen is already alive behind the panel — two tickets, a
  // burger half-built on the counter, food chopping and grilling.
  const state = world.state;
  state.orders = [];
  addOrder(world, 'burger', 44);
  addOrder(world, 'salad', 36);
  state.chef.x = 420;
  state.chef.y = 452;
  state.board.item = { name: 'tomato', result: 'chopped tomato', seconds: 2.2 };
  state.board.progress = 0.4;
  state.grill[0].item = { name: 'patty', result: 'grilled patty', seconds: 6, burnAfter: 6 };
  state.grill[0].progress = 0.5;
  state.plating.plate = { kind: 'plate', items: ['bun'] };
  return { screen: SCREEN_TITLE, best: 86 };
}

export { DISH_IDS };
