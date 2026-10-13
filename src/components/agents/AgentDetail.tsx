"use client";

import Link from "next/link";
import { BoardPage } from "@/components/scene/BoardPage";
import { Panel, Tag, TimeAgo } from "@/components/ui/bits";
import { Button, ButtonLink, buttonClass } from "@/components/ui/Button";
import { padId, sol, truncate } from "@/lib/format";
import type { ActivityEvent } from "@/lib/types";
import { useStore } from "@/state/store";
import { HolderName } from "./AgentCard";
import { AgentAvatar } from "./robot";
import { TradeActions } from "./trade";

const ACTIVITY_LABEL: Record<ActivityEvent["kind"], string> = {
  mint: "Mint",
  swap: "Swap",
  fund: "Funded",
  withdraw: "Paid out",
  list: "Listed",
  delist: "Delisted",
  sale: "Sale",
  wipe: "Memory",
  transfer: "Transfer",
};

export function AgentDetail({ id }: { id: number }) {
  const { agentById, wallet, ready, historyOf, activityOf, fund, toast, setWalletModalOpen, stats } = useStore();
  const agent = agentById(id);

  if (!agent) {
    return (
      <BoardPage surface="whiteboard" eyebrow="Agent" title={padId(id)} intro="This number has not been minted yet.">
        <div className="rounded-2xl border border-rule bg-card px-5 py-8">
          <p className="text-[15px] text-ink-2">
            {ready
              ? `Agents are minted in order. The next one out is ${padId(stats.minted + 1)}.`
              : "Checking the registry."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/mint">Mint an agent</ButtonLink>
            <ButtonLink href="/agents" variant="outline">
              Browse agents
            </ButtonLink>
          </div>
        </div>
      </BoardPage>
    );
  }

  const mine = wallet?.address === agent.holder;
  const history = historyOf(id);
  const activity = activityOf(id);

  const sendFunds = (amount: number) => {
    const result = fund(id, amount);
    if (!result.ok) toast(result.reason, "error");
  };

  return (
    <BoardPage
      surface="whiteboard"
      eyebrow="Agent"
      title={padId(agent.id)}
      intro={
        <>
          {agent.name}. <Link href="/agents" className="font-semibold underline decoration-rule underline-offset-4">Back to all agents</Link>
        </>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Panel eyebrow="Persona" title={agent.name} aside={<Tag tone={agent.listing ? "win" : "neutral"}>{agent.listing ? `Listed · ${sol(agent.listing.priceSol)}` : "Held"}</Tag>}>
            <div className="flex flex-col gap-5 @xl:flex-row @xl:items-center">
              <AgentAvatar id={agent.id} size={112} className="!rounded-3xl" />
              <div className="min-w-0">
                <p className="text-[15.5px] leading-relaxed text-ink-2">{agent.persona}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
                  Minted <TimeAgo at={agent.mintedAt} />. Its avatar and temperament are fixed by its number; what it remembers belongs to whoever holds it.
                </p>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Agent wallet" title="Activity" bodyClassName="px-5 pb-3 pt-1">
            {activity.length === 0 ? (
              <p className="py-4 text-[14px] text-ink-3">Nothing yet.</p>
            ) : (
              <ul className="divide-y divide-rule-soft">
                {activity.slice(0, 14).map((event, i) => (
                  <li key={`${event.at}-${i}`} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="w-[68px] shrink-0 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{ACTIVITY_LABEL[event.kind]}</span>
                      <span className="truncate text-ink-2">{event.text}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      {event.deltaSol !== undefined && event.deltaSol !== 0 && (
                        <span className={`tabular text-[13px] font-semibold ${event.deltaSol > 0 ? "text-win-deep" : "text-loss"}`}>
                          {event.deltaSol > 0 ? "+" : "-"}
                          {sol(Math.abs(event.deltaSol), 3)}
                        </span>
                      )}
                      <TimeAgo at={event.at} className="w-[58px] text-right text-[12px] text-ink-3" />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel eyebrow="On transfer, memory resets" title="Ownership history" bodyClassName="px-5 pb-3 pt-1">
            <ol className="divide-y divide-rule-soft">
              {history.map((event, i) => (
                <li key={`${event.at}-${i}`} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${i === 0 ? "bg-win" : "border border-ink-4"}`} />
                    <HolderName address={event.holder} className="font-semibold text-ink-2" />
                    <span className="truncate text-ink-3">
                      {event.via === "mint" ? "minted it" : event.via === "sale" ? `bought it for ${sol(event.priceSol ?? 0)}` : "received it by transfer"}
                    </span>
                  </span>
                  <TimeAgo at={event.at} className="shrink-0 text-[12px] text-ink-3" />
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-6 @4xl:sticky @4xl:top-6">
          <Panel eyebrow="Its own wallet" title={sol(agent.balanceSol, 3)}>
            <dl className="space-y-2 text-[13.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-3">Wallet address</dt>
                <dd className="tabular font-semibold">{truncate(agent.wallet, 5, 5)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-3">Holder</dt>
                <dd className="font-semibold">
                  <HolderName address={agent.holder} />
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-3">Status</dt>
                <dd className="font-semibold">{agent.listing ? `For sale at ${sol(agent.listing.priceSol)}` : "Not for sale"}</dd>
              </div>
            </dl>

            <div className="mt-4 grid gap-2">
              {mine ? (
                <Link href={`/console#${agent.id}`} className={buttonClass({ size: "lg", className: "w-full" })}>
                  Chat
                </Link>
              ) : (
                <Button size="lg" className="w-full" disabled title="Only the holder can talk to this agent">
                  Chat · private to holder
                </Button>
              )}
              <TradeActions agent={agent} size="lg" className="w-full" />
              {!wallet && ready && (
                <Button variant="outline" size="lg" className="w-full" onClick={() => setWalletModalOpen(true)}>
                  Connect wallet
                </Button>
              )}
            </div>

            {mine && (
              <div className="mt-4 border-t border-rule pt-3">
                <p className="mb-1.5 text-[13.5px] font-semibold">Fund this agent</p>
                <div className="flex flex-wrap gap-2">
                  {[0.1, 0.5, 1].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => sendFunds(amount)}
                      className="tabular h-8 rounded-full border border-rule bg-card px-3.5 text-[13px] font-medium transition-colors hover:bg-paper-2"
                    >
                      {amount} SOL
                    </button>
                  ))}
                </div>
                <p className="tabular mt-2 text-[12.5px] text-ink-3">Your wallet: {sol(wallet.sol)}</p>
              </div>
            )}
            <p className="mt-3 text-[12.5px] leading-relaxed text-ink-3">
              {mine
                ? "You hold this agent. Sell or transfer it and the next holder starts with a blank memory."
                : "Conversations are private to the holder and are never shown here."}
            </p>
          </Panel>
        </div>
      </div>
    </BoardPage>
  );
}
