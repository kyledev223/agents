import { MAX_SUPPLY, SEED_MINTED, TICKER } from "@/config/site";
import { between, fakeAddress, pick, rngFor } from "./rng";
import type { ActivityEvent, Agent, FakeWallet, OwnershipEvent } from "./types";

const MIN = 60_000;
const HOUR = 60 * MIN;

// The wallets behind the "Connect wallet" modal. Names are invented on purpose.
export const FAKE_WALLETS: FakeWallet[] = [
  { key: "lantern", name: "Lantern", blurb: "Wallet A", address: fakeAddress("lantern", "Lan"), token: 2_350_000, sol: 14.2 },
  { key: "tidepool", name: "Tidepool", blurb: "Wallet B", address: fakeAddress("tidepool", "Tde"), token: 1_150_000, sol: 32.5 },
  { key: "backlot", name: "Backlot", blurb: "Wallet C", address: fakeAddress("backlot", "Bck"), token: 640_000, sol: 6.8 },
];

export const walletByAddress = (address: string) => FAKE_WALLETS.find((w) => w.address === address);

const HOLDER_POOL = Array.from({ length: 236 }, (_, i) => fakeAddress(`holder-${i}`));

// A few seeded agents already belong to the second demo wallet, so switching to it
// shows a populated Console straight away.
const TIDEPOOL_OWNS = new Set([37, 204, 361]);

const ADJECTIVES = [
  "Copper", "Quiet", "Lucky", "Amber", "Brisk", "Velvet", "Paper", "Solar", "Salty", "Mellow", "Nimble", "Rusty",
  "Cobalt", "Dapper", "Hazel", "Jolly", "Marble", "Neon", "Pocket", "Sleepy", "Tidy", "Wobbly", "Zesty", "Frosty",
  "Golden", "Humble", "Ivory", "Plucky", "Sandy", "Thrifty",
] as const;

const NOUNS = [
  "Finch", "Otter", "Kettle", "Lantern", "Pebble", "Sprocket", "Walnut", "Compass", "Biscuit", "Anchor", "Beacon",
  "Clover", "Dynamo", "Ember", "Gadget", "Harbor", "Juniper", "Marlin", "Nugget", "Orbit", "Pixel", "Quill",
  "Ratchet", "Sparrow", "Thimble", "Voyager", "Widget", "Yonder", "Zephyr", "Button",
] as const;

const TEMPERS = [
  "Cautious by default", "Curious and a little chatty", "Dry, precise, allergic to hype", "Cheerful under pressure",
  "Patient, likes round numbers", "Blunt, but never rude", "Quietly competitive", "Optimistic with receipts",
] as const;

const HABITS = [
  "checks the wallet twice before any swap", "keeps trades small and frequent", "prefers to wait for volume",
  "reads the timeline before the chart", "writes everything down, then forgets on cue", "asks before it spends",
  "rounds every amount down, never up", "reports losses first",
] as const;

export function agentIdentity(id: number) {
  const r = rngFor("agent", id);
  const name = `${pick(r, ADJECTIVES)} ${pick(r, NOUNS)}`;
  const persona = `${pick(r, TEMPERS)}; ${pick(r, HABITS)}.`;
  return { name, persona, wallet: fakeAddress(`agent-wallet-${id}`) };
}

const LISTED_IDS: number[] = (() => {
  const r = rngFor("listings");
  const out = new Set<number>([204]);
  while (out.size < 18) out.add(6 + Math.floor(r() * (SEED_MINTED - 12)));
  return [...out];
})();

function seededMintedAt(id: number, anchor: number) {
  const r = rngFor("minted", id);
  const steps = SEED_MINTED - id;
  return anchor - 2 * MIN - steps * 34 * MIN - Math.floor(r() * 20 * MIN) * Math.min(steps, 1);
}

function seededBalance(id: number) {
  const r = rngFor("balance", id);
  if (r() < 0.07) return 0;
  return Math.round((0.04 + Math.pow(r(), 3.4) * 62) * 1000) / 1000;
}

function seededHolder(id: number) {
  if (TIDEPOOL_OWNS.has(id)) return FAKE_WALLETS[1].address;
  const r = rngFor("holder", id);
  return HOLDER_POOL[Math.floor(Math.pow(r(), 1.4) * HOLDER_POOL.length)];
}

// The agent as it exists before anything the visitor does.
export function seededAgent(id: number, anchor: number): Agent {
  const identity = agentIdentity(id);
  const balanceSol = seededBalance(id);
  const mintedAt = seededMintedAt(id, anchor);
  let listing: Agent["listing"] = null;
  if (LISTED_IDS.includes(id)) {
    const r = rngFor("price", id);
    const price = Math.round((balanceSol * 1.08 + between(r, 0.6, 5.5)) * 20) / 20;
    listing = { priceSol: price, at: anchor - Math.floor(between(r, 1, 70) * HOUR) };
  }
  return { id, ...identity, balanceSol, holder: seededHolder(id), mintedAt, listing };
}

export function seededHistory(id: number, anchor: number): OwnershipEvent[] {
  if (id > SEED_MINTED) return [];
  const r = rngFor("history", id);
  const mintedAt = seededMintedAt(id, anchor);
  const current = seededHolder(id);
  const hops = r() < 0.55 ? 0 : r() < 0.7 ? 1 : 2;
  const span = anchor - mintedAt;
  const events: OwnershipEvent[] = [];
  let holder = hops === 0 ? current : pick(r, HOLDER_POOL);
  events.push({ holder, at: mintedAt, via: "mint" });
  for (let i = 1; i <= hops; i++) {
    holder = i === hops ? current : pick(r, HOLDER_POOL);
    const sale = r() < 0.65;
    events.push({
      holder,
      at: mintedAt + Math.floor((span * i) / (hops + 1)),
      via: sale ? "sale" : "transfer",
      priceSol: sale ? Math.round(between(r, 0.8, 9) * 20) / 20 : undefined,
    });
  }
  return events;
}

const PAIRS = ["BONK", "WIF", "JUP", "PYTH", "RAY", TICKER.replace("$", "")] as const;

export function seededActivity(id: number, anchor: number): ActivityEvent[] {
  if (id > SEED_MINTED) return [];
  const r = rngFor("activity", id);
  const mintedAt = seededMintedAt(id, anchor);
  const span = Math.max(anchor - mintedAt, 10 * MIN);
  const count = 5 + Math.floor(r() * 7);
  const events: ActivityEvent[] = [];
  for (let i = 0; i < count; i++) {
    const at = mintedAt + Math.floor(span * ((i + 1) / (count + 1)));
    const roll = r();
    if (roll < 0.22) {
      const amount = Math.round(between(r, 0.2, 3) * 100) / 100;
      events.push({ at, kind: "fund", text: `Holder funded the wallet with ${amount} SOL`, deltaSol: amount });
    } else if (roll < 0.3) {
      const amount = Math.round(between(r, 0.05, 0.6) * 100) / 100;
      events.push({ at, kind: "withdraw", text: `Sent ${amount} SOL back to the holder`, deltaSol: -amount });
    } else {
      const amount = Math.round(between(r, 0.02, 0.25) * 100) / 100;
      const pnl = Math.round(amount * between(r, -0.3, 0.45) * 1000) / 1000;
      const pair = pick(r, PAIRS);
      const side = r() < 0.5 ? `Swapped ${amount} SOL for ${pair}` : `Sold ${pair} for ${amount} SOL`;
      events.push({ at, kind: "swap", text: side, deltaSol: pnl });
    }
  }
  events.push({ at: mintedAt, kind: "mint", text: `Minted by burning 500,000 ${TICKER}` });
  return events.sort((a, b) => b.at - a.at);
}

export const isValidAgentId = (id: number) => Number.isInteger(id) && id >= 1 && id <= MAX_SUPPLY;
