export type RoleKey = "trader" | "treasurer" | "scout" | "archivist" | "concierge" | "auditor";

export interface Listing {
  priceSol: number;
  at: number;
}

export interface OwnershipEvent {
  holder: string;
  at: number;
  via: "mint" | "transfer" | "sale";
  priceSol?: number;
}

export interface ActivityEvent {
  at: number;
  kind: "mint" | "swap" | "fund" | "withdraw" | "list" | "delist" | "sale" | "wipe" | "transfer";
  text: string;
  deltaSol?: number;
}

export interface Agent {
  id: number;
  name: string;
  persona: string;
  wallet: string;
  balanceSol: number;
  holder: string;
  mintedAt: number;
  listing: Listing | null;
}

export interface ToolCall {
  kind: "wallet" | "swap" | "transfer" | "policy" | "feed" | "memory";
  title: string;
  status: "ok" | "blocked";
  rows: [string, string][];
}

export interface ChatMessage {
  id: string;
  from: "holder" | "agent";
  text: string;
  at: number;
  tools?: ToolCall[];
}

export interface FakeWallet {
  key: string;
  name: string;
  blurb: string;
  address: string;
  token: number;
  sol: number;
}
