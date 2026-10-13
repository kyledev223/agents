"use client";

import { ViewTransition, useState } from "react";
import { RoleBust, RoleFigure } from "@/components/agents/robot";
import { Footer } from "@/components/chrome/chrome";
import { SideNav } from "@/components/chrome/nav";
import { ButtonLink } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";
import { Plant, Skyline } from "@/components/scene/parts";
import { useHash } from "@/lib/hooks";
import { ROLES, type Role } from "@/lib/roles";
import type { RoleKey } from "@/lib/types";

// Stage heights, so the line-up reads as a group photo rather than a row.
const HEIGHTS = [76, 88, 100, 97, 86, 74];

function Backdrop({ p }: { p: string }) {
  return (
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${p}-wall`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2b877" />
          <stop offset=".55" stopColor="#c9834f" />
          <stop offset="1" stopColor="#7a4a2c" />
        </linearGradient>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd9a0" />
          <stop offset="1" stopColor="#f6a070" />
        </linearGradient>
        <linearGradient id={`${p}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c98a58" />
          <stop offset="1" stopColor="#6e4226" />
        </linearGradient>
        <filter id={`${p}-blur`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <rect width="1600" height="900" fill={`url(#${p}-wall)`} />
      <g filter={`url(#${p}-blur)`}>
        <rect x="-20" y="40" width="560" height="560" fill={`url(#${p}-sky)`} />
        <Skyline x={-20} y={600} width={560} seed="ro-sky" color="#c9707a" opacity={0.6} maxH={200} />
        <path d="M170 40v560M360 40v560M540 40v560" stroke="#5e3a27" strokeWidth="16" />
        <path d="M-20 40h560M-20 300h560" stroke="#5e3a27" strokeWidth="12" />
        <rect x="700" y="60" width="240" height="14" rx="7" fill="#fff6e0" />
        <rect x="1040" y="100" width="260" height="14" rx="7" fill="#fff6e0" />
        <rect x="620" y="150" width="200" height="12" rx="6" fill="#fff6e0" opacity=".8" />
        <Plant x={640} y={470} scale={2.4} seed="ro-p1" leaves={11} tall />
        <Plant x={1180} y={440} scale={2.8} seed="ro-p2" leaves={12} tall pot="#2b2622" />
        <Plant x={1500} y={520} scale={2.4} seed="ro-p3" leaves={10} tall />
        <path d="M1240 200h380M1240 330h380" stroke="#5e3a27" strokeWidth="14" />
        <rect x="1000" y="470" width="640" height="160" fill="#8a5a3a" />
      </g>
      <rect y="620" width="1600" height="280" fill={`url(#${p}-floor)`} />
      <path d="M0 620h620l-260 280H0z" fill="#ffe6bd" opacity=".28" />
      <rect width="1600" height="900" fill="#2a1508" opacity=".2" />
    </svg>
  );
}

function Lineup({ selected, onPick, p }: { selected: RoleKey | null; onPick: (key: RoleKey) => void; p: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Backdrop p={p} />
      {/* Six equal slots; each figure is sized by height and centred in its slot, so they overlap like a group
          photo. Only the painted shapes take pointer events, so an overlapping neighbour never steals a click. */}
      <div className="absolute inset-x-[3%] bottom-[8%] top-[4%] flex md:bottom-[11%] md:left-[calc(170*var(--u))] md:right-[2%] md:top-[12%]">
        {ROLES.map((role, i) => {
          const on = selected === role.key;
          return (
            <button
              key={role.key}
              type="button"
              onClick={() => onPick(role.key)}
              aria-pressed={on}
              aria-label={`${role.name}, ${role.role}: ${role.summary}`}
              className="group relative h-full min-w-0 flex-1 outline-none"
              style={{ zIndex: HEIGHTS[i] }}
            >
              <span
                className={`pointer-events-none absolute bottom-0 left-1/2 block aspect-[144/212] -translate-x-1/2 transition-transform [&_svg_*]:pointer-events-auto duration-200 group-hover:-translate-y-2 group-focus-visible:-translate-y-2 ${on ? "-translate-y-2" : ""}`}
                style={{ height: `${HEIGHTS[i]}%`, filter: "drop-shadow(0 10px 14px rgba(40, 20, 6, 0.38))" }}
              >
                <RoleFigure role={role.key} className="h-full w-full" delay={i * 0.35} />
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute left-1/2 top-0 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-3 py-1.5 text-[12px] text-white shadow-lg transition-all duration-200 md:block ${
                    on ? "-translate-y-1/2 opacity-100" : "translate-y-0 opacity-0 group-hover:-translate-y-1/2 group-hover:opacity-100 group-focus-visible:-translate-y-1/2 group-focus-visible:opacity-100"
                  }`}
                >
                  <span className="font-semibold">{role.role}</span>
                  <span className="text-white/70"> · {role.does}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Info({ role, onClose, className = "" }: { role: Role; onClose?: () => void; className?: string }) {
  return (
    <div key={role.key} className={`animate-character-info rounded-2xl border border-rule bg-card ${className}`}>
      <div className="flex items-start gap-3 border-b border-rule px-5 pb-3.5 pt-4">
        <RoleBust role={role.key} className="h-14 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{role.role}</p>
          <h2 className="font-display mt-0.5 text-[22px] font-extrabold leading-tight">{role.name}</h2>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close" className="-mr-1.5 rounded-full p-2 text-[18px] hover:bg-paper-2">
            <CloseIcon />
          </button>
        )}
      </div>
      <div className="px-5 py-4">
        <p className="text-[15px] font-semibold leading-snug text-ink">{role.summary}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{role.detail}</p>
        <p className="mt-4 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">Tools</p>
        <ul className="mt-1.5 flex flex-wrap gap-1.5">
          {role.tools.map((tool) => (
            <li key={tool} className="font-digital rounded-full bg-paper-2 px-2.5 py-0.5 text-[13px] text-ink-2">
              {tool}
            </li>
          ))}
        </ul>
        <dl className="mt-4 border-t border-rule pt-3 text-[13.5px]">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-3">Runs</dt>
            <dd className="text-right font-semibold">{role.cadence}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default function RolesPage() {
  // undefined = nothing chosen yet, so a deep link like /roles#trader decides.
  const [picked, setPicked] = useState<RoleKey | null | undefined>(undefined);
  const hash = useHash();
  const fromHash = ROLES.find((r) => r.key === hash)?.key ?? null;
  const selected = picked === undefined ? fromHash : picked;
  const role = ROLES.find((r) => r.key === selected) ?? null;

  const setSelected = (key: RoleKey | null) => setPicked(key);
  const pick = (key: RoleKey) => setPicked(selected === key ? null : key);

  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
    <main>
      {/* desktop: full-bleed group shot */}
      <div className="vt-scene fixed inset-0 hidden overflow-hidden bg-scene md:block">
        <Lineup selected={selected} onPick={pick} p="rod" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[110] h-[42%] bg-gradient-to-t from-[#1a0d05]/85 via-[#1a0d05]/45 to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 left-0 z-[120] px-8 pb-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-warm">The agents</p>
          <h1 className="font-condensed mt-1 text-[64px] font-bold uppercase leading-[0.95] text-white">Meet the agents</h1>
          <p className="mt-2 max-w-[640px] text-[16px] leading-snug text-white/85">
            Every agent runs these six jobs behind one voice. Hover anyone, click for their full info.
          </p>
        </div>
        {role && (
          <div className="absolute right-6 top-[76px] z-[130] w-[360px] max-w-[calc(100vw-48px)]">
            <Info role={role} onClose={() => setSelected(null)} className="shadow-[0_18px_50px_rgba(40,20,6,0.35)]" />
          </div>
        )}
        <SideNav card />
      </div>

      {/* mobile: plain page */}
      <div className="px-4 pb-10 pt-6 md:hidden">
        <header className="mb-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">The agents</p>
          <h1 className="font-display mt-1 text-[40px] font-extrabold leading-[1.05]">Meet the agents</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-ink-2">Every agent runs these six jobs behind one voice. Tap anyone for their full info.</p>
        </header>
        <div className="relative aspect-[5/3] overflow-hidden rounded-3xl">
          <Lineup selected={selected} onPick={pick} p="rom" />
        </div>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {ROLES.map((r) => (
            <li key={r.key}>
              <button
                type="button"
                onClick={() => pick(r.key)}
                aria-pressed={selected === r.key}
                className={`w-full rounded-2xl border bg-card px-3 py-2.5 text-left transition-colors ${selected === r.key ? "border-ink" : "border-rule"}`}
              >
                <span className="block text-[15px] font-semibold">{r.name}</span>
                <span className="block text-[13px] text-ink-3">{r.role}</span>
              </button>
            </li>
          ))}
        </ul>
        {role && <Info role={role} className="mt-3" />}
        <div className="mt-6 flex flex-wrap gap-2">
          <ButtonLink href="/mint">Mint an agent</ButtonLink>
          <ButtonLink href="/docs#capabilities" variant="outline">
            See the toolset
          </ButtonLink>
        </div>
        <Footer />
      </div>
    </main>
    </ViewTransition>
  );
}
