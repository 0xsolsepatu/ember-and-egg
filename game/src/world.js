// Ember & Egg — the world: orders, stations, cooking and serving.
// The chef carries one thing at a time (an ingredient or a plate). Raw food is
// prepared at the board, grill or pot, assembled on a plate at the plating
// counter, and served at the window before the ticket's patience runs out.
import {
  CHEF, DAY_SECONDS, DISH_IDS, ING, LEVEL_SECONDS, MAX_LIVES, MAX_ORDERS,
  ORDER_INTERVAL, PATIENCE, PREP, RECIPES, SOUP, STATIONS, WALK,
} from './config.js';

export const EVENT_PICKUP = 1;
export const EVENT_PLACE = 2;
export const EVENT_CHOP = 4;
export const EVENT_COOK_DONE = 8;
export const EVENT_SERVE = 16;
export const EVENT_EXPIRE = 32;
export const EVENT_BURN = 64;
export const EVENT_OVER = 128;
export const EVENT_ERROR = 256;
export const EVENT_TRASH = 512;

let nextOrderId = 1;

function emptyPlate() {
  return { kind: 'plate', items: [] };
}

function stationById(world, id) {
  return world.stations.find((s) => s.id === id);
}

function nearestStation(world) {
  const chef = world.state.chef;
  let best = null;
  let bestDist = Infinity;
  for (const station of world.stations) {
    const cx = station.x + station.w / 2;
    const cy = station.y + station.h / 2;
    // The chef stands below the top counter or above the bottom one; measure
    // to the nearest edge of the station instead of its centre.
    const dx = Math.max(Math.abs(chef.x - cx) - station.w / 2, 0);
    const dy = Math.max(Math.abs(chef.y - cy) - station.h / 2, 0);
    const dist = Math.hypot(dx, dy);
    if (dist < bestDist) {
      bestDist = dist;
      best = station;
    }
  }
  return bestDist <= 78 ? best : null;
}

function orderInterval(level) {
  return Math.max(
    ORDER_INTERVAL.min,
    ORDER_INTERVAL.start - (level - 1) * ORDER_INTERVAL.shrinkPerLevel,
  );
}

function patienceFor(level) {
  return Math.max(PATIENCE.min, PATIENCE.base - (level - 1) * 4);
}

function dishMatches(order, plate) {
  const want = [...RECIPES[order.dish].components].sort();
  const got = [...plate.items].sort();
  return want.length === got.length && want.every((c, i) => c === got[i]);
}

function plateFitsSomeRecipe(plate, item) {
  return DISH_IDS.some((id) => {
    const need = RECIPES[id].components;
    const trial = [...plate.items, item];
    return trial.every((c) => need.filter((n) => n === c).length >= trial.filter((t) => t === c).length)
      && trial.length <= need.length;
  });
}

export function createWorld(random) {
  const state = {
    timeLeft: DAY_SECONDS,
    elapsed: 0,
    level: 1,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    lives: MAX_LIVES,
    orders: [],
    chef: { x: 640, y: 455, carrying: null, moving: false, face: 1 },
    board: { item: null, progress: 0 },
    grill: [{ item: null, progress: 0 }, { item: null, progress: 0 }],
    pot: { tomatoes: 0, progress: 0, cooking: false, ready: false },
    plating: { plate: null },
    orderTimer: 6,
    over: false,
    won: false,
    floaters: [],
    lastServe: null,
  };

  const world = {
    state,
    stations: STATIONS.map((s) => ({ ...s })),
    random,

    reset() {
      state.timeLeft = DAY_SECONDS;
      state.elapsed = 0;
      state.level = 1;
      state.coins = 0;
      state.served = 0;
      state.combo = 0;
      state.bestCombo = 0;
      state.lives = MAX_LIVES;
      state.orders = [];
      state.chef = { x: 640, y: 455, carrying: null, moving: false, face: 1 };
      state.board = { item: null, progress: 0 };
      state.grill = [{ item: null, progress: 0 }, { item: null, progress: 0 }];
      state.pot = { tomatoes: 0, progress: 0, cooking: false, ready: false };
      state.plating = { plate: null };
      state.orderTimer = 6;
      state.over = false;
      state.won = false;
      state.floaters = [];
      state.lastServe = null;
      this.spawnOrder();
    },

    spawnOrder() {
      if (state.orders.length >= MAX_ORDERS) return;
      const dish = random.pick(DISH_IDS);
      const patience = patienceFor(state.level);
      state.orders.push({ id: nextOrderId, dish, patience, maxPatience: patience });
      nextOrderId += 1;
    },

    /** A carried ingredient goes onto the plate it is being added to, or fails. */
    addToPlate(plate, itemName) {
      if (!plateFitsSomeRecipe(plate, itemName)) return false;
      plate.items.push(itemName);
      return true;
    },

    interact() {
      const chef = state.chef;
      const station = nearestStation(this);
      if (!station) return 0;
      const held = chef.carrying;
      const heldName = held && held.kind === 'ingredient' ? held.name : null;

      // Serving takes the plate in hand to the window.
      if (station.kind === 'serve') {
        if (!held || held.kind !== 'plate') return EVENT_ERROR;
        const order = state.orders.find((o) => dishMatches(o, held));
        if (!order) return EVENT_ERROR;
        const tip = Math.round(order.patience * 0.35);
        const comboBonus = state.combo * 2;
        const earned = RECIPES[order.dish].pay + tip + comboBonus;
        state.coins += earned;
        state.served += 1;
        state.combo += 1;
        state.bestCombo = Math.max(state.bestCombo, state.combo);
        state.lastServe = { dish: order.dish, earned, tip };
        state.orders = state.orders.filter((o) => o.id !== order.id);
        chef.carrying = null;
        state.floaters.push({ x: station.x + 40, y: station.y - 10, text: `+$${earned}`, life: 1.2 });
        return EVENT_SERVE;
      }

      if (station.kind === 'trash') {
        if (!held) return EVENT_ERROR;
        chef.carrying = null;
        return EVENT_TRASH;
      }

      if (station.kind === 'plates') {
        if (held) return EVENT_ERROR;
        chef.carrying = emptyPlate();
        return EVENT_PICKUP;
      }

      if (station.kind === 'bin') {
        const ing = station.ing;
        if (held && held.kind === 'plate') {
          // Dropping a ready-to-eat ingredient straight onto the carried plate.
          if (ing === ING.BUN || ing === ING.CHEESE) {
            if (!this.addToPlate(held, ing)) return EVENT_ERROR;
            return EVENT_PLACE;
          }
          return EVENT_ERROR;
        }
        if (held) return EVENT_ERROR;
        chef.carrying = { kind: 'ingredient', name: ing };
        return EVENT_PICKUP;
      }

      if (station.kind === 'board') {
        const board = state.board;
        if (board.item && board.progress >= 1) {
          if (held) {
            if (held.kind === 'plate' && this.addToPlate(held, board.item.result)) {
              board.item = null;
              board.progress = 0;
              return EVENT_PLACE;
            }
            return EVENT_ERROR;
          }
          chef.carrying = { kind: 'ingredient', name: board.item.result };
          board.item = null;
          board.progress = 0;
          return EVENT_PICKUP;
        }
        if (board.item) return 0; // Still chopping.
        if (!heldName) return EVENT_ERROR;
        const prep = PREP[heldName];
        if (!prep || prep.station !== 'board') return EVENT_ERROR;
        board.item = { name: heldName, result: prep.result, seconds: prep.seconds };
        board.progress = 0;
        chef.carrying = null;
        return EVENT_PLACE;
      }

      if (station.kind === 'grill') {
        const slot = state.grill.find((s) => s.item && s.progress >= 1)
          ?? state.grill.find((s) => !s.item);
        if (!slot) return EVENT_ERROR;
        if (slot.item) {
          const done = slot.item.result;
          if (held) {
            if (held.kind === 'plate' && this.addToPlate(held, done)) {
              slot.item = null;
              slot.progress = 0;
              return EVENT_PLACE;
            }
            return EVENT_ERROR;
          }
          chef.carrying = { kind: 'ingredient', name: done };
          slot.item = null;
          slot.progress = 0;
          return EVENT_PICKUP;
        }
        if (!heldName) return EVENT_ERROR;
        const prep = PREP[heldName];
        if (!prep || prep.station !== 'grill') return EVENT_ERROR;
        slot.item = { name: heldName, result: prep.result, seconds: prep.seconds, burnAfter: prep.burnAfter };
        slot.progress = 0;
        chef.carrying = null;
        return EVENT_PLACE;
      }

      if (station.kind === 'pot') {
        const pot = state.pot;
        if (pot.ready) {
          if (held) {
            if (held.kind === 'plate' && this.addToPlate(held, 'tomato soup')) {
              pot.ready = false;
              pot.tomatoes = 0;
              pot.progress = 0;
              return EVENT_PLACE;
            }
            return EVENT_ERROR;
          }
          chef.carrying = { kind: 'ingredient', name: 'tomato soup' };
          pot.ready = false;
          pot.tomatoes = 0;
          pot.progress = 0;
          return EVENT_PICKUP;
        }
        if (pot.cooking) return 0;
        if (heldName !== 'chopped tomato') return EVENT_ERROR;
        pot.tomatoes += 1;
        chef.carrying = null;
        if (pot.tomatoes >= SOUP.tomatoes) pot.cooking = true;
        return EVENT_PLACE;
      }

      if (station.kind === 'plating') {
        const counter = state.plating;
        if (counter.plate && !held) {
          chef.carrying = counter.plate;
          counter.plate = null;
          return EVENT_PICKUP;
        }
        if (counter.plate && held && held.kind === 'ingredient') {
          if (!this.addToPlate(counter.plate, held.name)) return EVENT_ERROR;
          chef.carrying = null;
          return EVENT_PLACE;
        }
        if (!counter.plate && held && held.kind === 'plate') {
          counter.plate = held;
          chef.carrying = null;
          return EVENT_PLACE;
        }
        return EVENT_ERROR;
      }

      return 0;
    },

    step(dt, moveX, moveY) {
      if (state.over) return 0;
      let events = 0;
      const chef = state.chef;

      // Move the chef through the open floor.
      const len = Math.hypot(moveX, moveY);
      if (len > 0) {
        const nx = chef.x + (moveX / len) * CHEF.speed * dt;
        const ny = chef.y + (moveY / len) * CHEF.speed * dt;
        chef.x = Math.min(WALK.right, Math.max(WALK.left, nx));
        chef.y = Math.min(WALK.bottom, Math.max(WALK.top, ny));
        chef.moving = true;
        if (moveX !== 0) chef.face = moveX > 0 ? 1 : -1;
      } else {
        chef.moving = false;
      }

      state.elapsed += dt;
      state.timeLeft = Math.max(0, DAY_SECONDS - state.elapsed);
      state.level = Math.min(5, Math.floor(state.elapsed / LEVEL_SECONDS) + 1);

      // Chopping finishes on its own once started.
      if (state.board.item && state.board.progress < 1) {
        state.board.progress = Math.min(1, state.board.progress + dt / state.board.item.seconds);
        if (state.board.progress >= 1) events |= EVENT_CHOP;
      }

      // Grill slots cook, then burn if left too long.
      for (const slot of state.grill) {
        if (!slot.item) continue;
        slot.progress = Math.min(1.4, slot.progress + dt / slot.item.seconds);
        if (slot.progress >= 1 && slot.progress - dt / slot.item.seconds < 1) events |= EVENT_COOK_DONE;
        if (slot.progress >= 1 + slot.item.burnAfter / slot.item.seconds) {
          slot.item = { name: 'burnt food', result: 'burnt food', seconds: 1, burnAfter: 0 };
          slot.progress = 1;
          events |= EVENT_BURN;
        }
      }

      // The pot simmers once it holds two chopped tomatoes.
      if (state.pot.cooking && !state.pot.ready) {
        state.pot.progress = Math.min(1, state.pot.progress + dt / SOUP.seconds);
        if (state.pot.progress >= 1) {
          state.pot.ready = true;
          state.pot.cooking = false;
          events |= EVENT_COOK_DONE;
        }
      }

      // New tickets arrive on a clock that quickens as the day goes on.
      state.orderTimer -= dt;
      if (state.orderTimer <= 0) {
        this.spawnOrder();
        state.orderTimer = orderInterval(state.level);
      }

      // Tickets lose patience; an abandoned ticket costs a heart.
      for (const order of [...state.orders]) {
        order.patience -= dt;
        if (order.patience <= 0) {
          state.orders = state.orders.filter((o) => o.id !== order.id);
          state.lives -= 1;
          state.combo = 0;
          events |= EVENT_EXPIRE;
          state.floaters.push({ x: 640, y: 180, text: 'Order walked out!', life: 1.4 });
        }
      }

      for (const floater of state.floaters) floater.life -= dt;
      state.floaters = state.floaters.filter((f) => f.life > 0);

      if (state.lives <= 0 || state.timeLeft <= 0) {
        state.over = true;
        state.won = state.lives > 0;
        events |= EVENT_OVER;
      }
      return events;
    },
  };

  world.reset();
  return world;
}
