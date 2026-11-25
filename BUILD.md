# Ember & Egg — build notes

## The game

**Ember & Egg** is an original top-down rush-hour cooking game, written for
this competition in this session. One chef, one kitchen, one day of 2½ minutes.
The idea is route planning under pressure: every dish sends the chef on a
different path between the bins, the chopping board, the grill, the soup pot,
the plating counter and the serve window, and the tickets' patience bars force
choices about which order to chase first.

### Depth

- **4 dishes, 4 routes.** Burger (chop + grill + assemble), Salad (chop ×2 +
  cheese), Omelette (grill + cheese), Soup (chop ×2 + simmer). No two dishes
  use the kitchen the same way.
- **Cooking has stakes.** The grill has two slots; food left past its burn
  time turns to burnt food that must be trashed. The pot needs exactly two
  chopped tomatoes before it simmers.
- **Tips and combos.** Pay is the dish price + a tip scaled to the patience
  left + $2 per combo step. Serving three in a row without a walk-out builds
  the combo; a lost ticket resets it and costs a heart.
- **Pressure grows without new chores.** Order interval shrinks and patience
  shortens as the day level rises (a new level every 40 s, up to day 5).
- **Three hearts, then the kitchen closes early.** Surviving the full day
  gives a 1–3 star summary.

### Feel and polish

- Every station answers at once: pickup blips, chopping thunks, a ding when
  food is done, a coin chime on serve, a sizzle loop while anything cooks
  (all synthesised WebAudio, no files).
- The timer bar turns red under 30 s; urgent tickets flash; a finished dish
  on the plating counter glows green with "READY TO SERVE".
- Warm palette (cream tile, wood, brass), vector food drawn to look worth
  serving, and a hint bar that always tells the player what to do next.

## Controls

WASD / arrows to move; click a station to walk to it and use it on arrival
(click the floor to walk); E / Space / Enter to use the nearest station;
Q drops what is held; P / Esc pauses; R restarts; M mutes.

## Screenshots

All four are real renders of the game's own code, taken in headless Chromium
at 1280×720 against `node serve.ts`, via the deterministic `?shot=` states in
`game/src/shots.js` (seed 1). The first by name is the cover.

| File | Size | What it shows |
| --- | --- | --- |
| `1-play.jpg` | 78,697 B | Mid-rush: 3 tickets on the order board, bins full of ingredients, lettuce chopping, patty + egg on the grill, soup pot at 1/2 tomatoes, a burger mid-assembly (2 items) on the plating counter, the chef carrying a grilled patty, timer 1:48, combo x2, +$18 floater |
| `2-start.jpg` | 81,164 B | Title screen over a live kitchen: 2 tickets, a burger being built, food chopping and grilling, how-to-play panel |
| `3-serve.jpg` | 77,625 B | A finished Sunny Burger on the plating counter ("READY TO SERVE"), the chef carrying a finished Garden Salad toward the serve window, soup simmering, chopped tomato READY on the board, combo x3, +$24 floater |
| `4-end.jpg` | 58,276 B | Day complete: 3 stars, $132 earned, 9 dishes served, best combo x4, timer 0:00 |

Every screenshot shows the required elements across the set: a kitchen, an
order board, ingredients on the counter, a dish mid-assembly, a timer, and a
plate ready to serve.

## Verification (all run in this session)

- **Deterministic screenshots:** `tools/shoot.mjs` drives the Playwright
  Chromium build over CDP; each `?shot=` scene sets `window.__shotReady`
  after painting twice. All four reported `shotReady=true`.
- **Zero console errors, zero failed requests** in every run. The only
  requests the page makes are its own files from localhost (index.html +
  the 8 ES modules); no network, no external assets. A data-URI favicon
  silences the browser's favicon request.
- **Live play-test with real mouse clicks** (`tools/shoot.mjs` +
  `tools/serve-test.mjs`): clicked the tomato bin → chef picked up a tomato;
  board → chopped it; pot → 1/2 tomatoes. Then a full Garden Salad end to
  end: plate → plating counter, chopped lettuce + chopped tomato + cheese
  assembled on the counter plate, picked up, served at the window →
  **coins $23 (pay $10 + tip $13), served 1, combo 1**, salad ticket removed.
  Pause (P) announced "Paused." No console errors.
- **Screenshot sizes:** all four ≤ 256 KiB, all 1280×720 (long side ≤ 1280,
  short side ≥ 480).
- **Hand-in run:** `MAKEFUN_OUTPUT_DIR=<tmp> node main.ts` produces
  `game/` + `screenshots/` + `dossier.json` (see below).

## Hand-in check

```sh
mkdir -p /tmp/mf-out && MAKEFUN_OUTPUT_DIR=/tmp/mf-out node main.ts
```

Expected: `/tmp/mf-out/game/` (index.html + src/*.js), `/tmp/mf-out/screenshots/`
(4 JPEGs), `/tmp/mf-out/dossier.json` written by `vendor/makefun-game.ts`
(copied from the kit unchanged). Running main.ts twice writes byte-identical
output.

## Layout

```
ember-and-egg/
  main.ts            Node 22 hand-in program (stdlib only)
  serve.ts           tiny static server for local play (from the kit starter)
  shots.json         the four screenshot scenes
  LICENSE            MIT
  README.md
  BUILD.md           this file
  game/
    index.html       canvas + module entry, data-URI favicon
    src/
      config.js      tuning, recipes, station layout
      random.js      seeded RNG (deterministic ?seed= runs)
      audio.js       synthesised WebAudio sounds
      world.js       orders, stations, cooking, serving
      input.js       keyboard + mouse
      render.js      all vector art + HUD + screens
      shots.js       deterministic ?shot= scenes
      main.js        boot, loop, screens
  screenshots/       1-play.jpg, 2-start.jpg, 3-serve.jpg, 4-end.jpg
  vendor/
    makefun-game.ts  kit file, unchanged
  tools/             verification scripts (CDP screenshot + play-test drivers)
```
