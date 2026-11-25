// A small seeded random source, so a ?seed=N run (and every screenshot) is
// reproducible: the same seed always deals the same orders.
export function createRandom(seed) {
  let state = seed >>> 0 || 1;
  function next() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  }
  return {
    next,
    int(max) {
      return Math.floor(next() * max);
    },
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
  };
}
