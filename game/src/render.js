// Ember & Egg — the renderer: one canvas, all vector art, no image files.
// Warm wood, cream tile and brass; every dish is drawn from shapes so the
// food looks worth serving and every counter reads at a glance.
import { DAY_SECONDS, FIELD, INGREDIENTS, MAX_LIVES, RECIPES, STATIONS } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const CREAM = '#fdf3dd';
const WALL = '#f7e3bd';
const WOOD = '#8a5a33';
const WOOD_DARK = '#6b4224';
const STEEL = '#c9ced6';
const INK = '#3a2a1a';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function text(ctx, str, x, y, size, color, align, weight, font) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'bold'} ${size}px ${font || "'Trebuchet MS', Verdana, sans-serif"}`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function progressBar(ctx, x, y, w, h, frac, color, bg) {
  ctx.fillStyle = bg || 'rgba(0,0,0,0.35)';
  rr(ctx, x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = color;
  rr(ctx, x, y, w * Math.max(0, Math.min(1, frac)), h, h / 2);
  ctx.fill();
}

/** One ingredient, drawn at (x, y) with the given radius. */
export function drawIngredient(ctx, name, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  switch (name) {
    case 'bun':
      ctx.fillStyle = '#e8a94f';
      ellipse(ctx, 0, -r * 0.15, r, r * 0.62);
      ctx.fill();
      ctx.fillStyle = '#f2c078';
      ellipse(ctx, 0, -r * 0.3, r * 0.85, r * 0.4);
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      [[-0.4, -0.45], [0.1, -0.55], [0.45, -0.4]].forEach(([dx, dy]) => {
        ellipse(ctx, dx * r, dy * r, r * 0.12, r * 0.08);
        ctx.fill();
      });
      ctx.fillStyle = '#d98f2b';
      ellipse(ctx, 0, r * 0.32, r * 0.92, r * 0.3);
      ctx.fill();
      break;
    case 'patty':
      ctx.fillStyle = '#8a5a33';
      ellipse(ctx, 0, 0, r, r * 0.55);
      ctx.fill();
      ctx.fillStyle = '#6b4224';
      ellipse(ctx, 0, r * 0.12, r * 0.85, r * 0.4);
      ctx.fill();
      break;
    case 'grilled patty':
      ctx.fillStyle = '#6b3d1e';
      ellipse(ctx, 0, 0, r, r * 0.55);
      ctx.fill();
      ctx.strokeStyle = '#3f2410';
      ctx.lineWidth = r * 0.14;
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, -r * 0.25);
      ctx.lineTo(r * 0.6, r * 0.25);
      ctx.moveTo(-r * 0.6, r * 0.25);
      ctx.lineTo(r * 0.6, -r * 0.25);
      ctx.stroke();
      break;
    case 'tomato':
      ctx.fillStyle = '#e5484d';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.92, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2827f';
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3c8a2c';
      ellipse(ctx, 0, -r * 0.9, r * 0.3, r * 0.16);
      ctx.fill();
      break;
    case 'chopped tomato':
      ctx.fillStyle = '#e5484d';
      ellipse(ctx, 0, 0, r, r * 0.6);
      ctx.fill();
      ctx.fillStyle = '#f2827f';
      ellipse(ctx, 0, 0, r * 0.6, r * 0.34);
      ctx.fill();
      ctx.fillStyle = '#c22e33';
      ellipse(ctx, 0, 0, r * 0.3, r * 0.16);
      ctx.fill();
      break;
    case 'lettuce':
      ctx.fillStyle = '#5fb84a';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7fd468';
      ctx.beginPath();
      ctx.arc(-r * 0.25, -r * 0.2, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'chopped lettuce':
      ctx.fillStyle = '#5fb84a';
      for (let i = 0; i < 3; i += 1) {
        ctx.save();
        ctx.rotate((i - 1) * 0.5);
        ellipse(ctx, 0, -r * 0.1, r * 0.75, r * 0.35);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#8ede72';
      ellipse(ctx, 0, -r * 0.1, r * 0.4, r * 0.2);
      ctx.fill();
      break;
    case 'cheese':
      ctx.fillStyle = '#f7c948';
      ctx.beginPath();
      ctx.moveTo(-r, r * 0.55);
      ctx.lineTo(r, r * 0.55);
      ctx.lineTo(0, -r * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d9a41f';
      [[-0.3, 0.2], [0.25, 0.05]].forEach(([dx, dy]) => {
        ctx.beginPath();
        ctx.arc(dx * r, dy * r, r * 0.14, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    case 'egg':
      ctx.fillStyle = '#fdf6e3';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f2e3b8';
      ctx.beginPath();
      ctx.arc(r * 0.15, r * 0.2, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'fried egg':
      ctx.fillStyle = '#fffdf5';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f7b731';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fcd34d';
      ctx.beginPath();
      ctx.arc(-r * 0.12, -r * 0.12, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'tomato soup':
      ctx.fillStyle = '#fff';
      ellipse(ctx, 0, 0, r, r * 0.55);
      ctx.fill();
      ctx.fillStyle = '#d9382b';
      ellipse(ctx, 0, -r * 0.1, r * 0.85, r * 0.4);
      ctx.fill();
      ctx.fillStyle = '#f2827f';
      ellipse(ctx, -r * 0.2, -r * 0.2, r * 0.3, r * 0.12);
      ctx.fill();
      ctx.fillStyle = '#5fb84a';
      ellipse(ctx, r * 0.3, -r * 0.15, r * 0.18, r * 0.08);
      ctx.fill();
      break;
    case 'burnt food':
      ctx.fillStyle = '#2b2b2b';
      ellipse(ctx, 0, 0, r, r * 0.55);
      ctx.fill();
      ctx.fillStyle = '#555';
      ellipse(ctx, 0, -r * 0.1, r * 0.5, r * 0.25);
      ctx.fill();
      break;
    default:
      ctx.fillStyle = INGREDIENTS[name] ? INGREDIENTS[name].color : '#999';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fill();
  }
  ctx.restore();
}

function drawPlate(ctx, items, x, y, r) {
  ctx.fillStyle = '#ffffff';
  ellipse(ctx, x, y, r, r * 0.42);
  ctx.fill();
  ctx.fillStyle = '#dfe3e8';
  ellipse(ctx, x, y, r * 0.72, r * 0.3);
  ctx.fill();
  const stack = items.slice(0, 4);
  stack.forEach((item, i) => {
    drawIngredient(ctx, item, x, y - r * 0.42 - i * r * 0.42, r * 0.62);
  });
}

function drawChef(ctx, chef, t) {
  const bob = chef.moving ? Math.sin(t * 14) * 2 : Math.sin(t * 2) * 1;
  const { x, y } = chef;
  ctx.save();
  ctx.translate(x, y + bob * 0.4);
  // Shadow.
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ellipse(ctx, 0, 26, 26, 8);
  ctx.fill();
  // Body and apron.
  ctx.fillStyle = '#f5f0e6';
  rr(ctx, -16, -6, 32, 30, 10);
  ctx.fill();
  ctx.fillStyle = '#e2574c';
  rr(ctx, -12, 2, 24, 22, 8);
  ctx.fill();
  // Arms.
  ctx.fillStyle = '#f5f0e6';
  rr(ctx, -24, -2, 10, 18, 5);
  ctx.fill();
  rr(ctx, 14, -2, 10, 18, 5);
  ctx.fill();
  // Head.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(0, -20, 14, 0, Math.PI * 2);
  ctx.fill();
  // Toque.
  ctx.fillStyle = '#ffffff';
  rr(ctx, -13, -42, 26, 16, 8);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-8, -40, 7, 0, Math.PI * 2);
  ctx.arc(0, -44, 8, 0, Math.PI * 2);
  ctx.arc(8, -40, 7, 0, Math.PI * 2);
  ctx.fill();
  // Eyes and smile.
  ctx.fillStyle = '#2b2118';
  ctx.beginPath();
  ctx.arc(-5, -20, 1.8, 0, Math.PI * 2);
  ctx.arc(5, -20, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -16, 4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();

  // What the chef carries rides above the toque.
  const held = chef.carrying;
  if (held) {
    if (held.kind === 'plate') drawPlate(ctx, held.items, x, y - 58, 26);
    else drawIngredient(ctx, held.name, x, y - 56, 16);
  }
}

function drawStation(ctx, station, state, t) {
  const { x, y, w, h } = station;
  ctx.save();
  if (station.kind === 'bin') {
    ctx.fillStyle = WOOD;
    rr(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = WOOD_DARK;
    rr(ctx, x + 4, y + 4, w - 8, h - 8, 6);
    ctx.fill();
    drawIngredient(ctx, station.ing, x + w / 2, y + h / 2 - 6, 20);
    ctx.fillStyle = CREAM;
    rr(ctx, x + 6, y + h - 20, w - 12, 15, 4);
    ctx.fill();
    text(ctx, station.label, x + w / 2, y + h - 12, 10, INK, 'center', 'bold');
  } else if (station.kind === 'board') {
    ctx.fillStyle = '#d9a05b';
    rr(ctx, x, y + 8, w, h - 16, 10);
    ctx.fill();
    ctx.fillStyle = '#e8bc7d';
    rr(ctx, x + 6, y + 14, w - 12, h - 28, 8);
    ctx.fill();
    const item = state.board.item;
    if (item) {
      drawIngredient(ctx, item.name, x + w / 2 - 14, y + h / 2, 18);
      if (state.board.progress < 1) {
        // Knife chopping.
        const swing = Math.sin(t * 18) * 8;
        ctx.fillStyle = '#c9ced6';
        ctx.save();
        ctx.translate(x + w - 34, y + 22 + swing);
        ctx.rotate(0.5);
        rr(ctx, 0, 0, 34, 7, 3);
        ctx.fill();
        ctx.restore();
        progressBar(ctx, x + 14, y + h - 16, w - 28, 8, state.board.progress, '#5fb84a');
      } else {
        text(ctx, 'READY!', x + w / 2, y + h - 12, 11, '#2f7d1e', 'center', 'bold');
      }
    } else {
      text(ctx, 'Chop here', x + w / 2, y + h / 2, 12, '#7a5a33', 'center', 'bold');
    }
    text(ctx, station.label, x + w / 2, y + h + 18, 11, INK, 'center', 'bold');
  } else if (station.kind === 'grill') {
    ctx.fillStyle = '#4a4a52';
    rr(ctx, x, y, w, h, 10);
    ctx.fill();
    ctx.fillStyle = '#2e2e33';
    rr(ctx, x + 8, y + 8, w - 16, h - 26, 6);
    ctx.fill();
    ctx.strokeStyle = '#6b6b73';
    ctx.lineWidth = 3;
    for (let i = 1; i < 5; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 10, y + 8 + (i * (h - 26)) / 5);
      ctx.lineTo(x + w - 10, y + 8 + (i * (h - 26)) / 5);
      ctx.stroke();
    }
    state.grill.forEach((slot, i) => {
      const sx = x + 42 + i * 86;
      const sy = y + 34;
      if (slot.item) {
        drawIngredient(ctx, slot.item.name, sx, sy, 18);
        const frac = Math.min(1, slot.progress);
        progressBar(ctx, sx - 26, y + h - 16, 52, 7, frac, slot.progress >= 1 ? '#f7c948' : '#e2574c');
        if (slot.progress >= 1) {
          ctx.fillStyle = 'rgba(120,120,120,0.5)';
          ctx.beginPath();
          ctx.arc(sx + 10, sy - 26 - ((t * 20) % 10), 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    // Flames under the grill.
    ctx.fillStyle = '#ff9f1c';
    for (let i = 0; i < 4; i += 1) {
      const fx = x + 20 + i * 42;
      const fh = 6 + Math.sin(t * 9 + i * 2) * 3;
      ctx.beginPath();
      ctx.moveTo(fx, y + h - 2);
      ctx.lineTo(fx + 8, y + h - 2 - fh);
      ctx.lineTo(fx + 16, y + h - 2);
      ctx.closePath();
      ctx.fill();
    }
    text(ctx, station.label, x + w / 2, y + h + 18, 11, INK, 'center', 'bold');
  } else if (station.kind === 'pot') {
    const pot = state.pot;
    ctx.fillStyle = '#3f3f46';
    rr(ctx, x, y + 10, w, h - 18, 12);
    ctx.fill();
    ctx.fillStyle = '#565660';
    ellipse(ctx, x + w / 2, y + 14, w / 2 - 8, 12);
    ctx.fill();
    if (pot.ready) {
      ctx.fillStyle = '#d9382b';
      ellipse(ctx, x + w / 2, y + 14, w / 2 - 18, 8);
      ctx.fill();
      text(ctx, 'SOUP READY!', x + w / 2, y + h - 12, 11, '#2f7d1e', 'center', 'bold');
    } else if (pot.cooking) {
      ctx.fillStyle = '#d9382b';
      ellipse(ctx, x + w / 2, y + 14, w / 2 - 18, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(x + w / 2 - 24 + i * 24, y - 4 - ((t * 14 + i * 9) % 16), 4, 0, Math.PI * 2);
        ctx.fill();
      }
      progressBar(ctx, x + 16, y + h - 16, w - 32, 8, pot.progress, '#e2574c');
    } else {
      text(ctx, pot.tomatoes === 0 ? 'Add 2 chopped tomatoes' : `Tomatoes: ${pot.tomatoes}/2`, x + w / 2, y + h / 2 + 8, 12, CREAM, 'center', 'bold');
    }
    text(ctx, station.label, x + w / 2, y + h + 18, 11, INK, 'center', 'bold');
  } else if (station.kind === 'plates') {
    ctx.fillStyle = STEEL;
    rr(ctx, x, y, w, h, 8);
    ctx.fill();
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = '#fff';
      ellipse(ctx, x + w / 2, y + 22 + i * 12, 34, 8);
      ctx.fill();
      ctx.fillStyle = '#dfe3e8';
      ellipse(ctx, x + w / 2, y + 22 + i * 12, 24, 5);
      ctx.fill();
    }
    text(ctx, station.label, x + w / 2, y + h + 18, 11, INK, 'center', 'bold');
  } else if (station.kind === 'plating') {
    ctx.fillStyle = STEEL;
    rr(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = '#aeb4bd';
    rr(ctx, x + 6, y + 6, w - 12, 10, 5);
    ctx.fill();
    const plate = state.plating.plate;
    if (plate) {
      drawPlate(ctx, plate.items, x + w / 2, y + h / 2 + 6, 30);
      const match = Object.keys(RECIPES).find((id) => {
        const want = [...RECIPES[id].components].sort();
        const got = [...plate.items].sort();
        return want.length === got.length && want.every((c, i) => c === got[i]);
      });
      if (match) {
        text(ctx, `${RECIPES[match].name} — READY TO SERVE`, x + w / 2, y + h - 12, 11, '#2f7d1e', 'center', 'bold');
      } else if (plate.items.length > 0) {
        text(ctx, `Assembling… ${plate.items.length} item${plate.items.length > 1 ? 's' : ''}`, x + w / 2, y + h - 12, 11, INK, 'center', 'bold');
      } else {
        text(ctx, 'Empty plate — add ingredients', x + w / 2, y + h - 12, 11, INK, 'center', 'bold');
      }
    } else {
      text(ctx, 'Put a plate here to build a dish', x + w / 2, y + h / 2 + 8, 12, '#5a5a5a', 'center', 'bold');
    }
    text(ctx, station.label, x + w / 2, y + h + 18, 11, INK, 'center', 'bold');
  } else if (station.kind === 'serve') {
    ctx.fillStyle = '#b3402f';
    rr(ctx, x, y - 6, w, 22, 8);
    ctx.fill();
    ctx.fillStyle = '#8a2d20';
    for (let i = 0; i < 6; i += 1) {
      rr(ctx, x + 8 + i * 44, y - 6, 30, 22, 6);
      ctx.fill();
    }
    ctx.fillStyle = '#5a3a22';
    rr(ctx, x, y + 14, w, h - 14, 8);
    ctx.fill();
    ctx.fillStyle = CREAM;
    rr(ctx, x + 10, y + 22, w - 20, h - 40, 6);
    ctx.fill();
    // Service bell.
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 38, 12, Math.PI, 0);
    ctx.fill();
    rr(ctx, x + w / 2 - 14, y + 36, 28, 4, 2);
    ctx.fill();
    text(ctx, 'SERVE', x + w / 2, y + h - 12, 13, CREAM, 'center', 'bold');
    text(ctx, station.label, x + w / 2, y + h + 18, 11, INK, 'center', 'bold');
  } else if (station.kind === 'trash') {
    ctx.fillStyle = '#5a6b7a';
    rr(ctx, x + 12, y + 8, w - 24, h - 8, 8);
    ctx.fill();
    ctx.fillStyle = '#42505e';
    rr(ctx, x + 6, y + 2, w - 12, 12, 6);
    ctx.fill();
    text(ctx, 'TRASH', x + w / 2, y + h / 2 + 14, 12, '#dfe7ee', 'center', 'bold');
    text(ctx, station.label, x + w / 2, y + h + 18, 11, INK, 'center', 'bold');
  }
  ctx.restore();
}

function drawOrderBoard(ctx, state, t) {
  // Wooden rail with pinned tickets.
  ctx.fillStyle = WOOD_DARK;
  rr(ctx, 28, 66, 1224, 110, 12);
  ctx.fill();
  ctx.fillStyle = '#a06a3a';
  rr(ctx, 34, 72, 1212, 98, 9);
  ctx.fill();
  text(ctx, 'ORDER BOARD', 110, 84, 13, '#ffe9b0', 'left', 'bold');
  if (state.orders.length === 0) {
    const line = state.over
      ? 'The day is done — thank you, regulars!'
      : 'No orders yet — the lunch rush is coming…';
    text(ctx, line, 640, 130, 15, '#ffe9b0', 'center', 'bold');
    return;
  }
  state.orders.forEach((order, i) => {
    const recipe = RECIPES[order.dish];
    const x = 230 + i * 250;
    const y = 76;
    const w = 236;
    const h = 100;
    const urgent = order.patience < 12;
    ctx.fillStyle = urgent && Math.sin(t * 8) > 0 ? '#ffe1d6' : '#fffdf5';
    rr(ctx, x, y, w, h, 8);
    ctx.fill();
    ctx.fillStyle = recipe.color;
    rr(ctx, x, y, w, 26, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    rr(ctx, x, y + 18, w, 8, 0);
    ctx.fill();
    text(ctx, `#${order.id}  ${recipe.name}`, x + w / 2, y + 14, 14, '#fff', 'center', 'bold');
    // Component icons.
    recipe.components.forEach((comp, ci) => {
      drawIngredient(ctx, comp, x + 28 + ci * 48, y + 48, 15);
    });
    text(ctx, `$${recipe.pay}`, x + w - 34, y + 48, 15, INK, 'center', 'bold');
    // Patience bar.
    const frac = Math.max(0, order.patience / order.maxPatience);
    progressBar(ctx, x + 14, y + h - 16, w - 28, 8, frac, frac > 0.5 ? '#5fb84a' : frac > 0.25 ? '#f7c948' : '#e5484d');
    text(ctx, `${Math.ceil(order.patience)}s`, x + w - 30, y + h - 30, 11, INK, 'center', 'bold');
  });
}

function drawBackground(ctx, t) {
  // Wall and tile.
  ctx.fillStyle = WALL;
  ctx.fillRect(0, 0, FIELD.width, 300);
  ctx.fillStyle = '#f3d9a4';
  for (let x = 0; x < FIELD.width; x += 64) {
    ctx.fillRect(x, 250, 2, 50);
  }
  ctx.fillRect(0, 248, FIELD.width, 2);
  // Window with a sunny street view, on the wall between the board and the counter.
  ctx.fillStyle = '#7ec8e3';
  rr(ctx, 1010, 192, 200, 92, 10);
  ctx.fill();
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(1160, 222, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(1106, 192, 8, 92);
  ctx.fillRect(1010, 232, 200, 7);
  ctx.fillStyle = '#5fb84a';
  ctx.beginPath();
  ctx.moveTo(1030, 284);
  ctx.lineTo(1190, 284);
  ctx.lineTo(1172, 256);
  ctx.lineTo(1048, 256);
  ctx.closePath();
  ctx.fill();
  // Shelf with jars, on the same wall band.
  ctx.fillStyle = WOOD;
  ctx.fillRect(60, 216, 260, 10);
  const jars = ['#e5484d', '#f7c948', '#5fb84a', '#e8a94f'];
  jars.forEach((c, i) => {
    ctx.fillStyle = c;
    rr(ctx, 78 + i * 62, 182, 34, 34, 6);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    rr(ctx, 82 + i * 62, 186, 8, 26, 4);
    ctx.fill();
  });
  // Hanging lamps, clear of the sign.
  [200, 1080].forEach((lx) => {
    ctx.strokeStyle = '#6b4224';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, 34);
    ctx.stroke();
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.moveTo(lx - 18, 52);
    ctx.lineTo(lx + 18, 52);
    ctx.lineTo(lx + 8, 32);
    ctx.lineTo(lx - 8, 32);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(247,201,72,0.18)';
    ctx.beginPath();
    ctx.arc(lx, 62, 26 + Math.sin(t * 2 + lx) * 2, 0, Math.PI * 2);
    ctx.fill();
  });
  // Wood floor.
  ctx.fillStyle = '#c98f5a';
  ctx.fillRect(0, 388, FIELD.width, 332);
  ctx.fillStyle = '#b97e4a';
  for (let y = 388; y < 720; y += 48) ctx.fillRect(0, y, FIELD.width, 3);
  for (let x = 0; x < FIELD.width; x += 96) {
    ctx.fillRect(x, 388, 3, 332);
  }
  // Big sign above the board.
  text(ctx, 'EMBER & EGG', 640, 46, 30, '#6b4224', 'center', 'bold', "Georgia, 'Times New Roman', serif");
  text(ctx, 'a cozy rush-hour kitchen', 640, 66 - 14 + 8, 12, '#8a5a33', 'center', 'italic', "Georgia, 'Times New Roman', serif");
}

function drawHud(ctx, state) {
  ctx.fillStyle = 'rgba(43,30,18,0.92)';
  ctx.fillRect(0, 0, FIELD.width, 26);
  const mins = Math.floor(state.timeLeft / 60);
  const secs = Math.floor(state.timeLeft % 60);
  const clock = `${mins}:${String(secs).padStart(2, '0')}`;
  ctx.fillStyle = state.timeLeft < 30 ? '#ff8a7a' : '#ffe9b0';
  ctx.beginPath();
  ctx.arc(52, 13, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(52, 13);
  ctx.lineTo(52, 7);
  ctx.moveTo(52, 13);
  ctx.lineTo(57, 13);
  ctx.stroke();
  text(ctx, clock, 90, 13, 14, state.timeLeft < 30 ? '#ff8a7a' : '#ffe9b0', 'center', 'bold');
  progressBar(ctx, 170, 8, 220, 10, state.timeLeft / DAY_SECONDS, state.timeLeft < 30 ? '#e5484d' : '#f7c948', 'rgba(255,255,255,0.2)');
  text(ctx, `Day ${state.level} / 5`, 430, 13, 13, '#ffe9b0', 'center', 'bold');
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.arc(588, 13, 9, 0, Math.PI * 2);
  ctx.fill();
  text(ctx, '$', 588, 13, 12, '#3a2a1a', 'center', 'bold');
  text(ctx, `${state.coins}`, 640, 13, 15, '#ffe9b0', 'center', 'bold');
  text(ctx, `Served ${state.served}`, 790, 13, 13, '#ffe9b0', 'center', 'bold');
  if (state.combo >= 2) {
    ctx.fillStyle = '#e2574c';
    rr(ctx, 880, 3, 96, 20, 10);
    ctx.fill();
    text(ctx, `COMBO x${state.combo}`, 928, 13, 12, '#fff', 'center', 'bold');
  }
  let hx = 1050;
  for (let i = 0; i < MAX_LIVES; i += 1) {
    text(ctx, i < state.lives ? '♥' : '♡', hx, 13, 15, i < state.lives ? '#ff6b6b' : '#8a7a68', 'center', 'bold');
    hx += 24;
  }
  text(ctx, 'M mute · P pause', 1210, 13, 11, '#cbb89a', 'center', 'normal');
}

function drawFloaters(ctx, state) {
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    text(ctx, f.text, f.x, f.y - (1.2 - f.life) * 30, 20, '#2f7d1e', 'center', 'bold');
    ctx.globalAlpha = 1;
  }
}

function drawHintBar(ctx, state) {
  const held = state.chef.carrying;
  let hint = 'WASD / arrows to move · E or click a station to use it · Q drops what you hold';
  if (held && held.kind === 'plate') {
    hint = 'Carrying a plate — add ingredients at the bins, board, grill or pot, then serve it at the window!';
  } else if (held) {
    hint = `Holding ${held.name} — take it to the board, grill, pot or a plate.`;
  }
  ctx.fillStyle = 'rgba(43,30,18,0.75)';
  rr(ctx, 240, 692, 800, 22, 11);
  ctx.fill();
  text(ctx, hint, 640, 703, 12, '#ffe9b0', 'center', 'normal');
}

function drawTitle(ctx, state, best, t) {
  ctx.fillStyle = 'rgba(30,20,10,0.55)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = CREAM;
  rr(ctx, 340, 150, 600, 400, 18);
  ctx.fill();
  ctx.strokeStyle = '#e8a94f';
  ctx.lineWidth = 4;
  rr(ctx, 348, 158, 584, 384, 14);
  ctx.stroke();
  text(ctx, 'EMBER & EGG', 640, 205, 44, '#6b4224', 'center', 'bold', "Georgia, 'Times New Roman', serif");
  text(ctx, 'a cozy rush-hour kitchen', 640, 240, 16, '#8a5a33', 'center', 'italic', "Georgia, 'Times New Roman', serif");
  drawPlate(ctx, ['bun', 'grilled patty', 'chopped lettuce', 'chopped tomato'], 640, 320, 34);
  const lines = [
    'Take orders from the board, chop and grill each dish,',
    'build it on a plate and serve it before patience runs out.',
    'Fast service earns tips — serve three in a row for a combo bonus.',
    'Four dishes to master: Sunny Burger, Garden Salad,',
    'Golden Omelette and Ember Tomato Soup. Three hearts: do not',
    'let a ticket walk out. The day lasts 2½ minutes.',
  ];
  lines.forEach((line, i) => text(ctx, line, 640, 362 + i * 20, 14, INK, 'center', 'normal'));
  const pulse = 0.7 + Math.sin(t * 4) * 0.3;
  ctx.globalAlpha = pulse;
  text(ctx, 'Press SPACE or click to start', 640, 508, 18, '#b3402f', 'center', 'bold');
  ctx.globalAlpha = 1;
  if (best > 0) text(ctx, `Best day so far: $${best}`, 640, 534, 13, '#8a5a33', 'center', 'bold');
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(30,20,10,0.6)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  text(ctx, 'PAUSED', 640, 340, 48, CREAM, 'center', 'bold', "Georgia, 'Times New Roman', serif");
  text(ctx, 'Press P or click to keep cooking', 640, 390, 16, CREAM, 'center', 'normal');
}

function drawOver(ctx, state, best) {
  ctx.fillStyle = 'rgba(30,20,10,0.6)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = CREAM;
  rr(ctx, 380, 160, 520, 380, 18);
  ctx.fill();
  ctx.strokeStyle = '#e8a94f';
  ctx.lineWidth = 4;
  rr(ctx, 388, 168, 504, 364, 14);
  ctx.stroke();
  const title = state.won ? 'DAY COMPLETE!' : 'THE KITCHEN CLOSED EARLY';
  text(ctx, title, 640, 210, 32, '#6b4224', 'center', 'bold', "Georgia, 'Times New Roman', serif");
  const stars = state.coins >= 120 ? 3 : state.coins >= 70 ? 2 : state.coins >= 35 ? 1 : 0;
  for (let i = 0; i < 3; i += 1) {
    text(ctx, i < stars ? '★' : '☆', 640 - 52 + i * 52, 262, 40, i < stars ? '#f7c948' : '#cbb89a', 'center', 'bold');
  }
  const rows = [
    [`Coins earned`, `$${state.coins}`],
    [`Dishes served`, `${state.served}`],
    [`Best combo`, `x${state.bestCombo}`],
    [`Best day`, `$${best}`],
  ];
  rows.forEach(([label, value], i) => {
    text(ctx, label, 520, 320 + i * 30, 16, INK, 'left', 'normal');
    text(ctx, value, 780, 320 + i * 30, 16, '#b3402f', 'right', 'bold');
  });
  text(ctx, state.won ? 'The regulars are already asking for tomorrow.' : 'Three tickets walked out — the rush won today.', 640, 460, 14, '#8a5a33', 'center', 'italic', "Georgia, 'Times New Roman', serif");
  const pulse = 0.7 + Math.sin(performance.now() / 300) * 0.3;
  ctx.globalAlpha = pulse;
  text(ctx, 'Press R or click to play again', 640, 505, 17, '#b3402f', 'center', 'bold');
  ctx.globalAlpha = 1;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;

  return {
    draw(state, screen, best, stations) {
      const t = performance.now() / 1000;
      ctx.clearRect(0, 0, FIELD.width, FIELD.height);
      drawBackground(ctx, t);
      drawOrderBoard(ctx, state, t);
      // Counters: a long wooden top for the top row and a steel one below.
      ctx.fillStyle = WOOD;
      rr(ctx, 24, 292, 1232, 100, 10);
      ctx.fill();
      ctx.fillStyle = STEEL;
      rr(ctx, 24, 512, 1232, 92, 10);
      ctx.fill();
      for (const station of stations) drawStation(ctx, station, state, t);
      drawChef(ctx, state.chef, t);
      drawFloaters(ctx, state);
      drawHud(ctx, state);
      drawHintBar(ctx, state);
      if (screen === SCREEN_TITLE) drawTitle(ctx, state, best, t);
      else if (screen === SCREEN_PAUSED) drawPaused(ctx);
      else if (screen === SCREEN_OVER) drawOver(ctx, state, best);
    },
  };
}
