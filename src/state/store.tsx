"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MARKET_FEE, MAX_SUPPLY, MINT_COST, SEED_MINTED, TICKER } from "@/config/site";
import { padId, sol, truncate } from "@/lib/format";
import { reply as scriptedReply } from "@/lib/responder";
import { FAKE_WALLETS, agentIdentity, seededActivity, seededAgent, seededHistory, walletByAddress } from "@/lib/seed";
import type { ActivityEvent, Agent, ChatMessage, FakeWallet, Listing, OwnershipEvent } from "@/lib/types";

const STORAGE_KEY = "agents-sim:v1";

interface AgentPatch {
  holder?: string;
  listing?: Listing | null;
  balanceSol?: number;
  mintedAt?: number;
  history?: OwnershipEvent[];
  activity?: ActivityEvent[];
  spent?: { day: string; sol: number };
}

interface Persisted {
  v: 1;
  anchor: number; // first visit; seeded timestamps hang off this
  walletKey: string | null;
  wallets: Record<string, { token: number; sol: number }>;
  patches: Record<number, AgentPatch>;
  minted: number[];
  chats: Record<number, ChatMessage[]>;
}

const emptyState = (anchor: number): Persisted => ({
  v: 1,
  anchor,
  walletKey: null,
  wallets: Object.fromEntries(FAKE_WALLETS.map((w) => [w.address, { token: w.token, sol: w.sol }])),
  patches: {},
  minted: [],
  chats: {},
});

function load(): Persisted {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Persisted;
      if (parsed && parsed.v === 1 && typeof parsed.anchor === "number") {
        return { ...emptyState(parsed.anchor), ...parsed };
      }
    }
  } catch {
    // Storage blocked or corrupt: fall through to a fresh state.
  }
  return emptyState(Date.now());
}

function save(state: Persisted) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or quota: the session still works, it just won't persist.
  }
}

export interface ConnectedWallet extends FakeWallet {
  token: number;
  sol: number;
}

export interface Toast {
  id: number;
  text: string;
  tone: "ok" | "error";
}

export interface Stats {
  minted: number;
  remaining: number;
  burned: number;
  listings: number;
  holdingsSol: number;
  top: Agent | null;
  newest: Agent | null;
}

type Result = { ok: true; id: number } | { ok: false; reason: string };

interface Store {
  ready: boolean;
  now: number;
  wallet: ConnectedWallet | null;
  agents: Agent[];
  agentById: (id: number) => Agent | undefined;
  myAgents: Agent[];
  stats: Stats;
  walletModalOpen: boolean;
  setWalletModalOpen: (open: boolean) => void;
  connect: (key: string) => void;
  disconnect: () => void;
  mint: () => Result;
  list: (id: number, priceSol: number) => Result;
  cancelListing: (id: number) => Result;
  buy: (id: number) => Result;
  fund: (id: number, amountSol: number) => Result;
  historyOf: (id: number) => OwnershipEvent[];
  activityOf: (id: number) => ActivityEvent[];
  chatOf: (id: number) => ChatMessage[];
  sendChat: (id: number, text: string) => void;
  agentReply: (id: number, text: string) => void;
  toasts: Toast[];
  toast: (text: string, tone?: Toast["tone"]) => void;
  reset: () => void;
}

const StoreContext = createContext<Store | null>(null);

const today = () => new Date().toISOString().slice(0, 10);
const round3 = (n: number) => Math.round(n * 1000) / 1000;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Server render and first client render use the same empty state; the real one
  // is read from localStorage after mount.
  const [state, setState] = useState<Persisted>(() => emptyState(0));
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const stateRef = useRef(state);
  const toastId = useRef(0);

  useEffect(() => {
    // Hydrating from localStorage has to happen after mount, in one pass.
    /* eslint-disable react-hooks/set-state-in-effect */
    const loaded = load();
    stateRef.current = loaded;
    setState(loaded);
    setNow(Date.now());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const commit = useCallback((next: Persisted) => {
    stateRef.current = next;
    setState(next);
    setNow(Date.now());
    save(next);
  }, []);

  const toast = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    const id = ++toastId.current;
    setToasts((list) => [...list, { id, text, tone }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4200);
  }, []);

  const agents = useMemo(() => {
    const ids = [...Array.from({ length: SEED_MINTED }, (_, i) => i + 1), ...state.minted];
    return ids.map((id): Agent => {
      const patch = state.patches[id] ?? {};
      const base: Agent =
        id <= SEED_MINTED
          ? seededAgent(id, state.anchor)
          : { id, ...agentIdentity(id), balanceSol: 0, holder: "", mintedAt: state.anchor, listing: null };
      return {
        ...base,
        holder: patch.holder ?? base.holder,
        balanceSol: patch.balanceSol ?? base.balanceSol,
        mintedAt: patch.mintedAt ?? base.mintedAt,
        listing: patch.listing === undefined ? base.listing : patch.listing,
      };
    });
  }, [state.anchor, state.minted, state.patches]);

  const index = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);
  const agentById = useCallback((id: number) => index.get(id), [index]);

  const wallet = useMemo<ConnectedWallet | null>(() => {
    const base = FAKE_WALLETS.find((w) => w.key === state.walletKey);
    if (!base) return null;
    return { ...base, ...(state.wallets[base.address] ?? { token: base.token, sol: base.sol }) };
  }, [state.walletKey, state.wallets]);

  const myAgents = useMemo(
    () => (wallet ? agents.filter((a) => a.holder === wallet.address).sort((a, b) => b.mintedAt - a.mintedAt) : []),
    [agents, wallet],
  );

  const stats = useMemo<Stats>(() => {
    let top: Agent | null = null;
    let holdingsSol = 0;
    let listings = 0;
    for (const a of agents) {
      holdingsSol += a.balanceSol;
      if (a.listing) listings++;
      if (!top || a.balanceSol > top.balanceSol) top = a;
    }
    return {
      minted: agents.length,
      remaining: MAX_SUPPLY - agents.length,
      burned: agents.length * MINT_COST,
      listings,
      holdingsSol,
      top,
      newest: agents.reduce<Agent | null>((n, a) => (!n || a.mintedAt > n.mintedAt ? a : n), null),
    };
  }, [agents]);

  // All mutations read the latest state from the ref so they can run back to back.
  const patchAgent = (s: Persisted, id: number, change: (p: AgentPatch) => AgentPatch): Persisted => ({
    ...s,
    patches: { ...s.patches, [id]: change(s.patches[id] ?? {}) },
  });

  const current = (id: number): Agent | undefined => {
    const s = stateRef.current;
    if (id > SEED_MINTED && !s.minted.includes(id)) return undefined;
    const patch = s.patches[id] ?? {};
    const base: Agent =
      id <= SEED_MINTED
        ? seededAgent(id, s.anchor)
        : { id, ...agentIdentity(id), balanceSol: 0, holder: "", mintedAt: s.anchor, listing: null };
    return {
      ...base,
      holder: patch.holder ?? base.holder,
      balanceSol: patch.balanceSol ?? base.balanceSol,
      mintedAt: patch.mintedAt ?? base.mintedAt,
      listing: patch.listing === undefined ? base.listing : patch.listing,
    };
  };

  const connectedAddress = () => FAKE_WALLETS.find((w) => w.key === stateRef.current.walletKey)?.address;

  const connect = (key: string) => {
    const w = FAKE_WALLETS.find((x) => x.key === key);
    if (!w) return;
    commit({ ...stateRef.current, walletKey: key });
    setWalletModalOpen(false);
    toast(`Connected ${w.name} · ${truncate(w.address)}`);
  };

  const disconnect = () => {
    commit({ ...stateRef.current, walletKey: null });
    toast("Wallet disconnected");
  };

  const mint = (): Result => {
    const s = stateRef.current;
    const address = connectedAddress();
    if (!address) return { ok: false, reason: "Connect a wallet first." };
    const balance = s.wallets[address];
    if (balance.token < MINT_COST) return { ok: false, reason: `You need 500,000 ${TICKER} to mint.` };
    const id = SEED_MINTED + s.minted.length + 1;
    if (id > MAX_SUPPLY) return { ok: false, reason: "All 2,000 agents are minted." };
    const at = Date.now();
    let next: Persisted = {
      ...s,
      wallets: { ...s.wallets, [address]: { ...balance, token: balance.token - MINT_COST } },
      minted: [...s.minted, id],
    };
    next = patchAgent(next, id, () => ({
      holder: address,
      mintedAt: at,
      balanceSol: 0,
      listing: null,
      history: [{ holder: address, at, via: "mint" }],
      activity: [{ at, kind: "mint", text: `Minted by burning 500,000 ${TICKER}` }],
    }));
    commit(next);
    return { ok: true, id };
  };

  const list = (id: number, priceSol: number): Result => {
    const agent = current(id);
    const address = connectedAddress();
    if (!agent || !address || agent.holder !== address) return { ok: false, reason: "Only the holder can list an agent." };
    if (!(priceSol > 0)) return { ok: false, reason: "Enter a price above zero." };
    const at = Date.now();
    commit(
      patchAgent(stateRef.current, id, (p) => ({
        ...p,
        listing: { priceSol, at },
        activity: [{ at, kind: "list", text: `Listed for ${sol(priceSol)}` }, ...(p.activity ?? [])],
      })),
    );
    toast(`${padId(id)} listed for ${sol(priceSol)}`);
    return { ok: true, id };
  };

  const cancelListing = (id: number): Result => {
    const agent = current(id);
    const address = connectedAddress();
    if (!agent || !address || agent.holder !== address) return { ok: false, reason: "Only the holder can cancel a listing." };
    const at = Date.now();
    commit(
      patchAgent(stateRef.current, id, (p) => ({
        ...p,
        listing: null,
        activity: [{ at, kind: "delist", text: "Listing cancelled" }, ...(p.activity ?? [])],
      })),
    );
    toast(`${padId(id)} listing cancelled`);
    return { ok: true, id };
  };

  const buy = (id: number): Result => {
    const s = stateRef.current;
    const agent = current(id);
    const address = connectedAddress();
    if (!address) return { ok: false, reason: "Connect a wallet first." };
    if (!agent?.listing) return { ok: false, reason: "This agent is no longer for sale." };
    if (agent.holder === address) return { ok: false, reason: "You already hold this agent." };
    const price = agent.listing.priceSol;
    const buyer = s.wallets[address];
    if (buyer.sol < price) return { ok: false, reason: `You need ${sol(price)} and have ${sol(buyer.sol)}.` };
    const at = Date.now();
    const wallets = { ...s.wallets, [address]: { ...buyer, sol: round3(buyer.sol - price) } };
    // The 2% fee comes out of the seller's proceeds, not on top of the price.
    if (walletByAddress(agent.holder)) {
      const seller = wallets[agent.holder];
      wallets[agent.holder] = { ...seller, sol: round3(seller.sol + price * (1 - MARKET_FEE)) };
    }
    const chats = { ...s.chats };
    delete chats[id];
    const next = patchAgent({ ...s, wallets, chats }, id, (p) => ({
      ...p,
      holder: address,
      listing: null,
      spent: undefined,
      history: [...(p.history ?? []), { holder: address, at, via: "sale", priceSol: price }],
      activity: [
        { at, kind: "wipe", text: "Memory wiped for the new holder" },
        { at, kind: "sale", text: `Sold for ${sol(price)} to ${truncate(address)}` },
        ...(p.activity ?? []),
      ],
    }));
    commit(next);
    return { ok: true, id };
  };

  const fund = (id: number, amountSol: number): Result => {
    const s = stateRef.current;
    const agent = current(id);
    const address = connectedAddress();
    if (!agent || !address || agent.holder !== address) return { ok: false, reason: "Only the holder can fund an agent." };
    const me = s.wallets[address];
    if (!(amountSol > 0) || me.sol < amountSol) return { ok: false, reason: "Not enough SOL in your wallet." };
    const at = Date.now();
    const next = patchAgent(
      { ...s, wallets: { ...s.wallets, [address]: { ...me, sol: round3(me.sol - amountSol) } } },
      id,
      (p) => ({
        ...p,
        balanceSol: round3(agent.balanceSol + amountSol),
        activity: [{ at, kind: "fund", text: `Holder funded the wallet with ${amountSol} SOL`, deltaSol: amountSol }, ...(p.activity ?? [])],
      }),
    );
    commit(next);
    toast(`Sent ${sol(amountSol)} to ${padId(id)}`);
    return { ok: true, id };
  };

  const historyOf = (id: number) => {
    const extra = state.patches[id]?.history ?? [];
    return [...seededHistory(id, state.anchor), ...extra].sort((a, b) => b.at - a.at);
  };

  const activityOf = (id: number) => {
    const extra = state.patches[id]?.activity ?? [];
    return [...extra, ...seededActivity(id, state.anchor)].sort((a, b) => b.at - a.at);
  };

  const chatOf = (id: number) => state.chats[id] ?? [];

  const appendChat = (s: Persisted, id: number, message: ChatMessage): Persisted => ({
    ...s,
    chats: { ...s.chats, [id]: [...(s.chats[id] ?? []), message] },
  });

  const sendChat = (id: number, text: string) => {
    const at = Date.now();
    commit(appendChat(stateRef.current, id, { id: `h-${at}`, from: "holder", text, at }));
  };

  // Runs the scripted responder against the latest state and applies what it did.
  const agentReply = (id: number, text: string) => {
    let s = stateRef.current;
    const agent = current(id);
    const address = connectedAddress();
    if (!agent || !address || agent.holder !== address) return;
    const spentRecord = s.patches[id]?.spent;
    const spentToday = spentRecord && spentRecord.day === today() ? spentRecord.sol : 0;
    const out = scriptedReply(text, { agent, holder: address, spentToday, turn: (s.chats[id] ?? []).length });
    const at = Date.now();

    if (out.effect?.type === "swap") {
      const effect = out.effect;
      s = patchAgent(s, id, (p) => ({
        ...p,
        balanceSol: round3(Math.max(0, agent.balanceSol + effect.pnlSol)),
        spent: { day: today(), sol: round3(spentToday + effect.spendSol) },
        activity: [{ at, kind: "swap", text: effect.label, deltaSol: effect.pnlSol }, ...(p.activity ?? [])],
      }));
    } else if (out.effect?.type === "withdraw") {
      const amount = out.effect.amountSol;
      const me = s.wallets[address];
      s = patchAgent({ ...s, wallets: { ...s.wallets, [address]: { ...me, sol: round3(me.sol + amount) } } }, id, (p) => ({
        ...p,
        balanceSol: round3(Math.max(0, agent.balanceSol - amount)),
        activity: [{ at, kind: "withdraw", text: `Sent ${amount} SOL back to the holder`, deltaSol: -amount }, ...(p.activity ?? [])],
      }));
    }

    commit(appendChat(s, id, { id: `a-${at}`, from: "agent", text: out.text, at, tools: out.tools }));
  };

  const reset = () => {
    commit(emptyState(Date.now()));
    toast("Simulation reset");
  };

  const value: Store = {
    ready,
    now,
    wallet,
    agents,
    agentById,
    myAgents,
    stats,
    walletModalOpen,
    setWalletModalOpen,
    connect,
    disconnect,
    mint,
    list,
    cancelListing,
    buy,
    fund,
    historyOf,
    activityOf,
    chatOf,
    sendChat,
    agentReply,
    toasts,
    toast,
    reset,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error("useStore must be used inside <StoreProvider>");
  return store;
}
