"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { agentHref } from "@/components/agents/AgentCard";
import { AgentAvatar, RoleBust } from "@/components/agents/robot";
import { Footer } from "@/components/chrome/chrome";
import { MINT_COST, TICKER } from "@/config/site";
import { Plant, Vine } from "@/components/scene/parts";
import { padId, sol, whole } from "@/lib/format";
import { ROLES } from "@/lib/roles";
import { Ticker, useRecentTop } from "./Hero";

// Section title, handwritten on the board like the sub-page titles.
function SectionHead({ id, title, href, link }: { id: string; title: string; href?: string; link?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4 md:mb-5">
      <h2 id={id} className="font-marker text-[26px] uppercase leading-none text-marker md:text-[34px]">
        {title}
      </h2>
      {href && (
        <Link href={href} className="shrink-0 text-[14px] font-semibold text-ink underline decoration-ink-4 underline-offset-4">
          {link}
        </Link>
      )}
    </div>
  );
}

// A whiteboard hung on the wall: same frame, clamps and pen tray as the sub-page rooms.
function Board({ labelledBy, children }: { labelledBy: string; children: ReactNode }) {
  return (
    <section aria-labelledby={labelledBy} className="relative rounded-[10px] bg-[#d5d8dc] p-[6px] shadow-[0_18px_44px_rgba(107,63,34,0.3)] md:p-2">
      {["-left-1 -top-1", "-right-1 -top-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map((pos) => (
        <span key={pos} aria-hidden="true" className={`absolute ${pos} h-4 w-4 rounded-[5px] bg-[#3d4046] md:h-5 md:w-5`} />
      ))}
      <div className="rounded-[4px] px-4 pb-6 pt-5 md:px-8 md:pb-8 md:pt-7" style={{ background: "linear-gradient(135deg, #fffdfb 0%, #fbf5f3 60%, #f1e6ec 100%)" }}>
        {children}
      </div>
      <div aria-hidden="true" className="absolute -bottom-[9px] right-[8%] flex h-[9px] w-[210px] max-w-[45%] items-start gap-2 rounded-b-[3px] bg-[#b4b8be] px-3">
        <span className="-mt-[6px] h-[7px] w-9 rounded-full bg-[#1b1c1f]" />
        <span className="-mt-[6px] h-[7px] w-9 rounded-full bg-[#2f6fd6]" />
        <span className="-mt-[6px] h-[7px] w-9 rounded-full bg-[#d94b43]" />
      </div>
    </section>
  );
}

// The hero's wall screen again, wide: recently minted agents.
function LiveScreen() {
  const recent = useRecentTop();
  return (
    <section
      aria-labelledby="h-live"
      className="relative overflow-hidden rounded-[10px] px-4 pb-5 pt-4 text-white md:px-7 md:pb-7 md:pt-6"
      style={{
        background: "radial-gradient(130% 80% at 20% 0%, #12303a 0%, #0a161d 45%, #060a0e 100%)",
        boxShadow: "inset 0 0 0 5px #05070a, inset 0 0 30px rgba(0,0,0,0.65), 0 0 40px rgba(94,234,212,0.16), 0 18px 44px rgba(60,30,8,0.35)",
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 3px)" }} />
      <div className="relative flex items-center justify-between gap-4">
        <h2 id="h-live" className="font-condensed text-[24px] font-bold uppercase leading-none tracking-[0.06em] md:text-[30px]">
          Recently minted agents
        </h2>
        <span className="font-digital flex shrink-0 items-center gap-1.5 text-[12px] uppercase tracking-[0.08em] text-glow-green">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-glow-green shadow-[0_0_6px_#4ade80]" aria-hidden="true" />
          Live
        </span>
      </div>
      <div className="relative mt-2 flex items-baseline justify-between gap-4">
        <p className="font-digital text-[12px] uppercase tracking-[0.08em] text-white/45">Top 4 by wallet balance</p>
        <Link href="/agents" className="font-digital text-[12px] uppercase tracking-[0.08em] text-white underline-offset-4 hover:underline">
          All agents
        </Link>
      </div>
      <div aria-hidden="true" className="relative mt-3 h-px" style={{ background: "linear-gradient(90deg, #5eead4, rgba(94,234,212,0.15))", boxShadow: "0 0 5px #5eead4" }} />
      <ul className="relative mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {recent.map((agent) => (
          <li key={agent.id}>
            <Link href={agentHref(agent.id)} className="flex items-center gap-3 rounded-md border border-white/[0.07] bg-white/[0.03] px-3 py-3 outline-none transition-colors hover:bg-white/[0.08] focus-visible:bg-white/[0.1]">
              <span className="shrink-0 overflow-hidden rounded-full shadow-[0_0_0_1px_rgba(94,234,212,0.45),0_0_8px_rgba(94,234,212,0.25)]">
                <AgentAvatar id={agent.id} size={44} className="!border-0" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-condensed tabular block truncate text-[19px] font-bold uppercase leading-none">{padId(agent.id)}</span>
                <span className="mt-1 block truncate text-[12.5px] text-white/60">{agent.name}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="font-digital tabular block text-[15px] leading-none text-white/90">{sol(agent.balanceSol, 1)}</span>
                <span className={`font-digital mt-1 block text-[11px] uppercase ${agent.listing ? "text-glow-green" : "text-white/45"}`}>{agent.listing ? "Listed" : "Held"}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="relative mt-4 hidden overflow-hidden border-t border-white/10 pt-2 md:block">
        <Ticker className="text-[12px] tracking-[0.06em] text-white/55" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(116deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 30%, transparent 31%)" }} />
    </section>
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

// Everything under the hero: the floor below the office. Same wall, wood and
// plants as the scene above, with each section on a screen or a whiteboard.
export function HomeSections() {
  return (
    <>
      <div className="overflow-hidden border-y border-board-rule bg-board py-2 md:hidden">
        <Ticker className="text-[12px] tracking-[0.06em] text-white/70" />
      </div>
      <div
        className="relative overflow-hidden"
        style={{ background: "radial-gradient(70% 34% at 18% 4%, rgba(255,236,200,0.75), rgba(255,236,200,0) 100%), linear-gradient(160deg, #f6dab6 0%, #e6bb8f 55%, #d9a87c 100%)" }}
      >
        {/* floor slab between the two storeys */}
        <div aria-hidden="true" className="relative z-10 hidden h-5 bg-[#4a3226] shadow-[0_10px_24px_rgba(60,30,8,0.35)] md:block">
          <div className="h-1 bg-[#7a5038]" />
        </div>
        <svg aria-hidden="true" viewBox="0 0 150 300" className="pointer-events-none absolute left-0 top-4 hidden h-[300px] w-[150px] xl:block">
          <Vine x={34} y={0} length={250} seed="hm-v1" sway={18} />
          <Vine x={72} y={0} length={160} seed="hm-v2" />
          <Vine x={106} y={0} length={210} seed="hm-v3" sway={12} />
        </svg>
        <svg aria-hidden="true" viewBox="0 0 150 300" className="pointer-events-none absolute right-0 top-4 hidden h-[300px] w-[150px] xl:block">
          <Vine x={44} y={0} length={190} seed="hm-v4" sway={14} />
          <Vine x={84} y={0} length={260} seed="hm-v5" sway={18} />
          <Vine x={118} y={0} length={140} seed="hm-v6" />
        </svg>

        <div className="relative mx-auto max-w-[1180px] space-y-9 px-4 pb-10 pt-8 md:space-y-14 md:px-10 md:pt-14">
          <LiveScreen />

          <Board labelledBy="h-team">
            <SectionHead id="h-team" title="Meet the agents" href="/roles" link="Meet them" />
            <TeamCards />
          </Board>

          <Board labelledBy="h-how">
            <SectionHead id="h-how" title="How it works" href="/docs" link="Read the docs" />
            <HowItWorks />
          </Board>

          <Board labelledBy="h-life">
            <SectionHead id="h-life" title="An agent's life" />
            <Lifecycle />
          </Board>

          <div
            className="rounded-[18px] border border-white/70 px-5 pb-5 shadow-[0_10px_30px_rgba(60,30,8,0.22)]"
            style={{ background: "rgba(255, 250, 243, 0.84)", backdropFilter: "blur(12px) saturate(1.15)" }}
          >
            <Footer className="!mt-0 !border-t-0 !pt-5" />
          </div>
        </div>

        {/* floor */}
        <div aria-hidden="true" className="relative h-[90px] md:h-[130px]" style={{ background: "linear-gradient(180deg, #e7b98c 0%, #b98558 100%)" }}>
          <div className="h-3 bg-[#c79a72]" />
          <svg viewBox="-110 -170 220 180" className="absolute bottom-6 left-[3%] h-[150px] w-[183px] md:h-[210px] md:w-[257px]">
            <Plant x={0} y={0} scale={1.25} seed="hm-p1" leaves={11} spread={165} tall />
          </svg>
          <svg viewBox="-110 -170 220 180" className="absolute bottom-4 right-[4%] hidden h-[190px] w-[232px] sm:block">
            <Plant x={0} y={0} scale={1.15} seed="hm-p2" leaves={10} spread={160} tall pot="#c98a55" potShade="#a9683b" />
          </svg>
        </div>
      </div>
    </>
  );
}
