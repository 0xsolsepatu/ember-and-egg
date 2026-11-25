// Ember & Egg — tuning, recipes and layout constants.
// One file holds every number a designer would tweak: field size, chef speed,
// the four recipes, station timings and the day clock.
export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const DAY_SECONDS = 150;
export const BEST_KEY = 'ember-and-egg-best';

export const CHEF = { radius: 22, speed: 260 };

// Ingredient ids. A leading "raw:" or "chopped:" / "grilled:" / "fried:" prefix
// marks the preparation state; the base name is the ingredient itself.
export const ING = {
  BUN: 'bun',
  PATTY: 'patty',
  TOMATO: 'tomato',
  LETTUCE: 'lettuce',
  CHEESE: 'cheese',
  EGG: 'egg',
};

export const INGREDIENTS = {
  [ING.BUN]: { name: 'Bun', color: '#e8a94f', dark: '#b97e2e' },
  [ING.PATTY]: { name: 'Patty', color: '#8a5a33', dark: '#5f3a1e' },
  [ING.TOMATO]: { name: 'Tomato', color: '#e5484d', dark: '#b02a2e' },
  [ING.LETTUCE]: { name: 'Lettuce', color: '#5fb84a', dark: '#3c8a2c' },
  [ING.CHEESE]: { name: 'Cheese', color: '#f7c948', dark: '#d9a41f' },
  [ING.EGG]: { name: 'Egg', color: '#fdf6e3', dark: '#e8d9a8' },
};

// How each ingredient is prepared: which station, how long, and what it becomes.
export const PREP = {
  [ING.TOMATO]: { station: 'board', seconds: 2.2, result: 'chopped tomato' },
  [ING.LETTUCE]: { station: 'board', seconds: 2.2, result: 'chopped lettuce' },
  [ING.PATTY]: { station: 'grill', seconds: 6, burnAfter: 6, result: 'grilled patty' },
  [ING.EGG]: { station: 'grill', seconds: 4, burnAfter: 5, result: 'fried egg' },
};

// Recipes: dish id -> display name, the components a plate must hold, base pay.
export const RECIPES = {
  burger: {
    name: 'Sunny Burger',
    components: ['bun', 'grilled patty', 'chopped lettuce', 'chopped tomato'],
    pay: 14,
    color: '#e8a94f',
  },
  salad: {
    name: 'Garden Salad',
    components: ['chopped lettuce', 'chopped tomato', 'cheese'],
    pay: 10,
    color: '#5fb84a',
  },
  omelette: {
    name: 'Golden Omelette',
    components: ['fried egg', 'cheese'],
    pay: 12,
    color: '#f7c948',
  },
  soup: {
    name: 'Ember Tomato Soup',
    components: ['tomato soup'],
    pay: 13,
    color: '#e5484d',
  },
};
export const DISH_IDS = ['burger', 'salad', 'omelette', 'soup'];

// Soup is made in the pot: two chopped tomatoes, then it simmers.
export const SOUP = { tomatoes: 2, seconds: 5 };

// Stations live on the long counter that runs across the kitchen. Each entry is
// { id, kind, x, y, w, h, label } in field coordinates.
export const STATIONS = [
  { id: 'bin-bun', kind: 'bin', ing: ING.BUN, x: 36, y: 300, w: 92, h: 74, label: 'Buns' },
  { id: 'bin-patty', kind: 'bin', ing: ING.PATTY, x: 140, y: 300, w: 92, h: 74, label: 'Patties' },
  { id: 'bin-tomato', kind: 'bin', ing: ING.TOMATO, x: 244, y: 300, w: 92, h: 74, label: 'Tomatoes' },
  { id: 'bin-lettuce', kind: 'bin', ing: ING.LETTUCE, x: 348, y: 300, w: 92, h: 74, label: 'Lettuce' },
  { id: 'bin-cheese', kind: 'bin', ing: ING.CHEESE, x: 452, y: 300, w: 92, h: 74, label: 'Cheese' },
  { id: 'bin-egg', kind: 'bin', ing: ING.EGG, x: 556, y: 300, w: 92, h: 74, label: 'Eggs' },
  { id: 'board', kind: 'board', x: 700, y: 292, w: 150, h: 88, label: 'Chopping Board' },
  { id: 'grill', kind: 'grill', x: 890, y: 292, w: 170, h: 88, label: 'Grill' },
  { id: 'pot', kind: 'pot', x: 1100, y: 292, w: 150, h: 88, label: 'Soup Pot' },
  { id: 'plates', kind: 'plates', x: 36, y: 520, w: 110, h: 76, label: 'Plates' },
  { id: 'plating', kind: 'plating', x: 180, y: 520, w: 300, h: 76, label: 'Plating Counter' },
  { id: 'serve', kind: 'serve', x: 980, y: 520, w: 264, h: 76, label: 'Serve Window' },
  { id: 'trash', kind: 'trash', x: 560, y: 520, w: 90, h: 76, label: 'Trash' },
];

// The chef walks the open floor between the top counter (y 300..388) and the
// bottom counter (y 520..596); the walls keep them inside the room.
export const WALK = { top: 400, bottom: 508, left: 30, right: 1250 };

export const PATIENCE = { base: 55, min: 32 };
export const ORDER_INTERVAL = { start: 14, min: 7, shrinkPerLevel: 1.1 };
export const LEVEL_SECONDS = 40;
export const MAX_ORDERS = 4;
export const MAX_LIVES = 3;
export const TIP_PER_SECOND_LEFT = 0.35;
export const COMBO_BONUS = 2;
