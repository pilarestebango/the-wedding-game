# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

This repo holds two related, independently-browsable static sites for Pilar
& Joe's wedding, deployed together as one GitHub Pages site:

- **`/` (this level)** — the wedding website: a retro-arcade-styled landing
  page (RSVP / Wedding / After Party / Logistics, plus a link into the game)
  matching the visual identity of the couple's Claude Design handoff.
- **`/game/`** — **PILAR vs JOE**, a 2D side-scrolling arcade game telling
  the couple's story across three levels, ending in a proposal. It has its
  own **`game/CLAUDE.md`** and **`game/GAME_SPEC.md`** — read those before
  touching anything under `game/`; this file doesn't duplicate them.

## Tech stack

- Vanilla HTML/CSS/JS (ES6+), no framework, no bundler — same zero-build
  philosophy as the game (see `game/CLAUDE.md`).
- No backend. Static site only.
- Local dev: VS Code "Live Server" extension, or `npx serve .` from the repo
  root — this serves both `/` and `/game/` together.

## Visual style — do not deviate without asking

Shared across the site and the game. The game keeps these as JS constants in
`game/src/config/palette.js`; the site currently inlines them as CSS custom
properties in `index.html` (no JS module of its own yet) — keep both in sync
if either changes.

| Token | Value |
|---|---|
| Background | `#120B2E` |
| Cyan | `#00E5FF` |
| Yellow/Gold | `#FFD400` |
| Red | `#E5341F` |
| Muted purple | `#7a6fb0` |
| Off-white | `#F2F2F2` |
| Heading font | `Press Start 2P` (Google Font) |
| Body font | `JetBrains Mono` (Google Font) |
| Title style | 6px/6px hard drop-shadow, no blur |

All pixel art must render with `image-rendering: pixelated` — never let the
browser smooth/anti-alias it.

## Project structure

```
index.html              # wedding site landing page
assets/site/             # site-only images (joe.png, pili.png, +wedding variants)
game/                     # the game — see game/CLAUDE.md and game/GAME_SPEC.md
reference/                # design source material, not shipped:
  website/                #   Claude Design handoff for the landing page
    Arcade Wedding.dc.html #   (canvas export — reference only, see below)
    support.js
    uploads/
```

## Design source of truth

`reference/website/Arcade Wedding.dc.html` is the Claude Design canvas
handoff for the landing page hero — it was implemented directly into
`index.html` as plain HTML/CSS/JS. The `.dc.html`/`support.js` files are a
design-tool artifact (needs `window.React`/`ReactDOM` to run) and are never
shipped or linked from the real site; they're kept only as the design
reference. If the couple sends an updated `.dc.html` export, re-implement
the diff into `index.html` by hand rather than embedding the runtime.

Real event details pulled from that handoff (confirm before changing):
- **Wedding:** Madrid, 2027-09-19
- **After Party:** Sydney, 2027-12-23

The site is being built **iteratively, section by section** — the current
`index.html` only implements the hero. Don't invent additional sections
(RSVP form, logistics content, registry, etc.) ahead of a design handoff for
them; ask or wait for the next `.dc.html` drop.

## Linking the two

- **Site → game:** the "ARCADE / PLAY THE GAME" card in `index.html`'s hero
  grid, links to `game/` (relative — works under any GitHub Pages path).
- **Game → site:** `game/src/config/tuning.js` → `RSVP_URL`. Currently
  `null` (shows "RSVP details coming soon" on the game's ending screen).
  Once the site has a real RSVP destination, set it there — the game's
  EndingScene picks it up automatically, no scene code changes needed.

## Hosting

Single GitHub repo, single GitHub Pages deploy (serve from the `main`
branch root). Root path → wedding site, `/game/` → the game. `.nojekyll` at
the repo root disables Jekyll processing since this is plain static output,
not a Jekyll site.
