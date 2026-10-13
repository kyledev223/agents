# Clawgents (simulation)

A front-end-only toy: "AI agents as NFTs". Burn 500,000 $CLAW to mint a numbered agent
(#0001 to #2000) with its own wallet, chat with it, list it, sell it, and watch its memory
reset for the next holder.

**Nothing here is real.** There is no blockchain, no wallet connection and no backend. Balances
are made up, "transactions" are local state, chat replies are scripted rules, and everything is
stored in your browser's `localStorage`. It is not a financial product.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # static export to ./out (2,000 agent pages, takes ~20s)
npm run preview    # serves ./out at http://localhost:4173
```

The site is a static export (`output: "export"`), so it deploys to Vercel or any static host as is.

To start over in the browser: wallet menu → **Reset the simulation**.

## Change the name, ticker and links

| What | Where |
| --- | --- |
| Project name, ticker, tagline | `src/config/site.ts` (`PROJECT_NAME`, `TICKER`, `TAGLINE`) |
| X, pump.fun and wallet URLs | `src/config/links.ts` (`TWITTER_URL`, `PUMPFUN_URL`, `WALLET_URL`) |
| Supply, burn cost, fee, trade caps | `src/config/site.ts` |
| Logo mark | `LogoMark` in `src/components/chrome/nav.tsx`, and `src/app/icon.svg` |
| Design tokens (colours, fonts, keyframes) | `tailwind.config.ts`, `src/app/globals.css` |

The links currently point at placeholders (`https://x.com/your_handle`,
`https://pump.fun/coin/your_coin_address`). A long project name may need a smaller logo size in
`SideNav` (`src/components/chrome/nav.tsx`).

## Where things are

```
src/app/                 routes: / agents agents/[id] market mint console docs roles
src/state/store.tsx      the whole simulation: wallets, mint, list, buy, fund, chat (localStorage)
src/lib/seed.ts          deterministic mock data (412 agents, 18 listings, 3 fake wallets)
src/lib/responder.ts     the scripted chat rules and tool-call cards
src/lib/roles.ts         the six roles and their copy
src/components/scene/    the three SVG scenes (office, whiteboard room, desk) and the page shell
src/components/agents/   robot characters, per-agent avatars, cards, buy/list modals
src/components/chrome/   nav, top bar, wallet modal, footer, toasts
```

All artwork is original inline SVG. Each agent's avatar is generated from its number.

## Trying the full flow

1. Every **Connect wallet** button links out to `WALLET_URL` (OKX). To use the built-in wallets, click any
   **Buy** button on the Market while disconnected and pick *Lantern* (2,350,000 $CLAW) in the picker.
2. **Mint** → burn → the new agent (#0413) is revealed.
3. It shows up under **Agents** and in the **Console**. Fund it from its page, then chat:
   `balance`, `trade 0.05 SOL`, `send 0.1 SOL to me`, `send 1 SOL to my friend`.
4. **Market** → *List for sale*.
5. Wallet menu → *Switch wallet* → *Tidepool* → buy it. The seller gets the price less 2%,
   and the Console shows a blank memory.

`npm run test:flow` runs exactly this with Playwright against `npm run preview`.

## Design reference

The layout and visual language follow hireagents.fun; the method and extracted values are in
`DESIGN_SPEC.md`, along with the remaining differences.

```bash
npm run shots:reference   # re-capture ./reference (needs network)
npm run shots:ours        # capture this site to ./screenshots (dev server or preview running)
```

`reference/` holds screenshots of someone else's site, kept only as a private visual target.
It is not used by the app; don't publish or redistribute it.

## Notes

- The scripts above need a browser once: `npx playwright install chromium`. The site itself does not.
- `./out` is about 10,000 small files. If this folder syncs to a cloud drive, consider excluding
  `out/`, `.next/` and `node_modules/`.
