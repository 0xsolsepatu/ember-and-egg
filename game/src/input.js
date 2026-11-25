// Keyboard and mouse input. The chef moves with WASD or the arrow keys; E,
// Space or Enter interacts with the nearest station; clicking the floor sets a
// walk target, clicking a station walks to it and interacts on arrival.
// M mutes, P or Escape pauses, R restarts from the end screen.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_RESTART = 4;
export const ACTION_MUTE = 8;
export const ACTION_DROP = 16;

export function createInput(canvas) {
  const keys = new Set();
  let actions = 0;
  let clickTarget = null;
  let clickInteract = false;

  function keyDown(event) {
    const key = event.key.toLowerCase();
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
    if (key === ' ' || key === 'enter' || key === 'e') actions |= ACTION_CONFIRM;
    if (key === 'p' || key === 'escape') actions |= ACTION_PAUSE;
    if (key === 'r') actions |= ACTION_RESTART;
    if (key === 'm') actions |= ACTION_MUTE;
    keys.add(key);
  }
  function keyUp(event) {
    keys.delete(event.key.toLowerCase());
  }
  function pointer(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    clickTarget = { x, y };
    clickInteract = true;
  }

  window.addEventListener('keydown', keyDown);
  window.addEventListener('keyup', keyUp);
  canvas.addEventListener('pointerdown', pointer);

  return {
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClick() {
      const target = clickTarget;
      const interact = clickInteract;
      clickTarget = null;
      clickInteract = false;
      return { target, interact };
    },
    direction() {
      let x = 0;
      let y = 0;
      if (keys.has('a') || keys.has('arrowleft')) x -= 1;
      if (keys.has('d') || keys.has('arrowright')) x += 1;
      if (keys.has('w') || keys.has('arrowup')) y -= 1;
      if (keys.has('s') || keys.has('arrowdown')) y += 1;
      return { x, y };
    },
  };
}
