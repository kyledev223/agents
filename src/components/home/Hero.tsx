"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import type { CSSProperties, MouseEvent } from "react";
import { agentHref } from "@/components/agents/AgentCard";
import { AgentAvatar } from "@/components/agents/robot";
import { SocialButtons } from "@/components/chrome/chrome";
import { SideNav } from "@/components/chrome/nav";
import { TimeAgo } from "@/components/ui/bits";
import { ArrowRight } from "@/components/ui/icons";
import { HOTSPOTS, OFFICE, OfficeBack, OfficeFront, OfficeMid, SCREEN } from "@/components/scene/office";
import { TICKER } from "@/config/site";
import { compact, padId, sol } from "@/lib/format";
import { roleByKey } from "@/lib/roles";
import type { Agent } from "@/lib/types";
import { useStore, type Stats } from "@/state/store";

const u = (n: number) => `calc(${n} * var(--u))`;

export const HEADLINE = ["Burn a little.", "Mint an agent.", "Hand it on."];
export const SUBLINE = [
  "A numbered AI agent with its own wallet, held as an NFT.",
  "Use it, fund it, sell it. Its memory resets for every new holder.",
];

// Top four by wallet balance among the latest mints.
export function useRecentTop(): Agent[] {
  const { agents } = useStore();
  return [...agents]
    .sort((a, b) => b.mintedAt - a.mintedAt || b.id - a.id)
    .slice(0, 40)
    .sort((a, b) => b.balanceSol - a.balanceSol)
    .slice(0, 4);
}

export function tickerItems(stats: Stats): string[] {
  return [
    `Agents minted ${stats.minted}`,
    `${TICKER} burned ${compact(stats.burned)}`,
    `Listings ${stats.listings}`,
    `Supply left ${stats.remaining.toLocaleString("en-US")}`,
    `Agent holdings ${compact(stats.holdingsSol)} SOL`,
    stats.top ? `Top wallet ${padId(stats.top.id)} ${sol(stats.top.balanceSol)}` : "",
  ].filter(Boolean);
}

export function Ticker({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const { stats } = useStore();
  const items = tickerItems(stats);
  const run = `${items.join("   ·   ")}   ·   `;
  return (
    <>
      <div className={`animate-screen-ticker font-digital flex w-max whitespace-pre uppercase ${className}`} style={style} aria-hidden="true">
        <span>{run}</span>
        <span>{run}</span>
      </div>
      <span className="sr-only">{items.join(", ")}</span>
    </>
  );
}

function Sparkline({ id }: { id: number }) {
  const pts = Array.from({ length: 7 }, (_, i) => `${i * 5} ${7 - (((id * (i + 3) * 7919) % 11) / 11) * 6 - i * 0.5}`);
  return (
    <svg viewBox="0 -1 30 10" style={{ width: u(26), height: u(9) }} aria-hidden="true">
      <path d={`M${pts.join("L")}`} fill="none" stroke="#4ade80" strokeWidth="1.400" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// The wall screen: the reference's "Live coins" panel, showing recent agents.
function WallScreen() {
  const recent = useRecentTop();
  return (
    <section
      aria-label="Recently minted agents"
      className="pointer-events-auto absolute z-[5] overflow-hidden text-white"
      style={{
        left: u(SCREEN.x),
        top: u(SCREEN.y),
        width: u(SCREEN.w),
        height: u(SCREEN.h),
        borderRadius: u(3),
        background: "radial-gradient(130% 60% at 25% 0%, #12303a 0%, #0a161d 45%, #060a0e 100%)",
        boxShadow: `inset 0 0 0 ${u(2.5)} #05070a, inset 0 0 ${u(16)} rgba(0, 0, 0, 0.65), 0 0 ${u(24)} rgba(94, 234, 212, 0.14)`,
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 3px)" }} />
      <div className="absolute flex items-center justify-between" style={{ left: u(11), right: u(10), top: u(11) }}>
        <h2 className="font-condensed truncate font-bold uppercase leading-none" style={{ fontSize: u(15.5), letterSpacing: "0.06em" }}>
          Just minted
        </h2>
        <span className="font-digital flex shrink-0 items-center uppercase leading-none" style={{ gap: u(3.5), fontSize: u(8.5), color: "#4ade80", letterSpacing: "0.08em" }}>
          <span className="inline-block animate-pulse rounded-full" style={{ width: u(5), height: u(5), background: "#4ade80", boxShadow: `0 0 ${u(5)} #4ade80` }} aria-hidden="true" />
          Live
        </span>
      </div>
      <p className="font-digital absolute truncate uppercase text-white/45" style={{ left: u(11), right: u(10), top: u(31), fontSize: u(8), letterSpacing: "0.08em" }}>
        Top 4 by wallet balance
      </p>
      <div aria-hidden="true" className="absolute" style={{ left: u(10), right: u(10), top: u(45), height: 1, background: "linear-gradient(90deg, #5eead4, rgba(94,234,212,0.15))", boxShadow: `0 0 ${u(4)} #5eead4` }} />
      {recent.map((agent, i) => (
        <Link
          key={agent.id}
          href={agentHref(agent.id)}
          className="absolute flex items-center outline-none transition-colors hover:bg-white/[0.06] focus-visible:bg-white/[0.09]"
          style={{ left: u(6), right: u(6), top: u(50 + i * 46), height: u(44), paddingLeft: u(5), paddingRight: u(4), borderRadius: u(3) }}
        >
          <span className="shrink-0 overflow-hidden rounded-full" style={{ width: u(26), height: u(26), boxShadow: `0 0 0 1px rgba(94,234,212,0.45), 0 0 ${u(6)} rgba(94,234,212,0.25)` }}>
            <AgentAvatar id={agent.id} className="!h-full !w-full !border-0" />
          </span>
          <span className="min-w-0 flex-1" style={{ marginLeft: u(7) }}>
            <span className="font-condensed block truncate font-bold uppercase leading-none" style={{ fontSize: u(12.5) }}>
              {padId(agent.id)}
            </span>
            <span className="font-digital tabular block leading-none text-white/85" style={{ marginTop: u(3), fontSize: u(11) }}>
              {sol(agent.balanceSol, 1)}
            </span>
          </span>
          <span className="flex shrink-0 flex-col items-end" style={{ gap: u(2) }}>
            <Sparkline id={agent.id} />
            <span className="font-digital leading-none" style={{ fontSize: u(8.5), color: agent.listing ? "#4ade80" : "rgba(255,255,255,0.45)" }}>
              {agent.listing ? "LISTED" : "HELD"}
            </span>
          </span>
          {i < recent.length - 1 && <span aria-hidden="true" className="absolute bg-white/[0.07]" style={{ left: u(5), right: u(4), bottom: u(-1), height: 1 }} />}
        </Link>
      ))}
      <div className="absolute overflow-hidden" style={{ left: u(8), right: u(8), top: u(240), height: u(14), borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <Ticker className="text-white/55" style={{ fontSize: u(8.5), lineHeight: u(14), letterSpacing: "0.06em" }} />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(116deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.02) 30%, transparent 31%)" }} />
    </section>
  );
}

function Hotspots() {
  return (
    <>
      {HOTSPOTS.map((spot) => {
        const role = roleByKey(spot.role);
        return (
          <Link
            key={spot.role}
            href={`/roles#${spot.role}`}
            aria-label={`${role.name}, ${role.role}: ${role.summary} Open to meet the agents.`}
            className="group pointer-events-auto absolute z-20 cursor-pointer outline-none"
            style={{ left: u(spot.x), top: u(spot.y), width: u(spot.w), height: u(spot.h), borderRadius: u(14) }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{
                borderRadius: u(14),
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.9), 0 0 0 1px rgba(11,12,12,0.25), 0 10px 40px rgba(255,214,140,0.35)",
                background: "radial-gradient(closest-side, rgba(255,236,200,0.18), rgba(255,236,200,0))",
              }}
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 translate-y-[calc(6*var(--u))] whitespace-nowrap rounded-full bg-ink text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
              style={{ bottom: `calc(100% - ${u(8)})`, paddingInline: u(12), paddingBlock: u(6), fontSize: u(11.5) }}
            >
              <span className="font-semibold">{role.role}</span>
              <span className="text-white/70"> · {role.does}</span>
            </span>
          </Link>
        );
      })}
    </>
  );
}

function Rolling({ value }: { value: number }) {
  return (
    <span className="tabular inline-flex font-extrabold leading-none" aria-hidden="true">
      {String(value)
        .split("")
        .map((digit, i) => (
          <span key={i} className="relative inline-block overflow-hidden align-top" style={{ height: "1em", width: "0.62em" }}>
            <span
              className="absolute left-0 top-0 flex flex-col transition-transform duration-700 ease-out motion-reduce:transition-none"
              style={{ transform: `translateY(-${digit}em)` }}
            >
              {"0123456789".split("").map((d) => (
                <span key={d} className="block text-center" style={{ height: "1em", lineHeight: "1em", width: "0.62em" }}>
                  {d}
                </span>
              ))}
            </span>
          </span>
        ))}
    </span>
  );
}

export function StatusPill({ fluid = false }: { fluid?: boolean }) {
  const { stats } = useStore();
  const size = fluid
    ? { height: 40, paddingInline: 14, gap: 9, fontSize: 13.5, big: "18px", dot: "8px" }
    : {
        height: "max(36px, calc(40 * var(--u)))",
        paddingInline: "max(14px, calc(16 * var(--u)))",
        gap: "max(8px, calc(10 * var(--u)))",
        fontSize: "max(12.5px, calc(13.5 * var(--u)))",
        big: "max(16px, calc(18 * var(--u)))",
        dot: "max(7px, calc(8 * var(--u)))",
      };
  return (
    <div
      className="inline-flex max-w-full items-center rounded-full border border-outline bg-white/85 text-ink backdrop-blur"
      style={{ height: size.height, paddingInline: size.paddingInline, gap: size.gap, fontSize: size.fontSize }}
      role="status"
      aria-label={`${stats.minted} agents minted.${stats.newest ? ` Newest: ${padId(stats.newest.id)}` : ""}`}
    >
      <span className="relative inline-flex shrink-0" style={{ width: size.dot, height: size.dot }} aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-win opacity-60" />
        <span className="relative inline-block rounded-full bg-win-deep" style={{ width: size.dot, height: size.dot }} />
      </span>
      <span className="inline-flex shrink-0 items-baseline" style={{ gap: "0.4em" }}>
        <span style={{ fontSize: size.big }}>
          <Rolling value={stats.minted} />
        </span>
        <span className="font-medium">agents minted</span>
      </span>
      {stats.newest && (
        <Link
          href={agentHref(stats.newest.id)}
          className="hidden min-w-0 items-baseline truncate border-l border-outline/25 text-ink-2 transition-colors hover:text-ink sm:inline-flex"
          style={{ paddingLeft: size.gap, gap: "0.35em" }}
        >
          <span>newest</span>
          <span className="tabular font-semibold text-ink">{padId(stats.newest.id)}</span>
          <TimeAgo at={stats.newest.mintedAt} className="text-ink-3" />
        </Link>
      )}
    </div>
  );
}

function useLayer(sx: ReturnType<typeof useSpring>, sy: ReturnType<typeof useSpring>, depth: number) {
  const x = useTransform(sx, (v: number) => v * depth);
  const y = useTransform(sy, (v: number) => v * depth * 0.5);
  return { x, y };
}

export function HeroDesktop() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 16, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 50, damping: 16, mass: 0.6 });
  const back = useLayer(sx, sy, -5);
  const mid = useLayer(sx, sy, -11);
  const front = useLayer(sx, sy, -20);

  const onMove = (e: MouseEvent<HTMLElement>) => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const animated = !reduce;

  return (
    <section
      className="vt-scene relative hidden h-svh overflow-hidden bg-scene md:block"
      style={{ "--u": "min(max(calc(100svh / 940), calc(100vw / 2071)), calc(100svh / 752), calc(100vw / 1400))" } as CSSProperties}
      aria-label="The agents' office"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="absolute left-0" style={{ top: `min(0px, calc((100svh - 940 * var(--u)) * 0.3))`, width: u(OFFICE.w), height: u(OFFICE.h) }}>
        <motion.div className="absolute inset-0" style={back}>
          <OfficeBack animated={animated} />
          <WallScreen />
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-0 z-10" style={mid}>
          <OfficeMid animated={animated} />
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-0 z-[12]" style={front}>
          <OfficeFront />
        </motion.div>
        <motion.div className="pointer-events-none absolute inset-0 z-20" style={mid}>
          <Hotspots />
        </motion.div>
      </div>

      <SideNav />

      <div className="absolute z-30" style={{ left: u(208), top: u(52) }}>
        <h1 className="font-display font-extrabold text-ink" style={{ fontSize: u(60), lineHeight: u(62) }}>
          {HEADLINE.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="text-[#1d1d1c]" style={{ marginTop: u(15), fontSize: u(17), lineHeight: u(22), letterSpacing: "-0.005em" }}>
          {SUBLINE[0]}
          <br />
          {SUBLINE[1]}
        </p>
        <div className="flex items-center" style={{ marginTop: u(23), gap: u(18) }}>
          <Link
            href="/mint"
            className="group inline-flex items-center justify-center rounded-full bg-ink font-medium text-white outline-none transition-colors hover:bg-ink-2 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            style={{ height: u(43), paddingInline: u(23.5), gap: u(10), fontSize: u(14.5) }}
          >
            Mint an agent
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" style={{ width: u(15), height: u(15) }} />
          </Link>
          <Link
            href="/agents"
            className="inline-flex items-center justify-center rounded-full border border-outline bg-white/45 font-medium text-ink outline-none backdrop-blur-[2px] transition-colors hover:bg-white/80 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
            style={{ height: u(43), paddingInline: u(29.3), fontSize: u(14.5) }}
          >
            Browse agents
          </Link>
          <span className="flex items-center" style={{ gap: u(8) }}>
            <SocialButtons size={u(43)} />
          </span>
        </div>
      </div>

      <div className="absolute z-40" style={{ right: "max(16px, calc(22 * var(--u)))", bottom: "max(14px, calc(20 * var(--u)))" }}>
        <StatusPill />
      </div>
    </section>
  );
}

// Below 768px: hero copy over a cropped, static copy of the same scene.
export function HeroMobile() {
  return (
    <section className="relative overflow-hidden md:hidden" aria-label="Hero">
      <div className="absolute bottom-0 left-1/2 h-[400px] -translate-x-[41%]" style={{ aspectRatio: `${OFFICE.w} / ${OFFICE.h}` }} aria-hidden="true">
        <OfficeBack animated={false} p="ofm" />
        <OfficeMid animated={false} />
        <OfficeFront p="ofm" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper/85 to-paper/0" aria-hidden="true" />
      <div className="relative px-5 pb-[340px] pt-8">
        <h1 className="font-display text-[44px] font-extrabold leading-[1.02]">
          {HEADLINE.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-4 text-[16px] leading-snug text-ink-2">{SUBLINE.join(" ")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/mint" className="rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-white">
            Mint an agent
          </Link>
          <Link href="/agents" className="rounded-full border border-outline bg-white/60 px-6 py-3 text-[15px] font-medium">
            Browse agents
          </Link>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusPill fluid />
          <SocialButtons size="40px" />
        </div>
      </div>
    </section>
  );
}
