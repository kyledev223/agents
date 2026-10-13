"use client";

import Link from "next/link";
import { TimeAgo } from "@/components/ui/bits";
import { padId, sol, truncate } from "@/lib/format";
import type { Agent } from "@/lib/types";
import { useStore } from "@/state/store";
import { AgentAvatar } from "./robot";

export const agentHref = (id: number) => `/agents/${id}`;

export function HolderName({ address, className = "" }: { address: string; className?: string }) {
  const { wallet } = useStore();
  const mine = wallet?.address === address;
  return <span className={`tabular ${className}`}>{mine ? "You" : truncate(address)}</span>;
}

export function ListingStatus({ agent, className = "" }: { agent: Agent; className?: string }) {
  return agent.listing ? (
    <span className={`inline-flex items-center gap-2 text-[12.5px] font-medium text-ink ${className}`}>
      <span className="h-2 w-2 shrink-0 rounded-full bg-win" />
      Listed · <span className="tabular">{sol(agent.listing.priceSol)}</span>
    </span>
  ) : (
    <span className={`inline-flex items-center gap-2 text-[12.5px] font-medium text-ink-3 ${className}`}>
      <span className="h-2 w-2 shrink-0 rounded-full border border-ink-4" />
      Held
    </span>
  );
}

// Grid card, same anatomy as the reference coin card.
export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={agentHref(agent.id)}
      className="flex h-full flex-col rounded-2xl border border-rule bg-card p-4 outline-none transition-colors hover:border-ink-4 focus-visible:border-ink"
    >
      <div className="flex items-start gap-3">
        <AgentAvatar id={agent.id} size={48} />
        <div className="min-w-0 flex-1">
          <p className="font-display tabular truncate text-[19px] font-extrabold leading-tight">{padId(agent.id)}</p>
          <p className="truncate text-[13.5px] text-ink-3">{agent.name}</p>
        </div>
        <TimeAgo at={agent.mintedAt} className="shrink-0 pt-0.5 text-[12px] text-ink-3" />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <dt className="text-[11.5px] text-ink-3">Wallet</dt>
          <dd className="tabular truncate text-[15px] font-semibold">{sol(agent.balanceSol)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11.5px] text-ink-3">Holder</dt>
          <dd className="truncate text-[15px] font-semibold">
            <HolderName address={agent.holder} />
          </dd>
        </div>
      </dl>
      <div className="mt-auto pt-4">
        <div className="border-t border-rule-soft pt-3">
          <ListingStatus agent={agent} />
        </div>
      </div>
    </Link>
  );
}

// Compact row, same anatomy as the reference "Live coins" list on mobile.
export function AgentRow({ agent }: { agent: Agent }) {
  return (
    <Link href={agentHref(agent.id)} className="flex items-center gap-3 px-4 py-3">
      <AgentAvatar id={agent.id} size={40} />
      <span className="min-w-0 flex-1">
        <span className="tabular block truncate text-[15px] font-semibold text-ink">{padId(agent.id)}</span>
        <span className="block truncate text-[13px] text-ink-3">{agent.name}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="tabular block text-[14.5px] font-semibold text-ink">{sol(agent.balanceSol)}</span>
        <span className={`text-[12.5px] ${agent.listing ? "font-semibold text-win-deep" : "text-ink-4"}`}>{agent.listing ? "Listed" : "Held"}</span>
      </span>
    </Link>
  );
}
