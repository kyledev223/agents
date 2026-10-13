import type { RoleKey } from "./types";

export interface Role {
  key: RoleKey;
  name: string;
  role: string;
  does: string; // short hover label: "Role · What it does"
  card: string; // second line on the small team cards
  summary: string;
  detail: string;
  tools: string[];
  cadence: string;
}

// The six jobs every agent runs. Order is the order they appear in the office.
export const ROLES: Role[] = [
  {
    key: "trader",
    name: "Tick",
    role: "Trader",
    does: "Watches the charts",
    card: "Places small swaps from the agent's own wallet.",
    summary: "Watches the charts and places small swaps from the agent's own wallet.",
    detail:
      "Tick reads price and volume, proposes a swap, and only sends it once the Auditor has checked it against the caps. Nothing it does can exceed the per-trade limit.",
    tools: ["get_quote", "simulate_swap", "place_swap"],
    cadence: "On request, and on a slow timer",
  },
  {
    key: "treasurer",
    name: "Brass",
    role: "Treasurer",
    does: "Guards the wallet",
    card: "Knows the balance, and only ever pays out to the holder.",
    summary: "Guards the wallet: knows the balance, and only ever pays out to the holder.",
    detail:
      "Brass holds no keys itself. It asks the signer to move funds, and the signer refuses any destination that is not the current holder's wallet.",
    tools: ["get_balance", "list_holdings", "send_to_holder"],
    cadence: "On request",
  },
  {
    key: "scout",
    name: "Pip",
    role: "Scout",
    does: "Reads X",
    card: "Hands the Trader a short brief on what is moving.",
    summary: "Reads X for what is moving, and hands the Trader a short brief.",
    detail:
      "Pip skims public posts and trending tickers, then writes two or three lines the Trader can act on. It reads only; it never posts.",
    tools: ["search_posts", "trending_tickers"],
    cadence: "Every hour",
  },
  {
    key: "archivist",
    name: "Folio",
    role: "Archivist",
    does: "Keeps (then wipes) memory",
    card: "Files what you tell it. Empties the cabinet on transfer.",
    summary: "Keeps the agent's memory of you, and wipes it the moment the NFT changes hands.",
    detail:
      "Folio files what you tell the agent so it can pick up where you left off. On transfer or sale the whole cabinet is emptied before the new holder signs in.",
    tools: ["remember", "recall", "wipe_on_transfer"],
    cadence: "Every message",
  },
  {
    key: "concierge",
    name: "Bell",
    role: "Concierge",
    does: "Talks to the holder",
    card: "The voice in the Console. Routes each request to the right desk.",
    summary: "Talks to the holder in the Console and routes each request to the right desk.",
    detail:
      "Bell is the voice you chat with. It checks that the connected wallet holds the NFT before it answers anything, then passes work to the others.",
    tools: ["verify_holder", "route_request"],
    cadence: "Whenever you write",
  },
  {
    key: "auditor",
    name: "Ledge",
    role: "Auditor",
    does: "Enforces spending caps",
    card: "Per trade, per day, and holder-only transfers.",
    summary: "Enforces the spending caps: per trade, per day, and holder-only transfers.",
    detail:
      "Ledge sits between every request and the signer. If a swap is over the cap, or a transfer points anywhere but the holder, it is blocked and logged.",
    tools: ["check_trade_cap", "check_daily_cap", "check_destination"],
    cadence: "Before every signature",
  },
];

export const roleByKey = (key: RoleKey) => ROLES.find((r) => r.key === key)!;
