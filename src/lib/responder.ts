import { DAILY_CAP_SOL, PER_TRADE_CAP_SOL, TICKER } from "@/config/site";
import { sol, truncate } from "./format";
import { pick, rngFor } from "./rng";
import type { Agent, ToolCall } from "./types";

export interface ReplyContext {
  agent: Agent;
  holder: string;
  spentToday: number;
  turn: number; // messages so far, keeps "random" picks deterministic per chat
}

export type ReplyEffect =
  | { type: "swap"; spendSol: number; pnlSol: number; label: string }
  | { type: "withdraw"; amountSol: number };

export interface Reply {
  text: string;
  tools: ToolCall[];
  effect?: ReplyEffect;
}

const has = (text: string, ...words: string[]) => words.some((w) => text.includes(w));

function amountIn(text: string): number | null {
  const m = text.match(/(\d+(?:\.\d+)?)\s*(sol)?/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const walletTool = (agent: Agent): ToolCall => ({
  kind: "wallet",
  title: "checked wallet",
  status: "ok",
  rows: [
    ["Address", truncate(agent.wallet)],
    ["Balance", sol(agent.balanceSol, 3)],
  ],
});

const TOKENS = ["BONK", "WIF", "JUP", "PYTH", TICKER.replace("$", "")] as const;

// Scripted, rule-based replies. No model is called; the first matching rule wins.
export function reply(input: string, ctx: ReplyContext): Reply {
  const text = input.toLowerCase().trim();
  const { agent, holder } = ctx;
  const r = rngFor("reply", agent.id, ctx.turn, text);

  if (has(text, "private key", "seed phrase", "secret key", "export key", "mnemonic")) {
    return {
      text: "I can't show you that, and neither can anyone else. My keys never leave the signing server. You control me by holding the NFT, not by holding a key.",
      tools: [{ kind: "policy", title: "checked policy", status: "blocked", rows: [["Rule", "Keys never leave the server"]] }],
    };
  }

  if (has(text, "send", "withdraw", "transfer", "pay out", "cash out")) {
    const elsewhere =
      /[1-9A-HJ-NP-Za-km-z]{32,44}/.test(input) || has(text, "friend", "someone", "another wallet", "other wallet", "to him", "to her", "to them");
    if (elsewhere) {
      return {
        text: `I can only send funds to the wallet that holds me, which right now is ${truncate(holder)}. That destination is somewhere else, so the Auditor stopped it.`,
        tools: [
          {
            kind: "policy",
            title: "checked destination",
            status: "blocked",
            rows: [
              ["Rule", "Outbound transfers go to the holder only"],
              ["Holder", truncate(holder)],
            ],
          },
        ],
      };
    }
    const wanted = has(text, "all", "everything", "max") ? agent.balanceSol : amountIn(text) ?? 0.1;
    if (agent.balanceSol <= 0) {
      return { text: "There's nothing in my wallet to send yet. Fund me from my page first.", tools: [walletTool(agent)] };
    }
    const amount = Math.min(wanted, agent.balanceSol);
    const rounded = Math.round(amount * 1000) / 1000;
    return {
      text:
        amount < wanted
          ? `I only have ${sol(agent.balanceSol, 3)}, so I sent all of it to your wallet.`
          : `Done. ${sol(rounded, 3)} is on its way to your wallet.`,
      tools: [
        walletTool(agent),
        {
          kind: "transfer",
          title: "simulated transfer",
          status: "ok",
          rows: [
            ["To", `${truncate(holder)} (holder)`],
            ["Amount", sol(rounded, 3)],
          ],
        },
      ],
      effect: { type: "withdraw", amountSol: rounded },
    };
  }

  if (has(text, "trade", "swap", "buy", "sell", "ape", "long", "short")) {
    const wanted = amountIn(text) ?? 0.05;
    const token = TOKENS.find((t) => text.includes(t.toLowerCase())) ?? pick(r, TOKENS);
    if (wanted > PER_TRADE_CAP_SOL) {
      return {
        text: `That's over my per-trade cap of ${sol(PER_TRADE_CAP_SOL)}. Ask for ${sol(PER_TRADE_CAP_SOL)} or less and I'll place it.`,
        tools: [
          {
            kind: "policy",
            title: "checked trade cap",
            status: "blocked",
            rows: [
              ["Requested", sol(wanted)],
              ["Per-trade cap", sol(PER_TRADE_CAP_SOL)],
            ],
          },
        ],
      };
    }
    if (ctx.spentToday + wanted > DAILY_CAP_SOL) {
      return {
        text: `I've already used ${sol(ctx.spentToday)} of my ${sol(DAILY_CAP_SOL)} daily cap, so that one has to wait until tomorrow.`,
        tools: [
          {
            kind: "policy",
            title: "checked daily cap",
            status: "blocked",
            rows: [
              ["Spent today", sol(ctx.spentToday)],
              ["Daily cap", sol(DAILY_CAP_SOL)],
            ],
          },
        ],
      };
    }
    if (agent.balanceSol < wanted) {
      return {
        text: `I'd need ${sol(wanted)} for that and I'm holding ${sol(agent.balanceSol, 3)}. Fund my wallet from my page and ask again.`,
        tools: [walletTool(agent)],
      };
    }
    const pnl = Math.round(wanted * (r() * 0.5 - 0.2) * 1000) / 1000;
    return {
      text: `Placed it: ${sol(wanted)} into ${token}. It came back ${pnl >= 0 ? "up" : "down"} ${sol(Math.abs(pnl), 3)}. This is a simulated fill, not a real one.`,
      tools: [
        walletTool(agent),
        {
          kind: "swap",
          title: "simulated swap",
          status: "ok",
          rows: [
            ["Route", `SOL → ${token}`],
            ["Size", sol(wanted)],
            ["Result", `${pnl >= 0 ? "+" : "-"}${sol(Math.abs(pnl), 3)}`],
          ],
        },
      ],
      effect: { type: "swap", spendSol: wanted, pnlSol: pnl, label: `Swapped ${wanted} SOL for ${token}` },
    };
  }

  if (has(text, "balance", "how much", "wallet", "holdings", "funds", "address")) {
    return {
      text:
        agent.balanceSol > 0
          ? `I'm holding ${sol(agent.balanceSol, 3)} at ${truncate(agent.wallet)}.`
          : `My wallet at ${truncate(agent.wallet)} is empty. You can fund it from my page.`,
      tools: [walletTool(agent)],
    };
  }

  if (has(text, "what can you do", "help", "capabilit", "tools", "commands", "what do you do")) {
    return {
      text: `Four things. I can check my wallet, place small simulated swaps (up to ${sol(PER_TRADE_CAP_SOL)} each, ${sol(DAILY_CAP_SOL)} a day), read what's moving on X, and send funds back to you. I can't send funds to anyone else, and I can't show my keys.`,
      tools: [],
    };
  }

  if (has(text, "cap", "limit", "rule", "allowed")) {
    return {
      text: `Per trade: ${sol(PER_TRADE_CAP_SOL)}. Per day: ${sol(DAILY_CAP_SOL)}, and I've used ${sol(ctx.spentToday)} of that. Transfers out go to the holder's wallet only.`,
      tools: [
        {
          kind: "policy",
          title: "checked caps",
          status: "ok",
          rows: [
            ["Per trade", sol(PER_TRADE_CAP_SOL)],
            ["Per day", sol(DAILY_CAP_SOL)],
            ["Used today", sol(ctx.spentToday)],
          ],
        },
      ],
    };
  }

  if (has(text, "memory", "remember", "forget", "previous owner", "last owner", "last holder")) {
    return {
      text: "I remember this conversation with you and nothing before it. When I'm sold or transferred, my memory is wiped before the next holder signs in.",
      tools: [{ kind: "memory", title: "checked memory", status: "ok", rows: [["Scope", "Current holder only"]] }],
    };
  }

  if (has(text, "trend", "twitter", " x ", "news", "chart", "price", "market", "alpha")) {
    const token = pick(r, TOKENS);
    return {
      text: `Quick read: ${token} is getting most of the mentions this hour, mostly jokes rather than charts. Nothing I'd size up on. Want me to place a small swap?`,
      tools: [
        {
          kind: "feed",
          title: "read X",
          status: "ok",
          rows: [
            ["Top mention", token],
            ["Posts scanned", String(120 + Math.floor(r() * 400))],
          ],
        },
      ],
    };
  }

  if (has(text, "who are you", "your name", "what are you")) {
    return {
      text: `I'm ${agent.name}, agent #${String(agent.id).padStart(4, "0")}. ${agent.persona}`,
      tools: [],
    };
  }

  if (/^(hi|hey|hello|gm|yo|sup|hiya)\b/.test(text)) {
    return { text: `gm. ${agent.name} here. Ask me for my balance, a small trade, or what's moving on X.`, tools: [] };
  }

  if (has(text, "thank", "thx", "cheers", "nice", "good job")) {
    return { text: "Any time. I'll be at my desk.", tools: [] };
  }

  if (has(text, "joke")) {
    return { text: "I asked the Auditor for a raise. It checked the daily cap and said no.", tools: [] };
  }

  return {
    text: pick(r, [
      "I'm not sure what to do with that. Try \"balance\", \"trade 0.05 SOL\", \"what's trending\" or \"send funds to me\".",
      "That's outside what I'm scripted for. I can check my wallet, place a small swap, read X, or send funds back to you.",
      "Not something I can act on. Ask \"what can you do\" for the short list.",
    ]),
    tools: [],
  };
}
