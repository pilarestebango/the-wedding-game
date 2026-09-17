# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

**PILAR vs JOE** — a 2D side-scrolling arcade game (retro pixel-art style)
telling the couple's story across three levels, ending in a proposal. Built
as a companion to Pilar & Joe's wedding website.

Full design spec, level-by-level mechanics, scene flow, and open questions
live in **`GAME_SPEC.md`** at the repo root — read it before making any
gameplay, scene, or asset decision. This file only covers engineering
conventions; it doesn't duplicate the design content.

## Tech stack

- **Engine:** Phaser 3, loaded via CDN `<script>` tag in `index.html` (no
  bundler, no build step).
- **Language:** vanilla JavaScript (ES6+ modules). No TypeScript, no
  framework, unless a future decision changes this.
- **No backend.** Static site only — everything runs client-side.
- **Local dev:** VS Code "Live Server" extension, or `npx serve .` from the
  repo root. Do not introduce webpack/vite/etc. unless asked — the whole
  point of this stack is zero build step.

## Project structure

```
game/
├── CLAUDE.md              # this file
├── GAME_SPEC.md           # full design spec — source of truth for mechanics
├── index.html
├── src/
│   ├── main.js            # Phaser config + scene list
│   ├── scenes/            # one file per Phaser scene, named to match GAME_SPEC §5/§6
│   ├── ui/
│   │   └── TouchControls.js
│   └── config/
│       └── palette.js     # color/font tokens — see below, never hardcode hex elsewhere
└── assets/
    ├── sprites/
    ├── backgrounds/
    └── audio/
```

## Visual style — do not deviate without asking

Pulled from the couple's existing wedding site (`Arcade Wedding.dc.html`).
These live as constants in `src/config/palette.js`; import them, don't
retype hex values in scene code.

| Token | Value |
|---|---|
| Background | `#120B2E` |
| Cyan | `#00E5FF` |
| Yellow/Gold | `#FFD400` |
| Red | `#E5341F` |
| Muted purple | `#7a6fb0` |
| Off-white | `#F2F2F2` |
| Heading font | `Press Start 2P` |
| Body font | `JetBrains Mono` |


All sprites/tiles must render with `pixelArt: true` in the Phaser config (or
`image-rendering: pixelated` for any raw DOM/CSS elements) — never let the
browser smooth/anti-alias the art.

## Input handling

Every gameplay action (move, jump, mash/action, yes/no) must go through a
single shared input-handling function per action — **never** branch game
logic on "was this a keypress or a touch event." Keyboard and the on-screen
touch controls (`src/ui/TouchControls.js`) both call the same functions.
Touch controls are shown only on touch-capable/narrow viewports and hidden
on desktop — see GAME_SPEC §3 for the exact rules and button labels.

## Testing / debug conventions

- Support a `?scene=<name>&char=<pili|joe>` URL query param that boots
  directly into any scene (see `GAME_SPEC.md` §2 and §9). Keep this working
  at all times — it's the main way to test a level without replaying the
  whole game, and it should be added in the very first milestone, not
  bolted on later.
- New scenes should be playable/testable in isolation via that query param
  before being wired into the full flow.
- No test framework is set up yet. If pure logic (meter math, obstacle
  sequences, branching) grows complex enough to warrant it, Vitest is the
  suggested choice — ask before adding new dependencies.
-  make sure you build in unit testing

## Assets

- Placeholder art (colored boxes/shapes) is fine and expected in early
  milestones — see the milestone table in `GAME_SPEC.md` §9. Don't block
  gameplay-logic work on final art being ready.
- **Asset review gate:** any new pixel-art batch (obstacles, backgrounds,
  character sprites) gets generated and shown for approval *before* being
  wired into scene code — don't silently swap placeholders for "final" art
  without flagging it.
- Reuse existing illustrations in `../images/` (`caracters/pili.png`,
  `caracters/joe.png`, wedding/dancing/proposal poses) for menus and
  cutscenes rather than regenerating them — see `GAME_SPEC.md` §1 for the
  full inventory and what each is meant for.
- Use this as reference for illustration style for elements pixelated ppixel-elements.jpeg

## Open questions

`GAME_SPEC.md` §8 lists unresolved design questions (fail states, exact
mash/timer numbers, dialogue copy, music licensing, whether the ending
deep-links to the real RSVP page). Check that list before assuming an
answer on any of those specific points.

## Current status

Design spec complete (`GAME_SPEC.md` v0.1). No code written yet — next step
is milestone M0 (project scaffold) per the build plan in §9.
