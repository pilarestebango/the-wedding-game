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
assets/site/             # site-only images (joe, pili, +wedding variants, rsvp-success): .png + .webp
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
- **After Party:** Sydney, 2027-10-23
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
