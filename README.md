# ember-and-egg

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/0xsolsepatu/ember-and-egg/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/0xsolsepatu/ember-and-egg/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Ember & Egg** — a cozy rush-hour cooking game. You are the only chef in a small
neighbourhood kitchen: tickets land on the order board, and you run between the
ingredient bins, the chopping board, the grill and the soup pot to build each
dish on a plate and serve it at the window before the customer's patience runs
out. Fast service earns tips; three good serves in a row build a combo bonus.
The day lasts 2½ minutes and the tickets keep coming faster as it goes on.

Four dishes to master, each with its own route through the kitchen:

- **Sunny Burger** — bun + grilled patty + chopped lettuce + chopped tomato
- **Garden Salad** — chopped lettuce + chopped tomato + cheese
- **Golden Omelette** — fried egg + cheese
- **Ember Tomato Soup** — two chopped tomatoes simmered in the pot

Watch the grill: a patty or egg left too long burns and has to be trashed.
Let a ticket walk out and you lose a heart — three hearts and the kitchen
closes early.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no
network request: the game is plain static files under `game/`, and every
sound is synthesised with WebAudio — there are no audio, image or font files
to download.

## Controls

- **WASD / arrow keys** — move the chef
- **Click a station** — walk over and use it (or click the floor to walk there)
- **E / Space / Enter** — use the nearest station
- **Q** — drop what you are holding
- **P / Esc** — pause · **R** — restart · **M** — mute

## How a dish gets made

1. Take a plate from the Plates stack and set it down on the Plating Counter.
2. Fetch ingredients from the bins. Tomatoes and lettuce go to the Chopping
   Board; patties and eggs go to the Grill; two chopped tomatoes go in the
   Soup Pot.
3. Carry each finished piece to the Plating Counter to build the dish. A
   finished dish glows green: **READY TO SERVE**.
4. Pick the plate up and serve it at the Serve Window. The fuller the
   patience bar, the bigger the tip.

## Files

- `game/` — the playable game (open `game/index.html`)
  - `game/src/config.js` — tuning, recipes, station layout
  - `game/src/world.js` — orders, stations, cooking and serving rules
  - `game/src/render.js` — all the vector art, drawn on one canvas
  - `game/src/input.js` — keyboard + mouse
  - `game/src/audio.js` — synthesised WebAudio sounds
  - `game/src/shots.js` — the deterministic screenshot scenes
  - `game/src/main.js` — boot and the game loop
- `screenshots/` — real renders of the game (see `shots.json`)
- `main.ts` — the make.fun hand-in program (Node 22, stdlib only)
- `BUILD.md` — design notes and verification results

---

Entered on make.fun — [Make the best cooking game](https://make.fun/bounty/best-cooking-game-20261125-0137)
