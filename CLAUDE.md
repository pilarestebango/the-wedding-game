# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

This repo holds related, independently-browsable static sites for Pilar
& Joe's wedding, deployed together as one GitHub Pages site:

- **`/` (this level)** — the wedding website: a retro-arcade-styled landing
  page (RSVP / Wedding / After Party / Logistics, plus a link into the game)
  matching the visual identity of the couple's Claude Design handoff.
- **`/game/`** — **PILAR vs JOE**, a 2D side-scrolling arcade game telling
  the couple's story across three levels, ending in a proposal. It has its
  own **`game/CLAUDE.md`** and **`game/GAME_SPEC.md`** — read those before
  touching anything under `game/`; this file doesn't duplicate them.
- **`/rsvp/`** — the RSVP form (posts to a Google Apps Script → Google Sheet,
  see `google-apps-script.gs` at the repo root).
- **`/wedding/`** and **`/after-party/`** — the two level pages (LVL 1 Madrid,
  LVL 2 Sydney). See "The level pages" below.
- **`/jukebox/`** — **the Juke-Box**, where guests search songs, hear a
  preview and add them to the wedding-soundtrack list. See "The jukebox"
  below.
- **`/getaway/`** — **THE GETAWAY**, a second, invite-only arcade game (plus a
  details page at `/getaway/details/`) for the ~10 guests invited to the
  pre-wedding getaway. **Deliberately not linked from anywhere on the site** —
  see "The getaway" below.
- **`/alba-sofia/`** — **ALBA & SOFIA ADVENTURE**, a copy of THE GETAWAY for
  two guests, who play as themselves. Also unlinked. See "Alba & Sofia
  Adventure" below.

## Tech stack

- Vanilla HTML/CSS/JS (ES6+), no framework, no bundler — same zero-build
  philosophy as the game (see `game/CLAUDE.md`).
- No backend of our own. RSVP and the jukebox both talk to the same Google
  Apps Script web app (`google-apps-script.gs` at the repo root), which runs
  on Google's infrastructure so the site itself stays static. It writes to
  one Google Sheet: RSVPs in its first tab, the jukebox's songs in a "Songs"
  tab.
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

The two pages with text fields (`rsvp/index.html`, `jukebox/index.html`) set
`maximum-scale=1` in their viewport meta. Their inputs are well under 16px, so
without it iOS Safari zooms the page in whenever a field is tapped. Don't "fix"
that by bumping the input font-size to 16px — it would change the design (the
jukebox sizes its text off the cabinet width).

### Jukebox accents

The jukebox design adds colors that aren't in the shared palette above. They
are scoped to `jukebox/index.html` (plus `--pink`, which the landing page's
jukebox card also uses); the game's `palette.js` doesn't have them.

| Token | Value | Used for |
|---|---|---|
| `--pink` | `#E96BC8` | landing-page card, level-page RSVP button + timeline, RSVP success-screen jukebox button, jukebox result marks + send-button shadow |
| `--magenta` | `#EB5CD4` | jukebox title bar, vinyl label, arch bulbs, equalizer (the hotter pink in the design) |
| `--orchid` | `#D575E1` | jukebox right-hand pillar (+ glow) |
| `--sky` | `#5CC8F5` | left-hand pillar (+ soft glow), cyan arch bulbs |
| `--frame` | `#5B4FB3` | cabinet ring, row and input outlines |
| `--panel` | `#0B0621` | "now selecting" panel, inputs |
| `--row` | `#251C5A` | list rows |

Values were sampled by eye from the design screenshot, so adjust them if
the couple's Claude Design export says otherwise. The jukebox title's
shadow is a 2px **gold** one (not the 6px red), because it sits on pink.
The jukebox's vinyl is a smooth black record drawn on a 256px canvas — the one
deliberate exception to the "pixelated" rule above, per the design.

## Project structure

```
index.html              # wedding site landing page
google-apps-script.gs    # shared RSVP + Jukebox backend (one Apps Script project — see "The jukebox")
rsvp/                    # RSVP form: index.html
wedding/                 # LVL 1 — the wedding (Madrid): index.html
after-party/             # LVL 2 — the after party (Sydney): index.html
jukebox/                 # the Juke-Box: index.html
getaway/                 # THE GETAWAY (unlinked): index.html + src/ (the game), details/index.html
alba-sofia/              # ALBA & SOFIA ADVENTURE (unlinked): index.html + src/ + assets/ — a copy of getaway/
assets/site/             # site-only images (joe, pili, +wedding variants, rsvp-success): .png + .webp
game/                     # the game — see game/CLAUDE.md and game/GAME_SPEC.md
reference/                # design source material, not shipped:
  website/                #   Claude Design handoff for the landing page
    Arcade Wedding.dc.html #   (canvas export — reference only, see below)
    support.js
    uploads/
  alba-sofia/             #   the pictures of Alba and Sofia the game's sprites were cut from
```

## Design source of truth

`reference/website/Arcade Wedding.dc.html` is the Claude Design canvas
handoff for the landing page hero — it was implemented directly into
`index.html` as plain HTML/CSS/JS. The `.dc.html`/`support.js` files are a
design-tool artifact (needs `window.React`/`ReactDOM` to run) and are never
shipped or linked from the real site; they're kept only as the design
reference. If the couple sends an updated `.dc.html` export, re-implement
the diff into `index.html` by hand rather than embedding the runtime.

## Image weight

The site pages load the **`.webp`** twin of each image (`assets/site/*` and the
four `game/assets/illustrations/locations/` prints), not the `.png`. The `.png`
stays as the editable source; the `.webp` is a **lossless** re-encode (pixel-
identical, ~35–50% smaller — don't switch to lossy, it would soften the pixel
art). When a PNG changes, regenerate its twin or the site keeps showing the old
art:

```
cwebp -lossless -z 9 "assets/site/joe.png" -o "assets/site/joe.webp"
```

Priorities on the landing page: the two visible sprites are `fetchpriority="high"`,
the hover-only outfit sprites and the RSVP success image (hidden until submit)
are `fetchpriority="low"`, so they never compete with what's on screen.

Real event details pulled from that handoff (confirm before changing):
- **Wedding:** Madrid, 2027-09-19
- **After Party:** Sydney, 2027-10-30
- **RSVP deadline:** 2027-01-07

The site is being built **iteratively, section by section** — the landing
page, RSVP, jukebox and the two level pages exist so far. Don't invent
additional sections (logistics content, registry, etc.) ahead of a design
handoff for them; ask or wait for the next design drop.

## The level pages

`wedding/index.html` and `after-party/index.html` are self-contained sibling
pages (inline CSS/JS, EN/ES via the shared `wedding-lang` key), so a layout
fix usually has to be made in both. Their topbar mirrors `rsvp/index.html`
(`‹ EXIT` + EN/ES · level title), with the date in the slot RSVP uses for
credits (hidden on narrow phones).

- **One DOM, two layouts.** Desktop is info column left, art right. On a phone
  `.info` becomes `display: contents` so the blocks reorder: title/date/venue →
  art → details → sticky RSVP bar. The bar is a `position: sticky` direct child
  of `.layout` (which spans the page), not `fixed`, so it settles into place at
  the end of the page instead of covering the footnote.
- **Art:** both pages use the same two-print composition: the first image
  behind, the second tilted on top. Images live in
  `game/assets/illustrations/locations/` (pages load the `.webp` twins — see
  "Image weight"). The wedding page uses `casa de burgos
  01.png` (behind) and `02.png` (on top); their white frames are baked into the
  PNGs. The after party uses `pub 01.png` (Tempe Hotel front, behind) and `pub
  02.png` (beer garden, on top), which are **unframed** — `after-party/index.html`
  draws the same white border in CSS (`.pic` padding), so keep the two in step
  if the frame proportion changes. Its `.pics` box is also a bit taller (1.08
  vs the wedding page's 1.18) on purpose, so the tilted beer-garden print
  doesn't cover the TEMPE HOTEL sign. (`Group 9.png` / `Group 10.png` in that
  folder are unused duplicates of the Casa de Burgos art.)
- **After party has no timeline** on purpose — it's copy plus an "expect" list.
  It also shows no start time yet (none has been decided).
- **RSVP deep link:** each page's button goes to `rsvp/?level=wedding` /
  `rsvp/?level=afterparty`, and `rsvp/index.html` preselects that level card.

## The jukebox

`jukebox/index.html` is one self-contained page (inline CSS/JS, EN/ES via the
shared `wedding-lang` key). Its topbar deliberately mirrors `rsvp/index.html`
(`‹ EXIT` + EN/ES · title · `CREDITS`, where credits = songs the guest can
still add). The cabinet is ~30% of the viewport on a laptop
(`clamp(360px, 30vw, 560px)`) and full-width on a phone; its text sizes off
the cabinet's own width (`cqw`), so it scales as one object.

The flow is deliberately one-step-at-a-time (an earlier version with an `ADD`
button next to the search box was confusing): the search row is just the input.
Tapping a result plays its preview and reveals, **inside the preview panel**, a
name field (remembered from last time) and a full-width `SEND SONG` button that
flashes cyan/gold (static under `prefers-reduced-motion`). Feedback shows in the
panel while a song is picked, under the search box otherwise. The panel sits
*above* the results, so picking a result scrolls it into view — keep that on
phones.

After a successful send: the send block hides, the search clears, a pixel-confetti
burst plays (`confetti()`, skipped for `prefers-reduced-motion`) and **the preview
keeps playing** as its soundtrack. That's why there are two pieces of state:
`state.selected` (the pick waiting to be sent — drives the send block) and
`state.now` (what's loaded in the player / shown in the panel — outlives a send
until the preview ends). Don't stop the audio or clear `now` on a successful send.

Every row in the list is a button: tapping it plays that song's 30s preview (tap
the playing row again to pause/resume). To make that instant — phones only allow
audio that starts straight from a tap — the script saves each song's Apple
`previewUrl` in the Sheet (column "Preview URL") and returns it, with `trackId`,
in every list row. If a saved address ever stops working, `onPreviewError()` asks
iTunes for the current one once and retries; rows saved without one are looked up
on tap. Songs added "as typed" have no preview (the panel says so). Tapping a row
while a pick is waiting to be sent drops that pick, so the send button can never
send a different song than the one shown.

How it works:
- **Search + preview** go straight from the browser to Apple's **iTunes Search
  API** (free, no key, CORS-open, 30 s `previewUrl`). Spotify was ruled out:
  a dev app now needs a Premium owner, refresh tokens expire every 6 months,
  and new apps get no `preview_url`.
  - **iOS Safari exception:** on real iPhone/iPad Safari, iTunes' search endpoint
    redirects the browser's `fetch()` to a `musics://` deep link instead of
    returning JSON (it's trying to hand the tap off to the Music app) — CORS
    correctly refuses to follow a redirect to a non-http(s) scheme, so the
    request always fails, every time, for every guest on that browser (verified
    with real WebKit, not just Chromium — this isn't intermittent). Chrome/CriOS
    on iOS, Android, and desktop Safari are unaffected; only genuine Mobile
    Safari triggers it. `runSearch()` in `jukebox/index.html` catches that
    failure and retries once through `JUKEBOX_ENDPOINT + '?action=search&term='`,
    which the repo-root `google-apps-script.gs`'s `doGet` proxies to the same
    iTunes endpoint via `UrlFetchApp` — a server-side request never gets that
    redirect. Preview playback itself is unaffected (it's a plain `<audio>`
    src to a static CDN URL, not a fetch to `/search`). **Redeploy the Apps
    Script** (see the file's header) whenever `searchTracks_`/`doGet`
    changes, same as any other edit to it.
- **The list** lives in the **"Songs" tab of the RSVP spreadsheet** (the guest
  list), behind the repo-root `google-apps-script.gs` (`JUKEBOX_ENDPOINT` in
  the page — empty means "not wired up yet" and the page says so). One Apps
  Script project serves both the jukebox and the RSVP form — a project can
  only have one `doPost`/`doGet`, so `doPost` routes on the request shape
  (the jukebox always sends `{action: 'add'|'remove', guestId, ...}`; the
  RSVP form never does) and `doGet` is jukebox-only. It opens the spreadsheet
  via `SPREADSHEET_ID` (empty = the Sheet it's bound to) — deliberately left
  empty in the repo (public, and the ID is what opens the guest list); only
  needed in the Apps Script editor if it's run as a standalone project rather
  than bound to the Sheet. `submitRsvp_` writes to the spreadsheet's *first*
  tab (`getSheets()[0]`), not the active one, so the Songs tab (created after
  it on first use) can't catch RSVPs. The jukebox side re-fetches the track
  from iTunes by id (client strings are never trusted), dedupes, caps songs
  per guest (`MAX_SONGS_PER_GUEST`), and soft-deletes removals
  (`Status = removed`). Each row has an "Open in Spotify" link so the couple
  can move songs into a playlist. Songs iTunes doesn't know can be added "as
  typed" (`Source = typed`).
- A browser is identified only by a random `jukebox-guest-id` in localStorage —
  that's what makes "ADDED BY YOU" rows removable. It's a casual guard, not auth.
- The POST uses `Content-Type: text/plain` on purpose: it keeps the request a CORS
  "simple request" (Apps Script can't answer a preflight) while the reply stays
  readable. Don't switch it to `application/json`.
- Text set from JS is always `textContent`, and the Sheet's text columns are
  plain-text formatted before writing — don't loosen either (HTML / formula injection).

## The getaway

An invitation, as a game, to a pre-wedding getaway: **13–18 September 2027,
Robledo de Chavela** (Sierra de Madrid, direct train to Madrid in 55 min),
**10 spots**. The couple sends the `/getaway/` link to the invited guests only.

- **Not linked, on purpose.** No page on the site links to `/getaway/` or
  `/getaway/details/`, and both carry `<meta name="robots" content="noindex">`.
  Don't add a card, footer link or sitemap entry for them. That's a surprise
  kept by obscurity, not privacy: the repo is public, so don't put a street
  address or anything sensitive in either page.
- **The game** (`getaway/index.html` + `getaway/src/`) is its own Phaser game
  but borrows PILAR vs JOE's modules rather than copying them:
  `getaway/src/shared.js` re-exports everything it uses from `../game/src/`
  (palette, sprites, i18n, sfx, touch controls, toggles, character select), and
  its Boot scene points the loader at `../game/` for the Pili/Joe sprites. So a
  rename or behaviour change in those `game/src/` modules affects both games.
  The same conventions apply (`game/CLAUDE.md`): input only through
  `InputActions`, `?scene=<slug>&char=<pili|joe>` debug jumps (slugs in
  `getaway/src/config/sceneRegistry.js`), numbers in `config/tuning.js`.
- **Flow:** intro ("CONGRATS! YOU'VE BEEN CHOSEN" / accept the challenge) →
  choose player → **Level 1, Space** (platformer; collect 69 of the ~119 coins
  and reach the pirate flag) → conversation: the date → **Level 2, Mars Wastelands**
  (three heights: ground plus two tiers of one-way rock ledges, with lava pits
  that can only be crossed over the ledges; small blue monsters must be jumped
  — shooting one splits it in two; big ones must be shot; and one giant with a
  health bar at the very end, which fires a slow shot back now and then — layout
  in `logic/MarsLayout.js`) → conversation: the location → **Boss** (saucer overhead, shoot
  up, 3 hearts; below half health it steps up once, mildly — `BOSS.secondHalf`
  in `tuning.js`. The couple found an earlier, steeper second half too
  difficult, then asked for a gentler one back, so keep the step small) → conversation → finale: house picture +
  `FULL DETAILS` button to `details/`. Each level is preceded by a
  `LevelIntro` screen (name, art, goals); RETRY skips it.
- **Conversations** (`scenes/ConversationScene.js`): every level ends with a
  Monkey Island-style chat with the character the guest is playing, both
  written as bickering pirates. Three rounds; a wrong reply gets a joke and is
  crossed off, the right one moves on, and nobody can fail. The last answer
  gives up one piece of the invitation (date, then location, then the finale),
  followed by the reveal animation. **The whole script is data in
  `config/conversations.js`** (EN and ES, Pili and Joe) — edit jokes there;
  `game/tests/getaway/conversations.test.js` checks its shape and that the
  facts are stated correctly. Don't put invented facts about the house in the
  jokes. The round/crossed-off bookkeeping is `logic/Dialogue.js`. The avatar
  is the character's portrait cropped by the `FACE` table in the scene.
- **Dying** always goes to the shared `GameOver` scene: a **pure black** screen
  (the one deliberate exception to the `#120B2E` background), a skull,
  `YOU'RE DEAD` and `RETRY`, which restarts the level the player died in.
  It's staged (`GameOverScene.js`): the skull drops in and laughs, its eyes
  glow, the title slams down and drips, embers rise — the couple asked for it
  to be "way cooler", so don't strip it back to a static screen.
  Reaching level 1's flag short of the coin target is a death too. Unlike
  PILAR vs JOE, this game has fail states on purpose.
- The intro screen shows the site's RSVP success illustration
  (`assets/site/rsvp-success.webp`), the only image this game loads from
  outside `game/`. It stands in a code-drawn black hole (`addBlackHole()` in
  `backdrops.js`): a black disc fading to purple then dark blue, inside a
  slowly turning spiral aura.
- **Backdrops** (`getaway/src/config/backdrops.js`) are several parallax layers
  per level — starfield/nebulae/planets/asteroids in space; hazy sky, mountains,
  mesas and rocks on Mars; a retro sci-fi city at dusk for the boss, after a
  reference picture the couple supplied (black starry sky, big moons, a
  purple-to-gold sunset, two rows of spired and domed towers with small yellow
  windows, on a metal rooftop — the front row stays dark so the player reads
  clearly; busier neon versions were rejected) — plus a plain starfield behind the in-between
  screens. Every tone is a palette token or a `mix()` of two; keep it that way.
- **Art is code-drawn placeholder** (`getaway/src/config/art.js`, in the shared
  palette). The exceptions are the couple's own pictures: the finale shows
  their house and pool (house behind, pool tilted in front, as on the details
  page — `finale-house` / `finale-pool`, 640px copies `house-game.webp` /
  `pool-game.webp`), the location reveal shows their route map (below), and
  the details page uses the full-size ones.
- **The location reveal shows the couple's route map** (`drawLocationMap()` in
  `config/rewardArt.js`, texture `location-map` = `getaway/assets/map-game.webp`,
  a 512px copy of the details page's `map.jpeg`), drawn with smooth filtering
  despite `pixelArt: true` since it's a picture, not pixel art. The date
  reveal is still the code-drawn calendar.
- **Level 2's giant is the couple's own art**, the exception to the line above.
  The game loads `getaway/assets/monster-giant.webp`: the couple's sheet (walk,
  walk, damage, attack) re-cut into even frames (each frame centred on the
  head, alpha made hard-edged, lossless webp). The original PNG was removed
  from the repo at the couple's request, so that `.webp` is the only copy here
  (the original is in git history, commit 67ea945, `assets/site/finalboss.png`).
  Frame size, display height and which frame is which pose live in
  `MONSTER_SHEETS` in `art.js` — if the sheet is replaced, update those numbers
  (a unit test checks they match the file). The giant's art faces left, so the
  scene flips it to face the player.
- **Level 1's coins and the boss's ship are code-drawn at a finer grain** than
  the first placeholders, and animated: the coin spins (four grids,
  `COIN_FRAMES`) and the ship's lights pulse (two grids, `SHIP_FRAMES`). The
  ship is a head-on fighter — ball cockpit with a red viewport between two
  dagger-shaped wings — because the couple asked for something evil, "like
  from Star Wars"; the code still calls it the saucer. Keep it about as flat
  as it is (84px): on a short landscape phone there is little room between it
  and the player's head.
- **The pirate flag** that ends levels 1 and 2 ripples: six frames drawn by one
  function (`flagKey(scene, frame)` in `art.js`), added with `addFlag()` in
  `sceneHelpers.js`. The skull stays plain white on purpose — shading it with
  the folds made it unreadable mid-ripple.
- **Level 2's big monster is code-drawn**: a red box-headed imp with a
  two-frame walk (`monster-big` / `monster-big-step` in `art.js`, 32×40 grids).
  The couple supplied a red monster sprite for it, rejected it as-is (the PNG
  has since been removed from the repo), then asked for a code-drawn one "like
  this but cooler" — so the shape (box head, gold eyes, jagged grin, tiny body)
  follows that sprite, with horns, a glare, a scar and a tail added. (An orange
  horned beast was tried in between and dropped.)
- **Details page** (`getaway/details/index.html`) is a sibling of the level
  pages (same topbar, one DOM/two layouts, EN/ES), so layout fixes there
  probably apply to it. Its pink `CONFIRM` button goes to `CONTACT_URL` at the
  top of its script — empty (as now) leaves it showing but doing nothing. The couple will make a form for
  it; don't put their email addresses there (the repo is public, they asked
  for them to be taken out). The pictures are the couple's, in `getaway/assets/`: `house` behind,
  `pool` tilted in front (they asked for the pool on top), and `map` (the train
  route) as a third print tucked behind the pool's bottom-left corner. At the
  bottom is a white PRO TIP card about The Social Hub Madrid (where the couple
  stay around the wedding) with `hotel1`, `hotel2` and `map-hotel` (full width,
  so its labels stay readable). The
  `.jpeg`s are the sources they sent; the page loads lossy `.webp` copies
  (`cwebp -q 85 -m 6`), since these are photos, not pixel art. Press Start 2P
  has no accented capitals, so its copy is written without accents
  (`PRINCIPE PIO`).
- **Tests:** the game's pure logic is covered in `game/tests/getaway/` and runs
  with the rest (`cd game && npm test`), including a check that every hop in
  level 1 is jumpable with the tuned physics — rerun it after touching
  `PlatformLayout.js` or `PLAYER` in `tuning.js`.

## Alba & Sofia Adventure

`alba-sofia/` is THE GETAWAY again for Alba and Sofia: the same levels and the
same invitation, but the guest plays **Sofia** (black t-shirt) or **Alba**
(purple t-shirt), and Pili and Joe are the hosts instead of the players.

- **A real copy, on purpose.** `alba-sofia/src/` started as a duplicate of
  `getaway/src/` so the two can change independently. A fix to a level, the
  boss, a backdrop or the death screen in one is **not** picked up by the
  other: make it in both if it should apply to both. Like the getaway it
  still imports the engine-level modules from `game/src/` through its own
  `shared.js`. Everything in "The getaway" above applies here except what
  this section says.
- **Not linked, `noindex`**, same as the getaway. Its (now unreached)
  finale's `FULL DETAILS` button goes to the getaway's page (`DETAILS_URL =
  '../getaway/details/'`); there is no second details page.
- **Spanish by default**, unlike everything else on the site
  (`alba-sofia/src/config/lang.js`). The game keeps its own choice under
  `alba-sofia-lang` and puts the site-wide `wedding-lang` value back after
  every change, so its EN/ES toggle and the site's never affect each other.
- **Level 1 asks for 73 coins**, not the getaway's 69 (`coinTarget` in
  `alba-sofia/src/config/tuning.js`); Pili's first line in the conversation
  says the number, so change both together.
- **Characters** are in `alba-sofia/src/config/characters.js`: the players
  (`sofia`, `alba`), the hosts (`pili`, `joe`), the image manifest, and which
  player was picked (`setPlayer`/`getPlayer` — PILAR vs JOE's `gameState` only
  accepts `pili`/`joe`, so it isn't used for this). Debug jumps take
  `&char=sofia|alba`. The select screen is this game's own
  (`scenes/SelectScene.js`), since the shared one hard-codes Pili and Joe.
- **Art:** `alba-sofia/assets/` holds the four poses per player (idle, two
  run frames, jump; idle is 80px tall like Pili's and Joe's), a portrait each,
  `cover.webp` (the pair together, on the intro) and `high-five.webp`. They were cut from the
  pictures in `reference/alba-sofia/`: each pose is one connected shape in
  the `*_animation 1.png` sheets, scaled by one factor per sheet with the
  alpha made hard-edged, then every pose of a player padded on top to the
  same frame height (the physics body hangs off the feet, so a shorter jump
  frame dropped Alba through the floor; a test checks this); the portraits and cover are the single pictures
  trimmed, as lossless webp. Pili's and Joe's sprites and portraits are
  loaded from `../game/assets/`.
- **Who waits where:** Pili stands under level 1's flag and Joe under level
  2's (`addHost()` in `sceneHelpers.js`). The conversation that follows is
  with them: `date` with Pili, `location` with Joe, `full` (after the boss)
  with both.
- **Conversations** are keyed by step, not by the character played
  (`config/conversations.js`; `SPEAKERS` says who talks in each), and they
  are **about the adventure, not the getaway**: the girls are nine, so Auntie
  Pili and Uncle Joe are galactic pirates (she is the bossy captain of the
  starship Stinky Sock, he is "the bravest pirate in the galaxy" and scared
  of everything) who tell the player what to do next — Pili how to cross
  Mars, Joe how to beat the warship, both of them welcoming her into the
  crew. The game **ends on the screen after that** (the pair high-fiving on
  the intro's starfield, "the galaxy is safe thanks to Sofia & Alba", `PLAY
  AGAIN` back to the select screen): the couple took the invitation out, so
  `FinaleScene` is no longer reached (only by `?scene=finale`). Keep it silly, never mean or scary, and keep the
  instructions true to the levels (a test checks them, and that no date or
  place slips in). The step names (`date`, `location`, `full`) are left over
  from the getaway. In the two-host one every line and answer is wrapped in
  `pili(...)` or `joe(...)` to say whose it is. In the scene the hosts' faces
  sit on top of the panel (the one talking is ringed in gold, nods and gets
  the bubble's tail) and the player's own face is in a cyan ring at the
  bottom-left, beside the replies. The `FACE` table there crops all four
  portraits.
- **Tests:** `game/tests/alba-sofia/` (same three files as the getaway's,
  adapted), run by `cd game && npm test`.

## Linking the two

- **Site → game:** the "ARCADE / PLAY THE GAME" card in `index.html`'s hero
  grid, links to `game/` (relative — works under any GitHub Pages path).
- **Site → level pages:** the "LVL 1 / THE WEDDING" and "LVL 2 / THE AFTER
  PARTY" cards in the same grid link to `wedding/` and `after-party/`; each
  page's `‹ EXIT` links back to `../`.
- **Site → jukebox:** the "BONUS / THE JUKE-BOX" card in the same grid, links
  to `jukebox/`. The jukebox's `‹ EXIT` links back to `../`.
- **RSVP → jukebox:** the RSVP page's success screen ("GG!") ends with a
  pink "ADD YOUR SONGS TO THE JUKE-BOX ▸" button linking to `../jukebox/`, so
  a guest who just confirmed is invited straight into the soundtrack list.
- **Game → site:** `game/src/config/tuning.js` → `RSVP_URL`. Currently
  `null` (shows "RSVP details coming soon" on the game's ending screen).
  Once the site has a real RSVP destination, set it there — the game's
  EndingScene picks it up automatically, no scene code changes needed.

## Hosting

Single GitHub repo, single GitHub Pages deploy (serve from the `main`
branch root). Root path → wedding site, `/game/` → the game. `.nojekyll` at
the repo root disables Jekyll processing since this is plain static output,
not a Jekyll site.
