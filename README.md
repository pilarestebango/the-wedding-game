# Pilar & Joe — Wedding

Two static sites in one repo, deployed together via GitHub Pages:

- **`/`** — the wedding website (RSVP, wedding day, after party, logistics).
- **`/game/`** — [PILAR vs JOE](game/GAME_SPEC.md), a retro pixel-art arcade
  game telling the couple's story, ending in a proposal.

No backend, no build step, plain HTML/CSS/JS throughout. See
[CLAUDE.md](CLAUDE.md) for conventions, and [game/CLAUDE.md](game/CLAUDE.md)
+ [game/GAME_SPEC.md](game/GAME_SPEC.md) for everything game-specific.

## Local dev

Open `index.html` with VS Code's "Live Server" extension, or:

```sh
npx serve .
```

Both `/` and `/game/` are served from the same root — no separate setup
needed for the game.
