# Design spec

Extracted from https://hireagents.fun on 2026-10-12 (HTML, the single linked stylesheet, and
Playwright computed styles). Raw numbers are in `reference/computed-styles.json`; the visual
target is the screenshots in `reference/` (`<page>-375.png`, `-768.png`, `-1440.png`).
Re-run the capture with `node scripts/capture-reference.mjs`.

The tokens below are implemented in `tailwind.config.ts` and `src/app/globals.css`.

## 1. How the reference site is put together

It is not a conventional "nav bar, sections, footer" site. It is a set of illustrated rooms:

| Page | Desktop (≥768px) | Mobile (<768px) |
| --- | --- | --- |
| Home | One full-viewport office scene (`h-svh`). Logo, vertical nav, headline and CTAs sit directly on the scene. A wall screen in the scene shows "Live coins" plus a scrolling ticker. Characters are hover targets with a "Name · Role" pill. | Sticky 56px header, hero text over a cropped scene with a paper scrim, then "Live coins" list and "Your AI team" card grid. |
| /coins, /leaderboard, /docs, /milestones | A fixed "board room" scene. Page content scrolls **inside the whiteboard** on the wall. Title is set in a marker font. Nav lives in a frosted card top-left. | Plain paper page, title in Inter 800. |
| /launch | A fixed "desk" scene. Page content scrolls **inside the monitor**. Title stays Inter 800. | Plain paper page. |
| /teams | Full-bleed team picture, title bottom-left over a dark scrim, hover a character for its info panel. | Header, rounded picture, 2-column name grid. |

There is **no footer** on the reference site.

### The `--u` unit
Scenes are laid out on a fixed reference canvas and every size is `calc(N * var(--u))`:

- Root: `--u: min(100svh / 940, 100vw / 1672)`.
- Home scene canvas 2071 × 940: `--u: min(max(100svh/940, 100vw/2071), 100svh/752, 100vw/1400)`. It covers the viewport but always keeps the left 1400 × 752 region visible.
- Room scenes canvas 1672 × 940: `--u: min(max(100svh/940, 100vw/1672), 100svh/601.6, 100vw/1640)`, offset `top: min(0px, (100svh − 940u) × 0.18)` (0.28 for the desk).
- Content boxes on that canvas: whiteboard `x543 y106 w1056 h534`, monitor `x319 y105 w1255 h568`. `overflow-y: auto`, thin scrollbar `#1b1c1f4d`.
- Home anchors: nav column width 176; logo at x20 y27; headline at x208 y52; wall screen `x874 y222 w174 h294`.

## 2. Colour

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#fbf8f2` | Page background, inputs |
| `paper-2` | `#f4eee7` | Hover fill, skeletons, soft chips |
| `card` | `#ffffff` | Cards |
| `ink` | `#0b0c0c` | Text, primary button |
| `ink-2` | `#2b2c2c` | Body copy, primary hover |
| `ink-3` | `#5d5f5f` | Secondary text, eyebrows |
| `ink-4` | `#9a9b9a` | Placeholder, disabled, rank numerals |
| `rule` | `#e4ded5` | Card and input borders |
| `rule-soft` | `#efeae3` | Row dividers |
| `outline` | `#2b2b2a` | Border of outlined pills/buttons |
| `board` / `board-2` / `board-rule` | `#1f1e1d` / `#2a2928` / `#3a3937` | Dark panels |
| `win` / `win-deep` / `win-soft` | `#22c55e` / `#16a34a` / `#e3f6ea` | Positive, "live" dot, success chip |
| `loss` / `loss-soft` | `#e5484d` / `#fbe5e5` | Negative |
| `warm` | `#e7a33e` | Pending dot |
| `marker` | `#1b1c1f` | Whiteboard title |
| Scene letterbox | `#3b2c22` (home), `#6b4128` (rooms) | Behind the scene |
| Wall screen | bg `radial-gradient(130% 60% at 25% 0%, #12303a, #0a161d 45%, #060a0e)`, accent `#5eead4`, live `#4ade80` | |
| Verified chip | bg `#dcfce7`, text `#15803d` | |
| Selection | bg `ink`, text `paper` | |

## 3. Type

All five families are Google Fonts (OFL), loaded with `next/font/google`. No substitutions needed.

| Role | Family | Details |
| --- | --- | --- |
| Body / UI | Inter (variable) | 16/24, 400. Antialiased, `text-rendering: optimizeLegibility` |
| Display (`.font-display`) | Inter | weight 800 (logo 900), `letter-spacing: -0.035em` |
| Condensed (`.font-condensed`) | Barlow Condensed 600/700 | uppercase, `0.06em`, wall-screen headings |
| Digital (`.font-digital`) | Share Tech Mono 400 | uppercase, `0.06–0.08em`, wall-screen numbers and ticker |
| Marker (`.font-marker`) | Permanent Marker 400 | whiteboard `h1`: uppercase, tracking 0, `#1b1c1f` |
| Hand (`.font-hand`) | Kalam 400/700 | handwritten notes |

Scale (px, size/line-height):

- Home h1: `60u / 62u` (57.4/59.4 at 1440), mobile 44/1.02. Sub: `17u / 22u`, `-0.005em`, `#1d1d1c`; mobile 16/snug `ink-2`.
- Page h1: 40/1.05, 52 from the `@xl` container width. Eyebrow: 12, 600, uppercase, `0.08em`, `ink-3`. Intro: 16/1.625 `ink-2`, max 720.
- Section h2: mobile 24/800; card h2 20/800; docs h2 28 (32 at `@xl`).
- Card title 19/800 display; body 15–15.5; meta 13–13.5; labels 11.5–12.5. Numbers use `tabular-nums`.
- Nav link: `12u`, 500 (`#222221`), active 700 `ink`, row height `42.525u`, icon gap `11u`, left pad `26u`.
- Logo: `38u`, 900, `-0.005em`; tagline `9.2u / 13u`, 500, uppercase, `#5d5d5b`.

## 4. Shape, borders, shadows

- Radii: pills/buttons `9999px`; cards `16px` (`rounded-2xl`); inputs/inner panels `12px` (`rounded-xl`); nav card `18u`; wall screen `3u`; hotspots `14u`.
- Card: `bg-card`, `1px solid rule`, no shadow, padding 16; hover `border-ink-4`. Docs cards use `bg-card/90`.
- Primary button: `bg-ink text-white`, 500, hover `bg-ink-2`; hero `43u` high, `23.5u` inline pad, 14.5u text, arrow icon gap `10u`. Form size `h-12 px-6 text-[15px]`; small `h-8 px-3.5 text-[13px]`. Connect button adds `box-shadow: 0 4px 16px rgba(0,0,0,.18)`.
- Secondary button: `border outline`, `bg-white/45`, `backdrop-blur(2px)`, hover `bg-white/80`.
- Top-right chrome pills: height `max(36px, 40u)`, `border outline`, `bg-white/85`, `backdrop-blur`, hover `bg-white`.
- Filter pills: `px-4 py-2 text-[14px]`, active `border-ink bg-ink text-white`, idle `border-outline hover:bg-paper-2`.
- Search input: `h-11 rounded-full border-rule bg-card px-5 text-[15px]`, focus `border-ink-3`.
- Form input: `h-12 rounded-xl border-rule bg-paper px-3.5 text-[15px]`, focus `bg-white ring-2 ring-ink/30`.
- Nav card (sub-pages): `rgba(255,250,243,.84)`, `backdrop-filter: blur(12px) saturate(1.15)`, `1px solid rgba(255,255,255,.7)`, `box-shadow: 0 10px 30px rgba(60,30,8,.22)`, width `160u`.
- Home nav block: `filter: drop-shadow(0 0 2px rgba(255,249,238,.9)) drop-shadow(0 0 6px rgba(255,244,228,.7))`.
- Hover label pill: `bg-ink text-white rounded-full shadow-lg`, `11.5u` text, pad `12u × 6u`, fades and slides 6u over 200ms.
- Hotspot highlight: `inset 0 0 0 2px rgba(255,255,255,.9), 0 0 0 1px rgba(11,12,12,.25), 0 10px 40px rgba(255,214,140,.35)` + radial warm fill.
- Character shadow: `drop-shadow(0 5u 7u rgba(70,40,12,.32))`.
- Focus: `ring-2 ring-ink ring-offset-2`.

## 5. Layout

- Breakpoints: `sm` 640, `md` 768 (the mobile/desktop switch), then **container queries** on the content box: `@xl` 576, `@2xl` 672, `@3xl` 768, `@4xl` 896, `@5xl` 1024, `@6xl` 1152, `@7xl` 1280.
- Page padding: mobile `px-4 pt-6 pb-20`; in a board `px: clamp(22px, 3.4cqw, 52px)`, `pt: clamp(18px, 2.6cqw, 40px)`, `pb-14`. Docs caps at `max-w-[1240px]`.
- Header block `mb-8`; controls row `mb-6`; card grid `gap-3`, columns 1 → 2 (`@xl`) → 3 (`@4xl`) → 4 (`@5xl`) → 5 (`@6xl`) → 6 (`@7xl`).
- Launch layout: `grid gap-6`, form column + sticky summary column 340/400/440px.
- Leaderboard: table in a card from `@2xl` (`th` 12/600 uppercase `0.08em`, cells `px-4 py-3`, rows `divide-rule-soft hover:bg-paper`); stacked cards below.
- Mobile header: `h-14`, `bg-paper/95 backdrop-blur`, `border-b rule`, logo 26px, 36px circular X button, 34px connect button, menu button.
- Mobile home: hero `px-5 pt-8 pb-44`, sections `px-4`, team grid `grid-cols-2 gap-2.5`, last card spans 2.

## 6. Motion

- Default transition: `150ms cubic-bezier(.4,0,.2,1)`; hover labels 200ms; rolling counter digits 700ms ease-out.
- `screen-ticker`: `translateX(0 → -50%)`, 22s linear infinite, content duplicated once.
- `team-bob`: `translateY(0 → -3px → 0)`, 2.4s ease-in-out infinite.
- `character-in`: from `opacity 0, translate(-28px) scale(.97)`, .35s ease-out. `character-info`: from `translate(20px)`, .35s ease-out, 60ms delay.
- `wb-draw` (stroke-dashoffset 1 → 0, .9s), `wb-write` (clip reveal, `steps(16)`), `wb-fade` (4px rise, .5s).
- `clock-sweep` 24s linear; `pm-fill` scaleX .04 → 1, 6s; Tailwind `ping` and `pulse` for live dots.
- `prefers-reduced-motion: reduce` collapses every animation and transition to ~0ms.

## 7. Mapping to this project

| Reference | Here | Surface |
| --- | --- | --- |
| Home | `/` | Office scene |
| /coins | `/agents` | Whiteboard |
| coin detail | `/agents/[id]` | Whiteboard |
| /leaderboard | `/market` | Whiteboard |
| /launch | `/mint` | Monitor |
| /teams | `/roles` ("Meet the agents") | Full-bleed line-up |
| /docs | `/docs` (Docs + Capabilities) | Whiteboard |
| none | `/console` | Monitor, built from the launch page's cards and inputs |

Identity is our own: name, ticker, logo mark, all copy, all artwork (inline SVG). No reference
images, character art or logo files are downloaded into the app or hotlinked.

## 8. Visual check and remaining differences

Our pages were captured at 375, 768 and 1440 (`npm run shots:ours` → `screenshots/`) and compared
with `reference/`. Tokens, type, component shapes, the `--u` scene maths, the board-in-a-room page
shell, the container-query grids and the mobile layouts match. What still differs, and why:

**Deliberate (identity or brief)**

- **Artwork style.** The reference scenes are 3D-rendered raster images with looping character
  videos, seen from a raised three-quarter angle. Ours are flat vector SVG seen front-on, with CSS
  and Framer Motion animation. Same palette, warmth and composition (window left, wall screen
  centre, desks in two rows), different medium.
- **Six characters, not seven,** and they are robots with our own names and roles.
- **Nav has six links, not eight.** The wordmark is longer than "HIRE", so it is set at 20.5u
  instead of 38u to fit the 160u nav card.
- **Top-right cluster.** Reference: X, contract-address pill with a "Pump verified" chip, Connect.
  Ours: X, pump.fun, a "Program … Simulated" pill (hidden below 1024px), Connect.
- **Hero CTAs** have two extra round buttons (X, pump.fun) after "Browse agents".
- **Home scrolls.** The reference home is exactly one viewport on desktop. Ours continues below
  the scene with Recently minted, Meet the agents, How it works, An agent's life and the footer,
  built from the reference's mobile-home and docs components.
- **Footer.** The reference has none. Ours uses the same tokens (hairline rule, `ink-3` meta text,
  underlined links, round icon buttons).
- **Console** has no reference page. It reuses the launch page's monitor surface, panels, inputs
  and pills.

**Simplifications**

- **Whiteboard perspective.** The reference whiteboard is drawn in perspective and the page
  content is skewed to match. Ours is front-on and flat, which keeps text and inputs crisp.
- **Wall screen.** The reference alternates between "Live coins" and "Latest news". Ours shows one
  panel ("Just minted") with the same header, rows, sparkline and ticker.
- **Agent card** shows two stats (wallet, holder) where the coin card shows three plus a
  bonding-curve bar, which has no meaning here.
- **Meet the agents** uses a vector line-up with per-character click targets and a side panel,
  in place of the reference's group render.
- **Mobile ticker.** The reference has no ticker on mobile; we add one strip under the hero so the
  stats are visible there too.
- **Wallet modal, toasts, mobile menu.** The reference's wallet modal comes from a wallet library
  and its open mobile menu was not captured, so these are our own, built from the same card,
  pill and button styles.

**Inherited quirks (kept because they match)**

- Between roughly 768 and 1100px wide in portrait, the scene only fills the top of the viewport
  and the letterbox colour shows below, and the whiteboard content area is small. The reference
  behaves the same way; it comes from the `100vw / 1640` cap in the `--u` formula.
- Content inside the monitor and whiteboard scrolls within that surface, so long pages (Market,
  Docs, the Console chat) need scrolling inside a fairly short box on laptop screens.
