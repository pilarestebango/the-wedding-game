# PILAR vs JOE — Wedding Arcade Game
### Game Design & Technical Specification — v0.1

A 2D side-scrolling arcade game, retro pixel-art style, telling the couple's
story in three levels ending in a proposal. Built to match the visual
identity already established in `Arcade Wedding.dc.html`.

---

## 1. Concept & Visual Identity

- **Genre:** 2D side-scroller / mini-game gauntlet, vintage arcade look (think
  NES-era platformer + button-mashing QTEs).
- **Reference file:** `images/Arcade Wedding.dc.html` — this is the couple's
  existing wedding-site landing page, not the game itself, but it defines the
  exact palette, fonts and tone the game must match.
- **Design tokens pulled from that file:**

  | Token | Value | Use |
  |---|---|---|
  | Background | `#120B2E` | canvas / page background |
  | Cyan | `#00E5FF` | UI accents, links, borders |
  | Yellow/Gold | `#FFD400` | headline text, highlights |
  | Red | `#E5341F` | title drop-shadow, danger/obstacle accents |
  | Muted purple | `#7a6fb0` | secondary text, inactive UI |
  | Off-white | `#F2F2F2` | body text |
  | Heading font | `Press Start 2P` (Google Font) | titles, HUD, buttons |
  | Body font | `JetBrains Mono` (Google Font) | dialogue, smaller UI text |
  | Title style | 6px/6px hard drop-shadow, no blur | matches "PILAR VS JOE" title |
  | Image rendering | `image-rendering: pixelated` | required on every sprite/tile so scaled pixel art stays crisp |

- **Existing art assets found in `wedding site/images/`** (already usable):

  | File | Likely use |
  |---|---|
  | `caracters/pili.png`, `caracters/joe.png` | character select portraits, idle/menu art |
  | `caracters/pili wedding.png`, `caracters/joe wedding.png` | wedding-attire versions (hover-swap on the site; reuse for the ending scene) |
  | `poses /dancing.png` | Level 3 "Pilar waits & dances" scene |
  | `poses /happy.png`, `poses /invincible.png` | win screens, boss-clear celebration |
  | `poses /proposal.png` | final boss scene backdrop/art |
  | `poses /wedding.png` | ending illustration |

  These are full illustration pieces (one static pose each) — great for
  menus, cutscenes and boss intros, but **not** game-ready sprite sheets
  (they have no walk/jump animation frames). See §4 for how we close that
  gap.

---

## 2. Tech Stack

**Recommendation: [Phaser 3](https://phaser.io/)** (MIT-licensed JS game
framework), loaded from a CDN or installed via npm.

Why Phaser instead of hand-rolled canvas code:
- Built-in scene manager (perfect for a level-by-level game like this)
- Built-in Arcade Physics (gravity/jump/collision — no need to write
  platformer physics from scratch)
- Unified input system: the same code path handles keyboard, mouse, and
  touch/on-screen buttons (important for the mobile requirement)
- Sprite sheet + animation support out of the box
- Tween engine (for the pop-up heart, confetti, meters filling, etc.)
- Huge docs/examples base — easy for anyone to pick up in VS Code

If you'd rather have **zero dependencies**, everything below still applies —
it just means writing the scene manager, input abstraction, and collision
detection by hand. I'd only recommend that if you specifically want to learn
those fundamentals; otherwise Phaser will get you to a working game much
faster and with fewer bugs.

**Project structure (no build step required):**

```
wedding-game/
├── index.html
├── src/
│   ├── main.js              # Phaser config + scene list
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── CharacterSelectScene.js
│   │   ├── Level1_DatingRaceScene.js
│   │   ├── Level1_FirstDateBossScene.js
│   │   ├── Level2_JourneyScene.js      # convertible→tent→plane→island→campervan→house
│   │   ├── Level3_WaitScene.js         # Pilar branch
│   │   ├── Level3_RingsScene.js        # Joe branch
│   │   ├── FinalBoss_ProposalScene.js
│   │   └── EndingScene.js
│   ├── ui/
│   │   └── TouchControls.js  # on-screen D-pad + action button
│   └── config/
│       └── palette.js        # the color/font tokens table above, as JS constants
├── assets/
│   ├── sprites/
│   ├── backgrounds/
│   ├── audio/
│   └── fonts/
└── README.md
```

**Running it locally in VS Code:**
- Install the "Live Server" extension, right-click `index.html` → "Open with
  Live Server" — no build tooling needed since it's plain JS + a CDN script
  tag for Phaser.
- Alternative: `npx serve .` from the terminal.
- **Debug shortcut for testing:** support a URL query string to jump straight
  into any scene, e.g. `index.html?scene=house-boss` or
  `index.html?scene=proposal&char=pili`. This is the single most useful thing
  for testing a multi-level game — you should never have to replay Level 1
  to test the ending.

**Hosting when finished:** any static host works (GitHub Pages, Netlify,
Vercel, or a folder on the same host as the wedding site) since there's no
backend.

---

## 3. Controls

| Action | Desktop | Mobile (touch) |
|---|---|---|
| Move forward | `→` | On-screen right D-pad button |
| Jump | `↑` or `Space` | On-screen "JUMP" button |
| Mash / action (drink, talk, pay, propose, etc.) | `Space` (repeated presses) | On-screen big round "action" button (repeated taps) |
| Confirm / Yes / No | `Enter` / click, or dedicated `Y` / `N` keys | On-screen Yes / No buttons |

**Mobile control bar rules:**
- Fixed to the bottom of the viewport, respecting `env(safe-area-inset-bottom)`.
- Shown automatically when a touch-capable device is detected
  (`('ontouchstart' in window)` — feature detection, not user-agent
  sniffing) or the viewport is narrow; hidden entirely on desktop, where the
  real keyboard is used instead.
- Buttons are large (≥ 44×44px tap targets), styled with the same pixel
  borders/palette as the rest of the game, and their label changes per
  context ("JUMP", "DRINK!", "TALK!", "PAY!", "PROPOSE!") so it's always
  obvious what tapping does.
- Both input paths (keyboard and on-screen buttons) should feed into the
  **same** input-handling functions in code — the game logic shouldn't know
  or care which one was used. This is a natural fit for Phaser's input
  system.
- Recommend a soft "rotate to landscape" prompt on portrait phones, since
  this is a side-scroller.

---

## 4. Can Claude Code make the pixel art?

Short answer: **yes for props, obstacles, UI icons, and backgrounds — with a
caveat for animated character sprites.**

- **Props / obstacles / icons / tiles** (beer mugs, kangaroos, books,
  mountains, hearts, rings, speech bubbles, confetti, the car/tent/plane/
  island/camper van/house set-pieces): I can generate these directly with
  code (drawing shapes at low resolution, then scaling with nearest-neighbor
  so it reads as pixel art). **Attached is a first proof-of-concept sheet**
  (`asset_style_test_sheet.png`) built in your exact palette so you can react
  to the style before I make the rest — please flag anything that's off
  (too cartoonish, wrong color weight, etc.) and I'll adjust the approach for
  the full set.
- **Animated character sprites** (Pili/Joe running, jumping, kneeling) are
  the harder case. Your existing `pili.png` / `joe.png` are single detailed
  illustrations, not multi-frame sprite sheets, so there's no walk-cycle to
  extract from them directly. My recommended path:
  1. I build a simplified, lower-detail pixel version of each character (in
     the same palette/silhouette as the existing art) as a small sprite
     sheet with an idle pose, a 2–3 frame run cycle, and a jump pose. This
     is very doable with code and will look properly "8-bit," at the cost of
     losing some of the detail in the original illustrations.
  2. The original, detailed illustrations (`pili.png`, `joe.png`, the
     wedding/dancing/proposal poses) get reused as-is for menus, cutscenes,
     and boss intros, where a static, more detailed image is actually more
     appropriate anyway.
  3. If you want the *gameplay* sprite to keep more of the original
     illustration's detail, the alternative is generating it with an image
     model and hand-tracing/pixelating it down to a sprite grid — that's a
     heavier, more manual process I'd only recommend if the simplified
     version in step 1 doesn't look good enough on review.
- **Backgrounds** (road, sky, ocean/island, house exterior) are simple flat
  parallax strips — also straightforward to generate programmatically.

**Review gate:** before any art gets wired into actual game code, I'll
generate each batch (grouped by level) as plain PNG sheets and send them for
your review first — nothing goes into the game unapproved.

---

## 5. Scene / Level Flow

```
Boot
 └─ Character Select (choose Pili or Joe)
     └─ LEVEL 1 — Single Life (character-specific obstacles)
         └─ Boss: The First Date (bar mini-game)
             └─ "You're in love!" congrats screen
                 └─ LEVEL 2 — The Journey (shared, same for both characters)
                     [convertible → tent → plane → island → camper van → house]
                     └─ Boss: Buying the House
                         └─ LEVEL 3 — branches by character:
                             ├─ Pili: The Wait (17s dance timer, no input)
                             └─ Joe: Getting the Ring (mini side-scroller)
                                 └─ FINAL BOSS — The Proposal
                                     ├─ kneel/ask mash meter
                                     └─ Yes/No prompt (No loops back; Yes wins)
                                         └─ Ending: confetti, illustration, invitation reveal
```

---

## 6. Level Specs

Numbers below (mash counts, timer lengths, etc.) are **starting defaults** —
easy to tune once it's playable. Anywhere I had to fill a gap in the
original brief, it's flagged.

### Level 1 — Single Life

- Classic side-scroller: `→` moves forward, `↑`/Space jumps.
- **7 obstacles** per playthrough, fixed order (not random) so it's testable
  and repeatable:
  - **Pili's obstacles:** beer bottles/cans and kangaroos (alternating or
    mixed, your call on exact sequence).
  - **Joe's obstacles:** books and small mountains.
- Hitting an obstacle: *(open question — see §8)* — options are (a) lose a
  life/restart the level, (b) just a stumble animation with no fail state
  (recommended for a wedding game — keeps it fun and low-stakes for guests
  playing it), or (c) small time penalty.
- Clearing all 7 obstacles triggers the boss.

**Boss: The First Date**
- Short, funny intro text (2–3 lines) — Pili and Joe are sitting at a bar.
  *You'll want to supply/approve the actual joke text; I can draft options.*
- Player taps **"READY!"** to start.
- Loop, **3 times total**, of:
  1. **Drink:** mash Space/action button to fill a "drink" meter from 0→100%.
  2. **Talk:** mash again to grow a speech bubble from small→full.
- After the 3rd completed cycle: a big heart animation plays, then a
  "Congratulations — they're in love!" screen, then auto-advance to Level 2.

### Level 2 — The Journey (shared, same for either starting character)

One continuous shared level, couple always shown together regardless of
which character was originally selected:

1. **Convertible car** — hold/press `→` repeatedly to advance across the
   screen (Madrid‑to‑honeymoon road trip).
2. **Tent** — mash Space repeatedly to fill a meter; at 100% the tent
   "explodes" (comic poof effect) and is replaced by —
3. **Plane** — same forward-advance mechanic as the car.
4. **Island with palm tree** — mash Space again; at 100% the island scene
   swaps to —
5. **White camper van** — forward-advance mechanic again.
6. **House** — the level's boss.

**Boss: Buying the House**
- Short funny intro text (again, needs your actual copy/inside joke).
- Mash Space repeatedly to fill a "pay" meter until the house is purchased.
- On completion: win screen, auto-advance to Level 3.

### Level 3 — branches by which character the player originally chose

- **If Pili:** "The Wait" — an on-screen note ("You don't have to do
  anything except wait") while Pili's avatar dances, with a **17-second**
  visible countdown timer. No input required. At 0, auto-advance to the
  Final Boss intro.
- **If Joe:** "Getting the Ring" — a short side-scroller reusing the Level 1
  engine: `→` to move, jump to collect **7 rings** scattered along the
  track (the engagement ring, in pieces — narrative flourish, not literal).
  Completion is gated on reaching the finish line, not on collecting every
  ring (consistent with the no-fail-state philosophy — see §6 Level 1).
  On reaching the finish, auto-advance to the Final Boss intro.

### Final Boss — The Proposal

- Intro for whichever character just finished Level 3.
- Player mashes Space repeatedly to make Joe kneel and "pop the question"
  (a meter, same pattern as earlier mash mechanics).
- On completion: a big prompt appears for Pilar with two buttons, **YES**
  and **NO**.
  - **NO:** a brief "wrong answer" indication (shake/buzz/comic "ERROR"
    text), then the question re-appears. Loops until YES is chosen — there
    is no real fail state, it's a running joke.
  - **YES:** confetti burst, final illustration of the couple in wedding
    attire (reuse `pili wedding.png` / `joe wedding.png` or `poses/wedding.png`),
    a short animation of the bride jumping into the groom's arms, then the
    **wedding invitation** is revealed (this is the natural place to link
    back into the real wedding site / RSVP flow).

---

## 7. Audio

| Moment | Sound |
|---|---|
| Background music | one looping chiptune track per major scene (menu, Level 1, Level 2, boss fights, ending) — at least 3–4 tracks |
| Jump | short blip |
| Obstacle hit / stumble | comic "boing" or descending tone |
| Ring collected (Joe L3) | coin-style chime |
| Drink / talk mash | tick sound per press, rising pitch as meter fills |
| Tent explosion / island transform | whoosh + pop |
| Car / plane / van advance | subtle engine loop while moving |
| House purchase complete | cash register / "cha-ching" |
| Heart / love moment | soft chime + sparkle |
| Wrong answer (No) | buzzer |
| Yes! / confetti | fanfare stinger |
| UI | mute/unmute toggle, persistent in a corner across all scenes |

Sourcing: royalty-free chiptune packs (e.g. OpenGameArt, itch.io asset
packs, freesound.org) are the fastest route and avoid licensing issues —
happy to help find and shortlist specific tracks/SFX once you're ready for
this pass; original composition is possible too but out of scope for code
generation.

---

## 8. Open Questions / Assumptions to Confirm

1. **Does this game live inside the existing wedding site, or stand alone?**
   The reference HTML is the site's homepage (with RSVP/Wedding/After
   Party/Logistics cards) — is the game a new page linked from there, or
   does it replace/embed into part of that flow?
2. **Fail state in Level 1 / Level 3 rings:** what happens if the player
   mistimes a jump and hits an obstacle? (No fail state recommended — keeps
   it light for wedding guests.)
3. **Exact mash targets & timers** — defaults assumed above (e.g., meter
   fills over some number of presses, 17s wait timer is fixed per your
   brief) — confirm or adjust once it's playable, this is a 5-minute tuning
   pass, not a rebuild.
4. **Joke/dialogue copy** for the First Date intro and House-buying intro —
   who's writing these, you or should I draft options to pick from?
5. **Music/SFX licensing preference** — royalty-free packs vs. something
   custom.
6. **Ending link** — should "the invitation" at the end deep-link to the
   real RSVP page on your wedding site?

---

## 9. Build Plan (each milestone is a playable, testable build)

| # | Milestone | What you can test |
|---|---|---|
| M0 | Project scaffold boots in VS Code (Live Server), shows background color + fonts loading | Tooling works |
| M1 | Character Select screen using existing `pili.png`/`joe.png`, clicking either starts Level 1 | Navigation + existing art integration |
| M2 | Level 1 movement + jump physics with placeholder box obstacles (no art yet) | Core input/collision on desktop |
| M3 | Mobile on-screen controls added; Level 1 playable on phone | Touch input parity |
| M4 | **Asset review gate** — placeholder obstacles swapped for real pixel art (beer/kangaroo/book/mountain) | Visual style approval |
| M5 | First Date boss (mash meters, 3x drink/talk loop, heart ending) | QTE mechanic feel |
| M6 | Level 2 full sequence with placeholders, then art pass | Shared level flow |
| M7 | Level 3 branch (Pili wait timer / Joe gets the ring) | Character branching logic |
| M8 | Final Boss proposal sequence incl. Yes/No loop, confetti, ending screen | Full game loop end-to-end |
| M9 | Audio pass — music + SFX wired into each scene | Full sensory experience |
| M10 | Polish — transitions, mobile QA on real devices, performance check | Ship-readiness |

Debug scene-jump (`?scene=...` URL param, §2) should be added at M1 and used
throughout so testing any later milestone never requires replaying earlier
levels.

---

## 10. Testing Approach

- **Primary method:** manual QA against the milestone table above, using the
  debug scene-jump to reach any point directly.
- **Where automated tests help:** pure logic with no rendering (meter
  math, obstacle-sequence data, character-branch selection) can get simple
  unit tests (e.g. with Vitest) if you want that safety net — likely
  optional for a project this size, but easy to add incrementally.
- **Cross-device checklist per milestone:** desktop Chrome/Safari/Firefox +
  at least one real iOS and one real Android phone (viewport sizes and touch
  behavior vary enough that a simulator alone isn't fully reliable).

---

*Attached: `asset_style_test_sheet.png` — proof-of-concept pixel icons in
the game's palette, for your review before the full asset pass begins.*
