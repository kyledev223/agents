"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AgentCard, AgentRow } from "@/components/agents/AgentCard";
import { RoleBust } from "@/components/agents/robot";
import { Footer } from "@/components/chrome/chrome";
import { MINT_COST, TICKER } from "@/config/site";
import { whole } from "@/lib/format";
import { ROLES } from "@/lib/roles";
import { Ticker, useRecentTop } from "./Hero";

function SectionHead({ id, title, href, link }: { id: string; title: string; href?: string; link?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between md:mb-5">
      <h2 id={id} className="font-display text-[24px] font-extrabold md:text-[32px]">
        {title}
      </h2>
      {href && (
        <Link href={href} className="text-[14px] font-semibold text-ink underline decoration-rule underline-offset-4">
          {link}
        </Link>
      )}
    </div>
  );
}

export function TeamCards() {
  return (
    <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
      {ROLES.map((role) => (
        <li key={role.key}>
          <Link href={`/roles#${role.key}`} className="flex h-full items-start gap-2.5 rounded-2xl border border-rule bg-card px-3 py-3 transition-colors hover:border-ink-4">
            <RoleBust role={role.key} className="h-12 w-12 shrink-0" />
            <span className="min-w-0">
              <span className="block text-[14.5px] font-semibold leading-tight text-ink">
                {role.role} <span className="font-normal text-ink-3">· {role.does}</span>
              </span>
              <span className="mt-0.5 block break-words text-[12.5px] leading-snug text-ink-3 [overflow-wrap:anywhere]">{role.card}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const STEPS: { title: string; body: ReactNode }[] = [
  {
    title: "Mint",
    body: (
      <>
        Burn {whole(MINT_COST)} {TICKER} and get a numbered agent, #0001 to #2000, with its own wallet.
      </>
    ),
  },
  { title: "Sign in", body: "Open the Console with the wallet that holds the NFT. The agent answers to its holder and no one else." },
  { title: "Hand it on", body: "Transfer or sell it whenever you like. The wallet goes with it; the memory does not." },
];

export function HowItWorks() {
  return (
    <ol className="grid gap-2.5 md:grid-cols-3">
      {STEPS.map((step, i) => (
        <li key={step.title} className="flex gap-3.5 rounded-2xl border border-rule bg-card px-4 py-3.5">
          <span className="font-display tabular text-[18px] font-extrabold text-ink-4">{i + 1}</span>
          <span>
            <span className="block text-[15px] font-semibold text-ink">{step.title}</span>
            <span className="mt-0.5 block text-[13.5px] leading-relaxed text-ink-2">{step.body}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

const STAGES = [
  { title: "Burn", body: `${whole(MINT_COST)} ${TICKER} leaves your wallet for good.`, color: "#e5484d" },
  { title: "Mint", body: "A numbered NFT appears, one of 2,000.", color: "#e7a33e" },
  { title: "Fund", body: "Send SOL to the agent's own wallet.", color: "#3f9cf2" },
  { title: "Use", body: "Chat, trade inside the caps, pull funds back.", color: "#22c55e" },
  { title: "Transfer / sell", body: "New holder, same wallet, blank memory.", color: "#8d6df0" },
];

// Five-stage stepper in the style of the reference docs flow diagram.
export function Lifecycle() {
  return (
    <div className="@container rounded-2xl border border-rule bg-card/90 px-4 py-5 @xl:px-6">
      <ol className="grid gap-2.5 @3xl:grid-cols-5 @3xl:gap-0">
        {STAGES.map((stage, i) => (
          <li key={stage.title} className="relative flex gap-3 @3xl:block @3xl:pr-3">
            <span className="flex flex-col items-center @3xl:flex-row">
              <span
                className="font-display tabular grid size-9 shrink-0 place-items-center rounded-full border-2 bg-white text-[15px] font-extrabold"
                style={{ borderColor: stage.color, color: stage.color }}
              >
                {i + 1}
              </span>
              {i < STAGES.length - 1 && <span className="mt-1 w-0.5 flex-1 bg-marker/15 @3xl:ml-1 @3xl:mt-0 @3xl:h-0.5 @3xl:w-auto" />}
            </span>
            <span className="pb-2 @3xl:mt-2 @3xl:block">
              <span className="block text-[15px] font-semibold text-ink">{stage.title}</span>
              <span className="mt-0.5 block text-[13.5px] leading-relaxed text-ink-2">{stage.body}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// Everything under the hero.
export function HomeSections() {
  const recent = useRecentTop();
  return (
    <>
      <div className="overflow-hidden border-y border-board-rule bg-board py-2 md:hidden">
        <Ticker className="text-[12px] tracking-[0.06em] text-white/70" />
      </div>
      <div className="mx-auto max-w-[1180px] px-4 md:px-10 md:pt-8">
        <section aria-labelledby="h-live" className="pt-6 md:pt-10">
          <SectionHead id="h-live" title="Recently minted agents" href="/agents" link="All agents" />
          <p className="-mt-2 mb-3 text-[13px] text-ink-3 md:-mt-3 md:mb-5">Top 4 by wallet balance</p>
          <ul className="divide-y divide-rule-soft rounded-2xl border border-rule bg-card sm:hidden">
            {recent.map((agent) => (
              <li key={agent.id}>
                <AgentRow agent={agent} />
              </li>
            ))}
          </ul>
          <ul className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((agent) => (
              <li key={agent.id}>
                <AgentCard agent={agent} />
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="h-team" className="pt-8 md:pt-14">
          <SectionHead id="h-team" title="Meet the agents" href="/roles" link="Meet them" />
          <TeamCards />
        </section>

        <section aria-labelledby="h-how" className="pt-8 md:pt-14">
          <SectionHead id="h-how" title="How it works" href="/docs" link="Read the docs" />
          <HowItWorks />
        </section>

        <section aria-labelledby="h-life" className="pt-8 md:pt-14">
          <SectionHead id="h-life" title="An agent's life" />
          <Lifecycle />
        </section>

        <Footer className="mb-10" />
      </div>
    </>
  );
}
