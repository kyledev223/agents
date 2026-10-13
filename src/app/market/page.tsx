"use client";

import Link from "next/link";
import { useMemo } from "react";
import { HolderName, ListingStatus, agentHref } from "@/components/agents/AgentCard";
import { AgentAvatar } from "@/components/agents/robot";
import { TradeActions } from "@/components/agents/trade";
import { BoardPage } from "@/components/scene/BoardPage";
import { DemoBadge, Stat, TimeAgo } from "@/components/ui/bits";
import { ButtonLink } from "@/components/ui/Button";
import { MARKET_FEE } from "@/config/site";
import { padId, sol } from "@/lib/format";
import type { Agent } from "@/lib/types";
import { useStore } from "@/state/store";

const th = "px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3";

function AgentCell({ agent }: { agent: Agent }) {
  return (
    <Link href={agentHref(agent.id)} className="flex min-w-0 items-center gap-3 hover:underline">
      <AgentAvatar id={agent.id} size={36} />
      <span className="min-w-0">
        <span className="tabular block truncate text-[15px] font-semibold">{padId(agent.id)}</span>
        <span className="block truncate text-[13px] text-ink-3">{agent.name}</span>
      </span>
    </Link>
  );
}

function SectionTitle({ id, title, note }: { id: string; title: string; note?: string }) {
  return (
    <div className="mb-3 mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
      <h2 id={id} className="font-display text-[28px] font-extrabold leading-tight @xl:text-[32px]">
        {title}
      </h2>
      {note && <p className="text-[13px] text-ink-3">{note}</p>}
    </div>
  );
}

export default function MarketPage() {
  const { agents, stats, myAgents, wallet } = useStore();
  const listings = useMemo(() => agents.filter((a) => a.listing).sort((a, b) => (b.listing?.at ?? 0) - (a.listing?.at ?? 0)), [agents]);
  const ranked = useMemo(() => [...agents].sort((a, b) => b.balanceSol - a.balanceSol || a.id - b.id).slice(0, 100), [agents]);

  return (
    <BoardPage
      surface="whiteboard"
      eyebrow="Marketplace"
      title="Market"
      intro="Agents change hands here. The wallet travels with the NFT; the memory is wiped on the way."
      aside={<DemoBadge />}
    >
      <div className="grid gap-3 @2xl:grid-cols-3">
        <Stat label="Agents minted" value={stats.minted.toLocaleString("en-US")} hint={`${stats.remaining.toLocaleString("en-US")} left of 2,000`} />
        <Stat label="Combined agent holdings" value={sol(stats.holdingsSol, 0)} hint="Across every agent wallet" />
        <Stat
          label="Top agent wallet"
          value={stats.top ? sol(stats.top.balanceSol) : "-"}
          hint={stats.top ? `${padId(stats.top.id)} · ${stats.top.name}` : undefined}
        />
      </div>

      {wallet && myAgents.length > 0 && (
        <section aria-labelledby="m-yours">
          <SectionTitle id="m-yours" title="Your agents" note="List one, or cancel a listing." />
          <ul className="divide-y divide-rule-soft rounded-2xl border border-rule bg-card">
            {myAgents.map((agent) => (
              <li key={agent.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <AgentCell agent={agent} />
                </div>
                <span className="tabular text-[14px] font-semibold">{sol(agent.balanceSol)}</span>
                <ListingStatus agent={agent} />
                <TradeActions agent={agent} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="m-sale">
        <SectionTitle
          id="m-sale"
          title="For sale"
          note={`${listings.length} listed. The ${Math.round(MARKET_FEE * 100)}% fee comes out of the seller's side; you pay the price shown.`}
        />
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-rule bg-card px-5 py-8 text-[15px] text-ink-3">Nothing is listed right now.</div>
        ) : (
          <ul className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
            {listings.map((agent) => (
              <li key={agent.id} className="flex flex-col rounded-2xl border border-rule bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <AgentCell agent={agent} />
                  {agent.listing && <TimeAgo at={agent.listing.at} className="shrink-0 pt-0.5 text-[12px] text-ink-3" />}
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-2">
                  <div className="min-w-0">
                    <dt className="text-[11.5px] text-ink-3">Price</dt>
                    <dd className="tabular truncate text-[15px] font-semibold">{agent.listing ? sol(agent.listing.priceSol) : "-"}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11.5px] text-ink-3">Wallet</dt>
                    <dd className="tabular truncate text-[15px] font-semibold">{sol(agent.balanceSol)}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11.5px] text-ink-3">Seller</dt>
                    <dd className="truncate text-[15px] font-semibold">
                      <HolderName address={agent.holder} />
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between gap-3 border-t border-rule-soft pt-3">
                    <span className="tabular text-[12.5px] text-ink-3">
                      Seller nets {agent.listing ? sol(agent.listing.priceSol * (1 - MARKET_FEE)) : "-"}
                    </span>
                    <TradeActions agent={agent} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="m-all">
        <SectionTitle id="m-all" title="All agents" note="Top 100 by wallet balance." />
        <div className="hidden overflow-x-auto rounded-2xl border border-rule bg-card @2xl:block">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="border-b border-rule">
              <tr>
                <th className={`${th} w-14 text-right`}>#</th>
                <th className={th}>Agent</th>
                <th className={`${th} text-right`}>Wallet</th>
                <th className={`${th} text-right`}>Holder</th>
                <th className={`${th} text-right`}>Status</th>
                <th className={`${th} text-right`}>Minted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rule-soft">
              {ranked.map((agent, i) => (
                <tr key={agent.id} className="transition-colors hover:bg-paper">
                  <td className="tabular px-4 py-3 text-right text-[14px] font-semibold text-ink-3">{i + 1}</td>
                  <td className="max-w-0 px-4 py-2.5">
                    <AgentCell agent={agent} />
                  </td>
                  <td className="tabular px-4 py-3 text-right text-[15px] font-semibold">{sol(agent.balanceSol)}</td>
                  <td className="px-4 py-3 text-right text-[14px]">
                    <HolderName address={agent.holder} />
                  </td>
                  <td className="px-4 py-3 text-right text-[14px]">
                    {agent.listing ? <span className="tabular font-semibold text-win-deep">{sol(agent.listing.priceSol)}</span> : <span className="text-ink-4">Held</span>}
                  </td>
                  <td className="px-4 py-3 text-right text-[14px]">
                    <TimeAgo at={agent.mintedAt} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ol className="space-y-2 @2xl:hidden">
          {ranked.map((agent, i) => (
            <li key={agent.id}>
              <Link href={agentHref(agent.id)} className="block rounded-2xl border border-rule bg-card px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-display tabular w-7 shrink-0 text-[18px] font-extrabold text-ink-4">{i + 1}</span>
                  <AgentAvatar id={agent.id} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="tabular block truncate text-[15px] font-semibold">{padId(agent.id)}</span>
                    <span className="block truncate text-[13px] text-ink-3">{agent.name}</span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="tabular block text-[15px] font-semibold">{sol(agent.balanceSol)}</span>
                    <span className={`block text-[13px] ${agent.listing ? "tabular font-semibold text-win-deep" : "text-ink-4"}`}>
                      {agent.listing ? sol(agent.listing.priceSol) : "Held"}
                    </span>
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-rule-soft pt-3">
                  <div className="min-w-0">
                    <dt className="text-[11.5px] text-ink-3">Holder</dt>
                    <dd className="truncate text-[14px] font-medium">
                      <HolderName address={agent.holder} />
                    </dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11.5px] text-ink-3">Minted</dt>
                    <dd className="truncate text-[14px] font-medium">
                      <TimeAgo at={agent.mintedAt} />
                    </dd>
                  </div>
                </dl>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {!wallet && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rule bg-card/90 px-5 py-4">
          <p className="text-[14.5px] text-ink-2">Connect a pretend wallet to buy, or mint one to have something to sell.</p>
          <ButtonLink href="/mint" size="sm">
            Mint an agent
          </ButtonLink>
        </div>
      )}
    </BoardPage>
  );
}
