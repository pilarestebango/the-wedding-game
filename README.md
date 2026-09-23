# Pilar & Joe — Wedding

Static sites in one repo, deployed together via GitHub Pages:

- **`/`** — the wedding website (RSVP, wedding day, after party, logistics).
- **`/game/`** — [PILAR vs JOE](game/GAME_SPEC.md), a retro pixel-art arcade
  game telling the couple's story, ending in a proposal.
- **`/rsvp/`** — the RSVP form.
- **`/jukebox/`** — the Juke-Box: guests search songs, hear a preview and add
  them to the wedding soundtrack.

No backend of our own — RSVP and the jukebox share one Google Apps Script +
Sheets backend ([google-apps-script.gs](google-apps-script.gs)) — no build
step, plain HTML/CSS/JS throughout. See
[CLAUDE.md](CLAUDE.md) for conventions, and [game/CLAUDE.md](game/CLAUDE.md)
+ [game/GAME_SPEC.md](game/GAME_SPEC.md) for everything game-specific.

## Local dev

Open `index.html` with VS Code's "Live Server" extension, or:

```sh
npx serve .
```

`/`, `/game/`, `/rsvp/` and `/jukebox/` are all served from the same root — no
separate setup needed. The jukebox page shows a "not wired up yet" note until
`JUKEBOX_ENDPOINT` is set (see the setup steps at the top of
`google-apps-script.gs`).
